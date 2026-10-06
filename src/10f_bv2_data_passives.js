/* ===================== v11 戰鬥核心 v2 — 資料：被動鍵登錄表（天賦、裝備、詞綴、寶珠、套裝、職業被動共用） =====================
   Talents, gear specials, affixes, passive orbs, sets and class passives all keep their content as `key: value`. This table says
   once what each key does — as modifiers (damage pipeline stages) and triggers (event → effects). Nothing in the battle
   flow checks a talent id (spec 36). make(v) receives the summed value of the key. */
Object.assign(COND, {
  statusMajor: (c, v) => !!c.ev && !!DEF.statuses[c.ev.payload.status] && (DEF.statuses[c.ev.payload.status].group === 'major') === !!v,
  statusIs: (c, v) => !!c.ev && c.ev.payload.status === v,
  tgtBig: (c, v) => !!c.tgt && !!(c.tgt.boss || c.tgt.elite) === !!v,
  foesHaveBoss: (c, v) => c.core.foesOf(c.owner).some(f => f.boss) === !!v,
  evRes: (c, v) => !!c.ev && c.ev.payload.res === v,
  srcIsHero: (c, v) => !!c.src && !!c.src.hero === !!v,
  evKind: (c, v) => !!c.ev && c.ev.payload.kind === v,
  wouldKill: (c, v) => !!c.ev && !!c.tgt && (c.ev.payload.amount >= c.tgt.res.hp) === !!v,
  tgtHpAbove1: (c, v) => !!c.tgt && (c.tgt.res.hp > 1) === !!v,
  evSkillTag: (c, v) => !!c.ev && !!DEF.skills[c.ev.payload.skill] && DEF.skills[c.ev.payload.skill].tags.includes(v),
  notSelfDamage: (c, v) => !!c.ev && (c.ev.src !== (c.ev.tgts[0] || null)) === !!v,
  foeAliveBelow: (c, v) => c.core.foesOf(c.owner).some(f => (f.boss || f.elite) && f.res.hp <= f.max.hp * v),
  ownerHpAbove0: (c, v) => !!c.owner && (c.owner.res.hp > 0) === !!v,
});
const PV = (key, make, meta = {}) => defPut('passives', key, { make, metadata: meta, tags: [] });
const mul = (v, cond, stage = 'talent', who = 'attacker') => ({ stage, who, mul: 1 + v / 100, cond });
const once = (on, role, cond, effects, extra = {}) => ({ on, role, cond, effects, limit: { perAction: 1 }, ...extra });
/* ---------- damage modifiers ---------- */
PV('dmgUp', v => ({ mods: [mul(v, { hasPower: 1 })] }), { n: '傷害加成' });
PV('elem', v => ({ mods: [mul(v, { hasPower: 1 }, 'equipment')] })); // v12.76: 屬性傷害 → 全部傷害（元素系統拿掉了）
PV('fireUp', v => ({ mods: [mul(v, { element: '火' }, 'equipment')] }));
PV('boltUp', v => ({ mods: [mul(v, { element: '雷' }, 'equipment')] }));
PV('vs', v => ({ mods: (v || []).map(([fam, p]) => mul(p, { tgtFam: fam }, 'equipment')) }));
PV('kindUp', (v, u) => ({ mods: v && u.stats.wkind && v[u.stats.wkind] ? [mul(v[u.stats.wkind], { hasPower: 1 })] : [] }));
PV('typeUp', v => ({ mods: Object.entries(v || {}).map(([el, p]) => mul(p, { element: el })) }));
PV('actUp', v => ({ mods: [mul(v, { tag: 'orb' })] }));
PV('atkUp', v => ({ mods: [mul(v, { tag: 'basic' })] }));
PV('spcUp', v => ({ mods: [mul(v, { tag: 'weapon_special' })] }));
PV('critDmg', v => ({ mods: [{ stage: 'talent', who: 'attacker', critDmg: v }] }));
PV('magCrit', v => ({ mods: [{ stage: 'talent', who: 'attacker', critAdd: v, cond: { cat: '特' } }] }));
PV('rage', v => ({ mods: [{ stage: 'talent', who: 'attacker', mul: 1.3, cond: { srcHpBelow: 0.5, hasPower: 1 } }] }));
PV('pierceT', v => ({ mods: [{ stage: 'attacker', who: 'attacker', defMul: 1 - v / 100, cond: { cat: '物' } }] }));
PV('weakUp', v => ({ mods: [{ stage: 'talent', who: 'attacker', mulWeak: 1 + v / 100 }] }));
PV('bigUp', v => ({ mods: [mul(v, { tgtBig: 1 })] }));
PV('venomous', v => ({ mods: [mul(v, { tgtStatus: 'psn' })] }));
PV('brkBonus', v => ({ mods: [mul(v, { tgtBroken: 1 })] }));
PV('assassin', v => ({ mods: [{ stage: 'talent', who: 'attacker', crit: true, cond: { round: 1, hasPower: 1 } }] }));
PV('spellblade', v => ({ mods: [{ stage: 'talent', who: 'attacker', mul: { f: 'spellblade', v: 0.45 }, cond: { hasPower: 1 } }] }));
PV('fx.spellblade', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: { f: 'spellblade', v: 0.3 }, cond: { hasPower: 1 } }] }));
PV('fx.lastStand', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: { f: 'lastStand' }, cond: { hasPower: 1 } }] }));
PV('fx.arcaneSurge', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1.15, cond: { cat: '特', srcMpAtLeast: 0.5 } }] }));
PV('fx.predator', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1.2, cond: { tgtHpBelow: 0.3, hasPower: 1 } }] }));
PV('fx.pierce', v => ({ mods: [{ stage: 'attacker', who: 'attacker', defMul: 0.7, cond: { cat: '物' } }] }));
PV('fx.swift', v => ({ mods: [{ stage: 'attacker', who: 'attacker', speMul: 1.15 }] }));
PV('fx.first', v => ({ mods: [{ stage: 'attacker', who: 'attacker', firstRoundPrio: 1 }] }));
/* ---------- defence ---------- */
PV('elemRes', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 1 - v / 100, cond: { cat: '特', hasPower: 1 } }] })); // v12.76: 屬性 → 魔法
PV('guardPlus', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 0.7, cond: { guarding: 1, hasPower: 1 } }] }));
PV('block', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1 }, chance: Math.min(45, v) / 100,
  effects: [{ type: 'modify', mul: 0.6, note: 'block' }, { type: 'message', key: 'block', target: 'self' }] }] }), { n: '格擋' });
