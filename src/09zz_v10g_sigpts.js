/* ===================== v10.6 職業招式用「招式點」 =====================
   Player: 「職業招式改消耗累積的點數3點才能使用，補償威力升級，威力公式點選可以查看」 — with its own gauge (the player
   picked a separate 招式點 so it does not compete with the weapon 特技):
   - 招式點: +1 when a normal attack hits, +1 when a foe's attack hits the hero; up to 5. The signature move costs 3 and no MP.
     The signature tree's old 「MP-2」 options became 「開場招式點+1」 (sigStart).
   - Power ×1.4 for every signature move as the compensation (共鳴旋律: heal 12% → 18%).
   - Skill pop-up: tap the power line (or SELECT) to see how the power is built and how damage is worked out.
   - The chief's first orb follows the class: magic classes get 火炎彈, the rest 裂風斬; a magic-class save that got 裂風斬 gets 火炎彈 once. */
const SIG_COST = 3, SIG_MAX = 5, SIG_POW_MUL = 1.4;
for (const c in SIG) { const m = MOVES['sig_' + c]; if (m && m.pow) m.pow = Math.round(m.pow * SIG_POW_MUL); }
if (SIG.bard) SIG.bard.healAfter = 18;
if (SIG.bard) SIG.bard.d = '攻魔提升，回復HP，特技+1。';
{ const _mp = skillMP; skillMP = function (id, st = Game.st) { return MOVES[id] && MOVES[id].sig ? 0 : _mp(id, st); }; }
const sgpGain = (b, n = 1) => { if (b && b.H && sigId(Game.st)) b.H.sgp = Math.min(SIG_MAX, (b.H.sgp || 0) + n); };
{ const _ca = Battle.prototype.chooseAction; Battle.prototype.chooseAction = function* () {
    if (!this._sgp0 && this.H) { this._sgp0 = 1; this.H.sgp = Math.min(SIG_MAX, (this.H.sgp || 0) + (typeof tsum === 'function' ? tsum('sigStart') : 0)); }
    return yield* _ca.call(this); }; }
{ const _um = Battle.prototype.useMove; Battle.prototype.useMove = function* (u, t, id) {
    if (u && u.hero && MOVES[id] && MOVES[id].sig) { if ((this.H.sgp || 0) < SIG_COST) { yield* this.msg('招式點不夠，' + u.n + '改用普通攻擊！'); return yield* this.useMove(u, t, 'attack'); } this.H.sgp -= SIG_COST; }
    const hp0 = t ? t.hp : 0, r = yield* _um.call(this, u, t, id);
    if (t && t.hp < hp0 && u) { if (u.hero && id === 'attack') sgpGain(this); else if (!u.hero && t.hero) sgpGain(this); }
    return r; }; }
// the gauge above the 特技 counter: 招式 ●●●○○ (gold once it reaches 3)
{ const _bh = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) {
    _bh.call(this, x); const H = this.H, Y = Math.round(this.boxH); if (!H || Y >= BH || Game.scene !== this || !sigId(Game.st)) return;
    const n = Math.min(SIG_MAX, H.sgp || 0), ok = n >= SIG_COST, lw = Math.ceil(Font.width('招式', 7)) + 4, w = SIG_MAX * 7 + lw, X = W - w - 3, yy = Y - 21;
    x.fillStyle = 'rgba(10,10,22,0.72)'; x.fillRect(X - 2, yy - 1, w + 4, 10); Font.draw(x, '招式', X, yy - 4, ok ? '#ffd860' : UIC.muted, UIC.textSh, 7);
    for (let i = 0; i < SIG_MAX; i++) { const cx = X + lw + i * 7, on = i < n; x.fillStyle = '#10121e'; x.fillRect(cx - 1, yy + 1, 6, 6); x.fillStyle = on ? (ok ? '#ffd860' : '#8ad0ff') : '#3a3a4a'; x.fillRect(cx, yy + 2, 4, 4); if (i === SIG_COST - 1) { x.fillStyle = 'rgba(255,216,96,0.5)'; x.fillRect(cx + 5, yy, 1, 8); } }
  }; }
// 威力公式: how this skill's power is built, then the damage formula (short)
function powFormula(id, st = Game.st) {
  const m = skillMove(id, st), B = MOVES[id], L = [], stat = m.cat === '特' ? '魔攻' : '物攻', vsD = m.cat === '特' ? '魔防' : '物防';
  if (B.sig) { const c = clsV7(st.cls), base = SIG[c] && SIG[c].pow, tp = typeof tsum === 'function' ? tsum('sigPow', st) : 0, sh = c === 'guardian' && typeof shieldOn === 'function' && shieldOn(st);
    L.push('威力 ' + m.pow + '＝基礎' + base + ' ×1.4（招式點）' + (tp ? ' ＋天賦' + tp + '%' : '') + (sh ? ' ×1.2（持盾）' : '')); }
  else if (B.orb) { const o = typeof orbOfMove === 'function' && orbOfMove(id, st), base = ORB_A[B.orb] && ORB_A[B.orb].pow; L.push('威力 ' + m.pow + (base && base !== m.pow ? '＝基礎' + base + (o && o.e && o.e.length ? '＋進化' : '') : '')); }
  else L.push('威力 ' + m.pow);
  L.push('＝普攻的' + Math.round(m.pow / MOVES.attack.pow * 100) + '%' + (m.hits ? '，' + (Array.isArray(m.hits) ? m.hits.join('～') : m.hits) + '段' : ''));
  L.push('傷害≈威力×你的' + stat + '÷對手' + vsD + '（再依等級放大）');
  L.push('再乘：屬性相剋・會心×1.5・亂數85～100%');
  return L.join('\n');
}
// the chief's first orb follows the class
function starterOrb(st = Game.st) { const V = CLASS_V7[clsV7(st.cls)]; return V && isMagicW(V.w[0]) ? 'fireShot' : 'galeCut'; }
{ const _so = startOverworld; startOverworld = function (...a) {
    const st = Game.st, fix = st && st.flags && st.flags.orbStart && !st.flags.orbStartFix && starterOrb(st) === 'fireShot' && orbList(st).some(o => o.k === 'galeCut') && !orbList(st).some(o => o.k === 'fireShot');
    if (st && st.flags) st.flags.orbStartFix = 1; const ow = _so.apply(this, a);
    if (fix && ow && ow.run) ow.run((function* () { yield* wait(30); yield* say('村長：「差點忘了，你是用魔法的吧？裂風斬大概用不上，這顆給你。」'); yield* orbGet('fireShot', ''); })());
    return ow; }; }
// menus may take SELECT for an extra action (the skill pop-up: show / hide the power formula)
{ const _ch = choose; choose = function* (items, o = {}) { if (!o.onSel) return yield* _ch(items, o); const m = new Menu(items, o); UI.push(m); while (!m.done) { if (Input.pressed('select')) { Input.consume('select'); o.onSel(m); } m.update(); yield; } UI.remove(m); return m.result; }; }
