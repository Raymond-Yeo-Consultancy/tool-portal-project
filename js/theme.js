/*
 * Light / dark theme toggle, shared by every page.
 * Light is the default. The visitor's choice is remembered in
 * localStorage (the browser's small storage for this site).
 * Each page also has a tiny inline script in <head> that applies a saved
 * dark choice before the page is drawn, so the colours never flash.
 */
(function () {
  var KEY = 'theme';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function save(theme) {
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      /* storage blocked (e.g. private mode): the toggle still works for this visit */
    }
  }

  function updateButton(button) {
    var dark = current() === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.querySelector('.icon').textContent = dark ? '☀️' : '🌙';
    button.querySelector('.label').textContent = dark ? 'Light mode' : 'Dark mode';
    button.setAttribute('title', dark ? 'Switch to the light theme' : 'Switch to the dark theme');
  }

  function apply(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    // Let tools that draw on a canvas redraw with the new colours.
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('theme-toggle');
    if (!button) return;
    updateButton(button);
    button.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      save(next);
      updateButton(button);
    });
  });
})();
