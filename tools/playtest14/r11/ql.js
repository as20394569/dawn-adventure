const fs = require('fs');
module.exports = async (g) => { for (const f of (process.env.SAVES || '').split(',')) { const s = fs.readFileSync(f, 'utf8');
  const r = await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; if (!st.k14) KD.migrate(st); KD.state(st).catchup = 0; startOverworld();
    const fx = t => KD.fixTxt(ncTxt12(KD.fixTxt(String(t)))); let L = []; try { L = questList(); } catch (e) { return 'ERR ' + e.message + ' fns ' + Object.keys(window).filter(k => /quest/i.test(k)).join(','); }
    return 'lv ' + st.lv + ' cls ' + st.cls + '\n' + L.map(q => (q.done ? '✓ ' : '・ ') + q.n + '｜' + fx(q.t) + '｜' + fx(q.rw || '')).join('\n'); }, s);
  g.log(r.slice(0, 6000)); } };
