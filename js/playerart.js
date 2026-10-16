/* The player is the hand-painted gubbe. One sprite, with a bob for idle, walk, and run. */
(function () {
  var CAR_LEN = 48;

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
    // Normal people paint about 11.92 by 21.08 world px (22px sprite, 26 of 32
    // columns and 46 of 48 rows). This picture's solid torso is 179/209 of the
    // frame, so the world box has to be wider than the NPC sprite or he stays
    // narrow. Then 6.5% larger than those people, in both width and height.
    var npcW = (26 / 32) * (16 * (22 / 24));
    var npcH = (46 / 48) * 22;
    var bump = 1.065;
    var torso = 179 / 209;
    c.worldH = npcH * bump;
    c.worldW = (npcW * bump) / torso;
    c.hand = true;
    var g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    return c;
  }

  function flashOf(c) {
    var o = document.createElement('canvas');
    o.width = c.width;
    o.height = c.height;
    o.worldW = c.worldW;
    o.worldH = c.worldH;
    o.hand = true;
    var g = o.getContext('2d');
    g.drawImage(c, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, o.width, o.height);
    return o;
  }

  window.GTAPlayer = { ready: false };

  window.GTAPlayer.bob = function (ent, time) {
    var spd = Math.hypot(ent.vx || 0, ent.vy || 0);
    if (ent.moving && spd > 96) return Math.round(Math.sin(time * 18) * 2);
    if (ent.moving && spd > 8) return Math.round(Math.sin(time * 10) * 1);
    return Math.sin(time * 2.2) > 0 ? -1 : 0;
  };

  window.GTAPlayer.frame = function (ent, time) {
    if (!window.GTAPlayer.ready) return null;
    var book = ent.flash > 0 ? window.GTAPlayer.flash : window.GTAPlayer.idle;
    if (!book || !book.length) return null;
    return book[0];
  };

  window.GTAPlayer.loaded = load('assets/sprites/gubbe_spelare.png').then(function (img) {
    var frame = wrap(img);
    var flash = flashOf(frame);
    window.GTAPlayer.idle = [frame];
    window.GTAPlayer.walk = [frame];
    window.GTAPlayer.run = [frame];
    window.GTAPlayer.flash = [flash];
    window.GTAPlayer.idleFlash = [flash];
    window.GTAPlayer.walkFlash = [flash];
    window.GTAPlayer.runFlash = [flash];
    window.GTAPlayer.ready = true;
  }).catch(function () {
    window.GTAPlayer.ready = false;
  });
})();
