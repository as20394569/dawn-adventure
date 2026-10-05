/* ===================== v12.31 素材對上魔物（玩家 2026-10-06：「目前怪物的掉落有異常的嗎」→ 選了「素材對上魔物」） =====================
   這個檔案放在魔物都定義完、素材來源・點數階級（09u／r9u／r9w）還沒算之前，後面的表會照新的素材算。
   · 「雪狼毛」改名「雪原毛皮」：雪狼・白絨兔・雪人・雪原巨熊・雪洞之主共用。
   · 新素材「獸毛」（獸材）：捲毛羊・夜影貓・林道貂・楓林狸・山猿・夜遊水獺（原本掉角兔毛・灰狼皮・赤鹿角・蛙皮）。
   · 瘴氣大鯰：蛙皮 → 凝膠（滑溜溜的大鯰魚）；岩角犀：砂晶 → 硬石（皮膚像岩石的犀牛，跟鼴鼠穴之主一樣）。
   · 晶甲巨鱷・遺跡守衛・瘴氣狼王・熔岩騎士：遭遇卡寫「素材：水道鱷皮／硬石／灰狼皮／骨片」，但其實沒有給 → 照寫的給。 */
ITEMS.snowPelt.n = '雪原毛皮';
ITEMS.beastFur = { n: '獸毛', mat: 1, price: 0, sell: 40, cat: '魔物素材', d: '野獸身上蓬鬆的毛。羊・貓・貂・狸・猿身上都有，可以紡成線，也能縫進皮革裡。' };
for (const sp of ['curlySheep', 'nightCat', 'forestMarten', 'mapleTanuki', 'mountainApe', 'nightOtter']) { if (SPECIES[sp]) SPECIES[sp].mat = 'beastFur'; else bvErr('v12.31', 'beastFur ' + sp); }
SPECIES.blackCatfish.mat = 'gel'; SPECIES.rockRhino.mat = 'stone'; BOSS_MAT.rockRhino = 'stone';
for (const sp of ['crystalCroc', 'ruinWarden', 'miasmaWolf', 'lavaKnight']) { const k = BOSS_MAT[sp]; if (SPECIES[sp] && k && ITEMS[k]) SPECIES[sp].mat = k; else bvErr('v12.31', 'roam mat ' + sp); }
