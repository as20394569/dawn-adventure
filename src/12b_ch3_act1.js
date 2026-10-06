/* ===================== v12.71 第三章正篇・第二批：渡海、貝殼村、霧角海岸（〈曙光冒險-第三章正篇企劃〉主線 1〜3） =====================
   旗標 st.flags.ch3m：0 序章完／1 瑪蓮安排海鷗號／2 渡海成功、到了貝殼村／3 珂拉村長說明／4 打倒巨鉗蟹王／5 向村長報告（沉月礁：第三批）。
   魔物的正式圖交給 Codex（任務 AL 第 1 批）；圖到之前先用換色圖。 */
const ch3m = (st = Game.st) => (st && st.flags && st.flags.ch3m) || 0;
const setCh3m = n => { const f = Game.st.flags; f.ch3m = Math.max(f.ch3m || 0, n); };

/* ---------- materials: the three 深海 materials (T8 crafting points) ---------- */
Object.assign(ITEMS, {
  coralBranch14: { n: '珊瑚枝', mat: 1, price: 0, sell: 300, cat: '魔物素材', d: '霧角群島的珊瑚。乾了以後硬得像骨頭。' },
  tideScaleM14: { n: '潮鱗', mat: 1, price: 0, sell: 320, cat: '魔物素材', d: '泛著藍光的鱗片。摸起來永遠是濕的。' },
  deepPearl14: { n: '深海珍珠', mat: 1, price: 0, sell: 360, cat: '魔物素材', d: '在深海裡慢慢長大的珍珠。裡面像是關著一點海的顏色。' },
});
if (typeof MATCAT11 !== 'undefined') Object.assign(MATCAT11, { coralBranch14: '木料', tideScaleM14: '獸材', deepPearl14: '魔素' });
if (typeof MATT11 !== 'undefined') Object.assign(MATT11, { coralBranch14: 7, tideScaleM14: 7, deepPearl14: 7 });
GATHER_KINDS.coral14 = ['珊瑚礁', 'coralBranch14', [1, 2], [['deepPearl14', 0.15]]]; GATHER_IMG.coral14 = GATHER_IMG.crystal;

/* ---------- monsters ---------- */
const ISLE14 = { // key: [name, [placeholder bases…], [hue, sat ×, light ×], role, moves, material, dex]
  pufferFish14: ['鼓浪河豚', ['moonFish', 'blackCatfish', 'creekShrimp'], [-150, 1.2, 1.15], 'tank', ['m_waterBomb', 'm_bubbleSpit', 'm6_clamShut', 'm_tidalCrush'], 'deepPearl14', '浪一打過來就把自己吹得圓滾滾的河豚。刺不硬，撞人卻很痛。'],
  surgeGull14: ['怒濤海鷗', ['stormHawk', 'harpy'], [0, 0.25, 1.35], 'fast', ['m_dive', 'm_featherGust', 'm_talonDive', 'm_galeWing'], 'deepPearl14', '跟著暴風飛的大海鷗。最喜歡把亮晶晶的東西叼回巢裡。'],
  spineAnemone14: ['刺海葵', ['flower'], [-70, 1.1, 1.0], 'mage', ['m_toxicCloud', 'm_poisonSpore', 'm_drownHand', 'm_waterBomb'], 'coralBranch14', '長在礁石上的海葵。觸手尖端有毒，碰到會又麻又痛。'],
  coralSnake14: ['珊瑚蛇', ['streamSnake', 'vineSnake'], [150, 1.3, 1.0], 'phys', ['m_venomFang', 'm_tailSlam', 'm_bite', 'm_venomTail'], 'tideScaleM14', '頭上長著兩根小珊瑚的紅蛇。顏色越鮮豔，毒越強。'],
};
const CRAB14 = 'crabKing14', SERPENT14 = 'seaSerpent14';
const ISLE_BIG14 = { // elite-strength: [name, bases, look, fam, moves, material, dex, panel ref, panel ×]
  [CRAB14]: ['巨鉗蟹王', ['crystalCrayfish', 'reedCrab'], [170, 1.2, 0.75], 'aquatic', ['m6_crystalClaw', 'm14_kingClaw', 'm_scaleGuard', 'm_tidalCrush', 'm_pincerSnap'], 'deepPearl14', '霧角海岸的蟹群之王。一隻鉗子比身體還大，夾得碎礁岩。潮水不退以後，就變得誰也靠近不了。', 'fallenStar', { hp: 1.6, atk: 1.1, def: 1.25, spa: 0.8 }],
  [SERPENT14]: ['海蛇龍', ['silverWyrm', 'hydra'], [-40, 1.1, 0.9], 'aquatic', ['m_tidalWave', 'm_wyrmBite', 'm_waterBomb', 'm_moonTide'], 'tideScaleM14', '住在深海的大海蛇。從來不會靠近船——直到潮將回來的那一天。', 'fallenStar', { hp: 0.85, atk: 0.85, def: 0.9, spa: 0.95 }],
};
// 巨鉗粉碎: the crab king's own, heavier 鉗錘重擊 (same claw-smash picture)
if (MOVES.m_crabHammer) { MOVES.m14_kingClaw = { ...MOVES.m_crabHammer, n: '巨鉗粉碎', pow: 150, d: '蓄力一回合，用比身體還大的鉗子砸下去。' };
  const id = 'm14_kingClaw', src = DEF.skills.m_crabHammer || {}, d = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] }); d.cooldown = 0;
  d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef));
  defPut('skills', id, { ...d, override: true, charge: true, chargeMsg: '把比身體還大的鉗子高高舉了起來！', warn: '（巨鉗要砸下來了……快防禦！每 3 回合一次）' });
  if (typeof MFX !== 'undefined' && MFX.m_golemFist && typeof mxRecolor === 'function') { MFX[id] = mxRecolor(MFX.m_golemFist, MX_PAL.crab); MOVES[id].fx = id; } // a heavy smash in crab colours (the claw comes down)
  if (src.tags && DEF.skills[id].tags) for (const t of src.tags) if (!DEF.skills[id].tags.includes(t)) DEF.skills[id].tags.push(t); }
