/* ===================== v12.143 狀態標籤不寫回合・長按看詳情 =====================
   玩家 2026-10-12：「像速度-1這種狀態就不用寫回合了，改成長按顯示具體數值與剩餘3回合」
   · 能力變化（物攻＋1、速度−1…）和增益・減益（狂刃、裂甲…）的標籤只寫名字和階數，不再寫「3回」。
     中毒・灼傷這類異常的「中毒 3」照舊（v270 玩家要的）。戰鬥訊息「速度降低了！（3回合）」照舊。
   · 長按主角或魔物（約 0.4 秒、手指不移動）：旁邊跳出一個小框，列出牠身上每個狀態的具體數值和剩餘回合，放開就收起來。
     能力每一階 ×1.25（下降一階 ×0.8，兩階 ×0.67，三階 ×0.57）；中毒・灼傷每回合結束扣最大 HP 的 1/8（頭目 1/16）；
     麻痺 25% 不能行動・速度 ×0.25；睡眠不能行動。 */
const STD20 = { down: false, moved: false, f0: 0, x: 0, y: 0, v: null };
{ const cvs = document.getElementById('screen');
  if (cvs) { cvs.addEventListener('pointerdown', e => { const r = cvs.getBoundingClientRect(); if (!r.width) return; Object.assign(STD20, { down: true, moved: false, f0: Game.frame, v: null, cx: e.clientX, cy: e.clientY,
      x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * (H + TALL_EXT) - TALL_EXT }); });
    cvs.addEventListener('pointermove', e => { if (STD20.down && Math.hypot(e.clientX - STD20.cx, e.clientY - STD20.cy) > 14) STD20.moved = true; });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) cvs.addEventListener(ev, () => { STD20.down = false; STD20.v = null; }); }
  window.addEventListener('pointerup', () => { STD20.down = false; STD20.v = null; }); window.addEventListener('blur', () => { STD20.down = false; STD20.v = null; }); }

// 標籤不寫回合
{ const _bp = buffPills12; buffPills12 = function (b, v) { return _bp(b, v).map(([s, k]) => [s, k, '']); }; }

const pct20 = m => (m >= 1 ? '+' : '−') + Math.round(Math.abs(m - 1) * 100) + '%';
function stLines20(b, v) { const L = [], st = v.st || {}, D = v.bdur12 || {}, u = b.core && b.core.byId[v.id]; // [名字, 效果, 顏色, 剩幾回合]
  const ak = typeof ailOf12 === 'function' ? ailOf12(v) : null;
  if (ak && AIL12[ak]) { const A = AIL12[ak], mh = v.maxhp || (u && u.max.hp) || 0, q = v.boss ? 16 : 8, dot = Math.max(1, Math.floor(mh / q));
    const eff = ak === 'psn' || ak === 'brn' ? '每回合結束扣 ' + dot + ' HP（最大 HP 的 1/' + q + '）' : ak === 'par' ? '25% 不能行動・速度 ×0.25' : ak === 'slp' ? '不能行動' : '';
    L.push([A.n, eff, A.c, v.ailDur12]); }
  if (v.broken) L.push(['破防', '這回合不能行動・受到的傷害 +50%', '#ffd040']); else if (v.charging || st.charging) L.push(['蓄力中', '下回合放出大招（打破護盾可以打斷）', '#ff8a7a']);
  if (st.ward > 0) L.push(['護盾', '再吸收 ' + st.ward + ' 傷害', '#a8e0ff']);
  for (const k in STAGE_N12) { const n = st['stage_' + k]; if (!n) continue; const m = BR.stageMul(n);
    const eff = ['atk', 'def', 'spa', 'spd', 'spe'].includes(k) ? STAGE_N12[k] + ' ×' + (Math.round(m * 100) / 100) + '（' + pct20(m) + '）' : (n > 0 ? '提升 ' : '降低 ') + Math.abs(n) + ' 階';
    L.push([STAGE_N12[k] + (n > 0 ? '+' : '−') + Math.abs(n), eff, n > 0 ? '#ffc070' : '#a0c0ff', D['stage_' + k]]); }
  for (const id in BUFF12) if (st[id]) { const B = BUFF12[id]; L.push([B.n + (B.stacks ? '×' + st[id] : ''), B.tip || '', (BUFF_COL12[B.k] || BUFF_COL12.def)[0], D[id]]); }
  for (const k in KB12.BADGE) if (st[k] && !(ak && k === ak) && !BUFF12[k]) L.push([KB12.BADGE[k][0], '', KB12.BADGE[k][1]]);
  return L; }
