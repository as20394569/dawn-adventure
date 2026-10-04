/* ===================== v12.0.9b 第九輪（二）：屬性門檻・四個新能力值・狀態頁（〈第九輪提案〉第二步 G～H，玩家 2026-10-04「開始動工吧」） =====================
   G 屬性（含果實）到 15／25／35 各解鎖一個小被動。會心傷害（幸運）、異常命中（靈巧）、異常抗性・回復量（體力）。
   H 狀態頁 4 頁：冒險者資料（屬性與門檻）／戰鬥數值 16 項（選一項看怎麼算）／生效中的效果（寫出來源）／技能一覽。 */
const ATTR_TH9 = {
  str: ['物理會心傷害 +10%', '物理攻擊無視 10% 物防', '物理會心傷害再 +20%'],
  agi: ['第一回合迴避 +10%', '比目標快時傷害 +8%', '每場第一次被攻擊必定閃避'],
  vit: ['受到的會心傷害 −10%', '回合結束回復 2% HP', '受到的傷害 −6%'],
  int: ['技能 MP −5%', '魔法會心傷害 +15%', '回合結束回復 2% MP'],
  dex: ['特技傷害 +15%', '普攻累積特技時 25% 多 +1', '特技所需層數 −1'],
  luk: ['戰鬥掉素材的機率 +10%', '每場第一次會心傷害 +30%', '每場 1 次致命傷害時 50% 撐住'],
};
const TH9 = [15, 25, 35];
const thTier9 = v => v >= 35 ? 3 : v >= 25 ? 2 : v >= 15 ? 1 : 0;
const over10 = v => Math.max(0, v - 10);
// attribute → the new stats, thresholds → passives
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (!st) return s; const a = heroAttr(st);
    s.critDmg = (s.critDmg || 0) + over10(a.luk); s.stHit = (s.stHit || 0) + over10(a.dex); s.stRes = (s.stRes || 0) + 0.5 * over10(a.vit); s.healUp = (s.healUp || 0) + 0.5 * over10(a.vit);
    const T = {}; for (const k in ATTR_TH9) { T[k] = thTier9(a[k] || 0); if (T[k]) s['th9' + k] = T[k]; } s.th9 = T;
    if (T.int >= 3) s.mpRegen = (s.mpRegen || 0) + 2; if (T.dex >= 1) s.spcUp = (s.spcUp || 0) + 15;
    return s; }; }
Object.assign(COND, { srcFaster9: (c, v) => !!c.src && !!c.tgt && (BR.speed(c.core, c.src) > BR.speed(c.core, c.tgt)) === !!v });
const TH9_DODGE = { on: EVT.DAMAGE, phase: 'PRE', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1 }, layer: 'prevent', limit: { perBattle: 1 }, effects: [{ type: 'cancel', why: 'agi35' }, { type: 'message', key: 'agi35', target: 'self' }] };
PV('th9str', v => ({ mods: [{ stage: 'talent', who: 'attacker', critDmg: 10 + (v >= 3 ? 20 : 0), cond: { cat: '物' } }, ...(v >= 2 ? [{ stage: 'attacker', who: 'attacker', defMul: 0.9, cond: { cat: '物' } }] : [])] }), { n: '力量門檻' });
PV('th9agi', v => ({ mods: [{ stage: 'defender', who: 'defender', accAdd: -10, cond: { round: 1 } }, ...(v >= 2 ? [{ stage: 'talent', who: 'attacker', mul: 1.08, cond: { srcFaster9: 1, hasPower: 1 } }] : [])], triggers: v >= 3 ? [TH9_DODGE] : [] }), { n: '敏捷門檻' });
PV('th9vit', v => ({ mods: [{ stage: 'defender', who: 'defender', critTaken: 0.9 }, ...(v >= 3 ? [{ stage: 'defender', who: 'defender', mul: 0.94, cond: { hasPower: 1 } }] : [])],
  triggers: v >= 2 ? [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'heal', target: 'self', pct: 0.02, kind: 'regen', quiet: 1 }] }] : [] }), { n: '體力門檻' });
