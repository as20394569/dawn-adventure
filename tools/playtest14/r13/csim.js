// class comparison: the playtest bot's swordsman decks at each boss / elite, translated card by card into each class
// (same rarity and type, seeded), same fights, full HP. env: SAVE SNAP CLS=sw,rg,mg,bk N=decks per fight ONLY=ids KINDS=boss,elite OUT=json file
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8'), SN = JSON.parse(fs.readFileSync(process.env.SNAP, 'utf8')), N = +(process.env.N || 3);
  const CLS = (process.env.CLS || 'sw,rg,mg,bk').split(','), KINDS = (process.env.KINDS || 'boss,elite').split(','), ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const rows = []; if (process.env.TUNE) await g.ev(code => { (0, eval)(code); }, process.env.TUNE);
  for (const sn of SN) { if (!KINDS.includes(sn.kind) || (ONLY && !ONLY.includes(sn.sp || sn.id)) || sn.lv < +(process.env.MINLV || 0) || (process.env.SKIP || '').split(',').includes(sn.sp || sn.id)) continue;
    for (const cls of CLS) for (let k = 0; k < N; k++) {
      const deck = await g.ev(([s, sn, k, cls]) => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; G.Game.noV14 = false;
        let seed = 7000 + k * 977 + sn.lv * 13; const R = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        const B = { sw: ['sw_strike', 'sw_defend', 'sw_break'], rg: ['rg_stab', 'rg_defend', 'rg_venom'], mg: ['mg_bolt', 'mg_shield', 'mg_fire'], bk: ['bk_chop', 'bk_defend', 'bk_split'] };
        const map = x => { const up = /\+$/.test(x), id = x.replace('+', ''), C = KD.CARDS[id]; if (!C || C.cls !== 'sw' || cls === 'sw') return { id, up: up ? 1 : 0 };
          const bi = B.sw.indexOf(id); if (bi >= 0) return { id: B[cls][bi], up: up ? 1 : 0 };
          let P = Object.keys(KD.CARDS).filter(j => { const D = KD.CARDS[j]; return D.cls === cls && D.rar === C.rar && D.type === C.type && !D.hidden; });
          if (!P.length) P = Object.keys(KD.CARDS).filter(j => { const D = KD.CARDS[j]; return D.cls === cls && D.rar === C.rar && !D.hidden; });
          return { id: P[Math.floor(R() * P.length)], up: up ? 1 : 0 }; };
        const dk = sn.deck.map(map);
        let bs = 3000 + k * 131; Math.random = () => { bs = (bs * 16807) % 2147483647; return bs / 2147483647; };
        if (!st.k14) KD.migrate(st); const K = KD.state(st); K.catchup = 0; K.qv = 2; K.cls = cls; K.hpPlus = sn.hpPlus || 0; K.boss = {}; K.qc = {}; K.gave = {}; K.decks = {}; K.decks[cls] = dk;
        st.hp = KD.maxHp(st); startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; G.Game.autoPlay = () => null;
        const ow = G.Game.scene; ow.run(ow.battleScript({ sp: sn.sp || sn.id, lv: sn.lv, kind: sn.kind, id: sn.id })); return dk.map(c => c.id + (c.up ? '+' : '')); }, [save, sn, k, cls]);
      for (let i = 0; i < 300; i++) { if (await g.ev(() => __game.Game.scene.constructor.name === 'Battle')) break; await g.ev(() => { if (__game.UI.stack.some(x => x.lines)) __game.press('a', 2, 2); else __game.step(4); }); }
      let r = null;
      for (let i = 0; i < 6000; i++) { r = await g.ev(() => { const G = __game, b = G.Game.scene; if (b.constructor.name === 'Battle') { window.__b = b;
            if (G.UI.stack.some(x => x.lines)) G.press('a', 2, 2); else if (G.UI.stack.length && b.core.result) { G.press('b', 2, 2); } else G.step(6); return null; }
          const c = window.__b && window.__b.core; return { out: c && c.result ? c.result.outcome : '?', R: c ? c.round : 0, hp: c ? c.byId.H.res.hp : 0, mh: c ? c.byId.H.max.hp : 0, brk: c ? c.log.filter(e => e.type === 'BREAK' && c.byId[e.tgts[0]] && c.byId[e.tgts[0]].boss).length : 0, rx: c ? (c.data.rxN16 || 0) : 0 }; });
        if (r) break; }
      r = r || { out: 'stuck' }; rows.push({ fight: (sn.sp || sn.id) + '@' + sn.lv, kind: sn.kind, cls, k, ...r, deck });
      g.log(cls, sn.kind, (sn.sp || sn.id) + '@' + sn.lv, r.out, 'R' + r.R, 'hp ' + r.hp + '/' + r.mh, 'brk ' + r.brk, 'rx ' + r.rx); }
  }
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(rows));
  const sum = {}; for (const r of rows) { const s = sum[r.cls + ' ' + r.kind] = sum[r.cls + ' ' + r.kind] || { n: 0, w: 0, hp: 0, R: 0 }; s.n++; if (r.out === 'win') { s.w++; s.hp += r.hp / r.mh; } s.R += r.R; s.brk = (s.brk || 0) + (r.brk || 0); s.rx = (s.rx || 0) + (r.rx || 0); }
  for (const k in sum) { const s = sum[k]; g.log('SUM', k, 'win ' + s.w + '/' + s.n, 'HP left ' + (s.w ? Math.round(100 * s.hp / s.w) : 0) + '%', 'rounds ' + (s.R / s.n).toFixed(1), 'breaks ' + (s.brk / s.n).toFixed(1), 'reactions ' + (s.rx / s.n).toFixed(1)); }
};
