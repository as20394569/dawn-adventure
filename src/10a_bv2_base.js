/* ===================== v11 戰鬥核心 v2 — 基礎：常數、可重現亂數、事件類型、標籤、條件、資料登錄與 Schema 驗證 =====================
   docs/battle_v2_design.md. Four layers: data (DEF.*), rules (BR.*), execution (BattleCore), view (BattleScene).
   Nothing here touches the screen. */
const BV2 = { DEV: true, VERSION: 2, MAX_DEPTH: 8, MAX_REACT: 2, MAX_EVENTS_ACTION: 512, MAX_TRIG_ACTION: 32, MAX_TRIG_ROUND: 96, errors: [] };
function bvErr(where, msg) { const e = '[BV2] ' + where + ': ' + msg; BV2.errors.push(e); if (BV2.DEV && typeof console !== 'undefined') console.warn(e); return e; }

/* ---------- seedable RNG (mulberry32); every battle-logic random number goes through one of these ---------- */
function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  const r = {
    get state() { return s; }, set state(v) { s = v >>> 0; },
    next() { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; },
    chance(p) { return p >= 1 ? (r.next(), true) : p <= 0 ? (r.next(), false) : r.next() < p; },
    int(a, b) { return a + Math.floor(r.next() * (b - a + 1)); },
    pick(a) { return a[Math.floor(r.next() * a.length)]; },
    weighted(list, w) { const tot = w.reduce((a, b) => a + Math.max(0, b), 0); if (tot <= 0) return list[0]; let x = r.next() * tot; for (let i = 0; i < list.length; i++) { x -= Math.max(0, w[i]); if (x < 0) return list[i]; } return list[list.length - 1]; },
  };
  return r;
}
// run legacy stat code (makeFoe, rollQuality…) with Math.random routed to a battle RNG so results stay reproducible
function withRng(rng, fn) { const M = Math.random; Math.random = () => rng.next(); try { return fn(); } finally { Math.random = M; } }

/* ---------- event types (one place; no module invents its own synonyms) ---------- */
const EVT = {
  BATTLE_START: 'BATTLE_START', BATTLE_END: 'BATTLE_END', ROUND_START: 'ROUND_START', ROUND_END: 'ROUND_END',
  ACTION_START: 'ACTION_START', ACTION_END: 'ACTION_END', ACTION_CANCEL: 'ACTION_CANCEL', TARGET_CHANGE: 'TARGET_CHANGE',
  SKILL_SELECT: 'SKILL_SELECT', SKILL_USE: 'SKILL_USE', SKILL_SUCCESS: 'SKILL_SUCCESS', SKILL_FAIL: 'SKILL_FAIL', COST_PAY: 'COST_PAY',
  RESOURCE_CHANGE: 'RESOURCE_CHANGE', RESOURCE_EMPTY: 'RESOURCE_EMPTY', RESOURCE_FULL: 'RESOURCE_FULL',
  HIT: 'HIT', MISS: 'MISS', CRIT: 'CRIT', DAMAGE: 'DAMAGE', HEAL: 'HEAL',
  STATUS_APPLY: 'STATUS_APPLY', STATUS_FAIL: 'STATUS_FAIL', STATUS_STACK: 'STATUS_STACK', STATUS_REMOVE: 'STATUS_REMOVE', STATUS_EXPIRE: 'STATUS_EXPIRE',
  DOWN: 'DOWN', REVIVE: 'REVIVE', EXTRA_ACTION: 'EXTRA_ACTION', REACTION: 'REACTION', EFFECT_TRIGGER: 'EFFECT_TRIGGER', EFFECT_DONE: 'EFFECT_DONE',
  MESSAGE: 'MESSAGE', PHASE: 'PHASE', SUMMON: 'SUMMON', ESCAPE: 'ESCAPE', ITEM_USE: 'ITEM_USE', DEFEND: 'DEFEND', CHARGE: 'CHARGE', BREAK: 'BREAK',
};
const EVT_SET = new Set(Object.values(EVT));

/* ---------- tags: the shared language of skills, statuses, passives and events ---------- */
const BV_TAGS = new Set(['attack', 'basic', 'skill', 'sig', 'orb', 'weapon_special', 'item', 'defend', 'run', 'phys', 'magic', 'support', 'damage', 'heal', 'buff', 'debuff',
  'ailment', 'dot', 'aoe', 'chain', 'multi_hit', 'priority', 'charge', 'drain', 'recoil', 'reaction', 'counter', 'reflect', 'fixed', 'true_damage', 'shield_break', 'execute',
  'boss', 'elite', 'rare', 'minion', 'wild', 'hero', 'foe', 'weapon', 'ally', 'break', 'steal', 'monster_skill', 'status', 'stage', 'environment', 'mechanic', 'summon', 'heavy', 'pierce', 'guard', 'cleanse', 'dispel',
  'el:一般', 'el:火', 'el:水', 'el:雷', 'el:草', 'el:毒', 'el:岩', 'el:飛', 'el:光', 'el:暗', 'el:冰', 'el:風']);
