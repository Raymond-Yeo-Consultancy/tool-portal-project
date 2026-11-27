/*
 * Spring Stretch
 * Masses (50 g each) hang on a spring. The extension grows by the same
 * amount for every 50 g added (Spring A: 2 cm, Spring B: 1 cm).
 * The scene and graph are SVG drawings so they follow the light/dark theme.
 */
(function () {
  var ORIGINAL_CM = 10;
  var MASS_STEP = 50;
  var MAX_MASSES = 6;
  var SPRINGS = {
    A: { name: 'Spring A', cmPer50g: 2, color: '--e-kinetic' },
    B: { name: 'Spring B', cmPer50g: 1, color: '--e-heat' }
  };

  // scene geometry (SVG units)
  var PX_PER_CM = 12;
  var TOP_Y = 40; // where the spring hangs from (0 cm on the ruler)
  var SPRING_X = 170;
  var RULER_X = 236;
  var RULER_MAX_CM = 26;

  var state = {
    spring: 'A',
    count: 0, // number of 50 g masses
    shownCm: ORIGINAL_CM, // length currently drawn (animates)
    showForces: true,
    results: { A: {}, B: {} }, // results[spring][mass] = length in cm
    anim: null
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  function lengthCm(spring, count) {
    return ORIGINAL_CM + SPRINGS[spring].cmPer50g * count;
  }

  /* ---------- scene ---------- */
  function springPath(topY, bottomY) {
    var coils = 12;
    var lead = 8;
    var amp = 13;
    var d = 'M' + SPRING_X + ' ' + topY + ' V' + (topY + lead);
    var span = bottomY - topY - lead * 2;
    for (var i = 0; i < coils * 2; i++) {
      var y = topY + lead + span * (i + 0.5) / (coils * 2);
      var x = SPRING_X + (i % 2 === 0 ? amp : -amp);
      d += ' L' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    d += ' L' + SPRING_X + ' ' + (bottomY - lead) + ' V' + bottomY;
    return d;
  }

  function arrow(x, y1, y2, color) {
    // arrow from y1 to y2 with head at y2
    var dir = y2 > y1 ? 1 : -1;
    return '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + (y2 - dir * 8) + '" style="stroke:' + color + ';stroke-width:4"/>' +
      '<polygon points="' + (x - 8) + ',' + (y2 - dir * 12) + ' ' + (x + 8) + ',' + (y2 - dir * 12) + ' ' + x + ',' + y2 + '" style="fill:' + color + '"/>';
  }

  function drawScene() {
    var cm = state.shownCm;
    var bottomY = TOP_Y + cm * PX_PER_CM;
    var spring = SPRINGS[state.spring];
    var s = '';

    // stand
    s += '<rect class="svg-fill" x="20" y="500" width="230" height="12" rx="3"/>';
    s += '<rect class="svg-fill" x="34" y="18" width="12" height="482"/>';
    s += '<rect class="svg-fill" x="34" y="18" width="160" height="12"/>';
    s += '<path class="svg-ink" d="M' + SPRING_X + ' 30 V' + TOP_Y + '"/>';

    // ruler
    s += '<rect x="' + (RULER_X - 4) + '" y="' + (TOP_Y - 10) + '" width="46" height="' + (RULER_MAX_CM * PX_PER_CM + 20) + '" rx="4" style="fill:var(--surface);stroke:var(--ink-soft);stroke-width:1.5"/>';
    for (var c = 0; c <= RULER_MAX_CM; c++) {
      var ty = TOP_Y + c * PX_PER_CM;
      var len = c % 5 === 0 ? 14 : 7;
      s += '<line x1="' + RULER_X + '" y1="' + ty + '" x2="' + (RULER_X + len) + '" y2="' + ty + '" style="stroke:var(--ink);stroke-width:' + (c % 5 === 0 ? 1.6 : 1) + '"/>';
      if (c % 5 === 0) s += '<text class="svg-text" x="' + (RULER_X + 18) + '" y="' + (ty + 5) + '" style="font-size:12px">' + c + '</text>';
    }
    s += '<text class="svg-text" x="' + (RULER_X + 18) + '" y="' + (TOP_Y - 14) + '" style="font-size:12px">cm</text>';

    // original length mark
    var origY = TOP_Y + ORIGINAL_CM * PX_PER_CM;
    s += '<line x1="' + (SPRING_X + 20) + '" y1="' + origY + '" x2="' + RULER_X + '" y2="' + origY + '" style="stroke:var(--ink-soft);stroke-width:1.5;stroke-dasharray:3 4"/>';

    // spring
    s += '<path d="' + springPath(TOP_Y, bottomY) + '" style="fill:none;stroke:var(' + spring.color + ');stroke-width:' + (state.spring === 'B' ? 4.5 : 3) + ';stroke-linejoin:round"/>';

    // pointer to the ruler at the spring's bottom
    s += '<line x1="' + (SPRING_X + 6) + '" y1="' + bottomY + '" x2="' + RULER_X + '" y2="' + bottomY + '" style="stroke:var(--primary);stroke-width:2"/>';
    s += '<polygon points="' + (RULER_X - 8) + ',' + (bottomY - 5) + ' ' + RULER_X + ',' + bottomY + ' ' + (RULER_X - 8) + ',' + (bottomY + 5) + '" style="fill:var(--primary)"/>';

    // hook + hanger + masses
    s += '<path class="svg-ink" d="M' + SPRING_X + ' ' + bottomY + ' v8 a6 6 0 1 1 -6 6"/>';
    var y = bottomY + 20;
    if (state.count > 0) {
      s += '<line x1="' + SPRING_X + '" y1="' + y + '" x2="' + SPRING_X + '" y2="' + (y + 8) + '" style="stroke:var(--ink);stroke-width:3"/>';
      y += 8;
      for (var i = 0; i < state.count; i++) {
        s += '<rect x="' + (SPRING_X - 22) + '" y="' + y + '" width="44" height="14" rx="3" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>';
        y += 14;
      }
      s += '<text class="svg-text" x="' + (SPRING_X - 28) + '" y="' + (y - 3) + '" text-anchor="end" style="font-size:13px">' + (state.count * MASS_STEP) + ' g</text>';
    }

    // forces
    if (state.showForces && state.count > 0) {
      var fLen = 18 + state.count * 9;
      var upFrom = bottomY - 4;
      s += arrow(SPRING_X - 46, upFrom, upFrom - fLen, 'var(--e-kinetic)');
      s += '<text class="svg-text" x="' + (SPRING_X - 56) + '" y="' + (upFrom - fLen / 2 + 4) + '" text-anchor="end" style="font-size:12px">spring</text>';
      s += '<text class="svg-text" x="' + (SPRING_X - 56) + '" y="' + (upFrom - fLen / 2 + 18) + '" text-anchor="end" style="font-size:12px">force</text>';
      var downFrom = y + 2;
      s += arrow(SPRING_X, downFrom, downFrom + fLen, 'var(--e-heat)');
      s += '<text class="svg-text" x="' + (SPRING_X - 14) + '" y="' + (downFrom + fLen / 2 + 4) + '" text-anchor="end" style="font-size:12px">gravitational</text>';
      s += '<text class="svg-text" x="' + (SPRING_X - 14) + '" y="' + (downFrom + fLen / 2 + 18) + '" text-anchor="end" style="font-size:12px">force</text>';
    }

    $('scene').innerHTML =
      '<svg viewBox="0 0 300 515" role="img" aria-label="' + spring.name + ' hanging from a stand with ' +
      (state.count * MASS_STEP) + ' g of masses. Its length is ' + lengthCm(state.spring, state.count) + ' cm.">' + s + '</svg>';
  }

  /* ---------- animation: stretch with a small bounce ---------- */
  function animateTo(targetCm) {
    if (state.anim) cancelAnimationFrame(state.anim);
    if (reduceMotion) {
      state.shownCm = targetCm;
      drawScene();
      return;
    }
    var from = state.shownCm;
    var start = null;
    var dur = 900;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      // damped oscillation settling on the target
      var settle = 1 - Math.exp(-5 * t) * Math.cos(10 * t);
      state.shownCm = from + (targetCm - from) * (t === 1 ? 1 : settle);
      drawScene();
      if (t < 1) state.anim = requestAnimationFrame(step);
    }
    state.anim = requestAnimationFrame(step);
  }

  /* ---------- results ---------- */
  function record() {
    var mass = state.count * MASS_STEP;
    state.results[state.spring][mass] = lengthCm(state.spring, state.count);
    renderTable();
    drawGraph();
  }

  function renderTable() {
    var body = $('results-body');
    body.innerHTML = '';
    for (var n = 0; n <= MAX_MASSES; n++) {
      var mass = n * MASS_STEP;
      var tr = document.createElement('tr');
      var cells = [String(mass)];
      ['A', 'B'].forEach(function (k) {
        var len = state.results[k][mass];
        cells.push(len === undefined ? '–' : String(len));
        cells.push(len === undefined ? '–' : String(len - ORIGINAL_CM));
      });
      cells.forEach(function (v, i) {
        var td = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) td.scope = 'row';
        td.textContent = v;
        tr.appendChild(td);
      });
      if (mass === state.count * MASS_STEP) tr.className = 'current-row';
      body.appendChild(tr);
    }
  }

  function drawGraph() {
    var W = 360, H = 270;
    var left = 46, right = 14, top = 14, bottom = 50;
    var maxMass = MAX_MASSES * MASS_STEP;
    var maxExt = 12;
    var gx = function (m) { return left + (m / maxMass) * (W - left - right); };
    var gy = function (e) { return H - bottom - (e / maxExt) * (H - top - bottom); };
    var s = '';

    // grid + axes
    for (var e = 0; e <= maxExt; e += 2) {
      s += '<line x1="' + left + '" y1="' + gy(e) + '" x2="' + (W - right) + '" y2="' + gy(e) + '" style="stroke:var(--border);stroke-width:1"/>';
      s += '<text class="svg-text" x="' + (left - 8) + '" y="' + (gy(e) + 4) + '" text-anchor="end" style="font-size:12px;font-weight:400">' + e + '</text>';
    }
    for (var m = 0; m <= maxMass; m += MASS_STEP) {
      s += '<text class="svg-text" x="' + gx(m) + '" y="' + (H - bottom + 18) + '" text-anchor="middle" style="font-size:12px;font-weight:400">' + m + '</text>';
    }
    s += '<path d="M' + left + ' ' + top + ' V' + (H - bottom) + ' H' + (W - right) + '" style="fill:none;stroke:var(--ink);stroke-width:2"/>';
    s += '<text class="svg-text" x="' + ((left + W - right) / 2) + '" y="' + (H - 10) + '" text-anchor="middle" style="font-size:13px">Mass (g)</text>';
    s += '<text class="svg-text" transform="rotate(-90)" x="' + (-(top + H - bottom) / 2) + '" y="14" text-anchor="middle" style="font-size:13px">Extension (cm)</text>';

    // data
    ['A', 'B'].forEach(function (k) {
      var color = 'var(' + SPRINGS[k].color + ')';
      var pts = Object.keys(state.results[k]).map(Number).sort(function (a, b) { return a - b; });
      if (pts.length > 1) {
        s += '<polyline points="' + pts.map(function (mm) { return gx(mm) + ',' + gy(state.results[k][mm] - ORIGINAL_CM); }).join(' ') +
          '" style="fill:none;stroke:' + color + ';stroke-width:3' + (k === 'B' ? ';stroke-dasharray:6 4' : '') + '"/>';
      }
      pts.forEach(function (mm) {
        var x = gx(mm), y = gy(state.results[k][mm] - ORIGINAL_CM);
        s += k === 'A'
          ? '<circle cx="' + x + '" cy="' + y + '" r="5.5" style="fill:' + color + '"/>'
          : '<rect x="' + (x - 5) + '" y="' + (y - 5) + '" width="10" height="10" style="fill:' + color + '"/>';
      });
    });

    var summary = ['A', 'B'].map(function (k) {
      var n = Object.keys(state.results[k]).length;
      return SPRINGS[k].name + ': ' + n + ' point' + (n === 1 ? '' : 's');
    }).join('; ');
    $('graph').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Line graph of extension against mass. ' + summary + '. The table above has the same data.">' + s + '</svg>';
  }

  /* ---------- controls ---------- */
  function update() {
    var len = lengthCm(state.spring, state.count);
    var mass = state.count * MASS_STEP;
    $('mass-readout').textContent = mass + ' g';
    $('add-btn').disabled = state.count >= MAX_MASSES;
    $('remove-btn').disabled = state.count <= 0;
    $('result').innerHTML = SPRINGS[state.spring].name + ' with <strong>' + mass + ' g</strong>: length <strong>' + len +
      ' cm</strong>, extension <strong>' + (len - ORIGINAL_CM) + ' cm</strong>.';
    record();
    animateTo(len);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var springButtons = document.querySelectorAll('#spring-choices .choice');
    springButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        springButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        state.spring = btn.getAttribute('data-spring');
        // swapping springs: take the masses off first, like in a real experiment
        state.count = 0;
        state.shownCm = ORIGINAL_CM;
        update();
      });
    });
    $('add-btn').addEventListener('click', function () {
      if (state.count < MAX_MASSES) { state.count += 1; update(); }
    });
    $('remove-btn').addEventListener('click', function () {
      if (state.count > 0) { state.count -= 1; update(); }
    });
    $('forces-toggle').addEventListener('change', function (e) {
      state.showForces = e.target.checked;
      drawScene();
    });
    $('clear-btn').addEventListener('click', function () {
      state.results = { A: {}, B: {} };
      state.count = 0;
      update();
    });
    update();
  });

  // exposed for quick checks in the browser console
  window.springModel = { lengthCm: lengthCm, SPRINGS: SPRINGS };
})();
