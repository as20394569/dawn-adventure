/* ===================== v12.51 存檔備份 =====================
   網頁版的存檔放在瀏覽器裡：清掉網站資料、換手機、iPhone 的 Safari 太久沒開（約 7 天）都可能不見。
   → 標題畫面「存檔備份」：把一個欄位的存檔變成一段代碼（可以複製、下載成檔案），或貼上代碼／選檔案放回某個欄位。
   代碼格式：DAWN1:<gzip 後的 base64>（瀏覽器沒有壓縮功能時用 DAWN0:<base64>）。 */
const BK13 = { pfx1: 'DAWN1:', pfx0: 'DAWN0:' };
const u8ToB64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const b64ToU8 = b64 => { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
async function bkEncode13(obj) { const json = JSON.stringify(obj), bytes = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'function') { const cs = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')); const buf = new Uint8Array(await new Response(cs).arrayBuffer()); return BK13.pfx1 + u8ToB64(buf); }
  return BK13.pfx0 + u8ToB64(bytes); }
async function bkDecode13(code) { code = String(code || '').replace(/\s+/g, '');
  let bytes; if (code.startsWith(BK13.pfx1)) { if (typeof DecompressionStream !== 'function') throw new Error('這個瀏覽器不能讀壓縮的代碼'); const ds = new Blob([b64ToU8(code.slice(BK13.pfx1.length))]).stream().pipeThrough(new DecompressionStream('gzip')); bytes = new Uint8Array(await new Response(ds).arrayBuffer()); }
  else if (code.startsWith(BK13.pfx0)) bytes = b64ToU8(code.slice(BK13.pfx0.length)); else throw new Error('不是曙光冒險的存檔代碼');
  const st = JSON.parse(new TextDecoder().decode(bytes)); if (!st || typeof st !== 'object' || !st.name || !st.lv || !st.map) throw new Error('代碼裡沒有存檔'); return st; }
// wait for a promise inside a generator
function* bkAwait13(p) { let done = false, val, err; p.then(v => { val = v; done = true; }, e => { err = e; done = true; }); while (!done) yield; if (err) throw err; return val; }
// a small DOM panel over the game (the canvas UI has no text field)
function bkPanel13(title, opt) { const wrap = document.createElement('div'); wrap.setAttribute('style', 'position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:rgba(5,6,12,.78);padding:16px;font-family:var(--pix,sans-serif)');
  const box = document.createElement('div'); box.setAttribute('style', 'width:min(420px,100%);background:#141a30;border:1px solid #3a4262;border-radius:8px;padding:14px;color:#eef1f8;display:flex;flex-direction:column;gap:10px');
  const h = document.createElement('div'); h.textContent = title; h.setAttribute('style', 'font-size:16px;color:#ffc46b'); box.appendChild(h);
  if (opt.note) { const n = document.createElement('div'); n.textContent = opt.note; n.setAttribute('style', 'font-size:12px;color:#8a93b3;line-height:1.5'); box.appendChild(n); }
  const ta = document.createElement('textarea'); ta.value = opt.text || ''; ta.readOnly = !!opt.readOnly; ta.placeholder = opt.placeholder || ''; ta.setAttribute('style', 'width:100%;height:140px;box-sizing:border-box;background:#0d1020;color:#cfe;border:1px solid #3a4262;border-radius:4px;font-size:11px;padding:6px;word-break:break-all;-webkit-user-select:text;user-select:text'); box.appendChild(ta);
  const msg = document.createElement('div'); msg.setAttribute('style', 'font-size:12px;color:#6ee7d2;min-height:16px'); box.appendChild(msg);
  const row = document.createElement('div'); row.setAttribute('style', 'display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end'); box.appendChild(row);
  const res = { done: false, value: null, ta, msg, close() { wrap.remove(); this.done = true; } };
  for (const [label, fn] of opt.buttons) { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.setAttribute('style', 'font-size:14px;padding:8px 14px;border-radius:6px;border:1px solid #3a4262;background:#1f2747;color:#eef1f8;cursor:pointer'); b.onclick = () => fn(res); row.appendChild(b); }
  for (const ev of ['keydown', 'keyup']) wrap.addEventListener(ev, e => e.stopPropagation()); // the game's window handlers would swallow Backspace, Space, arrows … in the text box
  wrap.appendChild(box); document.body.appendChild(wrap); Input.clearAll(); return res; }

function* bkExport13(n) { const st = slotLoad13(n); if (!st) { yield* say('「存檔 ' + n + '」是空的。'); return; }
  let code; try { code = yield* bkAwait13(bkEncode13(st)); } catch (e) { yield* say('做不出代碼……（' + e.message + '）'); return; }
  const P = bkPanel13('存檔 ' + n + '：' + st.name + ' Lv' + st.lv, { text: code, readOnly: true, note: '把這段代碼存在安全的地方（例如備忘錄）。之後在「存檔備份→貼上代碼」放回來，就能接著玩。',
    buttons: [['複製', r => { const ok = () => { r.msg.textContent = '複製好了！'; }; const fb = () => { try { r.ta.select(); document.execCommand('copy'); ok(); } catch (e) { r.msg.textContent = '請長按代碼，全選後複製。'; } };
        try { navigator.clipboard.writeText(code).then(ok, fb); } catch (e) { fb(); } }],
      ['下載檔案', r => { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' })); a.download = 'dawn_save_' + n + '.txt'; document.body.appendChild(a); a.click(); a.remove(); r.msg.textContent = '已經開始下載。'; } catch (e) { r.msg.textContent = '這裡不能下載，請改用「複製」。'; } }],
      ['關閉', r => r.close()]] });
  while (!P.done) yield; Input.clearAll(); }
function* bkImport13(n) { let st = null;
  const P = bkPanel13('貼上存檔代碼（放進「存檔 ' + n + '」）', { placeholder: 'DAWN1:……', note: '貼上之前備份的代碼，或選擇下載的存檔檔案。',
    buttons: [['選擇檔案', r => { const f = document.createElement('input'); f.type = 'file'; f.accept = '.txt,text/plain'; f.onchange = () => { const file = f.files && f.files[0]; if (!file) return; file.text().then(t => { r.ta.value = t.trim(); r.msg.textContent = '讀進來了，按「讀取」。'; }, () => { r.msg.textContent = '讀不到這個檔案。'; }); }; f.click(); }],
      ['讀取', r => { r.msg.textContent = '讀取中……'; bkDecode13(r.ta.value).then(v => { st = v; r.close(); }, e => { r.msg.textContent = '讀不出來：' + e.message; }); }],
      ['取消', r => r.close()]] });
  while (!P.done) yield; Input.clearAll(); if (!st) return false;
  const old = slotLoad13(n); if (!(yield* yesNo('讀到了：' + st.name + ' Lv' + st.lv + '（' + ((MAPS[st.map] || {}).name || '') + '）\n要放進「存檔 ' + n + '」嗎？' + (old ? '\n（會蓋掉 ' + old.name + ' Lv' + old.lv + '）' : '')))) return false;
  try { localStorage.setItem(slotKey13(n), JSON.stringify(st)); } catch (e) { yield* say('存不進去……（瀏覽器的儲存空間不能用）'); return false; }
  Sound.sfx('save'); yield* say('放進「存檔 ' + n + '」了！'); return true; }
function* backupScreen13() {
  while (true) { const r = yield* ask('存檔備份：瀏覽器的資料被清掉時，存檔也會跟著不見。定期備份比較安心。', ['複製存檔代碼', '貼上存檔代碼', '返回']);
    if (r === 0) { const n = yield* pickSlot13('要備份哪一個存檔？', 'load'); if (n) yield* bkExport13(n); }
    else if (r === 1) { const n = yield* pickSlot13('要放進哪一個欄位？', 'new'); if (n) yield* bkImport13(n); }
    else return; } }
