/* ===================== v12.103 防禦的新特效（照武器） =====================
   玩家 2026-10-10：「我注意到 防禦的特效還是用舊的」→ 選「防禦」時的畫面（原本是三圈淡藍的圈＋盾牌圖示）換成新的，照拿的武器做：
     劍＝劍豎在身前（白色的劍光一亮）　雙劍＝兩把劍交成 X（一白一黑）　短刀＝刀反握在身前、左右留下殘影（紫黑）　雙刀＝兩把刀交叉（藍黑）＋殘影
     長槍＝槍在身前轉成輪子　斧＝斧頭橫在身前（熔岩光）　拳套＝雙臂交叉（金色的兩道氣）　法杖＝身前立起一面魔法陣
     雙盾・單手盾＝盾面舉在身前＋六角護壁
   共同：腳下一圈波紋、身前一層淡淡的六角護壁、短短的金屬響。防禦中被打到時，身前同樣的形狀再亮一下、火花往外迸（傷害減半的那一下）。
   先只在特效測試版（GD25.live）；玩家看過說好才放進正式版。 */
const GD25 = { live: typeof fxtest13 === 'function' && fxtest13() };
GD25.kind = () => { const k = DG17.kind(); if (k !== '雙盾' && typeof SH24 !== 'undefined' && SH24.hasShield() && !['雙劍', '雙刀'].includes(k)) return '單手盾'; return k; };
GD25.foesC = b => { const L = DG17.foes(b); if (!L.length) return null; const C = L.map(v => b.center(v)); return { x: C.reduce((a, c) => a + c.x, 0) / C.length, y: C.reduce((a, c) => a + c.y, 0) / C.length }; };
GD25.front = b => { const H = DS16.hands(b).Hc, F = GD25.foesC(b), d = F ? Math.atan2(F.y - H.y, F.x - H.x) : -Math.PI / 2; return { x: H.x + Math.cos(d) * 14, y: H.y - 12 + Math.sin(d) * 6, d }; };
GD25.pal = k => ({ 劍: HD15.P.white, 雙劍: HD15.P.white, 短刀: HD15.P.shade, 雙刀: HD15.P.dblue, 長槍: HD15.P.lance, 斧: HD15.P.lava, 拳套: HD15.P.ki, 法杖: HD15.P.arcane, 雙盾: HD15.P.holy, 單手盾: HD15.P.silver })[k] || HD15.P.white;
// 武器的架勢（s＝大小，hit＝被打到時的短版）
GD25.pose = (b, k, C, s = 1, hit = 0) => { const P = GD25.pal(k), du = hit ? 14 : 30;
  switch (k) {
    case '劍': HD15.cut(b, C, Math.PI / 2, 30 * s, P, { dur: du, w: 6, gap: 0.01 }); HD15.flare(b, { x: C.x, y: C.y - 14 * s }, P, 40 * s, { rot: 0, dur: du * 0.6, x8: 1 }); break;
    case '雙劍': HD15.cut(b, C, Math.PI / 4, 30 * s, HD15.P.white, { dur: du, w: 6, gap: 0.01 }); HD15.cut(b, C, -Math.PI / 4, 30 * s, HD15.P.black, { dur: du, w: 6, gap: 0.01 }); HD15.flare(b, C, HD15.P.white, 40 * s, { rot: 0, dur: du * 0.6, x8: 1 }); break;
    case '短刀': case '雙刀': { const [Pu, Bk] = [P, HD15.P.black]; HD15.cut(b, C, Math.PI / 3, 22 * s, Pu, { dur: du, w: 5, gap: 0.01 }); if (k === '雙刀') HD15.cut(b, C, -Math.PI / 3, 22 * s, Bk, { dur: du, w: 5, gap: 0.01 });
      if (!hit && typeof K13 !== 'undefined' && K13.ghost) { const gc = k === '雙刀' ? ['#7fb0ff', '#1a2440'] : ['#b080ff', '#2a1838']; K13.ghost(b, -10, 0, gc[0], 16, 0.45); K13.ghost(b, 10, 0, gc[1], 16, 0.45); } break; }
    case '長槍': HD15.whirl(b, C, P, { r: 22 * s, th: 6, fl: 0.95, turns: hit ? 0.8 : 1.6, trail: 4, dur: du, spark: 1 }); HD15.whirl(b, C, HD15.P.white, { r: 19 * s, th: 2.4, fl: 0.95, turns: hit ? 0.8 : 1.6, trail: 3.4, dur: du - 2, delay: 1 }); break;
    case '斧': AX21.cleave(b, C, 'h', { r: 18 * s, th: 10, dur: du, sw: 4 }); HD15.sparks(b, C, 8, P, { spd: 2, life: 18, g: 0.12 }); break;
    case '拳套': for (const sg of [-1, 1]) HD15.thrust(b, { x: C.x + sg * 16 * s, y: C.y + 14 * s }, { x: C.x - sg * 12 * s, y: C.y - 12 * s }, P, { w: 7, ext: 2, dur: du }); HD15.flash(b, C, P, 26 * s, { dur: du * 0.6 }); break;
    case '法杖': ST23.circle(b, C, 20 * s, P, { fl: 1, hold: hit ? 8 : 24, spin: 0.08 }); break;
    case '雙盾': case '單手盾': SH24.plate(b, C, P, { s: 1.3 * s, dur: du + 6, hold: 0.7, shine: !hit }); break;
    default: HD15.cut(b, C, Math.PI / 2, 26 * s, P, { dur: du, w: 5, gap: 0.01 }); } };
// 選「防禦」：主角腳下一圈波紋，身前擺出武器的架勢，一層淡淡的六角護壁，短短的金屬響
GD25.guard = function* (b) { const k = GD25.kind(), P = GD25.pal(k), H = DS16.hands(b), C = GD25.front(b), G = { x: H.Hc.x, y: HDW_FOOT() - 2 };
  Sound.sfx('shGuard'); b.hd15cast = 1; HD15.ring(b, G, P, 6, 38, { fl: 0.3, w: 1.8, dur: 22 }); GD25.pose(b, k, C, 1); yield* wait(6);
  if (typeof SP20 !== 'undefined') SP20.hex(b, C, 30, P, { hold: 18, fl: 1, fade: 1 }); HD15.flash(b, C, P, 34, { dur: 14 }); yield* wait(22); };
{ const _g = FX.guard; FX.guard = function* (U, ...a) { if (!(GD25.live && HD15.on && this.H && U && Math.abs(U.x - this.center(this.H).x) < 4 && Math.abs(U.y - this.center(this.H).y) < 4)) return yield* _g.call(this, U, ...a); yield* GD25.guard(this); }; }
// 防禦中被打到：身前同樣的架勢再亮一下、六角護壁一閃、火花往外迸
{ const H = Battle.prototype.handlers, _dm = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (GD25.live && HD15.on && t && t.hero && t.st && t.st.guard && s && !s.hero && P && P.kind !== 'dot' && (P.amount || 0) > 0) { const k = GD25.kind(), Pl = GD25.pal(k), C = GD25.front(this);
      GD25.pose(this, k, C, 1.1, 1); if (typeof SP20 !== 'undefined') SP20.hex(this, C, 26, Pl, { hold: 6, fl: 1, fade: 1 }); HD15.sparks(this, C, 10, k === '法杖' ? Pl : HD15.P.gold, { spd: 3, life: 16, g: 0.1 }); Sound.sfx('shGuard'); }
    return yield* _dm.call(this, e, s, t, P); }; }
