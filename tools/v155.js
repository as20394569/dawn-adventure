// v10 phase 4 stories: painter + rainbow, commission after-talk, epilogue
module.exports = async (g) => {
  const talk = async (id) => { await g.ev(id => { const ow = Game.scene; ow.script = null; UI.clear(); const n = ow.npcs.find(q => q.id === id); const cq = npcCommission(id, ow, n), ev = Events[id]; ow.run(talkAs(n, cq || ev(ow, n))); }, id); for (let i = 0; i < 40; i++) { const u = await g.ui(); if (!u) break; if (u.includes('Menu')) await g.press('a', 4); else await g.press('a', 4); } };
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1, golem: 1, wolf: 1, q1: 1, q1res: 'secret', q1done: 1 }); st.lv = 20; st.map = 'lake'; const n = MAPS.lake.npcs.find(q => q.id === 'painter'); st.x = n.x - 1; st.y = n.y; st.steps = 50; st.wx = { lake: { k: 'clear', until: 9999 } }; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(20); await talk('painter'); g.log('painter1', await g.ev(() => JSON.stringify(Game.st.ev)));
  await g.ev(() => { Game.st.rainbowUntil = 999; }); await talk('painter'); g.log('painter2', await g.ev(() => JSON.stringify(Game.st.ev) + ' orbs ' + Game.st.orbs.map(o => o.k)));
  g.log('quests', await g.ev(() => questList().filter(q => ['湖上的彩虹'].includes(q.n)).map(q => q.n + ':' + q.done).join(',')));
  await g.ev(() => { const st = Game.st; st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); Game.fade = 0; }); await g.step(10);
  await g.ev(() => { const ow = Game.scene, n = ow.npcs.find(q => q.id === 'florist'); ow.run(talkAs(n, npcCommission('florist', ow, n) || Events.florist(ow, n))); }); await g.step(40); await g.shot('v155_epi'); g.log('epi ui', await g.ui());
};
