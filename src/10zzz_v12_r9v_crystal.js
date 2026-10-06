/* ===================== v12.0.9v 超級重製・第一階段：晶石與頭目難度（〈曙光冒險 超級重製企劃：借鏡托蘭〉，玩家 2026-10-04 決定表 1〜24、「第一階段清單」） =====================
   · 48 隻菁英・洞窟之主・頭目各有一顆晶石（名字＝怪物名＋晶石）。第一次打倒就得到 ★1；招牌裝備的設計圖不再掉（第 5 題：晶石取代招牌裝備）。
   · 晶石鑲在裝備的孔裡：紫・紅 1 個孔、金・虹 2 個孔（藍沒有）。武器晶石鑲武器、防具晶石鑲頭・身・腳・盾、飾品晶石鑲飾品、通用的哪裡都能鑲；隨時可以取出。
   · 升級：用同一隻魔物的部位升 ★2（部位×3）、★3（部位×5＋稀有部位×1），效果約 ×1.3、×1.6（代價不變）。
   · 合成：同一系列的上一顆 ★3 ＋下一顆 → 下一顆直接 ★2（上一顆會用掉）。
   · 回憶石碑可以選難度：普通・困難・惡夢・極限，打贏一級開下一級（打倒過的頭目一開始就能選困難）。
   · 素材點數、潛力賦予、新的底裝留到第二階段和新的鐵匠一起做（現在的打造先照舊）。
   · 舊存檔：打倒過的菁英・頭目，晶石直接送到手上。 */

