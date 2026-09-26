/* ===================== BATTLE ===================== */
let HERO_POWER = 1.45, BOSS_HP = 2.1, ELITE_HP = 1.1;
const BH = TB_Y, FOE_X = 104, FOE_Y = 42, HERO_X = 4, HERO_Y = 126;
function critRate(u, mv) { const base = u.hero ? (u.stats.crit || 5) / 100 : 1 / 16; return mv.crit ? base * 2 : base; }
function hitChance(u, t, mv) { let a = mv.acc; if (!a) return 1; if (u.hero) a += u.stats.hit || 0; if (t.hero) a -= t.stats.eva || 0; return clamp(a, 5, 100) / 100; }
const stageMul = s => s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
const STATUS_NAME = { psn: '中毒', par: '麻痺', slp: '睡眠', brn: '灼傷' };
const IMMUNE = { psn: '毒', brn: '火', par: '雷' };
const battleImgCache = {};
// battle sprites: rendered at a low native size, then scaled 3x (same chunky pixel look as the hero)
const FOE_NATIVE = { golem: 28 }, FOE_SCALE = 3, FOE_FOOT = 104;
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
  const c = mkCanvas(W, BH), x = c.getContext('2d');
  if (kind === 'ruins') {
    const bands = ['#3e3252', '#463a5c', '#4e4266', '#564a70', '#5e527a', '#665a84'];
    bands.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 12, W, 12); });
    for (let i = 4; i < W; i += 44) { x.fillStyle = '#342a44'; x.fillRect(i, 6, 18, 70); x.fillStyle = '#433756'; x.fillRect(i + 3, 6, 5, 70); x.fillStyle = '#2a2238'; x.fillRect(i - 2, 4, 22, 5); }
    x.fillStyle = '#8a7e6a'; x.fillRect(0, 72, W, BH - 72); x.fillStyle = '#7c7060';
    for (let y = 76; y < BH; y += 8) for (let i = ((y / 8) % 2) * 12; i < W; i += 24) x.fillRect(i, y, 22, 1);
    x.fillStyle = '#9a8e78'; for (let y = 80; y < BH; y += 16) x.fillRect(0, y, W, 1);
    x.fillStyle = '#6aa048'; for (const [a1, b1] of [[12, 150], [140, 120], [70, 176], [150, 180]]) { x.fillRect(a1, b1, 6, 2); x.fillRect(a1 + 2, b1 - 1, 2, 1); }
  } else {
    const sky = ['#78c0f0', '#88c8f0', '#98d0f0', '#a8d8f0', '#b8e0f0', '#c8e8f0'];
    sky.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 9, W, 9); });
    x.fillStyle = '#eef8fc'; for (const [a1, b1, w] of [[12, 12, 30], [100, 22, 40], [150, 8, 22]]) { x.fillRect(a1, b1, w, 4); x.fillRect(a1 + 4, b1 - 2, w - 8, 2); }
    x.fillStyle = '#5aa868'; for (let i = 0; i < W; i += 12) { const h = 6 + ((i * 7) % 5); x.fillRect(i, 56 - h, 12, h + 4); }
    x.fillStyle = '#4a9a58'; for (let i = 6; i < W; i += 12) { const h = 4 + ((i * 3) % 4); x.fillRect(i, 58 - h, 10, h + 2); }
    const field = ['#9ad880', '#94d47a', '#8ecc74', '#88c870', '#82c26a', '#7cbc64', '#76b660', '#70b05a', '#6aaa56', '#66a452', '#62a050', '#5e9c4e'];
    field.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 60 + i * 12, W, 12); });
    x.fillStyle = '#a8e090'; for (let y = 64; y < BH; y += 6) for (let i = (y * 13) % 29; i < W; i += 29) x.fillRect(i, y, 6, 1);
  }
  return c;
}
function buildPlatform(rx, ry, kind) {
  const c = mkCanvas(rx * 2 + 2, ry * 2 + 4), x = c.getContext('2d');
  const cols = kind === 'ruins' ? ['#5a5044', '#b0a488', '#9a8e74', '#c8bca0'] : ['#4a8a40', '#a8d888', '#88c070', '#c0e8a0'];
  pxEllipse(x, rx + 1, ry + 2, rx, ry, cols[0]); pxEllipse(x, rx + 1, ry + 1, rx - 1, ry - 1, cols[1]); pxEllipse(x, rx + 1, ry + 2, rx - 6, ry - 3, cols[2]); pxEllipse(x, rx - 8, ry - 1, rx * 0.5, ry * 0.35, cols[3]);
  return c;
}

