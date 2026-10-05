/* ===================== v12.0.9u 第十一輪企劃・第一階段：部位素材與魔物機制（〈曙光冒險 第十一輪企劃：狩獵與打造體系重製〉，玩家 2026-10-04 全部照建議、部位名稱照清單定案） =====================
   1. 部位素材：48 種菁英・洞窟之主・頭目各有一般部位和稀有部位（96 個名字照「部位名稱清單」）。
      菁英：部位 ×2（必掉）＋稀有 25%＋破防成功 +1；頭目：部位 ×3＋稀有 15%＋每次破防 +1，後半戰破防再給 1 個稀有部位。再戰也照樣掉。
      招牌裝備的配方加上牠的部位（菁英 ×2、頭目 ×3）；稀有部位放進打造裡，品質抽兩次取好的。
   2. 破防回來了：菁英 3 格、頭目 5 格護盾，打中弱點、打出會心各削 1 格（每次行動各最多 1 格）。
      削光就破防：下一次行動被跳過、受到的傷害 +50%，蓄力會被打斷。
   3. 蓄力大招：每隻菁英至少一招（沒有的話，最強的招式改成蓄力版），大約每 4 回合一次；沒防禦會被打掉 60〜80% HP。
      防禦對菁英・頭目的蓄力大招減少七成傷害（一般攻擊照舊減半）。
   4. 頭目後半戰：HP 一半以下弱點改變，還多一招蓄力大招。人類的菁英・頭目也有了弱點。
   5. 弱點要打過一次才知道：戰鬥結束後（或打中弱點的當下）記進圖鑑，遭遇卡・圖鑑・戰鬥中才會顯示。
   6. 頭目的回憶石碑隨時可以再戰（第 6 題「隨時」）。 */

/* ---------- 1. 部位素材 ---------- */
const PARTS11 = {
  millGolem: ['磨石碎塊', '磨石核心'], wolf: ['狂狼牙', '狼王鬃毛'], rockPangolin: ['岩鱗片', '岩鱗大甲'], blackCatfish: ['大鯰黏皮', '大鯰長鬚'],
  glowToad: ['螢光蘑菇', '螢光囊'], flower: ['魔花棘刺', '魔花花蕊'], crystalCrayfish: ['水晶甲殼', '水晶大螯'], croc: ['鱷魚背甲', '鱷魚利齒'],
  mossGiant: ['苔石塊', '巨人苔心'], bandit: ['盜賊臂章', '盜賊碎刃'], rockRhino: ['犀牛硬皮', '岩犀之角'], rootSpider: ['根蛛絲', '根蛛毒牙'],
  banditBoss: ['鐵斧碎片', '頭目徽記'], duneWorm: ['沙蟲殼', '沙蟲巨牙'], sandGargoyle: ['砂岩翼片', '石像鬼之眼'], golem: ['古岩碎片', '魔像紅核'],
  lizardChief: ['蜥人硬鱗', '隊長冠羽'], crystalGolem: ['稜鏡水晶', '魔像晶核'], rogueBlade: ['魔劍碎片', '魔劍士劍穗'], silverWyrm: ['銀龍鱗', '水龍逆鱗'],
  stagLord: ['鹿王毛皮', '鹿王巨角'], moonJelly: ['月光凝膠', '月光觸鬚'], bogWitch: ['魔女藥瓶', '魔女咒符'], rockBeetle: ['岩甲蟲背殼', '岩甲蟲大角'],
  boneKnight: ['騎士遺骨', '不朽紋章'], hydra: ['九頭蛇鱗', '九頭蛇毒囊'], wraithGeneral: ['戰將鎧片', '亡靈戰旗'], mireEel: ['泥鰻黏皮', '泥鰻電囊'],
  blackFeather: ['黑羽飾羽', '黑羽令牌'], runeGolem: ['符文石板', '符文核心'], ramGhost: ['幽魂羊角', '壕道魂火'], ratKing: ['鼠王毛皮', '鼠王金牙'],
  boarKing: ['野豬王鬃毛', '野豬王巨牙'], hideoutBear: ['洞熊毛皮', '洞熊利爪'], harvestGolem: ['魔像麥稈', '收穫鐮刃'], termiteQueen: ['白蟻硬殼', '蟻后翅膜'],
  clockKnight: ['騎士齒輪', '主發條'], clockColossus: ['巨像齒輪', '巨像擺錘'], snowBear: ['巨熊毛皮', '巨熊冰爪'], frostLich: ['巫妖遺骨', '巫妖魂晶'],
  iceMammoth: ['長毛象毛皮', '冰牙象牙'], frostQueen: ['霜后冰紗', '永凍冰晶'], youngDragon: ['幼龍火鱗', '幼龍火囊'], magmaNewt: ['蠑螈岩皮', '黑曜石尾'],
  lavaGiant: ['熔岩甲片', '巨人熔核'], duskCaptain: ['黯滅鎧片', '黑騎士紋章'], victorDemon: ['魔人碎角', '宰相魔印'], shadowGeneral: ['影將鎧片', '莫爾德影刃'],
};
const PART_OF11 = {}, PART_LV11 = {}, PART_BOSS11 = {}, ID2SP11 = {}, PART_MAPS11 = {};
const PART_N11 = { elite: 2, boss: 3 }, PART_RARE11 = { elite: 0.25, boss: 0.15 };
{ const mapN = m => (MAPS[m] && MAPS[m].name || m).replace(/ ?\d+F$/, ''), note = (sp, lv, boss, m) => { if (!PARTS11[sp]) return; PART_LV11[sp] = Math.min(PART_LV11[sp] ?? 99, lv || 99); if (boss) PART_BOSS11[sp] = 1; const L = PART_MAPS11[sp] || (PART_MAPS11[sp] = []); if (!L.includes(mapN(m))) L.push(mapN(m)); };
  for (const m in MAPS) { if (m === 'rift' || m === 'starShrine') continue; const M = MAPS[m];
    for (const e of M.elites || []) { if (e.id) ID2SP11[e.id] = e.sp; note(e.sp, e.lv, 0, m); }
    if (M.boss) { ID2SP11[M.boss.flag || M.boss.sp] = M.boss.sp; ID2SP11[M.boss.sp] = M.boss.sp; note(M.boss.sp, M.boss.lv, 1, m); } } }
