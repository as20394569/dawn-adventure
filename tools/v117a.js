module.exports = async (g) => {
  g.log(await g.ev(() => Object.keys(CLASS_V7).join(',') + '\n' + Object.keys(CLASS_V7).map(c => c + ':' + (CLASS_V7[c].w || CLASS_V7[c].weapons || '') ).join(' ')));
  g.log(await g.ev(() => { const by = {}; for (const k in GEAR) { const G = GEAR[k]; if (G.slot !== 'weapon' || !GEAR_RECIPE[k] || BP_RARE.has(k)) continue; (by[G.kind + G.t] = by[G.kind + G.t] || []).push(k); } return Object.entries(by).map(([k, v]) => k + ':' + v.slice(0, 3).join('/')).join(' '); }));
  g.log(await g.ev(() => { const r = []; for (const k in GEAR) { const G = GEAR[k]; if (G.slot && G.slot !== 'weapon' && G.t >= 4 && GEAR_RECIPE[k] && !BP_RARE.has(k)) r.push(G.slot + G.t + ':' + k); } return r.join(' '); }));
};
