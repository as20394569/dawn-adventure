/* ===================== EVENTS (異世界篇) ===================== */
function* healRitual(text) {
  yield* fadeOut(10); healHero(); const fr = Sound.jingle('heal'); yield* wait(Math.max(40, fr)); yield* fadeIn(10);
  if (text) yield* say(text);
}
function* blackText(lines) { // text over a black screen
  const box = { draw(x) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } }; UI.push(box); const f = Game.fade; Game.fade = 0;
  for (const l of lines) yield* say(l, { style: 'dark', y: 98 });
  UI.remove(box); Game.fade = f;
}
function* chooseName() {
  let name = null;
  while (!name) {
    const r = yield* ask('我叫瑪莎。你呢？你叫什麼名字？', ['小晨', '阿勇', '凱', '光', '自己輸入'], { cancel: false });
    if (r < 4) name = ['小晨', '阿勇', '凱', '光'][r]; else { name = yield* askName(); if (!name) continue; }
    const ok = yield* yesNo('「' + name + '」……是這個名字對吧？'); if (!ok) name = null;
  }
  return name;
}
const Events = {
  *wakeUp(ow) {
    const st = Game.st; const m = ow.npcs.find(n => n.id === 'mom');
    if (m) { m.x = 2; m.y = 3; m.px = 32; m.py = 48; m.dir = 'left'; }
    ow.p.dir = 'right'; Game.fade = 1;
    yield* blackText(['…………', '……喂……', '……你還好嗎？']);
    yield* fadeIn(30);
    yield* sayAll(['啊，你醒了！太好了……', '你倒在村外的草原上，一動也不動，我就把你背回來了。']);
    st.name = yield* chooseName();
    yield* sayAll([st.name + '……好特別的名字呢。', '你身上的衣服也很少見。上面的扣子亮晶晶的。', '……日本？那是哪裡？', '沒聽過呢……這裡是艾爾迪亞王國的萌芽鎮喔。', '你說你是從「另一個世界」來的？', '這種事……村長見多識廣，也許知道些什麼。', '村長家在鎮上的東北邊，咖啡色屋頂的那間。', '在找到回家的路之前，就把這裡當成自己家吧！']);
    if (m) { for (const d of ['right', 'right', 'right', 'right', 'down']) yield* ow.walkEntity(m, d, 1); m.hx = m.x; m.hy = m.y; m.dir = 'left'; }
    st.flags.woke = 1;
  },
  *mom(ow) {
    const st = Game.st;
    if (!st.flags.license) { yield* say('村長家在鎮上的東北邊，咖啡色屋頂那間喔。'); return; }
    if (st.flags.golem && !st.flags.momEnd) { st.flags.momEnd = 1; yield* sayAll(['你看到了故鄉？……真的有門呢。', '不過，你又回到這裡了。', '累了就隨時回來吧。這裡也是你的家。']); }
    else if (!st.flags.momAfter) { st.flags.momAfter = 1; yield* sayAll(['要去找「異界之門」啊……', '外面很危險，受傷了一定要回來喔。']); }
    else yield* say('歡迎回來！先休息一下吧。');
    st.respawn = { map: 'home', x: 6, y: 5, dir: 'up' }; yield* healRitual(st.name + '的體力完全恢復了！');
  },
  *bed(ow) { const ok = yield* yesNo('要在床上休息一下嗎？'); if (ok) { Game.st.respawn = { map: 'home', x: 1, y: 4, dir: 'up' }; yield* healRitual('睡得好飽！體力完全恢復了！'); } },
  *elder(ow) {
    const st = Game.st;
    if (!st.flags.license) {
      yield* sayAll(['喔？你就是瑪莎撿回來的那個孩子啊。', '……從另一個世界來的？', '這個會發光的小板子……嗯，看來不是在說謊。', '古老的傳說裡提過，北方的古岩遺跡深處，有一扇「異界之門」。', '據說很久以前，也有異世界的旅人從那扇門來到這裡。', '如果真有回去的路，大概就在那裡了。', '只是……最近守護遺跡的古岩魔像甦醒了，誰也無法靠近。', '嗯？你的手……在發光！', '這是「異界人之力」。傳說中，來自異世界的人都擁有不可思議的力量。', '有這股力量，你應該能和魔物戰鬥。']);
      st.flags.license = 1; st.bag.license = 1; st.bag.woodSword = 1; st.equip.weapon = 'woodSword';
      yield* itemGet('得到了木劍和冒險者證！'); yield* say(st.name + '把木劍拿在手上。……有點重。');
      yield* say('還有這些傷藥，帶在身上吧。'); st.bag.potion = (st.bag.potion || 0) + 5; yield* itemGet('得到了傷藥×5！');
      yield* sayAll(['走在高高的草叢裡，會遇到野生的魔物。', '打倒魔物能累積經驗，你會越來越強。', '道路上還有更強大的「精英魔物」，被盯上可要小心。', '古岩魔像是岩石屬性，最怕水和草。記住了。', '按START可以打開選單，查看狀態和背包，也能記錄進度。', '去吧，異世界的旅人。願曙光指引你回家的路。']);
      return;
    }
    if (st.flags.golem) { yield* sayAll(['門的另一邊，是你的故鄉？', '門只開了一瞬間……看來還缺少某種力量。', '別灰心。線索一定就在這個世界的某處。']); return; }
    yield* sayAll(['古岩魔像是岩石屬性，最怕水和草的攻擊。', '累了就去旅店休息，別太勉強自己。']);
  },
  *apprentice() { yield* say(Game.st.flags.golem ? '你真的打倒魔像了！我以後也要變得和你一樣強！' : '村長爺爺說，異世界來的人都很強！是真的嗎？'); },
  *gatekeeper() { yield* say(Game.st.flags.license ? '你就是那個從異世界來的人？好厲害！路上小心喔！' : '前面就是晨霧道路，外面有魔物喔！沒有冒險者證的人不能出鎮。'); },
  exitBlock(ow) {
    if (Game.st.flags.license) return null;
    return (function* () {
      const g = ow.npcs.find(n => n.id === 'gatekeeper'); if (g) g.dir = 'left'; Sound.sfx('exclaim'); ow.p.excl = 30; yield* wait(30);
      yield* sayAll(['等一下！', '外面的草叢裡有野生魔物，很危險的！', '沒有冒險者證的人不能出鎮喔。先去找村長吧！']);
      yield* ow.walkEntity(ow.p, 'down', 1); ow.p.dir = 'down';
      if (g) g.dir = 'down';
    })();
  },
  *kid() { yield* say('你的衣服好奇怪喔！那是異世界的盔甲嗎？'); },
  *grandpa() { yield* sayAll(['年輕人，按住B鍵就可以跑步喔。', '你說你們那邊有不用馬就能跑的鐵箱子？……真是難以想像啊。']); },
  *florist() { yield* sayAll(['魔物都有自己的屬性喔。', '火怕水、水怕草、草怕火。雷電對水和飛行的魔物特別有效。', '岩石屬性的魔物，最討厭水和草了！']); },
  *healer() {
    const st = Game.st; const ok = yield* yesNo('歡迎來到旅店！要讓我為你治療嗎？');
    if (ok) { st.respawn = { map: 'inn', x: 4, y: 4, dir: 'up' }; yield* say('好的，請稍等一下。'); yield* healRitual(); yield* sayAll(['讓你久等了！你的體力已經完全恢復了。', '歡迎再來喔！']); }
    else yield* say('歡迎再來喔！');
  },
  *traveler() { yield* sayAll(['我在古岩遺跡附近見過那隻魔像……', '它的拳頭開始發光、凝聚力量時，下一擊非常可怕。', '那時候就選「防禦」，能擋下一半的傷害！']); },
  *clerk() { yield* shopFlow(); },
  *customer() { yield* sayAll(['鐵劍好貴啊……不過攻擊會提升很多呢。', '魔法護符能提高魔攻，水流刃和落雷也會變強喔！']); },
  *hiker() { yield* sayAll(['嘿！這條路上的草叢很深，常有魔物跳出來。', '受傷了就回萌芽鎮的旅店休息吧。', '過了河之後，還有一座能恢復體力的泉水喔！']); },
  *girl2() { yield* sayAll(Game.st.flags.croc ? ['你打倒了沼澤鱷？太好了，終於可以過橋了！'] : ['橋頭那隻沼澤鱷好兇……', '聽說牠是水屬性，最怕雷和草的攻擊。']); },
  *guard() { yield* sayAll(Game.st.flags.golem ? ['你打倒了魔像！傳說中的門……真的存在嗎？'] : ['前方就是古岩遺跡。傳說中的異界之門，就在遺跡深處。', '魔像非常強大。先在泉水恢復體力，準備好道具再進去吧。', '也別忘了記錄進度！']); },
  *spring() {
    const ok = yield* yesNo('清澈的泉水閃閃發亮……要喝一口嗎？');
    if (ok) { Game.st.respawn = { map: 'route', x: 7, y: 4, dir: 'left' }; yield* healRitual('好甜的泉水！體力完全恢復了！'); }
  },
  bossLine(ow) {
    if (Game.st.flags.golem || !ow.boss) return null;
    return (function* () {
      Sound.stop(); yield* wait(20);
      yield* tween(30, t => ow.camDY = -24 * (1 - Math.pow(1 - t, 2)));
      Sound.sfx('quake'); Game.shake = 40; yield* wait(40);
      yield* say('……轟隆隆……');
      yield* tween(30, t => ow.bossGlow = t); Sound.cry(11, 0.6, 1.8); Game.shake = 30;
      yield* sayAll(['古岩魔像的眼睛亮了起來！', '「……異界之人……」', '「……門……不許……靠近……」']);
      const res = yield* ow.battleScript({ sp: 'golem', lv: 14, kind: 'boss' });
      ow.bossGlow = 0;
      if (res === 'win') {
        Game.st.flags.golem = 1; ow.boss = null; Sound.stop(); ow.camDY = -24;
        Sound.sfx('quake'); Game.shake = 60; yield* wait(40);
        yield* say('古岩魔像化為碎石，崩塌了……');
        Game.shake = 50; Sound.sfx('quake'); yield* wait(30); Game.st.flags.gateOpen = 1; Sound.sfx('door');
        yield* say('遺跡深處的「異界之門」緩緩打開了！');
        yield* visionScene();
        yield* fadeOut(40, '#ffffff'); saveGame();
        Game.setScene(new EndingScene()); Game.sys.push(fadeIn(30));
      }
    })();
  },
};
function* itemGet(text) { const fr = Sound.jingle('item'); const t = new TextBox(text); UI.push(t); let i = 0; while (!t.done || i < fr) { if (i > 20 || t.state === 'type') t.update(); i++; yield; if (t.done && i >= fr) break; } UI.remove(t); }
function* visionScene() {
  yield* fadeOut(24, '#ffffff'); let t = 0;
  const v = { draw(x) { t++; drawStreet(x, t, { vision: 1 }); } }; UI.push(v); Game.fadeColor = '#ffffff';
  yield* fadeIn(40); Sound.sfx('heal');
  yield* sayAll(['門的另一邊……是熟悉的街道！？', '紅綠燈、自動販賣機……那是每天放學走的路！']);
  v.fading = 1; for (let i = 0; i < 40; i++) { Game.fade = i / 40 * 0.85; Game.fadeColor = '#ffffff'; yield; }
  yield* sayAll(['……可是，光芒很快就黯淡了下來。', '門的力量似乎還不夠。', '回家的線索，一定就在這個世界的某處——']);
  UI.remove(v); Game.fade = 0;
}

