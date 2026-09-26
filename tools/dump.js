module.exports = async (g) => {
  const d = await g.ev(() => ({
    items: Object.fromEntries(Object.keys(ITEMS).map(k => [k, [ITEMS[k].n, ITEMS[k].cat]])),
    gear: Object.fromEntries(Object.keys(GEAR).map(k => [k, [GEAR[k].n, GEAR[k].slot, GEAR[k].t, GEAR[k].kind || '', GEAR[k].elem || '', (GEAR[k].fx || []).map(f => SPECIALS[f].n).join('、')]])),
    maps: Object.fromEntries(Object.keys(MAPS).map(k => [k, [MAPS[k].name, MAPS[k].type]])),
    sp: Object.fromEntries(Object.keys(SPECIES).map(k => [k, SPECIES[k].n])),
    npc: NPC_ROLES,
  }));
  require('fs').writeFileSync('build/catalog.json', JSON.stringify(d));
};
