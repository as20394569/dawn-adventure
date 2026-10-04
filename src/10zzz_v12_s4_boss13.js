/* ===================== v12.4 頭目重製（玩家 2026-10-04：「全部重製，要有真正打 boss 與菁英的挑戰感，可以用視覺的方式來加深」） =====================
   企劃〈頭目重製清單〉：挑戰感「不懂機制會輸、懂了穩過」；視覺四項（登場・必殺預告・階段轉換・部位外觀）；必殺 85%；要暴走；部位外觀請 Codex 畫（圖到之前用程式畫的裂痕）。
   骨架（13 隻主線頭目都一樣）：
   ・必殺技：沒應對＝最大 HP 的 85%（跟裝備無關），防禦剩 ×0.3；破防打斷蓄力；部位打壞再減半。
   ・三個階段：第一階段／後半戰（HP 50%：換弱點＋這隻的新規則）／暴走（HP 25%：最後一條規則）。原本通用的「60% 眼神・30% 狂怒」和後半戰多出來的蓄力招，頭目不再用。
   ・每隻的招牌規則保留，再加上一條跟破防・部位・慣性咬在一起的規則。 */
const SIG13 = { banditBoss: 'm_axeSpin', duneWorm: 'm_devour', golem: 'm_rumble', crystalGolem: 'm_prismRay', silverWyrm: 'm_moonTide', hydra: 'm_hydraFlood', ratKing: 'm_kingsFeast',
  harvestGolem: 'm_harvest', clockColossus: 'm_twelveStrike', frostQueen: 'm_absoluteZero', lavaGiant: 'm_eruption', victorDemon: 'm_tyranny', shadowGeneral: 'm_eclipseBlade' };
const TITLE13 = { banditBoss: '礦坑的鐵斧', duneWorm: '流沙之喉', golem: '遺跡的守門人', crystalGolem: '稜鏡的看守', silverWyrm: '銀月湖的主人', hydra: '腐沼的九首', ratKing: '地下水道之王',
  harvestGolem: '金穗的稻草王', clockColossus: '鐘塔的時計', frostQueen: '永凍的女王', lavaGiant: '熔岩坑的巨人', victorDemon: '黯滅的宰相', shadowGeneral: '黯滅之影' };
const SIG_HP13 = 0.85, SIG_GUARD13 = 0.3;
// what the 必殺 telegraph tells you to do
const ANS13 = { duneWorm: ['防禦', '全體技能削盾'], hydra: ['先解毒', '防禦'], ratKing: ['先清老鼠', '防禦'], harvestGolem: ['迴避・煙霧彈', '破防打斷'] };
// the per-boss lines when a phase starts
const P2TXT13 = { banditBoss: '（後半戰：旋風斧改成每 2 回合一次！）', duneWorm: '（後半戰：巨口吞噬吸取的 HP 變多了！）', golem: '（後半戰：胸口的紅核露出來了，比較容易打壞！）',
  crystalGolem: '（後半戰：鏡面會輪流反彈魔法和物理！藍光＝反彈魔法，紅光＝反彈物理。）', silverWyrm: '（後半戰：逆鱗豎起來了，被物理攻擊會反擊！）', hydra: '（後半戰：毒霧吐息一定會讓人中毒！）',
  ratKing: '（後半戰：一次叫兩隻小老鼠，最多 3 隻！）', harvestGolem: '（後半戰：豐收之刻吸取的 HP 變多了！）', clockColossus: '（後半戰：10 點一定會扭曲時間！）', frostQueen: '（後半戰：冰之鏡展開了，魔法很難打進去！）',
  lavaGiant: '（後半戰：地面流著熔岩！每回合結束都會燙傷，防禦的那回合不會。）', victorDemon: '（後半戰：魔女詛咒更重了！）', shadowGeneral: '' };
const RAGETXT13 = { banditBoss: '（暴走：每次行動前都會先戰吼！快點打倒牠！）', duneWorm: '（暴走：每 3 回合就鑽進沙裡一次！）', golem: '（暴走：每 2 回合就張開石壁！）', crystalGolem: '（暴走：蓄力稜光射線的時候也會張鏡面！）',
  silverWyrm: '（暴走：月潮之後會馬上再掀一次怒濤！）', hydra: '（暴走：再生變快了！用火燒斷牠的再生！）', ratKing: '（暴走：每 2 回合就叫小老鼠！用全體攻擊一次清掉！）', harvestGolem: '（暴走：收割變成砍兩下！）',
  clockColossus: '（暴走：審判之後時鐘從 10 點開始走！）', frostQueen: '（暴走：冰霜 2 層就會凍住！）', lavaGiant: '（暴走：熔岩甲變得更厚了！用水冷卻牠！）', victorDemon: '（暴走：模仿的招式比你的還強！）', shadowGeneral: '' };
// where each part sits on the battle sprite (fraction of the frame), for the broken look
const PART_AT13 = { banditBoss: [[0.13, 0.72], [0.74, 0.78]], duneWorm: [[0.5, 0.52], [0.5, 0.22]], golem: [[0.17, 0.72], [0.52, 0.72]], crystalGolem: [[0.5, 0.24], [0.52, 0.74]],
  silverWyrm: [[0.5, 0.5], [0.5, 0.68]], hydra: [[0.5, 0.45], [0.5, 0.78]], ratKing: [[0.42, 0.26], [0.48, 0.8]], harvestGolem: [[0.14, 0.76], [0.5, 0.33]], clockColossus: [[0.15, 0.7], [0.5, 0.66]],
  frostQueen: [[0.25, 0.45], [0.62, 0.38]], lavaGiant: [[0.14, 0.85], [0.5, 0.66]], victorDemon: [[0.8, 0.62], [0.45, 0.22]], shadowGeneral: [[0.76, 0.78], [0.16, 0.62]] };
