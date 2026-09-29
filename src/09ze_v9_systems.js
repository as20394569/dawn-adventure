/* ===================== v9.0 systems: class traits, branch resonance, gear sets, combo =====================
   Player request: adjust gameplay — talents, classes, gear and battle mechanics.
   1) 職業特性 — every class has its own always-on trait (before, most classes had "no class passive, see talents").
   2) 分支共鳴 — 5 / 10 / 15 points in one talent branch unlock a bonus each, so committing to a branch pays off.
   3) 套裝效果 — 7 gear families (王國騎士, 霜嶺, 熔岩, 黃銅發條, 黯滅, 星辰, 灰狼) give bonuses at 2 / 3 / 4 pieces.
   4) 連段 — using a different weapon active than the last one builds a combo (max 3, +6% damage each);
      repeating the same active, defending or using an item resets it. Basic attacks keep it. */

// key → stat multiplier (percent keys) or plain additive key (as used by the talents)
const V9_PCT = { hpP: 'hp', atkP: 'atk', defP: 'def', spaP: 'spa', spdP: 'spd', speP: 'spe', mpP: 'mp' };
const V9_SUM_KEYS = new Set(['chargeCut', 'healUp']); // these are read through talentSum()
function v9Apply(s, list) { const pct = {}; for (const [k, v] of list) { if (V9_SUM_KEYS.has(k)) continue; if (V9_PCT[k]) pct[V9_PCT[k]] = (pct[V9_PCT[k]] || 0) + v; else s[k] = (s[k] || 0) + v; }
  for (const k in pct) if (s[k]) s[k] = Math.floor(s[k] * (1 + pct[k] / 100)); return s; }

/* ---------- 1) class traits ---------- */
const CLASS_SIG = {
  swordsman: ['武者之魂', [['crit', 5], ['critDmg', 10]]], mage: ['魔力之泉', [['mpRegen', 3], ['spaP', 5]]], guardian: ['守護之盾', [['hpP', 8], ['guardPlus', 1]]],
  ranger: ['獵人直覺', [['speP', 8], ['eva', 3]]], bard: ['旋律', [['chargeCut', 1], ['healUp', 10]]], machinist: ['精密機關', [['spcUp', 20], ['atkMp', 1]]],
  monk: ['氣', [['atkUp', 15], ['atkMp', 2]]], dragoon: ['龍之血脈', [['bigUp', 10], ['hpP', 5]]], otherworlder: ['異界之力', [['atkP', 3], ['spaP', 3], ['defP', 3], ['spdP', 3]]],
  spellblade: ['魔劍', [['elem', 10], ['actUp', 5]]],
};
const sigText = cls => { const S = CLASS_SIG[clsV7(cls)]; return S ? S[1].map(([k, v]) => tDesc(k, v)).join('、') : ''; };

