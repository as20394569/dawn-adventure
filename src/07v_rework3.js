/* ===================== v21 battle side of rework 3 (04t) ===================== */
// talents: 弱點獵手 / 巨獸殺手 / 元素護體, and 斬鐵 against a broken foe
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) {
    const r = _cd.call(this, u, t, mv); if (!mv || !mv.pow) return r; let m = 1;
    if (u.hero && !t.hero) { const S = u.stats || {}; if (r.mult > 1 && S.weakUp) m *= 1 + S.weakUp / 100; if ((t.elite || t.boss) && S.bigUp) m *= 1 + S.bigUp / 100; if (mv.vsBroken && t.broken > 0) m *= mv.vsBroken; }
    if (t.hero && !u.hero && t.stats && t.stats.elemRes && ['火', '水', '草', '雷'].includes(mv.t)) m *= 1 - t.stats.elemRes / 100;
    if (m !== 1) r.dmg = Math.max(1, Math.floor(r.dmg * m)); return r;
  };
}
// 奧術洞察: magic crit
{ const _cr = critRate; critRate = function (u, mv) { let r = _cr(u, mv); if (u && u.hero && mv && mv.cat === '特' && u.stats && u.stats.magCrit) r += u.stats.magCrit / 100; return r; }; }
// 背水一戰: the talent works like the 不屈 gear effect
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (s.endureT) s.fx = { ...s.fx, endure: 1 }; return s; }; }
// 時空凍結: the frozen foe skips its next action
{ const _fc = Battle.prototype.foeChoose; Battle.prototype.foeChoose = function () { const F = this.F; if (F.frozenT > 0) { F.frozenT--; return { type: 'move', id: '__frozen' }; } return _fc.call(this); }; }
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    if (!u.hero && (id === '__frozen' || u._frozenNow)) { u._frozenNow = false; yield* this.msg(u.n + '被凍結在時空的縫隙裡，無法行動！'); return; }
    if (!u.hero) return yield* _um.call(this, u, t, id);
    const base = MOVES[id];
    if (base && base.timeStop && this._timeStopUsed) { yield* this.msg('時空之力還沒有恢復……（每場戰鬥只能用一次）'); return; }
    if (base && base.heroSoul) { const extra = Math.max(0, u.mp - skillMP(id)); base.pow = Math.min(200, 60 + extra * 3); }
    const mp0 = u.mp, save = u.stats && u.stats.mpSave && id !== 'attack' && chance(u.stats.mpSave / 100);
    let r; try { r = yield* _um.call(this, u, t, id); } finally { if (base && base.heroSoul) base.pow = 60; }
    if (this._castId !== id || !base) return r;
    if (save && u.mp < mp0) { u.mp = mp0; yield* this.msg('魔力循環！沒有消耗MP。', { hold: 16 }); }
    if (base.heroSoul && u.mp > 0) { u.mp = 0; yield* this.msg('燃盡了所有的MP！', { hold: 16 }); }
    if (base.parry && u.hp > 0) { u.defending = true; if (!u.stats.counter) { u.stats.counter = 1; u._parryTmp = 1; } Sound.sfx('statUp'); yield* this.msg(u.n + '擺出了見切的架勢！這回合受到的傷害減半，並會反擊。', { hold: 24 }); }
    if (base.timeStop && t.hp > 0) { this._timeStopUsed = true; t._frozenNow = true; Sound.sfx('charge'); this.tintF = { c: '#a8d8ff', a: 0 }; yield* tween(12, q => this.tintF.a = q * 0.7); this.shake = 10;
      const C = this.center(t); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: C.x, y: C.y, r: 8 + i * 10, c: '#c8ecff', life: 22 + i * 4 }); yield* wait(16); this.tintF = { c: '#a8d8ff', a: 0.35 };
      if (t.charging) { t.charging = null; yield* this.msg('蓄力被打斷了！'); } yield* this.msg(t.n + '被凍結在時空的縫隙裡！牠的下一次行動會被跳過。'); }
    return r;
  };
}
{ const _et = Battle.prototype.endTurn; Battle.prototype.endTurn = function* () {
    const H = this.H, F = this.F; if (H && H._parryTmp) { delete H.stats.counter; H._parryTmp = 0; }
    if (F && F._frozenNow && F.hp > 0) { F._frozenNow = false; F.frozenT = 1; } // it had already acted this turn: skip the next one instead
    if (F && !(F.frozenT > 0) && this.tintF && this.tintF.c === '#a8d8ff') this.tintF = null;
    return yield* _et.call(this);
  };
}
// TP: every 2 levels from Lv6 (levelUp in 07_battle reads this)
const tpGainAt = lv => lv >= 6 && lv % 2 === 0 ? 1 : 0;

