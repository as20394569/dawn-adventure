/* ===================== v12.102 出招時的佔位、每種武器自己的聲音 =====================
   玩家 2026-10-10：「長槍技能施放時 角色略為往前站到位置上」「其他的武器也能同步一起重製 除了新特效外 角色的佔位 音效 表現方式都要做出每種武器的特色」
   → 問了佔位：選「照武器分遠近」；已經做好的劍・雙劍・短刀・雙刀「一起改」。
   佔位（出招前移過去、整招都站在那裡出招，ACTION_END（傷害都跳完）才回原位；對自己用的招、跳躍的落下不移動）：
     劍・雙劍＝衝到對手面前（快速衝刺，留下殘影）　短刀・雙刀＝閃身到對手身邊（原地留下黑影，一瞬間出現在對手前面）
     長槍＝往前踏一小步，中距離出槍　斧＝大步跳上去、落地震一下　拳套＝衝到最貼身　法杖＝站在原地（後排）施法　雙盾・單手盾＝舉盾穩穩往前推進
   站上去以後，招裡的「往前撲」改成從站的位置再往前撲一下；主角的中心、手、腳下（HDW_FOOT）都跟著移過去，光效從新位置發出。
   聲音：主角出招時，照武器把 揮動／打中 的聲音換掉（02_audio.js 的 spThrust、axHit、fsHit、stHit、shHit…）；劍維持刀的聲音。
   先只在特效測試版（HDW.live）；玩家看過說好才放進正式版。 */
const HDW = { live: typeof fxtest13 === 'function' && fxtest13(), sk: null };
// gap＝站好以後主角中心離對手中心還有多遠（主角是背影，太近會整個蓋住對手）
HDW.ST = { 劍: { m: 'dash', gap: 56 }, 雙劍: { m: 'dash', gap: 56 }, 短刀: { m: 'blink', gap: 50 }, 雙刀: { m: 'blink', gap: 50 }, 長槍: { m: 'step', d: 28 },
  斧: { m: 'leap', gap: 58 }, 拳套: { m: 'dash', gap: 48 }, 法杖: { m: 'stay' }, 雙盾: { m: 'push', d: 36 }, 單手盾: { m: 'push', d: 36 } };
HDW.MAX = 84;
// 單手盾的招（主手是別的武器，但這些招是用盾出的）：照盾的佔位、盾的聲音
HDW.KOF = { osBash: '單手盾', osHold: '單手盾', osCounter: '單手盾', ogShield: '單手盾' };
HDW.NOSTEP = new Set(['zjAzure', 'zjMeteor', 'fsQi']);   // 跳躍的落下（主角從天上掉回原位）、遠距的氣勁彈
HDW.ease = q => q * q * (3 - 2 * q);
HDW.kind = () => typeof DG17 !== 'undefined' ? DG17.kind() : null;
// 移過去
HDW.go = function* (b, T, t, kd) { const v = b.H; if (!HDW.live || !HD15.on || !v || !v.off || b.hdwBase || !T || v.air13) return; const S = HDW.ST[kd || HDW.kind()]; if (!S || S.m === 'stay') return;
  const H0 = b.center(v), D = Math.hypot(T.x - H0.x, T.y - H0.y); if (D < 24) return;
  const ux = (T.x - H0.x) / D, uy = (T.y - H0.y) / D, all = !!(t && t.group), d = Math.min(HDW.MAX, S.d != null ? S.d : Math.max(0, D - S.gap - (all ? 16 : 0))); if (d < 4) return;
  const x1 = ux * d, y1 = uy * d, o = v.off, x0 = o.x, y0 = o.y, gh = typeof K13 !== 'undefined' && K13.ghost;
  if (S.m === 'blink') { Sound.sfx('blink'); if (typeof HD18 !== 'undefined') HD18.shadow(b, 0, 0, 14, 0.7); if (gh) K13.ghost(b, x1 * 0.5, y1 * 0.5, '#8a7aa8', 6, 0.3);
    o.x = x1; o.y = y1; b.hdwBase = { x: x1, y: y1, m: S.m }; b.hdwT = b.t; HD15.ring(b, { x: H0.x + x1, y: HERO_FOOT - 2 + y1 }, HD15.P.white, 5, 24, { fl: 0.3, w: 1, dur: 12 }); yield* wait(4); return; }
  if (S.m === 'dash') { Sound.sfx('dashStep'); if (gh) K13.ghost(b, 0, 0, '#ffffff', 10, 0.4); HD15.windLines(b, { x: H0.x, y: H0.y + 10 }, { x: H0.x + x1, y: H0.y + y1 + 10 }, HD15.P.white, 4, { spread: 20, len: 30, spd: 10, life: 10 });
    yield* tween(7, q => { const e = HDW.ease(q); o.x = x0 + (x1 - x0) * e; o.y = y0 + (y1 - y0) * e; if (gh && (q > 0.3 && q < 0.45)) K13.ghost(b, o.x, o.y, '#ffffff', 8, 0.3); }); }
  else if (S.m === 'leap') { Sound.sfx('jump'); yield* tween(12, q => { const e = HDW.ease(q); o.x = x0 + (x1 - x0) * e; o.y = y0 + (y1 - y0) * e - 24 * Math.sin(Math.PI * q); });
    Sound.sfx('leapLand'); HD15.ring(b, { x: H0.x + x1, y: HERO_FOOT - 2 + y1 }, HD15.P.white, 6, 34, { fl: 0.3, w: 1.6, dur: 14 }); HD15.shards(b, { x: H0.x + x1, y: HERO_FOOT - 4 + y1 }, 5, { up: 1.6, spd: 2, sz: 2.2, cols: ['#d8c8a8', '#a08868', '#5a4a38'] }); b.shake = Math.max(b.shake || 0, 4); }
  else if (S.m === 'push') { Sound.sfx('shGuard'); yield* tween(12, q => { const e = HDW.ease(q); o.x = x0 + (x1 - x0) * e; o.y = y0 + (y1 - y0) * e; if (q > 0.5 && q < 0.6) Sound.sfx('step'); }); Sound.sfx('step'); }
  else { Sound.sfx('step'); yield* tween(8, q => { const e = HDW.ease(q); o.x = x0 + (x1 - x0) * e; o.y = y0 + (y1 - y0) * e; }); }
  o.x = x1; o.y = y1; b.hdwBase = { x: x1, y: y1, m: S.m }; b.hdwT = b.t; };
