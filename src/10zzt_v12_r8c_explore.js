/* ===================== v12.0.8c 第八輪（三）：地標小事件・洞窟小機關（玩家在〈第八輪提案〉第二步 E、F 勾「照這樣做」） =====================
   E 地標小事件：28 處地標各一個小事件（已經有故事的 12 處不動）。地標旁邊有一個閃光點：能做的時候一閃一閃，條件不對的時候只偶爾微微發亮，
     靠近按 A 會說明（例如「聽說早晨的霧裡會有發光的東西」）；做完的「一次」事件就消失，「每天」的事件隔天再出現。
   F 洞窟小機關：13 個洞窟各一個機關，機關後面是一個多出來的寶箱房間；往洞窟之主的路不會被擋住。沒解開就離開的話，推錯的石頭、礦車回到原位。 */

/* ---------- shared helpers ---------- */
const tk12 = (x, y) => x + ',' + y;
function* gain12(list, gold = 0) { const st = Game.st, parts = [];
  for (const [k, n] of list) { st.bag[k] = (st.bag[k] || 0) + n; parts.push(ITEMS[k].n + (n > 1 ? '×' + n : '')); }
  if (gold) { st.money += gold; parts.push(gold + ' G'); }
  if (parts.length) yield* itemGet('得到了' + parts.join('、') + '！'); }
const phase12 = (st = Game.st) => dnOut12(st.map) ? dnPhase12(st) : 'day';
const wx12 = (st = Game.st) => typeof wxNow === 'function' ? wxNow(st) : null;
// screen position of a tile's centre (the day / night layer is drawn unzoomed)
function scr12(ow, wx, wy) { const z = ow._zc ? ZOOM_F : 1; let sx = wx - ow.camX, sy = wy - ow.camY; if (ow._zc) { sx = ow._zc[0] + (sx - ow._zc[0]) * z; sy = ow._zc[1] + (sy - ow._zc[1]) * z; } return [sx, sy, z]; }

