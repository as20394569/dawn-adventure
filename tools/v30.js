module.exports = async (api) => { console.log(await api.ev(() => {
  const out = [];
  const bySlot = {}; for (const k in GEAR) { const g = GEAR[k]; (bySlot[g.slot] = bySlot[g.slot] || []).push(k + '=' + JSON.stringify(g.look || null)); }
  for (const s in bySlot) out.push(s + ': ' + bySlot[s].slice(0, 40).join(' '));
  out.push('BODY_LOOKS styles: ' + [...new Set(Object.values(BODY_LOOKS).map(v => Array.isArray(v) ? v[0] : typeof v))].join(','));
  out.push('SPECIALS: ' + Object.keys(SPECIALS).join(','));
  out.push('WEAPON_KINDS: ' + Object.keys(WEAPON_KINDS).join(','));
  out.push('goldSlime: ' + JSON.stringify(SPECIES.goldSlime) + ' ' + JSON.stringify(MON_PANEL.goldSlime));
  out.push('LOOT keys: ' + Object.keys(LOOT).join(','));
  return out.join('\n'); })); };