const bvTagOk = t => BV_TAGS.has(t) || /^(fam|cls|tpl|kind|key):/.test(t);

/* ---------- conditions: data → test. COND[name](ctx, value) ---------- */
// ctx: { core, owner, src, tgt, skill, ev, hit } (owner = the unit holding the passive / status)
const COND = {
  cat: (c, v) => !!c.skill && c.skill.cat === v,
  element: (c, v) => !!c.skill && (Array.isArray(v) ? v.includes(c.skill.el) : c.skill.el === v),
  tag: (c, v) => !!c.skill && c.skill.tags.includes(v),
  notTag: (c, v) => !c.skill || !c.skill.tags.includes(v),
  isBasic: (c, v) => !!c.skill && c.skill.tags.includes('basic') === !!v,
  hasPower: (c, v) => !!c.skill && !!c.skill.power === !!v,
  srcHpBelow: (c, v) => !!c.src && c.src.res.hp < c.src.max.hp * v,
  srcHpAbove: (c, v) => !!c.src && c.src.res.hp >= c.src.max.hp * v,
  srcMpAtLeast: (c, v) => !!c.src && c.src.max.mp > 0 && c.src.res.mp >= c.src.max.mp * v,
  tgtHpBelow: (c, v) => !!c.tgt && c.tgt.res.hp < c.tgt.max.hp * v,
  tgtStatus: (c, v) => !!c.tgt && c.core.hasStatus(c.tgt, v),
  tgtAnyAilment: (c, v) => !!c.tgt && !!c.core.majorOf(c.tgt) === !!v,
  srcStatus: (c, v) => !!c.src && c.core.hasStatus(c.src, v),
  tgtBroken: (c, v) => !!c.tgt && c.core.hasStatus(c.tgt, 'broken') === !!v,
  tgtFam: (c, v) => !!c.tgt && c.tgt.fam === v,
  tgtBoss: (c, v) => !!c.tgt && !!c.tgt.boss === !!v,
  tgtSide: (c, v) => !!c.tgt && !!c.owner && (v === 'enemy' ? c.tgt.side !== c.owner.side : c.tgt.side === c.owner.side),
  srcSide: (c, v) => !!c.src && !!c.owner && (v === 'enemy' ? c.src.side !== c.owner.side : c.src.side === c.owner.side),
  round: (c, v) => c.core.round === v,
  firstAction: (c, v) => (c.owner && c.owner.acted === 0) === !!v,
  weakHit: (c, v) => !!c.ev && !!c.ev.payload && (c.ev.payload.mult > 1) === !!v,
  crit: (c, v) => !!c.ev && !!c.ev.payload && !!c.ev.payload.crit === !!v,
  amountMin: (c, v) => !!c.ev && !!c.ev.payload && (c.ev.payload.amount || 0) >= v,
  guarding: (c, v) => !!c.owner && c.core.hasStatus(c.owner, 'guard') === !!v,
  ownerAlive: (c, v) => !!c.owner && (c.owner.res.hp > 0) === !!v,
  srcAlive: (c, v) => !!c.src && (c.src.res.hp > 0) === !!v,
  tgtAlive: (c, v) => !!c.tgt && (c.tgt.res.hp > 0) === !!v,
  tgtHpFull: (c, v) => !!c.tgt && (c.tgt.res.hp >= c.tgt.max.hp) === !!v,
  ownerHpBelow: (c, v) => !!c.owner && c.owner.res.hp < c.owner.max.hp * v,
  ownerResAtLeast: (c, v) => !!c.owner && (c.owner.res[v[0]] || 0) >= v[1],
  ownerIsSrc: (c, v) => (c.owner === c.src) === !!v,
  ownerIsTgt: (c, v) => (c.owner === c.tgt) === !!v,
  hpLost: (c, v) => !!c.ev && !!c.ev.payload && (c.ev.payload.amount || 0) > 0 === !!v,
  multiFoes: (c, v) => (c.core.alive(c.tgt ? c.tgt.side : 'B').length > 1) === !!v,
  env: (c, v) => c.core.env.weather === v,
};
function condOk(conds, ctx) { if (!conds) return true; for (const k in conds) { const f = COND[k]; if (!f) { bvErr('cond', 'unknown condition ' + k); return false; } if (!f(ctx, conds[k])) return false; } return true; }

/* ---------- data registries ---------- */
const DEF = { skills: {}, statuses: {}, resources: {}, passives: {}, enemies: {}, encounters: {}, classes: {}, items: {}, mechanics: {} };
function defPut(kind, id, d) {
  if (!DEF[kind]) return bvErr('def', 'unknown kind ' + kind);
  if (DEF[kind][id] && !d.override) bvErr('def', kind + '.' + id + ' defined twice');
  const o = { id, version: 1, tags: [], enabled: true, metadata: {}, ...d }; delete o.override; DEF[kind][id] = o; return o;
}

