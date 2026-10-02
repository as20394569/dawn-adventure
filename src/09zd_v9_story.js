/* ===================== v9.0 one continuous story + a bigger world =====================
   Player request: merge chapter 1 and chapter 2 into one story, and expand the world and the story.
   - One main quest, in five acts, each step with a recommended level:
       第一幕「異界的旅人」 Lv1–11 · 第二幕「三枚古印」 Lv11–17 · 第三幕「北境之路」 Lv17–23
       第四幕「曙光的王都」 Lv22–31 · 第五幕「北境的影子」 Lv30–40 · 終幕 → 星見神殿
   - The chapter-1 credits after the 古岩魔像 became a short act card; the finale is 「曙光冒險」 終幕.
   - Story: the 黑袍人的收購單 can be shown to the king in front of the chancellor (it pays off when he is unmasked),
     格倫 comes back on 北方街道 after 黑羽, 諾拉 visits the capital (side quest 諾拉的麵包), epilogue lines for them.
   - World lore: 「記載之石」 stones in 17 places. Reading one adds it to 紀錄 → 世界的記載.
     The big reveal: the first hero also came through the 異界之門. */

/* ---------- acts ---------- */
const ACTS = [['序幕', '序幕'], ['第一幕', '異界的旅人'], ['第二幕', '三枚古印'], ['第三幕', '北境之路'], ['第四幕', '曙光的王都'], ['第五幕', '北境的影子'], ['終幕', '曙光之鐘']];
function actOf(st = Game.st) {
  const f = st.flags, n = f.ch2 || 0;
  if (!f.license) return 0; if (!f.golem) return (f.creekQ || 0) >= 3 || f.croc ? 2 : 1;
  if (n === 0 || (n === 1 && f.v81 && !f.passDone)) return 3; if (n < 5) return 4; if (n < 10) return 5; return 6;
}
{ const _ql = questList; questList = function (st = Game.st) {
    const L = _ql(st), f = st.flags, M = L.find(q => q.main), iC = L.findIndex(q => q.n === '第二章：曙光的王都');
    if (M) {
      if (f.golem && iC >= 0) { const C = L[iC]; M.t = C.t; M.done = C.done; L.splice(iC, 1); }
      const a = actOf(st); M.n = a ? ACTS[a][0] + '　' + ACTS[a][1] : '序幕'; M.rw = '故事推進';
      if (a === 6) M.t = '完成：曙光鐘再次響起了。' + (f.starGuardian ? '' : '（鐘樓出現了通往星空的「星之門」）');
    }
    return L;
  };
}
// the old chapter-1 credits → a short act card, then back to the world
EndingScene.prototype.draw = function (x) {
  x.drawImage(this.bg, 0, 0); x.fillStyle = 'rgba(16,8,28,0.66)'; x.fillRect(0, 0, W, H);
  const st = Game.st, lines = [['曙光冒險', 'big'], ['第二幕「三枚古印」', 'sub'], ['完', 'sub'], [''], ['古岩魔像倒下了。'], ['遺跡深處的異界之門，'], ['再一次亮了起來——'], ['但門的另一邊，'], ['只有一片黑雲。'], [''], ['回家的路，'], ['還沒有打開。'], [''],
    ['北方的封印，'], ['正在一點一點減弱。'], ['王都的傳令兵，'], ['已經在路上了。'], [''], ['第三幕', 'sub'], ['「北境之路」', 'sub'], [''], ['（回到萌芽鎮，'], ['騎士正在等你）'], [''], ['按A繼續冒險', 'hint']];
  let yy = H + 10 - this.y; this.maxY = H + 10 + lines.length * 18 - 230;
  for (const [s, k] of lines) {
    if (k === 'big') { if (!this.logo) this.logo = makeLogo(s, 2); x.drawImage(this.logo, Math.round(W / 2 - this.logo.width / 2), yy - 8); yy += 36; continue; }
    if (k === 'hint' && Math.floor(this.t / 30) % 2) { yy += 18; continue; }
    Font.drawC(x, s, W / 2, yy, k === 'sub' ? '#ffe0a0' : '#ffffff', '#2a1020'); yy += 18;
  }
};
Ch2EndingScene.prototype.draw = function (x) {
  x.drawImage(this.bg, 0, 0); x.fillStyle = 'rgba(28,20,8,0.6)'; x.fillRect(0, 0, W, H);
  const st = Game.st, f = st.flags, mins = Math.floor((st.time || 0) / 3600);
  const lines = [['曙光冒險', 'big'], ['終幕「曙光之鐘」', 'sub'], [''], ['五十年來停止的鐘，'], ['再一次響起。'], [''], ['影將莫爾德'], ['消失在北境的黑暗裡，'], ['但他留下了一句話——'], ['「魔王大人'], ['很快就會醒來。」'], [''],
    ['萌芽鎮的風車，'], ['今天也在轉。'], ...(f.noraBread ? [['諾拉的麵包店'], ['在王都開張了。']] : [['諾拉說，下次'], ['要去王都賣麵粉。']]), ...(f.grenTrust ? [['格倫當上了'], ['關道驛站的站長。']] : [['楓紅關道的驛站'], ['重新蓋好了。']]), ['莉婭成為了'], ['正式的騎士。'], [''],
    ['剩下的三將——'], ['東方的海、'], ['南方的沙漠、'], ['天空之上。'], ['還有，'], ['異界之門的另一邊。'], ...(f.homeChoice === 0 ? [['門的另一邊，'], ['有人在等你回家。']] : f.homeChoice === 1 ? [['不過，你已經'], ['找到了新的家。']] : []), [''], ['曙光的旅程，'], ['還沒有結束。'], [''], ['— 冒險記錄 —', 'sub'], ['旅人　' + st.name], ['等級　Lv' + st.lv], ['世界的記載　' + loreCount(st) + '／' + LORE.length],
    ['遊玩時間　' + Math.floor(mins / 60) + '小時' + (mins % 60) + '分'], [''], ['第三章　製作中', 'sub'], ['（之後的冒險會繼續更新）', 'sub'], [''], ['按A繼續冒險', 'hint']];
  let yy = H + 10 - this.y; this.maxY = H + 10 + lines.length * 18 - 230;
  for (const [s, k] of lines) {
    if (k === 'big') { if (!this.logo) this.logo = makeLogo(s, 2); x.drawImage(this.logo, Math.round(W / 2 - this.logo.width / 2), yy - 8); yy += 36; continue; }
    if (k === 'hint' && Math.floor(this.t / 30) % 2) { yy += 18; continue; }
    Font.drawC(x, s, W / 2, yy, k === 'sub' ? '#ffe0a0' : '#ffffff', '#2a1a08'); yy += 18;
  }
};

