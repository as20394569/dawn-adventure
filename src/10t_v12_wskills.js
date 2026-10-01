/* ===================== v12.0.1 每把武器都有自己的技能 =====================
   Player: 「武器技能希望每一把都不同 有必要時重新設計+特效」 → chose 134 independent skills, designed here and tuned after playtesting.
   134 weapons used to share 44 skills (12 daggers were all 疾影突). Every weapon now has its own skill u_<weapon> (the 10 unique
   weapons keep theirs): its own name, an archetype that fits the weapon (one of the 40 skill shapes), and its own extra effect
   (an evolution code, shown in the text and played by the battle: burns, poison, stat changes, drain, extra hit…).
   Numbers follow the existing scale: a damage skill keeps the total power of the skill the weapon had before (a support weapon
   turned into an attack uses the tier power), divided over the archetype's hits; cooldown, learn count and 搶先 come from the
   archetype (SKILL12). Each is learned on its own (6/10/14 uses), like every weapon skill. */
const W12 = { // weapon: [name, archetype (ORB_A key), [extra effect codes], picture (when the archetype's doesn't fit the weapon)]
  // 劍
  woodSword: ['木劍連打', 'swallowFlight', ['spec+1']], ironSword: ['鐵劍突進', 'galeCut', ['spe+1']], knightSword: ['騎士十字', 'crossJudge', ['def+1']],
  foxBlade: ['狐火雙斬', 'swallowFlight', ['brn:30']], crystalBlade: ['水晶穿刺', 'cloudPierce', ['fspd-1']], dawnSword: ['晨曦一閃', 'dawnFlash', ['brn:30']],
  masterBlade: ['名匠斬', 'steelCleaver', ['crit']], voltSword: ['雷角斬', 'thornBind', ['par:20']], boneSaber: ['骸骨斬', 'crossJudge', ['drain:20']],
  kingsBlade: ['古王裁決', 'crossJudge', ['atk+1']], graveBlade: ['冥府斬', 'bloodMoon', ['fspd-1']], eclipseBlade: ['月蝕之刃', 'allOut', ['drain:20']],
  voidBlade: ['虛空斬', 'steelCleaver', ['fdef-1']], moonBlade: ['月光斬', 'swallowFlight', ['crit']], riftSword: ['裂界一閃', 'cloudPierce', ['crit']],
  sandSaber: ['流砂斬', 'swallowFlight', ['fspe-1']], toadBlade: ['蟾毒斬', 'bloodMoon', ['psn:30']], verdantBlade: ['翠葉斬', 'thornBind', ['drain:20']],
  royalSword: ['王國劍閃', 'dawnFlash', ['def+1']], hornSpear: ['甲蟲角刺', 'cloudPierce', ['fdef-1']], brassSword: ['發條連斬', 'bladeRain', ['spec+1']],
  frostBrand: ['霜刃', 'crossJudge', ['fspe-1']], flameBrand: ['炎斬', 'steelCleaver', ['brn:30']], duskSword: ['黯滅斬', 'allOut', ['fatk-1']],
  starSword: ['星辰斬', 'crossJudge', ['mp:5']], harvestScythe: ['收穫迴斬', 'steamCannon', ['drain:20'], 'whirlRing'], chronoLance: ['時計突', 'dawnFlash', ['spe+1']],
  duskBlade: ['黑騎士斬', 'steelCleaver', ['drain:20']], moldBlade: ['影將突斬', 'shadowRush', ['fdef-1']],
  // 短刀
  mistDagger: ['晨霧雙刃', 'twinFang', ['spe+1']], fangDagger: ['狼牙連咬', 'twinFang', ['crit']], emberKnife: ['燼火刺', 'galeCut', ['brn:30']],
  banditKnife: ['盜賊襲擊', 'assassinMark', ['first']], wyrmFang: ['龍牙刺', 'shadowRush', ['wet']], moonDagger: ['月牙閃', 'assassinMark', ['crit']],
  riftDagger: ['裂界刺', 'shadowRush', ['fspd-1']], huntKnife: ['獵刀切', 'twinFang', ['fspe-1']], stingerDagger: ['蠍尾連刺', 'bladeRain', ['psn:30']],
  duneFang: ['沙海裂牙', 'shadowRush', ['hit+1']], hydraFang: ['多頭咬', 'twinFang', ['psn:30']], royalDagger: ['宮廷刺擊', 'galeCut', ['crit']],
  wolfFang2: ['灰狼撕咬', 'bladeRain', ['fdef-1']], iceDagger: ['冰晶刺', 'shadowRush', ['fspe-1']], magmaDagger: ['熔岩刺', 'assassinMark', ['brn:30']],
  shadowDagger: ['暗影突襲', 'shadowRush', ['first']], cometDagger: ['彗星亂刃', 'bladeRain', ['crit']],
  // 斧
  grenAxe: ['鐵斧怒擊', 'lastWall', ['fdef-1']], hatchet: ['伐木劈', 'rockBreak', ['spec+1']], boarAxe: ['野豬衝撞', 'shieldRam', ['atk+1']],
  rockAxe: ['岩角劈', 'rockBreak', ['def+1']], crescentAxe: ['新月迴斬', 'steamCannon', ['crit'], 'axeSpin'], glacierAxe: ['霜嶺劈', 'allOut', ['fspe-1']],
  titanAxe: ['泰坦重擊', 'shieldRam', ['fdef-1']],
  // 長槍
  trainSpear: ['見習突刺', 'galeCut', ['hit+1']], ironSpear: ['鐵槍貫', 'cloudPierce', ['spe+1']], galeLance: ['疾風突', 'cloudPierce', ['first']],
  scaleSpear: ['龍鱗突', 'drakeFang', ['def+1']], azureSpear: ['蒼龍突', 'drakeFang', ['wet']], frostSpear: ['霜牙突', 'cloudPierce', ['fspe-1']],
  skySpear: ['天龍貫', 'drakeFang', ['crit']],
  // 拳套
  wrapFist: ['布纏連拳', 'chainPalm', ['spec+1']], ironKnuckle: ['鐵拳', 'chainPalm', ['fdef-1']], rockFist: ['岩碎拳', 'rockBreak', ['hit+1'], 'hakkei'],
  chiFist: ['氣功波', 'arcaneShot', ['heal+15'], 'chiBlast'], tigerClaw: ['虎爪亂舞', 'bladeRain', ['atk+1'], 'lacerate'], magmaFist: ['熔岩重拳', 'chainPalm', ['brn:30']],
  starFist: ['流星拳', 'drakeFang', ['spe+1'], 'heavenFist'],
  // 樂器
  woodFlute: ['催眠笛音', 'sonicBoom', ['slp:15']], travelLute: ['旅人之歌', 'sonicBoom', ['heal+15'], 'echoBlast'], forestHarp: ['森之和弦', 'verdantWind', ['tangle']],
  moonLyre: ['月光小夜曲', 'songOfValor', ['heal+15']], windHorn: ['風之號令', 'songOfValor', ['spe+1'], 'battleSong'], iceHarp: ['冰弦', 'tidalRage', ['fspe-1']],
  starLyre: ['星之詠唱', 'holyWard', ['mp:5'], 'healSong'],
  // 火槍
  corkGun: ['軟木塞連射', 'twinFang', ['fatk-1'], 'gunDraw'], brassPistol: ['三連射', 'twinFang', ['hit+1'], 'quickDraw'], steamRifle: ['蒸汽射擊', 'steamCannon', ['wet'], 'gunDraw'],
  gearRepeater: ['齒輪連發', 'bladeRain', ['hit+1'], 'fullBurst'], boltCannon: ['雷管砲擊', 'thorHammer', ['fdef-1'], 'megaCannon'], frostMusket: ['霜火彈', 'steamCannon', ['fspe-1', 'brn:30'], 'gunDraw'],
  starBlaster: ['星爆砲擊', 'starfall', ['crit'], 'megaCannon'],
  // 法杖
  apprenticeStaff: ['見習魔彈', 'arcaneShot', ['mp:2']], practiceWand: ['練習魔彈', 'arcaneShot', ['spec+1']], oakStaff: ['森林之息', 'verdantWind', ['mp:2']],
  thornStaff: ['荊棘纏繞', 'thornBind', ['tangle']], ruinStaff: ['符文障壁', 'manaWall', ['def+1']], tideStaff: ['潮汐彈', 'aquaEdge', ['wet']],
  stormStaff: ['雷鳴連鎖', 'chainLightning', ['spa+1']], emberRod: ['燼火彈', 'fireShot', ['spa+1']], voltRod: ['雷角閃', 'bolt', ['spe+1']],
  quartzWand: ['礦晶彈', 'arcaneShot', ['fspd-1']], fangWand: ['狼嚎彈', 'arcaneShot', ['fatk-1']], magusStaff: ['宮廷治癒', 'mend', ['cure']],
  foxfireStaff: ['狐火漩渦', 'flameVortex', ['spe+1']], crystalStaff: ['水晶怒濤', 'tidalRage', ['fspd-1']], dawnStaff: ['晨曦光炎', 'flameVortex', ['heal+15']],
  masterStaff: ['名匠障壁', 'manaWall', ['spa+1']], wyrmStaff: ['潮龍怒濤', 'tidalRage', ['heal+15']], lakeStaff: ['湖霧之癒', 'mend', ['shield:1']],
  riftStaff: ['裂界凝神', 'focusMind', ['mp:3']], harpyStaff: ['鷹羽之風', 'manaWall', ['spe+1']], bogStaff: ['沼霧', 'smokeVeil', ['heal+15']],
  hydraStaff: ['蛇毒魔彈', 'arcaneShot', ['psn:30']], courtStaff: ['宮廷聖護', 'holyWard', ['cure']], windStaff: ['風鳴嵐', 'verdantWind', ['spe+1']],
  gearStaff: ['齒輪結界', 'ironWall', ['spec+1']], glacierStaff: ['冰河怒濤', 'tidalRage', ['spa+1']], volcanoStaff: ['火山爆', 'combustion', ['brn:30']],
  voidStaff: ['虛空聖域', 'holyWard', ['def+1']], starStaff: ['星見流星', 'starfall', ['heal+15']],
  // 魔導書
  primerTome: ['入門魔法', 'arcaneShot', ['cheap']], herbalTome: ['森之刃', 'aquaEdge', ['drain:20']], ancientTome: ['古岩之守', 'ironWall', ['mp:3']],
  stolenTome: ['靈光一現', 'focusMind', ['spa+1']], deathTome: ['亡者吸魂', 'arcaneShot', ['drain:20']], sageTome: ['賢者時停', 'chronoLock', ['mp:5']],
  starTome: ['星典隕星', 'starfall', ['spa+1']], voidTome: ['虛空凍結', 'chronoLock', ['shield:1']], lakeTome: ['湖之刃', 'aquaEdge', ['heal+15']],
  riftTome: ['裂界魔彈', 'arcaneShot', ['crit']], sandTome: ['沙暴', 'verdantWind', ['fspe-1']], witchTome: ['魔女毒霧', 'verdantWind', ['psn:30']],
  royalTome: ['王立聖典', 'songOfValor', ['def+1']], lichTome: ['巫妖冰潮', 'tidalRage', ['drain:20']],
};
// elements without their own picture use the archetype's; a magic archetype cast in another element gets that element's bolt / wave
const W12_EL_FX = { 火: ['fireBolt', 'flameWave'], 水: ['aquaBlade', 'aquaBurst'], 雷: ['thunder', 'chainBolt'], 草: ['leaf', 'leafStorm'] };
const W12_TP = { 1: 55, 2: 60, 3: 70, 4: 78, 5: 86, 6: 94, 7: 104 }; // total power by tier, for a support weapon that now attacks
const W12_SAND = { 沙暴: '岩', 風鳴嵐: '一般', 魔女毒霧: '毒' };
// what each archetype does (its own built-in effects included), without naming an element: the element is put in front when it has one
const W12_ARCH_D = { swallowFlight: '兩段斬擊', galeCut: '搶先突進，削減護盾', thornBind: '容易會心的斬擊', cloudPierce: '無視部分物防的突刺', crossJudge: '十字斬，容易會心',
  steelCleaver: '對破防的對手威力大增', bloodMoon: '吸取對手生命的斬擊', allOut: '威力極大，但自己也會受到反傷', dawnFlash: '搶先的居合斬，容易會心', bladeRain: '連續斬擊',
  steamCannon: '攻擊全體的衝擊', shadowRush: '從影子中突刺，容易會心', twinFang: '兩段快速攻擊', assassinMark: '對HP低的對手威力大增', lastWall: 'HP越低威力越大',
  rockBreak: '砸碎盔甲，降低物防，削減護盾', shieldRam: '整個人撞過去，削減護盾，50%讓對手退縮', drakeFang: '兩段穿透突刺', chainPalm: '連續出拳，累積氣',
  arcaneShot: '純粹的魔力彈', sonicBoom: '音波衝擊，20%讓對手退縮', verdantWind: '席捲全體的風暴', songOfValor: '物攻和魔攻各提升一級', tidalRage: '席捲全體的大浪',
  holyWard: '回復HP並展開護盾', thorHammer: '從天而降的雷槌攻擊全體，30%麻痺', starfall: '召喚隕石攻擊全體，20%灼傷', manaWall: '展開魔法護盾，傷害減少',
  aquaEdge: '魔法刃', chainLightning: '連鎖的魔法攻擊全體，20%麻痺', fireShot: '魔法彈，20%灼傷', bolt: '攻擊全體的魔法，10%麻痺', mend: '回復HP',
  flameVortex: '捲起漩渦攻擊全體，20%灼傷', focusMind: '下一次攻擊必定會心', smokeVeil: '3次行動內迴避提升', ironWall: '物防、魔防各+2',
  combustion: '攻擊全體，對灼傷的對手威力大增（會消耗灼傷）', chronoLock: '讓時間靜止，對手暫時無法行動' };
{ const old = weaponSkill12, seen = new Map(), names = new Set(Object.values(DEF.skills).map(D => D.name));
  const avgHits = D => D.hits ? (D.hits[0] + D.hits[1]) / 2 : 1;
  for (const k in W12) { const G = GEAR[k]; if (!G || G.slot !== 'weapon') { bvErr('v12', 'w12 ' + k + ' not a weapon'); continue; }
    const [n, arch, codes, fxOwn] = W12[k], base = MOVES['o_' + arch], AD = DEF.skills['o_' + arch], cur = DEF.skills[old(k)]; if (!base || !AD) { bvErr('v12', 'w12 arch ' + arch); continue; }
    const combo = arch + '|' + codes.join(','); if (seen.has(combo)) bvErr('v12', 'w12 same skill ' + k + ' / ' + seen.get(combo)); seen.set(combo, k);
    if (names.has(n)) bvErr('v12', 'w12 name taken ' + n); names.add(n);
    const id = 'u_' + k, dmg = (AD.power || 0) > 0, curTotal = cur && cur.power ? cur.power * avgHits(cur) : 0, total = curTotal || W12_TP[G.t] || 80;
    const pow = dmg ? Math.max(10, Math.round(total / avgHits(AD))) : 0, archMp = ORB_A[arch].mp || 5, archTotal = (AD.power || 1) * avgHits(AD);
    const mp = dmg ? clamp(Math.round(archMp * total / archTotal), 2, 12) : archMp;
    const magic = AD.cat === '特', aoe = AD.target === 'all_enemies', el = W12_SAND[n] || (dmg && G.elem ? G.elem : magic ? AD.el : '一般'); // a physical archetype keeps no element of its own
    const fx = fxOwn && FX[fxOwn] ? fxOwn : magic && el !== AD.el && W12_EL_FX[el] ? W12_EL_FX[el][aoe ? 1 : 0] : AD.fx; if (fxOwn && !FX[fxOwn]) bvErr('v12', 'w12 fx ' + fxOwn);
    const d = (dmg && el !== '一般' ? el + '屬性・' : '') + (W12_ARCH_D[arch] || (base.d || '').replace(/。$/, '')) + '；' + codes.map(evoText).join('、') + '。';
    MOVES[id] = { ...base, n, d, t: el, pow, fx, uniq: k, ws: 1, ueff: codes.slice(), orb: undefined }; SKILL_MP[id] = mp;
    const [cd, learn, prio] = SKILL12[arch] || [0, 6];
    defPut('skills', id, { ...skillFromMove(id, MOVES[id], { kind: 'skill', tpl: ORB_A[arch].tpl, extraTags: ['weapon'], costs: dmg || archMp ? [{ res: 'mp', amount: mp }] : [], fallback: 'attack' }),
      cooldown: cd, prio: prio || 0, metadata: { uniq: k, tpl: arch, learn, w12: 1 } });
    const D = DEF.skills[id]; D.fx = fx; // registered after bvFinalize: give the effects their ids the same way (spec §4)
    D.effects = D.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); D.after = D.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); if (prio) D.tags = D.tags.filter(t => t !== 'priority').concat(['priority']); }
  weaponSkill12 = function (k) { return W12[k] && DEF.skills['u_' + k] ? 'u_' + k : old(k); };
}
