/* ===================== PAPER DOLL: equipped head/body/feet/weapon change the hero sprite ===================== */
// Overlay rows: '.' keep base pixel · '_' erase · other letters paint (palette below). Rows are 16 wide, index = sprite row.
// Mode 'back' overlays only paint where the base sprite is empty (things carried behind the body).
const DOLL_HEAD = {
  cap: {
    down: { 1: '.........__.....', 2: '.....kkkkkk.....', 3: '...kkAAAAAAkkk..', 4: '..kAAACCAAAAAAk.', 5: '.kAAAAAAAAAAAAk.', 6: '.kaaaaaaaaaaaak.' },
    up: { 1: '.....__.........', 2: '.....kkkkkk.....', 3: '..kkAAACAAAkk...', 4: '.kAAAAACCAAAAk..', 5: '.kAAAAAAAAAAAAk.', 6: '.kaaaaaaaaaaaak.' },
    left: { 1: '.......__.......', 2: '....kkkkkkk.....', 3: '..kkAAACAAAkk...', 4: '.kAAAAACCAAAAk..', 5: '.kAAAAAAAAAAAk..', 6: 'kaaaaaaaaaaaaak.' },
  },
  helm: {
    down: { 1: '.........__.....', 2: '.....kkkkkk.....', 3: '...kkAAACAAkkk..', 4: '..kAAACCAAAAAAk.', 5: '.kAAAAAAAAAAAAk.', 6: '.kaaaaaaaaaaaak.', 7: '.kAk........kAk.', 8: '.kAk........kAk.', 9: '.kak........kak.' },
    up: { 1: '.....__.........', 2: '.....kkkkkk.....', 3: '..kkAAACAAAkk...', 4: '.kAAAAACCAAAAk..', 5: '.kAAAAAAAAAAAAk.', 6: '.kaaaaaaaaaaaak.', 7: '.kAAAAAAAAAAAAk.', 8: '.kaaaaaaaaaaaak.' },
    left: { 1: '.......__.......', 2: '....kkkkkkk.....', 3: '..kkAAACAAAkk...', 4: '.kAAAAACCAAAAk..', 5: '.kAAAAAAAAAAAk..', 6: '.kaaaaaaaaaaaak.', 7: '.......kAAAAAAk.', 8: '........kaaaak..' },
  },
  hood: {
    down: { 1: '.........__.....', 2: '.....kkkkkk.....', 3: '...kkAAAAAAkkk..', 4: '..kAAACCAAAAAAk.', 5: '.kAAAAAAAAAAAAk.', 6: '.kAAaaaaaaaaAAk.', 7: '.kAak......kaAk.', 8: '.kAk........kAk.', 9: '.kAk........kAk.', 10: '.kAk........kAk.', 11: '..kAk......kAk..', 12: '...kAA....AAk...' },
    up: { 1: '.....__.........', 2: '.....kkkkkk.....', 3: '..kkAAACAAAkk...', 4: '.kAAAAACCAAAAk..', 5: '.kAAAAAACAAAAAk.', 6: '.kAAAAAACAAAAAk.', 7: '.kAAAAAACAAAAAk.', 8: '.kAAAAAACAAAAAk.', 9: '.kAAAAAACAAAAAk.', 10: '.kkAAAAACAAAAkk.', 11: '..kkaaaaaaaakk..' },
    left: { 1: '.......__.......', 2: '....kkkkkkk.....', 3: '..kkAAACAAAkk...', 4: '.kAAAAACCAAAAk..', 5: '.kAAAAAAAAAAAk..', 6: '.kAaaaaAAAAAAAk.', 7: '.kak...kAAAAAAk.', 8: '.kk....kAAAAAk..', 9: '.......kAAAAAk..', 10: '.......kAAAAAk..', 11: '........kaaak...' },
  },
};
const DOLL_DECO = { // extra pixels on top of a head shape
  feather: { down: { 0: '............E...', 1: '...........EE...', 2: '...........E....' }, up: { 0: '...E............', 1: '...EE...........', 2: '....E...........' }, left: { 0: '..........E.....', 1: '.........EE.....', 2: '.........E......' } },
  lamp: { down: { 4: '......kEEk......', 5: '......kEEk......' }, up: {}, left: { 4: '.kEk............', 5: '.kEk............' } },
  visor: { down: { 8: '.kAakkkkkkkkaAk.', 9: '.kAAAAAAAAAAAAk.' }, up: {}, left: { 8: '.kAakkkkAAAAk...', 9: '.kAAAAAAAAAAk...' } },
  horns: { down: { 0: '.C............C.', 1: '.kC..........Ck.', 2: '..kC........Ck..' }, up: { 0: '.C............C.', 1: '.kC..........Ck.', 2: '..kC........Ck..' }, left: { 0: '............C...', 1: '...........Ck...', 2: '..........Ck....' } },
};
const DOLL_WEAPON = { // carried on the back in the field
  sword: { down: { 10: '..............TU', 11: '..............UI', 12: '..............Ii' }, up: { 12: '...........TU...', 13: '..........UIi...', 14: '.........Iik....', 15: '........Iik.....', 16: '.......Iik......', 17: '......Iik.......' }, left: { 11: '..........TU....', 12: '.........UIi....', 13: '........Iik.....' } },
  dagger: { down: { 16: '..............TI' }, up: { 16: '..........TIi...', 17: '.........TIi....' }, left: { 16: '........TIi.....' } },
  staff: { down: { 6: '..............VV', 7: '..............VV', 8: '..............Tk', 9: '..............Tk', 10: '..............Tk', 11: '..............Tk', 12: '..............Tk' }, up: { 7: '...........VV...', 8: '...........VV...', 9: '...........Tk...', 10: '...........Tk...', 11: '...........Tk...', 12: '...........Tk...', 13: '...........Tk...', 14: '...........Tk...', 15: '...........Tk...' }, left: { 6: '............VV..', 7: '............VV..', 8: '............Tk..', 9: '............Tk..', 10: '............Tk..', 11: '............Tk..' } },
  axe: { down: { 9: '.............III', 10: '.............IiT', 11: '...............T', 12: '...............T' }, up: { 11: '.........IIIT...', 12: '.........IiT....', 13: '..........T.....', 14: '.........T......' }, left: { 10: '...........IIIT.', 11: '...........IiT..', 12: '............T...' } },
};
const WEAPON_BACK = new Set(['sword', 'staff', 'axe']); // drawn only behind the body in front/side views
// palettes
const HEAD_PAL = {
  cloth: { A: '#8a6a4a', a: '#5a4430', C: '#b08a60' }, hunter: { A: '#4a7a3a', a: '#2e5226', C: '#6a9a50', E: '#f0e8d8' }, bronze: { A: '#b08040', a: '#7a5424', C: '#e8bc68' },
  steel: { A: '#a8b0c0', a: '#6a7488', C: '#eef0f6' }, stone: { A: '#8a8070', a: '#5a5244', C: '#b8b098' }, bone: { A: '#e0d8c0', a: '#a89e84', C: '#fff8e8' },
  miner: { A: '#e0b030', a: '#a07818', C: '#fff0a0', E: '#fffbe0' }, bandit: { A: '#6a2a24', a: '#401814', C: '#8a3a30' },
};
const BODY_PAL = {
  uniform: {},
  leather: { N: '#8a5a34', n: '#5e3a1e', m: '#a8744a', W: '#d8c0a0', R: '#6a4020', G: '#c8a048', O: '#7a4e2a', o: '#5a3818', q: '#3a2410' },
  hunter: { N: '#4e6a34', n: '#34481e', m: '#6a8a44', W: '#c8b890', R: '#5a3a1e', G: '#c8a048', O: '#5a7040', o: '#3a4c28', q: '#2a3418' },
  mist: { N: '#6a7890', n: '#4a5468', m: '#8a98b0', W: '#d0d8e0', R: '#5a6478', G: '#c0c8d8', O: '#7a88a0', o: '#5a6478', q: '#3a4458' },
  frog: { N: '#6a4a8a', n: '#4a3068', m: '#8a6aaa', W: '#c8f050', R: '#4a3068', G: '#c8f050', O: '#7a5a9a', o: '#5a3a78', q: '#3a2458' },
  chain: { N: '#8a94a8', n: '#5a6478', m: '#b8c0d0', W: '#d8dce4', R: '#4a5060', G: '#e8c048', O: '#7a8498', o: '#5a6478', q: '#3a4050' },
  scale: { N: '#3a8a8a', n: '#246060', m: '#5ab0a8', W: '#a8e0d0', R: '#246060', G: '#e8c048', O: '#3a7a7a', o: '#245a5a', q: '#143a3a' },
  stone: { N: '#8a7e6a', n: '#5a5244', m: '#a89e88', W: '#c8c0a8', R: '#4a4234', G: '#d8b048', O: '#7a6e5a', o: '#5a5244', q: '#3a3428' },
  ruin: { N: '#b09a70', n: '#7a6a48', m: '#d0bc90', W: '#e8dcc0', R: '#5a4a30', G: '#60d0c8', O: '#a08a60', o: '#7a6a48', q: '#4a3e28' },
  silk: { N: '#d8d0e8', n: '#a098b8', m: '#f4f0fa', W: '#ffffff', R: '#8a70c0', G: '#c0a0f0', O: '#c8c0dc', o: '#a098b8', q: '#6a6088' },
  rune: { N: '#2e3c80', n: '#1c2658', m: '#4a5aa8', W: '#e8d890', R: '#d8b048', G: '#60e0ff', O: '#2e3c80', o: '#1c2658', q: '#101838' },
  boneKnight: { N: '#4a5068', n: '#2e3246', m: '#6a7090', W: '#e0d8c0', R: '#8a2030', G: '#e0d8c0', O: '#4a5068', o: '#2e3246', q: '#1c2030' },
};
const FEET_PAL = {
  school: {}, travel: { B: '#7a5030', b: '#4a3018' }, mist: { B: '#5a6478', b: '#3a4458' }, feather: { B: '#e8e0d0', b: '#a8a090' }, hunter: { B: '#4e6a34', b: '#2e4220' },
  knight: { B: '#a8b0c0', b: '#6a7488', P: '#8a94a8', p: '#5a6478' }, miner: { B: '#5a4a3a', b: '#3a2a1e' }, shadow: { B: '#3a2a4a', b: '#1e1428', P: '#3a3446', p: '#26222e' }, ancient: { B: '#c8a050', b: '#8a6a2a', P: '#9a8a60', p: '#6a5a3a' },
};
const WPN_PAL = { // I light · i mid · T grip · U guard · V orb
  wood: { I: '#d8a868', i: '#a8743c', T: '#6a3a26', U: '#e8c048' }, steel: { I: '#ffffff', i: '#b8c0d0', T: '#6a3a26', U: '#e8c048' }, bone: { I: '#fff8e8', i: '#d0c8b0', T: '#4a3a30', U: '#a89e84' },
  fire: { I: '#ffd0a0', i: '#f07030', T: '#5a2a1a', U: '#e8c048' }, crystal: { I: '#e8ffff', i: '#80e0ff', T: '#4a4a6a', U: '#c0f0ff' }, dawn: { I: '#fffbe0', i: '#ffc830', T: '#6a3a26', U: '#fff0a0' },
  master: { I: '#f0f8ff', i: '#8ab0e0', T: '#3a3a5a', U: '#e8c048' }, king: { I: '#ffe0c0', i: '#d83a2a', T: '#4a2a1a', U: '#ffd84a' }, volt: { I: '#fffbc0', i: '#e8d030', T: '#3a3a5a', U: '#b0b8c8' },
  fang: { I: '#fff8f0', i: '#e0d0b8', T: '#5a3a28', U: '#8a6a4a' }, grey: { I: '#e8ecf0', i: '#98a0b0', T: '#4a3a30', U: '#b0b8c8' },
  wandW: { T: '#8a5a30', V: '#f0f4ff' }, wandG: { T: '#6a4a24', V: '#8ae070' }, wandS: { T: '#8a8070', V: '#ffb040' }, wandT: { T: '#4a6a2a', V: '#ff90c0' }, wandB: { T: '#3a5a8a', V: '#60c8ff' }, wandY: { T: '#b08830', V: '#fff060' },
};
// gear → look
const GEAR_LOOK = {
  clothCap: ['cap', 'cloth'], hunterCap: ['cap', 'hunter', 'feather'], guardHelm: ['helm', 'bronze'], knightHelm: ['helm', 'steel'], golemVisor: ['helm', 'stone', 'visor'], boneHelm: ['helm', 'bone', 'horns'], minerHelm: ['helm', 'miner', 'lamp'], banditHood: ['hood', 'bandit'],
  uniform: 'uniform', leather: 'leather', hunterLeather: 'hunter', mistCloak: 'mist', frogCloak: 'frog', chainMail: 'chain', scaleArmor: 'scale', stoneMail: 'stone', ruinMail: 'ruin', silkRobe: 'silk', runeMantle: 'rune', boneKnightMail: 'boneKnight',
  schoolShoes: 'school', travelBoots: 'travel', mistBoots: 'mist', featherBoots: 'feather', hunterBoots: 'hunter', knightGreaves: 'knight', minerBoots: 'miner', shadowBoots: 'shadow', ancientGreaves: 'ancient',
  woodSword: ['sword', 'wood'], ironSword: ['sword', 'steel'], knightSword: ['sword', 'steel'], boneSaber: ['sword', 'bone'], foxBlade: ['sword', 'fire'], crystalBlade: ['sword', 'crystal'], dawnSword: ['sword', 'dawn'], masterBlade: ['sword', 'master'], kingsBlade: ['sword', 'king'], voltSword: ['sword', 'volt'],
  mistDagger: ['dagger', 'grey'], fangDagger: ['dagger', 'fang'], emberKnife: ['dagger', 'fire'],
  practiceWand: ['staff', 'wandW'], apprenticeStaff: ['staff', 'wandW'], oakStaff: ['staff', 'wandG'], ruinStaff: ['staff', 'wandS'], thornStaff: ['staff', 'wandT'], tideStaff: ['staff', 'wandB'], stormStaff: ['staff', 'wandY'], grenAxe: ['axe', 'grey'],
};
for (const k in GEAR_LOOK) if (GEAR[k]) GEAR[k].look = GEAR_LOOK[k];

