/* ===================== UI: text boxes, menus, screens ===================== */
const UI = {
  stack: [], push(w) { this.stack.push(w); return w; }, remove(w) { const i = this.stack.indexOf(w); if (i >= 0) this.stack.splice(i, 1); },
  draw(ctx) { for (const w of this.stack) w.draw(ctx); }, clear() { this.stack = []; },
};

class TextBox {
  constructor(text, o = {}) {
    this.style = o.style || 'ow'; this.x = o.x ?? 4; this.y = o.y ?? TB_Y + 1; this.w = o.w ?? W - 8; this.h = o.h ?? TB_H - 2;
    this.pad = o.pad ?? 8; this.rows = Math.max(1, Math.floor((this.h - 10) / 16));
    this.lines = Font.wrap(text, this.w - this.pad * 2 - 2);
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
      this.scroll += 4; if (this.scroll >= 16) { this.scroll = 0; this.top++; this.li++; this.ci = 0; this.state = 'type'; }
    } else if (this.state === 'end') {
      if (this.auto) { if (++this.hold > (this.auto === true ? 40 : this.auto) || Input.pressed('a')) { Input.consume('a', 'b'); this.done = true; } }
      else if (Input.pressed('a') || Input.pressed('b')) { Input.consume('a', 'b'); Sound.sfx('cursor'); this.done = true; }
    }
  }
  draw(x) {
    drawWin(x, this.x, this.y, this.w, this.h, this.style);
    x.save(); x.beginPath(); x.rect(this.x + 4, this.y + 4, this.w - 8, this.h - 8); x.clip();
    const ty = this.y + 6;
    for (let i = this.top; i <= Math.min(this.li, this.top + this.rows); i++) {
      const row = i - this.top; const s = i < this.li ? this.lines[i] : [...this.lines[i]].slice(0, this.ci).join('');
      Font.draw(x, s, this.x + this.pad, ty + row * 16 - this.scroll, this.col, this.sh);
    }
    x.restore();
    if ((this.state === 'wait' || this.state === 'end') && !this.auto && Math.floor(this.t / 16) % 2 === 0) {
      const lastW = Font.width(this.lines[this.li]); const ay = ty + (this.li - this.top) * 16 + 5;
      x.drawImage(DOWNARROW, Math.min(this.x + this.pad + lastW + 3, this.x + this.w - 14), ay + (Math.floor(this.t / 8) % 2));
    }
  }
}