// 回原位
HDW.back = function* (b) { const v = b.H, B0 = b.hdwBase; b.hdwBase = null; if (!v || !v.off || !B0) return; const o = v.off, x0 = o.x, y0 = o.y;
  if (B0.m === 'blink') { Sound.sfx('blink'); if (typeof HD18 !== 'undefined') { b.hdwBase = B0; HD18.shadow(b, 0, 0, 12, 0.6); b.hdwBase = null; } o.x = 0; o.y = 0; return; }
  if (B0.m === 'leap') { yield* tween(12, q => { const e = HDW.ease(q); o.x = x0 * (1 - e); o.y = y0 * (1 - e) - 16 * Math.sin(Math.PI * q); }); Sound.sfx('land'); }
  else yield* tween(B0.m === 'push' ? 12 : 10, q => { const e = HDW.ease(q); o.x = x0 * (1 - e); o.y = y0 * (1 - e); });
  o.x = 0; o.y = 0; };
// 主角的中心跟著站的位置移（手、腳下、光效的起點都從這裡算）
{ const _c = Battle.prototype.center; Battle.prototype.center = function (b) { const r = _c.call(this, b), B = this.hdwBase; if (B && b && b.hero && b.cx == null) return { x: r.x + B.x, y: r.y + B.y }; return r; }; }
if (typeof K13 !== 'undefined' && K13.ghost) { const _g = K13.ghost; K13.ghost = function (b, dx, dy, ...r) { const B = b && b.hdwBase; return _g.call(this, b, dx + (B ? B.x : 0), dy + (B ? B.y : 0), ...r); }; }
// 站上去以後的往前撲：從站的位置再往前撲一下、回到站的位置（原本的 lunge 最後會把主角放回原位）
{ const _l = Battle.prototype.lunge; Battle.prototype.lunge = function* (b, dist = 10, frames = 5) { const B0 = this.hdwBase, v = b && b.id ? this.views[b.id] || b : b;
    if (!B0 || !v || v !== this.H || !v.off) return yield* _l.call(this, b, dist, frames);
    this.anim(v, 'attack', 5 + frames * 2 + 10); yield* wait(5); const o = v.off, A = this.center(v), B = this.center(this.tgtV || this.F), L = Math.hypot(B.x - A.x, B.y - A.y) || 1, k = Math.min(1, 0.4 + 12 / Math.max(12, dist)), dx = (B.x - A.x) / L * dist * k * 0.6, dy = (B.y - A.y) / L * dist * k * 0.6;
    yield* tween(frames, t => { o.x = B0.x + dx * t; o.y = B0.y + dy * t; }); yield* tween(frames, t => { o.x = B0.x + dx * (1 - t); o.y = B0.y + dy * (1 - t); }); o.x = B0.x; o.y = B0.y;
    if (this.hd18pend && typeof HD18 !== 'undefined') { this.hd18pend = 0; HD18.vanish(this); } }; }
