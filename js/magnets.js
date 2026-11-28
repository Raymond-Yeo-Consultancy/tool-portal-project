/*
 * Magnets Lab (Primary 3, Interactions)
 * Four experiments, chosen with the buttons at the top:
 *   poles    – bring two magnets together: like poles repel, unlike poles attract
 *   objects  – test which objects a magnet attracts
 *   strength – compare three magnets by the paper clips they pick up
 *   make     – make a magnet by stroking, or with electricity
 * Each experiment draws itself from state.t (0 to 1) while its animation runs.
 */
(function () {
  var OBJECTS = [
    { name: 'Iron nail', emoji: '🔩', material: 'Iron', magnetic: true },
    { name: 'Steel paper clip', emoji: '📎', material: 'Steel', magnetic: true },
    { name: 'Steel needle', emoji: '🪡', material: 'Steel', magnetic: true },
    { name: 'Aluminium can', emoji: '🥫', material: 'Aluminium', magnetic: false },
    { name: 'Copper coin', emoji: '🪙', material: 'Copper', magnetic: false },
    { name: 'Gold ring', emoji: '💍', material: 'Gold', magnetic: false },
    { name: 'Plastic ruler', emoji: '📏', material: 'Plastic', magnetic: false },
    { name: 'Wooden pencil', emoji: '✏️', material: 'Wood', magnetic: false },
    { name: 'Glass marble', emoji: '🔮', material: 'Glass', magnetic: false }
  ];
  var MAGNETS = { A: 4, B: 10, C: 6 }; // paper clips each magnet picks up
  var STROKE_CLIPS = { 0: 0, 10: 2, 20: 4, 40: 6 };
  var CLIPS_PER_BATTERY = 3;

  var TABLES = {
    poles: ['Poles facing each other', 'What happened'],
    objects: ['Object', 'Made of', 'Attracted by the magnet?'],
    strength: ['Magnet', 'Paper clips picked up'],
    make: ['How the nail was treated', 'Paper clips the nail picked up']
  };

  var state = {
    mode: 'poles',
    t: 0, running: false, done: false,
    flipL: false, flipR: false,
    object: 0,
    magnet: 'A',
    method: 'stroke', strokes: 10, batteries: 1, switchOn: false,
    rows: { poles: [], objects: [], strength: [], make: [] }
  };
  var $ = function (id) { return document.getElementById(id); };
  var RED = '#c62828', BLUE = '#1a56c4';

  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }

  /* ---------- drawing helpers ---------- */
  // a bar magnet; poles = [first, second] letters, e.g. ['S','N']
  function magnet(x, y, w, h, poles, vertical) {
    var c = function (p) { return p === 'N' ? RED : BLUE; };
    var s = '';
    if (vertical) {
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h / 2 + '" style="fill:' + c(poles[0]) + '"/>' +
        '<rect x="' + x + '" y="' + (y + h / 2) + '" width="' + w + '" height="' + h / 2 + '" style="fill:' + c(poles[1]) + '"/>' +
        letter(x + w / 2, y + h * 0.25, poles[0]) + letter(x + w / 2, y + h * 0.75, poles[1]);
    } else {
      s += '<rect x="' + x + '" y="' + y + '" width="' + w / 2 + '" height="' + h + '" style="fill:' + c(poles[0]) + '"/>' +
        '<rect x="' + (x + w / 2) + '" y="' + y + '" width="' + w / 2 + '" height="' + h + '" style="fill:' + c(poles[1]) + '"/>' +
        letter(x + w * 0.25, y + h / 2, poles[0]) + letter(x + w * 0.75, y + h / 2, poles[1]);
    }
    return s + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:none;stroke:var(--ink);stroke-width:2"/>';
  }

  function letter(x, y, ch) {
    return '<text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" style="font:700 17px var(--font);fill:#ffffff">' + ch + '</text>';
  }

  function clip(x, y) {
    return '<rect x="' + (x - 3.5) + '" y="' + y + '" width="7" height="15" rx="3.5" style="fill:none;stroke:var(--ink);stroke-width:1.8"/>';
  }

  // n clips hanging in chains below the point (x, y)
  function hanging(x, y, n, dir) {
    var s = '';
    for (var i = 0; i < n; i++) {
      var chain = Math.floor(i / 3), link = i % 3;
      s += clip(x + dir * chain * 11, y + link * 13);
    }
    return s;
  }

  function tray(n) {
    var s = '';
    for (var i = 0; i < n; i++) {
      s += '<g transform="translate(' + (110 + i * 13 + (i % 3) * 3) + ' ' + (204 + (i % 2) * 6) + ') rotate(' + ((i * 47) % 90 - 45) + ')">' + clip(0, -7) + '</g>';
    }
    return s;
  }

  function arrowH(x1, x2, y, color) {
    var dir = x2 > x1 ? 1 : -1;
    return '<line x1="' + x1 + '" y1="' + y + '" x2="' + (x2 - dir * 8) + '" y2="' + y + '" style="stroke:' + color + ';stroke-width:4"/>' +
      '<polygon points="' + x2 + ',' + y + ' ' + (x2 - dir * 12) + ',' + (y - 7) + ' ' + (x2 - dir * 12) + ',' + (y + 7) + '" style="fill:' + color + '"/>';
  }

  function label(x, y, text) {
    return '<text class="svg-text" x="' + x + '" y="' + y + '" text-anchor="middle" style="font-size:16px">' + text + '</text>';
  }

  /* ---------- the four experiments ---------- */
  function polesOf() {
    return { left: state.flipL ? ['N', 'S'] : ['S', 'N'], right: state.flipR ? ['N', 'S'] : ['S', 'N'] };
  }

  function drawPoles(t) {
    var p = polesOf();
    var attract = p.left[1] !== p.right[0];
    var near = ease(t / 0.5), after = ease((t - 0.5) / 0.5);
    var lx = 24 + near * 46, rx = 266 - near * 46; // close up to a small gap
    if (attract) { lx += after * 20; rx -= after * 20; } else { lx -= after * 66; rx += after * 66; }
    var s = magnet(lx, 100, 110, 38, p.left) + magnet(rx, 100, 110, 38, p.right);
    if (t > 0.5) {
      var c = 'var(--text)';
      if (attract) {
        s += arrowH(120, 170, 172, c) + arrowH(280, 230, 172, c) + label(200, 206, 'attract');
      } else {
        s += arrowH(170, 120, 172, c) + arrowH(230, 280, 172, c) + label(200, 206, 'repel');
      }
    }
    return s;
  }

  function drawObjects(t) {
    var o = OBJECTS[state.object];
    var down = ease(t / 0.4), up = ease((t - 0.65) / 0.35);
    var my = 8 + down * 62 - up * 50;
    var oy = 212;
    if (o.magnetic && t > 0.4) oy = 212 - ease((t - 0.4) / 0.12) * 16 - up * 50;
    var s = '<path class="svg-ink" d="M200 0 V' + my + '"/>' + magnet(182, my, 36, 104, ['S', 'N'], true);
    s += '<text x="200" y="' + oy + '" text-anchor="middle" style="font-size:36px">' + o.emoji + '</text>';
    return s + label(200, 246, o.name);
  }

  function drawStrength(t) {
    var n = MAGNETS[state.magnet];
    var down = ease(t / 0.4), up = ease((t - 0.55) / 0.45);
    var my = 30 + down * 134 - up * 104;
    var s = tray(t > 0.4 ? 14 - n : 14);
    s += '<path class="svg-ink" d="M200 0 V' + my + '"/>' + magnet(120, my, 160, 30, ['S', 'N']);
    if (t > 0.4) {
      s += hanging(128, my + 30, Math.ceil(n / 2), 1) + hanging(272, my + 30, Math.floor(n / 2), -1);
    }
    return s + label(200, 246, 'Magnet ' + state.magnet);
  }

  function nail(x, y) {
    return '<rect x="' + x + '" y="' + (y - 5) + '" width="150" height="10" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>' +
      '<rect x="' + (x - 8) + '" y="' + (y - 12) + '" width="8" height="24" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>' +
      '<polygon points="' + (x + 150) + ',' + (y - 5) + ' ' + (x + 166) + ',' + y + ' ' + (x + 150) + ',' + (y + 5) + '" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>';
  }

  function drawMake(t) {
    var s = '';
    if (state.method === 'stroke') {
      var n = STROKE_CLIPS[state.strokes];
      var stroking = state.strokes > 0 ? Math.min(1, t / 0.6) : 1;
      var lift = ease((t - 0.6) / 0.4);
      var ny = 196 - lift * 86;
      s += tray(t > 0.85 ? 14 - n : 14).replace(/translate\((\d+)/g, function (m, x) { return 'translate(' + (Number(x) + 150); });
      s += nail(110, ny);
      if (stroking < 1) {
        // three strokes, always in the same direction; the magnet is lifted on the way back
        var pass = (stroking * 3) % 1;
        var mx = pass < 0.7 ? 110 + (pass / 0.7) * 140 : 250 - ((pass - 0.7) / 0.3) * 140;
        var myy = pass < 0.7 ? 86 : 86 - Math.sin((pass - 0.7) / 0.3 * Math.PI) * 44;
        s += magnet(mx - 18, myy, 36, 100, ['S', 'N'], true);
        if (pass < 0.7) s += arrowH(150, 230, 62, 'var(--text)');
      }
      if (t > 0.85) s += hanging(272, ny + 6, n, -1);
      s += label(200, 246, state.strokes + ' strokes');
    } else {
      var on = state.switchOn;
      var m = on ? state.batteries * CLIPS_PER_BATTERY : 0;
      var grab = ease(t / 0.6); // clips move from the number shown before to the new number
      s += nail(110, 96);
      // coil of wire round the nail
      var coil = 'M124 110';
      for (var x = 124; x < 250; x += 12) coil += ' L' + (x + 6) + ' 82 L' + (x + 12) + ' 110';
      var flow = on ? ' class="anim-flow"' : '';
      s += '<path d="' + coil + '" style="fill:none;stroke:var(--e-elec);stroke-width:3"/>';
      s += '<path' + flow + ' d="M124 110 V40 H' + (160 + state.batteries * 34) + ' M256 110 V40 H' + (320) + '" style="fill:none;stroke:var(--e-elec);stroke-width:3"/>';
      for (var b = 0; b < state.batteries; b++) {
        s += '<rect x="' + (150 + b * 34) + '" y="28" width="30" height="24" rx="3" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"/>' +
          '<text x="' + (165 + b * 34) + '" y="45" text-anchor="middle" style="font:700 12px var(--font);fill:#ffffff">+ −</text>';
      }
      // switch between the last battery and the wire to the coil
      var sx = 150 + state.batteries * 34 + 10;
      s += '<circle cx="' + sx + '" cy="40" r="4" style="fill:var(--ink)"/><circle cx="320" cy="40" r="4" style="fill:var(--ink)"/>';
      s += on ? '<line x1="' + sx + '" y1="40" x2="320" y2="40" style="stroke:var(--ink);stroke-width:4"/>'
        : '<line x1="' + sx + '" y1="40" x2="' + (sx + (320 - sx) * 0.9) + '" y2="14" style="stroke:var(--ink);stroke-width:4"/>';
      s += label(sx + (320 - sx) / 2 + 40, 18, on ? 'switch on' : 'switch off');
      var shown = Math.round((state.shownClips || 0) + (m - (state.shownClips || 0)) * grab);
      s += tray(14 - shown).replace(/translate\((\d+)/g, function (mm, xx) { return 'translate(' + (Number(xx) + 150); });
      s += hanging(272, 104, shown, -1);
      s += label(120, 246, state.batteries + (state.batteries === 1 ? ' battery' : ' batteries'));
    }
    return s;
  }

  var DRAW = { poles: drawPoles, objects: drawObjects, strength: drawStrength, make: drawMake };

  function draw() {
    var s = '<line class="svg-ground" x1="10" y1="220" x2="390" y2="220"/>' + DRAW[state.mode](state.t);
    $('scene').innerHTML = '<svg viewBox="0 0 400 256" role="img" aria-label="Magnet experiment: ' + state.mode + '.">' + s + '</svg>';
  }

  /* ---------- running ---------- */
  function animate(ms, done) {
    if (state.running) return;
    state.running = true;
    state.t = 0;
    setBusy(true);
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      state.t = Math.min(1, (ts - start) / ms);
      draw();
      if (state.t < 1) {
        requestAnimationFrame(step);
      } else {
        state.running = false;
        setBusy(false);
        done();
      }
    }
    requestAnimationFrame(step);
  }

  function setBusy(busy) {
    document.querySelectorAll('.card button').forEach(function (b) {
      if (b.id !== 'theme-toggle') b.disabled = busy;
    });
  }

  function addRow(cells) {
    var rows = state.rows[state.mode];
    var key = cells[0];
    var at = -1;
    rows.forEach(function (r, i) { if (r[0] === key) at = i; });
    if (at === -1) rows.push(cells); else rows[at] = cells;
    renderTable();
  }

  function renderTable() {
    $('table-head').innerHTML = '';
    TABLES[state.mode].forEach(function (h) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = h;
      $('table-head').appendChild(th);
    });
    var body = $('results-body');
    body.innerHTML = '';
    var rows = state.rows[state.mode];
    if (!rows.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="' + TABLES[state.mode].length + '">No results yet.</td></tr>';
      return;
    }
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      r.forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  function say(html) { $('result').innerHTML = html; }

  function runPoles() {
    animate(1800, function () {
      var p = polesOf();
      var facing = p.left[1] + ' and ' + p.right[0];
      var attract = p.left[1] !== p.right[0];
      say(attract ? 'Unlike poles (' + facing + ') <strong>attract</strong>. The magnets pull together.'
        : 'Like poles (' + facing + ') <strong>repel</strong>. The magnets push each other away.');
      addRow([facing, attract ? 'Attract (pull together)' : 'Repel (push apart)']);
    });
  }

  function runObject() {
    animate(1900, function () {
      var o = OBJECTS[state.object];
      say(o.magnetic ? 'The magnet attracted the ' + o.name.toLowerCase() + '. ' + o.material + ' is a <strong>magnetic</strong> material.'
        : 'The magnet did not attract the ' + o.name.toLowerCase() + '. ' + o.material + ' is a <strong>non-magnetic</strong> material.');
      addRow([o.name, o.material, o.magnetic ? 'Yes' : 'No']);
    });
  }

  function runStrength() {
    animate(2000, function () {
      var n = MAGNETS[state.magnet];
      say('Magnet ' + state.magnet + ' picked up <strong>' + n + ' paper clips</strong>. Most of them cling to the two ends, the poles.');
      addRow(['Magnet ' + state.magnet, String(n)]);
    });
  }

  function runMake() {
    if (state.method === 'stroke') {
      animate(state.strokes ? 3200 : 1400, function () {
        var n = STROKE_CLIPS[state.strokes];
        say(n ? 'After ' + state.strokes + ' strokes, the nail picked up <strong>' + n + ' paper clips</strong>. The nail has become a magnet.'
          : 'The nail was not stroked. It picked up <strong>no paper clips</strong>. It is not a magnet.');
        addRow([state.strokes + ' strokes with a magnet', String(n)]);
      });
    } else {
      state.switchOn = !state.switchOn;
      $('switch-btn').textContent = state.switchOn ? 'Switch off' : 'Switch on';
      animate(1200, function () {
        var n = state.switchOn ? state.batteries * CLIPS_PER_BATTERY : 0;
        state.shownClips = n;
        say(state.switchOn ? 'With the switch on, the nail is an electromagnet. It picked up <strong>' + n + ' paper clips</strong>.'
          : 'With the switch off, no electricity flows. The nail is no longer a magnet and <strong>the paper clips fall off</strong>.');
        addRow([state.batteries + (state.batteries === 1 ? ' battery' : ' batteries') + ', switch ' + (state.switchOn ? 'on' : 'off'), String(n)]);
      });
    }
  }

  /* ---------- controls ---------- */
  function resetScene() {
    state.t = 0;
    state.switchOn = false;
    state.shownClips = 0;
    $('switch-btn').textContent = 'Switch on';
    draw();
  }

  function pressGroup(id, attr, value) {
    document.querySelectorAll('#' + id + ' button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(value)));
    });
  }

  function setMode(mode) {
    state.mode = mode;
    pressGroup('mode-choices', 'data-mode', mode);
    ['poles', 'objects', 'strength', 'make'].forEach(function (m) { $('controls-' + m).hidden = m !== mode; });
    $('stroke-controls').hidden = state.method !== 'stroke';
    $('electric-controls').hidden = state.method !== 'electric';
    say({
      poles: 'Turn the magnets round if you like, then bring them together.',
      objects: 'Pick an object, then test it with the magnet.',
      strength: 'Pick a magnet, then dip it into the paper clips.',
      make: 'An iron nail is not a magnet. Can you turn it into one?'
    }[mode]);
    resetScene();
    renderTable();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#mode-choices button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });

    // poles
    $('flip-left').addEventListener('click', function () { state.flipL = !state.flipL; resetScene(); });
    $('flip-right').addEventListener('click', function () { state.flipR = !state.flipR; resetScene(); });
    $('together-btn').addEventListener('click', runPoles);

    // objects
    var box = $('object-choices');
    OBJECTS.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.setAttribute('data-object', i);
      b.setAttribute('aria-pressed', String(i === 0));
      b.innerHTML = '<span class="emoji" aria-hidden="true">' + o.emoji + '</span>';
      b.appendChild(document.createTextNode(o.name));
      b.addEventListener('click', function () {
        state.object = i;
        pressGroup('object-choices', 'data-object', i);
        resetScene();
      });
      box.appendChild(b);
    });
    $('test-btn').addEventListener('click', runObject);

    // strength
    document.querySelectorAll('#magnet-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.magnet = b.getAttribute('data-magnet');
        pressGroup('magnet-choices', 'data-magnet', state.magnet);
        resetScene();
      });
    });
    $('dip-btn').addEventListener('click', runStrength);

    // make a magnet
    document.querySelectorAll('#method-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.method = b.getAttribute('data-method');
        pressGroup('method-choices', 'data-method', state.method);
        $('stroke-controls').hidden = state.method !== 'stroke';
        $('electric-controls').hidden = state.method !== 'electric';
        resetScene();
      });
    });
    document.querySelectorAll('#stroke-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.strokes = Number(b.getAttribute('data-strokes'));
        pressGroup('stroke-choices', 'data-strokes', state.strokes);
        resetScene();
      });
    });
    document.querySelectorAll('#battery-choices button').forEach(function (b) {
      b.addEventListener('click', function () {
        state.batteries = Number(b.getAttribute('data-batteries'));
        pressGroup('battery-choices', 'data-batteries', state.batteries);
        resetScene();
      });
    });
    $('stroke-btn').addEventListener('click', runMake);
    $('switch-btn').addEventListener('click', runMake);

    $('clear-btn').addEventListener('click', function () {
      state.rows[state.mode] = [];
      renderTable();
    });
    setMode('poles');
  });

  // exposed for quick checks in the browser console
  window.magnetsData = { OBJECTS: OBJECTS, MAGNETS: MAGNETS, STROKE_CLIPS: STROKE_CLIPS, CLIPS_PER_BATTERY: CLIPS_PER_BATTERY };
})();
