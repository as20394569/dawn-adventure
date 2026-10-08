/* ===================== v14.10 全系統檢查・第一輪（戰鬥數字・卡牌・商店・道具・舊存檔） =====================
   玩家：「遊戲底層沒問題嗎？傷害計算 血量 那些」「還有裝備那些呢」「全部系統都要檢查並修改」
   · 舊的裝備・屬性・晶石在戰鬥外還有效果（勝利回血、回復量、晶石金幣、幸運多掉素材）→ 全部歸零（身上穿的只留外觀）
   · 首殺菁英・頭目時多做出一件看不到的裝備，接著被換成一次卡牌獎勵 → 不再多給
   · 商店：村裡的店員沒有指定貨架時什麼都賣（MP 藥水・天賦書・盾牌）→ 一樣過濾；沒東西可賣時不會當掉；道具買完不會整個離開商店
   · 用不到的道具：MP 藥水→傷藥、果實→卡牌獎勵（菁英）、天賦書・重生之水・遺忘之書→免費升級、煙霧彈→傷藥（原本換金幣，店員又在賣 MP 藥水＝無限金幣）
   · 價錢照「去過最高的地區」算，不再照看不到的等級（練等不會讓店變貴）；刪卡・升級的漲價有上限，各職業分開算，免費刪卡不算
   · 傷藥改成照最大 HP 的比例回復（特級 600 G 補滿讓後期頭目變簡單）
   · 料理・海蠟耳塞・深淵異象在卡牌戰鬥裡沒有效果 → 改成卡牌版的效果
   · 競技場每一戰都給頭目等級的三選一（可以無限刷）→ 只在第一次通過時拿獎品
   · 解毒藥・燙傷膏也解卡牌的毒・燃燒 */

KD.v14on = (st = Game.st) => !Game.noV14 && !!st && !!st.k14;

/* ---------- 戰鬥外：舊裝備・屬性的效果歸零 ---------- */
{ const _hs = heroStats; heroStats = function (st = Game.st, ...a) { const S = _hs.call(this, st, ...a); if (!KD.v14on(st) || !S) return S;
    const o = { ...S, healUp: 0, faWin: 0, cr11P: [], th9: {} }; for (const k in o) if (/^th9./.test(k)) o[k] = 0; return o; }; }
// 晶石：沒有東西可以鑲了，不再掉（也不再說「到鐵匠那裡鑲進裝備」）
{ const _cg = cryGive11; cryGive11 = function (sp, st = Game.st) { if (KD.v14on(st)) return false; return _cg.call(this, sp, st); }; }
// 首殺菁英・頭目：裡面做出來又被丟掉的裝備，不要留在背包裡變成一次卡牌獎勵
{ const _ld = lootDrops; lootDrops = function (b) { const st = Game.st; if (!KD.v14on(st)) return _ld.call(this, b);
    const before = new Set((st.gear || []).map(g => g.u)), r = _ld.call(this, b) || [], keep = new Set(r.filter(Boolean).map(g => g.u));
    st.gear = (st.gear || []).filter(g => before.has(g.u) || keep.has(g.u)); return r; }; }

/* ---------- 舊存檔 ---------- */
KD.JUNK = { mp: 1, boost: 1, tp: 1, reset: 1, escape: 1 };
KD.junkKind = k => { const it = ITEMS[k]; return it && KD.JUNK[it.use] ? it.use : null; };
KD.MIG_CAP = st => Math.max(1000, Math.round(KD.gW(KD.pLv(st)) * 25 / 50) * 50); // all the old gear together: at most about 25 wild fights' gold
{ const _m = KD.migrate; KD.migrate = st => { if (!st || st.k14) return null;
    const hold = {}; for (const k in st.bag || {}) if (KD.junkKind(k) && st.bag[k] > 0) { hold[k] = st.bag[k]; delete st.bag[k]; } // converted by the junk script below (cards・upgrades・potions), not into gold
    const g0 = _m(st) || 0; for (const k in hold) st.bag[k] = hold[k];
    const give = Math.min(g0, KD.MIG_CAP(st)); st.money -= g0 - give; KD.state(st).migGold = give; return give; }; } // what is worn stays as the look only (its effects are off above)
