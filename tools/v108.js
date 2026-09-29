// v8 region bosses at the recommended level (normal difficulty, talents spent, crafted t1–t2 weapon)
module.exports = async (g) => {
  const rows = [];
  for (let rep = 0; rep < 4; rep++) for (const [cls, lv, wpn, sp, flv] of [['swordsman', 7, 'ironSword', 'millGolem', 8], ['mage', 7, 'apprenticeStaff', 'millGolem', 8], ['ranger', 10, 'mistDagger', 'blackCatfish', 11], ['guardian', 10, 'hatchet', 'blackCatfish', 11], ['swordsman', 5, 'ironSword', 'hornHare', 6], ['mage', 9, 'oakStaff', 'streamSnake', 10]]) {
    await g.ev(([cls, lv, wpn, sp, flv]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = lv; st.map = 'route'; st.x = 10; st.y = 30; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass(cls);
      attrAuto(st); for (const B of CT[cls]) for (const n of B) while (!nodeBlock(n, st)) st.ct[n.id] = (st.ct[n.id] || 0) + 1; const w = makeGear(wpn, 2); st.equip.weapon = w.u; st.hp = heroStats().hp; st.mp = heroStats().mp; st.bag.potion = 3;
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: flv, kind: SPECIES[sp].elite ? 'elite' : 'wild', id: sp })); }, [cls, lv, wpn, sp, flv]);
    const hp0 = await g.ev(() => __game.Game.st.hp); await g.autoBattle('smart');
    rows.push(await g.ev(([c, l, sp, hp0]) => [c + ' Lv' + l + ' vs ' + sp, Math.round(__game.Game.st.hp / hp0 * 100)], [cls, lv, sp, hp0]));
  }
  const A = {}; for (const [k, v] of rows) (A[k] = A[k] || []).push(v); g.log(Object.entries(A).map(([k, L]) => k + ': win ' + L.filter(v => v > 0).length + '/' + L.length + ' hp% ' + L.join(',')).join('\n'));
};
