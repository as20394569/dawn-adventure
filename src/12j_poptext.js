/* ===================== v12.81 跳字不再疊在一起 =====================
   玩家回報：戰鬥中開增益技能，頭上的字疊成一團（「心眼！」壓在「下一擊必定會心」上，說明又蓋到右邊的增益小標籤）。
   原因：名稱（大字）和說明（小字）往上飄的速度不一樣，飄著飄著就疊在一起；一個技能給兩種增益就是四行字擠在同一個位置。
   · 文字類的跳字（技能名、說明、異常、反擊…）每個角色排成一欄：新的在最下面，舊的往上推，永遠不重疊
   · 同一個技能接連給好幾種增益：只有第一個用大字；後面「迴避↑！」這種泛用標題省略（下面的說明已經寫了）；一樣的字不重複
   · 一欄最多 4 行，多的話最舊的先淡出；主角的字不會蓋到右邊的增益小標籤
   · 傷害數字照舊（只和其他數字錯開，不會被文字推走） */
const POPW14 = { max: 4, burst: 24, gap: 3, ease: 0.35 };
const isWordPop14 = s => typeof s === 'string' && /[　-鿿！-～]/.test(s);
const wordLife14 = p => (p.big ? 60 : 44);
const wordSz14 = p => (p.big ? 16 : p.small ? 10 : 13);
{ const _pn = Battle.prototype.popNum; Battle.prototype.popNum = function (v, s, c, tag, o = {}) {
    const all = this.pops, word = !!v && isWordPop14(s) && !tag;
    const add = (o2) => { this.pops = all.filter(q => !q.w14); const n0 = this.pops.length; try { _pn.call(this, v, s, c, tag, o2); } finally { const A = this.pops.slice(n0); this.pops = all.concat(A); return A; } };
    if (!word) { add(o); return; }
    const str = String(s), live = all.filter(q => q.w14 && q.u14 === v && q.t < wordLife14(q) - 12);
    if (live.some(q => q.s === str)) return; // the same words are still showing
    { const m = !o.big && /^(.{2})提升$/.exec(str); if (m && live.some(q => q.s.startsWith(m[1]))) return; } // 「迴避提升」 right under 「迴避 +30%」 says nothing new
    if (v.hero && str === '反擊！') return; // the hero's 「✕反擊」 sign already says it (and the word ran into the foe's damage number)
    let big = !!o.big; const small = !big && !!o.small, burst = live.length && this.t - (v.wt14 ?? -99) <= POPW14.burst;
    if (big && burst && live.some(q => q.big)) { if (/[↑↓]+！$/.test(str)) return; big = false; } // a second title in one go: 「迴避↑！」 is said by its tip already, others go normal size
    const A = add({ ...o, big, small }); for (const p of A) { p.w14 = 1; p.u14 = v; p.big = big; p.small = small; p.strong = false; } v.wt14 = this.t;
    const L = this.pops.filter(q => q.w14 && q.u14 === v && q.t < wordLife14(q) - 12);
    for (let i = 0; i < L.length - POPW14.max; i++) L[i].t = wordLife14(L[i]) - 12; // too many lines: the oldest fade out
  }; }
// where the hero's pills start (they are pushed left near the screen edge)
function pillLeft14(b, v) { if (!v.hero || typeof buffPills12 !== 'function') return W; const L = buffPills12(b, v).slice(0, 5); if (!L.length) return W;
  const X = Math.min(W - 4, Math.round(b.center(v).x + 30 + ((v.off || {}).x || 0))); return Math.min(...L.map(([s, k, t]) => Math.min(X, W - 2 - pillW12(s, t)))); }
