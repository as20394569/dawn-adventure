// hand-played (key presses, no auto play): strike a monster that has 1 HP left; screenshots while the card flies / hits / it falls
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; G.Game.noV14 = false; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.cls = 'sw'; K.decks = {}; K.decks.sw = Array.from({ length: 10 }, () => ({ id: 'sw_strike', up: 0 }));
    st.hp = KD.maxHp(st); st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; st.map = 'windHills'; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.Game.autoPlay = null; const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'piglet', lv: 6, kind: 'wild', extra: [['curlySheep', 6], ['hornHare', 6]] })); }, save);
  for (let i = 0; i < 400; i++) { const r = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name === 'Battle' && b.idle && b.hand && b.hand.length) return 1; if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else G.step(4); }); if (r) break; }
  await g.ev(() => { const b = __game.Game.scene, f = b.core.alive('B'); for (const u of f) u.res.hp = 1; b.sync(); });
  
  // pick card 0, play it, aim at the middle monster
  await g.ev(() => { const G = __game, b = G.Game.scene; G.step(40); const i = b.hand.findIndex(c => c.id === 'sw_strike'); for (let k = 0; k <= i; k++) G.press('right', 2, 4); G.press('a', 2, 4); G.press('a', 2, 4); G.press('right', 2, 4); });
  const st = await g.ev(() => { const b = __game.Game.scene; return { tgt: b.tgtMode, id: b.tgtId }; }); g.log('target mode', JSON.stringify(st)); await g.shot('hand_0');
  await g.ev(() => __game.press('a', 2, 1));
  const marks = [2, 14, 28, 44, 64, 90];
  let t0 = 0; for (const m of marks) { await g.ev(n => __game.step(n), m - t0); t0 = m; await g.shot('hand_' + m); g.log(m, await g.ev(() => { const b = __game.Game.scene, c = b.core; return c.units.filter(u => u.side === 'B').map(u => u.id + (c.isUp(u) ? '' : 'x') + ':' + (b.views[u.id].gone ? 'G' : '') + b.views[u.id].alpha.toFixed(1)).join(' '); })); }
};
