/* ===================== v12.145 下雨分三級・會慢慢變化・各地不一樣・有實際影響 =====================
   玩家 2026-10-12：「天氣系統稍微改良，下雨做出區分」→ 四個都選：分小雨／大雨／暴雨三級、雨會慢慢變化、雨天有實際影響、不同地區的雨不一樣。
   · 三級：小雨（雨絲少又細、畫面只暗一點、雨聲小）、大雨（雨絲密、水花多、畫面暗、雨聲大）、暴雨（斜斜的大雨、打雷閃電、最暗）。
     左上角寫「小雨／大雨／暴雨」，戰鬥裡的雨也一樣分。只有暴雨會打雷（原本的「雷雨」就是暴雨）。
   · 慢慢變化：一場雨從小雨開始 → 變大 →（最大）→ 變小 → 停；雨變大、變小時上方會跳一行提示。停了照舊 35% 出現彩虹。
     最大會到幾級看地區：湖邊大多是大雨、沼澤多半是小雨、平原一半一半；原本的「雷雨」會一路下到暴雨。
   · 各地不一樣（同一區的雨，各張地圖看起來不同）：
     樹林裡小一級（樹葉擋住，大部分是毛毛雨，偶爾有大顆的水滴從葉子上落下）；
     丘陵・高原・山路・峽谷大一級（大雨到了這裡就變暴雨，雨被風吹得很斜）；湖邊・溪邊水花特別多；沼澤的小雨帶著霧。
   · 實際影響：
     小雨：採集藥草・魔力草・蘑菇・苔蘚・露水 25% 多拿 1 個；
     大雨：同上 50%；野外 1/4 的遇敵換成「雨蛙精」（小雨不會出現了）；地上積水（雨停後還會留一陣子）；
     暴雨：同上 50%；會打雷，1/4 的遇敵換成「雷鷹」。
   · 雨聲：小雨・大雨・暴雨三種大小（音效開著才有），進室內就停。 */
const RAIN21 = {
  NAME: ['', '小雨', '大雨', '暴雨'],
  // 各區下「雨」時最大到幾級：[只到小雨的機率]（其餘到大雨）；「雷雨」一律下到暴雨
  ONLY_LIGHT: { base: 0.45, lake: 0.2, swamp: 0.6, north: 0.5, canyon: 0.3, volcano: 0.5, star: 1 },
  TIP: { 1: '採集藥草・蘑菇類，有時多拿 1 個', 2: '雨蛙精出沒・地上積水・採集常多拿 1 個', 3: '會打雷，雷鷹出沒・採集常多拿 1 個' },
  PLANT: new Set(['herb', 'mana', 'shroom', 'moss', 'dew']),
};
// 這張地圖的雨長什麼樣子（同一區的雨，各地不同）
function rainStyle21(id) { const d = (id && MAPS[id]) || {}, nm = d.name || '';
  if (d.battleBg === 'forest' || /森林|樹林|林道|樹海|楓/.test(nm)) return 'forest';
  if (WX_MAP[id] === 'canyon' || /丘陵|高原|山道|山路|峽谷|山頂|雪山|山口/.test(nm)) return 'high';
  if (WX_MAP[id] === 'swamp' || /沼/.test(nm)) return 'swamp';
  if (WX_MAP[id] === 'lake' || /湖|溪|河|海|岸|港/.test(nm)) return 'lake';
  return 'plain'; }
// 這一區正在下的雨（沒在下雨就是 null）；舊存檔沒有起點・最大級數就補上
function rainRec21(st, id = st && st.map) { if (!st || !id || typeof wxTableOf !== 'function' || !wxTableOf(id)) return null;
  const w = (st.wx || {})[wxKey(id)]; if (!w || (w.k !== 'rain' && w.k !== 'storm')) return null;
  if (!w.pk) w.pk = w.k === 'storm' ? 3 : Math.random() < (RAIN21.ONLY_LIGHT[WX_MAP[id] || 'base'] ?? 0.45) ? 1 : 2;
  if (w.from == null) w.from = Math.max(0, w.until - 200); return w; }
// 這一刻、這張地圖的雨：0 沒下、1 小雨、2 大雨、3 暴雨
function rainLv21(st = Game.st, id = st && st.map) { const w = rainRec21(st, id); if (!w) return 0;
  const p = clamp(((st.steps || 0) - w.from) / Math.max(1, w.until - w.from), 0, 1);
  const lv = w.pk >= 3 ? (p < 0.15 ? 1 : p < 0.3 ? 2 : p < 0.7 ? 3 : p < 0.85 ? 2 : 1) : w.pk === 2 ? (p < 0.25 ? 1 : p < 0.8 ? 2 : 1) : 1;
  const sty = rainStyle21(id); return sty === 'forest' ? Math.max(1, lv - 1) : sty === 'high' && lv >= 2 ? 3 : lv; }
