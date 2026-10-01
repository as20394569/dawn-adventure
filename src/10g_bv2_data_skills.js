/* ===================== v11 戰鬥核心 v2 — 資料：技能（普攻、職業招式、寶珠技能、武器特技、魔物招式、道具） =====================
   The old MOVES table keeps the content (names, power, element, chances, animation ids). skillFromMove() turns one entry into
   a SkillDefinition (spec 35): target rule, costs, hit rule, crit rule, effects per hit, effects once per cast (`after`),
   skill modifiers. Every flag of the old templates becomes a generic effect or a modifier here, once. */
Object.assign(COND, {
  firstHit: (c, v) => (c.n != null ? c.n === 0 : c.ev && c.ev.payload && c.ev.payload.hitIndex != null ? c.ev.payload.hitIndex === 0 : true) === !!v,
  skillIs: (c, v) => !!c.skill && c.skill.id === v,
  tgtNoMajor: (c, v) => !!c.tgt && !c.core.majorOf(c.tgt) === !!v,
});
const AOE_CLS = new Set(['area']), CHAIN_IDS = new Set(['chainBolt']);
const BUFF_FIELDS = ['heal', 'shield', 'critNext', 'smoke', 'timeStop'];
function skillFromMove(id, m, o = {}) {
  const el = m.t || '一般', cat = m.cat || '物', pow = m.pow || 0, self = !pow && ((m.stat && m.stat.who === 'self') || BUFF_FIELDS.some(f => m[f]) && !m.timeStop);
  const aoe = AOE_CLS.has(m.cls) && pow > 0, chain = CHAIN_IDS.has(o.tpl || id) && pow > 0;
  const tags = [o.kind || 'skill', cat === '物' ? 'phys' : cat === '特' ? 'magic' : 'support', 'el:' + el];
  if (m.cls) tags.push('cls:' + m.cls); if (pow) tags.push('damage'); if (m.hits) tags.push('multi_hit'); if (m.prio) tags.push('priority'); if (m.charge) tags.push('charge');
  if (m.drain) tags.push('drain'); if (m.recoil) tags.push('recoil'); if (m.foe) tags.push('monster_skill'); if (aoe) tags.push('aoe'); if (chain) tags.push('chain');
  if (m.heal) tags.push('heal'); if (self && m.stat) tags.push('buff'); if (!self && !pow && (m.stat || m.st)) tags.push(m.st ? 'ailment' : 'debuff'); if (o.extraTags) tags.push(...o.extraTags);
  const effects = [], after = [], mods = [];
  if (pow) effects.push({ type: 'damage' });
  if (pow && m.shieldHit) effects.push({ type: 'break_chip', n: m.shieldHit, cond: { firstHit: 1 }, why: 'shieldHit' });
  if (m.eff) { const p = (m.eff.p ?? 100) / 100;
    if (m.eff.st) effects.push({ type: 'status', status: m.eff.st, chance: p, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1 } });
    if (m.eff.stat) effects.push({ type: 'stage', stats: { ...m.eff.stat }, chance: p, secondary: true, cond: { tgtAlive: 1 } });
    if (m.eff.flinch) effects.push({ type: 'status', status: 'flinch', chance: p, secondary: true, cond: { tgtAlive: 1 } }); }
  if (!pow) {
    if (m.st) effects.push({ type: 'status', status: m.st });
    if (m.stat) { const s = { ...m.stat }; delete s.who; if (Object.keys(s).length) effects.push({ type: 'stage', stats: s, dur: m.dur || 3, target: m.stat.who === 'self' ? 'self' : 'target' }); }
    if (m.heal) effects.push({ type: 'heal', pct: m.heal, target: 'self' });
    if (m.shield) effects.push({ type: 'status', status: 'barrier', dur: m.shield, target: 'self' });
    if (m.critNext) effects.push({ type: 'status', status: 'critNext', target: 'self' });
    if (m.smoke) effects.push({ type: 'status', status: 'smoke', dur: m.smoke, target: 'self' });
    if (m.timeStop) effects.push({ type: 'status', status: 'frozen' }, { type: 'remove_status', status: 'charging', why: 'timeStop' });
    if (m.dispel) effects.push({ type: 'dispel' });
  }
  if (m.drain) after.push({ type: 'heal', ofCast: m.drain, target: 'self', kind: 'drain', quiet: 1 });
  if (m.recoil) after.push({ type: 'recoil', pct: m.recoil });
  if (m.mpDrain) after.push({ type: 'resource', res: 'mp', ofCast: m.mpDrain, min: 3, target: 'self', why: 'mpDrain' });
  if (m.chiGain) after.push({ type: 'resource', res: 'chi', amount: m.chiGain, target: 'self', why: 'chi' });
  if (m.vsSt && m.vsSt.eat) after.push({ type: 'remove_status', status: m.vsSt.st, target: 'cast_targets', why: 'eat' });
  if (m.vsBroken) mods.push({ stage: 'skill', who: 'attacker', mul: m.vsBroken, cond: { tgtBroken: 1 } });
  if (m.lowHp) mods.push({ stage: 'skill', who: 'attacker', mul: { f: 'lowHp', v: m.lowHp } });
  if (m.execute) mods.push({ stage: 'skill', who: 'attacker', mul: m.execute.m, cond: { tgtHpBelow: m.execute.hp } });
  if (m.vsSt) mods.push({ stage: 'skill', who: 'attacker', mul: m.vsSt.m, cond: { tgtStatus: m.vsSt.st } });
  if (m.scale && pow) mods.push({ stage: 'skill', who: 'attacker', mul: { f: 'attrScale', v: m.scale }, cond: { srcIsHero: 1 } });
  const d = { name: m.n, desc: m.d || '', tags, el, cat, power: pow, acc: m.acc ?? null, critX: m.crit ? 2 : 1, prio: m.prio || 0,
    target: self ? 'self' : aoe || chain ? 'all_enemies' : 'enemy', chain, effects, after, mods, costs: o.costs || [],
    hits: m.hits ? (Array.isArray(m.hits) ? [m.hits[0], m.hits[1]] : [m.hits, m.hits]) : null, charge: !!m.charge, airborne: !!m.jump, pierceDef: m.pierceDef || 0,
    noHitRoll: !pow && !m.acc, fx: m.fx || 'hit', hitFx: m.hitFx || null, chargeMsg: m.chargeMsg || null, warn: m.warn || null, fallback: o.fallback || null,
    usage: m.timeStop ? { perBattle: 1 } : null, ai: { pow, st: m.st || null, stat: m.stat || null, drain: !!m.drain, charge: !!m.charge }, metadata: { from: o.from || id, tpl: o.tpl || null } };
  return d;
}
/* ---------- the basic attack (physical, or magic with a staff / tome / instrument) and the counter ---------- */
defPut('skills', 'attack', { ...skillFromMove('attack', { ...MOVES.attack, pow: 40, acc: 100 }, { kind: 'attack', extraTags: ['basic'] }) });
defPut('skills', 'attack_m', { ...skillFromMove('attack_m', { ...MOVES.attack, pow: 40, acc: 100, cat: '特', fx: 'magicBolt' }, { kind: 'attack', extraTags: ['basic'] }) });
defPut('skills', 'counter_strike', { ...skillFromMove('counter_strike', { ...MOVES.slash, pow: Math.round(MOVES.slash.pow * 0.7), acc: null }, { kind: 'attack', extraTags: ['reaction', 'counter'] }) });
DEF.skills.counter_strike.noHitRoll = false;
/* ---------- class signature skills: cost 3 招式點, no MP (v10.6) ---------- */
for (const c in SIG) { const S = SIG[c], T = MOVES[S.tpl]; if (!T) continue; const id = 'sig_' + c;
  const d = skillFromMove(id, { ...T, n: S.n, d: S.d, pow: S.pow ? Math.round(S.pow * (typeof SIG_POW_MUL !== 'undefined' ? SIG_POW_MUL : 1.4)) : T.pow, prio: S.prio || T.prio }, { kind: 'skill', tpl: S.tpl, extraTags: ['sig'], costs: [{ res: 'sgp', amount: typeof SIG_COST !== 'undefined' ? SIG_COST : 3 }], fallback: 'attack' });
  if (S.shieldAfter) d.after.push({ type: 'status', status: 'barrier', dur: S.shieldAfter, target: 'self' });
  if (S.healAfter) d.after.push({ type: 'heal', pct: S.healAfter / 100, target: 'self' });
  if (S.specAfter) d.after.push({ type: 'resource', res: 'wc', amount: S.specAfter, target: 'self', why: 'sig' });
  d.metadata.cls = c; defPut('skills', id, d); }
