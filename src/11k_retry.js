/* ===================== v12.45 頭目・菁英戰：輸了可以馬上再挑戰 =====================
   自動試玩：打不過鐵斧格倫的新手，每次都被送回家、錢少一半、再走回去，連輸 20 次。
   → 頭目和菁英戰輸了先問「再挑戰／回去準備」。再挑戰＝回到這場戰鬥開始前（HP・道具・金錢都照當時），馬上重打。
     回去準備＝照舊醒來，但頭目・菁英戰輸了不會弄丟金錢（要拿錢去打造和買藥）。數值不變。 */
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    const st = this.st, big = st && cfg && (cfg.kind === 'boss' || cfg.kind === 'elite') && !cfg.fxtest && !cfg.arena13 && !(typeof ARENA_ON13 !== 'undefined' && ARENA_ON13);
    if (!big) return yield* _bs.call(this, cfg, ...a);
    const snap = JSON.stringify(st);
    while (true) { const R = { again: false }, prev = Game.retry13; Game.retry13 = R; let r;
      try { r = yield* _bs.call(this, cfg, ...a); } finally { Game.retry13 = prev; }
      if (!(r === 'lose' && R.again)) return r;
      const o = JSON.parse(snap); for (const k of Object.keys(st)) delete st[k]; Object.assign(st, o); st.retry13 = (st.retry13 || 0) + 1; st.rngSeed = ((st.rngSeed || 1) ^ (Date.now() & 0x7fffffff) ^ (st.retry13 * 0x9e3779b9)) >>> 0; } }; } // (a new roll of the dice on a retry: the snapshot alone would replay the same battle)
{ const _wo = Overworld.prototype.whiteout; Overworld.prototype.whiteout = function* (...a) { const R = Game.retry13;
    if (!R) return yield* _wo.apply(this, a);
    Game.retry13 = null; Sound.stop(); UI.clear(); const box = { draw(x) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } }; UI.push(box); Game.fade = 0; let c;
    try { c = yield* ask(this.st.name + '眼前一片漆黑……\n要再挑戰一次嗎？\n（回到這場戰鬥開始前）', ['再挑戰', '回去準備']); } finally { UI.remove(box); }
    if (c === 0) { R.again = true; Game.fade = 1; return; }
    Game.keepGold13 = 1; try { yield* _wo.apply(this, a); } finally { Game.keepGold13 = 0; } }; }
