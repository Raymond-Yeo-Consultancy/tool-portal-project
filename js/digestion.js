/*
 * Digestive Journey (Primary 4, Systems)
 * Follow a bite of food through the digestive system. The food stops at each
 * organ while the panel explains what happens there.
 * Test yourself: put the organs in order and match each to what it does
 * (Activities in js/activities.js).
 *
 * The body is drawn once. Only the food and the highlighted organ change.
 */
(function () {
  // x, y: where the food rests in the organ.  path: the route from this organ to the next.
  var ORGANS = [
    { id: 'mouth', n: 1, name: 'Mouth', digests: 'Yes', does: 'Teeth break food into smaller pieces and saliva starts to digest it',
      text: ['Your teeth cut and grind the food into smaller pieces.', 'Saliva, a digestive juice, mixes with the food and starts to digest it.'],
      x: 150, y: 78, path: [[150, 136]] },
    { id: 'gullet', n: 2, name: 'Gullet', digests: 'No', does: 'Pushes food from the mouth to the stomach',
      text: ['The gullet is a tube. It pushes the food from the mouth down to the stomach.', 'No digestion takes place here.'],
      x: 150, y: 136, path: [[150, 186], [176, 218]] },
    { id: 'stomach', n: 3, name: 'Stomach', digests: 'Yes', does: 'Churns food and mixes it with digestive juices',
      text: ['The stomach churns the food and mixes it with digestive juices.', 'The food is digested further and becomes a thick liquid.'],
      x: 176, y: 218, path: [[150, 250], [150, 280], [160, 286], [196, 286], [202, 296], [196, 306], [157, 306]] },
    { id: 'small', n: 4, name: 'Small intestine', digests: 'Yes', does: 'Completes digestion; digested food passes into the blood',
      text: ['More digestive juices finish digesting the food. Digestion is completed here.', 'The digested food passes through the walls of the small intestine into the blood, which carries it to all parts of the body.'],
      x: 157, y: 306, path: [[118, 306], [112, 316], [118, 326], [196, 326], [202, 336], [196, 346], [124, 346], [118, 356], [92, 352], [88, 300]] },
    { id: 'large', n: 5, name: 'Large intestine', digests: 'No', does: 'Takes in water from the undigested food',
      text: ['Only undigested food reaches the large intestine.', 'Water is taken in from the undigested food, leaving solid waste.'],
      x: 88, y: 300, path: [[92, 270], [110, 266], [206, 266], [228, 288], [228, 352], [210, 382], [166, 384], [150, 396], [150, 412]] },
    { id: 'anus', n: 6, name: 'Anus', digests: 'No', does: 'Passes undigested food out of the body',
      text: ['The undigested food passes out of the body through the anus as faeces.'],
      x: 150, y: 412, path: [] }
  ];
  var DWELL = 3.2, TRAVEL = 1.6; // seconds at an organ, and between organs

  var state = {
    stage: 0, phase: 'dwell', clock: 0,
    playing: false, started: false,
    lastTs: null, built: false, mode: 'explore'
  };
  var $ = function (id) { return document.getElementById(id); };

  function badge(x, y, n, tx, ty) {
    return '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + ty + '" style="stroke:var(--ink);stroke-width:1.5"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="14" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>' +
      '<text class="svg-text" x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" style="font-size:16px">' + n + '</text>';
  }

  function organ(id, n, inner) {
    return '<g class="plant-part" role="button" tabindex="0" data-organ="' + id + '" aria-label="Part ' + n + '">' + inner + '</g>';
  }

  function tube(d, color, w) {
    return '<path d="' + d + '" style="fill:none;stroke:var(--ink);stroke-width:' + (w + 4) + ';stroke-linecap:round;stroke-linejoin:round"/>' +
      '<path d="' + d + '" style="fill:none;stroke:' + color + ';stroke-width:' + w + ';stroke-linecap:round;stroke-linejoin:round"/>';
  }

  function build() {
    var s = '';
    // body outline
    s += '<circle cx="150" cy="58" r="46" style="fill:var(--surface);stroke:var(--ink-soft);stroke-width:2"/>';
    s += '<path d="M132 100 V116 Q74 120 70 170 V400 Q70 432 104 432 H196 Q230 432 230 400 V170 Q226 120 168 116 V100" style="fill:var(--surface);stroke:var(--ink-soft);stroke-width:2"/>';
    s += '<circle cx="134" cy="46" r="4" style="fill:var(--ink-soft)"/><circle cx="166" cy="46" r="4" style="fill:var(--ink-soft)"/>';

    s += organ('large', 5, tube('M118 356 Q88 360 88 334 V288 Q88 266 110 266 H206 Q228 266 228 288 V352 Q228 384 196 384 H166 Q150 384 150 396 V406', 'var(--ramp)', 14));
    s += organ('small', 4, tube('M150 252 V276 Q150 286 160 286 H192 Q202 286 202 296 Q202 306 192 306 H122 Q112 306 112 316 Q112 326 122 326 H192 Q202 326 202 336 Q202 346 192 346 H128 Q118 346 118 356', 'var(--e-elec)', 9));
    s += organ('gullet', 2, tube('M150 88 V186', 'var(--e-sound)', 9));
    s += organ('stomach', 3, '<path d="M150 186 C198 178 216 214 198 240 C184 260 152 254 146 238 C142 222 150 206 150 186 Z" style="fill:var(--e-heat);stroke:var(--ink);stroke-width:2"/>');
    s += organ('mouth', 1, '<ellipse cx="150" cy="78" rx="18" ry="9" style="fill:var(--car);stroke:var(--ink);stroke-width:2"/>');
    s += organ('anus', 6, '<circle cx="150" cy="413" r="7" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/><circle cx="150" cy="413" r="16" style="fill:transparent"/>');

    s += badge(266, 78, 1, 170, 78) + badge(34, 140, 2, 144, 140) + badge(266, 214, 3, 204, 214) +
      badge(34, 232, 4, 150, 262) + badge(266, 320, 5, 236, 320) + badge(266, 413, 6, 160, 413);

    s += '<circle id="food" cx="150" cy="78" r="7" style="fill:#ffffff;stroke:#18202f;stroke-width:3;pointer-events:none"/>';
    $('body').innerHTML = '<svg viewBox="0 0 300 446" role="group" aria-label="The human digestive system with six numbered parts, from the mouth at the top to the anus at the bottom.">' + s + '</svg>';
  }

  // position part-way along the route from one organ to the next
  function along(i, p) {
    var o = ORGANS[i];
    var pts = [[o.x, o.y]].concat(o.path);
    var lens = [], total = 0;
    for (var k = 1; k < pts.length; k++) {
      var d = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      lens.push(d);
      total += d;
    }
    var want = p * total;
    for (var j = 0; j < lens.length; j++) {
      if (want <= lens[j] || j === lens.length - 1) {
        var f = lens[j] ? Math.min(1, want / lens[j]) : 0;
        return [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f];
      }
      want -= lens[j];
    }
    return [o.x, o.y];
  }

  function update() {
    var o = ORGANS[state.stage];
    var xy = state.phase === 'travel' ? along(state.stage, Math.min(1, state.clock / TRAVEL)) : [o.x, o.y];
    var food = $('food');
    food.setAttribute('cx', xy[0].toFixed(1));
    food.setAttribute('cy', xy[1].toFixed(1));
    // the food gets smaller as it is digested and taken into the blood
    food.setAttribute('r', state.stage < 2 ? 7 : state.stage < 4 ? 5.5 : 4.5);

    document.querySelectorAll('#body .plant-part').forEach(function (g) {
      g.classList.toggle('selected', state.phase === 'dwell' && g.getAttribute('data-organ') === o.id);
    });
    $('play-btn').textContent = state.playing ? '⏸ Pause' : (state.started ? '▶ Play' : '▶ Start the journey');
    $('next-btn').disabled = state.stage >= ORGANS.length - 1 && state.phase === 'dwell';
  }

  function showInfo() {
    var o = ORGANS[state.stage];
    var panel = $('panel');
    panel.innerHTML = '';
    panel.appendChild(document.createElement('h3')).textContent = 'Stop ' + o.n + ' of ' + ORGANS.length + ': ' + o.name;
    o.text.forEach(function (t) { panel.appendChild(document.createElement('p')).textContent = t; });
  }

  function arrive(i) {
    state.stage = i;
    state.phase = 'dwell';
    state.clock = 0;
    showInfo();
    update();
  }

  function tick(ts) {
    if (state.lastTs === null) state.lastTs = ts;
    var dt = Math.min(0.05, (ts - state.lastTs) / 1000);
    state.lastTs = ts;
    if (state.playing) {
      state.clock += dt;
      if (state.phase === 'dwell' && state.clock >= DWELL) {
        if (state.stage >= ORGANS.length - 1) {
          state.playing = false;
        } else {
          state.phase = 'travel';
          state.clock = 0;
        }
      } else if (state.phase === 'travel' && state.clock >= TRAVEL) {
        arrive(state.stage + 1);
      }
      update();
    }
    requestAnimationFrame(tick);
  }

  function setMode(mode) {
    state.mode = mode;
    $('mode-explore').setAttribute('aria-pressed', String(mode === 'explore'));
    $('mode-test').setAttribute('aria-pressed', String(mode === 'test'));
    $('explore-panel').hidden = mode !== 'explore';
    $('test-panel').hidden = mode !== 'test';
    if (mode === 'test') {
      state.playing = false;
      update();
      document.querySelectorAll('#body .plant-part').forEach(function (g) { g.classList.remove('selected'); });
      if (!state.built) {
        Activities.order($('order-activity'), {
          items: ORGANS.map(function (o) { return { label: o.name }; }),
          firstHint: 'Food enters the body through the mouth.'
        });
        Activities.match($('function-activity'), {
          prompt: 'What happens there',
          rows: ORGANS.map(function (o) { return { prompt: o.name, answer: o.does }; })
        });
        state.built = true;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    build();
    $('play-btn').addEventListener('click', function () {
      if (!state.playing && state.stage >= ORGANS.length - 1 && state.phase === 'dwell') arrive(0);
      state.started = true;
      state.playing = !state.playing;
      update();
    });
    $('next-btn').addEventListener('click', function () {
      state.started = true;
      state.playing = false;
      if (state.stage < ORGANS.length - 1) arrive(state.stage + 1);
    });
    function pick(e) {
      var g = e.target.closest && e.target.closest('.plant-part');
      if (!g || state.mode !== 'explore') return;
      state.playing = false;
      state.started = true;
      ORGANS.forEach(function (o, i) { if (o.id === g.getAttribute('data-organ')) arrive(i); });
    }
    $('body').addEventListener('click', pick);
    $('body').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); }
    });
    $('mode-explore').addEventListener('click', function () { setMode('explore'); });
    $('mode-test').addEventListener('click', function () { setMode('test'); });

    var body = $('summary-body');
    ORGANS.forEach(function (o) {
      var tr = document.createElement('tr');
      [o.n + '. ' + o.name, o.does + '.', o.digests].forEach(function (v, i) {
        var cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row';
        cell.textContent = v;
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });

    arrive(0);
    requestAnimationFrame(tick);
  });

  // exposed for quick checks in the browser console
  window.digestionData = { ORGANS: ORGANS, along: along };
})();
