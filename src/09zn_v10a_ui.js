/* ===================== v10 階段一：操作與介面 =====================
   Playtest plan items 5 / 6 / 7 (see 曙光冒險-v10擴大計畫):
   - Running: keep holding a direction and you run from the second step (B still runs; 設定→跑步 switches back to hold-B).
   - Dialogue box: smaller text (4 lines, 設定→對話文字 = 大 gives the old 3 lines), the speaker's pixel portrait and a
     name plate on the top-left of the box. The speaker is the NPC you talked to, or the name before 「：「」 in a line
     (the prefix moves to the name plate). Codex portraits go into PORTRAIT_ART; until one exists the portrait is cut
     from the field sprite (head and shoulders, ×2). Hold B to fast-forward; 紀錄→對話紀錄 lists the last 120 lines.
   - 任務 (main menu): 進行中 / 已完成 tabs, one quest is tracked (★). The detail page shows the current step, the
     destination and the route there, targets with where to get them, a suggested level, the giver and the reward.
     The tracked quest shows at the top right of the field with an arrow toward the next exit / the person to see. */

/* ---------- speakers & portraits ---------- */
const PORTRAIT_PROPS = new Set(['bell', 'lamp', 'lampLit', 'altar', 'loreStone', 'windmill', 'starGate', 'caveDoor', 'iceWall', 'forgeL', 'forgeR', 'anvil', 'tub', 'rackA', 'rackB', 'manhole', 'miasma', 'warden']);
const PORTRAIT_ART = {}; // key → 32×32 canvas (Codex portraits, task S; keys are PORTRAIT_NAME values or field looks)
for (const k in (typeof PORTRAIT_PX_ROWS !== 'undefined' ? PORTRAIT_PX_ROWS : {})) {
  const [w, h, cols, rows] = PORTRAIT_PX_ROWS[k], c = mkCanvas(w, h), x = c.getContext('2d'), CH = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  rows.forEach((r, y) => { let X = 0; for (const [, n, ch] of r.matchAll(/(\d*)(.)/g)) { const len = n ? +n : 1; if (ch !== '.') { x.fillStyle = cols[CH.indexOf(ch)]; x.fillRect(X, y, len, 1); } X += len; } });
  PORTRAIT_ART[k] = c;
}
const PORTRAIT_NAME = { 格倫: 'gren', 鐵斧格倫: 'gren', 諾拉: 'nora', 村長婆婆: 'frostElder', 提姆: 'tim', 小麥: 'mai' }; // characters who share a field look but get their own portrait
let SPK_INDEX = null;
function spkIndex() { if (SPK_INDEX) return SPK_INDEX; const L = []; for (const k in MAPS) for (const n of MAPS[k].npcs || []) if (n.name && n.look && !PORTRAIT_PROPS.has(n.look)) L.push({ name: n.name, look: n.look, map: k, id: n.id, x: n.x, y: n.y, show: n.show || null }); return (SPK_INDEX = L); }
function speakerFor(name) {
  if (Game.st && name === Game.st.name) return { name, hero: 1 };
  const L = spkIndex(), e = L.find(x => x.name === name) || L.find(x => x.name.endsWith(name)) || L.find(x => x.name.includes(name));
  return { name, look: e ? e.look : null };
}
const PORT_AUTO = new WeakMap();
function autoPortrait(src, cropY = 0) { // head and shoulders of a 16×22 field sprite, ×2
  let c = PORT_AUTO.get(src); if (c) return c; c = mkCanvas(32, 32); const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.drawImage(src, 0, cropY, 16, 16, 0, 1, 32, 32); PORT_AUTO.set(src, c); return c;
}
function portraitOf(w) {
  const nk = w.name && PORTRAIT_NAME[w.name];
  if (nk && PORTRAIT_ART[nk]) return PORTRAIT_ART[nk];
  if (w.hero) { if (PORTRAIT_ART.hero) return PORTRAIT_ART.hero; const f = heroFramesFor(Game.st); return f && f.down ? autoPortrait(f.down[0]) : null; }
  if (w.sp) { const im = typeof chibiPortrait === 'function' ? chibiPortrait(w.sp) : null; if (!im) return null; const c = mkCanvas(32, 32), x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, Math.round((32 - im.width) / 2), 1); return c; }
  if (!w.look || PORTRAIT_PROPS.has(w.look)) return null; if (PORTRAIT_ART[w.look]) return PORTRAIT_ART[w.look];
  const f = npcFrames(w.look), c0 = f && f.down && f.down[0]; return c0 && c0.width === 16 && c0.height >= 20 ? autoPortrait(c0) : null;
}
function* talkAs(ent, g) { const prev = Game.talker; Game.talker = ent; try { if (g) yield* g; } finally { Game.talker = prev || null; } }
// the default dialogue box: font size, speaker, log
function dlgSetup(text, o) {
  const big = !!Game.settings.bigText, r = { text, fs: big ? 12 : 10, lh: big ? 16 : 12, spk: null };
  let who = null; const m = text.match(/^([^：「」\n（【。！？，]{1,10})：(?=「)/);
  if (m) { who = speakerFor(m[1]); r.text = text.slice(m[0].length); }
  else if (o.spk) who = o.spk;
  else if (Game.talker && !/^[（【]/.test(text) && !(Game.st && text.startsWith(Game.st.name))) { const T = Game.talker; who = { name: T.name && !/^[a-z]/.test(T.name) ? T.name : null, look: T.look, sp: T.sp }; }
  if (who) { who.img = portraitOf(who); if (who.img || who.name) r.spk = who; }
  dlgLogPush(r.spk && r.spk.name, r.text);
  return r;
}
const PORT_CRISP = new WeakMap(); // portraits with a touch more contrast and colour, so the small faces read clearly on phones
function crispPortrait(src) { let c = PORT_CRISP.get(src); if (c) return c; const w = src.width, h = src.height; c = mkCanvas(w, h); const x = c.getContext('2d'); x.drawImage(src, 0, 0);
  try { const D = x.getImageData(0, 0, w, h), a = D.data; for (let i = 0; i < a.length; i += 4) { if (a[i + 3] < 8) continue; for (let k = 0; k < 3; k++) a[i + k] = (a[i + k] - 128) * 1.12 + 128; const L = 0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2]; for (let k = 0; k < 3; k++) a[i + k] = L + (a[i + k] - L) * 1.12; } x.putImageData(D, 0, 0); } catch (e) { }
  PORT_CRISP.set(src, c); return c; }
