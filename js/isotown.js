/* SBS - Isometric Town Pack (CC0). See assets/sbs-isometric-town/CREDITS.txt */
(function () {
  var base = 'assets/sbs-isometric-town/';
  var sheetSrc = [
    base + 'buildings-1.png',
    base + 'buildings-2.png',
    base + 'buildings-3.png',
  ];
  var roofSrc = base + 'roofs.png';

  window.GTAIsoTown = {
    ready: false,
    pending: true,
    buildings: [],
    roofs: [],
  };

  function load(src) {
    return new Promise(function (ok, bad) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { bad(new Error(src)); };
      img.src = src;
    });
  }

  function slice(img, cw, ch, cols, rows, skipLast) {
    var list = [];
    var r, c, i, can, g;
    for (r = 0; r < rows; r++) {
      for (c = 0; c < cols; c++) {
        i = r * cols + c;
        if (skipLast && i === cols * rows - 1) continue;
        can = document.createElement('canvas');
        can.width = cw;
        can.height = ch;
        g = can.getContext('2d');
        g.imageSmoothingEnabled = false;
        g.drawImage(img, c * cw, r * ch, cw, ch, 0, 0, cw, ch);
        list.push(can);
      }
    }
    return list;
  }

  // Two building tiles side by side, plus one roof just north of them.
  window.GTAIsoTown.pieces = function (seed) {
    var b = window.GTAIsoTown.buildings;
    var roofs = window.GTAIsoTown.roofs;
    if (!b.length) return null;
    var n = Math.abs(seed | 0);
    return {
      left: b[n % b.length],
      right: b[(n * 5 + 11) % b.length],
      roof: roofs.length ? roofs[n % roofs.length] : null,
    };
  };

  Promise.all([
    load(sheetSrc[0]),
    load(sheetSrc[1]),
    load(sheetSrc[2]),
    load(roofSrc),
  ]).then(function (imgs) {
    var buildings = [];
    var i;
    for (i = 0; i < 3; i++) buildings = buildings.concat(slice(imgs[i], 64, 96, 18, 8, false));
    window.GTAIsoTown.buildings = buildings;
    window.GTAIsoTown.roofs = slice(imgs[3], 144, 92, 3, 4, true);
    window.GTAIsoTown.ready = true;
    window.GTAIsoTown.pending = false;
    if (window.GTARebuildTown) window.GTARebuildTown();
  }).catch(function () {
    window.GTAIsoTown.pending = false;
    window.GTAIsoTown.failed = true;
  });
})();
