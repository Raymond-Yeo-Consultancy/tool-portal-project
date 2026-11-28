/*
 * Plant Transport (Primary 5, Systems)
 * Three activities, chosen with the buttons at the top:
 *   celery – a celery stalk stands in red water; the colour rises through
 *            the water-carrying tubes
 *   ring   – a ring of bark is removed from a tree; food from the leaves
 *            can no longer pass, so the trunk swells above the ring
 *   sort   – sort facts about the two kinds of tubes (Activities.sort)
 * Each drawing is built once; only the parts that change are updated.
 */
(function () {
  var CELERY_HOURS = 6, RING_WEEKS = 8;

  var SORT = {
    groups: [
      { id: 'water', name: 'Water-carrying tubes', about: 'Carry water and mineral salts.' },
      { id: 'food', name: 'Food-carrying tubes', about: 'Carry food made by the leaves.' }
    ],
    items: [
      { label: 'Carry water from the roots to the leaves', group: 'water', hint: 'Water enters at the roots and must reach the leaves.' },
      { label: 'Carry mineral salts', group: 'water', hint: 'Mineral salts are dissolved in the water taken in by the roots.' },
      { label: 'Turn red when celery stands in red water', group: 'water', hint: 'The red colour is in the water, so it shows where the water travels.' },
      { label: 'Carry substances upwards only', group: 'water', hint: 'Water travels one way: from the roots up to the other parts.' },
      { label: 'Carry food made by the leaves', group: 'food', hint: 'Food is made in the leaves and must reach the rest of the plant.' },
      { label: 'Carry substances both up and down', group: 'food', hint: 'Food goes down to the roots and up to flowers, fruits and growing shoots.' },
      { label: 'Removed when a ring of bark is cut off', group: 'food', hint: 'These tubes lie just under the bark, so they come away with it.' },
      { label: 'Bring food to the roots', group: 'food', hint: 'Roots cannot make food. They depend on food sent down from the leaves.' }
    ]
  };

  var state = { mode: 'celery', t: 0, running: false, ringed: true, sortBuilt: false };
  var $ = function (id) { return document.getElementById(id); };

  function label(x, y, text, size, anchor) {
    return '<text class="svg-text" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" style="font-size:' + (size || 14) + 'px">' + text + '</text>';
  }

  /* ---------- celery in coloured water ---------- */
  var STALK_TOP = 84, STALK_BOTTOM = 262;

  function buildCelery() {
    var s = '';
    // beaker of red water
    s += '<rect x="76" y="206" width="128" height="62" style="fill:var(--car);opacity:0.45"/>';
    s += '<path class="svg-ink" d="M70 176 L76 184 V268 H204 V184 L210 176"/>';
    // stalk and leaves
    s += '<rect x="126" y="' + STALK_TOP + '" width="28" height="' + (STALK_BOTTOM - STALK_TOP) + '" rx="6" style="fill:var(--surface);stroke:var(--e-chem);stroke-width:3"/>';
    s += '<rect id="rise" x="136" y="' + STALK_BOTTOM + '" width="8" height="0" style="fill:var(--car)"/>';
    [[110, 62, -30], [140, 46, 0], [170, 62, 30]].forEach(function (l) {
      s += '<ellipse cx="' + l[0] + '" cy="' + l[1] + '" rx="16" ry="30" transform="rotate(' + l[2] + ' ' + l[0] + ' ' + l[1] + ')" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"/>';
      s += '<ellipse class="leaf-tint" cx="' + l[0] + '" cy="' + l[1] + '" rx="9" ry="22" transform="rotate(' + l[2] + ' ' + l[0] + ' ' + l[1] + ')" style="fill:var(--car);opacity:0"/>';
    });
    s += '<line class="svg-ground" x1="20" y1="270" x2="250" y2="270"/>';
    // dashed line where the stalk is cut, and the cut surface seen from above
    s += '<line x1="112" y1="150" x2="250" y2="150" style="stroke:var(--ink);stroke-width:1.5;stroke-dasharray:5 4"/>';
    s += label(318, 60, 'The stalk cut across', 13);
    s += '<circle cx="318" cy="130" r="56" style="fill:var(--surface);stroke:var(--e-chem);stroke-width:4"/>';
    for (var i = 0; i < 7; i++) {
      var a = i * 360 / 7 * Math.PI / 180;
      var x = 318 + Math.cos(a) * 36, y = 130 + Math.sin(a) * 36;
      var ox = 318 + Math.cos(a) * 46, oy = 130 + Math.sin(a) * 46;
      s += '<circle cx="' + ox.toFixed(1) + '" cy="' + oy.toFixed(1) + '" r="4.5" style="fill:var(--e-elec);stroke:var(--ink);stroke-width:1"/>';
      s += '<circle class="water-tube" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6.5" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/>';
    }
    s += '<text class="svg-text" id="clock" x="140" y="292" text-anchor="middle" style="font-size:15px"></text>';
    $('scene').innerHTML = '<svg viewBox="0 0 400 300" role="img" aria-label="A celery stalk standing in red water, and a view of the stalk cut across showing its tubes.">' + s + '</svg>';
  }

  function updateCelery() {
    var t = state.t;
    var h = (STALK_BOTTOM - STALK_TOP) * Math.min(1, t / 0.8);
    var rise = $('rise');
    rise.setAttribute('y', STALK_BOTTOM - h);
    rise.setAttribute('height', h);
    document.querySelectorAll('.leaf-tint').forEach(function (l) { l.style.opacity = Math.max(0, (t - 0.75) / 0.25) * 0.7; });
    // the cut is about 60% of the way up: its water-carrying tubes turn red when the colour gets there
    var reached = h >= (STALK_BOTTOM - 150);
    document.querySelectorAll('.water-tube').forEach(function (c) { c.style.fill = reached ? 'var(--car)' : 'var(--surface)'; });
    $('clock').textContent = 'Time: ' + (t * CELERY_HOURS).toFixed(0) + ' hours';
  }

  /* ---------- ring of bark ---------- */
  function buildRing() {
    var s = '';
    // crown, trunk, roots
    s += '<g style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"><ellipse cx="200" cy="52" rx="74" ry="42"/><ellipse cx="150" cy="78" rx="50" ry="30"/><ellipse cx="250" cy="78" rx="50" ry="30"/></g>';
    s += '<path d="M176 262 Q150 270 130 290 M224 262 Q250 270 270 290 M200 262 V292" style="fill:none;stroke:var(--ramp);stroke-width:9;stroke-linecap:round"/>';
    s += '<ellipse id="swell" cx="200" cy="150" rx="26" ry="0" style="fill:var(--ramp);stroke:var(--ink);stroke-width:2"/>';
    s += '<rect x="176" y="96" width="48" height="168" style="fill:var(--ramp);stroke:var(--ink);stroke-width:2"/>';
    if (state.ringed) {
      s += '<rect x="174" y="160" width="52" height="20" style="fill:var(--surface-2)"/>';
      s += '<rect x="184" y="160" width="32" height="20" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>';
      s += '<line x1="234" y1="170" x2="282" y2="170" style="stroke:var(--ink);stroke-width:1.5"/>' + label(288, 166, 'ring of bark', 13, 'start') + label(288, 182, 'removed', 13, 'start');
    }
    s += '<line class="svg-ground" x1="40" y1="264" x2="360" y2="264"/>';
    // water goes up the middle; food comes down just under the bark
    // (each moving line sits on a dark line so it shows clearly against the trunk)
    var foodEnd = state.ringed ? 156 : 284;
    [['M200 288 V70', '#8ab4ff'], ['M183 92 V' + foodEnd, '#ffd166'], ['M217 92 V' + foodEnd, '#ffd166']].forEach(function (f) {
      s += '<path d="' + f[0] + '" style="fill:none;stroke:#18202f;stroke-width:8;stroke-linecap:round"/>' +
        '<path class="anim-flow" d="' + f[0] + '" style="fill:none;stroke:' + f[1] + ';stroke-width:4"/>';
    });
    s += '<text class="svg-text" id="clock" x="200" y="316" text-anchor="middle" style="font-size:15px"></text>';
    $('scene').innerHTML = '<svg viewBox="0 0 400 324" role="img" aria-label="A tree ' + (state.ringed ? 'with a ring of bark removed from its trunk' : 'with its bark whole') + '. Water travels up the middle of the trunk and food travels down under the bark.">' + s + '</svg>';
  }

  function updateRing() {
    var grow = state.ringed ? state.t : 0;
    var sw = $('swell');
    sw.setAttribute('rx', 26 + grow * 16);
    sw.setAttribute('ry', grow * 22);
    sw.setAttribute('cy', 150 - grow * 4);
    $('clock').textContent = 'Time: ' + (state.t * RING_WEEKS).toFixed(0) + ' weeks';
  }

  /* ---------- page ---------- */
  function build() {
    state.t = 0;
    if (state.mode === 'celery') { buildCelery(); updateCelery(); }
    if (state.mode === 'ring') { buildRing(); updateRing(); }
  }

  function setBusy(busy) {
    document.querySelectorAll('#lab-controls button, #mode-choices button').forEach(function (b) { b.disabled = busy; });
  }

  function run() {
    if (state.running) return;
    state.running = true;
    setBusy(true);
    $('result').textContent = state.mode === 'celery' ? 'The celery is standing in red water…' : 'Weeks go by…';
    var start = null, ms = state.mode === 'celery' ? 6000 : 5000;
    function step(ts) {
      if (start === null) start = ts;
      state.t = Math.min(1, (ts - start) / ms);
      if (state.mode === 'celery') updateCelery(); else updateRing();
      if (state.t < 1) {
        requestAnimationFrame(step);
      } else {
        state.running = false;
        setBusy(false);
        finish();
      }
    }
    requestAnimationFrame(step);
  }

  function finish() {
    if (state.mode === 'celery') {
      $('result').innerHTML = 'The red colour rose up the stalk and into the leaves. In the cut stalk, only the <strong>water-carrying tubes</strong> are red. They carried the water up from the bottom of the stalk.';
    } else if (state.ringed) {
      $('result').innerHTML = 'The trunk <strong>swelled above the ring</strong>. Food made by the leaves could not get past the missing bark, so it collected there. The leaves stayed green because water still travelled up the middle of the trunk.';
    } else {
      $('result').innerHTML = 'Nothing changed. Food from the leaves travelled down to the roots, and water travelled up to the leaves, as usual.';
    }
  }

  function note() {
    $('scene-note').textContent = state.mode === 'celery'
      ? 'In the cut stalk, the inner dots are water-carrying tubes and the outer dots are food-carrying tubes. Time is speeded up.'
      : 'Blue dashes: water going up the middle of the trunk. Yellow dashes: food coming down just under the bark. Time is speeded up.';
  }

  function intro() {
    note();
    $('result').textContent = state.mode === 'celery' ? 'A stalk of celery stands in water coloured with red dye. Press Start.'
      : state.ringed ? 'A ring of bark has been removed from the trunk. The wood in the middle is left. Press Start.' : 'This tree has all its bark. Press Start.';
  }

  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('#mode-choices button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode)); });
    $('lab').hidden = mode === 'sort';
    $('sort-card').hidden = mode !== 'sort';
    $('ring-group').hidden = mode !== 'ring';
    if (mode === 'sort') {
      if (!state.sortBuilt) { Activities.sort($('sort-activity'), SORT); state.sortBuilt = true; }
      return;
    }
    build();
    intro();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#mode-choices button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
    document.querySelectorAll('#ring-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.ringed = b.getAttribute('data-ringed') === 'true';
        document.querySelectorAll('#ring-choices button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        build();
        intro();
      });
    });
    $('start-btn').addEventListener('click', run);
    $('reset-btn').addEventListener('click', function () { build(); intro(); });
    setMode('celery');
  });

  // exposed for quick checks in the browser console
  window.transportData = { SORT: SORT };
})();