function heroLookOf(st = Game.st, over = {}) {
  const eq = { ...(st.equip || {}), ...over }, L = { head: null, body: 'uniform', feet: 'school', weapon: null };
  for (const sl of ['head', 'body', 'feet', 'weapon']) { const g = gearBy(eq[sl], st); if (g && GEAR[g.b].look) L[sl] = GEAR[g.b].look; }
  return L;
}
const lookKey = L => JSON.stringify(L);
const dollCache = {};
function dollApply(rows, ov, back) { for (const r in ov) { const y = +r; if (y < 0 || y >= rows.length) continue; const a = rows[y].split(''), o = ov[r]; for (let i = 0; i < 16; i++) { const c = o[i]; if (!c || c === '.') continue; if (back && a[i] !== '.') continue; a[i] = c === '_' ? '.' : c; } rows[y] = a.join(''); } }
function heroFramesLook(L) {
  const key = lookKey(L); if (dollCache[key]) return dollCache[key];
  const pal = { ...HERO_PAL, ...(BODY_PAL[L.body] || {}), ...(FEET_PAL[L.feet] || {}) };
  if (L.head) Object.assign(pal, HEAD_PAL[L.head[1]] || {}); if (L.weapon) Object.assign(pal, WPN_PAL[L.weapon[1]] || {});
  pal.k = HERO_PAL.k;
  const build = (dir, legs, bob) => {
    const out = new Array(22).fill('................'), off = bob ? -1 : 0, body = HERO_ROWS[dir], Lg = LEGS[legs];
    for (let i = 0; i < body.length; i++) if (i + off >= 0) out[i + off] = body[i];
    for (let i = 0; i < Lg.length; i++) if (18 + off + i < 22) out[18 + off + i] = Lg[i];
    const shift = ov => { const o = {}; for (const r in ov) o[+r + off] = ov[r]; return o; };
    if (L.weapon && WEAPON_BACK.has(L.weapon[0]) && dir !== 'up') dollApply(out, shift(DOLL_WEAPON[L.weapon[0]][dir]), true);
    if (L.head) { dollApply(out, shift(DOLL_HEAD[L.head[0]][dir])); if (L.head[2]) dollApply(out, shift(DOLL_DECO[L.head[2]][dir] || {})); }
    if (L.weapon && (dir === 'up' || !WEAPON_BACK.has(L.weapon[0]))) dollApply(out, shift(DOLL_WEAPON[L.weapon[0]][dir]), dir !== 'up');
    return spriteFrom(out, pal);
  };
  const f = {}; for (const d of ['down', 'up']) f[d] = [build(d, 'stand', 0), build(d, 'stepL', 1), build(d, 'stand', 0), build(d, 'stepR', 1)];
  f.left = [build('left', 'sideStand', 0), build('left', 'sideStepA', 1), build('left', 'sideStand', 0), build('left', 'sideStepB', 1)]; f.right = f.left.map(flipCanvas);
  return dollCache[key] = f;
}
let dollLast = { k: null, f: null };
function heroFramesFor(st = Game.st) { const k = JSON.stringify(st && st.equip) + (st && st.gear ? st.gear.length : 0); if (dollLast.k !== k) dollLast = { k, f: st ? heroFramesLook(heroLookOf(st)) : Hero.frames }; return dollLast.f; }
// Battle (back view): the doll without the sheathed weapon, holding the weapon in the right hand
const heroBattleLookCache = {};
function heroBattleImgLook(frame, L) {
  const key = frame + lookKey(L); if (heroBattleLookCache[key]) return heroBattleLookCache[key];
  const n = mkCanvas(24, 23), x = n.getContext('2d'); x.drawImage(heroFramesLook({ ...L, weapon: null }).up[frame], 0, 1);
  const W0 = L.weapon; if (W0) {
    const P = WPN_PAL[W0[1]] || WPN_PAL.steel, pts = [];
    if (W0[0] === 'sword' || W0[0] === 'dagger') { const len = W0[0] === 'sword' ? 6 : 3; pts.push([14, 16, P.T], [15, 15, P.U], [14, 14, P.U], [16, 16, P.U]); for (let t = 0; t < len; t++) { pts.push([16 + t, 13 - t, P.I], [16 + t, 14 - t, P.i]); } pts.push([16 + len, 13 - len + 1, P.I]); }
    if (W0[0] === 'staff') { for (let t = 0; t < 9; t++) pts.push([15 + Math.floor(t / 3), 17 - t, P.T]); pts.push([18, 7, P.V], [19, 7, P.V], [18, 6, P.V], [19, 6, '#ffffff']); }
    if (W0[0] === 'axe') { for (let t = 0; t < 7; t++) pts.push([14 + Math.floor(t / 2), 17 - t, P.T]); for (const [a, b] of [[17, 10], [18, 10], [19, 10], [18, 11], [19, 11], [18, 9], [19, 9], [20, 10]]) pts.push([a, b, (a + b) % 2 ? P.I : P.i]); }
    const id = x.getImageData(0, 0, 24, 23), d = id.data, set = new Set(pts.map(([a, b]) => a + ',' + b));
    const put = (px, py, c) => { if (px < 0 || py < 0 || px >= 24 || py >= 23) return; const [r, g, bb] = hex2rgb(c), k = (py * 24 + px) * 4; d[k] = r; d[k + 1] = g; d[k + 2] = bb; d[k + 3] = 255; };
    for (const [px, py, c] of pts) put(px, py, c);
    for (const [px, py] of pts) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qx = px + dx, qy = py + dy; if (qx < 0 || qy < 0 || qx >= 24 || qy >= 23 || set.has(qx + ',' + qy)) continue; if (d[(qy * 24 + qx) * 4 + 3] === 0) put(qx, qy, '#2a2238'); }
    x.putImageData(id, 0, 0);
  }
  const big = mkCanvas(72, 69), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(n, 0, 0, 24, 23, 0, 0, 72, 69);
  return heroBattleLookCache[key] = big;
}

// front + back preview used by the equipment screen (dir toggles every 1.5s so both sides are visible)
function dollPreview(x, L, X, Y, small) {
  const f = heroFramesLook(L), dirs = ['down', 'left', 'up', 'right'], d = dirs[Math.floor(Game.frame / 90) % 4], fr = f[d][Math.floor(Game.frame / 15) % 4];
  const sc = small ? 1.5 : 2; x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(X + 8 * sc, Y + 21 * sc, 6 * sc, 2 * sc, 0, 0, 7); x.fill();
  x.drawImage(fr, 0, 0, 16, 22, X, Y, 16 * sc, 22 * sc);
}
