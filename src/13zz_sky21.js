/* ===================== v12.145 戰鬥：頭上的天空・光線跟著時間和天氣 =====================
   玩家 2026-10-12：「戰鬥時怪物頭上空白區塊有什麼作用」「背景圖片光線不太自然」「隨著時間的光線變化」
   → 頭上那塊選了「做成天空，顯示時間和天氣」；時間照遊戲內時間（走路計時）。
   1. 手機直拿時多出來的上方（以前是把背景整張拉長，魔物頭上一大片糊掉的背景）：
      背景照原本大小畫，多出來的列變成天空 ——
      · 野外的空地（草原・道路・湖・海邊・雪原・峽谷…）：真的天空。顏色照時間連續變（清晨粉橘 → 白天藍 → 傍晚橘紅 → 夜晚深藍），
        太陽從左邊升起、中午最高、傍晚落到右邊，晚上換月亮和星星；天氣：晴天幾朵雲（早晚被染成橘粉、晚上是暗藍色的），
        小雨・大雨・暴雨雲越來越多越暗（暴雨會閃電），起霧・下雪・沙塵整片天變灰白／黃。背景原本畫死的天空（湖永遠是晚上、峽谷永遠是黃昏…）
        也換成這片會變的天空，山・樹・城堡這些輪廓留著。
      · 森林：往上是樹冠，縫隙看得到天空（白天藍、晚上有星星、下雨是灰的）。
      · 室內・洞窟・神殿：天花板往上延伸、越上面越暗。
      魔物站回背景原本的位置（v12.133 為了拉長的背景往上挪的那段不需要了）。
   2. 光線：
      · 主光從太陽（晚上是月亮）那一側照過來：早上從左、傍晚從右，另一側是冷色的影子；中午最亮、早晚有一層暖橘色的光，晚上偏藍偏暗。
        以前固定從左上照、四個時段直接換色（黃昏整片變成黃綠色）。
      · 光束：以前不管晚上、下雨都有三道硬邊的光條從左上斜下來，森林背景裡還畫死了另一組角度不同的光條。
        現在只有森林在出太陽的時候，從樹冠縫隙照下來（邊緣柔和、方向跟著太陽，早晚比較斜、比較暖）；室內照舊但改成柔和的光。
      · 下雨：越大越暗、顏色越淡（灰）；起霧・下雪・沙塵也各自調色。大雨以上不飄光點。
      · 角色身上的光也一樣：太陽那側亮、另一側冷，晚上偏藍。
   3. 野外地圖：早上和傍晚太陽那一側（早上東邊、傍晚西邊）多一層暖光，另一側偏藍。 */
const SKY21_HOR = { field: 64, meadow: 72, dusk: 76, ruinsOut: 92, canyon: 78, swamp: 90, lake: 70, plainsGold: 74, snow: 82, snowPeak: 82, beach13: 58, deck14: 52 }; // 每張背景天空的底（地平線）
SKY21.OPEN = new Set(Object.keys(SKY21_HOR)); SKY21.CANOPY = new Set(['forest', 'glade', 'mushwood']);
const hx21 = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix21 = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const mul21 = (a, b) => a.map((v, i) => Math.round(v * b[i] / 255));
const rgb21 = (c, a) => a == null ? 'rgb(' + c.join(',') + ')' : 'rgba(' + c.join(',') + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
const lum21 = c => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
function keys21(K, c) { for (let i = 0; i < K.length - 1; i++) { const A = K[i], B = K[i + 1]; if (c >= A[0] && c <= B[0]) { const t = (c - A[0]) / Math.max(1, B[0] - A[0]); return A.slice(1).map((v, j) => mix21(v, B[j + 1], t)); } } return K[0].slice(1); }
// 天空的顏色（上面・地平線），照時間（換算成一天 2400：0 天亮、300 白天、1300 黃昏、1600 夜晚；實際一天 DN12.LEN 步）
const SKYK21 = [[0, '#1c2450', '#b87a70'], [100, '#3a5590', '#f0a878'], [200, '#5a8cd0', '#f6d0aa'], [300, '#69a7e6', '#d6ecf6'], [800, '#4f98e2', '#c6e6f8'], [1300, '#5aa0de', '#dcecf2'],
  [1420, '#5868a8', '#f6b274'], [1520, '#3a3070', '#f07a4a'], [1600, '#1e1e4a', '#8a4a6a'], [1700, '#0a1030', '#1c2a58'], [2300, '#0a1030', '#1c2a58'], [2400, '#1c2450', '#b87a70']].map(([c, a, b]) => [c, hx21(a), hx21(b)]);
