/* ===================== CHAPTER 2 「曙光的王都」— story, side quests, commissions, bosses =====================
   Main story (st.flags.ch2):
     1 王都的騎士帶來召集令（萌芽鎮）→ 馬車去北方街道        2 抵達王都（莉婭帶路）
     3 國王：修好曙光鐘塔需要兩個「時之齒輪」（地下水道・金穗平原）   4 兩個齒輪裝上 → 鐘塔開門
     5 時計巨像倒下 → 宰相維克托搶走「曙光之心」逃往北方；國王給北境通行證
     6 霜之女王清醒 → 寒冰之鑰（北方山道解凍）        7 熔岩巨人 → 火之印（要塞之門打開）
     8 魔人維克托                                      9 影將莫爾德 → 取回曙光之心
    10 回到鐘塔敲響曙光鐘 → 第二章結局（之後：星見神殿） */
const ch2 = (st = Game.st) => (st && st.flags && st.flags.ch2) || 0;
const setCh2 = (n, st = Game.st) => { if (ch2(st) < n) st.flags.ch2 = n; };
const gearCount = (st = Game.st) => (st.flags.gearSewer ? 1 : 0) + (st.flags.gearPlains ? 1 : 0);
Object.assign(ELITE_TEXT, {
  blackFeather: ['「嘿，看看這是誰？異界來的小鬼？」', '「你的腦袋在王都可是很值錢的——上吧！」'],
  boarKing: ['（野豬王用前腳刨著地面，鼻子噴出白煙……）'],
  clockKnight: ['「……入侵者。」', '「鐘塔的時間，不許任何人打擾。」'],
  snowBear: ['（巨熊站了起來，比你高出兩倍……）'],
  frostLich: ['「女王的冰之祭壇，豈容凡人踏足……」'],
  youngDragon: ['（火龍幼體張開翅膀，喉嚨發出紅光！）'],
  duskCaptain: ['「……我曾經也是王國的騎士。」', '「現在，我只為影將大人揮劍。」'],
});
Object.assign(QUEST_CATS, { '第二章：曙光的王都': '主線', '黑羽盜賊團': '支線', '鐘錶師的懷錶': '支線', '牧羊女的煩惱': '支線', '失落的樂譜': '職業', '機工士之道': '職業', '雪峰寺的試煉': '職業', '龍騎士的試煉': '職業', '冰霜巫妖': '支線', '公主的心願': '支線', '騎士長的遺志': '支線', '星見神殿': '隱藏' });
(NPC_ROLES.任務 || (NPC_ROLES.任務 = [])).push('liaCap', 'clockmaker', 'plainsGirl', 'bardMaster', 'monkMaster', 'dragonElder', 'frostElder', 'princess', 'guildClerk', 'plainsFarmer', 'frostHunter', 'capSmith', 'capInnkeeper', 'clockApprentice', 'capScholar', 'priest', 'armorer', 'guildMaster', 'frostInnkeeper');
(NPC_ROLES.商店 || (NPC_ROLES.商店 = [])).push('capClerk', 'armorer', 'frostClerk', 'roadMerchant');
Object.assign(NPC_WHERE, { guildClerk: '王都・冒險者公會', capSmith: '王都・武具店', capInnkeeper: '王都・金雀旅店', plainsFarmer: '金穗平原', clockApprentice: '王都・鐘錶店', frostHunter: '霜語村', frostInnkeeper: '霜語村・暖爐旅店', priest: '王都・曙光教會', capScholar: '王都・學者的家', armorer: '王都・武具店', guildMaster: '王都・冒險者公會' });