/* ---------- orb skills (the evolutions are passives keyed by the skill, built per hero in the bridge) ---------- */
for (const k in ORB_A) { const O = ORB_A[k], T = MOVES[O.tpl]; if (!T) continue; const id = 'o_' + k;
  defPut('skills', id, { ...skillFromMove(id, { ...T, n: O.n, d: O.d, ...(O.pow ? { pow: O.pow } : {}) }, { kind: 'skill', tpl: O.tpl, extraTags: ['orb'], costs: [{ res: 'mp', amount: O.mp }], fallback: 'attack' }), metadata: { orb: k, tpl: O.tpl } }); }
/* ---------- weapon specials: one skill per kind and weapon tier (power grows with the tier) ---------- */
const WSP_KINDS = ['burst', 'multi', 'heal', 'mana', 'guard', 'power', 'break', 'crit', 'drain', 'psn', 'brn', 'par', 'execute', 'weaken', 'haste'];
for (const k of WSP_KINDS) for (let t = 1; t <= 7; t++) for (const mag of [0, 1]) {
  const p = typeof specPow === 'function' ? specPow(k, t) : 40, id = 'wsp_' + k + '_' + t + (mag ? 'm' : ''), hurt = p > 0, base = { n: '特技', t: '一般', cat: mag ? '特' : '物', pow: p, acc: null };
  const d = skillFromMove(id, base, { kind: 'weapon_special', extraTags: ['weapon_special'] }); d.noHitRoll = !hurt; d.acc = null; d.target = hurt ? 'enemy' : 'self'; d.effects = hurt ? [{ type: 'damage' }] : [];
  if (k === 'multi') d.hits = [3, 3];
  if (k === 'execute') d.mods.push({ stage: 'skill', who: 'attacker', mul: 2.5, cond: { tgtHpBelow: 0.35 } });
  if (k === 'drain') d.after.push({ type: 'heal', ofCast: 0.5, target: 'self', kind: 'drain' });
  if (k === 'break') d.after.push({ type: 'stage', stats: { def: -1, spd: -1 }, target: 'cast_targets', cond: { tgtAlive: 1 } });
  if (k === 'psn' || k === 'brn' || k === 'par') d.after.push({ type: 'status', status: k, chance: 0.6, target: 'cast_targets', secondary: true, cond: { tgtAlive: 1 } });
  if (k === 'heal') d.effects = [{ type: 'heal', pct: 0.15, target: 'self' }];
  if (k === 'mana') d.effects = [{ type: 'resource', res: 'mp', pct: 0.2, target: 'self' }];
  if (k === 'haste') d.effects = [{ type: 'stage', stats: { spe: 1 }, target: 'self' }, { type: 'resource', res: 'mp', pct: 0.1, target: 'self' }];
  if (k === 'guard') d.effects = [{ type: 'status', status: 'barrier', dur: 2, target: 'self' }];
  if (k === 'power') d.effects = [{ type: 'stage', stats: { atk: 1, spa: 1 }, target: 'self' }];
  if (k === 'crit') d.effects = [{ type: 'status', status: 'critNext', target: 'self' }];
  if (k === 'weaken') { d.target = 'enemy'; d.effects = [{ type: 'stage', stats: { atk: -1, spa: -1 } }]; }
  d.metadata = { wsp: k, tier: t }; defPut('skills', id, d); }
