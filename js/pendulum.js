/*
 * Swinging Pendulum
 * A bob on a string is released from a height and swings. Its energy is
 * converted between gravitational potential energy (GPE) and kinetic energy (KE).
 *
 * Model (not shown to pupils), stepped forward in tiny time steps:
 *   change in swing speed = -(g / L) * sin(angle)  [- air resistance * speed]
 *   GPE = g * height            height = L * (1 - cos(angle))
 *   KE  = 1/2 * speed²          speed  = L * swing speed
 * (both per unit of mass). With air resistance, the energy taken from the
 * swing is added up as heat energy, so the total always stays the same.
 */
(function () {
  var G = 9.8; // m/s²
  var STRINGS = {
    short: { name: 'Short (50 cm)', m: 0.5 },
    long: { name: 'Long (100 cm)', m: 1.0 }
  };
  var MAX_HEIGHT_CM = 15;
  var E_MAX = G * MAX_HEIGHT_CM / 100; // energy at the highest release, used to scale the bars
  var AIR = 0.15; // air resistance strength
  var STEP = 0.0005; // seconds per physics step

  // scene geometry (SVG units)
  var PX_PER_M = 300;
  var PIVOT_X = 200;
  var PIVOT_Y = 26;

  var state = {
    string: 'long',
    heightCm: 10,
    air: false,
    angle: 0, // radians; positive = bob on the left
    speed: 0, // swing speed, radians per second
    heat: 0,
    released: false,
    running: false,
    stopAt: null, // 'high' | 'low': pause when the bob next gets there
    caption: '',
    lastTs: null,
    raf: null,
    runs: []
  };
  var $ = function (id) { return document.getElementById(id); };

  function len() { return STRINGS[state.string].m; }

  function releaseAngle(L, heightCm) {
    return Math.acos(1 - heightCm / 100 / L);
  }

  function energies() {
    var L = len();
    return {
      gpe: G * L * (1 - Math.cos(state.angle)),
      ke: 0.5 * L * L * state.speed * state.speed,
      heat: state.heat
    };
  }

  // Time for one complete swing (there and back), found by running the model
  // without air resistance until the bob has turned round twice.
  function swingTime(L, heightCm) {
    var a = releaseAngle(L, heightCm), w = 0, t = 0, turns = 0;
    while (turns < 2 && t < 20) {
      var before = w;
      w += -(G / L) * Math.sin(a) * STEP;
      a += w * STEP;
      t += STEP;
      if (before !== 0 && before * w < 0) turns += 1;
    }
    return t;
  }

  /* ---------- physics ---------- */
  function advance(dt) {
    var L = len();
    var steps = Math.ceil(dt / STEP);
    for (var i = 0; i < steps; i++) {
      var a0 = state.angle, w0 = state.speed;
      var accel = -(G / L) * Math.sin(a0) - (state.air ? AIR * w0 : 0);
      state.speed = w0 + accel * STEP;
      state.angle = a0 + state.speed * STEP;
      if (state.air) state.heat += AIR * L * L * state.speed * state.speed * STEP;

      var event = null;
      if (a0 !== 0 && a0 * state.angle <= 0) event = 'low';
      else if (w0 !== 0 && w0 * state.speed < 0) event = 'high';
      if (event && event === state.stopAt) {
        if (event === 'low') state.angle = 0;
        if (event === 'high') state.speed = 0;
        state.stopAt = null;
        state.running = false;
        return;
      }
    }
    // with air resistance the pendulum finally comes to rest
    var e = energies();
    if (state.air && e.gpe + e.ke < 0.01 * G * state.heightCm / 100) {
      state.running = false;
    }
  }

  /* ---------- drawing ---------- */
  function bobXY(angle) {
    var Lpx = len() * PX_PER_M;
    return { x: PIVOT_X - Math.sin(angle) * Lpx, y: PIVOT_Y + Math.cos(angle) * Lpx };
  }

  function drawScene() {
    var Lpx = len() * PX_PER_M;
    var a0 = releaseAngle(len(), state.heightCm);
    var lowY = PIVOT_Y + Lpx;
    var relY = lowY - state.heightCm / 100 * PX_PER_M;
    var left = bobXY(a0), right = bobXY(-a0), bob = bobXY(state.angle);
    var s = '';

    // support
    s += '<rect class="svg-fill" x="120" y="10" width="160" height="12" rx="3"/>';
    s += '<circle cx="' + PIVOT_X + '" cy="' + PIVOT_Y + '" r="4" style="fill:var(--ink)"/>';

    // path of the swing, release height line and lowest-point line
    s += '<path d="M' + left.x.toFixed(1) + ' ' + left.y.toFixed(1) + ' A' + Lpx + ' ' + Lpx + ' 0 0 0 ' + right.x.toFixed(1) + ' ' + right.y.toFixed(1) +
      '" style="fill:none;stroke:var(--ink-soft);stroke-width:1.5;stroke-dasharray:3 6"/>';
    s += '<line x1="20" y1="' + relY + '" x2="408" y2="' + relY + '" style="stroke:var(--e-gpe);stroke-width:1.5;stroke-dasharray:6 5"/>';
    s += '<line x1="20" y1="' + lowY + '" x2="408" y2="' + lowY + '" style="stroke:var(--ink-soft);stroke-width:1.5"/>';
    s += '<text class="svg-text" x="24" y="' + (lowY + 21) + '" style="font-size:16px">lowest point</text>';

    // release height marker, to the right of the swing so the bob never covers it
    s += '<path d="M400 ' + relY + ' V' + lowY + ' M394 ' + (relY + 7) + ' L400 ' + relY + ' L406 ' + (relY + 7) + ' M394 ' + (lowY - 7) + ' L400 ' + lowY + ' L406 ' + (lowY - 7) +
      '" style="fill:none;stroke:var(--ink);stroke-width:1.5"/>';
    s += '<text class="svg-text" x="414" y="' + ((relY + lowY) / 2 + 6) + '" style="font-size:16px">' + state.heightCm + ' cm</text>';
    s += '<text class="svg-text" x="476" y="' + (relY - 9) + '" text-anchor="end" style="font-size:16px">release height</text>';

    // string and bob
    s += '<line x1="' + PIVOT_X + '" y1="' + PIVOT_Y + '" x2="' + bob.x.toFixed(1) + '" y2="' + bob.y.toFixed(1) + '" style="stroke:var(--ink);stroke-width:2"/>';
    s += '<circle cx="' + bob.x.toFixed(1) + '" cy="' + bob.y.toFixed(1) + '" r="15" style="fill:var(--car);stroke:var(--ink);stroke-width:2.5"/>';

    $('scene').innerHTML = '<svg viewBox="-40 0 520 ' + (PIVOT_Y + STRINGS.long.m * PX_PER_M + 34) + '" role="img" aria-label="A pendulum with a ' +
      STRINGS[state.string].name.toLowerCase() + ' string, released from ' + state.heightCm + ' cm above its lowest point.">' + s + '</svg>';
  }

  function pct(v) { return Math.max(0, Math.min(100, v / E_MAX * 100)).toFixed(1) + '%'; }

  function drawBars() {
    var e = energies();
    $('bar-gpe').style.width = pct(e.gpe);
    $('bar-ke').style.width = pct(e.ke);
    $('bar-heat').style.width = pct(e.heat);
    $('total-gpe').style.width = pct(e.gpe);
    $('total-ke').style.width = pct(e.ke);
    $('total-heat').style.width = pct(e.heat);
  }

  function updateCaption() {
    var e = energies();
    var moving = e.gpe + e.ke;
    var key, text;
    if (!state.released) {
      key = 'start';
      text = 'The bob is held at its highest point. It has gravitational potential energy and no kinetic energy.';
    } else if (state.air && moving < 0.02 * G * state.heightCm / 100) {
      key = 'rest';
      text = 'The pendulum has almost stopped. Its energy has been converted into heat energy.';
    } else if (e.ke < 0.04 * moving) {
      key = 'high';
      text = 'Highest point: gravitational potential energy is greatest. The bob stops for a moment, so its kinetic energy is zero.';
    } else if (e.gpe < 0.04 * moving) {
      key = 'low';
      text = 'Lowest point: kinetic energy is greatest. The bob is moving fastest here.';
    } else if (state.angle * state.speed < 0) {
      key = 'down';
      text = 'Swinging down: gravitational potential energy is being converted into kinetic energy. The bob speeds up.';
    } else {
      key = 'up';
      text = 'Swinging up: kinetic energy is being converted into gravitational potential energy. The bob slows down.';
    }
    if (key !== state.caption) {
      state.caption = key;
      $('caption').textContent = text;
    }
  }

  function render() {
    drawScene();
    drawBars();
    updateCaption();
    $('pause-btn').textContent = state.running ? '⏸ Pause' : '▶ Play';
    $('pause-btn').disabled = !state.released;
    $('high-btn').disabled = !state.released;
    $('low-btn').disabled = !state.released;
    $('release-btn').textContent = state.released ? '↺ Restart' : 'Release!';
  }

  /* ---------- running ---------- */
  function tick(ts) {
    if (!state.running) {
      render();
      return;
    }
    if (state.lastTs === null) state.lastTs = ts;
    var dt = Math.min(0.05, (ts - state.lastTs) / 1000);
    state.lastTs = ts;
    advance(dt);
    render();
    if (state.running) state.raf = requestAnimationFrame(tick);
  }

  function start() {
    if (state.running) return;
    state.running = true;
    state.lastTs = null;
    render();
    state.raf = requestAnimationFrame(tick);
  }

  function hold() {
    // put the bob back at the release position, not moving
    if (state.raf) cancelAnimationFrame(state.raf);
    state.running = false;
    state.released = false;
    state.stopAt = null;
    state.angle = releaseAngle(len(), state.heightCm);
    state.speed = 0;
    state.heat = 0;
    $('heat-row').hidden = !state.air;
    render();
  }

  function release() {
    hold();
    state.released = true;
    var exists = state.runs.some(function (r) { return r.string === state.string && r.heightCm === state.heightCm; });
    if (!exists) {
      state.runs.push({ string: state.string, heightCm: state.heightCm, time: swingTime(len(), state.heightCm) });
      renderTable();
    }
    start();
  }

  function renderTable() {
    var body = $('results-body');
    body.innerHTML = '';
    if (!state.runs.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="3">No runs yet. Press Release! to start.</td></tr>';
      return;
    }
    state.runs.forEach(function (r) {
      var tr = document.createElement('tr');
      [STRINGS[r.string].name, r.heightCm + ' cm', r.time.toFixed(1) + ' s'].forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  function setupChoices(id, attr, onPick) {
    var buttons = document.querySelectorAll('#' + id + ' .choice');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        onPick(btn.getAttribute(attr));
        hold();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupChoices('height-choices', 'data-height', function (v) { state.heightCm = Number(v); });
    setupChoices('string-choices', 'data-string', function (v) { state.string = v; });
    $('air-toggle').addEventListener('change', function (e) {
      state.air = e.target.checked;
      hold();
    });
    $('release-btn').addEventListener('click', release);
    $('pause-btn').addEventListener('click', function () {
      if (state.running) {
        state.running = false;
        render();
      } else {
        state.stopAt = null;
        start();
      }
    });
    $('high-btn').addEventListener('click', function () { state.stopAt = 'high'; start(); });
    $('low-btn').addEventListener('click', function () { state.stopAt = 'low'; start(); });
    $('clear-btn').addEventListener('click', function () {
      state.runs = [];
      renderTable();
    });
    renderTable();
    hold();
  });

  // exposed for quick checks in the browser console
  window.pendulumModel = {
    swingTime: swingTime,
    releaseAngle: releaseAngle,
    // run the model for some seconds and report how well energy is conserved
    check: function (string, heightCm, air, seconds) {
      var keep = { string: state.string, heightCm: state.heightCm, air: state.air, angle: state.angle, speed: state.speed, heat: state.heat, stopAt: state.stopAt, running: state.running };
      state.string = string; state.heightCm = heightCm; state.air = air; state.stopAt = null;
      state.angle = releaseAngle(len(), heightCm); state.speed = 0; state.heat = 0;
      var e0 = energies().gpe, worst = 0, maxKe = 0;
      for (var t = 0; t < seconds; t += 0.01) {
        advance(0.01);
        var e = energies();
        worst = Math.max(worst, Math.abs(e.gpe + e.ke + e.heat - e0) / e0);
        maxKe = Math.max(maxKe, e.ke);
      }
      var end = energies();
      Object.keys(keep).forEach(function (k) { state[k] = keep[k]; });
      return { start: e0, maxKe: maxKe, endMoving: end.gpe + end.ke, endHeat: end.heat, worstTotalError: worst };
    }
  };
})();
