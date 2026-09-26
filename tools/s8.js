module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.lv = 9; st.exp = Math.floor(0.8 * 729); st.moves = [{ id: 'slash', pp: 35 }, { id: 'aquaBlade', pp: 25 }, { id: 'flameSlash', pp: 25 }, { id: 'focus', pp: 20 }]; st.hp = G.heroStats().hp; st.bag.potion = 3; st.map = 'route'; st.x = 11; st.y = 33; st.dir = 'up'; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10);
  // walk up path x=11 until spotted by wolf at (16,29) facing left sight 5
  for (let i = 0; i < 6; i++) { await g.hold('up', 17); const s = await g.ev(() => !!__game.Game.scene.script); if (s) break; }
  await g.step(20); await g.shot('e_spot');
  await g.step(60); await g.shot('e_walk');
  await g.mash('a', 2, 30); await g.step(30); await g.shot('e_trans');
  await g.autoBattle(1, async u => { if (u.includes('狂牙狼發動') ) { await g.shot('e_intro'); } });
  await g.step(40); await g.shot('e_after');
  g.log(JSON.stringify((await g.state()).st));
};
