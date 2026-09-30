/* ===================== v10.6.4 招式點 and the 特技 gauge carry over between battles (player: 「特技點有時會自己消失」) =====================
   Both were kept on the battle's hero only, so whatever was stored at the end of a fight was gone when the next fight started.
   They are now saved when a battle ends (win, run or lose) and restored when the next one begins; after a weapon swap the
   特技 gauge is capped at the new weapon's size (a full gauge fires on the next basic hit). */
{ const _m = Battle.prototype.main; Battle.prototype.main = function* (...a) {
    const st = Game.st, H = this.H;
    if (st && H) { if (st.sgpKeep && typeof sigId === 'function' && sigId(st)) H.sgp = Math.min(SIG_MAX, st.sgpKeep);
      const k = typeof mainWKey === 'function' && mainWKey(st); if (st.wcKeep && k) H.wc = Math.min(wsN(WSK[k].s, st), st.wcKeep); }
    return yield* _m.apply(this, a); }; }
{ const _e = Battle.prototype.end; Battle.prototype.end = function* (res, ...a) {
    const st = Game.st, H = this.H; if (st && H) { st.sgpKeep = H.sgp || 0; st.wcKeep = H.wc || 0; }
    return yield* _e.call(this, res, ...a); }; }
