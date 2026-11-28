/*
 * Cells (Primary 5, Systems)
 * An animal cell and a plant cell side by side. Tap a part to read what it
 * does and which cells have it. Test yourself: name the numbered parts,
 * match parts to functions, and sort parts by which cells have them
 * (Activities in js/activities.js).
 *
 * The drawing is built once; selecting a part only changes its highlight.
 */
(function () {
  var PARTS = [
    { id: 'nucleus', n: 1, name: 'Nucleus', where: 'both', does: 'Controls all the activities in the cell',
      text: 'The nucleus controls all the activities that take place in the cell.' },
    { id: 'cytoplasm', n: 2, name: 'Cytoplasm', where: 'both', does: 'Jelly-like substance where the cell’s activities take place',
      text: 'The cytoplasm is a jelly-like substance that fills the cell. Most of the cell’s activities take place in it.' },
    { id: 'membrane', n: 3, name: 'Cell membrane', where: 'both', does: 'Controls what goes in and out of the cell',
      text: 'The cell membrane is a thin layer around the cytoplasm. It controls the substances that move in and out of the cell.' },
    { id: 'wall', n: 4, name: 'Cell wall', where: 'plant', does: 'Supports the cell and gives it a regular shape',
      text: 'The cell wall is a firm layer outside the cell membrane. It supports the plant cell and gives it a regular shape.' },
    { id: 'chloroplast', n: 5, name: 'Chloroplasts', where: 'plant', does: 'Contain chlorophyll, which traps light to make food',
      text: 'Chloroplasts contain chlorophyll, a green substance that traps light. The plant uses the light energy to make food.' }
  ];

  var state = { selected: null, test: false, built: false };
  var $ = function (id) { return document.getElementById(id); };

  function part(id, n, inner) {
    return '<g class="plant-part" role="button" tabindex="0" data-part="' + id + '" aria-label="Part ' + n + '">' + inner + '</g>';
  }

  function badge(x, y, n, tx, ty) {
    return '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + ty + '" style="stroke:var(--ink);stroke-width:1.5"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="13" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>' +
      '<text class="svg-text" x="' + x + '" y="' + (y + 5.5) + '" text-anchor="middle" style="font-size:15px">' + n + '</text>';
  }

  function build() {
    var blob = 'M40 150 C30 96 70 60 118 66 C166 58 196 100 188 146 C196 196 160 232 112 226 C70 236 44 200 40 150 Z';
    var s = '';
    s += '<text class="svg-text" x="114" y="34" text-anchor="middle" style="font-size:16px">Animal cell</text>';
    s += '<text class="svg-text" x="360" y="34" text-anchor="middle" style="font-size:16px">Plant cell</text>';

    // cell wall (plant only): a thick outer layer
    s += part('wall', 4, '<rect x="262" y="52" width="196" height="196" rx="8" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"/>');
    // cytoplasm: the filling of both cells
    s += part('cytoplasm', 2,
      '<path d="' + blob + '" style="fill:var(--e-light);opacity:0.35"/>' +
      '<rect x="274" y="64" width="172" height="172" rx="4" style="fill:var(--surface)"/>' +
      '<rect x="274" y="64" width="172" height="172" rx="4" style="fill:var(--e-light);opacity:0.35"/>');
    // cell membrane: the thin edge of the cytoplasm (with a wider invisible edge to make it easy to tap)
    s += part('membrane', 3,
      '<path d="' + blob + '" style="fill:none;stroke:var(--ink);stroke-width:3.5"/>' +
      '<path d="' + blob + '" style="fill:none;stroke:transparent;stroke-width:16"/>' +
      '<rect x="274" y="64" width="172" height="172" rx="4" style="fill:none;stroke:var(--ink);stroke-width:3.5"/>' +
      '<rect x="274" y="64" width="172" height="172" rx="4" style="fill:none;stroke:transparent;stroke-width:14"/>');
    // chloroplasts (plant only)
    var chl = '';
    [[306, 96, 20], [406, 104, -30], [300, 200, -20], [410, 196, 30], [356, 212, 0], [414, 150, 80]].forEach(function (c, i) {
      chl += '<ellipse class="chl" style="animation-delay:' + (i * 0.6) + 's;fill:var(--e-chem);stroke:var(--ink);stroke-width:1.5" cx="' + c[0] + '" cy="' + c[1] + '" rx="15" ry="8" transform="rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')"/>';
    });
    s += part('chloroplast', 5, chl);
    // nucleus in both cells
    s += part('nucleus', 1,
      '<circle cx="118" cy="146" r="26" style="fill:var(--e-gpe);stroke:var(--ink);stroke-width:2"/>' +
      '<circle cx="346" cy="146" r="26" style="fill:var(--e-gpe);stroke:var(--ink);stroke-width:2"/>');

    // numbers point at the plant cell, which has all five parts
    s += badge(486, 146, 1, 372, 146) + badge(486, 84, 2, 360, 92) + badge(486, 206, 3, 447, 206) + badge(360, 268, 4, 360, 244) + badge(238, 108, 5, 292, 98);
    $('cells').innerHTML = '<svg viewBox="0 0 506 286" role="group" aria-label="An animal cell with an irregular shape and a plant cell with a regular, box-like shape. The plant cell’s parts are numbered 1 to 5.">' + s + '</svg>';
  }

  function selectPart(id) {
    state.selected = id;
    document.querySelectorAll('#cells .plant-part').forEach(function (g) { g.classList.toggle('selected', g.getAttribute('data-part') === id); });
    document.querySelectorAll('#part-choices button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-part') === id)); });
    var p = PARTS.filter(function (x) { return x.id === id; })[0];
    var panel = $('panel');
    panel.innerHTML = '';
    if (!p) {
      panel.appendChild(document.createElement('p')).textContent = 'Tap a part of a cell, or a number below, to find out what it does.';
      return;
    }
    panel.appendChild(document.createElement('h3')).textContent = p.n + '. ' + p.name;
    var tag = panel.appendChild(document.createElement('p'));
    tag.innerHTML = '<span class="tag">' + (p.where === 'both' ? 'Found in animal cells and plant cells' : 'Found in plant cells only') + '</span>';
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
        Activities.sort($('where-activity'), {
          groups: [
            { id: 'both', name: 'Animal cells and plant cells', about: 'Both kinds of cell have this part.' },
            { id: 'plant', name: 'Plant cells only', about: 'Animal cells do not have this part.' }
          ],
          items: PARTS.map(function (p) {
            return { label: p.name, group: p.where, hint: p.where === 'both' ? 'Look at both drawings. Can you find this part in each cell?' : 'Look at the animal cell. Does it have this part?' };
          })
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
      b.textContent = String(p.n);
      b.setAttribute('aria-label', 'Part ' + p.n);
      b.addEventListener('click', function () { selectPart(p.id); });
      box.appendChild(b);
    });
    function pick(e) {
      var g = e.target.closest && e.target.closest('.plant-part');
      if (g && !state.test) selectPart(g.getAttribute('data-part'));
    }
    $('cells').addEventListener('click', pick);
    $('cells').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); }
    });
    $('mode-explore').addEventListener('click', function () { setTest(false); });
    $('mode-test').addEventListener('click', function () { setTest(true); });
    selectPart(null);
  });

  // exposed for quick checks in the browser console
  window.cellsData = { PARTS: PARTS };
})();
