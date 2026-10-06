/* ===================== v12.0.9w 超級重製第二階段（一）：素材點數、底裝、潛力賦予、鍛冶熟練、幻化、舊存檔（〈超級重製企劃：借鏡托蘭〉第二階段清單，玩家 2026-10-04「開始做吧」） =====================
   · 素材歸成六類點數（金屬・布料・獸材・木料・藥材・魔素）；點數＝打到的地區階級（T1 1〜T6 6、T7 8）。每隻小怪必給點數；任務要的素材先留在背包。
   · 底裝：武器 9 種×7 階、防具 3 系×頭身腳×7 階、盾 7 面，只有基本數值；其他裝備退場，外觀變成幻化外觀。
   · 品質決定基本數值、潛力和晶石孔（藍 10/0・紫 15/1・紅 20/1・金 25/2・虹 30/2）；賦予 10 種能力，一定成功，可以清掉重來（退一半點數）。
   · 鍛冶熟練 Lv1〜10 取代鐵匠階級；分解退一半點數；鐵匠：打造／賦予／晶石／幻化／分解。
   · 舊存檔：裝備換成同種同階底裝（品質照舊、外觀幻化成原本的樣子）、詞綴換成賦予、強化升星退點數、打造券和精煉石換金錢、素材換點數。 */

/* ---------- 素材點數 ---------- */
const PTS11 = ['金屬', '布料', '獸材', '木料', '藥材', '魔素'];
const PTS_COL11 = { 金屬: '#c8d0e0', 布料: '#f0d8f0', 獸材: '#e8b888', 木料: '#a8d890', 藥材: '#90e8c0', 魔素: '#b8a8ff' };
const MATCAT11 = {};
{ const M = { 金屬: ['stone', 'rustScrap', 'brassGear', 'spring', 'magmaStone'], 布料: ['feather', 'silk', 'banditCloth', 'shadowCloth', 'harpyFeather', 'batWing'],
    獸材: ['hareFur', 'wolfPelt', 'snowPelt', 'foxfire', 'frogSkin', 'crocHide', 'lizardScale', 'salamanderScale', 'dragonScale', 'beetleShell', 'beetleHorn', 'stinger', 'scorpTail', 'boneShard', 'stagHorn', 'boarTusk', 'ratTail'],
    木料: ['wood', 'rotWood', 'leaf', 'bogMoss', 'wheat'], 藥材: ['herb', 'manaHerb', 'spore', 'shroomCap', 'gel', 'cactusFruit', 'honey'],
    魔素: ['crystal', 'sandCrystal', 'iceCrystal', 'emberCore', 'ectoplasm', 'moonDew', 'wispFlame', 'mothDust', 'windStone', 'voidShard'] };
  for (const c in M) for (const k of M[c]) { if (!ITEMS[k]) bvErr('r9w', 'material ' + k); MATCAT11[k] = c; } }
const lvTier11 = lv => lv <= 7 ? 1 : lv <= 11 ? 2 : lv <= 15 ? 3 : lv <= 20 ? 4 : lv <= 27 ? 5 : lv <= 35 ? 6 : 7;
const tierPts11 = t => (t >= 7 ? 8 : Math.max(1, t)) + 2; // v12.26：每個素材 +2 點（完整走一輪的模擬：前期點數只夠打 0〜1 件）
// a material's own tier: the earliest map where it drops or is gathered (old bags are converted with this)
const MATT11 = {};
{ for (const m in MAPS) { const M = MAPS[m]; let lo = 99; const mats = new Set();
    for (const e of M.encounters || []) for (const r of e.table || []) { const S = SPECIES[r[0]]; if (!S) continue; lo = Math.min(lo, r[1]); if (S.mat) mats.add(S.mat); }
    for (const x of M.gathers || []) if (x.mat) mats.add(x.mat); if (lo === 99) continue;
    for (const k of mats) MATT11[k] = Math.min(MATT11[k] || 9, lvTier11(lo)); }
  for (const k in MATCAT11) if (!MATT11[k]) MATT11[k] = 3; }
const mapTier11 = (id = Game.ow && Game.ow.map && Game.ow.map.id) => { const M = MAPS[id]; let hi = 0; for (const e of (M && M.encounters) || []) for (const r of e.table || []) hi = Math.max(hi, r[2] || r[1]); return hi ? lvTier11(hi) : lvTier11((Game.st && Game.st.lv) || 1); };
const pts11 = (st = Game.st) => { const P = st.pt11 || (st.pt11 = {}); for (const c of PTS11) P[c] = P[c] || 0; return P; };
const ptsText11 = o => PTS11.filter(c => o[c]).map(c => c + ' ' + o[c]).join('、');
const ptsHave11 = (o, st = Game.st) => { const P = pts11(st); return PTS11.every(c => (P[c] || 0) >= (o[c] || 0)); };
const ptsPay11 = (o, st = Game.st, sign = -1) => { const P = pts11(st); for (const c in o) P[c] = Math.max(0, (P[c] || 0) + sign * o[c]); };
// the materials quests still ask for stay in the bag (open, unfinished commissions and camp requests)
function reserved11(st = Game.st) { const R = {}, add = need => { for (const k in need) R[k] = Math.max(R[k] || 0, need[k]); };
  if (typeof COMMISSIONS !== 'undefined') for (const id in COMMISSIONS) { const c = COMMISSIONS[id]; if (!c.need) continue; const s = (st.com || {})[id]; if (s && s.s === 'done') continue; let open = false; try { open = !c.open || c.open(st); } catch (e) { open = false; } if (open || s) add(c.need); }
  if (typeof CAMPQ12 !== 'undefined') for (const id in CAMPQ12) { const Q = CAMPQ12[id]; if (!Q.need) continue; const c = (st.camp12 || {})[id]; if (c && c.q === 2) continue; add(Q.need); }
  return R; }
// turn every material in the bag beyond what quests need into points; tierOf(k) gives the tier to use
function bagToPts11(st = Game.st, tierOf = k => MATT11[k] || 1, only = null) { const R = reserved11(st), got = {};
  for (const k in st.bag) { if (!MATCAT11[k] || !(st.bag[k] > 0) || (only && !only[k])) continue; const keep = R[k] || 0, n = Math.min(only ? only[k] : st.bag[k], st.bag[k] - keep); if (n <= 0) continue;
    st.bag[k] -= n; if (!st.bag[k]) delete st.bag[k]; const c = MATCAT11[k]; got[c] = (got[c] || 0) + n * tierPts11(tierOf(k)); }
  ptsPay11(got, st, 1); return got; }

