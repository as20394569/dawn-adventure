// v10.4 new skill effects: run each one in a battle and capture a frame mid-effect
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; applyStartClass('mage');
    const w = makeGear('coreStaff', 2); w.en = { t: '雷', lv: 1 }; st.equip.weapon = w.u; st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(10); await g.ev(() => { const ow = Game.scene; UI.clear(); ow.script = null; ow.run(ow.battleScript({ sp: 'slime', lv: 20 })); }); await g.step(120);
  g.log('moves', await g.ev(() => ['u_quakeAxe', 'u_tideRapier', 'u_coreStaff', 'u_frostTome', 'sig_swordsman', 'sig_mage', 'sig_ranger', 'sig_bard', 'sig_monk'].map(k => k + ':' + MOVES[k].fx + ':' + !!FX[MOVES[k].fx]).join(' ')));
  const ONLY = process.env.FXONLY ? process.env.FXONLY.split(',') : null;
  for (const [name, at] of [['quakeCleave', 9], ['tideThrust', 8], ['coreBurst', 22], ['frostBloom', 18], ['iaiFlash', 12], ['elemTorrent', 14], ['shadowFang', 8], ['resonanceSong', 8], ['innerForce', 3], ['EVO_A2', 3], ['EVO_B2', 6]]) { if (ONLY && !ONLY.includes(name)) continue;
    await g.ev((name) => { const b = Game.scene; b._err = null; if (!b._wrapped) { const u0 = b.update.bind(b); b.update = function (...a) { const r = u0(...a); try { if (this._tg && this._tg.next().done) this._tg = null; } catch (e) { this._err = String(e); this._tg = null; } return r; }; b._wrapped = 1; }
      if (name === 'EVO_A2') { evoFlash(b, b.F, ['A', 'A']); b._tg = null; } else if (name === 'EVO_B2') { evoFlash(b, b.F, ['A', 'B']); b._tg = null; }
      else b._tg = name === 'resonanceSong' ? FX[name].call(b, b.center(b.H)) : FX[name].call(b, b.center(b.H), b.center(b.F), b.H, b.F); }, name);
    if (ONLY) { for (let f = 0; f < 8; f++) { await g.step(3); await g.shot('v157s_' + name + '_' + f); } await g.step(40); } else { await g.step(at); await g.shot('v157_' + name); await g.step(60); } g.log(name, await g.ev(() => Game.scene._err || 'ok'));
  }
};
