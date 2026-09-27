/* ===================== v20 regions: monster AI / FX, battle backgrounds, map themes (sand & swamp), map props ===================== */
Object.assign(AI_PROFILE, { sandScorpion: 'guard', harpy: 'trick', cactling: 'guard', dustDevil: 'trick', rockRhino: 'brute', duneWorm: 'brute', bogLeech: 'guard', bogToad: 'trick', marshWisp: 'trick', rotTreant: 'guard', bogWitch: 'trick', hydra: 'brute', mimic: 'brute' });
Object.assign(MFX, {
  m_pincerSnap: MFX.m_pinch, m_venomTail: MFX.m_sting, m_talonDive: MFX.m_dive, m_galeWing: MFX.m_featherGust, m_harpyCry: MFX.m_screech, m_needleSpray: MFX.m_thornRain, m_cactusGuard: MFX.m_mossArmor,
  m_sandBlast: MFX.m_pebbleToss, m_whirlwind: MFX.m_featherGust, m_hornBash: MFX.m_hornCharge, m_sandTomb: MFX.m_quake, m_wormBite: MFX.m_jaw, m_leechBite: MFX.m_engulf, m_slimeCoat: MFX.m_harden,
  m_toxicTongue: MFX.m_tongue, m_mudBomb: MFX.m_mudShot, m_croak: MFX.m_lullaby, m_wispFlame: MFX.m_ghostFire, m_wispDance: MFX.m_flicker, m_rootBind: MFX.m_thornVine, m_branchSlam: MFX.m_rootCrush,
  m_witherBreath: MFX.m_toxicCloud, m_curseMark: MFX.m_hex, m_toxicBrew: MFX.m_acidSpit, m_witchBolt: MFX.m_runeBeam, m_tripleBite: MFX.m_boneRush, m_venomSpray: MFX.m_toxicCloud,
  m_chestChomp: MFX.m_bite, m_coinToss: MFX.m_pebbleToss, m_greed: MFX.m_warCry,
  *m_deathStinger(U, T, u) { yield* this.lunge(u, 24, 3); Sound.sfx('crit'); mSpawn(this, 'mfang', { x: T.x, y: T.y, w: 26, c: '#f0c8ff', gum: '#4a1060', life: 18 }); this.shake = 16; mImpact(this, T, MC.poison, 30); yield* wait(8); mRise(this, T.x, T.y, 8, () => ({ k: 'mpuff', r: 4, c: MC.poison })); yield* wait(16); },
  *m_sandstorm(U, T) { Sound.sfx('charge'); mSpawn(this, 'mflash', { c: '#c89a50', a: 0.45, life: 30 });
    for (let i = 0; i < 18; i++) { const y0 = rnd(20, 200); mSpawn(this, 'mglob', { x: -10, y: y0, vx: 6 + Math.random() * 4, vy: (T.y - y0) / 40, r: rnd(2, 4), c: i % 2 ? '#e8c880' : '#b08840', life: 34 }); }
    yield* wait(22); this.shake = 20; Sound.sfx('quake'); mImpact(this, T, '#e8c880', 34); yield* wait(14); },
  *m_rhinoRush(U, T, u) { Sound.sfx('charge'); yield* wait(6); yield* this.lunge(u, 44, 2); Sound.sfx('crit'); Sound.sfx('rock'); this.shake = 26; this.spawn({ k: 'flash', c: '#ffffff', a: 0.5, life: 8 }); mImpact(this, T, '#d8c8a0', 38); yield* wait(18); },
  *m_devour(U, T, u) { Sound.sfx('quake'); this.shake = 18; for (let i = 0; i < 10; i++) mSpawn(this, 'mglob', { x: T.x + rnd(-30, 30), y: T.y + 20, vx: 0, vy: -3 - Math.random() * 3, r: rnd(3, 6), c: '#d8b070', life: 24 }); yield* wait(16);
    Sound.sfx('crit'); mSpawn(this, 'mfang', { x: T.x, y: T.y, w: 40, c: '#fff0d0', gum: '#7a3a20', life: 20 }); this.shake = 30; mImpact(this, T, '#e8c880', 44); yield* wait(20); },
  *m_cauldron(U, T) { Sound.sfx('charge'); for (let i = 0; i < 3; i++) { mSpawn(this, 'maura', { x: U.x, y: U.y, r0: 50, r1: 6, c: '#8af060', life: 14 }); yield* wait(5); }
    for (let i = 0; i < 12; i++) mSpawn(this, 'mglob', { x: U.x + rnd(-8, 8), y: U.y, vx: (T.x - U.x) / 24 + (Math.random() - 0.5) * 2, vy: (T.y - U.y) / 24, r: rnd(3, 5), c: i % 2 ? '#8af060' : '#b070e0', life: 26 }); Sound.sfx('poison');
    yield* wait(22); this.shake = 20; mImpact(this, T, MC.poison, 40); mRise(this, T.x, T.y, 8, () => ({ k: 'mpuff', r: 5, c: '#8af060' })); yield* wait(16); },
  *m_hydraFlood(U, T) { Sound.sfx('water'); this.spawn({ k: 'flash', c: '#6a8a4a', a: 0.4, life: 12 });
    for (let i = 0; i < 18; i++) { const x0 = rnd(-10, W + 10); mSpawn(this, 'mglob', { x: x0, y: -10, vy: 4 + Math.random() * 3, vx: (T.x - x0) / 30, r: rnd(3, 6), c: i % 3 ? '#5a7a3a' : '#9a5ac0', life: 30 }); }
    yield* wait(20); this.shake = 28; Sound.sfx('quake'); mImpact(this, T, '#6a9a4a', 44); yield* wait(14); },
});
// battle backgrounds
{ const _bb = buildBattleBG; buildBattleBG = function (kind) {
    if (kind !== 'canyon' && kind !== 'swamp') return _bb(kind);
    const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(kind === 'canyon' ? 31 : 37);
    if (kind === 'canyon') {
      const sky = x.createLinearGradient(0, 0, 0, 78); sky.addColorStop(0, '#4a2a5a'); sky.addColorStop(0.45, '#d86a4a'); sky.addColorStop(1, '#f8c070'); x.fillStyle = sky; x.fillRect(0, 0, W, 78);
      pxEllipse(x, 42, 62, 14, 14, '#fff0b0'); pxEllipse(x, 42, 62, 11, 11, '#fff8d8');
      const mesa = (x0, w, top, col) => { x.fillStyle = col; x.fillRect(x0, top, w, 80 - top); x.fillRect(x0 - 3, top + 4, w + 6, 2); };
      mesa(-4, 34, 36, '#8a3a3a'); mesa(58, 22, 48, '#9a4a3a'); mesa(118, 40, 30, '#7a3434'); mesa(150, 30, 44, '#8a4038');
      x.fillStyle = '#6a2a2e'; for (let i = 0; i < W; i += 3) x.fillRect(i, 70 + Math.floor(r() * 4), 3, 10);
      ['#d89a58', '#d4945a', '#cf8e54', '#c98850', '#c3824c', '#bd7c48', '#b77644', '#b17040', '#ab6a3c', '#a56438', '#9f5e34', '#995830', '#93522c'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 78 + i * 11, W, 11); });
      x.fillStyle = '#e8b878'; for (let y = 82; y < BH; y += 7) for (let i = (y * 11) % 31; i < W; i += 31) x.fillRect(i, y, 5, 1);
      for (let i = 0; i < 5; i++) { const X = Math.floor(r() * W), Y = 90 + Math.floor(r() * 16); x.fillStyle = '#3a6a3a'; x.fillRect(X, Y - 10, 3, 11); x.fillRect(X - 3, Y - 7, 3, 2); x.fillRect(X - 3, Y - 9, 1, 3); x.fillRect(X + 3, Y - 5, 3, 2); x.fillRect(X + 5, Y - 8, 1, 4); }
    } else {
      const sky = x.createLinearGradient(0, 0, 0, 90); sky.addColorStop(0, '#0e1410'); sky.addColorStop(1, '#2a3a2a'); x.fillStyle = sky; x.fillRect(0, 0, W, 90);
      for (let i = 0; i < 9; i++) { const X = Math.floor(r() * W), h = 30 + Math.floor(r() * 30); x.fillStyle = '#141c14'; x.fillRect(X, 90 - h, 3, h); x.fillRect(X - 6, 90 - h + 8, 6, 2); x.fillRect(X + 3, 90 - h + 14, 7, 2); x.fillRect(X - 4, 90 - h + 20, 4, 1); }
      x.fillStyle = 'rgba(150,120,190,0.18)'; for (let i = 0; i < 4; i++) x.fillRect(0, 50 + i * 12, W, 6);
      ['#2e3a28', '#2b3726', '#283424', '#253122', '#222e20', '#1f2b1e', '#1c281c', '#1a261a', '#182418', '#172216', '#162014', '#151e13', '#141c12'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, 88 + i * 10, W, 10); });
      for (let i = 0; i < 7; i++) { const X = Math.floor(r() * W), Y = 96 + Math.floor(r() * 110), w = 10 + Math.floor(r() * 16); x.fillStyle = '#2a3a30'; x.fillRect(X, Y, w, 3); x.fillStyle = '#3a5a44'; x.fillRect(X + 2, Y, w - 4, 1); }
      for (let i = 0; i < 6; i++) { const X = Math.floor(r() * W), Y = 100 + Math.floor(r() * 100); pxEllipse(x, X, Y, 4, 2, '#3a6a3a'); x.fillStyle = '#e8a0c8'; x.fillRect(X, Y - 1, 1, 1); }
      for (let i = 0; i < 14; i++) { x.fillStyle = r() < 0.5 ? '#a0ffc8' : '#d0ff90'; x.fillRect(Math.floor(r() * W), 40 + Math.floor(r() * 150), 1, 1); }
    }
    c.kind = kind; return c;
  };
}
Object.assign(HD2D_LOOK, {
  canyon: { key: [255, 200, 150], shaft: 'rgba(255,210,150,', haze: 'rgba(240,170,120,', mote: ['#fff0c0', '#ffd090', '#f8b070'], cool: [60, 20, 40], sharp: [100, 150], far: 78 },
  swamp: { key: [170, 220, 170], shaft: 'rgba(170,220,170,', haze: 'rgba(130,110,170,', mote: ['#a0ffc8', '#d0ff90', '#c8a0ff'], cool: [10, 30, 20], sharp: [96, 150], far: 88 },
});

