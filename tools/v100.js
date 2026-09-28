// v7.0 art check: new weapons on the battle doll + loot card, talent screen with branch icons
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('ranger'); st.flags.deep = 1; st.ct = { 'ranger.2.0': 3 };
    const w = makeGear('gearRepeater', 3); st.equip.weapon = w.u; st.hp = heroStats().hp; st.mp = heroStats().mp; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(talentScreen()); });
  await g.step(20); await g.shot('v100_talent');
  await g.ev(() => { const G = __game; G.UI.clear(); const ow = G.Game.scene; ow.script = null; G.Game.autoPlay = b => { b.F.hp = 1; return { type: 'move', id: 'attack' }; }; ow.run(ow.battleScript({ sp: 'wolf', lv: 20, kind: 'elite', id: 'wolf', drop: 'tigerClaw' })); });
  let shot1 = false; for (let i = 0; i < 3000; i++) { if (!shot1 && await g.ev(() => __game.Game.scene.constructor.name === 'Battle' && __game.Game.scene.idle !== undefined && __game.Game.scene.t > 120)) { await g.shot('v100_hand'); shot1 = true; }
    const card = await g.ev(() => __game.UI.stack.some(w => w.out !== undefined && w.t > 30)); if (card) { await g.shot('v100_loot'); break; } await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(3); }); }
};