/* ===================== SAVE ===================== */
const SAVE_KEY = 'dawnlight_save_v2', SET_KEY = 'dawnlight_settings_v1';
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(Game.st)); return true; } catch (e) { return false; } }
function loadGame() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function saveSettings() { try { localStorage.setItem(SET_KEY, JSON.stringify(Game.settings)); } catch (e) { } }
function loadSettings() { try { const s = localStorage.getItem(SET_KEY); if (s) Object.assign(Game.settings, JSON.parse(s)); } catch (e) { } }
function newGameState(name) {
  const st = { name, lv: 5, exp: expForLevel(5), hp: 1, status: null, moves: [{ id: 'slash', pp: 35 }, { id: 'glare', pp: 30 }, { id: 'flameSlash', pp: 25 }], boost: {}, equip: { weapon: null, armor: 'uniform', acc: null }, bag: { uniform: 1, phone: 1 }, money: 1000, flags: {}, map: 'home', x: 1, y: 3, dir: 'right', respawn: { map: 'home', x: 1, y: 4, dir: 'up' }, time: 0, steps: 0, wins: 0 };
  Game.st = st; st.hp = heroStats(st).hp; return st;
}
function startOverworld() { const st = Game.st; const ow = Game.ow = new Overworld(); Game.setScene(ow); ow.load(st.map, st.x, st.y, st.dir); return ow; }

