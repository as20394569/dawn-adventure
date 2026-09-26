module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.license = 1; st.flags.woke = 1; st.flags.golem = 1; st.lv = 12; st.equip.weapon = 'ironSword';
    st.moves = [{ id: 'aquaBlade', pp: 25 }, { id: 'thunder', pp: 20 }, { id: 'slash', pp: 35 }, { id: 'flameSlash', pp: 25 }]; st.hp = 40;
    st.dex = { mush: { seen: 1, won: 3 }, slime: { seen: 1, won: 1 }, fox: { seen: 1, won: 0 }, wolf: { seen: 1, won: 1 } }; st.map = 'town'; st.x = 17; st.y = 17; st.dir = 'down'; G.startOverworld(); G.Game.fade = 0; });
  await g.step(200);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(__game.dexScreen()); }); await g.step(10); await g.press('down', 6); await g.press('down', 6); await g.press('down', 6); await g.shot('x_dex');
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); }); await g.step(4);
  // well (hero at 17,17 facing down onto the well at 17,18)
  await g.press('a', 60); await g.shot('x_well1'); await g.press('a', 60); await g.shot('x_well2');
  for (let i = 0; i < 12; i++) await g.press('a', 30);
  g.log('flags', JSON.stringify(await g.ev(() => ({ f: __game.Game.st.flags.wellCharm, b: __game.Game.st.bag.moonCharm }))));
  // wet + shock
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'wolf', lv: 12, kind: 'elite' })); });
  const logs = []; let turn = 0, shotW = false;
  for (let i = 0; i < 900; i++) {
    const sc = await g.ev(() => __game.Game.scene.constructor.name); if (sc !== 'Battle' && i > 50) break;
    const u = await g.ui();
    if (u.includes('濕透') || u.includes('感電')) { if (!logs.includes(u)) logs.push(u.slice(0, 60)); if (u.includes('感電') && !shotW) { shotW = true; await g.shot('x_shock'); } }
    if (u.includes('[技能/道具/防禦/逃跑]')) { if (turn === 1) await g.shot('x_wetcmd'); await g.press('a', 6); const mi = turn === 0 ? 0 : 1; for (let k = 0; k < mi; k++) await g.press('right', 4); await g.press('a', 6); turn++; continue; }
    if (u.includes('Menu')) { await g.press('a', 6); continue; }
    if (u.includes('TextBox')) { await g.press('a', 4); continue; }
    await g.step(4);
  }
  g.log(logs.join('\n'));
};
