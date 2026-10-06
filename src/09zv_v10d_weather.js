/* ===================== v10 階段四：天氣系統 =====================
   Plan items 3 / 4: every outdoor map has weather that changes every 120–260 steps (odds by region: snow in the north,
   sandstorms in the canyon, fog in the swamp…). Weather shows at the top left and over the field and the battle stage,
   and it changes battles for both sides:
     晴 火+15% 水-10% ・ 雨 水・雷+20% 火-20% ・ 雷雨 雷+30% 水+10% 火-20% ・ 霧 命中-10% 毒+15% ・ 雪 水+15% 火-10% 速度-10% ・ 沙塵 岩+20% 命中-5%
   Weather monsters (item 4) join a quarter of the encounters in their weather and drop that element's 附魔石 more often.
   The 天氣祠 in every new area (09zu) has a different event per weather, and when rain clears a rainbow may appear
   (EXP +20% for 100 steps). */
// v12.76（玩家：「天氣玩家反應不明顯」）：戰鬥加成（屬性 ±%、命中、速度）全部拿掉——數字太小感覺不到，元素系統也拿掉了。
// 天氣改成看得到、遇得到：畫面加強（雨絲＋水花、雷雨的閃電和遠雷、雪、霧、沙塵、晴天的雲影），提示寫這種天氣才出現的魔物（d 在 WX_MON 之後填）
const WEATHER = {
  clear: { n: '晴', col: '#ffd060', d: '' }, rain: { n: '雨', col: '#80b8ff', d: '' }, storm: { n: '雷雨', col: '#ffe060', d: '' },
  fog: { n: '霧', col: '#c8d0e0', d: '' }, snow: { n: '雪', col: '#e8f4ff', d: '' }, sand: { n: '沙塵', col: '#e0b070', d: '' },
};
const WX_TABLE = {
  base: { clear: 50, rain: 25, fog: 15, storm: 10 }, north: { snow: 55, clear: 20, fog: 15, storm: 10 }, canyon: { clear: 50, sand: 40, storm: 10 },
  volcano: { clear: 60, sand: 25, fog: 15 }, swamp: { fog: 45, rain: 35, clear: 20 }, lake: { clear: 40, rain: 30, fog: 25, storm: 5 }, star: { clear: 75, fog: 25 },
};
const WX_MAP = { frostField: 'north', frostVillage: 'north', canyon: 'canyon', emberPass: 'volcano', swamp: 'swamp', lake: 'lake', jadeCreek: 'lake', starShrine: 'star' };
// v10.7.2 (player: 「村莊天氣和野外場景不統一」): weather belongs to the REGION, not the map — the village and the fields
// around it (and every map of the same region) always show the same weather
const wxKey = id => 'R:' + (WX_MAP[id] || 'base');
const wxTableOf = id => MAPS[id] && MAPS[id].outdoor ? WX_TABLE[WX_MAP[id] || 'base'] : null;
function wxRoll(T) { let s = 0; for (const k in T) s += T[k]; let r = Math.random() * s; for (const k in T) { r -= T[k]; if (r < 0) return k; } return 'clear'; }
function wxNow(st = Game.st, id = st && st.map) { if (!st || !id) return null; const T = wxTableOf(id); if (!T) return null; const W0 = st.wx || (st.wx = {}); const w = W0[wxKey(id)]; return w ? w.k : null; }
// roll or advance the weather of the current map
function wxTick(ow) {
  const st = ow.st, id = st.map, T = wxTableOf(id); if (!T) return; const W0 = st.wx || (st.wx = {}), w = W0[wxKey(id)], steps = st.steps || 0;
  if (!w) { W0[wxKey(id)] = { k: wxRoll(T), until: steps + 120 + Math.floor(Math.random() * 140) }; Game.wxBanner = { k: W0[wxKey(id)].k, t: 0 }; return; }
  if (steps < w.until) return; const old = w.k; let k = wxRoll(T); if (k === old) k = wxRoll(T);
  W0[wxKey(id)] = { k, until: steps + 120 + Math.floor(Math.random() * 140) }; if (k === old) return; Game.wxBanner = { k, t: 0 };
  if ((old === 'rain' || old === 'storm') && k === 'clear' && chance(0.35)) { st.rainbowUntil = steps + 100; Game.wxBanner.rainbow = 1; Sound.sfx('levelUp'); }
}
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { if (this.st && this.map && !this.script) wxTick(this); return _u.apply(this, a); }; }
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { const r = _ld.apply(this, a); const st = this.st, w = st && st.wx && st.wx[wxKey(st.map)]; if (w && wxTableOf(st.map)) { const sig = wxKey(st.map) + w.k + w.until; if (Game.wxShown !== sig) { Game.wxShown = sig; Game.wxBanner = { k: w.k, t: 0 }; } } return r; }; } // the banner only when the region or its weather is new

