/* ===================== v22 free attribute allocation + RPG-style skill scaling (playtest: "角色應該可以自由加點") =====================
   - Attributes no longer grow on their own. Every level gives 屬性點 (2, +1 on every 3rd level ≈ the old automatic growth),
     spent freely in 選單 → 屬性. Raising an attribute past 20 costs 2 points, past 30 costs 3 (specialists pay more).
   - Each attribute has a clear job (see ATTR_HELP); 體力 / 智力 / 幸運 are worth more than before so every build is viable.
   - Skills show their damage as 物攻×% / 魔攻×% (the basic attack = 100%), and scale with one attribute:
     +1–1.5% damage per point above 10 (敏捷 for fast / multi-hit skills, 力量 for heavy blows, 靈巧 for precise ones, 智力 for magic…).
   - 推薦配點 fills the remaining points by the class's template; the first 重置 is free, later ones cost gold.
   - Old saves keep exactly the attributes they had (converted to allocated points) and get one free reset. */
const ATTR_BASE = { str: 4, agi: 4, vit: 4, int: 4, dex: 4, luk: 3 };
const ATTR_HELP = { str: '物攻+1　（重擊技能加成）', agi: '速度+1.5、迴避+0.4%、物防+0.3　（連擊技能加成）', vit: '最大HP+1.6、物防+1、魔防+0.6', int: '魔攻+1.2、最大MP+1.5、魔防+0.6　（魔法加成）', dex: '命中+0.5%、物攻+0.5、魔攻+0.3　（精準技能加成）', luk: '會心率+0.6%、迴避+0.1%　（暗殺技能加成）' };
const ATTR_TEMPLATE = { swordsman: { str: 3, vit: 2, dex: 2, agi: 1, luk: 1 }, mage: { int: 4, dex: 2, vit: 2, agi: 1 }, guardian: { vit: 4, str: 2, dex: 1, int: 1 }, ranger: { agi: 3, dex: 2, str: 2, vit: 2, luk: 1 }, _: { str: 2, int: 2, vit: 2, agi: 1, dex: 1 } };
const attrPointsFor = lv => Math.max(0, lv - 1); /* v7.1: 1 per level (was 2): the hero grew too fast */ // 2 per level: free allocation already wastes nothing, so this keeps builds close to the old balance
const attrCost = v => v < 20 ? 1 : v < 30 ? 2 : 3;
function attrSpent(st) { let n = 0; for (const k of ATTRS) { const b = ATTR_BASE[k], a = (st.attr || {})[k] || 0; for (let v = b; v < b + a; v++) n += attrCost(v); } return n; }
const attrAvail = (st = Game.st) => st && st.attr ? attrPointsFor(st.lv) + (st.attrBonus || 0) - attrSpent(st) : 0;
{ const _ha = heroAttr; heroAttr = function (st = Game.st) {
    if (!st || !st.attr) return _ha(st); const a = {};
    for (const k of ATTRS) a[k] = ATTR_BASE[k] + (st.attr[k] || 0) + ((st.boost || {})[k] || 0); return a;
  };
}
function attrAuto(st = Game.st) { // spend the remaining points by the class template (cheapest-ratio first)
  const T = ATTR_TEMPLATE[baseClassOf(st.cls)] || ATTR_TEMPLATE._; st.attr = st.attr || {};
  for (let guard = 0; guard < 400; guard++) {
    const left = attrAvail(st); let best = null, br = 1e9;
    for (const k in T) { const cur = ATTR_BASE[k] + (st.attr[k] || 0), c = attrCost(cur); if (c > left) continue; const r = ((st.attr[k] || 0) + 1) / T[k]; if (r < br) { br = r; best = k; } }
    if (!best) break; st.attr[best] = (st.attr[best] || 0) + 1;
  }
}
function attrLegacy(st) { const a = {}; for (const k of ATTRS) a[k] = HERO_ATTR_INIT[k] + Math.floor(HERO_GROWTH_OFS[k] + HERO_GROWTH[k] * (st.lv - 5)); return a; }
function attrMigrate(st) {
  if (!st || st.attr) return false; const old = attrLegacy(st); st.attr = {};
  for (const k of ATTRS) st.attr[k] = Math.max(0, old[k] - ATTR_BASE[k]);
  const over = attrSpent(st) - attrPointsFor(st.lv); st.attrBonus = Math.max(0, over); st.attrFreeReset = 1; return true;
}
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.attr = {}; st.attrFreeReset = 1; } return st; }; }
// v21 had a bug: level-ups gave no skill / talent points. Top both pools up to what the level entitles (never takes anything away).
function fixV22(st) {
  if (!st || st.fixV22) return; st.fixV22 = 1; const L = st.lv;
  if (st.cls) { const earned = 2 + Math.min(L, 5) - 1 + 2 * Math.max(0, L - 5), free = st.skFree || {}; let spent = 0; for (const k in st.skills || {}) spent += Math.max(0, (st.skills[k] || 0) - (free[k] ? 1 : 0)); st.skp = Math.max(st.skp || 0, earned - spent); }
  const tsp = Object.values(st.tal || {}).reduce((q, b) => q + b, 0); st.tp = Math.max(st.tp || 0, tpForLevel(L) - tsp);
}
{ const _so = startOverworld; startOverworld = function (...a) {
    fixV22(Game.st); const mig = attrMigrate(Game.st), ow = _so.apply(this, a);
    if (mig && ow && ow.run && Game.st.lv > 1) ow.run((function* () { yield* wait(30); yield* say('【系統更新】屬性改成自由加點了！\n每次升級會得到「屬性點」，在選單的「屬性」自由分配。'); yield* say('目前的屬性已經換算好了，第一次重置免費，可以重新打造自己的角色。'); })());
    return ow;
  };
}
// the level-up window: HP / MP / derived stats grow with the level, attributes come from the new 屬性點
{ const _lu = Battle.prototype.levelUp; Battle.prototype.levelUp = function* () {
    const st = Game.st, before = attrAvail(st); const r = yield* _lu.call(this); const gain = attrAvail(st) - before;
    if (st.attr && gain > 0) { Sound.sfx('item'); yield* this.msg('獲得了' + gain + '點屬性點！（目前' + attrAvail(st) + '點，選單→屬性 分配）', { hold: 40 }); }
    return r;
  };
}

