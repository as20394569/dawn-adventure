module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); G.Game.st.flags.license = 1; G.Game.st.map = 'town'; G.Game.st.x = 10; G.Game.st.y = 9; G.startOverworld(); G.Game.fade = 0; G.step(5); });
  await g.shot('bk');
  g.log(await g.ev(() => { const ow = __game.Game.scene; return JSON.stringify({ camX: ow.camX, camY: ow.camY, W, H, tiles: [15, 16, 17].map(x => ow.tileAt(x, 9)) }); }));
};
