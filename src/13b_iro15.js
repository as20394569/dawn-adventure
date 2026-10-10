/* ===================== v12.106 稀有怪計畫：異色魔物 =====================
   玩家 2026-10-10：「稀有怪計劃:使用CODEX畫異色風格稀有怪會比較強 掉落新的裝備 還有特殊晶石 分佈在地圖上 一個地圖三種」
   · 每張野外・迷宮・第三章地圖 3 種稀有怪＝那張地圖三種魔物的「異色」版（名字「異色○○」），共 84 種；舊的金色泡泡姆、月狐那些稀有怪不再出現。
   · 地圖上看到的魔物 3% 是異色（三種隨機），閃著星星、不會主動追人。打起來比一般的強很多（HP ×3.2、攻擊 ×1.3、防禦 ×1.25），不會逃跑。
   · 打倒會掉：「異色晶石」（特殊晶石，哪個部位都能鑲；第一次 30%）、部位（虹鱗・虹心，用來把晶石升到 ★2・★3）、
     這張地圖專屬的異色飾品（25%，品質紫以上），還有原本稀有怪掉的紫色裝備。
   · 圖：先用原本的圖換成異色（每隻挑一種顏色：金・蒼・紫・緋・翠・櫻・銀・墨），Codex 畫好正式的圖之後直接換上。 */
const IRO_LOOK15 = { // base: [palette, the base picture's main hue]
  slime: ['金', 219], mush: ['蒼', 61], bee: ['紫', 50], hornHare: ['翠', 30], strawCrow: ['櫻', 300], curlySheep: ['蒼', 36], mossTurtle: ['紫', 63],
  streamSnake: ['緋', 140], creekCroc: ['蒼', 55], fireflySwarm: ['櫻', 79], vineSnake: ['紫', 75], thornMush: ['金', 220], harpy: ['翠', 29],
  sandScorpion: ['蒼', 27], canyonLizard: ['紫', 29], mineBat: ['翠', 8], caveSpider: ['蒼', 329], bandit: ['金', 356], skeleton: ['翠', 43],
  ghostLamp: ['緋', 180], crystalPebble: ['蒼', 16], drownedSoul: ['緋', 184], caveBat: ['金', 285], mudSlime: ['翠', 24], reedCrab: ['紫', 40],
  lakeClam: ['櫻', 215], lizardman: ['緋', 140], barkBeetle: ['翠', 26], crimsonStag: ['蒼', 6], mapleSprite: ['銀', 16], bogToad: ['紫', 26],
  marshWisp: ['櫻', 155], rotTreant: ['翠', 23], wraith: ['金', 274], boneHound: ['翠', 292], runeGolem: ['櫻', 0], fallenSoldier: ['蒼', 30],
  carrionVulture: ['翠', 15], ghoul: ['紫', 22], roadBandit: ['金', 220], greyWolf: ['緋', 0], forestMarten: ['蒼', 25], battleWisp: ['金', 202],
  bladeGhost: ['緋', 215], rustSoldier: ['紫', 19], sewerRat: ['翠', 346], sludge: ['金', 264], sewerCroc: ['櫻', 130], scarecrow: ['蒼', 26],
  wildBoar: ['翠', 15], fieldMice: ['紫', 28], clockSoldier: ['蒼', 26], gearSprite: ['紫', 35], hollowArmor: ['櫻', 146], snowWolf: ['緋', 72],
  yeti: ['金', 215], snowHare: ['櫻', 228], iceBat: ['緋', 251], iceGolem: ['翠', 318], frostWraith: ['櫻', 70], fireSalamander: ['蒼', 21],
  obsidianTurtle: ['翠', 3], volcanoHawk: ['紫', 14], magmaGolem: ['金', 278], flameSkeleton: ['緋', 244], hellHound: ['櫻', 176], duskKnight: ['緋', 152],
  shadowMage: ['金', 287], voidHound: ['銀', 243], tideShrimp13: ['蒼', 17], coralTurtle13: ['櫻', 131], surfCrab13: ['金', 204], drownSailor13: ['紫', 138],
  mistWraith13: ['緋', 229], deepEel13: ['金', 209], pufferFish14: ['紫', 36], surgeGull14: ['櫻', 131], coralSnake14: ['蒼', 15], fishman14: ['緋', 73],
  coralGolem14: ['紫', 19], inkOctopus14: ['金', 267], drownKnight14: ['翠', 31], tideSpirit14: ['緋', 197], anglerfish14: ['金', 267],
};// [目標色相（null＝不換色相）, 飽和度 ×, 灰色的地方加多少飽和度, 亮度 ×]
const IRO_PAL15 = { 金: [48, 1.25, 0.35, 1.12], 蒼: [205, 1.15, 0.3, 1.05], 紫: [278, 1.1, 0.3, 1.02], 緋: [352, 1.25, 0.35, 1.0], 翠: [145, 1.15, 0.3, 1.02], 櫻: [328, 0.9, 0.25, 1.16], 銀: [null, 0.12, 0, 1.22], 墨: [null, 0.75, 0, 0.62] };
const IRO_MUL15 = { hp: 3.2, atk: 1.3, spa: 1.3, def: 1.25, spd: 1.25, spe: 1.1 };
const IRO15 = {}, IRO_OF_MAP15 = {}, IRO_MAPS15 = Object.keys(MAP3_15).filter(m => !/^cave6_|^moonTemple13$|^mirrorCave13$|^warpRuin13$/.test(m));
const iroPx15 = (L, r, g, b) => { const P = IRO_PAL15[L[0]], [h, s, l] = rgb2hsl(r, g, b); if (P[0] === null) return hex2rgb(hsl2hex(h, Math.min(1, s * P[1]), Math.min(1, l * P[3])));
  if (l < 0.13) return [r, g, b]; // 輪廓線不動
  const gray = s < 0.12, h2 = gray ? P[0] : h + (P[0] - L[1]), s2 = gray ? Math.min(1, s + P[2] * (l > 0.88 ? 0.7 : 1)) : Math.min(1, s * P[1] + P[2] * 0.3); return hex2rgb(hsl2hex(h2, s2, Math.min(gray && l > 0.88 ? 0.86 : 1, l * P[3]))); };
