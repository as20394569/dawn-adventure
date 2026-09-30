// Codex task T: signature talent icons + unique weapon sprites in game
module.exports = async (g) => {
  const setup = (cls, wk) => g.ev(([cls, wk]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; applyStartClass(cls);
    const wg = makeGear(wk, 2); st.equip.weapon = wg.u; st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; return Object.keys(WEAPON_PX_ROWS).length + ' ok=' + !!(weaponPx(wk)) + ' sig=' + !!TALENT_SIG_PX[cls] + ' tp0=' + (TALENT_PX[cls + '_0'] === TALENT_SIG_PX[cls]); }, [cls, wk]);
  g.log('sword', await setup('swordsman', 'boneGreatsword')); await g.step(10);
  await g.ev(() => { __game.UI.clear(); const ow = __game.Game.scene; ow.script = null; ow.run(talentScreen()); }); await g.step(30); await g.shot('v156_talent');
  await g.ev(() => { const ow = Game.scene; UI.clear(); ow.script = null; ow.run(ow.battleScript({ sp: 'slime', lv: 20 })); }); await g.step(90); await g.shot('v156_battle_bone');
  g.log('monk', await setup('swordsman', 'thunderFist')); await g.step(10);
  await g.ev(() => { const ow = Game.scene; UI.clear(); ow.script = null; ow.run(ow.battleScript({ sp: 'slime', lv: 20 })); }); await g.step(90); await g.shot('v156_battle_fist');
};
