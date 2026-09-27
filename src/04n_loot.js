/* ===================== v19 LOOT: wider quality gaps, a rainbow tier, boss & elite loot tables, reforging, new gear =====================
   Player feedback: blacksmith gear was enough to finish the game, bosses always dropped the same gold item (no reason to fight
   them again) and qualities felt alike. Now:
   - quality multipliers 1.0 / 1.2 / 1.45 / 1.75 / 2.1 and per-quality roll ranges; affixes scale with quality
   - 虹 (rainbow): 3 affixes + one extra random special effect; only from hard / New Game+ rematches and the Rift 15F+
   - crafted gear is 藍 (70%) or 紫 (30%) with low rolls — a safety net, not the end game
   - first kill of an elite / boss still gives its signature gold item; after that they can be fought again and roll a loot table
     of 3–4 unique items (金 15% / 紅 40% / 紫 45% for bosses) */
GQ[1][2] = 1.0; GQ[2][2] = 1.2; GQ[3][2] = 1.45; GQ[4][2] = 1.75; GQ[5] = ['虹', '#7ff0e8', 2.1];
Object.defineProperty(GQ[5], 1, { get: () => hsl2hex((Game.frame * 3) % 360, 0.75, 0.72) });
const GQ_ROLL = [null, [0.75, 0.92], [0.8, 1.0], [0.85, 1.05], [0.9, 1.1], [0.95, 1.15]];
AFFIX_COUNT[5] = 3;
const AFFIX_Q = [1, 1, 1, 1.15, 1.3, 1.5];
for (const k in AFFIX_TABLE) AFFIX_TABLE[k].max = Math.round(AFFIX_TABLE[k].max * 1.3); // v19: affix ceiling +30%

/* ---------- new special effects (see 07j/07k for the battle side) ---------- */
Object.assign(SPECIALS, {
  predator: { n: '獵殺本能', d: '對HP低於30%的對手，傷害+30%。' },
  breaker: { n: '碎盾', d: '物理攻擊有35%機率額外削減對手1點護盾。' },
  mpGuard: { n: '靜心', d: '選擇「防禦」時，額外回復10%最大MP。' },
  swift: { n: '疾風', d: '速度+15%。' },
  poisonEdge: { n: '淬毒', d: '物理攻擊有20%機率讓對手中毒。' },
  shadowStep: { n: '殘影', d: '閃過對手的攻擊後，立刻反擊（70%傷害）。' },
  spellblade: { n: '魔劍共鳴', d: '物理攻擊加上魔攻的30%；魔法攻擊加上物攻的30%。' },
});
// quality scaling + sane caps for percentage affixes (t5 gear would otherwise roll 40%+ resistances)
const AFFIX_CAP = { resist: 30, vs: 30, crit: 12, hit: 15, eva: 10, drain: 12, elem: 18 };
function scaleAffixes(list, q) { const k = AFFIX_Q[q] || 1; return list.map(a => { const key = (AFFIX_TABLE[a[0]] || {}).key || a[0], cap = AFFIX_CAP[key] || 99; return a.length === 3 ? [a[0], a[1], Math.min(cap, Math.round(a[2] * k))] : [a[0], Math.min(cap, Math.round(a[1] * k))]; }); }
const RAINBOW_FX = ['double', 'thorns', 'guardHeal', 'regen', 'endure', 'first', 'pierce', 'lastStand', 'fervor', 'predator', 'breaker', 'swift', 'poisonEdge', 'spellblade', 'mpGuard', 'shadowStep'];

makeGear = function (b, q = 1, r) {
  const st = Game.st; st.gid = (st.gid || 0) + 1; const B = GEAR[b], R = GQ_ROLL[q] || GQ_ROLL[1];
  const g = { u: st.gid, b, q, r: r ?? Math.round((R[0] + Math.random() * (R[1] - R[0])) * 100) / 100, a: rollAffixes(AFFIX_COUNT[q], B.slot, B.t) };
  g.a = scaleAffixes(g.a, q);
  if (q >= 5) { const pool = RAINBOW_FX.filter(f => !(B.fx || []).includes(f)); g.x = pick(pool); }
  (st.gear || (st.gear = [])).push(g); return g;
};
{ const _gs = gearStats; gearStats = function (g) { const o = _gs(g); if (g.x) o.fx = [...o.fx, g.x]; return o; }; }
const gearFx = g => [...(GEAR[g.b].fx || []), ...(g.x ? [g.x] : [])];
// crafted gear: a safety net, never better than a good drop
const craftQuality = () => chance(0.3) ? 2 : 1, craftRoll = () => Math.round((0.72 + Math.random() * 0.18) * 100) / 100;
// wild drops: better qualities on harder difficulties
rollQuality = function () { const d = (typeof diffOf === 'function' ? diffOf().drop : 0) + ((Game.st && Game.st.ng) ? 1 : 0), r = Math.random() * 100; return r < 60 - d * 12 ? 1 : r < 92 - d * 6 ? 2 : 3; };

