// Progression & difficulty simulator. node tools/play.js tools/balance.js
// Plays a "normal" and a "thorough" player through chapter 1, levelling from real exp, then measures fights at each stage.
module.exports = async (g) => {
  const CLS = process.env.CLS || 'swordsman';
  const out = await g.ev((CLS) => {
    const G = __game, RND = Math.random;
    const AREAS = [ // [label, map, encounter band index or null, normal fights, thorough fights, extra fixed fights, gear kit, enhance]
      ['道路南段', 'route', 0, 8, 14, [], 0, 0],
      ['道路中段', 'route', 1, 8, 14, [['wolf', ELITE_LV.wolf, 'elite']], 1, 0],
      ['道路北段', 'route', 2, 6, 12, [['flower', ELITE_LV.flower, 'elite'], ['croc', ELITE_LV.croc, 'elite'], ...CARAVAN_FIGHTS.map(([a, b2]) => [a, b2, 'wild'])], 1, 1],
      ['迷霧森林', 'forest', 0, 12, 22, [['mossGiant', ELITE_LV.mossGiant, 'elite']], 2, 1],
      ['廢棄礦坑', 'mine', 0, 10, 18, [['bandit', ELITE_LV.thug1, 'elite'], ['bandit', ELITE_LV.thug2, 'elite'], ['banditBoss', MAPS.mine.boss.lv, 'boss']], 2, 2],
      ['古岩遺跡', 'ruins', 0, 5, 10, [['golem', MAPS.ruins.boss.lv, 'boss']], 2, 2],
      ['地下水道', 'sewer', 0, 12, 22, [['crystalGolem', MAPS.sewer.boss.lv, 'boss']], 3, 3],
      ['地下墓穴', 'catacomb', 0, 12, 22, [['boneKnight', ELITE_LV.boneKnight, 'elite']], 4, 3],
    ];
    const KITS = [
      ['woodSword', 'uniform', 'schoolShoes', 'guardBadge'],
      ['ironSword', 'clothCap', 'leather', 'travelBoots', 'guardBadge'],
      ['knightSword', 'guardHelm', 'chainMail', 'mistBoots', 'wolfNecklace'],
      ['crystalBlade', 'knightHelm', 'chainMail', 'knightGreaves', 'wolfNecklace', 'mossBracer'],
      ['crystalBlade', 'knightHelm', 'ruinMail', 'knightGreaves', 'wolfNecklace', 'mossBracer'],
    ];
    const slotFor = b => GEAR[b].slot === 'acc' ? null : GEAR[b].slot;
    const STAFF = ['practiceWand', 'apprenticeStaff', 'oakStaff', 'tideStaff', 'tideStaff']; const equipKit = (st, i, enh) => { st.gear = []; const kitL = KITS[i].map(b => CLS === 'mage' && GEAR[b].slot === 'weapon' ? STAFF[i] : b); for (const k in st.equip) st.equip[k] = null; let acc = 0; kitL.forEach((b, j) => { st.gear.push({ u: j + 1, b, q: 2, r: 0.88, e: enh, a: [] }); const sl = slotFor(b) || (acc++ ? 'acc2' : 'acc1'); st.equip[sl] = j + 1; }); };
    const setup = (lv, kit, enh) => { G.newGameState('測'); const st = G.Game.st; st.lv = lv; st.cls = lv >= 14 ? { swordsman: 'swordmaster', mage: 'stormcaller', guardian: 'paladin' }[CLS] : CLS; if (CLS === 'guardian') { st.tal = { body: Math.min(3, Math.max(0, lv - 5)), blade: Math.min(3, Math.max(0, lv - 8)) }; } if (CLS === 'mage') { st.tal = { mana: Math.min(3, Math.max(0, lv - 5)), elem: Math.min(3, Math.max(0, lv - 8)) }; } const tp = Math.max(0, lv - 5); st.tal = { blade: Math.min(3, tp), vital: Math.min(3, Math.max(0, tp - 3)) }; equipKit(st, kit, enh); st.hp = G.heroStats().hp; return st; };
    const expFor = (sp, lv, kind, heroLv) => { const s = SPECIES[sp]; let e = Math.floor(s.exp * lv / 5 * (kind !== 'wild' ? 1.5 : 1)); if (typeof expScale === 'function') e = Math.floor(e * expScale(heroLv, lv)); return e; };
    const bandOf = (map, i) => { const d = MAPS[map]; return (d.encounters || [])[i]; };
    const measure = (sp, lv, kind, heroLv, kit, enh) => {
      const st = setup(heroLv, kit, enh); Math.random = () => 0.5; const b = new Battle({ sp, lv, kind, bg: 'field' }); Math.random = RND;
      const ADV = { swordsman: 'swordmaster', mage: 'stormcaller', guardian: 'paladin' }[CLS]; const LINE = [...CLASS_START[CLS].moves.map(m => [1, m]), ...CLASS_LINE[CLS], [12, CLASSES[CLS].move2], [14, CLASSES[ADV].move], [CLASSES[ADV].lv2, CLASSES[ADV].move2]]; const has = m => LINE.some(([l, id]) => id === m && l <= heroLv); const avail = ['slash', 'powerSlash', 'crossSlash', 'magicBolt', 'manaBurst', 'guardStrike', 'shieldBash', 'bladeStorm', 'iaiSlash'].filter(has);
      const elem = ['flameSlash', 'voltSlash', 'leafBlade', 'tideSlash', 'blaze', 'fireBolt', 'aquaBlade', 'thunder', 'leafStorm', 'chainBolt', 'flameWave', 'aquaBurst', 'thunderstorm', 'skyJudge'].filter(has);
      Math.random = () => 0.5;
      const neu = Math.max(...avail.map(m => b.calcDamage(b.H, b.F, MOVES[m]).dmg)), best = Math.max(neu, ...elem.map(m => b.calcDamage(b.H, b.F, MOVES[m]).dmg));
      const dm = b.F.moves.map(m => MOVES[m.id]).filter(m => m.pow && !m.charge).map(m => b.calcDamage(b.F, b.H, m).dmg); Math.random = RND;
      const avg = dm.length ? dm.reduce((a, c) => a + c, 0) / dm.length : 0, mx = dm.length ? Math.max(...dm) : 0;
      return { hitsN: Math.ceil(b.F.maxhp / neu), hitsB: Math.ceil(b.F.maxhp / best), avgPct: Math.round(avg / b.H.maxhp * 100), maxPct: Math.round(mx / b.H.maxhp * 100), turnsToDie: avg ? Math.ceil(b.H.maxhp / avg) : 99, heroHP: b.H.maxhp, foeHP: b.F.maxhp };
    };
    const res = {};
    for (const mode of ['normal', 'thorough']) {
      let lv = 5, exp = expForLevel(5); const rows = [];
      const gain = e => { exp += e; while (exp >= expForLevel(lv + 1)) lv++; };
      for (const [label, map, bi, nN, nT, extra, kit, enh] of AREAS) {
        const band = bandOf(map, bi), arrive = lv, fights = mode === 'normal' ? nN : nT;
        const tbl = band.table, tot = tbl.reduce((a, r) => a + r[3], 0);
        // representative wild = the heaviest-weighted row at mid level
        const wild = tbl.slice().sort((a, b2) => b2[3] - a[3])[0], wl = Math.round((wild[1] + wild[2]) / 2);
        const mW = measure(wild[0], wl, 'wild', arrive, kit, enh);
        const bossRows = extra.filter(e => e[2] !== 'wild').map(([sp, l, kind]) => { const m = measure(sp, l, kind, lv, kit, enh); return { sp, l, kind, ...m }; });
        for (let i = 0; i < fights; i++) { const r = tbl[i % tbl.length]; gain(expFor(r[0], Math.round((r[1] + r[2]) / 2), 'wild', lv) * (i % 8 === 7 ? 1.25 : 1)); }
        const preBossLv = lv; const bossM = extra.filter(e => e[2] !== 'wild').map(([sp, l, kind]) => ({ sp, l, kind, ...measure(sp, l, kind, preBossLv, kit, enh) }));
        for (const [sp, l, kind] of extra) gain(expFor(sp, l, kind, lv));
        rows.push({ label, arrive, leave: lv, wild: wild[0] + ' Lv' + wl, mW, bosses: bossM });
      }
      res[mode] = rows;
    }
    return res;
  }, CLS);
  for (const mode in out) {
    g.log('==== ' + mode + ' player ====');
    g.log('area | arriveLv→leaveLv | wild(foe) | hitsNeutral/hitsBest | foeAvg%HP (max%) | turnsToDie');
    for (const r of out[mode]) {
      g.log([r.label, r.arrive + '→' + r.leave, r.wild, r.mW.hitsN + '/' + r.mW.hitsB, r.mW.avgPct + '% (' + r.mW.maxPct + '%)', r.mW.turnsToDie].join(' | '));
      for (const b of r.bosses) g.log('   ' + [b.kind + ' ' + b.sp + ' Lv' + b.l, 'hero Lv' + '(pre)', b.hitsN + '/' + b.hitsB, b.avgPct + '% (' + b.maxPct + '%)', b.turnsToDie, 'foeHP ' + b.foeHP + ' heroHP ' + b.heroHP].join(' | '));
    }
  }
};
