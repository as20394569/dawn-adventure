const PCKEY = { dig: 0, e: 0 };
Input.keys.push('run');
function pcExtraKey(e) { const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code); if (m) { if (!e.repeat) PCKEY.dig = +m[1]; return true; } if (e.code === 'KeyE') { if (!e.repeat) PCKEY.e = 1; return true; } return false; }
function pcEscKey() { const sc = Game.scene; if (sc && sc.constructor && sc.constructor.name === 'Overworld' && !UI.stack.length && !sc.script && !Game.sys.length && !Game.trans) return 'start'; return 'b'; }
if ((Game.settings.pcInit || 0) < 2) { Object.assign(Game.settings, { text: 2, bigText: true, bspd: 2, zoom: true, questHud: true, pcInit: 2 }); if (typeof saveSettings === 'function') saveSettings(); } // 第一版試玩強制關掉的放大・任務欄也開回來
const PCHOVER = [];
{ const _md = Menu.prototype.draw; Menu.prototype.draw = function (x) { _md.call(this, x); const n = this.items.length, m = this;
    for (let k = 0; k < n; k++) { const r = Math.floor(k / this.cols) - this.scrollTop, c = k % this.cols; if (r < 0 || r >= this.scrollMax) continue;
      const X = this.buttons ? this.x + this.ox + c * this.colW : (this.cols === 1 ? this.x + 2 : this.x + this.ox + c * this.colW - 7), Y = this.y + this.oy + r * this.rowH - (this.buttons ? 0 : Math.max(0, Math.floor((this.rowH - 16) / 2)));
      const Wd = this.buttons ? this.colW - 3 : (this.cols === 1 ? this.w - 4 : this.colW - 4);
      PCHOVER.push({ x: X, y: Y, w: Wd, h: this.rowH, fn: () => { if (UI.stack[UI.stack.length - 1] !== m) return; if (m.i !== k) { m.i = k; if (m.onMove) m.onMove(k); Sound.sfx('cursor'); } } }); } }; }
function pcHover(gx, gy) { for (let i = PCHOVER.length - 1; i >= 0; i--) { const r = PCHOVER[i]; if (gx >= r.x && gx < r.x + r.w && gy >= r.y && gy < r.y + r.h) { r.fn(); return true; } } return false; }
{ const _r = render; render = function () { PCHOVER.length = 0; _r(); }; }
touchTap = function (gx, gy) { Game.touchUI = false;
  for (let i = TouchR.length - 1; i >= 0; i--) { const r = TouchR[i]; if (gx >= r.x && gx < r.x + r.w && gy >= r.y && gy < r.y + r.h) { r.fn(); Game.touchUI = false; return; } }
  const top = UI.stack[UI.stack.length - 1], sc = Game.scene, nm = sc && sc.constructor && sc.constructor.name;
  if (top instanceof TextBox) { tapKey('a'); return; }
  if (!top && nm !== 'Overworld' && !(sc instanceof Battle)) tapKey('a'); };
{ const cvs = document.getElementById('screen'); let lx = -1, ly = -1;
  const pos = e => { const r = cvs.getBoundingClientRect(); return r.width ? [(e.clientX - r.left) / r.width * PCW, (e.clientY - r.top) / r.height * PCH] : null; };
  if (cvs) {
    cvs.addEventListener('pointermove', e => { const q = pos(e); if (!q) return; const [gx, gy] = q; if (Math.abs(gx - lx) < 0.5 && Math.abs(gy - ly) < 0.5) return; lx = gx; ly = gy; Game.mouse = { x: gx, y: gy, t: Game.frame }; pcHover(gx, gy); });
    document.addEventListener('pointerdown', e => { if (e.button === 2 && e.target === cvs) { e.preventDefault(); e.stopPropagation(); tapKey(pcEscKey()); } }, true);
    cvs.addEventListener('contextmenu', e => e.preventDefault());
    cvs.addEventListener('wheel', e => { const top = UI.stack[UI.stack.length - 1]; if (top instanceof Menu) { e.preventDefault(); tapKey(e.deltaY > 0 ? 'down' : 'up'); } }, { passive: false });
  } }
