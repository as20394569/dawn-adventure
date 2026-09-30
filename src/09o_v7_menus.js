/* ===================== v7.0 ④ menus, help texts and the save conversion =====================
   選單→技能 is now the weapon-skill screen (main weapon, 副武器 and the borrowed skill); 選單→天賦 the class tree (09m).
   Saves from before v7 (skV < 5): advanced classes go back to their base class (the old class is now a branch of it),
   skill points / old talents / 繼承 are cleared, talent points are recounted from the level, and every piece of gear
   the hero owns teaches its blueprint. Lv14+ heroes that had advanced already get 天賦覺醒 for free. */

/* ---------- 選單→技能: the weapon-skill screen ---------- */
function* skillTreeScreen() {
  const st = Game.st; let row = 1;
  const rowsOf = () => { const k = mainWKey(st), S = k && WSK[k], sub = subWeapon(st), bor = borrowedSkill(st);
    return [
      { lbl: '普攻', col: '#c9cfe4', n: skillMove('attack', st).n, r: 'MP回復', d: () => MOVES.attack.d },
      ...(S ? S.a.map((id, i) => ({ lbl: '主動', col: UIC.accent, id, n: MOVES[id].n, r: '熟練Lv' + (skillLv(id, st) || 1) + '・MP' + skillMP(id, st), d: () => mvInfo(id) })) : []),
      ...(S ? [{ lbl: '被動', col: UIC.warm, n: S.p.n, r: '', d: () => wpassText(S.p) + '（裝備為主武器時生效）' }, { lbl: '特技', col: '#ffd860', n: S.s.n, r: '累積' + wsN(S.s, st) + '層', d: () => wspecText(S.s, st) + '。普通攻擊和傷害技能各累積1層。' }] : []),
      { lbl: '副武器', col: '#b8a0ff', n: sub ? gearShort(sub) : '（未設定）', r: 'A：更換', sub: 1, d: () => '再帶一把武器當「副武器」：不加能力值，只借用它的1招主動技能（威力90%）。' + (sub ? '' : '\n目前沒有設定副武器。') },
      { lbl: '借用', col: '#b8a0ff', id: bor, n: bor ? MOVES[bor].n : '—', r: sub ? 'A：切換' : '', bor: 1, d: () => bor ? mvInfo(bor) : '設定副武器後，可以從它的兩招主動技能中選一招帶進戰鬥。' },
    ]; };
  const mvInfo = id => { const m = skillMove(id, st), X = (st.skx || {})[id] || 0, lv = skillLv(id, st) || 1; return (m.pow ? powTxt(m) + '　' : '') + (m.t === '一般' ? '' : m.t + '屬性　') + '熟練度' + X + (lv < 3 ? '／' + WS_MASTER[lv] : '（最高）') + '\n' + (m.d || ''); };
  const scr = { draw(x) {
    screenBG(x); headerBar(x, '武器技能'); Font.drawR(x, 'MP ' + st.mp + '/' + heroStats(st).mp, W - 6, 2, UIC.blue, UIC.textSh, 10);
    const g = mainWeapon(st), B = g && GEAR[g.b]; drawWin(x, 4, 22, 168, 38, 'menu');
    if (g) { const im = typeof weaponPx === 'function' && weaponPx(g.b); if (im) drawWeaponIcon(x, im, 24, 41, 1); Font.draw(x, gearShort(g), 42, 24, gCol(g), UIC.textSh, 11); Font.draw(x, '主武器・' + (B.kind || '') + '・T' + B.t + (B.elem ? '・' + B.elem + '屬性' : ''), 42, 40, UIC.muted, UIC.textSh, 9); }
    else Font.draw(x, '沒有裝備武器（選單→裝備）', 14, 32, UIC.muted, UIC.textSh, 10);
    const R = rowsOf(); if (row >= R.length) row = R.length - 1;
    drawWin(x, 4, 62, 168, R.length * 17 + 8, 'menu');
    R.forEach((q, i) => { const Y = 66 + i * 17; if (i === row) selBar(x, 6, Y - 1, 164, 16); x.fillStyle = shade(q.col, -0.5); x.fillRect(10, Y + 1, 28, 13); Font.drawC(x, q.lbl, 24, Y, '#ffffff', UIC.textSh, 9);
      let z = 11; while (z > 8 && Font.width(q.n, z) > 78) z--; Font.draw(x, q.n, 42, Y, q.n === '—' || q.n === '（未設定）' ? UIC.muted : UIC.text, UIC.textSh, z); if (q.r) Font.drawR(x, q.r, 164, Y + 1, UIC.muted, UIC.textSh, 8);
      if (typeof touchRegion === 'function') touchRegion(6, Y - 1, 164, 16, () => { if (row === i) tapKey('a'); else { row = i; Sound.sfx('cursor'); } }); });
    const DY = 66 + R.length * 17 + 8; drawWin(x, 4, DY, 168, H - DY - 4, 'menu'); drawFitText(x, R[row].d(), 12, DY + 3, 152, H - DY - 12, 10);
  }, touchBack: true };
  UI.push(scr);
  while (true) {
    const R = rowsOf();
    if (Input.repeat('up')) { row = (row + R.length - 1) % R.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { row = (row + 1) % R.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('a')) { Input.consume('a'); const q = R[row];
      if (q.sub) { UI.remove(scr); const main = st.equip && st.equip.weapon;
        const pk = yield* gearPicker('選擇副武器', () => gearSort().filter(w => GEAR[w.b].slot === 'weapon' && w.u !== main && WSK[w.b]), (x, w, Y) => { const S = WSK[w.b]; Font.draw(x, '可借用：' + S.a.map(id => MOVES[id].n).join('・'), 12, Y, UIC.accent, UIC.textSh, 9); Font.draw(x, '（副武器不加能力值）', 12, Y + 13, UIC.muted, UIC.textSh, 9); });
        if (pk) { st.sub = { u: pk.u, i: 0 }; Sound.sfx('select'); } else if (st.sub && (yield* yesNo('要取消副武器嗎？'))) st.sub = null;
        UI.push(scr); }
      else if (q.bor) { const sub = subWeapon(st); if (sub) { st.sub.i = (st.sub.i + 1) % WSK[sub.b].a.length; Sound.sfx('select'); } else Sound.sfx('bump'); }
      else Sound.sfx('cursor'); }
    yield;
  }
  UI.remove(scr);
}

/* ---------- the main menu: 技能 = weapon skills, 天賦 = class talents (dot when points are waiting) ---------- */
{ const TILES = [['狀態', '能力・技能'], ['任務', '進度・追蹤'], ['屬性', '自由加點'], ['技能', '武器技能'], ['天賦', '職業天賦'], ['背包', '道具・素材'], ['裝備', '更換・詳情'], ['圖鑑', '魔物資料'], ['紀錄', '地圖・成就'], ['存檔', '記錄進度'], ['設定', '音量・速度'], ['關閉', '回到遊戲']];
  startMenu = function* () {
    Sound.sfx('menu'); let idx = Game.menuIdx || 0;
    while (true) {
      const st = Game.st, s = heroStats();
      const hdr = { draw(x) { x.fillStyle = 'rgba(8,10,20,0.78)'; x.fillRect(0, 0, W, H); drawWin(x, 4, 4, 168, 40, 'menu'); x.drawImage(heroFramesFor(st).down[0], 0, 0, 16, 22, 10, 8, 24, 33);
        const nx = Font.draw(x, st.name, 40, 6, UIC.text, UIC.textSh); if (CLASSES[st.cls]) Font.draw(x, CLASSES[st.cls].n, nx + 4, 7, UIC.warm, UIC.textSh, 10); Font.drawR(x, 'Lv' + st.lv, 166, 6, UIC.accent, UIC.textSh);
        Font.draw(x, 'HP ' + st.hp + '/' + s.hp, 40, 22, UIC.good, UIC.textSh, 10); Font.draw(x, 'MP ' + (st.mp ?? s.mp) + '/' + s.mp, 96, 22, '#86b4ff', UIC.textSh, 10); Font.drawR(x, st.money + ' G', 166, 32, UIC.warm, UIC.textSh, 10);
        Font.draw(x, MAPS[st.map] ? MAPS[st.map].name || '' : '', 40, 32, UIC.muted, UIC.textSh, 9); } };
      UI.push(hdr);
      const items = TILES.map(([t, sub]) => ({ t: '', name: t, dot: (t === '天賦' && st.cls && tpAvail(st) > 0) || (t === '屬性' && attrAvail(st) > 0), sub }));
      const r = yield* choose(items, { x: 4, y: 48, w: 168, h: 204, cols: 2, colW: 82, rowH: 33, ox: 4, oy: 3, buttons: true, style: 'menu', index: Math.min(idx, items.length - 1), drawExtra: (x, m) => { for (let k = 0; k < items.length; k++) { const c = k % 2, rr = Math.floor(k / 2), X = m.x + m.ox + c * m.colW, Y = m.y + m.oy + rr * m.rowH, on = k === m.i; Font.drawC(x, items[k].name, X + 39, Y + 1, on ? UIC.text : '#c9cfe4', UIC.textSh, 12); Font.drawC(x, items[k].sub, X + 39, Y + 16, on ? UIC.accent : UIC.muted, UIC.textSh, 8); if (items[k].dot) { x.fillStyle = UIC.warm; x.fillRect(X + 70, Y + 4, 4, 4); } } } });
      UI.remove(hdr);
      const name = r >= 0 ? TILES[r][0] : '關閉'; if (name === '關閉') break; idx = r; Game.menuIdx = r;
      if (name === '狀態') yield* summaryScreen(); if (name === '任務') yield* questScreen(); if (name === '屬性') yield* attrScreen(); if (name === '技能') yield* skillTreeScreen(); if (name === '天賦') yield* talentScreen();
      if (name === '背包') { yield* bagScreen('field'); if (Game.homeWarp) break; }
      if (name === '裝備') yield* equipScreen(); if (name === '圖鑑') yield* dexScreen(); if (name === '紀錄') yield* recordScreen();
      if (name === '存檔') { const ok = yield* yesNo('要記錄目前的冒險進度嗎？'); if (ok) { const good = saveGame(); if (good) { Sound.sfx('save'); yield* say(Game.st.name + '把冒險記錄了下來！'); } else yield* say('無法存檔……這個瀏覽器可能不允許儲存資料。'); } }
      if (name === '設定') yield* optionsScreen();
    }
    if (Game.homeWarp && Game.ow) { Game.homeWarp = 0; yield* Game.ow.homeWarp(); }
  };
}

/* ---------- 狀態→技能一覽: the first row also lists the weapon passive / special and the talents ---------- */
{ const _dp = drawPassiveInfo; drawPassiveInfo = function (x, st, X, Y, w, big) {
    const k = mainWKey(st); if (!k) return _dp(x, st, X, Y, w, big); const S = WSK[k], C = CLASSES[st.cls];
    const L = [['職業被動　' + (C ? C.n : '—'), UIC.warm, 11]]; const P = classPassives(st.cls); L.push([P.length ? P.map(p => '「' + p.n + '」' + p.d).join(' ') : '職業本身沒有被動（看天賦）', P.length ? UIC.text : UIC.muted, 9]);
    L.push(['武器被動「' + S.p.n + '」' + wpassText(S.p), UIC.accent, 9], ['特技「' + S.s.n + '」累積' + wsN(S.s, st) + '層後發動', '#ffd860', 9]);
    const n = tpSpent(st); L.push(['天賦：已投入' + n + '／' + TP_CAP + '點' + (tpAvail(st) ? '（還有' + tpAvail(st) + '點）' : ''), n ? '#c9cfe4' : UIC.muted, 9]);
    L.forEach(([t, col, z0], i) => { let z = z0; while (z > 7 && Font.width(t, z) > w) z--; Font.draw(x, t, X, Y + i * 15 + (i ? 1 : 0), col, UIC.textSh, z); });
  };
}
{ const _pt = drawPassiveTile; drawPassiveTile = function (x, st, X, Y, on) { _pt(x, st, X, Y, on); }; }

/* ---------- battle help: a page about weapon skills first ---------- */
BATTLE_HELP.unshift(['武器技能', ['技能跟著武器走：每把武器有2招主動、1個被動，和累積3層後在下一次攻擊或技能時發動的「特技」（戰鬥畫面右下角的◆）。',
  '普通攻擊不花MP，還會回復少量MP；主動技能越常用，熟練度越高、威力越強。',
  '副武器：再帶一把武器，借用它的1招主動技能（選單→技能）。',
  '職業天賦會強化某些武器或玩法，換了武器也可以重點天賦。']]);

/* ---------- saves ---------- */
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.skV = 5; st.ct = {}; st.bp = {}; st.bpT = {}; st.skills = {}; st.skp = 0; st.tp = 0; } return st; }; }
function v7Migrate(st) {
  if (!st || (st.skV || 1) >= 5) return false; const old = st.cls, lv = st.lv || 1;
  if (st.cls && V7_OLD[st.cls]) { st.cls = V7_OLD[st.cls]; if (lv >= 14) st.flags.deep = 1; }
  if (st.cls && CLASSES[st.cls] && CLASSES[st.cls].tier >= 3 && lv >= 14) st.flags.deep = 1;
  st.skills = {}; st.skFree = {}; st.skp = 0; st.tp = 0; st.inh = []; st.tal = {}; st.ct = {}; st.talV = Math.max(st.talV || 0, 3);
  st.bp = st.bp || {}; for (const g of st.gear || []) if (GEAR[g.b] && GEAR_RECIPE[g.b]) st.bp[g.b] = 1;
  st.skV = 5; st.v7note = old || 1; return true;
}
{ const _so = startOverworld; startOverworld = function (...a) {
    const st = Game.st, mig = v7Migrate(st), ow = _so.apply(this, a);
    if (Game.st && Game.st.v7note && ow && ow.run) { const was = Game.st.v7note; delete Game.st.v7note; if (Game.st.cls) ow.run((function* () { yield* wait(30);
      yield* say('【v7.0 大改版】技能改成跟著武器走了！每把武器都有自己的主動技能、被動和「特技」。（選單→技能）');
      yield* say('天賦改成職業專屬的三條分支，點數依等級重新計算，已經全部退回。' + (typeof was === 'string' && V7_OLD[was] ? '\n' + CLASSES[was].n + '變成了' + CLASSES[Game.st.cls].n + '的一條天賦分支。' : ''));
      yield* say('另外，裝備改由鐵匠打造：商店不再賣裝備，撿到的裝備會變成設計圖。你目前持有的裝備都保留了，也學會了它們的設計圖。'); })()); }
    return ow;
  };
}
// the elder shows "!" when the Lv14 天賦覺醒 is waiting
STORY_MARKS.elder = st => st.flags.license && st.lv >= 14 && !st.flags.deep ? '!' : null;
// gear pages (equip picker, bag, smith, loot card): a weapon lists its skills
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) {
    const L = _gi(g, wrapW), S = WSK[g.b]; if (!S) return L; const X = [], add = (t, c, s, ind) => { for (const l of Font.wrap(t, wrapW - ind, s)) X.push([l, c, s, ind]); };
    X.push(['【武器技能】', UIC.accent, 10, 0]); add('主動：' + S.a.map(id => MOVES[id].n).join('・'), '#c8f0ff', 11, 4);
    add('被動「' + S.p.n + '」' + wpassText(S.p), UIC.warm, 10, 4); add('特技「' + S.s.n + '」累積' + wsN(S.s) + '層後發動', '#ffd860', 10, 4);
    const i = L.findIndex(l => l[0] === '' && l[2] === 6); L.splice(i < 0 ? L.length : i, 0, ...X); return L;
  };
}
