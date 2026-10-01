/* ===================== v11 戰鬥核心 v2 — 資料：機制（英雄核心循環、元素反應、破防、階段、頭目）＋ 技能進化 ＋ 敵人與 AI =====================
   Mechanics are trigger sets attached to a unit (or to the battle). They use the same effect language as everything else. */
Object.assign(COND, {
  evEl: (c, v) => !!c.ev && (Array.isArray(v) ? v.includes(c.ev.payload.el) : c.ev.payload.el === v),
  evHit: (c, v) => !!c.ev && (c.ev.payload.kind === 'hit') === !!v,
  phaseBelow: (c, v) => !!c.owner && (c.owner.data.phase || 0) < v,
  dataIs: (c, v) => !!c.owner && c.owner.data[v[0]] === v[1],
  dataNot: (c, v) => !!c.owner && c.owner.data[v[0]] !== v[1],
  heroGuarding: (c, v) => c.core.alive('A').some(u => u.hero && c.core.hasStatus(u, 'guard')) === !!v,
  roundEvery: (c, v) => c.core.round % v === 0,
  ownerHasStatus: (c, v) => !!c.owner && c.core.hasStatus(c.owner, v),
  ownerLacksStatus: (c, v) => !!c.owner && !c.core.hasStatus(c.owner, v),
});
/* ---------- extra effect types that are resource rules ---------- */
Object.assign(EFFECT_TYPES, {
  // combo (連段): rotating different active skills raises it, repeating one resets it (spec 13: a resource with its own generation rule)
  rotate_res: { exec(core, ef, ctx) { const u = ctx.owner, last = u.data['last_' + ef.res], sk = ctx.trigEv && ctx.trigEv.payload.skill;
    if (!(ef.res in u.res)) return; if (sk && sk !== last) core.changeRes(u, ef.res, 1, { why: 'rotate' }); else if (!ef.keep) core.changeRes(u, ef.res, -u.res[ef.res], { why: 'repeat' }); u.data['last_' + ef.res] = sk; } },
  // the weapon special fires at the action's target when the gauge fills (the gauge empties first, so it can't loop)
  fire_special: { exec(core, ef, ctx) { const u = ctx.owner, id = u.data.wspSkill; if (!id || !DEF.skills[id] || !core.isUp(u)) return;
    const want = core.act && core.act.tg ? core.act.tg.map(i => core.byId[i]).find(t => core.isUp(t) && t.side !== u.side) : null, t = want || core.foesOf(u)[0]; if (!t) return;
    core.changeRes(u, 'wc', -u.res.wc, { why: 'special' }); core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: 'special', name: u.data.wspName } });
    const sk = DEF.skills[id]; core.doSkill(u, sk, sk.target === 'self' ? [u] : [t], { meta: { release: 1, follow: 1 } }); } },
});
/* ---------- the hero's core loop: basic hits feed MP, 招式點 and 特技; being hit feeds 招式點; skill rotation feeds 連段 ---------- */
defPut('mechanics', 'heroCore', { make: (u) => ({ mods: [{ stage: 'talent', who: 'attacker', mul: { f: 'comboStep', v: u.data.comboStep || 6 }, cond: { hasPower: 1 } }],
  triggers: [
    { on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { tag: 'basic', evHit: 1 }, limit: { perAction: 1 }, system: 1, prio: 9, effects: [
      { type: 'resource', target: 'self', res: 'mp', amount: 2 + Math.floor((u.max.mp || 0) / 25) + (u.mods.reduce((a, m) => a + (m.atkMp || 0), 0)), why: 'basic' },
      { type: 'resource', target: 'self', res: 'sgp', amount: 1, why: 'hit' }, { type: 'resource', target: 'self', res: 'wc', amount: 1, why: 'hit' }] },
    { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hpLost: 1 }, limit: { perAction: 1 }, system: 1, effects: [{ type: 'resource', target: 'self', res: 'sgp', amount: 1, why: 'hurt' }] },
    { on: EVT.RESOURCE_FULL, phase: 'POST', role: 'tgt', cond: { evRes: 'wc' }, prio: 6, effects: [{ type: 'fire_special' }] },
    { on: EVT.DEFEND, phase: 'POST', role: 'src', system: 1, effects: [{ type: 'resource', target: 'self', res: 'mp', pct: 0.12, min: 1, why: 'breath' }] },
    { on: EVT.SKILL_USE, phase: 'POST', role: 'src', tags: ['orb'], system: 1, effects: [{ type: 'rotate_res', res: 'combo', keep: !!u.data.comboKeep }] },
    ...(u.data.comboGuard ? [] : [{ on: EVT.DEFEND, phase: 'POST', role: 'src', system: 1, effects: [{ type: 'resource', target: 'self', res: 'combo', set: 0 }] }, { on: EVT.ITEM_USE, phase: 'POST', role: 'src', system: 1, effects: [{ type: 'resource', target: 'self', res: 'combo', set: 0 }] }]),
    // 氣: at 5 the next damaging skill is a sure crit and spends it all
    { on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { ownerResAtLeast: ['chi', 5], hasPower: 1 }, limit: { perAction: 1 }, effects: [{ type: 'resource', target: 'self', res: 'chi', set: 0, why: 'release' }] },
  ].concat(u.mods.some(m => m.chiCrit) ? [] : []) }) });