/* ---------- new gear ---------- */
Object.assign(GEAR, {
  // rematch-only uniques (elites / bosses)
  wolfMantle: { n: '狼王披風', slot: 'body', t: 2, st: { def: 4, spd: 3, spe: 3 }, fx: ['predator'], d: '狂牙狼的銀色毛皮縫成的披風。穿上後會聞到獵物的氣味。' },
  thornCrown: { n: '荊棘花冠', slot: 'head', t: 2, st: { def: 2, spd: 4 }, fx: ['poisonEdge'], d: '荊棘魔花的花瓣編成的冠。尖刺上帶著毒。' },
  crocBoots: { n: '鱷皮長靴', slot: 'feet', t: 3, st: { spe: 3, def: 5 }, fx: ['mpGuard'], d: '沼澤鱷的厚皮做的長靴。站得再久也不會累。' },
  giantCore: { n: '苔石之核', slot: 'acc', t: 3, st: { hp: 6, def: 2 }, fx: ['endure'], d: '苔石巨人胸口的石核，摸起來溫溫的。' },
  banditKnife: { n: '盜賊匕首', slot: 'weapon', t: 3, st: { atk: 8, spe: 2 }, fx: ['poisonEdge'], d: '盜賊團愛用的淬毒匕首。' },
  graveBlade: { n: '冥騎士劍', slot: 'weapon', t: 4, st: { atk: 13 }, fx: ['breaker'], d: '骸骨騎士生前的佩劍。能劈開任何防禦。' },
  golemFist: { n: '古岩拳套', slot: 'acc', t: 4, st: { atk: 3, def: 2 }, fx: ['breaker'], d: '古岩魔像的指節改成的拳套。' },
  grenBelt: { n: '格倫的戰帶', slot: 'acc', t: 3, st: { atk: 2, hp: 5 }, fx: ['swift'], d: '鐵斧格倫綁在腰上的戰帶。跑起來特別快。' },
  prismCrown: { n: '稜鏡之冠', slot: 'head', t: 4, st: { def: 5, spd: 7 }, fx: ['spellblade'], d: '水晶魔像的稜鏡磨成的頭冠。劍與魔法在它的光中合而為一。' },
  // new elites / bosses (銀月湖畔・異界迴廊)
  reedBoots: { n: '蘆葦疾靴', slot: 'feet', t: 4, st: { spe: 7, def: 3 }, fx: ['swift'], d: '蜥人隊長的靴子。在水邊也跑得飛快。' },
  scaleCharm: { n: '蜥鱗護符', slot: 'acc', t: 4, st: { def: 2, spd: 2, hp: 4 }, fx: ['guardHeal'], d: '用蜥人隊長的鱗片串成的護符。' },
  eclipseBlade: { n: '魔劍「月蝕」', slot: 'weapon', t: 5, st: { atk: 12, spa: 10 }, fx: ['spellblade'], d: '流浪魔劍士的劍。劍身同時流著劍氣與魔力。' },
  wandererCloak: { n: '流浪者斗篷', slot: 'body', t: 4, st: { def: 6, spd: 8, spe: 3 }, fx: ['shadowStep'], d: '魔劍士穿了多年的斗篷。邊緣殘留著殘影。' },
  wyrmMail: { n: '銀鱗龍鎧', slot: 'body', t: 5, st: { def: 13, spd: 9, hp: 8 }, fx: ['regen'], d: '銀鱗水龍的鱗片打成的鎧甲，在月光下發出微光。' },
  wyrmFang: { n: '龍牙短刀', slot: 'weapon', t: 5, st: { atk: 14, spe: 3 }, fx: ['pierce'], d: '銀鱗水龍的牙磨成的短刀。' },
  wyrmStaff: { n: '潮龍杖', slot: 'weapon', t: 5, st: { spa: 16 }, fx: ['arcaneSurge'], d: '纏著銀鱗水龍之力的法杖，能喚來潮汐。' },
  gateKey: { n: '異界之鑰', slot: 'acc', t: 5, st: { hp: 10, atk: 3, spa: 3, spe: 3 }, fx: ['first', 'wisdom'], d: '異界守門者胸口的門扉之鑰。來自異界的人才能使用。' },
  voidBlade: { n: '虛空劍', slot: 'weapon', t: 5, st: { atk: 16 }, fx: ['lastStand'], d: '從異界裂縫中抽出的劍。越是危急，越是鋒利。' },
  voidTome: { n: '虛空魔導書', slot: 'weapon', t: 5, st: { spa: 13, mp: 24 }, fx: ['freeCast'], kind: '魔導書', d: '寫滿不屬於這個世界文字的魔導書。' },
  // 銀月湖畔 drops (t4)
  moonBlade: { n: '月光劍', slot: 'weapon', t: 4, st: { atk: 12 }, sp: { crit: 4 }, d: '在湖底沉睡的劍。劍身映著月光。' },
  lakeStaff: { n: '湖霧法杖', slot: 'weapon', t: 4, st: { spa: 12 }, sp: { elem: 6 }, d: '被湖霧浸透的法杖。' },
  moonDagger: { n: '月牙短刀', slot: 'weapon', t: 4, st: { atk: 11, spe: 2 }, sp: { crit: 5 }, d: '彎成月牙形的短刀。' },
  reedHat: { n: '蘆葦斗笠', slot: 'head', t: 4, st: { def: 4, spd: 5, spe: 2 }, d: '湖畔漁民編的斗笠。' },
  crabMail: { n: '鉗蟹甲', slot: 'body', t: 4, st: { def: 11, spd: 4 }, d: '蘆葦鉗蟹的殼做成的鎧甲。' },
  lakeBoots: { n: '湖畔長靴', slot: 'feet', t: 4, st: { spe: 5, def: 4 }, d: '在淺灘也不會進水的長靴。' },
  moonPendant: { n: '月露墜飾', slot: 'acc', t: 4, st: { spa: 3, hp: 4 }, sp: { elem: 5 }, d: '封著一滴月露的墜飾。' },
  lakeTome: { n: '湖之書', slot: 'weapon', t: 4, st: { spa: 9, mp: 18 }, kind: '魔導書', d: '湖畔隱士留下的魔導書。' },
  // 異界迴廊 drops (t5)
  riftSword: { n: '裂界劍', slot: 'weapon', t: 5, st: { atk: 15 }, sp: { crit: 5 }, d: '異界迴廊深處的劍。' },
  riftStaff: { n: '裂界杖', slot: 'weapon', t: 5, st: { spa: 15 }, sp: { elem: 8 }, d: '異界迴廊深處的法杖。' },
  riftDagger: { n: '裂界短刀', slot: 'weapon', t: 5, st: { atk: 13, spe: 3 }, sp: { crit: 6 }, d: '輕得像沒有重量的短刀。' },
  riftTome: { n: '裂界魔導書', slot: 'weapon', t: 5, st: { spa: 11, mp: 22 }, kind: '魔導書', d: '頁數每次打開都不一樣的魔導書。' },
  riftHelm: { n: '裂界盔', slot: 'head', t: 5, st: { def: 7, spd: 6, spe: 2 }, d: '異界騎士的頭盔。' },
  riftMail: { n: '裂界鎧', slot: 'body', t: 5, st: { def: 13, spd: 7 }, d: '異界騎士的鎧甲。' },
  riftRobe: { n: '裂界法衣', slot: 'body', t: 5, st: { def: 7, spd: 13, spe: 2 }, d: '織著星空的法衣。' },
  riftBoots: { n: '裂界靴', slot: 'feet', t: 5, st: { spe: 7, def: 6 }, d: '走在虛空也不會墜落的靴子。' },
  riftRing: { n: '裂界指環', slot: 'acc', t: 5, st: { atk: 2, spa: 2, spe: 2, hp: 5 }, d: '嵌著虛空碎片的指環。' },
  // ranger starting weapon
  huntKnife: { n: '獵刀', slot: 'weapon', t: 1, st: { atk: 4, spe: 1 }, d: '村裡獵人送的短獵刀。' },
});
WEAPON_KINDS.短刀.push('banditKnife', 'wyrmFang', 'moonDagger', 'riftDagger', 'huntKnife');
WEAPON_KINDS.劍.push('graveBlade', 'eclipseBlade', 'voidBlade', 'moonBlade', 'riftSword');
WEAPON_KINDS.法杖.push('wyrmStaff', 'lakeStaff', 'riftStaff');
WEAPON_KINDS.魔導書.push('voidTome', 'lakeTome', 'riftTome');
for (const kind in WEAPON_KINDS) for (const k of WEAPON_KINDS[kind]) if (GEAR[k]) GEAR[k].kind = kind;
for (const k of ['wolfMantle', 'thornCrown', 'crocBoots', 'prismCrown', 'reedBoots', 'wandererCloak', 'wyrmMail', 'reedHat', 'crabMail', 'lakeBoots', 'riftHelm', 'riftMail', 'riftRobe', 'riftBoots']) { const e = GEAR[k], s = e.st; e.kind = (s.def || 0) >= (s.spd || 0) + (s.spe || 0) ? '重裝' : '輕裝'; }
for (const k of ['giantCore', 'golemFist', 'grenBelt', 'scaleCharm', 'gateKey', 'moonPendant', 'riftRing']) GEAR[k].kind = '飾品';
Object.assign(MAGE_SWAP, { graveBlade: 'wyrmStaff', voidBlade: 'voidTome', banditKnife: 'lakeTome', wyrmFang: 'wyrmStaff' });

