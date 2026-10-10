/* ===================== v12.108 第五章「深潮城」（第三章的最後一段：潮將塔拉薩） =====================
   玩家 2026-10-10：「主線追加第一部第五章，新地圖新BOSS新的菁英追加新裝備」→ 問了之後選「接在打倒歐托之後：深潮城」。
   旗標 ch3m：10 向村長報告完 → 11 村長說深潮城浮上來了（第五章開始）→ 12 搭海鷗號抵達深潮城・外城 → 13 打倒潮騎兵長艾格 → 14 打倒海妖大巫女莫菈
              → 15 打倒潮將塔拉薩、拿回潮汐之珠 → 16 向村長報告（第五章完）。
   地圖：深潮城・外城（Lv57〜59，菁英兩隻）、深潮城・王座（頭目 潮將塔拉薩 Lv62，三階段）。魔物：潮騎兵・海妖巫女・深潮巨鯊（Codex 任務 AL 第 4 批的圖）。
   新裝備：潮將的珍珠冠（頭目）、海馬騎士徽章（艾格）、黑珍珠護符（莫菈）；三隻都有晶石和部位；深潮城也有三種異色魔物和異色飾品。 */
const THAL15 = 'thalassa14', AEG15 = 'tideCaptain15', MORA15 = 'seaWitchQ15';

/* ---------- monsters ---------- */
const DEEP15 = { // key: [name, bases, look, role, fam, moves, material, dex]
  tideLancer14: ['潮騎兵', ['fishman14', 'lizardman'], [0, 1, 1], 'phys', 'aquatic', ['m_spearRush', 'm_spearThrust', 'm_tidalCrush', 'm_scaleGuard'], 'tideScaleM14', '騎著大海馬的魚人騎士。深潮城的巡邏兵，一看到陌生人就挺著長槍衝過來。'],
  seaWitch14: ['海妖巫女', ['bogWitch', 'inkOctopus14'], [0, 1, 1], 'mage', 'spirit', ['m_hex', 'm_waterBomb', 'm_whirlpool', 'm_chillMist'], 'deepPearl14', '戴著水母頭巾的海妖。手上的黑珍珠一亮，四周的海水就會聽她的話。'],
  deepShark14: ['深潮巨鯊', ['anglerfish14', 'sewerCroc'], [0, 1, 1], 'tank', 'aquatic', ['m_bite', 'm_frostFang', 'm_tidalCrush', 'm_rend'], 'tideScaleM14', '用尾巴站著走路的大鯊魚，脖子上套著鐵刺項圈。潮將的看門巨獸。'],
};
for (const k in DEEP15) { const [n, bases, look, role, fam, moves, mat, dex] = DEEP15[k], b = pickBase14(bases), B = SPECIES[b] || {};
  islePut14(k, n, b, look, fam, moves, mat, dex, { exp: Math.round((B.exp || 100) * 1.6), gold: Math.max(20, B.gold || 20) }); if (SPECIES[k]) MON_PANEL[k] = LATE_PANEL13(role, SEA_MUL13 * 1.06); }
if (typeof CHIBI_FLOAT !== 'undefined') CHIBI_FLOAT.add('seaWitch14');

