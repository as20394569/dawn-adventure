/* ===================== v12.0.3 第三輪：前 1 小時與故事（玩家在〈第三輪提案〉說「好」，2026-10-03） =====================
   快轉：長按畫面＝按住 B（對話與黑底字幕都能快轉）；開場穿越動畫長按時加速；第一次對話旁邊提示一次。
         這台裝置玩過時開新檔，標題會問要不要快轉開場（Game.autoIntro：對話自動翻，取名字和選職業時停下來）。
   教學：村長的 7 句說明縮成 2 句（08_main），其餘改成第一次碰到時講一句：天賦（Lv2）、設計圖、天賦覺醒（Lv13）、弱點。
   磨石魔像：第一個教學頭目——不帶碎甲重擊，逆轉大風車固定每 3 回合（第 2 回合預告），預告寫清楚要防禦。
   故事：劇情菁英（流浪的魔劍士、黯滅騎士長、亡靈戰將）打倒後不再出現；第一季完結後跳一張「還能做什麼」，冒險手冊裡也能看。
   關閉中的內容（星見神殿、異界迴廊）：委託「星塵的研究」先不開、圖鑑的頭目・菁英不列、舊任務「井底更深處」拿掉。 */

/* ---------- 快轉 ---------- */
let __lp12 = false, __lpT12 = 0, __lpF12 = -1;
{ const cvs = document.getElementById('screen');
  if (cvs) { cvs.addEventListener('pointerdown', () => { __lp12 = true; }); for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) cvs.addEventListener(ev, () => { __lp12 = false; }); }
  window.addEventListener('pointerup', () => { __lp12 = false; }); window.addEventListener('blur', () => { __lp12 = false; }); }
const longPress12 = () => { if (__lpF12 !== Game.frame) { __lpF12 = Game.frame; __lpT12 = __lp12 ? __lpT12 + 1 : 0; } return __lpT12 > 18; };
{ const _ff = dlgFF; dlgFF = function () { const v = _ff(); return v || longPress12() || !!Game.autoIntro; }; }
// the opening walk and the light circle run 4× while fast-forwarding
{ const _u = IntroScene.prototype.update; IntroScene.prototype.update = function () { const n = dlgFF() ? 4 : 1; for (let i = 0; i < n; i++) { _u.call(this); if (!this.script || Game.scene !== this) break; } }; }
// auto fast-forward stops where the player has a choice to make
{ const _cs = classSelectScreen; classSelectScreen = function* (...a) { Game.autoIntro = false; return yield* _cs.apply(this, a); }; }
{ const _ts = TitleScene.prototype.enter; TitleScene.prototype.enter = function (...a) { Game.autoIntro = false; return _ts ? _ts.apply(this, a) : undefined; }; }
// one hint beside the first dialogues on this device
{ const _d = TextBox.prototype.draw; TextBox.prototype.draw = function (x) { _d.call(this, x);
    const S = Game.settings; if (S.ffHint12 || Game.autoIntro || !(this.style === 'ow' || this.style === 'dark') || this.y < 60) return;
    Font.drawR(x, '長按畫面（或按住B）可以快轉', this.x + this.w - 4, this.y - 11, UIC.muted, UIC.textSh, 9);
    if ((S.ffHintT12 = (S.ffHintT12 || 0) + 1) > 600) { S.ffHint12 = 1; delete S.ffHintT12; saveSettings(); } }; }

/* ---------- 第一次碰到時的提示 ---------- */
{ const _bp = gainBP; gainBP = function (k, q, st = Game.st, ...a) { const r = _bp.call(this, k, q, st, ...a); if (st && st.flags && st.flags.license && !st.flags.h12bp) st.flags.h12bp = 1; return r; }; }
{ const H = Battle.prototype.handlers, _d = H.DAMAGE; H.DAMAGE = function* (e, s, t, P) {
    if (s && s.hero && t && !t.hero && P && P.kind === 'hit' && P.mult > 1) { const f = Game.st && Game.st.flags; if (f && !f.h12weak) f.h12weak = 1; }
    yield* _d.call(this, e, s, t, P); }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st && st.flags) st.flags.r3new = 1; return st; }; }
