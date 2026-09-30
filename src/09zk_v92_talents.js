/* ===================== v9.2 天賦重做：每層二選一 =====================
   Playtest ask: "重做好了 各項名稱也重製". The old trees were 7 tiles per branch, two thirds of them "+3% ×3", with the same
   tiles repeated across classes (特技層數−1 in 9 branches) and almost nothing to pick before Lv14.
   Now every class has 3 new branches (流派), each with 5 tiers; every tier offers TWO options and you take one:
     · a tier costs its number in points (1／2／3／4／5 → 15 for a whole branch); tiers 4–5 open after 天賦覺醒 (Lv14)
     · a tier needs the one above it; the pick inside a bought tier can be swapped for free at any time (outside battle)
     · 分支共鳴 still triggers at 5／10／15 points in a branch (= after tiers 3, 4 and 5)
   New effects hook into the v9 systems: 連段 (上限・不中斷・開場段數・每段加成), 夥伴援護 (效果・次數), 特技 (開場層數),
   開場護盾, 戰後回復. All option / branch names are new. Saves: the old tiles are refunded once, with a notice. */

/* ---------- data: [branch name, blurb, [[optA, optB] ×5]] ; option = [name, 'key:v,key:v'] ---------- */
const T9 = {
  swordsman: { pitch: '身經百戰的戰士。疾風靠會心和連段連斬，血戰以血換力，對決擅長先制、反擊與看破。', br: [
    ['疾風', '會心與連段，出手越快越強。', [[['凝神', 'dmgUp:10'], ['銳眼', 'crit:6']], [['連勢', 'actUp:15'], ['鋼身', 'hpP:8,defP:5']], [['流水', 'comboKeep:1'], ['燕返', 'fx.double:1']], [['破綻', 'critDmg:30,crit:3'], ['斷鋼', 'pierceT:20']], [['風舞', 'comboMax:2'], ['斷空', 'spcUp:50,chargeCut:1']]]],
    ['血戰', '以血換力，越戰越勇。', [[['戰意', 'dmgUp:10'], ['蠻勁', 'atkP:6']], [['飲血', 'drain:5'], ['厚皮', 'hpP:10']], [['怒吼', 'rage:1'], ['劈裂', 'fx.cleave:1']], [['死鬥', 'fx.lastStand:1'], ['不倒', 'endureT:1,hpP:5']], [['狂嵐', 'atkP:10,actUp:20'], ['血祭', 'drain:8,fx.predator:1']]]],
    ['對決', '先制、反擊與看破。', [[['氣魄', 'dmgUp:10'], ['踏步', 'speP:8']], [['搶攻', 'fx.first:1'], ['架勢', 'guardPlus:1']], [['回身', 'counter:1'], ['穿心', 'pierceT:15']], [['看穿', 'weakUp:20'], ['破盾', 'fx.breaker:1,shieldChip:30']], [['霸者', 'bigUp:20,actUp:15'], ['百鍊', 'comboStep:3,comboStart:1']]]],
  ] },
  mage: { pitch: '操控魔力的術士。紅蓮以火焰爆發，蒼雷用速度與麻痺壓制，秘法精通MP的運用。', br: [
    ['紅蓮', '火焰與爆發傷害。', [[['火種', 'fireUp:12'], ['咒力', 'dmgUp:10']], [['灼心', 'spaP:7'], ['餘燼', 'magCrit:6']], [['魔潮', 'fx.arcaneSurge:1'], ['烈陣', 'actUp:15']], [['炎爆', 'critDmg:30'], ['元素鎖', 'elem:15']], [['劫火', 'fireUp:30,spaP:5'], ['焚天', 'spcUp:50,chargeCut:1']]]],
    ['蒼雷', '雷電、速度與麻痺。', [[['雷種', 'boltUp:12'], ['疾電', 'speP:8']], [['雷痕', 'fx.stormMark:1'], ['靜電', 'magCrit:6']], [['迴路', 'comboKeep:1'], ['導雷', 'chargeCut:1']], [['落雷', 'boltUp:20,critDmg:15'], ['疾走', 'fx.first:1,speP:6']], [['雷帝', 'boltUp:25,comboStep:3'], ['天雷', 'actUp:30']]]],
    ['秘法', 'MP的運用與借用技能。', [[['咒文', 'dmgUp:10'], ['魔庫', 'mpP:15']], [['冥想', 'mpRegen:3'], ['節流', 'mpSave:10']], [['循環', 'fx.freeCast:1'], ['借法', 'subUp:25']], [['萬象', 'elem:15,mpP:10'], ['靜思', 'fx.mpGuard:1,spdP:8']], [['賢者', 'spaP:10,mpRegen:3'], ['禁咒', 'actUp:20,comboStep:3']]]],
  ] },
  guardian: { pitch: '站在最前線的守護者。聖盾治癒與不屈，磐石把防禦練到極致，報復把傷害加倍奉還。', br: [
    ['聖盾', '治癒、再生與夥伴。', [[['祈禱', 'healUp:15'], ['堅忍', 'hpP:8']], [['聖光', 'fx.guardHeal:1'], ['淨身', 'statusRes:20']], [['復甦', 'fx.regen:1'], ['屏障', 'openShield:2']], [['護體', 'elemRes:15,defP:6'], ['不屈', 'endureT:1']], [['聖域', 'healUp:25,winHeal:15'], ['守誓', 'allyUp:50,allyMore:1']]]],
    ['磐石', '物防魔防與防禦。', [[['鐵甲', 'defP:8'], ['符甲', 'spdP:8']], [['定樁', 'guardPlus:1'], ['厚實', 'hpP:10']], [['荊甲', 'fx.thorns:1'], ['靜守', 'comboGuard:1,fx.mpGuard:1']], [['堅城', 'defP:12,spdP:12'], ['亡者盾', 'fx.deathWard:1']], [['城牆', 'defP:15,hpP:10'], ['反擊壁', 'counter:1,atkP:8']]]],
    ['報復', '反擊與復仇。', [[['沉重', 'dmgUp:10'], ['怒意', 'atkP:6']], [['還擊', 'counter:1'], ['嗜戰', 'drain:5']], [['逆境', 'rage:1'], ['碎甲', 'fx.cleave:1']], [['審判', 'fx.lastStand:1'], ['以牙', 'critDmg:25,crit:4']], [['清算', 'actUp:25,atkP:6'], ['怒濤', 'spcUp:50,chargeCut:1']]]],
  ] },
  ranger: { pitch: '敏捷的獵人。影殺一擊致命，風行以迴避與連段周旋，鷹眼看破弱點。', br: [
    ['影殺', '會心、毒與致命一擊。', [[['殺意', 'dmgUp:10'], ['弱穴', 'crit:6']], [['淬毒', 'fx.poisonEdge:1'], ['獵眼', 'weakUp:12']], [['無聲', 'assassin:1'], ['毒噬', 'venomous:25']], [['割喉', 'critDmg:30'], ['獵殺', 'fx.predator:1']], [['絕影', 'crit:8,critDmg:20,actUp:15'], ['千擊', 'fx.double:1,atkUp:20,bigUp:10']]]],
    ['風行', '迴避、連段與反擊。', [[['輕身', 'eva:5'], ['疾足', 'speP:8']], [['旋舞', 'atkUp:20'], ['連步', 'comboStart:1']], [['幻步', 'shadowStep:1'], ['雙擊', 'fx.double:1']], [['流轉', 'comboKeep:1,comboGuard:1'], ['伏擊', 'atkMp:3,specStart:2']], [['追風', 'fx.swift:1,eva:5'], ['虛影', 'comboMax:1,chargeCut:1']]]],
    ['鷹眼', '弱點、先制與屠巨。', [[['專注', 'dmgUp:10'], ['瞄準', 'hit:10']], [['先制', 'fx.first:1'], ['貫甲', 'pierceT:15']], [['獵印', 'weakUp:20'], ['裝填', 'specStart:2']], [['狙擊', 'critDmg:25,crit:4'], ['巨獵', 'bigUp:15']], [['必中', 'actUp:30'], ['獵王', 'bigUp:15,fx.predator:1']]]],
  ] },
  bard: { pitch: '以歌聲戰鬥的旅人。凱歌激昂作戰，聖詠守護生命與夥伴，舞步讓普攻與借用技能發揮到極致。', br: [
    ['凱歌', '特技與夥伴。', [[['音感', 'dmgUp:10'], ['高亢', 'spaP:6']], [['高揚', 'actUp:15'], ['節拍', 'comboStart:1']], [['狂想', 'fx.fervor:1'], ['合奏', 'allyUp:40']], [['破音', 'critDmg:25,magCrit:5'], ['間奏', 'chargeCut:1']], [['英雄頌', 'spcUp:50,specStart:2'], ['終章', 'comboMax:1,comboStep:3']]]],
    ['聖詠', '治癒、MP與不屈。', [[['慈歌', 'healUp:15'], ['清泉', 'mpRegen:3']], [['搖籃', 'fx.regen:1'], ['淨音', 'statusRes:20']], [['和聲', 'mpSave:12,mpP:10'], ['餘韻', 'winHeal:15']], [['安息', 'endureT:1,hpP:6'], ['共鳴', 'allyMore:1']], [['鎮魂', 'healUp:30,hpP:10'], ['天籟', 'fx.freeCast:1,spaP:8']]]],
    ['舞步', '普攻、迴避與借用技能。', [[['律動', 'dmgUp:10'], ['輕步', 'eva:5']], [['踏歌', 'atkUp:20'], ['借曲', 'subUp:25']], [['迴旋', 'fx.double:1'], ['韻律', 'comboKeep:1']], [['強音', 'critDmg:25,crit:4'], ['吸音', 'fx.manaSiphon:1,atkMp:2']], [['謝幕', 'chargeCut:1,spcUp:30'], ['魔詩', 'fx.spellblade:1']]]],
  ] },
  machinist: { pitch: '操縱機關的工匠。火力追求會心與爆發，齒輪讓特技不停運轉，修械又硬又能自我修復。', br: [
    ['火力', '會心與爆發。', [[['火藥', 'dmgUp:10'], ['準星', 'hit:10']], [['炸裂', 'critDmg:15'], ['徹甲', 'fx.pierce:1']], [['連射', 'fx.double:1'], ['蓄能', 'specStart:2']], [['強襲', 'bigUp:15,atkP:5'], ['集火', 'weakUp:20']], [['全火力', 'actUp:30'], ['終焉', 'spcUp:50,chargeCut:1']]]],
    ['齒輪', '特技與MP循環。', [[['發條', 'spcUp:15'], ['蓄電', 'mpP:15']], [['充能', 'atkMp:2'], ['預熱', 'specStart:1']], [['傳動', 'chargeCut:1'], ['增壓', 'atkUp:20']], [['永動', 'comboKeep:1,mpRegen:3'], ['電擊', 'fx.stormMark:1,boltUp:15']], [['機關城', 'spcUp:40,specStart:2'], ['超載', 'comboMax:1,comboStep:3']]]],
    ['修械', '防禦與修復。', [[['鋼板', 'defP:8'], ['外殼', 'hpP:8']], [['保養', 'healUp:20'], ['防電', 'elemRes:12']], [['自修', 'fx.regen:1'], ['反應甲', 'fx.thorns:1']], [['塗層', 'statusRes:25,defP:6'], ['護盾機', 'openShield:2']], [['堡壘', 'defP:12,hpP:12'], ['急救包', 'endureT:1,winHeal:15']]]],
  ] },
  monk: { pitch: '鍛鍊身心的武僧。剛勁以普攻與連段打穿一切，內功運用魔力與MP，坐忘讓身體不受動搖。', br: [
    ['剛勁', '普攻與連段。', [[['發力', 'dmgUp:10'], ['虎力', 'atkP:6']], [['連環', 'fx.double:1'], ['崩勁', 'pierceT:15']], [['氣勢', 'comboStart:1,comboStep:2'], ['要穴', 'crit:6']], [['百裂', 'comboMax:1'], ['發勁', 'critDmg:30']], [['碎山', 'spcUp:50,chargeCut:1'], ['羅漢', 'atkUp:30,atkP:6']]]],
    ['內功', '氣、魔力與MP。', [[['運氣', 'mpRegen:3'], ['內勁', 'spaP:6']], [['聚氣', 'atkMp:2'], ['凝氣', 'dmgUp:10']], [['行氣', 'fx.freeCast:1'], ['氣海', 'mpP:20']], [['真氣', 'magCrit:6,spaP:6'], ['氣牆', 'fx.mpGuard:1,comboGuard:1']], [['化勁', 'fx.spellblade:1'], ['天人合一', 'chargeCut:1,actUp:20']]]],
    ['坐忘', '迴避與耐久。', [[['忘我', 'eva:5'], ['鋼骨', 'hpP:8']], [['游身', 'speP:8'], ['明心', 'statusRes:20']], [['不動心', 'guardPlus:1'], ['空身', 'shadowStep:1']], [['回春', 'fx.regen:1'], ['禪心', 'endureT:1,defP:6']], [['金身', 'hpP:12,defP:10,spdP:10'], ['涅槃', 'winHeal:20,healUp:20']]]],
  ] },
  dragoon: { pitch: '與龍締約的騎士。蒼龍貫穿一切，龍裔讓身體更強韌，翔空把普攻與特技連成一氣。', br: [
    ['蒼龍', '穿透與屠龍。', [[['龍威', 'dmgUp:10'], ['剛腕', 'atkP:6']], [['貫穿', 'pierceT:15'], ['斬龍', 'bigUp:10']], [['先鋒', 'fx.first:1'], ['龍擊', 'actUp:15']], [['逆鱗', 'critDmg:30'], ['裂天', 'weakUp:20']], [['龍神', 'actUp:25,bigUp:8'], ['天墜', 'spcUp:50,chargeCut:1']]]],
    ['龍裔', '耐久與吸血。', [[['龍甲', 'defP:8'], ['龍心', 'hpP:8']], [['渴血', 'drain:5'], ['龍焰', 'fireUp:15']], [['龍脈', 'fx.regen:1'], ['逆火', 'fx.thorns:1']], [['鱗護', 'elemRes:15,defP:6'], ['不滅', 'endureT:1']], [['龍王', 'hpP:12,drain:5'], ['焚身', 'fx.lastStand:1,fireUp:15']]]],
    ['翔空', '速度、普攻與特技。', [[['騰躍', 'speP:8'], ['輕翼', 'eva:5']], [['急刺', 'atkUp:20'], ['凌空', 'specStart:1']], [['天梯', 'chargeCut:1'], ['俯衝', 'comboKeep:1']], [['隕落', 'spcUp:30'], ['連躍', 'comboStart:1,comboStep:2']], [['星墜', 'comboMax:1,atkUp:15'], ['蒼天', 'fx.swift:1,atkUp:20']]]],
  ] },
  otherworlder: { pitch: '來自異界的勇者。什麼武器都能用：曙光和夥伴一起變強，越界善用弱點與借用技能，時律掌握先機。', br: [
    ['曙光', '全面強化與夥伴。', [[['奮起', 'atkP:5,spaP:5'], ['強身', 'hpP:8']], [['庇護', 'defP:6,spdP:6'], ['求知', 'fx.wisdom:1']], [['羈絆', 'allyUp:50'], ['覺悟', 'endureT:1']], [['決勝', 'critDmg:25,crit:4'], ['初心', 'winHeal:15,statusRes:15']], [['勇者魂', 'allyMore:1,actUp:15'], ['光輝', 'actUp:25,spcUp:25']]]],
    ['越界', '弱點與借用技能。', [[['洞察', 'weakUp:12'], ['靈素', 'elem:10']], [['借勢', 'subUp:25'], ['魔源', 'mpP:15']], [['異能', 'chargeCut:1'], ['淘金', 'fx.fortune:1']], [['斬巨', 'bigUp:15'], ['異界流', 'comboKeep:1,comboStart:1']], [['萬能', 'weakUp:20,elem:15'], ['超越', 'comboMax:2']]]],
    ['時律', '速度與先機。', [[['倍速', 'speP:8'], ['殘像', 'eva:5']], [['省力', 'mpSave:10'], ['靈泉', 'mpRegen:3']], [['預判', 'fx.first:1'], ['預知', 'specStart:2']], [['時停', 'fx.swift:1'], ['逆轉', 'fx.deathWard:1']], [['時之王', 'speP:10,comboStep:3'], ['永劫', 'endureT:1,fx.regen:1']]]],
  ] },
  spellblade: { pitch: '讓劍與魔法合而為一的魔劍士。魔紋讓攻魔共鳴，闇月追求會心與特技，四象讓每一種屬性都更強。', br: [
    ['魔紋', '物攻與魔攻共鳴。', [[['靈壓', 'dmgUp:10'], ['魔親', 'spaP:6']], [['剛柔', 'atkP:5,spaP:5'], ['湧泉', 'fx.arcaneSurge:1']], [['合一', 'spellblade:1'], ['纏雷', 'fx.stormMark:1']], [['魔晶', 'critDmg:25,magCrit:5'], ['雙極', 'comboStart:1,comboStep:2']], [['解放', 'actUp:30'], ['魔導王', 'comboMax:1,actUp:10']]]],
    ['闇月', '會心與特技。', [[['月眼', 'crit:6'], ['奧秘', 'magCrit:6']], [['月泉', 'mpRegen:3'], ['缺月', 'weakUp:12']], [['蝕刻', 'chargeCut:1'], ['蝕月', 'specStart:2']], [['暗月', 'critDmg:30'], ['朔夜', 'fx.predator:1']], [['月蝕刻', 'spcUp:50,chargeCut:1'], ['新月', 'crit:8,critDmg:20']]]],
    ['四象', '四系屬性。', [[['炎符', 'fireUp:12'], ['雷符', 'boltUp:12']], [['水符', 'type:水:12'], ['草符', 'type:草:12']], [['元素流', 'elem:12'], ['元素盾', 'elemRes:15']], [['四元', 'elem:10,fireUp:10,boltUp:10'], ['共振', 'dmgUp:12']], [['元素王', 'elem:25'], ['萬象歸一', 'actUp:20,elem:10']]]],
  ] },
};
const T9C = {}; // cls → [ { n, d, tiers: [[{n, fx, b, t, o}, …] ×5] } ×3 ]
const parseFx9 = s => s.split(',').map(p => { const i = p.lastIndexOf(':'); return [p.slice(0, i), +p.slice(i + 1)]; });
for (const c in T9) { T9C[c] = T9[c].br.map(([n, d, tiers], b) => ({ n, d, tiers: tiers.map((pair, t) => pair.map(([on, fx], o) => ({ n: on, fx: parseFx9(fx), b, t, o }))) }));
  if (CLASS_V7[c]) { CLASS_V7[c].pitch = T9[c].pitch; T9[c].br.forEach(([n, d], b) => { if (CLASS_V7[c].br[b]) { CLASS_V7[c].br[b][0] = n; CLASS_V7[c].br[b][1] = d; } }); } }

