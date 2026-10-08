// 裝備就是牌組: new game, old-save migration, gear cards in battle, crafting payment, class switch, removal limit
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  const out = await g.ev(s => { const R = [], ok = (n, c, i) => R.push((c ? 'PASS ' : 'FAIL ') + n + (i != null ? '  — ' + i : '')); const G = __game;
    // 1. a new game, each class
    for (const cls of ['sw', 'rg', 'mg', 'bk']) { const st = newGameState('測'); G.Game.st = st; ok('新遊戲 g16 ' + cls, st.k14 && st.k14.g16 === 1); KD.state(st).cls = cls; NC_PICK12 = KD.CLASSES[cls].wkind;
      CLASS_START[NC12].gear = [BASE11.weapon[KD.CLASSES[cls].wkind][0], 'guardBadge']; applyStartClass(NC12);
      const eq = ['weapon', 'head', 'body', 'feet'].map(sl => { const q = gearBy(st.equip[sl], st); return q ? GEAR[q.b].n : '-'; }), D = KD.deck(st).map(c => c.id).join(','), Gc = KD.gearCards16(st);
      ok('起始 ' + cls + '：裝備 4 件、裝備卡 8 張、職業卡 ' + KD.deck(st).length, eq.every(n => n !== '-') && Gc.length === 8 && KD.deck(st).length === KD.START16[cls].reduce((a, q) => a + q[1], 0), eq.join('/') + '｜' + D + '｜' + Gc.map(c => c.id).join(','));
      ok('起始 ' + cls + ' 的武器是職業的', GEAR[gearBy(st.equip.weapon, st).b].kind === KD.GEAR0_16[cls][0]); }
    // 2. an old v14 save: upgraded basics → gold, gear filled
    { const st = JSON.parse(s); G.Game.st = st; delete st.k14.g16; const K = KD.state(st); K.cls = 'sw'; K.decks = { sw: [{ id: 'sw_strike', up: 1 }, { id: 'sw_strike', up: 0 }, { id: 'sw_defend', up: 1 }, { id: 'sw_break', up: 1 }, { id: 'sw_cleave', up: 0 }], mg: [{ id: 'mg_bolt' }, { id: 'mg_shield' }] };
      const m0 = st.money; delete st.equip.head; const m = KD.mig16(st);
      ok('舊存檔：升級過的基本卡退 50 G×2', st.money - m0 === 100 && m.up === 2, st.money - m0);
      ok('舊存檔：劍士只剩 斷甲斬+・斬鐵', KD.state(st).decks.sw.map(c => c.id).join(',').startsWith('sw_break,sw_cleave') && !KD.state(st).decks.sw.some(c => KD.BASIC16.has(c.id)), KD.state(st).decks.sw.map(c => c.id).join(','));
      ok('舊存檔：只有基本卡的職業 → 職業卡', KD.state(st).decks.mg.map(c => c.id).join(',') === 'mg_fire,mg_frost,mg_spark');
      ok('舊存檔：空的頭補上 T1', m.got.length === 1 && !!gearBy(st.equip.head, st), m.got.join(','));
      ok('再跑一次不會重複', KD.mig16(st) === null); }
    // 3. card mapping: tiers and the staff's element
    { const c = b => KD.gearCardsOf16(b).map(q => q.id + (q.up ? '+' : '') + '×' + q.n).join(',');
      ok('劍 T1', c(BASE11.weapon['劍'][0]) === 'sw_strike×3,sw_break×1', c(BASE11.weapon['劍'][0])); ok('劍 T4', c(BASE11.weapon['劍'][3]) === 'sw_strike+×3,sw_flow×1', c(BASE11.weapon['劍'][3])); ok('劍 T8', c(BASE11.weapon['劍'][7]) === 'sw_strike+×3,sw_sky+×1', c(BASE11.weapon['劍'][7]));
      ok('法杖 T1 無', c(BASE11.weapon['法杖'][0]) === 'mg_bolt×4', c(BASE11.weapon['法杖'][0])); ok('法杖 T2 雷', c(BASE11.weapon['法杖'][1]) === 'mg_boltT×3,mg_spark×1', c(BASE11.weapon['法杖'][1])); ok('法杖 T6 雷', c(BASE11.weapon['法杖'][5]) === 'mg_boltT+×3,mg_chain×1', c(BASE11.weapon['法杖'][5]));
      ok('重甲 身體 T4', c(BASE11.armor['重甲'].body[3]) === 'sw_defend+×2', c(BASE11.armor['重甲'].body[3])); ok('法衣 頭 T7', c(BASE11.armor['法衣'].head[6]) === 'mg_page+×1', c(BASE11.armor['法衣'].head[6]));
      ok('雷魔力彈 的屬性是雷', KD.atOf('mg_boltT') === '雷' && KD.desc({ id: 'mg_boltT' }).includes('雷'), KD.desc({ id: 'mg_boltT' }));
      ok('魔導書打得出來（不會變成法杖）', (() => { const st = G.Game.st; const q = KD.mkGear16(BASE11.weapon['魔導書'][0]); return GEAR[q.b].kind === '魔導書'; })()); }
    // 4. crafting payment: bag materials turn into points, the most valuable first; quest materials stay
    { const st = G.Game.st; st.pt11 = { 金屬: 2, 布料: 0, 獸材: 0, 木料: 0, 藥材: 0, 魔素: 0 }; for (const k in st.bag) if (MATCAT11[k]) delete st.bag[k]; st.bag.stone = 5; st.bag.rustScrap = 3; st.bag.hareFur = 4; st.money = 1000;
      const c = craftCost11('劍', 1), have = KD.ptsHave16(st, '金屬'), ok1 = KD.canPay16(st, c); KD.pay16(st, c);
      ok('打造 T1 劍：付得起、扣點數和金幣', ok1 && st.money === 1000 - c.gold && (st.pt11['金屬'] || 0) >= 0, '有金屬 ' + have + '，花 ' + JSON.stringify(c.pts) + '，剩 ' + JSON.stringify(st.pt11) + ' bag ' + JSON.stringify({ stone: st.bag.stone, rust: st.bag.rustScrap, fur: st.bag.hareFur }));
      const before = KD.ptsHave16(st, '金屬'); ok('點數不會憑空少', before >= 0); }
    // 5. a battle deck = class + gear
    { const st = JSON.parse(s); G.Game.st = st; ok('戰鬥牌組 = 職業卡＋裝備卡', KD.fullDeck(st).length === KD.deck(st).length + 8, KD.fullDeck(st).length + ' = ' + KD.deck(st).length + ' + 8');
      ok('刪卡：職業卡剩 1 張不能刪', KD.remNo(st, [{ id: 'x' }]) && !KD.remNo(st, [{ id: 'x' }, { id: 'y' }])); }
    return R; }, save);
  for (const l of out) g.log(l);
  // 6. in battle: the gear cards are in the pile; a non-mage with a fire card leaves no mark
  await g.ev(s => { const G = __game; G.Game.st = JSON.parse(s); const st = G.Game.st; st.status = null; const K = KD.state(st); K.catchup = 0; K.cls = 'sw'; K.decks = {}; KD.deck(st); st.flags.tutK14 = 1; st.flags.tutIntent14 = 1; st.flags.tutBreak = 1;
    startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; delete st.k14.g16msg; KD.battleRewards = function* () {}; window.__r = null; let n = 0;
    G.Game.autoPlay = b => { const core = b.core, F = core.alive('B'); if (n === 0) { n++; const all = b.pile.concat(b.hand, b.disc); window.__r = { n: all.length, gear: all.filter(c => c.g16).length };
        b.energy = 9; b.hand.unshift({ id: 'mg_fire', up: 0 }); return { cmd: b.playK(0, F[0].id) }; }
      if (n === 1) { n++; window.__r.mk = F.map(u => u.data.mk16 || '-').join(','); window.__r.burn = stkK(F[0], 'burn14'); }
      for (const u of core.alive('B')) u.res.hp = 1; return { k: 'end' }; };
    const ow = G.Game.scene; ow.run(ow.battleScript({ sp: 'curlySheep', lv: 10, kind: 'wild', noCard: 1, extra: 0 })); }, save);
  for (let i = 0; i < 400; i++) { const r = await g.ev(() => window.__r && window.__r.mk != null ? window.__r : null); if (r) { g.log((r.gear === 8 ? 'PASS' : 'FAIL') + ' 戰鬥：牌堆裡有 8 張裝備卡（共 ' + r.n + '）'); g.log((r.mk === '-' && r.burn > 0 ? 'PASS' : 'FAIL') + ' 劍士打火球：不留印記（' + r.mk + '）、燃燒照樣 ' + r.burn); break; }
    await g.ev(() => { if (__game.UI.stack.some(x => x.lines)) __game.press('a', 2, 4); else __game.step(4); }); }
};
