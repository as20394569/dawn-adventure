/* ===================== v19 new monsters: sprite fallbacks, monster FX, lake / rift battle backgrounds ===================== */
// placeholder recolours for species whose Codex strip isn't in yet
for (const k in HD_RIG_OF_PENDING) if (!(typeof BATTLE_PXA_SRC !== 'undefined' && BATTLE_PXA_SRC[k])) { const b = HD_RIG_OF_PENDING[k]; HD_RIG_OF[k] = (BATTLE_PXA_SRC[b] ? b : (HD_RIG_OF_PENDING[b] || b)); }
if (BATTLE_PXA_SRC.lizardman) HD_RIG_OF.lizardChief = 'lizardman';
// portraits from the pixel strip for the field mini / bestiary / old battle view when a species has its own strip
{ const _mm = monsterMini; monsterMini = function (sp, size) {
    const own = PLACEHOLDER[sp] && pxAnimOwn(sp); const pic = own ? battlePortrait(sp) : null; if (!pic) return _mm(sp, size); // only the v19 species; existing minis stay as they were
    const k = 'px' + sp + size; if (miniCache[k]) return miniCache[k]; const s = size / Math.max(pic.width, pic.height), c = mkCanvas(size, size), x = c.getContext('2d'); x.imageSmoothingEnabled = true;
    x.drawImage(pic, Math.round((size - pic.width * s) / 2), Math.round(size - pic.height * s), Math.round(pic.width * s), Math.round(pic.height * s)); return miniCache[k] = { c, flip: flipCanvas(c) };
  };
}
// monster skill effects for the new moves (aliases where an existing effect fits, unique ones for the big attacks)
Object.assign(MFX, {
  m_moonBeam: MFX.m_prismRay, m_pinch: MFX.m_jaw, m_crabHammer: MFX.m_hornCharge, m_moonDust: MFX.m_featherGust, m_spearThrust: MFX.m_sting, m_spearRush: MFX.m_hornCharge, m_tidalSpear: MFX.m_waterBomb,
  m_moonSlash: MFX.m_darkSlash, m_arcaneBolt: MFX.m_runeBeam, m_blinkStrike: MFX.m_pounce, m_tidalWave: MFX.m_drownHand, m_wyrmBite: MFX.m_bite, m_voidGaze: MFX.m_hex, m_voidBeam: MFX.m_prismRay,
  m_riftCleave: MFX.m_gutSlash, m_riftCharge: MFX.m_hornCharge, m_gateBeam: MFX.m_runeBeam, m_gateCrush: MFX.m_golemFist,
  *m_eclipse(U, T, u) { mSpawn(this, 'mflash', { c: '#08040f', a: 0.7, life: 26 }); Sound.sfx('charge'); yield* wait(12); yield* this.lunge(u, 30, 3); Sound.sfx('crit');
    for (let i = 0; i < 2; i++) this.spawn({ k: 'cres', x: T.x, y: T.y, r: 34 - i * 8, ang: -0.5 + i, c: '#e8d8ff', c2: '#40208a', w: 6, life: 18 }); this.shake = 20; yield* wait(20); },
  *m_moonTide(U, T) { Sound.sfx('water'); this.spawn({ k: 'flash', c: '#c8e8ff', a: 0.4, life: 10 });
    for (let i = 0; i < 16; i++) { const x0 = rnd(-10, W + 10); mSpawn(this, 'mglob', { x: x0, y: -10, vy: 4 + Math.random() * 3, vx: (T.x - x0) / 30, r: rnd(3, 6), c: i % 2 ? '#8ad0ff' : '#e8f8ff', life: 30 }); }
    yield* wait(20); this.shake = 26; Sound.sfx('quake'); mImpact(this, T, '#8ad0ff', 40); yield* wait(14); },
  *m_gateJudgment(U, T) { Sound.sfx('charge'); for (let i = 0; i < 3; i++) { mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 60, r1: 6, c: '#fff4c0', life: 14 }); yield* wait(5); }
    this.spawn({ k: 'beam', x: T.x, w: 26, life: 24 }); this.spawn({ k: 'flash', c: '#ffffff', a: 0.8, life: 14 }); Sound.sfx('thunder'); this.shake = 30; yield* wait(26); },
});
// battle backgrounds: moonlit lake, the Rift
{ const _bb = buildBattleBG; buildBattleBG = function (kind) {
    if (kind !== 'lake' && kind !== 'rift') return _bb(kind);
    const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(kind === 'lake' ? 17 : 23);
    if (kind === 'lake') {
      const sky = x.createLinearGradient(0, 0, 0, 70); sky.addColorStop(0, '#0e1430'); sky.addColorStop(1, '#2a3a6a'); x.fillStyle = sky; x.fillRect(0, 0, W, 70);
      for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.3 ? '#fff8d0' : '#a8b8e8'; x.fillRect(Math.floor(r() * W), Math.floor(r() * 56), 1, 1); }
      pxEllipse(x, 132, 22, 10, 10, '#fff4d0'); pxEllipse(x, 135, 20, 9, 9, '#fffbe8');
      for (let i = -6; i < W; i += 7) { const h = 8 + Math.floor(r() * 12); x.fillStyle = '#16203a'; x.fillRect(i, 70 - h, 6, h); pxEllipse(x, i + 3, 70 - h, 5, 5, '#16203a'); }
      const lk = x.createLinearGradient(0, 68, 0, 112); lk.addColorStop(0, '#2a4a7a'); lk.addColorStop(1, '#1a3050'); x.fillStyle = lk; x.fillRect(0, 68, W, 44);
      for (let y = 72; y < 110; y += 3) for (let i = (y * 7) % 23; i < W; i += 23) { x.fillStyle = y % 2 ? '#4a70a8' : '#3a5a90'; x.fillRect(i, y, 6 + (y % 5), 1); }
      for (let y = 72; y < 110; y += 2) { const w = 10 - (y - 72) / 5; x.fillStyle = '#e8e8c0'; x.fillRect(Math.round(133 - w / 2 + Math.sin(y) * 2), y, Math.max(1, Math.round(w)), 1); }
      ['#2e4a3a', '#2a4436', '#274032', '#243c2f', '#21382c', '#1f3429', '#1c3026', '#1a2c24', '#182a22', '#172820'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 110 + i * 11, W, 11); });
      x.fillStyle = '#3e6048'; for (let y = 114; y < BH; y += 6) for (let i = (y * 13) % 29; i < W; i += 29) x.fillRect(i, y, 4, 1);
      for (let i = 0; i < 12; i++) { const X = Math.floor(r() * W), Y = 104 + Math.floor(r() * 10); x.fillStyle = '#4a6a3a'; x.fillRect(X, Y - 8, 1, 9); x.fillRect(X + 2, Y - 6, 1, 7); x.fillStyle = '#8a6a3a'; x.fillRect(X, Y - 9, 1, 2); }
    } else {
      const sky = x.createLinearGradient(0, 0, 0, BH); sky.addColorStop(0, '#0a0614'); sky.addColorStop(0.5, '#1e1236'); sky.addColorStop(1, '#120a22'); x.fillStyle = sky; x.fillRect(0, 0, W, BH);
      for (let i = 0; i < 60; i++) { x.fillStyle = r() < 0.4 ? '#c8a8ff' : '#6a5a9a'; x.fillRect(Math.floor(r() * W), Math.floor(r() * 100), 1, 1); }
      for (let i = 0; i < 7; i++) { const X = Math.floor(r() * W), Y = 20 + Math.floor(r() * 60), s = 4 + Math.floor(r() * 8); x.fillStyle = '#2e2448'; x.fillRect(X, Y, s * 2, s); x.fillStyle = '#4a3a70'; x.fillRect(X, Y, s * 2, 1); }
      pxEllipse(x, 88, 60, 30, 26, '#2a1a4a'); pxEllipse(x, 88, 60, 22, 20, '#4a2a8a'); pxEllipse(x, 88, 60, 12, 12, '#b890ff'); pxEllipse(x, 88, 60, 5, 5, '#fff0ff');
      ['#3a2e54', '#362a4e', '#322748', '#2e2342', '#2a203c', '#261d36', '#221a30', '#1f172b', '#1c1526', '#191322'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 110 + i * 11, W, 11); });
      x.strokeStyle = '#5a4a80'; x.lineWidth = 1; for (let y = 116; y < BH; y += 12) { x.beginPath(); x.moveTo(0, y + 0.5); x.lineTo(W, y + 0.5); x.stroke(); }
      for (let i = 0; i < W; i += 22) { x.beginPath(); x.moveTo(i + 0.5, 110); x.lineTo(i * 1.4 - 36 + 0.5, BH); x.stroke(); }
    }
    c.kind = kind; return c;
  };
}
Object.assign(HD2D_LOOK, {
  lake: { key: [200, 220, 255], shaft: 'rgba(210,230,255,', haze: 'rgba(160,190,240,', mote: ['#e8f0ff', '#fff8d0', '#a8d0ff'], cool: [20, 30, 80], sharp: [100, 150], far: 72 },
  rift: { key: [200, 160, 255], shaft: 'rgba(200,170,255,', haze: 'rgba(120,80,180,', mote: ['#d8c0ff', '#ffffff', '#9a70ff'], cool: [30, 10, 60], sharp: [100, 150], far: 90 },
});
