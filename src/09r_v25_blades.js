/* ===================== v25 blade shapes for slash skills (playtest: 「斬」 skills looked like squares — use flattened diamonds) =====================
   While a hero skill whose name has 斬／刃／閃 (or a sword / dagger / axe 特技) plays, its particles are drawn as blades:
   slash lines become tapered lozenges with a white edge and a fading after-image, crosses become two lozenges, and the
   square sparks / shards / motes become small flat diamonds pointing where they fly. */
const SLASH_NAMES = new Set(); // v12.0.1: skills whose motion is a cut (filled in 10w from the skill data), whatever their name
const isSlashName = n => /斬|刃|閃|劈|十字/.test(n || '') || SLASH_NAMES.has(String(n || '').replace(/・.*$/, ''));
function lozenge(x, x1, y1, x2, y2, w) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  x.beginPath(); x.moveTo(x1, y1); x.lineTo(mx + nx, my + ny); x.lineTo(x2, y2); x.lineTo(mx - nx, my - ny); x.closePath(); x.fill();
}
function bladeStroke(x, x1, y1, x2, y2, w, c, a) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ox = -dy / L, oy = dx / L;
  x.fillStyle = c; x.globalAlpha = a * 0.3; lozenge(x, x1 + ox * w * 0.9, y1 + oy * w * 0.9, x2 + ox * w * 0.9, y2 + oy * w * 0.9, w * 0.7); // after-image
  x.globalAlpha = a; lozenge(x, x1, y1, x2, y2, w);
  x.fillStyle = '#ffffff'; x.globalAlpha = Math.min(1, a * 1.3); lozenge(x, lerp(x1, x2, 0.08), lerp(y1, y2, 0.08), lerp(x1, x2, 0.92), lerp(y1, y2, 0.92), Math.max(1, w * 0.36));
}
{ const _dp = drawParticle; drawParticle = function (x, p) {
    if (!p.sl || p.hidden) return _dp(x, p);
    const a = 1 - p.t / p.life;
    if (p.k === 'line') { const g = clamp(p.t / (p.grow || 1), 0, 1); x.save(); bladeStroke(x, p.x1, p.y1, lerp(p.x1, p.x2, g), lerp(p.y1, p.y2, g), Math.max(4, (p.w || 2) * 1.9), p.c, a); x.restore(); return; }
    if (p.k === 'xcut') { const g = Math.min(1, p.t / 4), L = p.r * g, A = Math.min(1, a * 1.5), w = 9 * (0.6 + a / 2); x.save(); bladeStroke(x, p.x - L, p.y - L, p.x + L, p.y + L, w, p.c, A); bladeStroke(x, p.x + L, p.y - L, p.x - L, p.y + L, w, p.c, A); x.restore(); return; }
    const flat = p.k === 'dot' || p.k === 'shard' || p.k === 'streak' || (p.k === 'mote' && !p.to);
    if (flat) {
      const s = p.k === 'streak' ? Math.max(2, (p.len || 4) / 2) : (p.s || 2), ang = p.k === 'shard' ? p.t * (p.spin || 0.3) : (p.vx || p.vy) ? Math.atan2(p.vy || 0, p.vx || 0) : -0.8;
      const L = Math.max(4, s * 2.6), wd = Math.max(1.4, s * 0.75);
      x.save(); x.translate(p.x + (p.k === 'streak' ? (p.len || 4) / 2 : s / 2), p.y + s / 2); x.rotate(ang); x.globalAlpha = p.k === 'dot' ? 1 : Math.max(0, a);
      x.fillStyle = p.c; lozenge(x, -L / 2, 0, L / 2, 0, wd); if (s >= 2) { x.fillStyle = '#ffffff'; lozenge(x, -L / 5, 0, L / 3, 0, wd * 0.45); } x.restore(); return;
    }
    return _dp(x, p);
  };
}
