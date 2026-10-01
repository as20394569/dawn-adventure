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
// Field weapons are generated as pixel paths (so each shape reads clearly at 16px): [x, y, colorKey]
function weaponPath(type, dir) {
  const P = [], line = (x0, y0, x1, y1, c, c2) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let t = 0; t <= n; t++) { const x = Math.round(x0 + (x1 - x0) * t / n), y = Math.round(y0 + (y1 - y0) * t / n); P.push([x, y, c]); if (c2) P.push([x + 1, y, c2]); } };
  if (type === 'sword') {
    if (dir === 'down') { P.push([15, 3, 'T'], [15, 4, 'T'], [14, 5, 'U'], [15, 5, 'U'], [13, 5, 'U']); line(14, 6, 1, 19, 'I', 'i'); }
    if (dir === 'up') { P.push([15, 6, 'T'], [14, 7, 'T'], [13, 7, 'U'], [14, 8, 'U'], [15, 8, 'U']); line(13, 9, 3, 19, 'I', 'i'); } // v12.0.1: as long as the front / side sword
    if (dir === 'left') { P.push([13, 6, 'T'], [13, 7, 'T'], [12, 8, 'U'], [13, 8, 'U'], [14, 8, 'U']); line(13, 9, 13, 20, 'I', 'i'); }
  }
  if (type === 'axe') {
    if (dir === 'down') { line(15, 4, 3, 19, 'T'); P.push([13, 3, 'I'], [14, 3, 'I'], [15, 2, 'I'], [14, 2, 'i'], [13, 4, 'i'], [12, 4, 'I']); }
    if (dir === 'up') { line(13, 5, 4, 18, 'T'); P.push([13, 3, 'I'], [14, 3, 'I'], [14, 4, 'i'], [15, 4, 'I'], [12, 4, 'i'], [15, 3, 'i']); } // v12.0.1: as long as the front / side axe
    if (dir === 'left') { line(13, 6, 13, 19, 'T'); P.push([12, 5, 'I'], [13, 4, 'I'], [14, 4, 'i'], [14, 5, 'I'], [12, 4, 'i']); }
  }
  if (type === 'staff') {
    const x = dir === 'down' ? 15 : dir === 'up' ? 11 : 13; line(x, 4, x, 20, 'T'); P.push([x, 2, 'V'], [x, 3, 'V'], [x - 1, 3, 'V'], [x - 1, 2, 'W'], [x - 1, 4, 'k'], [x - 1, 1, 'k'], [x, 1, 'k']);
  }
  if (type === 'tome') { // a book held at the hip: cover T, clasp U, pages V
    const [bx, by] = dir === 'down' ? [12, 15] : dir === 'up' ? [1, 15] : [10, 15];
    P.push([bx, by, 'T'], [bx + 1, by, 'U'], [bx + 2, by, 'T'], [bx, by + 1, 'T'], [bx + 1, by + 1, 'V'], [bx + 2, by + 1, 'T'], [bx, by + 2, 'T'], [bx + 1, by + 2, 'T'], [bx + 2, by + 2, 'T']);
  }
  if (type === 'dagger') {
    if (dir === 'down') { P.push([13, 16, 'T'], [13, 17, 'U'], [14, 17, 'I'], [14, 18, 'i']); }
    if (dir === 'up') { P.push([3, 16, 'T'], [3, 17, 'U'], [2, 17, 'I'], [2, 18, 'i']); }
    if (dir === 'left') { P.push([11, 15, 'T'], [11, 16, 'U'], [12, 16, 'I'], [12, 17, 'i']); }
  }
  return P;
}
const WEAPON_FRONT_UP = new Set(['sword', 'axe', 'staff']); // strapped over the back → visible on top in the back view
// palettes
const HEAD_PAL = {
  cloth: { A: '#8a6a4a', a: '#5a4430', C: '#b08a60' }, hunter: { A: '#4a7a3a', a: '#2e5226', C: '#6a9a50', E: '#f0e8d8' }, bronze: { A: '#b08040', a: '#7a5424', C: '#e8bc68' },
  steel: { A: '#a8b0c0', a: '#6a7488', C: '#eef0f6' }, stone: { A: '#8a8070', a: '#5a5244', C: '#b8b098' }, bone: { A: '#e0d8c0', a: '#a89e84', C: '#fff8e8' },
  miner: { A: '#e0b030', a: '#a07818', C: '#fff0a0', E: '#fffbe0' }, bandit: { A: '#6a2a24', a: '#401814', C: '#8a3a30' },
};
// Body armour changes the SHAPE of the torso (isekai gear, not a recoloured school uniform).
// Letters: X main · x shade · Y light/pauldron · y pauldron shade · Z trim/belt · z buckle · W inner · D/d cape
const BODY_SHAPES = {
  tunic: {
    down: ['..kkXXWWWWXXkk..', '.kXkYXXWWXXXkXk.', '.kXkYXXXXXXXkXk.', '.kSkZZZzZZZZkSk.', '..kkxXXXXXXxkk..'],
    up: ['..kkXXXXXXXXkk..', '.kXkXXXXXXXXkXk.', '.kXkXxXXXXxXkXk.', '.kSkZZZZZZZZkSk.', '..kkxXXXXXXxkk..'],
    left: ['...kkWXXXkk.....', '...kXXXYXk......', '...kSXXYXk......', '...kZZzZZk......', '....kxXXxk......'],
  },
  mail: {
    down: ['.kYYYkXxXxkYYYk.', '.kyYykxXxXkyYyk.', '..kXkXxXxXxkXk..', '.kSkZZZzzZZZkSk.', '..kkXxXxXxXxkk..'],
    up: ['.kYYYkXXXXkYYYk.', '.kyYykXxXxkyYyk.', '..kXkxXxXxXkXk..', '.kSkZZZZZZZZkSk.', '..kkXxXxXxXxkk..'],
    left: ['...kkYYYYk......', '...kyYYYyk......', '...kSXxXXk......', '...kZZzZZk......', '....kXxXxk......'],
    legs: ['...kXxXkkXxXk...'],
  },
  plate: {
    down: ['.kYYYkXXXXkYYYk.', 'kYYYYkXZZXkYYYYk', '.kyykXXZZXXkyyk.', '.kSkxXXXXXXxkSk.', '..kkZxXXXXxZkk..'],
    up: ['.kYYYkXXXXkYYYk.', 'kYYYYkXXXXkYYYYk', '.kyykXXXXXXkyyk.', '.kSkxXXXXXXxkSk.', '..kkZxXXXXxZkk..'],
    left: ['..kYYYYYYk......', '..kyYYYYyk......', '...kSXZXXk......', '...kxXXXXk......', '....kZXXZk......'],
    legs: ['...kYxYkkYxYk...'],
  },
  robe: {
    down: ['..kkXWWZZWWXkk..', '.kXXkXXZZXXkXXk.', '.kXXkXXZZXXkXXk.', '.kSXkXXZZXXkXSk.', '..kkXXXZZXXXkk..'],
    up: ['..kkXXXXXXXXkk..', '.kXXkXXXXXXkXXk.', '.kXXkXXXXXXkXXk.', '.kSXkXXXXXXkXSk.', '..kkXXXXXXXXkk..'],
    left: ['...kkWXXXkk.....', '...kXXXXXXk.....', '...kSXXXXXk.....', '...kXXZXXXk.....', '...kXXZXXXk.....'],
    robe: true,
  },
  cloak: {
    down: ['.kkkXXWWWWXXkkk.', 'kDkXkYXWWXXkXkDk', 'kDkXkYXXXXXkXkDk', 'kdkSkZZzZZZkSkdk', '.kkkkxXXXXxkkkk.'],
    up: ['..kkZDDDDDDZkk..', '.kXkDDDDDDDDkXk.', '.kXkDDdDDdDDkXk.', '.kSkDDDDDDDDkSk.', '..kkDDDDDDDDkk..'],
    left: ['...kkWXXXkDk....', '...kXXXYXkDDk...', '...kSXXYXkDDk...', '...kZZzZZkDdk...', '....kxXXxkDDk...'],
    cape: { up: ['...kDDdDDdDDk...', '...kdDDDDDDdk...'], left: ['..........kDk...', '..........kdk...'] },
  },
};
// robe skirts replace the legs (4 rows per pose)
const ROBE_LEGS = {
  stand: ['...kXXXZZXXXk...', '...kXXXZZXXXk...', '...kxXXZZXXxk...', '...kkBbkkbBkk...'],
  stepL: ['...kXXXZZXXXk...', '...kXXXZZXXXk...', '...kxXXZZXXxk...', '...kkBbkkkkkk...'],
  stepR: ['...kXXXZZXXXk...', '...kXXXZZXXXk...', '...kxXXZZXXxk...', '...kkkkkkbBkk...'],
  sideStand: ['...kXXZXXXk.....', '...kXXZXXXk.....', '...kxXZXXxk.....', '...kkBbkkkk.....'],
  sideStepA: ['...kXXZXXXk.....', '..kXXXZXXXXk....', '..kxXXZXXXxk....', '..kkBbkkkbBk....'],
  sideStepB: ['...kXXZXXXk.....', '...kXXZXXXk.....', '...kxXZXXxk.....', '....kkBbkk......'],
};
const BODY_LOOKS = { // [shape, palette]
  leather: ['tunic', { X: '#8a5a34', x: '#5e3a1e', Y: '#a8744a', Z: '#4a2c14', z: '#e8c048', W: '#e0d0b0' }],
  hunter: ['tunic', { X: '#4e6a34', x: '#34481e', Y: '#6a8a44', Z: '#5a3a1e', z: '#c8a048', W: '#d8c8a0' }],
  mist: ['cloak', { X: '#5a6478', x: '#3a4458', Y: '#7a88a0', Z: '#3a3040', z: '#c0c8d8', W: '#d0d8e0', D: '#8a98b0', d: '#5a6478' }],
  frog: ['cloak', { X: '#4a3a5a', x: '#2e2440', Y: '#6a5a7a', Z: '#3a2a20', z: '#c8f050', W: '#d8d0c0', D: '#7a5a9a', d: '#5a3a78' }],
  rune: ['cloak', { X: '#5a2e88', x: '#3a1c60', Y: '#7a4aa8', Z: '#d8b048', z: '#60e0ff', W: '#f0e0a0', D: '#6a3a98', d: '#d8b048' }],
  chain: ['mail', { X: '#8a94a8', x: '#5a6478', Y: '#c8d0dc', y: '#8a94a8', Z: '#4a3424', z: '#e8c048' }],
  scale: ['mail', { X: '#3a8a8a', x: '#246060', Y: '#6ac0b0', y: '#3a8a8a', Z: '#3a2a1e', z: '#e8c048' }],
  stone: ['plate', { X: '#8a7e6a', x: '#5a5244', Y: '#b0a488', y: '#7a6e5a', Z: '#d8b048' }],
  ruin: ['plate', { X: '#b09a70', x: '#7a6a48', Y: '#d8c498', y: '#9a8660', Z: '#60d0c8' }],
  boneKnight: ['plate', { X: '#3e4458', x: '#262a3a', Y: '#e0d8c0', y: '#a89e84', Z: '#a02a38' }],
  silk: ['robe', { X: '#e8e0f4', x: '#b0a8c8', Z: '#8a70c0', W: '#ffffff' }],
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
  const BL = BODY_LOOKS[L.body], shape = BL && BODY_SHAPES[BL[0]];
  const pal = { ...HERO_PAL, ...(BL ? BL[1] : {}), ...(FEET_PAL[L.feet] || {}) };
  if (L.head) Object.assign(pal, HEAD_PAL[L.head[1]] || {}); if (L.weapon) Object.assign(pal, WPN_PAL[L.weapon[1]] || {});
  pal.k = HERO_PAL.k;
  const put = (rows, y, x, c, back) => { if (y < 0 || y >= rows.length || x < 0 || x > 15) return; if (back && rows[y][x] !== '.') return; rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1); };
  const outlineW = (rows, P, off, back) => { const S = new Set(P.map(([x, y]) => x + ',' + (y + off))); for (const [x, y0, c] of P) put(rows, y0 + off, x, c, back); for (const [x, y0] of P) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y0 + off + dy; if (S.has(X + ',' + Y)) continue; if (Y >= 0 && Y < rows.length && X >= 0 && X < 16 && rows[Y][X] === '.') put(rows, Y, X, 'k'); } };
  const build = (dir, legs, bob) => {
    const out = new Array(22).fill('................'), off = bob ? -1 : 0, body = HERO_ROWS[dir].slice();
    const sdir = dir === 'right' ? 'left' : dir;
    if (shape) for (let r = 0; r < 5; r++) body[13 + r] = shape[sdir][r];
    let Lg = LEGS[legs]; if (shape && shape.robe) Lg = ROBE_LEGS[legs];
    Lg = Lg.slice(); if (shape && shape.legs && sdir !== 'left') Lg[0] = shape.legs[0];
    for (let i = 0; i < body.length; i++) if (i + off >= 0) out[i + off] = body[i];
    for (let i = 0; i < Lg.length; i++) if (18 + off + i < 22) out[18 + off + i] = Lg[i];
    if (shape && shape.cape && shape.cape[sdir]) shape.cape[sdir].forEach((r, i) => dollApply(out, { [18 + off + i]: r }, sdir === 'left'));
    const shift = ov => { const o = {}; for (const r in ov) o[+r + off] = ov[r]; return o; };
    const wt = L.weapon && L.weapon[0], front = wt && (wt === 'dagger' || wt === 'tome' || (dir === 'up' && WEAPON_FRONT_UP.has(wt)));
    if (wt && !front) outlineW(out, weaponPath(wt, sdir), off, true);
    if (L.head) { dollApply(out, shift(DOLL_HEAD[L.head[0]][sdir])); if (L.head[2]) dollApply(out, shift(DOLL_DECO[L.head[2]][sdir] || {})); }
    if (wt && front) outlineW(out, weaponPath(wt, sdir), off, false);
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
  const CW = 28, CH = 24, n = mkCanvas(CW, CH), x = n.getContext('2d'); x.drawImage(heroFramesLook({ ...L, weapon: null }).up[frame], 0, 1);
  const W0 = L.weapon; if (W0) {
    const P = WPN_PAL[W0[1]] || WPN_PAL.steel, pts = [], ln = (x0, y0, x1, y1, c) => { const m = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let t = 0; t <= m; t++) pts.push([Math.round(x0 + (x1 - x0) * t / m), Math.round(y0 + (y1 - y0) * t / m), c]); };
    // right hand ≈ (13,18)
    if (W0[0] === 'sword') { pts.push([14, 18, P.T], [15, 17, P.T], [16, 17, P.U], [15, 16, P.U], [17, 18, P.U], [14, 15, P.U]); ln(17, 16, 25, 8, P.I); ln(16, 15, 24, 7, P.i); ln(18, 16, 25, 9, P.i); pts.push([26, 7, P.I]); }
    if (W0[0] === 'dagger') { pts.push([14, 18, P.T], [15, 17, P.U], [14, 16, P.U], [16, 18, P.U]); ln(16, 16, 20, 12, P.I); ln(15, 15, 19, 11, P.i); }
    if (W0[0] === 'staff') { ln(14, 22, 21, 5, P.T); pts.push([21, 3, P.V], [22, 3, P.V], [21, 4, P.V], [22, 4, P.V], [20, 3, P.V], [23, 4, P.V], [21, 2, '#ffffff'], [22, 5, P.V]); }
    if (W0[0] === 'tome') { // open book floating above the right hand: cover, two pages, spine, text lines, sparkles
      for (let xx = 16; xx <= 26; xx++) pts.push([xx, 14, P.T]); pts.push([16, 13, P.T], [26, 13, P.T]);
      for (let xx = 17; xx <= 25; xx++) if (xx !== 21) for (let yy = (xx === 17 || xx === 25 ? 11 : 10); yy <= 13; yy++) pts.push([xx, yy, P.V]);
      for (let yy = 10; yy <= 14; yy++) pts.push([21, yy, P.T]);
      for (const [a, b] of [[18, 11], [19, 11], [18, 12], [23, 11], [24, 11], [23, 12], [24, 12]]) pts.push([a, b, '#9a92aa']);
      pts.push([21, 7, P.U], [19, 6, '#ffffff'], [24, 8, P.U], [15, 17, P.T]);
    }
    if (W0[0] === 'axe') { ln(14, 21, 21, 4, P.T); for (const [a, b, c] of [[22, 3, 'i'], [22, 4, 'I'], [23, 4, 'I'], [22, 5, 'I'], [23, 5, 'I'], [24, 5, 'I'], [22, 6, 'I'], [23, 6, 'I'], [24, 6, 'i'], [22, 7, 'I'], [23, 7, 'i'], [22, 8, 'i'], [20, 5, 'i'], [19, 5, 'i']]) pts.push([a, b, P[c]]); }
    const id = x.getImageData(0, 0, CW, CH), d = id.data, set = new Set(pts.map(([a, b]) => a + ',' + b));
    const put = (px, py, c) => { if (px < 0 || py < 0 || px >= CW || py >= CH) return; const [r, g, bb] = hex2rgb(c), k = (py * CW + px) * 4; d[k] = r; d[k + 1] = g; d[k + 2] = bb; d[k + 3] = 255; };
    for (const [px, py, c] of pts) put(px, py, c);
    for (const [px, py] of pts) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const qx = px + dx, qy = py + dy; if (qx < 0 || qy < 0 || qx >= CW || qy >= CH || set.has(qx + ',' + qy)) continue; if (d[(qy * CW + qx) * 4 + 3] === 0) put(qx, qy, '#2a2238'); }
    x.putImageData(id, 0, 0);
  }
  const big = mkCanvas(CW * 3, CH * 3), bx = big.getContext('2d'); bx.imageSmoothingEnabled = false; bx.drawImage(n, 0, 0, CW, CH, 0, 0, CW * 3, CH * 3);
  return heroBattleLookCache[key] = big;
}
// front + back preview used by the equipment screen (dir toggles every 1.5s so both sides are visible)
function dollPreview(x, L, X, Y, small) {
  const f = heroFramesLook(L), dirs = ['down', 'left', 'up', 'right'], d = dirs[Math.floor(Game.frame / 90) % 4], fr = f[d][Math.floor(Game.frame / 15) % 4];
  const sc = small ? 1.5 : 2; x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(X + 8 * sc, Y + 21 * sc, 6 * sc, 2 * sc, 0, 0, 7); x.fill();
  x.drawImage(fr, 0, 0, 16, 22, X, Y, 16 * sc, 22 * sc);
}
