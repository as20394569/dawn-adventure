module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); G.Game.st.flags.license = 1; G.Game.st.map = 'route'; G.Game.st.x = 5; G.Game.st.y = 37; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'mush', lv: 4, kind: 'wild' })); });
  await g.step(140);
  const dbg = () => g.ev(() => { const U = __game.UI.stack; return U.map(w => w.constructor.name + (w.items ? '[' + w.items.map(i => i.t).join('/') + ']i' + w.i : '') + (w.lines ? '"' + w.lines.join('|') + '"' + w.state : '')).join(' ; '); });
  g.log('A', await dbg());
  await g.press('a', 10); g.log('B', await dbg());
  await g.press('a', 10); g.log('C', await dbg());
  for (let i = 0; i < 8; i++) { await g.step(10); g.log('D' + i, await dbg()); }
};
module.exports.more = true;
