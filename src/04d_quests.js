/* ===================== QUESTS · COMMISSIONS · EXPLORATION · ACHIEVEMENTS ===================== */
// story-quest rewards
Object.assign(GEAR, {
  hunterOath: { n: '獵人的誓約', slot: 'acc', t: 3, st: { spe: 2, hp: 4 }, sp: { crit: 3 }, fx: ['fortune'], d: '見習獵人提姆的誓約之證。刻著「絕不獨自逞強」。' },
  masterBlade: { n: '名匠遺作', slot: 'weapon', t: 4, st: { atk: 12 }, sp: { hit: 5 }, fx: ['fervor'], d: '王都名匠臨終前未完成的劍，由鎮上鐵匠注入水晶之力完成。' },
});
Object.assign(ITEMS, { pocketWatch: { n: '銀懷錶', key: 1, d: '背面刻著王都鐘塔紋章的銀懷錶。指針停在三點十分。' } });

/* ---------- Commission board (委託告示板): add entries here to extend ---------- */
// need: bring items · kill: [species, n] counted from acceptance · key: find a key item
const COMMISSIONS = {
  c1: { n: '藥草告急', from: '旅店老闆娘', d: '旅店的傷藥快用完了。請帶來藥草×5。', need: { herb: 5 }, reward: { gold: 300, items: { superPotion: 2 } }, open: st => st.flags.license },
  c2: { n: '趕走電電蜂', from: '果園農夫', d: '電電蜂在道路北邊螫傷了好多人。接下委託後，擊敗電電蜂×4。', kill: ['bee', 4], reward: { gold: 400, items: { luckClover: 1 } }, open: st => st.flags.license },
  c3: { n: '晶石研究', from: '村長', d: '想研究地下水道的水晶和魔王封印的關係。請帶來水晶碎片×3。', need: { crystal: 3 }, reward: { items: { tpBook: 1 } }, open: st => st.flags.golem },
  c4: { n: '遺失的懷錶', from: '旅行者', d: '在迷霧森林東側弄丟了一只銀懷錶。找到的話，請放進委託箱。', key: 'pocketWatch', reward: { gold: 800 }, open: st => st.flags.wolf },
  c5: { n: '驅除嘟嘟菇', from: '菜園大嬸', d: '嘟嘟菇把菜園啃得亂七八糟。接下委託後，擊敗嘟嘟菇×5。', kill: ['mush', 5], reward: { gold: 250, items: { potion: 3 } }, open: st => st.flags.license },
  c6: { n: '魔力草研究', from: '魔法學徒', d: '想研究會發光的草。請帶來魔力草×3。（晨霧道路北邊、迷霧森林、地下水道都採得到）', need: { manaHerb: 3 }, reward: { gold: 400, items: { manaPotion: 3 } }, open: st => st.flags.license },
  c7: { n: '森林的毒菇', from: '藥草師', d: '毒孢菇的孢子讓森林的藥草都枯了。接下委託後，擊敗毒孢菇×4。', kill: ['thornMush', 4], reward: { gold: 600, items: { superPotion: 2 } }, open: st => st.flags.wolf },
  c8: { n: '菇菇燉湯', from: '旅店老闆娘', d: '想做招牌燉湯。請帶來毒孢子×3和蕈傘×2。', need: { spore: 3, shroomCap: 2 }, reward: { gold: 500, items: { ether: 2 } }, open: st => st.flags.wolf },
  c9: { n: '鐵匠的礦石', from: '鐵匠', d: '打鐵用的硬石不夠了。請帶來硬石×6。（廢棄礦坑的礦脈最多）', need: { stone: 6 }, reward: { gold: 700, items: { hiEther: 1 } }, open: st => st.flags.wolf },
  c10: { n: '坑道蝠騷動', from: '老礦工', d: '礦坑蝙蝠吵得礦工沒辦法回去工作。接下委託後，擊敗坑道蝠×5。', kill: ['mineBat', 5], reward: { gold: 800, items: { ether: 3 } }, open: st => st.flags.mineOpen || st.flags.bandit },
  c11: { n: '骨董收藏家', from: '古董商', d: '在收集古代的骨頭飾品。請帶來骨片×5。', need: { boneShard: 5 }, reward: { gold: 1500, items: { tpBook: 1 } }, open: st => st.flags.golem },
  c12: { n: '墓穴的亡魂', from: '村長', d: '地下墓穴的怨靈越來越多了。接下委託後，擊敗怨靈×4。', kill: ['wraith', 4], reward: { gold: 2500, items: { elixir: 2 } }, open: st => st.flags.golem },
};
const comState = (id, st = Game.st) => (st.com || {})[id];
function comProgress(id, st = Game.st) {
  const c = COMMISSIONS[id], s = comState(id, st) || {};
  if (c.need) { let cur = 0, max = 0; for (const k in c.need) { cur += Math.min(c.need[k], st.bag[k] || 0); max += c.need[k]; } return { cur, max, ready: cur >= max }; }
  if (c.kill) { const won = ((st.dex || {})[c.kill[0]] || {}).won || 0, cur = Math.min(c.kill[1], won - (s.k || 0)); return { cur, max: c.kill[1], ready: cur >= c.kill[1] }; }
  return { cur: st.bag[c.key] ? 1 : 0, max: 1, ready: !!st.bag[c.key] };
}
function rewardText(r) { const a = []; if (r.gold) a.push(r.gold + ' G'); for (const k in r.items || {}) a.push(ITEMS[k].n + (r.items[k] > 1 ? '×' + r.items[k] : '')); return a.join('、'); }
function* giveReward(r) { const st = Game.st; if (r.gold) st.money += r.gold; for (const k in r.items || {}) st.bag[k] = (st.bag[k] || 0) + r.items[k]; yield* itemGet(st.name + '得到了' + rewardText(r) + '！'); }

