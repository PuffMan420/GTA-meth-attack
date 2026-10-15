/* Player sprites: idle, walk, and run cut from the 60x90 gubbe. */
(function () {
  var base = 'assets/sprites/player/';

  function load(src) {
    return new Promise(function (ok, bad) {
      var img = new Image();
      img.onload = function () { ok(img); };
      img.onerror = function () { bad(new Error(src)); };
      img.src = src;
    });
  }

  function wrap(img) {
    var c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    c.worldW = img.width / 2;
    c.worldH = img.height / 2;
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, 0);
    return c;
  }

  function flashOf(c) {
    var o = document.createElement('canvas');
    o.width = c.width;
    o.height = c.height;
    o.worldW = c.worldW;
    o.worldH = c.worldH;
    var g = o.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(c, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, o.width, o.height);
    return o;
  }

  function loadSet(name, n) {
    var jobs = [];
    var i;
    for (i = 1; i <= n; i++) jobs.push(load(base + name + '_' + i + '.png'));
    return Promise.all(jobs).then(function (imgs) {
      var frames = [];
      var flashes = [];
      var k;
      for (k = 0; k < imgs.length; k++) {
        frames.push(wrap(imgs[k]));
        flashes.push(flashOf(frames[k]));
      }
      window.GTAPlayer[name] = frames;
      window.GTAPlayer[name + 'Flash'] = flashes;
    });
  }

  window.GTAPlayer = { ready: false };

  window.GTAPlayer.frame = function (ent, time) {
    if (!window.GTAPlayer.ready) return null;
    var spd = Math.hypot(ent.vx || 0, ent.vy || 0);
    var set = 'idle';
    var rate = 3;
    if (ent.moving && spd > 96) {
      set = 'run';
      rate = 12;
    } else if (ent.moving && spd > 8) {
      set = 'walk';
      rate = 8;
    }
    var book = ent.flash > 0 ? window.GTAPlayer[set + 'Flash'] : window.GTAPlayer[set];
    if (!book || !book.length) return null;
    return book[((time * rate) | 0) % book.length];
  };

  Promise.all([
    loadSet('idle', 4),
    loadSet('walk', 8),
    loadSet('run', 8),
  ]).then(function () {
    window.GTAPlayer.ready = true;
  }).catch(function () {
    window.GTAPlayer.ready = false;
  });
})();
