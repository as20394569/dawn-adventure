/* ===================== UI: text boxes, menus, screens ===================== */
const UI = {
  stack: [], push(w) { this.stack.push(w); return w; }, remove(w) { const i = this.stack.indexOf(w); if (i >= 0) this.stack.splice(i, 1); },
  draw(ctx) { for (const w of this.stack) w.draw(ctx); }, clear() { this.stack = []; },
};

class TextBox {
  constructor(text, o = {}) {
    this.style = o.style || 'ow'; const bb = this.style === 'battle' && typeof BB_Y !== 'undefined'; this.x = o.x ?? 4; this.y = o.y ?? (bb ? BB_Y + 1 : TB_Y + 1); this.w = o.w ?? W - 8; this.h = o.h ?? (bb ? BB_H - 2 : TB_H - 2);
    this.fs = o.fs ?? (bb ? 9 : undefined); this.lh = o.lh ?? (bb ? 12 : 16);
    this.pad = o.pad ?? 8; this.rows = Math.max(1, Math.floor((this.h - 10) / this.lh));
    this.lines = Font.wrap(text, this.w - this.pad * 2 - 2, this.fs);
    this.li = 0; this.ci = 0; this.top = 0; this.scroll = 0; this.state = 'type'; this.t = 0; this.hold = 0;
    this.auto = o.auto; this.keep = o.keep; this.done = false; this.instant = o.instant;
    this.col = UIC.text; this.sh = UIC.textSh;
    if (this.instant) { this.li = Math.min(this.rows - 1, this.lines.length - 1); this.ci = [...this.lines[this.li]].length; this.state = this.lines.length > this.rows ? 'wait' : 'end'; if (this.lines.length <= this.rows) this.finishLine(); }
  }
  speed() { const base = [0.5, 1, 2][Game.settings.text] || 1; return (Input.held('a') || Input.held('b')) ? Math.max(4, base) : base; }
  finishLine() {
    if (this.li + 1 < this.lines.length) { if (this.li - this.top >= this.rows - 1) this.state = 'wait'; else { this.li++; this.ci = 0; this.state = 'type'; } }
    else { this.state = this.keep ? 'done' : 'end'; if (this.keep) this.done = true; }
  }
  update() {
    this.t++;
    if (this.state === 'type') {
      this.acc = (this.acc || 0) + this.speed();
      const L = [...this.lines[this.li]].length;
      while (this.acc >= 1 && this.ci < L) { this.ci++; this.acc -= 1; }
      if (this.ci >= L) { this.acc = 0; this.finishLine(); }
      Input.consume('a');
    } else if (this.state === 'wait') {
      if (this.auto && ++this.hold > 50) { this.hold = 0; this.state = 'scroll'; this.scroll = 0; }
      if (Input.pressed('a') || Input.pressed('b')) { Input.consume('a', 'b'); if (!this.auto) Sound.sfx('cursor'); this.state = 'scroll'; this.scroll = 0; this.hold = 0; }
    } else if (this.state === 'scroll') {
      this.scroll += 4; if (this.scroll >= this.lh) { this.scroll = 0; this.top++; this.li++; this.ci = 0; this.state = 'type'; }
    } else if (this.state === 'end') {
      if (this.auto) { if (++this.hold > (this.auto === true ? 40 : this.auto) || Input.pressed('a')) { Input.consume('a', 'b'); this.done = true; } }
      else if (Input.pressed('a') || Input.pressed('b')) { Input.consume('a', 'b'); Sound.sfx('cursor'); this.done = true; }
    }
  }
  draw(x) {
    drawWin(x, this.x, this.y, this.w, this.h, this.style);
    x.save(); x.beginPath(); x.rect(this.x + 4, this.y + 4, this.w - 8, this.h - 8); x.clip();
    const ty = this.y + (this.lh < 16 ? 5 : 6);
    for (let i = this.top; i <= Math.min(this.li, this.top + this.rows); i++) {
      const row = i - this.top; const s = i < this.li ? this.lines[i] : [...this.lines[i]].slice(0, this.ci).join('');
      Font.draw(x, s, this.x + this.pad, ty + row * this.lh - this.scroll, this.col, this.sh, this.fs);
    }
    x.restore();
    if ((this.state === 'wait' || this.state === 'end') && !this.auto && Math.floor(this.t / 16) % 2 === 0) {
      const lastW = Font.width(this.lines[this.li], this.fs); const ay = ty + (this.li - this.top) * this.lh + 5;
      x.drawImage(DOWNARROW, Math.min(this.x + this.pad + lastW + 3, this.x + this.w - 14), ay + (Math.floor(this.t / 8) % 2));
    }
  }
}

class Menu {
  constructor(items, o = {}) {
    this.items = items.map(it => typeof it === 'string' ? { t: it } : it); this.i = o.index || 0; this.cols = o.cols || 1;
    this.rowH = o.rowH || 16; this.style = o.style || 'menu'; this.cancel = o.cancel !== false; this.onMove = o.onMove; this.twoTap = !!o.twoTap; this.done = false; this.result = -1;
    const maxW = Math.max(...this.items.map(it => Font.width(it.t) + (it.r ? Font.width(it.r) + 12 : 0)));
    this.colW = o.colW || maxW + 20; this.w = o.w || this.colW * this.cols + 16; const rowsN = Math.ceil(this.items.length / this.cols);
    const fitRows = Math.max(1, Math.floor(((o.y !== undefined ? H - o.y : TB_Y - 5) - 10) / this.rowH)); if (!o.visible && !o.h && rowsN > fitRows) o = { ...o, visible: fitRows }; // long menus scroll instead of running off screen
    this.h = o.h || Math.min(rowsN, o.visible || rowsN) * this.rowH + 10; this.x = o.x ?? (W - this.w - 4); this.y = o.y ?? (TB_Y - this.h - 1); this.buttons = o.buttons; this.ox = o.ox ?? 14; this.oy = o.oy ?? 5; this.title = o.title;
    this.scrollMax = o.visible || rowsN; this.scrollTop = Math.max(0, Math.floor(this.i / this.cols) - this.scrollMax + 1); this.drawExtra = o.drawExtra; this.noFrame = o.noFrame; this.textCol = o.textCol || '#c9cfe4'; this.textSh = o.textSh || UIC.textSh; this.fs = o.fs;
    if (this.onMove) this.onMove(this.i);
  }
  move(d) { const n = this.items.length; let i = this.i; if (this.cols === 1) i = (i + d + n) % n; else { if (d === -1 || d === 1) i = (i + d + n) % n; else i = (i + d * 1 + n * 4) % n; } return i; }
  update() {
    let ni = this.i; const n = this.items.length;
    if (this.cols === 1) { if (Input.repeat('up')) ni = (this.i - 1 + n) % n; if (Input.repeat('down')) ni = (this.i + 1) % n; }
    else {
      const c = this.i % this.cols, r = Math.floor(this.i / this.cols), rowsN = Math.ceil(n / this.cols);
      if (Input.repeat('left') && c > 0) ni = this.i - 1; if (Input.repeat('right') && c < this.cols - 1 && this.i + 1 < n) ni = this.i + 1;
      if (Input.repeat('up') && r > 0) ni = this.i - this.cols; if (Input.repeat('down') && r < rowsN - 1 && this.i + this.cols < n) ni = this.i + this.cols;
    }
    if (ni !== this.i) { this.i = ni; Sound.sfx('cursor'); if (this.onMove) this.onMove(this.i); }
    const r = Math.floor(this.i / this.cols); if (r < this.scrollTop) this.scrollTop = r; if (r >= this.scrollTop + this.scrollMax) this.scrollTop = r - this.scrollMax + 1;
    if (Input.pressed('a')) { Input.consume('a'); const it = this.items[this.i]; if (it.dis) { Sound.sfx('bump'); return; } Sound.sfx('select'); this.result = this.i; this.done = true; }
    else if (Input.pressed('b') && this.cancel) { Input.consume('b'); Sound.sfx('cancel'); this.result = -1; this.done = true; }
  }
  draw(x) {
    if (!this.noFrame) drawWin(x, this.x, this.y, this.w, this.h, this.style);
    if (this.title) Font.draw(x, this.title, this.x + 8, this.y + 2, UIC.muted, UIC.textSh);
    const n = this.items.length;
    for (let k = 0; k < n; k++) {
      const r = Math.floor(k / this.cols) - this.scrollTop, c = k % this.cols; if (r < 0 || r >= this.scrollMax) continue;
      const X = this.x + this.ox + c * this.colW, Y = this.y + this.oy + r * this.rowH; const it = this.items[k], on = k === this.i;
      const tc = it.dis ? UIC.dis : on ? UIC.text : (it.col || this.textCol);
      if (this.buttons) {
        const bw = this.colW - 3, bh = this.rowH - 2; drawBtn(x, X, Y, bw, bh, on, it.strip);
        const ty = Y + Math.round(bh / 2) - 8;
        if (it.strip) Font.draw(x, it.t, X + 8, ty, tc, this.textSh); else Font.drawC(x, it.t, X + Math.floor(bw / 2), ty, tc, this.textSh);
        if (it.r) Font.drawR(x, it.r, X + bw - 4, ty + 2, it.dis || it.col === UIC.dis ? UIC.dis : '#8ab8ff', this.textSh, 9);
        continue;
      }
      if (on) selBar(x, this.cols === 1 ? this.x + 2 : X - 7, Y + 7 - Math.floor((this.rowH - 1) / 2), this.cols === 1 ? this.w - 4 : this.colW - 4, this.rowH - 1);
      Font.draw(x, it.t, X, Y, tc, this.textSh, this.fs);
      if (it.r) Font.drawR(x, it.r, this.x + this.w - 8, Y, it.dis ? UIC.dis : UIC.muted, this.textSh, this.fs);
    }
    if (this.scrollTop > 0) x.drawImage(UPARROW, this.x + this.w / 2 - 2, this.y + 2);
    if (this.scrollTop + this.scrollMax < Math.ceil(n / this.cols)) x.drawImage(DOWNARROW, this.x + this.w / 2 - 2, this.y + this.h - 5);
    if (this.drawExtra) this.drawExtra(x, this);
  }
}

