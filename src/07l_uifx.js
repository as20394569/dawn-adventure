/* ===================== v19 status icons & status effect animations (drawn by Codex, art/ui → UI_PX_SRC) =====================
   - status / condition badges become pixel icons (毒・麻・眠・燒・濕・護盾・纏繞)
   - stat stages show as ↑↓ icons (物攻・物防・魔攻・魔防・速度) next to the status icons, on both sides
   - buff / debuff / heal / poison / paralysis / sleep / burn / shield play 6-frame animations */
const UI_PX = {};
for (const k in (typeof UI_PX_SRC !== 'undefined' ? UI_PX_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = UI_PX_SRC[k]; UI_PX[k] = im; }
const ICON_IDX = {}; ((typeof UI_PX_META !== 'undefined' && UI_PX_META.icons) || []).forEach((k, i) => ICON_IDX[k] = i);
const ICON_SZ = (typeof UI_PX_META !== 'undefined' && UI_PX_META.icon) || 12, UIFX_SZ = (typeof UI_PX_META !== 'undefined' && UI_PX_META.fx) || 64;
function drawIcon(x, key, X, Y) { const im = UI_PX.icons; if (!im || !im.ok || ICON_IDX[key] === undefined) return false; x.drawImage(im, ICON_IDX[key] * ICON_SZ, 0, ICON_SZ, ICON_SZ, X, Y, ICON_SZ, ICON_SZ); return true; }
{ const _br = badgeRow; badgeRow = function (x, list, X, Y) { for (const b of list) if (b) { if (drawIcon(x, b, X, Y - 1)) X += ICON_SZ + 2; else { statusBadge(x, b, X, Y); X += 18; } } }; }
function drawStageIcons(x, b, X, Y, max = 4) {
  let n = 0; for (const k of ['atk', 'def', 'spa', 'spd', 'spe']) { const v = b.stages && b.stages[k]; if (!v || n >= max) continue;
    if (drawIcon(x, k + (v > 0 ? '_up' : '_down'), X, Y)) { if (Math.abs(v) > 1) Font.draw(x, String(Math.abs(v)), X + ICON_SZ - 3, Y + 3, v > 0 ? '#ffd070' : '#9ac0ff', '#000000', 7); X += ICON_SZ + 2; n++; } }
  return X;
}
{ const _bf = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) {
    _bf.call(this, x); const F = this.F; if (!UI_PX.icons || !UI_PX.icons.ok || this.boxF < -20 || this.alphaF <= 0) return;
    const a = clamp((this.boxF + 30) / 34, 0, 1); x.globalAlpha = a; const n = ['atk', 'def', 'spa', 'spd', 'spe'].filter(k => F.stages[k]).length; drawStageIcons(x, F, (W + 120) / 2 - 4 - Math.min(4, n) * (ICON_SZ + 2), 6 + 34 + plateExtra()); x.globalAlpha = 1;
  };
  const _bh = Battle.prototype.drawBoxH; Battle.prototype.drawBoxH = function (x) {
    _bh.call(this, x); const Y = Math.round(this.boxH), H = this.H; if (Y >= BH || !UI_PX.icons || !UI_PX.icons.ok) return;
    const P = heroIconPos(this); drawStageIcons(x, H, P.x + P.nb * (ICON_SZ + 2), P.y);
  };
}
// animated effects
MON_PK.uifx = (x, p) => { const im = UI_PX['fx_' + p.fx]; if (!im || !im.ok) return; const n = Math.max(1, Math.round(im.width / UIFX_SZ)), f = Math.min(n - 1, Math.floor(p.t / p.life * n)), s = p.s || UIFX_SZ;
  x.globalAlpha = p.t > p.life - 5 ? Math.max(0, (p.life - p.t) / 5) : 1; x.imageSmoothingEnabled = false; x.drawImage(im, f * UIFX_SZ, 0, UIFX_SZ, UIFX_SZ, Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s); };
const uiFxOk = k => UI_PX['fx_' + k] && UI_PX['fx_' + k].ok;
function* uiFx(b, k, U, life = 30, dy = 0, hold = 22) { if (!uiFxOk(k)) return false; b.spawn({ k: 'uifx', fx: k, x: U.x, y: U.y + dy, life }); yield* wait(hold); return true; }
{ const S = FX.statUpFx, D = FX.statDownFx, P = FX.psnFx, B = FX.burnFx, Z = FX.zzz, HL = FX.heal, G = FX.guard, BA = FX.barrier;
  FX.statUpFx = function* (U) { if (!(yield* uiFx(this, 'buff_up', U, 30, -8))) yield* S.call(this, U); };
  FX.statDownFx = function* (U) { if (!(yield* uiFx(this, 'buff_down', U, 30, -4))) yield* D.call(this, U); };
  FX.psnFx = function* (U, T) { const P0 = T || U; Sound.sfx('poison'); if (!(yield* uiFx(this, 'poison', P0, 30, -2))) yield* P.call(this, U, T); };
  FX.burnFx = function* (U, T) { const P0 = T || U; Sound.sfx('fire'); if (!(yield* uiFx(this, 'burn', P0, 30, -4))) yield* B.call(this, U, T); };
  FX.zzz = function* (U, T) { const P0 = T || U; if (!(yield* uiFx(this, 'sleep', { x: P0.x + 10, y: P0.y - 14 }, 34, 0, 26))) yield* Z.call(this, U, T); };
  FX.heal = function* (U) { uiFxOk('heal') && this.spawn({ k: 'uifx', fx: 'heal', x: U.x, y: U.y - 6, life: 32 }); yield* HL.call(this, U); };
  FX.guard = function* (U) { uiFxOk('shield') && this.spawn({ k: 'uifx', fx: 'shield', x: U.x, y: U.y, life: 30 }); yield* G.call(this, U); };
  if (BA) FX.barrier = function* (U) { uiFxOk('shield') && this.spawn({ k: 'uifx', fx: 'shield', x: U.x, y: U.y, life: 30 }); yield* BA.call(this, U); };
}
{ const _inf = Battle.prototype.inflict; Battle.prototype.inflict = function* (b, s, secondary) {
    if (s === 'par' && !b.status && !(!b.hero && famOf(b) && famOf(b).immune.includes(s)) && uiFxOk('paralyze')) this.spawn({ k: 'uifx', fx: 'paralyze', x: this.center(b).x, y: this.center(b).y, life: 30 });
    yield* _inf.call(this, b, s, secondary);
  };
}