/* ---------- 底裝 ---------- */
const BASEMUL11 = 1.2;
const WB11 = { 劍: { atk: [4, 6, 9, 12, 15, 18, 22] }, 短刀: { atk: [3, 5, 8, 10, 13, 15, 18], spe: [1, 1, 2, 2, 3, 3, 4] }, 斧: { atk: [5, 8, 11, 14, 18, 21, 25] }, 長槍: { atk: [4, 7, 10, 12, 16, 19, 22] },
  拳套: { atk: [3, 5, 8, 10, 13, 15, 18], spe: [1, 2, 2, 3, 3, 4, 5] }, 法杖: { spa: [4, 7, 10, 12, 15, 18, 22] }, 魔導書: { spa: [3, 5, 8, 10, 13, 16, 19], mp: [8, 10, 14, 16, 20, 24, 28] },
  樂器: { spa: [3, 5, 8, 10, 13, 15, 18], mp: [6, 8, 12, 14, 17, 20, 24] }, 火槍: { atk: [4, 6, 9, 11, 14, 17, 20] } };
const AB11 = {
  重甲: { head: { def: [2, 3, 5, 6, 8, 9, 11], spd: [1, 1, 2, 3, 3, 4, 5] }, body: { def: [4, 6, 9, 12, 15, 18, 21], spd: [1, 2, 3, 4, 5, 6, 7], hp: [0, 0, 2, 4, 5, 5, 6] }, feet: { def: [2, 3, 4, 5, 6, 7, 8], spe: [1, 2, 3, 3, 4, 4, 5] } },
  輕裝: { head: { def: [1, 2, 3, 4, 5, 6, 7], spd: [1, 2, 3, 3, 4, 5, 6], spe: [1, 1, 2, 2, 2, 3, 3] }, body: { def: [3, 5, 7, 9, 11, 14, 17], spd: [2, 3, 5, 6, 7, 8, 10], spe: [1, 1, 2, 2, 3, 3, 4] }, feet: { def: [1, 2, 2, 3, 4, 4, 5], spe: [3, 4, 5, 6, 7, 8, 10] } },
  法衣: { head: { def: [1, 2, 3, 4, 4, 5, 6], spd: [2, 3, 4, 5, 6, 7, 9], spa: [0, 0, 1, 1, 2, 2, 3] }, body: { def: [2, 3, 5, 7, 8, 10, 11], spd: [3, 5, 8, 11, 13, 16, 18], spa: [0, 1, 1, 2, 3, 3, 4] }, feet: { def: [1, 1, 2, 3, 3, 4, 5], spe: [2, 3, 4, 5, 6, 7, 8], spd: [1, 2, 2, 3, 4, 4, 5] } } };
const SB11 = { def: [2, 3, 5, 6, 8, 10, 12], hp: [2, 3, 5, 5, 7, 8, 9], spd: [1, 2, 3, 5, 7, 8, 10] }, SBLOCK11 = [8, 10, 12, 13, 14, 15, 16];
const WNAME11 = { 劍: '萌芽鎮鐵劍 砂漠彎刀 騎士團長劍 月光劍 王國騎士劍 黃銅發條劍 星辰之劍', 短刀: '獵刀 晨霧短刀 蠍尾短刀 月牙短刀 宮廷短劍 冰晶短刀 暗影短刀', 斧: '伐木斧 野豬戰斧 岩角戰斧 裂地戰斧 新月斧 霜嶺巨斧 泰坦巨斧',
  長槍: '見習長槍 鐵頭長槍 疾風槍 龍鱗槍 ★王國騎士槍 霜牙槍 天龍槍', 拳套: '布纏拳套 鐵指虎 岩拳套 氣功拳套 虎爪 熔拳套 星辰拳套', 法杖: '見習魔杖 礦晶短杖 古岩符文杖 湖霧法杖 宮廷魔杖 齒輪魔杖 星見法杖',
  魔導書: '入門魔導書 森之書 古岩魔導書 亡者之書 賢者之書 霜華魔導書 星典', 樂器: '木笛 旅人魯特琴 翠之豎琴 月光琴 風之號角 冰弦豎琴 星詠之琴', 火槍: '軟木塞槍 黃銅短銃 蒸汽步槍 連發齒輪槍 雷管砲 機巧火槍 星爆砲' };
const ANAME11 = { 重甲: ['萌芽鎮衛兵盔 旅人皮甲 旅人皮靴', '礦工頭燈盔 獵人皮甲 鐵趾工靴', '騎士團鐵盔 鎖子甲 騎士團護脛', '骸骨頭盔 鉗蟹甲 古代戰靴', '騎士團頭盔 騎士團鎧甲 騎士團長靴', '鐘塔護盔 熔岩重鎧 熔岩靴', '黯滅頭盔 黯滅重鎧 虛空長靴'],
  輕裝: ['旅人布帽 學生制服 學生皮鞋', '獵人羽帽 狼王披風 獵人軟靴', '沙漠頭巾 夜翼斗篷 影行靴', '蘆葦斗笠 流浪者斗篷 鱷皮長靴', '灰狼兜帽 黑羽斗篷 麥田靴', '雪原兜帽 雪人毛皮甲 彈簧靴', '★流星兜帽 星空之衣 流星靴'],
  法衣: ['荊棘花冠 晨霧斗篷 晨霧長靴', '螢菇帽 蛙皮斗篷 羽翼之靴', '魔女帽 蛛絲法袍 流沙靴', '稜鏡之冠 符文披風 湖畔長靴', '★宮廷法冠 宮廷長袍 沼澤長靴', '霜之后冠 裂界法衣 裂界靴', '星之冠 暗影長袍 ★暗影長靴'] };
