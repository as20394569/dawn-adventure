module.exports = async (g) => {
  g.log(await g.ev(() => { const E = t => 70 + 15 * (t - 1), rows = [];
    for (const k in WSK) { const G = GEAR[k]; if (!G || !GEAR_RECIPE[k] || BP_RARE.has(k)) continue; const S = WSK[k];
      let best = 0, bid = null; for (const id of S.a) { const m = MOVES[id]; if (!m || !m.pow) continue; const v = m.pow * (m.hits || 1); if (v > best) { best = v; bid = id; } }
      const tgt = Math.round(0.9 * E(G.t)); if (best < tgt) rows.push(G.kind + ' T' + G.t + ' ' + k + ' ' + (bid ? MOVES[bid].n : '-') + ' ' + best + ' -> ' + tgt + ' (' + (bid || '') + ' pow ' + (bid ? MOVES[bid].pow : '') + (bid && MOVES[bid].hits ? 'x' + MOVES[bid].hits : '') + ')'); }
    return rows.join('\n'); }));
  g.log(await g.ev(() => [4, 5, 6, 7].map(t => 'T' + t + ' gold ' + Object.keys(GEAR_RECIPE).filter(k => GEAR[k].t === t && !BP_RARE.has(k)).map(k => GEAR_RECIPE[k].gold).slice(0, 6).join('/')).join('\n')));
};