const PORT_BOX = new WeakMap(); // v27i: the visible part of a portrait (transparent margins trimmed), in source pixels
function portraitBox(im) {
  let r = PORT_BOX.get(im); if (r) return r; r = { sx: 0, sy: 0, sw: im.width, sh: im.height };
  try { const w = im.width, h = im.height, d = (im.getContext ? im : (() => { const c = mkCanvas(w, h); c.getContext('2d').drawImage(im, 0, 0); return c; })()).getContext('2d').getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 >= x0) { const pad = Math.max(1, Math.round(h / 32)); x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad); r = { sx: x0, sy: y0, sw: x1 - x0 + 1, sh: y1 - y0 + 1 }; } } catch (e) { }
  PORT_BOX.set(im, r); return r;
}
function drawSpeaker(x, tb) {
  const s = tb.spk; if (tb.y < 60) return; const px = tb.x + 2; let nx = px;
  if (s.img) { // v27i (player: 「頭像外框縮小到跟圖像一致」): same 48px scale as before, but the frame now hugs the visible portrait instead of a fixed square
    const im = s.img.hd ? s.img : crispPortrait(s.img), B = portraitBox(s.img), k = 48 / s.img.height, dw = Math.round(B.sw * k), dh = Math.round(B.sh * k), X = px + 1, Y = tb.y - 2 - dh;
    x.fillStyle = '#0b0d18'; x.fillRect(X - 1, Y - 1, dw + 2, dh + 2); x.fillStyle = UIC.accent; x.fillRect(X - 1, Y - 1, dw + 2, 1); x.fillStyle = '#141a30'; x.fillRect(X, Y, dw, dh);
    x.save(); x.imageSmoothingEnabled = !!s.img.hd; if (s.img.hd) x.imageSmoothingQuality = 'high'; x.drawImage(im, B.sx, B.sy, B.sw, B.sh, X, Y, dw, dh); x.restore(); nx = X + dw + 3; }
  if (s.name) { const w = Math.ceil(Font.width(s.name, 10)) + 14; drawWin(x, nx, tb.y - 16, w, 17, 'ow'); Font.draw(x, s.name, nx + 7, tb.y - 15, UIC.warm, UIC.textSh, 10); }
}
// hold B to fast-forward (only once B was pressed inside a dialogue, so running with B doesn't skip talks)
let __ffArm = false, __ffT = 0, __ffF = -1;
function dlgFF() {
  if (__ffF !== Game.frame) { __ffF = Game.frame; if (Input.held('b')) { if (Input.pressed('b')) __ffArm = true; __ffT++; } else { __ffArm = false; __ffT = 0; } }
  return __ffArm && __ffT > 18;
}
const DLG_LOG = [];
function dlgLogPush(name, text) { const t = String(text).trim(); if (!t) return; const L = DLG_LOG[DLG_LOG.length - 1]; if (L && L.t === t && L.n === (name || '')) return; DLG_LOG.push({ n: name || '', t }); if (DLG_LOG.length > 120) DLG_LOG.shift(); }
function* dlgLogScreen() {
  const L = []; for (const e of DLG_LOG) { if (e.n) L.push([e.n, UIC.warm, 10, 0]); for (const l of Font.wrap(e.t, 150, 10)) L.push([l, UIC.text, 10, 4]); L.push(['', UIC.text, 5, 0]); }
  if (!L.length) L.push(['（還沒有對話紀錄）', UIC.muted, 10, 0]);
  const per = 17; let top = Math.max(0, L.length - per);
  const scr = { draw(x) { screenBG(x); headerBar(x, '對話紀錄'); drawWin(x, 4, 22, 168, 230, 'menu'); const end = drawInfoLines(x, L, 10, 26, 236, top); scr.more = end < L.length;
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (scr.more) x.drawImage(DOWNARROW, 86, 237); Font.drawR(x, '↑↓捲動　B返回', 166, 240, UIC.muted, UIC.textSh, 9); } };
  UI.push(scr);
  while (true) { if (Input.repeat('up') && top > 0) { top--; Sound.sfx('cursor'); } if (Input.repeat('down') && scr.more) { top++; Sound.sfx('cursor'); } if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr);
}
// a talk that never finished (scene change) must not leave its speaker behind
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { if (!this.script && Game.talker && !UI.stack.length) Game.talker = null; return _u.apply(this, a); }; }

