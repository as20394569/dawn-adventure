/* ===================== v12.9 菁英・頭目打久一點（玩家 2026-10-05：「boss與菁英我還是不希望玩家攻略太快」） =====================
   三題都選建議：跟上進度的玩家（紅裝・2 飾品・2 顆 ★1 晶石）菁英 8〜10、頭目 15〜18 回合；加 HP＋機制更密；
   裝備沒跟上（紫裝・沒飾品・沒晶石）打得贏但很辛苦（勝率約 50〜70%）。
   · 機制更密：頭目 HP 75%・50%・25% 各張一次護盾（原本 70%・40%），菁英 66%・33%（原本 50%）；頭目每 3 回合張一次（原本 4）。
   · HP：每隻照模擬的回合數調到目標（LONG12，乘在原本的調整上）；第二・三輪把太危險的頭目攻擊收一點、太輕鬆的菁英攻擊加一點。
   模擬（劍・長槍・魔導書・雙刀，含洞窟之主）調整後：頭目 跟上 15.8 回合・勝 98%｜沒跟上 25.3 回合・勝 68%（用藥 2.3 瓶）；
   菁英 跟上 9.1 回合・勝 100%｜沒跟上 14.9 回合・勝 94%（用藥 1.2 瓶）。 */
Object.assign(WARD12.foe.hpTh, { boss: [0.75, 0.5, 0.25], elite: [0.66, 0.33] });
WARD12.foe.everyBoss = 3;
{ const P = BattleCore.prototype, _em = P.emit; P.emit = function (type, o = {}, main = null) { const e = _em.call(this, type, o, main);
    // bosses: the fixed shield comes every 3 rounds (the 4-round check above still covers elites)
    if (type === EVT.ACTION_END && o.src && o.src.boss && wardFoe12(o.src) && o.payload && o.payload.executed && !o.payload.reaction) { const u = o.src;
      if (this.isUp(u) && !this.hasStatus(u, 'broken') && !this.hasStatus(u, 'charging') && !wardOf12(this, u) && this.round - (u.data.wardR12 || 0) >= WARD12.foe.everyBoss)
        wardOpen12(this, u, u, { pct: WARD12.foe.everyPct, abs: 1, turns: 1, why: 'every' }); }
    return e; }; }
const LONG12 = { boss: {"banditBoss": 1.3, "duneWorm": 1.45, "golem": 1.56, "crystalGolem": 1.29, "silverWyrm": 1.23, "hydra": 3.06, "ratKing": 2.62, "harvestGolem": 3.5, "clockColossus": 3, "frostQueen": 1.57, "lavaGiant": 1.62, "victorDemon": 1.47, "shadowGeneral": 1.09},
  elite: {"wolf": 1.43, "blackCatfish": 0.6, "mossGiant": 0.6, "bandit": 1.43, "rockRhino": 0.86, "lizardChief": 1.14, "ruinWarden": 0.65, "crystalCroc": 0.62, "stagLord": 0.84, "bogWitch": 1.29, "boneKnight": 1.2, "wraithGeneral": 1.23, "blackFeather": 2.14, "runeGolem": 2.09, "boarKing": 1.53, "miasmaWolf": 1.58, "clockKnight": 1.53, "snowBear": 1.61, "frostLich": 1.5, "youngDragon": 0.87, "rockPangolin": 1.43, "rootSpider": 1.48, "sandGargoyle": 0.87, "rockBeetle": 0.89, "mireEel": 1.61, "ramGhost": 2.25, "hideoutBear": 1.84, "termiteQueen": 1.53, "iceMammoth": 1.67, "magmaNewt": 0.79} };
{ const mix = (T, add) => { for (const k in add) { const o = T[k] || (T[k] = {}); o.hp = Math.round((o.hp || 1) * add[k] * 1000) / 1000; } };
  mix(BOSS_TUNE11, LONG12.boss); mix(ELITE_TUNE11, LONG12.elite); }

