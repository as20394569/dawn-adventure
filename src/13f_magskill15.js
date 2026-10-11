/* ===================== v12.110 近戰武器的第一段魔法招（特效測試版） =====================
   玩家 2026-10-10：「是不是要新增一些打魔法傷害的技能」→「多新招」「（雙盾・單手盾）要」。
   9 棵近戰樹的第一段多一格（1d，Lv1 就能學）：便宜的魔法招，打魔防，攻擊力用物攻和魔攻較高的一項（跟 v12.107 的魔法招一樣）。
   特效：v12.112 玩家「表示方式過於魔法」→ 不再聚光・畫魔法陣・射光彈，改成那把武器本來的動作（衝上去砍・刺・劈・掌・撞），
   只有武器出手前閃一下、刀光帶著光／影／熔岩的顏色，看得出是「帶魔力的武器招」。
   v12.114 玩家同意「新的魔法招太省 MP」→ MP 3 改 6（還是第一段最便宜的，但不會壓過普攻換 MP 的打法）。
   先只在特效測試版（window.FXTEST）；玩家看過說好才放進正式版（MAG15.live）。 */
const MAG15 = { live: true }; // v12.122 玩家「特效測試全部放上正式版」
const MAGT15 = '魔法傷害（打對手的魔防），用物攻和魔攻較高的一項計算。';
const MAG_SK15 = { // kind: [key, name, power, hits, cd, mp, desc]
  劍: ['sdLight', '光刃', 50, 0, 1, 6, '揮劍斬出一道光的劍氣，飛過去砍中對手。'],
  短刀: ['dgShadeNeedle', '影針', 26, 2, 1, 6, '短刀帶著暗影，快刺兩下。'],
  斧: ['axRune', '符文劈', 55, 0, 1, 6, '斧刃上的符文一亮，一斧劈下去，劈中的地方迸出熔岩色的光。'],
  長槍: ['spGleam', '蒼光刺', 50, 0, 1, 6, '槍尖帶著蒼藍的光，一刺貫穿。'],
  拳套: ['fsPalm', '氣掌', 50, 0, 1, 6, '把氣凝在掌心，一掌打在對手身上，氣從背後透出去。'],
  雙刀: ['ddTwinShade', '雙影刃', 26, 2, 1, 6, '雙刀帶著暗影，一左一右交叉斬下。'],
  雙劍: ['dsCrossLight', '交叉光刃', 26, 2, 1, 6, '兩把劍（一白一黑）帶著光，交叉斬下。'],
  雙盾: ['shHoly', '聖光盾擊', 50, 0, 1, 6, '雙盾帶著聖光，從兩側重重夾擊。'],
  單手盾: ['osLight', '光盾衝', 50, 0, 1, 6, '盾面發光，往前一撞。'],
};
const MAGCLS15 = { 劍: 'slash', 短刀: 'pierce', 斧: 'strike', 長槍: 'pierce', 拳套: 'strike', 雙刀: 'slash', 雙劍: 'slash', 雙盾: 'strike', 單手盾: 'strike' }; // v12.112 武器的動作（原本是 bolt＝施法）
BR.FORMULA.magAtk15 = BR.FORMULA.magAtk15 || (c => { const S = c.src.stats; return Math.max(S.atk, S.spa) / Math.max(1, S.spa); });
function magicize15(id) { const D = DEF.skills[id]; if (!D) return; delete D.catOf; D.cat = '特'; D.tags = D.tags.map(t => t === 'phys' ? 'magic' : t); if (MOVES[id]) MOVES[id].cat = '特';
  D.mods.push({ stage: 'skill', who: 'attacker', atkMul: { f: 'magAtk15' }, cond: { srcIsHero: 1 } });
  const i = D.mods.findIndex(m => m.mul && m.mul.f === 'attrScale'); if (i >= 0) { const m = D.mods[i];
    D.mods.splice(i, 1, { ...m, cond: { ...m.cond, magHi15: 0 } }, { ...m, mul: { f: 'attrScale', v: ['int', 1] }, cond: { ...m.cond, magHi15: 1 } }); } }
