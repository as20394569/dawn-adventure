/* ===================== CHAPTER 2 — monster FX, map themes, map props, battle stages, music ===================== */

/* ---------- monster skill effects: aliases where an existing effect fits, unique ones for the bosses' big attacks ---------- */
Object.assign(MFX, {
  m_plagueBite: MFX.m_venomFang, m_scurry: MFX.m_swarm || MFX.m_flicker, m_toxicSludge: MFX.m_toxicCloud || MFX.m_acidSpit, m_rustBite: MFX.m_bite, m_ratSwarm: MFX.m_rend, m_crownBash: MFX.m_hornCharge,
  m_sickle: MFX.m_gutSlash, m_crowCall: MFX.m_featherGust, m_strawGuard: MFX.m_mossArmor || MFX.m_harden, m_honeyTrap: MFX.m_web, m_tuskCharge: MFX.m_hornCharge, m_windCutter: MFX.m_galeWing || MFX.m_featherGust,
  m_scytheSweep: MFX.m_gutSlash, m_seedBomb: MFX.m_leafDart, m_windUp: MFX.m_warCry, m_gearShot: MFX.m_pebbleToss, m_sparkGear: MFX.m_buzzShock, m_overclock: MFX.m_swarm || MFX.m_flicker, m_bellToll: MFX.m_sonic,
  m_gearCrush: MFX.m_golemFist, m_steamBurst: MFX.m_waterBomb, m_timeWarp: MFX.m_hex, m_frostFang: MFX.m_bite, m_iceShard: MFX.m_crystalShard, m_iceFist: MFX.m_golemFist, m_frozenGaze: MFX.m_hex,
  m_iceMirror: MFX.m_stoneWall, m_frostCurse: MFX.m_chillMist, m_flameBreath: MFX.m_flare, m_magmaFist: MFX.m_golemFist, m_shadowBolt: MFX.m_darkPulse, m_dreamEater: MFX.m_soulSip,
  m_demonClaw: MFX.m_rend, m_shadowSlash: MFX.m_darkSlash, m_starfall: MFX.m_prismRay, m_holyRay: MFX.m_runeBeam,
  m_featherStorm: MFX.m_axeSpin || MFX.m_throwDagger, m_kingsFeast: MFX.m_devour || MFX.m_bite, m_boarRush: MFX.m_rhinoRush || MFX.m_hornCharge, m_harvest: MFX.m_axeSpin || MFX.m_gutSlash,
  m_chronoLance: MFX.m_riftCharge || MFX.m_hornCharge, m_avalanche: MFX.m_rockfall, m_bearHug: MFX.m_rend, m_infernoBreath: MFX.m_flare,
  *m_twelveStrike(U, T, u) { Sound.sfx('charge'); for (let i = 0; i < 12; i++) { this.spawn({ k: 'ring', x: U.x, y: U.y - 10, r0: 30, r1: 6, c: i % 2 ? '#ffe070' : '#c8a050', w: 2, life: 8 }); Sound.sfx('tick'); yield* wait(3); }
    yield* this.lunge(u, 26, 3); Sound.sfx('quake'); this.shake = 26; mSpawn(this, 'mflash', { c: '#ffe8a0', a: 0.6, life: 10 }); if (typeof mImpact === 'function') mImpact(this, T, '#c8a050', 44); yield* wait(16); },
  *m_blizzard(U, T) { Sound.sfx('wind'); this.spawn({ k: 'flash', c: '#e8f4ff', a: 0.35, life: 16 }); for (let k = 0; k < 40; k++) this.spawn({ k: 'dot', x: rnd(-20, W), y: rnd(-20, BH - 40), vx: 3 + Math.random() * 2, vy: 1.5 + Math.random(), c: k % 3 ? '#ffffff' : '#a8d8ff', s: 2, life: 30 });
    yield* wait(20); this.shake = 16; Sound.sfx('water'); yield* wait(10); },
  *m_absoluteZero(U, T) { Sound.sfx('charge'); this.spawn({ k: 'flash', c: '#c8ecff', a: 0.5, life: 30 }); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 60 - i * 10, r1: 4, c: '#e8f8ff', w: 3, life: 18 }); yield* wait(6); }
    for (let i = 0; i < 14; i++) { const an = i * Math.PI / 7; this.spawn({ k: 'line', x1: T.x, y1: T.y, x2: T.x + Math.cos(an) * 40, y2: T.y + Math.sin(an) * 30, c: '#ffffff', w: 2, grow: 4, life: 20 }); } this.shake = 22; Sound.sfx('crit'); yield* wait(18); },
  *m_eruption(U, T) { Sound.sfx('quake'); this.shake = 20; for (let k = 0; k < 3; k++) { for (let i = 0; i < 12; i++) this.spawn({ k: 'flame', x: T.x + rnd(-40, 40), y: T.y + 26, vy: -3 - Math.random() * 2, s: rnd(3, 6), life: rnd(16, 26) }); yield* wait(5); }
    this.spawn({ k: 'flash', c: '#ff8040', a: 0.55, life: 12 }); Sound.sfx('fire'); yield* wait(14); },
  *m_tyranny(U, T, u) { mSpawn(this, 'mflash', { c: '#1a0010', a: 0.7, life: 30 }); Sound.sfx('charge'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'ring', x: T.x, y: T.y - 30, r0: 10 + i * 10, r1: 40 + i * 10, c: '#c040ff', w: 2, life: 22 }); yield* wait(5); }
    yield* wait(8); this.spawn({ k: 'beam', x: T.x, y1: T.y + 24, w: 16, h: BH, c: '#a020d0', life: 16 }); this.shake = 22; Sound.sfx('crit'); yield* wait(16); },
  *m_eclipseBlade(U, T, u) { mSpawn(this, 'mflash', { c: '#000000', a: 0.85, life: 40 }); Sound.sfx('charge'); yield* wait(18); yield* this.lunge(u, 34, 3); Sound.sfx('crit');
    for (let i = 0; i < 3; i++) this.spawn({ k: 'cres', x: T.x, y: T.y, r: 40 - i * 8, ang: -0.8 + i * 0.7, c: '#ffd0e0', c2: '#200030', w: 8, life: 20 }); this.spawn({ k: 'flash', c: '#ff3050', a: 0.4, life: 8 }); this.shake = 28; yield* wait(20); },
  *m_cometLance(U, T, u) { Sound.sfx('charge'); this.spawn({ k: 'flash', c: '#101838', a: 0.5, life: 30 }); for (let i = 0; i < 18; i++) this.spawn({ k: 'star', x: rnd(0, W), y: rnd(0, 80), c: '#fff8d0', life: 30 }); yield* wait(14);
    this.spawn({ k: 'line', x1: T.x + 60, y1: -10, x2: T.x, y2: T.y, c: '#fff4c0', w: 6, grow: 6, life: 18 }); yield* wait(8); this.spawn({ k: 'flash', c: '#ffffff', a: 0.7, life: 10 }); this.shake = 26; Sound.sfx('crit'); yield* wait(16); },
});
for (const k in CH2_MCLS) if (!MFX[k]) MFX[k] = MFX.m_bite; // safety net