// 晶石：一項能力 %＋一項看種族的效果（魔攻型、靈體、不死、軟泥偏魔法）
function iroCry15(b, lv) { const T = clamp(Math.ceil(lv / 8), 1, 7), P = MON_PANEL[b], fam = SPECIES[b].fam;
  const st = ['atk', 'spa', 'def', 'spd'].sort((x, y) => P[y] - P[x])[0], main = P.spe > Math.max(P.atk, P.spa, P.def, P.spd) * 1.4 ? 'spe' : st;
  const mage = P.spa > P.atk * 1.15;
  const F = { beast: ['double', 8 + 3 * T], bird: ['eva', 1 + Math.round(T * 0.6)], insect: ['defDown', 12 + 4 * T], plant: ['regen', Math.round((1 + 0.4 * T) * 10) / 10], ooze: ['siphon', 1 + Math.ceil(T / 2)],
    aquatic: ['mpGuard', 4 + T], spirit: ['freecast', 4 + 2 * T], undead: ['spellblade', 6 + 3 * T], construct: ['thorns', 8 + 3 * T], human: ['fervor', T >= 5 ? 3 : 2] };
  let pas = F[fam] || ['back', 10 + 4 * T]; if (mage && !['spirit', 'undead', 'ooze'].includes(fam)) pas = ['freecast', 4 + 2 * T];
  return [[main, 2 + T], pas]; }
