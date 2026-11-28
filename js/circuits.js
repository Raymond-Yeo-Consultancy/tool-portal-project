/*
 * Electric Circuits (Primary 5, Systems)
 * Two activities:
 *   build  – choose batteries, bulbs, series or parallel, and the switch;
 *            see how bright each bulb is and where the current flows
 *   tester – put objects in a gap in a circuit to find electrical
 *            conductors and insulators
 *
 * Brightness model (identical bulbs and batteries):
 *   series:   each bulb's share = batteries ÷ bulbs
 *   parallel: each bulb's share = batteries   (each bulb has its own path)
 *   a share of 1 is the brightness of one bulb on one battery.
 * No current flows if the switch is open, or if a bulb is removed from a
 * series circuit (the only path is broken). In a parallel circuit the other
 * bulbs have their own paths, so they stay lit.
 *
 * The circuit is redrawn only when a setting changes; the moving dashes
 * that show the current are a CSS animation.
 */
(function () {
  var OBJECTS = [
    { name: 'Steel spoon', emoji: '🥄', material: 'Steel', conducts: true },
    { name: 'Iron nail', emoji: '🔩', material: 'Iron', conducts: true },
    { name: 'Copper coin', emoji: '🪙', material: 'Copper', conducts: true },
    { name: 'Aluminium can', emoji: '🥫', material: 'Aluminium', conducts: true },
    { name: 'Plastic ruler', emoji: '📏', material: 'Plastic', conducts: false },
    { name: 'Wooden chopsticks', emoji: '🥢', material: 'Wood', conducts: false },
    { name: 'Rubber glove', emoji: '🧤', material: 'Rubber', conducts: false },
    { name: 'Glass marble', emoji: '🔮', material: 'Glass', conducts: false },
    { name: 'Paper', emoji: '📄', material: 'Paper', conducts: false }
  ];

  var state = {
    mode: 'build',
    batteries: 1, bulbs: 1, parallel: false, closed: true, removed: false,
    rows: [],
    object: null, tested: {}
  };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- the model ---------- */
  // brightness share of each bulb position (0 = not lit); the removed bulb is always the last one
  function brightness(c) {
    var out = [];
    for (var i = 0; i < c.bulbs; i++) {
      var gone = c.removed && i === c.bulbs - 1;
      var lit;
      if (!c.closed || gone) lit = 0;
      else if (c.parallel && c.bulbs > 1) lit = c.batteries;
      else lit = c.removed ? 0 : c.batteries / c.bulbs;
      out.push(lit);
    }
    return out;
  }

  function word(share) {
    return share === 0 ? 'not lit' : share < 0.45 ? 'very dim' : share < 0.9 ? 'dim' : share < 1.2 ? 'normal brightness' : share < 2.5 ? 'bright' : 'very bright';
  }

  /* ---------- drawing ---------- */
  function wire(d, flowing) {
    return '<path d="' + d + '" style="fill:none;stroke:var(--ink);stroke-width:3"/>' +
      (flowing ? '<path class="anim-flow" d="' + d + '" style="fill:none;stroke:var(--e-elec);stroke-width:3"/>' : '');
  }

  function bulb(x, y, share, gone) {
    var s = '';
    if (gone) {
      return '<circle cx="' + x + '" cy="' + y + '" r="16" style="fill:var(--surface-2);stroke:var(--ink);stroke-width:2;stroke-dasharray:4 4"/>' +
        '<text class="svg-text" x="' + x + '" y="' + (y - 24) + '" text-anchor="middle" style="font-size:12px">removed</text>';
    }
    if (share > 0) {
      var k = Math.min(3, share);
      s += '<circle cx="' + x + '" cy="' + y + '" r="' + (17 + k * 11) + '" style="fill:var(--e-light);opacity:' + (0.06 + k * 0.13) + '"/>';
    }
    s += '<circle cx="' + x + '" cy="' + y + '" r="16" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>';
    if (share > 0) s += '<circle cx="' + x + '" cy="' + y + '" r="16" style="fill:var(--e-light);opacity:' + Math.min(1, share * 0.55) + '"/>';
    s += '<path d="M' + (x - 8) + ' ' + (y + 6) + ' L' + (x - 4) + ' ' + (y - 6) + ' L' + x + ' ' + (y + 6) + ' L' + (x + 4) + ' ' + (y - 6) + ' L' + (x + 8) + ' ' + (y + 6) + '" style="fill:none;stroke:var(--ink);stroke-width:1.5"/>';
    return s;
  }

  function batteries(n, y) {
    var s = '', w = 44, x0 = 210 - n * w / 2;
    for (var i = 0; i < n; i++) {
      var x = x0 + i * w;
      s += '<rect x="' + (x + 2) + '" y="' + (y - 13) + '" width="' + (w - 10) + '" height="26" rx="3" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"/>' +
        '<rect x="' + (x - 3) + '" y="' + (y - 6) + '" width="5" height="12" style="fill:var(--ink)"/>' +
        '<text x="' + (x + w / 2 - 3) + '" y="' + (y + 5) + '" text-anchor="middle" style="font:700 13px var(--font);fill:#ffffff">+ −</text>';
    }
    return s;
  }

  function sw(x, y, closed) {
    return '<rect x="' + (x - 2) + '" y="' + (y - 4) + '" width="44" height="8" style="fill:var(--surface-2)"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="4.5" style="fill:var(--ink)"/><circle cx="' + (x + 40) + '" cy="' + y + '" r="4.5" style="fill:var(--ink)"/>' +
      (closed ? '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 40) + '" y2="' + y + '" style="stroke:var(--ink);stroke-width:4"/>'
        : '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 34) + '" y2="' + (y - 22) + '" style="stroke:var(--ink);stroke-width:4"/>') +
      '<text class="svg-text" x="' + (x + 20) + '" y="' + (y + 22) + '" text-anchor="middle" style="font-size:12px">switch ' + (closed ? 'closed' : 'open') + '</text>';
  }

  function drawBuild() {
    var c = state;
    var b = brightness(c);
    var top = 60, bot = 236, left = 44, right = 380;
    var par = c.parallel && c.bulbs > 1;
    var anyFlow = b.some(function (x) { return x > 0; });
    var s = '';
    if (!par) {
      s += wire('M' + left + ' ' + bot + ' V' + top + ' H' + right + ' V' + bot + ' H' + left, anyFlow);
      for (var i = 0; i < c.bulbs; i++) {
        var x = 170 + (c.bulbs === 1 ? 90 : i * 180 / (c.bulbs - 1));
        s += bulb(x, top, b[i], c.removed && i === c.bulbs - 1, i + 1);
      }
    } else {
      var xs = [];
      for (var k = 0; k < c.bulbs; k++) xs.push(right - (c.bulbs - 1 - k) * 74);
      // main wires carry current if any branch does; each branch only if its own bulb is in place
      s += wire('M' + left + ' ' + bot + ' V' + top + ' H' + xs[0], anyFlow);
      s += wire('M' + xs[0] + ' ' + bot + ' H' + left, anyFlow);
      xs.forEach(function (x, j) {
        if (j > 0) {
          var beyond = b.slice(j).some(function (v) { return v > 0; });
          s += wire('M' + xs[j - 1] + ' ' + top + ' H' + x, beyond) + wire('M' + x + ' ' + bot + ' H' + xs[j - 1], beyond);
        }
        s += wire('M' + x + ' ' + top + ' V' + bot, b[j] > 0);
        s += bulb(x, (top + bot) / 2, b[j], c.removed && j === c.bulbs - 1, j + 1);
      });
    }
    s += sw(84, top, c.closed);
    s += batteries(c.batteries, bot);
    $('scene').innerHTML = '<svg viewBox="0 0 420 290" role="img" aria-label="A circuit with ' + c.batteries + (c.batteries === 1 ? ' battery' : ' batteries') + ' and ' + c.bulbs +
      (c.bulbs === 1 ? ' bulb' : ' bulbs in ' + (par ? 'parallel' : 'series')) + '. The switch is ' + (c.closed ? 'closed' : 'open') + '.">' + s + '</svg>';
  }

  function describe() {
    var c = state, b = brightness(c);
    var lit = b.filter(function (x) { return x > 0; });
    var par = c.parallel && c.bulbs > 1;
    var text;
    if (!c.closed) {
      text = 'The switch is <strong>open</strong>, so the circuit is not complete. No current flows and no bulb lights up.';
    } else if (!lit.length) {
      text = c.bulbs === 1 ? 'The bulb has been removed. There is a gap in the circuit, so no current flows.'
        : 'One bulb has been removed. In a <strong>series</strong> circuit there is only one path, so the gap stops the current and <strong>all the bulbs go out</strong>.';
    } else if (c.removed) {
      text = 'One bulb has been removed. In a <strong>parallel</strong> circuit each bulb has its own path, so the other ' + (lit.length === 1 ? 'bulb stays' : 'bulbs stay') + ' lit: <strong>' + word(lit[0]) + '</strong>.';
    } else {
      text = (c.bulbs === 1 ? 'The bulb is' : 'Each bulb is') + ' <strong>' + word(lit[0]) + '</strong>. ' +
        (c.bulbs === 1 ? '' : par ? 'In parallel, each bulb has its own path to the batteries, so each is as bright as a single bulb would be.'
          : 'In series, the bulbs share the same single path, so each one is dimmer than a single bulb would be.');
    }
    $('result').innerHTML = text;
  }

  function record() {
    var c = state, b = brightness(c);
    var par = c.parallel && c.bulbs > 1;
    var row = [String(c.batteries), String(c.bulbs), c.bulbs === 1 ? '–' : par ? 'Parallel' : 'Series', c.closed ? 'Closed' : 'Open', c.removed ? 'Yes' : 'No',
      b.filter(function (x, i) { return !(c.removed && i === c.bulbs - 1); }).map(word).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') || 'no bulbs left'];
    var key = row.slice(0, 5).join('|');
    if (!state.rows.some(function (r) { return r.slice(0, 5).join('|') === key; })) state.rows.push(row);
    renderRows('results-body', state.rows, 6, 'No results yet. Set up a circuit and press Record.');
  }

  function renderRows(id, rows, cols, empty) {
    var body = $(id);
    body.innerHTML = '';
    if (!rows.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="' + cols + '">' + empty + '</td></tr>';
      return;
    }
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      r.forEach(function (v) { tr.appendChild(document.createElement('td')).textContent = v; });
      body.appendChild(tr);
    });
  }

  /* ---------- conductor tester ---------- */
  function drawTester() {
    var o = state.object === null ? null : OBJECTS[state.object];
    var on = !!(o && o.conducts);
    var top = 70, bot = 236, left = 44, right = 380;
    var s = '';
    s += wire('M' + left + ' ' + bot + ' V' + top + ' H230', on);
    s += wire('M300 ' + top + ' H' + right + ' V' + bot + ' H' + left, on);
    // crocodile clips either side of the gap
    s += '<polygon points="230,' + (top - 8) + ' 246,' + top + ' 230,' + (top + 8) + '" style="fill:var(--ink)"/><polygon points="300,' + (top - 8) + ' 284,' + top + ' 300,' + (top + 8) + '" style="fill:var(--ink)"/>';
    if (o) {
      s += '<text x="265" y="' + (top + 12) + '" text-anchor="middle" style="font-size:34px">' + o.emoji + '</text>';
      s += '<text class="svg-text" x="265" y="' + (top - 30) + '" text-anchor="middle" style="font-size:14px">' + o.name + '</text>';
    } else {
      s += '<text class="svg-text" x="265" y="' + (top - 16) + '" text-anchor="middle" style="font-size:14px">gap</text>';
    }
    s += bulb(130, top, on ? 2 : 0, false, 1);
    s += batteries(2, bot);
    $('scene').innerHTML = '<svg viewBox="0 0 420 290" role="img" aria-label="A circuit with two batteries, a bulb and a gap' + (o ? ' bridged by a ' + o.name.toLowerCase() : '') + '.">' + s + '</svg>';
  }

  function testObject(i) {
    state.object = i;
    state.tested[i] = true;
    document.querySelectorAll('#object-choices button').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-object')) === i)); });
    var o = OBJECTS[i];
    drawTester();
    $('result').innerHTML = o.conducts
      ? 'The bulb <strong>lights up</strong>. Electricity can pass through the ' + o.name.toLowerCase() + '. ' + o.material + ' is an <strong>electrical conductor</strong>.'
      : 'The bulb <strong>does not light up</strong>. Electricity cannot pass through the ' + o.name.toLowerCase() + '. ' + o.material + ' is an <strong>electrical insulator</strong>.';
    renderRows('tester-body', OBJECTS.filter(function (x, k) { return state.tested[k]; }).map(function (x) {
      return [x.name, x.material, x.conducts ? 'Yes' : 'No', x.conducts ? 'Conductor' : 'Insulator'];
    }), 4, '');
  }

  /* ---------- page ---------- */
  function refresh() {
    if (state.bulbs === 1) state.parallel = false;
    document.querySelectorAll('#layout-choices button').forEach(function (b) {
      b.disabled = state.bulbs === 1;
      b.setAttribute('aria-pressed', String((b.getAttribute('data-layout') === 'parallel') === state.parallel));
    });
    $('switch-btn').textContent = state.closed ? 'Open the switch' : 'Close the switch';
    $('remove-btn').textContent = state.removed ? 'Put the bulb back' : 'Remove one bulb';
    drawBuild();
    describe();
  }

  function pressGroup(id, attr, value) {
    document.querySelectorAll('#' + id + ' button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(value))); });
  }

  function setMode(mode) {
    state.mode = mode;
    pressGroup('mode-choices', 'data-mode', mode);
    $('build-controls').hidden = mode !== 'build';
    $('tester-controls').hidden = mode !== 'tester';
    $('build-table').hidden = mode !== 'build';
    $('tester-table').hidden = mode !== 'tester';
    if (mode === 'build') {
      refresh();
    } else {
      drawTester();
      if (state.object === null) $('result').textContent = 'There is a gap in this circuit, so the bulb is not lit. Choose an object to put in the gap.';
      else testObject(state.object);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#mode-choices button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
    document.querySelectorAll('#battery-choices button').forEach(function (b) {
      b.addEventListener('click', function () { state.batteries = Number(b.getAttribute('data-n')); pressGroup('battery-choices', 'data-n', state.batteries); refresh(); });
    });
    document.querySelectorAll('#bulb-choices button').forEach(function (b) {
      b.addEventListener('click', function () { state.bulbs = Number(b.getAttribute('data-n')); pressGroup('bulb-choices', 'data-n', state.bulbs); refresh(); });
    });
    document.querySelectorAll('#layout-choices button').forEach(function (b) {
      b.addEventListener('click', function () { state.parallel = b.getAttribute('data-layout') === 'parallel'; refresh(); });
    });
    $('switch-btn').addEventListener('click', function () { state.closed = !state.closed; refresh(); });
    $('remove-btn').addEventListener('click', function () { state.removed = !state.removed; refresh(); });
    $('record-btn').addEventListener('click', record);
    $('clear-btn').addEventListener('click', function () { state.rows = []; renderRows('results-body', state.rows, 6, 'No results yet. Set up a circuit and press Record.'); });

    var box = $('object-choices');
    OBJECTS.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.setAttribute('data-object', i);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="emoji" aria-hidden="true">' + o.emoji + '</span>';
      b.appendChild(document.createTextNode(o.name));
      b.addEventListener('click', function () { testObject(i); });
      box.appendChild(b);
    });
    renderRows('results-body', state.rows, 6, 'No results yet. Set up a circuit and press Record.');
    renderRows('tester-body', [], 4, 'No objects tested yet.');
    setMode('build');
  });

  // exposed for quick checks in the browser console
  window.circuitsModel = { brightness: brightness, word: word, OBJECTS: OBJECTS };
})();