/* ---------- 晶石資料 ---------- */
const CRY_T11 = { w: '武器', a: '防具', c: '飾品', u: '通用' };
const CRY11 = { // sp: [type, series, effects]   effect = [key, ★1 value, extra]
  wolf: ['w', '連擊', [['double', 15]]], bandit: ['w', '連擊', [['double', 20], ['spe', 3]]], crystalCrayfish: ['w', '連擊', [['double', 25], ['crit', 3]]],
  rockPangolin: ['a', '荊棘', [['thorns', 15]]], flower: ['a', '荊棘', [['thorns', 20], ['def', 4]]], youngDragon: ['a', '荊棘', [['thorns', 30], ['def', 8], ['hp', 5]]],
  mossGiant: ['a', '再生', [['regen', 2]]], rootSpider: ['a', '再生', [['regen', 3], ['spe', -3]]], silverWyrm: ['a', '再生', [['regen', 3], ['hp', 6]]],
  hydra: ['a', '再生', [['regen', 4], ['psnRes', 30]]], snowBear: ['a', '再生', [['regen', 4.5], ['hp', 8], ['spe', -5]]],
  rockRhino: ['w', '削防', [['defDown', 25]]], banditBoss: ['w', '削防', [['defDown', 30], ['atk', 4]]], wraithGeneral: ['w', '削防', [['defDown', 35], ['crit', 3]]],
  ramGhost: ['w', '削防', [['defDown', 40], ['atk', 6], ['spe', -4]]], harvestGolem: ['w', '削防', [['defDown', 40], ['brokenDmg', 15]]],
  iceMammoth: ['w', '削防', [['pierce', 20]]], duskCaptain: ['w', '削防', [['pierce', 30], ['atk', 8]]],
  duneWorm: ['c', '背水', [['back', 20]]], magmaNewt: ['c', '背水', [['back', 28], ['crit', 3]]], lavaGiant: ['c', '背水', [['back', 35], ['hp', -5]]], shadowGeneral: ['c', '背水', [['back', 45], ['hp', -8]]],
  millGolem: ['a', '速度', [['spe', 5]]], sandGargoyle: ['c', '速度', [['spe', 10]]], lizardChief: ['a', '速度', [['spe', 12], ['firstEva', 10]]],
  clockKnight: ['w', '速度', [['first', 1]]], clockColossus: ['c', '速度', [['initiative', 1], ['spe', 8]]],
  croc: ['a', '守護', [['guardHeal', 8]]], golem: ['a', '守護', [['endure', 1]]], rockBeetle: ['a', '守護', [['endure', 1], ['def', 6], ['spe', -4]]], boneKnight: ['a', '守護', [['deathWard', 1], ['def', 6]]],
  blackCatfish: ['w', '魔力', [['spa', 6]]], glowToad: ['a', '魔力', [['mpGuard', 8]]], moonJelly: ['w', '魔力', [['siphon', 3]]], bogWitch: ['a', '魔力', [['freecast', 10]]],
  frostLich: ['w', '魔力', [['siphon', 4], ['spa', 5]]], frostQueen: ['a', '魔力', [['mpGuard', 10], ['spd', 6]]], victorDemon: ['c', '魔力', [['siphon', 5], ['spa', 8], ['def', -5]]],
  mireEel: ['a', '影步', [['shadowStep', 1], ['eva', 3]]], blackFeather: ['a', '影步', [['shadowStep', 1], ['eva', 6]]],
  boarKing: ['a', '奮戰', [['fervor', 2]]], hideoutBear: ['a', '奮戰', [['fervor', 3], ['def', -3]]],
  ratKing: ['c', '幸運', [['gold', 30]]], termiteQueen: ['c', '幸運', [['gold', 50], ['matUp', 10]]],
  crystalGolem: ['u', '單顆', [['elemRes', 12]]], rogueBlade: ['w', '單顆', [['spellblade', 30]]], stagLord: ['w', '單顆', [['brokenDmg', 20], ['atk', 4]]], runeGolem: ['u', '單顆', [['all', 2]]],
};
const CRY_SER11 = {}; for (const sp in CRY11) { const s = CRY11[sp][1]; if (s !== '單顆') (CRY_SER11[s] || (CRY_SER11[s] = [])).push(sp); }
const CRY_STAR11 = [0, 1, 1.3, 1.6];
const CRY_FIXED11 = new Set(['first', 'initiative', 'endure', 'deathWard', 'shadowStep', 'fervor']); // these don't grow with ★
const CRY_STAT11 = { atk: '物攻', def: '物防', spa: '魔攻', spd: '魔防', spe: '速度', hp: '最大 HP' };
const cryName11 = sp => (sp === 'blackFeather' ? '黑羽' : SPECIES[sp].n) + '晶石';
const cryTier11 = sp => clamp(Math.ceil((PART_LV11[sp] || 10) / 6), 1, 7);
const cryVal11 = (e, star) => { const v = e[1]; if (CRY_FIXED11.has(e[0]) || v < 0) return v; const r = v * CRY_STAR11[star]; return r < 10 ? Math.round(r * 10) / 10 : Math.round(r); };
const pm11 = v => (v >= 0 ? '+' : '−') + Math.abs(v);
function cryEffText11(e, v) { const k = e[0];
  if (CRY_STAT11[k]) return CRY_STAT11[k] + ' ' + pm11(v) + '%';
  return ({ double: '物理攻擊 ' + v + '% 追加一擊（50%）', thorns: '受到攻擊時反彈 ' + v + '% 傷害', regen: '回合結束回復 ' + v + '% HP', defDown: '物理攻擊 ' + v + '% 讓目標物防 −1',
    pierce: '物理攻擊無視 ' + v + '% 物防', back: 'HP 越低傷害越高（最多 +' + v + '%）', first: '第一回合一定先行動', initiative: '用搶先技能後，下回合第一次攻擊 +20%', firstEva: '第一回合迴避 +' + v,
    guardHeal: '防禦時回復 ' + v + '% HP', endure: '每場 1 次撐住（剩 1 HP）', deathWard: '每場 1 次：HP 低於 30% 時得到 2 回合護盾', mpGuard: '防禦時回復 ' + v + '% MP',
    siphon: '普攻命中回復 ' + v + ' MP', freecast: '技能 ' + v + '% 機率不花 MP', shadowStep: '閃過攻擊時反擊', fervor: '攻擊後物攻或魔攻 +1（每場最多 ' + v + ' 次）',
    elemRes: '受到的魔法傷害 −' + v + '%', spellblade: '物理攻擊加上魔攻的 ' + v + '%；魔法攻擊加上物攻的 ' + v + '%', brokenDmg: '對破防中的魔物傷害 +' + v + '%',
    typeUp: e[2] + '屬性傷害 +' + v + '%', fireRes: '受到的火屬性傷害 −' + v + '%', psnRes: '中毒抗性 +' + v + '%', gold: '戰鬥金錢 +' + v + '%', matUp: '素材點數 +' + v + '%',
    crit: '會心 ' + pm11(v), eva: '迴避 ' + pm11(v), all: '全部能力 +' + v + '%' })[k] || k; }