function* say(text, o = {}) {
  const t = new TextBox(text, o); UI.push(t); while (!t.done) { t.update(); yield; }
  if (!o.keepOpen) UI.remove(t); return t;
}
function* sayAll(list, o = {}) { for (const s of list) yield* say(s, o); }
function* choose(items, o = {}) { const m = new Menu(items, o); UI.push(m); while (!m.done) { m.update(); yield; } UI.remove(m); return m.result; }
function* ask(text, opts = ['是', '否'], o = {}) {
  const t = new TextBox(text, { ...o, keep: true }); UI.push(t); while (!t.done) { t.update(); yield; }
  const r = yield* choose(opts, { x: o.mx, y: o.my, style: o.style === 'battle' ? 'cmd' : 'menu', cancel: o.cancel !== false });
  UI.remove(t); return r;
}
function* yesNo(text, o = {}) { const r = yield* ask(text, ['是', '否'], o); return r === 0; }

/* ---------- Hero stats helpers ---------- */
function statCalc(base, lv, iv = 15, isHP = false) { return isHP ? Math.floor((2 * base + iv) * lv / 100) + lv + 10 : Math.floor((2 * base + iv) * lv / 100) + 5; }
// Six attributes grow slowly and deterministically: init + floor(offset + rate × (Lv − 5)) + permanent boosts
function heroAttr(st = Game.st) { const a = {}; for (const k of ATTRS) a[k] = HERO_ATTR_INIT[k] + Math.floor(HERO_GROWTH_OFS[k] + HERO_GROWTH[k] * (st.lv - 5)) + ((st.boost || {})[k] || 0); return a; }
function heroStats(st = Game.st) {
  const a = heroAttr(st), L = st.lv;
  const s = {
    hp: 6 + L * 1.8 + a.vit * 1.6,                  // 最大HP = 6 + 等級×1.8 + 體力×1.6 (v22: 體力 matters with free allocation)
    atk: a.str + a.dex / 2 + L * 0.6,               // 物攻 = 力量 + 靈巧÷2 + 等級×0.6
    def: a.vit + a.agi / 3 + L * 0.6,               // 物防 = 體力 + 敏捷÷3 + 等級×0.6
    spa: a.int * 1.2 + a.dex / 3 + L * 0.6,         // 魔攻 = 智力×1.2 + 靈巧÷3 + 等級×0.6
    spd: a.int * 0.6 + a.vit * 0.6 + L * 0.6,       // 魔防 = 智力×0.6 + 體力×0.6 + 等級×0.6
    spe: a.agi * 1.5 + L * 0.6,                     // 速度 = 敏捷×1.5 + 等級×0.6
  };
  for (const k in s) s[k] = Math.floor(s[k]);
  s.mp = Math.floor(8 + L * 1.3 + a.int * 1.5);      // 最大MP = 8 + 等級×1.3 + 智力×1.5
  for (const k in st.boost || {}) if (s[k] !== undefined) s[k] += st.boost[k]; // legacy saves
  for (const g of equippedGear(st)) { const o = gearStats(g).st; for (const k in o) s[k] += o[k]; }
  s.crit = 3 + a.luk * 0.6;   // 會心率% = 3 + 幸運×0.6
  s.hit = a.dex * 0.5;        // 命中加成% = 靈巧×0.5
  s.eva = a.agi * 0.4 + a.luk * 0.1; // 迴避率% = 敏捷×0.4 + 幸運×0.1
  s.vs = []; s.resist = {}; s.drain = 0; s.elem = 0; s.counter = 0; // equipment affixes & talents
  for (const T of TALENTS) { const r = (st.tal || {})[T.id] || 0; if (r) for (const k in T.st) s[k] = (s[k] || 0) + T.st[k] * r; }
  const CL = CLASSES[st.cls]; if (CL) { const f = CL.tier === 1 ? clamp((L - 2) / 8, 0.4, 1) : 1; for (const k in CL.st) s[k] = (s[k] || 0) + (STATK.includes(k) ? Math.round(CL.st[k] * f) : CL.st[k]); } // base-class bonus grows in until Lv10
  { const wg = gearBy(st.equip && st.equip.weapon, st); s.welem = wg && GEAR[wg.b].elem || null; s.wkind = wg && GEAR[wg.b].kind || null; }
  s.fx = {}; for (const g of equippedGear(st)) for (const f of gearFx(g)) s.fx[f] = 1;
  for (const g of equippedGear(st)) { const p = gearStats(g).sp; s.crit += p.crit || 0; s.hit += p.hit || 0; s.eva += p.eva || 0; s.drain += p.drain || 0; s.elem += p.elem || 0; s.vs.push(...p.vs); for (const t in p.resist) s.resist[t] = (s.resist[t] || 0) + p.resist[t]; }
  return s;
}
const expForLevel = lv => Math.floor(0.8 * lv * lv * lv);
function heroLearnAt(lv, st = Game.st) { const line = classLine(st.cls) || HERO_LEARN; return line.filter(([l]) => l === lv).map(([, m]) => m); }

/* ---------- Screen: background pattern ---------- */
function screenBG(x) {
  x.fillStyle = '#0d1020'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#121632'; for (let y = 12; y < H; y += 16) x.fillRect(0, y, W, 1); for (let i = 8; i < W; i += 16) x.fillRect(i, 0, 1, H);
  const g = x.createLinearGradient(0, 0, 0, 90); g.addColorStop(0, 'rgba(110,231,210,0.10)'); g.addColorStop(1, 'rgba(110,231,210,0)'); x.fillStyle = g; x.fillRect(0, 0, W, 90);
}
function headerBar(x, title) {
  x.fillStyle = 'rgba(5,6,12,0.7)'; x.fillRect(0, 0, W, 20);
  x.fillStyle = UIC.accent; x.fillRect(6, 5, 2, 10);
  Font.draw(x, title, 12, 2, UIC.text, UIC.textSh);
  x.fillStyle = PANEL.edge; x.fillRect(0, 20, W, 1); x.fillStyle = UIC.accent; x.fillRect(0, 20, 32, 1);
}

/* ---------- Gear text & quality ---------- */
const qCol = it => UIC.text;

/* ---------- Quests ---------- */
function questList(st = Game.st) {
  const f = st.flags, L = [];
  L.push({ main: 1, n: '曙光的冒險者', t: !f.license ? '去村長家，問問自己為什麼會來到這個世界。' : !f.golem ? '古岩遺跡的魔像被魔王的瘴氣侵蝕而暴走。前往北方的遺跡平息它。' : '黯滅之王札爾格斯正在甦醒。鍛鍊力量，準備踏上討伐魔王的旅程。（第一章完）', done: !!f.golem, rw: '故事推進（第一章）・曙光之印' });
  if (f.q1) L.push({ n: '失蹤的弟弟', t: !f.q1res ? '花店姊姊的弟弟「小麥」去晨霧道路後沒回來。' : !f.q1done ? '回萌芽鎮告訴花店的姊姊。' : f.q1res === 'home' ? '完成：勸小麥回家了。' : '完成：替小麥保守了秘密。', done: !!f.q1done, rw: '勸他回家：好傷藥×2、300 G／保守秘密：好傷藥×1、200 G' });
  if (st.lv >= 8 && !st.cls) L.push({ n: '力量的覺醒', t: '村長好像有話要跟你說。（選擇職業）', done: false, rw: '職業與起始武器' });
  else if (st.cls && st.lv >= 14) L.push({ n: '更高的道路', t: f.deep ? '完成：完成了天賦覺醒。之後也能找村長轉職。' : '到達Lv14了。去找萌芽鎮的村長進行「天賦覺醒」吧。', done: !!f.deep, rw: '深層天賦・天賦點+2・可以轉職' });
  if (f.caravanMet || f.caravan) L.push({ n: '商隊的危機', t: !f.caravan ? '晨霧道路上的商隊被魔物包圍了！' : f.caravan === 'saved' ? '完成：擊退了魔物，行商在萌芽鎮擺攤。' : '失敗：商隊沒能抵達萌芽鎮。', done: !!f.caravan, rw: '行商在萌芽鎮開店（商品9折）' });
  if (f.wellCharm) L.push({ n: '井底更深處', t: f.crystalBoss ? '完成：擊敗了水晶魔像，覺醒了隱藏職業。' : (st.bag.rope ? '帶著繩索，從鎮上的井往下探索。' : '井底似乎還有更深的通道……需要繩索。'), done: !!f.crystalBoss, rw: '水晶之心、隱藏職業' });
  if (f.herb) L.push({ n: '會讓路的樹', t: f.f6 ? '完成：在迷霧森林深處找到了晨曦之劍。' : '藥草師說，迷霧森林西北角有一棵「會讓路的樹」。', done: !!f.f6, rw: '晨曦之劍的設計圖' });
  if (f.wellCharm) L.push({ n: '井底的月光', t: '完成：從老井撈起了月光護符。', done: true, rw: '月光護符' });
  extraQuests(st, L);
  for (const q of L) q.cat = questCatOf(q) || (q.main ? '主線' : '支線');
  return L.filter(q => !q.done).concat(L.filter(q => q.done));
}

