/* ===================== v12.47 自動試玩找到的兩個問題 ===================== */
// 1. 魔物群的額外獎勵從「全部素材」裡抽：一開始的晨霧道路就拿到藍鰭霸王（水域之主，賣 4000 G）、宰相魔印（頭目的稀有部位）。
//    → 改成這張地圖會出現的魔物身上的素材。
function packMat13(mats) { const st = Game.st, M = st && MAPS[st.map], S = new Set();
  for (const e of (M && M.encounters) || []) for (const r of e.table || []) { const sp = SPECIES[r[0]]; if (sp && sp.mat && ITEMS[sp.mat] && sp.mat !== 'crystal') S.add(sp.mat); }
  if (S.size) return pick([...S]);
  const F = (mats || []).filter(k => ITEMS[k] && ITEMS[k].cat !== '魚' && !/^pr_/.test(k) && MATCAT11[k]); return pick(F.length ? F : mats); }
// 2. Lv14 會跳出「劍士→劍聖、魔導士→大魔導士……」（v12 已經沒有職業了，舊的進階職業通知）。→ 沒有職業的存檔不再顯示。
{ const _aa = advAnnounce; advAnnounce = function* (...a) { const st = Game.st; if (st && (st.ncv12 || st.cls === NC12)) { st.flags.advTold = 1; return; } return yield* _aa.apply(this, a); }; }
// 3. the level-up message in battle still talked about 天賦點 and 選單→天賦 (retired with the classes): every level gives skill-tree points now
{ const _m = Battle.prototype.msg; Battle.prototype.msg = function* (text, ...a) { const st = Game.st;
    if (typeof text === 'string' && st && (st.ncv12 || st.cls === NC12)) {
      if (/^獲得了1點天賦點！MP也全部恢復了|^MP全部恢復了。（(下一級會得到天賦點|天賦點已達上限)/.test(text)) text = 'MP全部恢復，技能點 +' + (typeof LVPTS11 !== 'undefined' ? LVPTS11 : 2) + '！\n（選單→技能樹）';
      else if (/天賦覺醒/.test(text)) return; else text = ncTxt12(text); }
    return yield* _m.call(this, text, ...a); }; }
// 4. 狀態→技能一覽 still showed 「職業 冒險者」 and 「天賦：已投入 12／16 點」 (both retired): main weapon and skill-tree points instead
{ const _dp = drawPassiveInfo; drawPassiveInfo = function (x, st, X, Y, w) { if (!st || !(st.ncv12 || st.cls === NC12)) return _dp(x, st, X, Y, w);
    const k = typeof mainWKey === 'function' ? mainWKey(st) : null, mk = typeof mainKind11 === 'function' ? mainKind11(st) : null, dm = typeof dualMode11 === 'function' ? dualMode11(st) : null;
    const L = [['主武器　' + (mk || '—') + (dm ? '（' + dm + '）' : ''), UIC.warm, 10]];
    if (typeof trTotal11 === 'function') { const tot = trTotal11(st), left = trLeft11(st); L.push(['技能樹：用了 ' + (tot - left) + '／' + tot + ' 點' + (left ? '（還有 ' + left + ' 點）' : ''), left ? UIC.accent : '#c9cfe4', 9]); }
    const tr = equippedGear(st).map(g => GEAR[g.b] && GEAR[g.b].trait && ACC_TRAIT[GEAR[g.b].trait]).filter(Boolean).map(T => T[0]);
    L.push(['飾品特性：' + (tr.length ? tr.join('・') : '（沒有）'), tr.length ? UIC.text : UIC.muted, 9]);
    if (k && typeof WSK !== 'undefined' && WSK[k]) L.push(['特技「' + WSK[k].s.n + '」普通攻擊' + wsN(WSK[k].s, st) + '層發動', '#ffd860', 9]);
    const R = []; for (const [t, col, z0] of L) { let z = z0; while (z > 8 && Font.width(t, z) > w) z--; if (Font.width(t, z) <= w) R.push([t, col, z]); else for (const s of Font.wrap(t, w, 8)) R.push([s, col, 8]); }
    const dy = R.length > 5 ? 13 : 15; R.forEach(([t, col, z], i) => Font.draw(x, t, X, Y + i * dy + (i ? 1 : 0), col, UIC.textSh, z)); }; }
