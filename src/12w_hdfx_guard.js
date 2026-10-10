/* ===================== v12.103 防禦的新特效（全部武器統一） =====================
   玩家 2026-10-10：「我注意到 防禦的特效還是用舊的」→ 先照武器各做了一套架勢 → 玩家：「防禦統一好了 不用特別做」。
   所以選「防禦」時的畫面（原本是三圈淡藍的圈＋盾牌圖示）換成一套新的、不管拿什麼武器都一樣：
     主角腳下一圈淡藍的波紋 → 身前浮出一面淡藍白的光盾（亮光掃過盾面）→ 一層六角護壁張開、原地淡掉，一聲短短的金屬響。
   防禦中被打到時，身前的光盾再亮一下、六角一閃、火花往外迸（傷害減半的那一下）。
   先只在特效測試版（GD25.live）；玩家看過說好才放進正式版。 */
const GD25 = { live: true };   // v12.104 正式版也開
HD15.P.guard = { core: '#ffffff', mid: '#cfe6ff', glow: '#6aa8ff', edge: '#1a3060', keep: 1 };
GD25.foesC = b => { const L = DG17.foes(b); if (!L.length) return null; const C = L.map(v => b.center(v)); return { x: C.reduce((a, c) => a + c.x, 0) / C.length, y: C.reduce((a, c) => a + c.y, 0) / C.length }; };
GD25.front = b => { const H = DS16.hands(b).Hc, F = GD25.foesC(b), d = F ? Math.atan2(F.y - H.y, F.x - H.x) : -Math.PI / 2; return { x: H.x + Math.cos(d) * 14, y: H.y - 12 + Math.sin(d) * 6, d }; };
// 選「防禦」
GD25.guard = function* (b) { const P = HD15.P.guard, H = DS16.hands(b), C = GD25.front(b), G = { x: H.Hc.x, y: HDW_FOOT() - 2 };
  Sound.sfx('shGuard'); b.hd15cast = 1; HD15.ring(b, G, P, 6, 38, { fl: 0.3, w: 1.8, dur: 22 }); SH24.plate(b, C, P, { s: 1.3, dur: 36, hold: 0.7, shine: 1, from: { x: 0, y: 8 }, mv: 5 }); yield* wait(6);
  SP20.hex(b, C, 30, P, { hold: 18, fl: 1, fade: 1 }); HD15.flash(b, C, P, 34, { dur: 14 }); yield* wait(22); };
{ const _g = FX.guard; FX.guard = function* (U, ...a) { if (!(GD25.live && HD15.on && this.H && U && Math.abs(U.x - this.center(this.H).x) < 4 && Math.abs(U.y - this.center(this.H).y) < 4)) return yield* _g.call(this, U, ...a); yield* GD25.guard(this); }; }
// 防禦中被打到：光盾再亮一下、六角一閃、火花往外迸
{ const H = Battle.prototype.handlers, _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (GD25.live && HD15.on && t && t.hero && t.st && t.st.guard && s && !s.hero && P && P.kind !== 'dot' && (P.amount || 0) > 0) { const Pl = HD15.P.guard, C = GD25.front(this);
      SH24.plate(this, C, Pl, { s: 1.4, dur: 18, hold: 0.5 }); SP20.hex(this, C, 26, Pl, { hold: 6, fl: 1, fade: 1 }); HD15.sparks(this, C, 10, HD15.P.white, { spd: 3, life: 16, g: 0.1 }); Sound.sfx('shGuard'); }
    return yield* _dm.call(this, e, s, t, P); }; }
