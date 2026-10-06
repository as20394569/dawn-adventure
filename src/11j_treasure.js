/* ===================== v12.44 藏寶圖 =====================
   地圖上畫著某個地方的一角，正中間打了紅色的 ×。站到那一格按 A 就能挖。
   畫面是用那張地圖實際畫出來的（白天、沒有人），再做成舊羊皮紙的顏色。 */
// the real overworld renderer, pointed at map `id` around (x, y) for one frame; returns a cw×ch piece centred on that tile
function tmapShot13(id, x, y, cw = 144, ch = 96) {
  const ow = Game.ow; if (!ow || !ow.st) return null; const st = ow.st;
  const K = ['map', 'p', 'npcs', 'elites', 'items', 'boss', 'conn', 'popup', 'camDY', 'camX', 'camY', 'doorAnim', 'hideHero', 'bob13', 'anim'], keep = {}; for (const k of K) keep[k] = ow[k];
  const S = { map: st.map, clock: st.clock, x: st.x, y: st.y, dir: st.dir }, c = document.createElement('canvas'); c.width = W; c.height = H; const cx = c.getContext('2d'); let at = null;
  try { ow.map = getMap(id); st.map = id; st.clock = 700; ow.p = new Entity({ x, y, dir: 'down' }); ow.p.isPlayer = true; ow.npcs = []; ow.elites = []; ow.items = []; ow.boss = null; ow.popup = null; ow.hideHero = true; ow.camDY = 0; ow.doorAnim = null; ow.bob13 = null; ow.anim = {};
    ow.conn = {}; const cc = ow.map.d.connect || {}; for (const k in cc) ow.conn[k] = { m: getMap(cc[k].map), dx: cc[k].dx };
    ow.draw(cx); at = [x * 16 - ow.camX + 8, y * 16 - ow.camY + 8]; }
  catch (e) { at = null; }
  finally { for (const k of K) ow[k] = keep[k]; Object.assign(st, S); }
  if (!at) return null;
  const o = document.createElement('canvas'); o.width = cw; o.height = ch; o.getContext('2d').drawImage(c, Math.round(at[0] - cw / 2), Math.round(at[1] - ch / 2), cw, ch, 0, 0, cw, ch); return o;
}
// old parchment: sepia, a little fade towards the torn edges, and the red ×
function tmapPaper13(src) {
  const w = src.width, h = src.height, o = document.createElement('canvas'); o.width = w + 12; o.height = h + 12; const x = o.getContext('2d');
  x.fillStyle = '#d8c08c'; x.fillRect(0, 0, o.width, o.height);
  const D = src.getContext('2d').getImageData(0, 0, w, h), p = D.data;
  for (let i = 0; i < p.length; i += 4) { const px = (i / 4) % w, py = Math.floor(i / 4 / w), l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) / 255;
    const e = Math.min(px, py, w - 1 - px, h - 1 - py), fade = e < 8 ? 0.45 + 0.07 * e : 1, L = Math.max(0, Math.min(1, (l - 0.45) * 1.7 + 0.55));
    // 55% old ink (sepia, more contrast) + 45% the real colours, so water still reads blue and trees green
    const r = 0.55 * (60 + 190 * L) + 0.45 * p[i], g = 0.55 * (40 + 168 * L) + 0.45 * p[i + 1], b = 0.55 * (22 + 118 * L) + 0.45 * p[i + 2];
    p[i] = 216 * (1 - fade) + r * fade; p[i + 1] = 192 * (1 - fade) + g * fade; p[i + 2] = 140 * (1 - fade) + b * fade; p[i + 3] = 255; }
  x.putImageData(D, 6, 6);
  // torn edge
  const rr = srand(w * 7 + h); x.fillStyle = '#20140c'; for (let i = 0; i < o.width; i += 2) { x.fillRect(i, 0, 2, Math.floor(rr() * 3)); x.fillRect(i, o.height - Math.floor(rr() * 3), 2, 3); }
  for (let i = 0; i < o.height; i += 2) { x.fillRect(0, i, Math.floor(rr() * 3), 2); x.fillRect(o.width - Math.floor(rr() * 3), i, 3, 2); }
  // the ×
  const cx = Math.round(o.width / 2), cy = Math.round(o.height / 2); x.fillStyle = '#5a0a0a';
  for (let d = -5; d <= 5; d++) { x.fillRect(cx + d - 1, cy + d - 1, 3, 3); x.fillRect(cx + d - 1, cy - d - 1, 3, 3); }
  x.fillStyle = '#d82818'; for (let d = -5; d <= 5; d++) { x.fillRect(cx + d, cy + d, 2, 2); x.fillRect(cx + d, cy - d, 2, 2); }
  return o;
}
const TMIMG13 = {};
const tmapImg13 = id => { if (TMIMG13[id]) return TMIMG13[id]; const S = TMAP13[id], s = tmapShot13(S.m, S.x, S.y); return s ? (TMIMG13[id] = tmapPaper13(s)) : null; };

