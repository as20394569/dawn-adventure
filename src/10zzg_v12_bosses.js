/* ===================== v12.0.2 頭目：每個頭目一個招牌機制（玩家在〈第一輪打磨提案〉全部勾選，2026-10-03） =====================
   Before: every boss had one answer — see ⚠ (蓄力), choose 防禦 — and 8 bosses shared 碎甲重擊, 5 shared 過熱衝擊.
   Now the family techniques (碎甲重擊・過熱衝擊・戰嚎・暴衝・怒潮壓・漩渦・虛招・威壓…) are taken off bosses (elites keep theirs), and each
   boss has one readable mechanic with its own answer:
     鐵斧格倫   旋風斧固定每 3 回合：第 2 回合蓄力預告、第 3 回合砍下 → 數節奏、防禦
     沙丘巨蟲   沙海吞天蓄力時鑽進沙裡（單體攻擊打不到）→ 趁空檔回復、強化，下一回合防禦
     古岩魔像   石壁：物防 +2 級、2 回合（每 4 回合）→ 改用魔法或降物防；蓄力招改成遠古轟鳴
     水晶魔像   每 4 回合鏡面反彈魔法，前一回合預告 → 改用物理；蓄力招改成稜光射線
     銀鱗水龍   HP 一半以下「逆鱗」：被物理攻擊會反擊 → 改用魔法、強化或回復
     腐沼九頭蛇 腐沼洪流對中毒的目標傷害加倍 → 先解毒再防禦
     溝鼠王     叫小老鼠（每 3 回合最多一隻，最多兩隻）；鼠王的盛宴每吃一隻老鼠威力 +20% → 先清掉老鼠
     收穫魔像   豐收之刻無視防禦，但幾乎打不中煙幕／迴避中的目標 → 煙霧彈、提高閃避
     時計巨像   時鐘 9→10→11→12，12 點必定審判；時間扭曲讓你下一回合最後行動（搶先技能不受影響）
     霜之女王   冰系攻擊累積冰霜，滿 3 層凍結一回合 → 防禦或火屬性攻擊清掉冰霜
     熔岩巨人   熔岩甲：物理傷害 −40%；被水屬性打中冷卻 3 次行動 → 先用水破甲
     魔人維克托 模仿你上一回合用的技能（威力 ×0.8）→ 大招之後的下一回合防禦
     影將莫爾德 HP 75% 反擊架勢（2 回合）、50% 連續蓄力兩次、25% 每 3 次行動一記蝕日之劍 */
const B12_FAM = new Set(Object.values(FAM_TECH).flat().concat(['m_dominate']));
const B12_DROP = { crystalGolem: ['m_rumble'] }; // a boss's move that now belongs to another boss
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind) { const f = _mf(sp, lv, kind); if (kind !== 'boss' || !f || !f.moves) return f;
    const d = SPECIES[sp], own = new Set((d && d.learn || []).map(L => Array.isArray(L) ? L[1] : L)), drop = B12_DROP[sp] || [];
    const keep = f.moves.filter(m => !drop.includes(m.id) && !(B12_FAM.has(m.id) && (!own.has(m.id) || m.id === 'm_dominate')));
    if (keep.length >= 3) f.moves = keep; return f; }; }

/* ---------- helpers ---------- */
function b12Skill(id, patch) { const M = MOVES[id]; if (!M) { bvErr('b12', 'no move ' + id); return null; } Object.assign(M, patch);
  const old = DEF.skills[id], D = defPut('skills', id, { ...skillFromMove(id, M, { kind: 'skill', extraTags: ['monster_skill'] }), override: true });
  D.cooldown = old && old.cooldown != null ? old.cooldown : 0; D.effects = D.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); D.after = D.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); return D; }
const b12Say = (core, u, text) => core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: null, text } });
const b12Hero = core => core.units.find(q => q.hero && !q.down);
const b12Pick = (core, u, ids) => { const L = ids.filter(id => DEF.skills[id] && !core.onCooldown(u, id)); if (!L.length) return null; const id = core.rng.pick(L), t = b12Hero(core);
  return { type: 'skill', skill: id, targets: DEF.skills[id].target === 'self' ? [u.id] : t ? [t.id] : [] }; };
