/* ===================== v23 battle side of the class trees (04u): new mechanics + one animation per new skill ===================== */
// ---------- damage: bonus conditions, stat-borrowing, sure crits ----------
// 明鏡止水: +25% crit while it lasts
function ctWeakEl(t) { let best = null, bm = 1; for (const el of ['火', '水', '草', '雷', '毒', '岩', '飛']) { const m = famMult(el, t); if (m > bm) { bm = m; best = el; } } return best; }

// the foe's turn: 神盾 blocks the whole turn, 影分身 takes a hit (and the hero counters), 炎之壁 / 靜電場 burn / paralyse a foe that touches you
// timers

/* ---------- animations: every new skill has its own shape, colour and rhythm ---------- */
HERO_PK.moon = (x, p, a) => { const r = p.r * Math.min(1, p.t / 8); x.globalAlpha = Math.min(1, a * 1.3) * (p.al || 1); const g = x.createRadialGradient(p.x, p.y, r * 0.2, p.x, p.y, r * 1.8); g.addColorStop(0, 'rgba(240,244,255,0.5)'); g.addColorStop(1, 'rgba(160,180,255,0)'); x.fillStyle = g; x.fillRect(p.x - r * 2, p.y - r * 2, r * 4, r * 4);
  x.fillStyle = p.c || '#eef2ff'; x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.fill(); if (p.dark) { x.fillStyle = '#0a0612'; x.beginPath(); x.arc(p.x + r * 0.08, p.y, r * 0.86, 0, 7); x.fill(); } else { x.fillStyle = 'rgba(180,190,230,0.5)'; x.beginPath(); x.arc(p.x - r * 0.3, p.y - r * 0.2, r * 0.22, 0, 7); x.arc(p.x + r * 0.25, p.y + r * 0.3, r * 0.15, 0, 7); x.fill(); } };
HERO_PK.clock = (x, p, a) => { const r = p.r; x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 1.5; x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.stroke(); for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6; x.fillStyle = p.c; x.fillRect(Math.round(p.x + Math.cos(an) * (r - 3)) - 1, Math.round(p.y + Math.sin(an) * (r - 3)) - 1, 2, 2); }
  const h = -Math.PI / 2 + p.t * 0.02, m = -Math.PI / 2 - p.t * 0.25; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + Math.cos(h) * r * 0.5, p.y + Math.sin(h) * r * 0.5); x.moveTo(p.x, p.y); x.lineTo(p.x + Math.cos(m) * r * 0.8, p.y + Math.sin(m) * r * 0.8); x.stroke(); };