/* =================== E. 地標小事件 =================== */
const LMEV12 = [
  { id: 'oak', map: 'route', lm: '老橡樹', kind: 'once', run: function* () { yield* sayAll(['老橡樹的樹根下，埋著一個生鏽的小鐵盒。', '裡面是一封很久以前的信：\n「給下一個走過這條路的旅人。這條路很長，但你不是一個人。」', '信的下面壓著一些錢。']); yield* gain12([], 500); } },
  { id: 'mist', map: 'route', lm: '霧之窪地', kind: 'daily', cond: st => phase12(st) === 'dawn', hint: '窪地裡積著淡淡的霧。\n聽說早晨的霧裡，會有發光的東西。',
    run: function* () { yield* say('霧裡的露珠閃著微光……收集起來吧。'); yield* gain12([['manaPotion', 1]]); } },
  { id: 'flower', map: 'route', lm: '野花坡', kind: 'daily', run: function* () { const st = Game.st, S = heroStats(st); st.hp = Math.min(S.hp, st.hp + Math.ceil(S.hp / 2)); st.mp = Math.min(S.mp, (st.mp || 0) + Math.ceil(S.mp / 2)); Sound.jingle('heal');
    yield* sayAll(['在花叢裡坐下來，休息了一會兒。', '風裡有花的香味。HP 和 MP 回復了一半！']); } },
  { id: 'mill', map: 'windHills', lm: '三座風車', at: [42, 6], kind: 'once', cond: st => wx12(st) === 'storm', hint: '第三座風車的頂上，好像卡著一個麻袋。\n要是颳起暴風雨，說不定會掉下來。',
    run: function* () { yield* sayAll(['暴風雨中，第三座風車轉得飛快——', '「咚！」一個麻袋從風車頂上掉了下來！', '裡面裝著錢。大概是很久以前藏在上面的。']); yield* gain12([], 1000); } },
  { id: 'pasture', map: 'windHills', lm: '牧草坡', kind: 'once', cond: st => phase12(st) !== 'night', hint: '羊群都睡著了。白天再來吧。',
    run: function* () { yield* sayAll(['吹了一聲口哨——', '捲毛羊們跑了過來，在你身上蹭來蹭去。', '羊群跑走之後，地上留下了一團毛。']); yield* gain12([['beastFur', 3]]); } },
  { id: 'falls', map: 'jadeCreek', lm: '白練瀑布', kind: 'once', run: function* () { yield* sayAll(['瀑布後面有一個小洞！', '洞裡藏著一個寶箱。']); yield* gain12([['trainBook', 1]]); } },
  { id: 'bottle', map: 'jadeCreek', lm: '溪中沙洲', kind: 'once', run: function* () { yield* sayAll(['沙洲上有一個被沖上岸的瓶子，裡面塞著一封信。', '「撿到這封信的人：請拿去買點好吃的。」']); yield* gain12([], 300); } },
  { id: 'shrine', map: 'jadeCreek', lm: '碧溪下游', kind: 'daily', run: function* () { yield* sayAll(['水神的小祠。祠前的碗裡，放著前人留下的東西。', '（拿一點，也留一點給下一個人吧。）']); yield* gain12([['manaHerb', 2]]); } },
  { id: 'bigtree', map: 'forest', lm: '千年巨木', kind: 'once', cond: st => phase12(st) === 'night', hint: '粗大的樹幹上，刻著很多人的名字。樹上有一個大樹洞。\n聽說晚上樹洞會發光。',
    run: function* () { yield* sayAll(['樹洞裡發著淡淡的光……', '裡面放著一個小布包，是以前的旅人留下的。']); yield* gain12([['superPotion', 2]]); } },
  { id: 'ring', map: 'forest', lm: '蘑菇圈', kind: 'once', step: 1, run: function* (ow) { yield* say('踏進了蘑菇圈——'); const p = ow.p, D = ['down', 'left', 'up', 'right'];
    for (let i = 0; i < 12; i++) { p.dir = D[i % 4]; yield* wait(5); } yield* sayAll(['頭好暈……轉了一圈、兩圈、三圈……', '回過神來，口袋裡多了些東西。']); yield* gain12([['shroomCap', 3]]); } },
  { id: 'pillars', map: 'canyon', lm: '岩柱林', kind: 'once', cond: st => wx12(st) === 'sand', hint: '岩柱的縫裡卡著一些砂。\n聽說沙塵暴的時候會發光。',
    run: function* () { yield* sayAll(['沙塵暴吹過岩柱，縫裡的砂閃閃發光。', '收集了發亮的砂。']); yield* gain12([['sandCrystal', 3]]); } },
  { id: 'riverbed', map: 'canyon', lm: '乾河床', kind: 'daily', run: function* () { yield* say('挖了挖河床的沙……'); const r = Math.random();
    if (r < 0.4) yield* gain12([['stone', 2]]); else if (r < 0.7) yield* gain12([['sandCrystal', 1]]); else yield* gain12([], 300); } },
  { id: 'reeds', map: 'lake', lm: '蘆葦蕩', kind: 'daily', cond: st => phase12(st) === 'night', hint: '風吹過蘆葦，沙沙作響。\n晚上這裡會有螢光。',
    run: function* () { yield* sayAll(['蘆葦裡飄著螢光。搖一搖——', '月露落了下來！']); yield* gain12([['moonDew', 2]]); } },
  { id: 'pier', map: 'lake', lm: '舊碼頭', kind: 'once', run: function* () { yield* sayAll(['木樁上綁著一艘破船。船裡有漁夫的工具箱。', '工具箱裡還有幾瓶傷藥。']); yield* gain12([['superPotion', 3]]); } },
  { id: 'lantern', map: 'swamp', lm: '枯樹林', kind: 'once', run: function* () { Game.st.flags.lmLantern12 = 1; Sound.sfx('item');
    yield* sayAll(['枯樹上吊著一盞舊燈籠。', '……是驅霧燈的燈籠？拿去給守燈人看看吧。']); } },
  { id: 'float', map: 'swamp', lm: '浮木小徑', kind: 'daily', run: function* () { const st = Game.st; st.mp = heroStats(st).mp; Sound.jingle('heal');
    yield* sayAll(['走到浮木的盡頭，水面映出了一條街道。', '……是故鄉的街道。便利商店的燈還亮著。', '眨了眨眼，水面又只剩下沼澤的倒影。', '不知道為什麼，心裡平靜了下來。MP 全部回復了。']); } },
  { id: 'bridge', map: 'maplePass', lm: '楓林吊橋', kind: 'once', cond: st => wx12(st) === 'storm', hint: '吊橋很穩。橋板下面好像卡著什麼，手搆不到……\n要是橋晃起來就好了。',
    run: function* () { yield* sayAll(['雷雨中吊橋搖得很厲害——', '橋板下卡著的錢包掉了出來！']); yield* gain12([], 800); } },
  { id: 'inn', map: 'maplePass', lm: '燒毀的驛站', kind: 'once', run: function* () { yield* sayAll(['灰燼裡找到了驛站的帳本。', '最後一頁寫著：「今晚盜賊來了。客人先逃，帳本我帶不走了。」', '帳本下面壓著一個藥箱。']); yield* gain12([['superPotion', 2]]); } },
  { id: 'wall', map: 'oldField', lm: '斷牆', kind: 'once', run: function* () { Game.st.flags.lmRub12 = 1; Sound.sfx('item');
    yield* sayAll(['牆上刻著五百年前士兵的名字。', '用紙把名字拓了下來。拿去給老兵杜克看看吧。']); } },
  { id: 'trench', map: 'oldField', lm: '舊壕溝', kind: 'once', cond: st => phase12(st) === 'night', hint: '長長的壕溝，什麼都沒有……\n晚上再來看看？',
    run: function* () { yield* sayAll(['壕溝裡有一枚發著光的生鏽勳章。', '勳章的背面黏著幾塊鏽鐵片。']); yield* gain12([['rustScrap', 3]]); } },
  { id: 'outpost', map: 'northRoad', lm: '廢棄哨站', kind: 'once', run: function* (ow) {
    if (!(yield* yesNo('哨站的信號鐘還掛著。要敲響它嗎？'))) return false;
    Sound.sfx('exclaim'); yield* sayAll(['噹——噹——！', '魔物群衝過來了！']); const z = (MAPS.northRoad.encounters || [])[0], T = z ? z.table : [['roadBandit', 22, 24, 1]], r = () => T[Math.floor(Math.random() * T.length)];
    const a = r(), b = r(), c = r(), res = yield* ow.battleScript({ sp: a[0], lv: a[2], kind: 'wild', extra: [[b[0], b[2]], [c[0], c[2]]] });
    if (res !== 'win') return false; yield* say('在哨站的箱子裡，找到了哨兵留下的補給。'); yield* gain12([['megaPotion', 2]]); } },
  { id: 'sign', map: 'northRoad', lm: '三岔路口', kind: 'once', run: function* () { const st = Game.st; st.flags.lmSign12 = dnDay12(st) + 2; Sound.sfx('rock');
    yield* sayAll(['路標被轉到了奇怪的方向……是盜賊做的吧。', '把路標轉回原本的方向了。']); } },
  { id: 'maze', map: 'goldPlains', lm: '麥田迷路', kind: 'once', run: function* () { yield* sayAll(['麥田最裡面，有人藏了一個木箱。', '……這就是洛蒂說的那個吧？']); yield* gain12([['wheat', 5]], 2000); } },
  { id: 'icicle', map: 'frostField', lm: '冰柱林', kind: 'once', run: function* () { yield* sayAll(['冰柱裡凍著一把舊劍，劍柄上刻著曙光軍的徽記。', '劍拔不出來……但冰柱旁邊散落著冰晶。']); yield* gain12([['iceCrystal', 3]]); } },
  { id: 'icefall', map: 'frostField', lm: '凍結的瀑布', kind: 'daily', cond: st => wx12(st) === 'clear', hint: '冰瀑在灰色的天空下，一動也不動。\n晴天的時候，陽光會照在上面。',
    run: function* () { const st = Game.st; st.rainbowUntil = (st.steps || 0) + 100; Sound.sfx('levelUp'); yield* sayAll(['陽光照在冰瀑上，出現了彩色的光！', '（之後 100 步內，戰鬥經驗值 +20%）']); } },
  { id: 'obsidian', map: 'emberPass', lm: '黑曜石坡', kind: 'once', run: function* (ow) { Sound.sfx('exclaim'); yield* say('黑曜石映出的影子……動了起來！');
    const res = yield* ow.battleScript({ sp: SPECIES.obsidianChunk ? 'obsidianChunk' : 'magmaSlime', lv: 32, kind: 'wild', solo: 1 }); if (res !== 'win') return false;
    yield* say('影子散開了，地上留下了熔岩石。'); yield* gain12([['magmaStone', 3]]); } },
  { id: 'lavabridge', map: 'emberPass', lm: '熔岩河石橋', kind: 'once', run: function* () { yield* sayAll(['橋邊的石碑上寫著：', '「這座橋是一個石匠花了二十年蓋的。他說：只要有人要過河，橋就該在那裡。」', '石碑腳下放著幾塊熔岩石。']); yield* gain12([['magmaStone', 2]]); } },
];
const LMEV_BY12 = {}; for (const E of LMEV12) (LMEV_BY12[E.map] || (LMEV_BY12[E.map] = [])).push(E);
const lmDone12 = (E, st = Game.st) => { const v = (st.lmEv12 || {})[E.id]; return E.kind === 'once' ? !!v : v === dnDay12(st); };
const lmOk12 = (E, st = Game.st) => !E.cond || E.cond(st);
// the spot: the landmark's centre or the closest free floor next to it (worked out the first time the map is loaded)
Overworld.prototype.lmSpots12 = function () { const id = this.map.id, L = LMEV_BY12[id]; if (!L) return []; const out = [];
  for (const E of L) { if (!E.spot) { const lm = (LANDMARK12[id] || []).find(l => l.n === E.lm); if (!lm) continue; const [cx, cy] = E.at || [lm.x, lm.y]; let best = null;
      for (let r = 0; r <= 3 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = cx + dx, y = cy + dy;
        if (this.solidAt(x, y) || this.map.doors[tk12(x, y)] || (this.map.d.npcs || []).some(n => n.x === x && n.y === y) || (this.map.d.items || []).some(n => n.x === x && n.y === y)) continue; best = [x, y]; break; }
      E.spot = best || [cx, cy]; }
    out.push(E); }
  return out; };
function* lmRun12(ow, E) { const st = Game.st;
  if (lmDone12(E, st)) { yield* say(E.kind === 'once' ? '這裡已經沒有什麼了。' : '今天已經來過了。明天再來吧。'); return; }
  if (!lmOk12(E, st)) { yield* say(E.hint || '……'); return; }
  const r = yield* E.run(ow); if (r === false) return; (st.lmEv12 || (st.lmEv12 = {}))[E.id] = E.kind === 'once' ? 1 : dnDay12(st); }
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { const p = this.p, [dx, dy] = DIRS[p.dir];
    for (const E of this.lmSpots12()) { if (E.step) continue; const [x, y] = E.spot; if ((x === p.x + dx && y === p.y + dy) || (x === p.x && y === p.y)) { this.run(lmRun12(this, E)); return true; } }
    return _in.call(this); }; }
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () { _os.call(this); if (this.script) return; const p = this.p;
    for (const E of this.lmSpots12()) if (E.step && E.spot[0] === p.x && E.spot[1] === p.y && !lmDone12(E)) { this.run(lmRun12(this, E)); return; } }; }