for (const sp in PARTS11) { const S = SPECIES[sp]; if (!S) { bvErr('v12.9u', 'parts for ' + sp); continue; } const [a, b] = PARTS11[sp], lv = PART_LV11[sp] || 10;
  ITEMS['pt_' + sp] = { n: a, mat: 1, price: 0, sell: 20 + lv * 6, cat: '魔物素材', part11: sp, d: S.n + '身上取下的部位素材。把牠的晶石升級要用（鐵匠→晶石）。' };
  ITEMS['pr_' + sp] = { n: b, mat: 1, price: 0, sell: 60 + lv * 20, cat: '魔物素材', part11: sp, rare11: 1, d: S.n + '身上很少拿到的稀有部位。把牠的晶石升到 ★3 要用。' };
  PART_OF11['pt_' + sp] = { sp, rare: 0 }; PART_OF11['pr_' + sp] = { sp, rare: 1 }; }
if (BV2.DEV) { const seen = {}; for (const k in ITEMS) { const n = ITEMS[k].n; if (seen[n] && (PART_OF11[k] || PART_OF11[seen[n]])) bvErr('v12.9u', 'item name twice: ' + n); seen[n] = k; } }

// 招牌裝備的配方加上部位（菁英 ×2、頭目 ×3）；只有菁英掉、野外拿不到的舊素材（龍鱗）從配方拿掉
const SIGPART11 = {};
{ const wildSrc = new Set(); for (const m in MAPS) { if (m === 'rift' || m === 'starShrine') continue; const d = MAPS[m];
    for (const e of d.encounters || []) for (const r of e.table || []) { const S = SPECIES[r[0]]; if (S && S.mat) wildSrc.add(S.mat); } for (const g of d.gathers || []) if (g.mat) wildSrc.add(g.mat); }
  const swaps = k => [k, typeof MAGE_SWAP !== 'undefined' && MAGE_SWAP[k]].filter(x => x && GEAR[x] && GEAR_RECIPE[x]);
  const add = (k, sp) => { for (const kk of swaps(k)) { if (SIGPART11[kk]) continue; const M = GEAR_RECIPE[kk].mats; SIGPART11[kk] = sp;
      for (const i in M) if (!wildSrc.has(i) && !PART_OF11[i] && !['riftShard', 'starShard', 'starDust'].includes(i)) delete M[i];
      M['pt_' + sp] = PART_BOSS11[sp] ? PART_N11.boss : PART_N11.elite; } };
  for (const id in SIG10) { const sp = ID2SP11[id] || (/_lord$/.test(id) ? null : id); if (sp && PARTS11[sp]) add(SIG10[id].k, sp); }
  if (typeof LORD_GEAR12 !== 'undefined') for (const sp in LORD_GEAR12) if (PARTS11[sp]) add(LORD_GEAR12[sp][0], sp); }

