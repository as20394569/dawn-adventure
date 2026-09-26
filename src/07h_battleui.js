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
Object.assign(Battle.prototype, {
  drawBoxF(x) { // nameplate floating above the foe
    const F = this.F; if (this.boxF < -20 || this.alphaF <= 0) return;
    const a = clamp((this.boxF + 30) / 34, 0, 1), C = this.center(F), top = FOE_FOOT - this.imgF.bb.h, py = clamp(top - 24, 2, 80) + Math.round(this.offF.y * 0.3);
    const nm = F.n + ' Lv' + F.lv, w = Math.max(84, Font.width(nm, 11) + 16), X = Math.round(clamp(C.x - w / 2, 2, W - w - 2));
    x.globalAlpha = a; const rim = F.boss ? '#ff6b7a' : F.elite ? '#ffc46b' : F.rare ? '#ffd84a' : '#8a93b3';
    x.fillStyle = 'rgba(10,8,20,0.72)'; x.fillRect(X, py, w, 21); x.fillStyle = rim; x.fillRect(X, py, w, 1); x.fillRect(X, py + 20, w, 1); x.fillRect(X - 1, py + 1, 1, 19); x.fillRect(X + w, py + 1, 1, 19);
    x.fillRect(X + 3, py - 1, 3, 1); x.fillRect(X + w - 6, py - 1, 3, 1);
    Font.drawC(x, F.n, X + w / 2 - (F.boss || F.elite || F.rare ? 8 : 0) - Font.width('Lv' + F.lv, 9) / 2 - 2, py, UIC.text, UIC.textSh, 11); Font.draw(x, 'Lv' + F.lv, X + w / 2 + Font.width(F.n, 11) / 2 - (F.boss || F.elite || F.rare ? 8 : 0) - Font.width('Lv' + F.lv, 9) / 2 + 1, py + 2, UIC.muted, UIC.textSh, 9);
    const tag = F.rare ? '稀' : F.boss ? '王' : F.elite ? '菁' : ''; if (tag) { x.fillStyle = rim; x.fillRect(X + w - 14, py + 2, 11, 11); Font.drawC(x, tag, X + w - 8, py + 1, '#10121e', null, 9); }
    const r = this.disp.F / F.maxhp; x.fillStyle = '#1a1024'; x.fillRect(X + 4, py + 15, w - 8, 3); x.fillStyle = r > 0.5 ? '#e0504a' : r > 0.2 ? '#ff8a3a' : '#ffd040'; x.fillRect(X + 4, py + 15, Math.round((w - 8) * clamp(r, 0, 1)), 3);
    { const bs = [F.status, F.wet && 'wet', F.tangle && 'tangle', F.shield && 'shield'].filter(Boolean); badgeRow(x, bs.slice(0, 4), X, py + 23); }
    if (FAMILIES[F.fam]) Font.drawR(x, FAMILIES[F.fam].n, X + w, py + 22, FAMILIES[F.fam].c, UIC.textSh, 9);
    x.globalAlpha = 1;
  },
  drawBoxH(x) { // full-width status bar at the bottom of the stage (gold trim)
    const Y = Math.round(this.boxH), st = Game.st; if (Y >= BH) return;
    const r = clamp(this.disp.H / this.H.maxhp, 0, 1), mr = clamp(st.mp / (this.H.maxmp || 1), 0, 1);
    x.fillStyle = 'rgba(12,10,22,0.9)'; x.fillRect(0, Y, W, BH - Y); x.fillStyle = '#c8a050'; x.fillRect(0, Y, W, 1); x.fillStyle = '#6a5428'; x.fillRect(0, Y + 1, W, 1);
    Font.draw(x, st.name, 5, Y + 2, UIC.text, UIC.textSh, 11); Font.draw(x, 'Lv' + st.lv, 5, Y + 14, '#c8a050', UIC.textSh, 9);
    Font.draw(x, 'HP', 50, Y + 2, '#ff9a8a', UIC.textSh, 9); Font.drawR(x, Math.ceil(this.disp.H) + '/' + this.H.maxhp, 112, Y + 2, r <= 0.2 ? UIC.bad : UIC.text, UIC.textSh, 9);
    x.fillStyle = '#241018'; x.fillRect(50, Y + 17, 62, 5); x.fillStyle = r > 0.5 ? '#5ad07a' : r > 0.2 ? '#ffc040' : '#ff5a5a'; x.fillRect(50, Y + 17, Math.round(62 * r), 5);
    Font.draw(x, 'MP', 118, Y + 2, '#8ab8ff', UIC.textSh, 9); Font.drawR(x, st.mp + '/' + this.H.maxmp, 171, Y + 2, '#b8d4ff', UIC.textSh, 9);
    x.fillStyle = '#101a30'; x.fillRect(118, Y + 17, 53, 5); x.fillStyle = '#5aa8ff'; x.fillRect(118, Y + 17, Math.round(53 * mr), 5);
    const bs = [st.status, this.H.wet && 'wet', this.H.tangle && 'tangle', this.H.shield && 'shield'].filter(Boolean); if (bs.length) badgeRow(x, bs.slice(0, 1), 28, Y + 14);
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
      const r = yield* choose(names.map(() => ({ t: '' })), { x: 4, y: TB_Y + 2, w: W - 8, h: TB_H - 4, cols: 5, colW: 34, rowH: 54, ox: 0, oy: 1, buttons: true, noFrame: true, cancel: false, index: this.cmdIdx,
        drawExtra: (x, m) => { names.forEach((n, k) => { const X = m.x + k * 34, on = k === m.i; if (on) { x.fillStyle = '#c8a050'; x.fillRect(X, m.y + 1, 31, 1); x.fillRect(X, m.y + 52, 31, 1); } x.drawImage(CMD_ICONS[n], 0, 0, 12, 12, X + 4, m.y + 7, 24, 24); Font.drawC(x, n, X + 15, m.y + 34, on ? '#ffe8b0' : UIC.muted, UIC.textSh, 10); }); } });
      this.idle = false; this.cmdIdx = r;
      if (r === 0) return { type: 'move', id: 'attack' };
      if (r === 1) { const m = yield* this.chooseMove(); if (m) return { type: 'move', id: m }; }
      else if (r === 2) { const it = yield* bagScreen('battle'); if (it) return { type: 'item', id: it }; }
      else if (r === 3) return { type: 'defend' };
      else if (r === 4) { if (this.F.boss) { yield* this.msg('不能從這場戰鬥中逃走！'); continue; } return { type: 'run' }; }
    }
  },
});