/* ---------- Exploration ---------- */
const EXPLORE = { town: '萌芽鎮', route: '晨霧道路', forest: '迷霧森林', sewer: '地下水道', ruins: '古岩遺跡', mine: '廢棄礦坑' };
const VIS_R = 3, visTot = {};
function visCountable(m, x, y) { const c = m.rows[y][x]; return !SOLID.has(c) && c !== 't' && !m.block.has(x + ',' + y); }
function markVis(m, x, y) {
  if (!EXPLORE[m.id]) return; const st = Game.st; st.vis = st.vis || {};
  let s = st.vis[m.id]; if (!s || s.length !== m.w * m.h) s = '0'.repeat(m.w * m.h);
  let a = null;
  for (let dy = -VIS_R; dy <= VIS_R; dy++) for (let dx = -VIS_R; dx <= VIS_R; dx++) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= m.w || Y >= m.h) continue; const i = Y * m.w + X; if (s[i] !== '1') { a = a || s.split(''); a[i] = '1'; } }
  if (a) st.vis[m.id] = a.join(''); else if (!st.vis[m.id]) st.vis[m.id] = s;
}
function mapPct(id, st = Game.st) {
  if (!MAPS[id]) return 0; const m = getMap(id), s = (st.vis || {})[id] || ''; let tot = 0, got = 0;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (visCountable(m, x, y)) { tot++; if (s[y * m.w + x] === '1') got++; }
  visTot[id] = tot; return tot ? got / tot : 0;
}
function totalPct(st = Game.st) { let tot = 0, got = 0; for (const id in EXPLORE) { if (!MAPS[id]) continue; const p = mapPct(id, st); tot += visTot[id]; got += p * visTot[id]; } return tot ? got / tot : 0; }

