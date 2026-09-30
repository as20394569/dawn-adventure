/* ===================== v26 drops that match (playtest: tickets / materials didn't match what was written or what the monster is) =====================
   · Every elite and boss has its own fitting material; a few odd pairs are fixed (the crab no longer drops lizard scales,
     the hellhound drops a fire core). 星之碎片 and 龍鱗 finally have a source (彗星鳥・星之守護者 / 火龍幼體).
   · Elites / bosses leave their own material + materials of the area they live in (no random pile from far regions).
   · A known blueprint dropping again turns into that gear's own materials.
   · The encounter card says what really drops (blueprint / ticket). Forging without materials says where to get them. */
Object.assign(SPECIES.reedCrab, { mat: 'beetleShell' }); Object.assign(SPECIES.hellHound, { mat: 'emberCore' }); Object.assign(SPECIES.cometBird, { mat: 'starShard' });
const BOSS_MAT = { wolf: 'wolfPelt', flower: 'leaf', croc: 'crocHide', mossGiant: 'stone', crystalGolem: 'crystal', golem: 'stone', bandit: 'banditCloth', banditBoss: 'banditCloth',
  boneKnight: 'boneShard', lizardChief: 'lizardScale', rogueBlade: 'moonDew', silverWyrm: 'moonDew', gatekeeper: 'riftShard', rockRhino: 'sandCrystal', duneWorm: 'sandCrystal',
  bogWitch: 'bogMoss', hydra: 'bogMoss', blackFeather: 'banditCloth', ratKing: 'ratTail', boarKing: 'boarTusk', harvestGolem: 'wheat', clockKnight: 'spring', clockColossus: 'brassGear',
  snowBear: 'snowPelt', frostLich: 'iceCrystal', frostQueen: 'iceCrystal', youngDragon: 'dragonScale', lavaGiant: 'magmaStone', duskCaptain: 'shadowCloth', victorDemon: 'voidShard',
  shadowGeneral: 'shadowCloth', starGuardian: 'starShard' };
for (const k in BOSS_MAT) if (SPECIES[k] && ITEMS[BOSS_MAT[k]] && !SPECIES[k].mat) SPECIES[k].mat = BOSS_MAT[k];
Object.assign(ITEMS.stone, { d: '堅硬的石塊。石頭類的魔物身上常有。' }); Object.assign(ITEMS.crystal, { d: '透明的水晶碎片。地下的洞窟和水道裡找得到。' });
Object.assign(ITEMS.beetleShell, { d: '硬邦邦的甲殼碎片。甲蟲和螃蟹身上都有。' }); Object.assign(ITEMS.wolfPelt, { d: '狼的毛皮。又厚又暖。' });
Object.assign(ITEMS.snowPelt, { d: '雪白的厚毛皮。雪原的野獸身上都有，穿上就不怕冷。' }); Object.assign(ITEMS.emberCore, { d: '火焰魔物留下的小火核。摸起來暖暖的。' });
Object.assign(ITEMS.starShard, { d: '流星掉下來的碎片。星見神殿的彗星鳥偶爾會帶著。' }); Object.assign(ITEMS.dragonScale, { d: '火龍幼體身上的鱗片。傳說中的鍛造材料。' });
// where each material comes from: [[species, map], …] and gathering maps
const MAT_SRC = (() => { const S = {}, mapN = m => (MAPS[m] && MAPS[m].name || m).replace(/ \d+F$/, ''), add = (k, t) => { (S[k] = S[k] || []).includes(t) || S[k].push(t); };
  for (const m in MAPS) { const d = MAPS[m];
    for (const e of d.encounters || []) for (const r of e.table || []) { const sp = SPECIES[r[0]]; if (sp && sp.mat) add(sp.mat, sp.n + '・' + mapN(m)); }
    for (const e of d.elites || []) { const sp = SPECIES[e.sp]; if (sp && sp.mat) add(sp.mat, sp.n + '・' + mapN(m)); }
    if (d.boss && SPECIES[d.boss.sp] && SPECIES[d.boss.sp].mat) add(SPECIES[d.boss.sp].mat, SPECIES[d.boss.sp].n + '・' + mapN(m));
    for (const g of d.gathers || []) if (g.mat) add(g.mat, '採集・' + mapN(m)); }
  return S; })();
const matSource = k => (MAT_SRC[k] || []).slice(0, 2).join('、') || '（還沒有發現）';
function missingText(c) { const st = Game.st, L = Object.entries(c.mats).filter(([k, n]) => (st.bag[k] || 0) < n).map(([k, n]) => ITEMS[k].n + '×' + (n - (st.bag[k] || 0)) + '（' + matSource(k) + '）');
  return (L.length ? '素材不夠喔。還缺：\n' + L.slice(0, 3).join('\n') : '') + (st.money < c.gold ? (L.length ? '\n' : '') + '金錢不夠（需要' + c.gold + ' G）' : '') || '素材或金錢不夠喔。'; }
// the area's own materials (monsters there + gathering), falling back to the tier pool
function areaMats(mapId, n, lv) { const d = mapId && MAPS[mapId], P = [];
  if (d) { for (const e of d.encounters || []) for (const r of e.table || []) { const sp = SPECIES[r[0]]; if (sp && sp.mat && ITEMS[sp.mat] && !P.includes(sp.mat)) P.push(sp.mat); } for (const g of d.gathers || []) if (g.mat && ITEMS[g.mat] && !P.includes(g.mat)) P.push(g.mat); }
  const pool = P.length ? P : TIER_POOL[clamp(Math.ceil((lv || 6) / 6), 1, 7)], st = Game.st, got = {};
  for (let i = 0; i < n; i++) { const k = pick(pool); got[k] = (got[k] || 0) + 1; st.bag[k] = (st.bag[k] || 0) + 1; } return got; }
function recipeMats(k, n) { const R = GEAR_RECIPE[k], st = Game.st, keys = R ? Object.keys(R.mats) : TIER_POOL[clamp(GEAR[k].t || 1, 1, 7)], got = {};
  for (let i = 0; i < n; i++) { const m = pick(keys); got[m] = (got[m] || 0) + 1; st.bag[m] = (st.bag[m] || 0) + 1; } return got; }
// the encounter card tells the truth: blueprint + ticket on the first kill, blueprints / tickets / materials after that
lootHint = function (key, sp) { const first = !((Game.st.kills || {})[key]), sig = (LOOT[key] || [])[0] || (SPECIES[sp] || {}).drop, mat = (SPECIES[sp] || {}).mat;
  if (first && sig && GEAR[classGear(sig)]) return '首次：隨機設計圖＋藍色打造券';
  if (LOOT[key]) return '再戰：' + LOOT[key].slice(0, 2).map(k => GEAR[classGear(k)].n).join('、') + '等的設計圖／打造券' + (mat && ITEMS[mat] ? '、' + ITEMS[mat].n : '');
  return mat && ITEMS[mat] ? '素材：' + ITEMS[mat].n : ''; };

// rift gear is forged from rift shards
for (const k of TOWER_LOOT) if (GEAR_RECIPE[k]) { const m = Object.keys(GEAR_RECIPE[k].mats).filter(i => i !== 'riftShard')[0]; GEAR_RECIPE[k].mats = { riftShard: 3, ...(m ? { [m]: 2 } : {}) }; }
