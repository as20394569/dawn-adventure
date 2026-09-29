module.exports = async (g) => {
  const setup = async () => g.ev(() => { const G = __game; G.UI.clear(); G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: 1 }); st.lv = 26; st.map = 'town'; st.x = 10; st.y = 12; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('swordsman'); st.flags.deep = 1;
    for (const n of CT.swordsman[0]) while (!nodeBlock(n, st) && brPts(0, st) < 11) st.ct[n.id] = (st.ct[n.id] || 0) + 1;
    const w = makeGear('hornSpear', 2); st.equip.weapon = w.u; const h = makeGear('royalHelm', 2); st.equip.head = h.u; const b = makeGear('royalMail', 2); st.equip.body = b.u; const f = makeGear('royalGreaves', 2); st.equip.feet = f.u; st.hp = heroStats().hp; st.mp = heroStats().mp; G.Game.scene.script = null; });
  await setup(); g.log(await g.ev(() => { const st = __game.Game.st; return 'res ' + JSON.stringify(resOn(st)) + ' sets ' + JSON.stringify(setBonus(st)) + ' sig ' + sigText(st.cls) + ' stats ' + JSON.stringify((({ atk, def, hp, crit, critDmg, actUp }) => ({ atk, def, hp, crit, critDmg, actUp }))(heroStats())); }));
  await g.ev(() => __game.Game.scene.run(talentScreen())); await g.step(20); await g.shot('v136_talent');
  await setup(); await g.ev(() => __game.Game.scene.run(summaryScreen())); await g.step(20); await g.press('right', 20); await g.shot('v136_status');
  await setup(); await g.ev(() => __game.Game.scene.run(equipScreen())); await g.step(20); await g.press('down', 6); await g.press('down', 6); await g.shot('v136_equip');
  // combo
  await setup(); await g.ev(() => { const G = __game, ow = G.Game.scene; const ids = usableSkills(G.Game.st); let k = 0; G.Game.autoPlay = b => ({ type: 'move', id: ids[(k++) % 2] }); ow.run(ow.battleScript({ sp: 'ratKing', lv: 27, kind: 'boss' })); });
  for (let i = 0; i < 600; i++) { const c = await g.ev(() => { const s = __game.Game.scene; return s.constructor.name === 'Battle' ? (s.combo || 0) : -1; }); if (c >= 2) { await g.shot('v136_combo'); g.log('combo ' + c); break; } if (c < 0 && i > 50) break; await g.ev(() => { const G = __game; if (G.UI.stack.some(x => x.lines)) G.press('a', 1, 1); else G.step(3); }); }
};