/* ---------- Achievements (each gives 200 G) ---------- */
const ACHIEVEMENTS = [
  { id: 'win1', n: '第一場勝利', d: '第一次打倒魔物。', ok: st => (st.wins || 0) >= 1 },
  { id: 'win100', n: '百戰錬磨', d: '累計戰鬥勝利100次。', ok: st => (st.wins || 0) >= 100 },
  { id: 'elite', n: '精英獵人', d: '打倒道路與森林的4隻精英魔物。', ok: st => ['wolf', 'flower', 'croc', 'mossGiant'].every(k => st.flags[k]) },
  { id: 'golem', n: '遺跡的守護者', d: '打倒古岩魔像。', ok: st => st.flags.golem },
  { id: 'crystal', n: '深淵之光', d: '打倒隱藏頭目水晶魔像。', ok: st => st.flags.crystalBoss },
  { id: 'bandit', n: '礦坑的清算', d: '打倒盜賊頭目「鐵斧」格倫。', ok: st => st.flags.bandit },
  { id: 'dex', n: '魔物學者', d: '圖鑑收集率達到80%。', ok: st => Object.keys(SPECIES).filter(k => st.dex && st.dex[k] && st.dex[k].seen).length >= Object.keys(SPECIES).length * 0.8 },
  { id: 'explore', n: '地圖繪製者', d: '總探索度達到90%。', ok: st => totalPct(st) >= 0.9 },
  { id: 'rich', n: '腰纏萬貫', d: '同時持有10000 G。', ok: st => st.money >= 10000 },
  { id: 'enh5', n: '千錘百鍊', d: '把一件裝備強化到+5。', ok: st => (st.gear || []).some(g => (g.e || 0) >= 5) },
  { id: 'gold', n: '金色傳說', d: '得到一件金色品質的裝備。', ok: st => (st.gear || []).some(g => g.q === 4) },
  { id: 'com', n: '萌芽鎮的好幫手', d: '完成告示板上的所有委託。', ok: st => Object.keys(COMMISSIONS).every(k => (comState(k, st) || {}).s === 'done') },
  { id: 'story', n: '故事的見證人', d: '完成所有支線故事。', ok: st => st.flags.q1done && st.flags.q2done && st.flags.q3res && st.flags.caravan === 'saved' },
  { id: 'cls2', n: '更高的道路', d: '轉職為進階職業。', ok: st => st.cls && CLASSES[st.cls] && CLASSES[st.cls].tier >= 2 },
  { id: 'lv20', n: '異界的強者', d: '等級達到20。', ok: st => st.lv >= 20 },
];
function checkAch() {
  const st = Game.st; if (!st) return; st.ach = st.ach || {};
  for (const a of ACHIEVEMENTS) if (!st.ach[a.id] && a.ok(st)) { st.ach[a.id] = 1; st.money += 200; (Game.toastQ = Game.toastQ || []).push({ n: a.n, t: 0 }); }
}
function drawToast(x) {
  const q = Game.toastQ; if (!q || !q.length || UI.stack.length || !(Game.scene instanceof Overworld)) return; const T = q[0]; if (T.t === 0) Sound.sfx('save'); T.t++;
  const y = T.t < 14 ? -30 + T.t * 2.4 : T.t > 150 ? 4 - (T.t - 150) * 2.4 : 4; const w = 150, X = (W - w) / 2, Y = Math.round(y);
  drawPanel(x, X, Y, w, 28, null); x.fillStyle = UIC.warm; x.fillRect(X + 4, Y + 4, 2, 20);
  Font.draw(x, '★ 成就解鎖　+200 G', X + 10, Y + 1, UIC.warm, UIC.textSh, 10); Font.draw(x, T.n, X + 10, Y + 13, UIC.text, UIC.textSh, 11);
  if (T.t > 164) q.shift();
}