const b12Charge = (core, u, id) => { const t = b12Hero(core); u.data.lastCharge = core.round; return { type: 'skill', skill: id, targets: t ? [t.id] : [] }; };
COND.roundMod12 = (c, v) => c.core.round % v[0] === v[1];
const B12_SCRIPT = {};
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s || kind !== 'boss') return s;
    if (DEF.mechanics['b12_' + sp]) s.data.mechanics.push('b12_' + sp); if (B12_SCRIPT[sp]) { s.data.script = 'b12_' + sp; BAI.SCRIPT['b12_' + sp] = B12_SCRIPT[sp]; } return s; }; }
// the frenzy tip still talked about 破防 (cancelled)
PHASE_TXT.frenzy = n => [n + '陷入了狂怒！'].concat(Game.st.flags.tutFrenzy ? [] : (Game.st.flags.tutFrenzy = 1, ['（狂怒：每兩回合會行動兩次！準備好回復，一口氣打倒牠吧。）']));

/* ---------- 鐵斧格倫：旋風斧 every 3rd round (charge on the 2nd, the axe comes down on the 3rd) ---------- */
Object.assign(DEF.skills.m_axeSpin, { chargeMsg: '把斧頭高高舉起，開始轉動！', warn: '（旋風斧要砍下來了……選擇「防禦」！每 3 回合一次。）' });
BAI.SCRIPT.banditBoss = function (core, u) { const d = u.data; d.cd = (d.cd ?? 2) - 1;
  if (d.cd <= 0 && DEF.skills.m_axeSpin) { d.cd = 2; return b12Charge(core, u, 'm_axeSpin'); }
  if (core.data.gold && core.data.gold() > 0 && (d.steals || 0) < 2 && core.rng.chance(0.25)) { d.steals = (d.steals || 0) + 1; return { type: 'skill', skill: 'm_steal', targets: [] }; }
  return b12Pick(core, u, ['m_gutSlash', 'm_knife', 'm_dirtyKick', BR.stage(core, u, 'atk') < 2 ? 'm_warCry' : 'm_gutSlash']); };

/* ---------- 沙丘巨蟲：沙海吞天 burrows while it charges ---------- */
Object.assign(DEF.skills.m_devour, { airborne: true, chargeMsg: '鑽進了沙裡！沙底下傳來轟隆聲……', warn: '（牠鑽在沙裡，單體攻擊打不到！趁現在回復或強化，下一回合選擇「防禦」。）' });
{ const H = Battle.prototype.handlers, _m = H.MISS; H.MISS = function* (e, s, t, P) { if (P && P.air && t && t.sp === 'duneWorm') { yield* this.msg(t.n + '鑽在沙裡，打不到！', { hold: 24 }); return; } yield* _m.call(this, e, s, t, P); }; }

/* ---------- 古岩魔像：石壁 (物防 +2, 2 rounds, every 4th round) · 遠古轟鳴 is its charged attack ---------- */
b12Skill('m_rumble', { pow: 95, cat: '特', t: '岩', acc: 100, charge: 1, stat: undefined, eff: { stat: { atk: -1, spa: -1 }, p: 100 }, chargeMsg: '全身發出低沉的轟鳴……遺跡在震動！',
  warn: '（下一擊非常危險……選擇「防禦」！）', d: '蓄力後放出遠古的轟鳴，並讓對手的物攻和魔攻下降。' });
{ const E = DEF.skills.m_stoneWall.effects.map(x => DEF.effects[x]).find(x => x && x.type === 'stage'); if (E) E.dur = 2; MOVES.m_stoneWall.d = '用石壁護住全身，物防大幅提升 2 回合。'; }
{ const P = DEF.effects['mech:golem#t0e0']; if (P && P.setSkills) for (const k of ['m_rumble', 'm_stoneWall']) if (!P.setSkills.includes(k)) P.setSkills.push(k); }
{ const _g = BAI.SCRIPT.golem; BAI.SCRIPT.golem = function (core, u, tgt, o) { const r = _g(core, u, tgt, o); if (r) return r;
    if (core.round % 4 === 2 && BR.stage(core, u, 'def') < 2) return { type: 'skill', skill: 'm_stoneWall', targets: [u.id] };
    if (core.round - (u.data.lastCharge ?? -9) >= 4 && core.rng.chance(0.5)) return b12Charge(core, u, 'm_rumble');
    return b12Pick(core, u, (u.data.phase || 0) >= 1 ? ['m_rockfall', 'm_quake', 'm_boulder'] : ['m_boulder', 'm_quake', 'm_boulder']); }; }
