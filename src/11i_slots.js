/* ===================== v12.43 三個存檔欄位 =====================
   以前只有一個存檔：開新的冒險就會蓋掉舊的進度。→「存檔 1〜3」，標題的「繼續冒險」「新的冒險」先選欄位。
   舊的存檔（dawnlight_save_v10）就是「存檔 1」；最後用的欄位記在 dawnlight_save_v10_last。測試版（FXTEST）照舊不存檔。 */
const SLOTS13 = 3;
let SLOT13 = 1;
const slotKey13 = n => n === 1 ? SAVE_KEY : SAVE_KEY + '_s' + n;
const slotLoad13 = n => { try { const s = localStorage.getItem(slotKey13(n)); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
try { const l = +localStorage.getItem(SAVE_KEY + '_last'); if (l >= 1 && l <= SLOTS13) SLOT13 = l; } catch (e) { }
if (!fxtest13()) {
  saveGame = function () { try { if (Game.st) Game.st.savedAt13 = Date.now(); localStorage.setItem(slotKey13(SLOT13), JSON.stringify(Game.st)); try { localStorage.setItem(SAVE_KEY + '_last', String(SLOT13)); } catch (e) { } return true; } catch (e) { return false; } };
  loadGame = function () { return slotLoad13(SLOT13); };
}
const slotTime13 = s => { const m = Math.floor((s.time || 0) / 3600); return Math.floor(m / 60) + '小時' + (m % 60) + '分'; };
// the slot list, with the chosen slot's details in a window above it; returns 1..3, or 0 for 返回
function* pickSlot13(title, mode) {
  const S = []; for (let n = 1; n <= SLOTS13; n++) S.push(slotLoad13(n));
  const items = S.map((s, i) => ({ t: '存檔 ' + (i + 1), r: s ? s.name + ' ' + KD.slotTag(s) : '（空）', dis: mode === 'load' && !s })).concat({ t: '返回' });
  let cur = SLOT13 - 1; if (mode === 'load' && !S[cur]) cur = Math.max(0, S.findIndex(s => s)); if (mode === 'new' && S.some(s => !s)) cur = S.findIndex(s => !s); // a new adventure starts on an empty slot
  const box = { draw(x) { if (cur >= SLOTS13) return; const s = S[cur]; drawWin(x, 8, 104, W - 16, 44, 'menu');
      if (!s) { Font.draw(x, '空的欄位', 16, 120, UIC.muted, UIC.textSh); return; }
      Font.draw(x, s.name + '　' + KD.slotTag(s), 16, 109, UIC.text, UIC.textSh); Font.draw(x, (MAPS[s.map] || {}).name || '', 16, 122, UIC.warm, UIC.textSh, 10); Font.draw(x, '遊玩時間 ' + slotTime13(s), 16, 134, UIC.muted, UIC.textSh, 10);
      if (s.savedAt13) { const d = new Date(s.savedAt13), p2 = v => String(v).padStart(2, '0'); Font.drawR(x, (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()), W - 14, 134, UIC.muted, UIC.textSh, 9); } // v12.66: when it was saved
      { const a = typeof actOf === 'function' ? actOf(s) : 0; if (a && typeof ACTS !== 'undefined' && ACTS[a]) Font.drawR(x, (s.flags && s.flags.ch3) ? '第三章' : ACTS[a][0], W - 14, 122, UIC.accent, UIC.textSh, 9); } } };
  UI.push(box);
  try { const r = yield* choose(items, { title, x: 8, y: 152, w: W - 16, index: cur, cancel: true, onMove: i => { cur = i; } }); return r >= 0 && r < SLOTS13 ? r + 1 : 0; }
  finally { UI.remove(box); } }
if (!fxtest13()) TitleScene.prototype.menu = function* () {
  while (true) {
    const any = []; for (let n = 1; n <= SLOTS13; n++) if (slotLoad13(n)) any.push(n); this.hasSave = any.length > 0;
    const opts = any.length ? ['繼續冒險', '新的冒險', '存檔備份', '設定'] : ['新的冒險', '存檔備份', '設定'];
    const r = yield* choose(opts, { x: 38, y: 168, w: 100, cancel: true });
    if (r < 0) { this.stage = 'press'; return; }
    const o = opts[r];
    if (o === '設定') { yield* optionsScreen(); continue; }
    if (o === '存檔備份') { yield* backupScreen13(); continue; }
    if (o === '繼續冒險') { let n = any[0]; if (any.length > 1) { n = yield* pickSlot13('讀取哪一個存檔？', 'load'); if (!n) continue; }
      SLOT13 = n; const st = loadGame(); if (!st) continue; Game.st = st; yield* fadeOut(20); startOverworld(); Game.sys.push(fadeIn(20)); return; }
    if (o === '新的冒險') { let n = 1;
      if (any.length) { n = yield* pickSlot13('要用哪一個欄位？', 'new'); if (!n) continue; const s = slotLoad13(n);
        if (s && !(yield* yesNo('要覆蓋「存檔 ' + n + '」嗎？（' + s.name + ' ' + KD.slotTag(s) + '）\n舊的記錄會在下次存檔時消失。'))) continue; }
      SLOT13 = n; Game.pendingNew = { diff: 2, carry: null }; yield* fadeOut(24); Game.setScene(new IntroScene()); return; }
  } };
// the save message says which slot
{ const _say = say; say = function* (text, o) { if (typeof text === 'string' && / 把冒險記錄了下來！$|把冒險記錄了下來！$/.test(text) && !fxtest13()) text += '\n（存檔 ' + SLOT13 + '）'; return yield* _say(text, o); }; }
