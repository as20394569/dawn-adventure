/* ===================== v19 REPLAY: difficulty, New Game+ (二周目), titles, bestiary milestones, new achievements ===================== */
// ---- titles: earned from milestones, one can be worn for a small bonus; they carry over into New Game+ ----
const TITLES = [
  { id: 'hunter', n: '魔物獵人', d: '圖鑑收集率達到50%。', st: { atk: 2 }, ok: st => dexPct(st) >= 0.5 },
  { id: 'scholar', n: '魔物學者', d: '圖鑑收集率達到100%。', st: { atk: 2, spa: 2, hp: 5 }, ok: st => dexPct(st) >= 1 },
  { id: 'breaker', n: '破防者', d: '累計讓魔物破防30次。', st: { crit: 3 }, ok: st => (st.brkCount || 0) >= 30 },
  { id: 'riftwalker', n: '迴廊行者', d: '在異界迴廊到達第10層。', st: { spe: 3 }, ok: st => st.rift && st.rift.best >= 10 },
  { id: 'gatebreaker', n: '門的彼方', d: '踏破異界迴廊。', st: { hp: 10, elem: 5 }, ok: st => st.flags.riftClear || (st.titlesKept || {}).gatebreaker },
  { id: 'lakefriend', n: '湖之友', d: '打倒銀鱗水龍。', st: { spd: 4 }, ok: st => st.flags.wyrm },
  { id: 'rainbow', n: '虹色傳說', d: '得到一件虹色裝備。', st: { elem: 5, crit: 2 }, ok: st => (st.gear || []).some(g => g.q >= 5) },
  { id: 'again', n: '第二次的旅人', d: '開始二周目。', st: { hp: 8, def: 1 }, ok: st => (st.ng || 0) >= 1 },
  { id: 'hard', n: '不退轉', d: '以「困難」以上的難度打倒古岩魔像。', st: { atk: 1, def: 1, spa: 1 }, ok: st => (st.diff || 0) >= 1 && st.flags.golem || (st.titlesKept || {}).hard },
];
const dexPct = st => { const K = Object.keys(SPECIES); return K.filter(k => st.dex && st.dex[k] && st.dex[k].seen).length / K.length; };
const titleOk = (id, st = Game.st) => { const T = TITLES.find(t => t.id === id); return T && (T.ok(st) || (st.titlesKept || {})[id]); };
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); const T = st && st.title && titleOk(st.title, st) && TITLES.find(t => t.id === st.title); if (T) for (const k in T.st) s[k] = (s[k] || 0) + T.st[k]; return s; }; }
function* titleScreen() {
  const st = Game.st; let idx = 0;
  while (true) {
    const items = TITLES.map(T => { const on = titleOk(T.id), eq = st.title === T.id; return { t: (eq ? '★' : '') + (on ? T.n : '？？？'), col: on ? (eq ? UIC.warm : UIC.text) : UIC.dis }; });
    const info = { draw(x) { const T = TITLES[idx]; drawWin(x, 4, 172, 168, 80, 'menu'); if (!T) return; const on = titleOk(T.id); Font.draw(x, on ? T.n : '？？？', 12, 175, on ? UIC.warm : UIC.dis, UIC.textSh);
      Font.draw(x, '條件：' + T.d, 12, 192, UIC.text, UIC.textSh, 10); Font.draw(x, '效果：' + Object.entries(T.st).map(([k, v]) => (STAT_NAMES[k] || { crit: '會心', elem: '屬性傷害' }[k] || k) + '+' + v + (['crit', 'elem'].includes(k) ? '%' : '')).join('、'), 12, 207, UIC.accent, UIC.textSh, 10);
      Font.draw(x, '裝備一個稱號就能得到效果。二周目也會保留。', 12, 226, UIC.muted, UIC.textSh, 9); } };
    UI.push(info); const r = yield* choose(items, { x: 4, y: 4, w: 168, h: 164, index: idx, onMove: i => idx = i }); UI.remove(info);
    if (r < 0) return; idx = r; const T = TITLES[r];
    if (!titleOk(T.id)) { yield* say('還沒有取得這個稱號。'); continue; }
    st.title = st.title === T.id ? null : T.id; Sound.sfx('select');
  }
}
{ const _rs = recordScreen; recordScreen = function* () { const r = yield* ask('要看什麼？', ['地圖・成就', '稱號']); if (r === 0) yield* _rs(); else if (r === 1) yield* titleScreen(); }; }

// ---- new achievements ----
ACHIEVEMENTS.find(a => a.id === 'gold').ok = st => (st.gear || []).some(g => g.q >= 4);
ACHIEVEMENTS.push(
  { id: 'lake', n: '湖之主', d: '打倒銀鱗水龍。', ok: st => st.flags.wyrm },
  { id: 'spellblade', n: '魔劍之道', d: '繼承魔劍士的道路。', ok: st => st.flags.spellbladeOk },
  { id: 'rift10', n: '迴廊的深處', d: '在異界迴廊到達第10層。', ok: st => st.rift && st.rift.best >= 10 },
  { id: 'riftClear', n: '門的彼方', d: '踏破異界迴廊（第20層）。', ok: st => st.flags.riftClear },
  { id: 'break30', n: '破防達人', d: '累計讓魔物破防30次。', ok: st => (st.brkCount || 0) >= 30 },
  { id: 'rainbow', n: '虹色傳說', d: '得到一件虹色品質的裝備。', ok: st => (st.gear || []).some(g => g.q >= 5) },
  { id: 'ng', n: '第二次的旅人', d: '開始二周目。', ok: st => (st.ng || 0) >= 1 },
  { id: 'rematch', n: '宿敵', d: '再戰並打倒同一隻頭目3次。', ok: st => Object.values(st.kills || {}).some(n => n >= 3) },
);
Object.assign(ACH_CATS, {}); for (const [id, c] of [['lake', '戰鬥'], ['spellblade', '成長'], ['rift10', '探索'], ['riftClear', '探索'], ['break30', '戰鬥'], ['rainbow', '收集'], ['ng', '故事'], ['rematch', '戰鬥']]) { const a = ACHIEVEMENTS.find(x => x.id === id); if (a) a.cat = c; }

