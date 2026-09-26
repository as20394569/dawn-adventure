// Damage-formula & equipment-linkage audit. node tools/play.js tools/audit.js
module.exports = async (g) => {
  const out = await g.ev(() => {
    const G = __game, R = { fail: [], info: [] }, fail = (...a) => R.fail.push(a.join(' ')), info = (...a) => R.info.push(a.join(' '));
    const fresh = (lv = 20) => { G.newGameState('測'); const st = G.Game.st; st.lv = lv; st.flags.license = 1; for (const k in st.equip) st.equip[k] = null; st.gear = []; st.hp = G.heroStats().hp; return st; };
    const slotFor = b => GEAR[b].slot === 'acc' ? 'acc1' : GEAR[b].slot;
    const ok = v => typeof v === 'number' && isFinite(v);
    // ---------- 1. every gear base feeds heroStats exactly ----------
    for (const b in GEAR) {
      for (const [q, e] of [[1, 0], [4, 5]]) {
        const st = fresh(); const s0 = G.heroStats(); const gg = { u: 1, b, q, r: 1, e, a: [] }; st.gear.push(gg); st.equip[slotFor(b)] = 1; const s1 = G.heroStats(), o = gearStats(gg);
        for (const k of STATK) { const d = s1[k] - s0[k], want = o.st[k] || 0; if (d !== want) fail('gear stat', b, 'q' + q, k, 'got', d, 'want', want); }
        for (const k of ['crit', 'hit', 'eva', 'drain', 'elem']) { const d = +(s1[k] - s0[k]).toFixed(3), want = o.sp[k] || 0; if (d !== want) fail('gear sp', b, k, d, want); }
        if (JSON.stringify(s1.vs) !== JSON.stringify(o.sp.vs)) fail('gear vs', b);
        for (const t in o.sp.resist) if (s1.resist[t] !== o.sp.resist[t]) fail('gear resist', b, t);
        for (const f of GEAR[b].fx || []) { if (!s1.fx[f]) fail('gear fx missing', b, f); if (!SPECIALS[f]) fail('special undefined', f); }
        if ((GEAR[b].elem || null) !== (GEAR[b].slot === 'weapon' ? s1.welem : null)) fail('weapon elem', b);
        if (GEAR[b].sp && GEAR[b].sp.vs && !FAMILIES[GEAR[b].sp.vs[0]]) fail('vs not a family', b, GEAR[b].sp.vs[0]);
        // multiplier check
        for (const k in GEAR[b].st) { const want = Math.max(1, Math.round(GEAR[b].st[k] * GQ[q][2] * (1 + 0.08 * e))); if (o.st[k] !== want) fail('mult', b, k, o.st[k], want); }
      }
    }
    // ---------- 2. every affix feeds heroStats ----------
    for (const id in AFFIX_TABLE) {
      const A = AFFIX_TABLE[id], st = fresh(), s0 = G.heroStats(), slot = A.slots.includes('weapon') ? 'ironSword' : 'clothCap';
      const aff = A.typed ? [id, A.fam ? 'undead' : '火', 7] : [id, 7]; st.gear.push({ u: 1, b: slot, q: 1, r: 1, a: [aff] }); st.equip[slotFor(slot)] = 1; const s1 = G.heroStats(), base = gearStats({ b: slot, q: 1, r: 1, a: [] });
      const key = A.key || id;
      if (id === 'vs') { if (!s1.vs.some(([t, v]) => t === 'undead' && v === 7)) fail('affix vs'); }
      else if (id === 'resist') { if (s1.resist['火'] !== 7) fail('affix resist'); }
      else { const d = +(s1[key] - s0[key] - ((base.st[key] || 0) + (base.sp[key] || 0))).toFixed(3); if (d !== 7) fail('affix', id, 'delta', d); }
    }
    // ---------- 3. damage formula relations (deterministic RNG) ----------
    const RND = Math.random; Math.random = () => 0.5;
    const battle = (sp, lv) => new Battle({ sp, lv, kind: 'wild', bg: 'field' });
    const dmg = (b, u, t, id) => b.calcDamage(u, t, MOVES[id]).dmg;
    const cmp = (label, a, b2, ratio, tol = 0.12) => { const r = a / b2; if (Math.abs(r - ratio) > ratio * tol) fail(label, 'ratio', r.toFixed(2), 'want', ratio); else info(label, r.toFixed(2)); };
    { const st = fresh(20); const b = battle('bandit', 8); const F = b.F, base = dmg(b, b.H, F, 'flameSlash');
      const fx = (fam) => { F.fam = fam; return dmg(b, b.H, F, 'flameSlash'); };
      cmp('火打獸族(弱)', fx('beast'), fx('human'), 1.5); cmp('火打精靈(抗)', fx('spirit'), fx('human'), 0.6); cmp('火打水棲(抗)', fx('aquatic'), fx('human'), 0.6);
      F.fam = 'construct'; cmp('水打構造(弱)', dmg(b, b.H, F, 'aquaBlade'), (F.fam = 'human', dmg(b, b.H, F, 'aquaBlade')), 1.5);
      F.fam = 'construct'; cmp('揮砍打構造(一般無弱點)', dmg(b, b.H, F, 'slash'), (F.fam = 'human', dmg(b, b.H, F, 'slash')), 1.0); }
    { // vs-family affix and elem affix
      const st = fresh(30); const b0 = battle('skeleton', 8), d0 = dmg(b0, b0.H, b0.F, 'slash');
      st.gear.push({ u: 1, b: 'wolfNecklace', q: 1, r: 1, a: [['vs', 'undead', 20]] }); st.equip.acc1 = 1; const b1 = battle('skeleton', 8); b1.H.stats.crit = 0; const d1 = dmg(b1, b1.H, b1.F, 'slash');
      cmp('對不死+20%詞綴', d1, d0, 1.2, 0.1);
      const e0 = dmg(b0, b0.H, b0.F, 'thunder'); st.gear[0].a = [['elem', 20]]; const b2 = battle('skeleton', 8); const e1 = dmg(b2, b2.H, b2.F, 'thunder'); cmp('屬性傷害+20%詞綴', e1, e0, 1.2, 0.1); }
    { // monster → hero: resist affix, FOE_POWER, defend
      const st = fresh(20); const b = battle('emberSpirit', 20); const d0 = dmg(b, b.F, b.H, 'm_flare');
      st.gear.push({ u: 1, b: 'clothCap', q: 1, r: 1, a: [['resist', '火', 30]] }); st.equip.head = 1; const b2 = battle('emberSpirit', 20); const d1 = dmg(b2, b2.F, b2.H, 'm_flare');
      const defDiff = G.heroStats().spd; cmp('火抗30%（含帽子魔防）', d1, d0, 0.7 * 0.95, 0.12); info('monster flare dmg', d0, 'heroHP', G.heroStats().hp); }
    // weapon element conversion runs inside useMove → measure HP loss end-to-end
    const runMove = (b, u, t, id) => { const hp0 = t.hp; const gen = b.useMove(u, t, id); for (let i = 0; i < 3000; i++) { G.Input.set('a', i % 4 === 0); G.Input.frame(); if (gen.next().done) break; } G.Input.set('a', false); G.UI.clear(); return hp0 - t.hp; };
    { const st = fresh(20); st.gear.push({ u: 1, b: 'kingsBlade', q: 1, r: 1, a: [] }, { u: 2, b: 'knightSword', q: 1, r: 1, a: [] });
      const trial = (wu, fam) => { st.equip.weapon = wu; st.hp = G.heroStats().hp; const b = battle('bandit', 30); b.F.fam = fam; b.F.hp = b.F.maxhp = 9999; b.H.stats.crit = 0; return runMove(b, b.H, b.F, 'slash'); };
      const fb = trial(1, 'beast'), fh = trial(1, 'human'), ib = trial(2, 'beast');
      cmp('火屬性武器揮砍 打獸族/人類', fb, fh, 1.5); info('古王之劍 vs 騎士劍 對獸族', fb, ib);
      if (fb <= ib) fail('fire weapon not stronger vs beast', fb, ib); }
    { // immunity by family
      const st = fresh(20); const b = battle('skeleton', 20); b.F.status = null; const g0 = b.inflict(b.F, 'psn', true); while (!g0.next().done); if (b.F.status === 'psn') fail('undead should be poison-immune'); else info('不死免疫中毒 OK');
      const b2 = battle('emberSpirit', 20); const g2 = b2.inflict(b2.F, 'brn', true); while (!g2.next().done); if (b2.F.status === 'brn') fail('spirit should be burn-immune'); else info('精靈免疫灼傷 OK'); G.UI.clear(); }
    Math.random = RND;
    // ---------- 4. fuzz: random loadouts → finite stats & damage ----------
    const gearIds = Object.keys(GEAR), sp = Object.keys(SPECIES), heroMoves = ['slash', 'flameSlash', 'aquaBlade', 'thunder', 'leafBlade', 'blaze', 'powerSlash', 'manaBurst', 'meteor', 'riftBlade', 'iaiSlash'];
    const clsKeys = [null, ...Object.keys(CLASSES)]; let bad = 0, n = 0; const extremes = [];
    for (let it = 0; it < 400; it++) {
      const st = fresh(rnd(5, 30)); st.cls = pick(clsKeys); st.tal = {}; for (const T of TALENTS) st.tal[T.id] = rnd(0, T.max);
      for (const sl of Object.keys(st.equip)) { const pool = gearIds.filter(b => slotFor(b) === sl || (sl === 'acc2' && GEAR[b].slot === 'acc')); const b = pick(pool); const q = rnd(1, 4); const gg = { u: st.gear.length + 1, b, q, r: rnd(75, 100) / 100, e: rnd(0, 5), a: rollAffixes(AFFIX_COUNT[q], GEAR[b].slot, GEAR[b].t) }; st.gear.push(gg); st.equip[sl] = gg.u; }
      const s = G.heroStats(); for (const k of ['hp', 'atk', 'def', 'spa', 'spd', 'spe', 'crit', 'hit', 'eva', 'drain', 'elem']) if (!ok(s[k]) || s[k] < 0) { bad++; fail('stat not finite', k, s[k]); }
      st.hp = s.hp; const k = pick(sp), b = battle(k, st.lv);
      for (const m of heroMoves) { const d = b.calcDamage(b.H, b.F, MOVES[m]).dmg; n++; if (!ok(d) || d < 1) { bad++; fail('hero dmg', m, k, d); } }
      for (const mm of b.F.moves) { const mv = MOVES[mm.id]; if (!mv) { fail('foe move missing', k, mm.id); continue; } if (!mv.pow) continue; const d = b.calcDamage(b.F, b.H, mv).dmg; n++; if (!ok(d) || d < 1) { bad++; fail('foe dmg', mm.id, d); } }
    }
    info('fuzz calcs', n, 'bad', bad);
    // ---------- 5. balance scan: average-geared hero vs each monster at its home level ----------
    const home = {}; for (const id in MAPS) { for (const e of MAPS[id].encounters || []) for (const r of e.table) home[r[0]] = home[r[0]] || [r[1], r[2]]; if (MAPS[id].rare) home[MAPS[id].rare[0]] = [MAPS[id].rare[1], MAPS[id].rare[2]]; for (const e of MAPS[id].elites || []) home[e.sp] = [e.lv, e.lv]; if (MAPS[id].boss) home[MAPS[id].boss.sp] = [MAPS[id].boss.lv, MAPS[id].boss.lv]; }
    Object.assign(home, { wolf: [8, 8], flower: [11, 11], croc: [12, 12], mossGiant: [13, 13] });
    const kit = lv => lv < 9 ? ['ironSword', 'clothCap', 'leather', 'travelBoots'] : lv < 14 ? ['knightSword', 'guardHelm', 'hunterLeather', 'mistBoots'] : lv < 18 ? ['crystalBlade', 'knightHelm', 'chainMail', 'knightGreaves'] : ['kingsBlade', 'boneHelm', 'runeMantle', 'ancientGreaves'];
    Math.random = () => 0.5; const rows = [];
    for (const k of sp) { const h = home[k]; if (!h) { info('no home for', k); continue; } const lv = Math.round((h[0] + h[1]) / 2) + (SPECIES[k].boss ? 0 : 0); const st = fresh(Math.max(5, lv + (SPECIES[k].boss || SPECIES[k].elite ? 1 : 0))); kit(st.lv).forEach((b, i) => { st.gear.push({ u: i + 1, b, q: 2, r: 0.9, a: [] }); st.equip[slotFor(b)] = i + 1; }); st.hp = G.heroStats().hp;
      const kind = SPECIES[k].boss ? 'boss' : SPECIES[k].elite ? 'elite' : 'wild'; const b = new Battle({ sp: k, lv, kind, bg: 'field' });
      const best = Math.max(...['slash', 'flameSlash', 'aquaBlade', 'thunder', 'leafBlade'].filter(m => HERO_LEARN.some(([l, id]) => id === m && l <= st.lv) || m === 'slash').map(m => b.calcDamage(b.H, b.F, MOVES[m]).dmg));
      const foeMax = Math.max(0, ...b.F.moves.map(m => MOVES[m.id]).filter(m => m.pow).map(m => b.calcDamage(b.F, b.H, m).dmg));
      rows.push([k, kind, lv, st.lv, Math.ceil(b.F.maxhp / best), +(foeMax / b.H.maxhp * 100).toFixed(0)]); }
    Math.random = RND; G.UI.clear();
    R.rows = rows; return R;
  });
  g.log('FAIL', out.fail.length); for (const f of out.fail.slice(0, 60)) g.log(' x', f);
  for (const i of out.info) g.log(' -', i);
  g.log('species | kind | foeLv | heroLv | hitsToKill | foeMaxHit%ofHeroHP');
  for (const r of out.rows) g.log(r.join(' | '));
};