/* ---------- commissions (c22–c35) ---------- */
Object.assign(COMMISSIONS, {
  c22: { n: '灰狼的毛皮', from: '公會櫃檯', d: '冬天快到了，公會想做一批防寒斗篷。請帶來灰狼皮×4。（北方街道）', need: { wolfPelt: 4 }, reward: { gold: 2500, items: { megaPotion: 2 } }, open: st => ch2(st) >= 2 },
  c23: { n: '街道的安全', from: '公會櫃檯', d: '北方街道的盜賊越來越多了。接下委託後，擊敗街道盜賊×5。', kill: ['roadBandit', 5], reward: { gold: 3000, items: { hiEther: 2 } }, open: st => ch2(st) >= 2 },
  c24: { n: '水道清掃', from: '公會櫃檯', d: '地下水道的汙泥姆堵住了排水口。接下委託後，擊敗汙泥姆×4。', kill: ['sludge', 4], reward: { gold: 3200, items: { elixir: 1 } }, open: st => ch2(st) >= 3 },
  c25: { n: '鏽鐵回收', from: '王都的鐵匠', d: '鏽掉的鐵熔了還能重打。請帶來鏽鐵片×4。（地下水道・鐘塔）', need: { rustScrap: 4 }, reward: { gold: 3000, items: { megaEther: 1 } }, open: st => ch2(st) >= 3 },
  c26: { n: '蜂蜜蛋糕', from: '旅店老闆', d: '想用金穗平原的野蜂蜜做招牌蛋糕。請帶來野蜂蜜×3。', need: { honey: 3 }, reward: { gold: 2800, items: { megaPotion: 2 } }, open: st => ch2(st) >= 3 },
  c27: { n: '稻草人騷動', from: '麥田的農夫', d: '稻草人半夜自己走進麥田……接下委託後，擊敗稻草人×5。', kill: ['scarecrow', 5], reward: { gold: 3500, items: { luckClover: 1 } }, open: st => ch2(st) >= 3 },
  c28: { n: '發條零件', from: '鐘錶店的學徒', d: '師父要修鐘塔的零件。請帶來發條×3和黃銅齒輪×2。', need: { spring: 3, brassGear: 2 }, reward: { gold: 4500, items: { megaEther: 2 } }, open: st => st.flags.colossus },
  c29: { n: '雪原的狼群', from: '雪原獵人', d: '雪狼把村子的獵物都搶走了。接下委託後，擊敗雪狼×5。', kill: ['snowWolf', 5], reward: { gold: 5000, items: { elixir: 2 } }, open: st => st.vis && st.vis.frostVillage },
  c30: { n: '暖爐的燃料', from: '暖爐旅店', d: '暖爐的柴火不夠了……聽說熔岩石可以燒一整個冬天。請帶來熔岩石×3。', need: { magmaStone: 3 }, reward: { gold: 5000, items: { megaPotion: 3 } }, open: st => st.vis && st.vis.emberPass },
  c31: { n: '亡魂的安息', from: '大主教', d: '冰晶洞窟裡有迷路的亡魂。接下委託後，擊敗霜之魂×4，讓他們安息。', kill: ['frostWraith', 4], reward: { gold: 5500, items: { tpBook: 1 } }, open: st => ch2(st) >= 5 },
  c32: { n: '虛空研究', from: '歷史學者', d: '想研究黯滅要塞的虛空碎片。請帶來虛空碎片×3。', need: { voidShard: 3 }, reward: { gold: 7000, items: { megaEther: 3 } }, open: st => ch2(st) >= 8 },
  c33: { n: '火蜥的鱗片', from: '武具店老闆', d: '想用火蜥鱗做耐火的盾。請帶來火蜥鱗×5。（赤焰山道）', need: { salamanderScale: 5 }, reward: { gold: 6500, items: { elixir: 2 } }, open: st => st.vis && st.vis.emberPass },
  c34: { n: '星塵的研究', from: '歷史學者', d: '傳說星見神殿的星塵記錄著初代勇者的旅程。請帶來星塵×4。', need: { starDust: 4 }, reward: { gold: 9000, items: { tpBook: 1 } }, open: st => ch2(st) >= 10 },
  c35: { n: '公會的試練', from: '公會長', d: '證明你的實力吧。接下委託後，擊敗黯滅騎士×4。', kill: ['duskKnight', 4], reward: { gold: 8000, items: { elixir: 3 } }, open: st => ch2(st) >= 8 },
});
Object.assign(COM_GIVER, { c22: 'guildClerk', c23: 'guildClerk', c24: 'guildClerk', c25: 'capSmith', c26: 'capInnkeeper', c27: 'plainsFarmer', c28: 'clockApprentice', c29: 'frostHunter', c30: 'frostInnkeeper', c31: 'priest', c32: 'capScholar', c33: 'armorer', c34: 'capScholar', c35: 'guildMaster' });
Object.assign(COM_TALK, {
  c22: ['公會想做一批防寒斗篷，北方的冬天很冷的。', '能幫忙帶4張灰狼皮回來嗎？'], c23: ['北方街道的盜賊越來越猖狂了……', '接下這個委託，擊敗5個街道盜賊吧。'], c24: ['地下水道的汙泥姆把排水口都堵住了。', '擊敗4隻汙泥姆就好！'],
  c25: ['鏽掉的鐵熔了還能重打。', '帶4片鏽鐵片來吧，水道和鐘塔都撿得到。'], c26: ['我想做一個金穗平原風味的蜂蜜蛋糕！', '可以幫我帶3罐野蜂蜜嗎？'], c27: ['稻草人半夜自己走進麥田，把麥子都割了……', '幫我擊敗5個稻草人吧！'],
  c28: ['師父說要修鐘塔的零件……', '可以幫我找3個發條和2個黃銅齒輪嗎？'], c29: ['雪狼把我們的獵物都搶走了。', '幫我擊敗5隻雪狼。'], c30: ['暖爐的柴火不夠了……', '聽說熔岩石可以燒一整個冬天。能帶3塊回來嗎？'],
  c31: ['冰晶洞窟裡有迷路的亡魂……', '請擊敗4個霜之魂，讓他們安息。'], c32: ['要塞裡的虛空碎片……研究它說不定能找到打倒魔王的方法。', '帶3塊回來吧。'], c33: ['我想做一面耐火的盾。', '火蜥鱗，5片。拜託了。'],
  c34: ['星塵裡記錄著初代勇者的旅程……', '帶4份星塵給我吧！'], c35: ['你的名字已經傳遍公會了。', '最後的試練：擊敗4個黯滅騎士。'],
});
Object.assign(COM_THANKS, { c22: '這下北方的冬天也不怕了！', c23: '街道安全多了，商人們都很感謝你。', c24: '水道通了！', c25: '好鐵！可以打出好東西了。', c26: '蛋糕一定會大受歡迎的！', c27: '麥田終於安靜了……', c28: '師父一定會很高興的！', c29: '村子的獵人們都很感謝你。', c30: '暖爐燒起來了！真暖和。', c31: '亡魂們終於可以安息了。', c32: '真是驚人的發現……', c33: '好鱗片！這面盾一定很耐燒。', c34: '星塵在發光……好像在說話一樣。', c35: '你已經是公會最強的冒險者了。' });

/* ---------- small helpers ---------- */
function* ch2Coach(ow, here) {
  const st = Game.st, f = st.flags, opt = [];
  if (here !== 'town') opt.push(['萌芽鎮', 'town', 19, 6]);
  if (here !== 'northRoad') opt.push(['北方街道', 'northRoad', 10, 37]);
  if (here !== 'capital' && (st.vis || {}).capital) opt.push(['王都艾爾德蘭', 'capital', 5, 27]);
  if (here !== 'frostVillage' && (st.vis || {}).frostVillage) opt.push(['霜語村', 'frostVillage', 2, 13]);
  const r = yield* ask('要去哪裡呢？（車資 200 G）', opt.map(o => o[0]).concat(['不用了']));
  if (r < 0 || r >= opt.length) return; if (st.money < 200) { yield* say('哎呀，車資不夠呢。'); return; }
  st.money -= 200; const [, m, x, y] = opt[r]; Sound.sfx('run'); yield* fadeOut(20); ow.load(m, x, y, 'down'); yield* wait(10); yield* fadeIn(20);
}
function* ch2Inn(name, respawn) {
  const st = Game.st, cost = st.lv * 15; const ok = yield* yesNo('歡迎來到' + name + '！住一晚是' + cost + ' G，要休息嗎？');
  if (ok && st.money < cost) { yield* say('哎呀，錢好像不太夠呢……'); return false; }
  if (ok) { st.money -= cost; st.respawn = respawn; yield* say('好的，請好好休息。'); yield* healRitual(); yield* say('早安！體力都恢復了吧？'); return true; }
  yield* say('歡迎再來。'); return false;
}
const CAP_SHOP = ['superPotion', 'megaPotion', 'hiEther', 'megaEther', 'elixir', 'antidote', 'awakening', 'parlyzHeal', 'smoke', 'returnWing', 'tpBook'];
const armoryStock = st => ['royalSword', 'royalDagger', 'courtStaff', 'royalTome', 'royalHelm', 'royalMail', 'courtRobe', 'royalGreaves', 'royalBadge']
  .concat(st.flags.colossus ? ['brassSword', 'gearStaff', 'clockMail', 'springBoots'] : [], st.flags.frostQueen ? ['frostBrand', 'glacierStaff', 'yetiFur', 'snowBoots'] : [], st.flags.lavaGiant ? ['flameBrand', 'volcanoStaff', 'magmaPlate', 'lavaBoots'] : []);
const FROST_SHOP = ['megaPotion', 'megaEther', 'elixir', 'antidote', 'awakening', 'parlyzHeal', 'burnHeal', 'frostHood', 'snowBoots', 'iceCharm'].filter(k => ITEMS[k] || GEAR[k]);
/* v24.7 the chapter-2 gear sold in shops had no price (the shop showed NaN and nothing could be bought) */
{ const T = { 5: 4200, 6: 6500, 7: 9500 }, S = { weapon: 1.25, body: 1.15, head: 0.9, feet: 0.85, acc: 1 };
  for (const k of new Set([...FROST_SHOP, ...armoryStock({ flags: { colossus: 1, frostQueen: 1, lavaGiant: 1 } })])) { const G = GEAR[k]; if (G && !G.price) G.price = Math.round((T[G.t] || G.t * 1000) * (S[G.slot] || 1) / 100) * 100; } }
