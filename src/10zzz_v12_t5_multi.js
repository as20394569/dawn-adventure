/* ===================== v12.15 多段攻擊分散到其他魔物（玩家 2026-10-05：「多段傷害改成 多數目標時隨機對象 然後對象死亡自動轉到其他對象」） =====================
   · 打單一目標的多段招式（狂嵐拳 ×8、疾風百刃 ×10、短刀・拳套的兩段普攻、魔物的連續攻擊…）：對面不只一隻時，
     第一下打選的那隻，第二下起每一下隨機挑一隻；目標倒下就把剩下的段數轉給還站著的（核心：10c_bv2_core.js doSkill）。
   · 雙持的副手那一下：主手打倒目標時，改打另一隻（原本直接不打）。
   · 畫面：轉到別隻身上的那一下，在那隻身上補一刀／一拳（顏色照武器），傷害數字也跳在那隻身上。 */
// dual wield: the off hand turns to another foe when the main hand has already felled the target
for (const id in DEF.skills) if (/^attack_d11_/.test(id)) for (const x of DEF.skills[id].effects) { const ef = typeof x === 'string' ? DEF.effects[x] : x; if (ef && ef.kind === 'off11' && ef.cond) { delete ef.cond.tgtAlive; if (ef.conditions && ef.conditions !== ef.cond) delete ef.conditions.tgtAlive; } }
{ const D = EFFECT_TYPES.damage, _ex = D.exec; D.exec = function (core, ef, ctx, tg) {
    if (ef.kind === 'off11' && ctx.owner && !(tg || []).some(t => core.isUp(t))) { const P = core.foesOf(ctx.owner).filter(f => core.isUp(f)); if (!P.length) return; tg = [P.length > 1 ? core.rng.pick(P) : P[0]]; }
    return _ex.call(this, core, ef, ctx, tg); }; }
// the picture follows the hit: a later hit landing on another foe gets its own strike there
{ const H = Battle.prototype.handlers, _hit = H.HIT; H.HIT = function* (e, s, t, P) { const D = DEF.skills[P.skill];
    if (s && s.hero && t && D && P.hitIndex > 0 && this.tgtV && t !== this.tgtV && !D.tags.includes('basic') && !D.hitFx) { yield* segSwing(this, s, this.center(t), P.hitIndex, this._thKind || '劍'); return; }
    return yield* _hit.call(this, e, s, t, P); };
  const _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (s && s.hero && t && P.kind === 'off11' && this.tgtV && t !== this.tgtV) yield* segSwing(this, s, this.center(t), 1, this._thKind || '劍');
    return yield* _dm.call(this, e, s, t, P); }; }
if (typeof BATTLE_HELP !== 'undefined') { const b = BATTLE_HELP.find(q => q[0] === '武器技能'); if (b && Array.isArray(b[1])) b[1] = b[1].map(t => /^短刀的普攻是 2 段/.test(t) ? '短刀普攻 2 段、拳套學會特性後打兩下、雙持時副手也出手。多段攻擊第二下起隨機打一隻，目標倒下就轉打別隻。' + (t.includes('鐵匠') ? '武器屬性在鐵匠賦予。' : '') : t); }