const PCTXT = [[/SELECT／長按A/g, 'C'], [/SELECT/g, 'C 鍵'], [/START/g, 'Esc'], [/按住B鍵?/g, '按住 X'], [/按 ?A ?鍵/g, '按 Z 鍵'], [/按A/g, '按 Z '], [/按 ?B ?鍵/g, '按 X 鍵'], [/按B/g, '按 X '],
  [/(^|[\s　（(|｜】▶◀])A(：| 決定| 使用| 選擇| 鍵|(?=[\u4e00-\u9fff]))/g, '$1Z$2'], [/(^|[\s　（(|｜】▶◀])B(：| 返回| 取消| 鍵|(?=[\u4e00-\u9fff]))/g, '$1X$2']];
function pcTxt(s) { if (typeof s !== 'string' || !/[ABST]/.test(s)) return s; for (const [a, b] of PCTXT) s = s.replace(a, b); return s; }
{ const _d = Font.draw, _w = Font.width, _wr = Font.wrap; Font.draw = (ctx, str, ...a) => _d(ctx, pcTxt(str), ...a); Font.width = (str, ...a) => _w(pcTxt(str), ...a); Font.wrap = (str, ...a) => _wr(pcTxt(str), ...a); }
const LEG = { W: 176, H: 256, drawing: false, pane: null, rec: null, last: null };
function legIsScreen(w) { try { return !!w && typeof w.draw === 'function' && /screenBG\(/.test(String(w.draw)); } catch (e) { return false; } }
function legAny() { return UI.stack.some(w => w && w.leg16); }
function legSet(on) { W = on ? LEG.W : PCW; H = on ? LEG.H : PCH; }
{ const _p = UI.push, _r = UI.remove, _c = UI.clear;
  UI.push = function (w) { if (w && (legAny() || legIsScreen(w))) { w.leg16 = 1; legSet(true); } return _p.call(this, w); };
  UI.remove = function (w) { const r = _r.call(this, w); if (!legAny()) legSet(false); return r; };
  UI.clear = function () { const r = _c.call(this); legSet(false); return r; }; }
LEG.layout = function () { const R = this.last, top = 22, wins = R ? R.wins.filter(q => q.x <= 12 && q.w >= 140 && q.y >= top - 2).sort((a, b) => a.y - b.y) : [];
  let split = null; for (const q of wins) if (q.y > top + 30 && q.y < 230) { split = q.y - 2; break; }
  const avH = PCH - 32 - 6;
  if (split == null) { const s = Math.min(1.25, avH / (256 - top)), w = 176 * s; return [{ y0: top, y1: 256, s, X: Math.round((PCW - w) / 2), Y: 32 }]; }
  const hA = split - top, hB = 256 - split, s = Math.min(1.3, avH / Math.max(hA, hB), (PCW - 36) / 352), w = 176 * s, X0 = Math.round((PCW - (w * 2 + 12)) / 2);
  return [{ y0: top, y1: split, s, X: X0, Y: 32 }, { y0: split, y1: 256, s, X: X0 + w + 12, Y: 32 }]; };
UI.draw = function (x) { const S = this.stack, li = S.findIndex(w => w && w.leg16); legSet(false);
  if (li < 0) { for (const w of S) w.draw(x); return; }
  for (let i = 0; i < li; i++) S[i].draw(x);
  const g = x.createLinearGradient(0, 0, 0, PCH); g.addColorStop(0, '#141a2e'); g.addColorStop(1, '#090b14'); x.fillStyle = g; x.fillRect(0, 0, PCW, PCH);
  const rec = { wins: [], title: '', right: [] }, panes = LEG.layout();
  let ls = li; for (let i = li; i < S.length; i++) if (legIsScreen(S[i])) ls = i;
  const dlg = S.slice(ls + 1).filter(w => w instanceof TextBox || w instanceof Menu), inPane = S.slice(li).filter(w => !dlg.includes(w));
  try {
    panes.forEach((pn, k) => { legSet(true); LEG.drawing = true; LEG.pane = pn; LEG.rec = k === 0 ? rec : null;
      x.save(); x.translate(pn.X, pn.Y); x.scale(pn.s, pn.s); x.translate(0, -pn.y0); x.beginPath(); x.rect(0, pn.y0, 176, pn.y1 - pn.y0); x.clip();
      try { for (const w of inPane) w.draw(x); } finally { x.restore(); LEG.drawing = false; LEG.pane = null; LEG.rec = null; legSet(false); } });
    if (dlg.length) { x.fillStyle = 'rgba(4,6,12,0.45)'; x.fillRect(0, 0, PCW, PCH); const s = 1.25, tb = dlg.find(w => w instanceof TextBox);
      const tbBox = tb ? { X: Math.round((PCW - tb.w * s) / 2), Y: Math.round(PCH - 8 - tb.h * s) } : null;
      for (const w of dlg) { const X = w instanceof TextBox ? tbBox.X : tbBox ? tbBox.X + tb.w * s - w.w * s : Math.round((PCW - w.w * s) / 2), Y = w instanceof TextBox ? tbBox.Y : tbBox ? tbBox.Y - w.h * s - 4 : Math.round((PCH - w.h * s) / 2);
        const pn = { y0: 0, y1: 9999, all: 1, s, X: X - w.x * s, Y: Y - w.y * s };
        legSet(true); LEG.drawing = true; LEG.pane = pn; x.save(); x.translate(pn.X, pn.Y); x.scale(s, s);
        try { w.draw(x); } finally { x.restore(); LEG.drawing = false; LEG.pane = null; legSet(false); } } }
  } finally { legSet(false); }
  LEG.last = rec;
  x.fillStyle = 'rgba(6,8,14,0.85)'; x.fillRect(0, 0, PCW, 26); x.fillStyle = 'rgba(127,227,208,0.5)'; x.fillRect(0, 26, PCW, 1); x.fillStyle = KB12.acc; x.fillRect(10, 7, 3, 13);
  if (rec.title) Font.draw(x, rec.title, 19, 4, KB12.txt, 'rgba(0,0,0,0.55)', 14);
  let rx = PCW - 10; for (const t of rec.right.slice().reverse()) { const s = String(t.s); Font.draw(x, s, rx - Font.width(s, 11), 6, t.c || KB12.mut, 'rgba(0,0,0,0.55)', 11); rx -= Font.width(s, 11) + 14; }
  Font.drawR(x, 'Z 決定　X／Esc 返回', PCW - 10, PCH - 14, 'rgba(154,163,189,0.7)', null, 9); };
{ const _t = tick; tick = function () { legSet(legAny()); try { return _t(); } finally { legSet(false); } }; }
{ const _r = render; render = function () { legSet(false); try { return _r(); } finally { legSet(false); } }; }
{ const _sb0 = screenBG; screenBG = function (x) { if (LEG.drawing) return; return _sb0(x); };
  const _hb = headerBar; headerBar = function (x, title) { if (LEG.drawing) { if (LEG.rec) LEG.rec.title = title; return; } return _hb(x, title); };
  const _dw = drawWin; drawWin = function (x, X, Y, w, h, style) { if (LEG.drawing) { if (LEG.rec) LEG.rec.wins.push({ x: X, y: Y, w, h }); if (style === 'sign') return _dw(x, X, Y, w, h, style); return KB12.panel(x, X, Y, w, h, { r: 5 }); } return _dw(x, X, Y, w, h, style); };
  const _sl = selBar; selBar = function (x, X, Y, w, h = 15) { if (LEG.drawing) { x.save(); KB12.rr(x, X, Y, w, h, 3); x.fillStyle = 'rgba(127,227,208,0.16)'; x.fill(); x.fillStyle = KB12.acc; x.fillRect(X, Y + 2, 1.5, h - 4); x.restore(); return; } return _sl(x, X, Y, w, h); };
  const _bt = drawBtn; drawBtn = function (x, X, Y, w, h, on, strip) { if (LEG.drawing) { KB12.panel(x, X, Y, w, h, { r: 4, rim: on ? KB12.acc : 'rgba(255,255,255,0.14)', top: on ? 'rgba(40,80,76,0.9)' : null }); if (strip) { x.fillStyle = strip; x.fillRect(X + 2, Y + 3, 1.5, h - 6); } return; } return _bt(x, X, Y, w, h, on, strip); };
  const _fd = Font.draw; Font.draw = function (ctx, str, X, Y, col, sh, size) { if (LEG.drawing && Y < 18 && X > 40) { if (LEG.rec && str !== '' && str != null) LEG.rec.right.push({ s: str, c: col }); return X; } return _fd.call(this, ctx, str, X, Y, col, sh, size); }; }
LEG.map = r => { const pn = LEG.pane; if (!pn) return null; const cy = r.y + r.h / 2; if (!pn.all && (cy < pn.y0 || cy >= pn.y1)) return null; return { x: pn.X + r.x * pn.s, y: pn.Y + (r.y - pn.y0) * pn.s, w: r.w * pn.s, h: r.h * pn.s }; };
{ const _tr = touchRegion; touchRegion = function (x, y, w, h, fn) { if (LEG.drawing) { const q = LEG.map({ x, y, w, h }); if (!q) return; return _tr(q.x, q.y, q.w, q.h, fn); } return _tr(x, y, w, h, fn); }; }
PCHOVER.push = function (...rs) { for (const r of rs) { if (LEG.drawing) { const q = LEG.map(r); if (q) Array.prototype.push.call(this, { ...r, ...q }); } else Array.prototype.push.call(this, r); } return this.length; };
{ const cvs = document.getElementById('screen'); if (cvs) cvs.addEventListener('wheel', e => { const top = UI.stack[UI.stack.length - 1]; if (top && top.leg16 && !(top instanceof Menu)) { e.preventDefault(); tapKey(e.deltaY > 0 ? 'down' : 'up'); } }, { passive: false }); }
const PCB = {
  mx: 4, mw: 296, top: BB_Y + 1, h: BB_H - 2, stX: 304, stW: 172,
  hpCx: HERO_X + HD_HERO_OX + 28, mpCx: HERO_X + HD_HERO_OX + 52, popY: HERO_FOOT - 30,
  NAMES: ['攻擊', '技能', '道具', '防禦', '逃跑'],
  cmd: { x: 156, y: 104, w: 78, row: 18 }, sk: { x: 240, y: 26, w: 236 },
  SLOTS: { 1: [[352, 170]], 2: [[404, 158], [298, 176]], 3: [[278, 178], [366, 154], [448, 178]] },
};
PCB.port = v => { try { return (v.hero ? portraitOf({ hero: 1 }) : portraitOf({ sp: v.sp })) || null; } catch (e) { return null; } };
PCB.para = function (x, t, X, y0, w, hMax, col, z = 11) { const src = String(t || '').split('\n'); for (const s of [z, 9]) { const lh = s + 4, L = src.flatMap(q => Font.wrap(q, w, s)); if (L.length * lh <= hMax || s === 9) { L.slice(0, Math.max(1, Math.floor(hMax / lh))).forEach((q, i) => Font.draw(x, q, X, y0 + i * lh, col, 'rgba(0,0,0,0.55)', s)); return; } } };
{ const big = z => z <= 8 ? 9 : z <= 11.5 ? 11 : z, on = () => { const b = Game.scene; return !!(b && b instanceof Battle); }; // 畫的時候：12l 的對照表在 build_pc 改成 9・11
  const _t = tick; tick = function () { if (!on()) return _t(); const o = Font.bz; Font.bz = big; try { return _t(); } finally { Font.bz = o; } }; } // 換行（在邏輯那一格算）也用同樣的字級
KB12.chipW = s => Math.ceil(Font.width(s, KB12.S)) + 8;
KB12.chip = (x, s, X, Y, col, bg) => { const w = KB12.chipW(s); x.save(); KB12.rr(x, X, Y - 1.5, w, 12, 4); x.fillStyle = bg || 'rgba(30,34,52,0.9)'; x.fill(); x.lineWidth = 0.5; x.strokeStyle = col; x.globalAlpha *= 0.55; x.stroke(); x.restore(); KB12.tc(x, s, X + w / 2, Y + 4.5, col, KB12.S); return w; };
{ const P = BattleCore.prototype, _pr = P.planRound, _bo = P.buildOrder;
  P.planRound = function () { if (this.round === 1 && this.cfg.pcFirst === 'B' && !this.auto) { this.auto = true; try { return _pr.call(this); } finally { this.auto = false; } } return _pr.call(this); };
  P.buildOrder = function () { const r = _bo.call(this); if (this.round === 1 && this.cfg.pcFirst) { const keep = this.cfg.pcFirst === 'A' ? u => u.side === 'A' : u => u.side === 'B'; const before = this.order.length; this.order = this.order.filter(e => keep(this.byId[e.id])); if (this.order.length !== before) { this.orderPos = {}; this.order.forEach((e, i) => { if (this.orderPos[e.id] == null) this.orderPos[e.id] = i; }); } } return r; }; }
{ const _in = Battle.prototype.intro; Battle.prototype.intro = function* () { yield* _in.call(this); const f = this.cfg && this.cfg.pcFirst;
    if (f === 'A') yield* this.msg('先制攻擊！從背後碰到牠——第一回合魔物來不及動！', { hold: 34 }); else if (f === 'B') yield* this.msg('被偷襲了！第一回合只有魔物能動！', { hold: 34 }); };
  const _h = Battle.prototype.handlers, _to = _h.TURN_ORDER; _h.TURN_ORDER = function* (e, s, t, P) { if (_to) yield* _to.call(this, e, s, t, P); if (P && P.order && this.cfg && this.cfg.pcFirst && P.round === 1) this.order12 = { ids: P.order.slice(), done: 0 }; }; }
Battle.prototype.layout = function (snap) {
  const L = this.foes(), n = L.length, rank = v => v.boss ? 0 : v.elite ? 1 : v.minion ? 3 : 2;
  const order = L.map((v, i) => [v, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(a => a[0]);
  let P; if (n <= 3) { const S = PCB.SLOTS[Math.max(1, n)], pos = n === 3 ? [1, 0, 2] : [0, 1, 2]; P = order.map((v, k) => S[pos[k]]); }
  else { P = L.map((v, k) => [Math.round(262 + (k + 0.5) * (206 / n)), k % 2 ? 158 : 178]); order.length = 0; order.push(...L); }
  order.forEach((v, k) => { const p = P[k]; v.tx = p[0]; v.foot = v.foot0 = p[1]; if (snap) v.x = p[0]; });
  this.tallE18 = TALL_EXT; };
Battle.prototype.lay22 = function () { return null; };
Battle.prototype.bigS22 = function (v, h0) { if (!v || v.hero || !(h0 > 0)) return 1; const want = v.boss ? 1.75 : v.elite ? 1.6 : 1.45, room = (v.foot - 50) / h0; return clamp(Math.floor(Math.min(want, room) * 4) / 4, 1, 2); };
PCB.side = function (b) { const st = Game.st, F = heroFramesFor(st), set = F.right || F.down, A = b.H && b.H.A, fi = A && (A.state === 'attack') ? 1 : 0, src0 = set[fi] || set[0], src = src0.ow23 || src0, o = src0.ow23 ? src0.ow23.o23 || 0 : 0, K = 3;
  const key = st && JSON.stringify(st.equip) + fi; let base = b.pcSideBase && b.pcSideBase[key];
  if (!base) { base = mkCanvas(src.width * K, src.height * K); const g = base.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, src.width * K, src.height * K); b.pcSideBase = { ...(b.pcSideBase || {}), [key]: base }; }
  const c = b.pcSideOut || (b.pcSideOut = mkCanvas(base.width, base.height)); if (c.width !== base.width || c.height !== base.height) { c.width = base.width; c.height = base.height; }
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, c.width, c.height); g.drawImage(base, 0, 0);
  c.px = 1; c.ds = 1; c.bb = { cx: c.width / 2, bot: (22 + o) * K, w: 16 * K, h: 22 * K, top: o * K }; return c; };
{ const _hb = heroBattleImgLook; heroBattleImgLook = function (frame, L) { const b = Game.scene; if (b instanceof Battle && b.pcSide) return PCB.side(b); return _hb(frame, L); }; }
{ const _dr = Battle.prototype.draw; Battle.prototype.draw = function (x) { if (!this.pcSide) { this.pcSide = 1; if (this.H) { this.H.spx = null; this.H.img = null; } } _dr.call(this, x); if (this.cover > 0.5 || !this.H) return;
    const a = clamp((this.boxF + 30) / 34, 0, 1); if (a <= 0) return; x.save(); x.globalAlpha = a; try { this.pcStatus(x); this.pcChoose(x); } finally { x.restore(); } }; }
Battle.prototype.pcHoverCmd = function () { const C = this.pcCmd, hu = this.core.byId.H; if (!C) return null;
  if (C.mode === 'cmd') return [{ type: 'skill', skill: hu.data.attackSkill }, C.list && C.list[C.j] ? { type: 'skill', skill: C.list[C.j] } : null, { type: 'item' }, { type: 'defend' }, { type: 'run' }][C.i];
  const sk = C.mode === 'target' && this.pcPick ? this.pcPick.skill : C.list && C.list[C.j]; return sk ? { type: 'skill', skill: sk } : null; };
Battle.prototype.pcThisRound = function () { const c = this.core;
  if (c.need && c.need.plan && this.pcCmd) { const had = 'H' in c.plan, keep = c.plan.H, h = this.pcHoverCmd(); if (h) c.plan.H = h; try { return { ids: c.previewOrder(), done: 0, preview: 1 }; } finally { if (had) c.plan.H = keep; else delete c.plan.H; } }
  return this.order12 || null; };
Battle.prototype.pcNextRound = function () { const c = this.core, ups = c.units.filter(u => c.isUp(u)), sp = {}; for (const u of ups) { try { sp[u.id] = BR.speed(c, u); } catch (e) { sp[u.id] = 0; } }
  return ups.sort((a, b) => sp[b.id] - sp[a.id] || (a.hero ? -1 : b.hero ? 1 : a.id < b.id ? -1 : 1)).map(u => u.id); };
PCB.order = function (x) { const O = this.pcThisRound(), N = this.pcNextRound(), S = 9, X0 = 6, Y0 = 4, lw = 40;
  const row = (ids, y, sz, done, now, dim) => { let X = X0 + lw; ids.forEach((id, i) => { const v = this.views[id]; if (!v || v.gone) return; const past = i < done - (now ? 1 : 0), cur = now && i === done - 1;
      if (past) return; x.save(); x.globalAlpha *= dim ? 0.75 : 1; KB12.rr(x, X, y, sz, sz, 4); x.fillStyle = v.hero ? 'rgba(34,66,120,0.95)' : 'rgba(96,28,40,0.94)'; x.fill(); x.clip();
      if (v.pcPort === undefined) v.pcPort = PCB.port(v); const P = v.pcPort; if (P) { x.imageSmoothingEnabled = true; x.drawImage(P, X + 1, y + 1, sz - 2, sz - 2); x.imageSmoothingEnabled = false; } else KB12.tc(x, (v.n || '?').slice(0, 1), X + sz / 2, y + sz / 2, '#fff', 9);
      x.restore(); x.save(); KB12.rr(x, X, y, sz, sz, 4); x.lineWidth = cur ? 1.6 : 0.6; x.strokeStyle = cur ? KB12.gold : this.pickV === v ? '#ffd860' : 'rgba(255,255,255,0.28)'; x.stroke(); x.restore();
      const m = !v.hero && /([A-G])$/.exec(v.n || ''); if (m) { x.save(); KB12.rr(x, X + sz - 9, y + sz - 9, 9, 9, 2); x.fillStyle = 'rgba(10,10,20,0.9)'; x.fill(); x.restore(); KB12.tc(x, m[1], X + sz - 4.5, y + sz - 4.5, '#ffd4d4', 9); }
      X += sz + 3; }); return X; };
  const ids = O && O.ids ? O.ids : N, done = O ? O.done || 0 : 0, n1 = ids.length, w = lw + Math.max(n1 * 25, N.length * 21) + 8;
  KB12.panel(x, 3, 2, w, 48, { r: 6, top: 'rgba(20,24,40,0.75)', bot: 'rgba(8,10,18,0.82)' });
  KB12.tl(x, '這回合', X0 + 2, Y0 + 11, KB12.txt, S); KB12.tl(x, '下回合', X0 + 2, Y0 + 34, KB12.mut, S);
  row(ids, Y0, 22, done, !(O && O.preview) && done > 0, false); row(N, Y0 + 26, 18, 0, false, true);
  const rs = '第 ' + Math.max(1, this.round || 1) + ' 回合'; KB12.tc(x, rs, 3 + w / 2, 58, KB12.mut, S); };
Battle.prototype.drawOrder = function () {};
Battle.prototype.drawBoxF = function (x) { if (this.boxF < -20) return; const a0 = clamp((this.boxF + 30) / 34, 0, 1), C = this.pcCmd;
  if (C && !UI.stack.length) { touchRegion(0, 0, W, H, () => { if (C.mode !== 'cmd') tapKey('b'); }); this.pcFoeRegions(C); }
  x.save(); x.globalAlpha = a0; for (const v of this.foes()) if (!v.gone && v.alpha > 0.3) this.pcLabel(x, v); x.restore();
  KB12.intents.call(this, x); x.save(); x.globalAlpha = a0; PCB.order.call(this, x); x.restore(); this.drawSpd12(x); };
Battle.prototype.pcLabel = function (x, v) { const w = 74, X = Math.round(clamp(v.x + v.off.x - w / 2, 2, W - w - 2)), Y = Math.round(v.foot + 4), on = this.pickV === v, u = v.u;
  const rim = on ? KB12.gold : v.boss ? '#ff6b7a' : v.elite ? KB12.warm : v.rare ? '#ffd84a' : null;
  KB12.panel(x, X, Y, w, 22, { r: 4, rim: rim || 'rgba(255,255,255,0.16)', lw: rim ? 1 : 0.6, glow: on ? 'rgba(255,216,96,0.8)' : null, top: 'rgba(24,28,44,0.82)', bot: 'rgba(10,12,22,0.9)' });
  KB12.tc(x, v.n, X + w / 2, Y + 6.5, on ? '#fff2c8' : KB12.txt, 9, w - 8);
  const hr = clamp(v.hp / Math.max(1, v.maxhp), 0, 1); KB12.bar(x, X + 4, Y + 13, w - 8, 5, hr, KB12.hpCols(hr));
  if (v.brkMax) for (let k = 0; k < v.brkMax; k++) { x.fillStyle = v.broken ? '#ff6050' : k < v.brk ? '#8ad0ff' : 'rgba(255,255,255,0.2)'; KB12.rr(x, X + 4 + k * 5, Y + 19.5, 4, 2, 1); x.fill(); }
  const L = KB12.signs.call(this, v, true); if (L.length) KB12.chipRow(x, L.slice(0, 2), X, Y + 26, w + 40);
  if (on) KB12.tc(x, Math.max(0, Math.ceil(v.hp)) + ' / ' + v.maxhp, X + w / 2, Y - 8, '#ffffff', 9); };
Battle.prototype.pcFoeRect = function (v) { const bb = v.img && v.img.bb, hw = clamp(bb ? (bb.vw ? bb.vw / 2 : bb.w * 0.4) : 22, 16, 56), bh = v.bbh || 44; return { x: v.x + v.off.x - hw, y: v.foot - bh - 4, w: hw * 2, h: bh + 30 }; };
Battle.prototype.pcFoeRegions = function (C) { const core = this.core, m = Game.mouse; let hov = null;
  for (const v of this.foes()) { if (!core.isUp(v.u)) continue; const r = this.pcFoeRect(v);
    touchRegion(r.x, r.y, r.w, r.h, () => this.pcFoeTap(v)); if (C.mode === 'target') PCHOVER.push({ x: r.x, y: r.y, w: r.w, h: r.h, fn: () => this.pcFoeHover(v) });
    if (m && m.x >= r.x && m.x < r.x + r.w && m.y >= r.y && m.y < r.y + r.h) hov = v; }
  if (C.mode !== 'target') this.pickV = hov; };
Battle.prototype.pcFoeTap = function (v) { const C = this.pcCmd, P = this.pcPick; if (!C) return; if (C.mode === 'cmd') C.ftap = v; else if (C.mode === 'target' && P) P.tap = P.E[P.i].v === v ? P.i : P.E.findIndex(q => q.v === v); };
Battle.prototype.pcFoeHover = function (v) { const P = this.pcPick; if (P && P.E[P.i].v !== v) P.hovI = P.E.findIndex(q => q.v === v); };
{ const _ds = Battle.prototype.drawStage; Battle.prototype.drawStage = function (x) { _ds.call(this, x); const v = this.pickV; if (!v || v.gone || v.hero) return;
    const p = (this.t % 40) / 40, bb = v.img && v.img.bb, rw = clamp(bb ? bb.w * 0.5 : 24, 16, 56); x.save(); x.beginPath(); x.ellipse(v.x + v.off.x, v.foot - 1, rw + p * 4, 6 + p * 1.5, 0, 0, Math.PI * 2);
    x.fillStyle = 'rgba(255,216,96,0.16)'; x.fill(); x.strokeStyle = 'rgba(255,216,96,' + (0.95 - p * 0.5).toFixed(2) + ')'; x.lineWidth = 1.5; x.stroke(); x.restore(); }; }
Battle.prototype.drawBoxH = function (x) { const Hv = this.H; if (!Hv || this.boxF < -20) return; const L = KB12.signs.call(this, Hv, false); if (!L.length) return;
  const C = this.center(Hv), w = L.reduce((a, q) => a + KB12.chipW(q[0]) + 2, 0); KB12.chipRow(x, L, Math.round(C.x - w / 2), HERO_FOOT - 82, 220); };
Battle.prototype.pcStatus = function (x) { const st = Game.st, Hv = this.H, core = this.core, hu = core && core.byId.H, X = PCB.stX, Y = PCB.top, w = PCB.stW, h = PCB.h;
  KB12.panel(x, X, Y, w, h, { r: 5 });
  if (Hv.pcPort === undefined) Hv.pcPort = PCB.port(Hv); const P = Hv.pcPort;
  x.save(); KB12.rr(x, X + 5, Y + 5, 30, 30, 5); x.fillStyle = 'rgba(70,90,130,0.6)'; x.fill(); x.clip(); if (P) { x.imageSmoothingEnabled = true; x.drawImage(P, X + 5, Y + 5, 30, 30); x.imageSmoothingEnabled = false; } x.restore();
  const nx = X + 40, bw = X + w - 6 - nx; KB12.tl(x, st.name, nx, Y + 8, KB12.txt, 11); KB12.tr(x, 'Lv' + st.lv, X + w - 6, Y + 8.5, KB12.warm, 9);
  const r = clamp(Hv.hp / Math.max(1, Hv.maxhp), 0, 1), mr = clamp(Hv.mp / (Hv.maxmp || 1), 0, 1);
  KB12.bar(x, nx, Y + 16, bw, 9, r, r > 0.5 ? ['#2f9a58', '#62e08a'] : r > 0.2 ? ['#c88a10', '#ffc040'] : ['#c8343a', '#ff6a5a'], 'HP', Math.ceil(Hv.hp) + '/' + Hv.maxhp);
  KB12.bar(x, nx, Y + 28, bw, 9, mr, ['#2a64c8', '#62a8ff'], 'MP', Math.round(Hv.mp) + '/' + (Hv.maxmp || 0));
  let gx = X + 6; const gy = Y + 46;
  const gauge = (label, n, N, yy, ok, blink) => { KB12.tl(x, label, gx, gy, ok ? KB12.gold : KB12.mut, 9); gx += Math.ceil(Font.width(label, 9)) + 4;
    for (let i = 0; i < N; i++) { const on = i < n; x.fillStyle = on ? (blink && Math.floor(this.t / 8) % 2 ? '#ffffff' : ok ? KB12.gold : '#8ad0ff') : 'rgba(255,255,255,0.15)'; x.beginPath(); x.arc(gx + i * 8 + 3, gy, 3, 0, 7); x.fill(); }
    gx += N * 8 + 8; };
  if ('wc' in Hv.max && Hv.max.wc) { const n = Math.min(Hv.max.wc, Hv.res.wc || 0); gauge('特技', n, Hv.max.wc, gy, n >= Hv.max.wc, n >= Hv.max.wc); }
  try { this.drawClassRes(x, gauge, gy); } catch (e) { }
  if ((Hv.res.combo || 0) > 0 && hu) gx += KB12.chip(x, '連段×' + Hv.res.combo, gx, gy - 4.5, KB12.gold, 'rgba(70,52,10,0.92)') + 4; };
PCB.icon = KB12.icon;
Battle.prototype.pcChoose = function (x) { const C = this.pcCmd; if (!C || UI.stack.length) return; const tb = false;
  const K = PCB.cmd, ch = 8 + 5 * K.row; KB12.panel(x, K.x, K.y, K.w, ch, { r: 6, rim: 'rgba(255,255,255,0.22)' });
  for (let k = 0; k < 5; k++) { const y = K.y + 4 + k * K.row, on = C.i === k && C.mode === 'cmd', sel = C.i === k, dis = k === 4 && this.anyBoss();
    if (sel) { x.save(); KB12.rr(x, K.x + 3, y, K.w - 6, K.row - 1, 4); x.fillStyle = on ? 'rgba(255,196,107,0.22)' : 'rgba(255,255,255,0.08)'; x.fill(); if (on) { x.fillStyle = KB12.warm; x.fillRect(K.x + 3, y + 3, 2, K.row - 7); } x.restore(); }
    PCB.icon(x, k, K.x + 16, y + K.row / 2 - 0.5, dis ? '#5a6070' : sel ? '#ffe8b0' : '#b8c0d4');
    KB12.tl(x, PCB.NAMES[k], K.x + 28, y + K.row / 2, dis ? '#6a7080' : sel ? '#fff2d8' : KB12.txt, 11); KB12.tr(x, String(k + 1), K.x + K.w - 6, y + K.row / 2, 'rgba(200,210,230,0.45)', 9);
    if (C.mode === 'cmd') { touchRegion(K.x, y, K.w, K.row, () => { C.tap = k; }); PCHOVER.push({ x: K.x, y, w: K.w, h: K.row, fn: () => { if (C.mode === 'cmd' && C.i !== k) { C.i = k; Sound.sfx('cursor'); } } }); } }
  if (C.mode === 'skill' || (C.mode === 'target' && C.list && this.pcPick && C.list.includes(this.pcPick.skill))) this.pcSkillList(x, C);
  KB12.panel(x, PCB.mx, PCB.top, PCB.mw, PCB.h, { r: 5 });
  const X = PCB.mx + 8, Y = PCB.top + 5, w = PCB.mw - 16, hint = (s) => KB12.tr(x, s, PCB.mx + PCB.mw - 8, PCB.top + PCB.h - 7, KB12.mut, 9);
  if (C.mode === 'cmd') { const I = PCB.info(this, C.i); Font.draw(x, I.t, X, Y, KB12.txt, 'rgba(0,0,0,0.55)', 11); if (I.d) PCB.para(x, I.d, X, Y + 17, w, 28, '#c9cfe4', 11); hint('↑↓ 選擇　Z 決定　數字鍵 1〜5　點魔物＝攻擊'); }
  else if (C.mode === 'skill') this.pcSkillInfo(x, X, Y, w);
  else if (C.mode === 'target') this.pcTargetInfo(x, X, Y, w); };
PCB.info = function (b, k) { const core = b.core, hu = core.byId.H;
  if (k === 0) { const sk = hu.data.attackSkill, f = b.pickV || b.foes().find(v => core.isUp(v.u)), est = f ? b.estimate(sk, f.id) : 0; return { t: b.skillName(sk, 'H') + (b.pickV ? '　→ ' + b.pickV.n : '') + (est ? '　預估≈' + est : ''), d: '普通攻擊。打中會累積招式點。' }; }
  if (k === 1) return { t: '技能', d: '用 MP 或招式點的招式。' };
  if (k === 2) return { t: '道具', d: '用道具時，這回合你會最先動。' };
  if (k === 3) return { t: '防禦', d: '這回合最先動，到下一次行動前受到的傷害減半。' };
  return b.anyBoss() ? { t: '逃跑', d: '這場戰鬥不能逃跑。' } : { t: '逃跑', d: '這回合最先動，試著逃走。' }; };
Battle.prototype.pcSkillList = function (x, C) { const L = C.list, n = L.length, K = PCB.sk, rh = 17, h = 24 + n * rh + 4, X = K.x, Y = Math.max(K.y, PCB.cmd.y + 8 + 5 * PCB.cmd.row - h), w = K.w, act = C.mode === 'skill';
  KB12.panel(x, X, Y, w, h, { r: 6, rim: 'rgba(255,255,255,0.22)' }); KB12.tl(x, '技能', X + 10, Y + 11, KB12.acc, 11); KB12.tr(x, 'MP ' + Math.round(this.H.mp) + '/' + (this.H.maxmp || 0), X + w - 10, Y + 11.5, '#8ab8ff', 9);
  x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(X + 8, Y + 21, w - 16, 0.6);
  L.forEach((id, k) => { const ry = Y + 24 + k * rh, on = k === C.j, D = DEF.skills[id], can = this.canUse(id).ok, cy = ry + rh / 2;
    if (on) { x.save(); KB12.rr(x, X + 4, ry, w - 8, rh - 1, 4); x.fillStyle = act ? 'rgba(127,227,208,0.18)' : 'rgba(255,255,255,0.08)'; x.fill(); if (act) { x.fillStyle = KB12.acc; x.fillRect(X + 4, ry + 3, 2, rh - 7); } x.restore(); }
    KB12.tc(x, String(k + 1), X + 15, cy, on ? KB12.gold : KB12.mut, 9);
    const nm = (D.tags.includes('sig') ? '★' : '') + this.skillName(id, 'H'); KB12.tl(x, nm, X + 26, cy, can ? (on ? '#fff2c8' : KB12.txt) : UIC.dis, Font.width(nm, 11) > 150 ? 9 : 11);
    KB12.tr(x, this.costText(id) || '', X + w - 10, cy, can ? '#8ab8ff' : UIC.bad, 9);
    if (act) { touchRegion(X + 4, ry, w - 8, rh, () => { C.tap = k; }); PCHOVER.push({ x: X + 4, y: ry, w: w - 8, h: rh, fn: () => { if (C.mode === 'skill' && C.j !== k) { C.j = k; Sound.sfx('cursor'); } } }); } }); };
Battle.prototype.pcSkillInfo = function (x, X, Y, w) { const C = this.pcCmd, id = C.list[C.j], D = DEF.skills[id], core = this.core, can = this.canUse(id);
  const col = ({ 物: '#ffb070', 特: '#b090ff' })[D.cat] || '#9adfc0', type = (D.tags.includes('sig') ? '職業招式・' : '') + (D.cat === '變' ? '輔助' : D.cat === '物' ? '物理' : '魔法') + (D.target === 'all_enemies' ? (D.chain ? '・連鎖' : '・全體') : '');
  const mv = typeof MOVES !== 'undefined' && MOVES[id] ? skillMove(id) : null, pw = D.power ? (mv && typeof powTxt === 'function' ? powTxt(mv) : '威力' + D.power) : '', f = this.pickV || this.foes().find(v => core.isUp(v.u)), est = can.ok && D.power && f ? this.estimate(id, f.id) : 0;
  let ex = Font.draw(x, this.skillName(id, 'H'), X, Y, col, 'rgba(0,0,0,0.55)', 11); ex = Font.draw(x, '　' + type + (pw ? '・' + pw : ''), ex, Y + 1, '#c9cfe4', 'rgba(0,0,0,0.55)', 9); if (est) Font.draw(x, '　預估≈' + est, ex, Y + 1, KB12.warm, 'rgba(0,0,0,0.55)', 9);
  if (!can.ok) KB12.tr(x, can.res === 'sgp' ? '招式點不夠' : can.res ? 'MP 不夠' : '不能用', X + w, Y + 6, UIC.bad, 9);
  PCB.para(x, (mv && mv.d) || D.desc || '', X, Y + 16, w, 30, KB12.txt, 11);
  KB12.tr(x, '↑↓ 選擇　Z 使用　X 返回　1〜' + Math.min(9, C.list.length), PCB.mx + PCB.mw - 8, PCB.top + PCB.h - 7, KB12.mut, 9); };
Battle.prototype.pcTargetInfo = function (x, X, Y, w) { const P = this.pcPick; if (!P) return; const q = P.E[P.i], core = this.core;
  const t = q.p ? '◆' + q.p.n + '　耐久 ' + Math.ceil(q.p.hp) + '/' + q.p.max : q.v.n + '　HP ' + Math.max(0, Math.ceil(q.v.hp)) + '/' + q.v.maxhp;
  const prev = core.part11; core.part11 = q.p ? { t: q.v.id, k: q.k } : null; let n = 0; try { n = this.estimate(P.skill, q.v.id); } catch (e) { n = 0; } finally { core.part11 = prev; }
  let ex = Font.draw(x, '選擇目標 ' + (P.i + 1) + '／' + P.E.length + '　', X, Y, KB12.acc, 'rgba(0,0,0,0.55)', 11); ex = Font.draw(x, t, ex, Y, q.p ? '#ffd070' : KB12.txt, 'rgba(0,0,0,0.55)', 11);
  if (n) Font.draw(x, '　預估≈' + n, ex, Y + 1, KB12.warm, 'rgba(0,0,0,0.55)', 9);
  if (q.p && typeof mvName11 === 'function') Font.draw(x, '打壞：「' + mvName11(q.p.mv) + '」威力減半＋稀有部位', X, Y + 17, KB12.mut, 'rgba(0,0,0,0.55)', 9);
  KB12.tr(x, '←→ 選擇　Z 決定　X 返回　也可以直接點魔物', PCB.mx + PCB.mw - 8, PCB.top + PCB.h - 7, KB12.mut, 9); };
Battle.prototype.pcCommand = function* () {
  const core = this.core, hu = core.byId.H;
  const C = this.pcCmd = { mode: 'cmd', i: clamp(this.cmdIdx || 0, 0, 4), j: this.moveIdx || 0, tap: null, ftap: null, list: hu.skills.filter(id => DEF.skills[id] && id !== hu.data.attackSkill).slice(0, 9) };
  const dig = () => { const d = PCKEY.dig; PCKEY.dig = 0; return d; };
  PCKEY.dig = 0; this.idle = true;
  try {
    while (true) {
      yield;
      if (C.mode === 'cmd') {
        let go = -1; const d = dig();
        if (C.ftap) { const v = C.ftap; C.ftap = null; if (core.isUp(v.u)) { Sound.sfx('select'); this.cmdIdx = 0; return { type: 'skill', skill: hu.data.attackSkill, targets: [v.id] }; } continue; }
        if (C.tap != null) { go = C.tap; C.tap = null; }
        else if (d >= 1 && d <= 5) go = d - 1;
        else if (Input.pressed('up') || Input.pressed('left')) { Input.consume('up', 'left'); C.i = (C.i + 4) % 5; Sound.sfx('cursor'); }
        else if (Input.pressed('down') || Input.pressed('right')) { Input.consume('down', 'right'); C.i = (C.i + 1) % 5; Sound.sfx('cursor'); }
        else if (Input.pressed('a')) { Input.consume('a'); go = C.i; }
        else if (Input.pressed('b')) Input.consume('b');
        if (go < 0) continue; C.i = go; this.cmdIdx = go;
        if (go === 0) { Sound.sfx('select'); const tg = yield* this.pickTarget(hu.data.attackSkill); if (tg) return { type: 'skill', skill: hu.data.attackSkill, targets: [tg] }; continue; }
        if (go === 1) { if (!C.list.length) { yield* this.chooseMove(); continue; } Sound.sfx('select'); C.j = clamp(C.j, 0, C.list.length - 1); C.mode = 'skill'; continue; }
        if (go === 2) { Sound.sfx('select'); const it = yield* bagScreen('battle'); if (!it) continue; if (!DEF.items[it]) { yield* this.msg('現在不能使用這個道具。'); continue; } return { type: 'item', item: it }; }
        if (go === 3) { Sound.sfx('select'); return { type: 'defend' }; }
        if (go === 4) { if (this.anyBoss()) { Sound.sfx('cancel'); yield* this.msg('不能從這場戰鬥中逃走！'); continue; } Sound.sfx('select'); return { type: 'run' }; }
      } else if (C.mode === 'skill') {
        const L = C.list; let go = -1; const d = dig(); C.ftap = null;
        if (C.tap != null) { go = C.tap; C.tap = null; }
        else if (d >= 1 && d <= L.length) go = d - 1;
        else if (Input.pressed('up')) { Input.consume('up'); C.j = (C.j + L.length - 1) % L.length; Sound.sfx('cursor'); }
        else if (Input.pressed('down')) { Input.consume('down'); C.j = (C.j + 1) % L.length; Sound.sfx('cursor'); }
        else if (Input.pressed('a') || Input.pressed('right')) { Input.consume('a', 'right'); go = C.j; }
        else if (Input.pressed('b') || Input.pressed('left')) { Input.consume('b', 'left'); Sound.sfx('cancel'); C.mode = 'cmd'; continue; }
        if (go < 0) continue; C.j = go; const sk = L[go], can = this.canUse(sk);
        if (!can.ok) { Sound.sfx('cancel'); yield* this.msg(can.why); continue; }
        Sound.sfx('select'); this.moveIdx = go;
        if (DEF.skills[sk].target === 'enemy') { const tg = yield* this.pickTarget(sk); if (!tg) continue; return { type: 'skill', skill: sk, targets: [tg] }; }
        return { type: 'skill', skill: sk, targets: [] };
      }
    }
  } finally { this.pcCmd = null; this.idle = false; this.pickV = null; }
};
Battle.prototype.pickTarget = function* (skill) {
  PART_PICK11 = null; const core = this.core, D = DEF.skills[skill], L = this.foes().filter(v => core.isUp(v.u)), E = [];
  for (const v of L) { E.push({ v }); if (D && D.power && D.target === 'enemy' && typeof partOpen11 === 'function' && partOpen11(core, v.u)) partsOf11(v.u).forEach((p, k) => { if (!p.gone) E.push({ v, k, p }); }); }
  if (E.length <= 1) return E[0] ? E[0].v.id : null;
  if (E.length > L.length) { const f = Game.st.flags; if (!f.tutPart11) { f.tutPart11 = 1; yield* this.msg('（頭目破防中可以打牠的部位！部位打壞了，對應的招式威力減半，還會掉稀有部位。打部位不吃破防的 +50%。）', { hold: 40 }); } }
  const pv = this.pickV ? E.findIndex(q => q.v === this.pickV && !q.p) : -1; let i = pv >= 0 ? pv : clamp(this.tgtIdx || 0, 0, E.length - 1);
  const C = this.pcCmd, prev = C ? C.mode : null; if (C) C.mode = 'target'; const P = this.pcPick = { E, i, skill, tap: null, hovI: null }; this.idle = true; let out = null; PCKEY.dig = 0;
  try {
    while (true) { P.i = i; this.pickV = E[i].v; yield; const d = PCKEY.dig; PCKEY.dig = 0;
      if (P.tap != null && P.tap >= 0) { const t = P.tap; P.tap = null; if (t === i) { out = E[i]; Sound.sfx('select'); break; } i = t; Sound.sfx('cursor'); continue; }
      if (P.hovI != null && P.hovI >= 0) { i = P.hovI; P.hovI = null; Sound.sfx('cursor'); continue; }
      if (d >= 1 && d <= E.length) { i = d - 1; out = E[i]; Sound.sfx('select'); break; }
      if (Input.pressed('left') || Input.pressed('up')) { Input.consume('left', 'up'); i = (i + E.length - 1) % E.length; Sound.sfx('cursor'); }
      else if (Input.pressed('right') || Input.pressed('down')) { Input.consume('right', 'down'); i = (i + 1) % E.length; Sound.sfx('cursor'); }
      else if (Input.pressed('a')) { Input.consume('a'); out = E[i]; Sound.sfx('select'); break; }
      else if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } }
  } finally { this.pcPick = null; this.pickV = null; if (C) C.mode = prev; this.idle = !!C; }
  if (!out) return null; this.tgtIdx = E.indexOf(out); PART_PICK11 = out.p ? out.k : null; return out.v.id;
};
tutPopup16 = function* (text) { const st = Game.st, f = st.flags || (st.flags = {}), off = f.tutOff16 || (f.tutOff16 = {}), k = TUT16.key(text); if (off[k]) return;
  const body = text.trim().slice(1, -1).replace(/\|/g, ''), w = 320, h = 140, X = Math.round((W - w) / 2), Y = Math.round((BH - h) / 2) + 4;
  const panel = { draw(x) { x.fillStyle = 'rgba(4,6,14,0.55)'; x.fillRect(0, 0, W, H); drawWin(x, X, Y, w, h, 'menu'); KB12.tc(x, '說明', X + w / 2, Y + 10, UIC.accent, 11);
      x.fillStyle = UIC.accent; x.fillRect(X + 10, Y + 19, w - 20, 1); PCB.para(x, body, X + 14, Y + 25, w - 28, h - 72, UIC.text, 11); } };
  UI.push(panel); Sound.sfx('menu');
  const r = yield* choose(['知道了', '已經會了，不再顯示'], { x: X + 80, y: Y + h - 44, w: w - 160, style: 'menu' });
  UI.remove(panel); if (r === 1) { off[k] = 1; Sound.sfx('select'); } };
const PCMOVE = { walk: 1.5, run: 2.6, hw: 5, top: 6, bot: 15, foot: 11 };
Overworld.prototype.pcBox = function (px, py) { return [px + 8 - PCMOVE.hw, py + PCMOVE.top, px + 8 + PCMOVE.hw, py + PCMOVE.bot]; };
Overworld.prototype.pcTiles = function (b) { const L = []; for (let ty = Math.floor(b[1] / 16); ty <= Math.floor((b[3] - 0.01) / 16); ty++) for (let tx = Math.floor(b[0] / 16); tx <= Math.floor((b[2] - 0.01) / 16); tx++) L.push([tx, ty]); return L; };
Overworld.prototype.pcSolid = function (tx, ty) { const m = this.map; if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return true; const c = m.rows[ty][tx];
  if (c === 'L' || m.doors[tx + ',' + ty] || this.solidAt(tx, ty)) return true; const e = this.entityAt0 ? this.entityAt0(tx, ty, this.p) : this.entityAt(tx, ty, this.p); return !!e; };
Overworld.prototype.pcFree = function (px, py, nx, ny) { const now = new Set(this.pcTiles(this.pcBox(px, py)).map(q => q + '')); for (const q of this.pcTiles(this.pcBox(nx, ny))) if (!now.has(q + '') && this.pcSolid(q[0], q[1])) return false; return true; };
function pcFieldInput(ow) {
  const p = ow.p, st = ow.st; if (p.moving || p.jump) return;
  if (ow.pcBumpT > 0) ow.pcBumpT--;
  if (Input.pressed('start')) { Input.consume('start'); p.pcWalk = 0; ow.run(startMenu()); return; }
  if (Input.pressed('a')) { Input.consume('a'); p.pcWalk = 0; if (ow.pcInteract()) return; }
  let dx = (Input.held('right') ? 1 : 0) - (Input.held('left') ? 1 : 0), dy = (Input.held('down') ? 1 : 0) - (Input.held('up') ? 1 : 0);
  if (!dx && !dy) { p.pcWalk = 0; return; }
  const last = Input.dir(); if (last) { p.dir = last; st.dir = last; }
  const run = Input.held('run'), sp = (run ? PCMOVE.run : PCMOVE.walk) / (dx && dy ? Math.SQRT2 : 1);
  let moved = false, bx = false, by = false;
  if (dx) { const nx = p.px + dx * sp; if (ow.pcFree(p.px, p.py, nx, p.py)) { p.px = nx; moved = true; } else bx = true; }
  if (dy) { const ny = p.py + dy * sp; if (ow.pcFree(p.px, p.py, p.px, ny)) { p.py = ny; moved = true; } else by = true; }
  if (!moved && (bx || by) && !(dx && dy)) { for (let k = 1; k <= 7; k++) { let hit = 0; for (const s of [-1, 1]) { const ox = dy ? s * k : 0, oy = dx ? s * k : 0;
        if (ow.pcFree(p.px, p.py, p.px + ox, p.py + oy) && ow.pcFree(p.px + ox, p.py + oy, p.px + ox + dx * sp, p.py + oy + dy * sp)) { p.px += Math.sign(ox) * Math.min(1, sp); p.py += Math.sign(oy) * Math.min(1, sp); moved = true; hit = 1; break; } } if (hit) break; } }
  p.pcWalk = moved ? (p.pcWalk || 0) + sp : 0;
  const fx = Math.floor((p.px + 8) / 16), fy = Math.floor((p.py + PCMOVE.foot) / 16);
  if (moved && (fx !== p.x || fy !== p.y)) { p.x = p.tx = fx; p.y = p.ty = fy; ow.onStep(); if (ow.script) return; }
  if (!moved && (bx || by) && !(ow.pcBumpT > 0)) { const d = bx && (!by || Math.abs(dx) >= Math.abs(dy)) && (!last || last === 'left' || last === 'right') ? (dx > 0 ? 'right' : 'left') : by ? (dy > 0 ? 'down' : 'up') : (dx > 0 ? 'right' : 'left');
    const [ddx, ddy] = DIRS[d], ax = p.x * 16, ay = p.y * 16;
    if (ddx ? Math.abs(p.py - ay) <= 7 : Math.abs(p.px - ax) <= 7) { if (ddx) p.py = ay; else p.px = ax; const keep = { px: p.px, py: p.py };
      ow.pcBumpT = 20; p.dir = d; st.dir = d; ow.tryMove(d, run);
      if (!p.moving && !p.jump && !ow.script) { p.px = keep.px; p.py = keep.py; } } }
}
Overworld.prototype.pcInteract = function () { const p = this.p, [dx, dy] = DIRS[p.dir], tx = Math.floor((p.px + 8 + dx * 13) / 16), ty = Math.floor((p.py + PCMOVE.foot + dy * 13) / 16);
  const ox = p.x, oy = p.y; p.x = tx - dx; p.y = ty - dy; let r = false; try { r = this.interact(); } finally { p.x = ox; p.y = oy; } return r; };
{ const P = Overworld.prototype, _ea = P.entityAt; P.entityAt0 = _ea; P.entityAt = function (x, y, except) { const r = _ea.call(this, x, y, except); if (r) return r; const p = this.p;
    if (p && except !== p && !p.moving && this.pcTiles && this.pcTiles(this.pcBox(p.px, p.py)).some(q => q[0] === x && q[1] === y)) return p; return null; }; }
{ const _dc = Overworld.prototype.drawChar; Overworld.prototype.drawChar = function (x, e, frames, camX, camY) {
    if (e !== this.p || e.moving || !(e.pcWalk > 0)) return _dc.call(this, x, e, frames, camX, camY);
    const ph = Math.floor(e.pcWalk / 9) % 4, fi = [1, 0, 3, 0][ph], k = { moving: e.moving, prog: e.prog, foot: e.foot };
    e.moving = true; e.prog = fi === 0 ? 12 : 2; e.foot = fi === 1 ? 1 : 0; try { return _dc.call(this, x, e, frames, camX, camY); } finally { Object.assign(e, k); } }; }
{ const _oz = owZoomAt; owZoomAt = function (ow) { const m = ow.map; if (m && !m.d.outdoor && m.w * 16 * ZOOM_F <= PCW && m.h * 16 * ZOOM_F <= PCH) return [PCW / 2, PCH / 2]; return _oz(ow); }; }
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) { _dr.call(this, x); if (!this.p || !this.map || UI.stack.some(w => w instanceof Menu)) return;
    const st = this.st; if (Game.frame - (this.pcHsF || -99) > 30) { this.pcHsF = Game.frame; try { this.pcHs = heroStats(st); } catch (e) { this.pcHs = null; } }
    const hs = this.pcHs || { hp: st.hp || 1, mp: st.mp || 0 }, mp = st.mp ?? hs.mp, X = 6, Y = PCH - 30, r = clamp((st.hp || 0) / Math.max(1, hs.hp), 0, 1), mr = clamp(mp / Math.max(1, hs.mp), 0, 1);
    if (UI.stack.some(w => w instanceof TextBox)) return;
    KB12.panel(x, X, Y, 132, 24, { r: 5, top: 'rgba(20,24,40,0.72)', bot: 'rgba(8,10,18,0.8)' });
    KB12.tl(x, 'Lv' + st.lv, X + 6, Y + 12, KB12.warm, 9);
    KB12.bar(x, X + 34, Y + 4, 92, 7, r, r > 0.5 ? ['#2f9a58', '#62e08a'] : r > 0.2 ? ['#c88a10', '#ffc040'] : ['#c8343a', '#ff6a5a'], null, (st.hp || 0) + '/' + hs.hp);
    KB12.bar(x, X + 34, Y + 13, 92, 7, mr, ['#2a64c8', '#62a8ff'], null, mp + '/' + hs.mp);
    if (st.status && typeof STATUS_NAME !== 'undefined' && STATUS_NAME[st.status]) KB12.chip(x, STATUS_NAME[st.status], X + 136, Y + 7, '#c8f080', 'rgba(24,20,40,0.92)'); }; }
