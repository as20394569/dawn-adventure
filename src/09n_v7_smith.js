/* ===================== v7.0 ③ the blacksmith makes every piece of gear =====================
   Request: "shops, the smith and gear found on the road → everything is forged by the smith, so the smith matters".
   · Shops no longer sell gear (the capital armorer sells 設計圖 instead).
   · Gear found on the road, quest gear and monster drops become 設計圖 (blueprints). A blueprint you already know turns into
     materials; what used to be a 紅／金 reward also gives an 打造券 (next craft of it is free, quality guaranteed).
   · The smith knows ordinary designs by itself (more as you level up); rare / boss gear needs its blueprint.
   · Forging: random quality; 精心打造 (materials ×2) and 極致打造 (×3) raise the odds. 重鑄: affixes (as before) or quality (never down).
   · Field monsters drop more materials; elites / bosses drop a pile of their materials. */
const TIER_POOL = { 1: ['stone', 'gel', 'feather', 'shroomCap'], 2: ['foxfire', 'stinger', 'frogSkin', 'spore', 'leaf', 'beetleShell'], 3: ['crystal', 'emberCore', 'boneShard', 'ectoplasm', 'silk'],
  4: ['moonDew', 'lizardScale', 'mothDust', 'scorpTail', 'harpyFeather', 'sandCrystal', 'bogMoss'], 5: ['wolfPelt', 'beetleHorn', 'rustScrap', 'crocHide', 'boarTusk', 'wispFlame', 'rotWood', 'batWing'],
  6: ['spring', 'brassGear', 'snowPelt', 'iceCrystal', 'salamanderScale', 'magmaStone', 'windStone'], 7: ['shadowCloth', 'voidShard', 'starDust', 'starShard'] };
