/* ===================== v12.20 戰鬥中看得到副手（玩家 2026-10-05：「雙持武器或盾牌 戰鬥中也要顯示」） =====================
   戰鬥用的是紙娃娃（背面）：原本只畫右手的武器和左手的盾，雙刀・雙劍的左手、雙盾的右手那面都沒畫。
   · 雙刀・雙劍：把右手武器的那幾點左右翻過來，拿在左手（畫在身體後面一點）。
   · 雙盾：右手也拿一面盾（側面圖翻過來）。 */
{ const _hb = heroBattleImgLook, cache = {}, PAD = 12 * 3;
  heroBattleImgLook = function (frame, L) {
    if (!L || !(L.owpn || L.mshd)) return _hb(frame, L);
    const key = frame + lookKey(L); if (cache[key]) return cache[key];
    let c;
    if (L.owpn) { const L0 = { ...L, owpn: undefined, skey: undefined, mshd: undefined }, base = _hb(frame, L0), bare = _hb(frame, { ...L0, weapon: null });
      // the right-hand weapon alone: what differs between the doll with and without it
      const w = base.width, h = base.height, wo = mkCanvas(w, h), wx = wo.getContext('2d'), A = base.getContext('2d').getImageData(0, 0, w, h), B = bare.getContext('2d').getImageData(0, 0, w, h), O = wx.createImageData(w, h);
      for (let i = 0; i < A.data.length; i += 4) { const same = A.data[i] === B.data[i] && A.data[i + 1] === B.data[i + 1] && A.data[i + 2] === B.data[i + 2] && A.data[i + 3] === B.data[i + 3]; if (!same && A.data[i + 3]) for (let k = 0; k < 4; k++) O.data[i + k] = A.data[i + k]; }
      wx.putImageData(O, 0, 0);
      c = mkCanvas(w + PAD, h); const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      // mirrored onto the left hand (doll x 13→2), behind the body, then the doll with its right-hand weapon on top
      x.save(); x.translate(PAD + 48, 0); x.scale(-1, 1); x.drawImage(wo, 0, 0); x.restore(); x.drawImage(base, PAD, 0); c.padL = PAD; }
    else { // 雙盾: the right-hand shield is the left-hand one mirrored across the doll's middle, pixel for pixel (v281: 「雙盾兩隻手長得不一樣」)
      const Lb = { ...L, mshd: undefined }, base = _hb(frame, Lb), pad = base.padL || 0, bare = _hb(frame, { ...Lb, skey: undefined }), w = base.width, h = base.height;
      const A = base.getContext('2d').getImageData(0, 0, w, h).data, B = bare.getContext('2d').getImageData(0, 0, bare.width, h).data;
      let x0 = 1e9, x1 = -1; for (let y = 0; y < h; y++) for (let xx = 0; xx < bare.width; xx++) if (B[(y * bare.width + xx) * 4 + 3]) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); }
      const S = x0 + x1 + 2 * pad, pts = []; let wmax = w;
      for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) { const i = (y * w + X) * 4; if (!A[i + 3]) continue; const bx = X - pad, j = (y * bare.width + bx) * 4, same = bx >= 0 && bx < bare.width && B[j] === A[i] && B[j + 1] === A[i + 1] && B[j + 2] === A[i + 2] && B[j + 3] === A[i + 3];
        if (!same) { const Xm = S - X; pts.push([Xm, y, A[i], A[i + 1], A[i + 2], A[i + 3]]); wmax = Math.max(wmax, Xm + 1); } }
      c = mkCanvas(wmax, h); const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0);
      const D = x.getImageData(0, 0, wmax, h); for (const [X, y, r, g, b2, a] of pts) { if (X < 0) continue; const k = (y * wmax + X) * 4; D.data[k] = r; D.data[k + 1] = g; D.data[k + 2] = b2; D.data[k + 3] = a; } x.putImageData(D, 0, 0);
      c.padL = pad; }
    return (cache[key] = c); }; }
