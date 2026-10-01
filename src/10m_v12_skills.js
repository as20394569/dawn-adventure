/* ===================== v12 技能：冷卻、學會次數、技能來源（職業技能表・武器技能）、技能庫、修練之書；英雄單位；寶珠・附魔取消 =====================
   docs/battle_v3_draft.md §5–§7. Skill ids never change (o_* = the former active-orb skills, u_* = unique weapon skills), so learned
   skills and evolutions in old saves stay. Orbs and enchanting are gone: their reward sites are paused (they give nothing until the
   player decides the replacements, draft §7.5), and the save data (st.orbs, gear .o / .en) is left as it is. */
/* ---------- §5.2 cooldown (own actions), learn count, 搶先 ---------- */
const SKILL12 = { galeCut: [0, 6, 1], twinFang: [0, 6], thornBind: [0, 6], aquaEdge: [0, 6], bolt: [1, 6], fireShot: [0, 6], rockBreak: [0, 6], shieldRam: [1, 10], swallowFlight: [0, 6],
  bloodMoon: [1, 10], steelCleaver: [1, 10], shadowRush: [2, 14], allOut: [2, 14], bladeRain: [1, 10], lastWall: [1, 10], cloudPierce: [1, 10], chainPalm: [0, 6], dawnFlash: [1, 10, 1],
  crossJudge: [1, 10], assassinMark: [1, 10], flameVortex: [2, 14], starfall: [3, 14], tidalRage: [2, 14], chainLightning: [2, 14], thorHammer: [3, 14], verdantWind: [1, 10], arcaneShot: [1, 10],
  sonicBoom: [1, 10], steamCannon: [1, 10], combustion: [1, 10], mend: [1, 6], holyWard: [3, 14], manaWall: [2, 6], warCry: [1, 6], smokeVeil: [2, 6], focusMind: [1, 6], ironWall: [1, 6],
  chronoLock: [0, 14], songOfValor: [2, 10], drakeFang: [1, 10] };
const LEARN_OF_CD = [6, 10, 14, 14];
for (const k in SKILL12) { const D = DEF.skills['o_' + k]; if (!D) { bvErr('v12', 'skill o_' + k + ' missing'); continue; } const [cd, learn, prio] = SKILL12[k];
  D.cooldown = cd; D.prio = prio || 0; D.tags = D.tags.filter(t => t !== 'priority').concat(prio ? ['priority'] : []); D.metadata = { ...D.metadata, learn }; }
// §5.3 unique weapon skills: cooldown by power (≤65: 0, 66–95: 1, ≥96: 2), learned like the others
for (const id in DEF.skills) if (id.startsWith('u_')) { const D = DEF.skills[id], p = D.power || 0, cd = p >= 96 ? 2 : p >= 66 ? 1 : 0; D.cooldown = cd; D.metadata = { ...D.metadata, learn: LEARN_OF_CD[cd] }; }
for (const id in DEF.skills) if (DEF.skills[id].cooldown == null) DEF.skills[id].cooldown = 0; // basic attack, weapon specials, monster moves: no cooldown
// evolutions: 「MP−40%」 becomes 「冷卻−1」 on a skill that has a cooldown (draft §2.5); 「先制」 is 搶先 (core: prioSkill)
{ const P = DEF.passives.evo, mk = P.make; P.make = v => { const [k] = evoCode(v.code), sk = DEF.skills[v.skill]; if (k === 'cheap' && sk && sk.cooldown > 0) return { mods: [{ stage: 'skill', cdAdd: -1, cond: { skillIs: v.skill } }] }; return mk(v); }; }
EVO_TXT.cheap = () => 'MP−40%（有冷卻的技能：冷卻−1）'; EVO_TXT.first = () => '搶先（下回合第一個行動）';

