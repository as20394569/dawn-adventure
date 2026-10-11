/* ===================== v12.118 魔物特效換成新版畫法（玩家 2026-10-11：「魔物特效也改成現在技能這樣的新版效果」） =====================
   魔物將近 300 招的特效，都是用 07d 的 30 種「零件」組出來的（爪痕・利牙・黏液・水珠・泡泡・碎片・岩石・煙・裂環・閃電・火焰・荊棘・羽毛・
   音符・蛛網・骷髏・符文・骨頭・飛刀・金幣・光暈・閃光・裂痕・鬼手・詛咒・葉子・光束・怒氣……）。
   這裡把每一種零件換成新特效的畫法：不再描粗黑框，改成「外發光（相加）→ 暗邊 → 主色 → 亮芯」四層，顏色從原本零件的顏色推出來
   （亮芯偏白、外發光更飽和），所以每一招還是原本的顏色和動作，只是看起來跟主角的新招同一套。
   先只在特效測試版（MFX16.live）；玩家看過說好才放進正式版。 */
const MFX16 = { live: true, pal: {} }; // v12.122 放上正式版
MFX16.palOf = c => { if (!c || typeof c !== 'string' || c[0] !== '#') c = '#c8c8d0'; if (MFX16.pal[c]) return MFX16.pal[c];
  const [h, s, l] = rgb2hsl(...hex2rgb(c));
  return MFX16.pal[c] = { core: hsl2hex(h, s * 0.5, Math.min(0.97, l + (1 - l) * 0.75)), mid: hsl2hex(h, Math.min(1, s * 1.05), Math.min(0.85, Math.max(0.3, l))), glow: hsl2hex(h, Math.min(1, s * 1.25 + 0.1), Math.min(0.62, Math.max(0.42, l))), edge: hsl2hex(h, s, Math.max(0.06, l * 0.3)) }; };
// 線：外發光 → 暗邊 → 主色 → 亮芯
MFX16.line = (x, path, c, a, w) => { const P = MFX16.palOf(c); x.lineJoin = 'round'; x.lineCap = 'round';
  x.globalAlpha = Math.min(1, a); x.globalCompositeOperation = 'lighter'; x.lineWidth = w * 2.4 + 2; x.strokeStyle = HD15.rgba(P.glow, 0.4); path(); x.stroke();
  x.globalCompositeOperation = 'source-over'; x.lineWidth = w + 1.3; x.strokeStyle = HD15.rgba(P.edge, 0.55); path(); x.stroke(); x.lineWidth = w; x.strokeStyle = P.mid; path(); x.stroke();
  x.lineWidth = Math.max(0.7, w * 0.35); x.strokeStyle = P.core; path(); x.stroke(); };
// 面：用一個會縮放的路徑畫四層（s＝放大倍數）
MFX16.fill = (x, path, c, a) => { const P = MFX16.palOf(c); x.globalAlpha = Math.min(1, a); x.globalCompositeOperation = 'lighter'; path(1.4); x.fillStyle = HD15.rgba(P.glow, 0.38); x.fill();
  x.globalCompositeOperation = 'source-over'; path(1.1); x.fillStyle = HD15.rgba(P.edge, 0.5); x.fill(); path(1); x.fillStyle = P.mid; x.fill(); path(0.45); x.fillStyle = P.core; x.fill(); };
