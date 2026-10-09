/* ===================== v12.98 快速多段攻擊：主角閃身消失、留下黑影 =====================
   玩家：「有快速多段的攻擊時會是快速斬擊這類的 可以做出角色往前後消失剩下黑影的這種感覺」
   · 三段以上的快速連斬（和破曉千斬）：主角撲上去以後整個人消失，原地留下一個全黑的剪影、往前拖兩三道越來越淡的黑影；
     之後每一刀，主角的黑影都會在前面、後面一閃一閃（像瞬間來回移動）；整招打完（傷害都跳完）主角才在原地出現。
   · 只在新特效開著時（特效測試）。黑影就是主角的剪影塗黑，所以換裝備也跟著變。 */
const HD18 = { sil: new WeakMap() };
HD18.SK = { sdFlow: 0, ogSword: 0, dsPhantom: 0, zjSwordDance: 0, dgRot: 0, dgBloom: 0, ogDagger: 0, ddSpin: 0, ddDance: 0, ddGale: 0, ogDual: 1 };   // 1＝招一開始就消失（這招沒有往前撲的動作）
HD18.silOf = hi => { let c = HD18.sil.get(hi); if (c) return c; c = document.createElement('canvas'); c.width = hi.width; c.height = hi.height; const g = c.getContext('2d'); g.drawImage(hi, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#07040c'; g.fillRect(0, 0, c.width, c.height); c.px = hi.px; HD18.sil.set(hi, c); return c; };
// 主角的黑色剪影，放在 (dx, dy)（相對主角原本的位置），慢慢淡掉
HD18.shadow = (b, dx, dy, life = 14, al = 0.8) => { const Hv = b.H, hi = Hv && Hv.img; if (!hi) return; const ds = hi.ds || 1, hx0 = b.heroX + HD_HERO_OX;
  return b.spawn({ k: 'k13ghost', img: HD18.silOf(hi), x: (hi.px ? hx0 + 28 - hi.bb.cx : hx0) + dx, y: (hi.px ? HERO_FOOT - hi.bb.bot : HERO_Y) + dy, w: hi.width * ds, h: hi.height * ds, al, life }); };
HD18.puff = b => HD15.smoke(b, { x: b.center(b.H).x, y: HERO_FOOT - 4 }, 5, { col: '#120a1a', r: 26, spd: 1, sz: 9, life: 26, fl: 0.4, al: 0.75, up: 0.4 });
// 消失：原地留下黑影、往前拖三道淡淡的黑影、腳下一團黑煙；主角移到畫面外
HD18.vanish = b => { const v = b.H; if (!v || !v.off || b.hd18hid) return; HD18.shadow(b, 0, 0, 26, 0.85); for (let i = 1; i <= 3; i++) HD18.shadow(b, (Math.random() - 0.5) * 6, -i * 15, 12 - i * 2, 0.62 - i * 0.12);
  HD18.puff(b); Sound.sfx('wind'); b.hd18hid = 1; b.hd18t = b.t; v.off.y = 400; };
// 每一刀：黑影在前面（往對手那邊）和後面各閃一下
HD18.flick = b => { if (!b.hd18hid) return; HD18.shadow(b, (Math.random() - 0.5) * 34, -(16 + Math.random() * 40), 10, 0.75); HD18.shadow(b, (Math.random() - 0.5) * 30, 3 + Math.random() * 6, 8, 0.5); };
// 出現：從前面退回來的兩道黑影，主角回到原地，腳下一團黑煙
HD18.appear = b => { if (!b.hd18hid) return; b.hd18hid = 0; const v = b.H; if (v && v.off) v.off.y = 0; HD18.shadow(b, 0, -24, 10, 0.55); HD18.shadow(b, 0, -11, 8, 0.4); HD18.puff(b); };
for (const k in HD18.SK) { const key = 'hd15_' + k, F = FX[key], Fh = FX[key + 'h'], pre = HD18.SK[k]; if (!F) { bvErr('v12.98', 'no hd fx ' + key); continue; }
  FX[key] = function* (...a) { if (pre) HD18.vanish(this); else this.hd18pend = 1; try { yield* F.apply(this, a); } finally { if (this.hd18pend) { this.hd18pend = 0; HD18.vanish(this); } } };
  if (Fh) FX[key + 'h'] = function* (...a) { HD18.flick(this); yield* Fh.apply(this, a); }; }
// 往前撲（lunge）做完的那一瞬間消失
{ const _l = Battle.prototype.lunge; Battle.prototype.lunge = function* (...a) { yield* _l.apply(this, a); if (this.hd18pend) { this.hd18pend = 0; HD18.vanish(this); } }; }
// 整招結束才出現（中途對手倒下、招提早結束也一樣）；保險：消失太久（15 秒）也會出現
{ const H = Battle.prototype.handlers, _ae = H.ACTION_END; H.ACTION_END = function* (e, s, t, P) { if (this.hd18hid) { HD18.appear(this); yield* wait(8); } this.hd18pend = 0; return yield* _ae.call(this, e, s, t, P); };
  const _u = Battle.prototype.update; Battle.prototype.update = function (...a) { if (this.hd18hid && this.t - (this.hd18t || 0) > 900) HD18.appear(this); return _u.apply(this, a); }; }