const ISLE_LOOK14 = {};
const pickBase14 = L => L.find(b => SPECIES[b] && ART[b]) || L.find(b => SPECIES[b]);
const islePut14 = (k, n, b, look, fam, moves, mat, dex, extra) => { const B = SPECIES[b]; if (!B) { if (typeof bvErr === 'function') bvErr('ch3b', 'base ' + k); return; }
  const ok = moves.filter(m => DEF.skills[m]); if (ok.length < moves.length && typeof bvErr === 'function') bvErr('ch3b', k + ' moves ' + moves.filter(m => !DEF.skills[m]).join(','));
  SPECIES[k] = { ...B, n, fam, elite: 0, boss: 0, rare: 0, drop: null, mat, dex, learn: ok.map(m => [1, m]), ch3: 1, ...extra };
  HD_RIG_OF[k] = (BATTLE_PXC[b] || chibiOwn(b)) ? b : (HD_RIG_OF[b] || b); if (typeof HD_RIG_OF_PENDING !== 'undefined') HD_RIG_OF_PENDING[k] = HD_RIG_OF[k];
  if (ART[b]) ART[k] = artRecolor(ART[b], look[0], look[1], look[2]); else if (ART[HD_RIG_OF[k]]) ART[k] = ART[HD_RIG_OF[k]];
  ISLE_LOOK14[k] = [HD_RIG_OF[k], look];
  defPut('enemies', k, { tags: ['foe', 'fam:' + fam], skills: ok, fam, trait: null, profile: (DEF.enemies[b] || {}).profile || 'brute', script: null, metadata: { n } }); };
for (const k in ISLE14) { const [n, bases, look, role, moves, mat, dex] = ISLE14[k], b = pickBase14(bases), B = SPECIES[b] || {};
  islePut14(k, n, b, look, B.fam || 'aquatic', moves, mat, dex, { exp: Math.round((B.exp || 100) * 1.45), gold: Math.max(16, B.gold || 16) });
  if (SPECIES[k]) MON_PANEL[k] = LATE_PANEL13(role, SEA_MUL13); }
for (const k in ISLE_BIG14) { const [n, bases, look, fam, moves, mat, dex, ref, mul] = ISLE_BIG14[k], b = pickBase14(bases);
  islePut14(k, n, b, look, fam, moves, mat, dex, { elite: 1, exp: 760, gold: 0 });
  const P = { ...(MON_PANEL[ref] || ch2Panel(44, 'phys', 'elite')) }; for (const s in mul) if (P[s]) P[s] = Math.round(P[s] * mul[s]); MON_PANEL[k] = P; }
if (typeof BOSS_MAT !== 'undefined') { BOSS_MAT[CRAB14] = 'deepPearl14'; BOSS_MAT[SERPENT14] = 'tideScaleM14'; }
if (typeof CHIBI_FLOAT !== 'undefined') for (const k of ['pufferFish14', 'surgeGull14', SERPENT14]) CHIBI_FLOAT.add(k);
// placeholder pictures: the base chibi recoloured; the Codex set (task AL) wins as soon as it is in the game
{ const _ci = chibiImage; chibiImage = function (k) { const L = ISLE_LOOK14[k]; if (!L || chibiOwn(k)) return _ci(k); if (CHIBI_VAR[k]) return CHIBI_VAR[k]; const src = _ci(L[0]); if (!src || src.ok === false || !(src.complete !== false)) return src;
    const [dh, ks, kl] = L[1], c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]), [r, g, bb] = hex2rgb(hsl2hex(h + dh, Math.min(1, s * ks), Math.min(1, l * kl))); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
    x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c; }; }
// 巨鉗蟹王: 巨鉗粉碎 every third action (charged, so 防禦 halves it); once below half HP it hardens its shell
ELITE_TEXT[CRAB14] = ['（沙灘上的一塊大礁石……動了！）', '巨鉗蟹王舉起了比身體還大的鉗子！'];
BAI.SCRIPT.b14_crabKing = function (core, u) { const d = u.data; d.cd = (d.cd ?? 2) - 1;
  if (d.cd <= 0 && DEF.skills.m14_kingClaw) { d.cd = 3; return b12Charge(core, u, 'm14_kingClaw'); }
  if (!d.shell14 && u.res.hp <= u.max.hp * 0.5) { d.shell14 = 1; const r = b12Pick(core, u, ['m_scaleGuard']); if (r) return r; }
  return b12Pick(core, u, ['m6_crystalClaw', 'm_tidalCrush', 'm_pincerSnap', 'm6_crystalClaw']); };
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (s && sp === CRAB14) s.data.script = 'b14_crabKing'; return s; }; }
if (typeof STORY_ELITES12 !== 'undefined') STORY_ELITES12.push(CRAB14);
// rare finds on the islands: 星之碎片 / 星塵 (kept for 第三章, the T8 smithing items)
const RARE14 = { surgeGull14: ['starShard', 0.05], spineAnemone14: ['starDust', 0.08], pufferFish14: ['starDust', 0.05] };
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const r = yield* _v.call(this), st = Game.st; if (!st || !(st.hp > 0)) return r;
    for (const v of (this.defeated ? this.defeated() : [])) { const R = RARE14[v.sp]; if (!R || v.minion || !ITEMS[R[0]] || !chance(R[1])) continue; st.bag[R[0]] = (st.bag[R[0]] || 0) + 1; Sound.sfx('item'); yield* this.msg('（稀有）' + v.n + '留下了「' + ITEMS[R[0]].n + '」！', { hold: 30 }); }
    return r; }; }

/* ---------- art: the ship 海鷗號, its mast, the deck ---------- */
function pxArt14(w, h, paint, outline = '#1a1418') { const P = {}, put = (X, Y, col) => { X = Math.round(X); Y = Math.round(Y); if (X < 0 || Y < 0 || X >= w || Y >= h) return; P[X + ',' + Y] = col; };
  const rect = (x0, y0, x1, y1, col) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, col); };
  paint(put, rect); const c = mkCanvas(w, h), x = c.getContext('2d'), O = {};
  for (const k in P) { const [X, Y] = k.split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = (X + dx) + ',' + (Y + dy); if (!P[q] && X + dx >= 0 && X + dx < w && Y + dy >= 0 && Y + dy < h) O[q] = 1; } }
  if (outline) for (const k in O) P[k] = outline;
  for (const k in P) { const [X, Y] = k.split(',').map(Number); x.fillStyle = P[k]; x.fillRect(X, Y, 1, 1); } return c; }
const SAIL14 = (put, rect, x0, y0, x1, y1) => { // a square sail bellied by the wind, a blue seagull on it
  for (let y = y0; y <= y1; y++) { const t = (y - y0) / (y1 - y0), bel = Math.round(Math.sin(t * Math.PI) * 2); for (let x = x0 - bel; x <= x1 + bel; x++) put(x, y, x > (x0 + x1) / 2 + 3 + bel ? '#d8d0bc' : '#f6f2e6'); }
  const cx = Math.round((x0 + x1) / 2), cy = Math.round((y0 + y1) / 2); for (let i = 0; i <= 5; i++) { put(cx - i, cy - Math.round(i * 0.6) + (i > 3 ? 1 : 0), '#2a6a9a'); put(cx + i, cy - Math.round(i * 0.6) + (i > 3 ? 1 : 0), '#2a6a9a'); } put(cx, cy + 1, '#2a6a9a'); };