/* ---------- schemas + validation (run at load in dev mode and by tools/btest.js) ---------- */
const SCHEMA = {
  skills: { req: ['id', 'version', 'tags', 'target', 'effects'], target: ['enemy', 'all_enemies', 'random_enemy', 'self', 'ally', 'all_allies', 'none'] },
  statuses: { req: ['id', 'version', 'tags', 'duration', 'stack'], stack: ['none', 'refresh', 'add', 'signed', 'max'] },
  resources: { req: ['id', 'version', 'scope', 'min'], scope: ['permanent', 'battle', 'round'] },
  passives: { req: ['id', 'version'] },
  enemies: { req: ['id', 'version', 'tags', 'skills'] },
  encounters: { req: ['id', 'version', 'groups'] },
  classes: { req: ['id', 'version', 'sig', 'slots'] },
  items: { req: ['id', 'version', 'effects'] },
  mechanics: { req: ['id', 'version'] },
};
function bvValidate() {
  const errs = [], E = (w, m) => errs.push(w + ': ' + m), effOk = (w, list) => {
    for (const ef of list || []) { if (!EFFECT_TYPES[ef.type]) E(w, 'effect type ' + ef.type + ' does not exist'); else if (EFFECT_TYPES[ef.type].check) { const m = EFFECT_TYPES[ef.type].check(ef); if (m) E(w, m); }
      if (ef.status && !DEF.statuses[ef.status]) E(w, 'status ' + ef.status + ' missing'); if (ef.res && !DEF.resources[ef.res]) E(w, 'resource ' + ef.res + ' missing');
      if (ef.skill && !DEF.skills[ef.skill]) E(w, 'skill ' + ef.skill + ' missing'); if (ef.cond) for (const k in ef.cond) if (!COND[k]) E(w, 'condition ' + k + ' missing');
      if (ef.then) effOk(w + '>then', ef.then); } };
  const trigOk = (w, tr) => { if (!EVT_SET.has(tr.on)) E(w, 'trigger event ' + tr.on + ' illegal'); if (tr.phase && !['PRE', 'POST'].includes(tr.phase)) E(w, 'trigger phase ' + tr.phase);
    for (const k in tr.cond || {}) if (!COND[k]) E(w, 'condition ' + k + ' missing'); if (tr.chance != null && (tr.chance < 0 || tr.chance > 1)) E(w, 'chance out of range'); effOk(w, tr.effects); };
  for (const kind in SCHEMA) {
    const S = SCHEMA[kind];
    for (const id in DEF[kind]) {
      const d = DEF[kind][id], w = kind + '.' + id;
      for (const f of S.req) if (d[f] === undefined) E(w, 'missing ' + f);
      for (const t of d.tags || []) if (!bvTagOk(t)) E(w, 'illegal tag ' + t);
      if (kind === 'skills') { if (!S.target.includes(d.target)) E(w, 'target ' + d.target); effOk(w, d.effects); for (const c of d.costs || []) { if (!DEF.resources[c.res]) E(w, 'cost resource ' + c.res); if (!(c.amount >= 0)) E(w, 'cost amount'); }
        if (d.hits && (d.hits[0] < 1 || d.hits[1] < d.hits[0])) E(w, 'hits range'); if (d.acc != null && (d.acc < 0 || d.acc > 100)) E(w, 'acc range'); }
      if (kind === 'statuses') { if (!S.stack.includes(d.stack)) E(w, 'stack ' + d.stack); if (d.max != null && d.min != null && d.max < d.min) E(w, 'max < min'); for (const tr of d.triggers || []) trigOk(w, tr); for (const m of d.mods || []) if (!BR.STAGES.includes(m.stage)) E(w, 'modifier stage ' + m.stage); }
      if (kind === 'resources') { if (d.max != null && d.max < d.min) E(w, 'max < min'); if (!S.scope.includes(d.scope)) E(w, 'scope ' + d.scope); }
      if (kind === 'passives') { for (const tr of d.triggers || []) trigOk(w, tr); for (const m of d.mods || []) if (!BR.STAGES.includes(m.stage)) E(w, 'modifier stage ' + m.stage); }
      if (kind === 'enemies') { for (const s of d.skills) if (!DEF.skills[s]) E(w, 'skill ' + s + ' missing'); for (const tr of d.triggers || []) trigOk(w, tr); }
      if (kind === 'classes') { if (!DEF.skills[d.sig]) E(w, 'sig skill ' + d.sig + ' missing'); }
      if (kind === 'items') effOk(w, d.effects);
      if (kind === 'mechanics') for (const tr of d.triggers || []) trigOk(w, tr);
      if (kind === 'encounters') for (const g of d.groups) for (const m of g.members || []) if (!DEF.enemies[m.sp]) E(w, 'enemy ' + m.sp + ' missing');
    }
  }
  // follow-up chains (skill effect → skill) must not loop
  const seen = new Set(), walk = (id, path) => { if (path.includes(id)) { E('skills.' + id, 'circular follow-up ' + path.concat(id).join('>')); return; } if (seen.has(id)) return; seen.add(id);
    for (const ef of (DEF.skills[id] || {}).effects || []) if (ef.skill) walk(ef.skill, path.concat(id)); };
  for (const id in DEF.skills) walk(id, []);
  return errs;
}
