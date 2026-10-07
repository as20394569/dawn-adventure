module.exports = async (g) => {
  const errs = []; await g.ev(() => { window.__errs = []; window.addEventListener('error', e => window.__errs.push(e.message)); });
  await g.ev(() => { const G = __game; G.Game.st = newGameState('測試'); startOverworld(); G.Game.fade = 0; });
  for (let i = 0; i < 400; i++) { await g.ev(() => { __game.press('a', 2, 2); __game.step(2); }); }
  g.log(JSON.stringify(await g.ev(() => { const st = __game.Game.st; return { map: st.map, money: st.money, deck: KD.deck(st).length, bag: st.bag, k14: Object.keys(st.k14), errs: window.__errs, ui: __game.UI.stack.length, script: !!__game.Game.scene.script }; })));
};
