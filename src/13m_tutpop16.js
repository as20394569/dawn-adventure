/* ===================== v12.117 戰鬥中的教學改成跳窗（玩家 2026-10-11：「戰鬥中的系統教學文字改成跳窗說明 玩家可以選擇已經會了 然後不再跳出」） =====================
   戰鬥裡整句用全形括號包起來的說明（「（蓄力大招：選『防禦』……）」「（魔物張開了護盾！……）」這類）不再當成對話框，
   改成畫面中間跳出一個說明視窗，下面兩個按鈕：「知道了」（下次還會提醒）、「已經會了，不再顯示」（這句以後都不跳）。
   「（天賦）」「（晶石）」「（稀有）」這種開頭是標籤的戰鬥記錄不算說明，照舊顯示。記錄在存檔的 flags.tutOff16。 */
const TUT16 = { isTut: s => typeof s === 'string' && /^（[\s\S]{10,}）$/.test(s.trim()) && s.trim().indexOf('）') === s.trim().length - 1,
  key: s => s.replace(/\d+/g, '#').replace(/\s/g, '').slice(0, 40) };
function* tutPopup16(text) { const st = Game.st, f = st.flags || (st.flags = {}), off = f.tutOff16 || (f.tutOff16 = {}), k = TUT16.key(text); if (off[k]) return;
  const body = text.trim().slice(1, -1).replace(/\|/g, ''), X = 10, Y = 52, w = 156, h = 150;
  const panel = { draw(x) { x.fillStyle = 'rgba(4,6,14,0.55)'; x.fillRect(0, 0, W, H); drawWin(x, X, Y, w, h, 'menu'); Font.drawC(x, '說明', W / 2, Y + 3, UIC.accent, UIC.textSh, 10);
      x.fillStyle = UIC.accent; x.fillRect(X + 8, Y + 17, w - 16, 1); drawFitText(x, body, X + 8, Y + 22, w - 16, h - 70, 10, UIC.text); } };
  UI.push(panel); Sound.sfx('menu');
  const r = yield* choose(['知道了', '已經會了，不再顯示'], { x: X + 8, y: Y + h - 44, w: w - 16, style: 'menu' });
  UI.remove(panel); if (r === 1) { off[k] = 1; Sound.sfx('select'); } }
{ const _m = Battle.prototype.msg; Battle.prototype.msg = function* (text, o = {}) { if (TUT16.isTut(text)) return yield* tutPopup16(text); return yield* _m.call(this, text, o); }; }
