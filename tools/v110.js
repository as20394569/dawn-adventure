// full UI tour for a final review: title, menus, smithy, battle
module.exports = async (g) => {
  await g.shot('v110_title');
  const setup = async () => g.ev(() => { const G = __game; G.UI.clear(); G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, hillsQ: 2, creekQ: 1 }); st.lv = 10; st.map = 'town'; st.x = 10; st.y = 12; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); attrAuto(st);
    const w = makeGear('ironSword', 2); st.equip.weapon = w.u; st.money = 3200; st.bag.potion = 4; st.hp = heroStats().hp; st.mp = heroStats().mp; G.Game.scene.script = null; });
  const scr = async (name, gen) => { await setup(); await g.ev(gen); await g.step(30); await g.shot('v110_' + name); };
  await scr('menu', () => { const ow = __game.Game.scene; ow.run(startMenu()); });
  await scr('status', () => { const ow = __game.Game.scene; ow.run(summaryScreen()); });
  await scr('attr', () => { const ow = __game.Game.scene; ow.run(attrScreen()); });
  await scr('skills', () => { const ow = __game.Game.scene; ow.run(skillTreeScreen()); });
  await scr('talent', () => { const ow = __game.Game.scene; ow.run(talentScreen()); });
  await scr('bag', () => { const ow = __game.Game.scene; ow.run(bagScreen('field')); });
  await scr('equip', () => { const ow = __game.Game.scene; ow.run(equipScreen()); });
  await scr('dex', () => { const ow = __game.Game.scene; ow.run(dexScreen()); });
  await scr('record', () => { const ow = __game.Game.scene; ow.run(recordScreen()); });
  await scr('craft', () => { const ow = __game.Game.scene; ow.run(craftScreen()); });
  await scr('town', () => {});
  // battle vs the mill golem: skill menu + charge warning
  await setup();
  await g.ev(() => { const G = __game; const ow = G.Game.scene; G.Game.autoPlay = null; ow.run(ow.battleScript({ sp: 'millGolem', lv: 8, kind: 'elite', id: 'millGolem' })); });
  for (let i = 0; i < 400; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle' && __game.Game.scene.t > 150 && !__game.UI.stack.some(x => x.lines))) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(3); }); }
  await g.shot('v110_battle');
  await g.press('right', 4); await g.press('a', 20); await g.shot('v110_battle_skills');
  g.log('done');
};
