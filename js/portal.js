/*
 * Home page level filter (All, P3, P4, P5, P6).
 * Shows only the level sections that match, and remembers the choice in
 * localStorage (the browser's small storage for this site).
 */
(function () {
  var KEY = 'level';

  function apply(level) {
    var shown = 0;
    document.querySelectorAll('.level-section').forEach(function (section) {
      var show = level === 'all' || section.getAttribute('data-level') === level;
      section.hidden = !show;
      if (show) shown += 1;
    });
    document.querySelectorAll('#level-filter button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-level') === level));
    });
    document.getElementById('empty-level').hidden = shown > 0;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var level = 'all';
    try {
      level = localStorage.getItem(KEY) || 'all';
    } catch (e) { /* storage blocked: start with All */ }
    if (!document.querySelector('#level-filter button[data-level="' + level + '"]')) level = 'all';
    apply(level);

    document.querySelectorAll('#level-filter button').forEach(function (b) {
      b.addEventListener('click', function () {
        var chosen = b.getAttribute('data-level');
        apply(chosen);
        try {
          localStorage.setItem(KEY, chosen);
        } catch (e) { /* the filter still works for this visit */ }
      });
    });
  });
})();