const SEAM26 = {}, OPP26 = { left: 'right', right: 'left', up: 'down', down: 'up' }, PCTH = {};
for (const id in MAPS) PCTH[id] = MAPS[id] && MAPS[id].theme || null; // 地圖的配色（09d 畫的時候會暫時把 theme 清掉，所以先記下來）
function seam26(id) { if (SEAM26[id]) return SEAM26[id]; const out = SEAM26[id] = [], d = MAPS[id]; if (!d || !d.outdoor) return out; const m = getMap(id);
  for (const w of d.edgeWarps || []) { if (w.need) continue; const tid = w.to[0], td = MAPS[tid]; if (!td || !td.outdoor || tid === id) continue; const tm = getMap(tid), a = w.at[0], tx = w.to[1], ty = w.to[2];
    let s = null;
    if (w.dir === 'right' && tx === 0) s = { side: 'e', off: a - ty }; else if (w.dir === 'left' && tx === tm.w - 1) s = { side: 'w', off: a - ty };
    else if (w.dir === 'up' && ty === tm.h - 1) s = { side: 'n', off: a - tx }; else if (w.dir === 'down' && ty === 0) s = { side: 's', off: a - tx };
    if (!s) continue;
    const back = (td.edgeWarps || []).find(b => b.to[0] === id && b.dir === OPP26[w.dir] && !b.need); if (!back) continue;
    const b = back.at[0], ok = s.side === 'e' ? back.to[1] === m.w - 1 && back.to[2] === b + s.off : s.side === 'w' ? back.to[1] === 0 && back.to[2] === b + s.off : s.side === 'n' ? back.to[2] === 0 && back.to[1] === b + s.off : back.to[2] === m.h - 1 && back.to[1] === b + s.off;
    if (!ok) continue; out.push({ ...s, map: tid, tm, at: w.at.concat(back.at.map(v => v + s.off)) }); }
  const c = d.connect || {}; for (const k of ['n', 's']) if (c[k] && MAPS[c[k].map]) out.push({ side: k, off: c[k].dx || 0, map: c[k].map, tm: getMap(c[k].map), at: [], native: 1 });
  return out; }
