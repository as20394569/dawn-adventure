/* ===================== NPC QUESTS: commissions are taken from / handed in to the townsfolk themselves =====================
   The board only shows who needs help and where. Each NPC offers its request ("!" over the head), and you report back to them ("?"). */
Object.assign(ITEMS, { letter: { n: '花店的信', key: 1, price: 0, d: '花店姊姊寫給道路守衛的信。封口畫了一朵小花。' } }); ITEMS.letter.cat = '重要物品';
Object.assign(COMMISSIONS, {
  c13: { n: '寄不出去的信', from: '花店的姊姊', d: '想請你把一封信交給晨霧道路北邊的守衛。', deliver: ['letter', 'guard'], reward: { gold: 300, items: { potion: 2 } }, open: st => st.flags.q1 },
  c14: { n: '爺爺的藥', from: '老爺爺', d: '腰痛又犯了。請帶來藥草×3和魔力草×1。', need: { herb: 3, manaHerb: 1 }, reward: { gold: 400, items: { ether: 2 } }, open: st => st.flags.license },
  c15: { n: '小芽的收藏', from: '小芽', d: '想收集魔物的羽毛做髮飾。請帶來羽毛×3。', need: { feather: 3 }, reward: { gold: 200, items: { luckClover: 1 } }, open: st => st.flags.license },
});
const COM_GIVER = { c1: 'healer', c2: 'farmer', c3: 'elder', c4: 'traveler', c5: 'auntie', c6: 'apprentice', c7: 'herbalist', c8: 'healer', c9: 'smith', c10: 'miner', c11: 'antiquer', c12: 'elder', c13: 'florist', c14: 'grandpa', c15: 'gatekeeper' };
const NPC_WHERE = { healer: '萌芽鎮・旅店', farmer: '萌芽鎮・南邊的果園', elder: '萌芽鎮・村長家', traveler: '萌芽鎮・旅店', auntie: '萌芽鎮・池塘邊', apprentice: '萌芽鎮・村長家', herbalist: '迷霧森林', smith: '萌芽鎮・鐵匠舖前', miner: '廢棄礦坑・入口', antiquer: '萌芽鎮・旅店', florist: '萌芽鎮・花店前', grandpa: '萌芽鎮・西邊', gatekeeper: '萌芽鎮・北門', guard: '晨霧道路・北邊' };
// what each giver says when offering / thanking (their own voice)
const COM_TALK = {
  c1: ['客人一多，傷藥一下就用完了……', '你能幫我採5株藥草回來嗎？'], c2: ['電電蜂把果園的工人都螫跑了！', '幫我打倒4隻電電蜂吧。'],
  c3: ['地下水道的水晶……說不定和魔王的封印有關。', '能幫我帶3塊水晶碎片回來嗎？'], c4: ['我在迷霧森林東邊弄丟了一只銀懷錶。', '那是很重要的東西……如果找到了，請還給我。'],
  c5: ['哎呀，嘟嘟菇又把我的菜啃光了！', '年輕人，幫我打倒5隻嘟嘟菇吧。'], c6: ['我在研究會發光的草！', '能幫我找3株魔力草嗎？道路北邊、森林和水道都有。'],
  c7: ['毒孢菇的孢子讓森林的藥草都枯萎了。', '請你打倒4隻毒孢菇。'], c8: ['我想做一鍋招牌菇菇燉湯。', '需要毒孢子3個和蕈傘2個。'],
  c9: ['硬石不夠，連鐵鎚都要生鏽了。', '幫我帶6塊硬石來吧，礦坑裡的礦脈最多。'], c10: ['坑道蝠在裡面亂飛，大家都不敢進去工作。', '幫我打倒5隻坑道蝠好嗎？'],
  c11: ['我在收集古代的骨頭飾品。', '帶5塊骨片來，我會付好價錢。'], c12: ['地下墓穴的怨靈越來越多了……', '請你打倒4隻怨靈，讓亡者安息。'],
  c13: ['這封信……能幫我交給道路北邊的守衛嗎？', '我自己不太敢去……拜託了。'], c14: ['唉喲，我的腰……', '能幫我帶藥草3株和魔力草1株來嗎？'], c15: ['我想用魔物的羽毛做髮飾！', '可以幫我找3根羽毛嗎？'],
};
const COM_THANKS = { c1: '太好了，這下客人受傷也不怕了！', c2: '果園終於安靜了！', c3: '這些水晶……果然在發光。', c5: '我的菜園得救了！', c6: '好漂亮的光！研究有進展了！', c7: '森林的藥草會慢慢長回來的。', c8: '燉湯的香味出來了！下次來吃吧！', c9: '好硬石！這下能打出好劍了。', c10: '大家終於能回去工作了！', c11: '真是好東西！拿去，這是約好的報酬。', c12: '亡者們終於能安息了……', c14: '這樣腰就不痛了，謝謝你啊。', c15: '好漂亮！我會好好珍惜的！' };
// new townsfolk
MAPS.town.npcs.push({ id: 'farmer', x: 18, y: 16, dir: 'down', look: 'man', name: '果園農夫' }, { id: 'auntie', x: 8, y: 18, dir: 'left', look: 'woman', name: '菜園大嬸' });
MAPS.inn.npcs.push({ id: 'antiquer', x: 2, y: 5, dir: 'right', look: 'clerk', name: '古董商' });
MAPS.mine.npcs = MAPS.mine.npcs || []; MAPS.mine.npcs.push({ id: 'miner', x: 1, y: 15, dir: 'right', look: 'old', name: '老礦工' });
NPC_ROLES.任務.push('farmer', 'auntie', 'miner', 'antiquer');

