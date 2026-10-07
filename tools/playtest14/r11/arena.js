const fs = require('fs');
module.exports = async (g) => { const s = fs.readFileSync(process.env.SAVE, 'utf8');
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    window.__S = []; const _say = say; say = function* (t, ...a) { window.__S.push('say: ' + KD.fixTxt(String(t))); return yield* _say.call(this, t, ...a); };
    const _ig = itemGet; itemGet = function* (t, ...a) { window.__S.push('get: ' + KD.fixTxt(String(t))); return yield* _ig.call(this, t, ...a); };
    const _pf = KD.pickFlow; KD.pickFlow = function* (ids, title, o) { window.__S.push('PICK: ' + title); return null; };
    window.__deck0 = KD.deck(st).length; window.__on = 0; G.Game.autoPlay = b => { window.__on = 1; for (const u of b.core.side('B')) u.res.hp = 1; b.hand.unshift({ id: 'sw_whirl', up: 1 }); b.energy = 9; return { cmd: b.playK(0, null) }; };
    const A = arenaSt(st); A.clr = {}; const ow = G.Game.scene; ow.run((function* () { yield* arenaRun13(ow, ARENA13[0]); yield* arenaRun13(ow, ARENA13[0]); window.__done = 1; })()); }, s);
  for (let i = 0; i < 9000; i++) { const r = await g.ev(() => { const G = __game; if (window.__done && !G.UI.stack.length) return 'out'; if (G.UI.stack.length) G.press('a', 2, 2); G.step(2); return 'in'; }); if (r === 'out') break; }
  await g.ev(() => { for (let i = 0; i < 40; i++) __game.step(1); }); for (let i = 0; i < 300; i++) { await g.ev(() => { const G = __game; if (G.UI.stack.length) G.press('a', 2, 2); G.step(2); }); }
  g.log((await g.ev(() => window.__S)).join('\n')); };
