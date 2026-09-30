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
    if (st.flags.golem && !st.flags.momEnd) { st.flags.momEnd = 1; yield* sayAll(['……魔王？那種傳說中的東西，真的要回來了？', '……你要去打倒它，對吧。', '不管走得多遠，累了就回來。這裡是你的家。']); }
    else if (!st.flags.momAfter) { st.flags.momAfter = 1; yield* sayAll(['……回不去了嗎。', '那就把這裡當成你的家吧。我會一直等你回來吃晚飯的。', '當冒險者很危險，受傷了一定要回來喔。']); }
    else yield* say('歡迎回來！先休息一下吧。');
    st.respawn = { map: 'home', x: 6, y: 5, dir: 'up' }; yield* healRitual(st.name + '的體力完全恢復了！');
  },
  *bed(ow) { const ok = yield* yesNo('要在床上休息一下嗎？'); if (ok) { Game.st.respawn = { map: 'home', x: 1, y: 4, dir: 'up' }; yield* healRitual('睡得好飽！體力完全恢復了！'); } },
  *elder(ow) {
    const st = Game.st;
    if (st.flags.license && (yield* classTalk())) return;
    if (!st.flags.license) {
      yield* sayAll(['喔？你就是瑪莎撿回來的那個孩子啊。', '……從另一個世界來的？', '這個會發光的小板子……嗯，看來不是在說謊。', '……孩子，有件事我必須老實告訴你。', '五百年前，「黯滅之王」札爾格斯率領魔物，差點讓這個世界沉入黑暗。', '那時，北方古岩遺跡的「異界之門」打開了，一位異世界的少年從門裡走了出來。', '他就是傳說中的初代「曙光勇者」。他封印了魔王，自己卻再也沒有回去。', '門只會朝這個世界打開。……傳說裡，從來沒有人回去過。']);
      yield* blackText(['……回不去了。', '爸媽、朋友、每天放學走的那條路……', '……', '可是，哭也沒有用。', '既然來到了這裡——', '就在這個世界，好好地活下去。']);
      yield* sayAll(['……你的眼神變了呢。', '最近魔物越來越凶暴，古岩遺跡的魔像也甦醒了。', '門會在這個時候打開……恐怕，魔王的封印正在減弱。', '嗯？你的手……在發光！', '這是「異界人之力」，和初代勇者一樣的力量。', '不過，這股力量還沒有形狀。', '把手放在這塊古老的石板上。力量會回應你的心，化成你要走的道路。']);
      yield* fadeOut(16, '#ffffff'); Game.fade = 0; Sound.sfx('charge'); const k = yield* classSelectScreen();
      applyStartClass(k); Game.fadeColor = '#ffffff'; Game.fade = 1; Sound.jingle('levelup'); yield* fadeIn(30); Game.fadeColor = '#000';
      const C = CLASSES[k], S = CLASS_START[k];
      yield* itemGet(st.name + '覺醒成為了' + C.n + '！');
      yield* say({ swordsman: '劍士的道路啊……這把練習木劍就交給你了。', mage: '魔導士的道路啊……這把魔杖是我年輕時用的，交給你了。', guardian: '守護者的道路啊……這把木劍和布帽給你，別逞強喔。', ranger: '遊俠的道路啊……這把獵刀是村裡獵人送的，拿去吧。' }[k]);
      st.flags.license = 1; st.bag.license = 1; yield* itemGet('得到了' + S.gear.filter(b => b !== 'guardBadge').map(b => GEAR[b].n).join('和') + '、護身符和冒險者證！');
      yield* say('還有這些傷藥，帶在身上吧。'); st.bag.potion = (st.bag.potion || 0) + 5; yield* itemGet('得到了傷藥×5！');
      yield* sayAll(['技能是跟著武器走的。你手上的武器有兩招「主動技能」、一個「被動」，還有攻擊累積3層後、在下一次攻擊或技能時發動的「特技」。', '普通攻擊不花MP，還會回復一點MP；把MP用在武器技能上吧。', '每升2級會得到1點「天賦點」。打開選單的「天賦」，就能點' + CLASSES[k].n + '的三條天賦分支。', '新的裝備都要靠鐵匠打造。撿到的設計圖和素材，記得拿去給他看看。', '到了Lv14再來找我，我會幫你進行「天賦覺醒」。', '魔物分成好幾個種族，各有害怕的屬性。善用屬性技能，戰鬥會輕鬆很多。', '按START可以打開選單，查看狀態、技能和背包，也能記錄進度。']);
      const ap = ow && ow.npcs.find(n => n.id === 'apprentice');
      if (ap) { ap.dir = 'left'; yield* say('學徒：「村長爺爺！讓我幫忙！我在院子裡養了一隻練習用的泡泡姆！」');
        if (yield* yesNo('要和泡泡姆練習一場嗎？')) { const res = yield* ow.battleScript({ sp: 'slime', lv: 1, kind: 'wild' }); if (res === 'win') yield* say('學徒：「好厲害！這就是異界人之力！」'); else yield* say('學徒：「泡、泡泡姆，下手輕一點啦！」'); healHero(); }
        else yield* say('學徒：「那下次再練習吧！」'); }
      yield* sayAll(['古岩魔像是「構造體」魔物，最怕水和草的攻擊。記住了。', '從今天起，你就是萌芽鎮的冒險者了。', '先去古岩遺跡，查清楚魔像為什麼會暴走。', '去吧，異世界的' + C.n + '。願曙光指引你的道路。']);
      return;
    }
    if (st.flags.golem) { yield* sayAll(['……你在門的另一邊，看到了魔王城？', '果然，札爾格斯正在甦醒。', '你手上的「曙光之印」，是初代勇者留下的印記。它選中了你。', '魔王城在遙遠的北方。你還需要更多的力量和夥伴。', '在那之前，先把這一帶的魔物清理乾淨，好好鍛鍊吧。'].concat(st.flags.boneKnight ? [] : ['……對了，聽說魔像倒下後，遺跡的石板下面出現了往地底的樓梯。', '那裡是古王的墓穴。亡者怕火，別忘了帶上火系的武器或技能。'])); return; }
    yield* sayAll(['古岩魔像被魔王的瘴氣侵蝕，才會暴走。牠是「構造體」魔物，最怕水和草的攻擊。', '累了就去旅店休息，別太勉強自己。']);
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
  *kid() { yield* say(Game.st.flags.golem ? '聽說你打倒了魔像！異世界的盔甲果然很強！' : '你的衣服好奇怪喔！那是異世界的盔甲嗎？'); },
  *well(ow) {
    const st = Game.st;
    if (st.flags.wellCharm) { if (st.bag.rope) { if (yield* yesNo('要用繩索下到井底嗎？')) yield* ow.warp('sewer', 7, 12, 'up'); } else yield* say('一口很深的井。井底好像還有更深的通道……需要繩索才能下去。'); return; }
    if (!st.flags.golem) { yield* say('一口很深的井。往下看，只有一片漆黑。'); return; }
    yield* say('……井底好像有什麼東西，正發出淡淡的月光。');
    if (!(yield* yesNo('要把水桶放下去撈撈看嗎？'))) return;
    st.flags.wellCharm = 1; yield* itemGet(st.name + '撈起了' + bpGift('moonCharm', 4).txt + '！');
    yield* say('古老的護符……說不定和異界之門有關。可以在背包裡裝備。');
  },
  *peddler() { const f = Game.st.flags; if (f.bandit && !f.peddlerThx) { f.peddlerThx = 1; Game.st.bag.luckClover = (Game.st.bag.luckClover || 0) + 1; yield* sayAll(['你從格倫手上把貨搶回來了！？', '這是我珍藏的幸運草，請收下！']); yield* itemGet(Game.st.name + '得到了幸運草！'); } yield* say(f.bandit ? '貨都回來了！今天的商品特別齊全喔。' : '多虧了你，商隊才平安抵達！算你便宜一點。'); yield* shopFlow(PEDDLER_LIST); },
  *caravan(ow) {
    const f = Game.st.flags;
    yield* sayAll(['救、救命！商隊的貨車被魔物包圍了！', '這樣下去，貨物就送不到萌芽鎮了……']); f.caravanMet = 1;
    if (!(yield* yesNo('要幫忙擊退魔物嗎？'))) { yield* say('拜託了……我撐不了太久……'); return; }
    for (const [sp, lv] of CARAVAN_FIGHTS) { const res = yield* ow.battleScript({ sp, lv, kind: 'wild' }); if (res !== 'win') { yield* say('……還有魔物！小心啊！'); return; } }
    f.caravan = 'saved'; Game.st.money += 800; ow.npcs = ow.npcs.filter(n => n.id !== 'caravan');
    yield* sayAll(['得救了！真是太感謝你了！', '這是謝禮。我會在萌芽鎮擺攤，也給你算便宜一點！']); yield* itemGet(Game.st.name + '得到了800 G！');
    f.mineOpen = 1; yield* sayAll(['……不過，最前面那輛貨車被盜賊搶走了。', '他們躲在道路東邊的廢棄礦坑。封住入口的木板，好像被他們拆掉了……', '如果你有餘力，能幫忙把貨物搶回來嗎？'])
  },
  hiddenBoss(ow) {
    const st = Game.st; if (st.flags.crystalBoss || !ow.boss) return null;
    return (function* () {
      yield* sayAll(['水晶石像散發著和你手上的印記同樣的光芒……', '「……異界之人……證明……你的力量……」']);
      const res = yield* ow.battleScript({ sp: 'crystalGolem', lv: MAPS.sewer.boss.lv, kind: 'boss' });
      if (res === 'win') { st.flags.crystalBoss = 1; st.flags.hiddenCls = 1; ow.boss = null; yield* say('水晶魔像碎裂了。碎片化成光，流進了' + st.name + '的身體……'); yield* itemGet('覺醒了隱藏職業「異界勇者」！（找村長轉職）'); saveGame(); }
    })();
  },
  *herbalist() {
    const f = Game.st.flags, st = Game.st;
    if (!f.herb) { f.herb = 1; st.bag.superPotion = (st.bag.superPotion || 0) + 1; yield* sayAll(['哦？這麼深的森林裡，居然有客人。', '我是採藥的老頭子。這個給你，路上小心。']); yield* itemGet(st.name + '得到了好傷藥！'); }
    yield* sayAll([f.mossGiant ? '苔石巨人倒下了啊……森林的空氣都變輕了。' : '西南邊的水池旁，住著一尊苔石巨人。它身上的青苔最怕火。', '對了……森林西北角有一棵「會讓路的樹」。聽說要等遺跡的魔像倒下，森林才會醒來。']);
  },
  *grandpa() { yield* sayAll(['年輕人，一直按著方向走，就會自己跑起來喔。（想慢慢走的話，在「設定→跑步」改成按住B鍵。）', '你說你們那邊有不用馬就能跑的鐵箱子？……真是難以想像啊。', Game.st.flags.golem ? '聽說魔像倒下的那晚，鎮上那口老井發出了光。' : '鎮上那口老井，據說跟遺跡是連在一起的。']); },
  *florist() {
    const f = Game.st.flags, st = Game.st;
    if (!f.q1) {
      yield* sayAll(['魔物分成好幾個種族喔。獸、蟲和植物怕火，會飛的和軟軟的怕雷，石像怕水和草。', '……對了，你有看到我弟弟小麥嗎？', '他說要去晨霧道路採藥草，到現在都還沒回來……']);
      if (yield* yesNo('要幫忙找小麥嗎？')) { f.q1 = 1; yield* say('謝謝你！他穿著黃色的衣服，應該就在道路的某處……拜託你了！'); } else yield* say('……這樣啊。要是看到他，請叫他回家。');
      return;
    }
    if (!f.q1res) { yield* say('小麥還沒回來……晨霧道路上草叢很多，他會不會躲在哪裡？'); return; }
    if (!f.q1done) {
      f.q1done = 1;
      if (f.q1res === 'home') { yield* sayAll(['小麥回來了！還跟我道了歉……', '他說想變得跟你一樣強。這是謝禮，請收下！']); st.bag.superPotion = (st.bag.superPotion || 0) + 2; st.money += 300; yield* itemGet(st.name + '得到了好傷藥×2和300 G！'); }
      else { yield* sayAll(['你說小麥沒事？……他在做什麼，你不能告訴我？', '……好吧，我相信你。只要他平安就好。', '謝謝你特地去找他。這是一點心意。']); st.bag.superPotion = (st.bag.superPotion || 0) + 1; st.money += 200; yield* itemGet(st.name + '得到了好傷藥×1和200 G！'); }
      return;
    }
    yield* say(f.q1res === 'home' ? '小麥說要先在鎮上好好練習劍術，再去冒險。' : '最近小麥常常晚回家，手上還多了好多傷……你知道些什麼嗎？');
  },
  *lostBoy(ow, ent) {
    const f = Game.st.flags, st = Game.st;
    if (f.q1res === 'secret') { yield* say('我會小心的！等我變強了，再光明正大地告訴姊姊。'); return; }
    yield* sayAll(['哇！……什、什麼嘛，是你啊。', '我才沒有迷路！我是在這裡偷偷練劍。', '姊姊老是說冒險很危險……可是我也想變得跟你一樣強。']);
    const r = yield* ask('要怎麼做？', ['勸他回家', '幫他保密'], { cancel: false });
    if (r === 0) { f.q1res = 'home'; yield* sayAll(['……你說得對，姊姊一定很擔心。', '我先回家跟她道歉。謝謝你！']); if (ow && ent) ow.npcs = ow.npcs.filter(n => n !== ent); }
    else { f.q1res = 'secret'; st.bag.ether = (st.bag.ether || 0) + 1; yield* say('真的嗎！謝謝你！這個給你，是我在草叢裡撿到的。'); yield* itemGet(st.name + '得到了活力茶！'); yield* say('記得回去跟姊姊說我沒事喔！'); }
  },
  *healer() {
    const st = Game.st, cost = st.lv * 15; const ok = yield* yesNo('歡迎來到旅店！住一晚是' + cost + ' G，要休息嗎？');
    if (ok && st.money < cost) { yield* say('哎呀，錢好像不太夠呢……'); return; }
    if (ok) { st.money -= cost; st.respawn = { map: 'inn', x: 4, y: 4, dir: 'up' }; yield* say('好的，請稍等一下。'); yield* healRitual(); yield* sayAll(['讓你久等了！你的體力已經完全恢復了。', '歡迎再來喔！']); }
    else yield* say('歡迎再來喔！');
  },
  *traveler() { if (Game.st.flags.golem) { yield* sayAll(['你真的打倒魔像了？……', '魔王復活的傳聞，王都那邊也開始流傳了。', '我得趕快把這件事告訴王都的朋友。']); return; } yield* sayAll(['我在古岩遺跡附近見過那隻魔像……', '它的拳頭開始發光、凝聚力量時，下一擊非常可怕。', '那時候就選「防禦」，能擋下一半的傷害！']); },
  *clerk() { yield* shopFlow(); },
  *customer() { if (Game.st.flags.croc) { yield* say('騎士長劍是王都騎士團在用的劍！好想要喔……'); return; } yield* sayAll(['鐵劍好貴啊……不過攻擊會提升很多呢。', '魔法護符能提高魔攻，水流刃和落雷也會變強喔！']); },
  *hiker() { const hf = Game.st.flags; if (hf.mineOpen && !hf.bandit) { yield* sayAll(['東邊的廢棄礦坑被盜賊佔據了。商隊被搶的貨物應該就藏在裡面。', '入口在道路東側的小路盡頭。盜賊頭目「鐵斧」格倫會蓄力揮斧，那時候記得防禦！']); return; } if (Game.st.flags.wolf) { yield* sayAll(['狂牙狼被你打倒了？難怪最近路上安靜多了！', '精英魔物身上常常會掉出好東西喔。']); return; } yield* sayAll(['嘿！這條路上的草叢很深，常有魔物跳出來。', '受傷了就回萌芽鎮的旅店休息吧。', '過了河之後，還有一座能恢復體力的泉水喔！']); },
  *girl2() { yield* sayAll(Game.st.flags.croc ? ['你打倒了沼澤鱷？太好了，終於可以過橋了！'] : ['橋頭那隻沼澤鱷好兇……', '聽說水棲的魔物最怕雷和草的攻擊。']); },
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
      yield* sayAll(['古岩魔像的眼睛亮起了紫黑色的光！', '「……異界之人……」', '「……王……即將……甦醒……」', '（魔像被魔王的瘴氣侵蝕了！）']);
      const res = yield* ow.battleScript({ sp: 'golem', lv: MAPS.ruins.boss.lv, kind: 'boss' });
      ow.bossGlow = 0;
      if (res === 'win') {
        Game.st.flags.golem = 1; ow.boss = null; Sound.stop(); ow.camDY = -24;
        Sound.sfx('quake'); Game.shake = 60; yield* wait(40);
        yield* say('古岩魔像化為碎石，崩塌了……');
        Game.shake = 50; Sound.sfx('quake'); yield* wait(30); Game.st.flags.gateOpen = 1; Sound.sfx('door');
        yield* say('瘴氣散去，遺跡深處的「異界之門」再次亮了起來！');
        yield* visionScene();
        yield* fadeOut(40, '#ffffff'); saveGame();
        Game.setScene(new EndingScene()); Game.sys.push(fadeIn(30));
      }
    })();
  },
};
Object.assign(Events, QUEST_EVENTS, MINE_EVENTS);
function* itemGet(text) { const fr = Sound.jingle('item'); const t = new TextBox(text); UI.push(t); let i = 0; while (!t.done || i < fr) { if (i > 20 || t.state === 'type') t.update(); i++; yield; if (t.done && i >= fr) break; } UI.remove(t); }
function* visionScene() {
  yield* fadeOut(24, '#ffffff'); let t = 0;
  const v = { draw(x) { t++; drawStreet(x, t, { vision: 1 }); } }; UI.push(v); Game.fadeColor = '#ffffff';
  yield* fadeIn(40); Sound.sfx('heal');
  yield* sayAll(['門的另一邊……是熟悉的街道。', '紅綠燈、自動販賣機、每天放學走的路。', '……這只是回憶。門不會帶我回去。']);
  v.fading = 1; for (let i = 0; i < 40; i++) { Game.fade = i / 40 * 0.85; Game.fadeColor = '#ffffff'; yield; }
  UI.remove(v); Game.fade = 1; Game.fadeColor = '#000';
  yield* blackText(['街道的影像碎裂了，', '取而代之的，是一座被黑雲包圍的城堡。', '「……異界之人……」', '「……五百年了……這次，我不會再輸……」', '——黯滅之王，札爾格斯。']);
  Sound.sfx('charge'); yield* blackText(['手上的光芒變得滾燙。', '浮現出一個太陽般的紋章——「曙光之印」。', '……我明白了。', '這個世界，就是我要守護的地方。']);
  Game.fade = 0;
}

