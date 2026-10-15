/* Jointed people: elbows, knees, hands and feet with spring physics. */
(function () {
  var LOOKS = {
    player: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#4a2a16', hairHi: '#e2a878',
      jacket: '#ffe14a', jacketHi: '#fff4a0', jacketDk: '#c49212',
      shirtHi: '#ff8aa0', shirtDk: '#c41848',
      pants: '#31408f', pantsHi: '#6a82e0', pantsDk: '#1a2458',
      shoe: '#1a1420', eye: '#140c18',
    },
    zombie: {
      skin: '#b6e070', skinHi: '#e4ffb0', skinDk: '#5a7a30',
      hair: '#243018', hairHi: '#6a7848',
      jacket: '#8a909e', jacketHi: '#c5cad4', jacketDk: '#3a4050',
      shirtHi: '#e09098', shirtDk: '#7a2838',
      pants: '#3a4a28', pantsHi: '#6ea63a', pantsDk: '#1c2810',
      shoe: '#241c18', eye: '#ff3355', mouth: '#6a1830', torn: true,
    },
    alfa: {
      skin: '#c6ee88', skinHi: '#f0ffc8', skinDk: '#6a8a38',
      hair: '#243018', hairHi: '#6a7848', mohawk: '#ff4d8d',
      jacket: '#3a3a44', jacketHi: '#7a7a88', jacketDk: '#141418',
      shirtHi: '#ff8ab4', shirtDk: '#c41858',
      pants: '#3a2030', pantsHi: '#ff4d8d', pantsDk: '#1a1018',
      shoe: '#1a1420', eye: '#ff3355', mouth: '#4a1828', torn: true, chain: true,
    },
    cop: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#2a2018', hairHi: '#d8c8b0',
      hat: '#24386e', hatHi: '#8aa6ff', badge: '#ffe14a',
      jacket: '#3a62e0', jacketHi: '#9bb6ff', jacketDk: '#1a2c78',
      shirtHi: '#ffffff', shirtDk: '#b8c8ee',
      pants: '#1a2758', pantsHi: '#4a6ad0', pantsDk: '#101838',
      shoe: '#141018', eye: '#140c18', stick: true,
    },
    dealer: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#1a1020', hairHi: '#6a5088',
      jacket: '#8a4ad4', jacketHi: '#d2b0ff', jacketDk: '#3a1868',
      shirtHi: '#4a2868', shirtDk: '#1a1028',
      pants: '#241430', pantsHi: '#7a48c0', pantsDk: '#140818',
      shoe: '#141018', shades: true, chain: true,
    },
    civ: {
      skin: '#e0a888', skinHi: '#ffd8c0', skinDk: '#a86848',
      hair: '#2a160f', hairHi: '#8a5a3a',
      jacket: '#ff8a3d', jacketHi: '#ffd0a8', jacketDk: '#c45018',
      shirtHi: '#fff', shirtDk: '#d0d4ea',
      pants: '#2a3348', pantsHi: '#5a6a8a', pantsDk: '#161c2a',
      shoe: '#1a1420', eye: '#140c18',
    },
    civ2: {
      skin: '#f0c8b0', skinHi: '#ffe8dc', skinDk: '#c48a72',
      hair: '#6a4030', hairHi: '#e0b090',
      jacket: '#2a3a62', jacketHi: '#7a90c8', jacketDk: '#141c38',
      shirtHi: '#f4f1ea', shirtDk: '#c8c4d4',
      pants: '#1c1a24', pantsHi: '#4a4658', pantsDk: '#101018',
      shoe: '#141018', eye: '#140c18', wide: true, coat: true,
    },
    civ3: {
      skin: '#8a5a3c', skinHi: '#c48a62', skinDk: '#5a3824',
      hair: '#1a100c', hairHi: '#4a3020',
      cap: '#e23b4a', capHi: '#ffb0b4',
      jacket: '#1f8a4c', jacketHi: '#7ad89a', jacketDk: '#0e4a28',
      shirtHi: '#fff6c8', shirtDk: '#e6c14a',
      pants: '#3a342c', pantsHi: '#8a7a62', pantsDk: '#241c14',
      shoe: '#1a1420', eye: '#140c18', beard: true,
    },
    civ4: {
      skin: '#f6d2b4', skinHi: '#fff0e4', skinDk: '#d09a78',
      hair: '#1a1028', hairHi: '#a888d0',
      jacket: '#ff4d8d', jacketHi: '#ffb0d0', jacketDk: '#a01848',
      shirtHi: '#ffffff', shirtDk: '#e7c6ff',
      pants: '#2a1848', pantsHi: '#6a48a0', pantsDk: '#140818',
      shoe: '#141018', eye: '#140c18', longHair: true,
    },
    civ5: {
      skin: '#d8a07a', skinHi: '#ffd2b0', skinDk: '#a06848',
      hair: '#c8c4d0', hairHi: '#f4f1ea',
      bald: true,
      jacket: '#6a6458', jacketHi: '#b8b0a4', jacketDk: '#3a342c',
      shirtHi: '#5ce1e6', shirtDk: '#1a6a78',
      pants: '#243048', pantsHi: '#4a6288', pantsDk: '#141c2c',
      shoe: '#1a1420', eye: '#140c18', wide: true,
    },
    boss: {
      skin: '#f2c19a', skinHi: '#ffe7d2', skinDk: '#c48462',
      hair: '#1a1020', hairHi: '#6a5088',
      jacket: '#6a3ad0', jacketHi: '#d2b0ff', jacketDk: '#2a1848',
      shirtHi: '#ff8ab0', shirtDk: '#c41858',
      pants: '#2a1848', pantsHi: '#6a48a0', pantsDk: '#140818',
      shoe: '#141018', shades: true, chain: true,
    },
  };

  var clock = 0;
  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    reduce = false;
  }

  function mix(hex, to, t) {
    var n = parseInt(hex.slice(1), 16);
    var m = parseInt(to.slice(1), 16);
    var r = ((n >> 16) & 255) + (((m >> 16) & 255) - ((n >> 16) & 255)) * t;
    var g = ((n >> 8) & 255) + (((m >> 8) & 255) - ((n >> 8) & 255)) * t;
    var b = (n & 255) + ((m & 255) - (n & 255)) * t;
    var h = function (v) { return Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0'); };
    return '#' + h(r) + h(g) + h(b);
  }

  function tone(hex, flash, hot) {
    if (hot) return mix(hex, '#ff4d6d', 0.62);
    if (flash) return mix(hex, '#ffffff', 0.8);
    return hex;
  }

  function joint() {
    return { a: 0, v: 0 };
  }

  function ensure(ent) {
    if (ent.joints) return ent.joints;
    ent.joints = {
      phase: ent.phase || Math.random() * 6,
      Lhip: joint(), Rhip: joint(), Lknee: joint(), Rknee: joint(), Lank: joint(), Rank: joint(),
      Lsho: joint(), Rsho: joint(), Lelb: joint(), Relb: joint(),
    };
    ent.joints.Lknee.a = 0.24;
    ent.joints.Rknee.a = 0.24;
    ent.joints.Lelb.a = 0.5;
    ent.joints.Relb.a = 0.5;
    return ent.joints;
  }

  function spring(j, target, dt, k, damp, lo, hi) {
    if (reduce) {
      j.a = target;
      j.v = 0;
      return;
    }
    j.v += (target - j.a) * k * dt;
    j.v *= Math.exp(-damp * dt);
    if (j.v > 7) j.v = 7;
    else if (j.v < -7) j.v = -7;
    j.a += j.v * dt;
    if (lo != null && j.a < lo) j.a = lo;
    if (hi != null && j.a > hi) j.a = hi;
  }

  function step(ent, dt) {
    if (!ent || !(dt > 0)) return;
    clock += dt;
    var b = ensure(ent);
    var vx = ent.mvx != null ? ent.mvx : (ent.vx || 0);
    var vy = ent.mvy != null ? ent.mvy : (ent.vy || 0);
    vx += ent.kvx || 0;
    vy += ent.kvy || 0;
    var spd = Math.hypot(vx, vy);
    var moving = !!ent.moving && spd > 8 && !(ent.dying > 0);
    var run = Math.max(0, Math.min(1, (spd - 10) / 95));
    if (moving) b.phase += dt * (5.2 + Math.min(spd, 160) * 0.085);
    var ph = b.phase;
    var k = moving ? 42 + run * 18 : 26;
    var d = moving ? 8.2 : 11;
    if (ent.dying > 0) {
      spring(b.Lhip, 0.55, dt, 14, 4.5, -1.2, 1.2);
      spring(b.Rhip, -0.25, dt, 14, 4.5, -1.2, 1.2);
      spring(b.Lknee, 1.65, dt, 14, 4.5, 0.05, 2.2);
      spring(b.Rknee, 1.45, dt, 14, 4.5, 0.05, 2.2);
      spring(b.Lank, 0.35, dt, 14, 4.5, -0.8, 0.8);
      spring(b.Rank, 0.2, dt, 14, 4.5, -0.8, 0.8);
      spring(b.Lsho, 0.85, dt, 14, 4.5, -1.4, 1.6);
      spring(b.Rsho, 1.05, dt, 14, 4.5, -1.4, 1.6);
      spring(b.Lelb, 0.4, dt, 14, 4.5, 0.08, 2.2);
      spring(b.Relb, 0.55, dt, 14, 4.5, 0.08, 2.2);
      return;
    }
    function leg(side) {
      var s = Math.sin(ph + side * Math.PI);
      var lift = Math.max(0, s);
      if (!moving) {
        var idle = Math.sin(clock * 1.5 + (ent.phase || 0) + side);
        return { hip: idle * 0.06, knee: 0.22 + idle * 0.03, ank: -0.12 };
      }
      return {
        hip: s * (0.42 + run * 0.42),
        knee: 0.16 + lift * (0.9 + run * 0.7),
        ank: -0.2 - lift * 0.4,
      };
    }
    function arm(side) {
      var s = Math.sin(ph + side * Math.PI + Math.PI);
      var bend = Math.max(0, s);
      if ((ent.cast || 0) > 0 && side === 1) return { sho: 1.2, elb: 0.2 };
      if (!moving) {
        var idle = Math.sin(clock * 1.3 + side * 1.7);
        return { sho: idle * 0.07, elb: 0.5 + idle * 0.05 };
      }
      return {
        sho: s * (0.48 + run * 0.55),
        elb: 0.28 + bend * (0.7 + run * 0.65),
      };
    }
    var L = leg(0);
    var R = leg(1);
    var LA = arm(0);
    var RA = arm(1);
    spring(b.Lhip, L.hip, dt, k, d, -1.3, 1.3);
    spring(b.Rhip, R.hip, dt, k, d, -1.3, 1.3);
    spring(b.Lknee, L.knee, dt, k, d, 0.05, 2.15);
    spring(b.Rknee, R.knee, dt, k, d, 0.05, 2.15);
    spring(b.Lank, L.ank, dt, k, d, -0.9, 0.7);
    spring(b.Rank, R.ank, dt, k, d, -0.9, 0.7);
    spring(b.Lsho, LA.sho, dt, k, d, -1.5, 1.7);
    spring(b.Rsho, RA.sho, dt, k, d, -1.5, 1.7);
    spring(b.Lelb, LA.elb, dt, k, d, 0.08, 2.2);
    spring(b.Relb, RA.elb, dt, k, d, 0.08, 2.2);
  }

  function basis(pose) {
    if (pose === 'side') return { mode: 'side' };
    if (pose === 'up') return { mode: 'back', fx: 0, fy: -0.36 };
    if (pose === 'ne') return { mode: 'diag', fx: 0.72, fy: -0.32, back: true };
    if (pose === 'se') return { mode: 'diag', fx: 0.68, fy: 0.4, back: false };
    return { mode: 'front', fx: 0, fy: 0.4 };
  }

  function mapPoint(hipX, hipY, lx, ly, B, u) {
    if (B.mode === 'side') {
      return { x: hipX + lx, y: hipY + ly * 0.92 };
    }
    var fwd = B.fy != null ? B.fy : 0.4;
    var sidePush = B.fx || 0;
    return {
      x: hipX + lx * sidePush * 0.85,
      y: hipY + ly * 0.9 + lx * fwd,
    };
  }

  function limb(hipA, bend, len1, len2, extra) {
    var lx = Math.sin(hipA) * len1;
    var ly = Math.cos(hipA) * len1;
    var ang = hipA - bend;
    if (extra) ang = hipA + bend;
    var x2 = lx + Math.sin(ang) * len2;
    var y2 = ly + Math.cos(ang) * len2;
    return { lx: lx, ly: ly, x2: x2, y2: y2, ang: ang };
  }

  function tube(ctx, a, b, w, color, hi) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10, 6, 14, 0.72)';
    ctx.lineWidth = w + 0.65;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.strokeStyle = hi;
    ctx.globalAlpha *= 0.5;
    ctx.lineWidth = Math.max(0.6, w * 0.34);
    ctx.beginPath();
    ctx.moveTo(a.x - 0.35, a.y - 0.45);
    ctx.lineTo(b.x - 0.35, b.y - 0.45);
    ctx.stroke();
    ctx.globalAlpha /= 0.5;
  }

  function knob(ctx, p, r, color, hi) {
    ctx.beginPath();
    ctx.fillStyle = 'rgba(10, 6, 14, 0.7)';
    ctx.arc(p.x, p.y, r + 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = hi;
    ctx.arc(p.x - r * 0.28, p.y - r * 0.32, r * 0.36, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw(ctx, ent, weapon) {
    var name = ent.type || 'player';
    if (name === 'alfa') name = 'alfa';
    var look = LOOKS[name] || LOOKS.player;
    var big = name === 'boss';
    var u = big ? 1.7 : 1.32;
    var flash = ent.flash > 0;
    var hot = name === 'boss' && ent.mode === 'wind';
    var skin = tone(look.skin, flash, hot);
    var skinHi = tone(look.skinHi, flash, hot);
    var skinDk = tone(look.skinDk, flash, hot);
    var jacket = tone(look.jacket, flash, hot);
    var jacketHi = tone(look.jacketHi, flash, hot);
    var jacketDk = tone(look.jacketDk, flash, hot);
    var pants = tone(look.pants, flash, hot);
    var pantsHi = tone(look.pantsHi, flash, hot);
    var pantsDk = tone(look.pantsDk, flash, hot);
    var shoe = tone(look.shoe, flash, hot);
    var b = ensure(ent);
    var B = basis(ent.pose || 'down');
    var spread = (look.wide ? 3.5 : 2.85) * u;
    var hipY = -12.15 * u;
    var shoDrop = 7.15 * u;
    var breath = (!(ent.moving) && !(ent.dying > 0)) ? Math.sin(clock * 2.1 + (ent.phase || 0)) * 0.35 : Math.sin(b.phase * 2) * 0.45 * u;
    var thigh = 6.55 * u;
    var shin = 5.95 * u;
    var upper = 5.15 * u;
    var fore = 4.55 * u;

    function poke(pt, sign, amt) {
      if (B.mode !== 'side') pt.x += sign * amt;
      return pt;
    }
    function legOf(sign, hipA, kneeA, ankA) {
      var hipX = B.mode === 'side' ? sign * 0.8 * u : sign * (spread + 0.8 * u);
      var hipYy = B.mode === 'side' ? hipY + sign * 1.5 * u : hipY;
      var seg = limb(hipA, kneeA, thigh, shin, false);
      var hip = { x: hipX, y: hipYy };
      var knee = poke(mapPoint(hipX, hipYy, seg.lx, seg.ly, B, u), sign, (0.9 + Math.abs(kneeA) * 1.5) * u);
      var foot = poke(mapPoint(hipX, hipYy, seg.x2, seg.y2, B, u), sign, 0.35 * u);
      var toeAng = seg.ang + ankA;
      var toe = mapPoint(hipX, hipYy, seg.x2 + Math.sin(toeAng) * 2.6 * u, seg.y2 + Math.cos(toeAng) * 0.7 * u, B, u);
      toe = poke(toe, sign, 0.2 * u);
      return { hip: hip, knee: knee, foot: foot, toe: toe, y: foot.y };
    }
    function armOf(sign, shoA, elbA) {
      var sx = B.mode === 'side' ? sign * 0.5 * u : sign * (spread + 2.4 * u);
      var sy = hipY - shoDrop + breath + (B.mode === 'side' ? sign * 1.1 * u : 0);
      var seg = limb(shoA, elbA, upper, fore, true);
      var sho = { x: sx, y: sy };
      var elb = poke(mapPoint(sx, sy, seg.lx, seg.ly, B, u), sign, (1.3 + Math.abs(elbA) * 2.1) * u);
      var hand = poke(mapPoint(sx, sy, seg.x2, seg.y2, B, u), sign, 1.5 * u);
      return { sho: sho, elb: elb, hand: hand, ang: seg.ang, y: hand.y };
    }

    var legs = [
      legOf(-1, b.Lhip.a, b.Lknee.a, b.Lank.a),
      legOf(1, b.Rhip.a, b.Rknee.a, b.Rank.a),
    ];
    var arms = [
      armOf(-1, b.Lsho.a, b.Lelb.a),
      armOf(1, b.Rsho.a, b.Relb.a),
    ];
    legs.sort(function (p, q) { return p.y - q.y; });
    arms.sort(function (p, q) { return p.y - q.y; });

    var lw = 3.15 * u;
    var aw = 2.45 * u;
    ctx.lineCap = 'round';
    for (var i = 0; i < 2; i++) {
      var leg = legs[i];
      tube(ctx, leg.hip, leg.knee, lw, pants, pantsHi);
      tube(ctx, leg.knee, leg.foot, lw * 0.86, pantsDk, pantsHi);
      knob(ctx, leg.knee, 1.55 * u, pantsHi, '#fff6e8');
      ctx.save();
      ctx.translate(leg.foot.x, leg.foot.y);
      var fa = Math.atan2(leg.toe.y - leg.foot.y, leg.toe.x - leg.foot.x);
      ctx.rotate(fa);
      ctx.fillStyle = 'rgba(8,6,12,0.65)';
      ctx.beginPath();
      ctx.ellipse(0.8 * u, 0.35 * u, 2.7 * u, 1.25 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = shoe;
      ctx.beginPath();
      ctx.ellipse(0.7 * u, 0.15 * u, 2.45 * u, 1.05 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f4f1ea';
      ctx.beginPath();
      ctx.ellipse(-0.2 * u, -0.15 * u, 0.7 * u, 0.35 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    var midX = 0;
    var midY = hipY - shoDrop * 0.48 + breath;
    var rx = (look.wide ? 5.4 : 4.5) * u * (big ? 1.12 : 1);
    var ry = shoDrop * 0.62;
    ctx.fillStyle = 'rgba(8,6,12,0.45)';
    ctx.beginPath();
    ctx.ellipse(midX + 0.4, midY + 0.6, rx + 0.6, ry + 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    var grd = ctx.createLinearGradient(midX - rx, midY - ry, midX + rx, midY + ry);
    grd.addColorStop(0, jacketHi);
    grd.addColorStop(0.45, jacket);
    grd.addColorStop(1, jacketDk);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(midX, midY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!(B.mode === 'back' && ent.pose === 'up')) {
      ctx.fillStyle = tone(look.shirtHi, flash, hot);
      ctx.beginPath();
      ctx.ellipse(midX, midY - ry * 0.05, rx * 0.42, ry * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = tone(look.shirtDk, flash, hot);
      ctx.beginPath();
      ctx.ellipse(midX, midY + ry * 0.22, rx * 0.28, ry * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (look.torn) {
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(midX - rx * 0.25, midY + ry * 0.1, 1.3 * u, 1.1 * u, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (look.badge) {
      ctx.fillStyle = tone(look.badge, flash, hot);
      ctx.beginPath();
      ctx.arc(midX + rx * 0.45, midY - ry * 0.2, 1.15 * u, 0, Math.PI * 2);
      ctx.fill();
    }
    if (look.chain) {
      ctx.strokeStyle = '#ffe9a0';
      ctx.lineWidth = 0.8 * u;
      ctx.beginPath();
      ctx.arc(midX, midY + ry * 0.15, rx * 0.45, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    if (look.coat) {
      ctx.strokeStyle = jacketDk;
      ctx.lineWidth = 2.2 * u;
      ctx.beginPath();
      ctx.arc(midX, midY + ry * 0.55, rx * 0.95, 0.15, Math.PI - 0.15);
      ctx.stroke();
    }

    var headY = hipY - shoDrop - 4.3 * u + breath;
    var headRx = 3.55 * u * (big ? 1.08 : 1);
    var headRy = 4.05 * u * (big ? 1.08 : 1);
    ctx.fillStyle = 'rgba(8,6,12,0.4)';
    ctx.beginPath();
    ctx.ellipse(0.3, headY + 0.4, headRx + 0.5, headRy + 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    var face = ctx.createLinearGradient(0, headY - headRy, 0, headY + headRy);
    face.addColorStop(0, skinHi);
    face.addColorStop(0.6, skin);
    face.addColorStop(1, skinDk);
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.ellipse(0, headY, headRx, headRy, 0, 0, Math.PI * 2);
    ctx.fill();

    if (look.mohawk) {
      ctx.fillStyle = tone(look.mohawk, flash, hot);
      ctx.beginPath();
      ctx.ellipse(0, headY - headRy * 0.55, 0.9 * u, 3.4 * u, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (look.hat) {
      ctx.fillStyle = tone(look.hat, flash, hot);
      ctx.beginPath();
      ctx.ellipse(0, headY - headRy * 0.35, headRx * 1.05, headRy * 0.55, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = tone(look.hatHi, flash, hot);
      ctx.beginPath();
      ctx.ellipse(0, headY - headRy * 0.15, headRx * 1.35, 0.7 * u, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (look.cap) {
      ctx.fillStyle = tone(look.cap, flash, hot);
      ctx.beginPath();
      ctx.ellipse(0, headY - headRy * 0.45, headRx * 1.05, headRy * 0.48, 0, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(headRx * 0.7, headY - headRy * 0.15, headRx * 0.7, 0.55 * u, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (!look.bald) {
      ctx.fillStyle = tone(look.hair, flash, hot);
      ctx.beginPath();
      ctx.ellipse(0, headY - headRy * 0.28, headRx * 1.05, headRy * 0.72, 0, Math.PI, 0, true);
      ctx.fill();
      ctx.fillStyle = tone(look.hairHi, flash, hot);
      ctx.beginPath();
      ctx.ellipse(-headRx * 0.35, headY - headRy * 0.55, headRx * 0.28, headRy * 0.16, -0.4, 0, Math.PI * 2);
      ctx.fill();
      if (look.longHair) {
        ctx.strokeStyle = tone(look.hair, flash, hot);
        ctx.lineWidth = 1.6 * u;
        ctx.beginPath();
        ctx.moveTo(-headRx * 0.85, headY);
        ctx.quadraticCurveTo(-headRx * 1.2, headY + headRy, -headRx * 0.7, headY + headRy * 1.7);
        ctx.moveTo(headRx * 0.85, headY);
        ctx.quadraticCurveTo(headRx * 1.2, headY + headRy, headRx * 0.7, headY + headRy * 1.7);
        ctx.stroke();
      }
    }
    if (big) {
      ctx.fillStyle = '#e6b325';
      ctx.beginPath();
      ctx.ellipse(-2.2 * u, headY - headRy * 0.85, 1.1 * u, 1.8 * u, -0.3, 0, Math.PI * 2);
      ctx.ellipse(0, headY - headRy * 1.05, 1.2 * u, 2.1 * u, 0, 0, Math.PI * 2);
      ctx.ellipse(2.2 * u, headY - headRy * 0.85, 1.1 * u, 1.8 * u, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    var showFace = ent.pose !== 'up';
    if (showFace) {
      var eye = tone(look.eye || '#140c18', flash, hot);
      if (look.shades) {
        ctx.fillStyle = '#100c16';
        ctx.beginPath();
        ctx.ellipse(-headRx * 0.38, headY + headRy * 0.05, headRx * 0.38, headRy * 0.16, 0, 0, Math.PI * 2);
        ctx.ellipse(headRx * 0.38, headY + headRy * 0.05, headRx * 0.38, headRy * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d8fbff';
        ctx.lineWidth = 0.6 * u;
        ctx.beginPath();
        ctx.moveTo(-headRx * 0.2, headY);
        ctx.lineTo(headRx * 0.2, headY);
        ctx.stroke();
      } else if (B.mode === 'side') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(headRx * 0.45, headY + 0.2 * u, 1.15 * u, 1.25 * u, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = eye;
        ctx.beginPath();
        ctx.arc(headRx * 0.62, headY + 0.25 * u, 0.55 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = skinDk;
        ctx.beginPath();
        ctx.ellipse(headRx * 0.95, headY + headRy * 0.28, 0.7 * u, 0.45 * u, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-headRx * 0.38, headY + 0.15 * u, 1.15 * u, 1.3 * u, 0, 0, Math.PI * 2);
        ctx.ellipse(headRx * 0.38, headY + 0.15 * u, 1.15 * u, 1.3 * u, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = eye;
        ctx.beginPath();
        ctx.arc(-headRx * 0.38, headY + 0.2 * u, 0.55 * u, 0, Math.PI * 2);
        ctx.arc(headRx * 0.38, headY + 0.2 * u, 0.55 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = tone(look.mouth || '#c4847c', flash, hot);
        ctx.lineWidth = 0.7 * u;
        ctx.beginPath();
        ctx.arc(0, headY + headRy * 0.28, headRx * 0.28, 0.15, Math.PI - 0.15);
        ctx.stroke();
        if (look.beard) {
          ctx.fillStyle = tone(look.hair, flash, hot);
          ctx.beginPath();
          ctx.ellipse(0, headY + headRy * 0.55, headRx * 0.55, headRy * 0.28, 0, 0, Math.PI);
          ctx.fill();
        }
      }
    }

    var lead = null;
    for (var a = 0; a < 2; a++) {
      var arm = arms[a];
      tube(ctx, arm.sho, arm.elb, aw, jacket, jacketHi);
      tube(ctx, arm.elb, arm.hand, aw * 0.82, skin, skinHi);
      knob(ctx, arm.elb, 1.25 * u, skinHi, '#fff');
      knob(ctx, arm.sho, 1.05 * u, jacketDk, jacketHi);
      ctx.save();
      ctx.translate(arm.hand.x, arm.hand.y);
      ctx.rotate(arm.ang);
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(0.8 * u, 0, 2.15 * u, 1.45 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = skinDk;
      ctx.lineWidth = 0.95 * u;
      ctx.lineCap = 'round';
      for (var f = -1; f <= 1; f++) {
        ctx.beginPath();
        ctx.moveTo(1.4 * u, f * 0.62 * u);
        ctx.quadraticCurveTo(2.5 * u, f * 0.85 * u, 3.15 * u, f * 0.5 * u);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0.3 * u, -1.05 * u);
      ctx.quadraticCurveTo(1.5 * u, -2.05 * u, 2.05 * u, -0.75 * u);
      ctx.stroke();
      ctx.restore();
      if (arm.hand.x >= (lead ? lead.hand.x : -999)) lead = arm;
    }
    if (look.stick && lead) {
      ctx.strokeStyle = '#d5d0dc';
      ctx.lineWidth = 1.1 * u;
      ctx.beginPath();
      ctx.moveTo(lead.hand.x, lead.hand.y);
      ctx.lineTo(lead.hand.x + Math.sin(lead.ang) * 8 * u, lead.hand.y + Math.cos(lead.ang) * 8 * u);
      ctx.stroke();
    }
    if (weapon && lead) {
      var ww = weapon.worldW || 8;
      var wh = weapon.worldH || 8;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(weapon, lead.hand.x - ww * 0.2, lead.hand.y - wh * 0.7, ww, wh);
      ctx.imageSmoothingEnabled = true;
    }
    ctx.lineWidth = 1;
  }

  window.GTAPeople = { step: step, draw: draw };
})();