/* ---------- Quest markers on the map ---------- */
function questMarks(st = Game.st) {
  const f = st.flags, M = [];
  if (!f.license) M.push(['town', 15, 6]); else if (!f.golem) M.push(['ruins', 7, 3]);
  if (f.q1 && !f.q1res) M.push(['route', 3, 31]); if (f.q1res && !f.q1done) M.push(['town', 16, 16]);
  if (f.q2 && !f.q2res) M.push(['forest', 3, 15]); if (f.q2res === 'stay' && !f.q2done) M.push(['forest', f.mossGiant ? 3 : 4, f.mossGiant ? 15 : 17]); if (f.q2res === 'home' && !f.q2done) M.push(['route', 12, 2]);
  if (f.q3 === 1) M.push(st.bag.crystal >= 3 ? ['town', 13, 16] : ['sewer', 4, 6]);
  if (f.caravanMet && !f.caravan) M.push(['route', 12, 22]);
  if (f.mineOpen && !f.bandit) M.push(['mine', 9, 2]);
  if (f.golem && !f.boneKnight) M.push(st.map === 'catacomb' ? ['catacomb', 9, 3] : ['ruins', 13, 10]);
  const c4 = comState('c4', st); if (c4 && c4.s === 'on' && !st.bag.pocketWatch) M.push(['forest', 19, 9]);
  if (typeof COM_GIVER !== 'undefined') for (const id in NPC_WHERE) { if (!npcQuestState(id, st)) continue; for (const m in MAPS) for (const n of MAPS[m].npcs || []) if (n.id === id) M.push([m, n.x, n.y]); }
  return M;
}

/* ---------- Quest-log entries for the new stories ---------- */
function extraQuests(st, L) {
  const f = st.flags;
  if (f.q2) L.push({ n: '見習獵人提姆', t: !f.q2res ? '守衛的弟弟提姆一個人跑去迷霧森林，想討伐苔石巨人。' : f.q2done ? (f.q2res === 'home' ? '完成：把提姆帶回了哥哥身邊。' : '完成：和提姆並肩打倒了苔石巨人。') : f.q2res === 'home' ? '回晨霧道路北邊，告訴守衛提姆平安回家了。' : f.mossGiant ? '苔石巨人倒下了。回去找提姆吧。' : '和提姆一起打倒苔石巨人！（提姆會用弓箭支援）', done: !!f.q2done, rw: '帶他回家：1000 G＋衛兵盔／一起討伐：獵人的誓約' });
  if (f.q3) L.push({ n: '師父的遺作', t: f.q3 === 1 ? '鐵匠想完成師父的遺作。帶水晶碎片×3給他。（有' + (st.bag.crystal || 0) + '）' : f.q3res === 'take' ? '完成：收下了「名匠遺作」。' : '完成：讓鐵匠留著遺作，強化費用永久半價。', done: f.q3 === 2, rw: '名匠遺作（魔導士：名匠遺杖）或 強化費用永久半價' });
  if (f.golem) L.push({ n: '古王的墓穴', t: f.boneKnight ? '完成：打倒了守護墓室的骸骨騎士。' : '古岩遺跡的石板下出現了樓梯。地下墓穴裡有強大的亡者。（建議Lv' + MAPS.catacomb.encounters[0].table[0][1] + '以上）', done: !!f.boneKnight, rw: '骸骨騎士鎧、古王的寶藏（2000 G＋力量果實）' });
  if (f.mineOpen || f.bandit) L.push({ n: '失落的貨物', t: f.bandit ? '完成：打倒盜賊頭目「鐵斧」格倫，奪回了商隊的貨物。' : '商隊的貨物被盜賊搶走，藏進了晨霧道路東邊的廢棄礦坑。', done: !!f.bandit, rw: '格倫的戰斧（魔導士：被搶走的魔導書）、行商的謝禮' });
  for (const k in COMMISSIONS) { const s = comState(k, st); if (!s || s.s === 'done') continue; const p = comProgress(k, st); L.push({ n: '委託：' + COMMISSIONS[k].n, t: COMMISSIONS[k].d + '（' + p.cur + '/' + p.max + '）' + (p.ready ? '→ 回告示板交付' : ''), done: false, rw: rewardText(COMMISSIONS[k].reward) }); }
  const dn = Object.keys(COMMISSIONS).filter(k => (comState(k, st) || {}).s === 'done').length; if (dn) L.push({ n: '委託告示板', t: '已完成 ' + dn + '/' + Object.keys(COMMISSIONS).length + ' 件委託。', done: dn === Object.keys(COMMISSIONS).length, rw: '每件委託各有報酬（萌芽鎮告示板）' });
}