PV('th9int', v => ({ mods: [{ stage: 'skill', costMul: 0.95, res: 'mp' }, ...(v >= 2 ? [{ stage: 'talent', who: 'attacker', critDmg: 15, cond: { cat: '特' } }] : [])] }), { n: '智力門檻' });
PV('th9dex', v => ({ rules: v >= 3 ? { chargeCut: 1 } : {}, triggers: v >= 2 ? [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { tag: 'basic', hpLost: 1 }, chance: 0.25, limit: { perAction: 1 }, effects: [{ type: 'resource', target: 'self', res: 'wc', amount: 1, why: 'dex25' }] }] : [] }), { n: '靈巧門檻' });
PV('th9luk', v => ({ triggers: [...(v >= 2 ? [{ on: EVT.DAMAGE, phase: 'PRE', role: 'src', cond: { crit: 1, hasPower: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'modify', mul: 1.3, note: 'luk25' }] }] : []),
  ...(v >= 3 ? [{ on: EVT.DOWN, phase: 'PRE', role: 'tgt', layer: 'prevent', whenDown: 1, onceGroup: 'endure', chance: 0.5, cond: {}, effects: [{ type: 'prevent_down', hp: 1, key: 'endure' }] }] : [])] }), { n: '幸運門檻' });
Object.assign(BV_TEXT, { agi35: s => s + '輕巧地閃開了攻擊！' });
// 幸運 15: a dropped material now and then
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const r = yield* _v.call(this); const st = Game.st;
    if (((heroStats().th9 || {}).luk || 0) >= 1) for (const v of this.defeated ? this.defeated() : []) { const sp = SPECIES[v.sp] || {}; if (sp.mat && ITEMS[sp.mat] && !v.elite && !v.boss && chance(0.1)) { st.bag[sp.mat] = (st.bag[sp.mat] || 0) + 1; yield* this.msg('（幸運）多撿到了' + ITEMS[sp.mat].n + '！'); } }
    return r; }; }
// 回復量 also works on potions (in battle and in the menu)
{ const H = EFFECT_TYPES.heal.exec; EFFECT_TYPES.heal.exec = function (core, ef, ctx, tg) {
    if (ef.amount != null && ef.ofCast == null && ef.ofEvent == null && ctx.owner && ctx.owner.hero) { let m = 1; for (const md of ctx.owner.mods || []) if (md.healMul && condOk(md.cond, { core, owner: ctx.owner, src: ctx.owner, skill: ctx.skill || null })) m *= md.healMul;
      if (m !== 1) return H.call(this, core, { ...ef, amount: Math.round(ef.amount * m) }, ctx, tg); }
    return H.call(this, core, ef, ctx, tg); }; }
{ const _ui = useItem; useItem = function (k) { const it = ITEMS[k];
    if (it && it.use === 'heal' && canUseItem(k)) { const st = Game.st, s = heroStats(), m = 1 + (s.healUp || 0) / 100; st.bag[k]--; const b = st.hp; st.hp = Math.min(s.hp, st.hp + Math.round(it.v * m)); return st.name + '的HP恢復了' + (st.hp - b) + '點！'; }
    return _ui(k); }; }

/* ---------- H. the status pages ---------- */
const gearSp9 = (st, k) => { let v = 0; for (const g of equippedGear(st)) { const p = gearStats(g).sp; v += p[k] || 0; for (const a of g.a || []) if (typeof FA9 !== 'undefined' && FA9[a[0]] && FA9[a[0]][1] === k) v += a[1]; } return v; };
const fmt9 = v => (Math.round(v * 10) / 10).toString();
function stats9(st = Game.st) { const s = heroStats(st);
  return [['HP', st.hp + '/' + s.hp, 'hp'], ['MP', (st.mp ?? s.mp) + '/' + s.mp, 'mp'], ['物攻', s.atk, 'atk'], ['物防', s.def, 'def'], ['魔攻', s.spa, 'spa'], ['魔防', s.spd, 'spd'], ['速度', s.spe, 'spe'], ['會心率', fmt9(s.crit) + '%', 'crit'],
    ['會心傷害', Math.round(150 * (1 + (s.critDmg || 0) / 100)) + '%', 'critDmg'], ['命中', '+' + fmt9(s.hit) + '%', 'hit'], ['迴避', fmt9(s.eva) + '%', 'eva'], ['吸血', Math.min(20, s.drain || 0) + '%', 'drain'],
    ['屬性傷害', '+' + (s.elem || 0) + '%', 'elem'], ['異常命中', '+' + fmt9(s.stHit || 0) + '%', 'stHit'], ['異常抗性', fmt9(Math.min(80, s.stRes || 0)) + '%', 'stRes'], ['回復量', '+' + fmt9(s.healUp || 0) + '%', 'healUp']]; }
