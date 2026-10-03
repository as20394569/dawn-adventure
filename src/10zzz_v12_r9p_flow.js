/* ===================== v12.0.9p 流程修正：新角色試玩到王都時找到的問題（玩家 2026-10-04「遊戲流程有點雜亂」） ===================== */
/* - 風車丘陵山頂、碧溪谷源頭：過場說「磨石自己動了起來」「大鯰魚探出了頭」之後什麼事都沒發生，要自己走到牠旁邊才會打。
     → 過場一結束，頭目就直接衝過來（照舊會問要不要打）。任務說明也改成「打倒○○」，指引箭頭指向牠。 */
for (const [ev, eid] of [['hillsTop', 'millGolem'], ['creekTop', 'blackCatfish']]) { const _e = Events[ev]; if (!_e) continue;
  Events[ev] = function (ow) { const g = _e(ow); if (!g) return g; return (function* () { yield* g; const e = (ow.elites || []).find(q => q.id === eid); if (e && Game.scene === ow) yield* ow.eliteTalk(e); })(); }; }
{ const _ql = questList; questList = function (st = Game.st) { const L = _ql(st), f = st.flags, M = L.find(q => q.main);
    if (M && f.hillsTop && !f.millGolem && (f.hillsQ || 0) < 2) M.t = '【推薦Lv4〜8】風車丘陵山頂的磨石魔像動起來了！打倒牠，救出漢斯。';
    if (M && f.creekTop && !f.blackCatfish && f.creekQ === 1) M.t = '【推薦Lv8〜11】碧溪谷源頭的瘴氣大鯰出現了！打倒牠，拿到清泉草。';
    return L; }; }
/* - 晨霧道路的沼澤鱷（推薦Lv13）就站在往碧溪谷（推薦Lv8〜11）的路口旁，走過去就會被牠看到、問要不要打。
     → 漢斯拜託你打倒牠之前（碧溪谷還沒完成），牠不會主動衝過來；自己去找牠說話還是可以打。 */
{ const _cs = Overworld.prototype.checkSight; Overworld.prototype.checkSight = function () {
    const f = (this.st && this.st.flags) || {}, calm = (f.creekQ || 0) < 3 && !f.croc ? (this.elites || []).filter(e => e.id === 'croc' && !e.rematch) : [];
    for (const e of calm) { e.s9 = e.sight; e.sight = 0; } try { return _cs.call(this); } finally { for (const e of calm) e.sight = e.s9; } }; }
/* - 古岩遺跡的大門看過之後，任務說明還是先寫「古岩遺跡」，指引一直把人帶回大門。
     → 看過大門（知道要古印）之後，指引改成最近的、還沒拿到的古印守護者。 */
{ const _qd = questDest; questDest = function (q, st = Game.st) {
    const f = st && st.flags;
    if (q && q.main && !q.done && f && f.license && f.qSeal && !f.golem && typeof SEALS !== 'undefined' && sealCount(st) < 3) {
      let best = null, bd = 1e9; for (const [fl, it, where, mk] of SEALS) { if (f['got_' + it]) continue; const d = mapDist(st.map, mk[0]); if (d < bd) { const M = MAPS[mk[0]] || {}, g = M.boss && (M.boss.flag || 'golem') === fl ? M.boss : (M.elites || []).find(e => e.id === fl) || { x: mk[1], y: mk[2] }; bd = d; best = { map: mk[0], spot: { x: g.x, y: g.y, name: where.split('・')[1] || where }, what: '找' + (where.split('・')[1] || where) }; } } // the guardian itself (格倫 stands at 8,2; the map mark is at 9,2)
      if (best) return best; }
    return _qd(q, st); }; }
/* - 跟人說話時拿到東西，「得到了○○」的字幕上面會掛著對方的名牌（漢斯：得到了「諾拉的緞帶」…），看起來像是對方在說話。
     → 拿到東西的字幕不掛名牌。 */
{ const _ig = itemGet; itemGet = function* (...a) { const T = Game.talker; Game.talker = null; try { yield* _ig.apply(this, a); } finally { if (Game.talker === null) Game.talker = T; } }; }
/* - 沼澤鱷打倒後過一段時間會再出現（Lv+3），又站回橋頭那一格，把往古岩遺跡・落日峽谷唯一的橋堵住，每次過橋都得再打一場。
     → 再出現時改站在橋旁邊的淺灘（不擋路，也不會衝過來），想再戰就自己過去找牠說話。 */
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { _ld.apply(this, a);
    if (this.map && this.map.id === 'route') for (const e of this.elites || []) if (e.id === 'croc' && e.rematch) { const x = 13, y = 13; e.x = e.tx = x; e.y = e.ty = y; e.px = x * TS; e.py = y * TS; e.dir = 'down'; e.sight = 0; e.home = [x, y, 'down']; } }; }
