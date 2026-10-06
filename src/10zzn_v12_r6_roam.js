/* ===================== v12.0.6 第六輪：看得見的野外魔物（玩家在〈第六輪提案〉勾選，2026-10-03） =====================
   野外（草叢遇敵的地圖）不再在草叢裡隨機遇敵，改成地圖上看得見、會走動的魔物：
   - 進地圖時依草叢的量生出魔物（草叢格數 × 遇敵率 ÷ 1.5，3～18 隻），住在草叢附近、在家附近走動。
   - 撞上牠、面對牠按 A，或被會追人的魔物追上，就開始戰鬥；打贏了這隻就消失，離開地圖再回來會重新出現。
   - 一部分魔物會追人（約一半，而且等級不比你低太多）；跑步比牠們快，可以甩掉。逃跑或打輸後牠會安靜一陣子。
   - 稀有魔物（3%）會閃光；魔物群（Lv8 起 12%）頭上有「×2／×3」，打完一隻還有下一隻。
   - 天氣魔物在生出來時就決定（下雨天的雨蛙精等），所以看到的就是會打到的。
   迷宮（整片地板都會遇敵的地圖）照舊隨機遇敵。地圖上的樣子用戰鬥圖的待機圖縮成一半。 */
const ROAM12 = { DEN: 1.5, MIN: 3, MAX: 18, R: 3, SEE: 3, CALM: 30 };
const roamOn12 = d => !!(d && d.encounters && d.encounters.length && (d.roam12 || (!d.encAll && d.rows && d.rows.some(r => r.includes('#')))));
const ROAM_IMG12 = {};
function roamImg12(sp) {
  if (ROAM_IMG12[sp]) return ROAM_IMG12[sp];
  let c = null;
  if (typeof chibiBase === 'function' && chibiBase(sp)) { const im = chibiImage(sp), M = BATTLE_PXC_META[chibiBase(sp)];
    if (im && im.ok !== false && (im.complete !== false) && M) { const w = Math.ceil(M.w / 2), h = Math.ceil(M.h / 2); c = mkCanvas(w, h); const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      x.drawImage(im, M.frames.idle[0] * M.w, 0, M.w, M.h, 0, 0, w, h); } }
  if (!c && ART[sp]) return monsterMini(sp, 24);
  if (!c) return null;
  return ROAM_IMG12[sp] = { c, flip: flipCanvas(c), big: 1 };
}
const roamWalk12 = ch => ch === '#' || ch === ',' || ch === '.' || ch === 'f' || ch === 'y' || ch === ':' || ch === 's';
Overworld.prototype.roamFree12 = function (x, y, e) {
  const m = this.map; if (x < 1 || y < 1 || x >= m.w - 1 || y >= m.h - 1) return false;
  if (!roamWalk12(this.tileAt(x, y)) || this.solidAt(x, y) || this.entityAt(x, y, e) || m.doors[x + ',' + y]) return false;
  if ((m.d.triggers || []).some(t => t.x === x && t.y === y)) return false;
  if (m.d.exit && m.d.exit.x === x && m.d.exit.y === y) return false; return true;
};
Overworld.prototype.roamSpawn12 = function () {
  const d = this.map.d, st = this.st, out = [], p = this.p, wx = typeof wxNow === 'function' ? wxNow(st) : null;
  let grass = []; d.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') grass.push([x, y]); }));
  if (!grass.length) { d.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === 's') grass.push([x, y]); })); grass = grass.filter(() => chance(0.5)); } // caves: the floor
  const zone12 = (x, y) => d.encounters.find(e => y >= e.y0 && y <= e.y1 && (e.x0 === undefined || (x >= e.x0 && x <= e.x1)));
  const rate = d.encounters.reduce((a, e) => a + e.rate, 0) / d.encounters.length;
  const n = Math.max(ROAM12.MIN, Math.min(ROAM12.MAX, Math.round(grass.length * rate / ROAM12.DEN * (d.roamMul12 || 1))));
  const pool = grass.filter(([x, y]) => zone12(x, y) && Math.abs(x - p.x) + Math.abs(y - p.y) > 5);
  for (let i = 0; i < n && pool.length; i++) {
    const k = rnd(0, pool.length - 1), [x, y] = pool.splice(k, 1)[0]; if (!this.roamFree12(x, y)) { i--; continue; }
    const enc = zone12(x, y), row = rollEnc(enc); let sp = row[0], lv = rnd(row[1], row[2]), rare = 0, pack = 0, wxm = 0;
    if (d.rare && chance(0.03)) { sp = d.rare[0]; lv = rnd(d.rare[1], d.rare[2]); rare = 1; }
    else if (wx && typeof WX_MON !== 'undefined' && WX_MON[wx] && chance(0.25)) { sp = WX_MON[wx][0]; wxm = 1; }
    else if (st.lv >= 8 && chance(0.12)) pack = rnd(2, 3);
    const img = roamImg12(sp); if (!img) { i--; continue; }
    const e = new Entity({ roam: 1, sp, lv, enc, rare, pack, wxm, x, y, dir: pick(['down', 'left', 'right', 'up']), img, aggro: !rare && chance(0.5) && lv >= (st.lv || 1) - 2 });
    e.home = [x, y, e.dir]; e.timer = rnd(20, 120); out.push(e); }
  return out;
};
// the roamers live with the map; a reload of the same map (after a battle) keeps them, a new map makes new ones
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) {
    _ld.call(this, id, x, y, dir, silent);
    if (!roamOn12(this.map.d)) { this.roam12 = null; return; }
    if (!this.roam12 || this.roam12.map !== id) this.roam12 = { map: id, list: this.roamSpawn12() };
    for (const e of this.roam12.list) if (!this.elites.includes(e)) { if (e.x === this.p.x && e.y === this.p.y) continue; e.moving = false; e.px = e.x * 16; e.py = e.y * 16; this.elites.push(e); }
  };
}
Overworld.prototype.roamDrop12 = function (e) { this.elites = this.elites.filter(q => q !== e); if (this.roam12) this.roam12.list = this.roam12.list.filter(q => q !== e); };
// no more random battles in the grass where the monsters are visible
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () {
    const on = roamOn12(this.map.d), was = Game.noEnc; if (on) Game.noEnc = true;
    try { _os.call(this); } finally { if (on) Game.noEnc = was; }
    if (!on || this.script || this.p.moving) return; this.roamTouch12();
  };
}
Overworld.prototype.roamTouch12 = function () { // a chasing monster next to you attacks
  const p = this.p; for (const e of this.elites) if (e.roam && e.chase && !e.moving && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) === 1) { this.run(this.roamFight12(e, true)); return true; } return false; };