class Menu {
  constructor(items, o = {}) {
    this.items = items.map(it => typeof it === 'string' ? { t: it } : it); this.i = o.index || 0; this.cols = o.cols || 1;
    this.rowH = o.rowH || 16; this.style = o.style || 'menu'; this.cancel = o.cancel !== false; this.onMove = o.onMove; this.done = false; this.result = -1;
    const maxW = Math.max(...this.items.map(it => Font.width(it.t) + (it.r ? Font.width(it.r) + 12 : 0)));
    this.colW = o.colW || maxW + 20; this.w = o.w || this.colW * this.cols + 16; const rowsN = Math.ceil(this.items.length / this.cols);
    this.h = o.h || Math.min(rowsN, o.visible || rowsN) * this.rowH + 10; this.x = o.x ?? (W - this.w - 4); this.y = o.y ?? (TB_Y - this.h - 1); this.buttons = o.buttons; this.ox = o.ox ?? 14; this.oy = o.oy ?? 5; this.title = o.title;
    this.scrollMax = o.visible || rowsN; this.scrollTop = 0; this.drawExtra = o.drawExtra; this.noFrame = o.noFrame; this.textCol = o.textCol || '#c9cfe4'; this.textSh = o.textSh || UIC.textSh;
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
        continue;
      }
      if (on) selBar(x, this.cols === 1 ? this.x + 2 : X - 7, Y + 7 - Math.floor((this.rowH - 1) / 2), this.cols === 1 ? this.w - 4 : this.colW - 4, this.rowH - 1);
      Font.draw(x, it.t, X, Y, tc, this.textSh);
      if (it.r) Font.drawR(x, it.r, this.x + this.w - 8, Y, it.dis ? UIC.dis : UIC.muted, this.textSh);
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
    hp: 8 + L * 2 + a.vit,                          // 最大HP = 8 + 等級×2 + 體力
    atk: a.str + a.dex / 2 + L * 0.6,               // 物攻 = 力量 + 靈巧÷2 + 等級×0.6
    def: a.vit + a.agi / 3 + L * 0.6,               // 物防 = 體力 + 敏捷÷3 + 等級×0.6
    spa: a.int * 1.2 + a.dex / 3 + L * 0.6,         // 魔攻 = 智力×1.2 + 靈巧÷3 + 等級×0.6
    spd: a.int * 0.6 + a.vit * 0.6 + L * 0.6,       // 魔防 = 智力×0.6 + 體力×0.6 + 等級×0.6
    spe: a.agi * 1.5 + L * 0.6,                     // 速度 = 敏捷×1.5 + 等級×0.6
  };
  for (const k in s) s[k] = Math.floor(s[k]);
  for (const k in st.boost || {}) if (s[k] !== undefined) s[k] += st.boost[k]; // legacy saves
  for (const slot in st.equip) { const it = st.equip[slot] && ITEMS[st.equip[slot]]; if (it && it.bonus) for (const k in it.bonus) s[k] += it.bonus[k]; }
  s.crit = 3 + a.luk * 0.5;   // 會心率% = 3 + 幸運×0.5
  s.hit = a.dex * 0.5;        // 命中加成% = 靈巧×0.5
  s.eva = a.agi * 0.4;        // 迴避率% = 敏捷×0.4
  s.vs = []; s.resist = {}; s.drain = 0; s.elem = 0; s.counter = 0; // equipment affixes & talents
  for (const T of TALENTS) { const r = (st.tal || {})[T.id] || 0; if (r) for (const k in T.st) s[k] = (s[k] || 0) + T.st[k] * r; }
  for (const slot in st.equip) { const it = st.equip[slot] && ITEMS[st.equip[slot]]; const f = it && it.aff; if (!f) continue; s.crit += f.crit || 0; s.hit += f.hit || 0; s.eva += f.eva || 0; s.drain += f.drain || 0; if (f.vs) s.vs.push(f.vs); if (f.resist) s.resist[f.resist[0]] = (s.resist[f.resist[0]] || 0) + f.resist[1]; }
  return s;
}
const expForLevel = lv => Math.floor(0.8 * lv * lv * lv);
function heroLearnAt(lv) { return HERO_LEARN.filter(([l]) => l === lv).map(([, m]) => m); }

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
function gearText(it) {
  const p = Object.entries(it.bonus || {}).map(([k, v]) => STAT_NAMES[k] + '+' + v), f = it.aff || {};
  if (f.crit) p.push('會心+' + f.crit + '%'); if (f.hit) p.push('命中+' + f.hit + '%'); if (f.eva) p.push('迴避+' + f.eva + '%'); if (f.drain) p.push('吸血' + f.drain + '%');
  if (f.vs) p.push('對' + f.vs[0] + '系+' + f.vs[1] + '%'); if (f.resist) p.push(f.resist[0] + '系傷害-' + f.resist[1] + '%');
  return p.join(' ');
}
const qCol = it => it.q >= 2 ? QUALITY[it.q][1] : UIC.text;

/* ---------- Quests ---------- */
function questList(st = Game.st) {
  const f = st.flags, L = [];
  L.push({ main: 1, n: '回家的路', t: !f.license ? '去村長家問問看回家的方法。' : !f.golem ? '前往北方的古岩遺跡，尋找異界之門。' : '門的力量還不夠……繼續尋找線索。（第一章完）', done: !!f.golem });
  if (f.q1) L.push({ n: '失蹤的弟弟', t: !f.q1res ? '花店姊姊的弟弟「小麥」去晨霧道路後沒回來。' : !f.q1done ? '回萌芽鎮告訴花店的姊姊。' : f.q1res === 'home' ? '完成：勸小麥回家了。' : '完成：替小麥保守了秘密。', done: !!f.q1done });
  if (f.herb) L.push({ n: '會讓路的樹', t: f.f6 ? '完成：在迷霧森林深處找到了晨曦之劍。' : '藥草師說，迷霧森林西北角有一棵「會讓路的樹」。', done: !!f.f6 });
  if (f.wellCharm) L.push({ n: '井底的月光', t: '完成：從老井撈起了月光護符。', done: true });
  return L;
}

