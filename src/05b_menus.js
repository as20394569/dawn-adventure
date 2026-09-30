/* ===================== MENUS v2: roomier layouts, full gear info with plain-language effects ===================== */
// plain-language meaning of every stat / affix / tag
const STAT_HELP = { hp: '最大HP', atk: '物理攻擊的傷害', def: '減少受到的物理傷害', spa: '魔法攻擊和治癒的強度', spd: '減少受到的魔法傷害', spe: '決定誰先行動', mp: '最大MP（施放技能用）' };
const AFFIX_HELP = { crit: '會心率：打出1.5倍傷害的機率', hit: '命中：降低攻擊落空的機率', eva: '迴避：閃開對手攻擊的機率', drain: '吸血：造成傷害的一部分變成自己的HP', elem: '屬性傷害：火、水、草、雷招式的傷害提高', vs: '對這個種族的魔物傷害提高', resist: '受到這個屬性的傷害降低' };
const famName = t => FAMILIES[t] ? FAMILIES[t].n : t + '系';
// every line of information about one piece of gear: [text, color, size, indent]
function gearInfoLines(g, wrapW = 150) {
  const B = GEAR[g.b], o = gearStats(g), L = [], add = (t, c = UIC.text, s = 11, ind = 0) => { for (const l of Font.wrap(t, wrapW - ind, s)) L.push([l, c, s, ind]); };
  add((EQUIP_SLOTS[B.slot === 'acc' ? 'acc1' : B.slot]) + (B.kind && B.kind !== '飾品' ? '・' + B.kind + (typeof handTag === 'function' ? handTag(B) : '') : '') + '　品相' + Math.round(g.r * 100) + '%' + (g.e ? '　強化+' + g.e : ''), UIC.muted, 10);
  L.push(['【基本能力】', UIC.accent, 10, 0]);
  const stl = [...STATK, 'mp'].filter(k => o.st[k]).map(k => (k === 'mp' ? 'MP' : STAT_NAMES[k]) + ' +' + o.st[k]);
  if (stl.length) add(stl.join('　'), UIC.text, 11, 4); else add('（無）', UIC.dis, 10, 4);
  const extra = [];
  for (const k in SP_NAMES) if (o.sp[k]) extra.push([SP_NAMES[k] + ' +' + o.sp[k] + '%', AFFIX_HELP[k]]);
  for (const [t, v] of o.sp.vs) extra.push(['對' + famName(t) + ' +' + v + '%', AFFIX_HELP.vs]);
  for (const t in o.sp.resist) extra.push([t + '系傷害 -' + o.sp.resist[t] + '%', AFFIX_HELP.resist]);
  if (extra.length) { L.push(['【詞綴與加成】', UIC.accent, 10, 0]); for (const [a, h] of extra) { add('・' + a, '#c8f0ff', 11, 4); if (h) add(h, UIC.muted, 9, 12); } }
  if (B.elem) { L.push(['【屬性武器】', UIC.accent, 10, 0]); add(B.elem + '屬性：普通攻擊和一般屬性的招式會變成' + B.elem + '屬性，可以打弱點。', UIC.text, 10, 4); }
  if ((B.fx || []).length) { L.push(['【特殊效果】', UIC.accent, 10, 0]); for (const f of B.fx) { add('★' + SPECIALS[f].n, UIC.warm, 11, 4); add(SPECIALS[f].d, UIC.text, 10, 12); } }
  if (B.d) { L.push(['', UIC.text, 6, 0]); add(B.d, UIC.muted, 10, 0); }
  return L;
}
const lineH = s => s <= 6 ? 6 : s <= 9 ? 12 : s <= 10 ? 13 : 14;
function drawInfoLines(x, L, X, Y, maxY, from = 0) { let y = Y, i = from; for (; i < L.length; i++) { const h = lineH(L[i][2]); if (y + h > maxY) break; if (L[i][0]) Font.draw(x, L[i][0], X + L[i][3], y, L[i][1], UIC.textSh, L[i][2]); y += h; } return i; } // returns first line NOT drawn
// full-screen gear page (scrolls). Used from equip, bag and shop.
function* gearInfoScreen(g, title) {
  let top = 0; const L = gearInfoLines(g, 156);
  const scr = { touchBack: true, draw(x) {
    screenBG(x); headerBar(x, title || '裝備詳情'); drawWin(x, 4, 22, 168, 230, 'menu');
    Font.draw(x, gearName(g), 10, 25, gCol(g), UIC.textSh); x.fillStyle = gCol(g); x.fillRect(10, 40, 156, 1);
    const end = drawInfoLines(x, L, 10, 44, 238, top);
    if (top > 0) x.drawImage(UPARROW, 86, 42); if (end < L.length) x.drawImage(DOWNARROW, 86, 238);
    Font.drawR(x, (end < L.length || top > 0 ? '↑↓捲動　' : '') + 'B返回', 166, 240, UIC.muted, UIC.textSh, 9);
    touchRegion(4, 44, 168, 96, () => { if (top > 0) top--; }); touchRegion(4, 150, 168, 86, () => { if (end < L.length) top++; });
    scr.more = end < L.length;
  } };
  UI.push(scr);
  while (true) { if (Input.repeat('up') && top > 0) { top--; Sound.sfx('cursor'); } if (Input.repeat('down') && scr.more) { top++; Sound.sfx('cursor'); } if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr);
}
// compact detail panel (bag / shop): same information, cut off with a hint when it doesn't fit
drawGearDetail = function (x, g, Y, h, cmp) {
  Font.draw(x, gearName(g), 10, Y, gCol(g), UIC.textSh); let y = Y + 16;
  if (cmp) { Font.draw(x, cmp, 12, y, UIC.warm, UIC.textSh, 10); y += 13; }
  const L = gearInfoLines(g).filter(l => l[2] !== 9 && l[1] !== UIC.muted);
  const end = drawInfoLines(x, L, 10, y, Y + h - 14); if (end < L.length) Font.drawR(x, '▶ 查看全部', 166, Y + h - 13, UIC.accent, UIC.textSh, 9);
};

