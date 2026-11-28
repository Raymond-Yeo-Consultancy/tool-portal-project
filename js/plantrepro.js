/*
 * Plant Reproduction (Primary 5, Cycles)
 * Three activities, chosen with the buttons at the top:
 *   parts – tap the parts of a flower, then label them (Activities.match)
 *   story – step through pollination, fertilisation and fruit formation
 *   seeds – sort seeds by how they are dispersed (Activities.sort)
 */
(function () {
  var PARTS = [
    { id: 'petal', n: 1, name: 'Petal', kind: '', text: 'Petals are often brightly coloured and scented. They attract insects and other animals to the flower.' },
    { id: 'anther', n: 2, name: 'Anther', kind: 'Male part', text: 'The anther makes pollen grains. Pollen grains contain the male reproductive cells.' },
    { id: 'filament', n: 3, name: 'Filament', kind: 'Male part', text: 'The filament is a stalk that holds the anther up, where insects or the wind can reach the pollen.' },
    { id: 'stigma', n: 4, name: 'Stigma', kind: 'Female part', text: 'The stigma receives the pollen grains. It is often sticky so that pollen grains stay on it.' },
    { id: 'style', n: 5, name: 'Style', kind: 'Female part', text: 'The style joins the stigma to the ovary. The pollen tube grows down through it.' },
    { id: 'ovary', n: 6, name: 'Ovary', kind: 'Female part', text: 'The ovary contains the ovules. After fertilisation, the ovary develops into the fruit.' },
    { id: 'ovule', n: 7, name: 'Ovule', kind: 'Female part', text: 'Each ovule contains an egg cell, the female reproductive cell. After fertilisation, the ovule develops into a seed.' }
  ];

  var STEPS = [
    { title: 'Pollination', seconds: 3,
      text: 'A bee visits the flower to collect nectar. Pollen grains from the anther stick to its body and are carried to the stigma. The transfer of pollen grains from the anther to the stigma is called pollination.' },
    { title: 'A pollen tube grows', seconds: 2.4,
      text: 'A pollen tube grows out of the pollen grain. It grows down through the style and into the ovary, until it reaches an ovule.' },
    { title: 'Fertilisation', seconds: 2.4,
      text: 'The male reproductive cell travels down the pollen tube. It fuses with the egg cell in the ovule. This is called fertilisation.' },
    { title: 'Fruit and seeds form', seconds: 3,
      text: 'After fertilisation, the petals and the other parts of the flower wither and drop off. The ovary develops into the fruit. The ovules develop into seeds.' }
  ];

  var SEEDS = {
    groups: [
      { id: 'wind', name: 'By wind', about: 'Light, with wing-like or hair-like structures.' },
      { id: 'water', name: 'By water', about: 'Floats; has a waterproof covering or a fibrous husk.' },
      { id: 'animals', name: 'By animals', about: 'Fleshy and tasty, or has hooks that cling to fur.' },
      { id: 'splitting', name: 'By splitting', about: 'A dry pod that bursts open and flings the seeds out.' }
    ],
    items: [
      { label: 'Dandelion: tiny, with fine hairs like a parachute', group: 'wind', hint: 'Very light with hair-like structures: it can float in the air.' },
      { label: 'Angsana: light, with a papery wing', group: 'wind', hint: 'A wing-like structure helps it stay in the air and be blown away.' },
      { label: 'Shorea: two long wings that make it spin', group: 'wind', hint: 'Wings make it spin and fall slowly, so the wind can carry it further.' },
      { label: 'Coconut: fibrous husk that traps air', emoji: '🥥', group: 'water', hint: 'A fibrous husk that traps air helps it float.' },
      { label: 'Pong pong: fibrous husk, grows near water', group: 'water', hint: 'A fibrous husk lets it float away on water.' },
      { label: 'Lotus: spongy seed pod that floats', emoji: '🪷', group: 'water', hint: 'A spongy pod that floats can drift away on the pond.' },
      { label: 'Mango: sweet, juicy flesh', emoji: '🥭', group: 'animals', hint: 'Animals eat the sweet flesh and drop the seed somewhere else.' },
      { label: 'Papaya: fleshy, with many small seeds', group: 'animals', hint: 'Animals eat the fruit. The small seeds pass out in their droppings.' },
      { label: 'Love grass: tiny hooks', group: 'animals', hint: 'Hooks cling to the fur of passing animals and are carried away.' },
      { label: 'Rubber: hard pod that bursts open when dry', group: 'splitting', hint: 'The dry pod splits open with force and flings the seeds away.' },
      { label: 'Balsam: pod that springs open when touched', group: 'splitting', hint: 'The ripe pod springs open and shoots the seeds out.' },
      { label: 'Saga: pod that twists open when dry', group: 'splitting', hint: 'The dry pod splits and twists open, scattering the seeds.' }
    ]
  };

  var state = { mode: 'parts', selected: null, test: false, built: {}, step: 0, t: 1, running: false };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- the flower drawing ---------- */
  function part(id, n, inner) {
    return '<g class="plant-part" role="button" tabindex="0" data-part="' + id + '" aria-label="Part ' + n + '">' + inner + '</g>';
  }

  function badge(x, y, n, tx, ty) {
    return '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + ty + '" style="stroke:var(--ink);stroke-width:1.5"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="13" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>' +
      '<text class="svg-text" x="' + x + '" y="' + (y + 5.5) + '" text-anchor="middle" style="font-size:15px">' + n + '</text>';
  }

  // tappable = true adds buttons and numbers; false gives a plain picture for the story
  function flower(tappable, petalOpacity) {
    var wrap = tappable ? part : function (id, n, inner) { return '<g data-plain="' + id + '">' + inner + '</g>'; };
    var s = '';
    s += '<rect x="154" y="300" width="12" height="60" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"/>';
    s += '<path d="M120 300 Q160 318 200 300 L190 292 H130 Z" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2"/>';
    s += '<g style="opacity:' + petalOpacity + '">' + wrap('petal', 1,
      '<path d="M132 296 C40 280 20 150 86 96 C120 150 130 230 150 296 Z" style="fill:var(--e-sound);stroke:var(--ink);stroke-width:2"/>' +
      '<path d="M188 296 C280 280 300 150 234 96 C200 150 190 230 170 296 Z" style="fill:var(--e-sound);stroke:var(--ink);stroke-width:2"/>') + '</g>';
    s += '<g style="opacity:' + petalOpacity + '">' + wrap('filament', 3,
      '<path d="M144 294 Q120 240 112 176 M176 294 Q200 240 208 176" style="fill:none;stroke:var(--ink);stroke-width:7;stroke-linecap:round"/>' +
      '<path d="M144 294 Q120 240 112 176 M176 294 Q200 240 208 176" style="fill:none;stroke:var(--surface);stroke-width:3.5;stroke-linecap:round"/>') +
      wrap('anther', 2,
        '<ellipse cx="110" cy="164" rx="10" ry="17" style="fill:var(--e-light);stroke:var(--ink);stroke-width:2"/>' +
        '<ellipse cx="210" cy="164" rx="10" ry="17" style="fill:var(--e-light);stroke:var(--ink);stroke-width:2"/>') + '</g>';
    s += wrap('style', 5, '<rect x="154" y="148" width="12" height="98" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:2;opacity:' + Math.max(0.25, petalOpacity) + '"/>');
    s += wrap('stigma', 4, '<ellipse cx="160" cy="142" rx="17" ry="9" style="fill:var(--e-elec);stroke:var(--ink);stroke-width:2;opacity:' + Math.max(0.25, petalOpacity) + '"/>');
    return s;
  }

  function ovary(scale, fruit) {
    // the ovary swells into the fruit; the ovules become seeds
    return '<g transform="translate(160 268) scale(' + scale + ') translate(-160 -268)">' +
      '<g data-zone="ovary"><ellipse cx="160" cy="268" rx="28" ry="32" style="fill:' + (fruit ? 'var(--e-elec)' : 'var(--surface)') + ';stroke:var(--ink);stroke-width:2"/></g>' +
      '<g data-zone="ovule"><ellipse cx="150" cy="268" rx="7" ry="10" style="fill:' + (fruit ? 'var(--ramp)' : 'var(--e-chem)') + ';stroke:var(--ink);stroke-width:1.5"/>' +
      '<ellipse cx="170" cy="268" rx="7" ry="10" style="fill:' + (fruit ? 'var(--ramp)' : 'var(--e-chem)') + ';stroke:var(--ink);stroke-width:1.5"/></g></g>';
  }

  function buildParts() {
    var s = flower(true, 1);
    s += part('ovary', 6, '<ellipse cx="160" cy="268" rx="28" ry="32" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>');
    s += part('ovule', 7, '<ellipse cx="150" cy="268" rx="7" ry="10" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:1.5"/><ellipse cx="170" cy="268" rx="7" ry="10" style="fill:var(--e-chem);stroke:var(--ink);stroke-width:1.5"/>');
    s += badge(34, 110, 1, 70, 130) + badge(60, 60, 2, 104, 150) + badge(286, 216, 3, 204, 216) + badge(160, 92, 4, 160, 134) +
      badge(260, 60, 5, 166, 180) + badge(284, 290, 6, 188, 276) + badge(36, 316, 7, 146, 272);
    $('flower').innerHTML = '<svg viewBox="0 0 320 364" role="group" aria-label="A flower cut in half to show its parts, numbered 1 to 7.">' + s + '</svg>';
  }

  function selectPart(id) {
    state.selected = id;
    document.querySelectorAll('#flower .plant-part').forEach(function (g) { g.classList.toggle('selected', g.getAttribute('data-part') === id); });
    document.querySelectorAll('#part-choices button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-part') === id)); });
    var p = PARTS.filter(function (x) { return x.id === id; })[0];
    var panel = $('panel');
    panel.innerHTML = '';
    if (!p) {
      panel.appendChild(document.createElement('p')).textContent = 'Tap a part of the flower, or a number below, to find out what it does.';
      return;
    }
    panel.appendChild(document.createElement('h3')).textContent = p.n + '. ' + p.name;
    if (p.kind) {
      var tag = panel.appendChild(document.createElement('p'));
      tag.innerHTML = '<span class="tag">' + p.kind + ' of the flower</span>';
    }
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
      if (!state.built.label) {
        Activities.match($('label-activity'), { prompt: 'Names of the parts', rows: PARTS.map(function (p) { return { prompt: 'Part ' + p.n, answer: p.name }; }) });
        state.built.label = true;
      }
    }
  }

  /* ---------- the story: pollination to fruit ---------- */
  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }

  function drawStory() {
    var step = state.step, t = state.t;
    var fruiting = step === 3 ? ease(t) : 0;
    var s = flower(false, 1 - fruiting * 0.92);
    s += ovary(1 + fruiting * 0.9, fruiting > 0.5);
    // pollen grain on the stigma from the end of step 1 onwards
    var tubeEnd = step === 1 ? ease(t) : step > 1 ? 1 : 0;
    if (step === 0) {
      var fly = ease(t / 0.85);
      // the bee flies in an arc from the anther to the stigma, carrying pollen
      var bx = 110 + (160 - 110) * fly, by = 150 + (128 - 150) * fly - Math.sin(fly * Math.PI) * 46;
      s += '<text x="' + bx + '" y="' + by + '" text-anchor="middle" style="font-size:30px">🐝</text>';
      s += '<circle cx="' + (bx - 2) + '" cy="' + (by + 8) + '" r="4.5" style="fill:var(--e-light);stroke:var(--ink);stroke-width:1.5"/>';
    } else if (fruiting < 0.4) {
      s += '<circle cx="160" cy="138" r="4.5" style="fill:var(--e-light);stroke:var(--ink);stroke-width:1.5"/>';
    }
    // pollen tube from the stigma down to an ovule
    if (tubeEnd > 0 && fruiting < 0.4) {
      var len = 136 * tubeEnd; // total length of the path below
      s += '<path d="M160 140 V246 Q160 262 152 266" style="fill:none;stroke:var(--e-light);stroke-width:3.5;stroke-dasharray:' + len + ' 400"/>';
    }
    if (step === 2) {
      var go = ease(t / 0.8);
      var my = 140 + go * 126, mx = go > 0.84 ? 160 - (go - 0.84) / 0.16 * 8 : 160;
      s += '<circle cx="' + mx + '" cy="' + Math.min(my, 266) + '" r="4" style="fill:var(--car);stroke:var(--ink);stroke-width:1.5"/>';
      if (t > 0.8) s += '<circle cx="150" cy="268" r="' + (10 + (t - 0.8) * 60) + '" style="fill:none;stroke:var(--car);stroke-width:3;opacity:' + (1 - (t - 0.8) / 0.2) + '"/>';
    }
    if (step === 3 && t > 0.6) {
      s += '<text class="svg-text" x="160" y="196" text-anchor="middle" style="font-size:16px">fruit with seeds</text>';
    }
    $('story').innerHTML = '<svg viewBox="0 0 320 364" role="img" aria-label="Step ' + (step + 1) + ': ' + STEPS[step].title + '.">' + s + '</svg>';
  }

  function showStep(i, play) {
    state.step = i;
    $('step-title').textContent = 'Step ' + (i + 1) + ' of ' + STEPS.length + ': ' + STEPS[i].title;
    $('step-text').textContent = STEPS[i].text;
    $('prev-btn').disabled = i === 0;
    $('next-btn').disabled = i === STEPS.length - 1;
    if (!play) { state.t = 1; drawStory(); return; }
    state.running = true;
    var start = null, ms = STEPS[i].seconds * 1000;
    var mine = state.token = (state.token || 0) + 1;
    function frame(ts) {
      if (mine !== state.token) return; // another step was started
      if (start === null) start = ts;
      state.t = Math.min(1, (ts - start) / ms);
      drawStory();
      if (state.t < 1) requestAnimationFrame(frame); else state.running = false;
    }
    requestAnimationFrame(frame);
  }

  /* ---------- page ---------- */
  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('#mode-choices button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode)); });
    ['parts', 'story', 'seeds'].forEach(function (m) { $('lab-' + m).hidden = m !== mode; });
    if (mode === 'story') showStep(0, true);
    if (mode === 'seeds' && !state.built.seeds) {
      Activities.sort($('seed-activity'), SEEDS);
      state.built.seeds = true;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildParts();
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
    $('flower').addEventListener('click', pick);
    $('flower').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); }
    });
    $('mode-explore').addEventListener('click', function () { setTest(false); });
    $('mode-test').addEventListener('click', function () { setTest(true); });
    document.querySelectorAll('#mode-choices button').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
    $('prev-btn').addEventListener('click', function () { if (state.step > 0) showStep(state.step - 1, true); });
    $('next-btn').addEventListener('click', function () { if (state.step < STEPS.length - 1) showStep(state.step + 1, true); });
    $('replay-btn').addEventListener('click', function () { showStep(state.step, true); });
    selectPart(null);
    setMode('parts');
  });

  // exposed for quick checks in the browser console
  window.plantreproData = { PARTS: PARTS, STEPS: STEPS, SEEDS: SEEDS };
})();