/* v24.7 the well in 霜語村 used the 萌芽鎮 well event (rope → the old sewer → back to 萌芽鎮); it is its own frozen well now */
{ const _well = Events.well; Events.well = function* (ow) {
    const st = Game.st; if (st.map !== 'frostVillage') return yield* _well.call(this, ow);
    if (st.flags.frostWell) { yield* say('結了冰的井。敲開的洞又凍起來了。'); return; }
    yield* say('一口結了冰的井。井口的冰很厚，底下什麼也看不到。');
    if (!(yield* yesNo('要把冰面敲開看看嗎？'))) return;
    st.flags.frostWell = 1; Sound.sfx('rock'); st.bag.iceCrystal = (st.bag.iceCrystal || 0) + 2; yield* itemGet(st.name + '敲下了冰晶×2！');
    yield* say('冰底下只有更多的冰……看來這口井已經凍到底了。');
  };
}
function syncRecipesCh2(st = Game.st) { for (const R of RECIPES_CH2) { const i = RECIPES.indexOf(R); if (i >= 0) RECIPES.splice(i, 1); } if (st && ch2(st) >= 2) RECIPES.push(...RECIPES_CH2); }
{ const _so = startOverworld; startOverworld = function (...a) { syncRecipesCh2(Game.st); return _so.apply(this, a); }; }
// buildings that need a key (the clock tower)
{ const _ed = Overworld.prototype.enterDoor; Overworld.prototype.enterDoor = function* (b, dx, dy) { if (b.need && !Game.st.flags[b.need]) { Sound.sfx('bump'); yield* say(b.msg || '門打不開。'); return; } yield* _ed.call(this, b, dx, dy); }; }
// boss objects on the map stay hidden until their story step
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) {
    _ld.call(this, id, x, y, dir, silent); const st = this.st, f = st.flags;
    if (id === 'duskFort1' && !f.fireSeal) this.boss = null; // (you can't be here before anyway)
    if (id === 'starShrine' && ch2(st) < 10) this.boss = null;
    if (id === 'capital' && ch2(st) === 1) { setCh2(2); if (!f.liaCap) f.liaCap = 1; }
    if (id === 'frostVillage') st.vis = st.vis || {};
  };
}

/* ---------- main quest entry ---------- */
{ const _eq = extraQuests; extraQuests = function (st, L) {
    _eq(st, L); const f = st.flags, n = ch2(st); if (!n && !f.golem) return;
    const T = !n ? '王都派來的騎士雷恩正在萌芽鎮找你。（村長家附近）' : n === 1 ? '往北穿過北方街道，前往王都艾爾德蘭。（萌芽鎮的馬車也能直接送你到北方街道）' : n === 2 ? '到王都北邊的王城，謁見國王阿爾德里克。'
      : n === 3 ? '找回兩個「時之齒輪」：王都地下水道（王都西南的水道入口）和金穗平原的風車小屋。（' + gearCount(st) + '/2）→ 交給鐘錶師艾德' + (gearCount(st) >= 2 ? '　★兩個都找到了！' : '')
      : n === 4 ? '曙光鐘塔的門開了。登上鐘樓，重新啟動曙光鐘。' : n === 5 ? (f.northPass ? '宰相逃往北方。穿過霜語雪原，前往冰晶洞窟——北方山道被冰封住了。' : '回到王城向國王報告。')
      : n === 6 ? '北方山道解凍了。越過赤焰山道，進入熔岩坑道。' : n === 7 ? '火之印打開了要塞之門。穿過熔岩坑道深處，攻入黯滅要塞。' : n === 8 ? '宰相倒下了。登上要塞的王座之間，打倒影將莫爾德。'
      : n === 9 ? '取回了曙光之心。回到曙光鐘塔的鐘樓，敲響曙光鐘。' : '完成：曙光鐘再次響起，影將被封印了。';
    L.unshift({ n: '第二章：曙光的王都', t: T, done: n >= 10, rw: '第二章結局' });
    if (f.liaQuest) L.push({ n: '黑羽盜賊團', t: f.blackFeather ? '完成：打倒了盜賊頭目「黑羽」。' : '莉婭說北方街道的盜賊頭目「黑羽」就躲在街道西側的樹林裡。', done: !!f.blackFeather, rw: '莉婭的謝禮' });
    if (f.watchQ) L.push({ n: '鐘錶師的懷錶', t: f.watchQ >= 2 ? '完成：收下了艾德的謝禮。' : '找到鐘錶師艾德。', done: f.watchQ >= 2, rw: '古代懷錶' });
    if (f.sheepQ) L.push({ n: '牧羊女的煩惱', t: f.sheepQ >= 2 ? '完成：趕走了暴走野豬王。' : '金穗平原的暴走野豬王把羊群嚇跑了。打倒牠。', done: f.sheepQ >= 2, rw: '牧羊女的謝禮' });
    if (f.lichQ) L.push({ n: '冰霜巫妖', t: f.lichQ >= 2 ? '完成：打倒了冰霜巫妖。' : '村長婆婆說冰晶洞窟的冰之祭壇有巫妖。打倒牠。', done: f.lichQ >= 2, rw: '村長的寶物' });
    if (f.princessQ) L.push({ n: '公主的心願', t: f.princessQ >= 2 ? '完成：送給公主一顆冰晶。' : '公主想看看北方的雪。帶冰晶×2給她。（有' + (st.bag.iceCrystal || 0) + '）', done: f.princessQ >= 2, rw: '王國徽章' });
    if (f.captainQ) L.push({ n: '騎士長的遺志', t: f.captainQ >= 2 ? '完成：把騎士長的吊墜交給了莉婭。' : '把黯滅騎士長留下的吊墜拿給莉婭看。', done: f.captainQ >= 2, rw: '萬靈藥×3' });
    if (n >= 10) L.push({ n: '星見神殿', t: f.starGuardian ? '完成：打倒了星之守護者，看見了初代勇者的星圖。' : '鐘樓出現了通往星空的「星之門」。', done: !!f.starGuardian, rw: '星之守護' });
  };
}