/* ---------- Status (summary) screen ---------- */
function eqBonus(st) { const eqB = {}; for (const g of equippedGear(st)) { const o = gearStats(g).st; for (const k in o) eqB[k] = (eqB[k] || 0) + o[k]; } for (const k in st.boost || {}) eqB[k] = (eqB[k] || 0) + st.boost[k]; return eqB; }
function heroCard(x, st) {
  drawWin(x, 4, 24, 168, 70, 'menu');
  x.fillStyle = '#141a30'; x.fillRect(8, 28, 50, 62); x.fillStyle = '#1b2344'; x.fillRect(8, 76, 50, 14); x.fillStyle = 'rgba(110,231,210,0.25)'; x.fillRect(8, 76, 50, 1);
  x.drawImage(heroFramesFor(st).down[Math.floor(Game.frame / 20) % 4], 0, 0, 16, 22, 17, 30, 32, 44);
  const nx = Font.draw(x, st.name, 64, 27, UIC.text, UIC.textSh); if (CLASSES[st.cls]) Font.draw(x, CLASSES[st.cls].n, nx + 4, 28, UIC.warm, UIC.textSh, 10); Font.drawR(x, 'Lv.' + st.lv, 166, 27, UIC.accent, UIC.textSh);
  if (st.status) statusBadge(x, st.status, 64, 45); else Font.draw(x, '狀態良好', 64, 42, UIC.good, UIC.textSh);
  Font.drawR(x, st.money + 'G', 166, 42, UIC.warm, UIC.textSh);
  const cur = st.exp - expForLevel(st.lv), need = expForLevel(st.lv + 1) - expForLevel(st.lv);
  Font.draw(x, '下一級', 64, 58, UIC.muted, UIC.textSh); Font.drawR(x, (need - cur) + '', 166, 58, UIC.text, UIC.textSh);
  drawExpBar(x, 64, 84, 100, cur / need);
}
function* summaryScreen() {
  let page = 0, mi = 0, qTop = 0; const scr = { draw(x) {
    const st = Game.st, s = heroStats(); screenBG(x);
    headerBar(x, ['冒險者資料', '技能一覽', '任務'][page]); if (page === 1) Font.draw(x, 'MP ' + (st.mp ?? s.mp) + '/' + s.mp, 76, 3, UIC.blue || UIC.accent, UIC.textSh, 10);
    Font.drawR(x, '← ' + (page + 1) + '/3 →', W - 6, 2, UIC.muted, UIC.textSh);
    if (page === 0) heroCard(x, st);
    if (page === 2) {
      const QL = questList(st), VIS = 7, sel = Math.min(qTop, Math.max(0, QL.length - 1)), t0 = clamp(sel - 3, 0, Math.max(0, QL.length - VIS));
      drawWin(x, 4, 24, 168, VIS * 17 + 8, 'menu'); if (!QL.length) Font.draw(x, '目前沒有任務。', 14, 30, UIC.muted, UIC.textSh);
      QL.slice(t0, t0 + VIS).forEach((q, k) => { const i = t0 + k, Y = 28 + k * 17; if (i === sel) selBar(x, 6, Y - 1, 164, 16); const cc = q.done ? UIC.dis : QUEST_CAT_COL[q.cat] || UIC.warm; Font.draw(x, q.cat, 12, Y + 1, cc, UIC.textSh, 10); Font.draw(x, q.n, 40, Y, q.done ? UIC.muted : UIC.text, UIC.textSh, 11); Font.drawR(x, q.done ? '完成' : '進行中', 164, Y + 1, q.done ? UIC.dis : UIC.accent, UIC.textSh, 9); });
      if (t0 > 0) x.drawImage(UPARROW, 86, 25); if (t0 + VIS < QL.length) x.drawImage(DOWNARROW, 86, 24 + VIS * 17 + 3);
      const q = QL[sel]; drawWin(x, 4, 155, 168, 97, 'menu');
      if (q) { Font.draw(x, q.n, 12, 158, QUEST_CAT_COL[q.cat] || UIC.warm, UIC.textSh); Font.drawR(x, 'A 詳情', 164, 160, UIC.accent, UIC.textSh, 9); const rwL = q.rw ? Font.wrap('報酬：' + q.rw, 156, 10).slice(0, 2) : []; Font.wrap(q.t, 152, 11).slice(0, 5 - rwL.length).forEach((l, i) => Font.draw(x, l, 12, 175 + i * 14, q.done ? UIC.muted : UIC.text, UIC.textSh, 11));
        rwL.forEach((l, i) => Font.draw(x, l, 10, 250 - rwL.length * 12 + i * 12 - 2, q.done ? UIC.dis : UIC.warm, UIC.textSh, 10)); }
    } else if (page === 0) {
      const a = heroAttr(st), eqB = eqBonus(st);
      drawWin(x, 4, 98, 168, 62, 'menu');
      ATTRS.forEach((k, i) => { const X = 12 + (i % 2) * 80, Y = 103 + Math.floor(i / 2) * 17; Font.draw(x, ATTR_NAMES[k], X, Y, UIC.muted, UIC.textSh); Font.drawR(x, String(a[k]), X + 70, Y, (st.boost || {})[k] ? UIC.accent : UIC.text, UIC.textSh); });
      drawWin(x, 4, 162, 168, 90, 'menu');
      const rowsD = [['HP', st.hp + '/' + s.hp], ['MP', (st.mp ?? s.mp) + '/' + s.mp], ['物攻', s.atk, 'atk'], ['物防', s.def, 'def'], ['魔攻', s.spa, 'spa'], ['魔防', s.spd, 'spd'], ['速度', s.spe, 'spe'], ['會心', s.crit.toFixed(1) + '%']];
      rowsD.forEach(([n, v, k], i) => { const X = 12 + (i % 2) * 80, Y = 166 + Math.floor(i / 2) * 20; Font.draw(x, n, X, Y, UIC.muted, UIC.textSh); Font.drawR(x, String(v), X + 70, Y, k && eqB[k] ? UIC.accent : UIC.text, UIC.textSh); });
    } else {
      const SK = (st.cls && typeof classPassiveNode === 'function' ? ['_passive'] : []).concat(typeof summarySkills === 'function' ? summarySkills(st) : learnedSkills(st)), US = typeof usableSkills === 'function' ? usableSkills(st) : SK, VIS = 7; drawWin(x, 4, 24, 168, VIS * 19 + 8, 'menu'); const t0 = clamp(mi - 3, 0, Math.max(0, SK.length - VIS));
      if (!SK.length) Font.draw(x, '還沒有學會技能。（選單→技能）', 12, 30, UIC.muted, UIC.textSh, 11);
      SK.slice(t0, t0 + VIS).forEach((id, k) => { const i = t0 + k, mv = MOVES[id], Y = 28 + k * 19; if (i === mi) selBar(x, 6, Y, 164, 17); if (id === '_passive') { const pn = classPassives(st.cls).length; x.fillStyle = shade(UIC.warm, -0.45); x.fillRect(14, Y + 2, 30, 13); Font.drawC(x, '被動', 29, Y + 1, '#ffffff', UIC.textSh, 10); Font.draw(x, '職業・武器被動', 52, Y, UIC.warm, UIC.textSh); Font.drawR(x, (pn ? pn + '＋' : '') + (typeof mainWKey === 'function' && mainWKey(st) ? '武器' : ''), 164, Y, UIC.muted, UIC.textSh, 10); return; } typeBadge(x, mv.t, 14, Y + 2, 30); const use = US.includes(id); { const nm = mv.n + ' Lv' + (skillLv(id) || 1), rt = use ? 'MP ' + skillMP(id) : '未繼承'; let z = 12; while (z > 8 && Font.width(nm, z) > 150 - 52 - Font.width(rt, 11)) z--; Font.draw(x, nm, 52, Y + (12 - z) / 2, use ? UIC.text : UIC.dis, UIC.textSh, z); Font.drawR(x, rt, 164, Y, use ? UIC.accent : UIC.muted, UIC.textSh, 11); } });
      if (t0 > 0) x.drawImage(UPARROW, 86, 25); if (t0 + VIS < SK.length) x.drawImage(DOWNARROW, 86, 24 + VIS * 19 + 3);
      if (SK[Math.min(mi, SK.length - 1)] === '_passive') { drawWin(x, 4, 168, 168, 84, 'menu'); drawPassiveInfo(x, st, 12, 171, 152, true); }
      else if (SK.length) { const id = SK[Math.min(mi, SK.length - 1)], mv = MOVES[id], m2 = skillMove(id); drawWin(x, 4, 168, 168, 84, 'menu');
        Font.draw(x, (mv.cat === '變' ? '輔助' : mv.cat === '物' ? '物理' : '魔法') + (m2.pow ? '　' + (typeof powTxt === 'function' ? powTxt(m2) : '威力' + m2.pow) : '') + '　消耗MP ' + skillMP(id), 12, 171, UIC.accent, UIC.textSh, 11);
        drawFitText(x, mv.d || '', 12, 188, 152, 62, 11); }
    }
  } };
  UI.push(scr);
  while (true) {
    if (Input.pressed('left') || Input.pressed('right')) { page = (page + (Input.pressed('left') ? 2 : 1)) % 3; Sound.sfx('cursor'); }
    if (page === 2) { const n = questList().length; if (Input.repeat('up') && qTop > 0) { qTop--; Sound.sfx('cursor'); } if (Input.repeat('down') && qTop < n - 1) { qTop++; Sound.sfx('cursor'); } }
    if (page === 1) { const n = Math.max(1, (typeof summarySkills === 'function' ? summarySkills(Game.st) : learnedSkills()).length + (Game.st.cls && typeof classPassiveNode === 'function' ? 1 : 0)); if (Input.repeat('up')) { mi = (mi + n - 1) % n; Sound.sfx('cursor'); } if (Input.repeat('down')) { mi = (mi + 1) % n; Sound.sfx('cursor'); } }
    if (Input.pressed('a') && page === 2 && questList().length && typeof questDetailScreen === 'function') { Input.consume('a'); Sound.sfx('select'); const QL = questList(); UI.remove(scr); yield* questDetailScreen(QL[Math.min(qTop, QL.length - 1)]); UI.push(scr); }
    else if (Input.pressed('a') && page !== 1) { Input.consume('a'); page = (page + 1) % 3; Sound.sfx('cursor'); }
    else if (Input.pressed('b')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Move picker (forget move) ---------- */
function* pickMoveToForget(newId) {
  let mi = 0; const list = [...Game.st.moves.map(m => m.id), newId];
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '要忘記哪個技能？');
    drawWin(x, 4, 24, 168, 104, 'menu');
    list.forEach((id, i) => { const mv = MOVES[id]; const Y = 28 + i * 19; if (i === mi) selBar(x, 6, Y, 164, 17); typeBadge(x, mv.t, 14, Y + 2, 30); Font.draw(x, mv.n, 52, Y, i === 4 ? UIC.accent : UIC.text, UIC.textSh); Font.drawR(x, i === 4 ? '新技能' : 'PP ' + Game.st.moves[i].pp, 164, Y, i === 4 ? UIC.accent : UIC.muted, UIC.textSh); });
    const mv = MOVES[list[mi]]; drawWin(x, 4, 132, 168, 80, 'menu');
    Font.draw(x, (mv.cat === '變' ? '變化' : mv.cat === '物' ? '物理' : '魔法') + ' 威力' + (mv.pow || '—') + ' PP' + mv.pp, 12, 134, UIC.accent, UIC.textSh);
    drawFitText(x, mv.d || '', 12, 150, 152, 60, 12);
    drawWin(x, 4, 216, 168, 36, 'menu'); Font.draw(x, 'A：忘記這招', 14, 218, UIC.text, UIC.textSh); Font.draw(x, 'B：不學新技能', 14, 234, UIC.muted, UIC.textSh);
  } };
  UI.push(scr); let res = -1;
  while (true) {
    if (Input.repeat('up')) { mi = (mi + 4) % 5; Sound.sfx('cursor'); } if (Input.repeat('down')) { mi = (mi + 1) % 5; Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); Sound.sfx('select'); res = mi; break; }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); res = 4; break; }
    yield;
  }
  UI.remove(scr); return res; // 4 = don't learn
}

