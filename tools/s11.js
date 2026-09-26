module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.hp = 1; st.money = 800; st.map = 'route'; st.x = 5; st.y = 37; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'fox', lv: 9, kind: 'wild' })); });
  await g.autoBattle(1, async u => { if (u.includes('倒下了')) { await g.step(20); await g.shot('w_faint'); } });
  for (let i = 0; i < 12; i++) { const u = await g.ui(); if (u.includes('漆黑')) { await g.step(40); await g.shot('w_black'); } if (u.includes('醒啦')) { await g.step(40); await g.shot('w_home'); } await g.press('a', 30); }
  g.log(JSON.stringify((await g.state()).st));
  // save then reload page flow: title continue
  await g.ev(() => { __game.Game.st.map = 'town'; __game.Game.st.x = 10; __game.Game.st.y = 9; localStorage.setItem('dawnlight_save_v1', JSON.stringify(__game.Game.st)); location.reload(); });
  await new Promise(r => setTimeout(r, 800));
  await g.ev(() => { __game.Game.paused = true; });
  await g.press('a', 30); await g.shot('w_title'); await g.press('a', 60); await g.step(40); await g.shot('w_cont');
  g.log(JSON.stringify((await g.state()).st));
};