const HINT12 = [
  ['h12tal', st => st.lv >= 2, ['（得到了「天賦點」！打開選單的「天賦」，就能點' + '{cls}' + '的三個流派。之後每升 2 級還會再拿到。）']],
  ['h12bp2', st => st.flags.h12bp === 1, ['（得到了設計圖！把設計圖和素材拿去萌芽鎮的鐵匠，就能打造新的裝備。）']],
  ['h12deep', st => st.lv >= 13 && !st.flags.deep, ['（再升一級到 Lv14，就可以找村長進行「天賦覺醒」：解開第 3 層天賦和核心天賦。）']],
  ['h12weak2', st => st.flags.h12weak === 1, ['（剛才打中了弱點！魔物分成好幾個種族，各有害怕的屬性。善用屬性技能，戰鬥會輕鬆很多。）']],
];
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    const st = this.st;
    if (st && st.flags && st.flags.license && st.flags.orbStart && !this.script && !UI.stack.length && !Game.trans) {
      const h = st.flags.r3new && HINT12.find(([k, ok]) => !st.flags[k] && ok(st));
      if (h) { st.flags[h[0]] = 1; const cls = (CLASSES[st.cls] || {}).n || ''; this.run(sayAll(h[2].map(s => s.replace('{cls}', cls)))); return; }
      if ((st.flags.ch2 || 0) >= 10 && !st.flags.todo12) { st.flags.todo12 = 1; this.run(todoScreen12(true)); return; }
    }
    return _u.apply(this, a); }; }

/* ---------- 磨石魔像：教學頭目 ---------- */
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind) { const f = _mf(sp, lv, kind); if (sp === 'millGolem' && f && f.moves) { const k = f.moves.filter(m => m.id !== 'm_sunder'); if (k.length >= 3) f.moves = k; } return f; }; }
if (DEF.skills.m_millStorm) Object.assign(DEF.skills.m_millStorm, { warn: '（⚠ 下一回合選「防禦」，傷害會減半！逆轉大風車每 3 回合一次。）' });
BAI.SCRIPT.b12_millGolem = function (core, u) { const d = u.data; d.cd = (d.cd ?? 2) - 1;
  if (d.cd <= 0 && DEF.skills.m_millStorm) { d.cd = 2; return b12Charge(core, u, 'm_millStorm'); }
  return b12Pick(core, u, BR.stage(core, u, 'def') < 1 && core.rng.chance(0.3) ? ['m_scaleGuard'] : ['m_millGrind', 'm_blackGust', 'm_millGrind']); };
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o);
    if (s && sp === 'millGolem') s.data.script = 'b12_millGolem'; return s; }; }

/* ---------- 劇情菁英：打倒就是結局 ---------- */
const STORY_ELITES12 = ['rogueBlade', 'duskCaptain', 'wraithGeneral'];
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { _ld.apply(this, a);
    if (this.elites) this.elites = this.elites.filter(e => !(e.rematch && STORY_ELITES12.includes(e.id))); }; }

