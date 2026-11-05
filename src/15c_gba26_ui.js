/* ===================== v12.155 戰鬥 UI：科技風・全部排整齊 =====================
   玩家 2026-11-05：「UI 要位置合理 文字排列 預告 警告 這些會在戰鬥畫面出現的全部要排列整齊 文字大小字體該統一的統一 UI 風格微調成科技風」
   · 字：只用三種大小：小 7（標籤・數字）、中 9（名字・指令・訊息）、大 14／20（跳出來的傷害）；全部同一種字型。
   · 框：深藍半透明、青色細框、切角（左上・右下），角落有亮色短線，底下有很淡的掃描線。選到的是黃色框。
   · 魔物：頂上一排，每隻一個框，高度一樣；每個框固定四行：名字・Lv ／ HP ／ 下一步（預告；重擊・蓄力是紅色警告）／ 狀態・破防格。
     預告不再飄在魔物頭上，全部在框的同一行，橫著對齊。
   · 主角：右下一個框（跟魔物的框一樣高）：名字・Lv ／ HP ／ MP ／ 職業的格子；狀態牌子排在框的正上方，靠右對齊。
   · 下面：訊息框・指令（左邊「要做什麼？」右邊 3×2）・技能清單・選目標，同一種框。 */
const TK26 = { txt: '#e8f4ff', mut: '#7fb0c8', cyan: '#5ad8ff', line: 'rgba(90,210,255,0.8)', hi: '#b8f4ff', sel: '#ffe46a', warn: '#ff5468', caution: '#ffb84a', ok: '#5af0a8', mp: '#4aa8ff',
  bg0: 'rgba(12,28,50,0.9)', bg1: 'rgba(5,11,24,0.93)', PH: 42 };
const tt26 = (x, s, X, cy, col, z) => Font.draw(x, String(s), X, cy - 8, col, 'rgba(0,0,0,0.6)', z);
const ttr26 = (x, s, X, cy, col, z) => tt26(x, s, X - Font.width(String(s), z), cy, col, z);
// 切角的框
function chamfer26(x, X, Y, w, h, c) { x.beginPath(); x.moveTo(X + c, Y); x.lineTo(X + w, Y); x.lineTo(X + w, Y + h - c); x.lineTo(X + w - c, Y + h); x.lineTo(X, Y + h); x.lineTo(X, Y + c); x.closePath(); }
function techBox26(x, X, Y, w, h, o = {}) { const c = o.c ?? Math.max(1.5, Math.min(5, h / 4)), on = !!o.on; x.save();
  chamfer26(x, X, Y, w, h, c); const g = x.createLinearGradient(0, Y, 0, Y + h); g.addColorStop(0, o.top || (on ? 'rgba(60,52,14,0.92)' : TK26.bg0)); g.addColorStop(1, o.bot || (on ? 'rgba(30,24,6,0.94)' : TK26.bg1)); x.fillStyle = g; x.fill();
  if (h >= 14) { x.clip(); x.fillStyle = 'rgba(120,220,255,0.035)'; for (let yy = Y + 1; yy < Y + h; yy += 2) x.fillRect(X, yy, w, 1); }
  x.restore(); x.save(); chamfer26(x, X + 0.5, Y + 0.5, w - 1, h - 1, c); x.lineWidth = on ? 1.1 : 0.7; x.strokeStyle = o.rim || (on ? TK26.sel : TK26.line); x.stroke();
  if (h >= 14 && w >= 24) { x.fillStyle = on ? TK26.sel : TK26.hi; x.fillRect(X + w - 8, Y, 7, 1); x.fillRect(X + 1, Y + h - 1, 7, 1); }
  x.restore(); }
// 血條：細、分段、亮的前緣
function techBar26(x, X, Y, w, r, col) { x.save(); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(X, Y, w, 4); x.fillStyle = 'rgba(120,200,255,0.12)'; x.fillRect(X, Y, w, 4);
  const c = col || (r > 0.5 ? TK26.ok : r > 0.2 ? '#ffd24a' : TK26.warn), fw = Math.round(w * clamp(r, 0, 1)); if (fw > 0) { x.fillStyle = c; x.fillRect(X, Y, fw, 4); x.fillStyle = 'rgba(255,255,255,0.45)'; x.fillRect(X, Y, fw, 1); x.fillStyle = '#ffffff'; x.fillRect(X + fw - 1, Y, 1, 4); }
  x.fillStyle = 'rgba(0,0,0,0.45)'; for (let k = 1; k < 10; k++) x.fillRect(X + Math.round(w * k / 10), Y, 1, 4); x.restore(); }