/* ---------- §6.3 class skill tables (learned at these levels; a class change learns the ones already reached) ---------- */
const CLASS_SKILLS12 = {
  swordsman: ['galeCut', 'swallowFlight', 'warCry', 'crossJudge', 'focusMind', 'dawnFlash', 'steelCleaver', 'allOut'],
  mage: ['fireShot', 'aquaEdge', 'bolt', 'verdantWind', 'manaWall', 'flameVortex', 'tidalRage', 'starfall'],
  guardian: ['rockBreak', 'shieldRam', 'ironWall', 'mend', 'lastWall', 'manaWall', 'holyWard', 'steelCleaver'],
  ranger: ['twinFang', 'galeCut', 'smokeVeil', 'focusMind', 'assassinMark', 'bladeRain', 'cloudPierce', 'shadowRush'],
  bard: ['sonicBoom', 'mend', 'songOfValor', 'aquaEdge', 'smokeVeil', 'verdantWind', 'holyWard', 'chronoLock'],
  machinist: ['fireShot', 'rockBreak', 'ironWall', 'steamCannon', 'bolt', 'combustion', 'chainLightning', 'thorHammer'],
  monk: ['chainPalm', 'twinFang', 'focusMind', 'rockBreak', 'ironWall', 'lastWall', 'drakeFang', 'allOut'],
  dragoon: ['galeCut', 'cloudPierce', 'warCry', 'drakeFang', 'bloodMoon', 'steelCleaver', 'shadowRush', 'allOut'],
  otherworlder: ['galeCut', 'fireShot', 'mend', 'dawnFlash', 'chainLightning', 'crossJudge', 'chronoLock', 'starfall'],
  spellblade: ['fireShot', 'galeCut', 'arcaneShot', 'bloodMoon', 'chainLightning', 'crossJudge', 'combustion', 'steelCleaver'],
};
const CLASS_SKILL_LV = [1, 4, 8, 12, 16, 20, 26, 32];
const classSkills12 = (st = Game.st, all = false) => { const L = CLASS_SKILLS12[clsV7(st.cls)] || []; return L.map((k, i) => ['o_' + k, CLASS_SKILL_LV[i]]).filter(([id, lv]) => all || (st.lv || 1) >= lv); };
/* ---------- §6.4 the skill each weapon carries ---------- */
const WSKILL_EL = { 火: ['fireShot', 'fireShot', 'flameVortex', 'flameVortex', 'combustion', 'combustion', 'starfall'], 水: ['aquaEdge', 'aquaEdge', 'steamCannon', 'steamCannon', 'tidalRage', 'tidalRage', 'tidalRage'],
  雷: ['bolt', 'bolt', 'chainLightning', 'chainLightning', 'thorHammer', 'thorHammer', 'thorHammer'], 草: ['thornBind', 'thornBind', 'verdantWind', 'verdantWind', 'verdantWind', 'verdantWind', 'verdantWind'] };
const WSKILL_KIND = { 劍: [['galeCut', 'swallowFlight'], ['crossJudge', 'bloodMoon'], ['dawnFlash', 'steelCleaver', 'allOut']], 短刀: [['twinFang'], ['assassinMark', 'bladeRain'], ['shadowRush']],
  斧: [['rockBreak'], ['shieldRam', 'lastWall'], ['allOut']], 長槍: [['galeCut'], ['cloudPierce'], ['drakeFang', 'shadowRush']], 拳套: [['chainPalm'], ['rockBreak'], ['drakeFang']],
  法杖: [['arcaneShot'], ['mend', 'manaWall'], ['holyWard']], 魔導書: [['arcaneShot'], ['manaWall'], ['chronoLock']], 樂器: [['sonicBoom'], ['songOfValor'], ['holyWard']], 火槍: [['twinFang'], ['bladeRain'], ['shadowRush']] };