// 每張地圖的異色飾品：[名字, 兩項能力, 特性, 說明]
const IRO_ACC15 = {
  route: ['虹露墜飾', ['spa', 'spd'], 'meditate', '晨霧道路的異色魔物身上凝出的露珠，裡面映著七種顏色。'],
  windHills: ['虹羽風鈴', ['spe', 'atk'], 'swift', '異色魔物掉下來的羽毛綁成的風鈴，沒有風也會自己響。'],
  jadeCreek: ['碧溪虹鱗', ['spd', 'def'], 'will', '碧溪谷的異色魔物脫下的鱗片，泡在水裡會發出虹光。'],
  forest: ['霧林虹螢', ['spa', 'spe'], 'arcaneSurge', '關在玻璃珠裡的一點虹色螢光，靠近魔力會變亮。'],
  canyon: ['夕砂虹晶', ['atk', 'spe'], 'hunter', '落日峽谷的砂裡長出來的虹色結晶，像凝住的夕陽。'],
  mine: ['礦脈虹石', ['atk', 'def'], 'breaker', '廢棄礦坑深處才挖得到的虹色礦石，敲起來很硬。'],
  ruins: ['古岩虹符', ['spa', 'spd'], 'elemGuard', '古岩遺跡的異色魔物守著的護符，上面的古文字會換顏色。'],
  sewer: ['水道虹環', ['spa', 'spd'], 'manaSiphon', '在地下水道的水流裡轉了很久、磨成圓環的虹色石頭。'],
  lake: ['銀月虹貝', ['spa', 'spe'], 'thrift', '月夜的湖底撈起的虹色貝殼，貼在耳邊聽得到水聲。'],
  maplePass: ['楓紅虹葉', ['atk', 'spe'], 'double', '一年到頭都不會掉色的虹色楓葉，摸起來像金屬。'],
  swamp: ['幽沼虹燈', ['atk', 'spe'], 'poisonEdge', '沼澤的異色鬼火留下的小燈，火焰帶著毒。'],
  catacomb: ['骸骨虹戒', ['atk', 'def'], 'lastStand', '地下墓穴的異色亡者戴著的戒指，越危險越亮。'],
  oldField: ['戰場虹旗', ['atk', 'spa'], 'fervor', '古戰場上找到的小旗，旗面的顏色每天都不一樣。'],
  northRoad: ['街道虹羽', ['spe', 'atk'], 'initiative', '北方街道的異色魔物身上的羽毛，插在帽子上跑得特別快。'],
  heroTomb: ['勇者虹印', ['def', 'spd'], 'endure', '初代勇者之墓的異色亡魂守著的印記，摸起來有點溫暖。'],
  capSewer: ['王都虹鈴', ['spa', 'spe'], 'timeSand', '王都地下水道撿到的小鈴鐺，搖一下時間好像慢了一點。'],
  goldPlains: ['金穗虹結', ['def', 'spd'], 'fortune', '用虹色的麥穗編成的結，農夫說會帶來好收成。'],
  clockTower1: ['鐘塔虹輪', ['spa', 'spe'], 'thrift', '曙光鐘塔的異色機關魔物身上的小齒輪，自己會轉。'],
  frostField: ['霜語虹晶', ['spd', 'spa'], 'elemGuard', '雪原的異色魔物身上結出的冰晶，放在太陽下也不會融化。'],
  iceCave: ['冰晶虹冠', ['spa', 'spd'], 'arcaneSurge', '冰晶洞窟深處結成的小冠，透著七種顏色的冷光。'],
  emberPass: ['赤焰虹鱗', ['atk', 'spe'], 'pierce', '赤焰山道的異色魔物身上的鱗片，邊緣像刀一樣利。'],
  lavaTunnel: ['熔岩虹核', ['atk', 'spa'], 'double', '熔岩坑道的異色魔物體內的核心，一直在跳動。'],
  duskFort1: ['黯滅虹刃', ['atk', 'spa'], 'hunter', '黯滅要塞的異色魔物掉下來的刀片，在黑暗裡會發虹光。'],
  coralCoast13: ['珊瑚虹貝', ['def', 'spd'], 'regen', '珊瑚海岸的異色魔物藏著的貝殼，裡面的珍珠是虹色的。'],
  wreckCove13: ['沉船虹錨', ['def', 'atk'], 'thorns', '沉船灣海底撈起的小錨，上面長滿了虹色的藤壺。'],
  mistcapeCoast14: ['霧角虹螺', ['spa', 'spd'], 'manaSiphon', '霧角海岸的異色魔物住的海螺，吹起來是魔力的聲音。'],
  sunkenReef14: ['沉月虹星', ['spa', 'spe'], 'arcaneSurge', '沉月礁的砂裡撿到的虹色海星，晚上會一閃一閃。'],
  abyssTemple14a: ['海淵虹珠', ['atk', 'spa'], 'shadowStep', '海淵神殿的異色魔物守著的珠子，看久了會覺得自己在水底。'],
};
const iroAccT15 = lo => lo < 5 ? 1 : lo < 10 ? 2 : lo < 16 ? 3 : lo < 23 ? 4 : lo < 30 ? 5 : lo < 40 ? 6 : 7;
const IRO_ACCB15 = [0, 6, 10, 14, 19, 25, 31, 38];
for (const m in IRO_ACC15) { const [n, [a, b], tr, d] = IRO_ACC15[m], t = iroAccT15(MAP3_15[m][0]), B = IRO_ACCB15[t], k = 'iroAcc_' + m;
  GEAR[k] = { n, slot: 'acc', t, st: { hp: Math.round(B * 0.8), [a]: Math.round(B * 0.3), [b]: Math.round(B * 0.22) }, sp: {}, fx: [tr], trait: tr, kind: '飾品', d: d + '（' + (MAPS[m].name || m).replace(/・.*$/, '') + '的異色魔物掉落）', look: (GEAR.qHeroCrest || {}).look, iro15: m };
  if (ACC_TRAIT[tr] && ACC_TRAIT[tr][2] && !ACC_TRAIT[tr][2].includes(n)) ACC_TRAIT[tr][2].push(n); if (typeof BP_RARE !== 'undefined') BP_RARE.add(k); }
