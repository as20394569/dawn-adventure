/* ===================== v12.0.9z 護盾統一成「格數」（玩家 2026-10-04：「不如改效果統一」→ 選「格數制，結果各自不同」） =====================
   主角的護盾：技能給 N 格（原本「N 回合」→ N+1 格），有格時受到的傷害 −40%；每次被打中（每次行動）少 1 格，被會心再少 1 格；
     沒有時間限制，格數用完才消失。再展開護盾時補到較多的那一邊（不疊加）。
   魔物的護盾（破防盾）：照舊 3／5 格、不減傷，被弱點・會心・削盾招削，削光破防。兩邊都用同一個盾牌圖示顯示剩下的格數。 */
const SHIELD_X11 = 1; // 回合 → 格：+1
{ const B = DEF.statuses.barrier; Object.assign(B, { duration: 'battle', durDefault: null, stack: 'signed', min: 0, max: 9 }); delete B.tick;
  B.triggers = (B.triggers || []).concat([
    { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1 }, limit: { perAction: 1 }, effects: [{ type: 'status', target: 'self', status: 'barrier', delta: -1, quiet: 1 }] },
    { on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, crit: 1 }, limit: { perAction: 1 }, effects: [{ type: 'status', target: 'self', status: 'barrier', delta: -1, quiet: 1 }] }]); }
// 展開護盾：「N 回合」換成 N+1 格，補到較多的那一邊
{ const _as = BattleCore.prototype.applyStatus; BattleCore.prototype.applyStatus = function (src, t, id, o = {}) {
    if (id !== 'barrier' || (o.delta != null && o.delta < 0)) return _as.call(this, src, t, id, o);
    const n = Math.max(1, Math.round((typeof o.dur === 'number' ? o.dur : 2) + SHIELD_X11)), cur = t && this.statusOf(t, 'barrier'), have = cur ? cur.stacks : 0;
    return _as.call(this, src, t, id, { ...o, dur: null, delta: cur ? Math.max(0, n - have) : n }); }; }

/* ---------- 戰鬥畫面：展開・被削・打破；主角身邊的盾牌圖示跟魔物一樣顯示格數 ---------- */
delete BADGE_OF.barrier;
{ const H = Battle.prototype.handlers;
  const _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) {
    if (!t || P.failed || P.status !== 'barrier') return yield* _ap.call(this, e, s, t, P);
    const C = this.center(t); if (P.cleared || !P.stacks) { delete t.st.barrier; Sound.sfx('rock'); this.sparks && this.sparks(C.x, C.y, 10, ['#c8e0ff', '#80a8e0'], 2.5); yield* this.msg(t.n + '的護盾被打破了！', { hold: 20 }); return; }
    t.st.barrier = P.stacks;
    if (P.delta < 0) { Sound.sfx('shield'); this.spawn({ k: 'hex', x: C.x, y: C.y, r0: 22, r1: 10, c: '#a8c8f0', life: 10 }); if (this.popNum) this.popNum(t, '護盾 ' + P.stacks + ' 格', '#a8c8f0', null, { small: true, dy: -14 }); return; }
    yield* FX.barrier.call(this, C); yield* this.msg(P.capped ? t.n + '的護盾維持 ' + P.stacks + ' 格。' : t.n + '展開了護盾！（' + P.stacks + ' 格）', { hold: 22 }); };
  const _sg = H.statusGone; H.statusGone = function* (e, s, t, P, expire) { if (t && P.status === 'barrier') { delete t.st.barrier; if (P.why !== 'down') yield* this.msg(t.n + '的護盾消失了。', { hold: 18 }); return; } yield* _sg.call(this, e, s, t, P, expire); }; }
{ const _db = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) { _db.call(this, x); const Hv = this.H; if (!Hv || !Hv.st || !(Hv.st.barrier > 0) || Math.round(this.boxH) >= BH) return;
    const C = this.center(Hv), X = Math.max(2, Math.round(C.x - 46 + Hv.off.x)), Y = Math.round(HERO_FOOT - 46 + Hv.off.y); drawShieldBadge(x, X, Y, Hv.st.barrier, false, false); }; }

