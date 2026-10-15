// Top-down city art in the GTA 2 street style: tar roofs, brick and stucco walls.
// Classic script. Sprites are 2x world pixels so each dot matches the gubbe.
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
    const S = 2;
    const W = worldW * S;
    const H = worldH * S;
    const c = canvas(W, H, worldW, worldH);
    const g = c.getContext('2d');
    let body = color || '#c8363a';
    if (model === 'taxi') body = '#f0c014';
    if (model === 'police') body = '#1c3a8a';
    const hi = mix(body, 0.35);
    const dk = mix(body, -0.32);
    const x = 14;
    const y0 = 8;
    const bw = W - 28;
    const bh = H - 16;

    function tire(tx, ty) {
      g.fillStyle = '#000';
      g.fillRect(tx - 1, ty - 1, 12, 20);
      g.fillStyle = '#141418';
      g.fillRect(tx, ty, 10, 18);
      g.fillStyle = '#5a5864';
      g.fillRect(tx + 2, ty + 3, 6, 4);
      g.fillRect(tx + 2, ty + 11, 6, 4);
    }
    tire(1, (H * 0.16) | 0);
    tire(W - 13, (H * 0.16) | 0);
    tire(1, (H * 0.64) | 0);
    tire(W - 13, (H * 0.64) | 0);

    g.fillStyle = '#000';
    g.fillRect(x - 2, y0 - 2, bw + 4, bh + 4);
    g.fillStyle = dk;
    g.fillRect(x, y0, bw, bh);
    g.fillStyle = body;
    g.fillRect(x + 3, y0 + 3, bw - 6, bh - 6);
    g.fillStyle = hi;
    g.fillRect(x + 4, y0 + 4, 5, bh - 12);

    const seg = (p) => Math.max(6, (bh * p) | 0);
    let y = y0 + 4;
    const nose = seg(lay.nose);
    const hood = seg(lay.hood);
    const wind = seg(lay.wind);
    const roof = seg(lay.roof);
    const rear = seg(lay.rear);

    g.fillStyle = '#fff6c0';
    g.fillRect(x + 6, y, (bw * 0.22) | 0, 4);
    g.fillRect(x + bw - 6 - ((bw * 0.22) | 0), y, (bw * 0.22) | 0, 4);
    g.fillStyle = '#fff';
    g.fillRect(x + 7, y, 3, 2);
    g.fillRect(x + bw - 10, y, 3, 2);

    y += nose;
    g.fillStyle = mix(body, 0.1);
    g.fillRect(x + 4, y, bw - 8, hood - 2);
    y += hood;
    g.fillStyle = '#000';
    g.fillRect(x + 6, y - 1, bw - 12, wind + 2);
    g.fillStyle = '#163044';
    g.fillRect(x + 8, y, bw - 16, wind);
    g.fillStyle = '#d8f4ff';
    g.fillRect(x + 10, y + 1, 6, 3);
    g.fillStyle = '#8aa0a8';
    g.fillRect(x - 2, y + 2, 6, 3);
    g.fillRect(x + bw - 4, y + 2, 6, 3);

    y += wind;
    const roofColor = model === 'sports' ? '#141018' : model === 'taxi' ? '#ffe14a' : mix(body, -0.2);
    g.fillStyle = '#000';
    g.fillRect(x + 6, y - 1, bw - 12, roof + 2);
    g.fillStyle = roofColor;
    g.fillRect(x + 8, y, bw - 16, roof);
    g.fillStyle = mix(roofColor, 0.25);
    g.fillRect(x + 10, y + 2, 6, Math.max(2, roof - 4));

    if (lay.bar) {
      g.fillStyle = '#000';
      g.fillRect(x + 8, y + 1, bw - 16, 6);
      g.fillStyle = '#ff2a3a';
      g.fillRect(x + 12, y + 2, (bw * 0.22) | 0, 4);
      g.fillStyle = '#3d6bff';
      g.fillRect(x + bw - 12 - ((bw * 0.22) | 0), y + 2, (bw * 0.22) | 0, 4);
      g.fillStyle = '#f4f1ea';
      g.fillRect(x + 4, y + 4, 8, roof - 6);
      g.fillRect(x + bw - 12, y + 4, 8, roof - 6);
    }
    if (lay.sign) {
      g.fillStyle = '#000';
      g.fillRect(x + (bw * 0.28) | 0, y + 1, (bw * 0.44) | 0, 8);
      g.fillStyle = '#ffe14a';
      g.fillRect(x + (bw * 0.32) | 0, y + 3, (bw * 0.36) | 0, 4);
    }
    if (model === 'van') {
      g.fillStyle = '#000';
      g.fillRect(x + (bw / 2) | 0, y + 2, 2, roof - 4);
    }

    y += roof;
    g.fillStyle = '#000';
    g.fillRect(x + 8, y - 1, bw - 16, rear + 2);
    g.fillStyle = '#163044';
    g.fillRect(x + 10, y, bw - 20, rear);
    g.fillStyle = '#d8f4ff';
    g.fillRect(x + bw - 20, y + 1, 5, 2);

    y += rear;
    if (lay.bed) {
      g.fillStyle = '#2a241c';
      g.fillRect(x + 6, y, bw - 12, Math.max(8, y0 + bh - y - 8));
      g.fillStyle = '#4a4034';
      g.fillRect(x + 8, y + 2, bw - 16, 3);
    }
    if (lay.spoiler) {
      g.fillStyle = '#000';
      g.fillRect(x + 2, y - 2, bw - 4, 5);
      g.fillStyle = hi;
      g.fillRect(x + 6, y - 1, bw - 12, 2);
    }
    g.fillStyle = '#ff2040';
    g.fillRect(x + 6, y0 + bh - 8, (bw * 0.24) | 0, 5);
    g.fillRect(x + bw - 6 - ((bw * 0.24) | 0), y0 + bh - 8, (bw * 0.24) | 0, 5);
    g.fillStyle = '#fff';
    g.fillRect(x + 8, y0 + bh - 7, 3, 2);
    g.fillRect(x + bw - 11, y0 + bh - 7, 3, 2);
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
    g.fillStyle = base;
    g.fillRect(0, 0, W, H);
    g.fillStyle = mix(base, 0.22);
    g.fillRect(0, 0, W, Math.max(4, H >> 3));
    g.fillRect(0, 0, 4, H);
    g.fillStyle = mix(base, -0.28);
    g.fillRect(0, H - Math.max(6, H >> 3), W, Math.max(6, H >> 3));
    g.fillRect(W - 6, 0, 6, H);

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
    g.fillStyle = '#000';
    g.fillRect(ax + 16, ay + 12, 20, 16);
    g.fillStyle = '#d5dbe0';
    g.fillRect(ax + 18, ay + 14, 16, 12);
    g.fillStyle = '#2c3238';
    g.fillRect(ax + 23, ay + 18, 6, 4);
    g.fillStyle = '#7a8288';
    g.fillRect(ax + 52, ay + 10, (W * 0.28) | 0, 6);

    const style = seed % 5;
    if (style === 0) {
      const tx = W - 86 - (seed % 18);
      const ty = 22 + ((seed >> 2) % 16);
      g.fillStyle = '#5c574e';
      g.fillRect(tx + 14, ty + 10, 26, 30);
      g.fillStyle = '#000';
      g.fillRect(tx + 12, ty, 30, 16);
      g.fillStyle = '#8a8172';
      g.fillRect(tx + 14, ty + 2, 26, 12);
      g.fillStyle = '#efe8dc';
      g.fillRect(tx + 16, ty + 3, 8, 3);
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
    g.fillStyle = '#000';
    g.fillRect(W * 0.58 - 8, H * 0.62 - 8, 18, 18);
    g.fillStyle = '#5c6166';
    g.fillRect(W * 0.58 - 6, H * 0.62 - 6, 14, 14);
    g.fillStyle = '#2a2e32';
    g.fillRect(W * 0.58 - 1, H * 0.62, 3, 14);
    g.fillStyle = '#141210';
    g.fillRect(0, 0, W, 3);
    g.fillRect(0, H - 3, W, 3);
    g.fillRect(0, 0, 3, H);
    g.fillRect(W - 3, 0, 3, H);
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
    g.fillStyle = wall;
    g.fillRect(0, 0, W, H);
    g.fillStyle = mix(wall, 0.2);
    g.fillRect(0, 0, W, 8);
    g.fillRect(0, 0, 3, H);
    g.fillStyle = mix(wall, -0.28);
    g.fillRect(0, H - 10, W, 10);
    g.fillRect(W - 4, 0, 4, H);

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
      g.fillStyle = '#141210';
      g.fillRect(0, 0, W, 3);
      g.fillRect(0, 0, 2, H);
      g.fillRect(W - 2, 0, 2, H);
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
    g.fillStyle = '#141210';
    g.fillRect(0, 0, W, 3);
    g.fillRect(0, H - 3, W, 3);
    g.fillRect(0, 0, 2, H);
    g.fillRect(W - 2, 0, 2, H);
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