/* ---------- 16 張藏寶圖：地點・需要的等級（掉落用）・寶藏 ---------- */
const TMAP13 = {
  t1: { m: 'town', x: 8, y: 26, L: 1, g: 300, it: [['superPotion', 2]] },
  t2: { m: 'route', x: 3, y: 40, L: 3, g: 500, it: [['ether', 2]] },
  t3: { m: 'windHills', x: 3, y: 37, L: 5, g: 800, it: [['luckClover', 1]] },
  t4: { m: 'jadeCreek', x: 29, y: 35, L: 9, g: 1000, it: [['powerFruit', 1]] },
  t5: { m: 'forest', x: 30, y: 6, L: 12, g: 1200, it: [['wisdomFruit', 1]] },
  t6: { m: 'canyon', x: 30, y: 13, L: 12, g: 1500, it: [['tpBook', 1]] },
  t7: { m: 'lake', x: 3, y: 28, L: 16, g: 1800, it: [['vitFruit', 1]] },
  t8: { m: 'maplePass', x: 34, y: 26, L: 18, g: 2000, it: [['elixir', 2]] },
  t9: { m: 'swamp', x: 23, y: 23, L: 19, g: 2500, it: [['tpBook', 1]] },
  t10: { m: 'oldField', x: 17, y: 3, L: 21, g: 3000, it: [['hiEther', 2], ['luckClover', 1]] },
  t11: { m: 'capital', x: 26, y: 23, L: 22, g: 3000, it: [['tpBook', 1]] },
  t12: { m: 'northRoad', x: 30, y: 22, L: 23, g: 3500, it: [['powerFruit', 1], ['vitFruit', 1]] },
  t13: { m: 'goldPlains', x: 18, y: 36, L: 25, g: 4000, it: [['tpBook', 1]] },
  t14: { m: 'frostField', x: 32, y: 34, L: 30, g: 5000, it: [['elixir', 3]] },
  t15: { m: 'emberPass', x: 29, y: 25, L: 33, g: 6000, it: [['wisdomFruit', 1], ['luckClover', 1]] },
  t16: { m: 'coralCoast13', x: 3, y: 11, L: 45, g: 8000, it: [['tpBook', 1], ['elixir', 2]] },
};
const TMAP_KEYS13 = Object.keys(TMAP13);
const tm13 = (st = Game.st) => st.tm13 || (st.tm13 = { own: [], got: {} });
const tmFound13 = (st = Game.st) => Object.keys(tm13(st).got).length;
const tmSync13 = (st = Game.st) => { const n = tm13(st).own.length; if (n) st.bag.tmap13 = n; else delete st.bag.tmap13; };
ITEMS.tmap13 = { n: '藏寶圖', key: 1, price: 0, sell: 0, cat: '重要物品', d: '畫著某個地方的舊地圖。正中間的紅色 × 就是寶藏的位置。' };
function tmGive13(id, st = Game.st) { const T = tm13(st); if (!id || T.got[id] || T.own.includes(id)) return false; T.own.push(id); tmSync13(st); return true; }
// a map you don't have yet, for a place you can already reach
const tmRoll13 = (st = Game.st) => { const T = tm13(st), C = TMAP_KEYS13.filter(k => !T.got[k] && !T.own.includes(k) && TMAP13[k].L <= (st.lv || 1) + 2 && MAPS[TMAP13[k].m]); return C.length ? C[Math.floor(Math.random() * C.length)] : null; };

