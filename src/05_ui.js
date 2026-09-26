/* ===================== UI: text boxes, menus, screens ===================== */
const UI = {
  stack: [], push(w) { this.stack.push(w); return w; }, remove(w) { const i = this.stack.indexOf(w); if (i >= 0) this.stack.splice(i, 1); },
  draw(ctx) { for (const w of this.stack) w.draw(ctx); }, clear() { this.stack = []; },
};

class TextBox {
  constructor(text, o = {}) {
    this.style = o.style || 'ow'; this.x = o.x ?? 0; this.y = o.y ?? 112; this.w = o.w ?? 240; this.h = o.h ?? 48;
    this.pad = this.style === 'battle' ? 10 : 12;
    this.lines = Font.wrap(text, this.w - this.pad * 2 - 4);
    this.li = 0; this.ci = 0; this.top = 0; this.scroll = 0; this.state = 'type'; this.t = 0; this.hold = 0;
    this.auto = o.auto; this.keep = o.keep; this.done = false; this.instant = o.instant;
    this.col = this.style === 'battle' || this.style === 'dark' ? UIC.white : UIC.text; this.sh = this.style === 'battle' || this.style === 'dark' ? UIC.whiteSh : UIC.textSh;
    if (this.instant) { this.li = Math.min(1, this.lines.length - 1); this.ci = [...this.lines[this.li]].length; this.state = this.lines.length > 2 ? 'wait' : 'end'; if (this.lines.length <= 2) this.finishLine(); }
  }
  speed() { const base = [0.5, 1, 2][Game.settings.text] || 1; return (Input.held('a') || Input.held('b')) ? Math.max(4, base) : base; }
  finishLine() {
    if (this.li + 1 < this.lines.length) { if (this.li - this.top >= 1) this.state = 'wait'; else { this.li++; this.ci = 0; this.state = 'type'; } }
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
    const ty = this.y + (this.style === 'battle' ? 7 : 7);
    for (let i = this.top; i <= Math.min(this.li, this.top + 2); i++) {
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
    this.colW = o.colW || maxW + 18; this.w = o.w || this.colW * this.cols + 14; const rowsN = Math.ceil(this.items.length / this.cols);
    this.h = o.h || rowsN * this.rowH + 12; this.x = o.x ?? (240 - this.w - 2); this.y = o.y ?? (112 - this.h - 2);
    this.scrollMax = o.visible || rowsN; this.scrollTop = 0; this.drawExtra = o.drawExtra; this.noFrame = o.noFrame; this.textCol = o.textCol || UIC.text; this.textSh = o.textSh || UIC.textSh;
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
    const n = this.items.length;
    for (let k = 0; k < n; k++) {
      const r = Math.floor(k / this.cols) - this.scrollTop, c = k % this.cols; if (r < 0 || r >= this.scrollMax) continue;
      const X = this.x + 14 + c * this.colW, Y = this.y + 5 + r * this.rowH; const it = this.items[k];
      Font.draw(x, it.t, X, Y, it.dis ? '#a0a0a8' : (it.col || this.textCol), this.textSh);
      if (it.r) Font.drawR(x, it.r, this.x + this.w - 10, Y, it.dis ? '#a0a0a8' : this.textCol, this.textSh);
      if (k === this.i) x.drawImage(this.style === 'dark' ? CURSOR_W : CURSOR, X - 9, Y + 3);
    }
    if (this.scrollTop > 0) x.drawImage(UPARROW, this.x + this.w / 2 - 3, this.y + 1);
    if (this.scrollTop + this.scrollMax < Math.ceil(n / this.cols)) x.drawImage(DOWNARROW, this.x + this.w / 2 - 3, this.y + this.h - 6);
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
function heroStats(st = Game.st) {
  const s = {}; STAT_KEYS.forEach((k, i) => s[k] = statCalc(HERO_BASE[i], st.lv, 15, k === 'hp'));
  for (const k in st.boost || {}) s[k] += st.boost[k];
  for (const slot in st.equip) { const it = st.equip[slot] && ITEMS[st.equip[slot]]; if (it && it.bonus) for (const k in it.bonus) s[k] += it.bonus[k]; }
  return s;
}
const expForLevel = lv => Math.floor(0.8 * lv * lv * lv);
function heroLearnAt(lv) { return HERO_LEARN.filter(([l]) => l === lv).map(([, m]) => m); }

/* ---------- Screen: background pattern ---------- */
function screenBG(x, c1 = '#a8d0e8', c2 = '#98c0d8') {
  x.fillStyle = c1; x.fillRect(0, 0, W, H); x.fillStyle = c2;
  for (let y = 0; y < H; y += 8) for (let i = (y / 8) % 2 ? 4 : 0; i < W; i += 8) x.fillRect(i, y, 4, 4);
}
function headerBar(x, title, col = '#e86868') {
  x.fillStyle = shade(col, -0.35); x.fillRect(0, 0, W, 20); x.fillStyle = col; x.fillRect(0, 0, W, 18); x.fillStyle = shade(col, 0.3); x.fillRect(0, 0, W, 2);
  Font.draw(x, title, 8, 2, '#ffffff', shade(col, -0.45));
}

/* ---------- Status (summary) screen ---------- */
function* summaryScreen() {
  let page = 0, mi = 0; const scr = { draw(x) {
    const st = Game.st, s = heroStats(); screenBG(x, '#f0d8a0', '#e8cc90');
    headerBar(x, page === 0 ? '冒險者資料' : '技能一覽', page === 0 ? '#d86848' : '#4878c8');
    Font.drawR(x, (page + 1) + '/2  ←→', 232, 2, '#ffffff', '#8a3a28');
    // portrait panel
    drawWin(x, 4, 24, 76, 132, 'menu');
    x.fillStyle = '#b8e0a8'; x.fillRect(8, 28, 68, 64); x.fillStyle = '#a0d090'; x.fillRect(8, 76, 68, 16);
    x.drawImage(Hero.frames.down[Math.floor(Game.frame / 20) % 4], 0, 0, 16, 22, 26, 30, 32, 44);
    Font.drawC(x, st.name, 42, 94, UIC.text, UIC.textSh); Font.drawC(x, 'Lv.' + st.lv, 42, 110, UIC.text, UIC.textSh);
    if (st.status) statusBadge(x, st.status, 34, 128); else Font.drawC(x, '狀態良好', 42, 126, '#58a058', UIC.textSh);
    if (page === 0) {
      drawWin(x, 84, 24, 152, 132, 'menu');
      const rowsS = [['HP', st.hp + '/' + s.hp], ['攻擊', s.atk], ['防禦', s.def], ['特攻', s.spa], ['特防', s.spd], ['速度', s.spe]];
      rowsS.forEach(([a, b], i) => { const Y = 28 + i * 15; Font.draw(x, a, 94, Y, UIC.text, UIC.textSh); Font.drawR(x, String(b), 172, Y, UIC.text, UIC.textSh); });
      const eqB = {}; for (const slot in st.equip) { const it = st.equip[slot] && ITEMS[st.equip[slot]]; if (it && it.bonus) for (const k in it.bonus) eqB[k] = (eqB[k] || 0) + it.bonus[k]; }
      for (const k in st.boost || {}) eqB[k] = (eqB[k] || 0) + st.boost[k];
      ['atk', 'def', 'spa', 'spd', 'spe'].forEach((k, i) => { if (eqB[k]) Font.draw(x, '(+' + eqB[k] + ')', 176, 28 + (i + 1) * 15, '#4878c8', UIC.textSh); });
      drawHPBar(x, 94, 124, 60, st.hp / s.hp);
      const cur = st.exp - expForLevel(st.lv), need = expForLevel(st.lv + 1) - expForLevel(st.lv);
      Font.draw(x, '下一級', 94, 132, UIC.text, UIC.textSh); Font.drawR(x, (need - cur) + '', 228, 132, UIC.text, UIC.textSh);
      drawExpBar(x, 94, 148, 132, cur / need);
    } else {
      drawWin(x, 84, 24, 152, 80, 'menu');
      st.moves.forEach((m, i) => { const mv = MOVES[m.id]; const Y = 28 + i * 18; typeBadge(x, mv.t, 90, Y + 2, 28); Font.draw(x, mv.n, 124, Y, UIC.text, UIC.textSh); Font.drawR(x, m.pp + '/' + mv.pp, 230, Y, m.pp === 0 ? '#e04848' : UIC.text, UIC.textSh); if (i === mi) x.drawImage(CURSOR, 86, Y + 5); });
      const mv = MOVES[st.moves[mi].id]; drawWin(x, 84, 106, 152, 50, 'menu');
      Font.draw(x, (mv.cat === '變' ? '變化' : mv.cat === '物' ? '物理' : '特殊') + '  威力 ' + (mv.pow || '—') + '  命中 ' + (mv.acc || '—'), 92, 108, '#4878c8', UIC.textSh);
      const dl = Font.wrap(mv.d, 136); dl.slice(0, 2).forEach((l, i) => Font.draw(x, l, 92, 123 + i * 14, UIC.text, UIC.textSh));
    }
  } };
  UI.push(scr);
  while (true) {
    if (Input.pressed('left') || Input.pressed('right')) { page = 1 - page; Sound.sfx('cursor'); }
    if (page === 1) { if (Input.repeat('up')) { mi = (mi + Game.st.moves.length - 1) % Game.st.moves.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { mi = (mi + 1) % Game.st.moves.length; Sound.sfx('cursor'); } }
    if (Input.pressed('b') || (Input.pressed('a') && page === 0)) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Move picker (forget move) ---------- */
function* pickMoveToForget(newId) {
  let mi = 0; const list = [...Game.st.moves.map(m => m.id), newId];
  const scr = { draw(x) {
    screenBG(x, '#c8d8f0', '#b8c8e8'); headerBar(x, '要忘記哪個技能？', '#4878c8');
    drawWin(x, 4, 24, 232, 96, 'menu');
    list.forEach((id, i) => { const mv = MOVES[id]; const Y = 28 + i * 17; typeBadge(x, mv.t, 16, Y + 2, 28); Font.draw(x, mv.n + (i === 4 ? '（新）' : ''), 50, Y, i === 4 ? '#4878c8' : UIC.text, UIC.textSh); Font.drawR(x, '威力 ' + (mv.pow || '—') + '  PP ' + mv.pp, 226, Y, UIC.text, UIC.textSh); if (i === mi) x.drawImage(CURSOR, 7, Y + 5); });
    const mv = MOVES[list[mi]]; drawWin(x, 4, 122, 232, 36, 'menu'); Font.wrap(mv.d, 212).slice(0, 2).forEach((l, i) => Font.draw(x, l, 12, 124 + i * 14, UIC.text, UIC.textSh));
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
  let tab = 0, idx = 0; const tabs = mode === 'battle' ? ['道具'] : ['道具', '裝備', '重要物品'];
  const listFor = t => bagList(it => tabs[t] === '道具' ? (!it.key && !it.equip && (mode !== 'battle' || it.use !== 'boost')) : tabs[t] === '裝備' ? !!it.equip : !!it.key);
  const scr = { draw(x) {
    screenBG(x, '#f0c890', '#e8bc80'); headerBar(x, '背包', '#c87838');
    tabs.forEach((t, i) => { const X = 60 + i * 56; roundRect(x, X, 3, 50, 14, i === tab ? '#fff4d8' : '#a86028'); Font.drawC(x, t, X + 25, 2, i === tab ? UIC.text : '#f8e0c0', i === tab ? UIC.textSh : '#6a3818'); });
    // bag icon
    x.drawImage(MINI_ICONS.bag, 0, 0, 8, 8, 14, 40, 48, 48);
    Font.drawC(x, Game.st.money + ' G', 38, 96, UIC.text, UIC.textSh);
    const list = listFor(tab); drawWin(x, 84, 22, 152, 96, 'menu');
    if (!list.length) Font.draw(x, '（空空如也）', 100, 28, '#909098', UIC.textSh);
    const top = Math.max(0, Math.min(idx - 2, list.length - 5));
    list.slice(top, top + 5).forEach((k, i) => { const Y = 26 + i * 17; const eq = Object.values(Game.st.equip).includes(k); Font.draw(x, ITEMS[k].n + (eq ? ' [E]' : ''), 98, Y, UIC.text, UIC.textSh); if (!ITEMS[k].key) Font.drawR(x, '×' + Game.st.bag[k], 228, Y, UIC.text, UIC.textSh); if (top + i === idx) x.drawImage(CURSOR, 90, Y + 3); });
    drawWin(x, 4, 120, 232, 38, 'menu');
    if (list[idx]) Font.wrap(ITEMS[list[idx]].d, 212).slice(0, 2).forEach((l, i) => Font.draw(x, l, 12, 122 + i * 15, UIC.text, UIC.textSh));
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
      if (it.key) { yield* say(it.d); continue; }
      if (it.equip) { const r = yield* ask('要裝備' + it.n + '嗎？', ['裝備', '取消'], { mx: 176, my: 70 }); if (r === 0) { Game.st.equip[it.equip] = k; clampHP(); Sound.sfx('item'); yield* say(Game.st.name + '裝備了' + it.n + '！'); } continue; }
      const r = yield* ask('要使用' + it.n + '嗎？', ['使用', '取消'], { mx: 176, my: 70 });
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
  if (it.use === 'boost') { st.boost = st.boost || {}; for (const q in it.v) st.boost[q] = (st.boost[q] || 0) + it.v[q]; return st.name + '的' + Object.keys(it.v).map(q => STAT_NAMES[q]).join('、') + '永久提升了！'; }
  return null;
}

/* ---------- Equipment ---------- */
function* equipScreen() {
  let idx = 0; const slots = Object.keys(EQUIP_SLOTS);
  const scr = { draw(x) {
    screenBG(x, '#c8e0c0', '#b8d4b0'); headerBar(x, '裝備', '#58a068');
    drawWin(x, 4, 22, 232, 64, 'menu');
    slots.forEach((sl, i) => { const Y = 26 + i * 18; Font.draw(x, EQUIP_SLOTS[sl], 20, Y, '#58a068', UIC.textSh); const it = Game.st.equip[sl] && ITEMS[Game.st.equip[sl]]; Font.draw(x, it ? it.n : '——', 64, Y, UIC.text, UIC.textSh); if (it) Font.drawR(x, Object.entries(it.bonus).map(([k, v]) => STAT_NAMES[k] + '+' + v).join(' '), 228, Y, '#4878c8', UIC.textSh); if (i === idx) x.drawImage(CURSOR, 10, Y + 3); });
    const s = heroStats(); drawWin(x, 4, 88, 232, 70, 'menu');
    [['攻擊', s.atk], ['防禦', s.def], ['特攻', s.spa], ['特防', s.spd], ['速度', s.spe], ['HP', Game.st.hp + '/' + s.hp]].forEach(([a, b], i) => { const X = 16 + (i % 2) * 112, Y = 92 + Math.floor(i / 2) * 20; Font.draw(x, a, X, Y, UIC.text, UIC.textSh); Font.drawR(x, String(b), X + 96, Y, UIC.text, UIC.textSh); });
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + 2) % 3; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % 3; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) {
      Input.consume('a'); Sound.sfx('select'); const sl = slots[idx];
      const own = bagList(it => it.equip === sl);
      const opts = own.map(k => ({ t: ITEMS[k].n + (Game.st.equip[sl] === k ? ' [E]' : ''), k })).concat([{ t: '卸下', k: null }]);
      const r = yield* choose(opts, { x: 120, y: 24 + idx * 18, w: 112 });
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
    screenBG(x, '#d8d0f0', '#ccc4e8'); headerBar(x, '設定', '#7868b8');
    drawWin(x, 16, 30, 208, 84, 'menu');
    labels.forEach((l, i) => { const Y = 36 + i * 18; Font.draw(x, l, 34, Y, UIC.text, UIC.textSh); if (i < 3) Font.drawR(x, '← ' + val(i) + ' →', 212, Y, '#e05050', UIC.textSh); if (i === idx) x.drawImage(CURSOR, 22, Y + 3); });
    drawWin(x, 16, 118, 208, 36, 'menu'); Font.draw(x, '左右鍵切換設定，B鍵返回。', 26, 126, UIC.text, UIC.textSh);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + 3) % 4; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % 4; Sound.sfx('cursor'); }
    const d = Input.pressed('left') ? -1 : Input.pressed('right') ? 1 : 0;
    if (d) { if (idx === 0) Game.settings.text = clamp(Game.settings.text + d, 0, 2); if (idx === 1) Game.settings.music = !Game.settings.music; if (idx === 2) Game.settings.sfx = !Game.settings.sfx; Sound.applySettings(); Sound.sfx('cursor'); saveSettings(); }
    if (Input.pressed('b') || (Input.pressed('a') && idx === 3)) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}

/* ---------- Shop ---------- */
function moneyWin(x) { drawWin(x, 2, 2, 90, 30, 'menu'); Font.draw(x, '金錢', 10, 3, '#4878c8', UIC.textSh); Font.drawR(x, Game.st.money + ' G', 84, 15, UIC.text, UIC.textSh); }
function* shopFlow() {
  const mw = { draw: moneyWin }; UI.push(mw);
  while (true) {
    const r = yield* ask('歡迎光臨！請問需要什麼呢？', ['購買', '賣出', '離開'], { mx: 170, my: 50 });
    if (r === 0) yield* shopBuy(); else if (r === 1) yield* shopSell(); else break;
  }
  UI.remove(mw); yield* say('謝謝惠顧！歡迎再來！');
}
function* shopBuy() {
  let idx = 0; const list = SHOP_LIST;
  const scr = { draw(x) {
    drawWin(x, 96, 2, 142, 110, 'menu');
    const top = Math.max(0, Math.min(idx - 3, list.length - 6));
    list.slice(top, top + 6).forEach((k, i) => { const Y = 6 + i * 17; const it = ITEMS[k]; const owned = Game.st.bag[k] || 0; Font.draw(x, it.n, 110, Y, UIC.text, UIC.textSh); Font.drawR(x, it.price + 'G', 232, Y, UIC.text, UIC.textSh); if (top + i === idx) x.drawImage(CURSOR, 102, Y + 3); });
    if (top > 0) x.drawImage(DOWNARROW, 164, 2);
    drawWin(x, 0, 112, 240, 48, 'ow'); const it = ITEMS[list[idx]];
    Font.wrap(it.d + (it.equip ? '' : '（持有：' + (Game.st.bag[list[idx]] || 0) + '）'), 212).slice(0, 2).forEach((l, i) => Font.draw(x, l, 12, 119 + i * 16, UIC.text, UIC.textSh));
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) {
      Input.consume('a'); Sound.sfx('select'); const k = list[idx], it = ITEMS[k];
      let qty = 1; const maxQ = Math.min(it.equip ? 1 : 99, Math.floor(Game.st.money / it.price));
      if (maxQ < 1) { UI.remove(scr); yield* say('錢不夠喔。'); UI.push(scr); continue; }
      if (it.equip && (Game.st.bag[k] || Object.values(Game.st.equip).includes(k))) { UI.remove(scr); yield* say('你已經有' + it.n + '了。'); UI.push(scr); continue; }
      if (!it.equip) {
        const q = { draw(x) { drawWin(x, 140, 112 - 30, 98, 28, 'menu'); Font.draw(x, '×' + String(qty).padStart(2, '0'), 150, 86, UIC.text, UIC.textSh); Font.drawR(x, (qty * it.price) + 'G', 230, 86, UIC.text, UIC.textSh); } };
        UI.push(q); let ok = false;
        while (true) { if (Input.repeat('up')) { qty = qty >= maxQ ? 1 : qty + 1; Sound.sfx('cursor'); } if (Input.repeat('down')) { qty = qty <= 1 ? maxQ : qty - 1; Sound.sfx('cursor'); } if (Input.repeat('right')) { qty = Math.min(maxQ, qty + 10); Sound.sfx('cursor'); } if (Input.repeat('left')) { qty = Math.max(1, qty - 10); Sound.sfx('cursor'); } if (Input.pressed('a')) { Input.consume('a'); ok = true; break; } if (Input.pressed('b')) { Input.consume('b'); break; } yield; }
        UI.remove(q); if (!ok) continue;
      }
      UI.remove(scr);
      const yes = yield* yesNo(it.n + (it.equip ? '' : '×' + qty) + '，一共是' + (qty * it.price) + 'G，可以嗎？', { mx: 186, my: 60 });
      if (yes) { Game.st.money -= qty * it.price; Game.st.bag[k] = (Game.st.bag[k] || 0) + qty; Sound.sfx('save'); yield* say('好的！這是您的' + it.n + '。' + (it.equip ? '\n記得到背包或裝備畫面裝備喔！' : '')); }
      UI.push(scr);
    }
    yield;
  }
  UI.remove(scr);
}
function* shopSell() {
  let idx = 0;
  const listNow = () => bagList(it => !it.key && !(it.price === 0 && !it.sell)).filter(k => !Object.values(Game.st.equip).includes(k) || Game.st.bag[k] > 1);
  const scr = { draw(x) {
    const list = listNow(); drawWin(x, 96, 2, 142, 110, 'menu');
    if (!list.length) Font.draw(x, '沒有可以賣的東西', 106, 8, '#909098', UIC.textSh);
    const top = Math.max(0, Math.min(idx - 3, list.length - 6));
    list.slice(top, top + 6).forEach((k, i) => { const Y = 6 + i * 17; const it = ITEMS[k]; Font.draw(x, it.n + '×' + Game.st.bag[k], 110, Y, UIC.text, UIC.textSh); Font.drawR(x, sellPrice(k) + 'G', 232, Y, UIC.text, UIC.textSh); if (top + i === idx) x.drawImage(CURSOR, 102, Y + 3); });
    drawWin(x, 0, 112, 240, 48, 'ow'); Font.draw(x, list.length ? '要賣哪一樣東西呢？' : '目前沒有可以賣的東西。', 12, 119, UIC.text, UIC.textSh); Font.draw(x, '（裝備中的物品不能賣）', 12, 135, '#8890a0', UIC.textSh);
  } };
  UI.push(scr);
  while (true) {
    const list = listNow(); if (idx >= list.length) idx = Math.max(0, list.length - 1);
    if (Input.repeat('up') && list.length) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down') && list.length) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a') && list[idx]) {
      Input.consume('a'); const k = list[idx]; UI.remove(scr);
      const yes = yield* yesNo(ITEMS[k].n + '可以用' + sellPrice(k) + 'G收購，要賣嗎？', { mx: 186, my: 60 });
      if (yes) { Game.st.bag[k]--; Game.st.money += sellPrice(k); Sound.sfx('save'); yield* say('謝謝！收下了' + ITEMS[k].n + '。'); }
      UI.push(scr);
    }
    yield;
  }
  UI.remove(scr);
}
const sellPrice = k => ITEMS[k].sell ?? Math.floor(ITEMS[k].price / 2);

/* ---------- Start menu ---------- */
function* startMenu() {
  Sound.sfx('menu'); let idx = Game.menuIdx || 0;
  while (true) {
    const r = yield* choose(['狀態', '背包', '裝備', '存檔', '設定', '關閉'], { x: 172, y: 2, w: 66, index: idx });
    if (r < 0 || r === 5) break; idx = r; Game.menuIdx = r;
    if (r === 0) yield* summaryScreen();
    if (r === 1) yield* bagScreen('field');
    if (r === 2) yield* equipScreen();
    if (r === 3) { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } break; }
    if (r === 4) yield* optionsScreen();
  }
}