// moves (pictures borrowed from existing moves, like 歐托's)
Object.assign(MOVES, {
  m15_lanceCharge: { n: '怒濤衝鋒', t: '水', cat: '物', pow: 150, acc: 100, pp: 5, foe: 1, cls: 'charge', charge: 1, chargeMsg: '海馬往後一退，長槍對準了你！', warn: '（要衝過來了！防禦！）', d: '蓄力一回合，連人帶海馬衝撞過來。' },
  m15_blackTide: { n: '黑潮詠唱', t: '水', cat: '特', pow: 140, acc: 100, pp: 5, foe: 1, cls: 'charge', charge: 1, chargeMsg: '黑珍珠發出了暗光，四周的海水變成了黑色！', warn: '（黑色的潮水要湧過來了！防禦！）', d: '蓄力一回合，召來黑色的潮水。' },
  m15_trident: { n: '潮將之戟', t: '水', cat: '物', pow: 100, acc: 100, pp: 10, foe: 1, cls: 'pierce', d: '金色三叉戟的一刺，戟尖捲著海流。' },
  m15_tidalWave: { n: '怒海', t: '水', cat: '特', pow: 90, acc: 100, pp: 10, foe: 1, cls: 'area', d: '舉起三叉戟，捲起整片海浪壓下來。' },
  m15_pearlShield: { n: '珍珠之壁', t: '水', cat: '變', pow: 0, acc: null, pp: 5, foe: 1, cls: 'guard', d: '珍珠的光在身邊凝成一層水壁，物防・魔防提升。' },
  m15_maelstrom: { n: '大漩渦', t: '水', cat: '特', pow: 175, acc: 100, pp: 5, foe: 1, cls: 'charge', charge: 1, chargeMsg: '塔拉薩把三叉戟插進地板，整座王座之間的海水開始旋轉！', warn: '（大漩渦要把你捲進去了！防禦！）', d: '蓄力一回合，召來吞沒一切的大漩渦。' },
  m15_callLancer: { n: '召集潮騎兵', t: '一般', cat: '變', pow: 0, acc: null, pp: 5, foe: 1, cls: 'buff', d: '吹響海螺，叫一隻潮騎兵過來。' },
  m15_wrath: { n: '潮將之怒', t: '水', cat: '變', pow: 0, acc: null, pp: 1, foe: 1, cls: 'buff', d: '頭髮化成白色的浪花，物攻・魔攻・速度提升。' },
});
EFFECT_TYPES.callLancer15 = { exec(core, ef, ctx) { const u = ctx.owner; EFFECT_TYPES.summon.exec(core, { sp: 'tideLancer14', count: 1, kind: 'minion', maxSide: 3, lv: Math.max(40, (u.lv || 62) - 4) }, ctx); } };
{ const PIC = { m15_lanceCharge: ['m_spearRush', 'm_tidalSpear'], m15_blackTide: ['m_tidalWave'], m15_trident: ['m_tidalSpear'], m15_tidalWave: ['m_tidalWave'], m15_pearlShield: ['m_iceMirror'],
    m15_maelstrom: ['m_whirlpool', 'm_moonTide'], m15_callLancer: ['m9_call12'], m15_wrath: ['m_roar', 'm9_call12'] };
  for (const id in PIC) { const src = PIC[id].find(s => MFX[s]); if (src) { MFX[id] = MFX[src]; MOVES[id].fx = id; } else bvErr('ch5', 'fx ' + id);
    const d = skillFromMove(id, MOVES[id], { kind: 'skill', extraTags: ['monster_skill'] });
    if (id === 'm15_callLancer') { d.target = 'self'; d.noHitRoll = true; d.effects = [{ type: 'callLancer15', target: 'self' }]; }
    if (id === 'm15_pearlShield') { d.target = 'self'; d.noHitRoll = true; d.effects = [{ type: 'stage', target: 'self', stats: { def: 1, spd: 1 }, dur: 3 }]; }
    if (id === 'm15_wrath') { d.target = 'self'; d.noHitRoll = true; d.effects = [{ type: 'stage', target: 'self', stats: { atk: 1, spa: 1, spe: 1 }, dur: 99 }]; }
    d.cooldown = 0; d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); defPut('skills', id, { ...d, override: true });
    if (MON_CLASS[MOVES[id].cls] && !MON_CLASS[MOVES[id].cls].includes(id)) MON_CLASS[MOVES[id].cls].push(id); } }

// the two elites (recoloured from their soldiers' pictures)
islePut14(AEG15, '潮騎兵長「艾格」', 'tideLancer14', [-150, 1.1, 1.08], 'aquatic', ['m15_lanceCharge', 'm_spearRush', 'm_spearThrust', 'm_tidalCrush', 'm_scaleGuard'], 'tideScaleM14',
  '深潮城城門的守衛隊長。騎著一匹老海馬，五百年來沒有讓任何人走進城門。', { elite: 1, exp: 900, gold: 0 });
islePut14(MORA15, '海妖大巫女「莫菈」', 'seaWitch14', [150, 1.15, 0.85], 'spirit', ['m15_blackTide', 'm_hex', 'm_waterBomb', 'm_whirlpool', 'm6_regen'], 'deepPearl14',
  '服侍潮將的大巫女。深潮城會從海底浮上來，就是她的歌。', { elite: 1, exp: 950, gold: 0 });
{ const base = MON_PANEL.fallenStar || ch2Panel(44, 'phys', 'elite'), mk = mul => { const P = { ...base }; for (const s in mul) if (P[s]) P[s] = Math.round(P[s] * mul[s]); return P; };
  MON_PANEL[AEG15] = mk({ hp: 2.3, atk: 1.5, def: 1.2, spa: 1.0, spe: 1.1 }); MON_PANEL[MORA15] = mk({ hp: 2.0, atk: 0.9, def: 0.9, spa: 1.75, spd: 1.3 }); }
ELITE_TEXT[AEG15] = ['（城門前，一匹老海馬甩了甩鬃毛……）', '潮騎兵長艾格：「曙光的人。這道門，五百年來沒有開過。」'];
ELITE_TEXT[MORA15] = ['（往王座的階梯前，有人在唱歌……）', '海妖大巫女莫菈：「塔拉薩大人在上面等你。……可惜，你上不去。」'];
if (typeof STORY_ELITES12 !== 'undefined') STORY_ELITES12.push(AEG15, MORA15);
if (typeof CHIBI_FLOAT !== 'undefined') CHIBI_FLOAT.add(MORA15);
BAI.SCRIPT.b15_aeg = function (core, u) { const d = u.data; d.cd = (d.cd ?? 2) - 1;
  if (d.cd <= 0) { d.cd = 3; return b12Charge(core, u, 'm15_lanceCharge'); }
  if (!d.guard15 && u.res.hp <= u.max.hp * 0.5) { d.guard15 = 1; const r = b12Pick(core, u, ['m_scaleGuard']); if (r) return r; }
  return b12Pick(core, u, ['m_spearRush', 'm_spearThrust', 'm_tidalCrush']); };