/* ---------- Main menu: big tiles instead of a tiny list ---------- */
const MAIN_TILES = [['狀態', '能力・任務'], ['技能', '學習・升級'], ['天賦', '被動加成'], ['背包', '道具・素材'], ['裝備', '更換・詳情'], ['圖鑑', '魔物資料'], ['紀錄', '地圖・成就'], ['存檔', '記錄進度'], ['設定', '音量・速度'], ['關閉', '回到遊戲']];
startMenu = function* () {
  Sound.sfx('menu'); let idx = Game.menuIdx || 0;
  while (true) {
    const st = Game.st, s = heroStats();
    const hdr = { draw(x) { x.fillStyle = 'rgba(8,10,20,0.78)'; x.fillRect(0, 0, W, H); drawWin(x, 4, 4, 168, 40, 'menu'); x.drawImage(heroFramesFor(st).down[0], 0, 0, 16, 22, 10, 8, 24, 33);
      const nx = Font.draw(x, st.name, 40, 6, UIC.text, UIC.textSh); if (CLASSES[st.cls]) Font.draw(x, CLASSES[st.cls].n, nx + 4, 7, UIC.warm, UIC.textSh, 10); Font.drawR(x, 'Lv' + st.lv, 166, 6, UIC.accent, UIC.textSh);
      Font.draw(x, 'HP ' + st.hp + '/' + s.hp, 40, 22, UIC.good, UIC.textSh, 10); Font.draw(x, 'MP ' + (st.mp ?? s.mp) + '/' + s.mp, 96, 22, '#86b4ff', UIC.textSh, 10); Font.drawR(x, st.money + ' G', 166, 32, UIC.warm, UIC.textSh, 10);
      Font.draw(x, MAPS[st.map] ? MAPS[st.map].name || '' : '', 40, 32, UIC.muted, UIC.textSh, 9); } };
    UI.push(hdr);
    const items = MAIN_TILES.map(([t, sub]) => ({ t, dot: (t === '天賦' && st.tp) || (t === '技能' && st.skp), sub }));
    const r = yield* choose(items, { x: 4, y: 48, w: 168, h: 204, cols: 2, colW: 82, rowH: 40, ox: 4, oy: 4, buttons: true, style: 'menu', index: idx, drawExtra: (x, m) => { for (let k = 0; k < items.length; k++) { const c = k % 2, rr = Math.floor(k / 2), X = m.x + m.ox + c * m.colW, Y = m.y + m.oy + rr * m.rowH; Font.drawC(x, items[k].sub, X + 39, Y + 22, k === m.i ? UIC.accent : UIC.muted, UIC.textSh, 9); if (items[k].dot) { x.fillStyle = UIC.warm; x.fillRect(X + 70, Y + 5, 4, 4); } } } });
    UI.remove(hdr);
    if (r < 0 || r === 9) break; idx = r; Game.menuIdx = r;
    if (r === 0) yield* summaryScreen(); if (r === 1) yield* skillTreeScreen(); if (r === 2) yield* talentScreen();
    if (r === 3) { yield* bagScreen('field'); if (Game.homeWarp) break; }
    if (r === 4) yield* equipScreen(); if (r === 5) yield* dexScreen(); if (r === 6) yield* recordScreen();
    if (r === 7) { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } }
    if (r === 8) yield* optionsScreen();
  }
  if (Game.homeWarp && Game.ow) { Game.homeWarp = 0; yield* Game.ow.homeWarp(); }
};

