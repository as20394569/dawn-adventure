/* ===================== v12.110 近戰武器的第一段魔法招（特效測試版） =====================
   玩家 2026-10-10：「是不是要新增一些打魔法傷害的技能」→「多新招」「（雙盾・單手盾）要」。
   9 棵近戰樹的第一段多一格（1d，Lv1 就能學）：便宜的魔法招，打魔防，攻擊力用物攻和魔攻較高的一項（跟 v12.107 的魔法招一樣）。
   特效照各武器的主色，但都是「魔力」的樣子：手邊先聚光（小魔法陣），再把武器的力量化成光打出去，站在原地放（不衝上去）。
   先只在特效測試版（window.FXTEST）；玩家看過說好才放進正式版（MAG15.live）。 */
const MAG15 = { live: typeof fxtest13 === 'function' && fxtest13() };
const MAGT15 = '魔法傷害（打對手的魔防），用物攻和魔攻較高的一項計算。';
const MAG_SK15 = { // kind: [key, name, power, hits, cd, mp, desc]
  劍: ['sdLight', '光刃', 50, 0, 1, 3, '揮劍放出一道光的劍氣。'],
  短刀: ['dgShadeNeedle', '影針', 26, 2, 1, 3, '射出兩根暗影之針。'],
  斧: ['axRune', '符文劈', 55, 0, 1, 3, '斧刃上的符文發光，劈出一道熔岩色的魔力，在對手身上炸開。'],
  長槍: ['spGleam', '蒼光刺', 50, 0, 1, 3, '槍尖凝出蒼藍的光，一刺射出去。'],
  拳套: ['fsPalm', '氣掌', 50, 0, 1, 3, '把氣凝在掌心，一掌推出一團氣。'],
  雙刀: ['ddTwinShade', '雙影刃', 26, 2, 1, 3, '雙手各甩出一道暗影刃，在對手身上交叉。'],
  雙劍: ['dsCrossLight', '交叉光刃', 26, 2, 1, 3, '兩把劍各放出一道劍氣（一白一黑），在對手身上交叉。'],
  雙盾: ['shHoly', '聖光盾擊', 50, 0, 1, 3, '在對手頭上召出一面聖光之盾，重重壓下。'],
  單手盾: ['osLight', '光盾衝', 50, 0, 1, 3, '盾面的光化成一道光盾射出去。'],
};
BR.FORMULA.magAtk15 = BR.FORMULA.magAtk15 || (c => { const S = c.src.stats; return Math.max(S.atk, S.spa) / Math.max(1, S.spa); });
function magicize15(id) { const D = DEF.skills[id]; if (!D) return; delete D.catOf; D.cat = '特'; D.tags = D.tags.map(t => t === 'phys' ? 'magic' : t); if (MOVES[id]) MOVES[id].cat = '特';
  D.mods.push({ stage: 'skill', who: 'attacker', atkMul: { f: 'magAtk15' }, cond: { srcIsHero: 1 } });
  const i = D.mods.findIndex(m => m.mul && m.mul.f === 'attrScale'); if (i >= 0) { const m = D.mods[i];
    D.mods.splice(i, 1, { ...m, cond: { ...m.cond, magHi15: 0 } }, { ...m, mul: { f: 'attrScale', v: ['int', 1] }, cond: { ...m.cond, magHi15: 1 } }); } }
if (MAG15.live) for (const kind in MAG_SK15) { const T = TREE11[kind]; if (!T) { bvErr('mag15', kind); continue; } const [k, n, pow, hits, cd, mp, d] = MAG_SK15[kind];
  const row = ['1d', k, n, pow, hits, cd, mp, 0, d + MAGT15, { cls: 'bolt' }], old = T.sk; T.sk = [row];
  try { sk11Build(kind); } finally { const i = old.reduce((a, s, j) => s[0][0] === '1' ? j : a, -1); T.sk = old.slice(0, i + 1).concat([row], old.slice(i + 1)); }
  magicize15('t_' + k); }

