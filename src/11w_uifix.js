/* ===================== v12.66 畫面總檢查（介面審查 25 項裡能直接修的） ===================== */

/* 對話紀錄：選單裡的提問（「要看什麼？」「冒險手冊」）和系統訊息不記；只記在地圖上和人說話・劇情。 */
{ const _sm = startMenu; startMenu = function* (...a) { Game.inMenu13 = (Game.inMenu13 || 0) + 1; try { return yield* _sm.apply(this, a); } finally { Game.inMenu13--; } }; }
{ const _dp = dlgLogPush; dlgLogPush = function (name, text) { if (Game.inMenu13 > 0) return; return _dp(name, text); }; }

/* 技能清單的 MP・冷卻：技能樹的輔助技能升級後會省 MP、Lv5 冷卻 −1（說明寫的是升級後的數字，清單卻寫原本的：殘影步「MP10 CD3」vs「MP6・冷卻2」）。 */
{ const _cl = BB.costLabel; BB.costLabel = function (st, id, core, u) { const D = DEF.skills[id];
    if (core || !D || D.power || typeof treeOf11 !== 'function' || !treeOf11(id)) return _cl.call(this, st, id, core, u);
    const lv = Math.max(1, trLv11(id, st)), P = []; for (const c of D.costs || []) P.push(RES12_NAME(c.res) + (c.all ? (c.min ? '≥' + c.min : '') : c.res === 'mp' ? Math.max(0, Math.round(c.amount * (1 - 0.1 * (lv - 1)))) : c.amount));
    const cd = Math.max(0, (D.cooldown || 0) - (lv >= 5 ? 1 : 0)); if (cd > 0) P.push('CD' + cd); return P.join(' '); }; }

/* 鬥志（飾品詞綴）：職業退場後完全沒有效果（以前是「開場職業資源 +1」）→ 開場特技 +1 層；拳套的氣、雙盾的守勢也 +1。 */
if (DEF.passives.faSpirit) { const _mk = DEF.passives.faSpirit.make; DEF.passives.faSpirit.make = (v, u) => { const r = _mk(v, u) || {}; if (r.triggers && r.triggers.length) return r;
    return { triggers: [{ on: EVT.BATTLE_START, phase: 'POST', prio: -10, effects: ['wc', 'chi', 'stance'].map(res => ({ type: 'resource', target: 'self', res, amount: 1, why: 'start' })) }] }; }; }
if (typeof FA9 !== 'undefined' && FA9.f_spirit) FA9.f_spirit[4] = () => '開場特技 +1 層（拳套的氣、雙盾的守勢也 +1）';

/* 戰鬥說明 */
if (typeof BATTLE_HELP !== 'undefined') for (const b of BATTLE_HELP) {
  if (b[0] === '技能與冷卻') b[1] = b[1].map(t => t.replace('選單→技能→技能編排：最多放 4 個技能。', '選單→技能：最多放 4 個技能。'));
  if (b[0] === '多隻魔物') b[1] = b[1].map(t => /^範圍技能/.test(t) ? '範圍技能（旋刃、迴旋斧、炎浪…）一次打中全部，多個目標時每隻×75%。' : t);
  if (b[0] === '武器技能') b[1] = ['每種武器有自己的技能樹，只能用身上武器那棵樹的招。技能點＝等級×2＋主線頭目。', '特技：在技能樹學會、裝上一個。普攻累積層數，滿了自動發動（右下角的◆）。', '普攻不花 MP，命中回復 15% 的 MP；技能冷卻中就用普攻。', '短刀普攻 2 段、雙持時副手也出手。武器的屬性在鐵匠賦予。', '劍・斧・短刀配盾時，多一棵「單手盾」技能樹。']; }

/* 背包：部位素材的「取得」寫出是哪一隻菁英・頭目（以前是「？？？」） */
{ const _ms = matSourceText; matSourceText = function (m) { const P = typeof PART_OF11 !== 'undefined' && PART_OF11[m]; if (P && SPECIES[P.sp]) return SPECIES[P.sp].n + (P.rare ? '（稀有部位）' : '（打倒就掉）'); return _ms(m); }; }

/* 祕境探索的指引：說明裡括號寫的「（萌芽鎮東邊）」被當成目的地，在萌芽鎮就顯示「前往萌芽鎮（就在這裡）」。
   → 指向最近的、去過那張地圖但還沒走進的祕境入口（地圖邊緣的那一格）。報酬的「每處：」改成「每處都有」。 */
{ const _qd = questDest; questDest = function (q, st = Game.st) {
    if (!q || q.n !== '祕境探索' || q.done || typeof EXT_OPEN === 'undefined' || !st) return _qd(q, st);
    const L = Object.keys(EXT_OPEN).filter(m => !extSeen(m, st) && st.vis && st.vis[m]); if (!L.length) return _qd(q, st);
    const m = L.includes(st.map) ? st.map : nearestMap(L, st), o = EXT_OPEN[m]; if (!m || !o) return _qd(q, st);
    return m === st.map ? { map: m, spot: { x: o[0], y: o[1], name: EXT_AREA[m].name }, what: '前往' + EXT_AREA[m].name } : { map: m, what: '前往' + MAPS[m].name + '的祕境' }; }; }
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const q = L.find(q => q.n === '祕境探索'); if (q && q.rw === '每處：寶箱、採集點、天氣祠') q.rw = '每處都有寶箱、採集點、天氣祠'; }; }

/* 讀檔時 HP・MP 不超過上限（裝備換過的舊存檔會出現「HP 159/151」） */
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; if (st && st.equip) { try { const h = heroStats(st); if (st.hp > h.hp) st.hp = h.hp; if (st.mp != null && st.mp > h.mp) st.mp = h.mp; } catch (e) {} } return _so.apply(this, a); }; }

/* 用詞：道具說明的「恢復」統一成「回復」（狀態・效果都寫回復） */
for (const k in ITEMS) { const it = ITEMS[k]; if (it && typeof it.d === 'string' && /恢復\d|恢復[^原]/.test(it.d)) it.d = it.d.replace(/恢復(?!原狀)/g, '回復'); }
