/* ===================== v14.15 抽卡・出牌的特效 =====================
   玩家：「應該要有抽卡特效 卡片特效」
   · 抽卡：卡從「牌庫」飛進手牌，途中翻面（先看到卡背），拖一點光點
   · 洗牌：棄牌堆的卡背飛回牌庫，寫「洗牌」
   · 出牌：卡飛到畫面中間、放大、外框發出卡種的顏色（攻擊紅・技能藍・能力金），然後碎成光片飛向目標（魔物／全體／HP 列）；
     消耗的卡變暗、冒出火星；能力卡在中間轉一圈金色的環 */
KD.TYPE_GLOW = { atk: '#ff6a4a', skl: '#6aa8ff', pow: '#ffd050' };
KD.cardBack = (x, X, Y, w, h) => { x.fillStyle = '#0c0814'; x.fillRect(X - 1, Y - 1, w + 2, h + 2); x.fillStyle = '#241a44'; x.fillRect(X, Y, w, h); x.fillStyle = '#c8a050'; x.fillRect(X, Y, w, 1); x.fillRect(X, Y + h - 1, w, 1); x.fillRect(X, Y, 1, h); x.fillRect(X + w - 1, Y, 1, h);
  x.fillStyle = '#3a2c66'; x.fillRect(X + 3, Y + 3, w - 6, h - 6); const cx = X + w / 2, cy = Y + h / 2, r = Math.min(w, h) * 0.22; x.fillStyle = '#ffd878'; x.beginPath(); x.moveTo(cx, cy - r); x.lineTo(cx + r * 0.7, cy); x.lineTo(cx, cy + r); x.lineTo(cx - r * 0.7, cy); x.closePath(); x.fill();
  x.fillStyle = '#3a2c66'; x.fillRect(Math.round(cx - 1), Math.round(cy - 1), 2, 2); };
KD.pileXY = () => { const LB = KD.BL(); return { x: 86, y: LB.hudY + 17 }; }; // v14.25: 牌庫・棄牌 sit at the right end of the bar's second row
KD.discXY = () => { const LB = KD.BL(); return { x: 112, y: LB.hudY + 17 }; };

/* ---------- 抽卡：從牌庫飛來、翻面 ---------- */
{ const _dn = BPK.drawN; BPK.drawN = function (n) { const shuffle = this.k14 && this.pile.length < n && this.disc.length > 0, h0 = this.hand.length; _dn.call(this, n); if (!this.k14) return;
    const P = KD.pileXY(), f = this.fK || 0, LB = KD.BL(); if (shuffle) { const D = KD.discXY(); for (let i = 0; i < 6; i++) (this.cfx16 = this.cfx16 || []).push({ k: 'back', x0: D.x - 8, y0: D.y - 12, x1: P.x - 8, y1: P.y - 12, t: -i * 2, T: 12 }); this.noteK('洗牌'); Sound.sfx('leaf'); }
    for (let i = h0, k = 0; i < this.hand.length; i++, k++) { const c = this.hand[i]; c.ax = P.x - LB.cw / 2; c.ay = P.y - LB.ch / 2; c.at = f + k * 3 + (shuffle ? 10 : 0); c.fl16 = c.at; } }; }
// the flip: a card back for the first half, then the face opening out
{ const _dc = KD.drawCard; KD.drawCard = function (x, c, X, Y, w, h, o = {}) { const b = Game.scene, f = b && b.fK || 0;
    if (!c || c.fl16 == null || !(b instanceof Battle)) return _dc.call(this, x, c, X, Y, w, h, o);
    const p = (f - c.fl16) / 12; if (p >= 1) { c.fl16 = null; return _dc.call(this, x, c, X, Y, w, h, o); } if (p < 0) return;
    if (p < 0.05 && !c.snd16) { c.snd16 = 1; Sound.sfx('tick'); }
    const sx = Math.max(0.08, Math.abs(Math.cos(p * Math.PI))), cx = X + w / 2; x.save(); x.translate(cx, 0); x.scale(sx, 1); x.translate(-cx, 0);
    try { if (p < 0.5) KD.cardBack(x, X, Y, w, h); else _dc.call(this, x, c, X, Y, w, h, { ...o, vis: w, visX0: 0 }); } finally { x.restore(); }
    if (b.cfx16 && f % 2 === 0) b.cfx16.push({ k: 'spark', x: cx + rnd(-6, 6), y: Y + h / 2 + rnd(-8, 8), vx: rnd(-4, 4) / 10, vy: -rnd(2, 6) / 10, t: 0, T: 14, c: pick(['#ffe8a0', '#ffffff', '#c8b0ff']) }); }; }

