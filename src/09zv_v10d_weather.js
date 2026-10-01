/* ===================== v10 階段四：天氣系統 =====================
   Plan items 3 / 4: every outdoor map has weather that changes every 120–260 steps (odds by region: snow in the north,
   sandstorms in the canyon, fog in the swamp…). Weather shows at the top left and over the field and the battle stage,
   and it changes battles for both sides:
     晴 火+15% 水-10% ・ 雨 水・雷+20% 火-20% ・ 雷雨 雷+30% 水+10% 火-20% ・ 霧 命中-10% 毒+15% ・ 雪 水+15% 火-10% 速度-10% ・ 沙塵 岩+20% 命中-5%
   Weather monsters (item 4) join a quarter of the encounters in their weather and drop that element's 附魔石 more often.
   The 天氣祠 in every new area (09zu) has a different event per weather, and when rain clears a rainbow may appear
   (EXP +20% for 100 steps). */
const WEATHER = {
  clear: { n: '晴', col: '#ffd060', d: '火屬性+15%、水屬性-10%', mul: { 火: 1.15, 水: 0.9 } },
  rain: { n: '雨', col: '#80b8ff', d: '水・雷屬性+20%、火屬性-20%', mul: { 水: 1.2, 雷: 1.2, 火: 0.8 } },
  storm: { n: '雷雨', col: '#ffe060', d: '雷屬性+30%、水屬性+10%、火屬性-20%', mul: { 雷: 1.3, 水: 1.1, 火: 0.8 } },
  fog: { n: '霧', col: '#c8d0e0', d: '雙方命中-10%、毒屬性+15%', acc: 10, mul: { 毒: 1.15 } },
  snow: { n: '雪', col: '#e8f4ff', d: '水屬性+15%、火屬性-10%、雙方速度-10%', spe: 0.9, mul: { 水: 1.15, 火: 0.9 } },
  sand: { n: '沙塵', col: '#e0b070', d: '岩屬性+20%、雙方命中-5%', acc: 5, mul: { 岩: 1.2 } },
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
function wxOverlay(x, k, t, w, h) {
  if (k === 'rain' || k === 'storm') { const n = k === 'storm' ? 70 : 45; x.strokeStyle = k === 'storm' ? 'rgba(190,210,255,0.55)' : 'rgba(170,200,255,0.45)'; x.lineWidth = 1; x.beginPath();
    for (let i = 0; i < n; i++) { const px = (i * 47 + t * 3) % (w + 30) - 15, py = (i * 83 + t * 9) % (h + 20) - 10; x.moveTo(px, py); x.lineTo(px - 3, py + 8); } x.stroke();
    x.fillStyle = 'rgba(20,30,60,0.12)'; x.fillRect(0, 0, w, h); if (k === 'storm' && t % 280 < 6) { x.fillStyle = 'rgba(255,255,240,' + (t % 280 < 3 ? 0.5 : 0.25) + ')'; x.fillRect(0, 0, w, h); if (t % 280 === 0 && Game.scene instanceof Overworld) Sound.sfx('thunder'); } }
  else if (k === 'snow') { x.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 40; i++) { const px = (i * 53 + Math.sin((t + i * 20) / 30) * 12 + t * 0.4) % w, py = (i * 71 + t * 0.9) % h; x.fillRect(Math.round(px), Math.round(py), i % 3 ? 1 : 2, i % 3 ? 1 : 2); } x.fillStyle = 'rgba(220,235,255,0.08)'; x.fillRect(0, 0, w, h); }
  else if (k === 'fog') { x.fillStyle = 'rgba(225,230,240,0.2)'; x.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { const y = ((i * 61 + t * 0.25) % (h + 40)) - 20; x.fillStyle = 'rgba(255,255,255,0.1)'; x.fillRect(0, Math.round(y), w, 16); } }
  else if (k === 'sand') { x.fillStyle = 'rgba(200,150,80,0.2)'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(240,210,150,0.55)'; for (let i = 0; i < 40; i++) { const px = (i * 37 + t * 4) % (w + 20) - 10, py = (i * 53 + t * 1.5) % h; x.fillRect(Math.round(px), Math.round(py), 4, 1); } }
  else if (k === 'clear') { x.fillStyle = 'rgba(255,230,160,0.05)'; x.fillRect(0, 0, w, h); }
}
{ const _d = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    _d.call(this, x); const st = this.st, k = wxNow(st); if (!k) return; wxOverlay(x, k, this.t, W, H);
    if (!this.popup && !UI.stack.length) { const s = WEATHER[k].n + (st.rainbowUntil > (st.steps || 0) ? '・彩虹' : ''), w = Math.ceil(Font.width(s, 9)) + 20; x.fillStyle = 'rgba(10,14,28,0.7)'; x.fillRect(3, 3, w, 14); wxIcon(x, k, 5, 4); Font.draw(x, s, 17, 1, WEATHER[k].col, UIC.textSh, 9); }
    const B = Game.wxBanner; if (B && !UI.stack.length && !this.popup) { B.t++; if (B.t > 150) Game.wxBanner = null; else { const a = B.t < 10 ? B.t / 10 : B.t > 130 ? (150 - B.t) / 20 : 1, s1 = B.rainbow ? '雨停了，天空出現了彩虹！' : '天氣：' + WEATHER[B.k].n, s2 = B.rainbow ? '接下來100步，戰鬥經驗值+20%' : WEATHER[B.k].d, w = Math.max(Font.width(s1, 10), Font.width(s2, 9)) + 20;
      x.globalAlpha = a; drawPanel(x, (W - w) / 2, 22, w, 30, null); Font.drawC(x, s1, W / 2, 23, B.rainbow ? '#ffb0e0' : WEATHER[B.k].col, UIC.textSh, 10); Font.drawC(x, s2, W / 2, 36, UIC.text, UIC.textSh, 9); x.globalAlpha = 1; } }
  }; }

/* ---------- battles ---------- */
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    const st = this.st, k = wxNow(st); if (!cfg) return yield* _bs.call(this, cfg, ...a);
    let c = { ...cfg, wx: k }; if (st.rainbowUntil > (st.steps || 0) && cfg.kind === 'wild') c.aevExp = (c.aevExp || 1) * 1.2;
    if (k && cfg.kind === 'wild' && WX_MON[k] && chance(0.25)) c = { ...c, sp: WX_MON[k][0], wxMon: 1 };
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
// a weather monster keeps the level of the encounter it replaced; its stone drops more often

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
