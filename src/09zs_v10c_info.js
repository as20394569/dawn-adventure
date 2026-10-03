/* ===================== v10 階段三 A：挑戰前的資料卡・頭目圖鑑・寶珠圖鑑 =====================
   Plan item 9: before an elite or boss fight the card now lists its techniques (蓄力 moves marked ⚠), weaknesses,
   and what it drops (技能寶珠, 首殺裝備, 附魔石, 素材). Story bosses show the card too (A to start). 圖鑑 gets two new
   pages: 頭目・菁英 (level, where, drops, beaten or not) and 寶珠 (every orb and where it comes from). The smith's
   recipe page names the monster behind a missing material. */
const FOE_SPOTS = (() => { const L = []; for (const id in MAPS) { const d = MAPS[id]; for (const e of d.elites || []) L.push({ sp: e.sp, lv: e.lv, map: id, kind: 'elite', key: e.id }); if (d.boss && id !== 'rift') L.push({ sp: d.boss.sp, lv: d.boss.lv, map: id, kind: 'boss', key: d.boss.sp }); }
  const seen = new Set(); return L.filter(e => { const k = e.sp + e.kind; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.lv - b.lv); })();
function foeMoves(sp, lv, kind) { try { const f = makeFoe(sp, lv, kind); const L = f.moves.map(m => m.id); const ex = PHASE_MOVES[sp]; if (ex && !L.includes(ex)) L.push(ex); return L; } catch (e) { return []; } }
function foeDropLines(sp, key, kind) {
  const L = [], st = Game.st, O = ORB_DROP[sp];
  // v12: 寶珠 and 附魔石 drops are cancelled (their replacements are decided later)
  const h = typeof lootHint === 'function' ? lootHint(key, sp) : ''; if (h) L.push(h.replace('首次擊敗：必定掉落紅色', '裝備：首殺').replace('重戰掉落：', '裝備：'));
  if (BOSS_MAT[sp] && ITEMS[BOSS_MAT[sp]]) L.push('素材：' + ITEMS[BOSS_MAT[sp]].n);
  return L;
}
function famText(sp) { const F = FAMILIES[SPECIES[sp].fam] || {}; return (F.weak && F.weak.length ? '弱：' + F.weak.join('') : '') + (F.resist && F.resist.length ? '　抗：' + F.resist.join('') : '') + (F.immune && F.immune.length ? '　免疫' + F.immune.map(q => ({ psn: '毒', par: '麻', slp: '眠', brn: '燒' })[q] || q).join('') : ''); }
encounterCard = function (sp, lv, key, kind, extra) {
  const pic = typeof chibiPortrait === 'function' && chibiPortrait(sp) || battlePortrait(sp), stars = dangerStars(lv), mv = foeMoves(sp, lv, kind).map(id => MOVES[id]).filter(Boolean);
  const mvTxt = mv.map(m => (m.charge ? '⚠' : '') + m.n).join('・'), mvL = Font.wrap(mvTxt, W - 36, 9).slice(0, 3), dropL = foeDropLines(sp, key, kind).flatMap(t => Font.wrap(t, W - 36, 8)).slice(0, 6);
  return { draw(x) {
    const X = 6, Y = 4, w = W - 12, h = 70 + 12 + mvL.length * 11 + 13 + dropL.length * 10 + 5; drawPanel(x, X, Y, w, h, kind === 'boss' ? '#ff6b7a' : '#ffc46b'); // v10.5: the last drop line fits inside
    Font.drawC(x, (kind === 'boss' ? '頭目' : '菁英魔物') + (extra ? '・' + extra : ''), W / 2, Y + 2, kind === 'boss' ? '#ff9aa4' : '#ffd890', UIC.textSh, 9);
    x.fillStyle = 'rgba(10,12,24,0.7)'; x.fillRect(X + 6, Y + 16, 50, 50);
    if (pic) { const s = Math.min(1, 48 / pic.height, 48 / pic.width); x.imageSmoothingEnabled = false; x.drawImage(pic, Math.round(X + 31 - pic.width * s / 2), Math.round(Y + 65 - pic.height * s), Math.round(pic.width * s), Math.round(pic.height * s)); }
    const tx = X + 62; Font.draw(x, SPECIES[sp].n, tx, Y + 15, UIC.text, UIC.textSh, 11); Font.draw(x, 'Lv' + lv + '・' + famName(SPECIES[sp].fam), tx, Y + 29, UIC.muted, UIC.textSh, 9);
    let s = ''; for (let i = 0; i < 5; i++) s += i < stars ? '★' : '☆'; Font.draw(x, '危險度 ' + s, tx, Y + 41, stars >= 4 ? '#ff7a7a' : stars === 3 ? '#ffd070' : '#9ad890', UIC.textSh, 9);
    { const ft = famText(sp) || '沒有明顯弱點'; let fz = 9; while (fz > 7 && Font.width(ft, fz) > W - tx - 10) fz--; Font.draw(x, ft, tx, Y + 53, '#8ad0ff', UIC.textSh, fz); }
    let y = Y + 70; Font.draw(x, '【招式】' + (mv.some(m => m.charge) ? '　⚠＝蓄力大招，記得防禦' : ''), X + 8, y, UIC.accent, UIC.textSh, 9); y += 12;
    mvL.forEach(l => { Font.draw(x, l, X + 12, y, '#e8f0ff', UIC.textSh, 9); y += 11; });
    Font.draw(x, '【掉落】', X + 8, y + 1, UIC.accent, UIC.textSh, 9); y += 13; dropL.forEach(l => { Font.draw(x, l, X + 12, y, '#c8b0ff', UIC.textSh, 8); y += 10; });
  } };
};
// story bosses: the card before the fight (not on the rift floors or rematches, which ask already)
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    if (cfg && cfg.kind === 'boss' && !cfg.rematch && !cfg.noCard && this.st.map !== 'rift') { const card = encounterCard(cfg.sp, cfg.lv, cfg.id || cfg.sp, 'boss', ''); UI.push(card); yield* ask('準備好了嗎？', ['迎戰'], { cancel: false, mx: W - 72, my: TB_Y + 6 }); UI.remove(card); }
    return yield* _bs.call(this, cfg, ...a);
  }; }

