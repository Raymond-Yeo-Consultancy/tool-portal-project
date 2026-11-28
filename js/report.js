/*
 * Parent Report (quiz/report.html)
 * Reads each pupil's answer records from js/store.js and shows, for one
 * pupil or both side by side: totals, topics from weakest to strongest,
 * results by level and by difficulty, and every question answered wrongly
 * with the correct answer and explanation. Can be printed or downloaded
 * as a CSV file (a plain spreadsheet file).
 */
(function () {
  var VERSION = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '';
  var MIN_ANSWERS = 5; // fewer answers than this in a topic is too few to judge
  var state = { who: null, days: 0, level: 'all', topic: 'all' };
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text !== undefined && text !== null) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }
  function topicById(id) { return window.QUIZ_TOPICS.filter(function (t) { return t.id === id; })[0]; }
  function questionById(id) {
    return (window.QUESTIONS[window.Store.topicOf(id)] || []).filter(function (q) { return q.id === id; })[0];
  }
  function dateText(ms) {
    var d = new Date(ms), months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }
  function percent(right, total) { return total ? Math.round(right / total * 100) : 0; }

  function loadAll(done) {
    var topics = window.QUIZ_TOPICS, left = topics.length;
    topics.forEach(function (t) {
      var s = document.createElement('script');
      s.src = '../js/questions/' + t.id + '.js' + (VERSION ? '?v=' + VERSION : '');
      s.onload = s.onerror = function () { left -= 1; if (!left) done(); };
      document.head.appendChild(s);
    });
  }

  // this pupil's records inside the chosen dates, for topics that still exist
  function recordsFor(playerId) {
    var since = state.days ? Date.now() - state.days * 24 * 60 * 60 * 1000 : 0;
    return window.Store.records(playerId).filter(function (r) { return r.t >= since && topicById(window.Store.topicOf(r.q)); });
  }

  function tally(records, keyOf) {
    var out = {};
    records.forEach(function (r) {
      var k = keyOf(r), row = out[k] || (out[k] = { key: k, total: 0, right: 0 });
      row.total += 1;
      if (r.ok) row.right += 1;
    });
    return out;
  }

  function bar(pct) {
    var outer = el('span', null, 'score-bar'), inner = el('span');
    inner.style.width = pct + '%';
    inner.className = pct < 50 ? 'low' : pct < 75 ? 'mid' : 'high';
    outer.appendChild(inner);
    outer.setAttribute('aria-hidden', 'true');
    return outer;
  }

  function table(headings, rows) {
    var wrap = el('div', null, 'table-wrap'), t = el('table', null, 'report-table'), head = el('tr');
    headings.forEach(function (h) { var th = el('th', h); th.scope = 'col'; head.appendChild(th); });
    var thead = el('thead'); thead.appendChild(head); t.appendChild(thead);
    var body = el('tbody');
    rows.forEach(function (cells) {
      var tr = el('tr');
      cells.forEach(function (c, i) {
        var cell = el(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row';
        if (c && c.nodeType) cell.appendChild(c); else cell.textContent = c;
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
    t.appendChild(body); wrap.appendChild(t);
    return wrap;
  }

  function scoreCell(row) {
    var box = el('span', null, 'score-cell');
    if (!row) { box.textContent = 'Not tried'; box.className = 'score-cell none'; return box; }
    var pct = percent(row.right, row.total);
    box.appendChild(el('strong', pct + '%'));
    box.appendChild(bar(pct));
    return box;
  }

  /* ---------- one pupil ---------- */
  function renderPlayer(player, root) {
    var recs = recordsFor(player.id);
    var section = el('section', null, 'card report-player');
    section.setAttribute('data-player', player.id);
    section.appendChild(el('h2', player.name));
    root.appendChild(section);
    if (!recs.length) {
      section.appendChild(el('p', player.name + ' has not answered any quiz questions ' + (state.days ? 'in this period' : 'on this device yet') + '.', 'report-empty'));
      return;
    }
    var right = recs.filter(function (r) { return r.ok; }).length;
    var days = {}; recs.forEach(function (r) { days[dateText(r.t)] = true; });
    var stats = el('div', null, 'stat-row report-stats');
    [['Questions answered', recs.length], ['Correct', right + ' (' + percent(right, recs.length) + '%)'], ['Wrong', recs.length - right],
      ['Days played', Object.keys(days).length], ['Last played', dateText(recs[recs.length - 1].t)]].forEach(function (s) {
      var box = el('div', null, 'report-stat');
      box.appendChild(el('span', s[0], 'report-stat-label'));
      box.appendChild(el('strong', String(s[1])));
      stats.appendChild(box);
    });
    section.appendChild(stats);

    // topics, weakest first
    var byTopic = tally(recs, function (r) { return window.Store.topicOf(r.q); });
    var rows = Object.keys(byTopic).map(function (k) { return byTopic[k]; });
    var enough = rows.filter(function (r) { return r.total >= MIN_ANSWERS; }).sort(function (a, b) { return a.right / a.total - b.right / b.total || b.total - a.total; });
    var few = rows.filter(function (r) { return r.total < MIN_ANSWERS; }).sort(function (a, b) { return b.total - a.total; });
    section.appendChild(el('h3', 'Topics, weakest first'));
    if (enough.length) {
      var weak = enough.filter(function (r) { return r.right / r.total < 0.6; }).slice(0, 3).map(function (r) { return topicById(r.key).name; });
      section.appendChild(el('p', weak.length ? 'Needs the most practice: ' + weak.join(', ') + '.' : 'No topic is below 60% so far. Well done!', 'report-headline'));
    }
    section.appendChild(table(['Topic', 'Answered', 'Correct', 'Score'], enough.concat(few).map(function (r) {
      var t = topicById(r.key);
      var score = r.total >= MIN_ANSWERS ? scoreCell(r) : el('span', 'Not enough answers yet', 'score-cell none');
      return ['P' + t.level + ' · ' + t.name, r.total, r.right, score];
    })));

    var byLevel = tally(recs, function (r) { return 'P' + topicById(window.Store.topicOf(r.q)).level; });
    section.appendChild(el('h3', 'By level'));
    section.appendChild(table(['Level', 'Answered', 'Correct', 'Score'], ['P3', 'P4', 'P5', 'P6'].filter(function (k) { return byLevel[k]; }).map(function (k) {
      return [k === 'P3' ? 'Primary 3' : k === 'P4' ? 'Primary 4' : k === 'P5' ? 'Primary 5' : 'Primary 6', byLevel[k].total, byLevel[k].right, scoreCell(byLevel[k])];
    })));

    var byDiff = tally(recs, function (r) { return r.lv; });
    section.appendChild(el('h3', 'By difficulty of question'));
    section.appendChild(table(['Difficulty', 'Answered', 'Correct', 'Score'], ['easy', 'medium', 'hard'].filter(function (k) { return byDiff[k]; }).map(function (k) {
      return [k.charAt(0).toUpperCase() + k.slice(1), byDiff[k].total, byDiff[k].right, scoreCell(byDiff[k])];
    })));

    renderWrong(player, recs, section);

    var actions = el('div', null, 'actions no-print');
    var todo = window.Store.mistakes(player.id).length;
    if (todo) {
      var link = el('a', 'Practise ' + player.name + '’s mistakes (' + todo + ')', 'btn');
      link.href = 'index.html?player=' + player.id + '&practise=1';
      actions.appendChild(link);
    }
    var clear = el('button', 'Clear ' + player.name + '’s record', 'btn btn-secondary');
    clear.type = 'button';
    clear.addEventListener('click', function () {
      if (!window.confirm('Delete every saved answer for ' + player.name + ' on this device? This cannot be undone.')) return;
      window.Store.clear(player.id);
      render();
    });
    actions.appendChild(clear);
    section.appendChild(actions);
  }

  // every question answered wrongly, grouped by topic, most often wrong first
  function renderWrong(player, recs, section) {
    var byQ = {};
    recs.forEach(function (r) {
      var m = byQ[r.q] || (byQ[r.q] = { q: r.q, wrong: 0, tries: 0, last: null, rightSince: false });
      m.tries += 1;
      if (r.ok) { if (m.wrong) m.rightSince = true; } else { m.wrong += 1; m.last = r; m.rightSince = false; }
    });
    var wrong = Object.keys(byQ).map(function (k) { return byQ[k]; }).filter(function (m) { return m.wrong > 0 && questionById(m.q); });
    section.appendChild(el('h3', 'Questions answered wrongly (' + wrong.length + ')'));
    if (!wrong.length) { section.appendChild(el('p', 'None in this period.', 'report-empty')); return; }

    var topics = [];
    wrong.forEach(function (m) { var t = window.Store.topicOf(m.q); if (topics.indexOf(t) === -1) topics.push(t); });
    topics.sort(function (a, b) { return topicById(a).level - topicById(b).level || topicById(a).name.localeCompare(topicById(b).name); });

    var pickRow = el('div', null, 'report-pick no-print'), label = el('label', 'Show topic: '), select = el('select');
    select.id = 'topic-pick-' + player.id; label.setAttribute('for', select.id);
    var all = el('option', 'All topics'); all.value = 'all'; select.appendChild(all);
    topics.forEach(function (t) { var o = el('option', 'P' + topicById(t).level + ' · ' + topicById(t).name); o.value = t; select.appendChild(o); });
    pickRow.appendChild(label); pickRow.appendChild(select); section.appendChild(pickRow);

    var list = el('div', null, 'report-wrong'); section.appendChild(list);
    function draw() {
      list.innerHTML = '';
      topics.filter(function (t) { return select.value === 'all' || select.value === t; }).forEach(function (t) {
        var mine = wrong.filter(function (m) { return window.Store.topicOf(m.q) === t; }).sort(function (a, b) { return b.wrong - a.wrong || b.last.t - a.last.t; });
        list.appendChild(el('h4', 'P' + topicById(t).level + ' · ' + topicById(t).name + ' (' + mine.length + ')'));
        mine.forEach(function (m) {
          var q = questionById(m.q), item = el('div', null, 'review-item');
          item.appendChild(el('p', q.q, 'review-question'));
          var fig = window.Pictures.draw(q.pic);
          if (fig) item.appendChild(fig);
          item.appendChild(el('p', '✘ ' + player.name + ' answered: ' + m.last.c, 'review-wrong'));
          item.appendChild(el('p', '✔ Correct answer: ' + q.options[q.answer], 'review-right'));
          item.appendChild(el('p', 'Why: ' + q.why, 'review-why'));
          item.appendChild(el('p', (q.level.charAt(0).toUpperCase() + q.level.slice(1)) + ' question · wrong ' + m.wrong + (m.wrong === 1 ? ' time' : ' times') + ' out of ' + m.tries +
            (m.tries === 1 ? ' try' : ' tries') + ' · last wrong on ' + dateText(m.last.t) + (m.rightSince ? ' · answered correctly since then' : '') + ' · ' + q.id, 'sheet-id'));
          list.appendChild(item);
        });
      });
    }
    select.addEventListener('change', draw);
    draw();
  }

  /* ---------- both pupils side by side ---------- */
  function renderBoth(root) {
    var section = el('section', null, 'card report-compare');
    section.appendChild(el('h2', 'Side by side'));
    var tallies = window.PLAYERS.map(function (p) { return tally(recordsFor(p.id), function (r) { return window.Store.topicOf(r.q); }); });
    var rows = window.QUIZ_TOPICS.filter(function (t) { return tallies.some(function (x) { return x[t.id]; }); }).map(function (t) {
      return ['P' + t.level + ' · ' + t.name].concat(tallies.map(function (x) {
        var r = x[t.id];
        if (!r) return scoreCell(null);
        if (r.total < MIN_ANSWERS) return el('span', r.right + ' of ' + r.total + ' (too few yet)', 'score-cell none');
        return scoreCell(r);
      }));
    });
    if (!rows.length) section.appendChild(el('p', 'Nobody has answered any quiz questions ' + (state.days ? 'in this period' : 'on this device yet') + '.', 'report-empty'));
    else section.appendChild(table(['Topic'].concat(window.PLAYERS.map(function (p) { return p.name; })), rows));
    root.appendChild(section);
    window.PLAYERS.forEach(function (p) { renderPlayer(p, root); });
  }

  function render() {
    var root = $('report');
    root.innerHTML = '';
    if (state.who === 'both') renderBoth(root);
    else renderPlayer(window.PLAYERS.filter(function (p) { return p.id === state.who; })[0], root);
  }

  /* ---------- download as a CSV file ---------- */
  function csv() {
    var cell = function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; };
    var lines = [['Pupil', 'Date', 'Time', 'Level', 'Topic', 'Difficulty', 'Question code', 'Question', 'Answer chosen', 'Correct answer', 'Result'].map(cell).join(',')];
    var who = state.who === 'both' ? window.PLAYERS : window.PLAYERS.filter(function (p) { return p.id === state.who; });
    who.forEach(function (p) {
      recordsFor(p.id).forEach(function (r) {
        var q = questionById(r.q), t = topicById(window.Store.topicOf(r.q)), d = new Date(r.t);
        var time = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
        lines.push([p.name, dateText(r.t), time, 'P' + t.level, t.name, r.lv, r.q, q ? q.q : '', r.c, q ? q.options[q.answer] : '', r.ok ? 'Correct' : 'Wrong'].map(cell).join(','));
      });
    });
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'science-quiz-report.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var who = $('who');
    window.PLAYERS.concat([{ id: 'both', name: 'Both' }]).forEach(function (p) {
      var b = el('button', p.name); b.type = 'button'; b.setAttribute('data-who', p.id);
      b.addEventListener('click', function () { state.who = p.id; press(); render(); });
      who.appendChild(b);
    });
    function press() {
      document.querySelectorAll('#who button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-who') === state.who)); });
      document.querySelectorAll('#when button').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-days')) === state.days)); });
    }
    var asked = (location.search.match(/[?&]who=([a-z]+)/i) || [])[1];
    state.who = asked && (asked === 'both' || window.PLAYERS.some(function (p) { return p.id === asked; })) ? asked : 'both';
    document.querySelectorAll('#when button').forEach(function (b) {
      b.addEventListener('click', function () { state.days = Number(b.getAttribute('data-days')); press(); render(); });
    });
    $('print-btn').addEventListener('click', function () { window.print(); });
    $('csv-btn').addEventListener('click', csv);
    if (!window.Store.canSave()) $('device-note').textContent = 'This browser is not letting the quiz save anything, so there are no saved answers to show.';
    press();
    loadAll(function () { $('loading').hidden = true; render(); window.reportReady = true; });
  });
})();