/* ---------- 屬性 screen ---------- */
function* attrScreen() {
  const st = Game.st; st.attr = st.attr || {}; let i = 0; const s0 = heroStats(st), add = {}; const N = ATTRS.length + 2;
  const DER = [['HP', 'hp'], ['MP', 'mp'], ['物攻', 'atk'], ['物防', 'def'], ['魔攻', 'spa'], ['魔防', 'spd'], ['速度', 'spe'], ['會心', 'crit', '%'], ['命中', 'hit', '%'], ['迴避', 'eva', '%']];
  const resetCost = () => st.attrFreeReset ? 0 : 100 * st.lv;
  const scr = { touchBack: true, draw(x) {
    screenBG(x); headerBar(x, '屬性'); const av = attrAvail(st); Font.drawR(x, '屬性點 ' + av, W - 6, 2, av ? UIC.warm : UIC.muted, UIC.textSh);
    const a = heroAttr(st); drawWin(x, 4, 22, 168, 118, 'menu');
    ATTRS.forEach((k, r) => { const Y = 26 + r * 15, on = i === r; if (on) selBar(x, 6, Y - 1, 164, 14);
      Font.draw(x, ATTR_NAMES[k], 12, Y - 1, on ? UIC.text : '#c9cfe4', UIC.textSh, 11); Font.drawR(x, String(a[k]), 74, Y - 1, add[k] ? UIC.good : UIC.text, UIC.textSh, 11);
      if ((st.boost || {})[k]) Font.draw(x, '(+' + st.boost[k] + ')', 77, Y, UIC.accent, UIC.textSh, 8);
      const c = attrCost(ATTR_BASE[k] + (st.attr[k] || 0)); Font.drawR(x, (add[k] ? '◀ ' : '') + '▶ ' + c + '點', 164, Y, c <= av ? UIC.warm : UIC.dis, UIC.textSh, 9);
      touchRegion(4, Y - 1, 168, 14, () => { if (i === r) tapKey('right'); else i = r; }); });
    const Y2 = 26 + ATTRS.length * 15 + 1; [['推薦配點', av > 0], ['重置屬性' + (resetCost() ? '（' + resetCost() + 'G）' : '（免費）'), attrSpent(st) > 0]].forEach(([t, ok], n) => { const X = 8 + n * 82, on = i === ATTRS.length + n; drawBtn(x, X, Y2, 78, 16, on); Font.drawC(x, t, X + 39, Y2, ok ? (on ? UIC.text : '#c9cfe4') : UIC.dis, UIC.textSh, 9); touchRegion(X, Y2, 78, 16, () => { i = ATTRS.length + n; tapKey('a'); }); });
    const k = ATTRS[i]; drawWin(x, 4, 142, 168, 110, 'menu');
    Font.draw(x, k ? ATTR_NAMES[k] + '：' : (i === ATTRS.length ? '依職業的推薦比例分配剩下的點數。' : '把所有屬性點收回來重新分配。'), 12, 144, UIC.accent, UIC.textSh, 10);
    if (k) Font.wrap(ATTR_HELP[k], 118, 9).slice(0, 2).forEach((l, n) => Font.draw(x, l, 48, 145 + n * 11, UIC.text, UIC.textSh, 9));
    const s = heroStats(st); DER.forEach(([n, key, u], r) => { const X = 12 + (r % 2) * 80, Y = 170 + Math.floor(r / 2) * 13, v = s[key], d = Math.round((v - s0[key]) * 10) / 10;
      Font.draw(x, n, X, Y, UIC.muted, UIC.textSh, 10); Font.drawR(x, (u ? (Math.round(v * 10) / 10) : v) + (u || ''), X + 52, Y, UIC.text, UIC.textSh, 10); if (d) Font.draw(x, (d > 0 ? '+' : '') + d, X + 55, Y + 1, d > 0 ? UIC.good : UIC.bad, UIC.textSh, 8); });
    Font.drawR(x, '▶加點　◀取消　B確定', 166, 239, UIC.muted, UIC.textSh, 8);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { i = (i + N - 1) % N; Sound.sfx('cursor'); } if (Input.repeat('down')) { i = (i + 1) % N; Sound.sfx('cursor'); }
    const k = ATTRS[i];
    if (k && (Input.repeat('right') || Input.pressed('a'))) { Input.consume('a'); const c = attrCost(ATTR_BASE[k] + (st.attr[k] || 0)); if (c <= attrAvail(st)) { st.attr[k] = (st.attr[k] || 0) + 1; add[k] = (add[k] || 0) + 1; Sound.sfx('statUp'); clampHP(); } else Sound.sfx('bump'); }
    if (k && Input.repeat('left')) { if (add[k] > 0) { add[k]--; st.attr[k]--; Sound.sfx('cancel'); clampHP(); } else Sound.sfx('bump'); }
    if (!k && Input.pressed('a')) { Input.consume('a');
      if (i === ATTRS.length) { if (attrAvail(st) > 0) { const b4 = { ...st.attr }; attrAuto(st); for (const q of ATTRS) { const dq = (st.attr[q] || 0) - (b4[q] || 0); if (dq) add[q] = (add[q] || 0) + dq; } Sound.sfx('statUp'); clampHP(); } else Sound.sfx('bump'); }
      else { const cost = resetCost(); if (!attrSpent(st)) { Sound.sfx('bump'); } else { UI.remove(scr); const ok = yield* yesNo('要把所有屬性點收回來重新分配嗎？' + (cost ? '\n（費用 ' + cost + ' G）' : '\n（這次免費）')); if (ok) { if (cost && st.money < cost) yield* say('錢不夠喔。'); else { st.money -= cost; st.attrFreeReset = 0; st.attr = {}; for (const q of ATTRS) delete add[q]; Sound.sfx('cancel'); clampHP(); } } UI.push(scr); } } }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr); clampHP();
}
// main menu: 11 tiles (屬性 added), drawn two lines per tile
{ const TILES = [['狀態', '能力・任務'], ['屬性', '自由加點'], ['技能', '學習・升級'], ['天賦', '被動加成'], ['背包', '道具・素材'], ['裝備', '更換・詳情'], ['圖鑑', '魔物資料'], ['紀錄', '地圖・成就'], ['存檔', '記錄進度'], ['設定', '音量・速度'], ['關閉', '回到遊戲']];
  startMenu = function* () {
    Sound.sfx('menu'); let idx = Game.menuIdx || 0;
    while (true) {
      const st = Game.st, s = heroStats();
      const hdr = { draw(x) { x.fillStyle = 'rgba(8,10,20,0.78)'; x.fillRect(0, 0, W, H); drawWin(x, 4, 4, 168, 40, 'menu'); x.drawImage(heroFramesFor(st).down[0], 0, 0, 16, 22, 10, 8, 24, 33);
        const nx = Font.draw(x, st.name, 40, 6, UIC.text, UIC.textSh); if (CLASSES[st.cls]) Font.draw(x, CLASSES[st.cls].n, nx + 4, 7, UIC.warm, UIC.textSh, 10); Font.drawR(x, 'Lv' + st.lv, 166, 6, UIC.accent, UIC.textSh);
        Font.draw(x, 'HP ' + st.hp + '/' + s.hp, 40, 22, UIC.good, UIC.textSh, 10); Font.draw(x, 'MP ' + (st.mp ?? s.mp) + '/' + s.mp, 96, 22, '#86b4ff', UIC.textSh, 10); Font.drawR(x, st.money + ' G', 166, 32, UIC.warm, UIC.textSh, 10);
        Font.draw(x, MAPS[st.map] ? MAPS[st.map].name || '' : '', 40, 32, UIC.muted, UIC.textSh, 9); } };
      UI.push(hdr);
      const items = TILES.map(([t, sub]) => ({ t: '', name: t, dot: (t === '天賦' && st.tp) || (t === '技能' && st.skp) || (t === '屬性' && attrAvail(st) > 0), sub }));
      const r = yield* choose(items, { x: 4, y: 48, w: 168, h: 204, cols: 2, colW: 82, rowH: 33, ox: 4, oy: 3, buttons: true, style: 'menu', index: Math.min(idx, items.length - 1), drawExtra: (x, m) => { for (let k = 0; k < items.length; k++) { const c = k % 2, rr = Math.floor(k / 2), X = m.x + m.ox + c * m.colW, Y = m.y + m.oy + rr * m.rowH, on = k === m.i; Font.drawC(x, items[k].name, X + 39, Y + 1, on ? UIC.text : '#c9cfe4', UIC.textSh, 12); Font.drawC(x, items[k].sub, X + 39, Y + 16, on ? UIC.accent : UIC.muted, UIC.textSh, 8); if (items[k].dot) { x.fillStyle = UIC.warm; x.fillRect(X + 70, Y + 4, 4, 4); } } } });
      UI.remove(hdr);
      const name = r >= 0 ? TILES[r][0] : '關閉'; if (name === '關閉') break; idx = r; Game.menuIdx = r;
      if (name === '狀態') yield* summaryScreen(); if (name === '屬性') yield* attrScreen(); if (name === '技能') yield* skillTreeScreen(); if (name === '天賦') yield* talentScreen();
      if (name === '背包') { yield* bagScreen('field'); if (Game.homeWarp) break; }
      if (name === '裝備') yield* equipScreen(); if (name === '圖鑑') yield* dexScreen(); if (name === '紀錄') yield* recordScreen();
      if (name === '存檔') { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } }
      if (name === '設定') yield* optionsScreen();
    }
    if (Game.homeWarp && Game.ow) { Game.homeWarp = 0; yield* Game.ow.homeWarp(); }
  };
}

