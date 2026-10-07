// v14.10 world/economy fixes
const fs = require('fs');
module.exports = async (g) => {
  const save = fs.readFileSync(process.env.SAVE, 'utf8');
  const out = [];
  const settle = async (max = 4000) => { await g.ev(() => { for (let k = 0; k < 6; k++) __game.step(1); }); for (let i = 0; i < max; i++) { const s = await g.ev(() => { const G = __game, ow = G.Game.scene; if (ow.constructor.name === 'Overworld' && !G.UI.stack.length && !ow.script) return 'ok';
      window.__ii = (window.__ii || 0) + 1; if (window.__ii % 3 === 0) G.press('right', 2, 2); else G.press('a', 2, 4); G.step(1); return 'w'; }); if (s === 'ok') return true; } return false; };
  // 1. migration of an old save
  out.push(await g.ev(s => { const G = __game; const st = JSON.parse(s); G.Game.st = st; st.status = null; const was = !!st.k14, m0 = st.money, eq0 = JSON.stringify(st.equip), lv = st.lv;
    const junk0 = Object.keys(st.bag).filter(k => KD.junkKind(k)).map(k => k + '×' + st.bag[k]);
    startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; const K = KD.state(st), eq = st.equip, worn = Object.keys(eq).filter(k => k !== 'weapon' && eq[k] != null);
    const hs = heroStats(st);
    return ['migrated(was k14 ' + was + ') lv ' + lv + ' pLv ' + KD.pLv(st) + ' money ' + m0 + '→' + st.money + ' migGold ' + K.migGold + ' cap ' + KD.MIG_CAP(st) + ' catchup ' + K.catchup,
      (worn.length ? 'FAIL' : 'PASS') + ' only the weapon stays worn: ' + eq0 + ' → ' + JSON.stringify(eq),
      (hs.healUp || hs.faWin || (hs.cr11P || []).length || Object.keys(hs.th9 || {}).length ? 'FAIL' : 'PASS') + ' old gear/attribute effects off: healUp ' + hs.healUp + ' faWin ' + hs.faWin,
      'junk kept for conversion: ' + junk0.join(',')].join('\n'); }, save));
  await settle(); // catch-up picks, junk script
  out.push(await g.ev(() => { const st = __game.Game.st, eq = st.equip; return 'worn after settle: ' + JSON.stringify(eq) + ' old ' + KD.state(st).old + ' | after settle: money ' + st.money + ' catchup ' + KD.state(st).catchup + ' deck ' + KD.deck(st).length + ' junk left ' + Object.keys(st.bag).filter(k => KD.junkKind(k)).join(','); }));
  // 2. junk conversion
  await g.ev(() => { const st = __game.Game.st; Object.assign(st.bag, { ether: 2, smoke: 1, powerFruit: 1, tpBook: 1 }); window.__j = { pot: st.bag.potion || 0, deck: KD.deck(st).length, up: KD.deck(st).filter(c => c.up).length, money: st.money }; });
  await settle();
  out.push(await g.ev(() => { const st = __game.Game.st, J = window.__j, dp = (st.bag.potion || 0) - J.pot, dd = KD.deck(st).length - J.deck, du = KD.deck(st).filter(c => c.up).length - J.up;
    return (dp === 3 && dd === 1 && du === 1 && st.money === J.money ? 'PASS' : 'FAIL') + ' junk: 活力茶×2+煙霧彈→傷藥 +' + dp + ', 果實→卡 +' + dd + ', 秘傳之書→升級 +' + du + ', money Δ' + (st.money - J.money); }));
  // 3. shops
  out.push(await g.ev(() => { const L = shopList().filter(KD.shopOk), bad = L.filter(k => GEAR[k] || ['mp', 'boost', 'tp', 'reset', 'escape'].includes(ITEMS[k].use));
    return (bad.length ? 'FAIL' : 'PASS') + ' village clerk list: ' + L.map(k => ITEMS[k].n).join('、'); }));
  await g.ev(() => { const ow = __game.Game.scene; window.__e = 0; ow.run((function* () { try { yield* shopBuy(['ether', 'hiEther']); } catch (e) { window.__e = e.message; } window.__done = 1; })()); });
  await settle();
  out.push(await g.ev(() => (window.__e ? 'FAIL ' + window.__e : window.__done ? 'PASS' : 'FAIL') + ' shop with nothing to sell: no crash'));
  await g.ev(() => { const ow = __game.Game.scene; window.__fog = 0; const f = KD.fogShop; KD.fogShop = function* () { window.__fog = 1; }; ow.run((function* () { yield* shopFlow(['trainBook', 'attrReset', 'talentReset']); KD.fogShop = f; })()); });
  await settle();
  out.push(await g.ev(() => (window.__fog ? 'PASS' : 'FAIL') + ' fog merchant sells cards'));
  // 4. potions
  out.push(await g.ev(() => { const st = __game.Game.st, mh = KD.maxHp(st); st.hp = 1; st.bag.potion = (st.bag.potion || 0) + 1; const msg = useItem('potion'), h = st.hp - 1;
    return (h === Math.round(mh * 0.25) ? 'PASS' : 'FAIL') + ' 傷藥 heals ' + h + ' of ' + mh + ' (25%); prices 傷藥 ' + ITEMS.potion.price + ' 好傷藥 ' + ITEMS.superPotion.price + ' 特級 ' + ITEMS.megaPotion.price + ' 萬靈藥 ' + ITEMS.elixir.price + ' gW ' + KD.gW(KD.pLv(st)) + ' | ' + ITEMS.potion.d; }));
  // 5. workshop materials
  out.push(await g.ev(() => { const st = __game.Game.st, M = KD.mats(st), bad = M.filter(k => ITEMS[k].key || ITEMS[k].cat === '魚' || KD.MAT_NO.has(k));
    return (bad.length ? 'FAIL' : 'PASS') + ' workshop mats (' + M.length + '): no key items/fish/shards; parts: ' + M.filter(k => /^pt_/.test(k)).length + ' | upPrice ' + KD.upPrice(st) + ' removePrice ' + KD.removePrice(st) + ' card C/U/R ' + KD.price('C') + '/' + KD.price('U') + '/' + KD.price('R'); }));
  // 6. orphan gear from the first kill of an elite / boss with parts
  out.push(await g.ev(() => { const st = __game.Game.st, sp = Object.keys(PARTS11).find(s => !(st.kills || {})[s] && SPECIES[s]); if (!sp) return 'SKIP no unkilled part monster'; const n0 = (st.gear || []).length;
    const r = lootDrops({ F: { elite: 1, sp, n: sp }, cfg: { id: sp, kind: 'elite' } }); return ((st.gear || []).length - n0 === r.length ? 'PASS' : 'FAIL') + ' first kill of ' + sp + ': returned ' + r.length + ', gear +' + ((st.gear || []).length - n0); }));
  // 7. achievement gold, crystals
  out.push(await g.ev(() => { const st = __game.Game.st; return 'achievement gold ' + KD.achGold(st) + ' | crystal give → ' + cryGive11(Object.keys(CRY11)[0], st); }));
  g.log(out.join('\n'));
};
