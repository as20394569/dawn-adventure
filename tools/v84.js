module.exports = async g => g.log(await g.ev(() => { const trig = {}, props = {}, doors = {};
  for (const m in MAPS) { const d = MAPS[m];
    for (const t of d.triggers || []) (trig[t.id] = trig[t.id] || []).push(m);
    for (const n of d.npcs || []) if (!n.name || /門|梯|口|井|蓋/.test(n.name || '') || ['manhole', 'caveDoor', 'starGate', 'ladder', 'stairs', 'hole'].includes(n.look)) (props[n.id + ':' + n.look + ':' + (n.name || '')] = props[n.id + ':' + n.look + ':' + (n.name || '')] || []).push(m);
    for (const b of d.buildings || []) (doors[m] = doors[m] || []).push(b.kind + '→' + (b.to ? b.to[0] : '?')); }
  return 'TRIG ' + JSON.stringify(trig) + '\nPROPS ' + JSON.stringify(props) + '\nDOORS ' + JSON.stringify(doors) + '\nTYPES ' + (typeof MAP_TYPES !== 'undefined' ? JSON.stringify(MAP_TYPES).slice(0, 600) : 'none'); }));