// saves of any level migrate (a Lv1 save used to stay an RPG save); the catch-up picks wait until nothing else is running
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; if (!Game.noV14 && st && !st.k14 && (st.lv || 1) <= 1) KD.migrate(st); return _so.apply(this, a); }; } // Lv2+ saves: 14d migrates them
{ const _cs = KD.catchupScript; KD.catchupScript = function* (gold) { const K = KD.state(); if (gold == null) gold = K.migGold || 0; K.migGold = 0; return yield* _cs.call(this, gold); }; }
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st;
    if (KD.v14on(st) && Game.scene === this && !this.script && !UI.stack.length && !Game.trans) { const K = KD.state(st);
      if ((K.catchup || 0) > 0) { this.run(KD.catchupScript(null)); return; } // an older notice ran first at load: the catch-up picks start now
      const L = Object.keys(st.bag || {}).filter(k => KD.junkKind(k) && st.bag[k] > 0).map(k => [k, st.bag[k]]);
      if (L.length) { for (const [k] of L) delete st.bag[k]; this.run(KD.junkScript(L)); return; } }
    return _u.apply(this, a); }; }
KD.TXT.push([/身上的裝備和用不到的道具換成了 (\d+) G。/g, '舊裝備換成了 $1 G。']);

/* ---------- 用不到的道具：換成卡牌版用得到的東西 ---------- */
KD.MP2HP = { manaPotion: 'potion', ether: 'potion', hiEther: 'superPotion', megaEther: 'megaPotion' };
KD.junkScript = function* (L) { const st = Game.st, sub = () => ({ sub: '加入「' + KD.clsOf(st).n + '」的牌組' });
  for (const [k, n] of L) { const it = ITEMS[k], u = it.use, xn = n > 1 ? '×' + n : '';
    if (u === 'mp' || u === 'escape') { const to = KD.MP2HP[k] || 'potion'; st.bag[to] = (st.bag[to] || 0) + n; Sound.sfx('item'); yield* say('（' + it.n + xn + '在卡牌版用不到，換成了' + ITEMS[to].n + xn + '。）'); continue; }
    if (u === 'boost') { for (let i = 0; i < n; i++) { yield* say('（' + it.n + '換成了卡牌獎勵。）'); yield* KD.pickFlow(KD.offer(KD.clsKey(st), 'elite'), '卡牌獎勵：選一張', sub()); } continue; }
    for (let i = 0; i < n; i++) { yield* say('（' + it.n + '換成了一次免費升級。）');
      while (true) { if (!KD.deck(st).some(KD.canUp)) { const g = Math.round(KD.gW(KD.pLv(st)) * 2 / 5) * 5; st.money += g; yield* say('（牌組裡的卡都升級過了，換成了 ' + g + ' G。）'); break; }
        if (yield* KD.upOne('免費升級：選一張卡')) break; if (yield* yesNo('放棄這次免費升級嗎？')) break; } } } };

/* ---------- 價錢：照去過最高的地區（不是看不到的等級） ---------- */
KD.topLv = st => { let top = 1; for (const m in st.vis || {}) { const M = MAPS[m]; for (const e of (M && M.encounters) || []) for (const r of e.table || []) top = Math.max(top, +r[2] || +r[1] || 1); } return top; };
KD.pLv = (st = Game.st) => { if (!st) return 1; const lv = st.lv || 1, t = KD.topLv(st); return Math.max(1, Math.min(lv, t > 1 ? t : lv)); };
KD.price = (rar, st = Game.st) => Math.round(KD.gW(KD.pLv(st)) * ({ C: 3, U: 5, R: 10, L: 20 }[rar] || 3) / 5) * 5;
KD.REM_CAP = 6; KD.UP_CAP = 8;
KD.byCls = (st, f) => { const K = KD.state(st), c = KD.clsKey(st); K[f] = K[f] || {}; return K[f][c] || 0; };
KD.addCls = (st, f) => { const K = KD.state(st), c = KD.clsKey(st); K[f] = K[f] || {}; K[f][c] = (K[f][c] || 0) + 1; };
KD.removePrice = (st = Game.st) => Math.round(KD.gW(KD.pLv(st)) * (4 + Math.min(KD.REM_CAP, KD.byCls(st, 'remBy'))) / 5) * 5;
KD.upPrice = (st = Game.st) => { const p = Math.round(KD.gW(KD.pLv(st)) * (2 + 0.5 * Math.min(KD.UP_CAP, KD.byCls(st, 'upBy'))) / 5) * 5; return st && st.flags && st.flags.q3res === 'keep' ? Math.max(5, Math.round(p / 10) * 5) : p; };
KD.removeFlow = function* () { const st = Game.st, D = KD.deck(st);
  if (KD.remNo(st, D)) { yield* say(KD.remMsg(st)); return; } const p = KD.removePrice(st); if (st.money < p) { Sound.sfx('buzz'); yield* say('刪卡要 ' + p + ' G，金幣不夠。'); return; }
  const L = KD.sorted(D), r = yield* KD.grid('刪卡（' + p + ' G）', L, { act: () => '再點一次：刪掉這張', hint: '選一張要從牌組刪掉的卡。' }); if (r < 0) return;
  const c = L[r]; if (!(yield* yesNo('花 ' + p + ' G 把「' + KD.name(c) + '」從牌組刪掉嗎？'))) return;
  st.money -= p; D.splice(D.indexOf(c), 1); KD.state(st).rem = (KD.state(st).rem || 0) + 1; KD.addCls(st, 'remBy'); Sound.sfx('select'); yield* say('「' + KD.name(c) + '」從牌組裡拿掉了。'); };
