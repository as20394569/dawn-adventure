/* ===================== v12.0.8e 第八輪（五）：成就・圖鑑獎勵・洞窟之主的專屬裝備（玩家在〈第八輪提案〉第二步 H、I、J 勾「照這樣做」） =====================
   H 成就 9 個（每個跟現在一樣給 200 G）。
   I 圖鑑獎勵：一張野外地圖的魔物（含夜行魔物、那張地圖洞窟裡的魔物和洞窟之主）全部遇過，就給一次獎勵；圖鑑多一頁「各地圖」。
   J 洞窟之主的專屬裝備：第一次打倒必掉（設計圖＋保底金色的打造券，跟其他菁英的招牌裝備一樣）；武器各帶一個專屬技能。 */

/* =================== J. 洞窟之主的專屬裝備 =================== */
const LORD_GEAR12 = { // lord: [key, name, slot, kind, fx, tier, look-from, description, weapon skill [name, archetype, codes] ]
  glowToad: ['lgGlowCap12', '螢菇帽', 'head', null, 'mpGuard', 2, 'hunterCap', '用晨霧洞之主背上的發光蘑菇做成的帽子。戴著，心會靜下來。'],
  rockPangolin: ['lgScaleShield12', '岩鱗圓盾', 'shield', '盾', 'thorns', 2, 'ironBuckler', '用鼴鼠穴之主的岩石鱗片拼成的圓盾。打上來的力道會彈回去。'],
  crystalCrayfish: ['lgCrystalPincer12', '水晶鉗刃', 'weapon', '短刀', 'double', 2, 'mistDagger', '水幕洞之主的水晶大螯磨成的短刀。', ['晶鉗雙刺', 'twinFang', ['fdef-1']], '水'],
  rootSpider: ['lgRootCloak12', '根網斗篷', 'body', null, 'regen', 2, 'hunterLeather', '樹根洞之主的根網織成的斗篷。破了會自己長回來。'],
  sandGargoyle: ['lgSandWing12', '砂岩之翼', 'acc', '飾品', 'swift', 3, 'cactusCharm', '風蝕洞之主的小石翼。帶在身上，腳步變得輕快。'],
  moonJelly: ['lgMoonStaff12', '月潮法杖', 'weapon', '法杖', 'manaSiphon', 4, 'lakeStaff', '月光洞之主發光的觸手凝成的法杖。', ['月潮漫湧', 'tidalRage', ['drain:20']], '水'],
  mireEel: ['lgEelBoots12', '鰻皮長靴', 'feet', null, 'shadowStep', 4, 'mireBoots', '沼底洞之主滑溜的鰻皮做成的長靴。'],
  rockBeetle: ['lgBedrockMail12', '岩盤重鎧', 'body', null, 'endure', 4, 'crabMail', '舊隧道之主的岩盤背殼打成的重鎧。'],
  ramGhost: ['lgSiegeAxe12', '破城戰斧', 'weapon', '斧', 'cleave', 5, 'crescentAxe', '地下壕道的攻城槌鐵頭鍛成的戰斧。', ['破城斬', 'steelCleaver', ['fdef-1']]],
  hideoutBear: ['lgFeatherHood12', '黑羽頭巾', 'head', null, 'fervor', 5, 'wolfHood', '黑羽的藏身洞那頭大熊戴的頭巾，插著一根黑羽毛。'],
  termiteQueen: ['lgQueenCrown12', '蟻后之冠', 'acc', '飾品', 'fortune', 5, 'royalBadge', '舊穀倉地窖之主的大顎做成的小冠。'],
  iceMammoth: ['lgIceLance12', '冰牙長槍', 'weapon', '長槍', 'pierce', 6, null, '雪洞之主的冰柱長牙做成的長槍。', ['冰牙突', 'cloudPierce', ['fspe-1']], '水'],
  magmaNewt: ['lgMagmaFist12', '熔岩拳套', 'weapon', '拳套', 'lastStand', 6, null, '黑曜石洞之主背上的熔岩冷掉後打成的拳套。', ['熔岩噴拳', 'rockBreak', ['brn:30']], '火'],
};
const LORD_OF_GEAR12 = {};
ACC_TRAIT.swift = ['疾風', '速度 +15%', []]; // 砂岩之翼: the 疾風 special as an accessory trait
{ const near = (slot, kind, t) => { const L = Object.keys(GEAR).filter(k => GEAR[k].slot === slot && (!kind || GEAR[k].kind === kind) && !LORD_OF_GEAR12[k]); L.sort((a, b) => Math.abs(GEAR[a].t - t) - Math.abs(GEAR[b].t - t) || (GEAR[b].t - GEAR[a].t)); return L[0]; };
  for (const lord in LORD_GEAR12) { const [k, n, slot, kind, fx, t, from, d, ws, elem] = LORD_GEAR12[lord], ref = GEAR[from] ? from : near(slot, kind, t), R = GEAR[ref];
    const up = o => Object.fromEntries(Object.entries(o || {}).map(([a, v]) => [a, Math.max(1, Math.round(v * 1.1))]));
    GEAR[k] = { n, slot, t, st: up(R.st), sp: { ...(R.sp || {}) }, fx: [fx], kind: kind || R.kind, d, look: R.look, ...(elem ? { elem } : {}), lord12: lord };
    if (slot === 'acc') { GEAR[k].trait = fx; (ACC_TRAIT[fx] || ACC_TRAIT.fortune)[2].push(n); }
    if (slot === 'weapon' && typeof WEAPON_KINDS !== 'undefined' && WEAPON_KINDS[kind]) WEAPON_KINDS[kind].push(k);
    const sp = SPECIES[lord]; GEAR_RECIPE[k] = { mats: { [sp && sp.mat && ITEMS[sp.mat] ? sp.mat : 'stone']: 3 }, gold: 400 * t * t };
    LORD_OF_GEAR12[k] = lord; if (typeof BP_RARE !== 'undefined') BP_RARE.add(k); } }