const SNAME11 = '木製圓盾 鐵製小盾 騎士團鳶盾 水晶盾 黃銅齒輪盾 冰晶鏡盾 星辰聖盾';
// the four new names: [key, name, slot, look copied from]
const NEW11 = { '王國騎士槍': ['royalLance11', 'weapon', '龍鱗槍', '王國騎士團的長槍，槍身刻著王家的紋章。'], '流星兜帽': ['meteorHood11', 'head', '雪原兜帽', '縫著星屑的輕兜帽，跑起來像拖著一道光。'],
  '宮廷法冠': ['courtMitre11', 'head', '稜鏡之冠', '宮廷魔導士戴的法冠，鑲著聚魔的寶石。'], '暗影長靴': ['shadowBoots11', 'feet', '虛空長靴', '踩進影子裡也不會發出聲音的長靴。'] };
const SLOTN11 = { head: '頭', body: '身', feet: '腳' }, SLOTI11 = { head: 0, body: 1, feet: 2 };
const BASE11 = { weapon: {}, armor: { 重甲: { head: [], body: [], feet: [] }, 輕裝: { head: [], body: [], feet: [] }, 法衣: { head: [], body: [], feet: [] } }, shield: [] }, BASESET11 = new Set();
{ const byN = {}; for (const k in GEAR) { const G = GEAR[k]; if (G.slot && G.slot !== 'acc' && !byN[G.n]) byN[G.n] = k; }
  const mk = (n, slot) => { n = n.replace('★', ''); if (byN[n]) return byN[n]; const X = NEW11[n]; if (!X) { bvErr('r9w', 'base ' + n + ' missing'); return null; }
    const [key, sl, from, d] = X, src = byN[from], S = GEAR[src] || {}; GEAR[key] = { n, slot: sl, t: 1, st: {}, d, kind: S.kind, look: S.look, spr: S.spr };
    if (typeof WEAPON_PX !== 'undefined' && WEAPON_PX[src]) WEAPON_PX[key] = WEAPON_PX[src];
    if (typeof ARMOR_PX !== 'undefined') for (const k in ARMOR_PX) if (k.startsWith(src + '_')) ARMOR_PX[key + k.slice(src.length)] = ARMOR_PX[k];
    byN[n] = key; return key; };
  const scale = (tbl, t) => { const o = {}; for (const s in tbl) { const v = tbl[s][t - 1]; if (v) o[s] = Math.max(1, Math.round(v * BASEMUL11)); } return o; };
  for (const kind in WNAME11) { BASE11.weapon[kind] = WNAME11[kind].split(' ').map((n, i) => { const k = mk(n, 'weapon'); if (!k) return null; const G = GEAR[k];
      Object.assign(G, { t: i + 1, st: scale(WB11[kind], i + 1), sp: {}, kind, base11: 1, price: 400 * (i + 1) }); delete G.fx; delete G.elem; delete G.skill; BASESET11.add(k); return k; }); }
  for (const s in ANAME11) ANAME11[s].forEach((row, i) => row.split(' ').forEach((n, j) => { const sl = ['head', 'body', 'feet'][j], k = mk(n, sl); if (!k) return; const G = GEAR[k];
      Object.assign(G, { slot: sl, t: i + 1, st: scale(AB11[s][sl], i + 1), sp: {}, arm9: s, kind: s, base11: 1, price: G.price || 300 * (i + 1) }); delete G.fx; BASE11.armor[s][sl][i] = k; BASESET11.add(k); }));
  BASE11.shield = SNAME11.split(' ').map((n, i) => { const k = byN[n]; if (!k) { bvErr('r9w', 'shield ' + n); return null; } const G = GEAR[k];
    Object.assign(G, { t: i + 1, st: scale(SB11, i + 1), sp: { block: SBLOCK11[i] }, base11: 1 }); delete G.fx; BASESET11.add(k); return k; }); }
const isBase11 = k => BASESET11.has(k);
if (typeof UNIQUE_W !== 'undefined') for (const k of BASESET11) delete UNIQUE_W[k];
// any other weapon / armour / shield → the base of the same kind (armour: same system and slot) and tier
function base11Of(k) { const G = GEAR[k]; if (!G || G.slot === 'acc') return k; if (isBase11(k)) return k; const t = clamp(G.t || 1, 1, 7);
  if (G.slot === 'weapon') { const L = BASE11.weapon[G.kind]; return (L && L[t - 1]) || BASE11.weapon['劍'][t - 1]; }
  if (G.slot === 'shield') return BASE11.shield[t - 1];
  const s = G.arm9 || (G.slot === 'feet' ? '輕裝' : '重甲'); return BASE11.armor[s] && BASE11.armor[s][G.slot] ? BASE11.armor[s][G.slot][t - 1] : k; }
const glamOk11 = k => !!GEAR[k] && GEAR[k].slot !== 'acc' && !isBase11(k);
const glam11 = (st = Game.st) => st.gl11 || (st.gl11 = {});

/* ---------- 品質・潛力・晶石孔 ---------- */
const POT11 = [0, 10, 15, 20, 25, 30];
const potOf11 = g => g.pot != null ? g.pot : POT11[clamp(g.q || 1, 1, 5)];
// the 10 abilities: [name, per step, unit, potential, category, points per step (×tier), max steps, slots]
const EN11 = { atk: ['物攻', 1, '%', 2, '金屬', 2, 10, 'wa'], spa: ['魔攻', 1, '%', 2, '魔素', 2, 10, 'wa'], def: ['物防', 2, '%', 2, '金屬', 2, 10, 'ra'], spd: ['魔防', 2, '%', 2, '布料', 2, 10, 'ra'],
  hp: ['最大HP', 2, '%', 2, '獸材', 2, 10, 'ra'], crit: ['會心率', 1, '', 2, '獸材', 2, 10, 'wa'], spe: ['速度', 1, '', 3, '木料', 2, 6, 'wra'], stRes: ['異常抗性', 5, '%', 2, '藥材', 2, 6, 'ra'], heal: ['治癒效果', 3, '%', 2, '藥材', 2, 5, 'ra'] };
