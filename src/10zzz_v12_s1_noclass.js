/* ===================== v12.1 職業退場（玩家 2026-10-04「我想把職業系統拿掉」→ 企劃〈職業退場清單〉，決定 1〜4 照建議，名字「另外取、都用新的」，其他交給 Claude） =====================
   ・主角不再有職業：內部用一個空的「冒險者」（adventurer）代替，招牌招・職業資源・職業被動・武器親和・職業技能庫・天賦全部不再作用。
   ・招式只來自技能樹：武器樹（含第四段「絕技」）＋共通樹「戰技・護身・輔佐」（r9x）。技能點＝等級×2＋主線頭目；主角基礎傷害 +20%（補職業被動）。
   ・覺醒的儀式改成選第一把武器（9 種，T1 底裝・紅色品質），那棵樹的特性直接學會。轉職改成技能樹重置；上級職業・隱藏職業的任務改成解鎖絕技。
   ・舊存檔：職業拿掉，用練度學會的職業技能每招退 1 點技能點，天賦清掉（共通樹重新點），已解鎖的上級・隱藏職業直接算解鎖了絕技。 */
const NC12 = 'adventurer';
CLASSES[NC12] = { n: '冒險者', tier: 1, st: {}, d: '' };
CT[NC12] = [];
CLASS_START[NC12] = { moves: [], gear: ['guardBadge'], tag: '', bars: {}, pitch: '' };
if (typeof CLASS_FREE !== 'undefined') CLASS_FREE[NC12] = [];
defPut('mechanics', 'cls_' + NC12, { make: () => ({ mods: [], triggers: [] }), layer: 'class', metadata: { cls: NC12 } });
defPut('classes', NC12, { sig: null, resources: [], res: null, affinity: [], passive: { n: '', d: '' }, rule: '', limit: '', mechanic: 'cls_' + NC12, tags: [], metadata: { n: '冒險者' } });
{ const KT = { 劍: 'swordsman', 短刀: 'ranger', 斧: 'swordsman', 長槍: 'dragoon', 拳套: 'monk', 法杖: 'mage', 魔導書: 'mage', 樂器: 'bard', 火槍: 'machinist' };
  Object.defineProperty(ATTR_TEMPLATE, NC12, { configurable: true, get: () => ATTR_TEMPLATE[KT[mainKind11(Game.st)]] || ATTR_TEMPLATE._ }); }

/* ---------- 戰鬥：只剩技能樹 ---------- */
PV('nc12', v => ({ mods: [{ stage: 'equipment', who: 'attacker', mul: 1 + v / 100, cond: { hasPower: 1 } }] }), { n: '冒險者' });
TAL12.ids = function (st = Game.st) { if (!st) return []; const out = [];
  for (const k of COMMON11) for (const N of TREE11[k].nodes) { const E = N[5]; if (E.tal && trLv11('cm:' + N[0], st) > 0 && DEF.talents[E.tal]) out.push(E.tal); } return out; };
BB.classGrant = () => [];
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!st) return s;
    s.cls = NC12; s.sig = false; s.data.sigSkill = null; s.skills = s.skills.filter(id => !/^sig_/.test(id));
    s.data.mechanics = s.data.mechanics.filter(m => !/^cls_|^pw12_|^cls9/.test(m));
    s.passives = s.passives.filter(p => p.src !== 'class' && p.key !== 'affinity'); s.passives.push({ key: 'nc12', v: 20, src: 'base' });
    return s; }; }

/* ---------- 覺醒的儀式：選第一把武器 ---------- */
const START_KINDS12 = ['劍', '短刀', '斧', '長槍', '拳套', '法杖', '魔導書', '樂器', '火槍'];
const START_TXT12 = { 劍: '均衡的近身武器，會心時削護盾。', 短刀: '出手快，普攻打兩下，容易讓對手中毒、麻痺。', 斧: '一擊很重，普攻也能削護盾。', 長槍: '突刺無視物防，打頭目的部位更痛。',
  拳套: '普攻打兩下，打中累積「氣」，氣滿必定會心。', 法杖: '魔法攻擊，打弱點更痛。', 魔導書: '魔法和詛咒，連續用法術也不容易被魔物「慣」。', 樂器: '用歌聲強化自己，強化效果多持續 1 回合。', 火槍: '遠距射擊，第一回合一定先手。' };
