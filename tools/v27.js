module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.flags.woke = 1; st.map = 'elder'; st.x = 4; st.y = 4; st.dir = 'up'; G.startOverworld(); G.Game.fade = 0; const ow = G.Game.scene; ow.run(G.Events.elder(ow)); });
  for (let i = 0; i < 40; i++) { const u = await g.ui(); if (u.includes('ClassSel') || (await g.ev(() => __game.UI.stack.some(w => w.draw && !w.lines && !w.items && w.draw.toString().includes('覺醒的儀式'))))) break; await g.press('a', 18); }
  await g.step(30); await g.shot('h_class1'); await g.press('right', 6); await g.step(10); await g.shot('h_class2'); await g.press('right', 6); await g.step(10); await g.shot('h_class3'); await g.press('left', 6);
  await g.press('a', 20); await g.press('a', 20); // choose mage, confirm yes
  for (let i = 0; i < 60; i++) { const u = await g.ui(); if (u.includes('練習一場')) break; if (await g.ev(() => __game.Game.scene.constructor.name) === 'Battle') break; await g.press('a', 14); }
  await g.press('a', 20);
  await g.autoBattle(1, async () => {});
  for (let i = 0; i < 30; i++) { if (!(await g.state()).script) break; await g.press('a', 14); }
  g.log('after', JSON.stringify(await g.ev(() => { const st = __game.Game.st; return { cls: st.cls, moves: st.moves.map(m => m.id), equip: Object.values(st.equip).filter(Boolean).map(u => st.gear.find(x => x.u === u).b), bag: st.bag, lic: st.flags.license }; })));
  // level-up learning check for mage 6→7
  await g.ev(() => { const st = __game.Game.st; st.lv = 6; st.exp = __game.Game.st.exp; st.moves = st.moves.slice(0, 3); const ow = __game.Game.scene; ow.script = null; __game.UI.clear(); st.exp = 0.8 * 7 * 7 * 7 - 5; st.lv = 6; ow.run(ow.battleScript({ sp: 'mush', lv: 6, kind: 'wild' })); });
  let learned = ''; await g.autoBattle(1, async u => { const m = u.match(/學會了「([^」]+)」/); if (m) learned = m[1]; });
  g.log('learned at 7:', learned);
};
