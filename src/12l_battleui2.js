/* ===================== v12.87 戰鬥畫面重建（RPG 版） =====================
   玩家：「現在這個版本也進行一次戰鬥UI重建與排列 文字也進行統一」「合理運用空間 然後UI圖可以不用像素形成一個反差感」
   玩家選：
   · 字三級、真實大小：小 7（Lv・HP/MP 標籤・狀態・標籤）、中 9（名字・數值・訊息・按鈕）、大 14（傷害數字）；戰鬥裡不再「畫成 8 高再壓窄」
   · 魔物名牌放在每隻魔物腳下（名字・Lv／HP 條，數字在條裡／狀態）
   · 行動順序改成上方橫的一排（左上「第 N 回合」旁邊）
   · 下方＝主角狀態卡（頭像・名字 Lv・HP/MP 兩條＋職業資源）＋五個大按鈕
   · UI 是平滑的（圓角・半透明・漸層・向量圖示），跟像素的角色和場景形成反差
   版面（遊戲像素，寬 176、高 256）：0–14 上方一排；魔物整體往上 20（名牌在腳下、不碰主角的頭）；主角往上 6；196–217 狀態卡；218–256 按鈕／訊息 */
const KB12 = { S: 7, M: 9, L: 14, LIFT: 20,
  txt: '#eef1f8', mut: '#9aa3bd', acc: '#7fe3d0', warm: '#ffc46b', gold: '#ffd860' };
/* ---------- 字：戰鬥畫面裡只有 7・9・14 三種，照真正的大小畫 ---------- */
Font.bz = null;
{ const _r = render; render = function () { const b = Game.scene, on = !!(b && typeof Battle !== 'undefined' && b instanceof Battle), o = Font.bz; if (on) Font.bz = z => z <= 8 ? 7 : z <= 11.5 ? 9 : z; try { return _r(); } finally { Font.bz = o; } }; }
/* ---------- 平滑的 UI 零件 ---------- */
KB12.rr = (x, X, Y, w, h, r) => { r = Math.max(0, Math.min(r, w / 2, h / 2)); x.beginPath(); x.moveTo(X + r, Y); x.lineTo(X + w - r, Y); x.arcTo(X + w, Y, X + w, Y + r, r); x.lineTo(X + w, Y + h - r); x.arcTo(X + w, Y + h, X + w - r, Y + h, r); x.lineTo(X + r, Y + h); x.arcTo(X, Y + h, X, Y + h - r, r); x.lineTo(X, Y + r); x.arcTo(X, Y, X + r, Y, r); x.closePath(); };
KB12.panel = (x, X, Y, w, h, o = {}) => { x.save(); KB12.rr(x, X, Y, w, h, o.r ?? 4); const g = x.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, o.top || 'rgba(40,46,68,0.86)'); g.addColorStop(1, o.bot || 'rgba(14,16,26,0.92)'); x.fillStyle = g; x.fill();
  if (o.glow) { x.shadowColor = o.glow; x.shadowBlur = 4; } x.lineWidth = o.lw || 0.7; x.strokeStyle = o.rim || 'rgba(255,255,255,0.18)'; x.stroke(); x.restore(); };
KB12.tc = (x, s, cx, cy, col, z, maxW = 999) => { s = String(s); const w = Font.width(s, z); if (w > maxW && w > 0) { const k = maxW / w; x.save(); x.translate(cx - maxW / 2, 0); x.scale(k, 1); Font.draw(x, s, 0, cy - 8, col, 'rgba(0,0,0,0.55)', z); x.restore(); return; } Font.draw(x, s, cx - w / 2, cy - 8, col, 'rgba(0,0,0,0.55)', z); };
KB12.tl = (x, s, X, cy, col, z) => Font.draw(x, String(s), X, cy - 8, col, 'rgba(0,0,0,0.55)', z);
KB12.tr = (x, s, X, cy, col, z) => Font.draw(x, String(s), X - Font.width(String(s), z), cy - 8, col, 'rgba(0,0,0,0.55)', z);
// a bar with its numbers inside: r = 0..1, cols = [from, to]
KB12.bar = (x, X, Y, w, h, r, cols, label, num) => { x.save(); KB12.rr(x, X, Y, w, h, h / 2); x.fillStyle = 'rgba(6,8,14,0.85)'; x.fill(); x.lineWidth = 0.5; x.strokeStyle = 'rgba(255,255,255,0.14)'; x.stroke();
  const fw = Math.max(0, Math.min(w, w * r)); if (fw > 0.5) { x.save(); KB12.rr(x, X, Y, w, h, h / 2); x.clip(); const g = x.createLinearGradient(X, 0, X + w, 0); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); x.fillStyle = g; x.fillRect(X, Y, fw, h); x.fillStyle = 'rgba(255,255,255,0.22)'; x.fillRect(X, Y, fw, h * 0.4); x.restore(); }
  x.restore(); if (label) KB12.tl(x, label, X + 3, Y + h / 2, 'rgba(255,255,255,0.75)', KB12.S); if (num != null) { if (label) KB12.tr(x, num, X + w - 3, Y + h / 2, '#ffffff', KB12.S); else KB12.tc(x, num, X + w / 2, Y + h / 2, '#ffffff', KB12.S); } };