/* ---------- 看藏寶圖（背包的「重要物品」） ---------- */
function* tmapView13(start = 0) {
  const st = Game.st, T = tm13(st); if (!T.own.length) { yield* say('藏寶圖都挖完了。'); return; }
  let i = Math.max(0, Math.min(start, T.own.length - 1));
  const box = { draw(x) { x.fillStyle = 'rgba(8,6,14,0.9)'; x.fillRect(0, 0, W, H); const id = T.own[i], S = TMAP13[id], img = tmapImg13(id), n = T.own.length;
      Font.drawC(x, '藏寶圖' + (n > 1 ? '（' + (i + 1) + '／' + n + '）' : ''), W / 2, 8, UIC.warm, UIC.textSh);
      if (img) x.drawImage(img, Math.round(W / 2 - img.width / 2), 26); else Font.drawC(x, '（這裡看不到地圖）', W / 2, 70, UIC.muted, UIC.textSh);
      Font.drawC(x, '角落寫著「' + ((MAPS[S.m] || {}).name || '？？？') + '」', W / 2, 142, UIC.text, UIC.textSh);
      Font.drawC(x, '站在 × 的地方按 A 挖挖看。', W / 2, 160, UIC.muted, UIC.textSh, 10);
      Font.drawC(x, (n > 1 ? '←→ 換一張　' : '') + 'B 關閉', W / 2, 232, UIC.dis, UIC.textSh, 9); } };
  UI.push(box);
  try { while (true) { yield; const n = T.own.length;
      if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
      if (n > 1 && Input.repeat('left')) { i = (i - 1 + n) % n; Sound.sfx('cursor'); }
      if (n > 1 && Input.repeat('right')) { i = (i + 1) % n; Sound.sfx('cursor'); } } }
  finally { UI.remove(box); } }
{ const _bg = bagScreen; bagScreen = function* (mode, ...a) { const was = Game.inBag13; Game.inBag13 = mode !== 'battle'; try { return yield* _bg.call(this, mode, ...a); } finally { Game.inBag13 = was; } }; }
{ const _say = say; say = function* (text, o) { if (Game.inBag13 && text === ITEMS.tmap13.d && Game.st && tm13(Game.st).own.length) return yield* tmapView13(0); return yield* _say(text, o); }; }

/* ---------- 挖：站在 × 的那一格按 A（面前有東西的話先照舊） ---------- */
function* tmapDig13(id) { const st = Game.st, T = tm13(st), S = TMAP13[id];
  Sound.sfx('rock'); yield* wait(14); Sound.sfx('rock'); yield* wait(14);
  T.own = T.own.filter(k => k !== id); T.got[id] = 1; tmSync13(st);
  st.money += S.g; for (const [k, n] of S.it) st.bag[k] = (st.bag[k] || 0) + n;
  yield* itemGet('挖到寶藏了！\n' + S.g + ' G' + S.it.map(([k, n]) => '、' + ITEMS[k].n + (n > 1 ? '×' + n : '')).join('') + '！');
  const f = tmFound13(st); if (f === 1 || f === TMAP_KEYS13.length) yield* say('（找到的寶藏：' + f + '／' + TMAP_KEYS13.length + '。挖到了就去告訴萌芽鎮的尋寶人巴克吧。）'); }
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { const r = _in.call(this); if (r || this.script) return r;
    const st = this.st, p = this.p; if (!st || !st.tm13 || !p) return r; const id = st.tm13.own.find(k => TMAP13[k].m === st.map && TMAP13[k].x === p.x && TMAP13[k].y === p.y);
    if (id) { this.run(tmapDig13(id)); return true; } return r; }; }

/* ---------- 撿到：野外戰鬥勝利 3%、菁英 25% ---------- */
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) { const r = yield* _bs.call(this, cfg, ...a), st = Game.st;
    if (r === 'win' && st && cfg && st.flags.tm13 && MAPS[st.map] && MAPS[st.map].outdoor && !(typeof ARENA_ON13 !== 'undefined' && ARENA_ON13)) {
      const ch = cfg.kind === 'elite' ? 0.25 : cfg.kind === 'wild' ? 0.03 : 0, id = Math.random() < ch ? tmRoll13(st) : null;
      if (id && tmGive13(id, st)) { yield* itemGet('撿到了一張藏寶圖！\n（角落寫著「' + MAPS[TMAP13[id].m].name + '」）'); } }
    return r; }; }