// 素材來源：菁英・頭目不再掉一般素材（改掉部位），來源提示重新整理
{ const CLOSED = ['rift', 'starShrine'], mapN = m => (MAPS[m] && MAPS[m].name || m).replace(/ \d+F$/, '');
  for (const k in MAT_SRC) delete MAT_SRC[k];
  const add = (k, t) => { (MAT_SRC[k] = MAT_SRC[k] || []).includes(t) || MAT_SRC[k].push(t); };
  for (const m in MAPS) { if (CLOSED.includes(m)) continue; const d = MAPS[m];
    for (const e of d.encounters || []) for (const r of e.table || []) { const S = SPECIES[r[0]]; if (S && S.mat) add(S.mat, S.n + '・' + mapN(m)); }
    for (const e of (d.elites || []).concat(d.boss ? [d.boss] : [])) { const S = SPECIES[e.sp]; if (S && S.mat && !PARTS11[e.sp]) add(S.mat, S.n + '・' + mapN(m)); }
    for (const g of d.gathers || []) if (g.mat) add(g.mat, '採集・' + mapN(m)); }
  for (const k in PART_OF11) { const { sp, rare } = PART_OF11[k]; add(k, SPECIES[sp].n + (rare ? '（稀有）' : '') + '・' + (PART_MAPS11[sp] || [''])[0]); } }
matSrc = function (k) { const P = PART_OF11[k]; if (P) return SPECIES[P.sp].n + (P.rare ? '・稀有' : '');
  for (const s in SPECIES) if (SPECIES[s].mat === k && !PARTS11[s]) { const m = typeof spawnMaps === 'function' ? spawnMaps(s) : []; if (m.length) return SPECIES[s].n; }
  const B = FOE_SPOTS.find(e => BOSS_MAT[e.sp] === k && !PARTS11[e.sp]); return B ? SPECIES[B.sp].n : ''; };

// 掉落：部位（必掉）＋稀有部位（機率）＋破防加成。舊的「招牌素材＋當地素材」只留給沒有部位的菁英（巡遊・懸賞）
function* huntDrops11(F) {
  const st = Game.st, sp = F.sp, boss = !!F.boss, d = (F.u && F.u.data) || {}, got = {}, add = (k, n) => { if (n > 0 && ITEMS[k]) { got[k] = (got[k] || 0) + n; st.bag[k] = (st.bag[k] || 0) + n; } };
  const brk = d.brkN11 || 0, bonus = boss ? brk : brk > 0 ? 1 : 0;
  const X = (typeof DIFF11 !== 'undefined' && DIFF11[(this.cfg || {}).diff11 || 0]) || { parts: 1, rare: 1 }; // 回憶石碑的難度（r9v）
  add('pt_' + sp, Math.round((boss ? PART_N11.boss : PART_N11.elite) * X.parts) + bonus);
  add('pr_' + sp, (chance(Math.min(1, (boss ? PART_RARE11.boss : PART_RARE11.elite) * X.rare)) ? 1 : 0) + (boss && d.brkP2_11 ? 1 : 0));
  Sound.sfx('item'); yield* this.msg((boss ? '頭目' : '菁英') + '留下了部位：' + matsText(got) + '！', { hold: 36 });
  if (bonus) yield* this.msg('（破防' + (boss && brk > 1 ? brk + ' 次' : '成功') + '，多拿到了 ' + bonus + ' 個部位' + (boss && d.brkP2_11 ? '，後半戰的破防還多給了稀有部位' : '') + '！）', { hold: 30 });
  if (!st.flags.tutPartMat11) { st.flags.tutPartMat11 = 1; yield* this.msg('（部位素材可以把這隻魔物的晶石升級。破防越多，拿到的部位越多；再戰也會掉。）', { wait: true }); }
}
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () {
    const F = this.mainView(), c = this.cfg || {}, P = F && F.u && F.u.down && PARTS11[F.sp] && (F.elite || F.boss), had = c.noMats;
    if (P) c.noMats = 1; let r; try { r = yield* _v.call(this); } finally { if (P) c.noMats = had; }
    if (P) { this.focus = F; yield* huntDrops11.call(this, F); this.focus = this.mainView(); }
    return r; }; }

