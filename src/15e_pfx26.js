/* ===================== v12.156 試做：法杖技能改用 pixelfx 的像素特效 =====================
   玩家：「像素圖不行 那技能特效呢？」「可以先試試但盡量找可修改 可自定義」
   pixelfx（MIT）每個特效都是一段程式：顏色（palette）、角度、左右翻轉、亂數種子都能從外面改，程式本身也能改
   （例：魔力箭的支數改成可設定、每支打中會通知遊戲；魔力長槍用冰槍的形狀換成紫色魔力的顏色）。
   打幾下就出幾發（玩家：「重要的數量呢？有些 hit 數不一樣怎麼辦」）：出招時先從戰鬥紀錄讀出這一招真正打了幾下、各打誰（含沒打中的），
   每一下各出一份特效；每一下的傷害數字要等「那一發」真的打到才跳（最多等 100 幀，免得卡住）。
   畫法：每個特效開一張剛好包住（旋轉後）範圍的小畫布；每一幀 pixelfx 畫進去，再貼到戰鬥畫面（鏡頭裡、一般特效粒子之後）。
   法杖六招：魔力箭、魔力長槍、衝擊、風暴（全體）、四重光束、奧義魔法陣。其他技能不變。 */
const PFX26 = {
  on: true,
  map: { hd15_stArrows: 'pfx26_arrows', hd15_stLance: 'pfx26_lance', hd15_stImpact: 'pfx26_impact', hd15_stStorm: 'pfx26_storm', hd15_zjFourFold: 'pfx26_four', hd15_ogStaff: 'pfx26_circle' },
};
function pfxSpawn26(b, mod, P, o = {}) {
  const L = window.PFXLIB26; if (!L || !b || !mod) return null;
  const { k = 1, delay = 0, pre = 0, life = 0, glow = 0.55, ...opt } = o, [w, h] = mod.meta.size, [ox, oy] = mod.meta.origin, a = opt.angle || 0, fl = opt.flip ? -1 : 1, cs = Math.cos(a), sn = Math.sin(a);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [cx, cy] of [[-ox, -oy], [w - ox, -oy], [-ox, h - oy], [w - ox, h - oy]]) { const X = cx * fl * cs - cy * sn, Y = cx * fl * sn + cy * cs; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
  x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; const fw = Math.ceil(x1) + 2 - x0, fh = Math.ceil(y1) + 2 - y0;
  const fx = L.createFx(mod, { ...opt, x: 0, y: 0 }); if (pre > 0) fx.update(pre);
  const cv = document.createElement('canvas'); cv.width = fw; cv.height = fh;
  const e = { fx, fr: L.createFrame(fw, fh, x0, y0), cv, c2: cv.getContext('2d'), img: new ImageData(fw, fh), lim: new ImageData(fw, fh), glow, P: { x: P.x, y: P.y }, x0, y0, fw, fh, k, delay, t: 0, move: null, life: life || (mod.meta.loop ? 60 : 0) };
  (b.pfx26 || (b.pfx26 = [])).push(e); return e;
}
// 從 from 打到 to：把特效裡「手」的點對上 from、「打中」的點對上 to（自動算角度和大小）
function pfxAim26(b, mod, H, Tg, from, to, o = {}) {
  const dx = to.x - from.x, dy = to.y - from.y, lx = Tg[0] - H[0], ly = Tg[1] - H[1];
  const a = Math.atan2(dy, dx) - Math.atan2(ly, lx) + (o.jit || 0), k = clamp(Math.hypot(dx, dy) / Math.hypot(lx, ly), 0.6, 1.4), cs = Math.cos(a), sn = Math.sin(a);
  const P = { x: to.x - k * (Tg[0] * cs - Tg[1] * sn), y: to.y - k * (Tg[0] * sn + Tg[1] * cs) }; const { jit, ...rest } = o;
  return pfxSpawn26(b, mod, P, { ...rest, angle: a, k });
}
function pfxStep26(b) { const q = b.pfxQ26; if (q && q.timers.length) for (let i = q.timers.length - 1; i >= 0; i--) { const m = q.timers[i]; if (--m.f <= 0) { q.timers.splice(i, 1); m.fn(); } }
  const list = b.pfx26; if (!list || !list.length) return;
  for (let i = list.length - 1; i >= 0; i--) { const e = list[i];
    if (e.delay > 0) { e.delay--; continue; }
    e.fx.update(1 / 60); e.t++;
    if (e.move) { const m = e.move, q = clamp(e.t / m.d, 0, 1); e.P.x = lerp(m.a.x, m.b.x, q); e.P.y = lerp(m.a.y, m.b.y, q); if (q >= 1 && !m.done) { m.done = 1; e.fx.stop(); if (m.end) m.end(); } }
    if (e.life && !e.move && e.t === e.life) e.fx.stop();
    if (e.fx.done() || e.t > 900) list.splice(i, 1); } }
