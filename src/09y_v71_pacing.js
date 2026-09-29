/* ===================== v7.1 pacing & economy (player feedback after v7.0) =====================
   Feedback: levelling was so fast that players only rushed the bosses; home was so close that nobody bought potions;
   fruits were cheap and only covered three attributes; gold was useless late; quests felt optional; after the first drop
   nobody needed a second copy of a piece of gear.
   · EXP −40%; attribute points 1 per level (was 2, 08o); talent points every 2 levels (09m).
   · No automatic recovery after battles (07_battle); resting costs money (home 伙食費, inns ×1.5, the church asks a
     donation), the roadside spring only restores half; potions are cheaper.
   · Six fruits (體力・敏捷・靈巧 added), 3000 G each, +1500 G for every fruit bought (04_data / 05_ui).
   · Gold sinks: enhancement up to +10 (04b), 升星 with 精煉石, quality reforging.
   · Every commission also gives an exclusive reward: a quest-only accessory design, a fruit or a talent book.
   · A second drop of a design you already know becomes 精煉石 for that item: the smith raises its star (★1–★5, +6% each). */

BALANCE.exp = 0.3; // was 0.5

/* ---------- consumables & fruits ---------- */
Object.assign(ITEMS.potion, { price: 50 }); Object.assign(ITEMS.superPotion, { price: 200 }); Object.assign(ITEMS.ether, { price: 180 }); Object.assign(ITEMS.hiEther, { price: 450 });
if (ITEMS.megaPotion) ITEMS.megaPotion.price = 600;
Object.assign(ITEMS, {
  vitFruit: { n: '體力果實', price: 3000, sell: 500, use: 'boost', v: { vit: 1 }, cat: ITEMS.powerFruit.cat },
  agiFruit: { n: '迅捷果實', price: 3000, sell: 500, use: 'boost', v: { agi: 1 }, cat: ITEMS.powerFruit.cat },
  dexFruit: { n: '靈巧果實', price: 3000, sell: 500, use: 'boost', v: { dex: 1 }, cat: ITEMS.powerFruit.cat },
});
for (const [k, nm] of [['powerFruit', '力量'], ['wisdomFruit', '智力'], ['luckClover', '幸運'], ['vitFruit', '體力'], ['agiFruit', '敏捷'], ['dexFruit', '靈巧']]) {
  const it = ITEMS[k]; it.price = 3000; it.d = (k === 'luckClover' ? '四片葉子的幸運草。使用後' : '神奇的果實。吃下後') + nm + '永久+1。（每買一顆，所有果實都會漲價1500 G；果實加成上限：每5級+1）';
}
for (const L of [PEDDLER_LIST, WITCH_SHOP, CAP_SHOP]) for (const k of ['vitFruit', 'agiFruit', 'dexFruit', 'wisdomFruit', 'luckClover']) if (!L.includes(k)) L.push(k);
for (const k of ['vitFruit', 'agiFruit', 'dexFruit']) { if (!MERCHANT_POOL.includes(k)) MERCHANT_POOL.push(k); if (!AEV_TREASURE.includes(k)) AEV_TREASURE.push(k); }
TOWER_SHOP.push(['vitFruit', 8], ['agiFruit', 8], ['dexFruit', 8]);

