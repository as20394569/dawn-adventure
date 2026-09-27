module.exports = async (g) => { g.log(await g.ev(() => {
  const out = []; const ks = CH2_MON.map(r => r[0]);
  for (const k of ks) { const ok = ART[k] ? 'A' : '-', cb = typeof chibiBase === 'function' ? chibiBase(k) : '?'; if (!ART[k] || !cb) out.push(k + ' art:' + ok + ' chibi:' + cb); }
  out.push('panels ' + ['greyWolf', 'ratKing', 'clockColossus', 'shadowGeneral', 'frostQueen'].map(k => k + JSON.stringify(MON_PANEL[k])).join(' '));
  return out.join('\n'); })); };
