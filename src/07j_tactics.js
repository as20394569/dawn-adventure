/* ===================== v19 TACTICS: difficulty, break shields, smarter monster AI, phases, pressure effects =====================
   Player feedback: monster skills had no weight, some fights could be won with a fixed formula.
   - Break: elites / bosses / rares carry shield points. Weakness hits and critical hits chip them; at 0 the monster is BROKEN:
     it loses its next action (and a charged attack is cancelled) and takes more damage until the end of the next turn.
   - AI: killer instinct, reads a defending hero (uses the turn to buff / charge instead), dispels hero buffs, re-applies cured
     ailments, personality per species, HP phases for elites and bosses, frenzy (extra action every other turn) at the last phase.
   - Pressure: red name banner + screen dim before strong monster skills, hit-stop, shake and red flash scaled by damage taken,
     big damage numbers, a countdown + danger ring while a monster is charging. */
const DIFF = [
  { n: '普通', d: '標準的冒險。', hp: 1, pow: 1, brk: 0, ai: 0, drop: 0 },
  { n: '困難', d: '魔物HP+20%、攻擊+15%，更聰明、護盾+1。掉落品質提升。', hp: 1.2, pow: 1.15, brk: 1, ai: 1, drop: 1 },
  { n: '異界', d: '魔物HP+40%、攻擊+30%，最聰明、護盾+1。掉落品質大幅提升。', hp: 1.4, pow: 1.3, brk: 1, ai: 2, drop: 2 },
];
const diffOf = (st = Game.st) => DIFF[(st && st.diff) || 0];
const ngOf = (st = Game.st) => (st && st.ng) || 0;
const NG_LV = 8; // New Game+: monsters +8 Lv per cycle
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind) {
    const ng = ngOf(), D = diffOf(); const f = _mf(sp, lv + ng * NG_LV, kind), s = f.stats;
    const kh = D.hp * (1 + 0.25 * ng), kp = D.pow * (1 + 0.1 * ng);
    if (kh !== 1) { s.hp = Math.round(s.hp * kh); f.hp = f.maxhp = s.hp; } if (kp !== 1) for (const k of ['atk', 'spa']) s[k] = Math.round(s[k] * kp);
    return f;
  };
}

/* ---------- AI personalities: brute (damage first) / trick (ailments, debuffs) / guard (buffs, heals, counters) ---------- */
const AI_PROFILE = { mush: 'trick', thornMush: 'trick', flower: 'trick', bee: 'trick', caveSpider: 'trick', duskMoth: 'trick', ghostLamp: 'trick', wraith: 'trick', frog: 'trick', moonSprite: 'trick', voidEye: 'trick',
  pebble: 'guard', mossGiant: 'guard', croc: 'guard', thunderBeetle: 'guard', slime: 'guard', reedCrab: 'guard', riftKnight: 'guard', boneKnight: 'guard', crystalGolem: 'guard' };
const aiProfile = F => AI_PROFILE[F.sp] || (HD_RIG_OF && HD_RIG_OF[F.sp] && AI_PROFILE[HD_RIG_OF[F.sp]]) || 'brute';

/* ---------- a monster-only move for smart foes: wipe the hero's buffs ---------- */
MOVES.m_dominate = { n: '威壓', t: '一般', cat: '變', pp: 10, dispel: 1, cls: 'debuff', fx: 'm_dominate', foe: 1, d: '散發壓倒性的氣勢，消除對手所有的能力提升。' };
if (MON_CLASS.debuff && !MON_CLASS.debuff.includes('m_dominate')) MON_CLASS.debuff.push('m_dominate');
MFX.m_dominate = function* (U, T, u) {
  Sound.sfx('quake'); this.shake = 16;
  for (let i = 0; i < 3; i++) { mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 10, r1: 70, c: '#801028', life: 18 }); mSpawn(this, 'mjag', { x: T.x, y: T.y, r0: 30, r1: 6, c: '#ff4060', life: 14 }); yield* wait(7); }
  yield* wait(10);
};

