// v7.0 screens: weapon skills, talents, smith, class cards, battle skill pop-up
module.exports = async (g) => {
  const open = async (fn, name, keys = []) => { await g.ev(fn); await g.step(20); for (const k of keys) await g.press(k, 8); await g.shot(name); await g.ev(() => { __game.UI.clear(); const ow = __game.Game.scene; ow.script = null; }); await g.step(5); };
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: 1 }); st.lv = 16; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.flags.deep = 1;
    const w = makeGear('moonBlade', 3); st.equip.weapon = w.u; const s2 = makeGear('emberRod', 1); st.sub = { u: s2.u, i: 0 }; st.hp = heroStats().hp; st.mp = heroStats().mp; st.ct = { 'swordsman.0.0': 3, 'swordsman.0.1': 2, 'swordsman.0.2': 1, 'swordsman.1.0': 1 };
    for (const k of ['stone', 'gel', 'feather', 'crystal', 'moonDew', 'foxfire']) st.bag[k] = 9; st.money = 5000; st.bpT = { dawnSword: 4 }; st.bp = { dawnSword: 1 }; });
  await open(() => { const ow = __game.Game.scene; ow.run(skillTreeScreen()); }, 'v94_skills', ['down']);
  await open(() => { const ow = __game.Game.scene; ow.run(talentScreen()); }, 'v94_talent', ['down', 'right']);
  await open(() => { const ow = __game.Game.scene; ow.run(craftScreen()); }, 'v94_craft', ['down']);
  await open(() => { const ow = __game.Game.scene; ow.run(classCardScreen(['swordsman', 'mage', 'guardian', 'ranger', 'bard'], { title: '覺醒的儀式' })); }, 'v94_card', ['right']);
  await open(() => { const ow = __game.Game.scene; ow.run(startMenu()); }, 'v94_menu');
  await open(() => { const ow = __game.Game.scene; ow.run(summaryScreen()); }, 'v94_summary', ['right']);
  await g.ev(() => { const G = __game, ow = G.Game.scene; G.Game.autoPlay = null; ow.run(ow.battleScript({ sp: 'wolf', lv: 12, kind: 'wild' })); });
  for (let i = 0; i < 80; i++) { const u = await g.ev(() => __game.UI.stack.map(w => w.constructor.name).join()); if (u.includes('Menu') && await g.ev(() => __game.Game.scene.constructor.name === 'Battle' && __game.Game.scene.idle)) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(4); }); }
  await g.press('right', 6); await g.press('a', 12); await g.shot('v94_bskill');
};