BAI.SCRIPT.b15_mora = function (core, u) { const d = u.data; d.cd = (d.cd ?? 2) - 1;
  if (d.cd <= 0) { d.cd = 3; return b12Charge(core, u, 'm15_blackTide'); }
  if (!d.heal15 && u.res.hp <= u.max.hp * 0.45) { d.heal15 = 1; const r = b12Pick(core, u, ['m6_regen']); if (r) return r; }
  return b12Pick(core, u, ['m_hex', 'm_waterBomb', 'm_whirlpool']); };
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o);
    if (s && sp === AEG15) s.data.script = 'b15_aeg'; if (s && sp === MORA15) s.data.script = 'b15_mora'; return s; }; }

/* ---------- 潮將 塔拉薩 (boss, Lv62) ---------- */
{ const B = SPECIES.otto14 || SPECIES.shadowGeneral;
  SPECIES[THAL15] = { ...B, n: '潮將 塔拉薩', fam: 'aquatic', boss: 1, elite: 0, exp: 4800, gold: 0, drop: null, ch3: 1, mat: 'tideScaleM14',
    learn: ['m15_trident', 'm15_tidalWave', 'm15_pearlShield', 'm15_maelstrom', 'm15_callLancer', 'm15_wrath'].map(m => [1, m]),
    dex: '魔王四將之一，統領東方之海的人魚女王。五百年前和曙光軍一戰後沉進海底，奪走潮汐之珠，讓海一直停在滿潮。' };
  const P = MON_PANEL.otto14 || ch2Panel(44, 'phys', 'boss'); MON_PANEL[THAL15] = { ...P, lv: P.lv, hp: Math.round(P.hp * 1.15), atk: Math.round(P.atk * 1.05), spa: Math.round(P.spa * 1.05), spd: Math.round(P.spd * 1.1) };
  HD_RIG_OF[THAL15] = BATTLE_PXC[THAL15] ? THAL15 : (HD_RIG_OF.otto14 || 'shadowGeneral'); if (ART.otto14 || ART.shadowGeneral) ART[THAL15] = ART[THAL15] || artRecolor(ART.otto14 || ART.shadowGeneral, 20, 1.1, 1.05); }
defPut('enemies', THAL15, { tags: ['foe', 'fam:aquatic'], skills: ['m15_trident', 'm15_tidalWave', 'm15_pearlShield', 'm15_maelstrom', 'm15_callLancer', 'm15_wrath'], fam: 'aquatic', trait: null, profile: 'brute', script: null, metadata: { n: '潮將 塔拉薩' } });
B12_SCRIPT[THAL15] = function (core, u) { const d = u.data, hp = u.res.hp / u.max.hp, minions = core.alive(u.side).filter(q => q !== u && q.minion).length, t = b12Hero(core);
  if (hp <= 0.3 && !d.wrath15) { d.wrath15 = 1; if (Game.scene && Game.scene.core === core) Game.scene.rage15 = 1; return { type: 'skill', skill: 'm15_wrath', targets: [u.id] }; }
  if (core.round >= 3 && core.round - (d.lastCharge || 0) >= (d.wrath15 ? 3 : 4)) return b12Charge(core, u, 'm15_maelstrom');
  if (minions < 1 && hp <= 0.7 && (d.calls15 || 0) < 2 && core.round >= 2) { d.calls15 = (d.calls15 || 0) + 1; return { type: 'skill', skill: 'm15_callLancer', targets: [u.id] }; }
  if (hp <= 0.55 && !d.shield15) { d.shield15 = 1; return { type: 'skill', skill: 'm15_pearlShield', targets: [u.id] }; }
  return b12Pick(core, u, d.wrath15 ? ['m15_trident', 'm15_tidalWave', 'm15_tidalWave'] : ['m15_trident', 'm15_trident', 'm15_tidalWave']) || { type: 'skill', skill: 'm15_trident', targets: t ? [t.id] : [] }; };