/* ---------- RPG-style skill numbers: 物攻×% / 魔攻×%, one scaling attribute per damage skill ---------- */
const SKILL_SCALE = {
  gale: ['agi', 1.5], doubleSlash: ['agi', 1], whirlSlash: ['agi', 1], twinStrike: ['agi', 1], flurry: ['agi', 1], bladeDance: ['agi', 1], quickDraw: ['dex', 1.5],
  powerSlash: ['str', 1], crossSlash: ['str', 1], zantetsu: ['str', 1.5], recklessSlash: ['str', 1.5], bladeStorm: ['str', 1], armorBreak: ['str', 1], dawnBreak: ['str', 1], riftBlade: ['str', 1],
  iaiSlash: ['dex', 1.5], venomFang: ['dex', 1], toxicBlade: ['dex', 1], lacerate: ['dex', 1], shadowStab: ['luk', 1.5], deathMark: ['luk', 1.5],
  guardStrike: ['vit', 1], shieldBash: ['vit', 1.5], heroSoul: ['int', 1], eclipseSlash: ['int', 1], arcaneEdge: ['int', 1],
};
for (const k of ['magicBolt', 'fireBolt', 'manaBurst', 'aquaBlade', 'thunder', 'leafStorm', 'flameWave', 'aquaBurst', 'chainBolt', 'inferno', 'meteor', 'thunderstorm', 'skyJudge', 'holyLight']) SKILL_SCALE[k] = ['int', 1];
for (const k in SKILL_SCALE) if (MOVES[k]) MOVES[k].scale = SKILL_SCALE[k];
const ATTR_SCALE_FROM = 10;
const powTxt = mv => mv && mv.pow ? (mv.cat === '特' ? '魔攻' : '物攻') + '×' + Math.round(mv.pow / MOVES.attack.pow * 100) + '%' + (mv.hits ? '×' + mv.hits + '段' : '') : '';
const scaleTxt = mv => mv && mv.scale ? ATTR_NAMES[mv.scale[0]] + '加成' : '';
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) {
    const r = _cd.call(this, u, t, mv); if (!u || !u.hero || !mv || !mv.pow || !mv.scale) return r;
    const a = heroAttr(Game.st)[mv.scale[0]] || 0, m = 1 + Math.max(0, a - ATTR_SCALE_FROM) * mv.scale[1] / 100;
    if (m > 1) r.dmg = Math.max(1, Math.floor(r.dmg * m)); return r;
  };
}
// a steady damage preview for the skill pop-up (no random spread, no crit, weakness only once it's revealed)
Battle.prototype.estimateDamage = function (id) {
  const mv = id === 'attack' ? MOVES.attack : skillMove(id); if (!mv || !mv.pow) return 0;
  const R = Math.random, hit = this._lastHit; Math.random = () => 0.5; this._estimating = true; let d = 0;
  try { const r = this.calcDamage(this.H, this.F, this.H.stats.welem && mv.t === '一般' ? { ...mv, t: this.H.stats.welem } : mv); d = r.dmg; if (r.mult !== 1 && !(this.tac && this.tac.rev)) d = Math.round(d / r.mult); } finally { Math.random = R; this._estimating = false; this._lastHit = hit; }
  return d * (mv.hits || 1);
};
