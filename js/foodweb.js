/*
 * Food Chain and Food Web
 * Three ways to explore a habitat's food web:
 *   web    – tap an organism to see what it eats and what eats it
 *   chain  – build food chains one link at a time
 *   whatif – remove one organism and see who is affected at first
 *
 * To add a habitat, add an entry to HABITATS. Each organism has:
 *   id, name, emoji, the (how to say it mid-sentence, e.g. "the frog"),
 *   x, y  – position in the drawing (360 wide, 400 tall; producers at the bottom)
 *   eats  – ids of the organisms it eats (empty for a producer)
 */
(function () {
  var HABITATS = {
    pond: {
      name: 'Pond',
      organisms: [
        { id: 'plants', name: 'Water plants', emoji: '🌿', the: 'water plants', x: 180, y: 362, eats: [] },
        { id: 'snail', name: 'Snail', emoji: '🐌', the: 'the snail', x: 60, y: 255, eats: ['plants'] },
        { id: 'shrimp', name: 'Shrimp', emoji: '🦐', the: 'the shrimp', x: 180, y: 255, eats: ['plants'] },
        { id: 'larva', name: 'Mosquito larva', emoji: '🦟', the: 'the mosquito larva', x: 300, y: 255, eats: ['plants'] },
        { id: 'duck', name: 'Duck', emoji: '🦆', the: 'the duck', x: 60, y: 140, eats: ['plants', 'snail'] },
        { id: 'fish', name: 'Small fish', emoji: '🐟', the: 'the small fish', x: 240, y: 140, eats: ['shrimp', 'larva'] },
        { id: 'kingfisher', name: 'Kingfisher', emoji: '🐦', the: 'the kingfisher', x: 240, y: 38, eats: ['fish'] }
      ]
    },
    garden: {
      name: 'Garden',
      organisms: [
        { id: 'plant', name: 'Leafy plants', emoji: '🥬', the: 'leafy plants', x: 180, y: 362, eats: [] },
        { id: 'caterpillar', name: 'Caterpillar', emoji: '🐛', the: 'the caterpillar', x: 60, y: 268, eats: ['plant'] },
        { id: 'grasshopper', name: 'Grasshopper', emoji: '🦗', the: 'the grasshopper', x: 180, y: 268, eats: ['plant'] },
        { id: 'snail', name: 'Snail', emoji: '🐌', the: 'the snail', x: 300, y: 268, eats: ['plant'] },
        { id: 'bird', name: 'Small bird', emoji: '🐦', the: 'the small bird', x: 80, y: 172, eats: ['caterpillar', 'grasshopper'] },
        { id: 'frog', name: 'Frog', emoji: '🐸', the: 'the frog', x: 272, y: 172, eats: ['grasshopper', 'snail'] },
        { id: 'snake', name: 'Snake', emoji: '🐍', the: 'the snake', x: 272, y: 96, eats: ['frog'] },
        { id: 'eagle', name: 'Eagle', emoji: '🦅', the: 'the eagle', x: 150, y: 34, eats: ['snake', 'bird'] }
      ]
    }
  };

  var NODE_W = 108, NODE_H = 58;
  var MODES = {
    web: 'Tap an organism to see what it eats and what eats it.',
    chain: 'Build a food chain. Start with the producer, then tap what eats it, and keep going to the top.',
    whatif: 'Tap an organism to remove it from the habitat. What happens to the others?'
  };

  var state = {
    habitat: 'pond',
    mode: 'web',
    selected: null, // web mode
    chain: [], // chain mode: ids so far
    chainMsg: null, // {text, good}
    found: {}, // found[habitat] = list of completed chains ('a>b>c')
    removed: null // whatif mode
  };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- food web logic ---------- */
  function orgs() { return HABITATS[state.habitat].organisms; }

  function get(id, habitat) {
    return HABITATS[habitat || state.habitat].organisms.filter(function (o) { return o.id === id; })[0];
  }

  function eatersOf(id, habitat) {
    return HABITATS[habitat || state.habitat].organisms.filter(function (o) { return o.eats.indexOf(id) !== -1; });
  }

  function isProducer(o) { return o.eats.length === 0; }

  // every complete food chain: from a producer up to an organism nothing eats
  function allChains(habitat) {
    var out = [];
    function walk(path) {
      var next = eatersOf(path[path.length - 1], habitat);
      if (!next.length) {
        out.push(path.join('>'));
        return;
      }
      next.forEach(function (n) { walk(path.concat(n.id)); });
    }
    HABITATS[habitat].organisms.filter(isProducer).forEach(function (p) { walk([p.id]); });
    return out;
  }

  // first effects of removing one organism
  function effects(id, habitat) {
    var gone = get(id, habitat);
    var list = [];
    eatersOf(id, habitat).forEach(function (e) {
      var other = e.eats.filter(function (f) { return f !== id; }).map(function (f) { return get(f, habitat).the; });
      list.push({
        id: e.id, change: 'down',
        why: 'It has less food, because it eats ' + gone.the + '.' + (other.length ? ' It can still eat ' + other.join(' and ') + '.' : ' It has nothing else to eat.')
      });
    });
    gone.eats.forEach(function (f) {
      list.push({ id: f, change: 'up', why: 'Fewer are eaten, because ' + gone.the + ' ate them.' });
    });
    return list;
  }

  function names(list) {
    return list.map(function (o) { return o.name.toLowerCase(); }).join(', ');
  }

  /* ---------- drawing ---------- */
  // point where the line from a towards b leaves a's box (with a small gap)
  function edgePoint(a, b, gap) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var hw = NODE_W / 2 + gap, hh = NODE_H / 2 + gap;
    var t = Math.min(dx !== 0 ? hw / Math.abs(dx) : Infinity, dy !== 0 ? hh / Math.abs(dy) : Infinity);
    return { x: a.x + dx * t, y: a.y + dy * t };
  }

  function draw() {
    var s = '';
    var fx = state.mode === 'whatif' && state.removed ? effects(state.removed) : [];
    var fxById = {};
    fx.forEach(function (f) { fxById[f.id] = f; });
    var sel = state.mode === 'web' ? state.selected : null;

    // arrows: from the organism that is eaten to the one that eats it
    orgs().forEach(function (eater) {
      eater.eats.forEach(function (foodId) {
        var food = get(foodId);
        var a = edgePoint(food, eater, 3), b = edgePoint(eater, food, 7);
        var on = true, strong = false;
        if (sel) { strong = eater.id === sel || foodId === sel; on = strong; }
        if (state.mode === 'chain') {
          var i = state.chain.indexOf(foodId);
          strong = i !== -1 && state.chain[i + 1] === eater.id;
          on = strong || !state.chain.length;
        }
        if (state.removed) { on = eater.id !== state.removed && foodId !== state.removed; }
        var color = strong ? 'var(--primary)' : 'var(--ink-soft)';
        var ang = Math.atan2(b.y - a.y, b.x - a.x);
        var hx = b.x - Math.cos(ang) * 11, hy = b.y - Math.sin(ang) * 11;
        s += '<g style="opacity:' + (on ? 1 : 0.18) + '">' +
          '<line class="anim-flow" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + hx.toFixed(1) + '" y2="' + hy.toFixed(1) +
          '" style="stroke:' + color + ';stroke-width:' + (strong ? 3.5 : 2.2) + '"/>' +
          '<polygon points="' + b.x.toFixed(1) + ',' + b.y.toFixed(1) + ' ' +
          (hx - Math.sin(ang) * 6).toFixed(1) + ',' + (hy + Math.cos(ang) * 6).toFixed(1) + ' ' +
          (hx + Math.sin(ang) * 6).toFixed(1) + ',' + (hy - Math.cos(ang) * 6).toFixed(1) + '" style="fill:' + color + '"/></g>';
      });
    });

    // organisms
    orgs().forEach(function (o) {
      var removed = state.removed === o.id;
      var picked = sel === o.id || (state.mode === 'chain' && state.chain.indexOf(o.id) !== -1);
      var related = sel && (o.eats.indexOf(sel) !== -1 || get(sel).eats.indexOf(o.id) !== -1);
      var dim = (sel && !picked && !related) || removed;
      var f = fxById[o.id];
      var label = o.name + (isProducer(o) ? ', producer' : ', consumer') +
        (removed ? ', removed' : '') + (f ? (f.change === 'up' ? ', likely to increase' : ', likely to decrease') : '');
      s += '<g class="web-node" role="button" tabindex="0" data-id="' + o.id + '" aria-label="' + label + '" style="opacity:' + (dim ? 0.35 : 1) + '">' +
        '<rect x="' + (o.x - NODE_W / 2) + '" y="' + (o.y - NODE_H / 2) + '" width="' + NODE_W + '" height="' + NODE_H + '" rx="10" style="fill:var(--surface);stroke:' +
        (picked ? 'var(--primary)' : 'var(--ink-soft)') + ';stroke-width:' + (picked ? 3.5 : 1.5) + '"/>' +
        '<text x="' + o.x + '" y="' + (o.y + 1) + '" text-anchor="middle" style="font-size:24px">' + o.emoji + '</text>' +
        '<text class="svg-text" x="' + o.x + '" y="' + (o.y + 21) + '" text-anchor="middle" style="font-size:14px">' + o.name + '</text>';
      if (removed) {
        s += '<path d="M' + (o.x - 40) + ' ' + (o.y - 20) + ' L' + (o.x + 40) + ' ' + (o.y + 20) + ' M' + (o.x + 40) + ' ' + (o.y - 20) + ' L' + (o.x - 40) + ' ' + (o.y + 20) +
          '" style="stroke:var(--error);stroke-width:4;stroke-linecap:round"/>';
      }
      if (f) {
        var up = f.change === 'up';
        var bx = o.x + NODE_W / 2 - 6, by = o.y - NODE_H / 2 + 6;
        s += '<circle cx="' + bx + '" cy="' + by + '" r="12" style="fill:' + (up ? 'var(--success)' : 'var(--error)') + '"/>' +
          '<text x="' + bx + '" y="' + (by + 5) + '" text-anchor="middle" style="font-size:14px;font-weight:700;fill:var(--surface)">' + (up ? '▲' : '▼') + '</text>';
      }
      s += '</g>';
    });

    var focused = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-id');
    $('web').innerHTML = '<svg viewBox="0 0 360 400" role="group" aria-label="Food web of a ' + HABITATS[state.habitat].name.toLowerCase() +
      '. Arrows point from each organism to the organism that eats it.">' + s + '</svg>';
    if (focused) {
      var again = $('web').querySelector('[data-id="' + focused + '"]');
      if (again) again.focus();
    }
  }

  /* ---------- information panel ---------- */
  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }

  function renderPanel() {
    var panel = $('panel');
    panel.innerHTML = '';
    $('again-btn').hidden = state.mode === 'web';
    $('again-btn').textContent = state.mode === 'chain' ? 'Start a new chain' : 'Put it back';

    if (state.mode === 'web') {
      if (!state.selected) {
        panel.appendChild(el('p', MODES.web));
        return;
      }
      var o = get(state.selected);
      var eaters = eatersOf(o.id);
      var food = o.eats.map(function (f) { return get(f); });
      panel.appendChild(el('h3', o.emoji + ' ' + o.name));
      var ul = el('ul');
      ul.appendChild(el('li', isProducer(o)
        ? 'A producer. It makes its own food by photosynthesis, using light from the Sun.'
        : 'A consumer. It cannot make its own food, so it eats other organisms.'));
      if (food.length) ul.appendChild(el('li', 'It eats: ' + names(food) + '.'));
      ul.appendChild(el('li', eaters.length ? 'It is eaten by: ' + names(eaters) + '.' : 'Nothing in this habitat eats it.'));
      var animalFood = food.filter(function (f) { return !isProducer(f); });
      if (animalFood.length) ul.appendChild(el('li', 'It is a predator. Its prey: ' + names(animalFood) + '.'));
      if (eaters.length && !isProducer(o)) ul.appendChild(el('li', 'It is prey for: ' + names(eaters) + '.'));
      panel.appendChild(ul);
      return;
    }

    if (state.mode === 'chain') {
      var total = allChains(state.habitat);
      var found = state.found[state.habitat] || [];
      var row = el('div', null, 'chain');
      if (!state.chain.length) row.appendChild(el('span', 'Your food chain will appear here.', 'chain-empty'));
      state.chain.forEach(function (id, i) {
        if (i > 0) {
          var a = el('span', '→', 'arrow');
          a.setAttribute('aria-label', 'is eaten by');
          row.appendChild(a);
        }
        row.appendChild(el('span', get(id).emoji + ' ' + get(id).name, 'chip'));
      });
      panel.appendChild(row);
      var msg = state.chainMsg || { text: MODES.chain, good: null };
      panel.appendChild(el('p', msg.text, 'feedback' + (msg.good === true ? ' good' : msg.good === false ? ' bad' : '')));
      panel.appendChild(el('p', 'Food chains found in this habitat: ' + found.length + ' of ' + total.length + '.'));
      if (found.length) {
        var list = el('ul');
        found.forEach(function (c) {
          list.appendChild(el('li', c.split('>').map(function (id) { return get(id).name; }).join(' → ')));
        });
        panel.appendChild(list);
      }
      return;
    }

    // what if?
    if (!state.removed) {
      panel.appendChild(el('p', MODES.whatif));
      return;
    }
    var gone = get(state.removed);
    panel.appendChild(el('h3', 'What if ' + gone.the + (isProducer(gone) ? ' are' : ' is') + ' removed?'));
    var fx = effects(state.removed);
    if (!fx.length) panel.appendChild(el('p', 'Nothing else is affected at first.'));
    var ul2 = el('ul', null, 'effect-list');
    fx.forEach(function (f) {
      var li = el('li');
      var b = el('strong', (f.change === 'up' ? '▲ ' : '▼ ') + get(f.id).name + ': likely to ' + (f.change === 'up' ? 'increase' : 'decrease') + ' at first. ',
        f.change === 'up' ? 'fx-up' : 'fx-down');
      li.appendChild(b);
      li.appendChild(document.createTextNode(f.why));
      ul2.appendChild(li);
    });
    panel.appendChild(ul2);
    panel.appendChild(el('p', 'These are the first changes. Later, other organisms in the food web would be affected too.', 'slowmo-note'));
  }

  function render() {
    draw();
    renderPanel();
  }

  /* ---------- actions ---------- */
  function tapOrganism(id) {
    var o = get(id);
    if (state.mode === 'web') {
      state.selected = state.selected === id ? null : id;
    } else if (state.mode === 'whatif') {
      state.removed = state.removed === id ? null : id;
    } else {
      var last = state.chain[state.chain.length - 1];
      var done = last && !eatersOf(last).length;
      if (done) {
        state.chain = [];
        last = null;
      }
      if (!last) {
        if (isProducer(o)) {
          state.chain = [id];
          state.chainMsg = { text: 'Good start! ' + o.name + ' make their own food. Now tap an animal that eats ' + o.the + '.', good: true };
        } else {
          state.chainMsg = { text: 'Not quite. A food chain starts with a producer, an organism that makes its own food. Which one is it?', good: false };
        }
      } else if (o.eats.indexOf(last) !== -1) {
        state.chain.push(id);
        if (eatersOf(id).length) {
          state.chainMsg = { text: 'Correct! Now tap an animal that eats ' + o.the + '.', good: true };
        } else {
          var key = state.chain.join('>');
          var found = state.found[state.habitat] = state.found[state.habitat] || [];
          var isNew = found.indexOf(key) === -1;
          if (isNew) found.push(key);
          state.chainMsg = {
            text: '🎉 A complete food chain! Nothing in this habitat eats ' + o.the + '.' + (isNew ? '' : ' (You found this one before.)') +
              (found.length < allChains(state.habitat).length ? ' Tap the producer to build another.' : ' You have found them all!'),
            good: true
          };
        }
      } else {
        state.chainMsg = { text: 'Not quite. Look for an animal that eats ' + get(last).the + '. Follow the arrows.', good: false };
      }
    }
    render();
  }

  function resetMode() {
    state.selected = null;
    state.chain = [];
    state.chainMsg = null;
    state.removed = null;
  }

  function pressed(groupId, attr, value) {
    document.querySelectorAll('#' + groupId + ' button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute(attr) === value));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#habitat-choices button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.habitat = btn.getAttribute('data-habitat');
        pressed('habitat-choices', 'data-habitat', state.habitat);
        resetMode();
        render();
      });
    });
    document.querySelectorAll('#mode-choices button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.mode = btn.getAttribute('data-mode');
        pressed('mode-choices', 'data-mode', state.mode);
        resetMode();
        render();
      });
    });
    $('again-btn').addEventListener('click', function () {
      resetMode();
      render();
    });
    var web = $('web');
    web.addEventListener('click', function (e) {
      var node = e.target.closest('.web-node');
      if (node) tapOrganism(node.getAttribute('data-id'));
    });
    web.addEventListener('keydown', function (e) {
      var node = e.target.closest && e.target.closest('.web-node');
      if (node && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        tapOrganism(node.getAttribute('data-id'));
      }
    });
    render();
  });

  // exposed for quick checks in the browser console
  window.foodwebModel = { HABITATS: HABITATS, allChains: allChains, effects: effects };
})();
