/* ===================== v7.0 ① weapon skills (Farever-style) =====================
   Playtest: "the weapon is so strong that the other skills are useless; only a few skills of the whole tree are ever used".
   Skills now live on the weapon. Every weapon has its own set:
     普通攻擊 (named after the kind, weaker than before, restores a little MP)
     主動技能 ×2 (built from the existing moves: their animation / mechanics, renamed and tuned for this weapon)
     被動 ×1 (active while it is the main weapon)
     特技 (fires by itself on every N-th attack of the battle)
   A second weapon can be set as 副武器: it gives no stats, only lends ONE of its two actives (90% power).
   Actives rank up with use (熟練度 Lv1→3). Class talents (09m) boost weapon kinds / play styles. */

/* ---------- new weapon kinds + more axes (art by Codex later; until then they borrow the old shapes) ---------- */
const NEW_WEAPONS = {
  hatchet: ['伐木斧', '斧', 1, { atk: 6 }, {}, null, '樵夫用的小斧頭。又重又鈍，但砍下去很有份量。'],
  boarAxe: ['野豬戰斧', '斧', 2, { atk: 8 }, { crit: 2 }, null, '用野豬獠牙鑲邊的戰斧。'],
  rockAxe: ['岩角戰斧', '斧', 4, { atk: 14 }, { crit: 3 }, null, '以岩角犀的角打磨的巨斧，能砸碎盔甲。'],
  crescentAxe: ['新月斧', '斧', 5, { atk: 17 }, { crit: 4 }, null, '刃口彎成新月的雙手斧。'],
  glacierAxe: ['霜嶺巨斧', '斧', 6, { atk: 20 }, { crit: 4 }, '水', '凍結在冰河裡的古斧，斧刃永遠冰冷。'],
  titanAxe: ['泰坦巨斧', '斧', 7, { atk: 24 }, { crit: 5 }, null, '傳說中巨人使用的斧頭，一般人連舉都舉不起來。'],
  trainSpear: ['見習長槍', '長槍', 1, { atk: 4 }, { hit: 4 }, null, '衛兵訓練用的長槍，攻擊距離很長。'],
  ironSpear: ['鐵頭長槍', '長槍', 2, { atk: 7 }, { hit: 4 }, null, '槍頭包著鐵的長槍。'],
  galeLance: ['疾風槍', '長槍', 3, { atk: 10 }, { hit: 5 }, null, '輕巧的騎槍，刺出時帶著風聲。'],
  scaleSpear: ['龍鱗槍', '長槍', 4, { atk: 12 }, { hit: 5 }, null, '槍桿纏著龍鱗，握起來出奇地溫暖。'],
  azureSpear: ['蒼龍槍', '長槍', 5, { atk: 15 }, { crit: 3 }, null, '刻著蒼龍的名槍，龍騎士代代相傳。'],
  frostSpear: ['霜牙槍', '長槍', 6, { atk: 18 }, { hit: 6 }, '水', '以雪原巨狼的獠牙為槍尖。'],
  skySpear: ['天龍槍', '長槍', 7, { atk: 21 }, { crit: 4 }, null, '據說能刺穿天空的神槍。'],
  wrapFist: ['布纏拳套', '拳套', 1, { atk: 3, spe: 2 }, {}, null, '用布條纏住拳頭，武僧入門的第一課。'],
  ironKnuckle: ['鐵指虎', '拳套', 2, { atk: 6, spe: 2 }, {}, null, '套在指節上的鐵環。'],
  rockFist: ['岩拳套', '拳套', 3, { atk: 8, spe: 3 }, { crit: 3 }, null, '嵌著礦石的厚重拳套。'],
  chiFist: ['氣功拳套', '拳套', 4, { atk: 10, spe: 3 }, { crit: 4 }, null, '能讓氣更容易流動的拳套。'],
  tigerClaw: ['虎爪', '拳套', 5, { atk: 13, spe: 4 }, { crit: 4 }, null, '三道利爪的格鬥武器。'],
  magmaFist: ['熔拳套', '拳套', 6, { atk: 15, spe: 4 }, { crit: 5 }, '火', '以熔岩石鍛造，打出去會冒煙。'],
  starFist: ['星辰拳套', '拳套', 7, { atk: 18, spe: 5 }, { crit: 6 }, null, '拳頭上閃著星光的神器。'],
  woodFlute: ['木笛', '樂器', 1, { spa: 3, mp: 6 }, {}, null, '村裡的孩子也會吹的木笛。'],
  travelLute: ['旅人魯特琴', '樂器', 2, { spa: 5, mp: 10 }, {}, null, '吟遊詩人最愛的魯特琴。'],
  forestHarp: ['翠之豎琴', '樂器', 3, { spa: 8, mp: 12 }, {}, '草', '以翠風原野的古木製成的豎琴。'],
  moonLyre: ['月光琴', '樂器', 4, { spa: 10, mp: 16 }, {}, null, '在月夜下會自己發出聲音的琴。'],
  windHorn: ['風之號角', '樂器', 5, { spa: 13, mp: 18 }, {}, null, '吹響時會捲起風的號角。'],
  iceHarp: ['冰弦豎琴', '樂器', 6, { spa: 16, mp: 20 }, {}, '水', '琴弦是冰晶拉成的細絲。'],
  starLyre: ['星詠之琴', '樂器', 7, { spa: 19, mp: 24 }, {}, null, '傳說中歌頌星辰的神琴。'],
  corkGun: ['軟木塞槍', '火槍', 1, { atk: 4 }, { hit: 6 }, null, '機工士的玩具……威力其實不小。'],
  brassPistol: ['黃銅短銃', '火槍', 2, { atk: 6 }, { hit: 6 }, null, '黃銅打造的短槍。'],
  steamRifle: ['蒸汽步槍', '火槍', 3, { atk: 9 }, { hit: 6, crit: 2 }, '水', '靠蒸汽壓力射出子彈的長槍。'],
  gearRepeater: ['連發齒輪槍', '火槍', 4, { atk: 11 }, { crit: 4 }, null, '轉動齒輪就能連續射擊。'],
  boltCannon: ['雷管砲', '火槍', 5, { atk: 14 }, { crit: 4 }, '雷', '能射出雷電的手持砲。'],
  frostMusket: ['霜火槍', '火槍', 6, { atk: 17 }, { crit: 5 }, '水', '子彈會在命中時結霜。'],
  starBlaster: ['星爆砲', '火槍', 7, { atk: 20 }, { crit: 6 }, null, '把星之碎片當成子彈的終極兵器。'],
};
const V7_LOOK = { 斧: ['axe', 'grey'], 長槍: ['staff', 'wandS'], 拳套: ['dagger', 'grey'], 樂器: ['staff', 'wandW'], 火槍: ['dagger', 'grey'] };
for (const k in NEW_WEAPONS) { const [n, kind, t, stt, sp, elem, d] = NEW_WEAPONS[k]; GEAR[k] = { n, slot: 'weapon', t, st: stt, sp, kind, d }; if (elem) GEAR[k].elem = elem; if (V7_LOOK[kind]) GEAR[k].look = V7_LOOK[kind]; (WEAPON_KINDS[kind] || (WEAPON_KINDS[kind] = [])).push(k); }
const isMagicW = k => k === '法杖' || k === '魔導書' || k === '樂器';
const WKIND_ORDER = ['劍', '短刀', '斧', '長槍', '拳套', '法杖', '魔導書', '樂器', '火槍'];

