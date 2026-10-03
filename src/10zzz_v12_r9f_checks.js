/* ===================== v12.0.9f 第九輪（六）：全面檢查找到的問題（玩家 2026-10-04「檢查有沒有其他bug 文字溢出 或是效果沒用」） =====================
   - 文字：天賦頁標題「天賦・大魔導士」等四個字的職業名會和天賦點疊在一起（10n，點數縮小字級）；兩隻魔物時上方的名牌互相蓋住（07a，名牌各自留在自己那一格）。
   - 魔劍士「水符」「草符」沒有作用（水屬性本來就會潮濕、草屬性本來就會纏繞）→ 改成對潮濕／纏繞的魔物傷害 +15%（玩家選的）。
   - 遊俠「先手」（使用搶先技能後獵印 +1）沒有職業技能能觸發 → 追獵刺變成搶先技能（玩家選的；10zzz_v12_r9d_skills.js 的 SK9 表）。 */
for (const [id, st, n] of [['spellblade.2.1.0', 'wet', '潮濕'], ['spellblade.2.1.1', 'tangle', '纏繞']]) { const T = DEF.talents[id]; if (!T) { bvErr('r9f', 'talent ' + id + ' missing'); continue; }
  const mods = [{ stage: 'talent', who: 'attacker', mul: 1.15, cond: { tgtStatus: st, hasPower: 1 } }];
  T.desc = '對' + n + '的魔物傷害 +15%'; T.make = () => ({ rules: {}, mods, triggers: [], immune: [] }); }
