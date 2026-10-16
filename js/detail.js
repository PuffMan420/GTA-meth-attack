// Cast, weapons, and props in the same chunky outline as the gubbe.
// Classic script, no build. Sprites are 2x world pixels.
(function () {
  'use strict';

  function outline(src, rad) {
    const w = src.width;
    const h = src.height;
    const data = src.getContext('2d').getImageData(0, 0, w, h).data;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.worldW = src.worldW;
    c.worldH = src.worldH;
    const g = c.getContext('2d');
    const img = g.createImageData(w, h);
    const out = img.data;
    const r = rad || 2;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (data[i + 3] < 20) continue;
        for (let oy = -r; oy <= r; oy++) {
          for (let ox = -r; ox <= r; ox++) {
            if (ox * ox + oy * oy > r * r + r) continue;
            const nx = x + ox;
            const ny = y + oy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const j = (ny * w + nx) * 4;
            out[j] = 18;
            out[j + 1] = 10;
            out[j + 2] = 22;
            out[j + 3] = 255;
          }
        }
      }
    }
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 20) continue;
      out[i] = data[i];
      out[i + 1] = data[i + 1];
      out[i + 2] = data[i + 2];
      out[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function tint(src, color) {
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    c.worldW = src.worldW;
    c.worldH = src.worldH;
    const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function paintPerson(dir, frame, look, pose, big) {
    const W = big ? 48 : 32;
    const H = big ? 72 : 48;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    // Normal people are 22 world px tall (was 24). Width keeps the same shape.
    // The boss uses the big canvas and stays 36 tall.
    c.worldW = big ? W / 2 : 16 * (22 / 24);
    c.worldH = big ? H / 2 : 22;
    const g = c.getContext('2d');
    const f = frame % 8;
    const swing = [0, 2, 4, 2, 0, -2, -4, -2][f];
    const side = dir === 'side';
    const back = dir === 'up' || dir === 'ne';
    const attack = pose === 'attack';
    const k = big ? 1.5 : 1;
    function n(v) { return Math.round(v * k); }

    function chunk(x, y, w, h, mid, hi, dk) {
      if (w < 1 || h < 1) return;
      g.fillStyle = '#000';
      g.fillRect(x - 1, y - 1, w + 2, h + 2);
      g.fillStyle = mid;
      g.fillRect(x, y, w, h);
      if (hi) {
        g.fillStyle = hi;
        g.fillRect(x, y, Math.max(1, w - 2), Math.max(1, Math.min(2, h >> 1)));
        g.fillRect(x, y, Math.max(1, Math.min(2, w >> 2)), h);
      }
      if (dk) {
        g.fillStyle = dk;
        g.fillRect(x, y + h - Math.max(1, Math.min(2, h >> 2)), w, Math.max(1, Math.min(2, h >> 2)));
        g.fillRect(x + w - Math.max(1, Math.min(2, w >> 3)), y, Math.max(1, Math.min(2, w >> 3)), h);
      }
    }

    const ox = side ? n(2) : 0;
    const legW = n(5);
    const legH = n(14);
    const legY = n(28);
    const lSwing = back ? -swing : swing;
    chunk(n(8) + ox + (lSwing > 0 ? lSwing : 0), legY, legW, legH, look.pants, look.pantsHi, look.pantsDk);
    chunk(n(16) + ox - (lSwing < 0 ? -lSwing : 0), legY + (attack ? 0 : 1), legW, legH - 1, look.pantsDk || look.pants, look.pants, look.pantsDk);
    chunk(n(7) + ox + (lSwing > 0 ? lSwing : 0), n(40), n(7), n(5), look.shoe, '#4f5f8b', '#000');
    chunk(n(16) + ox, n(40), n(7), n(5), look.shoe, '#1f2e4b', '#000');

    const torsoX = n(side ? 10 : 7) + ox;
    const torsoW = n(side ? 10 : 16) + (look.wide ? n(2) : 0);
    const torsoY = n(16);
    const torsoH = n(14) + (look.coat ? n(3) : 0);
    chunk(torsoX, torsoY, torsoW, torsoH, look.jacket, look.jacketHi, look.jacketDk);
    if (!back) chunk(torsoX + n(4), torsoY + n(2), Math.max(n(3), torsoW - n(8)), n(5), look.shirtHi || '#fff', '#fff', look.shirtDk || look.shirtHi);
    if (look.torn) chunk(torsoX + n(2), torsoY + n(6), n(3), n(3), look.skin, look.skinHi, look.skinDk);
    if (look.badge) chunk(torsoX + torsoW - n(5), torsoY + n(2), n(3), n(3), look.badge, '#fff6c0', '#a87410');
    if (look.chain) {
      g.fillStyle = '#ffe9a0';
      g.fillRect(torsoX + n(3), torsoY + n(7), torsoW - n(6), 1);
      g.fillRect(torsoX + (torsoW >> 1), torsoY + n(8), 2, n(3));
    }

    const reach = attack ? n(6) : 0;
    chunk(torsoX - n(3), torsoY + n(1), n(4), n(10), look.jacketDk || look.jacket, look.jacket, '#000');
    chunk(torsoX + torsoW - n(1) + reach, torsoY, n(4) + (attack ? n(2) : 0), n(10), look.jacketHi || look.jacket, '#fff', look.jacketDk);
    chunk(torsoX - n(3), torsoY + n(9), n(3), n(3), look.skin, look.skinHi, look.skinDk);
    chunk(torsoX + torsoW + reach, torsoY + n(8), n(3), n(3), look.skin, look.skinHi, look.skinDk);
    if (look.stick) {
      g.fillStyle = '#000';
      g.fillRect(torsoX + torsoW + n(3) + reach, torsoY - n(2), 2, n(16));
      g.fillStyle = '#d5d0dc';
      g.fillRect(torsoX + torsoW + n(3) + reach, torsoY - n(1), 1, n(14));
    }

    const hx = n(side ? 11 : 9) + ox;
    const hy = n(4);
    const hw = n(side ? 8 : 12);
    const hh = n(12);
    chunk(hx, hy, hw, hh, look.skin, look.skinHi, look.skinDk);
    if (look.hat) {
      chunk(hx - n(1), hy - n(2), hw + n(2), n(5), look.hat, look.hatHi, '#000');
    } else if (look.cap) {
      chunk(hx - n(1), hy - n(1), hw + n(3), n(4), look.cap, look.capHi, '#000');
    } else if (look.bald) {
      g.fillStyle = look.skinHi || look.skin;
      g.fillRect(hx + 2, hy, hw - 4, 2);
    } else if (look.mohawk) {
      chunk(hx + (hw >> 1) - 1, hy - n(4), n(3), n(8), look.mohawk, '#ffd0e4', '#8a1848');
    } else {
      chunk(hx - 1, hy - n(1), hw + 2, n(5), look.hair || '#2a160f', look.hairHi || look.hair, '#000');
      if (look.longHair) {
        chunk(hx - n(2), hy + n(4), n(3), n(10), look.hair, look.hairHi, '#000');
        chunk(hx + hw - 1, hy + n(4), n(3), n(10), look.hair, look.hairHi, '#000');
      }
    }
    if (!back || dir === 'ne') {
      if (side) {
        g.fillStyle = '#000';
        g.fillRect(hx + hw - n(3), hy + n(5), n(2), n(2));
        g.fillStyle = '#fff';
        g.fillRect(hx + hw - n(3), hy + n(5), 1, 1);
      } else if (look.shades) {
        g.fillStyle = '#000';
        g.fillRect(hx + n(1), hy + n(5), hw - n(2), n(3));
        g.fillStyle = '#9ee7ff';
        g.fillRect(hx + n(2), hy + n(6), n(3), 1);
        g.fillStyle = '#ff8ac0';
        g.fillRect(hx + hw - n(5), hy + n(6), n(3), 1);
      } else {
        g.fillStyle = '#000';
        g.fillRect(hx + n(2), hy + n(5), n(2), n(2));
        g.fillRect(hx + hw - n(4), hy + n(5), n(2), n(2));
        g.fillStyle = '#fff';
        g.fillRect(hx + n(2), hy + n(5), 1, 1);
        g.fillRect(hx + hw - n(4), hy + n(5), 1, 1);
        if (look.beard) {
          g.fillStyle = look.hair || '#2a160f';
          g.fillRect(hx + n(2), hy + hh - n(3), hw - n(4), n(2));
        } else {
          g.fillStyle = look.mouth || '#9d551d';
          g.fillRect(hx + n(4), hy + hh - n(3), n(4), 1);
        }
      }
    }
    if (big) {
      chunk(n(12), 0, n(4), n(4), '#e6b325', '#fff6c0', '#a87410');
      chunk(n(16), 0, n(6), n(5), '#fff6c0', '#fff', '#e6b325');
      chunk(n(8), n(18), n(20), n(6), '#6a3ad0', '#d2b0ff', '#2a1848');
    }
    return outline(c, 1);
  }

  function pack(look, big) {
    const dirs = ['down', 'up', 'side', 'se', 'ne'];
    const walk = {};
    const attack = {};
    for (let d = 0; d < dirs.length; d++) {
      const dir = dirs[d];
      walk[dir] = [];
      attack[dir] = [];
      for (let f = 0; f < 8; f++) walk[dir].push(paintPerson(dir, f, look, 'walk', big));
      for (let f = 0; f < 2; f++) attack[dir].push(paintPerson(dir, f, look, 'attack', big));
    }
    return { walk: walk, attack: attack };
  }

  function flashPack(set) {
    const out = {};
    const dirs = ['down', 'up', 'side', 'se', 'ne'];
    for (let d = 0; d < dirs.length; d++) {
      const dir = dirs[d];
      out[dir] = set.walk[dir].map(function (s) { return tint(s, '#ffffff'); });
    }
    return out;
  }

  function hotPack(set) {
    const out = {};
    const dirs = ['down', 'up', 'side', 'se', 'ne'];
    for (let d = 0; d < dirs.length; d++) {
      const dir = dirs[d];
      out[dir] = set.walk[dir].map(function (s) { return tint(s, '#ff4d6d'); });
    }
    return out;
  }

  function gemStone(size, mid, dk, hi) {
    const s = document.createElement('canvas');
    s.width = size;
    s.height = size;
    s.worldW = size / 2;
    s.worldH = size / 2;
    const g = s.getContext('2d');
    const m = (size / 2) | 0;
    g.fillStyle = '#000';
    g.fillRect(m - 2, 1, 4, 2);
    g.fillRect(m - 6, 4, 12, 4);
    g.fillRect(2, m - 4, size - 4, 8);
    g.fillRect(m - 6, size - 8, 12, 4);
    g.fillRect(m - 2, size - 4, 4, 2);
    g.fillStyle = dk;
    g.fillRect(m - 1, 2, 2, 2);
    g.fillRect(m - 4, 5, 8, 2);
    g.fillRect(4, m - 2, size - 8, 4);
    g.fillRect(m - 4, size - 7, 8, 2);
    g.fillStyle = mid;
    g.fillRect(m - 2, 4, 4, 2);
    g.fillRect(6, m - 1, size - 12, 3);
    g.fillStyle = hi;
    g.fillRect(m - 1, 4, 2, 2);
    g.fillRect(7, m, 3, 2);
    return outline(s, 1);
  }

  function paintWeapons() {
    function sheet(w, h) {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.worldW = w / 2;
      c.worldH = h / 2;
      return c;
    }
    const crystal = sheet(16, 16);
    let g = crystal.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(6, 0, 4, 2);
    g.fillRect(3, 3, 10, 4);
    g.fillRect(1, 7, 14, 4);
    g.fillRect(3, 11, 10, 3);
    g.fillRect(6, 14, 4, 2);
    g.fillStyle = '#1aa8c4';
    g.fillRect(7, 1, 2, 2);
    g.fillRect(4, 4, 8, 2);
    g.fillRect(2, 8, 12, 2);
    g.fillRect(4, 11, 8, 2);
    g.fillRect(7, 14, 2, 1);
    g.fillStyle = '#b8fff8';
    g.fillRect(6, 4, 3, 2);
    g.fillRect(3, 8, 4, 2);
    g.fillStyle = '#fff';
    g.fillRect(6, 5, 2, 1);

    const cart = sheet(32, 28);
    g = cart.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(2, 2, 28, 8);
    g.fillRect(4, 8, 4, 14);
    g.fillRect(24, 8, 4, 14);
    g.fillRect(4, 20, 24, 4);
    g.fillRect(2, 22, 8, 6);
    g.fillRect(22, 22, 8, 6);
    g.fillStyle = '#d8d4dc';
    g.fillRect(4, 3, 24, 5);
    g.fillRect(5, 9, 2, 12);
    g.fillRect(25, 9, 2, 12);
    g.fillRect(6, 21, 20, 2);
    g.fillStyle = '#f4f2f8';
    g.fillRect(5, 3, 8, 2);
    g.fillStyle = '#6a6478';
    g.fillRect(18, 5, 8, 2);
    g.fillStyle = '#1a1420';
    g.fillRect(3, 23, 6, 4);
    g.fillRect(23, 23, 6, 4);

    const speaker = sheet(28, 28);
    g = speaker.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(2, 2, 24, 22);
    g.fillStyle = '#3a2860';
    g.fillRect(4, 4, 20, 18);
    g.fillStyle = '#6a5088';
    g.fillRect(4, 4, 6, 8);
    g.fillStyle = '#000';
    g.fillRect(6, 7, 8, 8);
    g.fillRect(16, 7, 8, 8);
    g.fillStyle = '#1a6a78';
    g.fillRect(7, 8, 6, 6);
    g.fillStyle = '#d8fbff';
    g.fillRect(8, 9, 3, 2);
    g.fillStyle = '#a01848';
    g.fillRect(17, 8, 6, 6);
    g.fillStyle = '#ffd0e4';
    g.fillRect(18, 9, 3, 2);
    g.fillStyle = '#ffe14a';
    g.fillRect(4, 22, 20, 3);

    const bottle = sheet(12, 24);
    g = bottle.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(4, 0, 4, 6);
    g.fillRect(2, 5, 8, 18);
    g.fillStyle = '#f4f1ea';
    g.fillRect(5, 1, 2, 4);
    g.fillStyle = '#0e5a32';
    g.fillRect(3, 6, 6, 16);
    g.fillStyle = '#3ecf6e';
    g.fillRect(3, 6, 6, 6);
    g.fillStyle = '#e8fff2';
    g.fillRect(4, 7, 2, 4);
    g.fillStyle = '#ff4d8d';
    g.fillRect(3, 13, 6, 2);

    const bag = sheet(16, 16);
    g = bag.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(3, 3, 10, 11);
    g.fillStyle = '#5a2088';
    g.fillRect(4, 4, 8, 9);
    g.fillStyle = '#b06bff';
    g.fillRect(4, 4, 8, 4);
    g.fillStyle = '#e7c6ff';
    g.fillRect(5, 5, 3, 2);
    g.fillStyle = '#fff';
    g.fillRect(5, 8, 6, 2);
    g.fillStyle = '#ffe14a';
    g.fillRect(6, 8, 2, 2);

    return {
      crystal: outline(crystal, 1),
      gem: [gemStone(16, '#d7b4ff', '#5a28a0', '#fff'), gemStone(16, '#efe6ff', '#8a4ad4', '#fff')],
      gemMid: [gemStone(16, '#ffe14a', '#c48410', '#fff6c8'), gemStone(16, '#fff6c8', '#e09a18', '#fff')],
      gemBig: [gemStone(20, '#7ef0f4', '#147888', '#ffffff'), gemStone(20, '#d8fbff', '#1aa8c4', '#fff')],
      cart: outline(cart, 1),
      speaker: outline(speaker, 1),
      bottle: outline(bottle, 1),
      bag: outline(bag, 1),
    };
  }

  const LOOKS = {
    player: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#4a2a16', hairHi: '#e2a878',
      jacket: '#ffe14a', jacketHi: '#fff4a0', jacketDk: '#c49212',
      shirtHi: '#ff8aa0', shirtDk: '#c41848',
      pants: '#31408f', pantsHi: '#6a82e0', pantsDk: '#1a2458',
      shoe: '#1a1420', eye: '#140c18',
    },
    zombie: {
      skin: '#b6e070', skinHi: '#e4ffb0', skinDk: '#5a7a30',
      hair: '#243018', hairHi: '#6a7848',
      jacket: '#8a909e', jacketHi: '#c5cad4', jacketDk: '#3a4050',
      shirtHi: '#e09098', shirtDk: '#7a2838',
      pants: '#3a4a28', pantsHi: '#6ea63a', pantsDk: '#1c2810',
      shoe: '#241c18', eye: '#ff3355', mouth: '#6a1830', torn: true,
    },
    alfa: {
      skin: '#c6ee88', skinHi: '#f0ffc8', skinDk: '#6a8a38',
      hair: '#243018', hairHi: '#6a7848', mohawk: '#ff4d8d',
      jacket: '#3a3a44', jacketHi: '#7a7a88', jacketDk: '#141418',
      shirtHi: '#ff8ab4', shirtDk: '#c41858',
      pants: '#3a2030', pantsHi: '#ff4d8d', pantsDk: '#1a1018',
      shoe: '#1a1420', eye: '#ff3355', mouth: '#4a1828', torn: true, chain: true,
    },
    cop: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#2a2018', hairHi: '#d8c8b0',
      hat: '#24386e', hatHi: '#8aa6ff', badge: '#ffe14a',
      jacket: '#3a62e0', jacketHi: '#9bb6ff', jacketDk: '#1a2c78',
      shirtHi: '#ffffff', shirtDk: '#b8c8ee',
      pants: '#1a2758', pantsHi: '#4a6ad0', pantsDk: '#101838',
      shoe: '#141018', eye: '#140c18', stick: true,
    },
    dealer: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#1a1020', hairHi: '#6a5088',
      jacket: '#8a4ad4', jacketHi: '#d2b0ff', jacketDk: '#3a1868',
      shirtHi: '#4a2868', shirtDk: '#1a1028',
      pants: '#241430', pantsHi: '#7a48c0', pantsDk: '#140818',
      shoe: '#141018', shades: true, chain: true,
    },
    civ: {
      skin: '#e0a888', skinHi: '#ffd8c0', skinDk: '#a86848',
      hair: '#2a160f', hairHi: '#8a5a3a',
      jacket: '#ff8a3d', jacketHi: '#ffd0a8', jacketDk: '#c45018',
      shirtHi: '#fff', shirtDk: '#d0d4ea',
      pants: '#2a3348', pantsHi: '#5a6a8a', pantsDk: '#161c2a',
      shoe: '#1a1420', eye: '#140c18',
    },
    civ2: {
      skin: '#f0c8b0', skinHi: '#ffe8dc', skinDk: '#c48a72',
      hair: '#6a4030', hairHi: '#e0b090',
      jacket: '#2a3a62', jacketHi: '#7a90c8', jacketDk: '#141c38',
      shirtHi: '#f4f1ea', shirtDk: '#c8c4d4',
      pants: '#1c1a24', pantsHi: '#4a4658', pantsDk: '#101018',
      shoe: '#141018', eye: '#140c18', wide: true, coat: true,
    },
    civ3: {
      skin: '#8a5a3c', skinHi: '#c48a62', skinDk: '#5a3824',
      hair: '#1a100c', hairHi: '#4a3020',
      cap: '#e23b4a', capHi: '#ffb0b4',
      jacket: '#1f8a4c', jacketHi: '#7ad89a', jacketDk: '#0e4a28',
      shirtHi: '#fff6c8', shirtDk: '#e6c14a',
      pants: '#3a342c', pantsHi: '#8a7a62', pantsDk: '#241c14',
      shoe: '#1a1420', eye: '#140c18', beard: true,
    },
    civ4: {
      skin: '#f6d2b4', skinHi: '#fff0e4', skinDk: '#d09a78',
      hair: '#1a1028', hairHi: '#a888d0',
      jacket: '#ff4d8d', jacketHi: '#ffb0d0', jacketDk: '#a01848',
      shirtHi: '#ffffff', shirtDk: '#e7c6ff',
      pants: '#2a1848', pantsHi: '#6a48a0', pantsDk: '#140818',
      shoe: '#141018', eye: '#140c18', longHair: true,
    },
    civ5: {
      skin: '#d8a07a', skinHi: '#ffd2b0', skinDk: '#a06848',
      hair: '#c8c4d0', hairHi: '#f4f1ea',
      bald: true,
      jacket: '#6a6458', jacketHi: '#b8b0a4', jacketDk: '#3a342c',
      shirtHi: '#5ce1e6', shirtDk: '#1a6a78',
      pants: '#243048', pantsHi: '#4a6288', pantsDk: '#141c2c',
      shoe: '#1a1420', eye: '#140c18', wide: true,
    },
    boss: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#1a1020', hairHi: '#6a5088',
      jacket: '#6a3ad0', jacketHi: '#d2b0ff', jacketDk: '#2a1848',
      shirtHi: '#ff8ab0', shirtDk: '#c41858',
      pants: '#2a1848', pantsHi: '#6a48a0', pantsDk: '#140818',
      shoe: '#141018', shades: true, chain: true,
    },
  };

  function paintProp(kind) {
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    if (kind === 'bin') {
      c.width = 30;
      c.height = 42;
      c.worldW = 10;
      c.worldH = 14;
      g.fillStyle = '#000';
      g.fillRect(3, 7, 24, 30);
      g.fillStyle = '#243018';
      g.fillRect(4, 8, 22, 28);
      g.fillStyle = '#6a8a58';
      g.fillRect(4, 8, 22, 8);
      g.fillStyle = '#8aaa70';
      g.fillRect(6, 10, 4, 18);
      g.fillStyle = '#1a2414';
      g.fillRect(4, 6, 22, 4);
      g.fillStyle = '#c8d0b0';
      g.fillRect(8, 18, 8, 6);
      g.fillStyle = '#3a2818';
      g.fillRect(10, 20, 4, 2);
    } else if (kind === 'hydrant') {
      c.width = 24;
      c.height = 42;
      c.worldW = 8;
      c.worldH = 14;
      g.fillStyle = '#000';
      g.fillRect(5, 9, 14, 28);
      g.fillStyle = '#8a1828';
      g.fillRect(6, 18, 12, 18);
      g.fillStyle = '#e23b4a';
      g.fillRect(6, 10, 12, 12);
      g.fillStyle = '#ff8aa0';
      g.fillRect(7, 11, 4, 6);
      g.fillStyle = '#ffd0d8';
      g.fillRect(8, 12, 3, 10);
      g.fillStyle = '#c8d0d8';
      g.fillRect(2, 16, 6, 4);
      g.fillRect(16, 16, 6, 4);
      g.fillStyle = '#f4f1ea';
      g.fillRect(8, 6, 8, 6);
      g.fillStyle = '#ffe14a';
      g.fillRect(10, 2, 4, 5);
    } else {
      c.width = 24;
      c.height = 30;
      c.worldW = 8;
      c.worldH = 10;
      g.fillStyle = '#000';
      g.fillRect(10, 2, 4, 4);
      g.fillRect(7, 6, 10, 6);
      g.fillRect(4, 12, 16, 8);
      g.fillRect(2, 20, 20, 6);
      g.fillStyle = '#ff8a3d';
      g.fillRect(11, 3, 2, 2);
      g.fillRect(8, 7, 8, 4);
      g.fillRect(5, 13, 14, 6);
      g.fillRect(3, 21, 18, 4);
      g.fillStyle = '#ffe14a';
      g.fillRect(10, 8, 3, 2);
      g.fillStyle = '#fff6c8';
      g.fillRect(7, 12, 10, 4);
      g.fillStyle = '#1a1420';
      g.fillRect(4, 26, 16, 3);
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.fillRect(10, 6, 2, 4);
    }
    return outline(c, 1);
  }

  function build() {
    const cast = {};
    const flash = {};
    const names = ['player', 'zombie', 'alfa', 'cop', 'dealer', 'civ', 'civ2', 'civ3', 'civ4', 'civ5'];
    for (let i = 0; i < names.length; i++) {
      cast[names[i]] = pack(LOOKS[names[i]], false);
      flash[names[i]] = flashPack(cast[names[i]]);
    }
    cast.boss = pack(LOOKS.boss, true);
    flash.boss = flashPack(cast.boss);
    const weapons = paintWeapons();
    return {
      cast: cast,
      flash: flash,
      bossHot: hotPack(cast.boss),
      crystal: weapons.crystal,
      gem: weapons.gem,
      gemMid: weapons.gemMid,
      gemBig: weapons.gemBig,
      cart: weapons.cart,
      speaker: weapons.speaker,
      bottle: weapons.bottle,
      bag: weapons.bag,
      bin: paintProp('bin'),
      hydrant: paintProp('hydrant'),
      cone: paintProp('cone'),
    };
  }

  window.GTADetail = { build: build };
})();
