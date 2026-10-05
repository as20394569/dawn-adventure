/* ===================== v12.22 反擊看得出來、動作放慢（玩家 2026-10-05：「反擊類型的攻擊希望做出不一樣的動作與標示 然後動作不要太快 不然很像突然動一下」） =====================
   原本的反擊：訊息「趁勢反擊！」之後直接播那招的普通斬擊（往前衝 3 格畫面、馬上收回），看起來像角色抽動一下，也看不出跟普通攻擊有什麼不同。
   1. 標示：被打的那一刻，反擊的一方跳大字「反擊！」，身上閃金光（魔物反擊是紅色）；
      接著掛一個「⚔反擊」牌子（主角在頭上、魔物在腳下），一直到反擊打完；反擊打出的傷害數字上面寫「反擊」（會心時「反擊・會心」）。
      訊息寫是哪個效果：「架劍！勇者架開攻擊，反擊！」「不落要塞！勇者擋下攻擊，反擊！」「殘影！勇者閃過攻擊並反擊！」。
   2. 先有「接招」的動作（照反擊的種類）：
      · 架開（架劍、迴槍架勢、迎擊、反擊架勢）：兩把武器交錯的火花，人被推後一點；
      · 擋下（不落要塞、城塞反擊、雙盾、架盾反擊、盾反、防禦時反擊）：面前亮一面盾；
      · 閃過（殘影、幻步）：人往旁邊滑開留下殘影，再滑回來；
      · 其他（復仇、逆鱗…）：身上一圈光收進來。
   3. 反擊本身換成專用的動作，比普通攻擊慢：先往後縮蓄力（看得到武器閃光）→ 踏步衝過去 → 由下往上的「回斬」＋交叉第二刀
      （拿盾的是盾擊；雙持的兩手各一下）→ 停在對方面前，傷害跳完才慢慢退回原位。 */
const CTR12 = {
  col: { hero: ['#ffd040', '#fff6c0'], foe: ['#ff6a40', '#ffd8c0'] },
  // why → [label in the message, kind]
  why: { shadow: ['殘影', 'dodge'], shadow11: ['殘影', 'dodge'], phantom: ['幻步', 'dodge'],
    parry11: ['架劍', 'parry'], spear11: ['迴槍架勢', 'parry'], kiCounter: ['迎擊', 'parry'], stance12: ['反擊架勢', 'parry'],
    fort11: ['不落要塞', 'block'], fortress: ['城塞反擊', 'block'], shield11: ['雙盾', 'block'], shieldCounter: ['架盾反擊', 'block'], wardBack: ['盾反', 'block'],
    avenge: ['復仇', 'strike'], scale12: ['逆鱗', 'strike'] },
  verb: { dodge: '閃過攻擊並反擊！', parry: '架開攻擊，反擊！', block: '擋下攻擊，反擊！', strike: '趁勢反擊！' },
  WIND: 22, BACK: 10, STEP: 9, HOLD: 22, RET: 14,
};
function ctrInfo12(s, why) { const W = CTR12.why[why]; let kind = W ? W[1] : 'strike';
  if (!W && why === 'counter' && s && s.st && s.st.guard) kind = 'block'; return { label: W ? W[0] : null, kind }; }
