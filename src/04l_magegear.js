/* ===================== MAGE WEAPONS: more staves + a new kind 「魔導書」 (tomes: less 魔攻, more MP) ===================== */
Object.assign(SPECIALS, {
  manaSiphon: { n: '吸魔', d: '普通攻擊命中時回復4點MP。' },
  arcaneSurge: { n: '魔力湧動', d: 'MP在一半以上時，魔法傷害+15%。' },
});
SPECIALS.fervor.d = '每次攻擊後物攻（魔法攻擊則是魔攻）提升1階，最多3次。';
SPECIAL_CATS.攻擊.push('arcaneSurge'); SPECIAL_CATS.資源.push('manaSiphon');
SPECIALS.manaSiphon.cat = '資源'; SPECIALS.arcaneSurge.cat = '攻擊';

Object.assign(GEAR, {
  // 法杖 — higher 魔攻
  emberRod: { n: '燼火法杖', slot: 'weapon', t: 2, st: { spa: 7 }, sp: { elem: 4 }, elem: '火', kind: '法杖', d: '杖頭嵌著燼核的法杖。握柄一直是溫熱的。' },
  voltRod: { n: '雷角法杖', slot: 'weapon', t: 2, st: { spa: 7 }, sp: { elem: 4 }, elem: '雷', fx: ['stormMark'], kind: '法杖', d: '用雷角甲蟲的角做成的法杖。靠近就會劈啪作響。' },
  quartzWand: { n: '礦晶短杖', slot: 'weapon', t: 2, st: { spa: 8 }, sp: { crit: 4 }, kind: '法杖', d: '礦工在坑道深處撿到的晶石，被打磨成了短杖。' },
  fangWand: { n: '狼王牙杖', slot: 'weapon', t: 2, st: { spa: 7, spe: 2 }, fx: ['manaSiphon'], kind: '法杖', d: '狼王的牙裝在杖頭。每次揮動都會吸走一點魔力。' },
  magusStaff: { n: '宮廷魔導杖', slot: 'weapon', t: 3, st: { spa: 10 }, sp: { hit: 5 }, price: 2600, kind: '法杖', d: '王都宮廷魔導士的制式法杖。' },
  foxfireStaff: { n: '狐火法杖', slot: 'weapon', t: 3, st: { spa: 9 }, sp: { vs: ['plant', 20] }, elem: '火', kind: '法杖', d: '狐火在水晶球裡搖曳。燒植物特別有效。' },
  crystalStaff: { n: '水晶權杖', slot: 'weapon', t: 4, st: { spa: 12 }, sp: { vs: ['aquatic', 20] }, elem: '水', kind: '法杖', d: '整根由水晶雕成的權杖。能把魔力凝成水流。' },
  dawnStaff: { n: '晨曦之杖', slot: 'weapon', t: 4, st: { spa: 12 }, sp: { crit: 4, vs: ['construct', 20] }, elem: '火', fx: ['first', 'arcaneSurge'], kind: '法杖', d: '和晨曦之劍一起被封在森林深處的法杖。杖頭像初升的太陽。' },
  masterStaff: { n: '名匠遺杖', slot: 'weapon', t: 4, st: { spa: 13 }, sp: { hit: 5 }, fx: ['fervor'], kind: '法杖', d: '王都名匠留下的另一件遺作。鐵匠說：「師父其實也做法杖。」' },
  // 魔導書 — less 魔攻, more MP
  primerTome: { n: '入門魔導書', slot: 'weapon', t: 1, st: { spa: 3, mp: 8 }, price: 1000, kind: '魔導書', d: '魔法學校的課本。空白處寫滿了前主人的筆記。' },
  herbalTome: { n: '森之書', slot: 'weapon', t: 2, st: { spa: 5, mp: 12 }, sp: { elem: 4 }, elem: '草', kind: '魔導書', d: '夾滿了壓花的魔導書。翻開時會聞到森林的味道。' },
  ancientTome: { n: '古岩魔導書', slot: 'weapon', t: 3, st: { spa: 7, mp: 16 }, sp: { elem: 6 }, kind: '魔導書', d: '石板裝訂成的古代魔導書。重得要用兩手捧著。' },
  stolenTome: { n: '被搶走的魔導書', slot: 'weapon', t: 3, st: { spa: 8, mp: 14 }, sp: { crit: 4 }, fx: ['arcaneSurge'], kind: '魔導書', d: '格倫從商隊搶來的魔導書。他根本看不懂。' },
  deathTome: { n: '亡者之書', slot: 'weapon', t: 4, st: { spa: 10, mp: 20 }, sp: { drain: 6, elem: 4 }, kind: '魔導書', d: '墓穴深處的黑色魔導書。書頁會吸走傷口的生命。' },
  // v9: forgeable tomes for the later tiers (before, the best forgeable tome stopped at 亡者之書)
  sageTome: { n: '賢者之書', slot: 'weapon', t: 5, st: { spa: 13, mp: 24 }, sp: { crit: 4 }, kind: '魔導書', d: '王都魔導院代代相傳的教本。每一頁的邊角都被翻得發亮。' },
  frostTome: { n: '霜語之書', slot: 'weapon', t: 6, st: { spa: 16, mp: 28 }, sp: { elem: 6 }, elem: '水', kind: '魔導書', d: '用冰晶當書籤的魔導書。翻開時會吐出白色的寒氣。' },
  starTome: { n: '星典', slot: 'weapon', t: 7, st: { spa: 19, mp: 32 }, sp: { elem: 8 }, kind: '魔導書', d: '記載著星辰運行的古老典籍。書頁上的星座會慢慢移動。' },
});
WEAPON_KINDS.法杖.push('emberRod', 'voltRod', 'quartzWand', 'fangWand', 'magusStaff', 'foxfireStaff', 'crystalStaff', 'dawnStaff', 'masterStaff');
WEAPON_KINDS.魔導書 = ['primerTome', 'herbalTome', 'ancientTome', 'stolenTome', 'deathTome', 'sageTome', 'frostTome', 'starTome'];
const isMagicKind = k => k === '法杖' || k === '魔導書';

