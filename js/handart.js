/* Hand-painted GTA 2 sprites for cars, buildings, and trees. */
(function () {
  var CAR_LEN = 48;
  var TREE_H = 56;
  var carNames = [
    'bla_bil1',
    'gul_taxi1',
    'polisbil1',
    'rod_sportbil1',
    'svart_skapbil1',
    'gron_pickup1',
    'orange_korvbil1',
    'bla_muskelbil1',
    'ambulans1',
  ];
  var buildingNames = [
    'hus_tegeltak',
    'hus_lagenheter',
    'hus_horn_affar',
    'hus_kontor_skrapa',
    'hus_lagerlokal',
    'hus_nattklubb',
    'hus_mack',
    'hus_sjukhus',
    'hus_polis',
    'hus_parkeringshus',
  ];
  // ground is [g, a, b]: source pixels from the bottom. The ground band is
  // g tall and one window storey spans (b - a). Mack, lagerlokal, and
  // nattklubb have no storey bands; the whole v5 wall is one centered piece.
  var buildingStyle = {
    hus_tegeltak: { lean: 0.34, ground: [200, 200, 400] },
    hus_lagenheter: { lean: 0.48, ground: [115, 191, 266] },
    hus_horn_affar: { lean: 0.4, ground: [250, 250, 408] },
    hus_kontor_skrapa: { lean: 0.64, ground: [95, 197, 255] },
    hus_lagerlokal: { lean: 0.36 },
    hus_nattklubb: { lean: 0.56 },
    hus_mack: { lean: 0.3 },
    hus_sjukhus: { lean: 0.52, ground: [75, 120, 165] },
    hus_polis: { lean: 0.32, ground: [150, 150, 240] },
    hus_parkeringshus: { lean: 0.46, ground: [54, 54, 118] },
  };
  // One facade tile is this many world units wide. The v5 modules are 176
  // px wide, so one image pixel is half a world unit.
  var WALL_WORLD = 88;
  // Window and plain-wall modules are 52 px tall: 26 world units per storey.
  var STOREY_PX = 52;
  // Long side of one roof tile, in world units. Same size on every block.
  var ROOF_WORLD = 192;

  function load(src) {
    return new Promise(function (ok, bad) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { bad(new Error(src)); };
      img.src = src;
    });
  }

  // Facade art has the door at the bottom. Wall y=0 is the ground edge.
  function flipGround(img) {
    var c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.hand = true;
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.translate(0, img.height);
    g.scale(1, -1);
    g.drawImage(img, 0, 0);
    return c;
  }

  function cropBottom(img, px) {
    var h = Math.max(1, Math.round(px));
    if (h > img.height) h = img.height;
    var c = document.createElement('canvas');
    c.width = img.width;
    c.height = h;
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, img.height - h, img.width, h, 0, 0, img.width, h);
    return c;
  }

  // A module or a whole v5 wall, in world units. 176 px = 88 world.
  function prepPiece(img) {
    var c = flipGround(img);
    c.tileW = img.width / 2;
    c.tileH = img.height / 2;
    return c;
  }

  // ground null: draw the whole v5 wall once. Otherwise the door storey is
  // the source ground band scaled by 52/(b-a), shown once.
  function prepWall(wallImg, plainImg, winImg, ground) {
    var plain = prepPiece(plainImg);
    if (!ground) {
      return {
        whole: true,
        door: prepPiece(wallImg),
        plain: plain,
        win: null,
        groundH: 0,
      };
    }
    var groundPx = ground[0] * STOREY_PX / (ground[2] - ground[1]);
    var door = prepPiece(cropBottom(wallImg, groundPx));
    door.tileW = WALL_WORLD;
    door.tileH = groundPx / 2;
    return {
      whole: false,
      door: door,
      plain: plain,
      win: prepPiece(winImg),
      groundH: groundPx / 2,
    };
  }

  function prepRoof(img) {
    var c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.hand = true;
    var g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    var longSide = Math.max(img.width, img.height);
    var scale = ROOF_WORLD / longSide;
    c.tileW = img.width * scale;
    c.tileH = img.height * scale;
    return c;
  }

  function shadePiece(src) {
    var c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    c.hand = true;
    c.tileW = src.tileW;
    c.tileH = src.tileH;
    var g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(10, 14, 24, 0.32)';
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function shadeWall(spec) {
    return {
      whole: spec.whole,
      groundH: spec.groundH,
      door: shadePiece(spec.door),
      plain: spec.plain ? shadePiece(spec.plain) : null,
      win: spec.win ? shadePiece(spec.win) : null,
    };
  }

  function asCanvas(img, worldW, worldH) {
    var c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.worldW = worldW;
    c.worldH = worldH;
    c.hand = true;
    var g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    return c;
  }

  window.GTAHand = {
    ready: false,
    cars: {},
    carNames: carNames,
    buildings: [],
    tree: null,
  };

  var jobs = [];
  var i;
  for (i = 0; i < carNames.length; i++) {
    (function (name) {
      jobs.push(load('assets/sprites/' + name + '.png').then(function (img) {
        var worldH = CAR_LEN;
        var worldW = CAR_LEN * (img.width / img.height);
        window.GTAHand.cars[name] = asCanvas(img, worldW, worldH);
      }));
    })(carNames[i]);
  }
  var buildingSlots = new Array(buildingNames.length);
  for (i = 0; i < buildingNames.length; i++) {
    (function (name, index) {
      var style = buildingStyle[name] || { lean: 0.4 };
      jobs.push(Promise.all([
        load('assets/sprites/' + name + '_tak.png'),
        load('assets/sprites/' + name + '_vagg.png'),
        load('assets/sprites/' + name + '_planvagg.png'),
        load('assets/sprites/' + name + '_fonster.png'),
      ]).then(function (pair) {
        var roof = prepRoof(pair[0]);
        var wall = prepWall(pair[1], pair[2], pair[3], style.ground || null);
        buildingSlots[index] = {
          name: name,
          img: roof,
          roof: roof,
          wallFront: wall,
          wallSide: shadeWall(wall),
          lean: style.lean,
        };
      }));
    })(buildingNames[i], i);
  }
  jobs.push(load('assets/sprites/rund_trad1.png').then(function (img) {
    var worldH = TREE_H;
    var worldW = TREE_H * (img.width / img.height);
    window.GTAHand.tree = asCanvas(img, worldW, worldH);
  }));

  window.GTAHand.loaded = Promise.all(jobs).then(function () {
    window.GTAHand.buildings = buildingSlots;
    window.GTAHand.ready = true;
  }).catch(function () {
    window.GTAHand.ready = false;
  });
})();
