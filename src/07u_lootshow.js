/* ===================== v20.7 loot showcase (playtest: after-battle text still overflowed; "make gear drops an animation + showcase") =====================
   A dropped piece of gear no longer comes as two long text boxes. Instead:
   1. a glowing orb in the quality colour pops out of the fallen monster, arcs to the middle of the stage and bursts;
   2. a showcase card slides in: light rays (stronger for 紅 / 金), the gear drawn on the hero doll (or an accessory charm),
      the name in its quality colour, slot / kind, stats, affixes and special effects (wrapped to the card), A to continue.
   Level-up: the LEVEL UP! pop now sits over the hero's head so the stat window doesn't cover it. */
function lootIcon(g) { // the gear on the hero doll (wearables) or a charm glyph (accessories), 3x
  const B = GEAR[g.b]; if (B.look && B.slot !== 'acc') { const L = { head: null, body: 'uniform', feet: 'school', weapon: null }; L[B.slot] = B.look; try { return { doll: heroFramesLook(L).down[0] }; } catch (e) { } }
  return null;
}
function drawCharm(x, cx, cy, col, t) {
  x.save(); x.translate(cx, cy); x.strokeStyle = '#10121e'; x.lineWidth = 4; x.beginPath(); x.arc(0, -10, 6, Math.PI * 0.15, Math.PI * 0.85, true); x.stroke(); x.strokeStyle = '#d8c080'; x.lineWidth = 2; x.stroke();
  x.fillStyle = '#10121e'; x.beginPath(); x.moveTo(0, -6); x.lineTo(9, 3); x.lineTo(0, 14); x.lineTo(-9, 3); x.closePath(); x.fill();
  x.fillStyle = col; x.beginPath(); x.moveTo(0, -3); x.lineTo(6, 3); x.lineTo(0, 11); x.lineTo(-6, 3); x.closePath(); x.fill();
  x.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.3 * Math.sin(t / 8)) + ')'; x.fillRect(-2, -1, 2, 4); x.restore();
}
Battle.prototype.lootShow = function* (g, head) {
  const q = g.q || 1, col = gCol(g), [cr, cg2, cb] = hex2rgb(col), F = this.F, C = this.center(F), T = { x: 88, y: 96 };
  // 1) the orb
  Sound.sfx(q >= 3 ? 'charge' : 'item'); const orb = { t: 0 }; const u = { draw: x => { const k = Math.min(1, orb.t / 26), e = 1 - Math.pow(1 - k, 2), X = lerp(C.x, T.x, e), Y = lerp(C.y, T.y, e) - Math.sin(k * Math.PI) * 34;
      const R = 7 + Math.sin(orb.t / 3) * 1.5; const gr = x.createRadialGradient(X, Y, 0, X, Y, R * 2.6); gr.addColorStop(0, `rgba(${cr},${cg2},${cb},0.9)`); gr.addColorStop(1, `rgba(${cr},${cg2},${cb},0)`); x.fillStyle = gr; x.fillRect(X - R * 3, Y - R * 3, R * 6, R * 6);
      x.fillStyle = '#ffffff'; x.beginPath(); x.arc(X, Y, R * 0.45, 0, 7); x.fill(); } };
  UI.push(u); for (let i = 0; i < 28; i++) { orb.t++; if (i % 3 === 0) { const k = Math.min(1, orb.t / 26), e = 1 - Math.pow(1 - k, 2); this.spawn({ k: 'dot', x: lerp(C.x, T.x, e), y: lerp(C.y, T.y, e) - Math.sin(k * Math.PI) * 34, vx: rnd(-0.4, 0.4), vy: rnd(-0.2, 0.6), c: pick([col, '#ffffff']), s: 1, life: 14 }); } yield; }
  UI.remove(u); this.sparks(T.x, T.y, 18 + q * 8, [col, '#ffffff', shade(col, 0.4)], 2.6, 24, 0.06); this.spawn({ k: 'flash', c: col, a: q >= 3 ? 0.45 : 0.3, life: 8 }); if (q >= 3) { this.shake = 8; Sound.sfx('crit'); }
  Sound.jingle('item');
  // 2) the showcase card
  const icon = lootIcon(g), B = GEAR[g.b], info = gearInfoLines(g, 128).filter(l => l[2] !== 9 && l[1] !== UIC.muted && l[1] !== UIC.accent && l[0] !== ''), kind = EQUIP_SLOTS[B.slot === 'acc' ? 'acc1' : B.slot] + (B.kind && B.kind !== '飾品' ? '・' + B.kind : '');
  const s = { t: 0, out: 0, draw(x) {
    s.t++; const a = s.out ? Math.max(0, 1 - s.out / 6) : Math.min(1, s.t / 8), slide = Math.round((1 - Math.min(1, s.t / 8)) * 18);
    x.save(); x.globalAlpha = a; x.fillStyle = 'rgba(4,4,12,0.55)'; x.fillRect(0, 0, W, BH);
    const X = 14, Y = 14 + slide, w = 148, h = 180; drawWin(x, X, Y, w, h, 'menu');
    Font.drawC(x, head || '獲得了裝備！', W / 2, Y + 4, col, UIC.textSh, 10);
    // rays + icon
    const cx = W / 2, cy = Y + 44; x.save(); x.translate(cx, cy); x.rotate(s.t / 90); const nR = q >= 3 ? 12 : 8;
    for (let i = 0; i < nR; i++) { x.rotate(Math.PI * 2 / nR); const gr = x.createLinearGradient(0, 0, 0, -34); gr.addColorStop(0, `rgba(${cr},${cg2},${cb},${q >= 3 ? 0.55 : 0.32})`); gr.addColorStop(1, `rgba(${cr},${cg2},${cb},0)`); x.fillStyle = gr; x.beginPath(); x.moveTo(-3, 0); x.lineTo(3, 0); x.lineTo(7, -34); x.lineTo(-7, -34); x.closePath(); x.fill(); }
    x.restore(); const glow = x.createRadialGradient(cx, cy, 0, cx, cy, 22); glow.addColorStop(0, `rgba(${cr},${cg2},${cb},0.45)`); glow.addColorStop(1, `rgba(${cr},${cg2},${cb},0)`); x.fillStyle = glow; x.fillRect(cx - 24, cy - 24, 48, 48);
    const bob = Math.round(Math.sin(s.t / 14) * 2);
    if (icon && icon.doll) { x.imageSmoothingEnabled = false; x.drawImage(icon.doll, 0, 0, 16, 22, cx - 16, cy - 24 + bob, 32, 44); } else drawCharm(x, cx, cy + bob, col, s.t);
    for (let i = 0; i < 4; i++) { const an = s.t / 30 + i * 1.57, rr = 24 + Math.sin(s.t / 11 + i) * 4; x.fillStyle = i % 2 ? '#ffffff' : col; x.fillRect(Math.round(cx + Math.cos(an) * rr), Math.round(cy + Math.sin(an) * rr * 0.7), 2, 2); }
    // name + details
    let y = Y + 70; { const nm = gearName(g); let z = 12; while (z > 9 && Font.width(nm, z) > w - 16) z--; Font.drawC(x, nm, W / 2, y, col, UIC.textSh, z); } y += 15; Font.drawC(x, kind, W / 2, y - 1, UIC.muted, UIC.textSh, 8); y += 11;
    x.fillStyle = `rgba(${cr},${cg2},${cb},0.5)`; x.fillRect(X + 10, y, w - 20, 1); y += 3;
    const maxY = Y + h - 20; let shown = 0;
    for (const [t, c2, sz, ind] of info) { const lh = lineH(sz); if (y + lh > maxY) break; Font.draw(x, t, X + 10 + Math.min(ind, 6), y, c2, UIC.textSh, Math.min(sz, 10)); y += Math.min(lh, 12); shown++; }
    const blink = Math.floor(s.t / 20) % 2; Font.drawR(x, 'A：繼續', X + w - 10, Y + h - 13, blink ? UIC.accent : '#ffffff', UIC.textSh, 9); Font.draw(x, shown < info.length ? '▼更多詳情見裝備畫面' : '可在裝備畫面裝備', X + 10, Y + h - 13, UIC.muted, UIC.textSh, 8);
    x.restore();
  } };
  UI.push(s); for (let i = 0; i < 10; i++) yield; Input.consume('a', 'b');
  while (!(Input.pressed('a') || Input.pressed('b'))) { if (Game.autoPlay && s.t > 30) break; yield; } Input.consume('a', 'b'); Sound.sfx('cursor');
  for (s.out = 1; s.out <= 6; s.out++) yield; UI.remove(s);
};
