// v9 夥伴援護: 格倫 cuts in under 60% foe HP, 莉婭 heals under 40% hero HP (boss fight), plus the join messages
module.exports = async (g) => {
  for (const [who, flags] of [['both', { passDone: 1, grenTrust: 1, liaQuest: 2 }], ['none', {}]]) {
    await g.ev(([flags]) => { const G = __game, lv = 26; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, deep: 1, golem: 1, ch2: 5 }, flags); st.lv = lv; st.exp = expForLevel(lv); st.map = 'capital'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
      applyStartClass('swordsman'); attrAuto(st); const wg = makeGear('toadBlade', 1); st.equip.weapon = wg.u; st.hp = heroStats().hp; st.mp = heroStats().mp; st.bag = { megaPotion: 2 };
      ALLY_STATS.gren = ALLY_STATS.lia = 0; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(ow.battleScript({ sp: 'ratKing', lv: 27, kind: 'boss', id: 'ratKing' })); }, [flags]);
    const seen = new Set(); await g.autoBattle('smart', async u => { if (/格倫|莉婭/.test(u)) seen.add(u.match(/"([^"]*)"/) ? u.match(/"([^"]*)"/)[1].slice(0, 30) : u.slice(0, 30)); return null; });
    g.log(who + ' → ' + JSON.stringify(await g.ev(() => ALLY_STATS)) + ' hp ' + await g.ev(() => __game.Game.st.hp) + ' msgs: ' + [...seen].slice(0, 4).join(' / '));
  }
  // join message
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, ch2: 3, liaQuest: 1, blackFeather: 1 }); st.map = 'capital'; st.x = 10; st.y = 20; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(Events.liaCap(ow)); });
  const txt = []; for (let i = 0; i < 40; i++) { const u = await g.ev(() => __game.UI.stack.map(w => (w.lines || []).join('|')).join(' ')); if (u) txt.push(u); await g.ev(() => __game.press('a', 2, 6)); }
  g.log('join: allyLia=' + await g.ev(() => __game.Game.st.flags.allyLia) + ' ' + [...new Set(txt)].filter(t => /夥伴|莉婭會/.test(t)).join(' / ').slice(0, 160));
};