function wxName21(st, k) { const lv = (k === 'rain' || k === 'storm') ? rainLv21(st) : 0; return lv ? RAIN21.NAME[lv] : WEATHER[k].n; }
// 暴雨才算「雷雨」（打雷、雷鷹、吊橋・風箏的雷雨事件）
{ const _wn = wxNow; wxNow = function (st = Game.st, id = st && st.map) { const k = _wn(st, id); if (k !== 'rain' && k !== 'storm') return k; return rainLv21(st, id) >= 3 ? 'storm' : 'rain'; }; }
WEATHER.storm.n = '暴雨'; WEATHER.rain.d = '大雨的時候才會出現「雨蛙精」'; WEATHER.storm.d = '暴雨的時候才會出現「雷鷹」';

/* ---------- 一場雨的起點、雨變大變小的提示 ---------- */
function rainBanner21(st, lv, prev) { const id = st.map, sty = rainStyle21(id), wh = sty === 'forest' ? '（樹林裡）' : '';
  const s1 = !prev ? '天氣：' + RAIN21.NAME[lv] + wh : lv > prev ? (lv === 3 ? '轉成暴雨了！' : '雨下大了：' + RAIN21.NAME[lv] + wh) : '雨變小了：' + RAIN21.NAME[lv] + wh;
  Game.wxBanner = { k: lv >= 3 ? 'storm' : 'rain', t: 0, s1, s2: RAIN21.TIP[lv] }; }
{ const _wt = wxTick; wxTick = function (ow) { const st = ow.st, id = st && st.map, key = id && wxKey(id), before = key && st.wx && st.wx[key];
    _wt(ow); if (!key) return; const w = st.wx && st.wx[key];
    if (w && w !== before && (w.k === 'rain' || w.k === 'storm')) { w.from = st.steps || 0; rainRec21(st, id); }
    const lv = rainLv21(st, id), S = st.rainShown21 || (st.rainShown21 = {});
    if (S.map !== id) { S.map = id; S.lv = lv; } // 換地圖：不跳（進新區域本來就有天氣提示）
    else if (S.lv !== lv) { const prev = S.lv; S.lv = lv; if (lv && !(Game.wxBanner && Game.wxBanner.t < 5 && !Game.wxBanner.s1)) rainBanner21(st, lv, prev); }
    const B = Game.wxBanner; if (B && !B.s1 && !B.rainbow && (B.k === 'rain' || B.k === 'storm') && lv) { B.s1 = '天氣：' + RAIN21.NAME[lv] + (rainStyle21(id) === 'forest' ? '（樹林裡）' : ''); B.s2 = RAIN21.TIP[lv]; }
    if (lv >= 2) st.wetUntil21 = (st.steps || 0) + 60; }; } // 大雨以上地上積水，雨停後留 60 步

/* ---------- 實際影響：採集 ---------- */
{ const _dg = doGather; doGather = function (kind, st = Game.st) { const r = _dg(kind, st), lv = rainLv21(st);
    if (lv && RAIN21.PLANT.has(kind) && GATHER_KINDS[kind] && chance(lv >= 2 ? 0.5 : 0.25)) { const m = GATHER_KINDS[kind][1]; st.bag[m] = (st.bag[m] || 0) + 1; r.text += '（雨天＋' + ITEMS[m].n + '×1）'; }
    return r; }; }

/* ---------- 畫雨（野外和戰鬥共用；09zv 的 wxOverlay 遇到雨就交給這裡） ---------- */
function rainCtx21() { const b = Game.scene, st = Game.st; if (typeof Battle !== 'undefined' && b instanceof Battle) { const c = b.cfg || {}; return { lv: c.rainLv21 || (c.wx === 'storm' ? 3 : 2), sty: st ? rainStyle21(st.map) : 'plain' }; }
  return { lv: rainLv21(st) || 1, sty: st ? rainStyle21(st.map) : 'plain' }; }
