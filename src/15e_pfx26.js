/* ===================== v12.156 試做：法杖技能改用 pixelfx 的像素特效 =====================
   玩家：「像素圖不行 那技能特效呢？」「可以先試試但盡量找可修改 可自定義」
   pixelfx（MIT）每個特效都是一段程式：顏色（palette）、角度、左右翻轉、亂數種子都能從外面改，程式本身也能改
   （例：魔力箭原本 5 支，照「三支魔力箭」改成 3 支；魔力長槍用冰槍的形狀換成紫色魔力的顏色）。
   畫法：每個特效開一張剛好包住（旋轉後）範圍的小畫布；每一幀 pixelfx 畫進去，再貼到戰鬥畫面（鏡頭裡、一般特效粒子之後）。
   法杖六招：魔力箭、魔力長槍、衝擊、風暴（全體）、四重光束、奧義魔法陣。其他技能不變。 */
const PFX26 = {
  on: true,
  map: { hd15_stArrows: 'pfx26_arrows', hd15_stLance: 'pfx26_lance', hd15_stImpact: 'pfx26_impact', hd15_stStorm: 'pfx26_storm', hd15_zjFourFold: 'pfx26_four', hd15_ogStaff: 'pfx26_circle' },
};
function pfxSpawn26(b, mod, P, o = {}) {
  const L = window.PFXLIB26; if (!L || !b || !mod) return null;
  const { k = 1, delay = 0, pre = 0, life = 0, ...opt } = o, [w, h] = mod.meta.size, [ox, oy] = mod.meta.origin, a = opt.angle || 0, fl = opt.flip ? -1 : 1, cs = Math.cos(a), sn = Math.sin(a);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [cx, cy] of [[-ox, -oy], [w - ox, -oy], [-ox, h - oy], [w - ox, h - oy]]) { const X = cx * fl * cs - cy * sn, Y = cx * fl * sn + cy * cs; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
  x0 = Math.floor(x0) - 1; y0 = Math.floor(y0) - 1; const fw = Math.ceil(x1) + 2 - x0, fh = Math.ceil(y1) + 2 - y0;
  const fx = L.createFx(mod, { ...opt, x: 0, y: 0 }); if (pre > 0) fx.update(pre);
  const cv = document.createElement('canvas'); cv.width = fw; cv.height = fh;
  const e = { fx, fr: L.createFrame(fw, fh, x0, y0), cv, c2: cv.getContext('2d'), img: new ImageData(fw, fh), P: { x: P.x, y: P.y }, x0, y0, fw, fh, k, delay, t: 0, move: null, life: life || (mod.meta.loop ? 60 : 0) };
  (b.pfx26 || (b.pfx26 = [])).push(e); return e;
}
// 從 from 打到 to：把特效裡「手」的點對上 from、「打中」的點對上 to（自動算角度和大小）
function pfxAim26(b, mod, H, Tg, from, to, o = {}) {
  const dx = to.x - from.x, dy = to.y - from.y, lx = Tg[0] - H[0], ly = Tg[1] - H[1];
  const a = Math.atan2(dy, dx) - Math.atan2(ly, lx) + (o.jit || 0), k = clamp(Math.hypot(dx, dy) / Math.hypot(lx, ly), 0.6, 1.4), cs = Math.cos(a), sn = Math.sin(a);
  const P = { x: to.x - k * (Tg[0] * cs - Tg[1] * sn), y: to.y - k * (Tg[0] * sn + Tg[1] * cs) }; const { jit, ...rest } = o;
  return pfxSpawn26(b, mod, P, { ...rest, angle: a, k });
}
function pfxStep26(b) { const list = b.pfx26; if (!list || !list.length) return;
  for (let i = list.length - 1; i >= 0; i--) { const e = list[i];
    if (e.delay > 0) { e.delay--; continue; }
    e.fx.update(1 / 60); e.t++;
    if (e.move) { const m = e.move, q = clamp(e.t / m.d, 0, 1); e.P.x = lerp(m.a.x, m.b.x, q); e.P.y = lerp(m.a.y, m.b.y, q); if (q >= 1 && !m.done) { m.done = 1; e.fx.stop(); if (m.end) m.end(); } }
    if (e.life && !e.move && e.t === e.life) e.fx.stop();
    if (e.fx.done() || e.t > 900) list.splice(i, 1); } }