/* ---------- drawing: particles over the field and the battle stage, the icon and the banner ---------- */
function wxIcon(x, k, X, Y) { const c = WEATHER[k].col; x.fillStyle = c;
  if (k === 'clear') { x.fillRect(X + 3, Y + 3, 5, 5); x.fillRect(X + 5, Y, 1, 2); x.fillRect(X + 5, Y + 9, 1, 2); x.fillRect(X, Y + 5, 2, 1); x.fillRect(X + 9, Y + 5, 2, 1); }
  else if (k === 'rain' || k === 'storm') { x.fillStyle = '#c8d0e0'; x.fillRect(X + 1, Y + 2, 9, 3); x.fillRect(X + 3, Y + 1, 5, 1); x.fillStyle = c; if (k === 'storm') { x.fillRect(X + 5, Y + 5, 2, 2); x.fillRect(X + 4, Y + 7, 2, 2); x.fillRect(X + 5, Y + 9, 1, 2); } else for (const q of [2, 5, 8]) x.fillRect(X + q, Y + 6 + (q % 2), 1, 3); }
  else if (k === 'fog') { for (const [q, w] of [[2, 9], [5, 7], [8, 9]]) x.fillRect(X + 1 + (q % 3), Y + q, w, 1); }
  else if (k === 'snow') { x.fillRect(X + 5, Y + 1, 1, 9); x.fillRect(X + 1, Y + 5, 9, 1); x.fillRect(X + 3, Y + 3, 1, 1); x.fillRect(X + 7, Y + 3, 1, 1); x.fillRect(X + 3, Y + 7, 1, 1); x.fillRect(X + 7, Y + 7, 1, 1); }
  else { for (let i = 0; i < 5; i++) x.fillRect(X + 1 + i * 2, Y + 3 + (i % 3) * 2, 2, 1); } }
// v12.76: pixel weather (fillRect only, 2-pixel drops so they read at the field's zoom) — stronger than before so you notice it
const wxH14 = n => { n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4; n = Math.imul(n, 0x27d4eb2d); return ((n ^ (n >>> 15)) >>> 0) / 4294967296; };
const WX_BOLT14 = {}; // the bolt of the current cycle
// a soft stepped blob (fog patch / cloud shadow): rows of rects, wider in the middle, edges a little fainter
function wxBlob14(x, X, Y, w, h, rgb, a) { const rows = Math.max(3, Math.round(h / 4)); for (let r = 0; r < rows; r++) { const u = (r + 0.5) / rows * 2 - 1, k = Math.sqrt(Math.max(0, 1 - u * u)), rw = Math.round(w * (0.35 + 0.65 * k));
    x.fillStyle = 'rgba(' + rgb + ',' + (a * (0.55 + 0.45 * k)).toFixed(3) + ')'; x.fillRect(Math.round(X + (w - rw) / 2), Math.round(Y + r * 4), rw, 4); } }
