/* ===================== OVERWORLD ===================== */
const CAM_X = Math.floor(W / 2) - 8, CAM_Y = 100;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
const SOLID = new Set('TWobSFPRXYUNxwckhaBQKCpV'.split(''));
const hash2 = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

class GameMap {
  constructor(id) {
    const d = MAPS[id]; this.id = id; this.d = d; this.rows = d.rows; this.w = d.rows[0].length; this.h = d.rows.length;
    this.block = new Set(); this.doors = {}; this.bimgs = [];
    for (const b of d.buildings || []) {
      for (let yy = b.y; yy < b.y + b.h; yy++) for (let xx = b.x; xx < b.x + b.w; xx++) this.block.add(xx + ',' + yy);
      const dk = (b.x + b.door) + ',' + (b.y + b.h - 1); this.block.delete(dk); this.doors[dk] = b;
      this.bimgs.push({ b, img: buildBuilding(b) });
    }
  }
  ch(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this.d.border || 'X'; return this.rows[y][x]; }
}
const mapCache = {}; const getMap = id => mapCache[id] || (mapCache[id] = new GameMap(id));

class Entity {
  constructor(o) { Object.assign(this, o); this.px = this.x * 16; this.py = this.y * 16; this.moving = false; this.foot = 0; this.prog = 0; this.speed = 1; this.timer = rnd(60, 200); this.hx = this.x; this.hy = this.y; }
}

