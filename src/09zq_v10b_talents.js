/* ===================== v10 階段二：天賦改成職業特化 =====================
   Plan item 17: talents are about the class, not a weapon or an element.
   - v10.4.2 (player: 「職業招式從天賦獨立出來」): the signature skill (09zo SIG) has its own page (選單→技能→★), bought with
     the same talent points: 5 tiers, two ways to grow it in each (power, MP, crits, extra hits, status, shields, a second cast…).
     Inside the save it is branch 3 ('3.t' keys), so points, 共鳴, 遺忘之書 and the 30-point cap work as before.
   - The talent tree has its three v9.2 branches again. Element, weapon and borrowed-skill options (火種 / 雷種 / 四象 /
     借用技能…) are replaced by class ones. */
const SIG_BR = {
  swordsman: ['一閃', '一刀決勝負。', [[['鋒利', 'sigPow:15'], ['輕刃', 'sigMp:2']], [['看破', 'sigCrit:15'], ['破綻', 'sigFdef:1']], [['迅斬', 'sigSpec:1'], ['殘心', 'sigShield:1']], [['一刀', 'sigPow:25'], ['燕回', 'sigHit:1']], [['無想', 'sigPow:20,sigCrit:25'], ['劍聖', 'sigTwice:30']]]],
  mage: ['奔流', '魔力化為奔流。', [[['咒力', 'sigPow:15'], ['節流', 'sigMp:2']], [['灼痕', 'sigSt.brn:20'], ['雷痕', 'sigSt.par:15']], [['魔潮', 'sigMpBack:3'], ['共鳴', 'sigBuff.spa:1']], [['洪流', 'sigPow:25'], ['重唱', 'sigTwice:25']], [['元素王', 'sigPow:20,sigWeak:25'], ['賢者', 'sigMp:3,sigMpBack:4']]]],
  guardian: ['盾擊', '攻守一體的盾擊。', [[['重盾', 'sigPow:15'], ['厚盾', 'sigShield:1']], [['盾震', 'sigFdef:1'], ['光盾', 'sigHeal:8']], [['威嚇', 'sigFatk:1'], ['反震', 'sigSpec:1']], [['城塞', 'sigShield:1,sigPow:10'], ['聖光', 'sigHeal:12']], [['不落', 'sigShield:2,sigHeal:10'], ['審判', 'sigPow:40']]]],
  ranger: ['影牙', '越打越準。', [[['鋒牙', 'sigPow:15'], ['輕巧', 'sigMp:2']], [['淬毒', 'sigSt.psn:30'], ['獵印', 'sigSpec:1']], [['連牙', 'sigHit:1'], ['疾影', 'sigBuff.spe:1']], [['穿心', 'sigCrit:20'], ['毒爆', 'sigVsSt:30']], [['萬箭', 'sigHit:1,sigPow:15'], ['必殺', 'sigCrit:25,sigPow:15']]]],
  bard: ['共鳴', '鼓舞與治癒。', [[['高歌', 'sigHeal:8'], ['輕唱', 'sigMp:2']], [['疾曲', 'sigBuff.spe:1'], ['護曲', 'sigBuff.def:1']], [['淨化', 'sigCure:1'], ['餘韻', 'sigSpec:1']], [['聖詠', 'sigHeal:12'], ['狂想', 'sigBuff.atk:1,sigBuff.spa:1']], [['英雄詩', 'sigShield:2,sigHeal:10'], ['終章', 'sigTwice:30']]]],
  machinist: ['砲擊', '火力與改造。', [[['火藥', 'sigPow:15'], ['省料', 'sigMp:2']], [['燒夷彈', 'sigSt.brn:25'], ['電擊彈', 'sigSt.par:20']], [['連發', 'sigHit:1'], ['裝填', 'sigSpec:1']], [['徹甲彈', 'sigFdef:1,sigPow:10'], ['集束', 'sigCrit:20']], [['全彈', 'sigPow:40'], ['連環', 'sigTwice:30']]]],
  monk: ['寸勁', '連拳與內勁。', [[['發力', 'sigPow:15'], ['調息', 'sigMpBack:3']], [['連拳', 'sigHit:1'], ['點穴', 'sigSt.par:15']], [['氣勢', 'sigBuff.atk:1'], ['蓄勁', 'sigSpec:1']], [['崩拳', 'sigPow:25'], ['要穴', 'sigCrit:20']], [['百烈', 'sigHit:2'], ['金剛', 'sigShield:2,sigPow:15']]]],
  dragoon: ['龍騰', '全力落下。', [[['龍威', 'sigPow:15'], ['輕身', 'sigMp:2']], [['穿甲', 'sigFdef:1'], ['龍血', 'sigDrain:15']], [['衝擊', 'sigSpec:1'], ['鱗甲', 'sigShield:1']], [['隕龍', 'sigPow:25'], ['逆鱗', 'sigCrit:20']], [['天墜', 'sigPow:40'], ['龍王', 'sigDrain:20,sigShield:1']]]],
  otherworlder: ['光刃', '異界之光。', [[['光輝', 'sigPow:15'], ['輕盈', 'sigMp:2']], [['聖光', 'sigDrain:15'], ['破邪', 'sigWeak:20']], [['加速', 'sigBuff.spe:1'], ['共鳴', 'sigSpec:1']], [['黎明', 'sigPow:25'], ['決意', 'sigCrit:20']], [['曙光', 'sigPow:25,sigDrain:10'], ['時空', 'sigTwice:30']]]],
  spellblade: ['魔劍', '奪取魔力。', [[['魔刃', 'sigPow:15'], ['吸魔', 'sigMpBack:3']], [['雷紋', 'sigSt.par:15'], ['炎紋', 'sigSt.brn:20']], [['共振', 'sigBuff.spa:1'], ['刻印', 'sigSpec:1']], [['解放', 'sigPow:25'], ['魔晶', 'sigCrit:20']], [['魔劍王', 'sigPow:40'], ['雙極', 'sigTwice:30']]]],
};
// v10.1 kept two branches per class (KEEP_BR); v10.4.2 brings the third back. Saves made in between are moved over once (below).
const KEEP_BR = { swordsman: [1, 2], mage: [0, 2], guardian: [1, 2], ranger: [0, 1], bard: [1, 2], machinist: [1, 2], monk: [1, 2], dragoon: [1, 2], otherworlder: [0, 2], spellblade: [0, 1] };
const OPT_FIX = { // old option name → [new name, fx]: no element / weapon / borrowed-skill specialisation
  火種: ['咒種', 'magCrit:6'], 劫火: ['劫咒', 'spaP:10,critDmg:15'], 借法: ['法源', 'mpP:15'], 借曲: ['回響', 'atkMp:2'], 龍焰: ['龍力', 'atkP:6'], 焚身: ['焚身', 'fx.lastStand:1,atkP:6'],
  電擊: ['電擊', 'fx.stormMark:1,spcUp:15'],
  雷種: ['雷心', 'spaP:6'], 落雷: ['落雷', 'critDmg:25,speP:4'], 雷帝: ['雷帝', 'spaP:8,comboStep:3'],
  靈素: ['靈素', 'spaP:6'], 借勢: ['借勢', 'atkUp:20'], 萬能: ['萬能', 'weakUp:20,dmgUp:8'],
  炎符: ['炎符', 'atkP:6'], 雷符: ['雷符', 'speP:8'], 水符: ['水符', 'spdP:8'], 草符: ['草符', 'hpP:8'], 元素流: ['符流', 'magCrit:6'],
  四元: ['四元', 'atkP:5,spaP:5,critDmg:10'], 元素王: ['符王', 'actUp:25,spaP:5'], 萬象歸一: ['萬象歸一', 'actUp:20,spcUp:25'],
};
const BR_RENAME = { mage: { 0: ['咒爆', '爆發與會心。'], 1: ['蒼雷', '速度與麻痺。'] }, bard: { 2: ['舞步', '普攻、迴避與特技。'] }, otherworlder: { 1: ['越界', '弱點與奇招。'] }, spellblade: { 2: ['四象', '符印強化攻守。'] } };
for (const c in SIG_BR) { const T = T9[c]; if (!T) continue; const R = BR_RENAME[c] || {};
  T.br = T.br.map(([n, d, tiers], i) => { const rn = R[i]; return [rn ? rn[0] : n, rn ? rn[1] : d, tiers.map(pair => pair.map(([on, fx]) => OPT_FIX[on] ? OPT_FIX[on] : [on, fx]))]; });
  T.pitch = CLASSES[c].n + '：' + T.br.map(b => b[0]).join('／') + '。'; }
