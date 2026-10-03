/* ===================== v12.0.9g 叫同伴・分裂要花一回合（玩家 2026-10-04「多怪機制更改，改成消耗怪物一回合」→ 選「叫同伴／分裂要花一回合」） =====================
   以前：野狼、田鼠、強盜（叫同伴）和泡泡姆、污泥怪（分裂）被打到 HP 一半以下時，當場就多出一隻，自己的行動照樣攻擊。
   現在：HP 一半以下之後，下一次行動改成「呼叫同伴」或「分裂」，那一回合不攻擊。同一場一次；我方場上已經 3 隻就不做。
   分裂出來的不是滿血：剩下的 HP 兩隻各一半（玩家 03:13「分裂不該是滿血」）。 */
BEH_TRIG12.call = () => []; BEH_TRIG12.split = () => [];
// the two actions (the summon itself is the old beh_summon12: message + a minion of the same species, at most 3 on the side)
MFX.m9_call12 = function* (U, T) { const W = ['meadowWolf', 'greyWolf', 'snowWolf'].includes(U.sp) ? 'm12_wolfCall' : U.sp === 'fieldMice' ? 'm_chirp' : 'm_warCry'; if (MFX[W]) yield* MFX[W].call(this, U, T); };
MFX.m9_split12 = function* (U) { Sound.sfx('heal'); for (let i = 0; i < 2; i++) { U.squish = 6; mSpawn(this, 'mjag', { x: U.x, y: U.y - 10, r0: 4, r1: 30, c: i ? '#c8f0ff' : '#60b8ff', n: 10, life: 16, fl: 0.5, rot: i * 0.5 }); yield* wait(8); } };
for (const [k, n, d] of [['m9_call12', '呼叫同伴', '大聲呼叫，叫同伴過來幫忙（同一場一次）。'], ['m9_split12', '分裂', '身體分成兩半，剩下的體力兩隻各一半（同一場一次）。']]) {
  MOVES[k] = { n, t: '一般', cat: '變', pp: 1, d, cls: 'buff', foe: 1, fx: k };
  const D = defPut('skills', k, skillFromMove(k, MOVES[k], { kind: 'skill', extraTags: ['monster_skill'] })); D.cooldown = 0; D.target = 'self'; D.noHitRoll = true;
  D.tags = D.tags.filter(t => t !== 'damage'); D.effects = [effRegister('skill:' + k + '#e0', { type: 'beh_summon12', key: k === 'm9_call12' ? 'call12' : 'split12' })]; D.after = []; }
// 分裂：剩下的 HP 分成兩半，各拿一半（玩家：「分裂不該是滿血」）；叫來的同伴照舊是滿血
{ const S = EFFECT_TYPES.beh_summon12.exec; EFFECT_TYPES.beh_summon12.exec = function (core, ef, ctx) { const u = ctx.owner; if (u) u.data.called9 = 1;
    const before = new Set(core.units), r = S.call(this, core, ef, ctx); if (ef.key !== 'split12' || !u) return r;
    const nu = core.units.find(q => !before.has(q) && q.side === u.side); if (!nu) return r;
    const hp = u.res.hp, mine = Math.max(1, Math.ceil(hp / 2)), theirs = Math.max(1, Math.min(nu.max.hp, Math.floor(hp / 2)));
    core.changeRes(u, 'hp', mine - hp, { why: 'split' }); core.changeRes(nu, 'hp', theirs - nu.res.hp, { why: 'split' }); return r; }; }
// the monster decides it on its own turn: HP under half, once per battle, room on its side
{ const _d = BAI.decide; BAI.decide = function (core, u, o = {}) {
    const b = !u.hero && u.data && u.data.beh12;
    if ((b === 'call' || b === 'split') && !u.data.called9 && u.res.hp < u.max.hp * 0.5 && core.isUp(u) && core.alive(u.side).length < 3) {
      return { type: 'skill', skill: b === 'call' ? 'm9_call12' : 'm9_split12', targets: [u.id] }; }
    return _d.call(this, core, u, o); }; }
// 戰鬥說明
if (typeof BATTLE_HELP !== 'undefined') { const P = BATTLE_HELP.find(q => q[0] === '多隻魔物'); if (P && !P[1].some(t => /叫同伴/.test(t))) P[1].splice(P[1].length - 1, 0, '有些魔物 HP 剩一半時，會花一次行動叫同伴或分裂。'); }
