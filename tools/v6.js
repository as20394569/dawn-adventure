// gallery: each species in battle at command menu
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.lv = 10; st.equip.weapon = 'ironSword'; st.bag.ironSword = 1; st.hp = G.heroStats().hp; st.map = 'route'; st.x = 5; st.y = 20; G.startOverworld(); G.Game.fade = 0; });
  await g.step(10);
  const sps = ['mush', 'bird', 'pebble', 'slime', 'fox', 'bee', 'frog', 'wolf', 'flower', 'croc', 'golem'];
  for (const sp of sps) {
    await g.ev(sp => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp, lv: 8, kind: sp === 'golem' ? 'boss' : sp === 'wolf' || sp === 'flower' || sp === 'croc' ? 'elite' : 'wild', bg: sp === 'golem' ? 'ruins' : undefined })); }, sp);
    for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
    for (let i = 0; i < 200; i++) { const u = await g.ui(); if (u.includes('戰鬥')) break; if (u.includes('TextBox')) await g.press('a', 4); else await g.step(4); }
    await g.step(20); await g.shot('m_' + sp);
    // run away / end battle directly
    await g.ev(() => { const b = __game.Game.scene; b.result = 'run'; });
    await g.ev(() => { const G = __game; G.UI.clear(); G.startOverworld(); G.Game.fade = 0; });
    await g.step(10);
  }
};
