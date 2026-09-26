/* ===================== BATTLE ===================== */
let HERO_POWER = 1.45, BOSS_HP = 2.1, ELITE_HP = 1.1;
const BTN_MENU = { x: 4, y: TB_Y + 1, w: W - 8, h: TB_H - 2, cols: 2, colW: 82, rowH: 20, ox: 3, oy: 17, buttons: true, style: 'cmd' };
const BH = TB_Y, FOE_X = W / 2 - 32, HERO_X = W / 2 - 24, HERO_Y = 112, HBAR_Y = 170;
function critRate(u, mv) { const base = u.hero ? (u.stats.crit || 5) / 100 : 1 / 16; return mv.crit ? base * 2 : base; }
function hitChance(u, t, mv) { let a = mv.acc; if (!a) return 1; if (u.hero) a += u.stats.hit || 0; if (t.hero) a -= t.stats.eva || 0; return clamp(a, 5, 100) / 100; }
const stageMul = s => s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
const STATUS_NAME = { psn: '中毒', par: '麻痺', slp: '睡眠', brn: '灼傷' };
const IMMUNE = { psn: '毒', brn: '火', par: '雷' };
const battleImgCache = {};
// battle sprites: rendered at a low native size, then scaled 3x (same chunky pixel look as the hero)
const FOE_NATIVE = { golem: 28 }, FOE_SCALE = 3, FOE_FOOT = 106;
function battleSprite(key) {
  if (battleImgCache[key]) return battleImgCache[key];
  const n = FOE_NATIVE[key] || 24, S = FOE_SCALE, sm = buildShaded(ART[key], n, n / 64);
  const c = mkCanvas(n * S, n * S); c.getContext('2d').drawImage(sm, 0, 0, n * S, n * S);
  const d = sm.getContext('2d').getImageData(0, 0, n, n).data; let x0 = n, x1 = -1, y0 = n, y1 = -1;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  c.bb = { cx: Math.round((x0 + x1 + 1) * S / 2), top: y0 * S, bot: (y1 + 1) * S, w: (x1 - x0 + 1) * S, h: (y1 - y0 + 1) * S };
  return battleImgCache[key] = c;
}
function makeFoe(sp, lv, kind) {
  const d = SPECIES[sp]; const iv = kind === 'wild' ? rnd(4, 15) : kind === 'boss' ? 22 : 18;
  const s = {}; STAT_KEYS.forEach((k, i) => s[k] = statCalc(d.base[i], lv, iv, k === 'hp'));
  const hpMul = kind === 'boss' ? BOSS_HP : kind === 'elite' ? ELITE_HP : 1; s.hp = Math.floor(s.hp * hpMul);
  const known = d.learn.filter(([l]) => l <= lv).map(([, m]) => m); const moves = [...new Set(known)].slice(-4).map(id => ({ id }));
  return { sp, n: d.n, t: d.t, lv, stats: s, hp: s.hp, maxhp: s.hp, status: null, moves, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, kind, boss: kind === 'boss', elite: kind === 'elite', sleepT: 0 };
}
function buildBattleBG(kind) {
  const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(kind === 'ruins' ? 9 : 5);
  const poly = (col, pts) => pxPoly(x, pts, col);
  if (kind === 'ruins') { // torch-lit stone hall
    x.fillStyle = '#2a2434'; x.fillRect(0, 0, W, BH);
    for (let y = 0, row = 0; y < 96; y += 8, row++) for (let i = (row % 2) * 8 - 8; i < W; i += 16) { x.fillStyle = r() < 0.5 ? '#3a3246' : '#40384c'; x.fillRect(i + 1, y + 1, 14, 6); x.fillStyle = '#4a4258'; x.fillRect(i + 1, y + 1, 14, 1); }
    x.fillStyle = '#120e18'; x.fillRect(64, 36, 48, 60); pxEllipse(x, 88, 38, 24, 16, '#120e18'); // archway
    x.fillStyle = '#5a5068'; for (let a = 0; a < Math.PI; a += 0.12) x.fillRect(Math.round(88 + Math.cos(Math.PI + a) * 26), Math.round(38 - Math.sin(a) * 18), 3, 3);
    for (const X of [10, 142]) { x.fillStyle = '#4c4458'; x.fillRect(X, 6, 24, 92); x.fillStyle = '#5e5670'; x.fillRect(X + 2, 6, 5, 92); x.fillStyle = '#3a3246'; x.fillRect(X + 19, 6, 5, 92); x.fillStyle = '#6a6280'; x.fillRect(X - 2, 4, 28, 5); x.fillRect(X - 2, 94, 28, 5);
      x.fillStyle = '#7a2a30'; x.fillRect(X + 6, 16, 12, 30); x.fillStyle = '#9a3a40'; x.fillRect(X + 6, 16, 12, 2); poly('#7a2a30', [[X + 6, 46], [X + 12, 52], [X + 18, 46]]); x.fillStyle = '#d8b050'; x.fillRect(X + 10, 24, 4, 8); x.fillRect(X + 8, 26, 8, 2); }
    for (const X of [44, 132]) { x.fillStyle = '#2e2e36'; x.fillRect(X - 1, 50, 3, 8); x.fillRect(X - 3, 48, 7, 2); const g = x.createRadialGradient(X, 42, 0, X, 42, 20); g.addColorStop(0, 'rgba(255,170,70,0.55)'); g.addColorStop(1, 'rgba(255,170,70,0)'); x.fillStyle = g; x.fillRect(X - 20, 22, 40, 40); x.fillStyle = '#ff9030'; x.fillRect(X - 2, 42, 5, 6); x.fillStyle = '#ffe070'; x.fillRect(X - 1, 43, 3, 4); x.fillStyle = '#fff4c0'; x.fillRect(X, 44, 1, 2); }
    x.fillStyle = '#4a4254'; x.fillRect(0, 96, W, BH - 96); // flagstone floor in perspective
    for (let k = 0, y = 96; y < BH; k++, y += 6 + k * 2) { x.fillStyle = '#3a3444'; x.fillRect(0, y, W, 1); x.fillStyle = '#5a5266'; x.fillRect(0, y + 1, W, 1); }
    x.fillStyle = '#3a3444'; for (let i = -6; i <= 6; i++) pxLine(x, 88 + i * 10, 96, 88 + i * 34, BH, '#3a3444');
    x.fillStyle = '#6aa048'; for (const [a1, b1] of [[18, 150], [150, 128], [70, 184]]) { x.fillRect(a1, b1, 6, 2); x.fillRect(a1 + 2, b1 - 1, 2, 1); }
  } else { // meadow with a distant castle
    ['#86bde8', '#94c6ec', '#a3cfef', '#b3d8f1', '#c3e0f3', '#d3e8f5'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 11, W, 11); });
    x.fillStyle = '#f2f8fc'; for (const [a1, b1, w] of [[10, 12, 30], [98, 22, 40], [150, 8, 22]]) { x.fillRect(a1, b1, w, 4); x.fillRect(a1 + 4, b1 - 2, w - 8, 2); }
    poly('#a9bdd2', [[0, 64], [0, 44], [22, 36], [40, 46], [62, 32], [84, 48], [110, 40], [130, 50], [176, 38], [176, 64]]);
    poly('#8fa9a8', [[104, 66], [118, 56], [148, 52], [176, 56], [176, 66]]);
    // castle on the hill
    const CC = '#6f7f9a', CD = '#5a6884', CR = '#4a5270';
    x.fillStyle = CC; x.fillRect(128, 44, 30, 18); x.fillRect(122, 36, 8, 26); x.fillRect(156, 38, 8, 24); x.fillRect(138, 30, 10, 16);
    for (let i = 128; i < 158; i += 4) x.fillRect(i, 42, 2, 2);
    poly(CR, [[121, 36], [126, 27], [131, 36]]); poly(CR, [[155, 38], [160, 29], [165, 38]]); poly(CR, [[137, 30], [143, 19], [149, 30]]);
    x.fillStyle = '#c84a40'; x.fillRect(143, 15, 1, 5); x.fillRect(144, 15, 4, 2);
    x.fillStyle = CD; x.fillRect(128, 54, 30, 8); x.fillStyle = '#343c56'; x.fillRect(140, 52, 6, 10); x.fillRect(125, 42, 2, 3); x.fillRect(159, 44, 2, 3); x.fillRect(142, 35, 2, 3);
    // forest line
    for (let i = -4; i < W; i += 7) { const h = 8 + Math.floor(r() * 7); pxEllipse(x, i + 4, 66 - h / 2, 5, h / 2 + 2, r() < 0.5 ? '#3f7d4d' : '#467f52'); }
    x.fillStyle = '#3a7448'; x.fillRect(0, 64, W, 6);
    ['#8ccc74', '#86c66e', '#80c06a', '#7aba66', '#74b462', '#6eae5e', '#68a85a', '#62a256', '#5e9c52', '#5a9850', '#56944e', '#52904c'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 70 + i * 11, W, 11); });
    // dirt road narrowing to the horizon
    for (let y = 70; y < BH; y++) { const t = (y - 70) / (BH - 70), hw = 3 + t * 30, cx = 88 + Math.sin(t * 3) * 8 * (1 - t); x.fillStyle = y % 3 ? '#c8a870' : '#bf9e66'; x.fillRect(Math.round(cx - hw), y, Math.round(hw * 2), 1); x.fillStyle = '#a88a58'; x.fillRect(Math.round(cx - hw), y, 1, 1); x.fillRect(Math.round(cx + hw), y, 1, 1); }
    x.fillStyle = '#a8e090'; for (let y = 74; y < BH; y += 6) for (let i = (y * 13) % 29; i < W; i += 29) if (Math.abs(i - 88) > 12 + (y - 70) * 0.3) x.fillRect(i, y, 5, 1);
    // tumbled stone wall on the left
    for (const [X, Y, w] of [[4, 88, 30], [10, 84, 18]]) { x.fillStyle = '#6c665b'; x.fillRect(X, Y, w, 6); for (let i = X; i < X + w; i += 5) { x.fillStyle = '#9a9384'; x.fillRect(i, Y, 4, 2); x.fillStyle = '#b4ad9c'; x.fillRect(i, Y, 4, 1); } }
  }
  const g = x.createLinearGradient(0, 120, 0, BH); g.addColorStop(0, 'rgba(8,10,20,0)'); g.addColorStop(1, 'rgba(8,10,20,0.55)'); x.fillStyle = g; x.fillRect(0, 120, W, BH - 120);
  const g2 = x.createLinearGradient(0, 0, 0, 34); g2.addColorStop(0, 'rgba(8,10,20,0.35)'); g2.addColorStop(1, 'rgba(8,10,20,0)'); x.fillStyle = g2; x.fillRect(0, 0, W, 34);
  return c;
}
function buildShadow(rx, ry) { const c = mkCanvas(rx * 2 + 2, ry * 2 + 2), x = c.getContext('2d'); pxEllipse(x, rx + 1, ry + 1, rx, ry, '#000000'); return c; }

