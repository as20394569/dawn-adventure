/* ===================== v12.0.2 鐵匠兩頁・冒險手冊・素材（玩家在〈第一輪打磨提案〉勾選；只改畫面和說明，數值不動） =====================
   鐵匠：「打造」（打造裝備、分解）＋「強化」（先選一件裝備，再選 強化 +N／升星 ★／重鑄，各自標出花費）。
   選單：「任務」「圖鑑」「紀錄」三格合成「冒險手冊」（09o 的 TILES），裡面多一頁「變強的方法」。
   素材做法 A：12 種附魔石從道具資料拿掉（舊存檔的換算 v12Convert 照舊）；背包裡的素材說明多寫「從哪裡來、用在哪裡」。 */

/* ---------- 鐵匠 ---------- */
function* smithOnGear12(g, flow) { // run an existing one-gear flow (it opens gearPicker) on a gear already chosen
  const _gp = gearPicker; let used = false;
  gearPicker = function* (title, getList) { if (used) return null; used = true; if (getList().includes(g)) return g; yield* say('這件裝備不能這樣做。'); return null; };
  try { yield* flow(); } finally { gearPicker = _gp; } }
function* smithEnhance12(g) { const st = Game.st, c = enhanceCost(g), ok = st.money >= c.gold && Object.entries(c.mats).every(([k, n]) => (st.bag[k] || 0) >= n);
  if ((g.e || 0) >= 10) { yield* say('已經強化到 +10 了。'); return; } if (!ok) { yield* say('素材或金錢不夠喔。'); return; }
  if (!(yield* yesNo('要強化' + gearShort(g) + '嗎？' + (c.rate < 1 ? '\n（失敗的話素材和金錢會消失）' : '')))) return;
  st.money -= c.gold; for (const k in c.mats) st.bag[k] -= c.mats[k]; Sound.sfx('rock'); yield* say('鏘！鏘！鏘！');
  if (Math.random() < c.rate) { g.e = (g.e || 0) + 1; clampHP(); Sound.jingle('item'); yield* say('強化成功！' + gearName(g) + '！'); } else { Sound.sfx('bump'); yield* say('……可惜，這次失敗了。'); } }
function* smithStar12(g) { const st = Game.st, R = st.refine || (st.refine = {}), s = g.s || 0, need = starStones(s), c = starGold(g, s);
  if (s >= STAR_MAX) { yield* say('已經是最高的★' + STAR_MAX + '了。'); return; }
  if ((R[g.b] || 0) < need || st.money < c) { yield* say('精煉石或金錢不夠喔。（再打倒掉落這件裝備的魔物，就能拿到精煉石）'); return; }
  if (!(yield* yesNo('要讓' + gearShort(g) + '升星嗎？\n（精煉石×' + need + '、' + c + ' G，一定成功）'))) return;
  R[g.b] -= need; st.money -= c; g.s = s + 1; clampHP(); Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); Sound.jingle('levelup'); yield* say('升星成功！' + gearName(g) + '！'); }
function* smithUpgrade12() { const st = Game.st, R = () => st.refine || {};
  while (true) {
    const fit = (x, t, Y, col) => { let z = 10; while (z > 8 && Font.width(t, z) > 152) z--; Font.draw(x, t, 12, Y + (10 - z) / 2, col, UIC.textSh, z); }; // v12.0.5: long lines used to run past the window
    const g = yield* gearPicker('強化', () => gearSort(), (x, g, Y) => { const c = enhanceCost(g), s = g.s || 0;
      fit(x, (g.e || 0) < 10 ? '強化 +' + (g.e || 0) + '→+' + ((g.e || 0) + 1) + '　' + c.gold + ' G・成功率' + Math.round(c.rate * 100) + '%' : '強化：已經 +10', Y, UIC.accent);
      fit(x, s < STAR_MAX ? '升星 ★' + s + '→★' + (s + 1) + '　精煉石 ' + (R()[g.b] || 0) + '/' + starStones(s) + '・' + starGold(g, s) + ' G' : '升星：已經 ★' + STAR_MAX, Y + 13, '#ffd860');
      fit(x, g.q >= 2 ? '重鑄：詞綴 ' + reforgeCost(g).gold + ' G／品質' : '重鑄：品質（藍色沒有詞綴）', Y + 26, '#c8b8ff'); });
    if (!g) return;
    while (true) { const c = enhanceCost(g), s = g.s || 0;
      const opts = ['強化 +' + (g.e || 0) + '→+' + ((g.e || 0) + 1) + '（' + c.gold + ' G）', '升星 ★' + s + '→★' + (s + 1) + '（精煉石 ' + (R()[g.b] || 0) + '/' + starStones(s) + '）', '重鑄（詞綴／品質）', '換一件'];
      const r = yield* ask(gearName(g), opts); if (r === 0) yield* smithEnhance12(g); else if (r === 1) yield* smithStar12(g); else if (r === 2) yield* smithOnGear12(g, reforgeFlow); else break; } } }