PART_BODY11.banditBoss = [['巨斧', 'm_axeSpin'], ['飛刀袋', 'm_knife']];
const isB13 = u => !!(u && u.boss && SIG13[u.sp]);
const baseId13 = id => String(id || '').replace(/^hc_/, '');
const pw13 = (u, mv) => !!(u && u.data.partWeak11 && u.data.partWeak11[mv]);
COND.rage13 = (c, v) => !!(c.owner && c.owner.data.rage13) === !!v;
COND.noPart13 = (c, v) => !pw13(c.owner, v);
COND.part13 = (c, v) => pw13(c.owner, v);
COND.aoe13 = (c, v) => !!(c.skill && c.skill.target === 'all_enemies') === !!v;
COND.burrow13 = (c, v) => !!(c.owner && c.core.hasStatus(c.owner, 'airborne')) === !!v;
COND.sig13 = (c, v) => { const u = c.src, id = c.ev && c.ev.payload && c.ev.payload.skill; return !!(isB13(u) && c.tgt && c.tgt.hero && id && SIG13[u.sp] === baseId13(id)) === !!v; };

/* ---------- 1. 必殺技：最大 HP 的 85% ---------- */
const SIGMUL13 = { hydra: (core, u, t) => core.hasStatus(t, 'psn') ? 2 : 1, ratKing: (core, u) => pw13(u, 'm_kingsFeast') ? 1 : 1 + 0.2 * (u.data.eaten12 || 0) };
const sigNoGuard13 = u => u.sp === 'harvestGolem' && !pw13(u, 'm_harvest');
EFFECT_TYPES.sig13 = { exec(core, ef, ctx) { const e = ctx.pre; if (!e) return; const u = ctx.owner, t = core.byId[e.tgts[0]]; if (!u || !t) return;
  const S = DEF.skills[e.payload.skill] || {}, hits = S.hits ? (S.hits[0] + S.hits[1]) / 2 : 1, M = SIGMUL13[u.sp];
  let v = t.max.hp * SIG_HP13 * (M ? M(core, u, t) : 1) / hits;
  if (core.hasStatus(t, 'guard') && !sigNoGuard13(u)) v *= SIG_GUARD13; if (core.hasStatus(t, 'barrier')) v *= 0.6;
  e.payload.amount = Math.max(1, Math.floor(v)); (e.payload.notes || (e.payload.notes = [])).push('sig13'); } };

/* ---------- 2. 三個階段 ---------- */
// bosses keep only 後半戰 (50%) and 暴走 (25%); the generic eyes/frenzy phases and the extra charged clone are for elites
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, ...a) { const s = _ue.call(this, core, sp, lv, kind, ...a);
    if (s && kind === 'boss' && SIG13[sp]) { const M = s.data.mechanics || (s.data.mechanics = []); for (let i = M.length - 1; i >= 0; i--) if (M[i] === 'phases') M.splice(i, 1); if (!M.includes('boss13')) M.push('boss13'); }
    return s; }; }
{ const H = EFFECT_TYPES.hunt_p2, _x = H.exec; H.exec = function (core, ef, ctx) { const u = ctx.owner; if (!isB13(u)) return _x.call(this, core, ef, ctx); if (u.data.hunt2 || !core.isUp(u)) return;
    core.emit(EVT.PHASE, { src: u, tgts: [u], payload: { phase: u.data.phase || 0, key: 'hunt2' } }, () => { u.data.hunt2 = 1; });
    const f = P2_13[u.sp]; if (f) f(core, u); if (P2TXT13[u.sp]) core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: P2TXT13[u.sp] } }); }; }
EFFECT_TYPES.rage13 = { exec(core, ef, ctx) { const u = ctx.owner; if (!u || u.data.rage13 || !core.isUp(u)) return;
  core.emit(EVT.PHASE, { src: u, tgts: [u], payload: { phase: 2, key: 'rage13' } }, () => { u.data.rage13 = 1; });
  if (RAGETXT13[u.sp]) core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: RAGETXT13[u.sp] } }); } };
PHASE_TXT.hunt2 = n => [n + '進入了後半戰！弱點改變了！'].concat(Game.st.flags.tutHunt2 ? [] : (Game.st.flags.tutHunt2 = 1, ['（頭目 HP 剩一半會換弱點，規則也會變。後半戰打出破防，會多掉稀有部位！）']));
PHASE_TXT.rage13 = n => [n + '暴走了！'];
// helpers for the per-boss rules
EFFECT_TYPES.mark13 = { exec(core, ef, ctx) { if (ctx.owner) ctx.owner.data[ef.key] = core.round; } };
EFFECT_TYPES.drainx13 = { exec(core, ef, ctx) { const u = ctx.owner, a = ctx.ev && ctx.ev.payload && ctx.ev.payload.amount; if (u && core.isUp(u) && a > 0) core.heal(u, u, Math.max(1, Math.floor(a * ef.frac)), { kind: 'drain' }); } };
EFFECT_TYPES.regen13 = { exec(core, ef, ctx) { const u = ctx.owner; if (!u || !core.isUp(u) || u.data.fire13 === core.round || u.res.hp >= u.max.hp) return; core.heal(u, u, Math.max(1, Math.floor(u.max.hp * (u.data.rage13 ? 0.08 : 0.05))), { kind: 'regen' }); } };
EFFECT_TYPES.lava13 = { exec(core, ef, ctx) { const u = ctx.owner, h = core.units.find(q => q.hero && core.isUp(q)); if (!u || !h || !core.isUp(u) || core.hasStatus(h, 'guard')) return;
  if (!u.data.lavaTold13) { u.data.lavaTold13 = 1; core.emit(EVT.MESSAGE, { src: u, tgts: [h], payload: { text: '腳下的熔岩燙傷了' + h.name + '！' } }); }
  core.dealDamage(u, h, Math.max(1, Math.floor(h.max.hp * 0.03)), { kind: 'dot', el: '火', min: 1 }); } };