/* ---------- Bag ---------- */
const ITEM_ORDER = Object.keys(ITEMS);
function bagList(filter) { const st = Game.st; return Object.keys(st.bag).filter(k => st.bag[k] > 0 && ITEMS[k] && (!filter || filter(ITEMS[k], k))).sort((a, b) => (ITEM_CATS.indexOf(ITEMS[a].cat) - ITEM_CATS.indexOf(ITEMS[b].cat)) || (ITEM_ORDER.indexOf(a) - ITEM_ORDER.indexOf(b))); }
function gearSort(st = Game.st) { const order = ['weapon', 'head', 'body', 'feet', 'acc']; return (st.gear || []).slice().sort((x, y) => (isEquipped(y) - isEquipped(x)) || order.indexOf(GEAR[x.b].slot) - order.indexOf(GEAR[y.b].slot) || y.q - x.q); }
function drawGearDetail(x, g, Y, h, cmp) { // quality, roll, stats, specials, story text
  const B = GEAR[g.b], [a, b] = gearLines(g);
  Font.draw(x, gearName(g), 10, Y, gCol(g), UIC.textSh); Font.drawR(x, '品相' + Math.round(g.r * 100) + '%', 166, Y + 1, UIC.muted, UIC.textSh, 10);
  let y = Y + 17; Font.draw(x, EQUIP_SLOTS[B.slot === 'acc' ? 'acc1' : B.slot] + (B.kind && B.kind !== '飾品' ? '・' + B.kind : '') + '｜' + a, 12, y, UIC.text, UIC.textSh, 11); y += 14;
  if (b) for (const l of Font.wrap(b, 150, 11).slice(0, 2)) { Font.draw(x, l, 12, y, UIC.accent, UIC.textSh, 11); y += 13; }
  if (cmp) { Font.draw(x, cmp, 12, y, UIC.warm, UIC.textSh, 11); y += 13; }
  for (const f of B.fx || []) if (y + 12 < Y + h) for (const l of Font.wrap(SPECIALS[f].n + '：' + SPECIALS[f].d, 150, 10).slice(0, 2)) { if (y + 11 > Y + h) break; Font.draw(x, l, 12, y, UIC.warm, UIC.textSh, 10); y += 12; }
  if (y + 12 < Y + h) Font.wrap(B.d, 150, 11).slice(0, Math.floor((Y + h - y) / 13)).forEach((l, i) => Font.draw(x, l, 12, y + i * 13, UIC.muted, UIC.textSh, 11));
}
function* equipGearFlow(g) { // put an instance on; accessories pick a free/older slot
  const st = Game.st, sl0 = GEAR[g.b].slot; let sl = sl0;
  if (sl0 === 'acc') { if (!st.equip.acc1) sl = 'acc1'; else if (!st.equip.acc2) sl = 'acc2'; else { const r = yield* ask('要替換哪一個飾品？', [GEAR[gearBy(st.equip.acc1).b].n, GEAR[gearBy(st.equip.acc2).b].n, '取消']); if (r < 0 || r > 1) return false; sl = r ? 'acc2' : 'acc1'; } }
  for (const k in st.equip) if (st.equip[k] === g.u) st.equip[k] = null;
  st.equip[sl] = g.u; clampHP(); Sound.sfx('item'); return true;
}
function* bagScreen(mode = 'field') { // returns item id used (battle) or null
  let bagTapSel = -1;
  let tab = 0, idx = 0; const tabs = mode === 'battle' ? ['道具'] : ['道具', '裝備', '素材', '重要'];
  const listFor = t => tabs[t] === '裝備' ? gearSort() : bagList(it => tabs[t] === '道具' ? (!it.key && !it.mat && (mode !== 'battle' || (it.use !== 'boost' && it.use !== 'tp'))) : tabs[t] === '素材' ? !!it.mat : !!it.key);
  const VIS = 7;
  const scr = { touchBack: true, draw(x) {
    screenBG(x); headerBar(x, '背包'); Font.drawR(x, Game.st.money + ' G', W - 6, 2, UIC.warm, UIC.textSh);
    const tw = Math.floor(171 / tabs.length); tabs.forEach((t, i) => { const X = 4 + i * tw; drawBtn(x, X, 23, tw - 3, 15, i === tab); Font.drawC(x, t, X + (tw - 3) / 2, 22, i === tab ? UIC.text : UIC.muted, UIC.textSh); });
    const list = listFor(tab), gear = tabs[tab] === '裝備'; drawWin(x, 4, 40, 168, VIS * 18 + 10, 'menu');
    if (!list.length) Font.draw(x, '（空空如也）', 20, 46, UIC.muted, UIC.textSh);
    const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((k, i) => { const Y = 44 + i * 18; if (top + i === idx) selBar(x, 6, Y - 1, 164, 17);
      if (gear) { const e = Font.draw(x, GEAR[k.b].n, 14, Y, gCol(k), UIC.textSh); if (isEquipped(k)) Font.draw(x, 'E', e + 2, Y, UIC.accent, UIC.textSh); Font.drawR(x, EQUIP_SLOTS[GEAR[k.b].slot === 'acc' ? 'acc1' : GEAR[k.b].slot], 164, Y, UIC.muted, UIC.textSh, 11); return; }
      Font.draw(x, ITEMS[k].n, 14, Y, UIC.text, UIC.textSh); if (!ITEMS[k].key) Font.drawR(x, '×' + Game.st.bag[k], 164, Y, UIC.muted, UIC.textSh); });
    if (top > 0) x.drawImage(UPARROW, 85, 41); if (top + VIS < list.length) x.drawImage(DOWNARROW, 85, 40 + VIS * 18 + 4);
    if (typeof touchRegion === 'function') { list.slice(top, top + VIS).forEach((k, i) => touchRegion(6, 43 + i * 18, 164, 17, () => { if (mode === 'battle' && bagTapSel !== top + i) { bagTapSel = idx = top + i; Sound.sfx('cursor'); return; } idx = top + i; tapKey('a'); })); /* v24.6 battle: 1st tap shows the item, 2nd tap uses it */ tabs.forEach((t, i) => touchRegion(4 + i * tw, 23, tw - 3, 15, () => { tab = i; idx = 0; })); }
    drawWin(x, 4, 180, 168, 72, 'menu');
    if (list[idx]) { if (gear) drawGearDetail(x, list[idx], 182, 68); else { const k0 = list[idx], it = ITEMS[k0]; Font.draw(x, '【' + it.cat + '】', 10, 182, ITEM_CAT_COL[it.cat] || UIC.muted, UIC.textSh, 10); if (it.mat) Font.drawR(x, '採集熟練度 Lv' + gatherLv(), 166, 182, UIC.accent, UIC.textSh, 10); const src = it.mat ? matSourceText(k0) : ''; Font.wrap(it.d, 152).slice(0, src ? 2 : 3).forEach((l, i) => Font.draw(x, l, 12, 197 + i * 16, UIC.text, UIC.textSh)); if (src) Font.draw(x, Font.wrap('取得：' + src, 156, 10)[0], 10, 234, UIC.warm, UIC.textSh, 10); } }
  } };
  UI.push(scr); let result = null;
  while (true) {
    const list = listFor(tab); if (idx >= list.length) idx = Math.max(0, list.length - 1);
    if (tabs.length > 1 && (Input.pressed('left') || Input.pressed('right'))) { tab = (tab + (Input.pressed('left') ? tabs.length - 1 : 1)) % tabs.length; idx = 0; Sound.sfx('cursor'); }
    if (Input.repeat('up') && list.length) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); }
    if (Input.repeat('down') && list.length) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a') && list[idx]) {
      Input.consume('a'); Sound.sfx('select');
      if (tabs[tab] === '裝備') { const g = list[idx], eq = isEquipped(g), opts = eq ? ['查看詳情', '取消'] : ['裝備', '查看詳情', '取消']; const r = yield* ask(GEAR[g.b].n + (eq ? '（裝備中）' : ''), opts); const pick = opts[r]; if (pick === '查看詳情') { UI.remove(scr); yield* gearInfoScreen(g); UI.push(scr); } else if (pick === '裝備' && (yield* equipGearFlow(g))) yield* say(Game.st.name + '裝備了' + GEAR[g.b].n + '！'); continue; }
      const k = list[idx], it = ITEMS[k];
      if (it.key || it.mat) { yield* say(it.use === 'phone' ? phoneText() : it.d); continue; }
      const r = yield* ask('要使用' + it.n + '嗎？', ['使用', '取消']);
      if (r !== 0) continue;
      if (mode === 'battle') { if (it.use === 'home' && Game.scene.F && Game.scene.F.boss) { yield* say('頭目戰中無法使用！'); continue; } if (it.use === 'escape' || it.use === 'home' || canUseItem(k)) { result = k; break; } yield* say('現在使用也沒有效果。'); continue; }
      if (it.use === 'escape') { yield* say('現在不能使用。'); continue; }
      if (it.use === 'home') { if (HOME_MAPS.includes(Game.st.map)) { yield* say('已經在萌芽鎮了。'); continue; } Game.st.bag[k]--; Game.homeWarp = 1; break; }
      const msg = useItem(k); if (!msg) { yield* say((typeof itemBlockMsg === 'function' && itemBlockMsg(k)) || '現在使用也沒有效果。'); continue; }
      Sound.sfx(it.use === 'heal' ? 'heal' : 'item'); yield* say(msg);
    }
    yield;
  }
  UI.remove(scr); return result;
}
function phoneText() { const st = Game.st; const pct = Math.max(1, 12 - Math.floor((st.steps || 0) / 400)); return '從原本的世界帶來的手機。\n電量剩下' + pct + '%……還是完全沒有訊號。\n桌布是家附近的那條街。'; }
function clampHP() { const s = heroStats(); Game.st.hp = Math.min(Game.st.hp, s.hp); if (Game.st.mp !== undefined) Game.st.mp = Math.min(Game.st.mp, s.mp); }
function canUseItem(k) {
  const it = ITEMS[k], st = Game.st, s = heroStats();
  if (it.use === 'heal') return st.hp < s.hp && st.hp > 0;
  if (it.use === 'cure') return st.status === it.v;
  if (it.use === 'mp') return (st.mp ?? s.mp) < s.mp;
  if (it.use === 'boost' || it.use === 'tp') return true;
  if (it.use === 'full') return st.hp > 0 && (st.hp < s.hp || !!st.status || (st.mp ?? s.mp) < s.mp);
  return false;
}
function useItem(k) { // returns message or null; applies to Game.st
  if (!canUseItem(k)) return null; const it = ITEMS[k], st = Game.st, s = heroStats(); st.bag[k]--;
  if (it.use === 'heal') { const b = st.hp; st.hp = Math.min(s.hp, st.hp + it.v); return st.name + '的HP恢復了' + (st.hp - b) + '點！'; }
  if (it.use === 'cure') { st.status = null; return st.name + '的' + { psn: '中毒', par: '麻痺', slp: '睡眠', brn: '灼傷' }[it.v] + '治好了！'; }
  if (it.use === 'mp') { const b = st.mp ?? s.mp; st.mp = Math.min(s.mp, b + it.v); return st.name + '的MP恢復了' + (st.mp - b) + '點！'; }
  if (it.use === 'full') { st.hp = s.hp; st.mp = s.mp; st.status = null; return st.name + '的HP和MP完全恢復了！'; }
  if (it.use === 'tp') { st.tp = (st.tp || 0) + 1; return st.name + '讀完了天賦之書，獲得1點天賦點！'; }
  if (it.use === 'boost') { st.boost = st.boost || {}; for (const q in it.v) st.boost[q] = (st.boost[q] || 0) + it.v[q]; return st.name + '的' + Object.keys(it.v).map(q => ATTR_NAMES[q] || STAT_NAMES[q]).join('、') + '永久提升了！'; }
  return null;
}