/* ---------- 說明文字：「N 回合護盾」→「N+1 格護盾」 ---------- */
const shTxt11 = s => typeof s !== 'string' || !/護盾/.test(s) ? s : s
  .replace(/展開魔法護盾，(\d+)\s*回合內受到的傷害減少\s*40%/g, (m, n) => '展開 ' + (+n + SHIELD_X11) + ' 格護盾（受到的傷害 −40%）')
  .replace(/之後展開護盾（守勢 4 以上時 2 回合）/g, '之後展開 2 格護盾（守勢 4 以上時 3 格）')
  .replace(/護盾「1＋魔紋數」行動/g, '護盾「2＋魔紋數」格')
  .replace(/(\d+)\s*行動；砲台在場時\s*(\d+)\s*行動/g, (m, a, b) => (+a + SHIELD_X11) + ' 格；砲台在場時 ' + (+b + SHIELD_X11) + ' 格')
  .replace(/(\d+)\s*回合(內)?的?護盾/g, (m, n) => (+n + SHIELD_X11) + ' 格護盾')
  .replace(/護盾\s*(\d+)\s*(回合|行動)/g, (m, n) => '護盾 ' + (+n + SHIELD_X11) + ' 格')
  .replace(/魔法護盾：受到的傷害減少40%。/g, '護盾：有格數時受到的傷害減少 40%，每被打中一次少 1 格（會心少 2 格），用完就消失。');
for (const id in DEF.skills) { const D = DEF.skills[id]; if (D.desc) D.desc = shTxt11(D.desc); }
for (const id in DEF.talents) { const T = DEF.talents[id]; if (T.desc) T.desc = shTxt11(T.desc); }
for (const k in MOVES) if (MOVES[k].d) MOVES[k].d = shTxt11(MOVES[k].d);
if (typeof SPECIALS !== 'undefined') for (const k in SPECIALS) if (SPECIALS[k] && SPECIALS[k].d) SPECIALS[k].d = shTxt11(SPECIALS[k].d);
if (typeof SIG !== 'undefined') for (const k in SIG) if (SIG[k] && SIG[k].d) SIG[k].d = shTxt11(SIG[k].d);
for (const T of [typeof ORB_A !== 'undefined' ? ORB_A : null, typeof ORB_P !== 'undefined' ? ORB_P : null]) if (T) for (const k in T) if (T[k] && T[k].d) T[k].d = shTxt11(T[k].d);
for (const T of [typeof TK_TXT !== 'undefined' ? TK_TXT : null, typeof EVO_TXT !== 'undefined' ? EVO_TXT : null]) if (T) for (const k in T) if (typeof T[k] === 'function') { const f = T[k]; T[k] = (...a) => shTxt11(f(...a)); }
if (typeof WSPEC !== 'undefined') for (const k in WSPEC) if (Array.isArray(WSPEC[k]) && typeof WSPEC[k][1] === 'function') { const f = WSPEC[k][1]; WSPEC[k][1] = (...a) => shTxt11(f(...a)); }
if (typeof cryEffText11 === 'function') { const f = cryEffText11; cryEffText11 = (...a) => shTxt11(f(...a)); }
{ const f = BB.skillInfo; BB.skillInfo = (...a) => shTxt11(f(...a)); }
SP_TXT11.guard = '展開 3 格護盾（受到的傷害 −40%）';
for (const L of [typeof BATTLE_HELP !== 'undefined' ? BATTLE_HELP : [], typeof GROW12 !== 'undefined' ? GROW12 : []]) for (const b of L) if (Array.isArray(b)) { if (typeof b[1] === 'string') b[1] = shTxt11(b[1]); else if (Array.isArray(b[1])) b[1] = b[1].map(shTxt11); }
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.push(['護盾', ['主角的護盾：技能給幾格，有格數時受到的傷害 −40%；每被打中一次少 1 格，被會心再少 1 格，用完就消失。', '魔物的護盾（菁英 3 格、頭目 5 格）：不減傷，被弱點・會心・削盾的招式削格，削光就破防（跳過下一次行動、受到的傷害 +50%，蓄力被打斷）。', '兩邊都用盾牌圖示顯示剩下的格數。']]);
