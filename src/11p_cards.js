/* ===================== v12.49 王都的翻牌遊戲 =====================
   王都南邊廣場的「遊戲屋的米菈」：一次 100 G，16 張牌（8 對魔物），翻兩張一樣的就留著。翻錯 10 次就結束。
   每對 30 G；全部翻完再 +300 G。第一次全部翻完：幸運草×3、成就「翻牌高手」；翻錯 3 次以內全部翻完：稱號「過目不忘」。 */
const CARD13 = { COST: 100, PAIR: 30, CLEAR: 300, MISS: 10, CW: 36, CH: 42 };
// eight monsters for the faces: ones you have seen first, then the early ones
function cardFaces13(st = Game.st) { const seen = Object.keys(st.dex || {}).filter(k => SPECIES[k] && !SPECIES[k].boss && palImg13(k));
  const base = ['curlySheep', 'fluffSeed', 'piglet', 'hornHare', 'strawCrow', 'gustSprite', 'nightCricket', 'slime', 'bee', 'mush'].filter(k => SPECIES[k] && palImg13(k));
  const pool = [...new Set(seen.sort(() => Math.random() - 0.5).concat(base))]; return pool.slice(0, 8); }
const cardBack13 = (() => { let c = null; return () => { if (c) return c; c = mkCanvas(CARD13.CW, CARD13.CH); const x = c.getContext('2d');
  x.fillStyle = '#1c2450'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#2c3a78'; x.fillRect(2, 2, c.width - 4, c.height - 4); x.fillStyle = '#1c2450';
  for (let yy = 4; yy < c.height - 4; yy += 4) for (let xx = 4 + (yy % 8 ? 2 : 0); xx < c.width - 4; xx += 4) x.fillRect(xx, yy, 1, 1);
  x.fillStyle = '#ffd06a'; const cx = c.width / 2, cy = c.height / 2; x.fillRect(cx - 1, cy - 6, 2, 12); x.fillRect(cx - 6, cy - 1, 12, 2); x.fillRect(cx - 3, cy - 3, 6, 6); return c; }; })();
function* cardGame13() { const st = Game.st, F = cardFaces13(st); if (F.length < 8) { yield* say('（牌還沒準備好……）'); return null; }
  const deck = F.concat(F).sort(() => Math.random() - 0.5).map(sp => ({ sp, up: false, done: false })); let cur = 0, open = [], miss = 0, pairs = 0, wait = 0, end = null, t = 0;
  const X0 = Math.round((W - 4 * CARD13.CW - 3 * 4) / 2), Y0 = 38;
  const scr = { draw(x) { screenBG(x); headerBar(x, '翻牌遊戲'); t++;
      Font.draw(x, '一樣的 ' + pairs + '／8', 8, 22, UIC.warm, UIC.textSh, 10); Font.drawR(x, '翻錯 ' + miss + '／' + CARD13.MISS, W - 8, 22, miss >= CARD13.MISS - 2 ? UIC.bad : UIC.text, UIC.textSh, 10);
      deck.forEach((c, i) => { const cx = X0 + (i % 4) * (CARD13.CW + 4), cy = Y0 + Math.floor(i / 4) * (CARD13.CH + 4);
        if (c.up || c.done) { x.fillStyle = c.done ? '#e8f8ee' : '#fff6e0'; x.fillRect(cx, cy, CARD13.CW, CARD13.CH); x.fillStyle = c.done ? '#72e39a' : '#ffc46b'; x.fillRect(cx, cy, CARD13.CW, 2); x.fillRect(cx, cy + CARD13.CH - 2, CARD13.CW, 2);
          const im = palImg13(c.sp); if (im) { const s = Math.min(1.5, 30 / Math.max(im.c.width, im.c.height)); x.imageSmoothingEnabled = false; x.drawImage(im.c, Math.round(cx + CARD13.CW / 2 - im.c.width * s / 2), Math.round(cy + CARD13.CH - 6 - im.c.height * s), Math.round(im.c.width * s), Math.round(im.c.height * s)); } }
        else x.drawImage(cardBack13(), cx, cy);
        if (i === cur && !end) { x.strokeStyle = Math.floor(t / 10) % 2 ? '#6ee7d2' : '#ffffff'; x.lineWidth = 2; x.strokeRect(cx - 1, cy - 1, CARD13.CW + 2, CARD13.CH + 2); } });
      Font.drawC(x, end ? 'A 繼續' : '十字鍵選牌・A 翻開・B 不玩了', W / 2, 232, UIC.muted, UIC.textSh, 9); } };
  UI.push(scr); Input.clearAll();
  try { while (!end) { yield; Game.card13 = { deck, cur, wait }; // (tests read the table)
      if (wait > 0) { if (--wait === 0) { const [a, b] = open; if (deck[a].sp === deck[b].sp) { deck[a].done = deck[b].done = true; pairs++; Sound.sfx('item'); if (pairs === 8) end = 'clear'; } else { deck[a].up = deck[b].up = false; miss++; Sound.sfx('bump'); if (miss >= CARD13.MISS) end = 'out'; } open = []; } continue; }
      const c0 = cur % 4, r0 = Math.floor(cur / 4);
      if (Input.repeat('left') && c0 > 0) { cur--; Sound.sfx('cursor'); } if (Input.repeat('right') && c0 < 3) { cur++; Sound.sfx('cursor'); }
      if (Input.repeat('up') && r0 > 0) { cur -= 4; Sound.sfx('cursor'); } if (Input.repeat('down') && r0 < 3) { cur += 4; Sound.sfx('cursor'); }
      if (Input.pressed('b')) { Input.consume('b'); UI.remove(scr); const q = yield* yesNo('不玩了嗎？（翻到的對數照樣算）'); UI.push(scr); Input.clearAll(); if (q) end = 'quit'; continue; }
      if (Input.pressed('a')) { Input.consume('a'); const c = deck[cur]; if (c.up || c.done) { Sound.sfx('bump'); continue; } c.up = true; Sound.sfx('select'); open.push(cur); if (open.length === 2) wait = 34; } }
    for (let i = 0; i < 50; i++) yield; }
  finally { UI.remove(scr); }
  return { pairs, miss, clear: end === 'clear' }; }

