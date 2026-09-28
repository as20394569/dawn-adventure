// mobile: battle skill menu needs two taps (1st shows details, 2nd uses)
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 20; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp; st.mp = heroStats().mp; const ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.autoPlay = null; ow.run(ow.battleScript({ sp: 'slime', lv: 3, kind: 'wild' })); });
  for (let i = 0; i < 60; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(6); }); }
  const state = () => g.ev(() => { const G = __game, top = G.UI.stack[G.UI.stack.length - 1]; return (top && top.title ? top.title : top ? top.constructor.name : '-') + ' i=' + (top && top.i) + ' sel=' + (top && top.tapSel) + ' mp=' + G.Game.scene.H.mp; });
  // open 技能 with a tap on its command button
  await g.ev(() => { const G = __game, m = G.UI.stack.find(w => w.items && w.items.length === 5); m.i = 1; G.press('a', 2, 6); });
  await g.ev(() => __game.step(4)); g.log('menu', await state());
  const tap = (x, y) => g.ev(([x, y]) => { __game.step(1); touchTap(x, y); __game.step(3); }, [x, y]);
  await tap(40, 58 + 17 + 14 + 4); g.log('tap1 row1', await state()); await g.shot('tap1');
  await tap(40, 58 + 17 + 14 + 4); g.log('tap2 row1', await state());
};
