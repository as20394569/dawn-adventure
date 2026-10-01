/* ===================== v11 戰鬥核心 v2 — 橋接：存檔 ⇄ 戰鬥單位、技能庫與技能槽、遭遇、天氣、戰後寫回 =====================
   Spec 10 / 11: the hero owns a skill library. Skills come from active orbs in the main weapon (and unique weapons);
   using one 8 times learns it for good, so taking the orb out no longer removes the skill. Up to 4 active skills are slotted
   (選單→技能), the class signature skill has its own slot. Orb evolutions now live on the library entry. */
const BB = {
  LEARN_USES: 8, SLOTS: 4,
  lib(st = Game.st) { return st.skillLib || (st.skillLib = {}); },
  entry(st, k) { const L = BB.lib(st); return L[k] || (L[k] = { k, x: 0, e: [], lv: 1, learned: false }); },
  // migrate / merge: an orb's own progress (old saves, fusion) moves into the library entry
  sync(st = Game.st) { if (!st) return; const L = BB.lib(st);
    for (const o of st.orbs || []) { if (!ORB_A[o.k]) continue; const e = BB.entry(st, o.k); if ((o.x || 0) > e.x) e.x = o.x; if ((o.e || []).length > e.e.length) e.e = o.e.slice(); if (e.x >= BB.LEARN_USES) e.learned = true; } },
  libAdd(st, k, n) { const e = BB.entry(st, k); e.x += n; if (e.x >= BB.LEARN_USES) e.learned = true; return e; },
  granted(st = Game.st) { const out = []; for (const o of (typeof activeOrbs === 'function' ? activeOrbs(st) : [])) out.push('o_' + o.k); const w = mainWeapon(st), s = w && GEAR[w.b] && GEAR[w.b].skill; if (s && DEF.skills[s]) out.push(s); return [...new Set(out)].filter(id => DEF.skills[id]); },
  available(st = Game.st) { const out = BB.granted(st), L = BB.lib(st); for (const k in L) if (L[k].learned && DEF.skills['o_' + k] && !out.includes('o_' + k)) out.push('o_' + k); return out; },
  // a skill joins a free slot by itself the first time it becomes available (socketing an orb); after that the player decides (選單→技能)
  slots(st = Game.st) { const av = BB.available(st), seen = st.slotSeen || (st.slotSeen = {}); const s = (st.slots || []).filter(id => av.includes(id));
    for (const id in seen) if (!av.includes(id)) delete seen[id];
    for (const id of av) if (!seen[id]) { seen[id] = 1; if (s.length < BB.SLOTS && !s.includes(id)) s.push(id); }
    st.slots = s; return s; },
  // the orb-like object the old orb UI functions understand (orbName, orbCodes, orbPending, orbEvolveFlow)
  skillObj(st, id) { if (!id || !id.startsWith('o_')) return null; return BB.entry(st, id.slice(2)); },
  nameOf(st, id) { const o = BB.skillObj(st, id); if (o) return orbName(o); const d = DEF.skills[id]; return d ? d.name : id; },
  learnUse(st, id) { const o = BB.skillObj(st, id); if (!o) return null; const was = o.learned; o.x++; if (!was && o.x >= BB.LEARN_USES) { o.learned = true; return 'learned'; } return null; },
  /* ---------- the hero as a battle unit ---------- */
  heroSpec(st, cfg = {}) {
    BB.sync(st); const S = heroStats(st), c = typeof clsV7 === 'function' ? clsV7(st.cls) : st.cls, sig = typeof sigId === 'function' ? sigId(st) : null, P = [], seen = new Set();
    const add = (key, v) => { if (!DEF.passives[key] || !v) return; P.push({ key, v }); seen.add(key); };
    for (const k in S) { if (k === 'fx') { for (const f in S.fx) if (S.fx[f]) add('fx.' + f, S.fx[f]); continue; } if (typeof S[k] === 'number' || (typeof S[k] === 'object' && S[k] && ['vs', 'kindUp', 'typeUp'].includes(k))) add(k, S[k]); }
    const T = k => typeof talentSum === 'function' ? talentSum(k, st) : 0;
    for (const k of ['dmgUp', 'healUp', 'sigPow', 'sigHit', 'sigCrit', 'sigWeak', 'sigVsSt', 'sigFdef', 'sigFatk', 'sigDrain', 'sigHeal', 'sigCure', 'sigShield', 'sigMpBack', 'sigSpec', 'sigTwice', 'sigStart', 'specStart', 'comboStart', 'openShield']) if (!seen.has(k)) add(k, T(k));
    if (typeof tsumPre === 'function') { for (const [k, v] of Object.entries(tsumPre('sigSt.', st))) add('sigSt.' + k, v); for (const [k, v] of Object.entries(tsumPre('sigBuff.', st))) add('sigBuff.' + k, v); }
    if (c === 'guardian' && typeof shieldOn === 'function' && shieldOn(st)) P.push({ key: 'sigPow', v: 20 });
    const avail = BB.available(st), slots = BB.slots(st);
    for (const id of avail) { const o = BB.skillObj(st, id); if (o && typeof orbCodes === 'function') for (const code of orbCodes(o)) P.push({ key: 'evo', v: { skill: id, code } }); const m = MOVES[id]; if (m && m.uniq) for (const code of m.ueff || []) P.push({ key: 'evo', v: { skill: id, code } }); }
    if (c === 'monk') P.push({ key: 'chiCrit', v: 1 });
    if (S.enT) P.push({ key: 'enchant', v: { el: S.enT, lv: S.enLv || 1 } });
    const w = mainWeapon(st), B = w && GEAR[w.b], kind = B ? B.kind : null, mag = typeof isMagicW === 'function' && isMagicW(kind), wk = typeof mainWKey === 'function' ? mainWKey(st) : null, sp = wk && WSK[wk] ? WSK[wk].s : null;
    const K = (typeof KIND_ATK !== 'undefined' && KIND_ATK[kind]) || ['攻擊', 'slash'];
    const wsp = sp ? { N: typeof wsN === 'function' ? wsN(sp, st) : 3 } : null, wspSkill = sp ? 'wsp_' + sp.k + '_' + clamp(B.t || 1, 1, 7) + (mag ? 'm' : '') : null;
    const mech = ['heroCore']; if (cfg.kind === 'elite' || cfg.kind === 'boss') for (const A of (typeof ALLIES !== 'undefined' ? ALLIES : [])) if (A.ok(st.flags || {})) mech.push(A.k === 'gren' ? 'allyGren' : 'allyLia');
    const statuses = []; if (st.status && DEF.statuses[st.status]) statuses.push({ id: st.status, dur: st.status === 'slp' ? (st.sleepT ?? 2) : null });
    return { id: 'H', side: 'A', hero: true, name: st.name, lv: st.lv, kind: 'hero', attr: heroAttr(st),
      stats: { hp: S.hp, mp: S.mp, atk: S.atk, def: S.def, spa: S.spa, spd: S.spd, spe: S.spe, crit: S.crit ?? 6, hit: S.hit || 0, eva: S.eva || 0, resist: S.resist || {}, wkind: S.wkind || kind },
      hp: Math.min(st.hp, S.hp), mp: Math.min(st.mp ?? S.mp, S.mp), passives: P, skills: [sig, ...slots].filter(Boolean), sig: !!sig, wsp, chi: c === 'monk' || avail.some(id => DEF.skills[id] && DEF.skills[id].after.some(e => e.res === 'chi')),
      comboMax: 3 + (T('comboMax') || 0), comboStart: T('comboStart') || 0, statuses,
      data: { mechanics: mech, sigSkill: sig, slots, attackSkill: mag ? 'attack_m' : 'attack', attackName: K[0], attackFx: (typeof FX !== 'undefined' && FX[K[1]]) ? K[1] : mag ? 'magicBolt' : 'slash',
        welem: S.welem || (B && B.elem) || null, wcat: mag ? '特' : '物', wspSkill, wspName: sp ? sp.n : null, wspFx: (typeof KIND_SPFX !== 'undefined' && KIND_SPFX[kind]) || 'hit', wtier: B ? B.t : 1,
        comboKeep: !!T('comboKeep'), comboGuard: !!T('comboGuard'), comboStep: 6 + (T('comboStep') || 0), allyUp: T('allyUp') || 0, allyMore: T('allyMore') || 0,
        skillNames: Object.fromEntries(avail.map(id => [id, BB.nameOf(st, id)])) } };
  },
  /* ---------- the encounter: 1–3 wild monsters (spec G1), or the fixed elite / boss ---------- */
  extraFoes(cfg, st, core) {
    if (Array.isArray(cfg.extra)) return cfg.extra.filter(([sp]) => SPECIES[sp]); // scripted groups (and tests)
    if (cfg.kind !== 'wild' || cfg.pack || cfg.wxMon || cfg.aevKind || cfg.solo || cfg.extra === 0 || (SPECIES[cfg.sp] || {}).rare || (st.lv || 1) < 4) return [];
    const ow = Game.ow, p = ow && ow.p, enc = ow && ow.map && p && (ow.map.d.encounters || []).find(e => p.y >= e.y0 && p.y <= e.y1); if (!enc) return [];
    const r = core.rng.next(), n = r < 0.6 ? 0 : r < 0.9 || st.lv < 10 ? 1 : 2, out = [];
    for (let i = 0; i < n; i++) { const tot = enc.table.reduce((a, q) => a + q[3], 0); let x = core.rng.next() * tot, row = enc.table[0]; for (const q of enc.table) { x -= q[3]; if (x < 0) { row = q; break; } } if (SPECIES[row[0]] && !SPECIES[row[0]].rare) out.push([row[0], core.rng.int(row[1], row[2])]); }
    return out;
  },
  envOf(cfg) {
    const mods = [], k = cfg.wx, Wd = k && typeof WEATHER !== 'undefined' && WEATHER[k]; if (!Wd) return mods;
    for (const el in Wd.mul || {}) mods.push({ stage: 'env', mul: Wd.mul[el], cond: { element: el }, key: 'wx:' + k });
    if (Wd.acc) mods.push({ stage: 'env', accAdd: -Wd.acc, key: 'wx:' + k }); if (Wd.spe) mods.push({ stage: 'env', speMul: Wd.spe, key: 'wx:' + k });
    return mods;
  },
  build(cfg, st = Game.st) {
    st.rngSeed = ((st.rngSeed || ((Date.now() & 0x7fffffff) ^ 0x9e3779b9)) * 1103515245 + 12345) >>> 0;
    const envTrigs = DEF.mechanics.elementReactions.triggers.slice();
    const core = new BattleCore({ seed: cfg.seed ?? st.rngSeed, units: [], env: { weather: cfg.wx || null }, envMods: BB.envOf(cfg), envTrigs, cfg });
    core.data.gold = () => st.money || 0; core.data.takeGold = g => { st.money = Math.max(0, (st.money || 0) - g); }; core.data.useItem = k => { if (st.bag[k] > 0) st.bag[k]--; };
    core.addUnit(BB.heroSpec(st, cfg), true);
    const extra = BB.extraFoes(cfg, st, core), n = 1 + extra.length, mech = [];
    if (cfg.id === 'mossGiant' && st.flags && st.flags.q2res === 'stay' && !st.flags.q2done) mech.push('timArrows');
    const main = BD.unitForEnemy(core, cfg.sp, cfg.lv, cfg.kind || 'wild', 'B', 1, { rematch: !!cfg.rematch, multi: n > 1 ? n : 0, mechanics: mech }); if (main) core.addUnit(main, true);
    extra.forEach(([sp, lv], i) => { const u = BD.unitForEnemy(core, sp, lv, 'wild', 'B', i + 2, { multi: n }); if (u) core.addUnit(u, true); });
    for (const u of core.side('B')) { const dx = st.dex || (st.dex = {}); (dx[u.sp] || (dx[u.sp] = { won: 0 })).seen = 1; }
    BB.nameFoes(core);
    // the weather shrine's blessing (天氣祠): the next battles start with 物攻 / 魔攻 +1
    if (st.bless > 0) { st.bless--; const H = core.byId.H; for (const k of ['atk', 'spa']) H.statuses.push({ id: 'stage_' + k, stacks: 1, dur: 3, src: null, at: 0, data: {} }); core.data.bless = true; }
    return core;
  },
  // two of the same monster are told apart: 史萊姆A / 史萊姆B (minions called in later get the next letter)
  nameFoes(core) { const by = {}; for (const u of core.side('B')) (by[u.sp] = by[u.sp] || []).push(u);
    for (const sp in by) { const L = by[sp]; if (L.length < 2) continue; const base = (SPECIES[sp] && SPECIES[sp].n) || L[0].name; L.forEach((u, i) => { u.name = base + 'ABCDEFG'[i]; }); } },
  // write the hero back and count skill use (learning / evolution) — returns notes for the scene to show
  apply(core, st = Game.st) {
    const H = core.byId.H, notes = []; if (!H) return notes; const S = heroStats(st);
    st.hp = clamp(H.res.hp, 0, S.hp); st.mp = clamp(H.res.mp ?? st.mp, 0, S.mp); const m = core.majorOf(H); st.status = m; st.sleepT = m === 'slp' ? (core.statusOf(H, 'slp').dur || 0) : undefined;
    for (const e of core.log) {
      if (e.type === EVT.SKILL_SUCCESS && e.src === 'H' && e.payload.skill && e.payload.skill.startsWith('o_') && !e.payload.follow) { const r = BB.learnUse(st, e.payload.skill), o = BB.skillObj(st, e.payload.skill);
        if (r === 'learned') notes.push({ k: 'learned', id: e.payload.skill }); if (o && typeof orbPending === 'function' && orbPending(o) && !o.told) { o.told = 1; notes.push({ k: 'evolve', id: e.payload.skill }); } }
      if (e.type === EVT.BREAK && e.src && core.byId[e.src] && core.byId[e.src].side === 'A') st.brkCount = (st.brkCount || 0) + 1;
    }
    return notes;
  },
};
// saves: build the library once from the old orbs and slot what the hero was using
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; if (st && (st.battleV || 0) < 2) { BB.sync(st); BB.slots(st); st.battleV = 2; } return _so.apply(this, a); }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.skillLib = {}; st.slots = []; st.battleV = 2; } return st; }; }