const cryText11 = (sp, star = 1) => CRY11[sp][2].map(e => cryEffText11(e, cryVal11(e, star))).join('；');
// the encounter card / dex had 楓林鹿王「打部位」and 舊穀倉地窖之主「素材點數」: parts come in stage 3 and points in stage 2, so these stand in until then

/* ---------- 誰有幾顆、鑲在哪 ---------- */
const cryOwn11 = (st = Game.st) => st.cry11 || (st.cry11 = {});
const cryHost11 = (sp, st = Game.st) => (st.gear || []).find(g => (g.cr11 || []).includes(sp)) || null;
const crySlots11 = g => { const B = g && GEAR[g.b]; if (!B || !B.slot) return 0; return [0, 0, 1, 1, 2, 2][clamp(g.q || 1, 1, 5)]; };
const cryFits11 = (sp, g) => { const t = CRY11[sp][0], s = GEAR[g.b] && GEAR[g.b].slot; if (t === 'u') return true; return t === 'w' ? s === 'weapon' : t === 'c' ? s === 'acc' : ['head', 'body', 'feet', 'shield'].includes(s); };
function cryGive11(sp, st = Game.st) { const O = cryOwn11(st); if (O[sp] || !CRY11[sp]) return false; O[sp] = 1; return true; }
function cryUnsocket11(sp, st = Game.st) { const g = cryHost11(sp, st); if (g) g.cr11 = g.cr11.filter(x => x !== sp); }

/* ---------- 效果：能力在 heroStats，戰鬥效果是 passive ---------- */
PV('cr.double', v => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { cat: '物', hasPower: 1 }, chance: v / 100, effects: [{ type: 'damage', target: 'cast_targets', ofEvent: 0.5, field: 'total', kind: 'double', tags: ['multi_hit'] }] }] }));
PV('cr.thorns', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, hpLost: 1, srcAlive: 1 }, prio: 4, effects: [{ type: 'damage', target: 'source', ofEvent: v / 100, bossMul: 0.6, kind: 'thorns', tags: ['reflect'] }] }] }));
PV('cr.regen', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, foesHaveBoss: 0 }, effects: [{ type: 'heal', target: 'self', pct: v / 100, kind: 'regen', quiet: 1 }] },
  { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, foesHaveBoss: 1 }, effects: [{ type: 'heal', target: 'self', pct: v / 150, kind: 'regen', quiet: 1 }] }] }));
