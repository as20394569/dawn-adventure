/* ===================== v12.0.1 進階職業（玩家：「14等的轉職怎麼沒有東西 玩家反應沒有轉職」→ 選了「基礎職業 Lv14 進階」） =====================
   The opening promised 「Lv14之後可以找村長轉職」, but at Lv14 the elder only did 天賦覺醒 and offered the other three basic classes.
   Now 天賦覺醒 (Lv14, the elder) also advances the four basic classes — 劍士→劍聖, 魔導士→大魔導士, 守護者→聖騎士, 遊俠→神射手
   (one path each, names approved by the player). After that every basic class the hero switches to is the advanced one.
   Each advancement (approved: signature skill, core resource +1, an advanced passive):
     劍聖     武者一閃 威力 +20%、會心命中時回 1 劍意 · 劍意上限 5→6 · 「劍聖」會心傷害 +20%
     大魔導士 元素奔流 威力 +20%、不消耗 MP     · 咒印上限 3→4 · 「大魔導士」元素爆發的倍率 +0.3
     聖騎士   聖盾衝擊 威力 +20%、之後回復 10% HP · 守勢上限 5→6 · 「聖騎士」護盾中受到的傷害 −15%
     神射手   影牙連射 威力 +20%、引爆後留 1 層獵印 · 獵印上限 3→4 層（滿 4 層引爆）· 「神射手」獵印每層傷害 +6%→+8%
   The talent branches and the class skill tables don't change. */
const ADV12 = {
  swordsman: { n: '劍聖', res: '劍意上限 5→6', sig: '威力 +20%，會心命中時回復 1 劍意', pas: ['劍聖', '會心傷害 +20%'] },
  mage: { n: '大魔導士', res: '咒印上限 3→4', sig: '威力 +20%，不消耗 MP', pas: ['大魔導士', '元素爆發的倍率 +0.3'] },
  guardian: { n: '聖騎士', res: '守勢上限 5→6', sig: '威力 +20%，之後回復最大 HP 的 10%', pas: ['聖騎士', '護盾中受到的傷害 −15%'] },
  ranger: { n: '神射手', res: '獵印上限 3→4 層（滿 4 層時引爆）', sig: '威力 +20%，引爆後留下 1 層獵印', pas: ['神射手', '獵印每層傷害 +6%→+8%'] },
};
const advOn = (st = Game.st) => !!(st && (st.lv || 0) >= 14 && st.flags && st.flags.deep);
const advOf = (k, st = Game.st) => { const c = k && clsV7(k); return c && ADV12[c] && advOn(st) ? ADV12[c] : null; };
// names: the four basic classes read as their advanced names once the hero has awakened
for (const k in ADV12) { const C = CLASSES[k]; if (!C) continue; const base = C.n; ADV12[k].base = base;
  Object.defineProperty(C, 'n', { get() { return advOn() ? ADV12[k].n : base; }, set(v) { ADV12[k].base = v; }, configurable: true, enumerable: true }); }

/* ---------- battle: one mechanic per advanced class ---------- */
const ADV_SIG = c => ({ stage: 'skill', who: 'attacker', mul: 1.2, cond: { skillIs: 'sig_' + c } });
defPut('mechanics', 'adv_swordsman', { make: u => ({ rules: { max_ki: 1 }, mods: [ADV_SIG('swordsman'), { stage: 'attacker', who: 'attacker', critDmg: 20, cond: { hasPower: 1 } }],
  triggers: [TRG(EVT.DAMAGE, 'src', { skillIs: 'sig_swordsman', evHit: 1, crit: 1, tgtSide: 'enemy' }, [GAIN('ki', 1)], { limit: { perAction: 1 } })] }) });
defPut('mechanics', 'adv_mage', { make: u => ({ rules: { max_sigil: 1, burstPlus: 1 }, mods: [ADV_SIG('mage'), { stage: 'skill', costMul: 0, res: 'mp', cond: { skillIs: 'sig_mage' } }] }) });
defPut('mechanics', 'adv_guardian', { make: u => ({ rules: { max_stance: 1 }, mods: [ADV_SIG('guardian'), { stage: 'defender', who: 'defender', mul: 0.85, cond: { ownerHasStatus: 'barrier', hasPower: 1 } }],
  triggers: [TRG(EVT.SKILL_SUCCESS, 'src', { skillIs: 'sig_guardian', ownerAlive: 1 }, [{ type: 'heal', target: 'self', pct: 0.1 }])] }) });