const ctrDir12 = (A, B) => { const L = Math.hypot(B.x - A.x, B.y - A.y) || 1; return { x: (B.x - A.x) / L, y: (B.y - A.y) / L }; };
// 1+2. the moment it is triggered: the catch (parry / block / dodge), 「反擊！」 and the message
{ const H = Battle.prototype.handlers, _re = H.REACTION; H.REACTION = function* (e, s, t, P) {
    if (!s) return yield* _re.call(this, e, s, t, P);
    const I = ctrInfo12(s, P.why), [c, c2] = s.hero ? CTR12.col.hero : CTR12.col.foe, C = this.center(s), A = this.center(t || (s.hero ? this.F : this.H)), d = ctrDir12(C, A), o = s.off || { x: 0, y: 0 };
    this.ctr12 = { v: s, kind: I.kind, t0: this.t, c, c2 }; this.pendingReact = true;
    const P0 = { x: C.x + d.x * 16, y: C.y + d.y * 16 };
    if (I.kind === 'parry') { Sound.sfx('shield'); Sound.sfx('slash');
      for (const k of [1, -1]) { this.spawn({ k: 'line', x1: P0.x - 16 * k, y1: P0.y - 16, x2: P0.x + 16 * k, y2: P0.y + 16, c, w: 4, grow: 2, life: 14 }); this.spawn({ k: 'line', x1: P0.x - 16 * k, y1: P0.y - 16, x2: P0.x + 16 * k, y2: P0.y + 16, c: '#ffffff', w: 1, grow: 2, life: 16 }); }
      this.spawn({ k: 'ring', x: P0.x, y: P0.y, r0: 4, r1: 26, c: '#ffffff', w: 2, life: 12 });
      this.sparks(P0.x, P0.y, 12, ['#ffffff', c, c2], 2.6, 16); this.star(P0.x, P0.y, '#ffffff', 14);
      yield* tween(6, q => { o.x = -d.x * 5 * q; o.y = -d.y * 5 * q; }); }
    else if (I.kind === 'block') { Sound.sfx('shield');
      this.spawn({ k: 'hex', x: P0.x, y: P0.y, r0: 8, r1: 20, c: '#c8dcff', life: 18 }); this.spawn({ k: 'hex', x: P0.x, y: P0.y, r0: 18, r1: 22, c: '#ffffff', life: 8 });
      this.sparks(P0.x, P0.y, 8, ['#ffffff', '#c8dcff'], 2, 14); yield* tween(6, q => { o.x = -d.x * 3 * q; o.y = -d.y * 3 * q; }); }
    else if (I.kind === 'dodge') { Sound.sfx('wind'); const sx = s.hero ? -1 : 1;
      for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: C.x - 8, y1: C.y - 12 + i * 12, x2: C.x + 8, y2: C.y - 12 + i * 12, c: '#c8f0ff', w: 1, grow: 3, life: 14 });
      yield* tween(6, q => { o.x = sx * 16 * q; o.y = 0; }); }
    else { Sound.sfx('charge'); this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 34, r1: 6, c, w: 2, life: 14 }); yield* wait(6); }
    // 「反擊！」: the counterer lights up
    Sound.sfx('exclaim'); this.spawn({ k: 'flash', c, a: 0.16, life: 8 }); this.popNum(s, '反擊！', c, null, { big: true, dy: s.hero ? -54 : Math.round(s.bbh * 0.5) + 20 });
    s.tint = { c, a: 0 }; yield* tween(6, q => { if (s.tint) s.tint.a = 0.55 * q; });
    this.star(C.x + (s.hero ? 16 : -12) + o.x, C.y - 14 + o.y, '#ffffff', 12);
    yield* tween(CTR12.WIND - 12, q => { if (s.tint) s.tint.a = 0.55 * (1 - q * 0.7); });
    if (I.kind === 'dodge') { const x0 = o.x; yield* tween(6, q => { o.x = x0 * (1 - q); }); }
    s.tint = null;
    yield* this.msg((I.label ? I.label + '！' : '') + s.n + CTR12.verb[I.kind], { hold: 24 });
    if (o.x || o.y) { const ox = o.x, oy = o.y; yield* tween(6, q => { o.x = ox * (1 - q); o.y = oy * (1 - q); }); o.x = 0; o.y = 0; }
  }; }
