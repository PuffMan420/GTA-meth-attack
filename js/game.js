// GTA Meth Attack — the whole game. No build step. This file plus index.html.
(() => {
  'use strict';

  const TILE = 16;
  const ART = 2;
  const PERIOD = 18;
  const TW = 6;
  const BLOCK = PERIOD * TILE;
  const CHUNK_PX = PERIOD * TILE * ART;
  const LOAD_R = 2;
  const UNLOAD_R = 3;
  const MAX_ENEMIES = 32;
  // One world unit: 1 tile = 1 meter. A person is 1 tile wide and about 1.7 m tall.

  const T_ROAD = 1;
  const T_SIDE = 2;
  const T_BUILD = 3;
  const T_GRASS = 4;
  const T_TREE = 5;
  const T_LOT = 6;
  const T_CAR = 7;
  const T_PLAZA = 8;
  const T_FOUNT = 9;

  const COL = {
    skin: '#f2c19a',
    skin2: '#d9a078',
    hair: '#2a160f',
    eye: '#140c18',
    jacket: '#ffe14a',
    jacket2: '#e6b325',
    shirt: '#ff4d6d',
    pants: '#31408f',
    shoe: '#161018',
    zombie: '#9ad15a',
    zombie2: '#6ea63a',
    zh: '#3a4a28',
    eyeR: '#ff2d55',
    cop: '#2f5bde',
    cop2: '#1d3c9a',
    hat: '#162454',
    badge: '#ffe14a',
    dealer: '#8d4ae8',
    dealer2: '#5b27a8',
    gold: '#f2c14a',
    glass: '#7ee7ff',
    white: '#f7f4ee',
    mohawk: '#ff3d8a',
    grey: '#8a8494',
    metal: '#c8c2cf',
    cyan: '#5ce1e6',
    bottle: '#3ecf6e',
    skinHi: '#ffe0c4',
    jacketHi: '#fff4a8',
    pantsHi: '#4d62c4',
    leaf: '#3dff8a',
    leafDk: '#0e4a28',
  };

  const BUILDINGS = [
    { wall: '#8d4e3c', roof: '#6a6458', win: '#c5d4dc', off: '#2a3034' },
    { wall: '#c4b49a', roof: '#6e685c', win: '#d5e0e6', off: '#3a4038' },
    { wall: '#7a7368', roof: '#524e46', win: '#e4d7b0', off: '#2c2a26' },
    { wall: '#6e5344', roof: '#5a5348', win: '#d8c8a4', off: '#2a241c' },
    { wall: '#a09078', roof: '#6a6458', win: '#efe6d0', off: '#343028' },
    { wall: '#6a6e72', roof: '#4e5256', win: '#d0d8e0', off: '#24282c' },
    { wall: '#7d3e3a', roof: '#5c564c', win: '#e8dcc0', off: '#2a2220' },
    { wall: '#b7a48c', roof: '#746c60', win: '#f2ead8', off: '#3a342c' },
  ];
  const NEONS = ['#c4483a', '#e0c15a', '#efe6d4', '#3a6a8a', '#8d3a32'];
  const CAR_COLORS = ['#e23b4a', '#3aa0e8', '#f2c14a', '#f4f4f8', '#7a4ae0', '#3ecf6e', '#ff8a3d'];

  const stage = document.getElementById('stage');
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const hud = document.getElementById('hud');
  const hpFill = document.getElementById('hp-fill');
  const hpText = document.getElementById('hp-text');
  const timerEl = document.getElementById('timer');
  const levelEl = document.getElementById('level');
  const xpFill = document.getElementById('xp-fill');
  const killsEl = document.getElementById('kills');
  const weaponIcons = document.getElementById('weapon-icons');
  const bossbar = document.getElementById('bossbar');
  const bossFill = document.getElementById('boss-fill');
  const hint = document.getElementById('hint');
  const muteBtn = document.getElementById('mute');
  const goreBtn = document.getElementById('gore');
  const banner = document.getElementById('banner');
  const overlay = document.getElementById('overlay');
  const titleScreen = document.getElementById('title-screen');
  const levelScreen = document.getElementById('level-screen');
  const deadScreen = document.getElementById('dead-screen');
  const lvNum = document.getElementById('lv-num');
  const cardsEl = document.getElementById('cards');
  const deadStats = document.getElementById('dead-stats');
  const startBtn = document.getElementById('start-btn');
  const retryBtn = document.getElementById('retry-btn');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const view = { w: 320, h: 180 };
  const cam = { x: 0, y: 0 };
  let drawScale = 1;
  const held = { up: false, down: false, left: false, right: false };
  let stickX = 0;
  let stickY = 0;
  const stickEl = document.getElementById('stick');
  const stickKnob = document.getElementById('stick-knob');

  const chunks = new Map();
  let streamBx = null;
  let streamBy = null;
  let glowOriginX = 0;
  let glowOriginY = 0;
  let signs = [];
  let vignette = null;
  let vignetteKey = '';

  let state = 'title';
  let player = null;
  let weapons = null;
  let enemies = [];
  let shots = [];
  let bullets = [];
  let gems = [];
  let particles = [];
  let waves = [];
  let barks = [];
  let choices = [];
  let elapsed = 0;
  let kills = 0;
  let pending = 0;
  let spawnT = 0.8;
  let nextBoss = 75;
  let shake = 0;
  let moved = false;
  let globalTime = 0;
  let bannerTimer = 0;
  let nextId = 1;
  let aimX = 1;
  let aimY = 0;
  let lastTs = 0;
  let choosing = false;
  let flashes = [];
  let fountains = [];
  let props = [];
  let motes = [];
  let folk = [];
  let traffic = [];
  let pigeons = [];
  let street = [];
  let skids = [];
  let gibs = [];
  let stains = [];
  let goreOn = true;
  let wanted = 0;
  let wantedCool = 0;
  let manholes = [];
  let puddles = [];
  let signals = [];
  let quality = 'high';
  let slowStreak = 0;
  let fastStreak = 0;
  let lightCanvas = null;
  let lightMask = null;
  let dofGrad = null;
  let bloomLive = 0;
  let cityGlow = null;
  let cityGlowQ = null;
  let bloomHalf = null;
  let bloomQuarter = null;
  let blurOK = null;
  let dofCanvas = null;
  let fxFrame = 0;
  const spr = {};

  const BARKS = {
    zombie: ['BRAAAINS', 'GAAAH', 'ONE MORE'],
    cop: ['FREEZE!', 'HALT!', 'MY DONUT!'],
    dealer: ['PSST!', 'CANDY ONLY', 'NO SALE'],
    alfa: ['MOOOAR', 'MOHAWK'],
    boss: ['KINGPIN!'],
  };

  const sfx = {
    ctx: null,
    muted: false,
    gemAt: 0,
    hitAt: 0,
    unlock() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!this.ctx) this.ctx = new AC();
        if (this.ctx.state === 'suspended') {
          const p = this.ctx.resume();
          if (p && typeof p.catch === 'function') p.catch(function () {});
        }
      } catch (err) { /* sound is optional */ }
    },
    tone(freq, dur, type, vol, slideTo) {
      if (this.muted || !this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(Math.max(40, freq), t);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
        g.gain.setValueAtTime(Math.max(0.0001, vol), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(t);
        o.stop(t + dur + 0.02);
      } catch (err) { /* ignore */ }
    },
    noise(dur, vol) {
      if (this.muted || !this.ctx) return;
      try {
        const rate = this.ctx.sampleRate;
        const n = Math.max(1, (dur * rate) | 0);
        const buf = this.ctx.createBuffer(1, n, rate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 900;
        const g = this.ctx.createGain();
        g.gain.value = vol;
        src.connect(filter);
        filter.connect(g);
        g.connect(this.ctx.destination);
        src.start();
      } catch (err) { /* ignore */ }
    },
    shoot(freq) { this.tone(freq || 760, 0.045, 'square', 0.035); },
    hurt() { this.tone(150, 0.16, 'sawtooth', 0.05, 70); },
    hit() { this.noise(0.045, 0.05); },
    gem() { this.tone(1040, 0.04, 'sine', 0.03); },
    pick() { this.tone(680, 0.07, 'square', 0.045); },
    dead() { this.tone(240, 0.45, 'sawtooth', 0.06, 48); },
    boss() { this.tone(92, 0.32, 'square', 0.06, 42); },
    bass() { this.tone(68, 0.2, 'sine', 0.07, 36); },
    bottle() { this.tone(340, 0.07, 'square', 0.04, 160); },
    level() {
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => sfx.tone(f, 0.12, 'square', 0.045), i * 75);
      });
    },
  };

  try {
    if (localStorage.getItem('gta-meth-mute') === '1') sfx.muted = true;
  } catch (err) { /* private mode */ }
  syncMute();

  function syncMute() {
    muteBtn.textContent = sfx.muted ? 'Sound off' : 'Sound on';
    muteBtn.setAttribute('aria-pressed', sfx.muted ? 'true' : 'false');
  }

  try {
    goreOn = localStorage.getItem('gta-meth-gore') !== '0';
  } catch (err) { /* private mode */ }

  function syncGore() {
    if (!goreBtn) return;
    goreBtn.textContent = goreOn ? 'Gore on' : 'Gore off';
    goreBtn.setAttribute('aria-pressed', goreOn ? 'false' : 'true');
  }
  syncGore();

  function hash(x, y) {
    let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return (n ^ (n >>> 16)) >>> 0;
  }

  function fmtTime(s) {
    s = Math.max(0, Math.floor(s));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
  }

  function xpFor(level) {
    const n = level - 1;
    return Math.round(5 + n * 3.2 + n * n * 0.42);
  }

  function might() { return 1 + player.mightLv * 0.1; }
  function speedStat() { return 110 * (1 + player.speedLv * 0.1); }
  function magnetR() { return 250 + player.magnetLv * 50; }
  function armorStat() { return player.armorLv * 4; }
  function regenStat() { return player.regenLv * 0.45; }
  function xpMul() { return 1 + player.xpLv * 0.12; }

  function crystalCd() { return 0.74 * Math.pow(0.86, weapons.crystal.rateLv - 1); }
  function crystalDmg() { return (8 + (weapons.crystal.dmgLv - 1) * 3) * might(); }
  function bassCd() { return 2.35 * Math.pow(0.86, weapons.bass.rateLv - 1); }
  function bassRadius() { return 74 + (weapons.bass.radLv - 1) * 16; }
  function bassDmg() { return (14 + (weapons.bass.dmgLv - 1) * 4) * might(); }
  function cartDmg() { return (7 + (weapons.carts.dmgLv - 1) * 2) * might(); }
  function bottleRadius() { return 24 + (weapons.bottle.radLv - 1) * 8; }
  function bottleDmg() { return (8 + (weapons.bottle.dmgLv - 1) * 3) * might(); }

  function pixCanvas(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    const p = (x, y, color, ww, hh) => {
      g.fillStyle = color;
      g.fillRect(x, y, ww || 1, hh || 1);
    };
    draw(p);
    return c;
  }

  function outlineImage(src) {
    const w = src.width;
    const h = src.height;
    const data = src.getContext('2d').getImageData(0, 0, w, h).data;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    const img = g.createImageData(w, h);
    const out = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (data[i + 3] === 0) continue;
        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const nx = x + ox;
            const ny = y + oy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            const j = (ny * w + nx) * 4;
            out[j] = 20;
            out[j + 1] = 12;
            out[j + 2] = 20;
            out[j + 3] = 255;
          }
        }
      }
    }
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue;
      out[i] = data[i];
      out[i + 1] = data[i + 1];
      out[i + 2] = data[i + 2];
      out[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function outlined(w, h, draw) {
    return outlineImage(pixCanvas(w, h, draw));
  }

  // Nearest-neighbor fit, then a fresh 1 px outline so the silhouette stays readable.
  function fitOutlined(src, w, h) {
    const bw = Math.max(1, w - 2);
    const bh = Math.max(1, h - 2);
    const body = document.createElement('canvas');
    body.width = bw;
    body.height = bh;
    const bg = body.getContext('2d');
    bg.imageSmoothingEnabled = false;
    bg.drawImage(src, 0, 0, bw, bh);
    const framed = document.createElement('canvas');
    framed.width = w;
    framed.height = h;
    const fg = framed.getContext('2d');
    fg.imageSmoothingEnabled = false;
    fg.drawImage(body, 1, 1);
    return outlineImage(framed);
  }

  function tinted(src, color) {
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function paintWalker(p, frame, look) {
    const s = [0, 1, 0, -1][frame & 3];
    const bob = frame & 1;
    const q = (x, y, color, w, h) => p(x * 2, (y + 1 + bob) * 2, color, (w || 1) * 2, (h || 1) * 2);
    const legL = 7 + s;
    const legR = 13 - s;
    const armL = 3 - s;
    const armR = 19 + s;

    if (look.mohawk) {
      q(11, 0, look.mohawk, 2, 3);
      q(10, 1, look.mohawk, 1, 2);
      q(13, 1, look.mohawk, 1, 2);
    }
    if (look.hat) {
      q(8, 0, look.hatHi, 8, 2);
      q(7, 2, look.hat, 10, 2);
      q(5, 3, look.hat, 14, 2);
      q(6, 3, look.badge || COL.badge, 2, 1);
    } else {
      q(8, 1, look.hair2 || look.hair, 8, 2);
      q(7, 3, look.hair, 10, 3);
      q(9, 2, look.hairHi || '#4a3024', 3, 1);
    }

    q(8, 5, look.skin, 8, 6);
    q(7, 6, look.skin2, 1, 4);
    q(16, 6, look.skin2, 1, 4);
    q(9, 5, look.skinHi, 3, 1);

    if (look.shades) {
      q(8, 7, '#140c18', 8, 2);
      q(8, 7, COL.glass, 3, 1);
      q(13, 7, '#ff9ad8', 3, 1);
    } else {
      q(9, 7, look.eye, 2, 2);
      q(13, 7, look.eye2 || look.eye, 2, 2);
      q(9, 7, '#fff', 1, 1);
      q(13, 7, '#fff', 1, 1);
    }
    q(10, 10, look.mouth || look.skin2, 4, 1);

    q(6, 11, look.jacket, 12, 6);
    q(5, 12, look.jacket2, 1, 4);
    q(18, 12, look.jacketHi, 1, 4);
    q(9, 12, look.shirt, 6, 3);
    if (look.torn) {
      q(8, 13, look.skin, 2, 2);
      q(14, 14, look.jacket2, 2, 2);
    }
    if (look.badge) q(13, 12, look.badge, 2, 2);
    if (look.chain) {
      q(9, 15, COL.gold, 6, 1);
      q(11, 16, COL.gold, 2, 2);
    } else {
      q(11, 15, look.jacket2, 2, 2);
    }

    q(armL, 12, look.jacket, 2, 4);
    q(armR, 12, look.jacket2, 2, 4);
    q(armL, 16, look.skin, 2, 2);
    q(armR, 16, look.skin2, 2, 2);
    if (look.stick) q(armR + 1, 13, '#c8c2cf', 1, 5);

    q(legL, 17, look.pants, 4, 4);
    q(legR, 17, look.pants2, 4, 4);
    q(legL, 17, look.pantsHi || look.pants, 1, 3);
    q(legL, 21, look.shoe, 4, 2);
    q(legR, 21, '#0c0a10', 4, 2);
    q(legL + 1, 21, '#5a5468', 1, 1);
    q(legR + 1, 21, '#5a5468', 1, 1);
    const top = (1 + bob) * 2;
    p(18, top + 6, look.hairHi || look.skinHi, 3, 1);
    p(20, top + 12, look.skinHi, 2, 1);
    p(28, top + 12, look.skin2, 1, 3);
    if (!look.shades) p(21, top + 16, '#fff', 1, 1);
    p(22, top + 30, look.jacketHi, 5, 2);
    p(24, top + 34, look.jacket2, 2, 2);
    p(14, top + 36, look.jacket2, 8, 1);
  }

  function paintBoss(draw, frame) {
    const p = (x, y, color, w, h) => draw(x * 2, y * 2, color, (w || 1) * 2, (h || 1) * 2);
    const y = frame & 1;
    const s = frame ? 1 : -1;
    p(8, 1 + y, COL.gold, 3, 3);
    p(14, 1 + y, COL.gold, 4, 3);
    p(21, 1 + y, COL.gold, 3, 3);
    p(7, 4 + y, '#fff1a8', 18, 2);
    p(9, 2 + y, frame ? '#fff' : '#fff6c8', 1, 1);
    p(16, 2 + y, frame ? '#fff6c8' : '#fff', 1, 1);
    p(22, 2 + y, '#fff6c8', 1, 1);
    p(6, 6 + y, COL.hair, 20, 3);
    p(8, 8 + y, '#3a2418', 16, 2);
    p(8, 9 + y, COL.skin, 16, 7);
    p(7, 11 + y, COL.skin2, 1, 4);
    p(24, 11 + y, COL.skin2, 1, 4);
    p(9, 9 + y, COL.skinHi, 5, 1);
    p(9, 11 + y, '#140c18', 14, 3);
    p(10, 12 + y, COL.glass, 4, 1);
    p(18, 12 + y, '#ff9ad8', 4, 1);
    p(11, 15 + y, COL.white, 10, 1);
    p(12, 15 + y, COL.skin2, 1, 1);
    p(16, 15 + y, COL.skin2, 1, 1);
    p(19, 15 + y, COL.skin2, 1, 1);
    p(4, 17 + y, COL.dealer, 24, 10);
    p(2, 18 + y, COL.dealer2, 3, 8);
    p(27, 18 + y, '#d2b0ff', 3, 8);
    p(5, 18 + y, '#3a2060', 2, 8);
    p(12, 18 + y, COL.shirt, 8, 3);
    p(10, 21 + y, COL.gold, 12, 2);
    p(15, 23 + y, COL.gold, 2, 2);
    p(16, 23 + y, '#fff6c8', 1, 1);
    p(2, 19 + y, COL.dealer, 3, 5);
    p(27, 19 + y, COL.dealer2, 3, 5);
    p(2, 24 + y, COL.skin, 3, 2);
    p(27, 24 + y, COL.gold, 3, 2);
    p(8 + s, 27 + y, COL.dealer2, 6, 4);
    p(18 - s, 27 + y, '#2a1848', 6, 4);
    p(8 + s, 31 + y, COL.shoe, 6, 2);
    p(18 - s, 31 + y, '#0c0a10', 6, 2);
    p(9 + s, 31 + y, '#5a5468', 2, 1);
    const top = y * 2;
    draw(20, top + 6, '#fff6c8', 2, 1);
    draw(30, top + 20, '#d2b0ff', 3, 8);
    draw(26, top + 40, COL.gold, 6, 1);
    draw(18, top + 28, '#fff', 2, 2);
  }

  function paintGem(p, a, b, c, glint) {
    p(6, 2, c);
    p(5, 3, a, 3, 1);
    p(4, 4, b, 5, 1);
    p(3, 5, a, 7, 2);
    p(4, 7, b, 5, 1);
    p(5, 8, a, 3, 1);
    p(6, 9, c);
    if (glint) {
      p(4, 5, '#fff', 2, 1);
      p(8, 6, '#fff');
    } else {
      p(7, 4, '#fff');
    }
  }

  function buildSprites() {
    const frames = [0, 1, 2, 3];
    const walker = (look) => frames.map((f) => outlined(48, 52, (p) => paintWalker(p, f, look)));
    spr.player = walker({
      hair: '#6b3e24', hair2: '#3a2214', hairHi: '#e2a878',
      skin: COL.skin, skin2: COL.skin2, skinHi: COL.skinHi,
      eye: COL.eye,
      jacket: COL.jacket, jacket2: COL.jacket2, jacketHi: COL.jacketHi,
      shirt: COL.shirt,
      pants: COL.pants, pants2: '#24306e', pantsHi: COL.pantsHi,
      shoe: COL.shoe,
    });
    spr.zombie = walker({
      hair: COL.zh, hair2: '#2a3818', hairHi: '#6a7848',
      skin: COL.zombie, skin2: COL.zombie2, skinHi: '#c6f59a',
      eye: COL.eyeR, eye2: '#7a1830', mouth: '#3a1820',
      jacket: '#6a7080', jacket2: '#4a5060', jacketHi: '#9aa0ae',
      shirt: '#c4566a', torn: true,
      pants: '#3a4a28', pants2: '#2a3818', pantsHi: '#6ea63a',
      shoe: '#241c18',
    });
    spr.alfa = walker({
      mohawk: COL.mohawk,
      hair: COL.zh, hair2: '#2a3818',
      skin: '#b6e070', skin2: COL.zombie2, skinHi: '#e4ffb0',
      eye: COL.eyeR, eye2: COL.eyeR, mouth: '#3a1820',
      jacket: '#2a2a32', jacket2: '#141418', jacketHi: '#5a5a68',
      shirt: COL.mohawk, torn: true,
      pants: '#241820', pants2: '#3a2030', pantsHi: '#ff4d8d',
      shoe: COL.shoe, chain: true,
    });
    spr.cop = walker({
      hat: '#24386e', hatHi: '#6a8ae0', badge: COL.badge,
      skin: COL.skin, skin2: COL.skin2, skinHi: COL.skinHi,
      eye: COL.eye,
      jacket: COL.cop, jacket2: COL.cop2, jacketHi: '#7aa0ff',
      shirt: '#d8e4ff',
      pants: '#1a2758', pants2: COL.cop2, pantsHi: '#3a56b0',
      shoe: COL.shoe, stick: true,
    });
    spr.dealer = walker({
      hair: '#1a1020', hair2: '#0c0810', hairHi: '#4a3060',
      skin: COL.skin, skin2: COL.skin2, skinHi: COL.skinHi,
      eye: COL.eye, shades: true,
      jacket: COL.dealer, jacket2: COL.dealer2, jacketHi: '#c9a0ff',
      shirt: '#2a1840', chain: true,
      pants: '#241430', pants2: '#3a2060', pantsHi: '#7a48c0',
      shoe: COL.shoe,
    });
    const person = (frames) => frames.map((s) => fitOutlined(s, 16, 27));
    spr.player = person(spr.player);
    spr.zombie = person(spr.zombie);
    spr.alfa = person(spr.alfa);
    spr.cop = person(spr.cop);
    spr.dealer = person(spr.dealer);
    spr.boss = [0, 1].map((f) => fitOutlined(outlined(68, 74, (p) => paintBoss(p, f)), 26, 38));
    spr.bossHot = spr.boss.map((s) => tinted(s, '#ff4d6d'));
    spr.white = {
      player: spr.player.map((s) => tinted(s, '#ffffff')),
      zombie: spr.zombie.map((s) => tinted(s, '#ffffff')),
      alfa: spr.alfa.map((s) => tinted(s, '#ffffff')),
      cop: spr.cop.map((s) => tinted(s, '#ffffff')),
      dealer: spr.dealer.map((s) => tinted(s, '#ffffff')),
      boss: spr.boss.map((s) => tinted(s, '#ffffff')),
    };
    spr.crystal = outlined(13, 13, (p) => {
      p(6, 1, '#fff');
      p(5, 2, COL.cyan, 3, 1);
      p(4, 3, '#b8fff8', 5, 1);
      p(3, 4, COL.cyan, 7, 2);
      p(4, 6, '#fff', 5, 1);
      p(5, 7, COL.cyan, 3, 2);
      p(6, 9, '#e8ffff');
      p(5, 4, '#fff', 2, 1);
    });
    spr.gem = [0, 1].map((g) => outlined(13, 13, (p) => paintGem(p, '#d7b4ff', '#8a4ad4', '#efe6ff', g === 1)));
    spr.gemMid = [0, 1].map((g) => outlined(13, 13, (p) => paintGem(p, '#ffe14a', '#e09a18', '#fff6c8', g === 1)));
    spr.gemBig = [0, 1].map((g) => outlined(15, 15, (p) => {
      p(7, 2, '#fff');
      p(6, 3, '#b8fff8', 3, 1);
      p(5, 4, COL.cyan, 5, 1);
      p(4, 5, '#7ef0f4', 7, 2);
      p(3, 7, COL.cyan, 9, 2);
      p(4, 9, '#b8fff8', 7, 1);
      p(5, 10, COL.cyan, 5, 1);
      p(6, 11, '#fff', 3, 1);
      if (g) p(5, 6, '#fff', 2, 2);
      else p(8, 5, '#fff');
    }));
    spr.cart = outlined(18, 16, (p) => {
      p(3, 2, COL.metal, 11, 2);
      p(2, 3, '#8a8498', 1, 2);
      p(4, 4, COL.metal, 1, 6);
      p(13, 4, COL.metal, 1, 6);
      p(5, 4, '#6a6474', 1, 5);
      p(8, 4, '#6a6474', 1, 5);
      p(11, 4, '#6a6474', 1, 5);
      p(6, 5, '#d8d4e0', 2, 1);
      p(4, 10, COL.metal, 10, 1);
      p(3, 11, '#9a94a4', 12, 1);
      p(3, 13, COL.shoe, 3, 2);
      p(12, 13, COL.shoe, 3, 2);
      p(4, 13, '#5a5468', 1, 1);
      p(13, 13, '#5a5468', 1, 1);
    });
    spr.speaker = outlined(16, 16, (p) => {
      p(2, 2, '#2a2038', 12, 11);
      p(3, 3, '#4a3a60', 10, 9);
      p(4, 4, COL.cyan, 3, 3);
      p(9, 4, '#ff4d8d', 3, 3);
      p(5, 5, '#102028', 1, 1);
      p(10, 5, '#280818', 1, 1);
      p(4, 8, '#1a1224', 8, 3);
      p(5, 9, COL.gold, 2, 1);
      p(9, 9, COL.gold, 2, 1);
      p(3, 12, '#ffe14a', 10, 1);
    });
    spr.bottle = outlined(11, 16, (p) => {
      p(4, 1, '#e8e4dc', 3, 2);
      p(5, 1, '#fff', 1, 1);
      p(3, 3, COL.bottle, 5, 10);
      p(4, 4, '#d8ffe8', 1, 4);
      p(4, 8, COL.white, 3, 2);
      p(4, 9, '#ff4d8d', 3, 1);
      p(3, 12, '#1e8a48', 5, 1);
    });
    spr.bag = outlined(12, 12, (p) => {
      p(3, 2, '#9a3ad0', 6, 2);
      p(2, 4, '#c46bff', 8, 6);
      p(4, 5, COL.white, 4, 2);
      p(4, 6, COL.gold, 1, 1);
      p(6, 6, '#ff4d8d', 1, 1);
      p(3, 8, '#7a28a8', 6, 1);
    });
    spr.crystal = fitOutlined(spr.crystal, 8, 8);
    spr.gem = spr.gem.map((s) => fitOutlined(s, 8, 8));
    spr.gemMid = spr.gemMid.map((s) => fitOutlined(s, 8, 8));
    spr.gemBig = spr.gemBig.map((s) => fitOutlined(s, 10, 10));
    spr.cart = fitOutlined(spr.cart, 16, 14);
    spr.speaker = fitOutlined(spr.speaker, 14, 14);
    spr.bottle = fitOutlined(spr.bottle, 6, 12);
    spr.bag = fitOutlined(spr.bag, 8, 8);
    if (window.GTADetail) {
      const art = window.GTADetail.build();
      spr.cast = art.cast;
      spr.flash = art.flash;
      spr.bossHotCast = art.bossHot;
      spr.crystal = art.crystal;
      spr.gem = art.gem;
      spr.gemMid = art.gemMid;
      spr.gemBig = art.gemBig;
      spr.cart = art.cart;
      spr.speaker = art.speaker;
      spr.bottle = art.bottle;
      spr.bag = art.bag;
      spr.bin = art.bin;
      spr.hydrant = art.hydrant;
      spr.cone = art.cone;
      spr.player = art.cast.player.walk.down;
    }
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function tileOf(v) {
    return Math.floor(v / TILE);
  }

  function chunkKey(bx, by) {
    return bx + ',' + by;
  }

  function chunkOfTile(tx, ty) {
    return chunks.get(chunkKey(Math.floor(tx / PERIOD), Math.floor(ty / PERIOD)));
  }

  function localIndex(tx, ty) {
    return mod(ty, PERIOD) * PERIOD + mod(tx, PERIOD);
  }

  function markSolid(tx, ty) {
    const ch = chunkOfTile(tx, ty);
    if (!ch) return;
    ch.solid[localIndex(tx, ty)] = 1;
  }

  function readSolid(tx, ty) {
    const ch = chunkOfTile(tx, ty);
    if (!ch) {
      const t = computeTile(tx, ty);
      return t === T_BUILD || t === T_TREE || t === T_CAR || t === T_FOUNT;
    }
    return ch.solid[localIndex(tx, ty)] === 1;
  }

  function blockKind(bx, by) {
    if (bx === 0 && by === 0) return 0;
    const h = hash(bx + 3, by + 11) % 5;
    if (h === 0) return 1;
    if (h === 1) return 2;
    return 3;
  }

  function streetCar(tx, ty, mx, my, vert, horiz) {
    if (vert === horiz) return false;
    const h = hash(tx, ty);
    if (horiz && (my === 0 || my === TW - 1) && mx % 8 === 4 && (h & 1) === 0) return true;
    if (vert && (mx === 0 || mx === TW - 1) && my % 8 === 4 && (h & 1) === 0) return true;
    return false;
  }

  function computeTile(tx, ty) {
    const mx = mod(tx, PERIOD);
    const my = mod(ty, PERIOD);
    const bx = Math.floor(tx / PERIOD);
    const by = Math.floor(ty / PERIOD);
    const vert = mx < TW;
    const horiz = my < TW;
    if (vert || horiz) {
      if (streetCar(tx, ty, mx, my, vert, horiz)) return T_CAR;
      return T_ROAD;
    }
    const ix = mx - TW;
    const iy = my - TW;
    const inner = PERIOD - TW;
    if (ix < 2 || iy < 2 || ix >= inner - 2 || iy >= inner - 2) return T_SIDE;
    const kind = blockKind(bx, by);
    if (kind === 0) {
      if (ix >= 4 && ix <= 6 && iy >= 4 && iy <= 6) return T_FOUNT;
      return T_PLAZA;
    }
    if (kind === 1) {
      if (ix % 3 === 2 && iy % 3 === 2) return T_TREE;
      return T_GRASS;
    }
    if (kind === 2) {
      if (((ix + iy) & 1) === 0 && hash(tx, ty) % 7 === 0) return T_CAR;
      return T_LOT;
    }
    return T_BUILD;
  }

  function drawCar(g, px, py, horizontal, color) {
    if (horizontal) {
      g.fillStyle = '#0c0a10';
      g.fillRect(px + 1, py + 3, 14, 11);
      g.fillStyle = color;
      g.fillRect(px + 2, py + 4, 12, 8);
      g.fillStyle = '#ffffff';
      g.globalAlpha = 0.28;
      g.fillRect(px + 2, py + 4, 12, 2);
      g.globalAlpha = 1;
      g.fillStyle = '#9fd4ea';
      g.fillRect(px + 4, py + 5, 4, 3);
      g.fillStyle = '#d8f4ff';
      g.fillRect(px + 4, py + 5, 1, 1);
      g.fillStyle = '#1a120c';
      g.fillRect(px + 9, py + 6, 4, 2);
      g.fillStyle = '#ffe14a';
      g.fillRect(px + 12, py + 5, 2, 1);
      g.fillStyle = '#ff3b4e';
      g.fillRect(px + 2, py + 10, 2, 1);
      g.fillStyle = '#141018';
      g.fillRect(px + 2, py + 3, 2, 2);
      g.fillRect(px + 12, py + 3, 2, 2);
      g.fillRect(px + 2, py + 11, 3, 3);
      g.fillRect(px + 11, py + 11, 3, 3);
      g.fillStyle = '#8a8494';
      g.fillRect(px + 3, py + 12, 1, 1);
      g.fillRect(px + 12, py + 12, 1, 1);
    } else {
      g.fillStyle = '#0c0a10';
      g.fillRect(px + 3, py + 1, 11, 14);
      g.fillStyle = color;
      g.fillRect(px + 4, py + 2, 8, 12);
      g.fillStyle = '#ffffff';
      g.globalAlpha = 0.28;
      g.fillRect(px + 4, py + 2, 2, 12);
      g.globalAlpha = 1;
      g.fillStyle = '#9fd4ea';
      g.fillRect(px + 5, py + 4, 3, 4);
      g.fillStyle = '#d8f4ff';
      g.fillRect(px + 5, py + 4, 1, 1);
      g.fillStyle = '#1a120c';
      g.fillRect(px + 6, py + 9, 2, 3);
      g.fillStyle = '#ffe14a';
      g.fillRect(px + 5, py + 12, 1, 2);
      g.fillStyle = '#ff3b4e';
      g.fillRect(px + 10, py + 2, 1, 2);
      g.fillStyle = '#141018';
      g.fillRect(px + 3, py + 2, 2, 2);
      g.fillRect(px + 11, py + 2, 2, 2);
      g.fillRect(px + 3, py + 11, 3, 3);
      g.fillRect(px + 11, py + 11, 3, 3);
      g.fillStyle = '#8a8494';
      g.fillRect(px + 4, py + 12, 1, 1);
      g.fillRect(px + 12, py + 12, 1, 1);
    }
  }

  function paintAsphaltTile(g, tx, ty, x, y) {
    const S = TILE * ART;
    const n = hash(tx, ty);
    const base = n % 17 === 0 ? '#2c3138' : n % 11 === 0 ? '#3c4450' : '#343a42';
    g.fillStyle = base;
    g.fillRect(x, y, S, S);
    g.fillStyle = '#4a5260';
    g.fillRect(x + (n % 18), y + 2, 3, 1);
    g.fillRect(x + ((n >> 4) % 20), y + 8, 2, 1);
    g.fillStyle = '#2a2824';
    g.fillRect(x + ((n >> 3) % 16), y + S - 5, 4, 1);
    g.fillRect(x + ((n >> 6) % 22), y + 14, 1, 3);
    if (n % 8 === 1) {
      g.fillStyle = '#141210';
      g.fillRect(x + 6, y + 18, 7, 1);
    }
  }

  function paintSidewalk(g, tx, ty, x, y) {
    const S = TILE * ART;
    const slab = (((tx >> 1) + (ty >> 1)) & 1) === 0;
    g.fillStyle = slab ? '#c9ccc4' : '#b7bbb2';
    g.fillRect(x, y, S, S);
    g.fillStyle = '#e4e6e0';
    g.fillRect(x + 2, y + 2, S - 6, 3);
    g.fillRect(x + 2, y + 2, 3, S - 6);
    g.fillStyle = '#8e867a';
    g.fillRect(x + S - 4, y + 2, 2, S - 4);
    g.fillRect(x + 2, y + S - 4, S - 4, 2);
    g.fillStyle = '#141210';
    if ((tx & 1) === 0) g.fillRect(x, y, 1, S);
    if ((ty & 1) === 0) g.fillRect(x, y, S, 1);
    const n = hash(tx, ty);
    if (n % 5 === 0) {
      g.fillStyle = '#b7aa9a';
      g.fillRect(x + 8, y + 10, 6, 2);
    }
    const roadish = (nx, ny) => {
      const t = computeTile(nx, ny);
      return t === T_ROAD || t === T_CAR;
    };
    const roadN = roadish(tx, ty - 1);
    const roadS = roadish(tx, ty + 1);
    const roadW = roadish(tx - 1, ty);
    const roadE = roadish(tx + 1, ty);
    g.fillStyle = '#000';
    if (roadN) g.fillRect(x, y, S, 2);
    if (roadS) g.fillRect(x, y + S - 2, S, 2);
    if (roadW) g.fillRect(x, y, 2, S);
    if (roadE) g.fillRect(x + S - 2, y, 2, S);
    g.fillStyle = '#6a645c';
    if (roadN) g.fillRect(x, y + 2, S, 3);
    if (roadS) g.fillRect(x, y + S - 5, S, 3);
    if (roadW) g.fillRect(x + 2, y, 3, S);
    if (roadE) g.fillRect(x + S - 5, y, 3, S);
    g.fillStyle = '#f4f1ea';
    if (roadN) g.fillRect(x, y + 4, S, 1);
    if (roadS) g.fillRect(x, y + S - 6, S, 1);
    if (roadW) g.fillRect(x + 4, y, 1, S);
    if (roadE) g.fillRect(x + S - 6, y, 1, S);
  }

  function onCrosswalk(mx, my) {
    const arm = (n) => n === TW || n === TW + 1 || n === PERIOD - 2 || n === PERIOD - 1;
    const vert = mx < TW;
    const horiz = my < TW;
    if (horiz && !vert && arm(mx)) return true;
    if (vert && !horiz && arm(my)) return true;
    return false;
  }

  const ROAD_FONT = {
    A: '01110 10001 11111 10001 10001',
    B: '11110 10001 11110 10001 11110',
    C: '01111 10000 10000 10000 01111',
    D: '11110 10001 10001 10001 11110',
    E: '11111 10000 11110 10000 11111',
    G: '01111 10000 10111 10001 01110',
    I: '11111 00100 00100 00100 11111',
    K: '10001 10010 11100 10010 10001',
    L: '10000 10000 10000 10000 11111',
    N: '10001 11001 10101 10011 10001',
    O: '01110 10001 10001 10001 01110',
    P: '11110 10001 11110 10000 10000',
    R: '11110 10001 11110 10010 10001',
    S: '01111 10000 01110 00001 11110',
    T: '11111 00100 00100 00100 00100',
    U: '10001 10001 10001 10001 01110',
    W: '10001 10001 10101 11011 10001',
    Y: '10001 01010 00100 00100 00100',
  };

  function paintPixelWord(g, word, x, y, color, rot) {
    g.save();
    g.translate(x, y);
    if (rot) g.rotate(rot);
    g.fillStyle = '#141210';
    let pen = 0;
    const gw = 2;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (ch === ' ') { pen += 8; continue; }
      const rows = (ROAD_FONT[ch] || '00000 00000 00000 00000 00000').split(' ');
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
          if (rows[r][c] === '1') g.fillRect(pen + c * gw + 1, r * gw + 1, gw, gw);
        }
      }
      pen += 6 * gw;
    }
    g.fillStyle = color;
    pen = 0;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (ch === ' ') { pen += 8; continue; }
      const rows = (ROAD_FONT[ch] || '00000 00000 00000 00000 00000').split(' ');
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].length; c++) {
          if (rows[r][c] === '1') g.fillRect(pen + c * gw, r * gw, gw, gw);
        }
      }
      pen += 6 * gw;
    }
    g.restore();
  }

  function paintRoadWords(g, bx, by) {
    const words = ['BUS STOP', 'SLOW', 'STOP', 'KEEP CLEAR', 'NO PARKING', 'YIELD'];
    const word = words[hash(bx + 2, by + 5) % words.length];
    const hx = (10 * TILE + 4) * ART;
    const hy = (2 * TILE + 2) * ART;
    paintPixelWord(g, word, hx, hy, word === 'BUS STOP' ? '#e6c84a' : '#f4f1ea', 0);
    const vertWord = words[hash(bx + 8, by + 1) % words.length];
    const vx = (2 * TILE + 2) * ART;
    const vy = (12 * TILE + 4) * ART;
    paintPixelWord(g, vertWord, vx, vy, vertWord === 'BUS STOP' ? '#e6c84a' : '#f4f1ea', -Math.PI / 2);
  }

  function paintLaneArrow(g, x, y, dir) {
    g.save();
    g.translate(x + 16, y + 16);
    g.rotate(dir * Math.PI / 2);
    g.fillStyle = '#141210';
    g.fillRect(-11, -1, 16, 6);
    g.fillRect(3, -5, 6, 14);
    g.fillRect(7, -3, 6, 10);
    g.fillRect(11, -1, 4, 6);
    g.fillStyle = '#f4f1ea';
    g.fillRect(-12, -2, 16, 6);
    g.fillRect(2, -6, 6, 14);
    g.fillRect(6, -4, 6, 10);
    g.fillRect(10, -2, 4, 6);
    g.restore();
  }

  function paintGrassTile(g, tx, ty, x, y, tree) {
    const S = TILE * ART;
    const n = hash(tx, ty);
    g.fillStyle = ((tx + ty) & 1) === 0 ? '#3d5a30' : '#345028';
    g.fillRect(x, y, S, S);
    g.fillStyle = '#4e6b3c';
    g.fillRect(x + (n % 20), y + 3, 4, 2);
    g.fillRect(x + 6, y + ((n >> 3) % 18), 2, 3);
    g.fillStyle = '#2a401c';
    g.fillRect(x + ((n >> 2) % 22), y + S - 6, 5, 2);
    if (!tree && n % 7 === 0) {
      g.fillStyle = n % 2 ? '#efe6c8' : '#d8d09a';
      g.fillRect(x + 8 + (n % 10), y + 8 + ((n >> 4) % 8), 2, 2);
      g.fillStyle = '#7b7f3d';
      g.fillRect(x + 8 + (n % 10), y + 10 + ((n >> 4) % 8), 2, 1);
    }
  }

  function paintChunk(ch) {
    const S = TILE * ART;
    const canvas = document.createElement('canvas');
    canvas.width = CHUNK_PX;
    canvas.height = CHUNK_PX;
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    const ox = ch.bx * PERIOD;
    const oy = ch.by * PERIOD;
    const key = chunkKey(ch.bx, ch.by);
    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        const tx = ox + lx;
        const ty = oy + ly;
        const type = ch.tiles[ly * PERIOD + lx];
        const x = lx * S;
        const y = ly * S;
        const mx = lx;
        const my = ly;
        const vert = mx < TW;
        const horiz = my < TW;
        if (type === T_CAR && !vert && !horiz) {
          g.fillStyle = '#464440';
          g.fillRect(x, y, S, S);
          g.fillStyle = '#5a564e';
          g.fillRect(x + 2, y + 2, 6, 2);
          if (mod(tx, 3) === 0) {
            g.fillStyle = '#f4f1ea';
            g.fillRect(x, y, 2, S);
          }
        } else if (type === T_ROAD || type === T_CAR) {
          paintAsphaltTile(g, tx, ty, x, y);
        } else if (type === T_SIDE) {
          paintSidewalk(g, tx, ty, x, y);
        } else if (type === T_BUILD) {
          g.fillStyle = '#2e2c28';
          g.fillRect(x, y, S, S);
          g.fillStyle = '#3a3834';
          g.fillRect(x, y, S, 2);
        } else if (type === T_GRASS || type === T_TREE) {
          paintGrassTile(g, tx, ty, x, y, type === T_TREE);
        } else if (type === T_LOT) {
          g.fillStyle = '#464440';
          g.fillRect(x, y, S, S);
          g.fillStyle = '#524e48';
          g.fillRect(x + 4, y + 6, 5, 2);
          if (mod(tx, 3) === 0) {
            g.fillStyle = '#f4f1ea';
            g.fillRect(x, y, 2, S);
          }
        } else if (type === T_PLAZA) {
          const checker = (Math.floor(tx / 2) + Math.floor(ty / 2)) & 1;
          g.fillStyle = checker ? '#d2c8b6' : '#b7aa9a';
          g.fillRect(x, y, S, S);
          g.fillStyle = '#efe8dc';
          g.fillRect(x + 2, y + 2, 4, 2);
          g.fillStyle = '#141210';
          g.fillRect(x, y, S, 1);
          g.fillRect(x, y, 1, S);
        } else if (type === T_FOUNT) {
          g.fillStyle = '#b7aea0';
          g.fillRect(x, y, S, S);
          g.fillStyle = '#8a9aa4';
          g.fillRect(x + 4, y + 4, S - 8, S - 8);
          g.fillStyle = '#d5eef2';
          g.fillRect(x + 8, y + 8, 6, 3);
          g.fillStyle = '#141210';
          g.fillRect(x + 4, y + 4, S - 8, 1);
        }
      }
    }

    g.fillStyle = '#f4f1ea';
    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        const type = ch.tiles[ly * PERIOD + lx];
        if (type !== T_ROAD && type !== T_CAR) continue;
        const mx = lx;
        const my = ly;
        const vert = mx < TW;
        const horiz = my < TW;
        if (vert && horiz) continue;
        const x = lx * S;
        const y = ly * S;
        const cross = onCrosswalk(mx, my);
        if (cross) {
          if (horiz && !vert) {
            g.fillRect(x, y + 2, S, 8);
            g.fillRect(x, y + 18, S, 8);
          } else if (vert && !horiz) {
            g.fillRect(x + 2, y, 8, S);
            g.fillRect(x + 18, y, 8, S);
          }
          continue;
        }
        if (horiz && !vert && my === 0) g.fillRect(x, y + 2, S, 3);
        if (horiz && !vert && my === TW - 1) g.fillRect(x, y + S - 5, S, 3);
        if (vert && !horiz && mx === 0) g.fillRect(x + 2, y, 3, S);
        if (vert && !horiz && mx === TW - 1) g.fillRect(x + S - 5, y, 3, S);
        if (horiz && !vert && (mx === TW + 2 || mx === PERIOD - 3)) g.fillRect(x, y + 4, 3, S - 8);
        if (vert && !horiz && (my === TW + 2 || my === PERIOD - 3)) g.fillRect(x + 4, y, S - 8, 3);
      }
    }
    g.fillStyle = '#e6c84a';
    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        const tx = ox + lx;
        const ty = oy + ly;
        const type = ch.tiles[ly * PERIOD + lx];
        if (type !== T_ROAD) continue;
        const mx = lx;
        const my = ly;
        const vert = mx < TW;
        const horiz = my < TW;
        if (vert === horiz || onCrosswalk(mx, my)) continue;
        const x = lx * S;
        const y = ly * S;
        if (horiz && my === 2 && mod(tx, 3) !== 0) g.fillRect(x + 4, y + S - 5, 20, 4);
        if (vert && mx === 2 && mod(ty, 3) !== 0) g.fillRect(x + S - 5, y + 4, 4, 20);
      }
    }
    paintRoadWords(g, ch.bx, ch.by);
    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        const mx = lx;
        const my = ly;
        const vert = mx < TW;
        const horiz = my < TW;
        if (vert === horiz || onCrosswalk(mx, my)) continue;
        if (ch.tiles[ly * PERIOD + lx] !== T_ROAD) continue;
        if (horiz && my === 4 && mx % 8 === 5) paintLaneArrow(g, lx * S, ly * S, 0);
        if (vert && mx === 4 && my % 8 === 5) paintLaneArrow(g, lx * S, ly * S, 1);
      }
    }

    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        const tx = ox + lx;
        const ty = oy + ly;
        const type = ch.tiles[ly * PERIOD + lx];
        const x = lx * S;
        const y = ly * S;
        const n = hash(tx, ty);
        if (type === T_ROAD || type === T_CAR) {
          if (n % 17 === 3) {
            g.fillStyle = '#2a2824';
            g.fillRect(x + 4, y + 22, 14, 2);
            g.fillRect(x + 12, y + 16, 2, 10);
          }
          if (n % 29 === 4 && !onCrosswalk(lx, ly)) {
            g.fillStyle = '#141210';
            g.fillRect(x + 6, y + 6, 20, 20);
            g.fillStyle = '#3a3834';
            g.fillRect(x + 8, y + 8, 16, 16);
            g.fillStyle = '#8a867e';
            g.fillRect(x + 12, y + 12, 6, 2);
            g.fillRect(x + 10, y + 16, 8, 2);
            manholes.push({ x: tx * TILE + 8, y: ty * TILE + 8, chunk: key });
          }
          if (n % 23 === 7) puddles.push({ x: tx * TILE + 8, y: ty * TILE + 10, phase: (n % 9), chunk: key });
        } else if (type === T_SIDE && n % 19 === 5) {
          g.fillStyle = '#000';
          g.fillRect(x + 8, y + 12, 12, 10);
          g.fillStyle = n % 2 ? '#8d3a32' : '#c4a15a';
          g.fillRect(x + 10, y + 14, 8, 6);
          g.fillStyle = '#f4f1ea';
          g.fillRect(x + 12, y + 15, 4, 2);
        }
        if (lx === TW && ly === 0) signals.push({ x: tx * TILE + 4, y: ty * TILE - 4, chunk: key });
      }
    }
    ch.canvas = canvas;
  }

  function fillChunk(ch) {
    const ox = ch.bx * PERIOD;
    const oy = ch.by * PERIOD;
    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        const t = computeTile(ox + lx, oy + ly);
        const i = ly * PERIOD + lx;
        ch.tiles[i] = t;
        ch.solid[i] = (t === T_BUILD || t === T_TREE || t === T_CAR || t === T_FOUNT) ? 1 : 0;
      }
    }
    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        if (ch.tiles[ly * PERIOD + lx] !== T_CAR) continue;
        if (!(lx < TW || ly < TW)) continue;
        const horiz = ly < TW && !(lx < TW);
        for (let d = -2; d <= 2; d++) {
          if (!d) continue;
          const nx = lx + (horiz ? d : 0);
          const ny = ly + (horiz ? 0 : d);
          if (nx < 0 || ny < 0 || nx >= PERIOD || ny >= PERIOD) continue;
          const ni = ny * PERIOD + nx;
          if (ch.tiles[ni] === T_ROAD) ch.solid[ni] = 1;
        }
      }
    }
  }

  function loadChunk(bx, by) {
    const key = chunkKey(bx, by);
    if (chunks.has(key)) return chunks.get(key);
    const ch = {
      bx: bx,
      by: by,
      tiles: new Uint8Array(PERIOD * PERIOD),
      solid: new Uint8Array(PERIOD * PERIOD),
      claim: new Uint8Array(PERIOD * PERIOD),
      canvas: null,
    };
    chunks.set(key, ch);
    fillChunk(ch);
    paintChunk(ch);
    buildBlockProps(bx, by);
    return ch;
  }

  function dropTagged(list, key) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].chunk === key) list.splice(i, 1);
    }
  }

  function unloadChunk(ch) {
    const key = chunkKey(ch.bx, ch.by);
    chunks.delete(key);
    ch.canvas = null;
    dropTagged(props, key);
    dropTagged(manholes, key);
    dropTagged(puddles, key);
    dropTagged(signals, key);
    dropTagged(fountains, key);
    dropTagged(street, key);
  }

  function streamAround(x, y) {
    const bx = Math.floor(tileOf(x) / PERIOD);
    const by = Math.floor(tileOf(y) / PERIOD);
    if (bx === streamBx && by === streamBy && chunks.size) return;
    streamBx = bx;
    streamBy = by;
    for (let yb = by - LOAD_R; yb <= by + LOAD_R; yb++) {
      for (let xb = bx - LOAD_R; xb <= bx + LOAD_R; xb++) {
        if (!chunks.has(chunkKey(xb, yb))) loadChunk(xb, yb);
      }
    }
    const drop = [];
    for (const ch of chunks.values()) {
      if (Math.abs(ch.bx - bx) > UNLOAD_R || Math.abs(ch.by - by) > UNLOAD_R) drop.push(ch);
    }
    for (let i = 0; i < drop.length; i++) unloadChunk(drop[i]);
    buildCityGlow();
    if (typeof refillAmbience === 'function') refillAmbience();
  }

  function buildMap() {
    treeSprite = makeTreeSprite();
    lampSprite = makeLampSprite();
    fountainSprite = makeFountainSprite();
    props = [];
    signs = [];
    fountains = [];
    manholes = [];
    puddles = [];
    signals = [];
    chunks.clear();
    streamBx = null;
    streamBy = null;
    streamAround((9 + 0.5) * TILE, (4 + 0.5) * TILE);
    initAmbience();
  }

  function mixHex(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    if (amt >= 0) {
      r += (255 - r) * amt;
      g += (255 - g) * amt;
      b += (255 - b) * amt;
    } else {
      const k = 1 + amt;
      r *= k;
      g *= k;
      b *= k;
    }
    const h = (v) => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0');
    return '#' + h(r) + h(g) + h(b);
  }

  function presentSprite(src) {
    const hi = document.createElement('canvas');
    hi.width = src.width * 2;
    hi.height = src.height * 2;
    hi.worldW = src.width;
    hi.worldH = src.height;
    const g = hi.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(src, 0, 0, hi.width, hi.height);
    g.globalCompositeOperation = 'source-atop';
    const grd = g.createLinearGradient(0, 0, hi.width, hi.height);
    grd.addColorStop(0, 'rgba(255, 248, 230, 0.22)');
    grd.addColorStop(0.48, 'rgba(255,255,255,0)');
    grd.addColorStop(1, 'rgba(12, 8, 22, 0.30)');
    g.fillStyle = grd;
    g.fillRect(0, 0, hi.width, hi.height);
    g.globalCompositeOperation = 'source-over';
    return hi;
  }

  function dressBuilding(c) {
    const g = c.getContext('2d');
    const W = c.width;
    const H = c.height;
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(255,255,255,0.06)';
    for (let y = (H * 0.42) | 0; y < H - 6; y += 5) g.fillRect(6, y, W - 12, 1);
    g.fillStyle = '#d5d8e4';
    g.fillRect((W * 0.16) | 0, (H * 0.62) | 0, 40, 7);
    g.fillStyle = '#221c2c';
    for (let i = 0; i < 6; i++) g.fillRect((W * 0.16) + 4 + i * 6, (H * 0.62) - 10, 2, 10);
    g.fillStyle = '#c5ced6';
    g.fillRect((W * 0.7) | 0, (H * 0.48) | 0, 26, 18);
    g.fillStyle = '#5c6a74';
    g.fillRect((W * 0.72) | 0, (H * 0.5) | 0, 18, 3);
    g.fillRect((W * 0.72) | 0, (H * 0.55) | 0, 18, 3);
    g.fillStyle = '#3a3848';
    g.fillRect((W * 0.28) | 0, 4, 3, 22);
    g.fillRect((W * 0.24) | 0, 4, 16, 3);
    g.fillStyle = 'rgba(8,6,12,0.7)';
    g.fillRect((W * 0.42) | 0, (H * 0.72) | 0, 2, 16);
    g.fillRect((W * 0.42) | 0, (H * 0.8) | 0, 10, 2);
    g.globalCompositeOperation = 'source-over';
  }

  function dressCar(c, horizontal) {
    const g = c.getContext('2d');
    const W = c.width;
    const H = c.height;
    g.globalCompositeOperation = 'source-atop';
    const glass = g.createLinearGradient(0, 0, W, H);
    glass.addColorStop(0, 'rgba(230, 250, 255, 0.72)');
    glass.addColorStop(1, 'rgba(16, 40, 64, 0.45)');
    g.fillStyle = glass;
    if (horizontal) g.fillRect((W * 0.3) | 0, (H * 0.14) | 0, (W * 0.3) | 0, (H * 0.36) | 0);
    else g.fillRect((W * 0.16) | 0, (H * 0.26) | 0, (W * 0.66) | 0, (H * 0.2) | 0);
    g.fillStyle = '#fff6c8';
    if (horizontal) g.fillRect(W - 16, (H * 0.36) | 0, 10, 7);
    else g.fillRect((W * 0.22) | 0, H - 16, 10, 10);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    if (horizontal) g.fillRect(W - 14, (H * 0.38) | 0, 4, 3);
    else g.fillRect((W * 0.26) | 0, H - 14, 4, 4);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    if (horizontal) {
      g.fillRect(10, H - 16, 18, 10);
      g.fillRect(W - 30, H - 16, 18, 10);
    }
    g.globalCompositeOperation = 'source-over';
  }

  function dressTree(c) {
    const g = c.getContext('2d');
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = '#3f7a32';
    g.beginPath();
    g.arc(22, 20, 8, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#214018';
    g.beginPath();
    g.arc(34, 30, 7, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = 'source-over';
  }

  function makeBuildingSprite(fw, fh, pal, seed) {
    const pack = window.GTAHand && window.GTAHand.buildings;
    if (pack && pack.length) {
      let idx = Math.abs(seed) % pack.length;
      // This map's block hash never lands on the police slot, so a repeated
      // hospital uses that facade instead. Hospitals still appear elsewhere.
      if (pack[idx] && pack[idx].name === 'hus_sjukhus' && (seed % 3) === 0) {
        const police = pack.findIndex((b) => b.name === 'hus_polis');
        if (police >= 0) idx = police;
      }
      const spec = pack[idx];
      const img = spec.img;
      img.hand = true;
      return {
        canvas: img,
        hand: true,
        roof: spec.roof || img,
        wallFront: spec.wallFront || img,
        wallSide: spec.wallSide || spec.wallFront || img,
        lean: spec.lean || 0.2,
        lights: [],
        eaves: 0,
        neon: NEONS[seed % NEONS.length],
      };
    }
    if (window.GTACity) {
      const neon = NEONS[seed % NEONS.length];
      const roof = window.GTACity.paintRoof(fw, fh, pal, seed);
      return {
        canvas: roof,
        roof: roof,
        wallFront: window.GTACity.paintWall(fw, pal, seed, neon, true),
        wallSide: window.GTACity.paintWall(fh, pal, seed + 9, neon, false),
        eaves: 8,
        wallDrop: 52 + (seed % 4) * 6,
        sideDepth: 18,
        neon: neon,
        block: true,
        lights: [
          { x: fw / 2 + 8, y: 16 + fh * 0.42 },
          { x: 8 + 28, y: 16 + fh * 0.7 },
          { x: 8 + fw / 2, y: 16 + fh - 12 },
        ],
      };
    }
    // Two storeys, each about 1.7x a person's height. Door matches a person.
    const wallH = 90 + (seed % 3) * 4;
    const roofD = 30 + ((seed >> 3) % 3) * 4;
    const eaves = 8;
    const w = fw + eaves * 2;
    const h = roofD + wallH + 6;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    const roof = pal.roof;
    const roofHi = mixHex(pal.roof, 0.22);
    const roofDk = mixHex(pal.roof, -0.32);
    const wall = pal.wall;
    const wallHi = mixHex(pal.wall, 0.2);
    const wallDk = mixHex(pal.wall, -0.28);
    g.fillStyle = roofDk;
    g.fillRect(4, 6, w - 8, roofD);
    g.fillStyle = roof;
    g.fillRect(8, 2, w - 18, roofD - 2);
    g.fillStyle = roofHi;
    g.fillRect(12, 4, (w * 0.45) | 0, 8);
    g.fillStyle = roofDk;
    for (let row = 14; row < roofD; row += 5) g.fillRect(8, row, w - 20, 1);
    g.fillStyle = mixHex(pal.roof, -0.45);
    g.fillRect(w - 16, 8, 10, roofD - 4);
    const wallTop = h - wallH - 2;
    g.fillStyle = mixHex(pal.roof, -0.5);
    g.fillRect(eaves - 2, wallTop - 5, fw + 4, 5);
    g.fillStyle = wallDk;
    g.fillRect(eaves, wallTop, fw, wallH);
    g.fillStyle = wall;
    g.fillRect(eaves + 4, wallTop + 2, fw - 10, wallH - 4);
    g.fillStyle = wallHi;
    g.fillRect(eaves + 4, wallTop + 2, 5, wallH - 8);
    g.fillStyle = mixHex(pal.wall, -0.4);
    g.fillRect(eaves + fw - 14, wallTop + 2, 8, wallH - 4);
    const lights = [];
    const neon = NEONS[seed % NEONS.length];
    const winW = 12;
    const winH = 14;
    const doorW = 14;
    const doorH = 27;
    const doorX = eaves + ((fw / 2) | 0) - ((doorW / 2) | 0);
    const doorY = wallTop + wallH - doorH - 2;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = eaves + 16 + col * 30;
        const wy = wallTop + 10 + row * 46;
        if (wx + winW > eaves + fw - 16) continue;
        if (wy + winH > doorY && wx + winW > doorX - 4 && wx < doorX + doorW + 4) continue;
        const lit = ((seed + row * 5 + col * 3) % 5) !== 0;
        g.fillStyle = '#100c14';
        g.fillRect(wx, wy, winW, winH);
        g.fillStyle = lit ? pal.win : pal.off;
        g.fillRect(wx + 1, wy + 1, winW - 2, winH - 2);
        g.fillStyle = '#140c18';
        g.fillRect(wx + ((winW / 2) | 0), wy + 1, 1, winH - 2);
        g.fillRect(wx + 1, wy + ((winH / 2) | 0), winW - 2, 1);
        if (lit) {
          g.globalAlpha = 0.7;
          g.fillStyle = '#fff6c4';
          g.fillRect(wx + 2, wy + 2, 3, 2);
          g.globalAlpha = 1;
          if (lights.length < 3) lights.push({ x: wx + ((winW / 2) | 0), y: wy + ((winH / 2) | 0) });
        }
      }
    }
    g.fillStyle = '#140e0c';
    g.fillRect(doorX, doorY, doorW, doorH);
    g.fillStyle = '#4a3020';
    g.fillRect(doorX + 2, doorY + 2, doorW - 4, doorH - 4);
    g.fillStyle = pal.win;
    g.fillRect(doorX + 3, doorY + 3, doorW - 6, 6);
    g.fillStyle = COL.gold;
    g.fillRect(doorX + doorW - 5, doorY + 14, 2, 2);
    g.fillStyle = '#100c14';
    g.fillRect(doorX - 3, doorY - 8, doorW + 6, 7);
    g.fillStyle = neon;
    g.fillRect(doorX - 1, doorY - 6, doorW + 2, 4);
    g.fillStyle = '#fff';
    g.globalAlpha = 0.45;
    g.fillRect(doorX + 1, doorY - 5, 4, 1);
    g.globalAlpha = 1;
    lights.push({ x: doorX + ((doorW / 2) | 0), y: doorY - 4 });
    c.worldW = c.width;
    c.worldH = c.height;
    return { canvas: c, lights: lights, eaves: eaves, neon: neon };
  }

  function makeTreeSprite() {
    if (window.GTAHand && window.GTAHand.tree) return window.GTAHand.tree;
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 56;
    c.worldW = 24;
    c.worldH = 28;
    const g = c.getContext('2d');
    function clump(x, y, w, h, dk, mid, hi) {
      g.fillStyle = '#000';
      g.fillRect(x - 1, y - 1, w + 2, h + 2);
      g.fillStyle = mid;
      g.fillRect(x, y, w, h);
      g.fillStyle = hi;
      g.fillRect(x, y, Math.max(2, w - 4), 3);
      g.fillRect(x, y, 2, Math.max(2, h - 4));
      g.fillStyle = dk;
      g.fillRect(x + 2, y + h - 3, w - 2, 3);
      g.fillRect(x + w - 3, y + 2, 3, h - 2);
    }
    clump(4, 2, 40, 30, '#163016', '#2a4a22', '#3d6a32');
    clump(10, 6, 22, 16, '#1e3a1c', '#3d6a32', '#6aaa48');
    clump(16, 4, 12, 8, '#2a4a22', '#7b7f3d', '#c6d27a');
    clump(28, 14, 12, 12, '#163016', '#345028', '#4e6b3c');
    g.fillStyle = '#000';
    g.fillRect(20, 28, 10, 26);
    g.fillStyle = '#3a2414';
    g.fillRect(22, 30, 6, 22);
    g.fillStyle = '#7a5434';
    g.fillRect(22, 30, 2, 16);
    g.fillStyle = '#5a3820';
    g.fillRect(24, 36, 2, 10);
    g.fillStyle = '#000';
    g.fillRect(16, 50, 16, 6);
    g.fillStyle = '#3a2414';
    g.fillRect(18, 51, 12, 4);
    return c;
  }

  function makeLampSprite() {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 80;
    c.worldW = 8;
    c.worldH = 40;
    const g = c.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(6, 16, 5, 60);
    g.fillStyle = '#3a3832';
    g.fillRect(7, 18, 3, 56);
    g.fillStyle = '#6a645c';
    g.fillRect(7, 18, 1, 40);
    g.fillStyle = '#000';
    g.fillRect(1, 8, 14, 10);
    g.fillStyle = '#f0d48a';
    g.fillRect(3, 10, 10, 6);
    g.fillStyle = '#fff6d0';
    g.fillRect(4, 11, 4, 2);
    g.fillStyle = '#000';
    g.fillRect(3, 74, 10, 6);
    g.fillStyle = '#2a2824';
    g.fillRect(4, 75, 8, 4);
    return c;
  }

  function makeCarSprite(color, horizontal) {
    // 4.5 m long and about 2.25 m wide, wider than a person is tall.
    const c = document.createElement('canvas');
    c.width = horizontal ? 72 : 36;
    c.height = horizontal ? 36 : 72;
    const g = c.getContext('2d');
    const hi = mixHex(color, 0.28);
    const glass = '#9fd4ea';
    if (horizontal) {
      g.fillStyle = '#0c0a10';
      g.fillRect(2, 6, 68, 26);
      g.fillStyle = color;
      g.fillRect(4, 8, 64, 22);
      g.fillStyle = hi;
      g.fillRect(4, 8, 64, 6);
      g.fillStyle = '#102028';
      g.fillRect(22, 4, 26, 14);
      g.fillStyle = glass;
      g.fillRect(24, 6, 22, 10);
      g.fillStyle = '#fff';
      g.fillRect(26, 7, 6, 3);
      g.fillStyle = '#ffe07a';
      g.fillRect(62, 12, 6, 4);
      g.fillStyle = '#ff3b4e';
      g.fillRect(4, 20, 6, 4);
      g.fillStyle = '#141018';
      g.fillRect(10, 26, 12, 8);
      g.fillRect(50, 26, 12, 8);
      g.fillStyle = '#5a5468';
      g.fillRect(12, 28, 4, 3);
      g.fillRect(52, 28, 4, 3);
    } else {
      g.fillStyle = '#0c0a10';
      g.fillRect(4, 2, 28, 68);
      g.fillStyle = color;
      g.fillRect(6, 4, 24, 64);
      g.fillStyle = hi;
      g.fillRect(6, 4, 7, 64);
      g.fillStyle = '#102028';
      g.fillRect(6, 18, 24, 22);
      g.fillStyle = glass;
      g.fillRect(8, 20, 20, 18);
      g.fillStyle = '#fff';
      g.fillRect(10, 22, 6, 4);
      g.fillStyle = '#ffe07a';
      g.fillRect(10, 60, 5, 6);
      g.fillStyle = '#ff3b4e';
      g.fillRect(22, 6, 5, 6);
      g.fillStyle = '#141018';
      g.fillRect(2, 10, 8, 12);
      g.fillRect(26, 10, 8, 12);
      g.fillRect(2, 50, 8, 12);
      g.fillRect(26, 50, 8, 12);
      g.fillStyle = '#5a5468';
      g.fillRect(3, 12, 4, 4);
      g.fillRect(27, 52, 4, 4);
    }
    c.worldW = c.width;
    c.worldH = c.height;
    return c;
  }

  function handCarName(n) {
    const names = window.GTAHand && window.GTAHand.ready && window.GTAHand.carNames;
    if (names && names.length) return names[Math.abs(n) % names.length];
    const models = (window.GTACity && window.GTACity.models) || ['sedan'];
    return models[Math.abs(n) % models.length];
  }

  function vehicleSprite(model, color) {
    if (window.GTAHand && window.GTAHand.cars && window.GTAHand.cars[model]) {
      return window.GTAHand.cars[model];
    }
    const key = model + '|' + (color || '');
    if (!carCache[key]) {
      carCache[key] = window.GTACity
        ? window.GTACity.paintCar(model, color)
        : makeCarSprite(color, true);
    }
    return carCache[key];
  }

  function carLightsAt(cx, cy, ang, model) {
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const lights = [
      { x: cx + c * 30, y: cy + s * 30, r: 18, color: '#fff1b0' },
      { x: cx - c * 28, y: cy - s * 28, r: 12, color: '#ff3355' },
    ];
    if (model === 'police') lights.push({ x: cx, y: cy - 4, r: 22, color: '#7aa2ff' });
    if (model === 'taxi') lights.push({ x: cx, y: cy, r: 14, color: '#ffe14a' });
    return lights;
  }

  function makeFountainSprite() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 56;
    c.worldW = 32;
    c.worldH = 28;
    const g = c.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(2, 28, 60, 24);
    g.fillStyle = '#6a6458';
    g.fillRect(4, 30, 56, 20);
    g.fillStyle = '#b7aea0';
    g.fillRect(8, 24, 48, 18);
    g.fillStyle = '#efe8dc';
    g.fillRect(10, 26, 16, 3);
    g.fillStyle = '#000';
    g.fillRect(14, 16, 36, 16);
    g.fillStyle = '#1a4a5a';
    g.fillRect(16, 18, 32, 12);
    g.fillStyle = '#3e92a8';
    g.fillRect(20, 16, 24, 8);
    g.fillStyle = '#d5eef2';
    g.fillRect(28, 4, 8, 16);
    g.fillRect(22, 6, 20, 3);
    return c;
  }

  const carCache = {};
  let treeSprite = null;
  let lampSprite = null;
  let fountainSprite = null;

  function buildBlockProps(bx, by) {
    const propStart = props.length;
    const kind = blockKind(bx, by);
        const x0 = (bx * PERIOD + TW + 2) * TILE;
        const y0 = (by * PERIOD + TW + 2) * TILE;
        const fw = 8 * TILE;
        const fh = 8 * TILE;
        if (kind === 3) {
          const pal = BUILDINGS[hash(bx, by) % BUILDINGS.length];
          const seed = hash(bx + 9, by + 4);
          const built = makeBuildingSprite(fw, fh, pal, seed);
          const left = x0 - built.eaves;
          const wallH = 42;
          const sortY = y0 - 10;
          if (built.hand) {
            const lotX = (bx * PERIOD + TW) * TILE;
            const lotY = (by * PERIOD + TW) * TILE;
            const lot = (PERIOD - TW) * TILE;
            // The outer two tiles of the lot are the sidewalk. The building
            // sits on the inner pad so people can walk the pavement.
            const tx0 = Math.floor(x0 / TILE);
            const ty0 = Math.floor(y0 / TILE);
            const tx1 = Math.floor((x0 + fw) / TILE);
            const ty1 = Math.floor((y0 + fh) / TILE);
            for (let sy = ty0; sy < ty1; sy++) {
              for (let sx = tx0; sx < tx1; sx++) {
                if (computeTile(sx, sy) !== T_BUILD) continue;
                markSolid(sx, sy);
              }
            }
            props.push({
              img: built.roof,
              roof: built.roof,
              wallFront: built.wallFront,
              wallSide: built.wallSide,
              lean: built.lean,
              w: fw,
              h: fh,
              x: x0,
              sortY: y0 + fh,
              shadowW: 0,
              shadowH: 0,
              lights: [],
              neon: built.neon,
              kind: 'build',
              hand: true,
              footX: x0,
              footY: y0,
              fw: fw,
              fh: fh,
            });
            addLamp(lotX + 12, lotY + lot - 4);
            addLamp(lotX + lot - 12, lotY + lot - 4);
          } else {
          for (let sy = Math.floor(y0 / TILE); sy < Math.floor((y0 + fh) / TILE); sy++) {
            for (let sx = Math.floor(x0 / TILE); sx < Math.floor((x0 + fw) / TILE); sx++) {
              markSolid(sx, sy);
            }
          }
          const lights = [];
          for (let i = 0; i < built.lights.length; i++) {
            const L = built.lights[i];
            lights.push({
              x: left + L.x,
              y: y0 + fh - (built.canvas.worldH || built.canvas.height) + L.y,
              r: i === built.lights.length - 1 ? 44 : 28,
              color: i === built.lights.length - 1 ? NEONS[seed % NEONS.length] : pal.win,
            });
          }
          props.push({
            img: built.canvas,
            w: built.block ? fw + 96 : (built.canvas.worldW || built.canvas.width),
            h: built.block ? fh + 96 : (built.canvas.worldH || built.canvas.height),
            x: built.block ? x0 - 48 : left,
            sortY: sortY,
            shadowW: fw * 0.86,
            shadowH: 12,
            lights: lights,
            neon: built.neon,
            wallDrop: wallH,
            sideDepth: built.sideDepth || 18,
            kind: 'build',
            roof: built.roof || null,
            wallFront: built.wallFront || null,
            wallSide: built.wallSide || null,
            footX: x0,
            footY: y0,
            fw: fw,
            fh: fh,
          });
          addLamp(x0 - 14, y0 + fh + 6);
          addLamp(x0 + fw + 2, y0 + fh + 6);
          }
        } else if (kind === 0) {
          props.push({
            img: fountainSprite,
            w: fountainSprite.worldW || fountainSprite.width,
            h: fountainSprite.worldH || fountainSprite.height,
            x: x0 + fw / 2 - (fountainSprite.worldW || fountainSprite.width) / 2,
            sortY: y0 + fh / 2 + 16,
            shadowW: 46,
            shadowH: 12,
            lights: [{ x: x0 + fw / 2, y: y0 + fh / 2, r: 42, color: '#9eecff' }],
            kind: 'fountain',
          });
          fountains.push({ x: x0 + fw / 2, y: y0 + fh / 2, chunk: chunkKey(bx, by) });
        }
    const ox = bx * PERIOD;
    const oy = by * PERIOD;
    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        const tx = ox + lx;
        const ty = oy + ly;
        const t = computeTile(tx, ty);
        const px = tx * TILE;
        const py = ty * TILE;
        if (t === T_TREE) {
          props.push({
            img: treeSprite,
            w: treeSprite.worldW || treeSprite.width,
            h: treeSprite.worldH || treeSprite.height,
            x: px + TILE / 2 - (treeSprite.worldW || treeSprite.width) / 2,
            sortY: py + TILE - 1,
            shadowW: 34,
            shadowH: 12,
            lights: [],
            kind: 'tree',
          });
        } else if (t === T_CAR) {
          const mx = lx;
          const my = ly;
          const onRoad = mx < TW || my < TW;
          const horiz = onRoad ? (my < TW && mx >= TW) : ((hash(tx, ty) & 2) === 0);
          let anchorX = px + TILE / 2;
          let anchorY = py + TILE / 2;
          if (!onRoad) {
            const spot = claimLotCar(tx, ty, horiz);
            if (!spot) continue;
            anchorX = spot.x;
            anchorY = spot.y;
          }
          const model = handCarName(hash(tx, ty));
          const color = CAR_COLORS[hash(tx, ty) % CAR_COLORS.length];
          const img = vehicleSprite(model, color);
          let ang = horiz ? 0 : Math.PI / 2;
          if (hash(ty, tx) & 1) ang += Math.PI;
          const carScale = img.hand ? 1 : 0.84;
          const carW = (img.worldW || 36) * carScale;
          const carH = (img.worldH || 72) * carScale;
          props.push({
            img: img,
            model: model,
            ang: ang,
            cx: anchorX,
            cy: anchorY,
            spriteW: carW,
            spriteH: carH,
            w: 84,
            h: 84,
            x: anchorX - 42,
            sortY: anchorY + 18,
            shadowW: 64,
            shadowH: 16,
            lights: carLightsAt(anchorX, anchorY, ang, model),
            kind: 'car',
          });
        }
      }
    }
    const key = chunkKey(bx, by);
    for (let i = propStart; i < props.length; i++) props[i].chunk = key;
  }

  function claimLotCar(tx, ty, horiz) {
    const ch = chunkOfTile(tx, ty);
    if (!ch) return null;
    const shifts = [0, 1, -1, 2, -2];
    for (let s = 0; s < shifts.length; s++) {
      const shift = shifts[s];
      const cells = [];
      let ok = true;
      let minX = tx;
      let maxX = tx;
      let minY = ty;
      let maxY = ty;
      for (let d = -2; d <= 2; d++) {
        const nx = tx + (horiz ? d + shift : 0);
        const ny = ty + (horiz ? 0 : d + shift);
        if (chunkOfTile(nx, ny) !== ch) {
          ok = false;
          break;
        }
        const li = localIndex(nx, ny);
        const kind = ch.tiles[li];
        if ((kind !== T_LOT && kind !== T_CAR) || ch.claim[li]) {
          ok = false;
          break;
        }
        cells.push(li);
        if (nx < minX) minX = nx;
        if (nx > maxX) maxX = nx;
        if (ny < minY) minY = ny;
        if (ny > maxY) maxY = ny;
      }
      if (!ok) continue;
      for (let i = 0; i < cells.length; i++) {
        ch.claim[cells[i]] = 1;
        ch.solid[cells[i]] = 1;
      }
      return {
        x: ((minX + maxX + 1) * TILE) / 2,
        y: ((minY + maxY + 1) * TILE) / 2,
      };
    }
    return null;
  }

  function addLamp(x, y) {
    if (isSolid(x, y) || isSolid(x + 6, y)) return;
    props.push({
      img: lampSprite,
      w: lampSprite.worldW || lampSprite.width,
      h: lampSprite.worldH || lampSprite.height,
      x: x - ((lampSprite.worldW || lampSprite.width) >> 1),
      sortY: y,
      shadowW: 12,
      shadowH: 5,
      lights: [{ x: x, y: y - 60, r: 56, color: '#ffe7a8' }],
      kind: 'lamp',
    });
  }

  function isSolid(x, y) {
    return readSolid(tileOf(x), tileOf(y));
  }

  function overlaps(ent) {
    const r = ent.radius;
    if (isSolid(ent.x - r, ent.y - r) || isSolid(ent.x + r, ent.y - r)) return true;
    if (isSolid(ent.x - r, ent.y + r) || isSolid(ent.x + r, ent.y + r)) return true;
    return isSolid(ent.x, ent.y);
  }

  function moveBody(ent, dx, dy) {
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / 6));
    const sx = dx / steps;
    const sy = dy / steps;
    for (let i = 0; i < steps; i++) {
      ent.x += sx;
      if (overlaps(ent)) ent.x -= sx;
      ent.y += sy;
      if (overlaps(ent)) ent.y -= sy;
    }
  }

  function findOpen(x, y, radius) {
    const probe = { x: x, y: y, radius: radius || 6 };
    if (!overlaps(probe)) return { x: x, y: y };
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const d = 20 + (i % 6) * 14;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d;
      probe.x = px;
      probe.y = py;
      if (!overlaps(probe)) return { x: px, y: py };
    }
    return null;
  }

  const STAGE_W = 1280;
  const STAGE_H = 720;

  function resize() {
    const sw = Math.max(1, window.innerWidth || STAGE_W);
    const sh = Math.max(1, window.innerHeight || STAGE_H);
    const desktop = sw >= 1100;
    let w;
    let h;
    if (desktop) {
      // Same desktop zoom as before: pixel 4, then /1.2 and /1.42.
      const pixel = 4 / 1.2 / 1.42;
      w = Math.floor(STAGE_W / pixel);
      h = Math.floor(STAGE_H / pixel);
      drawScale = Math.max(1, Math.round(pixel));
    } else {
      drawScale = 2;
      w = Math.max(160, Math.floor(sw / drawScale));
      h = Math.max(160, Math.floor(sh / drawScale));
    }
    const bw = w * drawScale;
    const bh = h * drawScale;
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      vignette = null;
      vignetteKey = '';
      lightCanvas = null;
      lightMask = null;
      bloomHalf = null;
      bloomQuarter = null;
      dofCanvas = null;
      dofGrad = null;
    }
    view.w = w;
    view.h = h;
    ctx.imageSmoothingEnabled = false;
    if (!stage) return;
    if (desktop) {
      stage.style.width = '';
      stage.style.height = '';
      canvas.style.width = '';
      canvas.style.height = '';
      const fit = Math.min(sw / STAGE_W, sh / STAGE_H);
      const scale = fit >= 1 ? Math.max(1, Math.floor(fit)) : fit;
      stage.style.transform = 'scale(' + scale + ')';
    } else {
      stage.style.transform = 'none';
      stage.style.width = sw + 'px';
      stage.style.height = sh + 'px';
      canvas.style.width = sw + 'px';
      canvas.style.height = sh + 'px';
    }
    if (stickEl) stickEl.hidden = desktop;
  }

  function cameraTarget() {
    return {
      x: player.x - view.w / 2,
      y: player.y - view.h / 2,
    };
  }

  function snapCamera() {
    if (!player) return;
    const t = cameraTarget();
    cam.x = t.x;
    cam.y = t.y;
  }

  function updateCamera(dt) {
    if (!player) return;
    const t = cameraTarget();
    const k = reduceMotion ? 1 : (1 - Math.exp(-9 * (dt || 0.016)));
    cam.x += (t.x - cam.x) * k;
    cam.y += (t.y - cam.y) * k;
    cam.x = Math.round(cam.x * drawScale) / drawScale;
    cam.y = Math.round(cam.y * drawScale) / drawScale;
  }

  function setDir(ent, x, y) {
    if (Math.hypot(x, y) < 0.18) return;
    const oct = Math.round(Math.atan2(y, x) / (Math.PI / 4)) & 7;
    const map = [
      ['side', false],
      ['se', false],
      ['down', false],
      ['se', true],
      ['side', true],
      ['ne', true],
      ['up', false],
      ['ne', false],
    ];
    ent.pose = map[oct][0];
    ent.flip = map[oct][1];
    if (x < 0) ent.facing = -1;
    else if (x > 0) ent.facing = 1;
  }

  function readMove() {
    let x = (held.right ? 1 : 0) - (held.left ? 1 : 0) + stickX;
    let y = (held.down ? 1 : 0) - (held.up ? 1 : 0) + stickY;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    if (len < 0.12) return { x: 0, y: 0 };
    return { x: x, y: y };
  }

  function addShake(n) {
    if (!reduceMotion) shake = Math.max(shake, n);
  }

  function burst(x, y, color, n) {
    if (particles.length > 180) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 20 + Math.random() * 80;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.28 + Math.random() * 0.22,
        max: 0.5,
        color: color,
        size: 1 + (Math.random() * 2 | 0),
      });
    }
  }

  function puff(x, y, n) {
    if (particles.length > 170) return;
    for (let i = 0; i < n; i++) {
      particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y + (Math.random() * 4 - 2),
        vx: (Math.random() - 0.5) * 22,
        vy: -18 - Math.random() * 36,
        life: 0.4 + Math.random() * 0.28,
        max: 0.7,
        color: i % 2 ? '#d8d4e0' : '#6a6478',
        size: 2 + (Math.random() * 2 | 0),
      });
    }
  }

  function arcBit(x, y, color, n) {
    if (particles.length > 180) return;
    for (let i = 0; i < n; i++) {
      particles.push({
        x: x + (Math.random() * 6 - 3),
        y: y,
        vx: (Math.random() - 0.5) * 80,
        vy: -(36 + Math.random() * 90),
        grav: 260,
        life: 0.4 + Math.random() * 0.35,
        max: 0.75,
        color: color,
        size: 1 + ((Math.random() * 2) | 0),
      });
    }
  }

  const BLOOD = ['#9a1428', '#c41c34', '#6e0c18', '#e23b4a'];
  const GUTS = {
    zombie: { skin: '#b6e070', cloth: '#8a909e', pants: '#3a4a28', hair: '#243018' },
    alfa: { skin: '#c6ee88', cloth: '#3a3a44', pants: '#ff4d8d', hair: '#ff4d8d' },
    cop: { skin: '#f2c19a', cloth: '#3a62e0', pants: '#1a2758', hair: '#24386e' },
    dealer: { skin: '#f2c19a', cloth: '#8a4ad4', pants: '#241430', hair: '#1a1020' },
    boss: { skin: '#f2c19a', cloth: '#6a3ad0', pants: '#2a1848', hair: '#e6b325' },
    civ: { skin: '#e0a888', cloth: '#ff8a3d', pants: '#2a3348', hair: '#2a160f' },
    civ2: { skin: '#f0c8b0', cloth: '#2a3a62', pants: '#1c1a24', hair: '#6a4030' },
    civ3: { skin: '#8a5a3c', cloth: '#1f8a4c', pants: '#3a342c', hair: '#1a100c' },
    civ4: { skin: '#f6d2b4', cloth: '#ff4d8d', pants: '#2a1848', hair: '#1a1028' },
    civ5: { skin: '#d8a07a', cloth: '#6a6458', pants: '#243048', hair: '#c8c4d0' },
  };

  function addStain(x, y, kind) {
    if (!goreOn) return;
    if (stains.length >= 48) stains.shift();
    const pool = kind === 'pool';
    const drip = kind === 'drip';
    const life = pool ? 7 : drip ? 2.2 : 3.6;
    stains.push({
      x: x + (Math.random() * 4 - 2),
      y: y + (Math.random() * 3 - 1),
      w: pool ? 9 + ((Math.random() * 6) | 0) : drip ? 2 : 3 + ((Math.random() * 3) | 0),
      h: pool ? 4 + ((Math.random() * 2) | 0) : 2,
      life: life,
      max: life,
      rot: Math.random() * 3,
      color: BLOOD[(Math.random() * BLOOD.length) | 0],
    });
  }

  function bloodSpurt(x, y, sx, sy, n) {
    if (!goreOn || particles.length > 168) return;
    const dx = x - (sx == null ? x + 1 : sx);
    const dy = y - (sy == null ? y : sy);
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    for (let i = 0; i < n && particles.length < 176; i++) {
      const spread = (Math.random() - 0.5) * 1.4;
      const sp = 36 + Math.random() * 100;
      particles.push({
        x: x,
        y: y - 4,
        vx: (nx + spread) * sp,
        vy: (ny * 0.35 - 0.85) * sp,
        grav: 340,
        life: 0.32 + Math.random() * 0.28,
        max: 0.6,
        color: BLOOD[(Math.random() * BLOOD.length) | 0],
        size: 1 + ((Math.random() * 2) | 0),
      });
    }
    if (Math.random() < 0.65) addStain(x, y + 1, 'splat');
  }

  function pickDeath(ent, cause) {
    if (!goreOn) return ent.type === 'boss' ? 'spin' : 'fall';
    if (ent.type === 'boss') return (cause === 'boom' || Math.random() < 0.7) ? 'gib' : 'launch';
    const r = Math.random();
    if (cause === 'boom') {
      if (r < 0.4) return 'launch';
      if (r < 0.78) return 'gib';
      return 'partial';
    }
    if (cause === 'cart') {
      if (r < 0.34) return 'crumple';
      if (r < 0.58) return 'fall';
      if (r < 0.84) return 'partial';
      return 'spin';
    }
    if (r < 0.18) return 'fall';
    if (r < 0.36) return 'spin';
    if (r < 0.52) return 'crumple';
    if (r < 0.72) return 'partial';
    if (r < 0.9) return 'gib';
    return 'launch';
  }

  function spawnGibs(ent, style) {
    if (!goreOn) return;
    const pal = GUTS[ent.type] || GUTS.civ;
    const big = ent.type === 'boss';
    let parts;
    if (style === 'partial') {
      const bag = ['head', 'arm', 'leg'];
      parts = [bag[(Math.random() * bag.length) | 0]];
      if (Math.random() < 0.65) parts.push(bag[(Math.random() * bag.length) | 0]);
    } else if (style === 'launch') {
      parts = Math.random() < 0.55 ? ['arm'] : [];
    } else {
      parts = ['head', 'arm', 'arm', 'leg', 'leg', 'torso'];
      if (big) parts.push('torso', 'arm', 'leg');
    }
    for (let i = 0; i < parts.length; i++) {
      if (gibs.length >= 40) gibs.shift();
      const ang = Math.random() * Math.PI * 2;
      const sp = (big ? 80 : 46) + Math.random() * (big ? 110 : 80);
      const hold = big ? 2.6 : 1.6;
      gibs.push({
        x: ent.x + (Math.random() * 6 - 3),
        y: ent.y - 8,
        vx: Math.cos(ang) * sp + (ent.kvx || 0) * 0.2,
        vy: -36 - Math.random() * (big ? 100 : 64) + Math.sin(ang) * 24,
        grav: 300,
        ang: Math.random() * 6,
        spin: (Math.random() - 0.5) * (big ? 16 : 12),
        air: 0,
        bounces: 0,
        rest: false,
        drip: 0.04,
        life: hold,
        max: hold,
        kind: parts[i],
        skin: pal.skin,
        cloth: pal.cloth,
        pants: pal.pants,
        hair: pal.hair,
        big: big,
      });
    }
  }

  function finishDeath(ent, cause, sx, sy) {
    const style = pickDeath(ent, cause || 'hit');
    ent.death = style;
    const awayX = ent.x - (sx == null ? ent.x - 1 : sx);
    const awayY = ent.y - (sy == null ? ent.y : sy);
    const len = Math.hypot(awayX, awayY) || 1;
    if (style === 'launch' || (style === 'gib' && cause === 'boom')) {
      const kick = ent.type === 'boss' ? 200 : 120;
      ent.kvx += (awayX / len) * kick;
      ent.kvy += (awayY / len) * kick * 0.6 - 70;
    }
    if (style === 'gib') {
      ent.gibbed = true;
      ent.dying = ent.type === 'boss' ? 1.2 : 0.55;
    } else if (style === 'launch') {
      ent.dying = ent.type === 'boss' ? 1 : 0.7;
    } else if (ent.type === 'boss') {
      ent.dying = 0.9;
    }
    ent.dieMax = ent.dying;
    if (!goreOn) return;
    addStain(ent.x, ent.y + 2, 'pool');
    if (ent.type === 'boss') {
      addStain(ent.x - 8, ent.y + 3, 'pool');
      addStain(ent.x + 8, ent.y + 1, 'pool');
      bloodSpurt(ent.x, ent.y, sx, sy, 14);
    } else {
      bloodSpurt(ent.x, ent.y, sx, sy, style === 'gib' ? 7 : 4);
    }
    if (style === 'gib' || style === 'partial' || style === 'launch') spawnGibs(ent, style);
  }

  function updateGore(dt) {
    for (let i = stains.length - 1; i >= 0; i--) {
      stains[i].life -= dt;
      if (stains[i].life <= 0) stains.splice(i, 1);
    }
    for (let i = gibs.length - 1; i >= 0; i--) {
      const g = gibs[i];
      if (!g.rest) {
        g.air += dt;
        g.vy += g.grav * dt;
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        g.ang += g.spin * dt;
        g.drip -= dt;
        if (g.drip <= 0) {
          g.drip = 0.09;
          addStain(g.x, g.y, 'drip');
        }
        if (g.air > 1.15 || (g.air > 0.16 && g.vy > 0)) {
          g.vy *= -0.3;
          g.vx *= 0.6;
          g.spin *= 0.4;
          g.bounces += 1;
          addStain(g.x, g.y, 'splat');
          if (g.bounces >= 2 || g.air > 1.15 || Math.abs(g.vy) < 26) {
            g.rest = true;
            g.vy = 0;
            g.grav = 0;
            g.life = g.max;
          }
        }
      } else {
        g.vx *= Math.exp(-3.2 * dt);
        g.x += g.vx * dt;
        g.spin *= Math.exp(-2 * dt);
        g.ang += g.spin * dt;
        g.life -= dt;
        if (g.life <= 0) gibs.splice(i, 1);
      }
    }
  }

  function drawStains() {
    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i < stains.length; i++) {
      const s = stains[i];
      if (!onScreen(s.x, s.y, 12)) continue;
      ctx.save();
      ctx.translate(s.x - cam.x, s.y - cam.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = Math.max(0.08, s.life / s.max) * 0.9;
      ctx.fillStyle = s.color;
      ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
      ctx.fillRect(-s.w / 3, -1, 2, 2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawGibs() {
    for (let i = 0; i < gibs.length; i++) {
      const g = gibs[i];
      if (!onScreen(g.x, g.y, 20)) continue;
      const s = g.big ? 1.65 : 1;
      ctx.save();
      ctx.translate(Math.round(g.x - cam.x), Math.round(g.y - cam.y));
      ctx.rotate(g.ang);
      ctx.globalAlpha = g.rest ? Math.max(0, g.life / g.max) : 1;
      ctx.imageSmoothingEnabled = false;
      if (g.kind === 'head') {
        ctx.fillStyle = g.hair;
        ctx.fillRect(-3 * s, -4 * s, 6 * s, 3 * s);
        ctx.fillStyle = g.skin;
        ctx.fillRect(-3 * s, -1 * s, 6 * s, 5 * s);
        ctx.fillStyle = '#140c18';
        ctx.fillRect(-2 * s, 0, s, s);
        ctx.fillRect(s, 0, s, s);
      } else if (g.kind === 'arm') {
        ctx.fillStyle = g.cloth;
        ctx.fillRect(-1 * s, -4 * s, 3 * s, 7 * s);
        ctx.fillStyle = g.skin;
        ctx.fillRect(-1 * s, 3 * s, 3 * s, 2 * s);
      } else if (g.kind === 'leg') {
        ctx.fillStyle = g.pants;
        ctx.fillRect(-2 * s, -5 * s, 3 * s, 8 * s);
        ctx.fillStyle = '#1a1420';
        ctx.fillRect(-2 * s, 3 * s, 4 * s, 2 * s);
      } else {
        ctx.fillStyle = g.cloth;
        ctx.fillRect(-4 * s, -3 * s, 8 * s, 6 * s);
        ctx.fillStyle = '#6e0c18';
        ctx.fillRect(-2 * s, -1 * s, 3 * s, 2 * s);
        ctx.fillStyle = g.skin;
        ctx.fillRect(1 * s, 1 * s, 2 * s, 2 * s);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function muzzle(x, y, ang, color) {
    if (flashes.length > 28) flashes.shift();
    flashes.push({ x: x, y: y, ang: ang, color: color, life: 0.07, max: 0.07 });
  }

  function pistolPoint() {
    const hero = window.GTAPlayer && window.GTAPlayer.ready && window.GTAPlayer.frame(player, globalTime);
    const dw = (hero && hero.worldW) || 20;
    const dh = (hero && hero.worldH) || 30;
    const foot = 2;
    let lx = -dw / 2;
    const ly = -dh + foot + (30 / 60) * dh;
    const faceRight = player.facing > 0;
    if (faceRight) lx = -lx;
    const out = faceRight ? 2 : -2;
    return { x: player.x + lx + out, y: player.y + ly };
  }

  function pistolFx(ang) {
    const g = pistolPoint();
    if (flashes.length > 28) flashes.shift();
    flashes.push({ x: g.x, y: g.y, ang: ang, color: '#fff6b0', life: 0.12, max: 0.12, pistol: true });
    if (particles.length > 168) return;
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: g.x + (i - 1),
        y: g.y,
        vx: -Math.cos(ang) * (6 + i * 3),
        vy: -Math.sin(ang) * (6 + i * 3) - 12 - i * 3,
        life: 0.26 + i * 0.04,
        max: 0.34,
        color: i % 2 ? '#d8d4e0' : '#8a8680',
        size: 2,
      });
    }
  }

  function swing(kind) {
    player.cast = 0.18;
    player.castKind = kind;
    player.swing = 0.42;
    player.swingMax = 0.42;
    player.hold = kind;
  }

  function bottleFx(ang) {
    const g = pistolPoint();
    if (flashes.length > 28) flashes.shift();
    flashes.push({ x: g.x, y: g.y, ang: ang, color: '#d8ffe8', life: 0.14, max: 0.14, soda: true });
    if (particles.length > 168) return;
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: g.x,
        y: g.y,
        vx: Math.cos(ang) * (18 + i * 8) + (i - 2) * 4,
        vy: Math.sin(ang) * (18 + i * 8) - 10,
        life: 0.22 + i * 0.03,
        max: 0.28,
        color: i % 2 ? '#b8ff9a' : '#e8ffe8',
        size: 2,
      });
    }
  }

  function bassFx() {
    for (let i = 0; i < 4; i++) {
      if (flashes.length > 28) flashes.shift();
      const a = (i / 4) * Math.PI * 2 + 0.6;
      flashes.push({
        x: player.x + Math.cos(a) * 12,
        y: player.y - 10 + Math.sin(a) * 8,
        ang: a,
        color: '#5ce1e6',
        life: 0.22,
        max: 0.22,
        bass: true,
      });
    }
  }

  function sodaSplash(x, y) {
    if (particles.length > 168) return;
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (i - 2) * 26,
        vy: -18 - (i % 3) * 10,
        life: 0.28,
        max: 0.28,
        color: i % 2 ? '#9ae06a' : '#e8ffe8',
        size: 2,
      });
    }
  }

  function cartClank(x, y) {
    if (particles.length > 168) return;
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 20,
      vy: -22,
      life: 0.16,
      max: 0.16,
      color: '#f4f0e8',
      size: 2,
    });
    if ((player.swing || 0) <= 0) swing('carts');
  }

  function spawnBark(x, y, text, color) {
    if (barks.length >= 4) return;
    barks.push({ x: x, y: y - 32, text: text, color: color || '#fff', life: 1.15, max: 1.15 });
  }

  function maybeBark(e) {
    const list = BARKS[e.type];
    if (!list) return;
    const chance = e.type === 'boss' ? 1 : 0.22;
    if (Math.random() > chance) return;
    const colors = { zombie: '#c6f59a', cop: '#9eb6ff', dealer: '#e2b6ff', alfa: '#ff9ec4', boss: '#ffd0dc' };
    spawnBark(e.x, e.y, list[(Math.random() * list.length) | 0], colors[e.type]);
  }

  function hpMul() { return 1 + elapsed * 0.007; }
  function dmgMul() { return 1 + elapsed * 0.0025; }
  function spdMul() { return 1 + Math.min(0.14, elapsed * 0.0008); }

  function makeEnemy(type, x, y) {
    const open = findOpen(x, y, type === 'boss' ? 12 : 8) || { x: x, y: y };
    const base = {
      zombie: { hp: 12, speed: 34, dmg: 4, r: 6, xp: 3 },
      cop: { hp: 22, speed: 56, dmg: 5, r: 6, xp: 4 },
      dealer: { hp: 16, speed: 44, dmg: 3, r: 6, xp: 6 },
      alfa: { hp: 48, speed: 32, dmg: 7, r: 8, xp: 12 },
      boss: { hp: 280, speed: 36, dmg: 8, r: 10, xp: 48 },
    }[type];
    const e = {
      id: nextId++,
      type: type,
      x: open.x,
      y: open.y,
      hp: Math.round(base.hp * (type === 'boss' ? (1 + elapsed / 90) : hpMul())),
      speed: base.speed * spdMul(),
      dmg: Math.max(1, Math.round(base.dmg * dmgMul())),
      radius: base.r,
      xp: base.xp,
      flash: 0,
      kvx: 0,
      kvy: 0,
      stuck: 0,
      phase: Math.random() * 10,
      facing: -1,
      alive: true,
      lungeCd: 0.6 + Math.random() * 1.6,
      lunging: 0,
      lx: 0,
      ly: 0,
      shootT: 0.5 + Math.random() * 1.2,
      shotDmg: Math.round(6 * dmgMul()),
      mode: 'chase',
      modeT: 1.2 + Math.random(),
      dashx: 1,
      dashy: 0,
      touchT: 0,
      pose: 'down',
      flip: false,
      moving: false,
      born: type === 'boss' ? 0.85 : 0.28,
      bornMax: type === 'boss' ? 0.85 : 0.28,
      dying: 0,
      dieMax: type === 'boss' ? 0.7 : 0.45,
    };
    e.maxHp = e.hp;
    maybeBark(e);
    return e;
  }

  function killEnemy(e, cause, sx, sy) {
    if (!e.alive) return;
    e.alive = false;
    e.dying = e.type === 'boss' ? 0.7 : 0.45;
    e.dieMax = e.dying;
    kills += 1;
    finishDeath(e, cause, sx, sy);
    if (!goreOn) {
      const color = e.type === 'cop' ? '#9eb6ff' : e.type === 'dealer' || e.type === 'boss' ? '#d7b4ff' : '#c6f59a';
      burst(e.x, e.y, color, e.type === 'boss' ? 16 : 8);
      puff(e.x, e.y, e.type === 'boss' ? 8 : 4);
    }
    const n = e.type === 'boss' ? 8 : 1;
    const each = e.xp / n;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      dropGem(e.x + Math.cos(a) * 10, e.y + Math.sin(a) * 10, each);
    }
    if (e.type === 'boss') {
      addShake(6);
      sfx.boss();
    }
  }

  function hurtEnemy(e, dmg, sx, sy, cause) {
    if (!e.alive || state === 'dead') return;
    e.hp -= dmg;
    e.flash = 0.08;
    const dx = e.x - sx;
    const dy = e.y - sy;
    const len = Math.hypot(dx, dy) || 1;
    e.kvx += (dx / len) * 90;
    e.kvy += (dy / len) * 90;
    if (goreOn) bloodSpurt(e.x, e.y, sx, sy, e.type === 'boss' ? 5 : 3);
    if (globalTime - sfx.hitAt > 0.04) {
      sfx.hitAt = globalTime;
      sfx.hit();
    }
    if (e.hp <= 0) killEnemy(e, cause || 'hit', sx, sy);
    else e.hit = 0.16;
  }

  function downFolk(f) {
    if (!f.alive) return;
    f.alive = false;
    f.dying = 0.85;
    f.dieMax = 0.85;
    f.panic = 0;
    finishDeath(f, f.hitCause || 'hit', f.hitX, f.hitY);
    addHeat();
  }

  function hurtFolk(f, dmg, sx, sy, cause) {
    if (!f || !f.alive || state !== 'play') return;
    f.hp -= dmg;
    f.flash = 0.1;
    f.hit = 0.16;
    f.hitCause = cause || 'hit';
    f.hitX = sx;
    f.hitY = sy;
    const dx = f.x - sx;
    const dy = f.y - sy;
    const len = Math.hypot(dx, dy) || 1;
    f.kvx += (dx / len) * 150;
    f.kvy += (dy / len) * 150;
    f.panic = 1.5;
    f.vx = (dx / len) * 86;
    f.vy = (dy / len) * 86;
    if (goreOn) bloodSpurt(f.x, f.y, sx, sy, 3);
    if (globalTime - sfx.hitAt > 0.04) {
      sfx.hitAt = globalTime;
      sfx.hit();
    }
    if (f.hp <= 0) downFolk(f);
  }

  function addHeat() {
    wanted += 1;
    if (wanted < 8 || wantedCool > 0 || state !== 'play') return;
    wantedCool = 30;
    wanted = Math.max(0, wanted - 4);
    banner.textContent = 'HEAT IS UP — MORE COPS';
    banner.hidden = false;
    banner.classList.remove('pop');
    void banner.offsetWidth;
    banner.classList.add('pop');
    bannerTimer = 2.4;
    const extra = 1;
    for (let i = 0; i < extra; i++) {
      if (livingCount() >= MAX_ENEMIES) break;
      const spot = randomSpawnPoint();
      if (spot) enemies.push(makeEnemy('cop', spot.x, spot.y));
    }
  }

  function shoveTraffic(x, y, radius, power) {
    for (let i = 0; i < traffic.length; i++) {
      const c = traffic[i];
      const dx = c.x - x;
      const dy = c.y - y;
      const reach = radius + (c.radius || 12);
      if (dx * dx + dy * dy > reach * reach) continue;
      const len = Math.hypot(dx, dy) || 1;
      c.shoveX = (c.shoveX || 0) + (dx / len) * power;
      c.shoveY = (c.shoveY || 0) + (dy / len) * power;
      c.braking = 0.5;
    }
  }

  function hurtStreet(p, dmg, sx, sy) {
    if (!p || !p.alive) return;
    p.hp -= dmg;
    p.hit = 0.12;
    const dx = p.x - sx;
    const dy = p.y - sy;
    const len = Math.hypot(dx, dy) || 1;
    p.vx += (dx / len) * 70;
    p.vy += (dy / len) * 70;
    p.ang += (dx > 0 ? 0.4 : -0.4);
    if (p.hp > 0) {
      burst(p.x, p.y, '#fff6c8', 3);
      return;
    }
    p.alive = false;
    p.dying = 0.7;
    if (p.kind === 'hydrant') {
      p.spray = 1.5;
      arcBit(p.x, p.y - 8, '#9eecff', 8);
      arcBit(p.x, p.y - 6, '#5ce1e6', 6);
    } else if (p.kind === 'bin') {
      arcBit(p.x, p.y, '#8aaa70', 4);
      arcBit(p.x, p.y, '#c8b89a', 4);
      puff(p.x, p.y, 4);
    } else {
      arcBit(p.x, p.y, '#ff8a3d', 3);
      puff(p.x, p.y, 3);
    }
  }

  function overlapCircle(ax, ay, ar, bx, by, br) {
    const dx = ax - bx;
    const dy = ay - by;
    const reach = ar + br;
    return dx * dx + dy * dy <= reach * reach;
  }

  function hurtPlayer(amount, srcx, srcy) {
    if (!player || player.iframe > 0 || state !== 'play') return;
    const dealt = Math.max(1, Math.round(amount - armorStat()));
    player.hp -= dealt;
    player.iframe = 0.45;
    player.flash = 0.12;
    const dx = player.x - srcx;
    const dy = player.y - srcy;
    const len = Math.hypot(dx, dy) || 1;
    player.kvx += (dx / len) * 130;
    player.kvy += (dy / len) * 130;
    addShake(4);
    sfx.hurt();
    if (player.hp <= 0) {
      player.hp = 0;
      puff(player.x, player.y, 6);
      die();
    }
  }

  function dropGem(x, y, value) {
    gems.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 46,
      vy: (Math.random() - 0.5) * 46,
      value: value,
      phase: Math.random() * 6,
      alive: true,
    });
    if (gems.length > 140) {
      let far = 0;
      let best = -1;
      for (let i = 0; i < gems.length; i++) {
        const dx = gems[i].x - player.x;
        const dy = gems[i].y - player.y;
        const d = dx * dx + dy * dy;
        if (d > best) {
          best = d;
          far = i;
        }
      }
      gems.splice(far, 1);
    }
  }

  function gainXp(v) {
    if (!player || player.hp <= 0) return;
    player.xp += v * xpMul();
    while (player.xp >= player.next) {
      player.xp -= player.next;
      player.level += 1;
      player.next = xpFor(player.level);
      pending += 1;
    }
    if (pending > 0 && state === 'play') openLevel();
  }

  function pulse(x, y, radius, dmg, color) {
    waves.push({ x: x, y: y, r: radius, life: 0.28, max: 0.28, color: color });
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.alive) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const reach = radius + e.radius;
      if (dx * dx + dy * dy <= reach * reach) hurtEnemy(e, dmg, x, y, 'boom');
    }
    for (let i = 0; i < folk.length; i++) {
      const f = folk[i];
      if (!f.alive) continue;
      if (overlapCircle(f.x, f.y, f.radius, x, y, radius)) hurtFolk(f, dmg, x, y, 'boom');
    }
    for (let i = 0; i < street.length; i++) {
      const p = street[i];
      if (!p.alive) continue;
      if (overlapCircle(p.x, p.y, p.radius, x, y, radius)) hurtStreet(p, Math.max(1, dmg * 0.5), x, y);
    }
    shoveTraffic(x, y, radius, 120);
  }

  function nearest(n, maxDist) {
    const list = [];
    const max2 = maxDist * maxDist;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.alive) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const d = dx * dx + dy * dy;
      if (d <= max2) list.push({ e: e, d: d });
    }
    list.sort((a, b) => a.d - b.d);
    const out = [];
    for (let i = 0; i < list.length && i < n; i++) out.push(list[i].e);
    return out;
  }

  function livingCount() {
    let n = 0;
    for (let i = 0; i < enemies.length; i++) if (enemies[i].alive && enemies[i].type !== 'boss') n++;
    return n;
  }

  function pickType() {
    const r = Math.random();
    if (elapsed < 32) return 'zombie';
    if (elapsed < 60) return r < 0.82 ? 'zombie' : 'cop';
    if (elapsed > 110 && r < 0.05) return 'alfa';
    if (r < 0.46) return 'zombie';
    if (r < 0.76) return 'cop';
    return 'dealer';
  }

  function randomSpawnPoint() {
    for (let i = 0; i < 30; i++) {
      const side = i % 4;
      let x = 0;
      let y = 0;
      if (side === 0) { x = cam.x - 12; y = cam.y + Math.random() * view.h; }
      else if (side === 1) { x = cam.x + view.w + 12; y = cam.y + Math.random() * view.h; }
      else if (side === 2) { y = cam.y - 12; x = cam.x + Math.random() * view.w; }
      else { y = cam.y + view.h + 12; x = cam.x + Math.random() * view.w; }
      const dx = x - player.x;
      const dy = y - player.y;
      if (dx * dx + dy * dy < 90 * 90) continue;
      const spot = findOpen(x, y, 7);
      if (spot) return spot;
    }
    return null;
  }

  function updatePlayer(dt) {
    player.iframe = Math.max(0, player.iframe - dt);
    player.flash = Math.max(0, player.flash - dt);
    player.cast = Math.max(0, (player.cast || 0) - dt);
    player.swing = Math.max(0, (player.swing || 0) - dt);
    const regen = regenStat();
    if (regen > 0 && player.hp < player.maxHp && player.hp > 0) {
      player.hp = Math.min(player.maxHp, player.hp + regen * dt);
    }
    const m = readMove();
    if (m.x || m.y) {
      moved = true;
      player.moving = true;
      if (Math.abs(m.x) > 0.2) player.facing = m.x < 0 ? -1 : 1;
      setDir(player, m.x, m.y);
      aimX = m.x;
      aimY = m.y;
    } else {
      player.moving = false;
    }
    player.kvx *= Math.exp(-12 * dt);
    player.kvy *= Math.exp(-12 * dt);
    const wishX = m.x * speedStat();
    const wishY = m.y * speedStat();
    const accel = (m.x || m.y) ? 10 : 14;
    const blend = 1 - Math.exp(-accel * dt);
    player.vx += (wishX - player.vx) * blend;
    player.vy += (wishY - player.vy) * blend;
    if (!m.x && !m.y && Math.hypot(player.vx, player.vy) < 8) {
      player.vx = 0;
      player.vy = 0;
    }
    moveBody(player, (player.vx + player.kvx) * dt, (player.vy + player.kvy) * dt);
  }

  function updateWeapons(dt) {
    const len = Math.hypot(aimX, aimY);
    let ax = aimX;
    let ay = aimY;
    if (len < 0.2) {
      const t = nearest(1, 420)[0];
      if (t) {
        ax = t.x - player.x;
        ay = t.y - player.y;
      } else {
        ax = player.facing;
        ay = 0;
      }
    }
    const al = Math.hypot(ax, ay) || 1;
    ax /= al;
    ay /= al;

    const crystal = weapons.crystal;
    crystal.t -= dt;
    if (crystal.t <= 0) {
      const count = crystal.countLv;
      const targets = nearest(count, 360);
      if (!targets.length) {
        crystal.t = 0.12;
      } else {
        crystal.t = crystalCd();
        swing('crystal');
        setDir(player, ax, ay);
        sfx.shoot(820);
        arcBit(player.x, player.y, '#e6c14a', 1);
        const base = Math.atan2(targets[0].y - player.y, targets[0].x - player.x);
        pistolFx(base);
        for (let i = 0; i < count; i++) {
          if (shots.length > 160) break;
          let ang;
          if (i < targets.length) ang = Math.atan2(targets[i].y - player.y, targets[i].x - player.x);
          else ang = base + (i - (count - 1) / 2) * 0.22;
          shots.push({
            kind: 'crystal',
            x: player.x,
            y: player.y - 2,
            vx: Math.cos(ang) * 300,
            vy: Math.sin(ang) * 300,
            life: 0.75,
            alive: true,
            r: 6,
            dmg: crystalDmg(),
            pierce: crystal.pierceLv,
            seen: new Set(),
          });
        }
      }
    }

    if (weapons.carts) {
      const carts = weapons.carts;
      carts.ang = (carts.ang || 0) + dt * 2.3;
      const n = carts.countLv;
      carts.pos = [];
      for (let i = 0; i < n; i++) {
        const a = carts.ang + (i / n) * Math.PI * 2;
        const x = player.x + Math.cos(a) * 64;
        const y = player.y + Math.sin(a) * 64;
        carts.pos.push({ x: x, y: y, a: a });
        if (isSolid(x, y)) continue;
        for (let k = 0; k < enemies.length; k++) {
          const e = enemies[k];
          if (!e.alive) continue;
          if (globalTime - (e.cartT || 0) < 0.42) continue;
          const dx = e.x - x;
          const dy = e.y - y;
          const reach = 14 + e.radius;
          if (dx * dx + dy * dy <= reach * reach) {
            e.cartT = globalTime;
            hurtEnemy(e, cartDmg(), x, y, 'cart');
            cartClank(x, y);
          }
        }
        for (let k = 0; k < folk.length; k++) {
          const f = folk[k];
          if (!f.alive) continue;
          if (globalTime - (f.cartT || 0) < 0.42) continue;
          if (overlapCircle(f.x, f.y, f.radius, x, y, 14)) {
            f.cartT = globalTime;
            hurtFolk(f, cartDmg(), x, y, 'cart');
            cartClank(x, y);
          }
        }
        for (let k = 0; k < street.length; k++) {
          const pr = street[k];
          if (!pr.alive) continue;
          if (globalTime - (pr.cartT || 0) < 0.42) continue;
          if (overlapCircle(pr.x, pr.y, pr.radius, x, y, 12)) {
            pr.cartT = globalTime;
            hurtStreet(pr, cartDmg(), x, y);
            cartClank(x, y);
          }
        }
      }
    }

    if (weapons.bass) {
      const bass = weapons.bass;
      bass.t -= dt;
      if (bass.t <= 0) {
        bass.t = bassCd();
        swing('bass');
        setDir(player, ax, ay);
        sfx.bass();
        addShake(3);
        bassFx();
        pulse(player.x, player.y, bassRadius(), bassDmg(), '#5ce1e6');
      }
    }

    if (weapons.bottle) {
      const bottle = weapons.bottle;
      bottle.t -= dt;
      if (bottle.t <= 0) {
        bottle.t = 1.15 * Math.pow(0.94, bottle.countLv - 3);
        swing('bottle');
        setDir(player, ax, ay);
        sfx.bottle();
        const n = bottle.countLv;
        const base = Math.atan2(ay, ax);
        bottleFx(base);
        for (let i = 0; i < n; i++) {
          if (shots.length > 160) break;
          const ang = base + (i - (n - 1) / 2) * 0.34;
          shots.push({
            kind: 'bottle',
            x: player.x,
            y: player.y - 2,
            vx: Math.cos(ang) * 210,
            vy: Math.sin(ang) * 210,
            life: 0.55,
            alive: true,
            r: 6,
            dmg: bottleDmg(),
            boom: bottleRadius(),
            pierce: 0,
            seen: null,
          });
        }
      }
    }
  }

  function updateShots(dt) {
    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (!player || Math.abs(p.x - player.x) > 1600 || Math.abs(p.y - player.y) > 1600) {
        p.alive = false;
        continue;
      }
      if (p.life <= 0) {
        p.alive = false;
        if (p.kind === 'bottle') {
          sfx.noise(0.06, 0.04);
          sodaSplash(p.x, p.y);
          pulse(p.x, p.y, p.boom, p.dmg, '#b8ff9a');
        }
        continue;
      }
      for (let k = 0; k < enemies.length; k++) {
        const e = enemies[k];
        if (!e.alive) continue;
        if (p.seen && p.seen.has(e.id)) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const reach = p.r + e.radius;
        if (dx * dx + dy * dy > reach * reach) continue;
        if (p.kind === 'bottle') {
          p.alive = false;
          sfx.noise(0.06, 0.04);
          sodaSplash(p.x, p.y);
          pulse(p.x, p.y, p.boom, p.dmg, '#b8ff9a');
          break;
        }
        p.seen.add(e.id);
        hurtEnemy(e, p.dmg, p.x, p.y, 'shot');
        if (p.seen.size > p.pierce) {
          p.alive = false;
          break;
        }
      }
      if (!p.alive) continue;
      for (let k = 0; k < folk.length; k++) {
        const f = folk[k];
        if (!f.alive) continue;
        if (p.seen && p.seen.has(f.id)) continue;
        if (!overlapCircle(f.x, f.y, f.radius, p.x, p.y, p.r)) continue;
        if (p.kind === 'bottle') {
          p.alive = false;
          sfx.noise(0.06, 0.04);
          sodaSplash(p.x, p.y);
          pulse(p.x, p.y, p.boom, p.dmg, '#b8ff9a');
          break;
        }
        if (p.seen) p.seen.add(f.id);
        hurtFolk(f, p.dmg, p.x, p.y, 'shot');
        if (p.seen && p.seen.size > p.pierce) {
          p.alive = false;
          break;
        }
      }
      if (!p.alive) continue;
      for (let k = 0; k < street.length; k++) {
        const pr = street[k];
        if (!pr.alive) continue;
        if (p.seen && p.seen.has(pr.id)) continue;
        if (!overlapCircle(pr.x, pr.y, pr.radius, p.x, p.y, p.r)) continue;
        if (p.kind === 'bottle') {
          p.alive = false;
          sfx.noise(0.06, 0.04);
          sodaSplash(p.x, p.y);
          pulse(p.x, p.y, p.boom, p.dmg, '#b8ff9a');
          break;
        }
        if (p.seen) p.seen.add(pr.id);
        hurtStreet(pr, p.dmg, p.x, p.y);
        if (p.seen && p.seen.size > p.pierce) p.alive = false;
        break;
      }
      if (p.alive && p.kind !== 'bottle') nudgeTraffic(p.x, p.y, p.r + 8, 36);
    }
  }

  function nudgeTraffic(x, y, radius, power) {
    for (let i = 0; i < traffic.length; i++) {
      const c = traffic[i];
      if (globalTime - (c.nudgeT || 0) < 0.18) continue;
      const dx = c.x - x;
      const dy = c.y - y;
      if (dx * dx + dy * dy > radius * radius) continue;
      c.nudgeT = globalTime;
      const len = Math.hypot(dx, dy) || 1;
      c.shoveX = (c.shoveX || 0) + (dx / len) * power;
      c.shoveY = (c.shoveY || 0) + (dy / len) * power;
    }
  }

  function updateBullets(dt) {
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      if (!b.alive) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || !player || Math.abs(b.x - player.x) > 1600 || Math.abs(b.y - player.y) > 1600) {
        b.alive = false;
        continue;
      }
      const dx = player.x - b.x;
      const dy = player.y - b.y;
      const reach = player.radius + b.r;
      if (dx * dx + dy * dy <= reach * reach) {
        b.alive = false;
        hurtPlayer(b.dmg, b.x, b.y);
      }
    }
  }

  function updateEnemies(dt) {
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      e.flash = Math.max(0, e.flash - dt);
      e.hit = Math.max(0, (e.hit || 0) - dt);
      e.cast = Math.max(0, (e.cast || 0) - dt);
      if (e.dying > 0) {
        e.dying -= dt;
        if (e.dying < 0) e.dying = 0;
        e.kvx *= Math.exp(-4 * dt);
        e.kvy *= Math.exp(-4 * dt);
        if (e.death === 'launch' || e.death === 'gib') moveBody(e, e.kvx * dt, e.kvy * dt);
        continue;
      }
      if (!e.alive) continue;
      if (e.born > 0) {
        e.born -= dt;
        if (e.born < 0) e.born = 0;
        e.moving = false;
        continue;
      }
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      e.facing = nx < 0 ? -1 : 1;
      let vx = nx * e.speed;
      let vy = ny * e.speed;

      if (e.type === 'cop') {
        e.lungeCd -= dt;
        if (e.lunging > 0) {
          e.lunging -= dt;
          vx = e.lx * 108;
          vy = e.ly * 108;
        } else if (e.lungeCd <= 0 && dist < 140) {
          e.lunging = 0.24;
          e.lungeCd = 3.2;
          e.lx = nx;
          e.ly = ny;
          e.cast = 0.16;
        }
      } else if (e.type === 'dealer') {
        if (dist < 88) {
          vx = -nx * e.speed;
          vy = -ny * e.speed;
        } else if (dist < 190) {
          const side = (e.id & 1) ? 1 : -1;
          vx = -ny * side * e.speed;
          vy = nx * side * e.speed;
        }
        e.shootT -= dt;
        if (e.shootT <= 0 && dist < 260 && dist > 36) {
          e.shootT = Math.max(0.85, 2.15 - elapsed * 0.004);
          const sp = 110;
          bullets.push({
            x: e.x,
            y: e.y,
            vx: nx * sp,
            vy: ny * sp,
            life: 1.7,
            r: 6,
            dmg: e.shotDmg,
            alive: true,
          });
          muzzle(e.x + nx * 8, e.y + ny * 6, Math.atan2(ny, nx), '#e2b6ff');
          e.cast = 0.16;
          arcBit(e.x, e.y, '#e6c14a', 1);
          sfx.shoot(210);
        }
      } else if (e.type === 'boss') {
        e.modeT -= dt;
        if (e.mode === 'chase' && e.modeT <= 0) {
          e.mode = 'wind';
          e.modeT = 0.42;
          e.dashx = nx;
          e.dashy = ny;
        } else if (e.mode === 'wind' && e.modeT <= 0) {
          e.mode = 'dash';
          e.modeT = 0.34;
        } else if (e.mode === 'dash' && e.modeT <= 0) {
          e.mode = 'chase';
          e.modeT = 2.1;
        }
        if (e.mode === 'wind') {
          vx = 0;
          vy = 0;
        } else if (e.mode === 'dash') {
          vx = e.dashx * 120;
          vy = e.dashy * 120;
        }
      }

      e.kvx *= Math.exp(-10 * dt);
      e.kvy *= Math.exp(-10 * dt);
      if (e.mvx == null) {
        e.mvx = vx;
        e.mvy = vy;
      }
      const blend = 1 - Math.exp(-8 * dt);
      e.mvx += (vx - e.mvx) * blend;
      e.mvy += (vy - e.mvy) * blend;
      const beforeX = e.x;
      const beforeY = e.y;
      moveBody(e, (e.mvx + e.kvx) * dt, (e.mvy + e.kvy) * dt);
      if (Math.abs(e.x - beforeX) + Math.abs(e.y - beforeY) < 0.2 && dist > 24) e.stuck += dt;
      else e.stuck = 0;
      if (e.stuck > 2.4) {
        const spot = randomSpawnPoint();
        if (spot) {
          e.x = spot.x;
          e.y = spot.y;
          e.stuck = 0;
        }
      }

      e.moving = Math.hypot(e.mvx, e.mvy) > 8;
      setDir(e, e.mvx || nx, e.mvy || ny);
      const tx = player.x - e.x;
      const ty = player.y - e.y;
      const touch = player.radius + e.radius;
      if (e.born <= 0 && tx * tx + ty * ty <= touch * touch) hurtPlayer(e.dmg, e.x, e.y);
    }
  }

  function updateGems(dt) {
    const mr = magnetR();
    for (let i = 0; i < gems.length; i++) {
      const g = gems[i];
      if (!g.alive) continue;
      const dx = player.x - g.x;
      const dy = player.y - g.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < mr) {
        const pull = 200 + (1 - d / mr) * 280;
        g.x += (dx / d) * pull * dt;
        g.y += (dy / d) * pull * dt;
        if (particles.length < 100 && (fxFrame & 3) === 0) {
          particles.push({
            x: g.x,
            y: g.y,
            vx: (Math.random() - 0.5) * 24,
            vy: -16 - Math.random() * 20,
            life: 0.28,
            max: 0.28,
            color: g.value >= 8 ? '#9eecff' : '#fff6c8',
            size: 2,
          });
        }
      } else {
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        g.vx *= Math.exp(-3 * dt);
        g.vy *= Math.exp(-3 * dt);
      }
      if (d < player.radius + 18) {
        g.alive = false;
        burst(g.x, g.y, '#fff6c8', 5);
        if (globalTime - sfx.gemAt > 0.05) {
          sfx.gemAt = globalTime;
          sfx.gem();
        }
        gainXp(g.value);
      }
    }
  }

  function updateParticles(dt) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.grav) {
        p.vy += p.grav * dt;
        p.vx *= Math.exp(-0.8 * dt);
      } else {
        p.vx *= Math.exp(-2 * dt);
        p.vy *= Math.exp(-2 * dt);
      }
    }
    for (let i = 0; i < skids.length; i++) skids[i].life -= dt;
    for (let i = 0; i < waves.length; i++) waves[i].life -= dt;
    for (let i = 0; i < flashes.length; i++) flashes[i].life -= dt;
    for (let i = 0; i < barks.length; i++) {
      barks[i].life -= dt;
      barks[i].y -= 14 * dt;
    }
  }

  function updateSpawn(dt) {
    if (elapsed >= nextBoss) {
      const spot = randomSpawnPoint();
      if (spot) {
        nextBoss += 70;
        enemies.push(makeEnemy('boss', spot.x, spot.y));
        banner.textContent = 'KINGPIN BUSTER IS IN TOWN';
        banner.hidden = false;
        banner.classList.remove('pop');
        void banner.offsetWidth;
        banner.classList.add('pop');
        bannerTimer = 2.7;
        sfx.boss();
        addShake(5);
      }
    }
    spawnT -= dt;
    if (spawnT > 0) return;
    spawnT = Math.max(1.25, 2.45 - elapsed * 0.002);
    const n = 1 + Math.floor(elapsed / 120);
    for (let i = 0; i < n; i++) {
      if (livingCount() >= MAX_ENEMIES) break;
      const spot = randomSpawnPoint();
      if (!spot) break;
      enemies.push(makeEnemy(pickType(), spot.x, spot.y));
    }
  }

  function cleanup() {
    enemies = enemies.filter((e) => e.alive || e.dying > 0);
    shots = shots.filter((p) => p.alive);
    bullets = bullets.filter((b) => b.alive);
    gems = gems.filter((g) => g.alive);
    particles = particles.filter((p) => p.life > 0);
    waves = waves.filter((w) => w.life > 0);
    flashes = flashes.filter((f) => f.life > 0);
    barks = barks.filter((b) => b.life > 0);
    skids = skids.filter((s) => s.life > 0);
    if (skids.length > 100) skids.splice(0, skids.length - 100);
  }

  function update(dt) {
    elapsed += dt;
    updatePlayer(dt);
    updateWeapons(dt);
    updateShots(dt);
    updateBullets(dt);
    if (state !== 'play') {
      cleanup();
      return;
    }
    updateEnemies(dt);
    if (state !== 'play') {
      cleanup();
      return;
    }
    updateGems(dt);
    if (state !== 'play') {
      cleanup();
      return;
    }
    updateParticles(dt);
    updateSpawn(dt);
    cleanup();
  }

  function gemSprite(value, glint) {
    const set = value >= 8 ? spr.gemBig : value >= 3 ? spr.gemMid : spr.gem;
    return set[glint ? 1 : 0];
  }

  function drawSprite(img, x, y, flip, foot) {
    const dw = img.worldW || img.width;
    const dh = img.worldH || img.height;
    const dx = Math.round((x - cam.x) * drawScale) / drawScale;
    const dy = Math.round((y - cam.y) * drawScale) / drawScale;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(dx, dy);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -dw / 2, -dh + foot, dw, dh);
    ctx.restore();
  }

  function drawCentered(img, x, y) {
    const dw = img.worldW || img.width;
    const dh = img.worldH || img.height;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      img,
      Math.round(x - cam.x - dw / 2),
      Math.round(y - cam.y - dh / 2),
      dw,
      dh
    );
  }

  function actorSprite(ent, frame) {
    const white = ent.flash > 0;
    if (ent === player) return white ? spr.white.player[frame] : spr.player[frame];
    if (ent.type === 'boss') {
      const f = frame % spr.boss.length;
      if (white) return spr.white.boss[f];
      if (ent.mode === 'wind') return spr.bossHot[f];
      return spr.boss[f];
    }
    const key = ent.type === 'alfa' ? 'alfa' : ent.type;
    const set = white ? spr.white[key] : spr[key];
    if (!set) return spr.zombie[frame];
    return set[frame] || set;
  }

  function drawShadow(x, y, rw) {
    const cx = Math.round((x - cam.x) * ART) / ART;
    const cy = Math.round((y - cam.y) * ART) / ART;
    ctx.fillStyle = 'rgba(8, 8, 10, 0.42)';
    const rx = Math.max(2, rw);
    const ry = 2;
    for (let iy = -ry; iy <= ry; iy += 0.5) {
      const t = 1 - (iy * iy) / (ry * ry);
      if (t <= 0) continue;
      const hx = Math.sqrt(t) * rx;
      ctx.fillRect(cx - hx, cy + iy, hx * 2, 0.5);
    }
  }

  function propLift(sortY) {
    const mid = cam.y + view.h * 0.5;
    return Math.max(-6, Math.min(6, Math.round((sortY - mid) * 0.04)));
  }

  function propOnScreen(pr) {
    const pw = pr.w || pr.img.width;
    const ph = pr.h || pr.img.height;
    const top = pr.sortY - ph;
    const extra = pr.kind === 'build' ? 150 : 0;
    const bottom = pr.sortY + extra;
    return pr.x + pw + extra > cam.x - 40 && pr.x < cam.x + view.w + 40 && bottom > cam.y - 30 && top < cam.y + view.h + 80;
  }

  function drawProp(pr) {
    if (pr.kind === 'car' && pr.ang != null) {
      drawVehicle(pr);
      return;
    }
    if (pr.kind === 'build' && pr.hand && pr.roof && pr.wallFront) {
      drawHandBlock(pr);
      return;
    }
    if (pr.kind === 'tree' && pr.img && pr.img.hand) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(pr.img, pr.x - cam.x, pr.sortY - cam.y - pr.h, pr.w, pr.h);
      return;
    }
    if (pr.kind === 'build' && pr.roof) {
      drawBlock(pr);
      return;
    }
    const lift = pr.kind === 'tree' ? 0 : propLift(pr.sortY);
    const pw = pr.w || pr.img.width;
    const ph = pr.h || pr.img.height;
    const x = Math.round(pr.x - cam.x);
    const y = Math.round(pr.sortY - cam.y - ph + lift);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(pr.img, x, y, pw, ph);
    if (pr.kind === 'lamp') {
      const pulse = 0.55 + Math.sin(globalTime * 4 + pr.x) * 0.2;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#fff3c0';
      ctx.fillRect(x + pw * 0.22, y + 6, pw * 0.56, 4);
      ctx.globalAlpha = 1;
    } else if (pr.kind === 'fountain') {
      const r = 4 + ((globalTime * 8) % 7);
      const cx = Math.round(pr.x + pw / 2 - cam.x);
      const cy = Math.round(pr.sortY - cam.y - 30);
      ctx.fillStyle = 'rgba(80, 210, 230, 0.45)';
      ctx.fillRect(x + pw * 0.28, y + ph * 0.42 + Math.sin(globalTime * 6) * 1.2, pw * 0.44, 5);
      ctx.strokeStyle = '#d8fbff';
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy + 4, Math.max(2, r * 0.6), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (pr.kind === 'car') {
      const pulse = 0.55 + Math.sin(globalTime * 10 + pr.x) * 0.45;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#fff6c8';
      ctx.fillRect(x + pw - 7, y + ph * 0.32, 5, 3);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#ff4d6d';
      ctx.fillRect(x + 2, y + ph * 0.32, 4, 3);
      ctx.globalAlpha = 1;
    } else if (pr.kind === 'build' && quality !== 'low') {
      const flick = Math.sin(globalTime * 22 + pr.x) > 0.82 ? 0.2 : (0.55 + Math.sin(globalTime * 7 + pr.y) * 0.35);
      ctx.globalAlpha = flick;
      ctx.fillStyle = pr.neon || '#ff4d8d';
      ctx.fillRect(x + pw * 0.42, y + ph - 34, 18, 4);
      ctx.globalAlpha = 1;
      if (!reduceMotion && ((pr.x / 16) | 0) % 3 === 0) {
        const wave = Math.sin(globalTime * 3 + pr.x) * 0.35;
        ctx.save();
        ctx.translate(x + 16, y + 26);
        ctx.rotate(wave);
        ctx.fillStyle = ((pr.x / 32) | 0) % 2 ? '#ff4d8d' : '#5ce1e6';
        ctx.fillRect(0, 0, 12, 7);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(0, 0, 12, 2);
        ctx.restore();
      }
    }
  }

  function actorFrame(ent) {
    if (ent === player && window.GTAPlayer && window.GTAPlayer.ready) {
      const hero = window.GTAPlayer.frame(player, globalTime);
      if (hero) return hero;
    }
    const pose = ent.pose || 'down';
    const moving = ent === player ? player.moving : ent.moving !== false;
    const type = ent.type || 'player';
    if (spr.cast && spr.cast[type]) {
      const pack = spr.cast[type];
      const white = ent.flash > 0 && spr.flash && spr.flash[type];
      const hot = ent.type === 'boss' && ent.mode === 'wind' && spr.bossHotCast;
      const book = hot ? spr.bossHotCast : (white ? spr.flash[type] : pack.walk);
      if ((ent.cast > 0 || (ent === player && player.cast > 0)) && pack.attack && pack.attack[pose]) {
        const left = ent === player ? player.cast : ent.cast;
        const af = left > 0.09 ? 0 : 1;
        return pack.attack[pose][af] || pack.attack[pose][0];
      }
      const row = book[pose] || book.down;
      const n = row.length || 1;
      let frame = 0;
      if (moving) {
        const fast = (ent.panic || 0) > 0 || (ent === player && Math.hypot(player.vx || 0, player.vy || 0) > 96);
        frame = ((globalTime * (fast ? 14 : 10) + (ent.phase || 0)) | 0) % n;
      } else {
        frame = ((globalTime * 1.25 + (ent.phase || 0)) | 0) % 8 < 5 ? 0 : Math.min(4, n - 1);
      }
      return row[frame % n];
    }
    const len = ent.type === 'boss' ? spr.boss.length : (spr[ent.type] ? spr[ent.type].length : spr.player.length);
    return actorSprite(ent, ((globalTime * 8 + (ent.phase || 0)) | 0) % len);
  }

  function drawActor(ent) {
    if (!onScreen(ent.x, ent.y, 48)) return;
    if (ent === player && player.iframe > 0 && ((globalTime * 24) | 0) % 2 === 0) return;
    const img = actorFrame(ent);
    if (!img) return;
    const foot = 2;
    const gubbeEarly = ent === player && window.GTAPlayer && window.GTAPlayer.ready;
    const breath = (!ent.moving && !(ent === player && player.moving) && !reduceMotion) ? (((globalTime * 2) | 0) % 2) * -1 : 0;
    const hop = gubbeEarly && window.GTAPlayer.bob && !reduceMotion
      ? window.GTAPlayer.bob(player, globalTime)
      : breath;
    if (!gubbeEarly) drawShadow(ent.x, ent.y + 1, Math.max(4, ((ent.radius || 6) * 0.85) | 0));
    ctx.save();
    const dx = Math.round((ent.x - cam.x) * drawScale) / drawScale;
    const dy = Math.round((ent.y - cam.y + hop) * drawScale) / drawScale;
    ctx.translate(dx, dy);
    const gubbe = gubbeEarly;
    if (gubbe ? player.facing > 0 : (spr.cast ? ent.flip : ent.facing < 0)) ctx.scale(-1, 1);
    if ((ent.hit || 0) > 0 && !(ent.dying > 0)) {
      const k = Math.min(1, ent.hit / 0.16);
      ctx.translate(-2 * k, -1 * k);
      ctx.scale(1 + k * 0.12, Math.max(0.75, 1 - k * 0.16));
    }
    if (ent.gibbed && goreOn) {
      const t = 1 - ent.dying / (ent.dieMax || 0.5);
      ctx.rotate(t * 2.2);
      ctx.scale(0.4, 0.28);
      ctx.globalAlpha = Math.max(0, 0.4 - t * 0.4);
    } else if (ent.dying > 0) {
      const t = 1 - ent.dying / (ent.dieMax || 0.5);
      const style = ent.death || 'fall';
      if (style === 'spin') {
        ctx.rotate(t * 5);
        ctx.scale(1, Math.max(0.35, 1 - t * 0.45));
      } else if (style === 'crumple') {
        ctx.rotate(t * 0.35);
        ctx.scale(1.1, Math.max(0.16, 1 - t * 0.8));
      } else if (style === 'launch') {
        ctx.rotate(t * 2.6);
        ctx.translate(0, -12 * (1 - t));
      } else if (style === 'partial') {
        ctx.rotate(t * 1.2);
        ctx.scale(1, Math.max(0.4, 1 - t * 0.4));
      } else {
        ctx.rotate(-t * 1.2);
        ctx.scale(1.05, Math.max(0.42, 1 - t * 0.35));
      }
      ctx.globalAlpha = Math.max(0, 1 - t * 0.92);
    } else if (ent.born > 0) {
      const t = 1 - ent.born / (ent.bornMax || 0.3);
      ctx.scale(0.35 + 0.65 * t, 0.15 + 0.85 * t);
      ctx.globalAlpha = 0.35 + 0.65 * t;
    } else if (ent.flash > 0) {
      const k = Math.min(1, ent.flash / 0.12);
      ctx.scale(1 + k * 0.22, Math.max(0.7, 1 - k * 0.18));
    }
    const dw = img.worldW || img.width;
    const dh = img.worldH || img.height;
    ctx.imageSmoothingEnabled = !!img.hand;
    if (img.hand) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, -dw / 2, -dh + foot, dw, dh);
    if (ent === player) drawHeldWeapon(dw, dh, foot);
    ctx.restore();
  }

  function drawHeldWeapon(dw, dh, foot) {
    const kind = player.hold || 'crystal';
    const wimg = kind === 'bottle' ? spr.bottle : kind === 'bass' ? spr.speaker : kind === 'carts' ? spr.cart : spr.crystal;
    if (!wimg) return;
    const ww = wimg.worldW || 8;
    const wh = wimg.worldH || 8;
    const hx = -dw / 2 + (10 / 40) * dw;
    const hy = -dh + foot + (28 / 60) * dh;
    const t = player.swing > 0 ? player.swing / (player.swingMax || 0.42) : 0;
    let ox = 0;
    let oy = Math.round(Math.sin(globalTime * 5));
    if (kind === 'crystal' && t > 0) ox = Math.round(t * 3);
    else if (kind === 'bottle' && t > 0) ox = Math.round(-6 * (1 - t) + 3 * t);
    else if (kind === 'bass' && t > 0) oy = Math.round(Math.sin((1 - t) * Math.PI * 2) * 2);
    else if (kind === 'carts') ox = Math.round(Math.sin(globalTime * 7) * 2);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(wimg, Math.round(hx + ox - ww / 2), Math.round(hy + oy - wh / 2), ww, wh);
  }

  function onScreen(x, y, m) {
    return x > cam.x - m && y > cam.y - m && x < cam.x + view.w + m && y < cam.y + view.h + m;
  }

  function findSidewalk() {
    if (!player) return null;
    const ox = tileOf(player.x);
    const oy = tileOf(player.y);
    for (let i = 0; i < 14; i++) {
      const tx = ox + ((Math.random() * 28) | 0) - 14;
      const ty = oy + ((Math.random() * 28) | 0) - 14;
      if (!chunkOfTile(tx, ty)) continue;
      if (computeTile(tx, ty) !== T_SIDE) continue;
      const x = (tx + 0.5) * TILE;
      const y = (ty + 0.5) * TILE;
      if (isSolid(x, y)) continue;
      return { x: x, y: y };
    }
    return null;
  }

  function makeFolk(x, y) {
    const ang = Math.random() * Math.PI * 2;
    const looks = ['civ', 'civ2', 'civ3', 'civ4', 'civ5'];
    let type = looks[(Math.random() * looks.length) | 0];
    if (!spr.cast || !spr.cast[type]) type = 'civ';
    return {
      id: nextId++,
      type: type,
      x: x,
      y: y,
      vx: Math.cos(ang) * 22,
      vy: Math.sin(ang) * 22,
      kvx: 0,
      kvy: 0,
      hp: 8,
      radius: 6,
      pose: 'down',
      flip: false,
      facing: 1,
      moving: true,
      phase: Math.random() * 6,
      alive: true,
      flash: 0,
      hit: 0,
      comic: 0,
      panic: 0,
      cast: 0,
      born: 0,
      dying: 0,
      dieMax: 0.85,
    };
  }

  function scareFolk(f) {
    let sx = 0;
    let sy = 0;
    let threat = false;
    if (player && (player.cast || 0) > 0) {
      const dx = f.x - player.x;
      const dy = f.y - player.y;
      if (dx * dx + dy * dy < 130 * 130) {
        sx = dx;
        sy = dy;
        threat = true;
      }
    }
    if (!threat) {
      for (let i = 0; i < shots.length; i++) {
        const p = shots[i];
        if (!p.alive) continue;
        const dx = f.x - p.x;
        const dy = f.y - p.y;
        if (dx * dx + dy * dy < 78 * 78) {
          sx = dx;
          sy = dy;
          threat = true;
          break;
        }
      }
    }
    if (!threat) {
      for (let i = 0; i < waves.length; i++) {
        const w = waves[i];
        const dx = f.x - w.x;
        const dy = f.y - w.y;
        const reach = (w.r || 40) + 20;
        if (dx * dx + dy * dy < reach * reach) {
          sx = dx;
          sy = dy;
          threat = true;
          break;
        }
      }
    }
    if (!threat) return;
    const len = Math.hypot(sx, sy) || 1;
    f.panic = Math.max(f.panic || 0, 1.15);
    f.vx = (sx / len) * 84;
    f.vy = (sy / len) * 84;
  }

  function anchorPoint() {
    if (player) return { x: player.x, y: player.y };
    return { x: (9 + 0.5) * TILE, y: (4 + 0.5) * TILE };
  }

  function nearAnchor(x, y) {
    const a = anchorPoint();
    const far = (UNLOAD_R + 0.4) * BLOCK;
    return Math.abs(x - a.x) < far && Math.abs(y - a.y) < far;
  }

  function spawnTrafficCar(cell, n) {
    const model = handCarName(hash(n + 3, cell.x | 0));
    const color = CAR_COLORS[hash(n, cell.y | 0) % CAR_COLORS.length];
    const img = vehicleSprite(model, color);
    const ang = Math.atan2(cell.vy, cell.vx);
    const carScale = img.hand ? 1 : 0.84;
    const cruise = 46 + (n % 4) * 6;
    traffic.push({
      x: cell.x,
      y: cell.y,
      ang: ang,
      vx: Math.cos(ang),
      vy: Math.sin(ang),
      speed: cruise,
      turnCool: 0,
      phase: n * 1.7,
      model: model,
      img: img,
      spriteW: (img.worldW || 36) * carScale,
      spriteH: (img.worldH || 72) * carScale,
      radius: 14,
      vel: cruise,
      cruise: cruise,
      braking: 0,
      steer: 0,
      shoveX: 0,
      shoveY: 0,
    });
  }

  function laneCells(ch) {
    const lanes = [];
    const ox = ch.bx * PERIOD;
    const oy = ch.by * PERIOD;
    for (let ly = 0; ly < PERIOD; ly++) {
      for (let lx = 0; lx < PERIOD; lx++) {
        if (ch.solid[ly * PERIOD + lx]) continue;
        const tx = ox + lx;
        const ty = oy + ly;
        const x = (tx + 0.5) * TILE;
        const y = (ty + 0.5) * TILE;
        if (ly === 2 && lx > TW + 2 && lx < PERIOD - 3) lanes.push({ x: x, y: y, vx: 52, vy: 0 });
        else if (ly === 3 && lx > TW + 2 && lx < PERIOD - 3) lanes.push({ x: x, y: y, vx: -48, vy: 0 });
        else if (lx === 2 && ly > TW + 2 && ly < PERIOD - 3) lanes.push({ x: x, y: y, vx: 0, vy: 50 });
        else if (lx === 3 && ly > TW + 2 && ly < PERIOD - 3) lanes.push({ x: x, y: y, vx: 0, vy: -46 });
      }
    }
    return lanes;
  }

  function refillAmbience() {
    const capCars = 8;
    const capStreet = 18;
    for (let i = traffic.length - 1; i >= 0; i--) {
      if (!nearAnchor(traffic[i].x, traffic[i].y)) traffic.splice(i, 1);
    }
    for (let i = street.length - 1; i >= 0; i--) {
      if (!nearAnchor(street[i].x, street[i].y)) street.splice(i, 1);
    }
    for (let i = pigeons.length - 1; i >= 0; i--) {
      if (!nearAnchor(pigeons[i].homeX, pigeons[i].homeY)) pigeons.splice(i, 1);
    }
    const list = [];
    for (const ch of chunks.values()) list.push(ch);
    list.sort((a, b) => (a.bx - b.bx) || (a.by - b.by));
    let n = traffic.length;
    for (let i = 0; i < list.length && traffic.length < capCars; i++) {
      const lanes = laneCells(list[i]);
      if (!lanes.length) continue;
      const cell = lanes[hash(list[i].bx + 4, list[i].by + 9) % lanes.length];
      let taken = false;
      for (let c = 0; c < traffic.length; c++) {
        const dx = traffic[c].x - cell.x;
        const dy = traffic[c].y - cell.y;
        if (dx * dx + dy * dy < 70 * 70) taken = true;
      }
      if (taken) continue;
      spawnTrafficCar(cell, n++);
    }
    for (let i = 0; i < list.length && street.length < capStreet; i++) {
      const ch = list[i];
      const key = chunkKey(ch.bx, ch.by);
      let has = false;
      for (let s = 0; s < street.length; s++) if (street[s].chunk === key) has = true;
      if (has) continue;
      const ox = ch.bx * PERIOD;
      const oy = ch.by * PERIOD;
      let placed = false;
      for (let ly = 1; ly < PERIOD - 1 && !placed; ly++) {
        for (let lx = 1; lx < PERIOD - 1 && !placed; lx++) {
          if (ch.tiles[ly * PERIOD + lx] !== T_SIDE) continue;
          const tx = ox + lx;
          const ty = oy + ly;
          if (hash(tx, ty) % 17 !== 4) continue;
          const x = (tx + 0.5) * TILE;
          const y = (ty + 0.5) * TILE;
          if (isSolid(x, y)) continue;
          const roll = hash(tx + 1, ty) % 3;
          const kind = roll === 0 ? 'hydrant' : roll === 1 ? 'bin' : 'cone';
          const img = kind === 'hydrant' ? spr.hydrant : kind === 'bin' ? spr.bin : spr.cone;
          if (!img) continue;
          street.push({
            id: nextId++,
            kind: kind,
            chunk: key,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            hp: kind === 'hydrant' ? 3 : kind === 'bin' ? 2 : 1,
            maxHp: kind === 'hydrant' ? 3 : kind === 'bin' ? 2 : 1,
            radius: kind === 'cone' ? 4 : 6,
            alive: true,
            dying: 0,
            ang: (hash(tx, ty) % 5) * 0.2,
            spray: 0,
            hit: 0,
            img: img,
          });
          placed = true;
        }
      }
    }
    if (pigeons.length < 4) {
      for (let i = 0; i < fountains.length && pigeons.length < 4; i++) {
        const f = fountains[i];
        pigeons.push({
          x: f.x - 8, y: f.y + 12, homeX: f.x - 8, homeY: f.y + 12,
          vx: 0, vy: 0, flying: false, phase: i,
        });
      }
    }
  }

  function initAmbience() {
    traffic = [];
    pigeons = [];
    folk = [];
    street = [];
    refillAmbience();
  }

  function updateAmbience(dt) {
    if (!player) return;
    const quiet = quality === 'low' || reduceMotion;
    const folkCap = quiet ? 6 : 16;
    let livingFolk = 0;
    for (let i = 0; i < folk.length; i++) if (folk[i].alive) livingFolk += 1;
    if (livingFolk < folkCap && (fxFrame % 18) === 0) {
      const spot = findSidewalk();
      if (spot) folk.push(makeFolk(spot.x, spot.y));
    }
    for (let i = folk.length - 1; i >= 0; i--) {
      const f = folk[i];
      f.flash = Math.max(0, (f.flash || 0) - dt);
      f.hit = Math.max(0, (f.hit || 0) - dt);
      f.comic = Math.max(0, (f.comic || 0) - dt);
      f.panic = Math.max(0, (f.panic || 0) - dt);
      f.kvx *= Math.exp(-8 * dt);
      f.kvy *= Math.exp(-8 * dt);
      if (f.dying > 0) {
        f.dying -= dt;
        moveBody(f, f.kvx * dt, f.kvy * dt);
        if (f.dying <= 0) folk.splice(i, 1);
        continue;
      }
      if (!f.alive) {
        folk.splice(i, 1);
        continue;
      }
      if (state === 'play') scareFolk(f);
      f.pauseT = (f.pauseT == null ? 2.2 : f.pauseT) - dt;
      const idling = f.panic <= 0 && f.pauseT < 0 && f.pauseT > -1.15;
      if (idling) {
        f.moving = false;
        if (Math.hypot(f.kvx, f.kvy) > 4) moveBody(f, f.kvx * dt, f.kvy * dt);
        continue;
      }
      if (f.pauseT <= -1.15) f.pauseT = 2.2 + Math.random() * 3.2;
      const speed = f.panic > 0 ? 84 : 22;
      const len = Math.hypot(f.vx, f.vy) || 1;
      f.vx = (f.vx / len) * speed;
      f.vy = (f.vy / len) * speed;
      const beforeX = f.x;
      const beforeY = f.y;
      moveBody(f, (f.vx + f.kvx) * dt, (f.vy + f.kvy) * dt);
      if (Math.abs(f.x - beforeX) + Math.abs(f.y - beforeY) < 0.15) {
        const ang = Math.random() * Math.PI * 2;
        f.vx = Math.cos(ang) * speed;
        f.vy = Math.sin(ang) * speed;
      }
      const tx = tileOf(f.x);
      const ty = tileOf(f.y);
      if (computeTile(tx, ty) !== T_SIDE) {
        f.vx = -f.vx;
        f.vy = -f.vy;
        if (f.panic > 0) {
          f.x = beforeX;
          f.y = beforeY;
        }
      }
      f.moving = true;
      setDir(f, f.vx + f.kvx, f.vy + f.kvy);
      if (Math.hypot(f.x - player.x, f.y - player.y) > Math.max(view.w, view.h) * 1.2) {
        const spot = findSidewalk();
        if (spot) {
          f.x = spot.x;
          f.y = spot.y;
        }
      }
    }
    wantedCool = Math.max(0, wantedCool - dt);
    if (wanted > 0 && (fxFrame % 150) === 0) wanted = Math.max(0, wanted - 1);
    for (let i = street.length - 1; i >= 0; i--) {
      const p = street[i];
      p.hit = Math.max(0, (p.hit || 0) - dt);
      p.vx *= Math.exp(-3 * dt);
      p.vy *= Math.exp(-3 * dt);
      if (p.spray > 0) {
        p.spray -= dt;
        if ((fxFrame & 1) === 0) arcBit(p.x, p.y - 8, (fxFrame & 2) ? '#9eecff' : '#5ce1e6', 2);
      }
      if (p.dying > 0) {
        p.dying -= dt;
        p.ang += dt * 4;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.dying <= 0) {
          p.respawn = 8 + (i % 5);
          p.dying = 0;
        }
        continue;
      }
      if (!p.alive) {
        p.respawn = (p.respawn || 8) - dt;
        if (p.respawn <= 0) {
          p.alive = true;
          p.hp = p.maxHp;
          p.vx = 0;
          p.vy = 0;
          p.spray = 0;
          p.ang = 0;
        }
        continue;
      }
      if (Math.hypot(p.vx, p.vy) > 6) {
        const nx = p.x + p.vx * dt;
        const ny = p.y + p.vy * dt;
        if (!isSolid(nx, ny)) {
          p.x = nx;
          p.y = ny;
          p.ang += p.vx * dt * 0.08;
        } else {
          p.vx *= -0.4;
          p.vy *= -0.4;
        }
      }
    }
    for (let i = 0; i < traffic.length; i++) steerTraffic(traffic[i], dt);
    separateCast();
    bumpCars();
    bumpStreet();
    if (quiet) return;
    for (let i = 0; i < pigeons.length; i++) {
      const p = pigeons[i];
      const dx = player.x - p.x;
      const dy = player.y - p.y;
      if (!p.flying && dx * dx + dy * dy < 70 * 70) {
        p.flying = true;
        const away = p.x - player.x;
        p.vx = (away === 0 ? 24 : away);
        p.vy = -48 - (i % 3) * 8;
      }
      if (p.flying) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 12 * dt;
        if (p.y < cam.y - 90 || p.x < cam.x - 220 || p.x > cam.x + view.w + 220) {
          p.flying = false;
          p.x = p.homeX;
          p.y = p.homeY;
          p.vx = 0;
          p.vy = 0;
        }
      }
    }
    if ((fxFrame & 1) === 0 && particles.length < 90) {
      let steamed = 0;
      for (let i = 0; i < manholes.length; i++) {
        const m = manholes[i];
        if (!onScreen(m.x, m.y, 8)) continue;
        if (particles.length >= 90 || steamed >= 2) break;
        steamed += 1;
        particles.push({
          x: m.x + (Math.random() * 6 - 3),
          y: m.y,
          vx: (Math.random() - 0.5) * 8,
          vy: -18 - Math.random() * 14,
          life: 0.7,
          max: 0.7,
          color: '#d0d4de',
          size: 2,
        });
      }
    }
  }

  function drawSkids() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#16141c';
    for (let i = 0; i < skids.length; i++) {
      const s = skids[i];
      if (!onScreen(s.x, s.y, 16)) continue;
      ctx.globalAlpha = Math.max(0, s.life / s.max) * 0.6;
      ctx.beginPath();
      ctx.moveTo(s.x - cam.x, s.y - cam.y);
      ctx.lineTo(s.x2 - cam.x, s.y2 - cam.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawStreet(pr) {
    const img = pr.img;
    if (!img) return;
    const dw = img.worldW || 10;
    const dh = img.worldH || 14;
    ctx.save();
    ctx.translate(Math.round(pr.x - cam.x), Math.round(pr.y - cam.y));
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-dw * 0.35, -1, dw * 0.7, 3);
    if (pr.dying > 0) {
      const t = 1 - pr.dying / 0.7;
      ctx.rotate((pr.ang || 0) + t * 1.4);
      ctx.globalAlpha = Math.max(0, 1 - t);
    } else if (pr.ang) {
      ctx.rotate(Math.max(-0.5, Math.min(0.5, pr.ang)));
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, -dw / 2, -dh + 2, dw, dh);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawPuddles() {
    const still = quality === 'low' || reduceMotion;
    ctx.lineWidth = 1;
    for (let i = 0; i < puddles.length; i++) {
      const p = puddles[i];
      if (!onScreen(p.x, p.y, 12)) continue;
      const wobble = still ? 0 : (((globalTime * 3 + p.phase) | 0) % 2);
      const x = Math.round(p.x - cam.x);
      const y = Math.round(p.y - cam.y);
      ctx.fillStyle = 'rgba(210, 216, 220, 0.38)';
      ctx.fillRect(x - 5 - wobble, y - 1, 10 + wobble * 2, 1);
      ctx.fillRect(x - 3, y, 6, 1);
      ctx.fillRect(x - 5 - wobble, y + 1, 10 + wobble * 2, 1);
    }
  }

  function drawSignals() {
    const phase = ((globalTime / 1.2) | 0) % 3;
    const color = phase === 0 ? '#3dff8a' : phase === 1 ? '#ffe14a' : '#ff4d6d';
    for (let i = 0; i < signals.length; i++) {
      const s = signals[i];
      if (!onScreen(s.x, s.y, 24)) continue;
      const x = Math.round(s.x - cam.x);
      const y = Math.round(s.y - cam.y);
      ctx.fillStyle = '#1a1814';
      ctx.fillRect(x, y - 22, 2, 26);
      ctx.fillStyle = '#141210';
      ctx.fillRect(x - 3, y - 30, 8, 10);
      ctx.fillStyle = color;
      ctx.fillRect(x - 2, y - 24, 6, 6);
    }
  }

  function drawPigeon(p) {
    if (!onScreen(p.x, p.y, 16)) return;
    const flap = ((globalTime * 12 + p.phase * 4) | 0) % 2;
    const x = Math.round(p.x - cam.x);
    const y = Math.round(p.y - cam.y);
    ctx.fillStyle = '#c8c4d4';
    ctx.fillRect(x - 2, y, 5, 3);
    ctx.fillStyle = '#5a5468';
    ctx.fillRect(x - 5, y - (flap ? 3 : 0), 4, 2);
    ctx.fillRect(x + 2, y - (flap ? 0 : 3), 4, 2);
    ctx.fillStyle = '#ffb070';
    ctx.fillRect(x + 3, y + 1, 2, 1);
  }

  function isOpenRoad(x, y) {
    const tx = tileOf(x);
    const ty = tileOf(y);
    const ch = chunkOfTile(tx, ty);
    if (!ch) return false;
    const i = localIndex(tx, ty);
    return ch.tiles[i] === T_ROAD && ch.solid[i] === 0;
  }

  function steerTraffic(car, dt) {
    const look = 30;
    const fx = car.x + Math.cos(car.ang) * look;
    const fy = car.y + Math.sin(car.ang) * look;
    const tx = tileOf(car.x);
    const ty = tileOf(car.y);
    const crossing = mod(tx, PERIOD) < TW && mod(ty, PERIOD) < TW;
    const axes = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    let want = car.ang;
    const blocked = !isOpenRoad(fx, fy);
    if (blocked || (crossing && car.turnCool <= 0 && ((hash(tx + car.phase * 10, ty) % 4) === 0))) {
      const options = [];
      for (let k = 0; k < axes.length; k++) {
        const a = axes[k];
        if (isOpenRoad(car.x + Math.cos(a) * 40, car.y + Math.sin(a) * 40)) options.push(a);
      }
      if (!options.length) want = car.ang + Math.PI;
      else {
        let pick = options[0];
        let best = 99;
        for (let k = 0; k < options.length; k++) {
          const d = Math.abs(Math.atan2(Math.sin(options[k] - car.ang), Math.cos(options[k] - car.ang)));
          const score = blocked ? d : (d < 0.2 ? 2 : d);
          if (score < best) {
            best = score;
            pick = options[k];
          }
        }
        if (crossing && options.length > 1 && !blocked) {
          pick = options[(hash(tx, ty) + (car.phase | 0)) % options.length];
        }
        want = pick;
        car.turnCool = 0.85;
      }
    } else {
      let best = car.ang;
      let bestD = 1;
      for (let k = 0; k < axes.length; k++) {
        const d = Math.abs(Math.atan2(Math.sin(car.ang - axes[k]), Math.cos(car.ang - axes[k])));
        if (d < bestD) {
          bestD = d;
          best = axes[k];
        }
      }
      if (bestD < 0.7 && isOpenRoad(car.x + Math.cos(best) * look, car.y + Math.sin(best) * look)) want = best;
    }
    car.turnCool = Math.max(0, (car.turnCool || 0) - dt);
    const raw = Math.atan2(Math.sin(want - car.ang), Math.cos(want - car.ang));
    car.steer = Math.max(-0.7, Math.min(0.7, raw));
    const maxTurn = 2.6 * dt;
    let diff = raw;
    if (diff > maxTurn) diff = maxTurn;
    if (diff < -maxTurn) diff = -maxTurn;
    car.ang += diff;
    const cruise = car.cruise || car.speed || 48;
    if (car.vel == null) car.vel = cruise;
    if (Math.abs(raw) > 0.55) car.braking = 0.34;
    else car.braking = Math.max(0, (car.braking || 0) - dt);
    const target = (car.braking || 0) > 0.04 ? cruise * 0.3 : cruise;
    car.vel += (target - car.vel) * (1 - Math.exp(-2.6 * dt));
    car.shoveX = (car.shoveX || 0) * Math.exp(-2.4 * dt);
    car.shoveY = (car.shoveY || 0) * Math.exp(-2.4 * dt);
    const shoved = Math.hypot(car.shoveX, car.shoveY) > 28;
    const nx = car.x + Math.cos(car.ang) * car.vel * dt + car.shoveX * dt;
    const ny = car.y + Math.sin(car.ang) * car.vel * dt + car.shoveY * dt;
    if (isOpenRoad(nx, ny) || shoved) {
      if ((car.braking || 0) > 0.04 || shoved) dropSkid(car);
      car.x = nx;
      car.y = ny;
    } else {
      car.ang += 1.4 * dt;
      car.braking = 0.28;
      car.vel *= 0.9;
    }
    if (!isOpenRoad(car.x, car.y)) {
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        if (!isOpenRoad(car.x + Math.cos(a) * 20, car.y + Math.sin(a) * 20)) continue;
        car.ang = a;
        car.x += Math.cos(a) * 24 * dt;
        car.y += Math.sin(a) * 24 * dt;
        break;
      }
    }
    car.speed = car.vel;
    car.vx = Math.cos(car.ang) * car.vel;
    car.vy = Math.sin(car.ang) * car.vel;
  }

  function dropSkid(car) {
    if ((fxFrame & 1) !== 0) return;
    if (skids.length > 96) return;
    skids.push({
      x: car.x - Math.cos(car.ang) * 12,
      y: car.y - Math.sin(car.ang) * 12,
      x2: car.x - Math.cos(car.ang) * 4,
      y2: car.y - Math.sin(car.ang) * 4,
      life: 1.35,
      max: 1.35,
    });
  }

  function separateCast() {
    const list = [];
    if (player && player.hp > 0) list.push(player);
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].alive && enemies[i].born <= 0) list.push(enemies[i]);
    }
    for (let i = 0; i < folk.length; i++) if (folk[i].alive) list.push(folk[i]);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const min = (a.radius + b.radius) * 0.72;
        const dist = Math.hypot(dx, dy);
        if (dist >= min || dist < 0.01) continue;
        const push = Math.min(4, (min - dist) * 0.5);
        const nx = dx / dist;
        const ny = dy / dist;
        moveBody(a, -nx * push, -ny * push);
        moveBody(b, nx * push, ny * push);
      }
    }
  }

  function bumpCars() {
    const list = [];
    if (player && player.hp > 0) list.push(player);
    for (let i = 0; i < enemies.length; i++) if (enemies[i].alive) list.push(enemies[i]);
    for (let i = 0; i < folk.length; i++) if (folk[i].alive) list.push(folk[i]);
    for (let c = 0; c < traffic.length; c++) {
      const car = traffic[c];
      const cos = Math.cos(-(car.ang + Math.PI / 2));
      const sin = Math.sin(-(car.ang + Math.PI / 2));
      const hw = (car.spriteW || 36) * 0.4;
      const hh = (car.spriteH || 72) * 0.42;
      for (let i = 0; i < list.length; i++) {
        const body = list[i];
        const dx = body.x - car.x;
        const dy = body.y - car.y;
        const lx = dx * cos - dy * sin;
        const ly = dx * sin + dy * cos;
        const penX = hw + 2 - Math.abs(lx);
        const penY = hh + 2 - Math.abs(ly);
        if (penX <= 0 || penY <= 0) continue;
        let px = 0;
        let py = 0;
        if (penX < penY) px = Math.min(6, penX) * (lx < 0 ? -1 : 1);
        else py = Math.min(6, penY) * (ly < 0 ? -1 : 1);
        const wx = px * cos + py * sin;
        const wy = -px * sin + py * cos;
        moveBody(body, wx, wy);
        if (body.kvx != null && Math.abs(wx) + Math.abs(wy) > 2) {
          body.kvx += wx * 3;
          body.kvy += wy * 3;
        }
      }
    }
  }

  function bumpStreet() {
    const list = [];
    if (player && player.hp > 0) list.push(player);
    for (let i = 0; i < enemies.length; i++) if (enemies[i].alive) list.push(enemies[i]);
    for (let i = 0; i < folk.length; i++) if (folk[i].alive) list.push(folk[i]);
    for (let s = 0; s < street.length; s++) {
      const pr = street[s];
      if (!pr.alive) continue;
      for (let i = 0; i < list.length; i++) {
        const body = list[i];
        const dx = pr.x - body.x;
        const dy = pr.y - body.y;
        const min = pr.radius + body.radius;
        const dist = Math.hypot(dx, dy);
        if (dist >= min || dist < 0.01) continue;
        const push = Math.min(3, min - dist);
        const nx = dx / dist;
        const ny = dy / dist;
        pr.vx += nx * 40;
        pr.vy += ny * 40;
        pr.ang += nx * 0.2;
        moveBody(body, -nx * push, -ny * push);
      }
    }
  }

  function drawVehicle(spec) {
    const x = spec.cx != null ? spec.cx : spec.x;
    const y = spec.cy != null ? spec.cy : spec.y;
    if (!onScreen(x, y, 70)) return;
    const dw = spec.spriteW || 36;
    const dh = spec.spriteH || 72;
    const ang = spec.ang || 0;
    const sx = x - cam.x;
    const sy = y - cam.y;
    const painted = spec.img && spec.img.hand;
    if (!painted) {
      ctx.save();
      ctx.translate(sx + 2, sy + 3);
      ctx.rotate(ang);
      ctx.fillStyle = 'rgba(8, 8, 10, 0.5)';
      ctx.fillRect(-dh * 0.32, -dw * 0.22, dh * 0.64, dw * 0.44);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang + Math.PI / 2);
    ctx.imageSmoothingEnabled = !!painted;
    if (painted) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(spec.img, -dw / 2, -dh / 2, dw, dh);
    if (painted) {
      ctx.restore();
      ctx.globalAlpha = 1;
      return;
    }
    const steer = spec.steer || 0;
    if (steer) {
      ctx.save();
      ctx.translate(-dw * 0.28, -dh * 0.32);
      ctx.rotate(steer);
      ctx.fillStyle = '#120e14';
      ctx.fillRect(-2, -4, 4, 7);
      ctx.restore();
      ctx.save();
      ctx.translate(dw * 0.28, -dh * 0.32);
      ctx.rotate(steer);
      ctx.fillStyle = '#120e14';
      ctx.fillRect(-2, -4, 4, 7);
      ctx.restore();
    }
    if (spec.model === 'police') {
      const flash = ((globalTime * 9) | 0) % 2;
      ctx.fillStyle = flash ? '#ff2a3a' : '#3d6bff';
      ctx.globalAlpha = 0.95;
      ctx.fillRect(-dw * 0.18, -dh * 0.06, dw * 0.14, dh * 0.045);
      ctx.fillStyle = flash ? '#3d6bff' : '#ff2a3a';
      ctx.fillRect(dw * 0.04, -dh * 0.06, dw * 0.14, dh * 0.045);
    }
    const pulse = 0.5 + Math.sin(globalTime * 12 + x) * 0.35;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#fff6c8';
    ctx.fillRect(-dw * 0.32, -dh * 0.48, dw * 0.18, dh * 0.045);
    ctx.fillRect(dw * 0.14, -dh * 0.48, dw * 0.18, dh * 0.045);
    const braking = (spec.braking || 0) > 0.04;
    ctx.globalAlpha = braking ? 1 : 0.72;
    ctx.fillStyle = braking ? '#ff2030' : '#ff3355';
    const tail = braking ? dh * 0.07 : dh * 0.04;
    ctx.fillRect(-dw * 0.34, dh * 0.42, dw * 0.2, tail);
    ctx.fillRect(dw * 0.14, dh * 0.42, dw * 0.2, tail);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function fillTiled(img, x, y, w, h, anchorX, anchorY) {
    const tileW = img.tileW || w;
    const tileH = img.tileH || h;
    const pattern = ctx.createPattern(img, 'repeat');
    if (!pattern) return;
    const sx = tileW / img.width;
    const sy = tileH / img.height;
    pattern.setTransform(new DOMMatrix([sx, 0, 0, sy, anchorX, anchorY]));
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, w, h);
  }

  // One ground-floor door, centered. Banded facades fill the rest of that
  // row with the plain wall and every storey above it with the window piece.
  // A whole v5 wall (nightclub, warehouse, gas station) is stamped once at
  // storey scale. Storeys above it are the window piece; the sides are plain.
  function paintFacade(wall, edge, rise) {
    const door = wall.door;
    const dw = door.tileW;
    const dh = door.tileH;
    const dx = (edge - dw) / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (wall.whole) {
      if (wall.plain) fillTiled(wall.plain, 0, 0, edge, rise, dx, 0);
      if (wall.win && rise > dh) fillTiled(wall.win, 0, dh, edge, rise - dh, dx, dh);
      ctx.drawImage(door, dx, 0, dw, dh);
      return;
    }
    const gh = Math.min(wall.groundH || dh, rise);
    if (wall.win && rise > gh) fillTiled(wall.win, 0, gh, edge, rise - gh, dx, gh);
    if (wall.plain && gh > 0) fillTiled(wall.plain, 0, 0, edge, gh, dx, 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, 0, dw, gh);
    ctx.clip();
    ctx.drawImage(door, dx, 0, dw, dh);
    ctx.restore();
  }

  function drawWallFace(x0, y0, x1, y1, ox, oy, wall) {
    const ax = x0 - cam.x;
    const ay = y0 - cam.y;
    const bx = x1 - cam.x;
    const by = y1 - cam.y;
    const edge = Math.hypot(bx - ax, by - ay) || 1;
    const rise = Math.hypot(ox, oy) || 1;
    ctx.save();
    ctx.transform((bx - ax) / edge, (by - ay) / edge, ox / rise, oy / rise, ax, ay);
    ctx.beginPath();
    ctx.rect(0, 0, edge, rise);
    ctx.clip();
    if (wall && wall.door) paintFacade(wall, edge, rise);
    else if (wall) fillTiled(wall, 0, 0, edge, rise, 0, 0);
    ctx.restore();
  }

  function blockShadowSprite() {
    if (spr.blockShadow) return spr.blockShadow;
    const c = document.createElement('canvas');
    c.width = 420;
    c.height = 300;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(150, 110, 12, 200, 160, 190);
    grd.addColorStop(0, 'rgba(12, 10, 8, 0.58)');
    grd.addColorStop(0.38, 'rgba(12, 10, 8, 0.32)');
    grd.addColorStop(0.72, 'rgba(12, 10, 8, 0.12)');
    grd.addColorStop(1, 'rgba(12, 10, 8, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 420, 300);
    const grd2 = g.createRadialGradient(230, 180, 8, 280, 210, 130);
    grd2.addColorStop(0, 'rgba(12, 10, 8, 0.26)');
    grd2.addColorStop(1, 'rgba(12, 10, 8, 0)');
    g.fillStyle = grd2;
    g.fillRect(0, 0, 420, 300);
    spr.blockShadow = c;
    return c;
  }

  function drawBuildShadow(pr) {
    const fw = pr.fw;
    const fh = pr.fh;
    const x0 = pr.footX - cam.x;
    const y0 = pr.footY - cam.y;
    ctx.fillStyle = 'rgba(8, 8, 10, 0.42)';
    ctx.fillRect(x0 + 12, y0 + 16, fw + 8, fh + 10);
  }

  function drawFittedRoof(img, x, y, fw, fh) {
    if (!img || fw < 1 || fh < 1) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const iw = img.width || 1;
    const ih = img.height || 1;
    if (Math.max(fw, fh) > Math.min(fw, fh) * 1.08) {
      const scale = Math.min(fw / iw, fh / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, x + (fw - dw) / 2, y + (fh - dh) / 2, dw, dh);
      return;
    }
    ctx.drawImage(img, x, y, fw, fh);
  }

  function drawHandBlock(pr) {
    const cx = cam.x + view.w / 2;
    const cy = cam.y + view.h / 2;
    const x0 = pr.footX;
    const y0 = pr.footY;
    const fw = pr.fw;
    const fh = pr.fh;
    const x1 = x0 + fw;
    const y1 = y0 + fh;
    const bx = x0 + fw / 2;
    const by = y0 + fh / 2;
    let dx = bx - cx;
    let dy = by - cy;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;
    const lean = Math.min(fw, fh) * (pr.lean || 0.18);
    let ox = dx * lean;
    let oy = dy * lean;
    const maxShiftX = fw * 0.3;
    const maxShiftY = fh * 0.3;
    ox = Math.max(-maxShiftX, Math.min(maxShiftX, ox));
    oy = Math.max(-maxShiftY, Math.min(maxShiftY, oy));
    const edges = [
      { x0: x0, y0: y1, x1: x1, y1: y1, nx: 0, ny: 1 },
      { x0: x1, y0: y1, x1: x1, y1: y0, nx: 1, ny: 0 },
      { x0: x1, y0: y0, x1: x0, y1: y0, nx: 0, ny: -1 },
      { x0: x0, y0: y0, x1: x0, y1: y1, nx: -1, ny: 0 },
    ];
    const faces = [];
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const facing = e.nx * (cx - bx) + e.ny * (cy - by);
      if (facing > 6) faces.push({ e: e, facing: facing });
    }
    faces.sort((a, b) => a.facing - b.facing);
    ctx.save();
    for (let i = 0; i < faces.length; i++) {
      const e = faces[i].e;
      const wall = i === faces.length - 1 ? pr.wallFront : pr.wallSide;
      if (wall) drawWallFace(e.x0, e.y0, e.x1, e.y1, ox, oy, wall);
    }
    // Same size as the footprint, shifted by the full lean, so each roof
    // edge is the top of the wall that rose from the matching ground edge.
    // The whole roof picture is drawn once into that quad.
    const roofX = x0 + ox - cam.x;
    const roofY = y0 + oy - cam.y;
    drawFittedRoof(pr.roof, roofX, roofY, fw, fh);
    ctx.restore();
  }

  function drawBlock(pr) {
    const x0 = pr.footX - cam.x;
    const y0 = pr.footY - cam.y;
    const fw = pr.fw;
    const fh = pr.fh;
    const drop = 28;
    ctx.imageSmoothingEnabled = false;
    if (pr.wallSide) ctx.drawImage(pr.wallSide, x0 + fw - 2, y0 + 6, 16, fh + drop - 10);
    if (pr.wallFront) ctx.drawImage(pr.wallFront, x0 - 2, y0 + fh - 4, fw + 4, drop);
    ctx.drawImage(pr.roof, x0 - 4, y0 - 2, fw + 8, fh + 4);
  }

  function drawTraffic(car) {
    drawVehicle(car);
  }

  function drawWorld() {
    ctx.imageSmoothingEnabled = false;
    const x0 = Math.floor(cam.x / BLOCK) - 1;
    const y0 = Math.floor(cam.y / BLOCK) - 1;
    const x1 = Math.floor((cam.x + view.w) / BLOCK) + 1;
    const y1 = Math.floor((cam.y + view.h) / BLOCK) + 1;
    for (let by = y0; by <= y1; by++) {
      for (let bx = x0; bx <= x1; bx++) {
        const ch = chunks.get(chunkKey(bx, by));
        if (!ch || !ch.canvas) continue;
        ctx.drawImage(ch.canvas, bx * BLOCK - cam.x, by * BLOCK - cam.y, BLOCK, BLOCK);
      }
    }
    drawPuddles();
    drawSkids();
    drawStains();

    const queue = [];
    for (let i = 0; i < props.length; i++) {
      const pr = props[i];
      if (!propOnScreen(pr)) continue;
      if (pr.kind === 'build' && !pr.hand) {
        drawBuildShadow(pr);
      } else if (pr.kind === 'tree' && !(pr.img && pr.img.hand)) {
        const pw = pr.w || pr.img.width;
        const cx = Math.round(pr.x + pw / 2 - cam.x);
        const cy = Math.round(pr.sortY - cam.y);
        ctx.fillStyle = 'rgba(8, 8, 10, 0.4)';
        ctx.fillRect(cx - pr.shadowW / 2, cy - 2, pr.shadowW, 4);
      } else if (pr.kind !== 'car') {
        const pw = pr.w || pr.img.width;
        const cx = Math.round(pr.x + pw / 2 - cam.x);
        const cy = Math.round(pr.sortY - cam.y + 2);
        ctx.fillStyle = 'rgba(20, 16, 12, 0.28)';
        ctx.fillRect(cx - pr.shadowW / 2, cy - 2, pr.shadowW, 4);
      }
      queue.push(pr.sortY, i, 0);
    }
    for (let i = 0; i < gems.length; i++) {
      const g = gems[i];
      if (g.alive && onScreen(g.x, g.y, 24)) queue.push(g.y, i, 1);
    }
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].alive || enemies[i].dying > 0) queue.push(enemies[i].y, i, 2);
    }
    if (player) queue.push(player.y, 0, 3);
    for (let i = 0; i < folk.length; i++) {
      if (onScreen(folk[i].x, folk[i].y, 40)) queue.push(folk[i].y, i, 4);
    }
    for (let i = 0; i < traffic.length; i++) {
      if (onScreen(traffic[i].x, traffic[i].y, 80)) queue.push(traffic[i].y, i, 5);
    }
    for (let i = 0; i < street.length; i++) {
      const pr = street[i];
      if (!pr.alive && !(pr.dying > 0) && !(pr.spray > 0)) continue;
      if (onScreen(pr.x, pr.y, 24)) queue.push(pr.y, i, 6);
    }
    const order = [];
    for (let i = 0; i < queue.length; i += 3) order.push(i);
    order.sort((a, b) => queue[a] - queue[b]);
    for (let n = 0; n < order.length; n++) {
      const i = order[n];
      const kind = queue[i + 2];
      const idx = queue[i + 1];
      if (kind === 0) drawProp(props[idx]);
      else if (kind === 6) drawStreet(street[idx]);
      else if (kind === 4) drawActor(folk[idx]);
      else if (kind === 5) drawTraffic(traffic[idx]);
      else if (kind === 1) {
        const g = gems[idx];
        const bob = Math.sin(globalTime * 5 + g.phase) * 1.5;
        const glint = ((globalTime * 6 + g.phase) | 0) % 5 === 0;
        drawCentered(gemSprite(g.value, glint), g.x, g.y + bob);
      } else if (kind === 2) drawActor(enemies[idx]);
      else drawActor(player);
    }
    drawGibs();

    if (weapons && weapons.carts && weapons.carts.pos) {
      for (let i = 0; i < weapons.carts.pos.length; i++) {
        const c = weapons.carts.pos[i];
        const ang = c.a || 0;
        ctx.save();
        ctx.translate(Math.round(c.x - cam.x), Math.round(c.y - cam.y));
        ctx.rotate(ang + Math.PI / 2);
        ctx.imageSmoothingEnabled = false;
        const cw = spr.cart.worldW || spr.cart.width;
        const ch = spr.cart.worldH || spr.cart.height;
        ctx.drawImage(spr.cart, -cw / 2, -ch / 2, cw, ch);
        ctx.restore();
      }
    }

    for (let i = 0; i < shots.length; i++) {
      const p = shots[i];
      if (!p.alive) continue;
      if (p.kind === 'bottle') {
        ctx.save();
        ctx.translate(Math.round(p.x - cam.x), Math.round(p.y - cam.y));
        ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2);
        ctx.imageSmoothingEnabled = false;
        const bw = spr.bottle.worldW || spr.bottle.width;
        const bh = spr.bottle.worldH || spr.bottle.height;
        ctx.drawImage(spr.bottle, -bw / 2, -bh / 2, bw, bh);
        ctx.restore();
      } else {
        drawCentered(spr.crystal, p.x, p.y);
        const bang = Math.atan2(p.vy, p.vx);
        ctx.fillStyle = '#fff6b0';
        for (let s = 3; s <= 9; s += 3) {
          ctx.fillRect(
            Math.round(p.x - cam.x - Math.cos(bang) * s) - 1,
            Math.round(p.y - cam.y - Math.sin(bang) * s) - 1,
            2,
            2
          );
        }
        if (((globalTime * 14) | 0) % 2 === 0) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(Math.round(p.x - cam.x) - 1, Math.round(p.y - cam.y) - 5, 2, 2);
        }
      }
    }
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      if (b.alive) drawCentered(spr.bag, b.x, b.y);
    }

    for (let i = 0; i < waves.length; i++) {
      const w = waves[i];
      const t = 1 - w.life / w.max;
      ctx.strokeStyle = w.color;
      ctx.globalAlpha = Math.max(0, w.life / w.max);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(Math.round(w.x - cam.x), Math.round(w.y - cam.y), Math.max(2, w.r * t), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < flashes.length; i++) {
      const f = flashes[i];
      if (!onScreen(f.x, f.y, 16)) continue;
      if (f.pistol) {
        ctx.globalAlpha = Math.max(0, f.life / f.max);
        const x = Math.round(f.x - cam.x);
        const y = Math.round(f.y - cam.y);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - 1, y - 1, 3, 3);
        ctx.fillStyle = '#fff6b0';
        ctx.fillRect(Math.round(x + Math.cos(f.ang) * 4) - 1, Math.round(y + Math.sin(f.ang) * 4) - 1, 3, 2);
        ctx.fillStyle = '#ffb020';
        ctx.fillRect(Math.round(x + Math.cos(f.ang) * 7), Math.round(y + Math.sin(f.ang) * 7), 2, 2);
        ctx.globalAlpha = 1;
        continue;
      }
      if (f.soda) {
        ctx.globalAlpha = Math.max(0, f.life / f.max);
        const x = Math.round(f.x - cam.x);
        const y = Math.round(f.y - cam.y);
        ctx.fillStyle = '#e8ffe8';
        ctx.fillRect(x - 1, y - 1, 3, 3);
        ctx.fillStyle = '#9ae06a';
        ctx.fillRect(Math.round(x + Math.cos(f.ang) * 5), Math.round(y + Math.sin(f.ang) * 5), 2, 2);
        ctx.globalAlpha = 1;
        continue;
      }
      if (f.bass) {
        ctx.globalAlpha = Math.max(0, f.life / f.max);
        const x = Math.round(f.x - cam.x);
        const y = Math.round(f.y - cam.y);
        ctx.fillStyle = '#5ce1e6';
        ctx.fillRect(x, y - 3, 2, 6);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y - 1, 2, 2);
        ctx.globalAlpha = 1;
        continue;
      }
      ctx.save();
      ctx.translate(Math.round(f.x - cam.x), Math.round(f.y - cam.y));
      ctx.rotate(f.ang);
      ctx.globalAlpha = Math.max(0, f.life / f.max);
      ctx.fillStyle = f.color;
      ctx.fillRect(0, -2, 8, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, -1, 4, 2);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!onScreen(p.x, p.y, 10)) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - cam.x), Math.round(p.y - cam.y), p.size, p.size);
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      if (!onScreen(m.x, m.y, 8)) continue;
      ctx.globalAlpha = 0.35 + (m.neon ? 0.35 : 0);
      ctx.fillStyle = m.neon ? '#ff8ac0' : '#e4e0f0';
      ctx.fillRect(Math.round(m.x - cam.x), Math.round(m.y - cam.y), m.size, m.size);
      ctx.globalAlpha = 1;
    }

    drawSignals();
    for (let i = 0; i < pigeons.length; i++) drawPigeon(pigeons[i]);

    if (barks.length) {
      ctx.font = '700 8px Courier New, ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 2;
      for (let i = 0; i < barks.length; i++) {
        const b = barks[i];
        const x = Math.round(b.x - cam.x);
        const y = Math.round(b.y - cam.y);
        ctx.strokeStyle = '#140c18';
        ctx.strokeText(b.text, x, y);
        ctx.fillStyle = b.color;
        ctx.fillText(b.text, x, y);
      }
    }
  }

  function applyWorld(shx, shy) {
    ctx.setTransform(drawScale, 0, 0, drawScale, (shx || 0) * drawScale, (shy || 0) * drawScale);
    ctx.imageSmoothingEnabled = false;
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#100e16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const shx = shake > 0.25 ? Math.round((Math.random() * 2 - 1) * shake) : 0;
    const shy = shake > 0.25 ? Math.round((Math.random() * 2 - 1) * shake) : 0;
    applyWorld(shx, shy);
    drawWorld();
    applyWorld(0, 0);
    const key = view.w + 'x' + view.h;
    if (key !== vignetteKey) {
      vignetteKey = key;
      const g = ctx.createRadialGradient(
        view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.2,
        view.w / 2, view.h / 2, Math.max(view.w, view.h) * 0.72
      );
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.22)');
      vignette = g;
    }
    paintGrade();
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, view.w, view.h);
    if (quality === 'high') paintEdgeBlur();
    drawLocalMap();
  }

  function drawLocalMap() {
    if (streamBx == null) return;
    const size = 86;
    const ox = view.w - size - 10;
    const oy = 10;
    ctx.save();
    ctx.fillStyle = 'rgba(8, 10, 16, 0.78)';
    ctx.fillRect(ox - 2, oy - 2, size + 4, size + 4);
    ctx.strokeStyle = '#e6c84a';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox - 2.5, oy - 2.5, size + 5, size + 5);
    const span = (LOAD_R * 2 + 1) * BLOCK;
    const scale = size / span;
    const originX = (streamBx - LOAD_R) * BLOCK;
    const originY = (streamBy - LOAD_R) * BLOCK;
    ctx.beginPath();
    ctx.rect(ox, oy, size, size);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    for (const ch of chunks.values()) {
      if (!ch.canvas) continue;
      const x = ox + (ch.bx * BLOCK - originX) * scale;
      const y = oy + (ch.by * BLOCK - originY) * scale;
      ctx.drawImage(ch.canvas, x, y, BLOCK * scale, BLOCK * scale);
    }
    if (player) {
      ctx.fillStyle = '#ffe14a';
      const px = ox + (player.x - originX) * scale;
      const py = oy + (player.y - originY) * scale;
      ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
    }
    ctx.restore();
  }

  const spriteCache = {};

  function punchSprite(radius) {
    const r = Math.max(8, (Math.round(radius / 4) * 4) | 0);
    const key = 'p' + r;
    let c = spriteCache[key];
    if (c) return c;
    c = document.createElement('canvas');
    c.width = r * 2;
    c.height = r * 2;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(r, r, r * 0.08, r, r, r);
    grad.addColorStop(0, 'rgba(0,0,0,0.72)');
    grad.addColorStop(0.4, 'rgba(0,0,0,0.28)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);
    spriteCache[key] = c;
    return c;
  }

  function bloomSprite(color) {
    const key = 'b' + color;
    let c = spriteCache[key];
    if (c) return c;
    const r = 16;
    const n = parseInt(String(color).slice(1), 16);
    const rr = (n >> 16) & 255;
    const gg = (n >> 8) & 255;
    const bb = n & 255;
    c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(r, r, 1, r, r, r);
    grad.addColorStop(0, 'rgba(' + rr + ',' + gg + ',' + bb + ',0.7)');
    grad.addColorStop(0.45, 'rgba(' + rr + ',' + gg + ',' + bb + ',0.2)');
    grad.addColorStop(1, 'rgba(' + rr + ',' + gg + ',' + bb + ',0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    spriteCache[key] = c;
    return c;
  }

  function collectLights() {
    const list = [];
    const cap = quality === 'low' ? 8 : 14;
    const push = (x, y, r, color) => {
      if (list.length >= cap) return;
      if (!onScreen(x, y, r)) return;
      list.push({ x: x, y: y, r: r, color: color });
    };
    if (player) push(player.x, player.y - 8, 72, '#ffe1b0');
    for (let i = 0; i < props.length && list.length < cap; i++) {
      const pr = props[i];
      if (!pr.lights || !pr.lights.length) continue;
      if (!propOnScreen(pr)) continue;
      for (let k = 0; k < pr.lights.length && list.length < cap; k++) {
        const L = pr.lights[k];
        push(L.x, L.y, L.r || 28, L.color || '#ffe7a8');
      }
    }
    if (quality !== 'low') {
      let gemsLit = 0;
      for (let i = 0; i < gems.length && gemsLit < 4 && list.length < cap; i++) {
        const g = gems[i];
        if (!g.alive || !onScreen(g.x, g.y, 10)) continue;
        push(g.x, g.y, 26, g.value >= 8 ? '#9eecff' : '#e2b6ff');
        gemsLit += 1;
      }
      let flashesLit = 0;
      for (let i = 0; i < flashes.length && flashesLit < 4 && list.length < cap; i++) {
        const f = flashes[i];
        if (f.life <= 0 || !onScreen(f.x, f.y, 16)) continue;
        push(f.x, f.y, 36, f.color || '#fff6b0');
        flashesLit += 1;
      }
    }
    return list;
  }

  function paintGrade() {
    if (!lightCanvas || lightCanvas.width !== view.w || lightCanvas.height !== view.h) {
      lightCanvas = document.createElement('canvas');
      lightCanvas.width = view.w;
      lightCanvas.height = view.h;
      lightMask = document.createElement('canvas');
      lightMask.width = view.w;
      lightMask.height = view.h;
    }
    const lights = collectLights();
    const l = lightCanvas.getContext('2d');
    l.setTransform(1, 0, 0, 1, 0, 0);
    l.globalCompositeOperation = 'source-over';
    l.globalAlpha = 1;
    l.clearRect(0, 0, view.w, view.h);
    l.fillStyle = quality === 'low' ? 'rgba(8, 10, 24, 0.34)' : 'rgba(6, 8, 22, 0.48)';
    l.fillRect(0, 0, view.w, view.h);
    const m = lightMask.getContext('2d');
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.globalCompositeOperation = 'source-over';
    m.globalAlpha = 1;
    m.clearRect(0, 0, view.w, view.h);
    m.globalCompositeOperation = 'lighter';
    for (let i = 0; i < lights.length; i++) {
      const L = lights[i];
      const spr = punchSprite(L.r);
      const d = spr.width;
      m.drawImage(spr, L.x - cam.x - d * 0.5, L.y - cam.y - d * 0.5);
    }
    l.globalCompositeOperation = 'destination-out';
    l.drawImage(lightMask, 0, 0);
    l.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(lightCanvas, 0, 0);
    ctx.imageSmoothingEnabled = false;
    paintBloom();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#9eb0dc';
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffb060';
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function blurSupported(g) {
    if (blurOK !== null) return blurOK;
    try {
      g.filter = 'blur(1px)';
      blurOK = g.filter === 'blur(1px)';
    } catch (err) {
      blurOK = false;
    }
    g.filter = 'none';
    return blurOK;
  }

  function boxBlurCanvas(canvas, radius) {
    const r = radius | 0;
    if (r < 1) return;
    const w = canvas.width;
    const h = canvas.height;
    const g = canvas.getContext('2d');
    const img = g.getImageData(0, 0, w, h);
    const src = img.data;
    const tmp = new Uint8ClampedArray(src.length);
    const div = r * 2 + 1;
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let rsum = 0;
      let gsum = 0;
      let bsum = 0;
      let asum = 0;
      for (let k = -r; k <= r; k++) {
        const x = k < 0 ? 0 : (k >= w ? w - 1 : k);
        const i = (row + x) * 4;
        rsum += src[i];
        gsum += src[i + 1];
        bsum += src[i + 2];
        asum += src[i + 3];
      }
      for (let x = 0; x < w; x++) {
        const o = (row + x) * 4;
        tmp[o] = rsum / div;
        tmp[o + 1] = gsum / div;
        tmp[o + 2] = bsum / div;
        tmp[o + 3] = asum / div;
        const x0 = x - r < 0 ? 0 : x - r;
        const x1 = x + r + 1 >= w ? w - 1 : x + r + 1;
        const i0 = (row + x0) * 4;
        const i1 = (row + x1) * 4;
        rsum += src[i1] - src[i0];
        gsum += src[i1 + 1] - src[i0 + 1];
        bsum += src[i1 + 2] - src[i0 + 2];
        asum += src[i1 + 3] - src[i0 + 3];
      }
    }
    for (let x = 0; x < w; x++) {
      let rsum = 0;
      let gsum = 0;
      let bsum = 0;
      let asum = 0;
      for (let k = -r; k <= r; k++) {
        const y = k < 0 ? 0 : (k >= h ? h - 1 : k);
        const i = (y * w + x) * 4;
        rsum += tmp[i];
        gsum += tmp[i + 1];
        bsum += tmp[i + 2];
        asum += tmp[i + 3];
      }
      for (let y = 0; y < h; y++) {
        const o = (y * w + x) * 4;
        src[o] = rsum / div;
        src[o + 1] = gsum / div;
        src[o + 2] = bsum / div;
        src[o + 3] = asum / div;
        const y0 = y - r < 0 ? 0 : y - r;
        const y1 = y + r + 1 >= h ? h - 1 : y + r + 1;
        const i0 = (y0 * w + x) * 4;
        const i1 = (y1 * w + x) * 4;
        rsum += tmp[i1] - tmp[i0];
        gsum += tmp[i1 + 1] - tmp[i0 + 1];
        bsum += tmp[i1 + 2] - tmp[i0 + 2];
        asum += tmp[i1 + 3] - tmp[i0 + 3];
      }
    }
    g.putImageData(img, 0, 0);
  }

  const blurScratch = {};

  function blurCanvas(canvas, radius) {
    const rad = Math.max(1, radius | 0);
    const g = canvas.getContext('2d');
    if (blurSupported(g)) {
      const key = canvas.width + 'x' + canvas.height;
      let copy = blurScratch[key];
      if (!copy) {
        copy = document.createElement('canvas');
        copy.width = canvas.width;
        copy.height = canvas.height;
        blurScratch[key] = copy;
      }
      const cg = copy.getContext('2d');
      cg.clearRect(0, 0, copy.width, copy.height);
      cg.drawImage(canvas, 0, 0);
      g.clearRect(0, 0, canvas.width, canvas.height);
      g.filter = 'blur(' + rad + 'px)';
      g.drawImage(copy, 0, 0);
      g.filter = 'none';
      return;
    }
    boxBlurCanvas(canvas, rad);
    if (rad > 2) boxBlurCanvas(canvas, rad - 1);
  }

  function extractBright(canvas) {
    const g = canvas.getContext('2d');
    const img = g.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const gc = d[i + 1];
      const b = d[i + 2];
      const a = d[i + 3];
      if (a < 8) {
        d[i + 3] = 0;
        continue;
      }
      const max = r > gc ? (r > b ? r : b) : (gc > b ? gc : b);
      const min = r < gc ? (r < b ? r : b) : (gc < b ? gc : b);
      const luma = (r * 3 + gc * 6 + b) * 0.1;
      const sat = max > 0 ? (max - min) / max : 0;
      if (max < 168 || luma < 112 || sat < 0.14) {
        d[i + 3] = 0;
        continue;
      }
      let knee = (luma - 112) / 100;
      if (knee < 0) knee = 0;
      else if (knee > 1) knee = 1;
      knee = knee * knee * (3 - 2 * knee);
      const warm = r >= b ? 1.05 : 0.96;
      d[i] = Math.min(255, r * (0.72 + knee * 0.4) * warm);
      d[i + 1] = Math.min(255, gc * (0.68 + knee * 0.38));
      d[i + 2] = Math.min(255, b * (0.64 + knee * 0.4));
      d[i + 3] = Math.min(255, 230 * knee);
    }
    g.putImageData(img, 0, 0);
  }

  function buildCityGlow() {
    let minX = 0;
    let minY = 0;
    let maxX = BLOCK;
    let maxY = BLOCK;
    let any = false;
    for (const ch of chunks.values()) {
      const x = ch.bx * BLOCK;
      const y = ch.by * BLOCK;
      if (!any || x < minX) minX = x;
      if (!any || y < minY) minY = y;
      if (!any || x + BLOCK > maxX) maxX = x + BLOCK;
      if (!any || y + BLOCK > maxY) maxY = y + BLOCK;
      any = true;
    }
    glowOriginX = minX;
    glowOriginY = minY;
    const w = Math.max(2, Math.ceil((maxX - minX) * 0.5));
    const h = Math.max(2, Math.ceil((maxY - minY) * 0.5));
    if (w > 2048 || h > 2048) return;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    const gx = (x) => (x - glowOriginX) * 0.5;
    const gy = (y) => (y - glowOriginY) * 0.5;
    for (let i = 0; i < props.length; i++) {
      const pr = props[i];
      if (pr.kind === 'tree') continue;
      if (pr.kind === 'car') {
        for (let k = 0; k < pr.lights.length; k++) {
          const L = pr.lights[k];
          g.fillStyle = L.color;
          g.fillRect(gx(L.x) - 1.5, gy(L.y) - 1.5, 3, 3);
        }
        continue;
      }
      if (pr.kind === 'build') {
        for (let k = 0; k < pr.lights.length; k++) {
          const L = pr.lights[k];
          g.fillStyle = L.color;
          g.beginPath();
          g.arc(gx(L.x), gy(L.y), 3.5, 0, Math.PI * 2);
          g.fill();
        }
        continue;
      }
      const pw = pr.w || (pr.img && pr.img.width) || 8;
      const ph = pr.h || (pr.img && pr.img.height) || 8;
      const dw = Math.max(1, pw * 0.5);
      const dh = Math.max(1, ph * 0.5);
      if (!pr.img) continue;
      g.drawImage(pr.img, gx(pr.x), gy(pr.sortY - ph), dw, dh);
    }
    extractBright(c);
    fattenGlow(c);
    blurCanvas(c, 6);
    gainAlpha(c, 2.1, 132);
    cityGlow = c;
    const q = document.createElement('canvas');
    q.width = w >> 1;
    q.height = h >> 1;
    const qg = q.getContext('2d');
    qg.drawImage(c, 0, 0, q.width, q.height);
    blurCanvas(q, 8);
    gainAlpha(q, 1.45, 108);
    cityGlowQ = q;
  }

  function fattenGlow(canvas) {
    const key = 'fat-' + canvas.width + 'x' + canvas.height;
    let copy = blurScratch[key];
    if (!copy) {
      copy = document.createElement('canvas');
      copy.width = canvas.width;
      copy.height = canvas.height;
      blurScratch[key] = copy;
    }
    const cg = copy.getContext('2d');
    cg.clearRect(0, 0, copy.width, copy.height);
    cg.drawImage(canvas, 0, 0);
    const g = canvas.getContext('2d');
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.75;
    g.drawImage(copy, 1, 0);
    g.drawImage(copy, -1, 0);
    g.drawImage(copy, 0, 1);
    g.drawImage(copy, 0, -1);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  function gainAlpha(canvas, gain, cap) {
    const g = canvas.getContext('2d');
    const img = g.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    const ceil = cap || 255;
    for (let i = 3; i < d.length; i += 4) {
      if (d[i] === 0) continue;
      let boosted = d[i] * gain;
      if (boosted > ceil) boosted = ceil + (boosted - ceil) * 0.22;
      if (boosted > ceil + 36) boosted = ceil + 36;
      d[i] = boosted > 255 ? 255 : boosted;
      if (cap) {
        for (let c = i - 3; c < i; c++) {
          let v = d[c];
          if (v > 188) v = 188 + (v - 188) * 0.35;
          d[c] = v > 230 ? 230 : v;
        }
      }
    }
    g.putImageData(img, 0, 0);
  }

  function blitGlow(src, scale) {
    const sx = (cam.x - glowOriginX) * scale;
    const sy = (cam.y - glowOriginY) * scale;
    const srcX = Math.max(0, sx);
    const srcY = Math.max(0, sy);
    const destX = glowOriginX - cam.x + srcX / scale;
    const destY = glowOriginY - cam.y + srcY / scale;
    const sw = Math.min(src.width - srcX, (view.w - destX) * scale);
    const sh = Math.min(src.height - srcY, (view.h - destY) * scale);
    if (sw <= 1 || sh <= 1) return;
    ctx.drawImage(src, srcX, srcY, sw, sh, destX, destY, sw / scale, sh / scale);
  }

  function paintDynamicBloom() {
    const bw = Math.max(2, view.w >> 1);
    const bh = Math.max(2, view.h >> 1);
    if (!bloomHalf || bloomHalf.width !== bw || bloomHalf.height !== bh) {
      bloomHalf = document.createElement('canvas');
      bloomHalf.width = bw;
      bloomHalf.height = bh;
    }
    const qw = Math.max(2, bw >> 1);
    const qh = Math.max(2, bh >> 1);
    if (!bloomQuarter || bloomQuarter.width !== qw || bloomQuarter.height !== qh) {
      bloomQuarter = document.createElement('canvas');
      bloomQuarter.width = qw;
      bloomQuarter.height = qh;
    }
    const low = quality === 'low';
    if (!low || (fxFrame & 1) === 0) {
      const b = bloomHalf.getContext('2d');
      b.setTransform(1, 0, 0, 1, 0, 0);
      b.imageSmoothingEnabled = true;
      b.clearRect(0, 0, bw, bh);
      b.globalCompositeOperation = 'lighter';
      const cap = low ? 4 : 8;
      let n = 0;
      const stamp = (x, y, color, alpha, rad) => {
        if (n >= cap || !onScreen(x, y, 16)) return;
        n += 1;
        const spr = bloomSprite(color);
        b.globalAlpha = alpha;
        b.drawImage(spr, (x - cam.x) * 0.5 - rad, (y - cam.y) * 0.5 - rad, rad * 2, rad * 2);
      };
      for (let i = 0; i < gems.length && n < cap; i++) {
        const gem = gems[i];
        if (!gem.alive) continue;
        const color = gem.value >= 8 ? '#9eecff' : gem.value >= 3 ? '#ffe14a' : '#e2b6ff';
        stamp(gem.x, gem.y, color, 0.62, low ? 8 : 11);
      }
      for (let i = 0; i < flashes.length && n < cap; i++) {
        const f = flashes[i];
        if (f.life <= 0) continue;
        stamp(f.x, f.y, f.color || '#fff6b0', Math.max(0.28, Math.min(0.7, f.life / f.max)), low ? 9 : 12);
      }
      b.globalAlpha = 1;
      b.globalCompositeOperation = 'source-over';
      bloomLive = n;
      if (n > 0) {
        blurCanvas(bloomHalf, low ? 1 : 2);
        if (!low && (fxFrame & 1) === 0) {
          const qg = bloomQuarter.getContext('2d');
          qg.setTransform(1, 0, 0, 1, 0, 0);
          qg.clearRect(0, 0, qw, qh);
          qg.drawImage(bloomHalf, 0, 0, qw, qh);
        }
      }
    }
    if (!bloomLive) return;
    ctx.globalAlpha = low ? 0.34 : 0.48;
    ctx.drawImage(bloomHalf, 0, 0, view.w, view.h);
    if (!low) {
      ctx.globalAlpha = 0.22;
      ctx.drawImage(bloomQuarter, 0, 0, view.w, view.h);
    }
  }

  function paintBloom() {
    if (!cityGlow) return;
    const low = quality === 'low';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = low ? 0.4 : 0.55;
    blitGlow(cityGlow, 0.5);
    if (!low && cityGlowQ) {
      ctx.globalAlpha = 0.26;
      blitGlow(cityGlowQ, 0.25);
    }
    paintDynamicBloom();
    ctx.imageSmoothingEnabled = false;
    ctx.restore();
  }

  function paintEdgeBlur() {
    const dw = Math.max(2, view.w >> 2);
    const dh = Math.max(2, view.h >> 2);
    if (!dofCanvas || dofCanvas.width !== dw || dofCanvas.height !== dh) {
      dofCanvas = document.createElement('canvas');
      dofCanvas.width = dw;
      dofCanvas.height = dh;
      dofGrad = null;
    }
    if ((fxFrame & 3) === 0) {
      const d = dofCanvas.getContext('2d');
      d.setTransform(1, 0, 0, 1, 0, 0);
      d.clearRect(0, 0, dw, dh);
      try { d.filter = 'blur(1px)'; } catch (err) { d.filter = 'none'; }
      d.drawImage(canvas, 0, 0, dw, dh);
      d.filter = 'none';
      d.globalCompositeOperation = 'destination-in';
      if (!dofGrad) {
        const inner = Math.min(dw, dh) * 0.42;
        dofGrad = d.createRadialGradient(dw / 2, dh / 2, inner, dw / 2, dh / 2, Math.max(dw, dh) * 0.72);
        dofGrad.addColorStop(0, 'rgba(0,0,0,0)');
        dofGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
      }
      d.fillStyle = dofGrad;
      d.fillRect(0, 0, dw, dh);
      d.globalCompositeOperation = 'source-over';
    }
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = 0.65;
    ctx.drawImage(dofCanvas, 0, 0, view.w, view.h);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
  }

  function syncHud() {
    if (!player || hud.hidden) return;
    const hpPct = player.maxHp > 0 ? Math.max(0, player.hp / player.maxHp) : 0;
    hpFill.style.width = (hpPct * 100) + '%';
    hpFill.classList.toggle('low', hpPct > 0 && hpPct <= 0.3);
    hpFill.classList.toggle('mid', hpPct > 0.3 && hpPct <= 0.6);
    hpText.textContent = Math.max(0, Math.ceil(player.hp)) + '/' + player.maxHp;
    const xpPct = player.next > 0 ? Math.max(0, Math.min(1, player.xp / player.next)) : 0;
    xpFill.style.width = (xpPct * 100) + '%';
    timerEl.textContent = fmtTime(elapsed);
    levelEl.textContent = 'LV ' + player.level;
    killsEl.textContent = 'KO ' + kills;
    hint.hidden = !(state === 'play' && elapsed < 12 && !moved);
    let boss = null;
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].alive && enemies[i].type === 'boss') boss = enemies[i];
    }
    bossbar.hidden = !boss;
    if (boss) bossFill.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%';
  }

  function refreshWeaponIcons() {
    const spec = [
      ['crystal', spr.crystal],
      ['carts', spr.cart],
      ['bass', spr.speaker],
      ['bottle', spr.bottle],
    ];
    weaponIcons.replaceChildren();
    for (let i = 0; i < spec.length; i++) {
      if (!weapons[spec[i][0]]) continue;
      const img = spec[i][1];
      const c = document.createElement('canvas');
      c.width = 22;
      c.height = 22;
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      const fit = Math.min(18 / img.width, 18 / img.height);
      const dw = Math.max(1, Math.round(img.width * fit));
      const dh = Math.max(1, Math.round(img.height * fit));
      g.drawImage(img, 0, 0, img.width, img.height, ((22 - dw) / 2) | 0, ((22 - dh) / 2) | 0, dw, dh);
      weaponIcons.append(c);
    }
  }

  function freshPlayer() {
    return {
      x: (9 + 0.5) * TILE,
      y: (4 + 0.5) * TILE,
      hp: 240,
      maxHp: 240,
      level: 1,
      xp: 0,
      next: xpFor(1),
      radius: 6,
      facing: 1,
      moving: false,
      iframe: 0,
      flash: 0,
      armorLv: 0,
      regen: 0,
      regenLv: 0,
      mightLv: 0,
      speedLv: 0,
      magnetLv: 0,
      xpLv: 0,
      hpLv: 0,
      kvx: 0,
      kvy: 0,
      vx: 0,
      vy: 0,
      pose: 'down',
      flip: false,
      cast: 0,
      castKind: '',
      hold: 'crystal',
      swing: 0,
      swingMax: 0.42,
    };
  }

  function fallbackUpgrade() {
    return {
      tag: 'HEALTH',
      name: 'Another hoodie',
      desc: 'A little more max health. The cards ran out of ideas.',
      weapon: false,
      apply() {
        player.maxHp += 8;
        player.hp = Math.min(player.maxHp, player.hp + 8);
      },
    };
  }

  function rollChoices() {
    const bag = [];
    for (let i = 0; i < UPGRADES.length; i++) {
      const u = UPGRADES[i];
      if (u.ok()) bag.push({ u: u, w: u.weight || 1 });
    }
    const picked = [];
    while (picked.length < 3 && bag.length) {
      let total = 0;
      for (let i = 0; i < bag.length; i++) total += bag[i].w;
      let r = Math.random() * total;
      let idx = bag.length - 1;
      for (let i = 0; i < bag.length; i++) {
        r -= bag[i].w;
        if (r <= 0) {
          idx = i;
          break;
        }
      }
      picked.push(bag[idx].u);
      bag.splice(idx, 1);
    }
    while (picked.length < 3) picked.push(fallbackUpgrade());
    return picked;
  }

  function openLevel() {
    state = 'levelup';
    choices = rollChoices();
    lvNum.textContent = String(player.level);
    cardsEl.replaceChildren();
    for (let i = 0; i < choices.length; i++) {
      const u = choices[i];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card' + (u.weapon ? ' weapon' : '');
      const key = document.createElement('span');
      key.className = 'key';
      key.textContent = String(i + 1);
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = u.tag;
      const name = document.createElement('strong');
      name.textContent = u.name;
      const desc = document.createElement('em');
      desc.textContent = typeof u.desc === 'function' ? u.desc() : u.desc;
      btn.append(key, tag, name, desc);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        choose(i);
      });
      cardsEl.append(btn);
    }
    titleScreen.hidden = true;
    deadScreen.hidden = true;
    levelScreen.hidden = false;
    overlay.hidden = false;
    burst(player.x, player.y, '#ffe14a', 14);
    addShake(2);
    sfx.level();
  }

  function choose(i) {
    if (state !== 'levelup' || choosing) return;
    const u = choices[i];
    if (!u) return;
    choosing = true;
    u.apply();
    player.regen = regenStat();
    sfx.pick();
    pending = Math.max(0, pending - 1);
    refreshWeaponIcons();
    choosing = false;
    if (player.hp <= 0) {
      die();
      return;
    }
    if (pending > 0) openLevel();
    else resume();
  }

  function resume() {
    state = 'play';
    levelScreen.hidden = true;
    deadScreen.hidden = true;
    overlay.hidden = true;
    hud.hidden = false;
  }

  function showDead() {
    deadStats.replaceChildren();
    const rows = [
      ['Time', fmtTime(elapsed)],
      ['Level', String(player.level)],
      ['KO', String(kills)],
    ];
    for (let i = 0; i < rows.length; i++) {
      const row = document.createElement('div');
      const a = document.createElement('span');
      a.textContent = rows[i][0];
      const b = document.createElement('span');
      b.textContent = rows[i][1];
      row.append(a, b);
      deadStats.append(row);
    }
    titleScreen.hidden = true;
    levelScreen.hidden = true;
    deadScreen.hidden = false;
    overlay.hidden = false;
    hud.hidden = false;
  }

  function die() {
    if (state === 'dead') return;
    state = 'dead';
    pending = 0;
    player.iframe = 0;
    sfx.dead();
    showDead();
  }

  function spawnIntro() {
    const offsets = [[120, 36], [48, 130]];
    for (let i = 0; i < offsets.length; i++) {
      const spot = findOpen(player.x + offsets[i][0], player.y + offsets[i][1], 7);
      if (spot) enemies.push(makeEnemy('zombie', spot.x, spot.y));
    }
  }

  function beginRun(playing) {
    player = freshPlayer();
    const spot = findOpen(player.x, player.y, player.radius);
    if (spot) {
      player.x = spot.x;
      player.y = spot.y;
    }
    weapons = {
      crystal: { dmgLv: 1, rateLv: 1, countLv: 1, pierceLv: 0, t: 0.2 },
      carts: null,
      bass: null,
      bottle: null,
    };
    enemies = [];
    shots = [];
    bullets = [];
    gems = [];
    particles = [];
    waves = [];
    barks = [];
    flashes = [];
    choices = [];
    elapsed = 0;
    kills = 0;
    pending = 0;
    spawnT = 1;
    nextBoss = 75;
    shake = 0;
    moved = false;
    bannerTimer = 0;
    banner.hidden = true;
    wanted = 0;
    wantedCool = 0;
    skids = [];
    gibs = [];
    stains = [];
    for (let i = 0; i < street.length; i++) {
      const pr = street[i];
      pr.alive = true;
      pr.hp = pr.maxHp;
      pr.dying = 0;
      pr.spray = 0;
      pr.vx = 0;
      pr.vy = 0;
      pr.ang = 0;
    }
    aimX = 1;
    aimY = 0;
    choosing = false;
    if (playing) {
      state = 'play';
      spawnIntro();
      titleScreen.hidden = true;
      levelScreen.hidden = true;
      deadScreen.hidden = true;
      overlay.hidden = true;
      hud.hidden = false;
      refreshWeaponIcons();
    } else {
      state = 'title';
      overlay.hidden = false;
      titleScreen.hidden = false;
      levelScreen.hidden = true;
      deadScreen.hidden = true;
      hud.hidden = true;
    }
    snapCamera();
  }

  const UPGRADES = [
    {
      tag: 'NEW WEAPON', name: 'Shopping Cart Ring', weapon: true, weight: 4,
      desc: 'Empty carts orbit you and bump people out of the way.',
      ok: () => !weapons.carts,
      apply: () => { weapons.carts = { dmgLv: 1, countLv: 2, ang: 0, pos: [], t: 0 }; },
    },
    {
      tag: 'NEW WEAPON', name: 'Bass Boom', weapon: true, weight: 4,
      desc: 'A shockwave of terrible disco. Hits everyone close.',
      ok: () => !weapons.bass,
      apply: () => { weapons.bass = { dmgLv: 1, rateLv: 1, radLv: 1, t: 0.4 }; },
    },
    {
      tag: 'NEW WEAPON', name: 'Soda Rain', weapon: true, weight: 4,
      desc: 'Lobs empty soda bottles that pop on the street.',
      ok: () => !weapons.bottle,
      apply: () => { weapons.bottle = { dmgLv: 1, countLv: 3, radLv: 1, t: 0.3 }; },
    },
    {
      tag: 'WEAPON', name: 'More glitter', weapon: false, weight: 1,
      desc: () => 'Crystal damage ' + weapons.crystal.dmgLv + ' → ' + (weapons.crystal.dmgLv + 1) + '.',
      ok: () => weapons.crystal && weapons.crystal.dmgLv < 5,
      apply: () => { weapons.crystal.dmgLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Quicker sling', weapon: false, weight: 1,
      desc: () => 'Glitter comes out faster. Rank ' + weapons.crystal.rateLv + ' → ' + (weapons.crystal.rateLv + 1) + '.',
      ok: () => weapons.crystal && weapons.crystal.rateLv < 5,
      apply: () => { weapons.crystal.rateLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Extra spark', weapon: false, weight: 1,
      desc: () => 'Fire one more crystal (' + weapons.crystal.countLv + ' → ' + (weapons.crystal.countLv + 1) + ').',
      ok: () => weapons.crystal && weapons.crystal.countLv < 5,
      apply: () => { weapons.crystal.countLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Glitter skewer', weapon: false, weight: 1,
      desc: () => 'Crystals pass through one more enemy.',
      ok: () => weapons.crystal && weapons.crystal.pierceLv < 3,
      apply: () => { weapons.crystal.pierceLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'One more cart', weapon: false, weight: 1,
      desc: () => 'More carts in the ring (' + weapons.carts.countLv + ' → ' + (weapons.carts.countLv + 1) + ').',
      ok: () => weapons.carts && weapons.carts.countLv < 6,
      apply: () => { weapons.carts.countLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Heavier carts', weapon: false, weight: 1,
      desc: () => 'Carts hit harder. Rank ' + weapons.carts.dmgLv + ' → ' + (weapons.carts.dmgLv + 1) + '.',
      ok: () => weapons.carts && weapons.carts.dmgLv < 5,
      apply: () => { weapons.carts.dmgLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Wider bass', weapon: false, weight: 1,
      desc: () => 'The shockwave reaches farther. Rank ' + weapons.bass.radLv + ' → ' + (weapons.bass.radLv + 1) + '.',
      ok: () => weapons.bass && weapons.bass.radLv < 5,
      apply: () => { weapons.bass.radLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Faster drop', weapon: false, weight: 1,
      desc: () => 'The bass hits more often. Rank ' + weapons.bass.rateLv + ' → ' + (weapons.bass.rateLv + 1) + '.',
      ok: () => weapons.bass && weapons.bass.rateLv < 5,
      apply: () => { weapons.bass.rateLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Heavier drop', weapon: false, weight: 1,
      desc: () => 'The bass hits harder. Rank ' + weapons.bass.dmgLv + ' → ' + (weapons.bass.dmgLv + 1) + '.',
      ok: () => weapons.bass && weapons.bass.dmgLv < 5,
      apply: () => { weapons.bass.dmgLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'More bottles', weapon: false, weight: 1,
      desc: () => 'One more bottle in the air (' + weapons.bottle.countLv + ' → ' + (weapons.bottle.countLv + 1) + ').',
      ok: () => weapons.bottle && weapons.bottle.countLv < 6,
      apply: () => { weapons.bottle.countLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Stickier soda', weapon: false, weight: 1,
      desc: () => 'The bottle pop gets bigger. Rank ' + weapons.bottle.radLv + ' → ' + (weapons.bottle.radLv + 1) + '.',
      ok: () => weapons.bottle && weapons.bottle.radLv < 4,
      apply: () => { weapons.bottle.radLv += 1; },
    },
    {
      tag: 'WEAPON', name: 'Sour soda', weapon: false, weight: 1,
      desc: () => 'Bottles hit harder. Rank ' + weapons.bottle.dmgLv + ' → ' + (weapons.bottle.dmgLv + 1) + '.',
      ok: () => weapons.bottle && weapons.bottle.dmgLv < 5,
      apply: () => { weapons.bottle.dmgLv += 1; },
    },
    {
      tag: 'BODY', name: 'Caffeine soles', weapon: false, weight: 1,
      desc: () => 'You run faster. Rank ' + player.speedLv + ' → ' + (player.speedLv + 1) + '.',
      ok: () => player.speedLv < 5,
      apply: () => { player.speedLv += 1; },
    },
    {
      tag: 'BODY', name: 'Extra hoodie', weapon: false, weight: 1,
      desc: 'More max health, and a sip on the house (+25).',
      ok: () => player.hpLv < 6,
      apply: () => {
        player.hpLv += 1;
        player.maxHp += 25;
        player.hp = Math.min(player.maxHp, player.hp + 25);
      },
    },
    {
      tag: 'BODY', name: 'Magnet pocket', weapon: false, weight: 1,
      desc: () => 'Glitter gets pulled from farther away. Rank ' + player.magnetLv + ' → ' + (player.magnetLv + 1) + '.',
      ok: () => player.magnetLv < 5,
      apply: () => { player.magnetLv += 1; },
    },
    {
      tag: 'BODY', name: 'Newspaper armor', weapon: false, weight: 1,
      desc: () => 'You take less damage. Rank ' + player.armorLv + ' → ' + (player.armorLv + 1) + '.',
      ok: () => player.armorLv < 5,
      apply: () => { player.armorLv += 1; },
    },
    {
      tag: 'BODY', name: 'Second wind', weapon: false, weight: 1,
      desc: () => 'You heal slowly. Rank ' + player.regenLv + ' → ' + (player.regenLv + 1) + '.',
      ok: () => player.regenLv < 4,
      apply: () => { player.regenLv += 1; },
    },
    {
      tag: 'BODY', name: 'Heavier hands', weapon: false, weight: 1,
      desc: () => 'All damage +10%. Rank ' + player.mightLv + ' → ' + (player.mightLv + 1) + '.',
      ok: () => player.mightLv < 5,
      apply: () => { player.mightLv += 1; },
    },
    {
      tag: 'BODY', name: 'Bigger pockets', weapon: false, weight: 1,
      desc: () => 'More XP per glitter. Rank ' + player.xpLv + ' → ' + (player.xpLv + 1) + '.',
      ok: () => player.xpLv < 4,
      apply: () => { player.xpLv += 1; },
    },
    {
      tag: 'HEALTH', name: 'Coffee break', weapon: false, weight: 3,
      desc: 'Get 45 health back. Cartoon coffee, nothing else.',
      ok: () => player.hp < player.maxHp - 8,
      apply: () => { player.hp = Math.min(player.maxHp, player.hp + 45); },
    },
  ];

  function makeMote() {
    return {
      x: cam.x + Math.random() * Math.max(1, view.w),
      y: cam.y + Math.random() * Math.max(1, view.h),
      vx: -8 + Math.random() * 16,
      vy: -14 - Math.random() * 10,
      neon: Math.random() < 0.2,
      size: 1 + ((Math.random() * 2) | 0),
    };
  }

  function tickMotes(dt) {
    const cap = quality === 'low' ? 16 : 40;
    if (reduceMotion) {
      motes.length = 0;
      return;
    }
    if (motes.length > cap) motes.length = cap;
    while (motes.length < cap) motes.push(makeMote());
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.x < cam.x - 16 || m.x > cam.x + view.w + 16 || m.y < cam.y - 16 || m.y > cam.y + view.h + 16) {
        motes[i] = makeMote();
      }
    }
  }

  function loop(now) {
    if (!lastTs) lastTs = now;
    const dt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    globalTime += dt;
    const hidden = document.hidden;
    if (state === 'play' && !hidden) update(dt);
    if (bannerTimer > 0) {
      bannerTimer -= dt;
      if (bannerTimer <= 0) banner.hidden = true;
    }
    shake = Math.max(0, shake - dt * 14);
    updateCamera(dt);
    if (player) streamAround(player.x, player.y);
    fxFrame++;
    if (!hidden) {
      updateAmbience(dt);
      updateGore(dt);
      if (dt > 0.042) {
        slowStreak++;
        fastStreak = 0;
      } else {
        fastStreak++;
        slowStreak = Math.max(0, slowStreak - 1);
      }
      if (slowStreak > 40) quality = 'low';
      if (quality === 'low' && fastStreak > 90) quality = 'high';
      tickMotes(dt);
    }
    draw();
    syncHud();
    requestAnimationFrame(loop);
  }

  const CODE = {
    KeyW: 'up', ArrowUp: 'up',
    KeyS: 'down', ArrowDown: 'down',
    KeyA: 'left', ArrowLeft: 'left',
    KeyD: 'right', ArrowRight: 'right',
  };

  window.addEventListener('keydown', (e) => {
    sfx.unlock();
    const dir = CODE[e.code];
    if (dir) {
      held[dir] = true;
      e.preventDefault();
    }
    if (e.code === 'Space' || (e.code && e.code.indexOf('Arrow') === 0)) e.preventDefault();
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (state === 'title') startGame();
    else if (state === 'levelup') {
      if (e.code === 'Digit1' || e.code === 'Numpad1') choose(0);
      else if (e.code === 'Digit2' || e.code === 'Numpad2') choose(1);
      else if (e.code === 'Digit3' || e.code === 'Numpad3') choose(2);
    } else if (state === 'dead' && (e.code === 'Enter' || e.code === 'Space')) restart();
  });

  window.addEventListener('keyup', (e) => {
    const dir = CODE[e.code];
    if (dir) held[dir] = false;
  });

  function applyStick(clientX, clientY) {
    if (!stickEl) return;
    const rect = stickEl.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const max = rect.width * 0.34;
    stickX = max ? dx / max : 0;
    stickY = max ? dy / max : 0;
    const mag = Math.hypot(stickX, stickY);
    if (mag > 1) {
      stickX /= mag;
      stickY /= mag;
    }
    if (stickKnob) {
      const k = Math.min(1, mag || 0);
      stickKnob.style.transform = 'translate(' + (dx / (mag || 1)) * max * k + 'px,' + (dy / (mag || 1)) * max * k + 'px)';
    }
  }

  function clearStick() {
    stickX = 0;
    stickY = 0;
    if (stickKnob) stickKnob.style.transform = 'translate(0,0)';
  }

  if (stickEl) {
    stickEl.addEventListener('pointerdown', (e) => {
      stickEl.setPointerCapture(e.pointerId);
      applyStick(e.clientX, e.clientY);
      e.preventDefault();
    });
    stickEl.addEventListener('pointermove', (e) => {
      if (e.buttons || e.pressure > 0) applyStick(e.clientX, e.clientY);
    });
    stickEl.addEventListener('pointerup', clearStick);
    stickEl.addEventListener('pointercancel', clearStick);
  }

  window.addEventListener('blur', () => {
    held.up = held.down = held.left = held.right = false;
  });

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { lastTs = 0; });

  window.addEventListener('contextmenu', (e) => e.preventDefault());

  function startGame() {
    if (state !== 'title') return;
    sfx.unlock();
    beginRun(true);
  }

  function restart() {
    if (state !== 'dead') return;
    sfx.unlock();
    beginRun(true);
  }

  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startGame();
  });
  retryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    restart();
  });

  overlay.addEventListener('click', (e) => {
    sfx.unlock();
    if (state === 'title') startGame();
    else if (state === 'dead') restart();
  });

  if (goreBtn) {
    goreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goreOn = !goreOn;
      if (!goreOn) {
        gibs = [];
        stains = [];
      }
      syncGore();
      try { localStorage.setItem('gta-meth-gore', goreOn ? '1' : '0'); } catch (err) { /* ignore */ }
    });
  }

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sfx.unlock();
    sfx.muted = !sfx.muted;
    syncMute();
    try { localStorage.setItem('gta-meth-mute', sfx.muted ? '1' : '0'); } catch (err) { /* ignore */ }
    if (!sfx.muted) sfx.pick();
  });

  resize();
  buildSprites();
  function bootWorld() {
    buildMap();
    beginRun(false);
    requestAnimationFrame(loop);
  }
  const artReady = [];
  if (window.GTAHand && window.GTAHand.loaded) artReady.push(window.GTAHand.loaded);
  if (window.GTAPlayer && window.GTAPlayer.loaded) artReady.push(window.GTAPlayer.loaded);
  Promise.all(artReady).then(bootWorld, bootWorld);
})();
