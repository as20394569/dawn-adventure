/* ===================== v7.0 ② class talents: each class has 3 branches, points can be mixed freely =====================
   Playtest: "talents were independent of the class, so changing class still used the same talents — no fun".
   Talents now belong to the class. The old advanced classes became branches (劍士＝劍聖／狂戰士／決鬥者 …).
   Each branch has 5 rows (7 nodes). A row opens once enough points sit in the rows below it (same branch);
   rows 4–5 are the deep talents: Lv14 + 「天賦覺醒」 at the village elder. 1 point per level (+2 on awakening, + books).
   Changing class or resetting refunds everything for free. Many talents boost one weapon kind, so the weapon you pick
   decides which talents you want. */
// branch icons (Codex task N: art/battle/talents/CLASS_BRANCH.png, 12×12)
const TALENT_PX = {}; for (const k in (typeof TALENT_PX_ROWS !== 'undefined' ? TALENT_PX_ROWS : {})) { const [cols, rows] = TALENT_PX_ROWS[k], pal = {}; cols.forEach((c, i) => pal['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = c); TALENT_PX[k] = spriteFrom(rows, pal); }
const branchIcon = (c, b) => TALENT_PX[c + '_' + b] || null;
const ROW_OF = [0, 0, 1, 1, 2, 3, 4], ROW_REQ = [0, 3, 6, 9, 12], ROW_SLOTS = [[0, 1], [2, 3], [4], [5], [6]];
// node: 'name|key|value per rank|max rank'
const CLASS_V7 = {
  swordsman: { tag: '近身武技', w: ['劍', '斧', '長槍'], pitch: '以近身武器戰鬥的戰士。劍聖追求會心與居合，狂戰士以血換力，決鬥者擅長長槍、先制與反擊。', br: [
    ['劍聖', '會心與居合，劍的極致。', '劍術精通|kind:劍|6|3;明鏡|crit|3|3;居合|actUp|5|3;見切|eva|3|3;無想|chargeCut|1|1;一閃|critDmg|10|3;劍聖之境|spcUp|40|1'],
    ['狂戰士', '以血換力的斧頭猛攻。', '戰斧精通|kind:斧|6|3;蠻力|atkP|3|3;嗜血|drain|3|3;鐵骨|hpP|4|3;狂怒|rage|1|1;破甲|pierceT|6|3;背水之陣|fx.lastStand|1|1'],
    ['決鬥者', '長槍、先制與反擊。', '長槍精通|kind:長槍|6|3;迅捷|speP|4|3;碎盾|shieldChip|15|3;反擊架勢|counter|1|1;先發制人|fx.first|1|1;弱點看破|weakUp|6|3;決鬥之王|bigUp|20|1']] },
  mage: { tag: '四系魔法', w: ['法杖', '魔導書', '樂器'], pitch: '操控魔力的術士。炎術士燒盡一切，雷術士以速度與麻痺壓制，奧術師精通魔導書與MP運用。', br: [
    ['炎術士', '火焰與爆發傷害。', '炎之心|fireUp|8|3;魔力親和|spaP|3|3;法杖精通|kind:法杖|6|3;元素掌握|elem|5|3;奧術湧動|fx.arcaneSurge|1|1;爆炎|critDmg|10|3;業火之主|fireUp|25|1'],
    ['雷術士', '雷電、速度與會心。', '雷之心|boltUp|8|3;迅雷|speP|4|3;奧術洞察|magCrit|4|3;雷紋|fx.stormMark|1|1;連鎖|chargeCut|1|1;雷霆|critDmg|10|3;雷神降臨|actUp|25|1'],
    ['奧術師', '魔導書與MP運用。', '魔導書精通|kind:魔導書|6|3;魔力泉湧|mpRegen|2|3;魔力擴充|mpP|8|3;節能|mpSave|6|3;魔力循環|fx.freeCast|1|1;元素掌握|elem|6|3;萬象借法|subUp|30|1']] },
  guardian: { tag: '堅守反擊', w: ['斧', '劍', '拳套'], pitch: '站在最前線的守護者。聖騎士治癒與不屈，鐵壁把防禦練到極致，復仇者用斧頭加倍奉還。', br: [
    ['聖騎士', '治癒、再生與不屈。', '神聖加護|healUp|10|3;堅韌|hpP|4|3;元素護體|elemRes|6|3;信念|defP|4|3;守護之心|fx.guardHeal|1|1;再生|fx.regen|1|1;不屈之魂|endureT|1|1'],
    ['鐵壁', '物防魔防與防禦。', '鐵壁|defP|5|3;魔法抵抗|spdP|5|3;強健|hpP|5|3;不動如山|guardPlus|1|1;荊棘之甲|fx.thorns|1|1;鋼鐵意志|statusRes|10|3;要塞|defP|20|1'],
    ['復仇者', '斧頭與反擊。', '重擊|kind:斧|6|3;怒火|atkP|3|3;反擊架勢|counter|1|1;以牙還牙|drain|3|3;背水|rage|1|1;復仇之刃|critDmg|10|3;審判之時|fx.lastStand|1|1']] },
  ranger: { tag: '迅捷連擊', w: ['短刀', '火槍', '拳套'], pitch: '敏捷的獵人。刺客一擊致命，影舞者以迴避與連擊周旋，獵人用火槍與毒看破弱點。', br: [
    ['刺客', '會心與致命一擊。', '短刀精通|kind:短刀|6|3;要害|crit|3|3;追擊毒傷|venomous|10|3;致命|critDmg|8|3;暗殺|assassin|1|1;巨獸殺手|bigUp|6|3;暗殺術|actUp|25|1'],
    ['影舞者', '迴避、連擊與反擊。', '身輕如燕|eva|3|3;疾風|speP|4|3;亂舞|atkUp|10|3;連擊|fx.double|1|1;殘影|shadowStep|1|1;蓄勢|atkMp|1|3;無影|chargeCut|1|1'],
    ['獵人', '火槍、毒與弱點。', '火槍精通|kind:火槍|6|3;精準|hit|4|3;毒刃|venomEdge|1|1;弱點獵手|weakUp|6|3;先發制人|fx.first|1|1;穿甲彈|pierceT|8|3;狩獵本能|bigUp|20|1']] },
  bard: { tag: '歌聲支援', w: ['樂器', '魔導書', '短刀'], pitch: '以歌聲戰鬥的旅人。戰歌激昂作戰，安魂守護生命，詩刃讓短刀與副武器發揮到極致。', br: [
    ['戰歌', '激昂的歌聲與特技。', '樂器精通|kind:樂器|6|3;魔力親和|spaP|3|3;激昂|actUp|5|3;輕快|speP|4|3;狂熱|fx.fervor|1|1;高音|critDmg|10|3;英雄讚歌|spcUp|40|1'],
    ['安魂', '治癒、MP與不屈。', '慈悲|healUp|10|3;魔力泉湧|mpRegen|2|3;堅韌|hpP|4|3;淨化|statusRes|10|3;再生|fx.regen|1|1;節能|mpSave|6|3;安魂曲|endureT|1|1'],
    ['詩刃', '短刀、普攻與副武器。', '短刀精通|kind:短刀|6|3;要害|crit|3|3;舞步|atkUp|10|3;閃避|eva|3|3;連擊|fx.double|1|1;雙持|subUp|10|3;終曲|chargeCut|1|1']] },
  machinist: { tag: '機關火力', w: ['火槍', '斧', '長槍'], pitch: '操縱機關的工匠。砲術專精火槍，機關讓特技不停運轉，工程師又硬又能自我修復。', br: [
    ['砲術', '火槍與會心。', '火槍精通|kind:火槍|6|3;精準|hit|4|3;致命|critDmg|8|3;穿甲|pierceT|6|3;破甲彈|fx.pierce|1|1;火力全開|actUp|8|3;終極砲擊|spcUp|40|1'],
    ['機關', '特技與MP循環。', '齒輪|spcUp|10|3;發電|atkMp|1|3;電容|mpP|8|3;雷紋|fx.stormMark|1|1;連動|chargeCut|1|1;超頻|atkUp|10|3;永動機關|actUp|25|1'],
    ['工程', '防禦與修復。', '裝甲|defP|5|3;強化外殼|hpP|4|3;維修|healUp|10|3;絕緣|elemRes|6|3;反應裝甲|fx.thorns|1|1;防鏽|statusRes|10|3;緊急修復|fx.regen|1|1']] },
  monk: { tag: '拳與氣', w: ['拳套', '法杖', '長槍'], pitch: '鍛鍊身心的武僧。剛拳以拳頭打穿一切，氣功運用魔力與MP，禪定讓身體不受動搖。', br: [
    ['剛拳', '拳套與連擊。', '拳套精通|kind:拳套|6|3;剛力|atkP|3|3;要害|crit|3|3;連擊|fx.double|1|1;崩拳|pierceT|20|1;致命|critDmg|8|3;天崩|spcUp|40|1'],
    ['氣功', '魔力與MP。', '內功|spaP|3|3;調息|mpRegen|2|3;法杖精通|kind:法杖|6|3;吐納|atkMp|1|3;氣循環|fx.freeCast|1|1;奧術洞察|magCrit|4|3;周天|chargeCut|1|1'],
    ['禪定', '迴避與耐久。', '無我|eva|3|3;身法|speP|4|3;金剛|hpP|4|3;明鏡|statusRes|10|3;再生|fx.regen|1|1;不動|guardPlus|1|1;不壞之身|endureT|1|1']] },
  dragoon: { tag: '長槍跳躍', w: ['長槍', '劍', '斧'], pitch: '與龍締約的騎士。龍槍貫穿一切，龍血讓身體更強韌，天躍把普攻與特技連成一氣。', br: [
    ['龍槍', '長槍與穿透。', '長槍精通|kind:長槍|6|3;剛力|atkP|3|3;穿透|pierceT|6|3;屠龍|bigUp|6|3;先發制人|fx.first|1|1;致命|critDmg|10|3;龍神之槍|actUp|25|1'],
    ['龍血', '耐久與吸血。', '龍血|hpP|4|3;嗜血|drain|3|3;龍鱗|defP|4|3;龍息|fireUp|8|3;再生|fx.regen|1|1;元素護體|elemRes|6|3;龍之心|endureT|1|1'],
    ['天躍', '速度、普攻與特技。', '身輕|speP|4|3;躍步|eva|3|3;突刺|atkUp|10|3;要害|crit|3|3;天躍|chargeCut|1|1;高空|spcUp|10|3;流星|spcUp|30|1']] },
  otherworlder: { tag: '全能', w: ['劍', '法杖', '長槍'], pitch: '來自異界的勇者。什麼武器都能用：勇者全面強化，異界善用弱點與借用技能，時空掌握先機。', br: [
    ['勇者', '全面強化。', '勇氣|atkP|3|3;智慧|spaP|3|3;體魄|hpP|4|3;守護|defP|4|3;異界共鳴|fx.wisdom|1|1;必殺|critDmg|8|3;勇者之魂|actUp|25|1'],
    ['異界', '弱點與借用技能。', '元素|elem|5|3;看破|weakUp|6|3;借力|subUp|10|3;魔力|mpP|8|3;異界之力|chargeCut|1|1;屠巨|bigUp|8|3;異界共鳴|spcUp|40|1'],
    ['時空', '速度與先機。', '加速|speP|4|3;殘影|eva|3|3;節能|mpSave|6|3;魔泉|mpRegen|2|3;先機|fx.first|1|1;淨心|statusRes|10|3;時之守護|endureT|1|1']] },
  spellblade: { tag: '魔劍合一', w: ['劍', '魔導書', '法杖'], pitch: '讓劍與魔法合而為一的魔劍士。魔劍共鳴攻魔，月蝕追求會心與特技，元素讓每一種屬性都更強。', br: [
    ['魔劍', '劍與魔力共鳴。', '劍術精通|kind:劍|6|3;魔力親和|spaP|3|3;剛力|atkP|3|3;魔劍共鳴|spellblade|1|1;奧術湧動|fx.arcaneSurge|1|1;致命|critDmg|8|3;魔劍解放|actUp|25|1'],
    ['月蝕', '會心與特技。', '奧術洞察|magCrit|4|3;要害|crit|3|3;元素|elem|5|3;魔泉|mpRegen|2|3;月蝕|chargeCut|1|1;看破|weakUp|6|3;月蝕之刻|spcUp|40|1'],
    ['元素', '四系屬性。', '炎|fireUp|6|3;雷|boltUp|6|3;水|type:水|6|3;草|type:草|6|3;雷紋|fx.stormMark|1|1;元素護體|elemRes|6|3;元素之主|elem|20|1']] },
};
const V7_CLASSES = ['swordsman', 'mage', 'guardian', 'ranger', 'bard', 'machinist', 'monk', 'dragoon', 'otherworlder', 'spellblade'];
const CT = {}; // cls → [ [ {id,b,i,row,n,key,v,max} ×7 ] ×3 ]
for (const c in CLASS_V7) CT[c] = CLASS_V7[c].br.map(([bn, bd, s], b) => s.split(';').map((q, i) => { const [n, key, v, max] = q.split('|'); return { id: c + '.' + b + '.' + i, b, i, row: ROW_OF[i], n, key, v: +v, max: +max }; }));
const V7_OLD = { swordmaster: 'swordsman', berserker: 'swordsman', pyromancer: 'mage', stormcaller: 'mage', paladin: 'guardian', assassin: 'ranger', shadowdancer: 'ranger' };
const clsV7 = c => V7_OLD[c] || (CT[c] ? c : 'swordsman');
const FX_TXT = { first: '每場戰鬥第一回合必定先出手', regen: '每回合回復6%最大HP', double: '物理攻擊25%機率追加一擊', thorns: '受到攻擊時反彈25%傷害', guardHeal: '選擇防禦時回復15%最大HP', lastStand: 'HP越低傷害越高（最多+50%）', freeCast: '技能有30%機率不消耗MP', stormMark: '攻擊時15%機率讓對手麻痺', arcaneSurge: 'MP在一半以上時魔法傷害+15%', fervor: '每次攻擊物攻或魔攻提升1階（每場最多3次）', pierce: '物理攻擊無視對手30%的物防', wisdom: '獲得的經驗值+50%' };
const TK_TXT = { hpP: v => '最大HP+' + v + '%', atkP: v => '物攻+' + v + '%', defP: v => '物防+' + v + '%', spaP: v => '魔攻+' + v + '%', spdP: v => '魔防+' + v + '%', speP: v => '速度+' + v + '%', mpP: v => '最大MP+' + v + '%',
  crit: v => '會心率+' + v + '%', eva: v => '迴避+' + v + '%', hit: v => '命中+' + v + '%', drain: v => '造成傷害的' + v + '%回復HP', elem: v => '屬性攻擊傷害+' + v + '%', fireUp: v => '火屬性傷害+' + v + '%', boltUp: v => '雷屬性傷害+' + v + '%',
  pierceT: v => '物理攻擊無視' + v + '%物防', shieldChip: v => v + '%機率額外削減1點護盾', statusRes: v => '異常狀態抗性+' + v + '%', guardPlus: () => '選擇防禦時再減傷30%', weakUp: v => '打中弱點傷害+' + v + '%', bigUp: v => '對精英・頭目傷害+' + v + '%',
  mpSave: v => '技能' + v + '%機率不消耗MP', magCrit: v => '魔法攻擊會心率+' + v + '%', elemRes: v => '受到的屬性傷害-' + v + '%', endureT: () => '每場戰鬥一次，受到致命傷害時保留1HP', mpRegen: v => '每回合回復' + v + '%最大MP',
  venomEdge: () => '物理攻擊20%機率讓對手中毒', venomous: v => '對中毒的對手傷害+' + v + '%', assassin: () => '每場戰鬥第1回合的攻擊必定會心', shadowStep: () => '閃過攻擊後立刻反擊（70%傷害）', rage: () => 'HP低於一半時傷害+30%',
  spellblade: () => '物攻與魔攻互相加成45%', counter: () => '選擇防禦時被攻擊會立刻反擊', atkUp: v => '普通攻擊傷害+' + v + '%', actUp: v => '武器主動技能傷害+' + v + '%', subUp: v => '副武器借用技能傷害+' + v + '%', spcUp: v => '特技傷害+' + v + '%',
  critDmg: v => '會心傷害+' + v + '%', chargeCut: v => '特技所需攻擊次數-' + v, atkMp: v => '普通攻擊多回復' + v + '點MP', healUp: v => '治癒效果+' + v + '%' };
function tDesc(key, v) {
  if (key.startsWith('kind:')) return '裝備' + key.slice(5) + '時傷害+' + v + '%'; if (key.startsWith('type:')) return key.slice(5) + '屬性傷害+' + v + '%';
  if (key.startsWith('fx.')) return FX_TXT[key.slice(3)] || (SPECIALS[key.slice(3)] || {}).d || key; return TK_TXT[key] ? TK_TXT[key](v) : key + '+' + v;
}
const ctOf = (st = Game.st) => st.ct || (st.ct = {});
const ctRank = (n, st = Game.st) => ctOf(st)[n.id] || 0;
function talentSum(key, st = Game.st) { const T = CT[st.cls]; if (!T) return 0; let s = 0; for (const B of T) for (const n of B) if (n.key === key) s += n.v * ctRank(n, st); return s; }
const deepOk = (st = Game.st) => st.lv >= 14 && !!(st.flags && st.flags.deep);
const tpTotal = (st = Game.st) => (st.cls ? st.lv : 0) + (st.tpRead || 0) + (st.flags && st.flags.deep ? 2 : 0);
function tpSpent(st = Game.st) { let s = 0; const T = CT[st.cls]; if (T) for (const B of T) for (const n of B) s += ctRank(n, st); return s; }
const tpAvail = (st = Game.st) => Math.max(0, tpTotal(st) - tpSpent(st));
const brBelow = (b, row, st = Game.st) => { let s = 0; for (const n of CT[st.cls][b]) if (n.row < row) s += ctRank(n, st); return s; };
const brPts = (b, st = Game.st) => CT[st.cls][b].reduce((a, n) => a + ctRank(n, st), 0);
function nodeBlock(n, st = Game.st) { // why a point can't be added (null = ok)
  if (ctRank(n, st) >= n.max) return '已達最高等級'; if (n.row >= 3 && !deepOk(st)) return st.lv < 14 ? 'Lv14後找村長進行「天賦覺醒」' : '找萌芽鎮的村長進行「天賦覺醒」';
  const need = ROW_REQ[n.row], have = brBelow(n.b, n.row, st); if (have < need) return '這條分支前面的天賦要先投入' + need + '點（目前' + have + '點）';
  if (!tpAvail(st)) return '天賦點不足（升級時獲得）'; return null;
}
function refundBlock7(n, st = Game.st) {
  if (!ctRank(n, st)) return '還沒有投入點數'; const C = ctOf(st); C[n.id]--;
  let bad = null; for (const m of CT[st.cls][n.b]) if (ctRank(m, st) > 0 && m.row > n.row && brBelow(n.b, m.row, st) < ROW_REQ[m.row]) { bad = m; break; }
  C[n.id]++; return bad ? '「' + bad.n + '」需要它' : null;
}
function applyTalents(s, st = Game.st) {
  const T = CT[st.cls]; if (!T) return s; const pct = {}; s.kindUp = s.kindUp || {}; s.typeUp = s.typeUp || {};
  for (const B of T) for (const n of B) { const r = ctRank(n, st); if (!r) continue; const v = n.v * r, k = n.key;
    if (k.startsWith('kind:')) s.kindUp[k.slice(5)] = (s.kindUp[k.slice(5)] || 0) + v; else if (k.startsWith('type:')) s.typeUp[k.slice(5)] = (s.typeUp[k.slice(5)] || 0) + v;
    else if (k.startsWith('fx.')) s.fx[k.slice(3)] = 1; else if (/^(hp|atk|def|spa|spd|spe|mp)P$/.test(k)) pct[k.slice(0, -1)] = (pct[k.slice(0, -1)] || 0) + v; else s[k] = (s[k] || 0) + v; }
  for (const k in pct) s[k] = Math.floor(s[k] * (1 + pct[k] / 100)); if (s.endureT) s.fx.endure = 1; if (s.fireUp && s.typeUp) { } return s;
}
{ const _hs = heroStats; heroStats = function (st = Game.st) { return applyTalents(_hs(st), st); }; }

/* ---------- the talent screen ---------- */
function* talentScreen() {
  const st = Game.st; if (!CT[st.cls]) { yield* say('先在萌芽鎮的村長那裡完成覺醒的儀式吧。'); return; }
  let row = 0, slot = 0, msg = '', msgT = 0; const T = CT[st.cls], C = CLASS_V7[st.cls];
  const slots = r => ROW_SLOTS[r].length * 3, nodeAt = (r, s) => { const per = ROW_SLOTS[r].length; return T[Math.floor(s / per)][ROW_SLOTS[r][s % per]]; };
  const RY = r => 44 + r * 25, colX = b => 4 + b * 57;
  const tile = (n, r, s) => { const per = ROW_SLOTS[r].length, b = Math.floor(s / per), k = s % per, X = per === 2 ? colX(b) + k * 28 : colX(b) + 7, w = per === 2 ? 26 : 40; return { X, Y: RY(r), w, h: 21 }; };
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '天賦・' + CLASSES[st.cls].n); const av = tpAvail(st); Font.drawR(x, '天賦點 ' + av, W - 6, 2, av ? UIC.warm : UIC.muted, UIC.textSh);
    const col = classColOf(st.cls);
    C.br.forEach(([bn], b) => { const X = colX(b), ic = branchIcon(st.cls, b); drawBtn(x, X, 22, 54, 17, false, col); if (ic) x.drawImage(ic, X + 2, 24); Font.drawC(x, bn, X + (ic ? 31 : 27), 21, shade(col, 0.35), UIC.textSh, bn.length > 3 && ic ? 8 : 10); Font.drawR(x, String(brPts(b, st)), X + 52, 29, UIC.muted, UIC.textSh, 7); });
    for (let r = 0; r < 5; r++) {
      if (r === 3) { x.fillStyle = deepOk(st) ? 'rgba(255,200,100,0.35)' : 'rgba(120,120,150,0.35)'; x.fillRect(4, RY(3) - 3, 168, 1); if (!deepOk(st)) Font.drawR(x, '深層（天賦覺醒）', 170, RY(3) - 10, UIC.dis, UIC.textSh, 7); }
      for (let s = 0; s < slots(r); s++) { const n = nodeAt(r, s), g = tile(n, r, s), rk = ctRank(n, st), on = r === row && s === slot, blk = nodeBlock(n, st), lock = blk && !rk && blk !== '天賦點不足（升級時獲得）';
        drawBtn(x, g.X, g.Y, g.w, g.h, on, rk ? col : null); let nm = g.w < 30 ? n.n.slice(0, 2) : n.n.slice(0, 4), z = 9; while (z > 7 && Font.width(nm, z) > g.w - 3) z--;
        Font.drawC(x, nm, g.X + g.w / 2, g.Y, lock ? UIC.dis : rk ? UIC.text : '#c9cfe4', UIC.textSh, z);
        for (let q = 0; q < n.max; q++) { x.fillStyle = q < rk ? UIC.warm : '#30375a'; x.fillRect(g.X + g.w / 2 - n.max * 3 + q * 6 + 1, g.Y + g.h - 5, 4, 2); }
        if (typeof touchRegion === 'function') touchRegion(g.X, g.Y, g.w, g.h, () => { if (row === r && slot === s) tapKey('a'); else { row = r; slot = s; Sound.sfx('cursor'); } }); }
    }
    const n = nodeAt(row, slot), rk = ctRank(n, st), blk = nodeBlock(n, st), DY = 170; drawWin(x, 4, DY, 168, 82, 'menu');
    Font.draw(x, n.n, 12, DY + 2, shade(col, 0.35), UIC.textSh, 11); Font.drawR(x, C.br[n.b][0] + '・第' + (n.row + 1) + '層　' + rk + '/' + n.max, 164, DY + 4, UIC.muted, UIC.textSh, 8);
    const cur = rk ? '目前：' + tDesc(n.key, n.v * rk) : '每級：' + tDesc(n.key, n.v); drawFitText(x, cur, 12, DY + 17, 152, 24, 10, rk ? UIC.accent : UIC.text);
    if (rk && rk < n.max) drawFitText(x, '下一級：' + tDesc(n.key, n.v * (rk + 1)), 12, DY + 41, 152, 12, 9, '#c9cfe4');
    Font.draw(x, msgT > 0 ? msg : blk || 'A：投入1點', 12, DY + 54, msgT > 0 ? UIC.warm : blk ? UIC.bad : UIC.good, UIC.textSh, 9);
    drawBtn(x, 12, DY + 66, 60, 13, false); Font.drawC(x, '↩退回1點', 42, DY + 65, rk ? UIC.warm : UIC.dis, UIC.textSh, 8); drawBtn(x, 100, DY + 66, 64, 13, false); Font.drawC(x, '全部重置', 132, DY + 65, tpSpent(st) ? UIC.warm : UIC.dis, UIC.textSh, 8);
    if (typeof touchRegion === 'function') { touchRegion(12, DY + 66, 60, 13, () => tapKey('select')); touchRegion(100, DY + 66, 64, 13, () => tapKey('start')); }
    if (msgT > 0) msgT--;
  }, touchBack: true };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left')) { slot = (slot + slots(row) - 1) % slots(row); Sound.sfx('cursor'); } if (Input.repeat('right')) { slot = (slot + 1) % slots(row); Sound.sfx('cursor'); }
    if (Input.repeat('up') || Input.repeat('down')) { const r2 = (row + (Input.repeat('up') ? 4 : 1)) % 5, a = slots(row), b2 = slots(r2); slot = Math.min(b2 - 1, Math.floor((slot + 0.5) * b2 / a)); row = r2; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    const n = nodeAt(row, slot);
    if (Input.pressed('a')) { Input.consume('a'); const blk = nodeBlock(n, st); if (blk) { Sound.sfx('bump'); msg = blk; msgT = 60; } else { ctOf(st)[n.id] = ctRank(n, st) + 1; Sound.sfx('statUp'); clampHP(); msg = '「' + n.n + '」升到了' + ctRank(n, st) + '級！'; msgT = 50; } }
    if (Input.pressed('select')) { Input.consume('select'); const blk = refundBlock7(n, st); if (blk) { Sound.sfx('bump'); msg = blk; msgT = 60; } else { ctOf(st)[n.id]--; if (!ctOf(st)[n.id]) delete ctOf(st)[n.id]; Sound.sfx('cancel'); clampHP(); msg = '退回了1點。'; msgT = 40; } }
    if (Input.pressed('start')) { Input.consume('start'); if (tpSpent(st)) { UI.remove(scr); if (yield* yesNo('要把' + CLASSES[st.cls].n + '的天賦全部重置嗎？\n（點數全部退回，不用花錢）')) { st.ct = {}; clampHP(); Sound.sfx('heal'); } UI.push(scr); } }
    yield;
  }
  UI.remove(scr);
}