// shop cards: one stock per town and class (switching class and back doesn't reroll it); each slot rolls its rarity once
KD.shopStock = (st = Game.st) => { const K = KD.state(st), cls = KD.clsKey(st), sk = st.map + ':' + cls, key = Math.floor((st.wins || 0) / 15) + ':' + KD.bossN(st); K.shops = K.shops || {};
  let S = K.shops[sk]; if (!S || S.key !== key) { const R = Math.random, pickR = () => { const r = R(); return r < 0.55 ? 'C' : r < 0.9 ? 'U' : 'R'; }, ids = [];
    for (let g = 0; ids.length < 5 && g < 80; g++) { const rar = pickR(), L = Object.keys(KD.CARDS).filter(id => { const C = KD.CARDS[id]; return C.cls === cls && C.rar === rar && !C.hidden && !ids.includes(id); }); if (L.length) ids.push(L[Math.floor(R() * L.length)]); }
    for (let g = 0; ids.length < 7 && g < 80; g++) { const L = KD.pool(cls, pickR()).filter(id => KD.CARDS[id].cls === 'nt' && !ids.includes(id)); if (L.length) ids.push(L[Math.floor(R() * L.length)]); }
    S = K.shops[sk] = { key, ids, sold: [] }; } return S; };

/* ---------- 商店 ---------- */
KD.NOSELL = new Set(['mp', 'boost', 'tp', 'reset', 'escape', 'food13']);
KD.shopOk = k => !GEAR[k] && !!ITEMS[k] && !KD.NOSELL.has(ITEMS[k].use) && !ITEMS[k].key;
{ const _sb = shopBuy; shopBuy = function* (stock, ...a) { if (Game.noV14) return yield* _sb.call(this, stock, ...a);
    const L = (Array.isArray(stock) ? stock : shopList()).filter(KD.shopOk); if (!L.length) { yield* say('今天沒有你用得到的東西。'); return; } return yield* _sb.call(this, L, ...a); }; }
{ const _sf = shopFlow; shopFlow = function* (stock, ...a) { if (Game.noV14) return yield* _sf.call(this, stock, ...a); const st = Game.st, f = st.flags || {};
    if (!stock && f.caravan === 'lost' && !f.shopLost) { f.shopLost = 1; yield* say('商隊沒能抵達……好傷藥進不了貨了。'); } if (f.croc) f.shopNew = 1;
    const mw = { draw: moneyWin }; UI.push(mw);
    try { while (true) { const r = yield* ask('歡迎光臨！', ['買道具', '賣東西', '卡牌', '刪卡（' + KD.removePrice() + ' G）', '離開']);
        if (r === 0) yield* shopBuy(stock); else if (r === 1) yield* shopSell(); else if (r === 2) yield* KD.cardShop(); else if (r === 3) yield* KD.removeFlow(); else break; } }
    finally { UI.remove(mw); }
    yield* say('謝謝惠顧！歡迎再來！'); }; }