function wxOverlay(x, k, t, w, h) {
  if (k === 'rain' || k === 'storm') { const storm = k === 'storm', n = storm ? 80 : 55;
    x.fillStyle = storm ? 'rgba(12,18,44,0.28)' : 'rgba(20,30,60,0.18)'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { const sp = 8 + (i % 3) * 2, len = 6 + (i % 3) * 3, px = Math.round((i * 47 + t * (storm ? 3 : 2)) % (w + 30)) - 15, py = Math.round((i * 83 + t * sp) % (h + 24)) - 12;
      x.fillStyle = i % 4 ? (storm ? 'rgba(200,215,255,0.55)' : 'rgba(180,205,255,0.5)') : 'rgba(235,242,255,0.75)'; for (let j = 0; j < len; j += 3) x.fillRect(px - Math.round(j / 3), py + j, 2, 3); }
    // splashes: little crowns on the ground that pop and fade
    for (let i = 0; i < (storm ? 18 : 12); i++) { const c = Math.floor((t + i * 7) / 14), ph = (t + i * 7) % 14, sx = Math.floor(wxH14(c * 31 + i) * w) & ~1, sy = Math.floor(wxH14(c * 17 + i * 3 + 5) * h) & ~1;
      x.fillStyle = 'rgba(225,238,255,' + (0.75 - ph * 0.05).toFixed(2) + ')'; const r = 2 + (ph >> 1); x.fillRect(sx - r, sy, 2, 2); x.fillRect(sx + r, sy, 2, 2); if (ph < 5) x.fillRect(sx, sy - 2 - ph * 2, 2, 2); }
    if (storm) { // lightning: one irregular moment in every 5 seconds — a bright bolt across the sky with a white flash, then (in the field) the far thunder a little later
      const P = 300, c = Math.floor(t / P), at = 40 + Math.floor(wxH14(c * 7 + 3) * 200), dt = t % P - at;
      if (dt >= 0 && dt < 9) { let B = WX_BOLT14[c]; if (!B) { for (const q in WX_BOLT14) delete WX_BOLT14[q]; let bx = 30 + Math.floor(wxH14(c * 11) * (w - 60)); B = WX_BOLT14[c] = [[bx, 0]]; const end = Math.floor(h * (0.3 + wxH14(c * 13) * 0.3));
          for (let y = 0; y < end; y += 8) { bx += Math.round((wxH14(c * 5 + y) - 0.5) * 18); B.push([bx, y + 8]); } }
        if (dt < 2 || (dt >= 4 && dt < 6)) { x.fillStyle = 'rgba(255,255,240,' + (dt < 2 ? 0.34 : 0.18) + ')'; x.fillRect(0, 0, w, h); }
        if (dt < 6) for (const [ow, col] of [[6, 'rgba(150,170,255,0.55)'], [3, '#ffffff']]) { x.fillStyle = col; for (let i = 1; i < B.length; i++) { const [x0, y0] = B[i - 1], [x1, y1] = B[i];
          for (let q = 0; q <= 8; q++) { const X = Math.round(x0 + (x1 - x0) * q / 8), Y = Math.round(y0 + (y1 - y0) * q / 8); x.fillRect(X - (ow >> 1), Y - 1, ow, 3); } } } }
      if (dt === 22 && Game.scene instanceof Overworld && !UI.stack.length) Sound.sfx('thunderFar'); } }
  else if (k === 'snow') { x.fillStyle = 'rgba(220,235,255,0.12)'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 64; i++) { const near = i % 4 === 0, s = near ? 4 : i % 3 ? 2 : 3, vy = near ? 1.4 : 0.6 + (i % 3) * 0.25, px = (i * 53 + Math.sin((t + i * 20) / (near ? 22 : 30)) * (near ? 16 : 10) + t * (near ? 0.6 : 0.3)) % w, py = (i * 71 + t * vy) % h;
      x.fillStyle = near ? 'rgba(255,255,255,0.95)' : 'rgba(240,248,255,0.85)'; const X = Math.round(px), Y = Math.round(py); x.fillRect(X, Y, s, s); if (near) { x.fillStyle = 'rgba(210,228,255,0.9)'; x.fillRect(X + 1, Y + 1, 2, 2); } } }
  else if (k === 'fog') { x.fillStyle = 'rgba(222,228,238,0.22)'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { const bw = 120 + (i % 3) * 50, bh = 24 + (i % 2) * 16, X = ((i * 97 + t * (0.18 + (i % 3) * 0.08)) % (w + bw)) - bw, Y = (i * 73) % h; wxBlob14(x, X, Y, bw, bh, '245,248,255', 0.16 + (i % 3) * 0.04); } }
  else if (k === 'sand') { x.fillStyle = 'rgba(200,150,80,0.26)'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) { const L = 4 + (i % 4) * 3, px = Math.round((i * 37 + t * (4 + (i % 3))) % (w + 20)) - 10, py = Math.round((i * 53 + t * 1.5 + Math.sin((t + i * 9) / 14) * 4) % h) & ~1; x.fillStyle = i % 5 ? 'rgba(240,210,150,0.6)' : 'rgba(255,235,190,0.85)'; x.fillRect(px, py, L, 2); }
    for (let i = 0; i < 3; i++) { const X = ((i * 151 + t * 2.4) % (w + 180)) - 180, Y = (i * 167 + 40) % h; wxBlob14(x, X, Y, 180, 48, '214,170,100', 0.16); } }
  else if (k === 'clear') { x.fillStyle = 'rgba(255,230,160,0.05)'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) { const cw = 170 + i * 40, X = ((i * 211 + t * (0.22 + i * 0.07)) % (w + cw + 60)) - cw - 30, Y = (i * 197 + 60) % (h - 80); wxBlob14(x, X, Y, cw, 56, '20,30,40', 0.09); } }
}
{ const _d = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    _d.call(this, x); const st = this.st, k = wxNow(st); if (!k) return; wxOverlay(x, k, this.t, W, H);
    if (!this.popup && !UI.stack.length) { const s = WEATHER[k].n + (st.rainbowUntil > (st.steps || 0) ? '・彩虹' : '') + (typeof dnHudTag === 'function' ? dnHudTag(st) : ''), w = Math.ceil(Font.width(s, 9)) + 20; x.fillStyle = 'rgba(10,14,28,0.7)'; x.fillRect(3, 3, w, 14); wxIcon(x, k, 5, 4); Font.draw(x, s, 17, 1, WEATHER[k].col, UIC.textSh, 9); }
    const B = Game.wxBanner; if (B && !UI.stack.length && !this.popup && !(Game.toastQ && Game.toastQ.length)) { /* v12.0.1: waits until an achievement toast has gone, they used to overlap */ B.t++; if (B.t > 150) Game.wxBanner = null; else { const a = B.t < 10 ? B.t / 10 : B.t > 130 ? (150 - B.t) / 20 : 1, s1 = B.rainbow ? '雨停了，天空出現了彩虹！' : '天氣：' + WEATHER[B.k].n, s2 = B.rainbow ? '接下來100步，戰鬥經驗值+20%' : WEATHER[B.k].d, w = Math.max(Font.width(s1, 10), Font.width(s2, 9)) + 20;
      x.globalAlpha = a; drawPanel(x, (W - w) / 2, 28, w, 30, null); Font.drawC(x, s1, W / 2, 29, B.rainbow ? '#ffb0e0' : WEATHER[B.k].col, UIC.textSh, 10); Font.drawC(x, s2, W / 2, 42, UIC.text, UIC.textSh, 9); x.globalAlpha = 1; } }
  }; }

