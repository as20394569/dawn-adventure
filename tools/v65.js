// audit: every gear special (SPECIALS / GEAR fx), affix and gear 'sp' stat key → where it is read in the code
module.exports = async (g) => {
  const data = await g.ev(() => { const fxUsed = {}; for (const k in GEAR) for (const f of GEAR[k].fx || []) (fxUsed[f] = fxUsed[f] || []).push(k);
    const spKeys = {}; for (const k in GEAR) for (const s in GEAR[k].sp || {}) (spKeys[s] = spKeys[s] || []).push(k);
    const stKeys = {}; for (const k in GEAR) for (const s in GEAR[k].st || {}) stKeys[s] = (stKeys[s] || 0) + 1;
    return JSON.stringify({ specials: Object.keys(SPECIALS), fxUsed, affix: Object.keys(AFFIX_TABLE), spKeys, stKeys, heroKeys: (__game.newGameState('x'), Object.keys(heroStats())) }); });
  require('fs').writeFileSync('build/fx_audit.json', data); const D = JSON.parse(data);
  g.log('specials', D.specials.length, 'fx on gear', Object.keys(D.fxUsed).length, 'affix', D.affix.join(','), '\nsp', JSON.stringify(Object.keys(D.spKeys)), '\nst', JSON.stringify(D.stKeys), '\nheroKeys', D.heroKeys.join(','));
  const missing = Object.keys(D.fxUsed).filter(f => !D.specials.includes(f)); g.log('fx on gear but not in SPECIALS:', missing.join(','));
};
