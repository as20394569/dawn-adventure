/* ===================== v13.0 試做：pixelfx 特效引擎（技能精簡：每種武器 4 招、兩次分化） =====================
   pixelfx（MIT，github.com/patch-gg/pixelfx）每個特效是一段程式，顏色・大小・角度・數量都能從外面改。
   這裡只放「怎麼畫」：每個特效開一張剛好包住範圍的小畫布，每幀畫進去再貼到戰鬥畫面（鏡頭裡、一般粒子之後）；
   光暈用相加貼（原本混成不透明會變成一團白）。
   打幾下就出幾份：出招時從戰鬥紀錄讀出這一招真正打了幾下、各打誰（含沒打中），每一下的傷害數字等「那一發」打到才跳。
   招式的 fx 名稱用 sk4_ 開頭的才走這套（v13 的新招）。 */
const PFX26 = { on: true };
function pfxSpawn26(b, mod, P, o = {}) {
  const L = window.PFXLIB26; if (!L || !b || !mod) return null;
  const { k = 1, delay = 0, pre = 0, life = 0, glow = 0.55, ...opt } = o, [w, h] = mod.meta.size, [ox, oy] = mod.meta.origin, a = opt.angle || 0, fl = opt.flip ? -1 : 1, cs = Math.cos(a), sn = Math.sin(a);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [cx, cy] of [[-ox, -oy], [w - ox, -oy], [-ox, h - oy], [w - ox, h - oy]]) { const X = cx * fl * cs - cy * sn, Y = cx * fl * sn + cy * cs; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
  x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; const fw = Math.ceil(x1) + 2 - x0, fh = Math.ceil(y1) + 2 - y0;
  for (const key in opt) if (opt[key] === undefined) delete opt[key]; // 沒給的選項（例如 palette）用特效自己的預設
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
  const _pf = B.playFx; B.playFx = function* (name, u, t) { if (PFX26.on && window.PFXLIB26 && u && u.hero && /^sk4_/.test(name) && FX[name]) pfxPlan26(this); return yield* _pf.call(this, name, u, t); };
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
// 身體的位置：主角在 GBA 構圖裡畫在左下（view 的 x／foot 是舊版位置，不能用），用 center 和 HERO_FOOT 算
const pfxBody26 = (b, v) => { const C = b.center(v); if (v.hero) { const f = typeof HERO_FOOT === 'number' ? HERO_FOOT : C.y + 22; return { x: C.x, foot: f, h: Math.max(30, (f - C.y) * 2), C }; }
  return { x: Math.round(v.x + v.off.x), foot: v.foot + v.off.y, h: v.bbh || 48, C }; };
const pfxSize26 = (h, base) => clamp((h || 48) / base, 0.8, 1.9);