class Battle {
  constructor(cfg) {
    this.cfg = cfg; this.kind = cfg.kind; this.result = null;
    const st = Game.st; const s = heroStats();
    this.F = makeFoe(cfg.sp, cfg.lv, cfg.kind);
    const H = this.H = { hero: true, n: st.name, lv: st.lv, t: null, stats: s, maxhp: s.hp, moves: st.moves, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, sleepT: st.sleepT ?? rnd(1, 3) };
    Object.defineProperty(H, 'hp', { get: () => st.hp, set: v => st.hp = v }); Object.defineProperty(H, 'status', { get: () => st.status, set: v => st.status = v });
    this.bg = buildBattleBG(cfg.bg);
    this.imgF = battleSprite(cfg.sp); this.foeTX = FOE_X; this.shadowF = buildShadow(Math.round(this.imgF.bb.w * 0.38), 4); this.imgH = heroBattleImg(0, st.equip.weapon); this.imgH2 = heroBattleImg(1, st.equip.weapon);
    this.disp = { F: this.F.hp, H: st.hp, exp: st.exp };
    this.foeX = W + 40; this.heroX = -80; this.boxF = -30; this.boxH = BH + 4; this.cover = 1;
    this.offF = { x: 0, y: 0 }; this.offH = { x: 0, y: 0 }; this.sinkF = 0; this.sinkH = 0; this.blinkF = 0; this.blinkH = 0; this.alphaF = 1;
    this.fx = []; this.shake = 0; this.t = 0; this.idle = false; this.cmdIdx = 0; this.moveIdx = 0; this.runTries = 0; this.turn = 0; this.phase2 = false; this.fistCD = 2;
    this.tint = null; this.squishF = 0;
    this.script = this.main();
  }
  enter() { UI.clear(); }
  update() {
    this.t++; if (this.shake > 0) this.shake--; if (this.blinkF > 0) this.blinkF--; if (this.blinkH > 0) this.blinkH--;
    for (const p of this.fx) { p.t++; if (p.upd) p.upd(p); else { p.x += p.vx || 0; p.y += p.vy || 0; p.vy = (p.vy || 0) + (p.g || 0); } }
    this.fx = this.fx.filter(p => p.t < p.life);
    if (this.script) { const r = this.script.next(); if (r.done) this.script = null; }
  }
  center(b) { return b.hero ? { x: this.heroX + 24, y: HERO_Y + 32 } : { x: this.foeX + 32, y: FOE_FOOT - Math.round(this.imgF.bb.h * 0.5) }; }
  /* ---------------- drawing ---------------- */
  draw(x) {
    const sx = this.shake > 0 ? rnd(-3, 3) : 0, sy = this.shake > 0 ? rnd(-2, 2) : 0;
    x.save(); x.translate(sx, sy);
    x.drawImage(this.bg, 0, 0);
    const bobH = this.idle && Math.floor(this.t / 18) % 2 ? 1 : 0, bobF = this.idle && Math.floor((this.t + 9) / 22) % 2 ? 1 : 0;
    // foe (shadow + sprite)
    if (this.alphaF > 0) { x.globalAlpha = 0.22 * this.alphaF; x.drawImage(this.shadowF, Math.round(this.foeX + 32 + this.offF.x - this.shadowF.width / 2), FOE_FOOT - 5); x.globalAlpha = 1; }
    if (this.alphaF > 0 && !(this.blinkF > 0 && Math.floor(this.blinkF / 3) % 2)) {
      x.save(); x.beginPath(); x.rect(0, 0, W, FOE_FOOT + 3); x.clip(); x.globalAlpha = this.alphaF;
      const sq = this.squishF, im = this.imgF, fw = im.width, fh = im.height;
      const fx0 = Math.round(this.foeX + 32 - im.bb.cx + this.offF.x), fy0 = Math.round(FOE_FOOT - im.bb.bot + this.offF.y + this.sinkF - bobF);
      if (sq) x.drawImage(im, fx0 - sq, fy0 + sq * 2, fw + sq * 2, fh - sq * 2); else x.drawImage(im, fx0, fy0);
      if (this.tintF && this.tintF.a > 0) { x.globalAlpha = this.tintF.a * this.alphaF; x.drawImage(tinted(this.imgF, this.tintF.c), fx0, fy0); }
      x.restore();
    }
    // hero (foreground, lower body hidden behind the status bar)
    if (!(this.blinkH > 0 && Math.floor(this.blinkH / 3) % 2)) {
      x.save(); x.beginPath(); x.rect(0, 0, W, HBAR_Y + 20); x.clip();
      const hi = (this.offH.x || this.offH.y) ? this.imgH2 : this.imgH; const hx = Math.round(this.heroX + this.offH.x), hy = Math.round(HERO_Y + this.offH.y + this.sinkH + bobH);
      x.drawImage(hi, hx, hy);
      if (this.tintH) { x.globalAlpha = this.tintH.a; x.drawImage(tinted(hi, this.tintH.c), hx, hy); }
      x.restore();
    }
    for (const p of this.fx) drawParticle(x, p);
    this.drawBoxF(x); this.drawBoxH(x);
    x.restore();
    x.fillStyle = '#0b0d18'; x.fillRect(0, BH, W, H - BH); x.fillStyle = PANEL.edge; x.fillRect(0, BH, W, 1);
    if (this.cover > 0) { x.fillStyle = '#000'; const h = Math.round(this.cover * (H / 2 + 1)); x.fillRect(0, 0, W, h); x.fillRect(0, H - h, W, h); }
  }
  drawBoxF(x) {
    const Y = Math.round(this.boxF), F = this.F; if (Y < -27) return;
    const X = 8, w = W - 16; drawPanel(x, X, Y, w, 26, F.boss ? UIC.bad : F.elite ? UIC.warm : UIC.accent);
    let cx = Font.draw(x, F.n, X + 6, Y + 1, UIC.text, UIC.textSh);
    cx = Font.draw(x, 'Lv' + F.lv, cx + 4, Y + 1, UIC.muted, UIC.textSh);
    if (F.status) statusBadge(x, F.status, cx + 4, Y + 3);
    if (F.boss || F.elite) Font.drawR(x, F.boss ? '頭目' : '精英', X + w - 6, Y + 1, F.boss ? UIC.bad : UIC.warm, UIC.textSh);
    drawHPBar(x, X + 6, Y + 18, w - 12, this.disp.F / F.maxhp, 3);
  }
  drawBoxH(x) {
    const Y = Math.round(this.boxH), st = Game.st; if (Y >= BH) return;
    const X = 8, w = W - 16, r = this.disp.H / this.H.maxhp; drawPanel(x, X, Y, w, 24, UIC.accent, 'rgba(11,13,24,0.92)');
    let cx = Font.draw(x, st.name, X + 6, Y + 1, UIC.text, UIC.textSh);
    cx = Font.draw(x, 'Lv' + st.lv, cx + 4, Y + 1, UIC.muted, UIC.textSh);
    if (st.status) statusBadge(x, st.status, cx + 4, Y + 3);
    const hs = Math.ceil(this.disp.H) + '/' + this.H.maxhp; Font.drawR(x, hs, X + w - 6, Y + 1, r <= 0.2 ? UIC.bad : UIC.text, UIC.textSh); Font.drawR(x, 'HP', X + w - 9 - Font.width(hs), Y + 1, UIC.muted, UIC.textSh);
    drawHPBar(x, X + 6, Y + 16, w - 12, r, 3);
    const lo = expForLevel(st.lv), hi = expForLevel(st.lv + 1); drawExpBar(x, X + 6, Y + 21, w - 12, (this.disp.exp - lo) / (hi - lo), 1);
  }
  /* ---------------- helpers ---------------- */
  *msg(text, o = {}) { const t = new TextBox(text, { style: 'battle', auto: o.wait ? false : (o.hold || 38) }); UI.push(t); while (!t.done) { t.update(); yield; } UI.remove(t); }
  *animHP(b) {
    const key = b.hero ? 'H' : 'F'; const target = b.hp; const spd = Math.max(0.35, b.maxhp / 55);
    while (Math.abs(this.disp[key] - target) > 0.01) { const d = target - this.disp[key]; this.disp[key] += Math.sign(d) * Math.min(Math.abs(d), spd); yield; }
    this.disp[key] = target;
  }
  *impact(b, power) {
    const key = b.hero ? 'tintH' : 'tintF'; const C = this.center(b);
    this[key] = { c: '#ffffff', a: 0.95 }; this.shake = [3, 6, 14][power];
    if (power > 0) { this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 4, r1: power > 1 ? 34 : 22, c: '#ffffff', w: 2, life: 10 }); this.sparks(C.x, C.y, power > 1 ? 14 : 7, ['#ffffff', '#fff0a0'], power > 1 ? 3 : 2, 14); }
    if (power > 1) this.spawn({ k: 'flash', c: '#ffffff', a: 0.35, life: 6 });
    yield* wait(power > 1 ? 6 : 4); this[key] = null;
    if (b.hero) this.blinkH = 24; else this.blinkF = 24;
  }
  spawn(p) { p.t = 0; p.life = p.life || 30; this.fx.push(p); return p; }
  *lunge(b, dist = 10, frames = 5) { const o = b.hero ? this.offH : this.offF; const A = this.center(b), B = this.center(b.hero ? this.F : this.H), L = Math.hypot(B.x - A.x, B.y - A.y) || 1; const dx = (B.x - A.x) / L * dist, dy = (B.y - A.y) / L * dist; yield* tween(frames, t => { o.x = dx * t; o.y = dy * t; }); yield* tween(frames, t => { o.x = dx * (1 - t); o.y = dy * (1 - t); }); o.x = 0; o.y = 0; }
  *shakeB(b, frames = 12, amp = 3) { const o = b.hero ? this.offH : this.offF; for (let i = 0; i < frames; i++) { o.x = (i % 4 < 2 ? amp : -amp); yield; } o.x = 0; }
  sparks(X, Y, n, cols, spd = 2, life = 18, g = 0) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = spd * (0.5 + Math.random()); this.spawn({ k: 'dot', x: X, y: Y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g, c: pick(cols), s: rnd(1, 2), life: life + rnd(-4, 4) }); } }
  star(X, Y, c = '#ffffff', life = 10) { this.spawn({ k: 'star', x: X, y: Y, c, life }); }
  projectile(U, T, n, mk, spacing = 3, frames = 18) { for (let i = 0; i < n; i++) { const p = mk(i); p.x = U.x; p.y = U.y; p.tx = T.x + rnd(-6, 6); p.ty = T.y + rnd(-6, 6); p.delay = i * spacing; p.fr = frames; p.upd = q => { const t = clamp((q.t - q.delay) / q.fr, 0, 1); q.x = lerp(U.x, q.tx, t) + (q.wob ? Math.sin(q.t / 3 + i) * q.wob : 0); q.y = lerp(U.y, q.ty, t) - (q.arc ? Math.sin(t * Math.PI) * q.arc : 0); q.hidden = q.t < q.delay; }; p.life = p.delay + frames + (p.linger || 0); this.spawn(p); } }
  *playFx(name, u, t) { const U = this.center(u), T = this.center(t); const f = FX[name] || FX.hit; yield* f.call(this, U, T, u, t); }
  /* ---------------- main flow ---------------- */
  *main() {
    Game.trans = null; yield* this.intro();
    while (true) {
      this.turn++;
      const act = yield* this.chooseAction();
      const fAct = this.foeChoose();
      const order = this.order(act, fAct);
      this.H.defending = act.type === 'defend'; this.H.flinched = false; this.F.flinched = false;
      for (const [who, a] of order) {
        const u = who === 'H' ? this.H : this.F, tg = who === 'H' ? this.F : this.H;
        if (u.hp <= 0 || tg.hp <= 0) continue;
        if (a.type === 'move') yield* this.useMove(u, tg, a.id);
        else if (a.type === 'defend') { yield* this.msg(u.n + '擺出了防禦的架勢！'); yield* FX.guard.call(this, this.center(u)); }
        else if (a.type === 'item') { const r = yield* this.useItemAct(a.id); if (r === 'escaped') return yield* this.end('run'); }
        else if (a.type === 'run') { if (yield* this.tryRun()) return yield* this.end('run'); }
        if (this.F.hp <= 0) { yield* this.foeFaint(); yield* this.victory(); return yield* this.end('win'); }
        if (this.H.hp <= 0) { yield* this.heroFaint(); return yield* this.end('lose'); }
      }
      yield* this.endTurn();
      if (this.F.hp <= 0) { yield* this.foeFaint(); yield* this.victory(); return yield* this.end('win'); }
      if (this.H.hp <= 0) { yield* this.heroFaint(); return yield* this.end('lose'); }
      this.H.defending = false;
    }
  }
  *intro() {
    Sound.sfx('encounter');
    yield* parallel(tween(14, t => this.cover = 1 - t), tween(40, t => { const e = 1 - Math.pow(1 - t, 3); this.foeX = lerp(W + 40, this.foeTX, e); this.heroX = lerp(-80, HERO_X, e); }));
    this.cover = 0; Sound.cry(Object.keys(SPECIES).indexOf(this.cfg.sp) + 1, this.F.boss ? 0.7 : 1, this.F.boss ? 1.6 : 1);
    if (this.F.boss) { this.shake = 30; Sound.sfx('quake'); }
    yield* parallel(tween(12, t => this.boxF = lerp(-30, 4, 1 - Math.pow(1 - t, 2))), wait(4));
    const intro = this.F.boss ? this.F.n + '擋住了去路！' : this.F.elite ? '精英魔物' + this.F.n + '發動了攻擊！' : '野生的' + this.F.n + '跳出來了！';
    yield* this.msg(intro, { hold: 44 });
    yield* tween(12, t => this.boxH = lerp(BH + 4, HBAR_Y, 1 - Math.pow(1 - t, 2)));
  }
  *chooseAction() {
    const st = Game.st;
    while (true) {
      this.idle = true;
      const r = yield* choose(['技能', '道具', '防禦', '逃跑'], { ...BTN_MENU, cancel: false, index: this.cmdIdx, title: '要讓' + st.name + '做什麼？' });
      this.idle = false; this.cmdIdx = r;
      if (r === 0) { const m = yield* this.chooseMove(); if (m) return { type: 'move', id: m }; }
      else if (r === 1) { const it = yield* bagScreen('battle'); if (it) return { type: 'item', id: it }; }
      else if (r === 2) return { type: 'defend' };
      else { if (this.F.boss) { yield* this.msg('不能從這場戰鬥中逃走！'); continue; } return { type: 'run' }; }
    }
  }
  *chooseMove() {
    const st = Game.st;
    if (st.moves.every(m => m.pp <= 0)) { yield* this.msg(st.name + '已經沒有可以使用的技能了！'); return 'struggle'; }
    let cur = Math.min(this.moveIdx, st.moves.length - 1); this.idle = true;
    const info = (x, m) => { const mm = st.moves[m.i], mv = MOVES[mm.id]; typeBadge(x, mv.t, 10, TB_Y + 4, 24); Font.draw(x, (mv.cat === '變' ? '變化' : mv.cat === '物' ? '物理' : '魔法') + (mv.pow ? '·' + mv.pow : ''), 38, TB_Y + 2, UIC.muted, UIC.textSh); Font.drawR(x, 'PP ' + mm.pp + '/' + mv.pp, W - 12, TB_Y + 2, mm.pp === 0 ? UIC.bad : mm.pp <= mv.pp / 4 ? UIC.warm : UIC.text, UIC.textSh); };
    while (true) {
      const r = yield* choose(st.moves.map(m => ({ t: MOVES[m.id].n, strip: TYPE_COL[MOVES[m.id].t], col: m.pp === 0 ? UIC.dis : undefined })), { ...BTN_MENU, index: cur, onMove: i => cur = i, drawExtra: info });
      if (r < 0) { this.idle = false; return null; }
      if (st.moves[r].pp <= 0) { yield* this.msg('這個技能的PP已經用完了！'); continue; }
      this.idle = false; this.moveIdx = r; return st.moves[r].id;
    }
  }
  effSpe(b) { return b.stats.spe * stageMul(b.stages.spe) * (b.status === 'par' ? 0.25 : 1); }
  order(ha, fa) {
    const pr = a => a.type === 'run' ? 7 : a.type === 'item' ? 6 : a.type === 'defend' ? 5 : (MOVES[a.id].prio || 0);
    const ph = pr(ha), pf = pr(fa);
    let heroFirst = ph !== pf ? ph > pf : (this.effSpe(this.H) !== this.effSpe(this.F) ? this.effSpe(this.H) > this.effSpe(this.F) : chance(0.5));
    return heroFirst ? [['H', ha], ['F', fa]] : [['F', fa], ['H', ha]];
  }
  foeChoose() {
    const F = this.F, H = this.H;
    if (F.charging) return { type: 'move', id: F.charging };
    let pool = F.moves.map(m => m.id);
    if (F.boss && this.phase2) { pool = ['rockSlide', 'stomp', 'rockThrow']; if (this.fistCD <= 0) { this.fistCD = 3; return { type: 'move', id: 'golemFist' }; } this.fistCD--; }
    const w = pool.map(id => {
      const mv = MOVES[id]; let v = 10;
      if (mv.st) v = H.status ? 0 : 6;
      if (mv.stat && mv.stat.who === 'self') { const k = Object.keys(mv.stat).find(q => q !== 'who'); v = F.stages[k] >= 2 ? 1 : 5; }
      if (mv.stat && mv.stat.who === 'foe') { const k = Object.keys(mv.stat).find(q => q !== 'who'); v = H.stages[k] <= -2 ? 1 : 5; }
      if (mv.pow && (F.elite || F.boss)) { const m = typeMult(mv.t, H.t); v *= m > 1 ? 2 : m < 1 ? 0.5 : 1; v *= 1 + mv.pow / 60; }
      if (mv.drain && F.hp > F.maxhp * 0.8) v *= 0.6;
      return Math.max(0, v);
    });
    const tot = w.reduce((a, b) => a + b, 0); let r = Math.random() * tot; for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return { type: 'move', id: pool[i] }; }
    return { type: 'move', id: pool[0] };
  }
  calcDamage(u, t, mv) {
    const phys = mv.cat === '物'; const crit = chance(critRate(u, mv));
    const as = phys ? u.stages.atk : u.stages.spa, ds = phys ? t.stages.def : t.stages.spd;
    let A = (phys ? u.stats.atk : u.stats.spa) * stageMul(crit ? Math.max(0, as) : as);
    let D = (phys ? t.stats.def : t.stats.spd) * stageMul(crit ? Math.min(0, ds) : ds);
    if (phys && u.status === 'brn') A *= 0.5;
    const base = Math.floor(Math.floor(Math.floor(2 * u.lv / 5 + 2) * mv.pow * A / D) / 50) + 2;
    const mult = typeMult(mv.t, t.t); let m = mult * (rnd(85, 100) / 100); if (crit) m *= 1.5; if (u.t && u.t === mv.t) m *= 1.5; if (u.hero) m *= HERO_POWER;
    return { dmg: Math.max(1, Math.floor(base * m)), mult, crit };
  }
  *useMove(u, t, id) {
    const mv = MOVES[id];
    // can the user act?
    if (u.status === 'slp') {
      if (u.sleepT <= 0) { u.status = null; yield* this.msg(u.n + '醒過來了！'); }
      else { u.sleepT--; yield* FX.zzz.call(this, this.center(u)); yield* this.msg(u.n + '正在呼呼大睡。'); return; }
    }
    if (u.flinched) { yield* this.msg(u.n + '退縮了，無法行動！'); return; }
    if (u.status === 'par' && chance(0.25)) { yield* FX.spark.call(this, null, this.center(u)); yield* this.msg(u.n + '身體麻痺，無法行動！'); return; }
    if (mv.charge && u.charging !== id) {
      u.charging = id; yield* this.msg(u.n + '使用了' + mv.n + '！'); yield* FX.charge.call(this, this.center(u));
      yield* this.msg(u.n + '正在凝聚大地之力！'); if (!this.warned) { this.warned = true; yield* this.msg('（它的拳頭發出了危險的光芒……）'); } return;
    }
    if (u.charging === id) u.charging = null;
    if (u.hero && id !== 'struggle') { const m = u.moves.find(q => q.id === id); if (m) m.pp = Math.max(0, m.pp - 1); }
    const utb = new TextBox(u.n + '使用了' + mv.n + '！', { style: 'battle', keep: true }); UI.push(utb); while (!utb.done) { utb.update(); yield; } yield* wait(10);
    // accuracy
    const selfTarget = !mv.pow && mv.stat && mv.stat.who === 'self' || mv.heal;
    if (!selfTarget && mv.acc && !chance(hitChance(u, t, mv))) { yield* wait(10); UI.remove(utb); yield* this.msg(mv.pow ? u.n + '的攻擊沒有打中！' : '但是失敗了！'); return; }
    if (mv.pow) {
      const r = this.calcDamage(u, t, mv);
      yield* this.playFx(mv.fx, u, t); UI.remove(utb);
      let dmg = r.dmg; if (t.defending) dmg = Math.max(1, Math.floor(dmg / 2));
      dmg = Math.min(dmg, t.hp); t.hp -= dmg;
      Sound.sfx(r.mult > 1 ? 'hitSuper' : r.mult < 1 ? 'hitWeak' : 'hit'); if (r.crit) Sound.sfx('crit');
      yield* this.impact(t, r.mult > 1 || r.crit ? 2 : r.mult < 1 ? 0 : 1);
      yield* this.animHP(t);
      if (r.crit) yield* this.msg('擊中要害！');
      if (r.mult > 1) yield* this.msg('效果絕佳！'); else if (r.mult < 1) yield* this.msg('效果不太好……');
      if (t.defending) yield* this.msg(t.n + '的防禦擋下了一半的傷害！');
      if (mv.drain && dmg > 0 && u.hp < u.maxhp) { u.hp = Math.min(u.maxhp, u.hp + Math.max(1, Math.floor(dmg * mv.drain))); yield* FX.drainBack.call(this, this.center(t), this.center(u)); yield* this.animHP(u); yield* this.msg('從' + t.n + '身上吸取了養分！'); }
      if (mv.recoil) { u.hp = Math.max(0, u.hp - Math.max(1, Math.floor(dmg * mv.recoil))); yield* this.animHP(u); yield* this.msg(u.n + '受到了反作用力的傷害！'); }
      if (t.hp > 0 && mv.eff && chance(mv.eff.p / 100)) {
        if (mv.eff.st) yield* this.inflict(t, mv.eff.st, true);
        if (mv.eff.stat) yield* this.statChange(t, mv.eff.stat);
        if (mv.eff.flinch) t.flinched = true;
      }
      if (!t.hero && t.boss && !this.phase2 && t.hp > 0 && t.hp < t.maxhp * 0.5) yield* this.bossPhase2();
      return;
    }
    // status moves
    UI.remove(utb);
    if (mv.heal) {
      if (u.hp >= u.maxhp) { yield* this.msg('但是' + u.n + '的HP已經全滿了！'); return; }
      yield* FX.heal.call(this, this.center(u)); u.hp = Math.min(u.maxhp, u.hp + Math.floor(u.maxhp * mv.heal)); yield* this.animHP(u); yield* this.msg(u.n + '的HP恢復了！'); return;
    }
    if (mv.stat) {
      const who = mv.stat.who === 'self' ? u : t; const ch = { ...mv.stat }; delete ch.who;
      if (who === t) yield* this.playFx(mv.fx, u, t); else yield* FX.buff.call(this, this.center(u));
      yield* this.statChange(who, ch, true); return;
    }
    if (mv.st) { yield* this.playFx(mv.fx, u, t); yield* this.inflict(t, mv.st, false); }
  }
  *statChange(b, ch, fromMove) {
    for (const k in ch) {
      const v = ch[k]; const cur = b.stages[k];
      if ((v > 0 && cur >= 6) || (v < 0 && cur <= -6)) { yield* this.msg(b.n + '的' + STAT_NAMES[k] + '已經無法再' + (v > 0 ? '提升' : '降低') + '了！'); continue; }
      b.stages[k] = clamp(cur + v, -6, 6);
      if (v > 0) { Sound.sfx('statUp'); yield* FX.statUpFx.call(this, this.center(b)); } else { Sound.sfx('statDown'); yield* FX.statDownFx.call(this, this.center(b)); }
      yield* this.msg(b.n + '的' + STAT_NAMES[k] + (Math.abs(v) >= 2 ? '大幅' : '') + (v > 0 ? '提升了！' : '降低了！'));
    }
  }
  *inflict(b, s, secondary) {
    if (b.status || (b.t && IMMUNE[s] === b.t)) { if (!secondary) yield* this.msg(b.status === s ? b.n + '已經' + STATUS_NAME[s] + '了！' : '但是對' + b.n + '沒有效果……'); return; }
    b.status = s; if (s === 'slp') b.sleepT = rnd(1, 3);
    const fxn = { psn: 'psnFx', par: 'spark', slp: 'zzz', brn: 'burnFx' }[s]; yield* FX[fxn].call(this, null, this.center(b));
    yield* this.msg(b.n + { psn: '中毒了！', par: '麻痺了！可能會無法行動！', slp: '睡著了！', brn: '灼傷了！' }[s]);
  }
  *endTurn() {
    for (const b of [this.H, this.F]) {
      if (b.hp <= 0 || !(b.status === 'psn' || b.status === 'brn')) continue;
      const d = Math.max(1, Math.floor(b.maxhp / (b.boss ? 16 : 8)));
      yield* FX[b.status === 'psn' ? 'psnFx' : 'burnFx'].call(this, null, this.center(b)); Sound.sfx(b.status === 'psn' ? 'poison' : 'fire');
      b.hp = Math.max(0, b.hp - d); if (b.hero) this.blinkH = 12; else this.blinkF = 12; yield* this.animHP(b);
      yield* this.msg(b.n + '受到了' + (b.status === 'psn' ? '毒' : '灼傷') + '的傷害！');
      if (b.hp <= 0) return;
    }
  }
  *bossPhase2() {
    this.phase2 = true; this.fistCD = 1; Sound.sfx('quake'); this.shake = 40;
    this.tintF = { c: '#ff4020', a: 0 }; yield* tween(20, t => this.tintF.a = t * 0.6); yield* tween(20, t => this.tintF.a = 0.6 - t * 0.6); this.tintF = null;
    yield* this.msg(this.F.n + '的核心發出了耀眼的紅光！'); yield* this.msg(this.F.n + '進入了狂暴狀態！');
    yield* this.statChange(this.F, { atk: 1 });
  }
  *tryRun() {
    this.runTries++; const hs = this.effSpe(this.H), fs = this.effSpe(this.F);
    const ok = hs >= fs || (Math.floor(hs * 128 / fs) + 30 * this.runTries) % 256 > rnd(0, 255);
    if (ok) { Sound.sfx('run'); yield* this.msg('順利逃走了！'); return true; }
    yield* this.msg('沒能逃走！'); return false;
  }
  *useItemAct(k) {
    const st = Game.st, it = ITEMS[k];
    if (it.use === 'escape') {
      st.bag[k]--; yield* this.msg(st.name + '丟出了煙霧彈！'); yield* FX.smoke.call(this);
      if (this.F.boss) { yield* this.msg('但是' + this.F.n + '擋住了出口，逃不掉！'); return; }
      Sound.sfx('run'); yield* this.msg('趁著煙霧順利逃走了！'); return 'escaped';
    }
    yield* this.msg(st.name + '使用了' + it.n + '！', { hold: 16 });
    const m = useItem(k); Sound.sfx(it.use === 'heal' ? 'heal' : 'item'); yield* FX.heal.call(this, this.center(this.H)); yield* this.animHP(this.H); yield* this.msg(m || '但是沒有效果……');
  }
  *foeFaint() {
    Sound.cry(Object.keys(SPECIES).indexOf(this.cfg.sp) + 1, 0.6, 1.2); yield* wait(20);
    if (this.F.boss) { Sound.sfx('quake'); this.shake = 50; for (let i = 0; i < 30; i++) { if (i % 3 === 0) this.sparks(this.foeTX + 32 + rnd(-26, 26), FOE_FOOT - 34 + rnd(-26, 26), 3, ['#8a8272', '#a09884', '#ff8040'], 2.5, 26, 0.15); yield; } }
    Sound.sfx('faint'); yield* tween(this.F.boss ? 40 : 22, t => { this.sinkF = t * this.imgF.bb.h; this.alphaF = 1 - t * 0.3; }); this.alphaF = 0;
    yield* tween(10, t => this.boxF = lerp(4, -30, t));
    yield* this.msg((this.F.boss ? '' : this.F.elite ? '精英魔物' : '野生的') + this.F.n + '倒下了！', { hold: 40 });
  }
  *heroFaint() {
    Sound.stop(); Sound.sfx('faint'); yield* tween(24, t => this.sinkH = t * 70);
    yield* tween(10, t => this.boxH = lerp(HBAR_Y, BH + 4, t));
    yield* this.msg(Game.st.name + '倒下了……', { wait: true });
  }
  *victory() {
    const st = Game.st, F = this.F, sp = SPECIES[F.sp]; Game.st.wins = (st.wins || 0) + 1;
    Sound.play('victory');
    const exp = Math.floor(sp.exp * F.lv / 5 * (F.elite || F.boss ? 1.5 : 1));
    yield* this.gainExp(exp);
    const gold = F.boss ? 1000 : sp.gold * F.lv;
    if (gold) { st.money += gold; yield* this.msg(st.name + '得到了' + gold + ' G！'); }
  }
  *gainExp(amount) {
    const st = Game.st; yield* this.msg(st.name + '獲得了' + amount + '點經驗值！', { hold: 20 });
    let remaining = amount; Sound.expStart();
    while (remaining > 0 && st.lv < 50) {
      const lo = expForLevel(st.lv), hi = expForLevel(st.lv + 1); const step = Math.min(remaining, hi - st.exp);
      const from = st.exp, to = st.exp + step; const fr = clamp(Math.ceil(step / (hi - lo) * 50), 6, 50);
      for (let i = 1; i <= fr; i++) { this.disp.exp = lerp(from, to, i / fr); Sound.expStep((this.disp.exp - lo) / (hi - lo)); yield; }
      st.exp = to; this.disp.exp = to; remaining -= step;
      if (st.exp >= hi) { Sound.expStop(); yield* this.levelUp(); Sound.expStart(); }
    }
    Sound.expStop(); yield* wait(10);
  }
  *levelUp() {
    const st = Game.st, before = heroStats(), bA = heroAttr(); st.lv++; const after = heroStats(), aA = heroAttr(); st.hp = Math.min(after.hp, st.hp + (after.hp - before.hp));
    this.H.maxhp = after.hp; this.H.stats = after; this.H.lv = st.lv; this.disp.H = st.hp;
    const fr = Sound.jingle('levelup'); this.tintH = { c: '#ffffff', a: 0 };
    const tb = new TextBox(st.name + '升到了Lv.' + st.lv + '！', { style: 'battle' }); UI.push(tb);
    for (let i = 0; i < 24; i++) { this.tintH.a = Math.sin(i / 24 * Math.PI) * 0.8; tb.update(); yield; } this.tintH = null;
    while (!tb.done) { tb.update(); yield; }
    let showTotal = false; const rowsL = [['HP', before.hp, after.hp]].concat(ATTRS.map(k => [ATTR_NAMES[k], bA[k], aA[k]]));
    const win = { draw: x => { drawWin(x, 80, 34, 90, 122, 'menu'); rowsL.forEach(([n, b, a], i) => { const Y = 38 + i * 16; Font.draw(x, n, 90, Y, UIC.muted, UIC.textSh); const d = a - b; Font.drawR(x, showTotal ? String(a) : d > 0 ? '+' + d : '—', 162, Y, showTotal ? UIC.text : d > 0 ? UIC.accent : UIC.dis, UIC.textSh); }); } };
    UI.push(win); yield* waitA(); showTotal = true; Sound.sfx('cursor'); yield* waitA(); UI.remove(win); UI.remove(tb);
    for (const id of heroLearnAt(st.lv)) yield* this.learnMove(id);
    if (Sound.current !== 'victory' && this.F.hp <= 0) Sound.play('victory');
  }
  *learnMove(id) {
    const st = Game.st, mv = MOVES[id], nm = st.name;
    if (st.moves.some(m => m.id === id)) return;
    if (st.moves.length < 4) { st.moves.push({ id, pp: mv.pp }); Sound.jingle('item'); yield* this.msg(nm + '學會了「' + mv.n + '」！', { wait: true }); return; }
    yield* this.msg(nm + '想要學習新技能「' + mv.n + '」。', { wait: true });
    yield* this.msg('但是' + nm + '已經會四個技能了。', { wait: true });
    while (true) {
      const yes = yield* yesNo('要忘記一個舊技能，\n來學習「' + mv.n + '」嗎？', { style: 'battle' });
      if (yes) {
        const idx = yield* pickMoveToForget(id);
        if (idx < 4) {
          const old = MOVES[st.moves[idx].id].n; yield* this.msg('1、2……砰！', { wait: true }); yield* this.msg(nm + '忘記了「' + old + '」……', { wait: true });
          yield* this.msg('然後……', { wait: true }); st.moves[idx] = { id, pp: mv.pp }; Sound.jingle('item'); yield* this.msg(nm + '學會了「' + mv.n + '」！', { wait: true }); return;
        }
      }
      const giveUp = yield* yesNo('要放棄學習「' + mv.n + '」嗎？', { style: 'battle' });
      if (giveUp) { yield* this.msg(nm + '沒有學習「' + mv.n + '」。', { wait: true }); return; }
    }
  }
  *end(res) {
    this.result = res; const st = Game.st;
    if (st.status === 'slp') st.sleepT = this.H.sleepT; else st.sleepT = undefined;
    Sound.expStop(); yield* fadeOut(16); UI.clear();
    Game.setScene(Game.ow);
  }
}