/* ---------- Status (summary) screen ---------- */
function eqBonus(st) { const eqB = {}; for (const slot in st.equip) { const it = st.equip[slot] && ITEMS[st.equip[slot]]; if (it && it.bonus) for (const k in it.bonus) eqB[k] = (eqB[k] || 0) + it.bonus[k]; } for (const k in st.boost || {}) eqB[k] = (eqB[k] || 0) + st.boost[k]; return eqB; }
function heroCard(x, st) {
  drawWin(x, 4, 24, 168, 70, 'menu');
  x.fillStyle = '#141a30'; x.fillRect(8, 28, 50, 62); x.fillStyle = '#1b2344'; x.fillRect(8, 76, 50, 14); x.fillStyle = 'rgba(110,231,210,0.25)'; x.fillRect(8, 76, 50, 1);
  x.drawImage(Hero.frames.down[Math.floor(Game.frame / 20) % 4], 0, 0, 16, 22, 17, 30, 32, 44);
  Font.draw(x, st.name, 64, 27, UIC.text, UIC.textSh); Font.drawR(x, 'Lv.' + st.lv, 166, 27, UIC.accent, UIC.textSh);
  if (st.status) statusBadge(x, st.status, 64, 45); else Font.draw(x, '狀態良好', 64, 42, UIC.good, UIC.textSh);
  Font.drawR(x, st.money + 'G', 166, 42, UIC.warm, UIC.textSh);
  const cur = st.exp - expForLevel(st.lv), need = expForLevel(st.lv + 1) - expForLevel(st.lv);
  Font.draw(x, '下一級', 64, 58, UIC.muted, UIC.textSh); Font.drawR(x, (need - cur) + '', 166, 58, UIC.text, UIC.textSh);
  drawExpBar(x, 64, 84, 100, cur / need);
}
function* summaryScreen() {
  let page = 0, mi = 0; const scr = { draw(x) {
    const st = Game.st, s = heroStats(); screenBG(x);
    headerBar(x, ['冒險者資料', '技能一覽', '任務'][page]);
    Font.drawR(x, '← ' + (page + 1) + '/3 →', W - 6, 2, UIC.muted, UIC.textSh);
    heroCard(x, st);
    if (page === 2) {
      drawWin(x, 4, 98, 168, 154, 'menu'); let Y = 102;
      for (const q of questList(st)) { Font.draw(x, (q.main ? '主線　' : '支線　') + q.n, 12, Y, q.done ? UIC.muted : q.main ? UIC.accent : UIC.warm, UIC.textSh); Y += 16; for (const l of Font.wrap(q.t, 150).slice(0, 3)) { Font.draw(x, l, 14, Y, q.done ? UIC.dis : UIC.text, UIC.textSh, 11); Y += 14; } Y += 6; if (Y > 236) break; }
    } else if (page === 0) {
      const a = heroAttr(st), eqB = eqBonus(st);
      drawWin(x, 4, 98, 168, 62, 'menu');
      ATTRS.forEach((k, i) => { const X = 12 + (i % 2) * 80, Y = 103 + Math.floor(i / 2) * 17; Font.draw(x, ATTR_NAMES[k], X, Y, UIC.muted, UIC.textSh); Font.drawR(x, String(a[k]), X + 70, Y, (st.boost || {})[k] ? UIC.accent : UIC.text, UIC.textSh); });
      drawWin(x, 4, 162, 168, 90, 'menu');
      const rowsD = [['HP', st.hp + '/' + s.hp], ['物攻', s.atk, 'atk'], ['物防', s.def, 'def'], ['魔攻', s.spa, 'spa'], ['魔防', s.spd, 'spd'], ['速度', s.spe, 'spe'], ['會心', s.crit.toFixed(1) + '%'], ['迴避', s.eva.toFixed(1) + '%']];
      rowsD.forEach(([n, v, k], i) => { const X = 12 + (i % 2) * 80, Y = 166 + Math.floor(i / 2) * 20; Font.draw(x, n, X, Y, UIC.muted, UIC.textSh); Font.drawR(x, String(v), X + 70, Y, k && eqB[k] ? UIC.accent : UIC.text, UIC.textSh); });
    } else {
      drawWin(x, 4, 98, 168, 84, 'menu');
      st.moves.forEach((m, i) => { const mv = MOVES[m.id]; const Y = 102 + i * 19; if (i === mi) selBar(x, 6, Y, 164, 17); typeBadge(x, mv.t, 14, Y + 2, 30); Font.draw(x, mv.n, 52, Y, UIC.text, UIC.textSh); Font.drawR(x, m.pp + '/' + mv.pp, 164, Y, m.pp === 0 ? UIC.bad : UIC.text, UIC.textSh); });
      const mv = MOVES[st.moves[mi].id]; drawWin(x, 4, 184, 168, 68, 'menu');
      Font.draw(x, (mv.cat === '變' ? '變化' : mv.cat === '物' ? '物理' : '魔法') + ' 威力' + (mv.pow || '—') + ' 命中' + (mv.acc || '—'), 12, 186, UIC.accent, UIC.textSh);
      Font.wrap(mv.d, 152).slice(0, 3).forEach((l, i) => Font.draw(x, l, 12, 202 + i * 15, UIC.text, UIC.textSh));
    }
  } };
  UI.push(scr);
  while (true) {
    if (Input.pressed('left') || Input.pressed('right')) { page = (page + (Input.pressed('left') ? 2 : 1)) % 3; Sound.sfx('cursor'); }
    if (page === 1) { if (Input.repeat('up')) { mi = (mi + Game.st.moves.length - 1) % Game.st.moves.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { mi = (mi + 1) % Game.st.moves.length; Sound.sfx('cursor'); } }
    if (Input.pressed('a') && page !== 1) { Input.consume('a'); page = (page + 1) % 3; Sound.sfx('cursor'); }
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
    Font.wrap(mv.d, 152).slice(0, 4).forEach((l, i) => Font.draw(x, l, 12, 150 + i * 15, UIC.text, UIC.textSh));
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
function bagList(filter) { const st = Game.st; return Object.keys(st.bag).filter(k => st.bag[k] > 0 && ITEMS[k] && (!filter || filter(ITEMS[k], k))).sort((a, b) => ITEM_ORDER.indexOf(a) - ITEM_ORDER.indexOf(b)); }
function* bagScreen(mode = 'field') { // returns item id used (battle) or null
  let tab = 0, idx = 0; const tabs = mode === 'battle' ? ['道具'] : ['道具', '裝備', '重要'];
  const listFor = t => bagList(it => tabs[t] === '道具' ? (!it.key && !it.equip && (mode !== 'battle' || it.use !== 'boost')) : tabs[t] === '裝備' ? !!it.equip : !!it.key);
  const VIS = 7;
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '背包'); Font.drawR(x, Game.st.money + ' G', W - 6, 2, UIC.warm, UIC.textSh);
    tabs.forEach((t, i) => { const X = 4 + i * 57; drawBtn(x, X, 23, 54, 15, i === tab); Font.drawC(x, t, X + 27, 22, i === tab ? UIC.text : UIC.muted, UIC.textSh); });
    const list = listFor(tab); drawWin(x, 4, 40, 168, VIS * 18 + 10, 'menu');
    if (!list.length) Font.draw(x, '（空空如也）', 20, 46, UIC.muted, UIC.textSh);
    const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((k, i) => { const Y = 44 + i * 18; const eq = Object.values(Game.st.equip).includes(k); if (top + i === idx) selBar(x, 6, Y - 1, 164, 17); Font.draw(x, ITEMS[k].n, 14, Y, qCol(ITEMS[k]), UIC.textSh); if (eq) Font.draw(x, 'E', 16 + Font.width(ITEMS[k].n), Y, UIC.accent, UIC.textSh); if (!ITEMS[k].key) Font.drawR(x, '×' + Game.st.bag[k], 164, Y, UIC.muted, UIC.textSh); });
    if (top > 0) x.drawImage(UPARROW, 85, 41); if (top + VIS < list.length) x.drawImage(DOWNARROW, 85, 40 + VIS * 18 + 4);
    drawWin(x, 4, 180, 168, 72, 'menu');
    if (list[idx]) { const it = ITEMS[list[idx]], ls = Font.wrap(it.d, 152).slice(0, it.aff || it.q >= 2 ? 2 : 4); ls.forEach((l, i) => Font.draw(x, l, 12, 184 + i * 16, UIC.text, UIC.textSh)); if (it.aff || it.q >= 2) Font.wrap('【' + QUALITY[it.q][0] + '】' + gearText(it), 152, 11).slice(0, 2).forEach((l, i) => Font.draw(x, l, 10, 184 + ls.length * 16 + i * 13, i ? UIC.accent : qCol(it), UIC.textSh, 11)); }
  } };
  UI.push(scr); let result = null;
  while (true) {
    const list = listFor(tab); if (idx >= list.length) idx = Math.max(0, list.length - 1);
    if (tabs.length > 1 && (Input.pressed('left') || Input.pressed('right'))) { tab = (tab + (Input.pressed('left') ? tabs.length - 1 : 1)) % tabs.length; idx = 0; Sound.sfx('cursor'); }
    if (Input.repeat('up') && list.length) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); }
    if (Input.repeat('down') && list.length) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a') && list[idx]) {
      Input.consume('a'); Sound.sfx('select'); const k = list[idx], it = ITEMS[k];
      if (it.key) { yield* say(it.use === 'phone' ? phoneText() : it.d); continue; }
      if (it.equip) { const r = yield* ask('要裝備' + it.n + '嗎？', ['裝備', '取消']); if (r === 0) { Game.st.equip[it.equip] = k; clampHP(); Sound.sfx('item'); yield* say(Game.st.name + '裝備了' + it.n + '！'); } continue; }
      const r = yield* ask('要使用' + it.n + '嗎？', ['使用', '取消']);
      if (r !== 0) continue;
      if (mode === 'battle') { if (it.use === 'escape' || canUseItem(k)) { result = k; break; } yield* say('現在使用也沒有效果。'); continue; }
      if (it.use === 'escape') { yield* say('現在不能使用。'); continue; }
      const msg = useItem(k); if (!msg) { yield* say('現在使用也沒有效果。'); continue; }
      Sound.sfx(it.use === 'heal' ? 'heal' : 'item'); yield* say(msg);
    }
    yield;
  }
  UI.remove(scr); return result;
}
function phoneText() { const st = Game.st; const pct = Math.max(1, 12 - Math.floor((st.steps || 0) / 400)); return '從原本的世界帶來的手機。\n電量剩下' + pct + '%……還是完全沒有訊號。\n桌布是家附近的那條街。'; }
function clampHP() { const s = heroStats(); Game.st.hp = Math.min(Game.st.hp, s.hp); }
function canUseItem(k) {
  const it = ITEMS[k], st = Game.st, s = heroStats();
  if (it.use === 'heal') return st.hp < s.hp && st.hp > 0;
  if (it.use === 'cure') return st.status === it.v;
  if (it.use === 'pp') return st.moves.some(m => m.pp < MOVES[m.id].pp);
  if (it.use === 'boost') return true;
  return false;
}
function useItem(k) { // returns message or null; applies to Game.st
  if (!canUseItem(k)) return null; const it = ITEMS[k], st = Game.st, s = heroStats(); st.bag[k]--;
  if (it.use === 'heal') { const b = st.hp; st.hp = Math.min(s.hp, st.hp + it.v); return st.name + '的HP恢復了' + (st.hp - b) + '點！'; }
  if (it.use === 'cure') { st.status = null; return st.name + '的' + { psn: '中毒', par: '麻痺', slp: '睡眠', brn: '灼傷' }[it.v] + '治好了！'; }
  if (it.use === 'pp') { st.moves.forEach(m => m.pp = Math.min(MOVES[m.id].pp, m.pp + it.v)); return st.name + '的技能PP恢復了！'; }
  if (it.use === 'boost') { st.boost = st.boost || {}; for (const q in it.v) st.boost[q] = (st.boost[q] || 0) + it.v[q]; return st.name + '的' + Object.keys(it.v).map(q => ATTR_NAMES[q] || STAT_NAMES[q]).join('、') + '永久提升了！'; }
  return null;
}