const EL11 = ['火', '水', '雷', '草'], ELPOT11 = 6, ELPTS11 = 10;
const enSlot11 = g => { const s = GEAR[g.b].slot; return s === 'weapon' ? 'w' : s === 'acc' ? 'a' : 'r'; };
const enOk11 = (g, k) => EN11[k][7].includes(enSlot11(g));
const potUsed11 = g => { let p = 0; for (const k in g.en11 || {}) if (EN11[k]) p += EN11[k][3] * g.en11[k]; if (g.el) p += ELPOT11; return p; };
const enStepCost11 = (g, k) => { const E = EN11[k], t = GEAR[g.b].t || 1; return { [E[4]]: Math.max(1, Math.round(E[5] * t * smithCut11())) }; };
const enElCost11 = g => ({ 魔素: Math.max(1, Math.round(ELPTS11 * (GEAR[g.b].t || 1) * smithCut11())) });
const enText11 = (k, n) => EN11[k][0] + ' +' + EN11[k][1] * n + EN11[k][2];

/* ---------- 鍛冶熟練 ---------- */
const SMX11 = [0, 0, 20, 50, 90, 140, 200, 270, 350, 440, 540];
const smith11 = (st = Game.st) => st.sm11 || (st.sm11 = { lv: 1, x: 0 });
const smithCut11 = (st = Game.st) => 1 - 0.02 * (smith11(st).lv - 1);
function smithExp11(n, st = Game.st) { const S = smith11(st); S.x += n; let up = 0; while (S.lv < 10 && S.x >= SMX11[S.lv + 1]) { S.lv++; up = S.lv; } return up; }
const QODDS11 = lv => { const b = (lv >= 4) + (lv >= 7) + (lv >= 10); return [55 - 5 * b, 30 + 2 * b, 12 + 2 * b, 3 + b]; };
const rollQ11 = (lv = smith11().lv) => { const o = QODDS11(lv); let r = Math.random() * 100; for (let i = 0; i < 4; i++) { r -= o[i]; if (r < 0) return i + 1; } return 1; };

/* ---------- 裝備實例：makeGear、數值、名字 ---------- */
let GEAR11_MINQ = 0, GEAR11_GLAM = true;
makeGear = function (b, q = 1, r) {
  const st = Game.st; st.gid = (st.gid || 0) + 1; const k = base11Of(b), from = k !== b && glamOk11(b) ? b : null;
  if (from) { glam11(st)[from] = 1; if (GEAR11_MINQ) q = Math.max(q, GEAR11_MINQ); }
  const g = { u: st.gid, b: k, q: clamp(q || 1, 1, 5), r: 1, a: [], en11: {} }; if (from && GEAR11_GLAM) g.gl = from;
  (st.gear || (st.gear = [])).push(g); return g; };
gearStats = function (g) { const B = GEAR[g.b] || { st: {} }, o = { st: {}, sp: { vs: [], resist: {} }, fx: (B.fx || []).slice() };
  for (const k in B.st || {}) o.st[k] = B.st[k];
  for (const k in B.sp || {}) { const v = B.sp[k]; if (Array.isArray(v)) continue; o.sp[k] = (o.sp[k] || 0) + v; }
  return o; };
gearName = g => '【' + GQ[g.q][0] + '】' + GEAR[g.b].n;
gearShort = g => GEAR[g.b].n;
gearSell = g => Math.round(((GEAR[g.b].t || 1) * 300) * 0.3 * (1 + 0.25 * ((g.q || 1) - 1)));
const isOff11 = (g, st = Game.st) => !!g && !!st.equip && st.equip.shield === g.u && GEAR[g.b].slot === 'weapon';
// enchants, element; the off-hand weapon adds half its base numbers (its enchants and crystals count fully)
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (!st || !st.equip) return s; const pct = {};
    for (const g of equippedGear(st)) { for (const k in g.en11 || {}) { const E = EN11[k]; if (!E || !g.en11[k]) continue; const v = E[1] * g.en11[k];
        if (k === 'crit') s.crit = (s.crit || 0) + v; else if (k === 'spe') s.spe += v; else if (k === 'stRes') s.stRes = (s.stRes || 0) + v; else if (k === 'heal') s.healUp = (s.healUp || 0) + v; else pct[k] = (pct[k] || 0) + v; } }
    const off = gearBy(st.equip.shield, st); if (off && GEAR[off.b].slot === 'weapon') { const o = gearStats(off).st; for (const k in o) if (s[k] != null) s[k] -= Math.ceil(o[k] / 2); }
    for (const k in pct) if (s[k] != null) s[k] = Math.floor(s[k] * (1 + pct[k] / 100));
    if (off && GEAR[off.b].slot === 'weapon') s.block = 0;
    const w = gearBy(st.equip.weapon, st); s.welem = (w && w.el) || null; s.oelem = off && GEAR[off.b].slot === 'weapon' ? off.el || null : null;
    return s; }; }

/* ---------- 名字・資訊 ---------- */
const kindLabel11 = g => { const B = GEAR[g.b]; return B.slot === 'weapon' ? B.kind : B.slot === 'shield' ? '盾' : B.slot === 'acc' ? '飾品' : (B.arm9 || '') + '・' + SLOTN11[B.slot]; };
function enLines11(g) { const L = [], used = potUsed11(g), pot = potOf11(g);
  L.push(['潛力 ' + used + '／' + pot + (crySlots11(g) ? '　晶石孔 ' + crySlots11(g) : ''), used >= pot ? UIC.muted : '#ffe08a', 10, 0]);
  for (const k in EN11) if ((g.en11 || {})[k]) L.push(['・' + enText11(k, g.en11[k]), '#c8f0ff', 11, 4]);
  if (g.el) L.push(['・' + g.el + '屬性', '#ffb878', 11, 4]); return L; }
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) { const B = g && GEAR[g.b]; if (!B) return _gi(g, wrapW);
    const L = [], P = (t, c = UIC.text, s = 10, ind = 0) => { for (const l of Font.wrap(t, wrapW - ind, s)) L.push([l, c, s, ind]); };
    P('T' + (B.t || 1) + '・' + kindLabel11(g) + (isOff11(g) ? '（副手：基本數值算一半）' : ''), UIC.accent);
    const [a, b] = gearLines(g); if (a) P(a, UIC.text, 11); if (b) P(b, UIC.warm, 10);
    L.push(...enLines11(g));
    for (const l of cryLines11(g, wrapW)) L.push(l);
    if (B.arm9 && typeof ARM9_RULE !== 'undefined' && ARM9_RULE[B.arm9]) P('【' + B.arm9 + '】每件：' + ARM9_RULE[B.arm9], UIC.muted, 9);
    if (g.gl && GEAR[g.gl]) P('外觀：' + GEAR[g.gl].n, '#d8b8ff', 9);
    if (B.d) P(B.d, UIC.muted, 9);
    return L; }; }

