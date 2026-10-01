/* ===================== v11 戰鬥核心 v2 — 資料：資源與狀態 =====================
   Resources (spec 38) and statuses (spec 39). Durations: `tick: 'round_end'` counts down at the end of every round;
   `holdIfUnused` keeps a status that was applied after the other side had already acted (so a late shield still covers
   the next enemy action); `skipApplyRound` starts counting the round after it was applied. */
defPut('resources', 'hp', { scope: 'permanent', min: 0, maxOf: (u, s) => s.stats.hp, initOf: (u, s) => s.hp ?? s.stats.hp, display: 'bar', tags: [] });
defPut('resources', 'mp', { scope: 'permanent', min: 0, appliesTo: u => u.hero, maxOf: (u, s) => s.stats.mp || 0, initOf: (u, s) => s.mp ?? s.stats.mp ?? 0, display: 'bar' });
defPut('resources', 'sgp', { scope: 'battle', min: 0, max: 5, appliesTo: (u, s) => u.hero && !!s.sig, initOf: () => 0, display: 'pips', metadata: { name: '招式點', cost: 3 } });
defPut('resources', 'wc', { scope: 'battle', min: 0, appliesTo: (u, s) => u.hero && !!s.wsp, maxOf: (u, s) => s.wsp ? s.wsp.N : 0, initOf: () => 0, display: 'pips', metadata: { name: '特技' } });
defPut('resources', 'combo', { scope: 'battle', min: 0, appliesTo: (u, s) => u.hero && !!s.comboMax, maxOf: (u, s) => s.comboMax || 0, initOf: (u, s) => s.comboStart || 0, display: 'pips', metadata: { name: '連擊' } });
defPut('resources', 'chi', { scope: 'battle', min: 0, max: 5, appliesTo: (u, s) => u.hero && !!s.chi, initOf: () => 0, display: 'pips', metadata: { name: '氣' } });
defPut('resources', 'brk', { scope: 'battle', min: 0, appliesTo: (u, s) => !u.hero && (s.brkMax || 0) > 0, maxOf: (u, s) => s.brkMax, initOf: (u, s) => s.brkMax, display: 'shield', metadata: { name: '破防盾' } });

const dotOf = u => Math.max(1, Math.floor(u.max.hp / (u.boss ? 16 : 8)));
const famImm = st => (core, u) => !u.hero && !!(FAMILIES[u.fam] && FAMILIES[u.fam].immune && FAMILIES[u.fam].immune.includes(st));
/* ---------- major ailments: one at a time ---------- */
defPut('statuses', 'psn', { group: 'major', tags: ['ailment', 'dot', 'debuff'], duration: 'until_cured', stack: 'none', immune: famImm('psn'), keepOnDown: false, metadata: { n: '中毒' },
  triggers: [{ on: EVT.ROUND_END, phase: 'POST', prio: -10, effects: [{ type: 'damage', target: 'self', flat: null, pctMax: null, kind: 'dot', dot: 1 }] }] });
defPut('statuses', 'brn', { group: 'major', tags: ['ailment', 'dot', 'debuff'], duration: 'until_cured', stack: 'none', immune: famImm('brn'), metadata: { n: '灼傷' },
  triggers: [{ on: EVT.ROUND_END, phase: 'POST', prio: -10, effects: [{ type: 'damage', target: 'self', kind: 'dot', dot: 1 }] }] });
defPut('statuses', 'par', { group: 'major', tags: ['ailment', 'debuff'], duration: 'until_cured', stack: 'none', immune: famImm('par'), metadata: { n: '麻痺' },
  blockAction: (core, u) => core.rng.chance(BR.PAR_SKIP) ? 'par' : null });
defPut('statuses', 'slp', { group: 'major', tags: ['ailment', 'debuff'], duration: 'own_actions', stack: 'none', immune: famImm('slp'), durDefault: core => core.rng.int(1, 3), metadata: { n: '睡眠' },
  blockAction: (core, u, s) => { if ((s.dur || 0) <= 0) { core.removeStatus(u, 'slp', 'wake'); return null; } s.dur--; return 'slp'; } });
// damage over time uses the rule dotOf (1/8 max HP, bosses 1/16): the generic damage effect reads `dot`
{ const D = EFFECT_TYPES.damage.exec; EFFECT_TYPES.damage.exec = function (core, ef, ctx, tg) { if (!ef.dot) return D.call(this, core, ef, ctx, tg); for (const t of tg) if (core.isUp(t)) core.dealDamage(null, t, dotOf(t), { kind: 'dot', cat: 'fixed', el: ctx.status ? ctx.status.id : '一般', tags: ['dot', 'fixed'], status: ctx.status && ctx.status.id }); }; }

