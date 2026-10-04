/* ===================== v27d 魔物圖鑑: every monster gets its own page (playtest: "tapping a monster should open a page with its drops and stats") =====================
   list: tap a row to pick it, tap it again (or A) to open · page: 介紹 / 能力 / 掉落 tabs (←→ or tap), ↑↓ or ◀▶ = previous / next monster seen */
function dexInfo(k) {
  const sp = SPECIES[k] || {}, st = Game.st, places = [], elites = [];
  for (const m in MAPS) { const d = MAPS[m], nm = String(d.name || m).replace(/ ?\d+F$/, '');
    const enc = (d.encounters || []).some(e => (e.table || []).some(r => r[0] === k)), el = (d.elites || []).filter(e => e.sp === k), bs = d.boss && d.boss.sp === k;
    elites.push(...el); if ((enc || el.length || bs) && !places.includes(nm)) places.push(nm); }
  const keys = [k, ...elites.map(e => e.id).filter(Boolean)], sigs = [], re = [], kills = st.kills || {};
  const sigOf = (key, drop) => drop || (key === k ? sp.drop : null) || sp.drop || (LOOT[key] || [])[0];
  for (const key of new Set(keys)) { const e = elites.find(q => q.id === key), s = sigOf(key, e && e.drop);
    if ((sp.elite || sp.boss || e) && s && GEAR[classGear(s)] && !sigs.some(q => q.g === classGear(s))) sigs.push({ g: classGear(s), got: !!kills[key] });
    for (const g of LOOT[key] || []) { const c = classGear(g); if (GEAR[c] && !re.includes(c)) re.push(c); } }
  return { places, sigs, re, big: !!(sp.elite || sp.boss) };
}
let DEX_MAX = null; // bars compare each stat with the strongest monster (square-root scale so early monsters still show)
const dexStatMax = () => DEX_MAX || (DEX_MAX = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map(k => Math.max(1, ...Object.values(MON_PANEL).map(p => +p[k] || 0))));
function* dexDetail(list, idx) {
  let tab = 1; const TABS = ['介紹', '能力', '掉落'], dex = () => Game.st.dex || {};
  const step = d => { let i = idx; for (let n = 0; n < list.length; n++) { i = (i + d + list.length) % list.length; if ((dex()[list[i]] || {}).seen) return i; } return idx; };
  let info = dexInfo(list[idx]), infoK = list[idx];
  const scr = { draw(x) {
    const k = list[idx], sp = SPECIES[k], e = dex()[k] || {}, P = MON_PANEL[k]; if (infoK !== k) { info = dexInfo(k); infoK = k; }
    touchRegion(0, 0, W, H, () => {}); // this page covers the list below it
    screenBG(x); headerBar(x, 'No.' + String(idx + 1).padStart(2, '0') + ' ' + sp.n);
    for (const [s, X, d] of [['◀', W - 34, -1], ['▶', W - 16, 1]]) { drawBtn(x, X, 2, 15, 15, false); Font.drawC(x, s, X + 7, 2, UIC.accent, UIC.textSh, 9); touchRegion(X - 2, 0, 19, 20, () => { const n = step(d); if (n !== idx) { idx = n; Sound.sfx('cursor'); } }); }
    // portrait + quick facts
    drawWin(x, 4, 23, 72, 76, 'menu');
    const cp = typeof dexPortrait === 'function' && dexPortrait(k); x.imageSmoothingEnabled = false;
    if (cp) { const q = Math.min(1, 64 / cp.width, 64 / cp.height), pw = Math.round(cp.width * q), ph = Math.round(cp.height * q); x.drawImage(cp, Math.round(40 - pw / 2), 94 - ph, pw, ph); }
    else { const im = battleSprite(k); x.drawImage(im, 0, 0, im.width, im.height, 8, 27, 64, 64); }
    famBadge(x, sp.fam, 82, 26, 38); Font.draw(x, sp.rare ? '稀有' : sp.boss ? '頭目' : sp.elite ? '菁英' : '野生', 124, 24, sp.rare ? '#ffd84a' : sp.boss ? UIC.bad : sp.elite ? UIC.warm : UIC.muted, UIC.textSh, 10);
    { const t = typeof dexWeak11 === 'function' ? dexWeak11(k) : famLine(sp.fam); let z = 9; while (z > 7 && Font.width(t, z) > 90) z--; Font.draw(x, t, 82, 40, UIC.warm, UIC.textSh, z); }
    Font.draw(x, '擊敗 ' + (e.won || 0) + ' 次', 82, 52, UIC.text, UIC.textSh, 9);
    Font.wrap('出沒：' + (info.places.length ? info.places.slice(0, 3).join('、') : '—'), 90, 9).slice(0, 3).forEach((l, i) => Font.draw(x, l, 82, 64 + i * 11, UIC.muted, UIC.textSh, 9));
    // tabs
    TABS.forEach((t, i) => { const X = 4 + i * 57; drawBtn(x, X, 103, 54, 16, tab === i); Font.drawC(x, t, X + 27, 103, tab === i ? UIC.accent : UIC.text, UIC.textSh, 9); touchRegion(X, 101, 54, 20, () => { if (tab !== i) { tab = i; Sound.sfx('cursor'); } }); });
    drawWin(x, 4, 122, 168, 112, 'menu'); const L = [];
    if (tab === 0) Font.wrap(sp.dex || '（沒有記載）', 156, 11).slice(0, 8).forEach((l, i) => Font.draw(x, l, 10, 127 + i * 13, UIC.text, UIC.textSh, 11));
    else if (tab === 1) {
      if (P) { Font.draw(x, '參考等級 Lv' + P.lv, 10, 126, UIC.muted, UIC.textSh, 9); const S = [['HP', P.hp, '#7fd88a'], ['物攻', P.atk, '#ff9a6a'], ['物防', P.def, '#e8c86a'], ['魔攻', P.spa, '#b890ff'], ['魔防', P.spd, '#7ab8ff'], ['速度', P.spe, '#6ee7d2']], MX = dexStatMax();
        S.forEach(([a, v, c], i) => { const Y = 139 + i * 11; Font.draw(x, a, 10, Y, UIC.muted, UIC.textSh, 9); x.fillStyle = '#10121e'; x.fillRect(38, Y + 4, 100, 5); x.fillStyle = c; x.fillRect(38, Y + 4, Math.max(2, Math.round(100 * Math.sqrt(Math.min(1, v / MX[i])))), 5); Font.drawR(x, String(v), 166, Y, UIC.text, UIC.textSh, 9); }); }
      const mv = [...new Set((sp.learn || []).map(l => MOVES[l[1]] && MOVES[l[1]].n).filter(Boolean))];
      Font.wrap('招式：' + (mv.join('、') || '—'), 156, 9).slice(0, 3).forEach((l, i) => Font.draw(x, l, 10, 208 + i * 10, UIC.text, UIC.textSh, 9));
    } else {
      L.push(['經驗值 ' + (sp.exp || 0) + '　金錢 ' + (sp.gold || 0) + ' G', UIC.text]);
      const mat = sp.mat && ITEMS[sp.mat] ? ITEMS[sp.mat].n : null;
      if (info.big && typeof PARTS11 !== 'undefined' && PARTS11[k]) for (const t of foeDropLines(k, null, sp.boss || PART_BOSS11[k] ? 'boss' : 'elite').filter(t => /^(部位|稀有)：/.test(t))) L.push([t, UIC.text]);
      else if (info.big) L.push(['素材：' + (mat ? mat + '×' + (sp.boss ? 3 : 2) + '＋' : '') + '當地素材×' + (sp.boss ? 3 : 2) + '（每次必定）', UIC.text]);
      else L.push(['素材：' + (mat ? mat + '（60%）' : '—'), UIC.text]);
      for (const s of info.sigs) L.push(['首次擊敗：「' + GEAR[s.g].n + '」的設計圖' + (s.got ? '（已取得）' : ''), s.got ? UIC.muted : UIC.warm]);
      if (info.big) L.push([typeof PARTS11 !== 'undefined' && PARTS11[k] ? '再戰：部位、經驗（頭目 30%）、金錢' : '再戰：經驗（30%）、金錢、素材', '#c8b0ff']);
      if (!info.big && !info.re.length) L.push(['普通魔物不會掉裝備。裝備靠菁英・頭目的設計圖打造。', UIC.muted]);
      let Y = 127; for (const [t, c] of L) for (const l of Font.wrap(t, 156, 9)) { if (Y > 222) break; Font.draw(x, l, 10, Y, c, UIC.textSh, 9); Y += 11; }
    }
    Font.draw(x, '←→分頁　↑↓換魔物', 6, 239, UIC.muted, UIC.textSh, 9);
    drawBtn(x, 124, 236, 48, 16, false); Font.drawC(x, '↩返回', 148, 236, UIC.warm, UIC.textSh, 9); touchRegion(122, 234, 52, 20, () => tapKey('b'));
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('left')) { tab = (tab + 2) % 3; Sound.sfx('cursor'); } if (Input.repeat('right') || Input.pressed('a')) { Input.consume('a'); tab = (tab + 1) % 3; Sound.sfx('cursor'); }
    if (Input.repeat('up')) { const n = step(-1); if (n !== idx) { idx = n; Sound.sfx('cursor'); } } if (Input.repeat('down')) { const n = step(1); if (n !== idx) { idx = n; Sound.sfx('cursor'); } }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr); return idx;
}
dexScreen = function* () {
  const list = Object.keys(SPECIES), VIS = 7; let idx = 0;
  const seen = k => ((Game.st.dex || {})[k] || {}).seen;
  const scr = { draw(x) {
    const dex = Game.st.dex || {}, seenN = list.filter(seen).length;
    touchRegion(0, 0, W, H, () => tapKey('b')); // tapping outside the list = back
    screenBG(x); headerBar(x, '魔物圖鑑'); Font.drawR(x, '收集率 ' + Math.round(seenN / list.length * 100) + '%', W - 6, 2, UIC.accent, UIC.textSh);
    drawWin(x, 4, 24, 168, VIS * 18 + 8, 'menu'); const top = Math.max(0, Math.min(idx - 3, list.length - VIS));
    list.slice(top, top + VIS).forEach((k, i) => { const Y = 28 + i * 18, e = dex[k], sn = e && e.seen; if (top + i === idx) selBar(x, 6, Y - 1, 164, 17);
      const m = monsterMini(k, 16); x.drawImage(sn ? m.c : tinted(m.c, '#2a3150'), 10, Y);
      Font.draw(x, 'No.' + String(top + i + 1).padStart(2, '0'), 30, Y, UIC.muted, UIC.textSh); Font.draw(x, sn ? SPECIES[k].n : '？？？', 70, Y, sn ? UIC.text : UIC.dis, UIC.textSh);
      if (sn) Font.drawR(x, '擊敗 ' + (e.won || 0), 164, Y, e.won ? UIC.text : UIC.muted, UIC.textSh);
      touchRegion(6, Y - 1, 164, 18, () => { if (idx === top + i) tapKey('a'); else { idx = top + i; Sound.sfx('cursor'); } }); });
    if (top > 0) { x.drawImage(UPARROW, 86, 26); touchRegion(60, 21, 56, 8, () => { idx = Math.max(0, idx - VIS); Sound.sfx('cursor'); }); }
    if (top + VIS < list.length) { x.drawImage(DOWNARROW, 86, 24 + VIS * 18 + 3); touchRegion(60, 24 + VIS * 18, 56, 10, () => { idx = Math.min(list.length - 1, idx + VIS); Sound.sfx('cursor'); }); }
    drawWin(x, 4, 164, 168, 88, 'menu'); const k = list[idx];
    if (seen(k)) { const cp = typeof dexPortrait === 'function' && dexPortrait(k); x.imageSmoothingEnabled = false;
      if (cp) { const q = Math.min(1, 72 / cp.width, 72 / cp.height), pw = Math.round(cp.width * q), ph = Math.round(cp.height * q); x.drawImage(cp, Math.round(44 - pw / 2), 244 - ph, pw, ph); } else { const im = battleSprite(k); x.drawImage(im, 0, 0, im.width, im.height, 8, 172, 72, 72); }
      const sp = SPECIES[k]; famBadge(x, sp.fam, 86, 170, 38); Font.draw(x, sp.rare ? '稀有' : sp.elite ? '菁英' : sp.boss ? '頭目' : '野生', 128, 168, sp.rare ? '#ffd84a' : sp.boss ? UIC.bad : sp.elite ? UIC.warm : UIC.muted, UIC.textSh);
      { const t = typeof dexWeak11 === 'function' ? dexWeak11(k) : famLine(sp.fam); let z = 10; while (z > 7 && Font.width(t, z) > 84) z--; Font.draw(x, t, 86, 184, UIC.warm, UIC.textSh, z); } drawFitText(x, sp.dex || '', 86, 198, 82, 40, 11); /* v12.0.1: shrink instead of cutting the third line */
      drawBtn(x, 106, 230, 62, 16, true); Font.drawC(x, 'A：詳細資料', 137, 230, UIC.accent, UIC.textSh, 9); touchRegion(4, 164, 168, 88, () => tapKey('a')); }
    else Font.draw(x, '還沒有遇見過這種魔物。', 14, 170, UIC.muted, UIC.textSh);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { idx = (idx + list.length - 1) % list.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { idx = (idx + 1) % list.length; Sound.sfx('cursor'); }
    if (Input.repeat('left')) { idx = Math.max(0, idx - VIS); Sound.sfx('cursor'); } if (Input.repeat('right')) { idx = Math.min(list.length - 1, idx + VIS); Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); if (seen(list[idx])) { Sound.sfx('select'); idx = yield* dexDetail(list, idx); } else Sound.sfx('buzz'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
};