PV('cr.defDown', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { cat: '物', hasPower: 1 }, limit: { perAction: 1 }, chance: v / 100, effects: [{ type: 'break_chip', target: 'event_target', n: 1, why: 'breaker' }] }] }));
PV('cr.pierce', v => ({ mods: [{ stage: 'attacker', who: 'attacker', defMul: 1 - v / 100, cond: { cat: '物' } }] }));
BR.FORMULA.crBack11 = (c, v) => 1 + v / 100 * (1 - c.src.res.hp / c.src.max.hp);
PV('cr.back', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: { f: 'crBack11', v }, cond: { hasPower: 1 } }] }));
PV('cr.first', () => ({ mods: [{ stage: 'attacker', who: 'attacker', firstRoundPrio: 1 }] }));
PV('cr.initiative', v => DEF.passives['fx.initiative'].make(v));
PV('cr.firstEva', v => ({ mods: [{ stage: 'defender', who: 'defender', accAdd: -v, cond: { round: 1 } }] }));
PV('cr.guardHeal', v => ({ triggers: [{ on: EVT.DEFEND, phase: 'POST', role: 'src', effects: [{ type: 'heal', target: 'self', pct: v / 100, kind: 'guardHeal', quiet: 1 }] }] }));
PV('cr.endure', () => ENDURE12());
PV('cr.deathWard', v => DEF.passives['fx.deathWard'].make(v));
PV('cr.mpGuard', v => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { guarding: 1, ownerAlive: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', pct: v / 100, min: 1, why: 'mpGuard' }] }] }));
PV('cr.siphon', v => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { tag: 'basic' }, limit: { perAction: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', amount: Math.round(v), why: 'siphon' }] }] }));
PV('cr.freecast', v => FREECAST(v / 100));
PV('cr.shadowStep', v => DEF.passives['fx.shadowStep'].make(v));
PV('cr.fervor', v => ({ triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, limit: { perBattle: v }, effects: [{ type: 'stage', target: 'self', stats: { atk: 1 }, cond: { cat: '物' } }, { type: 'stage', target: 'self', stats: { spa: 1 }, cond: { cat: '特' } }] }] }));
PV('cr.spellblade', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: { f: 'spellblade', v: v / 100 }, cond: { hasPower: 1 } }] }));
PV('cr.brokenDmg', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1 + v / 100, cond: { hasPower: 1, tgtStatus: 'broken' } }] }));
PV('cr.fireRes', v => ({ mods: [{ stage: 'defender', who: 'defender', mul: 1 - v / 100, cond: { element: '火' } }] }));
COND.evStatus11 = (c, v) => !!(c.ev && c.ev.payload && c.ev.payload.status === v);
PV('cr.psnRes', v => ({ triggers: [{ on: EVT.STATUS_APPLY, phase: 'PRE', role: 'tgt', cond: { evStatus11: 'psn' }, chance: Math.min(90, v) / 100, effects: [{ type: 'cancel', why: 'will' }, { type: 'message', key: 'status_resist', target: 'self' }] }] }));
const CRY_PAS11 = new Set(['double', 'thorns', 'regen', 'defDown', 'pierce', 'back', 'first', 'initiative', 'firstEva', 'guardHeal', 'endure', 'deathWard', 'mpGuard', 'siphon', 'freecast', 'shadowStep', 'fervor', 'spellblade', 'brokenDmg', 'fireRes', 'psnRes']);
// every socketed crystal of the equipped gear: stats into heroStats, the rest as passives (BB.heroSpec), gold / materials after the battle
function cryActive11(st = Game.st) { const O = st && st.cry11 || {}, out = []; if (!st) return out;
  for (const g of equippedGear(st)) for (const sp of (g.cr11 || []).slice(0, crySlots11(g))) if (O[sp] && CRY11[sp] && cryFits11(sp, g)) out.push([sp, O[sp]]); return out; }
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (!st || !st.cry11) return s; const P = [], add = {};
    for (const [sp, star] of cryActive11(st)) for (const e of CRY11[sp][2]) { const v = cryVal11(e, star), k = e[0];
      if (CRY_STAT11[k] || k === 'all') { const L = k === 'all' ? ['atk', 'def', 'spa', 'spd', 'spe', 'hp'] : [k]; for (const q of L) add[q] = (add[q] || 0) + v; }
      else if (k === 'crit') s.crit = (s.crit ?? 6) + v; else if (k === 'eva') s.eva = (s.eva || 0) + v;
      else if (k === 'typeUp') { const T = s.typeUp || (s.typeUp = {}); T[e[2]] = (T[e[2]] || 0) + v; }
      else if (k === 'elemRes') s.elemRes = (s.elemRes || 0) + v;
      else P.push([k, v]); }
    for (const q in add) if (typeof s[q] === 'number') s[q] = Math.max(1, Math.round(s[q] * (1 + add[q] / 100)));
    s.cr11P = P; return s; }; }
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg), S = heroStats(st);
    for (const [k, v] of S.cr11P || []) if (CRY_PAS11.has(k) && DEF.passives['cr.' + k]) s.passives.push({ key: 'cr.' + k, v, src: 'crystal' });
    return s; }; }

