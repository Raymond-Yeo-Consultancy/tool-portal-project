/*
 * Drop Race
 * Four objects fall 2 m. Gravitational force pulls them down; air resistance
 * pushes up and grows as they speed up. Each object has a "top speed"
 * (terminal speed) where the two forces balance.
 *   with air:  speed changes by  g * (1 - (v / topSpeed)²)  each second
 *   no air:    speed changes by  g  each second
 * The fall is drawn in slow motion; the times shown are the real times.
 */
(function () {
  var G = 9.8;
  var HEIGHT_M = 2;
  var SLOW = 2; // slow-motion factor for the drawing

  var OBJECTS = [
    {
      id: 'feather', name: 'Feather', topSpeed: 0.8, gLen: 14, flutter: 1,
      svg: '<g transform="rotate(35)"><path d="M0 18 V-18" style="stroke:var(--ink);stroke-width:2"/>' +
        '<path d="M0 -18 C13 -9 13 9 0 14 C-13 9 -13 -9 0 -18 Z" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>' +
        '<path d="M0 -8 L7 -12 M0 0 L8 -4 M0 -8 L-7 -12 M0 0 L-8 -4" style="stroke:var(--ink-soft);stroke-width:1.5"/></g>'
    },
    {
      id: 'sheet', name: 'Flat sheet of paper', short: 'Flat paper', topSpeed: 1.2, gLen: 24, flutter: 0.7,
      svg: '<rect x="-26" y="-3" width="52" height="6" rx="1" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>'
    },
    {
      id: 'paperball', name: 'Crumpled paper ball', short: 'Paper ball', topSpeed: 7, gLen: 24, flutter: 0,
      svg: '<polygon points="0,-12 7,-9 12,-2 10,7 3,12 -6,11 -12,4 -11,-5 -6,-11" style="fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round"/>' +
        '<path d="M-6 -4 L2 0 L-2 6 M4 -6 L6 2" style="stroke:var(--ink-soft);stroke-width:1.5;fill:none"/>'
    },
    {
      id: 'ball', name: 'Metal ball', short: 'Metal ball', topSpeed: 40, gLen: 38, flutter: 0,
      svg: '<circle r="12" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>' +
        '<circle cx="-4" cy="-4" r="3.5" style="fill:var(--surface);opacity:0.8"/>'
    }
  ];

  // scene geometry (SVG units)
  var LANE_W = 100;
  var TOP_Y = 44;
  var GROUND_Y = 318;
  var FALL_PX = GROUND_Y - 14 - TOP_Y;

  var state = {
    air: true,
    showForces: true,
    running: false,
    results: {}, // results[id] = { air: s, vacuum: s }
    anim: null,
    view: null // what is drawn: per object {d, v, t}
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- physics: step the fall forward in small time steps ---------- */
  var cache = {};
  function fall(obj, air) {
    var key = obj.id + (air ? '-air' : '-vac');
    if (cache[key]) return cache[key];
    var dt = 0.0005, t = 0, v = 0, d = 0;
    var samples = [{ d: 0, v: 0 }]; // one sample every 5 ms
    var next = 0.005;
    while (d < HEIGHT_M) {
      var a = air ? G * (1 - (v / obj.topSpeed) * (v / obj.topSpeed)) : G;
      v += a * dt;
      d += v * dt;
      t += dt;
      if (t >= next) {
        samples.push({ d: Math.min(d, HEIGHT_M), v: v });
        next += 0.005;
      }
    }
    cache[key] = { time: t, samples: samples, topSpeed: obj.topSpeed };
    return cache[key];
  }

  function at(obj, air, t) {
    var f = fall(obj, air);
    if (t >= f.time) return { d: HEIGHT_M, v: 0, landed: true, time: f.time };
    var s = f.samples[Math.min(f.samples.length - 1, Math.floor(t / 0.005))];
    return { d: s.d, v: s.v, landed: false, time: f.time };
  }

  /* ---------- drawing ---------- */
  function arrow(x, y1, y2, color) {
    if (Math.abs(y2 - y1) < 4) return '';
    var dir = y2 > y1 ? 1 : -1;
    return '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + (y2 - dir * 6) + '" style="stroke:' + color + ';stroke-width:3.5"/>' +
      '<polygon points="' + (x - 6) + ',' + (y2 - dir * 9) + ' ' + (x + 6) + ',' + (y2 - dir * 9) + ' ' + x + ',' + y2 + '" style="fill:' + color + '"/>';
  }

  function draw(t) {
    state.lastT = t;
    var s = '';
    var W = LANE_W * OBJECTS.length;

    if (!state.air) {
      s += '<rect x="4" y="4" width="' + (W - 8) + '" height="' + (GROUND_Y - 2) + '" rx="12" style="fill:var(--surface);stroke:var(--ink-soft);stroke-width:2;stroke-dasharray:8 6"/>';
      s += '<text class="svg-text" x="' + (W / 2) + '" y="24" text-anchor="middle" style="font-size:13px">No air inside (vacuum)</text>';
    }

    // lanes, height marker and ground
    for (var i = 1; i < OBJECTS.length; i++) {
      s += '<line x1="' + i * LANE_W + '" y1="34" x2="' + i * LANE_W + '" y2="' + GROUND_Y + '" style="stroke:var(--border);stroke-width:1.5;stroke-dasharray:4 6"/>';
    }
    s += '<path d="M14 ' + TOP_Y + ' V' + (GROUND_Y - 2) + ' M8 ' + (TOP_Y + 8) + ' L14 ' + TOP_Y + ' L20 ' + (TOP_Y + 8) + ' M8 ' + (GROUND_Y - 10) + ' L14 ' + (GROUND_Y - 2) + ' L20 ' + (GROUND_Y - 10) + '" style="fill:none;stroke:var(--ink-soft);stroke-width:1.5"/>';
    s += '<text class="svg-text" transform="rotate(-90)" x="' + (-(TOP_Y + GROUND_Y) / 2) + '" y="30" text-anchor="middle" style="font-size:12px">2 m</text>';
    s += '<line class="svg-ground" x1="0" y1="' + GROUND_Y + '" x2="' + W + '" y2="' + GROUND_Y + '"/>';

    var order = landingOrder();

    OBJECTS.forEach(function (obj, i) {
      var cx = LANE_W * i + LANE_W / 2 + (i === 0 ? 8 : 0);
      var p = t === null ? { d: 0, v: 0, landed: false } : at(obj, state.air, t);
      var y = TOP_Y + (p.d / HEIGHT_M) * FALL_PX;
      var x = cx, rot = 0;
      if (state.air && obj.flutter && !p.landed && p.d > 0) {
        x += Math.sin(t * 5 + i) * 10 * obj.flutter;
        rot = Math.sin(t * 5 + i + 1) * 18 * obj.flutter;
      }
      // position dots: where the object was every 0.1 s
      if (t !== null) {
        var tMax = Math.min(t, fall(obj, state.air).time);
        for (var k = 1; k * 0.1 < tMax; k++) {
          var dotY = TOP_Y + (at(obj, state.air, k * 0.1).d / HEIGHT_M) * FALL_PX;
          s += '<circle cx="' + cx + '" cy="' + dotY.toFixed(1) + '" r="2.5" style="fill:var(--ink-soft)"/>';
        }
      }
      s += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')">' + obj.svg + '</g>';

      // forces: a heavier object gets a longer gravitational force arrow
      // (the sheet and the paper ball have the same mass, so the same arrow).
      // Air resistance grows with speed until it equals the gravitational force.
      // Arrow lengths compare sizes only; they are not to exact scale.
      if (state.showForces && !p.landed) {
        var len = obj.gLen;
        var ax = x + (obj.id === 'sheet' ? 38 : 26);
        s += arrow(ax, y + 4, y + 4 + len, 'var(--e-heat)');
        if (state.air) {
          var airLen = len * Math.min(1, (p.v / obj.topSpeed) * (p.v / obj.topSpeed));
          s += arrow(ax, y - 4, y - 4 - airLen, 'var(--e-kinetic)');
        }
      }

      // label + time
      s += '<text class="svg-text" x="' + (LANE_W * i + LANE_W / 2) + '" y="' + (GROUND_Y + 20) + '" text-anchor="middle" style="font-size:14.5px">' + (obj.short || obj.name) + '</text>';
      if (p.landed) {
        var place = order.indexOf(obj.id);
        s += '<text class="svg-text" x="' + (LANE_W * i + LANE_W / 2) + '" y="' + (GROUND_Y + 42) + '" text-anchor="middle" style="font-size:16px;fill:var(--primary)">' +
          p.time.toFixed(2) + ' s</text>';
        if (state.air && place >= 0) {
          s += '<text class="svg-text" x="' + (LANE_W * i + LANE_W / 2) + '" y="' + (GROUND_Y - 38) + '" text-anchor="middle" style="font-size:14px">' + ['1st', '2nd', '3rd', '4th'][place] + '</text>';
        }
      }
    });

    $('scene').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + (GROUND_Y + 54) + '" role="img" aria-label="Four objects dropped from 2 metres ' +
      (state.air ? 'with air' : 'in a vacuum, with no air') + ': feather, flat sheet of paper, crumpled paper ball and metal ball.">' + s + '</svg>';
  }

  function landingOrder() {
    return OBJECTS.slice().sort(function (a, b) {
      return fall(a, state.air).time - fall(b, state.air).time;
    }).map(function (o) { return o.id; });
  }

  /* ---------- run ---------- */
  function drop() {
    if (state.running) return;
    state.running = true;
    setBusy(true);
    $('result').textContent = 'Falling…';
    var longest = Math.max.apply(null, OBJECTS.map(function (o) { return fall(o, state.air).time; }));

    if (reduceMotion) {
      draw(longest + 1);
      finish();
      return;
    }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = (ts - start) / 1000 / SLOW;
      draw(t);
      if (t <= longest) {
        state.anim = requestAnimationFrame(step);
      } else {
        finish();
      }
    }
    state.anim = requestAnimationFrame(step);
  }

  function finish() {
    state.running = false;
    setBusy(false);
    OBJECTS.forEach(function (o) {
      state.results[o.id] = state.results[o.id] || {};
      state.results[o.id][state.air ? 'air' : 'vacuum'] = fall(o, state.air).time;
    });
    renderTable();

    var res = $('result');
    if (!state.air) {
      res.innerHTML = 'With no air, all four objects landed <strong>at the same time</strong>: ' +
        fall(OBJECTS[0], false).time.toFixed(2) + ' s.';
    } else {
      var order = landingOrder().map(function (id) {
        var o = OBJECTS.filter(function (x) { return x.id === id; })[0];
        return o.name.toLowerCase() + ' (' + fall(o, true).time.toFixed(2) + ' s)';
      });
      res.innerHTML = 'With air: the <strong>' + order[0].replace(/ \(.*/, '') + '</strong> landed first and the <strong>' +
        order[3].replace(/ \(.*/, '') + '</strong> landed last. Order: ' + order.join(', ') + '.';
    }
  }

  function setBusy(busy) {
    $('drop-btn').disabled = busy;
    document.querySelectorAll('#air-choices .choice').forEach(function (b) { b.disabled = busy; });
  }

  function reset() {
    if (state.anim) cancelAnimationFrame(state.anim);
    state.running = false;
    setBusy(false);
    draw(null);
    $('result').innerHTML = 'Press <strong style="font-size:inherit">Drop!</strong> to start the race.';
  }

  function renderTable() {
    var body = $('results-body');
    body.innerHTML = '';
    OBJECTS.forEach(function (o) {
      var r = state.results[o.id] || {};
      var tr = document.createElement('tr');
      [o.name, r.air, r.vacuum].forEach(function (v, i) {
        var cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row';
        cell.textContent = i === 0 ? v : (v === undefined ? '–' : v.toFixed(2));
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var airButtons = document.querySelectorAll('#air-choices .choice');
    airButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        airButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        state.air = btn.getAttribute('data-air') === 'yes';
        reset();
      });
    });
    $('drop-btn').addEventListener('click', drop);
    $('reset-btn').addEventListener('click', reset);
    $('clear-btn').addEventListener('click', function () {
      state.results = {};
      renderTable();
    });
    $('forces-toggle').addEventListener('change', function (e) {
      state.showForces = e.target.checked;
      if (!state.running) draw(state.lastT);
    });
    renderTable();
    draw(null);
  });

  // exposed for quick checks in the browser console
  window.gravityModel = {
    times: function (air) {
      var out = {};
      OBJECTS.forEach(function (o) { out[o.id] = +fall(o, air).time.toFixed(3); });
      return out;
    }
  };
})();