function statFormula9(key, st = Game.st) { const s = heroStats(st), a = heroAttr(st), L = st.lv, eq = eqBonus(st), rest = (tot, ...parts) => tot - parts.reduce((x, y) => x + y, 0), A = s.arm9 || {};
  const line = (base, e, other, extra = []) => [base, ...(e ? ['＋裝備 ' + fmt9(e)] : []), ...(Math.abs(other) >= 0.05 ? ['＋職業・天賦・武器等 ' + fmt9(other)] : []), ...extra];
  const B = { hp: Math.floor(6 + L * 1.8 + a.vit * 1.6), mp: Math.floor(8 + L * 1 + a.int * 1.5), atk: Math.floor(a.str + a.dex / 2), def: Math.floor(a.vit * 1.5 + a.agi * 0.5), spa: Math.floor(a.int * 1.2 + a.dex / 3), spd: Math.floor((a.int + a.vit) * 0.8), spe: Math.floor(a.agi * 1.5) };
  const F = { hp: '6＋等級×1.8＋體力×1.6', mp: '8＋等級×1＋智力×1.5', atk: '力量＋靈巧÷2', def: '體力×1.5＋敏捷×0.5', spa: '智力×1.2＋靈巧÷3', spd: '（智力＋體力）×0.8', spe: '敏捷×1.5' };
  if (B[key] != null) { const tot = key === 'hp' || key === 'mp' ? s[key] : s[key]; const e = eq[key] || 0;
    return line(F[key] + '＝' + B[key], e, rest(tot, B[key], e), key === 'spe' && A.重甲 ? ['（已算進重甲 ' + A.重甲 + ' 件：速度 −' + 3 * A.重甲 + '%）'] : []).concat(key === 'spe' && A.輕裝 ? ['輕裝 ' + A.輕裝 + ' 件：第一回合速度 +' + 10 * A.輕裝 + '%'] : []); }
  if (key === 'crit') { const b = 3 + a.luk * 0.6, e = gearSp9(st, 'crit'); return line('3＋幸運×0.6＝' + fmt9(b), e, rest(s.crit, b, e), ['會心時傷害 ×' + (1.5 * (1 + (s.critDmg || 0) / 100)).toFixed(2)]); }
  if (key === 'critDmg') { const b = over10(a.luk), e = gearSp9(st, 'critDmg'), T = s.th9 || {};
    return ['基礎 150%×（1＋加成）', '幸運超過 10 的部分每點 +1 → ' + b, ...(e ? ['＋裝備 ' + e] : []), ...(Math.abs(rest(s.critDmg || 0, b, e)) >= 0.05 ? ['＋職業・天賦・武器等 ' + fmt9(rest(s.critDmg || 0, b, e))] : []), ...(T.str ? ['（力量門檻：物理再 +' + (T.str >= 3 ? 30 : 10) + '）'] : []), ...(T.int >= 2 ? ['（智力門檻：魔法再 +15）'] : [])]; }
  if (key === 'hit') { const b = a.dex * 0.5, e = gearSp9(st, 'hit'); return line('靈巧×0.5＝' + fmt9(b), e, rest(s.hit, b, e), ['命中率＝招式命中＋這個數字−對手迴避']); }
  if (key === 'eva') { const b = a.agi * 0.4 + a.luk * 0.1, e = gearSp9(st, 'eva'), l = 2 * (A.輕裝 || 0); return line('敏捷×0.4＋幸運×0.1＝' + fmt9(b), e, rest(s.eva, b, e, l), l ? ['＋輕裝 ' + A.輕裝 + ' 件 ' + l] : []); }
  if (key === 'drain') { const e = gearSp9(st, 'drain'); return line('造成傷害的這個比例回復 HP（上限 20%）', e, rest(s.drain || 0, e)); }
  if (key === 'elem') { const e = gearSp9(st, 'elem'); return line('火、水、雷、草、毒、岩屬性的傷害提高', e, rest(s.elem || 0, e)); }
  if (key === 'stHit') { const b = over10(a.dex), e = gearSp9(st, 'stHit'); return line('靈巧超過 10 的部分每點 +1 → ' + b, e, rest(s.stHit || 0, b, e), ['讓魔物陷入異常、能力下降的機率 ×（1＋這個%）']); }
  if (key === 'stRes') { const b = 0.5 * over10(a.vit), e = gearSp9(st, 'stRes'); return line('體力超過 10 的部分每點 +0.5 → ' + fmt9(b), e, rest(s.stRes || 0, b, e), ['被施加異常狀態時擋下的機率（上限 80%）']); }
  if (key === 'healUp') { const b = 0.5 * over10(a.vit), e = gearSp9(st, 'healUp'); return line('體力超過 10 的部分每點 +0.5 → ' + fmt9(b), e, rest(s.healUp || 0, b, e), ['回復技能、再生、藥水的回復量']); }
  return []; }
