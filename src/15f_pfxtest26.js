/* ===================== v12.156 試做：特效測試分成「新特效區」和「舊特效區」 =====================
   玩家：「測試時 分開新舊特效區域」
   標題 →「特效測試」→ 先選區域：
   · 新特效：pixelfx 特效＋ZzFX 音效。只列有換新特效的：法杖（魔力箭・衝擊・風暴・奔流・天穹魔陣＋魔力護盾），
     和「護盾」：樹樁怪一開始就有很厚的護盾、而且會打你（攻擊力 1），用來看「打在護盾上」的半圓盾（先用魔力護盾，被打時看自己的盾）。
   · 舊特效：原本的特效和音效（原本整個特效測試選單：主角技能樹、菁英・頭目招式），方便對照；在裡面按取消回到選區域。
   回到標題選「一般遊戲」＝新特效。 */
const PFXT26 = { area: 'new', ward: false, back: false };
function pfxtSet26(on) { if (typeof PFX26 !== 'undefined') PFX26.on = on; if (typeof ZZ26 !== 'undefined') ZZ26.on = on; }
// 舊特效區＝原本整個特效測試選單（主角技能樹／菁英・頭目招式），在裡面按取消會回到這裡選區域
const PFXT_BACK26 = { back: 1 };
{ const _ch = choose; choose = function* (items, o) { const r = yield* _ch(items, o); if (r < 0 && PFXT26.back && o && /^特效測試/.test(o.title || '') && o.title !== '特效測試：選區域') throw PFXT_BACK26; return r; }; }
if (typeof fxtMenu13 === 'function') { const _old = fxtMenu13; fxtMenu13 = function* () { let a = 0;
  while (true) {
    const r = yield* choose([{ t: '新特效（試做）' }, { t: '舊特效（原本）' }], { x: 8, y: 30, w: W - 16, cancel: true, index: a, title: '特效測試：選區域' });
    if (r < 0) continue; a = r;
    if (r === 0) { yield* pfxtNew26(); continue; }
    pfxtSet26(false); PFXT26.area = 'old'; PFXT26.back = true;
    try { yield* _old(); } catch (e) { if (e !== PFXT_BACK26) throw e; } finally { PFXT26.back = false; pfxtSet26(true); PFXT26.area = 'new'; } } }; }
// 新特效區：只列有新特效的
function* pfxtNew26() { const L = [{ t: '法杖（5招＋魔力護盾）', k: '法杖', ward: false }, { t: '護盾（魔物有盾・會打你）', k: '法杖', ward: true }]; let i = 0;
  while (true) {
    const r = yield* choose(L.map(q => ({ t: q.t })), { x: 8, y: 30, w: W - 16, cancel: true, index: i, title: '新特效：選一項' });
    if (r < 0) return; i = r; yield* pfxtFight26(L[r].k, true, L[r].ward); } }
function* pfxtFight26(kind, on, ward) { pfxtSet26(on); PFXT26.area = on ? 'new' : 'old'; PFXT26.ward = ward;
  fxtSetup13(kind); FXT13.on = true; FXT13.kind = kind;
  try { yield* Game.scene.battleScript({ sp: 'stumpling', lv: 30, kind: 'wild', extra: [['stumpling', 30], ['stumpling', 30]], fxtest: 1 }); }
  finally { FXT13.on = false; PFXT26.ward = false; pfxtSet26(true); } }
// 「護盾」那一項：樹樁怪會行動（攻擊力 1、打不痛），每次輪到主角時，沒有護盾的樹樁怪補上一層很厚的護盾
{ const _d = BAI.decide; BAI.decide = function (core, u, o) { if (!(FXT13.on && PFXT26.ward && !u.hero)) return _d.call(this, core, u, o);
    FXT13.on = false; try { return _d.call(this, core, u, o); } finally { FXT13.on = true; } }; } // 特效測試平常讓樹樁怪不動；這一項讓牠們照常行動
{ const _c = Battle.prototype.command; Battle.prototype.command = function* () {
    if (FXT13.on && PFXT26.ward && typeof wardOpen12 === 'function') { const c = this.core;
      for (const u of c.alive('B')) if (!wardOf12(c, u)) wardOpen12(c, null, u, { pct: 0.01, abs: 1, turns: 9 }); } // 加進戰鬥紀錄，選完指令後跟著這次行動一起播
    return yield* _c.call(this); }; }