// 整個場景的光（乘上去）
const AMBK21 = [[0, [124, 132, 192]], [120, [236, 204, 192]], [300, [255, 255, 255]], [1300, [255, 255, 255]], [1450, [246, 196, 182]], [1560, [172, 152, 194]], [1700, [106, 120, 182]], [2300, [106, 120, 182]], [2400, [124, 132, 192]]];

// 這場戰鬥的時間和天氣（戶外才有；室內是 null）
function env21(b) { if (b.env21 !== undefined) return b.env21; const cfg = b.cfg || {}, st = Game.st;
  if (!cfg.dn || !st || typeof dnClock12 !== 'function') return (b.env21 = null);
  const c = dnClock12(st) * 2400 / (DN12.LEN || 2400), wx = cfg.wx || 'clear', lv = (wx === 'rain' || wx === 'storm') ? (cfg.rainLv21 || (wx === 'storm' ? 3 : 2)) : 0, kind = b.cfgBg;
  const [top, hor] = keys21(SKYK21, c); let [amb] = keys21(AMBK21, c);
  const s = (c - 100) / 1420, sunUp = s >= 0 && s <= 1, sunE = sunUp ? Math.sin(Math.PI * s) : 0, sunX = 0.1 + 0.8 * clamp(s, 0, 1);
  const m = ((c - 1560 + 2400) % 2400) / 900, moonUp = m >= 0 && m <= 1, moonE = moonUp ? Math.sin(Math.PI * m) : 0, moonX = 0.1 + 0.8 * clamp(m, 0, 1);
  const oc = lv ? [0, 0.45, 0.75, 0.92][lv] : wx === 'fog' ? 0.6 : wx === 'snow' ? 0.55 : wx === 'sand' ? 0.5 : 0;
  const ocBase = wx === 'sand' ? [214, 176, 120] : wx === 'fog' ? [206, 210, 220] : wx === 'snow' ? [196, 206, 222] : lv >= 3 ? [92, 98, 114] : lv === 2 ? [128, 134, 148] : [168, 174, 186], ocCol = mul21(ocBase, amb);
  const skyTop = mix21(top, mul21(ocCol, [220, 220, 220]), oc), skyHor = mix21(hor, ocCol, oc);
  if (lv) amb = mul21(amb, [[255, 255, 255], [232, 236, 244], [206, 212, 228], [172, 178, 200]][lv]); else if (wx === 'fog') amb = mix21(amb, [228, 230, 236], 0.2); else if (wx === 'snow') amb = mix21(amb, [240, 246, 255], 0.1); else if (wx === 'sand') amb = mul21(amb, [255, 232, 196]);
  let key, keyA, lightX, golden = 0;
  if (sunUp) { key = mix21([255, 168, 96], [255, 246, 228], Math.min(1, sunE * 1.8)); keyA = (0.25 + 0.3 * Math.min(1, sunE * 2)) * (1 - oc); lightX = sunX; golden = clamp((0.32 - sunE) / 0.32, 0, 1) * (1 - oc); }
  else { key = [150, 175, 255]; keyA = 0.22 * moonE * (1 - oc); lightX = moonX; }
  const cool = !sunUp ? [20, 30, 80] : mix21([30, 50, 100], [70, 40, 110], golden);
  const sat = lv ? [1, 0.85, 0.72, 0.6][lv] : wx === 'fog' ? 0.8 : wx === 'sand' ? 0.85 : 1;
  const stars = clamp((60 - lum21(top)) / 40, 0, 1) * (1 - oc);
  const type = SKY21.OPEN.has(kind) ? 'open' : SKY21.CANOPY.has(kind) ? 'canopy' : 'special';
  return (b.env21 = { c, wx, lv, oc, skyTop, skyHor, amb, sunUp, sunE, sunX, moonUp, moonE, moonX, key, keyA, lightX, golden, cool, sat, stars, type, seed: ((st.day || 1) * 977 + Math.floor(c / 40) * 31) >>> 0 }); }