defPut('mechanics', 'b12_golem', { make: u => ({ triggers: [
  { on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { skillIs: 'm_stoneWall', dataNot: ['wallTold', 1] }, prio: 4, effects: [{ type: 'set_data', onUnit: 1, key: 'wallTold', value: 1 }, { type: 'message', target: 'self', text: '（石壁擋住了物理攻擊……改用魔法，或先降低牠的物防！）' }] }] }) });

/* ---------- 水晶魔像：鏡面 every 4th round, told the round before · 稜光射線 is its charged attack ---------- */
b12Skill('m_prismRay', { pow: 120, charge: 1, chargeMsg: '水晶開始聚集光芒……', warn: '（稜光射線要射出來了，會打中全部……選擇「防禦」！）', d: '蓄力後射出貫穿一切的稜光，打中所有對手。' });
BAI.SCRIPT.crystalGolem = function (core, u) {
  if (core.round % 4 === 0 && !core.hasStatus(u, 'mirror')) return { type: 'skill', skill: 'm_mirror', targets: [u.id] };
  if (core.round % 4 === 2 && core.round - (u.data.lastCharge ?? -9) >= 3) return b12Charge(core, u, 'm_prismRay');
  return b12Pick(core, u, (u.data.phase || 0) >= 2 ? ['m_crystalSpark', 'm_crystalShard', 'm_quake'] : ['m_crystalShard', 'm_quake']); };
defPut('mechanics', 'b12_crystalGolem', { make: u => ({ triggers: [
  { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, roundMod12: [4, 3] }, prio: 2, effects: [{ type: 'message', target: 'self', text: '（水晶表面開始發亮……下一回合會張開鏡面，魔法會被反彈！改用物理攻擊。）' }] }] }) });

