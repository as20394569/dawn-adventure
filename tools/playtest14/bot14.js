// v14 card-game additions to the playtest bot: card picks, shop / removal / workshop like a careful player, no RPG gear or trees
(() => { const B = window.BOT, G = __game, Gm = G.Game;
  B.noSmith = true; B.noLearn = true; Gm.autoPlay = () => null;
  const K = B.k14 = { picks: 0, skips: 0, bought: 0, removed: 0, upgraded: 0, gold: 0, offers: [], hpLog: [] };
  const RW = { C: 1, U: 2.2, R: 3.5, L: 5, Q: 4 };
  const typ = id => KD.CARDS[id].type;
  B.choose = (ids, o = {}) => { const st = Gm.st, D = KD.deck(st), nA = D.filter(c => typ(c.id) === 'atk').length, nP = D.filter(c => typ(c.id) === 'pow').length; let best = null, bv = -9;
    for (const id of ids) { const C = KD.CARDS[id]; let v = RW[C.rar] || 1; if (C.type === 'atk' && nA < D.length * 0.5) v += 0.6; if (C.tg === 'all') v += 0.3; if (C.type === 'pow' && nP >= 3) v -= 1.5; if (C.cls === 'nt') v -= 0.2; if (v > bv) { bv = v; best = id; } }
    if (!o.noSkip && ((D.length >= 22 && bv < 2.5) || (D.length >= 32 && bv < 3.5))) { K.skips++; return null; } K.picks++; return best; };
  KD.pick3 = function* (ids, title, o = {}) { yield; const r = B.choose(ids, o); K.offers.push(ids.map(i => KD.CARDS[i].rar).join('')); B.lg('卡｜' + title + '｜' + ids.map(i => KD.CARDS[i].n).join('/') + ' → ' + (r ? KD.CARDS[r].n : '跳過') + '（牌組 ' + KD.deck(Gm.st).length + '）'); return r; };
  // the deck manager: in a town, once per visit — remove a basic card, buy the best card it can afford (keeps a reserve), upgrade one card
  B.manage = () => { const st = Gm.st; if (!st || !st.k14 || !['town', 'shop', 'capital', 'capShop', 'frostVillage', 'frostShop', 'harbor13', 'seaShop13', 'shellShop14', 'smithy', 'armory'].includes(st.map)) return; const key = st.map + ':' + KD.bossN(st) + ':' + Math.floor(st.money / 400); if (B.mKey === key) return; B.mKey = key;
    const D = KD.deck(st), reserve = Math.round(KD.gW(st.lv || 1) * 1.5);
    const rp = KD.removePrice(st), weak = D.filter(c => KD.CARDS[c.id].rar === 'B' && !c.up && /strike|stab|bolt|chop|defend|shield/.test(c.id));
    if (D.length > 12 && weak.length > 2 && st.money - rp > reserve) { const strikes = weak.filter(c => KD.CARDS[c.id].type === 'atk'), c = (strikes.length > 3 ? strikes : weak)[0]; D.splice(D.indexOf(c), 1); st.money -= rp; st.k14.rem = (st.k14.rem || 0) + 1; K.removed++; B.lg('刪卡：' + KD.name(c) + '（' + rp + ' G，剩 ' + st.money + '）'); }
    try { const S = KD.shopStock(st), L = S.ids.map((id, i) => ({ id, i })).filter(q => !S.sold.includes(q.i)).sort((a, b) => (RW[KD.CARDS[b.id].rar] || 1) - (RW[KD.CARDS[a.id].rar] || 1));
      for (const q of L) { const p = KD.price(KD.CARDS[q.id].rar); if (KD.CARDS[q.id].rar === 'C' || st.money - p < reserve) continue; st.money -= p; S.sold.push(q.i); KD.addCard(st, { id: q.id }); K.bought++; B.lg('買卡：' + KD.CARDS[q.id].n + '（' + p + ' G，剩 ' + st.money + '）'); break; } } catch (e) { B.lg('shop err ' + e.message); }
    const up = KD.upPrice(st), M = KD.mats(st), m = M[0]; if (m && st.bag[m] >= 2 && st.money - up > reserve) { const L = KD.sorted(D).filter(KD.canUp).sort((a, b) => (RW[KD.CARDS[b.id].rar] || 0) - (RW[KD.CARDS[a.id].rar] || 0)); const c = L[0];
      if (c) { st.money -= up; st.bag[m] -= 2; if (!st.bag[m]) delete st.bag[m]; c.up = 1; st.k14.upN = (st.k14.upN || 0) + 1; K.upgraded++; B.lg('升級：' + KD.name(c) + '（' + up + ' G＋' + ITEMS[m].n + '×2）'); } } };
  // battle results with HP (how hard each fight was)
  { const _v = Battle.prototype.victory; Battle.prototype.victory = function* (...a) { const H = this.core && this.core.byId.H, cfg = this.cfg || {}; if (H) K.hpLog.push((cfg.kind || 'wild') + ':' + (cfg.id || '') + ':' + H.res.hp + '/' + H.max.hp + ':R' + this.core.round);
      if (cfg.kind === 'boss' || cfg.kind === 'elite') B.lg('勝利 ' + (cfg.kind) + ' ' + (cfg.id || '') + ' HP ' + (H ? H.res.hp + '/' + H.max.hp : '?') + ' 回合 ' + (this.core ? this.core.round : '?') + '（牌組 ' + KD.deck(Gm.st).length + '）'); return yield* _v.apply(this, a); }; }
  { const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg = {}, ...a) { if (cfg.kind === 'boss' || cfg.kind === 'elite') (K.snap = K.snap || []).push({ kind: cfg.kind, id: cfg.id || cfg.sp, sp: cfg.sp, lv: cfg.lv, map: Gm.st.map, hp: Gm.st.hp, mh: KD.maxHp(Gm.st), hpPlus: Gm.st.k14.hpPlus, cls: Gm.st.k14.cls, deck: KD.deck(Gm.st).map(c => c.id + (c.up ? '+' : '')) });
    const hp0 = Gm.st.hp, mh = KD.maxHp(Gm.st), grp = (cfg.sp || cfg.id || '') + (cfg.extra ? '+' + cfg.extra.map(e => e[0]).join('+') : '') + ' Lv' + (cfg.lv || '?'); const r = yield* _bs.call(this, cfg, ...a); K.hpLog.push([cfg.kind || 'wild', grp, hp0, Gm.st.hp, mh, r].join(':')); if (r && r !== 'win') B.lg('戰敗／逃走 ' + (cfg.kind || 'wild') + ' ' + grp + ' → ' + r + '（開戰 HP ' + hp0 + '/' + mh + '，牌組 ' + KD.deck(Gm.st).length + '）'); return r; }; }
})();
