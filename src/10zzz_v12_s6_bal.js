/* ===================== v12.6 難度調整（巡檢清單 B2〜B8，玩家 2026-10-05「都照你建議的修正」；在護盾重製之後用模擬戰重測） =====================
   模擬：沒職業的冒險者、建議等級、同區紫裝、不帶飾品和晶石、3 瓶藥，會打破護盾也會防禦蓄力。
   B2 Lv35 以後收（熔岩巨人・魔人維克托・影將莫爾德）　B3 火龍幼體 HP 1458 → 約 900　B4 Lv23〜34 的菁英・洞窟之主拉高
   B5 霜之女王加強　B6 銀鱗水龍、B7 腐沼九頭蛇減弱　B8 打很久的（古岩魔像・水晶魔像・黯滅騎士長・熔岩騎士）HP 減少 */
{ const B = { golem: { hp: 0.7 }, crystalGolem: { hp: 0.7, pow: 0.9 }, duneWorm: { hp: 0.9, pow: 0.9 }, silverWyrm: { hp: 0.9, pow: 0.75 }, hydra: { pow: 0.85 },
    frostQueen: { hp: 1.4, pow: 1.25 }, lavaGiant: { hp: 0.72, pow: 0.63 }, victorDemon: { hp: 0.8, pow: 0.72 }, shadowGeneral: { hp: 0.85, pow: 0.9 } };
  const E = { youngDragon: { hp: 0.62, pow: 0.9 }, magmaNewt: { pow: 0.75 }, duskCaptain: { hp: 0.7 }, lavaKnight: { hp: 0.85 },
    boneKnight: { hp: 1.8, pow: 1.15 }, wraithGeneral: { hp: 1.8, pow: 1.15 }, blackFeather: { hp: 1.5, pow: 1.15 }, runeGolem: { hp: 2.5, pow: 1.15 },
    ramGhost: { hp: 1.5, pow: 1.15 }, boarKing: { hp: 1.5, pow: 1.15 }, hideoutBear: { hp: 1.5, pow: 1.15 }, termiteQueen: { hp: 1.5, pow: 1.15 },
    clockKnight: { hp: 1.5, pow: 1.15 }, snowBear: { hp: 1.5, pow: 1.15 }, frostLich: { hp: 1.5, pow: 1.15 }, iceMammoth: { hp: 1.5, pow: 1.15 } };
  const mix = (T, add) => { for (const k in add) { const o = T[k] || (T[k] = {}); for (const f of ['hp', 'pow']) if (add[k][f]) o[f] = Math.round((o[f] || 1) * add[k][f] * 1000) / 1000; } };
  mix(BOSS_TUNE11, B); mix(ELITE_TUNE11, E); }