MFX16.poly = (x, pts, c, a) => { let cx = 0, cy = 0; for (const [u, v] of pts) { cx += u; cy += v; } cx /= pts.length; cy /= pts.length;
  MFX16.fill(x, s => { x.beginPath(); pts.forEach(([u, v], i) => { const X = cx + (u - cx) * s, Y = cy + (v - cy) * s; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath(); }, c, a); };
MFX16.circ = (x, X, Y, r, c, a) => MFX16.fill(x, s => { x.beginPath(); x.arc(X, Y, Math.max(0.5, r * s), 0, Math.PI * 2); }, c, a);
MFX16.path = pts => () => { const x = MFX16.cx; x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u, v) : x.moveTo(u, v)); };
const MON_PK16 = {
  mgouge(x, p, a) { const g = clamp(p.t / (p.grow || 4), 0, 1), dx = Math.cos(p.ang), dy = Math.sin(p.ang), nx = -dy, ny = dx, pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8 * g, b = Math.sin(Math.PI * u) * (p.bend || 4); pts.push([p.x + dx * p.len * (u - 0.5) + nx * b, p.y + dy * p.len * (u - 0.5) + ny * b]); }
    MFX16.cx = x; MFX16.line(x, MFX16.path(pts), p.c, Math.min(1, a * 1.6), (p.w || 5) * 0.55); },
  mfang(x, p, a) { const g = clamp(p.t / (p.life * 0.4), 0, 1), w = p.w || 30, gap = 14 * (1 - g) + 1, n = 5, tw = w / n, al = Math.min(1, a * 2);
    for (const s of [-1, 1]) { const by = p.y + s * (gap + 5); for (let i = 0; i < n; i++) { const tx = p.x - w / 2 + i * tw; MFX16.poly(x, [[tx, by], [tx + tw, by], [tx + tw / 2, by - s * (i % 2 ? 6 : 9)]], p.c || MC.bone, al); } } },
  mglob(x, p, a) { const r = p.r || 4, al = Math.min(1, a * 2); MFX16.circ(x, p.x, p.y, r, p.c, al); MFX16.circ(x, p.x + r * 0.2, p.y + r + 1, r * 0.35, p.c, al); },
  mdrop(x, p, a) { const r = p.r || 2; MFX16.poly(x, [[p.x, p.y - r * 2.4], [p.x + r, p.y], [p.x, p.y + r], [p.x - r, p.y]], p.c, a); },
  mbubble(x, p, a) { const r = p.r || 4; MFX16.cx = x; MFX16.line(x, () => { x.beginPath(); x.arc(p.x, p.y, r, 0, Math.PI * 2); }, p.c, a, 1.2); x.globalAlpha = a * 0.25; x.fillStyle = MFX16.palOf(p.c).mid; x.beginPath(); x.arc(p.x, p.y, r, 0, Math.PI * 2); x.fill();
    x.globalAlpha = a; x.fillStyle = '#ffffff'; x.fillRect(Math.round(p.x - r / 2), Math.round(p.y - r / 2), 1, 1); },
  mshard(x, p, a) { const r = p.r || 4, rot = (p.rot || 0) + p.t * (p.vr ?? 0.3), pts = []; for (let i = 0; i < 5; i++) { const an = rot + i * 1.2566, rr = r * (i % 2 ? 0.55 : 1) * (1 + ((p.seed || 1) * (i + 3) % 5) / 12); pts.push([p.x + Math.cos(an) * rr, p.y + Math.sin(an) * rr]); } MFX16.poly(x, pts, p.c, Math.min(1, a * 1.8)); },
  mrock(x, p, a) { const r = p.r || 6, rot = (p.rot || 0) + p.t * (p.vr ?? 0.1), pts = []; for (let i = 0; i < 8; i++) { const an = rot + i * 0.785, rr = r * (0.8 + ((i * 7) % 5) / 12); pts.push([p.x + Math.cos(an) * rr, p.y + Math.sin(an) * rr * 0.9]); } MFX16.poly(x, pts, p.c || MC.rock, Math.min(1, a * 2)); },
  mpuff(x, p, a) { const k = p.t / p.life, r = (p.r || 5) * (0.6 + 0.7 * k), P = MFX16.palOf(p.c); x.globalCompositeOperation = 'source-over';
    for (const [dx, dy, s] of [[-0.6, 0.2, 0.8], [0.6, 0.25, 0.75], [0, -0.3, 1.05]]) { const X = p.x + dx * r, Y = p.y + dy * r, R = r * s, g = x.createRadialGradient(X, Y, R * 0.1, X, Y, R);
      g.addColorStop(0, HD15.rgba(P.core, 0.75 * a * (p.op || 0.85))); g.addColorStop(0.55, HD15.rgba(P.mid, 0.55 * a * (p.op || 0.85))); g.addColorStop(1, HD15.rgba(P.mid, 0)); x.fillStyle = g; x.fillRect(X - R, Y - R, R * 2, R * 2); } },
  mjag(x, p, a) { const r = lerp(p.r0, p.r1, p.t / p.life), n = p.n || 14, pts = []; for (let i = 0; i <= n; i++) { const an = i / n * Math.PI * 2 + (p.rot || 0), rr = r * (i % 2 ? 0.72 : 1); pts.push([p.x + Math.cos(an) * rr, p.y + Math.sin(an) * rr * (p.fl || 1)]); }
    MFX16.cx = x; MFX16.line(x, MFX16.path(pts), p.c, a, 1.4); },
  mzap(x, p, a) { const pts = [], n = 6, x1 = p.x1 ?? p.x - 10, y1 = p.y1 ?? p.y - 10, x2 = p.x2 ?? p.x + 10, y2 = p.y2 ?? p.y + 10; for (let i = 0; i <= n; i++) pts.push([lerp(x1, x2, i / n) + (i % n ? rnd(-5, 5) : 0), lerp(y1, y2, i / n) + (i % n ? rnd(-5, 5) : 0)]);
    MFX16.cx = x; MFX16.line(x, MFX16.path(pts), p.c || MC.volt, a, 1.6); },
  mflame(x, p, a) { const s0 = (p.s || 5) * (0.4 + 0.6 * a), X = p.x, Y = p.y;
    MFX16.fill(x, k => { const s = s0 * k; x.beginPath(); x.moveTo(X, Y - s * 2.2); x.quadraticCurveTo(X + s * 1.2, Y - s * 0.4, X + s * 0.8, Y + s * 0.5); x.quadraticCurveTo(X, Y + s * 1.2, X - s * 0.8, Y + s * 0.5); x.quadraticCurveTo(X - s * 1.2, Y - s * 0.4, X, Y - s * 2.2); }, p.c || MC.fire, Math.min(1, a * 1.5)); },
  mthorn(x, p, a) { const g = clamp(p.t / (p.grow || 6), 0, 1), X2 = lerp(p.x1, p.x2, g), Y2 = lerp(p.y1, p.y2, g), L = Math.hypot(X2 - p.x1, Y2 - p.y1) || 1, nx = -(Y2 - p.y1) / L, ny = (X2 - p.x1) / L, al = Math.min(1, a * 1.8);
    MFX16.cx = x; MFX16.line(x, MFX16.path([[p.x1, p.y1], [X2, Y2]]), p.c, al, p.w || 2);
    for (let d = 5, s = 1; d < L; d += 5, s = -s) { const bx = lerp(p.x1, X2, d / L), by = lerp(p.y1, Y2, d / L); MFX16.poly(x, [[bx, by], [bx + nx * 3.5 * s + (X2 - p.x1) / L * 2, by + ny * 3.5 * s + (Y2 - p.y1) / L * 2], [bx + (X2 - p.x1) / L * 2.5, by + (Y2 - p.y1) / L * 2.5]], p.c2 || p.c, al); } },
  mfeather(x, p, a) { const rot = (p.rot || 0) + p.t * 0.2; x.save(); x.translate(p.x, p.y); x.rotate(rot); MFX16.fill(x, s => { x.beginPath(); x.ellipse(0, 0, 5 * s, 1.8 * s, 0, 0, Math.PI * 2); }, p.c || MC.feather, a); x.restore(); },
  mnote(x, p, a) { const X = p.x, Y = p.y; MFX16.circ(x, X, Y, 2.3, p.c, a); MFX16.cx = x; MFX16.line(x, () => { x.beginPath(); x.moveTo(X + 2, Y); x.lineTo(X + 2, Y - 8); x.lineTo(X + 6, Y - 5); }, p.c, a, 1); },
  mweb(x, p, a) { const r = (p.r || 22) * clamp(p.t / 8, 0.2, 1); MFX16.cx = x; MFX16.line(x, () => { x.beginPath(); for (let i = 0; i < 8; i++) { const an = i * 0.785; x.moveTo(p.x, p.y); x.lineTo(p.x + Math.cos(an) * r, p.y + Math.sin(an) * r); }
      for (const k of [0.35, 0.65, 1]) for (let i = 0; i <= 8; i++) { const an = i * 0.785, X = p.x + Math.cos(an) * r * k, Y = p.y + Math.sin(an) * r * k; i ? x.lineTo(X, Y) : x.moveTo(X, Y); } }, p.c || MC.silk, a, 0.8); },
  mskull(x, p, a) { const X = p.x, Y = p.y, s = p.s || 1, c = p.c || MC.bone; if (p.tail) MFX16.poly(x, [[X - 3 * s, Y + 3 * s], [X + 3 * s, Y + 3 * s], [X, Y + 12 * s]], c, a * 0.5);
    MFX16.circ(x, X, Y, 4 * s, c, a); MFX16.poly(x, [[X - 2.5 * s, Y + 2 * s], [X + 2.5 * s, Y + 2 * s], [X + 2 * s, Y + 5 * s], [X - 2 * s, Y + 5 * s]], c, a);
    x.globalCompositeOperation = 'source-over'; x.globalAlpha = a; x.fillStyle = MFX16.palOf(c).edge; x.fillRect(Math.round(X - 2.5 * s), Math.round(Y - 1 * s), Math.ceil(1.6 * s), Math.ceil(2 * s)); x.fillRect(Math.round(X + 1 * s), Math.round(Y - 1 * s), Math.ceil(1.6 * s), Math.ceil(2 * s)); },
  mrune(x, p, a) { const rot = (p.rot || 0) + p.t * 0.08, s = p.s || 5; x.save(); x.translate(p.x, p.y); x.rotate(rot); MFX16.cx = x;
    MFX16.line(x, () => { x.beginPath(); x.rect(-s, -s, s * 2, s * 2); x.moveTo(-s, 0); x.lineTo(0, -s * 0.5); x.lineTo(s, 0); x.moveTo(0, -s * 0.5); x.lineTo(0, s); }, p.c || '#60e8ff', a, 1.1); x.restore(); },
  mbone(x, p, a) { const rot = (p.rot || 0) + p.t * (p.vr ?? 0.4), L = p.L || 7, c = p.c || MC.bone, al = Math.min(1, a * 2); x.save(); x.translate(p.x, p.y); x.rotate(rot); MFX16.cx = x;
    MFX16.line(x, () => { x.beginPath(); x.moveTo(-L, 0); x.lineTo(L, 0); }, c, al, 2.4); for (const e of [-L, L]) for (const o of [-1.6, 1.6]) MFX16.circ(x, e, o, 2, c, al); x.restore(); },
  mknife(x, p, a) { const rot = p.rot ?? Math.atan2((p.ty ?? p.y) - p.y + 0.01, (p.tx ?? p.x) - p.x + 0.01) + p.t * (p.vr || 0), al = Math.min(1, a * 2); x.save(); x.translate(p.x, p.y); x.rotate(rot);
    MFX16.poly(x, [[-2, -1.6], [7, 0], [-2, 1.6]], p.c || '#c8d0dc', al); MFX16.poly(x, [[-6, -1.2], [-2, -1.2], [-2, 1.2], [-6, 1.2]], '#8a5a30', al); x.restore(); },
  mcoin(x, p, a) { const rx = Math.max(0.6, Math.abs(Math.cos(p.t / 3)) * 3); MFX16.fill(x, s => { x.beginPath(); x.ellipse(p.x, p.y, rx * s, 3 * s, 0, 0, Math.PI * 2); }, '#ffd040', a); },
  maura(x, p, a) { const r = lerp(p.r0 || 10, p.r1 || 36, p.t / p.life), P = MFX16.palOf(p.c || '#a01030'), g = x.createRadialGradient(p.x, p.y, r * 0.2, p.x, p.y, r);
    g.addColorStop(0, HD15.rgba(P.glow, 0)); g.addColorStop(0.7, HD15.rgba(P.glow, 0.5 * a)); g.addColorStop(1, HD15.rgba(P.glow, 0)); x.globalCompositeOperation = 'lighter'; x.fillStyle = g; x.fillRect(p.x - r, p.y - r, r * 2, r * 2); x.globalCompositeOperation = 'source-over'; },
  mglint(x, p, a) { const s = 2 + 4 * Math.sin(Math.PI * p.t / p.life); MFX16.poly(x, [[p.x, p.y - s], [p.x + 1, p.y - 1], [p.x + s, p.y], [p.x + 1, p.y + 1], [p.x, p.y + s], [p.x - 1, p.y + 1], [p.x - s, p.y], [p.x - 1, p.y - 1]], p.c || '#ff3040', a); },
  mcrack(x, p, a) { const g = clamp(p.t / 6, 0, 1); if (!p.br) { p.br = []; for (let i = 0; i < (p.n || 5); i++) { const an = Math.PI + i / ((p.n || 5) - 1) * Math.PI + rnd(-2, 2) / 10, pts = [[p.x, p.y]]; let X = p.x, Y = p.y; for (let k = 0; k < 4; k++) { X += Math.cos(an) * 6 + rnd(-2, 2); Y += Math.sin(an) * 2.2 + rnd(-1, 1); pts.push([X, Y]); } p.br.push(pts); } p.br.push(p.br[0].map(([u, v]) => [2 * p.x - u, v])); }
    MFX16.cx = x; for (const pts of p.br) { const m = Math.max(1, Math.round(pts.length * g)); MFX16.line(x, MFX16.path(pts.slice(0, m)), p.c || '#ffb060', a, 1); } },
  mhand(x, p, a) { const X = p.x, Y = p.y, c = p.c || MC.ghost, al = a * 0.9; MFX16.fill(x, s => { x.beginPath(); x.moveTo(X - 4 * s, Y + 10); x.lineTo(X - 4 * s, Y); x.arc(X, Y, 4.5 * s, Math.PI, 0); x.lineTo(X + 4 * s, Y + 10); x.closePath(); }, c, al);
    for (let i = 0; i < 4; i++) { const fx = X - 3.5 + i * 2.3; MFX16.poly(x, [[fx - 0.8, Y - 2], [fx + 0.8, Y - 2], [fx + 0.4, Y - 8 - (i % 2) * 2], [fx - 0.4, Y - 8 - (i % 2) * 2]], c, al); } },
  mcurse(x, p, a) { const r = lerp(p.r0 || 26, p.r1 || 6, p.t / p.life), rot = p.t * 0.25; MFX16.cx = x; for (let k = 0; k < 3; k++) { const a0 = rot + k * 2.094; MFX16.line(x, () => { x.beginPath(); x.arc(p.x, p.y, r, a0, a0 + 1.4); }, p.c || MC.dark, a, 2); } },
  mleaf(x, p, a) { const rot = p.t * 0.5; x.save(); x.translate(p.x, p.y); x.rotate(rot); MFX16.poly(x, [[-6, 0], [0, -2.5], [6, 0], [0, 2.5]], p.c || MC.leaf2, Math.min(1, a * 2)); x.restore(); },
  mbeam(x, p, a) { const g = clamp(p.t / (p.grow || 5), 0, 1), X2 = lerp(p.x1, p.x2, g), Y2 = lerp(p.y1, p.y2, g), L = Math.hypot(X2 - p.x1, Y2 - p.y1) || 1, nx = -(Y2 - p.y1) / L, ny = (X2 - p.x1) / L, w = (p.w || 3) * (p.pulse ? 0.7 + 0.3 * Math.sin(p.t) : 1), pts = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10, wob = p.wob ? Math.sin(u * 12 + p.t) * p.wob : 0; pts.push([lerp(p.x1, X2, u) + nx * wob, lerp(p.y1, Y2, u) + ny * wob]); } MFX16.cx = x; MFX16.line(x, MFX16.path(pts), p.c, a, w); },
  manger(x, p, a) { const s = 3 + Math.sin(p.t / 2); MFX16.cx = x; for (let i = 0; i < 4; i++) { const an = i * 1.5708 + 0.785, cx = p.x + Math.cos(an) * s, cy = p.y + Math.sin(an) * s; MFX16.line(x, () => { x.beginPath(); x.arc(cx, cy, 2.4, an + 2.2, an + 4.1); }, p.c || '#ff3040', a, 1.4); } },
};
if (MFX16.live) for (const k in MON_PK16) { const orig = MON_PK[k], f = MON_PK16[k]; MON_PK[k] = function (x, p, a) { if (!HD15.on) return orig(x, p, a); try { f(x, p, a); } catch (e) { x.globalCompositeOperation = 'source-over'; orig(x, p, a); } finally { x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; } }; }
/* ---------- 通用的舊粒子（火花點・星・線・閃電・圓圈・泡泡・小火・弧・新月・六角・光暈）也換成同一套畫法 ----------
   魔物的招（和少數還沒換的舊特效）會用到這些；文字・圖片・全畫面閃光・光柱照舊。 */