/* ---------- resting costs money ---------- */
const restCost = (st = Game.st, per = 8) => Math.max(10, st.lv * per);
function* paidRest(text, per, respawn, heal = true) {
  const st = Game.st, c = restCost(st, per), pay = Math.min(c, st.money);
  if (!(yield* yesNo(text + '（' + c + ' G）'))) return false;
  if (pay < c) yield* say('錢不太夠……先付' + pay + ' G吧。');
  st.money -= pay; if (respawn) st.respawn = respawn; if (heal) yield* healRitual(); return true;
}
{ const _mom = Events.mom; Events.mom = function* (ow) {
    const st = Game.st; if (!st.flags.license) return yield* _mom(ow);
    if ((st.flags.golem && !st.flags.momEnd) || !st.flags.momAfter) { const _hr = healRitual; healRitual = function* () { }; try { yield* _mom(ow); } finally { healRitual = _hr; } }
    else yield* say('歡迎回來！要吃晚飯嗎？');
    if (yield* paidRest('要吃飯休息嗎？伙食費', 8, { map: 'home', x: 6, y: 5, dir: 'up' })) yield* say(st.name + '的體力完全恢復了！'); else yield* say('路上小心喔。');
  };
}
Events.bed = function* () { if (yield* paidRest('要在床上休息嗎？伙食費', 8, { map: 'home', x: 1, y: 4, dir: 'up' })) yield* say('睡得好飽！體力完全恢復了！'); };
Events.spring = function* () {
  if (!(yield* yesNo('清澈的泉水閃閃發亮……要喝一口嗎？'))) return; const st = Game.st, s = heroStats();
  st.respawn = { map: 'route', x: 7, y: 4, dir: 'left' }; yield* fadeOut(8); st.hp = Math.max(st.hp, Math.ceil(s.hp / 2)); st.mp = Math.max(st.mp ?? 0, Math.ceil(s.mp / 2)); Sound.jingle('heal'); yield* wait(30); yield* fadeIn(8);
  yield* say('好甜的泉水！體力恢復到一半了。');
};
if (Events.priest) { const _pr = Events.priest; Events.priest = function* (ow) {
    const _yn = yesNo; let asked = false; yesNo = function* (t, o) { if (!asked && t.startsWith('要接受祝福')) { asked = true; yesNo = _yn; const st = Game.st, c = restCost(st, 10); if (!(yield* _yn('要接受祝福（恢復HP、MP並記錄）嗎？\n（奉獻' + c + ' G）', o))) return false; st.money -= Math.min(c, st.money); return true; } return yield* _yn(t, o); };
    try { return yield* _pr(ow); } finally { yesNo = _yn; }
  };
}

/* ---------- quest-only accessories + exclusive commission rewards ---------- */
const QUEST_GEAR = {
  qTravelCharm: ['旅人護符', 1, { hp: 6, def: 1 }, {}, ['guardHeal'], '寄信的謝禮。讓人想起回家的路。'],
  qHerbPouch: ['藥師香囊', 2, { hp: 10, spd: 2 }, {}, ['regen'], '裝滿藥草的香囊，聞了就覺得傷口不痛了。'],
  qHunterEye: ['獵人之眼', 3, { spe: 2 }, { crit: 6 }, ['first'], '老練獵人傳下來的琥珀墜飾。'],
  qMinerLamp: ['礦工的提燈', 3, { def: 4 }, { hit: 6 }, ['pierce'], '照亮坑道每一道縫隙的提燈。'],
  qScholarLens: ['學者的單片眼鏡', 4, { spa: 6, spd: 4 }, {}, ['freeCast'], '看得見魔力流動的古董眼鏡。'],
  qGraveBell: ['鎮魂鈴', 4, { hp: 12, spd: 6 }, {}, ['endure'], '讓亡魂安息的小鈴鐺。'],
  qLakeScale: ['湖神鱗片', 5, { hp: 18, def: 4 }, {}, ['thorns'], '銀月湖守護神脫落的鱗片。'],
  qDesertRose: ['沙漠玫瑰', 5, { atk: 6, spe: 3 }, {}, ['double'], '只在砂漠深處綻放的石之花。'],
  qGuildSeal: ['公會的印信', 6, { hp: 15, atk: 5, spa: 5 }, {}, ['fervor'], '冒險者公會認可的證明。'],
  qSnowFang: ['雪狼之牙', 6, { atk: 8 }, { crit: 5 }, ['lastStand'], '雪原狼王的獠牙，握著就熱血沸騰。'],
  qStarCompass: ['星之羅盤', 7, { spe: 6, spa: 6, spd: 5 }, {}, ['fortune'], '指針永遠指向星墜之地。'],
  qHeroCrest: ['冒險王之證', 7, { hp: 25, atk: 6, spa: 6, def: 4, spd: 4 }, {}, ['deathWard'], '公會最高的榮譽。'],
};
for (const k in QUEST_GEAR) { const [n, t, s, sp, fx, d] = QUEST_GEAR[k]; GEAR[k] = { n, slot: 'acc', t, st: s, sp, fx, d: d + '（委託的獨家報酬）', kind: '飾品' }; BP_RARE.add(k);
  const P = TIER_POOL[t], h = hashK(k); GEAR_RECIPE[k] = { mats: { [P[h % P.length]]: 2 + Math.floor(t / 2), [TIER_POOL[Math.max(1, t - 1)][(h >>> 4) % TIER_POOL[Math.max(1, t - 1)].length]]: 1 + Math.floor(t / 3) }, gold: Math.round(bpGold(t) * 0.9 / 10) * 10 }; }
