/* ===================== EVENTS ===================== */
function* healRitual(text) {
  yield* fadeOut(10); healHero(); const fr = Sound.jingle('heal'); yield* wait(Math.max(40, fr)); yield* fadeIn(10);
  if (text) yield* say(text);
}
const Events = {
  *mom(ow) {
    const st = Game.st;
    if (!st.flags.license) { yield* sayAll(['早安，' + st.name + '！\n今天就是你成為冒險者的日子呢。', '村長說有重要的東西要交給你，\n他在家裡等你喔。', '村長家就在鎮上的東北邊，\n咖啡色屋頂的那一間。']); return; }
    if (st.flags.golem && !st.flags.momEnd) { st.flags.momEnd = 1; yield* sayAll(['你打倒了古岩魔像？\n媽媽真為你驕傲！', '不過，冒險才剛開始呢。\n累了就隨時回家吧。']); }
    else if (!st.flags.momAfter) { st.flags.momAfter = 1; yield* sayAll(['你拿到冒險者證了呀！真是長大了呢。', '受傷了就回家吧，\n媽媽隨時幫你恢復精神。']); }
    else yield* say('今天也要小心喔！來，先休息一下吧。');
    yield* healRitual(st.name + '的體力完全恢復了！'); st.respawn = { map: 'home', x: 6, y: 5, dir: 'up' };
  },
  *bed(ow) { const ok = yield* yesNo('要在床上休息一下嗎？'); if (ok) { Game.st.respawn = { map: 'home', x: 1, y: 4, dir: 'up' }; yield* healRitual('睡得好飽！體力完全恢復了！'); } },
  *elder(ow) {
    const st = Game.st;
    if (!st.flags.license) {
      yield* sayAll(['喔，你來啦，' + st.name + '。', '最近，北方古岩遺跡裡沉睡的魔像\n突然甦醒了。', '它擋住了通往王都的道路，\n連商隊都過不來。', '鎮上的年輕人裡，就屬你最有勇氣。\n這件事就拜託你了。', '這是冒險者證。\n有了它，你就能離開小鎮。']);
      st.flags.license = 1; st.bag.license = 1; yield* itemGet('得到了冒險者證！');
      yield* say('還有這些傷藥，帶在身上吧。'); st.bag.potion = (st.bag.potion || 0) + 5; yield* itemGet('得到了傷藥×5！');
      yield* sayAll(['走在高高的草叢裡，\n會遇到野生的魔物。', '打倒魔物可以累積經驗，讓你變得更強。', '道路上還有更強大的「精英魔物」，\n被牠們盯上可要小心。', '還有，別忘了屬性相剋。\n古岩魔像是岩石屬性，最怕水和草！', '按START鍵可以打開選單，\n查看狀態、背包，或是記錄進度。', '準備好了，就往北邊出發吧！']);
      return;
    }
    if (st.flags.golem) { yield* sayAll(['你真的打倒了古岩魔像！', '通往王都的道路打開了，\n商隊很快就會回來。', st.name + '，你是萌芽鎮的驕傲！']); return; }
    yield* sayAll(['古岩魔像是岩石屬性，\n最怕水和草的攻擊。', '累了就去旅店休息，\n別太勉強自己。']);
  },
  *apprentice() { yield* say(Game.st.flags.golem ? '你打倒魔像了？好厲害！\n我以後也要成為冒險者！' : '村長爺爺說，\n強大的冒險者都很會用「防禦」。'); },
  *gatekeeper() { yield* say(Game.st.flags.license ? '有冒險者證就可以出發了！\n路上小心喔！' : '前面就是晨霧道路了。\n沒有冒險者證的人不能出鎮喔！'); },
  exitBlock(ow) {
    if (Game.st.flags.license) return null;
    return (function* () {
      const g = ow.npcs.find(n => n.id === 'gatekeeper'); if (g) g.dir = 'left'; Sound.sfx('exclaim'); ow.p.excl = 30; yield* wait(30);
      yield* sayAll(['等一下！', '外面的草叢裡有野生魔物，很危險的！', '沒有冒險者證的人不能出鎮喔。\n先去找村長吧！']);
      yield* ow.walkEntity(ow.p, 'down', 1); ow.p.dir = 'down';
      if (g) g.dir = 'down';
    })();
  },
  *kid() { yield* say('你知道嗎？在高高的草叢裡，\n會突然跳出野生魔物喔！'); },
  *grandpa() { yield* sayAll(['年輕人，按住B鍵就可以跑步喔。', '老頭子我年輕的時候，\n也是一口氣跑完整條晨霧道路呢！']); },
  *florist() { yield* sayAll(['魔物都有自己的屬性喔。', '火怕水、水怕草、草怕火。\n雷擊對水和飛行的魔物特別有效。', '岩石屬性的魔物最討厭水和草了！']); },
  *healer() {
    const st = Game.st; const ok = yield* yesNo('歡迎來到旅店！\n要讓我為你治療嗎？');
    if (ok) { st.respawn = { map: 'inn', x: 4, y: 4, dir: 'up' }; yield* say('好的，請稍等一下。'); yield* healRitual(); yield* sayAll(['讓你久等了！\n你的體力已經完全恢復了。', '歡迎再來喔！']); }
    else yield* say('歡迎再來喔！');
  },
  *traveler() { yield* sayAll(['我在古岩遺跡附近見過那隻魔像……', '當它的拳頭開始發光、凝聚力量時，\n下一擊會非常可怕。', '那時候最好選擇「防禦」，\n就能擋下一半的傷害！']); },
  *clerk() { yield* shopFlow(); },
  *customer() { yield* sayAll(['鐵劍好貴啊……\n不過攻擊力會提升很多呢。', '魔法護符能提高特攻，\n水流刃和落雷也會變得更強喔！']); },
  *hiker() { yield* sayAll(['嘿！這條路上的草叢很深，\n常常有魔物跳出來。', '受傷了就回萌芽鎮的旅店休息吧。', '聽說過了河之後，\n有一座能恢復體力的泉水喔！']); },
  *girl2() { yield* sayAll(Game.st.flags.croc ? ['你打倒了沼澤鱷？\n太好了，終於可以過橋了！'] : ['橋頭那隻沼澤鱷好兇……', '聽說牠是水屬性，\n最怕雷和草的攻擊。']); },
  *guard() { yield* sayAll(Game.st.flags.golem ? ['你竟然打倒了魔像！', '通往王都的道路終於打開了，\n謝謝你，冒險者！'] : ['前方就是古岩遺跡了。', '魔像非常強大。\n進去之前，先在泉水恢復體力吧。', '記得準備好傷藥，也別忘了記錄進度！']); },
  *spring() {
    const ok = yield* yesNo('清澈的泉水閃閃發亮……\n要喝一口嗎？');
    if (ok) { Game.st.respawn = { map: 'route', x: 7, y: 4, dir: 'left' }; yield* healRitual('好甜的泉水！\n體力完全恢復了！'); }
  },
  bossLine(ow) {
    if (Game.st.flags.golem || !ow.boss) return null;
    return (function* () {
      const p = ow.p; Sound.stop(); yield* wait(20);
      yield* tween(36, t => ow.camDY = -40 * (1 - Math.pow(1 - t, 2)));
      Sound.sfx('quake'); Game.shake = 40; yield* wait(40);
      yield* say('……轟隆隆……');
      yield* tween(30, t => ow.bossGlow = t); Sound.cry(11, 0.6, 1.8); Game.shake = 30;
      yield* sayAll(['古岩魔像的眼睛亮了起來！', '「……入侵者……離開……\n　這裡……不許通過……」']);
      const res = yield* ow.battleScript({ sp: 'golem', lv: 14, kind: 'boss' });
      ow.bossGlow = 0;
      if (res === 'win') {
        Game.st.flags.golem = 1; ow.boss = null; Sound.stop(); ow.camDY = -40;
        Sound.sfx('quake'); Game.shake = 60; yield* wait(40);
        yield* say('古岩魔像化為碎石，崩塌了……');
        Game.shake = 50; Sound.sfx('quake'); yield* wait(30); Game.st.flags.gateOpen = 1; Sound.sfx('door');
        yield* say('遺跡深處的石門，緩緩地打開了！');
        yield* say('通往王都的道路，終於再次打開了！');
        yield* fadeOut(40, '#ffffff'); saveGame();
        Game.setScene(new EndingScene()); Game.sys.push(fadeIn(30));
      }
    })();
  },
};
function* itemGet(text) { const fr = Sound.jingle('item'); const t = new TextBox(text); UI.push(t); let i = 0; while (!t.done || i < fr) { if (i > 20 || t.state === 'type') t.update(); i++; yield; if (t.done && i >= fr) break; } UI.remove(t); }