/* ---------- 傷藥：照最大 HP 的比例回復，價錢照地區 ---------- */
// [回復比例, 價錢＝地區一場野戰金幣的幾倍, 最低價]
KD.POT = { potion: [0.25, 1, 50], superPotion: [0.45, 2.5, 200], megaPotion: [0.75, 5, 600], elixir: [1, 8, 800], noraBread: [0.5, 0, 0] };
for (const k in KD.POT) { const it = ITEMS[k]; if (!it) continue; const P = KD.POT[k], p0 = it.price, d0 = it.d; let r = 1;
  const base = () => (KD.v14on() && P[1] ? Math.max(P[2], Math.round(KD.gW(KD.pLv(Game.st)) * P[1] / 5) * 5) : p0);
  Object.defineProperty(it, 'price', { configurable: true, enumerable: true, get: () => { const b = base(); return r === 1 ? b : Math.round(b * r / 10) * 10; }, set: v => { const b = base(); r = b ? v / b : 1; if (Math.abs(r - 1) < 0.02) r = 1; } });
  Object.defineProperty(it, 'd', { configurable: true, enumerable: true, get: () => (!KD.v14on() ? d0 : k === 'elixir' ? 'HP 完全回復，並治好所有異常狀態。' : (k === 'noraBread' ? '諾拉用金穗平原的麥子烤的麵包。' : '') + '回復最大 HP 的 ' + Math.round(P[0] * 100) + '%。'), set: () => {} }); }
{ const _ui = useItem; useItem = function (k) { const it = ITEMS[k], P = KD.POT[k], st = Game.st; if (!KD.v14on(st) || !P || !it || it.use !== 'heal') return _ui.apply(this, arguments);
    if (!canUseItem(k)) return null; const mh = KD.maxHp(st), b = st.hp; st.bag[k]--; st.hp = Math.min(mh, st.hp + Math.max(1, Math.round(mh * P[0]))); return st.name + '的HP恢復了' + (st.hp - b) + '點！'; }; }
for (const k in KD.POT) { const D = DEF.items && DEF.items[k]; if (D && D.effects) for (const x of D.effects) { const e = typeof x === 'string' ? DEF.effects[x] : x; if (e && e.type === 'heal' && e.amount != null) e.k14pct = KD.POT[k][0]; } } // effects are registered ids by now
{ const H = EFFECT_TYPES.heal, _x = H.exec; H.exec = function (core, ef, ...a) { if (ef && ef.k14pct && KD.on(core)) ef = { ...ef, amount: null, pct: ef.k14pct }; return _x.call(this, core, ef, ...a); }; }
KD.TXT.push([/的HP和MP完全恢復了！/g, '的HP完全恢復了！']);
// 解毒藥・燙傷膏：卡牌戰鬥的毒・燃燒也一起解
{ const R = EFFECT_TYPES.remove_status, _x = R.exec; R.exec = function (core, ef, ctx, tg, ...a) { const r = _x.call(this, core, ef, ctx, tg, ...a);
    if (KD.on(core) && ef && ef.why === 'item') { const id = ef.status === 'psn' ? 'pois14' : ef.status === 'brn' ? 'burn14' : null; if (id) for (const t of tg || []) if (t && stkK(t, id)) setStk15(core, t, id, 0); } return r; }; }

/* ---------- 成就獎金：照地區（固定 200 G 到後期等於沒有） ---------- */
KD.achGold = st => (KD.v14on(st) ? Math.max(200, Math.round(KD.gW(KD.pLv(st)) * 2 / 10) * 10) : 200);
checkAch = function () { const st = Game.st; if (!st) return; st.ach = st.ach || {};
  for (const a of ACHIEVEMENTS) if (!st.ach[a.id] && a.ok(st)) { st.ach[a.id] = 1; const g = KD.achGold(st); st.money += g; (Game.toastQ = Game.toastQ || []).push({ n: a.n, t: 0, g }); } };
{ const _f = Font.draw; let on = 0; const _dt = drawToast; drawToast = function (x) { const T = Game.toastQ && Game.toastQ[0]; on = T && T.g && T.g !== 200 ? T.g : 0; try { return _dt.call(this, x); } finally { on = 0; } };
  Font.draw = function (x, s, ...a) { if (on && s === '★ 成就解鎖　+200 G') s = '★ 成就解鎖　+' + on + ' G'; return _f.call(this, x, s, ...a); }; }

