/* ===================== v10.4 Codex task U: fist gloves, orb / enchant-stone icons, new portraits =====================
   1) Fist weapons (拳套) are worn as a PAIR of gloves (player request): Codex draws the right glove (7×9, hand = glove pixel
      (4,4)); the game pastes it on the right hand at doll (9,13) and a mirrored copy on the left hand at doll (0,13).
      The stepping frame (frame 1) of the back-view doll is 1 px higher, so the gloves follow it.
      Menus and the loot showcase show the pair side by side.
   2) Item icons (12×12): skill orbs by category, enchant stones by element (上級 = cut and glowing).
   3) Portraits for the five v10.3 story characters and the corridor warden. */
const GLOVE_PX = {};
for (const k in (typeof GLOVE_PX_ROWS !== 'undefined' ? GLOVE_PX_ROWS : {})) {
  const [cols, rows] = GLOVE_PX_ROWS[k], pal = {}; cols.forEach((h, i) => pal['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = h);
  const R = spriteFrom(rows, pal), Lf = flipCanvas(R), pair = mkCanvas(R.width * 2 + 2, R.height), x = pair.getContext('2d');
  x.drawImage(Lf, 0, 0); x.drawImage(R, R.width + 2, 0); pair.ok = true; pair.glove = { R, L: Lf };
  GLOVE_PX[k] = pair; WEAPON_PX[k] = pair; // menus / loot showcase: the pair
}
{ const _hl = heroLookOf; heroLookOf = function (st = Game.st, over = {}) {
    const L = _hl(st, over), eq = { ...(st.equip || {}), ...over }, g = gearBy(eq.weapon, st);
    if (g && L.weapon && GLOVE_PX[g.b]) L.wkey = g.b; return L; }; }
{ const _hb = heroBattleImgLook, cache = {}; heroBattleImgLook = function (frame, L) {
    const P = L && L.wkey && GLOVE_PX[L.wkey]; if (!P) return _hb(frame, L);
    const key = frame + lookKey(L); if (cache[key]) return cache[key];
    const base = _hb(frame, { ...L, weapon: null, wkey: undefined }), c = mkCanvas(base.width, base.height), x = c.getContext('2d'), dy = frame ? -1 : 0;
    x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0);
    const { R, L: Lf } = P.glove; x.drawImage(R, 9 * 3, (13 + dy) * 3, R.width * 3, R.height * 3); x.drawImage(Lf, 0, (13 + dy) * 3, Lf.width * 3, Lf.height * 3);
    return cache[key] = c; }; }

/* ---------- item icons ---------- */
const ITEM_ICON = {};
for (const k in (typeof ICON_U_ROWS !== 'undefined' ? ICON_U_ROWS : {})) {
  const [cols, rows] = ICON_U_ROWS[k], pal = {}; cols.forEach((h, i) => pal['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]] = h); ITEM_ICON[k] = spriteFrom(rows, pal);
}
const ORB_ICON_EL = { 火: 'orb_fire', 水: 'orb_water', 雷: 'orb_bolt', 草: 'orb_leaf' };
function orbIconKey(k) {
  if (ORB_P[k]) return 'orb_passive'; const m = MOVES['o_' + k]; if (!m) return null;
  if (m.cat === '變') return 'orb_support'; return ORB_ICON_EL[m.t] || (m.cat === '特' ? 'orb_magic' : 'orb_phys');
}
function orbIcon(k) { const ik = orbIconKey(k); return (ik && ITEM_ICON[ik]) || null; }

/* ---------- portraits: the v10.3 story characters share a field look but get their own face ---------- */
Object.assign(PORTRAIT_NAME, { 畫家艾琳: 'painter', 艾琳: 'painter', 老礦工巴爾: 'oldBarr', 巴爾: 'oldBarr', 露比: 'ruby', 小風: 'kiteKid', 老兵杜克: 'oldDuke', 杜克: 'oldDuke' });

/* ---------- v10.4.1 portraits from Codex's original large images (player: 「原始大圖直接拿來用」) ----------
   The 32×32 portraits were shrunk with nearest-neighbour and looked speckled (some faces read as scary). The originals are
   embedded at 288×288 (tools/portrait_hd.py) and drawn into the 48-unit portrait frame (v27f), so on a phone (scale 6)
   every pixel of the original shows (smaller scales shrink it smoothly; the contrast boost is only for the 32×32 fallback). They are decoded the first time a character speaks. */
const PORTRAIT_HD = {};
function portraitHD(k) {
  if (k in PORTRAIT_HD) return PORTRAIT_HD[k]; const R = typeof PORTRAIT_HD_ROWS !== 'undefined' && PORTRAIT_HD_ROWS[k]; if (!R) return (PORTRAIT_HD[k] = null);
  const [w, h, cols, rows] = R, c = mkCanvas(w, h), x = c.getContext('2d'), CH = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  rows.forEach((r, y) => { let X = 0; for (const [, n, ch] of r.matchAll(/(\d*)(.)/g)) { const len = n ? +n : 1; if (ch !== '.') { x.fillStyle = cols[CH.indexOf(ch)]; x.fillRect(X, y, len, 1); } X += len; } });
  c.hd = 1; return (PORTRAIT_HD[k] = c);
}
{ const KEY = new Map(Object.entries(PORTRAIT_ART).map(([k, c]) => [c, k])), _po = portraitOf;
  portraitOf = function (w) { const im = _po(w), k = im && KEY.get(im); return (k && portraitHD(k)) || im; }; }
{ const _ds = drawSpeaker, BLANK = mkCanvas(32, 32);
  drawSpeaker = function (x, tb) {
    const s = tb.spk, im = s && s.img; if (!im || !im.hd || tb.y < 60) return _ds(x, tb);
    s.img = BLANK; try { _ds(x, tb); } finally { s.img = im; }
    const px = tb.x + 2, P = 48; x.save(); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(im, px + 3, tb.y - P - 2, P, P); x.restore();
  }; }
