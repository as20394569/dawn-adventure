// v10.4 icons: orb dex, orb backpack (skill screen tab 2), bag with enchant stones
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; applyStartClass('mage');
    st.orbSeen = {}; for (const k of [...Object.keys(ORB_A).slice(0, 12), 'vigor', 'might']) { st.orbSeen[k] = 1; newOrb(k, st); }
    for (const k of ['enFire', 'enFire2', 'enWater', 'enBolt2', 'enLeaf', 'enVenom', 'enRock2']) st.bag[k] = 2;
    st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(10);
  await g.ev(() => { UI.clear(); const ow = Game.scene; ow.script = null; ow.run(orbDexScreen()); }); await g.step(20); await g.shot('v158_orbdex');
  await g.ev(() => { UI.clear(); const ow = Game.scene; ow.script = null; ow.run(skillTreeScreen()); }); await g.step(10); await g.press('right', 2); await g.step(10); await g.shot('v158_orbbag');
  await g.ev(() => { UI.clear(); const ow = Game.scene; ow.script = null; ow.run(bagScreen()); }); await g.step(10); for (let i = 0; i < 4; i++) { const u = await g.ui(); await g.press('right', 2); await g.step(4); } await g.shot('v158_bag');
  g.log('icons', await g.ev(() => Object.keys(ITEM_ICON).length + ' ' + Object.keys(ORB_A).map(k => orbIconKey(k)).join(',')));
};