/* ---------- break shields ---------- */
function tacInit(b) {
  if (b.tac) return; const F = b.F, D = diffOf(), st = Game.st;
  const base = F.boss ? 5 : F.elite ? 3 : F.rare ? 2 : 0;
  F.brkMax = base ? base + D.brk + (ngOf() ? 1 : 0) + (b.cfg.rematch ? 1 : 0) : 0; F.brk = F.brkMax; F.broken = 0; F.phase = 0;
  b.tac = { hist: [], pops: [], banner: null, dim: 0, dimT: 0, red: 0, brkFlash: 0, dispelCD: 0, cured: false, lastStatus: null };
  const dx = st.dex && st.dex[F.sp]; b.tac.rev = !!(dx && dx.rev);
}
Battle.prototype.revealWeak = function () { const st = Game.st, dx = st.dex && st.dex[this.F.sp]; if (dx) dx.rev = 1; this.tac.rev = true; };
Battle.prototype.popNum = function (b, n, col, tag) { const C = this.center(b); this.tac.pops.push({ x: C.x + rnd(-6, 6), y: C.y - (b.hero ? 2 : 30), s: String(n), c: col, tag, t: 0 }); };

{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) {
    const r = _cd.call(this, u, t, mv);
    if (!t.hero && t.broken > 0) r.dmg = Math.max(1, Math.floor(r.dmg * (t.boss ? 1.25 : 1.35)));
    if (u.hero && !t.hero) this._lastHit = r;
    return r;
  };
  const _im = Battle.prototype.impact; Battle.prototype.impact = function* (b, power) {
    tacInit(this); const T = this.tac;
    const dealt = Math.round((b.hero ? this.disp.H : this.disp.F) - b.hp);
    if (!b.hero) {
      const r = this._lastHit; this._lastHit = null; const F = this.F;
      if (r) {
        if (r.mult > 1 && !T.rev) this.revealWeak();
        const d = (r.mult > 1 ? 1 : 0) + (r.crit ? 1 : 0);
        if (d && F.brkMax && !F.broken && F.brk > 0) { F.brk = Math.max(0, F.brk - d); T.brkFlash = 12; Sound.sfx('rock'); if (F.brk === 0) this._brkPending = true; }
      }
      if (dealt > 0) this.popNum(b, dealt, r && r.mult > 1 ? '#ffd040' : r && r.crit ? '#ff9a50' : '#ffffff', r && r.mult > 1 ? '弱點' : r && r.crit ? '會心' : F.broken ? '破防' : null);
    } else if (dealt > 0) {
      const frac = dealt / b.maxhp; this.popNum(b, dealt, frac >= 0.25 ? '#ff5a5a' : '#ffb0a0', frac >= 0.25 ? '重擊' : null);
      this.shake = Math.max(this.shake, Math.round(8 + frac * 70)); if (frac >= 0.25) { T.red = 16; Sound.sfx('quake'); }
      T.stop = frac >= 0.15 ? 7 : 3; // hit-stop: everything holds for a few frames
    }
    yield* _im.call(this, b, power);
    if (T.stop) { const n = T.stop; T.stop = 0; this.hitStop = n; yield* wait(n); this.hitStop = 0; }
  };
}

/* ---------- telegraph before monster skills ---------- */
Battle.prototype.foeTelegraph = function* (u, id) {
  const mv = MOVES[id]; if (!mv || id === 'attack') return;
  if (u.status === 'slp' && u.sleepT > 0) return; if (u.flinched) return;
  const T = this.tac, release = u.charging === id, startCharge = mv.charge && !release;
  const strong = release || (mv.pow || 0) >= 75 || ((u.boss || u.elite) && (mv.pow || 0) >= 60) || id === 'm_dominate';
  T.banner = { s: mv.n, t: 0, life: strong ? 70 : 46, strong, charge: startCharge };
  if (!strong) return;
  Sound.sfx('charge'); T.dimT = 0.5; this.tintF = { c: '#ff2030', a: 0 };
  yield* tween(10, q => { this.tintF.a = q * 0.45; }); if (release) { this.shake = 12; Sound.sfx('quake'); }
  yield* tween(8, q => { this.tintF.a = 0.45 * (1 - q); }); this.tintF = null;
};