/* ---------- battles ---------- */
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    const st = this.st, k = wxNow(st); if (!cfg) return yield* _bs.call(this, cfg, ...a);
    let c = { ...cfg, wx: k }; if (st.rainbowUntil > (st.steps || 0) && cfg.kind === 'wild') c.aevExp = (c.aevExp || 1) * 1.2;
    if (k && cfg.kind === 'wild' && !cfg.roam12 && WX_MON[k] && chance(0.25)) c = { ...c, sp: WX_MON[k][0], wxMon: 1 };
    return yield* _bs.call(this, c, ...a);
  }; }

/* ---------- weather monsters (recolours of existing art) ---------- */
const WX_MON = {
  rain: ['rainFrog', '雨蛙精', 'aquatic', 20, 'mage', ['m_goo', 'm_whirlpool', 'm_tidalCrush', 'm_bite'], ['frog', 190, 1.1, 1.05], '只在下雨天出現的大青蛙。叫聲會引來更多雨。', '水'],
  storm: ['stormHawk', '雷鷹', 'bird', 22, 'fast', ['m_bite', 'm_feint', 'm_static', 'm_diveBomb'], ['bird', 45, 1.2, 1.15], '雷雨中盤旋的猛禽，羽毛帶著靜電。', '雷'],
  fog: ['mistWisp', '霧靈', 'spirit', 21, 'mage', ['m_soulSip', 'm_hex', 'm_frostNova', 'm_curseGrip'], ['ghostLamp', 200, 0.3, 1.35], '在濃霧裡飄盪的靈魂，看不清楚牠的臉。', '毒'],
  snow: ['snowball', '雪團怪', 'ooze', 24, 'tank', ['m_goo', 'm_frostNova', 'm_bite', 'm_acidSpit'], ['slime', 200, 0.15, 1.5], '雪地裡滾來滾去的雪團。被打散了還會自己黏回去。', '水'],
  sand: ['dustScorpion', '沙塵蠍', 'insect', 18, 'phys', ['m_bite', 'm_acidSpit', 'm_swarm', 'm_sporeBurst'], ['sandScorpion', -20, 0.8, 0.85], '趁沙塵暴出來狩獵的蠍子。', '岩'],
  clear: ['sunFox', '陽炎狐', 'beast', 16, 'fast', ['m_bite', 'm_rend', 'm_scorch', 'm_warRoar'], ['fox', -10, 1.3, 1.15], '晴天時在草原上奔跑的紅狐，尾巴像火一樣。', '火'],
};
for (const k in WX_MON) { const [sp, n, fam, lv, role, moves, look, dex, el] = WX_MON[k]; if (SPECIES[sp]) continue;
  SPECIES[sp] = { n, fam, base: CH2_ROLE[role].map(v => Math.round(v * 80)), exp: Math.round((5 * lv + 28) * 1.3), gold: Math.round(lv * 1.6), learn: moves.map((m, i) => [i === 3 ? 12 : 1, m]).filter(([, m]) => MOVES[m]), dex, wxOnly: k };
  MON_PANEL[sp] = ch2Panel(lv, role, 'wild'); const [b, dh, ks, kl] = look; PLACEHOLDER[sp] = look; HD_RIG_OF[sp] = HD_RIG_OF[b] || b; const base = ART[b] ? b : PLACEHOLDER[b] && PLACEHOLDER[b][0]; if (ART[base]) ART[sp] = artRecolor(ART[base], dh, ks, kl); SP_EL[sp] = el; }
