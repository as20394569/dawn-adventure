/* ===================== v12.21 強化・架勢類技能看得出來（玩家 2026-10-05：「雙盾架式沒有明顯的特效與圖示 玩家反應覺得沒有感覺 這類型的技能都檢查」） =====================
   查了 12 棵樹的強化／架勢／反擊類 25 招：用的那一下只有一圈淡淡的光，之後就什麼都看不到——
   16 種狀態（狂刃、狂吼、狂戰之血、迴槍架勢、蓄勁、魔導極限、守護之頁、迴避、和聲、再生、殘影、架劍、劍舞、雙盾架勢、要塞、裂甲）沒有圖示，
   能力升降（物攻 +2 階等）也沒有任何顯示。
   1. 標籤：主角右邊一排小標籤「雙盾架勢 2」「物攻 +2 3」（剩幾回合；盾勢寫層數），魔物名牌下面寫被降的能力和裂甲。
   2. 身上：效果期間一直有樣子——防禦類一圈盾光、攻擊類往上飄火星、速度類殘影、再生飄綠色十字、反擊類武器閃光。
   3. 用的時候：頭上跳大字「雙盾架勢！」＋小字寫效果（受傷 −50%）；盾勢每多一層跳「盾勢 2」。原本的小圖示「防↑」換成標籤（有數字和回合）。
   4. 雙盾架勢本身的特效加強：兩面大盾從左右合起來、震一下。 */
const BUFF12 = {
  frenzy11: { n: '狂刃', k: 'atk', tip: '物攻↑↑・會心 +20%' }, roar11: { n: '狂吼', k: 'atk', tip: '物攻↑・受傷 −10%' }, blood11: { n: '狂戰之血', k: 'atk', tip: '物攻↑↑・攻擊吸血' },
  spearGuard11: { n: '迴槍架勢', k: 'ctr', tip: '物防↑↑・被打就反擊' }, nextPow11: { n: '蓄勁', k: 'atk', tip: '下一擊 +30%' }, maxim11: { n: '魔導極限', k: 'atk', tip: '魔攻↑↑・技能 MP +50%' },
  pageGuard11: { n: '守護之頁', k: 'def', tip: '受傷 −30%' }, evade11: { n: '迴避↑', k: 'spd', tip: '迴避提升' }, harm11: { n: '守護和聲', k: 'def', tip: '受傷 −25%' },
  regen11: { n: '再生', k: 'reg', tip: '每回合回 5% HP' }, shadowCounter11: { n: '殘影', k: 'ctr', tip: '迴避↑・閃過就反擊' }, parry11: { n: '架劍', k: 'ctr', tip: '物理 −60%・反擊' },
  swordDance11: { n: '雙劍舞陣', k: 'spd', tip: '每次攻擊追加一斬' }, shieldStance11: { n: '雙盾架勢', k: 'def', tip: '受傷 −50%・被打得盾勢' }, fortCounter11: { n: '不落要塞', k: 'ctr', tip: '被打就反擊' },
  smoke: { n: '迴避↑', k: 'spd', tip: '迴避 +30%' }, critNext: { n: '心眼', k: 'atk', tip: '下一擊必定會心' }, mirror: { n: '反射壁', k: 'def', tip: '魔法傷害反彈' },
  crack11: { n: '裂甲', k: 'deb', tip: '物防↓・每回合受傷' }, bulk11: { n: '盾勢', k: 'def', tip: '盾突每層 +25%', stacks: 1 },
};
const BUFF_COL12 = { atk: ['#ff9050', 'rgba(90,30,10,0.92)'], def: ['#9ec8ff', 'rgba(20,40,80,0.92)'], spd: ['#7ef0c8', 'rgba(10,60,50,0.92)'], reg: ['#90f090', 'rgba(20,70,20,0.92)'], ctr: ['#ffe070', 'rgba(80,60,10,0.92)'], deb: ['#d0a0ff', 'rgba(50,20,80,0.92)'], up: ['#ffc070', 'rgba(80,45,10,0.92)'], down: ['#a0c0ff', 'rgba(20,30,80,0.92)'] };
const STAGE_N12 = { atk: '物攻', def: '物防', spa: '魔攻', spd: '魔防', spe: '速度', acc: '命中', eva: '迴避', crit: '會心' };
// the pills a unit wears now: [text, kind]
const STAGE_S12 = { atk: '攻', def: '防', spa: '魔攻', spd: '魔防', spe: '速', acc: '命中', eva: '迴避', crit: '會心' };
// (a foe's pills are short — 「攻+1」「裂甲」 — so three fit next to 「弱」; the hero's keep the turns left)
function buffPills12(b, v) { const L = [], st = v.st || {}, D = v.bdur12 || {}, sh = !v.hero;
  for (const id in BUFF12) if (st[id]) { const B = BUFF12[id]; if (v.hero ? B.k === 'deb' : B.k !== 'deb') continue; const d = D[id]; L.push([B.n + (B.stacks ? ' ' + st[id] : d > 0 && !sh ? ' ' + d : ''), B.k]); }
  for (const k in STAGE_N12) { const n = st['stage_' + k]; if (!n) continue; const d = D['stage_' + k]; L.push([(sh ? STAGE_S12[k] : STAGE_N12[k]) + (n > 0 ? '+' : '') + n + (d > 0 && !sh ? ' ' + d : ''), n > 0 ? 'up' : 'down']); }
  return L; }