const ENDURE = v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', cond: { wouldKill: 1, tgtHpAbove1: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'modify', leaveOne: 1, note: 'endure' }, { type: 'message', key: 'endure', target: 'self' }] }] });
PV('fx.endure', ENDURE); PV('endureT', ENDURE);
PV('statusRes', v => ({ triggers: [{ on: EVT.STATUS_APPLY, phase: 'PRE', role: 'tgt', cond: { statusMajor: 1 }, chance: Math.min(80, v) / 100, effects: [{ type: 'cancel', why: 'will' }, { type: 'message', key: 'status_resist', target: 'self' }] }] }));
PV('counter', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { guarding: 1, srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', skill: 'counter_strike', why: 'counter' }] }] }));
const SHADOW = v => ({ triggers: [{ on: EVT.MISS, phase: 'POST', role: 'tgt', reaction: 1, cond: { srcSide: 'enemy' }, limit: { perAction: 1 }, effects: [{ type: 'counter', skill: 'counter_strike', why: 'shadow' }] }] });
PV('shadowStep', SHADOW); PV('fx.shadowStep', SHADOW);
PV('fx.thorns', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, hpLost: 1, srcAlive: 1 }, prio: 4, effects: [{ type: 'damage', target: 'source', ofEvent: 0.2, bossMul: 0.6, kind: 'thorns', tags: ['reflect'] }] }] }));
PV('openShield', v => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'status', target: 'self', status: 'barrier', dur: v }] }] }));
PV('fx.deathWard', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerHpBelow: 0.3, ownerAlive: 1 }, limit: { perBattle: 1 }, prio: 8, effects: [{ type: 'status', target: 'self', status: 'barrier', dur: 2 }, { type: 'message', key: 'death_ward', target: 'self' }] }] }));
/* ---------- recovery & resources ---------- */
PV('drain', v => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, effects: [{ type: 'heal', target: 'self', ofEvent: Math.min(15, v) / 100, field: 'total', kind: 'drain', quiet: 1 }] }] }));
PV('mpRegen', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', pct: v / 100, min: 1 }] }] }));
PV('fx.regen', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, foesHaveBoss: 0 }, effects: [{ type: 'heal', target: 'self', pct: 0.045, kind: 'regen', quiet: 1 }] },
  { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, foesHaveBoss: 1 }, effects: [{ type: 'heal', target: 'self', pct: 0.03, kind: 'regen', quiet: 1 }] }] }));