/* ---------- story & NPC events ---------- */
Object.assign(Events, {
  /* ----- 萌芽鎮 ----- */
  *royalKnight(ow) {
    const st = Game.st, f = st.flags;
    yield* sayAll(['你就是打倒古岩魔像的「異界之人」嗎？', '我是王國騎士團的傳令兵。國王陛下有令——', '「北方的封印正在減弱，影子在北境的要塞裡蠢動。」', '「召集曙光之印的持有者，前往王都艾爾德蘭。」',
      '……你手上的紋章，就是曙光之印吧？和古書上畫的一模一樣。', '從萌芽鎮搭馬車到北方街道，再往北走就是王都。', '街道上的魔物很強，準備好再出發吧。（建議Lv20以上）']);
    st.bag.royalSummons = 1; f.ch2 = 1; yield* itemGet(st.name + '收下了「王都的召集令」！');
    yield* say('馬車夫在村長家旁邊等你。我先回王都覆命了！'); ow.load('town', ow.p.x, ow.p.y, ow.p.dir, true); saveGame();
  },
  *coachT(ow) { yield* say('要去王都嗎？北方街道離王都只有半天的路。'); yield* ch2Coach(ow, 'town'); },
  *coachN(ow) { yield* ch2Coach(ow, 'northRoad'); },
  *coachC(ow) { yield* ch2Coach(ow, 'capital'); },
  *coachF(ow) { yield* say('雪橇可以送你到任何地方……只要你付得起車資。'); yield* ch2Coach(ow, 'frostVillage'); },
  /* ----- 北方街道 ----- */
  roadAmbush(ow) {
    const st = Game.st, f = st.flags; if (f.liaMet) return null;
    return (function* () {
      f.liaMet = 1; Sound.sfx('exclaim'); ow.p.excl = 40; yield* wait(20);
      yield* sayAll(['「站住！把值錢的東西交出來！」', '樹叢裡跳出了兩個盜賊！']);
      for (let i = 0; i < 2; i++) { const res = yield* ow.battleScript({ sp: 'roadBandit', lv: 22 + i, kind: 'wild', pack: [i + 1, 2] }); if (res !== 'win') { f.liaMet = 0; return; } }
      yield* sayAll(['「可、可惡……撤退！」', '——「等一下！」', '一個穿著銀色鎧甲的少女跑了過來。', '「你一個人打倒了他們？好厲害……」',
        '「我是王國騎士團的見習騎士，莉婭。我是來迎接『異界之人』的——」', '「……咦？難道就是你！？」', '「太好了！王都就在北邊，我先回去通報，你一定要來喔！」']);
      f.liaCap = 1; yield* say('（莉婭跑回了王都。）');
    })();
  },
  *liaRoad() { yield* say('王都就在北邊！'); },
  *roadMerchant() { yield* say('往王都的商人都走這條路。要買點什麼嗎？'); yield* shopFlow(['superPotion', 'megaPotion', 'hiEther', 'antidote', 'parlyzHeal', 'awakening']); },
  *eliteWin_blackFeather() { const st = Game.st; st.money += 3000; yield* sayAll(['「……可惡……黑羽盜賊團……完了……」', '黑羽的斗篷底下掉出了一袋金幣。']); yield* itemGet(st.name + '得到了3000 G！'); },
  /* ----- 王都 ----- */
  *gateGuardS() { const n = ch2(); yield* say(n < 3 ? '歡迎來到王都艾爾德蘭！王城在北邊的大道盡頭。' : n < 10 ? '最近城裡到處都在說鐘塔的事。你就是那位勇者吧？' : '曙光鐘的聲音……聽了就覺得安心。'); },
  *gateGuardN() { const f = Game.st.flags; yield* say(f.northPass ? '有國王的通行證就可以通過。北方很冷，要小心。' : '北門外是霜語雪原。沒有國王的通行證，誰都不能出城。'); },
  *liaCap(ow) {
    const st = Game.st, f = st.flags, n = ch2();
    if (n <= 2) { yield* sayAll(['你來了！國王陛下在王城等你。', '沿著大道一直往北走就是王城。']); return; }
    if (!f.liaQuest) { f.liaQuest = 1; yield* sayAll(['對了，北方街道的盜賊……', '他們的頭目「黑羽」就躲在街道西側的樹林裡，騎士團一直抓不到他。', '如果你遇到他……不，你一定打得贏的！']); return; }
    if (f.blackFeather && f.liaQuest === 1) { f.liaQuest = 2; yield* sayAll(['你打倒黑羽了！？', '國王陛下知道了一定會嚇一跳……這是我的一點心意。']); st.bag.megaPotion = (st.bag.megaPotion || 0) + 3; st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* itemGet(st.name + '得到了特級傷藥×3和天賦之書！'); return; }
    if (f.captainQ === 1) { f.captainQ = 2; yield* sayAll(['……黯滅騎士長？', '……那是我的父親。五年前在北境失蹤的騎士團長。', '謝謝你……讓他解脫了。', '這把劍……你留著吧。父親一定也希望它繼續守護別人。']); st.bag.elixir = (st.bag.elixir || 0) + 3; yield* itemGet(st.name + '得到了萬靈藥×3！'); return; }
    yield* say(n < 4 ? '齒輪的事，鐘錶師艾德會告訴你。他的店在王城的東邊。' : n === 4 ? '鐘塔的門開了！鐘樓就交給你了！' : n < 9 ? '宰相竟然是叛徒……北方一定要小心！' : '謝謝你，勇者。'); },
  *capKid() { yield* say(ch2() >= 10 ? '鐘響了！我聽到了！' : '我長大要當騎士！像莉婭姊姊一樣！'); },
  *capWoman() { yield* say(ch2() < 5 ? '宰相大人最近好奇怪……每天晚上都一個人去鐘塔。' : '宰相竟然是魔王的手下……好可怕。'); },
  *capOld() { yield* sayAll(['五百年前，初代勇者就是敲響了鐘塔的「曙光鐘」，才把魔王的四將封印起來的。', '鐘停了以後……封印就一年比一年弱了。']); },
  *capMerchant() { yield* say('王都什麼都買得到！武具店在南邊的大街上。'); },
  *capBard() { yield* sayAll(['♪ 曙光的鐘聲響起時～　黑夜就會退去～', '……這是王都的老歌。你知道嗎？吟遊詩人公會就在那邊。']); },
  *manhole(ow) { if (ch2() < 3) { yield* say('鐵蓋子底下是王都的地下水道。好臭……'); return; } if (yield* yesNo('要從這裡下到地下水道嗎？')) { Sound.sfx('door'); yield* ow.warp('capSewer', 10, 22, 'up'); } },
  /* castle */
  *king(ow) {
    const st = Game.st, f = st.flags, n = ch2();
    if (n <= 2) {
      setCh2(3);
      yield* sayAll(['……你就是曙光之印的持有者嗎。', '我是這個國家的國王，阿爾德里克。', '五百年前，黯滅之王札爾格斯率領「四將」侵略這片大地。', '初代勇者敲響了王都的「曙光鐘」，用鐘聲的力量把四將一一封印。',
        '但是……五十年前，鐘停了。', '從那天起，封印一年比一年弱。北境要塞裡的「影將莫爾德」，最近開始甦醒了。', '要讓鐘重新響起，需要驅動鐘塔的兩個「時之齒輪」。']);
      yield* sayAll(['宰相維克托：「陛下，齒輪的下落已經查到了。」', '「一個被地下水道的溝鼠王偷走了……另一個，在金穗平原的風車小屋裡。」', '「……不過，那麼危險的事，交給一個孩子真的好嗎？」']);
      yield* sayAll(['國王：「曙光之印選擇了他。這就足夠了。」', '拜託你了，異界的勇者。齒輪找到了，就交給鐘塔旁邊的鐘錶師艾德。', '（王都西南角有地下水道的入口；金穗平原在王都的西門外。）']); saveGame(); return;
    }
    if (n === 5 && !f.northPass) {
      f.northPass = 1; st.bag.northPass = 1;
      yield* sayAll(['……維克托，竟然是影將的手下。', '他跟在我身邊二十年……我竟然一點都沒有察覺。', '曙光之心被帶走了，鐘就算修好了也不會響。', '請你追上他。這是北境的通行證——北門的守衛看到它就會放行。']);
      yield* itemGet(st.name + '得到了「北境通行證」！'); yield* say('穿過霜語雪原，就是北境。……拜託你了。'); saveGame(); return;
    }
    if (n >= 10) { yield* sayAll(['曙光鐘的聲音傳遍了整個王國。', '謝謝你，勇者。你是這個國家的英雄。', '……但是，四將還剩下三個。魔王也還在沉睡。', '需要你的時候……我會再派莉婭去找你的。']); return; }
    yield* say(n < 4 ? '時之齒輪……拜託你了。' : n === 4 ? '鐘塔的門開了嗎……鐘樓就拜託你了。' : n === 9 ? '曙光之心……你真的帶回來了！快去鐘樓吧！' : '北境很危險。一定要平安回來。');
  },
  *princess() {
    const st = Game.st, f = st.flags;
    if (!f.princessQ && ch2() >= 5) { f.princessQ = 1; yield* sayAll(['你要去北方嗎？', '我從來沒有看過雪……', '北方的冰晶，是不是像星星一樣閃閃發光？', '如果可以的話……能帶兩顆冰晶回來給我看看嗎？']); return; }
    if (f.princessQ === 1 && (st.bag.iceCrystal || 0) >= 2 && (yield* yesNo('要把冰晶×2送給公主嗎？'))) { st.bag.iceCrystal -= 2; f.princessQ = 2; yield* sayAll(['好漂亮……像是把冬天關在裡面一樣。', '謝謝你！這是我的護身符，送給你。']); const g = bpGift('royalBadge', 4); yield* itemGet(st.name + '得到了' + g.txt + '！'); return; }
    yield* say(f.princessQ === 2 ? '冰晶放在窗邊，晚上會發光喔。' : '父王最近總是很累的樣子……'); },
  *chancellor() { yield* say(ch2() < 4 ? '……異界之人啊。齒輪的事，就麻煩你了。（……他的眼神好冷。）' : '……鐘塔的事，辛苦你了。'); },
  *castleGuard1() { yield* say('國王陛下就在前面。'); },
  *castleGuard2() { const n = ch2(); yield* say(n < 5 ? '宰相大人最近常常不在王城……' : n < 10 ? '沒想到宰相大人竟然是……陛下這幾天都睡不好。' : '王城終於恢復平靜了。'); },
  *liaCastle() { yield* sayAll(['勇者！你回來了！', '王國的人都在說你的故事呢。', '下次……換我保護你！']); },
  /* church */
  *priest() {
    const st = Game.st; yield* say(ch2() >= 10 ? '曙光鐘又響了……願光明永遠照耀你。' : '願曙光保佑你。要讓我為你祈禱嗎？');
    if (yield* yesNo('要接受祝福（恢復HP、MP並記錄）嗎？')) { yield* healRitual('溫暖的光包圍了全身……'); saveGame(); yield* say('（已經記錄了冒險。）'); }
  },
  *nun() { yield* say('初代勇者的畫像就掛在這裡。……他和你一樣，手上有太陽的紋章。'); },
  /* clock shop */
  *clockmaker(ow) {
    const st = Game.st, f = st.flags, n = ch2(), c4 = comState('c4', st) || {};
    if (!f.watchQ && c4.res === 'returned') { f.watchQ = 1; }
    if (f.watchQ === 1) { f.watchQ = 2; yield* sayAll(['……你就是找回懷錶的那位旅人！', '那只懷錶是鐘塔的鑰匙錶。多虧了你，我才能打開鐘塔的機關室。', '這是謝禮。鐘塔裡找到的古代懷錶——它走得比別的錶快一點。']); const g = bpGift('ancientWatch', 4); yield* itemGet(st.name + '得到了' + g.txt + '！'); }
    if (n <= 2) { yield* say('我是鐘錶師艾德。……你是？國王陛下還沒見過你吧？先去王城吧。'); return; }
    if (n === 3) {
      if (gearCount(st) < 2) { yield* sayAll(['曙光鐘塔的升降機需要兩個「時之齒輪」才能動。', '一個被地下水道的溝鼠王偷走了，另一個在金穗平原的風車小屋……', '（時之齒輪 ' + gearCount(st) + '/2）']); return; }
      setCh2(4); f.towerOpen = 1; delete st.bag.timeGear;
      yield* sayAll(['兩個時之齒輪！你真的找回來了！', '……', '（艾德把齒輪裝進了懷錶形狀的鑰匙裡。）', '好了！鐘塔的門已經打開了。', '鐘樓上的「曙光鐘」，只有曙光之印的持有者才敲得響。', '去吧，勇者。讓五十年來停止的時間，重新走起來！']);
      Sound.sfx('door'); saveGame(); return;
    }
    if (n === 4) { yield* say('鐘塔的門開了！鐘樓在最上面。'); return; }
    if (n === 9) { yield* say('你把曙光之心帶回來了！快去鐘樓，把它放回鐘裡吧！'); return; }
    if (n >= 5 && n < 10) { yield* say('曙光之心被搶走了……沒有它，鐘就只是一塊廢鐵。一定要把它搶回來！'); return; }
    yield* say('曙光鐘又開始走了。這一次，我會好好守著它。');
  },
  *clockApprentice() { yield* say(Game.st.flags.colossus ? '師父說，時計巨像是初代勇者的朋友做的……' : '師父整天都在研究鐘塔的圖。'); },
  /* guild */
  *guildMaster() { yield* sayAll(['我是冒險者公會的公會長葛倫德。', '櫃檯可以接委託。職業的事也可以找我——王都有好幾個「上級職業」的導師，完成他們的試煉就能轉職。']); yield* ch2ClassTalk(); },
  *guildClerk() { yield* say('歡迎來到冒險者公會！委託都在這裡，完成了就回來找我吧。'); },
  *guildAdv1() { yield* say('聽說雪峰寺的武僧只要一拳就能打碎冰牆……'); },
  *guildAdv2() { yield* say('赤焰山道住著一個會騎龍的老人。……真的假的？'); },
  /* inn / shop / armory / houses */
  *capInnkeeper() { yield* ch2Inn('金雀旅店', { map: 'capInn', x: 4, y: 4, dir: 'up' }); },
  *capInnGuest() { yield* say('金穗平原的麵包真好吃……'); },
  *capClerk() { yield* shopFlow(CAP_SHOP); },
  *armorer() { yield* say('王國騎士團的裝備，這裡都有。'); yield* shopFlow(armoryStock(Game.st)); },
  *capSmith() {
    yield* say('我是王都的鐵匠。北方的素材，我都打得出來。');
    yield* smithMenu(Game.st.flags);
    yield* say('隨時再來！');
  },
  *capResident() { yield* say('我年輕的時候，鐘塔每天早上都會響……真懷念。'); },
  *capScholar() { yield* sayAll(['四將……影將莫爾德、還有另外三個。', '古書說，他們各自被封印在大陸的四個角落。', '曙光鐘的聲音，是靠鐘裡的「曙光之心」發出來的。北境那邊，另外還有霜之女王用冰守著影將的要塞。', '影將在北境。其他的……我還在查。']); },
  /* ----- 地下水道 ----- */
  *ratBoss(ow) {
    const st = Game.st, f = st.flags; if (f.ratKing) return;
    yield* sayAll(['一隻巨大的溝鼠坐在垃圾堆成的王座上。', '王座上鑲著一個發光的齒輪——時之齒輪！', '「吱——！這是本王的寶物！誰都不准碰！」']);
    const res = yield* ow.battleScript({ sp: 'ratKing', lv: MAPS.capSewer.boss.lv, kind: 'boss' });
    if (res === 'win') { f.ratKing = 1; f.gearSewer = 1; st.bag.timeGear = (st.bag.timeGear || 0) + 1; ow.boss = null; yield* say('溝鼠王倒下了。'); yield* itemGet(st.name + '取回了「時之齒輪」！（' + gearCount(st) + '/2）'); ow.load('capSewer', ow.p.x, ow.p.y, ow.p.dir, true); saveGame(); }
  },
  /* ----- 金穗平原 ----- */
  *windmill() { yield* say(Game.st.flags.harvestGolem ? '風車又開始轉了。' : '風車小屋。風車被什麼東西卡住了，一動也不動……'); },
  *harvestBoss(ow) {
    const st = Game.st, f = st.flags; if (f.harvestGolem) return;
    if (ch2() < 3) { yield* say('一座用麥稈和木頭做的巨大魔像，一動也不動地守在風車前。'); return; }
    yield* sayAll(['魔像的胸口，嵌著一個發光的齒輪。', '「……收穫……之時……」', '魔像背上的風車突然轉了起來！']);
    const res = yield* ow.battleScript({ sp: 'harvestGolem', lv: MAPS.goldPlains.boss.lv, kind: 'boss' });
    if (res === 'win') { f.harvestGolem = 1; f.gearPlains = 1; st.bag.timeGear = (st.bag.timeGear || 0) + 1; ow.boss = null; yield* say('收穫魔像散成了一堆麥稈。'); yield* itemGet(st.name + '取回了「時之齒輪」！（' + gearCount(st) + '/2）'); ow.load('goldPlains', ow.p.x, ow.p.y, ow.p.dir, true); saveGame(); }
  },
  *plainsFarmer() { yield* say(Game.st.flags.harvestGolem ? '風車又轉起來了！今年的麥子一定會豐收。' : '風車小屋被一個怪物佔領了……麥子都磨不成粉。'); },
  *plainsGirl() {
    const st = Game.st, f = st.flags;
    if (!f.sheepQ) { f.sheepQ = 1; yield* sayAll(['我的羊群被一頭好大的野豬嚇跑了……', '那是「暴走野豬王」。牠就在平原的南邊。', '冒險者，可以幫我趕走牠嗎？']); return; }
    if (f.sheepQ === 1 && f.boarKing) { f.sheepQ = 2; yield* sayAll(['野豬王被打倒了！？羊群都回來了！', '謝謝你！這是我織的……咦，太小了？那這個給你！']); st.bag.luckClover = (st.bag.luckClover || 0) + 1; st.money += 2500; yield* itemGet(st.name + '得到了幸運草和2500 G！'); return; }
    yield* say(f.sheepQ === 2 ? '咩～（羊群很開心。）' : '野豬王在平原的南邊……要小心喔！');
  },
  *eliteWin_boarKing() { if (Game.st.flags.sheepQ === 1) yield* say('（回去告訴牧羊女吧。）'); },
  /* ----- 曙光鐘塔 ----- */
  towerUp(ow) { return (function* () { Sound.sfx('door'); yield* ow.warp('clockTower2', 7, 13, 'up'); })(); },
  *eliteWin_clockKnight() { const st = Game.st; yield* sayAll(['發條騎士停了下來。長槍上刻著一個名字……', '「給我的朋友——曙光之印的勇者」。']); st.bag.spring = (st.bag.spring || 0) + 3; yield* itemGet(st.name + '得到了發條×3！'); },
  *dawnBell(ow) {
    const st = Game.st, f = st.flags, n = ch2();
    if (n === 9) { yield* Events.ch2Finale(ow); return; }
    if (n >= 10) { yield* say('曙光鐘靜靜地掛著。鐘身映著天空的顏色。'); return; }
    yield* say(f.colossus ? '巨大的鐘。中間的「心」被挖走了，只剩一個空洞。' : '巨大的銅鐘。上面刻著太陽的紋章——和手上的曙光之印一模一樣。');
  },
  *colossusBoss(ow) {
    const st = Game.st, f = st.flags; if (f.colossus) return;
    yield* sayAll(['鐘樓中央，一座巨大的發條巨像站了起來。', '胸口的時鐘指針，指著十一點五十九分。', '「……曙光之印……確認……」', '「……但是……還不夠……證明你的力量……！」']);
    const res = yield* ow.battleScript({ sp: 'clockColossus', lv: MAPS.clockTower2.boss.lv, kind: 'boss' });
    if (res !== 'win') return;
    f.colossus = 1; ow.boss = null; ow.load('clockTower2', ow.p.x, ow.p.y, ow.p.dir, true);
    yield* sayAll(['時計巨像跪了下來。胸口的時鐘，指向了十二點。', '「……合格……曙光之印的持有者……」', '「鐘……交給你了……」']);
    Sound.sfx('charge'); yield* wait(20);
    yield* sayAll(['——「辛苦你了，異界之人。」', '宰相維克托從陰影裡走了出來。', '「多虧了你，巨像終於倒下了。這下……我總算拿得到了。」', '維克托把手伸進了曙光鐘——', '鐘的中央，一顆發著金光的寶石被挖了出來！']);
    Sound.sfx('quake'); Game.shake = 30;
    yield* sayAll(['「這就是『曙光之心』。只要沒有它，鐘就永遠不會再響。」', '「影將莫爾德大人答應給我一副永遠不會老去的身體……」', '「五十年前讓鐘停下來的，也是我喔。呵呵呵……」', '「那麼，北境的要塞見吧。——如果你到得了的話。」']);
    yield* fadeOut(16); yield* wait(20); yield* fadeIn(16);
    yield* sayAll(['維克托被黑霧包圍，消失了。', '……', '——「勇者！」莉婭跑上了鐘樓。', '「宰相他……！我全都聽到了！」', '「快回王城告訴國王陛下！」']);
    setCh2(5); saveGame();
  },
  *starGate(ow) { if (yield* yesNo('星之門閃著光。要穿過去嗎？')) { Sound.sfx('charge'); yield* ow.warp('starShrine', 9, 19, 'up'); } },
  /* ----- 霜語雪原・霜語村 ----- */
  *iceCaveDoor(ow) { if (yield* yesNo('冰晶洞窟的入口。冷風從裡面吹出來……要進去嗎？')) yield* ow.warp('iceCave', 9, 22, 'up'); },
  *iceWall2() { yield* Events.iceWall(); },
  *iceWall() { yield* say('厚厚的冰牆擋住了通往北方的山道。敲起來硬得像鋼鐵……\n（冰晶洞窟深處好像有什麼東西在控制這些冰。）'); },
  *eliteWin_snowBear() { const st = Game.st; st.bag.snowPelt = (st.bag.snowPelt || 0) + 3; yield* itemGet(st.name + '得到了雪狼毛×3！'); },
  *frostKid() { yield* say('雪原的風會說悄悄話喔！……今天它說「好冷」。'); },
  *frostHunter() { yield* say(Game.st.flags.frostQueen ? '冰牆融化了！北邊的山道又能走了。' : '北邊的山道被冰封住了……聽說是冰晶洞窟的女王生氣了。'); },
  *frostInnkeeper() { yield* ch2Inn('暖爐旅店', { map: 'frostInn', x: 4, y: 4, dir: 'up' }); },
  *frostClerk() { yield* shopFlow(FROST_SHOP); },
  *frostElder() {
    const st = Game.st, f = st.flags;
    if (ch2() >= 5 && !f.frostMet) { f.frostMet = 1; yield* sayAll(['……你就是追著宰相的勇者嗎。', '幾天前，一群穿黑袍的人經過村子，往冰晶洞窟去了。', '從那天起，洞窟的「霜之女王」就發狂了，把北邊的山道整個凍住。', '女王本來是守護這片雪原的精靈……一定是被黑暗魔力控制了。', '拜託你，讓她清醒過來。']); }
    if (!f.lichQ && f.frostMet) { f.lichQ = 1; yield* sayAll(['還有一件事……洞窟的冰之祭壇上，住著一隻「冰霜巫妖」。', '如果能順便打倒牠，村子的孩子們就能安心去洞窟採冰晶了。']); return; }
    if (f.lichQ === 1 && f.frostLich) { f.lichQ = 2; yield* sayAll(['你打倒巫妖了！謝謝你。', '這是村子代代相傳的寶物，送給你吧。']); st.bag.elixir = (st.bag.elixir || 0) + 2; st.bag.powerFruit = (st.bag.powerFruit || 0) + 1; st.bag.wisdomFruit = (st.bag.wisdomFruit || 0) + 1; yield* itemGet(st.name + '得到了萬靈藥×2、力量果實和智慧果實！'); return; }
    yield* say(f.frostQueen ? '女王清醒了，雪原又恢復了平靜。謝謝你。' : '洞窟在雪原的西北邊。要小心。');
  },
  /* ----- 冰晶洞窟 ----- */
  *queenBoss(ow) {
    const st = Game.st, f = st.flags; if (f.frostQueen) return;
    yield* sayAll(['冰之王座上，坐著一位像冰雕一樣美麗的女王。', '她的眼睛裡，閃著不屬於她的紫色光芒。', '「……滾出去……這裡……不許……任何人……」']);
    const res = yield* ow.battleScript({ sp: 'frostQueen', lv: MAPS.iceCave.boss.lv, kind: 'boss' });
    if (res !== 'win') return;
    f.frostQueen = 1; f.frostPath = 1; ow.boss = null; setCh2(6); st.bag.frostKey = 1;
    yield* sayAll(['女王眼中的紫光消失了。', '「……我……做了什麼……」', '「一個穿黑袍的男人……把黑色的魔力種進了我的心裡……」', '「謝謝你，曙光之印的孩子。北方的山道，我這就解凍。」', '「那個男人往火山去了。他說……要用『火之印』打開要塞的大門。」']);
    yield* itemGet(st.name + '得到了「寒冰之鑰」！北方山道解凍了！'); ow.load('iceCave', ow.p.x, ow.p.y, ow.p.dir, true); saveGame();
  },
  *eliteWin_frostLich() { if (Game.st.flags.lichQ === 1) yield* say('（回霜語村告訴村長婆婆吧。）'); },
  /* ----- 赤焰山道・熔岩坑道 ----- */
  *lavaDoor(ow) { if (yield* yesNo('熔岩坑道的入口。熱風從裡面吹出來……要進去嗎？')) yield* ow.warp('lavaTunnel', 10, 22, 'up'); },
  *eliteWin_youngDragon() { const st = Game.st, f = st.flags; st.bag.dragonScale = (st.bag.dragonScale || 0) + 3; yield* itemGet(st.name + '得到了龍鱗×3！'); if (f.dragoonQ === 1 && !f.clsDragoon) { st.bag.dragonFlame = 1; yield* itemGet(st.name + '得到了「龍之火種」！（回去找龍騎士老人）'); } },
  *giantBoss(ow) {
    const st = Game.st, f = st.flags; if (f.lavaGiant) return;
    yield* sayAll(['岩漿湖的中央，一個巨人緩緩站了起來。', '牠的胸口，嵌著一枚燃燒的印章——火之印。', '「……黑袍的男人……說……燒掉……所有人……」']);
    const res = yield* ow.battleScript({ sp: 'lavaGiant', lv: MAPS.lavaTunnel.boss.lv, kind: 'boss' });
    if (res !== 'win') return;
    f.lavaGiant = 1; f.fireSeal = 1; st.bag.fireSeal = 1; ow.boss = null; setCh2(7);
    yield* sayAll(['熔岩巨人冷卻成了一座石像。', '石像的胸口，火之印還在發著光。']); yield* itemGet(st.name + '得到了「火之印」！');
    yield* say('坑道的最深處傳來沉重的聲音……要塞的大門打開了！'); ow.load('lavaTunnel', ow.p.x, ow.p.y, ow.p.dir, true); saveGame();
  },
  toFort(ow) { return (function* () { if (!Game.st.flags.fireSeal) { yield* say('一扇刻著火焰紋章的巨大石門。紋章的中間缺了一塊……'); ow.p.y = 2; ow.p.py = 2 * TS; return; } Sound.sfx('door'); yield* ow.warp('duskFort1', 10, 24, 'up'); })(); },
  /* ----- 黯滅要塞 ----- */
  fortUp(ow) { return (function* () { if (!Game.st.flags.victor) { yield* say('王座之間的階梯被黑色的結界封住了。'); ow.p.y = 2; ow.p.py = 2 * TS; return; } Sound.sfx('door'); yield* ow.warp('duskFort2', 8, 15, 'up'); })(); },
  *victorBoss(ow) {
    const st = Game.st, f = st.flags; if (f.victor) return;
    yield* sayAll(['「……真的來了啊，異界之人。」', '維克托轉過身。他的半張臉裂開了，裂縫裡透出紫色的光。', '「影將大人給了我力量。永遠不會老去、不會死去的身體！」', '「你就在這裡，成為第一個見證的人吧——！」']);
    const res = yield* ow.battleScript({ sp: 'victorDemon', lv: MAPS.duskFort1.boss.lv, kind: 'boss' });
    if (res !== 'win') return;
    f.victor = 1; ow.boss = null; setCh2(8);
    yield* sayAll(['「……不……不可能……」', '「我只是……不想變老……不想死而已……」', '維克托的身體化成了黑霧，消散了。', '王座之間的結界消失了。']); ow.load('duskFort1', ow.p.x, ow.p.y, ow.p.dir, true); saveGame();
  },
  *eliteWin_duskCaptain() { const f = Game.st.flags; if (!f.captainQ) { f.captainQ = 1; yield* sayAll(['黯滅騎士長倒下了。鎧甲裡掉出了一個舊舊的吊墜……', '吊墜裡，是一個小女孩的畫像。……那張臉，好像在哪裡見過。', '（把吊墜拿給莉婭看吧。）']); } },
  *moldBoss(ow) {
    const st = Game.st, f = st.flags; if (f.mold) return;
    yield* sayAll(['王座上坐著一個全身漆黑的騎士。', '他的手裡，握著發著金光的「曙光之心」。', '「……五百年了。」', '「那個男人用鐘聲把我關在這裡的時候，也是這樣的眼神。」', '「曙光之印……又一個異界之人。」', '「這一次，我不會再輸。」']);
    const res = yield* ow.battleScript({ sp: 'shadowGeneral', lv: MAPS.duskFort2.boss.lv, kind: 'boss' });
    if (res !== 'win') return;
    f.mold = 1; ow.boss = null; setCh2(9); st.bag.dawnHeart = 1;
    yield* sayAll(['「……又是……這個光……」', '「……但是……聽好了，異界之人……」', '「我只是四將之一……魔王大人……很快就會醒來……」', '影將的身體崩解成了無數的黑影，消散在要塞的黑暗裡。']);
    yield* itemGet(st.name + '取回了「曙光之心」！');
    yield* sayAll(['要塞開始搖晃了！', '——「勇者！這邊！」', '莉婭和騎士團衝進了王座之間！', '「宰相的部下都被我們抓住了！快，趁要塞還沒塌——回王都！」']);
    yield* fadeOut(30); ow.load('clockTower2', 7, 4, 'up'); yield* wait(20); yield* fadeIn(30);
    yield* sayAll(['……', '回到了曙光鐘塔的鐘樓。', '國王、艾德、莉婭……王都的人們都聚集在鐘樓下。', '（把曙光之心放回曙光鐘吧。）']); saveGame();
  },
  *ch2Finale(ow) {
    const st = Game.st, f = st.flags;
    if (!(yield* yesNo('要把「曙光之心」放回曙光鐘嗎？'))) return;
    delete st.bag.dawnHeart; Sound.sfx('charge'); yield* wait(30); Game.flash = 0.8; Game.flashColor = '#fff8d0';
    yield* sayAll(['曙光之心回到了鐘的中央。', '手上的曙光之印，發出了和寶石一樣的光——']);
    for (let i = 0; i < 3; i++) { Sound.cry(24, 0.6, 0.5); Game.shake = 14; yield* wait(30); }
    yield* sayAll(['噹——', '噹——', '噹——', '五十年來停止的鐘聲，傳遍了整個王國。', '北境的黑雲，一點一點地散去了。']);
    setCh2(10); saveGame(); yield* fadeOut(40, '#ffffff');
    st.map = 'clockTower2'; st.x = 7; st.y = 4; Game.setScene(new Ch2EndingScene()); Game.sys.push(fadeIn(30));
  },
  *starBoss(ow) {
    const st = Game.st, f = st.flags; if (f.starGuardian) return;
    yield* sayAll(['星空之下，一位由星光構成的騎士擋住了去路。', '「……曙光之印。初代勇者的後繼者啊。」', '「想看見他留下的星圖，就用你的力量證明吧。」']);
    const res = yield* ow.battleScript({ sp: 'starGuardian', lv: MAPS.starShrine.boss.lv, kind: 'boss' });
    if (res !== 'win') return;
    f.starGuardian = 1; ow.boss = null;
    yield* sayAll(['「……很好。」', '守護者化成了漫天的星光。', '星光在夜空中排成了一張地圖——大陸的四個角落，各有一顆紅色的星在閃爍。', '……四將的封印之地。', '（剩下的三顆紅星，一顆在東方的海上，一顆在南方的沙漠，一顆……在天空之上。）']);
    st.bag.tpBook = (st.bag.tpBook || 0) + 2; yield* itemGet(st.name + '得到了天賦之書×2！'); ow.load('starShrine', ow.p.x, ow.p.y, ow.p.dir, true); saveGame();
  },
});

