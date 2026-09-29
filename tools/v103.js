// story/level map: every map's monster levels, elites, bosses, and how it connects
module.exports = async (g) => g.log(await g.ev(() => {
  const out = [];
  for (const m in MAPS) { const d = MAPS[m]; if (!d.encounters && !d.elites && !d.boss) continue;
    const lv = []; for (const e of d.encounters || []) for (const r of e.table || []) lv.push(r[1], r[2] ?? r[1]);
    const el = (d.elites || []).map(e => (SPECIES[e.sp] || {}).n + e.lv).join(','), b = d.boss ? (SPECIES[d.boss.sp] || {}).n + d.boss.lv : '';
    out.push(m + ' ' + (d.name || '') + ' [' + (MAP_TYPES[m] || '') + '] Lv' + (lv.length ? Math.min(...lv) + '-' + Math.max(...lv) : '-') + (el ? ' 精英:' + el : '') + (b ? ' 頭目:' + b : '')); }
  return out.join('\n');
}));