function seamMap26(s, m, x, y) { return s.side === 'e' ? [x - m.w, y - s.off] : s.side === 'w' ? [s.tm.w + x, y - s.off] : s.side === 'n' ? [x - s.off, s.tm.h + y] : [x - s.off, y - m.h]; }
const seamOut26 = (s, m, x, y) => s.side === 'e' ? x >= m.w : s.side === 'w' ? x < 0 : s.side === 'n' ? y < 0 : y >= m.h;
Overworld.prototype.pcNbAt = function (x, y) { const m = this.map; for (const s of seam26(m.id)) { if (!seamOut26(s, m, x, y)) continue; const [nx, ny] = seamMap26(s, m, x, y); if (nx >= 0 && ny >= 0 && nx < s.tm.w && ny < s.tm.h) return { s, nx, ny, c: s.tm.rows[ny][nx] }; } return null; };
{ const _ta = Overworld.prototype.tileAt; Overworld.prototype.tileAt = function (x, y) { const m = this.map; if (m && (x < 0 || y < 0 || x >= m.w || y >= m.h)) { const q = this.pcNbAt(x, y); if (q) return (q.c === 'T' || q.c === 't') && PCTH[q.s.map] !== PCTH[m.id] ? 'Ŧ' : q.c; } return _ta.call(this, x, y); }; }
{ const _tm = Overworld.prototype.tryMove; Overworld.prototype.tryMove = function (d, run) {
    const p = this.p, m = this.map, [dx, dy] = DIRS[d], nx = p.x + dx, ny = p.y + dy;
    if (!this.script && m && (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h)) { const side = { right: 'e', left: 'w', up: 'n', down: 's' }[d];
      for (const s of seam26(m.id)) { if (s.native || s.side !== side || !s.at.includes(side === 'e' || side === 'w' ? ny : nx)) continue; const [lx, ly] = seamMap26(s, m, nx, ny);
        if (lx < 0 || ly < 0 || lx >= s.tm.w || ly >= s.tm.h || SOLID.has(s.tm.rows[ly][lx]) || s.tm.block.has(lx + ',' + ly)) continue;
        const [cx, cy] = seamMap26(s, m, p.x, p.y); p.dir = d; this.st.dir = d; this.load(s.map, cx, cy, d); this.tryMoveContinue(d, run); return; } }
    return _tm.call(this, d, run); }; }