defPut('mechanics', 'b12_' + THAL15, { make: u => ({ triggers: [{ on: EVT.SUMMON, phase: 'POST', cond: { ownerAlive: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'message', target: 'self', text: '（海螺聲響起，潮騎兵從水裡衝了出來！）' }] }] }) });
// her last phase uses the Codex rage frames (hair turned to foam)
{ const _pr = pxRender; pxRender = function (A, S, T, tint) { if (S && S.sp === THAL15 && S.meta && S.meta.frames.rage && A.state === 'idle' && Game.scene && Game.scene.rage15) {
    const S2 = S.rage15 || (S.rage15 = { ...S, meta: { ...S.meta, frames: { ...S.meta.frames, idle: S.meta.frames.rage } } }); return _pr(A, S2, T, tint); } return _pr(A, S, T, tint); }; }
if (typeof BOSS_MAT !== 'undefined') { BOSS_MAT[AEG15] = 'tideScaleM14'; BOSS_MAT[MORA15] = 'deepPearl14'; BOSS_MAT[THAL15] = 'tideScaleM14'; }

/* ---------- crystals and parts for the three (the same hunting system as the other elites and bosses) ---------- */
const DEEP_CRY15 = { [AEG15]: ['w', '單顆', [['double', 30], ['atk', 8]], ['海馬鬃', '艾格的騎槍尖']], [MORA15]: ['c', '單顆', [['spa', 10], ['freecast', 15]], ['巫女的水母紗', '莫菈的黑珍珠']],
  [THAL15]: ['u', '單顆', [['all', 4], ['regen', 3]], ['潮將的鱗片', '潮將的珍珠']] };
for (const sp in DEEP_CRY15) { const [t, ser, eff, [a, b]] = DEEP_CRY15[sp], lv = sp === THAL15 ? 62 : 59; CRY11[sp] = [t, ser, eff]; PARTS11[sp] = [a, b]; PART_LV11[sp] = lv; if (sp === THAL15) PART_BOSS11[sp] = 1;
  ITEMS['pt_' + sp] = { n: a, mat: 1, price: 0, sell: 20 + lv * 6, cat: '魔物素材', part11: sp, d: SPECIES[sp].n + '身上取下的部位素材。把牠的晶石升級要用（鐵匠→晶石）。' };
  ITEMS['pr_' + sp] = { n: b, mat: 1, price: 0, sell: 60 + lv * 20, cat: '魔物素材', part11: sp, rare11: 1, d: SPECIES[sp].n + '身上很少拿到的稀有部位。把牠的晶石升到 ★3 要用。' };
  PART_OF11['pt_' + sp] = { sp, rare: 0 }; PART_OF11['pr_' + sp] = { sp, rare: 1 }; }

/* ---------- new gear: three accessories ---------- */
PV('fx.tideCrown15', () => ({ triggers: [
  { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, foesHaveBoss: 0 }, effects: [{ type: 'heal', target: 'self', pct: 0.04, kind: 'regen', quiet: 1 }, { type: 'resource', target: 'self', res: 'mp', pct: 0.03, min: 1, why: 'tideCrown15' }] },
  { on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1, foesHaveBoss: 1 }, effects: [{ type: 'heal', target: 'self', pct: 0.02, kind: 'regen', quiet: 1 }, { type: 'resource', target: 'self', res: 'mp', pct: 0.02, min: 1, why: 'tideCrown15' }] }] }), { n: '潮將之冠' });
PV('fx.charge15', () => ({ triggers: [{ on: EVT.BATTLE_START, phase: 'POST', effects: [{ type: 'stage', target: 'self', stats: { atk: 1, spa: 1 }, dur: 3 }] }] }), { n: '衝鋒' });
PV('fx.blackPearl15', () => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1.12, cond: { cat: '特', hasPower: 1 } }] }), { n: '黑珍珠' });
const ACC15 = {
  tideCrown15: ['潮將的珍珠冠', { hp: 40, atk: 6, spa: 8, def: 6, spd: 8 }, 'tideCrown15', '潮將之冠', '回合結束回復 4% HP・3% MP（打頭目時各 2%）', '塔拉薩戴了五百年的冠。珍珠裡封著東方之海的潮聲。'],
  seahorseBadge15: ['海馬騎士徽章', { hp: 30, atk: 10, spe: 6, def: 4 }, 'charge15', '衝鋒', '戰鬥開始時物攻・魔攻 +1 階（3 回合）', '潮騎兵長艾格別在胸前的徽章。刻著一匹昂首的海馬。'],
  blackPearl15: ['黑珍珠護符', { hp: 26, spa: 11, spd: 7, spe: 3 }, 'blackPearl15', '黑珍珠', '魔法傷害 +12%', '海妖大巫女莫菈的護符。黑珍珠裡，好像有什麼在游動。'],
};
for (const k in ACC15) { const [n, st, tr, tn, td, d] = ACC15[k];
  GEAR[k] = { n, slot: 'acc', t: 8, st, sp: {}, fx: [tr], trait: tr, kind: '飾品', d, look: (GEAR.qHeroCrest || {}).look };
  ACC_TRAIT[tr] = [tn, td, [n]]; if (typeof SPECIALS !== 'undefined') SPECIALS[tr] = { n: tn, d: td + '。', cat: tr === 'blackPearl15' ? '攻擊' : tr === 'charge15' ? '攻擊' : '回復' }; if (typeof BP_RARE !== 'undefined') BP_RARE.add(k); }
