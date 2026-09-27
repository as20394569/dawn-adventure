/* ===================== v23 safeguard: one broken particle must never freeze the game =====================
   Playtest: 異界守門者's 異界審判 spawned a light beam without a colour; the renderer threw on every frame, so the battle
   froze and the canvas kept a half-applied transform (the map was drawn shifted). The beam is fixed (07m); this wrapper
   makes the renderer skip any particle that fails to draw (reported once in the console) and undo its half-applied state. */
{ const _dp = drawParticle, seen = {}; drawParticle = function (x, p) {
    if (p.bad) return; const T = x.getTransform(), A = x.globalAlpha;
    try { _dp(x, p); } catch (e) {
      p.bad = 1; p.hidden = true; if (HERO_PK[p.k] || p.k === 'cres') { try { x.restore(); } catch (e2) { /* nothing to undo */ } }
      x.setTransform(T); x.globalAlpha = A; x.globalCompositeOperation = 'source-over';
      if (!seen[p.k]) { seen[p.k] = 1; console.error('particle "' + p.k + '" could not be drawn: ' + e.message); }
    }
  };
}