const TILES0 = Object.assign({}, Tiles);
function pcTheme26(th) { Object.assign(Tiles, TILES0); if (!th) return; const keep = TILES0, T1 = typeof THEMES !== 'undefined' && THEMES[th], T2 = typeof CH2_THEMES !== 'undefined' && CH2_THEMES[th];
  if (T1) { Tiles.grass = v => themeCanvas(th + 'g' + v, keep.grass(v), T1.ground); Tiles.tall = f => themeCanvas(th + 't' + f, keep.tall(f), T1.tall); Tiles.path = m => themeCanvas(th + 'p' + m, keep.path(m), T1.path);
    if (T1.water) Tiles.water = (f, m) => themeCanvas(th + 'w' + f + '_' + m, keep.water(f, m), T1.water); Tiles.tree = THEME_CACHE[th + 'tree'] || (THEME_CACHE[th + 'tree'] = T1.tree());
    for (const k of ['rock', 'bush', 'sign', 'ledge']) Tiles[k] = themeCanvas(th + k, keep[k], T1.ground); Tiles.flower = (f, c) => themeCanvas(th + 'f' + f + c, keep.flower(f, c), T1.ground); return; }
  if (T2) { if (T2.ground) { Tiles.grass = v => themeCanvas(th + 'g' + v, keep.grass(v), T2.ground); for (const k of ['rock', 'bush', 'sign', 'ledge']) Tiles[k] = themeCanvas(th + k, keep[k], T2.ground); Tiles.flower = (f, c) => themeCanvas(th + 'f' + f + c, keep.flower(f, c), T2.ground); }
    if (T2.tall) Tiles.tall = f => themeCanvas(th + 't' + f, keep.tall(f), T2.tall); if (T2.path || T2.ground) Tiles.path = m => themeCanvas(th + 'p' + m, keep.path(m), T2.path || T2.ground);
    if (T2.water) Tiles.water = (f, m) => themeCanvas(th + 'w' + f + '_' + m, keep.water(f, m), T2.water); if (T2.tree) Tiles.tree = ch2TreeImg(th, T2.tree);
    if (T2.stone) { Tiles.stone = v => themeCanvas(th + 's' + v, keep.stone(v), T2.stone); if (keep.pillar) Tiles.pillar = themeCanvas(th + 'pil', keep.pillar, T2.stone); }
    if (T2.wall) Tiles.ruinWall = v => themeCanvas(th + 'rw' + v, keep.ruinWall(v), T2.wall); } }
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) { const m = this.map;
    if (!m || (tx >= 0 && ty >= 0 && tx < m.w && ty < m.h)) return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    const q = this.pcNbAt(tx, ty); if (!q || PCTH[q.s.map] === PCTH[m.id]) return _dt.call(this, x, c === 'Ŧ' ? 'T' : c, tx, ty, sx, sy, f, f2);
    const saved = Object.assign({}, Tiles); pcTheme26(PCTH[q.s.map]);
    try { _dt.call(this, x, c === 'Ŧ' ? 'T' : c, tx, ty, sx, sy, f, f2); if (c === 'Ŧ') x.drawImage(Tiles.tree, sx, sy - 5); } finally { Object.assign(Tiles, saved); } }; }
{ const P = Overworld.prototype, _rf = P.roamFight12, _bs = P.battleScript;
  P.roamFight12 = function* (e, theyCame) { const p = this.p, ddx = Math.sign(p.x - e.x), ddy = Math.sign(p.y - e.y), F = DIRS[e.dir] || [0, 0], Pd = DIRS[p.dir] || [0, 0];
    let first = null;
    if (!theyCame && !e.chase && F[0] === -ddx && F[1] === -ddy) first = 'A';      // 從背後碰牠
    else if (theyCame && Pd[0] === ddx && Pd[1] === ddy) first = 'B';               // 被追上時背對著牠
    this.pcFirst = first; p.pcWalk = 0; if (first === 'A') { Sound.sfx('exclaim'); p.excl = 20; }
    try { return yield* _rf.call(this, e, theyCame); } finally { this.pcFirst = null; } };
  P.battleScript = function (cfg, ...a) { if (this.pcFirst && cfg && cfg.roam12) { cfg = { ...cfg, pcFirst: this.pcFirst }; this.pcFirst = null; } return _bs.call(this, cfg, ...a); }; }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function () { const r = _up.call(this); const st = this.st;
    if (st && st.flags && !st.flags.tutRoamPC && st.flags.license && this.roam12 && !this.script && !UI.stack.length && !Game.trans && !this.p.moving) { st.flags.tutRoamPC = 1;
      this.run((function* () { yield* say('（地圖上的魔物看得到。從牠背後碰牠＝先制，你先行動；被追上時背對著牠＝被偷襲，魔物先動。按住 Shift 跑步，可以甩掉追你的魔物。）'); })()); }
    return r; }; }
