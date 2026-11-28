/*
 * Heart and Lungs (Primary 5, Systems)
 * A simple diagram of the human respiratory and circulatory systems.
 * The lungs breathe, the heart beats and blood travels round the body.
 * Choosing an activity (resting, walking, running) changes the breathing
 * rate and the heart rate, and the animation follows in real time.
 *
 * The diagram is built once. Each frame only moves the blood, and scales
 * the lungs and heart.
 */
(function () {
  var LEVELS = {
    rest: { name: 'Resting', breaths: 15, beats: 70 },
    walk: { name: 'Walking', breaths: 25, beats: 100 },
    run: { name: 'Running', breaths: 40, beats: 150 }
  };

  var PARTS = [
    { id: 'nose', n: 1, name: 'Nose', does: 'Lets air in and out of the body',
      text: 'Air enters and leaves the body through the nose. Hairs and mucus in the nose trap dust and germs in the air.' },
    { id: 'windpipe', n: 2, name: 'Windpipe', does: 'Carries air between the nose and the lungs',
      text: 'The windpipe is a tube. It carries air from the nose to the lungs, and back out again.' },
    { id: 'lungs', n: 3, name: 'Lungs', does: 'Where oxygen enters the blood and carbon dioxide leaves it',
      text: 'In the lungs, oxygen from the air passes into the blood. Carbon dioxide from the blood passes into the air, which is then breathed out. This is called exchange of gases.' },
    { id: 'heart', n: 4, name: 'Heart', does: 'Pumps blood to all parts of the body',
      text: 'The heart is a muscle that pumps blood. It pumps blood to the lungs to collect oxygen, and then to all parts of the body.' },
    { id: 'vessels', n: 5, name: 'Blood vessels', does: 'Tubes that carry blood around the body',
      text: 'Blood vessels are tubes that carry blood. The blood transports oxygen, digested food and water to all parts of the body, and carries carbon dioxide back to the lungs.' }
  ];

  // the route of the blood, as four stretches; rich = which gas the blood is rich in
  var ROUTE = [
    { rich: 'co2', pts: [[100, 356], [52, 356], [52, 240], [140, 240]] }, // body -> heart
    { rich: 'co2', pts: [[146, 226], [112, 204], [112, 176]] }, // heart -> lungs
    { rich: 'o2', pts: [[208, 176], [208, 204], [174, 226]] }, // lungs -> heart
    { rich: 'o2', pts: [[180, 240], [268, 240], [268, 356], [220, 356]] } // heart -> body
  ];
  var O2 = '#d1342b', CO2 = '#3b4c9b'; // red: rich in oxygen; dark blue: rich in carbon dioxide
  var DOTS = 16;

  var state = { level: 'rest', breath: 0, beat: 0, flow: 0, lastTs: null, selected: null, test: false, built: false, seen: {} };
  var $ = function (id) { return document.getElementById(id); };
  var lengths = [], totalLen = 0;

  function measure() {
    ROUTE.forEach(function (seg) {
      var d = 0;
      for (var i = 1; i < seg.pts.length; i++) d += Math.hypot(seg.pts[i][0] - seg.pts[i - 1][0], seg.pts[i][1] - seg.pts[i - 1][1]);
      lengths.push(d);
      totalLen += d;
    });
  }

  // where a drop of blood is, given how far round the loop it has gone (0 to 1)
  function bloodAt(p) {
    var want = (p % 1) * totalLen;
    for (var s = 0; s < ROUTE.length; s++) {
      if (want <= lengths[s]) {
        var pts = ROUTE[s].pts;
        for (var i = 1; i < pts.length; i++) {
          var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          if (want <= d) {
            var f = d ? want / d : 0;
            return { x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f, rich: ROUTE[s].rich };
          }
          want -= d;
        }
      }
      want -= lengths[s];
    }
    return { x: ROUTE[0].pts[0][0], y: ROUTE[0].pts[0][1], rich: 'co2' };
  }

  function part(id, n, inner) {
    return '<g class="plant-part" role="button" tabindex="0" data-part="' + id + '" aria-label="Part ' + n + '">' + inner + '</g>';
  }

  function badge(x, y, n, tx, ty) {
    return '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + ty + '" style="stroke:var(--ink);stroke-width:1.5"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="13" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>' +
      '<text class="svg-text" x="' + x + '" y="' + (y + 5.5) + '" text-anchor="middle" style="font-size:15px">' + n + '</text>';
  }

  function build() {
    var s = '';
    // blood vessels (drawn as wide tubes under everything else)
    var tubes = ROUTE.map(function (seg) {
      return '<polyline points="' + seg.pts.map(function (p) { return p.join(','); }).join(' ') + '" style="fill:none;stroke:' + (seg.rich === 'o2' ? O2 : CO2) + ';stroke-width:11;stroke-linejoin:round;stroke-linecap:round;opacity:0.3"/>';
    }).join('');
    s += part('vessels', 5, tubes);
    // rest of the body
    s += '<rect x="96" y="330" width="128" height="52" rx="12" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>';
    s += '<text class="svg-text" x="160" y="352" text-anchor="middle" style="font-size:13px">Rest of the body</text><text class="svg-text" x="160" y="370" text-anchor="middle" style="font-size:12px;font-weight:400">(muscles, brain, …)</text>';
    // windpipe and nose
    s += part('windpipe', 2, '<path d="M160 40 V84 M160 84 L128 106 M160 84 L192 106" style="fill:none;stroke:var(--ink);stroke-width:13;stroke-linecap:round"/>' +
      '<path d="M160 40 V84 M160 84 L128 106 M160 84 L192 106" style="fill:none;stroke:var(--surface);stroke-width:8;stroke-linecap:round"/>');
    s += part('nose', 1, '<path d="M148 40 Q160 4 172 40 Z" style="fill:var(--e-sound);stroke:var(--ink);stroke-width:2"/>');
    // lungs (they get bigger as you breathe in)
    s += part('lungs', 3, '<g id="lungs"><ellipse cx="112" cy="136" rx="42" ry="50" style="fill:var(--e-sound);stroke:var(--ink);stroke-width:2;opacity:0.85"/>' +
      '<ellipse cx="208" cy="136" rx="42" ry="50" style="fill:var(--e-sound);stroke:var(--ink);stroke-width:2;opacity:0.85"/></g>');
    // heart
    s += part('heart', 4, '<g id="heart"><path d="M160 262 C120 236 126 204 146 204 C154 204 160 212 160 218 C160 212 166 204 174 204 C194 204 200 236 160 262 Z" style="fill:var(--car);stroke:var(--ink);stroke-width:2"/></g>');
    // air arrows beside the nose
    s += '<g id="air-in"><path d="M196 8 V34 M188 26 L196 36 L204 26" style="fill:none;stroke:var(--text);stroke-width:3"/><text class="svg-text" x="212" y="26" style="font-size:12px">air in</text></g>';
    s += '<g id="air-out"><path d="M124 36 V10 M116 18 L124 8 L132 18" style="fill:none;stroke:var(--text);stroke-width:3"/><text class="svg-text" x="108" y="26" text-anchor="end" style="font-size:12px">air out</text></g>';
    // blood drops
    for (var i = 0; i < DOTS; i++) s += '<circle class="blood" r="5" style="stroke:#ffffff;stroke-width:1.5;pointer-events:none"/>';
    s += badge(30, 30, 1, 150, 30) + badge(290, 64, 2, 166, 64) + badge(290, 136, 3, 250, 136) + badge(290, 204, 4, 190, 226) + badge(30, 300, 5, 52, 300);
    $('diagram').innerHTML = '<svg viewBox="0 0 320 396" role="group" aria-label="A diagram of the nose, windpipe, lungs, heart and blood vessels, numbered 1 to 5. Blood travels from the heart to the lungs, back to the heart, round the body and back to the heart.">' + s + '</svg>';
  }

  function tick(ts) {
    if (state.lastTs === null) state.lastTs = ts;
    var dt = Math.min(0.05, (ts - state.lastTs) / 1000);
    state.lastTs = ts;
    var L = LEVELS[state.level];
    state.breath += dt * L.breaths / 60;
    state.beat += dt * L.beats / 60;
    state.flow += dt * L.beats / 70 / 9; // once round the body takes about 9 seconds at rest

    // lungs: breathe in for the first half of each breath, out for the second
    var bp = state.breath % 1;
    var inhale = bp < 0.5;
    var size = 1 + 0.08 * Math.sin(bp * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.04;
    $('lungs').setAttribute('transform', 'translate(160 136) scale(' + size.toFixed(3) + ') translate(-160 -136)');
    $('air-in').style.opacity = inhale ? 1 : 0.15;
    $('air-out').style.opacity = inhale ? 0.15 : 1;
    // heart: a quick squeeze at the start of each beat
    var hb = state.beat % 1;
    var squeeze = hb < 0.25 ? 1 + 0.12 * Math.sin(hb / 0.25 * Math.PI) : 1;
    $('heart').setAttribute('transform', 'translate(160 232) scale(' + squeeze.toFixed(3) + ') translate(-160 -232)');
    // blood
    document.querySelectorAll('#diagram .blood').forEach(function (c, i) {
      var b = bloodAt(state.flow + i / DOTS);
      c.setAttribute('cx', b.x.toFixed(1));
      c.setAttribute('cy', b.y.toFixed(1));
      c.style.fill = b.rich === 'o2' ? O2 : CO2;
    });
    requestAnimationFrame(tick);
  }

  function setLevel(id) {
    state.level = id;
    state.seen[id] = true;
    document.querySelectorAll('#level-choices button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-level') === id)); });
    var L = LEVELS[id];
    $('breaths').textContent = L.breaths + ' per minute';
    $('beats').textContent = L.beats + ' per minute';
    var body = $('results-body');
    body.innerHTML = '';
    ['rest', 'walk', 'run'].forEach(function (k) {
      var tr = document.createElement('tr');
      [LEVELS[k].name, state.seen[k] ? String(LEVELS[k].breaths) : '–', state.seen[k] ? String(LEVELS[k].beats) : '–'].forEach(function (v, i) {
        var cell = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) cell.scope = 'row';
        cell.textContent = v;
        tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
  }

  function selectPart(id) {
    state.selected = id;
    document.querySelectorAll('#diagram .plant-part').forEach(function (g) { g.classList.toggle('selected', g.getAttribute('data-part') === id); });
    document.querySelectorAll('#part-choices button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-part') === id)); });
    var p = PARTS.filter(function (x) { return x.id === id; })[0];
    var panel = $('panel');
    panel.innerHTML = '';
    if (!p) {
      panel.appendChild(document.createElement('p')).textContent = 'Tap a part of the diagram, or a number below, to find out what it does.';
      return;
    }
    panel.appendChild(document.createElement('h3')).textContent = p.n + '. ' + p.name;
    panel.appendChild(document.createElement('p')).textContent = p.text;
  }

  function setTest(on) {
    state.test = on;
    $('mode-explore').setAttribute('aria-pressed', String(!on));
    $('mode-test').setAttribute('aria-pressed', String(on));
    $('explore-panel').hidden = on;
    $('test-panel').hidden = !on;
    if (on) {
      selectPart(null);
      if (!state.built) {
        Activities.match($('name-activity'), { prompt: 'Names of the parts', rows: PARTS.map(function (p) { return { prompt: 'Part ' + p.n, answer: p.name }; }) });
        Activities.match($('function-activity'), { prompt: 'What the parts do', rows: PARTS.map(function (p) { return { prompt: p.name, answer: p.does }; }) });
        state.built = true;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    measure();
    build();
    var box = $('part-choices');
    PARTS.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.setAttribute('data-part', p.id);
      b.setAttribute('aria-pressed', 'false');
      b.textContent = String(p.n);
      b.setAttribute('aria-label', 'Part ' + p.n);
      b.addEventListener('click', function () { selectPart(p.id); });
      box.appendChild(b);
    });
    function pick(e) {
      var g = e.target.closest && e.target.closest('.plant-part');
      if (g && !state.test) selectPart(g.getAttribute('data-part'));
    }
    $('diagram').addEventListener('click', pick);
    $('diagram').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); }
    });
    document.querySelectorAll('#level-choices button').forEach(function (b) {
      b.addEventListener('click', function () { setLevel(b.getAttribute('data-level')); });
    });
    $('mode-explore').addEventListener('click', function () { setTest(false); });
    $('mode-test').addEventListener('click', function () { setTest(true); });
    selectPart(null);
    setLevel('rest');
    requestAnimationFrame(tick);
  });

  // exposed for quick checks in the browser console
  window.heartlungsData = { LEVELS: LEVELS, PARTS: PARTS, bloodAt: bloodAt };
})();