/* ===================== SHARED ART: logo, title, modern street ===================== */
function makeLogo(text, sc) {
  const w = Font.width(text) + 2, base = mkCanvas(w, 14), bx = base.getContext('2d'); Font.draw(bx, text, 0, 0, '#ffffff', null);
  const big = mkCanvas(w * sc, 14 * sc), gx = big.getContext('2d'); gx.imageSmoothingEnabled = false; gx.drawImage(base, 0, 0, w * sc, 14 * sc);
  const col = mkCanvas(big.width, big.height), cx = col.getContext('2d'); cx.drawImage(big, 0, 0); cx.globalCompositeOperation = 'source-in';
  const g = cx.createLinearGradient(0, 0, 0, big.height); g.addColorStop(0, '#fffbe8'); g.addColorStop(0.45, '#ffe38a'); g.addColorStop(0.75, '#ffb454'); g.addColorStop(1, '#f08a3c'); cx.fillStyle = g; cx.fillRect(0, 0, col.width, col.height);
  const dark = tinted(big, '#2a1030'), mid = tinted(big, '#7a2e4c');
  const out = mkCanvas(big.width + 8, big.height + 10), ox = out.getContext('2d');
  ox.drawImage(dark, 4, 8); ox.drawImage(dark, 5, 8);
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, 2], [2, -2], [-2, 2]]) ox.drawImage(dark, 4 + dx, 4 + dy);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ox.drawImage(mid, 4 + dx, 4 + dy);
  ox.drawImage(col, 4, 4); return out;
}
function cityLayer(x, y0, h, cols, seed, lit) {
  const r = srand(seed); let X = -4;
  while (X < W) { const bw = 12 + Math.floor(r() * 18), bh = 20 + Math.floor(r() * h); x.fillStyle = cols[Math.floor(r() * cols.length)]; x.fillRect(X, y0 - bh, bw, bh + 4);
    if (lit) for (let wy = y0 - bh + 4; wy < y0 - 3; wy += 5) for (let wx = X + 2; wx < X + bw - 2; wx += 4) if (r() < 0.45) { x.fillStyle = r() < 0.8 ? lit : '#f8f0c0'; x.fillRect(wx, wy, 2, 2); }
    X += bw + Math.floor(r() * 3); }
}
const STREET_BG = (() => {
  const c = mkCanvas(W, H), x = c.getContext('2d');
  const sky = ['#2c2448', '#3c2c58', '#523466', '#6c3c6c', '#8a466c', '#a8526a', '#c66468', '#de7c62', '#ee9a60', '#f4b864'];
  sky.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 12, W, 12); });
  cityLayer(x, 120, 60, ['#4a3458', '#523a60', '#44304e'], 7, '#f0c070');
  cityLayer(x, 140, 40, ['#2e2438', '#342a40', '#281f30'], 19, '#ffd880');
  x.fillStyle = '#6a6a78'; x.fillRect(0, 140, W, 36); x.fillStyle = '#7a7a88'; for (let i = 0; i < W; i += 16) { x.fillRect(i, 140, 15, 17); x.fillRect(i + 8, 158, 15, 17); }
  x.fillStyle = '#9a9aa8'; x.fillRect(0, 174, W, 3);
  x.fillStyle = '#34343e'; x.fillRect(0, 177, W, H - 177); x.fillStyle = '#e8e8e8'; for (let i = 8; i < W; i += 16) x.fillRect(i, 200, 9, 36);
  x.fillStyle = '#d8c040'; x.fillRect(0, 246, W, 2);
  // vending machine
  x.fillStyle = '#1e1e28'; x.fillRect(6, 104, 30, 42); x.fillStyle = '#d83a3a'; x.fillRect(7, 105, 28, 40); x.fillStyle = '#e8f4ff'; x.fillRect(10, 108, 22, 16);
  for (let i = 0; i < 4; i++) { x.fillStyle = ['#4888e0', '#e8c048', '#58c070', '#e06060'][i]; x.fillRect(12 + i * 5, 110, 3, 5); x.fillRect(12 + i * 5, 117, 3, 5); }
  x.fillStyle = '#20202a'; x.fillRect(12, 132, 18, 6); x.fillStyle = '#f8f8f8'; x.fillRect(29, 126, 3, 3);
  // street lamp & traffic light
  x.fillStyle = '#2a2a34'; x.fillRect(146, 82, 3, 76); x.fillRect(140, 80, 14, 4); x.fillStyle = '#fff4c0'; x.fillRect(141, 84, 8, 2);
  x.fillStyle = '#2a2a34'; x.fillRect(118, 100, 2, 58); x.fillRect(112, 96, 14, 8); x.fillStyle = '#f04848'; x.fillRect(114, 98, 3, 3); x.fillStyle = '#3a4a3a'; x.fillRect(120, 98, 3, 3);
  return c;
})();
function drawStreet(x, t, o = {}) {
  x.drawImage(STREET_BG, 0, 0);
  const gl = x.createRadialGradient(145, 90, 2, 145, 90, 50); gl.addColorStop(0, 'rgba(255,240,180,0.35)'); gl.addColorStop(1, 'rgba(255,240,180,0)'); x.fillStyle = gl; x.fillRect(95, 40, 100, 120);
  if (o.vision) { x.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.1 * Math.sin(t / 10)) + ')'; x.fillRect(0, 0, W, H); const vg = x.createRadialGradient(88, 128, 60, 88, 128, 150); vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(255,255,255,0.95)'); x.fillStyle = vg; x.fillRect(0, 0, W, H); }
}