BR.FORMULA.comboStep = (c, v) => 1 + v * (c.src.res.combo || 0) / 100;
defPut('passives', 'chiCrit', { make: () => ({ mods: [{ stage: 'talent', who: 'attacker', crit: true, cond: { ownerResAtLeast: ['chi', 5], hasPower: 1 } }] }) });
/* ---------- allies who step into elite / boss fights (格倫・莉婭, v9) ---------- */
defPut('mechanics', 'allyGren', { make: u => ({ triggers: [{ on: EVT.ACTION_END, phase: 'POST', cond: { foeAliveBelow: 0.6 }, limit: { perBattle: 1 + (u.data.allyMore || 0) }, prio: -5, effects: [
  { type: 'message', key: 'ally_gren', target: 'self' }, { type: 'damage', target: 'random_enemy', power: Math.round((90 + 15 * (u.data.wtier || 3)) * (1 + (u.data.allyUp || 0) / 100)), kind: 'ally', tags: ['ally'] },
  { type: 'stage', target: 'random_enemy', stats: { def: -1 } }] }] }) });
defPut('mechanics', 'allyLia', { make: u => ({ triggers: [{ on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.4, ownerAlive: 1 }, limit: { perBattle: 1 + (u.data.allyMore || 0) }, prio: -5, effects: [
  { type: 'message', key: 'ally_lia', target: 'self' }, { type: 'heal', target: 'self', pct: 0.35 * (1 + (u.data.allyUp || 0) / 100), kind: 'ally' }, { type: 'cleanse', target: 'self' }] }] }) });