/* ---------- 舞台：時間・天氣的光（取代原本的固定左上主光、四個時段的換色） ---------- */
function hd2dStage21(bg, kind, D, E) {
  const L = hd2dLook(kind), w = W * D, h = BH * D, c = mkCanvas(w, h), x = c.getContext('2d');
  x.imageSmoothingEnabled = false; x.drawImage(bg, 0, 0, w, h);
  const blur = (src, f) => { const s = mkCanvas(Math.max(1, Math.round(w / f)), Math.max(1, Math.round(h / f))), sx = s.getContext('2d'); sx.imageSmoothingEnabled = true; sx.imageSmoothingQuality = 'high'; sx.drawImage(src, 0, 0, s.width, s.height); const t = mkCanvas(w, h), tx = t.getContext('2d'); tx.imageSmoothingEnabled = true; tx.imageSmoothingQuality = 'high'; tx.drawImage(s, 0, 0, w, h); return t; };
  const band = (t, stops) => { const tx = t.getContext('2d'), g = tx.createLinearGradient(0, 0, 0, h); for (const [y, a] of stops) g.addColorStop(clamp(y / BH, 0, 1), `rgba(0,0,0,${a})`); tx.globalCompositeOperation = 'destination-in'; tx.fillStyle = g; tx.fillRect(0, 0, w, h); x.drawImage(t, 0, 0); };
  // 透明的天空要留透明（後面畫真的天空）：遮罩用景深之前的輪廓（只稍微柔一點），不然模糊會把山的顏色抹進整片天空、變成一層灰紗
  const mask = blur(c, 2);
  band(blur(c, 4), [[0, 0.9], [L.far - 6, 0.85], [L.sharp[0] - 8, 0], [L.sharp[1], 0], [BH, 0.8]]);
  band(blur(c, 9), [[0, 0.35], [L.far - 10, 0.25], [L.far + 6, 0], [BH - 24, 0], [BH, 0.45]]);
  // 地平線的霧氣：跟天空地平線同色
  const hz = x.createLinearGradient(0, (L.far - 30) * D, 0, (L.far + 34) * D); hz.addColorStop(0, rgb21(E.skyHor, 0)); hz.addColorStop(0.55, rgb21(E.skyHor, 0.2 + E.oc * 0.2)); hz.addColorStop(1, rgb21(E.skyHor, 0)); x.fillStyle = hz; x.fillRect(0, 0, w, h);
  // 太陽（月亮）那一側的主光、另一側的冷影
  x.globalCompositeOperation = 'soft-light';
  if (E.keyA > 0.01) { const kx = E.lightX * w, k = x.createRadialGradient(kx, -h * 0.15, 0, kx, -h * 0.15, h * 1.15); k.addColorStop(0, rgb21(E.key, E.keyA)); k.addColorStop(1, rgb21(E.key, 0)); x.fillStyle = k; x.fillRect(0, 0, w, h); }
  const left = E.lightX < 0.5, cg = x.createLinearGradient(left ? 0 : w, 0, left ? w : 0, h); cg.addColorStop(0.45, rgb21(E.cool, 0)); cg.addColorStop(1, rgb21(E.cool, 0.5 * (1 - E.oc * 0.6))); x.fillStyle = cg; x.fillRect(0, 0, w, h);
  // 時間・天氣的整體光
  x.globalCompositeOperation = 'multiply'; x.fillStyle = rgb21(E.amb); x.fillRect(0, 0, w, h);
  if (E.sat < 1) { x.globalCompositeOperation = 'saturation'; x.fillStyle = rgb21([128, 128, 128], 1 - E.sat); x.fillRect(0, 0, w, h); }
  // 早晚：太陽那一側的地平線一片暖光
  if (E.golden > 0.02) { x.globalCompositeOperation = 'screen'; const gx = E.lightX * w, gy = (SKY21_HOR[kind] || 70) * D, g = x.createRadialGradient(gx, gy, 0, gx, gy, w * 0.9); g.addColorStop(0, rgb21([255, 140, 96], 0.32 * E.golden)); g.addColorStop(1, rgb21([255, 140, 96], 0)); x.fillStyle = g; x.fillRect(0, 0, w, h); }
  x.globalCompositeOperation = 'source-over';
  const nv = 1 - lum21(E.amb) / 255, v = x.createRadialGradient(w / 2, h * 0.52, h * 0.25, w / 2, h * 0.52, h * 0.78); v.addColorStop(0, 'rgba(6,4,16,0)'); v.addColorStop(1, rgb21([6, 4, 16], 0.55 + nv * 0.25)); x.fillStyle = v; x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = 'destination-in'; x.drawImage(mask, 0, 0); x.globalCompositeOperation = 'source-over';
  return c; }