// 稀有部位放進打造：品質抽兩次，取比較好的那個
{ const _ff = forgeFlow; forgeFlow = function* (k) {
    const st = Game.st, R = GEAR_RECIPE[k], pk = R && Object.keys(R.mats).find(m => PART_OF11[m] && !PART_OF11[m].rare), rk = pk && 'pr_' + PART_OF11[pk].sp;
    if (!rk || !((st.bag[rk] || 0) > 0) || tkCount(k, st) || !bpCan(k, 0, st)) return yield* _ff(k);
    const a = yield* ask('要放入稀有部位「' + ITEMS[rk].n + '」嗎？（有' + st.bag[rk] + '個）\n品質會抽兩次，取比較好的那個。', ['放入', '不放']); if (a !== 0) return yield* _ff(k);
    const _br = bpRoll; let used = false; bpRoll = function (lv) { used = true; return Math.max(_br(lv), _br(lv)); };
    try { yield* _ff(k); } finally { bpRoll = _br; } if (used) st.bag[rk] = Math.max(0, (st.bag[rk] || 0) - 1); }; }

/* ---------- 2. 破防 ---------- */
DEF.resources.brk.appliesTo = (u, s) => !u.hero && (s.brkMax || 0) > 0;
BR.FORMULA.brokenMul = () => 1.5;
EFFECT_TYPES.hunt_chip = { exec(core, ef, ctx, tg) {
  for (const t of tg) { if (!t || !core.isUp(t) || !('brk' in t.res) || !t.max.brk || core.hasStatus(t, 'broken') || t.res.brk <= 0) continue;
    core.changeRes(t, 'brk', -(ef.n || 1), { src: ctx.owner, why: ef.why || 'chip' });
    if (t.res.brk <= 0 && core.isUp(t)) core.emit(EVT.BREAK, { src: ctx.owner, tgts: [t], tags: ['break'] }, () => {
      t.data.brkN11 = (t.data.brkN11 || 0) + 1; if (t.data.hunt2) t.data.brkP2_11 = 1;
      core.applyStatus(ctx.owner, t, 'broken', {}); core.removeStatus(t, 'charging', 'break'); core.removeStatus(t, 'airborne', 'break'); }); } } };
DEF.mechanics.breakGauge.triggers = [
  { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, weakHit: 1, ownerLacksStatus: 'broken' }, limit: { perAction: 1 }, prio: 10, effects: [{ type: 'hunt_chip', target: 'self', n: 1, why: 'weak' }] },
  { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, crit: 1, ownerLacksStatus: 'broken' }, limit: { perAction: 1 }, prio: 10, effects: [{ type: 'hunt_chip', target: 'self', n: 1, why: 'crit' }] }];
const BRK11 = { elite: 3, boss: 5 };
const HUNT11 = { eGap: 3, eChance: 0.6, bGap: 3, bChance: 0.5, hpLo: 0.6, hpHi: 0.8, guard: 0.3 }; // charge rhythm and how hard a charged hit lands

/* ---------- 3. 蓄力大招 ---------- */
// a charged copy of a move (same name): used by elites that have no charged move, and by bosses in the second half
function huntClone11(id) { const cid = 'hc_' + id; if (DEF.skills[cid]) return cid; const M = MOVES[id], S = DEF.skills[id]; if (!M || !S) return null;
  MOVES[cid] = { ...M, charge: 1, chargeMsg: '全身的力量都集中了起來……！', warn: '（下一擊非常危險！選擇「防禦」能擋下七成傷害；打破牠的護盾就能打斷。）', d: (M.d || '') + '（蓄力大招）' };
  const D = defPut('skills', cid, { ...skillFromMove(cid, MOVES[cid], { kind: 'skill', extraTags: ['monster_skill'] }) }); D.cooldown = 0; D.hunt11 = 1; D.fx = S.fx;
  D.effects = D.effects.map((ef, i) => typeof ef === 'string' ? ef : effRegister('skill:' + cid + '#e' + i, ef)); D.after = D.after.map((ef, i) => typeof ef === 'string' ? ef : effRegister('skill:' + cid + '#a' + i, ef));
  if (typeof SKILL_MP !== 'undefined' && SKILL_MP[id] != null) SKILL_MP[cid] = SKILL_MP[id]; return cid; }
