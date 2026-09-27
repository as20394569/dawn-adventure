module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 18; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    applyStartClass('swordsman'); for (const n of skillTreeOf('swordsman')) st.skills[n.id] = 2; st.skp = 5; st.cls = 'swordmaster'; grantSkill('bladeStorm', st); });
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(inheritScreen()); }); await g.step(4);
  await g.press('select', 8);
  for (let i = 0; i < 8; i++) { g.log(i, await g.ui()); const u = await g.ui(); if (u.includes('是/否')) { await g.press('a', 8); break; } await g.press('a', 8); }
  for (let i = 0; i < 4; i++) { g.log('after', await g.ui()); await g.press('a', 8); }
  g.log(JSON.stringify(await g.ev(() => { const st = __game.Game.st; return { inh: st.inh, skp: st.skp, gale: st.skills.gale }; })));
  // battle chooser
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.autoPlay = null; ow.run(ow.battleScript({ sp: 'wolf', lv: 16, kind: 'wild' })); });
  for (let i = 0; i < 40; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle')) break; await g.step(5); }
  await g.step(60); await g.ev(() => { const b = __game.Game.scene; __game.UI.clear(); b.script = (function* () { const r = yield* b.chooseMove(); window.__pick = r; })(); }); await g.step(20); await g.shot('ct_choose');
  for (let i = 0; i < 9; i++) await g.press('down', 3); await g.step(2); await g.shot('ct_choose2');
};