/* ---------- Equipment ---------- */
function* equipScreen() {
  let idx = 0; const slots = Object.keys(EQUIP_SLOTS), st = Game.st;
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '裝備');
    drawWin(x, 4, 24, 168, slots.length * 25 + 6, 'menu');
    slots.forEach((sl, i) => { const Y = 27 + i * 25, g = gearBy(st.equip[sl]); if (i === idx) selBar(x, 6, Y, 164, 24);
      Font.draw(x, EQUIP_SLOTS[sl], 12, Y, UIC.accent, UIC.textSh, 11); Font.draw(x, g ? GEAR[g.b].n : '——', 44, Y, g ? gCol(g) : UIC.dis, UIC.textSh);
      if (g) Font.draw(x, gearLines(g)[0] + (gearLines(g)[1] ? ' ＋特效' : ''), 44, Y + 12, UIC.muted, UIC.textSh, 9); });
    const s = heroStats(), Y0 = 24 + slots.length * 25 + 10; drawWin(x, 4, Y0, 168, H - Y0 - 4, 'menu');
    [['HP', st.hp + '/' + s.hp], ['MP', (st.mp ?? s.mp) + '/' + s.mp], ['物攻', s.atk], ['物防', s.def], ['魔攻', s.spa], ['魔防', s.spd], ['速度', s.spe], ['會心', s.crit.toFixed(1) + '%']].forEach(([a, b], i) => { const X = 58 + (i % 2) * 58, Y = Y0 + 3 + Math.floor(i / 2) * 15; Font.draw(x, a, X, Y, UIC.muted, UIC.textSh, 10); Font.drawR(x, String(b), X + 54, Y, UIC.text, UIC.textSh, 10); });
    dollPreview(x, heroLookOf(st), 8, Y0 + 4);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + slots.length - 1) % slots.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % slots.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) {
      Input.consume('a'); Sound.sfx('select'); const sl = slots[idx], cur = gearBy(st.equip[sl]);
      const own = gearSort().filter(g => GEAR[g.b].slot === SLOT_OF(sl) && (!isEquipped(g) || g === cur));
      const opts = own.map(g => ({ t: GEAR[g.b].n + (g === cur ? ' E' : ''), g, col: gCol(g) })).concat([{ t: '卸下', g: null }]);
      let hi = 0; const tip = { draw(x) { const o = opts[hi]; drawWin(x, 4, 24, 34, 112, 'menu'); dollPreview(x, heroLookOf(st, { [sl]: o ? (o.g ? o.g.u : null) : st.equip[sl] }), 5, 30, 1); drawWin(x, 4, 176, 168, 76, 'menu'); if (o && o.g) { const before = heroStats(); const sv = st.equip[sl]; st.equip[sl] = o.g.u; const after = heroStats(); st.equip[sl] = sv; const d = ['atk', 'def', 'spa', 'spd', 'spe'].map(k => [k, after[k] - before[k]]).filter(([, v]) => v).map(([k, v]) => STAT_NAMES[k] + (v > 0 ? '↑' : '↓') + Math.abs(v)).join(' '); drawGearDetail(x, o.g, 178, 72, d || '能力不變'); } else Font.draw(x, '把這個部位的裝備卸下。', 12, 182, UIC.muted, UIC.textSh); } };
      UI.push(tip);
      const r = yield* choose(opts, { x: 40, y: 24, w: 132, visible: 8, onMove: i => hi = i });
      UI.remove(tip);
      if (r >= 0) { for (const k in st.equip) if (opts[r].g && st.equip[k] === opts[r].g.u) st.equip[k] = null; st.equip[sl] = opts[r].g ? opts[r].g.u : null; clampHP(); Sound.sfx('item'); }
    }
    yield;
  }
  UI.remove(scr);
}
/* ---------- Options ---------- */
function* optionsScreen() {
  let idx = 0; const labels = ['文字速度', '背景音樂', '音效', '自動存檔', '戰鬥美術', '怪物造型', '戰鬥說明', '關閉'], N = labels.length, HELP = N - 2, TOG = ['music', 'sfx', 'autosave', 'hdArt', 'chibi'];
  const val = i => i === 0 ? ['慢', '普通', '快'][Game.settings.text] : TOG[i - 1] === 'hdArt' ? (Game.settings.hdArt !== false ? '新版' : '舊版') : TOG[i - 1] === 'chibi' ? (Game.settings.chibi !== false ? 'Q版' : '寫實') : TOG[i - 1] === 'chibiHero' ? (Game.settings.chibiHero !== false ? 'Q版' : '原版') : i < N - 1 ? (Game.settings[TOG[i - 1]] ? '開' : '關') : '';
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '設定');
    drawWin(x, 4, 30, 168, N * 18 + 12, 'menu');
    labels.forEach((l, i) => { const Y = 36 + i * 18; if (i === idx) selBar(x, 6, Y - 1, 164, 17); Font.draw(x, l, 14, Y, UIC.text, UIC.textSh); if (i === HELP) Font.drawR(x, 'A 查看 ▶', 164, Y, UIC.accent, UIC.textSh); else if (i < N - 1) Font.drawR(x, '← ' + val(i) + ' →', 164, Y, UIC.accent, UIC.textSh); });
    const Y2 = 30 + N * 18 + 16; drawWin(x, 4, Y2, 168, Math.min(70, 252 - Y2), 'menu'); Font.draw(x, '← → 切換設定　B 鍵返回', 14, Y2 + 3, UIC.muted, UIC.textSh, 11);
    Font.wrap('自動存檔：換地圖、打完戰鬥、每走100步時自動記錄，關閉網頁時也會記錄。', 150, 10).slice(0, 3).forEach((l, i) => Font.draw(x, l, 14, Y2 + 18 + i * 12, UIC.muted, UIC.textSh, 10));
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + N - 1) % N; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % N; Sound.sfx('cursor'); }
    if (idx === HELP && Input.pressed('a')) { Input.consume('a'); Sound.sfx('select'); UI.remove(scr); yield* battleHelpScreen(); UI.push(scr); yield; continue; }
    let d = idx === HELP ? 0 : Input.pressed('left') ? -1 : Input.pressed('right') ? 1 : 0;
    if (!d && Input.pressed('a') && idx < N - 1) { Input.consume('a'); d = 1; if (idx === 0 && Game.settings.text === 2) d = -2; }
    if (d) { if (idx === 0) Game.settings.text = clamp(Game.settings.text + d, 0, 2); else Game.settings[TOG[idx - 1]] = TOG[idx - 1] === 'hdArt' ? Game.settings.hdArt === false : TOG[idx - 1] === 'chibi' ? Game.settings.chibi === false : TOG[idx - 1] === 'chibiHero' ? Game.settings.chibiHero === false : !Game.settings[TOG[idx - 1]]; Sound.applySettings(); Sound.sfx('cursor'); saveSettings(); }
    if (Input.pressed('b') || (Input.pressed('a') && idx === N - 1)) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}

