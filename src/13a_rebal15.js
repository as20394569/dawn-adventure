/* ===================== v12.105 菁英・頭目的能力、地圖的魔物整理、物理和魔法的平衡 =====================
   玩家 2026-10-10：「整理地圖上的怪物種類 三種即可 剩下的放到其他地圖 地圖怪物等級統一區間
     晶英和BOSS血量上調50% 物魔防增強15% 但攻擊與魔法攻擊下降25%
     玩家武器偏好物理攻擊方面 魔法攻擊方式稀少 這部分可能要平衡」
   1. 菁英・頭目（所有章節、重打、石碑、懸賞都算）：HP ×1.5、物防・魔防 ×1.15、物攻・魔攻 ×0.75。
   2. 每張地圖的一般魔物只留 3 種、整張地圖同一個等級區間；多出來的搬到旁邊的洞窟、支線迷宮。
      （夜晚限定、天氣限定的魔物不算在 3 種裡，照舊只在那個時段出現。）
   3. 魔法：玩家打出的幾乎都是物理傷害，魔物的魔防等於沒用到。劍・短刀・斧・長槍・拳套・雙刀・雙劍各有一招改成魔法招
      （打魔防、攻擊力用物攻和魔攻較高的一項），拿近戰武器也能挑魔防低的魔物用魔法打。 */

// 1. 菁英・頭目
const REBAL15 = { hp: 1.5, def: 1.15, spd: 1.15, atk: 0.75, spa: 0.75 };
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o);
    if (!s || (kind !== 'elite' && kind !== 'boss')) return s;
    for (const k in REBAL15) if (s.stats[k] != null) s.stats[k] = Math.max(1, Math.round(s.stats[k] * REBAL15[k]));
    s.hp = s.stats.hp; return s; }; }

// 2. 地圖的魔物：[等級下限, 上限, 三種]
const MAP3_15 = {
  route: [2, 4, ['slime', 'mush', 'bee']],
  windHills: [5, 7, ['hornHare', 'strawCrow', 'curlySheep']],
  jadeCreek: [8, 10, ['mossTurtle', 'streamSnake', 'creekCroc']],
  forest: [11, 13, ['fireflySwarm', 'vineSnake', 'thornMush']],
  canyon: [12, 14, ['harpy', 'sandScorpion', 'canyonLizard']],
  mine: [13, 15, ['mineBat', 'caveSpider', 'bandit']],
  ruins: [15, 17, ['skeleton', 'ghostLamp', 'crystalPebble']],
  sewer: [16, 18, ['drownedSoul', 'caveBat', 'mudSlime']],
  lake: [16, 18, ['reedCrab', 'lakeClam', 'lizardman']],
  maplePass: [17, 19, ['barkBeetle', 'crimsonStag', 'mapleSprite']],
  swamp: [19, 21, ['bogToad', 'marshWisp', 'rotTreant']],
  catacomb: [20, 22, ['wraith', 'boneHound', 'runeGolem']],
  oldField: [20, 22, ['fallenSoldier', 'carrionVulture', 'ghoul']],
  northRoad: [22, 24, ['roadBandit', 'greyWolf', 'forestMarten']],
  heroTomb: [23, 25, ['battleWisp', 'bladeGhost', 'rustSoldier']],
  capSewer: [24, 26, ['sewerRat', 'sludge', 'sewerCroc']],
  goldPlains: [25, 27, ['scarecrow', 'wildBoar', 'fieldMice']],
  clockTower1: [27, 29, ['clockSoldier', 'gearSprite', 'hollowArmor']],
  frostField: [29, 31, ['snowWolf', 'yeti', 'snowHare']],
  iceCave: [31, 33, ['iceBat', 'iceGolem', 'frostWraith']],
  emberPass: [32, 34, ['fireSalamander', 'obsidianTurtle', 'volcanoHawk']],
  lavaTunnel: [34, 36, ['magmaGolem', 'flameSkeleton', 'hellHound']],
  duskFort1: [36, 38, ['duskKnight', 'shadowMage', 'voidHound']],
  coralCoast13: [45, 47, ['tideShrimp13', 'coralTurtle13', 'surfCrab13']],
  wreckCove13: [47, 49, ['drownSailor13', 'mistWraith13', 'deepEel13']],
  mistcapeCoast14: [50, 52, ['pufferFish14', 'surgeGull14', 'coralSnake14']],
  sunkenReef14: [53, 55, ['fishman14', 'coralGolem14', 'inkOctopus14']],
  abyssTemple14a: [55, 57, ['drownKnight14', 'tideSpirit14', 'anglerfish14']],
  abyssTemple14b: [55, 57, ['drownKnight14', 'tideSpirit14', 'anglerfish14']],
  // 支線迷宮：收外面地圖多出來的
  moonTemple13: [20, 22, ['reedHeron', 'nightBird', 'mosquitoSwarm']],
  mirrorCave13: [30, 32, ['frostSprite', 'iceOwl', 'frostMoth']],
  warpRuin13: [14, 16, ['cactling', 'emberSpirit', 'thunderBeetle']],
  // 挑戰洞窟：洞窟自己的那一種＋外面地圖多出來的兩種
  cave6_route: [12, 14, ['mossBat', 'pebble', 'dewSprite']],
  cave6_windHills: [10, 12, ['moleDigger', 'piglet', 'gustSprite']],
  cave6_jadeCreek: [14, 16, ['caveNewt', 'creekShrimp', 'waterStrider']],
  cave6_forest: [16, 18, ['rootGrub', 'leafFox', 'stumpling']],
  cave6_canyon: [17, 19, ['sandstoneImp', 'spineArmadillo', 'dustDevil']],
  cave6_lake: [21, 23, ['moonMoss', 'moonSprite', 'duskMoth']],
  cave6_swamp: [24, 26, ['rotRoot', 'mudSlug', 'bogLeech']],
  cave6_maplePass: [23, 25, ['wallGecko', 'mountainApe', 'mapleButterfly']],
  cave6_oldField: [26, 28, ['rustSoldier', 'oreSlime', 'rustSpider']],
  cave6_northRoad: [28, 30, ['featherThug', 'ironHedgehog', 'hornBeetle']],
  cave6_goldPlains: [30, 32, ['barnSpider', 'fieldBee', 'barnOwl']],
  cave6_frostField: [36, 38, ['icicleSprite', 'frostSlime', 'towerBat']],
  cave6_emberPass: [39, 41, ['obsidianChunk', 'ashMoth', 'lavaCrab']],
};
const MAP3_W15 = [40, 35, 25];
function map3Apply15() {
  for (const id in MAP3_15) { const d = MAPS[id]; if (!d || !d.encounters || !d.encounters.length) continue; const [lo, hi, L] = MAP3_15[id];
    const ok = L.filter(sp => SPECIES[sp] && MON_PANEL[sp]); if (ok.length < L.length) bvErr('map3', id + ' 缺 ' + L.filter(sp => !ok.includes(sp)).join(','));
    const rate = d.encounters.reduce((a, e) => a + (e.rate || 0), 0) / d.encounters.length;
    const table = ok.map((sp, i) => [sp, lo, hi, MAP3_W15[i] || 30]);
    const night = typeof M7_OF_MAP !== 'undefined' && M7_OF_MAP[id]; if (night) { const r = [night, lo, hi, 0]; r.night12 = 1; table.push(r); }
    d.encounters = [{ y0: 0, y1: 999, rate: +rate.toFixed(4), table }]; d.map3_15 = 1; }
  if (typeof Game !== 'undefined') Game.dnTablesFor = null; // 白天／晚上的權重重算一次
}
map3Apply15();

