// v10.6: signature move uses 招式點 (3 of max 5), HUD gauge, power formula in the skill pop-up, class starter orb
module.exports = async (g) => {
  g.log('setup', await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 12; applyStartClass('swordsman');
    const w = makeGear('knightSword', 2); st.equip.weapon = w.u; st.hp = heroStats().hp; st.mp = heroStats().mp; st.map = 'route'; st.x = 5; st.y = 10; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    return 'sig pow ' + skillMove('sig_swordsman').pow + ' mp ' + skillMP('sig_swordsman') + ' starter(mage) ' + (() => { const c = st.cls; st.cls = 'mage'; const r = starterOrb(st); st.cls = c; return r; })() + ' starter(sword) ' + starterOrb(st); }));
  await g.step(10);
  await g.ev(() => { const ow = Game.scene; UI.clear(); ow.script = null; ow.run(ow.battleScript({ sp: 'slime', lv: 12 })); }); await g.step(100);
  g.log('gain', await g.ev(() => { const b = Game.scene; return 'start ' + (b.H.sgp || 0); }));
  // two normal attacks then check
  for (let i = 0; i < 2; i++) { await g.press('a', 4); await g.step(6); await g.press('a', 4); await g.step(120); }
  g.log('after 2 turns', await g.ev(() => 'sgp ' + Game.scene.H.sgp + ' foe hp ' + Game.scene.F.hp));
  await g.ev(() => { Game.scene.H.sgp = 3; }); await g.step(4); await g.shot('v165_hud');
  await g.step(80); await g.ev(() => { Game.scene.H.sgp = 3; }); await g.press('right', 3); await g.step(4); await g.press('a', 4); await g.step(15); await g.shot('v165_pick');
  await g.press('select', 3); await g.step(6); await g.shot('v165_formula');
};
