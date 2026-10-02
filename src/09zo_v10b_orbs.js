/* ===================== v10 階段二：技能寶珠・職業招式・技能進化 =====================
   Plan items 15 / 16 (see 曙光冒險-v10擴大計畫):
   - Weapons keep their stats, element and 特技 (fired by normal attacks, 09l). Their two actives, passive and the 副武器
     borrow are gone. Skills now come from 技能寶珠 socketed into gear at the smith:
       weapon = active orbs (1 slot, 2 at 稀有+, 3 at 傳說), every armour / accessory piece = 1 passive orb.
   - Orbs drop from elites and bosses (first kill always, rematches sometimes), and come from story events and requests.
   - Every class keeps ONE signature skill of its own (no orb); its talent branch 0 strengthens it (09zq).
   - 熟練度 is replaced by 技能進化: an active orb evolves after 12 and 36 uses (a duplicate orb fused at the smith adds 12).
     Each evolution picks a path — 強攻 (power) or 附加 (an extra effect of that skill); evolved skills get a new name
     suffix (・改 / ・極) and an extra flash on hit. Passive orbs level up to Lv3 by fusing duplicates. */

/* ---------- active orbs: { n, tpl (animation & mechanics), pow, mp, d, B: [1st ✦, 2nd ✦], A? (support: custom ⚔) } ---------- */
const ORB_A = {
  galeCut: { n: '裂風斬', tpl: 'gale', pow: 55, mp: 3, d: '先制突進，削減護盾。', B: ['spe+1', 'hit+1'] },
  twinFang: { n: '雙牙連擊', tpl: 'twinStrike', pow: 32, mp: 4, d: '兩段快速攻擊。', B: ['psn:35', 'hit+1'] },
  thornBind: { n: '荊棘縛', tpl: 'leafBlade', pow: 62, mp: 4, d: '草屬性斬擊，容易會心。', B: ['tangle', 'fspe-1'] },
  aquaEdge: { n: '水刃', tpl: 'aquaBlade', pow: 58, mp: 4, d: '水屬性魔法刃。', B: ['wet', 'fspd-1'] },
  bolt: { n: '雷擊', tpl: 'thunder', pow: 58, mp: 4, d: '雷屬性魔法，有機率麻痺。', B: ['par:25', 'spec+1'] },
  fireShot: { n: '火炎彈', tpl: 'fireBolt', pow: 52, mp: 3, d: '火屬性魔法，有機率灼傷。', B: ['brn:30', 'cheap'] },
  rockBreak: { n: '碎岩擊', tpl: 'armorBreak', pow: 60, mp: 4, d: '砸碎盔甲，降低物防。', B: ['fdef-1', 'fatk-1'] },
  shieldRam: { n: '重盾撞', tpl: 'shieldBash', pow: 66, mp: 5, d: '連人帶盾撞過去，削減護盾。', B: ['shield:1', 'def+1'] },
  swallowFlight: { n: '燕翔', tpl: 'doubleSlash', pow: 34, mp: 4, d: '燕子般的兩段斬。', B: ['spe+1', 'hit+1'] },
  bloodMoon: { n: '血月斬', tpl: 'bloodBlade', pow: 72, mp: 5, d: '吸取對手的生命。', B: ['drain:20', 'atk+1'] },
  steelCleaver: { n: '斷鋼', tpl: 'zantetsu', pow: 92, mp: 6, d: '對破防的對手威力大增。', B: ['fdef-1', 'crit'] },
  shadowRush: { n: '疾影突', tpl: 'shadowStab', pow: 96, mp: 6, d: '從影子中突刺，容易會心。', B: ['first', 'psn:35'] },
  allOut: { n: '捨身劈', tpl: 'recklessSlash', pow: 112, mp: 5, d: '威力極大，但自己也會受到反傷。', B: ['atk+1', 'drain:15'] },
  bladeRain: { n: '亂刃', tpl: 'flurry', pow: 21, mp: 6, d: '2～5段的連續斬擊。', B: ['hit+1', 'fdef-1'] },
  lastWall: { n: '背水擊', tpl: 'lastStand', pow: 62, mp: 4, d: 'HP越低威力越大。', B: ['shield:1', 'drain:20'] },
  cloudPierce: { n: '穿雲槍', tpl: 'pierceLance', pow: 72, mp: 5, d: '無視部分物防的突刺。', B: ['fdef-1', 'first'] },
  chainPalm: { n: '連環掌', tpl: 'comboPunch', pow: 23, mp: 5, d: '連續出拳，累積氣。', B: ['hit+1', 'par:15'] },
  dawnFlash: { n: '破曉一閃', tpl: 'iaiSlash', pow: 86, mp: 6, d: '先制的居合斬，容易會心。', B: ['spec+1', 'crit'] },
  crossJudge: { n: '斷罪十字', tpl: 'crossSlash', pow: 82, mp: 6, d: '十字斬，容易會心。', B: ['fatk-1', 'atk+1'] },
  assassinMark: { n: '暗殺印', tpl: 'assassinate', pow: 72, mp: 6, d: '對HP低的對手威力大增。', B: ['psn:40', 'crit'] },
  flameVortex: { n: '烈焰漩渦', tpl: 'flameWave', pow: 76, mp: 6, d: '火焰漩渦，有機率灼傷。', B: ['brn:30', 'spa+1'] },
  starfall: { n: '隕星', tpl: 'meteor', pow: 118, mp: 11, d: '召喚隕石，火屬性大魔法。', B: ['brn:40', 'cheap'] },
  tidalRage: { n: '怒濤', tpl: 'aquaBurst', pow: 82, mp: 7, d: '水屬性大浪。', B: ['wet', 'fspe-1'] },
  chainLightning: { n: '連鎖閃電', tpl: 'chainBolt', pow: 76, mp: 7, d: '雷屬性魔法，有機率麻痺。', B: ['par:25', 'spe+1'] },
  thorHammer: { n: '雷神槌', tpl: 'skyJudge', pow: 110, mp: 10, d: '從天而降的雷槌。', B: ['par:30', 'spa+1'] },
  verdantWind: { n: '翠風', tpl: 'leafStorm', pow: 64, mp: 5, d: '草屬性的葉片風暴。', B: ['tangle', 'drain:15'] },
  arcaneShot: { n: '魔光彈', tpl: 'manaBurst', pow: 66, mp: 5, d: '純粹的魔力彈（屬性跟著武器與附魔）。', B: ['mp:3', 'spa+1'] },
  sonicBoom: { n: '音爆', tpl: 'soundBlast', pow: 70, mp: 6, d: '音波衝擊，有機率讓對手混亂。', B: ['fspd-1', 'slp:15'] },
  steamCannon: { n: '蒸汽砲', tpl: 'steamJet', pow: 72, mp: 6, d: '水屬性的物理噴射。', B: ['wet', 'fdef-1'] },
  combustion: { n: '業火連爆', tpl: 'combust', pow: 72, mp: 6, d: '對異常狀態的對手威力大增。', B: ['brn:35', 'spa+1'] },
  mend: { n: '治癒之光', tpl: 'heal', mp: 5, d: '回復HP。', A: ['heal+25', 'heal+25'], B: ['cure', 'shield:1'] },
  holyWard: { n: '聖護', tpl: 'sanctuary', mp: 8, d: '回復HP並展開護盾。', A: ['heal+25', 'heal+25'], B: ['cure', 'def+1'] },
  manaWall: { n: '魔障壁', tpl: 'barrier', mp: 5, d: '展開魔法護盾，傷害減少。', A: ['shield:1', 'shield:1'], B: ['spd+1', 'mp:3'] },
  warCry: { n: '戰吼', tpl: 'warCry', mp: 4, d: '提升自己的物攻。', A: ['atk+1', 'cheap'], B: ['def+1', 'fatk-1'] },
  smokeVeil: { n: '煙遁', tpl: 'smokeBomb', mp: 4, d: '3回合內迴避提升。', A: ['cheap', 'spe+1'], B: ['spec+1', 'fspd-1'] },
  focusMind: { n: '集中', tpl: 'focus', mp: 3, d: '下一次攻擊必定會心。', A: ['cheap', 'atk+1'], B: ['spe+1', 'mp:3'] },
  ironWall: { n: '鐵壁', tpl: 'ironWill', mp: 4, d: '大幅提升物防。', A: ['spd+1', 'cheap'], B: ['heal+15', 'shield:1'] },
  chronoLock: { n: '時停', tpl: 'timeStop', mp: 12, d: '讓時間靜止，對手暫時無法行動。', A: ['cheap', 'cheap'], B: ['spec+1', 'spe+1'] },
  songOfValor: { n: '勇氣頌', tpl: 'battleSong', mp: 6, d: '物攻和魔攻各提升一級。', A: ['cheap', 'spe+1'], B: ['heal+15', 'shield:1'] },
  drakeFang: { n: '雙龍牙', tpl: 'twinDragon', pow: 50, mp: 6, d: '兩段穿透突刺。', B: ['fdef-1', 'hit+1'] },
};
/* ---------- passive orbs: fx 'key:v,...' at Lv1; numbers ×1.5 at Lv2 and ×2 at Lv3; plain flags get `up` per level ---------- */
const ORB_P = {
  vigor: { n: '生命強化', fx: 'hpP:8' }, might: { n: '力量強化', fx: 'atkP:6' }, sorcery: { n: '魔力強化', fx: 'spaP:6' },
  bulwark: { n: '守備強化', fx: 'defP:8' }, ward: { n: '魔抗強化', fx: 'spdP:8' }, haste: { n: '迅捷', fx: 'speP:8' },
  keenEye: { n: '會心', fx: 'crit:5' }, ruthless: { n: '致命', fx: 'critDmg:18' }, renew: { n: '再生', fx: 'fx.regen:1', up: 'hpP:4' },
  vanguard: { n: '先制', fx: 'fx.first:1', up: 'speP:4' }, thornHide: { n: '荊棘', fx: 'fx.thorns:1', up: 'defP:4' },
  guardian: { n: '堅守回復', fx: 'fx.guardHeal:1', up: 'defP:4' }, undying: { n: '不屈', fx: 'fx.endure:1', up: 'hpP:4' },
  leech: { n: '吸血', fx: 'drain:5' }, meditation: { n: '冥想', fx: 'mpRegen:2' }, thrift: { n: '省力', fx: 'mpSave:12' },
  doubleHit: { n: '連擊', fx: 'fx.double:1', up: 'atkP:3' }, sunder: { n: '破甲', fx: 'fx.pierce:1', up: 'atkP:3' },
  lastStand: { n: '背水', fx: 'fx.lastStand:1', up: 'hpP:4' }, fervor: { n: '奮戰', fx: 'fx.fervor:1', up: 'atkP:3' },
  hunter: { n: '獵殺', fx: 'fx.predator:1', up: 'crit:2' }, shieldBreaker: { n: '碎盾', fx: 'fx.breaker:1', up: 'atkP:3' },
  venom: { n: '毒刃', fx: 'fx.poisonEdge:1', up: 'crit:2' }, shadowStep: { n: '影步', fx: 'fx.shadowStep:1', up: 'eva:2' },
  resolve: { n: '異常抗性', fx: 'statusRes:20' }, prism: { n: '元素抗性', fx: 'elemRes:12' }, wisdom: { n: '智慧', fx: 'fx.wisdom:1', up: 'spaP:3' },
  fortune: { n: '幸運', fx: 'fx.fortune:1', up: 'crit:2' }, siphon: { n: '魔力汲取', fx: 'fx.manaSiphon:1', up: 'mpP:6' }, surge: { n: '奧術湧動', fx: 'fx.arcaneSurge:1', up: 'spaP:3' },
};
const ORB_EVO = [12, 36];
const ORB_STAGE = ['', '・改', '・極'];
/* ---------- class signature skills (branch 0 of the talents strengthens them) ---------- */
const SIG = {
  swordsman: { n: '武者一閃', tpl: 'iaiSlash', pow: 88, mp: 5, d: '先制居合，容易會心。' },
  mage: { n: '元素奔流', tpl: 'manaBurst', pow: 82, mp: 6, d: '屬性跟著武器與附魔。' },
  guardian: { n: '聖盾衝擊', tpl: 'guardStrike', pow: 64, mp: 4, d: '盾擊後展開護盾。', shieldAfter: 1 },
  ranger: { n: '影牙連射', tpl: 'twinStrike', pow: 36, mp: 4, d: '先制兩連射。', prio: 1 },
  bard: { n: '共鳴旋律', tpl: 'battleSong', mp: 5, d: '攻魔提升，回復HP，特技+1。', healAfter: 12, specAfter: 1 },
  machinist: { n: '機關砲擊', tpl: 'clockBomb', pow: 84, mp: 5, d: '削減護盾的砲擊。' },
  monk: { n: '連環寸勁', tpl: 'comboPunch', pow: 30, mp: 4, d: '多段連拳，累積氣。' },
  dragoon: { n: '龍騰擊', tpl: 'jump', pow: 132, mp: 6, d: '躍上高空，下回合落下。' },
  otherworlder: { n: '曙光之刃', tpl: 'dawnBreak', pow: 86, mp: 6, d: '吸取生命，容易會心。' },
  spellblade: { n: '魔劍解放', tpl: 'manaSlash', pow: 68, mp: 3, d: '奪取對手MP。' },
};
const sigId = (st = Game.st) => st && st.cls && SIG[clsV7(st.cls)] ? 'sig_' + clsV7(st.cls) : null;
// MOVES entries: animation / mechanics from the template, new names and power
for (const k in ORB_A) { const O = ORB_A[k], T = MOVES[O.tpl]; if (!T) { console.warn('orb tpl', k); continue; } MOVES['o_' + k] = { ...T, n: O.n, d: O.d, orb: k, ws: 1, ...(O.pow ? { pow: O.pow } : {}) }; SKILL_MP['o_' + k] = O.mp; }
for (const c in SIG) { const O = SIG[c], T = MOVES[O.tpl]; MOVES['sig_' + c] = { ...T, n: O.n, d: O.d, sig: c, ws: 1, ...(O.pow ? { pow: O.pow } : {}), ...(O.prio ? { prio: 1 } : {}) }; SKILL_MP['sig_' + c] = O.mp; }