// 3. the counter itself: its own, slower motion (wind back → step in → rising cut + a cross cut / a shield bash → stay → walk back)
FX.ctr12 = function* (U, T, u) {
  const K = this.ctrNow12 || {}, v = u && u.id ? this.views[u.id] || u : u, o = v && v.off; if (!o) return yield* FX.slash.call(this, U, T, u);
  this.slashOn = 0; const [c, c2] = u.hero ? CTR12.col.hero : CTR12.col.foe, d = ctrDir12(U, T), x0 = o.x, y0 = o.y;
  const shield = u.hero && (/盾/.test(this._thKind || '') || (K.kind === 'block' && !!Game.st.equip.shield)), dual = u.hero && typeof dualMode11 === 'function' && !!dualMode11(Game.st);
  // wind back, the weapon glints
  this.anim(v, 'cast', CTR12.BACK + 2, true); Sound.sfx('charge');
  yield* tween(CTR12.BACK, q => { const e = Math.sin(q * Math.PI / 2); o.x = x0 - d.x * 8 * e; o.y = y0 - d.y * 8 * e; });
  this.star(U.x + (u.hero ? 16 : -12) - d.x * 8, U.y - 14 - d.y * 8, '#ffffff', 12); this.spawn({ k: 'glow', x: U.x - d.x * 8, y: U.y - 10, r: 22, c, life: 12 });
  // step in
  this.anim(v, 'attack', CTR12.STEP + 26); const far = u.hero ? 26 : 40;
  for (let i = 1; i <= CTR12.STEP; i++) { const q = i / CTR12.STEP, e = q * q * (3 - 2 * q); o.x = x0 + d.x * (-8 + (far + 8) * e); o.y = y0 + d.y * (-8 + (far + 8) * e);
    if (i % 3 === 0) this.spawn({ k: 'line', x1: U.x + o.x - d.x * 10, y1: U.y + o.y - d.y * 10, x2: U.x + o.x - d.x * 26, y2: U.y + o.y - d.y * 26, c: c2, w: 1, grow: 2, life: 8 }); yield; }
  // the strike
  const n = dual ? 2 : 1;
  for (let k = 0; k < n; k++) {
    if (shield) { Sound.sfx('hitSuper'); this.shake = Math.max(this.shake || 0, 10);
      this.spawn({ k: 'hex', x: T.x + (k ? 6 : -6), y: T.y, r0: 6, r1: 30, c: '#dfe8ff', life: 14 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6, r1: 34, c, w: 3, life: 14 });
      for (let i = 0; i < 3; i++) this.star(T.x + rnd(-12, 12), T.y - 16 + rnd(-6, 6), c, 10); }
    else { Sound.sfx('slash'); const s = k ? -1 : 1;
      // the rising 「回斬」 (from low to high), then the cross cut that makes an X
      this.spawn({ k: 'line', x1: T.x - 28 * s, y1: T.y + 24, x2: T.x + 28 * s, y2: T.y - 24, c, w: 7, grow: 2, life: 18 }); this.spawn({ k: 'line', x1: T.x - 28 * s, y1: T.y + 24, x2: T.x + 28 * s, y2: T.y - 24, c: '#ffffff', w: 2, grow: 2, life: 20 });
      yield* wait(4); Sound.sfx('slash');
      this.spawn({ k: 'line', x1: T.x - 22 * s, y1: T.y - 20, x2: T.x + 22 * s, y2: T.y + 20, c: c2, w: 4, grow: 3, life: 14 }); }
    this.spawn({ k: 'flash', c: c2, a: 0.22, life: 6 }); this.sparks(T.x, T.y, 12, ['#ffffff', c, c2], 3, 18); this.star(T.x, T.y, '#ffffff', 14);
    if (k < n - 1) yield* wait(7); }
  yield* wait(6);
  // stays in front of the foe while the number pops, then walks back (update below)
  this.ctrRet12 = { v, x: o.x, y: o.y, x0: 0, y0: 0, at: this.t + CTR12.HOLD, dur: CTR12.RET };
};
{ const _up = Battle.prototype.update; Battle.prototype.update = function () { _up.call(this); const R = this.ctrRet12;
    if (R) { const o = R.v.off; if (!o) this.ctrRet12 = null; else if (this.t >= R.at) { const q = Math.min(1, (this.t - R.at) / R.dur), e = q * q * (3 - 2 * q); o.x = R.x + (R.x0 - R.x) * e; o.y = R.y + (R.y0 - R.y) * e; if (q >= 1) { o.x = R.x0; o.y = R.y0; this.ctrRet12 = null; } } }
    const B = this.ctr12; if (B && (this.t - B.t0 > 600 || (B.end && this.t > B.end) || !B.v || B.v.gone)) this.ctr12 = null; }; }
