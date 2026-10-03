/* ===================== v12.0.9h 取消偷襲（玩家 2026-10-04「偷襲機制取消」） =====================
   第八輪 A 的「先手與偷襲」拿掉：從背後碰到魔物不再是偷襲（第 1 回合魔物照常行動、沒有必定會心），被追上也不再被偷襲。
   睡著的魔物照舊（不會動、不會追人）。成就「背後的一擊」（偷襲成功 30 次）跟著拿掉。 */
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { this._amb12 = null; if (cfg && cfg.ambush12) { cfg = { ...cfg }; delete cfg.ambush12; } return yield* _bs.call(this, cfg, ...a); }; }
{ const i = ACHIEVEMENTS.findIndex(x => x.id === 'r8ambush'); if (i >= 0) ACHIEVEMENTS.splice(i, 1); }
