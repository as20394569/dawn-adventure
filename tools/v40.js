module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.woke = 1; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(G.Events.elder(ow)); });
  for (let i = 0; i < 120; i++) { const u = await g.ui(); if (!u.includes('TextBox') && !u.includes('Menu') && u.length && i > 5) { g.log(i, u.slice(0, 80)); break; } await g.press('a', 8); }
  await g.step(20); await g.shot('open_cls1'); await g.press('right', 6); await g.step(6); await g.shot('open_cls2'); await g.press('right', 6); await g.press('right', 6); await g.step(6); await g.shot('open_cls4');
};