/* ---------- orb instances & sockets ---------- */
const orbList = (st = Game.st) => st.orbs || (st.orbs = []);
const orbBy = (u, st = Game.st) => orbList(st).find(o => o.u === u);
const orbDef = o => ORB_A[o.k] || ORB_P[o.k];
const isActiveOrb = o => !!ORB_A[o.k];
function newOrb(k, st = Game.st) { st.orbN = (st.orbN || 0) + 1; const o = { u: 'o' + st.orbN, k, x: 0, e: [], lv: 1 }; orbList(st).push(o); (st.orbSeen || (st.orbSeen = {}))[k] = 1; return o; }
function orbSlots(g) { const G = g && GEAR[g.b]; if (!G) return 0; if (G.slot === 'weapon') return g.q >= 5 ? 3 : g.q >= 3 ? 2 : 1; return 1; }
const orbSlotKind = g => GEAR[g.b].slot === 'weapon' ? 'a' : 'p';
function gearOrbs(g, st = Game.st) { return (g && g.o || []).map(u => orbBy(u, st)).filter(Boolean); }
const orbHost = (o, st = Game.st) => (st.gear || []).find(g => (g.o || []).includes(o.u)) || null;
function activeOrbs(st = Game.st) { const w = mainWeapon(st); return gearOrbs(w, st).filter(isActiveOrb); }
function passiveOrbs(st = Game.st) { const out = []; for (const [sl, u] of Object.entries(st.equip || {})) { if (sl === 'weapon') continue; const g = gearBy(u, st); out.push(...gearOrbs(g, st).filter(o => !isActiveOrb(o))); } return out; }
const orbStage = o => (o.e || []).length;
const orbName = o => orbDef(o).n + (isActiveOrb(o) ? ORB_STAGE[orbStage(o)] : o.lv > 1 ? ' Lv' + o.lv : '');
const orbPending = o => isActiveOrb(o) && orbStage(o) < 2 && (o.x || 0) >= ORB_EVO[orbStage(o)];
const orbOfMove = (id, st = Game.st) => { const k = MOVES[id] && MOVES[id].orb; if (!k) return null; const L = st.skillLib || {}; return L[k] || activeOrbs(st).find(o => o.k === k) || null; }; // v11: the skill library entry carries the evolution
// evolution effect codes → text
const EVO_TXT = {
  brn: v => v + '%灼傷', psn: v => v + '%中毒', par: v => v + '%麻痺', slp: v => v + '%睡眠', drain: v => '造成傷害的' + v + '%回復HP', mp: v => '回復' + v + 'MP', shield: v => '展開' + v + '回合護盾',
  'atk+1': () => '自己物攻+1', 'spa+1': () => '自己魔攻+1', 'def+1': () => '自己物防+1', 'spd+1': () => '自己魔防+1', 'spe+1': () => '自己速度+1',
  'fdef-1': () => '對手物防-1', 'fatk-1': () => '對手物攻-1', 'fspe-1': () => '對手速度-1', 'fspd-1': () => '對手魔防-1', wet: () => '讓對手潮濕', tangle: () => '讓對手被纏繞',
  cheap: () => '消耗MP-40%', first: () => '先制出手', 'hit+1': () => '攻擊次數+1', 'heal+25': () => '回復量+25%', 'heal+15': () => '附帶回復15%最大HP', cure: () => '消除自己的異常狀態', 'spec+1': () => '特技累積+1層', crit: () => '會心率加倍',
};
const evoCode = c => { const i = c.indexOf(':'); return i < 0 ? [c, 0] : [c.slice(0, i), +c.slice(i + 1)]; };
const evoText = c => { const [k, v] = evoCode(c); return EVO_TXT[k] ? EVO_TXT[k](v) : c; };
const orbAOpt = (o, s) => { const D = ORB_A[o.k]; return D.A ? D.A[s] : s === 0 ? 'pow25' : 'pow20crit'; };
const evoOptText = (o, s, br) => br === 'A' ? (ORB_A[o.k].A ? evoText(orbAOpt(o, s)) : s === 0 ? '威力+25%' : '威力+20%、會心率加倍') : evoText(ORB_A[o.k].B[s]);
function orbCodes(o) { const D = ORB_A[o.k]; return (o.e || []).map((b, s) => b === 'A' ? orbAOpt(o, s) : D.B[s]); }

