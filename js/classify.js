/*
 * Living Things Sorter (Primary 3, Diversity)
 * Three sorting rounds, each run by Activities.sort (js/activities.js).
 * To change a round, edit its groups and items in ROUNDS.
 */
(function () {
  var ROUNDS = {
    living: {
      title: 'Living or non-living?',
      groups: [
        { id: 'living', name: 'Living things', about: 'Need air, food and water. They grow, respond and reproduce.' },
        { id: 'nonliving', name: 'Non-living things', about: 'Do not need food, do not grow and cannot reproduce.' }
      ],
      items: [
        { label: 'Cat', emoji: '🐱', group: 'living', hint: 'A cat eats, breathes, grows and can have kittens.' },
        { label: 'Tree', emoji: '🌳', group: 'living', hint: 'A tree cannot walk, but it grows, needs water and air, and makes seeds.' },
        { label: 'Mushroom', emoji: '🍄', group: 'living', hint: 'A mushroom grows and reproduces by making spores.' },
        { label: 'Fish', emoji: '🐟', group: 'living', hint: 'A fish feeds, grows and lays eggs.' },
        { label: 'Sunflower', emoji: '🌻', group: 'living', hint: 'A sunflower grows, turns towards light and makes seeds.' },
        { label: 'Ant', emoji: '🐜', group: 'living', hint: 'An ant is tiny, but it feeds, grows and reproduces.' },
        { label: 'Rock', emoji: '🪨', group: 'nonliving', hint: 'A rock does not need food, air or water, and it does not grow.' },
        { label: 'Toy robot', emoji: '🤖', group: 'nonliving', hint: 'A robot can move, but it does not grow, need food or reproduce.' },
        { label: 'Car', emoji: '🚗', group: 'nonliving', hint: 'A car moves and uses petrol, but it does not grow or reproduce.' },
        { label: 'Fire', emoji: '🔥', group: 'nonliving', hint: 'Fire spreads and needs air, but it does not feed, respond or reproduce like a living thing.' },
        { label: 'Cloud', emoji: '☁️', group: 'nonliving', hint: 'A cloud moves and changes shape, but it does not need food or reproduce.' },
        { label: 'Teddy bear', emoji: '🧸', group: 'nonliving', hint: 'It looks like an animal, but it does not eat, grow or respond.' }
      ]
    },
    kinds: {
      title: 'Which group of living things?',
      groups: [
        { id: 'plants', name: 'Plants', about: 'Make their own food.' },
        { id: 'animals', name: 'Animals', about: 'Move about and feed on other living things.' },
        { id: 'fungi', name: 'Fungi', about: 'Cannot make their own food. Reproduce by spores.' },
        { id: 'bacteria', name: 'Bacteria', about: 'Too tiny to see without a microscope.' }
      ],
      items: [
        { label: 'Fern', emoji: '🌿', group: 'plants', hint: 'A fern is green and makes its own food. It has no flowers, but it is still a plant.' },
        { label: 'Cactus', emoji: '🌵', group: 'plants', hint: 'A cactus is green and makes its own food.' },
        { label: 'Rose', emoji: '🌹', group: 'plants', hint: 'A rose bush makes its own food and has flowers.' },
        { label: 'Snail', emoji: '🐌', group: 'animals', hint: 'A snail moves about and feeds on plants.' },
        { label: 'Frog', emoji: '🐸', group: 'animals', hint: 'A frog moves about and feeds on insects.' },
        { label: 'Spider', emoji: '🕷️', group: 'animals', hint: 'A spider moves about and catches insects to eat.' },
        { label: 'Eagle', emoji: '🦅', group: 'animals', hint: 'An eagle flies and hunts other animals for food.' },
        { label: 'Mushroom', emoji: '🍄', group: 'fungi', hint: 'A mushroom is not green and cannot make its own food. It reproduces by spores.' },
        { label: 'Bread mould', emoji: '🍞', group: 'fungi', hint: 'Mould feeds on the bread. It cannot make its own food and reproduces by spores.' },
        { label: 'Yeast', emoji: '🧁', group: 'fungi', hint: 'Yeast is used to make bread rise. It cannot make its own food.' },
        { label: 'Bacteria in yoghurt', emoji: '🥛', group: 'bacteria', hint: 'They are too tiny to see without a microscope. Some bacteria are useful.' },
        { label: 'Bacteria that cause tooth decay', emoji: '🦷', group: 'bacteria', hint: 'They are too tiny to see without a microscope. Some bacteria are harmful.' }
      ]
    },
    animals: {
      title: 'Which group of animals?',
      groups: [
        { id: 'mammals', name: 'Mammals', about: 'Hair or fur. Most give birth to young. Feed young with milk.' },
        { id: 'birds', name: 'Birds', about: 'Feathers, a beak and wings. Lay eggs.' },
        { id: 'fish', name: 'Fish', about: 'Scales and fins. Breathe through gills. Live in water.' },
        { id: 'insects', name: 'Insects', about: 'Six legs and three body parts.' },
        { id: 'reptiles', name: 'Reptiles', about: 'Dry, scaly skin. Most lay eggs.' },
        { id: 'amphibians', name: 'Amphibians', about: 'Moist skin. Live in water when young and on land as adults.' }
      ],
      items: [
        { label: 'Dog', emoji: '🐕', group: 'mammals', hint: 'A dog has fur and feeds its puppies with milk.' },
        { label: 'Bat', emoji: '🦇', group: 'mammals', hint: 'A bat flies, but it has fur, not feathers, and feeds its young with milk.' },
        { label: 'Whale', emoji: '🐋', group: 'mammals', hint: 'A whale lives in the sea, but it breathes air through lungs and feeds its young with milk.' },
        { label: 'Chicken', emoji: '🐔', group: 'birds', hint: 'A chicken has feathers, a beak and wings, and lays eggs.' },
        { label: 'Penguin', emoji: '🐧', group: 'birds', hint: 'A penguin cannot fly, but it has feathers, a beak and wings, and lays eggs.' },
        { label: 'Eagle', emoji: '🦅', group: 'birds', hint: 'An eagle has feathers, a beak and wings.' },
        { label: 'Goldfish', emoji: '🐟', group: 'fish', hint: 'A goldfish has scales and fins and breathes through gills.' },
        { label: 'Shark', emoji: '🦈', group: 'fish', hint: 'A shark has fins and breathes through gills.' },
        { label: 'Butterfly', emoji: '🦋', group: 'insects', hint: 'A butterfly has six legs and three body parts.' },
        { label: 'Ant', emoji: '🐜', group: 'insects', hint: 'An ant has six legs and three body parts.' },
        { label: 'Bee', emoji: '🐝', group: 'insects', hint: 'A bee has six legs and three body parts.' },
        { label: 'Crocodile', emoji: '🐊', group: 'reptiles', hint: 'A crocodile has dry, scaly skin and lays eggs on land.' },
        { label: 'Snake', emoji: '🐍', group: 'reptiles', hint: 'A snake has dry, scaly skin.' },
        { label: 'Tortoise', emoji: '🐢', group: 'reptiles', hint: 'A tortoise has dry, scaly skin and lays eggs on land.' },
        { label: 'Frog', emoji: '🐸', group: 'amphibians', hint: 'A frog has moist skin. It lives in water as a tadpole and on land as an adult.' },
        { label: 'Toad', emoji: '🐸', group: 'amphibians', hint: 'A toad lives in water as a tadpole and on land as an adult.' }
      ]
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var area = document.getElementById('activity');
    var title = document.getElementById('round-title');
    var buttons = document.querySelectorAll('#round-choices .choice');

    function load(id) {
      title.textContent = ROUNDS[id].title;
      Activities.sort(area, ROUNDS[id]);
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-round') === id)); });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { load(b.getAttribute('data-round')); });
    });
    load('living');
  });

  // exposed for quick checks in the browser console
  window.classifyData = { ROUNDS: ROUNDS };
})();