let NC_PICK12 = null;
classSelectScreen = function* () {
  while (true) { const i = yield* ask('選一把武器吧。之後隨時都能換別的武器、學別的技能樹。', START_KINDS12.map(k => k));
    const k = START_KINDS12[Math.max(0, i)];
    if (yield* yesNo('「' + k + '」：' + START_TXT12[k] + '\n就選這個嗎？')) { NC_PICK12 = k; CLASS_START[NC12].gear = [BASE11.weapon[k][0], 'guardBadge']; return NC12; } } };
{ const _as = applyStartClass; applyStartClass = function (k) { _as(NC12); const st = Game.st, kind = NC_PICK12 || '劍';
    const old = gearBy(st.equip.weapon, st); if (old) st.gear = st.gear.filter(g => g !== old); GEAR11_GLAM = false; const g = makeGear(BASE11.weapon[kind][0], 3); GEAR11_GLAM = true; st.equip.weapon = g.u;
    const T = tr11(st); if (!T.lv[kind + ':trait']) { T.lv[kind + ':trait'] = 1; st.trRef11 = (st.trRef11 || 0) + 1; } st.cls = NC12; st.ncv12 = 1; clampHP(); }; }
// the elder's lines that talked about classes
const NC_TXT12 = [
  [/技能來自職業和武器。/g, '技能來自武器的技能樹。'],
  [/每個職業都有自己的核心資源，戰鬥中會累積起來，用來施放.*?的職業招式。/g, '打開選單的「技能樹」用技能點學招式；換一種武器就換一棵樹。戰技・護身・輔佐三棵共通樹，用什麼武器都有效。'],
  [/覺醒成為了冒險者！/g, '覺醒了異界人之力！'],
  [/覺醒了隱藏職業「異界勇者」！（找村長轉職）/g, '解鎖了戰技樹的絕技「晨曦之刃」「雙相斬」！'],
  [/要繼承「魔劍士」的道路嗎？\n（隨時也能找村長轉職）/g, '要學流浪魔劍士的劍技嗎？'],
  [/魔劍士的天賦能讓物攻與魔攻互相加成（魔劍共鳴）。試著配一把劍和一本魔導書吧。/g, '解鎖了絕技「星紋魔劍」（劍技能樹）和「黑曜終劍」（雙劍技能樹）！'],
  [/職業的事也可以找我——王都有好幾個「上級職業」的導師，完成他們的試煉就能轉職。/g, '王都有好幾位導師，完成他們的試煉就能學到絕技。'],
  [/去公會轉職吧，我的學生。/g, '把那段旋律練熟吧，我的學生。'],
  [/你有資格走上這條路了。到冒險者公會找公會長轉職吧。/g, '你有資格學詩人公會的歌了。'],
  [/到王都的冒險者公會轉職吧。/g, ''],
  [/到冒險者公會轉職吧。/g, ''],
  [/完成：成為(吟遊詩人|機工士|武僧|龍騎士)的資格。（到冒險者公會轉職）/g, '完成：學會了$1的絕技。'],
  [/上級職業「(吟遊詩人|機工士|武僧|龍騎士)」/g, '$1的絕技'],
  [/覺醒了隱藏職業/g, '解鎖了絕技'],
  [/隱藏職業「異界勇者」/g, '絕技「晨曦之刃」「雙相斬」'], [/隱藏職業「魔劍士」/g, '絕技「星紋魔劍」「黑曜終劍」'], [/繼承了魔劍之道/g, '學到了魔劍士的劍技'],
  [/天賦之書|修練之書/g, '秘傳之書'],
  [/天賦選錯的話/g, '技能樹點錯的話'],
];
const ncTxt12 = s => { if (typeof s !== 'string') return s; for (const [a, b] of NC_TXT12) s = s.replace(a, b); return s; };
{ const _say = say; say = function* (text, o) { if (text == null && NC_PICK12) { text = '「' + NC_PICK12 + '」嗎……這把武器就交給你了。'; NC_PICK12 = null; } if (text == null) return; text = ncTxt12(text); if (!text) return; yield* _say(text, o); }; }
{ const _ask = ask; ask = function* (text, opts, o) { return yield* _ask(ncTxt12(text), opts, o); }; }
{ const _ig = itemGet; itemGet = function* (text, ...a) { yield* _ig(ncTxt12(text), ...a); }; }