/* ---------- 銀鱗水龍：逆鱗 below half HP — physical hits are answered ---------- */
defPut('mechanics', 'b12_silverWyrm', { make: u => ({ triggers: [
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.5, ownerAlive: 1, dataNot: ['scale12', 1] }, prio: 5, effects: [{ type: 'set_data', onUnit: 1, key: 'scale12', value: 1 }, { type: 'message', target: 'self', text: '銀鱗水龍的鱗片全都倒豎了起來！（逆鱗：被物理攻擊會反擊。改用魔法、強化或回復！）' }] },
  { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { dataIs: ['scale12', 1], srcSide: 'enemy', cat: '物', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', skill: 'counter_strike', why: 'scale12', mul: 0.9 }] }] }) });

/* ---------- 腐沼九頭蛇：腐沼洪流 ×2 on a poisoned target ---------- */
DEF.skills.m_hydraFlood.mods = (DEF.skills.m_hydraFlood.mods || []).concat([{ stage: 'skill', who: 'attacker', mul: 2, cond: { tgtStatus: 'psn' } }]);
Object.assign(DEF.skills.m_hydraFlood, { warn: '（沼澤的水位在下降……中毒時這一擊傷害加倍！先解毒，再選擇「防禦」。）' }); MOVES.m_hydraFlood.d = (MOVES.m_hydraFlood.d || '') + '對中毒的對手傷害加倍。';

/* ---------- 溝鼠王：鼠群 calls two rats; 鼠王的盛宴 eats them (+30% power each) ---------- */
EFFECT_TYPES.devour12 = { exec(core, ef, ctx) { const u = ctx.owner; let n = 0;
  for (const r of core.alive(u.side).filter(q => q !== u && q.minion)) { n++; r.res.hp = 0; core.knockDown(r, u, null); }
  u.data.eaten12 = n; if (n) core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: null, text: u.name + '一口吞下了' + n + '隻小老鼠！力量變強了！' } }); } };
BR.FORMULA.feast12 = c => 1 + 0.2 * ((c.src && c.src.data.eaten12) || 0);
Object.assign(MOVES.m_ratSwarm, { pow: 0, cat: '變', eff: undefined });
defPut('skills', 'm_ratSwarm', { ...skillFromMove('m_ratSwarm', { n: '鼠群', t: '一般', cat: '變', fx: 'mbuff', foe: 1 }, { kind: 'skill', extraTags: ['monster_skill'] }), override: true, target: 'self', noHitRoll: true, cooldown: 0,
  effects: [effRegister('skill:m_ratSwarm#e0', { type: 'summon', sp: 'sewerRat', count: 1, kind: 'minion', maxSide: 3, lv: 22 })], after: [] });
MOVES.m_ratSwarm.d = '吹響口哨，叫來一隻小老鼠。';
{ const D = DEF.skills.m_kingsFeast; D.effects = [effRegister('skill:m_kingsFeast#e9', { type: 'devour12', target: 'self' })].concat(D.effects); D.mods = (D.mods || []).concat([{ stage: 'skill', who: 'attacker', mul: { f: 'feast12' } }]);
  Object.assign(D, { warn: '（鼠王盯著小老鼠流口水……每吃一隻威力就更高，先清掉老鼠！再選擇「防禦」。）' }); MOVES.m_kingsFeast.d = '吃掉身邊的小老鼠（每隻威力 +20%），再撲上來大咬一口。'; }
B12_SCRIPT.ratKing = function (core, u) { const rats = core.alive(u.side).filter(q => q !== u && q.minion).length;
  if (rats < 2 && core.round >= 2 && core.round - (u.data.called ?? -9) >= 3) { u.data.called = core.round; return { type: 'skill', skill: 'm_ratSwarm', targets: [u.id] }; }
  if (rats && core.round - (u.data.lastCharge ?? -9) >= 4 && core.rng.chance(0.5)) return b12Charge(core, u, 'm_kingsFeast');
  return b12Pick(core, u, ['m_crownBash', 'm_plagueBite', 'm_crownBash']); };

/* ---------- 收穫魔像：豐收之刻 goes through 防禦 but misses a target in 煙幕 / 迴避 ---------- */
{ const D = DEF.skills.m_harvest; D.acc = D.acc || 100;
  D.mods = (D.mods || []).concat([{ stage: 'final', who: 'attacker', mul: 2, cond: { tgtStatus: 'guard' } }, { stage: 'skill', who: 'attacker', accAdd: -300, cond: { tgtStatus: 'smoke' } }, { stage: 'skill', who: 'attacker', accAdd: -300, cond: { tgtStatus: 'evade_up' } }]);
  Object.assign(D, { warn: '（豐收之刻會無視「防禦」！用煙霧彈或提高閃避的技能躲開。）' }); MOVES.m_harvest.d = '揮動巨鐮收割一切。無視防禦，但打不中閃避中的對手。'; }

/* ---------- 時計巨像：the clock 9 → 12, 審判 at 12; 時間扭曲 = you act last next round ---------- */
EFFECT_TYPES.clock12 = { exec(core, ef, ctx) { const u = ctx.owner; u.data.clock12 = (u.data.clock12 || 9) >= 12 ? 9 : (u.data.clock12 || 9) + 1;
  core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: null, text: u.data.clock12 === 12 ? '（鐘塔的指針指向 12 點！審判的鐘聲響起……）' : '（鐘塔的指針指向 ' + u.data.clock12 + ' 點。' + (u.data.clock12 === 11 ? '下一回合就是 12 點！）' : '）') } }); } };
