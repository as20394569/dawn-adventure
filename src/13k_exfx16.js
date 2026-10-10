/* ===================== v12.116 EX 技能的特效（玩家「EX技能樹特效與招式名稱採用全新製作」） =====================
   每棵樹一套自己的形狀和顏色：晨星誓約＝金白的星芒與光柱、緋月劍譜＝緋紅的新月與月刃、天籟樂章＝青綠的音符與音波、
   蒸汽機巧＝銅色的齒輪・蒸汽・火藥、霜嶺心法＝冰藍的雪花與冰晶、蒼穹龍脈＝蒼藍的龍爪・龍鱗・蒼焰。 */
const HD16 = {};
Object.assign(HD15.P, {
  star16: { core: '#ffffff', mid: '#fff3c0', glow: '#ffc93a', edge: '#6a4a0a', keep: 1 },
  moon16: { core: '#ffe8ec', mid: '#ff5a72', glow: '#c0102e', edge: '#3a0410', keep: 1 },
  moonDark16: { core: '#ffd0dc', mid: '#a0204a', glow: '#5a0624', edge: '#16020a', keep: 1 },
  song16: { core: '#ffffff', mid: '#b8f4f0', glow: '#38d0c0', edge: '#063a38', keep: 1 },
  lull16: { core: '#f4f0ff', mid: '#b8b0ff', glow: '#6a5ae0', edge: '#140c40', keep: 1 },
  brass16: { core: '#fff6d0', mid: '#e8b850', glow: '#b07818', edge: '#3a2806', keep: 1 },
  steam16: { core: '#fff4e0', mid: '#ffb060', glow: '#e86a10', edge: '#3a1a04', keep: 1 },
  frost16: { core: '#ffffff', mid: '#d6f6ff', glow: '#5ec4ff', edge: '#0a2a52', keep: 1 },
  drake16: { core: '#ffffff', mid: '#86e4ff', glow: '#1a88ff', edge: '#06204a', keep: 1 },
  azureFire16: { core: '#ffffff', mid: '#a4ecff', glow: '#2a6cff', edge: '#0a1648', keep: 1 },
});
// 形狀的上色：外發光（相加）→ 暗邊 → 主色 → 亮芯，跟其他新特效同一套
HD16.fill = (x, path, pal, al, sc = 1) => { x.globalAlpha = Math.min(1, al); x.globalCompositeOperation = 'lighter'; path(1.35 * sc); x.fillStyle = HD15.rgba(pal.glow, 0.42); x.fill();
  x.globalCompositeOperation = 'source-over'; path(1.08 * sc); x.fillStyle = HD15.rgba(pal.edge, 0.55); x.fill(); path(sc); x.fillStyle = pal.mid; x.fill(); path(0.45 * sc); x.fillStyle = pal.core; x.fill(); x.globalAlpha = 1; };
HD16.line = (x, path, pal, al, w) => { x.globalAlpha = Math.min(1, al); x.lineJoin = 'round'; x.lineCap = 'round'; x.globalCompositeOperation = 'lighter'; x.lineWidth = w * 2.4 + 2; x.strokeStyle = HD15.rgba(pal.glow, 0.42); path(); x.stroke();
  x.globalCompositeOperation = 'source-over'; x.lineWidth = w + 1.4; x.strokeStyle = HD15.rgba(pal.edge, 0.6); path(); x.stroke(); x.lineWidth = w; x.strokeStyle = pal.mid; path(); x.stroke(); x.lineWidth = Math.max(0.8, w * 0.35); x.strokeStyle = pal.core; path(); x.stroke(); x.globalAlpha = 1; };
const life16 = (k, a = 0.25, b = 0.7) => HD15.eo(HD15.cl(k / a)) * (1 - HD15.ei(HD15.cl((k - b) / (1 - b))));
// 星芒（n 角）：長出來、轉、淡掉
HD16.star = (b, C, pal, R, o = {}) => { const dl = o.delay || 0, n = o.n || 4, rot0 = o.rot || 0, inner = o.inner || 0.26; return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + (o.dur || 24),
  draw: (x, p, k) => { const g = life16(k, 0.3, 0.6), rot = rot0 + k * (o.spin || 0); if (g <= 0) return;
    HD16.fill(x, s => { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = (i % 2 ? R * inner : R) * s * (0.4 + 0.6 * g); x.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r); } x.closePath(); }, pal, g); } }); };