// v12.76: the weather's line names the monster that only comes out in it
{ const WHEN = { clear: '晴天', rain: '下雨天', storm: '雷雨天', fog: '起霧的時候', snow: '下雪天', sand: '沙塵暴的時候' }; for (const k in WX_MON) WEATHER[k].d = WHEN[k] + '才會出現「' + WX_MON[k][1] + '」'; }
// a weather monster keeps the level of the encounter it replaced

/* ---------- 天氣祠: one event per weather period ---------- */
function* wshrineEvent(ow, ent) {
  const st = ow.st, id = st.map, k = wxNow(st) || 'clear', w = (st.wx || {})[wxKey(id)] || {}, done = st.wsh || (st.wsh = {}), stamp = k + w.until;
  yield* say('古老的「天氣祠」。祠上刻著太陽、雨雲和雪花的圖案。\n現在的天氣是「' + WEATHER[k].n + '」。');
  if (done[id] === stamp) { yield* say('祠堂很安靜。等天氣變了再來看看吧。'); return; }
  if (k === 'clear') { if (yield* yesNo('陽光照在祠上。要祈求好運嗎？')) { done[id] = stamp; st.bless = 3; Sound.jingle('item'); yield* say('身體暖了起來！接下來3場戰鬥，一開始物攻和魔攻就提升一級。'); } }
  else if (k === 'rain') { done[id] = stamp; st.bag.manaPotion = (st.bag.manaPotion || 0) + 1; yield* itemGet('祠前的石盆積滿了雨水，水底沉著一瓶魔力藥水！'); }
  else if (k === 'storm') { yield* say('轟隆——！閃電打在祠頂上，一隻雷鷹被引了過來！'); const res = yield* ow.battleScript({ sp: 'stormHawk', lv: (mapLevel(id) || [20, 20])[1] + 2, kind: 'elite', id: 'wxStorm' + id, noCard: 1 });
    if (res === 'win') { done[id] = stamp; st.bag.trainBook = (st.bag.trainBook || 0) + 1; yield* itemGet('雷鷹掉下了一本被雷燒焦邊角的書。得到了修練之書！'); } }
  else if (k === 'fog') { done[id] = stamp; yield* say('霧裡走出一個戴著斗篷的商人。「……只在起霧的時候做生意。」'); yield* shopFlow(['trainBook', 'attrReset', 'talentReset'].filter(q => ITEMS[q])); }
  else if (k === 'snow') { if (yield* yesNo('祠前積了厚厚的雪。要堆一個雪人嗎？')) { done[id] = stamp; for (let i = 0; i < 3; i++) { Sound.sfx('step'); yield* wait(14); } const it = pick(['hiEther', 'superPotion', 'elixir'].filter(q => ITEMS[q])); st.bag[it] = (st.bag[it] || 0) + 1; yield* itemGet('雪人堆好了！雪人的肚子裡藏著' + ITEMS[it].n + '。'); } }
  else if (k === 'sand') { if (yield* yesNo('沙塵在祠邊堆成了小丘，好像埋著什麼。要挖挖看嗎？')) { done[id] = stamp; const roll = Math.random(); if (roll < 0.4) { const g = 300 + Math.floor(Math.random() * 700); st.money += g; yield* itemGet('挖到了古代的錢幣，價值' + g + ' G！'); } else if (roll < 0.8) { st.bag.sandCrystal = (st.bag.sandCrystal || 0) + 2; yield* itemGet('挖到了砂晶×2！'); } else { st.bag.trainBook = (st.bag.trainBook || 0) + 1; yield* itemGet('挖到了一本埋在沙裡的修練之書！'); } } }
}
for (const id in EXT_AREA) Events['wshrine_' + id] = wshrineEvent;
// the clear-weather blessing: +1 attack stages at the start of the next battles
