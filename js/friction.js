/*
 * Friction Ramp
 * A toy car rolls down a ramp onto a surface and slows down because of friction.
 *
 * Simple model (not shown to pupils):
 *   speed at bottom of ramp   v = sqrt(2 * g * h)
 *   slowing down on surface   a = friction * g
 *   distance on surface       d = h / friction
 * Ramp friction and air resistance are ignored.
 */
(function () {
  var G = 9.8; // m/s²
  var RULER_MAX_CM = 320;

  var SURFACES = {
    glass: { name: 'Glass', friction: 0.10, color: '#bfe3f5', dot: '#ffffff' },
    wood: { name: 'Wood', friction: 0.18, color: '#b07a45', dot: '#8c5a2b' },
    carpet: { name: 'Carpet', friction: 0.35, color: '#8a5a9e', dot: '#6a3f7d' },
    sandpaper: { name: 'Sandpaper', friction: 0.55, color: '#c8a96e', dot: '#6e5a3a' }
  };
  var HEIGHT_NAMES = { 10: 'Low (10 cm)', 20: 'Medium (20 cm)', 30: 'High (30 cm)' };

  var canvas, ctx, wrap;
  var resultEl, releaseBtn, clearBtn, hintEl, tbody;
  var state = {
    surface: 'wood',
    height: 20,
    phase: 'idle', // idle | ramp | floor | done
    carS: 0, // ramp progress 0..1
    carCm: 0, // distance along floor in cm
    runs: [],
    animId: null
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function distanceCm(surfaceKey, heightCm) {
    return heightCm / SURFACES[surfaceKey].friction;
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* ---------- layout ---------- */
  var L = {}; // layout values in CSS pixels

  function resize() {
    var w = wrap.clientWidth;
    var h = Math.round(Math.min(380, Math.max(230, w * 0.45)));
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    L.w = w;
    L.h = h;
    L.groundY = h - 50;
    L.rampLeft = 12;
    L.rampW = Math.max(70, w * 0.2);
    L.footX = L.rampLeft + L.rampW;
    L.rulerEnd = w - 18;
    L.maxRampPx = L.groundY - 46;
    L.carW = Math.max(32, Math.min(50, w * 0.06));
    draw();
  }

  function rampTopY() {
    return L.groundY - (state.height / 30) * L.maxRampPx;
  }

  function cmToX(cm) {
    return L.footX + (cm / RULER_MAX_CM) * (L.rulerEnd - L.footX);
  }

  /* ---------- drawing ---------- */
  function draw() {
    var ink = cssVar('--ink');
    var soft = cssVar('--ink-soft');
    var text = cssVar('--text');
    var ramp = cssVar('--ramp');
    var font = cssVar('--font');
    var s = SURFACES[state.surface];

    ctx.clearRect(0, 0, L.w, L.h);

    // floor surface band
    ctx.fillStyle = s.color;
    ctx.fillRect(L.footX, L.groundY, L.rulerEnd - L.footX + 18, 12);
    ctx.fillStyle = s.dot;
    for (var x = L.footX + 3; x < L.w; x += state.surface === 'wood' ? 14 : 6) {
      if (state.surface === 'wood') {
        ctx.fillRect(x, L.groundY, 3, 12);
      } else if (state.surface !== 'glass') {
        ctx.fillRect(x, L.groundY + 3, 2, 2);
        ctx.fillRect(x + 3, L.groundY + 8, 2, 2);
      }
    }
    if (state.surface === 'glass') {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (var gx = L.footX + 10; gx < L.w; gx += 60) {
        ctx.fillRect(gx, L.groundY + 3, 22, 2);
      }
    }

    // ground line
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, L.groundY);
    ctx.lineTo(L.w, L.groundY);
    ctx.stroke();

    // ramp (triangle)
    var topY = rampTopY();
    ctx.fillStyle = ramp;
    ctx.strokeStyle = ink;
    ctx.beginPath();
    ctx.moveTo(L.rampLeft, L.groundY);
    ctx.lineTo(L.rampLeft, topY);
    ctx.lineTo(L.footX, L.groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ramp height label
    ctx.fillStyle = text;
    ctx.font = '600 13px ' + font;
    ctx.textAlign = 'left';
    ctx.fillText(state.height + ' cm', L.rampLeft + 4, topY - 8);

    // ruler (measuring tape)
    var tickTop = L.groundY + 12;
    ctx.strokeStyle = soft;
    ctx.fillStyle = text;
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';
    ctx.font = '12px ' + font;
    var labelEvery = L.w < 500 ? 100 : 50;
    for (var cm = 0; cm <= RULER_MAX_CM; cm += 10) {
      var tx = cmToX(cm);
      var big = cm % 50 === 0;
      ctx.beginPath();
      ctx.moveTo(tx, tickTop);
      ctx.lineTo(tx, tickTop + (big ? 10 : 5));
      ctx.stroke();
      if (cm % labelEvery === 0) ctx.fillText(String(cm), tx, tickTop + 24);
    }
    ctx.textAlign = 'right';
    ctx.fillText('cm', L.w - 4, tickTop + 36);

    // surface name
    ctx.textAlign = 'right';
    ctx.font = '600 14px ' + font;
    ctx.fillText('Floor: ' + s.name, L.rulerEnd, 22);

    // earlier runs: faint markers
    state.runs.forEach(function (run, i) {
      var isLatest = i === state.runs.length - 1 && state.phase === 'done';
      if (isLatest) return;
      drawFlag(cmToX(run.cm), String(i + 1), soft, soft, false);
    });

    // car
    var pos = carPosition();
    drawCar(pos.x, pos.y, pos.angle);

    // latest result flag
    if (state.phase === 'done') {
      drawFlag(cmToX(state.carCm), Math.round(state.carCm) + ' cm', cssVar('--primary'), text, true);
    }
  }

  function drawFlag(x, label, color, textColor, strong) {
    var font = cssVar('--font');
    var top = strong ? 34 : 48;
    ctx.strokeStyle = color;
    ctx.lineWidth = strong ? 2.5 : 1.5;
    ctx.setLineDash(strong ? [] : [4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, L.groundY);
    ctx.lineTo(x, top);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = textColor;
    ctx.font = (strong ? '700 15px ' : '12px ') + font;
    var tw = ctx.measureText(label).width;
    var lx = Math.min(Math.max(x, tw / 2 + 4), L.w - tw / 2 - 4);
    ctx.textAlign = 'center';
    ctx.fillText(label, lx, top - 6);
  }

  function carPosition() {
    var topY = rampTopY();
    var startX = L.rampLeft + L.carW * 0.55;
    var startY = topY + ((startX - L.rampLeft) / L.rampW) * (L.groundY - topY);
    if (state.phase === 'idle' || state.phase === 'ramp') {
      var s = state.phase === 'idle' ? 0 : state.carS;
      return {
        x: startX + (L.footX - startX) * s,
        y: startY + (L.groundY - startY) * s,
        angle: Math.atan2(L.groundY - topY, L.rampW)
      };
    }
    return { x: cmToX(state.carCm), y: L.groundY, angle: 0 };
  }

  function drawCar(x, y, angle) {
    var w = L.carW;
    var bodyH = w * 0.34;
    var r = w * 0.13;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    // body (sits above the wheels)
    ctx.fillStyle = cssVar('--car');
    ctx.strokeStyle = cssVar('--ink');
    ctx.lineWidth = 1.5;
    roundRect(-w / 2, -bodyH - r * 1.4, w, bodyH, 5);
    ctx.fill();
    ctx.stroke();
    // cabin
    roundRect(-w * 0.22, -bodyH - r * 1.4 - bodyH * 0.6, w * 0.42, bodyH * 0.7, 4);
    ctx.fill();
    ctx.stroke();
    // wheels
    ctx.fillStyle = cssVar('--wheel');
    [-w * 0.3, w * 0.3].forEach(function (wx) {
      ctx.beginPath();
      ctx.arc(wx, -r, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ---------- running an experiment ---------- */
  function release() {
    if (state.phase === 'ramp' || state.phase === 'floor') return;
    var previous = state.runs[state.runs.length - 1];
    hintEl.hidden = !(previous && previous.surface !== state.surface && previous.height !== state.height);

    var hM = state.height / 100;
    var mu = SURFACES[state.surface].friction;
    var v0 = Math.sqrt(2 * G * hM); // m/s at the bottom of the ramp
    var a = mu * G; // m/s² slowing down
    var floorTime = v0 / a; // seconds until it stops
    var finalCm = distanceCm(state.surface, state.height);

    setBusy(true);
    resultEl.textContent = 'The car is rolling…';

    if (reduceMotion) {
      state.carCm = finalCm;
      finish(finalCm);
      return;
    }

    var rampTime = 0.6 + state.height * 0.01;
    var start = null;
    state.phase = 'ramp';
    state.carS = 0;
    state.carCm = 0;

    function step(ts) {
      if (start === null) start = ts;
      var t = (ts - start) / 1000;
      if (t < rampTime) {
        state.phase = 'ramp';
        var p = t / rampTime;
        state.carS = p * p; // speeding up
      } else {
        state.phase = 'floor';
        var tf = Math.min(t - rampTime, floorTime);
        state.carCm = Math.min(finalCm, (v0 * tf - 0.5 * a * tf * tf) * 100);
        if (tf >= floorTime) {
          finish(finalCm);
          return;
        }
      }
      draw();
      state.animId = requestAnimationFrame(step);
    }
    state.animId = requestAnimationFrame(step);
  }

  function finish(finalCm) {
    state.phase = 'done';
    state.carCm = finalCm;
    var cm = Math.round(finalCm);
    state.runs.push({ surface: state.surface, height: state.height, cm: cm });
    draw();
    resultEl.innerHTML = 'The car travelled <strong>' + cm + ' cm</strong> on ' +
      SURFACES[state.surface].name.toLowerCase() + '.';
    addRow(state.runs.length, state.surface, state.height, cm);
    setBusy(false);
  }

  function setBusy(busy) {
    releaseBtn.disabled = busy;
    document.querySelectorAll('.choice').forEach(function (b) { b.disabled = busy; });
  }

  function addRow(n, surface, height, cm) {
    var empty = tbody.querySelector('.empty-row');
    if (empty) empty.remove();
    var tr = document.createElement('tr');
    [String(n), SURFACES[surface].name, HEIGHT_NAMES[height], cm + ' cm'].forEach(function (v) {
      var td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }

  function clearTable() {
    state.runs = [];
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No runs yet. Your results will appear here.</td></tr>';
    hintEl.hidden = true;
    resetCar();
    resultEl.textContent = 'Table cleared. Choose a surface and a ramp height, then press Release!';
  }

  function resetCar() {
    state.phase = 'idle';
    state.carS = 0;
    state.carCm = 0;
    draw();
  }

  function setupChoices(containerId, attr, onPick) {
    var buttons = document.querySelectorAll('#' + containerId + ' .choice');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        onPick(btn.getAttribute(attr));
        resetCar();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    canvas = document.getElementById('friction-canvas');
    wrap = canvas.parentElement;
    ctx = canvas.getContext('2d');
    resultEl = document.getElementById('result');
    releaseBtn = document.getElementById('release-btn');
    clearBtn = document.getElementById('clear-btn');
    hintEl = document.getElementById('fair-test-hint');
    tbody = document.getElementById('results-body');

    setupChoices('surface-choices', 'data-surface', function (v) { state.surface = v; });
    setupChoices('height-choices', 'data-height', function (v) { state.height = Number(v); });
    releaseBtn.addEventListener('click', release);
    clearBtn.addEventListener('click', clearTable);

    window.addEventListener('resize', resize);
    document.addEventListener('themechange', draw);
    resize();
  });

  // exposed for quick checks in the browser console
  window.frictionModel = { distanceCm: distanceCm, SURFACES: SURFACES };
})();
