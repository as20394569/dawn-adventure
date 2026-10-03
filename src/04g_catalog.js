/* ===================== CATALOG: categories for every system (checked by tools/audit2.js) ===================== */
// ---- 道具分類 ----
const ITEM_CATS = ['回復', '狀態治療', '戰鬥道具', '永久強化', '魔物素材', '採集素材', '重要物品'];
const ITEM_CAT_OVERRIDE = { smoke: '戰鬥道具', herb: '採集素材' };
function itemCatOf(k) {
  const it = ITEMS[k]; if (ITEM_CAT_OVERRIDE[k]) return ITEM_CAT_OVERRIDE[k]; if (it.key) return '重要物品';
  if (it.mat) return Object.values(SPECIES).some(s => s.mat === k) ? '魔物素材' : '採集素材';
  return { heal: '回復', pp: '回復', mp: '回復', full: '回復', cure: '狀態治療', escape: '戰鬥道具', home: '戰鬥道具', boost: '永久強化', tp: '永久強化' }[it.use] || null;
}
for (const k in ITEMS) ITEMS[k].cat = itemCatOf(k);
const ITEM_CAT_COL = { 回復: '#62e08c', 狀態治療: '#8ad0ff', 戰鬥道具: '#ffcf5a', 永久強化: '#ff9ad0', 魔物素材: '#c8a878', 採集素材: '#9ac860', 重要物品: '#ffc44d' };

// ---- 地圖分類 ----
const MAP_TYPES = { town: '城鎮', home: '室內', elder: '室內', inn: '室內', shop: '室內', route: '野外', forest: '野外', ruins: '迷宮', mine: '迷宮', catacomb: '迷宮', sewer: '隱藏迷宮' };
for (const k in MAPS) MAPS[k].type = MAP_TYPES[k] || null;

// ---- 裝備分類：武器種類 ----
const WEAPON_KINDS = {
  劍: ['woodSword', 'ironSword', 'knightSword', 'foxBlade', 'crystalBlade', 'dawnSword', 'masterBlade', 'kingsBlade', 'voltSword', 'boneSaber'],
  短刀: ['mistDagger', 'fangDagger', 'emberKnife'],
  法杖: ['apprenticeStaff', 'oakStaff', 'ruinStaff', 'thornStaff', 'tideStaff', 'stormStaff'],
  斧: ['grenAxe'],
};
for (const kind in WEAPON_KINDS) for (const k of WEAPON_KINDS[kind]) if (GEAR[k]) GEAR[k].kind = kind;
// armor weight class (輕裝 favours speed/evasion, 重裝 favours defence) — derived from the stat profile
for (const k in GEAR) { const e = GEAR[k]; if (e.slot === 'head' || e.slot === 'body' || e.slot === 'feet') { const s = e.st || {}; e.kind = (s.def || 0) >= (s.spd || 0) + (s.spe || 0) ? '重裝' : '輕裝'; } if (e.slot === 'acc') e.kind = '飾品'; }

// ---- 特殊效果分類 ----
const SPECIAL_CATS = { 攻擊: ['double', 'pierce', 'lastStand', 'fervor', 'stormMark', 'cleave', 'first'], 防禦: ['thorns', 'endure', 'deathWard'], 回復: ['guardHeal', 'regen'], 資源: ['freeCast', 'wisdom', 'fortune'] };
for (const c in SPECIAL_CATS) for (const k of SPECIAL_CATS[c]) if (SPECIALS[k]) SPECIALS[k].cat = c;

// ---- 詞綴分類 ----
const AFFIX_CATS = { 基礎能力: ['atk', 'spa', 'def', 'spd', 'spe', 'hp'], 戰鬥: ['crit', 'hit', 'eva', 'drain'], 屬性與種族: ['elem', 'vs', 'resist'] };
for (const c in AFFIX_CATS) for (const k of AFFIX_CATS[c]) if (AFFIX_TABLE[k]) AFFIX_TABLE[k].cat = c;

// ---- 成就分類 ----
const ACH_CATS = { 戰鬥: ['win1', 'win100', 'elite', 'golem', 'crystal', 'bandit', 'knight', 'rare3'], 探索: ['explore'], 收集: ['dex', 'gold', 'rich'], 成長: ['enh5', 'cls2', 'lv20'], 故事: ['com', 'story'] };
for (const c in ACH_CATS) for (const id of ACH_CATS[c]) { const a = ACHIEVEMENTS.find(x => x.id === id); if (a) a.cat = c; }

// ---- 任務分類 ----
const QUEST_CATS = { '曙光的冒險者': '主線', '失蹤的弟弟': '支線', '見習獵人提姆': '支線', '師父的遺作': '支線', '商隊的危機': '支線', '失落的貨物': '支線', '力量的覺醒': '成長', '更高的道路': '成長', '會讓路的樹': '隱藏', '井底的月光': '隱藏', '井底更深處': '隱藏', '古王的墓穴': '隱藏', '委託告示板': '委託' };
const QUEST_CAT_COL = { 主線: '#6ee7d2', 支線: '#ffcf5a', 成長: '#c58cff', 隱藏: '#ff9ad0', 委託: '#8ad0ff' };
const questCatOf = q => q.n.startsWith('委託：') ? '委託' : QUEST_CATS[q.n] || null;

// ---- NPC 分類 ----
const NPC_ROLES = { 商店: ['smith', 'peddler', 'clerk'], 回復: ['mom', 'healer'], 任務: ['elder', 'florist', 'guard', 'lostBoy', 'tim', 'caravan'], 情報: ['gatekeeper', 'grandpa', 'traveler', 'customer', 'hiker', 'girl2', 'herbalist', 'apprentice', 'kid'] };
const npcRoleOf = id => Object.keys(NPC_ROLES).find(r => NPC_ROLES[r].includes(id)) || null;

// ---- 魔物階級 ----
const monRankOf = s => s.boss ? '頭目' : s.elite ? '菁英' : s.rare ? '稀有' : '野生';

// ---- regional loot fixes (no overlaps) ----
Object.assign(GEAR, {
  ruinMail: { n: '古岩護甲', slot: 'body', t: 3, st: { def: 8, spd: 4 }, sp: { resist: ['岩', 12] }, d: '用古岩遺跡的石板打磨成的護甲。' },
  kingsSeal: { n: '古王印戒', slot: 'acc', t: 4, st: { atk: 2, spa: 2, hp: 4 }, sp: { crit: 4 }, d: '刻著古王紋章的印戒。戴上後會聽見遠古的號令。' },
});
GEAR.ruinMail.kind = '重裝'; GEAR.kingsSeal.kind = '飾品';
MAPS.ruins.gearPool = ['boneSaber', 'ruinStaff', 'boneHelm', 'ruinMail', 'ectoLantern'];
MAPS.catacomb.gearPool = ['stormStaff', 'kingsBlade', 'runeMantle', 'ancientGreaves', 'kingsSeal'];