/* ===================== TITLE ===================== */
function buildTitleBG() {
  const c = mkCanvas(W, H), x = c.getContext('2d');
  const sky = ['#1e1640', '#261a4a', '#2e1e52', '#3a2458', '#4a2a60', '#5e3266', '#763a6a', '#90446c', '#aa506c', '#c45e6a', '#da7266', '#ea8a60', '#f4a45c', '#f8c060'];
  sky.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 13, W, 13); });
  const r = srand(3); x.fillStyle = '#f8f0e0'; for (let i = 0; i < 26; i++) x.fillRect(Math.floor(r() * W), Math.floor(r() * 90), 1, 1);
  // rift
  const cx0 = 88, cy0 = 104, rx = 30, ry = 42;
  x.globalAlpha = 0.16; x.fillStyle = '#c8f4ff'; for (let i = 0; i < 10; i++) { const a = i * 0.63 + 0.2; x.beginPath(); x.moveTo(cx0, cy0); x.lineTo(cx0 + Math.cos(a) * 200, cy0 + Math.sin(a) * 200); x.lineTo(cx0 + Math.cos(a + 0.12) * 200, cy0 + Math.sin(a + 0.12) * 200); x.fill(); } x.globalAlpha = 1;
  x.save(); x.beginPath(); x.ellipse(cx0, cy0, rx, ry, 0, 0, 7); x.clip();
  const ig = x.createLinearGradient(0, cy0 - ry, 0, cy0 + ry); ig.addColorStop(0, '#101a3a'); ig.addColorStop(1, '#2a3a6a'); x.fillStyle = ig; x.fillRect(cx0 - rx, cy0 - ry, rx * 2, ry * 2);
  const r2 = srand(11); let X = cx0 - rx; while (X < cx0 + rx) { const bw = 6 + Math.floor(r2() * 9), bh = 16 + Math.floor(r2() * 40); x.fillStyle = '#0a1024'; x.fillRect(X, cy0 + ry - 14 - bh, bw, bh + 14); for (let wy = cy0 + ry - 12 - bh; wy < cy0 + ry - 16; wy += 4) for (let wx = X + 1; wx < X + bw - 1; wx += 3) if (r2() < 0.5) { x.fillStyle = '#ffd870'; x.fillRect(wx, wy, 1, 2); } X += bw + 1; }
  x.fillStyle = '#383848'; x.fillRect(cx0 - rx, cy0 + ry - 14, rx * 2, 14); x.fillStyle = '#e8e8e8'; for (let i = cx0 - rx; i < cx0 + rx; i += 6) x.fillRect(i, cy0 + ry - 8, 3, 6);
  x.fillStyle = '#f04848'; x.fillRect(cx0 + 12, cy0 + 8, 2, 2);
  x.restore();
  for (let k = 0; k < 3; k++) { x.strokeStyle = ['#ffffff', '#a8f0ff', '#58c8f0'][k]; x.globalAlpha = [0.95, 0.7, 0.45][k]; x.lineWidth = [2, 2, 3][k]; x.beginPath(); x.ellipse(cx0, cy0, rx + k * 3, ry + k * 3, 0, 0, 7); x.stroke(); } x.globalAlpha = 1;
  // mountains
  const mtn = (col, pts) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, H); pts.forEach(([a, b]) => x.lineTo(a, b)); x.lineTo(W, H); x.fill(); };
  mtn('#7a426a', [[0, 170], [24, 150], [50, 162], [80, 146], [110, 160], [140, 138], [176, 156]]);
  mtn('#50305a', [[0, 186], [30, 170], [70, 182], [110, 168], [150, 180], [176, 172]]);
  const gs = tinted(buildShaded(ART.golem, 36, 36 / 64), '#2a1a36'); x.drawImage(gs, 132, 142); x.fillStyle = '#ffe040'; x.fillRect(144, 152, 2, 1); x.fillRect(149, 152, 2, 1);
  mtn('#2a1c3c', [[0, 204], [40, 194], [90, 202], [140, 192], [176, 198]]);
  x.fillStyle = '#181024'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 214); x.lineTo(40, 208); x.lineTo(76, 216); x.lineTo(96, 232); x.lineTo(104, H); x.fill();
  const hs = tinted(battleSprite('heroBack'), '#181024'); x.drawImage(hs, 8, 152);
  return c;
}
class TitleScene {
  constructor() { this.bg = buildTitleBG(); this.t = 0; this.stage = 'press'; this.script = null; this.hasSave = !!loadGame(); }
  enter() { UI.clear(); if (Sound.ready) Sound.play('title'); }
  update() {
    this.t++;
    if (this.script) { const r = this.script.next(); if (r.done) this.script = null; return; }
    if (this.stage === 'press' && (Input.pressed('a') || Input.pressed('start'))) { Input.consume('a', 'start'); Sound.init(); Sound.play('title'); Sound.sfx('select'); this.stage = 'menu'; this.script = this.menu(); }
  }
  *menu() {
    while (true) {
      const opts = this.hasSave ? ['繼續冒險', '新的冒險', '設定'] : ['新的冒險', '設定'];
      const r = yield* choose(opts, { x: 38, y: 176, w: 100, cancel: true });
      if (r < 0) { this.stage = 'press'; return; }
      const o = opts[r];
      if (o === '設定') { yield* optionsScreen(); continue; }
      if (o === '繼續冒險') { Game.st = loadGame(); yield* fadeOut(20); startOverworld(); Game.sys.push(fadeIn(20)); return; }
      if (o === '新的冒險') {
        if (this.hasSave) { const ok = yield* yesNo('開始新的冒險後，舊的記錄會在下次存檔時被覆蓋。確定嗎？'); if (!ok) continue; }
        yield* fadeOut(24); Game.setScene(new IntroScene()); return;
      }
    }
  }
  draw(x) {
    x.drawImage(this.bg, 0, 0);
    const k = (Math.sin(this.t / 20) + 1) / 2; x.strokeStyle = 'rgba(200,244,255,' + (0.25 + 0.35 * k) + ')'; x.lineWidth = 2; x.beginPath(); x.ellipse(88, 104, 36 + k * 3, 48 + k * 3, 0, 0, 7); x.stroke();
    const r = srand(Math.floor(this.t / 6)); x.fillStyle = '#e8fcff'; for (let i = 0; i < 6; i++) { const a = r() * 7, d = 34 + r() * 16; x.fillRect(Math.round(88 + Math.cos(a) * d), Math.round(104 + Math.sin(a) * d * 1.35), 1, 1); }
    const bob = Math.round(Math.sin(this.t / 30) * 1.5);
    if (!this.logo) this.logo = makeLogo('曙光冒險', 3);
    x.drawImage(this.logo, Math.round(W / 2 - this.logo.width / 2), 6 + bob);
    Font.drawC(x, '～異世界冒險RPG～', W / 2, 52 + bob, '#ffe0a0', '#3a1428');
    if (this.stage === 'press' && Math.floor(this.t / 30) % 2 === 0) Font.drawC(x, '按 A 鍵開始', W / 2, 232, '#ffffff', '#1a1024');
    Font.draw(x, 'v2.0', W - 26, H - 13, '#b890b0', null);
  }
}