KB12.hpCols = r => r > 0.5 ? ['#c8343a', '#ff6a5a'] : r > 0.2 ? ['#d8661a', '#ffa64a'] : ['#d8a010', '#ffe060'];
// a small sign: [text, colour, background]; returns its width
KB12.chipW = s => Math.ceil(Font.width(s, KB12.S)) + 6;
KB12.chip = (x, s, X, Y, col, bg) => { const w = KB12.chipW(s); x.save(); KB12.rr(x, X, Y, w, 9, 3); x.fillStyle = bg || 'rgba(30,34,52,0.9)'; x.fill(); x.lineWidth = 0.5; x.strokeStyle = col; x.globalAlpha *= 0.55; x.stroke(); x.restore(); KB12.tc(x, s, X + w / 2, Y + 4.5, col, KB12.S); return w; };
KB12.chipRow = (x, L, X, Y, maxW, right) => { let used = 0; const out = []; for (const q of L) { const w = KB12.chipW(q[0]); if (used + w > maxW) break; out.push([q, w]); used += w + 2; }
  let cx = right ? X - (used - 2) : X; for (const [q, w] of out) { KB12.chip(x, q[0], cx, Y, q[1], q[2]); cx += w + 2; } return used; };
// what a unit wears now, as signs (an ailment, the shield, buffs and stages, the other badges)
KB12.BADGE = { wet: ['濕', '#8ad0ff'], tangle: ['纏繞', '#a8e080'], barrier: ['屏障', '#a8d8ff'], smoke: ['煙幕', '#c8c8d8'], critNext: ['集中', '#ffd860'], frozen: ['凍結', '#bfe8ff'] };
KB12.signs = function (v, short) { const L = [], st = v.st || {};
  if (v.broken) L.push(['破防中', '#ffd040', 'rgba(70,50,8,0.92)']); else if (v.charging || st.charging) L.push(['蓄力中', '#ff8a7a', 'rgba(70,14,14,0.92)']);
  const ak = typeof ailOf12 === 'function' ? ailOf12(v) : null; if (ak && AIL12[ak]) { const A = AIL12[ak], d = v.ailDur12; L.push([A.n + (d > 0 ? ' ' + d : ''), A.c, 'rgba(24,20,40,0.92)']); }
  if (st.ward > 0) L.push(['護盾 ' + st.ward, '#a8e0ff', 'rgba(16,36,70,0.92)']);
  for (const k in KB12.BADGE) if (st[k] && !(ak && k === ak)) L.push([KB12.BADGE[k][0], KB12.BADGE[k][1], 'rgba(24,28,44,0.92)']);
  if (typeof buffPills12 === 'function') for (const [s, k, t] of buffPills12(this, v)) { const C = (typeof BUFF_COL12 !== 'undefined' && BUFF_COL12[k]) || ['#c8d0e0']; L.push([s + (t && !short ? ' ' + t : ''), C[0], 'rgba(24,28,44,0.92)']); }
  return L; };
/* ---------- 版面：魔物往上 20、主角往上 6（07_battle 的 HERO_FOOT・HERO_Y） ---------- */
{ const _ly = Battle.prototype.layout; Battle.prototype.layout = function (snap) { _ly.call(this, snap); for (const v of this.foes()) v.foot -= KB12.LIFT; }; }
/* ---------- 上方一排：第 N 回合・行動順序（左）、天氣・×2（右） ---------- */
KB12.topRow = function (x) { const S = KB12.S, s = '第 ' + Math.max(1, this.round || 1) + ' 回合', w = Math.ceil(Font.width(s, S)) + 10;
  KB12.panel(x, 3, 2, w, 11, { r: 5.5 }); KB12.tc(x, s, 3 + w / 2, 7.5, '#d8deec', S);
  const O = this.order12; if (!O || !O.ids || !O.ids.length) return; const done = O.done || 0, cur = O.ids.findIndex((id, i) => i >= done && this.views[id] && !this.views[id].gone); let X = 3 + w + 4;
  O.ids.forEach((id, i) => { const v = this.views[id]; if (!v || v.gone || X > W - 44) return; const lab = this.ordLabel13 ? this.ordLabel13(v) : (v.n || '?').slice(0, 1), cw = Math.max(11, Math.ceil(Font.width(lab, S)) + 6), on = i === cur, past = i < done;
    x.save(); x.globalAlpha = past ? 0.35 : 1; KB12.rr(x, X, 2, cw, 11, 3); x.fillStyle = v.hero ? 'rgba(30,60,104,0.92)' : 'rgba(80,26,36,0.9)'; x.fill(); x.lineWidth = on ? 1 : 0.5; x.strokeStyle = on ? KB12.gold : 'rgba(255,255,255,0.2)'; x.stroke(); x.restore();
    x.save(); x.globalAlpha = past ? 0.35 : 1; KB12.tc(x, lab, X + cw / 2, 7.5, on ? '#fff2c8' : v.hero ? '#cfe6ff' : '#ffd4d4', S); x.restore(); X += cw + 2; }); };