// 三岔路口: a traveller's thank-you comes a couple of days later
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { const r = _ld.apply(this, a), st = this.st, due = st && st.flags && st.flags.lmSign12;
    if (due && due > 1 && dnDay12(st) >= due && !this.script) { st.flags.lmSign12 = 1; const ow = this;
      this.run((function* () { yield* wait(16); yield* sayAll(['一隻信鴿飛了過來，腳上綁著一封信：', '「謝謝你把三岔路口的路標轉回來，我才沒有迷路。」——一位旅人']); yield* gain12([], 1500); })()); }
    return r; }; }
// 枯樹林 → 守燈人, 斷牆 → 老兵杜克
if (Events.lampKeeper) { const _lk = Events.lampKeeper; Events.lampKeeper = function* (ow, ...a) { const f = Game.st.flags;
    if (f.lmLantern12 === 1) { f.lmLantern12 = 2; yield* sayAll(['這是……以前掛在枯樹林的燈籠！', '那裡原本也有一座驅霧燈。謝謝你把它帶回來。', '這是一點心意，收下吧。']); yield* gain12([], 1500); return; }
    return yield* _lk.call(this, ow, ...a); }; }
if (Events.oldDuke) { const _dk = Events.oldDuke; Events.oldDuke = function* (ow, ...a) { const f = Game.st.flags;
    if (f.lmRub12 === 1) { f.lmRub12 = 2; yield* sayAll(['這是……古戰場斷牆上的名字。', '……我認得這個名字。小時候聽老人講過，他守住了城門。', '謝謝你。這本書你拿去吧，我已經用不到了。']); yield* gain12([['trainBook', 1]]); return; }
    return yield* _dk.call(this, ow, ...a); }; }
// 大水車: the existing wheel stops at night
{ const _wh = Events.wheel6; const E = { id: 'wheel', kind: 'once', cond: st => phase12(st) === 'night',
    run: function* () { yield* sayAll(['晚上，大水車停了下來。', '水車下面露出了一個小洞，洞裡有一個瓶子。']); yield* gain12([['elixir', 1]]); } };
  LMEV12.push({ ...E, map: 'goldPlains', lm: '大水車', npc: 1 });
  Events.wheel6 = function* (ow) { const st = Game.st; if (!lmDone12(E, st) && lmOk12(E, st)) { yield* E.run(); (st.lmEv12 || (st.lmEv12 = {})).wheel = 1; return; }
    yield* say(lmDone12(E, st) ? '大水車慢慢地轉著，把河水一勺一勺送進麥田。' : '大水車慢慢地轉著，把河水一勺一勺送進麥田。\n（聽說晚上水車會停下來。）'); }; }
LMEV_BY12.goldPlains = LMEV_BY12.goldPlains.filter(E => !E.npc);
// the glints: bright when it can be done now, a faint flicker when the time / weather is not right, nothing when done
function lmDraw12(ow, x) { const L = ow.lmSpots12(); if (!L.length) return; const st = ow.st;
  for (const E of L) { if (lmDone12(E, st)) continue; const ok = lmOk12(E, st), [sx, sy, z] = scr12(ow, E.spot[0] * 16 + 8, E.spot[1] * 16 + 9); if (sx < -10 || sy < -10 || sx > W + 10 || sy > H + 10) continue;
    const ph = (ow.t + E.spot[0] * 13) % (ok ? 50 : 140); if (!ok && ph > 24) continue;
    const k = ok ? 0.55 + 0.45 * Math.sin(ph / 50 * TAU) : Math.sin(ph / 24 * Math.PI) * 0.55, r = (ok ? 5 : 3.5) * z * (0.7 + 0.3 * k);
    x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = Math.max(0, k);
    const gr = x.createRadialGradient(sx, sy, 0, sx, sy, r * 2.2); gr.addColorStop(0, 'rgba(255,250,200,0.8)'); gr.addColorStop(1, 'rgba(255,240,160,0)'); x.fillStyle = gr; x.fillRect(sx - r * 2.2, sy - r * 2.2, r * 4.4, r * 4.4);
    x.fillStyle = '#fffbe0'; x.fillRect(Math.round(sx - r), Math.round(sy), Math.round(r * 2), 1); x.fillRect(Math.round(sx), Math.round(sy - r), 1, Math.round(r * 2)); x.restore(); } }