// the column: newest at the bottom (above where this unit's damage numbers peak), older lines pushed up; never overlapping
function layoutWords14(b, v, L) {
  const C = b.center(v), off = v.off || { x: 0, y: 0 }, cx = C.x + (off.x || 0), newest = L[L.length - 1];
  let bottom0 = (v.hero ? C.y - 18 : C.y - 48) + (off.y || 0);
  for (const q of b.pops) if (!q.w14 && Math.abs(q.x - cx) < 70 && q.t < (q.big ? 60 : 44)) { const sz = (q.big ? 16 : q.small ? 10 : 13) + (q.strong ? 4 : 0), peak = q.y - (q.big ? 10 : 16) + 8 - sz * 0.55 - (q.tag ? 12 : 3); if (peak - POPW14.gap < bottom0 && peak > bottom0 - 40) bottom0 = peak - POPW14.gap; }
  const K = b.ctr12; if (K && K.v === v && v.hero && !v.gone) bottom0 = Math.min(bottom0, Math.round(C.y - 40 + (off.y || 0)) - POPW14.gap); // the 「反擊」 sign over the hero
  v.bot14 = newest !== v.botP14 ? bottom0 : Math.min(v.bot14, bottom0); v.botP14 = newest; // numbers fading out don't make the column bounce down
  let bottom = v.bot14 - Math.min(8, newest.t * 0.5);
  const right = Math.min(W - 4, pillLeft14(b, v) - 3);
  for (const p of L) { let z = wordSz14(p); while (z > 8 && Font.width(p.s, z) * 1.15 > right - 4) z--; p.fs14 = z; } // too wide for the room left of the pills: smaller letters
  for (let i = L.length - 1; i >= 0; i--) { const p = L[i], sz = p.fs14, top = bottom - sz;
    p.ly = p.ly == null ? top + 6 : p.ly + (top - p.ly) * POPW14.ease; if (Math.abs(p.ly - top) < 0.3) p.ly = top;
    const w = Font.width(p.s, sz) * 1.15; p.lx = clamp(Math.min(cx, right - w / 2), 4 + w / 2, W - 4 - w / 2);
    bottom = top - POPW14.gap; }
  for (let i = L.length - 2; i >= 0; i--) L[i].ly = Math.min(L[i].ly, L[i + 1].ly - L[i].fs14 - POPW14.gap); } // a new line comes in: the older ones make room at once
// the hero's damage / MP numbers stay left of the pills too
{ const _pn = Battle.prototype.popNum; Battle.prototype.popNum = function (v, s, c, tag, o = {}) { const n0 = this.pops.length; _pn.call(this, v, s, c, tag, o); const p = this.pops[this.pops.length - 1];
    if (!v || !v.hero || !p || this.pops.length === n0 || p.w14) return; const r = pillLeft14(this, v) - 3; if (r >= W) return; const w = Font.width(p.s, (p.big ? 16 : p.small ? 10 : 13) + 4) * 1.15; if (p.x + w / 2 > r) p.x = Math.max(4 + w / 2, r - w / 2); }; }
{ const _dp = Battle.prototype.drawPops; Battle.prototype.drawPops = function (x) {
    const all = this.pops, G = new Map(); for (const p of all) if (p.w14) { const g = G.get(p.u14); if (g) g.push(p); else G.set(p.u14, [p]); }
    this.pops = all.filter(p => !p.w14); try { _dp.call(this, x); } finally { this.pops = all; }
    for (const [v, L] of G) { layoutWords14(this, v, L);
      for (const p of L) { const life = wordLife14(p), t = p.t, a = t > life - 12 ? (life - t) / 12 : Math.min(1, 0.45 + t * 0.2), sz = p.fs14 || wordSz14(p);
        const sc = t < 3 ? 0.75 + t * 0.13 : t < 8 ? 1.14 - (t - 3) * 0.028 : 1, fz = Math.max(7, Math.round(sz * sc)), Y = Math.round(p.ly + sz / 2 - 8);
        x.globalAlpha = clamp(a, 0, 1); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) Font.drawC(x, p.s, p.lx + dx, Y + dy, '#1a0a10', null, fz); Font.drawC(x, p.s, p.lx, Y, p.c, null, fz); }
      x.globalAlpha = 1; } }; }