/* ---------- 幻化：看起來是另一件 ---------- */
{ const _hl = heroLookOf; heroLookOf = function (st = Game.st, over = {}) { if (!st || !st.gear || !st.gear.some(g => g.gl)) return _hl(st, over);
    const S = Object.create(st); S.gear = st.gear.map(g => g.gl && GEAR[g.gl] ? { ...g, b: g.gl } : g); return _hl(S, over); }; }
{ const _ws = weaponSpr; weaponSpr = function (st = Game.st) { const g = gearBy(st.equip && st.equip.weapon, st); if (g && g.gl && GEAR[g.gl]) return GEAR[g.gl].spr || 'ironSword'; return _ws(st); }; }

/* ---------- 掉落・獎勵：寶箱和獎勵給的退場裝備＝紅色以上底裝＋外觀 ---------- */
{ const _pi = Overworld.prototype.pickItem; Overworld.prototype.pickItem = function* (it) { GEAR11_MINQ = 3; try { return yield* _pi.call(this, it); } finally { GEAR11_MINQ = 0; } }; }
if (typeof giveReward === 'function') { const _gr = giveReward; giveReward = function* (...a) { GEAR11_MINQ = 3; try { return yield* _gr.apply(this, a); } finally { GEAR11_MINQ = 0; } }; }

/* ---------- 戰鬥後：拿到的素材（v12.17：素材先放背包，到鐵匠「素材換點數」才換；訊息統一寫「狼皮（獸材 +2）」） ---------- */
const matVal12 = k => tierPts11(MATT11[k] || 1);
const matLine12 = o => Object.keys(o).filter(k => o[k] > 0 && ITEMS[k]).map(k => ITEMS[k].n + (o[k] > 1 ? '×' + o[k] : '') + (MATCAT11[k] ? '（' + MATCAT11[k] + ' +' + o[k] * matVal12(k) + '）' : '')).join('、');
const MATMUTE12 = /^(得到了素材|（晶石）多撿到了素材|又撿到了素材|（幸運）多撿到了|(頭目|菁英)留下了素材)/;
const matTut12 = function* (show) { const st = Game.st; if (st.flags.tutMat12) return; st.flags.tutMat12 = 1; yield* show('（素材會放進背包。到鐵匠選「素材換點數」，就能換成打造・賦予用的點數；括號裡是換得到的點數。任務要的素材換的時候會自動留著。）'); };
{ const H = Battle.prototype, _m = H.msg; H.msg = function* (t, o) { if (this._mute11 && typeof t === 'string' && MATMUTE12.test(t)) return; return yield* _m.call(this, t, o); }; }
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () {
    const st = Game.st, bag0 = { ...st.bag }; this._mute11 = true; let r;
    try { r = yield* _v.call(this); } finally { this._mute11 = false; }
    if (!st || !(st.hp > 0)) return r;
    const gained = {}; for (const k in st.bag) if (MATCAT11[k] && (st.bag[k] || 0) > (bag0[k] || 0)) gained[k] = st.bag[k] - (bag0[k] || 0);
    // every felled monster leaves at least its own material (elites and bosses two)
    const need = {}, defeated = this.defeated ? this.defeated() : []; for (const v of defeated) { const k = (SPECIES[v.sp] || {}).mat; if (!k || !MATCAT11[k] || v.minion) continue; need[k] = (need[k] || 0) + (v.elite || v.boss ? 2 : 1); }
    for (const k in need) if ((gained[k] || 0) < need[k]) { st.bag[k] = (st.bag[k] || 0) + need[k] - (gained[k] || 0); gained[k] = need[k]; }
    if (typeof matRegion13 === 'function') matRegion13(gained, defeated); // v12.31：後期地區打到前期的素材，多掉幾個（見 v1_drops）
    // 晶石「素材 +%」: that much more of what dropped
    const up = (heroStats(st).cr11P || []).filter(p => p[0] === 'matUp').reduce((a, p) => a + p[1], 0);
    if (up > 0) for (const k in gained) { const x = gained[k] * up / 100, n = Math.floor(x) + (chance(x - Math.floor(x)) ? 1 : 0); if (n > 0) { st.bag[k] += n; gained[k] += n; } }
    // 菁英的招牌外觀：再戰打贏解鎖
    { const F = this.mainView && this.mainView(), key = (this.cfg || {}).id || (F && F.sp); if (F && F.elite && key && ((st.kills || {})[key] || 0) >= 2) { const k = sigOf10(key, F.sp); if (k && glamOk11(k) && !glam11(st)[k]) { glam11(st)[k] = 1; yield* this.msg('解鎖了「' + GEAR[k].n + '」的外觀！（鐵匠→幻化）', { hold: 26 }); } } }
    if (Object.keys(gained).length) { yield* this.msg('得到了素材：' + matLine12(gained) + '！', { hold: 30 }); yield* matTut12(t => this.msg(t, { wait: true })); }
    return r; }; }
// gathering: the materials go into the bag; the message shows what they are worth
{ const _dg = doGather; doGather = function (kind) { const st = Game.st, bag0 = { ...st.bag }, r = _dg(kind); const got = {}; for (const k in st.bag) if ((st.bag[k] || 0) > (bag0[k] || 0)) got[k] = st.bag[k] - (bag0[k] || 0);
    if (r && Object.keys(got).length) r.text = matLine12(got); return r; }; }

/* ---------- 鐵匠：打造 ---------- */
const CRAFTCAT11 = { 劍: ['金屬', '獸材'], 短刀: ['獸材', '金屬'], 斧: ['金屬', '木料'], 長槍: ['木料', '金屬'], 拳套: ['獸材', '布料'], 法杖: ['木料', '魔素'], 魔導書: ['布料', '魔素'], 樂器: ['木料', '布料'], 火槍: ['金屬', '木料'],
  重甲: ['金屬', '獸材'], 輕裝: ['獸材', '布料'], 法衣: ['布料', '魔素'], 盾: ['金屬', '木料'] };