const ELEM_MAT = { 火: { 2: 'foxfire', 3: 'emberCore', 6: 'magmaStone' }, 水: { 3: 'crystal', 4: 'moonDew', 6: 'iceCrystal' }, 草: { 2: 'leaf', 4: 'bogMoss' }, 雷: { 6: 'spring' } };
for (const t in TIER_POOL) TIER_POOL[t] = TIER_POOL[t].filter(k => ITEMS[k]);
const bpGold = t => 120 * t * t + 100;
const hashK = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const GEAR_RECIPE = {};
{ const all = [...RECIPES, ...(typeof RECIPES_V20 !== 'undefined' ? RECIPES_V20 : []), ...(typeof RECIPES_CH2 !== 'undefined' ? RECIPES_CH2 : [])].filter(R => GEAR[R.out]);
  for (const R of all) if (!GEAR_RECIPE[R.out]) GEAR_RECIPE[R.out] = { mats: { ...R.mats }, gold: R.gold || bpGold(GEAR[R.out].t) };
  for (const k in GEAR) { if (GEAR_RECIPE[k]) continue; const B = GEAR[k], t = clamp(B.t || 1, 1, 7), h = hashK(k), P = TIER_POOL[t], P2 = TIER_POOL[Math.max(1, t - 1)];
    let a = (B.elem && ELEM_MAT[B.elem] && ELEM_MAT[B.elem][t]) || P[h % P.length], b = P2[(h >> 5) % P2.length]; if (b === a) b = P2[(h >> 9) % P2.length] === a ? P[(h >> 3) % P.length] : P2[(h >> 9) % P2.length];
    const m = {}; m[a] = 2 + Math.floor(t / 2); if (b && b !== a) m[b] = 1 + Math.floor(t / 3); GEAR_RECIPE[k] = { mats: m, gold: Math.round(bpGold(t) * (B.slot === 'weapon' ? 1.2 : B.slot === 'acc' ? 0.9 : 1) / 10) * 10 }; }
}
// rare designs: need a blueprint (boss / elite loot, pickups, quest rewards, the rift, the royal armory); story sets unlock by themselves
const BP_RARE = new Set(['guardHelm', 'hunterOath', 'masterBlade', 'moonCharm', 'witchTome', 'sandSaber', 'merchantBadge', 'mimicTooth', 'royalBadge', 'ancientWatch', 'dawnSword', ...TOWER_LOOT]);
for (const k in LOOT) for (const g of LOOT[k]) BP_RARE.add(g);
for (const k in SPECIES) if (SPECIES[k].drop && GEAR[SPECIES[k].drop]) BP_RARE.add(SPECIES[k].drop);
for (const m in MAPS) for (const it of MAPS[m].items || []) if (it.item && GEAR[it.item]) BP_RARE.add(it.item);
for (const k of armoryStock({ flags: { colossus: 1, frostQueen: 1, lavaGiant: 1 } })) BP_RARE.add(k);
const BP_STORY = [[st => (st.flags.qHorn || 0) >= 2, new Set((typeof RECIPES_V20 !== 'undefined' ? RECIPES_V20 : []).map(R => R.out))], [st => ch2(st) >= 2, new Set((typeof RECIPES_CH2 !== 'undefined' ? RECIPES_CH2 : []).map(R => R.out))]];
for (const [, S] of BP_STORY) for (const k of S) BP_RARE.delete(k);
for (const k of ['uniform', 'schoolShoes']) BP_RARE.add(k);
const smithRank = (st = Game.st) => Math.min(7, 2 + Math.floor(Math.max(0, (st.lv || 1) - 4) / 6));
function bpKnown(k, st = Game.st) {
  if (!GEAR[k] || !GEAR_RECIPE[k]) return false; if (st.bp && st.bp[k]) return true;
  for (const [f, S] of BP_STORY) if (S.has(k)) return f(st) && GEAR[k].t <= smithRank(st) + 1;
  return !BP_RARE.has(k) && GEAR[k].t <= smithRank(st);
}
const qName = q => (GQ[q] || GQ[1])[0];
// learn a blueprint (+ a ticket for 紅 and better); returns the text of what was gained
// v25 tickets stack: st.bpN[k] = qualities of every ticket held; st.bpT[k] = the best one (what the screens show)
function tkList(k, st = Game.st) { const N = st.bpN || (st.bpN = {}); if (!N[k]) N[k] = st.bpT && st.bpT[k] ? [st.bpT[k]] : []; return N[k]; }
const tkCount = (k, st = Game.st) => tkList(k, st).length;
function tkSync(k, st = Game.st) { const L = tkList(k, st), T = st.bpT || (st.bpT = {}); if (L.length) T[k] = Math.max(...L); else { delete T[k]; delete st.bpN[k]; } }
function tkUse(k, st = Game.st) { const L = tkList(k, st); if (!L.length) return 0; const q = Math.max(...L); L.splice(L.indexOf(q), 1); tkSync(k, st); return q; }
function gainBP(k, q = 1, st = Game.st, tMin = 3) {
  const had = bpKnown(k, st); (st.bp || (st.bp = {}))[k] = 1; let txt = '「' + GEAR[k].n + '」的設計圖';
  if (q >= tMin) { tkList(k, st).push(q); tkSync(k, st); txt += (had ? '的' : '和') + '打造券（品質保底：' + qName(q) + '）'; if (had) txt = '「' + GEAR[k].n + '」的打造券（品質保底：' + qName(q) + '）'; }
  else if (had) { const mats = bpMats(GEAR[k].t, 1 + q); txt = matsText(mats) + '（設計圖已經學會了）'; }
  return txt;
}
function bpMats(t, n, st = Game.st) { const P = TIER_POOL[clamp(t, 1, 7)], got = {}; for (let i = 0; i < n; i++) { const k = pick(P); got[k] = (got[k] || 0) + 1; st.bag[k] = (st.bag[k] || 0) + 1; } return got; }
const matsText = got => Object.entries(got).map(([k, v]) => ITEMS[k].n + '×' + v).join('、');
function bpTut() { const st = Game.st; if (st.flags.bpTut) return null; st.flags.bpTut = 1; return '（設計圖拿去給鐵匠，就能打造那件裝備。武器店不再賣裝備了！）'; }

