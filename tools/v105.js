module.exports = async (g) => g.log(await g.ev(() => {
  const o = []; for (const k of ['slime', 'mush', 'fox', 'bee', 'frog', 'wolf', 'croc', 'mossGiant', 'nightBird', 'leafFox']) { const s = SPECIES[k], p = MON_PANEL[k]; o.push(k + ' exp ' + s.exp + ' gold ' + s.gold + ' fam ' + s.fam + ' mat ' + s.mat + ' panel ' + JSON.stringify(p) + ' learn ' + JSON.stringify(s.learn)); }
  for (const [lv, r, k] of [[6, 'fast', 'wild'], [6, 'mage', 'wild'], [9, 'tank', 'wild'], [8, 'tank', 'boss'], [11, 'phys', 'boss']]) o.push('ch2Panel ' + lv + r + k + ' ' + JSON.stringify(ch2Panel(lv, r, k)));
  return o.join('\n');
}));