/* ---------- map themes (09b): recoloured tiles for outdoor maps and dungeons, plus weather ---------- */
const CH2_TREE = Tiles.tree, thStone = (h, s, l) => true;
const CH2_THEMES = {
  autumn: { ground: (h, s, l) => thGreen(h, s) ? [70 + (h - 110) * 0.3, clamp(s * 0.8, 0, 0.7), clamp(l * 0.98, 0, 0.9)] : null, tall: (h, s, l) => thGreen(h, s) ? [62 + (h - 110) * 0.3, clamp(s * 0.8, 0, 0.7), l] : null,
    tree: { L: '#d8a040', l: '#b87a2a', m: '#8a5a24', d: '#5a3a18' } },
  plains: { ground: (h, s, l) => thGreen(h, s) ? [58 + (h - 110) * 0.25, clamp(s * 0.75, 0, 0.7), clamp(l * 1.02, 0, 0.9)] : null, tall: (h, s, l) => thGreen(h, s) ? [44 + (l - 0.5) * 16, clamp(s * 0.9 + 0.1, 0, 0.85), clamp(l * 1.08 + 0.06, 0, 0.9)] : null,
    tree: { L: '#a8c860', l: '#86a848', m: '#5a7a34', d: '#3e5424' } },
  snow: { ground: (h, s, l) => thGreen(h, s) ? [205, clamp(s * 0.25, 0, 0.25), clamp(l * 0.35 + 0.62, 0, 0.97)] : null, tall: (h, s, l) => thGreen(h, s) ? [190, clamp(s * 0.35, 0, 0.35), clamp(l * 0.45 + 0.45, 0, 0.9)] : null,
    path: (h, s, l) => thGreen(h, s) ? [205, clamp(s * 0.25, 0, 0.25), clamp(l * 0.35 + 0.62, 0, 0.97)] : [210, clamp(s * 0.3, 0, 0.3), clamp(l * 0.5 + 0.4, 0, 0.9)], water: (h, s, l) => [200, clamp(s * 0.6, 0, 0.6), clamp(l * 0.5 + 0.45, 0, 0.95)],
    tree: { L: '#f0f6fa', l: '#b8d0d8', m: '#5a7a70', d: '#3a5048' } },
  volcano: { ground: (h, s, l) => thGreen(h, s) ? [12, clamp(s * 0.35, 0, 0.35), clamp(l * 0.45, 0, 0.45)] : null, tall: (h, s, l) => thGreen(h, s) ? [20, clamp(s * 0.5, 0, 0.5), clamp(l * 0.55, 0, 0.5)] : null,
    path: (h, s, l) => thGreen(h, s) ? [12, clamp(s * 0.35, 0, 0.35), clamp(l * 0.45, 0, 0.45)] : [h - 20, clamp(s * 0.6, 0, 1), clamp(l * 0.55, 0, 1)], water: (h, s, l) => [15 + l * 30, 1, clamp(0.35 + l * 0.35, 0, 0.75)],
    tree: { L: '#5a3a30', l: '#44281f', m: '#301a14', d: '#1e100c' } },
  star: { ground: (h, s, l) => thGreen(h, s) ? [235, clamp(s * 0.45, 0, 0.45), clamp(l * 0.5, 0, 0.5)] : null, tall: (h, s, l) => thGreen(h, s) ? [250, clamp(s * 0.55, 0, 0.55), clamp(l * 0.6, 0, 0.55)] : null,
    path: (h, s, l) => thGreen(h, s) ? [235, clamp(s * 0.45, 0, 0.45), clamp(l * 0.5, 0, 0.5)] : [230, clamp(s * 0.4, 0, 0.5), clamp(l * 0.7, 0, 0.8)],
    stone: (h, s, l) => [230, clamp(s + 0.15, 0, 0.4), clamp(l * 0.8, 0, 0.9)], tree: { L: '#8a90d0', l: '#6a70b0', m: '#484e88', d: '#2e3260' } },
  sewer2: { stone: (h, s, l) => [150, clamp(s + 0.1, 0, 0.3), clamp(l * 0.8, 0, 1)], wall: (h, s, l) => [160, clamp(s + 0.1, 0, 0.3), clamp(l * 0.75, 0, 1)], water: (h, s, l) => [100, clamp(s * 0.6, 0, 0.6), clamp(l * 0.6, 0, 0.6)] },
  tower: { stone: (h, s, l) => [38, clamp(s + 0.2, 0, 0.5), clamp(l * 1.0, 0, 1)], wall: (h, s, l) => [32, clamp(s + 0.25, 0, 0.55), clamp(l * 0.9, 0, 1)] },
  ice: { stone: (h, s, l) => [200, clamp(s + 0.25, 0, 0.5), clamp(l * 0.8 + 0.2, 0, 0.95)], wall: (h, s, l) => [205, clamp(s + 0.3, 0, 0.6), clamp(l * 0.8 + 0.15, 0, 0.9)], water: (h, s, l) => [195, clamp(s * 0.5, 0, 0.5), clamp(l * 0.4 + 0.55, 0, 0.97)] },
  lava: { stone: (h, s, l) => [10, clamp(s + 0.1, 0, 0.35), clamp(l * 0.55, 0, 1)], wall: (h, s, l) => [8, clamp(s + 0.15, 0, 0.4), clamp(l * 0.45, 0, 1)], water: (h, s, l) => [15 + l * 30, 1, clamp(0.35 + l * 0.35, 0, 0.75)] },
  fort: { stone: (h, s, l) => [270, clamp(s + 0.15, 0, 0.35), clamp(l * 0.55, 0, 1)], wall: (h, s, l) => [265, clamp(s + 0.2, 0, 0.4), clamp(l * 0.45, 0, 1)] },
};
function ch2TreeImg(th, P) { const k = th + 'tree'; if (THEME_CACHE[k]) return THEME_CACHE[k]; return THEME_CACHE[k] = themeCanvas(k + 'x', CH2_TREE, (h, s, l) => { if (!thGreen(h, s)) return null; const c = l > 0.55 ? P.L : l > 0.42 ? P.l : l > 0.3 ? P.m : P.d, [hh, ss, ll] = rgb2hsl(...hex2rgb(c)); return [hh, ss, ll]; }); }
{ const _dr = Overworld.prototype.draw; Overworld.prototype.draw = function (x) {
    const d = this.map && this.map.d, th = d && d.theme, T = th && CH2_THEMES[th]; if (!T) return _dr.call(this, x);
    const names = ['grass', 'tall', 'path', 'water', 'tree', 'rock', 'bush', 'sign', 'ledge', 'flower', 'stone', 'ruinWall', 'pillar', 'bridge', 'cobble'], keep = {}; for (const n of names) keep[n] = Tiles[n];
    if (T.ground) { Tiles.grass = v => themeCanvas(th + 'g' + v, keep.grass(v), T.ground); for (const k of ['rock', 'bush', 'sign', 'ledge']) Tiles[k] = themeCanvas(th + k, keep[k], T.ground); Tiles.flower = (f, c) => themeCanvas(th + 'f' + f + c, keep.flower(f, c), T.ground); }
    if (T.tall) Tiles.tall = f => themeCanvas(th + 't' + f, keep.tall(f), T.tall);
    if (T.path || T.ground) Tiles.path = m => themeCanvas(th + 'p' + m, keep.path(m), T.path || T.ground);
    if (T.water) Tiles.water = (f, m) => themeCanvas(th + 'w' + f + '_' + m, keep.water(f, m), T.water);
    if (T.tree) Tiles.tree = ch2TreeImg(th, T.tree);
    if (T.stone) { Tiles.stone = v => themeCanvas(th + 's' + v, keep.stone(v), T.stone); if (keep.pillar) Tiles.pillar = themeCanvas(th + 'pil', keep.pillar, T.stone); }
    if (T.wall) Tiles.ruinWall = v => themeCanvas(th + 'rw' + v, keep.ruinWall(v), T.wall);
    const th0 = d.theme; d.theme = null; try { _dr.call(this, x); } finally { d.theme = th0; Object.assign(Tiles, keep); }
    const t = this.t;
    if (th === 'snow') { for (let i = 0; i < 26; i++) { const px = (i * 47 + t * (0.3 + (i % 3) * 0.15)) % (W + 10) - 5, py = (i * 83 + t * (0.6 + (i % 4) * 0.2)) % (H + 10) - 5; x.fillStyle = i % 3 ? '#ffffff' : '#d8ecff'; x.fillRect(Math.round(px), Math.round(py), i % 5 ? 1 : 2, i % 5 ? 1 : 2); } x.fillStyle = 'rgba(200,220,255,0.10)'; x.fillRect(0, 0, W, H); }
    else if (th === 'volcano' || th === 'lava') { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,90,30,0.14)'); g.addColorStop(1, 'rgba(90,10,10,0.18)'); x.fillStyle = g; x.fillRect(0, 0, W, H); for (let i = 0; i < 12; i++) { const px = (i * 61 + Math.sin(t / 30 + i) * 12 + W) % W, py = H - ((i * 37 + t * (0.5 + (i % 3) * 0.3)) % (H + 20)); x.fillStyle = i % 2 ? '#ffb040' : '#ff6020'; x.fillRect(Math.round(px), Math.round(py), 1, 1); } }
    else if (th === 'star') { x.fillStyle = 'rgba(20,24,70,0.28)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 22; i++) { const px = (i * 71) % W, py = (i * 43) % H; if ((t + i * 17) % 90 < 60) { x.fillStyle = i % 3 ? '#fff8d0' : '#c8d8ff'; x.fillRect(px, py, 1, 1); } } }
    else if (th === 'fort') { x.fillStyle = 'rgba(30,10,40,0.22)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 3; i++) { const y = ((i * 97 + t * 0.2) % (H + 40)) - 20; x.fillStyle = 'rgba(140,80,180,0.06)'; x.fillRect(0, Math.round(y), W, 12); } }
    else if (th === 'ice') { x.fillStyle = 'rgba(160,210,255,0.12)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 10; i++) { if ((t + i * 23) % 70 < 20) { x.fillStyle = '#ffffff'; x.fillRect((i * 53) % W, (i * 89) % H, 1, 1); } } }
    else if (th === 'plains') { x.fillStyle = 'rgba(255,230,150,0.08)'; x.fillRect(0, 0, W, H); }
    else if (th === 'autumn') { x.fillStyle = 'rgba(255,190,120,0.07)'; x.fillRect(0, 0, W, H); for (let i = 0; i < 6; i++) { const px = (i * 67 + t * 0.4) % W, py = (i * 91 + t * 0.35) % H; x.fillStyle = i % 2 ? '#e0903a' : '#c8602a'; x.fillRect(Math.round(px), Math.round(py), 2, 1); } }
  };
}

/* ---------- map props ---------- */
const CH2_PROPS = {
  manhole: spriteFrom(['................', '................', '................', '................', '................', '................', '....kkkkkkkk....', '...kGGGGGGGGk...', '..kGgkgkgkgGGk..', '..kGkgkgkgkgGk..', '..kGgkgkgkgGGk..', '...kGGGGGGGGk...', '....kkkkkkkk....', '................', '................', '................'],
    { k: '#1e1e24', G: '#6a6a74', g: '#3a3a44' }),
  windmill: spriteFrom(['.......kk.......', '..k....kk....k..', '...kW..kk..Wk...', '....kWWkkWWk....', '.....kWkkWk.....', '...kkkkkkkkkk...', '....kWkkkkWk....', '...kWk.kk.kWk...', '..kW..kRRk..Wk..', '.k...kRrrRk...k.', '.....kRrrRk.....', '....kRRrrRRk....', '....kRRRRRRk....', '....kRRDDRRk....', '....kRRDDRRk....', '....kkkkkkkk....'],
    { k: '#3a2a1e', W: '#f0e8d0', R: '#c8a060', r: '#a07a40', D: '#5a3a24' }),
  caveDoor: spriteFrom(['................', '.....kkkkkk.....', '...kkGGGGGGkk...', '..kGGGggggGGGk..', '.kGGgkkkkkkgGGk.', '.kGgkkkkkkkkgGk.', 'kGGkkkkkkkkkkGGk', 'kGgkkkkkkkkkkgGk', 'kGgkkkkkkkkkkgGk', 'kGgkkkkkkkkkkgGk', 'kGGkkkkkkkkkkGGk', 'kGgkkkkkkkkkkgGk', 'kGGkkkkkkkkkkGGk', 'kGgkkkkkkkkkkgGk', 'kGGgkkkkkkkkgGGk', 'kkkkkkkkkkkkkkkk'],
    { k: '#141018', G: '#7a7068', g: '#4e4640' }),
  iceWall: spriteFrom(['kkkkkkkkkkkkkkkk', 'kIIWIIIIWIIIIWIk', 'kIWWIiIWWIiIWWIk', 'kIIIiiIIIiiIIIIk', 'kWIIIIWIIIIWIIIk', 'kIiIWWIIiIWWIiIk', 'kIIIIIIiIIIIIIIk', 'kIWIIiIIWIIiIWIk', 'kIIWWIIIIWWIIIIk', 'kIiIIIWIIIIIWIik', 'kIIIiIIIiIIIIIIk', 'kWIIIIIWIIIiIWIk', 'kIIiIWIIIIWIIIIk', 'kIWIIIIiIIIIiIIk', 'kIIIWIIIIWIIIIIk', 'kkkkkkkkkkkkkkkk'],
    { k: '#4a78a8', I: '#bfe4ff', i: '#8ac4f0', W: '#ffffff' }),
  starGate: spriteFrom(['......kkkk......', '....kkYYYYkk....', '...kYYyyyyYYk...', '..kYy......yYk..', '..kY........Yk..', '.kYy..w..w..yYk.', '.kY....ww....Yk.', '.kY...wWWw...Yk.', '.kY....ww....Yk.', '.kYy..w..w..yYk.', '..kY........Yk..', '..kYy......yYk..', '...kYYyyyyYYk...', '....kkYYYYkk....', '......kkkk......', '................'],
    { k: '#2a3060', Y: '#ffe890', y: '#c8a040', w: '#c8d8ff', W: '#ffffff' }),
};
{ const _nf = npcFrames; npcFrames = function (look) { const im = CH2_PROPS[look]; if (im) return propFrames(im, look === 'manhole' ? 6 : 5); return _nf(look); }; }
BUILD_STYLE.tower = { roof: '#5a4a3a', roofT: 'slate', wall: '#d8c8a0', beam: '#5a4a3a', shut: '#4ac0c0', banner: '#e8c048' };

/* ---------- battle stages ---------- */
Object.assign(BG_VARIANTS, { northRoad: ['meadow', 'dusk', 'field'], goldPlains: ['plainsGold', 'meadow'], frostField: ['snow', 'snowPeak'], emberPass: ['volcano', 'volcanoRim'], starShrine: ['star'] });
{ const V2 = ['plainsGold', 'snow', 'snowPeak', 'iceCave', 'volcano', 'volcanoRim', 'lava', 'tower', 'fortress', 'star'];
  const _bb = buildBattleBG; buildBattleBG = function (kind) {
    if (!V2.includes(kind)) return _bb(kind);
    const c = mkCanvas(W, BH), x = c.getContext('2d'), r = srand(101 + V2.indexOf(kind) * 13);
    const grad = (y0, y1, stops) => { const g = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([t, col]) => g.addColorStop(t, col)); x.fillStyle = g; x.fillRect(0, y0, W, y1 - y0); };
    const glow = (X, Y, R, rgb, a) => { const g = x.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(X - R, Y - R, R * 2, R * 2); };
    const ground = (y0, from, to) => { const a = hex2rgb(from), b = hex2rgb(to); for (let y = y0; y < BH; y++) { const t = (y - y0) / (BH - y0); x.fillStyle = `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; x.fillRect(0, y, W, 1); } };
    const specks = (y0, cols, n, big) => { for (let i = 0; i < n; i++) { const py = y0 + 2 + Math.floor(r() * (BH - y0 - 3)), px = Math.floor(r() * W), s = big && py > 150 ? 2 : 1; x.fillStyle = cols[i % cols.length]; x.fillRect(px, py, s, s); } };
    const floorLines = (y0, col, fan) => { for (let k = 0, y = y0; y < BH; k++, y += 6 + k * 2) { x.fillStyle = col; x.fillRect(0, y, W, 1); } for (let i = -6; i <= 6; i++) pxLine(x, 88 + i * 12, y0, 88 + i * fan, BH, col); };
    const bricks = (y0, y1, a, b, line, bw = 16, bh = 8) => { for (let y = y0, row = 0; y < y1; y += bh, row++) for (let i = (row % 2) * (bw / 2) - bw; i < W; i += bw) { x.fillStyle = r() < 0.5 ? a : b; x.fillRect(i + 1, y + 1, bw - 2, bh - 2); x.fillStyle = line; x.fillRect(i, y, bw, 1); x.fillRect(i, y, 1, bh); } };
    if (kind === 'plainsGold') {
      grad(0, 74, [[0, '#7ab8e8'], [0.7, '#cfe6f0'], [1, '#fff4d8']]); glow(36, 18, 34, '255,248,210', 0.7); pxEllipse(x, 36, 18, 7, 7, '#fffbe8');
      pxPoly(x, [[0, 74], [0, 56], [36, 50], [70, 56], [110, 46], [150, 52], [176, 48], [176, 74]], '#c8b060');
      x.fillStyle = '#e8e0d0'; x.fillRect(130, 30, 7, 18); pxPoly(x, [[129, 30], [133, 24], [137, 30]], '#a05040'); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.5; pxLine(x, 133, 28, Math.round(133 + Math.cos(a) * 12), Math.round(28 + Math.sin(a) * 12), '#6a5a4a'); }
      ground(74, '#e8c860', '#9a7a2a'); for (let i = 0; i < 260; i++) { const py = 76 + Math.floor(Math.pow(r(), 0.7) * (BH - 78)), px = Math.floor(r() * W), h = py > 150 ? 4 : 2; x.fillStyle = r() < 0.5 ? '#f8e088' : '#c8a040'; x.fillRect(px, py - h, 1, h); }
    } else if (kind === 'snow' || kind === 'snowPeak') {
      const peak = kind === 'snowPeak'; grad(0, 82, peak ? [[0, '#5a6a9a'], [0.6, '#a8b8d8'], [1, '#e8f0fa']] : [[0, '#9ab8d8'], [0.7, '#d8e8f4'], [1, '#f4f8fc']]);
      pxPoly(x, [[0, 82], [0, 50], [26, 30], [46, 44], [76, 18], [104, 42], [130, 26], [160, 46], [176, 38], [176, 82]], peak ? '#7a8aa8' : '#b0c0d8');
      for (const [X, Y] of [[26, 30], [76, 18], [130, 26]]) pxPoly(x, [[X - 8, Y + 8], [X, Y], [X + 8, Y + 8]], '#ffffff');
      pxPoly(x, [[0, 84], [0, 66], [40, 60], [90, 68], [130, 58], [176, 64], [176, 84]], '#dce8f4');
      for (const [X, h] of [[14, 22], [30, 16], [150, 24], [166, 14]]) { x.fillStyle = '#3a5048'; pxPoly(x, [[X - 6, 70], [X, 70 - h], [X + 6, 70]], '#3a5048'); pxPoly(x, [[X - 4, 70 - h + 8], [X, 70 - h], [X + 4, 70 - h + 8]], '#ffffff'); }
      ground(84, '#f4f8fc', '#a8bcd0'); specks(84, ['#ffffff', '#c8d8e8', '#e0ecf8'], 160, 1);
      for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,255,255,0.8)'; x.fillRect(Math.floor(r() * W), Math.floor(r() * 80), 1, 1); }
    } else if (kind === 'iceCave') {
      x.fillStyle = '#1a2a3e'; x.fillRect(0, 0, W, BH); for (let i = 0; i < 200; i++) { x.fillStyle = r() < 0.5 ? '#223650' : '#142234'; x.fillRect(Math.floor(r() * W), Math.floor(r() * 100), 2 + Math.floor(r() * 4), 2); }
      pxEllipse(x, 88, 62, 30, 34, '#0a1220');
      for (let i = 0; i < 14; i++) { const X = Math.floor(r() * W), h = 8 + Math.floor(r() * 20); pxPoly(x, [[X - 4, 0], [X, h], [X + 4, 0]], r() < 0.5 ? '#a8d8ff' : '#6ab0e8'); }
      for (let i = 0; i < 8; i++) { const X = Math.floor(r() * W), Y = 30 + Math.floor(r() * 60), h = 8 + Math.floor(r() * 10); glow(X, Y, h * 1.8, '140,210,255', 0.35); pxPoly(x, [[X, Y - h], [X + 4, Y], [X - 4, Y]], '#c8ecff'); }
      ground(100, '#6a90b8', '#1a2a40'); specks(100, ['#c8ecff', '#8ab8e0'], 80, 1); floorLines(100, 'rgba(200,236,255,0.25)', 30);
    } else if (kind === 'volcano' || kind === 'volcanoRim') {
      const rim = kind === 'volcanoRim'; grad(0, 80, rim ? [[0, '#1a0a0a'], [0.5, '#6a1e14'], [1, '#d86030']] : [[0, '#3a1a1a'], [0.6, '#8a3a24'], [1, '#e08040']]);
      pxPoly(x, [[0, 80], [0, 58], [40, 40], [70, 24], [88, 22], [106, 24], [136, 42], [176, 56], [176, 80]], '#2a1a18'); pxPoly(x, [[74, 26], [88, 18], [102, 26]], '#ff6020'); glow(88, 20, 30, '255,120,40', 0.6);
      for (let i = 0; i < 16; i++) { x.fillStyle = r() < 0.5 ? '#ff8040' : '#ffd070'; x.fillRect(80 + Math.floor(r() * 16), Math.floor(r() * 18), 1, 2); }
      ground(80, '#4a2a22', '#1a0e0a'); for (let i = 0; i < 6; i++) { const Y = 100 + i * 20 + Math.floor(r() * 10), X0 = Math.floor(r() * 60); pxLine(x, X0, Y, X0 + 40 + Math.floor(r() * 60), Y + Math.floor(r() * 8) - 4, '#ff6020'); }
      specks(80, ['#6a3a2a', '#2a1410', '#ff8040'], 90, 1);
    } else if (kind === 'lava') {
      x.fillStyle = '#1e0e0a'; x.fillRect(0, 0, W, BH); for (let i = 0; i < 200; i++) { x.fillStyle = r() < 0.5 ? '#2e1610' : '#140806'; x.fillRect(Math.floor(r() * W), Math.floor(r() * 100), 3, 2); }
      pxEllipse(x, 88, 62, 28, 34, '#0a0404'); glow(88, 96, 90, '255,90,20', 0.35);
      x.fillStyle = '#ff5010'; x.fillRect(0, 96, W, 14); for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.5 ? '#ffb040' : '#ff7020'; x.fillRect(Math.floor(r() * W), 97 + Math.floor(r() * 12), 3 + Math.floor(r() * 6), 1); }
      ground(110, '#3a2420', '#140a08'); floorLines(110, '#2a1612', 34); specks(110, ['#ff6020', '#4a2a22'], 50, 0);
    } else if (kind === 'tower') {
      x.fillStyle = '#2e2418'; x.fillRect(0, 0, W, BH); bricks(0, 100, '#4a3a28', '#42341e', '#5a4832', 18, 9);
      for (const [X, Y, R0] of [[40, 40, 22], [136, 36, 16], [90, 70, 12]]) { x.strokeStyle = '#c8a050'; x.lineWidth = 3; x.beginPath(); x.arc(X, Y, R0, 0, 7); x.stroke(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.fillStyle = '#c8a050'; x.fillRect(Math.round(X + Math.cos(a) * (R0 + 3)) - 2, Math.round(Y + Math.sin(a) * (R0 + 3)) - 2, 4, 4); } }
      x.fillStyle = '#f0e0b0'; pxEllipse(x, 88, 30, 18, 18, '#f0e8d0'); x.strokeStyle = '#3a2a1a'; x.lineWidth = 2; x.beginPath(); x.moveTo(88, 30); x.lineTo(88, 18); x.moveTo(88, 30); x.lineTo(97, 34); x.stroke(); glow(88, 30, 40, '255,230,160', 0.25);
      ground(100, '#6a5436', '#221a10'); floorLines(100, '#4a3a24', 30);
    } else if (kind === 'fortress') {
      x.fillStyle = '#16101e'; x.fillRect(0, 0, W, BH); bricks(0, 100, '#2a2034', '#241a2e', '#3a2e48', 20, 10);
      for (const X of [20, 156]) { x.fillStyle = '#0e0a14'; x.fillRect(X - 6, 10, 12, 90); x.fillStyle = '#6a2a8a'; x.fillRect(X - 5, 14, 10, 30); x.fillStyle = '#a040d0'; x.fillRect(X - 1, 18, 2, 22); }
      pxEllipse(x, 88, 64, 26, 36, '#08040c'); glow(88, 70, 40, '160,60,220', 0.3);
      for (const X of [52, 124]) { x.fillStyle = '#e8e0c8'; x.fillRect(X, 80, 2, 8); glow(X + 1, 78, 12, '200,120,255', 0.6); x.fillStyle = '#d8a0ff'; x.fillRect(X, 76, 2, 3); }
      ground(100, '#3a2e48', '#0e0a14'); floorLines(100, '#2a2036', 32); x.fillStyle = 'rgba(160,60,200,0.10)'; for (let i = 0; i < 4; i++) x.fillRect(0, 100 + i * 20, W, 6);
    } else if (kind === 'star') {
      grad(0, 100, [[0, '#060818'], [0.6, '#141a44'], [1, '#2a3070']]); for (let i = 0; i < 120; i++) { x.fillStyle = r() < 0.2 ? '#ffe890' : r() < 0.5 ? '#c8d8ff' : '#ffffff'; x.fillRect(Math.floor(r() * W), Math.floor(r() * 96), 1, 1); }
      glow(130, 26, 30, '255,240,200', 0.45); pxEllipse(x, 130, 26, 9, 9, '#fff8e0');
      for (const X of [24, 60, 116, 152]) { x.fillStyle = '#d8d8f0'; x.fillRect(X - 4, 48, 8, 54); x.fillStyle = '#f8f8ff'; x.fillRect(X - 3, 48, 2, 54); x.fillStyle = '#9a9ac0'; x.fillRect(X - 6, 44, 12, 4); }
      ground(100, '#4a4e88', '#141630'); floorLines(100, '#6a70b0', 30); specks(100, ['#ffe890', '#c8d8ff'], 40, 0);
    }
    c.kind = kind; return c;
  };
}
Object.assign(HD2D_LOOK, {
  plainsGold: { key: [255, 240, 190], shaft: 'rgba(255,240,190,', haze: 'rgba(255,240,200,', mote: ['#fff4c0', '#ffffff', '#f8e088'], cool: [60, 50, 20], sharp: [96, 150], far: 70 },
  snow: { key: [230, 240, 255], shaft: 'rgba(230,240,255,', haze: 'rgba(230,240,255,', mote: ['#ffffff', '#e0ecff', '#c8dcff'], cool: [40, 60, 100], sharp: [96, 150], far: 80 },
  snowPeak: { key: [200, 210, 255], shaft: 'rgba(200,215,255,', haze: 'rgba(200,215,245,', mote: ['#ffffff', '#d0e0ff', '#b0c8f0'], cool: [30, 40, 90], sharp: [96, 150], far: 82 },
  iceCave: { key: [150, 220, 255], shaft: 'rgba(150,220,255,', haze: 'rgba(120,180,230,', mote: ['#c8ecff', '#ffffff', '#8ad0ff'], cool: [10, 30, 60], sharp: [100, 150], far: 90 },
  volcano: { key: [255, 150, 90], shaft: 'rgba(255,140,80,', haze: 'rgba(200,90,60,', mote: ['#ffb040', '#ff7040', '#ffe0a0'], cool: [60, 10, 10], sharp: [96, 150], far: 80 },
  volcanoRim: { key: [255, 120, 70], shaft: 'rgba(255,120,60,', haze: 'rgba(180,60,40,', mote: ['#ff9040', '#ff5020', '#ffd080'], cool: [50, 5, 5], sharp: [96, 150], far: 82 },
  lava: { key: [255, 130, 60], shaft: 'rgba(255,120,50,', haze: 'rgba(200,70,30,', mote: ['#ffb040', '#ff6020', '#ffe0a0'], cool: [40, 5, 5], sharp: [104, 150], far: 90 },
  tower: { key: [255, 230, 170], shaft: 'rgba(255,230,170,', haze: 'rgba(200,170,110,', mote: ['#ffe8a0', '#fff8e0', '#c8a050'], cool: [30, 20, 10], sharp: [100, 150], far: 90 },
  fortress: { key: [200, 140, 255], shaft: 'rgba(200,140,255,', haze: 'rgba(120,70,160,', mote: ['#d8a0ff', '#a040d0', '#ffffff'], cool: [20, 5, 40], sharp: [104, 150], far: 92 },
  star: { key: [220, 230, 255], shaft: 'rgba(220,230,255,', haze: 'rgba(120,130,220,', mote: ['#fff8d0', '#c8d8ff', '#ffffff'], cool: [10, 10, 50], sharp: [100, 150], far: 90 },
});

/* ---------- music: 王都 (regal march) · 雪原 (quiet waltz-like) · 火山／要塞 (driving minor) ---------- */
{ const P = (duty, vol, notes) => ({ k: 'p', duty, vol, notes }), T = (vol, notes) => ({ k: 't', vol, notes }), N = (vol, notes) => ({ k: 'n', vol, notes });
  let ch = 'D G A D Bm G A D';
  SONG_DEFS.capital = { bpm: 112, ch: [P(.5, .12, 'L D5.4 F#5.4 A5.6 F#5.2 | G5.4 B5.4 D6.6 B5.2 | A5.6 G5.2 F#5.4 E5.4 | F#5.8 D5.8 | B4.4 D5.4 F#5.6 E5.2 | D5.4 B4.4 G5.8 | A5.4 C#6.4 E6.4 C#6.4 | D6.12 r.4'),
    P(.25, .055, 'L ' + arpLine(ch, [0, 1, 2, 1], 4, 2)), T(.2, 'L ' + bassLine(ch, 'q')), N(.2, 'L ' + drumLine('k...s.h.k.k.s...', 8))] };
  ch = 'Am F C G Am F E Am';
  SONG_DEFS.snow = { bpm: 76, ch: [P(.25, .11, 'L E5.8 A5.8 | C6.6 B5.2 A5.8 | G5.8 E5.8 | D5.6 E5.2 G5.8 | A5.4 C6.4 B5.4 A5.4 | F5.8 A5.8 | G#5.8 B5.8 | A5.16'),
    P(.125, .05, 'L ' + arpLine(ch, [0, 1, 2, 3, 2, 1, 2, 1], 4, 2)), T(.16, 'L ' + bassLine(ch, 'h')), N(.08, 'L ' + drumLine('h.......h.......', 8))] };
  ch = 'Dm Dm Bb C Dm Gm A A';
  SONG_DEFS.volcano = { bpm: 132, ch: [P(.5, .12, 'L D5.2 D5.2 F5.2 D5.2 A5.4 G5.4 | F5.2 E5.2 D5.4 C5.4 D5.4 | Bb4.4 D5.4 F5.4 Bb5.4 | C6.6 Bb5.2 A5.4 G5.4 | A5.2 A5.2 D6.4 C6.4 A5.4 | G5.4 Bb5.4 D6.8 | C#6.4 E6.4 A5.8 | E5.4 G5.4 C#6.8'),
    P(.25, .06, 'L ' + arpLine(ch, [0, 2, 1, 2], 4, 2)), T(.22, 'L ' + bassLine(ch, 'e8')), N(.3, 'L ' + drumLine('k.h.s.h.k.k.s.h.', 8))] };
}

/* ---------- field & bestiary looks for ch2 monsters: taken from their battle chibi (Codex set or its recolour) ----------
   New monsters have no walker strip of their own, so the map elites / bosses and the bestiary icon reuse the chibi idle frame. */
const CH2_KEYS = new Set(CH2_MON.map(r => r[0]));
const ch2ChibiOk = sp => CH2_KEYS.has(sp) && typeof chibiBase === 'function' && !!chibiBase(sp) && !BATTLE_FIELD[sp] && typeof BATTLE_PXC_META !== 'undefined' && BATTLE_PXC_META[chibiBase(sp)];
function ch2ChibiFrame(sp, size, step, flip) {
  const key = 'c2' + sp + size + (step ? 1 : 0) + (flip ? 'f' : ''); if (FIELD_TINT[key]) return FIELD_TINT[key];
  const im = chibiImage(sp), M = BATTLE_PXC_META[chibiBase(sp)]; if (!im || !M) return null;
  const fi = (M.frames.idle || [0])[0], iw = M.w - 2, ih = M.h - 2, s = Math.min(size / iw, size / ih), dw = Math.round(iw * s), dh = Math.round(ih * s);
  const c = mkCanvas(size, size), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  if (flip) { x.translate(size, 0); x.scale(-1, 1); }
  x.drawImage(im, fi * M.w + 1, 1, iw, ih, Math.round((size - dw) / 2), size - dh - (step ? 1 : 0), dw, dh);
  return FIELD_TINT[key] = c;
}
{ const _ff = fieldFrame; fieldFrame = function (sp, dir, step) { return ch2ChibiOk(sp) ? ch2ChibiFrame(sp, 32, step, dir === 'right') || _ff(sp, dir, step) : _ff(sp, dir, step); }; }
{ const _db = Overworld.prototype.drawBoss; Overworld.prototype.drawBoss = function (x, e, camX, camY) {
    if (!ch2ChibiOk(e.sp)) return _db.call(this, x, e, camX, camY);
    const f = ch2ChibiFrame(e.sp, 48, Math.floor(this.t / 30) % 2, false); if (!f) return _db.call(this, x, e, camX, camY);
    const sx = Math.round(e.px) - camX + 16 - 24, sy = Math.round(e.py) - camY + 16 - 48 - 1;
    x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(Math.round(e.px) - camX + 16, Math.round(e.py) - camY + 14, 15, 4, 0, 0, 7); x.fill();
    x.drawImage(f, sx, sy);
    if (this.bossGlow) { x.globalAlpha = this.bossGlow; x.fillStyle = '#ffd040'; x.fillRect(sx + 18, sy + 18, 12, 3); x.globalAlpha = 1; }
  };
}
{ const _mm = monsterMini; monsterMini = function (sp, size) {
    if (!ch2ChibiOk(sp)) return _mm(sp, size);
    const k = 'c2' + sp + size; if (miniCache[k]) return miniCache[k];
    const c = ch2ChibiFrame(sp, size, 0, false); if (!c) return _mm(sp, size);
    return miniCache[k] = { c, flip: flipCanvas(c) };
  };
}

/* ---------- v24.10 skills aimed at the visible body of big monsters ----------
   Playtest: "some skills don't hit the boss". Effects aim at the middle of the foe's box, and a chibi's box was its whole frame —
   big bosses (影將 / 熔岩巨人 / 九頭蛇 …) stand in the lower part of a tall frame, so their middle was up near the head or above it.
   The box now starts at the first visible row of the idle frame (feet / drawing position unchanged). */
{ const VIS = {};
  const visTop = base => { if (base in VIS) return VIS[base]; const im = BATTLE_PXC[base], M = typeof BATTLE_PXC_META !== 'undefined' && BATTLE_PXC_META[base]; if (!im || !im.ok || !M) return null;
    const fi = (M.frames.idle || [0])[0], c = mkCanvas(M.w, M.h), x = c.getContext('2d'); x.drawImage(im, fi * M.w, 0, M.w, M.h, 0, 0, M.w, M.h);
    const d = x.getImageData(0, 0, M.w, M.h).data; let t = -1; for (let y = 0; y < M.h && t < 0; y++) for (let xx = 0; xx < M.w; xx++) if (d[(y * M.w + xx) * 4 + 3]) { t = y; break; }
    return VIS[base] = t < 0 ? null : t; };
  const _ps = pxSpec; pxSpec = function (key) {
    const S = _ps(key); if (!S || !S.chibi || !S.bb || typeof chibiBase !== 'function') return S;
    const t = visTop(chibiBase(key)); if (t === null || t === undefined) return S;
    const top = PX_PAD + t; if (top > S.bb.top && top < S.bb.bot) S.bb = { ...S.bb, top, h: S.bb.bot - top + 1 };
    return S;
  };
}

/* ---------- v24.12 monster shouts / quakes now visibly reach the hero ----------
   Playtest: "check that the normal monsters' skill effects hit too". An audit of every monster move (tools/v81.js) found the
   shout-type moves (鳴叫 / 尖嘯 / 哀嚎 and their aliases) and 地鳴 only drew rings / cracks around the monster itself.
   They now end with the wave arriving on the hero (rings at the hero) / cracks opening under the hero's feet. */
{ const wrap = (k, after) => { const orig = MFX[k]; if (!orig) return; const w = function* (U, T, u, t) { yield* orig.call(this, U, T, u, t); yield* after.call(this, U, T); };
    for (const key in MFX) if (MFX[key] === orig) MFX[key] = w; };
  const waveAt = c => function* (U, T) { for (let i = 0; i < 2; i++) { mSpawn(this, 'mjag', { x: T.x, y: T.y, r0: 4, r1: 20 + i * 8, c, n: 12, life: 12, rot: i * 0.5 }); yield* wait(4); } yield* wait(6); };
  wrap('m_chirp', waveAt('#f0d060')); wrap('m_screech', waveAt('#e04050')); wrap('m_wail', waveAt('#8a78b0'));
  wrap('m_rumble', function* (U, T) { mSpawn(this, 'mcrack', { x: T.x, y: T.y + 24, n: 3, c: '#2a1a10', life: 26 }); this.shake = Math.max(this.shake, 8); yield* wait(10); });
}
