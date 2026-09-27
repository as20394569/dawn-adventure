/* ===================== v19.1 Q版 battle monsters (player request: use the Codex chibis in battle too) =====================
   Monsters are drawn as chibis at an integer scale (×2, giants ×3 — the same pixel density as the hero's paper doll).
   Battle action sets come from Codex (art/battle/chibi); until a set exists the field walker frames are used.
   Recolour variants reuse their base chibi with the same colour shift as the realistic strips.
   Settings → 怪物造型: Q版 / 寫實. */
const BATTLE_PXC = {};
for (const k in (typeof BATTLE_PXC_SRC !== 'undefined' ? BATTLE_PXC_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = BATTLE_PXC_SRC[k]; BATTLE_PXC[k] = im; }
const chibiOn = () => Game.settings.chibi !== false;
const chibiOwn = k => BATTLE_PXC[k] && BATTLE_PXC[k].ok;
const chibiBase = k => chibiOwn(k) ? k : (HD_RIG_OF[k] && chibiOwn(HD_RIG_OF[k]) && ART[k] && ART[HD_RIG_OF[k]] ? HD_RIG_OF[k] : null);
const CHIBI_VAR = {};
function artShift(k, b) { // median hue / saturation / lightness shift between two ART definitions (same idea as pxVariant)
  const A = ART[b].parts, V = ART[k].parts, dh = [], rs = [], rl = [];
  const walk = (pa, pv) => { if (!pa || !pv) return; if (pa.c && pv.c && pa.c[0] === '#' && pv.c[0] === '#') { const [h1, s1, l1] = rgb2hsl(...hex2rgb(pa.c)), [h2, s2, l2] = rgb2hsl(...hex2rgb(pv.c)); dh.push(((h2 - h1 + 540) % 360) - 180); rs.push(s1 > 0.05 ? s2 / s1 : 1); rl.push(l1 > 0.05 ? l2 / l1 : 1); } if (pa.u && pv.u) pa.u.forEach((q, i) => walk(q, pv.u[i])); };
  A.forEach((q, i) => walk(q, V[i])); const med = a => { const t = a.slice().sort((x, y) => x - y); return t.length ? t[t.length >> 1] : 0; };
  return [med(dh), med(rs) || 1, med(rl) || 1];
}
function chibiImage(k) {
  const b = chibiBase(k); if (!b) return null; if (b === k) return BATTLE_PXC[k]; if (CHIBI_VAR[k]) return CHIBI_VAR[k];
  const src = BATTLE_PXC[b], [DH, KS, KL] = artShift(k, b), c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0);
  const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const [h, s2, l] = rgb2hsl(d[i], d[i + 1], d[i + 2]); const [r, g, bb] = hex2rgb(hsl2hex(h + DH, s2 * KS, l * KL)); d[i] = r; d[i + 1] = g; d[i + 2] = bb; }
  x.putImageData(id, 0, 0); c.ok = true; return CHIBI_VAR[k] = c;
}
const chibiReady = k => !!chibiBase(k);
{ const _ps = pxSpec; pxSpec = function (key) {
    if (!chibiOn() || !chibiReady(key)) return _ps(key);
    const im = chibiImage(key), meta = BATTLE_PXC_META[chibiBase(key)], w = meta.w, h = meta.h, cw = w + PX_PAD * 2, ch = h + PX_PAD + 1;
    return { im, meta, w, h, cw, ch, chibi: 1, sp: key, bb: { cx: PX_PAD + Math.floor(w / 2), top: PX_PAD, bot: PX_PAD + h - 1, w, h } };
  };
}
/* v20.6 idle: the Codex idle2 frames only shifted the upper body 1px over fixed feet, which read as a twitching head (playtest).
   Idle now uses frame 1 only: grounded monsters breathe (the whole body squashes 0–2px toward the feet, nearest-neighbour so the
   drop is spread over the body); floaters (wings / flames / ghosts / orbs) bob up and down as one piece above their shadow. */
const CHIBI_FLOAT = new Set(['duskMoth', 'moonSprite', 'voidEye']);
const chibiFloats = k => CHIBI_FLOAT.has(k) || ['buzz', 'flame', 'lamp', 'ghost'].includes(hdRig(k).kind);
{ const _pr = pxRender; pxRender = function (A, S, T, tint) {
    if (!S.chibi || !S.meta || A.state !== 'idle') return _pr(A, S, T, tint);
    if (!A.pcv || A.pcv.width !== S.cw) { A.pcv = mkCanvas(S.cw, S.ch); A.pcvT = mkCanvas(S.cw, S.ch); }
    const cv = tint ? A.pcvT : A.pcv, x = cv.getContext('2d'), f = S.meta.frames.idle[0], big = S.h > 80, p = ((T + A.phase) % HD_IDLE_PERIOD) / HD_IDLE_PERIOD;
    if (S.float === undefined) S.float = chibiFloats(S.sp);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cv.width, cv.height); x.imageSmoothingEnabled = false;
    if (S.float) { const dy = -Math.round((big ? 3 : 2) * (0.5 + 0.5 * Math.sin(TAU * p))); x.drawImage(S.im, f * S.w, 0, S.w, S.h, PX_PAD, PX_PAD + dy, S.w, S.h); }
    else { const amp = big ? 3 : hdRig(S.sp).kind === 'slime' ? 3 : 2, s = Math.round(amp * (0.5 - 0.5 * Math.cos(TAU * p))); x.drawImage(S.im, f * S.w, 0, S.w, S.h, PX_PAD, PX_PAD + s, S.w, S.h - s); }
    if (tint) { x.globalCompositeOperation = 'source-in'; x.fillStyle = tint; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over'; }
    cv.ds = 1; cv.bb = S.bb; cv.px = true; return cv;
  };
}