const ctrSnap12 = B => { const R = B.ctrRet12; if (R && R.v.off) { R.v.off.x = R.x0; R.v.off.y = R.y0; } B.ctrRet12 = null; };
// the reaction skill plays the counter motion (no cast flourish, no skill finisher); anything else first snaps a walking-back counterer home
{ const H = Battle.prototype.handlers, _su = H.SKILL_USE; H.SKILL_USE = function* (e, s, t, P) { const D = DEF.skills[P.skill]; ctrSnap12(this);
    const react = !!(this.pendingReact && D && s && D.tags.includes('reaction'));
    if (!react) { if (this.pendingReact && D && !D.tags.includes('reaction')) this.pendingReact = null; if (this.ctr12) this.ctr12 = null; return yield* _su.call(this, e, s, t, P); }
    const B = this.ctr12 && this.ctr12.v === s ? this.ctr12 : (this.ctr12 = { v: s, kind: ctrInfo12(s, null).kind, t0: this.t, ...(s.hero ? { c: CTR12.col.hero[0], c2: CTR12.col.hero[1] } : { c: CTR12.col.foe[0], c2: CTR12.col.foe[1] }) });
    B.go = 1; this.ctrNow12 = B;
    try { yield* _su.call(this, e, s, t, P); } finally { this.ctrNow12 = null; B.end = this.t + 70; B.dmg = 1; } }; }
{ const _pf = Battle.prototype.playFx; Battle.prototype.playFx = function* (name, u, t) { if (this.ctrNow12) { const U = this.center(u), T = this.center(t); return yield* FX.ctr12.call(this, U, T, u, t); } return yield* _pf.call(this, name, u, t); }; }
{ const _hc = heroCast; heroCast = function* (...a) { if (this.ctrNow12) return; yield* _hc.apply(this, a); };
  const _hi = heroImpact; heroImpact = function* (...a) { if (this.ctrNow12) return; yield* _hi.apply(this, a); }; }
// the counter's damage number says 「反擊」
{ const H = Battle.prototype.handlers, _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) { const B = this.ctr12, on = !!(B && B.dmg && s && B.v === s && P.kind === 'hit');
    if (!on) return yield* _dm.call(this, e, s, t, P); const _pn = this.popNum; this.popNum = function (v, x, c, tag, o) { if (typeof x === 'number' && v === t) tag = tag ? '反擊・' + tag : '反擊'; return _pn.call(this, v, x, c, tag, o); };
    try { yield* _dm.call(this, e, s, t, P); } finally { delete this.popNum; } }; }
// the 「反擊」 sign over the counterer, from the catch until the counter is done
function ctrBadge12(B, x) { const K = B.ctr12; if (!K || !K.v || K.v.gone || (!K.go && B.t - K.t0 < CTR12.WIND)) return; const v = K.v, C = B.center(v), s = '反擊', w = Math.ceil(Font.width(s, 10)) + 18;
  const X = Math.round(C.x - w / 2 + (v.off ? v.off.x : 0)), Y = Math.round((v.hero ? C.y - 40 : v.foot + 6) + (v.off ? v.off.y : 0));
  const fade = K.end ? clamp((K.end - B.t) / 16, 0, 1) : 1, blink = !K.go && Math.floor((B.t - K.t0) / 8) % 2 ? 0.75 : 1; x.globalAlpha = fade * blink;
  x.fillStyle = 'rgba(20,12,4,0.9)'; x.fillRect(X, Y, w, 14); x.fillStyle = K.c; x.fillRect(X, Y, w, 1); x.fillRect(X, Y + 13, w, 1); x.fillRect(X, Y, 1, 14); x.fillRect(X + w - 1, Y, 1, 14);
  // two small crossed blades
  x.strokeStyle = K.c; x.lineWidth = 1.5; x.beginPath(); x.moveTo(X + 3, Y + 3); x.lineTo(X + 11, Y + 11); x.moveTo(X + 11, Y + 3); x.lineTo(X + 3, Y + 11); x.stroke();
  Font.draw(x, s, X + 14, Y - 1, K.c, '#000000', 10); x.globalAlpha = 1; }
{ const _dp = Battle.prototype.drawPops; Battle.prototype.drawPops = function (x) { ctrBadge12(this, x); _dp.call(this, x); }; }
