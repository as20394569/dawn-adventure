/* ===================== v12.41 料理（讓釣到的魚和採集的素材有用處） =====================
   萌芽鎮・王都・潮鳴港的旅店多一位廚師（櫃檯右邊）。拿食材找廚師做菜；菜在野外從背包吃，效果持續幾場戰鬥。
   同時只能有一道菜（吃新的會換掉舊的）。 */
const FOOD_GROUP13 = { common: ['fish13_crucian', 'fish13_minnow', 'fish13_loach', 'fish13_icefish', 'fish13_horseMack'], trout: ['fish13_trout', 'fish13_moonTrout', 'fish13_snowTrout'],
  lord: ['fish13_catKing', 'fish13_lakeLord', 'fish13_lungfish', 'fish13_iceLord', 'fish13_bluefin'] };
const FOOD_GROUPN13 = { common: '任意常見魚', trout: '虹鱒・銀月鱒・雪鱒任一', lord: '任一隻水域之主' };
const DISH13 = { // key: [name, recipe [[item or group, n]], effect kind, battles, effect text, [plate food colour, accent]]
  dish13_grill: ['烤魚串', [['common', 2]], 'grill', 5, '傷害 +6%', ['#c88848', '#6a4020']],
  dish13_rice: ['蝦仁炒飯', [['fish13_shrimp', 2], ['pt:木料', 3]], 'rice', 5, '經驗值 +20%', ['#f0d070', '#f08060']],
  dish13_soup: ['溪魚湯', [['fish13_minnow', 1], ['pt:藥材', 3]], 'soup', 5, '每回合回復 3% HP', ['#e8e0c0', '#6ab050']],
  dish13_trout: ['香煎鱒魚', [['trout', 1], ['pt:藥材', 2]], 'trout', 5, '會心率 +6%', ['#e89070', '#7ac8e8']],
  dish13_tako: ['章魚燒', [['fish13_octopus', 1], ['pt:木料', 2]], 'tako', 5, '速度 +8%', ['#b07040', '#f0e0a0']],
  dish13_bream: ['清蒸黑鯛', [['fish13_blackBream', 1], ['pt:魔素', 2]], 'bream', 5, '受到的傷害 −8%', ['#f0ece0', '#5a6070']],
  dish13_moon: ['月光甜湯', [['fish13_moonfish', 1], ['pt:藥材', 3]], 'moon', 8, '每回合回復 2% MP', ['#e8e0ff', '#f0c040']],
  dish13_nabe: ['海鮮大鍋', [['fish13_horseMack', 1], ['fish13_octopus', 1], ['fish13_marlin', 1]], 'nabe', 8, '傷害 +8%・受到的傷害 −8%', ['#e86040', '#f0e0c0']],
  dish13_lord: ['水域之主的全餐', [['lord', 1]], 'lord', 10, '傷害 +12%・受到的傷害 −12%・會心率 +5%', ['#f0c040', '#e86040']],
};
const DISH_KEYS13 = Object.keys(DISH13);
const foodOf13 = (st = Game.st) => st && st.food13 && st.food13.n > 0 ? st.food13 : null;
// ingredients: an item or a group (take from whichever you have most of)
// (v12 turns gathered herbs, wheat, dew… into 素材點數 the moment you pick them up, so the side ingredients are points)
const foodHave13 = (g, st = Game.st) => /^pt:/.test(g) ? (pts11(st)[g.slice(3)] || 0) : (FOOD_GROUP13[g] || [g]).reduce((a, k) => a + ((st.bag || {})[k] || 0), 0);
const foodName13 = g => /^pt:/.test(g) ? g.slice(3) + '點數' : FOOD_GROUPN13[g] || (ITEMS[g] ? ITEMS[g].n : g);
const canCook13 = (k, st = Game.st) => DISH13[k][1].every(([g, n]) => foodHave13(g, st) >= n);
function cookTake13(k, st = Game.st) { for (const [g, n0] of DISH13[k][1]) { if (/^pt:/.test(g)) { ptsPay11({ [g.slice(3)]: n0 }, st); continue; } let n = n0; while (n > 0) { const L = (FOOD_GROUP13[g] || [g]).filter(q => (st.bag[q] || 0) > 0).sort((a, b) => st.bag[b] - st.bag[a]); if (!L.length) break; st.bag[L[0]]--; n--; } } }
for (const k of DISH_KEYS13) { const [n, , , b, t] = DISH13[k]; ITEMS[k] = { n, use: 'food13', price: 0, sell: 40, cat: '回復', d: '料理。在野外吃，接下來 ' + b + ' 場戰鬥：' + t + '。（同時只能有一道菜）' }; }
// the icon: a bowl with the dish in it
for (const k of DISH_KEYS13) { const [c1, c2] = DISH13[k][5], c = mkCanvas(16, 16), x = c.getContext('2d');
  x.fillStyle = '#141420'; x.fillRect(1, 8, 14, 1); x.fillRect(2, 13, 12, 1); x.fillRect(1, 9, 1, 3); x.fillRect(14, 9, 1, 3);
  x.fillStyle = '#e8e8f0'; x.fillRect(2, 9, 12, 3); x.fillStyle = '#b8b8c8'; x.fillRect(2, 11, 12, 1); x.fillRect(3, 12, 10, 1); x.fillStyle = '#7a8aa8'; x.fillRect(3, 10, 10, 1);
  x.fillStyle = '#141420'; for (let X = 3; X <= 12; X++) x.fillRect(X, 4 + Math.round(Math.abs(X - 7.5) / 2), 1, 1);
  for (let X = 4; X <= 11; X++) { x.fillStyle = c1; x.fillRect(X, 5 + Math.round(Math.abs(X - 7.5) / 2), 1, 8 - 5 - Math.round(Math.abs(X - 7.5) / 2) + 1); }
  x.fillStyle = c2; x.fillRect(6, 6, 2, 1); x.fillRect(9, 6, 1, 1); x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillRect(5, 1, 1, 2); x.fillRect(8, 0, 1, 2); x.fillRect(11, 1, 1, 2);
  ITEM_ICON[k] = c; }

