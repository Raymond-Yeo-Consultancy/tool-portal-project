/*
 * Shared activities used by several tools. Each one builds itself inside a
 * container element and works by tapping (or with the keyboard):
 *
 *   Activities.sort(el, { items, groups })
 *       Put cards into groups. Feedback is instant: a wrong choice shows a hint.
 *       items:  [{ label, emoji, group, hint }]   group = id of the right group
 *       groups: [{ id, name, about }]
 *
 *   Activities.order(el, { items, firstHint })
 *       Put stages in sequence. items are listed in the CORRECT order:
 *       [{ label, emoji }]
 *
 *   Activities.match(el, { rows, prompt })
 *       Match each prompt to its answer (also used for labelling a drawing).
 *       rows: [{ prompt, answer }]
 *
 * Every activity returns { reset: function } so a tool can restart it.
 */
(function () {
  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text !== undefined && text !== null) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }

  function button(text, cls) {
    var b = el('button', text, cls);
    b.type = 'button';
    return b;
  }

  function chipContent(node, item) {
    if (item.emoji) {
      var em = el('span', item.emoji, 'chip-icon');
      em.setAttribute('aria-hidden', 'true');
      node.appendChild(em);
    }
    node.appendChild(document.createTextNode(item.label));
  }

  // Mix up a list the same way each time for a given seed (so it is not in answer order).
  function mix(list, seed) {
    var out = list.slice();
    var s = seed * 9301 + 49297;
    for (var i = out.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      var j = Math.floor(s / 233280 * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    // never leave it in exactly the original order
    if (out.length > 1 && out.every(function (x, k) { return x === list[k]; })) out.push(out.shift());
    return out;
  }

  function setFeedback(node, text, good) {
    node.textContent = text;
    node.className = 'feedback' + (good === true ? ' good' : good === false ? ' bad' : '');
  }

  /* ---------- sort ---------- */
  function sort(root, cfg) {
    var seed = 1, left, placed, current, mistakes;
    root.innerHTML = '';
    root.classList.add('activity');
    var progress = el('p', '', 'act-progress');
    var tray = el('div', '', 'act-tray');
    var bins = el('div', '', 'act-bins');
    var feedback = el('p', '', 'feedback');
    feedback.setAttribute('aria-live', 'polite');
    var again = button('Play again', 'btn btn-secondary');
    again.addEventListener('click', function () { seed += 1; start(); });
    [progress, tray, feedback, bins, again].forEach(function (n) { root.appendChild(n); });

    function start() {
      left = mix(cfg.items, seed);
      placed = {};
      cfg.groups.forEach(function (g) { placed[g.id] = []; });
      current = left[0];
      mistakes = 0;
      setFeedback(feedback, '', null);
      render();
    }

    function render() {
      var total = cfg.items.length;
      progress.textContent = left.length
        ? 'Sorted ' + (total - left.length) + ' of ' + total + '. Tap the group for the highlighted card.'
        : 'All ' + total + ' sorted!';
      tray.innerHTML = '';
      left.forEach(function (item) {
        var c = button(null, 'chip act-card' + (item === current ? ' selected' : ''));
        chipContent(c, item);
        c.setAttribute('aria-pressed', String(item === current));
        c.addEventListener('click', function () { current = item; render(); });
        tray.appendChild(c);
      });
      bins.innerHTML = '';
      cfg.groups.forEach(function (g) {
        var b = button(null, 'act-bin');
        b.setAttribute('data-group', g.id);
        b.appendChild(el('strong', g.name));
        if (g.about) b.appendChild(el('span', g.about, 'act-bin-about'));
        var inside = el('span', '', 'act-bin-items');
        placed[g.id].forEach(function (item) {
          var c = el('span', null, 'chip');
          chipContent(c, item);
          inside.appendChild(c);
        });
        b.appendChild(inside);
        b.disabled = !left.length;
        b.addEventListener('click', function () { choose(g); });
        bins.appendChild(b);
      });
      again.hidden = left.length > 0;
    }

    function choose(g) {
      if (!current) return;
      if (current.group === g.id) {
        placed[g.id].push(current);
        var done = current;
        left = left.filter(function (x) { return x !== done; });
        current = left[0] || null;
        if (left.length) {
          setFeedback(feedback, 'Correct! ' + done.label + ': ' + g.name.toLowerCase() + '.', true);
        } else {
          setFeedback(feedback, mistakes ? '🎉 All sorted, with ' + mistakes + (mistakes === 1 ? ' mistake' : ' mistakes') + ' along the way. Play again to beat that!' : '🎉 All sorted with no mistakes. Well done!', true);
        }
      } else {
        mistakes += 1;
        setFeedback(feedback, 'Not quite. ' + (current.hint || 'Think again about ' + current.label.toLowerCase() + '.'), false);
      }
      render();
    }

    start();
    return { reset: start };
  }

  /* ---------- order ---------- */
  function order(root, cfg) {
    var seed = 1, slots, marked;
    root.innerHTML = '';
    root.classList.add('activity');
    var slotRow = el('div', '', 'act-slots');
    var trayLabel = el('p', 'Tap the stages in the right order:', 'act-progress');
    var tray = el('div', '', 'energy-palette');
    var actions = el('div', '', 'actions');
    var checkBtn = button('Check', 'btn');
    var clearBtn = button('Clear', 'btn btn-secondary');
    var feedback = el('p', '', 'feedback');
    feedback.setAttribute('aria-live', 'polite');
    actions.appendChild(checkBtn);
    actions.appendChild(clearBtn);
    [slotRow, trayLabel, tray, actions, feedback].forEach(function (n) { root.appendChild(n); });

    function start() {
      slots = cfg.items.map(function () { return null; });
      marked = false;
      setFeedback(feedback, '', null);
      render();
    }

    function render() {
      slotRow.innerHTML = '';
      slots.forEach(function (item, i) {
        if (i > 0) {
          var a = el('span', '→', 'arrow');
          a.setAttribute('aria-hidden', 'true');
          slotRow.appendChild(a);
        }
        var b = button(null, 'blank' + (item ? ' filled' : ''));
        if (item) chipContent(b, item); else b.textContent = String(i + 1);
        if (marked) b.classList.add(item === cfg.items[i] ? 'correct' : 'wrong');
        b.setAttribute('aria-label', 'Position ' + (i + 1) + ': ' + (item ? item.label + (marked ? (item === cfg.items[i] ? ', correct' : ', not correct') : '') + '. Tap to remove.' : 'empty'));
        b.addEventListener('click', function () {
          if (!slots[i]) return;
          slots[i] = null;
          marked = false;
          setFeedback(feedback, '', null);
          render();
        });
        slotRow.appendChild(b);
      });
      tray.innerHTML = '';
      mix(cfg.items, seed).forEach(function (item) {
        var used = slots.indexOf(item) !== -1;
        var c = button(null, 'chip' + (used ? ' used' : ''));
        chipContent(c, item);
        c.disabled = used;
        c.addEventListener('click', function () {
          var next = slots.indexOf(null);
          if (next === -1) return;
          slots[next] = item;
          marked = false;
          setFeedback(feedback, '', null);
          render();
        });
        tray.appendChild(c);
      });
    }

    checkBtn.addEventListener('click', function () {
      if (slots.indexOf(null) !== -1) {
        setFeedback(feedback, 'Fill every position first.', false);
        return;
      }
      var right = slots.filter(function (s, i) { return s === cfg.items[i]; }).length;
      marked = true;
      render();
      if (right === slots.length) {
        setFeedback(feedback, '🎉 Correct order! Well done.', true);
      } else {
        setFeedback(feedback, right + ' of ' + slots.length + ' in the right place. Tap a red one to take it out and try again.' +
          (slots[0] !== cfg.items[0] && cfg.firstHint ? ' Hint: ' + cfg.firstHint : ''), false);
      }
    });
    clearBtn.addEventListener('click', start);

    start();
    return { reset: function () { seed += 1; start(); } };
  }

  /* ---------- match ---------- */
  function match(root, cfg) {
    var seed = 1, answers, selected, marked;
    root.innerHTML = '';
    root.classList.add('activity');
    var rows = el('div', '', 'act-rows');
    var palLabel = el('p', cfg.prompt || 'Answers', 'act-progress');
    var pal = el('div', '', 'energy-palette');
    var actions = el('div', '', 'actions');
    var checkBtn = button('Check', 'btn');
    var clearBtn = button('Clear', 'btn btn-secondary');
    var feedback = el('p', '', 'feedback');
    feedback.setAttribute('aria-live', 'polite');
    actions.appendChild(checkBtn);
    actions.appendChild(clearBtn);
    [rows, palLabel, pal, actions, feedback].forEach(function (n) { root.appendChild(n); });

    function start() {
      answers = cfg.rows.map(function () { return null; });
      selected = 0;
      marked = false;
      setFeedback(feedback, '', null);
      render();
    }

    function render() {
      rows.innerHTML = '';
      cfg.rows.forEach(function (r, i) {
        var row = el('div', '', 'match-row');
        row.appendChild(el('span', r.prompt, 'match-feature'));
        var a = answers[i];
        var b = button(a === null ? 'Tap here, then choose an answer' : cfg.rows[a].answer, 'blank' + (a !== null ? ' filled' : '') + (selected === i ? ' selected' : ''));
        if (marked) b.classList.add(a === i ? 'correct' : 'wrong');
        b.setAttribute('aria-label', r.prompt + ': ' + (a === null ? 'no answer yet' : cfg.rows[a].answer) + (marked ? (a === i ? ', correct' : ', not correct') : ''));
        b.addEventListener('click', function () {
          selected = i;
          marked = false;
          render();
          rows.querySelectorAll('.blank')[i].focus();
        });
        row.appendChild(b);
        rows.appendChild(row);
      });
      pal.innerHTML = '';
      mix(cfg.rows.map(function (r, i) { return i; }), seed).forEach(function (ai) {
        var c = button(cfg.rows[ai].answer, 'chip' + (answers.indexOf(ai) !== -1 ? ' used' : ''));
        c.addEventListener('click', function () {
          if (selected === null) return;
          answers = answers.map(function (x) { return x === ai ? null : x; });
          answers[selected] = ai;
          marked = false;
          setFeedback(feedback, '', null);
          var next = answers.indexOf(null);
          selected = next === -1 ? null : next;
          render();
        });
        pal.appendChild(c);
      });
    }

    checkBtn.addEventListener('click', function () {
      if (answers.indexOf(null) !== -1) {
        setFeedback(feedback, 'Answer every one first.', false);
        return;
      }
      var right = answers.filter(function (a, i) { return a === i; }).length;
      marked = true;
      selected = null;
      render();
      if (right === answers.length) setFeedback(feedback, '🎉 All correct! Well done.', true);
      else setFeedback(feedback, right + ' of ' + answers.length + ' correct. Change the ones marked in red and check again.', false);
    });
    clearBtn.addEventListener('click', start);

    start();
    return { reset: function () { seed += 1; start(); } };
  }

  window.Activities = { sort: sort, order: order, match: match };
})();
