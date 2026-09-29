// v9 story: acts in the quest log, lore stones placed, 諾拉 in the capital, the act card
module.exports = async (g) => {
  g.log(await g.ev(() => { const out = []; LORE.forEach(([m, t], i) => { const n = (MAPS[m].npcs || []).find(q => q.id === 'lore' + i); out.push(m + ':' + (n ? n.x + ',' + n.y : 'NONE')); }); const nc = MAPS.capital.npcs.find(n => n.id === 'noraCap'); return out.join(' ') + ' | noraCap ' + (nc ? nc.x + ',' + nc.y : 'NONE'); }));
  const steps = [{}, { license: 1 }, { license: 1, hillsQ: 3, creekQ: 3 }, { license: 1, golem: 1, hillsQ: 3, creekQ: 3, croc: 1 }, { license: 1, golem: 1, ch2: 1, v81: 1, passQ: 1 }, { license: 1, golem: 1, ch2: 1, v81: 1, passDone: 1 }, { license: 1, golem: 1, ch2: 3, passDone: 1 }, { license: 1, golem: 1, ch2: 6, northPass: 1 }, { license: 1, golem: 1, ch2: 10 }];
  for (const f of steps) g.log(await g.ev(f => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, f); const M = questList(st).find(q => q.main); const C = questList(st).find(q => q.n === '第二章：曙光的王都'); return M.n + '｜' + M.t.slice(0, 50) + (C ? ' [C still]' : ''); }, f));
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.lore = { 0: 1, 5: 1 }; G.Game.setScene(new EndingScene()); }); await g.step(400); await g.shot('v132_act');
  for (const [m, x, y, n] of [['ruins', 0, 0, 'lore_ruins'], ['capital', 0, 0, 'nora']]) {
    await g.ev(([m, n]) => { const G = __game; G.UI.clear(); G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, creekQ: 3, ch2: 3 }); const L = MAPS[m].npcs.find(q => q.id === (n === 'nora' ? 'noraCap' : 'lore5')); st.map = m; st.x = L.x; st.y = L.y + 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.Game.scene.script = null; G.Game.scene.p.dir = 'up'; }, [m, n]);
    await g.step(30); await g.shot('v132_' + n);
  }
};