/* ---------- 出牌：飛到中間發光，碎成光片飛向目標 ---------- */
{ const _pk = BPK.playK; BPK.playK = function (i, tgt) { const c = this.hand[i], C = c && KD.CARDS[c.id], n0 = (this.ghosts || []).length; const r = _pk.call(this, i, tgt);
    if (!this.k14 || !C) return r; const g = (this.ghosts || [])[n0]; if (!g) return r; const LB = KD.BL();
    g.k16 = 1; g.T = 18; g.x1 = Math.round(W / 2 - LB.cw * 0.65); g.y1 = Math.round(KD.BL().hudY - LB.ch * 1.3 - 26); g.s1 = 1.3; g.col = KD.TYPE_GLOW[C.type]; g.exh = !!C.exhaust; g.pow = C.type === 'pow';
    const ctr = v => { const P = this.center(v); return { x: P.x, y: P.y }; }, foes = this.foes().filter(v => !v.gone);
    g.to = C.tg === 'all' || C.tg === 'rand' ? foes.map(ctr) : C.tg === 'enemy' ? [ctr(this.views[tgt] || foes[0] || this.H)].filter(Boolean) : [{ x: 70, y: LB.hudY + 6 }];
    Sound.sfx('select'); return r; }; }
{ const _dr = BPK.draw; BPK.draw = function (x) { if (!this.k14) return _dr.call(this, x); const mine = (this.ghosts || []).filter(g => g.k16); this.ghosts = (this.ghosts || []).filter(g => !g.k16);
    try { _dr.call(this, x); } finally { this.ghosts = (this.ghosts || []).concat(mine); }
    const LB = KD.BL(), F = this.cfx16 = this.cfx16 || [];
    for (const g of mine) { g.t++; const k = Math.min(1, g.t / 10), e = 1 - Math.pow(1 - k, 3), s = 1 + (g.s1 - 1) * e, X = lerp(g.x0, g.x1, e), Y = lerp(g.y0, g.y1, e), w = Math.round(LB.cw * s), h = Math.round(LB.ch * s), fade = g.t <= 12 ? 1 : Math.max(0, 1 - (g.t - 12) / 6);
      x.globalAlpha = fade; const glow = 0.5 + 0.5 * Math.sin(g.t / 2); x.fillStyle = g.col; x.globalAlpha = fade * (0.35 + 0.35 * glow); x.fillRect(Math.round(X) - 3, Math.round(Y) - 3, w + 6, h + 6); x.globalAlpha = fade;
      KD.drawCard(x, g.c, Math.round(X), Math.round(Y), w, h, {}); if (g.exh && g.t > 6) { x.fillStyle = 'rgba(20,6,0,' + Math.min(0.6, (g.t - 6) / 10).toFixed(2) + ')'; x.fillRect(Math.round(X), Math.round(Y), w, h); }
      if (g.t > 9 && g.t < 13) { x.fillStyle = '#ffffff'; x.globalAlpha = 0.5 * fade; x.fillRect(Math.round(X), Math.round(Y), w, h); } x.globalAlpha = 1;
      const cx = X + w / 2, cy = Y + h / 2;
      if (g.t === 12) { // the burst
        for (const T of g.to || []) for (let i = 0; i < (g.to.length > 1 ? 7 : 12); i++) F.push({ k: 'shard', x: cx + rnd(-w / 3, w / 3), y: cy + rnd(-h / 3, h / 3), tx: T.x + rnd(-6, 6), ty: T.y + rnd(-6, 6), t: -i, T: 12, c: i % 3 ? g.col : '#ffffff', a: Math.random() * 6 });
        for (const T of g.to || []) F.push({ k: 'ring', x: T.x, y: T.y, r0: 2, r1: 16, t: -12, T: 10, c: g.col });
        if (g.pow) F.push({ k: 'ring', x: cx, y: cy, r0: 6, r1: 40, t: 0, T: 16, c: '#ffd050' });
        if (g.exh) { for (let i = 0; i < 14; i++) F.push({ k: 'spark', x: cx + rnd(-w / 2, w / 2), y: cy + rnd(-h / 2, h / 2), vx: rnd(-3, 3) / 10, vy: -rnd(4, 12) / 10, t: 0, T: 20, c: pick(['#ff9a40', '#ff5020', '#ffd060']) }); F.push({ k: 'txt', s: '消耗', x: cx, y: cy - h / 2 - 4, t: 0, T: 26, c: '#ffb070' }); } } }
    for (const g of mine) if (g.t >= g.T) this.ghosts.splice(this.ghosts.indexOf(g), 1);
    // the little things that fly
    for (const p of F) { p.t++; if (p.t < 0) continue; const k = p.t / p.T, a = Math.max(0, 1 - k); x.globalAlpha = Math.min(1, a * 1.4);
      if (p.k === 'spark') { p.x += p.vx; p.y += p.vy; x.fillStyle = p.c; x.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
      else if (p.k === 'shard') { const e = k * k, X = lerp(p.x, p.tx, e) + Math.sin(k * Math.PI) * 10 * Math.cos(p.a), Y = lerp(p.y, p.ty, e) - Math.sin(k * Math.PI) * 14; x.fillStyle = p.c; x.fillRect(Math.round(X), Math.round(Y), 2, 2); x.globalAlpha *= 0.4; x.fillRect(Math.round(X - 1), Math.round(Y + 2), 1, 2); }
      else if (p.k === 'ring') { const r = lerp(p.r0, p.r1, k); x.strokeStyle = p.c; x.lineWidth = 2; x.beginPath(); x.arc(p.x, p.y, r, 0, 7); x.stroke(); }
      else if (p.k === 'txt') { Font.drawC(x, p.s, p.x, p.y - p.t * 0.4, p.c, '#000', 9); }
      else if (p.k === 'back') { const e = 1 - Math.pow(1 - Math.min(1, k), 2); x.globalAlpha = 1; KD.cardBack(x, Math.round(lerp(p.x0, p.x1, e)), Math.round(lerp(p.y0, p.y1, e) - Math.sin(e * Math.PI) * 18), 16, 24); }
      x.globalAlpha = 1; }
    this.cfx16 = F.filter(p => p.t < p.T); }; }