const huntPow11 = id => { const S = DEF.skills[id]; return S && S.power && S.target !== 'self' && !S.charge ? S.power * (S.hits ? (S.hits[0] + S.hits[1]) / 2 : 1) : 0; };
const huntBest11 = ids => ids.filter(id => huntPow11(id) > 0).sort((a, b) => huntPow11(b) - huntPow11(a))[0] || null;
// 豐收之刻 answers to evasion, not to 防禦 (its own rule stays)
const HUNT_NOGUARD11 = new Set(['m_harvest']);
{ const P = BattleCore.prototype, _ds = P.doSkill; P.doSkill = function (u, sk, tg, cmd) {
    const prev = this.rel11, rel = !!(cmd && cmd.meta && cmd.meta.release && u && !u.hero && (u.elite || u.boss) && sk);
    this.rel11 = rel ? { u, sk, hp: !!(sk.hunt11 || (u.elite && !u.boss)), noGuard: HUNT_NOGUARD11.has(sk.id) } : null;
    try { return _ds.call(this, u, sk, tg, cmd); } finally { this.rel11 = prev; } }; }
Object.assign(COND, {
  rel11: (c, v) => !!(c.core.rel11 && c.tgt && c.tgt.hero && c.ev && c.ev.payload && c.ev.payload.kind === 'hit') === !!v,
  relHp11: (c, v) => !!(c.core.rel11 && c.core.rel11.hp) === !!v,
  relGuard11: (c, v) => !!(c.core.rel11 && !c.core.rel11.noGuard && c.tgt && c.core.hasStatus(c.tgt, 'guard')) === !!v,
});
EFFECT_TYPES.hunt_hp = { exec(core, ef, ctx) { const e = ctx.pre, R = core.rel11; if (!e || !R) return; const t = ctx.tgt || core.byId[e.tgts[0]]; if (!t) return;
  const hits = R.sk.hits ? (R.sk.hits[0] + R.sk.hits[1]) / 2 : 1; let v = t.max.hp * (HUNT11.hpLo + (HUNT11.hpHi - HUNT11.hpLo) * core.rng.next()) / hits;
  if (!R.noGuard && core.hasStatus(t, 'guard')) v *= HUNT11.guard; if (core.hasStatus(t, 'barrier')) v *= 0.6;
  e.payload.amount = Math.max(1, Math.floor(v)); (e.payload.notes || (e.payload.notes = [])).push('hunt11'); } };
EFFECT_TYPES.hunt_guard = { exec(core, ef, ctx) { const e = ctx.pre; if (!e) return; e.payload.amount = Math.max(1, Math.floor(e.payload.amount * HUNT11.guard / 0.5)); (e.payload.notes || (e.payload.notes = [])).push('guard11'); } }; // 防禦 already halved it
DEF.mechanics.elementReactions.triggers.push(
  { on: EVT.DAMAGE, phase: 'PRE', prio: 25, cond: { rel11: 1, relHp11: 1 }, effects: [{ type: 'hunt_hp' }] },
  { on: EVT.DAMAGE, phase: 'PRE', prio: 25, cond: { rel11: 1, relHp11: 0, relGuard11: 1 }, effects: [{ type: 'hunt_guard' }] });
// AI: elites charge about every 4 rounds; bosses get the second-half move on top of their own rhythm
const huntCharges11 = (core, u) => u.skills.filter(id => DEF.skills[id] && DEF.skills[id].charge && !core.onCooldown(u, id));
{ const _d = BAI.decide; BAI.decide = function (core, u, o = {}) {
    if (!u || u.hero || !(u.elite || u.boss) || core.hasStatus(u, 'charging')) return _d.call(this, core, u, o);
    const hero = core.units.find(q => q.hero && !q.down), gap = core.round - (u.data.lastCharge ?? -9), R = core.rng;
    const go = id => { u.data.lastCharge = core.round; u.data.lastHunt11 = id; return { type: 'skill', skill: id, targets: DEF.skills[id].target === 'self' ? [u.id] : hero ? [hero.id] : [] }; };
    if (u.boss) { const r = _d.call(this, core, u, o), id = u.data.hunt2Skill;
      if (id && DEF.skills[id] && !(r && r.type === 'skill' && DEF.skills[r.skill] && DEF.skills[r.skill].charge) && gap >= (u.data.bGap11 ?? HUNT11.bGap) && R.chance(HUNT11.bChance)) return go(id);
      return r; }
    if (u.data.script) return _d.call(this, core, u, o); // 磨石魔像 keeps its 3-round windmill
    const ch = huntCharges11(core, u); if (!ch.length) return _d.call(this, core, u, o);
    if (core.round >= 2 && gap >= HUNT11.eGap && R.chance(HUNT11.eChance)) return go(ch.length > 1 ? (ch.find(id => id !== u.data.lastHunt11) || ch[0]) : ch[0]);
    const keep = u.skills; u.skills = keep.filter(id => !(DEF.skills[id] && DEF.skills[id].charge)); if (!u.skills.length) u.skills = keep;
    try { return _d.call(this, core, u, o); } finally { u.skills = keep; } }; }