// 舞台最上面幾列的平均顏色（往上延伸的樹冠・天花板用）
function topCol21(cv) { try { const g = cv.getContext('2d'), n = Math.max(1, Math.round(cv.height / BH * 2)), d = g.getImageData(0, 0, cv.width, n).data; let r = 0, gg = 0, bb = 0, k = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; k++; } return k ? [Math.round(r / k), Math.round(gg / k), Math.round(bb / k)] : null; } catch (e) { return null; } }
{ const _sf = hd2dStageFor; hd2dStageFor = function (b) { const E = env21(b); if (!E) { const s = _sf(b); if (b.hd2d.topOf21 !== s) { b.hd2d.topOf21 = s; b.hd2d.top21 = topCol21(s); b.hd2d.band21 = null; } return s; }
    const S = b.hd2d, D = Math.min(SCALE, HD_QUALITY.low ? 2 : 3);
    if (!S.st21 || S.st21D !== D) { let bg = b.bg; if (E.type === 'open') { SKY21.cut = 1; try { bg = buildBattleBG(b.cfgBg); } catch (e) { bg = b.bg; } finally { SKY21.cut = 0; } }
      S.st21 = hd2dStage21(bg, b.cfgBg, D, E); S.st21D = D; S.stage = S.st21; S.D = D; S.bloom = mkCanvas(Math.ceil(W / 2), Math.ceil(BH / 2)); S.top21 = topCol21(S.st21); S.band21 = null; }
    return S.st21; }; }

/* ---------- 天空 ---------- */
function cloud21(x, X, Y, w, h, body, top, under, puffy) { const rows = Math.max(2, Math.round(h / 3));
  if (puffy) { const n = 2 + (Math.round(w) % 2), R = Math.max(3, Math.round(h * 0.55)); for (let i = 0; i < n; i++) { const cx = Math.round(X + w * (0.28 + 0.44 * i / Math.max(1, n - 1))), cy = Math.round(Y + 2 - (i % 2 ? R * 0.5 : R * 0.2)); pxEllipse(x, cx, cy + 1, R, R, top); pxEllipse(x, cx, cy + 2, R - 1, R - 1, body); } }
  for (let r = 0; r < rows; r++) { const u = (r + 0.5) / rows * 2 - 1, k = Math.sqrt(Math.max(0, 1 - u * u)), rw = Math.round(w * (0.38 + 0.62 * k));
    x.fillStyle = r === 0 && !puffy ? top : r >= rows - 1 ? under : body; x.fillRect(Math.round(X + (w - rw) / 2), Math.round(Y + r * 3), rw, 3); } }