/* ---------- map graph: where is a quest's destination, and which way to go ---------- */
let MAP_G = null;
function mapGraph() {
  if (MAP_G) return MAP_G; const G = {};
  const add = (a, b, via) => { if (a === b || !MAPS[a] || !MAPS[b]) return; (G[a] = G[a] || {}); if (!G[a][b]) G[a][b] = via; };
  for (const id in MAPS) { const d = MAPS[id];
    for (const k in d.connect || {}) { const c = d.connect[k]; if (c && c.map) { add(id, c.map, { dir: { n: 'up', s: 'down', e: 'right', w: 'left' }[k] || k }); add(c.map, id, null); } }
    for (const b of (d.buildings || []).concat(d.doors || [])) if (b.to) { add(id, b.to[0], { x: b.x + (b.door || 0), y: b.y + (b.h || 1) - 1 }); add(b.to[0], id, null); }
    for (const e of d.edgeWarps || []) if (e.to) { add(id, e.to[0], { dir: e.dir, x: e.at && e.dir && (e.dir === 'left' || e.dir === 'right') ? null : e.at && e.at[0] }); add(e.to[0], id, null); }
    if (d.exit && d.exit.to) { add(id, d.exit.to[0], { x: d.exit.x, y: d.exit.y }); add(d.exit.to[0], id, null); }
    for (const k of ['northWarp', 'southWarp']) { const w = d[k]; if (w && w.to) { add(id, w.to[0], { dir: k === 'northWarp' ? 'up' : 'down' }); add(w.to[0], id, null); } }
    for (const k of ['gate', 'back']) { const w = d[k]; const to = w && (w.to || (Array.isArray(w) ? w : null)); if (to && typeof to[0] === 'string') { add(id, to[0], w.x !== undefined ? { x: w.x, y: w.y } : null); add(to[0], id, null); } }
  }
  // fill the reverse links' "via" from the other map's entry point when we don't know it
  return (MAP_G = G);
}
function mapRoute(from, to) { // [from, …, to] or null
  if (from === to) return [from]; const G = mapGraph(), prev = { [from]: null }, q = [from];
  while (q.length) { const a = q.shift(); for (const b in G[a] || {}) { if (b in prev) continue; prev[b] = a; if (b === to) { const P = [to]; let c = a; while (c) { P.unshift(c); c = prev[c]; } return P; } q.push(b); } }
  return null;
}
const mapDist = (a, b) => { const r = mapRoute(a, b); return r ? r.length - 1 : 99; };
function mapIdByName(nm) { const hit = Object.keys(MAPS).filter(k => MAPS[k].name === nm); return hit.find(k => MAPS[k].outdoor) || hit[0] || null; }
function npcSpot(id) { for (const k in MAPS) { const n = (MAPS[k].npcs || []).find(n => n.id === id); if (n) return { map: k, x: n.x, y: n.y, name: n.name }; } return null; }
function mapLevel(id) { const d = MAPS[id]; let lo = 99, hi = 0; for (const e of d.encounters || []) for (const r of e.table || []) { if (typeof r[1] === 'number') { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2] || r[1]); } } for (const e of d.elites || []) if (e.lv) hi = Math.max(hi, e.lv); if (d.boss && d.boss.lv) hi = Math.max(hi, d.boss.lv); return hi ? [lo === 99 ? hi : lo, hi] : null; }
function nearestMap(ids, st = Game.st) { let best = null, bd = 1e9; for (const id of ids) { const d = mapDist(st.map, id); if (d < bd) { bd = d; best = id; } } return best; }