if (DEF.skills.m_millStorm) DEF.skills.m_millStorm.warn = '（⚠ 下一回合選「防禦」，傷害會減少七成！逆轉大風車每 3 回合一次。）';

/* ---------- 4. 弱點（人類也有）・頭目後半戰 ---------- */
const WEAK11 = { // [前半, 後半]
  bandit: [['火']], rogueBlade: [['雷']], bogWitch: [['火']], blackFeather: [['雷']],
  banditBoss: [['雷'], ['火']], duneWorm: [['火'], ['水']], golem: [['草'], ['水']], crystalGolem: [['草'], ['雷']], silverWyrm: [['雷'], ['草']],
  hydra: [['雷'], ['火']], ratKing: [['火'], ['雷']], harvestGolem: [['火'], ['水']], clockColossus: [['水'], ['雷']], frostQueen: [['火'], ['雷']],
  lavaGiant: [['水'], ['草']], victorDemon: [['雷'], ['水']], shadowGeneral: [['火'], ['草']],
};
function weakOf11(sp, p2) { const W = WEAK11[sp]; if (W) return (p2 && W[1]) || W[0]; const f = FAMILIES[(SPECIES[sp] || {}).fam]; return f ? f.weak : []; }
const hasP2_11 = sp => !!(WEAK11[sp] && WEAK11[sp][1]);
famMult = function (el, b) { if (!b || !el || el === '一般') return 1; const f = famOf(b), weak = b.sp ? weakOf11(b.sp, b.data && b.data.hunt2) : (f ? f.weak : []);
  if (weak.includes(el)) return FAM_WEAK; return f && f.resist.includes(el) ? FAM_RESIST : 1; };
// 轉換彈 aims at the weakness the target has right now
{ const D = EFFECT_TYPES.damage.exec; EFFECT_TYPES.damage.exec = function (core, ef, ctx, tg) { if (!ef.elWeak9) return D.call(this, core, ef, ctx, tg);
    for (const t of tg) { const el = t && t.sp ? weakOf11(t.sp, t.data && t.data.hunt2)[0] : null; D.call(this, core, { ...ef, elWeak9: 0, ...(el ? { el } : {}) }, ctx, [t]); } }; }
EFFECT_TYPES.hunt_p2 = { exec(core, ef, ctx) { const u = ctx.owner; if (!u || u.data.hunt2 || !core.isUp(u)) return;
  core.emit(EVT.PHASE, { src: u, tgts: [u], payload: { phase: u.data.phase || 0, key: 'hunt2' } }, () => { u.data.hunt2 = 1;
    const src = huntBest11(u.skills), cid = src && huntClone11(src); if (cid) { u.data.hunt2Skill = cid; const i = u.skills.indexOf(src); if (i >= 0) u.skills[i] = cid; else u.skills.push(cid); } }); } };
defPut('mechanics', 'hunt2', { triggers: [{ on: EVT.ACTION_END, phase: 'POST', cond: { ownerHpBelow: 0.5, ownerAlive: 1, dataNot: ['hunt2', 1] }, prio: 7, effects: [{ type: 'hunt_p2' }] }] });
PHASE_TXT.hunt2 = n => [n + '進入了後半戰！弱點改變了！'].concat(Game.st.flags.tutHunt2 ? [] : (Game.st.flags.tutHunt2 = 1, ['（頭目 HP 剩一半時會換弱點，還會多一招蓄力大招。後半戰打出破防，會多掉稀有部位！）']));