const SHIP14_IMG = pxArt14(48, 40, (put, rect) => {
  rect(23, 1, 24, 27, '#5a3418'); put(23, 1, '#8a5a30');
  for (let y = 0; y <= 3; y++) for (let x = 25; x <= 25 + (3 - y) * 2; x++) put(x, y, '#d04848');
  rect(11, 5, 36, 5, '#6a4020'); SAIL14(put, rect, 12, 6, 35, 21);
  for (let y = 26; y <= 37; y++) { const t = (y - 26) / 11, a = Math.round(2 + t * 6), b = Math.round(45 - t * 6); for (let x = a; x <= b; x++) put(x, y, y === 26 || y === 27 ? '#c89058' : y % 3 === 0 ? '#5a3418' : '#7a4a24'); }
  for (const X of [9, 17, 31, 39]) put(X, 29, '#2a1a10'); rect(4, 31, 43, 31, '#2a6a9a');
  for (let x = 6; x <= 42; x += 2) put(x, 38, '#ffffff'); for (let x = 7; x <= 41; x += 3) put(x, 39, '#cfeefa'); }, '#1a1418');
const MAST14_IMG = pxArt14(32, 58, (put, rect) => {
  rect(15, 0, 16, 57, '#5a3418'); put(15, 0, '#8a5a30'); rect(12, 5, 19, 7, '#7a4a24'); rect(12, 5, 19, 5, '#a8703c');
  for (let y = 0; y <= 3; y++) for (let x = 17; x <= 17 + (3 - y) * 2; x++) put(x, y, '#d04848');
  rect(2, 11, 29, 11, '#6a4020'); SAIL14(put, rect, 4, 12, 27, 40); rect(5, 41, 26, 41, '#6a4020');
  for (let i = 0; i <= 14; i++) { put(4 - Math.round(i * 0.1), 42 + i, '#a08860'); put(27 + Math.round(i * 0.1), 42 + i, '#a08860'); } }, '#1a1418');
const BIGPROP14 = { ship14: { img: SHIP14_IMG, dx: 0, dy: -10, bob: 1 }, mast14: { img: MAST14_IMG, dx: -8, dy: -44, bob: 0 } };
if (typeof PORTRAIT_PROPS !== 'undefined') for (const k in BIGPROP14) PORTRAIT_PROPS.add(k);
{ const _nf = npcFrames; npcFrames = function (look) { if (BIGPROP14[look]) { const c = mkCanvas(16, 22), a = [c, c, c, c]; return { down: a, up: a, left: a, right: a }; } return _nf(look); }; }
{ const _dc = Overworld.prototype.drawChar; Overworld.prototype.drawChar = function (x, e, frames, camX, camY) { const B = e && BIGPROP14[e.look]; if (!B) return _dc.call(this, x, e, frames, camX, camY);
    const bob = B.bob ? Math.round(Math.sin(((this.t || 0) + (e.x || 0) * 7) / 26)) : 0; x.drawImage(B.img, Math.round(e.px) - camX + B.dx, Math.round(e.py) - camY + B.dy + bob); }; }
// the deck: planks, a rail around the hull, the sea streaming past
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) { if (!this.map || !this.map.d.deck14) return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    const t = this.t || 0;
    if (c === '=') { x.fillStyle = '#b07840'; x.fillRect(sx, sy, 16, 16); for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#a06c38' : '#ba824a'; x.fillRect(sx, sy + i * 4, 16, 3); x.fillStyle = '#7a4c24'; x.fillRect(sx, sy + i * 4 + 3, 16, 1); x.fillRect(sx + ((tx * 5 + ty * 3 + i * 7) % 14) + 1, sy + i * 4, 1, 3); } return; }
    if (c === 'F') { x.fillStyle = '#2f7ab0'; x.fillRect(sx, sy, 16, 16); const deck = q => q === '=' || q === 'F'; const n = deck(this.tileAt(tx, ty - 1)), s = deck(this.tileAt(tx, ty + 1)), w = deck(this.tileAt(tx - 1, ty)), e = deck(this.tileAt(tx + 1, ty));
      x.fillStyle = '#5a3418'; x.fillRect(sx + (w ? 0 : 3), sy + (n ? 0 : 3), 16 - (w ? 0 : 3) - (e ? 0 : 3), 16 - (n ? 0 : 3) - (s ? 0 : 3)); x.fillStyle = '#c89058'; x.fillRect(sx + (w ? 0 : 4), sy + (n ? 0 : 4), 16 - (w ? 0 : 4) - (e ? 0 : 4), 3); x.fillStyle = '#3a2210'; x.fillRect(sx + 7, sy + 8, 2, 6); return; }
    if (c === 'W') { x.fillStyle = '#2f7ab0'; x.fillRect(sx, sy, 16, 16); x.fillStyle = '#3a8cc0'; x.fillRect(sx, sy + ((ty * 7 + tx * 3) % 8), 16, 4);
      for (let i = 0; i < 2; i++) { const yy = ((t * 0.6 + tx * 11 + ty * 16 + i * 8) % 16) | 0, xx = (tx * 5 + i * 7 + ty * 3) % 12; x.fillStyle = 'rgba(220,244,252,0.8)'; x.fillRect(sx + xx, sy + yy, 4, 1); } return; }
    return _dt.call(this, x, c, tx, ty, sx, sy, f, f2); }; }
// the flooded houses of 貝殼村: the sea laps at their walls
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); if (!this.map || !this.map.d.flood14) return; const t = this.t || 0;
    for (const { b } of this.map.bimgs || []) { if (!b.flood14) continue; const sx = b.x * 16 - this.camX, sy = (b.y + b.h) * 16 - this.camY - 9;
      x.fillStyle = 'rgba(47,138,192,0.72)'; x.fillRect(sx, sy, b.w * 16, 9); x.fillStyle = 'rgba(230,248,255,0.85)'; for (let X = 0; X < b.w * 16; X += 2) x.fillRect(sx + X, sy + Math.round(Math.sin((X + t * 0.5) / 5)), 2, 1); } }; }