/* ---------- 競技場：只有第一次通過每一級有獎品（每一戰的三選一可以無限刷） ---------- */
{ const _br = KD.battleRewards; KD.battleRewards = function* (b) { const cfg = (b && b.cfg) || {}; if (cfg.arena13) return; return yield* _br.call(this, b); }; }

/* ---------- 卡牌戰鬥裡的料理・耳塞・深淵異象 ---------- */
KD.FOOD = { grill: { dmg: 0.06 }, rice: { card: 0.15 }, soup: { regen: 0.03 }, trout: { draw1: 1 }, tako: { en1: 1 }, bream: { taken: 0.08 }, moon: { regen: 0.02 }, nabe: { dmg: 0.08, taken: 0.08 }, lord: { dmg: 0.12, taken: 0.12, draw1: 1 } };
KD.FOOD_T = { grill: '卡牌傷害 +6%', rice: '打怪掉卡的機率提高', soup: '每回合開始回復 3% HP', trout: '第一回合多抽 1 張', tako: '第一回合能量 +1', bream: '受到的傷害 −8%', moon: '每回合開始回復 2% HP', nabe: '卡牌傷害 +8%・受到的傷害 −8%', lord: '卡牌傷害 +12%・受到的傷害 −12%・第一回合多抽 1 張' };
if (typeof DISH13 !== 'undefined') for (const k in DISH13) { const D = DISH13[k], t0 = D[4], it = ITEMS[k], d0 = it && it.d; Object.defineProperty(D, 4, { configurable: true, enumerable: true, get: () => (KD.v14on() && KD.FOOD_T[D[2]]) || t0, set: () => {} });
  if (it) Object.defineProperty(it, 'd', { configurable: true, enumerable: true, get: () => (KD.v14on() ? '料理。在野外吃，接下來 ' + D[3] + ' 場戰鬥：' + D[4] + '。（同時只能有一道菜）' : d0), set: () => {} }); }
KD.food = (st = Game.st) => { const F = typeof foodOf13 === 'function' ? foodOf13(st) : null; return (F && DISH13[F.k] && KD.FOOD[DISH13[F.k][2]]) || {}; };
KD.anom = () => (typeof isAby === 'function' && isAby() && typeof abyAnom === 'function' ? abyAnom() : null);
if (typeof ABY_ANOM13 !== 'undefined') { const A0 = { rage: ABY_ANOM13.rage[1], shell: ABY_ANOM13.shell[1], star: ABY_ANOM13.star[1], tide: ABY_ANOM13.tide[1] };
  const T = { rage: '魔物的傷害 +20%，掉卡的機率提高', shell: '魔物受到的傷害 −20%，素材多掉 1 個', star: '雙方造成的傷害 +20%', tide: '每場戰鬥第一回合能量 +1' };
  for (const k in T) Object.defineProperty(ABY_ANOM13[k], 1, { configurable: true, enumerable: true, get: () => (KD.v14on() ? T[k] : A0[k]), set: () => {} }); }
// hero → monster
{ const _kh = KD.hit; KD.hit = function (core, a, t, base, o = {}) { if (!KD.on(core) || !a || !t) return _kh.call(this, core, a, t, base, o); let m = 1;
    if (a.hero) { m *= 1 + (KD.food().dmg || 0); const an = KD.anom(); if (an === 'star') m *= 1.2; if (an === 'shell' && t.side === 'B') m *= 0.8; }
    return _kh.call(this, core, a, t, base, m === 1 ? o : { ...o, mul: (o.mul || 1) * m }); }; }