const COM_EX = {
  c13: { bp: 'qTravelCharm' }, c1: { items: { vitFruit: 1 } }, c14: { bp: 'qHerbPouch' }, c15: { items: { agiFruit: 1 } }, c2: { items: { dexFruit: 1 } }, c3: { items: { vitFruit: 1 } },
  c5: { items: { agiFruit: 1 } }, c6: { items: { wisdomFruit: 1 } }, c7: { bp: 'qHunterEye' }, c8: { items: { dexFruit: 1 } }, c9: { items: { powerFruit: 1 } }, c10: { bp: 'qMinerLamp' },
  c11: { bp: 'qScholarLens' }, c12: { bp: 'qGraveBell' }, c16: { items: { vitFruit: 1 } }, c17: { bp: 'qLakeScale' }, c18: { items: { dexFruit: 1 } }, c19: { bp: 'qDesertRose' },
  c20: { items: { agiFruit: 1 } }, c21: { items: { tpBook: 1 } }, c22: { items: { vitFruit: 1 } }, c23: { bp: 'qGuildSeal' }, c24: { items: { tpBook: 1 } }, c25: { items: { powerFruit: 1 } },
  c26: { items: { agiFruit: 1 } }, c27: { items: { wisdomFruit: 1 } }, c28: { items: { dexFruit: 1 } }, c29: { bp: 'qSnowFang' }, c30: { items: { vitFruit: 1 } }, c31: { items: { luckClover: 1 } },
  c32: { items: { tpBook: 1 } }, c33: { items: { powerFruit: 1 } }, c34: { bp: 'qStarCompass' }, c35: { bp: 'qHeroCrest' }, c4: { items: { luckClover: 1 } },
};
for (const k in COM_EX) { const c = COMMISSIONS[k]; if (!c) continue; const E = COM_EX[k]; c.reward = { ...c.reward, items: { ...(c.reward.items || {}), ...(E.items || {}) } }; if (E.bp) c.reward.bp = E.bp; c.reward.ex = 1; }
{ const _rt = rewardText; rewardText = function (r) { const t = _rt(r); return r && r.bp ? (t ? t + '、' : '') + '【獨家】' + GEAR[r.bp].n + '的設計圖' : t; }; }
{ const _gr = giveReward; giveReward = function* (r) {
    const bp = r && r.bp; if (!bp) return yield* _gr(r);
    yield* _gr({ ...r, bp: undefined }); gainBP(bp, 1); Sound.jingle('item'); yield* itemGet('獲得了獨家報酬「' + GEAR[bp].n + '」的設計圖！（只有這個委託拿得到）');
  };
}