// paper-doll looks for the new gear (reuses the shapes, adds palettes)
Object.assign(HEAD_PAL, { thorn: { A: '#4a8a3a', a: '#2e5a26', C: '#f07a9a', E: '#ffd0e0' }, crystal: { A: '#8ad8f0', a: '#4a8ab0', C: '#e8fbff' }, reed: { A: '#c8b070', a: '#8a7440', C: '#e8d8a0' }, rift: { A: '#4a3a6a', a: '#2a1e44', C: '#b080ff' } });
Object.assign(BODY_LOOKS, {
  wolf: ['cloak', { X: '#6a7088', x: '#4a4e64', Y: '#b8c0d0', Z: '#3a2a20', z: '#e8e0d0', W: '#d8d0c0', D: '#9aa0b4', d: '#6a7088' }],
  wanderer: ['cloak', { X: '#2e3a5a', x: '#1e2640', Y: '#4a5a80', Z: '#3a2a20', z: '#b890ff', W: '#c8c0d8', D: '#3a4a70', d: '#1e2640' }],
  wyrm: ['plate', { X: '#b8c8d8', x: '#7a8aa0', Y: '#e8f4ff', y: '#9ab0c8', Z: '#3a8ac0' }],
  crab: ['plate', { X: '#b0583a', x: '#7a3a24', Y: '#d88a5a', y: '#a0603a', Z: '#4a6a3a' }],
  riftMail: ['plate', { X: '#3a2e54', x: '#221a36', Y: '#6a5a90', y: '#4a3e68', Z: '#b080ff' }],
  riftRobe: ['robe', { X: '#2a2448', x: '#1a1630', Z: '#b080ff', W: '#e0d8ff' }],
});
Object.assign(FEET_PAL, { croc: { B: '#3a6a5a', b: '#24463a' }, reed: { B: '#b09a60', b: '#7a6a3a' }, lake: { B: '#3a5a7a', b: '#243a54' }, rift: { B: '#3a2e54', b: '#221a36', P: '#6a5a90', p: '#4a3e68' } });
Object.assign(WPN_PAL, { grave: { I: '#d8d0e8', i: '#6a5a8a', T: '#2a2030', U: '#a02a38' }, eclipse: { I: '#f0e8ff', i: '#9a70e0', T: '#2e2440', U: '#e8c048' }, moon: { I: '#f8fbff', i: '#b8d0f0', T: '#3a4a6a', U: '#e0e8ff' },
  void: { I: '#e8d8ff', i: '#5a3a9a', T: '#1a1428', U: '#b080ff' }, wyrm: { I: '#ffffff', i: '#9ad0f0', T: '#3a5a7a', U: '#c8e8ff' }, rift: { I: '#f0e8ff', i: '#7a5ab0', T: '#221a36', U: '#b080ff' },
  wandL: { T: '#3a5a6a', V: '#a0e8ff' }, wandW2: { T: '#c8d8e8', V: '#60c0ff' }, wandR2: { T: '#221a36', V: '#c890ff' }, tomeL: { T: '#2e5a6a', U: '#a0e8ff', V: '#e8f4f8' }, tomeV: { T: '#1a1428', U: '#b080ff', V: '#d8c8f0' } });
