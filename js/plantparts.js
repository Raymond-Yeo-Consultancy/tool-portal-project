/*
 * Plant Parts (Primary 4, Systems)
 * Explore: tap a part of the plant to read what it does. Moving dashes show
 * water travelling from the roots, up the stem, to the leaves and flower.
 * Test yourself: name the numbered parts, then match parts to functions
 * (Activities.match in js/activities.js).
 *
 * The drawing is built once; selecting a part only changes its highlight.
 */
(function () {
  var PARTS = [
    { id: 'flower', n: 1, name: 'Flower', does: 'Helps the plant to reproduce',
      text: ['Flowers help the plant to reproduce.', 'After pollination, a flower can develop into a fruit with seeds inside. The seeds can grow into new plants.'] },
    { id: 'leaf', n: 2, name: 'Leaf', does: 'Makes food for the plant',
      text: ['Leaves make food for the plant. They need sunlight, water and air to do this.', 'Leaves also take in and give out gases through tiny openings.'] },
    { id: 'stem', n: 3, name: 'Stem', does: 'Holds the plant upright and carries water to the leaves',
      text: ['The stem holds the plant upright, so the leaves can get sunlight.', 'It carries water from the roots to the other parts of the plant, and food from the leaves to the other parts.'] },
    { id: 'roots', n: 4, name: 'Roots', does: 'Take in water and hold the plant in the soil',
      text: ['Roots take in water and mineral salts from the soil.', 'They also hold the plant firmly in the soil, so it is not blown over or washed away.'] }
  ];

  var state = { selected: null, mode: 'explore', built: false };
  var $ = function (id) { return document.getElementById(id); };

  function leaf(cx, cy, rot) {
    return '<g transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')">' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="46" ry="19" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"/>' +
      '<line x1="' + (cx - 44) + '" y1="' + cy + '" x2="' + (cx + 44) + '" y2="' + cy + '" style="stroke:var(--ink);stroke-width:1.5"/></g>';
  }

  function badge(x, y, n, tx, ty) {
    return '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + ty + '" style="stroke:var(--ink);stroke-width:1.5"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="14" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>' +
      '<text class="svg-text" x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" style="font-size:16px">' + n + '</text>';
  }

  function part(id, label, inner) {
    return '<g class="plant-part" role="button" tabindex="0" data-part="' + id + '" aria-label="' + label + '">' + inner + '</g>';
  }

  function build() {
    var s = '';
    // sun and soil
    s += '<circle cx="48" cy="48" r="24" style="fill:var(--e-light);stroke:var(--ink);stroke-width:2"/>';
    s += '<path d="M48 12 V2 M48 84 V94 M12 48 H2 M84 48 H94 M22 22 L15 15 M74 74 L81 81 M74 22 L81 15 M22 74 L15 81" style="stroke:var(--e-light);stroke-width:4;stroke-linecap:round"/>';
    s += '<rect x="0" y="282" width="320" height="118" style="fill:var(--ramp);opacity:0.35"/>';
    s += '<line class="svg-ground" x1="0" y1="282" x2="320" y2="282"/>';

    // roots
    s += part('roots', 'Part 4', '<path d="M160 282 V372 M160 300 Q130 310 108 346 M160 300 Q192 312 214 350 M160 326 Q140 340 132 376 M160 326 Q182 340 190 378 M124 322 Q104 326 92 340 M198 326 Q220 330 232 342" style="fill:none;stroke:var(--ramp);stroke-width:7;stroke-linecap:round"/>' +
      '<rect x="80" y="284" width="164" height="100" style="fill:transparent"/>');
    // stem
    s += part('stem', 'Part 3', '<rect x="154" y="112" width="12" height="172" rx="5" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"/><rect x="142" y="112" width="36" height="172" style="fill:transparent"/>');
    // leaves
    s += part('leaf', 'Part 2', leaf(112, 214, 24) + leaf(210, 178, -24) + leaf(114, 150, 20));
    // flower
    var petals = '';
    for (var i = 0; i < 6; i++) {
      var a = i * 60 * Math.PI / 180;
      petals += '<circle cx="' + (160 + Math.cos(a) * 24).toFixed(1) + '" cy="' + (88 + Math.sin(a) * 24).toFixed(1) + '" r="15" style="fill:var(--e-sound);stroke:var(--ink);stroke-width:2"/>';
    }
    s += part('flower', 'Part 1', petals + '<circle cx="160" cy="88" r="14" style="fill:var(--e-light);stroke:var(--ink);stroke-width:2"/>');

    // water moving up (not tappable)
    s += '<g id="water" style="pointer-events:none">' +
      '<path class="anim-flow" d="M108 346 Q130 310 160 300 V118 M214 350 Q192 312 160 300 M160 232 L128 220 M160 196 L196 184 M160 168 L130 156" style="fill:none;stroke:var(--e-kinetic);stroke-width:3.5"/></g>';

    // numbers
    s += badge(232, 62, 1, 196, 76) + badge(280, 166, 2, 252, 172) + badge(214, 252, 3, 168, 244) + badge(274, 322, 4, 222, 338);

    $('plant').innerHTML = '<svg viewBox="0 0 320 400" role="group" aria-label="A flowering plant with four numbered parts: 1 at the top, 2 on the side, 3 in the middle and 4 below the soil.">' + s + '</svg>';
  }

  function select(id) {
    state.selected = id;
    document.querySelectorAll('.plant-part').forEach(function (g) {
      g.classList.toggle('selected', g.getAttribute('data-part') === id);
    });
    document.querySelectorAll('#part-choices button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-part') === id));
    });
    var p = PARTS.filter(function (x) { return x.id === id; })[0];
    var panel = $('panel');
    panel.innerHTML = '';
    if (!p) {
      panel.appendChild(document.createElement('p')).textContent = 'Tap a part of the plant, or a number below, to find out what it does.';
      return;
    }
    panel.appendChild(document.createElement('h3')).textContent = p.n + '. ' + p.name;
    p.text.forEach(function (t) { panel.appendChild(document.createElement('p')).textContent = t; });
  }

  function setMode(mode) {
    state.mode = mode;
    $('mode-explore').setAttribute('aria-pressed', String(mode === 'explore'));
    $('mode-test').setAttribute('aria-pressed', String(mode === 'test'));
    $('explore-panel').hidden = mode !== 'explore';
    $('test-panel').hidden = mode !== 'test';
    if (mode === 'test') {
      select(null);
      if (!state.built) {
        Activities.match($('name-activity'), {
          prompt: 'Names of the parts',
          rows: PARTS.map(function (p) { return { prompt: 'Part ' + p.n, answer: p.name }; })
        });
        Activities.match($('function-activity'), {
          prompt: 'What the parts do',
          rows: PARTS.map(function (p) { return { prompt: p.name, answer: p.does }; })
        });
        state.built = true;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    build();
    var box = $('part-choices');
    PARTS.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.setAttribute('data-part', p.id);
      b.setAttribute('aria-pressed', 'false');
      b.textContent = 'Part ' + p.n;
      b.addEventListener('click', function () { select(p.id); });
      box.appendChild(b);
    });
    function pick(e) {
      var g = e.target.closest && e.target.closest('.plant-part');
      if (g && state.mode === 'explore') select(g.getAttribute('data-part'));
    }
    $('plant').addEventListener('click', pick);
    $('plant').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); }
    });
    $('water-toggle').addEventListener('change', function (e) {
      $('water').style.display = e.target.checked ? '' : 'none';
    });
    $('mode-explore').addEventListener('click', function () { setMode('explore'); });
    $('mode-test').addEventListener('click', function () { setMode('test'); });
    select(null);
  });

  // exposed for quick checks in the browser console
  window.plantpartsData = { PARTS: PARTS };
})();