class Battle {
  constructor(cfg) {
    this.cfg = cfg; this.kind = cfg.kind; this.result = null;
    const st = Game.st; const s = heroStats();
    this.F = makeFoe(cfg.sp, cfg.lv, cfg.kind);
    const H = this.H = { hero: true, n: st.name, lv: st.lv, t: null, stats: s, maxhp: s.hp, moves: st.moves, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, sleepT: st.sleepT ?? rnd(1, 3) };
    Object.defineProperty(H, 'hp', { get: () => st.hp, set: v => st.hp = v }); Object.defineProperty(H, 'status', { get: () => st.status, set: v => st.status = v });
    this.bg = buildBattleBG(cfg.bg); this.platF = buildPlatform(42, 9, cfg.bg); this.platH = buildPlatform(52, 11, cfg.bg);
    this.imgF = battleSprite(cfg.sp); this.foeTX = FOE_X + Math.min(0, W - 3 - (FOE_X + 32 + Math.ceil(this.imgF.bb.w / 2))); this.imgH = heroBattleImg(0, st.equip.weapon); this.imgH2 = heroBattleImg(1, st.equip.weapon);
    this.disp = { F: this.F.hp, H: st.hp, exp: st.exp };
    this.foeX = -80; this.heroX = W + 10; this.boxF = -120; this.boxH = W + 10; this.cover = 1;
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
  center(b) { return b.hero ? { x: this.heroX + 26, y: HERO_Y + 34 } : { x: this.foeX + 32, y: FOE_FOOT - Math.round(this.imgF.bb.h * 0.5) }; }
  /* ---------------- drawing ---------------- */
  draw(x) {
    const sx = this.shake > 0 ? rnd(-3, 3) : 0, sy = this.shake > 0 ? rnd(-2, 2) : 0;
    x.save(); x.translate(sx, sy);
    x.drawImage(this.bg, 0, 0);
    x.drawImage(this.platF, this.foeX + 32 - 43, FOE_Y + 50); x.drawImage(this.platH, this.heroX + 24 - 53, HERO_Y + 49);
    // foe
    const bob = this.idle && Math.floor(this.t / 16) % 2 ? 1 : 0;
    if (this.alphaF > 0 && !(this.blinkF > 0 && Math.floor(this.blinkF / 3) % 2)) {
      x.save(); x.beginPath(); x.rect(0, 0, W, FOE_Y + 66); x.clip(); x.globalAlpha = this.alphaF;
      const sq = this.squishF, im = this.imgF, fw = im.width, fh = im.height;
      const fx0 = Math.round(this.foeX + 32 - im.bb.cx + this.offF.x), fy0 = Math.round(FOE_FOOT - im.bb.bot + this.offF.y + this.sinkF);
      if (sq) x.drawImage(im, fx0 - sq, fy0 + sq * 2, fw + sq * 2, fh - sq * 2); else x.drawImage(im, fx0, fy0);
      if (this.tintF && this.tintF.a > 0) { x.globalAlpha = this.tintF.a * this.alphaF; x.drawImage(tinted(this.imgF, this.tintF.c), fx0, fy0); }
      x.restore();
    }
    if (!(this.blinkH > 0 && Math.floor(this.blinkH / 3) % 2)) {
      x.save(); x.beginPath(); x.rect(0, 0, W, BH); x.clip();
      const hi = (this.offH.x || this.offH.y) ? this.imgH2 : this.imgH;
      x.drawImage(hi, this.heroX + this.offH.x, HERO_Y + this.offH.y + this.sinkH + bob);
      if (this.tintH) { x.globalAlpha = this.tintH.a; x.drawImage(tinted(hi, this.tintH.c), this.heroX + this.offH.x, HERO_Y + this.offH.y + this.sinkH + bob); }
      x.restore();
    }
    for (const p of this.fx) drawParticle(x, p);
    this.drawBoxF(x); this.drawBoxH(x, bob);
    x.restore();
    drawWin(x, 0, BH, W, H - BH, 'battle');
    if (this.cover > 0) { x.fillStyle = '#000'; const h = Math.round(this.cover * (H / 2 + 1)); x.fillRect(0, 0, W, h); x.fillRect(0, H - h, W, h); }
  }
  drawBoxF(x) {
    const X = Math.round(this.boxF), Y = 6, F = this.F; if (X < -110) return;
    x.fillStyle = '#383840'; x.fillRect(X + 2, Y + 2, 106, 30); roundRect(x, X, Y, 106, 30, '#484858'); roundRect(x, X + 1, Y + 1, 104, 28, '#f8f8e8'); x.fillStyle = '#e0e0c8'; x.fillRect(X + 2, Y + 24, 102, 4);
    Font.draw(x, F.n + (F.elite ? '★' : ''), X + 6, Y - 1, UIC.text, UIC.textSh);
    Font.drawR(x, 'Lv' + F.lv, X + 102, Y - 1, UIC.text, UIC.textSh);
    if (F.status) statusBadge(x, F.status, X + 6, Y + 15);
    drawHPBar(x, X + 32, Y + 17, 48, this.disp.F / F.maxhp);
  }
  drawBoxH(x, bob) {
    const X = Math.round(this.boxH), Y = 142 + bob, st = Game.st; if (X > W) return;
    x.fillStyle = '#383840'; x.fillRect(X + 2, Y + 2, 100, 40); roundRect(x, X, Y, 100, 40, '#484858'); roundRect(x, X + 1, Y + 1, 98, 38, '#f8f8e8'); x.fillStyle = '#e0e0c8'; x.fillRect(X + 2, Y + 34, 96, 4);
    Font.draw(x, st.name, X + 6, Y - 1, UIC.text, UIC.textSh); Font.drawR(x, 'Lv' + st.lv, X + 96, Y - 1, UIC.text, UIC.textSh);
    if (st.status) statusBadge(x, st.status, X + 6, Y + 16);
    drawHPBar(x, X + 28, Y + 15, 48, this.disp.H / this.H.maxhp);
    Font.drawR(x, Math.ceil(this.disp.H) + '/' + this.H.maxhp, X + 96, Y + 21, UIC.text, UIC.textSh);
    const lo = expForLevel(st.lv), hi = expForLevel(st.lv + 1); drawExpBar(x, X + 26, Y + 35, 68, (this.disp.exp - lo) / (hi - lo));
    Font.draw(x, 'EXP', X + 5, Y + 28, '#4878c8', null);
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
  *lunge(b, dist = 10, frames = 5) { const o = b.hero ? this.offH : this.offF; const dx = b.hero ? dist : -dist, dy = b.hero ? -dist / 3 : dist / 3; yield* tween(frames, t => { o.x = dx * t; o.y = dy * t; }); yield* tween(frames, t => { o.x = dx * (1 - t); o.y = dy * (1 - t); }); o.x = 0; o.y = 0; }
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
    yield* parallel(tween(14, t => this.cover = 1 - t), tween(44, t => { const e = 1 - Math.pow(1 - t, 2); this.foeX = lerp(-80, this.foeTX, e); this.heroX = lerp(W + 10, HERO_X, e); }));
    this.cover = 0; Sound.cry(Object.keys(SPECIES).indexOf(this.cfg.sp) + 1, this.F.boss ? 0.7 : 1, this.F.boss ? 1.6 : 1);
    if (this.F.boss) { this.shake = 30; Sound.sfx('quake'); }
    yield* parallel(tween(14, t => this.boxF = lerp(-120, 4, t)), wait(4));
    const intro = this.F.boss ? this.F.n + '擋住了去路！' : this.F.elite ? '精英魔物' + this.F.n + '發動了攻擊！' : '野生的' + this.F.n + '跳出來了！';
    yield* this.msg(intro, { hold: 44 });
    yield* tween(14, t => this.boxH = lerp(W + 10, 74, t));
  }
  *chooseAction() {
    const st = Game.st;
    while (true) {
      this.idle = true;
      const r = yield* choose(['戰鬥', '背包', '防禦', '逃跑'], { x: 0, y: TB_Y, w: W, h: TB_H, cols: 2, colW: 80, rowH: 16, ox: 22, oy: 24, style: 'cmd', cancel: false, index: this.cmdIdx, title: '要讓' + st.name + '做什麼？' });
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
    let cur = Math.min(this.moveIdx, st.moves.length - 1);
    const info = { draw: x => { drawWin(x, 116, TB_Y, W - 116, TB_H, 'cmd'); const m = st.moves[cur], mv = MOVES[m.id]; Font.draw(x, 'PP', 124, TB_Y + 5, UIC.text, UIC.textSh); Font.drawR(x, m.pp + '/' + mv.pp, W - 8, TB_Y + 20, m.pp === 0 ? '#e04848' : m.pp <= mv.pp / 4 ? '#e08830' : UIC.text, UIC.textSh); typeBadge(x, mv.t, 129, TB_Y + 40, 34); } };
    UI.push(info); this.idle = true;
    while (true) {
      const r = yield* choose(st.moves.map(m => ({ t: MOVES[m.id].n, col: m.pp === 0 ? '#b0b0b8' : undefined })), { x: 0, y: TB_Y, w: 116, h: TB_H, cols: 2, colW: 50, rowH: 22, ox: 16, oy: 11, style: 'cmd', index: cur, onMove: i => cur = i });
      if (r < 0) { UI.remove(info); this.idle = false; return null; }
      if (st.moves[r].pp <= 0) { UI.remove(info); yield* this.msg('這個技能的PP已經用完了！'); UI.push(info); continue; }
      UI.remove(info); this.idle = false; this.moveIdx = r; return st.moves[r].id;
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
    yield* tween(10, t => this.boxF = lerp(4, -120, t));
    yield* this.msg((this.F.boss ? '' : this.F.elite ? '精英魔物' : '野生的') + this.F.n + '倒下了！', { hold: 40 });
  }
  *heroFaint() {
    Sound.stop(); Sound.sfx('faint'); yield* tween(24, t => this.sinkH = t * 64);
    yield* tween(10, t => this.boxH = lerp(74, W + 10, t));
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
    const win = { draw: x => { drawWin(x, 84, 26, 90, 122, 'menu'); rowsL.forEach(([n, b, a], i) => { const Y = 30 + i * 16; Font.draw(x, n, 94, Y, UIC.text, UIC.textSh); const d = a - b; Font.drawR(x, showTotal ? String(a) : d > 0 ? '+' + d : '—', 166, Y, showTotal ? UIC.text : d > 0 ? '#e05050' : '#a0a0a8', UIC.textSh); }); } };
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