function* classTalk() {
  const st = Game.st, C = CLASSES, cur = C[st.cls]; let opts = [];
  if (!st.cls) opts = ['swordsman', 'mage', 'guardian', 'ranger']; // saves from before the opening ceremony
  else if (cur && cur.tier === 1 && st.lv >= 14) opts = Object.keys(C).filter(k => C[k].from === st.cls);
  if (st.flags.hiddenCls && st.cls !== 'otherworlder') opts.push('otherworlder');
  if (st.flags.spellbladeOk && st.cls !== 'spellblade') opts.push('spellblade');
  if (!opts.length) return false;
  yield* say(!st.cls ? '你的力量開始覺醒了……要選擇一條道路嗎？' : '你已經走得很遠了。要踏上新的道路嗎？');
  while (true) {
    const r = yield* ask('要選擇哪個職業？', opts.map(k => C[k].n).concat(['再想想']));
    if (r < 0 || r >= opts.length) { yield* say('想好了再來找我吧。'); return true; }
    const k = opts[r]; yield* say(C[k].n + '：' + C[k].d + '\n職業技能「' + MOVES[C[k].move].n + '」' + (C[k].move2 ? '、Lv' + C[k].lv2 + '「' + MOVES[C[k].move2].n + '」' : ''));
    if (!(yield* yesNo('確定要成為' + C[k].n + '嗎？'))) continue;
    if (k === 'spellblade' || k === 'otherworlder') { if (st.cls && CLASSES[st.cls] && CLASSES[st.cls].tier < 3) st.baseCls = baseClassOf(st.cls); } st.cls = k; clampHP(); yield* itemGet(st.name + '成為了' + C[k].n + '！');
    if (!C[k].from && C[k].tier === 1) { st.skills = st.skills || {}; for (const id of CLASS_FREE[k]) grantSkill(id, st); } else { const first = (SKILL_TREES[k] || [])[0]; if (first) { grantSkill(first[0], st); yield* say('學會了職業技能「' + MOVES[first[0]].n + '」！更多' + C[k].n + '的技能可以在「技能」選單學習。'); } }
    return true;
  }
}

