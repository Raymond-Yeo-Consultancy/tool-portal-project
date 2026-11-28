/*
 * Water Cycle and Changes of State (Primary 5, Cycles)
 * Three activities, chosen with the buttons at the top:
 *   state – heat ice until it boils, or cool water until it freezes, with a
 *           live temperature-time graph. The temperature stays the same
 *           while water changes state (0 °C melting/freezing, 100 °C boiling).
 *   cycle – an animated water cycle; tap a process to read about it.
 *   evap  – a fair test of what makes water evaporate faster.
 */
(function () {
  /* ---------- 1. changes of state ---------- */
  // each run is a list of stages: minutes it lasts, start and end temperature, and what is happening
  var RUNS = {
    heat: [
      { mins: 1, from: -10, to: 0, label: 'Ice is warming up', state: 'Solid (ice)' },
      { mins: 3, from: 0, to: 0, label: 'Melting: ice is changing into water', state: 'Solid and liquid', change: 'melt' },
      { mins: 5, from: 0, to: 100, label: 'Water is warming up', state: 'Liquid (water)' },
      { mins: 3, from: 100, to: 100, label: 'Boiling: water is changing into steam', state: 'Liquid and gas', change: 'boil' }
    ],
    cool: [
      { mins: 4, from: 60, to: 0, label: 'Water is cooling down', state: 'Liquid (water)' },
      { mins: 3, from: 0, to: 0, label: 'Freezing: water is changing into ice', state: 'Liquid and solid', change: 'freeze' },
      { mins: 1, from: 0, to: -10, label: 'Ice is cooling down', state: 'Solid (ice)' }
    ]
  };
  var GRAPH_MINUTES = 12;
  var PLAY_SECONDS_PER_MINUTE = 1.1;

  function total(run) { return RUNS[run].reduce(function (a, s) { return a + s.mins; }, 0); }

  // where we are in a run at a given minute: stage, temperature, progress through the stage
  function at(run, minute) {
    var t = minute;
    for (var i = 0; i < RUNS[run].length; i++) {
      var st = RUNS[run][i];
      if (t <= st.mins || i === RUNS[run].length - 1) {
        var p = Math.max(0, Math.min(1, t / st.mins));
        return { stage: st, index: i, p: p, temp: st.from + (st.to - st.from) * p };
      }
      t -= st.mins;
    }
  }

  /* ---------- 2. water cycle ---------- */
  var PROCESSES = [
    { id: 'evaporation', name: 'Evaporation', text: 'Heat from the Sun warms the water in seas, rivers and lakes. The water evaporates: it changes from liquid water into water vapour, a gas we cannot see. The water gains heat. Evaporation can happen at any temperature.' },
    { id: 'condensation', name: 'Condensation', text: 'High in the sky the air is cooler. The water vapour loses heat and condenses: it changes into tiny water droplets. The droplets form clouds.' },
    { id: 'rain', name: 'Rain', text: 'The tiny water droplets in the clouds join together. They become bigger and heavier, and fall as rain.' },
    { id: 'collection', name: 'Flowing back', text: 'Rain water flows into rivers, lakes and reservoirs, and back to the sea. Then the cycle starts again. The same water is used again and again.' }
  ];

  /* ---------- 3. evaporation test ---------- */
  var BASE_ML = 6; // water evaporated in 3 hours when cool, still and in a narrow container
  var START_ML = 100;
  function evaporated(warm, windy, wide) {
    return BASE_ML * (warm ? 2 : 1) * (windy ? 2 : 1) * (wide ? 2 : 1);
  }

  var state = {
    mode: 'state',
    run: 'heat', minute: 0, running: false, done: false, samples: [],
    process: null,
    warm: false, windy: false, wide: false, evapT: 0, evapRuns: [], evapDone: false
  };
  var $ = function (id) { return document.getElementById(id); };

  function label(x, y, text, size, anchor) {
    return '<text class="svg-text" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" style="font-size:' + (size || 15) + 'px">' + text + '</text>';
  }

  /* ---------- drawing: changes of state ---------- */
  function drawState() {
    var a = at(state.run, state.minute);
    var change = a.stage.change;
    // how much is ice (0 to 1) and how much has boiled away
    var ice = a.stage.state.indexOf('Solid (ice)') === 0 ? 1 : change === 'melt' ? 1 - a.p : change === 'freeze' ? a.p : 0;
    var boiled = change === 'boil' ? a.p * 0.25 : 0;
    var s = '';
    var bx = 130, bw = 140, floor = 196, level = 72 * (1 - boiled);
    // water
    if (ice < 1) {
      s += '<rect x="' + bx + '" y="' + (floor - level) + '" width="' + bw + '" height="' + level + '" style="fill:var(--e-kinetic);opacity:' + (0.45 * (1 - ice * 0.6)) + '"/>';
    }
    // ice cubes shrink as they melt
    if (ice > 0) {
      var size = 16 + 22 * Math.sqrt(ice);
      [[150, 0], [196, -4], [238, 0], [172, -30], [218, -32]].forEach(function (c) {
        s += '<rect x="' + (c[0] - size / 2) + '" y="' + (floor - 4 + c[1] * Math.sqrt(ice) - size) + '" width="' + size + '" height="' + size + '" rx="4" style="fill:var(--surface);stroke:var(--e-kinetic);stroke-width:2.5;opacity:0.95"/>';
      });
    }
    // bubbles and steam while boiling
    if (change === 'boil') {
      for (var i = 0; i < 7; i++) {
        var ph = (state.minute * 3 + i * 0.37) % 1;
        s += '<circle cx="' + (146 + i * 18) + '" cy="' + (floor - 6 - ph * (level - 10)) + '" r="' + (3 + ph * 3) + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/>';
      }
      for (var k = 0; k < 3; k++) {
        var up = (state.minute * 1.5 + k * 0.33) % 1;
        s += '<path d="M' + (170 + k * 30) + ' ' + (112 - up * 40) + ' q10 -10 0 -20 q-10 -10 0 -20" style="fill:none;stroke:var(--ink-soft);stroke-width:4;stroke-linecap:round;opacity:' + (1 - up) + '"/>';
      }
      s += label(310, 60, 'steam', 14);
    }
    // beaker
    s += '<path class="svg-ink" d="M' + (bx - 6) + ' 96 L' + bx + ' 104 V' + floor + ' H' + (bx + bw) + ' V104 L' + (bx + bw + 6) + ' 96"/>';
    // heater or freezer
    if (state.run === 'heat') {
      s += '<rect class="svg-fill" x="150" y="226" width="100" height="14" rx="3"/>';
      if (state.running || state.done) {
        [170, 200, 230].forEach(function (fx, i) {
          var fl = 1 + Math.sin(state.minute * 20 + i) * 0.15;
          s += '<path d="M' + fx + ' 226 q-10 -12 0 -' + (24 * fl) + ' q10 ' + (12 * fl) + ' 0 ' + (24 * fl) + ' Z" style="fill:var(--e-heat)"/>';
        });
      }
      s += '<line class="svg-ground" x1="110" y1="200" x2="290" y2="200"/><path class="svg-ink" d="M120 200 V240 M280 200 V240"/>';
      s += label(200, 258, 'Heating', 14);
    } else {
      s += '<rect x="96" y="76" width="208" height="150" rx="10" style="fill:none;stroke:var(--e-kinetic);stroke-width:3;stroke-dasharray:8 6"/>';
      s += label(200, 250, 'Inside a freezer', 14);
    }
    // thermometer
    var tx = 352, top = 40, bottom = 190;
    var y = bottom - (a.temp + 20) / 130 * (bottom - top);
    s += '<rect x="' + (tx - 7) + '" y="' + (top - 8) + '" width="14" height="' + (bottom - top + 14) + '" rx="7" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>';
    s += '<rect x="' + (tx - 3.5) + '" y="' + y + '" width="7" height="' + (bottom - y + 8) + '" style="fill:var(--e-heat)"/>';
    s += '<circle cx="' + tx + '" cy="' + (bottom + 12) + '" r="11" style="fill:var(--e-heat);stroke:var(--ink);stroke-width:2"/>';
    s += label(tx, 22, a.temp.toFixed(0) + ' °C', 17);
    return s;
  }

  function drawGraph() {
    var W = 360, H = 240, left = 46, right = 12, top = 12, bottom = 44;
    var gx = function (m) { return left + m / GRAPH_MINUTES * (W - left - right); };
    var gy = function (t) { return H - bottom - (t + 20) / 140 * (H - top - bottom); };
    var s = '';
    for (var t = -20; t <= 120; t += 20) {
      s += '<line x1="' + left + '" y1="' + gy(t) + '" x2="' + (W - right) + '" y2="' + gy(t) + '" style="stroke:' + (t === 0 || t === 100 ? 'var(--ink-soft)' : 'var(--border)') + ';stroke-width:1' + (t === 0 || t === 100 ? ';stroke-dasharray:5 4' : '') + '"/>' +
        '<text class="svg-text" x="' + (left - 8) + '" y="' + (gy(t) + 4) + '" text-anchor="end" style="font-size:12px;font-weight:400">' + t + '</text>';
    }
    for (var m = 0; m <= GRAPH_MINUTES; m += 2) {
      s += '<text class="svg-text" x="' + gx(m) + '" y="' + (H - bottom + 18) + '" text-anchor="middle" style="font-size:12px;font-weight:400">' + m + '</text>';
    }
    s += '<path d="M' + left + ' ' + top + ' V' + (H - bottom) + ' H' + (W - right) + '" style="fill:none;stroke:var(--ink);stroke-width:2"/>';
    s += label((left + W - right) / 2, H - 8, 'Time (minutes)', 13);
    s += '<text class="svg-text" transform="rotate(-90)" x="' + (-(top + H - bottom) / 2) + '" y="14" text-anchor="middle" style="font-size:13px">Temperature (°C)</text>';
    if (state.samples.length > 1) {
      s += '<polyline points="' + state.samples.map(function (p) { return gx(p.m).toFixed(1) + ',' + gy(p.t).toFixed(1); }).join(' ') + '" style="fill:none;stroke:var(--e-heat);stroke-width:3"/>';
    }
    $('graph').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graph of temperature against time. The line is flat at 0 degrees Celsius while ice melts or water freezes, and flat at 100 degrees Celsius while water boils.">' + s + '</svg>';
  }

  /* ---------- drawing: water cycle (built once, animated with CSS) ---------- */
  function buildCycle() {
    var s = '';
    s += '<g data-part="evaporation">' +
      '<circle cx="54" cy="52" r="26" style="fill:var(--e-light);stroke:var(--ink);stroke-width:2"/>' +
      '<g class="anim-glow"><path d="M54 14 V4 M54 90 V100 M16 52 H6 M92 52 H102 M27 25 L20 18 M81 79 L88 86 M81 25 L88 18 M27 79 L20 86" style="stroke:var(--e-light);stroke-width:4;stroke-linecap:round"/></g>' +
      [70, 120, 170].map(function (x, i) {
        return '<g class="anim-rise" style="animation-delay:' + (i * 0.5) + 's"><path d="M' + x + ' 214 q10 -10 0 -20 q-10 -10 0 -20" style="fill:none;stroke:var(--e-kinetic);stroke-width:4;stroke-linecap:round"/></g>';
      }).join('') + '</g>';
    s += '<g data-part="collection">' +
      '<polygon points="230,280 300,150 350,206 400,150 400,280" style="fill:var(--ramp);stroke:var(--ink);stroke-width:2"/>' +
      '<path class="anim-flow" d="M304 164 Q292 206 268 232 Q256 246 236 252" style="fill:none;stroke:var(--e-kinetic);stroke-width:5"/>' +
      '<rect x="0" y="236" width="246" height="44" style="fill:var(--e-kinetic);opacity:0.55"/>' +
      '<path d="M0 236 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t6 0" style="fill:none;stroke:var(--e-kinetic);stroke-width:3"/></g>';
    s += '<g data-part="condensation">' +
      '<g style="fill:var(--surface);stroke:var(--ink);stroke-width:2"><ellipse cx="290" cy="64" rx="40" ry="22"/><ellipse cx="250" cy="74" rx="30" ry="18"/><ellipse cx="330" cy="76" rx="32" ry="18"/></g>' +
      '<rect x="230" y="66" width="124" height="24" rx="12" style="fill:var(--surface)"/></g>';
    s += '<g data-part="rain">' + [262, 290, 318, 346].map(function (x, i) {
      return '<line class="anim-rain" style="animation-delay:' + (i * 0.22) + 's;stroke:var(--e-kinetic);stroke-width:3.5;stroke-linecap:round" x1="' + x + '" y1="96" x2="' + (x - 5) + '" y2="110"/>';
    }).join('') + '</g>';
    s += label(130, 150, '1', 16) + label(290, 40, '2', 16) + label(372, 118, '3', 16) + label(256, 214, '4', 16);
    $('cycle').innerHTML = '<svg viewBox="0 0 400 280" role="img" aria-label="The water cycle: water evaporates from the sea, condenses into clouds, falls as rain and flows back to the sea.">' + s + '</svg>';
  }

  function showProcess(id) {
    state.process = id;
    var svg = $('cycle').querySelector('svg');
    svg.classList.toggle('highlighting', !!id);
    svg.querySelectorAll('[data-part]').forEach(function (g) { g.classList.toggle('lit', g.getAttribute('data-part') === id); });
    document.querySelectorAll('#process-choices button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-process') === id)); });
    var p = PROCESSES.filter(function (x) { return x.id === id; })[0];
    $('process-title').textContent = p ? (PROCESSES.indexOf(p) + 1) + '. ' + p.name : 'The water cycle';
    $('process-text').textContent = p ? p.text : 'Water moves between the sea, the air and the land in a never-ending cycle. Tap a number below to read about each step.';
  }

  /* ---------- drawing: evaporation test ---------- */
  function drawEvap() {
    var gone = state.evapDone || state.running ? evaporated(state.warm, state.windy, state.wide) * state.evapT : 0;
    var left = START_ML - gone;
    var w = state.wide ? 220 : 90, fullH = state.wide ? 34 : 83; // same volume: width x height is the same
    var x = 200 - w / 2, floor = 214;
    var h = fullH * left / START_ML;
    var s = '';
    s += '<rect x="' + x + '" y="' + (floor - h) + '" width="' + w + '" height="' + h + '" style="fill:var(--e-kinetic);opacity:0.5"/>';
    s += '<line x1="' + x + '" y1="' + (floor - h) + '" x2="' + (x + w) + '" y2="' + (floor - h) + '" style="stroke:var(--e-kinetic);stroke-width:2.5"/>';
    s += '<line x1="' + (x - 10) + '" y1="' + (floor - fullH) + '" x2="' + x + '" y2="' + (floor - fullH) + '" style="stroke:var(--ink);stroke-width:1.5"/>' + label(x - 14, floor - fullH + 5, 'start', 12, 'end');
    s += '<path class="svg-ink" d="M' + x + ' ' + (floor - fullH - 14) + ' V' + floor + ' H' + (x + w) + ' V' + (floor - fullH - 14) + '"/>';
    s += '<line class="svg-ground" x1="20" y1="' + floor + '" x2="380" y2="' + floor + '"/>';
    // rising water vapour: more wisps when evaporation is faster
    if (state.running) {
      var n = Math.min(6, Math.round(evaporated(state.warm, state.windy, state.wide) / 8) + 1);
      for (var i = 0; i < n; i++) {
        var up = (state.evapT * 4 + i / n) % 1;
        var vx = x + w * (i + 0.5) / n + (state.windy ? up * 40 : 0);
        s += '<path d="M' + vx + ' ' + (floor - h - 8 - up * 46) + ' q8 -8 0 -16 q-8 -8 0 -16" style="fill:none;stroke:var(--e-kinetic);stroke-width:3;stroke-linecap:round;opacity:' + (1 - up) + '"/>';
      }
    }
    // surroundings
    s += state.warm ? '<circle cx="56" cy="50" r="24" style="fill:var(--e-light);stroke:var(--ink);stroke-width:2"/>' + label(56, 96, 'warm place', 13)
      : '<circle cx="56" cy="50" r="24" style="fill:var(--surface);stroke:var(--ink-soft);stroke-width:2;stroke-dasharray:5 4"/>' + label(56, 96, 'cool place', 13);
    if (state.windy) {
      s += '<g' + (state.running ? ' class="anim-spin-fast"' : '') + '><ellipse cx="344" cy="56" rx="30" ry="7" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:1.5"/><ellipse cx="344" cy="56" rx="7" ry="30" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:1.5"/></g>' +
        '<circle class="svg-fill" cx="344" cy="56" r="7"/>' + label(344, 106, 'fan on', 13);
    } else {
      s += label(344, 60, 'no wind', 13);
    }
    s += label(200, 244, 'Water left: ' + left.toFixed(0) + ' ml', 16);
    return s;
  }

  /* ---------- page ---------- */
  function draw() {
    if (state.mode === 'state') {
      $('scene').innerHTML = '<svg viewBox="0 0 400 266" role="img" aria-label="A beaker of water with a thermometer.">' + drawState() + '</svg>';
      drawGraph();
      var a = at(state.run, state.minute);
      $('stage-label').textContent = state.running || state.done ? a.stage.label : (state.run === 'heat' ? 'Ice at −10 °C, ready to be heated' : 'Water at 60 °C, ready to be cooled');
      $('state-label').textContent = a.stage.state;
    } else if (state.mode === 'evap') {
      $('scene').innerHTML = '<svg viewBox="0 0 400 256" role="img" aria-label="A container of water in a ' + (state.warm ? 'warm' : 'cool') + ' place, ' + (state.windy ? 'with a fan blowing' : 'with no wind') + '.">' + drawEvap() + '</svg>';
    }
  }

  function setBusy(busy) {
    document.querySelectorAll('#lab-controls button, #mode-choices button').forEach(function (b) { b.disabled = busy; });
  }

  function animate(seconds, onFrame, done) {
    state.running = true;
    setBusy(true);
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / (seconds * 1000));
      onFrame(p);
      draw();
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        state.running = false;
        setBusy(false);
        done();
      }
    }
    requestAnimationFrame(step);
  }

  function runState() {
    var mins = total(state.run);
    state.samples = [];
    state.done = false;
    $('result').textContent = state.run === 'heat' ? 'Heating… watch the thermometer and the graph.' : 'Cooling… watch the thermometer and the graph.';
    animate(mins * PLAY_SECONDS_PER_MINUTE, function (p) {
      state.minute = p * mins;
      state.samples.push({ m: state.minute, t: at(state.run, state.minute).temp });
    }, function () {
      state.done = true;
      draw();
      $('result').innerHTML = state.run === 'heat'
        ? 'The temperature stayed at <strong>0 °C</strong> while the ice was melting, and at <strong>100 °C</strong> while the water was boiling. The flat parts of the graph show a change of state.'
        : 'The temperature stayed at <strong>0 °C</strong> while the water was freezing. The flat part of the graph shows a change of state.';
    });
  }

  function resetState() {
    state.minute = 0;
    state.samples = [];
    state.done = false;
    $('result').textContent = state.run === 'heat' ? 'Press Start to heat the ice.' : 'Press Start to cool the water.';
    draw();
  }

  function runEvap() {
    state.evapDone = false;
    var prev = state.evapRuns[state.evapRuns.length - 1];
    var changed = prev ? (prev.warm !== state.warm) + (prev.windy !== state.windy) + (prev.wide !== state.wide) : 0;
    $('fair-test-hint').hidden = changed < 2;
    $('result').textContent = 'Three hours pass…';
    animate(3, function (p) { state.evapT = p; }, function () {
      state.evapDone = true;
      var ml = evaporated(state.warm, state.windy, state.wide);
      state.evapRuns.push({ warm: state.warm, windy: state.windy, wide: state.wide, ml: ml });
      $('result').innerHTML = 'In 3 hours, <strong>' + ml + ' ml</strong> of water evaporated. ' + (START_ML - ml) + ' ml is left.';
      renderEvapTable();
      draw();
    });
  }

  function renderEvapTable() {
    var body = $('evap-body');
    body.innerHTML = '';
    if (!state.evapRuns.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="5">No runs yet. Your results will appear here.</td></tr>';
      return;
    }
    state.evapRuns.forEach(function (r, i) {
      var tr = document.createElement('tr');
      [String(i + 1), r.warm ? 'Warm' : 'Cool', r.windy ? 'Windy' : 'No wind', r.wide ? 'Large' : 'Small', r.ml + ' ml'].forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  function pressGroup(id, attr, value) {
    document.querySelectorAll('#' + id + ' button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(value)));
    });
  }

  function setMode(mode) {
    state.mode = mode;
    pressGroup('mode-choices', 'data-mode', mode);
    $('lab').hidden = mode === 'cycle';
    $('cycle-lab').hidden = mode !== 'cycle';
    $('state-controls').hidden = mode !== 'state';
    $('evap-controls').hidden = mode !== 'evap';
    $('graph-card').hidden = mode !== 'state';
    $('evap-card').hidden = mode !== 'evap';
    $('state-readout').hidden = mode !== 'state';
    if (mode === 'state') resetState();
    if (mode === 'evap') {
      state.evapT = 0;
      state.evapDone = false;
      $('result').textContent = 'Choose the conditions, then press Start. Each container starts with 100 ml of water.';
      draw();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildCycle();
    var box = $('process-choices');
    PROCESSES.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.setAttribute('data-process', p.id);
      b.setAttribute('aria-pressed', 'false');
      b.textContent = (i + 1) + '. ' + p.name;
      b.addEventListener('click', function () { showProcess(state.process === p.id ? null : p.id); });
      box.appendChild(b);
    });
    showProcess(null);

    document.querySelectorAll('#mode-choices button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
    document.querySelectorAll('#run-choices button').forEach(function (b) {
      b.addEventListener('click', function () { state.run = b.getAttribute('data-run'); pressGroup('run-choices', 'data-run', state.run); resetState(); });
    });
    $('state-btn').addEventListener('click', runState);
    $('state-reset').addEventListener('click', resetState);

    [['temp-choices', 'data-warm', 'warm'], ['wind-choices', 'data-windy', 'windy'], ['area-choices', 'data-wide', 'wide']].forEach(function (g) {
      document.querySelectorAll('#' + g[0] + ' button').forEach(function (b) {
        b.addEventListener('click', function () {
          state[g[2]] = b.getAttribute(g[1]) === 'true';
          pressGroup(g[0], g[1], state[g[2]]);
          state.evapT = 0;
          state.evapDone = false;
          draw();
        });
      });
    });
    $('evap-btn').addEventListener('click', runEvap);
    $('evap-clear').addEventListener('click', function () {
      state.evapRuns = [];
      $('fair-test-hint').hidden = true;
      renderEvapTable();
    });
    renderEvapTable();
    setMode('state');
  });

  // exposed for quick checks in the browser console
  window.waterModel = { at: at, total: total, evaporated: evaporated, PROCESSES: PROCESSES };
})();
