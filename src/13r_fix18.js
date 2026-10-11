/* ===================== v12.125 荊棘魔花回報的三個問題（其實每隻魔物都會） =====================
   玩家 2026-10-11：「荊棘魔花有BUG」→ 選了：大招放出來時寫「蓄力繼續」（改在 10zzz_v12_s5_ward.js）・睡眠花粉跳兩句失敗・頭上圖示跟實際出招不對。
   1. 頭上的圖示：引擎跑在畫面前面——畫面還在演第 N 回合時，引擎已經排好第 N+1 回合要做的事，頭上畫的是下一回合的。
      → 每回合排好的計畫存起來，頭上畫「畫面正在演的那一回合」的計畫；這回合已經出過手的魔物就不畫；開場偷襲（第 0 回合）不畫。
   2. 沒打中的招：「○○的攻擊沒有打中！」之後又跳「但是失敗了！」→ 同一次行動已經說過沒打中，就不再說失敗。 */
{ const P = BattleCore.prototype, _pr = P.planRound; P.planRound = function () { const r = _pr.apply(this, arguments); (this.planHist18 || (this.planHist18 = {}))[this.round] = { ...this.plan }; return r; }; }
{ const _in = KB12.intents; KB12.intents = function (x) { const core = this.core; if (!core || !core.planHist18) return _in.call(this, x);
    const snap = this.round >= 1 ? core.planHist18[this.round] : {}, real = core.plan, show = {}, A = this.acted18 || {};
    for (const k in snap || {}) if (A[k] !== this.round) show[k] = snap[k];
    core.plan = snap ? show : real; try { return _in.call(this, x); } finally { core.plan = real; } }; }
{ const H = Battle.prototype.handlers, _as = H.ACTION_START, _mi = H.MISS, _sf = H.SKILL_FAIL;
  H.ACTION_START = function* (e, s, t, P) { this.miss18 = 0; if (s && !s.hero) (this.acted18 || (this.acted18 = {}))[s.id] = this.round; return yield* _as.call(this, e, s, t, P); };
  H.MISS = function* (e, s, t, P) { this.miss18 = 1; return yield* _mi.call(this, e, s, t, P); };
  H.SKILL_FAIL = function* (e, s, t, P) { if (P && P.why === 'miss' && this.miss18) return; return yield* _sf.call(this, e, s, t, P); }; }
