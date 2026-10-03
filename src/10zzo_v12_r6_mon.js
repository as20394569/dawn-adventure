/* ===================== v12.0.6 第六輪：39 種新魔物＋13 隻洞窟之主（名字由玩家在〈第六輪提案〉核准） =====================
   做法跟 10r（v12.0.1 的新魔物）一樣：能力用 ch1Panel 依等級和角色算、各 4 招、種族弱點跟著種族。
   招牌招式是新的（說明寫清楚效果，特效跟說明一致：用現有的特效換成牠的顏色，或用下面的小特效組出來）；
   其他 3 招沿用現有的魔物招式。素材沿用現有的素材。
   戰鬥圖：Codex 任務 AH（39 隻）／之後的洞窟之主；畫好之前先用相近魔物的換色版（PLACEHOLDER）。
   遊戲裡沒有「命中下降」，所以原本寫「降低命中」的招式改成「放出煙霧躲起來（比較難被打中）」。 */
const M6_PAL = { dew: ['#2a6aa0', '#8ad0f0', '#f0ffff'], fluff: ['#9a9aa0', '#e8e8e0', '#ffffff'], firefly: ['#3a5a10', '#c8f050', '#ffffc0'], sand: ['#7a4a20', '#d8a060', '#f8e0b0'],
  smoke: ['#3a3a44', '#8a8a98', '#d8d8e0'], moon: ['#3a4a8a', '#a8c0ff', '#ffffff'], maple: ['#8a2010', '#e86a2a', '#ffc070'], gecko: ['#3a5a3a', '#8ab080', '#e0f0d0'], ice: ['#2a5a8a', '#8ad0f0', '#eaffff'],
  ash: ['#3a2a2a', '#8a5a40', '#ffb060'], lava: ['#6a1408', '#e8501a', '#ffd070'], shell: ['#5a5a6a', '#b0a8c0', '#f0eaf8'], rust: ['#5a2a10', '#b0602a', '#f0b080'], crystal: ['#2a5a7a', '#8ae0f0', '#ffffff'],
  root: ['#3a2a14', '#8a6a3a', '#d8c090'], snail: ['#5a4a6a', '#b8a8c8', '#f0e8f8'], pink: ['#8a3a30', '#f08a70', '#ffd8c8'] };