/* ===================== INTRO: the everyday street ===================== */
class IntroScene {
  constructor() { this.t = 0; this.hx = -24; this.walking = false; this.dir = 'right'; this.circle = 0; this.parts = []; this.showScene = false; this.script = this.run(); }
  enter() { UI.clear(); Sound.stop(); }
  update() {
    this.t++; if (this.walking) this.hx += 0.75;
    for (const p of this.parts) { p.y += p.vy; p.life--; } this.parts = this.parts.filter(p => p.life > 0);
    if (this.circle > 0.05) for (let i = 0; i < 1 + this.circle * 3; i++) this.parts.push({ x: this.hx + 16 + (Math.random() - 0.5) * 60 * this.circle, y: 166 + (Math.random() - 0.5) * 16 * this.circle, vy: -0.6 - Math.random(), life: 30 + Math.random() * 20 });
    if (this.script) { const r = this.script.next(); if (r.done) this.script = null; }
  }
  *run() {
    Game.fade = 1;
    yield* blackText(['那天，是一個再普通不過的放學日。']);
    this.showScene = true; yield* fadeIn(30);
    this.walking = true; for (let i = 0; i < 125; i++) { if (i % 16 === 0) Sound.sfx('step'); yield; } this.walking = false;
    yield* sayAll(['（今天的作業好多……）', '（晚餐要吃什麼呢……）']);
    Sound.sfx('charge'); yield* tween(40, t => this.circle = t * 0.35);
    this.dir = 'down'; Sound.sfx('exclaim'); this.excl = 30; yield* wait(30);
    yield* say('咦……？腳下……在發光？');
    Sound.sfx('charge'); Game.shake = 30; yield* tween(50, t => this.circle = 0.35 + t * 0.65);
    yield* say('等、等一下——！', { auto: 30 });
    Sound.sfx('quake'); yield* fadeOut(30, '#ffffff'); yield* wait(30);
    Game.fadeColor = '#000'; Game.fade = 1;
    newGameState(''); const ow = startOverworld(); Game.fade = 1; ow.run(Events.wakeUp(ow));
  }
  draw(x) {
    if (!this.showScene) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); return; }
    drawStreet(x, this.t);
    if (this.circle > 0) {
      const cx = Math.round(this.hx + 16), cy = 168, R = 8 + this.circle * 46;
      x.save(); x.globalAlpha = Math.min(1, this.circle * 2);
      const g = x.createRadialGradient(cx, cy, 2, cx, cy, R); g.addColorStop(0, 'rgba(200,250,255,0.9)'); g.addColorStop(1, 'rgba(80,200,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, R, R * 0.34, 0, 0, 7); x.fill();
      x.strokeStyle = '#c8f8ff'; x.lineWidth = 1; x.beginPath(); x.ellipse(cx, cy, R * 0.8, R * 0.27, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(cx, cy, R * 0.55, R * 0.19, 0, 0, 7); x.stroke();
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + this.t / 30; x.fillStyle = '#ffffff'; x.fillRect(Math.round(cx + Math.cos(a) * R * 0.68), Math.round(cy + Math.sin(a) * R * 0.23), 2, 2); }
      if (this.circle > 0.5) { x.globalAlpha = (this.circle - 0.5) * 1.6; const bg = x.createLinearGradient(0, 0, 0, cy); bg.addColorStop(0, 'rgba(200,250,255,0)'); bg.addColorStop(1, 'rgba(220,252,255,0.8)'); x.fillStyle = bg; x.fillRect(cx - R * 0.6, 0, R * 1.2, cy); }
      x.restore();
    }
    for (const p of this.parts) { x.fillStyle = p.life > 20 ? '#ffffff' : '#a8ecff'; x.fillRect(Math.round(p.x), Math.round(p.y), 1, 2); }
    const f = Hero.frames[this.dir][this.walking ? Math.floor(this.t / 8) % 4 : 0];
    x.drawImage(f, 0, 0, 16, 22, Math.round(this.hx), 124, 32, 44);
    if (this.excl > 0) { this.excl--; x.drawImage(EXCLAIM, Math.round(this.hx) + 12, 110); }
  }
}
function* askName() {
  const box = document.getElementById('nameBox'), inp = document.getElementById('nameField'); if (!box) return '小晨';
  box.hidden = false; inp.value = ''; setTimeout(() => { try { inp.focus(); } catch (e) { } }, 50);
  Game.nameResult = undefined; Input.clearAll();
  while (Game.nameResult === undefined) yield;
  box.hidden = true; Input.clearAll(); const v = (Game.nameResult || '').trim().slice(0, 6); return v || null;
}

