module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp; });
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.autoPlay = null;
    const _fc = Battle.prototype.foeChoose; Battle.prototype.foeChoose = function () { return { type: 'move', id: 'm_gateJudgment' }; };
    ow.run(ow.battleScript({ sp: 'gatekeeper', lv: 30, kind: 'boss', id: 'gatekeeper' })); });
  for (let i = 0; i < 400; i++) {
    const s = await g.ev(() => __game.Game.scene.constructor.name); const u = await g.ui();
    if (i % 20 === 0) g.log(i, s, u.slice(0, 120), JSON.stringify(await g.ev(() => { const st = __game.Game.st, b = __game.Game.scene; return [st.hp, st.map, st.x, st.y, b.F && b.F.hp, b.F && b.F.charging]; })));
    if (s !== 'Battle' && i > 5) { g.log('left battle at', i, s, JSON.stringify(await g.ev(() => { const st = __game.Game.st; return [st.hp, st.map, st.x, st.y]; }))); break; }
    await g.press('a', 10);
  }
  await g.mash('a', 20, 12); g.log('after', JSON.stringify(await g.ev(() => { const st = __game.Game.st; return [st.hp, st.map, st.x, st.y, __game.Game.scene.constructor.name]; }))); await g.shot('gk_end');
};