function activeLines9(st = Game.st) { const s = heroStats(st), L = [], H = t => L.push([t, UIC.accent, 10, 0]), P = (t, c = UIC.text, ind = 6) => { for (const l of Font.wrap(t, 156 - ind, 10)) L.push([l, c, 10, ind]); };
  { const k = typeof mainKind11 === 'function' ? mainKind11(st) : null, dm = typeof dualMode11 === 'function' ? dualMode11(st) : null; if (k || dm) H('【主武器】' + (k || '') + (dm ? '（' + dm + '）' : '')); } // 職業退場（v262）
  if (typeof COMMON11 !== 'undefined') { const L2 = []; for (const k of COMMON11) for (const [id, n, max, , d] of TREE11[k].nodes) { const v = trLv11('cm:' + id, st); if (v) L2.push(n + (max > 1 ? ' Lv' + v : '') + '：' + d); } if (L2.length) { H('【共通技能樹】'); L2.forEach(t => P(t)); } }
  const th = s.th9 || {}, thL = []; for (const k in ATTR_TH9) for (let i = 0; i < (th[k] || 0); i++) thL.push(ATTR_NAMES[k] + TH9[i] + '：' + ATTR_TH9[k][i]); if (thL.length) { H('【屬性門檻】'); thL.forEach(t => P(t)); }
  const A = s.arm9 || {}; if (A.重甲 || A.輕裝 || A.法衣) { H('【防具三系】'); for (const t of ['重甲', '輕裝', '法衣']) if (A[t]) P(t + ' ' + A[t] + ' 件：' + ARM9_RULE[t] + '（每件）'); }
  const fx = []; for (const g of equippedGear(st)) { for (const f of gearFx(g)) if (SPECIALS[f]) fx.push(SPECIALS[f].n + '：' + (SPECIALS[f].d || '').replace(/。$/, '') + '（' + GEAR[g.b].n + '）');
    for (const a of g.a || []) if (typeof FA9 !== 'undefined' && FA9[a[0]]) fx.push(faText9(a[0], a[1]) + '（' + GEAR[g.b].n + '）'); }
  const wg = gearBy(st.equip && st.equip.weapon, st), W = wg && typeof WSK !== 'undefined' && WSK[wg.b]; if (W && W.p) fx.unshift(W.p.n + '：' + wpassText(W.p) + '（' + GEAR[wg.b].n + '）');
  if (fx.length) { H('【裝備的效果】'); fx.forEach(t => P(t)); }
  if (!L.length) P('目前沒有生效中的效果。', UIC.muted);
  return L; }
