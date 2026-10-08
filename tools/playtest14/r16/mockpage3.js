window.__mockInstall = function () {
  const art = id => (KD.ART[id] && KD.ART[id].ok ? KD.ART[id] : null);
  const TC = { atk: ['#b4483a', '#6a2018', '#e88a70'], skl: ['#4a70b8', '#1c3060', '#8ab0f0'], pow: ['#c09a38', '#5a4410', '#f0d070'] };
  const gearC = ['#c8ccd8', '#6a7088', '#f4f6fc'], goldC = ['#e0a838', '#6a4810', '#ffe090'];
  const colOf = c => { const C = KD.CARDS[c.id]; return C.rar === 'L' ? goldC : c.g16 ? gearC : TC[C.type]; };
  const rect = (x, X, Y, w, h, c) => { x.fillStyle = c; x.fillRect(X, Y, w, h); };
  const box = (x, X, Y, w, h, c) => { rect(x, X, Y, w, 1, c); rect(x, X, Y + h - 1, w, 1, c); rect(x, X, Y, 1, h, c); rect(x, X + w - 1, Y, 1, h, c); };
  const drawArt = (x, c, X, Y, w, h) => { const im = art(c.id); if (!im) return; const sw = Math.min(48, w), sh = Math.min(32, h); x.drawImage(im, Math.round((48 - sw) / 2), Math.round((32 - sh) / 2), sw, sh, X + Math.round((w - sw) / 2), Y + Math.round((h - sh) / 2), sw, sh); };
  const effect = (x, c, X, Y, w, foot, col, numCol, lab) => { const C = KD.CARDS[c.id], L = KD.shortL(C, KD.val(c)), N = KD.numOf(L[0]); let ly = Y;
    if (N) { const lb = N.s.includes('×') ? '' : (N.lab), lw = lb ? Font.width(lb, 8) + 2 : 0, nw = Math.min(Font.width(N.s, 10), w - 4 - lw), gx = Math.round(X + w / 2 - (lw + nw) / 2); if (lb) Font.draw(x, lb, gx, ly + 1, lab, null, 8); fontFit(x, N.s, gx + lw, ly - 1, w - 4 - lw, numCol(N), null, 10); ly += 12; L.slice(1).forEach(s => { if (ly + 9 > foot) return; fontFit(x, s, X + w / 2, ly, w - 4, col, null, 8, 'c'); ly += 9; }); }
    else L.forEach(s => { if (ly + 9 > foot) return; fontFit(x, s, X + w / 2, ly, w - 4, col, null, 8, 'c'); ly += 9; }); };
  // D1 書頁：金屬細框＋米色紙面，卡名在圖下緣的緞帶，深色字
  const D1 = (x, c, X, Y, w, h) => { const K = colOf(c), big = w >= 46, ah = big ? 32 : Math.round(h * 0.4);
    rect(x, X - 1, Y - 1, w + 2, h + 2, '#20140c'); rect(x, X, Y, w, h, K[0]); rect(x, X, Y, w, 1, K[2]); rect(x, X, Y, 1, h, K[2]); rect(x, X + 1, Y + h - 1, w - 1, 1, K[1]); rect(x, X + w - 1, Y + 1, 1, h - 1, K[1]);
    rect(x, X + 2, Y + 2, w - 4, h - 4, '#ead9b4'); rect(x, X + 2, Y + h - 4, w - 4, 2, '#d4bf94');
    rect(x, X + 3, Y + 3, w - 6, ah, '#2a1c14'); drawArt(x, c, X + 4, Y + 4, w - 8, ah - 2);
    const ry = Y + ah - 2; rect(x, X + 1, ry, w - 2, 10, K[1]); rect(x, X + 2, ry + 1, w - 4, 8, K[0]); rect(x, X, ry + 2, 1, 6, K[1]); rect(x, X + w - 1, ry + 2, 1, 6, K[1]);
    fontFit(x, KD.name(c), X + w / 2, ry - 1, w - 6, c.up ? '#d8ffc8' : '#fff8e8', '#20140c', 8, 'c');
    effect(x, c, X + 2, ry + 12, w - 4, Y + h - 4, '#4a3420', N => (N.lab === '格擋' ? '#2a4a90' : '#9a2a18'), '#7a6040');
    KD.gem(x, X + 5, Y + 5, KD.cost(c), 5.5, false); const a = KD.atOf(c.id); if (a) KD.atBox(x, X + w - 12, Y + 2, a); };
  // D2 暗金拱窗：深色卡身、金色雙線框和角花，卡圖在拱形窗裡，卡種是頂端的小寶石
  const D2 = (x, c, X, Y, w, h) => { const C = KD.CARDS[c.id], K = colOf(c), big = w >= 46, ah = big ? 34 : Math.round(h * 0.42), G = c.g16 ? '#d8dce8' : C.rar === 'L' ? '#ffc040' : '#c8a050';
    rect(x, X - 1, Y - 1, w + 2, h + 2, '#06040a'); rect(x, X, Y, w, h, '#16121f'); box(x, X, Y, w, h, G); box(x, X + 2, Y + 2, w - 4, h - 4, 'rgba(200,160,80,0.45)');
    for (const [a, b] of [[X + 1, Y + 1], [X + w - 3, Y + 1], [X + 1, Y + h - 3], [X + w - 3, Y + h - 3]]) rect(x, a, b, 2, 2, G);
    const ax = X + 4, aw = w - 8, ay = Y + 5; x.save(); x.beginPath(); x.moveTo(ax, ay + ah); x.lineTo(ax, ay + 7); x.quadraticCurveTo(ax, ay, ax + 7, ay); x.lineTo(ax + aw - 7, ay); x.quadraticCurveTo(ax + aw, ay, ax + aw, ay + 7); x.lineTo(ax + aw, ay + ah); x.closePath(); x.fillStyle = K[1]; x.fill(); x.clip(); drawArt(x, c, ax, ay, aw, ah); x.restore();
    x.strokeStyle = G; x.lineWidth = 1; x.beginPath(); x.moveTo(ax - 0.5, ay + ah + 0.5); x.lineTo(ax - 0.5, ay + 6.5); x.quadraticCurveTo(ax - 0.5, ay - 0.5, ax + 6.5, ay - 0.5); x.lineTo(ax + aw - 6.5, ay - 0.5); x.quadraticCurveTo(ax + aw + 0.5, ay - 0.5, ax + aw + 0.5, ay + 6.5); x.lineTo(ax + aw + 0.5, ay + ah + 0.5); x.closePath(); x.stroke();
    const cx = X + w / 2; x.fillStyle = '#06040a'; x.beginPath(); x.moveTo(cx, Y + 1); x.lineTo(cx + 4, Y + 5); x.lineTo(cx, Y + 9); x.lineTo(cx - 4, Y + 5); x.fill(); x.fillStyle = TC[C.type][2]; x.beginPath(); x.moveTo(cx, Y + 2); x.lineTo(cx + 3, Y + 5); x.lineTo(cx, Y + 8); x.lineTo(cx - 3, Y + 5); x.fill();
    const ny = ay + ah + 1; fontFit(x, KD.name(c), cx, ny, w - 6, c.up ? '#a8ffa0' : '#ffe6a8', '#000', 8, 'c'); rect(x, X + 6, ny + 11, w - 12, 1, 'rgba(200,160,80,0.5)');
    effect(x, c, X + 2, ny + 14, w - 4, Y + h - 4, '#d8d0e8', N => (N.lab === '格擋' ? '#a8d8ff' : '#ffb898'), '#9a90b0');
    KD.gem(x, X + 5, Y + 5, KD.cost(c), 5.5, false); const a = KD.atOf(c.id); if (a) KD.atBox(x, X + w - 12, Y + 2, a); };
  // D3 鐵框銘牌：厚的金屬框（顏色＝稀有度），卡圖凹進去，卡名是一塊鉚釘銘牌，說明在深色的凹槽裡
  const RM = { B: ['#8a8a98', '#4a4a58', '#c8c8d4'], C: ['#a8b0c0', '#566070', '#e4e8f0'], U: ['#5a8ad0', '#24406a', '#a8d0ff'], R: ['#a868d8', '#4a2468', '#e0b8ff'], L: ['#e0a838', '#6a4810', '#ffe090'], Q: ['#4ac8a0', '#1a5a48', '#a8f0d8'], T: ['#8a8a98', '#4a4a58', '#c8c8d4'] };
  const D3 = (x, c, X, Y, w, h) => { const C = KD.CARDS[c.id], M = c.g16 ? gearC : RM[C.rar], T = TC[C.type], big = w >= 46, ah = big ? 32 : Math.round(h * 0.4);
    rect(x, X - 1, Y - 1, w + 2, h + 2, '#08060c'); rect(x, X, Y, w, h, M[0]); rect(x, X, Y, w, 1, M[2]); rect(x, X, Y, 1, h, M[2]); rect(x, X, Y + h - 1, w, 1, M[1]); rect(x, X + w - 1, Y, 1, h, M[1]);
    rect(x, X + 2, Y + 2, w - 4, h - 4, T[1]); rect(x, X + 2, Y + 2, w - 4, 1, '#08060c'); rect(x, X + 2, Y + 2, 1, h - 4, '#08060c');
    rect(x, X + 3, Y + 3, w - 6, ah, '#08060c'); drawArt(x, c, X + 4, Y + 4, w - 8, ah - 1); rect(x, X + 3, Y + 3 + ah, w - 6, 1, 'rgba(255,255,255,0.18)');
    const py = Y + ah + 5; rect(x, X + 3, py, w - 6, 11, M[1]); rect(x, X + 3, py, w - 6, 10, M[0]); rect(x, X + 3, py, w - 6, 1, M[2]); rect(x, X + 4, py + 4, 1, 1, M[1]); rect(x, X + w - 5, py + 4, 1, 1, M[1]);
    fontFit(x, KD.name(c), X + w / 2, py - 2, w - 10, c.up ? '#1a5a10' : '#16101e', null, 8, 'c');
    const ty = py + 13; rect(x, X + 3, ty, w - 6, Y + h - 4 - ty, 'rgba(0,0,0,0.35)'); effect(x, c, X + 3, ty + 2, w - 6, Y + h - 4, '#e8e4f4', N => (N.lab === '格擋' ? '#a8d8ff' : '#ffc0a0'), '#b0a8c0');
    KD.gem(x, X + 5, Y + 5, KD.cost(c), 5.5, false); const a = KD.atOf(c.id); if (a) KD.atBox(x, X + w - 12, Y + 2, a); };
  const F = { D1, D2, D3 };
  window.__mockDraw = (x, rows, cards, big) => { x.fillStyle = '#16121e'; x.fillRect(0, 0, W, H);
    rows.forEach(([n, k], r) => { const Y = 4 + r * 84; Font.draw(x, n, 4, Y - 2, '#ffe0a0', '#000', 9); cards.forEach((c, i) => F[k](x, c, 4 + i * 43, Y + 12, 35, 68)); });
    if (big) big.forEach(([n, k], i) => { const X = 3 + i * 58, Y = 4; Font.draw(x, n, X, Y - 2, '#ffe0a0', '#000', 9); F[k](x, { id: 'rg_venom' }, X, Y + 12, 54, 80); F[k](x, { id: 'sw_defend', up: 1, g16: 1 }, X, Y + 98, 54, 80); }); };
};
