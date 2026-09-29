// battles per level along the main path (hero at the area's mid level, equal-level exp)
module.exports = async (g) => {
  g.log(await g.ev(() => {
    const path = ['route', 'windHills', 'jadeCreek', 'forest', 'canyon', 'mine', 'ruins', 'lake', 'sewer', 'swamp', 'catacomb', 'northRoad', 'capSewer', 'goldPlains', 'clockTower1', 'frostField', 'iceCave', 'emberPass', 'lavaTunnel', 'duskFort1'];
    const out = [];
    for (const m of path) { const M = MAPS[m]; if (!M || !M.encounters) continue; let sw = 0, se = 0, lo = 99, hi = 0; const z = M.encounters[M.encounters.length - 1];
      for (const e of M.encounters) for (const [sp, a, b, w] of e.table) { lo = Math.min(lo, a); hi = Math.max(hi, b); const lv = (a + b) / 2; se += w * SPECIES[sp].exp * lv / 5; sw += w; }
      const mid = Math.round((lo + hi) / 2), per = se / sw * expScale(mid, mid), need = expForLevel(mid + 1) - expForLevel(mid);
      out.push(m.padEnd(12) + lo + '-' + hi + '  exp/battle ' + Math.round(per) + '  need ' + need + '  battles/lv ' + (need / per).toFixed(1)); }
    return out.join('\n'); }));
};
