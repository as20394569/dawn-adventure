/* ===================== v12.16 地圖上的魔物：縮小、種類齊全、會補（玩家 2026-10-05：「怪物改成分佈後我覺得在地圖顯示太大 而且種類分佈變少」） =====================
   問了之後選：
   · 大小「縮到和主角差不多」：地圖上的樣子從戰鬥圖的 1/2 改成 1/3（一般約 22 點高、和主角差不多；大隻的最多約 33）。
   · 「每區每種至少一隻」：生魔物時，這張地圖遇敵表上的每一種（稀有的除外）都先放一隻，再照機率補。
   · 「打倒後過一陣子補一隻」：打倒（或嚇跑）一隻後，走 30 步左右會在畫面外補一隻新的，優先補地圖上現在沒有的種類；不用進出地圖。
   · 「迷宮、洞窟多放一些」：沒有草叢的地圖（迷宮、洞窟）3〜5 隻 → 6〜8 隻。 */
const ROAM16 = { SCALE: 3, REFILL: 30, DUNGEON: [6, 8], FAR_X: 7, FAR_Y: 9 };
// 1. a third of the battle picture
roamImg12 = function (sp) {
  if (ROAM_IMG12[sp]) return ROAM_IMG12[sp];
  let c = null;
  if (typeof chibiBase === 'function' && chibiBase(sp)) { const im = chibiImage(sp), M = BATTLE_PXC_META[chibiBase(sp)];
    if (im && im.ok !== false && (im.complete !== false) && M) { const w = Math.ceil(M.w / ROAM16.SCALE), h = Math.ceil(M.h / ROAM16.SCALE); c = mkCanvas(w, h); const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      x.drawImage(im, M.frames.idle[0] * M.w, 0, M.w, M.h, 0, 0, w, h); } }
  if (!c && ART[sp]) return monsterMini(sp, 20);
  if (!c) return null;
  return ROAM_IMG12[sp] = { c, flip: flipCanvas(c), big: 1 };
};
for (const k in ROAM_IMG12) delete ROAM_IMG12[k];

// helpers: the zone of a tile, the tiles a monster can live on, one new monster
const zoneAt16 = (d, x, y) => d.encounters.find(e => y >= e.y0 && y <= e.y1 && (e.x0 === undefined || (x >= e.x0 && x <= e.x1)));
const isDungeon16 = d => !d.rows.some(r => r.includes('#'));
const roamSpecies16 = d => { const M = new Map(); for (const enc of d.encounters || []) for (const r of enc.table || []) if (r[3] > 0 && !(SPECIES[r[0]] || {}).rare && roamImg12(r[0])) { if (!M.has(r[0])) M.set(r[0], []); M.get(r[0]).push(enc); } return M; };
Overworld.prototype.roamSpots16 = function (far) { const d = this.map.d, p = this.p, out = [], ch = isDungeon16(d) ? 's' : '#';
  d.rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== ch || !zoneAt16(d, x, y)) return; const dx = Math.abs(x - p.x), dy = Math.abs(y - p.y);
    if (far ? (dx <= ROAM16.FAR_X && dy <= ROAM16.FAR_Y) : dx + dy <= 5) return; if (this.roamFree12(x, y)) out.push([x, y]); }));
  return out; };
Overworld.prototype.roamMake16 = function (spot, sp) { const d = this.map.d, st = this.st, [x, y] = spot, enc = zoneAt16(d, x, y); if (!enc) return null;
  let row = sp ? enc.table.find(r => r[0] === sp) : null; if (!row) row = rollEnc(enc); if (!row || (SPECIES[row[0]] || {}).rare) return null; const img = roamImg12(row[0]); if (!img) return null;
  const lv = rnd(row[1], row[2]), pack = st.lv >= 8 && chance(0.12) ? rnd(2, 3) : 0, dir = pick(['down', 'left', 'right', 'up']);
  const e = new Entity({ roam: 1, sp: row[0], lv, enc, rare: 0, pack, wxm: 0, x, y, dir, img, aggro: chance(0.5) && lv >= (st.lv || 1) - 2 }); e.home = [x, y, dir]; e.timer = rnd(20, 120); return e; };
// 2. every species of the map at least once; 3. dungeons get 6〜8
{ const _sp = Overworld.prototype.roamSpawn12; Overworld.prototype.roamSpawn12 = function () { const L = _sp.call(this), d = this.map.d;
    const need = roamSpecies16(d), cnt = () => { const c = {}; for (const e of L) c[e.sp] = (c[e.sp] || 0) + 1; return c; };
    for (const [sp, zones] of need) { if (L.some(e => e.sp === sp)) continue; const c = cnt();
      const cand = L.filter(e => zones.includes(e.enc) && c[e.sp] > 1 && !e.rare && !e.pack && !e.wxm && !e.champ12 && !e.bounty12 && !e.scare12);
      if (cand.length) { const e = pick(cand), row = e.enc.table.find(r => r[0] === sp); e.sp = sp; e.lv = rnd(row[1], row[2]); e.img = roamImg12(sp); e.aggro = chance(0.5) && e.lv >= (this.st.lv || 1) - 2; continue; }
      const spots = this.roamSpots16(false).filter(([x, y]) => zones.includes(zoneAt16(d, x, y)) && !L.some(q => q.x === x && q.y === y)); if (!spots.length) continue;
      const e = this.roamMake16(pick(spots), sp); if (e) L.push(e); }
    if (isDungeon16(d)) { const want = rnd(ROAM16.DUNGEON[0], ROAM16.DUNGEON[1]); let tries = 0;
      while (L.length < want && tries++ < 20) { const spots = this.roamSpots16(false).filter(([x, y]) => !L.some(q => q.x === x && q.y === y)); if (!spots.length) break; const e = this.roamMake16(pick(spots)); if (e) L.push(e); } }
    return L; }; }
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (...a) { _ld.apply(this, a); if (this.roam12 && this.roam12.size16 == null) this.roam12.size16 = this.roam12.list.length; }; }
// 4. a beaten one is replaced after a walk, out of sight, preferring a species the map is missing now
{ const _dr = Overworld.prototype.roamDrop12; Overworld.prototype.roamDrop12 = function (e) { _dr.call(this, e);
    if (e && e.roam && !e.bounty12 && this.roam12 && roamOn12(this.map.d)) (this.roam12.refill16 || (this.roam12.refill16 = [])).push((this.st.steps || 0) + ROAM16.REFILL + rnd(0, 10)); }; }
{ const _os = Overworld.prototype.onStep; Overworld.prototype.onStep = function () { _os.call(this); const R = this.roam12, st = this.st;
    if (!R || !R.refill16 || !R.refill16.length || this.script || !roamOn12(this.map.d) || R.map !== st.map) return;
    const due = R.refill16.filter(t => t <= (st.steps || 0)); if (!due.length) return; R.refill16 = R.refill16.filter(t => t > (st.steps || 0));
    for (let i = 0; i < due.length; i++) { if (R.size16 && R.list.length >= R.size16) break; const spots = this.roamSpots16(true); if (!spots.length) break;
      const have = new Set(R.list.map(q => q.sp)), miss = [...roamSpecies16(this.map.d).keys()].filter(sp => !have.has(sp)), spot = pick(spots), z = zoneAt16(this.map.d, spot[0], spot[1]);
      const sp = miss.find(s => z && z.table.some(r => r[0] === s && r[3] > 0)) || null, e = this.roamMake16(spot, sp); if (!e) continue;
      e.moving = false; e.px = e.x * 16; e.py = e.y * 16; R.list.push(e); this.elites.push(e); } }; }
