/*
 * Revision Quiz
 * Choose who is playing, a level, a topic and a difficulty; answer 10
 * questions drawn at random from that topic's question file
 * (js/questions/<topic>.js). For each question: pick an option, press
 * Submit, then see the answer and an explanation. A score and a review
 * come at the end.
 * Each pupil (js/players.js) has his own best scores, and every answer he
 * submits is recorded through js/store.js for the Parent Report.
 * "Practise my mistakes" makes a quiz from the questions he got wrong.
 */
(function () {
  var QUIZ_LENGTH = 10;
  var MIX = { easy: 3, medium: 4, hard: 3 }; // what a Mixed quiz draws
  var SCORE_KEY = 'quiz-best';
  var VERSION = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '';

  var state = {
    player: null, level: 'all', topic: null, difficulty: 'mixed',
    practice: false, // true while playing "Practise my mistakes"
    questions: [], index: 0, score: 0, wrong: [], selected: null, answered: false
  };
  var $ = function (id) { return document.getElementById(id); };

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text !== undefined && text !== null) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }

  function topicById(id) {
    return window.QUIZ_TOPICS.filter(function (t) { return t.id === id; })[0];
  }

  /* ---------- saved best scores: one entry per pupil, topic and difficulty ---------- */
  // Each best score has its own storage key, so saving one never touches the others.
  function scoreKey(topic, difficulty) { return SCORE_KEY + '|' + state.player + '|' + topic + '|' + difficulty; }
  function readScore(topic, difficulty) {
    var v;
    try { v = Number(localStorage.getItem(scoreKey(topic, difficulty))); } catch (e) { return null; }
    try { if (localStorage.getItem(scoreKey(topic, difficulty)) === null) return null; } catch (e2) { return null; }
    return v >= 0 && v <= QUIZ_LENGTH && v === Math.floor(v) ? v : null; // ignore anything that is not a score from 0 to 10
  }
  function saveScore(topic, difficulty, score) {
    var old = readScore(topic, difficulty);
    if (old !== null && old >= score) return;
    try { localStorage.setItem(scoreKey(topic, difficulty), String(score)); } catch (e) { /* storage blocked: scores last for this visit only */ }
  }
  function bestFor(topic) {
    var best = null;
    // the highest score; on a tie, the harder difficulty
    ['easy', 'medium', 'mixed', 'hard'].forEach(function (d) {
      var v = readScore(topic, d);
      if (v !== null && (best === null || v >= best.score)) best = { score: v, difficulty: d };
    });
    return best;
  }
  function clearScores() {
    var mine = [], prefix = SCORE_KEY + '|' + state.player + '|';
    try {
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(prefix) === 0) mine.push(k); }
      mine.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) { /* nothing saved */ }
  }

  /* ---------- loading question files ---------- */
  function loadTopic(id, done) {
    if (window.QUESTIONS[id]) { done(); return; }
    var s = document.createElement('script');
    s.src = '../js/questions/' + id + '.js' + (VERSION ? '?v=' + VERSION : '');
    s.onload = done;
    s.onerror = function () { $('setup-message').textContent = 'Sorry, the questions for this topic could not be loaded.'; done(); };
    document.head.appendChild(s);
  }
  function loadTopics(ids, done) {
    var left = ids.length;
    if (!left) { done(); return; }
    ids.forEach(function (id) { loadTopic(id, function () { left -= 1; if (!left) done(); }); });
  }

  // n random questions, with at least minPics picture questions when the pool has them
  function pick(pool, n, minPics) {
    var pics = shuffle(pool.filter(function (q) { return q.pic; })).slice(0, minPics);
    var rest = shuffle(pool.filter(function (q) { return pics.indexOf(q) === -1; })).slice(0, n - pics.length);
    return shuffle(pics.concat(rest));
  }

  function draw(list, difficulty) {
    var by = { easy: [], medium: [], hard: [] };
    list.forEach(function (q) { by[q.level].push(q); });
    if (difficulty !== 'mixed') return pick(by[difficulty], QUIZ_LENGTH, 3);
    var picked = [];
    Object.keys(MIX).forEach(function (lv) { picked = picked.concat(pick(by[lv], MIX[lv], 1)); });
    return picked; // easy first, then medium, then hard
  }

  /* ---------- setup screen ---------- */
  function show(screen) {
    ['setup', 'play', 'results'].forEach(function (s) { $(s).hidden = s !== screen; });
    window.scrollTo(0, 0);
  }

  function renderPlayers() {
    var box = $('player-choices');
    box.innerHTML = '';
    window.PLAYERS.concat([{ id: 'guest', name: 'Guest' }]).forEach(function (p) {
      var b = el('button', p.name, 'choice');
      b.type = 'button';
      b.setAttribute('data-player', p.id);
      b.setAttribute('aria-pressed', String(p.id === state.player));
      b.addEventListener('click', function () {
        state.player = p.id;
        window.Store.setPlayer(p.id);
        renderPlayers();
        renderTopics();
        document.querySelector('#player-choices [data-player="' + p.id + '"]').focus();
      });
      box.appendChild(b);
    });
    var todo = state.player && state.player !== 'guest' ? window.Store.mistakes(state.player).length : 0;
    $('practise-box').hidden = todo === 0;
    $('practise-btn').textContent = 'Practise my mistakes (' + todo + (todo === 1 ? ' question)' : ' questions)');
    $('player-note').textContent = !state.player ? 'Choose your name so your answers are saved for you.'
      : state.player === 'guest' ? 'Guest answers are not saved.'
      : 'Hello, ' + window.Store.playerName(state.player) + '! Your answers are saved so you can see what to practise.';
  }

  function renderTopics() {
    var box = $('topic-choices');
    box.innerHTML = '';
    var list = window.QUIZ_TOPICS.filter(function (t) { return t.ready && (state.level === 'all' || String(t.level) === state.level); });
    $('no-topics').hidden = list.length > 0;
    list.forEach(function (t) {
      var b = el('button', null, 'choice topic-choice');
      b.type = 'button';
      b.setAttribute('data-topic', t.id);
      b.setAttribute('aria-pressed', String(t.id === state.topic));
      b.appendChild(el('span', 'P' + t.level, 'tag tag-level'));
      b.appendChild(el('span', t.name, 'topic-name'));
      var best = state.player ? bestFor(t.id) : null;
      b.appendChild(el('span', best === null ? 'Not tried yet' : 'Best: ' + best.score + ' / ' + QUIZ_LENGTH + ' (' + best.difficulty + ')', 'topic-best'));
      b.addEventListener('click', function () {
        state.topic = t.id;
        renderTopics();
        focusTopic();
      });
      box.appendChild(b);
    });
    if (state.topic && !list.some(function (t) { return t.id === state.topic; })) state.topic = null;
    $('start-btn').disabled = !state.topic || !state.player;
    $('setup-message').textContent = !state.player ? 'First choose who is playing.'
      : state.topic ? 'Topic: ' + topicById(state.topic).name + '. Press Start when you are ready.'
      : 'Choose a topic to begin.';
  }

  // after the topic list is rebuilt, put keyboard focus back on the chosen topic
  function focusTopic() {
    var b = state.topic && document.querySelector('#topic-choices [data-topic="' + state.topic + '"]');
    (b || document.querySelector('#player-choices button')).focus();
  }

  function pressGroup(id, attr, value) {
    document.querySelectorAll('#' + id + ' button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === value)); });
  }

  function backToSetup() {
    state.practice = false;
    renderPlayers();
    renderTopics();
    show('setup');
    focusTopic();
  }

  /* ---------- playing ---------- */
  function begin(questions, title) {
    state.questions = questions;
    state.index = 0;
    state.score = 0;
    state.wrong = [];
    $('play-topic').textContent = title;
    show('play');
    renderQuestion();
  }

  function start() {
    if (!state.topic || !state.player) return;
    state.practice = false;
    $('start-btn').disabled = true;
    loadTopic(state.topic, function () {
      if (!window.QUESTIONS[state.topic]) { $('start-btn').disabled = false; return; }
      begin(draw(window.QUESTIONS[state.topic], state.difficulty),
        topicById(state.topic).name + ' · ' + state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1));
    });
  }

  // a quiz made of the questions this pupil has got wrong, most often wrong first
  function startPractice() {
    var todo = window.Store.mistakes(state.player).slice(0, QUIZ_LENGTH);
    if (!todo.length) return;
    var topics = [];
    todo.forEach(function (m) { var t = window.Store.topicOf(m.q); if (topics.indexOf(t) === -1 && topicById(t)) topics.push(t); });
    loadTopics(topics, function () {
      var questions = [];
      todo.forEach(function (m) {
        var found = (window.QUESTIONS[window.Store.topicOf(m.q)] || []).filter(function (q) { return q.id === m.q; })[0];
        if (found) questions.push(found);
      });
      if (!questions.length) return;
      state.practice = true;
      begin(questions, 'Practise my mistakes');
    });
  }

  function renderQuestion() {
    var q = state.questions[state.index];
    state.answered = false;
    state.selected = null;
    $('progress').textContent = 'Question ' + (state.index + 1) + ' of ' + state.questions.length;
    $('progress-bar').style.width = (state.index / state.questions.length * 100) + '%';
    $('difficulty-tag').textContent = q.level.charAt(0).toUpperCase() + q.level.slice(1);
    $('question').textContent = q.q;
    $('question').setAttribute('data-id', q.id);
    var picBox = $('question-pic'), fig = window.Pictures.draw(q.pic);
    picBox.innerHTML = '';
    if (fig) picBox.appendChild(fig);
    var box = $('options');
    box.innerHTML = '';
    shuffle(q.options.map(function (text, i) { return { text: text, correct: i === q.answer }; })).forEach(function (o, i) {
      var b = el('button', null, 'choice quiz-option');
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.appendChild(el('span', 'ABCD'.charAt(i), 'option-letter'));
      b.appendChild(el('span', o.text, 'option-text'));
      b.addEventListener('click', function () { select(b, o); });
      box.appendChild(b);
    });
    $('feedback').textContent = '';
    $('feedback').className = 'feedback';
    $('why').hidden = true;
    $('next-btn').hidden = true;
    $('submit-btn').hidden = false;
    $('submit-btn').disabled = true;
    $('question').focus();
  }

  // choosing an option only selects it; nothing is marked until Submit is pressed
  function select(button, option) {
    if (state.answered) return;
    state.selected = { button: button, option: option };
    document.querySelectorAll('#options .quiz-option').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
    $('submit-btn').disabled = false;
  }

  function submit() {
    if (state.answered || !state.selected) return;
    var q = state.questions[state.index], chosen = state.selected.option, button = state.selected.button;
    state.answered = true;
    var correctText = q.options[q.answer];
    document.querySelectorAll('#options .quiz-option').forEach(function (b) {
      b.disabled = true;
      if (b.querySelector('.option-text').textContent === correctText) {
        b.classList.add('choice-right');
        b.appendChild(el('span', '✔ Correct answer', 'option-mark'));
      } else if (b === button) {
        b.classList.add('choice-wrong');
        b.appendChild(el('span', '✘ Your answer', 'option-mark'));
      }
    });
    var fb = $('feedback');
    if (chosen.correct) {
      state.score += 1;
      fb.textContent = 'Correct!';
      fb.className = 'feedback good';
    } else {
      state.wrong.push({ q: q, chosen: chosen.text });
      fb.textContent = 'Not quite.';
      fb.className = 'feedback bad';
    }
    window.Store.add(state.player, q, chosen.text, chosen.correct);
    $('why-text').textContent = q.why;
    $('why').hidden = false;
    var last = state.index === state.questions.length - 1;
    $('next-btn').textContent = last ? 'See my score' : 'Next question →';
    $('submit-btn').hidden = true;
    $('next-btn').hidden = false;
    // keep the question and picture where they are; only make sure the explanation can be seen
    $('next-btn').focus({ preventScroll: true });
    if ($('why').scrollIntoView) $('why').scrollIntoView({ block: 'nearest' });
  }

  function next() {
    if (!state.answered) return;
    if (state.index < state.questions.length - 1) {
      state.index += 1;
      renderQuestion();
    } else {
      finish();
    }
  }

  /* ---------- results ---------- */
  function finish() {
    var total = state.questions.length;
    if (!state.practice) saveScore(state.topic, state.difficulty, state.score);
    $('score').textContent = state.score + ' / ' + total;
    $('score-message').textContent = state.score === total ? 'Perfect score! Excellent work.'
      : state.score >= total * 0.8 ? 'Great work! Just a little more to learn.'
      : state.score >= total * 0.5 ? 'Good try. Read the explanations below and have another go.'
      : state.practice ? 'Keep going. Read the explanations below, then try these again.'
      : 'Keep going. Try the tool for this topic, then come back to the quiz.';
    var review = $('review');
    review.innerHTML = '';
    $('review-heading').hidden = state.wrong.length === 0;
    state.wrong.forEach(function (w) {
      var item = el('div', null, 'review-item');
      item.appendChild(el('p', w.q.q, 'review-question'));
      var fig = window.Pictures.draw(w.q.pic);
      if (fig) item.appendChild(fig);
      item.appendChild(el('p', '✘ Your answer: ' + w.chosen, 'review-wrong'));
      item.appendChild(el('p', '✔ Correct answer: ' + w.q.options[w.q.answer], 'review-right'));
      item.appendChild(el('p', w.q.why, 'review-why'));
      review.appendChild(item);
    });
    $('tool-link').hidden = state.practice;
    if (!state.practice) {
      $('tool-link').href = '../tools/' + state.topic + '/index.html';
      $('tool-link').textContent = 'Open the ' + topicById(state.topic).name + ' tool';
    }
    show('results');
    $('score').focus();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var params = {};
    location.search.replace(/[?&]([a-z]+)=([^&]*)/gi, function (m, k, v) { params[k.toLowerCase()] = decodeURIComponent(v).toLowerCase(); });

    // who is playing: a link from the Parent Report can name the pupil, otherwise the last one on this device
    var asked = params.player;
    if (asked && (asked === 'guest' || window.PLAYERS.some(function (p) { return p.id === asked; }))) window.Store.setPlayer(asked);
    state.player = window.Store.player();

    // a link such as quiz/index.html?topic=magnets preselects that topic
    var t = params.topic && topicById(params.topic);
    if (t && t.ready) {
      state.topic = t.id;
      state.level = String(t.level);
    }
    pressGroup('level-filter', 'data-level', state.level);
    renderPlayers();
    renderTopics();
    if (params.topic && !(t && t.ready)) $('setup-message').textContent = 'Sorry, there is no quiz topic called "' + params.topic.slice(0, 30) + '". Please choose a topic from the list.';
    if (!window.Store.canSave()) $('save-note').textContent = 'This browser is not letting the quiz save anything, so scores and answers will be lost when you close the page.';

    document.querySelectorAll('#level-filter button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.level = b.getAttribute('data-level');
        pressGroup('level-filter', 'data-level', state.level);
        renderTopics();
      });
    });
    document.querySelectorAll('#difficulty-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.difficulty = b.getAttribute('data-difficulty');
        pressGroup('difficulty-choices', 'data-difficulty', state.difficulty);
      });
    });
    $('start-btn').addEventListener('click', start);
    $('practise-btn').addEventListener('click', startPractice);
    $('submit-btn').addEventListener('click', submit);
    $('next-btn').addEventListener('click', next);
    $('again-btn').addEventListener('click', function () {
      if (!state.practice) { start(); return; }
      if (window.Store.mistakes(state.player).length) startPractice(); else backToSetup();
    });
    $('change-btn').addEventListener('click', backToSetup);
    $('quit-btn').addEventListener('click', function () {
      if (!window.confirm('Stop this quiz? The answers you have already submitted stay in your record, but you will not get a score.')) return;
      backToSetup();
    });
    // warn before a reload or the Back button throws away a quiz in progress
    window.addEventListener('beforeunload', function (e) {
      if (!$('play').hidden) { e.preventDefault(); e.returnValue = ''; }
    });
    $('clear-scores').addEventListener('click', function () {
      if (!state.player) return;
      if (!window.confirm('Clear the best scores for ' + window.Store.playerName(state.player) + ' on this device?')) return;
      clearScores();
      renderTopics();
      $('setup-message').textContent = 'The best scores for ' + window.Store.playerName(state.player) + ' have been cleared.';
    });

    if (params.practise && state.player && state.player !== 'guest') startPractice();
  });
})();
