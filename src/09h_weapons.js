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
/* v12.138 玩家 2026-10-12：「武器太大，角色拿起來很怪」：16×22 的武器圖原尺寸貼在 28×24 的紙娃娃上，劍跟人差不多高。
   戰鬥中手上那把照原本的像素格縮成 75%（最近點取樣，12×17 左右），握把（圖的 (2,18)）仍在手上（紙娃娃 (14,19)）；
   選單・掉落展示的武器圖照原尺寸。雙持的副手是從主手那把翻過來的，一起變小。 */
const wpnSmall19 = im => { if (im.small19) return im.small19; const k = 0.75, W0 = im.width, H0 = im.height, w = Math.round(W0 * k), h = Math.round(H0 * k), s = mkCanvas(W0, H0), sg = s.getContext('2d'); sg.drawImage(im, 0, 0);
  const d = sg.getImageData(0, 0, W0, H0).data, c = mkCanvas(w, h), g = c.getContext('2d'), o = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const sx = Math.min(W0 - 1, Math.floor((x + 0.5) / k)), sy = Math.min(H0 - 1, Math.floor((y + 0.5) / k)), i = (sy * W0 + sx) * 4, j = (y * w + x) * 4; for (let q = 0; q < 4; q++) o.data[j + q] = d[i + q]; }
  g.putImageData(o, 0, 0); return (im.small19 = c); };
{ const _hb = heroBattleImgLook, cache = {}; heroBattleImgLook = function (frame, L) {
    const im = L && weaponPx(L.wkey); if (!im) return _hb(frame, L);
    const key = frame + lookKey(L); if (cache[key]) return cache[key];
    const base = _hb(frame, { ...L, weapon: null, wkey: undefined }), c = mkCanvas(base.width, base.height), x = c.getContext('2d');
    x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0); const sm = wpnSmall19(im); x.drawImage(sm, 12 * 3, 5 * 3, sm.width * 3, sm.height * 3); /* v12.138 主角手上的武器縮成約 75%（握把照舊在手上） */
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
