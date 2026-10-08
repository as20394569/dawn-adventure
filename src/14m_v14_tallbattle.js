/* ===================== v14.12 戰鬥畫面填滿手機 =====================
   玩家：「目前只想調整戰鬥畫面的各項比例」→ 戰鬥時畫面變高（長手機最多 176×384，舊手機・電腦維持 176×256），地圖和選單不動。
   · 多出來的高度：魔物往下移（地面跟著放大），手牌變大（33×52 → 35×58 → 35×64，三行字），卡片說明移到魔物腳下
   · 戰鬥裡的字最小 8 號：太長的字往左右壓扁，不再縮小 */

// the height the battle screen should have on this screen: as tall as the phone allows (portrait), never shorter than 256
KD.battleH = () => { const iw = Math.min(window.innerWidth || 0, 560), ih = window.innerHeight || 0; if (iw < 50 || ih < 50) return H_BASE;
  return Math.max(H_BASE, Math.min(384, Math.floor(W * (ih - 16) / iw / 2) * 2)); };
KD.setH = h => { if (h === H) return; H = h; TB_Y = H - TB_H; const E = bxE(); BB_Y = H - 38; BB_H = 38; HERO_FOOT = 200 + E; HERO_Y = 136 + E; HBAR_Y = 205 + E;
  const de = document.documentElement; if (de && de.style) { if (E) { de.style.setProperty('--ar', W + '/' + H); de.style.setProperty('--arw', String(W / H)); } else { de.style.removeProperty('--ar'); de.style.removeProperty('--arw'); } }
  if (SCALE) { cv.width = W * SCALE; cv.height = H * SCALE; }
  const b = Game.scene; if (b instanceof Battle && b.layout) b.layout(true);
  if (typeof fitScreen === 'function') { fitScreen(); if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => fitScreen()); } };
KD.wantH = () => { const b = Game.scene; return !Game.noV14 && b instanceof Battle && b.core && KD.on(b.core) ? KD.battleH() : H_BASE; };
{ const _r = render; render = function () { const h = KD.wantH(); if (h !== H) KD.setH(h); return _r.apply(this, arguments); }; }

// screens made for 176×256 that open during a battle (the card pick after winning, a boss's legendary card): centred on the taller screen, taps follow
KD.TDY = 0;
{ const _tr = touchRegion; touchRegion = function (x, y, w, h, fn) { return _tr.call(this, x, y + KD.TDY, w, h, fn); }; }
KD.centered = fn => function* (...a) { const _push = UI.push; UI.push = function (u) { if (u && typeof u.draw === 'function' && !u._c14) { const d = u.draw; u._c14 = 1;
      u.draw = function (x) { const dy = Math.round(bxE() / 2); if (!dy) return d.call(this, x); x.save(); x.fillStyle = '#06040e'; x.fillRect(0, 0, W, H); x.translate(0, dy); KD.TDY += dy; try { return d.call(this, x); } finally { KD.TDY -= dy; x.restore(); } }; }
    return _push.apply(this, arguments); };
  try { return yield* fn.apply(this, a); } finally { UI.push = _push; } };
KD.pick3 = KD.centered(KD.pick3); KD.showCard = KD.centered(KD.showCard);
// v14.13: the hero stands on the field, just above the HP / energy row (玩家：「戰鬥中好像玩家變成不必要了」— the hero was drawn under the hand and the HUD)
KD.heroFoot = () => { const b = Game.scene; if (!Game.noV14 && b instanceof Battle && b.core && KD.on(b.core)) return KD.BL().hudY - 2; return 200 + bxE(); };
{ const _r = render; render = function () { const f = KD.heroFoot(); if (f !== HERO_FOOT) { HERO_FOOT = f; HERO_Y = f - 64; HBAR_Y = f + 5; } return _r.apply(this, arguments); }; }
// …and steps toward the monster when an attack card goes off
{ const H = Battle.prototype.handlers, _su = H.SKILL_USE; H.SKILL_USE = function* (e, s, t, P) { const id = P && P.skill && /^k14_/.test(P.skill) ? P.skill.slice(4) : null, C = id && KD.CARDS[id];
    if (this.k14 && s && s.hero && C && C.type === 'atk' && e.tgts && e.tgts.some(x => x !== 'H')) { this.tgtV = this.views[e.tgts.find(x => x !== 'H')] || this.tgtV; yield* this.lunge(s, 12, 4); }
    return yield* _su.call(this, e, s, t, P); }; }