/* ---------- 圖鑑: 頭目・菁英 / 寶珠 ---------- */
function* listScreen(title, rows, detail) { // rows: [{ t, r, col }], detail(i) → [lines]
  let sel = 0; const VIS = 9;
  const scr = { draw(x) { screenBG(x); headerBar(x, title); const R = rows(), i = Math.min(sel, Math.max(0, R.length - 1)), top = clamp(i - 4, 0, Math.max(0, R.length - VIS));
    drawWin(x, 4, 22, 168, VIS * 15 + 8, 'menu'); R.slice(top, top + VIS).forEach((r, k) => { const Y = 26 + k * 15; if (top + k === i) selBar(x, 6, Y - 1, 164, 14); if (r.ic) { x.drawImage(r.ic, 10, Y - 1); Font.draw(x, r.t, 24, Y - 2, r.col || UIC.text, UIC.textSh, 9); } else Font.draw(x, r.t, 11, Y - 2, r.col || UIC.text, UIC.textSh, 9); if (r.r) Font.drawR(x, r.r, 166, Y - 1, UIC.muted, UIC.textSh, 8); });
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (top + VIS < R.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 15 + 3);
    const Y0 = 22 + VIS * 15 + 12; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu'); let y = Y0 + 3; for (const [t, c, z] of detail(i)) for (const l of Font.wrap(t, 152, z || 9)) { if (y > 240) break; Font.draw(x, l, 10, y, c || UIC.text, UIC.textSh, z || 9); y += (z || 9) + 2; } } };
  UI.push(scr); while (true) { const n = rows().length; if (Input.repeat('up') && sel > 0) { sel--; Sound.sfx('cursor'); } if (Input.repeat('down') && sel < n - 1) { sel++; Sound.sfx('cursor'); } if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; } yield; } UI.remove(scr);
}
function* bossDexScreen() {
  const st = Game.st, won = e => ((st.dex || {})[e.sp] || {}).won > 0;
  yield* listScreen('頭目・菁英', () => FOE_SPOTS.map(e => ({ t: (won(e) ? '✓ ' : '　 ') + (e.kind === 'boss' ? '【頭目】' : '') + SPECIES[e.sp].n, r: 'Lv' + e.lv, col: won(e) ? UIC.text : e.kind === 'boss' ? '#ff9aa4' : '#ffd890' })),
    i => { const e = FOE_SPOTS[i]; if (!e) return []; return [[(MAPS[e.map].name || '') + '　Lv' + e.lv + '　' + famText(e.sp), UIC.accent], ...foeDropLines(e.sp, e.key, e.kind).map(t => [t, '#c8b0ff', 8]), [won(e) ? '已擊敗' + (e.kind === 'boss' ? '（回憶石碑可以再戰）' : '（一段時間後會再出現）') : '尚未擊敗', won(e) ? UIC.good : UIC.muted, 8]]; });
}
const ORB_SRC = (() => { const S = {}; const add = (k, t) => (S[k] = S[k] || []).push(t); for (const sp in ORB_DROP) ORB_DROP[sp].forEach(k => add(k, SPECIES[sp].n)); for (const c in COMMISSIONS) if (COMMISSIONS[c].reward && COMMISSIONS[c].reward.orb) add(COMMISSIONS[c].reward.orb, '委託「' + COMMISSIONS[c].n + '」'); add('galeCut', '村長（冒險者許可・武器系）'); add('fireShot', '村長（冒險者許可・魔法系）'); return S; })();
function* orbDexScreen() {
  const st = Game.st, keys = [...Object.keys(ORB_A), ...Object.keys(ORB_P)], seen = k => (st.orbSeen || {})[k];
  yield* listScreen('寶珠圖鑑　' + keys.filter(seen).length + '/' + keys.length, () => keys.map(k => ({ ic: typeof orbIcon === 'function' ? orbIcon(k) : null, t: (typeof orbIcon === 'function' && orbIcon(k) ? '' : ORB_A[k] ? '◆' : '◇') + (ORB_A[k] || ORB_P[k]).n, r: seen(k) ? '已取得' : '', col: seen(k) ? (ORB_A[k] ? '#c8f0ff' : UIC.warm) : UIC.dis })),
    i => { const k = keys[i]; if (!k) return []; const o = { k, x: 0, e: [], lv: 1 }; return [[orbInfo(o), UIC.text], ['取得：' + ((ORB_SRC[k] || []).join('、') || '？？？'), '#c8b0ff', 8], ...(ORB_A[k] ? [['進化：強攻 ' + evoOptText(o, 0, 'A') + '→' + evoOptText(o, 1, 'A') + '／附加 ' + evoOptText(o, 0, 'B') + '→' + evoOptText(o, 1, 'B'), UIC.muted, 8]] : [])]; });
}
{ const _dx = dexScreen; dexScreen = function* () { const r = yield* ask('要看什麼？', ['魔物圖鑑', '頭目・菁英']); if (r === 0) yield* _dx(); else if (r === 1) yield* bossDexScreen(); else if (r === 2) yield* orbDexScreen(); }; }
// the smith's recipe page: who drops a missing material
function matSrc(k) { const B = FOE_SPOTS.find(e => BOSS_MAT[e.sp] === k); if (B) return SPECIES[B.sp].n; for (const s in SPECIES) if (SPECIES[s].mat === k) { const m = typeof spawnMaps === 'function' ? spawnMaps(s) : []; if (m.length) return SPECIES[s].n; } return ''; }
askFight = function* (sp, lv, key, kind, extra) { // the choice sits inside the message box, so the card can use the whole upper screen
  const card = encounterCard(sp, lv, key, kind, extra); UI.push(card);
  const r = yield* ask('要迎戰嗎？', ['迎戰', '撤退'], { cancel: false, mx: W - 72, my: TB_Y + 4 }); UI.remove(card); return r === 0;
};
