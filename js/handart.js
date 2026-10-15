/* Hand-painted GTA 2 sprites for cars, buildings, and trees. */
(function () {
  var CAR_LEN = 72;
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

  function load(src) {
    return new Promise(function (ok, bad) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { bad(new Error(src)); };
      img.src = src;
    });
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
        window.GTAHand.buildings.push({ name: name, img: img });
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
