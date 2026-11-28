/*
 * Revision Quiz
 * Pick a level, a topic and a difficulty; answer 10 questions drawn at random
 * from that topic's question file (js/questions/<topic>.js); see the answer
 * and an explanation after each one; get a score and a review at the end.
 * The best score for each topic is kept in localStorage (this device only).
 */
(function () {
  var QUIZ_LENGTH = 10;
  var MIX = { easy: 3, medium: 4, hard: 3 }; // what a Mixed quiz draws
  var SCORE_KEY = 'quiz-scores';
  var VERSION = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '';

  var state = {
    level: 'all', topic: null, difficulty: 'mixed',
    questions: [], index: 0, score: 0, wrong: [], answered: false
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

  /* ---------- saved scores ---------- */
  function scores() {
    var raw, out = {};
    try { raw = JSON.parse(localStorage.getItem(SCORE_KEY)); } catch (e) { raw = null; }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    // keep only whole-number scores from 0 to 10
    Object.keys(raw).forEach(function (k) {
      var v = raw[k];
      if (typeof v === 'number' && v >= 0 && v <= QUIZ_LENGTH && v === Math.floor(v)) out[k] = v;
    });
    return out;
  }
  function saveScore(topic, difficulty, score) {
    var all = scores(), key = topic + '|' + difficulty;
    if (!(all[key] >= score)) all[key] = score;
    try { localStorage.setItem(SCORE_KEY, JSON.stringify(all)); } catch (e) { /* storage blocked: scores last for this visit only */ }
  }
  function bestFor(topic) {
    var all = scores(), best = null;
    // the highest score; on a tie, the harder difficulty
    ['easy', 'medium', 'mixed', 'hard'].forEach(function (d) {
      var v = all[topic + '|' + d];
      if (v !== undefined && (best === null || v >= best.score)) best = { score: v, difficulty: d };
    });
    return best;
  }

  /* ---------- loading a topic's questions ---------- */
  function loadTopic(id, done) {
    if (window.QUESTIONS[id]) { done(); return; }
    var s = document.createElement('script');
    s.src = '../js/questions/' + id + '.js' + (VERSION ? '?v=' + VERSION : '');
    s.onload = done;
    s.onerror = function () { $('setup-message').textContent = 'Sorry, the questions for this topic could not be loaded.'; };
    document.head.appendChild(s);
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
      var best = bestFor(t.id);
      b.appendChild(el('span', best === null ? 'Not tried yet' : 'Best: ' + best.score + ' / ' + QUIZ_LENGTH + ' (' + best.difficulty + ')', 'topic-best'));
      b.addEventListener('click', function () {
        state.topic = t.id;
        renderTopics();
        focusTopic();
      });
      box.appendChild(b);
    });
    if (state.topic && !list.some(function (t) { return t.id === state.topic; })) state.topic = null;
    $('start-btn').disabled = !state.topic;
    $('setup-message').textContent = state.topic ? 'Topic: ' + topicById(state.topic).name + '. Press Start when you are ready.' : 'Choose a topic to begin.';
  }

  // after the topic list is rebuilt, put keyboard focus back on the chosen topic
  function focusTopic() {
    var b = state.topic && document.querySelector('#topic-choices [data-topic="' + state.topic + '"]');
    (b || $('start-btn')).focus();
  }

  function pressGroup(id, attr, value) {
    document.querySelectorAll('#' + id + ' button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === value)); });
  }

  /* ---------- playing ---------- */
  function start() {
    if (!state.topic) return;
    $('start-btn').disabled = true;
    loadTopic(state.topic, function () {
      state.questions = draw(window.QUESTIONS[state.topic], state.difficulty);
      state.index = 0;
      state.score = 0;
      state.wrong = [];
      $('play-topic').textContent = topicById(state.topic).name + ' · ' + state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
      show('play');
      renderQuestion();
    });
  }

  function renderQuestion() {
    var q = state.questions[state.index];
    state.answered = false;
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
      b.setAttribute('data-correct', String(o.correct));
      b.appendChild(el('span', 'ABCD'.charAt(i), 'option-letter'));
      b.appendChild(el('span', o.text, 'option-text'));
      b.addEventListener('click', function () { answer(b, o, q); });
      box.appendChild(b);
    });
    $('feedback').textContent = '';
    $('feedback').className = 'feedback';
    $('why').hidden = true;
    $('next-btn').hidden = true;
    $('question').focus();
  }

  function answer(button, option, q) {
    if (state.answered) return;
    state.answered = true;
    document.querySelectorAll('#options .quiz-option').forEach(function (b) {
      b.disabled = true;
      if (b.getAttribute('data-correct') === 'true') {
        b.classList.add('choice-right');
        b.appendChild(el('span', '✔ Correct answer', 'option-mark'));
      } else if (b === button) {
        b.classList.add('choice-wrong');
        b.appendChild(el('span', '✘ Your answer', 'option-mark'));
      }
    });
    var fb = $('feedback');
    if (option.correct) {
      state.score += 1;
      fb.textContent = 'Correct!';
      fb.className = 'feedback good';
    } else {
      state.wrong.push({ q: q, chosen: option.text });
      fb.textContent = 'Not quite.';
      fb.className = 'feedback bad';
    }
    $('why-text').textContent = q.why;
    $('why').hidden = false;
    var last = state.index === state.questions.length - 1;
    $('next-btn').textContent = last ? 'See my score' : 'Next question →';
    $('next-btn').hidden = false;
    $('next-btn').focus();
  }

  function next() {
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
    saveScore(state.topic, state.difficulty, state.score);
    $('score').textContent = state.score + ' / ' + total;
    $('score-message').textContent = state.score === total ? 'Perfect score! Excellent work.'
      : state.score >= total * 0.8 ? 'Great work! Just a little more to learn.'
      : state.score >= total * 0.5 ? 'Good try. Read the explanations below and have another go.'
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
    $('tool-link').href = '../tools/' + state.topic + '/index.html';
    $('tool-link').textContent = 'Open the ' + topicById(state.topic).name + ' tool';
    show('results');
    $('score').focus();
  }

  document.addEventListener('DOMContentLoaded', function () {
    // a link such as quiz/index.html?topic=magnets preselects that topic
    var wanted = (location.search.match(/[?&]topic=([a-z]+)/) || [])[1];
    var t = wanted && topicById(wanted);
    if (t && t.ready) {
      state.topic = t.id;
      state.level = String(t.level);
    }
    pressGroup('level-filter', 'data-level', state.level);
    renderTopics();

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
    $('next-btn').addEventListener('click', next);
    $('again-btn').addEventListener('click', start);
    $('change-btn').addEventListener('click', function () { renderTopics(); show('setup'); focusTopic(); });
    $('quit-btn').addEventListener('click', function () {
      if (!window.confirm('Stop this quiz? Your answers so far will not be saved.')) return;
      renderTopics(); show('setup'); focusTopic();
    });
    // warn before a reload or the Back button throws away a quiz in progress
    window.addEventListener('beforeunload', function (e) {
      if (!$('play').hidden) { e.preventDefault(); e.returnValue = ''; }
    });
    $('clear-scores').addEventListener('click', function () {
      if (!window.confirm('Clear all your best scores on this device?')) return;
      try { localStorage.removeItem(SCORE_KEY); } catch (e) { /* nothing saved */ }
      renderTopics();
      $('setup-message').textContent = 'Your best scores have been cleared.';
    });
  });
})();