/* ---------- 掉落：第一次打倒給晶石，不再給招牌設計圖 ---------- */
{ const _ld = lootDrops; lootDrops = function (b) { const r = _ld(b), F = b.F || {}; return (F.elite || F.boss) && PARTS11[F.sp] ? [] : r; }; }
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () {
    const st = Game.st, F = this.mainView(), money0 = st.money, P = (heroStats(st).cr11P || []), gold = P.filter(p => p[0] === 'gold').reduce((a, p) => a + p[1], 0), matUp = P.filter(p => p[0] === 'matUp').reduce((a, p) => a + p[1], 0);
    const r = yield* _v.call(this);
    if (gold > 0) { const extra = Math.floor(Math.max(0, st.money - money0) * gold / 100); if (extra > 0) { st.money += extra; yield* this.msg('（晶石）多拿到了 ' + extra + ' G！', { hold: 20 }); } }
    // matUp（素材點數 +%）：見 r9w 的戰鬥後點數
    if (F && F.u && F.u.down && (F.elite || F.boss) && CRY11[F.sp] && !cryOwn11(st)[F.sp] && chance(cryChance12(F)) && cryGive11(F.sp, st)) { Sound.jingle('item'); this.focus = F;
      yield* this.msg('得到了「' + cryName11(F.sp) + '」！', { wait: true });
      if (!st.flags.tutCry11) { st.flags.tutCry11 = 1; yield* this.msg('（晶石可以在鐵匠那裡鑲進裝備：紫・紅色裝備有 1 個孔，金色以上有 2 個孔。再戰拿到的部位可以把晶石升級。）', { wait: true }); } }
    return r; }; }
// 舊存檔：打倒過的菁英・頭目，晶石直接送到手上
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st;
    if (st && !st.cry11v) { st.cry11v = 1; let n = 0; for (const sp in CRY11) if (((st.dex || {})[sp] || {}).won > 0 && cryGive11(sp, st)) n++; if (n) Game.cryMsg11 = n; }
    if (Game.cryMsg11 && !this.script && Game.scene === this && !UI.stack.length) { const n = Game.cryMsg11; Game.cryMsg11 = 0;
      this.run(sayAll(['（裝備系統改版：菁英・頭目改成掉「晶石」，招牌裝備的設計圖不再掉了。）', '（你之前打倒過的 ' + n + ' 隻菁英・頭目，牠們的晶石都送到你手上了。到鐵匠那裡就能鑲進裝備。）'])); }
    return _u.apply(this, a); }; }

/* ---------- 遭遇卡・圖鑑 ---------- */
{ const _lh = lootHint; lootHint = function (key, sp) { if (!PARTS11[sp] || !CRY11[sp]) return _lh(key, sp);
    return !cryOwn11()[sp] ? '部位・機率掉「' + cryName11(sp) + '」' : '部位、經驗、金錢'; }; }

/* ---------- 裝備資訊：孔和晶石 ---------- */
function cryLines11(g) { const L = [], n = crySlots11(g); if (!n) return L; const O = cryOwn11();
  const C = (g.cr11 || []).filter(sp => O[sp] && CRY11[sp]).slice(0, n);
  for (const sp of C) L.push(['◆' + cryName11(sp) + '★' + O[sp] + '：' + cryText11(sp, O[sp]), '#9ad8ff']);
  if (C.length < n) L.push(['◇ 空的晶石孔 ×' + (n - C.length), UIC.muted]); return L; }
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) { const L = _gi(g, wrapW); return L.concat(cryLines11(g)); }; }

