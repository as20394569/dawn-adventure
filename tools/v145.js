// v9.1 風車亭的試賣會: needs 諾拉's bakery + both companions; the choice is stored and shows in the ending
module.exports = async (g) => {
  for (const [lbl, flags, pick] of [['ready', { noraCapMet: 1, noraBread: 1, allyGren: 1, allyLia: 1, tombCharm: 1 }, 1], ['notReady', { noraCapMet: 1, noraBread: 1, allyGren: 1 }, 0]]) {
    await g.ev(([flags]) => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, ch2: 4, creekQ: 3 }, flags); st.map = 'capital'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(Events.noraCap(ow)); }, [flags]);
    const txt = []; for (let i = 0; i < 60; i++) { const u = await g.ev(() => __game.UI.stack.map(w => (w.items ? '[' + w.items.map(i => i.t).join('/') + ']' : '') + (w.lines || []).join('')).join(' ')); if (u) txt.push(u);
      if (u.includes('[會回去/想留在這裡/還不知道]')) { await g.ev(p => { const m = __game.UI.stack.find(w => w.items); m.i = p; }, pick); } await g.ev(() => __game.press('a', 2, 6)); }
    const f = await g.ev(() => { const f = __game.Game.st.flags; return { bondParty: f.bondParty, homeChoice: f.homeChoice, charm: Object.values(__game.Game.st.gear || {}).some(x => x.b === 'bondCharm') || JSON.stringify(__game.Game.st).includes('bondCharm'), quest: extraQuests.length }; });
    g.log(lbl + ' ' + JSON.stringify(f) + ' | ' + [...new Set(txt)].filter(t => /留在|驛站|羈絆|麵包店的名字|第一個常客/.test(t)).map(t => t.slice(0, 40)).join(' / '));
  }
  // the ending line
  await g.ev(() => { const st = __game.Game.st; st.flags.homeChoice = 1; });
  g.log('ending src has line: ' + await g.ev(() => Ch2EndingScene.prototype.draw.toString().includes('找到了新的家')));
};