/* ===================== SAVE ===================== */
const SAVE_KEY = 'dawnlight_save_v1', SET_KEY = 'dawnlight_settings_v1';
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(Game.st)); return true; } catch (e) { return false; } }
function loadGame() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function saveSettings() { try { localStorage.setItem(SET_KEY, JSON.stringify(Game.settings)); } catch (e) { } }
function loadSettings() { try { const s = localStorage.getItem(SET_KEY); if (s) Object.assign(Game.settings, JSON.parse(s)); } catch (e) { } }
function newGameState(name) {
  const st = { name, lv: 5, exp: expForLevel(5), hp: 1, status: null, moves: [{ id: 'slash', pp: 35 }, { id: 'glare', pp: 30 }, { id: 'flameSlash', pp: 25 }], boost: {}, equip: { weapon: 'woodSword', armor: 'clothes', acc: null }, bag: { woodSword: 1, clothes: 1 }, money: 1000, flags: {}, map: 'home', x: 1, y: 4, dir: 'up', respawn: { map: 'home', x: 1, y: 4, dir: 'up' }, time: 0, steps: 0, wins: 0 };
  Game.st = st; st.hp = heroStats(st).hp; return st;
}
function startOverworld() { const st = Game.st; const ow = Game.ow = new Overworld(); Game.setScene(ow); ow.load(st.map, st.x, st.y, st.dir); return ow; }

