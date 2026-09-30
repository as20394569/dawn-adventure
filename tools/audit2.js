// System integrity audit: every table cross-reference. node tools/play.js tools/audit2.js
module.exports = async (g) => {
  const out = await g.ev(() => {
    const G = __game, P = [], W = [], I = [], bad = (...a) => P.push(a.join(' ')), warn = (...a) => W.push(a.join(' ')), info = (...a) => I.push(a.join(' '));
    G.newGameState('測'); const st = G.Game.st; st.flags.license = 1;
    const SPECIALS_KEYS = Object.keys(SPECIALS), ELEM = ['一般', '火', '水', '草', '雷', '岩', '毒', '飛'], STATS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'], SPK = ['crit', 'hit', 'eva', 'drain', 'elem', 'vs', 'resist', 'block'];
    const SRC = document.querySelector('script:not([src])') ? [...document.querySelectorAll('script')].map(s => s.textContent).join('\n') : '';
    // ---------- where things appear ----------
    const seenSp = {}, gearSrc = {}, itemSrc = {}, matUse = {};
    const addG = (k, s) => (gearSrc[k] = gearSrc[k] || []).push(s), addI = (k, s) => (itemSrc[k] = itemSrc[k] || []).push(s), useM = (k, s) => (matUse[k] = matUse[k] || []).push(s);
    for (const id in MAPS) { const d = MAPS[id];
      for (const e of d.encounters || []) for (const r of e.table) (seenSp[r[0]] = seenSp[r[0]] || []).push(id);
      if (d.rare) (seenSp[d.rare[0]] = seenSp[d.rare[0]] || []).push(id + '(稀有)');
      for (const e of d.elites || []) { (seenSp[e.sp] = seenSp[e.sp] || []).push(id + '(精英)'); if (e.drop) addG(e.drop, id + '精英掉落'); }
      if (d.boss) (seenSp[d.boss.sp] = seenSp[d.boss.sp] || []).push(id + '(頭目)');
      for (const k of d.gearPool || []) addG(k, id + '掉落池');
      for (const it of d.items || []) { if (it.item && GEAR[it.item]) addG(it.item, id + '寶箱'); else if (it.item) addI(it.item, id + '寶箱'); }
      for (const ga of d.gathers || []) addI(ga.mat, id + '採集');
    }
    for (const k of SHOP_LIST) (GEAR[k] ? addG : addI)(k, '道具店'); for (const k of PEDDLER_LIST) (GEAR[k] ? addG : addI)(k, '行商');
    for (const k of ['knightSword', 'magusStaff', 'guardHelm', 'chainMail']) addG(k, '道具店(沼澤鱷後)'); for (const k of ['elixir', 'tpBook', 'rope']) addI(k, '道具店(魔像後)');
    if (typeof LOOT !== 'undefined') for (const k in LOOT) for (const g of LOOT[k]) addG(g, '重戰掉落:' + k);
    if (typeof TOWER_LOOT !== 'undefined') for (const g of TOWER_LOOT) addG(g, '異界迴廊');
    if (typeof TOWER_SHOP !== 'undefined') for (const k of TOWER_SHOP.map(r => r[0])) (GEAR[k] ? addG : addI)(k, '迴廊兌換');
    for (const c in CLASS_START) for (const b of CLASS_START[c].gear) addG(b, '職業起始');
    for (const r of RECIPES) { (GEAR[r.out] ? addG : addI)(r.out, '鐵匠配方'); for (const m in r.mats) useM(m, '配方:' + r.out); }
    for (const sp in SPECIES) { const s = SPECIES[sp]; if (s.mat) addI(s.mat, '魔物:' + s.n); if (s.drop) addG(s.drop, s.n + '掉落'); }
    for (const k in SALVAGE) for (const m of SALVAGE[k]) addI(m, '分解');
    for (const m of ['stone', 'gel', 'crystal']) useM(m, '強化');
    for (const c in COMMISSIONS) { const C = COMMISSIONS[c]; for (const m in C.need || {}) useM(m, '委託' + c); for (const m in (C.reward.items || {})) addI(m, '委託獎勵'); }
    useM('crystal', '支線:師父的遺作');
    // text-searched sources (quest rewards written in events)
    for (const k in GEAR) if (!gearSrc[k] && new RegExp("makeGear\\((classGear\\()?'" + k + "'").test(SRC)) addG(k, '劇情/任務');
    for (const a in MAGE_SWAP) for (const s of gearSrc[a] || []) addG(MAGE_SWAP[a], s + '(魔導士)');
    for (const k in ITEMS) if (!itemSrc[k] && new RegExp("bag\\." + k + "\\b|bag\\['" + k + "'\\]|item: '" + k + "'").test(SRC)) addI(k, '劇情/任務');
    // ---------- SPECIES ----------
    for (const k in SPECIES) { const s = SPECIES[k];
      if (!FAMILIES[s.fam]) bad('魔物', k, '種族無效', s.fam); if (s.t) bad('魔物', k, '仍有屬性 t'); if (!MON_PANEL[k]) bad('魔物', k, '缺能力面板'); if (!ART[k]) bad('魔物', k, '缺美術');
      for (const [, m] of s.learn) { if (!MOVES[m]) bad('魔物', k, '技能不存在', m); else if (!MOVES[m].foe) bad('魔物', k, '使用了主角技能', m); }
      if (s.mat && !ITEMS[s.mat]) bad('魔物', k, '素材不存在', s.mat); if (s.drop && !GEAR[s.drop]) bad('魔物', k, '掉落不存在', s.drop);
      if (!seenSp[k]) warn('魔物', k, s.n, '沒有出現在任何地圖'); if (!s.dex) warn('魔物', k, '缺圖鑑介紹');
      if (s.trait && !['swift', 'healer', 'berserk'].includes(s.trait)) bad('魔物', k, '特性無效', s.trait);
      if ((s.elite || s.boss) && !s.drop && k !== 'bandit') warn('魔物', k, '精英/頭目沒有專屬掉落'); }
    // ---------- MOVES ----------
    const heroMoves = new Set(['attack', ...Object.values(SKILL_TREES).flat().map(n => n[0]), ...Object.values(CLASS_LINE).flat().map(x => x[1]), ...Object.values(CLASS_START).flatMap(c => c.moves), ...Object.values(CLASSES).flatMap(c => [c.move, c.move2]).filter(Boolean), 'struggle', 'armorBreak', 'barrier', 'glare', ...Object.keys(typeof WMOVE !== 'undefined' ? WMOVE : {}), ...Object.values(MOVES).map(m => m.tpl).filter(Boolean)]);
    for (const k in MOVES) { const m = MOVES[k];
      if (!ELEM.includes(m.t)) bad('技能', k, '屬性無效', m.t); if (!['物', '特', '變'].includes(m.cat)) bad('技能', k, '類別無效', m.cat); if (!m.cls) bad('技能', k, '缺內部分類');
      if (m.foe) { if (!MFX[m.fx]) bad('技能', k, '怪物特效不存在', m.fx); if (heroMoves.has(k)) bad('技能', k, '怪物技能被主角使用'); }
      else { if (!FX[m.fx]) bad('技能', k, '主角特效不存在', m.fx); if (!heroMoves.has(k)) warn('技能', k, m.n, '主角學不到'); }
      if (m.st && !STATUS_NAME[m.st]) bad('技能', k, '異常無效', m.st); if (m.eff && m.eff.st && !STATUS_NAME[m.eff.st]) bad('技能', k, '附加異常無效'); }
    for (const c in CLASS_LINE) for (const [lv, m] of CLASS_LINE[c]) if (!MOVES[m]) bad('職業技能表', c, m, '不存在'); for (const c in CLASS_START) { for (const m of CLASS_START[c].moves) if (!MOVES[m]) bad('起始技能', c, m); for (const b of CLASS_START[c].gear) if (!GEAR[b]) bad('起始裝備', c, b); }
    for (const c in CLASSES) { const C = CLASSES[c]; for (const m of [C.move, C.move2]) if (m && !MOVES[m]) bad('職業', c, '技能不存在', m); if (C.from && !CLASSES[C.from]) bad('職業', c, '前置職業無效'); }
    // hero FX uniqueness (different moves sharing the exact same effect)
    const fxUse = {}; for (const k in MOVES) if (!MOVES[k].foe && !MOVES[k].tpl) (fxUse[MOVES[k].fx] = fxUse[MOVES[k].fx] || []).push(MOVES[k].n); for (const f in fxUse) if (fxUse[f].length > 1 && !(f === 'slash' && fxUse[f].includes('攻擊'))) warn('主角特效重複使用', f, fxUse[f].join('、'));
    // ---------- GEAR ----------
    for (const k in GEAR) { const e = GEAR[k];
      if (!['weapon', 'shield', 'head', 'body', 'feet', 'acc'].includes(e.slot)) bad('裝備', k, '部位無效'); if (!(e.t >= 1 && e.t <= 7)) bad('裝備', k, '階級無效');
      for (const s in e.st || {}) if (!STATS.includes(s) && !(s === 'mp' && (e.kind === '魔導書' || e.kind === '樂器'))) bad('裝備', k, '數值欄位無效', s);
      for (const s in e.sp || {}) { if (!SPK.includes(s)) bad('裝備', k, '特殊欄位無效', s); }
      if (e.sp && e.sp.vs && !FAMILIES[e.sp.vs[0]]) bad('裝備', k, '對種族無效', e.sp.vs[0]); if (e.sp && e.sp.resist && !ELEM.includes(e.sp.resist[0])) bad('裝備', k, '抗性屬性無效');
      for (const f of e.fx || []) if (!SPECIALS[f]) bad('裝備', k, '特效不存在', f);
      if (e.elem && !['火', '水', '草', '雷'].includes(e.elem)) bad('裝備', k, '武器屬性無效', e.elem); if (e.elem && e.slot !== 'weapon') bad('裝備', k, '非武器卻有屬性');
      if (!e.d) warn('裝備', k, '缺介紹');
      if (!gearSrc[k] && !['woodSword', 'guardBadge', 'uniform', 'schoolShoes', 'practiceWand'].includes(k)) warn('裝備', k, e.n, '取得不到（沒有任何來源）');
      if ((e.fx || []).length && gearSrc[k] && gearSrc[k].every(s => /掉落池|道具店|行商/.test(s))) warn('裝備', k, e.n, '有特效卻能在商店/野外取得（非金色）');
    }
    // ---------- SPECIALS ----------
    for (const f of SPECIALS_KEYS) { const used = new RegExp('fx\\.' + f + '\\b').test(SRC); if (!used) bad('特效', f, '戰鬥程式沒有實作'); if (!Object.values(GEAR).some(e => (e.fx || []).includes(f))) warn('特效', f, SPECIALS[f].n, '沒有任何裝備使用（備用）'); }
    // ---------- AFFIX ----------
    for (const a in AFFIX_TABLE) for (const s of AFFIX_TABLE[a].slots) if (!['weapon', 'shield', 'head', 'body', 'feet', 'acc'].includes(s)) bad('詞綴', a, '部位無效', s);
    // ---------- ITEMS ----------
    for (const k in ITEMS) { const it = ITEMS[k];
      if (!it.mat && !it.key && !['heal', 'cure', 'pp', 'mp', 'escape', 'home', 'boost', 'full', 'tp', 'reset', 'enchant'].includes(it.use)) bad('道具', k, '沒有用途');
      if (!itemSrc[k] && !['phone', 'license', 'pocketWatch', 'letter'].includes(k)) warn('道具', k, it.n, '取得不到');
      if (it.mat && !matUse[k]) warn('素材', k, it.n, '沒有用途（只能賣）');
      if (!it.d) warn('道具', k, '缺說明'); }
    for (const k of [...SHOP_LIST, ...PEDDLER_LIST]) { if (!ITEMS[k] && !GEAR[k]) bad('商店', k, '不存在'); else if (!((ITEMS[k] || GEAR[k]).price > 0)) bad('商店', k, '沒有價格'); }
    for (const r of RECIPES) { if (!ITEMS[r.out] && !GEAR[r.out]) bad('配方', r.out, '產物不存在'); for (const m in r.mats) if (!ITEMS[m]) bad('配方', r.out, '素材不存在', m); }
    // ---------- MAPS ----------
    const walk = (id, x, y) => { const m = getMap(id); if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false; const c = m.rows[y][x]; return !SOLID.has(c) && !m.block.has(x + ',' + y); };
    for (const id in MAPS) { const d = MAPS[id], m = getMap(id);
      if (d.rows.some(r => r.length !== m.w)) bad('地圖', id, '列寬不一致');
      const tgt = (t, what) => { if (!MAPS[t[0]]) bad('地圖', id, what, '目標地圖不存在', t[0]); else if (!walk(t[0], t[1], t[2]) && !(getMap(t[0]).rows[t[2]] || '')[t[1]]?.match(/[D:]/)) bad('地圖', id, what, '落點不可走', t.join(',')); };
      for (const w of d.edgeWarps || []) tgt(w.to, 'edgeWarp'); if (d.exit) tgt(d.exit.to, 'exit'); if (d.southWarp) tgt(d.southWarp.to, 'southWarp'); if (d.northWarp) tgt(d.northWarp.to, 'northWarp');
      for (const b of d.buildings || []) if (!MAPS[b.to[0]]) bad('地圖', id, '門的目標不存在', b.to[0]);
      for (const n of d.npcs || []) { if (!walk(id, n.x, n.y)) bad('地圖', id, 'NPC站在牆裡', n.id); if (!Events[n.id]) warn('地圖', id, 'NPC沒有對話事件', n.id); }
      for (const e of d.elites || []) { if (!walk(id, e.x, e.y)) bad('地圖', id, '精英站在牆裡', e.id); if (!SPECIES[e.sp]) bad('地圖', id, '精英魔物不存在', e.sp); if (!ELITE_TEXT[e.id]) warn('地圖', id, '精英缺登場台詞', e.id); }
      for (const it of d.items || []) { if (!walk(id, it.x, it.y)) bad('地圖', id, '寶箱在牆裡', it.id); if (it.item && !ITEMS[it.item] && !GEAR[it.item]) bad('地圖', id, '寶箱內容不存在', it.item); }
      for (const ga of d.gathers || []) { if (!walk(id, ga.x, ga.y)) bad('地圖', id, '採集點在牆裡', ga.id); if (!ITEMS[ga.mat]) bad('地圖', id, '採集素材不存在'); }
      for (const e of d.encounters || []) for (const r of e.table) { if (!SPECIES[r[0]]) bad('地圖', id, '遇敵魔物不存在', r[0]); if (SPECIES[r[0]] && (SPECIES[r[0]].elite || SPECIES[r[0]].boss || SPECIES[r[0]].rare)) bad('地圖', id, '野生表裡放了精英/頭目/稀有', r[0]); }
      if (d.rare && !(SPECIES[d.rare[0]] || {}).rare) bad('地圖', id, '稀有欄位不是稀有魔物');
      for (const k of d.gearPool || []) if (!GEAR[k]) bad('地圖', id, '掉落池裝備不存在', k);
      for (const k in d.signs || {}) { const [x, y] = k.split(',').map(Number); if (m.rows[y][x] !== 'S') bad('地圖', id, '告示牌座標不是S', k); }
      if (d.boss && !walk(id, d.boss.x, d.boss.y) && m.rows[d.boss.y][d.boss.x] !== 's') bad('地圖', id, 'Boss位置異常');
      if ((d.encounters || d.outdoor) && !EXPLORE[id]) warn('地圖', id, '沒有列入探索度');
      // ids unique
    }
    const ids = {}; for (const id in MAPS) for (const it of [...(MAPS[id].items || []), ...(MAPS[id].gathers || []), ...(MAPS[id].elites || [])]) { if (ids[it.id]) bad('地圖', 'id重複', it.id, id, ids[it.id]); ids[it.id] = id; }
    // pairs of gearPool overlap
    const pools = Object.keys(MAPS).filter(k => MAPS[k].gearPool); for (let i = 0; i < pools.length; i++) for (let j = i + 1; j < pools.length; j++) { const o = MAPS[pools[i]].gearPool.filter(x => MAPS[pools[j]].gearPool.includes(x)); if (o.length) warn('掉落池重疊', pools[i], pools[j], o.join(',')); }
    // ---------- QUESTS / COMMISSIONS / ACHIEVEMENTS ----------
    for (const c in COMMISSIONS) { const C = COMMISSIONS[c]; for (const m in C.need || {}) if (!ITEMS[m]) bad('委託', c, '需求道具不存在'); if (C.kill && !SPECIES[C.kill[0]]) bad('委託', c, '討伐對象不存在'); if (C.key && !Object.values(MAPS).some(d => (d.items || []).some(i => i.item === C.key))) bad('委託', c, '關鍵道具沒放在地圖'); for (const m in C.reward.items || {}) if (!ITEMS[m]) bad('委託', c, '獎勵不存在', m); }
    for (const a of ACHIEVEMENTS) { try { a.ok(st); } catch (e) { bad('成就', a.id, '條件出錯', e.message); } }
    const flagsAll = { license: 1, golem: 1, q1: 1, q1res: 'home', q2: 1, q2res: 'stay', q3: 1, mineOpen: 1, caravanMet: 1, wellCharm: 1, herb: 1 }; Object.assign(st.flags, flagsAll); st.com = { c4: { s: 'on' } };
    try { const L = questList(st); info('任務數（旗標全開）', L.length); } catch (e) { bad('任務', '列表出錯', e.message); }
    try { for (const [mid, x, y] of questMarks(st)) { if (!MAPS[mid]) bad('任務標記', '地圖不存在', mid); else if (!getMap(mid).rows[y] || getMap(mid).rows[y][x] === undefined) bad('任務標記', '座標超出', mid, x, y); } } catch (e) { bad('任務標記', e.message); }
    // ---------- TALENTS / CLASSES stats ----------
    const okStat = s => [...STATS, 'mp', 'crit', 'hit', 'eva', 'drain', 'elem', 'counter', 'rage', 'fireUp', 'boltUp', 'venomEdge', 'assassin', 'venomous', 'shadowStep', 'spellblade'].includes(s);
    for (const T of TALENTS) for (const s in T.st) if (!okStat(s) && !['pierceT', 'mpRegen', 'shieldChip', 'statusRes', 'brkBonus', 'weakMp', 'guardPlus', 'weakUp', 'bigUp', 'mpSave', 'magCrit', 'elemRes', 'endureT'].includes(s)) bad('天賦', T.id, '欄位無效', s);
    for (const c in CLASSES) for (const s in CLASSES[c].st) if (!okStat(s)) bad('職業', c, '欄位無效', s);
    for (const s of ['counter', 'rage', 'fireUp', 'boltUp', 'venomEdge', 'assassin', 'venomous', 'shadowStep', 'spellblade']) if (!new RegExp('\\.' + s + '\\b').test(SRC.replace(/st: \{[^}]*\}/g, ''))) bad('能力', s, '戰鬥程式沒有讀取');
    // ---------- CATEGORIES (every entry must have one) ----------
    const miss = (sys, list) => { if (list.length) bad('未分類', sys, list.join(',')); else info('分類完整', sys); };
    miss('道具', Object.keys(ITEMS).filter(k => !ITEM_CATS.includes(ITEMS[k].cat)));
    miss('地圖', Object.keys(MAPS).filter(k => !MAPS[k].type));
    miss('武器種類', Object.keys(GEAR).filter(k => GEAR[k].slot === 'weapon' && !GEAR[k].kind));
    miss('防具輕重', Object.keys(GEAR).filter(k => ['head', 'body', 'feet'].includes(GEAR[k].slot) && !['輕裝', '重裝'].includes(GEAR[k].kind)));
    miss('特殊效果', Object.keys(SPECIALS).filter(k => !SPECIALS[k].cat));
    miss('詞綴', Object.keys(AFFIX_TABLE).filter(k => !AFFIX_TABLE[k].cat));
    miss('成就', ACHIEVEMENTS.filter(a => !a.cat).map(a => a.id));
    miss('任務', questList(st).filter(q => !QUEST_CAT_COL[q.cat]).map(q => q.n));
    miss('NPC', [...new Set(Object.values(MAPS).flatMap(d => (d.npcs || []).map(n => n.id)))].filter(id => !npcRoleOf(id)));
    miss('主角技能分類', Object.keys(MOVES).filter(k => !MOVES[k].foe && !SKILL_CLASS[MOVES[k].cls]));
    miss('怪物技能分類', Object.keys(MOVES).filter(k => MOVES[k].foe && !MON_CLASS[MOVES[k].cls]));
    miss('紙娃娃外觀', Object.keys(GEAR).filter(k => GEAR[k].slot !== 'acc' && GEAR[k].slot !== 'shield' && !GEAR[k].look)); // v10.5: shields are battle-only (left arm)
    for (const k in GEAR) { const L = GEAR[k].look; if (!L) continue; if (GEAR[k].slot === 'head' && !(DOLL_HEAD[L[0]] && HEAD_PAL[L[1]] && (!L[2] || DOLL_DECO[L[2]]))) bad('紙娃娃', k, '頭部外觀無效'); if (GEAR[k].slot === 'body' && L !== 'uniform' && !BODY_LOOKS[L]) bad('紙娃娃', k, '身體外觀無效'); if (GEAR[k].slot === 'feet' && !FEET_PAL[L]) bad('紙娃娃', k, '腳部外觀無效'); if (GEAR[k].slot === 'weapon' && !(['sword', 'dagger', 'staff', 'axe', 'tome'].includes(L[0]) && WPN_PAL[L[1]])) bad('紙娃娃', k, '武器外觀無效'); }
    miss('魔物種族', Object.keys(SPECIES).filter(k => !FAMILIES[SPECIES[k].fam]));
    // ---------- summary ----------
    const counts = { 魔物: Object.keys(SPECIES).length, 技能: Object.keys(MOVES).length, 裝備: Object.keys(GEAR).length, 道具: Object.keys(ITEMS).length, 地圖: Object.keys(MAPS).length, 配方: RECIPES.length, 特效: SPECIALS_KEYS.length, 成就: ACHIEVEMENTS.length, 委託: Object.keys(COMMISSIONS).length };
    info(JSON.stringify(counts));
    return { P, W, I, gearSrc, itemSrc, matUse };
  });
  g.log('PROBLEMS', out.P.length); out.P.forEach(x => g.log(' x', x));
  g.log('WARNINGS', out.W.length); out.W.forEach(x => g.log(' !', x));
  out.I.forEach(x => g.log(' -', x));
  require('fs').writeFileSync('build/sources.json', JSON.stringify({ gear: out.gearSrc, item: out.itemSrc, matUse: out.matUse }, null, 1));
};