/* ---------- the weapon table: stem, active A, active B, passive key:value, special:N ---------- */
const WS_TABLE = {
  woodSword: '木劍,powerSlash,parry,hit:6,power:3', ironSword: '鐵劍,gale,armorBreak,crit:4,burst:4', knightSword: '騎士,crossSlash,parry,counter:1,guard:3',
  foxBlade: '狐火,powerSlash,doubleSlash,fireUp:12,brn:4', crystalBlade: '水晶,whirlSlash,focus,elem:8,mana:3', dawnSword: '晨曦,dawnBreak,crossSlash,drain:5,burst:4',
  masterBlade: '名匠,zantetsu,meikyo,critDmg:15,crit:3', kingsBlade: '古王,bladeStorm,braveOath,bigUp:10,power:4', voltSword: '雷角,gale,doubleSlash,boltUp:12,par:4',
  boneSaber: '骸骨,lastStand,armorBreak,pierceT:10,break:3', graveBlade: '冥騎,bloodBlade,warCry,drain:6,drain:4', eclipseBlade: '月蝕,eclipseSlash,manaSlash,mpRegen:4,burst:4',
  voidBlade: '虛空,riftBlade,focus,critDmg:20,execute:4', moonBlade: '月光,crossSlash,meikyo,crit:6,multi:4', riftSword: '裂界,riftBlade,flashStep,weakUp:10,break:3',
  sandSaber: '砂漠,doubleSlash,lacerate,spe:4,haste:3', toadBlade: '蟾毒,toxicBlade,whirlSlash,venomEdge:1,psn:4', verdantBlade: '翠葉,whirlSlash,powerSlash,regen:1,heal:4',
  royalSword: '王國,iaiSlash,braveOath,guardPlus:1,guard:3', hornSpear: '甲蟲,zantetsu,armorBreak,pierceT:15,burst:5', brassSword: '發條,flashStep,whirlSlash,double:1,multi:4',
  frostBrand: '霜之,iaiSlash,focus,elem:10,weaken:4', flameBrand: '炎之,bladeStorm,recklessSlash,fireUp:15,brn:3', duskSword: '黯滅,mushin,meikyo,critDmg:20,burst:5',
  starSword: '星辰,heroSoul,bladeStorm,bigUp:15,burst:4', harvestScythe: '收穫,asura,frenzy,drain:8,execute:4', chronoLance: '時計,timeStop,gale,first:1,haste:3',
  duskBlade: '黑劍,recklessSlash,iaiSlash,critDmg:15,drain:4', moldBlade: '影將,asura,bloodRage,atkP:8,burst:5',
  huntKnife: '獵刀,twinStrike,quickDraw,spe:3,multi:4', mistDagger: '晨霧,twinStrike,smokeBomb,eva:5,haste:3', fangDagger: '狼牙,venomFang,lacerate,weakUp:8,break:3',
  emberKnife: '燼火,quickDraw,twinStrike,fireUp:10,brn:4', banditKnife: '盜賊,venomFang,smokeBomb,venomEdge:1,psn:3', stingerDagger: '蠍尾,toxicBlade,quickDraw,crit:5,psn:4',
  moonDagger: '月牙,moonDance,backstab,crit:6,multi:4', wyrmFang: '龍牙,shadowStab,lacerate,critDmg:15,burst:4', riftDagger: '裂刃,bladeDance,hunterMark,weakUp:10,crit:3',
  duneFang: '沙海,assassinate,flurry,bigUp:10,execute:4', hydraFang: '蛇牙,deathMark,toxicBlade,drain:5,psn:3', royalDagger: '宮廷,backstab,hunterMark,hit:8,break:3',
  wolfFang2: '灰狼,flurry,twinStrike,double:1,multi:4', iceDagger: '冰晶,bladeDance,afterimage,eva:6,weaken:4', magmaDagger: '熔岩,flurry,quickDraw,fireUp:12,brn:3',
  shadowDagger: '暗影,oboro,mirage,eva:8,execute:4', cometDagger: '彗星,shadowStab,bladeDance,critDmg:20,multi:4',
  practiceWand: '練習,fireBolt,heal,mpRegen:3,mana:3', apprenticeStaff: '見習,manaBurst,aquaBlade,elem:5,burst:4', oakStaff: '橡木,leafStorm,heal,healUp:15,heal:4',
  thornStaff: '荊棘,leafStorm,barrier,thorns:1,psn:4', emberRod: '燼杖,kindle,fireBolt,fireUp:12,brn:3', voltRod: '雷杖,quickBolt,thunder,boltUp:12,par:4',
  quartzWand: '礦晶,manaBurst,barrier,magCrit:6,crit:3', fangWand: '牙杖,manaBurst,quickBolt,spe:3,mana:3', ruinStaff: '符文,chainBolt,barrier,mpSave:12,burst:4',
  tideStaff: '潮汐,aquaBlade,aquaBurst,elem:8,heal:4', magusStaff: '宮廷,manaBurst,staticField,magCrit:6,power:4', foxfireStaff: '狐杖,flameWave,kindle,fireUp:12,brn:4',
  harpyStaff: '鷹羽,chainBolt,quickBolt,spe:4,haste:3', stormStaff: '雷鳴,chainBolt,overload,boltUp:15,par:3', crystalStaff: '晶杖,aquaBurst,barrier,elem:10,mana:3',
  dawnStaff: '曙杖,flameWave,holyLight,healUp:20,burst:4', masterStaff: '匠杖,combust,flameWall,critDmg:15,crit:3', lakeStaff: '湖霧,aquaBurst,sanctuary,mpRegen:4,heal:4',
  bogStaff: '沼澤,leafStorm,discord,drain:5,psn:3', wyrmStaff: '潮龍,aquaBurst,thunderstorm,elem:12,burst:4', riftStaff: '界杖,meteor,timeStop,weakUp:10,burst:5',
  hydraStaff: '蛇杖,inferno,combust,drain:6,brn:3', courtStaff: '王宮,skyJudge,barrier,magCrit:8,power:4', windStaff: '風鳴,thunderstorm,quickBolt,spe:5,haste:3',
  gearStaff: '齒輪,overload,staticField,mpSave:15,multi:4', glacierStaff: '冰河,aquaBurst,sanctuary,elem:12,weaken:4', volcanoStaff: '火山,meteor,flameWall,fireUp:18,brn:3',
  voidStaff: '虛杖,raijin,overload,critDmg:20,execute:4', starStaff: '星見,skyJudge,phoenix,magCrit:10,burst:5',
  primerTome: '入門,manaBurst,heal,mpRegen:3,mana:3', herbalTome: '森之,leafStorm,heal,healUp:15,heal:4', ancientTome: '古岩,arcaneEdge,barrier,mpSave:12,burst:4',
  stolenTome: '盜書,arcaneEdge,lullabyH,magCrit:6,crit:3', deathTome: '亡者,arcaneEdge,discord,drain:6,drain:4', lakeTome: '湖之,aquaBurst,barrier,mpRegen:4,heal:3',
  riftTome: '界書,timeStop,arcaneEdge,weakUp:10,burst:4', sandTome: '沙書,manaBurst,lullabyH,spe:4,weaken:4', witchTome: '魔女,kindle,combust,fireUp:12,brn:3',
  royalTome: '王立,skyJudge,holyLight,healUp:20,guard:3', lichTome: '巫妖,aquaBurst,timeStop,elem:12,weaken:3', voidTome: '虛書,arcaneEdge,enchant,critDmg:20,execute:4',
  grenAxe: '格倫,recklessSlash,warCry,critDmg:10,break:3', hatchet: '伐木,powerSlash,warCry,crit:3,burst:4', boarAxe: '野豬,recklessSlash,guardStrike,hpP:6,break:3',
  rockAxe: '岩角,shieldBash,armorBreak,pierceT:12,burst:4', crescentAxe: '新月,frenzy,bloodRage,drain:6,multi:4', glacierAxe: '霜嶺,zantetsu,ironWill,defP:8,weaken:4', titanAxe: '泰坦,asura,lastStand,atkP:10,burst:5',
  trainSpear: '槍兵,dragonLance,gale,hit:6,burst:4', ironSpear: '鐵槍,pierceLance,jump,pierceT:8,break:3', galeLance: '疾風,gale,twinDragon,spe:4,haste:3',
  scaleSpear: '龍鱗,dragonBlood,dragonLance,hpP:8,heal:4', azureSpear: '蒼龍,twinDragon,jump,weakUp:10,multi:4', frostSpear: '霜牙,pierceLance,armorBreak,elem:10,weaken:4', skySpear: '天龍,dragonDive,dragonBlood,critDmg:15,burst:5',
  wrapFist: '布拳,comboPunch,meditate,eva:4,multi:4', ironKnuckle: '鐵拳,comboPunch,hakkei,crit:4,burst:4', rockFist: '岩拳,whirlKick,ironBody,defP:6,guard:3',
  chiFist: '氣功,chiBlast,hakkei,mpRegen:4,mana:3', tigerClaw: '虎爪,comboPunch,hundredFists,critDmg:15,multi:4', magmaFist: '熔拳,whirlKick,hakkei,fireUp:12,brn:3', starFist: '星拳,whirlKick,heavenFist,double:1,burst:5',
  woodFlute: '木笛,soundBlast,healSong,healUp:15,heal:4', travelLute: '旅人,soundBlast,battleSong,spe:3,power:4', forestHarp: '翠琴,echoBlast,lullabyH,regen:1,heal:4',
  moonLyre: '月琴,echoBlast,discord,magCrit:6,weaken:4', windHorn: '風之,heroicFinale,battleSong,spe:5,haste:3', iceHarp: '冰弦,echoBlast,healSong,elem:10,weaken:3', starLyre: '星詠,heroicFinale,lullabyH,mpRegen:5,burst:5',
  corkGun: '軟木,quickDraw,repair,hit:6,burst:4', brassPistol: '黃銅,taser,quickDraw,crit:4,par:4', steamRifle: '蒸汽,steamJet,overdrive,spe:4,multi:4',
  gearRepeater: '連發,fullBurst,turret,double:1,multi:4', boltCannon: '雷管,clockBomb,taser,boltUp:12,par:3', frostMusket: '霜火,megaCannon,repair,elem:10,burst:5', starBlaster: '星爆,megaCannon,fullBurst,critDmg:20,burst:5',
};
// hand-named showpieces (story / boss weapons)
const WS_NAMES = { dawnSword: ['曙光斬', '晨曦十字', null, '初代勇者之光'], eclipseBlade: [null, null, null, '月蝕・魔劍解放'], starSword: [null, null, null, '星辰一閃'], masterBlade: [null, null, null, '名匠的呼吸'], voidTome: [null, null, null, '虛無之頁'] };
const WPASS = { // passive keys: name suffix + text
  crit: ['鋒芒', v => '會心率+' + v + '%'], hit: ['精準', v => '命中+' + v + '%'], eva: ['輕盈', v => '迴避+' + v + '%'], drain: ['嗜血', v => '造成傷害的' + v + '%回復HP'],
  elem: ['元素', v => '屬性攻擊傷害+' + v + '%'], fireUp: ['炎心', v => '火屬性傷害+' + v + '%'], boltUp: ['雷心', v => '雷屬性傷害+' + v + '%'], spe: ['疾行', v => '速度+' + v],
  mpRegen: ['魔泉', v => '每回合回復' + v + '%最大MP'], regen: ['生機', () => '每回合回復6%最大HP'], venomEdge: ['毒牙', () => '物理攻擊20%機率讓對手中毒'], pierceT: ['破甲', v => '物理攻擊無視對手' + v + '%的物防'],
  weakUp: ['看破', v => '打中弱點時傷害+' + v + '%'], bigUp: ['屠巨', v => '對精英・頭目傷害+' + v + '%'], mpSave: ['節能', v => '技能有' + v + '%機率不消耗MP'], magCrit: ['奧秘', v => '魔法攻擊會心率+' + v + '%'],
  counter: ['反擊', () => '選擇防禦時被攻擊會立刻反擊'], guardPlus: ['堅守', () => '選擇防禦時再減傷30%'], statusRes: ['淨心', v => '更不容易陷入異常狀態（' + v + '%）'], first: ['先制', () => '每場戰鬥第一回合必定先出手'],
  double: ['連擊', () => '物理攻擊25%機率追加一擊'], thorns: ['荊棘', () => '受到攻擊時反彈25%傷害'], atkMp: ['汲魔', v => '普通攻擊多回復' + v + '點MP'], chargeCut: ['蓄勢', v => '特技所需攻擊次數-' + v],
  healUp: ['慈光', v => '治癒效果+' + v + '%'], critDmg: ['致命', v => '會心傷害+' + v + '%'], hpP: ['強健', v => '最大HP+' + v + '%'], defP: ['堅甲', v => '物防+' + v + '%'], atkP: ['剛力', v => '物攻+' + v + '%'], spaP: ['靈力', v => '魔攻+' + v + '%'],
};
const WPASS_FX = new Set(['regen', 'first', 'double', 'thorns']);
const WSPEC = { // special: name suffix, text(power)
  burst: ['怒濤', p => '追加一次強力攻擊（威力' + p + '）'], multi: ['連舞', p => '追加3段連擊（每段威力' + p + '）'], heal: ['癒光', () => '回復15%最大HP'], mana: ['魔湧', () => '回復20%最大MP'],
  guard: ['守護', () => '展開2回合護盾（受到傷害-40%）'], power: ['昂揚', () => '物攻・魔攻各提升1階'], break: ['碎甲', p => '追加攻擊（威力' + p + '），降低對手物防・魔防'], crit: ['凝神', () => '下一次攻擊必定會心'],
  drain: ['吸命', p => '追加攻擊（威力' + p + '），回復傷害50%的HP'], psn: ['毒霧', p => '追加攻擊（威力' + p + '），60%讓對手中毒'], brn: ['烈焰', p => '追加攻擊（威力' + p + '），60%讓對手灼傷'],
  par: ['雷擊', p => '追加攻擊（威力' + p + '），60%讓對手麻痺'], execute: ['斷罪', p => '追加攻擊（威力' + p + '）；對手HP低於35%時威力×2.5'], weaken: ['威壓', () => '降低對手物攻・魔攻各1階'], haste: ['疾風', () => '速度提升1階，回復10%最大MP'],
};
const specPow = (type, t) => ({ burst: 40 + 10 * t, multi: 14 + 4 * t, drain: 30 + 8 * t, break: 25 + 6 * t, psn: 25 + 6 * t, brn: 25 + 6 * t, par: 25 + 6 * t, execute: 30 + 6 * t })[type] || 0;
const KIND_ATK = { 劍: ['斬擊', 'slash'], 短刀: ['疾刺', 'slash'], 斧: ['劈砍', 'slash'], 長槍: ['突刺', 'windThrust'], 拳套: ['拳擊', 'slash'], 法杖: ['魔彈', 'magicBolt'], 魔導書: ['魔力彈', 'magicBolt'], 樂器: ['音擊', 'soundBlast'], 火槍: ['射擊', 'quickDraw'] };
const KIND_SPFX = { 劍: 'bigCross', 短刀: 'redFlurry', 斧: 'groundBash', 長槍: 'dragonLance', 拳套: 'hakkei', 法杖: 'manaBurst', 魔導書: 'arcaneEdge', 樂器: 'soundBlast', 火槍: 'clockBomb' };
const WSK = {}, WMOVE = {};
MOVES.attack.pow = 40; MOVES.attack.d = '用主武器攻擊。不消耗MP，還會回復少量MP；每次攻擊都會累積特技。';
for (const key in WS_TABLE) {
  const B = GEAR[key]; if (!B) continue; const [stem, ta, tb, ps, sp] = WS_TABLE[key].split(','), nm = WS_NAMES[key] || [], [pk, pv] = ps.split(':'), [sk, sn] = sp.split(':');
  const mk = (tpl, i) => { const T = MOVES[tpl]; if (!T) return null; const id = 'w_' + key + '_' + i, m = { ...T, n: nm[i] || stem + T.n, tpl, ws: key };
    if (m.pow) m.pow = Math.round(T.pow * (1.15 + 0.03 * (B.t - 1))); MOVES[id] = m; SKILL_MP[id] = SKILL_MP[tpl] ?? 4; WMOVE[id] = key;
    if (typeof SKILL_STYLE !== 'undefined' && SKILL_STYLE[tpl]) SKILL_STYLE[id] = SKILL_STYLE[tpl]; if (typeof SKILL_SCALE !== 'undefined' && SKILL_SCALE[tpl]) m.scale = SKILL_SCALE[tpl]; return id; };
  const a = [mk(ta, 0), mk(tb, 1)].filter(Boolean), pw = specPow(sk, B.t);
  WSK[key] = { a, p: { k: pk, v: +pv, n: (nm[2] || stem + WPASS[pk][0]) }, s: { k: sk, N: +sn, pow: pw, n: nm[3] || stem + WSPEC[sk][0] } };
}
const wpassText = p => WPASS[p.k] ? WPASS[p.k][1](p.v) : '';
const wspecText = (s, st) => '每' + wsN(s, st) + '次攻擊自動發動：' + WSPEC[s.k][1](s.pow);

