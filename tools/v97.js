// v7.0 flows: Lv14 awakening, class change at the elder, guild class change, old-save load note
module.exports = async (g) => {
  const pressAll = async (n = 60) => { for (let i = 0; i < n; i++) { const busy = await g.ev(() => __game.UI.stack.length > 0 || !!__game.Game.scene.script); if (!busy) return; await g.press('a', 6); } };
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, clsDragoon: 1 }); st.lv = 15; st.map = 'town'; st.x = 10; st.y = 10; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; applyStartClass('mage'); st.ct = { 'mage.0.0': 2 };
    const ow = G.Game.scene; ow.script = null; G.UI.clear(); ow.run(Events.elder(ow)); });
  await pressAll(); const a = await g.ev(() => { const st = __game.Game.st; return 'deep ' + st.flags.deep + ' tp ' + tpAvail(st) + ' cls ' + st.cls; });
  await g.ev(() => { const ow = __game.Game.scene; ow.run(Events.elder(ow)); }); await pressAll();
  const b = await g.ev(() => { const st = __game.Game.st; return 'after change cls ' + st.cls + ' ct ' + JSON.stringify(st.ct) + ' tp ' + tpAvail(st); });
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ch2ClassTalk()); }); await pressAll();
  const c = await g.ev(() => 'guild → ' + __game.Game.st.cls);
  // old save
  await g.ev(() => { const G = __game; G.newGameState('舊檔'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1 }); st.lv = 22; st.map = 'town'; st.x = 10; st.y = 10; applyStartClass('swordsman'); st.cls = 'berserker'; st.skV = 4; st.skills = { powerSlash: 3, recklessSlash: 2 }; st.tal = { blade: 3 }; st.tp = 2; st.skp = 4; G.UI.clear(); startOverworld(); G.Game.fade = 0; });
  const msgs = []; for (let i = 0; i < 40; i++) { const t = await g.ev(() => { const T = __game.UI.stack.find(x => x.lines); return T ? T.lines.join('') : ''; }); if (t && !msgs.includes(t)) msgs.push(t); await g.press('a', 8); }
  const d = await g.ev(() => { const st = __game.Game.st; return 'old save → cls ' + st.cls + ' skV ' + st.skV + ' deep ' + st.flags.deep + ' tp ' + tpAvail(st) + ' ws ' + wsList(st).map(id => MOVES[id].n).join(','); });
  g.log([a, b, c, d, ...msgs.map(m => '  > ' + m.slice(0, 60))].join('\n'));
};