/* ---------- which skills the hero has: the class signature + the main weapon's active orbs ---------- */
function wsList(st = Game.st) { const out = []; const s = sigId(st); if (s) out.push(s); for (const o of activeOrbs(st)) out.push('o_' + o.k); return out; }
learnedSkills = function (st = Game.st) { return wsList(st); };
usableSkills = function (st = Game.st) { return wsList(st); };
summarySkills = function (st = Game.st) { return wsList(st); };
const skillLvSafe = typeof skillLv === 'function' ? skillLv : () => 1;
{ const _sm = skillMove; skillMove = function (id, st = Game.st) {
    if (id === 'attack') return _sm(id, st);
    const base = MOVES[id]; if (!base || !(base.orb || base.sig)) return _sm(id, st);
    const o = { ...base };
    if (base.orb) { const ob = orbOfMove(id, st); if (ob) { o.n = orbName(ob); for (const c of orbCodes(ob)) evoMod(o, c); o.evo = orbCodes(ob); o.evoBr = ob.e.join(''); } }
    if (base.sig && typeof sigMod === 'function') sigMod(o, st);
    if (o.heal && typeof talentSum === 'function') { const h = talentSum('healUp', st); if (h) o.heal = +(o.heal * (1 + h / 100)).toFixed(2); }
    return o;
  }; }