/* ---------- 魔物的戰鬥資料：護盾、蓄力招、後半戰 ---------- */
// bosses were over in 6–10 rounds and barely hurt (sims, Lv16–20 hero with same-tier 紫 gear): HP ×1.3, attack ×1.2; a few early ones evened out
Object.assign(TUNE10.boss, { hp: 1.3, pow: 1.2 });
const BOSS_TUNE11 = { duneWorm: { pow: 0.88 }, silverWyrm: { hp: 1.25, pow: 0.9 }, golem: { hp: 0.88 }, hydra: { pow: 0.85 } };
TUNE10.elite.hp = 2; // elites: about one more round (6–8 when you guard the charges)
const ELITE_TUNE11 = { millGolem: { hp: 0.75 } }; // the first elite (the windmill tutorial) stays short
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s) return s;
    const big = kind === 'elite' || kind === 'boss', mech = s.data.mechanics || (s.data.mechanics = []);
    s.brkMax = big ? BRK11[kind] : 0;
    const T = (kind === 'boss' ? BOSS_TUNE11 : kind === 'elite' ? ELITE_TUNE11 : {})[sp]; if (T) { if (T.hp) { s.stats.hp = Math.max(1, Math.round(s.stats.hp * T.hp)); s.hp = s.stats.hp; } if (T.pow) for (const k of ['atk', 'spa']) s.stats[k] = Math.max(1, Math.round(s.stats[k] * T.pow)); }
    const i = mech.indexOf('breakGauge'); if (s.brkMax && i < 0) mech.push('breakGauge'); else if (!s.brkMax && i >= 0) mech.splice(i, 1);
    if (kind === 'elite' && !s.data.script && !s.skills.some(id => DEF.skills[id] && DEF.skills[id].charge)) { const b = huntBest11(s.skills), cid = b && huntClone11(b); if (cid) s.skills[s.skills.indexOf(b)] = cid; }
    if (kind === 'boss' && !mech.includes('hunt2')) mech.push('hunt2');
    return s; }; }

/* ---------- 5. 弱點要打過一次才知道 ---------- */
const weakKnown11 = (sp, p2) => { const d = (Game.st.dex || {})[sp]; return !!d && (p2 ? !!d.rev2 : !!(d.rev || d.won > 0 || d.fought11)); };
function weakText11(sp, big) { const w1 = weakOf11(sp), p2 = big && hasP2_11(sp), k1 = weakKnown11(sp), k2 = weakKnown11(sp, true);
  let s = w1.length ? '弱：' + (k1 ? w1.join('') : '？') : '沒有明顯弱點'; if (p2) s += '　後半：' + (k2 ? weakOf11(sp, true).join('') : '？'); return s; }
{ const _ap = BB.apply; BB.apply = function (core, st = Game.st) { const r = _ap.call(this, core, st), dx = st.dex || (st.dex = {});
    for (const u of core.units) if (u.side === 'B' && u.sp) { const d = dx[u.sp] || (dx[u.sp] = { seen: 1, won: 0 }); d.fought11 = 1; if (u.data && u.data.hunt2) d.rev2 = 1; }
    return r; }; }
function dexWeak11(sp) { const F = FAMILIES[(SPECIES[sp] || {}).fam] || {}, S = SPECIES[sp] || {}, w = weakText11(sp, !!(S.boss || PART_BOSS11[sp])).replace('沒有明顯弱點', '弱：—');
  const r = (F.resist || []).filter(e => !weakOf11(sp).includes(e)); return w + (r.length ? '　抗：' + r.join('') : ''); }
Battle.prototype.revealed = function (v) { return weakKnown11(v.sp, !!(v.u && v.u.data && v.u.data.hunt2)); };
{ const _pb = Battle.prototype.drawPlateBig; Battle.prototype.drawPlateBig = function (x, F, a0) {
    const f = F && FAMILIES[F.fam]; if (!f || !F.sp) return _pb.call(this, x, F, a0);
    FAMILIES[F.fam] = { ...f, weak: weakOf11(F.sp, F.u && F.u.data && F.u.data.hunt2) }; try { return _pb.call(this, x, F, a0); } finally { FAMILIES[F.fam] = f; } }; }
famText = function (sp) { const F = FAMILIES[SPECIES[sp].fam] || {}, S = SPECIES[sp] || {}, big = !!(S.boss || PART_BOSS11[sp]);
  return weakText11(sp, big) + (F.resist && F.resist.length ? '　抗：' + F.resist.filter(e => !weakOf11(sp).includes(e)).join('') : '') + (F.immune && F.immune.length ? '　免疫' + F.immune.map(q => ({ psn: '毒', par: '麻', slp: '眠', brn: '燒' })[q] || q).join('') : ''); };