/* ---------- save migration: refund removed skills and re-count talent points once ---------- */
function rework3Migrate(st) {
  if (!st) return null; const out = {};
  if ((st.skV || 1) < 3) {
    st.skV = 3; const tree = new Set(skillTreeOf(st.cls).map(n => n.id)), free = st.skFree || {}; let back = 0;
    for (const id of Object.keys(st.skills || {})) if (!tree.has(id)) { back += Math.max(0, (st.skills[id] || 0) - (free[id] ? 1 : 0)); delete st.skills[id]; delete free[id]; }
    const b = baseClassOf(st.cls); if (b && CLASS_FREE[b]) for (const id of CLASS_FREE[b]) grantSkill(id, st);
    if (back) { st.skp = (st.skp || 0) + back; out.sk = back; }
  }
  if ((st.talV || 1) < TALENT_V3) {
    const spent = Object.values(st.tal || {}).reduce((a, b) => a + b, 0), total = spent + (st.tp || 0), oldLv = Math.max(0, st.lv - 5), newLv = tpForLevel(st.lv);
    st.tal = {}; st.tp = Math.max(newLv, total - (oldLv - newLv)); st.talV = TALENT_V3; if (spent || total !== st.tp) out.tp = st.tp;
  }
  return Object.keys(out).length ? out : null;
}
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.talV = TALENT_V3; st.skV = 3; } return st; }; }
{ const _so = startOverworld; startOverworld = function (...a) {
    const st = Game.st; if (st && !st.talV) st.talV = 2; // pre-v19.2 saves were refunded by 07o already; count them as v2
    const res = rework3Migrate(st), ow = _so.apply(this, a);
    if (res && ow && ow.run) ow.run((function* () { yield* wait(24);
      yield* say('【系統更新】劍士系的屬性劍技改成純劍術（屬性改由武器決定），天賦樹擴充到18個天賦，天賦點改成Lv6起每2級+1點。');
      if (res.sk) yield* say('移除的舊技能已退回' + res.sk + '點技能點。新技能：燕返・迴旋斬・斬鐵・見切。');
      if (res.tp !== undefined) yield* say('天賦已全部重置，依新規則重新計算：目前有' + res.tp + '點天賦點。');
      yield* say('另外，裝備上的「對某族增傷」和「屬性減傷」取消了，改成會心率和最大HP。'); })());
    return ow;
  };
}