class Overworld {
  constructor() { this.script = null; this.anim = {}; this.popup = null; this.t = 0; this.doorAnim = null; this.frozen = false; }
  enter() { }
  get st() { return Game.st; }
  load(id, x, y, dir, silent) {
    const prev = this.map && this.map.d.name; this.map = getMap(id); const st = this.st; st.map = id; st.x = x; st.y = y; st.dir = dir || st.dir || 'down';
    this.p = new Entity({ x, y, dir: st.dir }); this.p.isPlayer = true;
    this.npcs = (this.map.d.npcs || []).filter(n => !n.show || n.show(st)).map(n => new Entity({ ...n, frames: npcFrames(n.look) }));
    this.elites = (this.map.d.elites || []).filter(e => !st.flags[e.id]).map(e => new Entity({ ...e, home: [e.x, e.y, e.dir], img: monsterMini(e.sp, 24) }));
    this.items = (this.map.d.items || []).filter(i => !st.flags[i.id] && (!i.show || i.show(st))).map(i => new Entity({ ...i }));
    st.gath = st.gath || {}; for (const g of this.map.d.gathers || []) if (st.gath[g.id] === undefined || (st.steps || 0) - st.gath[g.id] > GATHER_RESPAWN) this.items.push(new Entity({ ...g, gather: 1 }));
    if (st.flags.caravanMet && !st.flags.caravan && id !== 'route') { st.flags.caravan = 'lost'; st.flags.mineOpen = 1; }
    const bd = this.map.d.boss; this.boss = bd && !st.flags[bd.flag || 'golem'] ? new Entity({ ...bd, img: monsterMini(bd.sp, 36), w2: 1 }) : null;
    // neighbors for seamless connections
    this.conn = {}; const c = this.map.d.connect || {}; for (const k in c) this.conn[k] = { m: getMap(c[k].map), dx: c[k].dx };
    if (this.map.d.music) Sound.play(this.map.d.music);
    if (!silent && this.map.d.name !== prev && (this.map.d.outdoor || this.map.d.popup || id === 'ruins')) this.popup = { name: this.map.d.name, t: 0 };
    markVis(this.map, x, y); this.checkSight();
  }
  tileAt(x, y) {
    const m = this.map;
    if (x >= 0 && y >= 0 && x < m.w && y < m.h) return m.rows[y][x];
    if (y < 0 && this.conn.n) { const o = this.conn.n; return o.m.ch(x - o.dx, o.m.h + y); }
    if (y >= m.h && this.conn.s) { const o = this.conn.s; return o.m.ch(x - o.dx, y - m.h); }
    if (y < 0 && y >= -8 && x >= 0 && x < m.w && this.map.d.outdoor) return 'T';
    return m.d.border || 'X';
  }
  entityAt(x, y, except) {
    for (const n of this.npcs) if (n !== except && ((n.x === x && n.y === y) || (n.moving && n.tx === x && n.ty === y))) return n;
    for (const e of this.elites) if (e.x === x && e.y === y) return e;
    for (const i of this.items) if (i.x === x && i.y === y) return i;
    if (this.boss && (this.boss.x === x || this.boss.x + 1 === x) && this.boss.y === y) return this.boss;
    if (this.p !== except && ((this.p.x === x && this.p.y === y) || (this.p.moving && this.p.tx === x && this.p.ty === y))) return this.p;
    return null;
  }
  solidAt(x, y) { const c = this.tileAt(x, y); if (SOLID.has(c) || (c === 't' && !this.st.flags.golem) || (c === 'Z' && this.st.flags.golem)) return true; if (x >= 0 && y >= 0 && x < this.map.w && y < this.map.h && this.map.block.has(x + ',' + y)) return true; return false; }
  /* ---------- update ---------- */
  update() {
    this.t++; this.st.time = (this.st.time || 0) + 1;
    for (const k in this.anim) if (--this.anim[k] <= 0) delete this.anim[k];
    if (this.popup) { this.popup.t++; if (this.popup.t > 170) this.popup = null; }
    this.updateNPCs();
    this.updateMove(this.p);
    if (this.script) { const r = this.script.next(); if (r.done) this.script = null; return; }
    if (this.t % 30 === 0) checkAch();
    if (this.p.moving || this.p.jump) return;
    // input
    if (Input.pressed('start')) { Input.consume('start'); this.run(startMenu()); return; }
    if (Input.pressed('a')) { Input.consume('a'); if (this.interact()) return; }
    const tapped = ['up', 'down', 'left', 'right'].find(k => Input.pressed(k));
    if (!Input.dir() && tapped) { this.p.dir = tapped; this.st.dir = tapped; return; }
    const d = Input.dir();
    if (d) {
      if (d !== this.p.dir && Input.t[d] <= 1 && !this.p.walkedLast) { this.p.dir = d; this.p.turnT = 5; return; }
      if (this.p.turnT > 0) { this.p.turnT--; if (Input.t[d] < 6) return; }
      this.tryMove(d, Input.held('b'));
    } else { this.p.walkedLast = false; this.p.turnT = 0; }
  }
  run(gen) { this.script = gen; const r = gen.next(); if (r.done) this.script = null; }
  tryMove(d, run) {
    const p = this.p; p.dir = d; const [dx, dy] = DIRS[d]; const nx = p.x + dx, ny = p.y + dy; const m = this.map; this.st.dir = d;
    // interior exit mat
    if (m.d.exit && p.x === m.d.exit.x && p.y === m.d.exit.y && d === 'down') { const t = m.d.exit.to; this.run(this.warp(t[0], t[1], t[2], 'down', true)); return; }
    if (m.d.southWarp && d === 'down' && ny >= m.h) { const t = m.d.southWarp.to; this.run(this.warp(t[0], t[1], t[2], t[3])); return; }
    for (const w of m.d.edgeWarps || []) if (w.dir === d && (d === 'left' ? nx < 0 : d === 'right' ? nx >= m.w : d === 'up' ? ny < 0 : ny >= m.h) && w.at.includes(d === 'left' || d === 'right' ? ny : nx)) { if (w.need && !this.st.flags[w.need]) { Sound.sfx('bump'); this.run(say(w.msg)); return; } const t = w.to; this.run(this.warp(t[0], t[1], t[2], t[3])); return; }
    if (m.d.northWarp && d === 'up' && ny < 0 && m.d.northWarp.x.includes(nx)) { const t = m.d.northWarp.to; this.run(this.warp(t[0], t[1], t[2], t[3])); return; }
    const tc = this.tileAt(nx, ny);
    if (tc === 'L' && d === 'down' && !this.entityAt(nx, ny + 1) && !this.solidAt(nx, ny + 1)) { this.startJump(p, nx, ny + 1); return; }
    const door = m.doors[nx + ',' + ny];
    if (door && d === 'up') { this.run(this.enterDoor(door, nx, ny)); return; }
    if (tc === 'L' || this.solidAt(nx, ny) || this.entityAt(nx, ny, p)) { Sound.sfx('bump'); p.bumpT = (p.bumpT || 0) + 1; this.p.walkedLast = true; return; }
    // map connection (seamless)
    if (ny < 0 && this.conn.n) { this.switchMap('n', nx, ny); return this.tryMoveContinue(d, run); }
    if (ny >= m.h && this.conn.s) { this.switchMap('s', nx, ny); return this.tryMoveContinue(d, run); }
    if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) { Sound.sfx('bump'); return; }
    this.startMove(p, nx, ny, run ? 2 : 1); this.p.walkedLast = true;
  }
  tryMoveContinue(d, run) { const p = this.p; const [dx, dy] = DIRS[d]; this.startMove(p, p.x + dx, p.y + dy, run ? 2 : 1); p.walkedLast = true; }
  switchMap(side, nx, ny) {
    const o = this.conn[side]; const p = this.p; const oldH = this.map.h;
    let x2, y2; if (side === 'n') { x2 = p.x - o.dx; y2 = p.y + o.m.h; } else { x2 = p.x - o.dx; y2 = p.y - oldH; }
    const dir = p.dir; this.load(o.m.id, x2, y2, dir);
  }
  startMove(e, nx, ny, speed) { e.tx = nx; e.ty = ny; e.moving = true; e.prog = 0; e.speed = speed; e.foot ^= 1; }
  startJump(e, nx, ny) { Sound.sfx('jump'); e.tx = nx; e.ty = ny; e.moving = true; e.jump = true; e.prog = 0; e.speed = 1; e.foot ^= 1; }
  updateMove(e) {
    if (!e.moving) return;
    const dist = e.jump ? 32 : 16; e.prog += e.speed;
    const t = Math.min(1, e.prog / dist);
    e.px = lerp(e.x * 16, e.tx * 16, t); e.py = lerp(e.y * 16, e.ty * 16, t);
    e.hop = e.jump ? Math.sin(t * Math.PI) * 10 : 0;
    if (e.prog >= dist) {
      e.x = e.tx; e.y = e.ty; e.px = e.x * 16; e.py = e.y * 16; e.moving = false; e.hop = 0;
      if (e.jump) { e.jump = false; Sound.sfx('land'); }
      if (e === this.p) this.onStep();
    }
  }
  onStep() {
    const p = this.p, st = this.st; st.x = p.x; st.y = p.y; st.steps = (st.steps || 0) + 1; markVis(this.map, p.x, p.y);
    const c = this.tileAt(p.x, p.y);
    if (c === '#') { this.anim['g' + p.x + ',' + p.y] = 10; Sound.sfx('grass'); }
    // poison
    if (st.status === 'psn' && st.steps % 4 === 0 && st.hp > 1) { st.hp--; Game.flash = 0.35; Game.flashColor = '#a048a8'; Sound.sfx('poison'); if (st.hp <= 1) { st.status = null; this.run(say(st.name + '撐過了毒素，中毒治好了！')); return; } }
    // triggers
    for (const tr of this.map.d.triggers || []) if (tr.x === p.x && tr.y === p.y) { const ev = Events[tr.id]; if (ev) { const g = ev(this); if (g) { this.run(g); return; } } }
    if (this.checkSight()) return;
    // encounters
    if ((c === '#' || (this.map.d.encAll && c === 's')) && !Game.noEnc) {
      const enc = (this.map.d.encounters || []).find(e => p.y >= e.y0 && p.y <= e.y1);
      if (enc && chance(enc.rate) && (st.steps - (st.lastBattleStep || 0)) > 2) {
        const rr = this.map.d.rare; if (rr && chance(0.03)) { this.run(this.battleScript({ sp: rr[0], lv: rnd(rr[1], rr[2]), kind: 'wild' })); return; }
        if (st.lv >= 8 && chance(0.12)) { this.run(this.packScript(enc)); return; }
        const row = rollEnc(enc); this.run(this.battleScript({ sp: row[0], lv: rnd(row[1], row[2]), kind: 'wild' }));
      }
    }
  }
  checkSight() {
    const p = this.p; if (this.script) return false;
    for (const e of this.elites) {
      if ((this.st.steps || 0) < (e.calmUntil || 0)) continue; // just escaped from it: it doesn't chase
      const [dx, dy] = DIRS[e.dir];
      for (let i = 1; i <= e.sight; i++) {
        const x = e.x + dx * i, y = e.y + dy * i;
        if (this.solidAt(x, y)) break;
        if (x === p.x && y === p.y) { this.run(this.eliteSpot(e)); return true; }
        if (this.entityAt(x, y, e)) break;
      }
    }
    return false;
  }
  updateNPCs() {
    for (const n of this.npcs) {
      this.updateMove(n);
      if (n.moving || !n.walk || this.script) continue;
      if (--n.timer <= 0) {
        n.timer = rnd(90, 240); const d = pick(['up', 'down', 'left', 'right']); n.dir = d; const [dx, dy] = DIRS[d]; const nx = n.x + dx, ny = n.y + dy;
        if (Math.abs(nx - n.hx) <= n.walk && Math.abs(ny - n.hy) <= n.walk && !this.solidAt(nx, ny) && !this.entityAt(nx, ny, n) && this.tileAt(nx, ny) !== 'L' && !this.map.doors[nx + ',' + ny] && !(this.map.d.exit && nx === this.map.d.exit.x && ny === this.map.d.exit.y)) this.startMove(n, nx, ny, 1);
      }
    }
    for (const e of this.elites) { e.bob = Math.sin((this.t + e.x * 10) / 14); if (e.excl > 0) e.excl--; }
    if (this.p.excl > 0) this.p.excl--;
  }
  /* ---------- interaction ---------- */
  interact() {
    const p = this.p; const [dx, dy] = DIRS[p.dir]; let x = p.x + dx, y = p.y + dy;
    let ent = this.entityAt(x, y, p); let c = this.tileAt(x, y);
    if (!ent && c === 'C') { ent = this.entityAt(x + dx, y + dy, p); }
    if (ent && ent.frames) { if (!ent.moving) { ent.dir = OPP[p.dir]; } const ev = Events[ent.id], cq = npcCommission(ent.id, this, ent); this.run(cq || (ev ? ev(this, ent) : say('……'))); return true; }
    if (ent && ent.sp && ent !== this.boss) { this.run(this.eliteTalk(ent)); return true; }
    if (ent && ent === this.boss) { const g = Events[this.map.d.boss.ev || 'bossLine'](this); if (g) this.run(g); return true; }
    if (ent && (ent.item || ent.gold || ent.gather)) { this.run(this.pickItem(ent)); return true; }
    const gt = this.map.d.gate; if (gt && gt.big && (x === gt.x || x === gt.x + 1) && y === gt.y + 1) { this.run(say(this.st.flags.gateOpen ? '異界之門靜靜地沉睡著。門後只剩下北方的黑雲……（第二章「魔王軍的影子」，敬請期待！）' : '巨大的石門緊緊關著，上面刻著發光的古老紋路。這就是「異界之門」……')); return true; }
    const sign = (this.map.d.signs || {})[x + ',' + y];
    if (c === 'S' && sign) { this.run(say(sign, { style: 'sign' })); return true; }
    if (c === 'Y') { this.run(Events.spring(this)); return true; }
    if (c === 't') { this.run(say(this.st.flags.golem ? '樹輕輕搖晃，枝葉讓出了一條路。' : '一棵古老的大樹。樹幹上有奇妙的紋路……好像在沉睡。')); return true; }
    if (c === 'U') { this.run(Events.well(this)); return true; }
    if (c === 'N') { this.run(Events.board(this)); return true; }
    if (c === 'Z' && this.st.flags.golem) { const ow = this; this.run((function* () { if (yield* yesNo('石板下出現了往地底延伸的樓梯。要走下去嗎？')) yield* ow.warp('catacomb', 9, 20, 'up'); })()); return true; }
    const flavor = { k: '書架上擺滿了關於魔物與冒險的書。', w: '窗外是萌芽鎮悠閒的風景。', c: '燭火靜靜地搖曳著。', h: '架子上整齊地擺滿了商品。', K: '書架上有一本《魔物種族圖說》。\n「獸、蟲、植物怕火；飛禽、軟泥怕雷；石像怕水和草；亡者怕火。」', V: '木箱裡裝滿了蘋果和藥瓶。', Q: '桌上放著熱騰騰的早餐。', o: '一塊大石頭。', b: '修剪整齊的灌木叢。' };
    if (c === 'B' && this.map.id === 'home') { this.run(Events.bed(this)); return true; }
    if (flavor[c]) { this.run(say(flavor[c])); return true; }
    if (c === 'W' && this.map.outdoor !== undefined) { this.run(say('水面倒映著藍天。')); return true; }
    return false;
  }
  *pickItem(it) {
    const st = this.st; this.items = this.items.filter(i => i !== it);
    if (it.gather) { st.gath[it.id] = st.steps || 0; const r = doGather(it.kind || 'herb'); Sound.sfx('item'); yield* say('【' + GATHER_KINDS[it.kind || 'herb'][0] + '】採集到了' + r.text + '！'); if (r.up) { Sound.sfx('statUp'); yield* say('採集熟練度升到了Lv' + r.up + '！' + (r.up === 3 || r.up === 5 ? '\n每次採集的數量+1！' : '\n更容易找到稀有素材了。')); } return; }
    st.flags[it.id] = 1;
    if (it.gold) { st.money += it.gold; Sound.jingle('item'); yield* say(st.name + '撿到了' + it.gold + ' G！'); return; }
    const n = it.n || 1; let nm; if (GEAR[it.item]) nm = gearName(makeGear(classGear(it.item), it.q || 1)); else { st.bag[it.item] = (st.bag[it.item] || 0) + n; nm = ITEMS[it.item].n + (n > 1 ? '×' + n : ''); } const fr = Sound.jingle('item');
    const tb = new TextBox(st.name + '撿到了' + nm + '！'); UI.push(tb);
    for (let i = 0; i < fr || !tb.done; i++) { if (i >= 30 || tb.state !== 'end') tb.update(); yield; if (tb.done && i >= fr) break; }
    UI.remove(tb);
    yield* say(st.name + '把' + (ITEMS[it.item] ? ITEMS[it.item].n : '它') + '放進了' + (GEAR[it.item] ? '裝備欄。' : '背包。'));
  }
  *warp(id, x, y, dir, door) {
    Sound.sfx('door'); yield* fadeOut(12); this.load(id, x, y, dir); yield* wait(4); yield* fadeIn(12);
  }
  *enterDoor(b, dx, dy) {
    Sound.sfx('door'); this.doorAnim = { x: dx, y: dy, t: 0 };
    yield* wait(8); this.startMove(this.p, dx, dy, 1); while (this.p.moving) yield;
    yield* fadeOut(12); this.doorAnim = null; this.load(b.to[0], b.to[1], b.to[2], 'up'); yield* wait(4); yield* fadeIn(12);
  }
  *walkEntity(e, dir, n = 1) { for (let i = 0; i < n; i++) { e.dir = dir; const [dx, dy] = DIRS[dir]; this.startMove(e, e.x + dx, e.y + dy, 1); while (e.moving) { if (e !== this.p) this.updateMove(e); yield; } } }
  *packScript(enc) {
    const st = this.st, n = rnd(2, 3); Sound.sfx('exclaim'); this.p.excl = 30; yield* wait(30);
    yield* say('是魔物群！（連續' + n + '場戰鬥，經驗值+25%）');
    for (let i = 0; i < n; i++) {
      const row = rollEnc(enc), res = yield* this.battleScript({ sp: row[0], lv: rnd(row[1], row[2]) + (i === n - 1 ? 1 : 0), kind: 'wild', pack: [i + 1, n] });
      if (res !== 'win') return;
      if (i < n - 1) { Sound.sfx('exclaim'); this.p.excl = 24; yield* wait(24); yield* say('又有魔物衝過來了！（' + (i + 2) + '/' + n + '）'); }
    }
    const g = 60 * n * Math.ceil(st.lv / 4), mats = Object.keys(ITEMS).filter(k => ITEMS[k].mat && k !== 'crystal'), mt = pick(mats);
    st.money += g; st.bag[mt] = (st.bag[mt] || 0) + 2; st.packs = (st.packs || 0) + 1; Sound.jingle('item');
    yield* say('擊退了魔物群！額外獲得' + g + ' G和' + ITEMS[mt].n + '×2！');
  }
  *eliteSpot(e) {
    const p = this.p; p.dir = OPP[e.dir];
    Sound.sfx('exclaim'); e.excl = 40; yield* wait(40);
    const [dx, dy] = DIRS[e.dir];
    while (Math.abs(e.x - p.x) + Math.abs(e.y - p.y) > 1) { e.tx = e.x + dx; e.ty = e.y + dy; e.moving = true; e.prog = 0; e.speed = 1; while (e.moving) { this.updateMove(e); yield; } }
    yield* this.eliteTalk(e);
  }
  *eliteTalk(e) {
    const p = this.p; p.dir = e.x < p.x ? 'left' : e.x > p.x ? 'right' : e.y < p.y ? 'up' : 'down'; e.dir = OPP[p.dir];
    Sound.cry(Object.keys(SPECIES).indexOf(e.sp) + 1);
    yield* sayAll(ELITE_TEXT[e.id] || ['……！']);
    const res = yield* this.battleScript({ sp: e.sp, lv: e.lv, kind: 'elite', id: e.id, drop: e.drop }, true);
    if (res === 'win') { this.st.flags[e.id] = 1; this.elites = this.elites.filter(x => x !== e); if (e.id === 'boneKnight') { const st = this.st; yield* say('骸骨騎士倒下後，身後的石棺打開了……'); st.money += 2000; st.bag.powerFruit = (st.bag.powerFruit || 0) + 1; yield* itemGet(st.name + '找到了古王的寶藏：2000 G和力量果實！'); } }
    else { const [hx, hy, hd] = e.home; e.x = e.tx = hx; e.y = e.ty = hy; e.px = hx * TS; e.py = hy * TS; e.dir = hd; e.moving = false; e.calmUntil = (this.st.steps || 0) + 40; if (res === 'run' && this.elites.includes(e)) yield* say(SPECIES[e.sp].n + '回到了原本的地方，暫時不會再追過來了。'); }
  }
  *battleScript(cfg, noResume) {
    const st = this.st; st.lastBattleStep = st.steps || 0;
    Sound.play(cfg.kind === 'boss' ? 'boss' : cfg.kind === 'elite' ? 'elite' : 'battle');
    yield* battleTransition(cfg.kind);
    const b = new Battle({ ...cfg, bg: typeof battleBgFor === 'function' ? battleBgFor(this, cfg) : this.map.d.battleBg || 'field' }); Game.setScene(b);
    while (Game.scene === b) yield; // paused until battle ends and returns to overworld
    const res = b.result; Game.trans = null;
    if (res === 'lose') { Game.homeWarp = 0; yield* this.whiteout(); return res; }
    if (Game.homeWarp) { Game.homeWarp = 0; this.load('town', 10, 12, 'down', true); yield* fadeIn(20); yield* say('回到了萌芽鎮。'); return 'run'; }
    this.load(this.map.id, this.p.x, this.p.y, this.p.dir, true);
    yield* fadeIn(14);
    return res;
  }
  *homeWarp() {
    const st = this.st; UI.clear(); Sound.sfx('charge'); yield* say(st.name + '舉起了歸鄉之羽……');
    yield* fadeOut(20); this.load('town', 10, 12, 'down', true); yield* fadeIn(20); yield* say('羽毛化成光芒……回到了萌芽鎮。');
  }
  *whiteout() {
    const st = this.st; Game.fade = 1; this.camDY = 0; this.bossGlow = 0; const lost = Math.floor(st.money / 2); st.money -= lost;
    Sound.stop(); UI.clear();
    const box = { draw(x) { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); } }; UI.push(box);
    Game.fade = 0;
    yield* say(st.name + '眼前一片漆黑……', { style: 'dark', y: 98 });
    if (lost) yield* say('慌亂之中弄丟了' + lost + ' G……', { style: 'dark', y: 98 });
    UI.remove(box); Game.fade = 1;
    healHero(); const r = st.respawn; this.load(r.map, r.x, r.y, r.dir, true);
    yield* fadeIn(20);
    yield* say(r.map === 'home' ? '瑪莎：「你醒啦！別太勉強自己喔。」' : r.map === 'inn' ? '老闆娘：「你被送來這裡了呢。我已經幫你治療好了，要小心喔！」' : '清涼的泉水讓你恢復了精神。');
  }
  /* ---------- draw ---------- */
  draw(x) {
    const p = this.p; let camX = Math.round(p.px) - CAM_X, camY = Math.round(p.py) - CAM_Y + Math.round(this.camDY || 0);
    if (!this.map.d.outdoor && this.map.w * 16 <= W) camX = Math.round((this.map.w * 16 - W) / 2);
    if (!this.map.d.outdoor && this.map.h * 16 <= H - TB_H) camY = Math.round((this.map.h * 16 - (H - TB_H)) / 2) - 8;
    this.camX = camX; this.camY = camY;
    const f = Math.floor(this.t / 20) % 3, f2 = Math.floor(this.t / 30) % 2;
    const tx0 = Math.floor(camX / 16), ty0 = Math.floor(camY / 16);
    x.fillStyle = '#101018'; x.fillRect(0, 0, W, H);
    const objs = [];
    for (let ty = ty0 - 1; ty <= ty0 + Math.ceil(H / 16) + 1; ty++) for (let tx = tx0; tx <= tx0 + Math.ceil(W / 16); tx++) {
      const c = this.tileAt(tx, ty); const sx = tx * 16 - camX, sy = ty * 16 - camY;
      this.drawTile(x, c, tx, ty, sx, sy, f, f2);
      if (c === 'T' || c === 't') objs.push({ k: ty * 16 + 15, d: () => x.drawImage(Tiles.tree, sx, sy - 5) });
      if (c === 'P') objs.push({ k: ty * 16 + 15, d: () => x.drawImage(Tiles.pillar, sx, sy - 7) });
      if (c === 'U') objs.push({ k: ty * 16 + 15, d: () => x.drawImage(Tiles.well, sx, sy - 3) });
    }
    // buildings
    for (const { b, img } of this.map.bimgs) {
      const sx = b.x * 16 - camX, sy = b.y * 16 - camY; x.drawImage(img, sx, sy);
      if (this.doorAnim && this.doorAnim.x === b.x + b.door) archDoorShape(x, sx + b.door * 16 + 2, sy + b.h * 16 - 22, '#18101a');
    }
    // gates
    const g = this.map.d.gate;
    if (g && !g.big) { const sx = (g.x + 1) * 16 - camX, sy = g.y * 16 - camY; const gr = x.createLinearGradient(0, sy, 0, sy + 32); gr.addColorStop(0, '#0a0810'); gr.addColorStop(1, 'rgba(10,8,16,0)'); x.fillStyle = gr; x.fillRect(sx, sy - 16, 32, 48); }
    if (g && g.big) { const sx = g.x * 16 - camX, sy = g.y * 16 - camY; x.drawImage(Tiles.gate(this.st.flags.gateOpen), sx, sy); }
    // entities
    for (const n of this.npcs) objs.push({ k: n.py + 15, d: () => this.drawChar(x, n, n.frames, camX, camY) });
    for (const it of this.items) objs.push({ k: it.py + 15, d: () => { x.drawImage(it.gather ? GATHER_IMG[it.kind] || HERB_IMG : ITEM_BALL, it.px - camX, it.py - camY); if (it.gather && (this.t + it.x * 17) % 80 < 10) { const s = (this.t + it.x * 17) % 80; x.fillStyle = '#ffffff'; x.fillRect(it.px - camX + 11, it.py - camY + 2 + (s >> 2), 1, 3); x.fillRect(it.px - camX + 10, it.py - camY + 3 + (s >> 2), 3, 1); } } });
    for (const e of this.elites) objs.push({ k: e.py + 15, d: () => this.drawMon(x, e, camX, camY) });
    if (this.boss) objs.push({ k: this.boss.py + 15, d: () => this.drawBoss(x, this.boss, camX, camY) });
    if (!this.hideHero) objs.push({ k: p.py + 15.5, d: () => this.drawChar(x, p, heroFramesFor(this.st), camX, camY) });
    objs.sort((a, b) => a.k - b.k); for (const o of objs) o.d();
    // tall grass overlay on hero
    const fx = Math.floor((p.px + 8) / 16), fy = Math.floor((p.py + 12) / 16);
    if (!p.jump && !this.hideHero && this.tileAt(fx, fy) === '#') x.drawImage(this.anim['g' + fx + ',' + fy] ? Tiles.tall(1) : Tiles.tall(0), 0, 7, 16, 9, fx * 16 - camX, fy * 16 - camY + 7, 16, 9);
    // exclamation
    for (const e of this.elites) if (e.excl > 0) { x.drawImage(EXCLAIM, e.px - camX + 5, e.py - camY - 18 - (e.excl > 34 ? (40 - e.excl) : 6)); }
    if (this.p.excl > 0) { x.drawImage(EXCLAIM, p.px - camX + 5, p.py - camY - 20); }
    // map name popup
    if (this.popup) { const t = this.popup.t; const px = t < 12 ? -90 + t * 7.8 : t > 150 ? 4 - (t - 150) * 3 : 4; const w = Font.width(this.popup.name) + 22; const X = Math.round(px); drawPanel(x, X, 4, w, 20, null); x.fillStyle = UIC.accent; x.fillRect(X + 5, 9, 2, 10); Font.draw(x, this.popup.name, X + 11, 5, UIC.text, UIC.textSh); }
  }
  drawTile(x, c, tx, ty, sx, sy, f, f2) {
    const h = hash2(tx, ty);
    const base = () => x.drawImage(Tiles.grass(h % 4), sx, sy);
    switch (c) {
      case '.': case 'T': case 't': base(); break;
      case ',': x.drawImage(Tiles.grass(4 + (h % 2)), sx, sy); break;
      case 'f': x.drawImage(Tiles.flower(f2, 'r'), sx, sy); break;
      case 'y': x.drawImage(Tiles.flower(f2, 'y'), sx, sy); break;
      case '#': x.drawImage(Tiles.tall(this.anim['g' + tx + ',' + ty] ? 1 : 0), sx, sy); break;
      case ':': { const isP = cc => cc === ':' || cc === '='; let m = 0; if (!isP(this.tileAt(tx, ty - 1))) m |= 1; if (!isP(this.tileAt(tx + 1, ty))) m |= 2; if (!isP(this.tileAt(tx, ty + 1))) m |= 4; if (!isP(this.tileAt(tx - 1, ty))) m |= 8; if (this.map.doors[tx + ',' + (ty - 1)]) m &= ~1; x.drawImage(this.map.d.road === 'cobble' ? Tiles.cobble(m, h % 2) : Tiles.path(m), sx, sy); break; }
      case 'W': { const isW = cc => cc === 'W' || cc === '='; let m = 0; if (!isW(this.tileAt(tx, ty - 1))) m |= 1; if (!isW(this.tileAt(tx + 1, ty))) m |= 2; if (!isW(this.tileAt(tx, ty + 1))) m |= 4; if (!isW(this.tileAt(tx - 1, ty))) m |= 8; x.drawImage(Tiles.water(f, m), sx, sy); break; }
      case 'Y': { x.drawImage(Tiles.spring(f), sx, sy); x.fillStyle = '#c8bca4'; const n = this.tileAt(tx, ty - 1) !== 'Y', s = this.tileAt(tx, ty + 1) !== 'Y', w = this.tileAt(tx - 1, ty) !== 'Y', e = this.tileAt(tx + 1, ty) !== 'Y'; if (n) x.fillRect(sx, sy, 16, 3); if (s) x.fillRect(sx, sy + 13, 16, 3); if (w) x.fillRect(sx, sy, 3, 16); if (e) x.fillRect(sx + 13, sy, 3, 16); x.fillStyle = '#8a7e68'; if (n) x.fillRect(sx, sy + 2, 16, 1); if (w) x.fillRect(sx + 2, sy, 1, 16); if (s) x.fillRect(sx, sy + 15, 16, 1); if (e) x.fillRect(sx + 15, sy, 1, 16); break; }
      case '=': x.drawImage(Tiles.bridge, sx, sy); break;
      case 'L': x.drawImage(Tiles.ledge, sx, sy); break;
      case 'o': x.drawImage(Tiles.rock, sx, sy); break;
      case 'U': base(); break;
      case 'b': x.drawImage(Tiles.bush, sx, sy); break;
      case 'S': x.drawImage(Tiles.sign, sx, sy); break;
      case 'N': x.drawImage(Tiles.board, sx, sy); break;
      case 'Z': x.drawImage(this.st.flags.golem ? Tiles.stairs : Tiles.stone(h % 2), sx, sy); break;
      case 'F': { let m = 0; if (this.tileAt(tx + 1, ty) === 'F') m |= 2; if (this.tileAt(tx - 1, ty) === 'F') m |= 8; x.drawImage(Tiles.fence(m), sx, sy); break; }
      case 's': case 'P': x.drawImage(Tiles.stone(h % 2), sx, sy); break;
      case 'm': x.drawImage(Tiles.stone(2), sx, sy); break;
      case 'R': x.drawImage(Tiles.ruinWall(h % 4), sx, sy); break;
      case 'X': x.drawImage(Tiles.voidT, sx, sy); break;
      case 'n': x.drawImage(Tiles.floor, sx, sy); break;
      case 'D': x.drawImage(Tiles.mat, sx, sy); break;
      case 'r': { const isR = cc => cc === 'r'; let m = 0; if (!isR(this.tileAt(tx, ty - 1))) m |= 1; if (!isR(this.tileAt(tx + 1, ty))) m |= 2; if (!isR(this.tileAt(tx, ty + 1))) m |= 4; if (!isR(this.tileAt(tx - 1, ty))) m |= 8; x.drawImage(Tiles.rug(m), sx, sy); break; }
      case 'x': case 'w': case 'c': case 'k': case 'h': case 'a': { const below = this.tileAt(tx, ty + 1); const low = !'xwckha'.includes(below); x.drawImage(Tiles.wall(low, c === 'x' ? '' : c, this.map.d.wallPal), sx, sy); break; }
      case 'B': x.drawImage(this.tileAt(tx, ty - 1) === 'B' ? Tiles.furn.bedBot : Tiles.furn.bedTop, sx, sy); break;
      case 'Q': { let m = 0; if (this.tileAt(tx, ty - 1) === 'Q') m |= 1; if (this.tileAt(tx, ty + 1) === 'Q') m |= 4; if (this.tileAt(tx + 1, ty) !== 'Q') m |= 2; if (this.tileAt(tx - 1, ty) !== 'Q') m |= 8; x.drawImage(Tiles.furn.table(m), sx, sy); break; }
      case 'K': x.drawImage(Tiles.furn.shelf(this.tileAt(tx, ty - 1) !== 'K'), sx, sy); break;
      case 'C': { let m = 0; if (this.tileAt(tx + 1, ty) !== 'C') m |= 2; if (this.tileAt(tx - 1, ty) !== 'C') m |= 8; x.drawImage(Tiles.furn.counter(m), sx, sy); break; }
      case 'p': x.drawImage(Tiles.furn.plant, sx, sy); break;
      case 'V': x.drawImage(Tiles.furn.display(this.tileAt(tx, ty - 1) !== 'V'), sx, sy); break;
      default: base();
    }
  }
  drawChar(x, e, frames, camX, camY) {
    const set = frames[e.dir] || frames.down; let fi = 0;
    if (e.moving) { const half = e.jump ? 16 : 8; fi = e.prog < half ? (e.foot ? 1 : 3) : 0; }
    else if (e === this.p && e.bumpT && Input.dir() && !this.script) { fi = Math.floor(this.t / 8) % 2 ? (e.foot ? 1 : 3) : 0; }
    if (!Input.dir() && e === this.p) e.bumpT = 0;
    const sx = Math.round(e.px) - camX, sy = Math.round(e.py) - camY - 6 - Math.round(e.hop || 0);
    if (e.jump) { x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(Math.round(e.px) - camX + 8, Math.round(e.py) - camY + 14, 6, 2.5, 0, 0, 7); x.fill(); }
    x.drawImage(set[fi], sx, sy);
  }
  drawMon(x, e, camX, camY) {
    const sx = Math.round(e.px) - camX - 4, sy = Math.round(e.py) - camY - 10 + Math.round(e.bob || 0);
    x.fillStyle = 'rgba(20,40,20,0.3)'; x.beginPath(); x.ellipse(Math.round(e.px) - camX + 8, Math.round(e.py) - camY + 13, 9, 3, 0, 0, 7); x.fill();
    const img = (e.dir === 'right' && e.img.flip) ? e.img.flip : e.img.c; x.drawImage(img, sx, sy);
  }
  drawBoss(x, e, camX, camY) {
    const sx = Math.round(e.px) - camX - 2, sy = Math.round(e.py) - camY - 22 + Math.round(Math.sin(this.t / 20));
    x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(Math.round(e.px) - camX + 16, Math.round(e.py) - camY + 13, 15, 4, 0, 0, 7); x.fill();
    x.drawImage(e.img.c, sx, sy);
    if (this.bossGlow) { x.globalAlpha = this.bossGlow; x.fillStyle = '#ffd040'; x.fillRect(sx + 12, sy + 10, 12, 3); x.globalAlpha = 1; }
  }
}
function rollEnc(enc) { const tot = enc.table.reduce((a, r) => a + r[3], 0); let r = Math.random() * tot; for (const e of enc.table) { r -= e[3]; if (r <= 0) return e; } return enc.table[0]; }
const miniCache = {};
function monsterMini(sp, size) { const k = sp + size; if (miniCache[k]) return miniCache[k]; const c = buildShaded(ART[sp], size, size / 64); miniCache[k] = { c, flip: flipCanvas(c) }; return miniCache[k]; }
function healHero() { const st = Game.st, s = heroStats(); st.hp = s.hp; st.mp = s.mp; st.status = null; }

