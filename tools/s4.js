module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); G.Game.st.flags.license = 1; G.Game.st.map = 'route'; G.Game.st.x = 5; G.Game.st.y = 37; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10);
  // force a battle
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'mush', lv: 4, kind: 'wild' })); });
  await g.step(20); await g.shot('b_trans');
  await g.step(40); await g.shot('b_intro');
  await g.step(80); await g.shot('b_cmd');
  await g.press('a', 10); await g.shot('b_fight');
  await g.press('right', 4); await g.press('left', 4);
  // use slash
  await g.press('a', 30); await g.shot('b_anim1');
  await g.step(40); await g.shot('b_anim2');
  for (let i = 0; i < 40; i++) { const s = await g.ev(() => { const b = __game.Game.scene; return b.constructor.name + ':' + (b.F ? b.F.hp : '') + ':' + __game.UI.stack.length; }); if (s.startsWith('Overworld')) break; await g.press('a', 30); }
  g.log(JSON.stringify(await g.state()));
};
