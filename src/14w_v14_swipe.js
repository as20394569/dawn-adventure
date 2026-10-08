/* ===================== v14.32 手牌左右滑動（玩家：「想換牌不直覺 應該要可以左右平滑」） =====================
   · 手指按在手牌上左右拖：手指下面那張卡就是選到的卡（大卡跟著平滑移過去）
   · 大卡上左右滑：往左滑看下一張、往右滑看上一張（大卡跟著手指，放開後從那一邊滑進來）；到底了會彈回去
   · 沒有移動就是點一下（跟原本一樣：點卡＝選它，再點大卡＝出牌）——所以手牌和大卡的「點」改成放開手指時才算 */
KD.SW = null;
KD.swMy = b => b instanceof Battle && b.k14 && b.idle && b.core && b.core.need && b.core.need.unit && b.core.need.unit.hero && !UI.stack.length;
KD.swZone = (b, gx, gy) => { if (!KD.swMy(b) || !b.hand.length) return null; const LB = KD.BL(), R = b.pop28;
  if (R && gx >= R.x && gx < R.x + R.w && gy >= R.y && gy < R.y + R.h) return 'pop'; if (gy >= LB.handY - 2) return 'hand'; return null; };
KD.swCardAt = (b, gx) => { const n = b.hand.length, cw = KD.BL().cw; for (let i = n - 1; i >= 0; i--) { const P = b.handPos(i, n); if (gx >= P.x && gx < P.x + cw) return i; } return gx < W / 2 ? 0 : n - 1; };
KD.swPick = (b, i) => { if (i === b.sel || i < 0 || i >= b.hand.length) return false; b.sel = i; b.tgtMode = 0; Sound.sfx('cursor'); return true; };
{ const _tt = touchTap; touchTap = function (gx, gy) { const b = Game.scene, z = KD.swZone(b, gx, gy); if (z) { Game.touchUI = true; KD.SW = { x0: gx, y0: gy, x: gx, y: gy, z, mode: null, b }; return; } return _tt(gx, gy); };
  KD.swTap = _tt; }
KD.swMove = s => { const b = s.b, dx = s.x - s.x0, dy = s.y - s.y0;
  if (!s.mode) { if (Math.abs(dx) >= 4 && Math.abs(dx) >= Math.abs(dy)) s.mode = s.z === 'pop' && b.sel >= 0 ? 'swipe' : 'scrub'; else if (Math.abs(dy) >= 8) s.mode = 'none'; }
  if (s.mode === 'scrub') KD.swPick(b, KD.swCardAt(b, s.x));
  if (s.mode === 'swipe') b.popDrag = clamp(dx, -30, 30); };
KD.swEnd = s => { const b = s.b, dx = s.x - s.x0; b.popDrag = 0;
  if (!s.mode) { KD.swTap(s.x0, s.y0); return; } // it didn't move: a tap
  if (s.mode === 'swipe') { const to = b.sel + (dx < 0 ? 1 : -1);
    if (Math.abs(dx) >= 10 && KD.swPick(b, to)) { b.popAX = null; b.popKick = dx < 0 ? 26 : -26; } // the next card slides in from the side the finger came from
    else b.popKick = dx * 0.6; } }; // not far enough, or the last card: it springs back
{ const cvs = document.getElementById('screen'); if (cvs) { const P = e => { const r = cvs.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
    cvs.addEventListener('pointerdown', e => { if (KD.SW) try { cvs.setPointerCapture(e.pointerId); } catch (_) { } });
    cvs.addEventListener('pointermove', e => { const s = KD.SW; if (!s) return; e.preventDefault(); [s.x, s.y] = P(e); if (!KD.swMy(s.b) || Game.scene !== s.b) { KD.SW = null; s.b.popDrag = 0; return; } KD.swMove(s); });
    const up = e => { const s = KD.SW; if (!s) return; KD.SW = null; if (e.type === 'pointerup') [s.x, s.y] = P(e); if (!KD.swMy(s.b) || Game.scene !== s.b) { s.b.popDrag = 0; return; } KD.swEnd(s); };
    cvs.addEventListener('pointerup', up); cvs.addEventListener('pointercancel', up); } }
