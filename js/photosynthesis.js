/*
 * Photosynthesis Lab
 * A water plant in a beaker gives off bubbles of oxygen when it makes food.
 * Pupils change the light and the carbon dioxide in the water, then count
 * the bubbles given off in one minute.
 *
 * Simple model (not shown to pupils):
 *   bubbles per minute = 40 × light level × carbon dioxide level
 * where each level is 0 (none), 0.5 (some) or 1 (plenty). With no light or
 * no carbon dioxide there is no photosynthesis, so no bubbles.
 * The minute is shown speeded up; the counts are for one real minute.
 */
(function () {
  var MAX_RATE = 40; // bubbles per minute in bright light with plenty of carbon dioxide
  var SPEED = 6; // one minute is shown in 10 seconds
  var RISE_TIME = 1.4; // seconds (on screen) for a bubble to reach the surface

  var LIGHT = {
    dark: { name: 'Dark (lamp off)', level: 0 },
    dim: { name: 'Dim', level: 0.5 },
    bright: { name: 'Bright', level: 1 }
  };
  var CO2 = {
    none: { name: 'None', level: 0 },
    some: { name: 'Some', level: 0.5 },
    plenty: { name: 'Plenty', level: 1 }
  };

  // where bubbles leave the plant, and the water surface (SVG units)
  var TIPS = [{ x: 262, y: 178 }, { x: 290, y: 160 }, { x: 318, y: 186 }];
  var SURFACE_Y = 126;

  var state = {
    light: 'bright',
    co2: 'plenty',
    counting: false,
    minuteT: 0, // seconds of the counted minute so far
    count: 0,
    due: 0.5, // builds up to 1 for each bubble
    bubbles: [], // {tip, born}: bubbles on screen
    clock: 0, // on-screen seconds since the page opened
    lastTs: null,
    runs: []
  };
  var calmMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  function rate(light, co2) {
    return MAX_RATE * LIGHT[light].level * CO2[co2].level;
  }

  /* ---------- drawing ---------- */
  function stem(x, topY, lean) {
    // one stem of the water plant with pairs of small leaves
    var s = '<path d="M' + x + ' 296 Q' + (x + lean) + ' ' + ((296 + topY) / 2) + ' ' + x + ' ' + topY + '" style="fill:none;stroke:var(--e-chem);stroke-width:4;stroke-linecap:round"/>';
    for (var y = 282; y > topY + 6; y -= 18) {
      var f = (296 - y) / (296 - topY);
      var cx = x + lean * 2 * f * (1 - f);
      s += '<ellipse cx="' + (cx - 9).toFixed(1) + '" cy="' + (y - 3) + '" rx="9" ry="3.5" transform="rotate(25 ' + (cx - 9).toFixed(1) + ' ' + (y - 3) + ')" style="fill:var(--e-chem)"/>';
      s += '<ellipse cx="' + (cx + 9).toFixed(1) + '" cy="' + (y - 3) + '" rx="9" ry="3.5" transform="rotate(-25 ' + (cx + 9).toFixed(1) + ' ' + (y - 3) + ')" style="fill:var(--e-chem)"/>';
    }
    return s;
  }

  function draw() {
    var light = LIGHT[state.light].level;
    var s = '';

    // table
    s += '<line class="svg-ground" x1="10" y1="306" x2="410" y2="306"/>';

    // lamp: stand, arm and shade pointing at the beaker
    s += '<rect class="svg-fill" x="34" y="298" width="64" height="8" rx="3"/>';
    s += '<path class="svg-ink" d="M66 298 V120 L104 92"/>';
    s += '<polygon class="svg-fill" points="92,70 132,98 110,128 70,100"/>';
    s += '<circle cx="118" cy="116" r="11" style="fill:' + (light > 0 ? 'var(--e-light)' : 'var(--surface)') + ';stroke:var(--ink);stroke-width:2.5"/>';
    if (light > 0) {
      s += '<polygon points="128,104 372,120 372,300 112,130" style="fill:var(--e-light);opacity:' + (light === 1 ? 0.3 : 0.12) + '"/>';
    }
    s += '<text class="svg-text" x="66" y="326" text-anchor="middle" style="font-size:16px">Lamp: ' + (light === 0 ? 'off' : state.light) + '</text>';

    // beaker and water
    s += '<rect x="214" y="' + SURFACE_Y + '" width="152" height="' + (300 - SURFACE_Y) + '" style="fill:var(--e-kinetic);opacity:0.16"/>';
    s += '<path class="svg-ink" d="M206 96 L214 104 V300 Q214 304 218 304 H362 Q366 304 366 300 V104 L374 96"/>';
    s += '<line x1="214" y1="' + SURFACE_Y + '" x2="366" y2="' + SURFACE_Y + '" style="stroke:var(--e-kinetic);stroke-width:2"/>';
    s += '<text class="svg-text" x="290" y="326" text-anchor="middle" style="font-size:16px">Water plant</text>';

    // plant
    s += stem(262, TIPS[0].y, 10) + stem(290, TIPS[1].y, -8) + stem(318, TIPS[2].y, 12);

    // bubbles of oxygen
    state.bubbles.forEach(function (b) {
      var p = (state.clock - b.born) / RISE_TIME;
      var tip = TIPS[b.tip];
      var y = tip.y - 6 + (SURFACE_Y + 4 - (tip.y - 6)) * p;
      var x = tip.x + (calmMotion ? 0 : Math.sin(p * 9 + b.born) * 4);
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (3.5 + p * 1.5).toFixed(1) + '" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/>';
    });
    if (state.bubbles.length) {
      s += '<text class="svg-text" x="388" y="155" style="font-size:16px">oxygen</text>';
      s += '<path d="M384 150 H340" style="stroke:var(--ink);stroke-width:1.5"/>';
    }

    $('scene').innerHTML = '<svg viewBox="0 0 450 336" role="img" aria-label="A water plant in a beaker of water next to a lamp. Light: ' +
      LIGHT[state.light].name.toLowerCase() + '. Carbon dioxide in the water: ' + CO2[state.co2].name.toLowerCase() + '.">' + s + '</svg>';
  }

  /* ---------- running ---------- */
  function tick(ts) {
    if (state.lastTs === null) state.lastTs = ts;
    var dt = Math.min(0.05, (ts - state.lastTs) / 1000); // on-screen seconds
    state.lastTs = ts;
    state.clock += dt;

    var minuteDt = dt * SPEED;
    if (state.counting && state.minuteT + minuteDt > 60) minuteDt = 60 - state.minuteT;

    // release bubbles at a steady rate
    state.due += rate(state.light, state.co2) / 60 * minuteDt;
    while (state.due >= 1) {
      state.due -= 1;
      state.bubbles.push({ tip: Math.floor(Math.random() * TIPS.length), born: state.clock });
      if (state.counting) state.count += 1;
    }
    state.bubbles = state.bubbles.filter(function (b) { return state.clock - b.born < RISE_TIME; });

    if (state.counting) {
      state.minuteT += minuteDt;
      $('timer').textContent = Math.floor(state.minuteT) + ' s';
      $('counter').textContent = String(state.count);
      if (state.minuteT >= 60) finishCount();
    }
    draw();
    requestAnimationFrame(tick);
  }

  function startCount() {
    if (state.counting) return;
    state.counting = true;
    state.minuteT = 0;
    state.count = 0;
    state.due = 0.5; // so the bubbles are evenly spread through the minute
    $('timer').textContent = '0 s';
    $('counter').textContent = '0';
    $('result').textContent = 'Counting bubbles for one minute (speeded up)…';
    setBusy(true);
  }

  function finishCount() {
    state.counting = false;
    state.count = Math.round(rate(state.light, state.co2));
    $('timer').textContent = '60 s';
    $('counter').textContent = String(state.count);

    var prev = state.runs[state.runs.length - 1];
    $('fair-test-hint').hidden = !(prev && prev.light !== state.light && prev.co2 !== state.co2);
    state.runs.push({ light: state.light, co2: state.co2, count: state.count });
    renderTable();

    var res = $('result');
    if (state.count === 0) {
      var why = LIGHT[state.light].level === 0 && CO2[state.co2].level === 0 ? 'light or carbon dioxide'
        : LIGHT[state.light].level === 0 ? 'light' : 'carbon dioxide';
      res.innerHTML = '<strong>No bubbles.</strong> Without ' + why + ', the plant cannot carry out photosynthesis.';
    } else {
      res.innerHTML = 'In one minute the plant gave off <strong>' + state.count + ' bubbles</strong> of oxygen.';
    }
    setBusy(false);
  }

  function setBusy(busy) {
    $('count-btn').disabled = busy;
    document.querySelectorAll('.choice').forEach(function (b) { b.disabled = busy; });
  }

  function renderTable() {
    var body = $('results-body');
    body.innerHTML = '';
    if (!state.runs.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="4">No runs yet. Your results will appear here.</td></tr>';
      return;
    }
    state.runs.forEach(function (r, i) {
      var tr = document.createElement('tr');
      [String(i + 1), LIGHT[r.light].name, CO2[r.co2].name].forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      var td = document.createElement('td');
      td.className = 'bar-cell';
      var bar = document.createElement('span');
      bar.className = 'mini-bar';
      bar.style.width = (r.count / MAX_RATE * 100) + '%';
      var num = document.createElement('span');
      num.textContent = String(r.count);
      td.appendChild(num);
      td.appendChild(bar);
      tr.appendChild(td);
      body.appendChild(tr);
    });
  }

  function setupChoices(id, attr, onPick) {
    var buttons = document.querySelectorAll('#' + id + ' .choice');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        onPick(btn.getAttribute(attr));
        $('result').innerHTML = 'Press <strong style="font-size:inherit">Count bubbles</strong> to measure this set-up.';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupChoices('light-choices', 'data-light', function (v) { state.light = v; });
    setupChoices('co2-choices', 'data-co2', function (v) { state.co2 = v; });
    $('count-btn').addEventListener('click', startCount);
    $('clear-btn').addEventListener('click', function () {
      state.runs = [];
      $('fair-test-hint').hidden = true;
      renderTable();
    });
    renderTable();
    requestAnimationFrame(tick);
  });

  // exposed for quick checks in the browser console
  window.photoModel = { rate: rate, LIGHT: LIGHT, CO2: CO2 };
})();