Object.assign(GEAR_LOOK, {
  thornCrown: ['cap', 'thorn'], prismCrown: ['helm', 'crystal'], reedHat: ['cap', 'reed'], riftHelm: ['helm', 'rift', 'horns'],
  wolfMantle: 'wolf', wandererCloak: 'wanderer', wyrmMail: 'wyrm', crabMail: 'crab', riftMail: 'riftMail', riftRobe: 'riftRobe',
  crocBoots: 'croc', reedBoots: 'reed', lakeBoots: 'lake', riftBoots: 'rift',
  banditKnife: ['dagger', 'grey'], graveBlade: ['sword', 'grave'], eclipseBlade: ['sword', 'eclipse'], wyrmFang: ['dagger', 'wyrm'], voidBlade: ['sword', 'void'], moonBlade: ['sword', 'moon'], moonDagger: ['dagger', 'moon'],
  riftSword: ['sword', 'rift'], riftDagger: ['dagger', 'rift'], huntKnife: ['dagger', 'wood'],
  wyrmStaff: ['staff', 'wandW2'], lakeStaff: ['staff', 'wandL'], riftStaff: ['staff', 'wandR2'], voidTome: ['tome', 'tomeV'], lakeTome: ['tome', 'tomeL'], riftTome: ['tome', 'tomeV'],
});
for (const k in GEAR_LOOK) if (GEAR[k]) GEAR[k].look = GEAR_LOOK[k];

