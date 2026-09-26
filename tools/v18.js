module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, wolf: 1, croc: 1, golem: 1 }); st.lv = 16; st.map = 'town'; st.x = 12; st.y = 7; st.dir = 'down'; Object.assign(st.bag, { herb: 6, crystal: 6, superPotion: 2 }); G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(5); await g.shot('b_board_tile');
  // board: accept c1 then turn in
  await g.press('a', 10); for (let i = 0; i < 3; i++) await g.press('a', 30); await g.shot('b_board_menu');
  await g.mash('a', 8, 30); g.log('com1', JSON.stringify(await g.ev(() => __game.Game.st.com)));
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); ow.run(__game.Events.board(ow)); }); await g.step(5);
  await g.mash('a', 12, 30); g.log('com2', JSON.stringify(await g.ev(() => [__game.Game.st.com, __game.Game.st.bag.herb, __game.Game.st.money])));
  // Tim quest
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.st.flags.q2 = 1; ow.load('forest', 3, 16, 'up'); const t = ow.npcs.find(n => n.id === 'tim'); ow.run(G.Events.tim(ow, t)); });
  for (let i = 0; i < 5; i++) await g.press('a', 30); await g.press('down', 6); await g.mash('a', 6, 30);
  g.log('tim', JSON.stringify(await g.ev(() => [__game.Game.st.flags.q2res, __game.Game.st.bag.superPotion])));
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp: 'mossGiant', lv: 13, kind: 'elite', id: 'mossGiant' })); });
  let arrow = 0; await g.autoBattle(0, async u => { if (u.includes('提姆射出')) { if (!arrow) await g.shot('b_arrow'); arrow++; } });
  g.log('arrow', arrow, await g.ev(() => __game.Game.scene.constructor.name));
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); G.Game.st.flags.mossGiant = 1; const t = ow.npcs.find(n => n.id === 'tim'); ow.run(G.Events.tim(ow, t)); });
  await g.mash('a', 12, 30); g.log('oath', JSON.stringify(await g.ev(() => [__game.Game.st.flags.q2done, __game.Game.st.gear.map(x => x.b + x.q).join(',')])));
  // smith q3
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.load('town', 13, 17, 'up'); ow.run(G.Events.smith(ow)); });
  for (let i = 0; i < 5; i++) await g.press('a', 30); await g.press('b', 20);
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(G.Events.smith(ow)); });
  for (let i = 0; i < 10; i++) await g.press('a', 40); await g.press('down', 6); await g.mash('a', 6, 30); await g.press('b', 20);
  g.log('q3', JSON.stringify(await g.ev(() => [__game.Game.st.flags.q3, __game.Game.st.flags.q3res, __game.Game.st.flags.smithDisc, __game.Game.st.bag.tpBook])));
  // walk around, records
  await g.ev(() => { const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); });
  await g.walkTo(4, 3); await g.walkTo(18, 3); await g.step(40); await g.shot('b_toast');
  await g.ev(() => { const ow = __game.Game.scene; ow.run(__game.recordScreen()); }); await g.step(5); await g.shot('b_rec_map');
  await g.press('right', 6); await g.shot('b_rec_ach');
  await g.press('b', 10);
  await g.ev(() => { const ow = __game.Game.scene; ow.run(__game.summaryScreen()); }); await g.press('right', 4); await g.press('right', 4); await g.shot('b_quests'); await g.press('b', 6);
  g.log('pct', JSON.stringify(await g.ev(() => [__game.mapPct('town'), __game.totalPct(), Object.keys(__game.Game.st.ach || {})])));
};
