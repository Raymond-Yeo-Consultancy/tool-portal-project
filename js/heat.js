/*
 * Heat and Temperature (Primary 4, Energy)
 * Two experiments:
 *   flow  – a hot block touches a cold block of the same size and material.
 *           Heat flows from the hotter block to the colder one until both are
 *           at the same temperature (half-way between, as the blocks match).
 *           Each temperature moves towards the final one, quickly at first:
 *             T(t) = final + (start − final) × e^(−t / 2 minutes)
 *   spoon – metal, plastic and wooden spoons stand in hot water with butter
 *           on their handles. Only the metal spoon (a good conductor of heat)
 *           melts its butter within three minutes.
 */
(function () {
  var MINUTES = 10; // length of the heat-flow experiment
  var FLOW_SECONDS = 7; // how long it plays on screen
  var SPOONS = [
    { id: 'metal', name: 'Metal spoon', color: '#9aa4b5', melt: 20, reach: 1 },
    { id: 'plastic', name: 'Plastic spoon', color: '#4fb3a5', melt: null, reach: 0.22 },
    { id: 'wood', name: 'Wooden spoon', color: '#b98652', melt: null, reach: 0.16 }
  ];
  var SPOON_TIME = 180; // seconds of the spoon experiment
  var SPOON_SECONDS = 9; // how long it plays on screen

  var state = {
    mode: 'flow',
    hot: 80, cold: 20,
    time: 0, // minutes (flow) or seconds (spoon) into the experiment
    running: false, done: false,
    samples: []
  };
  var $ = function (id) { return document.getElementById(id); };

  function finalTemp() { return (state.hot + state.cold) / 2; }
  function tempAt(start, minutes) {
    var f = finalTemp();
    return f + (start - f) * Math.exp(-minutes / 2);
  }

  // blue for cold through to red for hot
  function tempColor(t) {
    var p = Math.max(0, Math.min(1, t / 100));
    var c = [31 + (204 - 31) * p, 99 + (58 - 99) * p, 214 + (31 - 214) * p];
    return 'rgb(' + c.map(Math.round).join(',') + ')';
  }

  function label(x, y, text, size, anchor) {
    return '<text class="svg-text" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" style="font-size:' + (size || 15) + 'px">' + text + '</text>';
  }

  /* ---------- hot meets cold ---------- */
  function thermometer(x, temp) {
    var top = 34, bottom = 150;
    var level = bottom - (temp / 100) * (bottom - top);
    return '<rect x="' + (x - 7) + '" y="' + (top - 8) + '" width="14" height="' + (bottom - top + 14) + '" rx="7" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>' +
      '<rect x="' + (x - 3.5) + '" y="' + level + '" width="7" height="' + (bottom - level + 8) + '" style="fill:' + tempColor(temp) + '"/>' +
      '<circle cx="' + x + '" cy="' + (bottom + 12) + '" r="11" style="fill:' + tempColor(temp) + ';stroke:var(--ink);stroke-width:2"/>' +
      label(x, 18, temp.toFixed(0) + ' °C', 17);
  }

  function drawFlow() {
    var together = state.running || state.done;
    var th = together ? tempAt(state.hot, state.time) : state.hot;
    var tc = together ? tempAt(state.cold, state.time) : state.cold;
    var gap = together ? 0 : 34;
    var lx = 110 - gap / 2, rx = 200 + gap / 2;
    var s = '';
    s += '<rect x="' + lx + '" y="170" width="90" height="70" style="fill:' + tempColor(th) + ';stroke:var(--ink);stroke-width:2"/>';
    s += '<rect x="' + rx + '" y="170" width="90" height="70" style="fill:' + tempColor(tc) + ';stroke:var(--ink);stroke-width:2"/>';
    s += '<text x="' + (lx + 45) + '" y="211" text-anchor="middle" style="font:700 15px var(--font);fill:#ffffff">Block A</text>';
    s += '<text x="' + (rx + 45) + '" y="211" text-anchor="middle" style="font:700 15px var(--font);fill:#ffffff">Block B</text>';
    s += thermometer(lx + 45, th) + thermometer(rx + 45, tc);
    // heat flow arrow: bigger while the temperature difference is bigger
    var diff = th - tc;
    if (together && diff > 1) {
      var len = 14 + diff * 0.5;
      s += '<line x1="' + (200 - len / 2) + '" y1="150" x2="' + (200 + len / 2 - 8) + '" y2="150" style="stroke:var(--text);stroke-width:5"/>' +
        '<polygon points="' + (200 + len / 2 + 4) + ',150 ' + (200 + len / 2 - 10) + ',141 ' + (200 + len / 2 - 10) + ',159" style="fill:var(--text)"/>' +
        label(200, 134, 'heat', 15);
    }
    if (together) s += label(350, 205, 'Time: ' + state.time.toFixed(0) + ' min', 15);
    return s;
  }

  function drawGraph() {
    var W = 360, H = 230, left = 46, right = 12, top = 12, bottom = 44;
    var gx = function (m) { return left + m / MINUTES * (W - left - right); };
    var gy = function (t) { return H - bottom - t / 100 * (H - top - bottom); };
    var s = '';
    for (var t = 0; t <= 100; t += 20) {
      s += '<line x1="' + left + '" y1="' + gy(t) + '" x2="' + (W - right) + '" y2="' + gy(t) + '" style="stroke:var(--border);stroke-width:1"/>' +
        '<text class="svg-text" x="' + (left - 8) + '" y="' + (gy(t) + 4) + '" text-anchor="end" style="font-size:12px;font-weight:400">' + t + '</text>';
    }
    for (var m = 0; m <= MINUTES; m += 2) {
      s += '<text class="svg-text" x="' + gx(m) + '" y="' + (H - bottom + 18) + '" text-anchor="middle" style="font-size:12px;font-weight:400">' + m + '</text>';
    }
    s += '<path d="M' + left + ' ' + top + ' V' + (H - bottom) + ' H' + (W - right) + '" style="fill:none;stroke:var(--ink);stroke-width:2"/>';
    s += label((left + W - right) / 2, H - 8, 'Time (minutes)', 13);
    s += '<text class="svg-text" transform="rotate(-90)" x="' + (-(top + H - bottom) / 2) + '" y="14" text-anchor="middle" style="font-size:13px">Temperature (°C)</text>';
    if (state.samples.length > 1) {
      [['a', 'var(--e-heat)', ''], ['b', 'var(--e-kinetic)', ';stroke-dasharray:6 4']].forEach(function (k) {
        s += '<polyline points="' + state.samples.map(function (p) { return gx(p.m).toFixed(1) + ',' + gy(p[k[0]]).toFixed(1); }).join(' ') +
          '" style="fill:none;stroke:' + k[1] + ';stroke-width:3' + k[2] + '"/>';
      });
    }
    $('graph').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graph of temperature against time for the two blocks. Block A starts hot and cools; Block B starts cold and warms, until both reach the same temperature.">' + s + '</svg>';
  }

  /* ---------- spoon race ---------- */
  function drawSpoons() {
    var s = '';
    // beaker of hot water
    s += '<rect x="96" y="150" width="228" height="86" style="fill:' + tempColor(85) + ';opacity:0.3"/>';
    s += '<path class="svg-ink" d="M90 118 L96 126 V236 H324 V126 L330 118"/>';
    s += label(210, 228, 'Hot water', 14);
    SPOONS.forEach(function (sp, i) {
      var x = 140 + i * 70, top = 34, bottom = 214;
      var length = bottom - top;
      var warmed = Math.min(1, state.time / (sp.melt || SPOON_TIME) * sp.reach) * (150 - top) / length + (bottom - 150) / length;
      // spoon handle, then the heated part travelling up from the water
      s += '<line x1="' + x + '" y1="' + top + '" x2="' + x + '" y2="' + bottom + '" style="stroke:var(--ink);stroke-width:12;stroke-linecap:round"/>';
      s += '<line x1="' + x + '" y1="' + top + '" x2="' + x + '" y2="' + bottom + '" style="stroke:' + sp.color + ';stroke-width:8;stroke-linecap:round"/>';
      s += '<line x1="' + x + '" y1="' + (bottom - length * warmed) + '" x2="' + x + '" y2="' + bottom + '" style="stroke:' + tempColor(85) + ';stroke-width:8;stroke-linecap:round;opacity:0.8"/>';
      // butter and bead near the top of the handle
      var melted = sp.melt !== null && state.time >= sp.melt;
      var fall = melted ? Math.min(1, (state.time - sp.melt) / 8) : 0;
      if (!melted) s += '<ellipse cx="' + (x + 12) + '" cy="' + (top + 14) + '" rx="9" ry="7" style="fill:var(--e-light);stroke:var(--ink);stroke-width:1.5"/>';
      else s += '<path d="M' + (x + 7) + ' ' + (top + 12) + ' q4 ' + (10 + fall * 30) + ' 1 ' + (20 + fall * 40) + '" style="fill:none;stroke:var(--e-light);stroke-width:4;stroke-linecap:round"/>';
      s += '<circle cx="' + (x + 22) + '" cy="' + (top + 14 + fall * 96) + '" r="5" style="fill:var(--ink)"/>';
      s += label(x, 18, sp.name.split(' ')[0], 14);
    });
    s += label(378, 60, 'Time', 14) + label(378, 82, state.time.toFixed(0) + ' s', 18);
    s += label(46, 60, 'butter', 13) + label(46, 76, 'and bead', 13);
    s += '<path d="M72 62 L142 50" style="stroke:var(--ink-soft);stroke-width:1.5"/>';
    return s;
  }

  /* ---------- page ---------- */
  function draw() {
    $('scene').innerHTML = '<svg viewBox="0 0 420 252" role="img" aria-label="' +
      (state.mode === 'flow' ? 'A hot block and a cold block with thermometers.' : 'Metal, plastic and wooden spoons standing in hot water, each with butter and a bead on its handle.') +
      '">' + (state.mode === 'flow' ? drawFlow() : drawSpoons()) + '</svg>';
    if (state.mode === 'flow') drawGraph();
  }

  function setBusy(busy) {
    document.querySelectorAll('#heat-controls button, #mode-choices button').forEach(function (b) { b.disabled = busy; });
  }

  function run() {
    if (state.running) return;
    var total = state.mode === 'flow' ? MINUTES : SPOON_TIME;
    var seconds = state.mode === 'flow' ? FLOW_SECONDS : SPOON_SECONDS;
    state.running = true;
    state.done = false;
    state.time = 0;
    state.samples = [];
    setBusy(true);
    $('result').textContent = state.mode === 'flow' ? 'The blocks are touching. Watch the thermometers…' : 'Heat is travelling up the spoons…';
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / (seconds * 1000));
      state.time = p * total;
      if (state.mode === 'flow') state.samples.push({ m: state.time, a: tempAt(state.hot, state.time), b: tempAt(state.cold, state.time) });
      draw();
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        state.running = false;
        state.done = true;
        setBusy(false);
        finish();
      }
    }
    requestAnimationFrame(step);
  }

  function finish() {
    if (state.mode === 'flow') {
      $('result').innerHTML = 'Heat flowed from the hotter block to the colder block. Block A <strong>lost heat</strong> and cooled from ' + state.hot +
        ' °C. Block B <strong>gained heat</strong> and warmed from ' + state.cold + ' °C. Both ended at <strong>' + finalTemp().toFixed(0) + ' °C</strong>.';
    } else {
      $('result').innerHTML = 'Only the butter on the <strong>metal spoon</strong> melted (after 20 s). Metal is a <strong>good conductor of heat</strong>. Plastic and wood are <strong>poor conductors of heat</strong>.';
      renderSpoonTable(true);
    }
  }

  function renderSpoonTable(done) {
    var body = $('spoon-body');
    body.innerHTML = '';
    SPOONS.forEach(function (sp) {
      var tr = document.createElement('tr');
      [sp.name, !done ? '–' : sp.melt !== null ? 'Yes, after ' + sp.melt + ' s' : 'No, not after ' + (SPOON_TIME / 60) + ' minutes',
        !done ? '–' : sp.melt !== null ? 'Good conductor of heat' : 'Poor conductor of heat'].forEach(function (v, i) {
        var cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row';
        cell.textContent = v;
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
  }

  function reset() {
    state.time = 0;
    state.done = false;
    state.samples = [];
    $('result').textContent = state.mode === 'flow'
      ? 'Block A is at ' + state.hot + ' °C and Block B is at ' + state.cold + ' °C. Put them together.'
      : 'Each spoon has a blob of butter holding a bead. Start the experiment.';
    draw();
    if (state.mode === 'spoon') renderSpoonTable(false);
  }

  function pressGroup(id, attr, value) {
    document.querySelectorAll('#' + id + ' button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(value)));
    });
  }

  function setMode(mode) {
    state.mode = mode;
    pressGroup('mode-choices', 'data-mode', mode);
    $('flow-controls').hidden = mode !== 'flow';
    $('spoon-controls').hidden = mode !== 'spoon';
    $('graph-card').hidden = mode !== 'flow';
    $('spoon-card').hidden = mode !== 'spoon';
    reset();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#mode-choices button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
    document.querySelectorAll('#hot-choices button').forEach(function (b) {
      b.addEventListener('click', function () { state.hot = Number(b.getAttribute('data-temp')); pressGroup('hot-choices', 'data-temp', state.hot); reset(); });
    });
    document.querySelectorAll('#cold-choices button').forEach(function (b) {
      b.addEventListener('click', function () { state.cold = Number(b.getAttribute('data-temp')); pressGroup('cold-choices', 'data-temp', state.cold); reset(); });
    });
    $('together-btn').addEventListener('click', run);
    $('spoon-btn').addEventListener('click', run);
    document.querySelectorAll('.reset-btn').forEach(function (b) { b.addEventListener('click', reset); });
    setMode('flow');
  });

  // exposed for quick checks in the browser console
  window.heatModel = {
    SPOONS: SPOONS,
    check: function (hot, cold) {
      var keep = [state.hot, state.cold];
      state.hot = hot; state.cold = cold;
      var out = { final: finalTemp(), aEnd: tempAt(hot, MINUTES), bEnd: tempAt(cold, MINUTES), aMid: tempAt(hot, 2), bMid: tempAt(cold, 2) };
      state.hot = keep[0]; state.cold = keep[1];
      return out;
    }
  };
})();