// 3. 物理武器也有魔法招（玩家：「魔法我是指玩家比較少打出魔法傷害 畢竟怪物有物防魔防」）
//    這幾招一律是魔法傷害（打對手的魔防），攻擊力用物攻和魔攻較高的一項；屬性加成：物攻較高吃原本的屬性，魔攻較高吃智力。
const HYB15 = { t_sdFlow: '流光連斬', t_dgNeedle: '雷痺斬', t_axQuake: '震地擊', t_spSpiral: '螺旋貫', t_fsQi: '氣勁彈', t_ddGale: '疾風百刃', t_dsStar: '雙星十字' };
BR.FORMULA.magAtk15 = c => { const S = c.src.stats; return Math.max(S.atk, S.spa) / Math.max(1, S.spa); };
COND.magHi15 = (c, v) => !!c.src && (c.src.stats.spa > c.src.stats.atk) === !!v;
for (const id in HYB15) { const D = DEF.skills[id]; if (!D) { bvErr('hyb15', id); continue; }
  delete D.catOf; D.cat = '特'; D.tags = D.tags.map(t => t === 'phys' ? 'magic' : t); if (MOVES[id]) MOVES[id].cat = '特';
  const add = '魔法傷害（打對手的魔防），用物攻和魔攻較高的一項計算。', fix = t => t.replace(/用物攻和魔攻較高的一項計算。?/, '').replace(/。?$/, '。') + add;
  if (!D.desc.includes('打對手的魔防')) D.desc = fix(D.desc); if (MOVES[id] && !MOVES[id].d.includes('打對手的魔防')) MOVES[id].d = fix(MOVES[id].d);
  D.mods.push({ stage: 'skill', who: 'attacker', atkMul: { f: 'magAtk15' }, cond: { srcIsHero: 1 } });
  const i = D.mods.findIndex(m => m.mul && m.mul.f === 'attrScale'); if (i >= 0) { const m = D.mods[i];
    D.mods.splice(i, 1, { ...m, cond: { ...m.cond, magHi15: 0 } }, { ...m, mul: { f: 'attrScale', v: ['int', 1] }, cond: { ...m.cond, magHi15: 1 } }); } }
// 遭遇卡・圖鑑：物防和魔防差比較多的魔物，標出哪一邊低（選物理招還是魔法招）
{ const _f = famText; famText = function (sp) { const t = _f(sp), P = MON_PANEL[(SPECIES[sp] || {}).iro15 || sp]; if (!P || !P.def || !P.spd) return t; const r = P.spd / P.def, lean = r <= 0.87 ? '魔防較低' : r >= 1.15 ? '物防較低' : '';
    return lean ? (t ? t + '　' : '') + lean : t; }; }