const craftCost11 = (group, t) => { const [a, b] = CRAFTCAT11[group], m = smithCut11(); return { pts: { [a]: Math.round(8 * t * m), [b]: Math.round(4 * t * m) }, gold: 100 * t }; }; // v12.26：10t/5t → 8t/4t
const craftTop11 = (st = Game.st) => smithRank(st);
function* ptsBar11(f) { const scr = { draw(x) { drawWin(x, 4, 2, 168, 30, 'menu'); const P = pts11(); PTS11.forEach((c, i) => { const X = 10 + (i % 3) * 54, Y = 6 + Math.floor(i / 3) * 12; Font.draw(x, c, X, Y, PTS_COL11[c], UIC.textSh, 9); Font.drawR(x, String(P[c]), X + 50, Y, UIC.text, UIC.textSh, 9); }); } };
  UI.push(scr); try { return yield* f; } finally { UI.remove(scr); } }
function* craft11() { const st = Game.st;
  while (true) {
    const top = craftTop11(st), r = yield* ask('要打什麼？（能打到 T' + top + '）', ['武器', '防具', '盾', '返回']); if (r < 0 || r === 3) return;
    let group, pick;
    if (r === 0) { const K = Object.keys(WNAME11).filter(q => typeof kindOn13 !== 'function' || kindOn13(q)), k = yield* ask('哪一種武器？', K.concat('返回')); if (k < 0 || k >= K.length) continue; group = K[k]; pick = t => BASE11.weapon[group][t - 1]; }
    else if (r === 1) { const S = ['重甲', '輕裝', '法衣'], s = yield* ask('哪一系？\n重甲：物防高　輕裝：帶速度\n法衣：魔防高', S.concat('返回')); if (s < 0 || s >= 3) continue; const sl = yield* ask('哪個部位？', ['頭', '身', '腳', '返回']); if (sl < 0 || sl >= 3) continue;
      group = S[s]; const slot = ['head', 'body', 'feet'][sl]; pick = t => BASE11.armor[group][slot][t - 1]; }
    else { group = '盾'; pick = t => BASE11.shield[t - 1]; }
    const T = []; for (let t = 1; t <= top; t++) T.push(t);
    const opts = T.map(t => { const k = pick(t), c = craftCost11(group, t); return { t: 'T' + t + ' ' + GEAR[k].n, r: Object.entries(c.pts).map(([a, n]) => a + n).join('・'), dis: !ptsHave11(c.pts) || st.money < c.gold }; });
    const ti = yield* choose(opts.concat({ t: '返回' }), { title: group + '：選階級' }); if (ti < 0 || ti >= T.length) continue;
    const t = T[ti], k = pick(t), c = craftCost11(group, t), B = GEAR[k];
    const [a] = gearLines({ b: k, q: 1, en11: {} });
    if (!(yield* yesNo('打造「' + B.n + '」？（T' + t + '・' + a + '）\n需要：' + ptsText11(c.pts) + ' 點、' + c.gold + ' G' + '\n（品質隨機：品質越好，基本數值越高、潛力越多、晶石孔越多）'))) continue;
    if (!ptsHave11(c.pts) || st.money < c.gold) { Sound.sfx('bump'); yield* matShort12('點數或金錢不夠喔。'); continue; }
    // a rare part: roll the quality twice and keep the better one
    let q2 = false; const rare = Object.keys(st.bag).filter(i => /^pr_/.test(i) && st.bag[i] > 0 && ITEMS[i]);
    if (rare.length) { const p = yield* ask('要放稀有部位嗎？（品質抽兩次，取好的那次）', rare.map(i => ITEMS[i].n + '（有' + st.bag[i] + '）').concat('不放')); if (p >= 0 && p < rare.length) { st.bag[rare[p]]--; if (!st.bag[rare[p]]) delete st.bag[rare[p]]; q2 = true; } }
    ptsPay11(c.pts); st.money -= c.gold; const lv = smith11(st).lv; let q = rollQ11(lv); if (q2) q = Math.max(q, rollQ11(lv));
    GEAR11_GLAM = false; const g = makeGear(k, q); GEAR11_GLAM = true; g.pot = POT11[q] + (lv - 1); g.c11 = { ...c.pts };
    Sound.sfx('rock'); yield* say('鏘！鏘！鏘！'); Sound.jingle(q >= 3 ? 'levelup' : 'item'); yield* say('打好了！' + gearName(g) + '\n潛力 ' + g.pot + (crySlots11(g) ? '・晶石孔 ' + crySlots11(g) : ''));
    const up = smithExp11(3 * t); if (up) { Sound.jingle('levelup'); yield* say('鍛冶熟練升到了 Lv' + up + '！\n（打造的潛力 +1、花的點數 −2%' + ([4, 7, 10].includes(up) ? '、紅・金更容易出' : '') + '）'); }
    if (!st.flags.tutCraft11) { st.flags.tutCraft11 = 1; yield* say('打好的裝備只有基本數值。到「賦予」用潛力和點數加上想要的能力吧。'); } } }