/* ---------- texts for the new effects ---------- */
Object.assign(TK_TXT, {
  comboMax: v => '連段上限+' + v, comboKeep: () => '重複同一招時，連段不會中斷', comboStart: v => '每場戰鬥開場就有' + v + '段連段', comboStep: v => '每段連段的傷害加成+' + v + '%',
  comboGuard: () => '防禦和使用道具時，連段不會中斷', allyUp: v => '夥伴援護的效果+' + v + '%', allyMore: v => '夥伴援護每場多' + v + '次（格倫：對手HP30%以下；莉婭：你的HP再次低於40%）',
  dmgUp: v => '造成的傷害+' + v + '%', specStart: v => '每場戰鬥開場，特技就累積' + v + '層', openShield: v => '每場戰鬥開場展開' + v + '回合護盾（傷害-40%）', winHeal: v => '戰鬥勝利後回復' + v + '%最大HP',
});
const optDesc9 = O => O.fx.map(([k, v]) => tDesc(k, v)).join('、');

/* ---------- state: st.tc = { cls, p: { 'b.t': option } } — a different class starts empty ---------- */
// v9.3: every class keeps its own picks (changing class and back is no longer a free reset)
const tcOf = (st = Game.st) => { const A = st.tcAll || (st.tcAll = {}); if (st.tc && st.tc.cls && st.tc.p) { if (!A[st.tc.cls]) A[st.tc.cls] = st.tc.p; } delete st.tc; return A[st.cls] || (A[st.cls] = {}); };
const tierCost9 = t => t + 1;
const tcHas = (b, t, st = Game.st) => tcOf(st)[b + '.' + t] !== undefined;
const brPts9 = (b, st = Game.st) => { let s = 0; for (let t = 0; t < 5; t++) if (tcHas(b, t, st)) s += tierCost9(t); return s; };
function tcPicked(st = Game.st) { const T = T9C[st.cls]; if (!T || !st.cls) return []; const P = tcOf(st), out = []; for (const k in P) { const [b, t] = k.split('.').map(Number); const O = T[b] && T[b].tiers[t] && T[b].tiers[t][P[k]]; if (O) out.push(O); } return out; }
tpSpent = function (st = Game.st) { if (!st || !st.cls || !T9C[st.cls]) return 0; let s = 0; for (let b = 0; b < 3; b++) s += brPts9(b, st); return s; };
talentSum = function (key, st = Game.st) {
  if (!st || !st.cls) return 0; let v = 0; for (const O of tcPicked(st)) for (const [k, x] of O.fx) if (k === key) v += x;
  if (typeof V9_SUM_KEYS !== 'undefined' && V9_SUM_KEYS.has(key)) { const S = CLASS_SIG[clsV7(st.cls)] || [null, []]; for (const [k, x] of [...S[1], ...resOn(st), ...setBonus(st)]) if (k === key) v += x; }
  return v;
};
applyTalents = function (s, st = Game.st) {
  if (!st || !st.cls) return s; const pct = {}; s.kindUp = s.kindUp || {}; s.typeUp = s.typeUp || {};
  for (const O of tcPicked(st)) for (const [k, v] of O.fx) {
    if (k.startsWith('kind:')) s.kindUp[k.slice(5)] = (s.kindUp[k.slice(5)] || 0) + v; else if (k.startsWith('type:')) s.typeUp[k.slice(5)] = (s.typeUp[k.slice(5)] || 0) + v;
    else if (k.startsWith('fx.')) s.fx[k.slice(3)] = 1; else if (/^(hp|atk|def|spa|spd|spe|mp)P$/.test(k)) pct[k.slice(0, -1)] = (pct[k.slice(0, -1)] || 0) + v; else s[k] = (s[k] || 0) + v; }
  for (const k in pct) s[k] = Math.floor(s[k] * (1 + pct[k] / 100)); if (s.endureT) s.fx.endure = 1; return s;
};
resOn = function (st = Game.st) { const R = RESONANCE[st.cls], out = []; if (!R || !T9C[st.cls]) return out; R.forEach((tiers, b) => { const p = brPts9(b, st); tiers.forEach((t, i) => { if (p >= RES_AT[i]) out.push(t); }); }); return out; };
function tierBlock9(b, t, st = Game.st) {
  if (tcHas(b, t, st)) return null; if (t > 0 && !tcHas(b, t - 1, st)) return '要先選好第' + t + '層';
  if (t >= 3 && !deepOk(st)) return st.lv < 14 ? 'Lv14後找村長進行「天賦覺醒」' : '找萌芽鎮的村長進行「天賦覺醒」';
  if (tpAvail(st) < tierCost9(t)) return '天賦點不足（需要' + tierCost9(t) + '點）'; return null;
}
function tierRefundBlock9(b, t, st = Game.st) { if (!tcHas(b, t, st)) return '這一層還沒有選'; if (t < 4 && tcHas(b, t + 1, st)) return '要先退回第' + (t + 2) + '層'; return null; }
// tests / 推薦: fill the branches in order, taking option `pick` (0 or 1) in every tier
function tcAuto(st = Game.st, pick = 0) { const P = tcOf(st); for (let b = 0; b < 3; b++) for (let t = 0; t < 5; t++) { if (tcHas(b, t, st)) continue; if (tierBlock9(b, t, st)) break; P[b + '.' + t] = typeof pick === 'function' ? pick(b, t) : pick; } }

