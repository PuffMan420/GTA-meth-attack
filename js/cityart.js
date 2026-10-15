// Original top-down city art: GTA 2 style vehicles, roofs, and wall strips.
// Classic script. Sprites are 3x world pixels, then drawn nearest-neighbor.
(function () {
  'use strict';

  function hash(a, b) {
    let n = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return (n ^ (n >>> 16)) >>> 0;
  }

  function clamp(n) {
    return n < 0 ? 0 : n > 255 ? 255 : n | 0;
  }

  function mix(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => clamp(c + (amt > 0 ? (255 - c) * amt : c * amt));
    const r = f((n >> 16) & 255);
    const g = f((n >> 8) & 255);
    const b = f(n & 255);
    const h = (v) => v.toString(16).padStart(2, '0');
    return '#' + h(r) + h(g) + h(b);
  }

  function canvas(w, h, ww, wh) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.worldW = ww;
    c.worldH = wh;
    return c;
  }

  function chamfer(g, x, y, w, h, r) {
    const rr = Math.max(1, r);
    g.beginPath();
    g.moveTo(x + rr, y);
    g.lineTo(x + w - rr, y);
    g.lineTo(x + w, y + rr);
    g.lineTo(x + w, y + h - rr);
    g.lineTo(x + w - rr, y + h);
    g.lineTo(x + rr, y + h);
    g.lineTo(x, y + h - rr);
    g.lineTo(x, y + rr);
    g.closePath();
  }

  function wheel(g, x, y, vertical) {
    g.fillStyle = '#120e14';
    if (vertical) g.fillRect(x, y, 7, 16);
    else g.fillRect(x, y, 16, 7);
    g.fillStyle = '#3a3644';
    if (vertical) g.fillRect(x + 1, y + 3, 5, 4);
    else g.fillRect(x + 3, y + 1, 4, 5);
    g.fillStyle = '#6a6474';
    if (vertical) g.fillRect(x + 2, y + 4, 2, 2);
    else g.fillRect(x + 4, y + 2, 2, 2);
  }

  function glass(g, x, y, w, h) {
    const grd = g.createLinearGradient(x, y, x + w, y + h);
    grd.addColorStop(0, 'rgba(232, 250, 255, 0.92)');
    grd.addColorStop(0.45, '#7ec8e4');
    grd.addColorStop(1, '#163044');
    g.fillStyle = grd;
    g.fillRect(x, y, w, h);
    g.fillStyle = 'rgba(255,255,255,0.72)';
    g.fillRect(x + 2, y + 2, Math.max(2, w * 0.28), Math.max(2, h * 0.22));
  }

  const LAYOUT = {
    sedan: { nose: 0.06, hood: 0.30, wind: 0.12, roof: 0.22, rear: 0.10, trunk: 0.14, inset: 0.16, round: 10 },
    taxi: { nose: 0.06, hood: 0.28, wind: 0.12, roof: 0.24, rear: 0.10, trunk: 0.14, inset: 0.16, round: 10, sign: true },
    police: { nose: 0.06, hood: 0.28, wind: 0.11, roof: 0.24, rear: 0.10, trunk: 0.15, inset: 0.15, round: 9, bar: true },
    van: { nose: 0.04, hood: 0.12, wind: 0.10, roof: 0.58, rear: 0.06, trunk: 0.06, inset: 0.10, round: 6 },
    sports: { nose: 0.05, hood: 0.40, wind: 0.10, roof: 0.16, rear: 0.08, trunk: 0.12, inset: 0.12, round: 14, spoiler: true },
    pickup: { nose: 0.05, hood: 0.26, wind: 0.10, roof: 0.22, rear: 0.04, trunk: 0.26, inset: 0.13, round: 8, bed: true },
  };

  function paintCar(model, color) {
    const lay = LAYOUT[model] || LAYOUT.sedan;
    const worldW = model === 'van' ? 40 : model === 'pickup' ? 38 : model === 'sports' ? 34 : 36;
    const worldH = model === 'van' ? 80 : model === 'pickup' ? 76 : model === 'sports' ? 70 : model === 'police' ? 74 : 72;
    const S = 3;
    const W = worldW * S;
    const H = worldH * S;
    const c = canvas(W, H, worldW, worldH);
    const g = c.getContext('2d');
    let body = color || '#c8363a';
    if (model === 'taxi') body = '#f0c014';
    if (model === 'police') body = '#1b2c58';
    const hi = mix(body, 0.42);
    const dk = mix(body, -0.38);
    const inset = (W * lay.inset) | 0;
    const x = inset;
    const bw = W - inset * 2;
    let y = 4;
    const seg = (p) => Math.max(6, (H * p) | 0);
    const nose = seg(lay.nose);
    const hood = seg(lay.hood);
    const wind = seg(lay.wind);
    const roof = seg(lay.roof);
    const rear = seg(lay.rear);
    const trunk = seg(lay.trunk);

    wheel(g, 2, (H * 0.18) | 0, true);
    wheel(g, W - 9, (H * 0.18) | 0, true);
    wheel(g, 2, (H * 0.68) | 0, true);
    wheel(g, W - 9, (H * 0.68) | 0, true);

    const bodyGrd = g.createLinearGradient(x, 0, x + bw, 0);
    bodyGrd.addColorStop(0, dk);
    bodyGrd.addColorStop(0.22, hi);
    bodyGrd.addColorStop(0.5, body);
    bodyGrd.addColorStop(0.82, body);
    bodyGrd.addColorStop(1, dk);
    g.fillStyle = bodyGrd;
    chamfer(g, x, y, bw, H - 8, lay.round);
    g.fill();

    g.fillStyle = 'rgba(255,255,255,0.28)';
    g.fillRect(x + bw * 0.42, y + 6, Math.max(3, bw * 0.08), hood * 0.72);

    g.fillStyle = '#141018';
    g.fillRect(x + 4, y + 2, bw * 0.28, 4);
    g.fillRect(x + bw - bw * 0.32, y + 2, bw * 0.28, 4);
    g.fillStyle = '#fff4c8';
    g.fillRect(x + 6, y + 3, bw * 0.2, 3);
    g.fillRect(x + bw - bw * 0.28, y + 3, bw * 0.18, 3);

    y += nose;
    g.fillStyle = mix(body, 0.12);
    g.fillRect(x + 3, y, bw - 6, hood);
    g.fillStyle = 'rgba(255,255,255,0.16)';
    g.fillRect(x + bw * 0.62, y + 4, bw * 0.22, hood * 0.45);

    y += hood - 2;
    glass(g, x + bw * 0.12, y, bw * 0.76, wind);
    g.fillStyle = '#0c1014';
    g.fillRect(x + bw * 0.12, y, bw * 0.76, 2);

    g.fillStyle = '#d8d4dc';
    g.fillRect(x - 4, y + 2, 6, 4);
    g.fillRect(x + bw - 2, y + 2, 6, 4);

    y += wind;
    const roofColor = model === 'sports' ? '#141018' : model === 'taxi' ? '#f6d34a' : mix(body, -0.18);
    g.fillStyle = roofColor;
    g.fillRect(x + bw * 0.08, y, bw * 0.84, roof);
    g.fillStyle = 'rgba(255,255,255,0.14)';
    g.fillRect(x + bw * 0.14, y + 3, bw * 0.18, Math.max(3, roof * 0.25));

    if (lay.bar) {
      g.fillStyle = '#0c0a10';
      g.fillRect(x + bw * 0.18, y - 2, bw * 0.64, 7);
      g.fillStyle = '#ff2d3c';
      g.fillRect(x + bw * 0.22, y - 1, bw * 0.22, 5);
      g.fillStyle = '#3d6dff';
      g.fillRect(x + bw * 0.52, y - 1, bw * 0.22, 5);
      g.fillStyle = '#f4f1ea';
      g.fillRect(x + 2, y + roof * 0.25, bw * 0.22, roof * 0.5);
      g.fillRect(x + bw - bw * 0.24, y + roof * 0.25, bw * 0.22, roof * 0.5);
    }
    if (lay.sign) {
      g.fillStyle = '#141018';
      g.fillRect(x + bw * 0.3, y + 2, bw * 0.4, 8);
      g.fillStyle = '#ffe14a';
      g.fillRect(x + bw * 0.34, y + 4, bw * 0.32, 4);
      g.fillStyle = '#1a1408';
      g.fillRect(x + bw * 0.4, y + 5, 3, 2);
      g.fillRect(x + bw * 0.52, y + 5, 3, 2);
    }
    if (model === 'van') {
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.fillRect(x + bw * 0.5, y + 4, 2, roof - 8);
      g.fillStyle = mix(body, 0.2);
      g.fillRect(x + 4, y + 8, bw * 0.28, roof * 0.35);
    }

    y += roof;
    glass(g, x + bw * 0.16, y, bw * 0.68, rear);
    y += rear;
    g.fillStyle = mix(body, -0.08);
    g.fillRect(x + 3, y, bw - 6, trunk);
    if (lay.bed) {
      g.fillStyle = '#2a241c';
      g.fillRect(x + 6, y + 3, bw - 12, trunk - 8);
      g.fillStyle = '#4a4034';
      g.fillRect(x + 8, y + 5, bw - 16, 4);
      g.fillStyle = mix(body, -0.2);
      g.fillRect(x + 4, y + trunk - 8, bw - 8, 6);
    }
    if (lay.spoiler) {
      g.fillStyle = '#0c0a10';
      g.fillRect(x + 2, y - 4, bw - 4, 5);
      g.fillStyle = hi;
      g.fillRect(x + 6, y - 3, bw - 12, 2);
    }
    g.fillStyle = '#ff3358';
    g.fillRect(x + 5, H - 12, bw * 0.22, 5);
    g.fillRect(x + bw - bw * 0.22 - 5, H - 12, bw * 0.22, 5);
    g.fillStyle = '#fff';
    g.globalAlpha = 0.7;
    g.fillRect(x + 6, H - 11, 4, 2);
    g.fillRect(x + bw - bw * 0.22 - 2, H - 11, 4, 2);
    g.globalAlpha = 1;

    g.strokeStyle = 'rgba(8,6,12,0.65)';
    g.lineWidth = 2;
    chamfer(g, x, 4, bw, H - 8, lay.round);
    g.stroke();
    return c;
  }

  function paintRoof(fw, fh, pal, seed) {
    const S = 2;
    const eaves = 8;
    const W = (fw + eaves * 2) * S;
    const H = (fh + eaves * 2) * S;
    const c = canvas(W, H, fw + eaves * 2, fh + eaves * 2);
    const g = c.getContext('2d');
    const base = pal.roof;
    const grd = g.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, mix(base, 0.16));
    grd.addColorStop(0.5, base);
    grd.addColorStop(1, mix(base, -0.28));
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    g.fillStyle = mix(base, -0.18);
    for (let i = 16; i < W; i += 28) g.fillRect(i, 8, 2, H - 16);
    for (let i = 18; i < H; i += 24) g.fillRect(8, i, W - 16, 2);
    const n = 18 + (seed % 10);
    for (let i = 0; i < n; i++) {
      const hx = hash(seed, i);
      g.fillStyle = (hx & 1) ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.18)';
      g.fillRect((hx % (W - 12)), (hash(i, seed) % (H - 12)), 3 + (hx & 3), 2);
    }
    const ax = 18 + (seed % 40);
    const ay = 22 + ((seed >> 3) % 36);
    g.fillStyle = '#8d93a0';
    g.fillRect(ax, ay, 46, 28);
    g.fillStyle = '#5c6370';
    g.fillRect(ax + 4, ay + 4, 38, 8);
    g.fillStyle = '#d5d8e0';
    g.beginPath();
    g.arc(ax + 22, ay + 18, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2a3038';
    g.beginPath();
    g.arc(ax + 22, ay + 18, 3, 0, Math.PI * 2);
    g.fill();
    const tx = W - 70 - (seed % 20);
    const ty = 16 + ((seed >> 2) % 24);
    g.fillStyle = '#6a6458';
    g.fillRect(tx + 10, ty + 8, 22, 26);
    g.fillStyle = '#8a8478';
    g.beginPath();
    g.arc(tx + 21, ty + 8, 12, Math.PI, 0);
    g.fill();
    g.fillStyle = '#3a342c';
    g.fillRect(tx + 18, ty + 28, 6, 10);
    g.fillStyle = '#9fd8ea';
    g.fillRect(28, H - 58, 34, 22);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.fillRect(32, H - 54, 10, 6);
    g.fillStyle = '#c5ced6';
    g.beginPath();
    g.arc(W * 0.62, H * 0.62, 11, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#22262c';
    g.fillRect(W * 0.62 - 1, H * 0.62, 2, 16);
    g.fillStyle = '#9aa0a8';
    g.fillRect(W - 28, 12, 3, 26);
    g.fillRect(W - 36, 12, 18, 3);
    return c;
  }

  function paintWall(len, pal, seed, neon, front) {
    const S = 2;
    const W = Math.max(64, len * S);
    const H = 78 * S;
    const c = canvas(W, H, len, 78);
    const g = c.getContext('2d');
    const wall = pal.wall;
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, mix(wall, 0.2));
    grd.addColorStop(0.45, wall);
    grd.addColorStop(1, mix(wall, -0.35));
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    for (let y = 8; y < H; y += 7) g.fillRect(0, y, W, 1);
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (let x = 10; x < W; x += 18) g.fillRect(x, 0, 1, H);
    const cols = Math.max(2, (len / 28) | 0);
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < 3; row++) {
        const wx = 12 + col * ((W - 24) / cols);
        const wy = 18 + row * 42;
        if (front && col === (cols >> 1) && row === 2) continue;
        const lit = ((seed + col * 3 + row * 5) % 4) !== 0;
        g.fillStyle = '#100c14';
        g.fillRect(wx, wy, 18, 24);
        g.fillStyle = lit ? pal.win : pal.off;
        g.fillRect(wx + 2, wy + 2, 14, 20);
        g.fillStyle = '#140c18';
        g.fillRect(wx + 9, wy + 2, 1, 20);
        g.fillRect(wx + 2, wy + 12, 14, 1);
        if (lit) {
          g.fillStyle = 'rgba(255,246,196,0.8)';
          g.fillRect(wx + 3, wy + 3, 4, 3);
        }
      }
    }
    if (front) {
      const doorX = (W / 2 - 16) | 0;
      g.fillStyle = '#1a100c';
      g.fillRect(doorX, H - 62, 32, 58);
      g.fillStyle = '#5a3824';
      g.fillRect(doorX + 3, H - 58, 26, 52);
      g.fillStyle = pal.win;
      g.fillRect(doorX + 6, H - 54, 20, 10);
      g.fillStyle = '#e6c14a';
      g.fillRect(doorX + 22, H - 30, 3, 3);
      g.fillStyle = '#100c14';
      g.fillRect(doorX - 8, 8, 48, 16);
      g.fillStyle = neon;
      g.fillRect(doorX - 4, 11, 40, 10);
      g.fillStyle = 'rgba(255,255,255,0.65)';
      g.fillRect(doorX - 1, 13, 8, 3);
    } else {
      g.strokeStyle = '#3a4048';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(18, 20);
      g.lineTo(28, 70);
      g.lineTo(18, 70);
      g.lineTo(28, 120);
      g.stroke();
      g.fillStyle = (seed % 2) ? 'rgba(255,77,141,0.35)' : 'rgba(92,225,230,0.3)';
      g.fillRect(W - 70, H - 50, 40, 18);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(W - 64, H - 46, 16, 3);
    }
    g.fillStyle = mix(pal.roof, -0.2);
    g.fillRect(0, 0, W, 8);
    return c;
  }

  window.GTACity = {
    models: ['sedan', 'taxi', 'police', 'van', 'sports', 'pickup'],
    paintCar: paintCar,
    paintRoof: paintRoof,
    paintWall: paintWall,
    mix: mix,
  };
})();
