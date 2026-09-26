/* ===================== GATHERING v2: node types, rare finds, mastery, more nodes ===================== */
Object.assign(ITEMS, { manaHerb: { n: '魔力草', mat: 1, price: 0, sell: 30, d: '葉脈會發出淡藍色微光的草。含有魔力，可以調製魔力藥水。' } }); ITEMS.manaHerb.cat = '採集素材';
// kind: [name, main mat, [min,max], [[rare mat, chance]...]]
const GATHER_KINDS = {
  herb: ['藥草叢', 'herb', [1, 2], [['manaHerb', 0.12]]],
  mana: ['魔力草', 'manaHerb', [1, 1], [['herb', 0.3]]],
  shroom: ['蘑菇叢', 'spore', [1, 2], [['shroomCap', 0.35]]],
  ore: ['礦脈', 'stone', [1, 2], [['crystal', 0.1]]],
  crystal: ['水晶簇', 'crystal', [1, 1], [['crystal', 0.15], ['stone', 0.3]]],
  gel: ['黏液灘', 'gel', [1, 2], [['herb', 0.15]]],
  bone: ['骨堆', 'boneShard', [1, 2], [['ectoplasm', 0.15]]],
  ecto: ['靈火', 'ectoplasm', [1, 1], [['boneShard', 0.3]]],
};
const GATHER_OF_MAT = { herb: 'herb', crystal: 'crystal', stone: 'ore', gel: 'gel', boneShard: 'bone', ectoplasm: 'ecto' };
const GATHER_RESPAWN = 100; // steps
const GATHER_LV = [0, 8, 20, 40, 70]; // total gathers needed for mastery Lv1..5
const gatherLv = (st = Game.st) => { const n = st.gatherN || 0; let L = 1; GATHER_LV.forEach((t, i) => { if (n >= t) L = i + 1; }); return L; };
// more nodes (tiles picked so they never block a path)
const MORE_GATHERS = {
  route: [['gr3', 2, 25, 'herb'], ['gr4', 15, 32, 'herb'], ['gr5', 4, 2, 'mana'], ['gr6', 19, 41, 'herb']],
  forest: [['gf3', 4, 1, 'mana']],
  mine: [['gm4', 7, 13, 'ore'], ['gm5', 13, 6, 'ore'], ['gm6', 6, 6, 'crystal']],
  sewer: [['gs3', 4, 10, 'mana'], ['gs4', 1, 5, 'gel']],
  ruins: [['gu1', 13, 2, 'ore'], ['gu2', 2, 10, 'bone'], ['gu3', 13, 10, 'ore'], ['gu4', 2, 2, 'mana']],
  catacomb: [['gk4', 5, 5, 'bone'], ['gk5', 12, 6, 'ecto'], ['gk6', 13, 13, 'crystal']],
};
for (const id in MAPS) for (const g of MAPS[id].gathers || []) { g.kind = g.kind || GATHER_OF_MAT[g.mat] || 'herb'; }
MAPS.forest.gathers.find(g => g.id === 'gf2').kind = 'shroom';
for (const id in MORE_GATHERS) { const d = MAPS[id]; d.gathers = d.gathers || []; for (const [gid, x, y, kind] of MORE_GATHERS[id]) d.gathers.push({ id: gid, x, y, kind, mat: GATHER_KINDS[kind][1] }); }
function doGather(kind, st = Game.st) {
  const K = GATHER_KINDS[kind], L = gatherLv(st), got = {};
  const add = (m, n) => { got[m] = (got[m] || 0) + n; st.bag[m] = (st.bag[m] || 0) + n; };
  add(K[1], rnd(K[2][0], K[2][1]) + (L >= 3 ? 1 : 0) + (L >= 5 ? 1 : 0));
  for (const [m, p] of K[3]) if (chance(p + 0.04 * (L - 1))) add(m, 1);
  const before = L; st.gatherN = (st.gatherN || 0) + 1; const up = gatherLv(st) > before ? gatherLv(st) : 0;
  return { text: Object.entries(got).map(([m, n]) => ITEMS[m].n + '×' + n).join('、'), up };
}
// node sprites
const GATHER_IMG = {
  herb: HERB_IMG,
  mana: spriteFrom(['................', '................', '.......w........', '......kBk.......', '...k.kBbBk.k....', '..kBkkBbBkkBk...', '..kBbkBbBkbBk...', '...kBbkbkbBk....', '....kBbkbBk.....', '.....kBBBk......', '......kkk.......', '................', '................', '................', '................', '................'], { k: '#1e2a5a', B: '#9ad8ff', b: '#4a8ae0', w: '#ffffff' }),
  shroom: spriteFrom(['................', '................', '................', '....kkkk........', '...kRRWRk..kkk..', '..kRWRRRRkkRWRk.', '..kkkkkkkkkkkkk.', '....kWWk...kWk..', '....kWWk...kWk..', '....kWWk..kkWk..', '...kkkkkk.kkkk..', '................', '................', '................', '................', '................'], { k: '#3a1a2a', R: '#d05a6a', W: '#f0e8d8' }),
  ore: spriteFrom(['................', '................', '................', '.....kkkk.......', '....kSSsSk......', '...kSsYSSSkk....', '..kSSSSsSSSSk...', '..kSsSSSYsSSk...', '.kSSSYSSSSsSSk..', '.kSsSSSSSsSSSk..', '..kkkkkkkkkkk...', '................', '................', '................', '................', '................'], { k: '#2a2622', S: '#8a8070', s: '#5a5244', Y: '#ffd860' }),
  crystal: spriteFrom(['................', '................', '.......k........', '......kCk.......', '...k..kCk..k....', '..kCk.kCWk.kCk..', '..kCWkkCWkkCWk..', '..kCWkCCWkkCWk..', '...kCkCCWkkCk...', '...kkkkkkkkkk...', '................', '................', '................', '................', '................', '................'], { k: '#1a3a5a', C: '#80e0ff', W: '#e8ffff' }),
  gel: spriteFrom(['................', '................', '................', '................', '................', '................', '.....kkkkk......', '...kkGGgGGkk....', '..kGGWGGGgGGk...', '..kGgGGGGGGGk...', '...kkkkkkkkk....', '................', '................', '................', '................', '................'], { k: '#1a4a3a', G: '#70e0b0', g: '#40a880', W: '#ffffff' }),
  bone: spriteFrom(['................', '................', '................', '................', '......kk........', '.....kWWk.kk....', '..kk.kWkkkWWk...', '.kWWkkWWWWWk....', '..kkWWWkWWkk....', '...kWkkWWkWWk...', '...kkkkkkkkkk...', '................', '................', '................', '................', '................'], { k: '#3a3228', W: '#e8e0c8' }),
  ecto: spriteFrom(['................', '................', '.......k........', '......kPk.......', '.....kPWPk......', '.....kPWPk......', '....kPPWPPk.....', '....kPPPPPk.....', '.....kPPPk......', '......kkk.......', '................', '................', '................', '................', '................', '................'], { k: '#2a1a4a', P: '#b890ff', W: '#ffffff' }),
};
// recipes that use the new herb
{ const mp = RECIPES.find(r => r.out === 'manaPotion'); if (mp) mp.mats = { herb: 1, manaHerb: 1 }; }
RECIPES.push({ out: 'hiEther', mats: { manaHerb: 3, crystal: 1 } }, { out: 'returnWing', mats: { feather: 3, manaHerb: 1 } });
function matSourceText(m) {
  const L = []; for (const k in GATHER_KINDS) { const K = GATHER_KINDS[k]; if (K[1] === m || K[3].some(r => r[0] === m)) L.push(K[0]); }
  for (const sp in SPECIES) if (SPECIES[sp].mat === m && (Game.st.dex || {})[sp]) L.push(SPECIES[sp].n);
  if (Object.values(SALVAGE).some(a => a.includes(m))) L.push('分解裝備');
  return [...new Set(L)].join('、') || '？？？';
}