EFFECT_TYPES.moon13 = { exec(core, ef, ctx) { const u = ctx.owner; if (!u || !core.isUp(u)) return;
  if (ef.on) { u.data.moon13 = 1; core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: '月光照在銀鱗水龍身上……（這回合結束牠會回復 10% HP，打出破防就能打斷！）' } }); return; }
  if (ef.cut) { if (u.data.moon13) { u.data.moon13 = 0; core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: '月光被打斷了！' } }); } return; }
  if (u.data.moon13) { u.data.moon13 = 0; core.heal(u, u, Math.floor(u.max.hp * 0.1), { kind: 'heal' }); } } };
EFFECT_TYPES.clearUp13 = { exec(core, ef, ctx) { const u = ctx.owner; if (!u) return; let n = 0; for (const k of ['atk', 'spa', 'def', 'spd', 'spe']) if (BR.stage(core, u, k) > 0) { core.removeStatus(u, 'stage_' + k, 'break'); n++; }
  if (n) core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: '破防讓' + u.name + '的強化全部消失了！' } }); } };
EFFECT_TYPES.extra13 = { exec(core, ef, ctx) { const u = ctx.owner; if (!u || !core.isUp(u)) return; u.data.next13 = ef.skill; core.order.unshift({ id: u.id, extra: 'rage13' }); } };
EFFECT_TYPES.gear13 = { exec(core, ef, ctx) { const u = ctx.owner, I = inOf11(u); if (!I) return; for (const q of ['b', 'p', 'm']) I[q] = clamp(200 - I[q], IN11.lo, IN11.hi);
  core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: '齒輪倒轉！對時計巨像的慣性全部倒過來了！（現在 普' + I.b + '・物' + I.p + '・魔' + I.m + '）' } }); } };
EFFECT_TYPES.stageOn13 = { exec(core, ef, ctx, tg) { EFFECT_TYPES.stage.exec(core, { type: 'stage', stats: ef.stats, dur: ef.dur }, ctx, tg); } };
const TR13 = (on, role, cond, effects, o = {}) => ({ on, phase: o.phase || 'POST', ...(role ? { role } : {}), cond, effects, prio: o.prio ?? 4, ...(o.limit ? { limit: o.limit } : {}) });
const MECH13 = {
  banditBoss: [TR13(EVT.BREAK, 'tgt', {}, [{ type: 'clearUp13' }]), TR13(EVT.ACTION_START, 'src', { rage13: 1 }, [{ type: 'stage', target: 'self', stats: { atk: 1 } }])],
  duneWorm: [TR13(EVT.DAMAGE, 'tgt', { burrow13: 1, aoe13: 1, srcSide: 'enemy', hasPower: 1, ownerLacksStatus: 'broken' }, [{ type: 'hunt_chip', target: 'self', n: 1, why: 'aoe13' }], { limit: { perAction: 1 }, prio: 11 }),
    TR13(EVT.DAMAGE, 'src', { skillIs: 'm_wormBite', dataIs: ['hunt2', 1], noPart13: 'm_wormBite' }, [{ type: 'drainx13', frac: 0.2 }], { limit: { perAction: 1 } })],
  silverWyrm: [TR13(EVT.ROUND_START, null, { ownerAlive: 1, roundMod12: [4, 0] }, [{ type: 'moon13', on: 1 }]), TR13(EVT.BREAK, 'tgt', {}, [{ type: 'moon13', cut: 1 }]), TR13(EVT.ROUND_END, null, { ownerAlive: 1, dataIs: ['moon13', 1] }, [{ type: 'moon13' }]),
    TR13(EVT.SKILL_USE, 'src', { skillIs: 'm_moonTide', rage13: 1 }, [{ type: 'extra13', skill: 'm_tidalWave' }])],
  hydra: [TR13(EVT.ROUND_END, null, { ownerAlive: 1 }, [{ type: 'regen13' }], { prio: 1 }), TR13(EVT.DAMAGE, 'tgt', { srcSide: 'enemy', evEl: '火', hasPower: 1 }, [{ type: 'mark13', key: 'fire13' }]),
    TR13(EVT.DAMAGE, 'src', { skillIs: 'm_venomSpray', dataIs: ['hunt2', 1], noPart13: 'm_hydraFlood', tgtAlive: 1 }, [{ type: 'status', status: 'psn', target: 'event_target' }], { limit: { perAction: 1 } }),
    TR13(EVT.STATUS_APPLY, 'src', { evStatus11: 'psn', part13: 'm_hydraFlood' }, [{ type: 'cancel', why: 'part13' }], { phase: 'PRE', prio: 9 })],
  harvestGolem: [TR13(EVT.SKILL_USE, 'src', { skillIs: 'm_harden' }, [{ type: 'stage', target: 'self', stats: { spd: -1 } }, { type: 'message', target: 'self', text: '身體變硬了，可是魔防下降了！（換魔法攻擊）' }]),
    TR13(EVT.DAMAGE, 'src', { skillIs: 'm_harvest', dataIs: ['hunt2', 1] }, [{ type: 'drainx13', frac: 0.2 }], { limit: { perAction: 1 } })],
  lavaGiant: [TR13(EVT.ROUND_END, null, { ownerAlive: 1, dataIs: ['hunt2', 1] }, [{ type: 'lava13' }], { prio: 1 })],
  victorDemon: [TR13(EVT.SKILL_USE, 'src', { skillIs: 'm_curseMark', dataIs: ['hunt2', 1] }, [{ type: 'stage', target: 'target', stats: { atk: -1, def: -1 } }])],
};
defPut('mechanics', 'boss13', { make: u => ({ triggers: [
  { on: EVT.DAMAGE, phase: 'PRE', role: 'src', cond: { sig13: 1 }, prio: 24, effects: [{ type: 'sig13' }] },
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.25, ownerAlive: 1, dataNot: ['rage13', 1] }, prio: 6, effects: [{ type: 'rage13' }] }].concat(MECH13[u.sp] || []) }) });
// what happens at 後半戰 (beyond the weakness)
const P2_13 = {
  golem: (core, u) => { const P = partsOf11(u); if (P && P[1] && !P[1].gone) { P[1].max = Math.max(1, Math.round(P[1].max / 2)); P[1].hp = Math.min(P[1].hp, P[1].max); } },
  frostQueen: (core, u) => EFFECT_TYPES.stage.exec(core, { type: 'stage', stats: { spd: 2 } }, { owner: u, core }, [u]),
};
// a broken part that does more than halve its move
const PARTX13 = {
  clockColossus: (core, u, k) => { if (k === 1 && (u.data.clock12 || 9) > 9) { u.data.clock12--; core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: '鐘面碎了，指針倒退到 ' + u.data.clock12 + ' 點！' } }); } },
};
{ const _ph = partHit11; partHit11 = function (core, src, t, k, a) { const P = partsOf11(t), was = P && P[k] && P[k].gone; _ph(core, src, t, k, a); if (P && P[k] && P[k].gone && !was && PARTX13[t.sp]) PARTX13[t.sp](core, t, k); }; }