// where they come from
SHOP_LIST.push('primerTome');
MAPS.route.gearPool.push('primerTome'); MAPS.forest.gearPool.push('herbalTome'); MAPS.mine.gearPool.push('quartzWand');
MAPS.ruins.gearPool.push('ancientTome'); MAPS.catacomb.gearPool.push('deathTome');
RECIPES.push(
  { out: 'manaPotion', n: 2, mats: { herb: 2, spore: 1 } },
  { out: 'emberRod', mats: { emberCore: 3, leaf: 2 }, gold: 500 }, { out: 'voltRod', mats: { beetleShell: 4, feather: 2 }, gold: 600 },
  { out: 'foxfireStaff', mats: { foxfire: 4, spore: 2 }, gold: 800 }, { out: 'crystalStaff', mats: { crystal: 5, silk: 2 }, gold: 1500 },
);
// magic classes get a magic weapon where the story hands out a sword/axe/dagger
const MAGE_SWAP = { dawnSword: 'dawnStaff', masterBlade: 'masterStaff', fangDagger: 'fangWand', grenAxe: 'stolenTome' };
const classGear = (id, st = Game.st) => (st && baseClassOf(st.cls) === 'mage' && MAGE_SWAP[id]) || id;

// field / battle looks
Object.assign(WPN_PAL, {
  wandR: { T: '#5a2a1a', V: '#ff6a3a' }, wandV: { T: '#3a3a5a', V: '#fff060' }, wandQ: { T: '#6a6070', V: '#ffc0f0' }, wandF: { T: '#5a3a28', V: '#fff8e8' },
  wandM: { T: '#3a2a5a', V: '#c890ff' }, wandO: { T: '#6a3a1a', V: '#ffa040' }, wandC: { T: '#4a6a8a', V: '#a0f8ff' }, wandD: { T: '#b08830', V: '#fff0a0' }, wandMs: { T: '#3a3a5a', V: '#e0f0ff' },
  tomeBr: { T: '#8a5a30', U: '#e8c048', V: '#f0e8d0' }, tomeG: { T: '#3e7a34', U: '#c8e070', V: '#f0f0d0' }, tomeS: { T: '#8a8070', U: '#60d0c8', V: '#e8e0c8' },
  tomeR: { T: '#8a2a2a', U: '#e8c048', V: '#f0e0d0' }, tomeK: { T: '#2e2440', U: '#b060ff', V: '#d8c8e8' },
  tomeSg: { T: '#2a5a4a', U: '#f0d060', V: '#f0ecd8' }, tomeF: { T: '#3a6a9a', U: '#c0f0ff', V: '#e8f4ff' }, tomeSt: { T: '#1e2450', U: '#ffe070', V: '#e0e4ff' },
});
Object.assign(GEAR_LOOK, {
  emberRod: ['staff', 'wandR'], voltRod: ['staff', 'wandV'], quartzWand: ['staff', 'wandQ'], fangWand: ['staff', 'wandF'], magusStaff: ['staff', 'wandM'], foxfireStaff: ['staff', 'wandO'],
  crystalStaff: ['staff', 'wandC'], dawnStaff: ['staff', 'wandD'], masterStaff: ['staff', 'wandMs'],
  primerTome: ['tome', 'tomeBr'], herbalTome: ['tome', 'tomeG'], ancientTome: ['tome', 'tomeS'], stolenTome: ['tome', 'tomeR'], deathTome: ['tome', 'tomeK'],
  sageTome: ['tome', 'tomeSg'], frostTome: ['tome', 'tomeF'], starTome: ['tome', 'tomeSt'],
});
for (const k in GEAR_LOOK) if (GEAR[k]) GEAR[k].look = GEAR_LOOK[k];
MOVES.attack.d = '用武器攻擊。不消耗MP。裝備法杖或魔導書時改用魔攻。';
