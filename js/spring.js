/*
 * Spring Stretch
 * Two springs hang side by side from one stand, with a shared ruler between
 * them. Masses (50 g each) are hung on each spring separately. The extension
 * grows by the same amount for every 50 g added (Spring A: 2 cm, Spring B: 1 cm).
 * The scene and graph are SVG drawings so they follow the light/dark theme.
 */
(function () {
  var ORIGINAL_CM = 10;
  var MASS_STEP = 50;
  var MAX_MASSES = 6;
  // x: where the spring hangs; side: which way its labels and ruler pointer go
  var SPRINGS = {
    A: { name: 'Spring A', cmPer50g: 2, color: '--e-kinetic', x: 160, side: -1, width: 3 },
    B: { name: 'Spring B', cmPer50g: 1, color: '--e-heat', x: 378, side: 1, width: 4.5 }
  };
  var KEYS = ['A', 'B'];

  // scene geometry (SVG units)
  var PX_PER_CM = 12;
  var TOP_Y = 40; // where the springs hang from (0 cm on the ruler)
  var RULER_L = 246;
  var RULER_R = 292;
  var RULER_MAX_CM = 26;
  var VIEW_W = 512;

  var state = {
    count: { A: 0, B: 0 }, // number of 50 g masses on each spring
    shownCm: { A: ORIGINAL_CM, B: ORIGINAL_CM }, // length currently drawn (animates)
    showForces: true,
    results: { A: {}, B: {} }, // results[spring][mass] = length in cm
    anim: { A: null, B: null }
  };
  // The stretch always plays. If the device asks for less motion, the bounce is left out.
  var calmMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  function lengthCm(spring, count) {
    return ORIGINAL_CM + SPRINGS[spring].cmPer50g * count;
  }

  /* ---------- scene ---------- */
  function springPath(x, topY, bottomY) {
    var coils = 12;
    var lead = 8;
    var amp = 13;
    var d = 'M' + x + ' ' + topY + ' V' + (topY + lead);
    var span = bottomY - topY - lead * 2;
    for (var i = 0; i < coils * 2; i++) {
      var y = topY + lead + span * (i + 0.5) / (coils * 2);
      var px = x + (i % 2 === 0 ? amp : -amp);
      d += ' L' + px.toFixed(1) + ' ' + y.toFixed(1);
    }
    d += ' L' + x + ' ' + (bottomY - lead) + ' V' + bottomY;
    return d;
  }

  function arrow(x, y1, y2, color) {
    // arrow from y1 to y2 with head at y2
    var dir = y2 > y1 ? 1 : -1;
    return '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + (y2 - dir * 8) + '" style="stroke:' + color + ';stroke-width:4"/>' +
      '<polygon points="' + (x - 8) + ',' + (y2 - dir * 12) + ' ' + (x + 8) + ',' + (y2 - dir * 12) + ' ' + x + ',' + y2 + '" style="fill:' + color + '"/>';
  }

  function label(x, y, text, anchor) {
    return '<text class="svg-text" x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" style="font-size:17px">' + text + '</text>';
  }

  function drawSpring(key) {
    var sp = SPRINGS[key];
    var x = sp.x;
    var side = sp.side; // -1: labels on the left, +1: labels on the right
    var anchor = side < 0 ? 'end' : 'start';
    var count = state.count[key];
    var bottomY = TOP_Y + state.shownCm[key] * PX_PER_CM;
    var rulerEdge = side < 0 ? RULER_L : RULER_R; // the ruler side facing this spring
    var s = '';

    s += label(x, 8, sp.name, 'middle');
    s += '<path class="svg-ink" d="M' + x + ' 30 V' + TOP_Y + '"/>';

    // original length mark
    var origY = TOP_Y + ORIGINAL_CM * PX_PER_CM;
    s += '<line x1="' + (x - side * 20) + '" y1="' + origY + '" x2="' + rulerEdge + '" y2="' + origY + '" style="stroke:var(--ink-soft);stroke-width:1.5;stroke-dasharray:3 4"/>';

    // spring
    s += '<path d="' + springPath(x, TOP_Y, bottomY) + '" style="fill:none;stroke:var(' + sp.color + ');stroke-width:' + sp.width + ';stroke-linejoin:round"/>';

    // pointer from the bottom of the spring to the ruler
    s += '<line x1="' + (x - side * 6) + '" y1="' + bottomY + '" x2="' + rulerEdge + '" y2="' + bottomY + '" style="stroke:var(--primary);stroke-width:2"/>';
    s += '<polygon points="' + (rulerEdge + side * 8) + ',' + (bottomY - 5) + ' ' + rulerEdge + ',' + bottomY + ' ' + (rulerEdge + side * 8) + ',' + (bottomY + 5) + '" style="fill:var(--primary)"/>';

    // hook + masses
    s += '<path class="svg-ink" d="M' + x + ' ' + bottomY + ' v8 a6 6 0 1 1 -6 6"/>';
    var y = bottomY + 20;
    if (count > 0) {
      s += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + 8) + '" style="stroke:var(--ink);stroke-width:3"/>';
      y += 8;
      for (var i = 0; i < count; i++) {
        s += '<rect x="' + (x - 22) + '" y="' + y + '" width="44" height="14" rx="3" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>';
        y += 14;
      }
      s += label(x + side * 28, y - 2, (count * MASS_STEP) + ' g', anchor);
    }

    // forces: equal and opposite when the mass hangs still
    if (state.showForces && count > 0) {
      var fLen = 18 + count * 9;
      var upFrom = bottomY - 4;
      var ax = x + side * 46;
      s += arrow(ax, upFrom, upFrom - fLen, 'var(--e-kinetic)');
      s += label(ax + side * 12, upFrom - fLen / 2 - 2, 'spring', anchor);
      s += label(ax + side * 12, upFrom - fLen / 2 + 16, 'force', anchor);
      var downFrom = y + 2;
      s += arrow(x, downFrom, downFrom + fLen, 'var(--e-heat)');
      s += label(x + side * 14, downFrom + fLen / 2 + 2, 'gravitational', anchor);
      s += label(x + side * 14, downFrom + fLen / 2 + 20, 'force', anchor);
    }
    return s;
  }

  function drawScene() {
    var s = '';

    // stand
    s += '<rect class="svg-fill" x="6" y="500" width="440" height="12" rx="3"/>';
    s += '<rect class="svg-fill" x="14" y="18" width="12" height="482"/>';
    s += '<rect class="svg-fill" x="14" y="18" width="400" height="12"/>';

    // shared ruler, with ticks on both edges
    var mid = (RULER_L + RULER_R) / 2;
    s += '<rect x="' + RULER_L + '" y="' + (TOP_Y - 10) + '" width="' + (RULER_R - RULER_L) + '" height="' + (RULER_MAX_CM * PX_PER_CM + 20) + '" rx="4" style="fill:var(--surface);stroke:var(--ink-soft);stroke-width:1.5"/>';
    for (var c = 0; c <= RULER_MAX_CM; c++) {
      var ty = TOP_Y + c * PX_PER_CM;
      var big = c % 5 === 0;
      var len = big ? 10 : 6;
      var st = 'stroke:var(--ink);stroke-width:' + (big ? 1.6 : 1);
      s += '<line x1="' + RULER_L + '" y1="' + ty + '" x2="' + (RULER_L + len) + '" y2="' + ty + '" style="' + st + '"/>';
      s += '<line x1="' + RULER_R + '" y1="' + ty + '" x2="' + (RULER_R - len) + '" y2="' + ty + '" style="' + st + '"/>';
      if (big) s += '<text class="svg-text" x="' + mid + '" y="' + (ty + 5) + '" text-anchor="middle" style="font-size:15px">' + c + '</text>';
    }
    s += '<text class="svg-text" x="' + mid + '" y="' + (TOP_Y + RULER_MAX_CM * PX_PER_CM + 26) + '" text-anchor="middle" style="font-size:13px">cm</text>';

    KEYS.forEach(function (k) { s += drawSpring(k); });

    var desc = KEYS.map(function (k) {
      return SPRINGS[k].name + ' with ' + (state.count[k] * MASS_STEP) + ' g is ' + lengthCm(k, state.count[k]) + ' cm long';
    }).join('; ');
    $('scene').innerHTML = '<svg viewBox="0 -10 ' + VIEW_W + ' 530" role="img" aria-label="Two springs hanging from a stand with a ruler between them. ' + desc + '.">' + s + '</svg>';
  }

  /* ---------- animation: stretch with a small bounce ---------- */
  function animateTo(key, targetCm) {
    if (state.anim[key]) cancelAnimationFrame(state.anim[key]);
    var from = state.shownCm[key];
    if (from === targetCm) {
      drawScene();
      return;
    }
    var start = null;
    var dur = 900;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      // damped oscillation settling on the target; if the device asks for
      // less motion, stretch smoothly without the bounce
      var settle = calmMotion ? 1 - Math.pow(1 - t, 3) : 1 - Math.exp(-5 * t) * Math.cos(10 * t);
      state.shownCm[key] = from + (targetCm - from) * (t === 1 ? 1 : settle);
      drawScene();
      state.anim[key] = t < 1 ? requestAnimationFrame(step) : null;
    }
    state.anim[key] = requestAnimationFrame(step);
  }

  /* ---------- results ---------- */
  function renderTable() {
    var body = $('results-body');
    body.innerHTML = '';
    for (var n = 0; n <= MAX_MASSES; n++) {
      var mass = n * MASS_STEP;
      var tr = document.createElement('tr');
      var cells = [String(mass)];
      KEYS.forEach(function (k) {
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
    KEYS.forEach(function (k) {
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

    var summary = KEYS.map(function (k) {
      var n = Object.keys(state.results[k]).length;
      return SPRINGS[k].name + ': ' + n + ' point' + (n === 1 ? '' : 's');
    }).join('; ');
    $('graph').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Line graph of extension against mass. ' + summary + '. The table above has the same data.">' + s + '</svg>';
  }

  /* ---------- controls ---------- */
  function update() {
    var lines = KEYS.map(function (k) {
      var count = state.count[k];
      var len = lengthCm(k, count);
      var mass = count * MASS_STEP;
      state.results[k][mass] = len;
      $('mass-' + k).textContent = mass + ' g';
      $('add-' + k).disabled = count >= MAX_MASSES;
      $('remove-' + k).disabled = count <= 0;
      return '<span>' + SPRINGS[k].name + ' with <strong>' + mass + ' g</strong>: length <strong>' + len +
        ' cm</strong>, extension <strong>' + (len - ORIGINAL_CM) + ' cm</strong>.</span>';
    });
    $('result').innerHTML = lines.join('');
    renderTable();
    drawGraph();
    KEYS.forEach(function (k) { animateTo(k, lengthCm(k, state.count[k])); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    KEYS.forEach(function (k) {
      $('add-' + k).addEventListener('click', function () {
        if (state.count[k] < MAX_MASSES) { state.count[k] += 1; update(); }
      });
      $('remove-' + k).addEventListener('click', function () {
        if (state.count[k] > 0) { state.count[k] -= 1; update(); }
      });
    });
    $('forces-toggle').addEventListener('change', function (e) {
      state.showForces = e.target.checked;
      drawScene();
    });
    $('clear-btn').addEventListener('click', function () {
      state.results = { A: {}, B: {} };
      state.count = { A: 0, B: 0 };
      update();
    });
    update();
  });

  // exposed for quick checks in the browser console
  window.springModel = { lengthCm: lengthCm, SPRINGS: SPRINGS };
})();