function rainOverlay21(x, k, t, w, h) { const { lv, sty } = rainCtx21(), L = Math.max(1, Math.min(3, k === 'storm' ? 3 : lv));
  const n = [0, 26, 62, 100][L] * (sty === 'forest' ? 0.6 : 1), len = [0, 4, 7, 10][L], slant = sty === 'high' ? 2.4 : L === 3 ? 1.6 : sty === 'forest' ? 0.4 : 1, spd = [0, 5, 8, 11][L] * (sty === 'high' ? 1.25 : 1);
  x.fillStyle = 'rgba(16,24,50,' + [0, 0.08, 0.18, 0.3][L] + ')'; x.fillRect(0, 0, w, h);
  if (sty === 'swamp' || (sty === 'forest' && L === 1)) for (let i = 0; i < 5; i++) { const bw = 140 + (i % 3) * 40, X = ((i * 97 + t * 0.2) % (w + bw)) - bw, Y = (i * 73 + 20) % h; wxBlob14(x, X, Y, bw, 28, '220,228,238', 0.1); } // 霧雨
  // 雨絲
  const a1 = [0, 0.32, 0.48, 0.58][L], a2 = [0, 0.5, 0.7, 0.8][L];
  for (let i = 0; i < n; i++) { const px = Math.round((i * 47 + t * slant * spd * 0.2) % (w + 40)) - 20, py = Math.round((i * 83 + t * spd) % (h + 24)) - 12;
    x.fillStyle = i % 4 ? 'rgba(185,208,255,' + a1 + ')' : 'rgba(235,242,255,' + a2 + ')'; const ww = L === 1 ? 1 : 2;
    for (let j = 0; j < len; j += 3) x.fillRect(px - Math.round(j * slant / 3), py + j, ww, 3); }
  // 樹林：葉子上落下的大水滴
  if (sty === 'forest') for (let i = 0; i < 6 + L * 3; i++) { const P = 70 + (i % 4) * 9, ph = (t + i * 23) % P, c = Math.floor((t + i * 23) / P), dx = Math.floor(wxH14(c * 13 + i) * w) & ~1, fall = h * (0.35 + wxH14(c * 7 + i * 3) * 0.6), y = ph * 4.2;
    if (y < fall) { x.fillStyle = 'rgba(210,228,255,0.8)'; x.fillRect(dx, Math.round(y), 2, 4); } else if (y < fall + 14) { const r = 2 + Math.floor((y - fall) / 4); x.fillStyle = 'rgba(225,238,255,' + (0.7 - (y - fall) * 0.04).toFixed(2) + ')'; x.fillRect(dx - r, Math.round(fall), 2, 2); x.fillRect(dx + r, Math.round(fall), 2, 2); } }
  // 水花：湖邊多、大雨以上多
  const ns = [0, 6, 14, 22][L] * (sty === 'lake' ? 1.6 : sty === 'forest' ? 0.5 : 1);
  for (let i = 0; i < ns; i++) { const c = Math.floor((t + i * 7) / 14), ph = (t + i * 7) % 14, sx = Math.floor(wxH14(c * 31 + i) * w) & ~1, sy = Math.floor(wxH14(c * 17 + i * 3 + 5) * h) & ~1;
    x.fillStyle = 'rgba(225,238,255,' + (0.75 - ph * 0.05).toFixed(2) + ')'; const r = 2 + (ph >> 1); x.fillRect(sx - r, sy, 2, 2); x.fillRect(sx + r, sy, 2, 2); if (ph < 5) x.fillRect(sx, sy - 2 - ph * 2, 2, 2); }
  if (L === 3) { // 打雷：照原本的閃電（每 5 秒左右一次、照亮畫面；野外稍後傳來雷聲）
    const P = 300, c = Math.floor(t / P), at = 40 + Math.floor(wxH14(c * 7 + 3) * 200), dt = t % P - at;
    if (dt >= 0 && dt < 9) { let B = WX_BOLT14[c]; if (!B) { for (const q in WX_BOLT14) delete WX_BOLT14[q]; let bx = 30 + Math.floor(wxH14(c * 11) * (w - 60)); B = WX_BOLT14[c] = [[bx, 0]]; const end = Math.floor(h * (0.3 + wxH14(c * 13) * 0.3));
        for (let y = 0; y < end; y += 8) { bx += Math.round((wxH14(c * 5 + y) - 0.5) * 18); B.push([bx, y + 8]); } }
      if (dt < 2 || (dt >= 4 && dt < 6)) { x.fillStyle = 'rgba(255,255,240,' + (dt < 2 ? 0.34 : 0.18) + ')'; x.fillRect(0, 0, w, h); }
      if (dt < 6) for (const [ow, col] of [[6, 'rgba(150,170,255,0.55)'], [3, '#ffffff']]) { x.fillStyle = col; for (let i = 1; i < B.length; i++) { const [x0, y0] = B[i - 1], [x1, y1] = B[i];
        for (let q = 0; q <= 8; q++) { const X = Math.round(x0 + (x1 - x0) * q / 8), Y = Math.round(y0 + (y1 - y0) * q / 8); x.fillRect(X - (ow >> 1), Y - 1, ow, 3); } } } }
    if (dt === 22 && Game.scene instanceof Overworld && !UI.stack.length) Sound.sfx('thunderFar'); }
}

