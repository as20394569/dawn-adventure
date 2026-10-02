/* ===================== v12 取代寶珠與附魔石的獎勵（草案 §7.5，玩家 2026-10-01 同意） =====================
   精英／頭目：原本掉寶珠的改成同機率掉修練之書（精英 30%、頭目 45%）；原本的附魔石改成藥水（頭目必得特級傷藥或特級魔力藥水，
   精英 40% 好傷藥或高級魔力藥水），野外與天氣魔物的附魔石拿掉。委託、NPC 的禮物、天氣祠、擴張區寶箱見 docs_design_log v12.0.1。
   舊存檔：寶珠、附魔、附魔石換成修練之書和金錢（v12Convert）。 */
// a gift of one piece of gear (story rewards use quality 3, 稀有)
function* giftGear12(k, q = 3) { if (!GEAR[k]) return; const g = makeGear(k, q); Sound.jingle('item'); yield* itemGet('得到了' + gearName(g) + '！'); }
// 老兵杜克的部隊徽章（不屈）: same tier and numbers as 湖神鱗片, the other tier-5 不屈 accessory
GEAR.troopBadge = { n: '部隊徽章', slot: 'acc', t: 5, st: { ...GEAR.qLakeScale.st }, sp: {}, fx: ['endure'], trait: 'endure', kind: '飾品', d: '老兵杜克的部隊徽章，背面刻著「不屈」。帶著它，連同他們的份一起活下去。' };
ACC_TRAIT.endure[2].push('部隊徽章');

/* ---------- battle drops ---------- */
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () {
    const r = yield* _v.call(this); const st = Game.st, F = this.F, sp = this.cfg && this.cfg.sp; if (!st || !sp) return r;
    const boss = this.kind === 'boss' || !!(F && F.boss), elite = !boss && (this.kind === 'elite' || !!(F && F.elite));
    if ((boss || elite) && BOOK_DROP12.includes(sp) && chance(boss ? 0.45 : 0.3)) { st.bag.trainBook = (st.bag.trainBook || 0) + 1; Sound.jingle('item'); yield* this.msg('得到了修練之書！', { hold: 40 }); }
    const k = this.cfg && this.cfg.rematch ? null : boss ? pick(['megaPotion', 'megaEther']) : elite && chance(0.4) ? pick(['superPotion', 'hiEther']) : null; // v12.0.1 (player: 「頭目跟菁英…可以重複刷取 導致藥水變得很好拿」): rematches give no potions
    if (k && ITEMS[k]) { st.bag[k] = (st.bag[k] || 0) + 1; yield* this.msg('得到了' + ITEMS[k].n + '！', { hold: 30 }); }
    return r; }; }
// the monster info card lists them
{ const _fd = foeDropLines; foeDropLines = function (sp, key, kind) { const L = _fd(sp, key, kind); if (BOOK_DROP12.includes(sp)) L.unshift('修練之書（機率 ' + (kind === 'boss' ? 45 : 30) + '%）');
    L.push(kind === 'boss' ? '特級傷藥或特級魔力藥水（第一次打倒必得）' : '好傷藥或高級魔力藥水（第一次打倒 40%）'); return L; }; }

/* ---------- requests: 藥草告急・魔力草研究・爺爺的藥・鐵匠的礦石・小芽的收藏 → 修練之書；森林的毒菇 → 藥草香囊 ---------- */
for (const c of ['c1', 'c6', 'c9', 'c14', 'c15']) if (COMMISSIONS[c]) COMMISSIONS[c].reward.items = { ...(COMMISSIONS[c].reward.items || {}), trainBook: 1 };
if (COMMISSIONS.c7) COMMISSIONS.c7.reward.gear = 'herbPouch';
{ const _gr = giveReward; giveReward = function* (rw) { const r = yield* _gr(rw); if (rw && rw.gear) yield* giftGear12(rw.gear, 2); return r; }; }

/* ---------- the chief, after the adventurer's license: how skills work now (was: the first orb) ---------- */
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    const st = this.st; if (st && st.v10 && st.flags.license && !st.flags.orbStart && !this.script && !UI.stack.length && !Game.trans) { st.flags.orbStart = 1;
      this.run((function* () { yield* sayAll(['村長：「對了，戰鬥的招式跟你說一下。」', '村長：「招式有兩種。一種是職業的技能，等級到了自然就會。另一種是武器上的技能，拿著那把武器就能用，用得夠多次就會變成你自己的。」', '村長：「打開選單的「技能編排」，就能決定戰鬥中要帶哪些技能。」']); })()); return; }
    return _u.apply(this, a); }; }

/* ---------- old saves: orbs, enchants and enchant stones become 修練之書 and gold (draft §10) ---------- */
function v12Convert(st) {
  if (!st || !st.flags || st.flags.v12conv) return []; st.flags.v12conv = 1;
  let books = 0, gold = 0, refund = 0, stones = 0; const orbs = st.orbs || [];
  for (const o of orbs) { if (ORB_A[o.k]) books++; else if (ORB_P[o.k]) gold += [0, 300, 600, 1000][clamp(o.lv || 1, 1, 3)]; }
  st.orbs = [];
  for (const g of st.gear || []) { if (g.o) delete g.o; if (g.en) { refund += 300 * ((GEAR[g.b] && GEAR[g.b].t) || 1) * (g.en.lv || 1); delete g.en; } }
  for (const k of Object.keys(st.bag || {})) { const it = ITEMS[k]; if (it && it.use === 'enchant') { const n = st.bag[k] || 0; stones += n; gold += n * (it.en[1] >= 2 ? 500 : 200); delete st.bag[k]; } }
  if (books) st.bag.trainBook = (st.bag.trainBook || 0) + books; st.money = (st.money || 0) + gold + refund;
  if (!orbs.length && !refund && !stones) return [];
  const L = ['寶珠和附魔都取消了，持有的東西已經換掉：'];
  if (books) L.push('技能寶珠 → 修練之書×' + books + '（選一個已學會的技能，進化進度 +12）。');
  if (gold) L.push('被動寶珠和附魔石 → ' + gold + ' G。');
  if (refund) L.push('武器上的附魔已經移除，退回附魔費用 ' + refund + ' G。');
  return L;
}
