/* ===================== v19.2 skill & talent rework (player feedback: some skills / talents were never picked) =====================
   Every weak pick gets a job in the new break / AI system instead of just bigger numbers:
   - 破盾 (shieldHit): chips an extra point off a break shield on hit — 疾風刺・破甲斬・重盾衝撞・撕裂
   - 集氣: the next attack is a guaranteed critical hit (crits chip shields too)
   - 血怒 / 煙幕彈 / 幻影步: effects that the monsters' 威壓 can't wipe (not stat stages)
   - 獵人印記: the target takes +20% damage for 3 turns
   - early elemental skills are cheaper / stronger so they're worth taking before Lv8 */
Object.assign(MOVES.flameSlash, { pow: 50, eff: { st: 'brn', p: 20 }, d: '以燃燒的劍刃砍擊。有時會讓對手灼傷。' });
Object.assign(MOVES.fireBolt, { pow: 50, eff: { st: 'brn', p: 20 }, d: '射出一顆火球。有時會造成灼傷。' });
Object.assign(MOVES.aquaBlade, { pow: 55, d: '揮出激流般的水刃。會讓對手全身濕透（濕透時被雷擊會感電）。' });
Object.assign(MOVES.gale, { pow: 50, shieldHit: 1, d: '以疾風般的速度刺擊。必定先出手，【破盾】額外削減1點護盾。' });
Object.assign(MOVES.armorBreak, { pow: 55, shieldHit: 1, d: '瞄準護甲縫隙的一擊。降低對手的物防，【破盾】額外削減1點護盾。' });
Object.assign(MOVES.shieldBash, { eff: { flinch: 1, p: 50 }, shieldHit: 1, d: '用盾牌全力衝撞。50%讓對手退縮，【破盾】額外削減1點護盾。' });
Object.assign(MOVES.lacerate, { shieldHit: 1, d: '撕開護甲的一刀。有時會降低對手的物防，【破盾】額外削減1點護盾。' });
Object.assign(MOVES.focus, { stat: null, critNext: 1, d: '集中精神。下一次攻擊必定會心（會心也能削減護盾）。效果不會被魔物的威壓消除。' });
Object.assign(MOVES.ironWill, { stat: { who: 'self', def: 2, spd: 2 }, d: '穩住架勢，大幅提升物防和魔防。' });
Object.assign(MOVES.bloodRage, { hpCost: 0.1, stat: null, rage: 3, d: '燃燒自己的血。消耗10%HP，3回合內傷害+30%、速度提升。（不會被魔物的威壓消除）' });
Object.assign(MOVES.smokeBomb, { stat: null, smoke: 3, d: '在煙幕中移動。3回合內迴避+30%。（不會被魔物的威壓消除）' });
Object.assign(MOVES.hunterMark, { stat: { who: 'foe', def: -1 }, mark: 3, d: '在對手身上刻下印記。降低物防，3回合內受到的傷害+20%。' });
Object.assign(MOVES.mirage, { d: '留下幻影護身。3回合內受到的傷害減少，並且迴避+30%。' });
MOVES.mirage.smoke = 3;
Object.assign(SKILL_MP, { flameSlash: 3, fireBolt: 3, gale: 4, armorBreak: 5, focus: 4, bloodRage: 6 });
// move up the rarely-taken trees: the break tools come earlier
for (const t of [SKILL_TREES.swordsman, SKILL_TREES.guardian]) for (const n of t) if (n[0] === 'armorBreak') { n[1] = 8; n[2] = t === SKILL_TREES.guardian ? 'guardStrike' : 'powerSlash'; n[3] = 1; }

/* ---------- talents v2: same ids where the idea stayed, new jobs for the weak ones, one capstone per line ---------- */
Object.assign(TALENTS.find(t => t.id === 'breaker'), { n: '碎盾之心', d: '物理攻擊無視對手10%的物防，並有35%機率額外削減1點護盾。', st: { shieldChip: 35, pierceT: 10 }, lbl: ['碎盾', '%'] });
Object.assign(TALENTS.find(t => t.id === 'agile'), { n: '鋼鐵意志', d: '更不容易陷入中毒、麻痺、睡眠、灼傷。', st: { statusRes: 15 }, lbl: ['抗異常', '%'] });
TALENTS.push(
  { id: 'chase', n: '追擊', line: 0, max: 1, d: '攻擊破防中的魔物時，傷害再提高25%。', st: { brkBonus: 25 }, req: 'vital', lbl: ['追擊', '%'] },
  { id: 'resonance', n: '元素共鳴', line: 1, max: 1, d: '打中弱點時回復5點MP。', st: { weakMp: 5 }, req: 'elem', lbl: ['弱點回魔', ''] },
  { id: 'steadfast', n: '不動如山', line: 2, max: 1, d: '選擇「防禦」時，受到的傷害再減少30%。', st: { guardPlus: 1 }, req: 'agile', on: '防禦減傷' },
);
TALENTS.sort((a, b) => a.line - b.line);
const TALENT_VERSION = 2;
