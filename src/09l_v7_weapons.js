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
  sageTome: '賢者,arcaneEdge,skyJudge,magCrit:8,burst:4', frostTome: '霜語,arcaneEdge,aquaBurst,elem:12,weaken:4', starTome: '星典,arcaneEdge,meteor,mpRegen:5,burst:5',
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
  crit: ['鋒芒', v => '會心率+' + v + '%'], hit: ['精準', v => '命中+' + v + '%'], eva: ['輕盈', v => '迴避+' + v + '%'], drain: ['吸血', v => '造成傷害的' + v + '%回復HP'],
  elem: ['元素', v => '屬性攻擊傷害+' + v + '%'], fireUp: ['炎心', v => '火屬性傷害+' + v + '%'], boltUp: ['雷心', v => '雷屬性傷害+' + v + '%'], spe: ['疾行', v => '速度+' + v],
  mpRegen: ['回魔', v => '每回合回復' + v + '%最大MP'], regen: ['再生', () => '每回合回復4.5%最大HP（頭目戰3%）'], venomEdge: ['毒刃', () => '物理攻擊20%機率讓對手中毒'], pierceT: ['破甲', v => '物理攻擊無視對手' + v + '%的物防'],
  weakUp: ['弱點特攻', v => '打中弱點時傷害+' + v + '%'], bigUp: ['屠巨', v => '對菁英・頭目傷害+' + v + '%'], mpSave: ['省力', v => '技能有' + v + '%機率不消耗MP'], magCrit: ['奧秘', v => '魔法攻擊會心率+' + v + '%'],
  counter: ['反擊', () => '選擇防禦時被攻擊會立刻反擊'], guardPlus: ['堅守', () => '選擇防禦時再減傷30%'], statusRes: ['異常抗性', v => '更不容易陷入異常狀態（' + v + '%）'], first: ['先制', () => '每場戰鬥第一回合必定先出手'],
  double: ['連擊', () => '物理攻擊20%機率追加一擊'], thorns: ['荊棘', () => '受到攻擊時反彈20%傷害'], atkMp: ['魔力汲取', v => '普通攻擊多回復' + v + '點MP'], chargeCut: ['蓄勢', v => '特技所需層數-' + v],
  healUp: ['回復量', v => '治癒效果+' + v + '%'], critDmg: ['會心傷害', v => '會心傷害+' + v + '%'], hpP: ['強健', v => '最大HP+' + v + '%'], defP: ['堅甲', v => '物防+' + v + '%'], atkP: ['剛力', v => '物攻+' + v + '%'], spaP: ['靈力', v => '魔攻+' + v + '%'],
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
  const mk = (tpl, i) => { const T = MOVES[tpl]; if (!T) return null; const id = 'w_' + key + '_' + i, m = { ...T, n: nm[i] || T.n, tpl, ws: key }; // v25: no weapon prefix on actives (playtest: 「獵刀雙刃連擊」「疾風疾風刺」 were a mouthful)
    if (m.pow) m.pow = Math.round(T.pow * (1.15 + 0.03 * (B.t - 1))); MOVES[id] = m; SKILL_MP[id] = SKILL_MP[tpl] ?? 4; WMOVE[id] = key;
    if (typeof SKILL_STYLE !== 'undefined' && SKILL_STYLE[tpl]) SKILL_STYLE[id] = SKILL_STYLE[tpl]; if (typeof SKILL_SCALE !== 'undefined' && SKILL_SCALE[tpl]) m.scale = SKILL_SCALE[tpl]; return id; };
  const a = [mk(ta, 0), mk(tb, 1)].filter(Boolean), pw = specPow(sk, B.t);
  const pre = t => [...t].some(ch => stem.includes(ch)) ? t : stem + t; // no 「疾風疾風」「雷角雷擊」: drop the prefix when it repeats the word
  WSK[key] = { a, p: { k: pk, v: +pv, n: (nm[2] || pre(WPASS[pk][0])) }, s: { k: sk, N: +sn, pow: pw, n: nm[3] || pre(WSPEC[sk][0]) } };
}
const wpassText = p => WPASS[p.k] ? WPASS[p.k][1](p.v) : '';
const wspecText = (s, st) => '普通攻擊每累積' + wsN(s, st) + '層，自動追加發動：' + WSPEC[s.k][1](s.pow);

/* ---------- which weapons the hero holds ---------- */
const mainWeapon = (st = Game.st) => gearBy(st.equip && st.equip.weapon, st);
const mainWKey = (st = Game.st) => { const g = mainWeapon(st); return g && WSK[g.b] ? g.b : null; };
function subWeapon(st = Game.st) { const s = st.sub; if (!s) return null; const g = gearBy(s.u, st); if (!g || !WSK[g.b] || (st.equip && st.equip.weapon === g.u)) return null; return g; }
function borrowedSkill(st = Game.st) { const g = subWeapon(st); if (!g) return null; const A = WSK[g.b].a; return A[Math.min(st.sub.i || 0, A.length - 1)] || null; }
const WS_LAYERS = 3; // v27: every weapon's 特技 needs 3 layers (was 3–5 attacks per weapon)
const wsN = (s, st = Game.st) => Math.max(2, WS_LAYERS - (typeof talentSum === 'function' ? talentSum('chargeCut', st) : 0));
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
    const s = _hs(st), k = mainWKey(st); if (!k) return s; const p = WSK[k].p; // v12: growth-type weapons carry their passive again (v10 had moved passives to orbs)
    if (WPASS_FX.has(p.k)) s.fx[p.k] = 1; else if (p.k === 'hpP' || p.k === 'defP' || p.k === 'atkP' || p.k === 'spaP') { const sk = p.k.slice(0, -1); s[sk] = Math.floor(s[sk] * (1 + p.v / 100)); }
    else s[p.k] = (s[p.k] || 0) + p.v;
    return s;
  };
}

/* ---------- damage: basic attack / actives / borrowed / kind & crit bonuses ---------- */

/* ---------- battle: MP from basic attacks and the special counter ---------- */
// v10: the 特技 is driven by normal attacks only — every basic hit adds a layer, and the hit that fills the gauge fires it at once
// the counter beside the HUD: 特技 ◆◆◇◇

/* ---------- the battle skill pop-up: 2 main-weapon actives + the borrowed one ---------- */

/* ===================== v25 skill spotlight (playtest: on some stages — snow, meadow, canyon, tower… — skill effects were hard to see) =====================
   While a hero skill, a weapon 特技 or a strong monster skill plays, the stage BEHIND the fighters dims; the fighters and the
   effects stay at full brightness, and the light shafts fade out. Bright stages dim more than dark ones (measured once per battle). */
function stageLum(b) {
  const S = b.hd2d; if (!S) return 0.5; if (S.lum !== undefined) return S.lum;
  try { const c = mkCanvas(22, 27), x = c.getContext('2d'); x.drawImage(hd2dStageFor(b), 0, 0, 22, 27); const d = x.getImageData(0, 0, 22, 27).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; S.lum = s / (d.length / 4); } catch (e) { S.lum = 0.5; }
  return S.lum;
}
const spotTarget = b => clamp(0.24 + (stageLum(b) - 0.35) * 0.9, 0.24, 0.55);
function spotStrongFoe(u, id) { const mv = MOVES[id] || {}; return (mv.pow || 0) >= 75 || ((u.boss || u.elite) && (mv.pow || 0) >= 60) || u.charging === id || id === 'm_dominate'; }