/* =================== F. 洞窟小機關 =================== */
// each cave: the extra room (carved out of the rock), the chest, and the puzzle's own pieces. Coordinates are the cave's tiles.
const CP12 = {
  cave6_route: { kind: 'dark', room: [[15, 2, 3, 3], [16, 5, 1, 1]], gate: [[16, 5, 'hidden']], chest: [16, 2, 'trainBook', 1], torches: [[4, 8], [18, 11], [2, 12]] },
  cave6_windHills: { kind: 'boulder', room: [[14, 3, 3, 3], [14, 6, 1, 2]], pits: [[14, 7], [14, 6]], boulders: [[14, 9], [12, 9]], clear: [[11, 9], [13, 9], [14, 8], [14, 10], [13, 10]], chest: [15, 4, 'trainBook', 1] },
  cave6_jadeCreek: { kind: 'sluice', room: [[15, 3, 3, 3], [16, 6, 1, 2]], gate: [[16, 7, 'water'], [16, 6, 'water']], lever: [18, 9], clear: [[17, 9], [16, 8]], chest: [16, 4, 'hiEther', 2] },
  cave6_forest: { kind: 'roots', room: [[15, 2, 3, 3], [16, 5, 1, 1]], gate: [[16, 5, 'roots']], wallTorch: [8, 17], chest: [16, 3, 'trainBook', 1] },
  cave6_canyon: { kind: 'wind', room: [[15, 2, 4, 2], [17, 4, 1, 4]], wind: [[17, 7], [17, 6], [17, 5], [17, 4]], windFrom: [17, 8], chest: [15, 2, 'elixir', 1] },
  cave6_lake: { kind: 'mirror', room: [[1, 3, 2, 3], [2, 6, 1, 1]], gate: [[2, 6, 'door']], source: [17, 8], mirrors: [[3, 8, 1], [3, 7, 3]], crest: [1, 7], clear: [[4, 8], [4, 7], [2, 7], [3, 9], [2, 8], [4, 9]], chest: [1, 4, 'trainBook', 1] }, // v12.0.9n: the mirrors moved one tile west — (4,7) was the only way north (to 月光洞之主) and the mirror blocked it
  cave6_swamp: { kind: 'logs', room: [[15, 2, 3, 6]], logs: { safe: [[16, 7], [16, 6], [15, 6], [15, 5], [15, 4]], fake: [[15, 7], [17, 7], [17, 6], [16, 5], [17, 5], [16, 4], [17, 4]] }, back: [16, 8], fall: 'mud', chest: [17, 2, 'elixir', 1] },
  cave6_maplePass: { kind: 'cart', room: [[15, 2, 3, 3], [16, 5, 1, 3]], gate: [[16, 5, 'rubble']], rails: [[16, 8], [16, 7], [16, 6], [16, 5]], cart: [16, 8], clear: [[16, 9]], chest: [16, 3, 'trainBook', 1] },
  cave6_oldField: { kind: 'plates', room: [[17, 2, 3, 3], [18, 5, 1, 1]], gate: [[18, 5, 'door']], plates: [[4, 8], [1, 11], [16, 13]], chest: [18, 2, 'megaPotion', 3] },
  cave6_northRoad: { kind: 'password', room: [[15, 2, 3, 3], [16, 5, 1, 1]], gate: [[16, 5, 'bandit']], note: [1, 13], chest: [16, 2, null, 2000] },
  cave6_goldPlains: { kind: 'logs', room: [[15, 2, 3, 6]], logs: { safe: [[17, 7], [17, 6], [16, 6], [16, 5], [16, 4]], fake: [[15, 7], [16, 7], [15, 6], [15, 5], [17, 5], [15, 4], [17, 4]] }, back: [16, 8], fall: 'floor', chest: [15, 2, 'elixir', 2] },
  cave6_frostField: { kind: 'ice', room: [[15, 2, 4, 4]], ice: [15, 2, 4, 4], rocks: [[16, 3]], chest: [18, 2, 'trainBook', 1] },
  cave6_emberPass: { kind: 'lava', room: [[17, 2, 3, 3], [18, 5, 1, 3]], gate: [[18, 7, 'lava'], [18, 6, 'lava'], [18, 5, 'lava']], lever: [20, 9], clear: [[19, 9], [18, 8]], chest: [18, 2, 'elixir', 2] },
};
// v12.0.8c fix: in 晨霧洞・月光洞・黑羽的藏身洞 a decorative rock ('o') sat in the only way through, so the lord could not be reached.
// Rocks that cut the cave in two are taken away (only those).
function caveUnchoke12(id) { const d = MAPS[id]; if (!d) return 0; const rows = d.rows.map(r => [...r]), H = rows.length, Wd = rows[0].length, solid = c => SOLID.has(c); let fixed = 0;
  let start = d.exit ? [d.exit.x, d.exit.y] : null;
  if (!start) { const seen = new Set(); let best = 0; // a field: start from the biggest open area
    for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) { if (seen.has(tk12(x, y)) || solid(rows[y][x])) continue; let n = 0; const q = [[x, y]]; seen.add(tk12(x, y));
      while (q.length) { const [a, b] = q.shift(); n++; for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const nx = a + dx, ny = b + dy, k = tk12(nx, ny); if (nx < 0 || ny < 0 || nx >= Wd || ny >= H || seen.has(k) || solid(rows[ny][nx])) continue; seen.add(k); q.push([nx, ny]); } }
      if (n > best) { best = n; start = [x, y]; } } }
  if (!start) return 0;
  for (let guard = 0; guard < 20; guard++) { const seen = new Set([tk12(start[0], start[1])]), q = [[start[0], start[1]]];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const nx = x + dx, ny = y + dy, k = tk12(nx, ny); if (nx < 0 || ny < 0 || nx >= Wd || ny >= H || seen.has(k) || solid(rows[ny][nx])) continue; seen.add(k); q.push([nx, ny]); } }
    let changed = false;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < Wd - 1; x++) { if (rows[y][x] !== 'o') continue; const nb = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => !solid(rows[b][a]));
      if (nb.some(([a, b]) => seen.has(tk12(a, b))) && nb.some(([a, b]) => !seen.has(tk12(a, b)))) { rows[y][x] = 's'; changed = true; fixed++; } }
    if (!changed) break; }
  if (fixed) d.rows = rows.map(r => r.join('')); return fixed; }
for (const id in CP12) caveUnchoke12(id);
// pickups that stood in a one-tile passage (or on a puzzle's spot) are moved to the nearest spot that blocks nothing
function cavePickups12(id, P) { const d = MAPS[id]; if (!d || !d.exit) return; const rows = d.rows, H = rows.length, Wd = rows[0].length;
  const busy = new Set([...(P.clear || []), ...(P.boulders || []), ...(P.torches || []), ...(P.plates || []), ...(P.mirrors || []), ...(P.rails || []), P.lever, P.note, P.source, P.cart].filter(Boolean).map(q => tk12(q[0], q[1])));
  const occ = () => new Set([...(d.items || []), ...(d.gathers || []), ...(d.elites || [])].map(q => tk12(q.x, q.y)));
  const reach = blocked => { const seen = new Set([tk12(d.exit.x, d.exit.y)]), q = [[d.exit.x, d.exit.y]]; while (q.length) { const [x, y] = q.shift();
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const nx = x + dx, ny = y + dy, k = tk12(nx, ny); if (nx < 0 || ny < 0 || nx >= Wd || ny >= H || seen.has(k) || blocked.has(k) || SOLID.has(rows[ny][nx])) continue; seen.add(k); q.push([nx, ny]); } } return seen.size; };
  const full = reach(new Set());
  for (const it of [...(d.items || []), ...(d.gathers || [])]) { const k0 = tk12(it.x, it.y); if (!busy.has(k0) && reach(new Set([k0])) >= full - 1) continue;
    const seen = new Set([k0]), q = [[it.x, it.y]], O = occ(); let to = null;
    while (q.length && !to) { const [x, y] = q.shift(); for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) { const nx = x + dx, ny = y + dy, k = tk12(nx, ny); if (nx < 1 || ny < 1 || nx >= Wd - 1 || ny >= H - 1 || seen.has(k) || SOLID.has(rows[ny][nx])) continue; seen.add(k); q.push([nx, ny]);
        if (!busy.has(k) && !O.has(k) && !(P.area && P.area.has(k)) && !(d.exit.x === nx && d.exit.y === ny) && reach(new Set([k])) >= full - 1) { to = [nx, ny]; break; } } }
    if (to) { it.x = to[0]; it.y = to[1]; } } }
for (const id of ['jadeCreek', 'forest']) if (caveUnchoke12(id) && typeof mapCache !== 'undefined') delete mapCache[id];
// carve the rooms, add the chests, list every puzzle tile (wandering monsters keep out of them)
for (const id in CP12) { const P = CP12[id], d = MAPS[id]; if (!d) continue; const rows = d.rows.map(r => [...r]), area = new Set();
  for (const [x0, y0, w, h] of P.room) for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { rows[y][x] = 's'; area.add(tk12(x, y)); }
  d.rows = rows.map(r => r.join(''));
  const [cx, cy, item, n] = P.chest; d.items = (d.items || []).concat([item ? { id: 'cp12_' + id, x: cx, y: cy, item, n } : { id: 'cp12_' + id, x: cx, y: cy, gold: n }]);
  for (const k of ['torches', 'pits', 'boulders', 'wind', 'mirrors', 'rails', 'plates']) for (const q of P[k] || []) area.add(tk12(q[0], q[1]));
  for (const q of [P.lever, P.wallTorch, P.source, P.crest, P.cart, P.note, P.windFrom]) if (q) area.add(tk12(q[0], q[1]));
  if (P.logs) for (const q of [...P.logs.safe, ...P.logs.fake]) area.add(tk12(q[0], q[1]));
  P.area = area; P.gates = Object.fromEntries((P.gate || []).map(([x, y, k]) => [tk12(x, y), k]));
  if (P.logs) { P.safe = new Set(P.logs.safe.map(q => tk12(q[0], q[1]))); P.fake = new Set(P.logs.fake.map(q => tk12(q[0], q[1]))); }
  if (P.ice) { const [x0, y0, w, h] = P.ice; P.iceSet = new Set(); for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) P.iceSet.add(tk12(x, y)); P.rockSet = new Set((P.rocks || []).map(q => tk12(q[0], q[1]))); }
  cavePickups12(id, P);
  if (typeof mapCache !== 'undefined') delete mapCache[id]; }
