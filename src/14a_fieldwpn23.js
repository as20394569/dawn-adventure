/* ===================== v12.150 野外走路時的武器 =====================
   玩家 2026-10-12：「修正武器在一般走路時的外觀問題」
   原本：野外的主角身上是程式畫的「通用武器」—— 劍是一根白色長條（像棍子）、斧頭只有柄頂兩三格（看起來像頭上的髮飾）、
   長槍畫成法杖、拳套畫成短刀；也跟裝備的那把武器長得完全不一樣（戰鬥裡已經是 Codex 畫的專屬武器圖）。
   而且主角 16 格寬、頭就佔了 14 格，武器只能塞在最右邊 1 格 → 不管怎麼畫都只看得到一條線。
   現在：用戰鬥裡同一張武器圖（像素用「多數決」縮小，不會碎），而且允許武器超出主角的 16×22 小框 ——
   · 劍・斧・長槍・法杖：斜背在背上，上半截（劍身／斧頭／槍頭／杖頭）從肩膀後面斜斜伸出來。
     正面：從右肩後面伸出；背面：整把斜在背上（蓋在衣服上、在頭的後面），從左肩伸出；側面：從背後那一側伸出。
   · 短刀：拿在手上，刀尖朝下。· 拳套：兩隻手直接戴上縮小的拳套圖。
   · 雙持：背兩把交叉成 X／兩手各拿一把。走路一上一下時武器跟著身體動。
   選單裡的小人像（16×22）照舊用原本那張（不放超出框的武器）。沒有武器圖的特殊武器照舊用原本的畫法。 */
const FW23 = { cache: {}, P: 8 }; // 野外用的大張畫布：左右上各多 8 格、下面多 2 格，主角在 (8,8)
// 縮小：每個新像素看原圖對應的那一塊，選佔最多的顏色（透明佔太多就透明）
function wpnShrink23(im, sc) { const key = sc; im.fw23 = im.fw23 || {}; if (im.fw23[key]) return im.fw23[key];
  const W0 = im.width, H0 = im.height, w = Math.max(1, Math.round(W0 * sc)), h = Math.max(1, Math.round(H0 * sc)), s = mkCanvas(W0, H0), sg = s.getContext('2d'); sg.drawImage(im, 0, 0);
  const d = sg.getImageData(0, 0, W0, H0).data, c = mkCanvas(w, h), g = c.getContext('2d'), o = g.createImageData(w, h);
  if (sc === 1) o.data.set(d); else for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const x0 = x / sc, x1 = (x + 1) / sc, y0 = y / sc, y1 = (y + 1) / sc, wt = new Map(); let cov = 0, area = 0;
    for (let sy = Math.floor(y0); sy < Math.ceil(y1) && sy < H0; sy++) for (let sx = Math.floor(x0); sx < Math.ceil(x1) && sx < W0; sx++) { const a = (Math.min(x1, sx + 1) - Math.max(x0, sx)) * (Math.min(y1, sy + 1) - Math.max(y0, sy)); if (a <= 0) continue; area += a;
      const i = (sy * W0 + sx) * 4; if (!d[i + 3]) continue; cov += a; const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; wt.set(k, (wt.get(k) || 0) + a); }
    if (cov < area * 0.4) continue; let best = 0, bw = -1; for (const [k, a] of wt) if (a > bw + 1e-6 || (Math.abs(a - bw) < 1e-6 && ((k >> 16) + ((k >> 8) & 255) + (k & 255)) > ((best >> 16) + ((best >> 8) & 255) + (best & 255)))) { best = k; bw = a; }
    const j = (y * w + x) * 4; o.data[j] = best >> 16; o.data[j + 1] = (best >> 8) & 255; o.data[j + 2] = best & 255; o.data[j + 3] = 255; }
  // 外面描一圈深色邊（跟主角一樣的描邊），草地・雪地上都看得清楚
  const O = g.createImageData(w + 2, h + 2), od = O.data, K = [42, 34, 56]; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const j = (y * w + x) * 4, t = ((y + 1) * (w + 2) + x + 1) * 4; if (o.data[j + 3]) for (let q = 0; q < 4; q++) od[t + q] = o.data[j + q]; }
  for (let y = 0; y < h + 2; y++) for (let x = 0; x < w + 2; x++) { const t = (y * (w + 2) + x) * 4; if (od[t + 3]) continue; let n = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx - 1, Y = y + dy - 1; if (X >= 0 && Y >= 0 && X < w && Y < h && o.data[(Y * w + X) * 4 + 3] && !isDark23(o.data, (Y * w + X) * 4)) n++; }
    if (n) { od[t] = K[0]; od[t + 1] = K[1]; od[t + 2] = K[2]; od[t + 3] = 255; } }
  const c2 = mkCanvas(w + 2, h + 2); c2.getContext('2d').putImageData(O, 0, 0); return (im.fw23[key] = bb23(c2)); }
const isDark23 = (d, i) => d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11 < 60;
function bb23(c) { const w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  c.bb23 = x1 < 0 ? [0, 0, 0, 0] : [x0, y0, x1, y1]; return c; }
// 翻轉（左右 fx・上下 fy），結果記起來
function wpnFlip23(S, fx, fy) { if (!fx && !fy) return S; const k = (fx ? 'x' : '') + (fy ? 'y' : ''); S.fl23 = S.fl23 || {}; if (S.fl23[k]) return S.fl23[k];
  const c = mkCanvas(S.width, S.height), g = c.getContext('2d'); g.translate(fx ? S.width : 0, fy ? S.height : 0); g.scale(fx ? -1 : 1, fy ? -1 : 1); g.drawImage(S, 0, 0); return (S.fl23[k] = bb23(c)); }