/* ---------- 村長・公會：轉職改成技能樹重置 ---------- */
classTalk = function* () { const st = Game.st; if (!st.cls) { const k = yield* classSelectScreen(); applyStartClass(k); return true; }
  if (st.lv < 14) return false; const r = yield* ask('要做什麼？', ['技能樹重置', '聊天']); if (r !== 0) return false; yield* treeReset11(); return true; };
ch2ClassTalk = function* () { const st = Game.st, f = st.flags, n = ['clsBard', 'clsMachinist', 'clsMonk', 'clsDragoon'].filter(k => f[k]).length;
  yield* say('王都的導師們都有自己的絕活。完成他們的試煉，就能學到技能樹的「絕技」。' + (n ? '\n（已經解鎖 ' + n + '/4 位導師的絕技）' : '\n（詩人公會・鐘錶師・雪峰寺・龍騎士老人）')); };
// a teacher's flag turned on → say which 絕技 opened
const ZJ_OF12 = { clsBard: ['迴響序曲', '終章頌歌', '樂器'], clsMachinist: ['齒輪砲台', '赤焰彈', '火槍'], clsMonk: ['千手寸勁', '沖天拳', '拳套'], clsDragoon: ['蒼龍躍', '流星龍墜', '長槍'], hiddenCls: ['晨曦之刃', '雙相斬', '戰技'], spellbladeOk: ['星紋魔劍', '黑曜終劍', '劍・雙劍'] };
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st, f = st && st.flags;
    if (f && !this.script && !UI.stack.length && !Game.trans) { const told = f.zjTold12 || (f.zjTold12 = {}); const k = Object.keys(ZJ_OF12).find(q => f[q] && !told[q]);
      if (k) { told[k] = 1; const [x1, x2, tr] = ZJ_OF12[k]; this.run((function* () { yield* itemGet('解鎖了絕技「' + x1 + '」「' + x2 + '」！（' + tr + '技能樹，Lv35 開放）'); })()); return; } }
    return _u.apply(this, a); }; }
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); for (const q of L) { q.t = ncTxt12(q.t); if (q.rw) q.rw = ncTxt12(q.rw); } }; }
for (const k in QUEST_CATS) if (QUEST_CATS[k] === '職業') QUEST_CATS[k] = '絕技';
for (const A of ACHIEVEMENTS) { if (A.id === 'master') Object.assign(A, { n: '絕技傳承', d: '學會一個絕技。', ok: st => zjLearned12(st) >= 1 }); if (A.id === 'allMaster') Object.assign(A, { d: '學會全部 20 個絕技。', ok: st => zjLearned12(st) >= 20 }); }
const zjLearned12 = (st = Game.st) => Object.keys(tr11(st).lv).filter(k => /^t_(zj|cmDawn|cmTwin)/.test(k) && tr11(st).lv[k] > 0).length;

/* ---------- 選單：「天賦」換成「技能樹」 ---------- */
talentScreen = function* () { yield* treeScreen11(COMMON11[0]); };

