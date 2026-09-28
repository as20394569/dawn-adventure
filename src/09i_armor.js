/* ===================== v24.5 unique armour looks + item icons (Codex task M: art/battle/armor) =====================
   Player request: every piece of gear gets its own pixel look, used on the hero and in the loot showcase, at the right size.
   - KEY_back  (16×22): back-view overlay for the battle doll, aligned to doll frame 0; head / body overlays are reused 1 px higher for frame 1,
     feet have their own frame-1 overlay KEY_back2. Order: base doll → feet → body → head → weapon.
   - KEY_icon  (16×16): the item alone, shown at 2× in the loot showcase and the equipment picker (accessories too).
   The field walking doll keeps its current look (field art stays unchanged). Items without art keep the old recolour. */
const ARMOR_PX = {};
for (const k in (typeof ARMOR_PX_SRC !== 'undefined' ? ARMOR_PX_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = ARMOR_PX_SRC[k]; ARMOR_PX[k] = im; }
const armorPx = k => (ARMOR_PX[k] && ARMOR_PX[k].ok) ? ARMOR_PX[k] : null;
const armorIcon = k => armorPx(k + '_icon');
const ARMOR_BASE = { head: null, body: 'uniform', feet: 'school' };
{ const _hl = heroLookOf; heroLookOf = function (st = Game.st, over = {}) {
    const L = _hl(st, over), eq = { ...(st.equip || {}), ...over };
    for (const [sl, kk] of [['head', 'hkey'], ['body', 'bkey'], ['feet', 'fkey']]) { const g = gearBy(eq[sl], st); if (g && L[sl] && ARMOR_PX[g.b + '_back']) L[kk] = g.b; }
    return L;
  };
}
{ const _hb = heroBattleImgLook, cache = {}; heroBattleImgLook = function (frame, L) {
    if (!L || !((L.hkey && armorPx(L.hkey + '_back')) || (L.bkey && armorPx(L.bkey + '_back')) || (L.fkey && armorPx(L.fkey + '_back')))) return _hb(frame, L);
    const key = frame + lookKey(L); if (cache[key]) return cache[key];
    const B = { ...L, hkey: undefined, bkey: undefined, fkey: undefined };
    if (L.hkey && armorPx(L.hkey + '_back')) B.head = ARMOR_BASE.head; if (L.bkey && armorPx(L.bkey + '_back')) B.body = ARMOR_BASE.body; if (L.fkey && armorPx(L.fkey + '_back')) B.feet = ARMOR_BASE.feet;
    const bare = _hb(frame, { ...B, weapon: null, wkey: undefined }), armed = (L.weapon ? _hb(frame, B) : null), c = mkCanvas(bare.width, bare.height), x = c.getContext('2d');
    x.imageSmoothingEnabled = false; x.drawImage(bare, 0, 0);
    const put = (im, dy) => { if (im) x.drawImage(im, 0, dy * 3, im.width * 3, im.height * 3); };
    if (L.fkey) put(armorPx(L.fkey + (frame ? '_back2' : '_back')) || armorPx(L.fkey + '_back'), 1);
    if (L.bkey) put(armorPx(L.bkey + '_back'), 1 - frame);
    if (L.hkey) put(armorPx(L.hkey + '_back'), 1 - frame);
    if (armed) { // the weapon layer = the pixels the weapon changed on the bare doll, painted back on top of the armour
      const w = c.width, h = c.height, a = armed.getContext('2d').getImageData(0, 0, w, h), b = bare.getContext('2d').getImageData(0, 0, w, h), o = x.getImageData(0, 0, w, h);
      for (let i = 0; i < a.data.length; i += 4) if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2] || a.data[i + 3] !== b.data[i + 3]) { o.data[i] = a.data[i]; o.data[i + 1] = a.data[i + 1]; o.data[i + 2] = a.data[i + 2]; o.data[i + 3] = a.data[i + 3]; }
      x.putImageData(o, 0, 0);
    }
    return cache[key] = c;
  };
}
// loot showcase: armour / accessories with an icon are shown by themselves at 2× (same as weapons)
{ const _li = lootIcon; lootIcon = function (g) { const B = GEAR[g.b]; const im = B && B.slot !== 'weapon' ? armorIcon(g.b) : null; return im ? { wpn: im } : _li(g); }; }
