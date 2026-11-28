/*
 * Materials Tester (Primary 3, Diversity)
 * Pick a material and run four animated tests on a strip of it:
 *   hammer – does it break easily?      bend  – is it flexible or stiff?
 *   water  – is it waterproof?          light – does light pass through?
 * Results fill a table. A short quiz asks which material suits a job.
 *
 * MATERIALS holds the answer for every test. Each strip has a fixed colour
 * (materials look the same in the light and dark themes) with a themed outline.
 */
(function () {
  var MATERIALS = {
    wood: { name: 'Wood', fill: '#b98652', opacity: 1, breaks: false, bends: false, waterproof: false, light: false },
    metal: { name: 'Metal', fill: '#9aa4b5', opacity: 1, breaks: false, bends: false, waterproof: true, light: false },
    plastic: { name: 'Clear plastic', fill: '#9fd6f5', opacity: 0.55, breaks: false, bends: true, waterproof: true, light: true },
    glass: { name: 'Glass', fill: '#cfeef7', opacity: 0.5, breaks: true, bends: false, waterproof: true, light: true },
    rubber: { name: 'Rubber', fill: '#55607a', opacity: 1, breaks: false, bends: true, waterproof: true, light: false },
    ceramic: { name: 'Ceramic', fill: '#f1e6d2', opacity: 1, breaks: true, bends: false, waterproof: true, light: false },
    fabric: { name: 'Cotton fabric', fill: '#d9695f', opacity: 1, breaks: false, bends: true, waterproof: false, light: false }
  };
  var ORDER = ['wood', 'metal', 'plastic', 'glass', 'rubber', 'ceramic', 'fabric'];

  var TESTS = {
    hammer: {
      name: 'Hammer test', column: 'Hit with a hammer',
      result: function (m) { return m.breaks ? 'Broke' : 'Did not break'; },
      say: function (m) { return m.breaks ? m.name + ' broke into pieces. It breaks easily.' : m.name + ' did not break. It is strong.'; }
    },
    bend: {
      name: 'Bend test', column: 'Bent',
      result: function (m) { return m.bends ? 'Bends (flexible)' : 'Does not bend (stiff)'; },
      say: function (m) { return m.bends ? m.name + ' bent easily. It is flexible.' : m.name + ' did not bend. It is stiff.'; }
    },
    water: {
      name: 'Water test', column: 'Water dripped on it',
      result: function (m) { return m.waterproof ? 'Waterproof' : 'Soaks up water'; },
      say: function (m) { return m.waterproof ? 'The water stayed on top of the ' + m.name.toLowerCase() + '. It is waterproof.' : m.name + ' soaked up the water. It is not waterproof.'; }
    },
    light: {
      name: 'Light test', column: 'Torch shone on it',
      result: function (m) { return m.light ? 'Light passes through' : 'No light passes'; },
      say: function (m) { return m.light ? 'Light passed through the ' + m.name.toLowerCase() + '. You can see through it.' : 'No light passed through the ' + m.name.toLowerCase() + '. You cannot see through it.'; }
    }
  };
  var TEST_ORDER = ['hammer', 'bend', 'water', 'light'];

  var JOBS = [
    { job: 'A raincoat', needs: 'It must be waterproof and flexible.', options: ['fabric', 'plastic', 'glass', 'wood'], answer: 'plastic' },
    { job: 'A window', needs: 'It must let light through and keep the rain out.', options: ['metal', 'wood', 'glass', 'fabric'], answer: 'glass' },
    { job: 'A towel', needs: 'It must soak up water and be flexible.', options: ['plastic', 'fabric', 'rubber', 'metal'], answer: 'fabric' },
    { job: 'The head of a hammer', needs: 'It must be strong and stiff.', options: ['glass', 'rubber', 'metal', 'fabric'], answer: 'metal' },
    { job: 'A bicycle tyre', needs: 'It must be flexible and waterproof, and must not break when it hits a bump.', options: ['glass', 'ceramic', 'rubber', 'wood'], answer: 'rubber' }
  ];

  var state = {
    material: 'wood',
    test: null, // test being shown
    t: 0, // 0..1 progress of the animation
    running: false,
    results: {}, // results[material][test] = true once run
    job: 0
  };
  var DURATION = 1700; // ms
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- drawing ---------- */
  function strip(d, m, w) {
    // a strip drawn along path d: outline first, then the material colour
    return '<path d="' + d + '" style="fill:none;stroke:var(--ink);stroke-width:' + (w + 4) + ';stroke-linecap:butt"/>' +
      '<path d="' + d + '" style="fill:none;stroke:var(--surface);stroke-width:' + w + '"/>' +
      '<path d="' + d + '" style="fill:none;stroke:' + m.fill + ';stroke-width:' + w + ';opacity:' + m.opacity + '"/>';
  }

  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }

  function drawHammer(m, t) {
    var hit = ease(t / 0.4); // hammer comes down
    var after = ease((t - 0.4) / 0.6);
    var broke = m.breaks && t >= 0.4;
    var s = '<rect class="svg-fill" x="118" y="164" width="18" height="56"/><rect class="svg-fill" x="264" y="164" width="18" height="56"/>';
    if (!broke) {
      s += strip('M110 156 H290', m, 12);
    } else {
      var drop = after * 46, tilt = after * 26;
      s += '<g transform="translate(0 ' + drop + ') rotate(' + tilt + ' 127 156)">' + strip('M110 156 H194', m, 12) + '</g>';
      s += '<g transform="translate(0 ' + drop + ') rotate(' + (-tilt) + ' 273 156)">' + strip('M206 156 H290', m, 12) + '</g>';
      s += '<path d="M188 138 l-10 -14 M200 134 v-18 M212 138 l10 -14" style="stroke:var(--error);stroke-width:3;stroke-linecap:round;opacity:' + (1 - after) + '"/>';
    }
    var y = 30 + hit * 96 + (broke ? after * 14 : -after * 34);
    s += '<rect x="196" y="' + (y - 70) + '" width="8" height="74" style="fill:var(--ramp);stroke:var(--ink);stroke-width:2"/>';
    s += '<rect x="176" y="' + y + '" width="48" height="22" rx="3" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>';
    return s;
  }

  function drawBend(m, t) {
    var push = ease(t / 0.6);
    var drop = m.bends ? push * 74 : push * 3;
    var s = '<rect class="svg-fill" x="70" y="104" width="46" height="116"/>';
    s += strip('M116 130 Q210 130 300 ' + (130 + drop), m, 12);
    // weight pushing the free end down
    var wy = 130 + drop - 44 - (1 - push) * 30;
    s += '<path d="M300 ' + (wy - 6) + ' v-22" style="stroke:var(--ink);stroke-width:2"/>';
    s += '<rect x="282" y="' + wy + '" width="36" height="34" rx="4" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>';
    if (!m.bends && t > 0.6) {
      s += '<text class="svg-text" x="300" y="80" text-anchor="middle" style="font-size:15px">stays straight</text>';
    }
    return s;
  }

  function drawWater(m, t) {
    var s = '<rect class="svg-fill" x="118" y="178" width="18" height="42"/><rect class="svg-fill" x="264" y="178" width="18" height="42"/>';
    s += strip('M110 168 H290', m, 16);
    // dropper
    s += '<rect class="svg-fill" x="193" y="24" width="14" height="40" rx="4"/><path class="svg-ink" d="M200 64 v10"/>';
    var water = 'var(--e-kinetic)';
    // three drops fall one after another
    [0, 0.2, 0.4].forEach(function (startAt, i) {
      var p = (t - startAt) / 0.2;
      if (p > 0 && p < 1) s += '<circle cx="200" cy="' + (78 + p * 76) + '" r="5" style="fill:' + water + '"/>';
      var landed = ease((t - startAt - 0.2) / 0.3);
      if (landed > 0) {
        if (m.waterproof) {
          // beads sit on top; the last one rolls off the edge
          var bx = [176, 222, 200][i] + (i === 2 ? ease((t - 0.75) / 0.25) * 96 : 0);
          var by = 156 + (i === 2 && bx > 290 ? (bx - 290) * 3 : 0);
          s += '<ellipse cx="' + bx + '" cy="' + by + '" rx="' + (5 + landed * 5) + '" ry="' + (5 - landed) + '" style="fill:' + water + '"/>';
        } else {
          s += '<ellipse cx="200" cy="168" rx="' + (10 + i * 16) * landed + '" ry="7" style="fill:' + water + ';opacity:0.55"/>';
        }
      }
    });
    return s;
  }

  function drawLight(m, t) {
    var reach = ease(t / 0.5);
    var s = '<rect class="svg-fill" x="336" y="50" width="10" height="170"/>';
    s += '<text class="svg-text" x="341" y="42" text-anchor="middle" style="font-size:14px">screen</text>';
    // torch
    s += '<rect class="svg-fill" x="34" y="118" width="50" height="24" rx="5"/><polygon class="svg-fill" points="84,114 100,108 100,152 84,146"/>';
    var beam = 'var(--e-light)';
    var toStrip = 100 + reach * 94;
    s += '<polygon points="100,112 ' + toStrip + ',' + (112 - (toStrip - 100) * 0.18) + ' ' + toStrip + ',' + (148 + (toStrip - 100) * 0.18) + ' 100,148" style="fill:' + beam + ';opacity:0.55"/>';
    if (m.light && t > 0.5) {
      var on = ease((t - 0.5) / 0.4);
      var x2 = 206 + on * 130;
      s += '<polygon points="206,93 ' + x2 + ',' + (93 - (x2 - 206) * 0.18) + ' ' + x2 + ',' + (167 + (x2 - 206) * 0.18) + ' 206,167" style="fill:' + beam + ';opacity:0.4"/>';
      if (on === 1) s += '<rect x="330" y="72" width="6" height="118" style="fill:' + beam + '"/>';
    }
    if (!m.light && t > 0.6) {
      s += '<rect x="330" y="72" width="6" height="118" style="fill:var(--ink)"/>';
      s += '<text class="svg-text" x="300" y="208" text-anchor="end" style="font-size:14px">shadow</text>';
    }
    s += strip('M200 62 V198', m, 12);
    return s;
  }

  var DRAW = { hammer: drawHammer, bend: drawBend, water: drawWater, light: drawLight };

  function draw() {
    var m = MATERIALS[state.material];
    var s = '<line class="svg-ground" x1="10" y1="220" x2="390" y2="220"/>';
    if (state.test) {
      s += DRAW[state.test](m, state.t);
    } else {
      s += '<rect class="svg-fill" x="118" y="164" width="18" height="56"/><rect class="svg-fill" x="264" y="164" width="18" height="56"/>' + strip('M110 156 H290', m, 12);
    }
    s += '<text class="svg-text" x="200" y="246" text-anchor="middle" style="font-size:16px">A strip of ' + m.name.toLowerCase() + '</text>';
    $('scene').innerHTML = '<svg viewBox="0 0 400 256" role="img" aria-label="A strip of ' + m.name.toLowerCase() +
      (state.test ? ' in the ' + TESTS[state.test].name.toLowerCase() : ' ready to be tested') + '.">' + s + '</svg>';
  }

  /* ---------- running a test ---------- */
  function run(test) {
    if (state.running) return;
    state.test = test;
    state.t = 0;
    state.running = true;
    setBusy(true);
    $('result').textContent = TESTS[test].name + ' on ' + MATERIALS[state.material].name.toLowerCase() + '…';
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      state.t = Math.min(1, (ts - start) / DURATION);
      draw();
      if (state.t < 1) {
        requestAnimationFrame(step);
      } else {
        state.running = false;
        setBusy(false);
        var r = state.results[state.material] = state.results[state.material] || {};
        r[test] = true;
        $('result').textContent = TESTS[test].say(MATERIALS[state.material]);
        renderTable();
      }
    }
    requestAnimationFrame(step);
  }

  function setBusy(busy) {
    document.querySelectorAll('#material-choices .choice, #test-choices .choice').forEach(function (b) { b.disabled = busy; });
  }

  function renderTable() {
    var body = $('results-body');
    body.innerHTML = '';
    ORDER.forEach(function (id) {
      var m = MATERIALS[id];
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = m.name;
      tr.appendChild(th);
      TEST_ORDER.forEach(function (t) {
        var td = document.createElement('td');
        td.textContent = state.results[id] && state.results[id][t] ? TESTS[t].result(m) : '–';
        tr.appendChild(td);
      });
      if (id === state.material) tr.className = 'current-row';
      body.appendChild(tr);
    });
  }

  /* ---------- quiz ---------- */
  function renderJob(picked) {
    var j = JOBS[state.job];
    $('job-title').textContent = 'Job ' + (state.job + 1) + ' of ' + JOBS.length + ': ' + j.job;
    $('job-needs').textContent = j.needs + ' Which material is best?';
    var box = $('job-options');
    box.innerHTML = '';
    j.options.forEach(function (id) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.textContent = MATERIALS[id].name;
      if (picked) {
        b.disabled = true;
        if (id === j.answer) b.classList.add('choice-right');
        else if (id === picked) b.classList.add('choice-wrong');
      }
      b.addEventListener('click', function () { renderJob(id); });
      box.appendChild(b);
    });
    var fb = $('job-feedback');
    if (!picked) {
      fb.textContent = '';
      fb.className = 'feedback';
    } else if (picked === j.answer) {
      fb.textContent = 'Correct! ' + MATERIALS[j.answer].name + ' is the best choice. ' + j.needs;
      fb.className = 'feedback good';
    } else {
      fb.textContent = 'Not the best choice. ' + j.needs + ' ' + MATERIALS[j.answer].name + ' does this best. Check your results table.';
      fb.className = 'feedback bad';
    }
    $('job-next').hidden = !picked;
    $('job-next').textContent = state.job === JOBS.length - 1 ? 'Start again' : 'Next job';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var mats = $('material-choices');
    ORDER.forEach(function (id) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.setAttribute('data-material', id);
      b.setAttribute('aria-pressed', String(id === state.material));
      var sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = MATERIALS[id].fill;
      sw.setAttribute('aria-hidden', 'true');
      b.appendChild(sw);
      b.appendChild(document.createTextNode(MATERIALS[id].name));
      b.addEventListener('click', function () {
        mats.querySelectorAll('.choice').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        state.material = id;
        state.test = null;
        $('result').textContent = 'Choose a test for the ' + MATERIALS[id].name.toLowerCase() + '.';
        draw();
        renderTable();
      });
      mats.appendChild(b);
    });
    document.querySelectorAll('#test-choices .choice').forEach(function (b) {
      b.addEventListener('click', function () { run(b.getAttribute('data-test')); });
    });
    $('clear-btn').addEventListener('click', function () {
      state.results = {};
      renderTable();
    });
    $('job-next').addEventListener('click', function () {
      state.job = (state.job + 1) % JOBS.length;
      renderJob(null);
    });
    draw();
    renderTable();
    renderJob(null);
  });

  // exposed for quick checks in the browser console
  window.materialsData = { MATERIALS: MATERIALS, TESTS: TESTS, JOBS: JOBS };
})();