/* ---------- which weapons the hero holds ---------- */
const mainWeapon = (st = Game.st) => gearBy(st.equip && st.equip.weapon, st);
const mainWKey = (st = Game.st) => { const g = mainWeapon(st); return g && WSK[g.b] ? g.b : null; };
function subWeapon(st = Game.st) { const s = st.sub; if (!s) return null; const g = gearBy(s.u, st); if (!g || !WSK[g.b] || (st.equip && st.equip.weapon === g.u)) return null; return g; }
function borrowedSkill(st = Game.st) { const g = subWeapon(st); if (!g) return null; const A = WSK[g.b].a; return A[Math.min(st.sub.i || 0, A.length - 1)] || null; }
const wsN = (s, st = Game.st) => Math.max(2, s.N - (typeof talentSum === 'function' ? talentSum('chargeCut', st) : 0));
function wsList(st = Game.st) {
  const k = mainWKey(st), out = k ? WSK[k].a.slice() : [], b = borrowedSkill(st); if (b && !out.includes(b)) out.push(b);
  st.skills = st.skills || {}; for (const id of out) if (!st.skills[id]) st.skills[id] = 1; return out;
}
const isBorrowed = (id, st = Game.st) => !!id && id === borrowedSkill(st) && WMOVE[id] !== mainWKey(st);
learnedSkills = function (st = Game.st) { return wsList(st); };
usableSkills = function (st = Game.st) { return wsList(st); };
summarySkills = function (st = Game.st) { return wsList(st); };
fixInherit = function (st = Game.st) { st.inh = []; return st.inh; };
inhSlots = function () { return 0; };
inheritables = function () { return []; };
// 熟練度: every use counts; Lv2 after 12 uses, Lv3 after 36
const WS_MASTER = [0, 12, 36];
function wsUse(id, st = Game.st) { const X = st.skx || (st.skx = {}); X[id] = (X[id] || 0) + 1; const lv0 = (st.skills || {})[id] || 1, lv = X[id] >= WS_MASTER[2] ? 3 : X[id] >= WS_MASTER[1] ? 2 : 1; st.skills[id] = Math.max(lv0, lv); return st.skills[id] > lv0 ? st.skills[id] : 0; }
function wsAttackMove(st = Game.st) {
  const g = mainWeapon(st), B = g && GEAR[g.b], kind = B ? B.kind : null, K = KIND_ATK[kind] || ['攻擊', 'slash'], mag = isMagicW(kind);
  return { ...MOVES.attack, n: K[0], fx: FX[K[1]] ? K[1] : mag ? 'magicBolt' : 'slash', cat: mag ? '特' : '物', t: (B && B.elem) || '一般', basic: 1 };
}
{ const _sm = skillMove; skillMove = function (id, st = Game.st) {
    if (id === 'attack') return wsAttackMove(st);
    const m = _sm(id, st); if (!WMOVE[id]) return m; const o = { ...m };
    if (isBorrowed(id, st)) o.sub = 1;
    if (o.heal && typeof talentSum === 'function') { const h = talentSum('healUp', st) + (mainWKey(st) && WSK[mainWKey(st)].p.k === 'healUp' ? WSK[mainWKey(st)].p.v : 0); if (h) o.heal = +(o.heal * (1 + h / 100)).toFixed(2); }
    return o;
  };
}