function weaponSkill12(k) { const G = GEAR[k]; if (!G || G.slot !== 'weapon') return null;
  if (typeof UNIQUE_W !== 'undefined' && UNIQUE_W[k]) return DEF.skills['u_' + k] ? 'u_' + k : null;
  const t = clamp(G.t || 1, 1, 7); if (G.elem && WSKILL_EL[G.elem]) return 'o_' + WSKILL_EL[G.elem][t - 1];
  const K = WSKILL_KIND[G.kind]; if (!K) return null; const L = K[t <= 2 ? 0 : t <= 4 ? 1 : 2]; return 'o_' + L[hashK(k) % L.length]; }

/* ---------- the skill library (st.skillLib): o_* entries keep the orb key (old saves), u_* keep the id ---------- */
Object.assign(BB, {
  learnN: id => (DEF.skills[id] && DEF.skills[id].metadata && DEF.skills[id].metadata.learn) || 8,
  libKey: id => id.startsWith('o_') ? id.slice(2) : id,
  skillObj(st, id) { if (!id || !(id.startsWith('o_') || id.startsWith('u_')) || !DEF.skills[id]) return null; return BB.entry(st, BB.libKey(id)); },
  nameOf(st, id) { const D = DEF.skills[id]; if (!D) return id; if (id.startsWith('o_')) return orbName(BB.skillObj(st, id)); return D.name; },
  learnUse(st, id) { const o = BB.skillObj(st, id); if (!o) return null; const was = o.learned; o.x = (o.x || 0) + 1; if (!was && o.x >= BB.learnN(id)) { o.learned = true; return 'learned'; } return null; },
  // where a skill comes from (the skill screen shows it): 職業 Lv○ / 武器 / 已學會
  sourceOf(st, id) { const c = classSkills12(st, true).find(([s]) => s === id); if (c && (st.lv || 1) >= c[1]) return '職業 Lv' + c[1]; const w = mainWeapon(st); if (w && weaponSkill12(w.b) === id) return '武器'; const e = BB.skillObj(st, id); return e && e.learned ? '已學會' : ''; },
  classGrant(st = Game.st) { const out = []; for (const [id] of classSkills12(st)) { if (!DEF.skills[id]) continue; const e = BB.skillObj(st, id); if (e && !e.learned) e.learned = true; out.push(id); } return out; },
  granted(st = Game.st) { const out = BB.classGrant(st), w = mainWeapon(st), s = w && weaponSkill12(w.b); if (s && DEF.skills[s] && !out.includes(s)) out.push(s); return out; },
  available(st = Game.st) { const out = BB.granted(st), L = BB.lib(st); for (const k in L) { const id = k.startsWith('u_') ? k : 'o_' + k; if (L[k].learned && DEF.skills[id] && !out.includes(id)) out.push(id); } return out; },
});
// the orb system is gone: no active orbs in weapons, no passive orbs in armour, no orb rewards (paused, draft §7.5)
activeOrbs = function () { return []; }; passiveOrbs = function () { return []; };
orbGet = function* () { /* v12: 寶珠取消，獎勵暫停（待定） */ };
const BOOK_DROP12 = Object.keys(ORB_DROP); for (const k in ORB_DROP) delete ORB_DROP[k]; // the elites / bosses that dropped orbs now drop 修練之書 (10o)
// enchanting is gone: an enchanted weapon keeps its save data but the enchant does nothing; the stones' chests stay closed until decided
for (const k in EN_EFF) delete EN_EFF[k];
// the 8 extension-area chests that held enchant stones now hold 修練之書 (the upper-grade ones two)
for (const id in MAPS) { const d = MAPS[id]; if (d && d.items) for (const i of d.items) if (i.item && ITEMS[i.item] && ITEMS[i.item].use === 'enchant') { i.n = ITEMS[i.item].en[1] >= 2 ? 2 : 1; i.item = 'trainBook'; } }

