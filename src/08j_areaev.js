/* ===================== v20 區域事件: random events while exploring any field / dungeon with monsters =====================
   One event at a time, bound to the map it started on. Roughly one every ~250 steps (cooldown 120–220 steps, then 1/80 per step).
   魔物潮 · 流浪商人 · 可疑的寶箱 · 金色魔物 · 迷路的旅人 · 流星墜落 · 兇暴化魔物 · 區域天候 (沙塵暴 / 瘴氣濃霧 / 濃霧)
   Linked quests: 行商人的收藏 (3 星之碎片 → 行商人徽章), 寶箱怪獵人 (5 寶箱怪 → 寶箱怪之牙). */
const AEV = {
  surge: { n: '魔物潮', w: 3, dur: 80, d: '魔物大量出沒了！\n一段時間內更容易遇到魔物，經驗值和金錢+50%。', end: '魔物潮平息了。' },
  merchant: { n: '流浪商人', w: 2, dur: 150, minLv: 6, d: '附近出現了流浪商人！\n（他只會待一下子）', end: '流浪商人收拾好行李，離開了。' },
  mimic: { n: '可疑的寶箱', w: 2, dur: 150, d: '附近出現了一個可疑的寶箱……', end: '可疑的寶箱不知道什麼時候不見了。' },
  gold: { n: '金色魔物', w: 1.2, dur: 120, d: '有什麼金光閃閃的東西在附近跳來跳去！', end: '金色魔物跳走了……' },
  traveler: { n: '迷路的旅人', w: 1.5, dur: 150, d: '附近好像有人在求救。', end: '旅人好像自己找到路離開了。' },
  star: { n: '流星墜落', w: 1.3, dur: 200, outdoor: 1, d: '一道流星劃過天空，落在了%s！\n（星之碎片的光芒不會持續太久）', end: '星之碎片的光芒消失了……' },
  rage: { n: '兇暴化魔物', w: 1.5, dur: 150, minLv: 8, d: '一隻兇暴化的魔物出現了！\n（牠很強，但打倒牠可以得到珍貴的裝備）', end: '兇暴化的魔物不見了……' },
  weather: { n: '區域天候', w: 1.5, dur: 100, outdoor: 1, d: '', end: '天氣恢復了。' },
};
const WEATHER_OF = { canyon: ['沙塵暴', '颳起了沙塵暴！\n魔物變強了（Lv+2），但經驗值+40%。'], swamp: ['瘴氣濃霧', '瘴氣變濃了！\n魔物變強了（Lv+2），但經驗值+40%。'] };
const weatherOf = id => WEATHER_OF[id] || ['濃霧', '起霧了！\n魔物變強了（Lv+2），但經驗值+40%。'];
const aevName = A => A.k === 'weather' ? weatherOf(A.map)[0] : AEV[A.k].n;
const MERCHANT_POOL = ['superPotion', 'hiEther', 'elixir', 'powerFruit', 'tpBook', 'ether', 'awakening', 'parlyzHeal', 'antidote'];
const AEV_TREASURE = ['elixir', 'hiEther', 'powerFruit', 'superPotion', 'tpBook'];
const CHEST_IMG = spriteFrom(['................', '................', '................', '...kkkkkkkkkk...', '..kWWWWWWWWWWk..', '..kWwwwwwwwwWk..', '.kkkkkkkkkkkkkk.', '.kBBBBBYYBBBBBk.', '.kBbbbbYYbbbbBk.', '.kBbbbkYYkbbbBk.', '.kBbbbbkkbbbbBk.', '.kBBBBBBBBBBBBk.', '.kbbbbbbbbbbbbk.', '.kkkkkkkkkkkkkk.', '................', '................'],
  { k: '#3a2210', W: '#c8843a', w: '#9a5a24', B: '#b06a2a', b: '#8a4a1a', Y: '#f0d040' });
const STAR_IMG = spriteFrom(['................', '................', '.......Y........', '.......Y........', '......YWY.......', '..Y..YWWWY..Y...', '...YYWWWWWYY....', '....YWWWWWY.....', '...YYWWWWWYY....', '..Y..YWWWY..Y...', '......YWY.......', '.......Y........', '.......Y........', '................', '................', '................'],
  { Y: '#f8d860', W: '#fffbe8' });