/* ---------- Events for the new stories (merged into Events) ---------- */
const QUEST_EVENTS = {
  *board() {
    const st = Game.st; st.com = st.com || {};
    yield* say('「委託告示板」\n鎮民的委託。完成後把東西放進旁邊的委託箱。', { style: 'sign' });
    while (true) {
      const ids = Object.keys(COMMISSIONS).filter(k => COMMISSIONS[k].open(st));
      const opts = ids.map(k => { const s = st.com[k], p = comProgress(k, st); return { t: COMMISSIONS[k].n, r: !s ? '新' : s.s === 'done' ? '完成' : p.ready ? '可交付' : p.cur + '/' + p.max, col: !s ? UIC.accent : s.s === 'done' ? UIC.dis : p.ready ? UIC.warm : UIC.text }; });
      const r = yield* ask('要看哪一張委託？', opts.concat(['離開']));
      if (r < 0 || r >= ids.length) return;
      const k = ids[r], c = COMMISSIONS[k], s = st.com[k];
      if (s && s.s === 'done') { yield* say('這個委託已經完成了。（委託人：' + c.from + '）'); continue; }
      yield* say('委託人：' + c.from + '\n' + c.d); yield* say('報酬：' + rewardText(c.reward));
      if (!s) { if (yield* yesNo('要接下這個委託嗎？')) { st.com[k] = { s: 'on', k: c.kill ? (((st.dex || {})[c.kill[0]] || {}).won || 0) : 0 }; Sound.sfx('select'); yield* say('接下了委託「' + c.n + '」！'); } continue; }
      const p = comProgress(k, st); if (!p.ready) { yield* say('進度：' + p.cur + '/' + p.max + '。還沒完成。'); continue; }
      if (k === 'c4') {
        const q = yield* ask('要怎麼處理銀懷錶？', ['放進委託箱', '拿去賣掉'], { cancel: false }); delete st.bag.pocketWatch; s.s = 'done';
        if (q === 1) { st.money += 1500; s.res = 'sold'; yield* itemGet(st.name + '把懷錶賣給了路過的古董商，得到1500 G。'); yield* say('……古董商說，這是王都鐘塔的鐘錶師才做得出來的東西。'); continue; }
        s.res = 'returned'; yield* giveReward(c.reward);
        yield* sayAll(['委託箱裡多了一封信：', '「謝謝你找回懷錶。它是鐘塔的鑰匙錶，停在三點十分——異界之門開啟的那一刻。」', '「若你來到王都，請到鐘塔找我。　——王都鐘錶師 艾德」']); continue;
      }
      if (c.need) for (const i in c.need) st.bag[i] -= c.need[i];
      s.s = 'done'; yield* say('完成了委託「' + c.n + '」！'); yield* giveReward(c.reward);
    }
  },
  *guard(ow) {
    const st = Game.st, f = st.flags;
    if (f.croc && !f.q2) {
      yield* sayAll(['……旅人，能拜託你一件事嗎？', '我弟弟提姆是見習獵人。他說要去迷霧森林討伐「苔石巨人」，證明自己。', '那傢伙根本不是巨人的對手……可是我不能離開崗位。']);
      if (yield* yesNo('要去迷霧森林找提姆嗎？')) { f.q2 = 1; yield* say('謝謝你！迷霧森林在道路西邊。他大概在西南邊的水池附近……'); } else yield* say('……是嗎。要是看到他，請叫他回來。');
      return;
    }
    if (f.q2 && !f.q2res) { yield* say('提姆應該在迷霧森林西南邊的水池附近……拜託你了。'); return; }
    if (f.q2res === 'home' && !f.q2done) {
      f.q2done = 1; yield* sayAll(['提姆回來了！雖然被我罵了一頓，但他說下次會等變強了再去。', '這是我當衛兵時用的頭盔，請收下。']);
      st.money += 1000; const g = makeGear('guardHelm', 2); yield* itemGet(st.name + '得到了1000 G和' + gearName(g) + '！'); return;
    }
    if (f.q2res === 'stay' && f.q2done && !f.q2thx) { f.q2thx = 1; yield* sayAll(['提姆都跟我說了。你們一起打倒了苔石巨人！', '……那傢伙已經是獨當一面的獵人了。謝謝你相信他。']); return; }
    yield* sayAll(f.golem ? ['你打倒了魔像！……魔王要復活的傳聞，是真的嗎？'] : ['前方就是古岩遺跡。魔像被瘴氣侵蝕，越來越凶暴了。', '魔像非常強大。先在泉水恢復體力，準備好道具再進去吧。', '也別忘了記錄進度！']);
  },
  *tim(ow, ent) {
    const st = Game.st, f = st.flags;
    const oath = function* () { f.q2done = 1; const g = makeGear('hunterOath', 4); yield* sayAll(['我們真的打倒它了！', '……剛才我一個人的時候，其實怕得要命。', '這是獵人出師時才能拿到的誓約之證。我想把它交給你。']); yield* itemGet(st.name + '得到了' + gearName(g) + '！'); yield* say('我要回去告訴哥哥了。下次見！'); if (ow && ent) ow.npcs = ow.npcs.filter(n => n !== ent); };
    if (f.q2res === 'stay') { if (f.mossGiant) yield* oath(); else yield* say('我會在後面用弓箭掩護你！準備好就上吧！'); return; }
    yield* sayAll(['……！是、是誰？', '哥哥叫你來的？……我才不回去。', '只要打倒那尊苔石巨人，大家就會承認我是真正的獵人了。', '……雖然剛才被它一拳打飛，腳也扭到了。']);
    const r = yield* ask('要怎麼做？', ['帶他回去', '讓他留下'], { cancel: false });
    if (r === 0) { f.q2res = 'home'; yield* sayAll(['……我知道了。逞強只會讓哥哥擔心。', '我先回去了。幫我跟哥哥說……對不起。']); if (ow && ent) ow.npcs = ow.npcs.filter(n => n !== ent); return; }
    if (!st.bag.superPotion) { yield* say('（提姆的腳傷得不輕……沒有好傷藥的話，沒辦法讓他留下。）'); return; }
    st.bag.superPotion--; f.q2res = 'stay'; yield* sayAll([st.name + '把好傷藥給了提姆。', '……腳不痛了！謝謝你！', '我們一起打倒苔石巨人吧！我會在後面用弓箭支援你！']);
    if (f.mossGiant) { yield* say('……咦？巨人已經被你打倒了？'); yield* oath(); }
  },
  *smith() {
    const st = Game.st, f = st.flags;
    if (f.golem && !f.q3) {
      f.q3 = 1; yield* sayAll(['……你打倒了古岩魔像？了不起。', '我的師父是王都有名的鐵匠。他臨終前，留下了一把沒打完的劍。', '劍身需要注入「水晶」的力量才能完成……聽說鎮上老井的地底下有水晶。', '如果找到水晶碎片，能帶三塊給我嗎？']);
    } else if (f.q3 === 1 && (st.bag.crystal || 0) >= 3 && (yield* yesNo('要把水晶碎片×3交給鐵匠嗎？'))) {
      st.bag.crystal -= 3; f.q3 = 2; yield* sayAll(['……就是這個光芒！', '等我一下！']);
      yield* fadeOut(16); for (let i = 0; i < 3; i++) { Sound.sfx('rock'); yield* wait(24); } yield* fadeIn(16);
      const mg = classGear('masterBlade') !== 'masterBlade', wn = GEAR[classGear('masterBlade')].n;
      yield* sayAll(mg ? ['……完成了。不過你是魔導士吧？', '師父的箱子底下還壓著一根沒完成的法杖，我用同樣的水晶把它也完成了。', '師父的另一件遺作「' + wn + '」。你來決定吧。'] : ['……完成了。師父的遺作「名匠遺作」。', '說實話……我很想把它留在鋪子裡，當作師父的紀念。', '但這把劍是為了真正的戰士打造的。你來決定吧。']);
      const r = yield* ask('要怎麼做？', ['收下' + wn, '讓鐵匠留著'], { cancel: false });
      if (r === 0) { f.q3res = 'take'; const g = makeGear(classGear('masterBlade'), 4); yield* itemGet(st.name + '得到了' + gearName(g) + '！'); yield* say('師父一定也會很高興。好好使用它！'); }
      else { f.q3res = 'keep'; f.smithDisc = 1; st.bag.tpBook = (st.bag.tpBook || 0) + 1; yield* sayAll(['……謝謝你。', '這是師父留下的修練書，送給你吧。以後強化的費用，我只收一半！']); yield* itemGet(st.name + '得到了天賦之書！強化費用永久半價！'); }
    } else yield* say(f.q3 === 1 ? '水晶碎片的事就拜託了。聽說在老井的地底下。' : f.smith ? '有素材就拿來吧！' : '我是鎮上的鐵匠。把魔物身上的素材帶來，我就幫你打造好東西！');
    f.smith = 1;
    while (true) { const r = yield* ask('要做什麼？', ['打造', '強化' + (f.smithDisc ? '（半價）' : ''), '分解', '離開']); if (r === 0) yield* craftScreen(); else if (r === 1) yield* enhanceFlow(); else if (r === 2) yield* salvageFlow(); else break; }
    yield* say('隨時再來！');
  },
};

