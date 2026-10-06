/* ===================== v12.0.2 打擊感（玩家在〈第一輪打磨提案〉勾選的四項） =====================
   1 命中停頓：你打中魔物時整個戰鬥畫面停 2 格，弱點、會心停 4 格（原本只有你受到大傷害時才會停）。
   2 弱點、會心：原本就有閃白、震動和白色光圈；再加一圈顏色跟數字一樣的光環（弱點金色、會心橘色），一眼分得出來。
   3 傷害數字：從小彈到比原尺寸大再落回來，並往上跳一下；弱點、會心的數字大一號。
   4 最後一擊：打倒最後一隻魔物的那一下，停頓加長、畫面放慢一瞬間，再加一道白光。
   ×2 戰鬥速度開著時，停頓和放慢也跟著減半（多跑的那一格一樣會倒數）。只改畫面，不改任何招式的效果。 */
{ const _u = Battle.prototype.update; Battle.prototype.update = function (...a) {
    if (this.hitstop > 0) { this.hitstop--; return; }
    if (this.slowmo > 0) { this.slowmo--; if (this.slowmo % 2) return; }
    return _u.apply(this, a); }; }
{ const H = Battle.prototype.handlers, _d = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    const hit = !!(t && !t.hero && P.kind === 'hit' && P.amount > 0);
    if (hit) this._hf12 = { t, weak: P.mult > 1, crit: !!P.crit, last: (P.hpAfter ?? 1) <= 0 && !this._lastHit12 && this.foes().every(v => v === t || v.hp <= 0) };
    try { yield* _d.call(this, e, s, t, P); } finally { if (hit) this._hf12 = null; } }; }
{ const _pn = Battle.prototype.popNum; Battle.prototype.popNum = function (v, s, c, tag, o = {}) {
    _pn.call(this, v, s, c, tag, o); const f = this._hf12; if (!f || v !== f.t) return; const strong = f.weak || f.crit, p = this.pops[this.pops.length - 1]; if (p) p.strong = strong;
    this.hitstop = strong ? 4 : 2; const C = this.center(v);
    if (strong) this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 6, r1: 40, c: f.weak ? '#ffd040' : '#ff9a50', w: 3, life: 12 });
    if (f.last) { this._lastHit12 = 1; this.hitstop = 8; this.slowmo = 24; this.spawn({ k: 'flash', c: '#ffffff', a: 0.5, life: 12 }); } }; }
Battle.prototype.drawPops = function (x) {
  for (const p of this.pops) { const life = p.big ? 60 : 44, a = p.t > life - 12 ? (life - p.t) / 12 : 1, rise = p.big ? Math.min(10, p.t * 0.6) : Math.min(16, p.t * 1.2), sz = (p.big ? 16 : p.small ? 10 : 13) + (p.strong ? 4 : 0);
    const t = p.t, pop = t < 3 ? 0.6 + t * 0.3 : t < 9 ? 1.5 - (t - 3) / 12 : 1, hop = t < 6 ? Math.sin(t / 6 * Math.PI) * (p.strong ? 6 : 3) : 0, fz = Math.round(sz * pop);
    x.globalAlpha = clamp(a, 0, 1); const Y = p.y - rise - hop; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) Font.drawC(x, p.s, p.x + dx, Y + dy, '#1a0a10', null, fz); Font.drawC(x, p.s, p.x, Y, p.c, null, fz);
    if (p.tag) { const ts = p.strong ? 10 : 8; Font.drawC(x, p.tag, p.x, Math.min(Y - 11 - (p.strong ? 3 : 0), Math.round(Y + 8 - fz / 2 - ts / 2 - 9)), p.c, '#000000', ts); } /* v12.81: the tag stays above the number while it pops big */ x.globalAlpha = 1; }
};