/* ---------- battle hooks: 傷害加成, opening combo / special / shield, and the 戰後回復 ---------- */
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) { const r = _cd.call(this, u, t, mv); if (u && u.hero && mv && mv.pow && r && r.dmg > 0) { const d = talentSum('dmgUp'); if (d) r.dmg = Math.round(r.dmg * (1 + d / 100)); } return r; }; }
// v9.2.3: the nine weapon-shaped branch icons were redrawn by Codex (task R) without weapons
{ const _ca = Battle.prototype.chooseAction; Battle.prototype.chooseAction = function* () {
    if (!this._t9 && this.H) { this._t9 = 1; const c0 = talentSum('comboStart'), s0 = talentSum('specStart'), sh = talentSum('openShield');
      if (c0) this.combo = Math.max(this.combo || 0, c0); if (s0) this.H.wc = Math.max(this.H.wc || 0, s0); if (sh) this.H.shield = Math.max(this.H.shield || 0, sh); }
    return yield* _ca.call(this);
  }; }
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () {
    const st = Game.st, p = talentSum('winHeal'); if (p && st.hp > 0) { const mx = heroStats().hp, h = Math.min(mx - st.hp, Math.ceil(mx * p / 100)); if (h > 0) { st.hp += h; yield* this.msg('（天賦）戰鬥結束，回復了' + h + '點HP。', { hold: 14 }); } }
    return yield* _v.call(this);
  }; }

