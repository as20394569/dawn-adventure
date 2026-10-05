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
    else { const base = _hb(frame, { ...L, mshd: undefined }), pad = base.padL || 0, im = (typeof shieldSide === 'function' && shieldSide(L.mshd)) || shieldSprite(L.mshd);
      c = mkCanvas(base.width + 9, base.height); const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0);
      if (im) { const X = pad + 12 * 3, Y = (11 - (frame ? 1 : 0)) * 3; x.save(); x.translate(X + im.width * 3, Y); x.scale(-1, 1); x.drawImage(im, 0, 0, im.width * 3, im.height * 3); x.restore(); }
      c.padL = pad; }
    return (cache[key] = c); }; }
