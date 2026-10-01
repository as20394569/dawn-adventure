/* ===================== v12.0.1 打造素材對齊裝備 =====================
   Player: 「部分裝備與打造素材不符」. Many recipes were filled from a tier pool by hash (09n, 09y, 09zt, 09zz), so a wooden practice
   sword needed slime gel and the frost tome needed salamander scales. Each listed gear now uses materials that match its name and
   come from monsters (or gather points) of its own area / level band. Only WHICH materials changed: the counts stay as they were
   (the first count goes to the first material, and so on). Gear not listed keep their recipe.
   Waiting for the player's decision (new early monsters): the 狼王 gear (灰狼皮 only from the route elite) and 鱷鱗甲／鱷皮長靴 (水道鱷皮 Lv25). */
const RECIPE_FIX12 = {
  // t1 (Lv1–6)
  ironSword: ['stone', 'hareFur'], huntKnife: ['stone', 'hareFur'], uniform: ['hareFur'], leather: ['hareFur'], schoolShoes: ['hareFur'],
  guardBadge: ['stone'], swiftFeather: ['feather', 'hareFur'], wrapFist: ['hareFur'],
  // t2 (Lv7–11)
  mistDagger: ['stone', 'frogSkin'], guardHelm: ['stone', 'hareFur'], hunterLeather: ['frogSkin', 'hareFur'],
  mistBoots: ['frogSkin', 'hareFur'], herbPouch: ['herb', 'hareFur'], minerHelm: ['stone', 'emberCore'],
  hunterCap: ['feather', 'hareFur', 'stone'], quartzWand: ['crystal', 'stone'], thornCrown: ['leaf', 'spore'],
  ironSpear: ['stone', 'frogSkin'], ironKnuckle: ['stone', 'hareFur'], brassPistol: ['stone', 'emberCore'],
  qHerbPouch: ['herb', 'leaf'], ironBuckler: ['stone', 'beetleShell', 'stone'], mistCloak: ['frogSkin', 'hareFur'],
  // t3 (Lv11–17)
  knightSword: ['stone', 'crystal'], ruinStaff: ['stone', 'ectoplasm'], knightHelm: ['stone', 'crystal'], chainMail: ['stone'],
  knightGreaves: ['stone', 'frogSkin'], thornRing: ['leaf', 'stone'], mossBracer: ['stone', 'leaf'], hunterOath: ['feather', 'hareFur'],
  banditHood: ['banditCloth'], grenAxe: ['stone', 'banditCloth'], tideStaff: ['moonDew', 'crystal'], boneSaber: ['boneShard', 'stone'],
  minerBoots: ['stone', 'frogSkin'], shadowBoots: ['batWing'], ruinMail: ['stone', 'boneShard'], magusStaff: ['crystal', 'ectoplasm'],
  stolenTome: ['banditCloth', 'leaf'], giantCore: ['stone'], banditKnife: ['banditCloth'], grenBelt: ['banditCloth', 'stone'],
  sandSaber: ['sandCrystal', 'scorpTail'], sandBoots: ['sandCrystal', 'harpyFeather'], rockFist: ['stone'], forestHarp: ['leaf'],
  steamRifle: ['stone'], galeLance: ['harpyFeather'], golemShield: ['beetleShell', 'frogSkin', 'stone'],
  // t4 (Lv15–22)
  dawnSword: ['emberCore', 'crystal'], moonCharm: ['moonDew'], crystalHeart: ['crystal'], masterBlade: ['stone', 'crystal'], masterStaff: ['crystal', 'rotWood'],
  stormStaff: ['stinger', 'crystal'], kingsBlade: ['boneShard'], runeMantle: ['ectoplasm'], boneKnightMail: ['boneShard', 'stone'],
  ancientGreaves: ['stone', 'boneShard'], kingsSeal: ['ectoplasm'], dawnStaff: ['emberCore', 'crystal'], deathTome: ['ectoplasm', 'boneShard'],
  graveBlade: ['boneShard'], golemFist: ['stone', 'ectoplasm'], prismCrown: ['crystal', 'moonDew'], reedBoots: ['beetleShell', 'lizardScale'],
  scaleCharm: ['lizardScale'], wandererCloak: ['mothDust'], moonBlade: ['moonDew'], reedHat: ['lizardScale', 'moonDew'], lakeBoots: ['lizardScale', 'moonDew'],
  witchHat: ['bogMoss'], bogStaff: ['bogMoss', 'rotWood'], treantMail: ['rotWood'], mireBoots: ['bogMoss', 'frogSkin'], rhinoHelm: ['sandCrystal', 'stone'],
  scaleSpear: ['lizardScale', 'stagHorn'], rockAxe: ['stone', 'stagHorn', 'stagHorn'], moonLyre: ['moonDew', 'silk'], gearRepeater: ['stone'],
  quakeAxe: ['stone', 'boneShard'], tideRapier: ['moonDew', 'crystal'], qScholarLens: ['crystal', 'stone'], qGraveBell: ['ectoplasm', 'boneShard'],
  crystalShield: ['crystal', 'silk', 'stone'], crabMail: ['beetleShell', 'lizardScale'], golemVisor: ['stone', 'ectoplasm'],
  // t5 (Lv20–27)
  eclipseBlade: ['moonDew'], wyrmMail: ['lizardScale', 'moonDew'], wyrmFang: ['lizardScale', 'moonDew'], wyrmStaff: ['moonDew', 'lizardScale'],
  wyrmShield: ['lizardScale', 'moonDew', 'stone'], gateKey: ['riftShard'], voidBlade: ['riftShard', 'wispFlame'], duneFang: ['sandCrystal'], wormCharm: ['sandCrystal'],
  sandTome: ['sandCrystal', 'harpyFeather'], witchTome: ['bogMoss'], hydraScale: ['bogMoss', 'lizardScale'], hydraFang: ['bogMoss', 'spore'], hydraStaff: ['bogMoss', 'rotWood'],
  royalSword: ['rustScrap', 'stone'], courtStaff: ['crystal'], royalHelm: ['rustScrap', 'stone'], royalMail: ['rustScrap', 'stone'], courtRobe: ['silk', 'moonDew'],
  royalGreaves: ['rustScrap', 'crocHide'], royalBadge: ['stone', 'wheat'], wheatBoots: ['wheat', 'wolfPelt'], blackCloak: ['banditCloth'],
  ratCrown: ['ratTail', 'rustScrap'], boarHelm: ['boarTusk', 'stone'], wolfTwin: ['wolfPelt', 'stone'], thunderFist: ['brassGear', 'stinger'], moonHarp: ['moonDew', 'silk'],
  qLakeScale: ['lizardScale', 'moonDew'], qDesertRose: ['sandCrystal', 'cactusFruit'], windHorn: ['windStone'], tigerClaw: ['boarTusk', 'wolfPelt'],
  boltCannon: ['rustScrap', 'stinger'], brassShield: ['brassGear', 'rustScrap', 'stone'],
  // t6 (Lv27–35)
  frostTome: ['iceCrystal', 'snowPelt'], clockHelm: ['brassGear', 'rustScrap'], clockMail: ['brassGear', 'spring'], ancientWatch: ['brassGear', 'spring'],
  frostBrand: ['iceCrystal', 'snowPelt'], frostHood: ['snowPelt'], salamanderHelm: ['salamanderScale', 'magmaStone'], magmaPlate: ['magmaStone', 'salamanderScale'],
  harvestScythe: ['wheat'], chronoLance: ['brassGear'], colossusCore: ['brassGear'], bearMantle: ['snowPelt'], lichTome: ['iceCrystal', 'ectoplasm'],
  frostTiara: ['iceCrystal', 'crystal'], lavaHeart: ['magmaStone', 'salamanderScale'], coreStaff: ['magmaStone', 'emberCore'], gearRifle: ['brassGear', 'magmaStone'],
  iceHarp: ['iceCrystal', 'silk'], glacierAxe: ['iceCrystal', 'stone'], frostSpear: ['iceCrystal', 'snowPelt'], magmaFist: ['magmaStone', 'salamanderScale'],
  frostShield: ['iceCrystal', 'crystal', 'stone'], lavaShield: ['magmaStone', 'salamanderScale', 'stone'], qGuildSeal: ['brassGear', 'stone'], qSnowFang: ['snowPelt', 'iceCrystal'],
  // t7 (Lv36–43)
  shadowDagger: ['shadowCloth', 'voidShard'], voidStaff: ['voidShard', 'shadowCloth'], duskHelm: ['shadowCloth'], duskPlate: ['shadowCloth'], voidBoots: ['voidShard', 'shadowCloth'],
  starSword: ['starShard', 'starDust'], starRobe: ['starDust', 'starShard'], duskBlade: ['shadowCloth', 'voidShard'], victorRing: ['voidShard', 'shadowCloth'],
  moldBlade: ['shadowCloth'], starLance: ['starShard', 'starDust'], starFist: ['starShard', 'starDust'], starLyre: ['starDust', 'starShard'], starBlaster: ['starShard', 'brassGear'],
  fallenLance: ['starShard', 'shadowCloth'], boneGreatsword: ['boneShard', 'shadowCloth'], starShield: ['starDust', 'starShard', 'stone'], shadowShield: ['shadowCloth', 'voidShard'],
  starTome: ['starDust', 'starShard'], voidTome: ['voidShard'],
};
for (const k in RECIPE_FIX12) { const R = GEAR_RECIPE[k]; if (!R) { if (BV2.DEV) bvErr('v12', 'recipe ' + k + ' missing'); continue; }
  const counts = Object.values(R.mats), keys = RECIPE_FIX12[k], m = {};
  counts.forEach((n, i) => { const id = keys[Math.min(i, keys.length - 1)]; if (!ITEMS[id]) { bvErr('v12', 'recipe mat ' + id); return; } m[id] = (m[id] || 0) + n; });
  R.mats = m; }