/* ---------- 地上積水（野外，大雨以上和雨停後 60 步）：路和草地上的水窪，下雨時有漣漪 ---------- */
const PUDDLE21 = new Set(['.', ',', ':']);
function puddles21(ow, x) { const st = ow.st; if (!st || !ow.map || !(st.wetUntil21 > (st.steps || 0)) || !wxTableOf(st.map)) return;
  const left = (st.wetUntil21 - (st.steps || 0)) / 60, raining = rainLv21(st) >= 1, z = ow._zc ? ZOOM_F : 1;
  const S = (wx, wy) => { let sx = wx - ow.camX, sy = wy - ow.camY; if (ow._zc) { sx = ow._zc[0] + (sx - ow._zc[0]) * z; sy = ow._zc[1] + (sy - ow._zc[1]) * z; } return [sx, sy]; };
  const busy = new Set([ow.p.x + ',' + ow.p.y]); for (const n of ow.npcs || []) busy.add(n.x + ',' + n.y); for (const e of ow.elites || []) busy.add(e.x + ',' + e.y);
  const tx0 = Math.floor(ow.camX / 16) - 3, ty0 = Math.floor(ow.camY / 16) - 3, a = Math.min(1, raining ? 1 : left * 1.5);
  x.save();
  for (let ty = ty0; ty < ty0 + H / 16 + 7; ty++) for (let tx = tx0; tx < tx0 + W / 16 + 7; tx++) { if (tx < 0 || ty < 0 || tx >= ow.map.w || ty >= ow.map.h) continue;
    const hsh = wxH14(tx * 7919 + ty * 104729); if (hsh > 0.075) continue; if (!PUDDLE21.has(ow.map.rows[ty][tx]) || busy.has(tx + ',' + ty)) continue;
    const pw = 10 + Math.floor(hsh * 120) % 5, ox = 1 + Math.floor(hsh * 997) % 3, oy = 6 + Math.floor(hsh * 4111) % 5, [sx, sy] = S(tx * 16 + ox, ty * 16 + oy);
    if (sx < -20 || sy < -20 || sx > W + 20 || sy > H + 20) continue; const X = Math.round(sx), Y = Math.round(sy), w2 = Math.round(pw * z), h2 = Math.max(3, Math.round(4 * z));
    x.globalAlpha = 0.55 * a; x.fillStyle = '#4a6a9a'; x.fillRect(X + 1, Y, w2 - 2, h2); x.fillRect(X, Y + 1, w2, Math.max(1, h2 - 2));
    x.fillStyle = '#9ab8e0'; x.fillRect(X + 2, Y, Math.max(1, w2 - 6), 1);
    if (raining) { const ph = (ow.t + Math.floor(hsh * 5000)) % 40; if (ph < 16) { const r = 1 + (ph >> 2); x.globalAlpha = (0.6 - ph * 0.035) * a; x.fillStyle = '#d8e8ff'; x.fillRect(X + (w2 >> 1) - r, Y + (h2 >> 1), 1, 1); x.fillRect(X + (w2 >> 1) + r, Y + (h2 >> 1), 1, 1); } } }
  x.restore(); }
{ const _wp = owWorldPost; owWorldPost = function (ow, x) { try { puddles21(ow, x); } catch (e) { bvErr('rain21', String(e && e.message || e)); } return _wp(ow, x); }; }

/* ---------- 雨聲 ---------- */
{ let nxt = 0; const _r = render; render = function () { _r(); if (Game.frame < nxt) return; nxt = Game.frame + 20; if (!Sound.amb) return;
    const b = Game.scene, st = Game.st; let lv = 0;
    if (st && typeof Battle !== 'undefined' && b instanceof Battle) { const c = b.cfg || {}; lv = (c.wx === 'rain' || c.wx === 'storm') ? (c.rainLv21 || (c.wx === 'storm' ? 3 : 2)) : 0; }
    else if (st && b instanceof Overworld) lv = rainLv21(st);
    Sound.amb(lv); }; }
