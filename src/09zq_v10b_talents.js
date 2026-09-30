/* ===================== v10 階段二：天賦改成職業特化 =====================
   Plan item 17: talents are about the class, not a weapon or an element.
   - Branch 1 of every class strengthens its signature skill (09zo SIG): power, MP, crits, extra hits, status, shields,
     a second cast… each tier offers two different ways to grow it.
   - Branches 2 and 3 keep the class's two most characteristic play styles from v9.2; element and weapon options
     (火種 / 雷種 / 四象 / 借用技能…) are replaced by class ones. The branch that overlapped the new one was dropped
     (劍士 疾風, 魔導士 蒼雷, 守護者 聖盾, 遊俠 鷹眼, 詩人 凱歌, 機工 火力, 武僧 剛勁, 龍騎 蒼龍, 異界 越界, 魔劍 四象). */
const SIG_BR = {
  swordsman: ['一閃', '居合的極意，一刀決勝負。', [[['鋒利', 'sigPow:15'], ['輕刃', 'sigMp:2']], [['看破', 'sigCrit:15'], ['破綻', 'sigFdef:1']], [['迅斬', 'sigSpec:1'], ['殘心', 'sigShield:1']], [['一刀', 'sigPow:25'], ['燕回', 'sigHit:1']], [['無想', 'sigPow:20,sigCrit:25'], ['劍聖', 'sigTwice:30']]]],
  mage: ['奔流', '魔力化為奔流，屬性跟著武器與附魔。', [[['咒力', 'sigPow:15'], ['節流', 'sigMp:2']], [['灼痕', 'sigSt.brn:20'], ['雷痕', 'sigSt.par:15']], [['魔潮', 'sigMpBack:3'], ['共鳴', 'sigBuff.spa:1']], [['洪流', 'sigPow:25'], ['重唱', 'sigTwice:25']], [['元素王', 'sigPow:20,sigWeak:25'], ['賢者', 'sigMp:3,sigMpBack:4']]]],
  guardian: ['盾擊', '用盾衝撞，同時展開護盾。', [[['重盾', 'sigPow:15'], ['厚盾', 'sigShield:1']], [['盾震', 'sigFdef:1'], ['光盾', 'sigHeal:8']], [['威嚇', 'sigFatk:1'], ['反震', 'sigSpec:1']], [['城塞', 'sigShield:1,sigPow:10'], ['聖光', 'sigHeal:12']], [['不落', 'sigShield:2,sigHeal:10'], ['審判', 'sigPow:40']]]],
  ranger: ['影牙', '快速連射，越打越準。', [[['鋒牙', 'sigPow:15'], ['輕巧', 'sigMp:2']], [['淬毒', 'sigSt.psn:30'], ['獵印', 'sigSpec:1']], [['連牙', 'sigHit:1'], ['疾影', 'sigBuff.spe:1']], [['穿心', 'sigCrit:20'], ['毒爆', 'sigVsSt:30']], [['萬箭', 'sigHit:1,sigPow:15'], ['必殺', 'sigCrit:25,sigPow:15']]]],
  bard: ['共鳴', '以旋律鼓舞自己，強化與治癒。', [[['高歌', 'sigHeal:8'], ['輕唱', 'sigMp:2']], [['疾曲', 'sigBuff.spe:1'], ['護曲', 'sigBuff.def:1']], [['淨化', 'sigCure:1'], ['餘韻', 'sigSpec:1']], [['聖詠', 'sigHeal:12'], ['狂想', 'sigBuff.atk:1,sigBuff.spa:1']], [['英雄詩', 'sigShield:2,sigHeal:10'], ['終章', 'sigTwice:30']]]],
  machinist: ['砲擊', '機關砲的火力與改造。', [[['火藥', 'sigPow:15'], ['省料', 'sigMp:2']], [['燒夷彈', 'sigSt.brn:25'], ['電擊彈', 'sigSt.par:20']], [['連發', 'sigHit:1'], ['裝填', 'sigSpec:1']], [['徹甲彈', 'sigFdef:1,sigPow:10'], ['集束', 'sigCrit:20']], [['全彈', 'sigPow:40'], ['連環', 'sigTwice:30']]]],
  monk: ['寸勁', '連環拳與內勁的極致。', [[['發力', 'sigPow:15'], ['調息', 'sigMpBack:3']], [['連拳', 'sigHit:1'], ['點穴', 'sigSt.par:15']], [['氣勢', 'sigBuff.atk:1'], ['蓄勁', 'sigSpec:1']], [['崩拳', 'sigPow:25'], ['要穴', 'sigCrit:20']], [['百烈', 'sigHit:2'], ['金剛', 'sigShield:2,sigPow:15']]]],
  dragoon: ['龍騰', '躍上高空，全力落下。', [[['龍威', 'sigPow:15'], ['輕身', 'sigMp:2']], [['穿甲', 'sigFdef:1'], ['龍血', 'sigDrain:15']], [['衝擊', 'sigSpec:1'], ['鱗甲', 'sigShield:1']], [['隕龍', 'sigPow:25'], ['逆鱗', 'sigCrit:20']], [['天墜', 'sigPow:40'], ['龍王', 'sigDrain:20,sigShield:1']]]],
  otherworlder: ['光刃', '異界之光凝聚成刃。', [[['光輝', 'sigPow:15'], ['輕盈', 'sigMp:2']], [['聖光', 'sigDrain:15'], ['破邪', 'sigWeak:20']], [['加速', 'sigBuff.spe:1'], ['共鳴', 'sigSpec:1']], [['黎明', 'sigPow:25'], ['決意', 'sigCrit:20']], [['曙光', 'sigPow:25,sigDrain:10'], ['時空', 'sigTwice:30']]]],
  spellblade: ['魔劍', '劍與魔的共鳴一擊，奪取魔力。', [[['魔刃', 'sigPow:15'], ['吸魔', 'sigMpBack:3']], [['雷紋', 'sigSt.par:15'], ['炎紋', 'sigSt.brn:20']], [['共振', 'sigBuff.spa:1'], ['刻印', 'sigSpec:1']], [['解放', 'sigPow:25'], ['魔晶', 'sigCrit:20']], [['魔劍王', 'sigPow:40'], ['雙極', 'sigTwice:30']]]],
};
// which old branches stay (in order) and the option fixes (old option name → [new name, fx])
const KEEP_BR = { swordsman: [1, 2], mage: [0, 2], guardian: [1, 2], ranger: [0, 1], bard: [1, 2], machinist: [1, 2], monk: [1, 2], dragoon: [1, 2], otherworlder: [0, 2], spellblade: [0, 1] };
const OPT_FIX = {
  火種: ['咒種', 'magCrit:6'], 劫火: ['劫咒', 'spaP:10,critDmg:15'], 借法: ['法源', 'mpP:15'], 借曲: ['回響', 'atkMp:2'], 龍焰: ['龍力', 'atkP:6'], 焚身: ['焚身', 'fx.lastStand:1,atkP:6'],
  電擊: ['電擊', 'fx.stormMark:1,spcUp:15'],
};
const BR_RENAME = { mage: { 0: ['咒爆', '爆發與會心。'] }, bard: { 2: ['舞步', '普攻、迴避與特技。'] } };
for (const c in SIG_BR) { const T = T9[c]; if (!T) continue; const old = T.br, R = BR_RENAME[c] || {};
  const kept = KEEP_BR[c].map(i => { const [n, d, tiers] = old[i]; const rn = R[i]; return [rn ? rn[0] : n, rn ? rn[1] : d, tiers.map(pair => pair.map(([on, fx]) => OPT_FIX[on] ? OPT_FIX[on] : [on, fx]))]; });
  T.br = [SIG_BR[c], ...kept]; T.pitch = CLASSES[c].n + '：' + T.br.map(b => b[0]).join('／') + '。第一條分支強化職業招式「' + SIG[c].n + '」。'; }