// 新月：凸的那邊朝 rot
HD16.moon = (b, C, pal, R, o = {}) => { const dl = o.delay || 0, rot = o.rot ?? -Math.PI / 2; return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + (o.dur || 30),
  draw: (x, p, k) => { const g = life16(k, o.grow || 0.3, o.fade || 0.65) * (o.al || 1); if (g <= 0) return; const ux = Math.cos(rot), uy = Math.sin(rot);
    HD16.fill(x, s => { const r = R * s; x.beginPath(); x.arc(p.x, p.y, r, rot - 1.95, rot + 1.95); x.arc(p.x - ux * r * 0.42, p.y - uy * r * 0.42, r * 0.86, rot + 1.75, rot - 1.75, true); x.closePath(); }, pal, g); } }); };
// 音符：沿著一條波浪線飛
HD16.note = (b, A, B, pal, o = {}) => { const dl = o.delay || 0, dur = o.dur || 18, wob = o.wob ?? 8, ph = Math.random() * 6; return HD15.add(b, { x: A.x, y: A.y, delay: dl, life: dl + dur + 8,
  upd: p => { const t = p.t - dl; if (t < 0) return; const k = HD15.cl(t / dur), e = HD15.eo(k); p.x = A.x + (B.x - A.x) * e + Math.sin(k * 7 + ph) * wob; p.y = A.y + (B.y - A.y) * e; },
  draw: (x, p, k, t) => { const f = t > dur ? 1 - HD15.cl((t - dur) / 8) : HD15.cl(t / 4), s = o.s || 1;
    HD16.fill(x, q => { x.beginPath(); x.ellipse(p.x, p.y, 3.2 * s * q, 2.4 * s * q, -0.4, 0, Math.PI * 2); }, pal, f);
    HD16.line(x, () => { x.beginPath(); x.moveTo(p.x + 2.8 * s, p.y - 0.5 * s); x.lineTo(p.x + 2.8 * s, p.y - 10 * s); x.quadraticCurveTo(p.x + 6 * s, p.y - 8 * s, p.x + 7 * s, p.y - 4 * s); }, pal, f, 1.1 * s); } }); };
// 齒輪：轉動
HD16.gear = (b, C, pal, R, o = {}) => { const dl = o.delay || 0, n = o.n || 8; return HD15.add(b, { x: C.x, y: C.y, delay: dl, life: dl + (o.dur || 30),
  draw: (x, p, k) => { const g = life16(k, 0.2, o.fade || 0.75), rot = (o.rot || 0) + k * (o.spin ?? 2.4); if (g <= 0) return; const r1 = R * (0.6 + 0.4 * g), r0 = r1 * 0.78;
    HD16.line(x, () => { x.beginPath(); for (let i = 0; i < n * 4; i++) { const a = rot + i * Math.PI * 2 / (n * 4), r = Math.floor(i / 2) % 2 ? r0 : r1; x.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r); } x.closePath(); x.moveTo(p.x + r1 * 0.32, p.y); x.arc(p.x, p.y, r1 * 0.32, 0, Math.PI * 2); }, pal, g, 1.6); } }); };
// 龍鱗：一片片菱形在身邊浮起
HD16.scales = (b, C, pal, o = {}) => { const n = o.n || 8, R = o.r || 22; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.42, dl = (o.delay || 0) + i * 2, X = C.x + Math.cos(a) * R, Y = C.y + Math.sin(a) * R * 0.8;
  HD15.add(b, { x: X, y: Y, delay: dl, life: dl + (o.dur || 26), draw: (x, p, k) => { const g = life16(k, 0.25, 0.6); if (g > 0) HD15.dia(x, p.x, p.y - k * 6, 12 * g, 7 * g, a + Math.PI / 2, pal, g); } }); } };
