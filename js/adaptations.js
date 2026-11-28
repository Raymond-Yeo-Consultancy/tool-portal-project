/*
 * Adaptations Explorer
 * Pick an organism, discover its adaptations, then match each adaptation
 * to how it helps the organism survive.
 *
 * To add an organism, add an entry to ORGANISMS. Each feature has:
 *   feature  – the adaptation, as pupils would describe it
 *   purpose  – how it helps (short; used in the matching test)
 *   explain  – one or two sentences shown in Explore
 *   type     – 'structural' (a body part) or 'behavioural' (something it does)
 *   helps    – what it helps the organism to do
 */
(function () {
  var ORGANISMS = [
    {
      id: 'camel', name: 'Camel', emoji: '🐫', home: 'Hot, dry desert',
      features: [
        { feature: 'Hump of fat on its back', purpose: 'Stores fat, so it can go a long time without food', type: 'structural', helps: 'cope with little food',
          explain: 'The hump stores fat, not water. When food is hard to find, the camel uses this fat for energy.' },
        { feature: 'Long eyelashes and nostrils that can close', purpose: 'Keep sand out of its eyes and nose', type: 'structural', helps: 'cope with its surroundings',
          explain: 'Strong winds blow sand around the desert. Long eyelashes shield the eyes, and the camel can close its nostrils to keep sand out.' },
        { feature: 'Wide, flat feet', purpose: 'Stop it from sinking into the soft sand', type: 'structural', helps: 'move',
          explain: 'Wide feet spread the camel’s weight over a larger area, so it does not sink into the sand as it walks.' }
      ]
    },
    {
      id: 'polarbear', name: 'Polar bear', emoji: '🐻‍❄️', home: 'Freezing Arctic ice and sea',
      features: [
        { feature: 'Thick fur and a thick layer of fat', purpose: 'Keep it warm in the freezing cold', type: 'structural', helps: 'cope with the cold',
          explain: 'Fur and fat are poor conductors of heat. They reduce the heat lost from the bear’s body to the cold surroundings.' },
        { feature: 'White fur', purpose: 'Hides it against the snow when it hunts', type: 'structural', helps: 'get food',
          explain: 'White fur blends in with the snow and ice. Seals cannot easily see the bear coming, so it can get close to its prey.' },
        { feature: 'Large paws with rough pads', purpose: 'Help it walk on ice and paddle in the sea', type: 'structural', helps: 'move',
          explain: 'Large paws spread the bear’s weight on thin ice, rough pads stop it slipping, and the paws work like paddles when it swims.' }
      ]
    },
    {
      id: 'duck', name: 'Duck', emoji: '🦆', home: 'Ponds and lakes',
      features: [
        { feature: 'Webbed feet', purpose: 'Push against the water so it can swim', type: 'structural', helps: 'move',
          explain: 'The skin between the toes makes each foot like a paddle. It pushes a lot of water backwards, which moves the duck forwards.' },
        { feature: 'Oily, waterproof feathers', purpose: 'Keep its body dry and warm', type: 'structural', helps: 'cope with its surroundings',
          explain: 'The duck spreads oil over its feathers. Water runs off instead of soaking in, so the duck stays dry, warm and afloat.' },
        { feature: 'Broad, flat beak', purpose: 'Scoops up food from the water and mud', type: 'structural', helps: 'get food',
          explain: 'The wide beak scoops up water plants and small animals. Water drains out at the sides and the food stays in.' }
      ]
    },
    {
      id: 'fish', name: 'Fish', emoji: '🐟', home: 'Rivers, ponds and seas',
      features: [
        { feature: 'Gills', purpose: 'Take in oxygen that is dissolved in the water', type: 'structural', helps: 'breathe',
          explain: 'Water flows in through the mouth and over the gills. The gills take in dissolved oxygen from the water.' },
        { feature: 'Streamlined body', purpose: 'Lets it move through the water easily', type: 'structural', helps: 'move',
          explain: 'A smooth body that is narrow at both ends reduces water resistance, so the fish can swim fast using less energy.' },
        { feature: 'Fins and tail', purpose: 'Help it swim, steer and keep its balance', type: 'structural', helps: 'move',
          explain: 'The tail pushes the fish forwards. The fins help it turn, stop and stay upright.' }
      ]
    },
    {
      id: 'cactus', name: 'Cactus', emoji: '🌵', home: 'Hot, dry desert',
      features: [
        { feature: 'Thick, fleshy stem', purpose: 'Stores water for the long dry times', type: 'structural', helps: 'cope with little water',
          explain: 'It rarely rains in the desert. The cactus stores water in its thick stem and uses it slowly.' },
        { feature: 'Leaves that are thin spines', purpose: 'Lose less water and keep animals away', type: 'structural', helps: 'cope with little water',
          explain: 'Spines have a very small surface area, so little water is lost through them. They also stop animals from eating the plant.' },
        { feature: 'Long roots that spread out widely', purpose: 'Take in rainwater quickly from a wide area', type: 'structural', helps: 'get water',
          explain: 'When it does rain, the wide roots take in as much water as possible before it dries up.' }
      ]
    },
    {
      id: 'waterlily', name: 'Water lily', emoji: '🪷', home: 'Ponds',
      features: [
        { feature: 'Large, flat leaves', purpose: 'Trap as much sunlight as possible to make food', type: 'structural', helps: 'get light',
          explain: 'Large leaves lying flat on the water have a big surface facing the Sun, so they trap plenty of light for photosynthesis.' },
        { feature: 'Air spaces in the leaves and stems', purpose: 'Keep the leaves floating on the water', type: 'structural', helps: 'get light',
          explain: 'Air is lighter than water. The air spaces keep the leaves afloat at the surface, where there is light and air.' },
        { feature: 'Waxy top surface on the leaves', purpose: 'Lets water run off the leaf', type: 'structural', helps: 'cope with its surroundings',
          explain: 'Water rolls off the waxy surface. The leaf does not get covered with water, so it can keep taking in light and air.' }
      ]
    },
    {
      id: 'eagle', name: 'Eagle', emoji: '🦅', home: 'Mountains and forests',
      features: [
        { feature: 'Sharp, hooked beak', purpose: 'Tears the flesh of its prey', type: 'structural', helps: 'get food',
          explain: 'The eagle cannot chew. It uses its strong, hooked beak to tear its food into pieces small enough to swallow.' },
        { feature: 'Sharp, curved claws', purpose: 'Catch and hold on to its prey', type: 'structural', helps: 'get food',
          explain: 'The claws, called talons, grip the prey tightly so it cannot escape while the eagle carries it away.' },
        { feature: 'Very good eyesight', purpose: 'Spots prey from high in the sky', type: 'structural', helps: 'get food',
          explain: 'An eagle can see small animals moving on the ground from far above. Then it dives down to catch them.' }
      ]
    },
    {
      id: 'hedgehog', name: 'Hedgehog', emoji: '🦔', home: 'Woods and gardens with cold winters',
      features: [
        { feature: 'Sharp spines on its back', purpose: 'Make it painful for a predator to bite', type: 'structural', helps: 'protect itself',
          explain: 'A predator that tries to bite a hedgehog gets a mouthful of sharp spines, so most predators leave it alone.' },
        { feature: 'Rolls into a tight ball', purpose: 'Covers its soft belly when a predator comes near', type: 'behavioural', helps: 'protect itself',
          explain: 'This is something the hedgehog does, so it is a behavioural adaptation. Rolled up, only its spines can be reached.' },
        { feature: 'Sleeps through the winter (hibernates)', purpose: 'Saves energy in winter, when food is hard to find', type: 'behavioural', helps: 'cope with the cold',
          explain: 'In winter there are few insects to eat. The hedgehog hibernates: its body slows down and it uses very little energy until spring.' }
      ]
    }
  ];
  var ORDER = [2, 0, 1]; // order the purposes are offered in the test, so they are mixed up

  var state = {
    org: 0,
    mode: 'explore',
    opened: {}, // opened[orgId] = {featureIndex: true}
    answers: [null, null, null], // test: answers[featureIndex] = purpose index
    selected: 0,
    marked: false
  };
  var $ = function (id) { return document.getElementById(id); };

  function org() { return ORGANISMS[state.org]; }

  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }

  /* ---------- picker ---------- */
  function buildPicker() {
    var box = $('organism-choices');
    ORGANISMS.forEach(function (o, i) {
      var b = el('button', null, 'choice');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(i === state.org));
      var em = el('span', o.emoji, 'emoji');
      em.setAttribute('aria-hidden', 'true');
      b.appendChild(em);
      b.appendChild(document.createTextNode(o.name));
      b.addEventListener('click', function () {
        box.querySelectorAll('.choice').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        state.org = i;
        resetTest();
        render();
      });
      box.appendChild(b);
    });
  }

  /* ---------- explore ---------- */
  function renderExplore() {
    var o = org();
    var opened = state.opened[o.id] = state.opened[o.id] || {};
    var list = $('feature-list');
    list.innerHTML = '';
    o.features.forEach(function (f, i) {
      var d = el('details', null, 'feature');
      if (opened[i]) d.open = true;
      d.appendChild(el('summary', f.feature));
      var tags = el('p', null, 'feature-tags');
      tags.appendChild(el('span', f.type === 'structural' ? 'Structural adaptation' : 'Behavioural adaptation', 'tag'));
      tags.appendChild(el('span', 'Helps it to ' + f.helps, 'tag'));
      d.appendChild(tags);
      d.appendChild(el('p', f.explain));
      d.addEventListener('toggle', function () {
        if (d.open && !opened[i]) {
          opened[i] = true;
          updateProgress();
        }
      });
      list.appendChild(d);
    });
    updateProgress();
  }

  function updateProgress() {
    var o = org();
    var n = Object.keys(state.opened[o.id] || {}).length;
    $('progress').textContent = n === o.features.length
      ? 'You have discovered all ' + n + ' adaptations. Now try Test yourself!'
      : 'Adaptations discovered: ' + n + ' of ' + o.features.length + '. Tap each one to find out how it helps.';
  }

  /* ---------- test yourself ---------- */
  function resetTest() {
    state.answers = [null, null, null];
    state.selected = 0;
    state.marked = false;
    var fb = $('feedback');
    if (fb) {
      fb.textContent = '';
      fb.className = 'feedback';
    }
  }

  function renderTest() {
    var o = org();
    var rows = $('match-rows');
    rows.innerHTML = '';
    o.features.forEach(function (f, i) {
      var row = el('div', null, 'match-row');
      row.appendChild(el('span', f.feature, 'match-feature'));
      var ans = state.answers[i];
      var b = el('button', ans === null ? 'Tap here, then choose how it helps' : o.features[ans].purpose, 'blank');
      b.type = 'button';
      if (ans !== null) b.classList.add('filled');
      if (state.selected === i) b.classList.add('selected');
      if (state.marked) b.classList.add(ans === i ? 'correct' : 'wrong');
      b.setAttribute('aria-label', f.feature + ': ' + (ans === null ? 'no answer yet' : o.features[ans].purpose) +
        (state.marked ? (ans === i ? ', correct' : ', not correct') : ''));
      b.addEventListener('click', function () {
        state.selected = i;
        state.marked = false;
        renderTest();
        rows.querySelectorAll('.blank')[i].focus();
      });
      row.appendChild(b);
      rows.appendChild(row);
    });

    var pal = $('purpose-palette');
    pal.innerHTML = '';
    ORDER.forEach(function (pi) {
      var used = state.answers.indexOf(pi) !== -1;
      var c = el('button', o.features[pi].purpose, 'chip');
      c.type = 'button';
      if (used) c.classList.add('used');
      c.addEventListener('click', function () { choose(pi); });
      pal.appendChild(c);
    });
  }

  function choose(purposeIndex) {
    if (state.selected === null) return;
    // a purpose can only be used once: take it away from any other row
    state.answers = state.answers.map(function (a) { return a === purposeIndex ? null : a; });
    state.answers[state.selected] = purposeIndex;
    state.marked = false;
    $('feedback').textContent = '';
    var next = state.answers.indexOf(null);
    state.selected = next === -1 ? null : next;
    renderTest();
  }

  function check() {
    var fb = $('feedback');
    if (state.answers.indexOf(null) !== -1) {
      fb.textContent = 'Match every adaptation first.';
      fb.className = 'feedback bad';
      return;
    }
    var right = state.answers.filter(function (a, i) { return a === i; }).length;
    state.marked = true;
    state.selected = null;
    renderTest();
    if (right === state.answers.length) {
      fb.textContent = '🎉 All correct! Well done. Try another organism.';
      fb.className = 'feedback good';
    } else {
      fb.textContent = right + ' of ' + state.answers.length + ' correct. Change the ones marked in red, or go back to Explore to read about them.';
      fb.className = 'feedback bad';
    }
  }

  /* ---------- page ---------- */
  function render() {
    var o = org();
    $('org-name').textContent = o.name;
    $('org-emoji').textContent = o.emoji;
    $('org-home').textContent = 'Where it lives: ' + o.home.charAt(0).toLowerCase() + o.home.slice(1);
    $('explore-panel').hidden = state.mode !== 'explore';
    $('test-panel').hidden = state.mode !== 'test';
    $('mode-explore').setAttribute('aria-pressed', String(state.mode === 'explore'));
    $('mode-test').setAttribute('aria-pressed', String(state.mode === 'test'));
    if (state.mode === 'explore') renderExplore();
    else renderTest();
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildPicker();
    $('mode-explore').addEventListener('click', function () { state.mode = 'explore'; render(); });
    $('mode-test').addEventListener('click', function () { state.mode = 'test'; resetTest(); render(); });
    $('check-btn').addEventListener('click', check);
    $('clear-btn').addEventListener('click', function () { resetTest(); renderTest(); });
    render();
  });

  // exposed for quick checks in the browser console
  window.adaptationsData = { ORGANISMS: ORGANISMS };
})();