Battle.prototype.drawOrder = function () {}; // (it is in the top row now)
Battle.prototype.drawSpd12 = function (x) { if (this.boxF < -20 || (typeof bTopOK12 === 'function' && !bTopOK12())) return; const on = typeof bFast12 === 'function' && bFast12(), X = W - 19, Y = 2, w = 16, h = 11;
  KB12.panel(x, X, Y, w, h, { r: 5.5, rim: on ? KB12.warm : null, top: on ? 'rgba(90,60,20,0.9)' : null }); KB12.tc(x, '×2', X + w / 2, Y + h / 2, on ? '#ffe8b0' : KB12.mut, KB12.S);
  if (typeof touchRegion === 'function' && typeof bSpdToggle12 === 'function') touchRegion(X - 5, Y - 2, w + 8, h + 8, bSpdToggle12); };
{ const _wi = wxIcon; wxIcon = function (x, k, X, Y) { if (Game.scene instanceof Battle && X === W - 13 && Y === 46) { X = W - 31; Y = 3; } return _wi(x, k, X, Y); }; }
/* ---------- 魔物腳下的名牌 ---------- */
KB12.plates = function (x, a0) { const all = this.foes(), F = all.filter(v => !v.gone && v.alpha > 0.3); if (!F.length) return; const n = all.length, M = KB12.M, S = KB12.S;
  const bw = n === 1 ? 100 : n === 2 ? 72 : 54, G = 3, srt = F.slice().sort((a, b) => a.x - b.x), PX = new Map(); let r = 0;
  for (const v of srt) { const X = Math.max(r + G, Math.round(v.x + v.off.x - bw / 2)); PX.set(v, X); r = X + bw; }
  let over = r - (W - G); for (let k = srt.length - 1; k >= 0 && over > 0; k--) { const v = srt[k], nx = Math.max(k ? PX.get(srt[k - 1]) + bw + G : G, PX.get(v) - over); PX.set(v, nx); over = PX.get(srt[srt.length - 1]) + bw - (W - G); }
  for (const v of F) { const X = PX.get(v), Y = Math.round(v.foot + 3), a = a0 * (v.plateA ?? 1); if (a <= 0) continue; const on = this.pickV === v;
    const L = KB12.signs.call(this, v, true), u = v.u;
    if (u && (u.elite || u.boss)) { const I = (u.data && u.data.in11) || {}; for (const [nm, k] of [['普', 'b'], ['物', 'p'], ['魔', 'm']]) { const q = Math.round(I[k] ?? 100); if (q !== 100) L.push([nm + ' ' + q + '%', q > 100 ? '#8af08a' : '#ff8a7a', 'rgba(24,28,44,0.92)']); } } // the boss's 普・物・魔 (only the ones off 100)
    if (n === 1) { const wk = typeof weakOf11 === 'function' && v.sp ? weakOf11(v.sp, u && u.data && u.data.hunt2) : ((typeof FAMILIES !== 'undefined' && FAMILIES[v.fam]) || {}).weak; if (wk && wk.length) { const rev = this.revealed(v); L.push(['弱 ' + (rev ? wk.join('・') : '？'), rev ? '#ffd070' : KB12.mut, 'rgba(40,32,14,0.9)']); } }
    const h = L.length || v.brkMax ? 29 : 21; // the third row only when there is something to show
    const rim = on ? KB12.gold : v.boss ? '#ff6b7a' : v.elite ? KB12.warm : v.rare ? '#ffd84a' : null, tag = v.rare ? '稀有' : v.boss ? '頭目' : v.elite ? '菁英' : '';
    x.save(); x.globalAlpha = a; KB12.panel(x, X, Y, bw, h, { r: 4, rim: rim || 'rgba(255,255,255,0.16)', lw: rim ? 0.9 : 0.6, glow: on ? 'rgba(255,216,96,0.8)' : null });
    // row 1: name (and 頭目・菁英), Lv on the right
    const lv = 'Lv' + v.lv, lw = Math.ceil(Font.width(lv, S)), tw = tag && bw >= 70 ? Math.ceil(Font.width(tag, S)) + 4 : 0, room = bw - 8 - lw - 3 - tw; let z = M; while (z > 7 && Font.width(v.n, z) > room) z -= 0.5;
    KB12.tl(x, v.n, X + 4, Y + 6, on ? '#fff2c8' : KB12.txt, z); if (tw) KB12.tl(x, tag, X + 4 + Math.min(room, Font.width(v.n, z)) + 3, Y + 6.5, rim, S); KB12.tr(x, lv, X + bw - 4, Y + 6.5, KB12.mut, S);
    // row 2: HP (numbers in the bar), the shield as a thin line on top, the break gauge under it
    const hr = clamp(v.hp / Math.max(1, v.maxhp), 0, 1); KB12.bar(x, X + 4, Y + 11, bw - 8, 7, hr, KB12.hpCols(hr), null, Math.max(0, Math.ceil(v.hp)) + '/' + v.maxhp);
    if (v.st && v.st.ward > 0) { x.fillStyle = '#8ad8ff'; x.fillRect(X + 6, Y + 10.5, Math.round((bw - 12) * clamp(v.st.ward / (v.st.wardMax || 1), 0, 1)), 1); }
    // row 3: the signs; the break gauge on the left; a lone monster also shows its weaknesses
    let sx = X + 4; if (v.brkMax) { for (let k = 0; k < v.brkMax; k++) { x.fillStyle = v.broken ? '#ff6050' : k < v.brk ? '#8ad0ff' : 'rgba(255,255,255,0.15)'; KB12.rr(x, sx + k * 4, Y + 22, 3, 3, 1); x.fill(); } sx += v.brkMax * 4 + 2; }
    if (L.length) KB12.chipRow(x, L, sx, Y + 19, X + bw - 4 - sx);
    // a broken boss: its parts (break them for the drops), under the plate
    const P = u && u.boss && v.broken && typeof partsOf11 === 'function' && partsOf11(u); if (P && P.length) { const pw = Math.floor((bw - 2 * (P.length - 1)) / P.length); P.forEach((q, k) => { const px = X + k * (pw + 2), py = Y + h + 2, rr = clamp(q.hp / q.max, 0, 1);
      KB12.panel(x, px, py, pw, 11, { r: 3 }); KB12.tl(x, q.n, px + 3, py + 5.5, q.gone ? KB12.mut : '#ffd070', KB12.S); if (q.gone) KB12.tr(x, '打壞', px + pw - 3, py + 5.5, '#ff7a6a', KB12.S); else KB12.bar(x, px + pw - 24, py + 3, 21, 5, rr, ['#d88a20', '#ffd060']); }); }
    x.restore(); } };