/* ===================== TITLE ===================== */
function makeLogo(text, sc) {
  const w = Font.width(text) + 2, base = mkCanvas(w, 14), bx = base.getContext('2d'); Font.draw(bx, text, 0, 0, '#ffffff', null);
  const big = mkCanvas(w * sc, 14 * sc), gx = big.getContext('2d'); gx.imageSmoothingEnabled = false; gx.drawImage(base, 0, 0, w * sc, 14 * sc);
  const col = mkCanvas(big.width, big.height), cx = col.getContext('2d'); cx.drawImage(big, 0, 0); cx.globalCompositeOperation = 'source-in';
  const g = cx.createLinearGradient(0, 0, 0, big.height); g.addColorStop(0, '#fffbe8'); g.addColorStop(0.45, '#ffe38a'); g.addColorStop(0.75, '#ffb454'); g.addColorStop(1, '#f08a3c'); cx.fillStyle = g; cx.fillRect(0, 0, col.width, col.height);
  const dark = tinted(big, '#3a1428'), mid = tinted(big, '#8a2e3c');
  const out = mkCanvas(big.width + 8, big.height + 10), ox = out.getContext('2d');
  ox.drawImage(dark, 4, 8); ox.drawImage(dark, 5, 8);
  for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, 2], [2, -2], [-2, 2]]) ox.drawImage(dark, 4 + dx, 4 + dy);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ox.drawImage(mid, 4 + dx, 4 + dy);
  ox.drawImage(col, 4, 4); return out;
}
function buildTitleBG() {
  const c = mkCanvas(W, H), x = c.getContext('2d');
  const sky = ['#2a1e4a', '#3a2456', '#4e2c62', '#6a3668', '#8a426a', '#ac5068', '#cc6464', '#e47e5c', '#f09c58', '#f6bc5c', '#f8d470'];
  sky.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * 10, W, 10); });
  // sun & rays
  const sx = 150, sy = 104; x.globalAlpha = 0.18; x.fillStyle = '#fff4c0'; for (let i = 0; i < 9; i++) { const a = Math.PI + 0.2 + i * 0.35; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a) * 240, sy + Math.sin(a) * 240); x.lineTo(sx + Math.cos(a + 0.12) * 240, sy + Math.sin(a + 0.12) * 240); x.fill(); } x.globalAlpha = 1;
  pxEllipse(x, sx, sy, 22, 22, '#fff0b0'); pxEllipse(x, sx, sy, 18, 18, '#fffbe0');
  x.fillStyle = '#f8f0e0'; for (const [a, b] of [[18, 14], [60, 30], [210, 20], [230, 40], [100, 8], [40, 50]]) x.fillRect(a, b, 1, 1);
  // far mountains
  const mtn = (col, base, pts) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, H); pts.forEach(([a, b]) => x.lineTo(a, b)); x.lineTo(W, H); x.fill(); };
  mtn('#8a4a6a', 0, [[0, 104], [30, 88], [60, 96], [96, 76], [128, 92], [170, 80], [204, 64], [240, 84]]);
  mtn('#5a3458', 0, [[0, 116], [40, 100], [80, 110], [120, 96], [164, 108], [200, 92], [240, 104]]);
  // golem silhouette on right peak
  const g = buildShaded(ART.golem, 40, 40 / 64); const gs = tinted(g, '#2a1a36'); x.drawImage(gs, 186, 56); x.fillStyle = '#ffe040'; x.fillRect(199, 67, 2, 1); x.fillRect(205, 67, 2, 1);
  mtn('#2e2040', 0, [[0, 128], [50, 118], [110, 126], [170, 116], [240, 124]]);
  // cliff with hero
  x.fillStyle = '#1e1628'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 124); x.lineTo(40, 120); x.lineTo(78, 128); x.lineTo(96, 140); x.lineTo(100, H); x.fill();
  x.fillStyle = '#3a2c48'; x.fillRect(0, 122, 40, 2); x.fillRect(40, 120, 30, 2);
  const hb = battleSprite('heroBack'); const hs = tinted(hb, '#1e1628'); x.drawImage(hs, 14, 70);
  x.fillStyle = '#f6bc5c'; x.globalAlpha = 0.9; x.fillRect(33, 73, 1, 1); x.globalAlpha = 1;
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
      const r = yield* choose(opts, { x: 70, y: 96, w: 100, cancel: true });
      if (r < 0) { this.stage = 'press'; return; }
      const o = opts[r];
      if (o === '設定') { yield* optionsScreen(); continue; }
      if (o === '繼續冒險') { Game.st = loadGame(); yield* fadeOut(20); startOverworld(); Game.sys.push(fadeIn(20)); return; }
      if (o === '新的冒險') {
        if (this.hasSave) { const ok = yield* yesNo('開始新的冒險後，\n舊的記錄會在下次存檔時被覆蓋。確定嗎？'); if (!ok) continue; }
        yield* fadeOut(24); Game.setScene(new IntroScene()); Game.sys.push(fadeIn(20)); return;
      }
    }
  }
  draw(x) {
    x.drawImage(this.bg, 0, 0);
    const bob = Math.round(Math.sin(this.t / 30) * 1.5);
    if (!this.logo) this.logo = makeLogo('曙光冒險', 3);
    x.drawImage(this.logo, Math.round(120 - this.logo.width / 2), 10 + bob);
    const sub = 'DAWNLIGHT QUEST'; Font.drawC(x, sub, 120, 60 + bob, '#ffe0a0', '#5a2238');
    if (this.stage === 'press' && Math.floor(this.t / 30) % 2 === 0) Font.drawC(x, '按 A 鍵 開 始', 120, 138, '#ffffff', '#3a1a30');
    Font.draw(x, 'v1.0', 214, 148, '#b890b0', null);
  }
}

