/*
 * Light and Shadows (Primary 4, Energy)
 * A torch shines on a disc in front of a screen. Pupils move the disc and
 * change its material, and see how the shadow changes.
 *
 * Light travels in straight lines, so the shadow's size follows from the
 * straight rays past the edges of the disc:
 *   shadow height = disc height × (torch-to-screen distance ÷ torch-to-disc distance)
 */
(function () {
  var DISC_CM = 4;
  var SCREEN_CM = 60;
  var MATERIALS = {
    opaque: { name: 'Cardboard', kind: 'opaque', shadow: 'Dark shadow', dark: 0.85, fill: '#8c6a43', fillOpacity: 1,
      say: 'Cardboard is <strong>opaque</strong>: it does not let light pass through. It makes a <strong>dark shadow</strong>.' },
    translucent: { name: 'Tracing paper', kind: 'translucent', shadow: 'Faint shadow', dark: 0.35, fill: '#e8e2d0', fillOpacity: 0.9,
      say: 'Tracing paper is <strong>translucent</strong>: it lets some light pass through. It makes a <strong>faint shadow</strong>.' },
    transparent: { name: 'Clear plastic', kind: 'transparent', shadow: 'No clear shadow', dark: 0.05, fill: '#9fd6f5', fillOpacity: 0.45,
      say: 'Clear plastic is <strong>transparent</strong>: it lets most light pass through. It makes <strong>no clear shadow</strong>.' }
  };

  // scene geometry (SVG units)
  var PX = 5; // pixels per cm
  var TORCH_X = 46, MID_Y = 128;

  var state = {
    material: 'opaque',
    distance: 30, // cm from torch to disc (where the pupil has set it)
    shownDistance: 30, // where the disc is drawn (slides to the new place)
    rows: [],
    anim: null
  };
  var $ = function (id) { return document.getElementById(id); };

  function shadowCm(distance) {
    return DISC_CM * SCREEN_CM / distance;
  }

  function draw() {
    var m = MATERIALS[state.material];
    var d = state.shownDistance;
    var discX = TORCH_X + d * PX, screenX = TORCH_X + SCREEN_CM * PX;
    var half = DISC_CM * PX / 2;
    var sh = shadowCm(d) * PX / 2; // half the shadow height on the screen
    var beam = 80; // half-height of the lit patch on the screen
    var s = '';

    // light from the torch: a lit region, then the shadow region behind the disc
    s += '<polygon points="' + TORCH_X + ',' + MID_Y + ' ' + screenX + ',' + (MID_Y - beam) + ' ' + screenX + ',' + (MID_Y + beam) + '" style="fill:var(--e-light);opacity:0.28"/>';
    s += '<polygon points="' + discX + ',' + (MID_Y - half) + ' ' + screenX + ',' + (MID_Y - sh) + ' ' + screenX + ',' + (MID_Y + sh) + ' ' + discX + ',' + (MID_Y + half) +
      '" style="fill:var(--bg);opacity:' + Math.min(1, m.dark + 0.1) + '"/>';
    s += '<polygon points="' + discX + ',' + (MID_Y - half) + ' ' + screenX + ',' + (MID_Y - sh) + ' ' + screenX + ',' + (MID_Y + sh) + ' ' + discX + ',' + (MID_Y + half) +
      '" style="fill:var(--ink);opacity:' + m.dark * 0.45 + '"/>';
    // the two rays that just pass the edges of the disc
    [-1, 1].forEach(function (k) {
      s += '<line x1="' + TORCH_X + '" y1="' + MID_Y + '" x2="' + screenX + '" y2="' + (MID_Y + k * sh) + '" style="stroke:var(--e-elec);stroke-width:2"/>';
    });

    // torch
    s += '<rect class="svg-fill" x="6" y="' + (MID_Y - 11) + '" width="30" height="22" rx="5"/><polygon class="svg-fill" points="36,' + (MID_Y - 14) + ' 46,' + (MID_Y - 18) + ' 46,' + (MID_Y + 18) + ' 36,' + (MID_Y + 14) + '"/>';
    // disc on a stick, seen from the side
    s += '<line x1="' + discX + '" y1="' + (MID_Y + half) + '" x2="' + discX + '" y2="214" style="stroke:var(--ink);stroke-width:2"/>';
    s += '<rect x="' + (discX - 4) + '" y="' + (MID_Y - half) + '" width="8" height="' + (half * 2) + '" style="fill:' + m.fill + ';fill-opacity:' + m.fillOpacity + ';stroke:var(--ink);stroke-width:2"/>';
    // screen and the shadow on it
    s += '<rect class="svg-fill" x="' + screenX + '" y="' + (MID_Y - 92) + '" width="8" height="184"/>';
    s += '<rect x="' + (screenX - 3) + '" y="' + (MID_Y - sh) + '" width="4" height="' + (sh * 2) + '" style="fill:var(--ink);opacity:' + Math.max(0.12, m.dark) + '"/>';
    s += '<text class="svg-text" x="' + (screenX + 4) + '" y="26" text-anchor="middle" style="font-size:14px">screen</text>';

    // ruler: distance from the torch
    var ry = 222;
    s += '<line x1="' + TORCH_X + '" y1="' + ry + '" x2="' + screenX + '" y2="' + ry + '" style="stroke:var(--ink);stroke-width:1.5"/>';
    for (var cm = 0; cm <= SCREEN_CM; cm += 10) {
      var x = TORCH_X + cm * PX;
      s += '<line x1="' + x + '" y1="' + ry + '" x2="' + x + '" y2="' + (ry + 7) + '" style="stroke:var(--ink);stroke-width:1.5"/>' +
        '<text class="svg-text" x="' + x + '" y="' + (ry + 22) + '" text-anchor="middle" style="font-size:12px;font-weight:400">' + cm + '</text>';
    }
    s += '<text class="svg-text" x="' + (screenX + 16) + '" y="' + (ry + 22) + '" style="font-size:12px;font-weight:400">cm</text>';

    // what you see on the screen from the front
    var fx = 422, fr = Math.min(46, shadowCm(d) * 1.9);
    s += '<rect x="' + (fx - 50) + '" y="' + (MID_Y - 50) + '" width="100" height="100" style="fill:var(--e-light);opacity:0.35"/>';
    s += '<rect x="' + (fx - 50) + '" y="' + (MID_Y - 50) + '" width="100" height="100" style="fill:none;stroke:var(--ink);stroke-width:2"/>';
    s += '<circle cx="' + fx + '" cy="' + MID_Y + '" r="' + fr + '" style="fill:var(--ink);opacity:' + Math.max(0.08, m.dark) + '"/>';
    s += '<text class="svg-text" x="' + fx + '" y="' + (MID_Y - 60) + '" text-anchor="middle" style="font-size:13px">On the screen</text>';

    $('scene').innerHTML = '<svg viewBox="0 0 480 252" role="img" aria-label="A torch shining on a ' + m.name.toLowerCase() + ' disc ' + state.distance +
      ' centimetres away, with a screen ' + SCREEN_CM + ' centimetres from the torch.">' + s + '</svg>';
  }

  function update(record) {
    var m = MATERIALS[state.material];
    var h = shadowCm(state.distance);
    $('distance-readout').textContent = state.distance + ' cm';
    $('result').innerHTML = m.say + (m.kind === 'transparent' ? ''
      : ' The shadow is <strong>' + h.toFixed(1) + ' cm</strong> tall. (The disc is ' + DISC_CM + ' cm tall.)');
    if (record) {
      var key = state.material + '-' + state.distance;
      if (!state.rows.some(function (r) { return r.key === key; })) {
        state.rows.push({ key: key, material: m.name + ' (' + m.kind + ')', distance: state.distance, height: h, measurable: m.kind !== 'transparent', shadow: m.shadow });
        state.rows.sort(function (a, b) { return a.material < b.material ? -1 : a.material > b.material ? 1 : a.distance - b.distance; });
        renderTable();
      }
    }
    // slide the disc to its new place
    if (state.anim) cancelAnimationFrame(state.anim);
    var from = state.shownDistance, to = state.distance, start = null;
    if (from === to) { draw(); return; }
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / 350);
      state.shownDistance = from + (to - from) * t * (2 - t);
      draw();
      if (t < 1) state.anim = requestAnimationFrame(step);
    }
    state.anim = requestAnimationFrame(step);
  }

  function renderTable() {
    var body = $('results-body');
    body.innerHTML = '';
    if (!state.rows.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="4">No results yet. Press Record result.</td></tr>';
      return;
    }
    state.rows.forEach(function (r) {
      var tr = document.createElement('tr');
      [r.material, r.distance + ' cm', r.measurable ? r.height.toFixed(1) + ' cm' : '–', r.shadow].forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('distance').addEventListener('input', function (e) {
      state.distance = Number(e.target.value);
      update(false);
    });
    document.querySelectorAll('#material-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.material = b.getAttribute('data-material');
        document.querySelectorAll('#material-choices button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        update(false);
      });
    });
    $('record-btn').addEventListener('click', function () { update(true); });
    $('clear-btn').addEventListener('click', function () {
      state.rows = [];
      renderTable();
    });
    renderTable();
    update(false);
  });

  // exposed for quick checks in the browser console
  window.shadowsModel = { shadowCm: shadowCm, DISC_CM: DISC_CM, SCREEN_CM: SCREEN_CM, MATERIALS: MATERIALS };
})();