/* ---------- v22: 勇者之魂 gets its own animation (it shared 破曉斬's sunrise); the new sword skills get their own styles ---------- */
PAL.soul = ['#5ac8ff', '#e8fbff'];
HERO_PK.soulBlade = (x, p, a) => { // a giant spectral sword that drops onto the target
  const k = Math.min(1, p.t / 8), y = lerp(p.y0, p.y1, k * k), L = p.len, wd = p.w; x.globalAlpha = Math.min(1, a * 1.4);
  const g = x.createLinearGradient(p.x, y - L, p.x, y); g.addColorStop(0, 'rgba(232,251,255,0.1)'); g.addColorStop(0.6, 'rgba(140,220,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0.95)'); x.fillStyle = g;
  x.beginPath(); x.moveTo(p.x, y + 6); x.lineTo(p.x + wd / 2, y - 6); x.lineTo(p.x + wd / 2, y - L); x.lineTo(p.x - wd / 2, y - L); x.lineTo(p.x - wd / 2, y - 6); x.closePath(); x.fill();
  x.fillStyle = 'rgba(90,200,255,0.9)'; x.fillRect(p.x - wd * 1.6, y - L - 3, wd * 3.2, 4); x.fillRect(p.x - 2, y - L - 16, 4, 13); x.fillStyle = '#ffffff'; x.fillRect(p.x - 1, y - L + 2, 2, L - 12);
};
Object.assign(FX, {
  *heroSoul(U, T, u) {
    Sound.sfx('charge'); this.spawn({ k: 'pillar', x: U.x, y: U.y + 20, w: 18, h: 90, c: '#8ad8ff', life: 30 }); this.spawn({ k: 'glow', x: U.x, y: U.y, r: 34, c: '#5ac8ff', life: 30 });
    for (let i = 0; i < 26; i++) this.spawn({ k: 'mote', x: U.x + rnd(-18, 18), y: U.y + rnd(-4, 22), vy: -(0.6 + Math.random() * 1.2), s: 2, c: i % 3 ? '#8ad8ff' : '#ffffff', life: rnd(18, 30) });
    yield* wait(16);
    for (let i = 0; i < 14; i++) this.spawn({ k: 'mote', x: U.x + rnd(-14, 14), y: U.y + rnd(-20, 4), to: T, s: 2, c: i % 2 ? '#5ac8ff' : '#e8fbff', life: 20 });
    this.spawn({ k: 'soulBlade', x: T.x, y0: T.y - 150, y1: T.y + 14, len: 74, w: 12, life: 30 }); Sound.sfx('wind'); yield* wait(8);
    this.shake = 18; Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#c8ecff', a: 0.45, life: 8 });
    for (let i = 0; i < 3; i++) this.spawn({ k: 'shock', x: T.x, y: T.y + 18, r0: 6 + i * 6, r1: 48 + i * 14, c: i % 2 ? '#ffffff' : '#5ac8ff', life: 16 + i * 4 });
    this.sparks(T.x, T.y, 34, ['#8ad8ff', '#ffffff', '#5aa0ff'], 3.4, 26, 0.08); yield* wait(16);
  },
});
MOVES.heroSoul.fx = 'heroSoul';
Object.assign(SKILL_STYLE, {
  heroSoul: ['focus', 'nova', 'soul', 'hitSuper'], doubleSlash: ['draw', 'xcut', 'steel', 'slash'], whirlSlash: ['dash', 'multicut', 'wind', 'slash'],
  zantetsu: ['still', 'shatter', 'steel', 'crit'], parry: ['hex', null, 'steel'], timeStop: ['still', null, 'guard'],
});

/* ---------- v22: 魔刃千華 redesigned to match its text (「無數魔力之刃的三連擊」) ----------
   A fan of violet magic blades appears behind the hero on a rune circle, then flies at the foe in three volleys (one per hit),
   each volley ending in a burst of blade-petals; the last one blooms into a big flower of blades (千華). */
