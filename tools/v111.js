// pacing table: battles needed per level for the v8 chapter-1 areas
module.exports = async (g) => {
  const r = await g.ev(() => {
    const out = []; const areas = { route: ['wolf', 'mush', 'flower', 'bird'], windHills: ['hornHare', 'strawCrow', 'gustSprite'], jadeCreek: ['mossTurtle', 'streamSnake', 'mireFly'] };
    const encLv = m => { const M = MAPS[m]; const E = M && (M.encounters || M.enc || M.wild); return E ? JSON.stringify(E).slice(0, 200) : 'n/a'; };
    for (const m in areas) out.push(m + ' enc: ' + encLv(m));
    for (let lv = 1; lv <= 18; lv++) { const need = expForLevel(lv + 1) - expForLevel(lv); out.push('Lv' + lv + ' need ' + need); }
    for (const sp of ['hornHare', 'strawCrow', 'gustSprite', 'mossTurtle', 'streamSnake', 'mireFly', 'millGolem', 'blackCatfish', 'wolf', 'croc']) { const S = SPECIES[sp]; out.push(sp + ' baseExp ' + S.exp + ' panelLv ' + (MON_PANEL[sp] && MON_PANEL[sp].lv)); }
    return out.join('\n');
  });
  g.log(r);
};