// monster → hero (after every other conversion, so the number over the monster's head is what lands)
{ const _d = BR.damage; BR.damage = function (core, src, tgt, skill, o = {}) { const r = _d.call(this, core, src, tgt, skill, o);
    if (!KD.on(core) || !r || !tgt || !tgt.hero || !src || src.hero || !(r.amount > 0)) return r; let m = 1 - (KD.food().taken || 0); if (KD.anom() === 'star') m *= 1.2;
    return m === 1 ? r : { ...r, amount: Math.max(1, Math.round(r.amount * m)) }; }; }
{ const _st = BPK.startTurnK; BPK.startTurnK = function () { const r = _st.apply(this, arguments); try { const F = KD.food(), H = this.Hu(), core = this.core;
      if (F.regen && this.turns > 1 && H.res.hp < H.max.hp) KD.heal(core, H, Math.max(1, Math.round(H.max.hp * F.regen)));
      if (this.turns === 1) { if (F.draw1) this.drawN(1); if (F.en1) this.energy++; if (KD.anom() === 'tide') this.energy++; } this.syncK(); } catch (e) { /* a bonus never breaks the turn */ } return r; }; }
{ const _wr = KD.wildRate; KD.wildRate = (cfg = {}, st = Game.st) => Math.min(0.8, _wr(cfg, st) + (KD.food(st).card || 0) + (KD.anom() === 'rage' ? 0.15 : 0)); }
// 海蠟耳塞・料理 (other hero passives the card battle drops)
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg = {}) { const s = _hs.call(this, st, cfg); if (!KD.use(cfg) || !s || !st) return s;
    if (st.bag && st.bag.earplug13 && !s.passives.some(p => p.key === 'earplug13')) s.passives.push({ key: 'earplug13', v: 1, src: 'other' }); return s; }; }
// 天氣祠的祝福（晴天）：卡牌版只說傷害
KD.TXT.push([/接下來3場戰鬥，一開始物攻和魔攻就提升一級。/g, '接下來 3 場戰鬥，前 3 回合卡牌傷害提高。']);

/* ---------- 文字：itemGet・ask 也先經過舊版的替換，再套卡牌版的規則（順序跟 say 一樣） ---------- */
{ const nc = t => (typeof ncTxt12 === 'function' ? ncTxt12(t) : t), fx = t => (Game.noV14 || typeof t !== 'string' ? t : KD.fixTxt(nc(KD.fixTxt(t))));
  const _ig = itemGet; itemGet = function* (text, ...a) { return yield* _ig.call(this, fx(text), ...a); };
  const _ask = ask; ask = function* (text, ...a) { return yield* _ask.call(this, fx(text), ...a); }; }

/* ---------- 卡牌工坊：自己選素材（不會拿走重要物品・魚・深淵的碎片），部位也能用；先看錢夠不夠 ---------- */
KD.MAT_NO = new Set(['riftShard', 'starShard', 'starDust', 'riftToken']);
KD.matOk = k => { const it = ITEMS[k]; if (!it || it.key || it.cat === '魚' || KD.MAT_NO.has(k) || it.use != null) return false; return /^(pt_|pr_)/.test(k) || (typeof MATCAT11 !== 'undefined' && !!MATCAT11[k]) || it.price === 0; };
KD.mats = (st = Game.st) => Object.keys(st.bag || {}).filter(k => st.bag[k] > 0 && KD.matOk(k)).sort((a, b) => st.bag[b] - st.bag[a]);
KD.workshop = function* () { const st = Game.st;
  while (true) { const D = KD.deck(st), L = KD.sorted(D).filter(KD.canUp), p = KD.upPrice(st), M = KD.mats(st).filter(k => st.bag[k] >= 2);
    if (!L.length) { yield* say('牌組裡的卡都升級過了！'); return; }
    if (st.money < p) { Sound.sfx('buzz'); yield* say('升級要 ' + p + ' G＋素材 2 個，金幣不夠。'); return; }
    if (!M.length) { Sound.sfx('buzz'); yield* say('素材不夠：要 2 個一樣的素材（打怪掉的素材、部位都可以）。'); return; }
    const r = yield* KD.grid('卡牌工坊', L, { right: () => p + 'G＋素材2', act: () => '再點一次：升級', detail: c => '升級後：' + KD.desc({ id: c.id, up: 1 }) + (KD.CARDS[c.id].upCost != null ? '（費用 ' + KD.CARDS[c.id].upCost + '）' : ''), hint: '升級 ' + p + ' G＋素材 2 個（越升越貴）' });
    if (r < 0) return; const c = L[r];
    const mi = M.length === 1 ? 0 : yield* choose(M.map(k => ({ t: ITEMS[k].n, r: '×' + st.bag[k] })), { title: '用哪個素材？（2 個）' }); if (mi < 0) continue; const m = M[mi];
    if (!(yield* yesNo('花 ' + p + ' G 和 2 個「' + ITEMS[m].n + '」升級「' + KD.CARDS[c.id].n + '」嗎？'))) continue;
    st.money -= p; st.bag[m] -= 2; if (!st.bag[m]) delete st.bag[m]; c.up = 1; st.k14.upN = (st.k14.upN || 0) + 1; KD.addCls(st, 'upBy'); Sound.sfx('levelup'); yield* say('「' + KD.CARDS[c.id].n + '」升級成「' + KD.name(c) + '」了！'); } };