smithMenu = function* (f) {
  while (true) { const r = yield* ask('要做什麼？', ['打造', '強化' + (f && f.smithDisc ? '（強化半價）' : ''), '離開']);
    if (r === 0) { const r2 = yield* ask('打造', ['打造裝備', '分解', '返回']); if (r2 === 0) yield* craftScreen(); else if (r2 === 1) yield* salvageFlow(); }
    else if (r === 1) yield* smithUpgrade12(); else break; } };

/* ---------- 冒險手冊 ---------- */
const GROW12 = [
  ['等級與屬性', '打倒魔物得到經驗值。升級時能力會提升，還會拿到屬性點，在選單的「屬性」自由分配。'],
  ['職業', '村長那裡可以轉職。Lv14 找村長「天賦覺醒」後，劍士、魔導士、守護者、遊俠會進階成劍聖、大魔導士、聖騎士、神射手。'],
  ['天賦與職業招式', '升級和天賦之書會給天賦點。在選單的「天賦」，每一層二選一。'],
  ['技能練度', '每用一次技能練度 +1：滿第一格學會（武器技能），再用 6 次可以進化「改」，再用 24 次進化「極」。修練之書：練度 +12。'],
  ['裝備', '鐵匠「打造」：用設計圖和素材做裝備。鐵匠「強化」：強化到 +10、用精煉石升星、重鑄詞綴或品質。'],
  ['果實', '六種果實會永久提升能力。果實買越多越貴（六種一起算）。'],
];
function* handbookScreen12() {
  while (true) { const r = yield* ask('冒險手冊', ['任務', '圖鑑', '紀錄', '變強的方法', '返回']);
    if (r === 0) yield* questScreen(); else if (r === 1) yield* dexScreen(); else if (r === 2) yield* recordScreen();
    else if (r === 3) { while (true) { const k = yield* ask('變強的方法', GROW12.map(q => q[0]).concat('返回')); if (k < 0 || k >= GROW12.length) break; yield* say(GROW12[k][1]); } }
    else break; } }

/* ---------- 素材做法 A ---------- */
const EN12 = Object.keys(ITEMS).filter(k => ITEMS[k].use === 'enchant'), EN12_DEF = Object.fromEntries(EN12.map(k => [k, ITEMS[k]]));
for (const k of EN12) delete ITEMS[k];
{ const _v = v12Convert; v12Convert = function (st) { for (const k of EN12) ITEMS[k] = EN12_DEF[k];
    try { return _v(st); } finally { for (const k of EN12) { delete ITEMS[k]; if (st && st.bag) delete st.bag[k]; } } }; }
const MAT_USE12 = (() => { const U = {}, add = (k, name) => { (U[k] = U[k] || { gear: 0, items: [] }); if (name) { if (!U[k].items.includes(name)) U[k].items.push(name); } else U[k].gear++; };
  for (const k in GEAR_RECIPE) for (const m in GEAR_RECIPE[k].mats || {}) add(m);
  for (const R of [RECIPES, typeof RECIPES_V20 !== 'undefined' ? RECIPES_V20 : [], typeof RECIPES_CH2 !== 'undefined' ? RECIPES_CH2 : []]) for (const r of R) if (r.mats && ITEMS[r.out]) for (const m in r.mats) add(m, ITEMS[r.out].n);
  return U; })();
for (const k in ITEMS) { const I = ITEMS[k]; if (!['魔物素材', '採集素材'].includes(I.cat)) continue; let base = I.d || '';
  Object.defineProperty(I, 'd', { configurable: true, enumerable: true, get() { const U = MAT_USE12[k], use = U ? [U.gear ? U.gear + ' 件裝備' : '', ...U.items.slice(0, 2)].filter(Boolean).join('、') : '';
    return base + '\n來源：' + matSource(k) + (use ? '\n用途：' + use : ''); }, set(v) { base = v; } }); }