/* ---------- element reactions (the whole battle): 潮濕+雷 感電、纏繞+火 燎原、灼傷+水 蒸氣 ---------- */
const ELEMENT_REACTIONS = [
  { on: EVT.DAMAGE, phase: 'PRE', cond: { evHit: 1, evEl: '雷', tgtStatus: 'wet' }, effects: [{ type: 'modify', mul: 1.5, note: 'shock' }] },
  { on: EVT.DAMAGE, phase: 'PRE', cond: { evHit: 1, evEl: '火', tgtStatus: 'tangle' }, effects: [{ type: 'modify', mul: 1.5, note: 'ignite' }] },
  { on: EVT.DAMAGE, phase: 'PRE', cond: { evHit: 1, evEl: '水', tgtStatus: 'brn' }, effects: [{ type: 'modify', mul: 1.3, note: 'steam' }] },
  { on: EVT.DAMAGE, phase: 'POST', prio: 20, cond: { evHit: 1, evEl: '雷', tgtStatus: 'wet' }, effects: [{ type: 'remove_status', target: 'event_target', status: 'wet', why: 'shock' }, { type: 'message', key: 'shock', target: 'event_target' }, { type: 'status', target: 'event_target', status: 'par', secondary: 1, cond: { tgtAlive: 1 } }] },
  { on: EVT.DAMAGE, phase: 'POST', prio: 19, cond: { evHit: 1, evEl: '水', tgtAlive: 1 }, effects: [{ type: 'status', target: 'event_target', status: 'wet', dur: 3 }] },
  { on: EVT.DAMAGE, phase: 'POST', prio: 19, cond: { evHit: 1, evEl: '火', tgtStatus: 'wet' }, effects: [{ type: 'remove_status', target: 'event_target', status: 'wet', why: 'dry' }] },
  { on: EVT.DAMAGE, phase: 'POST', prio: 20, cond: { evHit: 1, evEl: '火', tgtStatus: 'tangle' }, effects: [{ type: 'remove_status', target: 'event_target', status: 'tangle', why: 'ignite' }, { type: 'message', key: 'ignite', target: 'event_target' }, { type: 'status', target: 'event_target', status: 'brn', secondary: 1, cond: { tgtAlive: 1 } }] },
  { on: EVT.DAMAGE, phase: 'POST', prio: 18, cond: { evHit: 1, evEl: '草', tgtAlive: 1 }, effects: [{ type: 'status', target: 'event_target', status: 'tangle', dur: 3 }] },
  { on: EVT.DAMAGE, phase: 'POST', prio: 20, cond: { evHit: 1, evEl: '水', tgtStatus: 'brn' }, effects: [{ type: 'remove_status', target: 'event_target', status: 'brn', why: 'steam' }] },
];
// tangle only sticks when it was not there before the hit; wet/tangle refresh is handled by the status' stack rule
DEF.statuses.tangle.stack = 'none';
defPut('mechanics', 'elementReactions', { triggers: ELEMENT_REACTIONS });
/* ---------- break shields (v19): weakness and crit hits chip them, at 0 the monster is broken ---------- */
defPut('mechanics', 'breakGauge', { triggers: [
  { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, weakHit: 1, ownerLacksStatus: 'broken' }, prio: 10, effects: [{ type: 'break_chip', target: 'self', n: 1, why: 'weak' }] },
  { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, crit: 1, ownerLacksStatus: 'broken' }, prio: 10, effects: [{ type: 'break_chip', target: 'self', n: 1, why: 'crit' }] }] });
/* ---------- HP phases for elites and bosses without a scripted fight ---------- */
defPut('mechanics', 'phases', { make: u => { const prof = u.data.profile || 'brute', b = prof === 'guard' ? { def: 1 } : prof === 'trick' ? { spe: 1 } : { atk: 1 }, extra = PHASE_MOVES[u.sp];
  return { triggers: [
    { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.6, ownerAlive: 1, phaseBelow: 1 }, prio: 3, effects: [{ type: 'phase', phase: 1, key: 'eyes', addSkills: extra ? [extra] : [] }, { type: 'stage', target: 'self', stats: b, dur: 4 }].concat(extra ? [{ type: 'message', key: 'new_stance', target: 'self' }] : []) },
    { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.3, ownerAlive: 1, phaseBelow: 2 }, prio: 3, effects: u.boss ? [{ type: 'phase', phase: 2, key: 'frenzy' }, { type: 'status', target: 'self', status: 'frenzy' }] : [{ type: 'phase', phase: 2, key: 'last' }, { type: 'stage', target: 'self', stats: { atk: 1, spa: 1 }, dur: 5 }] }] }; } });