function drawSky21(b, x, y0, hor, y1) { const E = env21(b); if (!E) return; const t = b.t || 0, Hh = Math.max(8, hor - y0);
  const g = x.createLinearGradient(0, y0, 0, hor); g.addColorStop(0, rgb21(E.skyTop)); g.addColorStop(0.6, rgb21(mix21(E.skyTop, E.skyHor, 0.45))); g.addColorStop(1, rgb21(E.skyHor));
  x.fillStyle = g; x.fillRect(0, y0, W, hor - y0); if (y1 > hor) { x.fillStyle = rgb21(E.skyHor); x.fillRect(0, hor, W, y1 - hor); }
  if (E.stars > 0.05) { const r = srand(E.seed + 1); for (let i = 0, n = Math.round(W * Hh / 140); i < n; i++) { const sx = Math.floor(r() * W), sy = y0 + Math.floor(r() * Hh * 0.85), warm = r() < 0.2, tw = 0.55 + 0.45 * Math.sin(t * 0.07 + i * 1.7);
      x.fillStyle = rgb21(warm ? [255, 236, 190] : [220, 230, 255], E.stars * tw * (1 - (sy - y0) / Hh * 0.6)); x.fillRect(sx, sy, 1, 1); } }
  const arcY = e => Math.round(hor - 6 + (y0 + 18 - (hor - 6)) * e);
  if (E.sunUp && E.oc < 0.9) { const X = Math.round(E.sunX * W), Y = arcY(E.sunE), sc = mix21([255, 170, 96], [255, 248, 224], Math.min(1, E.sunE * 1.8)), a = 1 - E.oc, R = 28 + E.golden * 30;
    const gr = x.createRadialGradient(X, Y, 0, X, Y, R); gr.addColorStop(0, rgb21(sc, 0.6 * a)); gr.addColorStop(1, rgb21(sc, 0)); x.fillStyle = gr; x.fillRect(X - R, Y - R, R * 2, R * 2);
    if (E.oc < 0.6) { x.globalAlpha = a; pxEllipse(x, X, Y, 5, 5, rgb21(mix21(sc, [255, 255, 255], 0.55))); x.globalAlpha = 1; } }
  if (E.moonUp && E.oc < 0.9) { const X = Math.round(E.moonX * W), Y = arcY(E.moonE), a = 1 - E.oc;
    const gr = x.createRadialGradient(X, Y, 0, X, Y, 22); gr.addColorStop(0, rgb21([220, 230, 255], 0.32 * a)); gr.addColorStop(1, rgb21([220, 230, 255], 0)); x.fillStyle = gr; x.fillRect(X - 22, Y - 22, 44, 44);
    if (E.oc < 0.6) { x.globalAlpha = a; pxEllipse(x, X, Y, 5, 5, '#f4f2e0'); x.fillStyle = 'rgba(190,186,160,0.7)'; x.fillRect(X - 2, Y, 2, 2); x.fillRect(X + 1, Y - 3, 1, 1); x.globalAlpha = 1; } }
  // 雲：晴天幾朵；下雨・下雪・起霧越來越多；早晚被染色、晚上是暗的
  const C = b.clouds21 || (b.clouds21 = (() => { const r = srand(E.seed + 7), n = E.lv ? [0, 6, 9, 12][E.lv] : E.wx === 'snow' ? 8 : E.wx === 'fog' ? 4 : E.wx === 'sand' ? 5 : 3, L = [];
    for (let i = 0; i < n; i++) L.push({ x: r() * (W + 160), y: r() * 0.8, w: E.oc > 0.3 ? 70 + r() * 80 : 28 + r() * 36, h: E.oc > 0.3 ? 14 + r() * 14 : 6 + r() * 8, sp: 0.03 + r() * 0.06 }); return L; })());
  if (C.length) { const base = E.oc > 0.3 ? mul21(E.wx === 'sand' ? [226, 196, 140] : E.lv >= 3 ? [104, 110, 126] : E.lv === 2 ? [150, 156, 170] : [196, 200, 210], E.amb) : mix21(mul21([246, 248, 252], E.amb), E.skyHor, 0.12);
    const lit = E.golden > 0 ? mix21(base, [255, 160, 110], 0.55 * E.golden) : base, top = mix21(lit, [255, 255, 255], E.sunUp ? 0.3 : 0.12), under = mix21(lit, [0, 0, 0], 0.18), al = E.oc > 0.3 ? 0.5 : 0.85; // 陰天的雲半透明、一層疊一層
    for (const q of C) { const w = q.w, X = ((q.x + t * q.sp) % (W + w * 2)) - w, Y = y0 + 4 + q.y * Math.max(10, Hh - 26); x.globalAlpha = al; cloud21(x, X, Y, w, q.h, rgb21(lit), rgb21(top), rgb21(under), E.oc < 0.3); }
    x.globalAlpha = 1; } }