/* ---------- Equipment ---------- */
function* equipScreen() {
  let idx = 0; const slots = Object.keys(EQUIP_SLOTS);
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '裝備');
    drawWin(x, 4, 24, 168, 116, 'menu');
    slots.forEach((sl, i) => { const Y = 28 + i * 36; if (i === idx) selBar(x, 6, Y, 164, 34); Font.draw(x, EQUIP_SLOTS[sl], 14, Y, UIC.accent, UIC.textSh); const it = Game.st.equip[sl] && ITEMS[Game.st.equip[sl]]; Font.draw(x, it ? it.n : '——', 60, Y, it ? qCol(it) : UIC.text, UIC.textSh); if (it) Font.drawR(x, gearText(it), 164, Y + 16, UIC.muted, UIC.textSh, 10); });
    const s = heroStats(); drawWin(x, 4, 144, 168, 108, 'menu');
    [['HP', Game.st.hp + '/' + s.hp], ['物攻', s.atk], ['物防', s.def], ['魔攻', s.spa], ['魔防', s.spd], ['速度', s.spe]].forEach(([a, b], i) => { const Y = 148 + i * 16; Font.draw(x, a, 14, Y, UIC.muted, UIC.textSh); Font.drawR(x, String(b), 150, Y, UIC.text, UIC.textSh); });
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + 2) % 3; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % 3; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) {
      Input.consume('a'); Sound.sfx('select'); const sl = slots[idx];
      const own = bagList(it => it.equip === sl);
      const opts = own.map(k => ({ t: ITEMS[k].n + (Game.st.equip[sl] === k ? '[E]' : ''), k, col: qCol(ITEMS[k]) })).concat([{ t: '卸下', k: null }]);
      const r = yield* choose(opts, { x: 60, y: 40 + idx * 36, w: 112 });
      if (r >= 0) { Game.st.equip[sl] = opts[r].k; clampHP(); Sound.sfx('item'); }
    }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Options ---------- */