function pfxDraw26(b, x) { const L = window.PFXLIB26, list = b.pfx26; if (!L || !list || !list.length) return;
  const sm = x.imageSmoothingEnabled; x.imageSmoothingEnabled = false;
  for (const e of list) { if (e.delay > 0) continue;
    L.clearFrame(e.fr); e.fx.draw(e.fr); L.composite(e.fr, e.img.data, null); e.c2.putImageData(e.img, 0, 0);
    x.drawImage(e.cv, e.P.x + e.x0 * e.k, e.P.y + e.y0 * e.k, e.fw * e.k, e.fh * e.k); }
  x.imageSmoothingEnabled = sm; }
{ const B = Battle.prototype;
  const _u = B.update; B.update = function (...a) { const r = _u.apply(this, a); if (!(this.hitstop > 0)) pfxStep26(this); return r; };
  const _ov = B.drawOverlay; B.drawOverlay = function (x) { pfxDraw26(this, x); return _ov.call(this, x); };
  const _pf = B.playFx; B.playFx = function* (name, u, t) { const k = PFX26.on && window.PFXLIB26 && u && u.hero && PFX26.map[name]; return yield* _pf.call(this, k && FX[k] ? k : name, u, t); }; }
const pfxM26 = n => window.PFXLIB26 && window.PFXLIB26.M[n];
const pfxPal26 = n => window.PFXLIB26 && window.PFXLIB26.PAL[n];
const pfxFoes26 = (b, t) => (t && t.group ? t.group : t ? [t] : []).filter(v => v && !v.hero);
const pfxFoot26 = (b, v) => { const C = b.center(v); return { x: C.x, y: typeof v.foot === 'number' ? v.foot : C.y + 18 }; };
const pfxHand26 = U => ({ x: U.x + 8, y: U.y - 6 });
Object.assign(FX, {
  // 魔力箭：三支紫色魔力彈從手邊扇形飛出、繞著飛，一支接一支打中
  *pfx26_arrows(U, T) { Sound.sfx('stCast'); pfxAim26(this, pfxM26('missiles3'), [15, -24], [152, -22], pfxHand26(U), T);
    yield* wait(30); for (let i = 0; i < 3; i++) { Sound.sfx('stBolt'); yield* wait(i < 2 ? 8 : 6); } },
  // 魔力長槍：冰槍的形狀換成紫色魔力，直直飛過去，刺中後碎成魔力碎片
  *pfx26_lance(U, T) { const pal = pfxPal26('arcane'), A = pfxHand26(U), a = Math.atan2(T.y - A.y, T.x - A.x), self = this;
    Sound.sfx('stBolt'); const e = pfxSpawn26(this, pfxM26('lance'), A, { angle: a, palette: pal });
    if (e) e.move = { a: A, b: { x: T.x, y: T.y }, d: 16, end: () => { pfxSpawn26(self, pfxM26('shatter'), { x: T.x - Math.cos(a) * 8, y: T.y - Math.sin(a) * 8 }, { angle: a, palette: pal, k: 0.8 }); } };
    yield* wait(17); Sound.sfx('arcane'); },
  // 衝擊：魔力往一點聚起來，然後白光一閃炸開，符文四散
  *pfx26_impact(U, T) { Sound.sfx('mana'); pfxSpawn26(this, pfxM26('burst'), { x: T.x, y: T.y + 28 }, { k: 0.85 }); yield* wait(14); Sound.sfx('arcane'); },
  // 風暴（全體）：星光拖著長尾巴落在每一隻魔物身上
  *pfx26_storm(U, T, u, t) { Sound.sfx('stCast'); pfxFoes26(this, t).forEach((v, i) => pfxSpawn26(this, pfxM26('starfall'), pfxFoot26(this, v), { k: 0.7, delay: i * 5, seed: 4 + i }));
    yield* wait(26); Sound.sfx('arcane'); },
  // 四重光束：四道魔力光束接連打出（角度稍微錯開）
  *pfx26_four(U, T) { const A = pfxHand26(U); for (let i = 0; i < 4; i++) { Sound.sfx('stBolt'); pfxAim26(this, pfxM26('beam'), [15, -24], [183, -24], A, T, { jit: [-0.06, 0.05, -0.02, 0.07][i], seed: 10 + i, life: 34 }); yield* wait(i < 3 ? 9 : 6); } },
  // 奧義：每隻魔物腳下畫出魔法陣，符文亮起、光柱衝上去，再連爆四次
  *pfx26_circle(U, T, u, t) { const vs = pfxFoes26(this, t); if (!vs.length) return; Sound.sfx('stCast');
    vs.forEach((v, i) => pfxSpawn26(this, pfxM26('circle'), pfxFoot26(this, v), { k: 0.8, pre: 0.5, seed: 6 + i }));
    yield* wait(40); Sound.sfx('charge'); yield* wait(21);
    for (let i = 0; i < 4; i++) { const v = vs[i % vs.length], C = this.center(v); Sound.sfx('arcane'); pfxSpawn26(this, pfxM26('burst'), { x: C.x + rnd(-6, 6), y: C.y + 22 + rnd(-6, 6) }, { k: 0.6, pre: 0.18, seed: 20 + i }); yield* wait(8); } },
});
