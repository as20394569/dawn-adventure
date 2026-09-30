// v10 phase 1 UI: dialogue portraits, quest screen, quest HUD, auto-run
module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, q1: 1 }); st.lv = 5; st.cls = 'swordsman'; st.map = 'town'; st.x = 10; st.y = 14; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; });
  await g.step(30);
  const who = await g.ev(() => { const ow = Game.scene, e = ow.npcs.find(n => n.name && n.look && !PORTRAIT_PROPS.has(n.look)); ow.run(talkAs(e, sayAll(['今天的天氣真好。你要出門嗎？記得晨霧道路北邊有電電蜂，被螫到會麻痺喔。', '莉婭：「騎士團的見習生也會去巡邏的，別太擔心。」']))); return e.name + '/' + e.look; });
  await g.step(160); await g.shot('v150_dlg1'); await g.press('a'); await g.step(120); await g.shot('v150_dlg2');
  await g.mash('a', 6); await g.step(20);
  g.log('talker after:', await g.ev(() => String(Game.talker)), 'who', who, '| log', await g.ev(() => DLG_LOG.length));
  await g.ev(() => { Game.scene.run(questScreen()); }); await g.step(20); await g.shot('v150_quest');
  await g.press('a'); await g.step(10); await g.shot('v150_questDetail'); await g.press('b'); await g.press('b'); await g.step(10);
  await g.step(200); await g.shot('v150_hud');
  // auto-run: hold right for 40 frames, count tiles moved
  const run = await g.ev(() => { const G = __game, ow = G.Game.scene, x0 = ow.p.x; G.Input.set('down', true); G.step(48); G.Input.set('down', false); G.step(20); return ow.p.y + ' from 14'; });
  g.log('auto-run moved to y', run, '| guide', await g.ev(() => { const q = questTracked(); const G = questGuide(q); return q.n + ' → ' + JSON.stringify(G && { text: G.text, next: G.next, arrow: G.arrow }); }));
};
