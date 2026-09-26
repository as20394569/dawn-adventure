module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 18; st.map = 'route'; st.x = 5; st.y = 20; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    for (const [b, sl] of [['dawnSword', 'weapon'], ['golemVisor', 'head'], ['scaleArmor', 'body'], ['crystalHeart', 'acc1'], ['thornRing', 'acc2']]) { const x = G.Game.st; x.gid++; const gg = { u: x.gid, b, q: 4, r: 1, a: [['crit', 3]] }; x.gear.push(gg); x.equip[sl] = gg.u; }
    st.hp = G.heroStats().hp; st.moves = [{ id: 'bladeStorm', pp: 5 }, { id: 'dawnBreak', pp: 5 }, { id: 'thunderstorm', pp: 5 }, { id: 'inferno', pp: 5 }]; });
  await g.step(10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'crystalGolem', lv: 18, kind: 'boss' })); });
  for (let w = 0; w < 80; w++) { if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.step(5); }
  for (let i = 0; i < 200; i++) { const u = await g.ui(); if (u.includes('技能/道具')) break; if (u.includes('TextBox')) await g.press('a', 4); else await g.step(4); }
  const names = ['armorBreak', 'powerSlash', 'bladeStorm', 'reckless', 'inferno', 'dawnBreak', 'thunderstorm', 'manaBurst', 'guardStrike', 'blaze', 'gale', 'peck', 'lick', 'tailWhip', 'waterGun', 'rockSlide', 'megaDrain', 'thunderWave', 'ironWall'];
  await g.ev(() => { __game.UI.clear(); const b = __game.Game.scene; b.script = (function* () { for (const n of ['armorBreak', 'powerSlash', 'bladeStorm', 'reckless', 'inferno', 'dawnBreak', 'thunderstorm', 'manaBurst', 'guardStrike', 'blaze', 'gale', 'peck', 'lick', 'tailWhip', 'waterGun', 'rockSlide', 'megaDrain', 'thunderWave']) { const F = __fx(); yield* F[n].call(b, b.center(b.H), b.center(b.F), b.H, b.F); } for (const n of ['focus', 'harden', 'ironWall', 'howl', 'agility', 'holyLight', 'barrier']) yield* __fx()[n].call(b, b.center(b.H)); })(); });
  const shots = [8, 60, 130, 200, 270]; let t = 0;
  for (const s of shots) { await g.step(s - t); t = s; await g.shot('fx_' + s); }
  await g.step(1500);
  g.log('fxdone', await g.ev(() => !__game.Game.scene.script));
  await g.ev(() => { const b = __game.Game.scene; b.script = b.main(); });
  await g.autoBattle(1);
  g.log('after', JSON.stringify((await g.state()).st.hp));
};