// the weapon skills (same rules as 10t: total power of the tier, the archetype's shape, its own extra effect)
{ const avgHits = D => D.hits ? (D.hits[0] + D.hits[1]) / 2 : 1;
  for (const lord in LORD_GEAR12) { const [k, , slot, , , , , , ws] = LORD_GEAR12[lord]; if (slot !== 'weapon' || !ws) continue; const [n, arch, codes] = ws, G = GEAR[k], base = MOVES['o_' + arch], AD = DEF.skills['o_' + arch]; if (!base || !AD) { bvErr('v12.8', 'lord ws ' + arch); continue; }
    W12[k] = [n, arch, codes]; const id = 'u_' + k, dmg = (AD.power || 0) > 0, total = W12_TP[G.t] || 80, pow = dmg ? Math.max(10, Math.round(total / avgHits(AD))) : 0, archMp = ORB_A[arch].mp || 5, archTotal = (AD.power || 1) * avgHits(AD);
    const mp = dmg ? clamp(Math.round(archMp * total / archTotal), 2, 12) : archMp, magic = AD.cat === '特', aoe = AD.target === 'all_enemies', el = dmg && G.elem ? G.elem : magic ? AD.el : '一般';
    const fx = magic && el !== AD.el && W12_EL_FX[el] ? W12_EL_FX[el][aoe ? 1 : 0] : AD.fx, d = (dmg && el !== '一般' ? el + '屬性・' : '') + (W12_ARCH_D[arch] || (base.d || '').replace(/。$/, '')) + '；' + codes.map(evoText).join('、') + '。';
    MOVES[id] = { ...base, n, d, t: el, pow, fx, uniq: k, ws: 1, ueff: codes.slice(), orb: undefined }; SKILL_MP[id] = mp; const [cd, learn, prio] = SKILL12[arch] || [0, 6];
    defPut('skills', id, { ...skillFromMove(id, MOVES[id], { kind: 'skill', tpl: ORB_A[arch].tpl, extraTags: ['weapon'], costs: dmg || archMp ? [{ res: 'mp', amount: mp }] : [], fallback: 'attack' }), cooldown: cd, prio: prio || 0, metadata: { uniq: k, tpl: arch, learn, w12: 1 } });
    const D = DEF.skills[id]; D.fx = fx; D.effects = D.effects.map((ef, i) => typeof ef === 'string' ? ef : effRegister('skill:' + id + '#e' + i, ef)); D.after = D.after.map((ef, i) => typeof ef === 'string' ? ef : effRegister('skill:' + id + '#a' + i, ef));
    if (prio) D.tags = D.tags.filter(t => t !== 'priority').concat(['priority']); } }
