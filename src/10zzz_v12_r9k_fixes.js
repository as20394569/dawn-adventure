/* ===================== v12.0.9k 小修正（2026-10-04） =====================
   - 吟遊詩人「狂想」（自己每得到一次能力提升，特技 +1）：特技本身給的能力提升也算進去，特技 → 提升 → 特技…一直連鎖到安全上限才停。
     現在特技給的能力提升不算。 */
COND.notInSpecial9 = (c, v) => !(c.core.evStack || []).some(e => e.type === EVT.SKILL_USE && DEF.skills[e.payload.skill] && DEF.skills[e.payload.skill].tags.includes('weapon_special')) === !!v;
{ const T = DEF.talents['bard.0.1.1']; if (T) { const m = T.make; T.make = (...a) => { const r = m(...a); return { ...r, triggers: (r.triggers || []).map(t => ({ ...t, cond: { ...(t.cond || {}), notInSpecial9: 1 } })) }; }; } }
/* - 風車丘陵的祕境「風之丘頂」：修練之書（b6w1）和中間那座風車放在同一格（39,4），被風車擋住拿不到（玩家 03:46「風車丘陵的秘境地圖物件擋住」）。
     地圖資料裡道具和物件在同一格時，道具移到最近的空格（現在只有這一個）。 */
for (const id in MAPS) { const d = MAPS[id], R = d.rows; if (!R || !d.items || !d.npcs) continue; const H = R.length, Wd = R[0].length;
  const busy = new Set([...d.npcs, ...d.items, ...(d.gathers || [])].map(e => e.x + ',' + e.y)); for (const k in d.signs || {}) busy.add(k);
  for (const it of d.items) { if (!d.npcs.some(n => n.x === it.x && n.y === it.y)) continue; let best = null;
    for (let r = 1; r < 6 && !best; r++) for (let dy = -r; dy <= r && !best; dy++) for (let dx = -r; dx <= r && !best; dx++) { const x = it.x + dx, y = it.y + dy; if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (x < 1 || y < 1 || x >= Wd - 1 || y >= H - 1 || SOLID.has(R[y][x]) || busy.has(x + ',' + y)) continue; best = [x, y]; }
    if (best) { busy.add(best[0] + ',' + best[1]); it.x = best[0]; it.y = best[1]; } } }
/* - 和 NPC 對話中開始的戰鬥（例如商人巴托的商隊戰）：戰鬥裡跳出的對話框（喝藥水的「要使用傷藥嗎？」等）會帶著那個 NPC 的頭像和名字
     （玩家 03:52「商人巴託的劇情戰鬥中 喝藥水會觸發巴託對話框」）→ 戰鬥畫面裡不套用正在對話的 NPC。 */
{ const _ds = dlgSetup; dlgSetup = function (t, o) { if (Game.talker && Game.scene && Game.scene.constructor === Battle) { const T = Game.talker; Game.talker = null; try { return _ds(t, o); } finally { Game.talker = T; } } return _ds(t, o); }; }
/* - 岩石、草叢、告示牌、看板的圖本身帶著草地底色：放在洞窟的石地板或泥土路上時，會出現一塊綠色方格（玩家 03:59「沒有去背成功?」，
     9 個洞窟的岩石、礦坑、幾個城鎮的告示牌）。→ 旁邊是石地板／泥土路時，先畫那種地板，再畫去掉草地底色的物件。 */
const NOGRASS9 = new WeakMap();
function noGrass9(img) { let c = NOGRASS9.get(img); if (c) return c; const g = Tiles.grass(0); c = mkCanvas(16, 16); const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const gc = mkCanvas(16, 16), gx = gc.getContext('2d'); gx.drawImage(g, 0, 0);
  try { const D = x.getImageData(0, 0, 16, 16), G = gx.getImageData(0, 0, 16, 16).data, a = D.data; for (let i = 0; i < a.length; i += 4) if (a[i] === G[i] && a[i + 1] === G[i + 1] && a[i + 2] === G[i + 2]) a[i + 3] = 0; x.putImageData(D, 0, 0); } catch (e) { return img; }
  NOGRASS9.set(img, c); return c; }
const FLOOR9 = new Set(['s', 'P', ':', '=']);
{ const _dt = Overworld.prototype.drawTile; Overworld.prototype.drawTile = function (x, c, tx, ty, sx, sy, f, f2) {
    if (c !== 'o' && c !== 'b' && c !== 'S' && c !== 'N') return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    const n = {}; for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { const q = this.tileAt(tx + dx, ty + dy); n[q] = (n[q] || 0) + 1; }
    const fl = Object.keys(n).filter(q => FLOOR9.has(q)).sort((a, b) => n[b] - n[a])[0], grassy = ['.', ',', 'f', 'y', '#', 'T', 't'].some(q => n[q]);
    if (!fl || (grassy && n[fl] < 2)) return _dt.call(this, x, c, tx, ty, sx, sy, f, f2);
    _dt.call(this, x, fl === '=' ? ':' : fl, tx, ty, sx, sy, f, f2);
    const img = c === 'o' ? Tiles.rock : c === 'b' ? Tiles.bush : c === 'S' ? Tiles.sign : Tiles.board; x.drawImage(noGrass9(img), sx, sy); }; }
/* - 全部的字小一點（玩家 04:06「遊戲整體自行縮小0.5倍 字型」→ 選「要全部字小一點」）：每個字級 −0.5（12 → 11.5、10 → 9.5），
     最小還是 8（第五輪定的最小字級，8 以下照舊用 8 的高度畫）。畫字、量寬度、換行都用同一個字級，所以靠右、置中、換行都對得齊。 */
const FONT_DOWN9 = 0.5;
{ const adj = z => { const s = typeof z === 'number' ? z : 12; if (Font.bz) return Font.bz(s); /* v12.87: a battle maps every size to 7・9・14 (12l) */ return s >= FONT_MIN12 + FONT_DOWN9 ? s - FONT_DOWN9 : s; };
  const _d = Font.draw, _w = Font.width, _wr = Font.wrap;
  Font.draw = (ctx, str, x, y, col, sh, size) => _d(ctx, str, x, y, col, sh, adj(size));
  Font.width = (str, size) => _w(str, adj(size));
  Font.wrap = (str, maxW, size) => _wr(str, maxW, adj(size));
  Font.drawR = (ctx, str, xr, y, col, sh, size) => Font.draw(ctx, str, xr - Font.width(String(str), size), y, col, sh, size);
  Font.drawC = (ctx, str, xc, y, col, sh, size) => Font.draw(ctx, str, xc - Font.width(String(str), size) / 2, y, col, sh, size); }
/* - 骷髏兵等「裝死」的魔物（玩家 04:14「古岩魔像的骷髏兵打贏時會有BUG」）：裝死擋下了倒地，戰鬥畫面卻照樣播了「倒下了！」、把牠從畫面拿掉，
     之後選不到目標、戰鬥卡住。英雄的「撐住」天賦也一樣會播倒地動畫。→ 被擋下（取消）的倒地不播。 */
{ const H = Battle.prototype.handlers, _d = H.DOWN; H.DOWN = function* (e, s, t, P) { if (e && e.cancelled) return; return yield* _d.call(this, e, s, t, P); }; }
