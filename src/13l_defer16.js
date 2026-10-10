/* ===================== v12.119 對方的增益・狀態等這次行動結束才生效 =====================
   玩家 2026-10-11：「我的回合結束後怪物才輪到怪物回合，不管有什麼增益什麼狀態 都應該是要等我結束 除了反擊這些比較特殊的 不然傷害計算會有問題」
   →（v12.117 先做成「主角永遠先動」）→ 玩家：「現在是 RPG 了就是拼速度 誰速度快誰先」：行動順序照舊用速度決定。
   真正的問題是「別人的行動做到一半，另一邊的增益・狀態就插進來」：例如連打打到一半，菁英的 HP 掉過門檻，護盾馬上張開，後面幾下全打在護盾上。
   現在：某一方在行動時，另一方「替自己這邊加上」的狀態（護盾、能力提升、架勢、各種增益……）先記下來，等這次行動結束才一起生效。
   反擊・追擊這類「被打到就回手」的行動照舊在當下發生；加在行動那一方身上的狀態（中毒、反傷這類）也照舊。 */
{ const P = BattleCore.prototype, _as = P.applyStatus, _pr = P.prepare, _ea = P.endAction;
  P.flush16 = function () { const q = this.defer16 || []; this.defer16 = []; for (const [s, t, id, o] of q) if (this.isUp(t)) _as.call(this, s, t, id, o); };
  P.applyStatus = function (src, tgt, id, o = {}) { const A = this.act16;
    if (A && tgt && src && tgt.side !== A.side && src.side === tgt.side && this.isUp(tgt) && !o.now16) { (this.defer16 || (this.defer16 = [])).push([src, tgt, id, o]); return null; }
    return _as.call(this, src, tgt, id, o); };
  P.prepare = function (cmd) { if (!cmd.reaction) { this.act16 = null; this.flush16(); this.act16 = this.byId[cmd.actor] || null; } const ok = _pr.call(this, cmd); if (!ok && !cmd.reaction) { this.act16 = null; this.flush16(); } return ok; };
  P.endAction = function (cmd, executed) { const r = _ea.call(this, cmd, executed); if (!cmd.reaction) { this.act16 = null; this.flush16(); } return r; };
}