if (MAG15.live) for (const kind in MAG_SK15) { const T = TREE11[kind]; if (!T) { bvErr('mag15', kind); continue; } const [k, n, pow, hits, cd, mp, d] = MAG_SK15[kind];
  const row = ['1d', k, n, pow, hits, cd, mp, 0, d + MAGT15, { cls: MAGCLS15[kind] || 'slash' }], old = T.sk; T.sk = [row];
  try { sk11Build(kind); } finally { const i = old.reduce((a, s, j) => s[0][0] === '1' ? j : a, -1); T.sk = old.slice(0, i + 1).concat([row], old.slice(i + 1)); }
  magicize15('t_' + k); }

/* ---------- 特效 ---------- */
const glint15 = (b, P, R) => { const H = R || DS16.hands(b).R; HD15.flash(b, { x: H.x + 2, y: H.y - 10 }, P, 18, { dur: 8 }); for (let i = 0; i < 4; i++) HD15.mote(b, H.x + 2, H.y - 10, (Math.random() - 0.5) * 1.2, -0.3 - Math.random() * 0.6, P, { life: 12 }); };
// 劍氣：新月形的光往前飛（凸的那邊朝前），越飛越大，留一點殘影
HD15.wave = (b, A, B, pal, o = {}) => { pal = HD15.W(pal); const dl = o.delay || 0, dur = o.dur || 12, an = Math.atan2(B.y - A.y, B.x - A.x), hist = [];
  return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur + 6,
    upd: p => { const t = p.t - dl; if (t < 0) return; const k = HD15.cl(t / dur), e = k * (0.4 + 0.6 * k); p.x = A.x + (B.x - A.x) * e; p.y = A.y + (B.y - A.y) * e; if (k < 1) { hist.push([p.x, p.y, k]); if (hist.length > 3) hist.shift(); } },
    draw: (x, p, k, t) => { if (t < 0) return; const f = t >= dur ? 1 - HD15.cl((t - dur) / 6) : 1, arc = (cx, cy, kk, al) => { const R = (o.r0 || 10) + ((o.r1 || 20) - (o.r0 || 10)) * kk, C = { x: cx - Math.cos(an) * R * 0.55, y: cy - Math.sin(an) * R * 0.55 };
        for (const [w, c, a, op] of [[R * 0.5, pal.glow, 0.35, 'lighter'], [R * 0.3, pal.edge, 0.5, 'source-over'], [R * 0.22, pal.mid, 1, 'source-over'], [R * 0.08, pal.core, 1, 'source-over']]) {
          x.globalCompositeOperation = op; x.globalAlpha = al * a * f; x.lineCap = 'round'; x.lineWidth = Math.max(1, w); x.strokeStyle = c; x.beginPath(); x.arc(C.x, C.y, R, an - 1.05, an + 1.05); x.stroke(); }
        x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; };
      hist.forEach(([hx, hy, hk], i) => arc(hx, hy, hk, 0.25 + i * 0.15)); arc(p.x, p.y, HD15.cl(t / dur), 1); } }); };