/* ---------- monster moves (every move a species can learn, phase moves, family techniques) ---------- */
{ const used = new Set(); for (const sp in SPECIES) for (const L of SPECIES[sp].learn || []) used.add(Array.isArray(L) ? L[1] : L);
  for (const k in PHASE_MOVES) used.add(PHASE_MOVES[k]); for (const f in FAM_TECH) for (const m of FAM_TECH[f]) used.add(m);
  for (const m of ['m_golemFist', 'm_rockfall', 'm_quake', 'm_boulder', 'm_axeSpin', 'm_gutSlash', 'm_knife', 'm_dirtyKick', 'm_warCry', 'm_prismRay', 'm_crystalSpark', 'm_crystalShard', 'm_rumble', 'm_dominate']) used.add(m);
  for (const id of used) { const m = MOVES[id]; if (!m || DEF.skills[id]) continue; defPut('skills', id, skillFromMove(id, m, { kind: 'skill', extraTags: ['monster_skill'] })); }
  if (!DEF.skills.m_tackle) defPut('skills', 'm_tackle', skillFromMove('m_tackle', { n: '撞擊', t: '一般', cat: '物', pow: 40, acc: 100, fx: 'hit', foe: 1 }, { kind: 'skill', extraTags: ['monster_skill'] })); }