/* ---------- the talent screen ---------- */
talentScreen = function* () {
  const st = Game.st, T = T9C[st.cls]; if (!T) { yield* say('先在萌芽鎮的村長那裡完成覺醒的儀式吧。'); return; }
  let br = 0, row = 0, col = 0, msg = '', msgT = 0; const ccol = classColOf(st.cls), RN = ['一', '二', '三', '四', '五'], fresh = new Set(); // v9.3: tiers learned in this visit
  const RY = t => 46 + t * 24 + (t >= 3 ? 8 : 0), OX = o => 28 + o * 73, OW = 71;
  const act = () => { if (row < 0) { row = 0; return; } const O = T[br].tiers[row][col], key = br + '.' + row, P = tcOf(st);
    if (tcHas(br, row, st)) { if (P[key] === col) { msg = '已經選擇了「' + O.n + '」'; msgT = 40; Sound.sfx('bump'); return; } if (!fresh.has(key)) { msg = '已確定的天賦要用「遺忘之書」重置才能改'; msgT = 70; Sound.sfx('bump'); return; } P[key] = col; clampHP(); Sound.sfx('select'); msg = '換成了「' + O.n + '」'; msgT = 50; return; }
    const blk = tierBlock9(br, row, st); if (blk) { Sound.sfx('bump'); msg = blk; msgT = 60; return; }
    P[key] = col; fresh.add(key); clampHP(); Sound.sfx('statUp'); msg = '學會了「' + O.n + '」！（離開畫面前還能改）'; msgT = 60; };
  const refund = () => { if (row < 0) return; const blk = tierRefundBlock9(br, row, st) || (fresh.has(br + '.' + row) ? null : '已確定的天賦要用「遺忘之書」重置'); if (blk) { Sound.sfx('bump'); msg = blk; msgT = 60; return; } fresh.delete(br + '.' + row); delete tcOf(st)[br + '.' + row]; clampHP(); Sound.sfx('cancel'); msg = '退回了' + tierCost9(row) + '點。'; msgT = 40; };
  const scr = { draw(x) {
    const TR = typeof touchRegion === 'function';
    screenBG(x); headerBar(x, '天賦・' + CLASSES[st.cls].n); const av = tpAvail(st); Font.drawR(x, '天賦點 ' + av, W - 6, 2, av ? UIC.warm : UIC.muted, UIC.textSh);
    T.forEach((B, b) => { const X = 4 + b * 57, ic = branchIcon(st.cls, b), on = b === br; drawBtn(x, X, 22, 54, 17, on && row < 0, on ? ccol : null); if (ic) x.drawImage(ic, X + 2, 24);
      Font.drawC(x, B.n, X + (ic ? 31 : 27), 21, on ? '#ffffff' : shade(ccol, 0.35), UIC.textSh, B.n.length > 3 && ic ? 8 : 10); Font.drawR(x, String(brPts9(b, st)), X + 52, 29, UIC.muted, UIC.textSh, 7);
      RES_AT.forEach((q, i) => { x.fillStyle = brPts9(b, st) >= q ? '#ffd860' : '#30375a'; x.fillRect(X + 18 + i * 7, 40, 5, 2); });
      if (TR) touchRegion(X, 22, 54, 20, () => { if (br !== b) { br = b; Sound.sfx('cursor'); } else { row = -1; } }); });
    if (!deepOk(st)) Font.drawR(x, '深層（天賦覺醒後開放）', 172, RY(3) - 12, UIC.dis, UIC.textSh, 7);
    x.fillStyle = deepOk(st) ? 'rgba(255,200,100,0.35)' : 'rgba(120,120,150,0.35)'; x.fillRect(4, RY(3) - 3, 168, 1);
    for (let t = 0; t < 5; t++) { const Y = RY(t), has = tcHas(br, t, st), pick = tcOf(st)[br + '.' + t], blk = tierBlock9(br, t, st), locked = !has && blk && !blk.startsWith('天賦點不足');
      Font.drawC(x, RN[t], 13, Y - 1, locked ? UIC.dis : has ? UIC.warm : UIC.text, UIC.textSh, 10); Font.drawC(x, tierCost9(t) + '點', 13, Y + 10, UIC.muted, UIC.textSh, 7);
      for (let o = 0; o < 2; o++) { const O = T[br].tiers[t][o], X = OX(o), chosen = has && pick === o, on = row === t && col === o;
        drawBtn(x, X, Y, OW, 21, on, chosen ? ccol : null); if (chosen) { const [cr, cg, cb] = hex2rgb(ccol); x.fillStyle = `rgba(${cr},${cg},${cb},0.3)`; x.fillRect(X + 1, Y + 1, OW - 2, 19); } let z = 10; while (z > 7 && Font.width(O.n, z) > OW - 12) z--;
        Font.drawC(x, O.n, X + OW / 2 + (chosen ? 4 : 0), Y + 1, locked ? UIC.dis : chosen ? '#ffffff' : has ? UIC.muted : '#c9cfe4', UIC.textSh, z);
        if (chosen) Font.draw(x, '✓', X + 3, Y + 2, '#ffffff', UIC.textSh, 8);
        if (TR) touchRegion(X, Y, OW, 21, () => { if (row === t && col === o) tapKey('a'); else { row = t; col = o; Sound.sfx('cursor'); } }); }
      if (t < 4) { x.fillStyle = has ? shade(ccol, -0.1) : '#30375a'; x.fillRect(100, Y + 21, 2, 3); } }
    const DY = 172; drawWin(x, 4, DY, 168, 80, 'menu');
    if (row < 0) { const B = T[br]; Font.draw(x, B.n, 12, DY + 2, shade(ccol, 0.35), UIC.textSh, 11); Font.drawR(x, '已投入' + brPts9(br, st) + '／15點', 164, DY + 4, UIC.muted, UIC.textSh, 8);
      drawFitText(x, B.d + '每層二選一。', 12, DY + 17, 152, 24, 10, UIC.text); }
    else { const O = T[br].tiers[row][col], has = tcHas(br, row, st), chosen = has && tcOf(st)[br + '.' + row] === col, blk = tierBlock9(br, row, st);
      Font.draw(x, O.n, 12, DY + 2, shade(ccol, 0.35), UIC.textSh, 11); Font.drawR(x, T[br].n + '・第' + RN[row] + '層　' + tierCost9(row) + '點', 164, DY + 4, UIC.muted, UIC.textSh, 8);
      drawFitText(x, optDesc9(O), 12, DY + 17, 152, 24, 10, chosen ? UIC.accent : UIC.text);
      const fr = fresh.has(br + '.' + row);
      Font.draw(x, msgT > 0 ? msg : chosen ? (fr ? '選擇中（離開前還能改）' : '已確定') : has ? (fr ? 'A：換成這個' : '要改需要遺忘之書') : blk || 'A：選擇（花費' + tierCost9(row) + '點）', 12, DY + 52, msgT > 0 ? UIC.warm : chosen ? UIC.good : has ? UIC.good : blk ? UIC.bad : UIC.good, UIC.textSh, 9); }
    if (RESONANCE[st.cls]) { const bp = brPts9(br, st), R3 = RESONANCE[st.cls][br], got = RES_AT.filter(q => bp >= q).length, nx = got < 3 ? R3[got] : null;
      drawFitText(x, '分支共鳴 ' + got + '/3　' + (nx ? '下一個（' + RES_AT[got] + '點）：' + shortDesc(nx[0], nx[1]) : '全部達成！'), 12, DY + 41, 152, 12, 9, '#ffd860'); }
    drawBtn(x, 12, DY + 64, 60, 13, false); Font.drawC(x, '↩退回此層', 42, DY + 63, row >= 0 && fresh.has(br + '.' + row) && !tierRefundBlock9(br, row, st) ? UIC.warm : UIC.dis, UIC.textSh, 8);
    drawBtn(x, 100, DY + 64, 64, 13, false); Font.drawC(x, '重置（遺忘之書' + ((st.bag && st.bag.talentReset) || 0) + '）', 132, DY + 63, tpSpent(st) && (st.bag && st.bag.talentReset) > 0 ? UIC.warm : UIC.dis, UIC.textSh, 7);
    if (TR) { touchRegion(12, DY + 64, 60, 13, () => tapKey('select')); touchRegion(100, DY + 64, 64, 13, () => tapKey('start')); }
    if (msgT > 0) msgT--;
  }, touchBack: true };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left')) { if (row < 0) br = (br + 2) % 3; else col = 1 - col; Sound.sfx('cursor'); }
    if (Input.repeat('right')) { if (row < 0) br = (br + 1) % 3; else col = 1 - col; Sound.sfx('cursor'); }
    if (Input.repeat('up')) { row = row < 0 ? 4 : row - 1; Sound.sfx('cursor'); } if (Input.repeat('down')) { row = row >= 4 ? -1 : row + 1; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) { Input.consume('a'); act(); }
    if (Input.pressed('select')) { Input.consume('select'); refund(); }
    if (Input.pressed('start')) { Input.consume('start'); if (tpSpent(st)) { UI.remove(scr); const have = (st.bag && st.bag.talentReset) || 0;
        if (!have) yield* say('重置天賦需要「遺忘之書」。\n（萌芽鎮和王都的道具店有賣）');
        else if (yield* yesNo('要讀遺忘之書，把' + CLASSES[st.cls].n + '的天賦全部重置嗎？\n（點數全部退回；持有' + have + '本，會用掉1本）')) { st.bag.talentReset--; tcOf(st); st.tcAll[st.cls] = {}; fresh.clear(); clampHP(); Sound.sfx('heal'); }
        UI.push(scr); } }
    yield;
  }
  UI.remove(scr);
};

