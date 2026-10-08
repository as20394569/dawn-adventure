// every line the village chief says (new game → after the class, and later visits), with the dialogue functions logging instead of showing
const fs = require('fs');
module.exports = async (g) => {
  const run = async (label, prep, yes, ai = 0) => g.log('=== ' + label + '\n' + await g.ev(([prep, yes, ai]) => { const out = [];
    const G = __game; (new Function('G', prep))(G); const st = G.Game.st; startOverworld(); G.Game.fade = 0; const ow = G.Game.scene;
    const keep = {}; const P = (name, f) => { keep[name] = window[name]; window[name] = f; };
    const fmt = t => typeof t === 'string' ? t : JSON.stringify(t);
    P('say', function* (t) { out.push('say: ' + (typeof KD !== 'undefined' && KD.fixTxt ? KD.fixTxt(fmt(t)) : fmt(t))); });
    P('sayAll', function* (L) { for (const t of L) out.push('say: ' + (KD.fixTxt ? KD.fixTxt(fmt(t)) : fmt(t))); });
    P('blackText', function* (L) { for (const t of L) out.push('black: ' + t); });
    P('itemGet', function* (t) { out.push('item: ' + (KD.fixTxt ? KD.fixTxt(fmt(t)) : fmt(t))); });
    let calls = 0; P('ask', function* (q, o) { if (++calls > 40) throw new Error('loop'); out.push('ask: ' + fmt(q) + ' ' + JSON.stringify(o)); return calls === 1 ? ai : 0; });
    P('yesNo', function* (q) { if (++calls > 40) throw new Error('loop'); out.push('yesNo: ' + fmt(q)); return /練習|泡泡姆/.test(fmt(q)) ? false : true; });
    P('fadeOut', function* () {}); P('fadeIn', function* () {}); P('wait', function* () {});
    try { const it = Events.elder(ow); for (let i = 0; i < 5000; i++) { const r = it.next(); if (r.done) break; } } catch (e) { out.push('ERR ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
    for (const k in keep) window[k] = keep[k];
    return out.join('\n'); }, [prep, yes, ai]));
  await run('new game', "G.Game.st = newGameState('測試');", false);
  await run('after license (no hills)', "G.Game.st = newGameState('測試'); const f = G.Game.st.flags; f.license = 1;", false);
  await run('mid game save', "G.Game.st = JSON.parse(require_save); G.Game.st.status = null; if (!G.Game.st.k14) KD.migrate(G.Game.st);".replace('require_save', JSON.stringify(fs.readFileSync(process.env.SAVE, 'utf8'))), true);
  const SV = JSON.stringify(fs.readFileSync(process.env.SAVE, 'utf8'));
  await run('mid save, trial already given', "G.Game.st = JSON.parse(" + SV + "); G.Game.st.status = null; if (!G.Game.st.k14) KD.migrate(G.Game.st); G.Game.st.flags.otwQ = 1;", true, 1);
  await run('early: license + hills done', "G.Game.st = newGameState('測試'); const f = G.Game.st.flags; f.license = 1; f.hillsQ = 3; KD.state(G.Game.st).cls = 'mg'; G.Game.st.cls = 'mage';", true, 1);
  await run('early: license + hills done (no 轉職)', "G.Game.st = newGameState('測試'); const f = G.Game.st.flags; f.license = 1; f.hillsQ = 3; f.golem = 1; f.ch2 = 2;", false);
};
