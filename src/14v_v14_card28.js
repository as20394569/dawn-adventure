/* ===================== v14.29 卡面重畫 =====================
   玩家：「卡片請畫好 該在外框內就不要超出 還有卡片ui設計排版有問題 沒有利用的空間太多」「大小圖都善用每一個空間」
   · 所有字和小牌子都在框裡、離框至少 2（大卡 3）；放不下就縮小一號，不壓扁、不貼框
   · 小卡（手牌・牌組）：圖 → 卡名條 → 效果區（高度固定，每張卡的圖和卡名同一高度）
       有小牌子：「數字 單位」同一行＋下面一排小牌子；沒有小牌子：數字在上、單位在下，把效果區填滿
   · 大卡（選到的卡・選卡畫面）：圖的高度跟著說明的行數變——說明短圖就大、說明長圖就小，卡上不留空白 */
KD.U28 = { 全體傷害: '全體', 隨機傷害: '隨機' };
// v14.31 the small card's sizes in one place (玩家：「小卡圖中文字跟數字還是太大」)
KD.Z28 = { name: 5, num: 5, lab: 5, chip: 5, cost: 5, nh: 8, r: 3.5, row: 7, chipH: 7 }; // v14.31: two sizes down; v14.33（玩家：「傷害數字跟一般文字一樣 不用特別突出 有顏色就好」）: the number is the same size as the words, only its colour marks it — 「6 傷害」 on one line. The sizes are now the real sizes (14x: the old 'smallest 8' rule had drawn every one of them 8 high), so 5 is plenty small
KD.drawCard = function (x, c, X, Y, w, h, o = {}) { const C = KD.CARDS[c.id]; if (!C) return; const T = KD.TYPE[C.type], P = KD.C3, v = KD.val(c), big = w >= 46, gold = C.rar === 'L', qst = C.rar === 'Q', gear = !!c.g16, CL = KD.CLASSES[C.cls];
  const kc = big ? 2 : 1, edge = o.on ? '#ffe070' : gold ? '#ffcf6a' : qst ? '#5ce0b8' : gear ? '#dfe4f0' : P.line, B = (s, z) => Font.w('700', () => Font.width(s, z));
  // the frame (the picked card keeps its glow; that is the only thing outside the frame)
  if (o.on) KD.rr3(x, X - 2, Y - 2, w + 4, h + 4, 'rgba(255,224,112,0.45)', kc);
  if (o.on) KD.rr3(x, X - 1, Y - 1, w + 2, h + 2, '#ffe070', kc); KD.rr3(x, X, Y, w, h, edge, kc); /* v14.32（玩家：「小牌時黑色框會超出外框」）: no black line round the outside any more — the card's own frame is its edge */ KD.rr3(x, X + 1, Y + 1, w - 2, h - 2, P.body, kc);
  // the inside of the frame, and the part of it the text may use
  const ix = X + 1, iy = Y + 1, iw = w - 2, ih = h - 2, pd = big ? 3 : 2, vw = Math.min(w, o.vis || w), v0 = X + (o.visX0 || 0);
  const lx = Math.max(ix + pd, v0 + 2), rx = Math.min(ix + iw - pd, v0 + vw - 2), cx = (lx + rx) / 2, tw = Math.max(8, rx - lx);
  // what the card says: the main number (with its unit) and the rest
  const L = KD.shortL(C, v), n0 = L.findIndex(s => KD.numOf(s)), ni = n0 >= 0 ? n0 : L.findIndex(s => KD.numOf28(s)), N = ni >= 0 ? KD.numOf28(L[ni]) : null, rest = L.filter((s, k) => k !== ni);
  const S = KD.Z28, zN = big ? 10 : S.num, zL = big ? 5 : S.lab, zC = S.chip, nh = big ? 12 : S.nh, zName = big ? 7 : S.name, EA = S.row + S.chipH + 2; /* EA: the small card's effect area */
  // ---- sizes of each part ----
  let ah, foot = 0, lines = 0, word = null, chips = [], inline = false, unit = N ? N.lab : '';
  if (big) { foot = h >= 74 ? 10 : 0; const mainH = 0 /* v14.33: no separate big number — the sentence already shows it, coloured */, maxL = KD.lines3(KD.desc(c), tw, 6), room = ih - nh - foot - 4;
    lines = Math.max(0, Math.min(maxL, Math.floor((room - mainH - (o.noArt ? 15 : 28)) / 8)));
    ah = o.noArt ? 15 : clamp(room - mainH - lines * 8, 28, 58); }
  else { ah = ih - nh - EA;
    if (!N && rest.length) word = rest.shift();
    for (const s of rest) { const ww = Math.ceil(B(s, zC)) + 3; if (chips.reduce((a, q) => a + q[1] + 1, 0) + ww > tw) break; chips.push([s, ww]); }
    if (N) { const wn = B(N.s, zN); if (wn + 2 + B(unit, zL) <= tw) inline = true; else if (KD.U28[unit] && wn + 2 + B(KD.U28[unit], zL) <= tw) { inline = true; unit = KD.U28[unit]; } else { inline = true; unit = ''; } } }
  // ① the picture, the cost on it (and a big card's type)
  const art = KD.ART && KD.ART[c.id] && KD.ART[c.id].ok ? KD.ART[c.id] : null, sc = big ? ah / 32 : Math.max(1, ah / 32) /* a small card's picture stays 1× (pixel art is never shrunk; its sides are cut) */, tc = gold ? (() => { const s = x.createLinearGradient(ix, 0, ix + iw, 0); s.addColorStop(0, '#ffcf6a'); s.addColorStop(0.5, '#ff9a2a'); s.addColorStop(1, '#ffe08a'); return s; })() : T.c;
  x.fillStyle = T.bg; x.fillRect(ix, iy, iw, ah); x.save(); x.beginPath(); x.rect(ix, iy, iw, ah); x.clip(); x.imageSmoothingEnabled = false;
  if (!o.noArt) { if (art) x.drawImage(art, Math.round(ix + (iw - 48 * sc) / 2), Math.round(iy + (ah - 32 * sc) / 2), Math.round(48 * sc), Math.round(32 * sc));
    else { const ic = KD.ICON[KD.iconOf(c.id)], k = Math.max(1, Math.floor(Math.min(ah - 4, iw - 4) / 13)); if (ic) x.drawImage(ic, Math.round(ix + iw / 2 - 6.5 * k), Math.round(iy + (ah - 13 * k) / 2), 13 * k, 13 * k); } }
  if (gold) { const s = x.createLinearGradient(ix, iy, ix + iw, iy + ah); s.addColorStop(0.3, 'rgba(255,230,160,0)'); s.addColorStop(0.45, 'rgba(255,230,160,0.22)'); s.addColorStop(0.6, 'rgba(255,230,160,0)'); x.fillStyle = s; x.fillRect(ix, iy, iw, ah); }
  x.fillStyle = tc; x.fillRect(ix, iy, iw, 2); x.restore();
  x.fillStyle = edge; x.fillRect(ix, iy, kc, 1); x.fillRect(ix + iw - kc, iy, kc, 1); if (kc > 1) { x.fillRect(ix, iy + 1, 1, 1); x.fillRect(ix + iw - 1, iy + 1, 1, 1); } // the rounded corners, over the picture
  if (gear && !o.on) { x.fillStyle = '#8a94ae'; x.fillRect(X + 2, Y + 1, w - 4, 1); x.fillRect(X + 2, Y + h - 2, w - 4, 1); x.fillRect(X + 1, Y + 2, 1, h - 4); x.fillRect(X + w - 2, Y + 2, 1, h - 4); }
  // ② the name on its own band, the type's colour along its top
  const nb = iy + ah, nm = KD.name(c); x.fillStyle = '#10121a'; x.fillRect(ix, nb, iw, nh); x.fillStyle = tc; x.fillRect(ix, nb, iw, 1);
  // v14.30（玩家：「卡片的費用跟技能裝備名詞不用遮住卡圖」）: the cost sits at the left end of the name band, the name in the rest of it; the type moved to the big card's footer
  { const r = big ? 5 : S.r, ccx = Math.max(ix + 1 + r + 0.5, v0 + 1 + r + 0.5), ccy = nb + 1 + (nh - 1) / 2; KD.coin3(x, ccx, ccy, r, KD.cost(c), o.dim, big ? 7 : S.cost);
    const a0 = ccx + r + 2, a1 = rx, aw = Math.max(8, a1 - a0); let z = zName; while (z > 3.5 && B(nm, z) > aw) z -= 0.5; Font.w('700', () => KD.tc(x, nm, (a0 + a1) / 2, ccy, c.up ? '#a8ffa0' : '#ffffff', '#000', z, aw)); }
  // ③ the words under the name
  const top = nb + nh, col = N ? KD.numCol28(N, P) : P.top;
  const fitZ = (s, z) => { while (z > 3.5 && B(s, z) > tw) z -= 0.5; return z; };
  if (!big) { const A = ih + iy - top; // the effect area (the same height on every small card)
    if (inline) { const my = chips.length ? top + 1 + S.row / 2 : top + A / 2, wn = B(N.s, zN), wu = unit ? B(unit, zL) : 0, tot = wn + (unit ? 2 + wu : 0), x1 = cx - tot / 2;
      Font.w('700', () => { KD.tc(x, N.s, x1 + wn / 2, my, col, '#000', zN); if (unit) KD.tc(x, unit, x1 + wn + 2 + wu / 2, my, P.lab, null, zL); }); }
    else if (N) { const r1 = zN + 2, r2 = zL + 2, blk = r1 + r2, y0 = top + Math.floor((A - blk) / 2); Font.w('700', () => { KD.tc(x, N.s, cx, y0 + r1 / 2, col, '#000', fitZ(N.s, zN), tw); KD.tc(x, unit, cx, y0 + r1 + r2 / 2, P.lab, null, fitZ(unit, zL), tw); }); }
    else if (word) { const z = fitZ(word, S.lab), y = chips.length ? top + 1 + S.row / 2 : top + A / 2; Font.w('700', () => KD.tc(x, word, cx, y, P.top, '#000', z, tw)); }
    if (chips.length) { const ch2 = S.chipH, cy = top + A - 1 - ch2, tot = chips.reduce((a, q) => a + q[1] + 1, -1); let zx = Math.round(cx - tot / 2);
      for (const [s, ww] of chips) { const [bg, fc] = KD.chip26(s); x.fillStyle = bg; x.fillRect(zx, cy, ww, ch2); Font.w('700', () => KD.tc(x, s, zx + ww / 2, cy + ch2 / 2, fc, null, zC)); zx += ww + 1; } } }
  else { const bot = iy + ih - foot - 1, mainH = 0, blk = mainH + lines * 8, y0 = top + Math.max(1, Math.floor((bot - top - blk) / 2));
    if (N && mainH) { const wn = B(N.s, zN), wu = B(N.lab, zL), tot = wn + 3 + wu, x1 = cx - tot / 2; Font.w('700', () => { KD.tc(x, N.s, x1 + wn / 2, y0 + 6, col, '#000', zN); KD.tc(x, N.lab, x1 + wn + 3 + wu / 2, y0 + 7, P.lab, null, zL); }); }
    if (lines > 0) { x.save(); x.beginPath(); x.rect(ix, y0 + mainH, iw, lines * 8 + 1); x.clip(); KD.rich3(x, KD.desc(c), cx, y0 + mainH, tw, lines, P, 6, 8); x.restore(); }
    if (foot) { const fy = iy + ih - foot; x.fillStyle = '#262935'; x.fillRect(ix + pd, fy, iw - 2 * pd, 1);
      const cn = gear ? '裝備' : C.cls === 'nt' ? (qst ? '任務' : '通用') : CL ? CL.n : '', ce = ix + pd + Math.ceil(B(cn, 5)), se = ix + iw - pd - 18; Font.w('700', () => Font.draw(x, cn, ix + pd, fy + 5 - 8, gear ? '#c8d0e0' : P.foot, null, 5));
      Font.w('700', () => KD.tc(x, T.n, (ce + se) / 2, fy + 5, gold ? P.dmg : P.pill[C.type], null, 5, se - ce - 2)); /* the type (攻擊・技能・能力) between the class and the stars, off the picture */
      const n = P.stars[C.rar] || 1, rc = KD.RAR[C.rar].c; for (let i = 0; i < 3; i++) KD.star3(x, ix + iw - pd - (3 - i) * 6 + 1, fy + 3, i < n ? rc : P.off); } }
  if (o.dim) KD.rr3(x, X, Y, w, h, 'rgba(0,0,0,0.38)', kc); };