const cpSt12 = (id, st = Game.st) => { const C = st.cp12 || (st.cp12 = {}); return C[id] || (C[id] = {}); };
const cpOf12 = ow => ow && ow.map && CP12[ow.map.id] ? CP12[ow.map.id] : null;
// the moving pieces start over when you come back without having solved it
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, ...a) { const r = _ld.call(this, id, ...a), P = CP12[id];
    if (P) { const S = cpSt12(id); this.cp12 = { b: (P.boulders || []).map(q => [...q]), filled: new Set(S.solved ? (P.pits || []).map(q => tk12(q[0], q[1])) : []), cart: S.solved ? null : P.cart ? [...P.cart] : null, gust: 0, t: 0 };
      if (S.solved) this.cp12.b = []; if (P.mirrors && !S.mir) S.mir = P.mirrors.map(q => (q[2] + 2) % 4); }
    else this.cp12 = null; return r; }; }
const cpSolved12 = (P, ow) => !!cpSt12(ow.map.id).solved;
function cpSolve12(ow, msg) { const S = cpSt12(ow.map.id); if (S.solved) return; S.solved = 1; Game.st.cpN12 = Object.values(Game.st.cp12).filter(q => q.solved).length; Sound.jingle('item'); return msg; }
// tiles: a closed gate is rock to walk on; pieces that stand on the floor are solid
{ const _ta = Overworld.prototype.tileAt; Overworld.prototype.tileAt = function (x, y) { const c = _ta.call(this, x, y), P = cpOf12(this); if (!P || !this.cp12) return c; const k = tk12(x, y), S = cpSt12(this.map.id), Q = this.cp12;
    if (P.gates[k] && !S.solved) return P.gates[k] === 'water' ? 'W' : 'R';
    if (P.kind === 'boulder') { if (Q.b.some(b => b[0] === x && b[1] === y)) return 'R'; if ((P.pits || []).some(q => q[0] === x && q[1] === y) && !Q.filled.has(k)) return 'R'; }
    if (P.kind === 'cart' && Q.cart && Q.cart[0] === x && Q.cart[1] === y) return 'R';
    if (P.kind === 'ice' && P.rockSet.has(k)) return 'R';
    if (P.lever && P.lever[0] === x && P.lever[1] === y) return 'R';
    if (P.note && P.note[0] === x && P.note[1] === y && !S.note) return 'R';
    if (P.torches && P.torches.some(q => q[0] === x && q[1] === y)) return 'R';
    if (P.mirrors && P.mirrors.some(q => q[0] === x && q[1] === y)) return 'R';
    return c; }; }
{ const _rf = Overworld.prototype.roamFree12; Overworld.prototype.roamFree12 = function (x, y, e) { const P = cpOf12(this); if (P && P.area.has(tk12(x, y))) return false; return _rf.call(this, x, y, e); }; }

/* ---------- F: what each piece does ---------- */
const MIR_OK12 = [1, 3]; // 鏡子要轉到的方向
function cpBeam12(P, S) { // the moonbeam's tiles, as far as it gets: [[x, y, 'h' | 'v' | 'c']]
  const out = [], [sx, sy] = P.source, [ax, ay] = P.mirrors[0], [bx, by] = P.mirrors[1];
  for (let x = sx; x > ax; x--) out.push([x, sy, 'h']); out.push([ax, ay, 'c']); if (S.mir[0] !== MIR_OK12[0]) return { tiles: out, done: false };
  for (let y = ay - 1; y > by; y--) out.push([ax, y, 'v']); out.push([bx, by, 'c']); if (S.mir[1] !== MIR_OK12[1]) return { tiles: out, done: false };
  for (let x = bx - 1; x > P.crest[0]; x--) out.push([x, by, 'h']); return { tiles: out, done: true }; }
function* cpInteract12(ow, P, x, y) { const S = cpSt12(ow.map.id), st = Game.st, is = q => q && q[0] === x && q[1] === y;
  if (P.torches) { const i = P.torches.findIndex(is); if (i >= 0) { const L = S.lit || (S.lit = []); if (L.includes(i)) { yield* say('火把燒得很旺。'); return; }
      L.push(i); Sound.sfx('charge'); if (L.length < P.torches.length) { yield* say('點亮了火把。（還有 ' + (P.torches.length - L.length) + ' 支）'); return; }
      cpSolve12(ow); yield* sayAll(['點亮了最後一支火把——洞裡亮了起來！', '岩壁上露出了一條本來看不到的路。']); return; } }
  if ((P.kind === 'sluice' || P.kind === 'lava') && is(P.lever)) { if (S.solved) { yield* say('拉桿已經拉下來了。'); return; }
    if (!(yield* yesNo(P.kind === 'sluice' ? '牆上有一根生鏽的拉桿。旁邊寫著「水閘」。要拉下來嗎？' : '岩壁上有一根拉桿。要拉下來嗎？'))) return;
    Sound.sfx('rock'); ow.shake = 12; cpSolve12(ow); yield* say(P.kind === 'sluice' ? '嘎啦嘎啦……水閘打開，水慢慢退掉了！\n淹在水下的通道露了出來。' : '轟隆隆……熔岩裡升起了一座石橋！'); return; }
  if (P.kind === 'roots' && is(P.wallTorch)) { if (S.torch || S.solved) { yield* say('牆上的火把座空著。'); return; } S.torch = 1; Sound.sfx('item'); yield* say('從牆上取下了火把。'); return; }
  if (P.kind === 'roots' && P.gates[tk12(x, y)] && !S.solved) { if (!S.torch) { yield* say('粗大的樹根擋住了路……\n用火燒得掉嗎？'); return; }
    Sound.sfx('fire'); ow.cpFire12 = { x, y, t: 40 }; yield* wait(36); cpSolve12(ow); yield* say('用火把燒掉了樹根！路打開了。'); return; }
  if (P.kind === 'mirror') { const i = P.mirrors.findIndex(is); if (i >= 0) { if (S.solved) { yield* say('鏡子反射著月光。'); return; }
      S.mir[i] = (S.mir[i] + 1) % 4; Sound.sfx('cursor'); if (cpBeam12(P, S).done) { yield* wait(10); Sound.sfx('levelUp'); cpSolve12(ow); yield* say('月光照到了岩壁上的月亮圖案——\n旁邊的石門打開了！'); } return; }
    if (P.gates[tk12(x, y)] && !S.solved) { yield* say('石門旁邊的岩壁上，刻著一個月亮的圖案。\n（要讓月光照到這裡嗎？）'); return; } }
  if (P.kind === 'plates' && P.gates[tk12(x, y)] && !S.solved) { yield* say('厚重的石門。門邊有 3 個圓形的凹槽，' + (S.pl || []).length + ' 個亮著。'); return; }
  if (P.kind === 'password') { if (is(P.note)) { Sound.sfx('item'); yield* sayAll(['地上有一張皺巴巴的紙條：', '「暗號——問：『風從哪裡來？』答：『北方』。問：『羽毛是什麼顏色？』答：『黑色』。」']); S.note = 1; return; }
    if (P.gates[tk12(x, y)] && !S.solved) { yield* say('門後傳來聲音：「……暗號。」');
      const a = yield* ask('「風從哪裡來？」', ['北方', '西方', '海上']); const b = yield* ask('「羽毛是什麼顏色？」', ['白色', '黑色', '灰色']);
      if (a === 0 && b === 1) { Sound.sfx('rock'); cpSolve12(ow); yield* say('「……進去吧。」\n門打開了。（門後的人好像早就走了。）'); }
      else { Sound.sfx('bump'); yield* say('「……不對。滾。」\n（暗號好像寫在哪裡……）'); } return; } }
  if (P.gates[tk12(x, y)] && !S.solved) { const t = { hidden: '冰冷的岩壁。', water: '水很深，過不去。', lava: '滾燙的熔岩。過不去。', rubble: '崩落的岩石把路堵住了。\n（礦車的鐵軌一直延伸到這裡……）', door: '厚重的石門，推不動。', bandit: '門關得緊緊的。' }[P.gates[tk12(x, y)]];
    if (t) { yield* say(t); return; } }
  return false; }
{ const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () { const P = cpOf12(this); if (P && this.cp12) { const [dx, dy] = DIRS[this.p.dir], x = this.p.x + dx, y = this.p.y + dy;
      const g = cpInteract12(this, P, x, y), r = g.next(); if (!(r.done && r.value === false)) { if (!r.done) { const ow = this; this.run((function* () { let v = r; while (!v.done) { yield v.value; v = g.next(); } })()); } return true; } }
    return _in.call(this); }; }