for (const c in T9) { T9C[c] = T9[c].br.map(([n, d, tiers], b) => ({ n, d, tiers: tiers.map((pair, t) => pair.map(([on, fx], o) => ({ n: on, fx: parseFx9(fx), b, t, o }))) }));
  if (CLASS_V7[c]) { CLASS_V7[c].pitch = T9[c].pitch; T9[c].br.forEach(([n, d], b) => { if (CLASS_V7[c].br[b]) { CLASS_V7[c].br[b][0] = n; CLASS_V7[c].br[b][1] = d; } }); } }
// resonance: branch 1 → the signature skill; the kept branches keep theirs (fire / bolt / borrow keys replaced)
{ const FIX = { fireUp: ['magCrit', 3], boltUp: ['speP', 3], subUp: ['atkUp', 8], elem: ['spaP', 3] };
  for (const c in RESONANCE) { const old = RESONANCE[c]; RESONANCE[c] = [[['sigPow', 5], ['sigPow', 5], ['sigPow', 10]], ...KEEP_BR[c].map(i => old[i].map(([k, v]) => FIX[k] ? FIX[k] : [k, v]))]; } }
if (typeof V9_SUM_KEYS !== 'undefined') for (const k of ['sigPow', 'sigMp', 'sigCrit', 'sigHit', 'sigSpec', 'sigShield', 'sigHeal', 'sigDrain', 'sigMpBack', 'sigTwice', 'sigWeak', 'sigVsSt', 'sigFdef', 'sigFatk', 'sigCure']) V9_SUM_KEYS.add(k);
const ST_NM = { brn: '灼傷', psn: '中毒', par: '麻痺', slp: '睡眠' }, BUFF_NM = { atk: '物攻', spa: '魔攻', def: '物防', spd: '魔防', spe: '速度' };
Object.assign(TK_TXT, {
  sigPow: v => '職業招式威力+' + v + '%', sigMp: v => '職業招式MP-' + v, sigCrit: v => '職業招式會心率+' + v + '%', sigHit: v => '職業招式攻擊次數+' + v,
  sigSpec: v => '使用職業招式時特技+' + v + '層', sigShield: v => '使用職業招式後展開' + v + '回合護盾', sigHeal: v => '使用職業招式時回復' + v + '%最大HP', sigDrain: v => '職業招式傷害的' + v + '%回復HP',
  sigMpBack: v => '使用職業招式後回復' + v + 'MP', sigTwice: v => '職業招式有' + v + '%機率再發動一次（威力減半）', sigWeak: v => '職業招式打中弱點時傷害+' + v + '%', sigVsSt: v => '職業招式對異常狀態的對手傷害+' + v + '%',
  sigFdef: () => '職業招式降低對手物防1級', sigFatk: () => '職業招式降低對手物攻1級', sigCure: () => '使用職業招式時消除自己的異常狀態',
});
{ const _td = tDesc; tDesc = function (key, v) { if (key.startsWith('sigSt.')) return '職業招式有' + v + '%機率' + ST_NM[key.slice(6)]; if (key.startsWith('sigBuff.')) return '使用職業招式時' + BUFF_NM[key.slice(8)] + '+' + v; return _td(key, v); }; }
const tsum = (k, st = Game.st) => typeof talentSum === 'function' ? talentSum(k, st) : 0;
// talent keys summed by prefix (sigSt.brn, sigBuff.atk …)
function tsumPre(pre, st = Game.st) { const out = {}; if (!st || !st.cls) return out; for (const O of tcPicked(st)) for (const [k, v] of O.fx) if (k.startsWith(pre)) out[k.slice(pre.length)] = (out[k.slice(pre.length)] || 0) + v; return out; }
function sigMod(o, st = Game.st) {
  const p = tsum('sigPow', st), h = tsum('sigHit', st), c = tsum('sigCrit', st);
  if (p && o.pow) o.pow = Math.round(o.pow * (1 + p / 100)); if (h && o.hits) o.hits = Array.isArray(o.hits) ? o.hits.map(n => n + h) : o.hits + h;
  if (c) o.sigCrit = c; if (tsum('sigWeak', st)) o.sigWeak = tsum('sigWeak', st); if (tsum('sigVsSt', st)) o.sigVsSt = tsum('sigVsSt', st);
}
function sigTalentText(st = Game.st) { const L = []; for (const O of tcPicked(st)) if (O.b === 0) L.push(O.n); return L.length ? '　【天賦】' + L.join('・') : '　（天賦第一條分支會強化這一招）'; }
{ const _cd = Battle.prototype.calcDamage; Battle.prototype.calcDamage = function (u, t, mv) {
    const r = _cd.call(this, u, t, mv); if (!u || !u.hero || !mv || !mv.sig || !r || !(r.dmg > 0)) return r;
    if (mv.sigCrit && !r.crit && chance(mv.sigCrit / 100)) { r.crit = true; r.dmg = Math.round(r.dmg * 1.5); }
    if (mv.sigWeak && r.mult > 1) r.dmg = Math.round(r.dmg * (1 + mv.sigWeak / 100)); if (mv.sigVsSt && t && t.status) r.dmg = Math.round(r.dmg * (1 + mv.sigVsSt / 100)); return r; }; }