/* ---------- 頭上那一段：森林的樹冠、室內的天花板 ---------- */
function mkBand21(b, type, Ex, E, stage) { const S = b.hd2d, top = S.top21 || [40, 40, 50], c = mkCanvas(W, Ex), x = c.getContext('2d'), r = srand(((E && E.seed) || 3) + Ex);
  if (type === 'canopy') { // 樹冠：一團團的葉子，越下面越密；上面的縫看得到天空；向著光的一側比較亮。跟舞台最上面一樣是失焦的（柔和）
    const L = E ? E.lightX : 0.3, dx = L < 0.5 ? -1 : 1, base = top, far = E ? mix21(top, E.skyHor, 0.28) : top, rimC = E ? mix21(top, E.sunUp ? E.key : E.skyHor, E.sunUp ? 0.3 * Math.min(1, E.keyA * 2.5) + 0.08 : 0.12) : top;
    const N = Math.round(W * Ex / 70), C = [];
    for (let i = 0; i < N; i++) { const y = Ex * (1 - Math.pow(r(), 1.7)), v = y / Ex; C.push({ x: r() * W, y, rad: 5 + r() * 9 * (0.55 + 0.6 * v), v }); }
    C.sort((a, b) => a.y - b.y);
    for (const q of C) { const col = mix21(far, base, Math.min(1, q.v * 1.3)), X = Math.round(q.x), Y = Math.round(q.y), R = Math.round(q.rad);
      pxEllipse(x, X, Y, R, Math.round(R * 0.8), rgb21(mix21(col, [0, 0, 0], 0.18))); pxEllipse(x, X + dx, Y - 1, Math.max(2, R - 2), Math.max(2, Math.round(R * 0.8) - 2), rgb21(col));
      pxEllipse(x, X + dx * Math.round(R * 0.35), Y - Math.round(R * 0.35), Math.max(1, Math.round(R * 0.35)), Math.max(1, Math.round(R * 0.28)), rgb21(mix21(col, rimC, 0.7))); }
    x.fillStyle = rgb21(base); x.fillRect(0, Ex - 5, W, 5);
    // 幾根往上伸的樹枝
    x.strokeStyle = rgb21(mix21(top, [20, 12, 6], 0.5)); x.lineWidth = 2; for (let k = 0; k < 3; k++) { const X0 = Math.floor(r() * W), X1 = X0 + (r() - 0.5) * 40; x.beginPath(); x.moveTo(X0, Ex); x.lineTo(X1, Ex * (0.25 + r() * 0.3)); x.stroke(); }
    // 失焦：縮小再放大
    const sm = mkCanvas(Math.max(1, Math.round(W / 2)), Math.max(1, Math.round(Ex / 2))), sx = sm.getContext('2d'); sx.imageSmoothingEnabled = true; sx.drawImage(c, 0, 0, sm.width, sm.height);
    const soft = mkCanvas(W * 2, Ex * 2), so = soft.getContext('2d'); so.imageSmoothingEnabled = true; so.drawImage(sm, 0, 0, soft.width, soft.height); soft.soft21 = 1; return soft;
  } else { // 天花板（室內）／延伸的背景（火山・星見神殿）
    const kind = b.cfgBg, up = kind === 'volcano' || kind === 'volcanoRim' ? mix21(top, [24, 6, 4], 0.6) : kind === 'star' ? mix21(top, [4, 6, 22], 0.6) : mix21(top, [0, 0, 0], 0.62);
    const g = x.createLinearGradient(0, 0, 0, Ex); g.addColorStop(0, rgb21(up)); g.addColorStop(1, rgb21(top)); x.fillStyle = g; x.fillRect(0, 0, W, Ex);
    const spk = kind === 'star' ? [255, 248, 220] : null; for (let i = 0; i < W * Ex / 40; i++) { const X = Math.floor(r() * W), Y = Math.floor(r() * Ex); x.fillStyle = spk ? rgb21(spk, 0.3 + r() * 0.6) : rgb21([0, 0, 0], 0.12 + r() * 0.1); x.fillRect(X, Y, 1, 1); }
    // 接縫：舞台最上面一列往上延伸、慢慢淡掉
    const SEAM = Math.min(Ex, 20), sm = mkCanvas(W, SEAM), sx = sm.getContext('2d'); sx.imageSmoothingEnabled = false; sx.drawImage(stage, 0, 0, stage.width, Math.max(1, Math.round(stage.height / BH)), 0, 0, W, SEAM);
    const fg = sx.createLinearGradient(0, 0, 0, SEAM); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)'); sx.globalCompositeOperation = 'destination-in'; sx.fillStyle = fg; sx.fillRect(0, 0, W, SEAM); x.drawImage(sm, 0, Ex - SEAM); }
  return c; }
