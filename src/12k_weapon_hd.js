/* ===================== v12.82 武器高解析（Codex 任務 AP：art/battle/weapons_hd/KEY.png，64×88） =====================
   玩家：「武器想要較高清晰度、重新繪製，外觀特徵有些不明顯」。舊圖是 16×22（任務 L），這裡換成 4 倍解析的新圖：
   · 選單・掉寶展示・鐵匠：drawWeaponIcon 有新圖就畫新圖（同樣大小，細節多 4 倍）
   · 戰鬥中主角手上：紙娃娃先畫沒拿武器的樣子，再把新圖照原本的位置疊上去（整張改成 2 倍解析畫，所以武器是原尺寸）
   · 舊圖沒有的武器（12 把）用新圖縮小補一張小圖，地圖上的小人照舊 */
const WEAPON_HD = {};
const weaponHD = k => (k && WEAPON_HD[k] && WEAPON_HD[k].ok) ? WEAPON_HD[k] : null;
function alphaBB14(im) { const c = mkCanvas(im.width, im.height), cx = c.getContext('2d'); cx.drawImage(im, 0, 0); const d = cx.getImageData(0, 0, im.width, im.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) if (d[(y * im.width + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? [0, 0, im.width - 1, im.height - 1] : [x0, y0, x1, y1]; }
for (const k in (typeof WEAPON_HD_SRC !== 'undefined' ? WEAPON_HD_SRC : {})) { const im = new Image();
  im.onload = () => { im.ok = true; im.bb = alphaBB14(im);
    if (!WEAPON_PX[k] && !(typeof GLOVE_PX !== 'undefined' && GLOVE_PX[k])) { const c = mkCanvas(16, 22), x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, 16, 22); c.ok = true; WEAPON_PX[k] = c; } // no old sprite: a small one for the field / doll
    if (WEAPON_PX[k]) WEAPON_PX[k].hdk = k; };
  im.src = WEAPON_HD_SRC[k]; WEAPON_HD[k] = im; }
// menus, loot showcase, smith: same size as before (sc × 16×22), four times the detail
{ const _dw = drawWeaponIcon; drawWeaponIcon = function (x, im, cx, cy, sc = 2) { const hd = im && im.hdk ? weaponHD(im.hdk) : null; if (!hd) return _dw(x, im, cx, cy, sc);
    const [x0, y0, x1, y1] = hd.bb, w = x1 - x0 + 1, h = y1 - y0 + 1, k = sc / 4, sm = x.imageSmoothingEnabled, dev = (typeof SCALE !== 'undefined' ? SCALE : 2) * k;
    x.imageSmoothingEnabled = Math.abs(dev - Math.round(dev)) > 0.01 || dev < 1; x.imageSmoothingQuality = 'high';
    x.drawImage(hd, x0, y0, w, h, Math.round(cx - w * k / 2), Math.round(cy - h * k / 2), w * k, h * k); x.imageSmoothingEnabled = sm; }; }
// battle: where the old sprite sits on the doll (found once by comparing the doll with and without it)
const WPN_SPOT14 = {};
function wpnSpot14(frame, L) { const k = L && L.wkey; if (!k || !weaponHD(k) || !WEAPON_PX[k] || (typeof GLOVE_PX !== 'undefined' && GLOVE_PX[k])) return null;
  const key = frame + lookKey(L); if (key in WPN_SPOT14) return WPN_SPOT14[key];
  const full = dollImg(frame, L), bare = dollImg(frame, { ...L, weapon: null, wkey: undefined }); if (full.width !== bare.width || full.height !== bare.height) return WPN_SPOT14[key] = null;
  const g = c => { const t = mkCanvas(c.width, c.height), tx = t.getContext('2d'); tx.drawImage(c, 0, 0); return tx.getImageData(0, 0, c.width, c.height).data; }, A = g(full), B = g(bare);
  let x0 = 1e9, y0 = 1e9; for (let y = 0; y < full.height; y++) for (let x = 0; x < full.width; x++) { const i = (y * full.width + x) * 4; if (A[i + 3] && (A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2] || A[i + 3] !== B[i + 3])) { if (x < x0) x0 = x; if (y < y0) y0 = y; } }
  if (x0 > 1e8) return WPN_SPOT14[key] = null;
  const sbb = WEAPON_PX[k].bb14 || (WEAPON_PX[k].bb14 = alphaBB14(WEAPON_PX[k])); // doll pixels are DOLL_SCALE game units
  return WPN_SPOT14[key] = { bare, x: x0 - sbb[0] * DOLL_SCALE, y: y0 - sbb[1] * DOLL_SCALE, k }; }
{ const _dr = dollRender; dollRender = function (b, A, S, T, tint) {
    if (S.chibi || !b.hd) return _dr(b, A, S, T, tint); const L = b.hd.look, [st] = hdPhase(A, T), moving = st === 'attack' || b.offH.x || b.offH.y, P = wpnSpot14(moving ? 1 : 0, L);
    if (!P) return _dr(b, A, S, T, tint);
    if (!A.hcv || A.hcv.width !== S.cw * 2) { A.hcv = mkCanvas(S.cw * 2, S.ch * 2); A.hcvT = mkCanvas(S.cw * 2, S.ch * 2); }
    const cv = tint ? A.hcvT : A.hcv, x = cv.getContext('2d'), dy = (st === 'idle' && Math.floor((T + A.phase) / 18) % 2 ? 1 : 0) + (st === 'hurt' ? 2 : 0);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingEnabled = false;
    x.drawImage(P.bare, 0, dy * 2, P.bare.width * 2, P.bare.height * 2); x.drawImage(weaponHD(P.k), P.x * 2, (P.y + dy) * 2); // the new art at its own size (64×88 = the old 16×22 at 2× doll scale, 2× resolution)
    if (tint) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
    cv.ds = 0.5; cv.bb = S.bb; cv.px = true; return cv; }; }