Object.assign(ITEMS, { tidePearl15: { n: '潮汐之珠', key: 1, price: 0, sell: 0, cat: '重要物品', d: '兩半合在一起的潮汐之珠。握在手裡，聽得到整片海的潮聲。' } });

/* ---------- maps ---------- */
const DEEP_ROWS15 = {
  deepCastle15a: ['RRRRRRRRRRRRRRRRRR', 'RRRRRRRsssRRRRRRRR', 'RRRRRRRsssRRRRRRRR', 'RRRRRRRRsRRRRRRRRR', 'RRRsssssssssssRRRR', 'RRRsWsssssssWsRRRR', 'RRRsssssssssssRRRR', 'RRRRRRRRsRRRRRRRRR',
    'RRRRRRRRsRRRRRRRRR', 'RRsssssssssssssRRR', 'RRsWWsssssssWWsRRR', 'RRsWWsssssssWWsRRR', 'RRsssssssssssssRRR', 'RRRRssRRRRRssRRRRR', 'RRRRssRRRRRssRRRRR', 'RRsssssssssssssRRR',
    'RRsssssssssssssRRR', 'RRRRRRRsssRRRRRRRR', 'WWWWWWWsssWWWWWWWW', 'WWWWWWWsssWWWWWWWW', 'WWWWWsssssssWWWWWW', 'WWWWWsssssssWWWWWW', 'WWWWWWWWWWWWWWWWWW'],
  deepCastle15b: ['RRRRRRRRRRRRRRRRRR', 'RRRRRsssssssRRRRRR', 'RRRRRsssssssRRRRRR', 'RRRRRsWsssWsRRRRRR', 'RRRRRsssssssRRRRRR', 'RRRRRRRRsRRRRRRRRR', 'RRRsssssssssssRRRR', 'RRRsWWsssssWWsRRRR',
    'RRRsssssssssssRRRR', 'RRRRRRRRsRRRRRRRRR', 'RRRRRRRRsRRRRRRRRR', 'RRsssssssssssssRRR', 'RRsRRRRRsRRRRRsRRR', 'RRsRRRRRsRRRRRsRRR', 'RRsssRRRsRRRsssRRR', 'RRRRRRRRsRRRRRRRRR',
    'RRRRRRsssssRRRRRRR', 'RRRRRRsssssRRRRRRR', 'RRRRRRRRRRRRRRRRRR'],
};
for (const id in DEEP_ROWS15) { const R = DEEP_ROWS15[id]; if (R.some(r => r.length !== R[0].length)) bvErr('ch5', 'rows ' + id); }
const DEEP_ENC15 = [{ y0: 0, y1: 999, rate: 0.06, table: [['tideLancer14', 57, 59, 40], ['seaWitch14', 57, 59, 35], ['deepShark14', 57, 59, 25]] }];
MAPS.deepCastle15a = { name: '深潮城・外城', music: 'ruins', border: 'R', battleBg: 'seacave13', encAll: 1, popup: 1, theme: 'seacave13', rows: DEEP_ROWS15.deepCastle15a, type: '迷宮',
  elites: [{ id: AEG15, sp: AEG15, lv: 59, x: 8, y: 8, dir: 'down', sight: 3 }, { id: MORA15, sp: MORA15, lv: 59, x: 8, y: 3, dir: 'down', sight: 3 }],
  npcs: [{ id: 'captainD15', x: 10, y: 21, dir: 'up', look: 'captain14', name: '船長葛雷' }, { id: 'stairsD15', x: 8, y: 1, dir: 'down', look: 'caveDoor', name: '往王座的階梯' }],
  items: [{ id: 'dc1', x: 4, y: 4, item: 'megaPotion', n: 3 }, { id: 'dc2', x: 13, y: 4, item: 'starShard', n: 1 }, { id: 'dc3', x: 2, y: 16, gold: 15000 }, { id: 'dc4', x: 14, y: 16, item: 'megaEther', n: 2 },
    { id: 'dc5', x: 2, y: 9, item: 'riftShard', n: 2 }, { id: 'dc6', x: 14, y: 12, item: 'vitFruit', n: 1 }],
  gathers: [{ id: 'gdc1', x: 4, y: 13, kind: 'coral14', mat: 'coralBranch14' }, { id: 'gdc2', x: 12, y: 14, kind: 'star', mat: 'starDust' }],
  encounters: DEEP_ENC15 };
