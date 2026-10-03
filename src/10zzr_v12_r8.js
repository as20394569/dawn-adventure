/* ===================== v12.0.8 第八輪：內容與深度（玩家在〈第八輪提案〉勾選，2026-10-03） =====================
   這個檔先做不需要新名字的三項：
   - 迷宮也改成看得見的魔物（10 個迷宮；異界迴廊關閉中不動）。
   - 要用裂界碎片、星之碎片、星塵才能打造的配方先藏起來（這三種素材留給第三章）。
   - 先手與偷襲：從魔物背後或側面碰到牠（牠沒有面向你）＝偷襲，你先行動、第一擊必定會心；被追人的魔物追上＝被偷襲，
     魔物先行動一次。黃昏、夜晚有一半的白天生物在睡覺，早晨有一半的夜行生物在睡覺；睡著的不會動、不會追人，
     從哪個方向碰到都算偷襲。 */

/* ---------- 迷宮：看得見的魔物 ---------- */
const DUNGEON_ROAM12 = ['sewer', 'ruins', 'mine', 'catacomb', 'capSewer', 'clockTower1', 'iceCave', 'lavaTunnel', 'duskFort1', 'heroTomb'];
for (const id of DUNGEON_ROAM12) if (MAPS[id] && MAPS[id].encounters && MAPS[id].encounters.length) { MAPS[id].roam12 = 1; if (typeof mapCache !== 'undefined') delete mapCache[id]; }

/* ---------- 留給第三章的素材：配方先藏起來 ---------- */
const RESERVED_MATS12 = new Set(['riftShard', 'starShard', 'starDust']);
const usesReserved12 = mats => !!mats && Object.keys(mats).some(m => RESERVED_MATS12.has(m));
{ const _bk = bpKnown; bpKnown = function (k, st = Game.st) { if (GEAR_RECIPE[k] && usesReserved12(GEAR_RECIPE[k].mats)) return false; return _bk(k, st); }; }
{ const _bl = bpList; bpList = function (tab, st = Game.st) { const L = _bl(tab, st); return tab === 3 ? L.filter(o => !(o.R && usesReserved12(o.R.mats))) : L; }; }

/* ---------- 先手與偷襲 ---------- */
const NIGHTISH12 = sp => (typeof M7_KEYS !== 'undefined' && M7_KEYS.has(sp)) || (typeof NIGHT_LEAN12 !== 'undefined' && NIGHT_LEAN12.has(sp));
function sleepy12(sp, ph) { if (ph === 'dawn') return NIGHTISH12(sp); if (ph === 'dusk' || ph === 'night') return !NIGHTISH12(sp); return false; }
const roamSleep12 = (e, ow) => { e.sleep12 = 1; e.aggro = false; e.chase = 0; e.timer = 1e9; };
Overworld.prototype.roamNap12 = function (list, now) {
  const st = this.st, ph = dnOut12(st.map) ? (now || dnPhase12(st)) : 'day';
  for (const e of list) { if (e.rare || e.scare12 || e.sleep12) continue; if (sleepy12(e.sp, ph) && chance(0.5)) roamSleep12(e, this); }
};
{ const _sp = Overworld.prototype.roamSpawn12; Overworld.prototype.roamSpawn12 = function () { const L = _sp.call(this); this.roamNap12(L); return L; }; }
{ const _ch = Overworld.prototype.dnChange12; Overworld.prototype.dnChange12 = function (was, now) {
    const p = this.p, far = e => Math.abs(e.x - p.x) + Math.abs(e.y - p.y) > 7;
    if (this.roam12) for (const e of this.roam12.list) if (e.sleep12 && (far(e) || !sleepy12(e.sp, dnOut12(this.st.map) ? now : 'day'))) { e.sleep12 = 0; e.timer = rnd(20, 80); e.aggro = chance(0.5) && e.lv >= (this.st.lv || 1) - 2; }
    _ch.call(this, was, now); // (the ones out of sight may turn into another species here)
    if (this.roam12) this.roamNap12(this.roam12.list.filter(far), now);
  }; }
