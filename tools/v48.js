// screenshots: new ch2 battle chibis + ch2 battle backgrounds
module.exports = async (g) => {
  const L = (process.env.SPS || 'ratKing:capSewer,boarKing:goldPlains,clockKnight:clockTower1,frostQueen:iceCave,starGuardian:starShrine,shadowMage:duskFort1').split(',');
  for (const it of L) { const [sp, map] = it.split(':');
    await g.ev(([sp, map]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 30; st.map = map; const d = MAPS[map]; st.x = 5; st.y = 5; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.hp = heroStats().hp; const ow = G.Game.scene; ow.script = null; G.UI.clear(); const kind = SPECIES[sp].boss ? 'boss' : SPECIES[sp].elite ? 'elite' : 'wild'; ow.run(ow.battleScript({ sp, lv: 30, kind })); }, [sp, map]);
    for (let i = 0; i < 60; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 4); else G.step(6); }); }
    await g.ev(() => __game.step(20)); await g.shot('ch2b_' + sp);
  }
};