/* ===================== INTRO / NAMING ===================== */
class IntroScene {
  constructor() { this.t = 0; this.showElder = 0; this.showMon = 0; this.script = this.run(); }
  enter() { UI.clear(); Sound.play('town'); }
  update() { this.t++; if (this.script) { const r = this.script.next(); if (r.done) this.script = null; } }
  *run() {
    yield* tween(20, t => this.showElder = t);
    yield* sayAll(['歡迎來到魔物與人共存的世界！', '我是萌芽鎮的村長。']);
    this.showMon = 0.01; Sound.cry(1); yield* tween(20, t => this.showMon = t);
    yield* sayAll(['這個世界的草叢、森林與遺跡裡，\n住著各式各樣的魔物。', '有些魔物很溫和，\n有些則非常兇猛。', '而勇敢面對牠們、守護大家的人，\n我們稱為「冒險者」。']);
    yield* tween(16, t => this.showMon = 1 - t); this.showMon = 0;
    let name = null;
    while (!name) {
      const r = yield* ask('那麼，告訴我你的名字吧。', ['小晨', '阿勇', '凱', '光', '自己輸入'], { mx: 170, my: 20, cancel: false });
      if (r < 4) name = ['小晨', '阿勇', '凱', '光'][r];
      else { name = yield* askName(); if (!name) continue; }
      const ok = yield* yesNo('你的名字是「' + name + '」，對嗎？'); if (!ok) name = null;
    }
    newGameState(name);
    yield* sayAll(['原來如此，你就是' + name + '啊！', name + '，屬於你的冒險就要開始了！', '去吧！前往充滿夢想與冒險的世界！']);
    yield* fadeOut(30); startOverworld(); Game.sys.push((function* () { yield* wait(10); yield* fadeIn(24); })());
  }
  draw(x) {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#203050'); g.addColorStop(1, '#3a5a78'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = '#2a4262'; for (let i = 0; i < W; i += 16) for (let j = (i / 16) % 2 * 8; j < 112; j += 16) x.fillRect(i + 6, j + 6, 2, 2);
    pxEllipse(x, 120, 92, 36, 7, '#18283e');
    if (this.showElder > 0) { x.globalAlpha = this.showElder; const f = npcFrames('elder').down[0]; x.drawImage(f, 0, 0, 16, 22, 96 - (this.showMon ? 30 * this.showMon : 0), 26, 48, 66); x.globalAlpha = 1; }
    if (this.showMon > 0) { x.globalAlpha = this.showMon; x.drawImage(battleSprite('mush'), 124, 32); x.globalAlpha = 1; }
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
  constructor() { this.bg = buildTitleBG(); this.t = 0; this.y = 0; this.done = false; Sound.play('title'); }
  enter() { UI.clear(); }
  update() {
    this.t++; if (this.y < this.maxY) this.y += Input.held('a') ? 1.5 : 0.35;
    if (this.y >= this.maxY && Input.pressed('a')) { Input.consume('a'); this.leave(); }
  }
  leave() { if (this.leaving) return; this.leaving = true; Game.sys.push((function* () { yield* fadeOut(24); startOverworld(); yield* fadeIn(24); })()); }
  draw(x) {
    x.drawImage(this.bg, 0, 0); x.fillStyle = 'rgba(20,10,30,0.55)'; x.fillRect(0, 0, W, H);
    const st = Game.st; const mins = Math.floor((st.time || 0) / 3600);
    const lines = [['曙光冒險', 'big'], ['第一章「萌芽」　完', 'sub'], [''], ['古岩魔像再次沉睡，'], ['通往王都的道路打開了。'], [''], ['萌芽鎮冒險者的名字，'], ['很快就會傳遍整個大陸——'], [''], ['— 冒險記錄 —', 'sub'], ['冒險者　' + st.name], ['等級　Lv.' + st.lv], ['戰鬥勝利　' + (st.wins || 0) + ' 次'], ['遊玩時間　' + Math.floor(mins / 60) + ' 小時 ' + (mins % 60) + ' 分'], [''], ['感謝遊玩！', 'sub'], [''], ['按 A 鍵繼續探索', 'hint']];
    let yy = 170 - this.y; this.maxY = 170 + lines.length * 18 - 150;
    for (const [s, k] of lines) {
      if (k === 'big') { if (!this.logo) this.logo = makeLogo(s, 2); x.drawImage(this.logo, Math.round(120 - this.logo.width / 2), yy - 8); yy += 34; continue; }
      if (k === 'hint' && Math.floor(this.t / 30) % 2) { yy += 18; continue; }
      Font.drawC(x, s, 120, yy, k === 'sub' ? '#ffe0a0' : '#ffffff', '#2a1020'); yy += 18;
    }
  }
}

/* ===================== BOOT & LOOP ===================== */
const cv = document.getElementById('screen'); const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
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