Battle.prototype.drawStage = function (x) { const Ex = TALL_EXT || 0, stage = hd2dStageFor(this), S = this.hd2d, E = env21(this), type = E ? E.type : 'indoor';
  if (type === 'open') drawSky21(this, x, -Ex, SKY21_HOR[this.cfgBg] || 64, (SKY21_HOR[this.cfgBg] || 64) + 30);
  else if (Ex > 0) { if (type === 'canopy') drawSky21(this, x, -Ex, 0, 0);
    const key = type + ':' + Ex; if (!S.band21 || S.band21.key !== key) S.band21 = { key, cv: mkBand21(this, type, Ex, E, stage) };
    const sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = !!S.band21.cv.soft21; x.drawImage(S.band21.cv, 0, -Ex, W, Ex); x.imageSmoothingEnabled = sm;
    if (type !== 'canopy' && (this.cfgBg === 'volcano' || this.cfgBg === 'volcanoRim' || this.cfgBg === 'lava')) { const t = this.t || 0; for (let i = 0; i < 10; i++) { const P = 160 + (i % 3) * 40, ph = (t + i * 37) % P, X = (i * 53 + Math.sin((t + i * 20) / 30) * 6) % W, Y = -Ex * (ph / P) + 4; x.fillStyle = rgb21([255, 150 + (i % 3) * 30, 60], 0.8 * (1 - ph / P)); x.fillRect(Math.round(X), Math.round(Y), 1, 2); } } }
  x.drawImage(stage, 0, 0, W, BH); };

/* ---------- 光束：柔和的邊、方向跟著太陽 ---------- */
let BEAM21 = null; const BEAMC21 = {};
function beam21() { if (BEAM21) return BEAM21; const w = 24, h = 96, c = mkCanvas(w, h), x = c.getContext('2d'), d = x.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) { const a = Math.pow(Math.sin(Math.PI * (X + 0.5) / w), 2) * Math.pow(1 - y / h, 1.3), i = (y * w + X) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = Math.round(255 * a); }
  x.putImageData(d, 0, 0); return (BEAM21 = c); }