function moneyWin(x) { drawWin(x, 2, 2, 86, 30, 'menu'); Font.draw(x, '金錢', 10, 3, UIC.muted, UIC.textSh); Font.drawR(x, Game.st.money + ' G', 80, 15, UIC.warm, UIC.textSh); }
function* shopFlow(stock) {
  const mw = { draw: moneyWin }; UI.push(mw);
  if (!stock && Game.st.flags.caravan === 'lost' && !Game.st.flags.shopLost) { Game.st.flags.shopLost = 1; yield* say('商隊沒能抵達……好傷藥進不了貨了。'); }
  if (Game.st.flags.croc && !Game.st.flags.shopNew) { Game.st.flags.shopNew = 1; yield* say('橋通了之後，王都的商人送來了新貨！（裝備請找鐵匠打造喔）'); }
  while (true) {
    const r = yield* ask('歡迎光臨！請問需要什麼呢？', ['購買', '賣出', '離開']);
    if (r === 0) yield* shopBuy(stock); else if (r === 1) yield* shopSell(); else break;
  }
  UI.remove(mw); yield* say('謝謝惠顧！歡迎再來！');
}
function* shopBuy(stock) {
  let idx = 0; const list = stock || shopList(); const VIS = 8;
  const scr = { draw(x) {
    drawWin(x, 4, 36, 168, VIS * 18 + 10, 'menu');
    const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((k, i) => { const Y = 40 + i * 18; const it = ITEMS[k] || GEAR[k]; if (top + i === idx) selBar(x, 6, Y - 1, 164, 17); Font.draw(x, it.n, 14, Y, GEAR[k] ? GQ[1][1] : UIC.text, UIC.textSh); Font.drawR(x, priceOf(k) + 'G', 164, Y, UIC.warm, UIC.textSh); });
    if (top > 0) x.drawImage(UPARROW, 85, 37); if (top + VIS < list.length) x.drawImage(DOWNARROW, 85, 36 + VIS * 18 + 4);
    drawWin(x, 4, TB_Y + 1, W - 8, TB_H - 2, 'ow'); const k0 = list[idx];
    if (GEAR[k0]) drawGearDetail(x, { b: k0, q: 1, r: 1, a: [] }, TB_Y + 3, 54); else Font.wrap(ITEMS[k0].d + '（持有' + (Game.st.bag[k0] || 0) + '）', 150).slice(0, 3).forEach((l, i) => Font.draw(x, l, 12, TB_Y + 7 + i * 16, UIC.text, UIC.textSh));
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('right') && GEAR[list[idx]]) { UI.remove(scr); yield* gearInfoScreen({ b: list[idx], q: 1, r: 1, a: [] }, '商品詳情'); UI.push(scr); }
    if (Input.pressed('a')) {
      Input.consume('a'); Sound.sfx('select'); const k = list[idx], it = ITEMS[k] || GEAR[k], isG = !!GEAR[k];
      let qty = 1; const pr = priceOf(k); let maxQ = 0; const cap = isG || it.once ? 1 : 99; while (maxQ < cap && priceFor(k, maxQ + 1) <= Game.st.money) maxQ++;
      if (it.once && Game.st.bag[k]) { UI.remove(scr); yield* say(it.key ? '你已經有' + it.n + '了。' : it.n + '一次只能帶一個喔。'); UI.push(scr); continue; }
      if (maxQ < 1) { UI.remove(scr); yield* say('錢不夠喔。'); UI.push(scr); continue; }
      if (!isG && !it.once) {
        const q = { draw(x) { drawWin(x, 80, TB_Y - 32, 94, 30, 'menu'); Font.draw(x, '×' + String(qty).padStart(2, '0'), 90, TB_Y - 25, UIC.text, UIC.textSh); Font.drawR(x, priceFor(k, qty) + 'G', 166, TB_Y - 25, UIC.warm, UIC.textSh); } };
        UI.push(q); let ok = false;
        while (true) { if (Input.repeat('up')) { qty = qty >= maxQ ? 1 : qty + 1; Sound.sfx('cursor'); } if (Input.repeat('down')) { qty = qty <= 1 ? maxQ : qty - 1; Sound.sfx('cursor'); } if (Input.repeat('right')) { qty = Math.min(maxQ, qty + 10); Sound.sfx('cursor'); } if (Input.repeat('left')) { qty = Math.max(1, qty - 10); Sound.sfx('cursor'); } if (Input.pressed('a')) { Input.consume('a'); ok = true; break; } if (Input.pressed('b')) { Input.consume('b'); break; } yield; }
        UI.remove(q); if (!ok) continue;
      }
      UI.remove(scr);
      const yes = yield* yesNo(it.n + (isG || it.once ? '' : '×' + qty) + '，一共是' + priceFor(k, qty) + 'G，可以嗎？' + (k === 'tpBook' && qty > 1 ? '\n（已含每本+1500G的漲價）' : ''));
      if (yes) { Game.st.money -= priceFor(k, qty); if (isG) makeGear(k, 1, 0.8); else Game.st.bag[k] = (Game.st.bag[k] || 0) + qty; if (k === 'tpBook') Game.st.tpBought = (Game.st.tpBought || 0) + qty; Sound.sfx('save'); yield* say('好的！這是您的' + it.n + '。' + (isG ? '記得到裝備畫面裝備喔！' : '')); }
      UI.push(scr);
    }
    yield;
  }
  UI.remove(scr);
}
function* shopSell() {
  let idx = 0; const VIS = 8, st = Game.st;
  const listNow = () => bagList(it => !it.key && !(it.price === 0 && !it.sell)).concat(gearSort().filter(g => !isEquipped(g) && g.q < 4));
  const nameOf = k => typeof k === 'string' ? ITEMS[k].n + '×' + st.bag[k] : GEAR[k.b].n, priceK = k => typeof k === 'string' ? sellPrice(k) : gearSell(k);
  const scr = { draw(x) {
    const list = listNow(); drawWin(x, 4, 36, 168, VIS * 18 + 10, 'menu');
    if (!list.length) Font.draw(x, '沒有可以賣的東西', 14, 42, UIC.muted, UIC.textSh);
    const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((k, i) => { const Y = 40 + i * 18; if (top + i === idx) selBar(x, 6, Y - 1, 164, 17); Font.draw(x, nameOf(k), 14, Y, typeof k === 'string' ? UIC.text : gCol(k), UIC.textSh); Font.drawR(x, priceK(k) + 'G', 164, Y, UIC.warm, UIC.textSh); });
    drawWin(x, 4, TB_Y + 1, W - 8, TB_H - 2, 'ow'); const k = list[idx];
    if (k && typeof k !== 'string') drawGearDetail(x, k, TB_Y + 3, 54); else { Font.draw(x, list.length ? '要賣哪一樣東西呢？' : '目前沒有可以賣的東西。', 12, TB_Y + 7, UIC.text, UIC.textSh); Font.draw(x, '（裝備中和金色的裝備不能賣）', 12, TB_Y + 23, UIC.muted, UIC.textSh); }
  } };
  UI.push(scr);
  while (true) {
    const list = listNow(); if (idx >= list.length) idx = Math.max(0, list.length - 1);
    if (Input.repeat('up') && list.length) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down') && list.length) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a') && list[idx]) {
      Input.consume('a'); const k = list[idx]; UI.remove(scr); const nm = typeof k === 'string' ? ITEMS[k].n : GEAR[k.b].n, pr = priceK(k);
      const yes = yield* yesNo(nm + '可以用' + pr + 'G收購，要賣嗎？');
      if (yes) { if (typeof k === 'string') st.bag[k]--; else st.gear = st.gear.filter(g => g !== k); st.money += pr; Sound.sfx('save'); yield* say('謝謝！收下了' + nm + '。'); }
      UI.push(scr);
    }
    yield;
  }
  UI.remove(scr);
}
const sellPrice = k => ITEMS[k].sell ?? Math.floor(ITEMS[k].price / 2);

