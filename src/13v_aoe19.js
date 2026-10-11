/* ===================== v12.136 範圍攻擊：打到的魔物一起跳傷害、一起倒下 =====================
   玩家 2026-10-11：「如果一次擊倒多名魔物，傷害要一起出來。改的時候注意其他相關」
   原本：範圍招式（例如烈焰漩渦打三隻）是一隻一隻播 ——
     A 跳數字 → 扣血 → A 倒下的動畫 →「A倒下了！」→（B、C：「同伴倒下了，牠的眼神變得兇狠！」）→ B 跳數字 → …
   三個數字前後差了一秒多，中間還插著馬上也會被打死的魔物的「變兇狠」。
   現在同一招、同一段打到的魔物：
   1. 傷害數字・受擊動作・扣血同時出現（同一個音效同一格只響一次，不會疊成很大聲）；
      要害・弱點・被抵抗這類句子在數字之後說一次（一樣的句子只說一次）。
   2. 其他跟著這一下發生的事（異常狀態、破防、吸血、MISS…）照原本的順序接著播。
      在同一下就被打倒的魔物身上「本來會發生」的事（變兇狠、上狀態）不播 —— 牠已經倒了。
   3. 被打倒的一起倒下（叫聲一次），訊息合成一句：「狂牙狼A、狂牙狼B、狂牙狼C倒下了！」。
      倒下之後才觸發的事（打倒時回血、獵印轉移、同伴變兇狠…）在那之後播。
   只合併「同一招、同一段、打在不同魔物身上」的傷害：多段攻擊的第二段起、反擊、荊棘反彈、追擊…照舊一下一下播。 */
const AOE19 = {
  // 可以夾在同一批裡、之後照順序播的事件（其他事件 → 這一批到此為止）
  keep: new Set(['HIT', 'CRIT', 'MISS', 'STATUS_APPLY', 'STATUS_FAIL', 'STATUS_STACK', 'STATUS_REMOVE', 'STATUS_EXPIRE', 'RESOURCE_CHANGE', 'RESOURCE_EMPTY', 'RESOURCE_FULL',
    'RESOURCE_OVERFLOW', 'HEAL', 'BREAK', 'MESSAGE', 'EFFECT_TRIGGER', 'EFFECT_DONE', 'TARGET_CHANGE', 'COST_PAY', 'COOLDOWN'])
};
{ const B = Battle.prototype;
  const hitOf = (e, e0) => e.type === EVT.DAMAGE && e.payload && e.payload.kind === 'hit' && e.cast != null && e.cast === e0.cast && e.src === e0.src
    && (e.payload.hitIndex || 0) === (e0.payload.hitIndex || 0);
  // 從第一個傷害往後看：同一招・同一段打在別隻魔物身上的傷害有幾個
  B.aoeScan19 = function (i0) { const L = this.core.log, e0 = L[i0], cu = this.core.byId, src = cu[e0.src], side = u => u && u.side;
    if (!(e0 && e0.type === EVT.DAMAGE && e0.payload && e0.payload.kind === 'hit' && e0.cast != null && src)) return null;
    const isFoe = id => cu[id] && side(cu[id]) !== side(src);
    if (!isFoe(e0.tgts[0])) return null;
    const hit = new Set([e0.tgts[0]]), downAt = {}; let i = i0 + 1, last = i0;
    for (; i < L.length; i++) { const e = L[i];
      if (e.type === EVT.DAMAGE) { if (hitOf(e, e0) && isFoe(e.tgts[0]) && !hit.has(e.tgts[0])) { hit.add(e.tgts[0]); last = i; continue; } break; }
      if (e.type === EVT.DOWN) { const id = e.tgts[0]; if (hit.has(id) && downAt[id] == null) { if (!e.cancelled) downAt[id] = i; last = i; continue; } break; }
      if (e.cast !== e0.cast || !AOE19.keep.has(e.type)) break; }
    if (hit.size < 2) return null;
    // 最後一個傷害／倒下之後的事件也一起帶（例如倒下後觸發的訊息），到這一批的界線為止
    return { end: i, last, hit, downAt }; };

  // 幾個事件同時播：每一格每個都往前走一步；訊息先收起來，同一個音效同一格只響一次
  B.par19 = function* (list) { const msgs = [], self = this, snd = new Set(), _sfx = Sound.sfx, _cry = Sound.cry;
    this.msg = function* (t, o) { msgs.push([t, o]); };
    Sound.sfx = function (k, ...a) { if (snd.has(k)) return; snd.add(k); return _sfx.call(this, k, ...a); };
    Sound.cry = function (...a) { if (snd.has('#cry')) return; snd.add('#cry'); return _cry.apply(this, a); };
    try { let G = list.map(([i, e]) => ({ i, g: self.onEvent(e) }));
      while (G.length) { G = G.filter(o => { self.cur = o.i + 1; try { return !o.g.next().done; } catch (err) { if (typeof bvErr === 'function') bvErr('aoe19', String(err && err.message || err)); return false; } }); if (G.length) { yield; snd.clear(); } } }
    finally { delete this.msg; Sound.sfx = _sfx; Sound.cry = _cry; }
    return msgs; };

  B.playAoe19 = function* (i0, A) { const L = this.core.log, dead = A.downAt, firstDown = Math.min(Infinity, ...Object.values(dead));
    const P1 = [], D = [], mid = [], post = [];
    for (let i = i0; i < A.end; i++) { const e = L[i], t = e.type;
      if (t === EVT.DAMAGE || t === EVT.HIT || t === EVT.CRIT) { P1.push([i, e]); continue; }
      if (t === EVT.DOWN) { if (!e.cancelled) D.push([i, e]); continue; }
      const who = (e.tgts && e.tgts[0]) || e.src;
      if (who && dead[who] != null && i < dead[who]) continue; // 這一下就倒了：牠身上本來會發生的事不播
      (i < firstDown ? mid : post).push([i, e]); }
    // 1. 傷害一起出來
    const m1 = yield* this.par19(P1), seen = new Set();
    for (const [t, o] of m1) { if (seen.has(t)) continue; seen.add(t); yield* this.msg(t, o); }
    // 2. 跟著這一下發生的其他事
    for (const [i, e] of mid) { this.cur = i + 1; yield* this.onEvent(e); }
    // 3. 一起倒下，訊息合成一句
    if (D.length) { const m3 = yield* this.par19(D), names = [], rest = [];
      for (const [t, o] of m3) { const r = /^(.+)倒下了！$/.exec(t); if (r) names.push(r[1]); else rest.push([t, o]); }
      if (names.length) yield* this.msg(names.join('、') + '倒下了！', { hold: 30 + 8 * (names.length - 1) });
      for (const [t, o] of rest) yield* this.msg(t, o); }
    // 4. 倒下之後才觸發的事
    for (const [i, e] of post) { this.cur = i + 1; yield* this.onEvent(e); }
    this.cur = A.end; };

  const _oe = B.onEvent; B.onEvent = function* (e) {
    if (!this.aoe19 && e && e.type === EVT.DAMAGE && this.core && this.core.log[this.cur - 1] === e) { const i0 = this.cur - 1, A = this.aoeScan19(i0);
      if (A) { this.aoe19 = 1; try { yield* this.playAoe19(i0, A); } finally { this.aoe19 = 0; } return; } }
    return yield* _oe.call(this, e); }; }
