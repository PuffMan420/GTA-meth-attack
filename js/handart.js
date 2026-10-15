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
    'hus_tegeltak1',
    'hus_tegel_lagenheter1',
    'hus_horn_affar1',
    'hus_kontor_skrapa1',
    'hus_lagerlokal1',
    'hus_nattklubb1',
    'hus_mack1',
  ];
  var buildingStyle = {
    hus_tegeltak1: { lean: 0.34, roof: 0.55 },
    hus_tegel_lagenheter1: { lean: 0.48, roof: 0.38 },
    hus_horn_affar1: { lean: 0.4, roof: 0.42 },
    hus_kontor_skrapa1: { lean: 0.64, roof: 0.22 },
    hus_lagerlokal1: { lean: 0.36, roof: 0.48 },
    hus_nattklubb1: { lean: 0.56, roof: 0.3 },
    hus_mack1: { lean: 0.3, roof: 0.5 },
  };

  function load(src) {
    return new Promise(function (ok, bad) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { bad(new Error(src)); };
      img.src = src;
    });
  }

  function crop(img, sy, sh) {
    var c = document.createElement('canvas');
    c.width = img.width;
    c.height = Math.max(1, sh);
    c.hand = true;
    var g = c.getContext('2d');
    g.drawImage(img, 0, sy, img.width, sh, 0, 0, img.width, c.height);
    return c;
  }

  function shadeWall(src) {
    var c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    c.hand = true;
    var g = c.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(10, 14, 24, 0.32)';
    g.fillRect(0, 0, c.width, c.height);
    return c;
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
  for (i = 0; i < buildingNames.length; i++) {
    (function (name) {
      jobs.push(load('assets/sprites/' + name + '.png').then(function (img) {
        img.hand = true;
        var style = buildingStyle[name] || { lean: 0.4, roof: 0.45 };
        var roofH = Math.max(8, Math.round(img.height * style.roof));
        var wallY = Math.round(img.height * Math.min(0.7, style.roof * 0.82));
        var wall = crop(img, wallY, img.height - wallY);
        window.GTAHand.buildings.push({
          name: name,
          img: img,
          roof: crop(img, 0, roofH),
          wallFront: wall,
          wallSide: shadeWall(wall),
          lean: style.lean,
        });
      }));
    })(buildingNames[i]);
  }
  jobs.push(load('assets/sprites/rund_trad1.png').then(function (img) {
    var worldH = TREE_H;
    var worldW = TREE_H * (img.width / img.height);
    window.GTAHand.tree = asCanvas(img, worldW, worldH);
  }));

  window.GTAHand.loaded = Promise.all(jobs).then(function () {
    window.GTAHand.ready = true;
  }).catch(function () {
    window.GTAHand.ready = false;
  });
})();
