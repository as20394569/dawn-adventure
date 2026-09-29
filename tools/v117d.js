// v8.1 chapter-1.5/2 boss probe at the recommended level (normal difficulty, talents spent, crafted tier gear 紫+2, 3 potions)
module.exports = async (g) => {
  const bosses = [['stagLord', 20, 'elite'], ['wraithGeneral', 23, 'elite']];
  const rows = [];
  for (let rep = 0; rep < 2; rep++) for (const [sp, blv, knd] of bosses) for (const cls of ['swordsman', 'mage', 'guardian', 'ranger']) {
    await g.ev(([cls, sp, blv, knd]) => { const W = { swordsman: ['ironSword', 'voltSword', 'knightSword', 'toadBlade', 'hornSpear', 'brassSword', 'duskSword'], guardian: ['hatchet', 'boarAxe', 'boarAxe', 'rockAxe', 'crescentAxe', 'glacierAxe', 'titanAxe'], mage: ['apprenticeStaff', 'oakStaff', 'magusStaff', 'masterStaff', 'windStaff', 'gearStaff', 'gearStaff'], ranger: ['huntKnife', 'mistDagger', 'stingerDagger', 'stingerDagger', 'wolfFang2', 'iceDagger', 'shadowDagger'] };
      const armorFor = (slot, t) => { let best = null, bs = -1; for (const k in GEAR) { const G = GEAR[k]; if (G.slot !== slot || !GEAR_RECIPE[k] || BP_RARE.has(k) || G.t > t) continue; const s = gearStats({ b: k, q: 2, r: 1, a: [], e: 0 }).st; const v = G.t * 100 + (s.def || 0) + (s.spd || 0) + (s.hp || 0) / 2; if (v > bs) { bs = v; best = k; } } return best; };
      const G = __game, lv = blv - 1; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: 1, golem: 1, ch2: 5 }); st.lv = lv; st.exp = expForLevel(lv); st.map = 'capital'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass(cls); st.flags.deep = 1;
      attrAuto(st); for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1;
      const t = clamp(smithRank({ lv }), 1, 7), wg = makeGear(W[cls][t - 1], 2); wg.e = 2; st.equip.weapon = wg.u; for (const [slot, sl] of [['head', 'head'], ['body', 'body'], ['feet', 'feet'], ['acc', 'acc1']]) { const k = armorFor(slot, t); if (k) { const g2 = makeGear(k, 2); g2.e = 2; st.equip[sl] = g2.u; } }
      st.hp = heroStats().hp; st.mp = heroStats().mp; st.bag = { megaPotion: 3, hiEther: 2 };
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: blv, kind: knd || 'boss', id: sp })); }, [cls, sp, blv]);
    const hp0 = await g.ev(() => __game.Game.st.hp); await g.autoBattle('smart');
    rows.push(await g.ev(([c, sp, blv, hp0]) => [sp + ' Lv' + blv + ' / ' + c, Math.round(__game.Game.st.hp / hp0 * 100)], [cls, sp, blv, hp0]));
  }
  const R = {}; for (const [k, v] of rows) (R[k] = R[k] || []).push(v); g.log(Object.entries(R).map(([k, L]) => k + ': win ' + L.filter(v => v > 0).length + '/' + L.length + ' hp% ' + L.join(',')).join('\n'));
};
