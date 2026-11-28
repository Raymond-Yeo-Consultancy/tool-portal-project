/*
 * Teacher's answer sheet (quiz/answers.html)
 * Loads every ready topic's question file, runs the structure checks from
 * js/questions/index.js, and lists every question with its correct answer
 * and explanation. The page has print styles, so it can be printed or saved
 * as a PDF.
 */
(function () {
  var VERSION = (document.currentScript && document.currentScript.src.split('?v=')[1]) || '';
  var $ = function (id) { return document.getElementById(id); };

  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text !== undefined && text !== null) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }

  function loadAll(topics, done) {
    var left = topics.length;
    if (!left) { done(); return; }
    topics.forEach(function (t) {
      var s = document.createElement('script');
      s.src = '../js/questions/' + t.id + '.js' + (VERSION ? '?v=' + VERSION : '');
      s.onload = s.onerror = function () { left -= 1; if (!left) done(); };
      document.head.appendChild(s);
    });
  }

  function render(topics) {
    var total = 0, problems = [];
    var sheet = $('sheet');
    [3, 4, 5, 6].forEach(function (level) {
      var mine = topics.filter(function (t) { return t.level === level; });
      if (!mine.length) return;
      sheet.appendChild(el('h2', 'Primary ' + level, 'sheet-level'));
      mine.forEach(function (t) {
        var list = window.QUESTIONS[t.id] || [];
        total += list.length;
        problems = problems.concat(window.checkQuestions(t.id, list));
        var section = el('section', null, 'sheet-topic');
        section.appendChild(el('h3', t.name + ' (' + list.length + ' questions)'));
        ['easy', 'medium', 'hard'].forEach(function (lv) {
          var qs = list.filter(function (q) { return q.level === lv; });
          if (!qs.length) return;
          section.appendChild(el('h4', lv.charAt(0).toUpperCase() + lv.slice(1) + ' (' + qs.length + ')'));
          var ol = el('ol', null, 'sheet-questions');
          qs.forEach(function (q) {
            var li = el('li');
            li.appendChild(el('p', q.q, 'sheet-q'));
            var opts = el('ul', null, 'sheet-options');
            q.options.forEach(function (o, i) {
              opts.appendChild(el('li', (i === q.answer ? '✔ ' : '') + o, i === q.answer ? 'sheet-correct' : ''));
            });
            li.appendChild(opts);
            li.appendChild(el('p', 'Why: ' + q.why, 'sheet-why'));
            li.appendChild(el('p', q.id, 'sheet-id'));
            ol.appendChild(li);
          });
          section.appendChild(ol);
        });
        sheet.appendChild(section);
      });
    });

    $('summary').textContent = topics.length + ' topics and ' + total + ' questions are in the quiz.';
    var box = $('checks');
    if (!problems.length) {
      box.className = 'hint check-ok';
      box.textContent = '✔ All automatic checks passed: every topic has at least 30 questions (10 easy, 10 medium, 10 hard), and every question has four different options, one marked answer and an explanation.';
    } else {
      box.className = 'hint check-bad';
      box.textContent = '✘ ' + problems.length + ' problem' + (problems.length === 1 ? '' : 's') + ' found:';
      var ul = el('ul');
      problems.forEach(function (p) { ul.appendChild(el('li', p)); });
      box.appendChild(ul);
    }
    // exposed for the tests
    window.bankReport = { topics: topics.length, questions: total, problems: problems };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var topics = window.QUIZ_TOPICS.filter(function (t) { return t.ready; });
    loadAll(topics, function () { render(topics); });
    $('print-btn').addEventListener('click', function () { window.print(); });
  });
})();
