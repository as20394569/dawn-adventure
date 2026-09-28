module.exports = async (g) => { g.log(await g.ev(() => { const hero = new Set(); for (const k in CLASSES) for (const n of skillTreeOf(k)) hero.add(n.id); for (const k in CLASS_FREE) for (const id of CLASS_FREE[k]) hero.add(id);
  return [...hero].filter(id => { const m = MOVES[id]; return m && ((m.eff && m.eff.st === 'psn') || m.st === 'psn' || /毒/.test(m.d || '')); }).map(id => { const m = MOVES[id]; return id + '(' + m.n + ') pow=' + (m.pow || 0) + ' eff=' + JSON.stringify(m.eff || null) + ' st=' + (m.st || '') + ' | ' + m.d; }).join('\n'); }));
  // empirical: swordsman plain attacks vs wolf, count poison
  g.log(await g.ev(() => { const G = __game; G.newGameState('x'); const st = G.Game.st; st.lv = 30; applyStartClass('swordsman'); st.hp = heroStats().hp; let n = 0, p = 0; const b = new Battle({ sp: 'wolf', lv: 20, kind: 'wild', bg: 'field' });
    for (let i = 0; i < 200; i++) { b.F.status = null; b.F.hp = b.F.maxhp; const it = b.useMove(b.H, b.F, 'attack'); let r; let k = 0; do { r = it.next(); if (__game.UI.stack.length) __game.UI.clear(); } while (!r.done && k++ < 4000); n++; if (b.F.status === 'psn') p++; }
    return 'swordsman attacks ' + n + ' poisoned ' + p; }));
};
