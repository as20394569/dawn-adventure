// v8.1 measurement: turns-to-kill / hits-to-die for every monster at its level vs a tier-geared hero (4 classes)
module.exports = async (g) => {
  const res = await g.ev(() => {
    const W = { swordsman: ['ironSword', 'voltSword', 'knightSword', 'toadBlade', 'hornSpear', 'brassSword', 'duskSword'], guardian: ['hatchet', 'boarAxe', 'boarAxe', 'rockAxe', 'crescentAxe', 'glacierAxe', 'titanAxe'], mage: ['apprenticeStaff', 'oakStaff', 'magusStaff', 'masterStaff', 'windStaff', 'gearStaff', 'gearStaff'], ranger: ['huntKnife', 'mistDagger', 'stingerDagger', 'stingerDagger', 'wolfFang2', 'iceDagger', 'shadowDagger'] };
    const armorFor = (slot, t) => { let best = null, bs = -1; for (const k in GEAR) { const G = GEAR[k]; if (G.slot !== slot || !GEAR_RECIPE[k] || BP_RARE.has(k) || G.t > t) continue; const s = gearStats({ b: k, q: 2, r: 1, a: [], e: 0 }).st; const v = G.t * 100 + (s.def || 0) + (s.spd || 0) + (s.hp || 0) / 2; if (v > bs) { bs = v; best = k; } } return best; };
    const G = __game, samples = 16, out = {};
    const hero = (cls, lv) => { G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: lv >= 14 ? 1 : 0 }); st.lv = lv; st.exp = expForLevel(lv); applyStartClass(cls); st.flags.deep = lv >= 14 ? 1 : 0; attrAuto(st); for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1;
      const t = clamp(smithRank({ lv }), 1, 7), wg = makeGear(W[cls][t - 1], 2); wg.e = 2; st.equip.weapon = wg.u; for (const [slot, sl] of [['head', 'head'], ['body', 'body'], ['feet', 'feet'], ['acc', 'acc1']]) { const k = armorFor(slot, t); if (k) { const g2 = makeGear(k, 2); g2.e = 2; st.equip[sl] = g2.u; } } const s = heroStats(); st.hp = s.hp; st.mp = s.mp; };
    const measure = (sp, flv, hlv, kind) => { let tt = 0, hh = 0, n = 0;
      for (const cls of ['swordsman', 'guardian', 'mage', 'ranger']) { hero(cls, hlv); const b = new Battle({ sp, lv: flv, kind, id: sp }); const H = b.H, F = b.F;
        const avgD = (u, t, mv) => { let s = 0; for (let i = 0; i < samples; i++) s += b.calcDamage(u, t, mv).dmg; return s / samples; };
        let best = avgD(H, F, MOVES.attack); for (const id of usableSkills(G.Game.st)) { const m = skillMove(id); if (!m.pow) continue; best = Math.max(best, avgD(H, F, m) * (skillMP(id) > 0 ? 0.92 : 1)); }
        const fm = (F.moves || []).map(q => q.id || q).filter(id => MOVES[id] && MOVES[id].pow && !MOVES[id].charge); const fd = fm.map(id => avgD(F, H, MOVES[id])); const avg = fd.length ? fd.reduce((x, y) => x + y, 0) / fd.length : 1;
        tt += F.maxhp / Math.max(1, best); hh += H.maxhp / Math.max(1, avg); n++; }
      return [tt / n, hh / n]; };
    const path = ['route', 'windHills', 'jadeCreek', 'forest', 'canyon', 'mine', 'ruins', 'lake', 'sewer', 'swamp', 'catacomb', 'rift', 'northRoad', 'capSewer', 'goldPlains', 'clockTower1', 'clockTower2', 'frostField', 'iceCave', 'emberPass', 'lavaTunnel', 'duskFort1', 'duskFort2', 'starShrine'];
    for (const m of path) { const M = MAPS[m]; if (!M) continue;
      for (const z of M.encounters || []) for (const [sp, a, b2] of z.table) { const lv = Math.round((a + b2) / 2); if (lv < 11) continue; const key = 'W ' + sp; if (out[key] && out[key].some(x => x[0] === m)) continue; const [t, h] = measure(sp, lv, lv, 'wild'); (out[key] = out[key] || []).push([m, lv, +t.toFixed(1), +h.toFixed(1)]); }
      for (const e of M.elites || []) { if (e.lv < 11) continue; const [t, h] = measure(e.sp, e.lv, e.lv - 1, 'elite'); (out['E ' + e.sp] = out['E ' + e.sp] || []).push([m, e.lv, +t.toFixed(1), +h.toFixed(1)]); }
      if (M.boss && M.boss.lv >= 11) { const sp = M.boss.sp; const [t, h] = measure(sp, M.boss.lv, M.boss.lv - 1, 'boss'); (out['B ' + sp] = out['B ' + sp] || []).push([m, M.boss.lv, +t.toFixed(1), +h.toFixed(1)]); }
    }
    return out; });
  require('fs').writeFileSync('build/v120.json', JSON.stringify(res));
  for (const k in res) g.log(k.padEnd(20) + res[k].map(r => r.join(' ')).join(' | '));
};