// the card lists the charged copy (⚠) the elite really uses, and the boss's second-half move
{ const _fm = foeMoves; foeMoves = function (sp, lv, kind) { const L = _fm(sp, lv, kind); if (kind !== 'elite' && kind !== 'boss') return L;
    if (kind === 'elite' && !L.some(id => MOVES[id] && MOVES[id].charge) && sp !== 'millGolem') { const b = huntBest11(L), cid = b && huntClone11(b); if (cid) L[L.indexOf(b)] = cid; }
    if (kind === 'boss') { const b = huntBest11(L), cid = b && huntClone11(b); if (cid && !L.includes(cid)) L.push(cid); }
    return L; }; }
foeDropLines = function (sp, key, kind) { const L = [], h = typeof lootHint === 'function' ? lootHint(key, sp) : ''; if (h) L.push(h);
  if (PARTS11[sp]) { const boss = kind === 'boss' || !!PART_BOSS11[sp];
    L.push('部位：' + ITEMS['pt_' + sp].n + '×' + (boss ? PART_N11.boss : PART_N11.elite) + '（必掉）' + (boss ? '、每次破防 +1' : '、破防 +1'));
    L.push('稀有：' + ITEMS['pr_' + sp].n + '（' + Math.round((boss ? PART_RARE11.boss : PART_RARE11.elite) * 100) + '%' + (boss ? '、後半戰破防必掉' : '') + '）'); }
  else if (BOSS_MAT[sp] && ITEMS[BOSS_MAT[sp]]) L.push('素材：' + ITEMS[BOSS_MAT[sp]].n);
  return L; };
lootHint = function (key, sp) { const first = !((Game.st.kills || {})[key]), sig = sigOf10(key, sp), g = sig && GEAR[/^lg/.test(sig) ? sig : classGear(sig)];
  if (first && g) return '首次擊敗：「' + g.n + '」的設計圖';
  return PARTS11[sp] ? '再戰：部位、經驗、金錢' : '再戰：經驗、金錢' + ((SPECIES[sp] || {}).mat && ITEMS[SPECIES[sp].mat] ? '、' + ITEMS[SPECIES[sp].mat].n : ''); };
// the first charge explains both answers once
{ const H = Battle.prototype.handlers, _c = H.CHARGE; H.CHARGE = function* (e, s, t, P) { yield* _c.call(this, e, s, t, P);
    if (s && !s.hero && (s.elite || s.boss) && !Game.st.flags.tutCharge11) { Game.st.flags.tutCharge11 = 1; yield* this.msg('（蓄力大招：選「防禦」可以擋下七成傷害；也可以在牠出手前打破牠張開的護盾（弱點・會心對護盾加倍），打出「破防」直接打斷。）', { wait: true }); } }; }
{ const H = Battle.prototype.handlers, _b = H.BREAK; H.BREAK = function* (e, s, t, P) { const had = Game.st.flags.tutBreak; Game.st.flags.tutBreak = 1; yield* _b.call(this, e, s, t, P);
    if (!had && t) yield* this.msg('（破防：下一次行動被跳過，受到的傷害 +50%。破防越多，部位掉得越多！）', { wait: true }); }; }

/* ---------- 說明 ---------- */
if (typeof BATTLE_HELP !== 'undefined') {
  const P = BATTLE_HELP.find(q => q[0] === '如何避免'); if (P) { P[1] = P[1].map(t => /^防禦：/.test(t) ? t.replace('傷害減半，', '傷害減半（菁英・頭目的蓄力大招減少七成），') : t);
    if (!P[1].some(t => /^破防：/.test(t))) P[1].splice(1, 0, '破防：菁英 3 格、頭目 5 格護盾，打中弱點或會心各削 1 格。削光就破防：跳過下一次行動、受到的傷害 +50%、打斷蓄力，還會多掉部位。'); }
  const Q = BATTLE_HELP.find(q => q[0] === '魔物變強的時候'); if (Q && !Q[1].some(t => /後半戰/.test(t))) Q[1].splice(1, 0, '頭目的HP剩一半時進入後半戰：弱點改變，還多一招蓄力大招。');
}