/* ---------- 每隻的規則：改到原本的機制 ---------- */
// 銀鱗水龍：逆鱗打壞，反擊消失
{ const M = DEF.mechanics.b12_silverWyrm, _mk = M.make; M.make = function (u) { const r = _mk.call(this, u); for (const t of r.triggers || []) t.cond = { ...(t.cond || {}), noPart13: 'm_moonTide' }; return r; }; }
// 熔岩巨人：熔核打壞，熔岩甲消失；暴走時更厚
{ const M = DEF.mechanics.b12_lavaGiant, _mk = M.make; M.make = function (u) { const r = _mk.call(this, u); for (const m of r.mods || []) m.cond = { ...(m.cond || {}), noPart13: 'm_eruption' };
    (r.mods || (r.mods = [])).push({ stage: 'final', who: 'defender', mul: 0.82, cond: { cat: '物', hasPower: 1, ownerLacksStatus: 'cooled12', noPart13: 'm_eruption', rage13: 1 } }); return r; }; }
// 魔人維克托：暴走時模仿 ×1.2
{ const M = DEF.mechanics.b12_victorDemon, _mk = M.make; M.make = function (u) { const r = _mk.call(this, u); for (const m of r.mods || []) if (m.mul === 0.8) m.cond = { ...(m.cond || {}), rage13: 0 };
    (r.mods || (r.mods = [])).push({ stage: 'skill', who: 'attacker', mul: 1.2, cond: { notTag: 'monster_skill', rage13: 1 } }); return r; }; }
// 影將莫爾德：護臂打壞，反擊架勢的傷害減半
{ const M = DEF.mechanics.b12_shadowGeneral, _mk = M.make; M.make = function (u) { const r = _mk.call(this, u), L = [];
    for (const t of r.triggers || []) { const ef = (t.effects || [])[0]; if (ef && ef.type === 'counter' && ef.why === 'stance12') { L.push({ ...t, cond: { ...t.cond, part13: 'm_shadowSlash' }, effects: [{ ...ef, mul: (ef.mul || 1) / 2 }] }); t.cond = { ...t.cond, noPart13: 'm_shadowSlash' }; } }
    r.triggers = (r.triggers || []).concat(L); return r; }; }
// 溝鼠王：肚囊打壞，盛宴不再加威力
{ const _f = BR.FORMULA.feast12; BR.FORMULA.feast12 = (c, v) => pw13(c.src, 'm_kingsFeast') ? 1 : _f(c, v); }
// 霜之女王：暴走 2 層凍結，冰冠打壞 4 層
{ const F = EFFECT_TYPES.frost12, _x = F.exec; F.exec = function (core, ef, ctx, tg) { const q = ctx.owner, N = q && q.sp === 'frostQueen' ? (pw13(q, 'm_absoluteZero') ? 4 : q.data.rage13 ? 2 : 3) : 3;
    if (ef.clear || N === 3) return _x.call(this, core, ef, ctx, tg);
    for (const t of tg) { if (!t || !t.hero || !core.isUp(t)) continue; t.data.frost12 = (t.data.frost12 || 0) + 1;
      if (t.data.frost12 >= N) { t.data.frost12 = 0; core.applyStatus(q, t, 'frozen', {}); core.emit(EVT.MESSAGE, { src: t, tgts: [t], payload: { text: '冰霜累積到 ' + N + ' 層，' + t.name + '被凍住了！' } }); }
      else core.emit(EVT.MESSAGE, { src: t, tgts: [t], payload: { text: '冰霜累積了（' + t.data.frost12 + '／' + N + '）。防禦或火屬性攻擊可以清掉。' } }); } }; }
// 時計巨像：暴走後審判之後從 10 點開始
{ const C = EFFECT_TYPES.clock12, _x = C.exec; C.exec = function (core, ef, ctx, tg) { const u = ctx.owner; if (u && u.data.rage13 && (u.data.clock12 || 9) >= 12) u.data.clock12 = 9; return _x.call(this, core, ef, ctx, tg); }; }
// 收穫魔像：暴走時收割砍兩下
if (DEF.skills.m_scytheSweep) DEF.skills.m_scytheSweep.hitsOf = (core, u) => u && u.data.rage13 ? 2 : 1;

/* ---------- 新招 ---------- */
MOVES.m_gearReverse13 = { n: '逆轉齒輪', t: '一般', cat: '變', fx: 'm_gearReverse13', foe: 1, d: '把齒輪倒轉，讓對手對牠的慣性全部倒過來（強的變弱、弱的變強）。' };
defPut('skills', 'm_gearReverse13', { ...skillFromMove('m_gearReverse13', MOVES.m_gearReverse13, { kind: 'skill', extraTags: ['monster_skill'] }), target: 'self', noHitRoll: true, cooldown: 3,
  effects: [effRegister('skill:m_gearReverse13#e0', { type: 'gear13', target: 'self' })], after: [] });