// 按到的是誰：主角（下面的資料卡或身體附近）或最近的魔物（名牌或身體）
Battle.prototype.pickUnit20 = function (x, y) { const H0 = this.H; let best = null, bd = 1e9;
  if (H0 && !H0.gone && (y >= Math.round(this.boxH || HBAR_Y) - 24 || Math.hypot(x - this.center(H0).x, y - this.center(H0).y) < 30)) return H0;
  for (const v of this.foes()) { if (v.gone || !(v.alpha > 0.3)) continue; const C = this.center(v), onPlate = Math.abs(x - (v.x + (v.off ? v.off.x : 0))) < 52 && y >= v.foot - 4 && y <= v.foot + 34;
    const d = onPlate ? 0 : Math.hypot(x - C.x, y - C.y); if (d < Math.max(30, (v.bbh || 40) * 0.6) && d < bd) { bd = d; best = v; } }
  return best; };
Battle.prototype.drawStDetail20 = function (x) { const v = STD20.v; if (!v) return; const FS = 9, w = 166, X = (W - w) / 2;
  // 每個狀態兩行：名字（左）・剩幾回合（右）／效果（縮排、太長就換行）
  const items = stLines20(this, v).map(([n, e, c, d]) => ({ n, c, d: d > 0 ? '剩 ' + d + ' 回合' : '', e: e ? Font.wrap(e, w - 20, FS) : [] }));
  let h = 21; for (const it of items) h += 11 + it.e.length * 11 + 3; if (!items.length) h += 14; h += 2;
  const C = this.center(v), bh = Math.round(this.boxH || HBAR_Y); let Y = v.hero ? bh - 28 - h : Math.round(v.foot + 34);
  if (!v.hero && Y + h > bh - 16) Y = Math.max(4 - (TALL_EXT || 0), Math.round(C.y - (v.bbh || 40) / 2) - h - 4);
  x.save(); x.fillStyle = 'rgba(8,10,22,0.94)'; x.fillRect(X, Y, w, h); x.strokeStyle = 'rgba(200,214,255,0.55)'; x.lineWidth = 1; x.strokeRect(X + 0.5, Y + 0.5, w - 1, h - 1);
  Font.drawC(x, (v.n || '') + '的狀態', W / 2, Y + 2, UIC.warm, UIC.textSh, 10); x.fillStyle = 'rgba(200,214,255,0.3)'; x.fillRect(X + 6, Y + 17, w - 12, 1);
  let y = Y + 20; if (!items.length) { Font.drawC(x, '沒有能力變化或異常狀態', W / 2, y, UIC.muted, UIC.textSh, FS); y += 14; }
  for (const it of items) { Font.draw(x, it.n, X + 6, y, it.c, UIC.textSh, FS); if (it.d) Font.drawR(x, it.d, X + w - 6, y, '#e8ecf6', UIC.textSh, FS); y += 11;
    for (const s of it.e) { Font.draw(x, s, X + 14, y, '#c4cce0', UIC.textSh, FS); y += 11; } y += 3; }
  x.restore(); };
{ const _r = render; render = function () { _r(); const b = Game.scene; if (!(b instanceof Battle) || !STD20.down || STD20.moved || Game.frame - STD20.f0 < 24 || Game.fade > 0.5) { if (!STD20.down) STD20.v = null; return; }
    if (!STD20.v) STD20.v = b.pickUnit20(STD20.x, STD20.y) || null; if (!STD20.v) { STD20.moved = true; return; }
    ctx.save(); ctx.setTransform(SCALE, 0, 0, SCALE, 0, (TALL_EXT || 0) * SCALE); ctx.imageSmoothingEnabled = false; try { b.drawStDetail20(ctx); } finally { ctx.restore(); } }; }
// 第一次身上有能力變化時提示一次；戰鬥說明也寫進去
{ const H = Battle.prototype.handlers, _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) { yield* _ap.call(this, e, s, t, P); const st = Game.st;
    if (st && t && P && !P.failed && /^stage_/.test(P.status || '') && !st.flags.tutStd20) { st.flags.tutStd20 = 1; yield* this.msg('（長按主角或魔物，可以看能力變化的數值和剩餘回合。）', { hold: 40 }); } }; }
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.push(['看狀態', ['長按主角或魔物（約半秒，手指不要移動），會列出牠身上每個狀態的數值和剩餘回合，放開就收起來。', '能力每一階 ×1.25（下降一階 ×0.8）；中毒・灼傷每回合結束扣最大 HP 的 1/8（頭目 1/16）；麻痺 25% 不能行動、速度 ×0.25。']]);