/* ---------- field conditions ---------- */
defPut('statuses', 'wet', { tags: ['debuff'], duration: 'rounds', durDefault: 3, tick: 'round_end', stack: 'refresh', metadata: { n: '潮濕' } });
defPut('statuses', 'tangle', { tags: ['debuff'], duration: 'rounds', durDefault: 3, tick: 'round_end', stack: 'none', metadata: { n: '纏繞' } });
/* ---------- defensive ---------- */
defPut('statuses', 'barrier', { tags: ['buff', 'guard'], duration: 'rounds', durDefault: 2, tick: 'round_end', holdIfUnused: true, stack: 'refresh', metadata: { n: '護盾' },
  mods: [{ stage: 'final', who: 'defender', mul: 0.6, cond: { hasPower: 1 } }] });
defPut('statuses', 'guard', { tags: ['buff', 'guard'], duration: 'round', clearAtRoundEnd: true, stack: 'refresh', metadata: { n: '防禦' },
  mods: [{ stage: 'final', who: 'defender', mul: 0.5, cond: { hasPower: 1 } }] });
defPut('statuses', 'smoke', { tags: ['buff'], duration: 'rounds', durDefault: 3, tick: 'round_end', skipApplyRound: true, stack: 'refresh', metadata: { n: '煙幕' },
  mods: [{ stage: 'defender', who: 'defender', accAdd: -30 }] });
defPut('statuses', 'critNext', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '必定會心' },
  mods: [{ stage: 'attacker', who: 'attacker', crit: true, cond: { hasPower: 1 } }],
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { hasPower: 1 }, system: 1, effects: [{ type: 'remove_status', target: 'self', status: 'critNext', why: 'used' }] }] });
/* ---------- action control ---------- */
defPut('statuses', 'flinch', { tags: ['debuff'], duration: 'round', clearAtRoundEnd: true, stack: 'refresh', metadata: { n: '退縮' }, blockAction: () => 'flinch' });
defPut('statuses', 'frozen', { tags: ['debuff'], duration: 'next_action', stack: 'none', metadata: { n: '凍結' }, blockAction: (core, u) => { core.removeStatus(u, 'frozen', 'used'); return 'frozen'; } });
defPut('statuses', 'charging', { tags: ['charge'], duration: 'until_release', stack: 'refresh', metadata: { n: '蓄力' } });
defPut('statuses', 'airborne', { tags: ['buff'], duration: 'until_release', stack: 'refresh', metadata: { n: '空中' } });
defPut('statuses', 'broken', { tags: ['debuff'], duration: 'rounds', durDefault: 2, tick: 'round_end', stack: 'none', metadata: { n: '破防' }, blockAction: () => 'broken',
  mods: [{ stage: 'status', who: 'defender', mul: { f: 'brokenMul' }, cond: { hasPower: 1 } }],
  onRemove: (core, u, inst, why) => { if (why === 'expire' && core.isUp(u) && 'brk' in u.res) core.changeRes(u, 'brk', u.max.brk, { why: 'recover' }); } });
BR.FORMULA.brokenMul = c => c.tgt.boss ? 1.25 : 1.35;
defPut('statuses', 'frenzy', { tags: ['buff', 'boss'], duration: 'battle', stack: 'none', extraEvery: 2, metadata: { n: '狂怒' } });
/* ---------- stat stages: signed stacks ±3, each stat has its own timer ---------- */
for (const k of BR.STAT_KEYS) defPut('statuses', 'stage_' + k, { group: 'stage', tags: ['stage'], duration: 'rounds', durDefault: 3, tick: 'round_end', stack: 'signed', min: -BR.STAGE_MAX, max: BR.STAGE_MAX, metadata: { n: k, stat: k } });
/* ---------- boss mechanics that live on a unit ---------- */
defPut('statuses', 'mirror', { tags: ['buff', 'reflect'], duration: 'rounds', durDefault: 2, tick: 'round_end', stack: 'refresh', metadata: { n: '鏡面' },
  mods: [{ stage: 'final', who: 'defender', mul: 0.5, cond: { cat: '特' } }],
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { cat: '特', srcAlive: 1 }, prio: 5, effects: [{ type: 'damage', target: 'source', ofEvent: 0.6, nonLethal: 1, kind: 'reflect', tags: ['reflect'] }] }] });
defPut('statuses', 'shards', { tags: ['buff'], duration: 'battle', stack: 'add', max: 3, metadata: { n: '水晶碎片' },
  mods: [{ stage: 'final', who: 'defender', mul: 0.6, cond: { hasPower: 1 } }],
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { hasPower: 1, hpLost: 1 }, effects: [{ type: 'status', target: 'self', status: 'shards', delta: -1 }, { type: 'status', target: 'self', status: 'shards', delta: -1, cond: { cat: '物' } }] },
    { on: EVT.ROUND_END, phase: 'POST', prio: 5, effects: [{ type: 'heal', target: 'self', pct: 0.03, kind: 'regen', quiet: 1 }] }] });
// shards drop by 1 per stack change; at 0 they are gone
{ const A = DEF.statuses.shards; A.stack = 'signed'; A.min = 0; A.max = 3; }
defPut('statuses', 'hidden_weak', { tags: [], duration: 'battle', stack: 'none', metadata: { n: '弱點未知' } });
