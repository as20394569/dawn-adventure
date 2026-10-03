/* ===================== v12.0.9r 試玩後的其他問題（玩家 2026-10-04「好 都一起修正」） ===================== */

/* 1. 任務清單：主線排第一，再來是成長、委託、支線、隱藏（以前第三幕以後主線被擠到第 6 個） */
const QUEST_RANK9 = { 主線: 1, 成長: 2, 委託: 3, 支線: 4, 隱藏: 5 };
/* 2. 同一步出現兩次：「風車丘陵的異變」「碧溪谷的黑水」「北境之路」寫的和主線是同一件事 →
      進行中只留主線（報酬寫到主線的詳情裡），完成後照舊列在「已完成」。北境之路打完盜賊後的說明也改成鹿王。 */
const SUBMAIN9 = ['風車丘陵的異變', '碧溪谷的黑水', '北境之路'];
{ const _ql = questList; questList = function (st = Game.st) { let L = _ql(st); const f = st.flags || {}, M = L.find(q => q.main && !q.done);
    const N = L.find(q => q.n === '北境之路' && !q.done); if (N && f.passCamp && (f.passQ || 0) < 2) N.t = '【推薦Lv20】打倒擋在山頂的楓林鹿王，通過楓紅關道。';
    // 5. 「失落的貨物」：沒遇過商隊的人，進行中不列出（打倒格倫後照舊列在已完成）
    if (!f.caravanMet && !f.caravan) L = L.filter(q => !(q.n === '失落的貨物' && !q.done));
    if (M) L = L.filter(q => { if (q.done || q === M || !SUBMAIN9.includes(q.n)) return true; if (q.rw) M.rw = q.rw; return false; });
    const rank = q => q.main ? 0 : QUEST_RANK9[q.cat || (typeof questCatOf === 'function' && questCatOf(q))] || 6;
    return L.map((q, i) => [q, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(a => a[0]); }; }

/* 3. 指引：下一站就是目的地時不重複寫（以前是「前往碧溪谷→碧溪谷」「前往碧溪谷（先往碧溪谷）」） */
{ const _qg = questGuide; questGuide = function (...a) { const G = _qg.apply(this, a); if (G && G.next && G.route && G.route.length === 2 && G.route[1] === G.D.map) G.next = null; return G; }; }

/* 4. 旁白不掛名牌：「門上的古文字寫著：「…」」「遠處傳來諾拉的聲音：「…」」這種句子，以前會把前半當成說話的人 */
{ const _ds = dlgSetup; dlgSetup = function (text, o = {}) {
    const m = typeof text === 'string' && text.match(/^([^：「」\n（【。！？，]{1,10})：(?=「)/);
    if (!m || !/(寫著|刻著|聲音)$/.test(m[1])) return _ds(text, o);
    const T = Game.talker; Game.talker = null;
    try { const r = _ds(text.replace('：', ''), o); r.text = text; const E = typeof DLG_LOG !== 'undefined' && DLG_LOG[DLG_LOG.length - 1]; if (E && E.t.includes('')) E.t = E.t.replace('', '：'); return r; }
    finally { Game.talker = T; } }; }

/* 6. 廢棄礦坑的盜賊（菁英）再出現時站在往鐵斧格倫的通道上，打輸格倫走回來每次都被叫住 → 再出現的不會衝過來，想打就去找牠說話 */
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { _ld.apply(this, a);
    if (this.map && this.map.id === 'mine') for (const e of this.elites || []) if (e.rematch && /^thug/.test(e.id)) e.sight = 0; }; }

/* 7. 北方街道的盜賊頭目「黑羽」：莉婭說他躲在街道西側的樹林裡，其實站在大路旁 3 格，往王都走時靠左就會被叫住 → 搬到西邊的樹林裡 */
{ const e = (MAPS.northRoad.elites || []).find(q => q.id === 'blackFeather'); if (e) Object.assign(e, { x: 1, y: 13, dir: 'up', sight: 2 }); }

/* 8. 打倒鐵斧格倫後，礦坑之印要等離開礦坑才拿到，任務和指引一直停在「找鐵斧格倫」（另外兩個守護者打完會重新載入地圖，所以沒問題）
      → 守護者一倒下就交出古印。 */
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st;
    if (st && !this.script && Game.scene === this && typeof SEALS !== 'undefined' && SEALS.some(([fl, it]) => st.flags[fl] && !st.flags['got_' + it])) { const got = sealSync(st); if (got.length) Game.sealMsg = (Game.sealMsg || []).concat(got); }
    return _u.apply(this, a); }; }