const MAGFX15 = {
  // 光刃：劍身一亮 → 衝上去斜斬（金白的刀光＋一道淡淡的殘光）→ 停格、小閃光
  // 光刃（v12.115 玩家「光刃幫我改成劍氣」）：劍身一亮 → 原地揮劍 → 一道新月形的光劍氣飛過去 → 砍中、停格、小閃光
  sdLight: { *f(U, T, u) { const P = HD15.P.holy, H = DS16.hands(this).R; glint15(this, P); this.anim(u, 'attack', 20); yield* wait(4);
      Sound.sfx('blade'); HD15.slash(this, { x: H.x + 8, y: H.y - 12 }, { pal: P, r: 26, th: 7, ang: -0.67, span: 1.4, dur: 14 });
      HD15.wave(this, { x: H.x + 4, y: H.y - 14 }, T, P, { dur: 11, r0: 10, r1: 20 }); yield* wait(11);
      Sound.sfx('stHit'); HD15.stop(this, 4); HD15.slash(this, T, { pal: P, r: 52, th: 10, ang: -0.67, span: 1.4, dur: 18, spark: 1 }); HD15.flash(this, T, P, 26, { dur: 10 }); HD15.sparks(this, T, 10, P, { spd: 3, life: 16 }); yield* wait(14); } },
  // 影針：刀身一暗 → 帶著殘影衝上去，快刺兩下（紫黑的刺擊）
  dgShadeNeedle: { *f(U, T, u) { const P = HD15.P.shade; glint15(this, P); Sound.sfx('wind'); if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 2; i++) K13.ghost(this, 0, -i * 12, '#b080ff', 6 + i * 3, 0.45);
      yield* this.lunge(u, 22, 1);
      for (let i = 0; i < 2; i++) { Sound.sfx('bladeQ'); DG17.stab(this, T, { k: i, ang: i ? -1.89 : -1.25, L: 32, w: 5 }); yield* wait(3); HD15.stop(this, 2); DG17.pop(this, { x: T.x + (i ? 5 : -5), y: T.y + (i ? -4 : 4) }, 0.8); yield* wait(5); }
      yield* wait(8); } },
  // 符文劈：舉斧、斧刃一亮 → 一斧直劈（熔岩色的刀光）→ 停格、劈中的地方迸出熔岩色的光、地面震
  axRune: { *f(U, T, u) { const P = HD15.P.lava, v = DG17.vAt(this, T), ft = AX21.foot(this, v, T); AX21.raise(this, 8); glint15(this, P); Sound.sfx('axSwing'); yield* AX21.heave.call(this, this, 8, 6);
      AX21.cleave(this, T, 'v', { r: 50, th: 15, span: 1.8, dur: 24, pal: P }); yield* wait(5); Sound.sfx('axHitSuper'); HD15.stop(this, 5);
      HD15.flash(this, T, P, 40, { dur: 14 }); HD15.spikes(this, T, P, 6, 20, { rot: 0.2 }); HD15.sparks(this, T, 12, P, { spd: 3.4, life: 18, g: 0.1 }); AX21.ground(this, { x: T.x, y: ft }, 0.8); this.shake = Math.max(this.shake || 0, 7); yield* wait(16); } },
  // 蒼光刺：槍尖一亮 → 衝上去一刺（蒼藍的槍光）→ 光從背後穿出去
  spGleam: { *f(U, T, u) { const P = HD15.P.lance; glint15(this, P); yield* this.lunge(u, 18, 2); Sound.sfx('spThrust'); const d = SP20.lance(this, T, { w: 8, ext: 34, pal: P }); yield* wait(4);
      Sound.sfx('spHit'); HD15.stop(this, 4); HD15.flash(this, T, P, 30, { dur: 12 }); HD15.sparks(this, T, 9, P, { ang: d.an, spread: 0.6, spd: 4, life: 16 }); SP20.through(this, T, d, 40); this.shake = Math.max(this.shake || 0, 4); yield* wait(14); } },
  // 氣掌：掌心一亮 → 衝上去一掌（金色的掌印打在身上）→ 氣從背後透出去
  fsPalm: { *f(U, T, u) { const P = HD15.P.ki, d = AF22.dir(this, T); glint15(this, P); Sound.sfx('fsSwing'); yield* this.lunge(u, 12, 2);
      AF22.palm(this, { x: T.x - d.ux * 8, y: T.y - d.uy * 8 }, Math.atan2(d.uy, d.ux), { hold: 12 }); yield* wait(2); Sound.sfx('fsHitSuper'); HD15.stop(this, 5);
      AF22.wave(this, T, d, 1.1); HD15.flash(this, T, P, 28, { dur: 12 }); HD15.sparks(this, T, 10, P, { spd: 3, life: 16 }); this.shake = Math.max(this.shake || 0, 5); yield* wait(14); } },
  // 雙影刃：雙刀一暗 → 衝上去，左右各一刀交叉（紫・黑）
  ddTwinShade: { *f(U, T, u) { const P = HD15.P.shade, H = DS16.hands(this); glint15(this, P, H.R); glint15(this, HD15.P.black, H.L); Sound.sfx('wind'); yield* this.lunge(u, 18, 2);
      Sound.sfx('bladeQ'); HD15.cut(this, T, 0.8, 62, P, { dur: 16, w: 6 }); yield* wait(4); HD15.stop(this, 2); Sound.sfx('bladeQ'); HD15.cut(this, T, -0.8, 62, HD15.P.black, { dur: 16, w: 6 }); yield* wait(3);
      HD15.stop(this, 3); DG17.pop(this, T, 1); yield* wait(12); } },
  // 交叉光刃：兩把劍一亮 → 衝上去，白的一刀、黑的一刀交叉
  dsCrossLight: { *f(U, T, u) { const H = DS16.hands(this); glint15(this, HD15.P.white, H.R); glint15(this, HD15.P.violet, H.L); yield* this.lunge(u, 16, 2); Sound.sfx('blade');
      DS16.cut(this, T, 'dr', { r: 52, th: 11, span: 1.7, dur: 20 }); yield* wait(4); Sound.sfx('blade'); DS16.cut(this, T, 'dl', { k: 1, r: 52, th: 11, span: 1.7, dur: 20 }); yield* wait(3);
      Sound.sfx('stHit'); HD15.stop(this, 3); HD15.flash(this, T, HD15.P.white, 28, { dur: 10 }); HD15.sparks(this, T, 9, HD15.P.white, { spd: 3, life: 14 }); yield* wait(12); } },
  // 聖光盾擊：兩面盾帶著金光衝上去，從兩側夾擊
  shHoly: { *f(U, T, u) { const P = HD15.P.holy; glint15(this, P, DS16.hands(this).Hc); Sound.sfx('shSwing'); yield* this.lunge(u, 10, 3);
      SH24.plate(this, { x: T.x - 10, y: T.y }, P, { s: 1.1, from: { x: -30, y: 6 }, mv: 6, dur: 20, rot: 0.25, shine: 1 }); SH24.plate(this, { x: T.x + 10, y: T.y }, P, { s: 1.1, from: { x: 30, y: 6 }, mv: 6, dur: 20, rot: -0.25, shine: 1 }); yield* wait(6);
      Sound.sfx('shHitSuper'); HD15.stop(this, 4); SH24.slam(this, T, 1.1, { pal: P, d: { an: -Math.PI / 2, ux: 0, uy: -1 } }); this.shake = Math.max(this.shake || 0, 6); yield* wait(14); } },
  // 光盾衝：盾面一亮 → 衝上去用盾一撞（銀白的光）
  osLight: { *f(U, T, u) { const P = HD15.P.silver; glint15(this, P, DS16.hands(this).Hc); yield* this.lunge(u, 14, 3);
      const d = SH24.dir(this, T), H = DS16.hands(this).Hc; Sound.sfx('shSwing'); SH24.plate(this, { x: T.x - d.ux * 8, y: T.y - d.uy * 8 }, P, { s: 1.2, from: { x: H.x + d.ux * 18 - T.x, y: H.y + d.uy * 18 - T.y }, mv: 6, dur: 22, shine: 1 }); yield* wait(6);
      Sound.sfx('shHit'); HD15.stop(this, 3); SH24.slam(this, T, 1.1, { pal: P, d }); this.shake = Math.max(this.shake || 0, 4); yield* wait(14); } },
};
if (MAG15.live) for (const k in MAGFX15) { const id = 't_' + k, D = DEF.skills[id], F = MAGFX15[k]; if (!D) continue; const key = 'hd15_' + k;
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; }
    if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: false }; HD15.ids.push(id);
  if (HD15.on) { D.fx = key; D.hitFx = null; if (MOVES[id]) MOVES[id].fx = key; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = ['draw', null, 'steel', null]; if (typeof REDO13 !== 'undefined') REDO13.add(id); } }
