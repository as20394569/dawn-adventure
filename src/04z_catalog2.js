/* ===================== v19 catalog pass: categories for everything added by the chapter-1 expansion ===================== */
for (const k in ITEMS) if (!ITEMS[k].cat) ITEMS[k].cat = itemCatOf(k);
Object.assign(SPECIALS.predator, { cat: '攻擊' }); Object.assign(SPECIALS.breaker, { cat: '攻擊' }); Object.assign(SPECIALS.poisonEdge, { cat: '攻擊' }); Object.assign(SPECIALS.spellblade, { cat: '攻擊' });
Object.assign(SPECIALS.swift, { cat: '攻擊' }); Object.assign(SPECIALS.shadowStep, { cat: '防禦' }); Object.assign(SPECIALS.mpGuard, { cat: '資源' });