/* ---------- 修練之書 (draft §6.2): a learned skill's evolution progress +12 ---------- */
ITEMS.trainBook = { n: '修練之書', cat: '永久強化', use: 'trainBook', price: 1500, d: '選一個已學會的技能，進化進度 +12。' };
function* trainBookFlow(k) {
  const st = Game.st, L = BB.available(st).filter(id => { const e = BB.skillObj(st, id); return e && e.learned && id.startsWith('o_') && orbStage(e) < 2; });
  if (!L.length) { yield* say('沒有可以修練的技能。（已學會、還能進化的技能才行）'); return; }
  const r = yield* choose(L.map(id => ({ t: BB.nameOf(st, id) + '　' + (BB.skillObj(st, id).x || 0) + '/' + ORB_EVO[orbStage(BB.skillObj(st, id))] })).concat({ t: '返回' }), { title: '修練哪一個技能？' });
  if (r < 0 || r >= L.length) return; const e = BB.skillObj(st, L[r]); e.x = (e.x || 0) + 12; st.bag[k]--; if (!st.bag[k]) delete st.bag[k]; Sound.jingle('levelup');
  yield* itemGet('「' + BB.nameOf(st, L[r]) + '」的進化進度 +12！'); if (orbPending(e)) { e.told = 1; yield* orbEvolveFlow(e); }
}

