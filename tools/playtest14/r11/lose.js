const fs = require('fs');
module.exports = async (g) => { const s = fs.readFileSync(process.env.SAVE, 'utf8');
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); KD.state(st).catchup = 0; startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1;
    window.__S = []; const _tb = TextBox; window.TextBox = TextBox; const P = TextBox.prototype; const _init = P.update; 
    const _say = say; say = function* (t, ...a) { window.__S.push(String(t)); return yield* _say.call(this, t, ...a); };
    window.__on = 0; G.Game.autoPlay = b => { window.__on = 1; b.core.byId.H.res.hp = 1; return { k: 'end' }; };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'wolf', lv: 30, kind: 'wild' })); }, s);
  for (let i = 0; i < 3000; i++) { const r = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name !== 'Battle' && window.__on && !G.UI.stack.length && !b.script) return 'out'; if (G.UI.stack.length) G.press('a', 2, 2); G.step(2); return 'in'; }); if (r === 'out') break; }
  g.log((await g.ev(() => window.__S)).join('\n')); };
