/* ===================== v12.0.1 NPC 在任務結束後的位置與對話（玩家：「NPC的對話和任務結束後位置修正」） =====================
   An audit of every quest NPC (show conditions × completion flags × talk branches). The fixes that are data live here; the
   talk lines were changed where they are written (08_main, 08c, 09c, 09zc, 09zw…), and 08e now rebuilds the map right after
   an elite's win event so the NPCs move at once (漢斯 getting up on the hill, 格倫 breaking camp). */
const npcDef12 = (map, id) => MAPS[map] && (MAPS[map].npcs || []).find(n => n.id === id);
function npcShow12(map, id, f) { const n = npcDef12(map, id); if (!n) { console.warn('npcfix: no', map, id); return; } const old = n.show;
  n.show = st => f(st, old ? !!old(st) : true); if (typeof mapCache !== 'undefined') delete mapCache[map]; }
const ch2n = st => (st.flags && st.flags.ch2) || 0;

/* ---------- one person, one place ---------- */
// 諾拉 is in the capital (諾拉的麵包) from chapter 2 step 3 — not also at home
npcShow12('millHouse', 'noraHome', (st, o) => o && !(st.flags.creekQ === 3 && ch2n(st) >= 3));
// 莉婭 guards the fortress gate at steps 7–8 — not also in the capital
npcShow12('capital', 'liaCap', (st, o) => o && ch2n(st) < 7);
// 格倫 (trusted): goes ahead to camp at the old battlefield, and after 黑羽 goes back to rebuild the pass station
npcShow12('maplePass', 'grenPass', st => !st.flags.grenMet || !st.flags.grenTrust || !!st.flags.grenNorth);
npcShow12('oldField', 'grenCamp', st => !!st.flags.grenTrust && (st.flags.passQ || 0) >= 1 && !st.flags.passDone);
// 小麥 (kept secret): once he has told his sister (the florist's epilogue), he trains openly — no longer hiding on the road
npcShow12('route', 'lostBoy', (st, o) => o && !(st.ep && st.ep.florist1));
// 露比 walked home out of the swamp
npcShow12('swamp', 'ruby', (st, o) => o && ((st.ev || {}).ruby || 0) < 3);

/* ---------- people who said they would be somewhere ---------- */
// 米拉: 「我這就回森林去跟爺爺報平安」
NPC_ROLES.任務.push('miraForest'); if (typeof NPC_WHERE !== 'undefined') NPC_WHERE.miraForest = '迷霧森林';
MAPS.forest.npcs.push({ id: 'miraForest', x: 20, y: 4, dir: 'left', look: 'apprentice', name: '學徒米拉', show: st => (st.flags.qMira || 0) >= 2 }); delete mapCache.forest;
Events.miraForest = function* () { const f = Game.st.flags;
  yield* say(f.witchFate ? '米拉：「爺爺說，沼澤的魔女是他的師妹……下次我想跟她學調藥！」' : (f.qMira || 0) >= 3 ? '米拉：「上次真的謝謝你！我現在只在白天去沼澤採藥了。」' : '米拉：「我平安回來了！爺爺在那邊，快去跟他說吧。」'); };
// c16 月露收集 and c17 湖蜥的騷動 had nobody to give them: the lake hermit, and a fisher by the town pond
COM_GIVER.c16 = 'hermit'; COM_GIVER.c17 = 'fisher';
MAPS.town.npcs.push({ id: 'fisher', x: 6, y: 17, dir: 'left', look: 'man', name: '漁夫' }); delete mapCache.town;
Object.assign(NPC_WHERE, { fisher: '萌芽鎮・池塘邊', hermit: NPC_WHERE.hermit || '銀月湖畔' }); NPC_ROLES.任務.push('fisher');
Events.fisher = function* () { const st = Game.st, s = comState('c17', st) || {};
  yield* say(s.s === 'done' ? '漁夫：「女兒補的網，現在每天都撈得滿滿的！」' : s.s === 'on' ? '漁夫：「湖蜥戰士在銀月湖那邊……拜託你了。」' : '漁夫：「這個池塘的魚太小了。我平常都去銀月湖撒網。」'); };

/* ---------- a declined request no longer takes over the NPC ----------
   Saying 否 used to store nothing, so the same offer came back on every talk and the smith's menu, the inn, the elder's class
   change… were out of reach. Now a declined request waits: talking gives 「聊天／委託」, and 聊天 is the NPC's own talk.
   A story step waiting on the same NPC (its head mark) also goes before a new request: the elder's 黑色結晶 report used to wait
   behind 晶石研究. */
{ const _ca = comAvail; let hideNo = false, hideAll = false;
  comAvail = function (k, st = Game.st) { if (hideAll || (hideNo && st && st.comNo && st.comNo[k])) return false; return _ca(k, st); };
  const _nc = npcCommission; npcCommission = function (id, ow, ent) {
    const st = Game.st, story = !!(st && typeof STORY_MARKS !== 'undefined' && STORY_MARKS[id] && STORY_MARKS[id](st));
    hideNo = true; hideAll = story; let g; try { g = _nc(id, ow, ent); } finally { hideNo = false; hideAll = false; } if (g || story) return g || null;
    const k = st && st.comNo && Object.keys(COM_GIVER).find(q => COM_GIVER[q] === id && COMMISSIONS[q] && st.comNo[q] && comAvail(q, st)); if (!k) return null;
    const ev = Events[id]; if (!ev) { delete st.comNo[k]; return _nc(id, ow, ent); }
    return (function* () { const r = yield* ask((ent && ent.name) || '要做什麼？', ['聊天', '委託「' + COMMISSIONS[k].n + '」']);
      if (r === 1) { delete st.comNo[k]; const g2 = _nc(id, ow, ent); if (g2) yield* g2; } else if (r === 0) yield* ev(ow, ent); })();
  }; }

/* ---------- 莉婭: the pendant and the 黑羽 report can be handed in wherever she is (fortress gate, castle) ---------- */
function* liaPendant12() { const st = Game.st, f = st.flags; f.captainQ = 2;
  yield* sayAll(['莉婭：「……這個吊墜。」', '莉婭：「裡面的畫……是小時候的我。父親一直把它帶在身上。」', '莉婭：「這把劍，你留著吧。父親一定也希望它繼續守護別人。」']);
  st.bag.elixir = (st.bag.elixir || 0) + 3; yield* itemGet(st.name + '得到了萬靈藥×3！'); }
{ const _lf = Events.liaFort; Events.liaFort = function* (ow, ent) { const st = Game.st, f = st.flags;
    if (!f.liaFort1 && f.duskCaptain) { f.liaFort1 = 1; yield* sayAll(['莉婭：「……終於追上你了。」', '莉婭：「騎士團長命令我守住這裡——勇者的退路，由我來保護。」']); } // the knight is already freed: she doesn't ask for it any more
    if (f.captainQ === 1) yield* liaPendant12();
    if (f.blackFeather && f.liaQuest === 1) { yield* Events.liaCap(ow, ent); return; }
    yield* _lf.call(this, ow, ent); }; }
{ const _lc = Events.liaCastle; Events.liaCastle = function* (ow, ent) { const f = Game.st.flags;
    if (f.captainQ === 1) { yield* liaPendant12(); return; }
    if (f.blackFeather && f.liaQuest === 1) { yield* Events.liaCap(ow, ent); return; }
    yield* _lc.call(this, ow, ent); }; }

