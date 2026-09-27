/* ===================== v20 regions: story events & side quests (落日峽谷 / 幽光沼澤) =====================
   峽谷的信差 · 古代鐘聲 (hidden boss 沙丘巨蟲) · 犀角工匠 (smith → canyon recipes)
   迷路的藥師學徒 · 驅霧之燈 (boss 腐沼九頭蛇) · 魔女的去留 (spare / hand over 沼澤魔女) */
Object.assign(COM_GIVER, { c18: 'healer', c19: 'courier', c20: 'herbalist', c21: 'lampKeeper' });
Object.assign(NPC_WHERE, { courier: '落日峽谷・營地', lampKeeper: '幽光沼澤・入口' });
COMMISSIONS.c19.open = st => (st.flags.qCourier || 0) >= 2; COMMISSIONS.c20.open = st => (st.flags.qMira || 0) >= 3; COMMISSIONS.c21.open = st => (st.flags.qLamp || 0) >= 3;
if (typeof COM_TALK !== 'undefined') Object.assign(COM_TALK, { c19: ['那群鷹妖又回來了……', '可以幫我再趕走一些嗎？擊敗峽谷鷹妖×5。'], c21: ['燈塔那邊的路被枯木樹妖堵住了。', '幫我清一清吧，擊敗枯木樹妖×4。'] });
(NPC_ROLES.任務 || (NPC_ROLES.任務 = [])).push('courier', 'lampKeeper', 'mira'); (NPC_ROLES.情報 || (NPC_ROLES.情報 = [])).push('canyonBell', 'swampLamp1', 'swampLamp2', 'swampLamp3', 'miasma'); (NPC_ROLES.商店 || (NPC_ROLES.商店 = [])).push('witchNpc');
const wonOf = (sp, st = Game.st) => ((st.dex || {})[sp] || {}).won || 0;
const lampsLit = st => ['lamp1', 'lamp2', 'lamp3'].filter(k => st.flags[k]).length;
function syncRecipes(st = Game.st) { for (const R of RECIPES_V20) { const i = RECIPES.indexOf(R); if (i >= 0) RECIPES.splice(i, 1); } if (st && (st.flags.qHorn || 0) >= 2) RECIPES.push(...RECIPES_V20); }
{ const _so = startOverworld; startOverworld = function (...a) { syncRecipes(Game.st); return _so.apply(this, a); }; }
// hidden bosses stay hidden until summoned; lamps show their state
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) {
    _ld.call(this, id, x, y, dir, silent); const st = this.st;
    if (id === 'canyon' && !st.flags.wormCalled) this.boss = null;
    if (id === 'swamp' && !st.flags.fogClear) this.boss = null;
    for (const n of this.npcs) if (/^swampLamp\d$/.test(n.id) && st.flags['lamp' + n.id.slice(-1)]) n.frames = npcFrames('lampLit');
  };
}
const WITCH_SHOP = ['superPotion', 'hiEther', 'elixir', 'antidote', 'awakening', 'parlyzHeal', 'powerFruit'];
Object.assign(Events, {
  /* ----- 落日峽谷 ----- */
  *courier(ow) {
    const st = Game.st, f = st.flags; st.qBase = st.qBase || {};
    if (!f.qCourier) {
      yield* sayAll(['啊，是冒險者！太好了……', '我是信差露卡，負責在萌芽鎮和峽谷另一頭的村子之間送信。', '可是剛才一群峽谷鷹妖衝下來，把我的信件搶走了！', '那些鷹妖最喜歡亮晶晶的東西……信封上的封蠟被牠們當成寶物了。']);
      if (yield* yesNo('要幫露卡搶回信件嗎？（擊敗峽谷鷹妖×3）')) { f.qCourier = 1; st.qBase.harpy = wonOf('harpy'); Sound.sfx('select'); yield* say('真的嗎！謝謝你！鷹妖常在峽谷的草叢和岩壁附近出沒。'); }
      else yield* say('……這樣啊。要是改變主意，我會一直在營地等的。');
      return;
    }
    if (f.qCourier === 1) {
      const n = wonOf('harpy') - (st.qBase.harpy || 0);
      if (n < 3) { yield* say('信件還在鷹妖那裡……（擊敗峽谷鷹妖 ' + Math.max(0, n) + '/3）'); return; }
      f.qCourier = 2; Sound.jingle('item');
      yield* sayAll(['這些是……我的信！全部都在！', '咦？信件裡面混著一塊奇怪的銅片。上面刻著古老的紋路……', '這是峽谷北邊那口「古代的鐘」的碎片吧？聽說古鐘碎成了三塊。', '傳說只要把古鐘修好再敲響，沉睡在沙海底下的「沙丘巨蟲」就會醒來。', '這個給你吧。還有這些，是我的一點謝禮！']);
      st.bag.bellShard = (st.bag.bellShard || 0) + 1; st.money += 1200; yield* itemGet(st.name + '得到了古鐘碎片和1200 G！');
      return;
    }
    yield* sayAll([f.duneWorm ? '你把沙丘巨蟲打倒了！？峽谷的傳說要改寫了呢！' : '古鐘的碎片，一塊在峽谷西北角，一塊被岩角犀吞進了肚子裡……剩下一塊就是我給你的那塊。', '對了，峽谷偶爾會颳起沙塵暴。那種時候魔物會變得特別兇，要小心喔。']);
  },
  *canyonBell(ow) {
    const st = Game.st, f = st.flags, n = st.bag.bellShard || 0;
    if (f.duneWorm) { yield* say('修好的古鐘靜靜地掛著。風吹過的時候，會發出低沉的聲音。'); return; }
    if (f.wormCalled) { yield* say('鐘聲還在峽谷裡迴盪……沙丘巨蟲就在前面！'); return; }
    if (n < 3) { yield* say('一口古老的銅鐘。鐘身缺了三塊，敲不出聲音。\n（古鐘碎片 ' + n + '/3）'); return; }
    if (!(yield* yesNo('把三塊古鐘碎片嵌回鐘上，敲響古鐘嗎？'))) return;
    delete st.bag.bellShard; f.wormCalled = 1; Sound.sfx('charge'); yield* wait(20);
    for (let i = 0; i < 3; i++) { Sound.cry(20, 0.5, 0.6); Game.shake = 12; yield* wait(24); }
    yield* say('噹——噹——噹——\n鐘聲響徹了整座峽谷……');
    Sound.sfx('quake'); Game.shake = 50; yield* say('……腳下的沙開始隆起！'); ow.load('canyon', ow.p.x, ow.p.y, ow.p.dir, true); Sound.cry(40, 0.7, 0.5);
    yield* sayAll(['巨大的蟲從沙海裡鑽了出來！', '「……吵死了……吵死了吵死了……！」']);
    yield* Events.wormBoss(ow);
  },
  *wormBoss(ow) {
    const st = Game.st, f = st.flags; if (f.duneWorm) return;
    const res = yield* ow.battleScript({ sp: 'duneWorm', lv: MAPS.canyon.boss.lv, kind: 'boss' });
    if (res === 'win') { f.duneWorm = 1; ow.boss = null; Sound.sfx('quake'); yield* sayAll(['沙丘巨蟲鑽回了沙海深處……', '牠翻出來的沙裡，埋著古代商隊的財寶！']); st.money += 2500; yield* itemGet(st.name + '得到了2500 G！'); ow.load('canyon', ow.p.x, ow.p.y, ow.p.dir, true); }
  },
  *eliteWin_rockRhino(ow) {
    const st = Game.st, f = st.flags; if (f.rhinoLoot) return; f.rhinoLoot = 1;
    st.bag.rhinoHorn = 1; st.bag.bellShard = (st.bag.bellShard || 0) + 1; Sound.jingle('item');
    yield* itemGet('岩角犀的角掉了下來……旁邊還有一塊古鐘碎片！');
    yield* say('（得到了「岩角」和「古鐘碎片」。鐵匠好像很想要這種角。）');
  },
  /* ----- 幽光沼澤 ----- */
  *lampKeeper(ow) {
    const st = Game.st, f = st.flags, n = lampsLit(st);
    if (!f.qLamp) {
      yield* sayAll(['……居然有人走進這片沼澤。你是冒險者吧。', '我是守燈人。這片沼澤以前很漂亮，靠著三座「驅霧燈」擋住瘴氣。', '可是住在沼澤深處的蛇吸了瘴氣，長成了三顆頭的怪物……燈也一座座熄滅了。', '要重新點亮驅霧燈，需要「幽火之芯」。沼地鬼火身上就有。', '三座燈全部點亮，西南邊的瘴氣就會散開。那隻九頭蛇就在裡面。']);
      f.qLamp = 1; Sound.sfx('select'); yield* say('（任務「驅霧之燈」開始了。燈在沼澤的西北、東北和東南。）'); return;
    }
    if (f.hydra && f.qLamp < 3) {
      f.qLamp = 3; yield* sayAll(['……瘴氣完全散了。這是幾十年來第一次看見沼澤的星空。', '謝謝你。這是我們守燈人代代相傳的東西，請收下。']);
      st.money += 3000; st.bag.elixir = (st.bag.elixir || 0) + 2; yield* itemGet(st.name + '得到了3000 G和萬靈藥×2！'); return;
    }
    if (f.hydra) { yield* say('沼澤慢慢變回原本的樣子了。鬼火還是會在晚上出來跳舞就是了。'); return; }
    if (f.fogClear) { yield* say('瘴氣散開了！九頭蛇就在西南邊……小心牠的毒霧。'); return; }
    yield* say('驅霧燈點亮了' + n + '座。幽火之芯可以從沼地鬼火身上拿到。');
  },
  *swampLamp1(ow) { yield* lampEv(ow, 1); }, *swampLamp2(ow) { yield* lampEv(ow, 2); }, *swampLamp3(ow) { yield* lampEv(ow, 3); },
  *miasma() { yield* say('濃濃的紫色瘴氣擋住了去路。吸一口就頭昏眼花……\n（點亮沼澤裡的三座驅霧燈就能吹散）'); },
  *hydraBoss(ow) {
    const st = Game.st, f = st.flags; if (f.hydra) return;
    yield* sayAll(['三顆頭同時轉了過來……', '「嘶嘶……嘶……新鮮的……獵物……」']);
    const res = yield* ow.battleScript({ sp: 'hydra', lv: MAPS.swamp.boss.lv, kind: 'boss' });
    if (res === 'win') { f.hydra = 1; ow.boss = null; Sound.sfx('water'); yield* sayAll(['腐沼九頭蛇沉進了泥沼裡……', '沼澤的空氣一下子變得清新了。', '（回去告訴守燈人吧。）']); ow.load('swamp', ow.p.x, ow.p.y, ow.p.dir, true); }
  },
  *mira(ow) {
    const st = Game.st, f = st.flags;
    yield* sayAll(['救、救命！你是……冒險者！？', '我是藥草師爺爺的學徒米拉。來採沼苔，結果被一群腐沼蟾圍住了……']);
    Sound.sfx('exclaim'); ow.p.excl = 30; yield* wait(30); yield* say('腐沼蟾從泥巴裡跳出來了！');
    for (let i = 0; i < 2; i++) { const res = yield* ow.battleScript({ sp: 'bogToad', lv: 20 + i, kind: 'wild', pack: [i + 1, 2] }); if (res !== 'win') return; }
    f.qMira = 2; yield* sayAll(['……呼。得救了。', '謝謝你！我這就回森林去跟爺爺報平安。', '對了，這些沼苔分你一點！']); st.bag.bogMoss = (st.bag.bogMoss || 0) + 3; yield* itemGet(st.name + '得到了沼苔×3！');
    ow.load('swamp', ow.p.x, ow.p.y, ow.p.dir, true);
  },
  *eliteWin_bogWitch(ow) {
    const st = Game.st, f = st.flags; if (f.witchFate) return;
    yield* sayAll(['「……咳、咳……好久沒有被人打贏了……」', '「我叫薇奧拉。以前在萌芽鎮當藥師……藥草師那老頭子是我的師兄。」', '「做了一種禁忌的藥，被趕出了鎮子。之後就一直住在這片沼澤裡。」', '「……要把我交給鎮上的守衛嗎？還是……就這樣放過我？」']);
    const r = yield* ask('要怎麼處置魔女？', ['放過她', '交給鎮上的守衛'], { cancel: false });
    if (r === 0) {
      f.witchFate = 'spare'; yield* sayAll(['「……你這個人，真是奇怪。」', '「好吧。這本咒書送你。以後需要藥的話，來找我吧。」']);
      const g = makeGear(classGear('witchTome'), 4); yield* itemGet(st.name + '得到了' + gearName(g) + '！'); yield* say('（魔女薇奧拉會在沼澤裡開店了。）');
    } else {
      f.witchFate = 'turnin'; yield* sayAll(['「……是嗎。這也是報應吧。」', '（把魔女帶回萌芽鎮，交給了守衛。）', '守衛：「沼澤的魔女！？真是大功一件！這是懸賞金。」']);
      st.money += 3000; st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* itemGet(st.name + '得到了3000 G和天賦之書！');
    }
    ow.load('swamp', ow.p.x, ow.p.y, ow.p.dir, true);
  },
  *witchNpc() { const st = Game.st, f = st.flags; yield* say(f.hydra ? '「九頭蛇倒了？……哼，沼澤會變得無聊呢。來買藥吧。」' : '「嘻嘻，歡迎光臨。這些藥可是我的自信之作。」'); yield* shopFlow(WITCH_SHOP); },
});
function* lampEv(ow, i) {
  const st = Game.st, f = st.flags, k = 'lamp' + i;
  if (f[k]) { yield* say('驅霧燈發出青白色的光，四周的瘴氣淡了許多。'); return; }
  if (!f.qLamp) { yield* say('一座熄滅的古老路燈。燈芯是空的……'); return; }
  if (!(st.bag.wispFlame > 0)) { yield* say('熄滅的驅霧燈。需要放入「幽火之芯」。\n（沼地鬼火身上可以拿到）'); return; }
  if (!(yield* yesNo('要把幽火之芯放進驅霧燈嗎？'))) return;
  st.bag.wispFlame--; if (!st.bag.wispFlame) delete st.bag.wispFlame; f[k] = 1; Sound.sfx('heal'); Game.flashColor = '#a0ffc8'; yield* tween(12, t => Game.flash = t * 0.5); yield* tween(12, t => Game.flash = 0.5 * (1 - t));
  const n = lampsLit(st); yield* say('驅霧燈亮起來了！（' + n + '/3）');
  if (n >= 3) { f.fogClear = 1; Sound.sfx('charge'); Game.shake = 20; yield* sayAll(['三座燈的光連成一線……', '西南邊的瘴氣被吹散了！']); }
  ow.load('swamp', ow.p.x, ow.p.y, ow.p.dir, true);
}
// town side: the smith wants the 岩角; the herbalist's missing apprentice
{ const _sm = Events.smith; Events.smith = function* (ow, ent) {
    const st = Game.st, f = st.flags;
    if (st.vis && st.vis.canyon && !f.qHorn) { f.qHorn = 1; yield* sayAll(['你去過落日峽谷了？那裡有一種叫「岩角犀」的魔物。', '牠的角比鐵還硬，是打造沙漠裝備的最好材料。', '要是能弄到「岩角」，我就能打造一整套峽谷的裝備！']); yield* say('（任務「犀角工匠」開始了。）'); }
    else if (f.qHorn === 1 && st.bag.rhinoHorn) {
      delete st.bag.rhinoHorn; f.qHorn = 2; syncRecipes(st); yield* sayAll(['這就是岩角！……好重，好硬！', '等我一下！']); yield* fadeOut(16); for (let i = 0; i < 3; i++) { Sound.sfx('rock'); yield* wait(24); } yield* fadeIn(16);
      const g = makeGear(classGear('sandSaber'), 3); yield* sayAll(['第一把試作品。這把送你！', '以後帶素材來，峽谷和沼澤的裝備我都能打了。']); yield* itemGet(st.name + '得到了' + gearName(g) + '！'); yield* say('（打造清單增加了峽谷、沼澤的裝備和「星辰護符」。）');
    }
    yield* _sm.call(this, ow, ent);
  };
}
{ const _hb = Events.herbalist; Events.herbalist = function* (ow, ent) {
    const st = Game.st, f = st.flags;
    if (st.vis && st.vis.lake && !f.qMira) {
      yield* sayAll(['……啊，是你。能不能幫老頭子一個忙？', '我的學徒米拉去銀月湖南邊的「幽光沼澤」採沼苔，已經三天沒回來了。', '那片沼澤瘴氣很重……拜託你，去找找她吧。']);
      f.qMira = 1; yield* say('（任務「迷路的藥師學徒」開始了。）'); return;
    }
    if (f.qMira === 1) { yield* say('米拉還沒回來……沼澤就在銀月湖的南邊。'); return; }
    if (f.qMira === 2) {
      f.qMira = 3; yield* sayAll(['米拉平安回來了！真的太感謝你了。', '她說沼澤深處住著一個魔女……', f.witchFate ? '……薇奧拉嗎。她是我的師妹。謝謝你告訴我她的事。' : '……說不定，是我那個被趕出鎮子的師妹。', '這些是謝禮。以後有沼苔的話，也拿來給我吧。']);
      st.money += 2000; st.bag.elixir = (st.bag.elixir || 0) + 1; st.bag.hiEther = (st.bag.hiEther || 0) + 2; yield* itemGet(st.name + '得到了2000 G、萬靈藥和高級魔力藥水×2！'); return;
    }
    yield* _hb.call(this, ow, ent);
  };
}
{ const _eq = extraQuests; extraQuests = function (st, L) {
    _eq(st, L); const f = st.flags, qb = st.qBase || {}, sh = st.bag.bellShard || 0;
    if (f.qCourier) L.push({ n: '峽谷的信差', t: f.qCourier >= 2 ? '完成：幫信差露卡搶回了信件。' : '擊敗峽谷鷹妖，搶回露卡的信件（' + Math.min(3, Math.max(0, wonOf('harpy', st) - (qb.harpy || 0))) + '/3）。', done: f.qCourier >= 2, rw: '古鐘碎片、1200 G' });
    if (f.qCourier >= 2 || sh || f.wormCalled) L.push({ n: '古代鐘聲', t: f.duneWorm ? '完成：敲響古鐘，打倒了沙丘巨蟲。' : f.wormCalled ? '沙丘巨蟲出現了！在峽谷北邊的古鐘前。' : '收集三塊古鐘碎片（' + sh + '/3），到峽谷北邊敲響古鐘。', done: !!f.duneWorm, rw: '沙蟲裝備、2500 G' });
    if (f.qHorn) L.push({ n: '犀角工匠', t: f.qHorn >= 2 ? '完成：鐵匠可以打造峽谷和沼澤的裝備了。' : st.bag.rhinoHorn ? '把「岩角」交給萌芽鎮的鐵匠。' : '打倒落日峽谷的岩角犀，取得「岩角」。', done: f.qHorn >= 2, rw: '新的打造配方、砂漠彎刀' });
    if (f.qMira) L.push({ n: '迷路的藥師學徒', t: f.qMira >= 3 ? '完成：米拉平安回到了森林。' : f.qMira === 2 ? '米拉得救了。回迷霧森林找藥草師。' : '到幽光沼澤尋找藥草師的學徒米拉。', done: f.qMira >= 3, rw: '2000 G、萬靈藥、高級魔力藥水' });
    if (f.qLamp) L.push({ n: '驅霧之燈', t: f.qLamp >= 3 ? '完成：沼澤的瘴氣散去了。' : f.hydra ? '打倒了九頭蛇。回去找守燈人。' : f.fogClear ? '瘴氣散開了。到沼澤西南邊打倒腐沼九頭蛇。' : '用幽火之芯點亮三座驅霧燈（' + lampsLit(st) + '/3）。', done: f.qLamp >= 3, rw: '九頭蛇裝備、3000 G、萬靈藥×2' });
    if (f.witchFate || (st.vis && st.vis.swamp)) L.push({ n: '魔女的去留', t: f.witchFate === 'spare' ? '完成：放過了魔女薇奧拉。她在沼澤裡開了藥店。' : f.witchFate ? '完成：把魔女交給了鎮上的守衛。' : '沼澤西邊住著一個魔女。打贏她，再決定她的去留。', done: !!f.witchFate, rw: '魔女的咒書或懸賞金' });
  };
}