defPut('mechanics', 'berserk', { triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { ownerHpBelow: 0.4, ownerAlive: 1, dataNot: ['raged', 1] }, prio: 4, effects: [{ type: 'set_data', onUnit: 1, key: 'raged', value: 1 }, { type: 'message', key: 'raged', target: 'self' }, { type: 'stage', target: 'self', stats: { atk: 2 } }] }] });
/* ---------- scripted bosses ---------- */
// 古岩魔像: 50% → red core (攻+1, new pool, 岩石粉碎拳 every 3–4 turns); 25% → the ruin collapses (rocks every round unless you guard)
defPut('mechanics', 'golem', { triggers: [
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.5, ownerAlive: 1, phaseBelow: 1 }, prio: 6, effects: [{ type: 'phase', phase: 1, key: 'golem_core', setSkills: ['m_rockfall', 'm_quake', 'm_boulder'] }, { type: 'set_data', onUnit: 1, key: 'fistCD', value: 1 }, { type: 'stage', target: 'self', stats: { atk: 1 } }] },
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.25, ownerAlive: 1, phaseBelow: 2 }, prio: 6, effects: [{ type: 'phase', phase: 2, key: 'golem_collapse' }] },
  { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, dataIs: ['phase', 2], heroGuarding: 0 }, prio: 2, effects: [{ type: 'damage', target: 'all_enemies', pctMax: 0.1, kind: 'rocks', tags: ['environment'] }] },
  { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, dataIs: ['phase', 2], heroGuarding: 1 }, prio: 2, effects: [{ type: 'message', key: 'rocks_blocked', target: 'all_enemies' }] }] });
// 盜賊頭目: 旋風斧 every 3–4 turns, steals gold, at 50% whistles for two henchmen (real units now)
defPut('mechanics', 'banditBoss', { triggers: [
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.5, ownerAlive: 1, phaseBelow: 1 }, prio: 6, effects: [{ type: 'phase', phase: 1, key: 'whistle' }, { type: 'summon', sp: 'bandit', count: 2, kind: 'minion', maxSide: 3 }] }] });
// 水晶魔像: mirror every 4th turn; at 70% crystal shards (damage −40%, it regenerates, hits break them); at 35% the sewer floods (you get wet every round)
defPut('mechanics', 'crystalGolem', { triggers: [
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.7, ownerAlive: 1, phaseBelow: 1 }, prio: 6, effects: [{ type: 'phase', phase: 1, key: 'shards' }, { type: 'status', target: 'self', status: 'shards', delta: 2 }] },
  { on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.35, ownerAlive: 1, phaseBelow: 2 }, prio: 6, effects: [{ type: 'phase', phase: 2, key: 'flood' }] },
  { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, dataIs: ['phase', 2] }, prio: 3, effects: [{ type: 'status', target: 'all_enemies', status: 'wet', dur: 2 }, { type: 'message', key: 'flood_wet', target: 'all_enemies' }] }] });
// 苔蘚巨人 with 提姆 on your side (q2): his arrows hit it every round
defPut('mechanics', 'timArrows', { triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, prio: 4, effects: [{ type: 'message', key: 'tim', target: 'self' }, { type: 'damage', target: 'self', pctMax: 0.06, kind: 'arrow', tags: ['ally'] }] }] });
/* ---------- monster-only support skills used by the AI ---------- */
defPut('skills', 'm_regrow', { ...skillFromMove('m_regrow', { n: '吸收養分', t: '一般', cat: '變', heal: 0.3, fx: 'regrow', foe: 1 }, { kind: 'skill', extraTags: ['monster_skill'] }) });
defPut('skills', 'm_mirror', { ...skillFromMove('m_mirror', { n: '鏡面', t: '一般', cat: '變', fx: 'mbuff', foe: 1 }, { kind: 'skill', extraTags: ['monster_skill'] }), effects: [{ type: 'status', status: 'mirror', dur: 2, target: 'self' }], target: 'self', noHitRoll: true });
defPut('skills', 'm_steal', { ...skillFromMove('m_steal', { n: '搶奪', t: '一般', cat: '變', acc: 100, fx: 'steal', foe: 1 }, { kind: 'skill', extraTags: ['monster_skill'] }), effects: [{ type: 'steal_gold', pct: 0.1, min: 50 }] });