Object.assign(ITEMS, {
  pcFlint: { n: '旅人的火打石', key: 1, price: 0, sell: 0, cat: '重要物品', d: '野外技能「燒藤蔓」：面對荊棘藤蔓按 E（或 Z）就能燒掉。' },
  pcGlove: { n: '大力手套', key: 1, price: 0, sell: 0, cat: '重要物品', d: '野外技能「推石頭」：往有裂紋的大石頭走，就能把它往前推一格。' },
});
const FO26 = {
  windHills: [{ id: 'fo_wh_v1', k: 'vine', x: 2, y: 17 }, { id: 'fo_wh_b1', k: 'rock', x: 38, y: 34 }, { id: 'fo_wh_s', k: 'stone', x: 8, y: 28 }],
  route: [{ id: 'fo_rt_v1', k: 'vine', x: 5, y: 33 }, { id: 'fo_rt_s', k: 'stone', x: 12, y: 24 }],
  town: [{ id: 'fo_tw_s', k: 'stone', x: 8, y: 15 }],
};
{ const add = (id, L) => { const d = MAPS[id]; if (d) d.items = (d.items || []).concat(L); };
  add('windHills', [{ id: 'pcIt_flint', x: 7, y: 25, item: 'pcFlint' }, { id: 'pcIt_glove', x: 2, y: 14, item: 'pcGlove' }, { id: 'pcIt_wh1', x: 41, y: 31, item: 'swiftFeather', q: 3 }, { id: 'pcIt_wh2', x: 37, y: 32, gold: 600 }]);
  const R = MAPS.windHills && MAPS.windHills.rows; if (R && R[34] && R[34][38] === 'o') R[34] = R[34].slice(0, 38) + '.' + R[34].slice(39); }
