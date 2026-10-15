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
    const u = big ? 3 : 2;
    const cols = big ? 18 : 16;
    const rows = big ? 26 : 24;
    const W = cols * u;
    const H = rows * u;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    c.worldW = W / 2;
    c.worldH = H / 2;
    const g = c.getContext('2d');
    const f = frame % 8;
    const swing = [0, 1, 2, 1, 0, -1, -2, -1][f];
    const side = dir === 'side';
    const back = dir === 'up' || dir === 'ne';
    const attack = pose === 'attack';
    const wide = look.wide ? 1 : 0;

    function box(x, y, w, h, color) {
      if (w < 1 || h < 1) return;
      g.fillStyle = '#000';
      g.fillRect(x - 1, y - 1, w + 2, h + 2);
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    }
    function cell(x, y, w, h, color) {
      box((x | 0) * u, (y | 0) * u, (w | 0) * u, (h | 0) * u, color);
    }

    const ox = side ? 1 : 0;
    const legL = 4 + ox + (back ? -swing : swing);
    const legR = 8 + ox + wide - (back ? -swing : swing);
    cell(legL, 14, 3, 6, look.pants);
    cell(legR, 14, 3, 6, look.pantsDk || look.pants);
    cell(legL, 15, 1, 4, look.pantsHi || look.pants);
    cell(legL - 1, 20, 4, 2, look.shoe);
    cell(legR, 20, 4, 2, look.shoe);
    cell(legL - 1, 20, 2, 1, '#3a342c');

    const torsoX = (side ? 5 : 4) + ox;
    const torsoW = (side ? 6 : 8) + wide;
    cell(torsoX, 8, torsoW, 7, look.jacket);
    cell(torsoX, 8, 1, 6, look.jacketHi || look.jacket);
    cell(torsoX + torsoW - 1, 9, 1, 5, look.jacketDk || look.jacket);
    if (look.coat) cell(torsoX - 1, 13, torsoW + 2, 3, look.jacketDk || look.jacket);
    if (!back || side) cell(torsoX + 2, 9, Math.max(2, torsoW - 4), 3, look.shirtHi || '#fff');
    if (look.torn) cell(torsoX + 1, 11, 2, 2, look.skin);
    if (look.badge) cell(torsoX + torsoW - 3, 9, 2, 2, look.badge);
    if (look.chain) {
      cell(torsoX + 1, 11, torsoW - 2, 1, '#ffe9a0');
      cell(torsoX + (torsoW / 2 | 0), 12, 1, 2, '#ffe9a0');
    }

    const reach = attack ? 3 : 0;
    cell(torsoX - 2, 9, 2, 5, look.jacketDk || look.jacket);
    cell(torsoX + torsoW - reach * 0 + reach, 8, 2 + (attack ? 2 : 0), 5, look.jacketHi || look.jacket);
    cell(torsoX - 2, 13, 2, 2, look.skin);
    cell(torsoX + torsoW + reach, 12, 2, 2, look.skin);
    if (look.stick) cell(torsoX + torsoW + 2 + reach, 7, 1, 7, '#d5d0dc');

    const hx = (side ? 6 : 5) + ox;
    const hw = side ? 5 : 6;
    cell(hx, 3, hw, 5, look.skin);
    cell(hx, 3, 1, 4, look.skinHi || look.skin);
    if (look.hat) {
      cell(hx - 1, 2, hw + 2, 2, look.hat);
      cell(hx, 1, hw, 2, look.hatHi || look.hat);
    } else if (look.cap) {
      cell(hx - 1, 2, hw + 2, 2, look.cap);
      cell(hx + hw - 1, 3, 2, 1, look.capHi || look.cap);
    } else if (look.bald) {
      cell(hx + 1, 2, hw - 2, 1, look.skinHi || look.skin);
    } else if (look.mohawk) {
      cell(hx + 2, 0, 2, 5, look.mohawk);
    } else {
      cell(hx - 1, 2, hw + 2, 3, look.hair || '#2a160f');
      cell(hx, 2, 2, 1, look.hairHi || look.hair || '#8a5a3a');
      if (look.longHair) {
        cell(hx - 1, 5, 1, 6, look.hair);
        cell(hx + hw, 5, 1, 6, look.hair);
      }
    }

    if (!back || dir === 'ne') {
      if (side) {
        cell(hx + 3, 5, 2, 1, '#140c18');
        cell(hx + 3, 5, 1, 1, '#fff');
        cell(hx + 4, 6, 1, 1, look.skinDk || look.skin);
      } else if (look.shades) {
        cell(hx, 5, hw, 1, '#100c16');
        cell(hx, 5, 2, 1, '#9ee7ff');
        cell(hx + hw - 2, 5, 2, 1, '#ff8ac0');
      } else {
        const eye = look.eye || '#140c18';
        cell(hx + 1, 5, 1, 1, eye);
        cell(hx + hw - 2, 5, 1, 1, eye);
        g.fillStyle = '#fff';
        g.fillRect((hx + 1) * u, 5 * u, Math.max(1, u - 1), Math.max(1, u - 1));
        g.fillRect((hx + hw - 2) * u, 5 * u, Math.max(1, u - 1), Math.max(1, u - 1));
        if (look.beard) cell(hx + 1, 7, hw - 2, 1, look.hair || '#2a160f');
        else cell(hx + 2, 7, Math.max(2, hw - 4), 1, look.mouth || '#c4847c');
      }
    }

    if (big) {
      cell(6, 0, 2, 2, '#e6b325');
      cell(8, 0, 2, 3, '#fff6c0');
      cell(10, 0, 2, 2, '#a87410');
      cell(5, 9, 8, 4, '#6a3ad0');
      cell(7, 10, 4, 2, '#ff4d8d');
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

  function gemStone(size, a, b, c0) {
    const s = document.createElement('canvas');
    s.width = size;
    s.height = size;
    s.worldW = Math.round(size / 3);
    s.worldH = s.worldW;
    const g = s.getContext('2d');
    const grd = g.createLinearGradient(0, 0, size, size);
    grd.addColorStop(0, c0);
    grd.addColorStop(0.45, a);
    grd.addColorStop(1, b);
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(size / 2, 2);
    g.lineTo(size - 3, size * 0.4);
    g.lineTo(size / 2, size - 2);
    g.lineTo(3, size * 0.4);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.fillRect(size * 0.38, size * 0.28, size * 0.16, size * 0.12);
    return outline(s, 1);
  }

  function paintWeapons() {
    const crystal = document.createElement('canvas');
    crystal.width = 24;
    crystal.height = 24;
    crystal.worldW = 8;
    crystal.worldH = 8;
    let g = crystal.getContext('2d');
    const cg = g.createLinearGradient(0, 0, 24, 24);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(0.35, '#b8fff8');
    cg.addColorStop(1, '#1aa8c4');
    g.fillStyle = cg;
    g.beginPath();
    g.moveTo(12, 1);
    g.lineTo(22, 12);
    g.lineTo(12, 23);
    g.lineTo(2, 12);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.fillRect(8, 7, 4, 3);

    const cart = document.createElement('canvas');
    cart.width = 48;
    cart.height = 42;
    cart.worldW = 16;
    cart.worldH = 14;
    g = cart.getContext('2d');
    const mg = g.createLinearGradient(0, 0, 0, 42);
    mg.addColorStop(0, '#f4f2f8');
    mg.addColorStop(1, '#6a6478');
    g.fillStyle = mg;
    g.fillRect(6, 4, 36, 8);
    g.fillRect(8, 12, 4, 18);
    g.fillRect(36, 12, 4, 18);
    g.fillRect(8, 28, 32, 4);
    g.fillStyle = '#1a1420';
    g.fillRect(6, 32, 10, 8);
    g.fillRect(32, 32, 10, 8);
    g.fillStyle = '#8d8a98';
    g.fillRect(8, 34, 4, 3);

    const speaker = document.createElement('canvas');
    speaker.width = 42;
    speaker.height = 42;
    speaker.worldW = 14;
    speaker.worldH = 14;
    g = speaker.getContext('2d');
    const sg = g.createLinearGradient(0, 0, 42, 42);
    sg.addColorStop(0, '#6a5088');
    sg.addColorStop(1, '#1a1224');
    g.fillStyle = sg;
    g.fillRect(4, 4, 34, 30);
    const cone = g.createRadialGradient(14, 14, 2, 14, 14, 10);
    cone.addColorStop(0, '#d8fbff');
    cone.addColorStop(1, '#1a6a78');
    g.fillStyle = cone;
    g.beginPath();
    g.arc(14, 16, 8, 0, Math.PI * 2);
    g.fill();
    const cone2 = g.createRadialGradient(30, 16, 1, 30, 16, 8);
    cone2.addColorStop(0, '#ffd0e4');
    cone2.addColorStop(1, '#a01848');
    g.fillStyle = cone2;
    g.beginPath();
    g.arc(30, 16, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffe14a';
    g.fillRect(8, 34, 26, 3);

    const bottle = document.createElement('canvas');
    bottle.width = 18;
    bottle.height = 36;
    bottle.worldW = 6;
    bottle.worldH = 12;
    g = bottle.getContext('2d');
    g.fillStyle = '#f4f1ea';
    g.fillRect(6, 1, 6, 6);
    const bg = g.createLinearGradient(0, 8, 18, 36);
    bg.addColorStop(0, '#e8fff2');
    bg.addColorStop(0.4, '#3ecf6e');
    bg.addColorStop(1, '#0e5a32');
    g.fillStyle = bg;
    g.fillRect(3, 7, 12, 26);
    g.fillStyle = 'rgba(255,255,255,0.65)';
    g.fillRect(5, 10, 2, 10);
    g.fillStyle = '#ff4d8d';
    g.fillRect(4, 20, 10, 3);

    const bag = document.createElement('canvas');
    bag.width = 24;
    bag.height = 24;
    bag.worldW = 8;
    bag.worldH = 8;
    g = bag.getContext('2d');
    const pg = g.createLinearGradient(0, 0, 24, 24);
    pg.addColorStop(0, '#e7c6ff');
    pg.addColorStop(0.5, '#b06bff');
    pg.addColorStop(1, '#5a2088');
    g.fillStyle = pg;
    g.fillRect(4, 6, 16, 14);
    g.fillStyle = '#fff';
    g.fillRect(8, 10, 8, 4);
    g.fillStyle = '#ffe14a';
    g.fillRect(9, 11, 2, 2);

    return {
      crystal: outline(crystal, 1),
      gem: [gemStone(24, '#d7b4ff', '#5a28a0', '#fff'), gemStone(24, '#efe6ff', '#8a4ad4', '#fff')],
      gemMid: [gemStone(24, '#ffe14a', '#c48410', '#fff6c8'), gemStone(24, '#fff6c8', '#e09a18', '#fff')],
      gemBig: [gemStone(30, '#7ef0f4', '#147888', '#ffffff'), gemStone(30, '#d8fbff', '#1aa8c4', '#fff')],
      cart: outline(cart, 2),
      speaker: outline(speaker, 2),
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
      const grd = g.createLinearGradient(0, 0, 30, 42);
      grd.addColorStop(0, '#6a8a58');
      grd.addColorStop(1, '#243018');
      g.fillStyle = grd;
      g.fillRect(4, 8, 22, 28);
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
      g.fillStyle = '#8a1828';
      g.fillRect(8, 34, 8, 6);
      const grd = g.createLinearGradient(0, 0, 24, 42);
      grd.addColorStop(0, '#ff8aa0');
      grd.addColorStop(0.4, '#e23b4a');
      grd.addColorStop(1, '#8a1828');
      g.fillStyle = grd;
      g.fillRect(6, 10, 12, 26);
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
      g.fillStyle = '#ff8a3d';
      g.beginPath();
      g.moveTo(12, 2);
      g.lineTo(22, 26);
      g.lineTo(2, 26);
      g.closePath();
      g.fill();
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