// 小牌子（狀態・回合順序）
function techChip26(x, s, X, Y, col, w) { x.save(); chamfer26(x, X, Y, w, 9, 2); x.fillStyle = 'rgba(6,14,28,0.9)'; x.fill(); chamfer26(x, X + 0.5, Y + 0.5, w - 1, 8, 2); x.lineWidth = 0.6; x.strokeStyle = col; x.globalAlpha *= 0.85; x.stroke(); x.restore(); KB12.tc(x, s, X + w / 2, Y + 4.5, col, KB12.S); }

if (typeof KB12 !== 'undefined') {
  const on = () => GBA26.on && Game.scene instanceof Battle;
  // 所有框・牌子・游標都換成科技風
  const _pn = KB12.panel; KB12.panel = function (x, X, Y, w, h, o = {}) { if (!on()) return _pn(x, X, Y, w, h, o);
    const hot = o.rim && /^#/.test(o.rim) && o.rim !== '#ffffff'; return techBox26(x, X, Y, w, h, { on: hot, rim: hot ? null : undefined, top: o.top && hot ? null : undefined }); };
  const _ch = KB12.chip; KB12.chip = function (x, s, X, Y, col, bg) { if (!on()) return _ch(x, s, X, Y, col, bg); const w = KB12.chipW(s); techChip26(x, s, X, Y, col, w); return w; };
  if (typeof selBar !== 'undefined') { const _sb = selBar; selBar = function (x, X, Y, w, h = 15) { if (!on()) return _sb(x, X, Y, w, h);
      x.save(); const g = x.createLinearGradient(X, 0, X + w, 0); g.addColorStop(0, 'rgba(90,210,255,0.28)'); g.addColorStop(1, 'rgba(90,210,255,0.02)'); x.fillStyle = g; x.fillRect(X, Y, w, h);
      x.fillStyle = TK26.cyan; x.fillRect(X, Y, 1, h); const cy = Y + h / 2, b = Math.floor(Game.t / 20) % 2 ? 0.5 : 0; x.beginPath(); x.moveTo(X + 2 + b, cy - 3); x.lineTo(X + 5.5 + b, cy); x.lineTo(X + 2 + b, cy + 3); x.closePath(); x.fill(); x.restore(); }; }
  // 最上面一列：回合・行動順序
  const _tr = KB12.topRow; KB12.topRow = function (x) { if (!on()) return _tr.call(this, x); const S = KB12.S, s = '第 ' + Math.max(1, this.round || 1) + ' 回合', w = Math.ceil(Font.width(s, S)) + 10;
    techChip26(x, s, 3, 2, TK26.txt, w); const O = this.order12; if (!O || !O.ids || !O.ids.length) return; const done = O.done || 0, cur = O.ids.findIndex((id, i) => i >= done && this.views[id] && !this.views[id].gone); let X = 3 + w + 4;
    O.ids.forEach((id, i) => { const v = this.views[id]; if (!v || v.gone || X > W - 44) return; const lab = this.ordLabel13 ? this.ordLabel13(v) : (v.n || '?').slice(0, 1), cw = Math.max(11, Math.ceil(Font.width(lab, S)) + 6), cur1 = i === cur, past = i < done;
      x.save(); x.globalAlpha = past ? 0.35 : 1; techChip26(x, lab, X, 2, cur1 ? TK26.sel : v.hero ? TK26.cyan : '#ff8a98', cw); x.restore(); X += cw + 2; }); };
  // 畫面拉長時，最上面一列要等上面那段補好再畫（跟 13t 一樣）
  if (typeof TALL18 !== 'undefined') { const f = KB12.topRow; KB12.topRow = function (x, ...a) { if (!(TALL_EXT > 0) || TALL18.now) return f.call(this, x, ...a); const self = this; TALL18.hud.push(() => f.call(self, x, ...a)); }; }
  // 預告不畫在頭上（改到框裡）
  const _it = KB12.intents; KB12.intents = function (x) { if (!on()) return _it.call(this, x); }; }

/* ---------- 下一步（預告）：給框用 ---------- */
function intent26(b, v) { const core = b.core; if (!core || !core.plan || typeof intentOf14 !== 'function' || (typeof FXT13 !== 'undefined' && FXT13.on)) return null; const u = core.byId[v.id]; if (!u || v.gone) return null;
  if (v.st && v.st.charging) return { k: 'heavy', t: '蓄力中', warn: 1 };
  const I = intentOf14(core, u, core.plan[v.id] || (core.hasStatus(u, 'rise14') ? {} : null)); if (!I) return { k: '?', t: '？', hide: 1 };
  return { ...I, warn: I.k === 'heavy' }; }

/* ---------- 魔物的框：頂上一排、一樣高、固定四行 ---------- */
KB12.plates = function (x, a0) { if (!GBA26.on) return; const all = this.foes(), F = all.filter(v => !v.gone && v.alpha > 0.3); if (!F.length) return; const n = all.length, M = KB12.M, S = KB12.S, E = TALL_EXT || 0, PH = TK26.PH;
  const one = n === 1, G = 3, bw = one ? 128 : Math.floor((W - 6 - G * (n - 1)) / n), top = E >= 40 ? 17 - E : 16, srt = all.slice().sort((a, b) => (a.tx ?? a.x) - (b.tx ?? b.x));
  for (const v of F) { const k = srt.indexOf(v), X = one ? 3 : 3 + k * (bw + G), Y = top, a = a0 * (v.plateA ?? 1); if (a <= 0) continue; const sel = this.pickV === v, u = v.u;
    x.save(); x.globalAlpha = a; techBox26(x, X, Y, bw, PH, { on: sel, rim: !sel && (v.boss || v.elite) ? (v.boss ? 'rgba(255,90,110,0.9)' : 'rgba(255,184,74,0.9)') : undefined });
    // 1：名字・頭目／菁英／稀有・Lv
    const tag = v.rare ? '稀有' : v.boss ? '頭目' : v.elite ? '菁英' : '', tcol = v.boss ? TK26.warn : v.elite ? TK26.caution : TK26.sel, lv = 'Lv' + v.lv, lw = Math.ceil(Font.width(lv, S)), tw = tag && bw >= 70 ? Math.ceil(Font.width(tag, S)) + 3 : 0;
    const room = bw - 9 - lw - 3 - tw; let z = M; while (z > 7 && Font.width(v.n, z) > room) z -= 0.5;
    tt26(x, v.n, X + 4, Y + 7.5, sel ? '#fff4c8' : TK26.txt, z); if (tw) tt26(x, tag, X + 4 + Math.min(room, Font.width(v.n, z)) + 3, Y + 8, tcol, S); ttr26(x, lv, X + bw - 4, Y + 8, TK26.mut, S);
    // 2：HP（寬的框才有數字）
    const hr = clamp(v.hp / Math.max(1, v.maxhp), 0, 1), num = Math.max(0, Math.ceil(v.hp)) + '/' + v.maxhp, nw = bw >= 76 ? Math.ceil(Font.width(num, S)) + 3 : 0;
    tt26(x, 'HP', X + 4, Y + 16.5, TK26.mut, S); techBar26(x, X + 16, Y + 14.5, bw - 20 - nw, hr); if (nw) ttr26(x, num, X + bw - 4, Y + 16.5, TK26.txt, S);
    if (v.st && v.st.ward > 0) { x.fillStyle = TK26.cyan; x.fillRect(X + 16, Y + 13, Math.round((bw - 20 - nw) * clamp(v.st.ward / (v.st.wardMax || 1), 0, 1)), 1); }
    // 3：下一步（重擊・蓄力是紅色警告）
    const I = intent26(this, v), ry = Y + 21; if (I) { const wn = I.warn && !I.hide; x.save();
      if (wn) { const bl = 0.55 + 0.45 * Math.abs(Math.sin(Game.t / 9)); x.globalAlpha *= bl; x.fillStyle = 'rgba(255,60,80,0.28)'; x.fillRect(X + 2, ry, bw - 4, 10); x.fillStyle = TK26.warn; x.fillRect(X + 2, ry, 1.5, 10); }
      else { x.fillStyle = 'rgba(90,210,255,0.08)'; x.fillRect(X + 2, ry, bw - 4, 10); } x.restore();
      let ix = X + 5; const img = typeof INT_PX14 !== 'undefined' && !I.hide ? (INT_PX14[I.k] || INT_PX14.atk) : null; if (img) { x.imageSmoothingEnabled = false; x.drawImage(img, ix, ry - 0.5); ix += 13; } else { tt26(x, '下一步', ix, ry + 5, TK26.mut, S); ix += Math.ceil(Font.width('下一步', S)) + 3; }
      const col = wn ? '#ffd0d6' : (typeof INT_COL14 !== 'undefined' && INT_COL14[I.k]) || TK26.txt; let tz = M; while (tz > 7 && Font.width(I.t || '', tz) > X + bw - 4 - ix - (wn ? 8 : 0)) tz -= 0.5; if (I.t) tt26(x, I.t, ix, ry + 5, col, tz);
      if (wn) ttr26(x, '！', X + bw - 4, ry + 5, TK26.warn, M); }
    // 4：破防格・狀態
    const L = KB12.signs.call(this, v, true).filter(q => q[0] !== '蓄力中'); // 蓄力在第 3 行的警告
    if (u && (u.elite || u.boss)) { const In = (u.data && u.data.in11) || {}; for (const [nm, kk] of [['普', 'b'], ['物', 'p'], ['魔', 'm']]) { const q = Math.round(In[kk] ?? 100); if (q !== 100) L.push([nm + ' ' + q + '%', q > 100 ? TK26.ok : '#ff8a98']); } }
    if (one) { const wk = typeof weakOf11 === 'function' && v.sp ? weakOf11(v.sp, u && u.data && u.data.hunt2) : null; if (wk && wk.length) { const rev = this.revealed(v); L.push(['弱 ' + (rev ? wk.join('・') : '？'), rev ? TK26.sel : TK26.mut]); } }
    let sx = X + 4; if (v.brkMax) { for (let q = 0; q < v.brkMax; q++) { x.fillStyle = v.broken ? TK26.warn : q < v.brk ? TK26.cyan : 'rgba(120,200,255,0.2)'; x.fillRect(sx + q * 4, Y + 35, 3, 3); } sx += v.brkMax * 4 + 2; }
    if (L.length) KB12.chipRow(x, L, sx, Y + 32, X + bw - 4 - sx);
    // 破防中的頭目：部位耐久（框的下面一排）
    const P = u && u.boss && v.broken && typeof partsOf11 === 'function' && partsOf11(u); if (P && P.length) { const pw = Math.floor((bw - 2 * (P.length - 1)) / P.length); P.forEach((q, k2) => { const px = X + k2 * (pw + 2), py = Y + PH + 2, r2 = clamp(q.hp / q.max, 0, 1);
      techBox26(x, px, py, pw, 12); tt26(x, q.n, px + 3, py + 6, q.gone ? TK26.mut : TK26.caution, S); if (q.gone) ttr26(x, '打壞', px + pw - 3, py + 6, TK26.warn, S); else techBar26(x, px + pw - 24, py + 4, 21, r2, TK26.caution); }); }
    x.restore();
    // 選目標：魔物頭上一個 ▼
    if (sel) { const C = this.center(v), ty = Math.round(v.foot - (v.bbh || 40) - 6 + Math.sin(Game.t / 6) * 1.5); x.fillStyle = TK26.sel; x.strokeStyle = '#3a2808'; x.lineWidth = 1; x.beginPath(); x.moveTo(C.x - 5, ty - 5); x.lineTo(C.x + 5, ty - 5); x.lineTo(C.x, ty + 1); x.closePath(); x.fill(); x.stroke(); } } };

/* ---------- 主角的框（右下，跟魔物的框一樣高） ---------- */
{ const B = Battle.prototype, _db = B.drawBoxH; B.drawBoxH = function (x) { if (!GBA26.on) return _db.call(this, x);
    const bh = this.boxH; this.boxH = BH + 60; try { _db.call(this, x); } finally { this.boxH = bh; } // 舊的狀態卡・頭旁的牌子都不畫（狀態排到框上面）
    const st = Game.st, Hv = this.H; if (!Hv) return; const Y = Math.round(this.boxH) - 9; if (Y >= BH) return;
    const S = KB12.S, M = KB12.M, w = 100, X = W - w - 3, h = TK26.PH;
    techBox26(x, X, Y, w, h);
    tt26(x, st.name, X + 4, Y + 7.5, TK26.txt, M); ttr26(x, 'Lv' + st.lv, X + w - 4, Y + 8, TK26.mut, S);
    const r = clamp(Hv.hp / Math.max(1, Hv.maxhp), 0, 1), mr = clamp(Hv.mp / (Hv.maxmp || 1), 0, 1), hn = Math.ceil(Hv.hp) + '/' + Hv.maxhp, mn = Math.round(Hv.mp) + '/' + (Hv.maxmp || 0), nw = Math.ceil(Math.max(Font.width(hn, S), Font.width(mn, S))) + 3;
    tt26(x, 'HP', X + 4, Y + 16.5, TK26.mut, S); techBar26(x, X + 16, Y + 14.5, w - 20 - nw, r); ttr26(x, hn, X + w - 4, Y + 16.5, TK26.txt, S);
    tt26(x, 'MP', X + 4, Y + 25.5, TK26.mut, S); techBar26(x, X + 16, Y + 23.5, w - 20 - nw, mr, TK26.mp); ttr26(x, mn, X + w - 4, Y + 25.5, TK26.txt, S);
    // 職業的格子
    let gx = X + 4; const gauge = (label, n, N, yy, ok, blink) => { const lw = Math.ceil(Font.width(label, S)); tt26(x, label, gx, Y + 35, ok ? TK26.sel : TK26.mut, S); gx += lw + 2;
      for (let i = 0; i < N; i++) { x.fillStyle = i < n ? (blink && Math.floor(this.t / 8) % 2 ? '#ffffff' : ok ? TK26.sel : TK26.cyan) : 'rgba(120,200,255,0.2)'; x.fillRect(gx, Y + 33.5, 3, 3); gx += 4; } gx += 4; };
    if ('wc' in Hv.max && Hv.max.wc) { const n = Math.min(Hv.max.wc, Hv.res.wc || 0); gauge('特技', n, Hv.max.wc, 0, n >= Hv.max.wc, n >= Hv.max.wc); }
    try { this.drawClassRes(x, gauge, 0); } catch (e) { }
    // 框的正上方：連段（左）・狀態（右對齊）
    const L = KB12.signs.call(this, Hv, false); if ((Hv.res.combo || 0) > 0) { const step = (this.core.byId.H.data.comboStep || 6); L.unshift(['連段×' + Hv.res.combo + ' +' + step * Hv.res.combo + '%', TK26.sel]); }
    if (L.length) { const ws = L.map(q => KB12.chipW(q[0])); let tot = 0, nOk = 0; for (const w2 of ws) { if (tot + w2 > w) break; tot += w2 + 2; nOk++; } let cx = X + w - tot + 2; for (let i = 0; i < nOk; i++) { KB12.chip(x, L[i][0], cx, Y - 11, L[i][1]); cx += ws[i] + 2; } } }; }

/* ---------- 指令：左邊「要做什麼？」，右邊 3×2 ---------- */
{ const _ch = choose; choose = function* (items, o = {}) {
    if (!(GBA26.on && Game.scene instanceof Battle) || !o.buttons || o.cols !== 5 || items.length !== 5 || !o.drawExtra) return yield* _ch(items, o);
    const names = ['攻擊', '技能', '道具', '防禦', '逃跑'], X0 = 62, cw = 37, rh = 17, Y0 = BB_Y + 2;
    const o2 = { ...o, x: X0, y: Y0, w: W - X0 - 4, h: rh * 2, cols: 3, colW: cw, rowH: rh, ox: 0, oy: 0,
      drawExtra: (x, m) => { techBox26(x, 3, BB_Y + 1, X0 - 5, BB_H - 3); const cx = 3 + (X0 - 5) / 2; KB12.tc(x, Game.st.name, cx, BB_Y + 12, TK26.cyan, KB12.M, X0 - 12); KB12.tc(x, '要做什麼？', cx, BB_Y + 25, TK26.txt, KB12.M, X0 - 12);
        names.forEach((nm, k) => { const X = m.x + (k % 3) * cw, Y = m.y + Math.floor(k / 3) * rh, sel = k === m.i; techBox26(x, X, Y, cw - 2, rh - 1, { on: sel }); KB12.tc(x, nm, X + (cw - 2) / 2 + (sel ? 2 : 0), Y + (rh - 1) / 2, sel ? '#fff4c8' : TK26.txt, KB12.M);
          if (sel) { const cy = Y + (rh - 1) / 2; x.fillStyle = TK26.sel; x.beginPath(); x.moveTo(X + 3, cy - 3); x.lineTo(X + 6.5, cy); x.lineTo(X + 3, cy + 3); x.closePath(); x.fill(); } }); } };
    return yield* _ch(items, o2); }; }

/* ---------- 大招特寫：斜切的一條 ---------- */
function drawCut26(b, x) { const c = b.cut26; if (!c) return; const t = c.t, L = c.life, a = Math.min(ease26(t / 7), t > L - 8 ? (L - t) / 8 : 1), cy = 96, hh = 54, slide = (1 - ease26(t / 8)) * -W;
  x.save(); x.globalAlpha = 0.5 * a; x.fillStyle = '#000'; x.fillRect(0, -(TALL_EXT || 0), W, BH + (TALL_EXT || 0)); x.restore();
  x.save(); x.translate(W / 2 + slide, cy); x.rotate(-0.16); x.globalAlpha = a;
  const g = x.createLinearGradient(-W, 0, W, 0); g.addColorStop(0, 'rgba(4,10,22,0.96)'); g.addColorStop(0.5, 'rgba(14,40,70,0.96)'); g.addColorStop(1, 'rgba(4,10,22,0.96)'); x.fillStyle = g; x.fillRect(-W, -hh / 2, W * 2, hh);
  x.fillStyle = TK26.cyan; x.fillRect(-W, -hh / 2, W * 2, 1); x.fillRect(-W, hh / 2 - 1, W * 2, 1); x.fillStyle = 'rgba(120,220,255,0.06)'; for (let yy = -hh / 2; yy < hh / 2; yy += 2) x.fillRect(-W, yy, W * 2, 1);
  x.strokeStyle = 'rgba(160,230,255,0.35)'; x.lineWidth = 0.7; for (let i = 0; i < 9; i++) { const yy = -hh / 2 + 5 + i * 5.5, off = (t * 9 + i * 37) % 120; x.beginPath(); x.moveTo(-W + off * 3, yy); x.lineTo(-W + off * 3 + 40, yy); x.stroke(); }
  const Hv = b.H, im = Hv && Hv.img; if (im) { const ds = im.ds || 1, s = 1.1, w = im.width * ds * s, h = im.height * ds * s; x.save(); x.beginPath(); x.rect(-W, -hh / 2 + 1, W * 2, hh - 2); x.clip(); x.imageSmoothingEnabled = false; x.drawImage(im, -W / 2 + 2 - (t < 8 ? (8 - t) * 2 : 0), hh / 2 - h * 0.8, w, h); x.restore(); }
  x.restore();
  x.save(); x.globalAlpha = a; const sc = t < 6 ? 1.6 - t * 0.1 : 1; x.translate(W / 2 + 26, cy - 6); x.rotate(-0.16); x.scale(sc, sc); KB12.num(x, c.s, 0, 0, '#eafaff', KB12.L); x.restore(); }
/* ---------- 頭目・菁英登場：名字 ---------- */
function drawName26(b, x) { const c = b.name26; if (!c) return; const t = c.t, L = c.life, a = t < 6 ? t / 6 : t > L - 14 ? Math.max(0, (L - t) / 14) : 1, E = TALL_EXT || 0, cy = E >= 40 ? 74 - E : 66, col = c.boss ? TK26.warn : TK26.caution;
  x.save(); x.globalAlpha = a; const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(4,10,22,0)'); g.addColorStop(0.12, 'rgba(4,10,22,0.92)'); g.addColorStop(0.88, 'rgba(4,10,22,0.92)'); g.addColorStop(1, 'rgba(4,10,22,0)'); x.fillStyle = g; x.fillRect(0, cy - 16, W, 32);
  x.fillStyle = col; x.fillRect(0, cy - 16, W, 1); x.fillRect(0, cy + 15, W, 1); for (let i = 0; i < 9; i++) { x.fillRect(4 + i * 6, cy - 14, 3, 1); x.fillRect(W - 7 - i * 6, cy + 13, 3, 1); }
  KB12.tc(x, c.boss ? '頭目' : '菁英', W / 2, cy - 8, col, KB12.S);
  const sc = t < 8 ? 1.5 - t * 0.0625 : 1; x.translate(W / 2, cy + 5); x.scale(sc, sc); KB12.num(x, c.s, 0, 0, '#ffffff', KB12.L); x.restore(); }