// 第二輪：太長的收短、沒跟上的玩家打不贏的頭目攻擊收一點（九頭蛇・溝鼠王・收穫魔像・時計巨像 HP 加很多後變太危險）；菁英「沒跟上」幾乎都贏 → 攻擊 +8〜15%
const LONG12B = {"boss": {"banditBoss": {"hp": 0.9, "pow": 1.1}, "duneWorm": {"hp": 0.9}, "golem": {"hp": 0.73, "pow": 1.05}, "crystalGolem": {"hp": 0.91}, "silverWyrm": {"hp": 0.88, "pow": 0.77}, "hydra": {"hp": 0.78, "pow": 0.68}, "ratKing": {"hp": 0.85, "pow": 0.68}, "harvestGolem": {"hp": 0.73, "pow": 0.68}, "clockColossus": {"hp": 0.7, "pow": 0.75}, "frostQueen": {"hp": 0.77}, "lavaGiant": {"hp": 0.91}, "victorDemon": {"hp": 0.85, "pow": 0.85}}, "elite": {"wolf": {"pow": 1.15}, "blackCatfish": {"hp": 1.22, "pow": 1.15}, "flower": {"pow": 1.15}, "croc": {"pow": 1.15}, "mossGiant": {"pow": 1.15}, "bandit": {"pow": 1.15}, "rockRhino": {"pow": 1.15}, "lizardChief": {"pow": 1.08}, "ruinWarden": {"hp": 1.23, "pow": 1.15}, "crystalCroc": {"hp": 1.13, "pow": 1.15}, "rogueBlade": {"pow": 1.08}, "stagLord": {"hp": 1.21, "pow": 1.15}, "boneKnight": {"pow": 1.15}, "wraithGeneral": {"pow": 1.08}, "blackFeather": {"hp": 0.8}, "runeGolem": {"hp": 0.8}, "boarKing": {"hp": 0.8}, "miasmaWolf": {"hp": 0.8}, "snowBear": {"hp": 0.89}, "youngDragon": {"hp": 1.16, "pow": 1.15}, "lavaKnight": {"pow": 1.15}, "duskCaptain": {"pow": 1.15}, "rockPangolin": {"pow": 1.15}, "glowToad": {"pow": 1.08}, "crystalCrayfish": {"pow": 1.15}, "rootSpider": {"pow": 1.15}, "sandGargoyle": {"pow": 1.15}, "moonJelly": {"pow": 1.08}, "rockBeetle": {"pow": 1.15}, "mireEel": {"hp": 0.8, "pow": 1.08}, "ramGhost": {"hp": 0.8}, "hideoutBear": {"pow": 1.15}, "termiteQueen": {"hp": 0.87, "pow": 1.15}, "iceMammoth": {"pow": 1.08}, "magmaNewt": {"hp": 1.25, "pow": 1.15}}};
{ const mix = (T, add) => { for (const k in add) { const o = T[k] || (T[k] = {}); for (const f of ['hp', 'pow']) if (add[k][f]) o[f] = Math.round((o[f] || 1) * add[k][f] * 1000) / 1000; } };
  mix(BOSS_TUNE11, LONG12B.boss); mix(ELITE_TUNE11, LONG12B.elite); }

// 第三輪：九頭蛇・溝鼠王・收穫魔像 沒跟上幾乎打不贏 → 攻擊再收；古岩魔像・銀鱗水龍 太快 → HP 加；菁英「沒跟上」還剩一半以上 HP 的 → 攻擊 +5〜12%
const LONG12C = { boss: { hydra: { hp: 0.86, pow: 0.62 }, ratKing: { hp: 1, pow: 0.72 }, harvestGolem: { hp: 1.12, pow: 0.74 }, clockColossus: { hp: 0.97, pow: 0.93 },
    golem: { hp: 1.15, pow: 1.08 }, silverWyrm: { hp: 1.13, pow: 1.05 }, crystalGolem: { hp: 1.05 }, frostQueen: { hp: 1.05, pow: 1.05 }, banditBoss: { pow: 1.08 } },
  elite: { stagLord: { hp: 0.9 }, youngDragon: { hp: 0.93 }, magmaNewt: { hp: 0.9 }, blackCatfish: { pow: 1.05 },
    glowToad: { pow: 1.05 }, ruinWarden: { pow: 1.05 }, rogueBlade: { pow: 1.05 }, wraithGeneral: { pow: 1.05 }, boarKing: { pow: 1.05 }, termiteQueen: { pow: 1.05 }, clockKnight: { pow: 1.06 }, iceMammoth: { pow: 1.05 } } };
for (const k of ['wolf', 'rockPangolin', 'flower', 'crystalCrayfish', 'croc', 'mossGiant', 'bandit', 'rootSpider', 'sandGargoyle', 'crystalCroc', 'stagLord', 'rockBeetle', 'boneKnight', 'mireEel', 'runeGolem', 'ramGhost', 'miasmaWolf'])
  (LONG12C.elite[k] = LONG12C.elite[k] || {}).pow = 1.12;
{ const mix = (T, add) => { for (const k in add) { const o = T[k] || (T[k] = {}); for (const f of ['hp', 'pow']) if (add[k][f]) o[f] = Math.round((o[f] || 1) * add[k][f] * 1000) / 1000; } };
  mix(BOSS_TUNE11, LONG12C.boss); mix(ELITE_TUNE11, LONG12C.elite); }