// first kill: the lord's own piece (blueprint + a ticket for 金); later kills roll the area's loot as before
{ const _ld = lootDrops; lootDrops = function (b) { const F = b.F, key = b.cfg.id || F.sp, st = Game.st, first = !((st.kills || {})[key]), lord = /_lord$/.test(key) && Object.keys(LORD_GEAR12).find(l => l === F.sp);
    if (!lord || !first || b.cfg.rematch) return _ld(b); const out = _ld(b).filter(g => !g._first), g = makeGear(LORD_GEAR12[lord][0], 4); g._first = 1; out.unshift(g); return out; }; }
{ const _lh = lootHint; lootHint = function (key, sp) { const L = /_lord$/.test(key || '') && LORD_GEAR12[sp]; if (L && !((Game.st.kills || {})[key])) return '首次擊敗：必定掉落金色「' + L[1] + '」'; return _lh(key, sp); }; }

/* =================== I. 圖鑑獎勵 =================== */
const DEXMAP12 = [ // [map, act group]
  ['route', 0], ['windHills', 0], ['jadeCreek', 0], ['forest', 0], ['canyon', 0], ['lake', 0], ['swamp', 0], ['maplePass', 1], ['oldField', 1], ['northRoad', 2], ['goldPlains', 2], ['frostField', 2], ['emberPass', 2]];
const DEX_REWARD12 = [[[['superPotion', 3]], 1000], [[['megaPotion', 2]], 2000], [[['elixir', 1]], 3000]];
const WX_KEYS12 = new Set(Object.values(typeof WX_MON !== 'undefined' ? WX_MON : {}).map(r => r[0]));
function dexSet12(id) { const out = new Set(), add = d => { for (const z of (d && d.encounters) || []) for (const r of z.table || []) { const S = SPECIES[r[0]]; if (S && !S.rare && !WX_KEYS12.has(r[0]) && !BOUNTY12[r[0]]) out.add(r[0]); } };
  add(MAPS[id]); const cave = Object.keys(CAVE12).find(c => CAVE12[c].field === id); if (cave) { add(MAPS[cave]); for (const e of MAPS[cave].elites || []) out.add(e.sp); } return [...out]; }
const DEXSETS12 = {}; const dexOf12 = id => DEXSETS12[id] || (DEXSETS12[id] = dexSet12(id));
const dexSeen12 = (id, st = Game.st) => dexOf12(id).filter(k => ((st.dex || {})[k] || {}).seen).length;
function* dexCheck12() { const st = Game.st, got = st.dexRw12 || (st.dexRw12 = {});
  for (const [id, grp] of DEXMAP12) { if (got[id] || !MAPS[id]) continue; const L = dexOf12(id); if (!L.length || dexSeen12(id, st) < L.length) continue; got[id] = 1;
    const [items, gold] = DEX_REWARD12[grp]; for (const [k, n] of items) st.bag[k] = (st.bag[k] || 0) + n; st.money += gold; Sound.jingle('item');
    yield* say('【圖鑑】' + MAPS[id].name + '的魔物全部遇過了！\n得到了' + items.map(([k, n]) => ITEMS[k].n + (n > 1 ? '×' + n : '')).join('、') + '和' + gold + ' G！'); } }
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (...a) { const r = yield* _bs.apply(this, a); yield* dexCheck12(); return r; }; }
// the dex: a second page, each field map with how many of its monsters you have met
{ const _ds = dexScreen; dexScreen = function* () { const st = Game.st;
    while (true) { const r = yield* ask('要看哪一頁？', ['魔物一覽', '各地圖的魔物', '關閉']); if (r === 0) yield* _ds(); else if (r === 1) yield* dexMaps12(); else return;
      if (r === 0) return; } }; }
