/* ===================== v24.4 unique weapon sprites (Codex task L: art/battle/weapons/KEY.png) =====================
   Player request: every weapon gets its own pixel look, used on the hero and in the loot showcase, at the right size.
   Each sprite is 16×22 and is pasted onto the 28×24 battle doll at (12,1); the hand / grip anchor is sprite pixel (2,17).
   The same sprite is shown alone at 2× when a weapon drops (the doll is also shown at 2× in battle, so both read the same size).
   The field walking doll keeps its small strapped weapon (field art stays unchanged). Weapons without a sprite keep the old shapes. */
const WEAPON_PX = {};
for (const k in (typeof WEAPON_PX_SRC !== 'undefined' ? WEAPON_PX_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = WEAPON_PX_SRC[k]; WEAPON_PX[k] = im; }
const weaponPx = k => (k && WEAPON_PX[k] && WEAPON_PX[k].ok) ? WEAPON_PX[k] : null;
// the look carries the weapon's gear key so the doll can find its sprite
{ const _hl = heroLookOf; heroLookOf = function (st = Game.st, over = {}) {
    const L = _hl(st, over), eq = { ...(st.equip || {}), ...over }, g = gearBy(eq.weapon, st);
    if (g && L.weapon && WEAPON_PX[g.b]) L.wkey = g.b; return L;
  };
}
{ const _hb = heroBattleImgLook, cache = {}; heroBattleImgLook = function (frame, L) {
    const im = L && weaponPx(L.wkey); if (!im) return _hb(frame, L);
    const key = frame + lookKey(L); if (cache[key]) return cache[key];
    const base = _hb(frame, { ...L, weapon: null, wkey: undefined }), c = mkCanvas(base.width, base.height), x = c.getContext('2d');
    x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0); x.drawImage(im, 12 * 3, 1 * 3, im.width * 3, im.height * 3);
    return cache[key] = c;
  };
}
// loot showcase: a weapon with its own sprite is shown by itself (2×), centred on its pixels
{ const _li = lootIcon; lootIcon = function (g) { const im = GEAR[g.b] && GEAR[g.b].slot === 'weapon' ? weaponPx(g.b) : null; return im ? { wpn: im } : _li(g); }; }
function drawWeaponIcon(x, im, cx, cy, sc = 2) {
  if (!im.bb) { const c = mkCanvas(im.width, im.height), cx2 = c.getContext('2d'); cx2.drawImage(im, 0, 0); const d = cx2.getImageData(0, 0, im.width, im.height).data; let x0 = 99, y0 = 99, x1 = -1, y1 = -1;
    for (let y = 0; y < im.height; y++) for (let xx = 0; xx < im.width; xx++) if (d[(y * im.width + xx) * 4 + 3]) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    im.bb = x1 < 0 ? [0, 0, im.width - 1, im.height - 1] : [x0, y0, x1, y1]; }
  const [x0, y0, x1, y1] = im.bb, w = x1 - x0 + 1, h = y1 - y0 + 1; x.imageSmoothingEnabled = false;
  x.drawImage(im, x0, y0, w, h, Math.round(cx - w * sc / 2), Math.round(cy - h * sc / 2), w * sc, h * sc);
}