const M6FX = {
  *cloud(U, pal, kind) { Sound.sfx('wind'); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; mSpawn(this, kind || 'mpuff', { x: U.x + Math.cos(an) * 26, y: U.y + 6 + Math.sin(an) * 12, vx: -Math.cos(an) * 0.4, vy: -0.3, r: 5, c: pal[i % 2 ? 1 : 2], op: 0.75, life: 26 }); }
    yield* wait(10); mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 12, r1: 36, c: pal[1], life: 18 }); Sound.sfx('statUp'); yield* wait(18); },
  *heal(U, pal) { Sound.sfx('heal'); for (let i = 0; i < 8; i++) { const p = mSpawn(this, 'mdrop', { x: U.x + rnd(-18, 18), y: U.y - 40, vy: 1.2, r: 2.2, c: pal[i % 2 ? 1 : 2], life: 22 }); p.upd = q => { q.y += 1.2; }; } yield* wait(10);
    mRise(this, U.x, U.y + 12, 6, () => ({ k: 'mglob', r: 2, c: pal[2] })); mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 10, r1: 34, c: pal[1], life: 18 }); yield* wait(20); },
  *guard(U, pal) { Sound.sfx('statUp'); for (let i = 0; i < 6; i++) { const an = i * 1.047; mSpawn(this, 'mshard', { x: U.x + Math.cos(an) * 30, y: U.y + Math.sin(an) * 24, vx: -Math.cos(an) * 1.4, vy: -Math.sin(an) * 1.2, r: 5, c: pal[1], vr: 0, life: 16 }); }
    mSpawn(this, 'mjag', { x: U.x, y: U.y, r0: 34, r1: 14, c: pal[2], n: 8, life: 18 }); yield* wait(20); },
  *dash(U, T, u, pal) { Sound.sfx('wind'); for (let i = 0; i < 5; i++) mSpawn(this, 'mpuff', { x: lerp(U.x, T.x, i / 5), y: lerp(U.y, T.y, i / 5) + 12, r: 3, c: pal[1], op: 0.6, life: 12 + i * 2 });
    yield* this.lunge(u, 26, 2); Sound.sfx('hit'); mImpact(this, T, pal[2], 16); yield* wait(12); },
  *dust(U, T, pal) { Sound.sfx('wind'); mProj(this, U, T, i => ({ k: 'mglob', r: 1.6 + (i % 3) * 0.5, c: pal[i % 3], wob: 7 }), 16, 1, 12); yield* wait(18); for (let i = 0; i < 8; i++) mSpawn(this, 'mpuff', { x: T.x + rnd(-20, 20), y: T.y + rnd(-14, 14), r: 3, c: pal[1], op: 0.6, life: 18 }); yield* wait(12); },
};
const m6fx = (fn, ...a) => function* (U, T, u, t) { yield* fn.call(this, U, T, u, t, ...a); };
const M6_MOVES = {
  m6_shellIn: { n: '縮殼', t: '一般', cat: '變', pp: 10, stat: { who: 'self', def: 2 }, d: '縮進殼裡。大幅提升物防。', cls: 'guard', mfx: function* (U) { yield* M6FX.guard.call(this, U, M6_PAL.snail); } },
  m6_dew: { n: '朝露', t: '水', cat: '變', pp: 10, heal: 0.3, d: '葉子上的露水滴下來。回復自己的體力。', cls: 'buff', mfx: function* (U) { yield* M6FX.heal.call(this, U, M6_PAL.dew); } },
  m6_sleepSonic: { n: '催眠音波', t: '一般', cat: '變', acc: 70, pp: 10, st: 'slp', d: '發出聽不見的嗡嗡聲，讓對手睡著。', cls: 'debuff', fx: 'm_sonic' },
  m6_ramCharge: { n: '衝撞', t: '一般', cat: '物', pow: 75, acc: 90, pp: 10, charge: 1, chargeMsg: '低下頭，用蹄子刨著地……', warn: '（要衝過來了！先防禦！）', d: '蓄力一回合，下一回合低頭猛撞。', cls: 'charge', fx: 'm12_pigRush' },
  m6_fluff: { n: '飛絮', t: '草', cat: '變', pp: 10, smoke: 2, d: '撒出一大片絨毛躲在裡面。之後幾回合比較難被打中。', cls: 'guard', mfx: function* (U) { yield* M6FX.cloud.call(this, U, M6_PAL.fluff, 'mfeather'); } },
  m6_burrow: { n: '鑽地', t: '岩', cat: '物', pow: 70, acc: 95, pp: 10, charge: 1, chargeMsg: '鑽進了土裡！地面在動……', warn: '（下一回合會從腳下鑽出來！）', d: '躲進土裡，下一回合從腳下鑽出來攻擊。', cls: 'charge', fx: 'm_quake' },
  m6_pincer2: { n: '鉗擊', t: '水', cat: '物', pow: 30, acc: 95, pp: 15, hits: 2, d: '用兩隻鉗子各夾一次。連續攻擊 2 次。', cls: 'strike', mfx: function* (U, T, u) { yield* MX.pincer.call(this, U, T, u, 0, M6_PAL.pink); } },
  m6_skate: { n: '滑步', t: '水', cat: '物', pow: 40, acc: 100, pp: 15, prio: 1, d: '在水面上滑過來撞一下。必定先出手。', cls: 'strike', mfx: function* (U, T, u) { yield* M6FX.dash.call(this, U, T, u, M6_PAL.dew); } },
  m6_regen: { n: '再生', t: '水', cat: '變', pp: 10, heal: 0.25, d: '傷口慢慢長回來。回復一些體力。', cls: 'buff', mfx: function* (U) { yield* M6FX.heal.call(this, U, M6_PAL.pink); } },
  m6_coil: { n: '纏繞', t: '草', cat: '物', pow: 35, acc: 95, pp: 15, eff: { st: 'par', p: 40 }, d: '用藤蔓纏住對手。常常讓對手麻痺。', cls: 'strike', fx: 'm_rootBind' },
  m6_glow: { n: '螢光', t: '雷', cat: '變', pp: 10, smoke: 2, d: '一起發出刺眼的光躲在光裡。之後幾回合比較難被打中。', cls: 'guard', mfx: function* (U) { mSpawn(this, 'mflash', { c: '#3a4a00', life: 8 }); yield* M6FX.cloud.call(this, U, M6_PAL.firefly, 'mglint'); } },
  m6_suck: { n: '吸取', t: '草', cat: '特', pow: 45, acc: 100, pp: 15, drain: 0.5, d: '咬住對手吸取體力，回復造成傷害一半的 HP。', cls: 'bolt', fx: 'm_rootLeech' },
  m6_sandKick: { n: '沙塵', t: '岩', cat: '變', pp: 10, smoke: 2, d: '用尾巴揚起沙塵躲在裡面。之後幾回合比較難被打中。', cls: 'guard', mfx: function* (U) { yield* M6FX.cloud.call(this, U, M6_PAL.sand); } },
  m6_spinRoll: { n: '滾動', t: '一般', cat: '物', pow: 35, acc: 90, pp: 15, hits: 2, d: '縮成刺球滾過來。連續撞 2 次。', cls: 'strike', fx: 'm_roll' },
  m6_gravel: { n: '砂礫投擲', t: '岩', cat: '物', pow: 55, acc: 95, pp: 15, d: '抓起一把砂礫丟過來。', cls: 'proj', mfx: mxRecolor(MFX.m_pebbleToss, M6_PAL.sand) },
  m6_quickStab: { n: '疾啄', t: '飛', cat: '物', pow: 55, acc: 100, pp: 15, crit: 1, d: '用長嘴快速一啄。容易會心。', cls: 'pierce', fx: 'm_peck' },
  m6_clamShut: { n: '閉殼', t: '水', cat: '變', pp: 10, stat: { who: 'self', def: 2 }, d: '把殼緊緊閉上。大幅提升物防。', cls: 'guard', mfx: function* (U) { yield* M6FX.guard.call(this, U, M6_PAL.shell); } },
  m6_moonlight: { n: '月光', t: '一般', cat: '變', pp: 10, heal: 0.25, stat: { who: 'self', spd: 1 }, d: '吸收月光。回復體力，並提升魔防。', cls: 'buff', mfx: function* (U) { yield* M6FX.heal.call(this, U, M6_PAL.moon); } },
  m6_bloodsuck: { n: '吸血', t: '毒', cat: '物', pow: 30, acc: 100, pp: 15, eff: { st: 'psn', p: 50 }, d: '用細長的針吸血。常常讓對手中毒。', cls: 'pierce', fx: 'm_sting' },
  m6_rotGas: { n: '腐氣', t: '毒', cat: '特', pow: 45, acc: 95, pp: 10, eff: { st: 'psn', p: 40 }, d: '噴出腐爛的氣體。有時讓對手中毒。', cls: 'bolt', fx: 'm_toxicCloud' },
  m6_leafDance: { n: '落葉舞', t: '飛', cat: '變', pp: 10, smoke: 2, d: '在飄落的楓葉裡飛舞。之後幾回合比較難被打中。', cls: 'guard', mfx: function* (U) { yield* M6FX.cloud.call(this, U, M6_PAL.maple, 'mleaf'); } },
  m6_tailCut: { n: '斷尾', t: '一般', cat: '變', pp: 10, smoke: 2, d: '甩下一截尾巴吸引注意。之後幾回合比較難被打中。', cls: 'guard', mfx: function* (U) { yield* M6FX.cloud.call(this, U, M6_PAL.gecko); } },
  m6_deadSlash: { n: '亡者之斬', t: '一般', cat: '物', pow: 70, acc: 95, pp: 10, crit: 1, d: '用斷劍斬下去。容易會心。', cls: 'slash', fx: 'm_darkSlash' },
  m6_gnaw: { n: '啃咬', t: '一般', cat: '物', pow: 55, acc: 100, pp: 15, drain: 0.5, d: '狠狠咬一口，回復造成傷害一半的 HP。', cls: 'bite', fx: 'm_bite' },
  m6_ironWall: { n: '鐵壁', t: '一般', cat: '變', pp: 10, stat: { who: 'self', def: 2 }, d: '舉起生鏽的盾。大幅提升物防。', cls: 'guard', mfx: function* (U) { yield* M6FX.guard.call(this, U, M6_PAL.rust); } },
  m6_spikeShield: { n: '刺盾', t: '一般', cat: '變', pp: 10, stat: { who: 'self', def: 2 }, d: '把鐵刺全部豎起來。大幅提升物防。', cls: 'guard', mfx: function* (U) { yield* M6FX.guard.call(this, U, MX_PAL.metal); } },
  m6_ambush: { n: '偷襲', t: '一般', cat: '物', pow: 45, acc: 100, pp: 15, prio: 1, d: '從樹叢裡竄出來咬一口。必定先出手。', cls: 'bite', fx: 'm_pounce' },
  m6_smokeBomb: { n: '煙霧彈', t: '一般', cat: '變', pp: 10, smoke: 2, d: '丟出煙霧彈躲起來。之後幾回合比較難被打中。', cls: 'guard', mfx: function* (U) { yield* M6FX.cloud.call(this, U, M6_PAL.smoke); } },
  m6_gnawSwarm: { n: '群咬', t: '一般', cat: '物', pow: 20, acc: 95, pp: 15, hits: 3, d: '一群田鼠一起撲上來。連續攻擊 3 次。', cls: 'bite', fx: 'm_bite' },
  m6_nightRaid: { n: '夜襲', t: '一般', cat: '變', acc: 70, pp: 10, st: 'slp', d: '在夜裡低聲鳴叫，讓對手睡著。', cls: 'debuff', fx: 'm_lullaby' },
  m6_snowDash: { n: '雪地疾走', t: '水', cat: '物', pow: 45, acc: 100, pp: 15, prio: 1, d: '在雪地上飛奔過來踢一腳。必定先出手。', cls: 'strike', mfx: function* (U, T, u) { yield* M6FX.dash.call(this, U, T, u, MX_PAL.snow); } },
  m6_icePowder: { n: '冰粉', t: '水', cat: '特', pow: 40, acc: 95, pp: 15, eff: { stat: { spe: -1 }, p: 50 }, d: '撒出冰冷的鱗粉。常常降低對手的速度。', cls: 'bolt', mfx: function* (U, T) { yield* M6FX.dust.call(this, U, T, M6_PAL.ice); } },
  m6_hotScale: { n: '灼熱鱗粉', t: '火', cat: '特', pow: 40, acc: 95, pp: 15, eff: { st: 'brn', p: 40 }, d: '撒出燒燙的鱗粉。有時讓對手灼傷。', cls: 'bolt', mfx: function* (U, T) { yield* M6FX.dust.call(this, U, T, M6_PAL.ash); } },
  m6_lavaShell: { n: '熔岩殼', t: '火', cat: '物', pow: 60, acc: 95, pp: 10, eff: { st: 'brn', p: 30 }, d: '用燒紅的殼撞過來。有時讓對手灼傷。', cls: 'strike', mfx: mxRecolor(MFX.m_roll, M6_PAL.lava) },
  m6_shardBurst: { n: '碎片噴射', t: '岩', cat: '物', pow: 35, acc: 95, pp: 15, hits: 2, d: '噴出銳利的黑曜石碎片。連續攻擊 2 次。', cls: 'proj', mfx: mxRecolor(MFX.m_crystalShard, ['#10101a', '#5a4a6a', '#ffb060']) },
  // 洞窟之主
  m6_sporeMist: { n: '孢子霧', t: '草', cat: '變', acc: 75, pp: 10, st: 'slp', d: '背上的蘑菇噴出孢子霧，讓對手睡著。', cls: 'debuff', fx: 'm_sleepPollen' },
  m6_scaleRoll: { n: '岩鱗滾擊', t: '岩', cat: '物', pow: 85, acc: 90, pp: 5, charge: 1, chargeMsg: '縮成一顆岩石球，在洞裡滾了起來！', warn: '（這一擊很重！先防禦！）', d: '蓄力一回合，下一回合整個滾過來。', cls: 'charge', fx: 'm_roll' },
  m6_crystalClaw: { n: '水晶巨鉗', t: '水', cat: '物', pow: 35, acc: 95, pp: 10, hits: 2, eff: { stat: { def: -1 }, p: 30 }, d: '用水晶鉗子夾兩次。有時降低對手的物防。', cls: 'strike', mfx: function* (U, T, u) { yield* MX.pincer.call(this, U, T, u, 0, M6_PAL.crystal); } },
  m6_rootWeb: { n: '根網', t: '草', cat: '物', pow: 45, acc: 95, pp: 10, eff: { st: 'par', p: 50 }, d: '用樹根織成的網罩住對手。常常讓對手麻痺。', cls: 'strike', fx: 'm_rootBind' },
  m6_sandStorm: { n: '砂暴', t: '岩', cat: '特', pow: 70, acc: 90, pp: 10, eff: { flinch: 1, p: 20 }, d: '捲起砂暴。有時讓對手退縮。', cls: 'area', fx: 'm_sandstorm' },
  m6_lunarTide: { n: '月潮', t: '水', cat: '特', pow: 70, acc: 100, pp: 10, drain: 0.5, d: '引來發光的潮水。回復造成傷害一半的 HP。', cls: 'area', fx: 'm_whirlpool' },
  m6_mudCoil: { n: '泥漩纏身', t: '水', cat: '特', pow: 60, acc: 95, pp: 10, eff: { stat: { spe: -1 }, p: 100 }, d: '捲起泥漩把對手纏住。降低對手的速度。', cls: 'bolt', fx: 'm_mudBomb' },
  m6_cavein: { n: '崩落衝撞', t: '岩', cat: '物', pow: 95, acc: 90, pp: 5, charge: 1, chargeMsg: '用背殼頂住洞頂，碎石開始落下……', warn: '（洞頂要塌了！先防禦！）', d: '蓄力一回合，下一回合連洞頂一起撞下來。', cls: 'charge', fx: 'm_rockfall' },
  m6_breach: { n: '破城一擊', t: '一般', cat: '物', pow: 80, acc: 90, pp: 10, pierceDef: 0.5, d: '攻城槌的全力一擊。無視對手一半的物防。', cls: 'strike', fx: 'm_golemFist' },
  m6_berserk: { n: '狂暴', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 2 }, d: '扯掉頭巾狂吼。大幅提升物攻。', cls: 'buff', fx: 'm_warRoar' },
  m6_callSwarm: { n: '召來蟻群', t: '一般', cat: '物', pow: 25, acc: 95, pp: 10, hits: 3, d: '叫來一群白蟻咬對手。連續攻擊 3 次。', cls: 'bite', fx: 'm_swarm' },
  m6_iceTusk: { n: '冰牙衝鋒', t: '水', cat: '物', pow: 90, acc: 90, pp: 10, d: '用冰柱一樣的長牙衝過來。', cls: 'strike', mfx: mxRecolor(MFX.m_tuskCharge, MX_PAL.ice) },
  m6_eruptSpray: { n: '熔岩噴發', t: '火', cat: '特', pow: 85, acc: 95, pp: 10, eff: { st: 'brn', p: 30 }, d: '從背上噴出熔岩。有時讓對手灼傷。', cls: 'bolt', fx: 'm_flameBreath' },
};
for (const k in M6_MOVES) { const m = M6_MOVES[k], { mfx, ...mv } = m; MOVES[k] = { ...mv, foe: 1 }; if (mfx) { MFX[k] = mfx; MOVES[k].fx = k; } (MON_CLASS[m.cls] || (MON_CLASS[m.cls] = [])).push(k);
  const D = defPut('skills', k, skillFromMove(k, MOVES[k], { kind: 'skill', extraTags: ['monster_skill'] })); D.cooldown = 0;
  D.effects = D.effects.map((ef, i) => effRegister('skill:' + k + '#e' + i, ef)); D.after = D.after.map((ef, i) => effRegister('skill:' + k + '#a' + i, ef)); }