function evoMod(o, c) {
  const [k] = evoCode(c);
  if (k === 'pow25' && o.pow) o.pow = Math.round(o.pow * 1.25);
  else if (k === 'pow20crit') { if (o.pow) o.pow = Math.round(o.pow * 1.2); o.crit = 1; }
  else if (k === 'crit') o.crit = 1; else if (k === 'first') o.prio = 1;
  else if (k === 'hit+1' && o.hits) o.hits = Array.isArray(o.hits) ? o.hits.map(n => n + 1) : o.hits + 1;
  else if (k === 'heal+25' && o.heal) o.heal = +(o.heal * 1.25).toFixed(2);
  else if (k === 'shield' && o.shield) o.shield += 1;
}
{ const _mp = skillMP; skillMP = function (id, st = Game.st) {
    const b = MOVES[id]; if (!b || !(b.orb || b.sig)) return _mp(id, st);
    let v = SKILL_MP[id] || 4; if (b.orb) { const ob = orbOfMove(id, st); if (ob) for (const c of orbCodes(ob)) if (c === 'cheap') v = Math.ceil(v * 0.6); }
    if (b.sig && typeof talentSum === 'function') v = Math.max(1, v - talentSum('sigMp', st));
    return v;
  }; }
skillLv = function () { return 1; };