MAPS.deepCastle15b = { name: '深潮城・王座', music: 'ruins', border: 'R', battleBg: 'seacave13', encAll: 1, popup: 1, theme: 'seacave13', rows: DEEP_ROWS15.deepCastle15b, type: '迷宮',
  boss: { sp: THAL15, lv: 62, x: 8, y: 2, flag: THAL15, ev: 'thalassaBoss15' },
  npcs: [{ id: 'stairsE15', x: 8, y: 17, dir: 'up', look: 'caveDoor', name: '往下的階梯' }],
  items: [{ id: 'dt1', x: 2, y: 14, item: 'elixir', n: 2 }, { id: 'dt2', x: 14, y: 14, item: 'starShard', n: 2 }, { id: 'dt3', x: 4, y: 6, item: 'tpBook', n: 1 }, { id: 'dt4', x: 13, y: 8, gold: 20000 }],
  encounters: DEEP_ENC15 };
if (!ITEMS.vitFruit) MAPS.deepCastle15a.items[5].item = 'powerFruit';
MAPS.deepCastle15a.gearPool = LATE_GEAR13(); MAPS.deepCastle15b.gearPool = LATE_GEAR13();
if (typeof MAP_TYPES !== 'undefined') Object.assign(MAP_TYPES, { deepCastle15a: '迷宮', deepCastle15b: '迷宮' });
Object.assign(EXPLORE, { deepCastle15a: '深潮城', deepCastle15b: '深潮城・王座' });
if (typeof BATTLE2_MAPS !== 'undefined') for (const k of ['deepCastle15a', 'deepCastle15b']) BATTLE2_MAPS.add(k);
if (typeof FOE_SPOTS !== 'undefined') { FOE_SPOTS.push({ sp: AEG15, lv: 59, map: 'deepCastle15a', kind: 'elite', key: AEG15 }, { sp: MORA15, lv: 59, map: 'deepCastle15a', kind: 'elite', key: MORA15 }, { sp: THAL15, lv: 62, map: 'deepCastle15b', kind: 'boss', key: THAL15 }); FOE_SPOTS.sort((a, b) => a.lv - b.lv); }
{ const _mg = mapGraph; let done15 = null; mapGraph = function () { const G = _mg(); if (G === done15) return G; done15 = G;
    (G.shellVillage14 = G.shellVillage14 || {}).deepCastle15a = { x: 10, y: 16, npc: 'captainV14', ship: 1 }; (G.deepCastle15a = G.deepCastle15a || {}).shellVillage14 = { x: 10, y: 21, npc: 'captainD15', ship: 1 };
    (G.deepCastle15a = G.deepCastle15a || {}).deepCastle15b = { x: 8, y: 1, npc: 'stairsD15' }; (G.deepCastle15b = G.deepCastle15b || {}).deepCastle15a = { x: 8, y: 17, npc: 'stairsE15' }; return G; }; }
if (typeof MAP_G !== 'undefined') MAP_G = null;
if (typeof SPK_INDEX !== 'undefined') SPK_INDEX = null;
// 異色 rares and the map's 異色 accessory (same as the other maps, v12.106)
Object.assign(IRO_LOOK15, { tideLancer14: ['蒼', 25], seaWitch14: ['翠', 300], deepShark14: ['金', 210] });
MAP3_15.deepCastle15a = [57, 59, ['tideLancer14', 'seaWitch14', 'deepShark14']]; MAP3_15.deepCastle15b = MAP3_15.deepCastle15a;
for (const m of ['deepCastle15a', 'deepCastle15b']) { const [lo, hi, L] = MAP3_15[m], keys = [];
  for (const b of L) { const k = 'iro_' + b; if (IRO15[k] || iroMake15(k, b, 'deepCastle15a', lo)) keys.push(k); } IRO_OF_MAP15[m] = keys; MAPS[m].rares15 = keys.map(k => [k, lo, hi]); MAPS[m].rare = MAPS[m].rares15[0] || null; }
GEAR.iroAcc_deepCastle15a = { n: '深潮虹鱗', slot: 'acc', t: 7, st: { hp: 30, atk: 11, spa: 8 }, sp: {}, fx: ['abyCrown13'], trait: 'abyCrown13', kind: '飾品', d: '深潮城的異色魔物身上的虹色鱗片，在暗處會映出整片海的顏色。（深潮城的異色魔物掉落）', look: (GEAR.qHeroCrest || {}).look, iro15: 'deepCastle15a' };
IRO_ACC_ALIAS15.deepCastle15b = 'deepCastle15a';
if (typeof BP_RARE !== 'undefined') BP_RARE.add('iroAcc_deepCastle15a');

/* ---------- the story ---------- */
function* card15(lines) { Sound.stop(); UI.clear(); const box = { draw(x) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } }; yield* fadeOut(30); UI.push(box); Game.fade = 0;
  for (const s of lines) yield* say(s, { style: 'dark', y: 98 }); UI.remove(box); const ow = Game.ow; if (ow && ow.map) ow.load(ow.map.id, ow.p.x, ow.p.y, ow.p.dir, true); yield* fadeIn(30); }