defPut('mechanics', 'b12_clockColossus', { make: u => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, prio: 1, effects: [{ type: 'clock12', target: 'self' }] }] }) });
b12Skill('m_timeWarp', { pow: 0, stat: undefined, st: undefined, d: '扭曲時間，讓對手下一回合最後才行動（搶先技能不受影響）。' });
{ const D = DEF.skills.m_timeWarp; D.target = 'enemy'; D.noHitRoll = true; D.effects = [effRegister('skill:m_timeWarp#e0', { type: 'status', status: 'delay', target: 'target' }), effRegister('skill:m_timeWarp#e1', { type: 'message', target: 'target', text: '時間被扭曲了！下一回合會最後才行動……' })]; }
Object.assign(DEF.skills.m_twelveStrike, { chargeMsg: '舉起了巨大的指針……', warn: '（12 點的審判！選擇「防禦」！）' });
B12_SCRIPT.clockColossus = function (core, u) { const h = u.data.clock12 || 9;
  if (h === 11) return b12Charge(core, u, 'm_twelveStrike');
  if (h === 10 && core.rng.chance(0.6)) { const t = b12Hero(core); return { type: 'skill', skill: 'm_timeWarp', targets: t ? [t.id] : [] }; }
  return b12Pick(core, u, ['m_gearCrush', 'm_steamBurst', 'm_gearCrush']); };

/* ---------- 霜之女王：冰霜 stacks (3 → 凍結); 防禦 or a fire hit clears them ---------- */
EFFECT_TYPES.frost12 = { exec(core, ef, ctx, tg) { for (const t of tg) { if (!t || !t.hero || !core.isUp(t)) continue;
  if (ef.clear) { if (t.data.frost12) { t.data.frost12 = 0; core.emit(EVT.MESSAGE, { src: t, tgts: [t], payload: { key: null, text: ef.why === 'fire' ? '火焰融化了身上的冰霜！' : '防禦架勢抖落了身上的冰霜！' } }); } continue; }
  t.data.frost12 = (t.data.frost12 || 0) + 1;
  if (t.data.frost12 >= 3) { t.data.frost12 = 0; core.applyStatus(ctx.owner, t, 'frozen', {}); core.emit(EVT.MESSAGE, { src: t, tgts: [t], payload: { key: null, text: '冰霜累積到 3 層，' + t.name + '被凍住了！' } }); }
  else core.emit(EVT.MESSAGE, { src: t, tgts: [t], payload: { key: null, text: '冰霜累積了（' + t.data.frost12 + '／3）。防禦或火屬性攻擊可以清掉。' } }); } } };