Events.cards13 = function* () { const st = Game.st, f = st.flags;
  if (!f.cards13) { f.cards13 = 1; yield* sayAll(['遊戲屋的米菈：「歡迎光臨～！要不要玩翻牌？」', '米菈：「16 張牌裡有 8 對魔物。一次翻兩張，一樣的就是你的！」', '米菈：「翻錯 10 次就結束。每翻到一對 ' + CARD13.PAIR + ' G，全部翻完再加 ' + CARD13.CLEAR + ' G！」']); }
  while (true) { const r = yield* ask('米菈：「一次 ' + CARD13.COST + ' G，要玩嗎？」', ['玩一次', '規則', '不玩']);
    if (r === 1) { yield* sayAll(['米菈：「十字鍵選牌，A 翻開。」', '米菈：「翻開的兩張一樣就留著；不一樣的話會蓋回去，算翻錯一次。」', '米菈：「記住翻過的牌在哪裡，就是訣竅！」']); continue; }
    if (r !== 0) { yield* say('米菈：「下次再來喔～」'); return; }
    if (st.money < CARD13.COST) { yield* say('米菈：「哎呀，錢不夠呢。」'); return; }
    if (cardFaces13(st).length < 8) { yield* say('米菈：「牌還沒準備好……等一下再來吧。」'); return; }
    st.money -= CARD13.COST; Sound.sfx('select'); const R = yield* cardGame13(); if (!R) return;
    const g = R.pairs * CARD13.PAIR + (R.clear ? CARD13.CLEAR : 0); st.money += g; st.cards13 = st.cards13 || { best: 0, clears: 0 }; st.cards13.best = Math.max(st.cards13.best, R.pairs);
    if (R.clear) { st.cards13.clears++; if (R.miss <= 3) st.cards13.sharp = 1; }
    yield* say(R.clear ? '米菈：「全部翻完了！好厲害！」' : '米菈：「翻到了 ' + R.pairs + ' 對！」'); if (g) { Sound.jingle('item'); yield* itemGet('得到了 ' + g + ' G！'); }
    if (R.clear && !f.cards13clr) { f.cards13clr = 1; st.bag.luckClover = (st.bag.luckClover || 0) + 3; yield* say('米菈：「第一次全部翻完的人，有特別獎品喔！」'); yield* itemGet('得到了幸運草×3！'); }
    if (R.clear && R.miss <= 3 && !f.cards13sharp) { f.cards13sharp = 1; yield* say('米菈：「只翻錯 ' + R.miss + ' 次？你的記性也太好了吧！」'); yield* say('得到了稱號「過目不忘」！\n（可以在「稱號」裡裝備）'); } } };
MAPS.capital.npcs.push({ id: 'cards13', x: 21, y: 26, dir: 'down', look: 'girl', name: '遊戲屋的米菈' }); delete mapCache.capital;
NPC_ROLES.任務.push('cards13'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.cards13 = '王都・南邊的廣場';
TITLES.push({ id: 'cards13sharp', n: '過目不忘', d: '翻牌遊戲翻錯 3 次以內全部翻完。', st: { spe: 2, crit: 1 }, ok: st => !!(st.cards13 && st.cards13.sharp) });
ACHIEVEMENTS.push({ id: 'cards13_clear', n: '翻牌高手', d: '翻牌遊戲全部翻完。', cat: '探索', ok: st => !!(st.cards13 && st.cards13.clears) });
