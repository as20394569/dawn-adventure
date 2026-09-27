/* ===================== v20.7 monster portraits follow the battle look (playtest: the elite card still showed the old art) =====================
   With 怪物造型 = Q版 (default) the elite / boss encounter card and the bestiary picture use the same chibi as the battle
   (idle frame 1, trimmed to its pixels, drawn on the pixel grid); with 寫實 the old realistic strip is kept. */
const CHIBI_PORT = {};
function chibiPortrait(sp) {
  if (typeof chibiOn !== 'function' || !chibiOn() || !chibiBase(sp)) return null; if (CHIBI_PORT[sp]) return CHIBI_PORT[sp];
  const im = chibiImage(sp), M = BATTLE_PXC_META[chibiBase(sp)]; if (!im || (im.ok === false) || !M) return null;
  const f = M.frames.idle[0], t = mkCanvas(M.w, M.h), tx = t.getContext('2d'); tx.drawImage(im, f * M.w, 0, M.w, M.h, 0, 0, M.w, M.h);
  const d = tx.getImageData(0, 0, M.w, M.h).data; let x0 = M.w, x1 = -1, y0 = M.h, y1 = -1;
  for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) if (d[(y * M.w + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null; const c = mkCanvas(x1 - x0 + 1, y1 - y0 + 1); c.getContext('2d').drawImage(t, x0, y0, c.width, c.height, 0, 0, c.width, c.height); c.chibi = true;
  return CHIBI_PORT[sp] = c;
}
{ const _bp = battlePortrait; battlePortrait = function (sp) { return chibiPortrait(sp) || _bp(sp); }; }
encounterCard = function (sp, lv, key, kind, extra) { // same card, the picture area grows with the chibi (max 80px, so the 迎戰/撤退 menu stays clear)
  const pic = battlePortrait(sp), stars = dangerStars(lv), hint = lootHint(key, sp);
  const s = pic ? Math.min(1, 80 / pic.height, 120 / pic.width) : 1, PH = pic ? clamp(Math.round(pic.height * s), 56, 80) : 70;
  return { draw(x) {
    const X = 8, Y = 18, w = W - 16, h = PH + 55; drawPanel(x, X, Y, w, h, kind === 'boss' ? '#ff6b7a' : '#ffc46b');
    Font.drawC(x, (kind === 'boss' ? '頭目' : '菁英魔物') + (extra ? '・' + extra : ''), W / 2, Y + 3, kind === 'boss' ? '#ff9aa4' : '#ffd890', UIC.textSh, 9);
    if (pic) { const pw = Math.round(pic.width * s), ph = Math.round(pic.height * s), fy = Y + 15 + PH; x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(W / 2, fy - 1, Math.max(10, pw * 0.36), 3, 0, 0, 7); x.fill();
      x.imageSmoothingEnabled = false; x.drawImage(pic, Math.round(W / 2 - pw / 2), fy - ph, pw, ph); }
    Font.drawC(x, SPECIES[sp].n + '　Lv' + lv, W / 2, Y + PH + 16, UIC.text, UIC.textSh, 11);
    let st = ''; for (let i = 0; i < 5; i++) st += i < stars ? '★' : '☆'; Font.drawC(x, '危險度 ' + st, W / 2, Y + PH + 29, stars >= 4 ? '#ff7a7a' : stars === 3 ? '#ffd070' : '#9ad890', UIC.textSh, 9);
    if (hint) { let z = 8; while (z > 7 && Font.width(hint, z) > w - 8) z--; const hs = Font.width(hint, z) > w - 8 ? hint.slice(0, 23) + '…' : hint; Font.drawC(x, hs, W / 2, Y + PH + 40, '#c8b0ff', UIC.textSh, z); }
  } };
};
function dexPortrait(sp) { return chibiPortrait(sp); }
// the bats' ART is still the bird vector: once their own chibi exists, their small icons (bestiary list etc.) come from it too
{ const BATS = ['mineBat', 'caveBat', 'crystalBat']; const _mm = monsterMini; monsterMini = function (sp, size) {
    if (!BATS.includes(sp) || typeof chibiOwn !== 'function' || !chibiOwn(sp)) return _mm(sp, size);
    const k = 'cb' + sp + size; if (miniCache[k]) return miniCache[k]; const pic = chibiPortrait(sp) || (() => { const M = BATTLE_PXC_META[sp], t = mkCanvas(M.w, M.h); t.getContext('2d').drawImage(BATTLE_PXC[sp], 0, 0, M.w, M.h, 0, 0, M.w, M.h); return t; })();
    const s = size / Math.max(pic.width, pic.height), c = mkCanvas(size, size), x = c.getContext('2d'); x.imageSmoothingEnabled = size < 24;
    x.drawImage(pic, Math.round((size - pic.width * s) / 2), Math.round(size - pic.height * s), Math.round(pic.width * s), Math.round(pic.height * s)); return miniCache[k] = { c, flip: flipCanvas(c) };
  };
}