/* ---------- stats: the main weapon's passive ---------- */
{ const _hs = heroStats; heroStats = function (st = Game.st) {
    const s = _hs(st), k = mainWKey(st); if (!k) return s; const p = WSK[k].p;
    if (WPASS_FX.has(p.k)) s.fx[p.k] = 1; else if (p.k === 'hpP' || p.k === 'defP' || p.k === 'atkP' || p.k === 'spaP') { const sk = p.k.slice(0, -1); s[sk] = Math.floor(s[sk] * (1 + p.v / 100)); }
    else s[p.k] = (s[p.k] || 0) + p.v;
    return s;
  };
}

/* ---------- damage: basic attack / actives / borrowed / kind & crit bonuses ---------- */
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) {
    const r = _cd.call(this, u, t, mv); if (!u || !u.hero || !mv || !mv.pow) return r; const S = u.stats || {}; let m = 1;
    if (mv.basic) m *= 1 + (S.atkUp || 0) / 100;
    if (mv.ws) m *= 1 + (S.actUp || 0) / 100;
    if (mv.sub) m *= 0.9 + (S.subUp || 0) / 100;
    if (mv.wsp) m *= 1 + (S.spcUp || 0) / 100;
    if (S.kindUp && S.wkind && S.kindUp[S.wkind]) m *= 1 + S.kindUp[S.wkind] / 100;
    if (S.typeUp && S.typeUp[mv.t]) m *= 1 + S.typeUp[mv.t] / 100;
    if (r.crit && S.critDmg) m *= 1 + S.critDmg / 100;
    if (m !== 1) r.dmg = Math.max(1, Math.floor(r.dmg * m)); return r;
  };
}
{ const _ed = Battle.prototype.estimateDamage; Battle.prototype.estimateDamage = function (id) {
    if (id !== 'attack') return _ed.call(this, id); const A = MOVES.attack; MOVES.attack = wsAttackMove(); try { return _ed.call(this, id); } finally { MOVES.attack = A; }
  };
}

