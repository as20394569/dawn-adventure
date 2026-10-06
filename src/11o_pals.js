/* ===================== v12.48 小夥伴 =====================
   野外打贏時偶爾（1.5%）那隻魔物會想跟著你：答應的話，牠就在地圖上跟在主角後面走。純裝飾，不參與戰鬥。
   重要物品「夥伴名冊」換要帶哪一隻。收集：成就「第一個小夥伴」「熱鬧的旅途」（10 種）、稱號「魔物之友」（20 種）。 */
const PAL13 = { CHANCE: 0.015, SCALE: 4 };
const pal13 = (st = Game.st) => st.pal13 || (st.pal13 = { got: {}, on: null });
const palKinds13 = (st = Game.st) => Object.keys(pal13(st).got).filter(k => SPECIES[k]).length;
const PAL_IMG13 = {};
// a quarter of the battle picture (a little smaller than the hero)
function palImg13(sp) { if (PAL_IMG13[sp]) return PAL_IMG13[sp]; let c = null;
  if (typeof chibiBase === 'function' && chibiBase(sp)) { const im = chibiImage(sp), M = BATTLE_PXC_META[chibiBase(sp)];
    if (im && im.ok !== false && im.complete !== false && M) { const w = Math.ceil(M.w / PAL13.SCALE), h = Math.ceil(M.h / PAL13.SCALE); c = mkCanvas(w, h); const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, M.frames.idle[0] * M.w, 0, M.w, M.h, 0, 0, w, h); } }
  if (!c) return ART[sp] ? monsterMini(sp, 16) : null;
  return PAL_IMG13[sp] = { c, flip: flipCanvas(c) }; }
ITEMS.palBook13 = { n: '夥伴名冊', key: 1, price: 0, sell: 0, cat: '重要物品', d: '記著小夥伴們的名冊。可以換要帶哪一隻夥伴。' };

/* ---------- 跟在後面走 ---------- */
Overworld.prototype.palTick13 = function () { const st = this.st, P = st && st.pal13, p = this.p;
  if (!P || !P.on || !SPECIES[P.on] || !p || !this.map) { this.pal = null; return; }
  let q = this.pal; if (!q || q.map !== this.map.id || q.sp !== P.on) { const [dx, dy] = DIRS[p.dir] || [0, 1]; q = this.pal = { map: this.map.id, sp: P.on, px: p.px - dx * 16, py: p.py - dy * 16, tx: p.px - dx * 16, ty: p.py - dy * 16, last: [p.x, p.y], dir: p.dir, walk: 0 }; }
  if (p.x !== q.last[0] || p.y !== q.last[1]) { q.tx = q.last[0] * 16; q.ty = q.last[1] * 16; q.last = [p.x, p.y]; }
  const ddx = q.tx - q.px, ddy = q.ty - q.py, d = Math.hypot(ddx, ddy);
  if (d > 56) { q.px = q.tx; q.py = q.ty; return; }
  if (d > 0.01) { const v = Math.min(d, Math.max(1, d / 10, (p.speed || 1) * (p.moving ? 1 : 0.7))); q.px += ddx / d * v; q.py += ddy / d * v; q.walk++; if (Math.abs(ddx) > 0.5) q.dir = ddx > 0 ? 'right' : 'left'; } else q.walk = 0; };
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const r = _u.apply(this, a); try { this.palTick13(); } catch (e) { this.pal = null; } return r; }; }
Overworld.prototype.palDraw13 = function (x, camX, camY) { const q = this.pal, im = q && palImg13(q.sp); if (!im) return;
  const c = q.dir === 'right' && im.flip ? im.flip : im.c, bob = q.walk ? Math.round(Math.abs(Math.sin(q.walk / 4)) * 2) : Math.round((Math.sin(this.t / 24) + 1) * 0.5);
  const cx = Math.round(q.px) - camX + 8, by = Math.round(q.py) - camY + 15;
  x.fillStyle = 'rgba(0,0,0,0.25)'; x.beginPath(); x.ellipse(cx, by - 1, Math.max(4, c.width * 0.35), 2.5, 0, 0, 7); x.fill();
  x.drawImage(c, Math.round(cx - c.width / 2), by - c.height - bob); };
