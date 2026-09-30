// encounter card layout (player screenshot: drop lines ran past the card)
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 9; applyStartClass('swordsman'); st.map = 'route'; st.x = 5; st.y = 10; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(10);
  for (const [sp, lv, key, kind, nm] of [['wolf', 9, 'wolf', 'elite', 'wolf'], ['shadowGeneral', 40, 'shadowGeneral', 'boss', 'boss'], ['crystalCroc', 30, 'crystalCroc', 'elite', 'roam']]) {
    await g.ev(([sp, lv, key, kind]) => { UI.clear(); const ow = Game.scene; ow.script = null; ow.run((function* () { yield* askFight(sp, lv, key, kind, ''); })()); }, [sp, lv, key, kind]); await g.step(12); await g.shot('v163_' + nm);
    await g.ev(() => { UI.clear(); Game.scene.script = null; }); await g.step(2); }
};