/* ---------- battle: MP from basic attacks, 熟練度, the special counter ---------- */
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    if (!u || !u.hero) return yield* _um.call(this, u, t, id);
    const fhp = t ? t.hp : 0, r = yield* _um.call(this, u, t, id); if (u.hp <= 0 || !t) return r;
    const st = Game.st, key = mainWKey(st), base = MOVES[id];
    const basic = id === 'attack' && t.hp < fhp, cast = id !== 'attack' && this._castId === id;
    if (!basic && !cast) return r;
    if (basic) { const g = 2 + Math.floor((u.maxmp || 0) / 25) + (u.stats.atkMp || 0); if (u.mp < u.maxmp) { u.mp = Math.min(u.maxmp, u.mp + g); st.mp = u.mp; } }
    if (cast && WMOVE[id]) { const up = wsUse(id, st); if (up) { Sound.sfx('statUp'); yield* this.msg('「' + base.n + '」的熟練度升到了Lv' + up + '！', { hold: 24 }); } }
    if (!key || !(basic || (base && base.pow))) return r;
    const S = WSK[key].s, N = wsN(S, st); this.H.wc = (this.H.wc || 0) + 1; this.H.wcN = N;
    if (this.H.wc >= N && t.hp > 0 && this.F && this.F.hp > 0) { this.H.wc = 0; yield* this.wSpecial(u, t, key); }
    return r;
  };
}
Battle.prototype.wHit = function* (u, t, S, pow, fx, mul = 1) {
  const B = GEAR[mainWKey()], mag = isMagicW(B.kind), mv = { n: S.n, t: B.elem || '一般', cat: mag ? '特' : '物', pow, acc: 100, fx, wsp: 1 };
  const r = this.calcDamage(u, t, mv); if (t.shield > 0) r.dmg = Math.floor(r.dmg * 0.6); const d = Math.min(t.hp, Math.max(1, Math.floor(r.dmg * mul)));
  yield* this.playFx(FX[fx] ? fx : 'hit', u, t); t.hp -= d; Sound.sfx(r.mult > 1 ? 'hitSuper' : 'hit'); if (r.crit) Sound.sfx('crit'); yield* this.impact(t, r.crit || r.mult > 1 ? 2 : 1); yield* this.animHP(t); return d;
};
Battle.prototype.wSpecial = function* (u, t, key) {
  const S = WSK[key].s, B = GEAR[key], mag = isMagicW(B.kind), fx = KIND_SPFX[B.kind] || 'hit', C = this.center(u);
  Sound.sfx('charge'); this.spawn({ k: 'flash', c: '#ffe8a0', a: 0.35, life: 8 }); for (let i = 0; i < 10; i++) this.spawn({ k: 'mote', x: C.x + rnd(-18, 18), y: C.y + rnd(-14, 14), vy: -1.2, s: 2, c: i % 2 ? '#ffd860' : '#ffffff', life: 18 });
  yield* this.msg('特技「' + S.n + '」發動！', { hold: 20 });
  const hurt = ['burst', 'multi', 'drain', 'break', 'psn', 'brn', 'par', 'execute'].includes(S.k);
  if (hurt) {
    let total = 0;
    if (S.k === 'multi') { for (let i = 0; i < 3 && t.hp > 0; i++) total += yield* this.wHit(u, t, S, S.pow, i ? 'hit' : fx); yield* this.msg('3連擊！合計' + total + '點傷害！', { hold: 18 }); }
    else { const ex = S.k === 'execute' && t.hp < t.maxhp * 0.35; total = yield* this.wHit(u, t, S, S.pow, fx, ex ? 2.5 : 1); yield* this.msg((ex ? '斷罪！' : '') + '造成了' + total + '點傷害！', { hold: 18 }); }
    if (S.k === 'drain' && u.hp < u.maxhp) { const h = Math.min(u.maxhp - u.hp, Math.max(1, Math.floor(total * 0.5))); u.hp += h; Game.st.hp = u.hp; Sound.sfx('heal'); yield* this.animHP(u); yield* this.msg('吸取了' + h + '點HP！', { hold: 16 }); }
    if (S.k === 'break' && t.hp > 0) yield* this.statChange(t, { def: -1, spd: -1 });
    if ((S.k === 'psn' || S.k === 'brn' || S.k === 'par') && t.hp > 0 && !t.status && chance(0.6)) yield* this.inflict(t, S.k, true);
    return;
  }
  if (S.k === 'heal') { const h = Math.min(u.maxhp - u.hp, Math.ceil(u.maxhp * 0.15)); if (h > 0) { u.hp += h; Game.st.hp = u.hp; Sound.sfx('heal'); yield* this.animHP(u); } yield* this.msg('回復了' + h + '點HP！', { hold: 16 }); }
  else if (S.k === 'mana' || S.k === 'haste') { if (S.k === 'haste') yield* this.statChange(u, { spe: 1 }); const g = Math.min(u.maxmp - u.mp, Math.ceil(u.maxmp * (S.k === 'mana' ? 0.2 : 0.1))); u.mp += g; Game.st.mp = u.mp; Sound.sfx('heal'); yield* this.msg('回復了' + g + '點MP！', { hold: 16 }); }
  else if (S.k === 'guard') { u.shield = Math.max(u.shield || 0, 2); Sound.sfx('shield'); yield* this.msg(u.n + '被護盾包圍了！（2回合）', { hold: 18 }); }
  else if (S.k === 'power') yield* this.statChange(u, { atk: 1, spa: 1 });
  else if (S.k === 'weaken') yield* this.statChange(t, { atk: -1, spa: -1 });
  else if (S.k === 'crit') { u.critNext = true; yield* this.msg('下一次攻擊必定會心！', { hold: 16 }); }
};
// the counter beside the HUD: 特技 ◆◆◇◇
{ const _bh = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) {
    _bh.call(this, x); const H = this.H, Y = Math.round(this.boxH), k = mainWKey(); if (!H || !k || Y >= BH || Game.scene !== this) return;
    const N = H.wcN || wsN(WSK[k].s), n = Math.min(N, H.wc || 0), full = n >= N - 1, w = N * 7 + 22, X = W - w - 3, yy = Y - 11;
    x.fillStyle = 'rgba(10,10,22,0.72)'; x.fillRect(X - 2, yy - 1, w + 4, 10); Font.draw(x, '特技', X, yy - 1, full ? '#ffd860' : UIC.muted, UIC.textSh, 7);
    for (let i = 0; i < N; i++) { const cx = X + 22 + i * 7, on = i < n; x.fillStyle = '#10121e'; x.fillRect(cx - 1, yy + 1, 6, 6); x.fillStyle = on ? (full && Math.floor(this.t / 8) % 2 ? '#ffffff' : '#ffc040') : '#3a3a4a'; x.fillRect(cx, yy + 2, 4, 4); }
  };
}

