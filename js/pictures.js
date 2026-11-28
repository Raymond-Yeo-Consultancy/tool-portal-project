/*
 * Pictures for quiz questions. A question can carry a "pic" object that
 * describes a picture; Pictures.draw(pic) turns it into a <figure>.
 * Colours come from the CSS variables, so pictures work in both themes.
 *
 * Kinds: table, bars, line, flow, circuits, magnets, parts, springs,
 *        pendulums, shadow, beakers, forces, swing.
 * Each picture gets a text description (for screen readers) built from its data.
 */
(function () {
  var W = 360;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function T(x, y, s, o) {
    o = o || {};
    return '<text class="pt' + (o.small ? ' ps' : '') + '" x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '"' +
      (o.rot ? ' transform="rotate(' + o.rot + ' ' + x + ' ' + y + ')"' : '') + '>' + esc(s) + '</text>';
  }
  function P(d, cls, extra) { return '<path class="pl' + (cls ? ' ' + cls : '') + '" d="' + d + '"' + (extra || '') + '/>'; }
  function R(x, y, w, h, cls, rx) {
    return '<rect class="pf' + (cls ? ' ' + cls : '') + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '"/>';
  }
  function C(cx, cy, r, cls) { return '<circle class="pf' + (cls ? ' ' + cls : '') + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>'; }
  function arrow(x1, y1, x2, y2, cls) {
    var a = Math.atan2(y2 - y1, x2 - x1), s = 8;
    var bx = x2 - Math.cos(a) * s, by = y2 - Math.sin(a) * s;
    var px = Math.cos(a + Math.PI / 2) * 4.5, py = Math.sin(a + Math.PI / 2) * 4.5;
    return P('M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + bx.toFixed(1) + ' ' + by.toFixed(1), cls) +
      '<polygon class="ph' + (cls ? ' ' + cls : '') + '" points="' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' ' + (bx + px).toFixed(1) + ',' + (by + py).toFixed(1) + ' ' + (bx - px).toFixed(1) + ',' + (by - py).toFixed(1) + '"/>';
  }
  // a letter in a circle, with a pointer line to (tx, ty)
  function badge(x, y, letter, tx, ty) {
    return (tx === undefined ? '' : P('M' + x + ' ' + y + ' L' + tx + ' ' + ty, 'thin') + '<circle class="pd" cx="' + tx + '" cy="' + ty + '" r="3"/>') + C(x, y, 12) + T(x, y + 5, letter);
  }
  function svg(h, body, alt) {
    return '<svg viewBox="0 0 ' + W + ' ' + h + '" role="img" aria-label="' + esc(alt) + '">' + body + '</svg>';
  }
  function niceStep(max) {
    var steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
    for (var i = 0; i < steps.length; i++) if (max / steps[i] <= 6) return steps[i];
    return 1000;
  }

  /* ---------- table (plain HTML) ---------- */
  function table(p) {
    var h = '<table class="pic-table"><thead><tr>' + p.head.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    p.rows.forEach(function (r) {
      h += '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table>';
  }

  /* ---------- bar chart: bars [[label, value], ...], y axis title ---------- */
  function axes(left, top, right, bottom, max, step, yTitle) {
    var s = '';
    for (var v = 0; v <= max + 1e-9; v += step) {
      var y = bottom - (bottom - top) * v / max;
      s += P('M' + left + ' ' + y + ' H' + right, 'grid') + T(left - 6, y + 4, v, { a: 'end', small: true });
    }
    s += P('M' + left + ' ' + top + ' V' + bottom + ' H' + right);
    s += T(13, (top + bottom) / 2, yTitle, { rot: -90, small: true });
    return s;
  }
  function bars(p) {
    var left = 52, top = 14, right = 348, bottom = 168, H = 212;
    var maxV = Math.max.apply(null, p.bars.map(function (b) { return b[1]; }));
    var step = p.step || niceStep(p.max || maxV), max = p.max || Math.ceil(maxV / step) * step;
    var s = axes(left, top, right, bottom, max, step, p.y), n = p.bars.length, slot = (right - left) / n;
    p.bars.forEach(function (b, i) {
      var h = (bottom - top) * b[1] / max, x = left + slot * i + slot * 0.2;
      s += R(x, bottom - h, slot * 0.6, h, 'c1');
      String(b[0]).split('\n').forEach(function (line, k) { s += T(left + slot * (i + 0.5), bottom + 16 + k * 13, line, { small: true }); });
    });
    if (p.x) s += T((left + right) / 2, H - 4, p.x, { small: true });
    return svg(H, s, 'Bar chart of ' + p.y + '. ' + p.bars.map(function (b) { return String(b[0]).replace('\n', ' ') + ': ' + b[1]; }).join('; ') + '.');
  }

  /* ---------- line graph: lines [{ name, pts: [[x, y], ...] }], x and y titles ---------- */
  function line(p) {
    var left = 52, top = 14, right = 330, bottom = 168, H = 208, all = [];
    p.lines.forEach(function (l) { all = all.concat(l.pts); });
    var maxY = p.ymax || Math.max.apply(null, all.map(function (q) { return q[1]; }));
    var minY = p.ymin || 0;
    var stepY = p.ystep || niceStep(maxY - minY); maxY = Math.ceil(maxY / stepY) * stepY;
    var maxX = p.xmax || Math.max.apply(null, all.map(function (q) { return q[0]; }));
    var stepX = p.xstep || niceStep(maxX);
    var X = function (v) { return left + (right - left) * v / maxX; };
    var Y = function (v) { return bottom - (bottom - top) * (v - minY) / (maxY - minY); };
    var s = '';
    for (var v = minY; v <= maxY + 1e-9; v += stepY) s += P('M' + left + ' ' + Y(v) + ' H' + right, 'grid') + T(left - 6, Y(v) + 4, v, { a: 'end', small: true });
    for (var u = 0; u <= maxX + 1e-9; u += stepX) s += P('M' + X(u) + ' ' + top + ' V' + bottom, 'grid') + T(X(u), bottom + 15, u, { small: true });
    s += P('M' + left + ' ' + top + ' V' + bottom + ' H' + right);
    s += T(13, (top + bottom) / 2, p.y, { rot: -90, small: true }) + T((left + right) / 2, H - 6, p.x, { small: true });
    p.lines.forEach(function (l, i) {
      s += P(l.pts.map(function (q, k) { return (k ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }).join(' '), 'thick s' + (i + 1));
      l.pts.forEach(function (q) { s += '<circle class="pd s' + (i + 1) + '" cx="' + X(q[0]).toFixed(1) + '" cy="' + Y(q[1]).toFixed(1) + '" r="3.5"/>'; });
      var end = l.pts[l.pts.length - 1];
      if (l.name && l.start) s += T(X(l.pts[0][0]) + 12, Y(l.pts[0][1]) + (l.pts[0][1] > end[1] ? -6 : 16), l.name, { a: 'start' });
      else if (l.name) s += T(X(end[0]) + 8, Y(end[1]) + (l.dy || 4), l.name, { a: 'start' });
    });
    return svg(H, s, 'Line graph of ' + p.y + ' against ' + p.x + '. ' + p.lines.map(function (l) {
      return (l.name ? 'Line ' + l.name + ': ' : '') + l.pts.map(function (q) { return q[1] + ' at ' + q[0]; }).join(', ');
    }).join('. ') + '.');
  }

  /* ---------- flow: labelled boxes joined by arrows ----------
     nodes: [label, ...]; layout 'row' (default, snakes onto new rows), 'cycle', or at: [[x, y], ...]
     arrows: [[from, to], ...] (default: each node to the next; a cycle also closes) */
  function flow(p) {
    var n = p.nodes.length, at = p.at, H = p.h, i;
    var boxes = p.nodes.map(function (label) {
      var lines = String(label).split('\n'), len = Math.max.apply(null, lines.map(function (l) { return l.length; }));
      return { w: Math.max(32, len * 7.5 + 18), h: lines.length * 15 + 12, lines: lines };
    });
    if (at) {
      H = H || 220;
      boxes.forEach(function (b, k) { b.x = at[k][0]; b.y = at[k][1]; });
      // boxes on the same level must not overlap or leave the frame
      var levels = {};
      boxes.forEach(function (b) { (levels[b.y] = levels[b.y] || []).push(b); });
      Object.keys(levels).forEach(function (y) {
        var row = levels[y].sort(function (a, b) { return a.x - b.x; }), k;
        for (k = 0; k < row.length; k++) row[k].x = Math.max(row[k].x, (k ? row[k - 1].x + row[k - 1].w / 2 + 8 : 4) + row[k].w / 2);
        for (k = row.length - 1; k >= 0; k--) row[k].x = Math.min(row[k].x, (k < row.length - 1 ? row[k + 1].x - row[k + 1].w / 2 - 8 : W - 4) - row[k].w / 2);
      });
    } else if (p.layout === 'cycle') {
      H = H || 236;
      boxes.forEach(function (b, k) {
        b.x = 180 + 112 * Math.sin(2 * Math.PI * k / n); b.y = H / 2 - (H / 2 - 30) * Math.cos(2 * Math.PI * k / n);
        b.x = Math.max(b.w / 2 + 4, Math.min(W - b.w / 2 - 4, b.x));
      });
    } else {
      // rows that snake: left to right, then right to left on the next row
      var rows = [[]], used = 0, GAP = 30;
      boxes.forEach(function (b) {
        var row = rows[rows.length - 1];
        if (row.length && (used + GAP + b.w > W - 12 || (p.per && row.length >= p.per))) { row = []; rows.push(row); used = 0; }
        used += (row.length ? GAP : 0) + b.w; row.push(b);
      });
      var y = 6, gap0 = 30;
      rows.forEach(function (row, r) {
        var rh = Math.max.apply(null, row.map(function (b) { return b.h; }));
        var total = row.reduce(function (a, b) { return a + b.w; }, 0);
        var gap = row.length > 1 ? Math.min(60, (W - 12 - total) / (row.length - 1)) : 0;
        if (r === 0) gap0 = gap; else gap = Math.min(gap || gap0, gap0);
        var x = rows.length > 1 ? (r % 2 ? W - 6 : 6) : (W - total - gap * (row.length - 1)) / 2;
        row.forEach(function (b) {
          if (r % 2) { b.x = x - b.w / 2; x -= b.w + gap; } else { b.x = x + b.w / 2; x += b.w + gap; }
          b.y = y + rh / 2;
        });
        y += rh + 34;
      });
      H = H || y - 34 + 6;
    }
    var arrows = p.arrows;
    if (!arrows) {
      arrows = [];
      for (i = 0; i < n - 1; i++) arrows.push([i, i + 1]);
      if (p.layout === 'cycle') arrows.push([n - 1, 0]);
    }
    function edge(a, b) {
      var dx = b.x - a.x, dy = b.y - a.y;
      var s = Math.min(dx ? (a.w / 2 + 3) / Math.abs(dx) : 1e9, dy ? (a.h / 2 + 3) / Math.abs(dy) : 1e9);
      return [a.x + dx * s, a.y + dy * s];
    }
    var s = '';
    arrows.forEach(function (ar) {
      var a = edge(boxes[ar[0]], boxes[ar[1]]), b = edge(boxes[ar[1]], boxes[ar[0]]);
      s += arrow(a[0], a[1], b[0], b[1]);
    });
    boxes.forEach(function (b) {
      s += R(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, '', 6);
      b.lines.forEach(function (l, k) { s += T(b.x, b.y - (b.lines.length - 1) * 7.5 + k * 15 + 4.5, l); });
    });
    var name = function (k) { return String(p.nodes[k]).replace(/\n/g, ' '); };
    return svg(H, s, 'Diagram with arrows. ' + arrows.map(function (ar) { return name(ar[0]) + ' → ' + name(ar[1]); }).join('; ') + '.');
  }

  /* ---------- circuits: items [{ name, batteries, bulbs, type: 'series' | 'parallel', sw: 'open' | 'closed', gap: 'iron nail' }] ---------- */
  function circuits(p) {
    var n = p.items.length, cols = n > 3 ? 2 : n, rowsN = Math.ceil(n / cols), cw = W / cols, ch = 150, s = '', alt = [];
    p.items.forEach(function (c, i) {
      var ox = (i % cols) * cw, oy = Math.floor(i / cols) * ch;
      var l = ox + 24, r = ox + cw - 24, t = oy + 44, b = oy + 96, mid = (l + r) / 2;
      var par = c.type === 'parallel' && c.bulbs > 1, k;
      if (c.name) s += T(ox + 10, oy + 18, c.name + (c.gap ? ': ' + c.gap : ''), { a: 'start' });
      // batteries on the top wire
      var bw = 14, startB = mid - (c.batteries * bw) / 2;
      s += P('M' + l + ' ' + t + ' H' + startB + ' M' + (startB + c.batteries * bw - 8) + ' ' + t + ' H' + r);
      for (k = 0; k < c.batteries; k++) {
        var bx = startB + k * bw;
        s += P('M' + bx + ' ' + (t - 11) + ' V' + (t + 11)) + P('M' + (bx + 6) + ' ' + (t - 6) + ' V' + (t + 6), 'thick');
        if (k < c.batteries - 1) s += P('M' + (bx + 6) + ' ' + t + ' H' + (bx + bw));
      }
      // left side, with a switch if there is one
      var lowest = par ? b + (c.bulbs - 1) * 24 : b;
      if (c.sw) {
        s += P('M' + l + ' ' + t + ' V' + (t + 14) + ' M' + l + ' ' + (t + 38) + ' V' + lowest);
        s += c.sw === 'open' ? P('M' + l + ' ' + (t + 38) + ' L' + (l + 13) + ' ' + (t + 17)) : P('M' + l + ' ' + (t + 14) + ' V' + (t + 38), 'thick');
        s += T(l + 17, t + 31, 'switch', { a: 'start', small: true });
        s += '<circle class="pd" cx="' + l + '" cy="' + (t + 14) + '" r="2.5"/><circle class="pd" cx="' + l + '" cy="' + (t + 38) + '" r="2.5"/>';
      } else s += P('M' + l + ' ' + t + ' V' + lowest);
      // right side, with a test object in a gap if there is one
      if (c.gap) s += P('M' + r + ' ' + t + ' V' + (t + 14) + ' M' + r + ' ' + (t + 38) + ' V' + lowest) + R(r - 6, t + 14, 12, 24, 'c4');
      else s += P('M' + r + ' ' + t + ' V' + lowest);
      // bulbs
      function bulb(x, y) {
        return C(x, y, 9) + P('M' + (x - 6) + ' ' + (y - 6) + ' L' + (x + 6) + ' ' + (y + 6) + ' M' + (x - 6) + ' ' + (y + 6) + ' L' + (x + 6) + ' ' + (y - 6), 'thin');
      }
      if (par) {
        for (k = 0; k < c.bulbs; k++) s += P('M' + l + ' ' + (b + k * 24) + ' H' + r) + bulb(mid, b + k * 24);
      } else {
        s += P('M' + l + ' ' + b + ' H' + r);
        for (k = 0; k < c.bulbs; k++) s += bulb(l + (r - l) * (k + 1) / (c.bulbs + 1), b);
      }
      alt.push((c.name ? 'Circuit ' + c.name + ': ' : '') + c.batteries + (c.batteries === 1 ? ' battery, ' : ' batteries, ') + c.bulbs + (c.bulbs === 1 ? ' bulb' : ' bulbs in ' + (par ? 'parallel' : 'series')) +
        (c.sw ? ', switch ' + c.sw : '') + (c.gap ? ', with a gap bridged by: ' + c.gap : ''));
    });
    return svg(rowsN * ch + 6, s, alt.join('. ') + '.');
  }

  /* ---------- magnets: rows [{ name, bars: ['NS', 'SN'] or [['P', 'Q'], 'nail'] }] ----------
     A two-letter string or a two-item list is a bar magnet with those pole labels; any other string is a plain object. */
  function magnets(p) {
    var s = '', alt = [], rh = 48;
    p.rows.forEach(function (row, i) {
      var y = 10 + i * rh, x = row.name ? 44 : 14, parts = [];
      if (row.name) s += T(12, y + 20, row.name, { a: 'start' });
      var total = row.bars.length, bw = Math.min(118, (W - x - 14 - (total - 1) * (row.gap || 22)) / total);
      row.bars.forEach(function (bar) {
        var isMagnet = typeof bar !== 'string' || bar.length === 2;
        if (isMagnet) {
          s += R(x, y, bw, 30, '', 3) + P('M' + (x + bw / 2) + ' ' + y + ' V' + (y + 30), 'thin') + T(x + 14, y + 20, bar[0]) + T(x + bw - 14, y + 20, bar[1]);
          parts.push('magnet with poles ' + bar[0] + ' and ' + bar[1]);
        } else {
          s += R(x, y + 4, bw, 22, 'c4', 3) + T(x + bw / 2, y + 20, bar, { small: true });
          parts.push(bar);
        }
        x += bw + (row.gap || 22);
      });
      alt.push((row.name ? row.name + ': ' : '') + parts.join(', then '));
    });
    return svg(p.rows.length * rh + 6, s, 'Bars placed end to end, left to right. ' + alt.join('. ') + '.');
  }

  /* ---------- parts: a labelled drawing. of: 'plant' | 'digestive' | 'flower' | 'plantcell' | 'animalcell'
     letters: { partId: 'A', ... } puts a letter on each named part ---------- */
  var DRAWINGS = {
    plant: {
      h: 250, what: 'a flowering plant',
      body: function () {
        var s = P('M0 178 H360', 'thick');
        s += P('M180 178 V240 M180 190 Q158 198 140 226 M180 190 Q204 200 222 228 M180 208 Q166 218 160 240 M180 208 Q196 218 202 240', 'root');
        s += R(175, 60, 10, 118, 'c3', 4);
        s += '<ellipse class="pf c3" cx="140" cy="128" rx="36" ry="14" transform="rotate(22 140 128)"/><ellipse class="pf c3" cx="222" cy="104" rx="36" ry="14" transform="rotate(-22 222 104)"/>';
        for (var i = 0; i < 6; i++) s += C(180 + Math.cos(i * Math.PI / 3) * 19, 42 + Math.sin(i * Math.PI / 3) * 19, 12, 'c2');
        return s + C(180, 42, 11, 'c5');
      },
      at: { flower: [262, 30, 212, 40], leaf: [300, 96, 256, 100], stem: [112, 160, 174, 160], roots: [270, 222, 216, 224] },
      names: { flower: 'the flower', leaf: 'a leaf', stem: 'the stem', roots: 'the roots' }
    },
    digestive: {
      h: 262, what: 'the human digestive system',
      body: function () {
        function tube(d, c, w) {
          return '<path d="' + d + '" style="fill:none;stroke:var(--ink);stroke-width:' + (w + 4) + ';stroke-linecap:round;stroke-linejoin:round"/>' +
            '<path d="' + d + '" style="fill:none;stroke:var(' + c + ');stroke-width:' + w + ';stroke-linecap:round;stroke-linejoin:round"/>';
        }
        var s = '<g transform="translate(96 4) scale(0.57)">';
        s += '<circle cx="150" cy="58" r="46" style="fill:var(--surface);stroke:var(--ink-soft);stroke-width:2"/>';
        s += '<path d="M132 100 V116 Q74 120 70 170 V400 Q70 432 104 432 H196 Q230 432 230 400 V170 Q226 120 168 116 V100" style="fill:var(--surface);stroke:var(--ink-soft);stroke-width:2"/>';
        s += tube('M118 356 Q88 360 88 334 V288 Q88 266 110 266 H206 Q228 266 228 288 V352 Q228 384 196 384 H166 Q150 384 150 396 V406', '--ramp', 14);
        s += tube('M150 252 V276 Q150 286 160 286 H192 Q202 286 202 296 Q202 306 192 306 H122 Q112 306 112 316 Q112 326 122 326 H192 Q202 326 202 336 Q202 346 192 346 H128 Q118 346 118 356', '--e-elec', 9);
        s += tube('M150 88 V186', '--e-sound', 9);
        s += '<path d="M150 186 C198 178 216 214 198 240 C184 260 152 254 146 238 C142 222 150 206 150 186 Z" style="fill:var(--e-heat);stroke:var(--ink);stroke-width:2"/>';
        s += '<ellipse cx="150" cy="78" rx="18" ry="9" style="fill:var(--car);stroke:var(--ink);stroke-width:2"/>';
        s += '<circle cx="150" cy="413" r="7" style="fill:var(--ink-soft);stroke:var(--ink);stroke-width:2"/>';
        return s + '</g>';
      },
      at: { mouth: [262, 48, 194, 48], gullet: [98, 84, 178, 84], stomach: [262, 126, 214, 126], small: [98, 150, 176, 184], large: [262, 186, 230, 186], anus: [262, 240, 188, 240] },
      names: { mouth: 'the mouth', gullet: 'the tube from the mouth to the stomach', stomach: 'the bag-like organ below that tube', small: 'the narrow coiled tube', large: 'the wide tube round the outside', anus: 'the opening at the bottom' }
    },
    flower: {
      h: 240, what: 'a flower cut in half',
      body: function () {
        var s = P('M180 236 V204', 'thick');
        s += '<path class="pf c2" d="M158 184 C110 190 40 166 30 106 C70 116 120 146 160 172 Z"/><path class="pf c2" d="M202 184 C250 190 320 166 330 106 C290 116 240 146 200 172 Z"/>';
        s += P('M164 172 Q146 138 140 100 M196 172 Q214 138 220 100');
        s += '<ellipse class="pf c5" cx="140" cy="92" rx="8" ry="12"/><ellipse class="pf c5" cx="220" cy="92" rx="8" ry="12"/>';
        s += R(176, 78, 8, 90, 'c3') + '<ellipse class="pf c5" cx="180" cy="72" rx="13" ry="8"/>';
        s += '<ellipse class="pf c3" cx="180" cy="186" rx="26" ry="20"/>' + C(171, 186, 5, 'c5') + C(189, 186, 5, 'c5');
        return s;
      },
      at: { petal: [28, 56, 62, 138], anther: [288, 38, 223, 88], filament: [84, 44, 149, 140], stigma: [180, 26, 180, 68], style: [128, 18, 177, 112], ovary: [264, 224, 188, 203], ovule: [96, 224, 170, 188] },
      names: { petal: 'a large coloured outer part', anther: 'the top of a thin stalk', filament: 'a thin stalk', stigma: 'the tip of the centre column', style: 'the centre column', ovary: 'the swollen base', ovule: 'a small round body inside the base' }
    },
    plantcell: {
      h: 190, what: 'a plant cell',
      body: function () {
        var s = R(84, 6, 192, 178, 'c6', 4) + R(98, 20, 164, 150, '', 2) + R(108, 30, 144, 130, '', 3);
        s += C(214, 128, 19, 'c1');
        [[136, 54], [222, 56], [138, 136], [176, 96]].forEach(function (c) { s += '<ellipse class="pf c3" cx="' + c[0] + '" cy="' + c[1] + '" rx="14" ry="8"/>'; });
        return s;
      },
      at: { wall: [40, 30, 91, 40], membrane: [40, 100, 108, 100], cytoplasm: [312, 86, 220, 86], nucleus: [316, 140, 228, 130], chloroplast: [316, 34, 232, 54] },
      names: { wall: 'the thick outer layer', membrane: 'the thin line just inside the thick outer layer', cytoplasm: 'the jelly-like substance filling the cell', nucleus: 'the large round body', chloroplast: 'a small green oval' }
    },
    animalcell: {
      h: 190, what: 'an animal cell',
      body: function () {
        return '<path class="pf" d="M110 60 C120 10 230 6 252 60 C276 110 250 174 180 172 C104 174 96 110 110 60 Z"/>' + C(196, 104, 22, 'c1');
      },
      at: { membrane: [50, 60, 108, 68], cytoplasm: [312, 50, 232, 56], nucleus: [312, 130, 216, 110] },
      names: { membrane: 'the thin outer layer', cytoplasm: 'the jelly-like substance filling the cell', nucleus: 'the large round body' }
    }
  };
  function parts(p) {
    var d = DRAWINGS[p.of], s = d.body(), alt = [];
    Object.keys(p.letters).forEach(function (id) {
      var a = d.at[id];
      s += badge(a[0], a[1], p.letters[id], a[2], a[3]);
      alt.push(p.letters[id] + ' points to ' + d.names[id]);
    });
    return svg(d.h, s, 'Drawing of ' + d.what + '. ' + alt.join('; ') + '.');
  }

  /* ---------- springs: items [{ name, len (cm), load: '100 g' }], hanging from a bar ---------- */
  function springs(p) {
    var n = p.items.length, slot = W / n, s = P('M10 16 H350', 'thick'), alt = [];
    var maxLen = Math.max.apply(null, p.items.map(function (it) { return it.len; })), px = 120 / maxLen;
    p.items.forEach(function (it, i) {
      var x = slot * (i + 0.5) - 14, top = 16, bot = top + it.len * px, d = 'M' + x + ' ' + top, coils = 9;
      for (var k = 0; k < coils; k++) {
        var y0 = top + 4 + (bot - top - 8) * k / coils, step = (bot - top - 8) / coils;
        d += ' L' + (x - 9) + ' ' + (y0 + step * 0.25).toFixed(1) + ' L' + (x + 9) + ' ' + (y0 + step * 0.75).toFixed(1);
      }
      s += P(d + ' L' + x + ' ' + bot);
      if (it.load) s += R(x - 22, bot, 44, 22, 'c4', 3) + T(x, bot + 16, it.load, { small: true });
      if (p.show !== false) s += P('M' + (x + 26) + ' ' + top + ' V' + bot + ' M' + (x + 22) + ' ' + top + ' H' + (x + 30) + ' M' + (x + 22) + ' ' + bot + ' H' + (x + 30), 'thin') + T(x + 34, (top + bot) / 2 + 4, it.len + ' cm', { a: 'start', small: true });
      if (it.name) s += T(x, 196, it.name);
      alt.push((it.name || 'Spring') + ': ' + (it.load ? 'load ' + it.load : 'no load') + (p.show !== false ? ', length ' + it.len + ' cm' : ''));
    });
    return svg(204, s, 'Springs hanging from a bar. ' + alt.join('. ') + '.');
  }

  /* ---------- pendulums: items [{ name, len (cm), bob: 'small' | 'large', note }] ---------- */
  function pendulums(p) {
    var n = p.items.length, slot = W / n, s = P('M10 14 H350', 'thick'), alt = [];
    var maxLen = Math.max.apply(null, p.items.map(function (it) { return it.len; })), px = 118 / maxLen;
    p.items.forEach(function (it, i) {
      var x = slot * (i + 0.5), L = it.len * px, bx = x + L * 0.26, by = 14 + L * 0.966, r = it.bob === 'large' ? 13 : 8;
      s += P('M' + x + ' 14 V' + (14 + L), 'grid') + P('M' + x + ' 14 L' + bx.toFixed(1) + ' ' + by.toFixed(1)) + C(bx, by, r, 'c1');
      s += T(x - 8, 14 + L / 2, it.len + ' cm', { a: 'end', small: true });
      if (it.name) s += T(x, 172, it.name);
      if (it.note) s += T(x, 188, it.note, { small: true });
      alt.push((it.name || 'Pendulum') + ': string ' + it.len + ' cm, ' + (it.bob === 'large' ? 'large' : 'small') + ' bob' + (it.note ? ', ' + it.note : ''));
    });
    return svg(196, s, 'Pendulums hanging from a bar. ' + alt.join('. ') + '.');
  }

  /* ---------- shadow: rows [{ name, d (cm from torch to object), label }], screen 60 cm from the torch ---------- */
  function shadow(p) {
    var rh = 92, s = '', alt = [], screenCm = p.screen || 60, objCm = p.obj || 4, sx = 46, px = 4.4, v = 2.7;
    p.rows.forEach(function (row, i) {
      var cy = 44 + i * rh, ox = sx + row.d * px, ex = sx + screenCm * px, half = objCm * v / 2;
      var sh = objCm * screenCm / row.d * v / 2;
      if (row.name) s += T(8, cy - 28, row.name, { a: 'start' });
      s += '<polygon class="beam" points="' + sx + ',' + cy + ' ' + ex + ',' + (cy - 40) + ' ' + ex + ',' + (cy + 40) + '"/>';
      if (p.showShadow !== false) s += '<polygon class="dark" points="' + ox + ',' + (cy - half) + ' ' + ex + ',' + (cy - sh).toFixed(1) + ' ' + ex + ',' + (cy + sh).toFixed(1) + ' ' + ox + ',' + (cy + half) + '"/>';
      s += R(sx - 30, cy - 8, 26, 16, 'c5', 3) + R(sx - 6, cy - 11, 8, 22, 'c5', 2);
      s += R(ox - 2, cy - half, 4, half * 2, 'c6') + R(ex, cy - 40, 5, 80, '');
      s += P('M' + sx + ' ' + (cy + 36) + ' H' + ox + ' M' + sx + ' ' + (cy + 32) + ' V' + (cy + 40) + ' M' + ox + ' ' + (cy + 32) + ' V' + (cy + 40), 'thin');
      s += T((sx + ox) / 2, cy + 33, row.label || (row.d + ' cm'), { small: true });
      alt.push((row.name ? row.name + ': ' : '') + 'object ' + (row.label || row.d + ' cm') + ' from the torch');
    });
    return svg(p.rows.length * rh + 2, s, 'A torch on the left shines on an object, with a screen on the right. ' + alt.join('. ') + '.');
  }

  /* ---------- beakers: items [{ name, level 0–1, wide, lid, text, note, color: 1–6, cube }] ---------- */
  function beakers(p) {
    var n = p.items.length, slot = W / n, s = '', alt = [];
    p.items.forEach(function (it, i) {
      var cx = slot * (i + 0.5), w = it.wide ? Math.min(slot - 16, 96) : Math.min(slot - 24, 52), top = it.wide ? 84 : 36, bot = 130, l = cx - w / 2;
      var lev = it.level === undefined ? 0.6 : it.level, ly = bot - (bot - top - 8) * lev;
      if (lev > 0) s += '<rect class="liquid c' + (it.color || 1) + '" x="' + (l + 1) + '" y="' + ly + '" width="' + (w - 2) + '" height="' + (bot - ly - 1) + '"/>';
      s += P('M' + l + ' ' + top + ' V' + bot + ' H' + (l + w) + ' V' + top);
      if (it.lid) s += P('M' + (l - 4) + ' ' + (top - 3) + ' H' + (l + w + 4), 'thick');
      if (it.cube) s += R(cx - 9, bot - 21, 18, 18, 'c6', 2);
      if (it.text) s += T(cx, top - 12, it.text, { small: true });
      if (it.name) s += T(cx, 150, it.name);
      if (it.note) String(it.note).split('\n').forEach(function (line, k) { s += T(cx, 166 + k * 13, line, { small: true }); });
      alt.push((it.name || 'Container') + ': ' + (it.wide ? 'wide, shallow container' : 'tall, narrow container') + (it.lid ? ' with a lid' : '') +
        (it.text ? ', ' + it.text : '') + (it.note ? ', ' + String(it.note).replace(/\n/g, ' ') : ''));
    });
    return svg(p.h || 186, s, 'Containers of liquid. ' + alt.join('. ') + '.');
  }

  /* ---------- forces: an object with labelled arrows. arrows [{ dir: 'up' | 'down' | 'left' | 'right', label, long }], on: 'table' | 'air' ---------- */
  function forces(p) {
    var cx = 180, cy = p.on === 'air' ? 108 : 96, s = '', alt = [];
    if (p.on !== 'air') s += P('M40 118 H320', 'thick') + (p.surface ? T(318, 136, p.surface, { a: 'end', small: true }) : '');
    var bw = Math.max(68, String(p.object || 'box').length * 7.5 + 18);
    s += R(cx - bw / 2, cy - 22, bw, 44, 'c4', 4) + T(cx, cy + 5, p.object || 'box');
    var V = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    p.arrows.forEach(function (a) {
      var v = V[a.dir], len = a.long ? 78 : 46, off = v[0] ? bw / 2 + 4 : 26;
      var x1 = cx + v[0] * off, y1 = cy + v[1] * off, x2 = x1 + v[0] * len, y2 = y1 + v[1] * len;
      s += arrow(x1, y1, x2, y2, 'thick');
      s += T(x2 + v[0] * 12 + (v[1] ? 14 : 0), y2 + (v[0] ? 5 : v[1] * 2 + 4), a.label);
      alt.push('arrow ' + a.label + ' points ' + a.dir + (a.long ? ' (long)' : ''));
    });
    if (p.note) s += T(cx, p.on === 'air' ? 16 : 194, p.note, { small: true });
    return svg(p.on === 'air' ? 232 : 200, s, 'An object (' + (p.object || 'box') + ')' + (p.on === 'air' ? ' in the air' : ' on a surface') + (p.note ? '. ' + p.note : '') + '. ' + alt.join('; ') + '.');
  }

  /* ---------- swing: one pendulum shown at three positions, labelled left, middle, right ---------- */
  function swing(p) {
    var px = 180, py = 16, L = 130, ang = 0.62, lab = p.labels || ['A', 'B', 'C'];
    var lx = px - L * Math.sin(ang), ly = py + L * Math.cos(ang), rx = px + L * Math.sin(ang);
    var s = P('M120 ' + py + ' H240', 'thick');
    s += P('M' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ' A' + L + ' ' + L + ' 0 0 0 ' + rx.toFixed(1) + ' ' + ly.toFixed(1), 'grid dash');
    s += P('M' + px + ' ' + py + ' L' + lx.toFixed(1) + ' ' + ly.toFixed(1), 'thin') + P('M' + px + ' ' + py + ' L' + rx.toFixed(1) + ' ' + ly.toFixed(1), 'thin') + P('M' + px + ' ' + py + ' V' + (py + L));
    s += C(lx, ly, 10, 'c4') + C(rx, ly, 10, 'c4') + C(px, py + L, 10, 'c1');
    s += T(lx - 20, ly + 5, lab[0]) + T(px, py + L + 28, lab[1]) + T(rx + 20, ly + 5, lab[2]);
    return svg(182, s, 'A pendulum swinging from side to side. ' + lab[0] + ' is the highest point on the left, ' + lab[1] + ' is the lowest point in the middle, and ' + lab[2] + ' is the highest point on the right.');
  }

  var KINDS = { table: table, bars: bars, line: line, flow: flow, circuits: circuits, magnets: magnets, parts: parts, springs: springs, pendulums: pendulums, shadow: shadow, beakers: beakers, forces: forces, swing: swing };

  window.Pictures = {
    kinds: Object.keys(KINDS),
    // returns a <figure> for the picture, or null if there is none
    draw: function (pic) {
      if (!pic || !KINDS[pic.kind]) return null;
      var f = document.createElement('figure');
      f.className = 'pic pic-' + pic.kind;
      f.innerHTML = KINDS[pic.kind](pic);
      if (pic.caption) {
        var c = document.createElement('figcaption');
        c.textContent = pic.caption;
        f.appendChild(c);
      }
      return f;
    }
  };
})();
