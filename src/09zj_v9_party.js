/* ===================== v9.1 companion scene: 風車亭的試賣會 =====================
   Once 格倫 and 莉婭 are both companions and 諾拉 has decided to open her bakery, talking to 諾拉 in the capital starts a
   small party with all three. They ask whether the hero would go home if the door opened (the answer is remembered and
   changes a line of the ending). Reward: 羈絆之證 (unique accessory). */
GEAR.bondCharm = { n: '羈絆之證', slot: 'acc', t: 5, st: { hp: 25, def: 4, spd: 4, spe: 2 }, sp: {}, fx: [], kind: '飾品', d: '諾拉、格倫和莉婭一起做的護符。麥穗、斧頭和騎士團的紋章，被紅線綁在一起。' };
BP_RARE.add('bondCharm');
const bondReady = f => f.noraBread && f.allyGren && f.allyLia;
function* bondParty() {
  const st = Game.st, f = st.flags;
  yield* sayAll(['諾拉：「你來得正好！今天是『風車亭』試賣的日子——」', '諾拉：「我把你的朋友們也請來了！」']);
  yield* fadeOut(14); Sound.jingle('item'); yield* wait(30); yield* fadeIn(14);
  yield* sayAll(['格倫：「……麵包？我只是來看看這小鬼有沒有被騙。」', '莉婭：「格倫先生，那已經是你的第三個了喔。」', '格倫：「……咳。」',
    '諾拉：「欸，你是從『那邊』來的吧？那邊也有麵包嗎？」', '（你說起了故鄉的麵包店。三個人聽得很認真。）']);
  if (f.tombCharm) yield* say('莉婭：「初代勇者的護符上寫著『平安』……那是你故鄉的文字，對吧？」');
  yield* say(f.tombCharm ? '格倫：「那個初代勇者說，回家的門需要『四將的心』。……你打算怎麼辦？」' : '格倫：「如果哪天，回家的門打開了……你打算怎麼辦？」'); // v12.0.3: only the tomb tells about the generals' hearts
  const r = yield* ask('如果門打開了，你會回去嗎？', ['會回去', '想留在這裡', '還不知道']);
  f.homeChoice = r;
  if (r === 0) yield* sayAll(['諾拉：「……這樣啊。」', '諾拉：「那在你回去之前，每天都要來吃麵包喔！」', '莉婭：「那我們更要努力，讓你平安回家。」']);
  else if (r === 1) yield* sayAll(['格倫：「哼，隨你。……不過，驛站永遠有你的位子。」', '諾拉：「真的！？那你要當麵包店的第一個常客！」', '莉婭：「騎士團也會很高興的。」']);
  else yield* sayAll([f.tombCharm ? '莉婭：「沒關係。等找到四將的心，再決定也不遲。」' : '莉婭：「沒關係。等門真的打開了，再決定也不遲。」', '格倫：「路還長得很。慢慢想吧。」', '諾拉：「不管你選哪一邊，我們都是朋友！」']);
  yield* say('諾拉：「這個送給你——是我們三個一起做的！」');
  f.bondParty = 1; const g = makeGear('bondCharm', 3); Sound.jingle('levelup'); yield* itemGet('得到了' + gearName(g) + '！');
}
{ const _n = Events.noraCap; Events.noraCap = function* (...a) { const f = Game.st.flags; if (bondReady(f) && !f.bondParty) { yield* bondParty(); return; } yield* _n.apply(this, a); }; }
{ const _m = STORY_MARKS.noraCap; STORY_MARKS.noraCap = st => bondReady(st.flags) && !st.flags.bondParty ? '!' : _m(st); }
{ const _eq = extraQuests; extraQuests = function (st, L) { _eq(st, L); const f = st.flags; if (bondReady(f)) L.push({ n: '風車亭的試賣會', t: f.bondParty ? '完成：和諾拉、格倫、莉婭一起吃了麵包。' : '諾拉在王都等你。她好像把格倫和莉婭也請來了。', done: !!f.bondParty, rw: '羈絆之證' }); }; }
if (typeof QUEST_CATS !== 'undefined') QUEST_CATS['風車亭的試賣會'] = '支線';