/* ---------- chapter 2 ending ---------- */
class Ch2EndingScene extends EndingScene {
  draw(x) {
    x.drawImage(this.bg, 0, 0); x.fillStyle = 'rgba(28,20,8,0.6)'; x.fillRect(0, 0, W, H);
    const st = Game.st, mins = Math.floor((st.time || 0) / 3600);
    const lines = [['曙光冒險', 'big'], ['第二章「曙光的王都」', 'sub'], ['完', 'sub'], [''], ['五十年來停止的鐘，'], ['再一次響起。'], [''], ['影將莫爾德消失在北境的黑暗裡，'], ['但他留下了一句話——'], ['「魔王大人很快就會醒來。」'], [''],
      ['剩下的三將，'], ['東方的海、南方的沙漠、天空之上。'], [''], ['曙光的旅程，還沒有結束。'], [''], ['— 冒險記錄 —', 'sub'], ['旅人　' + st.name], ['等級　Lv' + st.lv], ['遊玩時間　' + Math.floor(mins / 60) + '小時' + (mins % 60) + '分'], [''],
      ['第三章　製作中', 'sub'], [''], ['按A繼續冒險', 'hint']];
    let yy = H + 10 - this.y; this.maxY = H + 10 + lines.length * 18 - 230;
    for (const [s, k] of lines) {
      if (k === 'big') { if (!this.logo) this.logo = makeLogo(s, 2); x.drawImage(this.logo, Math.round(W / 2 - this.logo.width / 2), yy - 8); yy += 36; continue; }
      if (k === 'hint' && Math.floor(this.t / 30) % 2) { yy += 18; continue; }
      Font.drawC(x, s, W / 2, yy, k === 'sub' ? '#ffe0a0' : '#ffffff', '#2a1a08'); yy += 18;
    }
  }
}

{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function (cfg, nr) {
    const self = this, g = _bs.call(this, cfg, nr); if (!cfg || cfg.id !== 'youngDragon' || !cfg.rematch) return g;
    return (function* () { const res = yield* g; const st = Game.st, f = st.flags;
      if (res === 'win' && f.dragoonQ === 1 && !f.clsDragoon && !st.bag.dragonFlame) { st.bag.dragonFlame = 1; yield* itemGet(st.name + '得到了「龍之火種」！（回去找龍騎士老人）'); }
      return res; })();
  };
}