/* ---------- drops: every gear drop becomes a blueprint / ticket / materials ---------- */
{ const _ls = Battle.prototype.lootShow; Battle.prototype.lootShow = function* (g, head) {
    const st = Game.st; if (Game.smith11 || !g || !GEAR[g.b]) return yield* _ls.call(this, g, head); // v12.0.9w: drops are base gear now
    const tMin = g._first ? 1 : this.F && this.F.boss ? 2 : 3; // v26: bosses give a ticket from 紫, everything else from 紅; the card always shows what you really get
    st.gear = (st.gear || []).filter(x => x !== g); const k = g.b, q = g.q || 1, known = bpKnown(k, st);
    if (known && q < tMin) { const got = recipeMats(k, 1 + q); Sound.sfx('item'); yield* this.msg((this.F ? this.F.n + '掉落了' : '得到了') + '「' + GEAR[k].n + '」的素材：' + matsText(got) + '！（設計圖已經學會了）', { hold: 40 }); return; }
    const txt = gainBP(k, q, st, tMin), card = { b: k, q: Math.max(1, q), r: 1, a: [], _bp: q >= tMin ? 1 : 2 };
    yield* _ls.call(this, card, known ? '獲得了打造券（保底' + qName(q) + '）！' : q >= tMin ? '獲得了設計圖＋打造券（保底' + qName(q) + '）！' : '獲得了設計圖！');
    yield* this.msg('得到了' + txt + '！', { hold: 30 }); const tut = bpTut(); if (tut) yield* this.msg(tut, { wait: true });
  };
}
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () {
    const r = yield* _v.call(this), st = Game.st, F = this.F, sp = SPECIES[F.sp] || {};
    if (!F.elite && !F.boss && sp.mat && chance(0.35)) { st.bag[sp.mat] = (st.bag[sp.mat] || 0) + 1; yield* this.msg('又撿到了素材「' + ITEMS[sp.mat].n + '」！', { hold: 24 }); }
    if ((F.elite || F.boss) && !this.cfg.noMats) { const n = F.boss ? 3 : 2, got = {}, sig = sp.mat && ITEMS[sp.mat] ? sp.mat : null; if (sig) { got[sig] = n; st.bag[sig] = (st.bag[sig] || 0) + n; } const ex = areaMats(Game.ow && Game.ow.map && Game.ow.map.id, n, F.lv); for (const k in ex) got[k] = (got[k] || 0) + ex[k];
      Sound.sfx('item'); yield* this.msg((F.boss ? '頭目' : '菁英') + '留下了素材：' + matsText(got) + '！', { hold: 36 }); }
    return r;
  };
}
// pickups on the road
{ const _pi = Overworld.prototype.pickItem; Overworld.prototype.pickItem = function* (it) {
    if (Game.smith11 || !it || it.gather || it.gold || !GEAR[it.item]) return yield* _pi.call(this, it);
    const st = this.st; this.items = this.items.filter(i => i !== it); st.flags[it.id] = 1;
    const txt = gainBP(it.item, it.q || 1, st); Sound.jingle('item'); yield* say(st.name + '撿到了' + txt + '！'); const tut = bpTut(); if (tut) yield* say(tut);
  };
}
// shops: no gear
{ const _sb = shopBuy; shopBuy = function* (stock) { return yield* _sb((stock || shopList()).filter(k => !GEAR[k] || GEAR[k].slot === 'shield')); }; } // v10.5: the two cheapest shields are sold in shops
function* bpShop(list, title = '設計圖') {
  const st = Game.st; let idx = 0;
  while (true) {
    const L = list.filter(k => GEAR[k]), price = k => Math.round((GEAR[k].price || GEAR[k].t * 900) * 0.45 / 10) * 10;
    const items = L.map(k => ({ t: GEAR[k].n, r: bpKnown(k) ? '已學會' : price(k) + 'G', col: bpKnown(k) ? UIC.dis : st.money < price(k) ? UIC.bad : undefined })); if (!items.length) { yield* say('今天沒有可以賣的設計圖。'); return; }
    const mw = { draw: moneyWin }; UI.push(mw);
    const r = yield* choose(items, { x: 8, y: 40, w: 160, h: 18 + Math.min(8, items.length) * 14 + 4, rowH: 14, fs: 10, ox: 12, oy: 17, visible: Math.min(8, items.length), title, index: idx });
    UI.remove(mw); if (r < 0) return; idx = r; const k = L[r];
    if (bpKnown(k)) { yield* say('這張設計圖已經學會了。拿去給鐵匠就能打造。'); continue; }
    if (st.money < price(k)) { yield* say('錢不夠喔。'); continue; }
    if (!(yield* yesNo('要用' + price(k) + ' G買下「' + GEAR[k].n + '」的設計圖嗎？'))) continue;
    st.money -= price(k); gainBP(k, 1); Sound.jingle('item'); yield* say('學會了「' + GEAR[k].n + '」的設計圖！去找鐵匠打造吧。');
  }
}
Events.armorer = function* () { yield* say('王國的裝備現在都交給鐵匠打造了。我這裡改賣騎士團裝備的「設計圖」。'); yield* bpShop(armoryStock(Game.st), '騎士團設計圖'); };

