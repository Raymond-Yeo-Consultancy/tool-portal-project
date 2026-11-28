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
      var group = el('div', null, 'sheet-group');
      group.setAttribute('data-level', level);
      sheet.appendChild(group);
      group.appendChild(el('h2', 'Primary ' + level, 'sheet-level'));
      mine.forEach(function (t) {
        var list = window.QUESTIONS[t.id] || [];
        total += list.length;
        problems = problems.concat(window.checkQuestions(t.id, list));
        var section = el('section', null, 'sheet-topic');
        section.id = 'topic-' + t.id;
        var item = el('li'), link = el('a', 'P' + level + ' · ' + t.name);
        link.href = '#topic-' + t.id;
        item.setAttribute('data-level', level);
        item.appendChild(link);
        $('contents').appendChild(item);
        section.appendChild(el('h3', t.name + ' (' + list.length + ' questions)'));
        ['easy', 'medium', 'hard'].forEach(function (lv) {
          var qs = list.filter(function (q) { return q.level === lv; });
          if (!qs.length) return;
          section.appendChild(el('h4', lv.charAt(0).toUpperCase() + lv.slice(1) + ' (' + qs.length + ')'));
          var ol = el('ol', null, 'sheet-questions');
          qs.forEach(function (q) {
            var li = el('li');
            li.appendChild(el('p', q.q, 'sheet-q'));
            var fig = window.Pictures.draw(q.pic);
            if (fig) li.appendChild(fig);
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
        group.appendChild(section);
      });
    });

    // how often is the correct answer the single longest option? (by chance it would be about 25%)
    var longest = 0;
    topics.forEach(function (t) {
      (window.QUESTIONS[t.id] || []).forEach(function (q) {
        var lens = q.options.map(function (o) { return String(o).length; }), max = Math.max.apply(null, lens);
        if (lens[q.answer] === max && lens.filter(function (n) { return n === max; }).length === 1) longest += 1;
      });
    });
    $('summary').textContent = topics.length + ' topics and ' + total + ' questions are in the quiz. The correct answer is the longest option in ' +
      Math.round(longest / (total || 1) * 100) + '% of questions (by chance it would be about 25%).';
    var box = $('checks');
    if (!problems.length) {
      box.className = 'hint check-ok';
      box.textContent = '✔ All automatic checks passed: every topic has at least 30 questions (10 easy, 10 medium, 10 hard) and at least 10 picture questions, every question has four different options, one marked answer and an explanation, and the correct answer is not the longest option too often.';
    } else {
      box.className = 'hint check-bad';
      box.textContent = '✘ ' + problems.length + ' problem' + (problems.length === 1 ? '' : 's') + ' found:';
      var ul = el('ul');
      problems.forEach(function (p) { ul.appendChild(el('li', p)); });
      box.appendChild(ul);
    }
    // show (and so print) one level at a time
    document.querySelectorAll('#sheet-filter button').forEach(function (b) {
      b.addEventListener('click', function () {
        var want = b.getAttribute('data-level');
        document.querySelectorAll('#sheet-filter button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        document.querySelectorAll('.sheet-group, #contents li').forEach(function (g) {
          g.hidden = want !== 'all' && g.getAttribute('data-level') !== want;
        });
      });
    });
    // exposed for the tests
    window.bankReport = { topics: topics.length, questions: total, problems: problems };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var topics = window.QUIZ_TOPICS.filter(function (t) { return t.ready; });
    loadAll(topics, function () { render(topics); });
    $('print-btn').addEventListener('click', function () { window.print(); });
  });
})();