const GEN16 = {
  dot(x, p, a) { const P = MFX16.palOf(p.c), s = p.s || 1; x.globalAlpha = Math.min(1, a + 0.3); x.globalCompositeOperation = 'lighter'; x.fillStyle = HD15.rgba(P.glow, 0.45); x.beginPath(); x.arc(p.x + s / 2, p.y + s / 2, s * 1.3 + 0.8, 0, Math.PI * 2); x.fill();
    x.globalCompositeOperation = 'source-over'; x.fillStyle = P.mid; x.fillRect(Math.round(p.x), Math.round(p.y), s, s); if (s > 1) { x.fillStyle = P.core; x.fillRect(Math.round(p.x + s / 4), Math.round(p.y + s / 4), Math.max(1, s / 2), Math.max(1, s / 2)); } },
  star(x, p, a) { const r = 3 + p.t * 1.2; MFX16.poly(x, [[p.x, p.y - r], [p.x + r * 0.22, p.y - r * 0.22], [p.x + r, p.y], [p.x + r * 0.22, p.y + r * 0.22], [p.x, p.y + r], [p.x - r * 0.22, p.y + r * 0.22], [p.x - r, p.y], [p.x - r * 0.22, p.y - r * 0.22]], p.c, a); },
  line(x, p, a) { const g = clamp(p.t / (p.grow || 1), 0, 1); MFX16.cx = x; MFX16.line(x, MFX16.path([[p.x1, p.y1], [lerp(p.x1, p.x2, g), lerp(p.y1, p.y2, g)]]), p.c, a, (p.w || 2) * 0.7); },
  bolt(x, p, a) { MFX16.cx = x; MFX16.line(x, MFX16.path(p.pts), '#f8d030', 1, (p.w || 3) * 0.6); },
  ring(x, p, a) { const r = lerp(p.r0, p.r1, p.t / p.life); MFX16.cx = x; MFX16.line(x, () => { x.beginPath(); x.ellipse(p.x, p.y, Math.max(0.5, r), Math.max(0.5, r * (p.fl || 1)), 0, 0, Math.PI * 2); }, p.c, a, (p.w || 2) * 0.7); },
  circ(x, p, a) { MFX16.circ(x, p.x, p.y, p.r, p.c, 1); },
  bub(x, p, a) { MFX16.cx = x; MFX16.line(x, () => { x.beginPath(); x.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2); }, p.c, 1, 0.7); },
  flame(x, p, a) { const s0 = (p.s * a + 1) * 0.7, X = p.x, Y = p.y - s0 * 0.4; MFX16.fill(x, k => { const s = s0 * k; x.beginPath(); x.moveTo(X, Y - s * 2.2); x.quadraticCurveTo(X + s * 1.2, Y - s * 0.4, X + s * 0.8, Y + s * 0.5); x.quadraticCurveTo(X, Y + s * 1.2, X - s * 0.8, Y + s * 0.5); x.quadraticCurveTo(X - s * 1.2, Y - s * 0.4, X, Y - s * 2.2); }, a > 0.6 ? '#ffd060' : a > 0.3 ? '#f8a030' : '#e05020', 1); },
  arc(x, p, a) { MFX16.cx = x; MFX16.line(x, () => { x.beginPath(); x.ellipse(p.x, p.y, p.r, p.r * 0.5, 0, p.a0 + p.t * 0.25, p.a0 + p.t * 0.25 + 2.2); }, p.c, a, 1.4); },
  cres(x, p, a) { x.save(); x.translate(p.x, p.y); x.rotate(p.ang || 0); MFX16.cx = x; MFX16.line(x, () => { x.beginPath(); x.arc(0, 0, p.r, -1.15, 1.15); }, p.c2 || p.c, Math.min(1, a * 2), (p.w || 6) * 0.55); x.restore(); },
  hex(x, p, a) { const r = lerp(p.r0, p.r1, p.t / p.life); MFX16.cx = x; MFX16.line(x, () => { x.beginPath(); for (let i = 0; i <= 6; i++) { const an = i * Math.PI / 3 + Math.PI / 6, px = p.x + Math.cos(an) * r, py = p.y + Math.sin(an) * r * 0.9; i ? x.lineTo(px, py) : x.moveTo(px, py); } }, p.c, a, 1.4); },
  glow(x, p, a) { const r = p.r * (0.6 + 0.4 * a), P = MFX16.palOf(p.c), gr = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, HD15.rgba(P.core, 0.85)); gr.addColorStop(0.5, HD15.rgba(P.glow, 0.5)); gr.addColorStop(1, HD15.rgba(P.glow, 0));
    x.globalAlpha = a; x.globalCompositeOperation = 'lighter'; x.fillStyle = gr; x.fillRect(p.x - r, p.y - r, r * 2, r * 2); },
};
if (MFX16.live) { const _dp = drawParticle; drawParticle = function (x, p) { const f = GEN16[p.k]; if (!f || p.hidden || p.sl || !HD15.on || typeof p.c !== 'string' && p.k !== 'bolt' && p.k !== 'flame') return _dp(x, p);
    const a = 1 - p.t / p.life; x.save(); try { f(x, p, a); } catch (e) { x.restore(); x.save(); _dp(x, p); } finally { x.restore(); } }; }
