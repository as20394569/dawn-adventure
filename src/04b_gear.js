/* ===================== GEAR: slots, random rolls, qualities, affixes ===================== */
// 6 slots: head/body/feet give the big numbers, accessories are small but carry special effects
const EQUIP_SLOTS = { weapon: '武器', head: '頭部', body: '身體', feet: '腳部', acc1: '飾品', acc2: '飾品' };
const SLOT_OF = s => s === 'acc1' || s === 'acc2' ? 'acc' : s;
// 藍 → 紫(+1 random affix) → 紅(stronger base) → 金(+2 random affixes)
const GQ = [null, ['藍', '#86b4ff', 1.0], ['紫', '#c58cff', 1.1], ['紅', '#ff6b7a', 1.25], ['金', '#ffc44d', 1.4]];
const GEAR = {
  // weapons
  woodSword: { n: '練習木劍', slot: 'weapon', t: 1, st: { atk: 2 }, spr: 'woodSword', d: '村長的學徒練習用的木劍。' },
  ironSword: { n: '萌芽鎮鐵劍', slot: 'weapon', t: 1, st: { atk: 5 }, price: 1200, d: '鎮上鐵匠打的樸素鐵劍。' },
  apprenticeStaff: { n: '見習魔杖', slot: 'weapon', t: 1, st: { spa: 5 }, price: 1200, spr: 'woodSword', d: '魔法學徒用的樺木杖。' },
  mistDagger: { n: '晨霧短刀', slot: 'weapon', t: 2, st: { atk: 6 }, sp: { crit: 4 }, d: '在晨霧道路上撿到的旅人短刀。' },
  oakStaff: { n: '森林橡木杖', slot: 'weapon', t: 2, st: { spa: 7 }, sp: { elem: 5 }, spr: 'woodSword', d: '用迷霧森林的古橡木削成的杖。' },
  fangDagger: { n: '狼王牙刃', slot: 'weapon', t: 2, st: { atk: 7 }, sp: { vs: ['一般', 15] }, d: '狂牙狼的尖牙磨成的短刃。' },
  knightSword: { n: '騎士團長劍', slot: 'weapon', t: 3, st: { atk: 9 }, sp: { hit: 5 }, price: 2600, d: '王都騎士團的制式長劍。' },
  foxBlade: { n: '狐火劍', slot: 'weapon', t: 3, st: { atk: 8 }, sp: { vs: ['草', 20] }, d: '劍身燃著狐火的劍。' },
  ruinStaff: { n: '古岩符文杖', slot: 'weapon', t: 3, st: { spa: 10 }, sp: { elem: 8 }, spr: 'woodSword', d: '刻著古岩遺跡符文的石杖。' },
  crystalBlade: { n: '水晶劍', slot: 'weapon', t: 4, st: { atk: 11 }, sp: { vs: ['水', 20] }, d: '用地下水道的水晶鍛造的利劍。' },
  dawnSword: { n: '晨曦之劍', slot: 'weapon', t: 4, st: { atk: 11 }, sp: { crit: 6, vs: ['岩', 20] }, d: '藏在森林深處的古劍，劍身映著黎明的光。' },
  // head
  clothCap: { n: '旅人布帽', slot: 'head', t: 1, st: { spd: 2, def: 1 }, price: 400, d: '旅人常戴的布帽。' },
  guardHelm: { n: '萌芽鎮衛兵盔', slot: 'head', t: 2, st: { def: 3, spd: 2 }, price: 1100, d: '萌芽鎮衛兵用過的舊頭盔。' },
  knightHelm: { n: '騎士團鐵盔', slot: 'head', t: 3, st: { def: 5, spd: 3 }, price: 2200, d: '王都騎士團的鐵盔。' },
  golemVisor: { n: '古岩面甲', slot: 'head', t: 4, st: { def: 6, spd: 5 }, d: '用古岩魔像的碎片打磨成的面甲。' },
  // body
  uniform: { n: '學生制服', slot: 'body', t: 1, st: { def: 2, spd: 2 }, d: '原本世界的學校制服。在這裡很少見。' },
  leather: { n: '旅人皮甲', slot: 'body', t: 1, st: { def: 4, spd: 1 }, price: 900, d: '結實的皮甲。' },
  hunterLeather: { n: '獵人皮甲', slot: 'body', t: 2, st: { def: 5, spd: 3 }, d: '森林獵人穿的輕便皮甲。' },
  frogCloak: { n: '蛙皮斗篷', slot: 'body', t: 2, st: { def: 5, spd: 5 }, sp: { resist: ['毒', 20] }, d: '防水又防毒的斗篷。' },
  chainMail: { n: '鎖子甲', slot: 'body', t: 3, st: { def: 8, spd: 3 }, price: 2000, d: '細密鐵環編成的鎧甲。' },
  scaleArmor: { n: '鱷鱗甲', slot: 'body', t: 3, st: { def: 7, spd: 5 }, sp: { resist: ['水', 20] }, d: '沼澤鱷的鱗片做成的鎧甲。' },
  stoneMail: { n: '硬石鎧甲', slot: 'body', t: 3, st: { def: 9, spd: 2 }, sp: { resist: ['岩', 15] }, d: '鑲著硬石的鎧甲。' },
  // feet
  schoolShoes: { n: '學生皮鞋', slot: 'feet', t: 1, st: { spe: 2, def: 1 }, d: '上學穿的皮鞋。走在石板路上會喀喀響。' },
  travelBoots: { n: '旅人皮靴', slot: 'feet', t: 1, st: { spe: 3, def: 1 }, price: 600, d: '走長路也不會累的皮靴。' },
  mistBoots: { n: '晨霧長靴', slot: 'feet', t: 2, st: { spe: 4, def: 2 }, d: '浸過晨霧也不會濕的長靴。' },
  featherBoots: { n: '羽翼之靴', slot: 'feet', t: 2, st: { spe: 5, def: 1 }, d: '縫著羽毛的長靴。' },
  knightGreaves: { n: '騎士團護脛', slot: 'feet', t: 3, st: { spe: 4, def: 4 }, price: 1800, d: '王都騎士團的鐵護脛。' },
  // accessories: small numbers, special effects
  guardBadge: { n: '萌芽鎮護身符', slot: 'acc', t: 1, st: { hp: 3 }, sp: { resist: ['一般', 10] }, d: '村長給的護身符。刻著萌芽鎮的新芽紋章。' },
  charm: { n: '魔法護符', slot: 'acc', t: 1, st: { spa: 2 }, sp: { elem: 5 }, price: 1000, d: '注入魔力的護符。' },
  swiftFeather: { n: '疾風羽飾', slot: 'acc', t: 1, st: { spe: 1 }, sp: { eva: 4 }, price: 800, d: '啾啾鳥羽毛做的髮飾。' },
  wolfNecklace: { n: '狼牙頸鍊', slot: 'acc', t: 2, st: { atk: 1 }, sp: { crit: 5 }, d: '晨霧道路的獵人愛戴的頸鍊。' },
  herbPouch: { n: '藥草香囊', slot: 'acc', t: 2, st: { hp: 4 }, sp: { resist: ['毒', 15] }, d: '藥草師愛用的香囊。' },
  sporeCharm: { n: '孢子護符', slot: 'acc', t: 2, st: { spa: 2 }, sp: { drain: 6 }, d: '封著孢子的護符。' },
  thornRing: { n: '荊棘指環', slot: 'acc', t: 3, st: { spa: 2 }, sp: { drain: 10, hit: 5 }, d: '纏著活荊棘的指環。' },
  mossBracer: { n: '苔石護腕', slot: 'acc', t: 3, st: { hp: 6, def: 1 }, sp: { resist: ['草', 20] }, d: '苔石巨人身上剝落的石環。' },
  moonCharm: { n: '月光護符', slot: 'acc', t: 4, st: { spa: 2, spe: 2 }, sp: { elem: 10 }, d: '從井底撈起的古老護符，散發著淡淡月光。' },
  crystalHeart: { n: '水晶之心', slot: 'acc', t: 4, st: { hp: 8, atk: 2, spa: 2 }, sp: { crit: 5 }, d: '水晶魔像的核心，閃耀著異界的光芒。' },
};
const STATK = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const SP_NAMES = { crit: '會心', hit: '命中', eva: '迴避', drain: '吸血', elem: '屬性傷害' };
const AFF_T = ['一般', '火', '水', '草', '雷', '岩', '毒', '飛'];
const AFFIX_COUNT = [0, 0, 1, 2, 2]; // 藍0 紫1 紅2 金2
function rollAffixes(n, slot = 'acc', tier = 1) {
  const pool = Object.keys(AFFIX_TABLE).filter(k => AFFIX_TABLE[k].slots.includes(slot)), out = [], used = new Set(), sc = 1 + (tier - 1) * 0.35;
  for (let guard = 0; out.length < n && guard < 50; guard++) {
    const tot = pool.reduce((a, k) => a + (used.has(k) ? 0 : AFFIX_TABLE[k].w), 0); let r = Math.random() * tot, id = pool[0];
    for (const k of pool) { if (used.has(k)) continue; r -= AFFIX_TABLE[k].w; if (r <= 0) { id = k; break; } }
    if (used.has(id)) continue; used.add(id); const A = AFFIX_TABLE[id], v = Math.max(1, Math.round(rnd(A.min, A.max) * sc));
    out.push(A.typed ? [id, A.fam ? pick(Object.keys(FAMILIES)) : pick(AFF_T), v] : [id, v]);
  }
  return out;
}
function makeGear(b, q = 1, r) {
  const st = Game.st; st.gid = (st.gid || 0) + 1;
  const B = GEAR[b]; const g = { u: st.gid, b, q, r: r ?? Math.round((0.75 + Math.random() * 0.25) * 100) / 100, a: rollAffixes(AFFIX_COUNT[q], B.slot, B.t) };
  (st.gear || (st.gear = [])).push(g); return g;
}
const gearBy = (u, st = Game.st) => (st.gear || []).find(g => g.u === u);
const equippedGear = (st = Game.st) => Object.values(st.equip || {}).map(u => gearBy(u, st)).filter(Boolean);
const isEquipped = (g, st = Game.st) => Object.values(st.equip || {}).includes(g.u);
function gearStats(g) {
  const B = GEAR[g.b], m = GQ[g.q][2] * g.r * (1 + 0.08 * (g.e || 0)), o = { st: {}, sp: { vs: [], resist: {} }, fx: B.fx || [] };
  for (const k in B.st) o.st[k] = Math.max(1, Math.round(B.st[k] * m));
  const add = (k, v, t) => { if (k === 'vs') o.sp.vs.push([t, v]); else if (k === 'resist') o.sp.resist[t] = (o.sp.resist[t] || 0) + v; else if (STATK.includes(k)) o.st[k] = (o.st[k] || 0) + v; else o.sp[k] = (o.sp[k] || 0) + v; };
  for (const k in B.sp || {}) { const v = B.sp[k]; if (Array.isArray(v)) add(k, v[1], v[0]); else add(k, v); }
  for (const a of g.a || []) { const key = (AFFIX_TABLE[a[0]] || {}).key || a[0]; if (a.length === 3) add(key, a[2], a[1]); else add(key, a[1]); }
  return o;
}
function gearLines(g) { // [base stats text, special text]
  const o = gearStats(g), p = [], s = [];
  for (const k of STATK) if (o.st[k]) p.push(STAT_NAMES[k] + '+' + o.st[k]); if (o.st.mp) p.push('MP+' + o.st.mp);
  for (const k in SP_NAMES) if (o.sp[k]) s.push(SP_NAMES[k] + '+' + o.sp[k] + '%');
  if (GEAR[g.b].elem) s.unshift(GEAR[g.b].elem + '屬性武器'); for (const [t, v] of o.sp.vs) s.push('對' + (FAMILIES[t] ? FAMILIES[t].n : t + '系') + '+' + v + '%'); for (const t in o.sp.resist) s.push(t + '系傷害-' + o.sp.resist[t] + '%');
  for (const f of o.fx) s.push('★' + SPECIALS[f].n);
  return [p.join(' '), s.join(' ')];
}
const gearText = g => gearLines(g).filter(Boolean).join(' ');
const gearName = g => '【' + GQ[g.q][0] + '】' + GEAR[g.b].n + (g.e ? ' +' + g.e : '');
const gearShort = g => GEAR[g.b].n + (g.e ? ' +' + g.e : '');
const enhanceCost = g => { const e = (g.e || 0) + 1, t = GEAR[g.b].t; return { gold: e * 150 * t * (Game.st.flags.smithDisc ? 0.5 : 1), mats: t <= 2 ? { stone: e } : t === 3 ? { stone: e, gel: e } : { crystal: e }, rate: e <= 3 ? 1 : e === 4 ? 0.75 : 0.5 }; };
const SALVAGE = { weapon: ['stone'], head: ['stone', 'gel'], body: ['stone', 'gel', 'frogSkin'], feet: ['feather', 'gel'], acc: ['feather', 'spore', 'leaf'] };
const gCol = g => GQ[g.q][1];
const gearSell = g => Math.round((GEAR[g.b].price || GEAR[g.b].t * 400) * 0.3 * GQ[g.q][2] * g.r);
let rollQuality = () => { const r = Math.random() * 100; return r < 60 ? 1 : r < 92 ? 2 : 3; }; // 金 only from elites, bosses and hidden content
function weaponSpr(st = Game.st) { const g = gearBy(st.equip && st.equip.weapon, st); return g ? GEAR[g.b].spr || 'ironSword' : null; }
// convert pre-v13 saves (item ids in bag/equip) into gear instances
const OLD_GEAR = { woodSword: ['woodSword', 1], ironSword: ['ironSword', 1], knightSword: ['knightSword', 2], fangDagger: ['fangDagger', 3], foxBlade: ['foxBlade', 2], crystalBlade: ['crystalBlade', 2], dawnSword: ['dawnSword', 4],
  uniform: ['uniform', 1], clothes: ['leather', 1], leather: ['leather', 1], chainMail: ['chainMail', 2], hunterLeather: ['hunterLeather', 2], scaleArmor: ['scaleArmor', 3], frogCloak: ['frogCloak', 2], stoneMail: ['stoneMail', 2],
  charm: ['charm', 1], boots: ['travelBoots', 1], featherBoots: ['featherBoots', 2], thornRing: ['thornRing', 3], sporeCharm: ['sporeCharm', 2], mossBracer: ['mossBracer', 3], moonCharm: ['moonCharm', 4], golemCore: ['golemVisor', 4], crystalHeart: ['crystalHeart', 4] };
function migrateGear(st) {
  if (st.gear) return; const G0 = Game.st; Game.st = st; st.gear = []; st.gid = 0;
  const old = st.equip || {}; st.equip = { weapon: null, head: null, body: null, feet: null, acc1: null, acc2: null };
  const conv = id => { const m = OLD_GEAR[id]; return m ? makeGear(m[0], m[1], 1) : null; };
  const slotMap = { weapon: 'weapon', armor: 'body', acc: 'acc1' };
  for (const s in old) { const g = old[s] && conv(old[s]); if (g) { const sl = GEAR[g.b].slot === 'acc' ? 'acc1' : GEAR[g.b].slot; st.equip[sl] = g.u; if (st.bag[old[s]]) st.bag[old[s]]--; } }
  for (const k in OLD_GEAR) { for (let i = 0; i < (st.bag[k] || 0); i++) conv(k); delete st.bag[k]; }
  if (!st.equip.feet) st.equip.feet = makeGear('schoolShoes', 1, 1).u;
  if (!st.equip.body) st.equip.body = makeGear('uniform', 1, 1).u;
  Game.st = G0;
}
