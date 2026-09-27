module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 20; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman');
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.autoPlay = null; ow.run(ow.battleScript({ sp: 'wolf', lv: 18, kind: 'wild' })); });
  for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle')) break; await g.step(5); }
  await g.step(80);
  await g.ev(() => { const b = __game.Game.scene, H = b.H, F = b.F; __game.Game.st.status = 'psn'; H.stages.atk = 2; H.stages.def = -1; H.stages.spe = 1; H.rageT = 2; H.critT = 2; H.clones = 1; H.enchT = 2; H.critNext = true; H.shield = 2;
    F.stages.def = -2; F.stages.atk = 1; F.markT = 2; F.frozenT = 1; F.status = 'brn'; F.wet = 2; __game.UI.clear(); b.script = (function* () { while (true) yield; })(); });
  await g.step(10); await g.shot('icons_battle');
};
