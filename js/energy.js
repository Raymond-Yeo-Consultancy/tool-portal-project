/*
 * Energy Conversion
 * Each example (scenario) has an illustration and an energy conversion chain,
 * e.g. chemical potential energy -> electrical energy -> light energy (+ heat).
 * To add an example, add one object to SCENARIOS below.
 *
 * Scenario fields:
 *   id, name, emoji   – used on the picker button
 *   svg               – inline SVG drawing (viewBox 0 0 400 300). Parts that light up
 *                       are <g data-part="..."> groups; animations go on inner elements.
 *   steps[]           – the chain, in order:
 *       e       energy forms produced at this step (keys of ENERGY)
 *       wasted  less useful forms also produced (shown dashed)
 *       parts   data-part names to light up in the drawing
 *                 (in the SVG, data-on="1 2" makes a piece animate only in those
 *                 steps, counted from 0; class hide-off also hides it otherwise)
 *       text    caption explaining the step
 *       hint    clue shown in "Test yourself" if this step is wrong
 */
(function () {
  var ENERGY = {
    kinetic: { name: 'Kinetic energy', icon: '🏃', color: '--e-kinetic', about: 'Energy of a moving object.' },
    gpe: { name: 'Gravitational potential energy', icon: '⬆️', color: '--e-gpe', about: 'Energy stored in an object because of its height above the ground.' },
    epe: { name: 'Elastic potential energy', icon: '🌀', color: '--e-epe', about: 'Energy stored in a stretched or compressed spring, or a stretched rubber band.' },
    chem: { name: 'Chemical potential energy', icon: '🔋', color: '--e-chem', about: 'Energy stored in food, fuels and batteries.' },
    elec: { name: 'Electrical energy', icon: '⚡', color: '--e-elec', about: 'Energy carried by electricity flowing in a circuit.' },
    light: { name: 'Light energy', icon: '💡', color: '--e-light', about: 'Energy given out by the Sun, bulbs and flames.' },
    heat: { name: 'Heat energy', icon: '🔥', color: '--e-heat', about: 'Energy that flows from a hotter place to a colder place.' },
    sound: { name: 'Sound energy', icon: '🔊', color: '--e-sound', about: 'Energy produced by vibrating objects.' }
  };
  var ENERGY_ORDER = ['kinetic', 'gpe', 'epe', 'chem', 'elec', 'light', 'heat', 'sound'];

  var GROUND = function (y) {
    return '<line class="svg-ground" x1="10" y1="' + y + '" x2="390" y2="' + y + '"/>';
  };

  var SCENARIOS = [
    {
      id: 'torch', name: 'Torch', emoji: '🔦',
      svg:
        '<rect class="svg-fill" x="60" y="118" width="200" height="64" rx="12"/>' +
        '<rect class="svg-fill" x="150" y="106" width="30" height="12" rx="3"/>' +
        '<polygon class="svg-fill" points="260,112 300,96 300,204 260,188"/>' +
        '<g data-part="battery">' +
          '<rect x="80" y="134" width="68" height="32" rx="4" style="fill:var(--e-chem)" class="svg-ink"/>' +
          '<rect x="154" y="134" width="68" height="32" rx="4" style="fill:var(--e-chem)" class="svg-ink"/>' +
          '<text class="svg-text" x="114" y="156" text-anchor="middle">−  +</text>' +
          '<text class="svg-text" x="188" y="156" text-anchor="middle">−  +</text>' +
        '</g>' +
        '<g data-part="wire"><path class="anim-flow" data-on="1 2" d="M222 150 H280 M284 160 L270 176 H80 Q66 176 66 168 Q66 150 80 150" style="stroke:var(--e-elec);stroke-width:4;fill:none;stroke-linecap:round"/></g>' +
        '<g data-part="bulb">' +
          '<polygon class="anim-glow hide-off" data-on="2" points="304,112 392,62 392,238 304,188" style="fill:var(--e-light);opacity:.45"/>' +
          '<circle class="svg-fill" cx="290" cy="150" r="14"/>' +
          '<circle class="svg-ink hide-off" data-on="2" cx="290" cy="150" r="14" style="fill:var(--e-light)"/>' +
        '</g>' +
        '<text class="svg-text" x="160" y="230" text-anchor="middle">Switch on</text>',
      steps: [
        { e: ['chem'], parts: ['battery'], text: 'The batteries store chemical potential energy.', hint: 'What kind of energy is stored in a battery?' },
        { e: ['elec'], parts: ['wire'], text: 'When the torch is switched on, the chemical potential energy is converted into electrical energy, which flows through the circuit.', hint: 'What flows through the wires of a circuit?' },
        { e: ['light'], wasted: ['heat'], parts: ['bulb'], text: 'The bulb converts electrical energy into light energy. Some heat energy is also produced, so the bulb gets warm.', hint: 'What does the bulb give out that helps us see?' }
      ]
    },
    {
      id: 'ball', name: 'Falling ball', emoji: '⚽',
      svg:
        GROUND(260) +
        '<path class="svg-ink" d="M60 260 V80 M50 92 L60 78 L70 92"/>' +
        '<text class="svg-text" x="72" y="180">height</text>' +
        '<g data-part="ball"><circle class="anim-fall" data-on="1" data-done="2" cx="200" cy="90" r="20" style="fill:var(--car);stroke:var(--ink);stroke-width:3;--end:translateY(150px)"/></g>' +
        '<g data-part="impact"><g class="hide-off" data-on="2">' +
          '<path class="svg-ink" d="M168 248 l-16 -10 M164 258 l-20 0 M232 248 l16 -10 M236 258 l20 0"/>' +
          '<text class="svg-text" x="300" y="240" text-anchor="middle">thud!</text>' +
        '</g></g>',
      steps: [
        { e: ['gpe'], parts: ['ball'], text: 'The ball held high above the ground has gravitational potential energy.', hint: 'What kind of energy does an object have because of its height?' },
        { e: ['kinetic'], parts: ['ball'], text: 'As the ball falls, its gravitational potential energy is converted into kinetic energy. It moves faster and faster.', hint: 'What kind of energy does a moving object have?' },
        { e: ['sound', 'heat'], parts: ['impact'], text: 'When the ball hits the ground, its kinetic energy is converted into sound energy and heat energy.', hint: 'You can hear the ball land, and the ball and floor warm up a tiny bit.' }
      ]
    },
    {
      id: 'toycar', name: 'Wind-up toy car', emoji: '🚙',
      svg:
        GROUND(252) +
        '<g class="anim-drive" data-on="1">' +
          '<g data-part="car">' +
            '<path d="M80 180 L100 152 H160 L178 180 Z" style="fill:var(--car);stroke:var(--ink);stroke-width:3;stroke-linejoin:round"/>' +
            '<rect x="60" y="180" width="140" height="50" rx="10" style="fill:var(--car);stroke:var(--ink);stroke-width:3"/>' +
            '<circle cx="92" cy="236" r="15" style="fill:var(--wheel)"/>' +
            '<circle cx="170" cy="236" r="15" style="fill:var(--wheel)"/>' +
          '</g>' +
          '<g data-part="spring">' +
            '<rect class="svg-fill" x="80" y="190" width="80" height="30" rx="4"/>' +
            '<polyline points="86,205 93,195 100,215 107,195 114,215 121,195 128,215 135,195 142,215 149,195 155,205" style="fill:none;stroke:var(--e-epe);stroke-width:3;stroke-linejoin:round"/>' +
            '<rect class="svg-fill" x="200" y="198" width="22" height="6"/>' +
            '<ellipse class="svg-fill anim-wind" data-on="0" cx="230" cy="201" rx="9" ry="16"/>' +
          '</g>' +
        '</g>',
      steps: [
        { e: ['epe'], parts: ['spring'], text: 'Turning the key winds up the spring inside the car. The wound-up spring stores elastic potential energy.', hint: 'What kind of energy is stored in a wound-up or compressed spring?' },
        { e: ['kinetic'], wasted: ['sound', 'heat'], parts: ['car'], text: 'As the spring unwinds, elastic potential energy is converted into kinetic energy and the car moves. Some sound energy and heat energy are also produced.', hint: 'What kind of energy does the car have when it moves?' }
      ]
    },
    {
      id: 'solarfan', name: 'Solar-powered fan', emoji: '☀️',
      svg:
        GROUND(250) +
        '<g data-part="sun">' +
          '<circle cx="70" cy="70" r="30" style="fill:var(--e-light);stroke:var(--ink);stroke-width:3"/>' +
          '<g class="anim-glow"><path d="M70 22 V8 M70 118 V132 M22 70 H8 M118 70 H132 M36 36 L26 26 M104 104 L114 114 M104 36 L114 26 M36 104 L26 114 M120 110 L140 160" style="stroke:var(--e-light);stroke-width:4;stroke-linecap:round"/></g>' +
        '</g>' +
        '<g data-part="panel">' +
          '<polygon points="40,232 150,232 170,182 60,182" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:3;stroke-linejoin:round"/>' +
          '<path class="svg-ink" d="M77 232 L97 182 M113 232 L133 182 M50 207 H160" style="stroke-width:2"/>' +
          '<path class="svg-ink" d="M95 232 V250"/>' +
        '</g>' +
        '<g data-part="wire"><path class="anim-flow" data-on="1 2" d="M160 212 H240 Q260 212 260 232 V244 H290" style="stroke:var(--e-elec);stroke-width:4;fill:none;stroke-linecap:round"/></g>' +
        '<rect class="svg-fill" x="290" y="170" width="12" height="80"/>' +
        '<rect class="svg-fill" x="268" y="242" width="56" height="8" rx="3"/>' +
        '<g data-part="fan">' +
          '<g class="anim-spin-fast" data-on="2">' +
            '<ellipse cx="296" cy="150" rx="52" ry="11" style="fill:var(--e-kinetic);stroke:var(--ink);stroke-width:2"/>' +
            '<ellipse cx="296" cy="150" rx="11" ry="52" style="fill:var(--e-kinetic);stroke:var(--ink);stroke-width:2"/>' +
          '</g>' +
          '<circle class="svg-fill" cx="296" cy="150" r="11"/>' +
        '</g>',
      steps: [
        { e: ['light'], parts: ['sun'], text: 'Light energy from the Sun shines on the solar panel.', hint: 'What does the Sun give out that we can see?' },
        { e: ['elec'], parts: ['panel', 'wire'], text: 'The solar panel converts light energy into electrical energy.', hint: 'What does a solar panel produce that can power a machine?' },
        { e: ['kinetic'], wasted: ['sound', 'heat'], parts: ['fan'], text: 'The fan’s motor converts electrical energy into kinetic energy, so the blades turn. Some sound energy and heat energy are also produced.', hint: 'The blades are moving. What kind of energy is that?' }
      ]
    },
    {
      id: 'turbine', name: 'Wind turbine', emoji: '🌬️',
      svg:
        GROUND(255) +
        '<g data-part="wind"><g class="anim-glow">' +
          '<path d="M20 70 q25 -12 50 0 t50 0 M10 115 q25 -12 50 0 t50 0 M30 160 q25 -12 50 0 t50 0" style="fill:none;stroke:var(--e-kinetic);stroke-width:4;stroke-linecap:round"/>' +
        '</g></g>' +
        '<polygon class="svg-fill" points="244,112 256,112 266,255 234,255"/>' +
        '<g data-part="blades"><g class="anim-spin">' +
          '<circle cx="250" cy="100" r="74" style="fill:transparent"/>' +
          '<path d="M250 100 L243 36 Q250 24 257 36 Z" class="svg-fill"/>' +
          '<path d="M250 100 L243 36 Q250 24 257 36 Z" class="svg-fill" transform="rotate(120 250 100)"/>' +
          '<path d="M250 100 L243 36 Q250 24 257 36 Z" class="svg-fill" transform="rotate(240 250 100)"/>' +
        '</g></g>' +
        '<g data-part="generator">' +
          '<rect x="236" y="88" width="36" height="24" rx="7" style="fill:var(--e-elec);stroke:var(--ink);stroke-width:3"/>' +
          '<circle class="svg-fill" cx="250" cy="100" r="7"/>' +
        '</g>' +
        '<g data-part="wire"><path class="anim-flow" data-on="2" d="M266 250 H330" style="stroke:var(--e-elec);stroke-width:4;stroke-linecap:round"/></g>' +
        '<g data-part="house">' +
          '<polygon class="svg-fill" points="320,215 352,186 384,215"/>' +
          '<rect class="svg-fill" x="326" y="215" width="52" height="40"/>' +
          '<rect x="342" y="224" width="18" height="16" style="fill:var(--e-light);stroke:var(--ink);stroke-width:2"/>' +
        '</g>',
      steps: [
        { e: ['kinetic'], parts: ['wind'], text: 'The wind is moving air, so it has kinetic energy.', hint: 'Wind is air that is moving. What kind of energy do moving things have?' },
        { e: ['kinetic'], parts: ['blades'], text: 'The wind pushes the blades and makes them turn. The turning blades have kinetic energy.', hint: 'The blades are turning. What kind of energy is that?' },
        { e: ['elec'], wasted: ['sound', 'heat'], parts: ['generator', 'wire', 'house'], text: 'The generator converts the kinetic energy into electrical energy for our homes. Some sound energy and heat energy are also produced.', hint: 'What kind of energy reaches our homes through the cables?' }
      ]
    },
    {
      id: 'runner', name: 'Eating and running', emoji: '🍎',
      svg:
        GROUND(240) +
        '<g data-part="food">' +
          '<circle cx="80" cy="190" r="28" style="fill:var(--car);stroke:var(--ink);stroke-width:3"/>' +
          '<path class="svg-ink" d="M80 162 Q82 150 90 144"/>' +
          '<ellipse cx="96" cy="150" rx="10" ry="5" style="fill:var(--e-chem)"/>' +
        '</g>' +
        '<path class="svg-ink" d="M120 190 H170 M160 180 L172 190 L160 200" style="stroke-dasharray:6 6"/>' +
        '<g data-part="person"><g class="anim-run" data-on="1">' +
          '<circle class="svg-fill" cx="230" cy="110" r="16"/>' +
          '<path class="svg-ink" d="M230 126 L226 180 M228 144 L206 166 M228 144 L254 132 M226 180 L206 220 L192 222 M226 180 L252 212 L262 238"/>' +
        '</g></g>' +
        '<g data-part="heat"><g class="anim-rise hide-off" data-on="1">' +
          '<path d="M310 140 q8 -10 0 -20 q-8 -10 0 -20 M330 150 q8 -10 0 -20 q-8 -10 0 -20" style="fill:none;stroke:var(--e-heat);stroke-width:4;stroke-linecap:round"/>' +
        '</g></g>',
      steps: [
        { e: ['chem'], parts: ['food'], text: 'Food stores chemical potential energy.', hint: 'What kind of energy is stored in food?' },
        { e: ['kinetic'], wasted: ['heat'], parts: ['person', 'heat'], text: 'When you run, your body converts the chemical potential energy from food into kinetic energy. Your body also gives off heat energy, so you feel warm.', hint: 'You are moving when you run. What kind of energy is that?' }
      ]
    },
    {
      id: 'candle', name: 'Burning candle', emoji: '🕯️',
      svg:
        '<ellipse class="svg-fill" cx="200" cy="254" rx="70" ry="10"/>' +
        '<g data-part="wax"><rect x="172" y="150" width="56" height="102" rx="6" style="fill:var(--surface);stroke:var(--ink);stroke-width:3"/>' +
          '<text class="svg-text" x="200" y="210" text-anchor="middle">wax</text></g>' +
        '<path class="svg-ink" d="M200 150 V136"/>' +
        '<g data-part="flame">' +
          '<circle class="anim-glow hide-off" data-on="1" cx="200" cy="112" r="54" style="fill:var(--e-light);opacity:.3"/>' +
          '<path class="anim-flicker hide-off" data-on="1" d="M200 76 C184 104 186 132 200 138 C214 132 216 104 200 76 Z" style="fill:var(--e-light);stroke:var(--e-heat);stroke-width:3"/>' +
          '<g class="anim-rise hide-off" data-on="1"><path d="M178 58 q6 -8 0 -16 q-6 -8 0 -16 M222 58 q6 -8 0 -16 q-6 -8 0 -16" style="fill:none;stroke:var(--e-heat);stroke-width:3;stroke-linecap:round"/></g>' +
        '</g>',
      steps: [
        { e: ['chem'], parts: ['wax'], text: 'The candle wax is a fuel. It stores chemical potential energy.', hint: 'Fuels such as wax store which kind of energy?' },
        { e: ['light', 'heat'], parts: ['flame'], text: 'When the candle burns, the chemical potential energy is converted into light energy and heat energy.', hint: 'A flame lets you see in the dark, and it feels hot. Which two energy forms is it giving out?' }
      ]
    },
    {
      id: 'kettle', name: 'Electric kettle', emoji: '🫖',
      svg:
        '<rect x="135" y="250" width="140" height="10" rx="3" class="svg-fill"/>' +
        '<rect class="svg-fill" x="18" y="150" width="44" height="56" rx="6"/>' +
        '<path class="svg-ink" d="M33 168 V180 M47 168 V180"/>' +
        '<g data-part="wire"><path class="anim-flow" data-on="0 1" d="M62 186 C100 186 96 238 136 238" style="stroke:var(--e-elec);stroke-width:4;fill:none;stroke-linecap:round"/></g>' +
        '<path class="svg-fill" d="M266 172 L306 130 L312 140 L270 196 Z"/>' +
        '<path class="svg-ink" d="M150 160 C110 160 110 230 146 230"/>' +
        '<path class="svg-fill" d="M140 250 L152 140 H258 L270 250 Z"/>' +
        '<path class="svg-ink" d="M168 140 V128 H242 V140"/>' +
        '<g data-part="element"><polyline class="anim-glow" data-on="1" points="160,236 174,220 188,236 202,220 216,236 230,220 244,236 256,226" style="fill:none;stroke:var(--e-heat);stroke-width:4;stroke-linejoin:round"/></g>' +
        '<g data-part="steam"><g class="anim-rise hide-off" data-on="1"><path d="M314 118 q10 -10 0 -20 q-10 -10 0 -20 M334 124 q10 -10 0 -20 q-10 -10 0 -20" style="fill:none;stroke:var(--ink-soft);stroke-width:4;stroke-linecap:round"/></g></g>',
      steps: [
        { e: ['elec'], parts: ['wire'], text: 'Electrical energy flows from the power socket through the wire into the kettle.', hint: 'What kind of energy comes from a power socket?' },
        { e: ['heat'], wasted: ['sound'], parts: ['element', 'steam'], text: 'The heating element converts electrical energy into heat energy, which boils the water. Some sound energy is also produced. Here, heat energy is the useful form!', hint: 'The kettle’s job is to make water hot. Which energy form does that?' }
      ]
    }
  ];

  /* ---------- state ---------- */
  var current = SCENARIOS[0];
  var activeStep = -1;
  var playTimer = null;
  var mode = 'learn';
  var answers = []; // test mode: answers[stepIndex][blankIndex] = energy key or null
  var selected = null; // {s, b}

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- helpers ---------- */
  function makeChip(key, wasted, tag) {
    var el = document.createElement(tag || 'span');
    if (tag === 'button') el.type = 'button';
    el.className = 'chip' + (wasted ? ' wasted' : '');
    el.style.setProperty('--chip-color', 'var(' + ENERGY[key].color + ')');
    el.innerHTML = '<span class="chip-icon" aria-hidden="true">' + ENERGY[key].icon + '</span>';
    el.appendChild(document.createTextNode(ENERGY[key].name));
    return el;
  }

  function arrow() {
    var a = document.createElement('span');
    a.className = 'arrow';
    a.setAttribute('aria-hidden', 'true');
    a.textContent = '→';
    return a;
  }

  function plus() {
    var p = document.createElement('span');
    p.className = 'plus';
    p.setAttribute('aria-hidden', 'true');
    p.textContent = '+';
    return p;
  }

  function wastedForms(scenario) {
    var out = [];
    scenario.steps.forEach(function (s) {
      (s.wasted || []).forEach(function (w) { if (out.indexOf(w) === -1) out.push(w); });
    });
    return out;
  }

  function chainAsText(scenario) {
    return scenario.steps.map(function (s) {
      return s.e.map(function (k) { return ENERGY[k].name.toLowerCase(); }).join(' and ');
    }).join(', then ');
  }

  /* ---------- scenario picker ---------- */
  function buildPicker() {
    var box = $('scenario-choices');
    SCENARIOS.forEach(function (sc) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.setAttribute('aria-pressed', String(sc === current));
      b.innerHTML = '<span class="emoji" aria-hidden="true">' + sc.emoji + '</span>';
      b.appendChild(document.createTextNode(sc.name));
      b.addEventListener('click', function () {
        box.querySelectorAll('.choice').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        loadScenario(sc);
      });
      box.appendChild(b);
    });
  }

  function loadScenario(sc) {
    stopPlay();
    current = sc;
    activeStep = -1;
    $('scene-heading').textContent = sc.name;
    $('illustration').innerHTML =
      '<svg viewBox="0 0 400 300" role="img" aria-label="' + sc.name + ': ' + chainAsText(sc) + '">' + sc.svg + '</svg>';
    renderLearn();
    resetTest();
    setCaption();
  }

  /* ---------- learn mode ---------- */
  function renderLearn() {
    var chain = $('chain');
    chain.innerHTML = '';
    current.steps.forEach(function (step, i) {
      if (i > 0) chain.appendChild(arrow());
      var stage = document.createElement('button');
      stage.type = 'button';
      stage.className = 'stage' + (i === activeStep ? ' active' : '');
      stage.style.cssText = 'background:none;font:inherit;color:inherit;cursor:pointer';
      stage.setAttribute('aria-label', 'Step ' + (i + 1) + ': ' + step.e.map(function (k) { return ENERGY[k].name; }).join(' and '));
      step.e.forEach(function (k, j) {
        if (j > 0) stage.appendChild(plus());
        stage.appendChild(makeChip(k));
      });
      stage.addEventListener('click', function () {
        stopPlay();
        showStep(i);
      });
      chain.appendChild(stage);
    });

    var also = $('also-row');
    also.innerHTML = '';
    var wasted = wastedForms(current);
    if (wasted.length) {
      var label = document.createElement('span');
      label.textContent = 'Also produced (not wanted here):';
      also.appendChild(label);
      wasted.forEach(function (k) { also.appendChild(makeChip(k, true)); });
    }
  }

  function showStep(i) {
    activeStep = i;
    var stages = $('chain').querySelectorAll('.stage');
    stages.forEach(function (s, j) { s.classList.toggle('active', j === i); });

    var svg = $('illustration').querySelector('svg');
    var step = current.steps[i];
    svg.classList.add('highlighting');
    svg.style.setProperty('--glow', 'var(' + ENERGY[step.e[0]].color + ')');
    svg.querySelectorAll('[data-part]').forEach(function (p) {
      p.classList.toggle('lit', step.parts.indexOf(p.getAttribute('data-part')) !== -1);
    });
    applyStepAnimation(svg, i);
    setCaption();
  }

  // Each animated piece lists the steps it is active in (data-on="1 2").
  // Outside those steps it stops (and hides, if it has class hide-off).
  // With no step selected (i = -1) everything animates.
  function applyStepAnimation(svg, i) {
    svg.querySelectorAll('[data-on]').forEach(function (el) {
      var on = i < 0 || el.getAttribute('data-on').split(' ').indexOf(String(i)) !== -1;
      el.classList.toggle('anim-off', !on);
    });
    svg.querySelectorAll('[data-done]').forEach(function (el) {
      el.classList.toggle('at-end', i >= Number(el.getAttribute('data-done')));
    });
  }

  function clearHighlight() {
    activeStep = -1;
    var svg = $('illustration').querySelector('svg');
    if (svg) {
      applyStepAnimation(svg, -1);
      svg.classList.remove('highlighting');
      svg.querySelectorAll('.lit').forEach(function (p) { p.classList.remove('lit'); });
    }
    $('chain').querySelectorAll('.stage').forEach(function (s) { s.classList.remove('active'); });
  }

  function setCaption() {
    var cap = $('caption');
    if (mode === 'test') {
      cap.textContent = 'What energy conversion happens in this ' + current.name.toLowerCase() + '?';
    } else if (activeStep < 0) {
      cap.textContent = 'Press Play or tap a step to see what happens.';
    } else {
      cap.innerHTML = '<strong>Step ' + (activeStep + 1) + ' of ' + current.steps.length + ':</strong> ';
      cap.appendChild(document.createTextNode(current.steps[activeStep].text));
    }
  }

  function play() {
    stopPlay();
    var i = 0;
    showStep(0);
    $('play-btn').textContent = '■ Stop';
    playTimer = setInterval(function () {
      i += 1;
      if (i >= current.steps.length) {
        stopPlay();
        return;
      }
      showStep(i);
    }, 3200);
  }

  function stopPlay() {
    if (playTimer) clearInterval(playTimer);
    playTimer = null;
    var btn = $('play-btn');
    if (btn) btn.textContent = '▶ Play';
  }

  /* ---------- test mode ---------- */
  function resetTest() {
    answers = current.steps.map(function (s) { return s.e.map(function () { return null; }); });
    selected = { s: 0, b: 0 };
    $('feedback').textContent = '';
    $('feedback').className = 'feedback';
    $('test-hint').hidden = true;
    renderTest(false);
  }

  function renderTest(marked) {
    var box = $('test-chain');
    box.innerHTML = '';
    current.steps.forEach(function (step, si) {
      if (si > 0) box.appendChild(arrow());
      var stage = document.createElement('span');
      stage.className = 'stage';
      var ok = marked ? stageCorrect(si) : null;
      step.e.forEach(function (_, bi) {
        if (bi > 0) stage.appendChild(plus());
        var val = answers[si][bi];
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'blank';
        if (val) {
          b.classList.add('filled');
          b.style.setProperty('--chip-color', 'var(' + ENERGY[val].color + ')');
          b.innerHTML = '<span class="chip-icon" aria-hidden="true">' + ENERGY[val].icon + '</span>&nbsp;';
          b.appendChild(document.createTextNode(ENERGY[val].name));
        } else {
          b.textContent = '?';
        }
        if (selected && selected.s === si && selected.b === bi) b.classList.add('selected');
        if (marked) b.classList.add(ok ? 'correct' : 'wrong');
        b.setAttribute('aria-label', 'Step ' + (si + 1) + ' blank' + (step.e.length > 1 ? ' ' + (bi + 1) : '') + ': ' + (val ? ENERGY[val].name : 'empty') + (marked ? (ok ? ', correct' : ', not correct') : ''));
        b.addEventListener('click', function () {
          selected = { s: si, b: bi };
          renderTest(false);
          box.querySelectorAll('.blank')[blankIndex(si, bi)].focus();
        });
        stage.appendChild(b);
      });
      box.appendChild(stage);
    });
  }

  function blankIndex(si, bi) {
    var n = 0;
    for (var i = 0; i < si; i++) n += current.steps[i].e.length;
    return n + bi;
  }

  function buildPalette() {
    var pal = $('palette');
    ENERGY_ORDER.forEach(function (k) {
      var chip = makeChip(k, false, 'button');
      chip.addEventListener('click', function () { fill(k); });
      pal.appendChild(chip);
    });
  }

  function fill(key) {
    if (!selected) return;
    answers[selected.s][selected.b] = key;
    $('feedback').textContent = '';
    $('test-hint').hidden = true;
    // move to the next empty blank
    var next = null;
    current.steps.forEach(function (step, si) {
      step.e.forEach(function (_, bi) {
        if (!next && answers[si][bi] === null) next = { s: si, b: bi };
      });
    });
    selected = next;
    renderTest(false);
  }

  function stageCorrect(si) {
    var want = current.steps[si].e.slice().sort().join();
    var got = answers[si].slice().sort().join();
    return want === got;
  }

  function check() {
    var fb = $('feedback');
    var hint = $('test-hint');
    var empty = answers.some(function (a) { return a.indexOf(null) !== -1; });
    if (empty) {
      fb.textContent = 'Fill in every blank first.';
      fb.className = 'feedback bad';
      hint.hidden = true;
      return;
    }
    var wrong = [];
    current.steps.forEach(function (_, si) { if (!stageCorrect(si)) wrong.push(si); });
    selected = null;
    renderTest(true);
    if (!wrong.length) {
      fb.textContent = '🎉 All correct! Well done.';
      fb.className = 'feedback good';
      hint.hidden = true;
    } else {
      var total = current.steps.length;
      fb.textContent = (total - wrong.length) + ' of ' + total + ' steps correct. Try again!';
      fb.className = 'feedback bad';
      hint.innerHTML = '<strong>Hint for step ' + (wrong[0] + 1) + ':</strong> ';
      hint.appendChild(document.createTextNode(current.steps[wrong[0]].hint));
      hint.hidden = false;
    }
  }

  function showAnswer() {
    answers = current.steps.map(function (s) { return s.e.slice(); });
    selected = null;
    renderTest(true);
    $('feedback').textContent = 'Here is the answer: ' + chainAsText(current) + '.';
    $('feedback').className = 'feedback';
    $('test-hint').hidden = true;
  }

  /* ---------- mode switch ---------- */
  function setMode(m) {
    mode = m;
    $('mode-learn').setAttribute('aria-pressed', String(m === 'learn'));
    $('mode-test').setAttribute('aria-pressed', String(m === 'test'));
    $('learn-panel').hidden = m !== 'learn';
    $('test-panel').hidden = m !== 'test';
    stopPlay();
    clearHighlight();
    if (m === 'test') resetTest();
    setCaption();
  }

  /* ---------- legend ---------- */
  function buildLegend() {
    var ul = $('legend');
    ENERGY_ORDER.forEach(function (k) {
      var li = document.createElement('li');
      li.appendChild(makeChip(k));
      var p = document.createElement('div');
      p.style.cssText = 'color:var(--text-muted);font-size:0.95rem;margin-top:4px';
      p.textContent = ENERGY[k].about;
      li.appendChild(p);
      ul.appendChild(li);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildPicker();
    buildPalette();
    buildLegend();
    loadScenario(current);
    $('play-btn').addEventListener('click', function () {
      if (playTimer) {
        stopPlay();
      } else {
        play();
      }
    });
    $('mode-learn').addEventListener('click', function () { setMode('learn'); });
    $('mode-test').addEventListener('click', function () { setMode('test'); });
    $('check-btn').addEventListener('click', check);
    $('reset-btn').addEventListener('click', resetTest);
    $('answer-btn').addEventListener('click', showAnswer);
  });

  // exposed for quick checks in the browser console
  window.energyData = { ENERGY: ENERGY, SCENARIOS: SCENARIOS };
})();