/* - 楓紅關道：主線（第二章）只寫「穿過楓紅關道和古戰場」，可是路上要先趕走斷崖的盜賊、打倒山頂的楓林鹿王，
     這些只寫在另一個「北境之路」任務裡；跟著主線指引走，會突然被鹿王擋住，不知道要打。
     → 走到這一段時，主線說明直接寫現在要做的那一步。 */
{ const _ql = questList; questList = function (st = Game.st) { const L = _ql(st), f = st.flags, M = L.find(q => q.main && !q.done && q.t && q.t.includes('北方街道'));
    if (M && !M.done && (f.ch2 || 0) === 1 && typeof v81Gate === 'function' && v81Gate(st) && !f.passDone) {
      M.t = !f.passIn ? '【推薦Lv17〜23】往北方街道的關道被封鎖了。請萌芽鎮的馬車夫湯姆送你到楓紅關道。'
        : !f.passCamp ? '【推薦Lv17〜20】楓紅關道的驛站被盜賊燒了。往北走，趕走斷崖上的盜賊。'
        : (f.passQ || 0) < 2 ? '【推薦Lv20】打倒擋在楓紅關道山頂的楓林鹿王。'
        : '【推薦Lv20〜23】穿過古戰場，打倒守在北邊關口的亡靈戰將。'; }
    return L; }; }
GOAL9.push({ map: 'maplePass', when: f => f.passIn && !f.passCamp, x: 11, y: 6, name: '斷崖' });
/* - 第三幕以後在外面倒下，會被送回萌芽鎮的家（最後一次在家或旅館休息的地方），要再付車資、從頭走一次。
     旅人營地、楓紅關道的驛站（格倫）、古戰場的營火（格倫）明明可以休息，卻不會記成醒來的地方。
     → 在這些地方休息後，倒下時就在那裡醒來。醒來的那句話也照地方說（以前不是家或旅館就一律說「清涼的泉水」）。 */
{ const _hr = healRitual; healRitual = function* (...a) { const ow = Game.ow, st = Game.st; if (Game.restSpot9 && ow && ow.p && ow.map && st) st.respawn = { map: ow.map.id, x: ow.p.x, y: ow.p.y, dir: ow.p.dir, at9: Game.restSpot9 }; return yield* _hr.apply(this, a); }; }
for (const k of Object.keys(CAMP12).concat(['grenPass', 'grenCamp'])) { const _e = Events[k]; if (!_e) continue; const who = CAMP12[k] ? CAMP12[k].name : '格倫';
  Events[k] = function* (...a) { Game.restSpot9 = who; try { return yield* _e.apply(this, a); } finally { Game.restSpot9 = 0; } }; }
{ Overworld.prototype.whiteout = function* () {
    const st = this.st; Game.fade = 1; this.camDY = 0; this.bossGlow = 0; const lost = Math.floor(st.money / 2); st.money -= lost;
    Sound.stop(); UI.clear();
    const box = { draw(x) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } }; UI.push(box);
    Game.fade = 0;
    yield* say(st.name + '眼前一片漆黑……', { style: 'dark', y: 98 });
    if (lost) yield* say('慌亂之中弄丟了' + lost + ' G……', { style: 'dark', y: 98 });
    UI.remove(box); Game.fade = 1;
    healHero(); const r = st.respawn; this.load(r.map, r.x, r.y, r.dir, true);
    yield* fadeIn(20);
    yield* say(r.map === 'home' ? '瑪莎：「你醒啦！別太勉強自己喔。」' : r.map === 'inn' ? '老闆娘：「你被送來這裡了呢。我已經幫你治療好了，要小心喔！」'
      : r.at9 ? r.at9 + '：「醒啦？你倒在外面，是人家把你抬回來的。別太勉強啊。」' : r.map === 'route' ? '清涼的泉水讓你恢復了精神。' : '醒來的時候，已經躺在' + ((MAPS[r.map] || {}).name || '') + '的床上了。體力恢復了。');
  }; }