// who struck first
{ const _rf = Overworld.prototype.roamFight12; Overworld.prototype.roamFight12 = function* (e, theyCame) {
    const p = this.p, [dx, dy] = DIRS[e.dir] || [0, 0], faces = e.x + dx === p.x && e.y + dy === p.y;
    this._amb12 = theyCame ? 'foe' : (e.sleep12 || !faces) ? 'hero' : null;
    try { yield* _rf.call(this, e, theyCame); } finally { this._amb12 = null; }
  }; }
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    if (cfg && cfg.roam12 && this._amb12) { cfg = { ...cfg, ambush12: this._amb12 }; this._amb12 = null; }
    return yield* _bs.call(this, cfg, ...a);
  }; }
// 沒反應過來：只在第 1 回合不能行動（回合結束就消失）
defPut('statuses', 'ambush12', { tags: ['debuff'], duration: 'round', clearAt: 'round_end', stack: 'none', metadata: { n: '沒反應過來' }, blockAction: () => 'ambush12' });
CANCEL_TXT.ambush12 = '還沒反應過來，無法行動！';
{ const _in = Battle.prototype.intro; Battle.prototype.intro = function* (...a) {
    const r = yield* _in.apply(this, a); const am = this.cfg && this.cfg.ambush12, core = this.core;
    if (am && core && !this.amb12done) { this.amb12done = 1; const st = Game.st, f = st.flags, H = core.byId.H, foes = core.units.filter(u => u.side === 'B' && core.isUp(u));
      if (am === 'hero') { for (const u of foes) core.applyStatus(H, u, 'ambush12', { quiet: true }); core.applyStatus(H, H, 'critNext', { quiet: true }); st.ambush12N = (st.ambush12N || 0) + 1;
        yield* this.msg(f.amb12a ? '偷襲成功！' : '偷襲成功！魔物還沒反應過來。\n（從背後、側面或趁魔物睡著時碰到牠，第 1 回合魔物不能行動，你的第一擊必定會心）'); f.amb12a = 1; }
      else if (foes.length) { for (const u of core.units.filter(u => u.side === 'A' && core.isUp(u))) core.applyStatus(foes[0], u, 'ambush12', { quiet: true });
        yield* this.msg(f.amb12b ? '被偷襲了！' : '被偷襲了！魔物搶先行動。\n（被追人的魔物追上時，第 1 回合只有魔物能行動）'); f.amb12b = 1; } }
    return r;
  }; }
// sleeping monsters: no glowing eyes, and a "z z" over the head drawn above the dark so you can find them at night
{ const _wp = owWorldPost; owWorldPost = function (ow, x) {
    const sl = (ow.elites || []).filter(e => e.roam && e.sleep12 && e.img), keep = sl.map(e => e.img); for (const e of sl) e.img = { ...e.img, big: 0 };
    try { _wp(ow, x); } finally { sl.forEach((e, i) => { e.img = keep[i]; }); }
    if (!sl.length) return; const z = ow._zc ? ZOOM_F : 1;
    for (const e of sl) { const im = e.img.c; let sx = Math.round(e.px) + 8 - ow.camX, sy = Math.round(e.py) + 15 - (im ? im.height : 16) - ow.camY;
      if (ow._zc) { sx = ow._zc[0] + (sx - ow._zc[0]) * z; sy = ow._zc[1] + (sy - ow._zc[1]) * z; } if (sx < -20 || sy < -20 || sx > W + 20 || sy > H + 20) continue;
      const k = Math.floor((ow.t + e.x * 7) / 24) % 3; for (let i = 0; i <= k; i++) Font.draw(x, 'z', Math.round(sx + 3 + i * 5), Math.round(sy - 4 - i * 5), '#e8f0ff', '#1a1a2a', 8); } }; }