/* ---------- the hero as a battle unit (v12) ---------- */
BB.heroSpec = function (st, cfg = {}) {
  BB.sync(st); const S = heroStats(st), c = clsV7(st.cls), C = DEF.classes[c], P = [], seen = new Set(), T = TAL12.defs(st), rules = {};
  for (const t of T) for (const k in t.rules || {}) rules[k] = typeof t.rules[k] === 'number' ? (rules[k] || 0) + t.rules[k] : t.rules[k];
  const add = (key, v, src) => { if (!DEF.passives[key] || !v) return; P.push({ key, v, src }); seen.add(key); };
  for (const k in S) { if (k === 'fx') { for (const f in S.fx) if (S.fx[f]) add('fx.' + f, S.fx[f], 'equip'); continue; } if (typeof S[k] === 'number' || (typeof S[k] === 'object' && S[k] && ['vs', 'kindUp', 'typeUp'].includes(k))) add(k, S[k], 'equip'); }
  const w = mainWeapon(st), B = w && GEAR[w.b], kind = B ? B.kind : null, mag = isMagicW(kind), uniq = w && typeof UNIQUE_W !== 'undefined' && UNIQUE_W[w.b] ? w.b : null;
  if (C && kind && (C.affinity.includes(kind) || C.affinity.includes('*'))) add('affinity', C.affinity.includes('*') ? 5 : 10, 'class');
  const avail = BB.available(st), slots = BB.slots(st);
  for (const id of avail) { const o = BB.skillObj(st, id); if (o && id.startsWith('o_')) for (const code of orbCodes(o)) P.push({ key: 'evo', v: { skill: id, code }, src: 'skill' }); const m = MOVES[id]; if (m && m.uniq) for (const code of m.ueff || []) P.push({ key: 'evo', v: { skill: id, code }, src: 'skill' }); }
  const wk = mainWKey(st), sp = wk && WSK[wk] ? WSK[wk].s : null, wsp = sp ? { N: wsN(sp, st) } : null, wspSkill = sp ? 'wsp_' + sp.k + '_' + clamp(B.t || 1, 1, 7) + (mag ? 'm' : '') : null;
  const K = (typeof KIND_ATK !== 'undefined' && KIND_ATK[kind]) || ['攻擊', 'slash'], segs = (uniq && UNIQ12[uniq] && UNIQ12[uniq].attack) || (rules.arhat ? 3 : 0) || (kind && WKIND12[kind] && WKIND12[kind].attack) || 1;
  const attackSkill = mag ? 'attack_m' : segs === 3 ? 'attack_3' : segs === 2 ? 'attack_2' : 'attack';
  const mech = ['cls_' + c]; if (kind && DEF.mechanics['wk_' + kind]) mech.push('wk_' + kind); if (uniq && DEF.mechanics['uw_' + uniq]) mech.push('uw_' + uniq);
  if (cfg.kind === 'elite' || cfg.kind === 'boss') for (const A of (typeof ALLIES !== 'undefined' ? ALLIES : [])) if (A.ok(st.flags || {})) mech.push(A.k === 'gren' ? 'allyGren' : 'allyLia');
  mech.push('heroCore');
  const statuses = []; if (st.status && DEF.statuses[st.status]) statuses.push({ id: st.status, dur: st.status === 'slp' ? (st.sleepT ?? 2) : null });
  const sig = C ? C.sig : null, shield = !!(typeof shieldOn === 'function' && shieldOn(st)) && c !== 'otherworlder';
  return { id: 'H', side: 'A', hero: true, name: st.name, lv: st.lv, kind: 'hero', cls: c, attr: heroAttr(st),
    stats: { hp: S.hp, mp: S.mp, atk: S.atk, def: S.def, spa: S.spa, spd: S.spd, spe: S.spe, crit: S.crit ?? 6, hit: S.hit || 0, eva: S.eva || 0, resist: S.resist || {}, wkind: S.wkind || kind },
    hp: Math.min(st.hp, S.hp), mp: Math.min(st.mp ?? S.mp, S.mp), passives: P, skills: [sig, ...slots].filter(Boolean), sig: !!sig, wsp,
    comboMax: rules.combo ? 3 + (rules.comboMax || 0) : 0, comboStart: 0, statuses,
    data: { mechanics: mech, talents: TAL12.ids(st), sigSkill: sig, slots, attackSkill, attackName: K[0], attackFx: (typeof FX !== 'undefined' && FX[K[1]]) ? K[1] : mag ? 'magicBolt' : 'slash',
      welem: S.welem || (B && B.elem) || null, wcat: mag ? '特' : '物', wkind: kind, uniq, wspSkill, wspName: sp ? sp.n : null, wspFx: (typeof KIND_SPFX !== 'undefined' && KIND_SPFX[kind]) || 'hit', wtier: B ? B.t : 1,
      wcPerHit: kind === '短刀', shield, allyUp: talentSum('allyUp', st) || 0, allyMore: talentSum('allyMore', st) || 0,
      skillNames: Object.fromEntries(avail.map(id => [id, BB.nameOf(st, id)])) } };
};
// skill use: learning (6/10/14 by tier) and evolution (12 / 36 uses) for every library skill (o_*, u_*)
BB.apply = function (core, st = Game.st) {
  const H = core.byId.H, notes = []; if (!H) return notes; const S = heroStats(st);
  st.hp = clamp(H.res.hp, 0, S.hp); st.mp = clamp(H.res.mp ?? st.mp, 0, S.mp); const m = core.majorOf(H); st.status = m; st.sleepT = m === 'slp' ? (core.statusOf(H, 'slp').dur || 0) : undefined;
  for (const e of core.log) {
    if (e.type === EVT.SKILL_SUCCESS && e.src === 'H' && e.payload.skill && /^[ou]_/.test(e.payload.skill) && !e.payload.follow) { const r = BB.learnUse(st, e.payload.skill), o = BB.skillObj(st, e.payload.skill);
      if (r === 'learned') notes.push({ k: 'learned', id: e.payload.skill }); if (o && e.payload.skill.startsWith('o_') && orbPending(o) && !o.told) { o.told = 1; notes.push({ k: 'evolve', id: e.payload.skill }); } }
    if (e.type === EVT.BREAK && e.src && core.byId[e.src] && core.byId[e.src].side === 'A') st.brkCount = (st.brkCount || 0) + 1;
  }
  return notes;
};
// 異界勇者 can't carry a shield (draft §3)
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (st && clsV7(st.cls) === 'otherworlder') s.block = 0; return s; }; }
{ const _ep = equipPick; equipPick = function* (sl) { if (sl === 'shield' && clsV7(Game.st.cls) === 'otherworlder') { Sound.sfx('bump'); yield* say('異界勇者不能裝備盾。'); return; } yield* _ep.call(this, sl); }; }
// the guardian's old shield bonuses (格擋 +10%, 聖盾衝擊 +20%) are replaced by the v12 passive 守護之盾
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st), g = typeof shieldOn === 'function' && shieldOn(st); if (g && clsV7(st.cls) === 'guardian') s.block = Math.min(45, gearStats(g).sp.block || 0); return s; }; }

