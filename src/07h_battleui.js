/* ===================== BATTLE UI v3: fantasy-RPG HUD (not the corner boxes / 2x2 grid / platforms) =====================
   · foe: a floating nameplate + thin gauge above its head
   · hero: over-the-shoulder, with a full-width gold-trimmed status bar at the bottom of the stage
   · commands: an icon hotbar (攻擊・技能・道具・防禦・逃跑) */
const CMD_ICONS = {
  攻擊: spriteFrom(['..........kk', '.........kWk', '........kWk.', '.......kWk..', '......kWk...', '.k...kWk....', '.kk.kWk.....', '..kkWk......', '..kGk.......', '.kGkkk......', 'kGk..k......', 'kk..........'], { k: '#1a1420', W: '#e8eef8', G: '#e8b040' }),
  技能: spriteFrom(['.....kk.....', '.....kYk....', '....kYYk....', 'kkkkkYYkkkk.', 'kYYYYWYYYYk.', '.kYYWWWYYk..', '..kYYWYYk...', '..kYYkYYk...', '.kYYk.kYYk..', '.kYk...kYk..', 'kkk.....kkk.', '............'], { k: '#1a1420', Y: '#ffcf5a', W: '#fff8d0' }),
  道具: spriteFrom(['....kkkk....', '...k....k...', '..kkkkkkkk..', '.kBBBBBBBBk.', 'kBBbbBBBBBBk', 'kBBBBBGGBBBk', 'kBBBBBGGBBBk', 'kBBBBBBBBBBk', 'kBbBBBBBBbBk', '.kBBBBBBBBk.', '..kkkkkkkk..', '............'], { k: '#1a1420', B: '#b87a40', b: '#e0a060', G: '#ffcf5a' }),
  防禦: spriteFrom(['kkkkkkkkkkk.', 'kSSSSSSSSSk.', 'kSWWSSSSSSk.', 'kSWSSSGSSSk.', 'kSSSSGGGSSk.', 'kSSSSSGSSSk.', '.kSSSSSSSk..', '.kSSSSSSSk..', '..kSSSSSk...', '...kSSSk....', '....kSk.....', '.....k......'], { k: '#1a1420', S: '#6a9ae0', W: '#d8e8ff', G: '#ffcf5a' }),
  逃跑: spriteFrom(['......kk....', '.....kSSk...', '.....kSSk...', '...kkkSk....', '..kSSSSSkk..', '.k..kSSk.Sk.', '....kSSk....', '...kSkkSk...', '..kSk..kSk..', '.kSk....kSk.', 'kkk......kk.', '............'], { k: '#1a1420', S: '#9ae0c0' }),
};
// v20.6: the hero's status / stat-stage icons sit beside the hero (left of the body, at hip height) instead of the screen corner
function heroIconPos(b) {
  const H = b.H, nb = [Game.st.status, H.wet && 'wet', H.tangle && 'tangle', H.shield && 'shield'].some(Boolean) ? 1 : 0, ns = Math.min(4, ['atk', 'def', 'spa', 'spd', 'spe'].filter(k => H.stages && H.stages[k]).length);
  const cx = b.center(H).x, w = (nb + ns) * 14; return { x: Math.max(2, Math.round(cx - 20 - w + b.offH.x)), y: Math.round(HERO_FOOT - 20 + b.offH.y), nb };
}
Object.assign(Battle.prototype, {
  drawBoxF(x) { // centred banner at the top: name + rank / Lv · family + status / HP gauge
    const F = this.F; if (this.boxF < -20 || this.alphaF <= 0) return;
    const a = clamp((this.boxF + 30) / 34, 0, 1), w = 120, X = (W - w) / 2, py = 6;
    const rim = F.boss ? '#ff6b7a' : F.elite ? '#ffc46b' : F.rare ? '#ffd84a' : '#8a93b3', tag = F.rare ? '稀有' : F.boss ? '頭目' : F.elite ? '菁英' : '';
    x.globalAlpha = a; if (!uiPlate(x, X, py, w, 33 + plateExtra(), F)) { x.fillStyle = 'rgba(10,8,20,0.75)'; x.fillRect(X, py, w, 33); x.fillStyle = rim; x.fillRect(X + 2, py, w - 4, 1); x.fillRect(X + 2, py + 32, w - 4, 1); x.fillRect(X, py + 2, 1, 29); x.fillRect(X + w - 1, py + 2, 1, 29); }
    Font.draw(x, F.n, X + 6, py + 1, UIC.text, UIC.textSh, 10); if (tag) Font.drawR(x, tag, X + w - 6, py + 2, rim, UIC.textSh, 8);
    let lx = Font.draw(x, 'Lv' + F.lv, X + 6, py + 14, UIC.muted, UIC.textSh, 8); if (FAMILIES[F.fam]) lx = Font.draw(x, '・' + FAMILIES[F.fam].n, lx + 1, py + 14, FAMILIES[F.fam].c, UIC.textSh, 8);
    const bs = [F.status, F.wet && 'wet', F.tangle && 'tangle', F.shield && 'shield'].filter(Boolean); badgeRow(x, bs.slice(0, 3), X + w - 6 - Math.min(3, bs.length) * 18, py + 14);
    const r = clamp(this.disp.F / F.maxhp, 0, 1); if (!uiBar(x, X + 7, py + 30, w - 14, r, r > 0.25 ? 'foe' : 'low')) { x.fillStyle = '#1a1024'; x.fillRect(X + 6, py + 27, w - 12, 3); x.fillStyle = r > 0.5 ? '#e0504a' : r > 0.2 ? '#ff8a3a' : '#ffd040'; x.fillRect(X + 6, py + 27, Math.round((w - 12) * r), 3); }
    x.globalAlpha = 1;
  },
  drawBoxH(x) { // one slim row: name · Lv │ HP ▬▬ 49 │ MP ▬▬ 45
    const Y = Math.round(this.boxH), st = Game.st; if (Y >= BH) return;
    const r = clamp(this.disp.H / this.H.maxhp, 0, 1), mr = clamp(st.mp / (this.H.maxmp || 1), 0, 1), my = Y + 6;
    if (!uiHud(x, 0, Y - 3, W, BH - Y + 4)) { x.fillStyle = 'rgba(12,10,22,0.9)'; x.fillRect(0, Y, W, BH - Y); x.fillStyle = '#c8a050'; x.fillRect(0, Y, W, 1); }
    const cx = Font.draw(x, st.name, 4, Y, UIC.text, UIC.textSh, 9); Font.draw(x, 'Lv' + st.lv, cx + 2, Y + 2, '#c8a050', UIC.textSh, 7);
    Font.draw(x, 'HP', 62, Y + 2, '#ff9a8a', UIC.textSh, 7); if (!uiBar(x, 76, my, 28, r, r > 0.25 ? 'hp' : 'low')) { x.fillStyle = '#241018'; x.fillRect(74, my, 30, 3); x.fillStyle = r > 0.5 ? '#5ad07a' : r > 0.2 ? '#ffc040' : '#ff5a5a'; x.fillRect(74, my, Math.round(30 * r), 3); } Font.drawR(x, Math.ceil(this.disp.H) + '', 122, Y + 1, r <= 0.2 ? UIC.bad : UIC.text, UIC.textSh, 8);
    Font.draw(x, 'MP', 127, Y + 2, '#8ab8ff', UIC.textSh, 7); if (!uiBar(x, 141, my, 19, mr, 'mp')) { x.fillStyle = '#101a30'; x.fillRect(139, my, 21, 3); x.fillStyle = '#5aa8ff'; x.fillRect(139, my, Math.round(21 * mr), 3); } Font.drawR(x, st.mp + '', 174, Y + 1, '#b8d4ff', UIC.textSh, 8);
    const bs = [st.status, this.H.wet && 'wet', this.H.tangle && 'tangle', this.H.shield && 'shield'].filter(Boolean); if (bs.length) { const P = heroIconPos(this); badgeRow(x, bs.slice(0, 1), P.x, P.y); }
  },
  *intro() { // flash in: the foe materialises, the hero steps up from below
    Sound.sfx('encounter'); this.foeX = this.foeTX; this.heroX = HERO_X; this.alphaF = 0; this.offH.y = 60;
    yield* parallel(tween(14, t => this.cover = 1 - t), tween(28, t => { this.alphaF = t; this.offH.y = 60 * (1 - (1 - Math.pow(1 - t, 3))); }));
    this.alphaF = 1; this.offH.y = 0; this.cover = 0; this.spawn({ k: 'flash', c: '#ffffff', a: 0.4, life: 8 });
    Sound.cry(Object.keys(SPECIES).indexOf(this.cfg.sp) + 1, this.F.boss ? 0.7 : 1, this.F.boss ? 1.6 : 1); if (this.F.boss) { this.shake = 30; Sound.sfx('quake'); }
    yield* parallel(tween(12, t => this.boxF = lerp(-30, 4, 1 - Math.pow(1 - t, 2))), tween(12, t => this.boxH = lerp(BH + 4, HBAR_Y, 1 - Math.pow(1 - t, 2))));
    const intro = this.F.rare ? '稀有的' + this.F.n + '出現了！' : this.F.boss ? this.F.n + '擋住了去路！' : this.F.elite ? '精英魔物' + this.F.n + '發動了攻擊！' : this.F.n + '出現了！';
    yield* this.msg(intro, { hold: 44 });
  },
  *chooseAction() {
    const st = Game.st; if (Game.autoPlay) { for (let i = 0; i < 4; i++) yield; return Game.autoPlay(this); }
    const names = ['攻擊', '技能', '道具', '防禦', '逃跑'];
    while (true) {
      this.idle = true;
      const r = yield* choose(names.map(() => ({ t: '' })), { x: 4, y: BB_Y + 3, w: W - 8, h: BB_H - 5, cols: 5, colW: 34, rowH: BB_H - 6, ox: 0, oy: 0, buttons: true, noFrame: true, cancel: false, index: this.cmdIdx,
        drawExtra: (x, m) => { names.forEach((n, k) => { const X = m.x + k * 34, on = k === m.i; if (!uiCmdIcon(x, k, X + 7, m.y + 1)) { if (on) { x.fillStyle = '#c8a050'; x.fillRect(X + 1, m.y, 29, 1); x.fillRect(X + 1, m.y + m.rowH - 3, 29, 1); } x.drawImage(CMD_ICONS[n], 0, 0, 12, 12, X + 9, m.y + 3, 12, 12); } Font.drawC(x, n, X + 15, m.y + (uiSkinOn() ? 13 : 16), on ? '#ffe8b0' : UIC.muted, UIC.textSh, 8); }); } });
      this.idle = false; this.cmdIdx = r;
      if (r === 0) return { type: 'move', id: 'attack' };
      if (r === 1) { const m = yield* this.chooseMove(); if (m) return { type: 'move', id: m }; }
      else if (r === 2) { const it = yield* bagScreen('battle'); if (it) return { type: 'item', id: it }; }
      else if (r === 3) return { type: 'defend' };
      else if (r === 4) { if (this.F.boss) { yield* this.msg('不能從這場戰鬥中逃走！'); continue; } return { type: 'run' }; }
    }
  },
});

