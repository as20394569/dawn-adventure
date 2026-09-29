module.exports = async (g) => {
  g.log(await g.ev(() => { const rows = []; for (const k in GEAR) { const G = GEAR[k]; if (G.slot !== 'weapon') continue; const s = gearStats({ b: k, q: 2, r: 1, a: [], e: 0 }).st; rows.push([G.t, G.kind, k, G.n, 'atk ' + (s.atk || 0) + ' spa ' + (s.spa || 0) + ' spe ' + (s.spe || 0) + (BP_RARE.has(k) ? ' R' : '') + (GEAR_RECIPE[k] ? '' : ' noRecipe')]); }
    rows.sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] - b[0])); return rows.map(r => r.join(' ')).join('\n'); }));
};
