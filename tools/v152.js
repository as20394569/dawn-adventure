// v10 early-game probe on 異界: starting gear, first orb socketed, vs route wild monsters at Lv1 / 3 / 5
module.exports = async (g) => {
  const rows = [];
  for (const [lv, sp, mlv] of [[1, 'mush', 2], [1, 'slime', 3], [2, 'pebble', 3], [3, 'bird', 3], [4, 'slime', 5], [5, 'fox', 7], [6, 'bee', 8], [8, 'frog', 9]]) {
    await g.ev(([lv, sp, mlv]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = lv; st.exp = expForLevel(lv); st.map = 'route'; st.x = 10; st.y = 38; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      attrAuto(st); let w = gearBy(st.equip.weapon); if (!w) { w = makeGear(Object.keys(GEAR).find(k => GEAR[k].slot === 'weapon' && GEAR[k].kind === '劍' && GEAR[k].t === 1), 1); st.equip.weapon = w.u; } w.o = [newOrb('galeCut').u]; st.hp = heroStats().hp; st.mp = heroStats().mp; st.bag = { potion: 2 };
      const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp, lv: mlv, kind: 'wild' })); }, [lv, sp, mlv]);
    const hp0 = await g.ev(() => heroStats().hp); await g.autoBattle('smart');
    rows.push('Lv' + lv + ' vs ' + sp + ' Lv' + mlv + ': ' + (await g.ev(() => Game.st.hp > 0 ? Math.round(Game.st.hp / heroStats().hp * 100) + '%' : 'LOSE')) + ' (hp ' + hp0 + ', weapon ' + (await g.ev(() => { const w = gearBy(Game.st.equip.weapon); return w ? GEAR[w.b].n : 'none'; })) + ')');
  }
  g.log(rows.join('\n'));
};