// 顏色層照一般貼；光暈層用「相加」貼（pixelfx 的光原本是加在暗背景上的，直接混成不透明會變成一團白，白天的場景特別明顯）
function pfxDraw26(b, x) { const L = window.PFXLIB26, list = b.pfx26; if (!L || !list || !list.length) return;
  const sm = x.imageSmoothingEnabled, op = x.globalCompositeOperation; x.imageSmoothingEnabled = false;
  for (const e of list) { if (e.delay > 0) continue;
    L.clearFrame(e.fr); e.fx.draw(e.fr); L.composite(e.fr, e.img.data, null, 0); e.c2.putImageData(e.img, 0, 0);
    const X = e.P.x + e.x0 * e.k, Y = e.P.y + e.y0 * e.k, w = e.fw * e.k, h = e.fh * e.k; x.drawImage(e.cv, X, Y, w, h);
    const Lt = e.fr.light, d = e.lim.data, g = e.glow; let any = 0;
    for (let i = 0, j = 0; i < Lt.length; i++, j += 4) { const l = Lt[i]; if (l & 0xffffff) { any = 1; d[j] = (l & 255) * g; d[j + 1] = ((l >>> 8) & 255) * g; d[j + 2] = ((l >>> 16) & 255) * g; } else d[j] = d[j + 1] = d[j + 2] = 0; d[j + 3] = 255; }
    if (any) { e.c2.putImageData(e.lim, 0, 0); x.globalCompositeOperation = 'lighter'; x.drawImage(e.cv, X, Y, w, h); x.globalCompositeOperation = op; } }
  x.imageSmoothingEnabled = sm; }
{ const B = Battle.prototype;
  const _u = B.update; B.update = function (...a) { const r = _u.apply(this, a); if (!(this.hitstop > 0)) pfxStep26(this); return r; };
  const _ov = B.drawOverlay; B.drawOverlay = function (x) { pfxDraw26(this, x); return _ov.call(this, x); };
  const _pf = B.playFx; B.playFx = function* (name, u, t) { const k = PFX26.on && window.PFXLIB26 && u && u.hero && PFX26.map[name]; if (k && FX[k]) pfxPlan26(this); return yield* _pf.call(this, k && FX[k] ? k : name, u, t); };
  // 每一下的傷害（或沒打中）等那一發打到才跳
  const HD = B.handlers;
  for (const ty of ['DAMAGE', 'MISS']) { const _h = HD[ty]; HD[ty] = function* (e, s, t, P) { const q = this.pfxQ26;
      if (q && e.cast === q.cast && t && !t.hero) { const i = q.i++; for (let n = 0; i < q.ready.length && !q.ready[i] && n < 100; n++) yield* wait(1); }
      return yield* _h.call(this, e, s, t, P); }; }
  const _ae = HD.ACTION_END; HD.ACTION_END = function* (...a) { this.pfxQ26 = null; return yield* _ae.apply(this, a); }; }
// 這一招真正打了幾下、各打誰：從現在往後讀戰鬥紀錄，到這次行動結束為止（同一個 cast 的傷害／沒打中，對象是魔物）
function pfxPlan26(b) { const id = b.cast && b.cast.id, L = b.core.log, hits = [];
  for (let i = b.cur + 1; i < L.length; i++) { const q = L[i]; if (q.type === EVT.ACTION_END) break;
    if (q.cast === id && (q.type === EVT.DAMAGE || q.type === EVT.MISS)) { const v = b.vw(q.tgts[0]); if (v && !v.hero) hits.push({ v, miss: q.type === EVT.MISS }); } }
  return (b.pfxQ26 = { cast: id, hits, ready: hits.map(() => false), i: 0, timers: [] }); }
const pfxAt26 = (b, f, fn) => { const q = b.pfxQ26; if (!q || f <= 0) fn(); else q.timers.push({ f, fn }); };       // f 幀之後做 fn
const pfxLand26 = (b, i) => { const q = b.pfxQ26; if (q && i < q.ready.length) q.ready[i] = true; };               // 第 i 下打到了
function* pfxWait26(b, i) { const q = b.pfxQ26; for (let n = 0; q && i < q.ready.length && !q.ready[i] && n < 100; n++) yield* wait(1); }
// 每一下打誰（沒有紀錄時就當成打 T 一下）
const pfxHits26 = (b, t) => { const q = b.pfxQ26; return q && q.hits.length ? q.hits : [{ v: t && t.group ? t.group[0] : t, miss: false }]; };