MOVES.m_ratSwarm13 = { ...MOVES.m_ratSwarm, d: '吹響口哨，叫來兩隻小老鼠。' };
defPut('skills', 'm_ratSwarm13', { ...skillFromMove('m_ratSwarm13', { n: '鼠群', t: '一般', cat: '變', fx: 'mbuff', foe: 1 }, { kind: 'skill', extraTags: ['monster_skill'] }), target: 'self', noHitRoll: true, cooldown: 0,
  effects: [effRegister('skill:m_ratSwarm13#e0', { type: 'summon', sp: 'sewerRat', count: 2, kind: 'minion', maxSide: 4, lv: 22 })], after: [] });
defPut('skills', 'm_ratSwarm13a', { ...skillFromMove('m_ratSwarm13a', { n: '鼠群', t: '一般', cat: '變', fx: 'mbuff', foe: 1 }, { kind: 'skill', extraTags: ['monster_skill'] }), target: 'self', noHitRoll: true, cooldown: 0,
  effects: [effRegister('skill:m_ratSwarm13a#e0', { type: 'summon', sp: 'sewerRat', count: 1, kind: 'minion', maxSide: 4, lv: 22 })], after: [] });
// a mirror that throws back physical hits (水晶魔像 後半戰)
{ const S = DEF.statuses.mirror; defPut('statuses', 'mirrorP13', { ...S, metadata: { n: '鏡面（物理）' }, mods: [{ stage: 'final', who: 'defender', mul: 0.5, cond: { cat: '物' } }],
    triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { cat: '物', srcAlive: 1 }, prio: 5, effects: [{ type: 'damage', target: 'source', ofEvent: 0.6, nonLethal: 1, kind: 'reflect', tags: ['reflect'] }] }] }); }
MOVES.m_mirrorP13 = { n: '紅鏡', t: '一般', cat: '變', fx: 'mbuff', foe: 1, d: '張開紅色的鏡面，反彈物理攻擊。' };
defPut('skills', 'm_mirrorP13', { ...skillFromMove('m_mirrorP13', MOVES.m_mirrorP13, { kind: 'skill', extraTags: ['monster_skill'] }), target: 'self', noHitRoll: true, cooldown: 0,
  effects: [effRegister('skill:m_mirrorP13#e0', { type: 'status', status: 'mirrorP13', target: 'self' })], after: [] });
// monster moves: an internal class (audit) and their own MFX recipe
for (const [k, c] of [['m_gearReverse13', 'buff'], ['m_mirrorP13', 'buff'], ['m_ratSwarm13', MOVES.m_ratSwarm.cls || 'strike']]) { MOVES[k].cls = c; MOVES[k].foe = 1; if (MON_CLASS[c] && !MON_CLASS[c].includes(k)) MON_CLASS[c].push(k); }
MOVES.m_mirrorP13.fx = 'm_mirrorP13'; MOVES.m_ratSwarm13.fx = MOVES.m_ratSwarm.fx;
if (typeof MFX !== 'undefined') { MFX.m_mirrorP13 = function* (U, T, u, t) { mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 12, r1: 42, c: '#ff5050', life: 16 }); mSpawn(this, 'mjag', { x: U.x, y: U.y, r0: 36, r1: 10, c: '#ffb0a0', life: 14 }); Sound.sfx('statUp'); yield* wait(16); }; }
if (typeof FX !== 'undefined') {
  FX.m_gearReverse13 = function* (U, T) { Sound.sfx('charge'); for (let i = 0; i < 3; i++) { mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 10 + i * 10, r1: 44 - i * 6, c: i % 2 ? '#ffd040' : '#a070ff', life: 18 }); }
    for (let i = 0; i < 8; i++) { const a = i * 0.785; this.spawn({ k: 'ring', x: U.x + Math.cos(a) * 26, y: U.y + Math.sin(a) * 12, r0: 2, r1: 7, c: i % 2 ? '#ffd040' : '#c0a0ff', w: 2, life: 16 }); }
    yield* wait(10); Sound.sfx('rock'); mSpawn(this, 'mjag', { x: U.x, y: U.y, r0: 40, r1: 6, c: '#ffd040', life: 14 }); yield* wait(12); };
  if (typeof MFX !== 'undefined') MFX.m_gearReverse13 = FX.m_gearReverse13;
}