const fsHas26 = (k, st = Game.st) => !!(st && st.bag && st.bag[k === 'burn' ? 'pcFlint' : 'pcGlove'] > 0);
Overworld.prototype.fo26 = function () { const id = this.map && this.map.id, st = this.st; if (this.fo26c && this.fo26c.id === id && this.fo26c.f === (st.fo26v || 0)) return this.fo26c.L;
  const L = (FO26[id] || []).filter(o => !(o.k === 'vine' && st.flags[o.id])).map(o => { const q = { ...o }; if (o.k === 'rock' && st.flags[o.id]) { const [x, y] = String(st.flags[o.id]).split(',').map(Number); q.x = x; q.y = y; } return q; });
  this.fo26c = { id, f: st.fo26v || 0, L, at: new Map(L.map(o => [o.x + ',' + o.y, o])) }; return L; };
Overworld.prototype.foAt26 = function (x, y) { this.fo26(); return this.fo26c.at.get(x + ',' + y) || null; };
const foBump26 = st => { st.fo26v = (st.fo26v || 0) + 1; };
{ const P = Overworld.prototype, _sa = P.solidAt; P.solidAt = function (x, y) { if (this.map && this.foAt26(x, y)) return true; return _sa.call(this, x, y); }; }
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) { _dt.call(this, x, c, tx, ty, sx, sy, f, f2); const o = this.map && this.foAt26(tx, ty); if (o) foDraw26(this, x, o, sx, sy); }; }
function foDraw26(ow, x, o, sx, sy) { const t = ow.t || 0, px = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(sx + a, sy + b, w, h); };
  if (o.k === 'vine') { const burn = ow.foBurn26 && ow.foBurn26.o.id === o.id ? ow.foBurn26.t : 0;
    px('rgba(0,0,0,0.25)', 1, 12, 14, 4);
    for (let i = 0; i < 5; i++) { const a = i * 1.3; x.strokeStyle = i % 2 ? '#2f5a26' : '#3d7a2e'; x.lineWidth = 2; x.beginPath(); x.moveTo(sx + 2 + i * 3, sy + 15); x.quadraticCurveTo(sx + 8 + Math.sin(a) * 6, sy + 7, sx + 3 + ((i * 5) % 11), sy - 2 + (i % 2) * 3); x.stroke(); }
    for (const [a, b] of [[3, 3], [11, 2], [7, 8], [12, 10], [4, 11], [9, 0]]) { px('#7a2a4a', a, b, 2, 2); px('#e05a7a', a, b, 1, 1); }
    if (fsHas26('burn', ow.st) && Math.floor((t + o.x * 7) / 18) % 4 === 0) px('#ffd860', 8, 4, 1, 1);
    if (burn) { for (let i = 0; i < 7; i++) { const yy = 14 - ((burn * 2 + i * 5) % 18); px(i % 2 ? '#ffb040' : '#ff6a20', 2 + i * 2, yy, 2, 3); px('#fff0a0', 3 + i * 2, yy + 1, 1, 1); } } return; }
  if (o.k === 'rock') { const ox = o.ax || 0, oy = o.ay || 0; x.save(); x.translate(ox, oy);
    px('rgba(0,0,0,0.3)', 1, 13, 14, 3); x.fillStyle = '#5a5a6c'; x.beginPath(); x.ellipse(sx + 8, sy + 9, 7.5, 7, 0, 0, 7); x.fill(); x.fillStyle = '#8a8a9c'; x.beginPath(); x.ellipse(sx + 7, sy + 7.5, 5.5, 5, 0, 0, 7); x.fill();
    px('#b4b4c4', 4, 4, 3, 2); x.strokeStyle = '#3a3a48'; x.lineWidth = 1; x.beginPath(); x.moveTo(sx + 9, sy + 3); x.lineTo(sx + 7, sy + 7); x.lineTo(sx + 10, sy + 10); x.lineTo(sx + 8, sy + 14); x.stroke();
    if (fsHas26('push', ow.st) && Math.floor((t + o.x * 5) / 20) % 4 === 0) px('#ffd860', 12, 5, 1, 1); x.restore(); return; }
  if (o.k === 'stone') { const on = !!ow.st.flags[o.id], gl = 0.55 + 0.35 * Math.sin(t / 15);
    px('rgba(0,0,0,0.3)', 2, 13, 12, 3); px('#4a4a5a', 3, -6, 10, 20); px('#6e6e82', 4, -7, 8, 20); px('#8a8aa0', 5, -6, 2, 17);
    x.globalAlpha = on ? gl : 0.35; px('#7fe3d0', 7, -3, 2, 7); px('#7fe3d0', 6, 0, 4, 1); px('#bff8ee', 7, -2, 1, 4); x.globalAlpha = 1;
    if (on) { x.globalAlpha = 0.18 * gl; x.fillStyle = '#7fe3d0'; x.beginPath(); x.ellipse(sx + 8, sy + 2, 12, 12, 0, 0, 7); x.fill(); x.globalAlpha = 1; } } }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function () { const r = _up.call(this);
    const B = this.foBurn26; if (B && ++B.t > 36) this.foBurn26 = null;
    for (const o of this.fo26c ? this.fo26c.L : []) if (o.k === 'rock' && (o.ax || o.ay)) { o.ax = Math.abs(o.ax) < 1 ? 0 : o.ax * 0.7; o.ay = Math.abs(o.ay) < 1 ? 0 : o.ay * 0.7; }
    if (PCKEY.e) { PCKEY.e = 0; if (!this.script && !UI.stack.length && !this.p.moving && !Game.trans) { const p = this.p, [dx, dy] = DIRS[p.dir], o = this.foAt26(Math.floor((p.px + 8 + dx * 13) / 16), Math.floor((p.py + 11 + dy * 13) / 16));
        if (o) this.run(this.foUse26(o)); else this.run(say(fsHas26('burn', this.st) || fsHas26('push', this.st) ? '前面沒有可以用野外技能的東西。\n（荊棘藤蔓：燒藤蔓　有裂紋的大石頭：推石頭）' : '還沒有野外技能。')); } }
    return r; }; }
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { const [dx, dy] = DIRS[this.p.dir], o = this.foAt26(this.p.x + dx, this.p.y + dy); if (o) { this.run(this.foUse26(o)); return true; } return _in.call(this); }; }
Overworld.prototype.foUse26 = function* (o) { const st = this.st;
  if (o.k === 'vine') { if (!fsHas26('burn', st)) { yield* say('長滿尖刺的荊棘藤蔓，把路堵住了。\n乾乾的……要是有火，應該燒得掉。'); return; }
    Sound.sfx('fire'); this.foBurn26 = { o, t: 0 }; yield* wait(30); st.flags[o.id] = 1; foBump26(st); Sound.sfx('wind'); yield* say('用火打石點燃了藤蔓——\n荊棘藤蔓燒掉了！'); return; }
  if (o.k === 'rock') { yield* say(fsHas26('push', st) ? '有裂紋的大石頭。\n往石頭的方向走，就能把它推開。' : '一塊有裂紋的大石頭。好像推得動……\n可是憑現在的力氣，動也不動。'); return; }
  if (o.k === 'stone') yield* this.stoneUse26(o); };
{ const _tm = Overworld.prototype.tryMove; Overworld.prototype.tryMove = function (d, run) {
    const p = this.p, [dx, dy] = DIRS[d], o = !this.script && this.map ? this.foAt26(p.x + dx, p.y + dy) : null;
    if (o && o.k === 'rock') { p.dir = d; this.st.dir = d; if (!fsHas26('push', this.st)) { Sound.sfx('bump'); return; }
      const bx = o.x + dx, by = o.y + dy, m = this.map; if (bx < 0 || by < 0 || bx >= m.w || by >= m.h || this.solidAt(bx, by) || this.entityAt(bx, by)) { Sound.sfx('bump'); return; }
      this.st.flags[o.id] = bx + ',' + by; foBump26(this.st); const q = this.fo26().find(z => z.id === o.id); if (q) { q.ax = -dx * 16; q.ay = -dy * 16; }
      Sound.sfx('rock'); this.startMove(p, p.x + dx, p.y + dy, 1); p.walkedLast = true;
      if (!this.st.flags.pcPushTip) { this.st.flags.pcPushTip = 1; this.run((function* () { yield* wait(10); yield* say('（把石頭推開了！推錯了也沒關係，換個方向再推就好。）'); })()); }
      return; }
    return _tm.call(this, d, run); }; }
{ const _pi = Overworld.prototype.pickItem; Overworld.prototype.pickItem = function* (it) { const r = yield* _pi.call(this, it);
    if (it && it.item === 'pcFlint') { Sound.sfx('statUp'); yield* say('學會了野外技能「燒藤蔓」！\n面對荊棘藤蔓，按 E（或 Z）就能燒掉。\n漢斯家的西邊，好像有一條被藤蔓堵住的小路……'); }
    if (it && it.item === 'pcGlove') { Sound.sfx('statUp'); yield* say('學會了野外技能「推石頭」！\n往有裂紋的大石頭走，就能把它推開。\n丘陵東南邊、洞口上方的石頭，看起來有一塊裂開了……'); }
    return r; }; }
