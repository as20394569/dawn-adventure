/* ===================== v12.121 EX「自走砲台」：場上看得到一座砲台 =====================
   玩家 2026-10-11：「砲台只有狀態 沒有實際物體不明顯」
   之前施放時只在主角旁轉兩個齒輪就消失，之後只剩一個狀態圖示，每回合結束的砲擊看起來像主角自己追擊。
   現在：
   ・施放：齒輪在主角左後方轉起來、冒蒸汽 → 黃銅砲台從上面落下架好（地面揚起一圈塵土）。
   ・在場時：砲台一直站在主角左後方（沿用機工士砲台的像素圖，右邊會被主角的武器擋住），底座有一圈黃銅色微光，偶爾冒一口蒸汽；剩下幾回合看下方的狀態標籤。
   ・每回合結束：砲口閃光、砲身後座，一發黃銅色砲彈飛向魔物，命中時爆開。（不再借用雙劍副手的追擊刀光）
   ・時間到：砲台散成幾個齒輪和一團蒸汽消失。
   只在 EX 技能開啟時（EX16.live）作用。 */
{ const on = () => typeof EX16 !== 'undefined' && EX16.live, B = Battle.prototype, H = B.handlers, TAG = 'xturret16';
  const pal = () => HD15.P.brass16, steam = () => HD15.P.steam16;
  // 砲台的位置：主角左後方（右邊是主角的武器，放那裡會被擋住），砲口朝右上對著魔物
  const base = b => ({ x: Math.round(b.center(b.H).x - 46 + (b.H.off ? b.H.off.x : 0)), y: HERO_FOOT - 18 });
  const muzzle = b => { const P = base(b); return { x: P.x + 15, y: P.y - 29 }; };
  B.drawXTurret17 = function (x) { const h = this.H; if (!h || !h.st) return; const n = h.st.xTurret16;
    if (!n && !(this._xtGone > 0)) return; if (h.st.turret > 0) return; // 機工士的砲台已經在那裡
    const P = base(this), t = this.t || 0; let dy = 0, a = 1;
    if (this._xtDrop > 0) { const k = this._xtDrop / 14; dy = -Math.round(k * k * 34); this._xtDrop--; }
    if (!n && this._xtGone > 0) { a = this._xtGone / 16; this._xtGone--; }
    // 底座的黃銅微光
    x.save(); x.globalAlpha = a; x.globalCompositeOperation = 'lighter'; const pu = 0.22 + 0.1 * Math.sin(t / 9);
    const g = x.createRadialGradient(P.x, P.y - 2, 2, P.x, P.y - 2, 22); g.addColorStop(0, 'rgba(255,214,120,' + pu.toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,180,60,0)');
    x.fillStyle = g; x.fillRect(P.x - 24, P.y - 24, 48, 30); x.restore();
    x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(0,0,0,0.35)'; x.beginPath(); x.ellipse(P.x, P.y, 15, 3, 0, 0, 7); x.fill();
    const fire = this._turFire > 0; if (fire && !(h.st.turret > 0)) this._turFire--; const fr = fire ? 'fire1' : Math.floor(t / 24) % 2 ? 'idle2' : 'idle1', im = turretImg(fr), rec = fire ? -2 : 0;
    if (im && im.complete !== false) { x.imageSmoothingEnabled = false; x.drawImage(im, P.x - 20 + rec, P.y - 32 + dy + (fire ? 1 : 0), 40, 32); }
    x.restore();
    // 偶爾冒一口蒸汽
    if (n && !(this._xtDrop > 0) && this._xtPuff17 !== t && t % 70 === 0) { this._xtPuff17 = t; HD15.smoke(this, { x: P.x - 10, y: P.y - 20 }, 3, { col: '#ececf0', r: 6, sz: 6, spd: 0.4, up: 0.6, life: 26 }); } };
  const _dt = B.drawTurret; B.drawTurret = function (x) { _dt.call(this, x); if (on()) this.drawXTurret17(x); };

  // 每回合結束的砲擊
  function* shot(b, C) { const M = muzzle(b), P = pal(); b._turFire = 9; Sound.sfx('crit'); HD15.flash(b, M, P, 18, { dur: 8 }); HD15.sparks(b, M, 5, P, { ang: Math.atan2(C.y - M.y, C.x - M.x), spread: 0.7, spd: 2.4, life: 10 });
    HD15.smoke(b, M, 3, { col: '#e8e8ec', r: 6, sz: 6, spd: 0.6, up: 0.4, life: 20 });
    HD15.comet(b, M, C, P, 9, { w: 8 }); HD15.flash(b, M, steam(), 12, { dur: 6, delay: 2 }); yield* wait(9);
    Sound.sfx('axHit'); HD15.stop(b, 3); HD15.flare(b, C, steam(), 34, { rot: 0.4, dur: 14 }); HD15.ring(b, C, P, 4, 26, { w: 2.2, dur: 14 }); HD15.sparks(b, C, 10, P, { spd: 3.2, life: 16, g: 0.12 });
    HD15.smoke(b, C, 3, { col: '#c8c0b4', r: 12, sz: 7, spd: 0.7, up: 0.3, life: 20 }); b.shake = Math.max(b.shake || 0, 4); yield* wait(4); }
  const _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (on() && t && P && e && (e.tags || []).includes(TAG)) { this.hd15cast = 1; this.slashOn = 0; yield* shot(this, this.center(t)); return yield* _dm.call(this, e, s, t, { ...P, kind: 'xturret16' }); }
    return yield* _dm.call(this, e, s, t, P); };

  // 架好砲台：從上面落下
  const _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) { const was = t && t.st && t.st.xTurret16; yield* _ap.call(this, e, s, t, P);
    if (!on() || !t || !P || P.failed || P.status !== 'xTurret16' || was || !t.hero) return;
    this._xtGone = 0; this._xtDrop = 14; yield* wait(14); const B0 = base(this); Sound.sfx('rock'); this.shake = Math.max(this.shake || 0, 3);
    HD15.ring(this, B0, pal(), 4, 26, { w: 2, dur: 14 }); HD15.smoke(this, B0, 6, { col: '#d8c8a0', r: 18, sz: 8, spd: 0.9, up: 0.15, life: 22 }); HD15.sparks(this, { x: B0.x, y: B0.y - 6 }, 6, pal(), { spd: 2, life: 12, g: 0.15 });
    yield* wait(10); };
  // 時間到：散成齒輪和蒸汽
  const _sg = H.statusGone; H.statusGone = function* (e, s, t, P, expire) {
    if (on() && t && t.hero && P && P.status === 'xTurret16' && !(t.st && t.st.turret > 0)) { const B0 = base(this), C = { x: B0.x, y: B0.y - 14 }; this._xtGone = 16; Sound.sfx('statDown');
      HD15.smoke(this, C, 8, { col: '#ececf0', r: 16, sz: 10, spd: 0.9, up: 0.5, life: 28 });
      for (let i = 0; i < 3; i++) HD16.gear(this, { x: C.x + (i - 1) * 9, y: C.y - 4 + (i % 2) * 6 }, pal(), 5 + i, { dur: 18, spin: i % 2 ? 6 : -6, delay: i * 2 }); }
    return yield* _sg.call(this, e, s, t, P, expire); };

  // 施放的招式：齒輪在砲台要落下的地方轉起來（之後砲台落下）
  if (typeof EXFX16 !== 'undefined' && EXFX16.xGearTurret) EXFX16.xGearTurret.f = function* (U, T, u) { const P = pal(), B0 = base(this), S = { x: B0.x, y: B0.y - 14 };
    Sound.sfx('shGuard'); HD16.gear(this, S, P, 12, { dur: 30, spin: 4 }); HD16.gear(this, { x: S.x + 11, y: S.y - 9 }, P, 7, { dur: 30, spin: -6, delay: 3 }); HD16.gear(this, { x: S.x - 10, y: S.y + 6 }, P, 6, { dur: 30, spin: 7, delay: 5 });
    HD15.smoke(this, S, 6, { col: '#ececf0', r: 14, sz: 9, spd: 0.8, up: 0.5, life: 26 }); yield* wait(16); Sound.sfx('charge'); HD15.flash(this, S, steam(), 26, { dur: 12 }); yield* wait(10); };
}