// [key, name, family, level, role, moves (signature first), material, placeholder look [base, hue, sat, light], dex, lord]
const M6_MON = [
  // 第一幕
  ['mistSnail', '霧角蝸牛', 'ooze', 5, 'tank', ['m6_shellIn', 'm_goo', 'm_bubbleSpit', 'm_roll'], 'gel', ['slime', 250, 0.35, 1.0], '晨霧道路的霧裡爬出來的蝸牛。殼上一直纏著一團霧。'],
  ['dewSprite', '露珠精', 'spirit', 9, 'mage', ['m6_dew', 'm_bubbleSpit', 'm_waterBomb', 'm_lullaby'], 'moonDew', ['moonSprite', 170, 0.8, 1.2], '清晨葉子上的露水聚成的小精靈。太陽一出來就躲進樹蔭。'],
  ['mossBat', '苔蝙蝠', 'bird', 9, 'fast', ['m6_sleepSonic', 'm_bite', 'm_peck', 'm_screech'], 'batWing', ['caveBat', 80, 0.6, 0.9], '住在晨霧洞的蝙蝠。翅膀潮濕到長出了青苔。'],
  ['curlySheep', '捲毛羊', 'beast', 6, 'tank', ['m6_ramCharge', 'm_roll', 'm_harden', 'm_chirp'], 'hareFur', ['yeti', 30, 0.4, 1.1], '風車丘陵牧場跑出來的羊。毛捲成一團，生氣起來會低頭撞人。'],
  ['fluffSeed', '蒲絨精', 'plant', 6, 'mage', ['m6_fluff', 'm_leafDart', 'm_sleepPollen', 'm_featherGust'], 'leaf', ['moonSprite', 40, 0.1, 1.5], '蒲公英的絨毛聚成的小精靈。風一吹就飄到別的山坡去。'],
  ['moleDigger', '地鼴', 'beast', 8, 'phys', ['m6_burrow', 'm_claw', 'm_scurry', 'm_bite'], 'stone', ['sewerRat', 0, 0.3, 0.7], '在丘陵底下挖了很多地道的鼴鼠。爪子比鏟子還好用。'],
  ['creekShrimp', '溪蝦兵', 'aquatic', 10, 'phys', ['m6_pincer2', 'm_bubbleSpit', 'm_tailSlam', 'm_pinch'], 'beetleShell', ['reedCrab', 15, 1.0, 1.15], '拿蘆葦當長槍的大蝦。成群在碧溪谷的淺灘巡邏。'],
  ['waterStrider', '水黽', 'insect', 10, 'fast', ['m6_skate', 'm_bite', 'm_waterBomb', 'm_scurry'], 'stinger', ['mireFly', 140, 0.5, 0.7], '在水面上滑來滑去的長腳蟲。從來不會沉下去。'],
  ['caveNewt', '洞穴蠑螈', 'aquatic', 11, 'tank', ['m6_regen', 'm_bite', 'm_bubbleSpit', 'm_tongue'], 'frogSkin', ['frog', 0, 0.2, 1.5], '水幕洞深處的白色蠑螈。眼睛很小，靠鰓感覺周圍的動靜。'],
  // 第二幕
  ['vineSnake', '藤蔓蛇', 'plant', 13, 'fast', ['m6_coil', 'm_vineLash', 'm_venomFang', 'm_leafDart'], 'leaf', ['streamSnake', -60, 0.9, 1.0], '藤蔓自己纏成了蛇的樣子。頭上還開著一朵小紅花。'],
  ['fireflySwarm', '螢火蟲群', 'insect', 13, 'mage', ['m6_glow', 'm_swarm', 'm_buzzShock', 'm_static'], 'mothDust', ['bee', 60, 0.8, 1.2], '迷霧森林裡一閃一閃的螢火蟲。帶頭的那隻特別亮。'],
  ['rootGrub', '根蛀蟲', 'insect', 14, 'tank', ['m6_suck', 'm_bite', 'm_silkShot', 'm_carapace'], 'silk', ['slime', 30, 0.2, 1.5], '啃樹根長大的肥白幼蟲。樹根洞裡到處都是牠咬出來的洞。'],
  ['canyonLizard', '峽谷蜥蜴', 'beast', 13, 'fast', ['m6_sandKick', 'm_bite', 'm_tongue', 'm_scurry'], 'lizardScale', ['lizardman', 30, 0.9, 1.1], '背上有紅色條紋的蜥蜴。一緊張就把脖子的皺褶張開。'],
  ['spineArmadillo', '刺背犰狳', 'beast', 14, 'tank', ['m6_spinRoll', 'm_harden', 'm_roll', 'm_cactusGuard'], 'beetleShell', ['pebble', 30, 0.5, 1.2], '殼上長著短刺的犰狳。縮成一團的時候根本找不到下手的地方。'],
  ['sandstoneImp', '砂岩小人', 'construct', 15, 'phys', ['m6_gravel', 'm_harden', 'm_sandBlast', 'm_quake'], 'sandCrystal', ['pebble', 15, 0.6, 1.1], '風蝕洞的砂岩自己疊起來的小傀儡。眼睛裡有琥珀色的光。'],
  ['reedHeron', '蘆葦鷺', 'bird', 17, 'fast', ['m6_quickStab', 'm_featherGust', 'm_dive', 'm_screech'], 'feather', ['bird', 0, 0.1, 1.7], '在銀月湖的蘆葦裡站一整天的白鷺。嘴巴快得看不見。'],
  ['lakeClam', '湖貝怪', 'aquatic', 17, 'tank', ['m6_clamShut', 'm_bubbleSpit', 'm_waterBomb', 'm_engulf'], 'moonDew', ['slime', 200, 0.4, 0.9], '躺在湖底的大貝。殼裡偶爾會看到一顆珍珠。'],
  ['moonMoss', '月光苔精', 'plant', 18, 'mage', ['m6_moonlight', 'm_moonBeam', 'm_leafDart', 'm_sleepPollen'], 'bogMoss', ['moonSprite', 200, 0.5, 1.1], '月光洞裡發著銀光的苔蘚團。照不到月光就會慢慢變暗。'],
  ['mosquitoSwarm', '毒蚊群', 'insect', 20, 'fast', ['m6_bloodsuck', 'm_swarm', 'm_buzzShock', 'm_leechBite'], 'stinger', ['bee', 260, 0.6, 0.8], '幽光沼澤的毒蚊子。一大群一起飛過來的時候會發出嗡嗡的轟聲。'],
  ['mudSlug', '泥沼蛞蝓', 'ooze', 20, 'tank', ['m_goo', 'm_mudBomb', 'm_slimeCoat', 'm_engulf'], 'bogMoss', ['bogLeech', 30, 0.6, 1.1], '背著一大團泥巴的蛞蝓。爬過的地方會留下一道黏黏的痕跡。'],
  ['rotRoot', '腐根怪', 'plant', 21, 'tank', ['m6_rotGas', 'm_rootBind', 'm_branchSlam', 'm_witherBreath'], 'rotWood', ['rotTreant', 0, 0.8, 0.8], '沼底洞裡腐爛的樹根長成的怪物。身上長滿紫色的菌斑。'],
  // 第三幕
  ['mountainApe', '山猿', 'beast', 19, 'phys', ['m_pebbleToss', 'm_claw', 'm_taunt', 'm_pounce'], 'stagHorn', ['sewerRat', 30, 0.6, 1.1], '楓紅關道的山猴子。臉紅紅的，最喜歡朝旅人丟石頭。'],
  ['mapleButterfly', '楓葉蝶', 'insect', 19, 'mage', ['m6_leafDance', 'm_moonDust', 'm_featherGust', 'm_leafDart'], 'mothDust', ['duskMoth', 340, 1.0, 1.1], '翅膀像楓葉的蝴蝶。停在楓樹上的時候完全分不出來。'],
  ['wallGecko', '岩壁守宮', 'beast', 20, 'fast', ['m6_tailCut', 'm_bite', 'm_tongue', 'm_scurry'], 'lizardScale', ['lizardman', 90, 0.4, 1.0], '貼在舊隧道岩壁上的大壁虎。腳趾可以黏在天花板上。'],
  ['bladeGhost', '斷劍幽魂', 'spirit', 22, 'phys', ['m6_deadSlash', 'm_ghostFire', 'm_wail', 'm_soulSip'], 'ectoplasm', ['wraith', 180, 0.6, 1.2], '握著斷劍的士兵幽魂。到現在還以為戰爭沒有結束。'],
  ['ghoul', '戰場食屍鬼', 'undead', 22, 'phys', ['m6_gnaw', 'm_claw', 'm_rend', 'm_rattle'], 'boneShard', ['skeleton', 60, 0.3, 0.8], '在古戰場的壕溝裡爬來爬去的灰色怪物。聞到活人的味道就會撲過來。'],
  ['rustSoldier', '鏽甲兵', 'undead', 23, 'tank', ['m6_ironWall', 'm_boneShield', 'm_boneClub', 'm_rustBite'], 'rustScrap', ['skeleton', 20, 0.8, 0.9], '穿著生鏽鎧甲的骸骨士兵。還在守著地下壕道。'],
  // 第四幕
  ['ironHedgehog', '鐵刺蝟', 'beast', 24, 'tank', ['m6_spikeShield', 'm_roll', 'm_bite', 'm_needleSpray'], 'rustScrap', ['hornHare', 200, 0.2, 0.8], '刺像鐵釘一樣硬的刺蝟。被牠撞到會痛好幾天。'],
  ['forestMarten', '林道貂', 'beast', 24, 'fast', ['m6_ambush', 'm_bite', 'm_rend', 'm_scurry'], 'wolfPelt', ['fox', 200, 0.3, 0.9], '北方林道的灰貂。從樹叢裡竄出來的速度比箭還快。'],
  ['featherThug', '黑羽打手', 'human', 25, 'phys', ['m6_smokeBomb', 'm_knife', 'm_dirtyKick', 'm_taunt'], 'banditCloth', ['bandit', 0, 0.3, 0.7], '黑羽盜賊團的打手。負責看守北方街道旁的藏身洞。'],
  ['fieldMice', '田鼠群', 'beast', 26, 'fast', ['m6_gnawSwarm', 'm_bite', 'm_scurry', 'm_plagueBite'], 'wheat', ['sewerRat', 30, 0.5, 1.2], '一群偷吃麥子的田鼠。帶頭的那隻扛著一整根麥穗。'],
  ['barnOwl', '穀倉鴞', 'bird', 26, 'mage', ['m6_nightRaid', 'm_featherGust', 'm_dive', 'm_screech'], 'feather', ['strawCrow', 40, 0.3, 1.6], '住在穀倉梁上的白臉貓頭鷹。晚上會出來抓田鼠。'],
  ['barnSpider', '穀倉蜘蛛', 'insect', 27, 'phys', ['m_web', 'm_venomFang', 'm_silkShot', 'm_bite'], 'silk', ['caveSpider', 30, 0.5, 1.1], '在舊穀倉地窖的梁上結網的大蜘蛛。背上有淡色的十字花紋。'],
  // 第五幕
  ['snowHare', '白絨兔', 'beast', 30, 'fast', ['m6_snowDash', 'm_bite', 'm_frostFang', 'm_pounce'], 'snowPelt', ['hornHare', 0, 0.05, 1.6], '毛白得跟雪一樣的兔子。站在雪地裡只看得到紅紅的眼睛。'],
  ['frostMoth', '霜翅蛾', 'insect', 31, 'mage', ['m6_icePowder', 'm_moonDust', 'm_chillMist', 'm_iceShard'], 'iceCrystal', ['duskMoth', 180, 0.4, 1.4], '翅膀上有霜花紋的白蛾。拍一下翅膀就撒下一片冰粉。'],
  ['icicleSprite', '冰柱精', 'spirit', 32, 'mage', ['m_iceShard', 'm_frostNova', 'm_chillMist', 'm_iceMirror'], 'iceCrystal', ['gustSprite', 120, 0.6, 1.3], '雪洞裡的冰柱化成的小精靈。碰到牠的手會黏住。'],
  ['ashMoth', '火山灰蛾', 'insect', 33, 'mage', ['m6_hotScale', 'm_moonDust', 'm_emberSpit', 'm_heatHaze'], 'emberCore', ['duskMoth', 10, 0.5, 0.7], '翅膀沾滿火山灰的蛾。翅膀上的斑點像炭火一樣發著光。'],
  ['obsidianTurtle', '黑曜龜', 'aquatic', 34, 'tank', ['m6_lavaShell', 'm_tailSlam', 'm_scaleGuard', 'm_magmaFist'], 'magmaStone', ['mossTurtle', 300, 0.3, 0.5], '殼是黑曜石的烏龜。殼的裂縫裡看得到紅色的熔岩。'],
  ['obsidianChunk', '黑曜石塊', 'construct', 35, 'phys', ['m6_shardBurst', 'm_harden', 'm_rockfall', 'm_overheat'], 'magmaStone', ['pebble', 260, 0.3, 0.4], '黑曜石洞裡會動的石塊。兩顆眼睛像炭火一樣發著光。'],
  // 洞窟之主（菁英）
  ['glowToad', '晨霧洞之主', 'plant', 11, 'tank', ['m6_sporeMist', 'm_tongue', 'm_mudBomb', 'm_croak'], 'shroomCap', ['bogToad', 90, 0.8, 1.2], '背上長滿發光蘑菇的大蟾蜍。晨霧洞的霧，聽說就是牠吐出來的。', 1],
  ['rockPangolin', '鼴鼠穴之主', 'beast', 9, 'tank', ['m6_scaleRoll', 'm_roll', 'm_harden', 'm_claw'], 'stone', ['rockRhino', 0, 0.5, 1.0], '鱗片像岩石的大穿山甲。鼴鼠穴所有的地道都是牠的地盤。', 1],
  ['crystalCrayfish', '水幕洞之主', 'aquatic', 12, 'phys', ['m6_crystalClaw', 'm_crabHammer', 'm_bubbleSpit', 'm_scaleGuard'], 'crystal', ['reedCrab', 180, 0.6, 1.3], '甲殼透明得像水晶的大螯蝦。躲在瀑布後面不讓人靠近。', 1],
  ['rootSpider', '樹根洞之主', 'plant', 15, 'phys', ['m6_rootWeb', 'm_rootCrush', 'm_silkShot', 'm_thornVine'], 'rotWood', ['caveSpider', 80, 0.6, 1.0], '樹根纏成身體的大蜘蛛。樹根洞裡的根，有一半是牠的腳。', 1],
  ['sandGargoyle', '風蝕洞之主', 'construct', 16, 'tank', ['m6_sandStorm', 'm_rockfall', 'm_stoneWall', 'm_harpyCry'], 'sandCrystal', ['golem', 20, 0.7, 1.1], '風把砂岩雕成的石像鬼。風一吹進洞裡，牠就會睜開眼睛。', 1],
  ['moonJelly', '月光洞之主', 'spirit', 20, 'mage', ['m6_lunarTide', 'm_moonBeam', 'm_chillMist', 'm_iceMirror'], 'moonDew', ['ghostLamp', 200, 0.6, 1.2], '發著銀光、浮在空中的大水母。月圓的晚上會飄到湖面上。', 1],
  ['mireEel', '沼底洞之主', 'aquatic', 23, 'phys', ['m6_mudCoil', 'm_whirlpool', 'm_bite', 'm_mudBomb'], 'bogMoss', ['streamSnake', 60, 0.4, 0.6], '從沼底洞的泥水裡探出頭的巨鰻。身體有多長沒人知道。', 1],
  ['rockBeetle', '舊隧道之主', 'insect', 22, 'tank', ['m6_cavein', 'm_hornCharge', 'm_carapace', 'm_rockfall'], 'beetleHorn', ['thunderBeetle', 200, 0.3, 0.8], '背殼像岩盤一樣的大甲蟲。舊隧道會塌，有一半是牠撞的。', 1],
  ['ramGhost', '地下壕道之主', 'undead', 25, 'phys', ['m6_breach', 'm_darkPulse', 'm_wail', 'm_quake'], 'ectoplasm', ['golem', 260, 0.3, 0.6], '被亡魂附身的攻城槌。五百年前沒能撞開的城門，牠到現在還在找。', 1],
  ['hideoutBear', '黑羽的藏身洞之主', 'beast', 27, 'phys', ['m6_berserk', 'm_rend', 'm_claw', 'm_bite'], 'banditCloth', ['snowBear', 20, 0.6, 0.6], '黑羽盜賊團養的大熊。穿著皮甲、戴著黑羽頭巾，比看門的盜賊還兇。', 1],
  ['termiteQueen', '舊穀倉地窖之主', 'insect', 29, 'tank', ['m6_callSwarm', 'm_acidSpit', 'm_carapace', 'm_silkShot'], 'wheat', ['bee', 30, 0.2, 1.5], '肚子很大的白蟻后。舊穀倉的梁會一根一根倒下，都是牠的孩子啃的。', 1],
  ['iceMammoth', '雪洞之主', 'beast', 33, 'tank', ['m6_iceTusk', 'm_frostFang', 'm_iceFist', 'm_quake'], 'snowPelt', ['wildBoar', 190, 0.4, 1.4], '長牙是冰柱的小猛獁。在雪洞裡睡了好幾百年。', 1],
  ['magmaNewt', '黑曜石洞之主', 'aquatic', 36, 'mage', ['m6_eruptSpray', 'm_magmaFist', 'm_scorch', 'm_heatHaze'], 'magmaStone', ['creekCroc', 0, 1.0, 0.8], '背上冒著熔岩的大蠑螈。黑曜石洞裡的黑曜石，都是牠噴出來的熔岩冷掉變成的。', 1],
];
const M6_KEYS = new Set();
for (const [k, n, fam, lv, role, moves, mat, look, dex, lord] of M6_MON) {
  const kind = lord ? 'elite' : 'wild', ok = moves.filter(m => MOVES[m]); if (ok.length < moves.length) bvErr('v12.6', k + ' moves ' + moves.filter(m => !MOVES[m]).join(','));
  SPECIES[k] = { n, fam, base: CH2_ROLE[role].map(v => Math.round(v * 60)), exp: lord ? 90 + 5 * lv : 45 + 3 * lv, gold: lord ? 0 : Math.round(lv * 1.6), learn: ok.map((m, i) => [!lord && i === 3 ? lv + 1 : 1, m]), dex, mat, ...(lord ? { elite: 1 } : {}) };
  MON_PANEL[k] = ch1Panel(lv, role, kind);
  const [b, dh, ks, kl] = look; PLACEHOLDER[k] = look; HD_RIG_OF_PENDING[k] = b; HD_RIG_OF[k] = b; if (ART[b]) ART[k] = artRecolor(ART[b], dh, ks, kl);
  CH2_KEYS.add(k); M6_KEYS.add(k);
  defPut('enemies', k, { tags: ['foe', 'fam:' + fam], skills: ok.filter(id => DEF.skills[id]), fam, trait: null, profile: typeof aiProfile === 'function' ? aiProfile({ sp: k }) : 'brute', script: null, metadata: { n } });
  if (lord) ELITE_TEXT[k] = ['（洞窟最深處，有什麼東西動了一下……）', n + '出現了！'];
}
