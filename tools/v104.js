module.exports = async (g) => g.log(await g.ev(() => {
  const T = getMap('town'); const out = ['town ' + T.w + 'x' + T.h, ...T.rows.map((r, i) => String(i).padStart(2) + ' ' + r)];
  out.push('edgeWarps ' + JSON.stringify(MAPS.town.edgeWarps || []) + ' connect ' + JSON.stringify(MAPS.town.connect || {}));
  out.push('THEMES ' + Object.keys(THEMES).join(',') + ' | CH2_THEMES ' + Object.keys(CH2_THEMES).join(','));
  out.push('battleBg ' + [...new Set(Object.values(MAPS).map(m => m.battleBg).filter(Boolean))].join(','));
  out.push('music ' + [...new Set(Object.values(MAPS).map(m => m.music).filter(Boolean))].join(','));
  out.push('ART ' + Object.keys(ART).filter(k => SPECIES[k] && !CH2_KEYS.has(k)).join(','));
  out.push('npc looks ' + [...new Set(Object.values(MAPS).flatMap(m => (m.npcs || []).map(n => n.look)))].join(','));
  out.push('families ' + [...new Set(Object.values(SPECIES).map(s => s.fam))].join(','));
  out.push('building kinds ' + Object.keys(BUILD_STYLE).join(','));
  return out.join('\n');
}));