/* ---------- skill evolutions (orbs): one passive per evolution code, keyed by the skill ---------- */
const EVO_KEYS = ['brn', 'psn', 'par', 'slp', 'drain', 'mp', 'shield', 'atk+1', 'spa+1', 'def+1', 'spd+1', 'spe+1', 'fatk-1', 'fdef-1', 'fspe-1', 'fspd-1', 'wet', 'tangle', 'cheap', 'first', 'hit+1', 'heal+25', 'heal+15', 'cure', 'spec+1', 'crit', 'pow25', 'pow20crit'];
defPut('passives', 'evo', { make: v => { const [k, n] = evoCode(v.code), S = { skillIs: v.skill }, after = effects => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: S, effects }] }), hit = effects => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { ...S, tgtAlive: 1, hpLost: 1, evHit: 1 }, limit: { perAction: 1 }, effects }] }), sk = DEF.skills[v.skill] || {};
  if (['brn', 'psn', 'par', 'slp'].includes(k)) return hit([{ type: 'status', target: 'event_target', status: k, chance: n / 100, secondary: 1 }]);
  if (k === 'drain') return after([{ type: 'heal', target: 'self', ofEvent: n / 100, field: 'total', kind: 'drain', quiet: 1 }]);
  if (k === 'mp') return after([{ type: 'resource', target: 'self', res: 'mp', amount: n }]);
  if (k === 'shield') return sk.effects && sk.effects.some(e => e.status === 'barrier') ? { mods: [{ stage: 'skill', durAdd: 1, cond: S }] } : after([{ type: 'status', target: 'self', status: 'barrier', dur: n }]);
  if (/^(atk|spa|def|spd|spe)\+1$/.test(k)) return after([{ type: 'stage', target: 'self', stats: { [k.slice(0, 3)]: 1 } }]);
  if (/^f(atk|def|spe|spd)-1$/.test(k)) return hit([{ type: 'stage', target: 'event_target', stats: { [k.slice(1, 4)]: -1 } }]);
  if (k === 'wet' || k === 'tangle') return hit([{ type: 'status', target: 'event_target', status: k, dur: 3 }]);
  if (k === 'cheap') return { mods: [{ stage: 'skill', costMul: 0.6, res: 'mp', cond: S }] };
  if (k === 'first') return { mods: [{ stage: 'skill', prioSkill: v.skill }] };
  if (k === 'hit+1') return sk.hits ? { mods: [{ stage: 'skill', hitsAdd: 1, cond: S }] } : hit([{ type: 'damage', target: 'event_target', ofEvent: 0.4, kind: 'pursuit', tags: ['multi_hit'] }]);
  if (k === 'heal+25') return { mods: [{ stage: 'skill', healMul: 1.25, cond: S }] };
  if (k === 'heal+15') return after([{ type: 'heal', target: 'self', pct: 0.15, quiet: 1 }]);
  if (k === 'cure') return after([{ type: 'cleanse', target: 'self' }]);
  if (k === 'spec+1') return after([{ type: 'resource', target: 'self', res: 'wc', amount: 1, why: 'evo' }]);
  if (k === 'crit') return { mods: [{ stage: 'skill', critAdd: 0, critXSkill: 2, cond: S }] };
  if (k === 'pow25') return { mods: [{ stage: 'skill', powMul: 1.25, cond: S }] };
  if (k === 'pow20crit') return { mods: [{ stage: 'skill', powMul: 1.2, critXSkill: 2, cond: S }] };
  return {}; }, metadata: { codes: EVO_KEYS } });