/* ---------- loot tables: signature first-kill item + rematch pool ---------- */
const LOOT = {
  wolf: ['fangDagger', 'wolfMantle', 'wolfNecklace'], flower: ['thornRing', 'thornCrown', 'sporeCharm'], croc: ['scaleArmor', 'crocBoots', 'frogCloak'],
  mossGiant: ['mossBracer', 'giantCore', 'hunterLeather'], thug1: ['banditHood', 'banditKnife', 'minerBoots'], thug2: ['banditKnife', 'banditHood', 'minerHelm'],
  boneKnight: ['boneKnightMail', 'graveBlade', 'boneHelm', 'kingsSeal'], golem: ['golemVisor', 'golemFist', 'ruinMail', 'ruinStaff'],
  banditBoss: ['grenAxe', 'grenBelt', 'banditKnife', 'stolenTome'], crystalGolem: ['crystalHeart', 'prismCrown', 'crystalBlade', 'crystalStaff'],
  lizardChief: ['reedBoots', 'scaleCharm', 'moonDagger', 'reedHat'], rogueBlade: ['eclipseBlade', 'wandererCloak', 'moonBlade'],
  silverWyrm: ['wyrmMail', 'wyrmFang', 'wyrmStaff', 'moonPendant'], gatekeeper: ['gateKey', 'voidBlade', 'voidTome', 'riftRing'],
};
const LOOT_Q = { boss: [[4, 15], [3, 40], [2, 45]], elite: [[4, 8], [3, 32], [2, 60]] };
function rollLootQuality(boss) {
  const d = diffOf().drop + (ngOf() ? 1 : 0);
  if ((d > 0) && chance(boss ? 0.02 + 0.02 * d : 0.01 + 0.01 * d)) return 5;
  const T = LOOT_Q[boss ? 'boss' : 'elite'].map(([q, w]) => [q, q === 4 ? w + d * 5 : q === 2 ? w - d * 5 : w]);
  let r = Math.random() * T.reduce((a, t) => a + t[1], 0); for (const [q, w] of T) { r -= w; if (r <= 0) return q; } return 2;
}
// called from Battle.victory: returns the gear instances dropped
function lootDrops(b) {
  const F = b.F, st = Game.st, key = b.cfg.id || F.sp, sp = SPECIES[F.sp] || {}, kills = st.kills || (st.kills = {}), first = !kills[key];
  kills[key] = (kills[key] || 0) + 1; const out = [];
  const sig = b.cfg.drop || sp.drop || (LOOT[key] || [])[0];
  if (first && sig && !b.cfg.rematch) out.push(makeGear(classGear(sig), 4));
  else if ((F.elite || F.boss) && LOOT[key]) out.push(makeGear(classGear(pick(LOOT[key])), rollLootQuality(F.boss)));
  if (b.cfg.rematch && F.boss && chance(0.35) && LOOT[key]) out.push(makeGear(classGear(pick(LOOT[key])), rollLootQuality(false)));
  return out;
}

