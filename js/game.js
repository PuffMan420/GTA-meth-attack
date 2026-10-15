// GTA Meth Attack — the whole game. No build step. This file plus index.html.
(() => {
  'use strict';

  const TILE = 16;
  const MAP = 90;
  const PERIOD = 18;
  const TW = 6;
  const WORLD = MAP * TILE;
  const MAX_ENEMIES = 65;

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
  function speedStat() { return 86 * (1 + player.speedLv * 0.1); }
  function magnetR() { return 190 + player.magnetLv * 40; }
  function armorStat() { return player.armorLv * 4; }
  function regenStat() { return player.regenLv * 0.45; }
  function xpMul() { return 1 + player.xpLv * 0.12; }

  function crystalCd() { return 0.74 * Math.pow(0.86, weapons.crystal.rateLv - 1); }
  function crystalDmg() { return (8 + (weapons.crystal.dmgLv - 1) * 3) * might(); }
  function bassCd() { return 2.35 * Math.pow(0.86, weapons.bass.rateLv - 1); }
  function bassRadius() { return 58 + (weapons.bass.radLv - 1) * 14; }
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

  function outlined(w, h, draw) {
    const src = pixCanvas(w, h, draw);
    const sctx = src.getContext('2d');
    const data = sctx.getImageData(0, 0, w, h).data;
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
    const q = (x, y, color, w, h) => p(x, y + 1 + bob, color, w, h);
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
  }

  function paintBoss(p, frame) {
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
    const walker = (look) => frames.map((f) => outlined(24, 26, (p) => paintWalker(p, f, look)));
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
    spr.boss = [0, 1].map((f) => outlined(32, 36, (p) => paintBoss(p, f)));
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
          drawCar(g, px, py, (hash(tx, ty) & 1) === 0, CAR_COLORS[hash(tx, ty) % CAR_COLORS.length]);
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
          if (type === T_CAR) {
            drawCar(g, px, py, horiz && !vert, CAR_COLORS[hash(tx, ty) % CAR_COLORS.length]);
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
          const bx = (tx / PERIOD) | 0;
          const by = (ty / PERIOD) | 0;
          const pal = BUILDINGS[hash(bx, by) % BUILDINGS.length];
          g.fillStyle = pal.roof;
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = '#000';
          g.globalAlpha = 0.18;
          for (let row = 2; row < TILE; row += 3) g.fillRect(px, py + row, TILE, 1);
          g.globalAlpha = 1;
          const i = ty * MAP + tx;
          g.fillStyle = pal.wall;
          if (ty > 0 && tiles[i - MAP] !== T_BUILD) g.fillRect(px, py, TILE, 3);
          if (ty < MAP - 1 && tiles[i + MAP] !== T_BUILD) g.fillRect(px, py + TILE - 3, TILE, 3);
          if (tx > 0 && tiles[i - 1] !== T_BUILD) g.fillRect(px, py, 3, TILE);
          if (tx < MAP - 1 && tiles[i + 1] !== T_BUILD) g.fillRect(px + TILE - 3, py, 3, TILE);
          if (hash(tx, ty) % 3 !== 0) {
            const lit = hash(tx, ty) % 7 !== 0;
            g.fillStyle = '#100c14';
            g.fillRect(px + 4, py + 4, 8, 8);
            g.fillStyle = lit ? pal.win : pal.off;
            g.fillRect(px + 5, py + 5, 6, 6);
            g.fillStyle = pal.roof;
            g.fillRect(px + 7, py + 5, 2, 6);
            g.fillRect(px + 5, py + 7, 6, 2);
            if (lit) {
              g.fillStyle = '#fff';
              g.globalAlpha = 0.7;
              g.fillRect(px + 5, py + 5, 2, 2);
              g.globalAlpha = 1;
            }
          } else if (hash(tx, ty) % 5 === 0) {
            g.fillStyle = '#b7c0c8';
            g.fillRect(px + 9, py + 9, 5, 4);
            g.fillStyle = '#5c656e';
            g.fillRect(px + 9, py + 11, 5, 1);
            g.fillStyle = '#e8eef2';
            g.fillRect(px + 10, py + 9, 1, 1);
          }
          if (ty > 0 && tiles[i - MAP] === T_SIDE && hash(tx, ty) % 4 === 0) {
            signs.push({
              x: px + 1,
              y: py,
              w: 14,
              h: 4,
              color: NEONS[hash(tx, ty) % NEONS.length],
              phase: hash(tx, ty) % 7,
            });
          }
        } else if (type === T_GRASS || type === T_TREE) {
          g.fillStyle = ((tx + ty) & 1) === 0 ? '#1c6a36' : '#248044';
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = ((tx * 3 + ty) & 3) === 0 ? '#176030' : '#2e9650';
          g.fillRect(px + (hash(tx, ty) % 10), py + (hash(ty, tx) % 10), 3, 2);
          if (hash(tx, ty) % 5 === 0 && type === T_GRASS) {
            g.fillStyle = hash(tx, ty) % 2 ? '#ff4d8d' : '#ffe14a';
            g.fillRect(px + 3 + (hash(tx, ty) % 8), py + 3 + (hash(ty, tx) % 8), 2, 2);
          }
          if (type === T_TREE) {
            g.fillStyle = 'rgba(0,0,0,0.28)';
            g.fillRect(px + 4, py + 12, 9, 3);
            g.fillStyle = '#4a2c18';
            g.fillRect(px + 7, py + 9, 3, 6);
            g.fillStyle = '#6b4030';
            g.fillRect(px + 7, py + 9, 1, 5);
            g.fillStyle = COL.leafDk;
            g.fillRect(px + 2, py + 4, 12, 7);
            g.fillStyle = '#166b34';
            g.fillRect(px + 4, py + 2, 8, 7);
            g.fillStyle = COL.leaf;
            g.fillRect(px + 5, py + 3, 3, 2);
            g.fillStyle = '#0b3a20';
            g.fillRect(px + 9, py + 6, 2, 2);
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
          g.fillStyle = '#7a748c';
          g.fillRect(px, py, TILE, TILE);
          g.fillStyle = '#3a3848';
          g.fillRect(px + 1, py + 1, 14, 14);
          g.fillStyle = '#1a6ea8';
          g.fillRect(px + 3, py + 3, 10, 10);
          g.fillStyle = '#3ec2e0';
          g.fillRect(px + 5, py + 5, 6, 6);
          g.fillStyle = '#d8fbff';
          g.fillRect(px + 6, py + 6, 2, 2);
          const ix = (tx % PERIOD) - TW;
          const iy = (ty % PERIOD) - TW;
          if (ix === 5 && iy === 5) fountains.push({ x: px + 8, y: py + 8 });
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
    paintMap();
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
    // About 20% more of the city on screen. One full integer step would jump too far.
    pixel = pixel / 1.2;
    const w = Math.max(1, Math.floor(sw / pixel));
    const h = Math.max(1, Math.floor(sh / pixel));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      vignette = null;
      vignetteKey = '';
    }
    canvas.style.width = (w * pixel) + 'px';
    canvas.style.height = (h * pixel) + 'px';
    view.w = canvas.width;
    view.h = canvas.height;
    ctx.imageSmoothingEnabled = false;
  }

  function updateCamera() {
    const biasY = joystick.hidden ? 0 : view.h * 0.06;
    let x = player.x - view.w / 2;
    let y = player.y - view.h / 2 + biasY;
    if (view.w >= WORLD) cam.x = -Math.floor((view.w - WORLD) / 2);
    else cam.x = Math.round(Math.max(0, Math.min(WORLD - view.w, x)));
    if (view.h >= WORLD) cam.y = -Math.floor((view.h - WORLD) / 2);
    else cam.y = Math.round(Math.max(0, Math.min(WORLD - view.h, y)));
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
    barks.push({ x: x, y: y - 16, text: text, color: color || '#fff', life: 1.15, max: 1.15 });
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
    const open = findOpen(x, y, type === 'boss' ? 12 : 7) || { x: x, y: y };
    const base = {
      zombie: { hp: 16, speed: 34, dmg: 8, r: 6, xp: 2 },
      cop: { hp: 26, speed: 60, dmg: 11, r: 6, xp: 3 },
      dealer: { hp: 20, speed: 44, dmg: 6, r: 6, xp: 4 },
      alfa: { hp: 64, speed: 32, dmg: 14, r: 8, xp: 8 },
      boss: { hp: 480, speed: 38, dmg: 16, r: 11, xp: 40 },
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
    };
    e.maxHp = e.hp;
    maybeBark(e);
    return e;
  }

  function killEnemy(e) {
    if (!e.alive) return;
    e.alive = false;
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
    const regen = regenStat();
    if (regen > 0 && player.hp < player.maxHp && player.hp > 0) {
      player.hp = Math.min(player.maxHp, player.hp + regen * dt);
    }
    const m = readMove();
    if (m.x || m.y) {
      moved = true;
      player.moving = true;
      if (Math.abs(m.x) > 0.2) player.facing = m.x < 0 ? -1 : 1;
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
        sfx.shoot(820);
        const base = Math.atan2(targets[0].y - player.y, targets[0].x - player.x);
        muzzle(player.x + Math.cos(base) * 12, player.y - 4 + Math.sin(base) * 12, base, '#fff6b0');
        for (let i = 0; i < count; i++) {
          if (shots.length > 160) break;
          let ang;
          if (i < targets.length) ang = Math.atan2(targets[i].y - player.y, targets[i].x - player.x);
          else ang = base + (i - (count - 1) / 2) * 0.22;
          shots.push({
            kind: 'crystal',
            x: player.x,
            y: player.y - 4,
            vx: Math.cos(ang) * 230,
            vy: Math.sin(ang) * 230,
            life: 0.75,
            alive: true,
            r: 4,
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
        const x = player.x + Math.cos(a) * 46;
        const y = player.y + Math.sin(a) * 46;
        carts.pos.push({ x: x, y: y, a: a });
        if (isSolid(x, y)) continue;
        for (let k = 0; k < enemies.length; k++) {
          const e = enemies[k];
          if (!e.alive) continue;
          if (globalTime - (e.cartT || 0) < 0.42) continue;
          const dx = e.x - x;
          const dy = e.y - y;
          const reach = 11 + e.radius;
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
        sfx.bottle();
        const n = bottle.countLv;
        const base = Math.atan2(ay, ax);
        muzzle(player.x + Math.cos(base) * 10, player.y - 2 + Math.sin(base) * 10, base, '#d8ffe8');
        for (let i = 0; i < n; i++) {
          if (shots.length > 160) break;
          const ang = base + (i - (n - 1) / 2) * 0.34;
          shots.push({
            kind: 'bottle',
            x: player.x,
            y: player.y - 4,
            vx: Math.cos(ang) * 160,
            vy: Math.sin(ang) * 160,
            life: 0.55,
            alive: true,
            r: 4,
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
      if (!e.alive) continue;
      e.flash = Math.max(0, e.flash - dt);
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
          const sp = 120;
          bullets.push({
            x: e.x,
            y: e.y,
            vx: nx * sp,
            vy: ny * sp,
            life: 1.7,
            r: 4,
            dmg: e.shotDmg,
            alive: true,
          });
          muzzle(e.x + nx * 10, e.y + ny * 8, Math.atan2(ny, nx), '#e2b6ff');
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

      const tx = player.x - e.x;
      const ty = player.y - e.y;
      const touch = player.radius + e.radius;
      if (tx * tx + ty * ty <= touch * touch) hurtPlayer(e.dmg, e.x, e.y);
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
      } else {
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        g.vx *= Math.exp(-3 * dt);
        g.vy *= Math.exp(-3 * dt);
      }
      if (d < player.radius + 14) {
        g.alive = false;
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
    enemies = enemies.filter((e) => e.alive);
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
    const dx = Math.round(x - cam.x);
    const dy = Math.round(y - cam.y);
    ctx.save();
    ctx.translate(dx, dy);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -((img.width / 2) | 0), -img.height + foot);
    ctx.restore();
  }

  function drawCentered(img, x, y) {
    ctx.drawImage(img, Math.round(x - cam.x - img.width / 2), Math.round(y - cam.y - img.height / 2));
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
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(Math.round(x - cam.x - rw), Math.round(y - cam.y - 2), rw * 2, 4);
  }

  function onScreen(x, y, m) {
    return x > cam.x - m && y > cam.y - m && x < cam.x + view.w + m && y < cam.y + view.h + m;
  }

  function drawWorld() {
    const sx = Math.max(0, cam.x);
    const sy = Math.max(0, cam.y);
    const dx = Math.max(0, -cam.x);
    const dy = Math.max(0, -cam.y);
    const sw = Math.min(mapCanvas.width - sx, view.w - dx);
    const sh = Math.min(mapCanvas.height - sy, view.h - dy);
    if (sw > 0 && sh > 0) ctx.drawImage(mapCanvas, sx, sy, sw, sh, dx, dy, sw, sh);

    for (let i = 0; i < fountains.length; i++) {
      const f = fountains[i];
      if (!onScreen(f.x, f.y, 24)) continue;
      const r = 3 + ((globalTime * 10 + i) % 7);
      ctx.strokeStyle = '#d8fbff';
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(Math.round(f.x - cam.x), Math.round(f.y - cam.y), r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < signs.length; i++) {
      const s = signs[i];
      if (!onScreen(s.x, s.y, 20)) continue;
      const on = Math.sin(globalTime * 5 + s.phase) > -0.15;
      const x = Math.round(s.x - cam.x);
      const y = Math.round(s.y - cam.y);
      ctx.fillStyle = '#140c18';
      ctx.fillRect(x - 1, y - 1, s.w + 2, s.h + 2);
      ctx.fillStyle = on ? s.color : '#161222';
      ctx.fillRect(x, y, s.w, s.h);
      if (on) {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.45;
        ctx.fillRect(x + 1, y, 2, 1);
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < gems.length; i++) {
      const g = gems[i];
      if (!g.alive || !onScreen(g.x, g.y, 20)) continue;
      const bob = Math.sin(globalTime * 5 + g.phase) * 1.5;
      const glint = ((globalTime * 6 + g.phase) | 0) % 5 === 0;
      drawCentered(gemSprite(g.value, glint), g.x, g.y + bob);
    }

    const actors = [];
    for (let i = 0; i < enemies.length; i++) if (enemies[i].alive) actors.push(enemies[i]);
    actors.push(player);
    actors.sort((a, b) => a.y - b.y);
    for (let i = 0; i < actors.length; i++) {
      const ent = actors[i];
      if (!onScreen(ent.x, ent.y, 40)) continue;
      if (ent === player && player.iframe > 0 && ((globalTime * 24) | 0) % 2 === 0) continue;
      let len = spr.player.length;
      if (ent !== player) {
        if (ent.type === 'boss') len = spr.boss.length;
        else if (spr[ent.type]) len = spr[ent.type].length;
      }
      const rate = ent === player && player.moving ? 9 : 6;
      const frame = ((globalTime * rate + (ent.phase || 0)) | 0) % len;
      const img = actorSprite(ent, frame);
      const foot = ent.radius + 2;
      drawShadow(ent.x, ent.y + ent.radius * 0.2, ent.radius + 2);
      const flip = ent.facing < 0;
      drawSprite(img, ent.x, ent.y + ent.radius * 0.15, flip, foot);
    }

    if (weapons && weapons.carts && weapons.carts.pos) {
      for (let i = 0; i < weapons.carts.pos.length; i++) {
        const c = weapons.carts.pos[i];
        const ang = c.a || 0;
        ctx.save();
        ctx.translate(Math.round(c.x - cam.x), Math.round(c.y - cam.y));
        ctx.rotate(ang + Math.PI / 2);
        ctx.drawImage(spr.cart, -((spr.cart.width / 2) | 0), -((spr.cart.height / 2) | 0));
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
        ctx.drawImage(spr.bottle, -((spr.bottle.width / 2) | 0), -((spr.bottle.height / 2) | 0));
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

  function draw() {
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#100e16';
    ctx.fillRect(0, 0, view.w, view.h);
    const shx = shake > 0.25 ? Math.round((Math.random() * 2 - 1) * shake) : 0;
    const shy = shake > 0.25 ? Math.round((Math.random() * 2 - 1) * shake) : 0;
    ctx.setTransform(1, 0, 0, 1, shx, shy);
    drawWorld();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const key = view.w + 'x' + view.h;
    if (key !== vignetteKey) {
      vignetteKey = key;
      const g = ctx.createRadialGradient(
        view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.2,
        view.w / 2, view.h / 2, Math.max(view.w, view.h) * 0.72
      );
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.32)');
      vignette = g;
    }
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, view.w, view.h);
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
      g.drawImage(img, ((22 - img.width) / 2) | 0, ((22 - img.height) / 2) | 0);
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
      radius: 5,
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
    updateCamera();
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