function* ferry15(ow, dest) { Sound.sfx('run'); yield* fadeOut(20);
  if (dest === 'deepCastle15a') ow.load('deepCastle15a', 8, 20, 'up'); else ow.load('shellVillage14', 10, 15, 'up');
  yield* wait(10); yield* fadeIn(20); yield* say('海鷗號抵達了' + MAPS[dest].name.replace(/・.*$/, '') + '。');
  if (dest === 'deepCastle15a' && ch3m() < 12) { setCh3m(12);
    yield* sayAll(['浮出海面的城，全身掛著海草和珊瑚。城門前的石階，一階一階沉在水裡。', '船長葛雷：「我把船停在這裡等你們。……一定要回來啊。」', '莉婭：「潮將就在城的最上面。……走吧！」', '（深潮城・外城：城門前有守衛。往王座的階梯走吧）']); saveGame(); } }
{ const _cv = Events.captainV14; Events.captainV14 = function* (ow) { if (ch3m() < 11) return yield* _cv.call(this, ow);
    const r = yield* ask('船長葛雷：「要去哪裡？」', ['潮鳴港', '深潮城', '不用了']); if (r === 0) yield* ferry14(ow, 'harbor13'); else if (r === 1) yield* ferry15(ow, 'deepCastle15a'); }; }
Object.assign(Events, {
  *captainD15(ow) { const r = yield* ask('船長葛雷：「要先回貝殼村嗎？」', ['回貝殼村', '不用了']); if (r === 0) yield* ferry15(ow, 'shellVillage14'); },
  *stairsD15(ow) { const f = Game.st.flags; if (!f[MORA15]) { const e = (ow.elites || []).find(q => q.id === MORA15); if (e) { yield* ow.eliteTalk(e); return; } }
    if (yield* yesNo('往王座的階梯。上面傳來很大的潮聲。\n要上去嗎？')) yield* ow.warp('deepCastle15b', 8, 16, 'up'); },
  *stairsE15(ow) { if (yield* yesNo('往下的階梯。要回外城嗎？')) yield* ow.warp('deepCastle15a', 8, 2, 'down'); },
  *eliteWin_tideCaptain15(ow) { if (ch3m() < 13) setCh3m(13);
    yield* sayAll(['潮騎兵長艾格：「……好。五百年了，第一次有人讓這匹老傢伙跪下。」', '艾格：「進去吧。塔拉薩大人不是壞人……她只是不肯再相信陸地上的人了。」', '艾格把胸前的徽章丟了過來。「拿著。給打開這道門的人。」']);
    makeGear('seahorseBadge15', 4); yield* itemGet('得到了「海馬騎士徽章」！'); yield* say('（往城的最裡面、王座的階梯走吧）'); saveGame(); },
  *eliteWin_seaWitchQ15(ow) { if (ch3m() < 14) setCh3m(14);
    yield* sayAll(['海妖大巫女莫菈：「……我的歌，第一次停下來了呢。」', '莫菈：「深潮城浮上來，是塔拉薩大人要讓你們看見。五百年前沉下去的，不只是這座城。」', '莫菈：「去吧。她在上面等你。」', '莫菈留下一顆黑色的珍珠，沉進了水裡。']);
    makeGear('blackPearl15', 4); yield* itemGet('得到了「黑珍珠護符」！'); yield* say('（登上階梯，前往深潮城・王座）'); saveGame(); },
  *thalassaBoss15(ow) { const st = Game.st, f = st.flags; if (f[THAL15]) return;
    yield* sayAll(['王座之間的地板是一整片海水。王座上，坐著一位長著藍黑色魚尾的女王。', '潮將 塔拉薩：「你們來了。拿著半顆珠子，帶著曙光的劍。」', '塔拉薩：「五百年前，你們的勇者也站在這裡。他說，海和陸地可以一起活下去。」', '塔拉薩：「然後，陸地上的人把海填成了港口，把我的子民趕到了深海。」', '塔拉薩：「這次，我不會再相信了。——讓我看看，你的光能不能擋住整片海！」']);
    const res = yield* ow.battleScript({ sp: THAL15, lv: MAPS.deepCastle15b.boss.lv, kind: 'boss', id: THAL15 });
    if (res !== 'win') return;
    f[THAL15] = 1; ow.boss = null; setCh3m(15); delete st.bag.tidePearlHalf14; st.bag.tidePearl15 = 1;
    yield* sayAll(['塔拉薩：「……我輸了。」', '塔拉薩：「你的光……跟那個人一樣，是暖的。」', '塔拉薩：「拿去吧，另一半的珠子。海會退回原本的地方。」', '塔拉薩：「可是，勇者。記住——魔王四將，還剩兩個。」', '塔拉薩：「南方的沙漠已經醒了。天空之上的那一位……連我都沒見過他的樣子。」', '女王把珍珠冠放在王座上，化成浪花，消失在海裡。']);
    Sound.jingle('item'); yield* itemGet(st.name + '得到了「潮汐之珠」！'); makeGear('tideCrown15', 5); yield* itemGet('在王座上找到了「潮將的珍珠冠」！');
    yield* sayAll(['城開始搖晃，海水從四面八方湧進王座之間——', '船長葛雷的聲音：「快上船！城要沉下去了！」', '……海鷗號載著你們，衝出了正在沉沒的深潮城。']);
    yield* fadeOut(20); ow.load('shellVillage14', 10, 15, 'up'); yield* wait(10); yield* fadeIn(20); yield* say('（回村長家，把潮汐之珠交給珂拉村長吧）'); saveGame(); },
});
{ const _ck = Events.chief14; Events.chief14 = function* (ow) { const st = Game.st, n = ch3m(st);
    if (n === 10) { setCh3m(11);
      yield* sayAll(['珂拉村長：「勇者大人，你看海上——那座城，昨天晚上整個浮出了海面。」', '珂拉：「那就是深潮城。潮將塔拉薩就在城的最上面。」', '珂拉：「葛雷船長說，海鷗號開得過去。去碼頭找他吧。」', '莉婭：「另一半的潮汐之珠……一定要拿回來。」']);
      yield* card15(['第五章「深潮城」', '五百年前沉進海底的城，浮上了海面。\n城的最上面，潮將塔拉薩在等著。', '（到貝殼村的碼頭找船長葛雷，搭海鷗號出發）']); saveGame(); return; }
    if (n >= 11 && n <= 14) { yield* say('珂拉村長：「深潮城……潮將就在那裡。一定要平安回來。」\n（貝殼村的碼頭，船長葛雷會載你去）'); return; }
    if (n === 15) { setCh3m(16); delete st.bag.tidePearl15; const g = 50000;
      yield* sayAll(['珂拉村長：「這是……完整的潮汐之珠！」', '村長把珠子放回村子的祭壇。藍色的光一閃——', '海水嘩啦嘩啦地往後退，泡在水裡的石階、房子、晾漁網的木架，一個一個露了出來。', '村民們：「海退了！海退了！」', '珂拉：「勇者大人……貝殼村，會把你們的故事一直說下去。」']);
      st.money += g; st.bag.starShard = (st.bag.starShard || 0) + 3; st.bag.tpBook = (st.bag.tpBook || 0) + 1; Sound.jingle('item');
      yield* itemGet('得到了謝禮 ' + g + ' G、星之碎片×3、天賦之書！');
      yield* card15(['第五章「深潮城」\n—— 完 ——', '潮水回到了原本的地方。\n東方的海，又聽得到海鷗的叫聲了。', '「魔王四將，還剩兩個。」\n「南方的沙漠已經醒了。」', '（下一章：南方的沙漠　製作中）']); saveGame(); return; }
    if (n >= 16) { yield* say('珂拉村長：「海退了以後，孩子們每天都在沙灘上撿貝殼。……謝謝你，勇者大人。」'); return; }
    yield* _ck.call(this, ow); }; }