/* ===================== ENDING ===================== */
class EndingScene {
  constructor() { this.bg = buildTitleBG(); this.t = 0; this.y = 0; Sound.play('title'); }
  enter() { UI.clear(); }
  update() {
    this.t++; if (this.y < this.maxY) this.y += Input.held('a') ? 1.5 : 0.35;
    if (this.y >= this.maxY && Input.pressed('a')) { Input.consume('a'); this.leave(); }
  }
  leave() { if (this.leaving) return; this.leaving = true; Game.sys.push((function* () { yield* fadeOut(24); startOverworld(); yield* fadeIn(24); })()); }
  draw(x) {
    x.drawImage(this.bg, 0, 0); x.fillStyle = 'rgba(16,8,28,0.62)'; x.fillRect(0, 0, W, H);
    const st = Game.st; const mins = Math.floor((st.time || 0) / 3600);
    const lines = [['曙光冒險', 'big'], ['第一章「異界的旅人」', 'sub'], ['完', 'sub'], [''], ['異界之門短暫地打開，'], ['讓' + st.name + '看見了'], ['故鄉的街道。'], [''], ['門的力量從何而來？'], ['回家的路，'], ['還在曙光的彼端——'], [''], ['— 冒險記錄 —', 'sub'], ['旅人　' + st.name], ['等級　Lv.' + st.lv], ['戰鬥勝利　' + (st.wins || 0) + ' 次'], ['遊玩時間　' + Math.floor(mins / 60) + '小時' + (mins % 60) + '分'], [''], ['感謝遊玩！', 'sub'], [''], ['按 A 鍵繼續探索', 'hint']];
    let yy = H + 10 - this.y; this.maxY = H + 10 + lines.length * 18 - 230;
    for (const [s, k] of lines) {
      if (k === 'big') { if (!this.logo) this.logo = makeLogo(s, 2); x.drawImage(this.logo, Math.round(W / 2 - this.logo.width / 2), yy - 8); yy += 36; continue; }
      if (k === 'hint' && Math.floor(this.t / 30) % 2) { yy += 18; continue; }
      Font.drawC(x, s, W / 2, yy, k === 'sub' ? '#ffe0a0' : '#ffffff', '#2a1020'); yy += 18;
    }
  }
}