function* optionsScreen() {
  let idx = 0; const labels = ['文字速度', '背景音樂', '音效', '關閉'];
  const val = i => i === 0 ? ['慢', '普通', '快'][Game.settings.text] : i === 1 ? (Game.settings.music ? '開' : '關') : i === 2 ? (Game.settings.sfx ? '開' : '關') : '';
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '設定');
    drawWin(x, 4, 30, 168, 84, 'menu');
    labels.forEach((l, i) => { const Y = 36 + i * 18; if (i === idx) selBar(x, 6, Y - 1, 164, 17); Font.draw(x, l, 14, Y, UIC.text, UIC.textSh); if (i < 3) Font.drawR(x, '← ' + val(i) + ' →', 164, Y, UIC.accent, UIC.textSh); });
    drawWin(x, 4, 118, 168, 52, 'menu'); Font.draw(x, '← → 切換設定', 14, 124, UIC.muted, UIC.textSh); Font.draw(x, 'B 鍵返回', 14, 140, UIC.muted, UIC.textSh);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + 3) % 4; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % 4; Sound.sfx('cursor'); }
    let d = Input.pressed('left') ? -1 : Input.pressed('right') ? 1 : 0;
    if (!d && Input.pressed('a') && idx < 3) { Input.consume('a'); d = 1; if (idx === 0 && Game.settings.text === 2) d = -2; }
    if (d) { if (idx === 0) Game.settings.text = clamp(Game.settings.text + d, 0, 2); if (idx === 1) Game.settings.music = !Game.settings.music; if (idx === 2) Game.settings.sfx = !Game.settings.sfx; Sound.applySettings(); Sound.sfx('cursor'); saveSettings(); }
    if (Input.pressed('b') || (Input.pressed('a') && idx === 3)) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Shop ---------- */
