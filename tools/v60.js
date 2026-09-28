// armour looks: battle hero sets (frame 0 + attack frame) and loot icons
module.exports = async (g) => {
  const SETS = [['knightHelm', 'royalMail', 'knightGreaves', 'royalSword'], ['witchHat', 'starRobe', 'starBoots', 'starStaff'], ['wolfHood', 'bearMantle', 'snowBoots', 'wolfFang2'], ['duskHelm', 'duskPlate', 'voidBoots', 'moldBlade']];
  for (const S of SETS) {
    await g.ev((S) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = 'route'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman');
      for (const k of S) { const gg = makeGear(k, 3); st.equip[GEAR[k].slot] = gg.u; } st.hp = heroStats().hp; const ow = G.Game.scene; ow.script = null; G.UI.clear();
      Battle.prototype.foeChoose = function () { return { type: 'move', id: this.F.moves[0].id }; };
      ow.run(ow.battleScript({ sp: 'slime', lv: 3, kind: 'wild' })); }, S);
    for (let i = 0; i < 60; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(6); }); }
    await g.shot('arm_b_' + S[0]);
    const imgs = await g.ev((S) => { const L = heroLookOf(__game.Game.st); return [0, 1].map(f => heroBattleImgLook(f, L).toDataURL()); }, S);
    require('fs').writeFileSync('build/arm_f_' + S[0] + '.json', JSON.stringify(imgs));
  }
  await g.ev(() => { const G = __game, b = G.Game.scene; G.UI.clear(); b.script = (function* () { yield* b.lootShow(makeGear('bearMantle', 4)); })(); });
  for (let i = 0; i < 20; i++) await g.ev(() => __game.step(2)); await g.shot('arm_loot');
};