/* ---------- AI ---------- */
const hero13 = core => core.units.find(q => q.hero && !q.down);
const cmd13 = (core, u, id) => { const D = DEF.skills[id], t = hero13(core); return { type: 'skill', skill: id, targets: D && D.target === 'self' ? [u.id] : t ? [t.id] : [] }; };
{ const _d = BAI.decide; BAI.decide = function (core, u, o = {}) {
    if (!isB13(u) || core.hasStatus(u, 'charging')) return _d.call(this, core, u, o);
    const d = u.data, sp = u.sp, gap = core.round - (d.lastCharge ?? -9);
    if (o.extra && d.next13) { const id = d.next13; d.next13 = null; if (DEF.skills[id]) return cmd13(core, u, id); }
    if (sp === 'duneWorm' && d.rage13 && gap >= 3) return b12Charge(core, u, 'm_devour');
    return _d.call(this, core, u, o); }; }
{ const _s = BAI.SCRIPT.banditBoss; if (_s) BAI.SCRIPT.banditBoss = function (core, u, ...a) { let r = _s.call(this, core, u, ...a); const d = u.data;
    if (r && r.skill === 'm_axeSpin' && d.hunt2) d.cd = 1;
    if (r && r.skill === 'm_steal' && pw13(u, 'm_knife')) r = b12Pick(core, u, ['m_gutSlash', 'm_knife', 'm_dirtyKick']);
    if (r && ['m_gutSlash', 'm_knife', 'm_dirtyKick'].includes(r.skill) && BR.stage(core, u, 'atk') < 6 && core.rng.chance(0.25)) r = cmd13(core, u, 'm_warCry');
    return r; }; }
{ const _g = BAI.SCRIPT.golem; if (_g) BAI.SCRIPT.golem = function (core, u, ...a) { let r = _g.call(this, core, u, ...a); const W = pw13(u, 'm_rumble');
    if (r && r.skill === 'm_stoneWall' && W) r = b12Pick(core, u, ['m_boulder', 'm_quake']);
    else if (u.data.rage13 && !W && core.round % 2 === 0 && BR.stage(core, u, 'def') < 2 && !(r && DEF.skills[r.skill] && DEF.skills[r.skill].charge)) r = cmd13(core, u, 'm_stoneWall');
    return r; }; }
{ const _c = BAI.SCRIPT.crystalGolem; if (_c) BAI.SCRIPT.crystalGolem = function (core, u, ...a) { let r = _c.call(this, core, u, ...a); const d = u.data;
    if (r && r.skill === 'm_mirror') { if (pw13(u, 'm_prismRay')) r = b12Pick(core, u, ['m_crystalShard', 'm_quake']); else if (d.hunt2 && (d.mirN13 = (d.mirN13 || 0) + 1) % 2 === 0) r = cmd13(core, u, 'm_mirrorP13'); }
    if (r && r.skill === 'm_prismRay' && d.rage13 && !pw13(u, 'm_prismRay') && !core.hasStatus(u, 'mirror')) core.applyStatus(u, u, (d.mirN13 || 0) % 2 ? 'mirrorP13' : 'mirror', {});
    return r; }; }
// the 鏡面 warning says which one is coming
{ const M = DEF.mechanics.b12_crystalGolem, _mk = M.make; M.make = function (u) { const r = _mk.call(this, u);
    r.triggers = (r.triggers || []).filter(t => !(t.on === EVT.ROUND_END && (t.effects || []).some(e => e.type === 'message')));
    r.triggers.push({ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, roundMod12: [4, 3], noPart13: 'm_prismRay' }, prio: 2, effects: [{ type: 'mirTell13' }] }); return r; }; }
EFFECT_TYPES.mirTell13 = { exec(core, ef, ctx) { const u = ctx.owner, phys = u.data.hunt2 && ((u.data.mirN13 || 0) + 1) % 2 === 0;
  core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: phys ? '（水晶表面發出紅光……下一回合會張開紅鏡，物理攻擊會被反彈！改用魔法。）' : '（水晶表面發出藍光……下一回合會張開鏡面，魔法會被反彈！改用物理攻擊。）' } }); } };
{ const _r = B12_SCRIPT.ratKing; if (_r) B12_SCRIPT.ratKing = function (core, u, ...a) { const d = u.data, rats = core.alive(u.side).filter(q => q !== u && q.minion).length, max = d.hunt2 ? 3 : 2, gap = d.rage13 ? 2 : 3;
    if (d.hunt2 && rats < max && core.round >= 2 && core.round - (d.called ?? -9) >= gap) { d.called = core.round; return cmd13(core, u, max - rats >= 2 && !d.rage13 ? 'm_ratSwarm13' : 'm_ratSwarm13a'); }
    return _r.call(this, core, u, ...a); }; }
{ const _c = B12_SCRIPT.clockColossus; if (_c) B12_SCRIPT.clockColossus = function (core, u, ...a) { const h = u.data.clock12 || 9;
    if (h === 10 && u.data.hunt2) { const t = hero13(core); return { type: 'skill', skill: 'm_timeWarp', targets: t ? [t.id] : [] }; }
    const I = u.data.in11; if (h === 9 && I && !core.onCooldown(u, 'm_gearReverse13') && Math.max(I.b, I.p, I.m) - Math.min(I.b, I.p, I.m) >= 40 && core.rng.chance(0.5)) return cmd13(core, u, 'm_gearReverse13');
    return _c.call(this, core, u, ...a); }; }
{ const _v = B12_SCRIPT.victorDemon; if (_v) B12_SCRIPT.victorDemon = function (core, u, ...a) { if (pw13(u, 'm_tyranny')) return null;
    const id = core.data.lastHeroAct, D = id && DEF.skills[id], t = hero13(core);
    if (D && t && D.power && /^t_/.test(id) && !D.tags.includes('basic') && !D.charge && (D.costs || []).every(c => c.res === 'mp') && !core.onCooldown(u, id) && core.rng.chance(0.85)) {
      b12Say(core, u, '魔人維克托冷笑著，擺出了跟你一樣的架勢……（他要模仿「' + D.name + '」！）'); return { type: 'skill', skill: id, targets: D.target === 'self' ? [u.id] : [t.id] }; }
    return _v.call(this, core, u, ...a); }; }