/* ---------- quests: tracking, destination, guidance ---------- */
function questCom(q) { if (!q.n.startsWith('委託：')) return null; const cid = Object.keys(COMMISSIONS).find(k => '委託：' + COMMISSIONS[k].n === q.n); return cid ? { cid, c: COMMISSIONS[cid] } : null; }
function speciesMaps(sp) { return Object.keys(MAPS).filter(id => id !== 'rift' && ((MAPS[id].encounters || []).some(e => (e.table || []).some(r => r[0] === sp)) || (MAPS[id].elites || []).some(e => e.sp === sp) || (MAPS[id].boss && MAPS[id].boss.sp === sp))); }
function itemMaps(k) { const out = new Set(); for (const s in SPECIES) if (SPECIES[s].mat === k) speciesMaps(s).forEach(m => out.add(m));
  for (const id in MAPS) for (const g of MAPS[id].gathers || []) { const G = GATHER_KINDS[g.kind]; if (G && (G[1] === k || (G[3] || []).some(([m]) => m === k))) out.add(id); } return [...out]; }
// { map, spot:{x,y}|null, what } — where the quest wants you to go next
function questDest(q, st = Game.st) {
  if (!q || q.done) return null; const qc = questCom(q);
  if (qc) { const { cid, c } = qc, p = comProgress(cid, st), giver = typeof COM_GIVER !== 'undefined' && COM_GIVER[cid] && npcSpot(COM_GIVER[cid]);
    if (p.ready && giver) return { map: giver.map, spot: giver, what: '回報' + (giver.name || c.from) };
    if (c.kill) { const m = nearestMap(speciesMaps(c.kill[0]), st); if (m) return { map: m, what: '打倒' + SPECIES[c.kill[0]].n }; }
    if (c.need) for (const k in c.need) if ((st.bag[k] || 0) < c.need[k]) { const m = nearestMap(itemMaps(k), st); if (m) return { map: m, what: '收集' + ITEMS[k].n }; }
    return null; }
  // story quests: the first place or person named in the current step
  const t = q.t || ''; let best = null, bi = 1e9;
  for (const id in MAPS) { const nm = MAPS[id].name; if (!nm || nm.length < 2) continue; const i = t.indexOf(nm); if (i >= 0 && (i < bi || (i === bi && nm.length > MAPS[best.map].name.length))) { bi = i; best = { map: mapIdByName(nm) || id, what: '前往' + nm }; } }
  for (const e of spkIndex()) { if (e.show && !e.show(st)) continue; const short = e.name.length > 3 ? e.name.slice(-2) : e.name, i = t.indexOf(e.name) >= 0 ? t.indexOf(e.name) : t.indexOf(short); if (i >= 0 && i < bi) { bi = i; best = { map: e.map, spot: e, what: '找' + e.name }; } }
  return best;
}
function questTracked(st = Game.st) { const L = questList(st).filter(q => !q.done); return L.find(q => q.n === st.track) || L.find(q => q.main) || L[0] || null; }
// accepting a commission starts tracking it
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    const st = this.st; if (st && st.com) { const seen = st.comSeen || (st.comSeen = {}); for (const k in st.com) if (!seen[k]) { seen[k] = 1; if (st.com[k].s === 'on' && COMMISSIONS[k]) { st.track = '委託：' + COMMISSIONS[k].n; if (typeof toast === 'function') toast('★ 開始追蹤：' + COMMISSIONS[k].n); } } }
    return _u.apply(this, a); }; }
