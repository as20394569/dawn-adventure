module.exports = async (g) => {
  const log = [];
  const drive = async (max = 300) => { for (let i = 0; i < max; i++) { const s = await g.ev(() => { const G = __game, ow = G.Game.scene, U = G.UI.stack; const t = U.find(w => w.lines); return { busy: !!(ow.script) || U.length > 0 || ow.constructor.name !== 'Overworld', text: t ? t.lines.join('') : null }; }); if (!s.busy) return; if (s.text && !log.includes(s.text)) log.push(s.text.slice(0, 70)); await g.ev(() => __game.press('a', 2, 6)); } };
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1, ch2: 1, v81: 1, passQ: 3, passDone: 1, wraithGeneral: 1 }); st.lv = 24; st.map = 'oldField'; st.x = 3; st.y = 12; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('mage'); G.Game.scene.script = null; G.Game.scene.p.dir = 'left'; });
  await g.step(10); await g.shot('v137_door'); await g.press('a', 10); await drive(); await g.step(40);
  log.push('== map ' + await g.ev(() => __game.Game.st.map + ' ' + __game.Game.scene.p.x + ',' + __game.Game.scene.p.y)); await g.shot('v137_tomb');
  await g.ev(() => { const G = __game, ow = G.Game.scene; G.Game.st.flags.tombGuard = 1; ow.elites = []; ow.run(Events.tombAltar(ow)); }); await drive();
  await g.ev(() => { const G = __game, ow = G.Game.scene; ow.run(Events[MAPS.heroTomb.npcs.find(n => /^lore/.test(n.id)).id](ow)); }); await drive();
  log.push('== ' + await g.ev(() => { const st = __game.Game.st; return JSON.stringify({ charm: st.gear.some(x => x.b === 'firstHeroCharm'), lore: loreCount(st), total: LORE.length, q: questList(st).filter(q => q.n === '初代勇者之墓').map(q => q.t) }); }));
  g.log(log.join('\n'));
};
