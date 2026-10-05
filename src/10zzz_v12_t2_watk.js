/* ===================== v12.11 武器的普攻和特效對得上（玩家 2026-10-05：「武器的基本攻擊與特效要符合」） =====================
   查到：鐵匠打造的武器（v12 的底材）不在舊的武器招式表裡，戰鬥畫面認不出武器種類 → 所有武器的普攻都畫成「劍砍兩下」，顏色也都是鋼色。
   · 認武器：照身上的武器種類（雙持看雙刀／雙劍／雙盾）；顏色照武器屬性（火紅・水藍・雷黃・草綠），沒屬性照種類（拳套金、法杖・魔導書紫、樂器淡紫、火槍黃銅、其他鋼色）。
   · 打幾下畫幾下：劍一刀、斧一劈、長槍一刺、拳套一拳、火槍一槍（彈道照屬性上色）、法杖・魔導書一顆魔彈（魔導書腳下多一圈魔法陣）、樂器一道音符；
     短刀・拳套（特性）的第二段由分段動畫補上（短刀是刺、拳套是拳）；雙刀・雙劍・雙盾左右手各一下，副手照副手的屬性上色。
   · 拳套特性的說明「第二下 50%」→ 實際兩下各 75%，改說明。 */
const WTH12 = {
  steel: ['#a8d8ff', '#ffffff', 'rgba(10,20,40,0.6)'], fire: ['#ff7a30', '#fff0a0', 'rgba(70,14,0,0.6)'], water: ['#3c9cf0', '#e8f8ff', 'rgba(0,20,60,0.6)'],
  ice: ['#8ad8ff', '#ffffff', 'rgba(0,30,60,0.6)'], volt: ['#f8d030', '#fffbe0', 'rgba(50,40,0,0.6)'], leaf: ['#58d060', '#e8ffd0', 'rgba(0,40,10,0.6)'],
  chi: ['#ffc040', '#ffffff', 'rgba(50,30,0,0.5)'], arcane: ['#c890ff', '#f8f0ff', 'rgba(25,0,45,0.6)'], sound: ['#c8b0ff', '#ffffff', 'rgba(20,10,40,0.5)'], brass: ['#e0a840', '#fff0c0', 'rgba(40,25,0,0.6)'],
};
const WEL12 = { 火: 'fire', 水: 'water', 雷: 'volt', 草: 'leaf' }, WKD12 = { 拳套: 'chi', 法杖: 'arcane', 魔導書: 'arcane', 樂器: 'sound', 火槍: 'brass' };
function wTheme12(g) { if (!g || !GEAR[g.b]) return 'steel'; const B = GEAR[g.b], el = g.el || B.elem;
  if (el === '水' && /[冰霜雪晶]/.test(B.n || '')) return 'ice'; return WEL12[el] || WKD12[B.kind] || 'steel'; }
function wKind12(st = Game.st) { const w = gearBy(st.equip && st.equip.weapon, st), dm = typeof dualMode11 === 'function' ? dualMode11(st) : null;
  return dm || (w && GEAR[w.b] && GEAR[w.b].kind) || '拳套'; }

// every hero action: which weapon, which colours (the old table only knew the pre-v12 weapons)
{ const _pf = Battle.prototype.playFx; Battle.prototype.playFx = function* (name, u, t) {
    if (u && u.hero && Game.st && Game.st.equip) { const st = Game.st, kind = wKind12(st), w = gearBy(st.equip.weapon, st), off = gearBy(st.equip.shield, st);
      this._thKind = kind; if (!mainWKey(st)) this._thT = wTheme12(w);
      this._thT2 = off && GEAR[off.b].slot === 'weapon' ? wTheme12(off) : this._thT;
      const D = this.cast && this.cast.D; if (D && D.tags && D.tags.includes('weapon_special') && ['劍', '短刀', '斧', '雙刀', '雙劍'].includes(kind)) this.slashOn = 1; }
    return yield* _pf.call(this, name, u, t); }; }

// one picture per strike
function slash12(b, T, col, f) { const [c, h, d] = col, x1 = T.x - 20 * f, y1 = T.y - 22, x2 = T.x + 16 * f, y2 = T.y + 20; Sound.sfx('slash');
  b.spawn({ k: 'line', sl: 1, x1, y1, x2, y2, c: d, w: 8, grow: 3, life: 12 }); b.spawn({ k: 'line', sl: 1, x1, y1, x2, y2, c, w: 6, grow: 3, life: 12 });
  b.spawn({ k: 'line', sl: 1, x1, y1, x2, y2, c: h, w: 2, grow: 3, life: 10 }); b.star(T.x, T.y, h); }
function stab12(b, U, T, col, o) { const [c, h, d] = col, dx = T.x - U.x, dy = T.y - U.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux;
  const x0 = T.x - ux * 26 + px * o, y0 = T.y - uy * 26 + py * o, x1 = T.x + ux * 4 + px * o * 0.3, y1 = T.y + uy * 4 + py * o * 0.3, F = 3; Sound.sfx('slash');
  b.spawn({ k: 'thrTip', x: x0, y: y0, ang: Math.atan2(y1 - y0, x1 - x0), len: 16, w: 5, c, h, d, life: F + 4, upd: p => { const k = Math.min(1, p.t / F); p.x = x0 + (x1 - x0) * k; p.y = y0 + (y1 - y0) * k; } });
  b.spawn({ k: 'line', x1: x0, y1: y0, x2: x1, y2: y1, c: h, w: 1, grow: 4, life: 7 }); b.spawn({ k: 'ring', x: x1, y: y1, r0: 2, r1: 12, c, w: 2, life: 9 }); }