/* ---------- 霧中的商人：天賦書・重置道具在卡牌版用不到 → 賣史詩卡（只在起霧時） ---------- */
KD.fogShop = function* () { const st = Game.st, K = KD.state(st), cls = KD.clsKey(st), key = 'fog:' + cls + ':' + KD.bossN(st); K.shops = K.shops || {};
  let S = K.shops[key]; if (!S) { const L = Object.keys(KD.CARDS).filter(id => { const C = KD.CARDS[id]; return C.cls === cls && C.rar === 'R' && !C.hidden; }), ids = []; while (ids.length < 3 && L.length) ids.push(L.splice(Math.floor(Math.random() * L.length), 1)[0]); S = K.shops[key] = { key, ids, sold: [] }; }
  while (true) { const L = S.ids.map((id, i) => ({ id, i })).filter(q => !S.sold.includes(q.i)); if (!L.length) { yield* say('「……今天就這些了。」'); return; }
    const r = yield* KD.grid('霧中的商人（' + st.money + ' G）', L.map(q => ({ id: q.id })), { right: () => '', tag: c => KD.price('R') + 'G', act: () => '再點一次：' + KD.price('R') + ' G 買下', rows: 3 }); if (r < 0) return;
    const q = L[r], p = KD.price('R'); if (st.money < p) { Sound.sfx('buzz'); yield* say('金幣不夠。'); continue; }
    st.money -= p; S.sold.push(q.i); KD.addCard(st, { id: q.id }); Sound.sfx('item'); yield* say('買下了「' + KD.CARDS[q.id].n + '」！（加入' + KD.clsOf(st).n + '的牌組）'); } };
{ const _sf = shopFlow; shopFlow = function* (stock, ...a) { if (KD.v14on() && Array.isArray(stock) && stock.length && stock.every(k => ['trainBook', 'attrReset', 'talentReset', 'tpBook'].includes(k))) { yield* say('「……我只賣稀有的卡。」'); return yield* KD.fogShop(); } return yield* _sf.call(this, stock, ...a); }; }

/* ---------- 戰鬥說明：魔物造成的「中毒・灼傷」跟卡牌的「毒・燃燒」是不同的東西 ---------- */
if (typeof BATTLE_HELP !== 'undefined') { const P = BATTLE_HELP.find(p => p[0] === '狀態'); if (P) P[1].push('中毒・灼傷（魔物造成）：每回合結束失去 HP，幾回合後消失。解毒藥・燙傷膏可以解（卡牌的毒・燃燒也一起解）。'); }

/* ---------- 命中：卡牌戰鬥不擲骰 ---------- */
// 魔物打主角不會落空（頭上寫的傷害就是會挨的；以前蟲群 4 段常常只中 3 段、重擊也會揮空）
{ const _hc = BR.hitChance; BR.hitChance = function (core, src, tgt, skill) { if (KD.on(core) && tgt && tgt.hero && src && !src.hero) return 1; return _hc.call(this, core, src, tgt, skill); }; }
// 高飛・虛影：原本是「物理攻擊容易落空」，可是卡牌不會落空（等於沒作用）→ 改成固定減傷：高飛時物理 ×0.6、虛影物理 ×0.8
{ const _kh = KD.hit; KD.hit = function (core, a, t, base, o = {}) { if (!KD.on(core) || !a || !a.hero || !t || t.side !== 'B') return _kh.call(this, core, a, t, base, o);
    const sk = DEF.skills[core.data.skill14] || DEF.skills.attack, cat = o.cat || sk.cat || '物'; if (cat === '特') return _kh.call(this, core, a, t, base, o);
    let m = 1; if (core.hasStatus(t, 'fly14')) m *= 0.6; if (t.data && t.data.fam14 === 'spirit') m *= 0.8; return _kh.call(this, core, a, t, base, m === 1 ? o : { ...o, mul: (o.mul || 1) * m }); }; }