/* ---------- 鐵匠：晶石 ---------- */
const cryCost11 = (sp, star) => { const t = cryTier11(sp); return star === 1 ? { mats: { ['pt_' + sp]: 3 }, gold: 200 * t } : { mats: { ['pt_' + sp]: 5, ['pr_' + sp]: 1 }, gold: 600 * t }; };
const cryCan11 = (c, st = Game.st) => st.money >= c.gold && Object.entries(c.mats).every(([k, n]) => (st.bag[k] || 0) >= n);
const cryCostText11 = c => Object.entries(c.mats).map(([k, n]) => ITEMS[k].n + '×' + n + '（有' + (Game.st.bag[k] || 0) + '）').join('、') + '、' + c.gold + ' G';
const cryNext11 = sp => { const L = CRY_SER11[CRY11[sp][1]]; if (!L) return null; const i = L.indexOf(sp); return i >= 0 && i < L.length - 1 ? L[i + 1] : null; };
const cryPrev11 = sp => { const L = CRY_SER11[CRY11[sp][1]]; if (!L) return null; const i = L.indexOf(sp); return i > 0 ? L[i - 1] : null; };
function cryList11(st = Game.st) { const O = cryOwn11(st), ord = Object.keys(CRY11); return Object.keys(O).filter(sp => CRY11[sp] && O[sp]).sort((a, b) => ord.indexOf(a) - ord.indexOf(b)); }
function cryInfo11(sp) { const st = Game.st, star = cryOwn11()[sp], g = cryHost11(sp), L = [];
  L.push([cryName11(sp) + '　★' + star + '　' + CRY_T11[CRY11[sp][0]] + '用・' + CRY11[sp][1] + (CRY11[sp][1] === '單顆' ? '' : '系'), UIC.accent]);
  L.push([cryText11(sp, star), UIC.text]);
  if (star < 3) L.push(['升級到 ★' + (star + 1) + '：' + cryText11(sp, star + 1), UIC.muted]);
  L.push([g ? '鑲在：' + gearName(g) : '還沒有鑲', g ? UIC.good : UIC.muted]);
  const nx = cryNext11(sp); if (nx) L.push(['同系列下一顆：' + cryName11(nx), UIC.muted]);
  return L; }
function* cryPicker11(title, getList) {
  let idx = 0; const VIS = 8;
  const scr = { draw(x) { screenBG(x); headerBar(x, title); Font.drawR(x, Game.st.money + ' G', W - 6, 3, UIC.warm, UIC.textSh, 10); const L = getList(), O = cryOwn11();
    if (typeof touchRegion === 'function') touchRegion(0, 0, W, H, () => {});
    drawWin(x, 4, 22, 168, VIS * 16 + 8, 'menu'); if (!L.length) Font.draw(x, '（沒有可以選的晶石）', 14, 28, UIC.muted, UIC.textSh, 10);
    const top = Math.max(0, Math.min(idx - 3, L.length - VIS)); L.slice(top, top + VIS).forEach((sp, i) => { const Y = 26 + i * 16; if (top + i === idx) selBar(x, 6, Y - 1, 164, 15);
      let z = 10; const nm = cryName11(sp) + ' ★' + O[sp]; while (z > 8 && Font.width(nm, z) > 110) z--; Font.draw(x, nm, 12, Y - 1, cryHost11(sp) ? '#9ad8ff' : UIC.text, UIC.textSh, z);
      Font.drawR(x, CRY_T11[CRY11[sp][0]], 166, Y, UIC.muted, UIC.textSh, 8);
      if (typeof touchRegion === 'function') touchRegion(6, Y - 1, 164, 15, () => { if (idx === top + i) tapKey('a'); else { idx = top + i; Sound.sfx('cursor'); } }); });
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (top + VIS < L.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 16 + 3);
    const Y0 = 22 + VIS * 16 + 12; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu'); const sp = L[idx]; if (!sp) return; let y = Y0 + 4;
    for (const [t, c] of cryInfo11(sp)) for (const l of Font.wrap(t, 152, 9)) { if (y > 244) break; Font.draw(x, l, 10, y, c, UIC.textSh, 9); y += 11; } } };
  UI.push(scr); let res = null;
  while (true) { const L = getList(); if (idx >= L.length) idx = Math.max(0, L.length - 1);
    if (Input.repeat('up') && idx > 0) { idx--; Sound.sfx('cursor'); } if (Input.repeat('down') && idx < L.length - 1) { idx++; Sound.sfx('cursor'); }
    if (Input.pressed('a') && L[idx]) { Input.consume('a'); Sound.sfx('select'); res = L[idx]; break; } if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr); return res; }