// pushing: boulders (any direction, into pits) and the mine cart (up the rails into the rubble)
{ const _tm = Overworld.prototype.tryMove; Overworld.prototype.tryMove = function (d, run) { const P = cpOf12(this), Q = this.cp12;
    if (P && Q && !this.script) { const p = this.p, [dx, dy] = DIRS[d], nx = p.x + dx, ny = p.y + dy, S = cpSt12(this.map.id);
      if (P.kind === 'boulder') { const b = Q.b.find(q => q[0] === nx && q[1] === ny); if (b) { p.dir = d; this.st.dir = d; const bx = nx + dx, by = ny + dy, k = tk12(bx, by), pit = (P.pits || []).some(q => q[0] === bx && q[1] === by) && !Q.filled.has(k);
          if (pit || (!this.solidAt(bx, by) && !this.entityAt(bx, by) && !Q.b.some(q => q[0] === bx && q[1] === by))) { const ow = this; this.run((function* () { Sound.sfx('rock');
              ow.startMove(p, nx, ny, 2); for (let i = 1; i <= 8; i++) { b.ox = dx * 16 * i / 8; b.oy = dy * 16 * i / 8; yield; } b.ox = b.oy = 0; b[0] = bx; b[1] = by; while (p.moving) yield;
              if (pit) { Q.filled.add(k); Q.b = Q.b.filter(q => q !== b); ow.shake = 8; Sound.sfx('land'); const left = (P.pits || []).filter(q => !Q.filled.has(tk12(q[0], q[1]))).length;
                if (!left) { cpSolve12(ow); yield* say('大石頭填滿了坑洞！可以過去了。'); } else yield* say('大石頭掉進了坑裡！（還有 ' + left + ' 個坑）'); }
              else if (!Game.st.flags.cpPush12) { Game.st.flags.cpPush12 = 1; yield* say('（推錯了的話，離開洞窟再進來，石頭會回到原位。）'); } })()); }
          else Sound.sfx('bump'); return; } }
      if (P.kind === 'cart' && Q.cart && Q.cart[0] === nx && Q.cart[1] === ny) { p.dir = d; this.st.dir = d;
        if (d !== 'up') { Sound.sfx('bump'); this.run(say('礦車在鐵軌上，只能往鐵軌的方向推。')); return; }
        const ow = this; this.run((function* () { Sound.sfx('rock'); const C = Q.cart, stopY = P.gate[0][1] + 1;
          for (let yy = C[1]; yy > stopY; yy--) { for (let i = 1; i <= 6; i++) { C.oy = -16 * i / 6; yield; } C[1] = yy - 1; C.oy = 0; }
          for (let i = 1; i <= 4; i++) { C.oy = -4 * i; yield; } ow.shake = 24; Sound.sfx('quake'); ow.cpDust12 = { x: C[0], y: stopY - 1, t: 30 }; Q.cart = null; yield* wait(20);
          cpSolve12(ow); yield* say('轟——！礦車撞開了崩落的岩石！'); })()); return; }
      // ice: once on the ice you slide until something stops you
      if (P.kind === 'ice' && (P.iceSet.has(tk12(nx, ny)) || P.iceSet.has(tk12(p.x, p.y))) && !this.solidAt(nx, ny) && !this.entityAt(nx, ny, p)) { p.dir = d; this.st.dir = d; const ow = this;
        this.run((function* () { let x = p.x, y = p.y; while (true) { const tx = x + dx, ty = y + dy; if (ow.solidAt(tx, ty) || ow.entityAt(tx, ty, p)) break;
            ow.startMove(p, tx, ty, 2); Sound.sfx('grass'); while (p.moving) yield; x = tx; y = ty; if (!P.iceSet.has(tk12(x, y))) break; } })()); return; } }
    return _tm.call(this, d, run); }; }
// stepping: pressure plates, rotten logs / floor, the wind corridor
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () { _os.call(this); const P = cpOf12(this); if (!P || !this.cp12 || this.script) return;
    const p = this.p, k = tk12(p.x, p.y), S = cpSt12(this.map.id), ow = this;
    if (P.kind === 'plates' && !S.solved) { const i = P.plates.findIndex(q => q[0] === p.x && q[1] === p.y), L = S.pl || (S.pl = []);
      if (i >= 0 && !L.includes(i)) { L.push(i); Sound.sfx('rock');
        if (L.length < P.plates.length) this.run(say('喀！踩下了地上的石板。（還有 ' + (P.plates.length - L.length) + ' 個）'));
        else this.run((function* () { yield* say('喀！踩下了最後一塊石板——'); ow.shake = 14; Sound.sfx('quake'); yield* wait(16); cpSolve12(ow); yield* say('遠處傳來石門打開的聲音。'); })()); } }
    if (P.fake && P.fake.has(k)) this.run((function* () { Sound.sfx('fall'); ow.cpSink12 = { t: 24 }; yield* wait(20); const [bx, by] = P.back;
      p.x = p.tx = bx; p.y = p.ty = by; p.px = bx * 16; p.py = by * 16; p.dir = 'up'; ow.cpSink12 = null; Game.flash = 0.5; Game.flashColor = '#000000';
      yield* say(P.fall === 'mud' ? '浮木沉下去了！整個人陷進泥裡……\n好不容易爬回了岸邊。（爛掉的浮木踩不得）' : '地板塌了！掉了下去……\n爬回來了。（被白蟻啃過的地板很脆弱）'); })()); }; }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function () { _up.call(this); const P = cpOf12(this), Q = this.cp12; if (!P || !Q || P.kind !== 'wind' || cpSolved12(P, this)) return;
    Q.t = (Q.t + 1) % 200; Q.gust = Q.t >= 130 ? 2 : Q.t >= 100 ? 1 : 0; // 100–129 a warning hiss, 130–199 the gust
    const p = this.p, inside = P.wind.some(q => q[0] === p.x && q[1] === p.y) || (p.moving && P.wind.some(q => q[0] === p.tx && q[1] === p.ty));
    if (Q.gust === 2 && inside && !this.script) { const ow = this; this.run((function* () { Sound.sfx('run'); while (p.moving) yield; const [fx, fy] = P.windFrom;
        while (p.y < fy) { ow.startMove(p, p.x, p.y + 1, 3); while (p.moving) yield; } p.dir = 'up';
        if (!Game.st.flags.cpWind12) { Game.st.flags.cpWind12 = 1; yield* say('一陣強風把你吹了回來！\n（風停的時候再走過去吧）'); } })()); }
    if (!Q.gust && !inside && p.y < P.windFrom[1] && p.x === P.windFrom[0]) { /* reached the room */ } }; }
