/* SBS - Isometric Roads Pack (CC0). See assets/sbs-isometric-roads/CREDITS.txt */
(function () {
  var base = 'assets/sbs-isometric-roads/';
  var files = [
    'Road_Asphalt_03-128x64.png',
    'Road_Asphalt_04-128x64.png',
    'Road_Asphalt_10-128x64.png',
    'Road_Asphalt_14-128x64.png',
    'Road_Asphalt_16-128x64.png',
  ];
  var TW = 128;
  var TH = 64;
  var ROAD = 96;

  window.GTAIsoRoads = {
    ready: false,
    pending: true,
    failed: false,
    sheets: [],
  };

  function load(src) {
    return new Promise(function (ok, bad) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { bad(new Error(src)); };
      img.src = src;
    });
  }

  function canvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function keySheet(img) {
    var tiles = [];
    var cross = null;
    var i, c, r, can, g, data, d, p, opaque;
    for (i = 0; i < 12; i++) {
      if (i === 3) continue;
      c = i % 4;
      r = (i / 4) | 0;
      can = canvas(TW, TH);
      g = can.getContext('2d');
      g.drawImage(img, c * TW, r * TH, TW, TH, 0, 0, TW, TH);
      data = g.getImageData(0, 0, TW, TH);
      d = data.data;
      opaque = 0;
      for (p = 0; p < d.length; p += 4) {
        if (d[p] > 230 && d[p + 1] < 30 && d[p + 2] > 230) d[p + 3] = 0;
        else if (d[p + 3] > 40) opaque++;
      }
      g.putImageData(data, 0, 0);
      if (opaque < 80) continue;
      if (i === 0) cross = can;
      tiles.push(can);
    }
    return { tiles: tiles, cross: cross };
  }

  function shear(tile, sign) {
    var w = TW;
    var h = TH;
    var outH = h + (w >> 1);
    var src = tile.getContext('2d').getImageData(0, 0, w, h).data;
    var can = canvas(w, outH);
    var g = can.getContext('2d');
    var dst = g.createImageData(w, outH);
    var dd = dst.data;
    var x, y, shift, yy, si, di;
    for (x = 0; x < w; x++) {
      shift = x >> 1;
      for (y = 0; y < h; y++) {
        yy = sign > 0 ? y + shift : y + ((w >> 1) - 1 - shift);
        if (yy < 0 || yy >= outH) continue;
        si = (y * w + x) * 4;
        di = (yy * w + x) * 4;
        dd[di] = src[si];
        dd[di + 1] = src[si + 1];
        dd[di + 2] = src[si + 2];
        dd[di + 3] = src[si + 3];
      }
    }
    g.putImageData(dst, 0, 0);
    return can;
  }

  function coreOf(sheared) {
    var w = sheared.width;
    var h = sheared.height;
    var data = sheared.getContext('2d').getImageData(0, 0, w, h).data;
    var rows = [];
    var y, x, n, ys, y0, y1, bh, xs, ok, x0, x1, c, g;
    function opaque(px, py) {
      return data[(py * w + px) * 4 + 3] > 40;
    }
    for (y = 0; y < h; y++) {
      n = 0;
      for (x = 0; x < w; x++) if (opaque(x, y)) n++;
      rows.push(n);
    }
    ys = [];
    for (y = 0; y < h; y++) if (rows[y] > w * 0.35) ys.push(y);
    if (!ys.length) return null;
    y0 = ys[0];
    y1 = ys[ys.length - 1] + 1;
    bh = y1 - y0;
    xs = [];
    for (x = 0; x < w; x++) {
      ok = true;
      for (y = y0; y < y1; y++) {
        if (!opaque(x, y)) { ok = false; break; }
      }
      if (ok) xs.push(x);
    }
    if (xs.length < 8) return null;
    x0 = xs[0];
    x1 = xs[xs.length - 1] + 1;
    c = canvas(x1 - x0, bh);
    g = c.getContext('2d');
    g.drawImage(sheared, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
    return c;
  }

  function scaleToRoad(src) {
    var dw = Math.max(1, Math.round(src.width * ROAD / src.height));
    var c = canvas(dw, ROAD);
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(src, 0, 0, src.width, src.height, 0, 0, dw, ROAD);
    return c;
  }

  function bestCore(tile) {
    var best = null;
    var s, core;
    for (s = 0; s < 2; s++) {
      core = coreOf(shear(tile, s === 0 ? 1 : -1));
      if (!core) continue;
      if (!best || core.width > best.width) best = core;
    }
    return best;
  }

  function buildStrip(tiles) {
    var parts = [];
    var i, core, total, strip, g, x;
    for (i = 0; i < tiles.length; i++) {
      core = bestCore(tiles[i]);
      if (core) parts.push(scaleToRoad(core));
    }
    total = 0;
    for (i = 0; i < parts.length; i++) total += parts[i].width;
    strip = canvas(Math.max(1, total), ROAD);
    g = strip.getContext('2d');
    g.imageSmoothingEnabled = false;
    x = 0;
    for (i = 0; i < parts.length; i++) {
      g.drawImage(parts[i], x, 0);
      x += parts[i].width;
    }
    return strip;
  }

  function turnVertical(strip) {
    var c = canvas(strip.height, strip.width);
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.translate(c.width, 0);
    g.rotate(Math.PI / 2);
    g.drawImage(strip, 0, 0);
    return c;
  }

  function asphaltFrom(strip) {
    var y0 = 30;
    var h = 36;
    var w = Math.min(strip.width, 96);
    var c = canvas(w, h);
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(strip, 0, y0, w, h, 0, 0, w, h);
    return c;
  }

  Promise.all(files.map(function (name) { return load(base + name); })).then(function (imgs) {
    var sheets = [];
    var i, cut, strip;
    for (i = 0; i < imgs.length; i++) {
      cut = keySheet(imgs[i]);
      if (!cut.tiles.length || !cut.cross) throw new Error('sheet');
      strip = buildStrip(cut.tiles);
      sheets.push({
        horiz: strip,
        vert: turnVertical(strip),
        cross: cut.cross,
        asphalt: asphaltFrom(strip),
      });
    }
    window.GTAIsoRoads.sheets = sheets;
    window.GTAIsoRoads.ready = true;
    window.GTAIsoRoads.pending = false;
    if (window.GTAPaintRoads) window.GTAPaintRoads();
  }).catch(function () {
    window.GTAIsoRoads.pending = false;
    window.GTAIsoRoads.failed = true;
    window.GTAIsoRoads.ready = false;
  });
})();
