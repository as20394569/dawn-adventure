module.exports = async (g) => {
  g.log(await g.ev(() => { const rows = []; for (const k in WSK) { const G = GEAR[k]; if (!G || !GEAR_RECIPE[k] || BP_RARE.has(k)) continue; const S = WSK[k];
      const acts = S.a.map(id => { const m = MOVES[id]; return m ? m.n + ':' + (m.pow || 0) + (m.hits ? 'x' + m.hits : '') + '/' + (m.cat || '') + '/mp' + (m.mp || '') : id; }); rows.push([G.kind, G.t, k, acts.join(' ; ')]); }
    rows.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1]); return rows.map(r => r.join(' ')).join('\n'); }));
};