/* ---------- 魔物頭上：這回合要做什麼 ---------- */
KB12.intents = function (x) { const core = this.core; if (!core || !core.plan || (typeof FXT13 !== 'undefined' && FXT13.on) || typeof intentOf14 !== 'function') return;
  for (const v of this.foes()) { const u = core.byId[v.id]; if (!u || v.gone || v.alpha < 0.5 || v.st.charging) continue; const I = intentOf14(core, u, core.plan[v.id] || (core.hasStatus(u, 'rise14') ? {} : null)); if (!I) continue;
    const img = typeof INT_PX14 !== 'undefined' ? (INT_PX14[I.k] || INT_PX14.atk) : null, col = (typeof INT_COL14 !== 'undefined' && INT_COL14[I.k]) || KB12.txt, tw = I.t ? Math.ceil(Font.width(I.t, KB12.M)) + 3 : 0, w = 11 + 4 + tw + 2, h = 13;
    const X = Math.round(clamp(v.x + v.off.x - w / 2, 2, W - 2 - w)), Y = Math.max(15, Math.round(v.foot - v.bbh - 17 + v.sink * (v.sink < 0 ? 1 : 0)));
    KB12.panel(x, X, Y, w, h, { r: 6.5, rim: I.k === 'heavy' ? '#ff9a40' : 'rgba(255,255,255,0.2)', lw: I.k === 'heavy' ? 1 : 0.6 });
    if (img) { x.imageSmoothingEnabled = false; x.drawImage(img, X + 3, Y + 1); } if (I.t) KB12.tl(x, I.t, X + 15, Y + h / 2, col, KB12.M); } };