const PCSTONE = { list: () => { const L = []; for (const id in FO26) for (const o of FO26[id]) if (o.k === 'stone') L.push({ ...o, map: id }); return L; },
  here: id => (FO26[id] || []).filter(o => o.k === 'stone') };
Overworld.prototype.stoneUse26 = function* (o) { const st = this.st, nm = (MAPS[this.map.id] || {}).name || '';
  if (!st.flags[o.id]) { st.flags[o.id] = 1; Sound.jingle('item'); yield* say('「旅人石碑」——' + nm + '\n手放上去，石碑亮了起來。這個地方被記住了！\n（之後在任何一塊旅人石碑，都能傳送到記住的地方）'); }
  const L = PCSTONE.list().filter(s => st.flags[s.id] && s.id !== o.id);
  if (!L.length) { yield* say('還沒有記住其他地方的石碑。\n（萌芽鎮・晨霧道路・風車丘陵各有一塊）'); return; }
  const names = L.map(s => (MAPS[s.map] || {}).name || s.map).concat(['不傳送']);
  const r = yield* ask('要傳送到哪裡？', names, { mx: 230, my: 210 - 4 - names.length * 16 - 12 });
  if (r < 0 || r >= L.length) return; const s = L[r]; Sound.sfx('mana'); yield* this.warp(s.map, s.x, s.y + 1, 'down'); };
{ const TILES = [['狀態', '能力・技能'], ['冒險手冊', '任務・圖鑑・紀錄'], ['屬性', '自由加點'], ['技能', '技能・編排'], ['技能樹', '武器・共通'], ['背包', '道具・素材'], ['裝備', '更換・詳情'], ['存檔', '記錄進度'], ['設定', '音量・速度'], ['關閉', '回到遊戲']];
  const pcMenu = function* () {
    Sound.sfx('menu'); let idx = Game.menuIdx || 0;
    while (true) {
      const st = Game.st, s = heroStats(), S = 7, M = 9;
      const hdr = { draw(x) { x.fillStyle = 'rgba(6,8,16,0.82)'; x.fillRect(0, 0, W, H);
        const X = 16, Y = 16, w = 184, h = 238; KB12.panel(x, X, Y, w, h, { r: 6 });
        const P = (() => { try { return portraitOf({ hero: 1 }); } catch (e) { return null; } })();
        x.save(); KB12.rr(x, X + w / 2 - 32, Y + 10, 64, 64, 8); x.fillStyle = 'rgba(70,90,130,0.6)'; x.fill(); x.clip(); if (P) { x.imageSmoothingEnabled = P.width > 64; x.drawImage(P, X + w / 2 - 32, Y + 10, 64, 64); x.imageSmoothingEnabled = false; } x.restore();
        x.save(); KB12.rr(x, X + w / 2 - 32, Y + 10, 64, 64, 8); x.lineWidth = 0.8; x.strokeStyle = 'rgba(255,255,255,0.3)'; x.stroke(); x.restore();
        const cx = X + w / 2; KB12.tc(x, st.name + '　Lv' + st.lv, cx, Y + 86, KB12.txt, M);
        const wp = (typeof mainKind11 === 'function' && mainKind11(st)) || ''; const wn = (() => { try { const g = typeof mainWeapon === 'function' && mainWeapon(st); return g ? gearName(g) : ''; } catch (e) { return ''; } })();
        if (wp || wn) KB12.tc(x, (wp ? wp + '・' : '') + (wn || ''), cx, Y + 99, KB12.warm, S, w - 16);
        const hp = clamp(st.hp / Math.max(1, s.hp), 0, 1), mp = clamp((st.mp ?? s.mp) / Math.max(1, s.mp), 0, 1), e0 = expForLevel(st.lv), e1 = expForLevel(st.lv + 1), er = clamp((st.exp - e0) / Math.max(1, e1 - e0), 0, 1);
        KB12.bar(x, X + 12, Y + 110, w - 24, 10, hp, ['#2f9a58', '#62e08a'], 'HP', st.hp + '/' + s.hp);
        KB12.bar(x, X + 12, Y + 124, w - 24, 10, mp, ['#2a64c8', '#62a8ff'], 'MP', (st.mp ?? s.mp) + '/' + s.mp);
        KB12.bar(x, X + 12, Y + 138, w - 24, 10, er, ['#b08a20', '#ffd860'], '經驗', '下一級 ' + Math.max(0, e1 - st.exp));
        x.fillStyle = 'rgba(255,255,255,0.1)'; x.fillRect(X + 12, Y + 156, w - 24, 0.6);
        const loc = MAPS[st.map] ? MAPS[st.map].name || '' : '', day = typeof dnDay12 === 'function' ? '第' + dnDay12(st) + '天' + (typeof dnHudTag === 'function' ? dnHudTag(st) : '') : '';
        KB12.tc(x, loc, cx, Y + 168, KB12.txt, M, w - 16); if (day) KB12.tc(x, day, cx, Y + 181, KB12.mut, S);
        KB12.tc(x, st.money + ' G', cx, Y + 198, KB12.warm, M);
        const fs = []; if (st.bag && st.bag.pcFlint) fs.push('燒藤蔓'); if (st.bag && st.bag.pcGlove) fs.push('推石頭'); KB12.tc(x, '野外技能：' + (fs.length ? fs.join('・') : '（還沒有）'), cx, Y + 215, fs.length ? '#8ad0ff' : KB12.mut, S, w - 16);
        KB12.tc(x, '方向鍵 選擇　Z 決定　X／Esc 關閉', 332, 262, KB12.mut, S); } };
      UI.push(hdr);
      const items = TILES.map(([t, sub]) => ({ t: '', name: t, dot: (t === '技能樹' && typeof trLeft11 === 'function' && trLeft11(st) > 0) || (t === '屬性' && attrAvail(st) > 0), sub }));
      const r = yield* choose(items, { x: 210, y: 16, w: 256, h: 238, cols: 2, colW: 126, rowH: 45, ox: 4, oy: 4, buttons: true, style: 'menu', index: Math.min(idx, items.length - 1),
        drawExtra: (x, m) => { for (let k = 0; k < items.length; k++) { const c = k % 2, rr = Math.floor(k / 2), X = m.x + m.ox + c * m.colW, Y = m.y + m.oy + rr * m.rowH, on = k === m.i, bw = m.colW - 3, bh = m.rowH - 2;
            KB12.tc(x, items[k].name, X + bw / 2, Y + bh / 2 - 6, on ? '#fff2d8' : KB12.txt, 9 + 2); KB12.tc(x, items[k].sub, X + bw / 2, Y + bh / 2 + 9, on ? KB12.acc : KB12.mut, 7);
            if (items[k].dot) { x.fillStyle = KB12.warm; x.beginPath(); x.arc(X + bw - 8, Y + 8, 3, 0, 7); x.fill(); } } } });
      UI.remove(hdr);
      const name = r >= 0 ? TILES[r][0] : '關閉'; if (name === '關閉') break; idx = r; Game.menuIdx = r;
      if (name === '狀態') yield* summaryScreen(); if (name === '屬性') yield* attrScreen(); if (name === '技能') yield* skillTreeScreen(); if (name === '技能樹') yield* treeScreen11();
      if (name === '背包') { yield* bagScreen('field'); if (Game.homeWarp) break; }
      if (name === '裝備') yield* equipScreen(); if (name === '冒險手冊') yield* handbookScreen12();
      if (name === '存檔') { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } }
      if (name === '設定') yield* optionsScreen();
    }
    if (Game.homeWarp && Game.ow) { Game.homeWarp = 0; yield* Game.ow.homeWarp(); }
  };
  startMenu = function* (...a) { Game.inMenu13 = (Game.inMenu13 || 0) + 1; try { return yield* pcMenu.apply(this, a); } finally { Game.inMenu13--; } };
}
