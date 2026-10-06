/* ===================== v12.13 技能樹：分頁切換、點錯可以退（玩家 2026-10-05：「技能樹那邊左右點擊很常直接就切換了 而且按錯沒辦法退點」） =====================
   問了之後選：
   · 「上方改成武器分頁，點名字才切換」：標題兩邊一碰就換樹的觸控區拿掉，標題下面多一排武器分頁（目前的在中間，太多時可以左右捲），
     點名字才換；每棵樹記住自己的游標，不會跳回第一格。
     （v276 玩家：「按方向鍵很容易切換到」→ 清單裡按 ←→ 不再換樹；要用方向鍵換樹，在清單最上面按 ↑ 移到分頁列，再按 ←→，↓ 或 A 回清單。）
   · 「這次進來點的可以免費退」：這次進技能樹之後加的點，按標題列的「↩退點」（或 Select 鍵）一次收回 1 點，從最後加的開始退
     （連帶恢復特技的裝備和技能編排）；離開技能樹或用了「重置技能點」之後就不能退了（之前的照舊用重置）。 */
function* treeScreen11Tabs(start) { const st = Game.st, kinds = () => { const K = TREE_KINDS11.filter(k => (!TREE11[k].dual || (typeof dualTab12 === 'function' ? dualTab12(k, st) : dualOn11(st))) && (typeof kindOn13 !== 'function' || kindOn13(k))); K.sort((a, b) => (TREE11[a].common ? 1 : 0) - (TREE11[b].common ? 1 : 0)); return typeof DUAL_TAB12 !== 'undefined' && !K.some(k => TREE11[k].dual && k !== '單手盾') ? K.concat(DUAL_TAB12) : K; };
  let ti = Math.max(0, kinds().indexOf(start || curKinds11(st)[0] || '劍')), onTabs = false; const selBy = {}, undo = [], VIS = 9, LY = 36;
  const selOf = k => selBy[k] || 0, tabY = 22, tabH = 13;
  const undoOne = () => { const u = undo.pop(); if (!u) return false; const T = tr11(st), v = (T.lv[u.key] || 0) - 1;
    if (v > 0) T.lv[u.key] = v; else delete T.lv[u.key]; T.eq = { ...u.eq }; st.slots = u.slots.slice(); clampHP(); Sound.sfx('cancel'); return true; };
  const scr = { touchBack: true, draw(x) { const K = kinds(); if (ti >= K.length) ti = 0; const kind = K[ti], dualTip = typeof DUAL_TAB12 !== 'undefined' && kind === DUAL_TAB12, R = dualTip ? [] : treeRows11(kind, st), i = Math.min(selOf(kind), R.length - 1), top = clamp(i - 4, 0, Math.max(0, R.length - VIS));
    screenBG(x); headerBar(x, dualTip ? '雙持的技能樹' : TREE11[kind].common ? kind + '樹（共通）' : kind + '樹' + (curKinds11(st).includes(kind) ? '（使用中）' : ''));
    const left = trLeft11(st), rx = Font.drawR(x, '剩 ' + left + ' 點', W - 6, 3, left ? UIC.warm : UIC.muted, UIC.textSh, 9);
    if (undo.length) { const s = '↩退點', bw = Math.ceil(Font.width(s, 9)) + 8, bx = W - 6 - Math.ceil(Font.width('剩 ' + left + ' 點', 9)) - bw - 4;
      x.fillStyle = 'rgba(96,40,30,0.95)'; x.fillRect(bx, 3, bw, 14); x.fillStyle = UIC.warm; x.fillRect(bx, 3, bw, 1); x.fillRect(bx, 16, bw, 1);
      Font.draw(x, s, bx + 4, 3, '#ffe0c8', UIC.textSh, 9); if (typeof touchRegion === 'function') touchRegion(bx - 2, 0, bw + 4, 20, () => tapKey('select')); }
    // the tabs: every tree, the current one in the middle
    const lab = k => k, wd = K.map(k => Math.ceil(Font.width(lab(k), 9)) + 10), xs = []; let acc = 0; for (const w of wd) { xs.push(acc); acc += w + 2; }
    const span = W - 8, off = clamp(xs[ti] + wd[ti] / 2 - span / 2, 0, Math.max(0, acc - 2 - span)), use = curKinds11(st);
    x.save(); x.beginPath(); x.rect(4, tabY, span, tabH); x.clip();
    K.forEach((k, j) => { const X = Math.round(4 + xs[j] - off); if (X + wd[j] < 4 || X > W - 4) return; const on = j === ti;
      x.fillStyle = on ? (onTabs ? 'rgba(110,231,210,0.45)' : PANEL.sel) : 'rgba(20,26,48,0.85)'; x.fillRect(X, tabY, wd[j], tabH); x.fillStyle = on ? UIC.accent : use.includes(k) ? UIC.warm : PANEL.edge; x.fillRect(X, tabY + tabH - 1, wd[j], 1); if (on && onTabs) { x.fillRect(X, tabY, wd[j], 1); x.fillRect(X, tabY, 1, tabH); x.fillRect(X + wd[j] - 1, tabY, 1, tabH); }
      Font.draw(x, lab(k), X + 5, tabY, on ? UIC.text : use.includes(k) ? UIC.warm : k === (typeof DUAL_TAB12 !== 'undefined' ? DUAL_TAB12 : null) ? '#9fb0c8' : UIC.muted, UIC.textSh, 9);
      if (typeof touchRegion === 'function') touchRegion(Math.max(4, X), tabY - 1, Math.min(wd[j], W - 4 - X), tabH + 2, () => { onTabs = false; if (ti !== j) { ti = j; Sound.sfx('cursor'); } }); });
    x.restore(); if (off > 0) Font.draw(x, '‹', 0, tabY, UIC.accent, UIC.textSh, 9); if (off < acc - 2 - span - 0.5) Font.drawR(x, '›', W, tabY, UIC.accent, UIC.textSh, 9);
    drawWin(x, 4, LY, 168, VIS * 14 + 8, 'menu');
    if (dualTip) { drawDualTip12(x, LY, VIS * 14 + 8, LY + VIS * 14 + 12); return; }
    R.slice(top, top + VIS).forEach((N, k) => { const Y = LY + 4 + k * 14, lv = N.t === 'reset' ? 0 : trLv11(N.key, st), s = N.t === 'reset' ? { ok: true } : nodeState11(kind, N, st); if (top + k === i && !onTabs) selBar(x, 6, Y - 1, 164, 13);
      const tag = N.t === 'sk' ? (N.pos[0] === '4' ? '絕技' : N.pos[0] === '5' ? '奧義' : N.pos[0] + '段' + '①②③'['abc'.indexOf(N.pos[1])]) : N.t === 'sp' ? '特技' : N.t === 'reset' ? '' : N.t === 'cp' ? N.tier + '段' : '被動';
      Font.draw(x, tag, 10, Y, UIC.muted, UIC.textSh, 8); const col = N.t === 'reset' ? UIC.warm : lv ? (N.t === 'sp' && tr11(st).eq[kind] === N.j ? '#ffd860' : '#c8f0ff') : s.ok ? UIC.text : UIC.dis;
      Font.draw(x, N.n, 40, Y - 1, col, UIC.textSh, 10); if (N.t !== 'reset') Font.drawR(x, lv ? 'Lv' + lv + (N.max > 1 ? '/' + N.max : '') : s.ok ? '可學' : (s.why || '').replace(/^要先把.*/, '前置').replace(/^要先完成.*/, '未解鎖').slice(0, 8), 166, Y, lv ? UIC.accent : UIC.muted, UIC.textSh, 8);
      if (typeof touchRegion === 'function') touchRegion(6, Y - 1, 164, 13, () => { if (onTabs) { onTabs = false; selBy[kind] = top + k; Sound.sfx('cursor'); return; } if (selOf(kind) === top + k) tapKey('a'); else { selBy[kind] = top + k; Sound.sfx('cursor'); } }); });
    if (top > 0) x.drawImage(UPARROW, 86, LY + 1); if (top + VIS < R.length) x.drawImage(DOWNARROW, 86, LY + VIS * 14 + 3);
    const Y0 = LY + VIS * 14 + 12; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu');
    if (onTabs || typeof drawTreeInfo12 !== 'function') { let info = onTabs ? '選武器樹：←→ 換樹，↓ 或 A 回到清單。（在清單最上面按 ↑ 就能回到這裡）' : treeInfo11(kind, R[i], st); if (undo.length) info += '\n↩退點（Select）：收回剛剛加的 1 點。';
      drawFitText(x, info, 10, Y0 + 4, 152, 252 - Y0 - 8, 10, UIC.text); }
    else drawTreeInfo12(x, kind, R[i], st, Y0, 252); } }; // v284: tags / text / status row (10zzz_v12_u4_treeinfo.js)
  UI.push(scr);
  while (true) { const K = kinds(); if (ti >= K.length) ti = 0; const kind = K[ti], dualTip = typeof DUAL_TAB12 !== 'undefined' && kind === DUAL_TAB12; if (dualTip) onTabs = true; const R = dualTip ? [] : treeRows11(kind, st); let sel = Math.min(selOf(kind), R.length - 1);
    // ←→ only change the tree while the tabs have the cursor (↑ at the top of the list); in the list they do nothing, so a slip on the pad can't switch trees
    if (onTabs) { if (Input.pressed('left') || Input.pressed('right')) { const d = Input.pressed('left') ? -1 : 1; Input.consume('left', 'right'); ti = (ti + d + K.length) % K.length; Sound.sfx('cursor'); }
      if (Input.pressed('down') || Input.pressed('a')) { Input.consume('down', 'a'); if (dualTip) Sound.sfx('bump'); else { onTabs = false; Sound.sfx('cursor'); } }
      if (Input.pressed('select')) { Input.consume('select'); if (!undoOne()) Sound.sfx('bump'); }
      if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; continue; }
    if (Input.pressed('left') || Input.pressed('right')) Input.consume('left', 'right');
    if (Input.pressed('up') && sel === 0) { Input.consume('up'); onTabs = true; Sound.sfx('cursor'); yield; continue; }
    if (Input.repeat('up') && sel > 0) { sel--; Sound.sfx('cursor'); } if (Input.repeat('down') && sel < R.length - 1) { sel++; Sound.sfx('cursor'); } selBy[kind] = sel;
    if (Input.pressed('select')) { Input.consume('select'); if (!undoOne()) Sound.sfx('bump'); }
    if (Input.pressed('a')) { Input.consume('a'); const N = R[sel];
      if (N.t === 'reset') { UI.remove(scr); yield* treeReset11(); UI.push(scr); if (!trSpent11(st)) undo.length = 0; }
      else { const lv = trLv11(N.key, st), s = nodeState11(kind, N, st), T = tr11(st);
        if (N.t === 'sp' && lv) { T.eq[kind] = T.eq[kind] === N.j ? null : N.j; if (T.eq[kind] != null && PAIR11[kind]) T.eq[PAIR11[kind]] = null; Sound.sfx('select'); }
        else if (s.ok) { undo.push({ key: N.key, eq: { ...T.eq }, slots: (st.slots || []).slice() });
          T.lv[N.key] = lv + 1; if (N.t === 'sp' && T.eq[kind] == null && (!PAIR11[kind] || T.eq[PAIR11[kind]] == null)) T.eq[kind] = N.j; Sound.sfx(lv ? 'statUp' : 'select'); if (N.t === 'sk' && !lv) BB.slots(st); clampHP(); }
        else Sound.sfx('bump'); } }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr); }
treeScreen11 = treeScreen11Tabs;