function moneyWin(x) { drawWin(x, 2, 2, 86, 30, 'menu'); Font.draw(x, '金錢', 10, 3, UIC.muted, UIC.textSh); Font.drawR(x, Game.st.money + ' G', 80, 15, UIC.warm, UIC.textSh); }
function* shopFlow() {
  const mw = { draw: moneyWin }; UI.push(mw);
  if (Game.st.flags.croc && !Game.st.flags.shopNew) { Game.st.flags.shopNew = 1; yield* say('橋通了之後，王都的商人送來了新貨！騎士長劍和鎖子甲，要看看嗎？'); }
  while (true) {
    const r = yield* ask('歡迎光臨！請問需要什麼呢？', ['購買', '賣出', '離開']);
    if (r === 0) yield* shopBuy(); else if (r === 1) yield* shopSell(); else break;
  }
  UI.remove(mw); yield* say('謝謝惠顧！歡迎再來！');
}
function* shopBuy() {
  let idx = 0; const list = shopList(); const VIS = 8;
  const scr = { draw(x) {
    drawWin(x, 4, 36, 168, VIS * 18 + 10, 'menu');
    const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((k, i) => { const Y = 40 + i * 18; const it = ITEMS[k]; if (top + i === idx) selBar(x, 6, Y - 1, 164, 17); Font.draw(x, it.n, 14, Y, UIC.text, UIC.textSh); Font.drawR(x, it.price + 'G', 164, Y, UIC.warm, UIC.textSh); });
    if (top > 0) x.drawImage(UPARROW, 85, 37); if (top + VIS < list.length) x.drawImage(DOWNARROW, 85, 36 + VIS * 18 + 4);
    drawWin(x, 4, TB_Y + 1, W - 8, TB_H - 2, 'ow'); const it = ITEMS[list[idx]];
    Font.wrap(it.d + (it.equip ? '' : '（持有' + (Game.st.bag[list[idx]] || 0) + '）'), 150).slice(0, 3).forEach((l, i) => Font.draw(x, l, 12, TB_Y + 7 + i * 16, UIC.text, UIC.textSh));
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) {
      Input.consume('a'); Sound.sfx('select'); const k = list[idx], it = ITEMS[k];
      let qty = 1; const maxQ = Math.min(it.equip ? 1 : 99, Math.floor(Game.st.money / it.price));
      if (it.equip && (Game.st.bag[k] || Object.values(Game.st.equip).includes(k))) { UI.remove(scr); yield* say('你已經有' + it.n + '了。'); UI.push(scr); continue; }
      if (maxQ < 1) { UI.remove(scr); yield* say('錢不夠喔。'); UI.push(scr); continue; }
      if (!it.equip) {
        const q = { draw(x) { drawWin(x, 80, TB_Y - 32, 94, 30, 'menu'); Font.draw(x, '×' + String(qty).padStart(2, '0'), 90, TB_Y - 25, UIC.text, UIC.textSh); Font.drawR(x, (qty * it.price) + 'G', 166, TB_Y - 25, UIC.warm, UIC.textSh); } };
        UI.push(q); let ok = false;
        while (true) { if (Input.repeat('up')) { qty = qty >= maxQ ? 1 : qty + 1; Sound.sfx('cursor'); } if (Input.repeat('down')) { qty = qty <= 1 ? maxQ : qty - 1; Sound.sfx('cursor'); } if (Input.repeat('right')) { qty = Math.min(maxQ, qty + 10); Sound.sfx('cursor'); } if (Input.repeat('left')) { qty = Math.max(1, qty - 10); Sound.sfx('cursor'); } if (Input.pressed('a')) { Input.consume('a'); ok = true; break; } if (Input.pressed('b')) { Input.consume('b'); break; } yield; }
        UI.remove(q); if (!ok) continue;
      }
      UI.remove(scr);
      const yes = yield* yesNo(it.n + (it.equip ? '' : '×' + qty) + '，一共是' + (qty * it.price) + 'G，可以嗎？');
      if (yes) { Game.st.money -= qty * it.price; Game.st.bag[k] = (Game.st.bag[k] || 0) + qty; Sound.sfx('save'); yield* say('好的！這是您的' + it.n + '。' + (it.equip ? '記得到背包或裝備畫面裝備喔！' : '')); }
      UI.push(scr);
    }
    yield;
  }
  UI.remove(scr);
}
function* shopSell() {
  let idx = 0; const VIS = 8;
  const listNow = () => bagList(it => !it.key && !(it.price === 0 && !it.sell)).filter(k => !Object.values(Game.st.equip).includes(k) || Game.st.bag[k] > 1);
  const scr = { draw(x) {
    const list = listNow(); drawWin(x, 4, 36, 168, VIS * 18 + 10, 'menu');
    if (!list.length) Font.draw(x, '沒有可以賣的東西', 14, 42, UIC.muted, UIC.textSh);
    const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((k, i) => { const Y = 40 + i * 18; const it = ITEMS[k]; if (top + i === idx) selBar(x, 6, Y - 1, 164, 17); Font.draw(x, it.n + '×' + Game.st.bag[k], 14, Y, UIC.text, UIC.textSh); Font.drawR(x, sellPrice(k) + 'G', 164, Y, UIC.warm, UIC.textSh); });
    drawWin(x, 4, TB_Y + 1, W - 8, TB_H - 2, 'ow'); Font.draw(x, list.length ? '要賣哪一樣東西呢？' : '目前沒有可以賣的東西。', 12, TB_Y + 7, UIC.text, UIC.textSh); Font.draw(x, '（裝備中的物品不能賣）', 12, TB_Y + 23, UIC.muted, UIC.textSh);
  } };
  UI.push(scr);
  while (true) {
    const list = listNow(); if (idx >= list.length) idx = Math.max(0, list.length - 1);
    if (Input.repeat('up') && list.length) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down') && list.length) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a') && list[idx]) {
      Input.consume('a'); const k = list[idx]; UI.remove(scr);
      const yes = yield* yesNo(ITEMS[k].n + '可以用' + sellPrice(k) + 'G收購，要賣嗎？');
      if (yes) { Game.st.bag[k]--; Game.st.money += sellPrice(k); Sound.sfx('save'); yield* say('謝謝！收下了' + ITEMS[k].n + '。'); }
      UI.push(scr);
    }
    yield;
  }
  UI.remove(scr);
}
const sellPrice = k => ITEMS[k].sell ?? Math.floor(ITEMS[k].price / 2);