{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    tacInit(this);
    if (!u.hero && (id === '__stun' || u.broken > 0)) { this.tac.dimT = 0; yield* this.msg(u.n + '處於破防狀態，無法行動！'); return; }
    if (!u.hero) yield* this.foeTelegraph(u, id);
    if (id === 'm_dominate') { yield* this.dominate(u, t); this.tac.dimT = 0; return; }
    yield* _um.call(this, u, t, id);
    this.tac.dimT = 0;
    if (this._brkPending && this.F.hp > 0) { this._brkPending = false; yield* this.doBreak(); }
    const F = this.F; if (F.hp > 0 && this.H.hp > 0) yield* this.checkPhase();
  };
}
Battle.prototype.dominate = function* (u, t) {
  const utb = new TextBox(u.n + '使用了威壓！', { style: 'battle', keep: true }); UI.push(utb); while (!utb.done) { utb.update(); yield; }
  yield* MFX.m_dominate.call(this, this.center(u), this.center(t), u); UI.remove(utb);
  let n = 0; for (const k in t.stages) if (t.stages[k] > 0) { t.stages[k] = 0; if (t.stageT) t.stageT[k] = 0; n++; }
  yield* this.msg(n ? t.n + '的能力提升全部被消除了！' : t.n + '頂住了壓迫感！');
};
Battle.prototype.doBreak = function* () {
  const F = this.F, T = this.tac, C = this.center(F); F.broken = 2; T.brkFlash = 30;
  Sound.sfx('crit'); Sound.sfx('rock'); this.shake = 26; this.spawn({ k: 'flash', c: '#ffffff', a: 0.55, life: 8 });
  this.sparks(C.x, C.y, 26, ['#ffe070', '#ffffff', '#80c8ff'], 3.4, 26, 0.12);
  T.pops.push({ x: C.x, y: C.y - 44, s: 'BREAK!', c: '#ffd040', t: 0, big: 1 });
  if (this.hd && this.hd.ok) hdAnim(this, 'F', 'hurt', 30, true);
  yield* wait(16);
  yield* this.msg(F.n + '破防了！');
  if (F.charging) { F.charging = null; yield* this.msg('蓄力被打斷了！'); }
  if (!Game.st.flags.tutBreak) { Game.st.flags.tutBreak = 1; yield* this.msg('（破防中的魔物無法行動，受到的傷害也會提高。持續到下一回合結束。）'); }
};
Battle.prototype.checkPhase = function* () {
  const F = this.F; if (!(F.elite || F.boss) || this.bb || this.cg || this.cfg.sp === 'golem' && !this.cfg.rematch) return;
  const r = F.hp / F.maxhp, prof = aiProfile(F);
  if (F.phase < 1 && r < 0.6) {
    F.phase = 1; Sound.sfx('charge'); this.tintF = { c: '#ff6020', a: 0 }; yield* tween(14, q => this.tintF.a = q * 0.5); yield* tween(14, q => this.tintF.a = 0.5 * (1 - q)); this.tintF = null;
    yield* this.msg(F.n + '的眼神變了！'); yield* this.statChange(F, prof === 'guard' ? { def: 1 } : prof === 'trick' ? { spe: 1 } : { atk: 1 }, false, 4);
    const extra = PHASE_MOVES[F.sp]; if (extra && !F.moves.some(m => m.id === extra)) { F.moves.push({ id: extra }); yield* this.msg(F.n + '擺出了新的架勢！'); }
  }
  if (F.phase < 2 && r < 0.3) {
    F.phase = 2; Sound.sfx('quake'); this.shake = 30; this.tintF = { c: '#ff1020', a: 0 }; yield* tween(18, q => this.tintF.a = q * 0.6); yield* tween(18, q => this.tintF.a = 0.6 * (1 - q)); this.tintF = null;
    if (F.boss) { F.frenzy = true; yield* this.msg(F.n + '陷入了狂怒！'); if (!Game.st.flags.tutFrenzy) { Game.st.flags.tutFrenzy = 1; yield* this.msg('（狂怒：每兩回合會行動兩次！趁牠破防時一口氣打倒牠吧。）'); } }
    else { yield* this.msg(F.n + '拚上了最後的力氣！'); yield* this.statChange(F, { atk: 1, spa: 1 }, false, 5); }
  }
};
// extra signature moves unlocked at phase 1 (bosses / elites without a scripted fight)
const PHASE_MOVES = { wolf: 'm_rend', croc: 'm_tailSlam', flower: 'm_thornRain', mossGiant: 'm_rootCrush', boneKnight: 'm_darkSlash' };

