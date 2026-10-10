/* ===================== v12.111 頭目・菁英的「豐富動作」（Codex 任務 AV） =====================
   玩家 2026-10-10：「用 CODEX 的流量來重製 BOSS 與菁英，讓這些怪物動作更豐富」。
   Codex 畫的新圖每隻有：待機 4 張（idle1-4，循環）＋眨眼 1 張（blink1）、攻擊 4 張（蓄力→出手→打到→收回）、施法 3 張（舉起→發光循環）、
   受傷 2 張、倒下 1 張（down1）；頭目另外有怒氣待機 4 張（rage1-4，HP 40% 以下改用）。
   有 4 張以上待機圖的魔物才走這裡；舊的 2 張圖魔物照舊（呼吸壓縮／漂浮），不受影響。 */
const RICH15 = S => !!(S && S.chibi && S.meta && S.meta.frames.idle && S.meta.frames.idle.length >= 4);
{ const _pr = pxRender; pxRender = function (A, S, T, tint) {
    if (!RICH15(S)) return _pr(A, S, T, tint);
    if (!A.pcv || A.pcv.width !== S.cw) { A.pcv = mkCanvas(S.cw, S.ch); A.pcvT = mkCanvas(S.cw, S.ch); }
    const cv = tint ? A.pcvT : A.pcv, x = cv.getContext('2d'), fr = S.meta.frames, [st, p] = hdPhase(A, T), tt = T + (A.phase || 0);
    const loop = (a, per) => a[Math.floor(tt / per) % a.length];
    let f = fr.idle[0], ox = 0;
    if (A.state === 'faint') f = (fr.down || fr.hurt || fr.idle)[0];
    else if (st === 'attack' && fr.attack) { const a = fr.attack, n = a.length; f = a[n >= 4 ? (p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.6 ? 2 : 3) : Math.min(n - 1, p < 0.3 ? 0 : p < 0.65 ? 1 : 2)]; }
    else if (st === 'cast' && fr.cast) { const c = fr.cast; f = c.length < 2 || A.t < 8 ? c[0] : c[1 + Math.floor((A.t - 8) / 6) % (c.length - 1)]; }
    else if (st === 'hurt' && fr.hurt) { const h = fr.hurt; f = h[p < 0.5 || h.length < 2 ? 0 : 1]; ox = p < 0.7 ? 3 : 0; }
    else if (st === 'defend' && fr.defend) f = fr.defend[0];
    else { const rage = fr.rage && fr.rage.length >= 4 && (A.hpr15 !== undefined && A.hpr15 <= 0.4 || S.sp === (typeof THAL15 !== 'undefined' ? THAL15 : '') && Game.scene && Game.scene.rage15);
      const set = rage ? fr.rage : fr.idle; f = loop(set, rage ? 8 : 10);
      if (!rage && fr.blink && set.indexOf(f) === 0 && (tt % 230) < 7) f = fr.blink[0]; }
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingEnabled = false;
    x.drawImage(S.im, f * S.w, 0, S.w, S.h, PX_PAD + ox, PX_PAD, S.w, S.h);
    if (tint) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
    cv.ds = 1; cv.bb = S.bb; cv.px = true; return cv;
  };
}
// 怒氣待機要知道剩多少血：畫魔物前把 HP 比例記在動畫狀態上
{ const _rf = Battle.prototype.renderFoe; Battle.prototype.renderFoe = function (v, tint) { if (v && v.A) v.A.hpr15 = v.boss ? clamp(v.hp / Math.max(1, v.maxhp), 0, 1) : undefined; return _rf.call(this, v, tint); }; }