// the quest log: the chapter is called 第五章「深潮城」 from step 11
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const n = ch3m(st); if (n < 11) return; const q = L.find(x => x.n === '第三章「東方的海」'); if (!q) return;
    const T = { 11: '【推薦Lv57〜】到貝殼村的碼頭找船長葛雷，搭海鷗號前往深潮城。', 12: '攻入深潮城・外城。城門前有潮騎兵長艾格把守。', 13: '往深潮城・外城最裡面、往王座的階梯走。', 14: '登上深潮城・王座，打倒潮將塔拉薩。（建議Lv60）',
      15: '拿回了潮汐之珠。回貝殼村，把它交給珂拉村長。', 16: '完成：潮水回到了原本的地方。（下一章：南方的沙漠）' };
    Object.assign(q, { n: '第五章「深潮城」', t: T[Math.min(16, n)], done: n >= 16, rw: n >= 15 ? '50000 G・星之碎片×3・天賦之書' : '' }); }; }
ACHIEVEMENTS.push({ id: 'ch5_aeg', n: '開啟的城門', d: '打倒潮騎兵長艾格。', cat: '戰鬥', ok: st => !!(st.flags || {})[AEG15] },
  { id: 'ch5_thalassa', n: '潮將退去', d: '打倒潮將塔拉薩，讓東方的海恢復潮汐。', cat: '戰鬥', ok: st => !!(st.flags || {})[THAL15] });
if (typeof NPC_WHERE !== 'undefined') Object.assign(NPC_WHERE, { captainD15: '深潮城・外城' });
NPC_ROLES.任務.push('captainD15'); (NPC_ROLES.事件 || NPC_ROLES.情報).push('stairsD15', 'stairsE15');
