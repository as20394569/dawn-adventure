/* ===================== v12.117 主角先動（玩家 2026-10-11：「我的回合結束後怪物才輪到怪物回合，不管有什麼增益什麼狀態
   都應該是要等我結束 除了反擊這些比較特殊的 不然傷害計算會有問題」） =====================
   每一回合：主角那一邊（主角、同伴）先全部行動完，魔物才照原本的規則（搶先 → 速度 → 延後）輪流行動。
   速度、搶先、延後只在同一邊裡面排順序；反擊、追擊、砲台這類「被觸發的」照舊在當下發生。 */
{ const P = BattleCore.prototype;
  const heroSide = core => { const h = core.units.find(u => u.hero); return h ? h.side : null; };
  P.buildOrder = function () {
    const roll = {}, ups = this.units.filter(u => this.isUp(u)); for (const u of ups) roll[u.id] = this.rng.next();
    const front = u => this.planPrio(u) + (this.hasStatus(u, 'first_next') ? 10 : 0) + (this.round === 1 && u.mods.some(m => m.firstRoundPrio) ? 5 : 0) - (this.hasStatus(u, 'delay') ? 10 : 0);
    const sp = {}; for (const u of ups) sp[u.id] = BR.speed(this, u); const hs = heroSide(this), mine = u => (u.side === hs ? 1 : 0);
    ups.sort((a, b) => mine(b) - mine(a) || front(b) - front(a) || sp[b.id] - sp[a.id] || roll[a.id] - roll[b.id] || (a.id < b.id ? -1 : 1));
    const order = ups.map(u => ({ id: u.id }));
    for (const u of ups) for (const s of u.statuses) { const D = DEF.statuses[s.id]; if (D.extraEvery && this.round % D.extraEvery === 0) order.push({ id: u.id, extra: s.id }); }
    this.order = order; this.orderPos = {}; order.forEach((e, i) => { if (this.orderPos[e.id] == null) this.orderPos[e.id] = i; });
    this.emit(EVT.TURN_ORDER, { payload: { round: this.round, order: order.map(e => e.id), extra: order.filter(e => e.extra).map(e => e.id) } });
    for (const u of ups) for (const k of ['first_next', 'delay', 'prio_used']) if (this.hasStatus(u, k)) this.removeStatus(u, k, 'used'); };
  P.previewOrder = function () { const ups = this.units.filter(u => this.isUp(u)), sp = {}; for (const u of ups) sp[u.id] = BR.speed(this, u); const hs = heroSide(this), mine = u => (u.side === hs ? 1 : 0);
    const front = u => this.planPrio(u) + (this.hasStatus(u, 'first_next') ? 10 : 0) + ((this.round || 1) === 1 && u.mods.some(m => m.firstRoundPrio) ? 5 : 0) - (this.hasStatus(u, 'delay') ? 10 : 0);
    return ups.sort((a, b) => mine(b) - mine(a) || front(b) - front(a) || sp[b.id] - sp[a.id] || (a.hero ? -1 : b.hero ? 1 : a.id < b.id ? -1 : 1)).map(u => u.id); };
}