Battle.prototype.chooseMove = function* () { // v20.7: a small pop-up (list + detail) over the stage; the command bar and HUD stay visible below
  const st = Game.st, list = learnedSkills(st);
  if (!list.length) { yield* this.msg('還沒有學會技能！（在選單的「技能」學習）'); return null; }
  let cur = Math.min(this.moveIdx || 0, list.length - 1); this.idle = true;
  const VIS = Math.min(list.length, 4), X = 8, w = W - 16, Y = 58, rowH = 14, h = 18 + VIS * rowH + 4, DY = Y + h + 2, DH = BH - 18 - DY; // v20.7b: taller detail box (4 lines) so long descriptions stay inside the frame
  const info = (x, m) => {
    Font.drawR(x, 'MP ' + st.mp + '/' + (this.H.maxmp || st.mp), X + w - 8, Y + 2, '#8ab8ff', UIC.textSh, 9);
    // v22d: three tidy rows — ① type · kind · Lv | MP cost  ② 物攻×% + scaling attribute | 預估  ③ description (auto-shrinks)
    const id = list[m.i], mv = skillMove(id), c = TYPE_COL[mv.t]; drawWin(x, X, DY, w, DH, 'menu');
    const fit = (t, sz, maxW) => { let z = sz; while (z > 7 && Font.width(t, z) > maxW) z--; return z; };
    const lack = skillMP(id) > st.mp, est = !lack && mv.pow && this.estimateDamage ? this.estimateDamage(id) : 0, L = X + 8, R = X + w - 8;
    const t1 = (mv.t === '一般' ? '無屬性' : mv.t + '屬性') + '・' + (mv.cat === '變' ? '輔助' : mv.cat === '物' ? '物理' : '魔法') + '・Lv' + skillLv(id) + (mv.scale && mv.pow ? '・' + ATTR_NAMES[mv.scale[0]] + '加成' : ''), mpT = lack ? 'MP不足' : 'MP' + skillMP(id);
    x.fillStyle = c; x.fillRect(L, DY + 6, 4, 4); Font.draw(x, t1, L + 7, DY + 1, '#c9cfe4', UIC.textSh, fit(t1, 9, w - 30 - Font.width(mpT, 9))); Font.drawR(x, mpT, R, DY + 1, lack ? UIC.bad : '#8ab8ff', UIC.textSh, 9);
    let y = DY + 14;
    if (mv.pow) { const pw = typeof powTxt === 'function' ? powTxt(mv) : '威力' + mv.pow, sc = '', eT = est ? '預估≈' + est : '';
      x.fillStyle = 'rgba(200,160,80,0.35)'; x.fillRect(L, DY + 13, w - 16, 1);
      const pz = fit(pw + (sc ? '　' + sc : ''), 10, w - 22 - (eT ? Font.width(eT, 9) : 0)); const pe = Font.draw(x, pw, L, y, UIC.accent, UIC.textSh, pz); if (sc) Font.draw(x, sc, pe + 5, y + 1, UIC.muted, UIC.textSh, Math.max(7, pz - 2));
      if (eT) Font.drawR(x, eT, R, y + 1, UIC.warm, UIC.textSh, 9); y += 13; }
    Font.drawC(x, 'A：使用　B：返回', W / 2, BB_Y + 11, UIC.muted, UIC.textSh, 9);
    const room = DY + DH - 5 - y, dtx = mv.d || ''; let z = 9, lh = 11, Ls = Font.wrap(dtx, w - 16, z);
    while (Ls.length * lh > room && z > 7) { z--; lh = z + 2; Ls = Font.wrap(dtx, w - 16, z); }
    const maxL = Math.max(1, Math.floor(room / lh)); if (Ls.length > maxL) { Ls = Ls.slice(0, maxL); Ls[maxL - 1] = Ls[maxL - 1].slice(0, -1) + '…'; }
    Ls.forEach((l, n) => Font.draw(x, l, L, y + n * lh, UIC.text, UIC.textSh, z));
  };
  while (true) {
    const r = yield* choose(list.map(id => ({ t: MOVES[id].n, r: 'MP' + skillMP(id), col: skillMP(id) > st.mp ? UIC.dis : undefined })), { x: X, y: Y, w, h, rowH, fs: 10, ox: 12, oy: 17, visible: VIS, title: '選擇技能', index: cur, onMove: i => cur = i, drawExtra: info });
    if (r < 0) { this.idle = false; return null; }
    if (skillMP(list[r]) > st.mp) { yield* this.msg('MP不夠！'); continue; }
    this.idle = false; this.moveIdx = r; return list[r];
  }
};