Battle.prototype.drawBoxF = function (x) { if (this.boxF < -20) return; const a0 = clamp((this.boxF + 30) / 34, 0, 1); KB12.plates.call(this, x, a0); KB12.intents.call(this, x); KB12.topRow.call(this, x); this.drawSpd12(x); };
Battle.prototype.drawPlateBig = function () {}; Battle.prototype.drawPlateSmall = function () {};
/* ---------- 主角狀態卡（196–217） ---------- */
Battle.prototype.drawBoxH = function (x) { const Y = Math.round(this.boxH) - 9, st = Game.st, Hv = this.H; if (Y >= BH || !Hv) return; const S = KB12.S, M = KB12.M, X = 3, w = W - 6, h = 22;
  KB12.panel(x, X, Y, w, h, { r: 5 });
  // the portrait: the hero's face from the walking sprite, in a round frame
  x.save(); KB12.rr(x, X + 3, Y + 2, 18, 18, 4); x.fillStyle = 'rgba(70,90,130,0.6)'; x.fill(); x.clip(); try { const fr = heroFramesFor(st).down[0]; x.imageSmoothingEnabled = false; x.drawImage(fr, 3, 2, 12, 11, X + 4, Y + 4, 16, 14.67); } catch (e) { /* no sprite yet */ } x.restore();
  x.save(); KB12.rr(x, X + 3, Y + 2, 18, 18, 4); x.lineWidth = 0.7; x.strokeStyle = 'rgba(255,255,255,0.3)'; x.stroke(); x.restore();
  // row 1: name・Lv; the class gauges on the right
  const nx = X + 25; KB12.tl(x, st.name, nx, Y + 6.5, KB12.txt, M); KB12.tl(x, 'Lv' + st.lv, nx + Math.ceil(Font.width(st.name, M)) + 3, Y + 7, KB12.warm, S);
  let gx = X + w - 4; const gauge = (label, n, N, yy, ok, blink) => { const pw = 5, gw = N * (pw + 1.5), lw = Math.ceil(Font.width(label, S)); gx -= gw;
      for (let i = 0; i < N; i++) { const on = i < n; x.fillStyle = on ? (blink && Math.floor(this.t / 8) % 2 ? '#ffffff' : ok ? KB12.gold : '#8ad0ff') : 'rgba(255,255,255,0.15)'; x.beginPath(); x.arc(gx + i * (pw + 1.5) + pw / 2, Y + 6.5, pw / 2, 0, 7); x.fill(); }
      gx -= lw + 3; KB12.tl(x, label, gx, Y + 7, ok ? KB12.gold : KB12.mut, S); gx -= 6; };
  if ('wc' in Hv.max && Hv.max.wc) { const n = Math.min(Hv.max.wc, Hv.res.wc || 0); gauge('特技', n, Hv.max.wc, 0, n >= Hv.max.wc, n >= Hv.max.wc); }
  try { this.drawClassRes(x, gauge, 0); } catch (e) { }
  if ((Hv.res.combo || 0) > 0) { const step = (this.core.byId.H.data.comboStep || 6), s = '連段×' + Hv.res.combo + ' +' + step * Hv.res.combo + '%'; gx -= KB12.chipW(s); KB12.chip(x, s, gx, Y + 2, KB12.gold, 'rgba(70,52,10,0.92)'); }
  // row 2: HP and MP side by side, numbers inside
  const r = clamp(Hv.hp / Math.max(1, Hv.maxhp), 0, 1), mr = clamp(Hv.mp / (Hv.maxmp || 1), 0, 1), bw = Math.floor((w - 25 - 4 - 3) / 2);
  KB12.bar(x, nx, Y + 12, bw, 8, r, r > 0.5 ? ['#2f9a58', '#62e08a'] : r > 0.2 ? ['#c88a10', '#ffc040'] : ['#c8343a', '#ff6a5a'], 'HP', Math.ceil(Hv.hp) + '/' + Hv.maxhp);
  KB12.bar(x, nx + bw + 3, Y + 12, bw, 8, mr, ['#2a64c8', '#62a8ff'], 'MP', Math.round(Hv.mp) + '/' + (Hv.maxmp || 0));
  // the hero's signs, just above the card on the left
  const L = KB12.signs.call(this, Hv, false); if (L.length) KB12.chipRow(x, L, X + 1, Y - 11, w - 2); };
/* ---------- 按鈕：五個一樣大，向量圖示＋字置中 ---------- */
KB12.icon = (x, k, cx, cy, col) => { x.save(); x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 1.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath();
  if (k === 0) { x.moveTo(cx - 4.5, cy + 4.5); x.lineTo(cx + 4.5, cy - 4.5); x.moveTo(cx - 4, cy + 1); x.lineTo(cx - 1, cy + 4); x.moveTo(cx - 5.5, cy + 5.5); x.lineTo(cx - 4, cy + 4); x.stroke(); } // a sword
  else if (k === 1) { x.moveTo(cx, cy - 5.5); x.quadraticCurveTo(cx + 1, cy - 1, cx + 5.5, cy); x.quadraticCurveTo(cx + 1, cy + 1, cx, cy + 5.5); x.quadraticCurveTo(cx - 1, cy + 1, cx - 5.5, cy); x.quadraticCurveTo(cx - 1, cy - 1, cx, cy - 5.5); x.fill(); } // a sparkle
  else if (k === 2) { KB12.rr(x, cx - 4.5, cy - 2.5, 9, 8, 2.5); x.stroke(); x.beginPath(); x.moveTo(cx - 2, cy - 2.5); x.lineTo(cx - 2, cy - 4.5); x.lineTo(cx + 2, cy - 4.5); x.lineTo(cx + 2, cy - 2.5); x.stroke(); } // a bag
  else if (k === 3) { x.moveTo(cx, cy - 5.5); x.lineTo(cx + 4.5, cy - 3.5); x.lineTo(cx + 4, cy + 1.5); x.quadraticCurveTo(cx + 2, cy + 4.5, cx, cy + 5.5); x.quadraticCurveTo(cx - 2, cy + 4.5, cx - 4, cy + 1.5); x.lineTo(cx - 4.5, cy - 3.5); x.closePath(); x.stroke(); } // a shield
  else { x.moveTo(cx - 3, cy - 5); x.lineTo(cx - 3, cy + 5); x.moveTo(cx - 3, cy - 5); x.lineTo(cx + 0.5, cy - 5); x.moveTo(cx - 3, cy + 5); x.lineTo(cx + 0.5, cy + 5); x.moveTo(cx, cy); x.lineTo(cx + 5.5, cy); x.moveTo(cx + 3, cy - 2.5); x.lineTo(cx + 5.5, cy); x.lineTo(cx + 3, cy + 2.5); x.stroke(); } // out through a door
  x.restore(); };