/* ---------- 2) branch resonance: [points, key, value, short label] ---------- */
const RES_AT = [5, 10, 15];
const SHORT = { crit: '會心', critDmg: '會心傷害', actUp: '主動技', atkP: '物攻', drain: '吸血', hpP: 'HP', speP: '速度', weakUp: '弱點', bigUp: '對頭目', fireUp: '火傷', spaP: '魔攻', boltUp: '雷傷', magCrit: '魔法會心', mpP: 'MP', mpSave: '省MP', elem: '屬性傷', healUp: '治癒', elemRes: '屬性抗', defP: '物防', spdP: '魔防', statusRes: '異常抗', eva: '迴避', atkUp: '普攻', hit: '命中', pierceT: '穿甲', spcUp: '特技', mpRegen: 'MP回復', subUp: '借用技' };
const shortDesc = (k, v) => (SHORT[k] || k) + '+' + v + '%';
const RESONANCE = {
  swordsman: [[['crit', 3], ['critDmg', 10], ['actUp', 10]], [['atkP', 4], ['drain', 3], ['hpP', 6]], [['speP', 4], ['weakUp', 6], ['bigUp', 8]]],
  mage: [[['fireUp', 8], ['spaP', 4], ['critDmg', 10]], [['boltUp', 8], ['speP', 4], ['magCrit', 4]], [['mpP', 8], ['mpSave', 5], ['elem', 6]]],
  guardian: [[['healUp', 10], ['hpP', 5], ['elemRes', 5]], [['defP', 5], ['spdP', 5], ['statusRes', 10]], [['atkP', 4], ['drain', 3], ['critDmg', 10]]],
  ranger: [[['crit', 3], ['critDmg', 8], ['bigUp', 6]], [['eva', 3], ['speP', 4], ['atkUp', 10]], [['hit', 4], ['weakUp', 6], ['pierceT', 6]]],
  bard: [[['actUp', 5], ['spcUp', 10], ['speP', 4]], [['healUp', 10], ['mpRegen', 1], ['hpP', 5]], [['crit', 3], ['subUp', 10], ['atkUp', 10]]],
  machinist: [[['hit', 4], ['critDmg', 8], ['pierceT', 6]], [['spcUp', 10], ['mpP', 8], ['actUp', 8]], [['defP', 5], ['hpP', 5], ['statusRes', 10]]],
  monk: [[['atkP', 4], ['crit', 3], ['atkUp', 10]], [['spaP', 4], ['mpRegen', 1], ['magCrit', 4]], [['eva', 3], ['hpP', 5], ['statusRes', 10]]],
  dragoon: [[['atkP', 4], ['pierceT', 6], ['bigUp', 6]], [['hpP', 5], ['drain', 3], ['defP', 4]], [['speP', 4], ['spcUp', 10], ['crit', 3]]],
  otherworlder: [[['atkP', 3], ['spaP', 3], ['hpP', 4]], [['elem', 5], ['weakUp', 6], ['subUp', 10]], [['speP', 4], ['mpSave', 5], ['mpRegen', 1]]],
  spellblade: [[['atkP', 3], ['spaP', 3], ['actUp', 8]], [['magCrit', 4], ['crit', 3], ['spcUp', 10]], [['elem', 5], ['elemRes', 5], ['fireUp', 6]]],
};
function resOn(st = Game.st) { const c = st.cls, R = RESONANCE[c], out = []; if (!R || !CT[c]) return out; R.forEach((tiers, b) => { const p = brPts(b, st); tiers.forEach((t, i) => { if (p >= RES_AT[i]) out.push(t); }); }); return out; }

/* ---------- 3) gear sets ---------- */
const GEAR_SETS = [
  ['王國騎士', ['royalSword', 'royalDagger', 'courtStaff', 'royalTome', 'royalHelm', 'royalMail', 'courtRobe', 'royalGreaves', 'royalBadge'], [['defP', 5]], [['hpP', 6]], [['actUp', 10]]],
  ['霜嶺', ['frostBrand', 'glacierStaff', 'glacierAxe', 'iceDagger', 'frostSpear', 'iceHarp', 'frostTome', 'frostMusket', 'yetiFur', 'snowBoots', 'frostHood', 'iceCharm'], [['elemRes', 8]], [['spdP', 6]], [['crit', 5]]],
  ['熔岩', ['flameBrand', 'volcanoStaff', 'magmaDagger', 'magmaFist', 'magmaPlate', 'lavaBoots', 'emberCharm', 'lavaHeart', 'salamanderHelm'], [['fireUp', 10]], [['atkP', 5]], [['critDmg', 15]]],
  ['黃銅發條', ['brassSword', 'gearStaff', 'gearRepeater', 'brassPistol', 'clockMail', 'springBoots'], [['speP', 5]], [['spcUp', 15]], [['actUp', 10]]],
  ['黯滅', ['duskSword', 'duskBlade', 'duskHelm', 'shadowRobe', 'shadowDagger', 'voidRing', 'voidStaff'], [['atkP', 4]], [['drain', 4]], [['bigUp', 12]]],
  ['星辰', ['starSword', 'starStaff', 'starLyre', 'starTome', 'starFist', 'starBlaster', 'starCrown', 'starBoots', 'starCharm', 'cometDagger', 'skySpear'], [['spaP', 4], ['atkP', 4]], [['mpRegen', 2]], [['actUp', 12]]],
  ['灰狼', ['wolfHood', 'wolfNecklace', 'wolfFang2', 'hunterCap', 'hunterLeather', 'tigerClaw'], [['speP', 4]], [['critDmg', 10]], [['crit', 4]]],
].map(([n, keys, b2, b3, b4]) => ({ n, keys: new Set(keys.filter(k => GEAR[k])), b: { 2: b2, 3: b3, 4: b4 } }));
const setOf = k => GEAR_SETS.find(S => S.keys.has(k));
function setCounts(st = Game.st) { const c = new Map(); for (const sl in st.equip || {}) { const u = st.equip[sl]; if (!u) continue; const g = (st.gear || []).find(x => x.u === u); const S = g && setOf(g.b); if (S) c.set(S, (c.get(S) || 0) + 1); } return c; }
function setBonus(st = Game.st) { const out = []; for (const [S, n] of setCounts(st)) for (const t of [2, 3, 4]) if (n >= t) out.push(...S.b[t]); return out; }
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) { const L = _gi(g, wrapW), S = g && GEAR[g.b] && setOf(g.b); if (!S) return L;
    const n = setCounts(Game.st).get(S) || 0; L.push(['【' + S.n + '套裝】目前' + n + '件', '#8ad0ff', 10]);
    for (const t of [2, 3, 4]) L.push([t + '件：' + S.b[t].map(([k, v]) => tDesc(k, v)).join('、') + (n >= t ? '　✓' : ''), n >= t ? '#ffd860' : '#9aa6c8', 10]);
    return L; }; }