/* ---------- AI ---------- */
{ const _ca = Battle.prototype.chooseAction; Battle.prototype.chooseAction = function* () {
    tacInit(this); const a = yield* _ca.call(this); this.tac.hist.push(a.type === 'move' ? a.id : a.type); return a;
  };
  const _or = Battle.prototype.order; Battle.prototype.order = function (ha, fa) { if (fa && fa.id === '__stun') return [['H', ha], ['F', fa]]; return _or.call(this, ha, fa); };
  const _fc = Battle.prototype.foeChoose; Battle.prototype.foeChoose = function () {
    tacInit(this); const F = this.F, H = this.H, T = this.tac;
    if (F.broken > 0) return { type: 'move', id: '__stun' };
    const base = _fc.call(this);
    if (base.type !== 'move' || F.charging || this.cg || (this.bb && base.id === 'm_axeSpin') || base.id === F.charging) return base;
    let a = tacAI(this, base);
    // a charged attack needs a breather: never two charges within 3 turns
    if (a.type === 'move' && MOVES[a.id] && MOVES[a.id].charge) { if (this.turn - (F.lastCharge ?? -9) < 3) { const alt = F.moves.map(m => m.id).filter(id => MOVES[id] && !MOVES[id].charge); if (alt.length) a = { type: 'move', id: pick(alt) }; } else F.lastCharge = this.turn; }
    return a;
  };
}
function tacAI(b, base) {
  const F = b.F, H = b.H, T = b.tac, D = diffOf(), prof = aiProfile(F);
  const smart = Math.min(1, (F.elite || F.boss ? 0.75 : 0.35) + D.ai * 0.15 + (ngOf() ? 0.1 : 0));
  const ids = F.moves.map(m => m.id).filter(id => MOVES[id]);
  const dmgMoves = ids.filter(id => MOVES[id].pow && !MOVES[id].charge), statusMoves = ids.filter(id => MOVES[id].st && !H.status && !(famOf(H) || { immune: [] }).immune.includes(MOVES[id].st));
  const selfBuffs = ids.filter(id => MOVES[id].stat && MOVES[id].stat.who === 'self' && Object.keys(MOVES[id].stat).some(k => k !== 'who' && F.stages[k] < 2));
  const debuffs = ids.filter(id => MOVES[id].stat && MOVES[id].stat.who === 'foe' && Object.keys(MOVES[id].stat).some(k => k !== 'who' && H.stages[k] > -2));
  const charges = ids.filter(id => MOVES[id].charge);
  const heroAct = T.hist[T.hist.length - 1], heroDef = heroAct === 'defend';
  if (T.dispelCD > 0) T.dispelCD--;
  const best = () => { let bi = base.id, bv = -1; for (const id of dmgMoves) { const mv = MOVES[id], rs = (H.stats.resist || {})[mv.t] || 0, v = mv.pow * (mv.acc || 100) / 100 * (1 - rs / 100); if (v > bv) { bv = v; bi = id; } } return bi; };
  // 1) killer instinct
  if (H.hp < H.maxhp * 0.35 && dmgMoves.length && chance(0.25 + 0.5 * smart)) return { type: 'move', id: best() };
  // 2) wipe stacked hero buffs
  const up = Object.values(H.stages).reduce((a, v) => a + Math.max(0, v), 0);
  if ((F.elite || F.boss) && up >= 2 && !T.dispelCD && chance(0.35 + 0.4 * smart)) { T.dispelCD = 3; return { type: 'move', id: 'm_dominate' }; }
  // 3) the hero is turtling this turn: don't waste a big hit on the guard
  if (heroDef && chance(0.6 * smart)) {
    if (charges.length && !F.charging) return { type: 'move', id: pick(charges) };
    const alt = [...selfBuffs, ...debuffs, ...statusMoves]; if (alt.length) return { type: 'move', id: pick(alt) };
  }
  // 4) re-apply an ailment the hero just cured
  if (T.cured && statusMoves.length && chance(0.5 * smart + 0.1)) { T.cured = false; return { type: 'move', id: pick(statusMoves) }; }
  // 5) personality
  if (prof === 'trick' && chance(0.3 * smart + 0.1)) { const alt = [...statusMoves, ...debuffs]; if (alt.length) return { type: 'move', id: pick(alt) }; }
  if (prof === 'guard' && F.hp < F.maxhp * 0.55 && chance(0.3 * smart + 0.1) && selfBuffs.length) return { type: 'move', id: pick(selfBuffs) };
  if (prof === 'brute' && chance(0.3 * smart) && dmgMoves.length) return { type: 'move', id: best() };
  return base;
}