function dirArrow(dx, dy) { if (!dx && !dy) return '●'; const a = Math.atan2(dy, dx), k = Math.round(a / (Math.PI / 4)); return ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][(k + 8) % 8]; }
// next step toward the destination from where the player stands: { text, arrow }
function questGuide(q, st = Game.st, ow = Game.ow) {
  const D = questDest(q, st); if (!D) return null; const here = st.map;
  if (D.map === here) { if (D.spot && ow && ow.p) return { text: D.what, arrow: dirArrow(D.spot.x - ow.p.x, D.spot.y - ow.p.y), D }; return { text: D.what + '（就在這裡）', arrow: '●', D }; }
  const R = mapRoute(here, D.map); if (!R) return { text: D.what, arrow: '', D, far: 1 };
  const next = R[1], via = (mapGraph()[here] || {})[next]; let arrow = '';
  if (via && ow && ow.p) { if (via.x !== undefined && via.x !== null && via.y !== undefined) arrow = dirArrow(via.x - ow.p.x, via.y - ow.p.y); else if (via.dir) arrow = { up: '↑', down: '↓', left: '←', right: '→' }[via.dir] || ''; }
  return { text: D.what, next: MAPS[next].name, arrow, D, route: R };
}
function questTips(q, st = Game.st) { // suggested level and a nudge
  const D = questDest(q, st), T = []; if (!D) return T; const lv = mapLevel(D.map);
  if (lv) { const rec = lv[1]; T.push('建議等級：Lv' + rec + (st.lv + 2 < rec ? '（你現在Lv' + st.lv + '，有點危險，先在附近練等或準備好傷藥）' : st.lv >= rec + 6 ? '（對你來說很輕鬆）' : '')); }
  const R = mapRoute(st.map, D.map); if (R && R.length > 2) T.push('路線：' + R.map(id => MAPS[id].name).join(' → '));
  return T;
}