KB12.cmdBtn = (x, k, n, X, m, on) => { const Y = m.y, w = 31, h = m.rowH;
  KB12.panel(x, X, Y, w, h, { r: 5, rim: on ? KB12.warm : 'rgba(255,255,255,0.14)', lw: on ? 1 : 0.6, glow: on ? 'rgba(255,196,107,0.7)' : null, top: on ? 'rgba(92,70,30,0.92)' : null, bot: on ? 'rgba(40,28,10,0.95)' : null });
  KB12.icon(x, k, X + w / 2, Y + 11, on ? '#ffe8b0' : '#b8c0d4'); KB12.tc(x, n, X + w / 2, Y + h - 8, on ? '#fff2d8' : KB12.mut, KB12.M); };
/* ---------- 框：戰鬥裡的訊息框、選單、選目標都用同一種平滑的框 ---------- */
{ const _dw = drawWin; drawWin = function (x, X, Y, w, h, style) { if (typeof inBattle === 'function' && inBattle() && style !== 'sign') return KB12.panel(x, X, Y, w, h, { r: 5 }); return _dw(x, X, Y, w, h, style); }; }
{ const _sb = selBar; selBar = function (x, X, Y, w, h = 15) { if (typeof inBattle === 'function' && inBattle()) { x.save(); KB12.rr(x, X, Y, w, h, 3); x.fillStyle = 'rgba(127,227,208,0.16)'; x.fill(); x.fillStyle = KB12.acc; x.fillRect(X, Y + 2, 1.5, h - 4); x.restore(); return; } return _sb(x, X, Y, w, h); }; }
{ const _bt = drawBtn; drawBtn = function (x, X, Y, w, h, on, strip) { if (typeof inBattle === 'function' && inBattle()) { KB12.panel(x, X, Y, w, h, { r: 4, rim: on ? KB12.acc : 'rgba(255,255,255,0.14)' }); if (strip) { x.fillStyle = strip; x.fillRect(X + 2, Y + 3, 1.5, h - 6); } return; } return _bt(x, X, Y, w, h, on, strip); }; }
/* ---------- 魔物出招的名字：上方一排下面一個平滑的牌子（原本是畫面中間的長條，壓在魔物頭上） ---------- */
{ const _ov = Battle.prototype.drawOverlay; Battle.prototype.drawOverlay = function (x) { const B = this.banner; this.banner = null; try { _ov.call(this, x); } finally { this.banner = B; } if (!B) return;
    const k = Math.min(1, B.t / 6), fade = B.t > B.life - 10 ? (B.life - B.t) / 10 : 1, s = (B.charge ? '蓄力 ' : '') + B.s, w = Math.ceil(Font.width(s, KB12.M)) + 16, h = 13, X = Math.round(W / 2 - w / 2), Y = 16;
    x.save(); x.globalAlpha = clamp(fade, 0, 1) * k; KB12.panel(x, X, Y, w, h, { r: 6.5, rim: B.strong ? '#ff5060' : '#c86070', lw: B.strong ? 1.1 : 0.7, glow: B.strong ? 'rgba(255,60,80,0.7)' : null, top: 'rgba(80,20,30,0.9)', bot: 'rgba(30,8,14,0.94)' });
    KB12.tc(x, s, W / 2, Y + h / 2, B.strong ? '#ffe0e0' : '#ffc8c8', KB12.M); x.restore(); }; }
/* ===================== v12.88 戰鬥中跳出的字（玩家：「戰鬥中跳出的文字也要重製跳出範圍與大小」，三題都選推薦） =====================
   · 打在魔物身上的數字：大 14，從魔物身體中間往上飄 8；白＝一般、金＝弱點、橘＝會心；同一隻連續幾下左右錯開；不超出魔物的範圍；上面一個小牌子寫「弱點・會心・破防・重擊」
   · 主角的數字：受傷紅・回復綠從狀態卡的 HP 條上面跳出來；MP 的變化從 MP 條上面
   · 狀態・弱點・沒打中這些字：跟名牌同一種平滑小牌子（中 9），魔物的從名牌上方往上疊、主角的從狀態卡上方，每隻同時最多 3 個，舊的往上推、淡出
   · 破防・升級・元素爆發：一條橫帶（大 14），放在上方回合列下面（放在畫面正中間會蓋住打破防的那個數字和魔物身上的字） */
{ const _pn = Battle.prototype.popNum; Battle.prototype.popNum = function (v, s, c, tag, o = {}) { const before = new Set(this.pops); _pn.call(this, v, s, c, tag, o); for (const p of this.pops) if (!before.has(p) && p.u12 === undefined) { p.u12 = v || null; p.n12 = this.t; } }; }
KB12.isNum = s => /^[+\-−]?\d+$/.test(String(s));
KB12.RIB = { 'BREAK!': '破防！', 'LEVEL UP!': '升級！', '元素爆發！': '元素爆發！' };
KB12.life = p => p.big ? 60 : 44;
KB12.fadeA = (p, life) => p.t > life - 12 ? Math.max(0, (life - p.t) / 12) : Math.min(1, 0.35 + p.t * 0.22);
KB12.TAG = { 弱點: ['#ffd27a', '#2a1404'], 會心: ['#ff9a50', '#2a1404'], 破防: ['#e0504a', '#ffffff'], 重擊: ['#e0504a', '#ffffff'] };
// a number with a dark rim (smooth: drawn eight times a little off, then on top)
KB12.num = (x, s, cx, cy, col, z) => { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) Font.draw(x, s, cx - Font.width(s, z) / 2 + dx * 0.8, cy - 8 + dy * 0.8, '#120a12', null, z); Font.draw(x, s, cx - Font.width(s, z) / 2, cy - 8, col, null, z); };
KB12.ribbon = (x, p) => { const life = 60, t = p.t, a = t < 6 ? t / 6 : t > life - 12 ? Math.max(0, (life - t) / 12) : 1, cy = 27, s = KB12.RIB[p.s] || p.s, col = p.c || '#ffd040';
  x.save(); x.globalAlpha = a; const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(20,14,6,0)'); g.addColorStop(0.18, 'rgba(20,14,6,0.86)'); g.addColorStop(0.82, 'rgba(20,14,6,0.86)'); g.addColorStop(1, 'rgba(20,14,6,0)'); x.fillStyle = g; x.fillRect(0, cy - 10, W, 20);
  const gl = x.createLinearGradient(0, 0, W, 0); gl.addColorStop(0, 'rgba(255,208,96,0)'); gl.addColorStop(0.2, 'rgba(255,208,96,0.8)'); gl.addColorStop(0.8, 'rgba(255,208,96,0.8)'); gl.addColorStop(1, 'rgba(255,208,96,0)'); x.fillStyle = gl; x.fillRect(0, cy - 10, W, 0.8); x.fillRect(0, cy + 9.2, W, 0.8);
  const sc = t < 5 ? 0.85 + t * 0.03 : 1; x.translate(W / 2, cy); x.scale(sc, sc); KB12.num(x, s, 0, 0, col, KB12.L); x.restore(); };