/* ---------- forging ---------- */
const BP_ODDS = [[55, 33, 10, 2, 0], [25, 42, 25, 8, 0], [5, 35, 40, 17, 3]], BP_LV = ['普通打造', '精心打造', '極致打造'];
function bpOdds(lv) { const o = BP_ODDS[lv].slice(), d = (typeof ngOf === 'function' && ngOf() ? 1 : 0); if (d > 0) { const m = Math.min(o[0] + o[1] - 10, d * 4); o[3] += m; if (o[0] >= m) o[0] -= m; else { o[1] -= m - o[0]; o[0] = 0; } } return o; }
function bpRoll(lv) { const o = bpOdds(lv); let r = Math.random() * 100; for (let q = 0; q < 5; q++) { r -= o[q]; if (r < 0) return q + 1; } return 1; }
const bpCost = (k, lv) => { const R = GEAR_RECIPE[k], m = {}; for (const i in R.mats) m[i] = R.mats[i] * (lv + 1); return { mats: m, gold: R.gold }; };
const bpCan = (k, lv, st = Game.st) => { const c = bpCost(k, lv); return st.money >= c.gold && Object.entries(c.mats).every(([i, n]) => (st.bag[i] || 0) >= n); };
const BP_TABS = ['武器', '防具', '飾品', '道具'], bpTabOf = k => GEAR[k].slot === 'weapon' ? 0 : GEAR[k].slot === 'acc' ? 2 : 1;
function bpList(tab, st = Game.st) {
  if (tab === 3) return RECIPES.filter(R => !GEAR[R.out]).map(R => ({ R }));
  const can = k => (st.bpT && st.bpT[k]) || bpCan(k, 0, st) ? 1 : 0; // v8.0.1: what you can forge right now comes first
  return Object.keys(GEAR_RECIPE).filter(k => bpTabOf(k) === tab && bpKnown(k, st)).sort((a, b) => (st.bpT && st.bpT[b] ? 1 : 0) - (st.bpT && st.bpT[a] ? 1 : 0) || can(b) - can(a) || GEAR[b].t - GEAR[a].t || (WKIND_ORDER.indexOf(GEAR[a].kind) - WKIND_ORDER.indexOf(GEAR[b].kind)) || (a < b ? -1 : 1)).map(k => ({ k }));
}
function* craftScreen() {
  const st = Game.st; let tab = 0, idx = 0; const have = k => st.bag[k] || 0, VIS = 7;
  const canR = R => Object.entries(R.mats).every(([k, n]) => have(k) >= n) && st.money >= (R.gold || 0) && !(ITEMS[R.out] && ITEMS[R.out].once && have(R.out));
  const ok = e => e.R ? canR(e.R) : (st.bpT && st.bpT[e.k]) || bpCan(e.k, 0);
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '鐵匠工房'); Font.drawR(x, st.money + ' G', W - 6, 2, UIC.warm, UIC.textSh);
    BP_TABS.forEach((n, i) => { const X = 4 + i * 42; drawBtn(x, X, 21, 40, 14, i === tab); Font.drawC(x, n, X + 20, 21, i === tab ? UIC.warm : UIC.muted, UIC.textSh, 9); if (typeof touchRegion === 'function') touchRegion(X, 21, 40, 14, () => { tab = i; idx = 0; Sound.sfx('cursor'); }); });
    const L = bpList(tab); if (idx >= L.length) idx = Math.max(0, L.length - 1); const T = clamp(idx - 3, 0, Math.max(0, L.length - VIS));
    drawWin(x, 4, 37, 168, VIS * 16 + 8, 'menu'); if (!L.length) Font.draw(x, '（還沒有設計圖）', 14, 43, UIC.muted, UIC.textSh, 10);
    L.slice(T, T + VIS).forEach((e, i) => { const Y = 41 + i * 16, on = T + i === idx; if (on) selBar(x, 6, Y - 1, 164, 15);
      const nm = e.R ? (ITEMS[e.R.out] || GEAR[e.R.out]).n + (e.R.n > 1 ? '×' + e.R.n : '') : GEAR[e.k].n; let z = 11; while (z > 8 && Font.width(nm, z) > 96) z--;
      Font.draw(x, nm, 14, Y, ok(e) ? UIC.text : UIC.dis, UIC.textSh, z);
      const tag = e.R ? (canR(e.R) ? '可製作' : '素材不足') : (st.bpT && st.bpT[e.k] ? (tkCount(e.k) > 1 ? '券×' + tkCount(e.k) + ' ' : '券') : '') + (GEAR[e.k].kind && tab === 0 ? GEAR[e.k].kind : ''); // v12.0.9m: the tier now follows the name (「T5」)
      Font.drawR(x, tag, 164, Y + 1, e.R ? (canR(e.R) ? UIC.accent : UIC.dis) : st.bpT && st.bpT[e.k] ? UIC.warm : UIC.muted, UIC.textSh, 9);
      if (typeof touchRegion === 'function') touchRegion(6, Y - 1, 164, 15, () => { if (idx === T + i) tapKey('a'); else { idx = T + i; Sound.sfx('cursor'); } }); });
    if (T > 0) x.drawImage(UPARROW, 86, 38); if (T + VIS < L.length) x.drawImage(DOWNARROW, 86, 37 + VIS * 16 + 3);
    const e = L[idx], Y0 = 37 + VIS * 16 + 10; drawWin(x, 4, Y0, 168, H - Y0 - 4, 'menu'); if (!e) return; let y = Y0 + 3;
    if (e.R) { const it = ITEMS[e.R.out]; drawFitText(x, it.d || '', 10, y, 152, 24, 10); y += 26; }
    else { const B = GEAR[e.k], g0 = { b: e.k, q: 1, r: 1, a: [] }; drawFitText(x, gearLines(g0)[0] || B.d || '', 10, y, 152, 22, 10, GQ[1][1]); y += 23;
      if (WSK[e.k]) { const S = WSK[e.k]; const sk = typeof weaponSkill12 === 'function' && weaponSkill12(e.k); drawFitText(x, '特技：' + S.s.n + (sk && DEF.skills[sk] ? '　技能：' + DEF.skills[sk].name : ''), 10, y, 152, 11, 9, UIC.accent); y += 12; } }
    const mats = e.R ? e.R.mats : GEAR_RECIPE[e.k].mats, gold = e.R ? e.R.gold || 0 : GEAR_RECIPE[e.k].gold;
    Font.draw(x, e.R ? '需要的素材' : '需要的素材（普通打造）', 10, y, UIC.muted, UIC.textSh, 9); if (gold) Font.drawR(x, gold + ' G', 164, y, st.money >= gold ? UIC.warm : UIC.bad, UIC.textSh, 9); y += 11;
    for (const [k, n] of Object.entries(mats)) { let z = 10; while (z > 8 && Font.width('・' + ITEMS[k].n, z) > 110) z--; const ex = Font.draw(x, '・' + ITEMS[k].n, 12, y, UIC.text, UIC.textSh, z); if (have(k) < n && typeof matSrc === 'function') { const src = matSrc(k); if (src) Font.draw(x, '（' + src + '）', ex + 1, y + 1, UIC.muted, UIC.textSh, 8); } Font.drawR(x, have(k) + ' / ' + n, 164, y, have(k) >= n ? UIC.good : UIC.bad, UIC.textSh, 10); y += 11; }
    if (!e.R && st.bpT && st.bpT[e.k]) Font.draw(x, '持有打造券' + (tkCount(e.k) > 1 ? '×' + tkCount(e.k) : '') + '：免費打造，品質保底' + qName(st.bpT[e.k]), 10, y + 1, UIC.warm, UIC.textSh, 9);
  }, touchBack: true };
  UI.push(scr);
  while (true) {
    const L = bpList(tab);
    if (Input.repeat('left') || Input.repeat('right')) { tab = (tab + (Input.repeat('left') ? 3 : 1)) % 4; idx = 0; Sound.sfx('cursor'); }
    if (Input.repeat('up') && L.length) { idx = (idx + L.length - 1) % L.length; Sound.sfx('cursor'); } if (Input.repeat('down') && L.length) { idx = (idx + 1) % L.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a') && L[idx]) { Input.consume('a'); const e = L[idx]; UI.remove(scr);
      if (e.R) { if (!canR(e.R)) Sound.sfx('bump'); else { for (const [k, n] of Object.entries(e.R.mats)) st.bag[k] -= n; st.money -= e.R.gold || 0; st.bag[e.R.out] = (st.bag[e.R.out] || 0) + (e.R.n || 1); yield* itemGet('鐵匠做好了' + ITEMS[e.R.out].n + '！'); } }
      else yield* forgeFlow(e.k);
      UI.push(scr); }
    yield;
  }
  UI.remove(scr);
}
function* forgeFlow(k) {
  const st = Game.st, B = GEAR[k], tk = tkList(k, st).length ? Math.max(...tkList(k, st)) : 0, tn = tkCount(k, st);
  if (tk) { // v25: with a ticket the smith always uses it — free, quality at least the ticket's
    const r = yield* ask('要用打造券打造「' + B.n + '」嗎？\n（免費・品質保底「' + qName(tk) + '」' + (tn > 1 ? '・共有' + tn + '張' : '') + '）', ['使用打造券', '取消']); if (r !== 0) return;
    const q = Math.max(tkUse(k, st), bpRoll(0)); // v12.0.9s: the ticket only guarantees its own quality; the rest rolls like an ordinary craft (was the ×3-materials odds) Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); const g = makeGear(k, q); Sound.jingle(q >= 3 ? 'levelup' : 'item');
    yield* itemGet('鐵匠打造了' + gearName(g) + '！'); // the 【品質】 tag in front already says it return;
  }
  const oddsT = lv => bpOdds(lv).map((p, q) => p && q >= 2 ? qName(q + 1) + p : '').filter(Boolean).join(' ');
  const opts = [], acts = [];
  for (let lv = 0; lv < 3; lv++) { opts.push(BP_LV[lv].slice(0, 2) + '×' + (lv + 1) + ' ' + oddsT(lv) + (bpCan(k, lv) ? '' : '✕')); acts.push(lv); }
  opts.push('取消'); acts.push(null);
  const r = yield* ask('要怎麼打造「' + B.n + '」？\n素材投入越多，紅金的機率（%）越高。', opts); const lv = acts[r];
  if (lv === null || lv === undefined || r < 0) return;
  let q;
  { if (!bpCan(k, lv)) { Sound.sfx('bump'); yield* say(missingText(bpCost(k, lv))); return; } const c = bpCost(k, lv); st.money -= c.gold; for (const i in c.mats) st.bag[i] -= c.mats[i]; q = bpRoll(lv); }
  Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); const g = makeGear(k, q); Sound.jingle(q >= 3 ? 'levelup' : 'item');
  yield* itemGet('鐵匠打造了' + gearName(g) + '！'); // the 【品質】 tag in front already says it
  if (B.slot === 'weapon' && WSK[k] && !st.flags.wsTut) { st.flags.wsTut = 1; yield* say('每把武器都有自己的「特技」，普通攻擊累積到一定層數就會自動發動。\n每把武器也帶著一個技能：裝備就能用，用熟了就會永久學會。'); }
}
// 重鑄: affixes (the old flow) or quality (pay the recipe ×2 again; the quality never goes down)
{ const _rf = reforgeFlow; reforgeFlow = function* () {
    const r = yield* ask('要重鑄什麼？', ['詞綴重鑄（重新隨機詞綴）', '品質重鑄（品質只升不降）', '取消']); if (r === 0) return yield* _rf(); if (r !== 1) return;
    const st = Game.st, have = k => st.bag[k] || 0;
    while (true) {
      const g = yield* gearPicker('品質重鑄', () => gearSort().filter(q => q.q < 5 && GEAR_RECIPE[q.b]), (x, g, Y) => { const c = bpCost(g.b, 1); Font.draw(x, qName(g.q) + ' → ？（提升機率' + bpOdds(2).slice(g.q).reduce((a, b) => a + b, 0) + '%）', 12, Y, UIC.accent, UIC.textSh, 10); Font.draw(x, Object.entries(c.mats).map(([k, n]) => ITEMS[k].n + '×' + n + '（有' + have(k) + '）').join(' '), 12, Y + 13, UIC.text, UIC.textSh, 9); Font.drawR(x, c.gold + ' G', 164, Y + 26, st.money >= c.gold ? UIC.warm : UIC.bad, UIC.textSh, 10); });
      if (!g) return; if (!bpCan(g.b, 1)) { yield* say('素材或金錢不夠喔。'); continue; }
      if (!(yield* yesNo('要重鑄' + gearShort(g) + '的品質嗎？\n（失敗時品質不變，素材會用掉）'))) continue;
      const c = bpCost(g.b, 1); st.money -= c.gold; for (const i in c.mats) st.bag[i] -= c.mats[i]; const q = bpRoll(2); Sound.sfx('rock'); yield* say('鏘！鏘！鏘！');
      if (q > g.q) { const B = GEAR[g.b], R = GQ_ROLL[q]; g.q = q; g.r = Math.round((R[0] + Math.random() * (R[1] - R[0])) * 100) / 100; g.a = scaleAffixes(rollAffixes(AFFIX_COUNT[q], B.slot, B.t), q); if (q === 5 && typeof RAINBOW_FX !== 'undefined') g.x = pick(RAINBOW_FX); clampHP(); Sound.jingle('levelup'); yield* say('成功了！品質提升為「' + qName(q) + '」！\n' + gearName(g)); }
      else { Sound.sfx('bump'); yield* say('……這次品質沒有提升。'); }
    }
  };
}
// quest / event rewards that used to be gear: the blueprint (+ ticket) instead; .txt is what the dialogue shows
function bpGift(k, q = 1) { return { b: k, q, txt: gainBP(k, q) }; }