/* ---------- eating (from the bag, in the field) ---------- */
{ const _cu = canUseItem; canUseItem = function (k) { const it = ITEMS[k]; if (it && it.use === 'food13') return Game.scene && Game.scene.constructor.name !== 'Battle'; return _cu(k); }; }
{ const _ui = useItem; useItem = function (k) { const it = ITEMS[k]; if (!it || it.use !== 'food13') return _ui(k); if (!canUseItem(k)) return null; const st = Game.st, D = DISH13[k], old = foodOf13(st);
    st.bag[k]--; st.food13 = { k, n: D[3] };
    return st.name + '吃了' + D[0] + '！' + (old && old.k !== k ? '（換掉了' + DISH13[old.k][0] + '）' : '') + '\n接下來 ' + D[3] + ' 場戰鬥：' + D[4] + '。'; }; }
// in battle: a passive per kind
PV('food13_grill', v => ({ mods: [{ stage: 'talent', who: 'attacker', mul: 1.06, cond: { hasPower: 1 } }] }), { n: '料理' });
PV('food13_soup', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'heal', target: 'self', pct: 0.03, kind: 'regen', quiet: 1 }] }] }), { n: '料理' });
PV('food13_trout', v => ({ mods: [{ stage: 'talent', who: 'attacker', critAdd: 6 }] }), { n: '料理' });
PV('food13_tako', v => ({ mods: [{ stage: 'attacker', who: 'attacker', speMul: 1.08 }] }), { n: '料理' });
PV('food13_bream', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 0.92 }] }), { n: '料理' });
PV('food13_moon', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', pct: 0.02, min: 1, why: 'food13' }] }] }), { n: '料理' });
PV('food13_nabe', v => ({ mods: [{ stage: 'talent', who: 'attacker', mul: 1.08, cond: { hasPower: 1 } }, { stage: 'defender', who: 'defender', mul: 0.92 }] }), { n: '料理' });
PV('food13_lord', v => ({ mods: [{ stage: 'talent', who: 'attacker', mul: 1.12, cond: { hasPower: 1 } }, { stage: 'defender', who: 'defender', mul: 0.88 }, { stage: 'talent', who: 'attacker', critAdd: 5 }] }), { n: '料理' });
PV('food13_rice', v => ({}), { n: '料理' });
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg), F = foodOf13(st); if (F && DISH13[F.k]) s.passives.push({ key: 'food13_' + DISH13[F.k][2], v: 1, src: 'other' }); return s; }; }
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (amount) { const F = foodOf13(Game.st); return yield* _ge.call(this, F && DISH13[F.k] && DISH13[F.k][2] === 'rice' ? Math.round(amount * 1.2) : amount); }; }
// one battle used up per fight (won, lost or fled)
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { const st = Game.st, F = foodOf13(st), r = yield* _bs.call(this, cfg, ...a);
    if (F && st.food13 === F) { F.n--; if (F.n <= 0) { delete st.food13; yield* say('（' + DISH13[F.k][0] + '的效果消失了。）'); } } return r; }; }