/* ---------- 鐵匠：賦予 ---------- */
function* enchant11(g) { const st = Game.st, t = GEAR[g.b].t || 1;
  while (true) { const pot = potOf11(g), used = potUsed11(g), left = pot - used, en = g.en11 || (g.en11 = {});
    const keys = Object.keys(EN11).filter(k => enOk11(g, k)), wpn = GEAR[g.b].slot === 'weapon';
    const opts = keys.map(k => { const E = EN11[k], n = en[k] || 0, c = enStepCost11(g, k); return { t: E[0] + (n ? ' +' + E[1] * n + E[2] : ''), r: n >= E[6] ? '已滿' : '潛力' + E[3] + '・' + E[4] + c[E[4]], dis: n >= E[6] || left < E[3] }; });
    if (wpn) opts.push({ t: '屬性' + (g.el ? '：' + g.el : ''), r: g.el ? '已選' : '潛力' + ELPOT11 + '・魔素' + enElCost11(g).魔素, dis: !!g.el || left < ELPOT11 });
    opts.push({ t: '清掉重來', r: '退一半點數' }, { t: '完成' });
    const r = yield* choose(opts, { title: GEAR[g.b].n + '　潛力 ' + used + '/' + pot }); if (r < 0 || r === opts.length - 1) return;
    if (r === opts.length - 2) { if (!used) { yield* say('還沒有賦予任何能力。'); continue; } if (!(yield* yesNo('把賦予全部清掉嗎？（退回一半點數，潛力回滿）'))) continue;
      const back = {}; for (const c in g.e11 || {}) back[c] = Math.floor(g.e11[c] / 2); ptsPay11(back, st, 1); g.en11 = {}; delete g.el; g.e11 = {}; clampHP(); Sound.sfx('cancel'); yield* say('清掉了。' + (Object.keys(back).length ? '退回 ' + ptsText11(back) + ' 點。' : '')); continue; }
    let cost, apply;
    if (wpn && r === keys.length) { if (g.el) continue; const e = yield* ask('要賦予哪個屬性？（普通攻擊和武器技能都會變成這個屬性）', EL11.concat('取消')); if (e < 0 || e >= 4) continue; cost = enElCost11(g); apply = () => { g.el = EL11[e]; };
      if (left < ELPOT11) { yield* say('潛力不夠了。'); continue; } }
    else { const k = keys[r], E = EN11[k]; if ((en[k] || 0) >= E[6]) { yield* say('這項已經加到上限了。'); continue; } if (left < E[3]) { yield* say('潛力不夠了。'); continue; } cost = enStepCost11(g, k); apply = () => { en[k] = (en[k] || 0) + 1; }; }
    if (!ptsHave11(cost)) { Sound.sfx('bump'); yield* matShort12('點數不夠喔。（需要 ' + ptsText11(cost) + '）'); continue; }
    ptsPay11(cost); const E11 = g.e11 || (g.e11 = {}); for (const c in cost) E11[c] = (E11[c] || 0) + cost[c]; apply(); clampHP(); Sound.sfx('item');
    const up = smithExp11(1); if (up) { Sound.jingle('levelup'); yield* say('鍛冶熟練升到了 Lv' + up + '！'); } } }
function* enchantMenu11() { const st = Game.st;
  while (true) { const g = yield* gearPicker('賦予：選裝備', () => gearSort(), (x, q, Y) => { const u = potUsed11(q), p = potOf11(q); Font.draw(x, '潛力 ' + u + '/' + p + (q.el ? '　' + q.el + '屬性' : ''), 12, Y, u >= p ? UIC.muted : '#ffe08a', UIC.textSh, 10); });
    if (!g) return; yield* enchant11(g); } }

/* ---------- 鐵匠：分解・幻化 ---------- */
function* salvage11() { const st = Game.st;
  while (true) { const g = yield* gearPicker('分解：選裝備', () => gearSort().filter(q => !isEquipped(q)), (x, q, Y) => { const b = salvageBack11(q); Font.draw(x, '退回：' + (ptsText11(b) || '沒有點數'), 12, Y, UIC.accent, UIC.textSh, 9); });
    if (!g) return; const b = salvageBack11(g); if (!(yield* yesNo('分解「' + GEAR[g.b].n + '」嗎？\n退回 ' + (ptsText11(b) || '0') + ' 點。'))) continue;
    for (const sp of (g.cr11 || [])) if (typeof cryUnsocket11 === 'function') cryUnsocket11(sp, st); st.gear = st.gear.filter(q => q !== g); ptsPay11(b, st, 1); Sound.sfx('rock'); yield* say('分解好了。' + (ptsText11(b) ? '退回 ' + ptsText11(b) + ' 點。' : '')); } }
function salvageBack11(g) { const B = GEAR[g.b], t = B.t || 1, o = {}; let src = g.c11;
  if (!src) { const grp = B.slot === 'weapon' ? B.kind : B.slot === 'shield' ? '盾' : B.arm9; if (CRAFTCAT11[grp]) src = craftCost11(grp, t).pts; else src = { [PTS11[(t + (g.u || 0)) % 6]]: 5 * t }; }
  for (const c in src) o[c] = (o[c] || 0) + Math.floor(src[c] / 2); for (const c in g.e11 || {}) o[c] = (o[c] || 0) + Math.floor(g.e11[c] / 2); for (const c in o) if (!o[c]) delete o[c]; return o; }
const glamList11 = g => { const B = GEAR[g.b], G = glam11(); return Object.keys(G).filter(k => G[k] && GEAR[k] && GEAR[k].slot === B.slot && (B.slot !== 'weapon' || GEAR[k].kind === B.kind)).sort((a, b) => (GEAR[a].t || 0) - (GEAR[b].t || 0)); };
function* glamour11() { const st = Game.st;
  while (true) { const g = yield* gearPicker('幻化：選裝備', () => gearSort().filter(q => GEAR[q.b].slot !== 'acc'), (x, q, Y) => { Font.draw(x, '外觀：' + (q.gl && GEAR[q.gl] ? GEAR[q.gl].n : '原本的樣子') + '（可選 ' + glamList11(q).length + '）', 12, Y, '#d8b8ff', UIC.textSh, 9); });
    if (!g) return; const L = glamList11(g); if (!L.length) { yield* say('這一種還沒有可以幻化的外觀。\n退場裝備的外觀：舊存檔有的、寶箱和任務給的、頭目和菁英的招牌裝備（回憶石碑「困難」以上打贏）都會解鎖。'); continue; }
    const r = yield* choose([{ t: '原本的樣子' }].concat(L.map(k => ({ t: GEAR[k].n, r: 'T' + (GEAR[k].t || 1) }))).concat({ t: '返回' }), { title: GEAR[g.b].n + '的外觀' });
    if (r < 0 || r > L.length) continue; if (r === 0) delete g.gl; else g.gl = L[r - 1]; Sound.sfx('item'); yield* say('外觀換成了「' + (g.gl ? GEAR[g.gl].n : GEAR[g.b].n) + '」。'); } }
// 招牌裝備的外觀：回憶石碑「困難」以上打贏
{ const _ue = Overworld.prototype.steleTalk; Overworld.prototype.steleTalk = function* (s) { const st = this.st, sp = s && s.stele && s.stele.sp; const r = yield* _ue.call(this, s);
    if (sp && ((st.diff11 || {})[sp] || 0) >= 2) { const k = sigOf10(sp, sp); if (k && glamOk11(k) && !glam11(st)[k]) { glam11(st)[k] = 1; yield* say('解鎖了「' + GEAR[k].n + '」的外觀！（鐵匠→幻化）'); } }
    return r; }; }