PV('fx.guardHeal', v => ({ triggers: [{ on: EVT.DEFEND, phase: 'POST', role: 'src', effects: [{ type: 'heal', target: 'self', pct: 0.1, kind: 'guardHeal', quiet: 1 }] }] }));
PV('fx.mpGuard', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { guarding: 1, ownerAlive: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', pct: 0.1, min: 1, why: 'mpGuard' }] }] }));
const FREECAST = p => ({ triggers: [{ on: EVT.COST_PAY, phase: 'PRE', role: 'src', cond: { evRes: 'mp' }, chance: p, effects: [{ type: 'modify', set: { amount: 0, free: 1 }, min: 0, note: 'free' }, { type: 'message', key: 'free_cast', target: 'self' }] }] });
PV('mpSave', v => FREECAST(Math.min(60, v) / 100)); PV('fx.freeCast', () => FREECAST(0.3));
PV('fx.manaSiphon', v => ({ triggers: [once(EVT.DAMAGE, 'src', { tag: 'basic' }, [{ type: 'resource', target: 'self', res: 'mp', amount: 4, why: 'siphon' }])] }));
PV('atkMp', v => ({ mods: [{ stage: 'base', atkMp: v }] }));
PV('weakMp', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { weakHit: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', amount: v }] }] }));
PV('healUp', v => ({ mods: [{ stage: 'base', healMul: 1 + v / 100 }] }));
/* ---------- on-hit extras ---------- */
PV('fx.double', v => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { cat: '物', hasPower: 1 }, chance: 0.2, effects: [{ type: 'damage', target: 'cast_targets', ofEvent: 0.5, field: 'total', kind: 'double', tags: ['multi_hit'] }] }] }));
PV('fx.cleave', v => ({ triggers: [once(EVT.DAMAGE, 'src', { cat: '物', hasPower: 1, tgtAlive: 1 }, [{ type: 'stage', target: 'event_target', stats: { def: -1 }, dur: 3, secondary: 1 }], { chance: 0.3 })] }));
PV('fx.fervor', v => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, limit: { perBattle: 2 }, effects: [{ type: 'stage', target: 'self', stats: { atk: 1 }, cond: { cat: '物' } }, { type: 'stage', target: 'self', stats: { spa: 1 }, cond: { cat: '特' } }] }] }));
PV('fx.stormMark', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { hasPower: 1, tgtAlive: 1 }, chance: 0.15, effects: [{ type: 'status', target: 'event_target', status: 'par', secondary: 1 }] }] }));
const POISONEDGE = p => ({ triggers: [once(EVT.DAMAGE, 'src', { cat: '物', hasPower: 1, tgtAlive: 1, hpLost: 1 }, [{ type: 'status', target: 'event_target', status: 'psn', secondary: 1 }], { chance: p })] });
PV('fx.poisonEdge', () => POISONEDGE(0.2)); PV('venomEdge', () => POISONEDGE(0.2));
PV('fx.breaker', v => ({ triggers: [once(EVT.DAMAGE, 'src', { cat: '物', hasPower: 1 }, [{ type: 'break_chip', target: 'event_target', n: 1, why: 'breaker' }], { chance: 0.35 })] }));
PV('shieldChip', v => ({ triggers: [once(EVT.DAMAGE, 'src', { cat: '物', hasPower: 1 }, [{ type: 'break_chip', target: 'event_target', n: 1, why: 'shieldChip' }], { chance: Math.min(100, v) / 100 })] }));
/* ---------- the class signature skill (talent branch ★ and the class's own extras) ---------- */
PV('sigPow', v => ({ mods: [{ stage: 'skill', who: 'attacker', powMul: 1 + v / 100, cond: { tag: 'sig' } }] }));
PV('sigPowShield', v => ({ mods: [{ stage: 'skill', who: 'attacker', powMul: 1 + v / 100, cond: { tag: 'sig' } }] }));
PV('sigHit', v => ({ mods: [{ stage: 'skill', who: 'attacker', hitsAdd: v, cond: { tag: 'sig' } }] }));
PV('sigCrit', v => ({ mods: [{ stage: 'skill', who: 'attacker', critAdd: v, cond: { tag: 'sig' } }] }));
PV('sigWeak', v => ({ mods: [{ stage: 'skill', who: 'attacker', mulWeak: 1 + v / 100, cond: { tag: 'sig' } }] }));
PV('sigVsSt', v => ({ mods: [{ stage: 'skill', who: 'attacker', mul: 1 + v / 100, cond: { tag: 'sig', tgtAnyAilment: 1 } }] }));
for (const st of ['brn', 'par', 'psn', 'slp']) PV('sigSt.' + st, v => ({ triggers: [once(EVT.DAMAGE, 'src', { tag: 'sig', tgtAlive: 1, hpLost: 1 }, [{ type: 'status', target: 'event_target', status: st, secondary: 1 }], { chance: Math.min(100, v) / 100 })] }));
const SIGDONE = effects => ({ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { tag: 'sig' }, effects });
PV('sigFdef', v => ({ triggers: [SIGDONE([{ type: 'stage', target: 'cast_targets', stats: { def: -1 }, cond: { tgtAlive: 1 } }])] }));
PV('sigFatk', v => ({ triggers: [SIGDONE([{ type: 'stage', target: 'cast_targets', stats: { atk: -1 }, cond: { tgtAlive: 1 } }])] }));
for (const k of BR.STAT_KEYS) PV('sigBuff.' + k, v => ({ triggers: [SIGDONE([{ type: 'stage', target: 'self', stats: { [k]: v } }])] }));
PV('sigDrain', v => ({ triggers: [SIGDONE([{ type: 'heal', target: 'self', ofEvent: v / 100, field: 'total', kind: 'drain', quiet: 1 }])] }));
PV('sigHeal', v => ({ triggers: [SIGDONE([{ type: 'heal', target: 'self', pct: v / 100, kind: 'heal' }])] }));
PV('sigCure', v => ({ triggers: [SIGDONE([{ type: 'cleanse', target: 'self' }])] }));
PV('sigShield', v => ({ triggers: [SIGDONE([{ type: 'status', target: 'self', status: 'barrier', dur: v }])] }));
PV('sigMpBack', v => ({ triggers: [SIGDONE([{ type: 'resource', target: 'self', res: 'mp', amount: v }])] }));
PV('sigSpec', v => ({ triggers: [SIGDONE([{ type: 'resource', target: 'self', res: 'wc', amount: v, why: 'sig' }])] }));
PV('sigTwice', v => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { tag: 'sig', hasPower: 1 }, chance: Math.min(100, v) / 100, limit: { perAction: 1 }, effects: [{ type: 'message', key: 'sig_twice', target: 'self' }, { type: 'damage', target: 'cast_targets', ofEvent: 0.5, field: 'total', kind: 'sigTwice', cond: { tgtAlive: 1 } }] }] }));
PV('sigStart', v => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'resource', target: 'self', res: 'sgp', amount: v, why: 'start' }] }] }));
PV('specStart', v => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'resource', target: 'self', res: 'wc', amount: v, why: 'start' }] }] }));
PV('comboStart', v => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'resource', target: 'self', res: 'combo', amount: v, why: 'start' }] }] }));
// keys read by other rules (combo, rewards, wc size, allies) — known here so validation accepts them
for (const k of ['comboKeep', 'comboStep', 'comboMax', 'comboGuard', 'chargeCut', 'winHeal', 'allyUp', 'allyMore', 'fx.wisdom', 'fx.fortune']) PV(k, () => ({}), { readBy: 'rules' });
/* ---------- weapon enchant (附魔寶石): the element replaces the weapon's, hits of that element deal +6% / +12% and may add its effect ---------- */
PV('enchant', v => { const E = (typeof EN_EFF !== 'undefined' && EN_EFF[v.el]) || null, lv2 = v.lv >= 2; if (!E) return {};
  const fx = E[0] === 'fdef' ? { type: 'stage', target: 'event_target', stats: { def: -1 }, secondary: 1 } : ['wet', 'tangle'].includes(E[0]) ? { type: 'status', target: 'event_target', status: E[0], dur: 3, secondary: 1 } : { type: 'status', target: 'event_target', status: E[0], secondary: 1 };
  return { mods: [{ stage: 'equipment', who: 'attacker', mul: lv2 ? 1.12 : 1.06, cond: { hasPower: 1, element: v.el } }],
    triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { evEl: v.el, evHit: 1, tgtAlive: 1, hpLost: 1 }, limit: { perAction: 1 }, chance: (lv2 ? E[2] : E[1]) / 100, effects: [fx] }] }; }, { n: '附魔' });
