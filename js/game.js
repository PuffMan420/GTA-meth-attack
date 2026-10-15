// GTA Meth Attack — the whole game. No build step. This file plus index.html.
(() => {
  'use strict';

  const TILE = 16;
  const MAP = 90;
  const PERIOD = 18;
  const TW = 6;
  const WORLD = MAP * TILE;
  const MAX_ENEMIES = 65;
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
    { wall: '#3a4268', roof: '#2c3354', win: '#f2d56b', off: '#1a1e30' },
    { wall: '#6a3a4a', roof: '#4c2836', win: '#8fd0e8', off: '#241820' },
    { wall: '#3e5a48', roof: '#2a4034', win: '#f0e2a0', off: '#162018' },
    { wall: '#5a4634', roof: '#3e3226', win: '#ffb070', off: '#201810' },
    { wall: '#4a3c68', roof: '#322848', win: '#e090e8', off: '#1a1424' },
    { wall: '#3a4e5c', roof: '#2a3844', win: '#d8ecff', off: '#141c22' },
  ];
  const NEONS = ['#ff4d8d', '#5ce1e6', '#ffe14a', '#b06bff', '#3dff8a'];
  const CAR_COLORS = ['#e23b4a', '#3aa0e8', '#f2c14a', '#f4f4f8', '#7a4ae0', '#3ecf6e', '#ff8a3d'];

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
  const joystick = document.getElementById('joystick');
  const knob = document.getElementById('knob');
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

  let tiles = new Uint8Array(MAP * MAP);
  let solid = new Uint8Array(MAP * MAP);
  let mapCanvas = null;
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
  let joyX = 0;
  let joyY = 0;
  let joyId = null;
  let wantJoy = window.matchMedia('(pointer: coarse)').matches;
  let lastTs = 0;
  let choosing = false;
  let flashes = [];
  let fountains = [];
  let props = [];
  let motes = [];
  let folk = [];
  let traffic = [];
  let pigeons = [];
  let manholes = [];
  let puddles = [];
  let signals = [];
  let quality = 'high';
  let slowStreak = 0;
  let fastStreak = 0;
  let lightCanvas = null;
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
    return Math.round(6 + n * 4 + n * n * 0.55);
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
      spr.player = art.cast.player.walk.down;
    }
  }

  function blockKind(bx, by) {
    if (bx === 2 && by === 2) return 0;
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
    const mx = tx % PERIOD;
    const my = ty % PERIOD;
    const bx = (tx / PERIOD) | 0;
    const by = (ty / PERIOD) | 0;
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

  function paintMap() {
    mapCanvas = document.createElement('canvas');
    mapCanvas.width = WORLD;
    mapCanvas.height = WORLD;
    const g = mapCanvas.getContext('2d');
    signs = [];
    fountains = [];
    for (let ty = 0; ty < MAP; ty++) {
      for (let tx = 0; tx < MAP; tx++) {
        const type = tiles[ty * MAP + tx];
        const px = tx * TILE;
        const py = ty * TILE;
        const mx = tx % PERIOD;
        const my = ty % PERIOD;
        const vert = mx < TW;
        const horiz = my < TW;
        const onRoad = vert || horiz;
        if (type === T_CAR && !onRoad) {
          g.fillStyle = '#3a3848';
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = '#2e2c3a';
          g.fillRect(px + (hash(tx, ty) % 8), py + (hash(ty, tx) % 8), 2, 2);
          if ((tx & 3) === 0) {
            g.fillStyle = '#d6c36a';
            g.fillRect(px, py + 7, 7, 2);
          }
        } else if (type === T_ROAD || type === T_CAR) {
          g.fillStyle = '#32303e';
          g.fillRect(px, py, TILE, TILE);
          const speck = hash(tx, ty);
          if (speck % 5 === 0) {
            g.fillStyle = '#262432';
            g.fillRect(px + (speck % 10), py + (hash(ty + 2, tx) % 10), 2, 2);
          }
          if (speck % 9 === 1) {
            g.fillStyle = '#3c3a4c';
            g.fillRect(px + 4, py + 11, 3, 1);
          }
          if (horiz && !vert && my === 3 && (tx & 1) === 0) {
            g.fillStyle = '#e6d27a';
            g.fillRect(px + 2, py + 7, 8, 2);
          }
          if (vert && !horiz && mx === 3 && (ty & 1) === 0) {
            g.fillStyle = '#e6d27a';
            g.fillRect(px + 7, py + 2, 2, 8);
          }
          if (horiz && mx === TW && (my & 1) === 0) {
            g.fillStyle = '#f4f1ea';
            g.fillRect(px, py + 1, 3, TILE - 2);
          }
          if (vert && my === TW && (mx & 1) === 0) {
            g.fillStyle = '#f4f1ea';
            g.fillRect(px + 1, py, TILE - 2, 3);
          }
          if (type === T_ROAD && speck % 41 === 0 && !vert === !horiz) {
            g.fillStyle = '#1c1a24';
            g.fillRect(px + 4, py + 4, 8, 8);
            g.fillStyle = '#4a4658';
            g.fillRect(px + 6, py + 6, 4, 4);
            g.fillStyle = '#6a6578';
            g.fillRect(px + 7, py + 7, 2, 2);
          }
        } else if (type === T_SIDE) {
          g.fillStyle = '#8d7b6c';
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = '#6e5e52';
          const brick = (ty & 1) ? 0 : 8;
          g.fillRect(px, py + 4, TILE, 1);
          g.fillRect(px, py + 8, TILE, 1);
          g.fillRect(px, py + 12, TILE, 1);
          g.fillRect(px + brick, py, 1, 4);
          g.fillRect(px + ((brick + 8) & 15), py + 4, 1, 4);
          g.fillRect(px + brick, py + 8, 1, 4);
          g.fillRect(px + ((brick + 8) & 15), py + 12, 1, 4);
          if (hash(tx, ty) % 6 === 0) {
            g.fillStyle = '#a89484';
            g.fillRect(px + 2, py + 1, 3, 2);
          }
          const i = ty * MAP + tx;
          g.fillStyle = '#3e3a48';
          if (ty > 0 && tiles[i - MAP] === T_ROAD) g.fillRect(px, py, TILE, 2);
          if (ty < MAP - 1 && tiles[i + MAP] === T_ROAD) g.fillRect(px, py + TILE - 2, TILE, 2);
          if (tx > 0 && tiles[i - 1] === T_ROAD) g.fillRect(px, py, 2, TILE);
          if (tx < MAP - 1 && tiles[i + 1] === T_ROAD) g.fillRect(px + TILE - 2, py, 2, TILE);
        } else if (type === T_BUILD) {
          g.fillStyle = '#16141e';
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = '#221e2c';
          g.fillRect(px + (hash(tx, ty) % 10), py + (hash(ty, tx) % 10), 3, 2);
        } else if (type === T_GRASS || type === T_TREE) {
          g.fillStyle = ((tx + ty) & 1) === 0 ? '#1c6a36' : '#248044';
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = ((tx * 3 + ty) & 3) === 0 ? '#176030' : '#2e9650';
          g.fillRect(px + (hash(tx, ty) % 10), py + (hash(ty, tx) % 10), 3, 2);
          if (hash(tx, ty) % 5 === 0 && type === T_GRASS) {
            g.fillStyle = hash(tx, ty) % 2 ? '#ff4d8d' : '#ffe14a';
            g.fillRect(px + 3 + (hash(tx, ty) % 8), py + 3 + (hash(ty, tx) % 8), 2, 2);
          }
        } else if (type === T_LOT) {
          g.fillStyle = '#3a3848';
          g.fillRect(px, py, TILE, TILE);
          if (hash(tx, ty) % 4 === 0) {
            g.fillStyle = '#322f40';
            g.fillRect(px + 2, py + 2, 2, 2);
          }
          if ((tx & 3) === 0) {
            g.fillStyle = '#d6c36a';
            g.fillRect(px, py + 7, 7, 2);
          }
        } else if (type === T_PLAZA) {
          const checker = ((tx + ty) & 1) === 0;
          g.fillStyle = checker ? '#7c7692' : '#564f68';
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = checker ? '#948eaa' : '#45405a';
          g.fillRect(px + 6, py + 6, 4, 4);
        } else if (type === T_FOUNT) {
          g.fillStyle = '#6a6480';
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = '#524c66';
          g.fillRect(px + 2, py + 2, 12, 12);
        }
      }
    }
    manholes = [];
    puddles = [];
    signals = [];
    for (let ty = 0; ty < MAP; ty++) {
      for (let tx = 0; tx < MAP; tx++) {
        const type = tiles[ty * MAP + tx];
        const px = tx * TILE;
        const py = ty * TILE;
        const n = hash(tx, ty);
        if (type === T_ROAD || type === T_CAR) {
          if (n % 17 === 3) {
            g.fillStyle = 'rgba(20,16,28,0.55)';
            g.fillRect(px + 2, py + 11, 7, 1);
            g.fillRect(px + 6, py + 8, 1, 5);
          }
          if (n % 29 === 4) {
            g.fillStyle = '#3a3848';
            g.fillRect(px + 3, py + 3, 10, 10);
            g.fillStyle = '#2a2834';
            g.fillRect(px + 5, py + 5, 6, 6);
            g.fillStyle = '#6a6578';
            g.fillRect(px + 7, py + 7, 2, 2);
            manholes.push({ x: px + 8, y: py + 8 });
          }
          if (n % 23 === 7) puddles.push({ x: px + 8, y: py + 10, phase: (n % 9) });
        } else if (type === T_SIDE) {
          if (n % 11 === 2) {
            g.fillStyle = 'rgba(40,24,18,0.45)';
            g.fillRect(px + 1, py + 4, 6, 1);
            g.fillRect(px + 4, py + 2, 1, 6);
          }
          if (n % 19 === 5) {
            g.fillStyle = n % 2 ? '#c46bff' : '#ff8a3d';
            g.fillRect(px + 3, py + 6, 4, 3);
            g.fillStyle = '#1a1420';
            g.fillRect(px + 4, py + 7, 2, 1);
          }
          if (n % 31 === 6) {
            g.fillStyle = '#f4f1ea';
            g.fillRect(px + 2, py + 2, 8, 6);
            g.fillStyle = '#ff4d8d';
            g.fillRect(px + 3, py + 3, 6, 2);
          }
        } else if (type === T_BUILD && n % 13 === 1) {
          g.fillStyle = n % 2 ? '#5ce1e6' : '#ff4d8d';
          g.globalAlpha = 0.35;
          g.fillRect(px + 1, py + 2, 9, 5);
          g.globalAlpha = 1;
        }
        const mx = tx % PERIOD;
        const my = ty % PERIOD;
        if (mx === TW && my === 0) signals.push({ x: px + 4, y: py - 4 });
      }
    }
  }

  function stretchStreetCars() {
    for (let ty = 0; ty < MAP; ty++) {
      for (let tx = 0; tx < MAP; tx++) {
        if (tiles[ty * MAP + tx] !== T_CAR) continue;
        const mx = tx % PERIOD;
        const my = ty % PERIOD;
        if (!(mx < TW || my < TW)) continue;
        const horiz = my < TW && !(mx < TW);
        for (let d = -2; d <= 2; d++) {
          if (!d) continue;
          const nx = tx + (horiz ? d : 0);
          const ny = ty + (horiz ? 0 : d);
          if (nx < 0 || ny < 0 || nx >= MAP || ny >= MAP) continue;
          const ni = ny * MAP + nx;
          if (tiles[ni] === T_ROAD) solid[ni] = 1;
        }
      }
    }
  }

  function buildMap() {
    tiles = new Uint8Array(MAP * MAP);
    solid = new Uint8Array(MAP * MAP);
    for (let ty = 0; ty < MAP; ty++) {
      for (let tx = 0; tx < MAP; tx++) {
        const t = computeTile(tx, ty);
        const i = ty * MAP + tx;
        tiles[i] = t;
        solid[i] = (t === T_BUILD || t === T_TREE || t === T_CAR || t === T_FOUNT) ? 1 : 0;
      }
    }
    stretchStreetCars();
    paintMap();
    buildProps();
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
    g.fillStyle = '#1f7a40';
    g.fillRect(18, 14, 16, 12);
    g.fillStyle = '#8dffb0';
    g.fillRect(26, 16, 6, 5);
    g.fillStyle = '#0e4a28';
    g.fillRect(34, 28, 12, 10);
    g.fillStyle = '#3ecf6e';
    g.fillRect(22, 22, 5, 4);
    g.globalCompositeOperation = 'source-over';
  }

  function makeBuildingSprite(fw, fh, pal, seed) {
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
    const hi = presentSprite(c);
    dressBuilding(hi);
    return { canvas: hi, lights: lights, eaves: eaves, neon: neon };
  }

  function makeTreeSprite() {
    const c = document.createElement('canvas');
    c.width = 56;
    c.height = 80;
    const g = c.getContext('2d');
    g.fillStyle = '#0b3a20';
    g.fillRect(4, 18, 48, 36);
    g.fillStyle = '#145c30';
    g.fillRect(10, 8, 36, 40);
    g.fillStyle = '#1f7a40';
    g.fillRect(16, 12, 22, 22);
    g.fillStyle = '#2f9a50';
    g.fillRect(20, 16, 8, 6);
    g.fillStyle = '#0e4a28';
    g.fillRect(30, 22, 12, 12);
    g.fillStyle = '#3a2416';
    g.fillRect(24, 50, 8, 28);
    g.fillStyle = '#6b4030';
    g.fillRect(24, 50, 3, 24);
    const hi = presentSprite(c);
    dressTree(hi);
    return hi;
  }

  function makeLampSprite() {
    const c = document.createElement('canvas');
    c.width = 14;
    c.height = 72;
    const g = c.getContext('2d');
    g.fillStyle = '#1a1822';
    g.fillRect(5, 16, 4, 52);
    g.fillStyle = '#4a4658';
    g.fillRect(5, 16, 1, 52);
    g.fillStyle = '#2a2834';
    g.fillRect(1, 8, 12, 8);
    g.fillStyle = '#ffe07a';
    g.fillRect(2, 9, 10, 6);
    g.fillStyle = '#fff3c0';
    g.fillRect(4, 10, 5, 3);
    g.fillStyle = '#3a3844';
    g.fillRect(2, 66, 10, 4);
    return presentSprite(c);
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
    const presented = presentSprite(c);
    dressCar(presented, horizontal);
    return presented;
  }

  function makeFountainSprite() {
    const c = document.createElement('canvas');
    c.width = 54;
    c.height = 48;
    const g = c.getContext('2d');
    g.fillStyle = '#3a3848';
    g.fillRect(4, 28, 46, 16);
    g.fillStyle = '#7a748c';
    g.fillRect(6, 22, 42, 16);
    g.fillStyle = '#1a6ea8';
    g.fillRect(12, 18, 30, 16);
    g.fillStyle = '#3ec2e0';
    g.fillRect(16, 16, 22, 12);
    g.fillStyle = '#d8fbff';
    g.fillRect(24, 8, 6, 12);
    g.fillRect(22, 6, 10, 3);
    g.fillStyle = '#9ad8ea';
    g.fillRect(18, 20, 6, 2);
    return presentSprite(c);
  }

  const carCache = {};
  let treeSprite = null;
  let lampSprite = null;
  let fountainSprite = null;

  function buildProps() {
    props = [];
    signs = [];
    fountains = [];
    treeSprite = makeTreeSprite();
    lampSprite = makeLampSprite();
    fountainSprite = makeFountainSprite();
    const blocks = (MAP / PERIOD) | 0;
    for (let by = 0; by < blocks; by++) {
      for (let bx = 0; bx < blocks; bx++) {
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
          const sortY = y0 + fh;
          const lights = [];
          for (let i = 0; i < built.lights.length; i++) {
            const L = built.lights[i];
            lights.push({
              x: left + L.x,
              y: sortY - (built.canvas.worldH || built.canvas.height) + L.y,
              r: i === built.lights.length - 1 ? 44 : 28,
              color: i === built.lights.length - 1 ? NEONS[seed % NEONS.length] : pal.win,
            });
          }
          props.push({
            img: built.canvas,
            w: built.canvas.worldW || built.canvas.width,
            h: built.canvas.worldH || built.canvas.height,
            x: left,
            sortY: sortY,
            shadowW: fw * 0.86,
            shadowH: 12,
            lights: lights,
            neon: built.neon,
            kind: 'build',
          });
          addLamp(x0 - 14, sortY + 6);
          addLamp(x0 + fw + 2, sortY + 6);
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
          fountains.push({ x: x0 + fw / 2, y: y0 + fh / 2 });
        }
      }
    }
    for (let ty = 0; ty < MAP; ty++) {
      for (let tx = 0; tx < MAP; tx++) {
        const t = tiles[ty * MAP + tx];
        const px = tx * TILE;
        const py = ty * TILE;
        if (t === T_TREE) {
          props.push({
            img: treeSprite,
            w: treeSprite.worldW || treeSprite.width,
            h: treeSprite.worldH || treeSprite.height,
            x: px + TILE / 2 - (treeSprite.worldW || treeSprite.width) / 2,
            sortY: py + TILE - 1,
            shadowW: 36,
            shadowH: 10,
            lights: [],
            kind: 'tree',
          });
        } else if (t === T_CAR) {
          const mx = tx % PERIOD;
          const my = ty % PERIOD;
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
          const color = CAR_COLORS[hash(tx, ty) % CAR_COLORS.length];
          const key = color + (horiz ? 'h' : 'v');
          if (!carCache[key]) carCache[key] = makeCarSprite(color, horiz);
          const img = carCache[key];
          const carW = img.worldW || img.width;
          const carH = img.worldH || img.height;
          props.push({
            img: img,
            w: carW,
            h: carH,
            x: anchorX - carW / 2,
            sortY: anchorY + carH / 2,
            shadowW: horiz ? 68 : 32,
            shadowH: 10,
            lights: horiz
              ? [
                { x: anchorX + 30, y: anchorY - 2, r: 16, color: '#ffe07a' },
                { x: anchorX - 30, y: anchorY + 2, r: 12, color: '#ff5a6a' },
              ]
              : [
                { x: anchorX - 2, y: anchorY + 30, r: 16, color: '#ffe07a' },
                { x: anchorX + 4, y: anchorY - 30, r: 12, color: '#ff5a6a' },
              ],
            kind: 'car',
          });
        }
      }
    }
    buildCityGlow();
  }

  const carClaim = new Uint8Array(MAP * MAP);

  function claimLotCar(tx, ty, horiz) {
    const shifts = [0, 1, -1, 2, -2];
    for (let s = 0; s < shifts.length; s++) {
      const shift = shifts[s];
      const cells = [];
      let ok = true;
      let minX = MAP;
      let maxX = 0;
      let minY = MAP;
      let maxY = 0;
      for (let d = -2; d <= 2; d++) {
        const nx = tx + (horiz ? d + shift : 0);
        const ny = ty + (horiz ? 0 : d + shift);
        if (nx < 0 || ny < 0 || nx >= MAP || ny >= MAP) {
          ok = false;
          break;
        }
        const ni = ny * MAP + nx;
        const kind = tiles[ni];
        if ((kind !== T_LOT && kind !== T_CAR) || carClaim[ni]) {
          ok = false;
          break;
        }
        cells.push(ni);
        if (nx < minX) minX = nx;
        if (nx > maxX) maxX = nx;
        if (ny < minY) minY = ny;
        if (ny > maxY) maxY = ny;
      }
      if (!ok) continue;
      for (let i = 0; i < cells.length; i++) {
        carClaim[cells[i]] = 1;
        solid[cells[i]] = 1;
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
    const tx = x / TILE | 0;
    const ty = y / TILE | 0;
    if (tx < 0 || ty < 0 || tx >= MAP || ty >= MAP) return true;
    return solid[ty * MAP + tx] === 1;
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
    if (x > 20 && y > 20 && x < WORLD - 20 && y < WORLD - 20 && !overlaps(probe)) return { x: x, y: y };
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const d = 20 + (i % 6) * 14;
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d;
      if (px < 24 || py < 24 || px > WORLD - 24 || py > WORLD - 24) continue;
      probe.x = px;
      probe.y = py;
      if (!overlaps(probe)) return { x: px, y: py };
    }
    return null;
  }

  function resize() {
    const sw = Math.max(1, window.innerWidth || 320);
    const sh = Math.max(1, window.innerHeight || 480);
    let pixel = 4;
    while (pixel > 2 && (sw < pixel * 160 || sh < pixel * 180)) pixel -= 1;
    // Phones are narrow. Zoom in so the character stays readable, but never wider than the screen.
    if (sw <= 520 && sh >= 640 && sw >= 120 * 3) pixel = 3;
    // Previous zoom was /1.2. Another /1.42 shows about 42% more of the city.
    pixel = pixel / 1.2 / 1.42;
    const w = Math.max(1, Math.floor(sw / pixel));
    const h = Math.max(1, Math.floor(sh / pixel));
    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    drawScale = Math.max(1, Math.min(3, Math.round(pixel * dpr)));
    const bw = w * drawScale;
    const bh = h * drawScale;
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
      vignette = null;
      vignetteKey = '';
      lightCanvas = null;
      bloomHalf = null;
      bloomQuarter = null;
      dofCanvas = null;
    }
    canvas.style.width = (w * pixel) + 'px';
    canvas.style.height = (h * pixel) + 'px';
    view.w = w;
    view.h = h;
    ctx.imageSmoothingEnabled = false;
  }

  function cameraTarget() {
    const biasY = joystick.hidden ? 0 : view.h * 0.06;
    let x = player.x - view.w / 2;
    let y = player.y - view.h / 2 + biasY;
    if (view.w >= WORLD) x = -Math.floor((view.w - WORLD) / 2);
    else x = Math.max(0, Math.min(WORLD - view.w, x));
    if (view.h >= WORLD) y = -Math.floor((view.h - WORLD) / 2);
    else y = Math.max(0, Math.min(WORLD - view.h, y));
    return { x: x, y: y };
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
    let x = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    let y = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    if (x === 0 && y === 0) {
      x = joyX;
      y = joyY;
    }
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    if (len < 0.12) return { x: 0, y: 0 };
    return { x: x, y: y };
  }

  function showJoy(on) {
    joystick.hidden = !on;
  }

  function addShake(n) {
    if (!reduceMotion) shake = Math.max(shake, n);
  }

  function buzz(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (err) { /* ignore */ }
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

  function muzzle(x, y, ang, color) {
    if (flashes.length > 28) flashes.shift();
    flashes.push({ x: x, y: y, ang: ang, color: color, life: 0.07, max: 0.07 });
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

  function hpMul() { return 1 + elapsed * 0.012; }
  function dmgMul() { return 1 + elapsed * 0.005; }
  function spdMul() { return 1 + Math.min(0.28, elapsed * 0.0015); }

  function makeEnemy(type, x, y) {
    const open = findOpen(x, y, type === 'boss' ? 12 : 8) || { x: x, y: y };
    const base = {
      zombie: { hp: 16, speed: 44, dmg: 8, r: 6, xp: 2 },
      cop: { hp: 26, speed: 76, dmg: 11, r: 6, xp: 3 },
      dealer: { hp: 20, speed: 56, dmg: 6, r: 6, xp: 4 },
      alfa: { hp: 64, speed: 42, dmg: 14, r: 8, xp: 8 },
      boss: { hp: 480, speed: 48, dmg: 16, r: 10, xp: 40 },
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
      shotDmg: Math.round(12 * dmgMul()),
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

  function killEnemy(e) {
    if (!e.alive) return;
    e.alive = false;
    e.dying = e.type === 'boss' ? 0.7 : 0.45;
    e.dieMax = e.dying;
    kills += 1;
    const color = e.type === 'cop' ? '#9eb6ff' : e.type === 'dealer' || e.type === 'boss' ? '#d7b4ff' : '#c6f59a';
    burst(e.x, e.y, color, e.type === 'boss' ? 16 : 8);
    puff(e.x, e.y, e.type === 'boss' ? 8 : 4);
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

  function hurtEnemy(e, dmg, sx, sy) {
    if (!e.alive || state === 'dead') return;
    e.hp -= dmg;
    e.flash = 0.08;
    const dx = e.x - sx;
    const dy = e.y - sy;
    const len = Math.hypot(dx, dy) || 1;
    e.kvx += (dx / len) * 90;
    e.kvy += (dy / len) * 90;
    if (globalTime - sfx.hitAt > 0.04) {
      sfx.hitAt = globalTime;
      sfx.hit();
    }
    if (e.hp <= 0) killEnemy(e);
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
    buzz(18);
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
      if (dx * dx + dy * dy <= reach * reach) hurtEnemy(e, dmg, x, y);
    }
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
    if (elapsed < 18) return 'zombie';
    if (elapsed < 40) return r < 0.72 ? 'zombie' : 'cop';
    if (elapsed > 85 && r < 0.08) return 'alfa';
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
      x = Math.max(24, Math.min(WORLD - 24, x));
      y = Math.max(24, Math.min(WORLD - 24, y));
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
    moveBody(player, (m.x * speedStat() + player.kvx) * dt, (m.y * speedStat() + player.kvy) * dt);
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
        player.cast = 0.18;
        player.castKind = 'crystal';
        setDir(player, ax, ay);
        sfx.shoot(820);
        const base = Math.atan2(targets[0].y - player.y, targets[0].x - player.x);
        muzzle(player.x + Math.cos(base) * 8, player.y - 2 + Math.sin(base) * 8, base, '#fff6b0');
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
            hurtEnemy(e, cartDmg(), x, y);
          }
        }
      }
    }

    if (weapons.bass) {
      const bass = weapons.bass;
      bass.t -= dt;
      if (bass.t <= 0) {
        bass.t = bassCd();
        player.cast = 0.18;
        player.castKind = 'bass';
        setDir(player, ax, ay);
        sfx.bass();
        addShake(3);
        pulse(player.x, player.y, bassRadius(), bassDmg(), '#5ce1e6');
      }
    }

    if (weapons.bottle) {
      const bottle = weapons.bottle;
      bottle.t -= dt;
      if (bottle.t <= 0) {
        bottle.t = 1.15 * Math.pow(0.94, bottle.countLv - 3);
        player.cast = 0.18;
        player.castKind = 'bottle';
        setDir(player, ax, ay);
        sfx.bottle();
        const n = bottle.countLv;
        const base = Math.atan2(ay, ax);
        muzzle(player.x + Math.cos(base) * 8, player.y - 2 + Math.sin(base) * 8, base, '#d8ffe8');
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
      if (p.x < 0 || p.y < 0 || p.x > WORLD || p.y > WORLD) {
        p.alive = false;
        continue;
      }
      if (p.life <= 0) {
        p.alive = false;
        if (p.kind === 'bottle') {
          sfx.noise(0.06, 0.04);
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
          pulse(p.x, p.y, p.boom, p.dmg, '#b8ff9a');
          break;
        }
        p.seen.add(e.id);
        hurtEnemy(e, p.dmg, p.x, p.y);
        if (p.seen.size > p.pierce) {
          p.alive = false;
          break;
        }
      }
    }
  }

  function updateBullets(dt) {
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      if (!b.alive) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < 0 || b.y < 0 || b.x > WORLD || b.y > WORLD) {
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
      if (e.dying > 0) {
        e.dying -= dt;
        if (e.dying < 0) e.dying = 0;
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
          vx = e.lx * 155;
          vy = e.ly * 155;
        } else if (e.lungeCd <= 0 && dist < 140) {
          e.lunging = 0.24;
          e.lungeCd = 2.5;
          e.lx = nx;
          e.ly = ny;
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
          const sp = 155;
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
          vx = e.dashx * 175;
          vy = e.dashy * 175;
        }
      }

      e.kvx *= Math.exp(-10 * dt);
      e.kvy *= Math.exp(-10 * dt);
      const beforeX = e.x;
      const beforeY = e.y;
      moveBody(e, (vx + e.kvx) * dt, (vy + e.kvy) * dt);
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

      e.moving = Math.hypot(vx, vy) > 8;
      setDir(e, vx || nx, vy || ny);
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
      p.vx *= Math.exp(-2 * dt);
      p.vy *= Math.exp(-2 * dt);
    }
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
    spawnT = Math.max(0.62, 1.35 - elapsed * 0.005);
    const n = 1 + Math.floor(elapsed / 45);
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
    const cx = Math.round(x - cam.x);
    const cy = Math.round(y - cam.y);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rw + 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, rw, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function propLift(sortY) {
    const mid = cam.y + view.h * 0.5;
    return Math.max(-6, Math.min(6, Math.round((sortY - mid) * 0.04)));
  }

  function propOnScreen(pr) {
    const pw = pr.w || pr.img.width;
    const ph = pr.h || pr.img.height;
    const top = pr.sortY - ph;
    return pr.x + pw > cam.x - 30 && pr.x < cam.x + view.w + 30 && pr.sortY > cam.y - 20 && top < cam.y + view.h + 40;
  }

  function drawProp(pr) {
    const lift = propLift(pr.sortY);
    const pw = pr.w || pr.img.width;
    const ph = pr.h || pr.img.height;
    let x = Math.round(pr.x - cam.x);
    const y = Math.round(pr.sortY - cam.y - ph + lift);
    if (pr.kind === 'tree' && quality !== 'low' && !reduceMotion) {
      x += Math.round(Math.sin(globalTime * 1.5 + pr.x * 0.02) * 1.4);
    }
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
    const pose = ent.pose || 'down';
    const moving = ent === player ? player.moving : ent.moving !== false;
    const rate = moving ? 10 : 0;
    const frame = rate ? ((globalTime * rate + (ent.phase || 0)) | 0) % 6 : 0;
    const cast = ent === player && player.cast > 0;
    if (spr.cast && spr.cast[ent.type || 'player']) {
      const pack = spr.cast[ent.type || 'player'];
      const white = ent.flash > 0 && spr.flash && spr.flash[ent.type || 'player'];
      const hot = ent.type === 'boss' && ent.mode === 'wind' && spr.bossHotCast;
      const book = hot ? spr.bossHotCast : (white ? spr.flash[ent.type || 'player'] : pack.walk);
      if (cast && pack.attack && pack.attack[pose]) {
        const af = player.cast > 0.09 ? 0 : 1;
        return pack.attack[pose][af] || pack.attack[pose][0];
      }
      const row = book[pose] || book.down;
      return row[frame % row.length];
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
    const breath = (!ent.moving && !(ent === player && player.moving) && !reduceMotion) ? (((globalTime * 2) | 0) % 2) * -1 : 0;
    drawShadow(ent.x, ent.y + 1, Math.max(4, ((ent.radius || 6) * 0.85) | 0));
    ctx.save();
    const dx = Math.round((ent.x - cam.x) * drawScale) / drawScale;
    const dy = Math.round((ent.y - cam.y + breath) * drawScale) / drawScale;
    ctx.translate(dx, dy);
    if (spr.cast ? ent.flip : ent.facing < 0) ctx.scale(-1, 1);
    if (ent.dying > 0) {
      const t = 1 - ent.dying / (ent.dieMax || 0.5);
      ctx.rotate(t * 1.35);
      ctx.scale(1 + t * 0.18, Math.max(0.2, 1 - t * 0.62));
      ctx.globalAlpha = Math.max(0, 1 - t * 0.9);
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
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, -dw / 2, -dh + foot, dw, dh);
    if (ent === player && player.cast > 0) {
      const kind = player.castKind;
      const wimg = kind === 'bottle' ? spr.bottle : kind === 'bass' ? spr.speaker : spr.crystal;
      if (wimg) {
        const ww = wimg.worldW || 8;
        const wh = wimg.worldH || 8;
        ctx.drawImage(wimg, dw * 0.15, -dh * 0.62, ww, wh);
      }
    }
    ctx.restore();
  }

  function onScreen(x, y, m) {
    return x > cam.x - m && y > cam.y - m && x < cam.x + view.w + m && y < cam.y + view.h + m;
  }

  function findSidewalk() {
    if (!player) return null;
    const ox = (player.x / TILE) | 0;
    const oy = (player.y / TILE) | 0;
    for (let i = 0; i < 14; i++) {
      const tx = ox + ((Math.random() * 28) | 0) - 14;
      const ty = oy + ((Math.random() * 28) | 0) - 14;
      if (tx < 1 || ty < 1 || tx >= MAP - 1 || ty >= MAP - 1) continue;
      if (tiles[ty * MAP + tx] !== T_SIDE) continue;
      const x = (tx + 0.5) * TILE;
      const y = (ty + 0.5) * TILE;
      if (isSolid(x, y)) continue;
      return { x: x, y: y };
    }
    return null;
  }

  function makeFolk(x, y) {
    const ang = Math.random() * Math.PI * 2;
    return {
      type: 'civ',
      x: x,
      y: y,
      vx: Math.cos(ang) * 22,
      vy: Math.sin(ang) * 22,
      radius: 6,
      pose: 'down',
      flip: false,
      facing: 1,
      moving: true,
      phase: Math.random() * 6,
      alive: true,
      flash: 0,
      born: 0,
      dying: 0,
    };
  }

  function initAmbience() {
    traffic = [];
    pigeons = [];
    folk = [];
    const lanes = [];
    for (let ty = 1; ty < MAP - 1; ty++) {
      for (let tx = 1; tx < MAP - 1; tx++) {
        if (solid[ty * MAP + tx]) continue;
        const mx = tx % PERIOD;
        const my = ty % PERIOD;
        const x = (tx + 0.5) * TILE;
        const y = (ty + 0.5) * TILE;
        if (my === 2 && mx > TW + 2 && mx < PERIOD - 3) lanes.push({ x: x, y: y, vx: 52, vy: 0, horiz: true });
        else if (my === 3 && mx > TW + 2 && mx < PERIOD - 3) lanes.push({ x: x, y: y, vx: -48, vy: 0, horiz: true });
        else if (mx === 2 && my > TW + 2 && my < PERIOD - 3) lanes.push({ x: x, y: y, vx: 0, vy: 50, horiz: false });
        else if (mx === 3 && my > TW + 2 && my < PERIOD - 3) lanes.push({ x: x, y: y, vx: 0, vy: -46, horiz: false });
      }
    }
    const step = Math.max(1, (lanes.length / 4) | 0);
    for (let i = 0; i < 4 && lanes.length; i++) {
      const cell = lanes[(i * step) % lanes.length];
      const color = CAR_COLORS[(i * 3) % CAR_COLORS.length];
      const key = 'go' + color + (cell.horiz ? 'h' : 'v');
      if (!carCache[key]) carCache[key] = makeCarSprite(color, cell.horiz);
      const img = carCache[key];
      traffic.push({
        x: cell.x,
        y: cell.y,
        vx: cell.vx,
        vy: cell.vy,
        img: img,
        w: img.worldW || img.width,
        h: img.worldH || img.height,
        radius: 12,
      });
    }
    for (let i = 0; i < fountains.length && pigeons.length < 5; i++) {
      const f = fountains[i];
      pigeons.push({
        x: f.x - 8, y: f.y + 12, homeX: f.x - 8, homeY: f.y + 12,
        vx: 0, vy: 0, flying: false, phase: i,
      });
      if (pigeons.length < 5) {
        pigeons.push({
          x: f.x + 10, y: f.y + 6, homeX: f.x + 10, homeY: f.y + 6,
          vx: 0, vy: 0, flying: false, phase: i + 0.4,
        });
      }
    }
  }

  function updateAmbience(dt) {
    if (!player) return;
    const quiet = quality === 'low' || reduceMotion;
    const folkCap = quiet ? 0 : 8;
    if (folk.length > folkCap) folk.length = folkCap;
    if (!quiet && folk.length < folkCap && (fxFrame % 18) === 0) {
      const spot = findSidewalk();
      if (spot) folk.push(makeFolk(spot.x, spot.y));
    }
    for (let i = 0; i < folk.length; i++) {
      const f = folk[i];
      const beforeX = f.x;
      const beforeY = f.y;
      moveBody(f, f.vx * dt, f.vy * dt);
      if (Math.abs(f.x - beforeX) + Math.abs(f.y - beforeY) < 0.15) {
        const ang = Math.random() * Math.PI * 2;
        f.vx = Math.cos(ang) * 22;
        f.vy = Math.sin(ang) * 22;
      }
      const tx = (f.x / TILE) | 0;
      const ty = (f.y / TILE) | 0;
      if (tx < 0 || ty < 0 || tx >= MAP || ty >= MAP || tiles[ty * MAP + tx] !== T_SIDE) {
        f.vx = -f.vx;
        f.vy = -f.vy;
      }
      f.moving = true;
      setDir(f, f.vx, f.vy);
      if (Math.hypot(f.x - player.x, f.y - player.y) > Math.max(view.w, view.h)) {
        const spot = findSidewalk();
        if (spot) {
          f.x = spot.x;
          f.y = spot.y;
        }
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      const car = traffic[i];
      car.x += car.vx * dt;
      car.y += car.vy * dt;
      if (car.x < -48) car.x = WORLD + 24;
      if (car.x > WORLD + 48) car.x = -24;
      if (car.y < -48) car.y = WORLD + 24;
      if (car.y > WORLD + 48) car.y = -24;
      if (state === 'play') {
        const dx = player.x - car.x;
        const dy = player.y - car.y;
        const reach = 16 + player.radius;
        if (dx * dx + dy * dy < reach * reach) {
          const len = Math.hypot(dx, dy) || 1;
          moveBody(player, (dx / len) * 36 * dt, (dy / len) * 36 * dt);
        }
      }
    }
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

  function drawPuddles() {
    const still = quality === 'low' || reduceMotion;
    ctx.lineWidth = 1;
    for (let i = 0; i < puddles.length; i++) {
      const p = puddles[i];
      if (!onScreen(p.x, p.y, 12)) continue;
      const wobble = still ? 0 : Math.sin(globalTime * 3 + p.phase) * 1.4;
      ctx.strokeStyle = 'rgba(186, 214, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(p.x - cam.x, p.y - cam.y, 5 + wobble, 2.2, 0, 0, Math.PI * 2);
      ctx.stroke();
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
      ctx.fillStyle = '#1a1824';
      ctx.fillRect(x, y - 18, 2, 22);
      ctx.fillStyle = '#141018';
      ctx.fillRect(x - 3, y - 26, 8, 10);
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

  function drawTraffic(car) {
    if (!onScreen(car.x, car.y, 80)) return;
    const dw = car.w;
    const dh = car.h;
    const x = Math.round((car.x - dw / 2 - cam.x) * drawScale) / drawScale;
    const y = Math.round((car.y - dh / 2 - cam.y) * drawScale) / drawScale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(car.img, x, y, dw, dh);
    const pulse = 0.45 + Math.sin(globalTime * 14 + car.x) * 0.4;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#fff6c8';
    if (Math.abs(car.vx) >= Math.abs(car.vy)) {
      const nose = car.vx > 0 ? x + dw - 7 : x + 2;
      ctx.fillRect(nose, y + dh * 0.32, 5, 3);
    } else {
      const nose = car.vy > 0 ? y + dh - 7 : y + 2;
      ctx.fillRect(x + dw * 0.32, nose, 3, 5);
    }
    ctx.globalAlpha = 1;
  }

  function drawWorld() {
    const sx = cam.x < 0 ? 0 : Math.floor(cam.x);
    const sy = cam.y < 0 ? 0 : Math.floor(cam.y);
    const ox = cam.x < 0 ? -cam.x : sx - cam.x;
    const oy = cam.y < 0 ? -cam.y : sy - cam.y;
    const sw = Math.min(mapCanvas.width - sx, Math.ceil(view.w - Math.min(0, ox)) + 1);
    const sh = Math.min(mapCanvas.height - sy, Math.ceil(view.h - Math.min(0, oy)) + 1);
    if (sw > 0 && sh > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(mapCanvas, sx, sy, sw, sh, ox, oy, sw, sh);
    }
    drawPuddles();

    const queue = [];
    for (let i = 0; i < props.length; i++) {
      const pr = props[i];
      if (!propOnScreen(pr)) continue;
      const pw = pr.w || pr.img.width;
      const cx = Math.round(pr.x + pw / 2 - cam.x);
      const cy = Math.round(pr.sortY - cam.y + 2);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, pr.shadowW / 2, pr.shadowH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
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
    const order = [];
    for (let i = 0; i < queue.length; i += 3) order.push(i);
    order.sort((a, b) => queue[a] - queue[b]);
    for (let n = 0; n < order.length; n++) {
      const i = order[n];
      const kind = queue[i + 2];
      const idx = queue[i + 1];
      if (kind === 0) drawProp(props[idx]);
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
  }

  function collectLights() {
    const list = [];
    if (player) list.push({ x: player.x, y: player.y - 8, r: 72, color: '#ffe1b0' });
    for (let i = 0; i < props.length; i++) {
      const pr = props[i];
      if (!pr.lights || !pr.lights.length) continue;
      if (!propOnScreen(pr)) continue;
      for (let k = 0; k < pr.lights.length; k++) list.push(pr.lights[k]);
    }
    const gemCap = quality === 'low' ? 0 : 6;
    let gemsLit = 0;
    for (let i = 0; i < gems.length && gemsLit < gemCap; i++) {
      const g = gems[i];
      if (!g.alive || !onScreen(g.x, g.y, 10)) continue;
      list.push({ x: g.x, y: g.y, r: 28, color: g.value >= 8 ? '#9eecff' : '#e2b6ff' });
      gemsLit++;
    }
    if (quality !== 'low') {
      for (let i = 0; i < flashes.length; i++) {
        const f = flashes[i];
        if (f.life > 0) list.push({ x: f.x, y: f.y, r: 42, color: f.color });
      }
    }
    return list;
  }

  function paintGrade() {
    const cap = quality === 'low' ? 8 : 16;
    const lights = collectLights();
    if (!lightCanvas) {
      lightCanvas = document.createElement('canvas');
      lightCanvas.width = view.w;
      lightCanvas.height = view.h;
    }
    const l = lightCanvas.getContext('2d');
    l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, view.w, view.h);
    l.fillStyle = quality === 'low' ? 'rgba(8, 10, 24, 0.34)' : 'rgba(6, 8, 22, 0.48)';
    l.fillRect(0, 0, view.w, view.h);
    l.globalCompositeOperation = 'destination-out';
    const n = Math.min(cap, lights.length);
    const steps = quality === 'low' ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const L = lights[i];
      const sx = L.x - cam.x;
      const sy = L.y - cam.y;
      for (let s = steps; s >= 1; s--) {
        l.fillStyle = 'rgba(0,0,0,' + (0.45 + 0.45 * (s / steps)) + ')';
        l.beginPath();
        l.arc(sx, sy, L.r * (s / steps), 0, Math.PI * 2);
        l.fill();
      }
    }
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
    const w = WORLD >> 1;
    const h = WORLD >> 1;
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    for (let i = 0; i < props.length; i++) {
      const pr = props[i];
      if (pr.kind === 'tree') continue;
      if (pr.kind === 'car') {
        for (let k = 0; k < pr.lights.length; k++) {
          const L = pr.lights[k];
          g.fillStyle = L.color;
          g.fillRect(L.x * 0.5 - 1.5, L.y * 0.5 - 1.5, 3, 3);
        }
        continue;
      }
      const pw = pr.w || pr.img.width;
      const ph = pr.h || pr.img.height;
      const dw = Math.max(1, pw * 0.5);
      const dh = Math.max(1, ph * 0.5);
      g.drawImage(pr.img, pr.x * 0.5, (pr.sortY - ph) * 0.5, dw, dh);
    }
    extractBright(c);
    fattenGlow(c);
    blurCanvas(c, 6);
    gainAlpha(c, 2.6);
    cityGlow = c;
    const q = document.createElement('canvas');
    q.width = w >> 1;
    q.height = h >> 1;
    const qg = q.getContext('2d');
    qg.drawImage(c, 0, 0, q.width, q.height);
    blurCanvas(q, 8);
    gainAlpha(q, 1.7);
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

  function gainAlpha(canvas, gain) {
    const g = canvas.getContext('2d');
    const img = g.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) {
      if (d[i] === 0) continue;
      const boosted = d[i] * gain;
      d[i] = boosted > 255 ? 255 : boosted;
    }
    g.putImageData(img, 0, 0);
  }

  function blitGlow(src, scale) {
    const sx = Math.max(0, cam.x * scale);
    const sy = Math.max(0, cam.y * scale);
    const dx = Math.max(0, -cam.x);
    const dy = Math.max(0, -cam.y);
    const sw = Math.min(src.width - sx, (view.w - dx) * scale);
    const sh = Math.min(src.height - sy, (view.h - dy) * scale);
    if (sw <= 0 || sh <= 0) return;
    ctx.drawImage(src, sx, sy, sw, sh, dx, dy, sw / scale, sh / scale);
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
      b.clearRect(0, 0, bw, bh);
      b.globalCompositeOperation = 'lighter';
      const cap = low ? 4 : 8;
      let n = 0;
      for (let i = 0; i < gems.length && n < cap; i++) {
        const gem = gems[i];
        if (!gem.alive || !onScreen(gem.x, gem.y, 12)) continue;
        n += 1;
        b.fillStyle = gem.value >= 8 ? '#9eecff' : gem.value >= 3 ? '#ffe14a' : '#e2b6ff';
        b.globalAlpha = 0.95;
        b.beginPath();
        b.arc((gem.x - cam.x) * 0.5, (gem.y - cam.y) * 0.5, 5, 0, Math.PI * 2);
        b.fill();
      }
      for (let i = 0; i < flashes.length; i++) {
        const f = flashes[i];
        if (f.life <= 0 || !onScreen(f.x, f.y, 16)) continue;
        b.fillStyle = f.color;
        b.globalAlpha = Math.max(0.35, f.life / f.max);
        b.beginPath();
        b.arc((f.x - cam.x) * 0.5, (f.y - cam.y) * 0.5, 6.5, 0, Math.PI * 2);
        b.fill();
      }
      b.globalAlpha = 1;
      b.globalCompositeOperation = 'source-over';
      blurCanvas(bloomHalf, low ? 3 : 5);
      gainAlpha(bloomHalf, low ? 1.6 : 2.2);
      if (!low) {
        const qg = bloomQuarter.getContext('2d');
        qg.clearRect(0, 0, qw, qh);
        qg.drawImage(bloomHalf, 0, 0, qw, qh);
        blurCanvas(bloomQuarter, 4);
      }
    }
    ctx.globalAlpha = low ? 0.42 : 0.62;
    ctx.drawImage(bloomHalf, 0, 0, view.w, view.h);
    if (!low) {
      ctx.globalAlpha = 0.36;
      ctx.drawImage(bloomQuarter, 0, 0, view.w, view.h);
    }
  }

  function paintBloom() {
    if (!cityGlow) return;
    const low = quality === 'low';
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingEnabled = true;
    ctx.globalAlpha = low ? 0.5 : 0.7;
    blitGlow(cityGlow, 0.5);
    if (!low && cityGlowQ) {
      ctx.globalAlpha = 0.42;
      blitGlow(cityGlowQ, 0.25);
    }
    paintDynamicBloom();
    ctx.imageSmoothingEnabled = false;
    ctx.restore();
  }

  function paintEdgeBlur() {
    const dw = Math.max(2, view.w >> 2);
    const dh = Math.max(2, view.h >> 2);
    if (!dofCanvas || dofCanvas.width !== dw) {
      dofCanvas = document.createElement('canvas');
      dofCanvas.width = dw;
      dofCanvas.height = dh;
    }
    if ((fxFrame & 1) === 0) {
      const d = dofCanvas.getContext('2d');
      d.clearRect(0, 0, dw, dh);
      try { d.filter = 'blur(1px)'; } catch (err) { d.filter = 'none'; }
      d.drawImage(canvas, 0, 0, dw, dh);
      d.filter = 'none';
      d.globalCompositeOperation = 'destination-in';
      const inner = Math.min(dw, dh) * 0.42;
      const g = d.createRadialGradient(dw / 2, dh / 2, inner, dw / 2, dh / 2, Math.max(dw, dh) * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.5)');
      d.fillStyle = g;
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
      x: (45 + 0.5) * TILE,
      y: (40 + 0.5) * TILE,
      hp: 100,
      maxHp: 100,
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
      pose: 'down',
      flip: false,
      cast: 0,
      castKind: '',
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
      btn.addEventListener('pointerdown', (e) => {
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
    showJoy(wantJoy);
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
    buzz([30, 40, 80]);
    showDead();
  }

  function spawnIntro() {
    const offsets = [[120, 36], [48, 130], [-110, 64], [150, -24]];
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
      showJoy(wantJoy);
      refreshWeaponIcons();
    } else {
      state = 'title';
      overlay.hidden = false;
      titleScreen.hidden = false;
      levelScreen.hidden = true;
      deadScreen.hidden = true;
      hud.hidden = true;
      showJoy(false);
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
    const cap = quality === 'low' ? 8 : 24;
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
    fxFrame++;
    if (!hidden) {
      updateAmbience(dt);
      if (dt > 0.028) {
        slowStreak++;
        fastStreak = 0;
      } else {
        fastStreak++;
        slowStreak = Math.max(0, slowStreak - 1);
      }
      if (slowStreak > 20) quality = 'low';
      if (quality === 'low' && fastStreak > 150) quality = 'high';
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

  window.addEventListener('blur', () => {
    held.up = held.down = held.left = held.right = false;
    joyX = 0;
    joyY = 0;
    joyId = null;
    knob.style.transform = 'translate(-50%, -50%)';
  });

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { lastTs = 0; });

  document.addEventListener('touchmove', (e) => {
    if (!overlay.hidden) return;
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('touchstart', () => {
    wantJoy = true;
    if (state === 'play') showJoy(true);
  }, { passive: true });

  function joyPoint(e) {
    const rect = joystick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const max = rect.width * 0.34;
    const len = Math.hypot(dx, dy) || 1;
    const cl = Math.min(max, len);
    const nx = dx / len;
    const ny = dy / len;
    let jx = nx * (cl / max);
    let jy = ny * (cl / max);
    if (Math.hypot(jx, jy) < 0.18) {
      jx = 0;
      jy = 0;
    }
    joyX = jx;
    joyY = jy;
    knob.style.transform = 'translate(calc(-50% + ' + (nx * cl) + 'px), calc(-50% + ' + (ny * cl) + 'px))';
  }

  joystick.addEventListener('pointerdown', (e) => {
    wantJoy = true;
    joyId = e.pointerId;
    joystick.setPointerCapture(e.pointerId);
    joyPoint(e);
    e.preventDefault();
    e.stopPropagation();
  });
  joystick.addEventListener('pointermove', (e) => {
    if (e.pointerId !== joyId) return;
    joyPoint(e);
    e.preventDefault();
  });
  function joyEnd(e) {
    if (e.pointerId !== joyId) return;
    joyId = null;
    joyX = 0;
    joyY = 0;
    knob.style.transform = 'translate(-50%, -50%)';
  }
  joystick.addEventListener('pointerup', joyEnd);
  joystick.addEventListener('pointercancel', joyEnd);

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

  startBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
  });
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.pointerType === 'touch') wantJoy = true;
    startGame();
  });
  retryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    restart();
  });

  overlay.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') wantJoy = true;
    sfx.unlock();
    if (state === 'title') startGame();
    else if (state === 'dead') restart();
  });

  muteBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
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
  buildMap();
  beginRun(false);
  requestAnimationFrame(loop);
})();
