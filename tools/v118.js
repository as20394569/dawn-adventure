// diagnose: turns to kill / turns to die for ch1 & ch2 bosses at recommended level
module.exports = async (g) => {
  const W = { swordsman: ['ironSword', 'knightSword', 'hornSpear', 'brassSword', 'duskSword'], guardian: ['hatchet', 'rockAxe', 'crescentAxe', 'glacierAxe', 'titanAxe'], mage: ['oakStaff', 'masterStaff', 'windStaff', 'gearStaff', 'gearStaff'] };
  const A = [[], [], ['wolfHood', 'rustMail', null, 'honeyCharm'], ['wolfHood', 'yetiFur', 'springBoots', 'iceCharm'], ['starCrown', 'shadowRobe', 'starBoots', 'voidRing']];
  const bosses = [['millGolem', 8, 'elite', 0], ['blackCatfish', 11, 'elite', 0], ['golem', 17, 'boss', 1], ['hydra', 23, 'boss', 1], ['ratKing', 27, 'boss', 2], ['clockColossus', 31, 'boss', 3], ['frostQueen', 34, 'boss', 3], ['lavaGiant', 37, 'boss', 4], ['shadowGeneral', 40, 'boss', 4]];
  for (const cls of ['swordsman', 'guardian', 'mage']) for (const [sp, blv, kind, ti] of bosses) {
    const r = await g.ev(([cls, sp, blv, kind, w, a]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; const lv = blv - 1; Object.assign(st.flags, { license: 1, woke: 1, deep: 1 }); st.lv = lv; st.exp = expForLevel(lv); st.map = 'town'; st.x = 10; st.y = 12; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass(cls); st.flags.deep = lv >= 14 ? 1 : 0;
      attrAuto(st); for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1;
      const wg = makeGear(w, 2); wg.e = lv >= 20 ? 3 : 1; st.equip.weapon = wg.u; const slots = ['head', 'body', 'feet', 'acc1']; a.forEach((k, i) => { if (k && GEAR[k]) { const g2 = makeGear(k, 2); g2.e = 3; st.equip[slots[i]] = g2.u; } });
      const s = heroStats(); st.hp = s.hp; st.mp = s.mp; const ow = G.Game.scene; ow.script = null; G.UI.clear();
      const b = new Battle({ sp, lv: blv, kind, id: sp }); const H = b.H, F = b.F; let best = b.calcDamage(H, F, MOVES.attack).dmg, bid = 'attack';
      for (const id of usableSkills(st)) { const m = skillMove(id); if (!m.pow) continue; const d = b.calcDamage(H, F, m).dmg; if (d > best) { best = d; bid = id; } }
      const fm = (F.moves || []).map(q => q.id || q).filter(id => MOVES[id] && MOVES[id].pow); const fd = fm.map(id => b.calcDamage(F, H, MOVES[id]).dmg); const avg = fd.length ? fd.reduce((x, y) => x + y, 0) / fd.length : 0;
      return cls + ' Lv' + lv + ' vs ' + sp + ' Lv' + blv + ': heroHP ' + H.maxhp + ' atk/def ' + H.stats.atk + '/' + H.stats.def + ' spa ' + H.stats.spa + ' | best ' + bid + ' ' + best + ' vs bossHP ' + F.maxhp + ' → ' + (F.maxhp / Math.max(1, best)).toFixed(1) + ' turns | boss avg ' + Math.round(avg) + ' max ' + Math.max(0, ...fd) + ' → ' + (H.maxhp / Math.max(1, avg)).toFixed(1) + ' hits';
    }, [cls, sp, blv, kind, W[cls][ti], A[ti]]);
    g.log(r);
  }
};
