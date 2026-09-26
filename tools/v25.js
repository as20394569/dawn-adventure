module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, q1: 1, q2: 1, q3: 1, caravanMet: 1 }); st.lv = 16; st.map = 'town'; st.x = 10; st.y = 8; Object.assign(st.bag, { potion: 3, antidote: 1, smoke: 1, powerFruit: 1, herb: 4, stinger: 2, rope: 1, elixir: 1 }); st.gear.push({ u: 50, b: 'stormStaff', q: 3, r: 0.9, a: [['elem', 6], ['hp', 5]] }); G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(4);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(__game.bagScreen('field')); }); await g.step(4); await g.shot('f_bag');
  await g.press('right', 4); await g.press('down', 4); await g.shot('f_bag_gear'); await g.press('b', 6);
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(__game.summaryScreen()); }); await g.press('right', 4); await g.press('right', 4); await g.shot('f_quest'); await g.press('b', 6);
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(__game.recordScreen()); }); await g.step(4); await g.shot('f_map'); await g.press('right', 4); await g.shot('f_ach');
};