// the battle stage on the deck
{ const _bb = buildBattleBG; buildBattleBG = function (kind) { if (kind !== 'deck14') return _bb(kind);
    const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(4471);
    const grad = (y0, y1, stops) => { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); };
    grad(0, 52, [[0, '#4a9ee0'], [1, '#cdeefa']]); x.fillStyle = '#ffffff'; for (const [a, b, w] of [[20, 14, 26], [110, 26, 20]]) { x.fillRect(a, b, w, 2); x.fillRect(a + 4, b - 1, w - 10, 1); }
    grad(52, 84, [[0, '#2a7ab0'], [1, '#3a9ac8']]); for (let i = 0; i < 36; i++) { x.fillStyle = r() < 0.5 ? '#cfeefa' : '#ffffff'; x.fillRect(Math.floor(r() * W), 54 + Math.floor(r() * 28), 2 + Math.floor(r() * 4), 1); }
    x.fillStyle = '#5a3418'; x.fillRect(0, 84, W, 12); x.fillStyle = '#c89058'; x.fillRect(0, 84, W, 3); x.fillStyle = '#3a2210'; for (let X = 8; X < W; X += 24) x.fillRect(X, 87, 3, 9);
    for (let y = 96; y < BH; y++) { const k = Math.floor((y - 96) / 9); x.fillStyle = k % 2 ? '#a06c38' : '#b47c44'; x.fillRect(0, y, W, 1); if ((y - 96) % 9 === 8) { x.fillStyle = '#7a4c24'; x.fillRect(0, y, W, 1); } }
    for (let y = 96, k = 0; y < BH; y += 9, k++) { x.fillStyle = '#7a4c24'; x.fillRect((k * 37) % W, y, 1, 8); x.fillRect((k * 37 + 88) % W, y, 1, 8); }
    x.fillStyle = '#4a2c14'; x.fillRect(156, 0, 7, 96); x.fillStyle = '#7a4a24'; x.fillRect(156, 0, 2, 96);
    x.strokeStyle = '#8a6a40'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 6); x.lineTo(60, 84); x.moveTo(159, 10); x.lineTo(110, 84); x.stroke();
    x.fillStyle = 'rgba(255,240,200,0.08)'; x.fillRect(0, 0, W, BH); return c; }; }

/* ---------- people ---------- */
Object.assign(LOOKS, {
  captain14: { style: 'beard', H: '#5a3020', h: '#7a4430', j: '#9a5a3a', W: '#8a4a2a', Y: '#f0f0ea', y: '#c8c8c4', R: '#1e3a6a', r: '#132a50', P: '#26283a' },
  chief14: { style: 'long', skirt: 1, H: '#8a8a92', h: '#a8a8b0', j: '#c8c8d0', Y: '#f0e4c8', y: '#c8b890', R: '#d06a48', r: '#a04a30', P: '#4a5a7a' },
  smith14: { H: '#2a2a30', h: '#404048', j: '#585860', Y: '#e8e0d0', y: '#c0b8a8', R: '#6a4a30', r: '#4a3220', P: '#3a3a44' },
});

/* ---------- maps ---------- */
const CH3B_ROWS = {
  seagullDeck14: ['WWWWWWWWWWWWW', 'WWWWWWFWWWWWW', 'WWWWWF=FWWWWW', 'WWWWF===FWWWW'].concat(Array(10).fill('WWWF=====FWWW'), ['WWWFF===FFWWW', 'WWWWFFFFFWWWW', 'WWWWWWWWWWWWW']),
  shellVillage14: ['TTTTTTTTTTTTTTTTTTTTTTTTTT', 'T........................T', 'T........................T', 'T........................T', 'T........................T', 'T..:.....:.....:.....:...T', 'T:::::::::::::::::::::::::', 'T.........:..............T',
    'T.S.......:.....f.....o..T', 'To........:..............T', 'T...f.....:.........,,,..T', 'T,,.......:..........,,..T', 'WWWWWW....:.......WWWWWWWW', 'WWWWWWWW==:==WWWWWWWWWWWWW', 'WWWWWWWWWW=WWWWWWWWWWWWWWW', 'WWWWWWWWWW=WWWWWWWWWWWWWWW', 'WWWWWWWWWW=WWWWWWWWWWWWWWW', 'WWWWWWWWWWWWWWWWWWWWWWWWWW'],
  mistcapeCoast14: ['TTTTTTTTTTTTTTTTTTWWWWWW', 'TT.....,,....T...,,WWWWW', 'T...##.......o....,WWWWW', ':::::::......##...,,WWWW', 'T..##.:......##....,WWWW', 'T..##.:...........,,WWWW', 'TT....:....o......,WWWWW', 'T.....::........,,WWWWWW',
    'T..T...:...##....,WWWWWW', 'T......:...##....,,WWWWW', 'TT.....:..........,WWWWW', 'T.##...::....o....,,WWWW', 'T.##....:.........,,WWWW', 'T.......:...WW.....,WWWW', 'TTo.....:..WWWW....,WWWW', 'T.......:...WW..##.,WWWW',
    'T..##...:.......##.,WWWW', 'T..##...::.........,,WWW', 'TT.......:....o....,WWWW', 'T........:.........,WWWW', 'T.o..##..:...##....,WWWW', 'T....##..:...##...,,WWWW', 'TT.......:.........,WWWW', 'T....T...::....o...,WWWW',
    'T.........:........,WWWW', 'T.##......:...##...,WWWW', 'T.##......:...##..,,WWWW', 'TT........:........,WWWW', 'TTT.......:.......,,WWWW', 'TTTTo.....:......o,WWWWW', 'TTTTTTTTTT:TTTTTTTWWWWWW', 'TTTTTTTTT.:.TTTTTWWWWWWW',
    'TTTTTTTT..:..TTTTWWWWWWW', 'TTTTTTTT..:..TTTTWWWWWWW', 'TTTTTTTT.S:..TTTTWWWWWWW', 'TTTTTTTTTT:TTTTTTWWWWWWW'],
};
for (const id in CH3B_ROWS) { const R = CH3B_ROWS[id]; if (R.some(r => r.length !== R[0].length) && typeof bvErr === 'function') bvErr('ch3b', 'rows ' + id); }
MAPS.seagullDeck14 = { name: '海鷗號・甲板', music: 'lake', outdoor: 1, border: 'W', deck14: 1, battleBg: 'deck14', rows: CH3B_ROWS.seagullDeck14, type: '城鎮',
  npcs: [
    { id: 'mastD14', x: 6, y: 7, dir: 'down', look: 'mast14', name: '主桅' },
    { id: 'captainD14', x: 6, y: 13, dir: 'up', look: 'captain14', name: '船長葛雷' },
    { id: 'liaDeck14', x: 4, y: 9, dir: 'right', look: 'knightLia', name: '見習騎士莉婭' },
    { id: 'sailorD14', x: 8, y: 8, dir: 'left', look: 'sailor13', name: '水手' },
  ], encounters: [], items: [] };