/* ---------- duplicate drops → 精煉石 → 升星 ---------- */
const STAR_MAX = 5, starStones = s => s + 1, starGold = (g, s) => 500 * GEAR[g.b].t * (s + 1);
{ const _ls = Battle.prototype.lootShow; Battle.prototype.lootShow = function* (g, head) {
    const st = Game.st; if (!g || !GEAR[g.b] || !bpKnown(g.b, st) || (g.q || 1) < 2) return yield* _ls.call(this, g, head);
    st.gear = (st.gear || []).filter(x => x !== g); const n = g.q >= 5 ? 3 : g.q >= 4 ? 2 : 1, R = st.refine || (st.refine = {}); R[g.b] = (R[g.b] || 0) + n;
    Sound.sfx('item'); yield* this.msg('得到了「' + GEAR[g.b].n + '」的精煉石×' + n + '！（持有' + R[g.b] + '）', { hold: 30 });
    if (!st.flags.starTut) { st.flags.starTut = 1; yield* this.msg('（精煉石拿去給鐵匠，可以讓同名的裝備「升星」變強。）', { wait: true }); }
  };
}
function* starFlow() {
  const st = Game.st, R = st.refine || (st.refine = {});
  while (true) {
    const g = yield* gearPicker('升星（精煉石）', () => gearSort().filter(q => (q.s || 0) < STAR_MAX && (R[q.b] || 0) > 0), (x, g, Y) => { const s = g.s || 0, need = starStones(s), c = starGold(g, s);
      Font.draw(x, '★' + s + ' → ★' + (s + 1) + '　能力+6%', 12, Y, UIC.accent, UIC.textSh, 11); Font.draw(x, '精煉石 ' + (R[g.b] || 0) + ' / ' + need, 12, Y + 13, (R[g.b] || 0) >= need ? UIC.good : UIC.bad, UIC.textSh, 10); Font.drawR(x, c + ' G', 164, Y + 26, st.money >= c ? UIC.warm : UIC.bad, UIC.textSh, 11); });
    if (!g) return; const s = g.s || 0, need = starStones(s), c = starGold(g, s);
    if ((R[g.b] || 0) < need || st.money < c) { yield* say('精煉石或金錢不夠喔。（再打倒掉落這件裝備的魔物，就能拿到精煉石）'); continue; }
    if (!(yield* yesNo('要讓' + gearShort(g) + '升星嗎？\n（精煉石×' + need + '、' + c + ' G，一定成功）'))) continue;
    R[g.b] -= need; st.money -= c; g.s = s + 1; clampHP(); Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); Sound.jingle('levelup'); yield* say('升星成功！' + gearName(g) + '！');
  }
}
{ const _ef = enhanceFlow; enhanceFlow = function* () {
    const r = yield* ask('要做什麼？', ['強化（最高+10）', '升星（精煉石）', '取消']); if (r === 0) return yield* _ef(); if (r === 1) return yield* starFlow();
  };
}
// the bag's material tab also lists the stones (read-only)
{ const _gi = gearInfoLines; gearInfoLines = function (g, w = 150) { const L = _gi(g, w), n = (Game.st && Game.st.refine || {})[g.b] || 0; if (g.s || n) L.splice(1, 0, ['★' + (g.s || 0) + '／' + STAR_MAX + '　精煉石' + n + '顆', '#ffd860', 10, 0]); return L; }; }

/* ---------- saves ---------- */
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.balV = 1; st.refine = {}; } return st; }; }
function v71Migrate(st) {
  if (!st || (st.balV || 0) >= 1) return false; st.balV = 1; let note = [];
  if (st.attr) { for (const k in st.attr) st.attr[k] = Math.floor(st.attr[k] / 2); for (let g = 0; g < 200 && attrAvail(st) < 0; g++) { const k = Object.keys(st.attr).sort((a, b) => st.attr[b] - st.attr[a])[0]; if (!k || !st.attr[k]) break; st.attr[k]--; } note.push('屬性點改成每級1點，原本的分配減半了'); }
  if (st.cls && tpSpent(st) > tpTotal(st)) { st.ct = {}; note.push('天賦點改成每2級1點，天賦已經全部退回'); }
  st.v71note = note.join('；') || 1; return true;
}
{ const _so = startOverworld; startOverworld = function (...a) {
    v71Migrate(Game.st); const ow = _so.apply(this, a), st = Game.st;
    if (st && st.v71note && st.cls && ow && ow.run) { const n = st.v71note; delete st.v71note; ow.run((function* () { yield* wait(40);
      yield* say('【v7.1 節奏調整】升級變慢了，戰鬥後也不會自動回復，回家和住宿都要付錢；傷藥降價了。' + (typeof n === 'string' ? '\n' + n + '。' : ''));
      yield* say('委託會給獨家報酬；重複打倒頭目拿到的裝備會變成「精煉石」，可以在鐵匠讓裝備升星。強化最高到+10。'); })()); }
    else if (st) delete st.v71note;
    clampHP(); return ow;
  };
}
// the encounter card: a known design dropping again now gives 精煉石
{ const _lh = lootHint; lootHint = function (key, sp) { const t = _lh(key, sp); return typeof t === 'string' ? t.replace('設計圖／打造券', '設計圖／精煉石') : t; }; }
// catalogue entries for the v25 smithy (map type, the forge / anvil props)
if (MAPS.smithy) { MAP_TYPES.smithy = '室內'; MAPS.smithy.type = '室內'; }
(NPC_ROLES.情報 || (NPC_ROLES.情報 = [])).push('smForgeL', 'smForgeR', 'smAnvil', 'smTub', 'smRackA', 'smRackB');