defPut('mechanics', 'b12_frostQueen', { make: u => ({ triggers: [
  { on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { element: '水', hasPower: 1, tgtAlive: 1, tgtSide: 'enemy' }, limit: { perAction: 1 }, prio: 3, effects: [{ type: 'frost12', target: 'event_target' }] },
  { on: EVT.DEFEND, phase: 'POST', role: 'enemy_src', prio: 3, effects: [{ type: 'frost12', clear: 1, why: 'guard', target: 'all_enemies' }] },
  { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', evEl: '火', hasPower: 1 }, limit: { perAction: 1 }, prio: 3, effects: [{ type: 'frost12', clear: 1, why: 'fire', target: 'all_enemies' }] }] }) });

/* ---------- 熔岩巨人：熔岩甲 (physical damage −40%) until a water hit cools it (3 of its actions) ---------- */
defPut('statuses', 'cooled12', { tags: ['debuff'], duration: 'owner_actions', durDefault: 3, tick: 'owner_action_end', stack: 'refresh', metadata: { n: '冷卻' } });
defPut('mechanics', 'b12_lavaGiant', { make: u => ({ mods: [{ stage: 'final', who: 'defender', mul: 0.6, cond: { cat: '物', hasPower: 1, ownerLacksStatus: 'cooled12' } }], triggers: [
  { on: EVT.ROUND_START, phase: 'POST', cond: { round: 1, ownerAlive: 1 }, prio: 2, effects: [{ type: 'message', target: 'self', text: '熔岩巨人全身覆蓋著熔岩甲！（物理攻擊效果很差……用水屬性讓牠冷卻！）' }] },
  { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', evEl: '水', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, prio: 3, effects: [{ type: 'status', status: 'cooled12', target: 'self', dur: 3 }, { type: 'message', target: 'self', text: '熔岩甲冷卻變硬、裂開了！物理攻擊現在有效！' }] }] }) });

/* ---------- 魔人維克托：copies the skill you used last round (×0.8) ---------- */
defPut('mechanics', 'b12_victorDemon', { make: u => ({ mods: [{ stage: 'skill', costMul: 0 }, { stage: 'skill', who: 'attacker', mul: 0.8, cond: { notTag: 'monster_skill' } }] }) });
B12_SCRIPT.victorDemon = function (core, u) { const id = core.data.lastHeroAct, D = id && DEF.skills[id], t = b12Hero(core);
  if (D && t && D.power && /^[ou]_/.test(id) && !D.tags.includes('basic') && !core.onCooldown(u, id) && core.rng.chance(0.85)) {
    b12Say(core, u, '魔人維克托冷笑著，擺出了跟你一樣的架勢……（他要模仿「' + D.name + '」！）');
    return { type: 'skill', skill: id, targets: D.target === 'self' ? [u.id] : [t.id] }; }
  return null; };

/* ---------- 影將莫爾德：75% counter stance (2 rounds) · 50% two charges in a row · 25% 蝕日之劍 every 3rd action ---------- */
COND.stance12 = (c, v) => !!c.owner && ((c.owner.data.stance12 || -1) >= c.core.round) === !!v;
EFFECT_TYPES.stance12 = { exec(core, ef, ctx) { ctx.owner.data.stance12 = core.round + 1; } };
defPut('mechanics', 'b12_shadowGeneral', { make: u => ({ triggers: [
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.75, ownerAlive: 1, dataNot: ['sg75', 1] }, prio: 5, effects: [{ type: 'set_data', onUnit: 1, key: 'sg75', value: 1 }, { type: 'stance12', target: 'self' }, { type: 'message', target: 'self', text: '影將莫爾德擺出了反擊架勢！（這兩回合被物理攻擊會反擊）' }] },
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.5, ownerAlive: 1, dataNot: ['sg50', 1] }, prio: 5, effects: [{ type: 'set_data', onUnit: 1, key: 'sg50', value: 1 }, { type: 'set_data', onUnit: 1, key: 'double12', value: 2 }, { type: 'message', target: 'self', text: '影將莫爾德的劍上纏繞著黑影……（接下來會連續蓄力兩次！）' }] },
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.25, ownerAlive: 1, dataNot: ['sg25', 1] }, prio: 5, effects: [{ type: 'set_data', onUnit: 1, key: 'sg25', value: 1 }, { type: 'message', target: 'self', text: '影將莫爾德燃起了黑色的火焰！（每 3 次行動就會放出一次蝕日之劍）' }] },
  { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { stance12: 1, srcSide: 'enemy', cat: '物', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', skill: 'counter_strike', why: 'stance12', mul: 0.9 }] }] }) });
B12_SCRIPT.shadowGeneral = function (core, u) { const d = u.data;
  if ((d.double12 || 0) > 0) { d.double12--; return b12Charge(core, u, 'm_eclipseBlade'); }
  if (d.sg25) { d.n25 = (d.n25 || 0) + 1; if (d.n25 % 3 === 0) return b12Charge(core, u, 'm_eclipseBlade'); }
  else if (core.round - (d.lastCharge ?? -9) >= 4 && core.rng.chance(0.4)) return b12Charge(core, u, 'm_eclipseBlade');
  return b12Pick(core, u, ['m_shadowSlash', 'm_darkPulse', 'm_shadowSlash']); };