HERO_PK.mblade = (x, p, a) => {
  let X = p.sx, Y = p.sy + Math.sin((p.t + p.ph) / 3) * 1.2, ang = p.a0;
  if (p.t >= p.hold) { const k = Math.min(1, (p.t - p.hold) / p.fly), e = k * k; X = lerp(p.sx, p.tx, e); Y = lerp(p.sy, p.ty, e); ang = Math.atan2(p.ty - p.sy, p.tx - p.sx);
    if (k < 1) { x.globalAlpha = 0.45; x.strokeStyle = p.c; x.lineWidth = 1; x.beginPath(); x.moveTo(X, Y); x.lineTo(X - Math.cos(ang) * 14, Y - Math.sin(ang) * 14); x.stroke(); } }
  x.globalAlpha = p.t > p.hold + p.fly ? Math.max(0, 1 - (p.t - p.hold - p.fly) / 3) : Math.min(1, p.t / 4);
  x.save(); x.translate(X, Y); x.rotate(ang); x.fillStyle = p.c; x.beginPath(); x.moveTo(7, 0); x.lineTo(0, 2.2); x.lineTo(-6, 0.8); x.lineTo(-6, -0.8); x.lineTo(0, -2.2); x.closePath(); x.fill();
  x.fillStyle = '#ffffff'; x.fillRect(-4, -0.5, 9, 1); x.fillStyle = p.c2; x.fillRect(-8, -2, 2, 4); x.restore();
};
HERO_PK.bloom = (x, p, a) => { // a flower of blade-petals opening around a point
  const k = Math.min(1, p.t / p.grow), e = 1 - Math.pow(1 - k, 3), R = 4 + (p.R - 4) * e, rot = p.rot0 + (p.spin || 1) * p.t * 0.03; x.globalAlpha = Math.min(1, a * 1.5);
  for (let i = 0; i < p.n; i++) { const an = rot + i * Math.PI * 2 / p.n; x.save(); x.translate(p.x + Math.cos(an) * R * 0.55, p.y + Math.sin(an) * R * 0.55 * 0.8); x.rotate(an);
    x.fillStyle = p.c; x.beginPath(); x.moveTo(R * 0.55, 0); x.quadraticCurveTo(0, p.s * 0.6 * e, -R * 0.35, 0); x.quadraticCurveTo(0, -p.s * 0.6 * e, R * 0.55, 0); x.fill();
    x.fillStyle = p.c2; x.fillRect(-R * 0.25, -0.75, R * 0.7, 1.5); x.restore(); }
  x.fillStyle = p.c2; x.beginPath(); x.arc(p.x, p.y, 3 + 3 * e, 0, 7); x.fill();
};
HERO_PK.petal = (x, p, a) => { x.globalAlpha = a; x.save(); x.translate(p.x, p.y); x.rotate(p.rot + p.t * 0.2); x.fillStyle = p.c; x.beginPath(); x.ellipse(0, 0, p.s, p.s * 0.45, 0, 0, 7); x.fill(); x.fillStyle = '#ffffff'; x.fillRect(-p.s * 0.4, -0.5, p.s * 0.6, 1); x.restore(); };
// v22c: the damage lands volley by volley — hit 1 after the first volley (main FX), hits 2 and 3 in the multi-hit loop (07k → mv.hitFx),
// the bloom opens with the third hit. Blades of later volleys hover in the fan until their hit.
const AE_COL = ['#b890ff', '#e0c8ff', '#9a60ff'];
function aeLaunch(b, v, T) { const G = b._aeBlades && b._aeBlades[v]; if (!G) return; for (const p of G) { p.tx = T.x + rnd(-12, 12); p.ty = T.y + rnd(-14, 10); p.hold = p.t; p.life = p.t + p.fly + 4; } b._aeBlades[v] = null; }
function aeBurst(b, T, v) { Sound.sfx('slash'); b.spawn({ k: 'glow', x: T.x, y: T.y, r: 16 + v * 4, c: '#b890ff', life: 8 });
  for (let i = 0; i < 6; i++) { const an = i * Math.PI / 3 + v; b.spawn({ k: 'petal', x: T.x, y: T.y, vx: Math.cos(an) * 1.6, vy: Math.sin(an) * 1.2, rot: an, s: 4, c: i % 2 ? '#e0c8ff' : '#b890ff', life: 12 }); } }