// the main menu of 09o with 「天賦」 → 「技能樹」
{ const TILES = [['狀態', '能力・技能'], ['冒險手冊', '任務・圖鑑・紀錄'], ['屬性', '自由加點'], ['技能', '技能・編排'], ['技能樹', '武器・共通'], ['背包', '道具・素材'], ['裝備', '更換・詳情'], ['存檔', '記錄進度'], ['設定', '音量・速度'], ['關閉', '回到遊戲']]; // v12.0.2: 任務・圖鑑・紀錄 → 冒險手冊 (10zzi)
  startMenu = function* () {
    Sound.sfx('menu'); let idx = Game.menuIdx || 0;
    while (true) {
      const st = Game.st, s = heroStats();
      const hdr = { draw(x) { x.fillStyle = 'rgba(8,10,20,0.78)'; x.fillRect(0, 0, W, H); drawWin(x, 4, 4, 168, 40, 'menu'); x.drawImage(heroFramesFor(st).down[0], 0, 0, 16, 22, 10, 8, 24, 33);
        const nx = Font.draw(x, st.name, 40, 3, UIC.text, UIC.textSh, 11); Font.drawR(x, 'Lv' + st.lv, 166, 3, UIC.accent, UIC.textSh, 11); // v12.0.1: rows fit the box
        Font.draw(x, 'HP ' + st.hp + '/' + s.hp, 40, 16, UIC.good, UIC.textSh, 9); Font.draw(x, 'MP ' + (st.mp ?? s.mp) + '/' + s.mp, 96, 16, '#86b4ff', UIC.textSh, 9); Font.drawR(x, st.money + ' G', 166, 27, UIC.warm, UIC.textSh, 9);
        if (typeof dnMenuLoc12 === 'function') dnMenuLoc12(x, st, 40, 27, 166 - Font.width(st.money + ' G', 10)); else Font.draw(x, MAPS[st.map] ? MAPS[st.map].name || '' : '', 40, 27, UIC.muted, UIC.textSh, 9); } };
      UI.push(hdr);
      const items = TILES.map(([t, sub]) => ({ t: '', name: t, dot: (t === '技能樹' && trLeft11(st) > 0) || (t === '屬性' && attrAvail(st) > 0), sub }));
      const r = yield* choose(items, { x: 4, y: 48, w: 168, h: 204, cols: 2, colW: 82, rowH: 33, ox: 4, oy: 3, buttons: true, style: 'menu', index: Math.min(idx, items.length - 1), drawExtra: (x, m) => { for (let k = 0; k < items.length; k++) { const c = k % 2, rr = Math.floor(k / 2), X = m.x + m.ox + c * m.colW, Y = m.y + m.oy + rr * m.rowH, on = k === m.i; Font.drawC(x, items[k].name, X + 39, Y + 1, on ? UIC.text : '#c9cfe4', UIC.textSh, 12); Font.drawC(x, items[k].sub, X + 39, Y + 16, on ? UIC.accent : UIC.muted, UIC.textSh, 8); if (items[k].dot) { x.fillStyle = UIC.warm; x.fillRect(X + 70, Y + 4, 4, 4); } } } });
      UI.remove(hdr);
      const name = r >= 0 ? TILES[r][0] : '關閉'; if (name === '關閉') break; idx = r; Game.menuIdx = r;
      if (name === '狀態') yield* summaryScreen(); if (name === '任務') yield* questScreen(); if (name === '屬性') yield* attrScreen(); if (name === '技能') yield* skillTreeScreen(); if (name === '技能樹') yield* treeScreen11();
      if (name === '背包') { yield* bagScreen('field'); if (Game.homeWarp) break; }
      if (name === '裝備') yield* equipScreen(); if (name === '冒險手冊') yield* handbookScreen12();
      if (name === '存檔') { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } }
      if (name === '設定') yield* optionsScreen();
    }
    if (Game.homeWarp && Game.ow) { Game.homeWarp = 0; yield* Game.ow.homeWarp(); }
  };
}


/* ---------- 說明 ---------- */
for (let i = GROW12.length - 1; i >= 0; i--) if (/職業|天賦/.test(GROW12[i][0])) GROW12.splice(i, 1);
GROW12.push(['絕技', '每棵武器技能樹的第四段（Lv35，要第三段任一招 Lv3）。王都的導師・初代勇者的試煉・失落的劍譜，完成後會解鎖對應的絕技。'],
  ['共通技能樹', '戰技・護身・輔佐三棵，用什麼武器都有效，跟武器樹用同一種技能點。選單的「技能樹」可以切換。']);
for (const b of GROW12) if (b[0] === '武器技能樹') b[1] = '每種武器有自己的技能樹（選單→技能樹）。技能點＝等級×2＋主線頭目各 1 點；只能用身上武器那棵樹的招，共通樹一直有效。副手欄放同種的第二把短刀（雙刀）或劍（雙劍），或主手、副手都拿盾（雙盾），就能用雙持的樹。';
if (typeof BATTLE_HELP !== 'undefined') { for (let i = BATTLE_HELP.length - 1; i >= 0; i--) if (/職業/.test(BATTLE_HELP[i][0])) BATTLE_HELP.splice(i, 1);
  for (const b of BATTLE_HELP) if (Array.isArray(b[1])) b[1] = b[1].map(t => t.replace(/技能來自職業（等級到了學會）和武器（裝備就能用，用滿 6／10／14 次永久學會）。/, '技能來自技能樹：身上武器那棵樹和共通樹。').replace(/（守護者的「守護之盾」再減30%）/, '')
    .replace(/技能來自職業（等級到了學會，只在那個職業能用）和武器技能樹（用技能點學，只能用身上武器那棵樹的招）。職業技能每用一次練度 \+1：.*$/, '技能來自技能樹：身上武器那棵樹（用技能點學）和戰技・護身・輔佐三棵共通樹。')
    .replace(/選單→技能編排：職業招式固定一格，再放 4 個技能。/, '選單→技能→技能編排：最多放 4 個技能。').replace(/戰鬥中能用：職業招式＋最多4個技能槽。/, '戰鬥中能用：最多 4 個技能槽。')
    .replace(/技能點＝等級＋主線頭目各 1 點/g, '技能點＝等級×2＋主線頭目各 1 點').replace(/選單→技能→武器技能樹/g, '選單→技能樹'));
  BATTLE_HELP.push(['武器的資源', ['拳套學會特性後有「氣」：打中累積，滿 5 點時下一擊必定會心；千手寸勁會用掉全部的氣。', '雙盾學會特性後有「守勢」：被攻擊時累積，聖壁衝鋒會用掉。', '火槍學會特性後，齒輪砲台設下的砲台每回合結束自動射擊。']]); }