/* ---------- passives from armour orbs ---------- */
function passiveFx(o) { const D = ORB_P[o.k], lv = o.lv || 1, out = []; for (const [k, v] of parseFx9(D.fx)) out.push([k, k.startsWith('fx.') ? v : Math.round(v * [1, 1.5, 2][lv - 1] * 10) / 10]); if (D.up && lv > 1) for (const [k, v] of parseFx9(D.up)) out.push([k, v * (lv - 1)]); return out; }
const orbFxText = o => passiveFx(o).map(([k, v]) => k.startsWith('fx.') ? (typeof tDesc === 'function' ? tDesc(k, 1) : k) : typeof tDesc === 'function' ? tDesc(k, v) : k + v).join('、');

/* ---------- battle: evolution effects, use counts, the evolved flash ---------- */
function evoFlash(b, t, br) { const C = b.center(t), last = br[br.length - 1] === 'A'; b.spawn({ k: 'ring', x: C.x, y: C.y, r0: 6, r1: 34, c: last ? '#ffb040' : '#80e0ff', life: 16 }); b.spawn({ k: 'flash', c: last ? '#ffd080' : '#a0f0ff', a: 0.22, life: 8 }); }
// after a battle: evolve the orbs that are ready (one prompt each)
function* orbEvolveFlow(o) {
  const s = orbStage(o), D = ORB_A[o.k];
  yield* say('「' + orbName(o) + '」可以進化了！選擇進化的方向：');
  // v12.0.1 (player: 「選擇技能進階成改跟極時 文字超出螢幕外」): name only what applies to this skill — 「MP−40%（有冷卻的技能：冷卻−1）」 was 230px on a 176px screen
  const opt = br => { const code = br === 'A' ? (D.A ? orbAOpt(o, s) : null) : D.B[s]; if (code && evoCode(code)[0] === 'cheap' && typeof DEF !== 'undefined') { const sk = DEF.skills['o_' + o.k]; return sk && sk.cooldown > 0 ? '冷卻−1' : 'MP−40%'; } return evoOptText(o, s, br); };
  const r = yield* ask('「' + D.n + ORB_STAGE[s + 1] + '」', ['強攻：' + opt('A'), '附加：' + opt('B'), '之後再說'], { cancel: false });
  if (r > 1) { o.told = 0; return false; }
  o.e = (o.e || []).concat(r === 0 ? 'A' : 'B'); o.told = 0; Sound.jingle('levelup'); yield* itemGet('「' + orbName(o) + '」進化了！'); return true;
}
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    const st = this.st; if (st && !this.script && !UI.stack.length && !Game.trans && st.skillLib) { const o = Object.values(st.skillLib || {}).find(x => ORB_A[x.k] && orbPending(x) && x.told); if (o) { this.run(orbEvolveFlow(o)); return; } }
    return _u.apply(this, a); }; }