/* ---------- the battle skill pop-up: 2 main-weapon actives + the borrowed one ---------- */
Battle.prototype.chooseMove = function* () {
  const st = Game.st, list = wsList(st);
  if (!list.length) { yield* this.msg('這把武器沒有技能！（選單→裝備 換一把武器）'); return null; }
  let cur = Math.min(this.moveIdx || 0, list.length - 1); this.idle = true;
  const VIS = list.length, X = 8, w = W - 16, Y = 58, rowH = 14, h = 18 + VIS * rowH + 4, DY = Y + h + 2, DH = BH - 18 - DY;
  const info = (x, m) => {
    Font.drawR(x, 'MP ' + st.mp + '/' + (this.H.maxmp || st.mp), X + w - 8, Y + 2, '#8ab8ff', UIC.textSh, 9);
    const id = list[m.i], mv = skillMove(id), c = TYPE_COL[mv.t]; drawWin(x, X, DY, w, DH, 'menu');
    const fit = (t, sz, maxW) => { let z = sz; while (z > 7 && Font.width(t, z) > maxW) z--; return z; };
    const lack = skillMP(id) > st.mp, est = !lack && mv.pow && this.estimateDamage ? this.estimateDamage(id) : 0, L = X + 8, R = X + w - 8;
    const t1 = (isBorrowed(id) ? '副武器・' : '') + (mv.t === '一般' ? '無屬性' : mv.t + '屬性') + '・' + (mv.cat === '變' ? '輔助' : mv.cat === '物' ? '物理' : '魔法') + '・熟練Lv' + (skillLv(id) || 1), mpT = lack ? 'MP不足' : 'MP' + skillMP(id);
    x.fillStyle = c; x.fillRect(L, DY + 6, 4, 4); Font.draw(x, t1, L + 7, DY + 1, '#c9cfe4', UIC.textSh, fit(t1, 9, w - 30 - Font.width(mpT, 9))); Font.drawR(x, mpT, R, DY + 1, lack ? UIC.bad : '#8ab8ff', UIC.textSh, 9);
    let y = DY + 14;
    if (mv.pow) { const pw = powTxt(mv), eT = est ? '預估≈' + est : ''; x.fillStyle = 'rgba(200,160,80,0.35)'; x.fillRect(L, DY + 13, w - 16, 1);
      Font.draw(x, pw, L, y, UIC.accent, UIC.textSh, fit(pw, 10, w - 22 - (eT ? Font.width(eT, 9) : 0))); if (eT) Font.drawR(x, eT, R, y + 1, UIC.warm, UIC.textSh, 9); y += 13; }
    Font.drawC(x, Game.touchUI ? (m.tapSel === m.i ? '再點一次：使用　點外面：返回' : '點技能看說明・再點一次使用') : 'A：使用　B：返回', W / 2, BB_Y + 11, Game.touchUI && m.tapSel === m.i ? UIC.warm : UIC.muted, UIC.textSh, 9);
    drawFitText(x, mv.d || '', L, y, w - 16, DY + DH - 5 - y, 9);
  };
  while (true) {
    const r = yield* choose(list.map(id => ({ t: MOVES[id].n, r: (isBorrowed(id) ? '副 ' : '') + 'MP' + skillMP(id), col: skillMP(id) > st.mp || hpCostBlocked(id) ? UIC.dis : undefined })), { x: X, y: Y, w, h, rowH, fs: 10, ox: 12, oy: 17, visible: VIS, title: '武器技能', index: cur, onMove: i => cur = i, drawExtra: info, twoTap: true });
    if (r < 0) { this.idle = false; return null; }
    if (skillMP(list[r]) > st.mp) { yield* this.msg('MP不夠！'); continue; }
    if (hpCostBlocked(list[r])) { yield* this.msg('HP不夠，無法使用' + MOVES[list[r]].n + '！'); continue; }
    this.idle = false; this.moveIdx = r; return list[r];
  }
};