/* ---------- 舊存檔 ---------- */
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; let L = null;
    if (st && st.cls && st.cls !== NC12 && !st.ncv12) { st.ncv12 = 1; const was = (CLASSES[st.cls] || {}).n || '';
      let n = 0, n1 = 0; for (const k in st.skillLib || {}) { const e = st.skillLib[k]; if (!e || !e.learned) continue; if (k.startsWith('u_') || (ORB_A[k] && !SK9_CLS[k])) n1++; else n++; }
      if (st.tr11v) n1 = 0; else { st.tr11v = 1; tr11(st); st.trRef11 = 0; delete st.sub; } // 還沒經過 v259 武器技能退場的存檔：一起處理、一起說明
      const nb = st.tpRead || 0; n += n1 + nb; st.trRef11 = (st.trRef11 || 0) + n; st.cls = NC12; st.flags.deep = 1; st.slots = (st.slots || []).filter(id => treeOf11(id));
      L = ['（職業系統拿掉了！）', '原本的職業' + (was ? '「' + was + '」' : '') + '收起來了，招式都來自技能樹：武器樹（第四段是「絕技」）和戰技・護身・輔佐三棵共通樹。',
        '技能點改成等級×2＋主線頭目' + (n ? '；' + ['學會過的職業技能', n1 ? '武器技能' : '', nb ? '讀過的書' : ''].filter(Boolean).join('・') + '退還 ' + n + ' 點' : '') + '。天賦清掉了，請到「技能樹」重新點共通樹。'];
      const f = st.flags, got = Object.keys(ZJ_OF12).filter(q => f[q]); if (got.length) L.push('已經解鎖的上級・隱藏職業，改成解鎖了那個職業的絕技。'); (f.zjTold12 || (f.zjTold12 = {})); for (const q of got) f.zjTold12[q] = 1; }
    if (st && !st.cls) st.ncv12 = 1; if (st && st.flags && st.ncv12) st.flags.deep = 1;
    const ow = _so.apply(this, a); if (L && ow && ow.run) ow.run((function* () { yield* wait(40); yield* sayAll(L); })()); return ow; }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.ncv12 = 1; st.flags.deep = 1; } return st; }; }

/* ---------- 天賦・練度留下的東西 ----------
   ・天賦覺醒沒有了：一律當作已完成（村長頭上的「!」、Lv14 的提示、教學都不再出現），任務「更高的道路」拿掉，成就「更高的道路」改成學會第三段的招式。
   ・天賦之書・修練之書 → 「秘傳之書」：讀完技能點 +1（每 8 級能多讀 1 本）。修練之書會自動換成秘傳之書。
   ・遺忘之書：技能樹重置用（第一次免費；之後用遺忘之書，沒有的話用重生之水）。 */
for (let i = HINT12.length - 1; i >= 0; i--) if (/^h12(tal|deep)$/.test(HINT12[i][0])) HINT12.splice(i, 1);
for (let i = GROW12.length - 1; i >= 0; i--) if (GROW12[i][0] === '技能練度') GROW12.splice(i, 1);
{ const tier3 = st => { const lv = tr11(st).lv; return TREE_KINDS11.some(k => (TREE11[k].sk || []).some(r => r[0][0] === '3' && lv['t_' + r[1]] > 0)); };
  for (const A of ACHIEVEMENTS) if (A.id === 'cls2') Object.assign(A, { d: '學會技能樹第三段的招式。', ok: st => tier3(st) }); }
{ const _ql = questList; questList = function (st = Game.st) { const L = _ql(st).filter(q => q.n !== '更高的道路');
    for (const q of L) { if (q.n === '力量的覺醒') { q.t = '村長好像有話要跟你說。（選第一把武器）'; q.rw = '第一把武器'; } q.t = ncTxt12(q.t); if (q.rw) q.rw = ncTxt12(q.rw); } return L; }; }