function comAvail(k, st = Game.st) { return !comState(k, st) && COMMISSIONS[k].open(st); }
function npcQuestState(id, st = Game.st) { // '!' new request · '?' ready to report · null
  if (!st.flags || !st.flags.license) return null; let m = null;
  for (const k in COM_GIVER) { const c = COMMISSIONS[k], s = comState(k, st); if (!c) continue;
    if (c.deliver && s && s.s === 'on' && c.deliver[1] === id) return '?';
    if (COM_GIVER[k] !== id) continue; if (s && s.s === 'on' && !c.deliver && comProgress(k, st).ready) return '?'; if (comAvail(k, st)) m = '!'; }
  return m;
}
function npcCommission(id, ow, ent) {
  const st = Game.st; if (!st.flags || !st.flags.license) return null; st.com = st.com || {};
  // delivery target
  for (const k in COMMISSIONS) { const c = COMMISSIONS[k], s = comState(k, st); if (c.deliver && s && s.s === 'on' && c.deliver[1] === id) return (function* () {
    delete st.bag[c.deliver[0]]; s.s = 'done'; yield* say('把「' + ITEMS[c.deliver[0]].n + '」交給了' + (ent && ent.name || '對方') + '。');
    yield* sayAll(['……這是花店的她寫的？', '（守衛的臉一下子紅了起來。）', '謝、謝謝你特地送來。這是一點心意。']); yield* giveReward(c.reward); })(); }
  // antique dealer buys the silver watch
  if (id === 'antiquer' && st.bag.pocketWatch && (comState('c4', st) || {}).s === 'on') return (function* () {
    yield* say('喔？你手上那只懷錶……是王都鐘塔的工藝！');
    if ((yield* ask('要把銀懷錶賣給古董商嗎？（1500 G）', ['賣掉', '不賣'])) !== 0) { yield* say('可惜啊。改變主意隨時來找我。'); return; }
    delete st.bag.pocketWatch; st.com.c4.s = 'done'; st.com.c4.res = 'sold'; st.money += 1500; yield* itemGet(st.name + '把懷錶賣了1500 G。'); yield* say('……不過，失主應該還在找它吧。'); })();
  const mine = Object.keys(COM_GIVER).filter(k => COM_GIVER[k] === id && COMMISSIONS[k]);
  // report a finished request
  for (const k of mine) { const c = COMMISSIONS[k], s = comState(k, st); if (!s || s.s !== 'on' || c.deliver || !comProgress(k, st).ready) continue;
    return (function* () {
      if (k === 'c4') { delete st.bag.pocketWatch; s.s = 'done'; s.res = 'returned'; yield* sayAll(['這是……我的懷錶！', '它是鐘塔的鑰匙錶，停在三點十分——異界之門開啟的那一刻。', '若你來到王都，請到鐘塔找我。我叫艾德。']); yield* giveReward(c.reward); return; }
      if (c.need) for (const i in c.need) st.bag[i] -= c.need[i];
      s.s = 'done'; Sound.sfx('select'); yield* say(COM_THANKS[k] || '謝謝你！'); yield* say('完成了委託「' + c.n + '」！'); yield* giveReward(c.reward); })();
  }
  // offer a new request
  const k = mine.find(q => comAvail(q, st)); if (!k) return null; const c = COMMISSIONS[k];
  return (function* () {
    yield* sayAll(COM_TALK[k] || [c.d]); yield* comHintSay(c); yield* say('報酬：' + rewardText(c.reward));
    if (!(yield* yesNo('要接下「' + c.n + '」嗎？'))) { yield* say('這樣啊……有空的話再來找我吧。'); return; }
    st.com[k] = { s: 'on', k: c.kill ? (((st.dex || {})[c.kill[0]] || {}).won || 0) : 0 };
    if (c.deliver) st.bag[c.deliver[0]] = 1;
    Sound.sfx('select'); yield* say('接下了「' + c.n + '」！' + (c.deliver ? '\n得到了「' + ITEMS[c.deliver[0]].n + '」。' : '（「狀態→任務」按A可以看進度和取得地點）'));
  })();
}
// deliveries count as "ready" once accepted (the target NPC completes them)
{ const _cp = comProgress; comProgress = function (id, st = Game.st) { const c = COMMISSIONS[id]; if (c && c.deliver) { const s = comState(id, st) || {}; return { cur: s.s === 'done' ? 1 : 0, max: 1, ready: false }; } return _cp(id, st); }; }
// the board is now a notice board: who needs help and where
Events.board = function* () {
  const st = Game.st; yield* say('「萌芽鎮告示板」\n鎮民的請求。直接去找委託人就能接下。', { style: 'sign' });
  while (true) {
    const ids = Object.keys(COMMISSIONS).filter(k => COMMISSIONS[k].open(st) && COM_GIVER[k]);
    const opts = ids.map(k => { const s = comState(k, st), p = comProgress(k, st); return { t: COMMISSIONS[k].n, r: !s ? '未接' : s.s === 'done' ? '完成' : p.ready ? '可回報' : '進行中', col: !s ? UIC.accent : s.s === 'done' ? UIC.dis : p.ready ? UIC.warm : UIC.text }; });
    const r = yield* ask('要看哪一張？', opts.concat(['離開'])); if (r < 0 || r >= ids.length) return;
    const k = ids[r], c = COMMISSIONS[k], g = COM_GIVER[k];
    yield* say('委託人：' + c.from + '（' + (NPC_WHERE[g] || '？') + '）\n' + c.d); yield* comHintSay(c); yield* say('報酬：' + rewardText(c.reward));
  }
};
Object.assign(Events, {
  *farmer() { yield* say(Game.st.flags.license ? '這片果園的蘋果，是萌芽鎮最甜的喔。' : '你是……新來的？'); },
  *auntie() { yield* say('種菜最重要的就是耐心。還有，要提防嘟嘟菇！'); },
  *miner() { yield* sayAll(['我在這座礦坑挖了四十年的礦。', '礦脈上閃閃發亮的地方，偶爾能挖到水晶喔。']); },
  *antiquer() { yield* say('古老的東西都有故事。你身上有沒有什麼稀奇的寶貝？'); },
});
// quest-list text points to the giver instead of the board
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); for (const q of L) if (q.n.startsWith('委託：')) { const k = Object.keys(COMMISSIONS).find(k => '委託：' + COMMISSIONS[k].n === q.n); if (!k) continue; const c = COMMISSIONS[k]; q.t = c.d + (c.deliver ? '（交給' + (NPC_WHERE[c.deliver[1]] || '') + '的守衛）' : '（' + comProgress(k, st).cur + '/' + comProgress(k, st).max + '）') + (comProgress(k, st).ready ? '→ 回去找' + c.from + '（' + (NPC_WHERE[COM_GIVER[k]] || '') + '）' : ''); q.n = '委託：' + c.n; } }; }
// field markers over NPCs: ! = new request, ? = ready to report (drawn with the NPC itself, so they use the exact same camera)
{ const _dc = Overworld.prototype.drawChar; Overworld.prototype.drawChar = function (x, e, frames, camX, camY) {
  _dc.call(this, x, e, frames, camX, camY); if (e === this.p || !this.npcs.includes(e)) return; const m = npcQuestState(e.id); if (!m) return;
  const X = Math.round(e.px - camX) + 5, Y = Math.round(e.py - camY) - 13;
  x.fillStyle = '#10121e'; x.fillRect(X - 1, Y - 1, 8, 11); x.fillStyle = m === '!' ? '#ffcf5a' : '#6ee7d2'; x.fillRect(X, Y, 6, 9); Font.drawC(x, m, X + 3, Y - 2, '#10121e', null, 9);
}; }
