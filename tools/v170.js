// v12: turn order, class resource HUD, cooldowns in the skill menu, 技能編排, v12 talent screen
module.exports = async (g) => {
  const setup = async (cls, kind) => g.ev(([cls, kind]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1, deep: 1, tal12Told: 1 }); st.lv = 24; applyStartClass(['mage', 'bard'].includes(cls) ? 'mage' : 'swordsman'); st.cls = cls; st.battleV = 3; st.tal12 = {};
    TAL12.auto(st, 1); st.hp = heroStats().hp; st.mp = heroStats().mp; st.map = 'route'; st.x = 5; st.y = 10; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; BB.slots(st); return st.slots.join(',') + ' tp ' + tpAvail(st) + '/' + tpTotal(st); }, [cls, kind]);
  g.log('setup', await setup('mage'));
  await g.step(10);
  await g.ev(() => { const ow = Game.scene; UI.clear(); ow.script = null; ow.run(ow.battleScript({ sp: 'slime', lv: 20, extra: [['mush', 20], ['wolf', 19]] })); }); await g.step(160);
  await g.shot('v170_battle');
  // skill menu: use a skill, then open the menu again to see the cooldown
  await g.press('right', 3); await g.step(4); await g.press('a', 4); await g.step(15); await g.shot('v170_skills');
  await g.press('down', 3); await g.press('down', 3); await g.step(4); await g.press('a', 4); await g.step(10); await g.press('a', 4); await g.step(260);
  await g.press('right', 3); await g.step(4); await g.press('a', 4); await g.step(15); await g.shot('v170_skills_cd');
  g.log('core', await g.ev(() => { const c = Game.scene.core, u = c.byId.H; return 'round ' + c.round + ' cd ' + JSON.stringify(u.cd) + ' res ' + JSON.stringify(u.res) + ' order ' + JSON.stringify(Game.scene.order12); }));
  await g.press('b', 3); await g.step(6);
  // the menus
  g.log('setup2', await setup('guardian'));
  await g.step(10); await g.ev(() => { UI.clear(); Game.scene.run(skillTreeScreen()); }); await g.step(20); await g.shot('v170_skilltree');
  await g.press('b', 3); await g.step(10); await g.ev(() => { UI.clear(); Game.scene.script = null; Game.scene.run(talentScreen()); }); await g.step(20); await g.shot('v170_talents');
  await g.press('down', 3); await g.press('down', 3); await g.press('down', 3); await g.press('down', 3); await g.press('down', 3); await g.press('down', 3); await g.step(6); await g.shot('v170_talents_key');
  g.log('errors', await g.ev(() => BV2.errors.slice(-5).join(' | ')));
};