/* ---------- v9.2.4: a save over the 30-point cap gives back its highest tiers until it fits ---------- */
function tcFitCap(st = Game.st) { if (!st || !st.cls || !T9C[st.cls]) return 0; let n = 0;
  while (tpSpent(st) > tpTotal(st)) { let bb = -1, bt = -1; for (let b = 0; b < 3; b++) for (let t = 4; t >= 0; t--) if (tcHas(b, t, st)) { if (t > bt) { bt = t; bb = b; } break; } if (bb < 0) break; delete tcOf(st)[bb + '.' + bt]; n++; }
  return n; }
{ const _so = startOverworld; startOverworld = function (...a) { tcFitCap(Game.st); return _so.apply(this, a); }; }
/* ---------- saves: the old tiles are refunded once ---------- */
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) st.talV9 = 1; return st; }; }
{ const _so = startOverworld; startOverworld = function (...a) {
    const st = Game.st; let note = false;
    if (st && !st.talV9) { st.talV9 = 1; if (st.cls && st.ct && Object.keys(st.ct).length) note = true; st.ct = {}; }
    const ow = _so.apply(this, a);
    if (note && ow && ow.run) ow.run((function* () { yield* wait(40); yield* say('【v9.2 天賦重做】天賦改成「每層二選一」，所有名稱和效果都換新了。舊的天賦點已經全部退回。（選單→天賦）'); })());
    return ow;
  }; }
