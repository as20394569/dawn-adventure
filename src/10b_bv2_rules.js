/* ===================== v11 戰鬥核心 v2 — 規則層：公式、修正管線、命中與會心、行動順序 =====================
   Rules read numbers from the data layer (skills, statuses, passives) and from the existing balance constants
   (HERO_POWER, FOE_POWER, famMult, stageMul). They never draw anything and never decide content. */
const BR = {
  // the damage pipeline order (spec 17): every modifier names the stage it belongs to
  STAGES: ['base', 'attacker', 'defender', 'skill', 'talent', 'equipment', 'status', 'env', 'final'],
  STAT_KEYS: ['atk', 'def', 'spa', 'spd', 'spe'],
  STAGE_MAX: 3, PAR_SKIP: 0.25, PAR_SPEED: 0.25, VARIANCE: [85, 100], CRIT_MUL: 1.5,
  MULTI_FOE: { 2: { hp: 0.75, pow: 0.85 }, 3: { hp: 0.6, pow: 0.75 } }, // spec G1: more foes, each weaker
  AOE_MUL: 0.75, CHAIN_MUL: 0.5,
  STATUS_RES_MAX: 0.8,
};
// a data value that may be a named formula: 12, or { f: 'name', v: … }
BR.val = (x, c) => x != null && typeof x === 'object' && x.f ? BR.FORMULA[x.f](c, x.v) : x;
// resistance to a major ailment from an enemy (spec §2.4 step 4): the target's statusRes modifiers, in %
BR.statusResist = function (core, src, tgt, D) {
  let r = 0; const c = { core, owner: tgt, src, tgt };
  for (const m of tgt.mods || []) if (m.statusRes && condOk(m.cond, c)) r += m.statusRes;
  return Math.min(BR.STATUS_RES_MAX, r / 100);
};
BR.stageMul = s => s >= 0 ? 1 + 0.25 * s : 1 / (1 + 0.25 * -s);
BR.stage = (core, u, k) => { const s = core.statusOf(u, 'stage_' + k); return s ? s.stacks : 0; };
BR.sidePower = u => u.hero ? (typeof HERO_POWER !== 'undefined' ? HERO_POWER : 1.45) : (typeof FOE_POWER !== 'undefined' ? FOE_POWER : 1.15);
BR.famMult = (el, t) => t.hero ? 1 : (typeof famMult === 'function' ? famMult(el, t) : 1);
// named formulas a modifier may refer to (data says which, the rule says how)
BR.FORMULA = {
  lastStand: c => 1 + 0.35 * (1 - c.src.res.hp / c.src.max.hp),
  lowHp: (c, v) => 1 + v * Math.max(0, 1 - c.src.res.hp / c.src.max.hp),
  attrScale: (c, v) => 1 + Math.max(0, (c.src.attr ? c.src.attr[v[0]] || 0 : 0) - 10) * v[1] / 100,
  spellblade: (c, v) => { const S = c.src.stats, phys = c.skill.cat === '物'; return phys ? (S.atk + S.spa * v) / Math.max(1, S.atk) : (S.spa + S.atk * v) / Math.max(1, S.spa); },
  combo: c => 1 + 0.06 * (c.src.res.combo || 0),
};
// collect the modifiers that apply to one hit: attacker passives & statuses, defender passives & statuses, the skill, the environment
BR.mods = function (core, src, tgt, skill, ev, x = {}) {
  const out = [], ctxA = { core, owner: src, src, tgt, skill, ev, spent: x.spent || 0, n: x.n || 0 }, ctxD = { core, owner: tgt, src, tgt, skill, ev, spent: x.spent || 0, n: x.n || 0 };
  const add = (list, who, ctx) => { for (const m of list || []) if ((m.who || 'attacker') === who && condOk(m.cond, ctx)) out.push(m); };
  add(src.mods, 'attacker', ctxA); for (const s of src.statuses) add(DEF.statuses[s.id].mods, 'attacker', ctxA);
  add(tgt.mods, 'defender', ctxD); for (const s of tgt.statuses) add(DEF.statuses[s.id].mods, 'defender', ctxD);
  add(skill.mods, 'attacker', ctxA); add(skill.mods, 'defender', ctxD);
  for (const m of core.envMods || []) if (condOk(m.cond, ctxA)) out.push(m);
  return out.sort((a, b) => BR.STAGES.indexOf(a.stage) - BR.STAGES.indexOf(b.stage));
};
BR.modVal = (m, key, c) => m[key] != null ? (typeof m[key] === 'object' && m[key].f ? BR.FORMULA[m[key].f](c, m[key].v) : m[key]) : null;
// the damage of one hit. o: { power, el, cat, preview } → { amount, mult, crit, parts }
BR.PIERCE_RATIO = 3;
BR.damage = function (core, src, tgt, skill, o = {}) {
  const rng = o.preview ? null : core.rng, c = { core, src, tgt, skill, spent: o.spent || 0, n: o.n || 0 }, mods = BR.mods(core, src, tgt, skill, null, c), phys = (o.cat || skill.cat) === '物', el = o.el || skill.el;
  // crit
  let critCh = (src.stats.crit ?? 6) / 100 * (skill.critX || 1), forced = false;
  for (const m of mods) { const a = BR.modVal(m, 'critAdd', c); if (a) critCh += a / 100; if (m.crit) forced = true; if (m.critXSkill && (skill.critX || 1) < m.critXSkill) critCh *= m.critXSkill / (skill.critX || 1); }
  const crit = !o.noCrit && (forced || (rng ? rng.chance(critCh) : false));
  // attack / defence with stat stages (a crit ignores the attacker's drops and the defender's boosts)
  const as = BR.stage(core, src, phys ? 'atk' : 'spa'), ds = BR.stage(core, tgt, phys ? 'def' : 'spd');
  let A = (phys ? src.stats.atk : src.stats.spa) * BR.stageMul(crit ? Math.max(0, as) : as), D = (phys ? tgt.stats.def : tgt.stats.spd) * BR.stageMul(crit ? Math.min(0, ds) : ds);
  const D0 = D; // v12.0.9f: what「無視物防」starts from (see the floor below)
  let pow = o.power != null ? o.power : skill.power;
  for (const m of mods) { const a = BR.modVal(m, 'atkMul', c), d = BR.modVal(m, 'defMul', c), p = BR.modVal(m, 'powMul', c); if (a) A *= a; if (d) D *= d; if (p) pow *= p; }
  if (skill.pierceDef) D *= 1 - skill.pierceDef;
  if (crit) for (const m of mods) { const v = BR.modVal(m, 'critPierce', c); if (v) D *= 1 - v; }
  if (phys && core.hasStatus(src, 'brn')) A *= 0.5;
  // v12.0.9f: ignoring defence can lift the attack/defence ratio to at most ×3 (「無視全部物防」 used to divide by 1 and deal ~100× damage)
  D = Math.max(1, D, Math.min(D0, A / BR.PIERCE_RATIO));
  const base = Math.floor(Math.floor(Math.floor(2 * src.lv / 5 + 2) * pow * A / D) / 50) + 2;
  const mult = BR.famMult(el, tgt);
  let m = mult * (rng ? rng.int(BR.VARIANCE[0], BR.VARIANCE[1]) / 100 : (BR.VARIANCE[0] + BR.VARIANCE[1]) / 200);
  let critMul = BR.CRIT_MUL; for (const md of mods) { const v = BR.modVal(md, 'critDmg', c); if (v && crit) critMul += BR.CRIT_MUL * v / 100; }
  if (crit) { for (const md of mods) { const v = BR.modVal(md, 'critTaken', c); if (v != null) critMul = 1 + (critMul - 1) * v; } m *= critMul; }
  m *= BR.sidePower(src);
  const parts = [];
  for (const md of mods) { const v = BR.modVal(md, 'mul', c); if (v != null && v !== 1) { m *= v; parts.push([md.stage, md.src || md.key || '', v]); } const w = mult > 1 ? BR.modVal(md, 'mulWeak', c) : null; if (w) m *= w; }
  if (tgt.hero && tgt.stats.resist && tgt.stats.resist[el]) m *= 1 - tgt.stats.resist[el] / 100;
  return { amount: Math.max(1, Math.floor(base * m)), mult, crit, parts };
};
// the hero's weapon element (or enchant) replaces 一般 on the basic attack and on no-element skills of the weapon's kind
BR.elementOf = (core, u, sk) => sk.el === '一般' && sk.power && u.data.welem && (sk.cat === u.data.wcat || sk.tags.includes('basic') || u.mods.some(m => m.weaponElemAll)) ? u.data.welem : sk.el;
BR.hitChance = function (core, src, tgt, skill) {
  if (!skill.acc) return 1; let a = skill.acc + (src.stats.hit || 0) - (tgt.stats.eva || 0);
  const c = { core, src, tgt, skill };
  for (const m of BR.mods(core, src, tgt, skill, null)) { const v = BR.modVal(m, 'accAdd', c); if (v) a += v; }
  return clamp(a, 5, 100) / 100;
};
BR.speed = function (core, u) {
  let v = u.stats.spe * BR.stageMul(BR.stage(core, u, 'spe')); if (core.hasStatus(u, 'par')) v *= BR.PAR_SPEED;
  for (const m of u.mods || []) if (m.speMul && condOk(m.cond, { core, owner: u, src: u })) v *= m.speMul;
  for (const m of core.envMods || []) if (m.speMul) v *= m.speMul;
  return v;
};
BR.heal = function (core, src, tgt, pct, o = {}) {
  let v = Math.floor(tgt.max.hp * pct); for (const m of (src && src.mods) || []) if (m.healMul && condOk(m.cond, { core, owner: src, src, tgt, skill: o.skill || null })) v = Math.floor(v * m.healMul);
  return Math.max(1, v);
};
// escape: the classic formula, more tries make it easier
BR.escape = function (core, u, tries) {
  const foes = core.alive(u.side === 'A' ? 'B' : 'A'); const hs = BR.speed(core, u), fs = Math.max(...foes.map(f => BR.speed(core, f)), 1);
  return hs >= fs || (Math.floor(hs * 128 / fs) + 30 * tries) % 256 > core.rng.int(0, 255);
};