function* sigAfter(b, u, t, dealt, mv) {
  const st = Game.st, foe = t && t !== u && t.hp > 0, D = SIG[clsV7(st.cls)] || {};
  for (const [k, v] of Object.entries(tsumPre('sigSt.', st))) if (foe && dealt > 0 && !t.status && chance(v / 100)) yield* b.inflict(t, k, true);
  if (foe && dealt > 0 && tsum('sigFdef', st)) yield* b.statChange(t, { def: -1 }); if (foe && dealt > 0 && tsum('sigFatk', st)) yield* b.statChange(t, { atk: -1 });
  const bu = tsumPre('sigBuff.', st); if (Object.keys(bu).length) yield* b.statChange(u, bu);
  const dr = tsum('sigDrain', st); if (dr && dealt > 0) { const h = Math.min(u.maxhp - u.hp, Math.ceil(dealt * dr / 100)); if (h > 0) { u.hp += h; st.hp = u.hp; yield* b.animHP(u); } }
  const hl = tsum('sigHeal', st) + (D.healAfter || 0); if (hl) { const h = Math.min(u.maxhp - u.hp, Math.ceil(u.maxhp * hl / 100)); if (h > 0) { u.hp += h; st.hp = u.hp; Sound.sfx('heal'); yield* b.animHP(u); yield* b.msg('回復了' + h + '點HP！', { hold: 10 }); } }
  if (tsum('sigCure', st) && u.status) { u.status = null; st.status = null; }
  const sh = tsum('sigShield', st) + (D.shieldAfter || 0); if (sh) { u.shield = Math.max(u.shield || 0, sh); yield* b.msg(u.n + '展開了護盾！', { hold: 10 }); }
  const mb = tsum('sigMpBack', st); if (mb) { u.mp = Math.min(u.maxmp, u.mp + mb); st.mp = u.mp; }
  const sp = tsum('sigSpec', st) + (D.specAfter || 0); if (sp && mainWKey()) b.H.wc = Math.min(b.H.wcN || wsN(WSK[mainWKey()].s), (b.H.wc || 0) + sp);
  const tw = tsum('sigTwice', st); if (tw && foe && dealt > 0 && !b._sigTwice && chance(tw / 100)) { b._sigTwice = 1; const d = Math.min(t.hp, Math.max(1, Math.floor(dealt * 0.5)));
    yield* b.msg('「' + mv.n + '」再次發動！', { hold: 10 }); yield* b.playFx(mv.fx || 'hit', u, t); t.hp -= d; Sound.sfx('hitSuper'); yield* b.animHP(t); yield* b.msg('追加' + d + '點傷害！', { hold: 10 }); b._sigTwice = 0; }
}
