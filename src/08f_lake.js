/* ===================== v19 銀月湖畔: events (hermit, moon altar & 銀鱗水龍, 流浪的魔劍士 → hidden class 魔劍士) ===================== */
const ALTAR_IMG = spriteFrom(['................', '................', '......kkkk......', '.....kYWWYk.....', '.....kWYYWk.....', '......kkkk......', '....kkSSSSkk....', '...kSSsSSsSSk...', '...kSkkkkkkSk...', '....kSSSSSSk....', '....kSsSSsSk....', '....kSSSSSSk....', '...kSSSSSSSSk...', '..kSSSSSSSSSSk..', '..kkkkkkkkkkkk..', '................'],
  { k: '#1a1420', S: '#b8c0d8', s: '#8a92b0', Y: '#fff0a0', W: '#ffffff' });
const WARDEN_IMG = spriteFrom(['.....kkkkkk.....', '....kPPPPPPk....', '...kPpPPPPpPk...', '...kPkWkkWkPk...', '...kPPPPPPPPk...', '....kPPPPPPk....', '...kkPPPPPPkk...', '..kPPpPPPPpPPk..', '..kPkPPPPPPkPk..', '..kPkPPGGPPkPk..', '..kkkPPPPPPkkk..', '....kPPPPPPk....', '....kPPkkPPk....', '....kPPk.kPPk...', '....kkkk.kkkk...', '................'],
  { k: '#140c20', P: '#4a3a70', p: '#6a5a9a', W: '#e8d8ff', G: '#b890ff' });
const imgFrames = (im, dy = 6) => { const c = mkCanvas(16, 22); c.getContext('2d').drawImage(im, 0, dy); const a = [c, c, c, c]; return { down: a, up: a, left: a, right: a }; };
{ const _nf = npcFrames; npcFrames = function (look) { if (look === 'altar') return imgFrames(ALTAR_IMG); if (look === 'warden') return imgFrames(WARDEN_IMG, 5); return _nf(look); }; }
MAPS.lake.npcs.find(n => n.id === 'altar').look = 'altar';
Object.assign(QUEST_CATS, { '流浪的魔劍士': '隱藏', '湖之主': '隱藏', '異界迴廊': '支線' });
if (typeof NPC_ROLES !== 'undefined') { (NPC_ROLES.任務 || (NPC_ROLES.任務 = [])).push('hermit'); (NPC_ROLES.情報 || (NPC_ROLES.情報 = [])).push('altar', 'stele', 'riftExit', 'warden'); }

