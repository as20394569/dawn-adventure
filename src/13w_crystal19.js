/* ===================== v12.137 拿到晶石：像拿到裝備一樣的展示 =====================
   玩家 2026-10-11：「得到晶石也能做獲取圖卡跟裝備那樣。晶石就畫結晶，然後中間怪物頭像就好，叫 Codex 畫」
   以前拿到晶石只有一行「得到了『狂牙狼晶石』！」。現在跟掉裝備一樣：
   1. 一顆晶石顏色的光球從倒下的魔物身上飛到畫面中間、爆開；
   2. 展示卡滑進來：光芒、晶石（結晶裡面是那隻魔物的頭像）、名字 ★1、種類（武器・防具・飾品・通用・異色＋系列）、效果、去哪裡鑲。
   晶石的圖（Codex 任務 AY）：art/battle/crystals/ 的結晶外框（後層＋前層的反光，5 種顏色）和 heads/ 的魔物頭像（150 隻），
   遊戲把「後層 → 頭像 → 前層」疊起來。圖還沒到之前：用程式畫的結晶，頭像先從戰鬥圖裁。
   背包的晶石頁：每一行前面也有一顆小晶石（種類的顏色；Codex 的 icon_<種類>）。 */
const CRY19 = {
  col: { w: '#ff7a64', a: '#6cb4ff', c: '#d08cff', u: '#7ef0c8', iro: '#ffd86a' },
  name: { w: '武器', a: '防具', c: '飾品', u: '通用', iro: '異色' },
  px: {}, head: {}
};
const cryKind19 = sp => /^iro_/.test(sp) ? 'iro' : (CRY11[sp] ? CRY11[sp][0] : 'u');
function cryPx19(k) { if (k in CRY19.px) return CRY19.px[k]; const R = typeof CRYSTAL_PX_ROWS !== 'undefined' && CRYSTAL_PX_ROWS[k]; if (!R) return (CRY19.px[k] = null);
  const [cols, rows] = R, pal = {}; cols.forEach((h, i) => pal['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = h); const c = spriteFrom(rows, pal); c.ok = true; return (CRY19.px[k] = c); }
// 頭像：Codex 畫的 heads/<sp>；還沒有的話從戰鬥圖的待機那張裁上半部
function cryHead19(sp) { const own = cryPx19('h_' + sp); if (own) return own; if (sp in CRY19.head) return CRY19.head[sp];
  let out = null; try { const S = pxSpec(sp); if (S) { const A = { state: 'idle', t: 0, dur: 1, phase: 0 }, im = pxRender(A, S, 0); const bb = im.bb || { cx: im.width / 2, bot: im.height, w: im.width, h: im.height };
      const bw = Math.max(8, bb.w || im.width), bh = Math.max(8, bb.h || im.height), side = Math.min(bw, bh, 48), x0 = Math.round((bb.cx ?? im.width / 2) - side / 2), y0 = Math.round((bb.bot ?? im.height) - bh);
      const c = mkCanvas(20, 20), g = c.getContext('2d'); g.imageSmoothingEnabled = false; const k = 20 / side; g.drawImage(im, x0, y0, side, side, 0, 0, side * k, side * k); c.ok = true; out = c; } } catch (e) { out = null; }
  return (CRY19.head[sp] = out); }
// 結晶（中心 cx, cy；原尺寸 32×40，sc 倍）
function drawCrystal19(x, sp, cx, cy, sc = 1, t = 0) { const kd = cryKind19(sp), col = kd === 'iro' ? hsl2hex((t * 2) % 360, 0.75, 0.68) : CRY19.col[kd];
  const back = cryPx19('frame_' + kd + '_back'), front = cryPx19('frame_' + kd + '_front'), head = cryHead19(sp), X0 = Math.round(cx - 16 * sc), Y0 = Math.round(cy - 20 * sc);
  x.save(); x.imageSmoothingEnabled = false;
  if (back) { x.drawImage(back, X0, Y0, 32 * sc, 40 * sc); if (head) x.drawImage(head, Math.round(cx - 10 * sc), Math.round(cy - 10 * sc), 20 * sc, 20 * sc); if (front) x.drawImage(front, X0, Y0, 32 * sc, 40 * sc); x.restore(); return; }
  // 圖還沒到：程式畫的結晶
  const P = [[0, -20], [13, -11], [13, 11], [0, 20], [-13, 11], [-13, -11]].map(([a, b]) => [cx + a * sc, cy + b * sc]), path = (q, s2 = 1) => { x.beginPath(); q.forEach(([a, b], i) => { const X = cx + (a - cx) * s2, Y = cy + (b - cy) * s2; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath(); };
  path(P); x.fillStyle = '#10121e'; x.fill(); path(P, 0.9); const gr = x.createLinearGradient(cx - 12 * sc, cy - 18 * sc, cx + 12 * sc, cy + 18 * sc); gr.addColorStop(0, shade(col, 0.55)); gr.addColorStop(0.5, shade(col, -0.35)); gr.addColorStop(1, shade(col, -0.6)); x.fillStyle = gr; x.fill();
  if (head) { x.save(); path(P, 0.78); x.clip(); x.globalAlpha = 0.95; x.drawImage(head, Math.round(cx - 10 * sc), Math.round(cy - 10 * sc), 20 * sc, 20 * sc); x.restore(); }
  x.strokeStyle = shade(col, 0.5); x.lineWidth = Math.max(1, sc * 0.6); x.globalAlpha = 0.55; x.beginPath(); x.moveTo(cx, cy - 20 * sc); x.lineTo(cx - 6 * sc, cy - 9 * sc); x.moveTo(cx, cy - 20 * sc); x.lineTo(cx + 6 * sc, cy - 9 * sc); x.stroke();
  x.globalAlpha = 0.9; x.fillStyle = '#ffffff'; x.fillRect(Math.round(cx - 9 * sc), Math.round(cy - 9 * sc), Math.max(1, Math.round(2 * sc)), Math.max(1, Math.round(5 * sc))); x.fillRect(Math.round(cx + 7 * sc), Math.round(cy + 6 * sc), Math.max(1, Math.round(sc)), Math.max(1, Math.round(2 * sc)));
  x.restore(); }
// 背包列表的小晶石（12×14；Codex 的 icon_<種類>，還沒到就畫一顆小的）
function drawCryIcon19(x, sp, X, Y) { const kd = cryKind19(sp), ic = cryPx19('icon_' + kd); x.save(); x.imageSmoothingEnabled = false;
  if (ic) x.drawImage(ic, X, Y); else { const col = CRY19.col[kd], cx = X + 6, cy = Y + 7; x.fillStyle = '#10121e'; x.beginPath(); x.moveTo(cx, cy - 7); x.lineTo(cx + 5, cy - 3); x.lineTo(cx + 5, cy + 3); x.lineTo(cx, cy + 7); x.lineTo(cx - 5, cy + 3); x.lineTo(cx - 5, cy - 3); x.closePath(); x.fill();
    x.fillStyle = col; x.beginPath(); x.moveTo(cx, cy - 5); x.lineTo(cx + 4, cy - 2); x.lineTo(cx + 4, cy + 2); x.lineTo(cx, cy + 5); x.lineTo(cx - 4, cy + 2); x.lineTo(cx - 4, cy - 2); x.closePath(); x.fill(); x.fillStyle = '#ffffff'; x.fillRect(cx - 2, cy - 3, 1, 3); }
  x.restore(); }

// 展示
Battle.prototype.cryShow19 = function* (sp, head) {
  const kd = cryKind19(sp), col0 = CRY19.col[kd], [cr, cg, cb] = hex2rgb(col0), v = this.foes(true).find(q => q.sp === sp) || this.focus || this.F, C = this.center(v), T = { x: 88, y: 96 };
  // 1) 光球
  Sound.sfx('charge'); const orb = { t: 0 }; const u = { draw: x => { const k = Math.min(1, orb.t / 26), e = 1 - Math.pow(1 - k, 2), X = lerp(C.x, T.x, e), Y = lerp(C.y, T.y, e) - Math.sin(k * Math.PI) * 34, R = 7 + Math.sin(orb.t / 3) * 1.5;
      const g = x.createRadialGradient(X, Y, 0, X, Y, R * 2.6); g.addColorStop(0, `rgba(${cr},${cg},${cb},0.9)`); g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`); x.fillStyle = g; x.fillRect(X - R * 3, Y - R * 3, R * 6, R * 6);
      x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(X, Y - R * 0.7); x.lineTo(X + R * 0.45, Y); x.lineTo(X, Y + R * 0.7); x.lineTo(X - R * 0.45, Y); x.closePath(); x.fill(); } };
  UI.push(u); for (let i = 0; i < 28; i++) { orb.t++; if (i % 3 === 0) { const k = Math.min(1, orb.t / 26), e = 1 - Math.pow(1 - k, 2); this.spawn({ k: 'dot', x: lerp(C.x, T.x, e), y: lerp(C.y, T.y, e) - Math.sin(k * Math.PI) * 34, vx: rnd(-0.4, 0.4), vy: rnd(-0.2, 0.6), c: pick([col0, '#ffffff']), s: 2, life: 16 }); } yield; }
  UI.remove(u); this.sparks(T.x, T.y, 34, [col0, '#ffffff', shade(col0, 0.4)], 2.6, 24, 0.06); this.spawn({ k: 'flash', c: col0, a: 0.4, life: 8 }); this.shake = 6; Sound.sfx('crit'); Sound.jingle('item');
  // 2) 展示卡
  const C11 = CRY11[sp] || ['u', '單顆'], ser = kd === 'iro' ? '哪個部位都能鑲' : (C11[1] && C11[1] !== '單顆' ? C11[1] + '系列' : '單顆'), kindT = CRY19.name[kd] + '晶石・' + ser, nm = cryName11(sp) + ' ★1', CW = 160;
  const info = []; for (const l of Font.wrap(cryText11(sp, 1), CW - 20, 10)) info.push(l);
  const hint = kd === 'iro' ? '到鐵匠鑲進任何裝備的孔；牠的虹鱗・虹心可以升級' : '到鐵匠鑲進' + (kd === 'u' ? '任何裝備' : kd === 'w' ? '武器' : kd === 'a' ? '頭・身・腳・盾' : '飾品') + '的孔（紫・紅 1 孔，金以上 2 孔）', hintL = Font.wrap(hint, CW - 20, 8);
  const CH = Math.min(H - 8, 118 + info.length * 12 + hintL.length * 10 + 16), CY = CH <= BH - 8 ? Math.max(6, Math.round((BH - CH) / 2)) : Math.round((H - CH) / 2);
  const s = { t: 0, out: 0, draw(x) { s.t++; const a = s.out ? Math.max(0, 1 - s.out / 6) : Math.min(1, s.t / 8), slide = Math.round((1 - Math.min(1, s.t / 8)) * 18), col = kd === 'iro' ? hsl2hex((s.t * 2) % 360, 0.75, 0.7) : col0, [r1, g1, b1] = hex2rgb(col);
    x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(4,4,12,0.55)'; x.fillRect(0, -(typeof TALL_EXT !== 'undefined' ? TALL_EXT : 0), W, H + (typeof TALL_EXT !== 'undefined' ? TALL_EXT : 0));
    const X = (W - CW) / 2, Y = CY + slide, w = CW, h = CH; x.fillStyle = '#0c0f1e'; x.fillRect(X + 2, Y + 2, w - 4, h - 4); drawWin(x, X, Y, w, h, 'menu');
    { const hd = head || '得到了晶石！'; let z = 10; while (z > 7 && Font.width(hd, z) > w - 12) z--; Font.drawC(x, hd, W / 2, Y + 4 + (10 - z) / 2, col, UIC.textSh, z); }
    const cx = W / 2, cy = Y + 50; x.save(); x.translate(cx, cy); x.rotate(s.t / 90);
    for (let i = 0; i < 12; i++) { x.rotate(Math.PI / 6); const gr = x.createLinearGradient(0, 0, 0, -40); gr.addColorStop(0, `rgba(${r1},${g1},${b1},0.5)`); gr.addColorStop(1, `rgba(${r1},${g1},${b1},0)`); x.fillStyle = gr; x.beginPath(); x.moveTo(-3, 0); x.lineTo(3, 0); x.lineTo(7, -40); x.lineTo(-7, -40); x.closePath(); x.fill(); }
    x.restore(); const glow = x.createRadialGradient(cx, cy, 0, cx, cy, 28); glow.addColorStop(0, `rgba(${r1},${g1},${b1},0.5)`); glow.addColorStop(1, `rgba(${r1},${g1},${b1},0)`); x.fillStyle = glow; x.fillRect(cx - 30, cy - 30, 60, 60);
    drawCrystal19(x, sp, cx, cy + Math.round(Math.sin(s.t / 14) * 2), 1.5, s.t);
    for (let i = 0; i < 4; i++) { const an = s.t / 30 + i * 1.57, rr = 32 + Math.sin(s.t / 11 + i) * 4; x.fillStyle = i % 2 ? '#ffffff' : col; x.fillRect(Math.round(cx + Math.cos(an) * rr), Math.round(cy + Math.sin(an) * rr * 0.7), 2, 2); }
    let y = Y + 84; { let z = 12; while (z > 9 && Font.width(nm, z) > w - 16) z--; Font.drawC(x, nm, W / 2, y, col, UIC.textSh, z); } y += 15; Font.drawC(x, kindT, W / 2, y - 1, UIC.muted, UIC.textSh, 8); y += 11;
    x.fillStyle = `rgba(${r1},${g1},${b1},0.5)`; x.fillRect(X + 10, y, w - 20, 1); y += 4;
    for (const l of info) { Font.draw(x, l, X + 10, y, UIC.text, UIC.textSh, 10); y += 12; } y += 2;
    for (const l of hintL) { Font.draw(x, l, X + 10, y, UIC.muted, UIC.textSh, 8); y += 10; }
    const blink = Math.floor(s.t / 20) % 2; Font.drawR(x, 'A：繼續', X + w - 10, Y + h - 13, blink ? UIC.accent : '#ffffff', UIC.textSh, 9);
    x.restore(); } };
  UI.push(s); for (let i = 0; i < 10; i++) yield; Input.consume('a', 'b');
  while (!(Input.pressed('a') || Input.pressed('b'))) { if (Game.autoPlay && s.t > 30) break; yield; } Input.consume('a', 'b'); Sound.sfx('cursor');
  for (s.out = 1; s.out <= 6; s.out++) yield; UI.remove(s); };

// 拿到晶石的兩個地方：菁英・頭目第一次打倒、異色魔物（只換掉「得到了…晶石」那一句，後面的教學照舊）
{ const B = Battle.prototype, _m = B.msg;
  B.msg = function* (text, ...a) { if (typeof text === 'string' && this.cryShow19) { const r = /^得到了(?:特殊晶石)?「(.+晶石)」！$/.exec(text);
      if (r && typeof CRY11 !== 'undefined') { const sp = Object.keys(CRY11).find(k => cryName11(k) === r[1] && cryOwn11(Game.st)[k]); if (sp) return yield* this.cryShow19(sp, /特殊/.test(text) ? '得到了特殊晶石！' : '得到了晶石！'); } }
    return yield* _m.call(this, text, ...a); }; }

