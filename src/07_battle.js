/* ===================== BATTLE ===================== */
let HERO_POWER = 1.45, BOSS_HP = 2.1, ELITE_HP = 1.1;
const BTN_MENU = { x: 4, y: TB_Y + 1, w: W - 8, h: TB_H - 2, cols: 2, colW: 82, rowH: 20, ox: 3, oy: 17, buttons: true, style: 'cmd' };
const BH = TB_Y, FOE_X = 96, HERO_X = 6, HERO_Y = 122, HBAR_Y = 156; // facing the foe: foe far (upper right), hero's back near (lower left); panels on the opposite corners
function critRate(u, mv) { const base = (u.stats.crit ?? 6) / 100; return mv.crit ? base * 2 : base; }
function hitChance(u, t, mv) { let a = mv.acc; if (!a) return 1; a += u.stats.hit || 0; a -= t.stats.eva || 0; return clamp(a, 5, 100) / 100; }
const stageMul = s => s >= 0 ? 1 + 0.25 * s : 1 / (1 + 0.25 * -s); // buffs/debuffs: ±25% per step, max ±3, timed
const STATUS_NAME = { psn: '中毒', par: '麻痺', slp: '睡眠', brn: '灼傷' };
const IMMUNE = { psn: '毒', brn: '火', par: '雷' };
const battleImgCache = {};
// battle sprites: rendered at a low native size, then scaled 3x (same chunky pixel look as the hero)
const FOE_NATIVE = { golem: 28, mossGiant: 28, crystalGolem: 28, banditBoss: 28, boneKnight: 28, runeGolem: 28 }, FOE_SCALE = 3, FOE_FOOT = 110;
function battleSprite(key) {
  if (battleImgCache[key]) return battleImgCache[key];
  const n = FOE_NATIVE[key] || 24, S = FOE_SCALE, sm = buildShaded(ART[key], n, n / 64);
  const c = mkCanvas(n * S, n * S); c.getContext('2d').drawImage(sm, 0, 0, n * S, n * S);
  const d = sm.getContext('2d').getImageData(0, 0, n, n).data; let x0 = n, x1 = -1, y0 = n, y1 = -1;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (d[(y * n + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  c.bb = { cx: Math.round((x0 + x1 + 1) * S / 2), top: y0 * S, bot: (y1 + 1) * S, w: (x1 - x0 + 1) * S, h: (y1 - y0 + 1) * S };
  return battleImgCache[key] = c;
}
function badgeRow(x, list, X, Y) { for (const b of list) if (b) { statusBadge(x, b, X, Y); X += 18; } }
function makeFoe(sp, lv, kind) {
  const d = SPECIES[sp], P = MON_PANEL[sp], f = (lv + 10) / (P.lv + 10);
  const s = {}; for (const k of ['hp', 'atk', 'def', 'spa', 'spd', 'spe']) s[k] = Math.max(1, Math.round(P[k] * f * (kind === 'wild' ? 0.92 + Math.random() * 0.16 : 1)));
  { const rk = d.rare ? 'rare' : kind === 'boss' ? 'boss' : kind === 'elite' ? 'elite' : 'wild'; const cv = rk === 'rare' ? 0 : 1; s.hp = Math.round(s.hp * BALANCE.hp[rk] * (cv ? lvCurve(lv, 'curveHP') : 1)); for (const k of ['atk', 'spa']) s[k] = Math.round(s[k] * BALANCE.pow[rk] * (cv ? lvCurve(lv, 'curvePow') : 1)); for (const k of ['def', 'spd']) s[k] = Math.round(s[k] * BALANCE.def[rk] * (cv ? lvCurve(lv, 'curveDef') : 1)); }
  s.crit = P.crit ?? 6; s.hit = P.hit || 0; s.eva = P.eva || 0;
  const known = d.learn.filter(([l]) => l <= lv).map(([, m]) => m); const moves = [...new Set(known)].slice(-4).map(id => ({ id }));
  return { sp, n: d.n, fam: d.fam, rare: d.rare, lv, stats: s, hp: s.hp, maxhp: s.hp, status: null, moves, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, wet: 0, trait: d.trait, kind, boss: kind === 'boss', elite: kind === 'elite', sleepT: 0 };
}
function buildBattleBG(kind) {
  const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(kind === 'ruins' ? 9 : 5);
  const poly = (col, pts) => pxPoly(x, pts, col);
  if (kind === 'forest') { // deep misty forest
    ['#27402f', '#2d4a35', '#34553b', '#3c6042', '#456b49', '#4e7650'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 12, W, 12); });
    for (let i = -6; i < W; i += 11) { const w = 5 + Math.floor(r() * 5); x.fillStyle = r() < 0.5 ? '#2a1f18' : '#33261c'; x.fillRect(i, 0, w, 76); x.fillStyle = '#45352a'; x.fillRect(i, 0, 1, 76); }
    for (let i = -8; i < W; i += 9) pxEllipse(x, i + 4, 6 + Math.floor(r() * 10), 9, 7, r() < 0.5 ? '#1f3a26' : '#244430');
    x.fillStyle = 'rgba(210,235,220,0.18)'; x.fillRect(0, 50, W, 26);
    ['#5c8a4c', '#578548', '#528044', '#4d7a40', '#48743c', '#436e38', '#3f6834', '#3b6230', '#375c2e', '#34572c', '#31522a', '#2e4e28'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 72 + i * 11, W, 11); });
    x.fillStyle = '#6a9a58'; for (let y = 76; y < BH; y += 6) for (let i = (y * 13) % 29; i < W; i += 29) x.fillRect(i, y, 5, 1);
    x.fillStyle = '#c8b060'; for (let k = 0; k < 14; k++) x.fillRect(Math.floor(r() * W), 20 + Math.floor(r() * 50), 1, 1);
  } else if (kind === 'ruins') { // torch-lit stone hall
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
    const H = this.H = { hero: true, n: st.name, lv: st.lv, t: null, stats: s, maxhp: s.hp, moves: st.moves, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, wet: 0, sleepT: st.sleepT ?? rnd(1, 3) };
    const dx = st.dex || (st.dex = {}); (dx[cfg.sp] || (dx[cfg.sp] = { won: 0 })).seen = 1;
    Object.defineProperty(H, 'hp', { get: () => st.hp, set: v => st.hp = v }); if (st.mp === undefined) st.mp = s.mp; H.maxmp = s.mp; Object.defineProperty(H, 'mp', { get: () => st.mp, set: v => st.mp = clamp(v, 0, s.mp) }); Object.defineProperty(H, 'status', { get: () => st.status, set: v => st.status = v });
    this.bg = buildBattleBG(cfg.bg);
    this.imgF = battleSprite(cfg.sp); this.foeTX = FOE_X; this.shadowF = buildShadow(Math.round(this.imgF.bb.w * 0.38), 4); this.imgH = heroBattleImgLook(0, heroLookOf(st)); this.imgH2 = heroBattleImgLook(1, heroLookOf(st)); this.shadowH = buildShadow(22, 5);
    this.disp = { F: this.F.hp, H: st.hp, exp: st.exp };
    this.foeX = W + 40; this.heroX = -90; this.boxF = -30; this.boxH = BH + 4; this.cover = 1;
    this.offF = { x: 0, y: 0 }; this.offH = { x: 0, y: 0 }; this.sinkF = 0; this.sinkH = 0; this.blinkF = 0; this.blinkH = 0; this.alphaF = 1;
    this.fx = []; this.shake = 0; this.t = 0; this.idle = false; this.cmdIdx = 0; this.moveIdx = 0; this.runTries = 0; this.turn = 0; this.phase2 = false; this.fistCD = 2;
    this.tint = null; this.squishF = 0;
    if (cfg.sp === 'banditBoss') this.bb = { cd: 2, stolen: 0, steals: 0, gang: 0, called: false };
    if (cfg.sp === 'crystalGolem') this.cg = { shards: 0, mirror: 0, flood: false, stage: 0 };
    this.script = this.main();
  }
  enter() { UI.clear(); }
  update() {
    this.t++; if (this.F.rare && this.F.hp > 0 && this.t % 14 === 0 && this.foeX < W) this.spawn({ k: 'star', x: this.foeX + 32 + rnd(-22, 22), y: FOE_FOOT - rnd(8, 60), c: pick(['#fff4a0', '#ffffff', '#ffd84a']), life: 12 });
    if (this.shake > 0) this.shake--; if (this.blinkF > 0) this.blinkF--; if (this.blinkH > 0) this.blinkH--;
    for (const p of this.fx) { p.t++; if (p.upd) p.upd(p); else { p.x += p.vx || 0; p.y += p.vy || 0; p.vy = (p.vy || 0) + (p.g || 0); } }
    this.fx = this.fx.filter(p => p.t < p.life);
    if (this.script) { const r = this.script.next(); if (r.done) this.script = null; }
  }
  center(b) { return b.hero ? { x: this.heroX + 24, y: HERO_Y + 30 } : { x: this.foeX + 32, y: FOE_FOOT - Math.round(this.imgF.bb.h * 0.5) }; }
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
    if (this.cg && this.cg.shards > 0 && this.alphaF > 0) { const C = this.center(this.F); for (let i = 0; i < this.cg.shards; i++) { const an = this.t / 20 + i * Math.PI * 2 / 3, px0 = Math.round(C.x + Math.cos(an) * 44), py0 = Math.round(C.y + Math.sin(an) * 14); x.fillStyle = '#1a3050'; x.fillRect(px0 - 3, py0 - 5, 7, 11); x.fillStyle = '#9ae0ff'; x.fillRect(px0 - 2, py0 - 4, 5, 9); x.fillStyle = '#e8fbff'; x.fillRect(px0 - 1, py0 - 3, 2, 4); } }
    if (this.cg && this.cg.mirror && this.alphaF > 0 && Math.floor(this.t / 8) % 2) { x.globalAlpha = 0.25; x.drawImage(tinted(this.imgF, '#e8fbff'), Math.round(this.foeX + 32 - this.imgF.bb.cx), Math.round(FOE_FOOT - this.imgF.bb.bot)); x.globalAlpha = 1; }
    // hero (foreground, lower body hidden behind the status bar)
    if (!(this.blinkH > 0 && Math.floor(this.blinkH / 3) % 2)) {
      x.save(); x.globalAlpha = 0.25; x.drawImage(this.shadowH, Math.round(this.heroX + 24 + this.offH.x - this.shadowH.width / 2), HERO_Y + 64); x.globalAlpha = Math.max(0, 1 - this.sinkH / 70);
      const hi = (this.offH.x || this.offH.y) ? this.imgH2 : this.imgH; const hx = Math.round(this.heroX + this.offH.x), hy = Math.round(HERO_Y + this.offH.y + this.sinkH * 0.25 + bobH);
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
  drawBoxF(x) { // top-left, compact
    const Y = Math.round(this.boxF), F = this.F; if (Y < -33) return;
    const X = 4, w = 104; drawPanel(x, X, Y, w, 30, F.boss ? UIC.bad : F.elite ? UIC.warm : UIC.accent);
    const cx = Font.draw(x, F.n, X + 5, Y, UIC.text, UIC.textSh, 11); Font.draw(x, 'Lv' + F.lv, cx + 3, Y + 1, UIC.muted, UIC.textSh, 10);
    let lx = X + 5; if (FAMILIES[F.fam]) lx = Font.draw(x, FAMILIES[F.fam].n, lx, Y + 12, FAMILIES[F.fam].c, UIC.textSh, 9) + 3;
    const tag = F.rare ? '稀有' : F.boss ? '頭目' : F.elite ? '精英' : ''; if (tag) lx = Font.draw(x, tag, lx, Y + 12, F.rare ? '#ffd84a' : F.boss ? UIC.bad : UIC.warm, UIC.textSh, 9) + 3;
    { const bs = [F.status, F.wet && 'wet', F.tangle && 'tangle', F.shield && 'shield'].filter(Boolean), room = Math.max(0, Math.floor((X + w - 4 - lx) / 18)); badgeRow(x, bs.slice(0, room), lx, Y + 13); }
    drawHPBar(x, X + 5, Y + 25, w - 10, this.disp.F / F.maxhp, 3);
  }
  drawBoxH(x) { // bottom-right, clear of the hero sprite
    const Y = Math.round(this.boxH), st = Game.st; if (Y >= BH) return;
    const X = 90, w = W - 94, r = this.disp.H / this.H.maxhp, mr = clamp(st.mp / (this.H.maxmp || 1), 0, 1); drawPanel(x, X, Y, w, 39, UIC.accent, 'rgba(11,13,24,0.92)');
    const cx = Font.draw(x, st.name, X + 5, Y, UIC.text, UIC.textSh, 11); Font.draw(x, 'Lv' + st.lv, cx + 3, Y + 1, UIC.muted, UIC.textSh, 10);
    badgeRow(x, [st.status, this.H.wet && 'wet', this.H.tangle && 'tangle', this.H.shield && 'shield'].filter(Boolean).slice(0, 1), X + w - 22, Y + 2);
    const bw = w - 60; Font.draw(x, 'HP', X + 5, Y + 12, UIC.muted, UIC.textSh, 9); drawHPBar(x, X + 20, Y + 18, bw, r, 3); Font.drawR(x, Math.ceil(this.disp.H) + '/' + this.H.maxhp, X + w - 4, Y + 12, r <= 0.2 ? UIC.bad : UIC.text, UIC.textSh, 9);
    Font.draw(x, 'MP', X + 5, Y + 23, UIC.muted, UIC.textSh, 9); x.fillStyle = '#141a30'; x.fillRect(X + 20, Y + 29, bw, 3); x.fillStyle = '#5aa8ff'; x.fillRect(X + 20, Y + 29, Math.round(bw * mr), 3); Font.drawR(x, st.mp + '/' + this.H.maxmp, X + w - 4, Y + 23, '#86b4ff', UIC.textSh, 9);
    const lo = expForLevel(st.lv), hi = expForLevel(st.lv + 1); drawExpBar(x, X + 5, Y + 36, w - 10, (this.disp.exp - lo) / (hi - lo), 1);
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
  *playFx(name, u, t) { const U = this.center(u), T = this.center(t); if (!u.hero && MFX[name]) { yield* MFX.tell.call(this, U, T, u); yield* MFX[name].call(this, U, T, u, t); return; } const f = FX[name] || FX.hit; yield* f.call(this, U, T, u, t); }
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
        else if (a.type === 'defend') { yield* this.msg(u.n + '擺出了防禦的架勢！'); if (u.hero && u.mp < u.maxmp) { const g = Math.max(1, Math.round(u.maxmp * 0.12)); u.mp += g; yield* this.msg('調整呼吸，恢復了' + g + '點MP。', { hold: 18 }); } yield* FX.guard.call(this, this.center(u)); if (u.stats.fx.guardHeal && u.hp < u.maxhp) { u.hp = Math.min(u.maxhp, u.hp + Math.ceil(u.maxhp * 0.15)); yield* this.animHP(u); yield* this.msg('守護之心回復了HP！', { hold: 20 }); } }
        else if (a.type === 'item') { const r = yield* this.useItemAct(a.id); if (r === 'escaped') return yield* this.end('run'); }
        else if (a.type === 'mirror') { this.cg.mirror = 2; Sound.sfx('charge'); this.tintF = { c: '#c8f4ff', a: 0.6 }; yield* wait(14); this.tintF = null; yield* this.msg(u.n + '的表面變得像鏡子一樣！'); yield* this.msg('（下一回合的魔法攻擊會被反射回來！用物理攻擊或防禦吧。）'); }
        else if (a.type === 'steal') { const st = Game.st, g = Math.min(st.money, Math.max(50, Math.floor(st.money * 0.1))); this.bb.steals++; yield* MFX.steal.call(this, this.center(u), this.center(this.H), u); st.money -= g; this.bb.stolen += g; yield* this.msg(u.n + '搶走了' + g + ' G！'); if (this.bb.steals === 1) yield* this.msg('（打倒他就能把錢搶回來！）'); }
        else if (a.type === 'foeHeal') { u.heals = (u.heals || 0) + 1; yield* this.msg(u.n + '吸收了周圍的養分！'); yield* MFX.regrow.call(this, this.center(u)); u.hp = Math.min(u.maxhp, u.hp + Math.floor(u.maxhp * 0.3)); yield* this.animHP(u); }
        else if (a.type === 'flee') { Sound.sfx('run'); yield* tween(16, t => this.alphaF = 1 - t); yield* this.msg(u.n + '逃走了！'); return yield* this.end('run'); }
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
    yield* parallel(tween(14, t => this.cover = 1 - t), tween(40, t => { const e = 1 - Math.pow(1 - t, 3); this.foeX = lerp(W + 40, this.foeTX, e); this.heroX = lerp(-90, HERO_X, e); }));
    this.cover = 0; Sound.cry(Object.keys(SPECIES).indexOf(this.cfg.sp) + 1, this.F.boss ? 0.7 : 1, this.F.boss ? 1.6 : 1);
    if (this.F.boss) { this.shake = 30; Sound.sfx('quake'); }
    yield* parallel(tween(12, t => this.boxF = lerp(-30, 4, 1 - Math.pow(1 - t, 2))), wait(4));
    const intro = this.F.rare ? '稀有的' + this.F.n + '出現了！' : this.F.boss ? this.F.n + '擋住了去路！' : this.F.elite ? '精英魔物' + this.F.n + '發動了攻擊！' : '野生的' + this.F.n + '跳出來了！';
    yield* this.msg(intro, { hold: 44 });
    yield* tween(12, t => this.boxH = lerp(BH + 4, HBAR_Y, 1 - Math.pow(1 - t, 2)));
  }
  *chooseAction() {
    const st = Game.st;
    if (Game.autoPlay) { for (let i = 0; i < 4; i++) yield; return Game.autoPlay(this); }
    while (true) {
      this.idle = true;
      const pr = { draw(x) { drawWin(x, 4, TB_Y + 1, 76, TB_H - 2, 'ow'); Font.draw(x, st.name, 12, TB_Y + 8, UIC.accent, UIC.textSh); Font.draw(x, '要做什麼？', 12, TB_Y + 26, UIC.text, UIC.textSh); } }; UI.push(pr);
      const r = yield* choose(['攻擊', '技能', '道具', '防禦', '逃跑'], { ...BTN_MENU, x: 82, w: W - 86, cols: 2, colW: 44, rowH: 18, ox: 2, oy: 3, cancel: false, index: this.cmdIdx }); UI.remove(pr);
      this.idle = false; this.cmdIdx = r;
      if (r === 0) return { type: 'move', id: 'attack' };
      if (r === 1) { const m = yield* this.chooseMove(); if (m) return { type: 'move', id: m }; }
      else if (r === 2) { const it = yield* bagScreen('battle'); if (it) return { type: 'item', id: it }; }
      else if (r === 3) return { type: 'defend' };
      else if (r === 4) { if (this.F.boss) { yield* this.msg('不能從這場戰鬥中逃走！'); continue; } return { type: 'run' }; }
    }
  }
  *chooseMove() {
    const st = Game.st, list = learnedSkills(st);
    if (!list.length) { yield* this.msg('還沒有學會技能！（在選單的「技能」學習）'); return null; }
    let cur = Math.min(this.moveIdx || 0, list.length - 1); this.idle = true;
    const info = (x, m) => { const id = list[m.i], mv = skillMove(id); typeBadge(x, mv.t, 10, TB_Y + 4, 24); Font.draw(x, (mv.cat === '變' ? '輔助' : mv.cat === '物' ? '物理' : '魔法') + (mv.pow ? '·' + mv.pow : '') + ' Lv' + skillLv(id), 38, TB_Y + 2, UIC.muted, UIC.textSh); Font.drawR(x, 'MP ' + skillMP(id) + '／' + st.mp, W - 12, TB_Y + 2, skillMP(id) > st.mp ? UIC.bad : UIC.accent, UIC.textSh); };
    while (true) {
      const r = yield* choose(list.map(id => ({ t: MOVES[id].n, r: String(skillMP(id)), strip: TYPE_COL[MOVES[id].t], col: skillMP(id) > st.mp ? UIC.dis : undefined })), { ...BTN_MENU, visible: 2, index: cur, onMove: i => cur = i, drawExtra: info });
      if (r < 0) { this.idle = false; return null; }
      if (skillMP(list[r]) > st.mp) { yield* this.msg('MP不夠！'); continue; }
      this.idle = false; this.moveIdx = r; return list[r];
    }
  }
  effSpe(b) { return b.stats.spe * stageMul(b.stages.spe) * (b.status === 'par' ? 0.25 : 1); }
  order(ha, fa) {
    const pr = a => a.type === 'run' ? 7 : a.type === 'item' ? 6 : a.type === 'defend' ? 5 : a.type !== 'move' ? 1 : (MOVES[a.id].prio || 0);
    const ph = pr(ha), pf = pr(fa) + (this.F.trait === 'swift' ? 0.5 : 0);
    if (this.turn === 1 && this.H.stats.fx.first && ha.type === 'move') return [['H', ha], ['F', fa]];
    let heroFirst = ph !== pf ? ph > pf : (this.effSpe(this.H) !== this.effSpe(this.F) ? this.effSpe(this.H) > this.effSpe(this.F) : chance(0.5));
    return heroFirst ? [['H', ha], ['F', fa]] : [['F', fa], ['H', ha]];
  }
  foeChoose() {
    const F = this.F, H = this.H;
    if (F.charging) return { type: 'move', id: F.charging };
    if (F.rare && this.turn >= 3 && chance(0.45)) return { type: 'flee' };
    if (this.bb) { const b = this.bb; if (--b.cd <= 0) { b.cd = 3; return { type: 'move', id: 'm_axeSpin' }; } if (Game.st.money > 0 && b.steals < 2 && chance(0.25)) return { type: 'steal' }; return { type: 'move', id: pick(['m_gutSlash', 'm_knife', 'm_dirtyKick', F.stages.atk < 2 ? 'm_warCry' : 'm_gutSlash']) }; }
    if (this.cg) { const c = this.cg; if (this.turn % 4 === 0 && !c.mirror) return { type: 'mirror' }; const pl = c.flood ? ['m_crystalSpark', 'm_crystalSpark', 'm_prismRay', 'm_quake'] : ['m_prismRay', 'm_crystalShard', 'm_quake', 'm_rumble']; return { type: 'move', id: pick(pl) }; }
    if (F.trait === 'healer' && F.hp < F.maxhp * 0.5 && (F.heals || 0) < 2 && chance(0.6)) return { type: 'foeHeal' };
    let pool = F.moves.map(m => m.id);
    if (F.boss && this.phase2 && !this.cg) { pool = ['m_rockfall', 'm_quake', 'm_boulder']; if (this.fistCD <= 0) { this.fistCD = 3; return { type: 'move', id: 'm_golemFist' }; } this.fistCD--; }
    const w = pool.map(id => {
      const mv = MOVES[id]; let v = 10;
      if (mv.st) v = H.status ? 0 : 6;
      if (mv.stat && mv.stat.who === 'self') { const k = Object.keys(mv.stat).find(q => q !== 'who'); v = F.stages[k] >= 2 ? 1 : 5; }
      if (mv.stat && mv.stat.who === 'foe') { const k = Object.keys(mv.stat).find(q => q !== 'who'); v = H.stages[k] <= -2 ? 1 : 5; }
      if (mv.pow && (F.elite || F.boss)) { const rs = (H.stats.resist || {})[mv.t] || 0; v *= (1 - rs / 100) * (1 + mv.pow / 60); }
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
    let D = (phys ? t.stats.def : t.stats.spd) * stageMul(crit ? Math.min(0, ds) : ds); if (u.hero && phys && u.stats.fx.pierce) D *= 0.7; if (u.hero && phys && u.stats.pierceT) D *= 1 - u.stats.pierceT / 100;
    if (phys && u.status === 'brn') A *= 0.5;
    const base = Math.floor(Math.floor(Math.floor(2 * u.lv / 5 + 2) * mv.pow * A / D) / 50) + 2;
    const mult = t.hero ? 1 : famMult(mv.t, t); let m = mult * (rnd(85, 100) / 100); if (crit) m *= 1.5; if (!u.hero) m *= FOE_POWER; if (u.hero) { m *= HERO_POWER; const S = u.stats; if (S.elem && mv.t !== '一般') m *= 1 + S.elem / 100; if (S.fireUp && mv.t === '火') m *= 1 + S.fireUp / 100; if (S.boltUp && mv.t === '雷') m *= 1 + S.boltUp / 100; if (S.rage && u.hp < u.maxhp / 2) m *= 1.3; if (S.fx && S.fx.arcaneSurge && !phys && u.mp >= u.maxmp / 2) m *= 1.15; if (S.fx.lastStand) m *= 1 + 0.5 * (1 - u.hp / u.maxhp); for (const [ty, p] of u.stats.vs || []) if (t.fam === ty) m *= 1 + p / 100; }
    if (t.hero && t.stats.resist && t.stats.resist[mv.t]) m *= 1 - t.stats.resist[mv.t] / 100;
    return { dmg: Math.max(1, Math.floor(base * m)), mult, crit };
  }
  *useMove(u, t, id) {
    let mv = u.hero ? skillMove(id) : MOVES[id]; if (u.hero && id === 'attack' && isMagicKind(u.stats.wkind)) mv = { ...mv, cat: '特', fx: 'magicBolt' };
    if (u.hero && u.stats.welem && mv.t === '一般' && mv.pow && mv.cat === (isMagicKind(u.stats.wkind) ? '特' : '物')) mv = { ...mv, t: u.stats.welem };
    // can the user act?
    if (u.status === 'slp') {
      if (u.sleepT <= 0) { u.status = null; yield* this.msg(u.n + '醒過來了！'); }
      else { u.sleepT--; yield* FX.zzz.call(this, this.center(u)); yield* this.msg(u.n + '正在呼呼大睡。'); return; }
    }
    if (u.flinched) { yield* this.msg(u.n + '退縮了，無法行動！'); return; }
    if (u.status === 'par' && chance(0.25)) { yield* FX.spark.call(this, null, this.center(u)); yield* this.msg(u.n + '身體麻痺，無法行動！'); return; }
    if (mv.charge && u.charging !== id) {
      u.charging = id; yield* this.msg(u.n + '使用了' + mv.n + '！'); yield* (u.hero ? FX.charge : MFX.mcharge).call(this, this.center(u));
      yield* this.msg(u.n + (mv.chargeMsg || '正在凝聚大地之力！')); if (!this.warned) { this.warned = true; yield* this.msg(mv.warn || '（它的拳頭發出了危險的光芒……）'); } return;
    }
    if (u.charging === id) u.charging = null;
    if (u.hero && id !== 'attack') { const c = skillMP(id); if (u.mp < c) { yield* this.msg('MP不夠，' + u.n + '改用普通攻擊！'); return yield* this.useMove(u, t, 'attack'); } if (!(u.stats.fx.freeCast && chance(0.3))) u.mp -= c; else yield* this.msg('魔力循環！沒有消耗MP。', { hold: 16 }); }
    const utb = new TextBox(u.n + '使用了' + mv.n + '！', { style: 'battle', keep: true }); UI.push(utb); while (!utb.done) { utb.update(); yield; } yield* wait(10); const flourish = u.hero && id !== 'attack'; if (flourish) yield* heroCast.call(this, u, mv, id, t);
    // accuracy
    const selfTarget = !mv.pow && mv.stat && mv.stat.who === 'self' || mv.heal;
    if (!selfTarget && mv.acc && !chance(hitChance(u, t, mv))) { yield* wait(10); UI.remove(utb); yield* this.msg(mv.pow ? u.n + '的攻擊沒有打中！' : '但是失敗了！'); return; }
    if (mv.pow) {
      const U0 = this.center(u), T0 = this.center(t); const r = this.calcDamage(u, t, mv); const shock = mv.t === '雷' && t.wet > 0, ignite = mv.t === '火' && t.tangle > 0, steam = mv.t === '水' && t.status === 'brn';
      yield* this.playFx(mv.fx, u, t); if (flourish) yield* heroImpact.call(this, T0, mv, r, id, u); UI.remove(utb);
      let dmg = r.dmg; if (shock || ignite) dmg = Math.floor(dmg * 1.5); if (steam) dmg = Math.floor(dmg * 1.3); if (ignite || steam) yield* FX[ignite ? 'ignite' : 'steam'].call(this, U0, T0); if (this.cg && !t.hero && this.cg.shards > 0) dmg = Math.max(1, Math.floor(dmg * 0.6)); const mirrored = this.cg && !t.hero && this.cg.mirror && mv.cat === '特'; if (mirrored) dmg = Math.max(1, Math.floor(dmg * 0.5)); if (t.shield > 0) dmg = Math.max(1, Math.floor(dmg * 0.6)); if (t.defending) dmg = Math.max(1, Math.floor(dmg / 2));
      dmg = Math.min(dmg, t.hp); let endured = false; if (t.hero && t.stats.fx.endure && !this.endured && dmg >= t.hp && t.hp > 1) { dmg = t.hp - 1; this.endured = endured = true; } t.hp -= dmg;
      Sound.sfx(r.mult > 1 ? 'hitSuper' : r.mult < 1 ? 'hitWeak' : 'hit'); if (r.crit) Sound.sfx('crit');
      yield* this.impact(t, r.mult > 1 || r.crit ? 2 : r.mult < 1 ? 0 : 1);
      yield* this.animHP(t);
      if (r.crit) yield* this.msg('擊中要害！');
      if (r.mult > 1) yield* this.msg('打中弱點！'); else if (r.mult < 1) yield* this.msg('被抵抗了……');
      if (t.defending) yield* this.msg(t.n + '的防禦擋下了一半的傷害！');
      if (endured) yield* this.msg(t.n + '咬緊牙關撐住了！（不屈）');
      if (mirrored && u.hp > 0) { const rf = Math.min(u.hp - 1 > 0 ? u.hp - 1 : u.hp, Math.max(1, Math.floor(dmg * 0.6))); u.hp -= rf; this.blinkH = 12; this.spawn({ k: 'line', x1: T0.x, y1: T0.y, x2: U0.x, y2: U0.y, c: '#c8f4ff', w: 3, grow: 3, life: 12 }); yield* this.animHP(u); yield* this.msg('魔法被鏡面反射了！' + u.n + '受到了' + rf + '點傷害！'); }
      if (this.cg && !t.hero && this.cg.shards > 0 && dmg > 0) { this.cg.shards = Math.max(0, this.cg.shards - (mv.cat === '物' ? 2 : 1)); Sound.sfx('rock'); this.sparks(T0.x, T0.y, 10, ['#c8f4ff', '#80c0ff'], 2.5); yield* this.msg(this.cg.shards ? '擊碎了一塊水晶碎片！（剩下' + this.cg.shards + '塊）' : '水晶碎片全部被擊碎了！'); }
      if (this.cg && !t.hero && t.hp > 0) { const c = this.cg; if (c.stage < 1 && t.hp < t.maxhp * 0.7) { c.stage = 1; c.shards = 2; Sound.sfx('charge'); yield* this.msg('水晶碎片浮了起來，環繞著' + t.n + '！'); yield* this.msg('（碎片還在時，傷害會被減弱，而且它會回復。攻擊它就能擊碎碎片，物理攻擊一次能打碎兩塊！）'); } if (c.stage < 2 && t.hp < t.maxhp * 0.35) { c.stage = 2; c.flood = true; Sound.sfx('water'); this.shake = 30; yield* this.msg('水道的牆壁裂開，大水湧了進來！'); yield* this.msg('（每回合都會全身濕透……小心雷擊！）'); } }
      if (u.hero && t.hp > 0 && u.stats.fx.double && mv.cat === '物' && chance(0.25)) { const d2 = Math.min(t.hp, Math.max(1, Math.floor(dmg * 0.5))); yield* this.lunge(u, 8, 2); t.hp -= d2; Sound.sfx('hit'); yield* this.impact(t, 0); yield* this.animHP(t); yield* this.msg('連擊！追加了' + d2 + '點傷害！', { hold: 24 }); }
      if (t.hero && !u.hero && t.stats.fx.thorns && u.hp > 0 && dmg > 0) { const d3 = Math.min(u.hp, Math.max(1, Math.floor(dmg * 0.25))); u.hp -= d3; this.blinkF = 12; yield* this.animHP(u); yield* this.msg('荊棘反彈了' + d3 + '點傷害！', { hold: 24 }); }
      if (u.hero && u.stats.fx.cleave && mv.cat === '物' && t.hp > 0 && chance(0.3)) { yield* this.msg('劈裂！', { hold: 16 }); yield* this.statChange(t, { def: -1 }); }
      if (u.hero && u.stats.fx.fervor && (this.fervor || 0) < 3) { this.fervor = (this.fervor || 0) + 1; const fk = mv.cat === '物' ? 'atk' : 'spa'; u.stages[fk] = Math.min(3, u.stages[fk] + 1); yield* this.msg('狂熱！' + (fk === 'atk' ? '物攻' : '魔攻') + '提升了！', { hold: 20 }); }
      if (u.hero && id === 'attack' && u.stats.fx.manaSiphon && u.mp < u.maxmp) { u.mp = Math.min(u.maxmp, u.mp + 4); yield* this.msg('吸魔！回復了4點MP。', { hold: 16 }); }
      if (u.hero && u.stats.fx.stormMark && t.hp > 0 && chance(0.15)) yield* this.inflict(t, 'par', true);
      if (t.hero && t.defending && t.stats.counter && t.hp > 0 && u.hp > 0) { const c2 = this.calcDamage(t, u, t.stats.welem ? { ...MOVES.slash, t: t.stats.welem } : MOVES.slash), cd = Math.min(u.hp, Math.max(1, Math.floor(c2.dmg * 0.7))); yield* this.lunge(t, 10, 3); u.hp -= cd; Sound.sfx('hit'); yield* this.impact(u, 1); yield* this.animHP(u); yield* this.msg(t.n + '趁勢反擊！'); }
      if (shock) { t.wet = 0; Sound.sfx('thunder'); yield* this.msg('潮濕的身體導電了！' + t.n + '感電了！'); if (t.hp > 0) yield* this.inflict(t, 'par', true); }
      else if (mv.t === '水' && t.hp > 0) { const was = t.wet > 0; t.wet = 3; if (!was) yield* this.msg(t.n + '全身濕透了！'); }
      else if (mv.t === '火' && t.wet > 0) { t.wet = 0; yield* this.msg('熱氣蒸乾了' + t.n + '身上的水。'); }
      if (ignite) { t.tangle = 0; Sound.sfx('fire'); yield* this.msg('纏繞的藤蔓燒了起來！燎原！'); if (t.hp > 0) yield* this.inflict(t, 'brn', true); }
      else if (mv.t === '草' && t.hp > 0 && !t.tangle) { t.tangle = 3; yield* this.msg(t.n + '被藤蔓纏住了！（怕火）', { hold: 24 }); }
      if (steam) { if (t.status === 'brn') t.status = null; yield* this.msg('水碰到火焰，蒸氣爆發了！'); }
      if (u.hero && u.stats.drain && dmg > 0 && u.hp > 0 && u.hp < u.maxhp) { const hv = Math.max(1, Math.floor(dmg * u.stats.drain / 100)); u.hp = Math.min(u.maxhp, u.hp + hv); yield* this.animHP(u); yield* this.msg('荊棘吸取了' + hv + '點HP！', { hold: 24 }); }
      if (mv.drain && dmg > 0 && u.hp < u.maxhp) { u.hp = Math.min(u.maxhp, u.hp + Math.max(1, Math.floor(dmg * mv.drain))); yield* FX.drainBack.call(this, this.center(t), this.center(u)); yield* this.animHP(u); yield* this.msg('從' + t.n + '身上吸取了養分！'); }
      if (mv.recoil) { u.hp = Math.max(0, u.hp - Math.max(1, Math.floor(dmg * mv.recoil))); yield* this.animHP(u); yield* this.msg(u.n + '受到了反作用力的傷害！'); }
      if (t.hp > 0 && mv.eff && chance(mv.eff.p / 100)) {
        if (mv.eff.st) yield* this.inflict(t, mv.eff.st, true);
        if (mv.eff.stat) yield* this.statChange(t, mv.eff.stat);
        if (mv.eff.flinch) t.flinched = true;
      }
      if (!t.hero && t.trait === 'berserk' && !t.raged && t.hp > 0 && t.hp < t.maxhp * 0.4) { t.raged = 1; this.tintF = { c: '#ff3020', a: 0.5 }; yield* wait(12); this.tintF = null; yield* this.msg(t.n + '被激怒了！'); yield* this.statChange(t, { atk: 2 }); }
      if (!t.hero && this.bb && !this.bb.called && t.hp > 0 && t.hp < t.maxhp * 0.5) { this.bb.called = true; this.bb.gang = 4; Sound.sfx('exclaim'); yield* this.msg(t.n + '吹響了口哨！'); yield* this.msg('手下們從暗處衝了出來！'); yield* this.msg('（手下每回合會丟飛刀。選擇「防禦」可以擋下。）'); }
      if (!t.hero && t.boss && !this.bb && !this.cg && !this.phase2 && t.hp > 0 && t.hp < t.maxhp * 0.5) yield* this.bossPhase2();
      if (!t.hero && t.boss && !this.bb && !this.cg && this.phase2 && !this.collapse && t.hp > 0 && t.hp < t.maxhp * 0.25) { this.collapse = true; Sound.sfx('quake'); this.shake = 40; yield* this.msg(t.n + '猛力撞擊地面！'); yield* this.msg('遺跡開始崩塌了！每回合都會有落石掉下來！'); yield* this.msg('（選擇「防禦」就能擋住落石。）'); }
      return;
    }
    // status moves
    UI.remove(utb);
    if (mv.shield && mv.heal) { yield* (FX[mv.fx] || FX.heal).call(this, this.center(u)); u.shield = mv.shield; u.hp = Math.min(u.maxhp, u.hp + Math.floor(u.maxhp * mv.heal)); yield* this.animHP(u); yield* this.msg(u.n + '被神聖的領域包圍了！HP恢復，並獲得了護盾！'); return; }
    if (mv.hpCost) { const c = Math.max(1, Math.floor(u.maxhp * mv.hpCost)); if (u.hp <= c) { yield* this.msg('但是' + u.n + '的HP不夠了！'); return; } u.hp -= c; yield* this.animHP(u); }
    if (u.hero && id !== 'attack' && (mv.shield || mv.heal || mv.stat && mv.stat.who === 'self')) heroBless.call(this, u, mv, id);
    if (mv.shield) { u.shield = mv.shield; yield* (FX[mv.fx] || FX.guard).call(this, this.center(u)); yield* this.msg(u.n + '展開了魔法護盾！'); return; }
    if (mv.heal) {
      if (u.hp >= u.maxhp) { yield* this.msg('但是' + u.n + '的HP已經全滿了！'); return; }
      yield* (FX[mv.fx] || FX.heal).call(this, this.center(u)); u.hp = Math.min(u.maxhp, u.hp + Math.floor(u.maxhp * mv.heal)); yield* this.animHP(u); yield* this.msg(u.n + '的HP恢復了！'); return;
    }
    if (mv.stat) {
      const who = mv.stat.who === 'self' ? u : t; const ch = { ...mv.stat }; delete ch.who;
      if (who === t) yield* this.playFx(mv.fx, u, t); else if (!u.hero) yield* (MFX[mv.fx] || MFX.mbuff).call(this, this.center(u), this.center(t), u, t); else yield* (FX[mv.fx] || FX.buff).call(this, this.center(u));
      yield* this.statChange(who, ch, true, mv.dur); return;
    }
    if (mv.st) { yield* this.playFx(mv.fx, u, t); yield* this.inflict(t, mv.st, false); }
  }
  *statChange(b, ch, fromMove, dur = 3) {
    b.stageT = b.stageT || {};
    for (const k in ch) {
      const v = ch[k]; const cur = b.stages[k];
      if ((v > 0 && cur >= 3) || (v < 0 && cur <= -3)) { b.stageT[k] = Math.max(b.stageT[k] || 0, dur); yield* this.msg(b.n + '的' + STAT_NAMES[k] + '已經無法再' + (v > 0 ? '提升' : '降低') + '了！（持續時間延長）'); continue; }
      b.stages[k] = clamp(cur + v, -3, 3); b.stageT[k] = dur;
      if (v > 0) { Sound.sfx('statUp'); yield* FX.statUpFx.call(this, this.center(b)); } else { Sound.sfx('statDown'); yield* FX.statDownFx.call(this, this.center(b)); }
      yield* this.msg(b.n + '的' + STAT_NAMES[k] + (Math.abs(v) >= 2 ? '大幅' : '') + (v > 0 ? '提升了！' : '降低了！') + '（' + dur + '回合）');
    }
  }

  *inflict(b, s, secondary) {
    if (b.status || (!b.hero && famOf(b) && famOf(b).immune.includes(s))) { if (!secondary) yield* this.msg(b.status === s ? b.n + '已經' + STATUS_NAME[s] + '了！' : '但是對' + b.n + '沒有效果……'); return; }
    b.status = s; if (s === 'slp') b.sleepT = rnd(1, 3);
    const fxn = { psn: 'psnFx', par: 'spark', slp: 'zzz', brn: 'burnFx' }[s]; yield* FX[fxn].call(this, null, this.center(b));
    yield* this.msg(b.n + { psn: '中毒了！', par: '麻痺了！可能會無法行動！', slp: '睡著了！', brn: '灼傷了！' }[s]);
  }
  *endTurn() {
    if (this.cg && this.F.hp > 0) { const c = this.cg; if (c.mirror) c.mirror--; if (c.shards > 0 && this.F.hp < this.F.maxhp) { this.F.hp = Math.min(this.F.maxhp, this.F.hp + Math.ceil(this.F.maxhp * 0.03)); yield* this.animHP(this.F); yield* this.msg('水晶碎片讓' + this.F.n + '回復了！', { hold: 20 }); } if (c.flood && this.H.hp > 0) { this.H.wet = 2; Sound.sfx('water'); yield* this.msg(this.H.n + '被大水淋得全身濕透！', { hold: 20 }); } }
    if (this.cfg.id === 'mossGiant' && Game.st.flags.q2res === 'stay' && !Game.st.flags.q2done && this.F.hp > 0 && this.H.hp > 0) { yield* FX.sting.call(this, this.center(this.H), this.center(this.F)); const d = Math.ceil(this.F.maxhp * 0.06); this.F.hp = Math.max(0, this.F.hp - d); this.blinkF = 12; yield* this.animHP(this.F); yield* this.msg('提姆射出了箭！造成' + d + '點傷害！', { hold: 24 }); }
    if (this.H.stats.fx.deathWard && !this.dwUsed && this.H.hp > 0 && this.H.hp < this.H.maxhp * 0.3) { this.dwUsed = true; this.H.shield = 3; yield* FX.barrier.call(this, this.center(this.H)); yield* this.msg('亡者守護發動了！獲得了護盾！', { hold: 24 }); }
    if (this.H.stats.mpRegen && this.H.hp > 0 && this.H.mp < this.H.maxmp) this.H.mp = Math.min(this.H.maxmp, this.H.mp + Math.max(1, Math.ceil(this.H.maxmp * this.H.stats.mpRegen / 100)));
    if (this.H.stats.fx.regen && this.H.hp > 0 && this.H.hp < this.H.maxhp) { this.H.hp = Math.min(this.H.maxhp, this.H.hp + Math.ceil(this.H.maxhp * 0.06)); yield* this.animHP(this.H); }
    if (this.bb && this.bb.gang > 0 && this.H.hp > 0 && this.F.hp > 0) { this.bb.gang--; yield* MFX.knives.call(this, this.center(this.F), this.center(this.H)); if (this.H.defending) yield* this.msg(this.H.n + '擋開了手下的飛刀！', { hold: 20 }); else { const d = Math.max(1, Math.floor(this.H.maxhp * BALANCE.gangKnife)); this.H.hp = Math.max(0, this.H.hp - d); this.blinkH = 12; yield* this.animHP(this.H); yield* this.msg('手下丟出了飛刀！受到' + d + '點傷害！', { hold: 20 }); if (this.H.hp <= 0) return; } if (!this.bb.gang) yield* this.msg('手下們見苗頭不對，逃走了。', { hold: 20 }); }
    for (const b of [this.H, this.F]) for (const k in b.stageT || {}) if (b.stageT[k] > 0 && --b.stageT[k] === 0 && b.stages[k]) { b.stages[k] = 0; yield* this.msg(b.n + '的' + STAT_NAMES[k] + '恢復原狀了。', { hold: 18 }); }
    for (const b of [this.H, this.F]) { if (b.tangle > 0) b.tangle--; if (b.wet > 0) b.wet--; if (b.shield > 0 && !--b.shield) yield* this.msg(b.n + '的魔法護盾消失了。', { hold: 24 }); }
    if (this.collapse && this.H.hp > 0 && this.F.hp > 0) { yield* FX.rock.call(this, null, this.center(this.H)); if (this.H.defending) yield* this.msg(this.H.n + '擋住了落石！'); else { const d = Math.max(1, Math.floor(this.H.maxhp / 10)); this.H.hp = Math.max(0, this.H.hp - d); this.blinkH = 12; yield* this.animHP(this.H); yield* this.msg(this.H.n + '被落石砸中了！'); if (this.H.hp <= 0) return; } }
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
    if (it.use === 'home') {
      st.bag[k]--; yield* this.msg(st.name + '舉起了歸鄉之羽！'); Sound.sfx('charge'); this.tintH = { c: '#ffffff', a: 0.8 }; yield* wait(16); this.tintH = null;
      Sound.sfx('run'); yield* this.msg('羽毛化成光芒，包住了' + st.name + '……'); Game.homeWarp = 1; return 'escaped';
    }
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
    const st = Game.st, F = this.F, sp = SPECIES[F.sp]; Game.st.wins = (st.wins || 0) + 1; const de = (st.dex || (st.dex = {}))[F.sp] || (st.dex[F.sp] = { seen: 1, won: 0 }); de.won++;
    Sound.play('victory');
    if (this.bb && this.bb.stolen) { st.money += this.bb.stolen; yield* this.msg('奪回了被搶走的' + this.bb.stolen + ' G！'); }
    const exp = Math.max(1, Math.floor(sp.exp * F.lv / 5 * (F.elite || F.boss ? 1.5 : 1) * (this.H.stats.fx.wisdom ? 1.5 : 1) * (this.cfg.pack ? 1.25 : 1) * expScale(st.lv, F.lv)));
    yield* this.gainExp(exp);
    const gold = Math.floor((F.boss ? 1000 : sp.gold * F.lv) * (this.H.stats.fx.fortune ? 1.5 : 1));
    if (gold) { st.money += gold; yield* this.msg(st.name + '得到了' + gold + ' G！'); }
    { const H = this.H, r = F.elite || F.boss ? 0.3 : 0.15, dh = Math.min(H.maxhp - H.hp, Math.ceil(H.maxhp * r)), dm = Math.min(H.maxmp - H.mp, Math.ceil(H.maxmp * r)); if (H.hp > 0 && (dh > 0 || dm > 0)) { H.hp += dh; H.mp += dm; yield* this.animHP(H); Sound.sfx('heal'); yield* this.msg('戰鬥結束，調整了呼吸。' + (dh ? 'HP+' + dh + ' ' : '') + (dm ? 'MP+' + dm : ''), { hold: 30 }); } }
    if (sp.mat && !F.elite && !F.boss && chance(0.5)) { st.bag[sp.mat] = (st.bag[sp.mat] || 0) + 1; yield* this.msg('得到了素材「' + ITEMS[sp.mat].n + '」！', { hold: 30 }); }
    const rpool = Game.ow && Game.ow.map && Game.ow.map.d.gearPool; if (F.rare && rpool) { const g = makeGear(pick(rpool), 3); Sound.jingle('item'); yield* this.msg(F.n + '掉落了' + gearName(g) + '！', { wait: true }); }
    const dropId = this.cfg.drop || sp.drop; if (dropId) { const g = makeGear(classGear(dropId), 4); Sound.jingle('item'); yield* this.msg(F.n + '掉落了' + gearName(g) + '！', { wait: true }); yield* this.msg(gearText(g) + '\n（可以在裝備畫面裝備）', { wait: true }); }
    const pool = Game.ow && Game.ow.map && Game.ow.map.d.gearPool; if (pool && !F.elite && !F.boss && chance(this.H.stats.fx.fortune ? 0.16 : 0.08)) { const g = makeGear(pick(pool), rollQuality()); Sound.jingle('item'); yield* this.msg(F.n + '掉落了' + gearName(g) + '！', { wait: true }); }
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
    st.skp = (st.skp || 0) + 2; st.tp = (st.tp || 0) + 1; st.mp = heroStats().mp; this.H.maxmp = st.mp; yield* this.msg('獲得了2點技能點和1點天賦點！MP也全部恢復了。', { hold: 40 });
    const nw = skillTreeOf(st.cls).filter(n => n.clv === st.lv); if (nw.length) yield* this.msg('可以學習新技能了：' + nw.map(n => MOVES[n.id].n).join('、') + '！（選單→技能）', { wait: true });
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
    case 'beam': { x.globalAlpha = a * 0.85; const g = x.createLinearGradient(p.x - p.w, 0, p.x + p.w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, p.c); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(p.x - p.w, p.y1 - p.h, p.w * 2, p.h); x.globalAlpha = 1; break; }
    case 'hex': { const r = lerp(p.r0, p.r1, p.t / p.life); x.globalAlpha = a; x.strokeStyle = p.c; x.lineWidth = 2; x.beginPath(); for (let i = 0; i <= 6; i++) { const an = i * Math.PI / 3 + Math.PI / 6, px = p.x + Math.cos(an) * r, py = p.y + Math.sin(an) * r * 0.9; if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); x.globalAlpha = 1; break; }
    default: { const f = MON_PK[p.k]; if (f) { x.save(); f(x, p, a); x.restore(); } break; }
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
  *armorBreak(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('slash'); this.spawn({ k: 'line', x1: T.x, y1: T.y - 28, x2: T.x, y2: T.y + 22, c: '#c8d0e0', w: 7, grow: 3, life: 14 }); this.spawn({ k: 'line', x1: T.x, y1: T.y - 28, x2: T.x, y2: T.y + 22, c: '#ffffff', w: 2, grow: 3, life: 16 }); yield* wait(5); Sound.sfx('rock'); for (let i = 0; i < 12; i++) this.spawn({ k: 'dot', x: T.x + rnd(-12, 12), y: T.y + rnd(-10, 6), vx: rnd(-20, 20) / 10, vy: -1.5 - Math.random(), g: 0.25, c: pick(['#9aa4b8', '#6a7488', '#d8dce8']), s: rnd(2, 3), life: 26 }); yield* wait(14); },
  *powerSlash(U, T, u) { this.spawn({ k: 'glow', x: U.x, y: U.y, r: 26, c: '#ffb040', life: 16 }); Sound.sfx('charge'); yield* wait(10); yield* this.lunge(u, 12, 3); Sound.sfx('slash'); for (const d of [1, -1]) { this.spawn({ k: 'line', x1: T.x - 20 * d, y1: T.y - 20, x2: T.x + 20 * d, y2: T.y + 20, c: '#ff9a30', w: 6, grow: 3, life: 14 }); this.spawn({ k: 'line', x1: T.x - 20 * d, y1: T.y - 20, x2: T.x + 20 * d, y2: T.y + 20, c: '#fff4c0', w: 2, grow: 3, life: 16 }); yield* wait(4); } this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30, c: '#ffc060', w: 2, life: 12 }); yield* wait(8); },
  *bladeStorm(U, T) { Sound.sfx('wind'); for (let i = 0; i < 8; i++) { const an = Math.random() * Math.PI, r = 24; this.spawn({ k: 'line', x1: T.x - Math.cos(an) * r, y1: T.y - Math.sin(an) * r, x2: T.x + Math.cos(an) * r, y2: T.y + Math.sin(an) * r, c: i % 2 ? '#ffffff' : '#a8e0ff', w: 2, grow: 2, life: 10 }); if (i % 2 === 0) Sound.sfx('slash'); yield* wait(3); } for (let i = 0; i < 4; i++) this.spawn({ k: 'arc', x: T.x, y: T.y, r: 18 + i * 4, a0: i * 1.5, c: '#e0f4ff', life: 16 }); yield* wait(12); },
  *reckless(U, T, u) { this.tintH = { c: '#ff3020', a: 0.5 }; yield* wait(8); this.tintH = null; yield* this.lunge(u, 16, 3); Sound.sfx('slash'); this.spawn({ k: 'flash', c: '#c01010', a: 0.35, life: 8 }); this.spawn({ k: 'line', x1: T.x - 26, y1: T.y + 20, x2: T.x + 26, y2: T.y - 22, c: '#e02020', w: 8, grow: 2, life: 16 }); this.spawn({ k: 'line', x1: T.x - 26, y1: T.y + 20, x2: T.x + 26, y2: T.y - 22, c: '#ffd0d0', w: 2, grow: 2, life: 18 }); this.shake = 12; yield* wait(14); },
  *inferno(U, T) { Sound.sfx('fire'); this.spawn({ k: 'flash', c: '#ff6010', a: 0.3, life: 10 }); for (let k = 0; k < 4; k++) { const x0 = T.x + (k - 1.5) * 14; this.spawn({ k: 'beam', x: x0, w: 6, y1: T.y + 26, h: 60, c: '#ff7a20', life: 22 }); for (let i = 0; i < 8; i++) this.spawn({ k: 'flame', x: x0 + rnd(-4, 4), y: T.y + 24 - rnd(0, 30), vy: -1.2 - Math.random(), s: rnd(3, 7), life: 20 + rnd(0, 10) }); yield* wait(5); } yield* wait(16); },
  *dawnBreak(U, T, u) { this.spawn({ k: 'beam', x: U.x, w: 10, y1: U.y + 20, h: 200, c: '#ffe070', life: 20 }); Sound.sfx('charge'); yield* wait(14); yield* this.lunge(u, 14, 3); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 22, ang: -0.6, c: '#fffbe0', c2: '#ffc030', w: 9, life: 16 }); this.spawn({ k: 'flash', c: '#fff4c0', a: 0.8, life: 10 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 44, c: '#ffe070', w: 3, life: 16 }); this.sparks(T.x, T.y, 18, ['#fff4c0', '#ffd040'], 3, 22); yield* wait(16); },
  *thunderstorm(U, T) { Sound.sfx('thunder'); this.spawn({ k: 'flash', c: '#101830', a: 0.5, life: 40 }); for (let i = 0; i < 30; i++) this.spawn({ k: 'dot', x: rnd(0, W), y: rnd(-20, 60), vx: -0.6, vy: 5, c: '#8ab0ff', s: 1, life: 30 }); for (let k = 0; k < 5; k++) { const pts = []; let px0 = T.x + rnd(-40, 40); for (let y = -4; y < T.y; y += 8) { pts.push([px0, y]); px0 += rnd(-7, 7); } pts.push([T.x + rnd(-8, 8), T.y]); this.spawn({ k: 'bolt', pts, life: 12 }); this.shake = 8; yield* wait(6); } this.sparks(T.x, T.y, 14, ['#fff8a0', '#a0c0ff'], 3); yield* wait(12); },
  *manaBurst(U, T) { Sound.sfx('charge'); this.projectile(U, T, 1, () => ({ k: 'circ', r: 4, c: '#a070ff', hl: '#ffffff' }), 0, 14); yield* wait(15); Sound.sfx('hitSuper'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 26 + i * 8, c: ['#e0c8ff', '#a070ff', '#6a40d0'][i], w: 2, life: 16 }); yield* wait(3); } this.sparks(T.x, T.y, 10, ['#c0a0ff', '#ffffff'], 2.5); yield* wait(10); },
  *guardStrike(U, T, u) { this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 12, r1: 18, c: '#80b8ff', life: 10 }); yield* wait(6); yield* this.lunge(u, 16, 4); Sound.sfx('hit'); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 26, c: '#a8d0ff', life: 12 }); this.star(T.x, T.y, '#c8e0ff'); yield* wait(10); },
  *holyLight(U) { Sound.sfx('heal'); this.spawn({ k: 'beam', x: U.x, w: 14, y1: U.y + 26, h: 200, c: '#fff0a0', life: 30 }); for (let i = 0; i < 16; i++) this.spawn({ k: 'dot', x: U.x + rnd(-14, 14), y: U.y + rnd(-20, 20), vy: -0.6, c: pick(['#fff4c0', '#ffffff', '#ffe070']), s: 2, life: 26 }); yield* wait(30); },
  *blaze(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('slash'); for (let i = 0; i < 3; i++) { const o = (i - 1) * 9; this.spawn({ k: 'line', x1: T.x - 20 + o, y1: T.y - 18, x2: T.x + 16 + o, y2: T.y + 18, c: '#ff4010', w: 5, grow: 2, life: 12 }); yield* wait(3); } Sound.sfx('fire'); this.spawn({ k: 'ring', x: T.x, y: T.y + 10, r0: 6, r1: 34, c: '#ff8030', w: 3, life: 18, fl: 0.45 }); for (let i = 0; i < 30; i++) { const an = i / 30 * Math.PI * 2; this.spawn({ k: 'flame', x: T.x + Math.cos(an) * 24, y: T.y + 10 + Math.sin(an) * 10, vy: -0.8, s: rnd(3, 6), life: 22 }); } yield* wait(20); },
  *barrier(U) { Sound.sfx('statUp'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 34 - i * 4, r1: 30 - i * 4, c: ['#a0d0ff', '#80b0ff', '#c8e8ff'][i], life: 28 - i * 4 }); yield* wait(4); } yield* wait(14); },
  *gale(U, T, u) { for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: U.x, y1: U.y - 6 + i * 6, x2: T.x, y2: T.y - 6 + i * 6, c: '#e8f4ff', w: 1, grow: 3, life: 8 }); yield* this.lunge(u, 20, 3); Sound.sfx('slash'); this.spawn({ k: 'line', x1: T.x - 18, y1: T.y + 10, x2: T.x + 18, y2: T.y - 10, c: '#ffffff', w: 3, grow: 1, life: 8 }); this.spawn({ k: 'arc', x: T.x, y: T.y, r: 16, a0: 0, c: '#c8e8ff', life: 12 }); yield* wait(10); },
  *peck(U, T, u) { yield* this.lunge(u, 6, 2); for (let i = 0; i < 3; i++) { Sound.sfx('hit'); this.spawn({ k: 'line', x1: T.x + rnd(-8, 8), y1: T.y - 14, x2: T.x + rnd(-4, 4), y2: T.y + 2, c: '#f8e070', w: 2, grow: 2, life: 8 }); this.star(T.x + rnd(-6, 6), T.y + rnd(-6, 6), '#ffffff', 8); yield* wait(4); } yield* wait(6); },
  *lick(U, T) { Sound.sfx('water'); for (let i = 0; i < 3; i++) this.spawn({ k: 'arc', x: T.x, y: T.y, r: 10 + i * 5, a0: 2 + i, c: '#f090c0', life: 16 }); yield* wait(16); },
  *tailWhip(U, T, u, t) { for (let i = 0; i < 3; i++) { this.spawn({ k: 'arc', x: U.x, y: U.y, r: 14, a0: i * 2, c: '#ffe0a0', life: 12 }); yield* wait(4); } yield* this.shakeB(t, 10, 2); },
  *waterGun(U, T) { Sound.sfx('water'); this.projectile(U, T, 10, () => ({ k: 'circ', r: 2, c: '#58a8f8', hl: '#ffffff' }), 1, 12); yield* wait(24); this.sparks(T.x, T.y, 10, ['#88c8ff', '#ffffff'], 2, 16, 0.15); yield* wait(8); },
  *rockSlide(U, T) { for (let i = 0; i < 6; i++) { const x0 = T.x + rnd(-28, 28); const p = this.spawn({ k: 'img', img: ROCK_IMG, x: x0, y: -10, life: 16 }); p.upd = q => { q.y = Math.min(T.y + 10, q.y + 7); }; yield* wait(4); Sound.sfx('rock'); this.shake = 6; for (let k = 0; k < 3; k++) this.spawn({ k: 'circ', x: x0 + rnd(-6, 6), y: T.y + 14, r: rnd(3, 6), c: '#b8ac98', vy: -0.3, life: 20 }); } yield* wait(14); },
  *megaDrain(U, T) { Sound.sfx('leaf'); for (let i = 0; i < 20; i++) { const an = i / 20 * Math.PI * 2; const p = this.spawn({ k: 'dot', x: T.x + Math.cos(an) * 30, y: T.y + Math.sin(an) * 30, c: pick(['#9ae070', '#d8f8a0']), s: 2, life: 22 }); p.upd = q => { q.x = lerp(q.x, T.x, 0.12); q.y = lerp(q.y, T.y, 0.12); }; } this.spawn({ k: 'glow', x: T.x, y: T.y, r: 26, c: '#60c040', life: 20 }); yield* wait(22); },
  *thunderWave(U, T) { Sound.sfx('buzz'); for (let i = 0; i < 4; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 30, c: '#f8e060', w: 1, life: 14 }); yield* wait(4); } yield* wait(8); },
  *focus(U) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 30, c: '#ffd060', life: 24 }); for (let i = 0; i < 12; i++) this.spawn({ k: 'dot', x: U.x + rnd(-16, 16), y: U.y + 20, vy: -1.2, c: '#ffe080', s: 2, life: 22 }); yield* wait(20); },
  *harden(U) { Sound.sfx('statUp'); for (let i = 0; i < 8; i++) this.spawn({ k: 'dot', x: U.x + rnd(-18, 18), y: U.y + rnd(-18, 18), c: '#c8c8d8', s: 3, life: 18 }); this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 22, r1: 22, c: '#b0b0c8', life: 16 }); yield* wait(18); },
  *ironWall(U) { Sound.sfx('quake'); this.shake = 8; for (let i = 0; i < 3; i++) { this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 40, r1: 30 - i * 3, c: ['#a08868', '#c8b090', '#806a50'][i], life: 22 }); yield* wait(5); } yield* wait(12); },
  *howl(U) { Sound.sfx('buzz'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y - 10, r0: 4, r1: 28, c: '#ff8060', w: 2, life: 14 }); yield* wait(5); } yield* wait(8); },
  *agility(U) { Sound.sfx('wind'); for (let i = 0; i < 10; i++) { const yy = U.y + rnd(-20, 20); this.spawn({ k: 'line', x1: U.x - 30, y1: yy, x2: U.x + 30, y2: yy, c: '#e8f0ff', w: 1, grow: 3, life: 10 }); } yield* wait(12); },
  *prismRay(U, T) { Sound.sfx('charge'); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 22, c: '#c8f4ff', life: 14 }); yield* wait(10); Sound.sfx('thunder'); const cols = ['#ff7070', '#ffd060', '#80f080', '#70c0ff', '#c080ff']; cols.forEach((c, i) => this.spawn({ k: 'line', x1: U.x, y1: U.y, x2: T.x + (i - 2) * 4, y2: T.y, c, w: 2, grow: 3, life: 16 })); this.spawn({ k: 'flash', c: '#ffffff', a: 0.5, life: 8 }); yield* wait(6); this.sparks(T.x, T.y, 14, cols, 2.5); yield* wait(12); },
  *smoke() { Sound.sfx('wind'); for (let i = 0; i < 30; i++) this.spawn({ k: 'circ', x: rnd(10, W - 10), y: rnd(20, BH - 20), r: rnd(6, 14), c: pick(['#d8d8d8', '#b8b8c0', '#f0f0f0']), life: 30 + rnd(0, 20), vy: -0.3 }); yield* wait(40); },
};