/* ---------- 設計圖・打造券・精煉石都沒有了：給設計圖的地方改成直接給裝備（紅色以上底裝＋外觀） ---------- */
Game.smith11 = 1;
gainBP = function (k, q = 1, st = Game.st) { if (!GEAR[k]) return ''; const G0 = Game.st; Game.st = st; let g; try { g = makeGear(k, Math.max(3, q || 1)); } finally { Game.st = G0; }
  return gearName(g) + (g.gl && GEAR[g.gl] ? '（' + GEAR[g.gl].n + '的外觀）' : ''); };
Events.armorer = function* () { yield* say('王國的裝備現在都交給鐵匠打造了。\n鐵匠用素材點數打底裝，再把能力賦予上去——去找他吧。'); };
{ const _lh = lootHint; lootHint = function (key, sp) { return String(_lh(key, sp)).replace(/「([^」]*)」的設計圖/, '「$1」（底裝＋外觀）').replace(/、[^、]*$/, m => /素材|部位|經驗|金錢/.test(m) ? m : m); }; }

/* ---------- 鐵匠選單 ---------- */
smithMenu = function* (f) { const st = Game.st;
  if (!st.flags.tutSmith11) { st.flags.tutSmith11 = 1; yield* say('（鐵匠改版了！）\n打造：用素材點數打底裝，品質決定基本數值、潛力和晶石孔。\n賦予：用潛力和點數把能力加上去。\n晶石・幻化・分解也在這裡。\n素材換點數：把背包裡的素材換成點數。'); }
  yield* ptsBar11((function* () {
    while (true) { const S = smith11(st), r = yield* ask('要做什麼？（鍛冶熟練 Lv' + S.lv + '）', ['打造', '賦予', '晶石', '幻化', '分解', '離開']);
      if (r === 0) yield* craft11(); else if (r === 1) yield* enchantMenu11(); else if (r === 2) yield* cryMenu11(); else if (r === 3) yield* glamour11(); else if (r === 4) yield* salvage11(); else break; } })()); };

/* ---------- 舊存檔 ---------- */
const AFFEN11 = { atk: 'atk', spa: 'spa', def: 'def', spd: 'spd', hp: 'hp', crit: 'crit', spe: 'spe', stRes: 'stRes', healUp: 'heal', healUp9: 'heal', critDmg: 'crit', hit: 'crit', eva: 'spe', drain: 'hp', stHit: 'crit' };
function convertGear11(st) { if (!st || st.gear11v) return []; const L = [], G0 = Game.st; Game.st = st; let pts = {}, gold = 0, n = 0;
  try {
    for (const g of st.gear || []) { const B = GEAR[g.b]; if (!B) continue; const from = g.sb && GEAR[g.sb] ? g.b : g.b;
      if (B.slot !== 'acc') { const k = base11Of(g.b); if (k !== g.b) { if (glamOk11(g.b)) { glam11(st)[g.b] = 1; g.gl = g.b; } g.b = k; n++; } }
      if (g.sb) { delete g.sb; } g.q = clamp(g.q || 1, 1, 5); if (typeof SIGSET10 !== 'undefined' && SIGSET10.has(from) && GEAR[g.b].slot !== 'acc') g.q = Math.max(g.q, 4);
      // affixes → the same amount of enchant (what doesn't fit is paid back in points)
      const en = {}, t = GEAR[g.b].t || 1;
      for (const a of g.a || []) { const id = a[0], A = (typeof AFFIX_TABLE !== 'undefined' && AFFIX_TABLE[id]) || {}, key = AFFEN11[A.key || id]; if (!key || !EN11[key] || !enOk11(g, key)) { const c = PTS11[(t + n) % 6]; pts[c] = (pts[c] || 0) + 3 * t; continue; }
        const v = a.length === 3 ? a[2] : a[1]; en[key] = (en[key] || 0) + Math.max(1, Math.round((v || 1) / EN11[key][1])); }
      g.en11 = {}; let left = potOf11(g);
      for (const k in en) { const E = EN11[k], n2 = Math.min(en[k], E[6]); let s = 0; while (s < n2 && left >= E[3]) { s++; left -= E[3]; } if (s) g.en11[k] = s; if (en[k] > s) { const c = E[4]; pts[c] = (pts[c] || 0) + (en[k] - s) * E[5] * t; } }
      if (g.e) { const c = PTS11[(t + 2) % 6]; pts[c] = (pts[c] || 0) + g.e * 4 * t; } if (g.s) { const c = '魔素'; pts[c] = (pts[c] || 0) + g.s * 6 * t; }
      delete g.e; delete g.s; delete g.x; delete g.o; g.a = []; g.r = 1; }
    if (n) L.push('裝備換成了同種同階的底裝（品質照舊，外觀保持原本的樣子）。');
    // tickets, refine stones → gold
    let tk = 0; for (const k in st.bpN || {}) tk += (st.bpN[k] || []).reduce((a, q) => a + 300 * q, 0); for (const k in st.refine || {}) tk += (st.refine[k] || 0) * 300; gold += tk; st.bpN = {}; st.bpT = {}; st.refine = {};
    if (tk) { st.money += tk; L.push('打造券和精煉石換成了 ' + tk + ' G。'); }
    // materials in the bag → points (quest materials stay)
    const got = bagToPts11(st); for (const c in got) pts[c] = (pts[c] || 0) + got[c];
    ptsPay11(pts, st, 1); if (Object.keys(pts).length) L.push('素材、詞綴和強化換成了素材點數：' + ptsText11(pts) + '。');
  } finally { Game.st = G0; }
  st.gear11v = 1; return L; }
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; let L = []; if (st && st.cls !== undefined && !st.gear11v) { L = convertGear11(st); if (L.length) L.unshift('（鐵匠和裝備改版了！）'); }
    const ow = _so.apply(this, a); if (L.length && ow && ow.run) ow.run((function* () { yield* wait(24); yield* sayAll(L); })()); return ow; }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.gear11v = 1; st.pt11 = {}; st.sm11 = { lv: 1, x: 0 }; st.gl11 = {}; } return st; }; }
GROW12.push(['素材點數與鐵匠', '打倒魔物、採集會得到六類素材點數。鐵匠用點數打造底裝（品質決定基本數值、潛力和晶石孔），再用潛力和點數賦予能力；打造和賦予越多次，鍛冶熟練越高。']);