// 出招前移過去：新特效的招（跳躍的落下除外）和特技
for (const id of HD15.ids) { const k = id.slice(2), key = 'hd15_' + k, F = FX[key]; if (!F || HDW.NOSTEP.has(k)) continue;
  FX[key] = function* (U, T, u, t) { if (!u || u === this.H || u.hero) yield* HDW.go(this, T, t, HDW.KOF[k]); return yield* F.call(this, U, T, u, t); }; }
for (const e of HD15.spKeys) { if (/h$/.test(e[0])) continue; const F = e[1]; e[1] = function* (U, T, u, t) { if (!u || u === this.H || u.hero) yield* HDW.go(this, T, t); return yield* F.call(this, U, T, u, t); }; }
// 整招結束：先讓消失的主角在站的位置出現，再走回原位；聲音的武器也在這裡清掉
{ const H = Battle.prototype.handlers, _as = H.ACTION_START, _ae = H.ACTION_END;
  H.ACTION_START = function* (e, s, t, P) { HDW.sk = HDW.live && HD15.on && s && s.hero ? (P && P.skill && HDW.KOF[String(P.skill).slice(2)]) || HDW.kind() : null; return yield* _as.call(this, e, s, t, P); };
  H.ACTION_END = function* (e, s, t, P) { try { if (this.hdwBase) { if (this.hd18hid && typeof HD18 !== 'undefined') { HD18.appear(this); yield* wait(8); }
        if (this.sp20hid && typeof SP20 !== 'undefined') { SP20.show(this); yield* wait(8); } yield* HDW.back(this); }
      return yield* _ae.call(this, e, s, t, P); } finally { HDW.sk = null; } };
  const _u = Battle.prototype.update; Battle.prototype.update = function (...a) { if (this.hdwBase && this.t - (this.hdwT || 0) > 900 && !this.hd18hid && !this.sp20hid) { this.hdwBase = null; const o = this.H && this.H.off; if (o) { o.x = 0; o.y = 0; } } return _u.apply(this, a); }; }
// 每種武器自己的聲音
HDW.SND = {
  長槍: { blade: 'spThrust', bladeQ: 'spThrustQ', bladeBig: 'spThrustBig', slash: 'spThrust', hit: 'spHit', hitSuper: 'spHitSuper', hitWeak: 'spHitWeak', bladeHit: 'spHit', bladeHitSuper: 'spHitSuper', bladeHitWeak: 'spHitWeak' },
  短刀: { hit: 'dgHit', hitSuper: 'dgHitSuper', bladeHit: 'dgHit', bladeHitSuper: 'dgHitSuper' },
  斧: { blade: 'axSwing', bladeQ: 'axSwing', bladeBig: 'axSwing', slash: 'axSwing', hit: 'axHit', hitSuper: 'axHitSuper', hitWeak: 'axHitWeak', bladeHit: 'axHit', bladeHitSuper: 'axHitSuper', bladeHitWeak: 'axHitWeak' },
  拳套: { blade: 'fsSwing', bladeQ: 'fsSwing', bladeBig: 'fsSwing', slash: 'fsSwing', hit: 'fsHit', hitSuper: 'fsHitSuper', hitWeak: 'fsHitWeak', bladeHit: 'fsHit', bladeHitSuper: 'fsHitSuper', bladeHitWeak: 'fsHitWeak' },
  法杖: { slash: 'stBolt', hit: 'stHit', hitSuper: 'stHitSuper', hitWeak: 'stHitWeak', bladeHit: 'stHit', bladeHitSuper: 'stHitSuper', bladeHitWeak: 'stHitWeak' },
  雙盾: { blade: 'shSwing', bladeQ: 'shSwing', bladeBig: 'shSwing', slash: 'shSwing', hit: 'shHit', hitSuper: 'shHitSuper', hitWeak: 'shHitWeak', bladeHit: 'shHit', bladeHitSuper: 'shHitSuper', bladeHitWeak: 'shHitWeak' },
};
HDW.SND.雙刀 = HDW.SND.短刀; HDW.SND.單手盾 = HDW.SND.雙盾;
{ const _sf = Sound.sfx; Sound.sfx = function (n, ...a) { const M = HDW.sk && HDW.SND[HDW.sk]; if (M && M[n]) n = M[n]; return _sf.call(this, n, ...a); }; }
// 主角站上去時會跟對手腳下的名牌疊在一起（主角是背影，畫在名牌下面）：站上去的這段時間名牌淡出，走回來再淡入
{ const _p = KB12.plates; KB12.plates = function (x, a0) { const f = this.hdwFade || 0; if (f >= 0.98) return; return _p.call(this, x, a0 * (1 - f)); };
  const _u = Battle.prototype.update; Battle.prototype.update = function (...a) { const B = this.hdwBase, on = !!(B && (B.y < -8 || Math.abs(B.x) > 30)); this.hdwFade = Math.max(0, Math.min(1, (this.hdwFade || 0) + (on ? 0.15 : -0.1))); return _u.apply(this, a); }; }