/* ---------- enemies (spec 41): stats come from the existing rules (makeFoe chain), everything else is data ---------- */
const BOSS_SCRIPT = { golem: 'golem', banditBoss: 'banditBoss', crystalGolem: 'crystalGolem' };
for (const sp in SPECIES) { const S = SPECIES[sp]; const learn = [...new Set((S.learn || []).map(L => Array.isArray(L) ? L[1] : L))].filter(id => DEF.skills[id]);
  defPut('enemies', sp, { tags: ['foe', 'fam:' + (S.fam || 'beast')].concat(S.rare ? ['rare'] : []), skills: learn.length ? learn : ['m_tackle'], fam: S.fam, trait: S.trait || null,
    profile: (typeof aiProfile === 'function' ? aiProfile({ sp }) : 'brute'), script: BOSS_SCRIPT[sp] || null, metadata: { n: S.n } }); }
const BD = {
  // a unit spec for one enemy (used at battle start and by summon effects)
  unitForEnemy(core, sp, lv, kind, side, idx, o = {}) {
    const E = DEF.enemies[sp]; if (!E || !MON_PANEL[sp]) { bvErr('enemy', sp + ' missing'); return null; }
    const f = withRng(core.rng, () => makeFoe(sp, lv, kind)), s = { ...f.stats };
    const m = o.multi ? BR.MULTI_FOE[o.multi] : null; if (m && kind === 'wild') { s.hp = Math.max(1, Math.round(s.hp * m.hp)); s.atk = Math.max(1, Math.round(s.atk * m.pow)); s.spa = Math.max(1, Math.round(s.spa * m.pow)); }
    if (kind === 'minion') { s.hp = Math.max(1, Math.round(s.hp * 0.55)); s.atk = Math.round(s.atk * 0.8); s.spa = Math.round(s.spa * 0.8); }
    const D = typeof diffOf === 'function' ? diffOf() : { brk: 0 }, base = kind === 'boss' ? 5 : kind === 'elite' ? 3 : f.rare ? 2 : 0;
    const brkMax = base ? base + (D.brk || 0) + ((typeof ngOf === 'function' && ngOf()) ? 1 : 0) + (o.rematch ? 1 : 0) : 0;
    const mech = []; if (brkMax) mech.push('breakGauge'); if (E.trait === 'berserk') mech.push('berserk');
    const scripted = E.script && !(sp === 'golem' && o.rematch); if (scripted) mech.push(E.script); else if (kind === 'elite' || kind === 'boss') mech.push('phases');
    for (const x of o.mechanics || []) mech.push(x);
    const skills = (f.moves || []).map(x => x.id).filter(id => DEF.skills[id]);
    return { id: (side === 'A' ? 'A' : 'F') + idx, side, name: f.n, sp, fam: f.fam, lv: f.lv, kind, rare: f.rare, stats: s, hp: s.hp, skills: skills.length ? skills : E.skills.slice(-4),
      brkMax, data: { mechanics: mech, profile: E.profile, swift: E.trait === 'swift', healer: E.trait === 'healer', script: scripted ? E.script : null, heals: 0, rematch: !!o.rematch, noEscape: kind === 'boss' }, tags: E.tags.slice() };
  },
};
/* ---------- AI (spec 49: decisions become ActionCommands) ---------- */
const BAI = {
  decide(core, u, o = {}) {
    if (u.hero) return BAI.hero(core, u);
    const H = core.foesOf(u); if (!H.length) return { type: 'wait' }; const tgt = H.slice().sort((a, b) => a.res.hp / a.max.hp - b.res.hp / b.max.hp)[0], tid = [tgt.id], R = core.rng;
    const S = u.data.script && BAI.SCRIPT[u.data.script]; if (S) { const r = S(core, u, tgt, o); if (r) return r; }
    if (u.rare && core.round >= 3 && R.chance(0.45)) return { type: 'flee' };
    if (u.data.healer && u.res.hp < u.max.hp * 0.5 && (u.data.heals || 0) < 2 && R.chance(0.6)) { u.data.heals = (u.data.heals || 0) + 1; return { type: 'skill', skill: 'm_regrow', targets: [u.id] }; }
    let pool = u.skills.filter(id => DEF.skills[id]); if (!pool.length) pool = ['m_tackle'];
    // a charged attack needs a breather: never two charges within 3 turns
    const canCharge = core.round - (u.data.lastCharge ?? -9) >= 3; if (!canCharge && pool.some(id => !DEF.skills[id].charge)) pool = pool.filter(id => !DEF.skills[id].charge);
    const w = pool.map(id => { const k = DEF.skills[id], a = k.ai || {}; let v = 10;
      if (a.st) v = core.majorOf(tgt) ? 0 : 6;
      if (a.stat && a.stat.who === 'self') { const key = Object.keys(a.stat).find(q => q !== 'who'); v = BR.stage(core, u, key) >= 2 ? 1 : 5; }
      if (a.stat && a.stat.who === 'foe') { const key = Object.keys(a.stat).find(q => q !== 'who'); v = BR.stage(core, tgt, key) <= -2 ? 1 : 5; }
      if (k.power && (u.elite || u.boss)) { const rs = (tgt.stats.resist || {})[k.el] || 0; v *= (1 - rs / 100) * (1 + k.power / 60); }
      if (a.drain && u.res.hp > u.max.hp * 0.8) v *= 0.6; return Math.max(0, v); });
    let id = R.weighted(pool, w); id = BAI.tactics(core, u, tgt, pool, id);
    if (DEF.skills[id].charge) u.data.lastCharge = core.round;
    return { type: 'skill', skill: id, targets: DEF.skills[id].target === 'self' ? [u.id] : tid };
  },
  // v19 tactics: killer instinct, reading a guarding hero, re-applying a cured ailment, personality
  tactics(core, u, H, pool, base) {
    const R = core.rng, D = typeof diffOf === 'function' ? diffOf() : { ai: 0 }, prof = u.data.profile || 'brute', smart = Math.min(1, (u.elite || u.boss ? 0.75 : 0.35) + (D.ai || 0) * 0.15 + ((typeof ngOf === 'function' && ngOf()) ? 0.1 : 0));
    const K = id => DEF.skills[id], dmg = pool.filter(id => K(id).power && !K(id).charge), sts = pool.filter(id => K(id).ai && K(id).ai.st && !core.majorOf(H));
    const selfB = pool.filter(id => { const s = K(id).ai && K(id).ai.stat; return s && s.who === 'self' && Object.keys(s).some(k => k !== 'who' && BR.stage(core, u, k) < 2); });
    const debuffs = pool.filter(id => { const s = K(id).ai && K(id).ai.stat; return s && s.who === 'foe' && Object.keys(s).some(k => k !== 'who' && BR.stage(core, H, k) > -2); });
    const charges = pool.filter(id => K(id).charge), last = core.data.lastHeroAct, best = () => { let bi = base, bv = -1; for (const id of dmg) { const k = K(id), rs = (H.stats.resist || {})[k.el] || 0, v = k.power * (k.acc || 100) / 100 * (1 - rs / 100); if (v > bv) { bv = v; bi = id; } } return bi; };
    if (H.res.hp < H.max.hp * 0.35 && dmg.length && R.chance(0.25 + 0.5 * smart)) return best();
    if (last === 'defend' && R.chance(0.6 * smart)) { if (charges.length && !core.hasStatus(u, 'charging') && core.round - (u.data.lastCharge ?? -9) >= 3) return R.pick(charges); const alt = [...selfB, ...debuffs, ...sts]; if (alt.length) return R.pick(alt); }
    if (core.data.cured && sts.length && R.chance(0.5 * smart + 0.1)) { core.data.cured = false; return R.pick(sts); }
    if (prof === 'trick' && R.chance(0.3 * smart + 0.1)) { const alt = [...sts, ...debuffs]; if (alt.length) return R.pick(alt); }
    if (prof === 'guard' && u.res.hp < u.max.hp * 0.55 && R.chance(0.3 * smart + 0.1) && selfB.length) return R.pick(selfB);
    if (prof === 'brute' && R.chance(0.3 * smart) && dmg.length) return best();
    return base;
  },
  SCRIPT: {
    golem(core, u) { if ((u.data.phase || 0) < 1) return null; if ((u.data.fistCD ?? 1) <= 0) { u.data.fistCD = 3 + (core.rng.chance(0.5) ? 1 : 0); return { type: 'skill', skill: 'm_golemFist', targets: [] }; } u.data.fistCD = (u.data.fistCD ?? 1) - 1; return null; },
    banditBoss(core, u) { const d = u.data; d.cd = (d.cd ?? 2) - 1; if (d.cd <= 0) { d.cd = 3 + (core.rng.chance(0.5) ? 1 : 0); return { type: 'skill', skill: 'm_axeSpin', targets: [] }; }
      if (core.data.gold && core.data.gold() > 0 && (d.steals || 0) < 2 && core.rng.chance(0.25)) { d.steals = (d.steals || 0) + 1; return { type: 'skill', skill: 'm_steal', targets: [] }; }
      const id = core.rng.pick(['m_gutSlash', 'm_knife', 'm_dirtyKick', BR.stage(core, u, 'atk') < 2 ? 'm_warCry' : 'm_gutSlash']); return DEF.skills[id] ? { type: 'skill', skill: id, targets: [] } : null; },
    crystalGolem(core, u) { if (core.round % 4 === 0 && !core.hasStatus(u, 'mirror')) return { type: 'skill', skill: 'm_mirror', targets: [u.id] };
      const pl = (u.data.phase || 0) >= 2 ? ['m_crystalSpark', 'm_crystalSpark', 'm_prismRay', 'm_quake'] : ['m_prismRay', 'm_crystalShard', 'm_quake', 'm_rumble']; const id = core.rng.pick(pl.filter(x => DEF.skills[x])); return id ? { type: 'skill', skill: id, targets: [] } : null; },
  },
  // the hero on auto (tests, Game.autoPlay): signature when it can, a heal when low, otherwise the best skill it can pay for
  hero(core, u, policy = core.data.heroPolicy || 'smart') {
    const foes = core.foesOf(u); if (!foes.length) return { type: 'wait' }; const R = core.rng, t = foes.slice().sort((a, b) => a.res.hp - b.res.hp)[0];
    const can = id => { const k = DEF.skills[id]; return k && (k.costs || []).every(c => (u.res[c.res] || 0) >= core.costOf(u, k, c)); };
    if (policy === 'attack') return { type: 'skill', skill: u.data.attackSkill || 'attack', targets: [t.id] };
    const list = (u.data.slots || []).filter(can); const sig = u.data.sigSkill;
    if (u.res.hp < u.max.hp * 0.35) { const h = list.find(id => DEF.skills[id].tags.includes('heal')); if (h) return { type: 'skill', skill: h, targets: [u.id] }; }
    if (sig && can(sig) && R.chance(0.85)) return { type: 'skill', skill: sig, targets: [t.id] };
    const dmg = list.filter(id => DEF.skills[id].power); const aoe = dmg.filter(id => DEF.skills[id].tags.includes('aoe'));
    if (foes.length > 1 && aoe.length && R.chance(0.7)) return { type: 'skill', skill: R.pick(aoe), targets: [t.id] };
    if (policy === 'random' && list.length && R.chance(0.6)) { const id = R.pick(list); return { type: 'skill', skill: id, targets: DEF.skills[id].target === 'self' ? [u.id] : [t.id] }; }
    if (dmg.length && R.chance(0.65)) { const id = R.pick(dmg); return { type: 'skill', skill: id, targets: [t.id] }; }
    const sup = list.filter(id => !DEF.skills[id].power && DEF.skills[id].target === 'self'); if (sup.length && R.chance(0.25)) return { type: 'skill', skill: R.pick(sup), targets: [u.id] };
    return { type: 'skill', skill: u.data.attackSkill || 'attack', targets: [t.id] };
  },
};