/* ---------- Battle transition (drawn over current scene) ---------- */
function* battleTransition(kind) {
  Sound.sfx('encounter');
  for (let i = 0; i < 2; i++) { Game.flashColor = kind === 'boss' ? '#ff4020' : '#ffffff'; yield* tween(5, t => Game.flash = t * 0.9); yield* tween(5, t => Game.flash = (1 - t) * 0.9); }
  Game.flash = 0;
  const N = 32; Game.trans = { kind, t: 0 };
  yield* tween(N, t => Game.trans.t = t);
  Game.trans.t = 1; yield* wait(6);
}
function drawTransition(x) {
  const tr = Game.trans; if (!tr) return; const t = tr.t; x.fillStyle = '#000';
  if (tr.kind === 'wild') { const n = Math.ceil(H / 16); for (let i = 0; i < n; i++) { const w = clamp(t * 1.8 - i * 0.05, 0, 1) * W; if (i % 2) x.fillRect(0, i * 16, w, 16); else x.fillRect(W - w, i * 16, w, 16); } }
  else if (tr.kind === 'elite') { for (let i = 0; i < Math.ceil(W / 20); i++) for (let j = 0; j < Math.ceil(H / 20); j++) { const k = clamp(t * 2.2 - (i + j) * 0.06, 0, 1); const s = 20 * k; x.fillRect(i * 20 + 10 - s / 2, j * 20 + 10 - s / 2, s, s); } }
  else { const h = t * (H / 2 + 2); for (let i = 0; i < W; i += 8) { const j = ((i / 8) % 2) * 6 * (1 - t); x.fillRect(i, 0, 8, h + j); x.fillRect(i, H - h - j, 8, h + j); } x.fillStyle = '#a02010'; x.globalAlpha = 1 - t; x.fillRect(0, h - 2, W, 2); x.fillRect(0, H - h, W, 2); x.globalAlpha = 1; }
}
