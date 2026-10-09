/* ===================== v12.101 新特效放進正式版 =====================
   玩家 2026-10-10：「前面的重製都可以放入正式版了」→ 劍・雙劍・短刀・雙刀（之後的長槍也一樣）的高解析光效、中毒・麻痺的新畫面、
   快速連斬的黑影閃身，正式版預設開（12n 的 HD15.use(true)）。這個檔放在所有新特效模組後面，加兩道保險：
   ① 新特效的程式萬一出錯：記到內部錯誤清單、把這招的畫面直接結束（傷害照常跳），不會卡住戰鬥；
   ② 魔物用到這些招時（目前沒有，以防萬一）：用原本的舊特效（新特效是照主角的位置、主角的手畫的）。 */
const HDL19 = {};
HDL19.reset = b => { HD15.forceW = false; HD15.forceP = null; HD15.bladeHit = false; HD15.muteP = false; if (typeof DG17 !== 'undefined') { DG17.blue = false; DG17.mute = 0; } if (b && b.hd18hid && typeof HD18 !== 'undefined') HD18.appear(b); };
HDL19.guard = (key, F, oldOf) => { if (!F || F.hdl19) return F; const G = function* (U, T, u, ...a) {
    if (u && u !== this.H && !u.hero) { const O = oldOf(); if (O && O !== G) return yield* O.call(this, U, T, u, ...a); return; }
    try { return yield* F.call(this, U, T, u, ...a); } catch (e) { bvErr('v12.101', key + ': ' + (e && e.message)); HDL19.reset(this); } };
  G.hdl19 = 1; return G; };
for (const id of HD15.ids) { const k = id.slice(2), key = 'hd15_' + k, O = HD15.old[id] || {};
  if (FX[key]) FX[key] = HDL19.guard(key, FX[key], () => FX[O.fx] || FX.hit);
  if (FX[key + 'h']) FX[key + 'h'] = HDL19.guard(key + 'h', FX[key + 'h'], () => O.hitFx ? FX[O.hitFx] : null); }
for (const e of HD15.spKeys) e[1] = HDL19.guard(e[0], e[1], () => HD15.old[e[0]]);
// 普通攻擊、分段動作也一樣：出錯就記下來、這一下的畫面結束
{ const _wa = FX.wAtk; if (_wa) FX.wAtk = function* (...a) { try { return yield* _wa.apply(this, a); } catch (e) { bvErr('v12.101', 'wAtk: ' + (e && e.message)); HDL19.reset(this); } };
  const _sg = segSwing; segSwing = function* (b, ...a) { try { return yield* _sg(b, ...a); } catch (e) { bvErr('v12.101', 'segSwing: ' + (e && e.message)); HDL19.reset(b); } }; }
HD15.use(HD15.on);