// words: a column of signs per unit — a monster's start just above its plate, the hero's just above the status card
KB12.words = function (x, v, L) { const live = L.filter(p => p.t < KB12.life(p)), max = v && (v.hero || (v.bbh || 48) < 56) ? 2 : 3, show = live.slice(-max); if (!show.length) return;
  const hero = v && v.hero, cx0 = v ? v.x + (v.off ? v.off.x : 0) : show[0].x, base = hero ? Math.round(this.boxH) - 9 - 2 - (KB12.signs.call(this, v, false).length ? 11 : 0) - (this.pops.some(q => q.u12 === v && /MP$/.test(String(q.s)) && q.t < KB12.life(q)) ? 20 : 0) : v ? Math.round(v.foot + 3) - 2 : show[0].y; let y = base;
  const hx = hero ? Math.round(this.center(v).x) + 22 : 0; // the hero's column starts just right of the hero
  for (let i = show.length - 1; i >= 0; i--) { const p = show[i], s = String(p.s), h = 13, w = Math.ceil(Font.width(s, KB12.M)) + 12, cx = hero ? clamp(hx + w / 2, w / 2 + 3, W - w / 2 - 3) : clamp(cx0, w / 2 + 3, W - w / 2 - 3), col = p.c || KB12.txt, a = KB12.fadeA(p, KB12.life(p)), rise = Math.min(4, p.t * 0.6);
    x.save(); x.globalAlpha = a; KB12.panel(x, Math.round(cx - w / 2), Math.round(y - h - (4 - rise)), w, h, { r: 6.5, rim: col, lw: p.big ? 1 : 0.6, top: 'rgba(30,26,44,0.92)', bot: 'rgba(12,10,20,0.95)' }); KB12.tc(x, s, cx, y - h / 2 - (4 - rise), col, KB12.M); x.restore(); y -= h + 2; }
  return y - 2; }; // the top of the column (the numbers stay above it)