// 龍爪：三道並排的爪痕（一次三條，是爪子不是裂開）
HD16.claw = (b, T, pal, o = {}) => { const ang = o.ang ?? -0.9, dir = o.dir || 1, nx = -Math.sin(ang), ny = Math.cos(ang); for (let i = -1; i <= 1; i++) HD15.slash(b, { x: T.x + nx * i * 8, y: T.y + ny * i * 8 }, { pal, r: o.r || 34, th: o.th || 5, ang, dir, span: 1.1, dur: o.dur || 14, delay: (o.delay || 0) + (i + 1), dust: 0 }); };
const foesV16 = b => DG17.foes(b);
const footOf16 = (b, v) => ({ x: b.center(v).x, y: v && v.foot ? v.foot - 2 : b.center(v).y + 24 });
const heroG16 = b => ({ x: DS16.hands(b).Hc.x, y: HDW_FOOT() - 2 });
const EXFX16 = {
  /* ---- 晨星誓約 ---- */
  xDawnSlash: { *f(U, T, u) { const P = HD15.P.star16; glint15(this, P); Sound.sfx('blade'); yield* this.lunge(u, 18, 3);
      HD15.slash(this, T, { pal: P, r: 58, th: 12, ang: -0.67, span: 1.5, dur: 20, spark: 1 }); yield* wait(4); Sound.sfx('stHit'); HD15.stop(this, 4);
      HD16.star(this, T, P, 26, { n: 4, dur: 20, spin: 0.6 }); HD15.sparks(this, T, 10, P, { spd: 3, life: 16 }); yield* wait(10); HD15.motes(this, T, this.center(this.H), 7, P, { dur: 18 }); yield* wait(12); } },
  xDawnVow: { *f(U, T, u) { const P = HD15.P.star16, C = this.center(this.H), G = heroG16(this); Sound.sfx('shGuard'); HD15.pillar(this, G, P, 70, { dur: 30 }); HD15.ring(this, G, P, 6, 34, { fl: 0.3, w: 1.8, dur: 22 });
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; HD16.star(this, { x: C.x + Math.cos(a) * 20, y: C.y + Math.sin(a) * 14 }, P, 8, { n: 4, dur: 26, delay: 4 + i * 2, spin: 1 }); } yield* wait(26); } },
  xDawnPillar: { *f(U, T, u) { const P = HD15.P.star16; glint15(this, P); Sound.sfx('charge'); HD15.rays(this, { x: T.x, y: T.y - 70 }, P, 7, 30, { dur: 30 }); yield* wait(10);
      for (const [i, v] of foesV16(this).entries()) { const G = footOf16(this, v); HD15.pillar(this, G, P, 110, { dur: 26, delay: i * 4 }); HD16.star(this, { x: G.x, y: G.y - 30 }, P, 14, { n: 4, dur: 20, delay: i * 4 + 6 }); }
      yield* wait(8); Sound.sfx('stHit'); HD15.stop(this, 3); for (const v of foesV16(this)) HD15.sparks(this, this.center(v), 6, P, { spd: 2.4, life: 16 }); yield* wait(16); } },
  xDawnOath: { *f(U, T, u) { const P = HD15.P.star16, C = this.center(this.H); Sound.sfx('charge'); HD15.rays(this, C, P, 8, 36, { dur: 34 }); HD16.star(this, C, P, 30, { n: 8, inner: 0.4, dur: 34, spin: 0.4 }); yield* wait(12);
      Sound.sfx('shGuard'); HD15.ring(this, heroG16(this), P, 30, 6, { fl: 0.3, w: 2, dur: 18 }); HD15.flash(this, C, P, 34, { dur: 14 }); yield* wait(20); } },
  xDawnJudge: { *f(U, T, u) { const P = HD15.P.star16, S = { x: T.x, y: T.y - 70 }; HD15.dim(this, 0.4, 70); Sound.sfx('charge'); HD16.star(this, S, P, 26, { n: 4, dur: 40, spin: 0.8 }); HD15.rays(this, S, P, 9, 26, { dur: 40 }); yield* wait(18);
      Sound.sfx('blade'); HD15.comet(this, S, T, P, 10, { w: 14, ease: 'in' }); yield* wait(10); Sound.sfx('crit'); HD15.stop(this, 7);
      HD15.flare(this, T, P, 70, { rot: Math.PI / 4, dur: 18, x8: 1 }); HD16.star(this, T, P, 40, { n: 4, dur: 22, spin: -0.5 }); HD15.ring(this, T, P, 6, 48, { w: 2.6, dur: 18 }); HD15.sparks(this, T, 16, P, { spd: 4, life: 20, g: 0.08 }); this.shake = Math.max(this.shake || 0, 10); yield* wait(20); } },
  /* ---- 緋月劍譜 ---- */
  xMoonFlash: { *f(U, T, u) { const P = HD15.P.moon16; HD16.moon(this, { x: T.x + 10, y: T.y - 26 }, P, 16, { dur: 34, al: 0.7 }); Sound.sfx('wind'); yield* this.lunge(u, 24, 1);
      Sound.sfx('blade'); HD15.slash(this, T, { pal: P, r: 72, th: 6, ang: -Math.PI / 2, span: 0.9, dur: 16, spark: 1 }); yield* wait(3); HD15.stop(this, 5); Sound.sfx('stHit'); HD15.flash(this, T, P, 26, { dur: 10 }); HD15.sparks(this, T, 8, P, { spd: 3.4, life: 14 }); yield* wait(12); } },
  xMoonBlood: { *f(U, T, u) { const P = HD15.P.moon16; yield* this.lunge(u, 20, 2);
      for (let i = 0; i < 5; i++) { Sound.sfx('bladeQ'); HD15.slash(this, { x: T.x + (i % 2 ? 4 : -4), y: T.y }, { pal: P, r: 40, th: 6, ang: [-0.67, -2.41, -1.2, -1.94, -1.57][i], dir: i % 2 ? -1 : 1, span: 1.3, dur: 12, dust: 0 }); yield* wait(3); }
      HD15.stop(this, 4); HD15.blood(this, T, 14, { spd: 2.6 }); HD16.moon(this, T, P, 14, { dur: 18, rot: -Math.PI / 2 }); yield* wait(14); } },
  xMoonMark: { *f(U, T, u) { const P = HD15.P.moonDark16; Sound.sfx('charge'); HD15.gather(this, T, 10, P, 30, { span: 10 }); yield* wait(10);
      Sound.sfx('statDown'); HD16.moon(this, T, P, 20, { dur: 36, rot: Math.PI / 2 }); HD16.moon(this, T, HD15.P.moon16, 12, { dur: 30, rot: -Math.PI / 2, delay: 4, al: 0.8 }); HD15.ring(this, T, P, 30, 6, { w: 2, dur: 18 }); yield* wait(24); } },
  xMoonVeil: { *f(U, T, u) { const P = HD15.P.moon16, C = this.center(this.H); Sound.sfx('wind'); HD16.moon(this, { x: C.x, y: C.y - 30 }, P, 18, { dur: 36, al: 0.6 });
      if (typeof K13 !== 'undefined' && K13.ghost) for (let i = 1; i <= 3; i++) K13.ghost(this, (i % 2 ? -1 : 1) * i * 7, 0, '#ff6a86', 10 + i * 3, 0.45); HD15.windLines(this, { x: C.x - 40, y: C.y }, { x: C.x + 40, y: C.y }, P, 5, { spread: 26, len: 26, spd: 8, life: 12 }); yield* wait(22); } },
  xMoonFall: { *f(U, T, u) { const P = HD15.P.moon16, M = { x: T.x, y: T.y - 62 }; HD15.dim(this, 0.42, 80); Sound.sfx('charge'); HD16.moon(this, M, P, 30, { dur: 70, rot: Math.PI / 2, grow: 0.2, fade: 0.8 }); yield* wait(16);
      for (let i = 0; i < 4; i++) { const A = { x: M.x + (i - 1.5) * 14, y: M.y + 10 }; Sound.sfx('blade'); HD15.wave(this, A, { x: T.x + (i - 1.5) * 6, y: T.y }, P, { dur: 9, r0: 8, r1: 16 }); yield* wait(9);
        HD15.slash(this, T, { pal: P, r: 44, th: 7, ang: [-0.67, -2.41, -1.2, -1.94][i], dir: i % 2 ? -1 : 1, span: 1.2, dur: 14, dust: 0 }); HD15.stop(this, 2); yield* wait(2); }
      Sound.sfx('crit'); HD15.flash(this, T, P, 40, { dur: 14 }); HD15.sparks(this, T, 14, P, { spd: 3.6, life: 18 }); this.shake = Math.max(this.shake || 0, 7); yield* wait(18); } },
  /* ---- 天籟樂章 ---- */
  xSongWave: { *f(U, T, u) { const P = HD15.P.song16, H = this.center(this.H); Sound.sfx('charge'); HD15.ring(this, H, P, 6, 30, { w: 1.6, dur: 16 });
      for (const v of foesV16(this)) { const C = this.center(v); for (let i = 0; i < 3; i++) HD16.note(this, { x: H.x + (i - 1) * 8, y: H.y - 10 }, C, P, { dur: 16, delay: i * 3 }); }
      yield* wait(18); Sound.sfx('hit'); for (const v of foesV16(this)) { const C = this.center(v); HD15.ring(this, C, P, 4, 26, { w: 2, dur: 14 }); HD15.ring(this, C, P, 4, 26, { w: 1.6, dur: 14, delay: 6 }); } yield* wait(18); } },
  xSongMend: { *f(U, T, u) { const P = HD15.P.song16, C = this.center(this.H), G = heroG16(this); Sound.sfx('heal'); HD15.ring(this, G, P, 6, 34, { fl: 0.3, w: 1.6, dur: 24 });
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; HD16.note(this, { x: C.x + Math.cos(a) * 26, y: G.y }, { x: C.x + Math.cos(a) * 14, y: C.y - 30 }, P, { dur: 22, delay: i * 2, wob: 4, s: 0.9 }); } yield* wait(24); } },
  xSongMarch: { *f(U, T, u) { const P = HD15.P.star16, C = this.center(this.H); Sound.sfx('statUp'); HD15.rays(this, { x: C.x, y: C.y + 10 }, P, 7, 34, { dur: 30 });
      for (let i = 0; i < 5; i++) HD16.note(this, { x: C.x + (i - 2) * 9, y: C.y + 8 }, { x: C.x + (i - 2) * 16, y: C.y - 50 }, P, { dur: 20, delay: i * 2, wob: 3 }); yield* wait(26); } },
  xSongLull: { *f(U, T, u) { const P = HD15.P.lull16, H = this.center(this.H); HD15.dim(this, 0.3, 50); Sound.sfx('charge');
      for (const v of foesV16(this)) { const C = this.center(v); for (let i = 0; i < 2; i++) HD16.note(this, { x: H.x + (i ? 6 : -6), y: H.y - 12 }, { x: C.x, y: C.y - 14 }, P, { dur: 28, delay: i * 6, wob: 12, s: 0.9 }); }
      yield* wait(30); for (const v of foesV16(this)) HD15.motes(this, { x: this.center(v).x, y: this.center(v).y - 40 }, this.center(v), 5, P, { dur: 18 }); yield* wait(18); } },
  xSongFinale: { *f(U, T, u) { const P = HD15.P.song16, H = this.center(this.H); HD15.dim(this, 0.4, 70); Sound.sfx('charge');
      for (let i = 0; i < 3; i++) HD15.ring(this, H, P, 10, 140, { w: 2.2, dur: 30, delay: i * 6 }); for (const v of foesV16(this)) { const C = this.center(v); for (let i = 0; i < 4; i++) HD16.note(this, H, C, i % 2 ? P : HD15.P.star16, { dur: 18, delay: 8 + i * 3, wob: 10 }); }
      yield* wait(28); Sound.sfx('crit'); HD15.stop(this, 5); for (const v of foesV16(this)) { const C = this.center(v); HD15.flare(this, C, P, 50, { rot: 0, dur: 16 }); HD15.ring(this, C, P, 6, 36, { w: 2.4, dur: 16 }); } this.shake = Math.max(this.shake || 0, 6); yield* wait(18); } },
  /* ---- 蒸汽機巧 ---- */
  xGearHammer: { *f(U, T, u) { const P = HD15.P.steam16, C = this.center(this.H); Sound.sfx('wind'); HD15.smoke(this, { x: C.x, y: C.y }, 10, { col: '#ececf0', r: 24, sz: 12, spd: 1.4, up: 0.4, life: 28 }); yield* this.lunge(u, 16, 3);
      Sound.sfx('axSwing'); HD15.slash(this, T, { pal: HD15.P.brass16, r: 46, th: 15, ang: 0, span: 1.6, dur: 18, sw: 0.4 }); yield* wait(4); Sound.sfx('axHitSuper'); HD15.stop(this, 6);
      HD16.gear(this, T, HD15.P.brass16, 22, { dur: 24, spin: 3 }); HD15.flash(this, T, P, 40, { dur: 14 }); HD15.sparks(this, T, 16, P, { spd: 4, life: 18, g: 0.12 }); HD15.smoke(this, T, 8, { col: '#e8e8ec', r: 30, sz: 14, life: 30 }); this.shake = Math.max(this.shake || 0, 9); yield* wait(16); } },
  xGearTurret: { *f(U, T, u) { const P = HD15.P.brass16, C = this.center(this.H), S = { x: C.x + 30, y: C.y + 6 }; Sound.sfx('shGuard'); HD16.gear(this, S, P, 12, { dur: 40, spin: 4 }); HD16.gear(this, { x: S.x + 10, y: S.y - 10 }, P, 7, { dur: 40, spin: -6, delay: 4 });
      HD15.smoke(this, S, 6, { col: '#ececf0', r: 14, sz: 10, spd: 0.8, up: 0.5, life: 30 }); yield* wait(18); Sound.sfx('statUp'); HD15.flash(this, S, HD15.P.steam16, 24, { dur: 12 }); yield* wait(14); } },
  xGearArmor: { *f(U, T, u) { const P = HD15.P.brass16, C = this.center(this.H); Sound.sfx('shGuard'); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; HD16.gear(this, { x: C.x + Math.cos(a) * 22, y: C.y + Math.sin(a) * 16 }, P, 9, { dur: 30, spin: i % 2 ? 3 : -3, delay: i * 2 }); }
      HD15.smoke(this, heroG16(this), 10, { col: '#ececf0', r: 34, sz: 12, spd: 1, up: 0.3, life: 30 }); yield* wait(16); HD15.flash(this, C, P, 34, { dur: 12 }); yield* wait(12); } },
  xGearBoiler: { *f(U, T, u) { const P = HD15.P.steam16, C = this.center(this.H), G = heroG16(this); Sound.sfx('charge');
      for (const s of [-1, 1]) HD15.smoke(this, { x: C.x + s * 12, y: C.y - 6 }, 10, { col: '#f4f4f6', ang: -Math.PI / 2 + s * 0.5, spread: 0.4, spd: 2.6, sz: 10, life: 26 }); HD15.flames(this, G, 8, P, { w: 36 }); yield* wait(10);
      Sound.sfx('statUp'); HD15.flash(this, C, P, 34, { dur: 14 }); HD15.sparks(this, C, 12, P, { ang: -Math.PI / 2, spread: 1.2, spd: 3, life: 20, g: 0.05 }); yield* wait(16); } },
  xGearBlast: { *f(U, T, u) { const P = HD15.P.steam16, H = this.center(this.H); Sound.sfx('fsSwing'); HD16.gear(this, { x: H.x, y: H.y - 10 }, HD15.P.brass16, 8, { dur: 14, spin: 6 });
      HD15.comet(this, { x: H.x, y: H.y - 10 }, T, HD15.P.brass16, 14, { w: 8 }); yield* wait(14); Sound.sfx('quake'); HD15.stop(this, 6); this.spawn({ k: 'flash', c: '#fff0d0', a: 0.4, life: 10 });
      HD15.flare(this, T, P, 90, { rot: 0, dur: 20, x8: 1 }); HD15.ring(this, T, P, 10, 80, { w: 3, dur: 20 }); for (const v of foesV16(this)) HD15.flames(this, footOf16(this, v), 6, P, { w: 30 });
      HD15.smoke(this, T, 18, { col: '#9a9aa2', r: 70, sz: 20, spd: 1.6, life: 44 }); HD15.sparks(this, T, 22, P, { spd: 5, life: 22, g: 0.12 }); this.shake = Math.max(this.shake || 0, 14); yield* wait(22); } },
  /* ---- 霜嶺心法 ---- */
  xFrostPalm: { *f(U, T, u) { const P = HD15.P.frost16; glint15(this, P); Sound.sfx('fsSwing'); yield* this.lunge(u, 12, 2); Sound.sfx('fsHitSuper'); HD15.stop(this, 4);
      HD16.star(this, T, P, 22, { n: 6, inner: 0.35, dur: 24, spin: 0.3 }); HD15.shards(this, T, 12, { spd: 3, sz: 3, up: 1, cols: [P.core, P.mid, P.glow] }); HD15.ring(this, T, P, 4, 30, { w: 2, dur: 16 }); yield* wait(18); } },
  xFrostHeart: { *f(U, T, u) { const P = HD15.P.frost16, C = this.center(this.H); Sound.sfx('charge'); HD16.star(this, C, P, 20, { n: 6, inner: 0.35, dur: 40, spin: 0.25 }); HD15.gather(this, C, 12, HD15.P.mp, 34, { span: 14 }); yield* wait(22);
      HD15.flash(this, C, P, 28, { dur: 12 }); yield* wait(12); } },
  xFrostSlide: { *f(U, T, u) { const P = HD15.P.frost16; Sound.sfx('fsSwing'); yield* this.lunge(u, 8, 2); Sound.sfx('quake');
      for (const [i, v] of foesV16(this).entries()) { const C = this.center(v), A = { x: C.x - 10, y: C.y - 60 }; HD15.smoke(this, A, 12, { col: '#f0f8ff', ang: Math.PI / 2, spread: 0.6, spd: 2.6, sz: 16, life: 26, delay: i * 3 }); HD15.shards(this, C, 8, { spd: 2.6, sz: 3, up: 0.6, cols: [P.core, P.mid, P.glow] }); }
      yield* wait(10); HD15.stop(this, 4); this.shake = Math.max(this.shake || 0, 10); yield* wait(18); } },
  xFrostGuard: { *f(U, T, u) { const P = HD15.P.frost16, C = this.center(this.H); Sound.sfx('shGuard'); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; HD16.star(this, { x: C.x + Math.cos(a) * 24, y: C.y + Math.sin(a) * 18 }, P, 7, { n: 6, inner: 0.35, dur: 32, delay: i * 2, spin: 0.6 }); }
      HD15.ring(this, heroG16(this), P, 6, 34, { fl: 0.3, w: 1.8, dur: 22 }); yield* wait(22); HD15.flash(this, C, P, 26, { dur: 10 }); yield* wait(10); } },
  xFrostSeal: { *f(U, T, u) { const P = HD15.P.frost16; HD15.dim(this, 0.4, 70); Sound.sfx('charge'); HD15.ring(this, T, P, 70, 10, { w: 2.4, dur: 26 }); HD15.gather(this, T, 14, P, 50, { span: 14 }); yield* wait(22);
      Sound.sfx('crit'); HD15.stop(this, 7); HD16.star(this, T, P, 40, { n: 6, inner: 0.3, dur: 34, spin: 0.15 }); HD15.shards(this, T, 20, { spd: 4, sz: 3.6, up: 1.4, cols: [P.core, P.mid, P.glow] }); this.spawn({ k: 'flash', c: '#e8f6ff', a: 0.35, life: 10 }); this.shake = Math.max(this.shake || 0, 8); yield* wait(24); } },
  /* ---- 蒼穹龍脈 ---- */
  xDrakeClaw: { *f(U, T, u) { const P = HD15.P.drake16; for (let i = 0; i < 3; i++) { yield* this.lunge(u, 14, 2); Sound.sfx('blade'); HD16.claw(this, T, P, { ang: [-0.9, -2.24, -1.57][i], dir: i % 2 ? -1 : 1 }); yield* wait(3);
        HD15.stop(this, 2); HD15.sparks(this, T, 6, P, { spd: 3, life: 12 }); yield* wait(4); } yield* wait(10); } },
  xDrakeScale: { *f(U, T, u) { const P = HD15.P.drake16, C = this.center(this.H); Sound.sfx('shGuard'); HD16.scales(this, C, P, { n: 9, r: 24, dur: 30 }); HD15.ring(this, heroG16(this), P, 6, 34, { fl: 0.3, w: 1.8, dur: 22 }); yield* wait(24); HD15.flash(this, C, P, 26, { dur: 10 }); yield* wait(10); } },
  xDrakeBreath: { *f(U, T, u) { const P = HD15.P.azureFire16, H = this.center(this.H), M = { x: H.x, y: H.y - 16 }; Sound.sfx('charge'); HD15.gather(this, M, 10, P, 24, { span: 8 }); yield* wait(10); Sound.sfx('wind');
      for (const v of foesV16(this)) { const C = this.center(v); for (let i = 0; i < 3; i++) HD15.comet(this, M, { x: C.x + (i - 1) * 8, y: C.y + (i - 1) * 4 }, P, 12, { w: 10 - i * 2, delay: i * 2 }); } yield* wait(14);
      Sound.sfx('hit'); HD15.stop(this, 4); for (const v of foesV16(this)) { HD15.flames(this, footOf16(this, v), 8, P, { w: 34 }); HD15.flash(this, this.center(v), P, 30, { dur: 12 }); } yield* wait(20); } },
  xDrakeRise: { *f(U, T, u) { const P = HD15.P.drake16, S = { x: T.x, y: T.y - 100 }; Sound.sfx('charge'); HD15.whirl(this, S, P, { r: 26, dur: 16 }); yield* wait(8);
      Sound.sfx('blade'); HD15.comet(this, S, T, P, 8, { w: 16, ease: 'in' }); yield* wait(8); Sound.sfx('crit'); HD15.stop(this, 7); HD16.claw(this, T, P, { ang: -Math.PI / 2, r: 48, th: 7 });
      HD15.flare(this, T, P, 64, { rot: 0, dur: 18 }); HD15.ring(this, { x: T.x, y: T.y + 24 }, P, 8, 50, { fl: 0.3, w: 2.4, dur: 18 }); HD15.sparks(this, T, 16, P, { spd: 4, life: 18, g: 0.1 }); this.shake = Math.max(this.shake || 0, 10); yield* wait(20); } },
  xDrakeKing: { *f(U, T, u) { const P = HD15.P.drake16, S = { x: T.x, y: T.y - 80 }; HD15.dim(this, 0.45, 90); Sound.sfx('charge'); HD15.whirl(this, T, P, { r: 80, dur: 40 }); HD16.scales(this, S, P, { n: 11, r: 30, dur: 44 }); yield* wait(20);
      for (let i = 0; i < 3; i++) { HD15.wave(this, { x: S.x + (i - 1) * 30, y: S.y }, { x: T.x + (i - 1) * 20, y: T.y }, P, { dur: 10, r0: 12, r1: 26 }); yield* wait(4); } yield* wait(8);
      Sound.sfx('crit'); HD15.stop(this, 7); for (const v of foesV16(this)) { const C = this.center(v); HD15.flare(this, C, P, 60, { rot: Math.PI / 4, dur: 18 }); HD16.claw(this, C, P, { ang: -1.2, r: 40 }); } this.shake = Math.max(this.shake || 0, 14); yield* wait(24); } },
};
if (typeof EX16 !== 'undefined' && EX16.live) for (const k in EXFX16) { const id = 't_' + k, D = DEF.skills[id], F = EXFX16[k]; if (!D) { bvErr('exfx16', id); continue; } const key = 'hd15_' + k;
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; }
    if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: false }; HD15.ids.push(id);
  if (HD15.on) { D.fx = key; D.hitFx = null; if (MOVES[id]) MOVES[id].fx = key; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = ['draw', null, 'steel', null]; if (typeof REDO13 !== 'undefined') REDO13.add(id); } }
