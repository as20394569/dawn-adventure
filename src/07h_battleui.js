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
  drawBoxF(x) { // small nameplate floating above the foe
    const F = this.F; if (this.boxF < -20 || this.alphaF <= 0) return;
    const a = clamp((this.boxF + 30) / 34, 0, 1), C = this.center(F), top = FOE_FOOT - this.imgF.bb.h, py = clamp(top - 20, 2, 96) + Math.round(this.offF.y * 0.3);
    const tag = F.rare ? '稀有' : F.boss ? '頭目' : F.elite ? '菁英' : '', nw = Font.width(F.n, 10), lw = Font.width('Lv' + F.lv, 8), tw = tag ? Font.width(tag, 8) + 4 : 0, w = Math.max(64, nw + lw + tw + 14), X = Math.round(clamp(C.x - w / 2, 2, W - w - 2));
    const rim = F.boss ? '#ff6b7a' : F.elite ? '#ffc46b' : F.rare ? '#ffd84a' : '#6a7090'; x.globalAlpha = a;
    x.fillStyle = 'rgba(10,8,20,0.72)'; x.fillRect(X, py, w, 18); x.fillStyle = rim; x.fillRect(X, py, w, 1); x.fillRect(X, py + 17, w, 1);
    const cx = Font.draw(x, F.n, X + 5, py, UIC.text, UIC.textSh, 10); Font.draw(x, 'Lv' + F.lv, cx + 2, py + 2, UIC.muted, UIC.textSh, 8); if (tag) Font.drawR(x, tag, X + w - 4, py + 2, rim, UIC.textSh, 8);
    const r = this.disp.F / F.maxhp; x.fillStyle = '#1a1024'; x.fillRect(X + 4, py + 13, w - 8, 2); x.fillStyle = r > 0.5 ? '#e0504a' : r > 0.2 ? '#ff8a3a' : '#ffd040'; x.fillRect(X + 4, py + 13, Math.round((w - 8) * clamp(r, 0, 1)), 2);
    const bs = [F.status, F.wet && 'wet', F.tangle && 'tangle', F.shield && 'shield'].filter(Boolean); if (bs.length) badgeRow(x, bs.slice(0, 3), X, py + 19);
    if (FAMILIES[F.fam]) Font.drawR(x, FAMILIES[F.fam].n, X + w, py + 18, FAMILIES[F.fam].c, UIC.textSh, 8);
    x.globalAlpha = 1;
  },
  drawBoxH(x) { // one slim row: name · Lv │ HP ▬▬ 49 │ MP ▬▬ 45
    const Y = Math.round(this.boxH), st = Game.st; if (Y >= BH) return;
    const r = clamp(this.disp.H / this.H.maxhp, 0, 1), mr = clamp(st.mp / (this.H.maxmp || 1), 0, 1), my = Y + 7;
    x.fillStyle = 'rgba(12,10,22,0.9)'; x.fillRect(0, Y, W, BH - Y); x.fillStyle = '#c8a050'; x.fillRect(0, Y, W, 1);
    const cx = Font.draw(x, st.name, 4, Y + 1, UIC.text, UIC.textSh, 10); Font.draw(x, 'Lv' + st.lv, cx + 2, Y + 3, '#c8a050', UIC.textSh, 8);
    Font.draw(x, 'HP', 60, Y + 3, '#ff9a8a', UIC.textSh, 8); x.fillStyle = '#241018'; x.fillRect(73, my, 30, 3); x.fillStyle = r > 0.5 ? '#5ad07a' : r > 0.2 ? '#ffc040' : '#ff5a5a'; x.fillRect(73, my, Math.round(30 * r), 3); Font.drawR(x, Math.ceil(this.disp.H) + '', 122, Y + 2, r <= 0.2 ? UIC.bad : UIC.text, UIC.textSh, 9);
    Font.draw(x, 'MP', 126, Y + 3, '#8ab8ff', UIC.textSh, 8); x.fillStyle = '#101a30'; x.fillRect(139, my, 20, 3); x.fillStyle = '#5aa8ff'; x.fillRect(139, my, Math.round(20 * mr), 3); Font.drawR(x, st.mp + '', 174, Y + 2, '#b8d4ff', UIC.textSh, 9);
    const bs = [st.status, this.H.wet && 'wet', this.H.tangle && 'tangle', this.H.shield && 'shield'].filter(Boolean); if (bs.length) badgeRow(x, bs.slice(0, 1), 4, Y - 13);
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
        drawExtra: (x, m) => { names.forEach((n, k) => { const X = m.x + k * 34, on = k === m.i; if (on) { x.fillStyle = '#c8a050'; x.fillRect(X + 1, m.y, 29, 1); x.fillRect(X + 1, m.y + m.rowH - 3, 29, 1); } x.drawImage(CMD_ICONS[n], 0, 0, 12, 12, X + 8, m.y + 3, 15, 15); Font.drawC(x, n, X + 15, m.y + 19, on ? '#ffe8b0' : UIC.muted, UIC.textSh, 9); }); } });
      this.idle = false; this.cmdIdx = r;
      if (r === 0) return { type: 'move', id: 'attack' };
      if (r === 1) { const m = yield* this.chooseMove(); if (m) return { type: 'move', id: m }; }
      else if (r === 2) { const it = yield* bagScreen('battle'); if (it) return { type: 'item', id: it }; }
      else if (r === 3) return { type: 'defend' };
      else if (r === 4) { if (this.F.boss) { yield* this.msg('不能從這場戰鬥中逃走！'); continue; } return { type: 'run' }; }
    }
  },
});

Battle.prototype.chooseMove = function* () {
  const st = Game.st, list = learnedSkills(st);
  if (!list.length) { yield* this.msg('還沒有學會技能！（在選單的「技能」學習）'); return null; }
  let cur = Math.min(this.moveIdx || 0, list.length - 1); this.idle = true;
  const info = (x, m) => { const id = list[m.i], mv = skillMove(id); drawWin(x, 4, BB_Y + 1, W - 8, BB_H - 2, 'ow'); typeBadge(x, mv.t, 10, BB_Y + 6, 24); Font.draw(x, (mv.cat === '變' ? '輔助' : mv.cat === '物' ? '物理' : '魔法') + (mv.pow ? '・威力' + mv.pow : '') + ' Lv' + skillLv(id), 38, BB_Y + 4, UIC.muted, UIC.textSh, 10); Font.drawR(x, 'MP' + skillMP(id), W - 10, BB_Y + 4, skillMP(id) > st.mp ? UIC.bad : UIC.accent, UIC.textSh, 10); Font.draw(x, Font.wrap(MOVES[id].d, 156, 9)[0] || '', 10, BB_Y + 22, UIC.text, UIC.textSh, 9); };
  while (true) {
    const vis = Math.min(list.length, 7), h = vis * 16 + 10;
    const r = yield* choose(list.map(id => ({ t: MOVES[id].n, r: String(skillMP(id)), col: skillMP(id) > st.mp ? UIC.dis : undefined })), { x: W - 100, y: BH - 22 - h, w: 96, rowH: 16, visible: vis, index: cur, onMove: i => cur = i, drawExtra: info });
    if (r < 0) { this.idle = false; return null; }
    if (skillMP(list[r]) > st.mp) { yield* this.msg('MP不夠！'); continue; }
    this.idle = false; this.moveIdx = r; return list[r];
  }
};
