// v10.4.1: HD portraits (Codex originals) in the dialogue box at phone scale
module.exports = async (g) => {
  const n0 = await g.ev(() => { for (const m in MAPS) for (const n of MAPS[m].npcs || []) if (n.look === 'kid2' && Events[n.id]) return m + ':' + n.id; return ''; });
  const [map, id] = n0.split(':'); g.log('kid2 npc', n0);
  await g.ev(([map, id]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1 }); st.map = map; const n = MAPS[map].npcs.find(q => q.id === id); st.x = n.x; st.y = n.y + 1; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; Game.fixedScale = 1; setScale(6); }, [map, id]);
  await g.step(20);
  await g.ev(id => { const ow = Game.scene; ow.script = null; UI.clear(); const n = ow.npcs.find(q => q.id === id); ow.run(talkAs(n, Events[id](ow, n))); }, id); await g.step(40); await g.shot('v160_talk');
  g.log('hd', await g.ev(() => Object.keys(PORTRAIT_HD).join(',') + ' scale ' + SCALE));
};