/* ---------- 尋寶人巴克（萌芽鎮南邊的草地） ---------- */
const TMAP_PRIZE13 = [[4, '2000 G'], [8, '秘傳之書'], [12, '稱號「尋寶家」'], [16, '黃金羅盤']];
GEAR.goldCompass13 = { n: '黃金羅盤', slot: 'acc', t: 6, st: { hp: 20, atk: 4, spa: 4, def: 4, spd: 6 }, sp: {}, fx: ['fortune'], trait: 'fortune', kind: '飾品', d: '尋寶人巴克用了十年的羅盤。指針總是指向會發光的東西。', look: (GEAR.qHeroCrest || {}).look };
if (ACC_TRAIT.fortune) ACC_TRAIT.fortune[2] = (ACC_TRAIT.fortune[2] || []).concat(['黃金羅盤']); if (typeof BP_RARE !== 'undefined') BP_RARE.add('goldCompass13');
Events.treasure13 = function* () { const st = Game.st, f = st.flags, T = tm13(st);
  if (!f.tm13) { f.tm13 = 1; yield* sayAll(['尋寶人巴克：「我以前到處挖寶。前陣子挖到一半閃到腰，只好在家鄉休息。」', '巴克：「這張藏寶圖給你練習。畫的是這附近的草地。」']);
    tmGive13('t1', st); Sound.jingle('item'); yield* itemGet(st.name + '得到了「藏寶圖」！');
    yield* sayAll(['巴克：「藏寶圖放在背包的『重要物品』裡。看樹、石頭、告示牌的位置，找到一樣的地方。」', '巴克：「站在紅色 × 的那一格按 A，就能挖。」', '巴克：「打倒魔物的時候，偶爾會撿到別張藏寶圖。菁英身上比較常有。挖到了就來告訴我！」']); return; }
  const n = tmFound13(st), got = st.tm13r || (st.tm13r = {});
  for (const [need] of TMAP_PRIZE13) { if (n < need || got[need]) continue; got[need] = 1; Sound.jingle('item');
    if (need === 4) { st.money += 2000; yield* say('巴克：「四個了？有天分！這是我的一點心意。」'); yield* itemGet('得到了 2000 G！'); }
    else if (need === 8) { st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* say('巴克：「八個！這本書是我在遺跡裡挖到的，給你吧。」'); yield* itemGet('得到了「秘傳之書」！'); }
    else if (need === 12) { yield* say('巴克：「十二個……你已經是真正的尋寶家了。」'); yield* say('得到了稱號「尋寶家」！\n（可以在「稱號」裡裝備）'); }
    else if (need === 16) { const g = makeGear('goldCompass13', 5); yield* sayAll(['巴克：「全部都挖到了？連東方的海邊都去了？」', '巴克：「這個羅盤跟了我十年。它說，該換主人了。」']); yield* itemGet('得到了' + gearName(g) + '！'); } }
  const nx = TMAP_PRIZE13.find(q => !got[q[0]]);
  const r = yield* ask('巴克：「找到 ' + n + ' 個寶藏了。」' + (nx ? '\n（' + nx[0] + ' 個：' + nx[1] + '）' : ''), ['看看藏寶圖', '有什麼訣竅？', '沒事']);
  if (r === 0) yield* tmapView13(0);
  else if (r === 1) yield* sayAll(['巴克：「藏寶圖的角落寫著地名。先到那張地圖，再找長得一樣的地方。」', '巴克：「樹排成什麼形狀、石頭在哪邊、水邊怎麼彎……一樣一樣對。」', '巴克：「越遠的地方，寶藏越好。菁英魔物比較常帶著藏寶圖。」']); };
MAPS.town.npcs.push({ id: 'treasure13', x: 14, y: 27, dir: 'left', look: 'traveler', name: '尋寶人巴克' }); delete mapCache.town;
NPC_ROLES.任務.push('treasure13'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.treasure13 = '萌芽鎮・南邊的草地';
TITLES.push({ id: 'tm13hunter', n: '尋寶家', d: '找到 12 個寶藏。', st: { spd: 2, crit: 2 }, ok: st => tmFound13(st) >= 12 });
ACHIEVEMENTS.push({ id: 'tm13_first', n: '第一個寶藏', d: '照著藏寶圖挖到寶藏。', cat: '探索', ok: st => tmFound13(st) >= 1 },
  { id: 'tm13_all', n: '藏寶圖大師', d: '找到全部 16 個寶藏。', cat: '探索', ok: st => tmFound13(st) >= TMAP_KEYS13.length });
GROW12.push(['藏寶圖', '萌芽鎮南邊的尋寶人巴克會送你第一張藏寶圖。打倒魔物偶爾會撿到別張（菁英比較常有）。站在 × 的地方按 A 挖，能挖到金錢、果實和秘傳之書。']);