if (typeof FAM_TRAIT_D14 !== 'undefined') Object.assign(FAM_TRAIT_D14, { bird: '飛上天後到牠下次行動前，物理傷害只剩 60%；俯衝那一下 ×1.3（頭上出現「高飛」時，用魔法或先疊格擋）', spirit: '下一步看不出來；物理傷害只剩 80%' });
if (MOVES.f14_fly) { MOVES.f14_fly.d = '飛到高空：到牠下次行動前，物理傷害只剩 60%；俯衝那一下 ×1.3。'; if (DEF.skills.f14_fly) DEF.skills.f14_fly.desc = MOVES.f14_fly.d; }

/* ---------- 魔物降主角的攻防：改成卡牌的「虛弱・易傷」 ----------
   以前是看不到的「物防 −1」，而且在你按「結束」時就到期 → 頭上寫 17，實際只挨 14（多隻魔物時順序也會讓數字對不上）。
   改成：降物防・魔防 → 易傷 2、降物攻・魔攻 → 虛弱 2（回合結束 −1：剛好撐過你的下一回合和魔物的下一輪）。頭上寫「+易傷」「+虛弱」。 */
KD.STAGE_TO = { def: 'vuln15', spd: 'vuln15', atk: 'weak15', spa: 'weak15' };
{ const S = EFFECT_TYPES.stage, _x = S.exec; S.exec = function (core, ef, ctx, tg) {
    if (!KD.on(core) || !ef || !ef.stats || !ctx || !ctx.owner || ctx.owner.hero || !(tg || []).some(t => t && t.hero)) return _x.call(this, core, ef, ctx, tg);
    const conv = Object.keys(ef.stats).filter(k => KD.STAGE_TO[k] && ef.stats[k] < 0); if (!conv.length) return _x.call(this, core, ef, ctx, tg);
    const rest = {}; for (const k in ef.stats) if (!conv.includes(k)) rest[k] = ef.stats[k];
    const H = tg.filter(t => t && t.hero), O = tg.filter(t => t && !t.hero); if (O.length) _x.call(this, core, ef, ctx, O); if (Object.keys(rest).length) _x.call(this, core, { ...ef, stats: rest }, ctx, H);
    for (const id of new Set(conv.map(k => KD.STAGE_TO[k]))) for (const h of H) if (stkK(h, id) < 2) KD.add(core, ctx.owner, h, id, 2 - stkK(h, id)); }; }
KD.debName = D => { const st = {}; for (const x of (D && (D.effects || []).concat(D.after || [])) || []) { const e = typeof x === 'string' ? DEF.effects[x] : x; if (e && e.type === 'stage' && e.target !== 'self' && e.stats) for (const k in e.stats) if (e.stats[k] < 0) st[k] = 1; }
  return st.def || st.spd ? '+易傷' : '+虛弱'; };
{ const _io = intentOf14; intentOf14 = function (core, u, cmd) { const I = _io(core, u, cmd); if (!I || !KD.on(core) || typeof I.t !== 'string') return I;
    if (I.t.indexOf('+削弱') >= 0) return { ...I, t: I.t.replace('+削弱', KD.debName(cmd && cmd.type === 'skill' ? DEF.skills[cmd.skill] : null)) };
    if (I.k === 'debuff' && /^削弱/.test(I.t)) return { ...I, t: I.t.replace('削弱', KD.debName(cmd && cmd.type === 'skill' ? DEF.skills[cmd.skill] : null).slice(1)) }; // v14.12: a debuff move says which
    const m = I.k === 'steal' && I.t.match(/^偷錢 (\d+)$/); if (m) return { ...I, t: m[1] + '+偷錢' }; // the number is the blow; it steals gold too
    return I; }; }
if (typeof BATTLE_HELP !== 'undefined') { const P = BATTLE_HELP.find(p => p[0] === '魔物'); if (P) P[1][0] = P[1][0].replace('「+盾」是同時獲得格擋（數字顯示在牠腳下）。', '「+盾」是同時獲得格擋（數字顯示在牠腳下），「+易傷」「+虛弱」是打中後附加的。'); }
