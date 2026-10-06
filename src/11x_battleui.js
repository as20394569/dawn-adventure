/* ===================== v12.68 戰鬥畫面總檢查（另一個代理人的 24 項裡能直接修的） ===================== */

/* 蝕日之劍：「太陽被黑暗吞沒了……整個世界都暗了下來」——蓄力到出手，整個戰場真的暗下來（以前畫面完全沒變）。
   說明寫「暗」的蓄力招都一樣。 */
{ const H = Battle.prototype.handlers, _c = H.CHARGE; H.CHARGE = function* (e, s, t, P) { const D = DEF.skills[P.skill];
    if (s && !s.hero && D && /黑暗|暗了下來|暗下來/.test((D.chargeMsg || '') + (D.warn || ''))) { this.dark13 = P.skill; this.darkT13 = 0.55; }
    yield* _c.call(this, e, s, t, P); }; }
{ const H = Battle.prototype.handlers, _u = H.SKILL_USE; H.SKILL_USE = function* (e, s, t, P) { yield* _u.call(this, e, s, t, P); if (this.dark13 && P.skill === this.dark13) { this.dark13 = null; this.darkT13 = 0; } }; }
{ const _u = Battle.prototype.update; Battle.prototype.update = function (...a) { this.darkA13 = (this.darkA13 || 0) + ((this.darkT13 || 0) - (this.darkA13 || 0)) * 0.08; return _u.apply(this, a); }; }
{ const _do = Battle.prototype.drawOverlay; Battle.prototype.drawOverlay = function (x) { if ((this.darkA13 || 0) > 0.02) { x.fillStyle = 'rgba(4,0,14,' + this.darkA13.toFixed(3) + ')'; x.fillRect(0, 0, W, BH); } return _do.call(this, x); }; }

/* 行動順序的小方塊：只寫名字第一個字，「冰凍姆・冰晶蝠・冰晶石怪」三個都是「冰」→ 每種魔物挑一個別人名字裡沒有的字（凍・蝠・石）。 */
Battle.prototype.ordLabel13 = function (v) { const nm = v.n || '?'; if (v.hero) return nm.slice(0, 1);
  const suf = /[A-G]$/.test(nm) ? nm.slice(-1) : '', base = suf ? nm.slice(0, -1) : nm;
  const bases = [...new Set(Object.values(this.views || {}).filter(u => u && !u.hero && u.n).map(u => /[A-G]$/.test(u.n) ? u.n.slice(0, -1) : u.n))], others = bases.filter(b => b !== base);
  if (!others.length) return base.slice(0, 1) + suf;
  const c = [...base].find(q => !others.some(o => o.includes(q))) || [...base].find(q => !others.some(o => o[0] === q)) || base[0]; return c + suf; };

/* 傷害數字：連擊的兩個「7」並排看起來像「77」→ 新的數字和還在畫面上的數字靠太近時，往上錯開。 */
{ const _pn = Battle.prototype.popNum; Battle.prototype.popNum = function (v, s, c, tag, o = {}) { const n0 = this.pops.length; _pn.call(this, v, s, c, tag, o); const p = this.pops[this.pops.length - 1]; if (!p || this.pops.length === n0) return;
    const near = this.pops.filter(q => q !== p && q.t < 30 && Math.abs(q.x - p.x) < 22 && Math.abs(q.y - p.y) < 12).length; if (near) { p.y -= 12 * near; p.x += (near % 2 ? 9 : -9); } }; }