summaryScreen = function* () {
  let page = 0, mi = 0, si = 0, top = 0; const NP = 4, TITLES = ['冒險者資料', '戰鬥數值', '生效中的效果', '技能一覽'];
  const skillList = st => (st.cls && typeof classPassiveNode === 'function' ? ['_passive'] : []).concat(typeof summarySkills === 'function' ? summarySkills(st) : learnedSkills(st));
  let AL = null;
  const scr = { draw(x) {
    const st = Game.st, s = heroStats(); screenBG(x);
    headerBar(x, TITLES[page]); if (page === 3) Font.draw(x, 'MP ' + (st.mp ?? s.mp) + '/' + s.mp, 66, 5, UIC.blue || UIC.accent, UIC.textSh, 8);
    Font.drawR(x, '← ' + (page + 1) + '/' + NP + ' →', W - 6, 2, UIC.muted, UIC.textSh);
    if (page === 0) { heroCard(x, st); const a = heroAttr(st), th = s.th9 || {};
      drawWin(x, 4, 98, 168, 62, 'menu');
      ATTRS.forEach((k, i) => { const X = 12 + (i % 2) * 80, Y = 103 + Math.floor(i / 2) * 17, t = th[k] || 0; Font.draw(x, ATTR_NAMES[k], X, Y, UIC.muted, UIC.textSh);
        Font.drawR(x, String(a[k]), X + 46, Y, (st.boost || {})[k] ? UIC.accent : UIC.text, UIC.textSh); Font.draw(x, t >= 3 ? '滿' : '→' + TH9[t], X + 49, Y + 2, t >= 3 ? UIC.warm : UIC.muted, UIC.textSh, 9); });
      drawWin(x, 4, 162, 168, 90, 'menu'); Font.draw(x, '屬性門檻（15／25／35）', 10, 165, UIC.accent, UIC.textSh, 9);
      ATTRS.forEach((k, i) => { const t = th[k] || 0, Y = 178 + i * 12; Font.draw(x, ATTR_NAMES[k], 10, Y, UIC.muted, UIC.textSh, 9);
        for (let j = 0; j < 3; j++) { x.fillStyle = j < t ? UIC.warm : '#3a4060'; x.fillRect(36 + j * 7, Y + 3, 5, 5); }
        const nx = t >= 3 ? '三個都解鎖了' : TH9[t] + '：' + ATTR_TH9[k][t]; let z = 9; while (z > 7 && Font.width(nx, z) > 110) z--; Font.draw(x, nx, 60, Y + (9 - z) / 2, t >= 3 ? UIC.warm : UIC.text, UIC.textSh, z); }); }
    else if (page === 1) { const S = stats9(st); drawWin(x, 4, 24, 168, 132, 'menu');
      S.forEach(([n, v], i) => { const X = 8 + (i % 2) * 82, Y = 28 + Math.floor(i / 2) * 15.5; if (i === si) selBar(x, X - 2, Y - 1, 80, 14); let z = 10; while (z > 8 && Font.width(n, z) + Font.width(String(v), z) > 74) z--;
        Font.draw(x, n, X, Y + (10 - z) / 2, UIC.muted, UIC.textSh, z); Font.drawR(x, String(v), X + 76, Y + (10 - z) / 2, UIC.text, UIC.textSh, z); });
      drawWin(x, 4, 160, 168, 92, 'menu'); Font.draw(x, S[si][0] + '：怎麼算的', 10, 163, UIC.accent, UIC.textSh, 10);
      const FL = statFormula9(S[si][2], st); let y = 178; for (const t of FL) for (const l of Font.wrap(t, 152, 9)) { if (y > 240) break; Font.draw(x, l, 12, y, UIC.text, UIC.textSh, 9); y += 12; }
      Font.drawR(x, '↑↓ 選擇', 166, 241, UIC.muted, UIC.textSh, 8); }
    else if (page === 2) { if (!AL) AL = activeLines9(st); drawWin(x, 4, 22, 168, 230, 'menu'); const end = drawInfoLines(x, AL, 10, 28, 236, top); scr.more = end < AL.length;
      if (top > 0) x.drawImage(UPARROW, 86, 23); if (scr.more) x.drawImage(DOWNARROW, 86, 237); }
    else { const SK = skillList(st), VIS = 7; drawWin(x, 4, 24, 168, VIS * 19 + 8, 'menu'); const t0 = clamp(mi - 3, 0, Math.max(0, SK.length - VIS));
      if (!SK.length) Font.draw(x, '還沒有學會技能。（選單→技能）', 12, 30, UIC.muted, UIC.textSh, 11);
      SK.slice(t0, t0 + VIS).forEach((id, k) => { const i = t0 + k, mv = MOVES[id], Y = 28 + k * 19; if (i === mi) selBar(x, 6, Y, 164, 17);
        if (id === '_passive') { x.fillStyle = shade(UIC.warm, -0.45); x.fillRect(14, Y + 2, 30, 13); Font.drawC(x, '被動', 29, midY(Y + 2, 13, 9), '#ffffff', UIC.textSh, 9); Font.draw(x, '職業・武器被動', 52, Y + 1, UIC.warm, UIC.textSh, 10); return; }
        const sig = !!(mv && mv.sig), e = typeof BB !== 'undefined' ? BB.skillObj(st, id) : null, tag = sig ? '招式' : e && !e.learned ? '學習' : '技能', col = sig ? '#c8a050' : e && !e.learned ? '#8a7cff' : UIC.accent;
        x.fillStyle = shade(col, -0.45); x.fillRect(14, Y + 2, 30, 13); Font.drawC(x, tag, 29, midY(Y + 2, 13, 9), '#ffffff', UIC.textSh, 9);
        const nm = typeof BB !== 'undefined' ? BB.nameOf(st, id) : mv.n, rt = BB.costLabel(st, id);
        let z = 10; while (z > 8 && Font.width(nm, z) > 150 - 56 - Font.width(rt, 9)) z--; Font.draw(x, nm, 52, Y + 1 + (10 - z) / 2, UIC.text, UIC.textSh, z); Font.drawR(x, rt, 164, Y + 2, sig ? '#ffd860' : UIC.accent, UIC.textSh, 9); });
      if (t0 > 0) x.drawImage(UPARROW, 86, 25); if (t0 + VIS < SK.length) x.drawImage(DOWNARROW, 86, 24 + VIS * 19 + 3);
      if (SK[Math.min(mi, SK.length - 1)] === '_passive') { drawWin(x, 4, 168, 168, 84, 'menu'); drawPassiveInfo(x, st, 12, 171, 152, true); }
      else if (SK.length) { const id = SK[Math.min(mi, SK.length - 1)]; drawWin(x, 4, 168, 168, 84, 'menu'); drawFitText(x, typeof BB !== 'undefined' && BB.skillInfo ? BB.skillInfo(st, id) : (MOVES[id].d || ''), 12, 172, 152, 76, 10); } }
  } };
  UI.push(scr); Input.clearAll();
  while (true) {
    if (Input.pressed('left')) { page = (page + NP - 1) % NP; top = 0; Sound.sfx('cursor'); } if (Input.pressed('right')) { page = (page + 1) % NP; top = 0; Sound.sfx('cursor'); }
    if (page === 1) { if (Input.repeat('up')) { si = (si + 15) % 16; Sound.sfx('cursor'); } if (Input.repeat('down')) { si = (si + 1) % 16; Sound.sfx('cursor'); } }
    if (page === 2) { if (Input.repeat('up') && top > 0) { top--; Sound.sfx('cursor'); } if (Input.repeat('down') && scr.more) { top++; Sound.sfx('cursor'); } }
    if (page === 3) { const n = Math.max(1, skillList(Game.st).length); if (Input.repeat('up')) { mi = (mi + n - 1) % n; Sound.sfx('cursor'); } if (Input.repeat('down')) { mi = (mi + 1) % n; Sound.sfx('cursor'); } }
    if (Input.pressed('a') && (page === 0 || page === 2)) { Input.consume('a'); page = (page + 1) % NP; top = 0; Sound.sfx('cursor'); }
    else if (Input.pressed('b')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield; }
  UI.remove(scr); };
GROW12.push(['屬性門檻', '屬性（含果實）到 15、25、35 時各解鎖一個小效果，例如力量 15 物理會心傷害 +10%。幸運管會心傷害，靈巧管異常命中，體力管異常抗性和回復量。在「狀態」第 1、2 頁看得到。']);