MAPS.shellVillage14 = { name: '貝殼村', music: 'lake', outdoor: 1, border: 'T', popup: 1, theme: 'beach13', flood14: 1, rows: CH3B_ROWS.shellVillage14, type: '城鎮',
  buildings: [{ kind: 'seaInn13', x: 1, y: 1, w: 5, h: 4, door: 2, to: ['shellInn14', 4, 6], sign: 1, signAs: 'inn' }, { kind: 'seaShop13', x: 7, y: 1, w: 5, h: 4, door: 2, to: ['shellShop14', 4, 6], sign: 1, signAs: 'shop' },
    { kind: 'smithy', x: 13, y: 1, w: 5, h: 4, door: 2, to: ['shellSmith14', 4, 6], sign: 1 }, { kind: 'seaHouse13', x: 19, y: 1, w: 5, h: 4, door: 2, to: ['chiefHouse14', 4, 6] },
    { kind: 'seaHouse13', x: 1, y: 12, w: 4, h: 4, door: 1, flood14: 1, to: ['shellVillage14', 3, 9] }, { kind: 'seaShop13', x: 19, y: 12, w: 4, h: 4, door: 2, flood14: 1, to: ['shellVillage14', 20, 9] }],
  signs: { '2,8': '「貝殼村」\n霧角群島的漁村。\n→ 霧角海岸（東）' },
  edgeWarps: [{ dir: 'right', at: [6], to: ['mistcapeCoast14', 0, 3, 'right'] }],
  npcs: [
    { id: 'captainV14', x: 10, y: 16, dir: 'up', look: 'captain14', name: '船長葛雷' },
    { id: 'shipV14', x: 11, y: 15, dir: 'down', look: 'ship14', name: '海鷗號' },
    { id: 'liaVillage14', x: 12, y: 9, dir: 'down', look: 'knightLia', name: '見習騎士莉婭', show: st => ch3m(st) >= 2 },
    { id: 'shellFisher14', x: 6, y: 11, dir: 'down', look: 'sailor13', name: '漁夫' },
    { id: 'shellKid14', x: 16, y: 9, dir: 'down', look: 'kid', name: '小孩', walk: 1 },
    { id: 'shellWoman14', x: 5, y: 7, dir: 'right', look: 'woman', name: '晾漁網的婦人' },
    { id: 'shellBoy14', x: 14, y: 11, dir: 'down', look: 'kid2', name: '少年' },
  ], encounters: [], items: [{ id: 'sv1', x: 23, y: 9, item: 'megaEther', n: 1 }] };