defPut('mechanics', 'adv_ranger', { make: u => ({ rules: { markMax: 1, huntUp: 1, markKeep: 1 }, mods: [ADV_SIG('ranger')] }) });
{ const _b = BR.FORMULA.burstMul; BR.FORMULA.burstMul = c => _b(c) + (c.core.rule(c.src, 'burstPlus') ? 0.3 : 0); }
{ const _h = BR.FORMULA.huntMul; BR.FORMULA.huntMul = c => _h(c) + (c.core.rule(c.src, 'huntUp') ? 0.02 * BV12.markOf(c.core, c.src, c.tgt) : 0); }
{ const D = EFFECT_TYPES.hunt_detonate, _x = D.exec; D.exec = function (core, ef, ctx, ...r) { const u = ctx.owner, t = (ctx.targets || [])[0], before = t ? BV12.markOf(core, u, t) : 0;
    const out = _x.call(this, core, ef, ctx, ...r); if (t && before && core.rule(u, 'markKeep') && core.isUp(t) && !BV12.markOf(core, u, t)) core.applyStatus(u, t, 'hunt_mark', { quiet: 1 }); return out; }; }
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg), c = clsV7(st.cls); if (advOf(c, st) && DEF.mechanics['adv_' + c]) s.data.mechanics.push('adv_' + c); return s; }; }

/* ---------- texts: the signature skill, the class card, the opening ---------- */
const advSigLine = id => { const D = DEF.skills[id]; if (!D || !D.tags.includes('sig')) return ''; const c = Object.keys(ADV12).find(k => 'sig_' + k === id), A = c && advOf(c); return A ? '【' + A.n + '】' + A.sig + '。' : ''; };
{ const _si = BB.skillInfo; BB.skillInfo = function (st, id) { const t = _si.call(this, st, id), a = advSigLine(id); return a ? t + a : t; }; }
{ const _pf = powFormula; powFormula = function (id, st = Game.st) { const t = _pf(id, st), a = advSigLine(id); return a ? t + '\n' + a : t; }; }
{ const _cc = classCard; classCard = function (k) { const c = _cc(k), A = ADV12[clsV7(k)]; if (!A) return c;
    if (advOn()) { c.tag = c.tag.replace('基本職業', '進階職業'); c.text += '\n進階被動「' + A.pas[0] + '」：' + A.pas[1]; } else c.text += '\n（Lv14 天賦覺醒後進階成' + A.n + '）';
    return c; }; }
classSelectScreen = function* () { return yield* classCardScreen(['swordsman', 'mage', 'guardian', 'ranger'], { title: '覺醒的儀式', confirm: k => '要走上「' + CLASSES[k].n + '」的道路嗎？\n（Lv14 找村長「天賦覺醒」時會進階成' + ADV12[k].n + '）' }); };

/* ---------- the advancement itself (天賦覺醒 at the elder; old saves that already awakened see it once) ---------- */
function* advAnnounce() {
  const st = Game.st; if (!st || !advOn(st) || st.flags.advTold) return; st.flags.advTold = 1; const c = clsV7(st.cls), A = ADV12[c];
  if (A) { Sound.jingle('levelup'); yield* itemGet(st.name + '從' + A.base + '\n進階成為了' + A.n + '！');
    yield* sayAll(['職業招式「' + ((DEF.skills['sig_' + c] || {}).name || '') + '」\n' + A.sig.replace('，', '，\n') + '。', A.res.replace('（', '\n（') + '。', '進階被動「' + A.pas[0] + '」：\n' + A.pas[1] + '。']); }
  yield* sayAll(['劍士→劍聖、魔導士→大魔導士\n守護者→聖騎士、遊俠→神射手', '之後換成其他基本職業，\n也會是進階後的職業。']);
}
{ const _ct = classTalk; classTalk = function* (...a) { const r = yield* _ct.apply(this, a); if (advOn() && !Game.st.flags.advTold) yield* advAnnounce(); return r; }; }
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    const st = this.st; if (st && !this.script && !UI.stack.length && !Game.trans && advOn(st) && !st.flags.advTold && st.flags.license) { this.run(advAnnounce()); return; }
    return _u.apply(this, a); }; }
