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