// the rooms without a gate (浮木、地板、冰) count as solved when their chest is opened
{ const _pi = Overworld.prototype.pickItem; Overworld.prototype.pickItem = function* (it) { if (it && it.id && it.id.startsWith('cp12_')) cpSolve12(this); return yield* _pi.call(this, it); }; }
// the room behind the wind is the reward: reaching it counts as solved
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () { _os.call(this); const P = cpOf12(this); if (P && P.kind === 'wind' && this.p.y <= P.wind[P.wind.length - 1][1] - 1 && !cpSolved12(P, this)) cpSolve12(this); }; }

/* ---------- F: drawing ---------- */
const CPC12 = { wood: '#7a5230', woodL: '#a87a48', woodD: '#4a2e18', stone: '#8a8a96', stoneD: '#55556a', stoneL: '#b8b8c4', metal: '#a0a8b8', fire: '#ffb040', fireL: '#fff0a0', water: '#3a7ac8', waterL: '#8ac8f0', mud: '#4a3a24', mudL: '#6a5434', lava: '#e05a10', lavaL: '#ffb040', ice: '#bfe4f4', iceL: '#eaf8ff', root: '#6a4426', rootL: '#8a6038', paper: '#ece4c8' };
function cpPx12(x, sx, sy, c, rx, ry, w, h) { x.fillStyle = c; x.fillRect(sx + rx, sy + ry, w, h); }
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) { const P = cpOf12(this), Q = this.cp12;
    if (!P || !Q || !P.area || !(P.area.has(tk12(tx, ty)) || P.gates[tk12(tx, ty)] || (P.kind === 'roots' && P.wallTorch[0] === tx && P.wallTorch[1] === ty) || (P.crest && P.crest[0] === tx && P.crest[1] === ty))) return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    const k = tk12(tx, ty), S = cpSt12(this.map.id), t = this.t, px = (cl, rx, ry, w, h) => cpPx12(x, sx, sy, cl, rx, ry, w, h), is = q => q && q[0] === tx && q[1] === ty, C = CPC12;
    const g = P.gates[k];
    if (g && !S.solved) {
      if (g === 'hidden') return _dt.call(this, x, 'R', tx, ty, sx, sy, f, f2);
      _dt.call(this, x, g === 'water' ? 'W' : 's', tx, ty, sx, sy, f, f2);
      if (g === 'lava') { px(C.lava, 0, 0, 16, 16); for (let i = 0; i < 4; i++) { const yy = (i * 5 + Math.floor(t / 6)) % 16; px(C.lavaL, (i * 7 + tx * 3) % 13, yy, 3, 1); } }
      if (g === 'roots') { px(C.root, 0, 2, 16, 13); for (let i = 0; i < 5; i++) px(i % 2 ? C.rootL : C.woodD, 1 + i * 3, 1 + (i % 3) * 4, 2, 12); px(C.rootL, 0, 7, 16, 2); px(C.woodD, 3, 11, 10, 2);
        const F = this.cpFire12; if (F && F.x === tx && F.y === ty) { F.t--; for (let i = 0; i < 6; i++) px(i % 2 ? C.fire : C.fireL, 2 + ((i * 5 + t) % 12), 12 - ((t * 2 + i * 7) % 14), 3, 4); } }
      if (g === 'rubble') { px(C.stoneD, 0, 4, 16, 12); px(C.stone, 2, 2, 6, 6); px(C.stone, 8, 5, 7, 6); px(C.stoneL, 3, 3, 3, 2); px(C.stoneL, 9, 6, 3, 2); px(C.stone, 4, 9, 6, 5); }
      if (g === 'door' || g === 'bandit') { px('#2a2a34', 1, 0, 14, 16); px(g === 'bandit' ? C.woodD : C.stoneD, 2, 1, 12, 15); px(g === 'bandit' ? C.wood : C.stone, 3, 2, 10, 13);
        if (g === 'bandit') { px('#101014', 6, 5, 4, 7); px('#30303a', 7, 4, 2, 2); } else { px(C.stoneD, 7, 2, 2, 13); if (P.kind === 'plates') for (let i = 0; i < 3; i++) px((S.pl || []).length > i ? '#ffd860' : '#3a3a48', 4 + i * 3, 6, 2, 2); } }
      return; }
    if (g && S.solved && g === 'lava') { px(C.lava, 0, 0, 16, 16); for (let i = 0; i < 3; i++) px(C.lavaL, (i * 7 + tx * 3) % 13, (i * 5 + Math.floor(t / 6)) % 16, 3, 1);
      px(C.stoneD, 2, 0, 12, 16); px(C.stone, 3, 0, 10, 16); for (let i = 0; i < 4; i++) px(C.stoneD, 3, i * 4 + 3, 10, 1); return; }
    if (g && S.solved && g === 'water') { _dt.call(this, x, 's', tx, ty, sx, sy, f, f2); px('rgba(80,140,200,0.35)', 0, 0, 16, 16); px(C.waterL, (tx * 5 + (t >> 4)) % 12, 6, 3, 1); return; }
    if (P.kind === 'mirror' && is(P.crest)) { _dt.call(this, x, 'R', tx, ty, sx, sy, f, f2); const lit = S.solved; px(lit ? '#fff6c0' : '#8a8aa0', 5, 4, 7, 7); px(lit ? '#ffe070' : '#55556a', 7, 4, 5, 7); px(lit ? '#fff6c0' : '#8a8aa0', 8, 5, 2, 5); return; }
    if (P.kind === 'roots' && is(P.wallTorch)) { _dt.call(this, x, 'R', tx, ty, sx, sy, f, f2); px(C.metal, 10, 8, 4, 2); if (!S.torch && !S.solved) { px(C.wood, 11, 3, 2, 7); px(C.fire, 10, 0, 4, 4); px(C.fireL, 11, 1 + (t >> 3) % 2, 2, 2); } return; }
    _dt.call(this, x, P.kind === 'ice' && P.iceSet.has(k) ? 's' : 's', tx, ty, sx, sy, f, f2);
    if (P.kind === 'ice' && P.iceSet.has(k)) { px(C.ice, 0, 0, 16, 16); px(C.iceL, 2, 2, 5, 1); px(C.iceL, 9, 9, 4, 1); if (P.rockSet.has(k)) { px(C.stoneD, 1, 3, 14, 12); px(C.stone, 2, 2, 12, 10); px(C.stoneL, 4, 3, 5, 3); } }
    if (P.logs && (P.safe.has(k) || P.fake.has(k))) { const fake = P.fake.has(k), mud = P.fall === 'mud';
      px(mud ? C.mud : '#5a4630', 0, 0, 16, 16); if (mud) { px(C.mudL, (tx * 5 + (t >> 4)) % 12, 3, 3, 1); px(C.mudL, (tx * 3 + 6) % 12, 12, 4, 1); }
      if (mud) { px(fake ? '#5a4a2a' : C.wood, 1, 4, 14, 8); px(fake ? '#6a5a36' : C.woodL, 2, 5, 12, 2); px(C.woodD, 1, 11, 14, 1); if (fake) { px('#4a6a30', 4, 6, 3, 2); px('#3a3020', 9, 8, 2, 3); } }
      else { px(fake ? '#8a6e48' : '#a8865a', 0, 0, 16, 16); px(fake ? '#6a5236' : '#8a6a44', 0, 7, 16, 1); px('#6a5236', 7, 0, 1, 7); px('#6a5236', 3, 8, 1, 8);
        if (fake) { px('#2a2018', 5, 3, 2, 2); px('#2a2018', 10, 11, 2, 1); px('#2a2018', 12, 4, 1, 2); } } }
    if (P.kind === 'boulder') { if ((P.pits || []).some(is)) { if (Q.filled.has(k)) { px(C.stoneD, 1, 1, 14, 14); px(C.stone, 3, 3, 10, 9); } else { px('#101018', 1, 1, 14, 14); px('#22222e', 2, 2, 12, 3); } } }
    if (P.rails && P.rails.some(is)) { px(C.woodD, 1, 2, 14, 2); px(C.woodD, 1, 9, 14, 2); px(C.metal, 3, 0, 2, 16); px(C.metal, 11, 0, 2, 16); }
    if (P.plates && P.plates.some(is)) { const on = (S.pl || []).includes(P.plates.findIndex(is)); px(C.stoneD, 2, 3, 12, 11); px(on ? '#6a6a50' : C.stoneL, 3, on ? 5 : 3, 10, on ? 8 : 9); if (on) px('#ffd860', 7, 8, 2, 2); }
    if (P.wind && P.wind.some(is) && Q.gust) { for (let i = 0; i < 4; i++) { const yy = (t * (Q.gust === 2 ? 4 : 1) + i * 5) % 16; px(Q.gust === 2 ? '#f0e8d0' : '#c8b898', 2 + i * 3 + (i % 2), yy, 1, Q.gust === 2 ? 5 : 2); } }
    if (P.kind === 'mirror') { if (is(P.source)) { const a = 0.5 + 0.3 * Math.sin(t / 12); x.fillStyle = 'rgba(220,235,255,' + a.toFixed(2) + ')'; x.beginPath(); x.ellipse(sx + 8, sy + 9, 7, 4, 0, 0, 7); x.fill(); }
      const B = cpBeam12(P, S); for (const [bx, by, dd] of B.tiles) if (bx === tx && by === ty && dd !== 'c') { x.fillStyle = 'rgba(230,240,255,0.55)'; if (dd === 'h') x.fillRect(sx, sy + 7, 16, 3); else x.fillRect(sx + 7, sy, 3, 16); x.fillStyle = '#ffffff'; if (dd === 'h') x.fillRect(sx, sy + 8, 16, 1); else x.fillRect(sx + 8, sy, 1, 16); }
      const i = P.mirrors.findIndex(is); if (i >= 0) { px(C.stoneD, 4, 11, 8, 4); px(C.stone, 5, 10, 6, 2); const o = S.mir[i], hit = B.tiles.some(q => q[0] === tx && q[1] === ty);
        x.save(); x.translate(sx + 8, sy + 7); x.rotate(Math.PI / 4 + o * Math.PI / 2); x.fillStyle = '#55556a'; x.fillRect(-6, -1, 12, 3); x.fillStyle = hit ? '#ffffff' : '#c8d8f0'; x.fillRect(-6, -2, 12, 1); x.restore(); } }
    if (P.torches) { const i = P.torches.findIndex(is); if (i >= 0) { const lit = (S.lit || []).includes(i); px(C.woodD, 7, 6, 2, 9); px(C.stoneD, 5, 13, 6, 2); px(C.wood, 6, 4, 4, 3);
        if (lit) { px(C.fire, 5, -2, 6, 6); px(C.fireL, 7, -1 + ((t >> 3) % 2), 2, 3); } } }
    if (is(P.lever)) { px(C.stoneD, 3, 9, 10, 6); px(C.stone, 4, 10, 8, 3); const down = S.solved; px(C.metal, down ? 9 : 7, down ? 8 : 1, 2, down ? 3 : 9); px('#c03030', down ? 10 : 6, down ? 10 : 0, 4, 3); }
    if (is(P.note) && !S.note) { px(C.paper, 4, 8, 8, 6); px('#8a8070', 5, 10, 6, 1); px('#8a8070', 5, 12, 4, 1); }
    if (P.kind === 'cart' && Q.cart && Q.cart[0] === tx && Q.cart[1] === ty) { /* drawn with the post layer so it can roll over tiles */ }
    if (P.kind === 'boulder') for (const b of Q.b) if (b[0] === tx && b[1] === ty) { /* post layer */ } }; }