function aeBloom(b, T) {
  Sound.sfx('hitSuper'); Sound.sfx('charge'); b.spawn({ k: 'flash', c: '#e8d8ff', a: 0.5, life: 10 }); b.shake = Math.max(b.shake, 14);
  b.spawn({ k: 'glow', x: T.x, y: T.y, r: 60, c: '#b890ff', life: 34 });
  b.spawn({ k: 'bloom', x: T.x, y: T.y, R: 58, n: 12, s: 13, c: '#a070ff', c2: '#f0e0ff', rot0: 0, grow: 10, life: 40 });
  b.spawn({ k: 'bloom', x: T.x, y: T.y, R: 32, n: 8, s: 10, c: '#d8b8ff', c2: '#ffffff', rot0: Math.PI / 8, grow: 8, life: 38, spin: -1 });
  b.spawn({ k: 'sigil', x: T.x, y: T.y, r: 46, c: '#b890ff', life: 32 });
  for (let i = 0; i < 3; i++) b.spawn({ k: 'shock', x: T.x, y: T.y + 10, r0: 10 + i * 8, r1: 70 + i * 16, c: i % 2 ? '#ffffff' : '#b890ff', life: 18 + i * 5 });
  for (let i = 0; i < 24; i++) { const an = i * Math.PI / 12; b.spawn({ k: 'petal', x: T.x + Math.cos(an) * 10, y: T.y + Math.sin(an) * 7, vx: Math.cos(an) * 3.4, vy: Math.sin(an) * 2.4, rot: an, s: 7, c: i % 2 ? '#f0e0ff' : '#a070ff', life: 26 }); }
}
Object.assign(FX, {
  *arcaneEdge(U, T, u) { // fan of blades + volley 1
    Sound.sfx('charge'); const n = 18; this._aeBlades = [[], [], []];
    this.spawn({ k: 'rune', x: U.x, y: U.y - 6, r: 30, sq: 0.5, c: '#a070ff', c2: '#e8d8ff', n: 12, poly: 6, dir: 1, life: 90 });
    for (let i = 0; i < n; i++) { const an = Math.PI * (1.08 + 0.84 * i / (n - 1)), r = 40 + (i % 2) * 10, v = i % 3;
      const p = this.spawn({ k: 'mblade', sx: U.x + Math.cos(an) * r, sy: U.y - 24 + Math.sin(an) * r * 0.6, tx: T.x, ty: T.y, a0: an + Math.PI, ph: i, hold: 9999, fly: 6, c: AE_COL[i % 3], c2: '#6a3ac8', life: 400 }) || this.fx[this.fx.length - 1];
      this._aeBlades[v].push(p); }
    yield* wait(14); aeLaunch(this, 0, T); yield* wait(6); aeBurst(this, T, 0); yield* wait(4);
  },
  *arcaneEdgeHit(U, T, u, i, hits) { // volleys 2 and 3 (the last one blooms)
    aeLaunch(this, i, T); yield* wait(6); aeBurst(this, T, i); if (i >= hits - 1) { aeBloom(this, T); yield* wait(8); } else yield* wait(3);
  },
});
MOVES.arcaneEdge.hitFx = 'arcaneEdgeHit';
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) { // blades that never got to fly (the foe fell early / a hit missed) dissolve
    const r = yield* _um.call(this, u, t, id);
    if (this._aeBlades) { for (const G of this._aeBlades) if (G) for (const p of G) { p.hold = p.t; p.tx = p.sx; p.ty = p.sy - 20; p.life = p.t + 8; } this._aeBlades = null; }
    return r;
  };
}
SKILL_STYLE.arcaneEdge = ['rune', 'pop', 'arcane', 'slash'];

/* ---------- v22d: slash skills looked too alike (thin white lines + a white flash). Each now has its own shape, colour and rhythm ----------
   燕返 teal V (down-sweep, then the return) · 雙刃連擊 twin green dagger stabs · 十字斬 big lingering steel X · 迴旋斬 a spinning ring around the foe
   劍刃風暴 a rising tornado of blades · 劍舞 purple afterimage cuts from five directions · 亂舞 a red storm of short stabs
   疾風刺 a long green thrust with wind rings · 斬鐵 a vertical cleave that splits the foe with sparks and metal shards
   盾擊 a blue shield imprint · 重盾衝撞 a ground shockwave and dust. Multi-hit skills play one beat per hit (hitFx). */