for (const c in T9) { T9C[c] = T9[c].br.map(([n, d, tiers], b) => ({ n, d, tiers: tiers.map((pair, t) => pair.map(([on, fx], o) => ({ n: on, fx: parseFx9(fx), b, t, o }))) }));
  if (CLASS_V7[c]) { CLASS_V7[c].pitch = T9[c].pitch; T9[c].br.forEach(([n, d], b) => { if (CLASS_V7[c].br[b]) { CLASS_V7[c].br[b][0] = n; CLASS_V7[c].br[b][1] = d; } }); } }
// the signature skill's own tree (branch 3 in the save)
const SIG_B = 3, SIGC = {};
for (const c in SIG_BR) { const [n, d, tiers] = SIG_BR[c]; SIGC[c] = { n, d, tiers: tiers.map((pair, t) => pair.map(([on, fx], o) => ({ n: on, fx: parseFx9(fx), b: SIG_B, t, o }))) }; }
tcPicked = function (st = Game.st) { const T = T9C[st.cls]; if (!T || !st.cls) return []; const P = tcOf(st), S = SIGC[clsV7(st.cls)], out = [];
  for (const k in P) { const [b, t] = k.split('.').map(Number); const B = b === SIG_B ? S : T[b], O = B && B.tiers[t] && B.tiers[t][P[k]]; if (O) out.push(O); } return out; };
