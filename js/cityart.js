// Top-down city art in the GTA 2 street style: tar roofs, brick and stucco walls.
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
    const grd = g.createLinearGradient(0, 0, W, H * 0.15);
    grd.addColorStop(0, mix(base, 0.2));
    grd.addColorStop(1, base);
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
    const shade = g.createLinearGradient(0, H * 0.55, 0, H);
    shade.addColorStop(0, 'rgba(0,0,0,0)');
    shade.addColorStop(1, 'rgba(20, 16, 12, 0.28)');
    g.fillStyle = shade;
    g.fillRect(0, 0, W, H);

    g.fillStyle = 'rgba(255,255,255,0.04)';
    for (let y = 14; y < H - 10; y += 10) g.fillRect(10, y, W - 20, 1);
    g.fillStyle = 'rgba(0,0,0,0.16)';
    for (let x = 16; x < W - 10; x += 22) g.fillRect(x, 12, 1, H - 22);
    const specks = 26 + (seed % 12);
    for (let i = 0; i < specks; i++) {
      const hx = hash(seed, i + 3);
      g.fillStyle = (hx & 1) ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.2)';
      g.fillRect(12 + (hx % (W - 28)), 12 + (hash(i, seed) % (H - 28)), 2 + (hx & 3), 2);
    }

    g.fillStyle = mix(base, 0.22);
    g.fillRect(0, 0, W, 8);
    g.fillRect(0, 0, 8, H);
    g.fillStyle = mix(base, -0.34);
    g.fillRect(0, H - 10, W, 10);
    g.fillRect(W - 10, 0, 10, H);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    g.fillRect(8, 8, W - 16, 2);
    g.fillRect(8, 8, 2, H - 16);

    const ax = 28 + (seed % (Math.max(8, W - 160)));
    const ay = 28 + ((seed >> 3) % Math.max(8, (H * 0.35) | 0));
    g.fillStyle = '#9aa0a6';
    g.fillRect(ax, ay, 52, 30);
    g.fillStyle = '#6e767c';
    g.fillRect(ax + 3, ay + 3, 46, 8);
    g.fillStyle = '#d5dbe0';
    g.beginPath();
    g.arc(ax + 26, ay + 20, 8, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2c3238';
    g.beginPath();
    g.arc(ax + 26, ay + 20, 3, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#7a8288';
    g.fillRect(ax + 52, ay + 10, (W * 0.28) | 0, 6);

    const style = seed % 5;
    if (style === 0) {
      const tx = W - 86 - (seed % 18);
      const ty = 22 + ((seed >> 2) % 16);
      g.fillStyle = '#5c574e';
      g.fillRect(tx + 14, ty + 10, 26, 30);
      g.fillStyle = '#8a8172';
      g.beginPath();
      g.arc(tx + 27, ty + 10, 14, Math.PI, 0);
      g.fill();
      g.fillStyle = '#3a342c';
      g.fillRect(tx + 24, ty + 34, 6, 12);
      g.fillStyle = '#6a6458';
      g.fillRect(tx + 8, ty + 40, 40, 4);
    } else if (style === 1) {
      g.fillStyle = '#8ec4d4';
      g.fillRect(30, H - 72, 40, 24);
      g.fillRect(78, H - 68, 22, 16);
      g.fillStyle = 'rgba(255,255,255,0.65)';
      g.fillRect(34, H - 68, 12, 6);
      g.fillStyle = '#5c6870';
      g.fillRect(30, H - 74, 40, 3);
      g.fillRect(26, H - 48, 48, 3);
    } else if (style === 2) {
      g.fillStyle = '#b7b3a8';
      for (let i = 0; i < 4; i++) g.fillRect(36 + i * 28, H * 0.55, 16, 16);
      g.fillStyle = '#6a6860';
      for (let i = 0; i < 4; i++) g.fillRect(40 + i * 28, H * 0.55 + 5, 8, 6);
    } else if (style === 3) {
      g.fillStyle = '#4a4036';
      g.fillRect(W * 0.42, 24, 58, 22);
      g.fillStyle = '#2a241c';
      g.fillRect(W * 0.42 + 4, 28, 22, 14);
      g.fillStyle = '#6e8f62';
      g.fillRect(W * 0.42 + 30, 30, 22, 10);
      g.fillStyle = '#8aa878';
      g.fillRect(W * 0.42 + 34, 26, 8, 6);
    } else {
      g.fillStyle = '#7d868c';
      g.fillRect(40, 36, 34, 22);
      g.fillStyle = '#c5d0d6';
      g.fillRect(44, 40, 12, 8);
      g.fillStyle = '#5a5348';
      g.fillRect(W - 78, H - 64, 36, 22);
      g.fillStyle = '#3a342c';
      g.fillRect(W - 74, H - 60, 14, 14);
    }

    g.fillStyle = '#8e949a';
    g.fillRect(W - 34, 16, 4, 28);
    g.fillRect(W - 44, 16, 20, 4);
    g.fillStyle = '#5c6166';
    g.beginPath();
    g.arc(W * 0.58, H * 0.62, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2a2e32';
    g.fillRect(W * 0.58 - 1, H * 0.62, 3, 14);
    return c;
  }

  const SIGNS = ['BAR', 'DINER', 'HOTEL', 'CAFE', 'BANK', 'AUTO', 'OPEN', 'INN', 'MARKET', 'LIQUOR'];

  function wallLuma(hex) {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11;
  }

  function paintWall(len, pal, seed, neon, front) {
    const S = 2;
    const wallH = 64;
    const W = Math.max(64, len * S);
    const H = wallH * S;
    const c = canvas(W, H, len, wallH);
    const g = c.getContext('2d');
    const wall = front ? pal.wall : mix(pal.wall, -0.22);
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, mix(wall, 0.16));
    grd.addColorStop(0.55, wall);
    grd.addColorStop(1, mix(wall, -0.28));
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);

    const brick = wallLuma(pal.wall) < 150;
    if (brick) {
      g.fillStyle = 'rgba(40, 24, 18, 0.28)';
      const bh = 8;
      const bw = 18;
      for (let y = 10; y < H; y += bh) {
        g.fillRect(0, y, W, 1);
        const off = ((y / bh) & 1) ? (bw >> 1) : 0;
        for (let x = -bw + off; x < W; x += bw) g.fillRect(x, y, 1, bh);
      }
    } else {
      g.fillStyle = 'rgba(255,255,255,0.06)';
      for (let y = 14; y < H; y += 12) g.fillRect(0, y, W, 1);
      g.fillStyle = 'rgba(0,0,0,0.08)';
      for (let i = 0; i < 18; i++) {
        const hx = hash(seed, i + 20);
        g.fillRect(hx % W, 12 + (hash(i, seed) % (H - 20)), 3, 2);
      }
    }

    g.fillStyle = mix(pal.roof, -0.15);
    g.fillRect(0, 0, W, 8);
    g.fillStyle = mix(wall, 0.28);
    g.fillRect(0, 8, W, 3);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    g.fillRect(0, H - 4, W, 4);

    const cols = Math.max(3, (len / 26) | 0);
    const rows = front ? 2 : 3;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wx = 10 + col * ((W - 20) / cols);
        const wy = 16 + row * 28;
        if (wy > H - 46) continue;
        const lit = ((seed + col * 3 + row * 7) % 5) === 0;
        g.fillStyle = '#1a1612';
        g.fillRect(wx, wy, 16, 20);
        g.fillStyle = lit ? '#e6d2a4' : (pal.win || '#b7c4cc');
        g.fillRect(wx + 1, wy + 1, 14, 18);
        g.fillStyle = 'rgba(20, 28, 34, 0.55)';
        g.fillRect(wx + 8, wy + 1, 1, 18);
        g.fillRect(wx + 1, wy + 10, 14, 1);
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillRect(wx + 2, wy + 2, 4, 3);
      }
    }

    if (!front) {
      g.strokeStyle = '#4a463e';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(16, 18);
      g.lineTo(28, 48);
      g.lineTo(16, 48);
      g.lineTo(28, 78);
      g.lineTo(16, 78);
      g.lineTo(28, 108);
      g.stroke();
      g.fillStyle = '#3a3630';
      g.fillRect(8, 46, 22, 3);
      g.fillRect(8, 76, 22, 3);
      return c;
    }

    const style = seed % 5;
    const doorW = style === 4 ? 40 : 26;
    const doorX = (W / 2 - doorW / 2) | 0;
    const doorY = H - 40;
    const sign = SIGNS[seed % SIGNS.length];
    g.font = '700 15px Courier New, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';

    if (style === 1 || style === 3) {
      g.fillStyle = '#1a1612';
      g.fillRect(doorX - 16, doorY - 2, doorW + 32, 40);
      g.fillStyle = pal.win;
      g.fillRect(doorX - 12, doorY + 2, 16, 22);
      g.fillRect(doorX + doorW - 4, doorY + 2, 16, 22);
      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.fillRect(doorX - 10, doorY + 4, 5, 4);
      g.fillStyle = '#3a2a1c';
      g.fillRect(doorX + 4, doorY, doorW - 8, 38);
      g.fillStyle = '#6a4a30';
      g.fillRect(doorX + 6, doorY + 2, doorW - 12, 34);
      const awning = style === 3 ? '#8d3a32' : (neon || '#c4a15a');
      g.fillStyle = awning;
      g.fillRect(doorX - 20, doorY - 14, doorW + 40, 12);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(doorX - 20, doorY - 14, doorW + 40, 3);
      g.fillStyle = '#1a140c';
      g.fillText(sign, W / 2, doorY - 8);
    } else if (style === 2) {
      g.fillStyle = '#1c2428';
      g.fillRect(doorX - 6, doorY - 4, doorW + 12, 42);
      g.fillStyle = '#9bb4c0';
      g.fillRect(doorX - 2, doorY, (doorW / 2) | 0, 34);
      g.fillRect(doorX + (doorW / 2) + 2, doorY, (doorW / 2) - 2, 34);
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.fillRect(doorX, doorY + 2, 6, 8);
      g.fillStyle = '#2a2824';
      g.fillRect(doorX - 8, doorY - 18, doorW + 16, 12);
      g.fillStyle = '#efe6d4';
      g.fillRect(doorX - 6, doorY - 16, doorW + 12, 8);
      g.fillStyle = '#1a140c';
      g.fillText(sign, W / 2, doorY - 12);
    } else if (style === 4) {
      g.fillStyle = '#2a241c';
      g.fillRect(8, doorY + 8, W - 16, 28);
      g.fillStyle = '#3a342c';
      g.fillRect(14, doorY + 4, 28, 32);
      g.fillRect(W - 42, doorY + 4, 28, 32);
      g.fillStyle = '#6a5438';
      g.fillRect(doorX, doorY, doorW, 36);
      g.fillStyle = '#8a7048';
      g.fillRect(doorX + 3, doorY + 3, doorW - 6, 30);
      g.fillStyle = '#1a140c';
      g.fillRect(doorX + doorW - 8, doorY + 16, 3, 3);
    } else {
      g.fillStyle = '#1a140e';
      g.fillRect(doorX, doorY, doorW, 38);
      g.fillStyle = '#5a3c28';
      g.fillRect(doorX + 2, doorY + 2, doorW - 4, 34);
      g.fillStyle = pal.win;
      g.fillRect(doorX + 5, doorY + 4, doorW - 10, 10);
      g.fillStyle = '#e0c56a';
      g.fillRect(doorX + doorW - 7, doorY + 18, 3, 3);
      g.fillStyle = '#2a241c';
      g.fillRect(doorX - 6, doorY - 16, doorW + 12, 12);
      g.fillStyle = neon || '#d8c49a';
      g.fillRect(doorX - 4, doorY - 14, doorW + 8, 8);
      g.fillStyle = '#1a140c';
      g.fillText(sign, W / 2, doorY - 10);
    }
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
