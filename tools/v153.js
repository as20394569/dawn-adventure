// v10 phase 3: roaming elite in 古岩遺跡, unique weapon skill, boss card
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 19; st.exp = expForLevel(19); st.map = 'ruins'; st.x = 7; st.y = 12; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    applyStartClass('swordsman'); attrAuto(st); tcAuto(st, 0); const w = makeGear('tideRapier', 3); st.equip.weapon = w.u; w.o = [newOrb('bloodMoon').u]; st.hp = heroStats().hp; st.mp = heroStats().mp; st.bag = { megaPotion: 3 };
    Game.forceRoam = 1;
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp: 'skeleton', lv: 16, kind: 'wild' })); });
  for (let i = 0; i < 12; i++) { await g.step(10); const u = await g.ui(); if (u.includes('迎戰')) break; await g.press('a', 4); }
  await g.shot('v154_roamcard'); g.log('ui', await g.ui());
  g.log('skills', await g.ev(() => wsList().map(id => skillMove(id).n).join(', ')));
  await g.autoBattle('smart');
  g.log('after', await g.ev(() => JSON.stringify({ hp: Game.st.hp, orbs: Game.st.orbs.map(o => o.k), bp: Object.keys(Game.st.bp || {}), roam: Game.st.roamDown })));
};