const FW23_BACK = new Set(['劍', '斧', '長槍', '法杖']), FW23_HAND = new Set(['短刀', '拳套']);
const FW23_SC = { 劍: 0.8, 斧: 0.68, 長槍: 0.9, 法杖: 0.85, 短刀: 0.5, 拳套: 0.34 };
// 野外紙娃娃也記下副手（雙持時背兩把）
{ const _hl = heroLookOf; heroLookOf = function (st = Game.st, over = {}) { const L = _hl(st, over), eq = { ...(st && st.equip || {}), ...over }, o = st && gearBy(eq.shield, st);
    if (o && GEAR[o.b] && GEAR[o.b].slot === 'weapon' && WEAPON_PX[o.gl && GEAR[o.gl] ? o.gl : o.b]) L.wkey2 = o.gl && GEAR[o.gl] ? o.gl : o.b; return L; }; }
// 一個方向、一格畫面：回傳 [{S, X, Y, front}]（X,Y = 武器圖外框左上角，用主角 16×22 的座標）
function fwParts23(kind, S1, S2, dir, off) { const out = [], bw = S => S.bb23[2] - S.bb23[0] + 1, bh = S => S.bb23[3] - S.bb23[1] + 1;
  if (FW23_BACK.has(kind)) { // 武器圖本來就是「握把在左下、尖端在右上」
    const at = (S, cx, cy) => [cx - Math.round(0.42 * bw(S)), cy - Math.round(0.58 * bh(S))]; // 讓武器在 (cx,cy) 這點從身體後面穿出來
    if (dir === 'down') { const [X, Y] = at(S1, 15, 12 + off); out.push({ S: S1, X, Y });
      if (S2) { const T = wpnFlip23(S2, 1, 0), [X2, Y2] = at(S2, 15, 12 + off); out.push({ S: T, X: 16 - X2 - bw(T), Y: Y2 }); } }
    if (dir === 'up') { const T = wpnFlip23(S1, 1, 0), [X, Y] = at(S1, 15, 12 + off); out.push({ S: T, X: 16 - X - bw(T), Y, back: 1 });
      if (S2) { const [X2, Y2] = at(S2, 15, 12 + off); out.push({ S: S2, X: X2, Y: Y2, back: 1 }); } }
    if (dir === 'left') { const [X, Y] = at(S1, 13, 12 + off); out.push({ S: S1, X, Y }); }
    return out; }
  if (kind === '短刀') { // 拿在手上，刀尖朝下往外
    const hand = (S, hx, hy, fx) => { const T = wpnFlip23(S, fx, 1); out.push({ S: T, X: fx ? hx - bw(T) + 2 : hx - 1, Y: hy - 1, front: 1 }); };
    if (dir === 'down') { hand(S1, 13, 16 + off, 0); if (S2) hand(S2, 2, 16 + off, 1); }
    if (dir === 'up') { hand(S1, 2, 16 + off, 1); if (S2) hand(S2, 13, 16 + off, 0); }
    if (dir === 'left') hand(S1, 4, 15 + off, 1);
    return out; }
  if (kind === '拳套') { // 拳套圖縮小直接蓋在兩隻手上
    const glove = (S, hx, hy, fx) => { const T = wpnFlip23(S, fx, 0); out.push({ S: T, X: hx - (bw(T) >> 1), Y: hy + 1 - (bh(T) >> 1), front: 1 }); };
    if (dir === 'down' || dir === 'up') { glove(S1, 13, 16 + off, 0); glove(S2 || S1, 2, 16 + off, 1); }
    if (dir === 'left') glove(S1, 4, 15 + off, 1);
    return out; }
  return out; }
{ const _fl = heroFramesLook; heroFramesLook = function (L) { const k = L && L.wkey, G = k && GEAR[k], kind = G && G.kind, im = k && weaponPx(k);
    if (!G || !im || !(FW23_BACK.has(kind) || FW23_HAND.has(kind))) return _fl(L);
    const key = lookKey(L); if (FW23.cache[key]) return FW23.cache[key];
    const sc = FW23_SC[kind], S1 = wpnShrink23(im, sc), im2 = L.wkey2 && weaponPx(L.wkey2), S2 = im2 ? wpnShrink23(im2, sc) : null;
    const base = _fl({ ...L, weapon: null }), out = {}, P = FW23.P;
    for (const d of ['down', 'up', 'left']) out[d] = base[d].map((fr, i) => { const off = i % 2 ? -1 : 0, parts = fwParts23(kind, S1, S2, d, off), neck = 12 + off;
      const big = mkCanvas(16 + 2 * P, 22 + P + 2), g = big.getContext('2d'); g.imageSmoothingEnabled = false;
      const put = (p, y0, y1) => { const [bx, by] = p.S.bb23, X = p.X + P, Y = p.Y + P; // 只畫主角座標 y0〜y1 那幾列
        const a = Math.max(0, y0 + P - Y + by), b = Math.min(p.S.height, y1 + P - Y + by); if (b > a) g.drawImage(p.S, 0, a, p.S.width, b - a, X - bx, Y - by + a, p.S.width, b - a); };
      for (const p of parts) if (!p.front) put(p, -P, p.back ? neck : 99); // 身體後面（背面的話只畫脖子以上那段）
      g.drawImage(fr, P, P);
      for (const p of parts) if (p.front) put(p, -P, 99); else if (p.back) put(p, neck, 99); // 背面：脖子以下那段蓋在衣服上
      const c = mkCanvas(16, 22); c.getContext('2d').drawImage(fr, 0, 0); big.o23 = P; c.ow23 = big; return c; });
    out.right = out.left.map(c => { const f = flipCanvas(c); f.ow23 = flipCanvas(c.ow23); f.ow23.o23 = P; return f; });
    return (FW23.cache[key] = out); }; }
