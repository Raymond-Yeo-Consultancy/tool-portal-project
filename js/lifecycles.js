/*
 * Life Cycles (Primary 3, Cycles)
 * Learn: an animated cycle wheel steps through the stages of a life cycle.
 * Test yourself: put the stages in order (Activities.order in js/activities.js).
 *
 * To add an organism, add an entry to CYCLES. Stages are listed in order.
 * A stage's picture is an emoji (icon, with optional size) or a small
 * drawing from DRAWINGS (draw) for stages that have no emoji.
 */
(function () {
  var INK = 'style="fill:none;stroke:var(--ink);stroke-width:5;stroke-linecap:round"';
  var DRAWINGS = {
    tadpole: '<ellipse cx="-7" cy="0" rx="12" ry="9" style="fill:var(--ink)"/><path d="M5 0 q7 -9 13 0 q4 6 9 0" ' + INK + '/>',
    wriggler: '<circle cx="0" cy="-16" r="6" style="fill:var(--ink)"/><path d="M0 -10 q8 6 0 12 q-8 6 0 12 q6 4 1 8" ' + INK + '/>',
    chrysalis: '<path d="M0 -20 v7" style="stroke:var(--ink);stroke-width:3"/><path d="M0 -13 C13 -9 11 12 0 20 C-11 12 -13 -9 0 -13 Z" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2.5"/><path d="M-7 -2 h14 M-6 6 h12" style="stroke:var(--ink);stroke-width:1.5"/>',
    comma: '<circle cx="-2" cy="-7" r="10" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2.5"/><path d="M5 1 q9 8 1 17" ' + INK + '/>',
    oval: '<ellipse cx="0" cy="0" rx="10" ry="17" style="fill:#f1e6d2;stroke:var(--ink);stroke-width:2.5"/><path d="M-8 -5 h16 M-9 2 h18 M-8 9 h16" style="stroke:var(--ink);stroke-width:1.5"/>'
  };

  var CYCLES = [
    {
      id: 'butterfly', name: 'Butterfly', emoji: '🦋', youngLikeAdult: 'No',
      stages: [
        { label: 'Egg', icon: '🥚', size: 26, text: 'The female butterfly lays eggs on a leaf.' },
        { label: 'Larva (caterpillar)', icon: '🐛', text: 'A caterpillar hatches from the egg. It eats leaves and grows quickly. It moults (sheds its skin) several times.' },
        { label: 'Pupa', draw: 'chrysalis', text: 'The caterpillar becomes a pupa. Inside, it changes into a butterfly. It does not eat or move about.' },
        { label: 'Adult', icon: '🦋', text: 'The adult butterfly comes out. It has wings and can fly. The adult can lay eggs, and the cycle starts again.' }
      ]
    },
    {
      id: 'mosquito', name: 'Mosquito', emoji: '🦟', youngLikeAdult: 'No',
      stages: [
        { label: 'Egg', icon: '🥚', size: 26, text: 'The female mosquito lays eggs on still water.' },
        { label: 'Larva', draw: 'wriggler', text: 'A larva hatches and lives in the water. It wriggles about and comes to the surface to breathe.' },
        { label: 'Pupa', draw: 'comma', text: 'The larva becomes a pupa. It still lives in the water, but it does not feed.' },
        { label: 'Adult', icon: '🦟', text: 'The adult mosquito comes out of the water and flies away. The female lays eggs, and the cycle starts again.' }
      ]
    },
    {
      id: 'beetle', name: 'Mealworm beetle', emoji: '🪲', youngLikeAdult: 'No',
      stages: [
        { label: 'Egg', icon: '🥚', size: 26, text: 'The female beetle lays tiny eggs.' },
        { label: 'Larva (mealworm)', icon: '🪱', text: 'A larva called a mealworm hatches. It eats a lot, grows and moults several times.' },
        { label: 'Pupa', draw: 'oval', text: 'The mealworm becomes a pupa. It does not eat or move about while it changes into a beetle.' },
        { label: 'Adult', icon: '🪲', text: 'The adult beetle comes out. It can lay eggs, and the cycle starts again.' }
      ]
    },
    {
      id: 'frog', name: 'Frog', emoji: '🐸', youngLikeAdult: 'No',
      stages: [
        { label: 'Egg', icon: '🥚', size: 26, text: 'The female frog lays many eggs in water. The eggs are covered in jelly.' },
        { label: 'Tadpole', draw: 'tadpole', text: 'A tadpole hatches. It lives in water, has a tail and breathes through gills. Slowly it grows legs and loses its tail.' },
        { label: 'Adult', icon: '🐸', text: 'The adult frog lives on land and in water and breathes with lungs. It can lay eggs, and the cycle starts again.' }
      ]
    },
    {
      id: 'chicken', name: 'Chicken', emoji: '🐔', youngLikeAdult: 'Yes',
      stages: [
        { label: 'Egg', icon: '🥚', text: 'The hen lays eggs and sits on them to keep them warm.' },
        { label: 'Chick', icon: '🐥', text: 'A chick hatches from the egg. It looks like a small adult. It eats and grows.' },
        { label: 'Adult', icon: '🐔', text: 'The chick grows into an adult chicken. A hen can lay eggs, and the cycle starts again.' }
      ]
    },
    {
      id: 'cockroach', name: 'Cockroach', emoji: '🪳', youngLikeAdult: 'Yes',
      stages: [
        { label: 'Egg', icon: '🥚', size: 26, text: 'The female cockroach lays eggs in an egg case.' },
        { label: 'Nymph', icon: '🪳', size: 22, text: 'A nymph hatches. It looks like a small adult, but it has no wings. It moults several times as it grows.' },
        { label: 'Adult', icon: '🪳', text: 'The adult cockroach has wings. It can lay eggs, and the cycle starts again.' }
      ]
    },
    {
      id: 'grasshopper', name: 'Grasshopper', emoji: '🦗', youngLikeAdult: 'Yes',
      stages: [
        { label: 'Egg', icon: '🥚', size: 26, text: 'The female grasshopper lays eggs in the soil.' },
        { label: 'Nymph', icon: '🦗', size: 22, text: 'A nymph hatches. It looks like a small adult, but it has no wings. It moults several times as it grows.' },
        { label: 'Adult', icon: '🦗', text: 'The adult grasshopper has wings. It can lay eggs, and the cycle starts again.' }
      ]
    },
    {
      id: 'plant', name: 'Flowering plant', emoji: '🌻', youngLikeAdult: '–',
      stages: [
        { label: 'Seed', icon: '🌰', size: 28, text: 'A seed has a young plant and a store of food inside it. With water, air and warmth, it starts to grow.' },
        { label: 'Seedling', icon: '🌱', text: 'A seedling (young plant) grows from the seed. Its roots grow down and its shoot grows up towards light.' },
        { label: 'Adult plant', icon: '🌻', text: 'The adult plant has flowers. The flowers make fruits with seeds inside, and the cycle starts again.' }
      ]
    }
  ];

  var STAGE_TIME = 2.6; // seconds each stage is shown
  var CX = 180, CY = 156, R = 108, NODE = 36;

  var state = {
    cycle: 0,
    mode: 'learn',
    clock: 0, // seconds; which stage is shown comes from this
    playing: true,
    lastTs: null,
    shown: -1,
    orderActivity: null
  };
  var $ = function (id) { return document.getElementById(id); };

  function cycle() { return CYCLES[state.cycle]; }

  function pos(angleDeg, r) {
    var a = angleDeg * Math.PI / 180;
    return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
  }

  function stageAngle(i, n) { return -90 + i * 360 / n; }

  var GAP = 27; // degrees left clear around each stage picture

  // Build the wheel once per organism. Only colours and the travelling dot
  // change afterwards (updateWheel), so the stages stay tappable.
  function drawWheel() {
    var c = cycle(), n = c.stages.length;
    var s = '';

    // arrows from each stage to the next
    for (var i = 0; i < n; i++) {
      var a1 = stageAngle(i, n) + GAP, a2 = stageAngle(i + 1, n) - GAP;
      var p1 = pos(a1, R), p2 = pos(a2 - 5, R), tip = pos(a2, R);
      s += '<path id="arc-' + i + '" d="M' + p1.x.toFixed(1) + ' ' + p1.y.toFixed(1) + ' A' + R + ' ' + R + ' 0 0 1 ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1) + '" style="fill:none"/>';
      var back = pos(a2 - 7, R + 7), back2 = pos(a2 - 7, R - 7);
      s += '<polygon id="tip-' + i + '" points="' + tip.x.toFixed(1) + ',' + tip.y.toFixed(1) + ' ' + back.x.toFixed(1) + ',' + back.y.toFixed(1) + ' ' + back2.x.toFixed(1) + ',' + back2.y.toFixed(1) + '"/>';
    }
    s += '<circle id="dot" r="6" style="fill:var(--primary)"/>';

    // stages
    c.stages.forEach(function (st, i) {
      var p = pos(stageAngle(i, n), R);
      s += '<g class="web-node" role="button" tabindex="0" data-stage="' + i + '" aria-label="Stage ' + (i + 1) + ': ' + st.label + '">' +
        '<circle id="ring-' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + NODE + '" style="fill:var(--surface)"/>';
      if (st.draw) {
        s += '<g transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')">' + DRAWINGS[st.draw] + '</g>';
      } else {
        var size = st.size || 34;
        s += '<text x="' + p.x.toFixed(1) + '" y="' + (p.y + size * 0.36).toFixed(1) + '" text-anchor="middle" style="font-size:' + size + 'px">' + st.icon + '</text>';
      }
      s += '<text class="svg-text" x="' + p.x.toFixed(1) + '" y="' + (p.y + NODE + 17).toFixed(1) + '" text-anchor="middle" style="font-size:14px;paint-order:stroke;stroke:var(--surface-2);stroke-width:5px;stroke-linejoin:round">' + st.label + '</text>';
      s += '<text class="svg-text" x="' + (p.x - NODE + 4).toFixed(1) + '" y="' + (p.y - NODE + 12).toFixed(1) + '" text-anchor="middle" style="font-size:13px;fill:var(--text-muted)">' + (i + 1) + '</text>';
      s += '</g>';
    });

    $('wheel').innerHTML = '<svg viewBox="0 0 360 336" role="group" aria-label="Life cycle of a ' + c.name.toLowerCase() + ' with ' + n + ' stages: ' +
      c.stages.map(function (x) { return x.label; }).join(', ') + ', then back to the start.">' + s + '</svg>';
    state.shown = -1;
    updateWheel();
  }

  function updateWheel() {
    var c = cycle(), n = c.stages.length;
    var step = state.clock / STAGE_TIME;
    var active = Math.floor(step) % n;
    var frac = step - Math.floor(step);
    var moving = frac > 0.55; // the dot travels along the arrow just before the next stage

    for (var i = 0; i < n; i++) {
      var on = i === active && moving;
      var col = on ? 'var(--primary)' : 'var(--ink-soft)';
      var arc = $('arc-' + i);
      arc.style.stroke = col;
      arc.style.strokeWidth = on ? 4 : 2.5;
      $('tip-' + i).style.fill = col;
      var ring = $('ring-' + i);
      ring.style.stroke = i === active ? 'var(--primary)' : 'var(--ink-soft)';
      ring.style.strokeWidth = i === active ? 4.5 : 1.5;
    }
    var dot = $('dot');
    if (moving) {
      var a1 = stageAngle(active, n) + GAP, a2 = stageAngle(active + 1, n) - GAP;
      var d = pos(a1 + (a2 - a1) * ((frac - 0.55) / 0.45), R);
      dot.setAttribute('cx', d.x.toFixed(1));
      dot.setAttribute('cy', d.y.toFixed(1));
      dot.style.display = '';
    } else {
      dot.style.display = 'none';
    }

    if (active !== state.shown) {
      state.shown = active;
      $('stage-title').textContent = 'Stage ' + (active + 1) + ' of ' + n + ': ' + c.stages[active].label;
      $('stage-text').textContent = c.stages[active].text;
    }
  }

  function tick(ts) {
    if (state.lastTs === null) state.lastTs = ts;
    var dt = Math.min(0.05, (ts - state.lastTs) / 1000);
    state.lastTs = ts;
    if (state.playing && state.mode === 'learn') {
      state.clock += dt;
      updateWheel();
    }
    requestAnimationFrame(tick);
  }

  function setPlaying(on) {
    state.playing = on;
    $('play-btn').textContent = on ? '⏸ Pause' : '▶ Play';
  }

  function loadCycle(i) {
    state.cycle = i;
    state.clock = 0;
    state.shown = -1;
    var c = cycle();
    $('cycle-name').textContent = 'Life cycle of a ' + c.name.toLowerCase();
    $('cycle-facts').textContent = c.stages.length + ' stages. ' +
      (c.youngLikeAdult === 'Yes' ? 'The young looks like the adult.' : c.youngLikeAdult === 'No' ? 'The young does not look like the adult.' : 'It grows from a seed.');
    drawWheel();
    state.orderActivity = Activities.order($('order-activity'), {
      items: c.stages.map(function (st) { return { label: st.label }; }),
      firstHint: 'This life cycle starts with the ' + c.stages[0].label.toLowerCase() + '.'
    });
  }

  function setMode(m) {
    state.mode = m;
    $('mode-learn').setAttribute('aria-pressed', String(m === 'learn'));
    $('mode-test').setAttribute('aria-pressed', String(m === 'test'));
    $('learn-panel').hidden = m !== 'learn';
    $('test-panel').hidden = m !== 'test';
    if (m === 'test' && state.orderActivity) state.orderActivity.reset();
    if (m === 'learn') updateWheel();
  }

  function buildCompare() {
    var body = $('compare-body');
    CYCLES.forEach(function (c) {
      var tr = document.createElement('tr');
      [c.emoji + ' ' + c.name, String(c.stages.length), c.stages.map(function (s) { return s.label; }).join(' → '), c.youngLikeAdult].forEach(function (v, i) {
        var cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row';
        cell.textContent = v;
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var box = $('cycle-choices');
    CYCLES.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.setAttribute('aria-pressed', String(i === 0));
      var em = document.createElement('span');
      em.className = 'emoji';
      em.setAttribute('aria-hidden', 'true');
      em.textContent = c.emoji;
      b.appendChild(em);
      b.appendChild(document.createTextNode(c.name));
      b.addEventListener('click', function () {
        box.querySelectorAll('.choice').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        loadCycle(i);
        setPlaying(true);
      });
      box.appendChild(b);
    });

    $('play-btn').addEventListener('click', function () { setPlaying(!state.playing); });
    $('mode-learn').addEventListener('click', function () { setMode('learn'); });
    $('mode-test').addEventListener('click', function () { setMode('test'); });

    function pick(e) {
      var node = e.target.closest && e.target.closest('[data-stage]');
      if (!node) return;
      state.clock = Number(node.getAttribute('data-stage')) * STAGE_TIME + 0.01;
      setPlaying(false);
      updateWheel();
    }
    $('wheel').addEventListener('click', pick);
    $('wheel').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pick(e);
      }
    });

    buildCompare();
    loadCycle(0);
    requestAnimationFrame(tick);
  });

  // exposed for quick checks in the browser console
  window.lifecyclesData = { CYCLES: CYCLES };
})();