const ctHit = (b, T, c, n = 8) => { b.spawn({ k: 'glow', x: T.x, y: T.y, r: 16, c, life: 10 }); for (let i = 0; i < n; i++) b.spawn({ k: 'dot', x: T.x, y: T.y, vx: rnd(-22, 22) / 10, vy: rnd(-22, 12) / 10, c, s: 2, life: 12 }); };
const ctLine = (b, x1, y1, x2, y2, c, w = 4, life = 14, grow = 3) => { b.spawn({ k: 'line', x1, y1, x2, y2, c, w, grow, life }); b.spawn({ k: 'line', x1, y1, x2, y2, c: '#ffffff', w: Math.max(1, w / 3), grow, life }); };
Object.assign(FX, {
  // ---- 劍聖 ----
  *meikyoOn(U, T, u) { Sound.sfx('tick'); this.spawn({ k: 'dark', a: 0.45, c: '#040814', life: 30 }); this.spawn({ k: 'mote', x: U.x, y: U.y - 50, vy: 2.2, s: 2, c: '#e8f4ff', life: 22 });
    yield* wait(20); for (let i = 0; i < 3; i++) this.spawn({ k: 'shock', x: U.x, y: U.y + 22, r0: 4 + i * 4, r1: 40 + i * 12, c: i % 2 ? '#ffffff' : '#8ad0ff', life: 22 + i * 6 }); this.spawn({ k: 'line', x1: U.x - 40, y1: U.y + 22, x2: U.x + 40, y2: U.y + 22, c: '#c8ecff', w: 1, grow: 8, life: 26 }); yield* wait(14); },
  *meikyo(U, T, u) { yield* FX.meikyoOn.call(this, U, T, u); },
  *flashStep(U, T, u) { Sound.sfx('wind'); for (let i = 0; i < 10; i++) this.spawn({ k: 'streak', x: U.x + rnd(-10, 30), y: U.y + rnd(-20, 20), vx: 9, len: rnd(10, 24), c: i % 2 ? '#ffffff' : '#ffd878', life: 8 }); yield* this.lunge(u, 26, 1);
    Sound.sfx('slash'); ctLine(this, T.x - 34, T.y - 2, T.x + 34, T.y - 8, '#ffd070', 3, 12, 2); this.spawn({ k: 'star', x: T.x + 30, y: T.y - 8, c: '#fff4c0', life: 12 }); yield* wait(6); },
  *flashStepHit(U, T, u) { Sound.sfx('slash'); ctLine(this, T.x + 34, T.y + 6, T.x - 34, T.y - 14, '#ffd070', 3, 12, 2); this.spawn({ k: 'star', x: T.x - 30, y: T.y - 14, c: '#ffffff', life: 12 }); ctHit(this, T, '#ffe8a0', 6); yield* wait(6); },
  *mushin(U, T, u) { this.spawn({ k: 'dark', a: 0.85, c: '#020206', life: 56 }); Sound.sfx('tick'); for (let i = 0; i < 10; i++) this.spawn({ k: 'petal', x: rnd(0, W), y: rnd(-10, 40), vx: -0.3, vy: 0.6, rot: i, s: 3, c: i % 3 ? '#ffe0ec' : '#ffffff', life: 56 });
    yield* wait(22); Sound.sfx('slash'); ctLine(this, -10, T.y + 40, W + 10, T.y - 44, '#ffffff', 3, 22, 3); yield* wait(12);
    Sound.sfx('crit'); this.spawn({ k: 'flash', c: '#ffffff', a: 0.9, life: 8 }); this.shake = 16; this.sparks(T.x, T.y, 26, ['#ffffff', '#ffe0ec', '#c8c8d8'], 3.6, 22, 0.08); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 60, c: '#ffffff', w: 2, life: 16 }); yield* wait(12); },
  // ---- 狂戰士 ----
  *warCry(U) { Sound.sfx('exclaim'); Sound.sfx('quake'); this.shake = 12; this.tintH = { c: '#ff4020', a: 0.3 };
    for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 6, r1: 50 + i * 10, c: i % 2 ? '#ffb070' : '#ff4020', w: 3, life: 16 }); yield* wait(5); }
    this.spawn({ k: 'txt', s: '！！', x: U.x + 10, y: U.y - 44, c: '#ffe0a0', sh: '#601010', vy: -0.4, fade: 1, life: 24 }); yield* wait(12); this.tintH = null; },
  *bloodBlade(U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x - 4, y: T.y, r: 26, ang: 0.4, c: '#ffd0d0', c2: '#a01020', w: 8, life: 16 });
    for (let i = 0; i < 10; i++) this.spawn({ k: 'dot', x: T.x + rnd(-8, 12), y: T.y + rnd(-10, 6), vx: rnd(-10, 14) / 10, vy: -rnd(4, 18) / 10, g: 0.14, c: i % 2 ? '#c01828' : '#ff4050', s: 2, life: 22 }); yield* wait(10);
    for (let i = 0; i < 10; i++) this.spawn({ k: 'mote', x: T.x + rnd(-12, 12), y: T.y + rnd(-12, 12), to: U, s: 2, c: i % 2 ? '#ff4050' : '#ffb0b0', life: 18 }); yield* wait(6); },
  *lastStand(U, T, u) { Sound.sfx('fire'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 34, c: '#ff3018', life: 26 }); for (let i = 0; i < 12; i++) this.spawn({ k: 'mote', x: U.x + rnd(-14, 14), y: U.y + rnd(0, 20), vy: -1.4, s: 2, c: i % 2 ? '#ff5030' : '#ffd080', life: 22 });
    yield* wait(12); yield* this.lunge(u, 18, 2); Sound.sfx('hitSuper'); arcCut(this, T, { r: 34, a0: -2.6, a1: 0.9, rot: 0.2, w: 7, c: '#e02818', c2: '#ffe0a0', grow: 4, life: 16 });
    for (let i = 0; i < 12; i++) this.spawn({ k: 'dot', x: T.x, y: T.y, vx: rnd(-30, 30) / 10, vy: rnd(-24, 10) / 10, g: 0.08, c: i % 2 ? '#ff7040' : '#ffe0a0', s: 2, life: 18 }); this.shake = 10; yield* wait(10); },
  *frenzy(U, T, u) { yield* this.lunge(u, 10, 2); yield* FX.frenzyHit.call(this, U, T, u, 0); },
  *frenzyHit(U, T, u, i) { Sound.sfx(i % 2 ? 'hit' : 'slash'); for (let k = 0; k < 2; k++) { const an = rnd(-80, 80) / 100 + (k ? Math.PI / 2 : 0), L = 26; ctLine(this, T.x - Math.cos(an) * L, T.y - Math.sin(an) * L, T.x + Math.cos(an) * L, T.y + Math.sin(an) * L, k ? '#401018' : '#ff3030', 4, 9, 2); }
    this.spawn({ k: 'flash', c: '#ff2020', a: 0.15, life: 4 }); this.shake = Math.max(this.shake, 6); ctHit(this, T, '#ff6060', 5); yield* wait(5); },
  *asura(U, T, u) { Sound.sfx('quake'); this.spawn({ k: 'dark', a: 0.6, c: '#200004', life: 44 }); this.spawn({ k: 'pillar', x: U.x, y: U.y + 22, w: 20, h: 100, c: '#ff2030', life: 30 });
    for (let i = 0; i < 20; i++) this.spawn({ k: 'mote', x: U.x + rnd(-16, 16), y: U.y + rnd(-6, 24), vy: -(1 + Math.random() * 1.6), s: 2, c: i % 3 ? '#ff3040' : '#ffffff', life: 24 }); yield* wait(18);
    yield* this.lunge(u, 22, 2); Sound.sfx('crit'); this.spawn({ k: 'xcut', x: T.x, y: T.y, r: 44, c: '#d01020', life: 26 }); this.spawn({ k: 'flash', c: '#ff2030', a: 0.45, life: 10 }); this.shake = 20;
    for (let i = 0; i < 3; i++) this.spawn({ k: 'shock', x: T.x, y: T.y + 16, r0: 8 + i * 6, r1: 56 + i * 14, c: i % 2 ? '#ffc0c0' : '#c01020', life: 16 + i * 4 }); this.sparks(T.x, T.y, 24, ['#ff3040', '#ffffff', '#600010'], 3.4, 22, 0.1); yield* wait(14); },
  // ---- 火焰術士 ----
  *kindle(U, T, u) { Sound.sfx('fire'); const p = this.spawn({ k: 'mote', x: U.x + 10, y: U.y - 10, to: T, s: 3, c: '#ffb040', life: 20 }); for (let i = 0; i < 6; i++) { this.spawn({ k: 'flame', x: lerp(U.x, T.x, i / 6), y: lerp(U.y - 10, T.y, i / 6), vy: -0.6, s: 2, life: 12 + i }); } yield* wait(14);
    for (let i = 0; i < 10; i++) this.spawn({ k: 'flame', x: T.x + rnd(-10, 10), y: T.y + 18 + rnd(-4, 4), vy: -1.2 - Math.random(), s: rnd(2, 4), life: rnd(16, 26) }); this.spawn({ k: 'glow', x: T.x, y: T.y + 14, r: 18, c: '#ff8030', life: 18 }); yield* wait(10); },
  *flameWallOn(U, T, u) { Sound.sfx('fire'); for (let k = 0; k < 3; k++) { for (let i = 0; i < 12; i++) { const an = i * Math.PI / 6 + k * 0.25; this.spawn({ k: 'flame', x: U.x + Math.cos(an) * 30, y: U.y + 18 + Math.sin(an) * 9, vy: -1.6 - Math.random(), s: rnd(3, 5), life: rnd(16, 26) }); } yield* wait(5); }
    this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 14, r1: 34, c: '#ff8030', life: 20 }); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 36, c: '#ff6020', life: 22 }); yield* wait(10); },
  *flameWall(U, T, u) { yield* FX.flameWallOn.call(this, U, T, u); },
  *combust(U, T, u) { Sound.sfx('charge'); for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8; this.spawn({ k: 'mote', x: T.x + Math.cos(an) * 44, y: T.y + Math.sin(an) * 30, to: T, s: 3, c: i % 2 ? '#ff6020' : '#ffe080', life: 18 }); } yield* wait(16);
    Sound.sfx('fire'); Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#ffb040', a: 0.5, life: 8 }); this.shake = 16; this.spawn({ k: 'glow', x: T.x, y: T.y, r: 54, c: '#ff7020', life: 20 });
    for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 40 + i * 14, c: i % 2 ? '#ffe080' : '#ff5020', w: 3, life: 14 + i * 3 });
    for (let i = 0; i < 20; i++) { const an = i * Math.PI / 10; this.spawn({ k: 'flame', x: T.x, y: T.y, vx: Math.cos(an) * 2.6, vy: Math.sin(an) * 2, s: rnd(3, 5), life: rnd(14, 22) }); } yield* wait(14); },
  *phoenix(U, T, u) { Sound.sfx('fire'); const vx = (T.x - U.x) / 18, vy = (T.y - 10 - U.y) / 18;
    for (const s of [1, -1]) for (let k = 0; k < 3; k++) this.spawn({ k: 'cres', x: U.x, y: U.y - 14 - k * 4, r: 20 + k * 6, ang: s > 0 ? -1.9 - k * 0.12 : 1.9 + k * 0.12 - Math.PI * 2, c: k ? '#ffe080' : '#ffffff', c2: k === 2 ? '#e03010' : '#ff8020', w: 7 - k, vx, vy, life: 20 });
    for (let i = 0; i < 18; i++) this.spawn({ k: 'flame', x: U.x, y: U.y - 10, vx: vx * (0.4 + Math.random() * 0.6), vy: vy * 0.6 - 0.4, s: rnd(3, 5), life: rnd(16, 24) }); Sound.sfx('wind'); yield* wait(18);
    Sound.sfx('hitSuper'); this.spawn({ k: 'pillar', x: T.x, y: T.y + 26, w: 24, h: 120, c: '#ff7020', life: 24 }); this.spawn({ k: 'flash', c: '#ffd080', a: 0.5, life: 10 }); this.shake = 18;
    for (let i = 0; i < 18; i++) { const an = -Math.PI / 2 + rnd(-120, 120) / 100; this.spawn({ k: 'petal', x: T.x, y: T.y, vx: Math.cos(an) * 2.6, vy: Math.sin(an) * 2.6, rot: an, s: 5, c: i % 2 ? '#ffb040' : '#ff5020', life: 26 }); } yield* wait(16); },
  // ---- 雷霆術士 ----
  *quickBolt(U, T, u) { Sound.sfx('thunder'); const pts = []; for (let k = 0; k <= 8; k++) pts.push([lerp(U.x + 8, T.x, k / 8), lerp(U.y - 12, T.y, k / 8) + (k % 8 ? rnd(-8, 8) : 0)]); this.spawn({ k: 'bolt', pts, w: 3, life: 10 });
    this.spawn({ k: 'flash', c: '#fff8c0', a: 0.3, life: 5 }); ctHit(this, T, '#ffe860', 10); yield* wait(10); },
  *staticOn(U, T, u) { Sound.sfx('thunder'); for (let k = 0; k < 3; k++) { for (let i = 0; i < 3; i++) { const an = Math.random() * 7, r = 18 + Math.random() * 14; const x0 = U.x + Math.cos(an) * r, y0 = U.y + Math.sin(an) * r * 0.8; this.spawn({ k: 'bolt', pts: [[x0, y0], [x0 + rnd(-8, 8), y0 + rnd(-8, 8)], [x0 + rnd(-12, 12), y0 + rnd(-12, 12)]], w: 2, life: 8 }); } yield* wait(5); }
    this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 36, r1: 22, c: '#ffe040', w: 2, fl: 0.8, life: 18 }); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 30, c: '#ffe040', life: 18 }); yield* wait(10); },
  *staticField(U, T, u) { yield* FX.staticOn.call(this, U, T, u); },
  *overload(U, T, u) { Sound.sfx('charge'); for (let i = 0; i < 14; i++) { const an = Math.random() * 7; this.spawn({ k: 'mote', x: T.x + Math.cos(an) * 50, y: T.y + Math.sin(an) * 36, to: T, s: 2, c: i % 2 ? '#ffe040' : '#ffffff', life: 16 }); } yield* wait(14);
    Sound.sfx('thunder'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 40, c: '#fff080', life: 16 }); this.spawn({ k: 'flash', c: '#fffbd0', a: 0.45, life: 6 }); this.shake = 12;
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + rnd(-20, 20) / 100, pts = []; let r = 4; for (let k = 0; k < 5; k++) { pts.push([T.x + Math.cos(an) * r + rnd(-3, 3), T.y + Math.sin(an) * r * 0.8 + rnd(-3, 3)]); r += 10; } this.spawn({ k: 'bolt', pts, w: 2, life: 10 }); } yield* wait(12); },
  *raijin(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'dark', a: 0.5, c: '#080a1c', life: 70 }); for (let i = 0; i < 8; i++) { const an = -Math.PI + i * Math.PI / 7; this.spawn({ k: 'circ', x: T.x + Math.cos(an) * 40, y: T.y - 70 + Math.sin(an) * 12, r: 4, c: '#e8c040', hl: '#ffffff', life: 70 }); this.spawn({ k: 'ring', x: T.x + Math.cos(an) * 40, y: T.y - 70 + Math.sin(an) * 12, r0: 5, r1: 5, c: '#7a5010', w: 1, life: 70 }); }
    yield* wait(12); yield* FX.raijinHit.call(this, U, T, u, 0); },
  *raijinHit(U, T, u, i) { Sound.sfx('thunder'); const x0 = T.x + [0, -10, 10][i % 3], pts = []; let xx = x0; for (let y = T.y - 72; y < T.y + 16; y += 8) { pts.push([xx, y]); xx += rnd(-6, 6); } this.spawn({ k: 'bolt', pts, w: 5, life: 10 });
    this.spawn({ k: 'beam', x: x0, y1: T.y + 20, w: 10, h: 96, c: '#fff4a0', life: 10 }); this.spawn({ k: 'flash', c: '#fffbe0', a: 0.4, life: 5 }); this.shake = Math.max(this.shake, 10); this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 4, r1: 34, c: '#ffe860', life: 12 }); yield* wait(8); },
  // ---- 聖騎士 ----
  *holyBlade(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'rays', x: U.x + 16, y: U.y - 20, n: 10, a0: 0, len: 18, c: '#ffe890', life: 16 }); yield* wait(10); yield* this.lunge(u, 16, 3); Sound.sfx('slash');
    ctLine(this, T.x - 24, T.y - 34, T.x + 20, T.y + 30, '#ffd860', 6, 16, 3); yield* wait(3); this.spawn({ k: 'line', x1: T.x - 16, y1: T.y, x2: T.x + 16, y2: T.y, c: '#ffffff', w: 2, grow: 2, life: 14 }); this.spawn({ k: 'line', x1: T.x, y1: T.y - 20, x2: T.x, y2: T.y + 20, c: '#ffffff', w: 2, grow: 2, life: 14 });
    this.spawn({ k: 'glow', x: T.x, y: T.y, r: 26, c: '#ffe070', life: 14 }); for (let i = 0; i < 8; i++) this.spawn({ k: 'mote', x: T.x + rnd(-16, 16), y: T.y + rnd(-16, 16), vy: -0.8, s: 2, c: '#fff4c0', life: 20 }); yield* wait(8); },
  *aegisOn(U, T, u) { Sound.sfx('charge'); for (let i = 0; i < 3; i++) this.spawn({ k: 'hex', x: U.x + 18, y: U.y, r0: 6 + i * 6, r1: 30 + i * 4, c: i % 2 ? '#ffffff' : '#ffd860', life: 22 + i * 4 }); this.spawn({ k: 'halo', x: U.x, y: U.y - 30, r: 14, c: '#ffe070', life: 26 }); this.spawn({ k: 'glow', x: U.x + 18, y: U.y, r: 30, c: '#ffe070', life: 20 }); yield* wait(14); },
  *aegis(U, T, u) { yield* FX.aegisOn.call(this, U, T, u); },
  *aegisBlock(U, F, H) { Sound.sfx('hit'); this.spawn({ k: 'hex', x: U.x + 18, y: U.y, r0: 34, r1: 28, c: '#ffe070', life: 16 }); this.spawn({ k: 'flash', c: '#fff4c0', a: 0.35, life: 6 });
    for (let i = 0; i < 12; i++) { const an = Math.PI + rnd(-80, 80) / 100; this.spawn({ k: 'dot', x: U.x + 30, y: U.y, vx: -Math.cos(an) * 2.4, vy: Math.sin(an) * 2, c: i % 2 ? '#ffe070' : '#ffffff', s: 2, life: 14 }); } Sound.sfx('statUp'); yield* wait(14); },
  *judgment(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'dark', a: 0.5, c: '#0c0a04', life: 50 }); this.spawn({ k: 'sigil', x: T.x, y: T.y - 56, r: 22, c: '#ffe070', life: 40 }); yield* wait(18);
    Sound.sfx('hitSuper'); this.spawn({ k: 'beam', x: T.x, y1: T.y + 26, w: 12, h: 160, c: '#fff0a0', life: 22 }); this.spawn({ k: 'line', x1: T.x - 40, y1: T.y - 8, x2: T.x + 40, y2: T.y - 8, c: '#ffe070', w: 8, grow: 3, life: 22 }); this.spawn({ k: 'line', x1: T.x - 40, y1: T.y - 8, x2: T.x + 40, y2: T.y - 8, c: '#ffffff', w: 3, grow: 3, life: 22 });
    this.spawn({ k: 'flash', c: '#fff8d0', a: 0.55, life: 10 }); this.shake = 18; this.spawn({ k: 'rays', x: T.x, y: T.y - 8, n: 14, a0: 0.1, len: 40, c: '#ffe890', life: 22 }); for (let i = 0; i < 2; i++) this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 8, r1: 60 + i * 16, c: i ? '#ffffff' : '#ffd860', life: 18 + i * 4 }); yield* wait(16); },
  // ---- 刺客 ----
  *backstab(U, T, u) { Sound.sfx('wind'); this.spawn({ k: 'dark', a: 0.4, life: 24 }); this.hideH = 1; this.spawn({ k: 'slit', x: T.x + 30, y: T.y, ang: 0, w: 3, h: 20, c: '#6a3aa0', life: 14 }); yield* wait(10);
    Sound.sfx('slash'); ctLine(this, T.x + 32, T.y - 16, T.x - 20, T.y + 12, '#b050ff', 4, 12, 2); this.spawn({ k: 'star', x: T.x - 20, y: T.y + 12, c: '#ff5060', life: 12 }); ctHit(this, T, '#d080ff', 8); yield* wait(8); this.hideH = 0; },
  *assassinate(U, T, u) { this.spawn({ k: 'dark', a: 0.85, c: '#050208', life: 40 }); Sound.sfx('tick'); yield* wait(14); Sound.sfx('slash'); this.spawn({ k: 'line', x1: T.x - 40, y1: T.y + 4, x2: T.x + 40, y2: T.y - 4, c: '#ff2030', w: 1, grow: 2, life: 26 }); yield* wait(16);
    Sound.sfx('crit'); this.spawn({ k: 'flash', c: '#ff2030', a: 0.4, life: 8 }); this.spawn({ k: 'txt', s: '†', x: T.x - 3, y: T.y - 40, c: '#ffd0d8', sh: '#400010', vy: -0.5, fade: 1, life: 24 }); this.sparks(T.x, T.y, 18, ['#ff2030', '#ffffff', '#400010'], 3, 18, 0.08); this.shake = 12; yield* wait(12); },
  // ---- 影舞者 ----
  *afterimageOn(U, T, u) { Sound.sfx('wind'); for (let i = 0; i < 3; i++) { const ox = [-18, 18, 0][i], oy = [4, 4, -8][i]; this.spawn({ k: 'ring', x: U.x + ox, y: U.y + oy, r0: 14, r1: 18, c: i % 2 ? '#c8a0ff' : '#8a50ff', w: 2, fl: 1.6, life: 26, vx: ox / 20 }); this.spawn({ k: 'glow', x: U.x + ox, y: U.y + oy, r: 16, c: '#8a50ff', life: 20, vx: ox / 20 }); yield* wait(4); }
    for (let i = 0; i < 10; i++) this.spawn({ k: 'streak', x: U.x - 30 + rnd(0, 60), y: U.y + rnd(-20, 24), vx: rnd(-20, 20) / 10, len: 8, c: '#c8a0ff', life: 14 }); yield* wait(10); },
  *afterimage(U, T, u) { yield* FX.afterimageOn.call(this, U, T, u); },
  *cloneHit(U, F, u) { Sound.sfx('hit'); for (let i = 0; i < 12; i++) this.spawn({ k: 'dot', x: U.x + 16 + rnd(-8, 8), y: U.y + rnd(-18, 14), vx: rnd(-14, 14) / 10, vy: -rnd(4, 14) / 10, c: i % 2 ? '#8a50ff' : '#20183a', s: 3, life: 18 }); this.spawn({ k: 'ring', x: U.x + 16, y: U.y, r0: 18, r1: 6, c: '#c8a0ff', w: 2, fl: 1.6, life: 12 }); yield* wait(12); },
  *afterCounter(U, T, u) { Sound.sfx('wind'); this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 16, r1: 22, c: '#8a50ff', w: 2, fl: 1.6, life: 12 }); yield* this.lunge(u, 18, 2); Sound.sfx('slash'); ctLine(this, T.x - 20, T.y + 16, T.x + 20, T.y - 16, '#b080ff', 4, 12, 2); yield* wait(6); },
  *moonDance(U, T, u) { Sound.sfx('wind'); this.spawn({ k: 'moon', x: T.x + 30, y: T.y - 60, r: 12, life: 60, al: 0.8 }); yield* this.lunge(u, 12, 2); yield* FX.moonDanceHit.call(this, U, T, u, 0, 3); },
  *moonDanceHit(U, T, u, i, hits) { Sound.sfx('slash'); const an = [0.2, 2.8, -1.4, 1.2, -2.2][i % 5]; this.spawn({ k: 'cres', x: T.x + Math.cos(an) * 6, y: T.y + Math.sin(an) * 6, r: 22, ang: an, c: '#ffffff', c2: '#a8b8ff', w: 6, life: 12 }); ctHit(this, T, '#d8e0ff', 5); yield* wait(5); },
  *oboro(U, T, u) { this.spawn({ k: 'dark', a: 0.6, c: '#060818', life: 50 }); Sound.sfx('charge'); this.spawn({ k: 'moon', x: T.x, y: T.y - 10, r: 30, life: 50, al: 0.9 }); yield* wait(16);
    Sound.sfx('wind'); yield* this.lunge(u, 24, 2); Sound.sfx('crit'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 40, ang: -0.6, c: '#ffffff', c2: '#9aa8ff', w: 10, life: 20 }); this.spawn({ k: 'flash', c: '#e8ecff', a: 0.4, life: 8 }); this.shake = 12;
    for (let i = 0; i < 16; i++) this.spawn({ k: 'petal', x: T.x, y: T.y, vx: rnd(-26, 26) / 10, vy: rnd(-20, 10) / 10, rot: i, s: 4, c: i % 2 ? '#e8ecff' : '#9aa8ff', life: 24 }); yield* wait(14); },
  // ---- 異界勇者 ----
  *braveOn(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'rays', x: U.x, y: U.y - 8, n: 16, a0: 0, len: 36, c: '#ffe070', life: 26 }); this.spawn({ k: 'glow', x: U.x, y: U.y - 8, r: 40, c: '#ffd040', life: 26 });
    ctLine(this, U.x, U.y + 10, U.x, U.y - 60, '#ffe070', 4, 24, 6); this.spawn({ k: 'line', x1: U.x - 8, y1: U.y - 46, x2: U.x + 8, y2: U.y - 46, c: '#ffffff', w: 2, grow: 4, life: 24 });
    for (let i = 0; i < 16; i++) this.spawn({ k: 'star', x: U.x + rnd(-30, 30), y: U.y + rnd(-50, 20), c: i % 2 ? '#fff4c0' : '#ffd040', life: rnd(12, 22) }); yield* wait(18); },
  *braveOath(U, T, u) { yield* FX.braveOn.call(this, U, T, u); },
  *timeFreeze(U, T, u) { Sound.sfx('tick'); this.spawn({ k: 'clock', x: T.x, y: T.y, r: 30, c: '#c8ecff', life: 30 }); yield* wait(20); },
  // ---- 魔劍士 ----
  *manaSlash(U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('slash'); arcCut(this, T, { r: 28, a0: -2.4, a1: 0.6, rot: 0.3, w: 5, c: '#4a80ff', c2: '#e0f0ff', grow: 4, life: 14 }); this.spawn({ k: 'rune', x: T.x, y: T.y, r: 18, sq: 1, c: '#4a80ff', c2: '#e0f0ff', n: 6, poly: 4, life: 16 }); ctHit(this, T, '#8ab8ff', 8); yield* wait(10); },
  *enchantOn(U, T, u, el) { Sound.sfx('charge'); const cols = ['#f0783a', '#4f8ff0', '#5cbf55', '#e6bb2a'];
    for (let i = 0; i < 16; i++) { const an = i * Math.PI / 8, c = cols[i % 4]; this.spawn({ k: 'mote', x: U.x + Math.cos(an) * 40, y: U.y + Math.sin(an) * 26, to: { x: U.x + 16, y: U.y - 14 }, s: 3, c, life: 20 }); } yield* wait(18);
    const c = (el && TYPE_COL[el]) || '#ffffff'; this.spawn({ k: 'glow', x: U.x + 16, y: U.y - 14, r: 22, c, life: 18 }); this.spawn({ k: 'line', x1: U.x + 6, y1: U.y + 2, x2: U.x + 28, y2: U.y - 26, c, w: 4, grow: 4, life: 20 }); this.spawn({ k: 'star', x: U.x + 28, y: U.y - 26, c: '#ffffff', life: 14 }); yield* wait(10); },
  *enchant(U, T, u) { yield* FX.enchantOn.call(this, U, T, u); },
  *starEclipse(U, T, u) { this.spawn({ k: 'dark', a: 0.75, c: '#0a0412', life: 60 }); Sound.sfx('charge'); this.spawn({ k: 'moon', x: T.x, y: T.y - 16, r: 28, c: '#fff0f8', dark: 1, life: 60 });
    for (let i = 0; i < 20; i++) this.spawn({ k: 'star', x: rnd(8, W - 8), y: rnd(10, BH - 40), c: i % 2 ? '#ffc0e0' : '#ffffff', life: rnd(20, 50) }); yield* wait(22);
    yield* this.lunge(u, 22, 2); Sound.sfx('crit'); this.spawn({ k: 'xcut', x: T.x, y: T.y, r: 40, c: '#ff70c0', life: 24 }); this.spawn({ k: 'flash', c: '#ffd0f0', a: 0.5, life: 10 }); this.shake = 18;
    for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y - 16, r0: 28, r1: 60 + i * 14, c: i % 2 ? '#ffffff' : '#ff70c0', w: 2, life: 16 + i * 4 }); this.sparks(T.x, T.y, 24, ['#ff70c0', '#ffffff', '#a040ff'], 3.4, 22, 0.08); yield* wait(14); },
});
Object.assign(MOVES.flashStep, { hitFx: 'flashStepHit' }); Object.assign(MOVES.frenzy, { hitFx: 'frenzyHit' }); Object.assign(MOVES.raijin, { hitFx: 'raijinHit' }); Object.assign(MOVES.moonDance, { hitFx: 'moonDanceHit' });
// cast (wind-up) · impact · palette · sound for each new skill
Object.assign(SKILL_STYLE, {
  meikyo: ['still', null, 'water'], flashStep: ['dash', 'none', 'gold', 'slash'], mushin: ['still', 'none', 'steel', 'crit'],
  warCry: ['aura', null, 'blood'], bloodBlade: ['draw', 'none', 'blood', 'slash'], lastStand: ['aura', 'none', 'blood', 'hitSuper'], frenzy: ['dash', 'none', 'blood', 'hit'], asura: ['aura', 'none', 'blood', 'crit'],
  kindle: ['rune', 'burn', 'fire', 'fire'], flameWall: ['aura', null, 'fire'], combust: ['rune', 'none', 'ember', 'fire'], phoenix: ['aura', 'none', 'fire', 'fire'],
  quickBolt: ['rune', 'spark', 'volt', 'thunder'], staticField: ['rune', null, 'volt'], overload: ['rune', 'none', 'volt', 'thunder'], raijin: ['sky', 'none', 'volt', 'thunder'],
  holyBlade: ['halo', 'none', 'holy', 'slash'], aegis: ['hex', null, 'holy'], judgment: ['sky', 'none', 'holy', 'hitSuper'],
  backstab: ['still', 'none', 'shadow', 'slash'], assassinate: ['still', 'none', 'shadow', 'crit'],
  afterimage: ['focus', null, 'moon'], moonDance: ['dash', 'none', 'moon', 'slash'], oboro: ['still', 'none', 'moon', 'crit'],
  braveOath: ['halo', null, 'dawn'], manaSlash: ['rune', 'none', 'arcane', 'slash'], enchant: ['rune', null, 'arcane'], starEclipse: ['void', 'none', 'arcane', 'hitSuper'],
  timeStop: ['still', null, 'guard'],
});
// 炎之壁 raises its shield in the post-hook (with its own message instead of 「展開了魔法護盾」)
Object.assign(MOVES.flameWall, { stat: null, wall: 3 }); delete MOVES.flameWall.shield;

/* ---------- v23 icons (Codex task J, native 14x14): timed buffs get their own icons next to the stat icons ----------
   hero: 血怒・煙幕・集氣・明鏡止水・炎之壁／靜電場・影分身・元素附魔・神盾・見切 (second row above the status / stat row)
   monster: 獵人印記・時空凍結 (left of its stat icons) */
const timedIconsH = b => [b.rageT > 0 && 'rage', b.smokeT > 0 && 'smoke', b.critNext && 'focus', b.critT > 0 && 'crit', b.auraT > 0 && (b.aura && b.aura.st === 'brn' ? 'wall' : 'static'), b.clones > 0 && 'after', b.enchT > 0 && 'ench', b.aegisOn && 'aegis', b._parryTmp && 'parry'].filter(Boolean);
const timedIconsF = b => [b.markT > 0 && 'mark', (b.frozenT > 0 || b._frozenNow) && 'frozen'].filter(Boolean);
