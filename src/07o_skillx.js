/* ===================== v19.2 battle side of the skill / talent rework (04q) ===================== */
{ const _hc = heroCast; heroCast = function* (u, mv, id, t) { this._castId = id; yield* _hc.call(this, u, mv, id, t); }; }
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    this._castId = null; const hp0 = u.hp, mv = u.hero && MOVES[id] ? skillMove(id) : null;
    if (mv && u.hero) this._shieldHit = mv.shieldHit || 0;
    yield* _um.call(this, u, t, id); this._shieldHit = 0;
    if (!mv || this._castId !== id || u.hp <= 0) return;
    const lv = mv.lv || 1;
    if (mv.critNext) { u.critNext = true; yield* this.msg(u.n + '集中了精神！下一次攻擊必定會心。', { hold: 20 }); }
    if (mv.rage && u.hp < hp0) { u.rageT = mv.rage + lv - 1; u.rageAt = this.turn; u.stages.spe = Math.min(3, u.stages.spe + 1); (u.stageT || (u.stageT = {})).spe = u.rageT; this.tintH = { c: '#ff3020', a: 0.45 }; yield* wait(10); this.tintH = null; yield* this.msg(u.n + '陷入了血怒！' + u.rageT + '回合內傷害+30%。', { hold: 22 }); }
    if (mv.smoke) { u.smokeT = mv.smoke + lv - 1; u.smokeAt = this.turn; yield* this.msg(u.n + '的身影變得模糊！' + u.smokeT + '回合內迴避+30%。', { hold: 22 }); }
    if (mv.mark && t.hp > 0) { t.markT = mv.mark + lv - 1; t.markAt = this.turn; Sound.sfx('statDown'); yield* this.msg(t.n + '被刻上了獵人印記！' + t.markT + '回合內受到的傷害+20%。', { hold: 22 }); }
  };
}
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) {
    const r = _cd.call(this, u, t, mv); if (!mv || !mv.pow) return r; let m = 1;
    if (u.hero && u.critNext && !this._estimating) { u.critNext = false; if (!r.crit) { r.crit = true; m *= 1.5; } }
    if (u.hero && u.rageT > 0) m *= 1.3;
    if (!t.hero && t.markT > 0) m *= 1.2;
    if (u.hero && !t.hero && t.broken > 0 && u.stats.brkBonus) m *= 1 + u.stats.brkBonus / 100;
    if (t.hero && t.defending && t.stats.guardPlus) m *= 0.7;
    if (m !== 1) r.dmg = Math.max(1, Math.floor(r.dmg * m)); return r;
  };
}
{ const _hit = hitChance; hitChance = function (u, t, mv) { let h = _hit(u, t, mv); if (t.hero && t.smokeT > 0 && mv.acc) h = Math.max(0.05, h - 0.3); return h; }; }
// 破盾 skills and the 碎盾之心 talent: extra shield chip on the first hit of a move
{ const _im = Battle.prototype.impact; Battle.prototype.impact = function* (b, power) {
    const F = this.F, H = this.H;
    if (!b.hero && F.brkMax && !F.broken && F.brk > 0) {
      let chip = this._shieldHit || 0; this._shieldHit = 0;
      if (H.stats.shieldChip && this._lastHitPhys && chance(H.stats.shieldChip / 100)) chip++;
      if (chip) { F.brk = Math.max(0, F.brk - chip); if (this.tac) this.tac.brkFlash = 12; if (!F.brk) this._brkPending = true; }
    }
    const weak = !b.hero && this._lastHit && this._lastHit.mult > 1;
    yield* _im.call(this, b, power);
    if (weak && H.stats.weakMp && H.mp < H.maxmp) { H.mp = Math.min(H.maxmp, H.mp + H.stats.weakMp); }
  };
}
// ailment resistance (鋼鐵意志)
{ const _inf = Battle.prototype.inflict; Battle.prototype.inflict = function* (b, s, secondary) {
    if (b.hero && !b.status && b.stats.statusRes && chance(b.stats.statusRes / 100)) { yield* this.msg(b.n + '憑著意志力撐住了！（' + STATUS_NAME[s] + '無效）', { hold: 20 }); return; }
    yield* _inf.call(this, b, s, secondary);
  };
}
// timers
{ const _et = Battle.prototype.endTurn; Battle.prototype.endTurn = function* () {
    yield* _et.call(this); const H = this.H, F = this.F;
    if (H.rageT > 0 && H.rageAt !== this.turn && --H.rageT === 0) yield* this.msg(H.n + '的血怒平息了。', { hold: 16 });
    if (H.smokeT > 0 && H.smokeAt !== this.turn && --H.smokeT === 0) yield* this.msg('煙幕散去了。', { hold: 16 });
    if (F.markT > 0 && F.markAt !== this.turn && --F.markT === 0) yield* this.msg(F.n + '身上的印記消失了。', { hold: 16 });
  };
}
// existing saves: talents changed → refund every talent point once
function talentRefund(st) { if (!st || (st.talV || 1) >= TALENT_VERSION) return false; let n = 0; for (const k in st.tal || {}) n += st.tal[k] || 0; st.tal = {}; st.tp = (st.tp || 0) + n; st.talV = TALENT_VERSION; return n > 0; }
{ const _so = startOverworld; startOverworld = function (...a) { const r = _so.apply(this, a); const st = Game.st; if (st && !st.talV) { const had = talentRefund(st); if (had && r && r.run) r.run((function* () { yield* wait(20); yield* say('【系統更新】天賦改版了！\n「破甲之心」「身手矯健」換成了新的效果，並新增了三個天賦。'); yield* say('已經投入的天賦點全部退回了，打開選單的「天賦」重新分配吧。'); })()); else st.talV = TALENT_VERSION; } return r; }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) st.talV = TALENT_VERSION; return st; }; }