function* cryMenu11() {
  const st = Game.st;
  if (!cryList11(st).length) { yield* say('還沒有晶石。\n打倒菁英魔物或頭目，有機率得到牠的晶石（破防越多越容易）。'); return; }
  while (true) {
    const r = yield* ask('晶石要怎麼處理？', ['鑲嵌', '取出', '升級', '合成', '返回']); if (r < 0 || r === 4) return;
    if (r === 0) { const sp = yield* cryPicker11('鑲嵌：選晶石', () => cryList11(st)); if (!sp) continue;
      const g = yield* gearPicker('鑲進哪一件？', () => gearSort().filter(q => cryFits11(sp, q) && crySlots11(q) > 0), (x, q, Y) => { const n = crySlots11(q), C = (q.cr11 || []).filter(s => cryOwn11()[s]).slice(0, n); Font.draw(x, '晶石孔 ' + C.length + '/' + n + (C.length ? '：' + C.map(cryName11).join('、') : ''), 12, Y, UIC.accent, UIC.textSh, 9); });
      if (!g) continue; const n = crySlots11(g), cur = (g.cr11 || []).filter(s => cryOwn11()[s] && s !== sp).slice(0, n);
      let out = null; if (cur.length >= n) { const r2 = yield* ask('孔已經滿了。要換下哪一顆？', cur.map(cryName11).concat(['取消'])); if (r2 < 0 || r2 >= cur.length) continue; out = cur[r2]; }
      cryUnsocket11(sp, st); g.cr11 = cur.filter(s => s !== out).concat([sp]); Sound.sfx('item');
      yield* say('把「' + cryName11(sp) + '」鑲進了「' + GEAR[g.b].n + '」！' + (out ? '\n（「' + cryName11(out) + '」取了下來。）' : '')); continue; }
    if (r === 1) { const sp = yield* cryPicker11('取出：選晶石', () => cryList11(st).filter(s => cryHost11(s, st))); if (!sp) continue; const g = cryHost11(sp, st); cryUnsocket11(sp, st); Sound.sfx('select'); yield* say('從「' + GEAR[g.b].n + '」取下了「' + cryName11(sp) + '」。'); continue; }
    if (r === 2) { const sp = yield* cryPicker11('升級：選晶石', () => cryList11(st).filter(s => cryOwn11(st)[s] < 3)); if (!sp) continue; const star = cryOwn11(st)[sp], c = cryCost11(sp, star);
      const a = yield* ask('「' + cryName11(sp) + '」★' + star + '→★' + (star + 1) + '\n需要：' + cryCostText11(c), ['升級', '取消']); if (a !== 0) continue;
      if (!cryCan11(c, st)) { Sound.sfx('bump'); yield* say('部位或金錢不夠喔。\n部位要再戰' + SPECIES[sp].n + '拿。'); continue; }
      st.money -= c.gold; for (const k in c.mats) st.bag[k] -= c.mats[k]; cryOwn11(st)[sp] = star + 1; Sound.jingle('levelup'); yield* say('「' + cryName11(sp) + '」升到了 ★' + (star + 1) + '！\n' + cryText11(sp, star + 1)); continue; }
    if (r === 3) { const O = cryOwn11(st), L = cryList11(st).filter(s => O[s] === 3 && cryNext11(s) && O[cryNext11(s)] && O[cryNext11(s)] < 2);
      if (!L.length) { yield* say('合成：同一系列的上一顆練到 ★3，再加上已經拿到的下一顆，下一顆就能直接變成 ★2。\n現在沒有可以合成的晶石。'); continue; }
      const sp = yield* cryPicker11('合成：選 ★3 的晶石', () => L); if (!sp) continue; const nx = cryNext11(sp);
      const a = yield* ask('用掉「' + cryName11(sp) + '」★3，讓「' + cryName11(nx) + '」變成 ★2？', ['合成', '取消']); if (a !== 0) continue;
      cryUnsocket11(sp, st); delete O[sp]; O[nx] = 2; Sound.jingle('levelup'); yield* say('「' + cryName11(nx) + '」變成了 ★2！'); continue; }
  } }
smithMenu = function* (f) {
  while (true) { const r = yield* ask('要做什麼？', ['打造', '強化' + (f && f.smithDisc ? '（強化半價）' : ''), '晶石', '離開']);
    if (r === 0) { const r2 = yield* ask('打造', ['打造裝備', '分解', '返回']); if (r2 === 0) yield* craftScreen(); else if (r2 === 1) yield* salvageFlow(); }
    else if (r === 1) yield* smithUpgrade12(); else if (r === 2) yield* cryMenu11(); else break; } };