/* ===================== SAVE ===================== */
const SAVE_KEY = 'dawnlight_save_v10', SET_KEY = 'dawnlight_settings_v1';
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(Game.st)); return true; } catch (e) { return false; } }
function loadGame() { try { const s = localStorage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function saveSettings() { try { localStorage.setItem(SET_KEY, JSON.stringify(Game.settings)); } catch (e) { } }
function loadSettings() { try { const s = localStorage.getItem(SET_KEY); if (s) Object.assign(Game.settings, JSON.parse(s)); } catch (e) { } }
function newGameState(name) {
  const st = { name, lv: 1, exp: expForLevel(1), hp: 1, status: null, moves: [{ id: 'slash', pp: 35 }, { id: 'glare', pp: 30 }, { id: 'flameSlash', pp: 25 }], boost: {}, equip: { weapon: null, head: null, body: null, feet: null, acc1: null, acc2: null }, gear: [], gid: 0, skills: {}, bag: { phone: 1 }, money: 1000, flags: {}, map: 'home', x: 1, y: 3, dir: 'right', respawn: { map: 'home', x: 1, y: 4, dir: 'up' }, time: 0, steps: 0, wins: 0 };
  Game.st = st; st.equip.body = makeGear('uniform', 1, 1).u; st.equip.feet = makeGear('schoolShoes', 1, 1).u; st.hp = heroStats(st).hp; return st;
}
function startOverworld() { const st = Game.st; migrateGear(st); migrateVs(st); migrateSkills(st); splitPoints(st); if (!st.tal) { st.tal = {}; st.tp = (st.tp || 0) + Math.max(0, st.lv - 5); } const ow = Game.ow = new Overworld(); Game.setScene(ow); ow.load(st.map, st.x, st.y, st.dir); if (st.skillNote) ow.run(skillUpdateNote(st)); else if (st.pointNote) ow.run(pointUpdateNote(st)); return ow; }

/* ===================== SHARED ART: logo, title, modern street ===================== */
function makeLogo(text, sc) {
  const w = Font.widthPx(text) + 2, base = mkCanvas(w, 14), bx = base.getContext('2d'); Font.drawPx(bx, text, 0, 0, '#ffffff', null);
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
  { const C = '#5a3462'; x.fillStyle = C; x.fillRect(8, 142, 40, 24); x.fillRect(4, 132, 9, 34); x.fillRect(43, 134, 9, 32); x.fillRect(22, 124, 12, 22);
    for (let i = 8; i < 48; i += 4) x.fillRect(i, 140, 2, 2); pxPoly(x, [[3, 132], [8.5, 121], [14, 132]], C); pxPoly(x, [[42, 134], [47.5, 123], [53, 134]], C); pxPoly(x, [[21, 124], [28, 110], [35, 124]], C);
    x.fillStyle = '#ffd070'; for (const [a, b] of [[7, 138], [26, 130], [46, 140], [16, 150], [36, 152]]) x.fillRect(a, b, 2, 3); x.fillStyle = C; x.fillRect(28, 104, 1, 7); x.fillStyle = '#c84a50'; x.fillRect(29, 104, 4, 2); }
  mtn('#50305a', [[0, 186], [30, 170], [70, 182], [110, 168], [150, 180], [176, 172]]);
  const gs = tinted(buildShaded(ART.golem, 36, 36 / 64), '#2a1a36'); x.drawImage(gs, 132, 142); x.fillStyle = '#ffe040'; x.fillRect(144, 152, 2, 1); x.fillRect(149, 152, 2, 1);
  mtn('#2a1c3c', [[0, 204], [40, 194], [90, 202], [140, 192], [176, 198]]);
  x.fillStyle = '#181024'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 214); x.lineTo(40, 208); x.lineTo(76, 216); x.lineTo(96, 232); x.lineTo(104, H); x.fill();
  const hs = tinted(heroBattleImg(0, 'woodSword'), '#181024'); x.drawImage(hs, 14, 150);
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
    Font.drawR(x, 'v10.4', W - 3, H - 13, '#b890b0', null);
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
    const lines = [['曙光冒險', 'big'], ['第一章「異界的旅人」', 'sub'], ['完', 'sub'], [''], ['回不去的故鄉，'], ['留在了心裡。'], [''], ['在這個世界，'], [st.name + '選擇了拿起武器。'], [''], ['黯滅之王札爾格斯的陰影'], ['正在北方擴散——'], ['曙光的冒險，才剛開始。'], [''], ['— 冒險記錄 —', 'sub'], ['旅人　' + st.name], ['等級　Lv.' + st.lv], ['戰鬥勝利　' + (st.wins || 0) + ' 次'], ['遊玩時間　' + Math.floor(mins / 60) + '小時' + (mins % 60) + '分'], [''], ['感謝遊玩！', 'sub'], [''], ['按 A 鍵繼續探索', 'hint']];
    let yy = H + 10 - this.y; this.maxY = H + 10 + lines.length * 18 - 230;
    for (const [s, k] of lines) {
      if (k === 'big') { if (!this.logo) this.logo = makeLogo(s, 2); x.drawImage(this.logo, Math.round(W / 2 - this.logo.width / 2), yy - 8); yy += 36; continue; }
      if (k === 'hint' && Math.floor(this.t / 30) % 2) { yy += 18; continue; }
      Font.drawC(x, s, W / 2, yy, k === 'sub' ? '#ffe0a0' : '#ffffff', '#2a1020'); yy += 18;
    }
  }
}