/* ---------- timers, frenzy flag, break recovery ---------- */
{ const _et = Battle.prototype.endTurn; Battle.prototype.endTurn = function* () {
    yield* _et.call(this); tacInit(this); const F = this.F;
    if (F.broken > 0 && F.hp > 0 && --F.broken === 0) { F.brk = F.brkMax; this.tac.brkFlash = 16; if (this.hd && this.hd.ok) { this.hd.F.hold = false; this.hd.F.state = 'idle'; } yield* this.msg(F.n + '重新站穩了架勢！（護盾恢復）', { hold: 24 }); }
  };
  const _up = Battle.prototype.update; Battle.prototype.update = function () {
    _up.call(this); const T = this.tac; if (!T) return;
    if (T.lastStatus && !this.H.status) T.cured = true; T.lastStatus = this.H.status;
    T.dim += ((T.dimT || 0) - T.dim) * 0.15; if (T.red > 0) T.red--; if (T.brkFlash > 0) T.brkFlash--;
    if (T.banner && ++T.banner.t > T.banner.life) T.banner = null;
    for (const p of T.pops) p.t++; T.pops = T.pops.filter(p => p.t < (p.big ? 60 : 44));
  };
}

/* ---------- drawing: shields / weakness on the nameplate, charge countdown, banner, dim, damage numbers ---------- */
function drawShieldBadge(x, X, Y, n, broken, flash) {
  const c = broken ? '#ff5a5a' : flash ? '#ffffff' : '#9ab8e8';
  x.fillStyle = '#10141f'; x.fillRect(X, Y, 13, 14); x.fillRect(X + 1, Y + 14, 11, 1); x.fillRect(X + 3, Y + 15, 7, 1);
  x.fillStyle = c; x.fillRect(X + 1, Y + 1, 11, 11); x.fillRect(X + 2, Y + 12, 9, 1); x.fillRect(X + 4, Y + 13, 5, 1);
  x.fillStyle = broken ? '#5a1018' : '#2a3a5a'; x.fillRect(X + 2, Y + 2, 9, 9); x.fillRect(X + 3, Y + 11, 7, 1);
  Font.drawC(x, broken ? '×' : String(n), X + 7, Y - 1, broken ? '#ffd0d0' : '#ffffff', '#000000', 9);
}
{ const _bf = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) {
    _bf.call(this, x); if (!this.tac) tacInit(this); const F = this.F, T = this.tac; if (!T || this.boxF < -20 || this.alphaF <= 0) return;
    const w = 120, X = (W - w) / 2, py = 6, a = clamp((this.boxF + 30) / 34, 0, 1); x.globalAlpha = a;
    if (F.brkMax) { drawShieldBadge(x, X - 16, py + 9, F.brk, F.broken > 0, T.brkFlash > 0 && Math.floor(T.brkFlash / 3) % 2); }
    // weakness strip below the plate: hidden until the hero has hit a weakness of this species once
    const fam = FAMILIES[F.fam];
    if (fam && fam.weak.length) { const s = '弱 ' + (T.rev ? fam.weak.join('・') : '？'); const pe = plateExtra(); x.fillStyle = 'rgba(10,8,20,0.7)'; const tw = Font.width(s, 8) + 8; x.fillRect(X + 4, py + 33 + pe, tw, 11); Font.draw(x, s, X + 8, py + 32 + pe, T.rev ? '#ffd070' : UIC.muted, UIC.textSh, 8); }
    if (F.broken > 0) { const bl = Math.floor(this.t / 6) % 2; Font.drawC(x, '— 破防中 —', W / 2, py + 45 + plateExtra(), bl ? '#ffd040' : '#ff8a50', '#000000', 10); }
    else if (F.charging) { const bl = Math.floor(this.t / 8) % 2; Font.drawC(x, '蓄力中！下回合發動', W / 2, py + 45 + plateExtra(), bl ? '#ff5a5a' : '#ffb0a0', '#000000', 10); }
    x.globalAlpha = 1;
  };
  const _dr = Battle.prototype.draw; Battle.prototype.draw = function (x) {
    _dr.call(this, x); const T = this.tac; if (!T) return;
    // dim everything but the monster while a strong skill is coming
    if (T.dim > 0.02) { const C = this.center(this.F), g = x.createRadialGradient(C.x, C.y, 20, C.x, C.y, 120); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,0,6,' + (T.dim * 0.8).toFixed(3) + ')'); x.fillStyle = g; x.fillRect(0, 0, W, BH); }
    if (T.red > 0) { x.fillStyle = 'rgba(210,20,30,' + (T.red / 16 * 0.32).toFixed(3) + ')'; x.fillRect(0, 0, W, BH); }
    // danger ring under the hero while the monster charges
    if (this.F.charging && this.F.hp > 0 && !this.F.broken) { const p = (this.t % 40) / 40, cx = this.center(this.H).x, cy = HERO_FOOT - 3; x.save(); x.strokeStyle = 'rgba(255,50,60,' + (0.8 - p * 0.6).toFixed(2) + ')'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(cx, cy, 18 + p * 16, 5 + p * 4, 0, 0, Math.PI * 2); x.stroke(); x.restore(); }
    // skill banner (monster)
    if (T.banner) { const B = T.banner, k = Math.min(1, B.t / 6), fade = B.t > B.life - 10 ? (B.life - B.t) / 10 : 1, s = (B.charge ? '蓄力 ' : '▼ ') + B.s, fs = B.strong ? 11 : 9, tw = Font.width(s, fs) + 18, X = Math.round(W / 2 - tw / 2 * k), Y = 64;
      x.globalAlpha = clamp(fade, 0, 1); x.fillStyle = B.strong ? 'rgba(60,4,12,0.88)' : 'rgba(20,8,16,0.78)'; x.fillRect(X, Y, Math.round(tw * k), fs + 7); x.fillStyle = B.strong ? '#ff4050' : '#c05060'; x.fillRect(X, Y, Math.round(tw * k), 1); x.fillRect(X, Y + fs + 6, Math.round(tw * k), 1);
      if (k >= 1) Font.drawC(x, s, W / 2, Y + (B.strong ? 0 : -1), B.strong ? '#ffe0e0' : '#ffc8c8', '#000000', fs); x.globalAlpha = 1; }
    // damage numbers
    for (const p of T.pops) { const life = p.big ? 60 : 44, a = p.t > life - 12 ? (life - p.t) / 12 : 1, rise = p.big ? Math.min(10, p.t * 0.6) : Math.min(16, p.t * 1.2), sz = p.big ? 16 : 13, pop = p.t < 5 ? 1 + (5 - p.t) * 0.12 : 1;
      x.globalAlpha = clamp(a, 0, 1); const Y = p.y - rise; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) Font.drawC(x, p.s, p.x + dx, Y + dy, '#1a0a10', null, Math.round(sz * pop)); Font.drawC(x, p.s, p.x, Y, p.c, null, Math.round(sz * pop));
      if (p.tag) Font.drawC(x, p.tag, p.x, Y - 11, p.c, '#000000', 8); x.globalAlpha = 1; }
  };
}

