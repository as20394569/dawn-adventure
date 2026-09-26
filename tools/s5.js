module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.lv = 7; st.exp = Math.floor(0.8 * 8 * 8 * 8) - 5; st.moves.push({ id: 'focus', pp: 20 }); st.hp = G.heroStats().hp; st.map = 'route'; st.x = 5; st.y = 37; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'bird', lv: 3, kind: 'wild' })); });
  let n = 0;
  await g.autoBattle(0, async u => {
    if (u.includes('升到了') && n === 0) { n++; await g.step(40); await g.shot('l_lv'); await g.press('a', 10); await g.shot('l_stats'); await g.press('a', 10); await g.shot('l_stats2'); await g.press('a', 10); return 'handled'; }
    if (u.includes('要忘記') && n === 1) { n++; await g.step(40); await g.shot('l_ask'); await g.press('a', 20); await g.shot('l_pick'); await g.press('down', 4); await g.shot('l_pick2'); await g.press('a', 20); return 'handled'; }
  });
  await g.step(30); await g.shot('l_after');
  g.log(JSON.stringify(await g.state()));
};