/* ---------- the cooks ---------- */
LOOKS.chef13 = { style: 'long', H: '#5a3a24', h: '#7a5234', j: '#9a7050', Y: '#f8f8f4', y: '#d8d8d0', R: '#f0f0ea', r: '#c8c8c0', P: '#3a3a48' };
Events.chef13 = function* () { const st = Game.st;
  if (!st.flags.chef13Met) { st.flags.chef13Met = 1; yield* sayAll(['廚師：「肚子餓了嗎？拿食材來，我幫你做菜！」', '廚師：「魚、蝦，再加一點木料、藥材、魔素……吃了我的菜，接下來幾場戰鬥都會有精神。」', '廚師：「不過一次只能吃一道喔，吃新的會蓋掉舊的。」']); }
  while (true) { const F = foodOf13(st), opts = DISH_KEYS13.map(k => ({ t: DISH13[k][0], r: canCook13(k, st) ? '可以做' : '食材不夠', col: canCook13(k, st) ? UIC.accent : UIC.dis }));
    const r = yield* ask('要做什麼？' + (F ? '\n（現在的料理：' + DISH13[F.k][0] + '，剩 ' + F.n + ' 場）' : ''), opts.concat(['不用了'])); if (r < 0 || r >= DISH_KEYS13.length) return;
    const k = DISH_KEYS13[r], D = DISH13[k], need = D[1].map(([g, n]) => foodName13(g) + '×' + n + '（有 ' + foodHave13(g, st) + '）').join('、');
    yield* say(D[0] + '：' + D[4] + '（' + D[3] + ' 場）\n食材：' + need);
    if (!canCook13(k, st)) { yield* say('廚師：「食材還不夠呢。」'); continue; }
    if (!(yield* yesNo('要做' + D[0] + '嗎？'))) continue;
    cookTake13(k, st); st.bag[k] = (st.bag[k] || 0) + 1; st.cooked13 = (st.cooked13 || 0) + 1; Sound.jingle('item'); yield* itemGet('做好了「' + D[0] + '」！\n（在野外從背包吃）'); } };
for (const m of ['inn', 'capInn', 'seaInn13']) if (MAPS[m]) { MAPS[m].npcs.push({ id: 'chef13', x: 7, y: 2, dir: 'down', look: 'chef13', name: '廚師' }); delete mapCache[m]; }
NPC_ROLES.商店.push('chef13'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.chef13 = '萌芽鎮・王都・潮鳴港的旅店';
ACHIEVEMENTS.push({ id: 'cook13_all', n: '旅店的常客', d: '九道料理全部做過一次。', cat: '探索', ok: st => DISH_KEYS13.every(k => ((st.cookSeen13 || {})[k])) });
{ const _c = Events.chef13; Events.chef13 = function* (...a) { const st = Game.st, before = { ...st.bag }; const r = yield* _c.apply(this, a); for (const k of DISH_KEYS13) if ((st.bag[k] || 0) > (before[k] || 0)) (st.cookSeen13 || (st.cookSeen13 = {}))[k] = 1; return r; }; }
GROW12.push(['料理', '萌芽鎮、王都、潮鳴港的旅店有廚師。拿魚和素材點數（木料・藥材・魔素）去做菜，在野外吃了以後，接下來幾場戰鬥會有加成（傷害、經驗值、會心、速度、回復……）。同時只能有一道菜。']);
