module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman');
    G.Game.autoPlay = b => { b.F.hp = 1; return { type: 'move', id: 'attack' }; }; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp: 'rogueBlade', lv: 20, kind: 'elite', id: 'rogueBlade' })); });
  for (let i = 0; i < 3000; i++) { const card = await g.ev(() => __game.UI.stack.some(w => w.out !== undefined && w.t > 30)); if (card) { await g.shot('v99_loot'); break; } await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(3); }); }
};