const pfxM26 = n => window.PFXLIB26 && window.PFXLIB26.M[n];
const pfxPal26 = n => window.PFXLIB26 && window.PFXLIB26.PAL[n];
const pfxFoot26 = (b, v) => { const C = b.center(v); return { x: C.x, y: typeof v.foot === 'number' ? v.foot : C.y + 18 }; };
const pfxHand26 = U => ({ x: U.x + 8, y: U.y - 6 });
Object.assign(FX, {
  // 魔力箭：打幾下就飛幾支（最多 8 支，多的併在最後一支），每支打中才跳那一下的傷害
  *pfx26_arrows(U, T, u, t) { const H = pfxHits26(this, t), n = Math.min(8, H.length), self = this;
    Sound.sfx('stCast');
    pfxAim26(this, pfxM26('missiles'), [15, -24], [152, -22], pfxHand26(U), this.center(H[0].v), { count: n, gap: n > 5 ? 0.1 : 0.18,
      onHit: i => { Sound.sfx('stBolt'); if (i < n - 1) pfxLand26(self, i); else H.forEach((_, j) => j >= i && pfxLand26(self, j)); } });
    yield* pfxWait26(this, 0); },
  // 魔力長槍：每一下一支紫色魔力槍（冰槍的形狀換顏色），刺中時小小爆一下（原本接冰碎片，斜著飛出去像一把斧頭，拿掉）
  *pfx26_lance(U, T, u, t) { const pal = pfxPal26('arcane'), A = pfxHand26(U), self = this;
    pfxHits26(this, t).forEach((h, i) => { const C = this.center(h.v), a = Math.atan2(C.y - A.y, C.x - A.x);
      pfxAt26(this, i * 10, () => Sound.sfx('stBolt'));
      const e = pfxSpawn26(this, pfxM26('lance'), A, { angle: a, palette: pal, delay: i * 10 });
      if (e) e.move = { a: A, b: C, d: 16, end: () => { if (!h.miss) pfxSpawn26(self, pfxM26('burst'), { x: C.x, y: C.y + 14 }, { k: 0.5, pre: 0.2, seed: 30 + i }); pfxLand26(self, i); } }; });
    yield* pfxWait26(this, 0); },
  // 魔力衝擊：每一下在對手身上聚起魔力、白光一閃炸開
  *pfx26_impact(U, T, u, t) { pfxHits26(this, t).forEach((h, i) => { const C = this.center(h.v), d = i * 12;
      pfxAt26(this, d, () => Sound.sfx('mana')); pfxSpawn26(this, pfxM26('burst'), { x: C.x, y: C.y + 24 }, { k: 0.85, delay: d, seed: 9 + i }); pfxAt26(this, d + 14, () => pfxLand26(this, i)); });
    yield* pfxWait26(this, 0); },
  // 魔力風暴（全體）：每一下，星光落在那一下打的魔物身上
  *pfx26_storm(U, T, u, t) { Sound.sfx('stCast'); pfxHits26(this, t).forEach((h, i) => { const d = i * 5;
      pfxSpawn26(this, pfxM26('starfall'), pfxFoot26(this, h.v), { k: 0.7, delay: d, seed: 4 + i }); pfxAt26(this, d + 26, () => { Sound.sfx('arcane'); pfxLand26(this, i); }); });
    yield* pfxWait26(this, 0); },
  // 魔力奔流：每一下一道魔力光束（角度稍微錯開）
  *pfx26_four(U, T, u, t) { const A = pfxHand26(U); pfxHits26(this, t).forEach((h, i) => { const d = i * 9;
      pfxAt26(this, d, () => Sound.sfx('stBolt'));
      pfxAim26(this, pfxM26('beam'), [15, -24], [183, -24], A, this.center(h.v), { jit: [-0.06, 0.05, -0.02, 0.07][i % 4], seed: 10 + i, life: 34, delay: d }); pfxAt26(this, d + 6, () => pfxLand26(this, i)); });
    yield* pfxWait26(this, 0); },
  // 天穹魔陣：被打的每隻魔物腳下各畫一個魔法陣、光柱衝上去；接著每一下在那一下打的魔物身上爆一次
  *pfx26_circle(U, T, u, t) { const H = pfxHits26(this, t), vs = [...new Set(H.map(h => h.v))].filter(Boolean); if (!vs.length) return; Sound.sfx('stCast');
    vs.forEach((v, i) => pfxSpawn26(this, pfxM26('circle'), pfxFoot26(this, v), { k: 0.7, pre: 0.5, seed: 6 + i, glow: 0.35 }));
    pfxAt26(this, 40, () => Sound.sfx('charge'));
    H.forEach((h, i) => { const C = this.center(h.v), d = 61 + i * 6;
      pfxAt26(this, d, () => Sound.sfx('arcane')); pfxSpawn26(this, pfxM26('burst'), { x: C.x + rnd(-6, 6), y: C.y + 18 + rnd(-6, 6) }, { k: 0.6, pre: 0.18, delay: d, seed: 20 + i }); pfxAt26(this, d + 4, () => pfxLand26(this, i)); });
    yield* pfxWait26(this, 0); },
});
