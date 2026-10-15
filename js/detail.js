// High-bit sprite cache. Classic script, no build. Sprites are 3x the world size
// so a retina draw is 1:1, with full gradients instead of a tiny palette.
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
    const W = big ? 78 : 48;
    const H = big ? 114 : 81;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    c.worldW = big ? 26 : 16;
    c.worldH = big ? 38 : 27;
    const g = c.getContext('2d');
    const f = frame % 6;
    const swing = [0, 5, 9, 4, -2, -7][f];
    const bob = [0, 1, 2, 1, 0, 1][f];
    const attack = pose === 'attack';
    const side = dir === 'side';
    const front = dir === 'down' || dir === 'se';
    const back = dir === 'up' || dir === 'ne';
    const y0 = (big ? 10 : 4) + bob;
    const ox = big ? 15 : 0;

    function grad(x, y, w, h, a, b) {
      const grd = g.createLinearGradient(x, y, x + w * 0.2, y + h);
      grd.addColorStop(0, a);
      grd.addColorStop(0.42, a);
      grd.addColorStop(1, b);
      g.fillStyle = grd;
      g.fillRect(x, y, w, h);
    }

    const legL = ox + 14 + (back ? swing * 0.3 : swing);
    const legR = ox + 26 - (back ? swing * 0.3 : swing);
    grad(legL, y0 + 50, 8, 20, look.pantsHi, look.pantsDk);
    grad(legR, y0 + 50, 8, 18, look.pants, look.pantsDk);
    g.fillStyle = 'rgba(255,255,255,0.28)';
    g.fillRect(legL, y0 + 52, 2, 12);
    g.fillStyle = look.shoe;
    g.fillRect(legL - 1, y0 + 68, 11, 6);
    g.fillRect(legR - 1, y0 + 66, 11, 6);
    g.fillStyle = '#f7f3ea';
    g.fillRect(legL, y0 + 68, 4, 2);
    g.fillStyle = '#2a241c';
    g.fillRect(legL, y0 + 72, 11, 2);
    g.fillRect(legR, y0 + 70, 11, 2);

    const torsoX = ox + (side ? 16 : 10);
    const torsoW = side ? 18 : 28;
    grad(torsoX, y0 + 30, torsoW, 24, look.jacketHi, look.jacketDk);
    g.fillStyle = 'rgba(255,255,255,0.16)';
    g.fillRect(torsoX + 1, y0 + 31, 3, 16);
    if (look.chain) {
      g.fillStyle = '#ffe9a0';
      g.fillRect(torsoX + 6, y0 + 40, torsoW - 12, 2);
      g.fillRect(torsoX + torsoW / 2 - 2, y0 + 42, 4, 5);
    }
    if (front || side) {
      grad(torsoX + (side ? 8 : 8), y0 + 34, side ? 8 : 12, 12, look.shirtHi, look.shirtDk);
    }
    if (look.torn) {
      g.fillStyle = look.skin;
      g.fillRect(torsoX + 4, y0 + 40, 5, 5);
    }
    if (look.badge) {
      g.fillStyle = look.badge;
      g.fillRect(torsoX + torsoW - 10, y0 + 34, 5, 5);
      g.fillStyle = '#fff';
      g.fillRect(torsoX + torsoW - 9, y0 + 35, 2, 2);
    }

    const reach = attack ? 10 : 0;
    const armOff = attack ? 0 : swing * 0.35;
    grad(torsoX - 6 - reach * 0.2 + armOff, y0 + 32, 7, 16, look.jacket, look.jacketDk);
    grad(torsoX + torsoW - 2 + reach - armOff, y0 + 32, 7, 16, look.jacketHi, look.jacketDk);
    const skinG = g.createLinearGradient(0, y0 + 46, 0, y0 + 54);
    skinG.addColorStop(0, look.skinHi);
    skinG.addColorStop(1, look.skinDk);
    g.fillStyle = skinG;
    g.fillRect(torsoX - 5 - reach * 0.2 + armOff, y0 + 46, 6, 6);
    g.fillRect(torsoX + torsoW - 1 + reach - armOff, y0 + 46, 6, 6);
    if (look.stick) {
      g.fillStyle = '#d5d0dc';
      g.fillRect(torsoX + torsoW + 4 + reach, y0 + 28, 2, 18);
    }

    const hx = ox + (side ? 18 : 14);
    const hw = side ? 16 : 20;
    const face = g.createLinearGradient(hx, y0 + 12, hx + hw, y0 + 32);
    face.addColorStop(0, look.skinHi);
    face.addColorStop(0.55, look.skin);
    face.addColorStop(1, look.skinDk);
    g.fillStyle = face;
    g.fillRect(hx, y0 + 14, hw, 18);
    if (look.hat) {
      const hat = g.createLinearGradient(hx - 3, y0 + 4, hx, y0 + 16);
      hat.addColorStop(0, look.hatHi);
      hat.addColorStop(1, look.hat);
      g.fillStyle = hat;
      g.fillRect(hx - 3, y0 + 8, hw + 6, 8);
      g.fillRect(hx - 1, y0 + 4, hw + 2, 6);
    } else if (look.mohawk) {
      const moh = g.createLinearGradient(hx, y0, hx + 8, y0 + 16);
      moh.addColorStop(0, '#ffd0e4');
      moh.addColorStop(0.5, look.mohawk);
      moh.addColorStop(1, '#8a1848');
      g.fillStyle = moh;
      g.fillRect(hx + 6, y0 - 2, 6, 18);
    } else {
      const hair = g.createLinearGradient(hx, y0 + 4, hx, y0 + 18);
      hair.addColorStop(0, look.hairHi);
      hair.addColorStop(1, look.hair);
      g.fillStyle = hair;
      g.fillRect(hx - 1, y0 + 6, hw + 2, 12);
      g.fillStyle = look.hairHi;
      g.fillRect(hx + 2, y0 + 7, 4, 2);
    }

    if (!back || dir === 'ne') {
      g.fillStyle = '#140c18';
      if (side) {
        g.fillRect(hx + 9, y0 + 20, 4, 4);
        g.fillStyle = '#ffffff';
        g.fillRect(hx + 10, y0 + 20, 2, 2);
        g.fillStyle = look.skinDk;
        g.fillRect(hx + 13, y0 + 24, 3, 3);
      } else {
        const shift = dir === 'se' ? 2 : 0;
        if (look.shades) {
          g.fillStyle = '#100c16';
          g.fillRect(hx + 1 + shift, y0 + 19, hw - 2, 6);
          g.fillStyle = 'rgba(150, 230, 255, 0.85)';
          g.fillRect(hx + 2 + shift, y0 + 20, 6, 3);
          g.fillStyle = 'rgba(255, 140, 190, 0.8)';
          g.fillRect(hx + hw - 9 + shift, y0 + 20, 6, 3);
        } else {
          g.fillStyle = look.eye || '#140c18';
          g.fillRect(hx + 3 + shift, y0 + 20, 4, 4);
          g.fillRect(hx + 11 + shift, y0 + 20, 4, 4);
          g.fillStyle = '#ffffff';
          g.fillRect(hx + 3 + shift, y0 + 20, 2, 2);
          g.fillRect(hx + 11 + shift, y0 + 20, 2, 2);
        }
        g.fillStyle = look.mouth || '#c4847c';
        g.fillRect(hx + 6 + shift, y0 + 27, 8, 2);
      }
    }

    g.fillStyle = 'rgba(20, 12, 24, 0.35)';
    g.fillRect(torsoX + 2, y0 + 32, 1, 16);
    g.fillStyle = 'rgba(255,255,255,0.22)';
    g.fillRect(torsoX + torsoW - 7, y0 + 36, 3, 3);
    g.fillStyle = 'rgba(40, 28, 18, 0.35)';
    g.fillRect(legL + 1, y0 + 58, 4, 3);

    if (big) {
      const crown = g.createLinearGradient(18, 0, 60, 16);
      crown.addColorStop(0, '#fff6c0');
      crown.addColorStop(0.5, '#e6b325');
      crown.addColorStop(1, '#a87410');
      g.fillStyle = crown;
      g.fillRect(22, y0, 8, 10);
      g.fillRect(32, y0 - 2, 10, 12);
      g.fillRect(44, y0, 8, 10);
      g.fillStyle = '#fff';
      g.fillRect(34, y0, 3, 3);
      const coat = g.createLinearGradient(8, y0 + 28, 70, y0 + 70);
      coat.addColorStop(0, '#d2b0ff');
      coat.addColorStop(0.4, '#6a3ad0');
      coat.addColorStop(1, '#2a1848');
      g.fillStyle = coat;
      g.fillRect(8, y0 + 32, 62, 28);
      g.fillStyle = '#ff4d8d';
      g.fillRect(30, y0 + 36, 16, 8);
      g.fillStyle = '#ffe9a0';
      g.fillRect(24, y0 + 48, 30, 3);
    }

    g.globalCompositeOperation = 'source-atop';
    const rim = g.createLinearGradient(0, 0, W, H);
    rim.addColorStop(0, 'rgba(255, 252, 245, 0.30)');
    rim.addColorStop(0.45, 'rgba(255,255,255,0)');
    rim.addColorStop(1, 'rgba(30, 16, 48, 0.28)');
    g.fillStyle = rim;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
    return outline(c, big ? 3 : 2);
  }

  function pack(look, big) {
    const dirs = ['down', 'up', 'side', 'se', 'ne'];
    const walk = {};
    const attack = {};
    for (let d = 0; d < dirs.length; d++) {
      const dir = dirs[d];
      walk[dir] = [];
      attack[dir] = [];
      for (let f = 0; f < 6; f++) walk[dir].push(paintPerson(dir, f, look, 'walk', big));
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
    boss: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#1a1020', hairHi: '#6a5088',
      jacket: '#6a3ad0', jacketHi: '#d2b0ff', jacketDk: '#2a1848',
      shirtHi: '#ff8ab0', shirtDk: '#c41858',
      pants: '#2a1848', pantsHi: '#6a48a0', pantsDk: '#140818',
      shoe: '#141018', shades: true, chain: true,
    },
  };

  function build() {
    const cast = {};
    const flash = {};
    const names = ['player', 'zombie', 'alfa', 'cop', 'dealer', 'civ'];
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
    };
  }

  window.GTADetail = { build: build };
})();