GATHER_IMG.aevChest = CHEST_IMG; GATHER_IMG.aevStar = STAR_IMG;

const aevHere = ow => { const A = ow.st.aev; return A && A.map === ow.map.id ? A : null; };
function aevBand(ow) { const encs = ow.map.d.encounters || []; return encs.find(q => ow.p.y >= q.y0 && ow.p.y <= q.y1) || encs[0] || null; }
function aevLv(ow) { const e = aevBand(ow); if (!e) return ow.st.lv; return Math.round(e.table.reduce((s, r) => s + (r[1] + r[2]) / 2, 0) / e.table.length); }
function aevOk(ow) { const st = ow.st, m = ow.map; return !Game.noEnc && st.flags.license && st.flags.woke && st.lv >= 4 && (m.d.encounters || []).length && m.id !== 'rift'; }
function aevTile(ow, dmin, dmax) {
  const m = ow.map, sx = ow.p.x, sy = ow.p.y, seen = new Set([sx + ',' + sy]), q = [[sx, sy, 0]], out = [];
  while (q.length) { const [x, y, d] = q.shift(); if (d >= dmin && d <= dmax) out.push([x, y]); if (d >= dmax) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || nx < 1 || ny < 1 || nx >= m.w - 1 || ny >= m.h - 1) continue; seen.add(k); if (ow.solidAt(nx, ny) || ow.tileAt(nx, ny) === 'L' || m.doors[k]) continue; q.push([nx, ny, d + 1]); } }
  const ok = out.filter(([x, y]) => !ow.entityAt(x, y) && '#,.yfs:'.includes(ow.tileAt(x, y)));
  return ok.length ? pick(ok) : null;
}
function dirText(dx, dy) { const ns = dy < -2 ? '北' : dy > 2 ? '南' : '', ew = dx > 2 ? '東' : dx < -2 ? '西' : ''; return ew + ns ? ew + ns + '方' : '附近'; }
function aevSpawn(ow) {
  const A = aevHere(ow); if (!A || A.done) return; const tag = e => { e.aev = 1; return e; };
  ow.npcs = ow.npcs.filter(e => !e.aev); ow.items = ow.items.filter(e => !e.aev); ow.elites = ow.elites.filter(e => !e.aev);
  if (A.k === 'merchant') ow.npcs.push(tag(new Entity({ id: 'aevMerchant', x: A.x, y: A.y, dir: 'down', look: 'merchant', name: '流浪商人', frames: npcFrames('merchant') })));
  if (A.k === 'traveler' && !A.told) ow.npcs.push(tag(new Entity({ id: 'aevTraveler', x: A.x, y: A.y, dir: 'down', look: 'traveler', name: '迷路的旅人', frames: npcFrames('traveler') })));
  if (A.k === 'traveler' && A.told) ow.items.push(tag(new Entity({ id: 'aevTreasure', x: A.tx, y: A.ty, item: 'aev' })));
  if (A.k === 'mimic') ow.items.push(tag(new Entity({ id: 'aevChest', x: A.x, y: A.y, gather: 1, kind: 'aevChest' })));
  if (A.k === 'star') ow.items.push(tag(new Entity({ id: 'aevStar', x: A.x, y: A.y, gather: 1, kind: 'aevStar' })));
  if (A.k === 'gold' || A.k === 'rage') ow.elites.push(tag(new Entity({ id: 'aevMon', sp: A.sp, lv: A.lv, x: A.x, y: A.y, dir: A.dir || 'down', sight: A.k === 'rage' ? 4 : 0, home: [A.x, A.y, A.dir || 'down'], img: monsterMini(A.sp, 24), rage: A.k === 'rage' })));
}
function aevStart(ow, key) {
  const st = ow.st, lv = aevLv(ow), outdoor = !!ow.map.d.outdoor;
  const keys = Object.keys(AEV).filter(k => (!AEV[k].outdoor || outdoor) && (st.lv >= (AEV[k].minLv || 0)));
  let k = key; if (!k) { let r = Math.random() * keys.reduce((s, q) => s + AEV[q].w, 0); for (const q of keys) { r -= AEV[q].w; if (r <= 0) { k = q; break; } } k = k || keys[0]; }
  const A = { k, map: ow.map.id, until: (st.steps || 0) + AEV[k].dur, lv };
  if (['merchant', 'traveler', 'mimic', 'gold', 'rage'].includes(k)) { const t = aevTile(ow, 3, 7); if (!t) return false; [A.x, A.y] = t; }
  if (k === 'star') { const t = aevTile(ow, 10, 30) || aevTile(ow, 5, 12); if (!t) return false; [A.x, A.y] = t; }
  if (k === 'merchant') { const s = [...MERCHANT_POOL].sort(() => Math.random() - 0.5).slice(0, 5); A.stock = s; }
  if (k === 'mimic') A.real = chance(0.4);
  if (k === 'gold') { A.sp = 'goldSlime'; A.lv = lv; }
  if (k === 'rage') { const band = aevBand(ow); A.sp = band ? rollEnc(band)[0] : 'wolf'; A.lv = lv + 4; A.dir = ow.p.x < A.x ? 'left' : ow.p.x > A.x ? 'right' : ow.p.y < A.y ? 'up' : 'down'; }
  st.aev = A; st.aevSeen = (st.aevSeen || 0) + 1; aevSpawn(ow);
  const name = aevName(A); Game.aevBanner = { t: 0, name };
  ow.run((function* () { Sound.sfx('exclaim'); ow.p.excl = 30; yield* wait(30);
    let d = k === 'weather' ? weatherOf(A.map)[1] : AEV[k].d; if (k === 'star') d = d.replace('%s', '地圖的' + dirText(A.x - ow.p.x, A.y - ow.p.y));
    yield* say('【區域事件：' + name + '】\n' + d); })());
  return true;
}
function aevEnd(ow, quiet) {
  const st = ow.st, A = st.aev; if (!A) return; st.aev = null; st.aevNext = (st.steps || 0) + rnd(120, 220);
  ow.npcs = ow.npcs.filter(e => !e.aev); ow.items = ow.items.filter(e => !e.aev); ow.elites = ow.elites.filter(e => !e.aev);
  if (!quiet && !A.done && A.map === ow.map.id && !ow.script) ow.run(say(AEV[A.k].end));
}
// step hook: 魔物潮 doubles the encounter rate while it lasts
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () {
    const A = aevHere(this), encs = this.map.d.encounters || [], surge = A && A.k === 'surge';
    if (surge) for (const e of encs) e.rate *= 2;
    try { _os.call(this); } finally { if (surge) for (const e of encs) e.rate /= 2; }
    if (this.script) return; const st = this.st, s = st.steps || 0, B = st.aev;
    if (B) { if (B.map !== this.map.id || s > B.until) aevEnd(this, B.map !== this.map.id); return; }
    if (aevOk(this) && s >= (st.aevNext || 150) && chance(1 / 80)) aevStart(this);
  };
}
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, ...a) { _ld.call(this, id, ...a); const A = this.st.aev; if (A && A.map !== id) { this.st.aev = null; this.st.aevNext = (this.st.steps || 0) + rnd(120, 220); } else aevSpawn(this); }; }
// wild battles during 魔物潮 / 天候
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function (cfg, nr) {
    const A = aevHere(this); if (A && cfg.kind === 'wild' && !cfg.aevKind) { if (A.k === 'surge') cfg = { ...cfg, aevExp: 1.5, aevGold: 1.5 }; else if (A.k === 'weather') cfg = { ...cfg, lv: cfg.lv + 2, aevExp: 1.4 }; }
    return _bs.call(this, cfg, nr);
  };
}
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { const m = this.cfg.aevExp; yield* _ge.call(this, m ? Math.max(1, Math.floor(a * m)) : a); }; }
{ const _vi = Battle.prototype.victory; Battle.prototype.victory = function* () {
    yield* _vi.call(this); const c = this.cfg, st = Game.st, F = this.F;
    if (c.aevGold) { const g = Math.floor((SPECIES[F.sp].gold || 0) * F.lv * (c.aevGold - 1)); if (g > 0) { st.money += g; yield* this.msg('魔物潮加成：額外獲得' + g + ' G！'); } }
    if (c.aevLoot) { const pool = (Game.ow && Game.ow.map && Game.ow.map.d.gearPool) || []; if (pool.length) { const g = makeGear(classGear(pick(pool)), Math.max(c.aevLoot, rollLootQuality(false))); yield* this.lootShow(g, F.n + '留下了裝備！'); }
      const gg = F.lv * 40; st.money += gg; yield* this.msg('得到了' + gg + ' G！'); }
  };
}
// talking to / touching event entities
{ const _it = Overworld.prototype.interact; Overworld.prototype.interact = function () {
    const p = this.p, [dx, dy] = DIRS[p.dir], x = p.x + dx, y = p.y + dy;
    const e = [...this.npcs, ...this.items, ...this.elites].find(q => q.aev && q.x === x && q.y === y);
    if (e) { if (e.frames && !e.moving) e.dir = OPP[p.dir]; this.run(e.sp ? aevFight(this, e) : aevTalk(this, e)); return true; }
    return _it.call(this);
  };
}
{ const _et = Overworld.prototype.eliteTalk; Overworld.prototype.eliteTalk = function (e) { return e.aev ? aevFight(this, e) : _et.call(this, e); }; }
function* aevFight(ow, e) {
  const st = ow.st, A = st.aev; if (!A) return; const p = ow.p; p.dir = e.x < p.x ? 'left' : e.x > p.x ? 'right' : e.y < p.y ? 'up' : 'down'; e.dir = OPP[p.dir];
  const nm = SPECIES[e.sp].n; let res;
  if (A.k === 'gold') { yield* say('是' + nm + '！牠發現你了，想要逃走！'); res = yield* ow.battleScript({ sp: e.sp, lv: e.lv, kind: 'wild', aevKind: 'gold' }); }
  else { Sound.cry(Object.keys(SPECIES).indexOf(e.sp) + 1); yield* sayAll(['（' + nm + '的眼睛發出紅光……）', '兇暴化的' + nm + '撲了過來！']); res = yield* ow.battleScript({ sp: e.sp, lv: e.lv, kind: 'elite', id: 'aevRage', aevKind: 'rage', aevLoot: 3 }); }
  if (res === 'win' || A.k === 'gold') { A.done = 1; aevEnd(ow, true); if (res !== 'win' && A.k === 'gold') yield* say(nm + '跳走了……'); return; }
  const [hx, hy, hd] = e.home; e.x = e.tx = hx; e.y = e.ty = hy; e.px = hx * TS; e.py = hy * TS; e.dir = hd; e.moving = false; e.calmUntil = (st.steps || 0) + 30;
}
function* aevTalk(ow, e) {
  const st = ow.st, f = st.flags, A = st.aev; if (!A) return;
  if (e.id === 'aevMerchant') {
    if (!A.met) { A.met = 1; st.aevMet = (st.aevMet || 0) + 1; }
    if (!f.qMerchant) { f.qMerchant = 1; yield* sayAll(['嘿，冒險者！我是四處旅行的行商人。', '我在收集一種東西——「星之碎片」。流星掉下來的時候，偶爾撿得到。', '要是湊齊三個帶來給我，我就把公會的寶貝徽章讓給你！']); yield* say('（任務「行商人的收藏」開始了。）'); }
    else if (f.qMerchant === 1 && (st.bag.starShard || 0) >= 3 && (yield* yesNo('要把星之碎片×3交給行商人嗎？'))) {
      st.bag.starShard -= 3; if (!st.bag.starShard) delete st.bag.starShard; f.qMerchant = 2; const g = bpGift('merchantBadge', 4);
      yield* sayAll(['哇……三個都是上等貨！', '說好的，這個徽章給你。帶著它，好東西會自己找上門喔！']); yield* itemGet(st.name + '得到了' + g.txt + '！');
    }
    else yield* say(f.qMerchant === 2 ? '又見面了！今天也帶了好東西喔。' : '星之碎片還在收集嗎？湊齊三個再來找我！');
    yield* shopFlow(A.stock || MERCHANT_POOL.slice(0, 5)); return;
  }
  if (e.id === 'aevTraveler') {
    yield* sayAll(['啊……終於有人經過了。', '我在路上被魔物攻擊，受了傷，走不動了……']);
    const has = (st.bag.superPotion || 0) > 0 ? 'superPotion' : (st.bag.potion || 0) > 0 ? 'potion' : null;
    if (!has) { yield* say('……你身上也沒有傷藥嗎。沒關係，我休息一下就好……'); return; }
    if (!(yield* yesNo('要把' + ITEMS[has].n + '分給旅人嗎？'))) { yield* say('……這樣啊。'); return; }
    st.bag[has]--; if (!st.bag[has]) delete st.bag[has];
    const t = aevTile(ow, 8, 24) || aevTile(ow, 4, 10); if (!t) { st.money += A.lv * 60; yield* itemGet('旅人送了你' + A.lv * 60 + ' G當謝禮！'); A.done = 1; aevEnd(ow, true); return; }
    A.told = 1; [A.tx, A.ty] = t; A.until = (st.steps || 0) + 150;
    yield* sayAll(['謝謝你！傷口好多了。', '作為謝禮，告訴你一個秘密……', '我在這附近的' + dirText(A.tx - ow.p.x, A.ty - ow.p.y) + '，看到了一個被埋起來的寶物。趁別人發現之前去拿吧！']);
    aevSpawn(ow); return;
  }
  if (e.id === 'aevTreasure') {
    const it = pick(AEV_TREASURE), g = A.lv * 60; st.money += g; st.bag[it] = (st.bag[it] || 0) + 1; Sound.jingle('item');
    yield* itemGet(st.name + '挖出了旅人說的寶物：' + g + ' G和' + ITEMS[it].n + '！'); A.done = 1; aevEnd(ow, true); return;
  }
  if (e.id === 'aevStar') {
    const n = chance(0.25) ? 2 : 1; st.bag.starShard = (st.bag.starShard || 0) + n; Sound.jingle('item');
    yield* itemGet(st.name + '撿到了星之碎片' + (n > 1 ? '×' + n : '') + '！'); if (f.qMerchant === 1 && st.bag.starShard >= 3) yield* say('（湊齊三個了！下次遇到流浪商人時交給他吧。）');
    A.done = 1; aevEnd(ow, true); return;
  }
  if (e.id === 'aevChest') {
    if (!(yield* yesNo('一個可疑的寶箱。要打開嗎？'))) return;
    if (A.real) { const it = pick(AEV_TREASURE), g = A.lv * 50; st.money += g; st.bag[it] = (st.bag[it] || 0) + 1; Sound.jingle('item'); yield* itemGet('是真的寶箱！得到了' + g + ' G和' + ITEMS[it].n + '！'); A.done = 1; aevEnd(ow, true); return; }
    Sound.sfx('exclaim'); ow.p.excl = 30; yield* wait(20); Game.shake = 16; yield* say('寶箱張開了滿是牙齒的大嘴！是寶箱怪！');
    const res = yield* ow.battleScript({ sp: 'mimic', lv: A.lv + 2, kind: 'elite', id: 'aevMimic', aevKind: 'mimic', aevLoot: 2 });
    if (res !== 'win') { yield* say('寶箱怪跳著逃走了……'); A.done = 1; aevEnd(ow, true); return; }
    A.done = 1; aevEnd(ow, true);
    if (wonOf('mimic', st) >= 5 && !f.mimicHunter) { f.mimicHunter = 1; const g = bpGift('mimicTooth', 4); Sound.jingle('item'); yield* sayAll(['寶箱怪的嘴裡掉出了一顆發光的牙齒……', '這是打倒了五隻寶箱怪的證明！']); yield* itemGet(st.name + '得到了' + g.txt + '！'); }
  }
}
// the golden monster hops around; the rampaging one glows red
{ const _un = Overworld.prototype.updateNPCs; Overworld.prototype.updateNPCs = function () {
    _un.call(this);
    for (const e of this.elites) { if (!e.aev) continue; if (e.moving) { this.updateMove(e); continue; }
      if (!e.rage && !this.script && (this.t + e.x * 7) % 50 === 0) { const d = pick(['up', 'down', 'left', 'right']), [dx, dy] = DIRS[d], nx = e.x + dx, ny = e.y + dy;
        if (!this.solidAt(nx, ny) && !this.entityAt(nx, ny, e) && this.tileAt(nx, ny) !== 'L') { e.dir = d; this.startMove(e, nx, ny, 1); const A = aevHere(this); if (A) { A.x = nx; A.y = ny; } e.home = [nx, ny, d]; } } }
  };
}
{ const _dm = Overworld.prototype.drawMon; Overworld.prototype.drawMon = function (x, e, camX, camY) {
    if (e.aev) { const t = this.t, X = Math.round(e.px - camX + 8), Y = Math.round(e.py - camY + 14); x.globalAlpha = 0.35 + 0.15 * Math.sin(t / 6); pxEllipse(x, X, Y, 10, 4, e.rage ? '#ff3020' : '#ffe060'); x.globalAlpha = 1; }
    _dm.call(this, x, e, camX, camY);
  };
}
// banner + event badge + weather overlay
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    _dr.call(this, x); const A = aevHere(this), t = this.t;
    if (A && A.k === 'weather') {
      if (A.map === 'canyon') { x.fillStyle = 'rgba(200,150,80,0.22)'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(240,210,150,0.55)'; for (let i = 0; i < 40; i++) { const px = (i * 37 + t * 4) % (W + 20) - 10, py = (i * 53 + t * 1.5) % H; x.fillRect(Math.round(px), Math.round(py), 4, 1); } }
      else { x.fillStyle = A.map === 'swamp' ? 'rgba(90,50,120,0.25)' : 'rgba(220,225,235,0.22)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 4; i++) { const y = ((i * 71 + t * 0.3) % (H + 40)) - 20; x.fillStyle = A.map === 'swamp' ? 'rgba(160,120,200,0.12)' : 'rgba(255,255,255,0.12)'; x.fillRect(0, Math.round(y), W, 18); } }
    }
    if (A && !A.done) { const s = '事件：' + aevName(A) + ' ' + Math.max(0, A.until - (this.st.steps || 0)) + '步', w = Font.width(s, 9) + 10; drawPanel(x, W - w - 4, 24, w, 14, null); Font.draw(x, s, W - w + 1, 24, A.k === 'rage' ? '#ff8a70' : UIC.warm, UIC.textSh, 9); }
    const B = Game.aevBanner; if (B) { B.t++; if (B.t > 140) Game.aevBanner = null; else { const a = B.t < 10 ? B.t / 10 : B.t > 120 ? (140 - B.t) / 20 : 1; x.globalAlpha = a; const s = '區域事件　' + B.name, w = Font.width(s) + 24; drawPanel(x, (W - w) / 2, 44, w, 20, null); x.fillStyle = UIC.warm; x.fillRect((W - w) / 2 + 5, 49, 2, 10); Font.drawC(x, s, W / 2 + 3, 45, UIC.warm, UIC.textSh); x.globalAlpha = 1; } }
  };
}
{ const _eq = extraQuests; extraQuests = function (st, L) {
    _eq(st, L); const f = st.flags, A = st.aev;
    if (A && !A.done) L.push({ n: '區域事件', t: '【' + aevName(A) + '】' + (EXPLORE[A.map] || MAPS[A.map].name || '') + '（剩下' + Math.max(0, A.until - (st.steps || 0)) + '步）', done: false, rw: '限時' });
    if (f.qMerchant) L.push({ n: '行商人的收藏', t: f.qMerchant >= 2 ? '完成：把星之碎片交給了行商人。' : '收集星之碎片×3（' + Math.min(3, st.bag.starShard || 0) + '/3），交給流浪商人。流星墜落的區域事件中撿得到。', done: f.qMerchant >= 2, rw: '行商人徽章（淘金）' });
    const mw = wonOf('mimic', st); if (mw || f.mimicHunter) L.push({ n: '寶箱怪獵人', t: f.mimicHunter ? '完成：打倒了五隻寶箱怪。' : '打倒寶箱怪×5（' + mw + '/5）。可疑的寶箱有時候會是寶箱怪。', done: !!f.mimicHunter, rw: '寶箱怪之牙（連擊）' });
  };
}