/* ---------- map themes: recoloured tiles (cached) + a custom rock pillar / dead tree ---------- */
const THEME_CACHE = {};
function themeCanvas(key, src, fn) {
  if (THEME_CACHE[key]) return THEME_CACHE[key];
  const c = mkCanvas(src.width, src.height), x = c.getContext('2d'); x.drawImage(src, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const [h, s, l] = rgb2hsl(p[i], p[i + 1], p[i + 2]), o = fn(h, s, l); if (!o) continue; const [r, g, b] = hex2rgb(hsl2hex(o[0], o[1], o[2])); p[i] = r; p[i + 1] = g; p[i + 2] = b; }
  x.putImageData(d, 0, 0); return THEME_CACHE[key] = c;
}
const thGreen = (h, s) => h >= 55 && h <= 175 && s > 0.12, thBlue = (h, s) => h >= 180 && h <= 260 && s > 0.15;
const THEMES = {
  canyon: {
    ground: (h, s, l) => thGreen(h, s) ? [34 + (l - 0.5) * 20, clamp(s * 0.5 + 0.12, 0, 0.6), clamp(l * 0.95 + 0.12, 0, 0.86)] : null,
    tall: (h, s, l) => thGreen(h, s) ? [44 + (l - 0.5) * 16, clamp(s * 0.55, 0, 0.55), clamp(l * 0.9 + 0.06, 0, 0.8)] : null,
    path: (h, s, l) => thGreen(h, s) ? [34 + (l - 0.5) * 20, clamp(s * 0.5 + 0.12, 0, 0.6), clamp(l * 0.95 + 0.12, 0, 0.86)] : [h - 12, clamp(s * 0.9, 0, 1), clamp(l * 0.82, 0, 1)],
    water: null,
    tree: () => spriteFrom(['................', '.....kkkkkk.....', '...kkAAAAAAkk...', '..kAAAAAAAABBk..', '..kBBBBBBBBBCk..', '..kDDDDDDDDDCk..', '..kAABBBBBBCCk..', '..kABBBBBBBCCk..', '..kBBBBBBBBCCk..', '..kDDDDDDDDDCk..', '..kABBBBBBBBCk..',
      '.kAABBBBBBBCCCk.', '.kABBBBBBBBBCCk.', '.kDDDDDDDDDDDCk.', '.kABBBBBBBBBCCk.', 'kAABBBBBBBBBCCCk', 'kABBBBBBBBBBBCCk', 'kBBBBBBBBBBBBCCk', '.kkCCCCCCCCCCkk.', '...kkkkkkkkkk...', '................'],
      { k: '#4a2018', A: '#f0a070', B: '#c8683e', C: '#94462a', D: '#e0885a' }),
  },
  swamp: {
    ground: (h, s, l) => thGreen(h, s) ? [95 + (h - 110) * 0.2, clamp(s * 0.42, 0, 0.45), clamp(l * 0.6, 0, 0.5)] : null,
    tall: (h, s, l) => thGreen(h, s) ? [100 + (h - 110) * 0.2, clamp(s * 0.45, 0, 0.45), clamp(l * 0.62, 0, 0.52)] : null,
    path: (h, s, l) => thGreen(h, s) ? [95 + (h - 110) * 0.2, clamp(s * 0.42, 0, 0.45), clamp(l * 0.6, 0, 0.5)] : [h - 5, clamp(s * 0.55, 0, 1), clamp(l * 0.6, 0, 1)],
    water: (h, s, l) => thBlue(h, s) || l > 0.8 ? [100, clamp(s * 0.45, 0, 0.45), clamp(l * 0.55, 0, 0.6)] : null,
    tree: () => spriteFrom(TREE_ROWS, { k: '#101610', L: '#6a7a5a', l: '#4e5e44', m: '#3a4632', d: '#2a3424', T: '#5a4838', t: '#3e3024' }),
  },
};
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    const th = this.map && this.map.d.theme, T = th && THEMES[th]; if (!T) return _dr.call(this, x);
    const keep = { grass: Tiles.grass, tall: Tiles.tall, path: Tiles.path, water: Tiles.water, tree: Tiles.tree, rock: Tiles.rock, bush: Tiles.bush, sign: Tiles.sign, flower: Tiles.flower, ledge: Tiles.ledge };
    Tiles.grass = v => themeCanvas(th + 'g' + v, keep.grass(v), T.ground); Tiles.tall = f => themeCanvas(th + 't' + f, keep.tall(f), T.tall);
    Tiles.path = m => themeCanvas(th + 'p' + m, keep.path(m), T.path); if (T.water) Tiles.water = (f, m) => themeCanvas(th + 'w' + f + '_' + m, keep.water(f, m), T.water);
    Tiles.tree = THEME_CACHE[th + 'tree'] || (THEME_CACHE[th + 'tree'] = T.tree());
    for (const k of ['rock', 'bush', 'sign', 'ledge']) Tiles[k] = themeCanvas(th + k, keep[k], T.ground);
    Tiles.flower = (f, c) => themeCanvas(th + 'f' + f + c, keep.flower(f, c), T.ground);
    try { _dr.call(this, x); } finally { Object.assign(Tiles, keep); }
    // ambience
    const t = this.t;
    if (th === 'canyon') { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,140,80,0.16)'); g.addColorStop(1, 'rgba(120,40,60,0.10)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
    else {
      x.fillStyle = 'rgba(40,20,60,0.18)'; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 3; i++) { const y = ((i * 97 + t * 0.15) % (H + 40)) - 20; x.fillStyle = 'rgba(170,150,200,0.07)'; x.fillRect(0, Math.round(y), W, 14); }
      for (let i = 0; i < 8; i++) { const px = (i * 53 + Math.sin(t / 40 + i) * 10 + W) % W, py = (i * 71 + Math.cos(t / 50 + i * 2) * 8 + H) % H; if ((t + i * 13) % 60 < 44) { x.fillStyle = i % 2 ? '#a0ffc8' : '#d0ff90'; x.fillRect(Math.round(px), Math.round(py), 1, 1); } }
    }
  };
}
// map props: the ancient bell, the fog lamps (unlit / lit), the miasma wall
const BELL_IMG = spriteFrom(['.......kk.......', '......kYYk......', '....kkkkkkkk....', '....kYYYYYYk....', '...kYYyyyyYYk...', '...kYyyyyyyYk...', '...kYyyyyyyYk...', '..kYYyyyyyyYYk..', '..kYyyyyyyyyYk..', '.kkkkkkkkkkkkkk.', '.kSSsssssssssSk.', '..kSs....ssSk...', '..kSk....kSSk...', '..kSk....kSk....', '.kkSkk..kkSkk...', '.kkkkk..kkkkk...'],
  { k: '#2a1a10', Y: '#d8a040', y: '#a87028', S: '#8a7a68', s: '#6a5a4a' });
