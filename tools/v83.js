module.exports = async g => g.log(await g.ev(() => { const keys = {}; for (const m in MAPS) for (const k in MAPS[m]) keys[k] = (keys[k] || 0) + 1;
  const ex = []; for (const m of ['town', 'route', 'capital', 'frostField', 'lavaTunnel']) { const d = MAPS[m]; ex.push(m + ' exit=' + JSON.stringify(d.exit) + ' warps=' + JSON.stringify(d.warps || null).slice(0, 200) + ' edge=' + JSON.stringify(d.edgeWarps || null).slice(0, 200) + ' trig=' + JSON.stringify(d.triggers || null).slice(0, 200)); }
  return JSON.stringify(keys) + '\n' + ex.join('\n'); }));