function bash12(b, T, col, o) { const [c, h, d] = col; Sound.sfx('hit'); b.shake = Math.max(b.shake || 0, 5);
  b.spawn({ k: 'hex', x: T.x + o, y: T.y, r0: 18, r1: 8, c: h, life: 10 }); b.spawn({ k: 'ring', x: T.x + o, y: T.y, r0: 3, r1: 20, c: d, w: 5, life: 10 }); b.spawn({ k: 'ring', x: T.x + o, y: T.y, r0: 3, r1: 18, c, w: 3, life: 10 });
  for (let i = 0; i < 2; i++) b.star(T.x + o + rnd(-8, 8), T.y - 10 + rnd(-4, 4), '#ffe070', 7); }
{ const _wa = FX.wAtk; FX.wAtk = function* (U, T, u) { const kind = this._thKind || '劍', c1 = WTH12[this._thT] || WTH12.steel, c2 = WTH12[this._thT2] || c1;
    const old = function* (b, k) { const K0 = b._thKind; b._thKind = k; try { yield* _wa.call(b, U, T, u); } finally { b._thKind = K0; } };
    switch (kind) {
      case '劍': yield* this.lunge(u, 8, 3); slash12(this, T, c1, 1); yield* wait(8); break;
      case '短刀': yield* this.lunge(u, 12, 2); stab12(this, U, T, c1, 0); yield* wait(4); this.star(T.x, T.y, c1[1]); yield* wait(4); break;
      case '魔導書': Sound.sfx('charge'); this.spawn({ k: 'ring', x: U.x, y: U.y + 4, r0: 6, r1: 16, c: c1[0], w: 1, life: 14 }); this.spawn({ k: 'hex', x: U.x, y: U.y + 4, r0: 14, r1: 10, c: c1[1], life: 14 }); yield* old(this, '法杖'); break;
      case '雙刀': yield* this.lunge(u, 12, 2); stab12(this, U, T, c1, -7); yield* wait(4); stab12(this, U, T, c2, 7); yield* wait(4); this.star(T.x, T.y, c2[1]); yield* wait(4); break;
      case '雙劍': yield* this.lunge(u, 8, 3); slash12(this, T, c1, 1); yield* wait(4); slash12(this, T, c2, -1); yield* wait(6); break;
      case '火槍': { const dx = T.x - U.x, dy = T.y - U.y, L = Math.hypot(dx, dy) || 1, mx = U.x + dx / L * 12, my = U.y - 6 + dy / L * 12; Sound.sfx('crit');
        this.spawn({ k: 'glow', x: mx, y: my, r: 10, c: '#fff0a0', life: 6 }); this.star(mx, my, '#fff8d0', 6); this.spawn({ k: 'line', x1: mx, y1: my, x2: T.x, y2: T.y, c: c1[0], w: 2, grow: 4, life: 7 });
        this.spawn({ k: 'line', x1: mx, y1: my, x2: T.x, y2: T.y, c: c1[1], w: 1, grow: 4, life: 5 }); yield* wait(3); Sound.sfx('hit');
        this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 2, r1: 16, c: c1[0], w: 3, life: 9 }); this.sparks(T.x, T.y, 8, [c1[0], c1[1], '#fff0a0'], 2.4, 12); yield* wait(8); break; }
      case '雙盾': yield* this.lunge(u, 14, 2); bash12(this, T, c1, -5); yield* wait(5); yield* this.lunge(u, 10, 2); bash12(this, T, c2, 5); yield* wait(6); break;
      default: yield* old(this, kind);
    } }; }
// the 2nd / 3rd segment of a basic attack: a stab for knives, a punch for fists, a cut for blades — in the weapon's colours
segSwing = function* (b, s, C, i, kind) { yield* b.lunge(s, 6, 2); const [c, h, d] = WTH12[b._thT] || WTH12.steel;
  if (kind === '拳套') { Sound.sfx('hit'); const ox = [-8, 8, 0][i % 3], oy = [-4, 4, -8][i % 3]; b.spawn({ k: 'ring', x: C.x + ox, y: C.y + oy, r0: 2, r1: 12, c: d, w: 4, life: 8 }); b.spawn({ k: 'ring', x: C.x + ox, y: C.y + oy, r0: 2, r1: 12, c, w: 2, life: 8 }); b.star(C.x + ox, C.y + oy, h, 8); }
  else if (kind === '短刀' || kind === '雙刀') stab12(b, b.center(s), C, [c, h, d], [6, -6, 0][i % 3]);
  else { Sound.sfx('slash'); const f = i % 2 ? -1 : 1; b.spawn({ k: 'line', sl: 1, x1: C.x - 16 * f, y1: C.y - 16, x2: C.x + 14 * f, y2: C.y + 14, c: d, w: 5, grow: 3, life: 10 }); b.spawn({ k: 'line', sl: 1, x1: C.x - 16 * f, y1: C.y - 16, x2: C.x + 14 * f, y2: C.y + 14, c, w: 3, grow: 3, life: 10 }); b.star(C.x, C.y, h, 8); }
  yield* wait(4); };
TREE11['拳套'].trait = '普通攻擊打兩下（每下 75%）';