/* ---------------- particles & move effects ---------------- */
const tintCache = new Map();
function tinted(img, col) { const k = col; let m = tintCache.get(img); if (!m) { m = {}; tintCache.set(img, m); } if (m[k]) return m[k]; const c = mkCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); m[k] = c; return c; }
const ROCK_IMG = (() => { const c = buildShaded({ parts: [{ s: 'p', pts: [[4, 20], [14, 6], [34, 4], [58, 16], [60, 44], [44, 60], [16, 58], [2, 40]], c: '#9a8e7a' }] }, 12, 12 / 64); return c; })();
const BIG_ROCK = buildShaded({ parts: [{ s: 'p', pts: [[4, 20], [14, 6], [34, 4], [58, 16], [60, 44], [44, 60], [16, 58], [2, 40]], c: '#8a7e6a' }], details: [{ s: 'line', pts: [[20, 20], [30, 34], [26, 46]], c: '#5a5044' }] }, 40, 40 / 64);
const LEAF_IMG = spriteFrom(['..kk', '.kLk', 'kLlk', 'klk.', 'kk..'], { k: '#1e5a28', L: '#9ae070', l: '#50b048' });
function drawParticle(x, p) {
  if (p.hidden) return; const a = 1 - p.t / p.life;
  switch (p.k) {
    case 'dot': x.fillStyle = p.c; x.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s); break;
    case 'star': { const r = 3 + p.t * 1.2; x.fillStyle = p.c; x.globalAlpha = a; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; x.fillRect(Math.round(p.x + Math.cos(an) * r), Math.round(p.y + Math.sin(an) * r), 2, 2); } x.fillRect(p.x - 2, p.y - 2, 4, 4); x.globalAlpha = 1; break; }
    case 'line': { const g = clamp(p.t / (p.grow || 1), 0, 1); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = p.w || 2; x.beginPath(); x.moveTo(p.x1, p.y1); x.lineTo(lerp(p.x1, p.x2, g), lerp(p.y1, p.y2, g)); x.stroke(); x.globalAlpha = 1; break; }
    case 'bolt': { x.strokeStyle = p.t % 4 < 2 ? '#fff8a0' : '#f8d030'; x.lineWidth = p.w || 3; x.beginPath(); p.pts.forEach(([a1, b1], i) => i ? x.lineTo(a1, b1) : x.moveTo(a1, b1)); x.stroke(); x.strokeStyle = '#ffffff'; x.lineWidth = 1; x.stroke(); break; }
    case 'ring': { const r = lerp(p.r0, p.r1, p.t / p.life); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = p.w || 2; x.beginPath(); x.ellipse(p.x, p.y, r, r * (p.fl || 1), 0, 0, Math.PI * 2); x.stroke(); x.globalAlpha = 1; break; }
    case 'circ': x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); if (p.hl) { x.fillStyle = p.hl; x.fillRect(Math.round(p.x - p.r / 2), Math.round(p.y - p.r / 2), 1, 1); } break;
    case 'bub': x.strokeStyle = p.c; x.lineWidth = 1; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.stroke(); x.fillStyle = '#ffffff'; x.fillRect(Math.round(p.x - p.r / 2), Math.round(p.y - p.r / 2), 1, 1); break;
    case 'img': x.globalAlpha = p.fade ? a : 1; x.drawImage(p.img, Math.round(p.x - p.img.width / 2), Math.round(p.y - p.img.height / 2)); x.globalAlpha = 1; break;
    case 'txt': x.globalAlpha = p.fade ? a : 1; Font.draw(x, p.s, p.x, p.y, p.c, p.sh || null); x.globalAlpha = 1; break;
    case 'flame': { const s = p.s * a + 1; x.fillStyle = a > 0.6 ? '#fff0a0' : a > 0.3 ? '#f8a030' : '#e05020'; x.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s), Math.ceil(s), Math.ceil(s * 1.5)); break; }
    case 'arc': { x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2; x.beginPath(); x.ellipse(p.x, p.y, p.r, p.r * 0.5, 0, p.a0 + p.t * 0.25, p.a0 + p.t * 0.25 + 2.2); x.stroke(); x.globalAlpha = 1; break; }
    case 'cres': { x.save(); x.translate(p.x, p.y); x.rotate(p.ang || 0); x.globalAlpha = Math.min(1, a * 2); x.lineCap = 'round'; x.strokeStyle = p.c2; x.lineWidth = p.w || 6; x.beginPath(); x.arc(0, 0, p.r, -1.15, 1.15); x.stroke(); x.strokeStyle = p.c; x.lineWidth = Math.max(1, (p.w || 6) / 3); x.beginPath(); x.arc(0, 0, p.r - 1, -1.0, 1.0); x.stroke(); x.restore(); x.globalAlpha = 1; break; }
    case 'glow': { const r = p.r * (0.6 + 0.4 * a); const gr = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); const [cr, cg, cb] = hex2rgb(p.c); gr.addColorStop(0, `rgba(${cr},${cg},${cb},0.85)`); gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`); x.globalAlpha = a; x.fillStyle = gr; x.fillRect(p.x - r, p.y - r, r * 2, r * 2); x.globalAlpha = 1; break; }
    case 'flash': x.globalAlpha = a * (p.a || 0.6); x.fillStyle = p.c; x.fillRect(0, 0, W, BH); x.globalAlpha = 1; break;
  }
}
const FX = {
  *hit(U, T, u) { yield* this.lunge(u); this.star(T.x, T.y, '#ffffff'); this.sparks(T.x, T.y, 6, ['#ffffff', '#f8e070']); yield* wait(10); },
  *slash(U, T, u) { yield* this.lunge(u, 8, 3); Sound.sfx('slash'); for (let i = 0; i < 2; i++) { const o = i * 10 - 5; this.spawn({ k: 'line', x1: T.x - 20 + o, y1: T.y - 20, x2: T.x + 14 + o, y2: T.y + 18, c: '#a8d8ff', w: 5, grow: 3, life: 12 }); this.spawn({ k: 'line', x1: T.x - 20 + o, y1: T.y - 20, x2: T.x + 14 + o, y2: T.y + 18, c: '#ffffff', w: 2, grow: 3, life: 14 }); yield* wait(4); } this.star(T.x, T.y); yield* wait(6); },
  *fireSlash(U, T, u) { yield* this.lunge(u, 8, 3); Sound.sfx('slash'); for (let i = 0; i < 2; i++) { const o = i * 10 - 5; this.spawn({ k: 'line', x1: T.x - 18 + o, y1: T.y - 20, x2: T.x + 14 + o, y2: T.y + 18, c: '#f86020', w: 6, grow: 3, life: 14 }); this.spawn({ k: 'line', x1: T.x - 18 + o, y1: T.y - 20, x2: T.x + 14 + o, y2: T.y + 18, c: '#fff0a0', w: 2, grow: 3, life: 16 }); yield* wait(4); } Sound.sfx('fire'); this.spawn({ k: 'glow', x: T.x, y: T.y + 4, r: 34, c: '#f86020', life: 22 }); for (let i = 0; i < 26; i++) this.spawn({ k: 'flame', x: T.x + rnd(-20, 20), y: T.y + rnd(-6, 22), vy: -0.6 - Math.random() * 1.2, s: rnd(3, 7), life: 24 + rnd(0, 12) }); yield* wait(20); },
  *scratch(U, T, u) { yield* this.lunge(u, 6, 3); Sound.sfx('slash'); for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: T.x + 10 - i * 7, y1: T.y - 14, x2: T.x - 4 - i * 7, y2: T.y + 12, c: '#ffffff', w: 1, grow: 5, life: 14 }); yield* wait(14); },
  *bite(U, T) { const top = this.spawn({ k: 'txt', s: '▼▼▼', x: T.x - 18, y: T.y - 30, c: '#ffffff', sh: '#404040', life: 20 }); const bot = this.spawn({ k: 'txt', s: '▲▲▲', x: T.x - 18, y: T.y + 14, c: '#ffffff', sh: '#404040', life: 20 }); top.upd = p => { p.y = T.y - 30 + Math.min(p.t, 8) * 2; }; bot.upd = p => { p.y = T.y + 14 - Math.min(p.t, 8) * 2; }; yield* wait(9); Sound.sfx('hit'); this.star(T.x, T.y); yield* wait(10); },
  *quick(U, T, u) { const o = u.hero ? this.offH : this.offF; const dx = (T.x - U.x) * 0.6, dy = (T.y - U.y) * 0.6; for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: U.x - 10, y1: U.y + i * 8 - 8, x2: U.x + 20, y2: U.y + i * 8 - 8, c: '#ffffff', w: 1, grow: 2, life: 8 }); yield* tween(5, t => { o.x = dx * t; o.y = dy * t; }); this.star(T.x, T.y); this.sparks(T.x, T.y, 6, ['#ffffff']); yield* tween(8, t => { o.x = dx * (1 - t); o.y = dy * (1 - t); }); o.x = o.y = 0; yield* wait(6); },
  *glare(U, T, u, t) { for (let i = 0; i < 2; i++) { this.spawn({ k: 'line', x1: U.x, y1: U.y - 10, x2: T.x, y2: T.y, c: '#f05050', w: 1, grow: 6, life: 14 }); yield* wait(4); } yield* this.shakeB(t, 14, 3); },
  *sound(U, T, u, t) { Sound.sfx('buzz'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: lerp(U.x, T.x, 0.3 + i * 0.25), y: lerp(U.y, T.y, 0.3 + i * 0.25), r0: 3, r1: 14, c: '#f8f8ff', life: 16 }); yield* wait(5); } yield* this.shakeB(t, 10, 2); },
  *buff(U) { Sound.sfx('statUp'); yield* FX.statUpFx.call(this, U); },
  *statUpFx(U) { for (let i = 0; i < 14; i++) this.spawn({ k: 'txt', s: '↑', x: U.x + rnd(-24, 20), y: U.y + rnd(0, 26), vy: -1.2, c: '#f86060', sh: '#ffffff', life: 24 + rnd(0, 8), fade: 1 }); yield* wait(26); },
  *statDownFx(U) { for (let i = 0; i < 14; i++) this.spawn({ k: 'txt', s: '↓', x: U.x + rnd(-24, 20), y: U.y + rnd(-26, 0), vy: 1.2, c: '#5878f0', sh: '#ffffff', life: 24 + rnd(0, 8), fade: 1 }); yield* wait(26); },
  *water(U, T) { yield* FX.crescent.call(this, U, T, '#e8f8ff', '#3c90f0', ['#88c8ff', '#ffffff', '#58a8f8'], 'water'); this.spawn({ k: 'ring', x: T.x, y: T.y + 6, r0: 6, r1: 34, c: '#a8e0ff', w: 3, life: 16, fl: 0.5 }); this.sparks(T.x, T.y, 20, ['#88c8ff', '#ffffff', '#58a8f8'], 3, 24, 0.18); yield* wait(10); },
  *crescent(U, T, c, c2, trail, sfx) {
    Sound.sfx(sfx); const ang = Math.atan2(T.y - U.y, T.x - U.x); const fr = 14;
    const p = this.spawn({ k: 'cres', x: U.x, y: U.y, r: 12, ang, c, c2, w: 7, life: fr + 2 });
    for (let i = 0; i <= fr; i++) { const t = i / fr; p.x = lerp(U.x, T.x, t); p.y = lerp(U.y, T.y, t) - Math.sin(t * Math.PI) * 10; p.r = 10 + t * 8; if (i % 2 === 0) this.spawn({ k: 'dot', x: p.x + rnd(-6, 6), y: p.y + rnd(-6, 6), vx: -Math.cos(ang) * 0.5, vy: 0.4, c: pick(trail), s: 2, life: 14 }); yield; }
    this.spawn({ k: 'glow', x: T.x, y: T.y, r: 30, c: c2, life: 12 });
  },
  *bubble(U, T) { Sound.sfx('water'); this.projectile(U, T, 7, () => ({ k: 'bub', r: rnd(2, 4), c: '#a8e0ff', wob: 4 }), 4, 26); yield* wait(46); this.sparks(T.x, T.y, 8, ['#a8e0ff', '#ffffff'], 1.6); yield* wait(8); },
  *thunder(U, T) { Sound.sfx('thunder'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 40, c: '#fff8a0', life: 24 }); for (let k = 0; k < 3; k++) { const pts = []; let px0 = T.x + rnd(-6, 6); for (let y = -4; y < T.y; y += 8) { pts.push([px0, y]); px0 += rnd(-7, 7); } pts.push([T.x, T.y]); this.spawn({ k: 'bolt', pts, life: 16 }); this.spawn({ k: 'flash', c: '#fff8a0', a: 0.5, life: 8 }); this.shake = 10; yield* wait(8); } this.sparks(T.x, T.y, 12, ['#fff8a0', '#f8d030'], 2.5); yield* wait(12); },
  *spark(U, T) { Sound.sfx('buzz'); for (let i = 0; i < 6; i++) { const x0 = T.x + rnd(-20, 20), y0 = T.y + rnd(-20, 16); this.spawn({ k: 'bolt', pts: [[x0, y0], [x0 + rnd(-5, 5), y0 + 4], [x0 + rnd(-5, 5), y0 + 8], [x0 + rnd(-4, 4), y0 + 12]], life: 10 }); yield* wait(3); } yield* wait(8); },
  *ember(U, T) { Sound.sfx('fire'); this.projectile(U, T, 4, () => ({ k: 'flame', s: 6, arc: 8 }), 4, 16); yield* wait(28); for (let i = 0; i < 12; i++) this.spawn({ k: 'flame', x: T.x + rnd(-14, 14), y: T.y + rnd(-4, 16), vy: -0.8, s: rnd(3, 6), life: 22 }); yield* wait(18); },
  *leaf(U, T) { this.projectile(U, T, 8, () => ({ k: 'img', img: LEAF_IMG, wob: 8, arc: 14 }), 2, 16); yield* FX.crescent.call(this, U, T, '#f0ffd8', '#48b040', ['#9ae070', '#50b048'], 'leaf'); yield* wait(6); Sound.sfx('slash'); this.spawn({ k: 'line', x1: T.x - 16, y1: T.y - 14, x2: T.x + 16, y2: T.y + 14, c: '#c8f8a0', w: 3, grow: 3, life: 12 }); this.sparks(T.x, T.y, 8, ['#9ae070', '#50b048'], 2); yield* wait(12); },
  *drain(U, T) { Sound.sfx('leaf'); this.sparks(T.x, T.y, 10, ['#9ae070', '#d8f8a0'], 1.5, 16); yield* wait(14); },
  *drainBack(T, U) { this.projectile(T, U, 8, () => ({ k: 'circ', r: 2, c: '#a8f080', hl: '#ffffff', wob: 5 }), 3, 20); Sound.sfx('heal'); yield* wait(40); },
  *powder(U, T) { Sound.sfx('leaf'); for (let i = 0; i < 26; i++) this.spawn({ k: 'dot', x: T.x + rnd(-22, 22), y: T.y - 34 + rnd(-10, 6), vx: Math.random() * 0.4 - 0.2, vy: 0.9 + Math.random() * 0.5, c: pick(['#c060d0', '#e090f0', '#9030a0']), s: 2, life: 40 }); yield* wait(40); },
  *powderS(U, T) { Sound.sfx('leaf'); for (let i = 0; i < 26; i++) this.spawn({ k: 'dot', x: T.x + rnd(-22, 22), y: T.y - 34 + rnd(-10, 6), vx: Math.random() * 0.4 - 0.2, vy: 0.9 + Math.random() * 0.5, c: pick(['#a0d0ff', '#e0f0ff', '#70a0f0']), s: 2, life: 40 }); yield* wait(40); },
  *vine(U, T) { Sound.sfx('slash'); for (let i = 0; i < 2; i++) { this.spawn({ k: 'line', x1: U.x, y1: U.y, x2: T.x + (i ? 10 : -10), y2: T.y + (i ? -8 : 8), c: '#48a040', w: 3, grow: 5, life: 16 }); yield* wait(5); } this.star(T.x, T.y); Sound.sfx('hit'); yield* wait(10); },
  *wind(U, T) { Sound.sfx('wind'); for (let i = 0; i < 6; i++) { this.spawn({ k: 'arc', x: T.x + rnd(-10, 10), y: T.y + rnd(-14, 14), r: rnd(10, 18), a0: Math.random() * 6, c: '#ffffff', life: 20 }); yield* wait(3); } yield* wait(14); },
  *sting(U, T) { Sound.sfx('slash'); this.projectile(U, T, 2, () => ({ k: 'circ', r: 1.5, c: '#c060d0', hl: '#ffffff' }), 5, 12); yield* wait(20); this.star(T.x, T.y, '#e0a0f0'); yield* wait(8); },
  *acid(U, T) { Sound.sfx('poison'); this.projectile(U, T, 5, () => ({ k: 'circ', r: 3, c: '#a048a8', hl: '#e090f0', arc: 20 }), 4, 18); yield* wait(36); this.sparks(T.x, T.y, 10, ['#a048a8', '#e090f0'], 1.8, 20, 0.1); yield* wait(10); },
  *sing(U, T) { Sound.sfx('heal'); this.projectile(U, T, 5, () => ({ k: 'txt', s: '♪', c: '#f080b0', sh: '#ffffff', wob: 6, arc: 10 }), 6, 30); yield* wait(56); },
  *rock(U, T) { for (let i = 0; i < 3; i++) { const x0 = T.x + rnd(-16, 16); const p = this.spawn({ k: 'img', img: ROCK_IMG, x: x0, y: -10, vy: 5, life: 14 }); p.upd = q => { q.y = Math.min(T.y + rnd(-4, 8), q.y + 5); }; yield* wait(8); Sound.sfx('rock'); this.shake = 6; this.sparks(x0, T.y + 6, 5, ['#9a8e7a', '#c8bca4'], 1.8, 14, 0.15); } yield* wait(12); },
  *stomp(U, T, u, t) { yield* this.lunge(u, 14, 5); if (!t.hero) { yield* tween(4, q => this.squishF = q * 6); yield* tween(6, q => this.squishF = 6 * (1 - q)); } this.shake = 14; this.star(T.x, T.y + 10); yield* wait(10); },
  *roar(U, T, u, t) { Sound.sfx('quake'); for (let i = 0; i < 4; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 6, r1: 70, c: '#e0c080', w: 2, life: 24, fl: 0.6 }); this.shake = 8; yield* wait(6); } yield* this.shakeB(t, 12, 3); },
  *bigRock(U, T, u) { yield* this.lunge(u, 18, 8); const p = this.spawn({ k: 'img', img: BIG_ROCK, x: T.x, y: -30, life: 18 }); p.upd = q => { q.y = Math.min(T.y, -30 + q.t * 9); }; yield* wait(10); Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#ffffff', a: 0.9, life: 10 }); this.shake = 28; this.sparks(T.x, T.y, 20, ['#9a8e7a', '#c8bca4', '#ff8040'], 3, 24, 0.15); yield* wait(14); },
  *heal(U) { Sound.sfx('heal'); for (let i = 0; i < 18; i++) this.spawn({ k: 'txt', s: pick(['+', '·']), x: U.x + rnd(-24, 20), y: U.y + rnd(-4, 26), vy: -0.8, c: '#70e070', sh: '#ffffff', life: 30, fade: 1 }); yield* wait(28); },
  *guard(U) { Sound.sfx('statUp'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 8, r1: 30, c: '#a0d0ff', w: 2, life: 16 }); yield* wait(5); } yield* wait(8); },
  *charge(U) { Sound.sfx('charge'); for (let i = 0; i < 30; i++) { const a = Math.random() * 7, r = 36; const p = this.spawn({ k: 'dot', x: U.x + Math.cos(a) * r, y: U.y + Math.sin(a) * r, c: pick(['#ffd040', '#ff8040', '#fff0a0']), s: 2, life: 18 }); p.upd = q => { q.x = lerp(q.x, U.x, 0.12); q.y = lerp(q.y, U.y, 0.12); }; if (i % 2) yield; } this.tintF = { c: '#ffb040', a: 0.5 }; yield* wait(10); this.tintF = null; },
  *zzz(U, T) { const P = T || U; for (let i = 0; i < 3; i++) { this.spawn({ k: 'txt', s: 'Z', x: P.x + 8 + i * 5, y: P.y - 10 - i * 6, vy: -0.4, c: '#a0c0ff', sh: '#304060', life: 30, fade: 1 }); yield* wait(8); } yield* wait(14); },
  *psnFx(U, T) { const P = T || U; Sound.sfx('poison'); for (let i = 0; i < 10; i++) this.spawn({ k: 'bub', x: P.x + rnd(-18, 18), y: P.y + rnd(0, 20), vy: -0.8, r: rnd(2, 3), c: '#c060d0', life: 26 }); if (this.tintF !== undefined) { } yield* wait(24); },
  *burnFx(U, T) { const P = T || U; Sound.sfx('fire'); for (let i = 0; i < 12; i++) this.spawn({ k: 'flame', x: P.x + rnd(-16, 16), y: P.y + rnd(0, 20), vy: -0.7, s: rnd(3, 5), life: 22 }); yield* wait(22); },
  *smoke() { Sound.sfx('wind'); for (let i = 0; i < 30; i++) this.spawn({ k: 'circ', x: rnd(10, W - 10), y: rnd(20, BH - 20), r: rnd(6, 14), c: pick(['#d8d8d8', '#b8b8c0', '#f0f0f0']), life: 30 + rnd(0, 20), vy: -0.3 }); yield* wait(40); },
};