Battle.prototype.drawPops = function (x) { if (typeof ctrBadge12 === 'function') try { ctrBadge12(this, x); } catch (e) { }
  const P = this.pops, isN = p => KB12.isNum(p.s) && !p.w14, hero = this.H, cardY = Math.round(this.boxH) - 9;
  // 1. the big events: one band at a time (the newest)
  // 2. words, a column per unit
  const G = new Map(); for (const p of P) { if (KB12.RIB[p.s] || isN(p) || (p.u12 && p.u12.hero && /^\+\d+MP$/.test(p.s))) continue; const k = p.u14 || p.u12 || null; if (!G.has(k)) G.set(k, []); G.get(k).push(p); }
  const VW = u => u && !u.hero && u.foot == null && u.id ? this.views[u.id] || u : u, wTop = new Map();
  for (const [v, L] of G) { const top = KB12.words.call(this, x, v, L); if (v && top != null) wTop.set(VW(v), Math.min(top, wTop.get(VW(v)) ?? 999)); }
  // 3. numbers: a monster's from the middle of its body; the hero's from the status card (HP bar; MP bar for MP)
  const byU = new Map(); for (const p of P) { if (!(isN(p) || (p.u12 && p.u12.hero && /^\+\d+MP$/.test(p.s)))) continue; const k = p.u12 || null; if (!byU.has(k)) byU.set(k, []); byU.get(k).push(p); }
  const OFF = [0, 9, -9, 5, -5, 12, -12], hz = hero && KB12.signs.call(this, hero, false).length ? 11 : 0; // the hero's numbers start above its status signs
  // how far above the newest number each older one sits: 14 a step
  const up = L => L.map((p, i) => (L.length - 1 - i) * 14);
  for (const [v0, L] of byU) { const v = VW(v0), mon = v && !v.hero && v.foot != null, wt = mon ? wTop.get(v) : null; let live = L.filter(p => p.t < KB12.life(p));
    if (mon) live = live.slice(-(wt != null ? 2 : 3)); // a monster shows its newest 3 numbers (2 while it also has words)
    const U = up(live);
    // a monster's column stays on its body: below its intent pill, above its words / plate (moved down first, then packed closer, 12 → 10 a step; past that it may cover the intent pill for a moment, never the words)
    let fit = null, colX = null; if (mon) { const C = this.center(v), n = live.length, top = Math.round(v.foot - (v.bbh || 40)) + 4, bot = Math.min(Math.round(v.foot) - 7, wt != null ? wt - 7 : 999), rise = live.map(p => Math.min(8, p.t * 0.8));
      const place = st => { const Y = live.map((p, i) => C.y - rise[i] - (n - 1 - i) * st), d = Math.max(...Y) - bot; return d > 0 ? Y.map(y => y - d) : Y; };
      let st = 12, Y = place(st), lo = Math.min(...Y), hi = Math.max(...Y);
      if (lo < top) { const d = Math.min(top - lo, Math.max(0, bot - hi)); Y = Y.map(y => y + d); lo += d; hi += d; }
      if (lo < top && n > 1) { st = Math.max(10, st - (top - lo) / (n - 1)); Y = place(st); lo = Math.min(...Y); hi = Math.max(...Y); const d = Math.min(Math.max(0, top - lo), Math.max(0, bot - hi)); Y = Y.map(y => y + d); }
      fit = Y;
      // the tag chips all go on the right: the column moves left if they would leave the screen
      const need = Math.max(0, ...live.filter(p => p.tag).map(p => Font.width(String(p.s), KB12.L) / 2 + 2 + Math.ceil(Font.width(p.tag, KB12.S)) + 6 + 4)); colX = need ? Math.min(C.x, W - 3 - need) : C.x; }
    live.forEach((p, i) => { const life = KB12.life(p), t = p.t, a = t > life - 8 ? (life - t) / 8 : 1, sc = t < 3 ? 0.7 + t * 0.15 : t < 7 ? 1.15 - (t - 3) * 0.0375 : 1, z = p.small ? KB12.S + 2 : KB12.L; let s = String(p.s).replace(/^-/, '−'), col = p.c || '#ffffff';
      if (v && v.hero && /^\d+$/.test(s)) { s = '−' + s; col = p.tag ? '#ff5a5a' : '#ff8478'; } // the hero's damage: always red with a minus (a heavy hit deeper red, 重擊)
      let cx, cy; if (v && v.hero) { const mp = /MP$/.test(s), bw = Math.floor((W - 6 - 25 - 4 - 3) / 2), same = live.filter(q => /MP$/.test(String(q.s)) === mp), j = same.indexOf(p); cx = (mp ? 28 + bw + 3 + bw / 2 : 28 + bw / 2); cy = cardY - 2 - hz - Math.min(8, t * 0.8) - (z / 2) - up(same)[j]; }
      else if (v) { const C = this.center(v), bw = (v.img && v.img.bb ? v.img.bb.w : 40) * (v.img && v.img.ds || 1); const X0 = colX ?? C.x; cx = clamp(X0 + [0, 4, -4][i % 3], Math.min(X0, C.x - bw / 2 + 8), Math.max(X0, C.x + bw / 2 - 8)); cy = fit ? fit[i] : C.y - Math.min(8, t * 0.8) - U[i]; } // several hits: the older numbers sit above the newer
      else { cx = p.x; cy = p.y - Math.min(8, t * 0.8); }
      cx = clamp(cx, 10, W - 10); x.save(); x.globalAlpha = clamp(a, 0, 1); x.translate(cx, cy); x.scale(sc, sc); KB12.num(x, s, 0, 0, col, z);
      if (p.tag) { const T = KB12.TAG[p.tag] || [p.c || '#ffffff', '#1a1020'], tw = Math.ceil(Font.width(p.tag, KB12.S)) + 6, nw = Font.width(s, z), right = !(v && v.hero) && cx + nw / 2 + 2 + tw <= W - 2, tx = right ? nw / 2 + 2 : -nw / 2 - 2 - tw;
        x.save(); KB12.rr(x, tx, -5.5, tw, 9, 3); x.fillStyle = T[0]; x.fill(); x.restore(); KB12.tc(x, p.tag, tx + tw / 2, -1, T[1], KB12.S); }
      x.restore(); }); }
  const R = P.filter(p => KB12.RIB[p.s] && p.t < 60); if (R.length) KB12.ribbon(x, R[R.length - 1]); }; // the big event last, over everything