/* ---------- the quest screen ---------- */
function questDetailLines(q, st = Game.st) {
  const L = [], add = (t, c = UIC.text, s = 10, ind = 0) => { for (const l of Font.wrap(t, 150 - ind, s)) L.push([l, c, s, ind]); }, gap = () => L.push(['', UIC.text, 5, 0]);
  L.push([q.done ? '【結果】' : '【目前進度】', UIC.accent, 10, 0]); add(q.t, q.done ? UIC.muted : UIC.text, 10, 2);
  if (!q.done) { const G = questGuide(q, st); if (G) { gap(); L.push(['【下一步】', UIC.accent, 10, 0]); add(G.text + (G.next ? '　→ 先往「' + G.next + '」' + (G.arrow ? ' ' + G.arrow : '') : G.arrow ? '　' + G.arrow : ''), '#c8f0ff', 10, 2); for (const t of questTips(q, st)) add(t, UIC.muted, 9, 2); } }
  const old = typeof questDetail === 'function' ? questDetail(q, st).slice(Font.wrap(q.t, 150, 10).length) : []; // targets / giver / reward from the existing page
  for (const l of old) L.push(l);
  return L;
}
function* questScreen() {
  const st = Game.st; let tab = 0, sel = 0; const VIS = 8;
  const lists = () => { const L = questList(st); return [L.filter(q => !q.done), L.filter(q => q.done)]; };
  const scr = { draw(x) {
    const [A, B] = lists(), QL = tab ? B : A, i = Math.min(sel, Math.max(0, QL.length - 1)), t0 = clamp(i - 3, 0, Math.max(0, QL.length - VIS)), tr = questTracked(st);
    screenBG(x); headerBar(x, '任務'); Font.drawR(x, (tab ? '已完成 ' + B.length : '進行中 ' + A.length) + '　← →', W - 6, 3, UIC.muted, UIC.textSh, 10);
    drawWin(x, 4, 22, 168, VIS * 16 + 8, 'menu'); if (!QL.length) Font.draw(x, tab ? '還沒有完成的任務。' : '目前沒有任務。', 14, 28, UIC.muted, UIC.textSh, 10);
    QL.slice(t0, t0 + VIS).forEach((q, k) => { const j = t0 + k, Y = 26 + k * 16; if (j === i) selBar(x, 6, Y - 1, 164, 15); const col = q.done ? UIC.dis : QUEST_CAT_COL[q.cat] || UIC.warm;
      Font.draw(x, q.cat, 10, Y, col, UIC.textSh, 8); let nm = q.n.replace(/^委託：/, ''); while (Font.width(nm, 10) > 118 && nm.length > 2) nm = nm.slice(0, -2) + '…'; Font.draw(x, nm, 36, Y - 1, q.done ? UIC.dis : UIC.text, UIC.textSh, 10); if (!tab && tr && q.n === tr.n) Font.drawR(x, '★', 166, Y - 1, UIC.warm, UIC.textSh, 10); });
    if (t0 > 0) x.drawImage(UPARROW, 86, 23); if (t0 + VIS < QL.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 16 + 3);
    const q = QL[i], Y0 = 22 + VIS * 16 + 12; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu');
    if (q) { let y = Y0 + 3; Font.draw(x, q.n.replace(/^委託：/, ''), 10, y, QUEST_CAT_COL[q.cat] || UIC.warm, UIC.textSh, 10); Font.drawR(x, 'A 詳情', 166, y + 1, UIC.accent, UIC.textSh, 9); y += 15;
      const G = !q.done && questGuide(q, st); const room = G ? 33 : 55, z = (() => { let z = 9; while (z > 7 && Font.wrap(q.t, 150, z).length * (z + 2) > room) z--; return z; })(), nL = Math.min(Font.wrap(q.t, 150, z).length, Math.floor(room / (z + 2))); drawFitText(x, q.t, 10, y, 150, room, 9, q.done ? UIC.muted : UIC.text); y += nL * (z + 2) + 3; // v12.0.1: shrink instead of cutting
      if (G) { const s = '▶ ' + G.text + (G.next ? '（先往' + G.next + '）' : '') + (G.arrow ? ' ' + G.arrow : ''); Font.wrap(s, 150, 9).slice(0, 2).forEach((l, k) => Font.draw(x, l, 10, y + k * 11, '#c8f0ff', UIC.textSh, 9)); }
      if (!tab) Font.draw(x, tr && q.n === tr.n ? '★ 追蹤中' : 'SELECT／長按A：設為追蹤', 10, 238, tr && q.n === tr.n ? UIC.warm : UIC.muted, UIC.textSh, 8); }
  } };
  UI.push(scr);
  while (true) {
    const [A, B] = lists(), QL = tab ? B : A;
    if (Input.pressed('left') || Input.pressed('right')) { tab = 1 - tab; sel = 0; Sound.sfx('cursor'); }
    if (Input.repeat('up') && sel > 0) { sel--; Sound.sfx('cursor'); } if (Input.repeat('down') && sel < QL.length - 1) { sel++; Sound.sfx('cursor'); }
    if ((Input.pressed('select') || (Input.held('a') && Input.t.a === 30)) && !tab && QL[sel]) { st.track = QL[sel].n; Sound.sfx('select'); Input.consume('a'); }
    else if (Input.pressed('a') && QL[sel]) { Input.consume('a'); Sound.sfx('select'); UI.remove(scr); const r = yield* questDetailPage(QL[sel]); UI.push(scr); if (r === 'track') st.track = QL[sel].n; yield; continue; }
    if (Input.pressed('b')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}
function* questDetailPage(q) {
  const st = Game.st; let top = 0; const L = questDetailLines(q, st); const canTrack = !q.done;
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '任務詳情'); drawWin(x, 4, 22, 168, 230, 'menu');
    Font.draw(x, q.n.replace(/^委託：/, ''), 10, 25, QUEST_CAT_COL[q.cat] || UIC.warm, UIC.textSh); Font.drawR(x, q.cat, 166, 27, UIC.muted, UIC.textSh, 9); x.fillStyle = UIC.accent; x.globalAlpha = 0.4; x.fillRect(10, 41, 156, 1); x.globalAlpha = 1;
    const end = drawInfoLines(x, L, 10, 45, 234, top); scr.more = end < L.length;
    if (top > 0) x.drawImage(UPARROW, 86, 42); if (scr.more) x.drawImage(DOWNARROW, 86, 235);
    const tr = questTracked(st); Font.draw(x, canTrack ? (tr && tr.n === q.n ? '★ 追蹤中' : 'A 設為追蹤') : '', 10, 240, tr && tr.n === q.n ? UIC.warm : UIC.accent, UIC.textSh, 9);
    Font.drawR(x, (scr.more || top > 0 ? '↑↓捲動　' : '') + 'B返回', 166, 240, UIC.muted, UIC.textSh, 9);
  } };
  UI.push(scr); let r = null;
  while (true) { if (Input.repeat('up') && top > 0) { top--; Sound.sfx('cursor'); } if (Input.repeat('down') && scr.more) { top++; Sound.sfx('cursor'); }
    if (Input.pressed('a') && canTrack) { Input.consume('a'); st.track = q.n; r = 'track'; Sound.sfx('select'); }
    if (Input.pressed('b')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr); return r;
}
// the old 狀態→任務 page opens the new detail page too
questDetailScreen = function* (q) { yield* questDetailPage(q); };