/* ---------- saves (battleV 3): the v9.2 talents are refunded once (st.tal12 starts empty) — told on the first walk ---------- */
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st, old = st && (st.battleV || 0) < 3; let conv = [];
    if (st) { BB.sync(st); conv = v12Convert(st); BB.slots(st); st.battleV = 3; }
    const ow = _so.apply(this, a), L = [];
    if (st && old && st.cls && !st.flags.tal12Told) { st.flags.tal12Told = 1; L.push('（戰鬥系統更新了！）', '天賦全部重新設計，所有天賦點都已經退回。', '每個職業有了自己的核心資源，技能也有了冷卻。到「選單→天賦」重新分配吧。'); }
    if (conv.length) L.push(...conv);
    if (L.length && ow && ow.run) ow.run((function* () { yield* wait(20); yield* sayAll(L); })());
    return ow; }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.battleV = 3; st.tal12 = {}; } return st; }; }

/* ---------- every data file is loaded: give the effects their ids (spec §4) and check the data ---------- */
bvFinalize();
if (BV2.DEV) { const errs = bvValidate(); if (errs.length) bvErr('validate', errs.length + ' problems: ' + errs.slice(0, 5).join(' | ')); }
/* ---------- the hero on auto (tests, Game.autoPlay): cooldowns and class resources decide what can be used ---------- */
BAI.hero = function (core, u, policy = core.data.heroPolicy || 'smart') {
  const foes = core.foesOf(u); if (!foes.length) return { type: 'wait' }; const R = core.rng, t = foes.slice().sort((a, b) => a.res.hp - b.res.hp)[0];
  const can = id => !!DEF.skills[id] && !core.skillBlock(u, DEF.skills[id], { meta: {} }), tg = id => DEF.skills[id].target === 'self' ? [u.id] : [t.id];
  const atk = { type: 'skill', skill: u.data.attackSkill || 'attack', targets: [t.id] }; if (policy === 'attack') return atk;
  const list = (u.data.slots || []).filter(can), sig = u.data.sigSkill;
  if (u.res.hp < u.max.hp * 0.35) { const h = list.find(id => DEF.skills[id].tags.includes('heal')); if (h) return { type: 'skill', skill: h, targets: [u.id] }; if (policy === 'smart' && R.chance(0.15)) return { type: 'defend' }; }
  if (sig && can(sig) && R.chance(policy === 'random' ? 0.5 : 0.85)) return { type: 'skill', skill: sig, targets: tg(sig) };
  const dmg = list.filter(id => DEF.skills[id].power), aoe = dmg.filter(id => DEF.skills[id].target === 'all_enemies');
  if (foes.length > 1 && aoe.length && R.chance(0.7)) return { type: 'skill', skill: R.pick(aoe), targets: [t.id] };
  if (policy === 'random' && R.chance(0.15)) return { type: 'defend' };
  if (policy === 'random' && list.length && R.chance(0.6)) { const id = R.pick(list); return { type: 'skill', skill: id, targets: tg(id) }; }
  if (dmg.length && R.chance(0.65)) { const id = R.pick(dmg); return { type: 'skill', skill: id, targets: [t.id] }; }
  const sup = list.filter(id => !DEF.skills[id].power && DEF.skills[id].target === 'self'); if (sup.length && R.chance(0.25)) return { type: 'skill', skill: R.pick(sup), targets: [u.id] };
  return atk;
};