const BOOK_D12 = '記載著古老修練法的書。讀完技能點 +1。（每 8 級能多讀 1 本）';
Object.assign(ITEMS.tpBook, { n: '秘傳之書', d: BOOK_D12 + '（每買一本會漲價）' });
Object.assign(ITEMS.trainBook, { n: '秘傳之書', use: 'tp', d: BOOK_D12 });
Object.assign(ITEMS.talentReset, { d: '把技能樹的點數全部收回來重新分配。（選單→技能樹→「重置」；第一次免費）' });
{ const _ib = itemBlockMsg; itemBlockMsg = function (k, st = Game.st) { const it = ITEMS[k]; if (it && it.use === 'tp') { const n = st.tpRead || 0, cap = bookCap(st); return n < cap ? null : '現在的修為還讀不懂更深的內容。\n（已讀' + n + '本／目前上限' + cap + '本；Lv' + (cap + 1) * 8 + '可以再讀）'; } return _ib(k, st); }; }
{ const _ui = useItem; useItem = function (k) { const it = ITEMS[k]; if (!it || it.use !== 'tp') return _ui(k); const st = Game.st; if (!canUseItem(k)) return null;
    st.bag[k]--; if (!st.bag[k]) delete st.bag[k]; st.tpRead = (st.tpRead || 0) + 1; st.trRef11 = (st.trRef11 || 0) + 1; return st.name + '讀完了秘傳之書，技能點 +1！'; }; }
{ const _sf = shopFlow; shopFlow = function* (stock, ...a) { if (Array.isArray(stock)) stock = stock.map(k => k === 'trainBook' ? 'tpBook' : k).filter((k, i, A) => A.indexOf(k) === i); return yield* _sf.call(this, stock, ...a); }; }
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const b = this.st && this.st.bag; if (b && b.trainBook) { b.tpBook = (b.tpBook || 0) + b.trainBook; delete b.trainBook; } return _u.apply(this, a); }; }
treeReset11 = function* () { const st = Game.st, T = tr11(st); if (!trSpent11(st)) { yield* say('還沒有用掉任何技能點。'); return; }
  const free = !(T.rs > 0), bag = st.bag || {}, item = bag.talentReset ? 'talentReset' : bag.attrReset ? 'attrReset' : null;
  if (!free && !item) { yield* say('第二次以後的重置要用「遺忘之書」。\n（道具店有賣）'); return; }
  if (!(yield* yesNo('把全部技能點收回來嗎？' + (free ? '（第一次免費）' : '（用掉 1 個' + ITEMS[item].n + '）')))) return;
  if (!free) { bag[item]--; if (!bag[item]) delete bag[item]; } T.lv = {}; T.eq = {}; T.rs = (T.rs || 0) + 1; st.slots = (st.slots || []).filter(id => !treeOf11(id)); clampHP(); Sound.jingle('item'); yield* say('技能點全部收回來了。'); };

/* ---------- 戰鬥畫面：HP 列上方改成顯示武器的資源（拳套的氣・雙盾的守勢・火槍的砲台） ---------- */
{ const _dr = Battle.prototype.drawClassRes; Battle.prototype.drawClassRes = function (x, gauge, gy) { const u = this.core && this.core.byId.H, Hv = this.H; if (!u || u.cls !== NC12 || !Hv) return _dr.call(this, x, gauge, gy);
    for (const r of ['chi', 'stance']) if (Hv.max && (Hv.max[r] || 0) > 0) { const n = (Hv.res && Hv.res[r]) || 0, N = Hv.max[r]; gauge(RES12_NAME(r), n, N, gy, n >= N, n >= N && r === 'chi'); return; }
    const t = Math.max(0, (Hv.st && Hv.st.turret) || 0); if (t > 0) gauge('砲台', t, Math.max(t, 3), gy, true, false); }; }