/* ---------- Equipment: slot list + full info of what's equipped; candidates with comparison ---------- */
equipScreen = function* () {
  let idx = 0; const slots = Object.keys(EQUIP_SLOTS), st = Game.st;
  const scr = { touchBack: true, draw(x) {
    screenBG(x); headerBar(x, '裝備'); Font.drawR(x, 'A更換　→詳情', W - 6, 3, UIC.muted, UIC.textSh, 9);
    drawWin(x, 4, 22, 168, slots.length * 19 + 6, 'menu');
    slots.forEach((sl, i) => { const Y = 25 + i * 19, g = gearBy(st.equip[sl]); if (i === idx) selBar(x, 6, Y, 164, 18);
      Font.draw(x, EQUIP_SLOTS[sl], 12, Y + 2, UIC.accent, UIC.textSh, 10); Font.draw(x, g ? GEAR[g.b].n + (g.e ? ' +' + g.e : '') : '（空）', 44, Y + 1, g ? gCol(g) : UIC.dis, UIC.textSh, 11); if (g && (GEAR[g.b].fx || []).length) Font.drawR(x, '★', 164, Y + 1, UIC.warm, UIC.textSh, 10);
      touchRegion(6, Y, 164, 18, () => { if (idx === i) tapKey('a'); else idx = i; }); });
    const Y0 = 22 + slots.length * 19 + 10, g = gearBy(st.equip[slots[idx]]); drawWin(x, 4, Y0, 168, H - Y0 - 4, 'menu');
    if (!g) { Font.draw(x, '這個部位沒有裝備。按A選擇要裝上的東西。', 10, Y0 + 6, UIC.muted, UIC.textSh, 10); const s = heroStats(); [['物攻', s.atk], ['物防', s.def], ['魔攻', s.spa], ['魔防', s.spd], ['速度', s.spe], ['會心', s.crit.toFixed(1) + '%']].forEach(([a, b], i) => { const X = 10 + (i % 3) * 54, Y = Y0 + 30 + Math.floor(i / 3) * 16; Font.draw(x, a, X, Y, UIC.muted, UIC.textSh, 10); Font.drawR(x, String(b), X + 48, Y, UIC.text, UIC.textSh, 10); }); dollPreview(x, heroLookOf(st), 130, Y0 + 30, 1); return; }
    Font.draw(x, gearName(g), 10, Y0 + 3, gCol(g), UIC.textSh); const L = gearInfoLines(g), end = drawInfoLines(x, L, 10, Y0 + 19, H - 20);
    if (end < L.length) Font.drawR(x, '▶ 查看全部', 166, H - 17, UIC.accent, UIC.textSh, 9);
    touchRegion(4, Y0, 168, H - Y0 - 4, () => tapKey('right'));
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + slots.length - 1) % slots.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % slots.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('right')) { const g = gearBy(st.equip[slots[idx]]); if (g) { Sound.sfx('select'); UI.remove(scr); yield* gearInfoScreen(g); UI.push(scr); } }
    if (Input.pressed('a')) { Input.consume('a'); Sound.sfx('select'); UI.remove(scr); yield* equipPick(slots[idx]); UI.push(scr); }
    yield;
  }
  UI.remove(scr);
};
function* equipPick(sl) {
  const st = Game.st, cur = gearBy(st.equip[sl]);
  const own = gearSort().filter(g => GEAR[g.b].slot === SLOT_OF(sl) && (!isEquipped(g) || g === cur));
  const opts = own.map(g => ({ g })).concat([{ g: null }]); let hi = Math.max(0, own.indexOf(cur)), top = 0; const VIS = 5;
  const scr = { touchBack: true, draw(x) {
    screenBG(x); headerBar(x, '更換' + EQUIP_SLOTS[sl]); Font.drawR(x, 'A裝上　→詳情', W - 6, 3, UIC.muted, UIC.textSh, 9);
    top = clamp(hi - 2, 0, Math.max(0, opts.length - VIS)); drawWin(x, 4, 22, 168, VIS * 18 + 8, 'menu');
    opts.slice(top, top + VIS).forEach((o, k) => { const i = top + k, Y = 26 + k * 18; if (i === hi) selBar(x, 6, Y - 1, 164, 17);
      Font.draw(x, o.g ? GEAR[o.g.b].n + (o.g.e ? ' +' + o.g.e : '') : '卸下', 14, Y, o.g ? gCol(o.g) : UIC.muted, UIC.textSh, 11); if (o.g === cur && cur) Font.drawR(x, '裝備中', 164, Y + 1, UIC.accent, UIC.textSh, 9); else if (o.g && (GEAR[o.g.b].fx || []).length) Font.drawR(x, '★', 164, Y, UIC.warm, UIC.textSh, 10);
      touchRegion(6, Y - 1, 164, 17, () => { if (hi === i) tapKey('a'); else hi = i; }); });
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (top + VIS < opts.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 18 + 3);
    const o = opts[hi], Y0 = 22 + VIS * 18 + 12; drawWin(x, 4, Y0, 168, H - Y0 - 4, 'menu'); { const wim = !o.g ? null : sl === 'weapon' ? (typeof weaponPx === 'function' ? weaponPx(o.g.b) : null) : (typeof armorIcon === 'function' ? armorIcon(o.g.b) : null); if (wim) drawWeaponIcon(x, wim, 154, Y0 + 26, 2); else dollPreview(x, heroLookOf(st, { [sl]: o.g ? o.g.u : null }), 138, Y0 + 4, 1); } /* v24.4 weapon sprite */
    // comparison with what's equipped now
    const before = heroStats(), sv = st.equip[sl]; st.equip[sl] = o.g ? o.g.u : null; const after = heroStats(); st.equip[sl] = sv;
    const d = ['hp', 'mp', 'atk', 'def', 'spa', 'spd', 'spe', 'crit'].map(k => [k, Math.round((after[k] - before[k]) * 10) / 10]).filter(([, v]) => v);
    Font.draw(x, '裝上後的變化', 10, Y0 + 3, UIC.accent, UIC.textSh, 10);
    if (!d.length) Font.draw(x, '能力沒有變化', 12, Y0 + 17, UIC.muted, UIC.textSh, 10);
    d.slice(0, 8).forEach(([k, v], i) => { const X = 12 + (i % 2) * 62, Y = Y0 + 17 + Math.floor(i / 2) * 13; Font.draw(x, (k === 'mp' ? 'MP' : k === 'crit' ? '會心' : STAT_NAMES[k]), X, Y, UIC.muted, UIC.textSh, 10); Font.drawR(x, (v > 0 ? '+' : '') + v + (k === 'crit' ? '%' : ''), X + 56, Y, v > 0 ? UIC.good : UIC.bad, UIC.textSh, 10); });
    if (o.g) { const L = gearInfoLines(o.g).filter(l => l[0].startsWith('・') || l[0].startsWith('★')).concat(GEAR[o.g.b].elem ? [[GEAR[o.g.b].elem + '屬性武器', '#c8f0ff', 10, 0]] : []), yy = Y0 + 17 + Math.ceil(Math.min(8, d.length || 1) / 2) * 13 + 4; drawInfoLines(x, L.map(l => [l[0], l[1], 10, 0]), 10, yy, H - 20); Font.drawR(x, '→ 詳情', 166, H - 17, UIC.accent, UIC.textSh, 9); }
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { hi = (hi + opts.length - 1) % opts.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { hi = (hi + 1) % opts.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('right') && opts[hi].g) { Sound.sfx('select'); UI.remove(scr); yield* gearInfoScreen(opts[hi].g); UI.push(scr); }
    if (Input.pressed('a')) { Input.consume('a'); const o = opts[hi]; for (const k in st.equip) if (o.g && st.equip[k] === o.g.u) st.equip[k] = null; st.equip[sl] = o.g ? o.g.u : null; clampHP(); Sound.sfx('item'); break; }
    yield;
  }
  UI.remove(scr);
}