/* ---------- 還能做什麼（第一季完結後一次；冒險手冊裡隨時看） ---------- */
function todoLines12(st = Game.st) {
  const L = [], P = (t, c) => L.push([t, c, 10, t.startsWith('・') || t.startsWith('　') ? 6 : 0]), Q = questList(st), side = Q.filter(q => !q.main && !q.done && !/^委託/.test(q.n) && !['委託告示板', '區域事件'].includes(q.n));
  const com = Object.keys(COMMISSIONS).filter(k => { const s = comState(k, st); return !(s && s.s === 'done') && (!COMMISSIONS[k].open || COMMISSIONS[k].open(st)); });
  const dex = st.dex || {}, seen = Object.keys(SPECIES).filter(k => dex[k]).length;
  const foes = FOE_SPOTS.filter(e => (dex[e.sp] || {}).won > 0).length;
  const ach = ACHIEVEMENTS.filter(a => { try { return a.ok(st); } catch (e) { return false; } }).length;
  P('支線任務：還有 ' + side.length + ' 條', UIC.warm); for (const q of side.slice(0, 5)) P('・' + q.n, UIC.text); if (side.length > 5) P('　……還有 ' + (side.length - 5) + ' 條', UIC.muted);
  P('委託：還有 ' + com.length + ' 件', UIC.warm); for (const k of com.slice(0, 3)) P('・' + COMMISSIONS[k].n + '（' + COMMISSIONS[k].from + '）', UIC.text); if (com.length > 3) P('　……還有 ' + (com.length - 3) + ' 件', UIC.muted);
  P('魔物圖鑑：' + seen + '／' + Object.keys(SPECIES).length, UIC.warm); P('頭目・菁英：打倒 ' + foes + '／' + FOE_SPOTS.length, UIC.warm);
  P('世界的記載：' + loreCount(st) + '／' + loreTotal(), UIC.warm); P('成就：' + ach + '／' + ACHIEVEMENTS.length, UIC.warm);
  return L;
}
function* todoScreen12(first) {
  if (first) yield* sayAll(['曙光鐘的聲音，傳遍了整個王國。', '（第一季到這裡結束。第三章製作中——在那之前，世界還有很多地方等著你。）']);
  const L = todoLines12(), per = 16; let top = 0;
  const scr = { touchBack: true, draw(x) { screenBG(x); headerBar(x, '還能做什麼'); drawWin(x, 4, 22, 168, 230, 'menu'); const end = drawInfoLines(x, L, 10, 28, 236, top); scr.more = end < L.length;
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (scr.more) x.drawImage(DOWNARROW, 86, 237); Font.drawR(x, 'A／B 關閉', 166, 240, UIC.muted, UIC.textSh, 9); } };
  UI.push(scr); Input.clearAll();
  while (true) { if (Input.repeat('up') && top > 0) { top--; Sound.sfx('cursor'); } if (Input.repeat('down') && scr.more) { top++; Sound.sfx('cursor'); }
    if (Input.pressed('a') || Input.pressed('b')) { Input.consume('a', 'b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr);
}
{ const _hb = handbookScreen12; handbookScreen12 = function* () {
    if ((Game.st.flags.ch2 || 0) < 10) return yield* _hb();
    while (true) { const r = yield* ask('冒險手冊', ['任務', '圖鑑', '紀錄', '變強的方法', '還能做什麼', '返回']);
      if (r === 0) yield* questScreen(); else if (r === 1) yield* dexScreen(); else if (r === 2) yield* recordScreen();
      else if (r === 3) { while (true) { const k = yield* ask('變強的方法', GROW12.map(q => q[0]).concat('返回')); if (k < 0 || k >= GROW12.length) break; yield* say(GROW12[k][1]); } }
      else if (r === 4) yield* todoScreen12(false); else break; } }; }

/* ---------- 設定集矛盾 4（玩家勾「是伏筆」）：讀過古戰場的記載之石後，漢斯提一句名字的由來 ---------- */
{ const _h = Events.hans; Events.hans = function* (...a) { const st = Game.st, f = st.flags, i = LORE.findIndex(l => l[0] === 'oldField');
    if (f.creekQ === 3 && !f.hansName && i >= 0 && (st.lore || {})[i]) { f.hansName = 1; yield* say('漢斯：「古戰場的石碑上，有個叫漢斯的磨坊學徒？……這個名字，是我們磨坊代代傳下來的。」'); }
    yield* _h.apply(this, a); }; }

/* ---------- 戰後過場（玩家勾「補」）：沼澤鱷（第一幕最後）、苔石巨人（森林之印） ---------- */
Events.eliteWin_croc = function* () { const f = Game.st.flags;
  yield* sayAll(['沼澤鱷翻了個身，慢慢沉回了河裡。'].concat((f.creekQ || 0) >= 3 ? ['河水清清的。牠大概是被碧溪谷的黑水，從上游趕下來的吧。'] : [], ['橋頭的路，終於通了。', '（橋的另一邊，是迷霧森林和古岩遺跡。）'])); };
Events.eliteWin_mossGiant = function* () { const f = Game.st.flags;
  yield* sayAll(['苔石巨人的身體慢慢散開，變回了一堆長滿青苔的石頭。', '石頭堆的中間，有一枚刻著樹葉紋路的古印，發著淡淡的光。'].concat(f.q2res === 'stay' ? ['提姆：「……打、打贏了！我們打贏了！」'] : [], ['一陣風吹過森林，空氣好像變輕了。'])); };

/* ---------- 很舊的存檔：讀檔時的「系統更新」提示寫的是已經不存在的規則（玩家勾選刪掉；存檔換算照舊） ---------- */
skillUpdateNote = function* (st) { delete st.skillNote; };
pointUpdateNote = function* (st) { delete st.pointNote; };

/* ---------- 關閉中的內容 ---------- */
if (COMMISSIONS.c34) COMMISSIONS.c34.open = st => !!comState('c34', st); // 星塵只在星見神殿：神殿打開時再開放（已經接下的照舊）
{ const A = ACHIEVEMENTS.find(a => a.id === 'com'); if (A) A.ok = st => Object.keys(COMMISSIONS).every(k => k === 'c34' || (comState(k, st) || {}).s === 'done'); }
for (let i = FOE_SPOTS.length - 1; i >= 0; i--) if (['rift', 'starShrine'].includes(FOE_SPOTS[i].map)) FOE_SPOTS.splice(i, 1);
{ const _ql = questList; questList = function (st = Game.st) { return _ql(st).filter(q => q.n !== '井底更深處'); }; } // 初代勇者的試煉 replaced the rope route