const IRO_ACC_ALIAS15 = { abyssTemple14b: 'abyssTemple14a' }, iroAccOf15 = m => { m = IRO_ACC_ALIAS15[m] || m; return GEAR['iroAcc_' + m] ? 'iroAcc_' + m : null; };

// 異色魔物本身
function iroMake15(k, b, m, lo) { const B = SPECIES[b]; if (!B || !MON_PANEL[b] || !DEF.enemies[b]) { bvErr('iro15', b); return false; }
  const n = '異色' + B.n; const { night12, ...rest } = B;
  SPECIES[k] = { ...rest, n, rare: 1, iro15: b, elite: 0, boss: 0, drop: null, exp: Math.round((B.exp || 20) * 6), gold: Math.round((B.gold || 10) * 6),
    dex: '身體的顏色跟一般的' + B.n + '不一樣的稀有個體，比一般的強很多。只在' + (MAPS[m].name || m).replace(/・.*$/, '') + '偶爾看得到。打倒有機率掉「' + n + '晶石」和這張地圖的異色飾品。' };
  MON_PANEL[k] = { ...MON_PANEL[b] };
  const rig = BATTLE_PXC[b] ? b : (HD_RIG_OF[b] || b); HD_RIG_OF[k] = rig;
  const L = IRO_LOOK15[b] || ['金', 0], P = IRO_PAL15[L[0]], A = ART[b] || ART[rig];
  if (A) ART[k] = P[0] === null ? artRecolor(A, 0, P[1], P[3]) : artRecolor(A, P[0] - L[1], Math.max(1, P[1]), P[3]);
  defPut('enemies', k, { ...DEF.enemies[b], tags: (DEF.enemies[b].tags || []).slice(), skills: (DEF.enemies[b].skills || []).slice(), script: null, metadata: { n } });
  IRO15[k] = { b, m, lo };
  ITEMS['pt_' + k] = { n: B.n + '的虹鱗', mat: 1, price: 0, sell: 40 + lo * 8, cat: '魔物素材', part11: k, d: n + '身上取下的虹色鱗片。把牠的晶石升級要用（鐵匠→晶石）。' };
  ITEMS['pr_' + k] = { n: B.n + '的虹心', mat: 1, price: 0, sell: 120 + lo * 24, cat: '魔物素材', part11: k, rare11: 1, d: n + '身上很少拿到的虹色結晶。把牠的晶石升到 ★3 要用。' };
  PART_OF11['pt_' + k] = { sp: k, rare: 0 }; PART_OF11['pr_' + k] = { sp: k, rare: 1 }; PART_LV11[k] = lo;
  CRY11[k] = ['u', '異色', iroCry15(b, lo)];
  return true; }
for (const m of IRO_MAPS15) { const d = MAPS[m]; if (!d || !d.encounters) continue; const [lo, hi, L] = MAP3_15[m], keys = [];
  for (const b of L) { const k = 'iro_' + b; if (IRO15[k] || iroMake15(k, b, m, lo)) keys.push(k); }
  IRO_OF_MAP15[m] = keys; d.rares15 = keys.map(k => [k, lo, hi]); d.rare = d.rares15[0] || null; }

// 圖：原本的 Q 版圖換成異色（Codex 的正式圖進來之後就用正式的）
{ const _ci = chibiImage; chibiImage = function (k) { const I = IRO15[k]; if (!I || chibiOwn(k)) return _ci(k); if (CHIBI_VAR[k]) return CHIBI_VAR[k];
    const src = _ci(I.b); if (!src || src.ok === false || src.complete === false) return src; const L = IRO_LOOK15[I.b] || ['金', 0];
    const c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [r, g, bb] = iroPx15(L, d[i], d[i + 1], d[i + 2]); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
    x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c; }; }