const LAMP_ROWS = ['.....kkkkkk.....', '....kGGGGGGk....', '....kGffffGk....', '....kGffffGk....', '....kGffffGk....', '.....kkkkkk.....', '.......kk.......', '.......kk.......', '.......kk.......', '.......kk.......', '.......kk.......', '.......kk.......', '......kkkk......', '.....kkkkkk.....', '....kkkkkkkk....', '................'];
const LAMP_IMG = spriteFrom(LAMP_ROWS, { k: '#1a1a20', G: '#6a6a78', f: '#2a3040' }), LAMP_LIT = spriteFrom(LAMP_ROWS, { k: '#1a1a20', G: '#8a9aa0', f: '#a0ffc8' });
const MIASMA_IMG = (() => { const c = mkCanvas(16, 16), x = c.getContext('2d'); for (let i = 0; i < 6; i++) pxEllipse(x, 3 + (i * 5) % 11, 4 + (i * 7) % 9, 4, 3, ['#4a2a5a', '#5a3a6a', '#3a2248'][i % 3]); x.globalAlpha = 0.6; pxEllipse(x, 8, 8, 7, 7, '#6a4a80'); return c; })();
const propFrames = (im, dy = 6) => { const c = mkCanvas(16, 22); c.getContext('2d').drawImage(im, 0, dy); const a = [c, c, c, c]; return { down: a, up: a, left: a, right: a }; };
{ const _nf = npcFrames; npcFrames = function (look) { if (look === 'bell') return propFrames(BELL_IMG); if (look === 'lamp') return propFrames(LAMP_IMG, 5); if (look === 'lampLit') return propFrames(LAMP_LIT, 5); if (look === 'miasma') return propFrames(MIASMA_IMG, 5); return _nf(look); }; }
// species that only exist as Codex chibis (no realistic strip): bestiary / map minis come from the chibi idle frame
{ const _mm = monsterMini; monsterMini = function (sp, size) {
    if (!(PLACEHOLDER[sp] && !pxAnimOwn(sp) && typeof chibiOwn === 'function' && chibiOwn(sp))) return _mm(sp, size);
    const k = 'cb' + sp + size; if (miniCache[k]) return miniCache[k];
    const im = BATTLE_PXC[sp], M = BATTLE_PXC_META[sp], fi = (M.frames.idle || [0])[0], c = mkCanvas(size, size), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const s = Math.min(size / M.w, size / M.h); x.drawImage(im, fi * M.w, 0, M.w, M.h, Math.round((size - M.w * s) / 2), Math.round(size - M.h * s), Math.round(M.w * s), Math.round(M.h * s));
    return miniCache[k] = { c, flip: flipCanvas(c) };
  };
}