function buffPill12(x, X, Y, s, k, right) { const [c, bg] = BUFF_COL12[k] || BUFF_COL12.def, w = Math.ceil(Font.width(s, 9)) + 8; if (right) X -= w;
  x.fillStyle = bg; x.fillRect(X, Y, w, 12); x.fillStyle = c; x.fillRect(X, Y, 1, 12); x.fillRect(X + w - 1, Y, 1, 12); x.fillRect(X, Y + 11, w, 1); Font.draw(x, s, X + 4, Y - 2, c, '#000000', 9); return w; }
// turns left come from the battle's own statuses
{ const _sy = Battle.prototype.sync; Battle.prototype.sync = function () { _sy.call(this);
    for (const u of this.core.units) { const v = this.views[u.id]; if (!v) continue; const D = v.bdur12 = {}; for (const s of u.statuses) if (BUFF12[s.id] || /^stage_/.test(s.id)) D[s.id] = s.dur != null ? s.dur : null; } }; }
// 1. the pills: right of the hero (a column), under a foe's name plate
{ const _db = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) { _db.call(this, x); const Hv = this.H; if (!Hv || Math.round(this.boxH) >= BH) return;
    const L = buffPills12(this, Hv).slice(0, 5); if (!L.length) return; const C = this.center(Hv), X = Math.min(W - 4, Math.round(C.x + 30 + Hv.off.x)); let Y = Math.round(HERO_FOOT - 30 - (L.length - 1) * 13 + Hv.off.y);
    for (const [s, k] of L) { const w = Math.ceil(Font.width(s, 9)) + 8; buffPill12(x, Math.min(X, W - 2 - w), Y, s, k); Y += 13; } }; }
{ const _pb = Battle.prototype.drawPlateBig; Battle.prototype.drawPlateBig = function (x, F, a0) { _pb.call(this, x, F, a0); const a = a0 * (F && F.plateA != null ? F.plateA : 1); if (!F || a <= 0) return;
    // v284 (「畫面有點雜亂」): on the 弱 row, right-aligned (where the old 攻↑ icons were) — no longer over the 「護盾中／蓄力中」 line
    const L = buffPills12(this, F); if (!L.length) return; x.globalAlpha = a; const w0 = 120, pe = plateExtra(), X0 = (W - w0) / 2, Y = 6 + 33 + pe, fam = FAMILIES[F.fam];
    const left = X0 + 4 + (fam && fam.weak.length ? Font.width('弱 ' + (this.revealed(F) ? fam.weak.join('・') : '？'), 8) + 12 : 0); let X = X0 + w0 - 2, n = 0;
    for (const [s, k] of L) { const w = Math.ceil(Font.width(s, 9)) + 8, more = L.length - n - 1, mw = more ? Math.ceil(Font.width('+' + more, 9)) + 4 : 0; if (X - w - mw < left) { Font.drawR(x, '+' + (L.length - n), X, Y - 2, '#d8d8e8', '#000000', 9); break; } buffPill12(x, X, Y, s, k, true); X -= w + 2; n++; }
    x.globalAlpha = 1; }; }