tpSpent = function (st = Game.st) { if (!st || !st.cls || !T9C[st.cls]) return 0; let s = 0; for (let b = 0; b <= SIG_B; b++) s += brPts9(b, st); return s; };
tcFitCap = function (st = Game.st) { if (!st || !st.cls || !T9C[st.cls]) return 0; let n = 0;
  while (tpSpent(st) > tpTotal(st)) { let bb = -1, bt = -1; for (let b = 0; b <= SIG_B; b++) for (let t = 4; t >= 0; t--) if (tcHas(b, t, st)) { if (t > bt) { bt = t; bb = b; } break; } if (bb < 0) break; delete tcOf(st)[bb + '.' + bt]; n++; }
  return n; };
// saves from v10.1–v10.4.1: branch 0 was the signature, 1 and 2 were KEEP_BR → move them to 3 and their own index
function tcMigrateV104(st) { if (!st || st.talV104) return; st.talV104 = 1; const A = st.tcAll || {};
  for (const cls in A) { const K = KEEP_BR[clsV7(cls)] || KEEP_BR[cls]; if (!K) continue; const P = A[cls], N = {};
    for (const k in P) { const [b, t] = k.split('.').map(Number); const nb = b === 0 ? SIG_B : K[b - 1]; if (nb !== undefined) N[nb + '.' + t] = P[k]; } A[cls] = N; } }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) st.talV104 = 1; return st; }; }
{ const _so = startOverworld; startOverworld = function (...a) { tcMigrateV104(Game.st); return _so.apply(this, a); }; }
// resonance: the three branches keep theirs (fire / bolt / borrow keys replaced); the signature tree (index 3) adds power
{ const FIX = { fireUp: ['magCrit', 3], boltUp: ['speP', 3], subUp: ['atkUp', 8], elem: ['spaP', 3] };
  for (const c in RESONANCE) { const old = RESONANCE[c]; RESONANCE[c] = [...old.slice(0, 3).map(r => r.map(([k, v]) => FIX[k] ? FIX[k] : [k, v])), [['sigPow', 5], ['sigPow', 5], ['sigPow', 10]]]; } }