function beamCol21(col) { const k = col.join(','); if (BEAMC21[k]) return BEAMC21[k]; const c = mkCanvas(24, 96), x = c.getContext('2d'); x.drawImage(beam21(), 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = rgb21(col); x.fillRect(0, 0, 24, 96); return (BEAMC21[k] = c); }
function drawBeam21(x, X, Y, wd, len, slope, col, a) { if (a <= 0.005) return; x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = Math.min(1, a); x.translate(X, Y); x.transform(1, 0, slope, 1, 0, 0); x.imageSmoothingEnabled = true; x.drawImage(beamCol21(col), -wd / 2, 0, wd, len); x.restore(); }
hd2dShafts = function (b, x) { const E = env21(b), t = b.t || 0;
  if (!E) { const L = b.hd2d.L, col = ((L.shaft || '').match(/\d+/g) || [255, 240, 200]).slice(0, 3).map(Number); // 室內：照原本左上斜下來的三道，改成柔和的光
    for (let i = 0; i < 3; i++) { const sway = Math.sin(t * 0.012 + i * 1.7); drawBeam21(x, 20 + i * 34, -4, 16 + i * 6, BH * 0.85, 0.44 + sway * 0.015, col, 0.11 + 0.05 * (0.5 + 0.5 * sway)); } return; }
  if (E.type !== 'canopy' || !E.sunUp || E.oc > 0.5) return; // 只有森林、出太陽的時候從樹冠縫隙照下來
  const Ex = TALL_EXT || 0, slope = (0.5 - E.sunX) * 1.5, a0 = (0.08 + 0.12 * E.golden + 0.04 * (1 - E.sunE)) * (1 - E.oc), r = srand(E.seed + 5);
  for (let i = 0; i < 4; i++) { const X = 16 + r() * (W - 32), wd = 10 + r() * 14, len = (BH + Ex) * (0.7 + r() * 0.25), sway = Math.sin(t * 0.01 + i * 2.1); drawBeam21(x, X - slope * Ex * 0.5, -Ex - 2, wd, len, slope, E.key, a0 * (0.7 + 0.3 * sway)); } };
// 大雨以上、下雪、沙塵不飄光點
{ const _m = hd2dMotes; hd2dMotes = function (b, x, near) { const E = env21(b); if (E && (E.lv >= 2 || E.wx === 'snow' || E.wx === 'sand')) return; return _m(b, x, near); }; }
// 角色身上的光：太陽那側亮、另一側冷；晚上偏藍、早晚帶一點橘
{ const _la = hd2dLightActor; hd2dLightActor = function (cv, L) { const b = Game.scene, E = typeof Battle !== 'undefined' && b instanceof Battle ? env21(b) : null; if (!E) return _la(cv, L);
    const x = cv.getContext('2d'); x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop'; const left = E.lightX < 0.5, w = cv.width, h = cv.height;
    const g = x.createLinearGradient(left ? 0 : w, 0, left ? w : 0, h); g.addColorStop(0, rgb21(E.key, 0.24 * Math.min(1, E.keyA * 2))); g.addColorStop(0.5, rgb21(E.key, 0)); g.addColorStop(0.62, rgb21(E.cool, 0)); g.addColorStop(1, rgb21(E.cool, 0.3)); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const dk = 1 - lum21(E.amb) / 255; if (dk > 0.02) { x.fillStyle = rgb21([Math.round(E.amb[0] * 0.3), Math.round(E.amb[1] * 0.3), Math.round(E.amb[2] * 0.42)], Math.min(0.5, dk * 0.62)); x.fillRect(0, 0, w, h); }
    if (E.golden > 0.02) { x.fillStyle = rgb21([255, 140, 60], 0.12 * E.golden); x.fillRect(0, 0, w, h); }
    if (E.sat < 1) { x.fillStyle = rgb21(mul21([150, 150, 150], E.amb), (1 - E.sat) * 0.45); x.fillRect(0, 0, w, h); } // 下雨：顏色淡一點（透明的地方不能用 saturation，會蓋出一塊灰）
    x.restore(); }; }

/* ---------- 野外：早上・傍晚太陽那一側（早上東邊、傍晚西邊）多一層暖光 ---------- */
{ const _wp = owWorldPost; owWorldPost = function (ow, x) { _wp(ow, x); const st = ow.st; if (!st || !ow.map || !dnOut12(st.map)) return;
    const c = dnClock12(st) * 2400 / (DN12.LEN || 2400), s = (c - 100) / 1420; if (s < 0 || s > 1) return; const e = Math.sin(Math.PI * s), k = wxNow(st);
    const gold = clamp((0.32 - e) / 0.32, 0, 1) * (k === 'rain' || k === 'storm' ? 0.25 : k === 'fog' ? 0.4 : 1); if (gold < 0.02) return; const east = s < 0.5;
    x.save(); x.globalCompositeOperation = 'soft-light'; const g = x.createLinearGradient(east ? W : 0, 0, east ? 0 : W, 0); g.addColorStop(0, rgb21([255, 160, 80], 0.55 * gold)); g.addColorStop(0.6, rgb21([255, 160, 80], 0)); g.addColorStop(1, rgb21([60, 70, 150], 0.35 * gold)); x.fillStyle = g; x.fillRect(0, 0, W, H); x.restore(); }; }