// 2. the look while it lasts
{ const _up = Battle.prototype.update; Battle.prototype.update = function () { _up.call(this);
    const Hv = this.H; if (!Hv || Hv.gone || !(Hv.hp > 0)) return; const st = Hv.st || {}, kinds = new Set(); for (const id in BUFF12) if (st[id]) kinds.add(BUFF12[id].k); if (st.stage_atk > 0 || st.stage_spa > 0) kinds.add('atk'); if (st.stage_def > 0 || st.stage_spd > 0) kinds.add('def'); if (st.stage_spe > 0) kinds.add('spd');
    if (!kinds.size) return; const C = this.center(Hv), t = this.t;
    // v284 (「畫面有點雜亂」): quieter — no hexagon around the body, fewer sparks; the pills say what is on
    if (kinds.has('def') && t % 50 === 0) this.star(C.x - 16, C.y + rnd(-4, 8), st.shieldStance11 ? '#c8dcff' : BUFF_COL12.def[0], 10);
    if (kinds.has('atk') && t % 18 === 0) this.spawn({ k: 'flame', x: C.x + rnd(-10, 10), y: C.y + rnd(8, 18), vy: -0.7, s: 2, life: 12 });
    if (kinds.has('spd') && t % 30 === 0) this.spawn({ k: 'line', x1: C.x - 16, y1: C.y + rnd(-10, 10), x2: C.x - 28, y2: C.y + rnd(-10, 10), c: BUFF_COL12.spd[0], w: 1, grow: 3, life: 10 });
    if (kinds.has('reg') && t % 40 === 0) this.spawn({ k: 'txt', s: '+', x: C.x + rnd(-12, 12), y: C.y + rnd(-4, 12), vx: 0, vy: -0.5, c: '#90f090', sh: '#003000', fade: 1, life: 30 });
    if (kinds.has('ctr') && t % 60 === 0) this.star(C.x + 18, C.y - 12, BUFF_COL12.ctr[0], 8); }; }
// 3. a big word when it starts (and 盾勢 as it builds)
{ const H = Battle.prototype.handlers, _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) {
    if (t && !P.failed && !P.cleared && !(P.quiet)) { const B = BUFF12[P.status];
      if (B && B.stacks) { const U = this.core.byId[t.id], n = (U && (this.core.statusOf(U, P.status) || {}).stacks) || 1; this.popNum(t, B.n + ' ' + n, BUFF_COL12[B.k][0], null, { big: true, dy: -20 }); }
      else if (B && (t.hero ? B.k !== 'deb' : B.k === 'deb')) { const [c] = BUFF_COL12[B.k]; this.popNum(t, B.n + '！', c, null, { big: true, dy: -30 }); this.popNum(t, B.tip, c, null, { small: true, dy: -14 }); } }
    return yield* _ap.call(this, e, s, t, P); };
}
// the stat-stage icons (防↑ etc.) are now the pills with numbers and turns
if (typeof drawStageIcons === 'function') drawStageIcons = function () {};
// 4. 雙盾架勢: two big shields close in from both sides
if (FX.t11_shStance) FX.t11_shStance = function* (U, T, u) { Sound.sfx('shield'); const c1 = '#c8dcff', c2 = '#ffffff', X = U.x + 14, Y = U.y - 2;
  for (let i = 0; i < 5; i++) { const o = 26 - i * 5; this.spawn({ k: 'hex', x: X - o, y: Y, r0: 14, r1: 14, c: c1, life: 3 }); this.spawn({ k: 'hex', x: X + o, y: Y, r0: 14, r1: 14, c: c1, life: 3 }); yield; }
  Sound.sfx('heavy'); this.shake = Math.max(this.shake || 0, 6); this.spawn({ k: 'flash', c: '#c8dcff', a: 0.25, life: 6 });
  this.spawn({ k: 'hex', x: X - 6, y: Y, r0: 16, r1: 18, c: c2, life: 22 }); this.spawn({ k: 'hex', x: X + 6, y: Y, r0: 16, r1: 18, c: c1, life: 22 });
  this.spawn({ k: 'shock', x: X, y: Y, r0: 6, r1: 40, c: c1, life: 14 }); this.spawn({ k: 'line', x1: X, y1: Y - 26, x2: X, y2: Y + 26, c: c2, w: 3, grow: 4, life: 18 }); yield* wait(14); };