/* ---------- 視覺：登場・必殺預告・階段・部位 ---------- */
// 登場：畫面變暗、頭目跳起來落地、稱號橫幅
{ const _in = Battle.prototype.intro; Battle.prototype.intro = function* (...a) { const v = this.foes()[0]; this.bossIntro13 = v && v.boss && TITLE13[v.sp] ? v : null; try { return yield* _in.apply(this, a); } finally { this.bossIntro13 = null; } }; }
{ const _m = Battle.prototype.msg; Battle.prototype.msg = function* (text, o) { const v = this.bossIntro13; if (v && typeof text === 'string' && text.includes('擋住了去路')) { this.bossIntro13 = null; yield* this.introBanner13(v); } return yield* _m.call(this, text, o); }; }
Battle.prototype.introBanner13 = function* (v) {
  yield* tween(10, k => { this.dim13 = 0.5 * k; });
  yield* tween(9, k => { v.off.y = -16 * Math.sin(k * Math.PI / 2); }); Sound.sfx('quake'); yield* tween(4, k => { v.off.y = -16 * (1 - k); }); v.off.y = 0; this.shake = 26;
  const C = this.center(v); for (let i = 0; i < 14; i++) mSpawn(this, 'mshard', { x: C.x + rnd(-30, 30), y: v.foot - 2, vx: rnd(-20, 20) / 10, vy: -rnd(8, 22) / 10, g: 0.15, s: rnd(2, 4), c: '#b0a890', life: 22 });
  Sound.cry(Object.keys(SPECIES).indexOf(v.sp) + 1, 0.6, 1.8); this.banner13 = { t: 0, sub: '★' + TITLE13[v.sp], main: v.n, col: '#ff6b7a' };
  yield* wait(78); yield* tween(10, k => { this.dim13 = 0.5 * (1 - k); }); this.dim13 = 0; this.banner13 = null; };
Battle.prototype.drawBanner13 = function (x) { const B = this.banner13; if (!B) return; B.t++; const k = clamp(B.t / 10, 0, 1), out = B.life && B.t > B.life - 10 ? clamp((B.life - B.t) / 10, 0, 1) : 1, Y = B.y ?? 92, h = B.small ? 22 : 34;
  x.save(); x.globalAlpha = out; const w = Math.round(W * k); x.fillStyle = 'rgba(8,4,12,0.82)'; x.fillRect(W - w, Y, w, h); x.fillStyle = B.col; x.fillRect(W - w, Y, w, 1); x.fillRect(W - w, Y + h - 1, w, 1);
  if (k >= 1) { const dx = Math.round((1 - clamp((B.t - 10) / 8, 0, 1)) * 20);
    if (B.small) Font.drawC(x, B.main, W / 2 + dx, Y + 3, B.col, '#000000', 12);
    else { Font.drawC(x, B.sub, W / 2 + dx, Y + 2, '#ffd0a0', '#000000', 9); Font.drawC(x, B.main, W / 2 - dx, Y + 13, '#ffffff', '#000000', 14); } }
  x.restore(); if (B.life && B.t >= B.life) this.banner13 = null; };