SHORT.sigPow = '招式威力'; // the resonance line read 「sigPow+5%」
if (typeof V9_SUM_KEYS !== 'undefined') for (const k of ['sigPow', 'sigMp', 'sigCrit', 'sigHit', 'sigSpec', 'sigShield', 'sigHeal', 'sigDrain', 'sigMpBack', 'sigTwice', 'sigWeak', 'sigVsSt', 'sigFdef', 'sigFatk', 'sigCure']) V9_SUM_KEYS.add(k);
const ST_NM = { brn: '灼傷', psn: '中毒', par: '麻痺', slp: '睡眠' }, BUFF_NM = { atk: '物攻', spa: '魔攻', def: '物防', spd: '魔防', spe: '速度' };
Object.assign(TK_TXT, { // the signature page shows these; short on purpose (player: 「玩家玩遊戲不是來看規則的」)
  sigPow: v => '威力+' + v + '%', sigMp: v => 'MP-' + v, sigCrit: v => '會心率+' + v + '%', sigHit: v => '攻擊+' + v + '次',
  sigSpec: v => '特技+' + v + '層', sigShield: v => '護盾' + v + '回合', sigHeal: v => '回復' + v + '%HP', sigDrain: v => '吸血' + v + '%',
  sigMpBack: v => '回復' + v + 'MP', sigTwice: v => v + '%機率再發動', sigWeak: v => '打弱點+' + v + '%', sigVsSt: v => '對異常+' + v + '%',
  sigFdef: () => '降低物防', sigFatk: () => '降低物攻', sigCure: () => '消除異常',
});
{ const _td = tDesc; tDesc = function (key, v) { if (key.startsWith('sigSt.')) return v + '%' + ST_NM[key.slice(6)]; if (key.startsWith('sigBuff.')) return BUFF_NM[key.slice(8)] + '+' + v; return _td(key, v); }; }
const tsum = (k, st = Game.st) => typeof talentSum === 'function' ? talentSum(k, st) : 0;
// talent keys summed by prefix (sigSt.brn, sigBuff.atk …)
function tsumPre(pre, st = Game.st) { const out = {}; if (!st || !st.cls) return out; for (const O of tcPicked(st)) for (const [k, v] of O.fx) if (k.startsWith(pre)) out[k.slice(pre.length)] = (out[k.slice(pre.length)] || 0) + v; return out; }
function sigMod(o, st = Game.st) {
  const p = tsum('sigPow', st), h = tsum('sigHit', st), c = tsum('sigCrit', st);
  if (p && o.pow) o.pow = Math.round(o.pow * (1 + p / 100)); if (h && o.hits) o.hits = Array.isArray(o.hits) ? o.hits.map(n => n + h) : o.hits + h;
  if (c) o.sigCrit = c; if (tsum('sigWeak', st)) o.sigWeak = tsum('sigWeak', st); if (tsum('sigVsSt', st)) o.sigVsSt = tsum('sigVsSt', st);
}
function sigTalentText(st = Game.st) { const L = []; for (const O of tcPicked(st)) if (O.b === SIG_B) L.push(O.n); return L.length ? '　【強化】' + L.join('・') : ''; }
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
// the signature tree's icon (Codex task T); the three branches use their own icons again
const TALENT_SIG_PX = {}; for (const c in (typeof TALENT_SIG_ROWS !== 'undefined' ? TALENT_SIG_ROWS : {})) { const [cols, rows] = TALENT_SIG_ROWS[c], pal = {}; cols.forEach((h, i) => pal['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = h); TALENT_SIG_PX[c] = spriteFrom(rows, pal); }

/* ---------- v10.4.2 the signature skill's own page (選單→技能→★), bought with talent points ---------- */
function* sigScreen() {
  const st = Game.st, c = clsV7(st.cls), S = SIGC[c], id = sigId(st); if (!S || !id) { Sound.sfx('bump'); return; }
  let row = 0, col = 0, msg = '', msgT = 0; const ccol = classColOf(st.cls), RN = ['一', '二', '三', '四', '五'], fresh = new Set(), B = SIG_B;
  const RY = t => 56 + t * 22 + (t >= 3 ? 8 : 0), OX = o => 28 + o * 73, OW = 71, P = () => tcOf(st);
  const act = () => { const O = S.tiers[row][col], key = B + '.' + row;
    if (tcHas(B, row, st)) { if (P()[key] === col) { msg = '已經選了「' + O.n + '」'; msgT = 40; Sound.sfx('bump'); return; } if (!fresh.has(key)) { msg = '要改需要「遺忘之書」'; msgT = 60; Sound.sfx('bump'); return; } P()[key] = col; Sound.sfx('select'); msg = '換成「' + O.n + '」'; msgT = 50; return; }
    const blk = tierBlock9(B, row, st); if (blk) { Sound.sfx('bump'); msg = blk; msgT = 60; return; }
    P()[key] = col; fresh.add(key); clampHP(); Sound.sfx('statUp'); msg = '學會「' + O.n + '」！'; msgT = 60; };
  const refund = () => { const blk = tierRefundBlock9(B, row, st) || (fresh.has(B + '.' + row) ? null : '要改需要「遺忘之書」'); if (blk) { Sound.sfx('bump'); msg = blk; msgT = 60; return; }
    fresh.delete(B + '.' + row); delete P()[B + '.' + row]; clampHP(); Sound.sfx('cancel'); msg = '退回' + tierCost9(row) + '點'; msgT = 40; };
  const scr = { draw(x) {
    const TR = typeof touchRegion === 'function', m = skillMove(id, st);
    screenBG(x); headerBar(x, '職業招式'); const av = tpAvail(st); Font.drawR(x, '天賦點 ' + av, W - 6, 2, av ? UIC.warm : UIC.muted, UIC.textSh);
    drawWin(x, 4, 22, 168, 28, 'menu'); const ic = TALENT_SIG_PX[c]; if (ic) x.drawImage(ic, 10, 30);
    Font.draw(x, m.n, 26, 24, '#ffd860', UIC.textSh, 11); Font.drawR(x, (m.pow ? '威力' + m.pow + '　' : '') + 'MP' + skillMP(id, st), 166, 26, UIC.muted, UIC.textSh, 8);
    drawFitText(x, SIG[c].d, 26, 37, 140, 11, 8, UIC.text);
    if (!deepOk(st)) Font.drawR(x, '深層（天賦覺醒後開放）', 172, RY(3) - 12, UIC.dis, UIC.textSh, 7);
    x.fillStyle = deepOk(st) ? 'rgba(255,200,100,0.35)' : 'rgba(120,120,150,0.35)'; x.fillRect(4, RY(3) - 3, 168, 1);
    for (let t = 0; t < 5; t++) { const Y = RY(t), has = tcHas(B, t, st), pick = P()[B + '.' + t], blk = tierBlock9(B, t, st), locked = !has && blk && !blk.startsWith('天賦點不足');
      Font.drawC(x, RN[t], 13, Y - 1, locked ? UIC.dis : has ? UIC.warm : UIC.text, UIC.textSh, 10); Font.drawC(x, tierCost9(t) + '點', 13, Y + 10, UIC.muted, UIC.textSh, 7);
      for (let o = 0; o < 2; o++) { const O = S.tiers[t][o], X = OX(o), chosen = has && pick === o, on = row === t && col === o;
        drawBtn(x, X, Y, OW, 20, on, chosen ? ccol : null); if (chosen) { const [cr, cg, cb] = hex2rgb(ccol); x.fillStyle = `rgba(${cr},${cg},${cb},0.3)`; x.fillRect(X + 1, Y + 1, OW - 2, 18); }
        Font.drawC(x, O.n, X + OW / 2, Y, locked ? UIC.dis : chosen ? '#ffffff' : has ? UIC.muted : '#c9cfe4', UIC.textSh, 9);
        drawFitText(x, optDesc9(O), X + 4, Y + 10, OW - 8, 9, 7, locked ? UIC.dis : chosen ? '#ffffff' : UIC.muted, true);
        if (TR) touchRegion(X, Y, OW, 20, () => { if (row === t && col === o) tapKey('a'); else { row = t; col = o; Sound.sfx('cursor'); } }); } }
    const DY = 184; drawWin(x, 4, DY, 168, 68, 'menu'); const O = S.tiers[row][col], has = tcHas(B, row, st), chosen = has && P()[B + '.' + row] === col, blk = tierBlock9(B, row, st), fr = fresh.has(B + '.' + row);
    Font.draw(x, O.n, 12, DY + 2, shade(ccol, 0.35), UIC.textSh, 11); Font.drawR(x, '第' + RN[row] + '層　' + tierCost9(row) + '點', 164, DY + 4, UIC.muted, UIC.textSh, 8);
    Font.draw(x, optDesc9(O), 12, DY + 17, chosen ? UIC.accent : UIC.text, UIC.textSh, 10);
    const bp = brPts9(B, st), R3 = RESONANCE[st.cls] && RESONANCE[st.cls][B], got = RES_AT.filter(q => bp >= q).length; if (R3) Font.draw(x, '共鳴 ' + got + '/3' + (got < 3 ? '　' + RES_AT[got] + '點：威力+' + R3[got][1] + '%' : ''), 12, DY + 30, '#ffd860', UIC.textSh, 8);
    Font.draw(x, msgT > 0 ? msg : chosen ? (fr ? '選擇中（離開前還能改）' : '已學會') : has ? (fr ? 'A：換成這個' : '要改需要遺忘之書') : blk || 'A：學會（' + tierCost9(row) + '點）', 12, DY + 41, msgT > 0 ? UIC.warm : blk && !has ? UIC.bad : UIC.good, UIC.textSh, 9);
    drawBtn(x, 12, DY + 53, 60, 13, false); Font.drawC(x, '↩退回此層', 42, DY + 52, fr && !tierRefundBlock9(B, row, st) ? UIC.warm : UIC.dis, UIC.textSh, 8);
    if (TR) touchRegion(12, DY + 53, 60, 13, () => tapKey('select')); if (msgT > 0) msgT--;
  }, touchBack: true };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left') || Input.repeat('right')) { col = 1 - col; Sound.sfx('cursor'); }
    if (Input.repeat('up')) { row = (row + 4) % 5; Sound.sfx('cursor'); } if (Input.repeat('down')) { row = (row + 1) % 5; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) { Input.consume('a'); act(); }
    if (Input.pressed('select')) { Input.consume('select'); refund(); }
    yield;
  }
  UI.remove(scr);
}