/* ---------- world lore: 記載之石 ---------- */
const LORE = [
  ['town', '萌芽鎮的由來', ['五百年前，戰爭結束後，一群失去家園的人在這裡種下了第一顆麥子。', '他們說，初代勇者北上之前，曾在這裡休息了一晚。', '村長家代代守著「覺醒的儀式」——據說，那是勇者留下來的東西。']],
  ['route', '晨霧道路的里程碑', ['石碑上刻著：「北境 三百里」。', '這條路是曙光軍當年一路鋪到北方的。', '每走一里，就埋下一塊刻著曙光紋章的石頭。']],
  ['windHills', '風車與風之精', ['丘陵上的風，是風之精吹起來的。', '磨坊的人和風之精有個約定：風車轉動的時候，要把第一袋麵粉留在山頂。', '只要約定還在，風之精就不會發怒。']],
  ['jadeCreek', '水神的約定', ['很久以前，碧溪谷的水被一條大鯰魚弄髒了。', '村人在源頭蓋了一座小祠，請水神住下來。', '從那天起，只要祠裡的燈籠還亮著，溪水就會一直清澈。']],
  ['forest', '森之記憶', ['迷霧森林裡最老的那棵樹，見過初代勇者。', '牠記得勇者說過一句奇怪的話：「這裡的星星，和我家鄉的不一樣。」', '……樹是不會說謊的。']],
  ['ruins', '異界之門', ['遺跡的壁畫上，畫著一扇發光的門，和一個穿著奇怪衣服的少年。', '少年的手背上，有一個和曙光之印一模一樣的紋章。', '壁畫旁邊刻著：「異界之人，從門中而來。」', '……初代勇者，也是從異界來的。']],
  ['canyon', '落日峽谷的警鐘', ['峽谷裡的古鐘，是用來警告魔王軍來襲的。', '鐘響三聲，就代表黑雲已經越過了北方的山。', '最後一次響起，是五百年前的事了。']],
  ['maplePass', '關道的驛站', ['戰爭結束後，王國在北方的山路上蓋了七座驛站。', '楓紅關道的驛站是第一座。', '門口的木牌寫著：「給往北去的人，一碗熱湯。」']],
  ['oldField', '曙光軍第三隊', ['五百年前，曙光軍第三隊在這裡擋住了魔王大軍七天七夜。', '他們讓勇者有時間趕到王都，敲響曙光鐘。', '第三隊一百二十人，沒有一個人回家。', '……他們的名字裡，有一個叫「漢斯」的磨坊學徒。']],
  ['lake', '月之民', ['銀月湖畔曾經住著「月之民」。他們看著月亮記錄時間。', '初代勇者離開之前，曾經請月之民幫他記下一個日子。', '那個日子，刻在湖心祭壇的背面——但沒有人讀得懂。']],
  ['swamp', '沼澤魔女的筆記', ['「瘴氣會聚在黑色的石頭裡。石頭越多，封印就越弱。」', '「只要把石頭埋在戰死者的土地上……死者就會醒來，封印就會鬆動。」', '……這是誰寫的？字跡很新。']],
  ['northRoad', '商人的傳聞', ['北方街道的商人說，黑羽盜賊團背後有「大人物」撐腰。', '他們收購的黑色石頭，全都運進了王都。', '「王都裡誰會要那種東西？」商人搖了搖頭。']],
  ['capital', '王都艾爾德蘭', ['王都是圍著曙光鐘塔蓋起來的城。', '鐘塔是初代勇者的三個夥伴一起建造的：一個鐘錶匠、一個騎士、一個祭司。', '勇者自己，在鐘第一次響起的那天晚上，就消失了。']],
  ['goldPlains', '收穫祭', ['金穗平原每年秋天都會舉辦收穫祭。', '祭典的最後，全王都的人會一起聽鐘聲。', '……但這五十年來，祭典的最後只剩下一片安靜。']],
  ['frostField', '霜之女王', ['霜之女王原本是守護北境的冰之精靈。', '她用冰把影將的要塞封了起來，一封就是五百年。', '魔王的瘴氣一點一點地滲進冰裡……她的心，也跟著凍住了。']],
  ['emberPass', '龍族的盟約', ['五百年前，龍族和初代勇者訂下了盟約。', '龍族把「火之印」交給人類，約好只要鐘還在響，就不會離開這座火山。', '鐘停了之後，年輕的龍就再也不聽長老的話了。']],
  ['starShrine', '初代勇者的星圖', ['星見神殿的天頂，畫著一張星圖。', '星圖的角落有一行小字，是這個世界沒有的文字。', '……你讀得懂。那是你故鄉的文字。', '「如果有下一個人來到這裡——門的鑰匙，在四將的心裡。」']],
];
const loreCount = (st = Game.st) => Object.keys(st.lore || {}).length;
{ // place each stone on a free ground tile near the map's first sign (or its centre): never on paths, doors, NPCs or corridors
  const free = (M, x, y) => { if (!M.rows[y] || M.rows[y][x] !== '.') return false; const k = x + ',' + y;
    if ((M.signs || {})[k] || (M.npcs || []).some(n => n.x === x && n.y === y) || (M.items || []).some(n => n.x === x && n.y === y) || (M.triggers || []).some(n => n.x === x && n.y === y) || (M.gathers || []).some(n => n.x === x && n.y === y) || (M.elites || []).some(n => n.x === x && n.y === y)) return false;
    if ((M.buildings || []).some(b => x >= b.x - 1 && x <= b.x + b.w && y >= b.y - 1 && y <= b.y + b.h + 1)) return false;
    let open = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const c = (M.rows[y + dy] || '')[x + dx]; if (c === '.' || c === ':' || c === ',') open++; }
    return open >= 6; };
  LORE.forEach(([m, t, lines], i) => { const M = MAPS[m]; if (!M || !M.rows) return;
    const s = Object.keys(M.signs || {})[0], [ax, ay] = s ? s.split(',').map(Number) : [Math.floor(M.rows[0].length / 2), Math.floor(M.rows.length / 2)];
    let spot = m === 'ruins' ? [4, 4] : null; for (let r = 1; r <= 9 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && free(M, ax + dx, ay + dy)) spot = [ax + dx, ay + dy];
    if (!spot) return; (M.npcs = M.npcs || []).push({ id: 'lore' + i, x: spot[0], y: spot[1], dir: 'down', look: 'loreStone', name: '記載之石' });
    Events['lore' + i] = function* () { yield* readLore(i); };
    if (typeof NPC_ROLES !== 'undefined') NPC_ROLES.情報.push('lore' + i);
    delete mapCache[m];
  });
}
{ const _nf = npcFrames; npcFrames = function (look) { if (look === 'loreStone') return STELE_FRAMES; return _nf(look); }; }
function* readLore(i) {
  const st = Game.st, [, t, lines] = LORE[i], L = st.lore || (st.lore = {}), first = !L[i];
  yield* say('刻著古老文字的「記載之石」。\n——「' + t + '」'); yield* sayAll(lines);
  if (first) { L[i] = 1; Sound.jingle('item'); yield* itemGet('「' + t + '」記在了冒險手記裡！（' + loreCount(st) + '／' + LORE.length + '）');
    if (loreCount(st) === LORE.length) { st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* itemGet('世界的記載全部讀完了！得到了天賦之書！'); } }
}
function* loreScreen() {
  const st = Game.st, have = LORE.map((l, i) => i).filter(i => (st.lore || {})[i]);
  if (!have.length) { yield* say('還沒有讀過任何「記載之石」。\n（各地的石碑上，記載著這個世界的歷史）'); return; }
  let idx = 0; while (true) {
    const r = yield* ask('世界的記載（' + have.length + '／' + LORE.length + '）', have.map(i => LORE[i][1]).concat(['關閉']), { index: idx }); if (r < 0 || r >= have.length) return; idx = r;
    yield* sayAll(LORE[have[r]][2]);
  }
}
{ const _rs = recordScreen; recordScreen = function* () { const r = yield* ask('要看什麼？', ['地圖・成就・稱號', '世界的記載', '對話紀錄']); if (r === 0) yield* _rs(); else if (r === 1) yield* loreScreen(); else if (r === 2) yield* dlgLogScreen(); }; }
if (typeof ACHIEVEMENTS !== 'undefined') ACHIEVEMENTS.push({ id: 'loreAll', n: '世界的記錄者', d: '讀完所有的「記載之石」。', cat: '探索', ok: st => loreCount(st) >= LORE.length });

