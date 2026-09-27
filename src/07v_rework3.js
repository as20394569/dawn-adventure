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