/* ---------- 特效 ---------- */
const MAGFX15 = {
  sdLight: { *f(U, T, u) { const P = HD15.P.white, H = DS16.hands(this).R; Sound.sfx('stCast'); HD15.gather(this, H, 12, HD15.P.steel, 26, { span: 10 }); ST23.circle(this, H, 12, HD15.P.steel, { fl: 1, hold: 16, spin: 0.1 }); yield* wait(12);
      Sound.sfx('blade'); HD15.slash(this, { x: H.x + 10, y: H.y - 14 }, { pal: P, r: 34, th: 9, ang: -0.7, span: 1.4, dur: 14 }); HD15.comet(this, H, T, P, 12, { w: 11 }); HD15.comet(this, H, T, HD15.P.steel, 12, { w: 5, delay: 1 }); yield* wait(12);
      Sound.sfx('stHit'); HD15.stop(this, 3); HD15.cut(this, T, -0.7, 70, P, { dur: 18, w: 7 }); HD15.flash(this, T, HD15.P.steel, 30); HD15.ring(this, T, P, 4, 26, { w: 2, dur: 14 }); HD15.sparks(this, T, 14, P, { spd: 3.4, life: 18, g: 0.06 }); yield* wait(16); } },
  dgShadeNeedle: { *f(U, T, u) { const P = HD15.P.shade || HD15.P.arcane, B = HD15.P.black, H = DS16.hands(this).R; Sound.sfx('stCast'); HD15.gather(this, H, 10, P, 22, { span: 8 }); yield* wait(10);
      for (let i = 0; i < 2; i++) { const o = i ? 7 : -7; Sound.sfx('dgHit'); HD15.comet(this, { x: H.x, y: H.y + o }, { x: T.x + o, y: T.y - o }, P, 9, { w: 7 }); HD15.comet(this, { x: H.x, y: H.y + o }, { x: T.x + o, y: T.y - o }, B, 9, { w: 3, delay: 1 }); yield* wait(9);
        HD15.flash(this, { x: T.x + o, y: T.y - o }, P, 26, { dur: 12 }); HD15.flare(this, { x: T.x + o, y: T.y - o }, P, 30, { rot: 0.6, dur: 12 }); HD15.sparks(this, { x: T.x + o, y: T.y - o }, 7, P, { spd: 2.6, life: 14 }); yield* wait(4); }
      yield* wait(10); } },
  axRune: { *f(U, T, u) { const P = HD15.P.lava, H = DS16.hands(this).R; Sound.sfx('stCast'); ST23.circle(this, H, 13, P, { fl: 1, hold: 18, spin: 0.08 }); HD15.gather(this, H, 12, P, 26, { span: 10 }); yield* wait(12);
      Sound.sfx('axSwing'); HD15.comet(this, H, T, P, 12, { w: 13 }); yield* wait(10); ST23.circle(this, T, 22, P, { fl: 1, hold: 14, spin: 0.12 }); yield* wait(8);
      Sound.sfx('axHit'); HD15.stop(this, 4); HD15.flare(this, T, P, 50, { rot: Math.PI / 4, dur: 16 }); HD15.ring(this, T, P, 6, 34, { w: 2.4, dur: 16 }); HD15.spikes(this, T, P, 8, 22, { rot: 0.2 }); HD15.sparks(this, T, 16, P, { spd: 3.8, life: 20, g: 0.1 }); this.shake = Math.max(this.shake || 0, 5); yield* wait(16); } },
  spGleam: { *f(U, T, u) { const P = HD15.P.lance, H = DS16.hands(this).R, d = SP20.dir(H, T); Sound.sfx('stCast'); ST23.circle(this, H, 12, P, { fl: 1, hold: 16, spin: 0.1 }); HD15.gather(this, H, 10, P, 24, { span: 10 }); yield* wait(12);
      Sound.sfx('spThrust'); HD15.thrust(this, H, T, P, { w: 10, ext: 26, dur: 18 }); HD15.thrust(this, H, T, HD15.P.white, { w: 3, ext: 22, dur: 16, delay: 1 }); yield* wait(6);
      Sound.sfx('spHit'); HD15.stop(this, 3); HD15.flash(this, T, P, 30); SP20.through(this, T, d, 30, { w: 5 }); HD15.ring(this, T, P, 4, 26, { w: 2, dur: 14 }); yield* wait(16); } },
  fsPalm: { *f(U, T, u) { const P = HD15.P.ki, H = DS16.hands(this).R, d = SP20.dir(H, T); Sound.sfx('fsQi'); AF22.palm(this, H, Math.atan2(d.uy, d.ux), { hold: 14 }); HD15.gather(this, H, 12, P, 24, { span: 10 }); yield* wait(12);
      Sound.sfx('fsSwing'); HD15.comet(this, H, T, P, 12, { w: 15 }); yield* wait(11);
      Sound.sfx('fsHit'); HD15.stop(this, 3); AF22.orb(this, T, P, 18, 16); AF22.wave(this, T, d, 1); HD15.ring(this, T, P, 6, 30, { w: 2.2, dur: 16 }); HD15.sparks(this, T, 12, P, { spd: 3.2, life: 18 }); yield* wait(16); } },
  ddTwinShade: { *f(U, T, u) { const P = HD15.P.shade || HD15.P.arcane, B = HD15.P.black, H = DS16.hands(this); Sound.sfx('stCast'); HD15.gather(this, H.R, 8, P, 20, { span: 8 }); HD15.gather(this, H.L, 8, P, 20, { span: 8 }); yield* wait(10);
      Sound.sfx('dgHit'); HD15.comet(this, H.R, T, P, 11, { w: 6 }); HD15.comet(this, H.L, T, B, 11, { w: 5, delay: 3 }); yield* wait(12);
      Sound.sfx('dgHitSuper'); HD15.stop(this, 3); HD15.cut(this, T, 0.8, 64, P, { dur: 16, w: 6 }); HD15.cut(this, T, -0.8, 64, P, { dur: 16, w: 6, delay: 2 }); HD15.flash(this, T, P, 24); HD15.sparks(this, T, 12, P, { spd: 3, life: 16 }); yield* wait(16); } },
  dsCrossLight: { *f(U, T, u) { const W = HD15.P.white, B = HD15.P.black, H = DS16.hands(this); Sound.sfx('stCast'); HD15.gather(this, H.R, 8, W, 20, { span: 8 }); HD15.gather(this, H.L, 8, HD15.P.steel, 20, { span: 8 }); yield* wait(10);
      Sound.sfx('blade'); HD15.comet(this, H.R, T, W, 11, { w: 8 }); HD15.comet(this, H.L, T, B, 11, { w: 7, delay: 3 }); yield* wait(12);
      Sound.sfx('stHit'); HD15.stop(this, 3); HD15.cut(this, T, 0.8, 70, W, { dur: 18, w: 7 }); HD15.cut(this, T, -0.8, 70, B, { dur: 18, w: 7, delay: 2 }); HD15.flash(this, T, W, 28); HD15.ring(this, T, W, 4, 24, { w: 2, dur: 14 }); yield* wait(16); } },
  shHoly: { *f(U, T, u) { const P = HD15.P.holy, H = DS16.hands(this).Hc; Sound.sfx('stCast'); HD15.gather(this, { x: H.x, y: H.y - 12 }, 12, P, 26, { span: 10 }); yield* wait(10);
      Sound.sfx('shSwing'); SH24.plate(this, { x: T.x, y: T.y - 30 }, P, { s: 1.5, dur: 20, hold: 0.5, shine: 1, from: { x: 0, y: -26 }, mv: 26 }); yield* wait(12);
      Sound.sfx('shHitSuper'); HD15.stop(this, 4); HD15.flash(this, T, P, 34); HD15.ring(this, T, P, 6, 34, { w: 2.4, dur: 16 }); HD15.spikes(this, T, P, 8, 24, { rot: 0.4 }); HD15.sparks(this, T, 14, P, { spd: 3.4, life: 18 }); this.shake = Math.max(this.shake || 0, 5); yield* wait(16); } },
  osLight: { *f(U, T, u) { const P = HD15.P.silver, H = DS16.hands(this).Hc, F = { x: H.x + 8, y: H.y - 16 }; Sound.sfx('stCast'); SH24.plate(this, F, P, { s: 1.1, dur: 18, hold: 0.6, shine: 1 }); HD15.gather(this, F, 10, P, 22, { span: 8 }); yield* wait(12);
      Sound.sfx('shSwing'); HD15.comet(this, F, T, P, 11, { w: 12 }); yield* wait(10); SH24.plate(this, T, P, { s: 1.2, dur: 14, hold: 0.4 });
      Sound.sfx('shHit'); HD15.stop(this, 3); HD15.flash(this, T, P, 28); HD15.ring(this, T, P, 4, 26, { w: 2, dur: 14 }); HD15.sparks(this, T, 12, HD15.P.white, { spd: 3, life: 16 }); yield* wait(16); } },
};
if (MAG15.live) for (const k in MAGFX15) { const id = 't_' + k, D = DEF.skills[id], F = MAGFX15[k]; if (!D) continue; const key = 'hd15_' + k;
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; }
    if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: false }; HD15.ids.push(id);
  if (HD15.on) { D.fx = key; if (MOVES[id]) MOVES[id].fx = key; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = ['draw', null, 'steel', null]; if (typeof REDO13 !== 'undefined') REDO13.add(id); } }