MAPS.shellInn14 = CH2_ROOM(['xxxxxxxxxx', 'xwxxcxxwxx', 'BnnnnnnnnB', 'BnCCCCCCnB', 'nnnnnnnnnn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'shellInnkeeper14', x: 4, y: 2, dir: 'down', look: 'woman2', name: '浪花旅店' }, { id: 'shellInnGuest14', x: 8, y: 5, dir: 'left', look: 'man', name: '旅人' }], { name: '浪花旅店', music: 'lake', back: ['shellVillage14', 3, 5], type: '室內' });
MAPS.shellShop14 = CH2_ROOM(['xxxxxxxxxx', 'xhhxwwxhhx', 'nnnnnnnnnn', 'CCCnnnnVVn', 'nnnnnnnVVn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'shellClerk14', x: 1, y: 2, dir: 'down', look: 'merchant', name: '貝殼村雜貨店' }], { name: '貝殼村雜貨店', music: 'lake', back: ['shellVillage14', 9, 5], type: '室內' });
MAPS.shellSmith14 = { name: '貝殼村鐵匠舖', music: 'lake', wallPal: 'g', type: '室內', rows: ['xxxxxxxxxx', 'xkkxwwxxxx', 'nnnnnnnnnn', 'nnnnnnnnnn', 'nnnnnnnnnn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  exit: { x: 4, y: 7, to: ['shellVillage14', 15, 5] },
  npcs: [{ id: 'smith14', x: 6, y: 3, dir: 'left', look: 'smith14', name: '貝殼村的鐵匠' }, { id: 'sForgeL14', x: 7, y: 2, dir: 'down', look: 'forgeL' }, { id: 'sForgeR14', x: 8, y: 2, dir: 'down', look: 'forgeR' },
    { id: 'sAnvil14', x: 5, y: 3, dir: 'down', look: 'anvil' }, { id: 'sTub14', x: 8, y: 4, dir: 'down', look: 'tub' }, { id: 'sRack14', x: 0, y: 2, dir: 'down', look: 'rackB' }] };
MAPS.chiefHouse14 = CH2_ROOM(['xxxxxxxxxx', 'xwxkkxxwxx', 'nnnnnnnnBn', 'nQQnnnnnBn', 'nQQnnnnnnn', 'nnnnnnnnnn', 'pnnnnnnnnp', 'nnnnDnnnnn'],
  [{ id: 'chief14', x: 4, y: 2, dir: 'down', look: 'chief14', name: '珂拉村長' }, { id: 'chiefKid14', x: 6, y: 5, dir: 'left', look: 'kid', name: '村長的孫子' }], { name: '貝殼村村長家', music: 'lake', back: ['shellVillage14', 21, 5], type: '室內' });
MAPS.mistcapeCoast14 = { name: '霧角海岸', music: 'lake', outdoor: 1, border: 'T', battleBg: 'beach13', popup: 1, theme: 'beach13', rows: CH3B_ROWS.mistcapeCoast14, type: '野外',
  edgeWarps: [{ dir: 'left', at: [3], to: ['shellVillage14', 25, 6, 'left'] }],
  signs: { '9,34': '往南：沉月礁\n礁石之間的路，被不退的潮水淹著。' },
  elites: [{ id: CRAB14, sp: CRAB14, lv: 54, x: 10, y: 30, dir: 'up', sight: 3 }],
  triggers: [{ id: 'reefPath14', x: 10, y: 35 }],
  npcs: [],
  items: [{ id: 'mc1', x: 2, y: 1, item: 'riftShard', n: 2 }, { id: 'mc2', x: 17, y: 9, item: 'megaPotion', n: 2 }, { id: 'mc3', x: 1, y: 19, gold: 9000 }, { id: 'mc4', x: 16, y: 26, item: 'elixir', n: 2 }, { id: 'mc5', x: 3, y: 28, item: 'megaEther', n: 2 }, { id: 'mc6', x: 12, y: 32, item: 'powerFruit', n: 1 }],
  gathers: [{ id: 'gmc1', x: 11, y: 2, kind: 'star', mat: 'starDust' }, { id: 'gmc2', x: 4, y: 23, kind: 'star', mat: 'starDust' }, { id: 'gmc3', x: 18, y: 12, kind: 'coral14', mat: 'coralBranch14' }, { id: 'gmc4', x: 17, y: 24, kind: 'coral14', mat: 'coralBranch14' }, { id: 'gmc5', x: 2, y: 9, kind: 'shell13', mat: 'moonDew' }],
  encounters: [{ y0: 0, y1: 99, rate: 0.08, table: [['pufferFish14', 50, 52, 25], ['surgeGull14', 50, 52, 25], ['spineAnemone14', 51, 53, 25], ['coralSnake14', 51, 53, 25]] }] };
MAPS.mistcapeCoast14.gearPool = LATE_GEAR13();
// 潮鳴港: the captain and his ship at the end of the pier; 莉婭 sails with you
MAPS.harbor13.npcs.push({ id: 'captainH14', x: 10, y: 15, dir: 'up', look: 'captain14', name: '船長葛雷', show: st => ch3(st) >= 6 }, { id: 'shipH14', x: 11, y: 14, dir: 'down', look: 'ship14', name: '海鷗號', show: st => ch3(st) >= 6 });
{ const L = MAPS.harbor13.npcs.find(n => n.id === 'liaPort13'); if (L) L.show = st => ch3(st) >= 1 && ch3m(st) < 2; }
if (typeof mapCache !== 'undefined') delete mapCache.harbor13;
if (typeof MAP_TYPES !== 'undefined') Object.assign(MAP_TYPES, { seagullDeck14: '城鎮', shellVillage14: '城鎮', shellInn14: '室內', shellShop14: '室內', shellSmith14: '室內', chiefHouse14: '室內', mistcapeCoast14: '野外' });
Object.assign(EXPLORE, { shellVillage14: '貝殼村', mistcapeCoast14: '霧角海岸' });
if (typeof BATTLE2_MAPS !== 'undefined') BATTLE2_MAPS.add('mistcapeCoast14');
if (typeof FISH_WATER13 !== 'undefined') Object.assign(FISH_WATER13, { shellVillage14: 'sea', mistcapeCoast14: 'sea' });
if (typeof FOE_SPOTS !== 'undefined') { FOE_SPOTS.push({ sp: SIREN13, lv: 50, map: 'wreckCove13', kind: 'boss', key: SIREN13 }, { sp: CRAB14, lv: 54, map: 'mistcapeCoast14', kind: 'elite', key: CRAB14 }); FOE_SPOTS.sort((a, b) => a.lv - b.lv); }
// the ferry joins the map graph (quest arrows: 「…（搭船）」)
{ const _mg = mapGraph; let done14 = null; mapGraph = function () { const G = _mg(); if (G === done14) return G; done14 = G;
    (G.harbor13 = G.harbor13 || {}).shellVillage14 = { x: 10, y: 15, npc: 'captainH14', ship: 1 }; (G.shellVillage14 = G.shellVillage14 || {}).harbor13 = { x: 10, y: 16, npc: 'captainV14', ship: 1 }; return G; }; }
{ const _qg = questGuide; questGuide = function (q, st = Game.st, ow = Game.ow) { const G = _qg(q, st, ow); if (!G || !G.route || G.route.length < 2) return G;
    const v = (mapGraph()[st.map] || {})[G.route[1]]; if (v && v.ship) { G.text = G.D.what + '（搭船）'; if (G.route[1] === G.D.map) G.next = null; } return G; }; }
if (typeof MAP_G !== 'undefined') MAP_G = null;
if (typeof SPK_INDEX !== 'undefined') SPK_INDEX = null;

/* ---------- the story ---------- */
function* ferry14(ow, dest) { Sound.sfx('run'); yield* fadeOut(20);
  if (dest === 'shellVillage14') ow.load('shellVillage14', 10, 15, 'up'); else ow.load('harbor13', 10, 14, 'up');
  yield* wait(10); yield* fadeIn(20); yield* say('海鷗號抵達了' + MAPS[dest].name + '。'); }
function* voyage14(ow) { Sound.sfx('run'); yield* fadeOut(20); ow.load('seagullDeck14', 6, 11, 'up'); yield* wait(10); yield* fadeIn(20);
  yield* sayAll(['海鷗號揚起了帆，離開了潮鳴港。', '船長葛雷：「好風！照這個速度，傍晚就看得到霧角群島。」', '莉婭：「霧角群島……瑪蓮說，那裡的貝殼村已經一個月沒有消息了。」', '船長葛雷：「放心吧，小姑娘。海鷗號就算碰上暴風雨也……」']);
  yield* seaAttack14(ow); }
function* seaAttack14(ow) { const st = Game.st;
  Sound.sfx('quake'); for (let i = 0; i < 20; i++) { ow.camDY = (i % 2 ? 3 : -3) * (1 - i / 20); yield; } ow.camDY = 0; ow.p.excl = 30; yield* wait(24);
  yield* sayAll(['——船身猛然一晃！', '水手：「船、船長！右舷的海裡有東西！」', '浪花炸開，一條青綠色的大海蛇從海裡探出了頭！', '船長葛雷：「海蛇龍！？那傢伙從來不會靠近船的……」', '莉婭：「我去保護水手們！這傢伙就交給你了！」']);
  const res = yield* ow.battleScript({ sp: SERPENT14, lv: 51, kind: 'elite', id: SERPENT14, extra: [['surgeGull14', 50]] });
  if (res === 'lose') return;
  if (res !== 'win') { yield* sayAll(['海蛇龍潛進了船底……', '船長葛雷：「不行，牠還跟著！先掉頭回港！」']); yield* fadeOut(20); ow.load('harbor13', 10, 14, 'up'); yield* wait(10); yield* fadeIn(20); yield* say('（準備好了，再找船長葛雷出航吧）'); return; }
  st.flags.serpent14 = 1;
  yield* sayAll(['海蛇龍發出長長的吼聲，沉回了海裡。', '船長葛雷：「……好傢伙。你真的把海蛇龍打跑了！」', '莉婭：「水手們都沒事！……可是，海蛇龍為什麼會攻擊船呢？」', '船長葛雷：「這陣子海裡的傢伙都怪怪的。跟那場霧一樣……像是有誰在背後趕著牠們。」']);
  yield* fadeOut(30); setCh3m(2); ow.load('shellVillage14', 10, 15, 'up'); yield* wait(10); yield* fadeIn(30);
  yield* sayAll(['傍晚，海鷗號靠上了霧角群島的碼頭。', '……村子的一半，泡在海水裡。', '房子的門口、晾漁網的木架、通往海邊的石階——全都沉在不會退的潮水下面。', '船長葛雷：「這就是貝殼村……怎麼會變成這樣。」', '莉婭：「先去村長家問問看吧。村長家是最右邊那棟。」']);
  Sound.jingle('item'); yield* say('（海鷗號可以在潮鳴港和貝殼村之間來回了）'); saveGame(); }
{ const _hm = Events.harborMaster13; Events.harborMaster13 = function* (ow) { const st = Game.st; if (ch3(st) < 6) return yield* _hm.call(this, ow); const n = ch3m(st);
    if (n === 0) { setCh3m(1);
      yield* sayAll(['港務長瑪蓮：「你來了。……潮將的事，我這幾天一直在查。」', '瑪蓮：「港口東邊的海上，有一片叫『霧角群島』的小島。島上的貝殼村，是離潮鳴港最近的漁村。」', '瑪蓮：「可是從一個月前開始，貝殼村就沒有消息了。去送貨的船說，島上的海水漲上來以後，就一直沒有退。」',
        '瑪蓮：「海水不退……賽蓮的霧，說不定只是開始。」', '瑪蓮：「我拜託了『海鷗號』的葛雷船長。他是這一帶最大膽的船長，暴風雨也敢出海。」', '瑪蓮：「船停在碼頭的最前面。……拜託你了，勇者。」']);
      Sound.jingle('item'); yield* say('（第三章「東方的海」開始了！）\n（到潮鳴港的碼頭，找船長葛雷）'); saveGame(); return; }
    if (n === 1) { yield* say('瑪蓮：「海鷗號停在碼頭的最前面。葛雷船長會送你們過去的。」'); return; }
    if (n < 5) { yield* say('瑪蓮：「貝殼村的事，葛雷船長跟我說了。……潮水不退，跟潮將一定有關係。」'); return; }
    yield* say('瑪蓮：「往沉月礁的路通了？……潮汐之珠，一定要拿回來。」'); }; }
{ const _lp = Events.liaPort13; Events.liaPort13 = function* (ow) { const st = Game.st; if (ch3(st) < 6) return yield* _lp.call(this, ow);
    if (ch3m(st) === 0) { yield* say('莉婭：「瑪蓮好像有事要找你。港務所在最右邊那棟藍屋頂的房子。」'); return; }
    yield* say('莉婭：「這次我也一起去！海鷗號停在碼頭的最前面。」'); }; }
Object.assign(Events, {
  *captainH14(ow) { const st = Game.st, n = ch3m(st);
    if (n < 1) { yield* sayAll(['船長葛雷：「哈哈！霧散了，海鷗號總算能出海了！」', '葛雷：「……想上船？先去港務所跟瑪蓮打聲招呼吧。」']); return; }
    if (n === 1) { yield* sayAll(['船長葛雷：「你就是瑪蓮說的勇者？我是海鷗號的船長，葛雷。」', '葛雷：「霧角群島啊……那一帶的海這陣子怪得很。浪明明不大，船卻一直被往回推。」', '葛雷：「不過海鷗號什麼樣的海都闖過。準備好就說一聲！」']);
      if (!(yield* yesNo('要搭海鷗號出海嗎？\n（航行中可能會遇到魔物，先準備好再出發）'))) { yield* say('葛雷：「好，準備好再來！」'); return; }
      yield* voyage14(ow); return; }
    const r = yield* ask('船長葛雷：「要去霧角群島的貝殼村嗎？」', ['出航', '不用了']); if (r === 0) yield* ferry14(ow, 'shellVillage14'); },
  *shipH14(ow) { yield* say('停在碼頭邊的帆船「海鷗號」。白色的帆上畫著一隻藍色的海鷗。'); if (ch3m() >= 1) yield* Events.captainH14(ow); },
  *captainV14(ow) { const r = yield* ask('船長葛雷：「要回潮鳴港嗎？」', ['出航', '不用了']); if (r === 0) yield* ferry14(ow, 'harbor13'); },
  *shipV14(ow) { yield* say('海鷗號。纜繩綁在快要淹進水裡的碼頭樁上。'); yield* Events.captainV14(ow); },
  *captainD14(ow) { const st = Game.st;
    if (!st.flags.serpent14) { if (yield* yesNo('船長葛雷：「繼續往霧角群島前進嗎？」')) yield* seaAttack14(ow); return; }
    yield* ferry14(ow, 'shellVillage14'); },
  *liaDeck14() { yield* say('莉婭：「我第一次坐這麼大的船！……你看，海鷗跟著船在飛。」'); },
  *sailorD14() { yield* say('水手：「這陣子海裡的魚都躲起來了。好像有什麼大傢伙在海底游來游去……」'); },
  *mastD14() { yield* say('海鷗號的主桅。帆被風吹得鼓鼓的。'); },
  *chief14(ow) { const st = Game.st, n = ch3m(st);
    if (n <= 2) { setCh3m(3);
      yield* sayAll(['珂拉村長：「……王都來的勇者？還有騎士團的小姑娘。」', '珂拉：「讓你們看到村子這副樣子，真是丟臉。我是貝殼村的村長，珂拉。」', '珂拉：「一個月前的晚上，海上亮起了一道藍光。從那天起，潮水就停在滿潮，再也沒有退過。」',
        '珂拉：「漁船出不了港，田也泡了鹽水。年輕人說要去找原因，划船出去……一個也沒回來。」', '莉婭：「藍光……霧笛魔女說過，她是替『潮將』看守這片海的。」', '珂拉：「潮將……」',
        '珂拉：「這座島上，自古就供奉著一顆『潮汐之珠』。潮水漲了會退、退了會漲，都是因為有那顆珠子在。」', '珂拉：「那天晚上的藍光，就是從供奉珠子的沉月礁那邊亮起來的。」',
        '珂拉：「沉月礁在霧角海岸的南邊。可是海岸的南端……被一隻大螃蟹佔住了。」', '珂拉：「那是蟹群的王，『巨鉗蟹王』。潮水不退以後，牠就變得很兇暴，誰也過不去。」', '珂拉：「勇者大人，拜託你。替我們打倒巨鉗蟹王，去沉月礁看看吧。」']);
      yield* say('（穿過村子東邊的霧角海岸，打倒南端的巨鉗蟹王）'); saveGame(); return; }
    if (n === 3) { yield* say('珂拉：「霧角海岸在村子的東邊。巨鉗蟹王佔住了海岸的最南端……小心那隻大鉗子。」'); return; }
    if (n === 4) { setCh3m(5); const g = 15000;
      yield* sayAll(['珂拉：「巨鉗蟹王被打倒了？……真的嗎！」', '珂拉：「這下，往沉月礁的路就通了。」', '珂拉：「這是村子的一點心意。這顆星星的碎片，是很久以前掉在島上的流星。鐵匠說，拿來打造武器最合適。」']);
      st.money += g; st.bag.starShard = (st.bag.starShard || 0) + 1; Sound.jingle('item'); yield* itemGet('得到了謝禮 ' + g + ' G 和「星之碎片」！');
      yield* sayAll(['珂拉：「沉月礁平常是一片露出海面的礁石。可是現在潮水不退，礁石之間的路全都淹在水裡。」', '珂拉：「傳說礁上有一個『潮音貝』，敲響它，海水就會退下……可是沒有人知道它在哪裡。」', '莉婭：「我們去找找看！」']);
      yield* say('（沉月礁：第三章的下一次更新開放）'); saveGame(); return; }
    yield* say('珂拉：「沉月礁……就拜託你們了。」\n（沉月礁：第三章的下一次更新開放）'); },
  *chiefKid14() { yield* say(ch3m() >= 5 ? '村長的孫子：「奶奶今天笑了！她說海很快就不會生氣了。」' : '村長的孫子：「奶奶每天晚上都坐在窗邊看海。……她說，海在生氣。」'); },
  *liaVillage14() { const n = ch3m(); yield* say(n <= 2 ? '莉婭：「村長家在最右邊那棟。先去問問看吧。」' : n === 3 ? '莉婭：「霧角海岸在村子的東邊。……巨鉗蟹王，聽起來好大一隻。」' : n === 4 ? '莉婭：「快回去告訴村長吧！」' : '莉婭：「沉月礁……潮音貝……我們一定找得到的！」'); },
  *shellFisher14() { yield* say(ch3m() >= 4 ? '漁夫：「巨鉗蟹王被打倒了？那些螃蟹終於不會再爬進村子裡了！」' : '漁夫：「潮水一直不退，漁船全被沖進村子裡了。……你看，我的船卡在屋頂上。」'); },
  *shellKid14() { yield* say('小孩：「以前退潮的時候，可以去礁石那邊撿貝殼的。……現在什麼都撿不到了。」'); },
  *shellWoman14() { yield* say('晾漁網的婦人：「鹽水泡過的漁網，曬三天都不會乾。……唉。」'); },
  *shellBoy14() { yield* say(ch3m() >= 5 ? '少年：「往沉月礁的路通了……哥哥，你一定要平安啊。」' : '少年：「我哥哥划船去找潮水不退的原因，到現在還沒回來。」'); },
  *shellInnkeeper14() { yield* ch2Inn('浪花旅店', { map: 'shellInn14', x: 4, y: 4, dir: 'up' }); },
  *shellInnGuest14() { yield* say('旅人：「我是來島上收珍珠的商人。結果船一靠岸就回不去了……幸好海鷗號來了。」'); },
  *shellClerk14() { yield* shopFlow(SEA_SHOP13); },
  *smith14() { yield* say('貝殼村的鐵匠：「潮水不退，鐵都生鏽了……不過你的裝備，我照樣打得出來。」'); yield* smithMenu(Game.st.flags); yield* say('隨時再來！'); },
  *sForgeL14() { yield* say('爐火燒得正旺。爐邊堆著曬乾的珊瑚枝。'); }, *sForgeR14() { yield* say('爐火燒得正旺。爐邊堆著曬乾的珊瑚枝。'); },
  *sAnvil14() { yield* say('沉甸甸的鐵砧。上面放著一把磨到一半的魚叉。'); }, *sTub14() { yield* say('淬火用的水桶。裡面裝的是海水。'); }, *sRack14() { yield* say('架上掛著魚叉和船錨。'); },
  *reefPath14(ow) { yield* say(ch3m() >= 4 ? '往南是沉月礁。礁石之間的路被不退的潮水淹著，現在還過不去。\n（第三章的下一次更新開放）' : '……前面的礁石被潮水淹著。'); yield* ow.walkEntity(ow.p, 'up', 1); },
  *eliteWin_crabKing14(ow) { const st = Game.st; setCh3m(4);
    yield* sayAll(['巨鉗蟹王翻倒在沙灘上，慢吞吞地爬回了海裡。', '牠剛才蹲著的沙裡，有什麼東西在發光……']);
    st.bag.starShard = (st.bag.starShard || 0) + 1; Sound.jingle('item'); yield* itemGet(st.name + '撿到了「星之碎片」！');
    yield* say('（往南的路通了。回貝殼村，向珂拉村長報告吧）'); saveGame(); },
});
NPC_ROLES.任務.push('captainH14', 'captainV14', 'chief14', 'liaVillage14'); NPC_ROLES.回復.push('shellInnkeeper14'); NPC_ROLES.商店.push('shellClerk14', 'smith14');
NPC_ROLES.情報.push('shipH14', 'shipV14', 'mastD14', 'sForgeL14', 'sForgeR14', 'sAnvil14', 'sTub14', 'sRack14', 'captainD14', 'liaDeck14', 'sailorD14', 'shellFisher14', 'shellKid14', 'shellWoman14', 'shellBoy14', 'shellInnGuest14', 'chiefKid14');
if (typeof NPC_WHERE !== 'undefined') Object.assign(NPC_WHERE, { captainH14: '潮鳴港・碼頭', chief14: '貝殼村・村長家', shellInnkeeper14: '貝殼村・浪花旅店', shellClerk14: '貝殼村・雜貨店', smith14: '貝殼村・鐵匠舖' });

/* ---------- the quest log and the trophies ---------- */
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); if (ch3(st) < 6) return; const n = ch3m(st);
    const T = { 0: '【推薦Lv50〜】到潮鳴港的港務所，找港務長瑪蓮。', 1: '【推薦Lv50〜】到潮鳴港的碼頭找船長葛雷，搭海鷗號渡海。', 2: '到貝殼村，找珂拉村長問問看村子發生了什麼事。（村長家在最右邊）',
      3: '穿過貝殼村東邊的霧角海岸，打倒佔住南端的巨鉗蟹王。（建議Lv52以上）', 4: '巨鉗蟹王被打倒了。回貝殼村，向珂拉村長報告。', 5: '完成：往沉月礁的路通了。（沉月礁：下一次更新開放）' };
    L.push({ n: '第三章「東方的海」', t: T[Math.min(5, n)], done: n >= 5, rw: n >= 4 ? '15000 G・星之碎片' : '', cat: '主線' }); }; }
ACHIEVEMENTS.push({ id: 'ch3_isle', n: '渡海之人', d: '搭海鷗號渡海，抵達貝殼村。', cat: '探索', ok: st => ch3m(st) >= 2 }, { id: 'ch3_crab', n: '蟹王討伐', d: '打倒霧角海岸的巨鉗蟹王。', cat: '戰鬥', ok: st => !!(st.flags || {})[CRAB14] });