function* dexMaps12() { const st = Game.st;
  while (true) { const L = DEXMAP12.filter(([id]) => MAPS[id]), opts = L.map(([id]) => { const n = dexSeen12(id, st), m = dexOf12(id).length, done = (st.dexRw12 || {})[id];
      return { t: MAPS[id].name, r: '已遇過 ' + n + '／' + m + (done ? ' ✓' : ''), col: done ? UIC.dis : n >= m ? UIC.warm : UIC.text }; });
    const r = yield* ask('要看哪一張地圖？\n（夜行魔物、洞窟裡的魔物也算）', opts.concat(['返回'])); if (r < 0 || r >= L.length) return;
    const [id, grp] = L[r], [items, gold] = DEX_REWARD12[grp], left = dexOf12(id).filter(k => !((st.dex || {})[k] || {}).seen);
    yield* say(MAPS[id].name + '：' + ((st.dexRw12 || {})[id] ? '獎勵已經領過了。' : '全部遇過的話，可以得到' + items.map(([k, n]) => ITEMS[k].n + (n > 1 ? '×' + n : '')).join('、') + '和' + gold + ' G。') + (left.length ? '\n還沒遇過的有 ' + left.length + ' 種' + (left.some(k => typeof M7_KEYS !== 'undefined' && M7_KEYS.has(k)) ? '（有些晚上才出現）' : '') + '。' : '')); } }

/* =================== H. 成就 =================== */
const lordsDown12 = (st = Game.st) => Object.keys(CAVE12).filter(c => (st.kills || {})[c + '_lord']).length;
const lmAll12 = (st = Game.st) => { let n = 0, m = 0; for (const id in LANDMARK12) for (const l of LANDMARK12[id]) { m++; if (landmarkSeen12(id, l.n, st)) n++; } return m > 0 && n >= m; };
const nightSeen12 = (st = Game.st) => [...(typeof M7_KEYS !== 'undefined' ? M7_KEYS : [])].filter(k => ((st.dex || {})[k] || {}).seen).length;
ACHIEVEMENTS.push(
  { id: 'r8lords', n: '洞窟探險家', d: '打倒 13 隻洞窟之主。', ok: st => lordsDown12(st) >= 13 },
  { id: 'r8puzzles', n: '機關達人', d: '解開 13 個洞窟的機關。', ok: st => (st.cpN12 || 0) >= 13 },
  { id: 'r8landmarks', n: '地標巡禮', d: '走遍全部地標。', ok: st => lmAll12(st) },
  { id: 'r8night', n: '夜行者', d: '遇過 13 種夜行魔物。', ok: st => nightSeen12(st) >= 13 },
  { id: 'r8watch', n: '守夜人的朋友', d: '完成「守夜人的燈」。', ok: st => (st.flags.watch12 || 0) >= 2 },
  { id: 'r8scare', n: '麥田的守護者', d: '完成「麥田的稻草人」。', ok: st => !!st.flags.scare12done },
  { id: 'r8aurora', n: '極光之下', d: '看到北境的極光。', ok: st => (st.flags.aurora12 || 0) >= 2 },
  { id: 'r8champ', n: '強化魔物獵人', d: '打倒 20 隻強化魔物。', ok: st => (st.champ12N || 0) >= 20 },
  { id: 'r8ambush', n: '背後的一擊', d: '偷襲成功 30 次。', ok: st => (st.ambush12N || 0) >= 30 },
);
for (const [id, c] of Object.entries({ r8lords: '探索', r8puzzles: '探索', r8landmarks: '探索', r8night: '收集', r8watch: '故事', r8scare: '故事', r8aurora: '故事', r8champ: '戰鬥', r8ambush: '戰鬥' })) { const a = ACHIEVEMENTS.find(x => x.id === id); if (a) a.cat = c; }
// the cave puzzles count again from the save (older saves solved some before the counter existed)
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; if (st && st.cp12) st.cpN12 = Object.values(st.cp12).filter(q => q.solved).length; return _so.apply(this, a); }; }
