/* ===================== v25 萌芽鎮的鐵匠舖 (request: "the smith should have his own smithy") =====================
   The town grows south by 5 rows; a stone smithy stands at the bottom right (door at 15,22). Inside: the smith at his
   anvil, a two-tile forge against the back wall, weapon racks and a quench tub. */
const SMITHY_ART = (() => {
  const mk = (w, h, f) => { const c = mkCanvas(w, h), x = c.getContext('2d'); f(x); return c; }, R = (x, c, X, Y, w, h) => { x.fillStyle = c; x.fillRect(X, Y, w, h); };
  const forge = mk(32, 22, x => {
    R(x, '#1a1418', 3, 0, 26, 5); R(x, '#3e3a44', 4, 1, 24, 3); R(x, '#5a5662', 4, 1, 24, 1);            // hood
    R(x, '#1a1418', 1, 4, 30, 18); R(x, '#6a6470', 2, 5, 28, 16);                                         // stone body
    for (let y = 5, row = 0; y < 21; y += 4, row++) { R(x, '#4e4854', 2, y + 3, 28, 1); for (let i = (row % 2) * 4 + 2; i < 30; i += 8) R(x, '#4e4854', i, y, 1, 3); }
    R(x, '#8a8490', 2, 5, 28, 1);
    R(x, '#1a1418', 6, 9, 20, 11); R(x, '#2a0c08', 7, 10, 18, 9);                                         // mouth
    const g = x.createRadialGradient(16, 17, 1, 16, 17, 11); g.addColorStop(0, 'rgba(255,200,90,0.95)'); g.addColorStop(0.5, 'rgba(255,110,30,0.7)'); g.addColorStop(1, 'rgba(120,20,0,0)'); x.fillStyle = g; x.fillRect(7, 10, 18, 9);
    R(x, '#ff6020', 8, 16, 16, 3); R(x, '#ffb040', 10, 15, 12, 2); R(x, '#fff0a0', 13, 14, 6, 2); R(x, '#fff8d8', 15, 13, 2, 1);
    for (const [a, b] of [[10, 13], [12, 12], [19, 12], [21, 13], [16, 11]]) R(x, '#ffd060', a, b, 1, 1);
    R(x, '#1a1418', 5, 20, 22, 2); R(x, '#3a3640', 6, 20, 20, 1);                                         // sill
  });
  const half = i => mk(16, 22, x => x.drawImage(forge, i * 16, 0, 16, 22, 0, 0, 16, 22));
  const anvil = mk(16, 16, x => {
    R(x, '#1a1418', 4, 12, 8, 4); R(x, '#3a3a44', 5, 12, 6, 3);
    R(x, '#1a1418', 6, 8, 4, 5); R(x, '#4a4a56', 7, 8, 2, 4);
    R(x, '#1a1418', 1, 5, 14, 4); R(x, '#5a5a66', 2, 6, 12, 2); R(x, '#9a9ea8', 2, 6, 12, 1); R(x, '#1a1418', 0, 6, 2, 2); R(x, '#5a5a66', 1, 6, 1, 1);
    R(x, '#1a1418', 6, 3, 6, 3); R(x, '#ff8030', 7, 4, 4, 1); R(x, '#fff0a0', 8, 4, 2, 1);               // a glowing blank
  });
  const rack = (blade, extra) => mk(16, 22, x => {
    R(x, '#1a1418', 0, 3, 16, 3); R(x, '#6a4428', 1, 4, 14, 1); R(x, '#1a1418', 0, 17, 16, 4); R(x, '#6a4428', 1, 18, 14, 2);
    R(x, '#1a1418', 1, 3, 3, 19); R(x, '#5a3a24', 2, 4, 1, 17); R(x, '#1a1418', 12, 3, 3, 19); R(x, '#5a3a24', 13, 4, 1, 17);
    for (const X of [5, 9]) { R(x, '#1a1418', X - 1, 1, 3, 16); R(x, blade, X, 2, 1, 14); R(x, '#ffffff', X, 2, 1, 3); R(x, '#1a1418', X - 2, 12, 5, 2); R(x, '#c8a040', X - 1, 12, 3, 1); R(x, '#4a2a1a', X, 14, 1, 3); }
    if (extra) extra(x);
  });
  const tub = mk(16, 16, x => { R(x, '#1a1418', 2, 4, 12, 12); R(x, '#7a4a2a', 3, 5, 10, 10); R(x, '#5a3420', 3, 10, 10, 5); R(x, '#3a3a44', 3, 8, 10, 1); R(x, '#3a3a44', 3, 13, 10, 1); R(x, '#2a5a9a', 3, 5, 10, 2); R(x, '#8ac8ff', 5, 5, 3, 1); });
  return { forgeL: half(0), forgeR: half(1), anvil, rackA: rack('#c8d0dc'), rackB: rack('#9ab8e8'), tub };
})();
{ const _nf = npcFrames; npcFrames = function (look) { const im = SMITHY_ART[look]; if (im) return propFrames(im, im.height >= 22 ? 0 : 6); return _nf(look); }; }
BUILD_STYLE.smithy = { roof: '#4a4650', roofT: 'slate', wall: '#cfc4ae', beam: '#3a2a22', shut: '#8a3a24' };
{ const _bb = buildBuilding; buildBuilding = function (b) {
    const c = _bb(b); if (b.kind !== 'smithy') return c; const x = c.getContext('2d'), Wd = b.w * 16, Hd = b.h * 16, wy = Hd - 34;
    const winCols = []; for (let i = 0; i < b.w; i++) if (i !== b.door && (b.w <= 4 ? i === (b.door === 0 ? b.w - 1 : 0) || i === b.w - 1 && b.door !== b.w - 1 : (i === 1 || i === b.w - 2))) winCols.push(i);
    for (const i of winCols) { const gx = i * 16 + 4, Y = wy + 5, g = x.createLinearGradient(0, Y + 10, 0, Y); g.addColorStop(0, 'rgba(255,150,50,0.85)'); g.addColorStop(1, 'rgba(255,90,20,0.35)'); x.fillStyle = g; x.fillRect(gx, Y, 8, 10); }
    // the hanging sign: an anvil on the board (same spot the base code picks)
    const cands = [...Array(b.w).keys()].filter(i => i !== b.door && !winCols.includes(i)).sort((p, q) => Math.abs(p - b.door) - Math.abs(q - b.door) || q - p);
    const col = cands[0], sx = col * 16 + (col === 0 ? 4 : 1) + 1, sy = wy + 4 + 3, P = (X, Y, w, h, cc) => { x.fillStyle = cc; x.fillRect(sx + X, sy + Y, w, h); };
    P(1, 2, 8, 2, '#2e3038'); P(1, 2, 8, 1, '#9aa0aa'); P(0, 2, 1, 1, '#2e3038'); P(4, 4, 2, 2, '#2e3038'); P(2, 6, 6, 2, '#2e3038');
    return c;
  };
}
{ const T = MAPS.town; if (T.rows.length === 20) {
    T.rows = T.rows.slice(0, 19).concat([
      'TT.......y::........TT',
      'TT..f.b...::........TT',
      'TT....y...::........TT',
      'TT........::........TT',
      'TT.f......::::::....TT',
      'TTTTTTTTTTTTTTTTTTTTTT']);
    T.buildings.push({ kind: 'smithy', x: 13, y: 19, w: 5, h: 4, door: 2, to: ['smithy', 4, 6], sign: 1 });
    T.npcs = T.npcs.filter(n => n.id !== 'smith');
  }
  MAPS.smithy = { name: '鐵匠舖', music: 'town', wallPal: 'g',
    rows: ['xxxxxxxxxx', 'xkkxwwxxxx', 'nnnnnnnnnn', 'nnnnnnnnnn', 'nnnnnnnnnn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
    exit: { x: 4, y: 7, to: ['town', 15, 23] },
    npcs: [
      { id: 'smith', x: 6, y: 3, dir: 'left', look: 'man', name: '鐵匠' },
      { id: 'smForgeL', x: 7, y: 2, dir: 'down', look: 'forgeL' }, { id: 'smForgeR', x: 8, y: 2, dir: 'down', look: 'forgeR' },
      { id: 'smAnvil', x: 5, y: 3, dir: 'down', look: 'anvil' }, { id: 'smTub', x: 8, y: 4, dir: 'down', look: 'tub' },
      { id: 'smRackA', x: 0, y: 2, dir: 'down', look: 'rackA' }, { id: 'smRackB', x: 1, y: 2, dir: 'down', look: 'rackB' },
    ] };
  for (const k of ['town', 'smithy']) delete mapCache[k];
}
Object.assign(Events, {
  *smForgeL() { yield* say('爐火燒得正旺。靠近就覺得臉頰發燙。'); }, *smForgeR() { yield* say('爐火燒得正旺。靠近就覺得臉頰發燙。'); },
  *smAnvil() { yield* say('沉甸甸的鐵砧。上面放著一塊還在發紅的鐵胚。'); }, *smTub() { yield* say('淬火用的水桶。水面上還飄著一點白煙。'); },
  *smRackA() { yield* say('架上掛著鐵匠打好的劍。每一把都磨得發亮。'); }, *smRackB() { yield* say('架上掛著鐵匠打好的劍。刃上刻著小小的鐵鎚記號。'); },
});
if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.smith = '萌芽鎮・鐵匠舖';
// quest markers: someone inside the smithy also marks its door on the town map
{ const _qm = questMarks; questMarks = function (st = Game.st) { const M = _qm(st).map(m => m[0] === 'town' && m[1] === 13 && m[2] === 16 ? ['town', 15, 22] : m); if (M.some(m => m[0] === 'smithy')) M.push(['town', 15, 22]); return M; }; }