/* ---------- Talents ---------- */
function* talentScreen() {
  const st = Game.st; st.tal = st.tal || {}; let c = 0, r = 0;
  const T = () => TALENTS.filter(t => t.line === c)[r];
  const locked = t => t.req && (st.tal[t.req] || 0) < 2;
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '天賦'); Font.drawR(x, '天賦點 ' + (st.tp || 0), W - 6, 2, st.tp ? UIC.warm : UIC.muted, UIC.textSh);
    TALENT_LINES.forEach((ln, ci) => {
      const X = 4 + ci * 57; Font.drawC(x, ln, X + 27, 24, UIC.accent, UIC.textSh);
      TALENTS.filter(t => t.line === ci).forEach((t, ri) => { const Y = 42 + ri * 40, rk = st.tal[t.id] || 0, on = ci === c && ri === r, lk = locked(t);
        drawBtn(x, X, Y, 54, 36, on); Font.drawC(x, t.n, X + 27, Y + 2, lk ? UIC.dis : rk ? UIC.text : '#c9cfe4', UIC.textSh, 11);
        for (let k = 0; k < t.max; k++) { x.fillStyle = k < rk ? UIC.warm : '#30375a'; x.fillRect(X + 27 - t.max * 4 + k * 8 + 1, Y + 24, 6, 5); } });
      if (ci < 2) { x.fillStyle = '#30375a'; for (let ri = 0; ri < 2; ri++) x.fillRect(X + 26, 78 + ri * 40, 2, 4); }
    });
    const t = T(), rk = st.tal[t.id] || 0; drawWin(x, 4, 164, 168, 88, 'menu');
    Font.draw(x, t.n + '　' + rk + '/' + t.max, 12, 168, UIC.text, UIC.textSh);
    Font.wrap(t.d, 152, 11).slice(0, 3).forEach((l, i) => Font.draw(x, l, 12, 186 + i * 14, UIC.accent, UIC.textSh, 11));
    Font.draw(x, locked(t) ? '需要「' + TALENTS.find(q => q.id === t.req).n + '」2級' : rk >= t.max ? '已達最高等級' : st.tp ? 'A：投入1點天賦點' : '升級時可以獲得天賦點', 12, 232, locked(t) ? UIC.bad : UIC.muted, UIC.textSh, 11);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left')) { c = (c + 2) % 3; Sound.sfx('cursor'); } if (Input.repeat('right')) { c = (c + 1) % 3; Sound.sfx('cursor'); }
    if (Input.repeat('up')) { r = (r + 2) % 3; Sound.sfx('cursor'); } if (Input.repeat('down')) { r = (r + 1) % 3; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) {
      Input.consume('a'); const t = T(), rk = st.tal[t.id] || 0;
      if (!st.tp || rk >= t.max || locked(t)) { Sound.sfx('bump'); continue; }
      if (t.move && !st.moves.some(m => m.id === t.move)) {
        if (st.moves.length < 4) st.moves.push({ id: t.move, pp: MOVES[t.move].pp });
        else { UI.remove(scr); const i = yield* pickMoveToForget(t.move); UI.push(scr); if (i >= 4) continue; st.moves[i] = { id: t.move, pp: MOVES[t.move].pp }; }
      }
      st.tp--; st.tal[t.id] = rk + 1; clampHP(); Sound.sfx('statUp');
    }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Bestiary ---------- */