/* ---------- getting orbs ---------- */
function* orbGet(k, how) { const o = newOrb(k); Sound.jingle('item'); yield* itemGet((how || '') + Game.st.name + '得到了技能寶珠「' + orbDef(o).n + '」！'); if (!Game.st.flags.orbTut) { Game.st.flags.orbTut = 1; yield* sayAll(['（技能寶珠要在鐵匠舖鑲進裝備才能使用。）', '（主動技能鑲在武器上，被動鑲在防具和飾品上。）']); } return o; }
// elites & bosses: first kill always gives the first orb in their list; rematches 30% (bosses 45%) one of them
const ORB_DROP = {
  millGolem: ['galeCut'], wolf: ['twinFang'], bandit: ['smokeVeil', 'fortune'], blackCatfish: ['bolt'], flower: ['thornBind'], croc: ['aquaEdge'], mossGiant: ['ironWall', 'renew'],
  rockRhino: ['rockBreak'], lizardChief: ['shieldRam', 'bulwark'], rogueBlade: ['arcaneShot', 'siphon'], stagLord: ['swallowFlight', 'haste'], bogWitch: ['chainLightning', 'resolve'],
  boneKnight: ['steelCleaver', 'undying'], wraithGeneral: ['bloodMoon', 'leech'], blackFeather: ['shadowRush', 'venom'], runeGolem: ['manaWall', 'ward'], boarKing: ['allOut', 'fervor'],
  clockKnight: ['steamCannon', 'sunder'], snowBear: ['warCry', 'vigor'], frostLich: ['tidalRage', 'meditation'], youngDragon: ['flameVortex', 'might'], duskCaptain: ['crossJudge', 'shieldBreaker'], mimic: ['fortune', 'wisdom'],
  banditBoss: ['chainPalm', 'doubleHit'], duneWorm: ['cloudPierce', 'thornHide'], golem: ['lastWall', 'bulwark'], crystalGolem: ['manaWall', 'prism'], silverWyrm: ['tidalRage', 'surge'], hydra: ['combustion', 'venom'],
  ratKing: ['bladeRain', 'hunter'], harvestGolem: ['verdantWind', 'guardian'], clockColossus: ['chronoLock', 'thrift'], frostQueen: ['thorHammer', 'keenEye'], lavaGiant: ['starfall', 'lastStand'],
  victorDemon: ['assassinMark', 'sorcery'], shadowGeneral: ['dawnFlash', 'ruthless'], gatekeeper: ['drakeFang', 'vanguard'], starGuardian: ['sonicBoom', 'shadowStep'],
};
// requests & story rewards may carry { orb: key }
    