/* ===================== BOOT & LOOP ===================== */
const cv = document.getElementById('screen'); const ctx = cv.getContext('2d'); let SCALE = 0;
// backing store = logical 176×256 × integer SCALE; pixel art is scaled with nearest-neighbour, text is drawn at full resolution
function setScale(S) { S = clamp(S | 0, 1, 6); if (S === SCALE) return; SCALE = S; cv.width = W * S; cv.height = H * S; }
setScale(3);
function render() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.imageSmoothingEnabled = false; ctx.save();
  if (Game.shake > 0) { ctx.translate(rnd(-2, 2), rnd(-2, 2)); Game.shake--; }
  Game.scene.draw(ctx); UI.draw(ctx); drawTransition(ctx); drawToast(ctx); ctx.restore();
  if (Game.flash > 0) { ctx.globalAlpha = clamp(Game.flash, 0, 1); ctx.fillStyle = Game.flashColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; if (!Game.flashTween) Game.flash = Math.max(0, Game.flash - 0.04); }
  if (Game.fade > 0) { ctx.globalAlpha = clamp(Game.fade, 0, 1); ctx.fillStyle = Game.fadeColor; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
function tick() { Input.frame(); Game.frame++; if (Input.anyTapFrame) Sound.init(); if (Game.sys.length) Game.sys = Game.sys.filter(g => !g.next().done); Game.scene.update(); }
let lastT = performance.now(), accT = 0;
function loop(now) { accT += Math.min(120, now - lastT); lastT = now; let n = 0; if (Game.paused) accT = 0; while (accT >= 1000 / 60 && n < 4) { tick(); accT -= 1000 / 60; n++; } if (n) render(); requestAnimationFrame(loop); }

// ---- input bindings ----
const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right', KeyZ: 'a', KeyJ: 'a', Space: 'a', KeyX: 'b', KeyK: 'b', Escape: 'b', ShiftLeft: 'b', Backspace: 'b', Enter: 'start', KeyM: 'start', ShiftRight: 'select' };
window.addEventListener('keydown', e => { if (e.target && e.target.tagName === 'INPUT') return; const k = KEYMAP[e.code]; if (k) { e.preventDefault(); Game.touchUI = false; if (!e.repeat) Input.set(k, true); } });
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
  if (!Game.fixedScale) setScale(Math.ceil(s * (window.devicePixelRatio || 1)));
}
function boot(data) {
  try { document.fonts && document.fonts.load('500 12px "Noto Sans TC"'); } catch (e) { }
  loadSettings(); bindButtons(); fitScreen(); window.addEventListener('resize', fitScreen); if (window.visualViewport) window.visualViewport.addEventListener('resize', fitScreen);
  setTimeout(fitScreen, 100);
  if (data && data.st && data.st.map) { Game.st = data.st; startOverworld(); }
  else Game.setScene(new TitleScene());
  requestAnimationFrame(loop);
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(() => ({ st: (Game.scene instanceof Overworld && !Game.scene.script) ? Game.st : null })); } catch (e) { }
}
window.__fx = () => FX; window.__game = { setScale: S => { Game.fixedScale = 1; setScale(S); render(); }, Game, Input, Events, MAPS, shopFlow, SPECIES, Battle, Overworld, heroStats, newGameState, startOverworld, UI, say, yesNo, startMenu, summaryScreen, bagScreen, equipScreen, optionsScreen, shopFlow, pickMoveToForget, blackText, dexScreen, talentScreen, craftScreen, enhanceFlow, salvageFlow, recordScreen, checkAch, markVis, mapPct, totalPct, questMarks, Events, step(n = 1) { for (let i = 0; i < n; i++) tick(); render(); }, press(k, hold = 2, after = 6) { Input.set(k, true); for (let i = 0; i < hold; i++) tick(); Input.set(k, false); for (let i = 0; i < after; i++) tick(); render(); } };
try { if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(boot); else boot((window.claude && window.claude.hot && window.claude.hot.data) || {}); } catch (e) { boot({}); }