// the 必殺 the boss is charging (from the core: the view knows only that it charges)
const sigOf13 = v => { const u = v && v.u; if (!isB13(u)) return null; const ch = u.statuses.find(s => s.id === 'charging'); return ch && baseId13(ch.data.skill) === SIG13[u.sp] ? ch.data.skill : null; };
{ const _o = Battle.prototype.drawOverlay; Battle.prototype.drawOverlay = function (x) { _o.call(this, x);
    if (this.dim13 > 0) { x.fillStyle = 'rgba(0,0,0,' + this.dim13 + ')'; x.fillRect(0, 0, W, BH); }
    const v = this.foes().find(q => q.charging && sigOf13(q)); if (v) { const a = 0.35 + 0.25 * Math.sin(this.t / 6);
      for (const [x0, y0, x1, y1] of [[0, 0, 0, 18], [0, BH, 0, BH - 18]]) { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(220,20,30,' + a + ')'); g.addColorStop(1, 'rgba(220,20,30,0)'); x.fillStyle = g; x.fillRect(0, Math.min(y0, y1), W, 18); }
      for (const [x0, x1] of [[0, 14], [W, W - 14]]) { const g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(220,20,30,' + a + ')'); g.addColorStop(1, 'rgba(220,20,30,0)'); x.fillStyle = g; x.fillRect(Math.min(x0, x1), 0, 14, BH); } } }; }
{ const _b = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _b.call(this, x); if (this.boxF < -20) return;
    const L = this.foes(), v = L.length === 1 && !this.multi ? L[0] : null, id = v && v.charging && sigOf13(v);
    if (id) { const py = 6, pe = plateExtra(), Y = py + 57 + pe, ans = (ANS13[v.sp] || ['防禦', '破防打斷']).slice(); if (v.sp === 'harvestGolem' && pw13(v.u, 'm_harvest')) ans.unshift('防禦');
      const items = ['應對'].concat(ans), ws = items.map(s => Math.ceil(Font.width(s, 8)) + 8), tot = ws.reduce((a, b) => a + b + 3, -3); let X = Math.max(28, Math.round((W - tot) / 2));
      items.forEach((s, i) => { x.fillStyle = i ? 'rgba(20,40,70,0.92)' : 'rgba(120,10,20,0.92)'; x.fillRect(X, Y, ws[i], 11); x.fillStyle = i ? '#8ad0ff' : '#ff8080'; x.fillRect(X, Y + 10, ws[i], 1);
        Font.draw(x, s, X + 4, Y - 1, i ? '#e0f4ff' : '#ffe0e0', '#000000', 8); X += ws[i] + 3; }); }
    this.drawBanner13(x); }; }
// 階段轉換：停一下、白閃、震動、橫幅；之後背景染色＋氣場
{ const H = Battle.prototype.handlers, _p = H.PHASE; H.PHASE = function* (e, s, t, P) { const big = s && s.u && isB13(s.u) && (P.key === 'hunt2' || P.key === 'rage13');
    if (big) { const rage = P.key === 'rage13'; Sound.sfx('quake'); this.spawn({ k: 'flash', c: '#ffffff', a: 0.7, life: 10 }); this.shake = 30; yield* wait(12);
      this.phase13 = rage ? 2 : Math.max(this.phase13 || 0, 1); this.banner13 = { t: 0, main: rage ? '— 暴走 —' : '— 後半戰 —', col: rage ? '#ff4040' : '#ffb060', small: 1, y: 100, life: 70 };
      const C = this.center(s); for (let i = 0; i < 18; i++) { const a = i * 0.35; mSpawn(this, 'mshard', { x: C.x, y: C.y, vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 1.6 - 0.6, g: 0.05, s: 3, c: rage ? '#ff5030' : '#ffb060', life: 26 }); } yield* wait(20); }
    return yield* _p.call(this, e, s, t, P); }; }
{ const _hm = hd2dMotes; hd2dMotes = function (b, x, front) { const r = _hm(b, x, front); const ph = b && b.phase13; if (!ph || !b.foes) return r;
    if (!front) { x.fillStyle = ph >= 2 ? 'rgba(90,0,10,0.26)' : 'rgba(150,30,20,0.12)'; x.fillRect(0, 0, W, BH);
      for (const v of b.foes()) { if (!v.u || !isB13(v.u) || v.alpha <= 0) continue; const C = b.center(v), rr = (v.bbh || 48) * 0.75, a = (ph >= 2 ? 0.34 : 0.2) * (0.75 + 0.25 * Math.sin(b.t / 9));
        const g = x.createRadialGradient(C.x, C.y, 4, C.x, C.y, rr); g.addColorStop(0, ph >= 2 ? 'rgba(255,60,30,' + a + ')' : 'rgba(255,170,80,' + a + ')'); g.addColorStop(1, 'rgba(255,60,30,0)'); x.fillStyle = g; x.fillRect(C.x - rr, C.y - rr, rr * 2, rr * 2); } }
    else if (ph >= 2) for (let i = 0; i < 16; i++) { const px = (i * 47 + b.t * (0.3 + (i % 3) * 0.15)) % W, py = BH - ((b.t * (0.6 + (i % 4) * 0.2) + i * 31) % BH); x.fillStyle = i % 2 ? 'rgba(255,140,40,0.8)' : 'rgba(255,220,120,0.7)'; x.fillRect(Math.round(px), Math.round(py), 1, 1 + (i % 2)); }
    return r; }; }
// 部位：打壞的那一塊留下裂痕・缺角（Codex 的打壞版圖到之前）
const crack13 = (g, X, Y, seed) => { const R = n => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 * n; };
  g.save(); g.globalCompositeOperation = 'source-atop'; g.lineWidth = 1;
  for (let i = 0; i < 5; i++) { let a = R(6.28), x = X, y = Y; g.strokeStyle = 'rgba(18,6,10,0.95)'; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 3; s++) { a += R(1.2) - 0.6; x += Math.cos(a) * (2 + R(3)); y += Math.sin(a) * (2 + R(3)); g.lineTo(Math.round(x) + 0.5, Math.round(y) + 0.5); } g.stroke(); }
  g.fillStyle = 'rgba(30,10,14,0.55)'; g.fillRect(X - 3, Y - 2, 6, 4); g.globalCompositeOperation = 'destination-out'; g.fillRect(X - 1, Y - 1, 2, 2); g.fillRect(X + 2, Y - 3, 1, 2); g.restore(); };
{ const _rf = Battle.prototype.renderFoe; Battle.prototype.renderFoe = function (v, tint) { const im = _rf.call(this, v, tint); const u = v.u, P = u && u.data.parts11, A = PART_AT13[v.sp];
    if (!im || tint || !P || !A || !v.spx || !P.some(p => p.gone)) return im; const g = im.getContext('2d'), S = v.spx, pad = typeof PX_PAD !== 'undefined' ? PX_PAD : 0;
    P.forEach((p, k) => { if (p.gone && A[k]) crack13(g, Math.round(pad + A[k][0] * S.w), Math.round(pad + A[k][1] * S.h), 7 + k * 13); }); return im; }; }
// the moment it breaks: pieces fly off that spot
{ const H = Battle.prototype.handlers, _m = H.MESSAGE; H.MESSAGE = function* (e, s, t, P) { if (P && P.part11 && s && s.img && s.img.bb && PART_AT13[s.sp]) { const u = s.u, k = u && u.data.parts11 ? u.data.parts11.findIndex(p => p.n === P.pn) : -1, A = PART_AT13[s.sp][k];
      if (A && s.spx) { const pad = typeof PX_PAD !== 'undefined' ? PX_PAD : 0, X = s.x + s.off.x - s.img.bb.cx + pad + A[0] * s.spx.w, Y = s.foot + s.off.y - s.img.bb.bot + pad + A[1] * s.spx.h;
        Sound.sfx('rock'); Sound.sfx('crit'); this.shake = 18; s.flash = 20; for (let i = 0; i < 16; i++) mSpawn(this, 'mshard', { x: X, y: Y, vx: rnd(-25, 25) / 10, vy: -rnd(5, 28) / 10, g: 0.16, s: rnd(2, 4), c: i % 3 ? '#e8d8b0' : '#ffffff', life: 28 });
        this.pops.push({ x: X, y: Y - 10, s: 'BREAK!', c: '#ffb040', t: 0, big: 1 }); yield* wait(10); } }
    yield* _m.call(this, e, s, t, P); }; }
// 圖鑑・遭遇卡：稱號
{ const _ec = encounterCard; encounterCard = function (sp, lv, key, kind, extra) { return _ec(sp, lv, key, kind, extra || (kind === 'boss' && TITLE13[sp] ? '★' + TITLE13[sp] : extra)); }; }
GROW12.push(['頭目的打法', '每隻頭目都有一招「必殺技」：沒有應對會被打掉最大 HP 的 85%。蓄力時畫面邊緣會變紅，名牌下面寫著該怎麼應對（防禦、破防打斷、先解毒……）。HP 一半進入後半戰（換弱點、規則改變），剩 1/4 會暴走。']);
// 破防中的魔物躲不開（打部位那一下不會落空）
{ const _hc = BR.hitChance; BR.hitChance = function (core, src, tgt, skill) { if (tgt && !tgt.hero && core.hasStatus(tgt, 'broken')) return 1; return _hc.call(this, core, src, tgt, skill); }; }
