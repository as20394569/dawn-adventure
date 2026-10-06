/* ===================== v12.26 完整走一輪的模擬之後：前期升級、素材點數、武器差距（玩家 2026-10-06：「聽你的 你來試試前兩項」） =====================
   模擬：從 Lv1 照地圖等級順序走，每張地圖第一次經過打掉六成魔物（另外試了四成・全打），打得到的菁英・頭目就打；算經驗・金錢・素材點數。
   1. 前期升級太慢（拿掉第一次討伐的大量經驗之後）：Lv8〜15 的菁英到的時候低 2〜3 級，要另外補練 5〜17 場；Lv16 以後靠「等級比魔物低經驗變多」自己追上。
      → 主角 Lv8 以下經驗 ×2、Lv9〜14 ×1.5，Lv15〜18 慢慢降回 ×1.0。（模擬：到達等級差在 1 級以內，打得少的玩家也只差 1〜2 級）
   2. 素材點數不夠：打造一件要 15×階級點，前期每個素材只值 1〜2 點 → Lv10 打 T3 時一件都打不起，T4〜T7 也只有 1.5〜2.5 件（共 5 件）。錢反而多到用不完。
      → 每個素材 +2 點（狼皮 1 → 3），打造一件 15×階級 → 12×階級（10t/5t → 8t/4t）。模擬：T3 時打得起 2 件、T4 3.5 件、T5 以後整套。
   3. 武器差距（紫裝打頭目）：法杖・樂器在 Lv30 以後的頭目常常 40 回合打不完——頭目每 3 回合和蓄力時都張護盾，魔法一下一下的打盾沒有倍率，傷害幾乎都被盾吃掉；
      雙劍・拳套・雙刀・火槍後期 7〜10 回合就打完。
      → 魔法攻擊打護盾 ×1.5（魔法本來就擅長消除護盾）；雙劍 ×0.85、拳套・雙刀・火槍 ×0.9 的傷害；雙盾的攻擊力 物防 60% → 70%；
        法杖・樂器 Lv20 以後每級傷害 +2.5%（樂器另外 ×1.1）、雙盾 Lv25 以後每級 +1.5%（後期的頭目魔防高、HP 多，原本這三種拖到 30〜40 回合）。 */
// 1. early levels
const expLow13 = lv => lv <= 8 ? 2 : lv <= 14 ? 1.5 : lv < 19 ? 1.5 - 0.5 * (lv - 14) / 5 : 1; // Lv8 以下 ×2（第一隻菁英磨石魔像 Lv8 前，風車丘陵的魔物只到 Lv7）
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { const st = Game.st, m = st ? expLow13(st.lv || 1) : 1; return yield* _ge.call(this, m !== 1 ? Math.max(1, Math.round(a * m)) : a); }; }
// 3. weapons
const WBAL13 = { dmg: { 雙劍: 0.85, 拳套: 0.9, 雙刀: 0.9, 火槍: 0.9, 樂器: 1.1 }, magicWard: 1.5,
  // 後期（Lv20 以後）法杖・樂器跟不上（Lv34〜40 的頭目魔防比物防高，打 40 回合還打不完）：每高 1 級傷害 +2.5%；雙盾 Lv25 以後每級 +1.5%
  lvUp: { 法杖: [20, 0.025], 樂器: [20, 0.025], 雙盾: [25, 0.015] } };
const wbalMul13 = (k, lv) => { const U = WBAL13.lvUp[k]; return (WBAL13.dmg[k] || 1) * (U ? 1 + Math.max(0, lv - U[0]) * U[1] : 1); };
WBAL12.shieldDef = 0.7; TREE11['雙盾'].mastD = '用盾攻擊時，攻擊力＝物防的 70%，每級 +3%';
{ const i = typeof GROW12 !== 'undefined' ? GROW12.findIndex(q => q[0] === '雙盾的攻擊') : -1; if (i >= 0) GROW12[i][1] = GROW12[i][1].replace('物防的 60%', '物防的 70%'); }
PV('wbal13', v => ({ mods: [{ stage: 'final', who: 'attacker', mul: v, cond: { hasPower: 1 } }] }));
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!st) return s; const k = dualMode11(st) || mainKind11(st), v = wbalMul13(k, st.lv || 1);
    if (v !== 1) s.passives.push({ key: 'wbal13', v, src: 'tree' }); return s; }; }
{ const _wm = wardMul12; wardMul12 = function (core, s, t, P) { const m = _wm(core, s, t, P); return P && P.cat === '特' ? m * WBAL13.magicWard : m; }; }
{ const fx = t => typeof t === 'string' ? t.replace('會心對護盾加倍，', '會心對護盾加倍、魔法攻擊 ×1.5，') : t;
  if (typeof WARD_HELP12 !== 'undefined') for (let i = 0; i < WARD_HELP12.length; i++) WARD_HELP12[i] = fx(WARD_HELP12[i]);
  if (typeof GROW12 !== 'undefined') for (const q of GROW12) q[1] = fx(q[1]); }