/* ===================== BOOT & LOOP ===================== */
const cv = document.getElementById('screen'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
function render() {
  ctx.imageSmoothingEnabled = false; ctx.save();
  if (Game.shake > 0) { ctx.translate(rnd(-2, 2), rnd(-2, 2)); Game.shake--; }
  Game.scene.draw(ctx); UI.draw(ctx); drawTransition(ctx); ctx.restore();
  if (Game.flash > 0) { ctx.globalAlpha = clamp(Game.flash, 0, 1); ctx.fillStyle = Game.flashColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; if (!Game.flashTween) Game.flash = Math.max(0, Game.flash - 0.04); }
  if (Game.fade > 0) { ctx.globalAlpha = clamp(Game.fade, 0, 1); ctx.fillStyle = Game.fadeColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
function tick() { Input.frame(); Game.frame++; if (Input.anyTapFrame) Sound.init(); if (Game.sys.length) Game.sys = Game.sys.filter(g => !g.next().done); Game.scene.update(); }
let lastT = performance.now(), accT = 0;
function loop(now) { accT += Math.min(120, now - lastT); lastT = now; let n = 0; if (Game.paused) accT = 0; while (accT >= 1000 / 60 && n < 4) { tick(); accT -= 1000 / 60; n++; } if (n) render(); requestAnimationFrame(loop); }

// ---- input bindings ----
const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', KeyZ: 'a', KeyJ: 'a', Space: 'a', KeyX: 'b', KeyK: 'b', Escape: 'b', ShiftLeft: 'b', Backspace: 'b', Enter: 'start', KeyM: 'start', ShiftRight: 'select' };
window.addEventListener('keydown', e => { if (e.target && e.target.tagName === 'INPUT') return; const k = KEYMAP[e.code]; if (k) { e.preventDefault(); if (!e.repeat) Input.set(k, true); } });
window.addEventListener('keyup', e => { if (e.target && e.target.tagName === 'INPUT') return; const k = KEYMAP[e.code]; if (k) { e.preventDefault(); Input.set(k, false); } });
window.addEventListener('blur', () => Input.clearAll());
function bindButtons() {
  document.querySelectorAll('[data-k]').forEach(el => {
    const k = el.dataset.k; const on = e => { e.preventDefault(); el.classList.add('on'); Input.set(k, true); if (navigator.vibrate) try { navigator.vibrate(8); } catch (_) { } };
    const off = e => { e.preventDefault(); el.classList.remove('on'); Input.set(k, false); };
    el.addEventListener('pointerdown', e => { try { el.setPointerCapture(e.pointerId); } catch (_) { } on(e); }); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
  });
  const dp = document.getElementById('dpad'); if (!dp) return; let cur = null;
  const setDir = d => { if (d === cur) return; if (cur) Input.set(cur, false); cur = d; if (d) { Input.set(d, true); if (navigator.vibrate) try { navigator.vibrate(6); } catch (_) { } } dp.dataset.dir = d || ''; };
  const fromEv = e => { const r = dp.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); if (Math.hypot(dx, dy) < r.width * 0.12) return cur; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); };
  dp.addEventListener('pointerdown', e => { e.preventDefault(); try { dp.setPointerCapture(e.pointerId); } catch (_) { } setDir(fromEv(e)); });
  dp.addEventListener('pointermove', e => { if (cur !== null || e.buttons) { e.preventDefault(); if (e.pressure > 0 || e.buttons) setDir(fromEv(e)); } });
  const end = e => { e.preventDefault(); setDir(null); }; dp.addEventListener('pointerup', end); dp.addEventListener('pointercancel', end); dp.addEventListener('lostpointercapture', end);
  document.addEventListener('contextmenu', e => { if (e.target.closest && e.target.closest('#pad')) e.preventDefault(); });
  const form = document.getElementById('nameForm'); if (form) { form.addEventListener('submit', e => { e.preventDefault(); Game.nameResult = document.getElementById('nameField').value; }); document.getElementById('nameCancel').addEventListener('click', e => { e.preventDefault(); Game.nameResult = ''; }); }
  for (const ev of ['pointerdown', 'touchend', 'keydown']) window.addEventListener(ev, () => Sound.init(), { capture: true });
  document.addEventListener('visibilitychange', () => Sound.setPaused(document.hidden));
}
function fitScreen() {
  const wrap = document.getElementById('screenWrap'); if (!wrap) return; const r = wrap.getBoundingClientRect();
  const s = Math.min(r.width / W, r.height / H);
  cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px';
}
function boot(data) {
  loadSettings(); bindButtons(); fitScreen(); window.addEventListener('resize', fitScreen); if (window.visualViewport) window.visualViewport.addEventListener('resize', fitScreen);
  setTimeout(fitScreen, 100);
  if (data && data.st && data.st.map) { Game.st = data.st; startOverworld(); }
  else Game.setScene(new TitleScene());
  requestAnimationFrame(loop);
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ st: (Game.scene instanceof Overworld && !Game.scene.script) ? Game.st : null })); } catch (e) { }
}
window.__game = { Game, Input, Events, MAPS, SPECIES, Battle, Overworld, heroStats, newGameState, startOverworld, UI, step(n = 1) { for (let i = 0; i < n; i++) tick(); render(); }, press(k, hold = 2, after = 6) { Input.set(k, true); for (let i = 0; i < hold; i++) tick(); Input.set(k, false); for (let i = 0; i < after; i++) tick(); render(); } };
try { if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(boot); else boot((window.claude && window.claude.hot && window.claude.hot.data) || {}); } catch (e) { boot({}); }