/* ---------- field HUD: the tracked quest ---------- */
let __qhud = { f: -99, v: null };
{ const _d = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    _d.call(this, x); const st = this.st; if (!st || !st.cls && !st.flags.license || this.script || UI.stack.length || (this.popup && this.popup.t < 160) || Game.trans || Game.settings.questHud === false) return;
    if (Game.frame - __qhud.f > 20) { const q = questTracked(st); __qhud = { f: Game.frame, v: q ? { q, G: questGuide(q, st, this) } : null }; }
    // v10.6.4 (player: 「追蹤的提示任務欄文字拉長，字小一點」): size 7, the goal and where to go, as wide as the weather box
    // allows and on up to two lines, so it is no longer cut to a few characters
    const v = __qhud.v; if (!v || !v.G) return; const G = v.G, FS = 7, a = G.arrow || '', aw = a ? Math.ceil(Font.width(a, 9)) + 3 : 0;
    const full = G.next && G.next !== G.text ? G.text + '→' + G.next : (G.next || G.text), k = typeof wxNow === 'function' && wxNow(st);
    const left = k ? 3 + Math.ceil(Font.width(WEATHER[k].n + (st.rainbowUntil > (st.steps || 0) ? '・彩虹' : '') + (typeof dnHudTag === 'function' ? dnHudTag(st) : ''), 9)) + 20 + 4 : 3, maxT = W - 3 - left - 14 - aw;
    let L = Font.wrap(full, maxT, FS); if (L.length > 2) { L = L.slice(0, 2); let t = L[1]; while (Font.width(t + '…', FS) > maxT && t.length > 1) t = t.slice(0, -1); L[1] = t + '…'; }
    const tw = Math.ceil(Math.max(...L.map(l => Font.width(l, FS)))), w = tw + 14 + aw, h = L.length > 1 ? 21 : 14, X = W - w - 3;
    x.fillStyle = 'rgba(10,14,28,0.72)'; x.fillRect(X, 3, w, h); x.fillStyle = UIC.warm; x.fillRect(X, 3, 2, h);
    Font.draw(x, '★', X + 4, 1, UIC.warm, null, 8); L.forEach((l, i) => Font.draw(x, l, X + 12, 2 + i * 8, '#e8f4ff', UIC.textSh, FS)); if (a) Font.drawR(x, a, X + w - 3, 0, '#8ad0ff', UIC.textSh, 9);
  }; }