/* ---------- Smith: enhance & salvage ---------- */
function* gearPicker(title, getList, extra) { // returns a gear instance or null
  let idx = 0; const VIS = 7;
  const scr = { draw(x) {
    screenBG(x); headerBar(x, title); Font.drawR(x, Game.st.money + ' G', W - 6, 2, UIC.warm, UIC.textSh);
    const list = getList(); drawWin(x, 4, 24, 168, VIS * 18 + 10, 'menu'); if (!list.length) Font.draw(x, '（沒有可以選的裝備）', 14, 30, UIC.muted, UIC.textSh);
    const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((g, i) => { const Y = 28 + i * 18; if (top + i === idx) selBar(x, 6, Y - 1, 164, 17); const e = Font.draw(x, gearShort(g), 14, Y, gCol(g), UIC.textSh); if (isEquipped(g)) Font.draw(x, 'E', e + 2, Y, UIC.accent, UIC.textSh); });
    if (top > 0) x.drawImage(UPARROW, 85, 25); if (top + VIS < list.length) x.drawImage(DOWNARROW, 85, 24 + VIS * 18 + 4);
    drawWin(x, 4, 164, 168, 88, 'menu'); const g = list[idx]; if (g) { drawGearDetail(x, g, 166, 44); extra(x, g, 212); }
  } };
  UI.push(scr); let res = null;
  while (true) {
    const list = getList(); if (idx >= list.length) idx = Math.max(0, list.length - 1);
    if (Input.repeat('up') && list.length) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down') && list.length) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a') && list[idx]) { Input.consume('a'); Sound.sfx('select'); res = list[idx]; break; }
    yield;
  }
  UI.remove(scr); return res;
}
function* enhanceFlow() {
  const st = Game.st, matTxt = m => Object.entries(m).map(([k, n]) => ITEMS[k].n + '×' + n + '（有' + (st.bag[k] || 0) + '）').join(' ');
  while (true) {
    const g = yield* gearPicker('裝備強化', () => gearSort().filter(q => (q.e || 0) < 5), (x, g, Y) => { const c = enhanceCost(g); Font.draw(x, '+' + (g.e || 0) + ' → +' + ((g.e || 0) + 1) + '　成功率' + Math.round(c.rate * 100) + '%', 12, Y, UIC.accent, UIC.textSh, 11); Font.draw(x, matTxt(c.mats), 12, Y + 13, UIC.text, UIC.textSh, 10); Font.drawR(x, c.gold + ' G', 164, Y + 26, st.money >= c.gold ? UIC.warm : UIC.bad, UIC.textSh, 11); });
    if (!g) return;
    const c = enhanceCost(g), ok = st.money >= c.gold && Object.entries(c.mats).every(([k, n]) => (st.bag[k] || 0) >= n);
    if (!ok) { yield* say('素材或金錢不夠喔。'); continue; }
    if (!(yield* yesNo('要強化' + gearShort(g) + '嗎？' + (c.rate < 1 ? '\n（失敗的話素材和金錢會消失）' : '')))) continue;
    st.money -= c.gold; for (const k in c.mats) st.bag[k] -= c.mats[k];
    Sound.sfx('rock'); yield* say('鏘！鏘！鏘！');
    if (Math.random() < c.rate) { g.e = (g.e || 0) + 1; clampHP(); Sound.jingle('item'); yield* say('強化成功！' + gearName(g) + '！'); } else { Sound.sfx('bump'); yield* say('……可惜，這次失敗了。'); }
  }
}
function* salvageFlow() {
  const st = Game.st;
  while (true) {
    const g = yield* gearPicker('分解裝備', () => gearSort().filter(q => !isEquipped(q) && q.q < 4), (x, g, Y) => { Font.draw(x, '分解後可以得到素材（' + SALVAGE[GEAR[g.b].slot].map(k => ITEMS[k].n).join('、') + '）', 12, Y, UIC.accent, UIC.textSh, 10); Font.draw(x, '金色和裝備中的東西不能分解', 12, Y + 14, UIC.muted, UIC.textSh, 10); });
    if (!g) return;
    if (!(yield* yesNo('要分解' + gearShort(g) + '嗎？'))) continue;
    const pool = SALVAGE[GEAR[g.b].slot], n = GEAR[g.b].t + g.q - 1 + (g.e || 0), got = {};
    for (let i = 0; i < n; i++) { const k = pick(pool); got[k] = (got[k] || 0) + 1; st.bag[k] = (st.bag[k] || 0) + 1; }
    st.gear = st.gear.filter(q => q !== g); Sound.sfx('rock');
    yield* say('分解完成！得到了' + Object.entries(got).map(([k, v]) => ITEMS[k].n + '×' + v).join('、') + '。');
  }
}

/* ---------- Crafting ---------- */
function* craftScreen() {
  const st = Game.st; let idx = 0; const have = k => st.bag[k] || 0;
  const can = R => Object.entries(R.mats).every(([k, n]) => have(k) >= n) && st.money >= (R.gold || 0) && !(ITEMS[R.out] && ITEMS[R.out].once && have(R.out));
  const VIS = 7, top = () => clamp(idx - 3, 0, Math.max(0, RECIPES.length - VIS));
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '鐵匠工房'); Font.drawR(x, st.money + ' G', W - 6, 2, UIC.warm, UIC.textSh);
    const T = top(); drawWin(x, 4, 24, 168, VIS * 17 + 8, 'menu');
    RECIPES.slice(T, T + VIS).forEach((R, i) => { const Y = 28 + i * 17, it = ITEMS[R.out] || GEAR[R.out]; if (T + i === idx) selBar(x, 6, Y - 1, 164, 16); { const nm = it.n + (R.n > 1 ? '×' + R.n : ''); let z = 12; while (z > 8 && Font.width(nm, z) > 100) z--; Font.draw(x, nm, 14, Y, can(R) ? (GEAR[R.out] ? GQ[2][1] : UIC.text) : UIC.dis, UIC.textSh, z); } Font.drawR(x, can(R) ? '可製作' : '素材不足', 164, Y, can(R) ? UIC.accent : UIC.dis, UIC.textSh, 11); });
    if (T > 0) x.drawImage(UPARROW, 86, 25); if (T + VIS < RECIPES.length) x.drawImage(DOWNARROW, 86, 24 + VIS * 17 + 3);
    const R = RECIPES[idx], it = ITEMS[R.out] || GEAR[R.out], Y0 = 24 + VIS * 17 + 12; drawWin(x, 4, Y0, 168, H - Y0 - 4, 'menu'); let y = Y0 + 3;
    // v20.6: the description wraps inside the window (long gear lines used to run off the right edge)
    const DL = GEAR[R.out] ? ['【藍／紫・工匠品】'].concat(Font.wrap(gearLines({ b: R.out, q: 1, r: 0.9, a: [] })[0], 152, 10)).slice(0, 3) : Font.wrap(it.d, 152, 10).slice(0, 3);
    DL.forEach((l, n) => Font.draw(x, l, 10, y + n * 12, GEAR[R.out] ? (n ? UIC.text : GQ[1][1]) : UIC.text, UIC.textSh, 10)); y += DL.length * 12 + 3;
    Font.draw(x, '需要的素材', 10, y, UIC.muted, UIC.textSh, 10); if (R.gold) Font.drawR(x, '費用 ' + R.gold + ' G', 164, y, st.money >= R.gold ? UIC.warm : UIC.bad, UIC.textSh, 10); y += 13;
    for (const [k, n] of Object.entries(R.mats)) { let z = 11; while (z > 8 && Font.width('・' + ITEMS[k].n, z) > 110) z--; Font.draw(x, '・' + ITEMS[k].n, 12, y, UIC.text, UIC.textSh, z); Font.drawR(x, have(k) + ' / ' + n, 164, y, have(k) >= n ? UIC.good : UIC.bad, UIC.textSh, 11); y += 13; }
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + RECIPES.length - 1) % RECIPES.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % RECIPES.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) { Input.consume('a'); const R = RECIPES[idx]; if (!can(R)) { Sound.sfx('bump'); continue; }
      for (const [k, n] of Object.entries(R.mats)) st.bag[k] -= n; st.money -= R.gold || 0; let nm;
      if (GEAR[R.out]) nm = gearName(makeGear(R.out, craftQuality(), craftRoll())); else { st.bag[R.out] = (st.bag[R.out] || 0) + (R.n || 1); nm = ITEMS[R.out].n; }
      UI.remove(scr); yield* itemGet('鐵匠做好了' + nm + '！'); UI.push(scr); }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Talents ---------- */