/* ---------- reforging (blacksmith): reroll the random affixes of a 紫+ item ---------- */
const reforgeCost = g => { const t = GEAR[g.b].t; return { gold: 300 * t * g.q, mats: t <= 2 ? { stone: 2, gel: 1 } : t === 3 ? { stone: 2, crystal: 1 } : { crystal: 2, moonDew: t >= 5 ? 0 : 1, riftShard: t >= 5 ? 1 : 0 } }; };
function* reforgeFlow() {
  const st = Game.st, matsOf = c => Object.entries(c.mats).filter(([, n]) => n > 0);
  while (true) {
    const g = yield* gearPicker('詞綴重鑄', () => gearSort().filter(q => q.q >= 2), (x, g, Y) => { const c = reforgeCost(g); Font.draw(x, '重新隨機詞綴（' + AFFIX_COUNT[g.q] + '條）', 12, Y, UIC.accent, UIC.textSh, 11); Font.draw(x, matsOf(c).map(([k, n]) => ITEMS[k].n + '×' + n + '（有' + (st.bag[k] || 0) + '）').join(' '), 12, Y + 13, UIC.text, UIC.textSh, 10); Font.drawR(x, c.gold + ' G', 164, Y + 26, st.money >= c.gold ? UIC.warm : UIC.bad, UIC.textSh, 11); });
    if (!g) return;
    const c = reforgeCost(g), ok = st.money >= c.gold && matsOf(c).every(([k, n]) => (st.bag[k] || 0) >= n);
    if (!ok) { yield* say('素材或金錢不夠喔。'); continue; }
    if (!(yield* yesNo('要重鑄' + gearShort(g) + '的詞綴嗎？\n（原本的詞綴會消失）'))) continue;
    st.money -= c.gold; for (const [k, n] of matsOf(c)) st.bag[k] -= n;
    const B = GEAR[g.b]; g.a = scaleAffixes(rollAffixes(AFFIX_COUNT[g.q], B.slot, B.t), g.q);
    Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); Sound.jingle('item'); yield* say('重鑄完成！\n' + gearText(g));
  }
}

/* ---------- new materials ---------- */
Object.assign(ITEMS, {
  moonDew: { n: '月露', mat: 1, price: 0, sell: 60, d: '銀月湖畔的夜露。帶著淡淡的魔力。' },
  lizardScale: { n: '蜥鱗', mat: 1, price: 0, sell: 50, d: '湖蜥戰士堅硬的鱗片。' },
  mothDust: { n: '暮光鱗粉', mat: 1, price: 0, sell: 50, d: '暮光蛾翅膀上的鱗粉。' },
  riftShard: { n: '裂界碎片', mat: 1, price: 0, sell: 120, d: '異界迴廊裡散落的碎片。會自己發出微光。' },
  riftToken: { n: '迴廊徽章', key: 1, price: 0, sell: 0, d: '異界迴廊的通行證明。可以在迴廊入口的「看守人」那裡交換物品。' },
  swordPage: { n: '失落的劍譜', key: 1, price: 0, sell: 0, d: '魔劍士流派的劍譜殘頁。好像還有其他幾頁……' },
});
RECIPES.push(
  { out: 'moonDagger', mats: { moonDew: 3, lizardScale: 3 }, gold: 2400 }, { out: 'lakeStaff', mats: { moonDew: 3, mothDust: 3 }, gold: 2400 },
  { out: 'crabMail', mats: { lizardScale: 5, stone: 3 }, gold: 2600 }, { out: 'moonPendant', mats: { moonDew: 4, crystal: 2 }, gold: 2400 },
  { out: 'riftRing', mats: { riftShard: 5, moonDew: 2 }, gold: 5000 },
);