/* ---------- the chancellor and the black order ---------- */
{ const _k = Events.king; Events.king = function* (ow) {
    const st = Game.st, f = st.flags, n0 = ch2(), pass0 = !!f.northPass;
    yield* _k.call(this, ow);
    if (n0 <= 2 && ch2() >= 3 && st.bag.blackOrder && !f.orderAsk) {
      f.orderAsk = 1; yield* say('（……楓紅關道找到的「黑袍人的收購單」。要給國王看嗎？）');
      const r = yield* ask('要怎麼做？', ['交給國王看', '先不要說']);
      if (r === 0) { f.orderShown = 1; yield* sayAll(['國王：「……瘴氣結晶的收購單？」', '宰相維克托：「陛下，盜賊的東西怎麼能相信呢。這種封蠟，隨便一個工匠都刻得出來。」', '（宰相笑著……但是握著文件的手，緊得發白。）', '國王：「……封蠟被刮掉了。我會派人去查。收單就先放在你那裡吧。」']); }
      else { f.orderHidden = 1; yield* sayAll(['（……宰相一直盯著你的包包。）', '（還是先別說了。）']); }
    }
    if (n0 === 5 && !pass0 && f.northPass && st.bag.blackOrder && !f.orderPaid) {
      f.orderPaid = 1;
      if (f.orderShown) { yield* sayAll(['國王：「……你給我看的那張收購單。」', '國王：「上面被刮掉的封蠟，正是宰相府的印。如果我那時候就相信你……」', '國王：「這是王家書庫裡最古老的一本書。拿去吧——算是我的道歉。」']); st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* itemGet('得到了天賦之書！'); }
      else { yield* sayAll(['（把「黑袍人的收購單」交給了國王。）', '國王：「……原來他那時候就在收集結晶了。」', '國王：「謝謝你。這份證據，會讓王國不再重蹈覆轍。」']); st.money += 3000; yield* itemGet('得到了3000 G！'); }
    }
  };
}