/* ---------- apply 1–3 ---------- */
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (!st || !st.cls) return s; const S = CLASS_SIG[clsV7(st.cls)] || [null, []]; return v9Apply(s, [...S[1], ...resOn(st), ...setBonus(st)]); }; }
{ const _ts = talentSum; talentSum = function (key, st = Game.st) { let v = _ts(key, st); if (!V9_SUM_KEYS.has(key) || !st || !st.cls) return v; const S = CLASS_SIG[clsV7(st.cls)] || [null, []];
    for (const [k, x] of [...S[1], ...resOn(st), ...setBonus(st)]) if (k === key) v += x; return v; }; }
{ const _cp = classPassives; classPassives = function (cls, S) { const L = _cp(cls, S), G = CLASS_SIG[clsV7(cls)]; return G ? [{ k: 'sig', n: G[0], d: sigText(cls) }, ...L] : L; }; }

/* ---------- 4) combo ---------- */
const COMBO_MAX = 3, COMBO_STEP = 6;
const isActive = id => id && id !== 'attack' && MOVES[id] && MOVES[id].pow && (/^w_/.test(id) || (typeof WMOVE !== 'undefined' && WMOVE[id]));
{ const _ca = Battle.prototype.chooseAction; Battle.prototype.chooseAction = function* () { const a = yield* _ca.call(this); if (a && (a.type === 'defend' || a.type === 'item')) { this.combo = 0; this._lastAct = null; } return a; }; }
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    if (u && u.hero && isActive(id)) { const up = id !== this._lastAct; this.combo = up ? Math.min(COMBO_MAX, (this.combo || 0) + 1) : 0; this._lastAct = id;
      if (up && this.combo === 1 && !Game.st.flags.comboTut) { Game.st.flags.comboTut = 1; yield* this.msg('連段！換著使用不同的技能，傷害會越來越高。（最多3段，重複同一招會中斷）', { wait: true }); } }
    return yield* _um.call(this, u, t, id);
  };
}
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) { const r = _cd.call(this, u, t, mv); if (u && u.hero && this.combo > 0 && mv && mv.pow && r && r.dmg > 0) r.dmg = Math.round(r.dmg * (1 + COMBO_STEP * this.combo / 100)); return r; }; }
{ const _bh = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) {
    _bh.call(this, x); const Y = Math.round(this.boxH); if (!this.H || Y >= BH || Game.scene !== this || !(this.combo > 0)) return;
    const txt = '連段×' + this.combo + ' +' + COMBO_STEP * this.combo + '%', w = Math.ceil(Font.width(txt, 7)) + 6, yy = Y - 11;
    x.fillStyle = 'rgba(10,10,22,0.72)'; x.fillRect(3, yy - 1, w, 10); Font.draw(x, txt, 6, yy - 4, this.combo >= COMBO_MAX ? '#ff9a5a' : '#ffd860', UIC.textSh, 7);
  };
}
BATTLE_HELP.unshift(['連段', ['換著使用不同的武器主動技能，就能累積「連段」（最多3段）。', '每一段讓傷害+6%，普通攻擊也吃得到加成。', '連續使用同一招、防禦或使用道具時，連段會中斷。']]);
