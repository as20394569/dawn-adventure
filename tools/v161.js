// v10.4.2: signature skill page separate from talents; three talent branches restored; save migration
module.exports = async (g) => {
  g.log('migrate', await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; applyStartClass('swordsman');
    st.tcAll = { swordsman: { '0.0': 0, '0.1': 1, '1.0': 1, '2.0': 0 }, mage: { '1.0': 0, '2.1': 1 } }; delete st.talV104; st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    return JSON.stringify(st.tcAll) + ' spent ' + tpSpent(st) + ' branches ' + T9C.swordsman.map(b => b.n).join('/') + ' | sigPow ' + talentSum('sigPow') + ' pow ' + skillMove(sigId(st)).pow; }));
  await g.step(10);
  await g.ev(() => { __game.UI.clear(); const ow = Game.scene; ow.script = null; ow.run(talentScreen()); }); await g.step(20); await g.shot('v161_talent');
  await g.ev(() => { UI.clear(); const ow = Game.scene; ow.script = null; ow.run(skillTreeScreen()); }); await g.step(15); await g.shot('v161_skills');
  await g.press('a', 4); await g.step(15); await g.press('down', 2); await g.step(4); await g.press('right', 2); await g.step(4); await g.press('a', 4); await g.step(10); await g.shot('v161_sig');
  g.log('after', await g.ev(() => JSON.stringify(Game.st.tcAll.swordsman) + ' spent ' + tpSpent() + ' avail ' + tpAvail() + ' res ' + JSON.stringify(resOn()) + ' | ' + optDesc9(SIGC.swordsman.tiers[4][0]) + ' | ' + sigTalentText()));
};