/* ---------- 回憶石碑：難度分級 ---------- */
const DIFF11 = [
  { n: '普通', hp: 1, pow: 1, exp: 1, parts: 1, rare: 1, brk: 0, gap: 0 },
  { n: '困難', hp: 1.5, pow: 1.15, exp: 1.5, parts: 1.5, rare: 1, brk: 0, gap: 0 },
  { n: '惡夢', hp: 2.2, pow: 1.3, exp: 2, parts: 1.5, rare: 2, brk: 1, gap: 1 },
  { n: '極限', hp: 3, pow: 1.5, exp: 3, parts: 2, rare: 99, brk: 2, gap: 1 }];
const diffTxt11 = d => ({ 0: '現在的強度', 1: 'HP ×1.5・攻擊 ×1.15・經驗和部位 ×1.5', 2: 'HP ×2.2・攻擊 ×1.3・護盾量 +25%、蓄力更頻繁・經驗 ×2・稀有部位機率 ×2', 3: 'HP ×3・攻擊 ×1.5・護盾量 +50%、蓄力更頻繁・經驗 ×3・部位 ×2、稀有部位必掉' })[d];
Overworld.prototype.steleTalk = function* (s) {
  const bd = s.stele, sp = bd.sp, st = this.st, lv = (bd.lv || MAPS[this.map.id].boss && MAPS[this.map.id].boss.lv || 15) + 3, D = st.diff11 || (st.diff11 = {});
  yield* say('刻著' + SPECIES[sp].n + '身影的「回憶石碑」。\n手放上去，就能再次和牠交手。');
  const open = Math.min(DIFF11.length, Math.max(1, D[sp] || 0) + 1); let d = 0;
  if (open > 1) { const r = yield* ask('要用哪個難度？', DIFF11.slice(0, open).map(x => x.n).concat(['取消'])); if (r < 0 || r >= open) return; d = r; if (d) yield* say('「' + DIFF11[d].n + '」：' + diffTxt11(d)); }
  if (!(yield* askFight(sp, lv + ngOf() * NG_LV, sp, 'boss', d ? DIFF11[d].n + '再戰' : '再戰'))) return;
  const res = yield* this.battleScript({ sp, lv, kind: 'boss', id: sp, rematch: true, bg: bd.bg, diff11: d });
  if (res === 'win') { if (d + 1 > (D[sp] || 0)) { D[sp] = d + 1; if (d + 1 < DIFF11.length) yield* say('（' + SPECIES[sp].n + '的「' + DIFF11[d + 1].n + '」難度開放了！）'); } yield* say('石碑的光芒暫時黯淡了下來。'); }
};
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o), d = core && core.cfg && core.cfg.diff11;
    if (!s || !d || kind !== 'boss' || side !== 'B' || idx !== 1) return s; const X = DIFF11[d];
    s.stats.hp = Math.max(1, Math.round(s.stats.hp * X.hp)); s.hp = s.stats.hp; for (const k of ['atk', 'spa']) s.stats[k] = Math.max(1, Math.round(s.stats[k] * X.pow));
    if (s.brkMax) s.brkMax += X.brk; s.data.bGap11 = HUNT11.bGap - X.gap; s.data.diff11 = d; return s; }; }
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { const d = this.cfg && this.cfg.diff11; if (d) a = Math.max(1, Math.round(a * DIFF11[d].exp)); return yield* _ge.call(this, a); }; }

/* ---------- 冒險手冊 ---------- */
if (typeof GROW12 !== 'undefined') { GROW12.push(['晶石', '第一次打倒菁英・頭目會得到牠的晶石。到鐵匠的「晶石」鑲進裝備的孔（紫・紅色 1 個孔、金色以上 2 個孔），隨時可以取出。再戰拿到的部位可以把晶石升到 ★3；同一系列的上一顆 ★3 可以和下一顆合成。']);
  GROW12.push(['回憶石碑', '打倒過的頭目可以在回憶石碑再戰，還能選難度：困難、惡夢、極限。越難經驗和部位越多，打贏一級開下一級。']); }
