// overworld screenshots of ch2 maps (theme + props + NPCs)
module.exports = async (g) => {
  const L = (process.env.MAPS || 'capital,goldPlains,clockTower1,frostVillage,iceCave,emberPass,lavaTunnel,duskFort2,starShrine,castle,guild,northRoad').split(',');
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, ch2: 5 }); st.lv = 30; st.map = 'town'; st.x = 12; st.y = 6; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); });
  for (const id of L) {
    await g.ev((id) => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); const d = MAPS[id], R = d.rows, H = R.length, Wd = R[0].length; let best = null, bd = 1e9; const cx = Wd / 2, cy = H / 2;
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < Wd - 1; x++) { const c = R[y][x]; if ('TWobSFPRXYUNxwckhaBQKCpV'.includes(c)) continue; const dd = (x - cx) ** 2 + (y - cy) ** 2; if (dd < bd) { bd = dd; best = [x, y]; } }
      ow.load(id, best[0], best[1], 'down', true); G.Game.fade = 0; }, id);
    await g.ev(() => __game.step(30)); await g.shot('ch2m_' + id);
  }
};