// bumping into one / pressing A in front of one starts the fight
{ const _tm = Overworld.prototype.tryMove; Overworld.prototype.tryMove = function (d, run) {
    const [dx, dy] = DIRS[d], e = this.elites.find(q => q.roam && q.x === this.p.x + dx && q.y === this.p.y + dy);
    if (e && !this.script) { this.p.dir = d; this.st.dir = d; this.run(this.roamFight12(e)); return; }
    return _tm.call(this, d, run);
  };
  const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () {
    const [dx, dy] = DIRS[this.p.dir], e = this.elites.find(q => q.roam && q.x === this.p.x + dx && q.y === this.p.y + dy);
    if (e) { this.run(this.roamFight12(e)); return true; } return _in.call(this);
  };
}
// wandering and chasing
{ const _un = Overworld.prototype.updateNPCs; Overworld.prototype.updateNPCs = function () {
    _un.call(this); if (!this.roam12) return; const p = this.p, st = this.st, busy = !!this.script || UI.stack.length > 0;
    for (const e of this.elites) { if (!e.roam) continue;
      if (e.moving) { this.updateMove(e); if (!e.moving && e.chase && !busy && !p.moving && Math.abs(e.x - p.x) + Math.abs(e.y - p.y) === 1) this.run(this.roamFight12(e, true)); continue; }
      if (busy) continue;
      const dist = Math.abs(e.x - p.x) + Math.abs(e.y - p.y), calm = (st.steps || 0) < (e.calmUntil || 0);
      if (e.aggro && !calm && !e.chase && dist <= ROAM12.SEE) { e.chase = 6; e.excl = 30; Sound.sfx('exclaim'); e.timer = 30; continue; }
      if (--e.timer > 0) continue;
      let d = null;
      if (e.chase) { e.chase--; const ds = []; if (p.x !== e.x) ds.push(p.x > e.x ? 'right' : 'left'); if (p.y !== e.y) ds.push(p.y > e.y ? 'down' : 'up'); d = ds.find(k => { const [dx, dy] = DIRS[k]; return this.roamFree12(e.x + dx, e.y + dy, e); }) || null; e.timer = 14;
        if (!e.chase || dist > ROAM12.SEE + 4) { e.chase = 0; e.calmUntil = (st.steps || 0) + 8; } }
      else { e.timer = rnd(40, 110); const c = pick(['up', 'down', 'left', 'right']), [dx, dy] = DIRS[c], nx = e.x + dx, ny = e.y + dy;
        if (Math.abs(nx - e.home[0]) <= ROAM12.R && Math.abs(ny - e.home[1]) <= ROAM12.R && this.roamFree12(nx, ny, e)) d = c; else e.dir = c; }
      if (d) { const [dx, dy] = DIRS[d]; e.dir = d; this.startMove(e, e.x + dx, e.y + dy, 1); } }
  };
}
Overworld.prototype.roamFight12 = function* (e, theyCame) {
  const p = this.p, st = this.st; e.chase = 0;
  p.dir = e.x < p.x ? 'left' : e.x > p.x ? 'right' : e.y < p.y ? 'up' : 'down'; st.dir = p.dir;
  if (theyCame) { Sound.sfx('exclaim'); p.excl = 24; yield* wait(20); }
  const n = e.pack || 1; let res = 'win';
  if (n > 1) yield* say('是魔物群！（連續' + n + '場戰鬥，經驗值+25%）');
  for (let i = 0; i < n; i++) {
    const row = i ? rollEnc(e.enc) : null, sp = i ? row[0] : e.sp, lv = i ? rnd(row[1], row[2]) + (i === n - 1 ? 1 : 0) : e.lv;
    res = yield* this.battleScript({ sp, lv, kind: 'wild', roam12: 1, ...(n > 1 ? { pack: [i + 1, n] } : {}), ...(e.wxm ? { wxMon: 1 } : {}) });
    if (res !== 'win') break;
    if (i < n - 1) { Sound.sfx('exclaim'); this.p.excl = 24; yield* wait(24); yield* say('又有魔物衝過來了！（' + (i + 2) + '/' + n + '）'); }
  }
  if (res === 'win') { this.roamDrop12(e);
    if (n > 1) { const g = 60 * n * Math.ceil(st.lv / 4), mats = Object.keys(ITEMS).filter(k => ITEMS[k].mat && k !== 'crystal'), mt = packMat13(mats); st.money += g; st.bag[mt] = (st.bag[mt] || 0) + 2; st.packs = (st.packs || 0) + 1; Sound.jingle('item'); yield* say('擊退了魔物群！額外獲得' + g + ' G和' + ITEMS[mt].n + '×2！'); } }
  else if (this.elites.includes(e)) { e.calmUntil = (st.steps || 0) + ROAM12.CALM; const [hx, hy] = e.home; if (this.roamFree12(hx, hy, e) && !(hx === p.x && hy === p.y)) { e.x = e.tx = hx; e.y = e.ty = hy; e.px = hx * 16; e.py = hy * 16; } e.moving = false; }
};
// drawn from the battle idle frame at half size, hopping when it moves
{ const _dm = Overworld.prototype.drawMon; Overworld.prototype.drawMon = function (x, e, camX, camY) {
    if (!e.roam || !e.img || !e.img.big) return _dm.call(this, x, e, camX, camY);
    const im = e.dir === 'right' ? e.img.flip : e.img.c, cx = Math.round(e.px) - camX + 8, foot = Math.round(e.py) - camY + 15;
    const hop = e.moving ? Math.round(Math.sin(Math.min(1, e.prog / 16) * Math.PI) * 3) : (Math.floor((this.t + e.x * 13) / 20) % 4 === 0 ? 1 : 0);
    x.fillStyle = 'rgba(20,40,20,0.3)'; x.beginPath(); x.ellipse(cx, foot - 1, Math.min(10, im.width / 3), 3, 0, 0, 7); x.fill();
    x.imageSmoothingEnabled = false; x.drawImage(im, cx - (im.width >> 1), foot - im.height - hop);
    if (e.rare && Math.floor((this.t + e.x * 5) / 6) % 3 === 0) { x.fillStyle = '#fff6a0'; x.fillRect(cx + rnd(-8, 7), foot - rnd(6, im.height), 2, 2); }
    if (e.pack) { const s = '×' + e.pack; Font.drawC(x, s, cx, foot - im.height - hop - 11, '#ffd860', '#000000', 8); }
  };
}
// 玩家勾的：地圖變大、戰鬥變多，每場經驗值稍微調低（×0.85），到頭目時的等級跟以前差不多
const ROAM_EXP12 = 0.85;
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { yield* _ge.call(this, this.cfg && this.cfg.roam12 ? Math.max(1, Math.round(a * ROAM_EXP12)) : a); }; }