// boulders and the cart move between tiles, the dark of 晨霧洞, the dust: drawn over the world (screen space)
function cpPost12(ow, x) { const P = cpOf12(ow), Q = ow.cp12; if (!P || !Q) return; const S = cpSt12(ow.map.id), z = ow._zc ? ZOOM_F : 1;
  const box = (wx, wy, fn) => { const [sx, sy] = scr12(ow, wx, wy); x.save(); x.translate(Math.round(sx), Math.round(sy)); x.scale(z, z); fn(); x.restore(); };
  if (P.kind === 'boulder') for (const b of Q.b) box(b[0] * 16 + (b.ox || 0), b[1] * 16 + (b.oy || 0), () => { x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(2, 13, 12, 3); x.fillStyle = '#55556a'; x.beginPath(); x.arc(8, 8, 7, 0, 7); x.fill(); x.fillStyle = '#8a8a96'; x.beginPath(); x.arc(7, 7, 5.5, 0, 7); x.fill(); x.fillStyle = '#b8b8c4'; x.fillRect(4, 4, 3, 2); });
  if (P.kind === 'cart' && Q.cart) box(Q.cart[0] * 16, Q.cart[1] * 16 + (Q.cart.oy || 0), () => { x.fillStyle = '#3a3a44'; x.fillRect(1, 4, 14, 9); x.fillStyle = '#6a6a78'; x.fillRect(2, 5, 12, 6); x.fillStyle = '#8a6a44'; x.fillRect(3, 3, 10, 3); x.fillStyle = '#202028'; x.fillRect(2, 12, 3, 3); x.fillRect(11, 12, 3, 3); });
  const D = ow.cpDust12; if (D && D.t > 0) { D.t--; box(D.x * 16, D.y * 16, () => { for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#b8b0a0' : '#8a8478'; x.fillRect(8 + Math.cos(i) * (30 - D.t) * 0.6, 8 + Math.sin(i * 1.7) * (30 - D.t) * 0.5, 3, 3); } }); }
  if (ow.cpSink12) { ow.cpSink12.t--; }
  if (P.kind === 'dark' && !S.solved) { const c = DN_CV12.cave || (DN_CV12.cave = mkCanvas(W, H)), g = c.getContext('2d'); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(4,4,12,0.93)'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out'; const hole = (wx, wy, r) => { const [sx, sy] = scr12(ow, wx, wy), R = r * z, gr = g.createRadialGradient(sx, sy, 0, sx, sy, R); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(sx - R, sy - R, R * 2, R * 2); };
    hole(ow.p.px + 8, ow.p.py + 8, 30); (S.lit || []).forEach(i => { const q = P.torches[i]; hole(q[0] * 16 + 8, q[1] * 16 + 4, 44 + Math.sin(ow.t / 7 + i) * 2); });
    for (const q of P.torches) { const [sx, sy] = scr12(ow, q[0] * 16 + 8, q[1] * 16 + 8); if (!(S.lit || []).includes(P.torches.indexOf(q))) { const gr = g.createRadialGradient(sx, sy, 0, sx, sy, 7 * z); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(sx - 8 * z, sy - 8 * z, 16 * z, 16 * z); } }
    x.drawImage(c, 0, 0); } }
{ const _wp = owWorldPost; owWorldPost = function (ow, x) { _wp(ow, x); cpPost12(ow, x); lmDraw12(ow, x); }; }
// the first time in each cave: a hint that something is hidden here
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, ...a) { const r = _ld.call(this, id, ...a), P = CP12[id], st = this.st;
    if (P && st && !cpSt12(id).told && !this.script) { cpSt12(id).told = 1; if (P.kind === 'dark') this.run((function* () { yield* wait(12); yield* say('好暗……幾乎看不到路。\n（洞裡好像有沒點亮的火把）'); })()); }
    return r; }; }