// drawn with the hero: behind when it is higher up the screen, in front when lower
{ const _dc = Overworld.prototype.drawChar; Overworld.prototype.drawChar = function (x, e, frames, camX, camY) {
    if (e !== this.p || !this.pal || this.hideHero) return _dc.call(this, x, e, frames, camX, camY);
    if (this.pal.py <= e.py) { this.palDraw13(x, camX, camY); _dc.call(this, x, e, frames, camX, camY); } else { _dc.call(this, x, e, frames, camX, camY); this.palDraw13(x, camX, camY); } }; }

/* ---------- 想跟著你：野外戰鬥勝利 1.5%（還沒有的種類） ---------- */
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { const r = yield* _bs.call(this, cfg, ...a), st = Game.st;
    if (r !== 'win' || !st || !cfg || cfg.kind !== 'wild' || !st.flags.license || (typeof ARENA_ON13 !== 'undefined' && ARENA_ON13)) return r;
    const sp = cfg.sp, S = SPECIES[sp], P = pal13(st); if (!S || S.elite || S.boss || S.bty13 || P.got[sp] || !palImg13(sp)) return r;
    if (!(Game.palForce13 || Math.random() < PAL13.CHANCE)) return r;
    yield* say('（' + S.n + '好像想跟著你……）');
    if (!(yield* yesNo('要讓牠當你的小夥伴嗎？'))) { yield* say(S.n + '回到了草叢裡。'); return r; }
    P.got[sp] = 1; P.on = sp; const first = !st.bag.palBook13; st.bag.palBook13 = 1; Sound.jingle('item');
    yield* itemGet('「' + S.n + '」成為了小夥伴！');
    if (first) yield* say('（得到了「夥伴名冊」！在背包的「重要」裡換要帶哪一隻。\n小夥伴不會參加戰鬥。）');
    return r; }; }

/* ---------- 夥伴名冊 ---------- */
function* palScreen13() { const st = Game.st, P = pal13(st), K = Object.keys(P.got).filter(k => SPECIES[k]);
  if (!K.length) { yield* say('名冊上還沒有小夥伴。'); return; }
  let cur = Math.max(0, K.indexOf(P.on));
  const box = { draw(x) { const sp = K[cur]; drawWin(x, 8, 8, W - 16, 64, 'menu'); Font.drawC(x, '小夥伴 ' + K.length + ' 種', W / 2, 13, UIC.warm, UIC.textSh, 10);
      if (!sp) { Font.drawC(x, '（不帶小夥伴）', W / 2, 40, UIC.muted, UIC.textSh); return; } const im = palImg13(sp); if (im) { const c = im.c, s = Math.min(2, 40 / Math.max(c.width, c.height)); x.imageSmoothingEnabled = false; x.drawImage(c, Math.round(W / 2 - c.width * s / 2), Math.round(66 - c.height * s), Math.round(c.width * s), Math.round(c.height * s)); } } };
  UI.push(box);
  try { const items = K.map(k => ({ t: SPECIES[k].n, r: k === P.on ? '跟著你' : '' })).concat({ t: '不帶小夥伴' }, { t: '返回' });
    const r = yield* choose(items, { title: '夥伴名冊', x: 8, y: 78, w: W - 16, index: cur, onMove: i => { cur = i; } });
    if (r < 0 || r === K.length + 1) return;
    if (r === K.length) { P.on = null; yield* say('小夥伴在家裡等你。'); return; }
    P.on = K[r]; Sound.sfx('select'); yield* say('「' + SPECIES[K[r]].n + '」跟著你一起走。'); }
  finally { UI.remove(box); } }
{ const _say = say; say = function* (text, o) { if (Game.inBag13 && text === ITEMS.palBook13.d) return yield* palScreen13(); return yield* _say(text, o); }; }

TITLES.push({ id: 'pal13friend', n: '魔物之友', d: '有 20 種小夥伴。', st: { hp: 10, spd: 1 }, ok: st => palKinds13(st) >= 20 });
ACHIEVEMENTS.push({ id: 'pal13_1', n: '第一個小夥伴', d: '讓魔物成為小夥伴。', cat: '探索', ok: st => palKinds13(st) >= 1 },
  { id: 'pal13_10', n: '熱鬧的旅途', d: '有 10 種小夥伴。', cat: '探索', ok: st => palKinds13(st) >= 10 });
GROW12.push(['小夥伴', '在野外打贏時，偶爾會有魔物想跟著你。答應的話，牠會在地圖上跟在你身後（不參加戰鬥）。背包「重要」裡的夥伴名冊可以換要帶哪一隻。']);
