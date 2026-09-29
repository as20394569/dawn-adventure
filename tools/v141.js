// class balance probe: all 10 classes, their first weapon kind at tier, vs 3 bosses (measurement, like v120)
module.exports = async (g) => {
  const res = await g.ev(() => {
    const KW = { '劍': ['ironSword', 'voltSword', 'knightSword', 'toadBlade', 'hornSpear', 'brassSword', 'duskSword'], '法杖': ['apprenticeStaff', 'oakStaff', 'magusStaff', 'masterStaff', 'windStaff', 'gearStaff', 'gearStaff'], '斧': ['hatchet', 'boarAxe', 'boarAxe', 'rockAxe', 'crescentAxe', 'glacierAxe', 'titanAxe'], '短刀': ['huntKnife', 'mistDagger', 'stingerDagger', 'stingerDagger', 'wolfFang2', 'iceDagger', 'shadowDagger'],
      '樂器': ['woodFlute', 'travelLute', 'forestHarp', 'moonLyre', 'windHorn', 'iceHarp', 'starLyre'], '火槍': ['corkGun', 'brassPistol', 'steamRifle', 'gearRepeater', 'boltCannon', 'frostMusket', 'starBlaster'], '拳套': ['wrapFist', 'ironKnuckle', 'rockFist', 'chiFist', 'tigerClaw', 'magmaFist', 'starFist'], '長槍': ['trainSpear', 'ironSpear', 'galeLance', 'scaleSpear', 'azureSpear', 'frostSpear', 'skySpear'] };
    const armorFor = (slot, t) => { let best = null, bs = -1; for (const k in GEAR) { const G = GEAR[k]; if (G.slot !== slot || !GEAR_RECIPE[k] || BP_RARE.has(k) || G.t > t) continue; const s = gearStats({ b: k, q: 2, r: 1, a: [], e: 0 }).st; const v = G.t * 100 + (s.def || 0) + (s.spd || 0) + (s.hp || 0) / 2; if (v > bs) { bs = v; best = k; } } return best; };
    const G = __game, out = [];
    for (const cls of V7_CLASSES) { const row = [cls];
      for (const [sp, blv] of [['blackCatfish', 11], ['ratKing', 27], ['shadowGeneral', 40]]) { const lv = blv - 1; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: lv >= 14 ? 1 : 0 }); st.lv = lv; if (CLASS_FREE[cls]) applyStartClass(cls); else { applyStartClass("swordsman"); st.cls = cls; } st.flags.deep = lv >= 14 ? 1 : 0; attrAuto(st);
        for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1;
        const t = clamp(smithRank({ lv }), 1, 7), wk = KW[CLASS_V7[cls].w[0]][t - 1]; const wg = makeGear(wk, 2); wg.e = 2; st.equip.weapon = wg.u; for (const [slot, sl] of [['head', 'head'], ['body', 'body'], ['feet', 'feet'], ['acc', 'acc1']]) { const k = armorFor(slot, t); if (k) { const g2 = makeGear(k, 2); g2.e = 2; st.equip[sl] = g2.u; } }
        const s = heroStats(); st.hp = s.hp; st.mp = s.mp; const b = new Battle({ sp, lv: blv, kind: sp === 'blackCatfish' ? 'elite' : 'boss', id: sp }); const H = b.H, F = b.F;
        const avg = (u, t2, mv) => { let x = 0; for (let i = 0; i < 12; i++) x += b.calcDamage(u, t2, mv).dmg; return x / 12; };
        let best = avg(H, F, MOVES.attack); for (const id of usableSkills(st)) { const m = skillMove(id); if (!m.pow) continue; best = Math.max(best, avg(H, F, m) * (skillMP(id) > 0 ? 0.92 : 1)); }
        const fm = (F.moves || []).map(q => q.id || q).filter(id => MOVES[id] && MOVES[id].pow && !MOVES[id].charge); const fd = fm.map(id => avg(F, H, MOVES[id])); const fa = fd.length ? fd.reduce((x, y) => x + y, 0) / fd.length : 1;
        row.push(sp + ' ' + (F.maxhp / Math.max(1, best)).toFixed(1) + 't/' + (H.maxhp / Math.max(1, fa)).toFixed(1) + 'h'); }
      out.push(row.join('  ')); }
    return out.join('\n'); });
  g.log(res);
};