/* ---------- classes: cards, the unlocked list, changing class ---------- */
function classCard(k) { const C = CLASSES[k], V = CLASS_V7[k] || {}; return { k, n: C.n, col: classColOf(k), tag: (C.tier >= 3 ? (k === 'otherworlder' || k === 'spellblade' ? '隱藏職業' : '上級職業') : '基本職業') + '・' + (V.tag || ''), text: V.pitch || C.d || '', glyph: CLASS_EMBLEM[k] ? k : k === 'spellblade' ? 'spell' : 'star', br: V.br || [], w: V.w || [] }; }
function* classCardScreen(keys, o = {}) {
  let i = 0, t = 0; const cards = keys.map(classCard), look = o.look || null;
  const scr = { draw(x) {
    t++; const c = cards[i], col = c.col, [r, gg, b] = hex2rgb(col);
    x.fillStyle = '#0a0c18'; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W / 2, 64, 4, W / 2, 64, 64); g.addColorStop(0, `rgba(${r},${gg},${b},0.45)`); g.addColorStop(1, `rgba(${r},${gg},${b},0)`); x.fillStyle = g; x.fillRect(0, 0, W, 128);
    for (let n = 0; n < 10; n++) { const a = t / 40 + n * 0.63, R = 38 + Math.sin(t / 30 + n) * 6; x.fillStyle = n % 2 ? col : '#ffffff'; x.fillRect(Math.round(W / 2 + Math.cos(a) * R), Math.round(62 + Math.sin(a) * R * 0.5), 2, 2); }
    headerBar(x, o.title || '覺醒的儀式'); Font.drawR(x, (i + 1) + '/' + keys.length, W - 6, 2, UIC.muted, UIC.textSh);
    const S = CLASS_START[c.k], L = look || { head: c.k === 'guardian' ? GEAR.clothCap.look : null, body: 'uniform', feet: 'school', weapon: S ? GEAR[S.gear[0]].look : null };
    const bob = Math.round(Math.sin(t / 20) * 2), fr = heroFramesLook(L).down[0];
    x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(W / 2 - 14, 92, 18, 5, 0, 0, 7); x.fill(); x.drawImage(fr, 0, 0, 16, 22, W / 2 - 38, 26 + bob, 48, 66);
    classGlyph(x, c.glyph, W / 2 + 34, 58 - bob, col);
    if (keys.length > 1) { Font.drawC(x, '◀', 14, 52, i > 0 ? UIC.text : UIC.dis, UIC.textSh); Font.drawC(x, '▶', W - 14, 52, i < keys.length - 1 ? UIC.text : UIC.dis, UIC.textSh);
      if (typeof touchRegion === 'function') { touchRegion(0, 28, 30, 60, () => tapKey('left')); touchRegion(W - 30, 28, 30, 60, () => tapKey('right')); } }
    drawWin(x, 4, 98, 168, 156, 'menu');
    Font.draw(x, c.n, 12, 100, col, UIC.textSh, 13); { let z = 9; while (z > 7 && Font.width(c.tag, z) > 92) z--; Font.drawR(x, c.tag, 164, 103, UIC.muted, UIC.textSh, z); }
    x.fillStyle = `rgba(${r},${gg},${b},0.5)`; x.fillRect(12, 117, 152, 1);
    drawFitText(x, c.text, 12, 119, 152, 36, 10);
    Font.draw(x, '擅長武器：' + c.w.join('・'), 12, 156, UIC.accent, UIC.textSh, 9); const pas = classPassives(c.k);
    Font.draw(x, pas.length ? '職業被動：' + pas.map(p => p.n).join('・') : '天賦分支', 12, 167, pas.length ? UIC.warm : UIC.muted, UIC.textSh, 8); Font.drawR(x, '天賦可自由混點', 164, 167, UIC.muted, UIC.textSh, 8);
    c.br.forEach(([bn, bd], n) => { const Y = 180 + n * 19, ic = branchIcon(c.k, n); x.fillStyle = shade(col, -0.35); x.fillRect(12, Y + 1, 44, 14); if (ic) x.drawImage(ic, 13, Y + 2); Font.drawC(x, bn, ic ? 40 : 34, Y, '#ffffff', UIC.textSh, bn.length > 3 ? (ic ? 8 : 9) : 10); let z = 9; while (z > 7 && Font.width(bd, z) > 104) z--; Font.draw(x, bd, 60, Y + 1, UIC.text, UIC.textSh, z); });
    Font.drawR(x, (o.cancel ? 'B：返回　' : '') + 'A：選擇' + (keys.length > 1 ? '　◀▶：切換' : ''), 164, 241, UIC.muted, UIC.textSh, 8);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left') && i > 0) { i--; Sound.sfx('cursor'); } if (Input.repeat('right') && i < keys.length - 1) { i++; Sound.sfx('cursor'); }
    if (o.cancel && Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); UI.remove(scr); return null; }
    if (Input.pressed('a')) { Input.consume('a'); Sound.sfx('select'); const k = keys[i]; UI.remove(scr); if (yield* yesNo(o.confirm ? o.confirm(k) : '要走上「' + CLASSES[k].n + '」的道路嗎？')) return k; UI.push(scr); }
    yield;
  }
}
classSelectScreen = function* () { return yield* classCardScreen(['swordsman', 'mage', 'guardian', 'ranger'], { title: '覺醒的儀式', confirm: k => '要走上「' + CLASSES[k].n + '」的道路嗎？\n（Lv14之後可以找村長轉職）' }); };
function unlockedClasses(st = Game.st) {
  const f = st.flags || {}, L = ['swordsman', 'mage', 'guardian', 'ranger'];
  for (const [k, fl] of CH2_CLS) if (f[fl]) L.push(k); if (f.hiddenCls) L.push('otherworlder'); if (f.spellbladeOk) L.push('spellblade'); return L;
}
function* changeClass(k, quiet) {
  const st = Game.st, had = tpSpent(st); st.cls = k; st.ct = {}; if (CLASSES[k].tier === 1) st.baseCls = k;
  if (CLASSES[k].tier >= 3 && st.lv >= 14) st.flags.deep = 1; clampHP();
  yield* itemGet(st.name + '成為了' + CLASSES[k].n + '！');
  if (!quiet) yield* say((had ? '之前的天賦點全部退回了。' : '') + '打開選單的「天賦」，就能點' + CLASSES[k].n + '的三條天賦分支（' + CLASS_V7[k].br.map(b => b[0]).join('・') + '）。');
}
function* v7ClassChange(title) {
  const st = Game.st, opts = unlockedClasses(st).filter(k => k !== st.cls);
  if (!opts.length) { yield* say('現在沒有其他可以轉的職業。'); return false; }
  const k = yield* classCardScreen(opts, { title: title || '轉職', cancel: true, look: heroLookOf(st), confirm: k => '確定要成為' + CLASSES[k].n + '嗎？\n（目前：' + (CLASSES[st.cls] || { n: '—' }).n + '・天賦會重置）' });
  if (!k) { yield* say('想好了再來吧。'); return true; }
  yield* changeClass(k); return true;
}
classTalk = function* () {
  const st = Game.st; if (!st.cls) { const k = yield* classSelectScreen(); applyStartClass(k); yield* itemGet(st.name + '覺醒成為了' + CLASSES[k].n + '！'); return true; }
  if (st.lv < 14) return false;
  if (!st.flags.deep) {
    yield* sayAll(['……你的力量又成長了呢。', '讓我看看……嗯，你身上的「' + CLASSES[st.cls].n + '」之力已經穩定下來了。', '把手放在石板上吧。更深的天賦會回應你。']);
    Sound.sfx('charge'); st.flags.deep = 1; Game.fadeColor = '#ffffff'; yield* fadeOut(12, '#ffffff'); Game.fade = 1; Sound.jingle('levelup'); yield* fadeIn(24); Game.fadeColor = '#000';
    yield* itemGet('天賦覺醒！第4・5層的深層天賦解鎖了，另外獲得2點天賦點！');
    yield* say('從今以後，你也可以在我這裡轉換職業。換了職業，天賦就會換成那個職業的三條分支，點數會全部退回。'); return true;
  }
  const r = yield* ask('要做什麼？', ['轉職', '聊天']); if (r !== 0) return false; yield* v7ClassChange('轉職的儀式'); return true;
};
ch2ClassTalk = function* () {
  const st = Game.st, f = st.flags, ok = CH2_CLS.filter(([k, fl]) => f[fl]).map(([k]) => k);
  if (!ok.length) { yield* say('完成導師的試煉，就能在這裡轉職成「上級職業」。\n（吟遊詩人・機工士・武僧・龍騎士）'); return; }
  yield* v7ClassChange('上級職業');
};
{ const _as = applyStartClass; applyStartClass = function (k) { _as(k); const st = Game.st; st.skills = {}; st.skp = 0; st.tp = 0; st.ct = {}; st.baseCls = k; }; }

/* ---------- level-up: 1 talent point (the old skill-point / tree texts are replaced) ---------- */
{ const _lu = Battle.prototype.levelUp; Battle.prototype.levelUp = function* () {
    const st = Game.st, self = this, _msg = Battle.prototype.msg;
    this.msg = function* (t, o) { if (typeof t === 'string') { if (t.startsWith('可以學習新技能了')) return; if (t.includes('點技能點')) t = '獲得了1點天賦點！MP也全部恢復了。（選單→天賦）'; } return yield* _msg.call(self, t, o); };
    let r; try { r = yield* _lu.call(this); } finally { delete this.msg; }
    st.skp = 0; st.tp = 0;
    if (st.lv === 14 && !(st.flags && st.flags.deep)) yield* this.msg('到達Lv14了！去找萌芽鎮的村長，進行「天賦覺醒」吧。', { hold: 40 });
    return r;
  };
}