HERO_PK.arc = (x, p, a) => { // a sweeping blade arc
  const k = Math.min(1, p.t / (p.grow || 5)), d = p.a1 >= p.a0 ? 1 : -1, head = p.a0 + (p.a1 - p.a0) * k, tl = p.tail || 1.8;
  const from = d > 0 ? Math.max(p.a0, head - tl) : head, to = d > 0 ? head : Math.min(p.a0, head + tl); if (to - from < 0.02) return;
  x.globalAlpha = Math.min(1, a * 1.6); x.lineCap = 'round';
  for (const [c, w] of [[p.c, p.w], [p.c2 || '#ffffff', Math.max(1, p.w / 3)]]) { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.ellipse(p.x, p.y, p.r, p.r * (p.sq || 0.6), p.rot || 0, from, to); x.stroke(); }
};
const arcCut = (b, T, o) => b.spawn(Object.assign({ k: 'arc', x: T.x, y: T.y, r: 26, a0: 0, a1: 2, w: 4, c: '#ffffff', grow: 5, life: 14 }, o));
const slashBeat = (b, T, hits, c) => { b.spawn({ k: 'glow', x: T.x, y: T.y, r: 14, c, life: 8 }); for (let i = 0; i < hits; i++) b.spawn({ k: 'dot', x: T.x, y: T.y, vx: rnd(-20, 20) / 10, vy: rnd(-20, 10) / 10, c, s: 2, life: 10 }); };
Object.assign(FX, {
  *swallowCut(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('slash'); arcCut(this, { x: T.x, y: T.y - 4 }, { r: 28, a0: -2.8, a1: -0.3, rot: 0.5, c: '#3ac8b0', c2: '#e8fff8' });
    for (let i = 0; i < 5; i++) this.spawn({ k: 'streak', x: T.x - 24 + i * 9, y: T.y - 12 + i * 5, len: 7, c: '#8af0e0', vx: 1.6, life: 10 }); yield* wait(8); },
  *swallowHit(U, T, u, i) { Sound.sfx('slash'); arcCut(this, { x: T.x, y: T.y + 4 }, { r: 28, a0: 0.3, a1: 2.8, rot: -0.5, c: '#3ac8b0', c2: '#e8fff8' }); slashBeat(this, T, 6, '#8af0e0'); yield* wait(6); },
  *twinDagger(U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); for (const dy of [-6, 6]) { this.spawn({ k: 'line', x1: T.x - 22, y1: T.y + dy - 4, x2: T.x + 10, y2: T.y + dy + 2, c: '#5cd060', w: 5, grow: 3, life: 12 }); this.spawn({ k: 'line', x1: T.x - 22, y1: T.y + dy - 4, x2: T.x + 10, y2: T.y + dy + 2, c: '#ffffff', w: 2, grow: 3, life: 12 }); this.spawn({ k: 'star', x: T.x + 12, y: T.y + dy + 2, c: '#d8ffb0', life: 12 }); } this.spawn({ k: 'glow', x: T.x, y: T.y, r: 16, c: '#5cd060', life: 10 }); yield* wait(6); },
  *twinDaggerHit(U, T, u, i) { Sound.sfx('slash'); for (const dy of [-8, 8]) this.spawn({ k: 'line', x1: T.x + 22, y1: T.y + dy - 4, x2: T.x - 10, y2: T.y + dy + 2, c: '#9ae07a', w: 5, grow: 3, life: 12 }); for (const dy of [-8, 8]) this.spawn({ k: 'star', x: T.x - 12, y: T.y + dy + 2, c: '#ffffff', life: 12 }); slashBeat(this, T, 5, '#d8ffb0'); yield* wait(5); },
  *bigCross(U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('slash');
    for (const d of [1, -1]) { this.spawn({ k: 'line', x1: T.x - 30 * d, y1: T.y - 30, x2: T.x + 30 * d, y2: T.y + 28, c: '#9ab8e8', w: 5, grow: 4, life: 22 }); this.spawn({ k: 'line', x1: T.x - 30 * d, y1: T.y - 30, x2: T.x + 30 * d, y2: T.y + 28, c: '#ffffff', w: 2, grow: 4, life: 22 }); yield* wait(5); Sound.sfx('slash'); }
    this.spawn({ k: 'xcut', x: T.x, y: T.y, r: 34, c: '#86b4ff', life: 22 }); for (let i = 0; i < 4; i++) this.spawn({ k: 'star', x: T.x + (i % 2 ? 26 : -26), y: T.y + (i < 2 ? -24 : 24), c: '#e8f4ff', life: 14 }); yield* wait(8); },
  *whirlRing(U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('wind'); arcCut(this, T, { r: 30, a0: 0, a1: Math.PI * 2, tail: 3.2, grow: 8, c: '#72e3b0', c2: '#f0fff8', w: 4, life: 16 });
    for (let i = 0; i < 10; i++) { const an = i * Math.PI / 5; this.spawn({ k: 'dot', x: T.x + Math.cos(an) * 30, y: T.y + Math.sin(an) * 18, vx: -Math.sin(an) * 1.5, vy: Math.cos(an), c: '#bff5dc', s: 2, life: 12 }); } yield* wait(8); },
  *whirlHit(U, T, u, i) { Sound.sfx('wind'); arcCut(this, T, { r: 30 + i * 4, a0: i * 1.2, a1: i * 1.2 + Math.PI * 2, tail: 3.2, grow: 7, c: '#72e3b0', c2: '#f0fff8', w: 4, life: 14 }); slashBeat(this, T, 6, '#bff5dc'); yield* wait(6); },
  *bladeTornado(U, T, u) { Sound.sfx('wind'); for (let i = 0; i < 22; i++) { const an = i * 0.9, h = i * 3; this.spawn({ k: 'shard', x: T.x + Math.cos(an) * (10 + i), y: T.y + 26 - h, vx: -Math.sin(an) * 1.8, vy: -0.8, s: 5, spin: 0.5, c: i % 3 ? '#c8d8f0' : '#ffffff', life: 24 }); }
    for (let k = 0; k < 3; k++) { arcCut(this, { x: T.x, y: T.y + 20 - k * 18 }, { r: 20 + k * 6, a0: 0, a1: Math.PI * 2, tail: 2.6, grow: 10, c: '#9ab8e8', w: 2, life: 22 }); yield* wait(4); Sound.sfx('slash'); } yield* wait(10); },
  *shadowDance(U, T, u) { Sound.sfx('wind'); this.spawn({ k: 'dark', a: 0.35, life: 30 }); yield* this.lunge(u, 14, 2);
    this.spawn({ k: 'slit', x: T.x - 24, y: T.y, ang: -0.9, w: 3, h: 22, c: '#a070ff', life: 12 }); yield* wait(6); },
  *shadowDanceHit(U, T, u, i) { const an = [-0.9, 0.9, 0, 1.6, -1.6][i % 5], ox = [24, -20, 0, 18, -18][i % 5]; Sound.sfx('slash'); this.spawn({ k: 'slit', x: T.x + ox, y: T.y, ang: an, w: 3, h: 22, c: i % 2 ? '#d8b0ff' : '#8a3aff', life: 12 }); slashBeat(this, T, 4, '#c8a0ff'); yield* wait(5); },
  *redFlurry(U, T, u) { yield* this.lunge(u, 8, 2); Sound.sfx('slash'); for (let i = 0; i < 4; i++) { const an = rnd(0, 628) / 100; this.spawn({ k: 'line', x1: T.x + Math.cos(an) * 16, y1: T.y + Math.sin(an) * 14, x2: T.x - Math.cos(an) * 6, y2: T.y - Math.sin(an) * 5, c: '#ff6a5a', w: 2, grow: 2, life: 7 }); } yield* wait(4); },
  *redFlurryHit(U, T, u, i) { Sound.sfx('hit'); for (let k = 0; k < 3; k++) { const an = rnd(0, 628) / 100; this.spawn({ k: 'line', x1: T.x + Math.cos(an) * 16, y1: T.y + Math.sin(an) * 14, x2: T.x - Math.cos(an) * 6, y2: T.y - Math.sin(an) * 5, c: k % 2 ? '#ffffff' : '#ff6a5a', w: 2, grow: 2, life: 7 }); } this.spawn({ k: 'glow', x: T.x, y: T.y, r: 10, c: '#ff8a70', life: 6 }); yield* wait(3); },
  *windThrust(U, T, u) { Sound.sfx('wind'); yield* this.lunge(u, 20, 2); this.spawn({ k: 'line', x1: U.x, y1: U.y - 8, x2: T.x + 30, y2: T.y, c: '#5cd0a0', w: 4, grow: 3, life: 12 }); this.spawn({ k: 'line', x1: U.x, y1: U.y - 8, x2: T.x + 30, y2: T.y, c: '#ffffff', w: 1, grow: 3, life: 12 });
    for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x - i * 14, y: T.y + i * 10, r0: 4, r1: 16 - i * 2, c: '#9ae8c0', w: 2, life: 12 + i * 2 }); } yield* wait(10); },
  *cleave(U, T, u) { this.spawn({ k: 'flash', c: '#05060c', a: 0.35, life: 16 }); yield* wait(8); yield* this.lunge(u, 14, 2); Sound.sfx('crit');
    this.spawn({ k: 'line', x1: T.x, y1: T.y - 50, x2: T.x, y2: T.y + 34, c: '#ffb040', w: 5, grow: 3, life: 14 }); this.spawn({ k: 'line', x1: T.x, y1: T.y - 50, x2: T.x, y2: T.y + 34, c: '#ffffff', w: 2, grow: 3, life: 16 }); yield* wait(4);
    for (let i = 0; i < 10; i++) { const s = i % 2 ? 1 : -1; this.spawn({ k: 'shard', x: T.x + s * 3, y: T.y - 30 + i * 6, vx: s * (1 + Math.random() * 1.6), vy: rnd(-10, 6) / 10, s: 5, spin: 0.4, c: i % 3 ? '#c8c8d8' : '#ffd070', life: 20 }); }
    this.sparks(T.x, T.y, 16, ['#ffd070', '#ffffff', '#ff8a30'], 2.8, 16, 0.1); this.shake = 10; yield* wait(10); },
  *shieldImprint(U, T, u) { yield* this.lunge(u, 16, 3); Sound.sfx('hit'); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 6, r1: 24, c: '#86b4ff', life: 16 }); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 16, c: '#e8f4ff', life: 12 }); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 18, c: '#86b4ff', life: 10 }); yield* wait(8); },
  *groundBash(U, T, u) { this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 20, r1: 14, c: '#c8d8ff', life: 12 }); yield* wait(6); yield* this.lunge(u, 22, 2); Sound.sfx('rock'); this.shake = 12;
    for (let i = 0; i < 3; i++) this.spawn({ k: 'shock', x: T.x, y: T.y + 26, r0: 6 + i * 6, r1: 50 + i * 12, c: i % 2 ? '#e8d8b0' : '#b89060', life: 14 + i * 4 });
    for (let i = 0; i < 12; i++) this.spawn({ k: 'dot', x: T.x + rnd(-30, 30), y: T.y + 24, vx: rnd(-12, 12) / 10, vy: -rnd(4, 14) / 10, g: 0.06, c: i % 2 ? '#a88860' : '#d8c098', s: 3, life: 20 }); yield* wait(10); },
});
const SLASH_REDO = { doubleSlash: ['swallowCut', 'swallowHit', ['draw', 'none', 'steel', 'slash']], twinStrike: ['twinDagger', 'twinDaggerHit', ['dash', 'none', 'leaf', 'slash']], crossSlash: ['bigCross', null, ['draw', 'none', 'steel', 'crit']],
  whirlSlash: ['whirlRing', 'whirlHit', ['dash', 'none', 'wind', 'wind']], bladeStorm: ['bladeTornado', null, ['dash', 'none', 'wind', 'slash']], bladeDance: ['shadowDance', 'shadowDanceHit', ['dash', 'none', 'void', 'slash']],
  flurry: ['redFlurry', 'redFlurryHit', ['dash', 'none', 'blood', 'hit']], gale: ['windThrust', null, ['dash', 'none', 'wind', 'wind']], zantetsu: ['cleave', null, ['still', 'none', 'gold', 'crit']],
  guardStrike: ['shieldImprint', null, ['hex', 'none', 'guard', 'hit']], shieldBash: ['groundBash', null, ['hex', 'none', 'rock', 'rock']] };
for (const k in SLASH_REDO) { const [fx, hit, style] = SLASH_REDO[k]; if (!MOVES[k]) continue; MOVES[k].fx = fx; if (hit) MOVES[k].hitFx = hit; SKILL_STYLE[k] = style; }