/* ---------- 格倫 on 北方街道 ---------- */
{ const _bf = Events.eliteWin_blackFeather; Events.eliteWin_blackFeather = function* (ow) {
    if (_bf) yield* _bf.call(this, ow); const st = Game.st, f = st.flags; if (!f.grenTrust || f.grenNorth) return;
    f.grenNorth = 1; yield* blackText(['「……果然在這裡。」', '樹林裡走出一個熟悉的身影。']);
    yield* sayAll(['格倫：「黑羽底下那幾個，是我以前的手下。……剩下的交給我吧。」', '格倫：「我會帶他們回關道，重新蓋驛站。一碗熱湯換一份工作，總比當盜賊好。」', '格倫：「小鬼——不，勇者。北邊的事，就拜託你了。」']);
    st.bag.megaPotion = (st.bag.megaPotion || 0) + 2; st.bag.megaEther = (st.bag.megaEther || 0) + 1; yield* itemGet('得到了特級傷藥×2和特大魔力水！');
  };
}

/* ---------- 諾拉 in the capital: 諾拉的麵包 ---------- */
ITEMS.noraBread = { n: '諾拉的麵包', cat: '回復', price: 0, sell: 50, d: '諾拉用金穗平原的麥子烤的麵包。恢復150點HP，還有一點點MP。', use: 'heal', v: 150 };
{ const M = MAPS.capital, want = [[10, 13], [8, 12], [11, 14], [13, 12]]; let spot = null;
  for (const [x, y] of want) if (M.rows[y] && M.rows[y][x] === '.' && !(M.npcs || []).some(n => n.x === x && n.y === y) && !(M.buildings || []).some(b => x >= b.x && x < b.x + b.w && y >= b.y && y <= b.y + b.h)) { spot = [x, y]; break; }
  if (spot) M.npcs.push({ id: 'noraCap', x: spot[0], y: spot[1], dir: 'down', look: 'girl', name: '諾拉', show: st => st.flags.creekQ === 3 && ch2(st) >= 3 });
  delete mapCache.capital; }