// ---- break counter + bestiary milestones (after each victory) ----
const DEX_RW = [[0.25, { elixir: 1 }], [0.5, { tpBook: 1 }], [0.75, { powerFruit: 1, wisdomFruit: 1 }], [1, { tpBook: 2, luckClover: 2 }]];
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () {
    yield* _v.call(this); const st = Game.st, p = dexPct(st); st.dexRw = st.dexRw || {};
    for (const [t, items] of DEX_RW) if (p >= t && !st.dexRw[t]) { st.dexRw[t] = 1; for (const k in items) st.bag[k] = (st.bag[k] || 0) + items[k]; Sound.jingle('item'); yield* this.msg('圖鑑收集率達到' + Math.round(t * 100) + '%！得到了' + Object.entries(items).map(([k, n]) => ITEMS[k].n + (n > 1 ? '×' + n : '')).join('、') + '！', { wait: true }); }
  };
}

// ---- difficulty at a new game, New Game+ from a cleared save ----
Game.pendingNew = null;
{ const _ng = newGameState; newGameState = function (name) {
    const st = _ng(name), P = Game.pendingNew; if (!P) return st; Game.pendingNew = null;
    st.diff = P.diff || 0;
    if (P.carry) { const C = P.carry; st.ng = (C.ng || 0) + 1; st.lv = Math.max(5, Math.floor(C.lv / 2)); st.exp = expForLevel(st.lv); for (const g of C.gear || []) { g.u = ++st.gid; st.gear.push(g); } st.money = Math.floor((C.money || 0) / 2) + 1000;
      st.dex = C.dex || {}; st.boost = C.boost || {}; st.title = C.title || null; st.titlesKept = Object.fromEntries(TITLES.filter(t => t.ok(C) || (C.titlesKept || {})[t.id]).map(t => [t.id, 1]));
      for (const k of ['hiddenCls', 'spellbladeOk']) if (C.flags && C.flags[k]) st.flags[k] = 1;
      st.rift = { best: (C.rift && C.rift.best) || 0, cp: 0, run: 0, floor: 0 }; st.brkCount = C.brkCount || 0; st.ngSkp = 2 * (st.lv - 1); st.tp = Math.max(0, st.lv - 5);
      for (const k of ['elixir', 'tpBook', 'powerFruit', 'wisdomFruit', 'luckClover', 'riftShard', 'moonDew', 'crystal']) if (C.bag && C.bag[k]) st.bag[k] = C.bag[k];
      st.hp = heroStats(st).hp; }
    return st;
  };
  // New Game+ keeps the gear you had; the class ceremony still gives the starting kit, and refunds the carried skill points
  const _asc = applyStartClass; applyStartClass = function (k) { const st = Game.st, keep = st.ng ? { ...st.equip } : null; _asc(k); if (st.ngSkp) { st.skp = (st.skp || 0) + st.ngSkp; st.ngSkp = 0; } if (keep) { /* start with the new class kit equipped; carried gear stays in the bag */ } };
}
TitleScene.prototype.menu = function* () {
  while (true) {
    const save = this.hasSave ? loadGame() : null, canNG = false; // v12.0.1: 二周目 closed while the story is still being written
    const opts = this.hasSave ? ['繼續冒險', '新的冒險'] : ['新的冒險']; if (canNG) opts.push('二周目'); opts.push('設定');
    const r = yield* choose(opts, { x: 38, y: 168, w: 100, cancel: true });
    if (r < 0) { this.stage = 'press'; return; }
    const o = opts[r];
    if (o === '設定') { yield* optionsScreen(); continue; }
    if (o === '繼續冒險') { Game.st = loadGame(); yield* fadeOut(20); startOverworld(); Game.sys.push(fadeIn(20)); return; }
    if (o === '新的冒險' || o === '二周目') {
      if (o === '新的冒險' && this.hasSave) { const ok = yield* yesNo('開始新的冒險後，舊的記錄會在下次存檔時被覆蓋。確定嗎？'); if (!ok) continue; }
      if (o === '二周目') { yield* say('二周目：帶著一半的等級、全部裝備、一半的金錢、圖鑑和稱號重新開始。\n魔物會+' + NG_LV + '級、HP+25%。可以重新選擇職業。'); if (!(yield* yesNo('要開始二周目嗎？'))) continue; }
      const dr = 2; // v10: 異界 is the only difficulty
      Game.pendingNew = { diff: dr, carry: o === '二周目' ? save : null };
      yield* fadeOut(24); Game.setScene(new IntroScene()); return;
    }
  }
};
