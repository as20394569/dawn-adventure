module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 7; st.exp = Math.floor(0.8 * 512) - 3; st.equip.weapon = 'ironSword'; st.bag.ironSword = 1; st.boost = { str: 2 }; st.moves.push({ id: 'focus', pp: 20 }); st.hp = G.heroStats().hp; st.map = 'route'; st.x = 5; st.y = 37; G.startOverworld(); G.Game.fade = 0; });
  await g.step(5); await g.press('start', 10); await g.press('a', 10); await g.shot('s_status'); await g.press('right', 6); await g.shot('s_moves'); await g.press('b', 10); await g.press('down', 4); await g.press('down', 4); await g.press('a', 10); await g.shot('s_equip'); await g.press('b', 10); await g.press('b', 10); await g.settle();
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'bird', lv: 3, kind: 'wild' })); });
  let n = 0;
  await g.autoBattle(0, async u => { if (u.includes('升到了') && n === 0) { n++; await g.step(40); await g.press('a', 10); await g.shot('s_lv1'); await g.press('a', 10); await g.shot('s_lv2'); await g.press('a', 10); return 'handled'; } });
};