if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.noraCap = '王都艾爾德蘭';
NPC_ROLES.任務.push('noraCap');
Events.noraCap = function* () {
  const st = Game.st, f = st.flags;
  if (!f.noraCapMet) {
    f.noraCapMet = 1; yield* sayAll(['諾拉：「啊！你也在王都！」', '諾拉：「我幫爸爸來王都賣麵粉的。王都好大喔……我迷路了三次。」']);
    if (f.passDone && !st.bag.heroBanner) yield* sayAll(['諾拉：「對了……爸爸說，我們家的祖先是曙光軍的士兵，死在北邊的古戰場。」', '諾拉：「……你說你把戰旗插回了墓前？」', '諾拉：「……謝謝你。爸爸聽了一定會哭的。」']);
    else yield* say('諾拉：「爸爸說，我們家的祖先是曙光軍的士兵。好像是在北邊的古戰場……」');
    yield* sayAll(['諾拉：「我想用金穗平原的麥子烤麵包！可是王都的麥子好貴……」', '諾拉：「如果你能幫我摘3根金麥穗，我就烤麵包給你吃！」']);
    f.noraBread = 0; return;
  }
  if (!f.noraBread && (st.bag.wheat || 0) >= 3 && (yield* yesNo('要把金麥穗×3交給諾拉嗎？'))) {
    st.bag.wheat -= 3; f.noraBread = 1; yield* fadeOut(12); Sound.jingle('heal'); yield* wait(30); yield* fadeIn(12);
    yield* sayAll(['諾拉：「烤好了！趁熱吃吧！」', '諾拉：「……我決定了。我要在王都開一家麵包店。等魔王被打倒了，你一定要來喔！」']);
    st.bag.noraBread = (st.bag.noraBread || 0) + 5; st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* itemGet('得到了諾拉的麵包×5和天賦之書！'); return;
  }
  yield* say(f.noraBread ? '諾拉：「麵包店的名字……就叫『風車亭』吧！」' : '諾拉：「金穗平原就在王都的西門外。拜託你了！」（金麥穗 ' + (st.bag.wheat || 0) + '／3）');
};
Object.assign(STORY_MARKS, { noraCap: st => !st.flags.noraCapMet ? '!' : !st.flags.noraBread && (st.bag.wheat || 0) >= 3 ? '?' : null });
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const f = st.flags; if (f.noraCapMet) L.push({ n: '諾拉的麵包', t: f.noraBread ? '完成：諾拉決定在王都開麵包店。' : '幫諾拉摘3根金麥穗（金穗平原）。（' + Math.min(3, st.bag.wheat || 0) + '／3）', done: !!f.noraBread, rw: '諾拉的麵包×5、天賦之書' }); }; }
if (typeof QUEST_CATS !== 'undefined') QUEST_CATS['諾拉的麵包'] = '支線';