/* ---------- Records screen: explored map + achievements ---------- */
const MINI_COL = { T: '#17301e', t: '#17301e', '.': '#3f7a36', ',': '#3f7a36', f: '#4a8a3c', y: '#4a8a3c', '#': '#255a26', ':': '#b09a6a', '=': '#9a7a4a', W: '#2f5aa8', Y: '#6ac8f0', L: '#5a7a30', o: '#7a746a', R: '#3a3444', s: '#7a7280', P: '#9a92a0', m: '#6a7a60', X: '#07070c', S: '#a07848', N: '#c09050', U: '#8a8a98', F: '#7a5a38', b: '#2f6a2c', k: '#5a4a40' };
function drawMiniMap(x, id, X0, Y0, maxW, maxH, st) {
  const m = getMap(id), s = (st.vis || {})[id] || '', sc = Math.max(1, Math.floor(Math.min(maxW / m.w, maxH / m.h)));
  const ox = X0 + Math.floor((maxW - m.w * sc) / 2), oy = Y0 + Math.floor((maxH - m.h * sc) / 2);
  x.fillStyle = '#05060c'; x.fillRect(ox - 1, oy - 1, m.w * sc + 2, m.h * sc + 2);
  for (let y = 0; y < m.h; y++) for (let xx = 0; xx < m.w; xx++) {
    const seen = s[y * m.w + xx] === '1'; const c = m.rows[y][xx];
    const k = xx + ',' + y; x.fillStyle = !seen ? '#1a1f38' : m.doors[k] ? '#e8c070' : m.block.has(k) ? '#8a4a3a' : MINI_COL[c] || '#3f7a36';
    x.fillRect(ox + xx * sc, oy + y * sc, sc, sc);
  }
  const blink = Math.floor(Game.frame / 16) % 2;
  for (const [mid, qx, qy] of questMarks(st)) if (mid === id) { x.fillStyle = blink ? UIC.warm : '#fff2c0'; const cx = ox + qx * sc + sc / 2, cy = oy + qy * sc + sc / 2; x.beginPath(); x.moveTo(cx, cy - 4); x.lineTo(cx + 3, cy); x.lineTo(cx, cy + 4); x.lineTo(cx - 3, cy); x.fill(); }
  if (st.map === id && blink) { x.fillStyle = '#ffffff'; x.fillRect(ox + st.x * sc - 1, oy + st.y * sc - 1, sc + 2, sc + 2); x.fillStyle = UIC.accent; x.fillRect(ox + st.x * sc, oy + st.y * sc, sc, sc); }
}
function* recordScreen() {
  const st = Game.st; let tab = 0, top = 0; const maps = Object.keys(EXPLORE).filter(k => MAPS[k] && st.vis && st.vis[k]); let mi = Math.max(0, maps.indexOf(st.map)); const VIS = 8;
  checkAch();
  const scr = { draw(x) {
    screenBG(x); headerBar(x, tab ? '成就' : '探索地圖'); Font.drawR(x, '← ' + (tab + 1) + '/2 →', W - 6, 2, UIC.muted, UIC.textSh);
    if (!tab) {
      const id = maps[mi]; drawWin(x, 4, 24, 168, 200, 'menu');
      if (!id) { Font.draw(x, '還沒有探索過任何地方。', 14, 30, UIC.muted, UIC.textSh); return; }
      Font.draw(x, EXPLORE[id] + (MAPS[id].type ? '・' + MAPS[id].type : ''), 12, 26, UIC.accent, UIC.textSh); if (maps.length > 1) Font.drawR(x, '↑↓ 切換地區', 166, 27, UIC.muted, UIC.textSh, 10);
      drawMiniMap(x, id, 8, 44, 160, 176, st);
      drawWin(x, 4, 226, 168, 26, 'menu'); Font.draw(x, '探索度 ' + Math.round(mapPct(id) * 100) + '%', 12, 230, UIC.text, UIC.textSh); Font.drawR(x, '總探索度 ' + Math.round(totalPct() * 100) + '%', 166, 230, UIC.warm, UIC.textSh);
    } else {
      const A = ACHIEVEMENTS, got = A.filter(a => (st.ach || {})[a.id]).length; drawWin(x, 4, 24, 168, 228, 'menu'); Font.draw(x, '已解鎖 ' + got + '/' + A.length, 12, 26, UIC.warm, UIC.textSh); Font.drawR(x, '每個成就 +200 G', 166, 27, UIC.muted, UIC.textSh, 10);
      A.slice(top, top + VIS).forEach((a, i) => { const Y = 44 + i * 23, on = (st.ach || {})[a.id]; x.fillStyle = on ? 'rgba(255,196,77,0.10)' : 'rgba(255,255,255,0.03)'; x.fillRect(8, Y, 160, 21);
        Font.draw(x, on ? '★' : '☆', 12, Y, on ? UIC.warm : UIC.dis, UIC.textSh); Font.draw(x, a.n, 26, Y - 1, on ? UIC.text : UIC.muted, UIC.textSh, 11); Font.drawR(x, a.cat || '', 164, Y - 1, on ? UIC.warm : UIC.dis, UIC.textSh, 9); Font.draw(x, a.d, 26, Y + 10, on ? UIC.muted : UIC.dis, UIC.textSh, 9); });
      if (top > 0) x.drawImage(UPARROW, 86, 40); if (top + VIS < A.length) x.drawImage(DOWNARROW, 86, 244);
    }
  } };
  UI.push(scr);
  while (true) {
    if (Input.pressed('left') || Input.pressed('right')) { tab = 1 - tab; Sound.sfx('cursor'); }
    if (Input.repeat('up')) { if (tab) top = Math.max(0, top - 1); else if (maps.length) mi = (mi + maps.length - 1) % maps.length; Sound.sfx('cursor'); }
    if (Input.repeat('down')) { if (tab) top = Math.min(Math.max(0, ACHIEVEMENTS.length - VIS), top + 1); else if (maps.length) mi = (mi + 1) % maps.length; Sound.sfx('cursor'); }
    if (Input.pressed('b') || Input.pressed('a')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; }
    yield;
  }
  UI.remove(scr);
}
