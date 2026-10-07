// replay the playtest bot's boss / elite fights with the deck it had then: N seeds each, full HP; reports win rate, HP left, rounds
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8'), SN = JSON.parse(fs.readFileSync(process.env.SNAP, 'utf8')), N = +(process.env.N || 4), KIND = process.env.KIND || 'boss', ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const out = [];
  for (const sn of SN) { if (sn.kind !== KIND || (ONLY && !ONLY.includes(sn.id))) continue; const res = [];
    for (let k = 0; k < N; k++) {
      await g.ev(([s, sn, k]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; G.Game.noV14 = false;
        let seed = 3000 + k * 131; Math.random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.qv = 2; K.cls = sn.cls; K.hpPlus = sn.hpPlus || 0; K.boss = {}; K.qc = {}; K.gave = {}; K.decks = {}; K.decks[sn.cls] = sn.deck.map(x => ({ id: x.replace('+', ''), up: /\+$/.test(x) ? 1 : 0 }));
        st.hp = KD.maxHp(st); startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.Game.autoPlay = () => null;
        const ow = G.Game.scene; window.__fight = sn; ow.run(ow.battleScript({ sp: sn.sp || sn.id, lv: sn.lv, kind: sn.kind, id: sn.id })); }, [save, sn, k]);
      for (let i = 0; i < 300; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle')) break; await g.ev(() => { if (__game.UI.stack.some(x => x.lines)) __game.press('a', 2, 2); else __game.step(4); }); }
      let r = null;
      for (let i = 0; i < 5000; i++) { r = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name === 'Battle') { window.__b = b;
            if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else if (G.UI.stack.length && b.core.result) { G.press('b', 2, 2); } else G.step(6); return null; }
          const c = window.__b && window.__b.core; return { sk: c ? (() => { const m = {}; for (const e of c.log) if (e.type === 'DAMAGE' && e.tgts && e.tgts[0] === 'H') { const k = (e.payload && e.payload.skill) || '?'; m[k] = (m[k] || 0) + (e.payload.amount || 0); } return JSON.stringify(m); })() : '', out: c && c.result ? c.result.outcome : '?', R: c ? c.round : 0, hp: c ? c.byId.H.res.hp : 0, mh: c ? c.byId.H.max.hp : 0, fhp: c ? c.units.filter(u => u.side === 'B').map(u => u.max.hp).join('+') : '' }; });
        if (r) break; }
      res.push(r || { out: 'stuck' }); }
    const w = res.filter(r => r.out === 'win'); out.push(sn.id + ' Lv' + sn.lv + ' deck' + sn.deck.length + ' maxHP' + (res[0] && res[0].mh) + ' | win ' + w.length + '/' + N + ' | HP left ' + w.map(r => r.hp).join(',') + ' | R ' + res.map(r => r.R).join(',') + ' | foeHP ' + (res[0] && res[0].fhp) + ' | dmg ' + (res[0] && res[0].sk)); }
  g.log(out.join('\n'));
};