function* dexScreen() {
  const list = Object.keys(SPECIES), VIS = 7; let idx = 0;
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
    if (e && e.seen) { const im = battleSprite(k); x.drawImage(im, 0, 0, im.width, im.height, 8, 172, 72, 72); const sp = SPECIES[k];
      typeBadge(x, sp.t, 86, 170, 28); Font.draw(x, sp.elite ? '精英' : sp.boss ? '頭目' : '野生', 120, 168, sp.boss ? UIC.bad : sp.elite ? UIC.warm : UIC.muted, UIC.textSh);
      Font.wrap(sp.dex || '', 80).slice(0, 4).forEach((l, i) => Font.draw(x, l, 86, 186 + i * 15, UIC.text, UIC.textSh)); }
    else Font.draw(x, '還沒有遇見過這種魔物。', 14, 170, UIC.muted, UIC.textSh);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Start menu ---------- */
function* startMenu() {
  Sound.sfx('menu'); let idx = Game.menuIdx || 0;
  while (true) {
    const r = yield* choose(['狀態', '天賦', '背包', '裝備', '圖鑑', '存檔', '設定', '關閉'].map(t => t === '天賦' && Game.st.tp ? { t, r: '●', col: UIC.warm } : t), { x: W - 74, y: 4, w: 70, index: idx });
    if (r < 0 || r === 7) break; idx = r; Game.menuIdx = r;
    if (r === 0) yield* summaryScreen();
    if (r === 1) yield* talentScreen();
    if (r === 2) yield* bagScreen('field');
    if (r === 3) yield* equipScreen();
    if (r === 4) yield* dexScreen();
    if (r === 5) { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } break; }
    if (r === 6) yield* optionsScreen();
  }
}