/* ---------- v19 gear specials (04n) + class passives (04o) in battle ---------- */
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) {
    const r = _cd.call(this, u, t, mv); if (!u.hero || !mv || !mv.pow) return r; const S = u.stats, fx = S.fx || {}, phys = mv.cat === '物'; let m = 1;
    if (fx.predator && t.hp < t.maxhp * 0.3) m *= 1.3;
    if (fx.spellblade || S.spellblade) { const k = (S.spellblade ? 0.45 : 0.3); m *= phys ? (S.atk + S.spa * k) / Math.max(1, S.atk) : (S.spa + S.atk * k) / Math.max(1, S.spa); }
    if (S.assassin && this.turn === 1 && !r.crit) { r.crit = true; m *= 1.5; }
    if (S.venomous && t.status === 'psn') m *= 1 + S.venomous / 100;
    if (m !== 1) r.dmg = Math.max(1, Math.floor(r.dmg * m));
    return r;
  };
  const _es = Battle.prototype.effSpe; Battle.prototype.effSpe = function (b) { let v = _es.call(this, b); if (b.hero && b.stats.fx && b.stats.fx.swift) v *= 1.15; return v; };
  const _im = Battle.prototype.impact; Battle.prototype.impact = function* (b, power) {
    const H = this.H, F = this.F; if (!b.hero && H.stats.fx && H.stats.fx.breaker && this._lastHitPhys && F.brkMax && !F.broken && F.brk > 0 && chance(0.35)) { F.brk--; this.tac && (this.tac.brkFlash = 12); if (!F.brk) this._brkPending = true; }
    yield* _im.call(this, b, power);
  };
  const _cd2 = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) { const r = _cd2.call(this, u, t, mv); if (u.hero) this._lastHitPhys = mv && mv.cat === '物'; return r; };
  const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    const hp0 = t.hp, mv = u.hero ? (MOVES[id] ? skillMove(id) : null) : MOVES[id];
    yield* _um.call(this, u, t, id);
    if (!mv || !mv.pow || u.hp <= 0 || t.hp <= 0) return;
    const S = this.H.stats, fx = S.fx || {};
    if (u.hero && mv.cat === '物' && !t.status && (fx.poisonEdge || S.venomEdge) && chance(fx.poisonEdge && S.venomEdge ? 0.35 : 0.2)) { yield* this.inflict(t, 'psn', true); /* v24.1: players didn't know where the poison came from — explain once */
      const f = Game.st.flags; if (t.status === 'psn' && !f.tutVenom) { f.tutVenom = 1; yield* this.msg(S.venomEdge ? '（遊俠系的被動「毒刃」：物理攻擊有' + (fx.poisonEdge ? 35 : 20) + '%機率讓對手中毒。）' : '（裝備的「淬毒」效果：物理攻擊有20%機率讓對手中毒。）'); } }
    if (!u.hero && t.hero && t.hp === hp0 && (fx.shadowStep || S.shadowStep) && !(u.status === 'slp') && !u.flinched) {
      const c2 = this.calcDamage(t, u, t.stats.welem ? { ...MOVES.slash, t: t.stats.welem } : MOVES.slash), cd = Math.min(u.hp, Math.max(1, Math.floor(c2.dmg * 0.7)));
      yield* this.lunge(t, 10, 3); u.hp -= cd; Sound.sfx('slash'); yield* this.impact(u, 1); yield* this.animHP(u); yield* this.msg('殘影！' + t.n + '閃過攻擊並反擊！');
      if (u.hp <= 0) return;
    }
  };
  const _et = Battle.prototype.endTurn; Battle.prototype.endTurn = function* () {
    const H = this.H; if (H.defending && H.hp > 0 && H.stats.fx && H.stats.fx.mpGuard && H.mp < H.maxmp) { const g = Math.max(1, Math.round(H.maxmp * 0.1)); H.mp += g; yield* this.msg('靜心：回復了' + g + '點MP。', { hold: 16 }); }
    yield* _et.call(this);
  };
}
