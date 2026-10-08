/* ===================== v12.0.5 第五輪：畫面與可讀性（玩家在〈第五輪提案〉勾選，2026-10-03） =====================
   最小字級 8：實測 1 點 ≈ 手機上 2～2.4 pt（7 點 ≈ 15 pt、8 點 ≈ 17.5 pt）。
   比 8 小的字一律用 8 的高度畫，寬度維持原本的位置（字稍微窄一點），所以原本排好的版面不會跑掉、不會超出框。
   寬度和換行的計算照舊（用原本的字級），畫出來的寬度跟計算的一樣。
   技能一覽的職業被動改成放不下就換行（10p）；天賦頁的提示改成橫幅（10n）。對話頭像（HD）和兩套框照舊。 */
const FONT_MIN12 = 8;
{ const _d = Font.draw, _w = Font.width;
  const small = (str, size) => !Font.real && typeof size === 'number' && size < FONT_MIN12 && str !== '' && str != null; // v14.33: not in the card battle / on card faces (Font.real, 14x) — there the sizes are the real sizes
  const squeeze = (ctx, str, x0, y, col, sh, size) => { const a = _w(str, size), b = _w(str, FONT_MIN12);
    if (!(b > a) || !(a > 0)) return _d(ctx, str, x0, y, col, sh, FONT_MIN12);
    ctx.save(); ctx.translate(x0, 0); ctx.scale(a / b, 1); _d(ctx, str, 0, y, col, sh, FONT_MIN12); ctx.restore(); return x0 + a; };
  Font.draw = (ctx, str, x, y, col, sh, size) => small(str, size) ? squeeze(ctx, String(str), x, y, col, sh, size) : _d(ctx, str, x, y, col, sh, size);
  Font.drawR = (ctx, str, xr, y, col, sh, size) => Font.draw(ctx, str, xr - _w(String(str), size), y, col, sh, size);
  Font.drawC = (ctx, str, xc, y, col, sh, size) => Font.draw(ctx, str, xc - _w(String(str), size) / 2, y, col, sh, size); }