function* talentScreen() {
  const st = Game.st; st.tal = st.tal || {}; let c = 0, r = 0;
  const T = () => TALENTS.filter(t => t.line === c)[r];
  const locked = t => t.req && (st.tal[t.req] || 0) < 2;
  const talBlock = t => { const rk = st.tal[t.id] || 0; if (!rk) return '還沒有投入點數'; if (rk - 1 < 2 && TALENTS.some(q => q.req === t.id && (st.tal[q.id] || 0) > 0)) return '「' + TALENTS.find(q => q.req === t.id && (st.tal[q.id] || 0) > 0).n + '」需要它'; return null; };
  const LBL = { atk: ['物攻', ''], crit: ['會心率', '%'], pierceT: ['破防', '%'], spa: ['魔攻', ''], elem: ['屬性傷害', '%'], mpRegen: ['每回合回MP', '%'], hp: ['最大HP', ''], eva: ['迴避率', '%'], counter: ['防禦反擊', ''] };
  const val = (t, n) => { const k = Object.keys(t.st)[0], L = t.lbl || LBL[k] || [k, '']; return n <= 0 ? '—' : t.on ? t.on : k === 'counter' ? '啟用' : L[0] + '+' + t.st[k] * n + L[1]; };
  const rows = () => Math.max(...TALENT_LINES.map((_, ci) => TALENTS.filter(t => t.line === ci).length)), RP = () => rows() > 4 ? 21 : rows() > 3 ? 32 : 38, RH = () => rows() > 4 ? 19 : rows() > 3 ? 30 : 34, DY = () => rows() > 3 ? 178 : 166; // v21: 6 talents per line → one-line buttons
  const fitC = (x, s, cx, y, col, sz) => { let z = sz; while (z > 7 && Font.width(s, z) > 52) z--; Font.drawC(x, s, cx, y, col, UIC.textSh, z); };
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '天賦'); Font.drawR(x, '天賦點 ' + (st.tp || 0), W - 6, 2, st.tp ? UIC.warm : UIC.muted, UIC.textSh);
    Font.drawC(x, '永久的被動加成・Lv6起每2級+1點', W / 2, 21, UIC.muted, UIC.textSh, 10);
    TALENT_LINES.forEach((ln, ci) => {
      const X = 4 + ci * 57; Font.drawC(x, ln, X + 27, 34, UIC.accent, UIC.textSh);
      const rp = RP(), rh = RH(), cmp = rh < 34, n = TALENTS.filter(t => t.line === ci).length;
      TALENTS.filter(t => t.line === ci).forEach((t, ri) => { const Y = 50 + ri * rp, rk = st.tal[t.id] || 0, on = ci === c && ri === r, lk = locked(t);
        drawBtn(x, X, Y, 54, rh, on); const tiny = rh < 24;
        if (tiny) { fitC(x, t.n, X + 27, Y - 2, lk ? UIC.dis : rk ? UIC.text : '#c9cfe4', 10); for (let k = 0; k < t.max; k++) { x.fillStyle = k < rk ? UIC.warm : '#30375a'; x.fillRect(X + 27 - t.max * 4 + k * 8 + 1, Y + rh - 4, 6, 2); } return; }
        fitC(x, t.n, X + 27, Y + (cmp ? -1 : 1), lk ? UIC.dis : rk ? UIC.text : '#c9cfe4', 11);
        fitC(x, rk ? val(t, rk) : (lk ? '未解鎖' : '未學習'), X + 27, Y + (cmp ? 10 : 14), rk ? UIC.good : UIC.dis, 9);
        for (let k = 0; k < t.max; k++) { x.fillStyle = k < rk ? UIC.warm : '#30375a'; x.fillRect(X + 27 - t.max * 4 + k * 8 + 1, Y + rh - (cmp ? 5 : 7), 6, cmp ? 3 : 4); } });
      x.fillStyle = '#30375a'; for (let ri = 0; ri < n - 1; ri++) x.fillRect(X + 26, 50 + ri * rp + rh, 2, rp - rh);
    });
    const t = T(), rk = st.tal[t.id] || 0, dy = DY(), dd = dy - 166; drawWin(x, 4, dy, 168, 252 - dy, 'menu');
    Font.draw(x, t.n, 12, dy + (dd ? 1 : 3), UIC.text, UIC.textSh); Font.drawR(x, '等級 ' + rk + '/' + t.max, 164, dy + (dd ? 3 : 4), UIC.muted, UIC.textSh, 10);
    Font.wrap(t.d, 152, 11).slice(0, 2).forEach((l, i) => Font.draw(x, l, 12, dd ? dy + 15 + i * 12 : 185 + i * 13, UIC.text, UIC.textSh, 11));
    { const cy = dd ? dy + 40 : 211, cur = '目前：' + val(t, rk), ce = Font.draw(x, cur, 12, cy, UIC.accent, UIC.textSh, 10); // v21: the next-level text never runs into the current one
      if (rk < t.max) { const room = 164 - ce - 8; let nx = '下一級：' + val(t, rk + 1), z = 10; while (z > 7 && Font.width(nx, z) > room) z--; if (Font.width(nx, z) > room) { nx = '→' + val(t, rk + 1).replace(/^[^+]*/, ''); z = 10; while (z > 7 && Font.width(nx, z) > room) z--; } Font.drawR(x, nx, 164, cy + (10 - z), UIC.warm, UIC.textSh, z); } }
    Font.draw(x, locked(t) ? '需要先把「' + TALENTS.find(q => q.id === t.req).n + '」點到2級' : rk >= t.max ? '已達最高等級' : st.tp ? 'A：投入1點天賦點' : '天賦點不足（升級時獲得）', 12, dd ? 235 : 232, locked(t) ? UIC.bad : st.tp && rk < t.max ? UIC.warm : UIC.muted, UIC.textSh, 11);
    if (rk) { drawBtn(x, 124, 230, 44, 16, false); Font.drawC(x, '↩退點', 146, 230, talBlock(t) ? UIC.dis : UIC.warm, UIC.textSh, 9); touchRegion(124, 230, 44, 16, () => tapKey('select')); }
    TALENT_LINES.forEach((ln, ci) => TALENTS.filter(q => q.line === ci).forEach((q, ri) => touchRegion(4 + ci * 57, 50 + ri * RP(), 54, RH(), () => { if (c === ci && r === ri) tapKey('a'); else { c = ci; r = ri; } })));
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left')) { c = (c + 2) % 3; Sound.sfx('cursor'); } if (Input.repeat('right')) { c = (c + 1) % 3; Sound.sfx('cursor'); }
    const nR = TALENTS.filter(t => t.line === c).length; if (r >= nR) r = nR - 1; if (Input.repeat('up')) { r = (r + nR - 1) % nR; Sound.sfx('cursor'); } if (Input.repeat('down')) { r = (r + 1) % nR; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('select')) { Input.consume('select'); const t = T(), bl = talBlock(t); if (bl) { Sound.sfx('bump'); UI.remove(scr); yield* say('不能退回：' + bl + '。'); UI.push(scr); } else { st.tal[t.id]--; if (!st.tal[t.id]) delete st.tal[t.id]; st.tp = (st.tp || 0) + 1; clampHP(); Sound.sfx('cancel'); } }
    if (Input.pressed('a')) {
      Input.consume('a'); const t = T(), rk = st.tal[t.id] || 0;
      if (!st.tp || rk >= t.max || locked(t)) { Sound.sfx('bump'); continue; }
      st.tp--; st.tal[t.id] = rk + 1; clampHP(); Sound.sfx('statUp');
    }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Bestiary ---------- */
function* dexScreen() {
  const list = Object.keys(SPECIES), VIS = 7; let idx = 0, view = 0;
  const scr = { draw(x) {
    const dex = Game.st.dex || {}, seenN = list.filter(k => dex[k] && dex[k].seen).length;
    screenBG(x); headerBar(x, '魔物圖鑑'); Font.drawR(x, '收集率 ' + Math.round(seenN / list.length * 100) + '%', W - 6, 2, UIC.accent, UIC.textSh);
    drawWin(x, 4, 24, 168, VIS * 18 + 8, 'menu'); const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((k, i) => { const Y = 28 + i * 18, e = dex[k], seen = e && e.seen; if (top + i === idx) selBar(x, 6, Y - 1, 164, 17);
      const m = monsterMini(k, 16); x.drawImage(seen ? m.c : tinted(m.c, '#2a3150'), 10, Y);
      Font.draw(x, 'No.' + String(list.indexOf(k) + 1).padStart(2, '0'), 30, Y, UIC.muted, UIC.textSh); Font.draw(x, seen ? SPECIES[k].n : '？？？', 70, Y, seen ? UIC.text : UIC.dis, UIC.textSh);
      if (seen) Font.drawR(x, '擊敗 ' + (e.won || 0), 164, Y, e.won ? UIC.text : UIC.muted, UIC.textSh); });
    if (top > 0) x.drawImage(UPARROW, 86, 26); if (top + VIS < list.length) x.drawImage(DOWNARROW, 86, 24 + VIS * 18 + 3);
    drawWin(x, 4, 164, 168, 88, 'menu'); const k = list[idx], e = dex[k];
    if (e && e.seen) { const cp = typeof dexPortrait === 'function' && dexPortrait(k); if (cp) { const q = Math.min(1, 72 / cp.width, 72 / cp.height), pw = Math.round(cp.width * q), ph = Math.round(cp.height * q); x.imageSmoothingEnabled = false; x.drawImage(cp, Math.round(44 - pw / 2), 244 - ph, pw, ph); } else { const im = battleSprite(k); x.drawImage(im, 0, 0, im.width, im.height, 8, 172, 72, 72); } const sp = SPECIES[k];
      famBadge(x, sp.fam, 86, 170, 38); Font.draw(x, sp.rare ? '稀有' : sp.elite ? '精英' : sp.boss ? '頭目' : '野生', 128, 168, sp.rare ? '#ffd84a' : sp.boss ? UIC.bad : sp.elite ? UIC.warm : UIC.muted, UIC.textSh);
      if (view) { const P = MON_PANEL[k]; Font.draw(x, 'Lv' + P.lv + ' 能力', 86, 184, UIC.muted, UIC.textSh, 10); [['HP', P.hp], ['物攻', P.atk], ['物防', P.def], ['魔攻', P.spa], ['魔防', P.spd], ['速度', P.spe]].forEach(([a, b], i) => { Font.draw(x, a, 86, 197 + i * 9, UIC.muted, UIC.textSh, 9); Font.drawR(x, String(b), 164, 197 + i * 9, UIC.text, UIC.textSh, 9); }); }
      else { Font.draw(x, famLine(sp.fam), 86, 184, UIC.warm, UIC.textSh, 10); Font.wrap(sp.dex || '', 80, 11).slice(0, 3).forEach((l, i) => Font.draw(x, l, 86, 198 + i * 13, UIC.text, UIC.textSh, 11)); } Font.drawR(x, 'A：' + (view ? '介紹' : '能力'), 166, 238, UIC.accent, UIC.textSh, 9); }
    else Font.draw(x, '還沒有遇見過這種魔物。', 14, 170, UIC.muted, UIC.textSh);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); view = 1 - view; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Start menu ---------- */
function* startMenu() {
  Sound.sfx('menu'); let idx = Game.menuIdx || 0;
  while (true) {
    const r = yield* choose(['狀態', '技能', '天賦', '背包', '裝備', '圖鑑', '紀錄', '存檔', '設定', '關閉'].map(t => (t === '天賦' && Game.st.tp || t === '技能' && Game.st.skp) ? { t, r: '●', col: UIC.warm } : t), { x: W - 74, y: 4, w: 70, index: idx });
    if (r < 0 || r === 9) break; idx = r; Game.menuIdx = r;
    if (r === 0) yield* summaryScreen();
    if (r === 1) yield* skillTreeScreen();
    if (r === 2) yield* talentScreen();
    if (r === 3) { yield* bagScreen('field'); if (Game.homeWarp) break; }
    if (r === 4) yield* equipScreen();
    if (r === 5) yield* dexScreen();
    if (r === 6) yield* recordScreen();
    if (r === 7) { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } break; }
    if (r === 8) yield* optionsScreen();
  }
  if (Game.homeWarp && Game.ow) { Game.homeWarp = 0; yield* Game.ow.homeWarp(); }
}
const HOME_MAPS = ['town', 'home', 'elder', 'inn', 'shop'];
