/* ===================== v12.31 掉落整理（玩家 2026-10-06：「目前怪物的掉落有異常的嗎」→ 選了三項） =====================
   1. 素材對上魔物：見 10zzq_v12_r7z_mats.js（雪原毛皮、新素材獸毛、大鯰→凝膠、岩角犀→硬石、四隻遊蕩菁英照遭遇卡給素材）。
   2. 後期素材點數照地區算：素材的點數照它最早出現的地區算（羽毛 3 點），後期的鳥・凝膠・骨片・燼核…掉的還是前期素材，
      在 T6 地區打一場只拿到同區素材一半不到的點數。→ 在比素材高階的地區打到時多掉幾個，點數跟當地素材差不多
      （地區的階級＝這張地圖最低的魔物等級，跟素材自己的階級同一套算法；挑戰區的魔物比較高級，所以也會多掉）。
   3. 遊蕩菁英（晶甲巨鱷・遺跡守衛・瘴氣狼王・熔岩騎士）：招牌裝備只有第一次打倒才掉 → 之後每次打倒 20% 掉。
      順便：原本第一次掉的是藍色（設計圖時代留下來的「品質 1」），照「給設計圖的地方改成紅色以上底裝＋外觀」改成紅色。
   另外：圖鑑的掉落頁還寫「普通魔物不會掉裝備」「首次擊敗：…的設計圖」→ 照現在的掉落改寫。 */
// 1. the new material counts as 獸材
MATCAT11.beastFur = '獸材'; if (!MATT11.beastFur) MATT11.beastFur = 1;
// 2. early materials from a later region come in bigger numbers
const regionT13 = (id, L) => { const M = MAPS[id]; let lo = 99; for (const e of (M && M.encounters) || []) for (const r of e.table || []) lo = Math.min(lo, r[1]);
  if (lo === 99) for (const v of L || []) if (v && v.lv) lo = Math.min(lo, v.lv); return lo < 99 ? lvTier11(lo) : 0; };
function matRegion13(gained, L) { const st = Game.st, R = regionT13(Game.ow && Game.ow.map && Game.ow.map.id, L); if (!R || !st) return;
  for (const k in gained) { const t = MATT11[k] || 1; if (!MATCAT11[k] || t >= R || !(gained[k] > 0)) continue;
    const x = gained[k] * (tierPts11(R) / tierPts11(t) - 1), n = Math.floor(x) + (chance(x - Math.floor(x)) ? 1 : 0); if (n > 0) { st.bag[k] = (st.bag[k] || 0) + n; gained[k] += n; } } }
// 3. the roaming elites: their signature piece at 20% every time, red
const ROAM13 = new Set(Object.values(ROAM).map(r => r[0])), ROAMSIG13 = 0.2;
const roamSig13 = (key, sp) => { const s = sigOf10(key, sp), k = s && classGear(s); return k && GEAR[k] ? k : null; };
{ const _ld = lootDrops; lootDrops = function (b) { const F = b.F || {}; if (!F.elite || !ROAM13.has(F.sp)) return _ld(b);
    const st = Game.st, key = (b.cfg && b.cfg.id) || F.sp, again = !!((st.kills || {})[key]) || !!(b.cfg && b.cfg.rematch), r = _ld(b);
    if (again && chance(ROAMSIG13)) { const k = roamSig13(key, F.sp); if (k) r.push(makeGear(k, 3)); }
    for (const g of r) g.q = Math.max(g.q || 1, 3); return r; }; }
const roamSigText13 = (key, sp) => { const k = roamSig13(key, sp); if (!k) return ''; const got = !!((Game.st.kills || {})[key]);
  return '招牌：' + rareName13(k) + '（紅色' + (got ? '，每次 20%）' : '，第一次必掉，之後每次 20%）'); };
{ const _lh = lootHint; lootHint = function (key, sp) { if (!ROAM13.has(sp)) return _lh(key, sp); return roamSigText13(key || sp, sp); }; }
// the 素材 line for help
{ const i = GROW12.findIndex(q => q[0] === '素材點數與鐵匠'); if (i >= 0 && !/多掉幾個/.test(GROW12[i][1])) GROW12[i][1] += '後期的地區打到前期就有的素材（羽毛・凝膠・骨片…）會多掉幾個，換到的點數跟當地的素材差不多。'; }