// 能力：一般那隻的 ×IRO_MUL15；不會逃跑
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const I = IRO15[sp]; if (!I) return _ue.call(this, core, sp, lv, kind, side, idx, o);
    const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s) return s; const base = BD.unitForEnemy(core, I.b, lv, 'wild', side, idx, {});
    if (base) { for (const q in IRO_MUL15) if (base.stats[q] != null) s.stats[q] = Math.max(1, Math.round(base.stats[q] * IRO_MUL15[q])); s.hp = s.stats.hp; if (base.skills && base.skills.length) s.skills = base.skills.slice(); }
    s.data.iro15 = 1; return s; }; }
{ const _d = BAI.decide; BAI.decide = function (core, u, o) { if (u && u.rare && IRO15[u.sp]) { u.rare = 0; try { return _d.call(this, core, u, o); } finally { u.rare = 1; } } return _d.call(this, core, u, o); }; }

// 出現：地圖上的稀有改成三種隨機；沒有地圖魔物的地方（隨機遇敵）也一樣
{ const _sp = Overworld.prototype.roamSpawn12; Overworld.prototype.roamSpawn12 = function () { const L = _sp.call(this), d = this.map.d;
    if (d.rares15 && d.rares15.length) for (const e of L) if (e.rare) { const r = pick(d.rares15), img = roamImg12(r[0]); if (!img) continue; e.sp = r[0]; e.lv = rnd(r[1], r[2]); e.img = img; e.aggro = false; }
    return L; }; }
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function (cfg, nr) { const d = this.map && this.map.d;
    if (cfg && !cfg.roam12 && d && d.rares15 && d.rares15.length && cfg.sp === d.rares15[0][0]) { const r = pick(d.rares15); cfg = { ...cfg, sp: r[0], lv: rnd(r[1], r[2]) }; }
    return _bs.call(this, cfg, nr); }; }

// 掉落：晶石（還沒有的話 30%）・部位・地圖的異色飾品（25%）
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const L = this.defeated().filter(v => IRO15[v.sp]); const r = yield* _v.call(this);
    const st = Game.st, map = Game.ow && Game.ow.map && Game.ow.map.id;
    for (const v of L) { const k = v.sp, I = IRO15[k]; this.focus = v; const got = {}, add = (q, n) => { if (n > 0 && ITEMS[q]) { got[q] = (got[q] || 0) + n; st.bag[q] = (st.bag[q] || 0) + n; } };
      add('pt_' + k, 1 + (chance(0.35) ? 1 : 0)); add('pr_' + k, chance(0.12) ? 1 : 0); Sound.sfx('item'); yield* this.msg(v.n + '留下了：' + matsText(got) + '！', { hold: 30 });
      if (!cryOwn11(st)[k] && chance(0.3) && cryGive11(k, st)) { Sound.jingle('item'); yield* this.msg('得到了特殊晶石「' + cryName11(k) + '」！', { wait: true });
        if (!st.flags.tutIro15) { st.flags.tutIro15 = 1; yield* this.msg('（異色晶石哪個部位的裝備都能鑲。用牠的虹鱗・虹心可以在鐵匠那裡升級。）', { wait: true }); } }
      const ak = iroAccOf15(I.m); if (ak && chance(0.25)) { const q = chance(0.05) ? 5 : chance(0.3) ? 4 : 3; yield* this.lootShow(makeGear(ak, q), v.n + '掉落了異色飾品！'); } }
    return r; }; }

// 遭遇卡・圖鑑・地圖進度
{ const _lh = lootHint; lootHint = function (key, sp) { const I = IRO15[sp]; if (!I) return _lh(key, sp); const ak = iroAccOf15(I.m);
    return (!cryOwn11()[sp] ? '機率掉「' + cryName11(sp) + '」・' : '') + '虹鱗' + (ak ? '・異色飾品「' + GEAR[ak].n + '」' : ''); }; }
{ const _mp = mapProgress12; mapProgress12 = function (id, st = Game.st) { const r = _mp(id, st), d = MAPS[id] || {}; if (!d.rares15 || !d.rares15.length) return r;
    const n = d.rares15.filter(([k]) => (((st.dex || {})[k] || {}).won || 0) > 0).length; r[1] = r[1].replace(/稀有魔物 [✓—]/, '異色 ' + n + '／' + d.rares15.length); if (!/異色/.test(r[1])) r[1] = (r[1] ? r[1] + '　' : '') + '異色 ' + n + '／' + d.rares15.length; return r; }; }
