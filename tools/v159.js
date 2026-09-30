// v10.4: weather monster chibis in battle + new story portraits
module.exports = async (g) => {
  const setup = () => g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; st.diff = 2; Object.assign(st.flags, { license: 1, woke: 1, orbStart: 1 }); st.lv = 20; applyStartClass('monk' in CLASS_FREE ? 'monk' : 'swordsman');
    const w = makeGear('thunderFist', 2); st.equip.weapon = w.u; st.map = 'lake'; const n = MAPS.lake.npcs.find(q => q.id === 'painter'); st.x = n.x - 1; st.y = n.y; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  for (const sp of ['rainFrog', 'stormHawk', 'mistWisp', 'snowball', 'dustScorpion', 'sunFox']) {
    await setup(); await g.step(10); await g.ev(sp => { const ow = Game.scene; UI.clear(); ow.script = null; ow.run(ow.battleScript({ sp, lv: 20, wxMon: 1 })); }, sp); await g.step(110); await g.shot('v159_' + sp);
    g.log(sp, await g.ev(sp => (chibiOwn(sp) ? 'own chibi' : 'NO chibi') + ' / ' + (Game.scene.F ? Game.scene.F.n : '?'), sp));
  }
  await setup(); await g.step(20);
  for (const id of ['painter']) { await g.ev(id => { const ow = Game.scene; ow.script = null; UI.clear(); const n = ow.npcs.find(q => q.id === id); ow.run(talkAs(n, Events[id](ow, n))); }, id); await g.step(40); await g.shot('v159_talk_' + id); }
  g.log('portraits', await g.ev(() => ['warden', 'painter', 'oldBarr', 'ruby', 'kiteKid', 'oldDuke'].map(k => k + ':' + !!PORTRAIT_ART[k]).join(' ') + ' | painter→' + (portraitOf({ name: '畫家艾琳', look: 'woman2' }) === PORTRAIT_ART.painter)));
};