DEF.skills.m_dominate.effects = [{ type: 'stage', stats: { atk: -1, spa: -1 } }]; DEF.skills.m_dominate.noHitRoll = true;
/* ---------- the minion's knife throw (bandit boss) and the falling rocks (golem) are skills too ---------- */
defPut('skills', 'm_gangKnife', { ...skillFromMove('m_gangKnife', { n: '飛刀', t: '一般', cat: '物', pow: 30, acc: 95, fx: 'm_knife', foe: 1 }, { kind: 'skill', extraTags: ['monster_skill'] }) });
/* ---------- items usable in battle ---------- */
for (const k in ITEMS) { const it = ITEMS[k]; if (!it.use || it.key || it.mat) continue; let effects = null, extra = {};
  if (it.use === 'heal') effects = [{ type: 'heal', amount: it.v, target: 'self' }];
  else if (it.use === 'mp') effects = [{ type: 'resource', res: 'mp', amount: it.v, target: 'self' }];
  else if (it.use === 'cure') effects = [{ type: 'remove_status', status: it.v, target: 'self', why: 'item' }];
  else if (it.use === 'full') effects = [{ type: 'heal', pct: 1, target: 'self', quiet: 1 }, { type: 'resource', res: 'mp', pct: 1, target: 'self' }, { type: 'cleanse', target: 'self' }];
  else if (it.use === 'escape') { effects = []; extra.escape = 1; }
  else if (it.use === 'home') { effects = []; extra.escape = 1; extra.home = 1; }
  if (effects) defPut('items', k, { effects, ...extra, tags: ['item'], metadata: { use: it.use } }); }
/* ---------- unique weapon skills (專屬技): the template move with its own name, power and MP; their extra effects (ueff) are evolution passives ---------- */
if (typeof UNIQUE_W !== 'undefined') for (const k in UNIQUE_W) { const id = 'u_' + k, m = MOVES[id]; if (!m || DEF.skills[id]) continue;
  defPut('skills', id, { ...skillFromMove(id, m, { kind: 'skill', tpl: UNIQUE_W[k].skill[1], extraTags: ['weapon'], costs: [{ res: 'mp', amount: (typeof SKILL_MP !== 'undefined' && SKILL_MP[id]) || 6 }], fallback: 'attack' }), metadata: { uniq: k, tpl: UNIQUE_W[k].skill[1] } }); }
