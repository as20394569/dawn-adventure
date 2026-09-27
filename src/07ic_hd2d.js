/* ===================== HD-2D STAGE: depth of field, light shafts, floating motes, bloom, scene lighting =====================
   The pixel-art battle background is kept, but rendered at the screen's real resolution with:
   - depth of field: sky / horizon and the near foreground are softly blurred, the fighting area stays sharp
   - atmospheric haze at the horizon, a warm key light from the upper left and a vignette (baked once per battle)
   - animated light shafts and drifting motes at several depths (near ones large and out of focus)
   - soft contact shadows, a warm/cool light wash on the characters, and a light bloom over the whole stage */
const HD2D_LOOK = {
  field: { key: [255, 236, 190], shaft: 'rgba(255,244,200,', haze: 'rgba(225,240,255,', mote: ['#fff6c8', '#ffffff', '#e8ffd0'], cool: [40, 60, 120], sharp: [96, 150], far: 70 },
  forest: { key: [220, 255, 190], shaft: 'rgba(210,255,170,', haze: 'rgba(170,220,190,', mote: ['#e8ffb0', '#ffffa0', '#b0ffd0'], cool: [10, 40, 50], sharp: [96, 150], far: 72 },
  ruins: { key: [255, 190, 120], shaft: 'rgba(255,200,140,', haze: 'rgba(150,120,170,', mote: ['#ffd8a0', '#ffb070', '#e0d0ff'], cool: [30, 20, 70], sharp: [104, 150], far: 96 },
};
const hd2dLook = kind => HD2D_LOOK[kind] || HD2D_LOOK.field;
function hd2dStage(bg, kind, D) {
  const L = hd2dLook(kind), w = W * D, h = BH * D, c = mkCanvas(w, h), x = c.getContext('2d');
  x.imageSmoothingEnabled = false; x.drawImage(bg, 0, 0, w, h);
  // depth of field: blurred copy (downscale → smooth upscale), faded in above and below the sharp band
  const blur = (src, f) => { const s = mkCanvas(Math.max(1, Math.round(w / f)), Math.max(1, Math.round(h / f))), sx = s.getContext('2d'); sx.imageSmoothingEnabled = true; sx.imageSmoothingQuality = 'high'; sx.drawImage(src, 0, 0, s.width, s.height); const t = mkCanvas(w, h), tx = t.getContext('2d'); tx.imageSmoothingEnabled = true; tx.imageSmoothingQuality = 'high'; tx.drawImage(s, 0, 0, w, h); return t; };
  const band = (t, stops) => { const tx = t.getContext('2d'), g = tx.createLinearGradient(0, 0, 0, h); for (const [y, a] of stops) g.addColorStop(clamp(y / BH, 0, 1), `rgba(0,0,0,${a})`); tx.globalCompositeOperation = 'destination-in'; tx.fillStyle = g; tx.fillRect(0, 0, w, h); x.drawImage(t, 0, 0); };
  band(blur(c, 4), [[0, 0.9], [L.far - 6, 0.85], [L.sharp[0] - 8, 0], [L.sharp[1], 0], [BH, 0.8]]);
  band(blur(c, 9), [[0, 0.35], [L.far - 10, 0.25], [L.far + 6, 0], [BH - 24, 0], [BH, 0.45]]);
  // horizon haze
  const hz = x.createLinearGradient(0, (L.far - 30) * D, 0, (L.far + 34) * D); hz.addColorStop(0, L.haze + '0)'); hz.addColorStop(0.55, L.haze + '0.2)'); hz.addColorStop(1, L.haze + '0)'); x.fillStyle = hz; x.fillRect(0, 0, w, h);
  // key light from the upper left + cool shadow toward the lower right
  x.globalCompositeOperation = 'soft-light';
  const k = x.createRadialGradient(w * 0.1, -h * 0.1, 0, w * 0.1, -h * 0.1, h * 1.1); k.addColorStop(0, `rgba(${L.key},0.5)`); k.addColorStop(1, `rgba(${L.key},0)`); x.fillStyle = k; x.fillRect(0, 0, w, h);
  const cg = x.createLinearGradient(0, 0, w, h); cg.addColorStop(0.45, `rgba(${L.cool},0)`); cg.addColorStop(1, `rgba(${L.cool},0.6)`); x.fillStyle = cg; x.fillRect(0, 0, w, h);
  x.globalCompositeOperation = 'source-over';
  const v = x.createRadialGradient(w / 2, h * 0.52, h * 0.25, w / 2, h * 0.52, h * 0.78); v.addColorStop(0, 'rgba(6,4,16,0)'); v.addColorStop(1, 'rgba(6,4,16,0.62)'); x.fillStyle = v; x.fillRect(0, 0, w, h);
  return c;
}
// soft sprite for motes (drawn scaled; big near ones look out of focus)
let HD2D_DOT = null;
function hd2dDot() { if (HD2D_DOT) return HD2D_DOT; const c = mkCanvas(32, 32), x = c.getContext('2d'), g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return HD2D_DOT = c; }
const hd2dTintDot = {};
function hd2dColDot(col) { if (hd2dTintDot[col]) return hd2dTintDot[col]; const c = mkCanvas(32, 32), x = c.getContext('2d'); x.drawImage(hd2dDot(), 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, 32, 32); return hd2dTintDot[col] = c; }
function hd2dInit(b) {
  const L = hd2dLook(b.cfgBg), r = srand(11), motes = [];
  for (let i = 0; i < 34; i++) motes.push({ x: r() * W, y: r() * BH, z: r(), ph: r() * 6.28, sp: 0.1 + r() * 0.25, c: L.mote[i % L.mote.length] });
  b.hd2d = { L, motes, D: 0, stage: null, bloom: null };
}
function hd2dStageFor(b) { const S = b.hd2d, D = Math.min(SCALE, HD_QUALITY.low ? 2 : 3); if (!S.stage || S.D !== D) { S.stage = hd2dStage(b.bg, b.cfgBg, D); S.D = D; S.bloom = mkCanvas(Math.ceil(W / 2), Math.ceil(BH / 2)); } return S.stage; }
function hd2dMotes(b, x, near) {
  const S = b.hd2d, t = b.t;
  for (const m of S.motes) { if ((m.z > 0.72) !== near) continue;
    const X = (m.x + Math.sin(t * 0.01 * m.sp * 6 + m.ph) * 6 + t * m.sp * 0.15) % (W + 20) - 10, Y = (m.y - t * m.sp * 0.25 % (BH + 20) + BH + 20) % (BH + 20) - 10;
    const s = near ? 3 + (m.z - 0.72) * 30 : 0.8 + m.z * 2.4, a = (near ? 0.22 : 0.35 + m.z * 0.4) * (0.6 + 0.4 * Math.sin(t * 0.05 + m.ph));
    x.globalAlpha = a; x.drawImage(hd2dColDot(m.c), X - s, Y - s, s * 2, s * 2); }
  x.globalAlpha = 1;
}
function hd2dShafts(b, x) {
  const L = b.hd2d.L, t = b.t; x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { const x0 = 14 + i * 34, sway = Math.sin(t * 0.012 + i * 1.7), a = 0.05 + 0.035 * (0.5 + 0.5 * sway), wdt = 12 + i * 5;
    const g = x.createLinearGradient(x0, 0, x0 + 70, BH * 0.75); g.addColorStop(0, L.shaft + (a * 1.4) + ')'); g.addColorStop(1, L.shaft + '0)'); x.fillStyle = g;
    x.beginPath(); x.moveTo(x0, -4); x.lineTo(x0 + wdt, -4); x.lineTo(x0 + wdt + 78 + sway * 3, BH * 0.8); x.lineTo(x0 + 60 + sway * 3, BH * 0.8); x.closePath(); x.fill(); }
  x.restore();
}
// warm key light / cool shadow wash on an actor canvas (keeps characters lit like the scene)
function hd2dLightActor(cv, L) {
  const x = cv.getContext('2d'); x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop';
  const g = x.createLinearGradient(0, 0, cv.width, cv.height); g.addColorStop(0, `rgba(${L.key},0.22)`); g.addColorStop(0.5, `rgba(${L.key},0)`); g.addColorStop(0.62, `rgba(${L.cool},0)`); g.addColorStop(1, `rgba(${L.cool},0.3)`);
  x.fillStyle = g; x.fillRect(0, 0, cv.width, cv.height); x.restore();
}
function hd2dSoftShadow(x, cx, cy, rx, ry, a) { x.save(); x.translate(cx, cy); x.scale(1, ry / rx); const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(10,8,20,${a})`); g.addColorStop(0.6, `rgba(10,8,20,${a * 0.6})`); g.addColorStop(1, 'rgba(10,8,20,0)'); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, Math.PI * 2); x.fill(); x.restore(); }
// bloom: downsample the finished stage and add it back softly
function hd2dBloom(b, x) {
  const S = b.hd2d, cv = x.canvas, bl = S.bloom; if (!bl) return; const bx = bl.getContext('2d');
  bx.imageSmoothingEnabled = true; bx.globalCompositeOperation = 'copy'; const ch = Math.round(cv.height * BH / H); bx.drawImage(cv, 0, 0, cv.width, ch, 0, 0, bl.width, bl.height);
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = true; x.globalCompositeOperation = 'screen'; x.globalAlpha = 0.15; x.drawImage(bl, 0, 0, cv.width, ch); x.restore();
}
{ const _b = buildBattleBG; buildBattleBG = function (kind) { const c = _b(kind); c.kind = kind || 'field'; return c; }; }
