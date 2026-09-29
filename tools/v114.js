module.exports = async (g) => {
  g.log(await g.ev(() => Object.entries(MAPS).filter(([k, M]) => M.encounters && M.encounters.length).map(([k, M]) => { let lo = 99, hi = 0; for (const z of M.encounters) for (const r of z.table) { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2]); } return [lo, hi, k, M.name]; }).sort((a, b) => a[0] - b[0]).map(r => r[0] + '-' + r[1] + ' ' + r[2] + ' ' + r[3]).join('\n')));
  g.log(await g.ev(() => { const out = []; for (const k in MAPS) for (const e of MAPS[k].elites || []) out.push((e.lv || '?') + ' ' + k + ':' + e.sp); for (const k in MAPS) for (const e of MAPS[k].bosses || []) out.push('B' + (e.lv || '?') + ' ' + k + ':' + e.sp); return out.sort((a, b) => parseInt(a.replace('B', '')) - parseInt(b.replace('B', ''))).join(' | '); }));
};