// the lake: rogueBlade only after the 3 pages, the lake lord only after the offering
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) {
    _ld.call(this, id, x, y, dir, silent); const st = this.st;
    this.elites = this.elites.filter(e => { const d = (this.map.d.elites || []).find(q => q.id === e.id); return !d || !d.show || d.show(st); });
    if (id === 'lake' && !st.flags.wyrmCalled) this.boss = null;
  };
}
Object.assign(Events, {
  *hermit(ow) {
    const st = Game.st, f = st.flags, pages = st.bag.swordPage || 0;
    if (!f.q5) {
      yield* sayAll(['……哦，真少見。這個湖邊很少有人來。', '這座湖叫「銀月湖」。月圓之夜，湖心的祭壇會發光。', '傳說只要在祭壇供上月露，沉睡在湖底的「湖之主」就會醒來。', '……還有一件事。這附近住著一個奇怪的劍士。', '他在找失傳的「魔劍」流派的劍譜。劍譜散落成了三頁——', '一頁沉在湖心的小島上，一頁被蜥人隊長拿走了，最後一頁……據說被湖之主吞進了肚子裡。', '如果你找齊了三頁劍譜，就到湖的東岸去吧。他會在那裡等你。']);
      f.q5 = 1; return;
    }
    if (f.spellbladeOk) { yield* say('魔劍之道……你真的繼承了啊。那個劍士臉上難得露出了笑容呢。'); return; }
    if (pages >= 3) { yield* say('三頁劍譜都找齊了！去湖的東岸吧，魔劍士在等你。'); return; }
    yield* say('劍譜找到' + pages + '頁了。湖心小島、蜥人隊長、異界之門……慢慢來吧。');
    if (!f.wyrm) yield* say('對了，祭壇需要月露×3。湖邊發光的「月露草」採得到。');
  },
  *altar(ow) {
    const st = Game.st, f = st.flags;
    if (f.wyrm) { yield* say('月之祭壇靜靜地發著光。湖面映著銀色的月亮。'); return; }
    if ((st.bag.moonDew || 0) < 3) { yield* say('月之祭壇。石台中央有一個淺淺的凹槽……\n（好像可以放月露。需要月露×3）'); return; }
    if (!(yield* yesNo('要在祭壇上供奉月露×3嗎？'))) return;
    st.bag.moonDew -= 3; f.wyrmCalled = 1; Sound.sfx('charge'); Game.flashColor = '#e8f4ff'; yield* tween(20, t => Game.flash = t * 0.7); yield* tween(20, t => Game.flash = 0.7 * (1 - t));
    Sound.sfx('quake'); Game.shake = 50; yield* say('……湖面開始翻湧！'); ow.load('lake', ow.p.x, ow.p.y, ow.p.dir, true); Sound.cry(30, 0.6, 1.6);
    yield* sayAll(['銀白色的巨龍從湖底升起！', '「……是誰……打擾了我的月眠……」']);
    yield* Events.wyrmBoss(ow);
  },
  *wyrmBoss(ow) {
    const st = Game.st, f = st.flags; if (f.wyrm) return;
    const res = yield* ow.battleScript({ sp: 'silverWyrm', lv: MAPS.lake.boss.lv, kind: 'boss' });
    if (res === 'win') { f.wyrm = 1; ow.boss = null; Sound.sfx('water'); yield* sayAll(['銀鱗水龍沉回了湖底……', '「……很久……沒有這樣……痛快地打一場了……」', '「異界之人……月光……會庇護你……」']); st.money += 3000; yield* itemGet(st.name + '從湖邊撿到了3000 G！'); ow.load('lake', ow.p.x, ow.p.y, ow.p.dir, true); }
  },
  *eliteWin_lizardChief(ow) { const st = Game.st; if (!st.flags.pageLizard) { st.flags.pageLizard = 1; st.bag.swordPage = (st.bag.swordPage || 0) + 1; yield* itemGet('蜥人隊長掉下了一張舊紙……是「失落的劍譜」！'); } },
  *eliteWin_rogueBlade(ow) {
    const st = Game.st; st.flags.rogueMet = 1;
    yield* sayAll(['……好劍。', '你的劍裡，有魔力的流動。和我年輕的時候一樣。', '魔劍之道，就是讓劍與魔法合而為一。這三頁劍譜，就是它的全部。', '我已經老了。這條路，就交給你吧。']);
    st.flags.spellbladeOk = 1;
    if (st.cls !== 'spellblade' && (yield* yesNo('要繼承「魔劍士」的道路嗎？\n（隨時也能找村長轉職）'))) {
      yield* changeClass('spellblade');
      yield* say('魔劍士的天賦能讓物攻與魔攻互相加成（魔劍共鳴）。試著配一把劍和一本魔導書吧。');
    } else yield* say('……想好了再去找村長吧。');
  },
});
{ const _eq = extraQuests; extraQuests = function (st, L) {
    _eq(st, L); const f = st.flags, p = st.bag.swordPage || 0;
    if (f.q5) L.push({ n: '流浪的魔劍士', t: f.spellbladeOk ? '完成：打贏了魔劍士，繼承了魔劍之道。' : p >= 3 ? '三頁劍譜都找齊了。到銀月湖的東岸找魔劍士。' : '收集三頁「失落的劍譜」（' + p + '/3）：湖心小島、蜥人隊長、異界之門的另一邊。', done: !!f.spellbladeOk, rw: '隱藏職業「魔劍士」' });
    if (f.q5 || f.wyrmCalled) L.push({ n: '湖之主', t: f.wyrm ? '完成：打倒了銀鱗水龍。祭壇旁的石碑可以再戰。' : '在銀月湖心的祭壇供奉月露×3，喚醒湖之主。', done: !!f.wyrm, rw: '銀鱗龍鎧、3000 G' });
  };
}
