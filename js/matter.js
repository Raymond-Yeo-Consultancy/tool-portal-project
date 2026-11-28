/*
 * States of Matter (Primary 4, Cycles)
 * Three activities, chosen with the buttons at the top:
 *   shape   – put a solid, a liquid or a gas into different containers
 *   squeeze – push the plunger of a sealed syringe filled with each one
 *   sort    – sort everyday things into solid, liquid and gas (Activities.sort)
 * The drawings follow state.t (0 to 1) while an animation runs.
 */
(function () {
  var MATTER = {
    solid: { name: 'Wooden block', state: 'solid', fill: '#b98652', opacity: 1 },
    liquid: { name: 'Water', state: 'liquid', fill: '#3d8bff', opacity: 0.6 },
    gas: { name: 'Air', state: 'gas', fill: '#9aa4b5', opacity: 0.35 }
  };
  // containers are simple boxes so the same volume of water is easy to compare:
  // inner width x water depth is the same (8000 square units) in each one
  var CONTAINERS = {
    tall: { name: 'Tall cylinder', x: 160, w: 80, h: 170 },
    jar: { name: 'Jar', x: 135, w: 130, h: 120 },
    dish: { name: 'Wide dish', x: 100, w: 200, h: 70 }
  };
  var WATER_AREA = 8000;
  var FLOOR = 220;

  var SORT = {
    groups: [
      { id: 'solid', name: 'Solid', about: 'Has a definite shape and a definite volume.' },
      { id: 'liquid', name: 'Liquid', about: 'Has a definite volume but no definite shape.' },
      { id: 'gas', name: 'Gas', about: 'Has no definite shape and no definite volume.' }
    ],
    items: [
      { label: 'Ice cube', emoji: '🧊', group: 'solid', hint: 'An ice cube keeps its shape until it melts.' },
      { label: 'Stone', emoji: '🪨', group: 'solid', hint: 'A stone keeps its shape wherever you put it.' },
      { label: 'Sand', emoji: '⏳', group: 'solid', hint: 'Sand can be poured, but each grain keeps its own shape. Each grain is a tiny solid.' },
      { label: 'Wooden block', emoji: '🧱', group: 'solid', hint: 'A block keeps its shape and its volume.' },
      { label: 'Water', emoji: '💧', group: 'liquid', hint: 'Water takes the shape of its container, but its volume stays the same.' },
      { label: 'Milk', emoji: '🥛', group: 'liquid', hint: 'Milk takes the shape of the glass, but its volume stays the same.' },
      { label: 'Cooking oil', emoji: '🫒', group: 'liquid', hint: 'Oil flows and takes the shape of its container.' },
      { label: 'Honey', emoji: '🍯', group: 'liquid', hint: 'Honey flows slowly, but it still takes the shape of its container.' },
      { label: 'Air in a balloon', emoji: '🎈', group: 'gas', hint: 'Air fills the whole balloon and can be squeezed into a smaller space.' },
      { label: 'Steam', emoji: '♨️', group: 'gas', hint: 'Steam spreads out to fill any space. It has no definite shape or volume.' },
      { label: 'Oxygen in a tank', emoji: '🤿', group: 'gas', hint: 'A lot of oxygen is compressed into the tank. Only a gas can be compressed like this.' }
    ]
  };

  var state = {
    mode: 'shape',
    matter: 'liquid',
    container: 'tall',
    t: 1, running: false,
    pushed: false,
    sortBuilt: false
  };
  var $ = function (id) { return document.getElementById(id); };

  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }
  function label(x, y, text, anchor) {
    return '<text class="svg-text" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" style="font-size:16px">' + text + '</text>';
  }

  /* ---------- change the container ---------- */
  function drawShape(t) {
    var c = CONTAINERS[state.container], m = MATTER[state.matter];
    var top = FLOOR - c.h, right = c.x + c.w;
    var s = '';
    var style = 'style="fill:' + m.fill + ';opacity:' + m.opacity + '"';
    if (state.matter === 'solid') {
      // the block drops in and keeps its shape
      var y = FLOOR - 60 - (1 - ease(t)) * (c.h + 40);
      s += '<rect x="' + (c.x + c.w / 2 - 30) + '" y="' + y + '" width="60" height="60" style="fill:' + m.fill + ';stroke:var(--ink);stroke-width:2"/>';
    } else if (state.matter === 'liquid') {
      var depth = WATER_AREA / c.w * ease(t);
      s += '<rect x="' + c.x + '" y="' + (FLOOR - depth) + '" width="' + c.w + '" height="' + depth + '" ' + style + '/>';
      s += '<line x1="' + c.x + '" y1="' + (FLOOR - depth) + '" x2="' + right + '" y2="' + (FLOOR - depth) + '" style="stroke:' + m.fill + ';stroke-width:2.5"/>';
      if (t < 1) s += '<rect x="' + (c.x + c.w / 2 - 4) + '" y="' + (top - 30) + '" width="8" height="' + (c.h + 30 - depth) + '" ' + style + '/>';
    } else {
      // gas spreads to fill the whole closed container
      var grow = ease(t);
      var gw = c.w * (0.3 + 0.7 * grow), gh = c.h * (0.3 + 0.7 * grow);
      s += '<rect x="' + (c.x + (c.w - gw) / 2) + '" y="' + (FLOOR - gh) + '" width="' + gw + '" height="' + gh + '" ' + style + '/>';
      s += '<rect x="' + (c.x - 6) + '" y="' + (top - 10) + '" width="' + (c.w + 12) + '" height="10" rx="3" class="svg-fill"/>';
      s += label(right + 12, top - 2, 'lid', 'start');
    }
    // container walls
    s += '<path class="svg-ink" d="M' + c.x + ' ' + top + ' V' + FLOOR + ' H' + right + ' V' + top + '"/>';
    return s + label(200, 246, m.name + ' in the ' + c.name.toLowerCase());
  }

  function sayShape() {
    var c = CONTAINERS[state.container].name.toLowerCase();
    $('result').innerHTML = {
      solid: 'The block <strong>keeps its shape</strong> in the ' + c + '. Its volume stays the same too.',
      liquid: 'The water <strong>takes the shape</strong> of the ' + c + '. Its volume is still <strong>100 cm³</strong>.',
      gas: 'The air <strong>spreads out to fill</strong> the whole ' + c + '. It has no definite shape and no definite volume.'
    }[state.matter];
  }

  /* ---------- squeeze ---------- */
  var BARREL = { x1: 110, x2: 300, y: 104, h: 56 };

  function drawSqueeze(t) {
    var m = MATTER[state.matter];
    var push = state.pushed ? ease(t / 0.6) : 0;
    var start = state.matter === 'solid' ? 150 : 130;
    var travel = state.matter === 'gas' ? 85 : state.matter === 'solid' ? 20 : 0;
    var head = start - (state.matter === 'solid' ? 20 : 0) + push * travel; // plunger position
    if (state.matter === 'solid') head = 130 + push * 20;
    // a small shake shows the plunger will not go in
    if (state.pushed && state.matter !== 'gas' && t > 0.6 && t < 1) head += Math.sin(t * 60) * 1.5;
    var s = '';
    // contents
    var from = state.matter === 'solid' ? 150 : head;
    s += '<rect x="' + from + '" y="' + BARREL.y + '" width="' + (BARREL.x2 - from) + '" height="' + BARREL.h + '" style="fill:' + m.fill + ';opacity:' +
      (state.matter === 'gas' ? m.opacity + push * 0.3 : m.opacity) + (state.matter === 'solid' ? ';stroke:var(--ink);stroke-width:2' : '') + '"/>';
    // barrel, sealed nozzle, volume marks
    s += '<rect x="' + BARREL.x1 + '" y="' + BARREL.y + '" width="' + (BARREL.x2 - BARREL.x1) + '" height="' + BARREL.h + '" style="fill:none;stroke:var(--ink);stroke-width:3"/>';
    s += '<rect class="svg-fill" x="' + BARREL.x2 + '" y="' + (BARREL.y + 20) + '" width="26" height="16"/><rect x="326" y="' + (BARREL.y + 14) + '" width="10" height="28" rx="3" style="fill:var(--ink)"/>';
    s += label(331, BARREL.y - 2, 'sealed');
    for (var v = 0; v <= 60; v += 10) {
      var x = BARREL.x2 - v / 60 * 170;
      s += '<line x1="' + x + '" y1="' + (BARREL.y + BARREL.h) + '" x2="' + x + '" y2="' + (BARREL.y + BARREL.h + 8) + '" style="stroke:var(--ink);stroke-width:1.5"/>' +
        '<text class="svg-text" x="' + x + '" y="' + (BARREL.y + BARREL.h + 24) + '" text-anchor="middle" style="font-size:12px;font-weight:400">' + v + '</text>';
    }
    s += label(96, BARREL.y + BARREL.h + 24, 'cm³', 'end');
    // plunger
    s += '<rect x="' + (head - 12) + '" y="' + (BARREL.y + 2) + '" width="12" height="' + (BARREL.h - 4) + '" style="fill:var(--ink)"/>';
    s += '<rect class="svg-fill" x="' + (head - 92) + '" y="' + (BARREL.y + 22) + '" width="80" height="12"/><rect class="svg-fill" x="' + (head - 100) + '" y="' + (BARREL.y + 6) + '" width="10" height="44" rx="3"/>';
    if (state.pushed) {
      s += '<line x1="' + (head - 150) + '" y1="' + (BARREL.y + 28) + '" x2="' + (head - 116) + '" y2="' + (BARREL.y + 28) + '" style="stroke:var(--e-heat);stroke-width:5"/>' +
        '<polygon points="' + (head - 104) + ',' + (BARREL.y + 28) + ' ' + (head - 118) + ',' + (BARREL.y + 19) + ' ' + (head - 118) + ',' + (BARREL.y + 37) + '" style="fill:var(--e-heat)"/>' +
        label(Math.max(26, head - 128), BARREL.y + 8, 'push');
    }
    return s + label(200, 246, 'A sealed syringe of ' + (state.matter === 'solid' ? 'wood' : m.name.toLowerCase()));
  }

  function saySqueeze() {
    if (!state.pushed) {
      $('result').textContent = 'The end of the syringe is sealed, so nothing can get out. Push the plunger.';
      return;
    }
    $('result').innerHTML = {
      solid: 'The plunger stops at the block. A solid <strong>cannot be compressed</strong>.',
      liquid: 'The plunger will not move. The water still takes up 60 cm³. A liquid <strong>cannot be compressed</strong>.',
      gas: 'The plunger moves in. The air is squeezed from 60 cm³ into about <strong>30 cm³</strong>. A gas <strong>can be compressed</strong>.'
    }[state.matter];
  }

  /* ---------- page ---------- */
  function draw() {
    if (state.mode === 'sort') return;
    var s = '<line class="svg-ground" x1="10" y1="' + FLOOR + '" x2="390" y2="' + FLOOR + '"/>' +
      (state.mode === 'shape' ? drawShape(state.t) : drawSqueeze(state.t));
    $('scene').innerHTML = '<svg viewBox="0 0 400 256" role="img" aria-label="' +
      (state.mode === 'shape' ? MATTER[state.matter].name + ' in a ' + CONTAINERS[state.container].name.toLowerCase()
        : 'A sealed syringe filled with ' + MATTER[state.matter].name.toLowerCase()) + '.">' + s + '</svg>';
  }

  function animate(ms, done) {
    state.running = true;
    state.t = 0;
    setBusy(true);
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      state.t = Math.min(1, (ts - start) / ms);
      draw();
      if (state.t < 1) {
        requestAnimationFrame(step);
      } else {
        state.running = false;
        setBusy(false);
        done();
      }
    }
    requestAnimationFrame(step);
  }

  function setBusy(busy) {
    document.querySelectorAll('#lab .choice, #lab .btn').forEach(function (b) { b.disabled = busy; });
  }

  function pressGroup(id, attr, value) {
    document.querySelectorAll('#' + id + ' button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute(attr) === value));
    });
  }

  function refresh() {
    if (state.mode === 'shape') {
      $('result').textContent = 'Watch what happens…';
      animate(900, sayShape);
    } else {
      state.pushed = false;
      state.t = 1;
      draw();
      saySqueeze();
    }
  }

  function setMode(mode) {
    state.mode = mode;
    pressGroup('mode-choices', 'data-mode', mode);
    $('lab').hidden = mode === 'sort';
    $('sort-card').hidden = mode !== 'sort';
    $('container-group').hidden = mode !== 'shape';
    $('push-group').hidden = mode !== 'squeeze';
    if (mode === 'sort') {
      if (!state.sortBuilt) {
        Activities.sort($('sort-activity'), SORT);
        state.sortBuilt = true;
      }
      return;
    }
    refresh();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#mode-choices button').forEach(function (b) {
      b.addEventListener('click', function () { if (!state.running) setMode(b.getAttribute('data-mode')); });
    });
    document.querySelectorAll('#matter-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.matter = b.getAttribute('data-matter');
        pressGroup('matter-choices', 'data-matter', state.matter);
        refresh();
      });
    });
    document.querySelectorAll('#container-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.container = b.getAttribute('data-container');
        pressGroup('container-choices', 'data-container', state.container);
        refresh();
      });
    });
    $('push-btn').addEventListener('click', function () {
      state.pushed = true;
      $('result').textContent = 'Pushing…';
      animate(1500, saySqueeze);
    });
    setMode('shape');
  });

  // exposed for quick checks in the browser console
  window.matterData = { MATTER: MATTER, CONTAINERS: CONTAINERS, SORT: SORT, WATER_AREA: WATER_AREA };
})();
