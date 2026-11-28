/*
 * Store: who is playing, and the record of every answer each pupil has given.
 * Everything is kept in this browser (localStorage), so each device has its
 * own record. Each answer is saved as its own entry, so nothing can be overwritten. The quiz and the Parent Report only talk to this file, so the
 * records can later be moved to a home server without changing them.
 *
 * One answer record: { p: pupil id, t: time (ms), q: question id,
 *   lv: easy | medium | hard, c: the option chosen, ok: true | false }
 * The topic is the first part of the question id (e.g. "magnets-e03").
 */
(function () {
  // Every answer is saved under its own key ("quiz-answer|pupil|time|number"), never as one big list.
  // Saving an answer therefore only ever adds an entry: it cannot overwrite answers saved earlier,
  // even if two pages are open at once or a page was showing an out-of-date copy.
  var ANSWER = 'quiz-answer|', BEST = 'quiz-best|', PLAYER_KEY = 'quiz-player', MAX_RECORDS = 5000;
  var memory = { extra: [], player: null, counter: 0 }; // extra: answers kept only in memory when storage is blocked

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function isPupil(id) {
    return (window.PLAYERS || []).some(function (p) { return p.id === id; });
  }
  function valid(r) {
    return r && typeof r.p === 'string' && typeof r.q === 'string' && typeof r.t === 'number' && typeof r.ok === 'boolean';
  }
  // the storage keys that hold answers (for one pupil, or for everyone)
  function keys(playerId) {
    var out = [], prefix = ANSWER + (playerId ? playerId + '|' : '');
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) out.push(k);
      }
    } catch (e) { /* storage blocked */ }
    return out;
  }
  // A browser can only hold so much. When one pupil has more than MAX_RECORDS answers, his own
  // oldest ones are dropped. Another pupil's answers are never touched.
  function trim(playerId) {
    var mine = keys(playerId);
    if (mine.length <= MAX_RECORDS) return;
    mine.sort(function (a, b) { return Number(a.split('|')[2]) - Number(b.split('|')[2]); });
    mine.slice(0, mine.length - MAX_RECORDS).forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
  }

  window.Store = {
    // can this browser save anything? (false in some private windows)
    canSave: function () {
      try { localStorage.setItem('quiz-test', '1'); localStorage.removeItem('quiz-test'); return true; } catch (e) { return false; }
    },
    // the pupil chosen on this device: a pupil id, 'guest', or null if nobody has been chosen yet
    player: function () {
      var id = memory.player || read(PLAYER_KEY);
      return id === 'guest' || isPupil(id) ? id : null;
    },
    setPlayer: function (id) { memory.player = id; write(PLAYER_KEY, id); },
    playerName: function (id) {
      var found = (window.PLAYERS || []).filter(function (p) { return p.id === id; })[0];
      return found ? found.name : 'Guest';
    },
    // record one answer (guests are not recorded)
    add: function (playerId, question, chosen, ok) {
      if (!isPupil(playerId)) return;
      var r = { p: playerId, t: Date.now(), q: question.id, lv: question.level, c: String(chosen), ok: !!ok };
      memory.counter += 1;
      var key = ANSWER + playerId + '|' + r.t + '|' + memory.counter + Math.floor(Math.random() * 1e6);
      if (!write(key, JSON.stringify(r))) memory.extra.push(r);
      else if (memory.counter % 50 === 0) trim(playerId);
    },
    // every record for one pupil, oldest first
    records: function (playerId) {
      var out = memory.extra.filter(function (r) { return r.p === playerId; });
      keys(playerId).forEach(function (k) {
        var r;
        try { r = JSON.parse(read(k)); } catch (e) { r = null; }
        if (valid(r) && r.p === playerId) out.push(r);
      });
      return out.sort(function (a, b) { return a.t - b.t; });
    },
    clear: function (playerId) {
      memory.extra = memory.extra.filter(function (r) { return r.p !== playerId; });
      keys(playerId).forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
      // his best scores go too, so the quiz and the report agree
      try {
        var best = [];
        for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(BEST + playerId + '|') === 0) best.push(k); }
        best.forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) { /* ignore */ }
    },
    // the most answers kept for one pupil; older ones are dropped after this
    limit: MAX_RECORDS,
    topicOf: function (questionId) { return questionId.split('-')[0]; },
    // questions this pupil still needs to practise: got wrong at least once and not yet
    // answered correctly twice in a row since. Most often wrong first.
    mistakes: function (playerId) {
      var byQ = {};
      this.records(playerId).forEach(function (r) {
        var m = byQ[r.q] || (byQ[r.q] = { q: r.q, wrong: 0, streak: 0, last: null, lastWrong: null });
        if (r.ok) m.streak += 1; else { m.wrong += 1; m.streak = 0; m.lastWrong = r; }
        m.last = r;
      });
      return Object.keys(byQ).map(function (k) { return byQ[k]; })
        .filter(function (m) { return m.wrong > 0 && m.streak < 2; })
        .sort(function (a, b) { return b.wrong - a.wrong || b.lastWrong.t - a.lastWrong.t; });
    }
  };
})();
