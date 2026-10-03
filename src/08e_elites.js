/* ===================== v19 ELITES & BOSSES ON THE MAP: chibi walkers, "fight or retreat?" prompt, respawn, memory steles =====================
   - Elites / bosses walk the map as Q-style chibis drawn by Codex (art/battle/field → BATTLE_FIELD_SRC, 32×32, 4 dirs × 2 steps).
     Without art the old mini portrait is used.
   - Being spotted or talking to one opens a card: portrait, Lv, danger ★, what it drops → 迎戰 / 撤退.
   - Defeated elites come back after 250 steps (rematch: Lv+3, rolls the loot table).
   - A defeated boss leaves a 回憶石碑 on its spot: fight it again at Lv+3 (+1 break shield) for its loot table. */
const BATTLE_FIELD = {};
for (const k in (typeof BATTLE_FIELD_SRC !== 'undefined' ? BATTLE_FIELD_SRC : {})) { const im = new Image(); im.onload = () => { im.ok = true; }; im.src = BATTLE_FIELD_SRC[k]; BATTLE_FIELD[k] = im; }
const FIELD_DIRS = ['down', 'up', 'left', 'right'];
const fieldArtOf = sp => { const k = BATTLE_FIELD[sp] ? sp : (HD_RIG_OF && HD_RIG_OF[sp] && BATTLE_FIELD[HD_RIG_OF[sp]] ? HD_RIG_OF[sp] : null); return k && BATTLE_FIELD[k].ok ? BATTLE_FIELD[k] : null; };
const FIELD_TINT = {}; // recolour variants: tint the base chibi like the battle sprite
function fieldFrame(sp, dir, step) {
  const im = fieldArtOf(sp); if (!im) return null; const i = FIELD_DIRS.indexOf(dir) * 2 + (step ? 1 : 0), fw = im.height;
  const key = sp + i; if (FIELD_TINT[key]) return FIELD_TINT[key];
  const c = mkCanvas(fw, fw), x = c.getContext('2d'); x.drawImage(im, i * fw, 0, fw, fw, 0, 0, fw, fw);
  if (!BATTLE_FIELD[sp] && typeof pxVariant === 'function' && pxBaseOf(sp)) { // copy the battle recolour onto the chibi
    const v = pxVariant(sp), b = pxImage(pxBaseOf(sp)); if (v && b) { const P = paletteMap(b, v), id = x.getImageData(0, 0, fw, fw), d = id.data; for (let j = 0; j < d.length; j += 4) if (d[j + 3]) { const m = P[(d[j] >> 3) + ',' + (d[j + 1] >> 3) + ',' + (d[j + 2] >> 3)]; if (m) { d[j] = m[0]; d[j + 1] = m[1]; d[j + 2] = m[2]; } else { const [h, s, l] = rgb2hsl(d[j], d[j + 1], d[j + 2]); const q = hex2rgb(hsl2hex(h + P._dh, s * P._ks, l * P._kl)); d[j] = q[0]; d[j + 1] = q[1]; d[j + 2] = q[2]; } } x.putImageData(id, 0, 0); }
  }
  return FIELD_TINT[key] = c;
}
function paletteMap(a, b) { // average hue/sat/light shift between the base strip and its recolour
  const ca = mkCanvas(a.width, a.height), cb = mkCanvas(a.width, a.height); ca.getContext('2d').drawImage(a, 0, 0); cb.getContext('2d').drawImage(b, 0, 0);
  const A = ca.getContext('2d').getImageData(0, 0, a.width, a.height).data, B = cb.getContext('2d').getImageData(0, 0, a.width, a.height).data, dh = [], ks = [], kl = [];
  for (let i = 0; i < A.length; i += 64) if (A[i + 3] > 200) { const p = rgb2hsl(A[i], A[i + 1], A[i + 2]), q = rgb2hsl(B[i], B[i + 1], B[i + 2]); if (p[1] > 0.15) { dh.push(((q[0] - p[0] + 540) % 360) - 180); ks.push(q[1] / Math.max(0.05, p[1])); } if (p[2] > 0.05) kl.push(q[2] / p[2]); }
  const med = t => { t.sort((x, y) => x - y); return t.length ? t[t.length >> 1] : 0; };
  return { _dh: med(dh), _ks: med(ks) || 1, _kl: med(kl) || 1 };
}
{ const _dm = Overworld.prototype.drawMon; Overworld.prototype.drawMon = function (x, e, camX, camY) {
    const step = e.moving ? (e.prog < 8 ? 1 : 0) : Math.floor((this.t + e.x * 7) / 24) % 2, f = fieldFrame(e.sp, e.dir, step);
    if (!f) return _dm.call(this, x, e, camX, camY);
    const sx = Math.round(e.px) - camX - 8, sy = Math.round(e.py) - camY - 17;
    x.fillStyle = 'rgba(20,40,20,0.3)'; x.beginPath(); x.ellipse(Math.round(e.px) - camX + 8, Math.round(e.py) - camY + 14, 8, 3, 0, 0, 7); x.fill();
    x.drawImage(f, sx, sy);
    if (e.rematch && Math.floor(this.t / 20) % 3 === 0) { x.fillStyle = '#ffd040'; x.fillRect(sx + 15, sy - 3, 2, 2); }
  };
  const _db = Overworld.prototype.drawBoss; Overworld.prototype.drawBoss = function (x, e, camX, camY) {
    const f = fieldFrame(e.sp, 'down', Math.floor(this.t / 30) % 2); if (!f) return _db.call(this, x, e, camX, camY);
    const s = 48, sx = Math.round(e.px) - camX + 16 - s / 2, sy = Math.round(e.py) - camY + 16 - s - 1;
    x.fillStyle = 'rgba(0,0,0,0.3)'; x.beginPath(); x.ellipse(Math.round(e.px) - camX + 16, Math.round(e.py) - camY + 14, 15, 4, 0, 0, 7); x.fill();
    x.imageSmoothingEnabled = false; x.drawImage(f, sx, sy, s, s);
    if (this.bossGlow) { x.globalAlpha = this.bossGlow; x.fillStyle = '#ffd040'; x.fillRect(sx + 18, sy + 14, 12, 3); x.globalAlpha = 1; }
  };
}

/* ---------- encounter card ---------- */
function battlePortrait(sp) { // idle frame 1 of the battle strip, or null
  if (typeof pxReady !== 'function' || !pxReady(sp)) return null; const im = pxImage(sp), m = pxMeta(sp); if (!im) return null;
  if (!m) return im; const c = mkCanvas(m.w, m.h); c.getContext('2d').drawImage(im, 0, 0, m.w, m.h, 0, 0, m.w, m.h); return c;
}
function dangerStars(lv) { const d = lv - Game.st.lv; return d <= -4 ? 1 : d <= -1 ? 2 : d <= 1 ? 3 : d <= 3 ? 4 : 5; }
function lootHint(key, sp) { const first = !((Game.st.kills || {})[key]), sig = (LOOT[key] || [])[0] || (SPECIES[sp] || {}).drop; if (first && sig) return '首次擊敗：必定掉落紅色「' + GEAR[classGear(sig)].n + '」'; if (LOOT[key]) return '重戰掉落：' + LOOT[key].map(k => GEAR[classGear(k)].n).slice(0, 3).join('、') + '…'; return ''; }
function encounterCard(sp, lv, key, kind, extra) {
  const pic = battlePortrait(sp), stars = dangerStars(lv), hint = lootHint(key, sp);
  let hz = 8; while (hz > 7 && Font.width(hint, hz) > W - 30) hz--; const hl = hint ? Font.wrap(hint, W - 30, hz).slice(0, 2) : [];
  return { draw(x) {
    const X = 8, Y = 18, w = W - 16, h = 110 + hl.length * 10; drawPanel(x, X, Y, w, h, kind === 'boss' ? '#ff6b7a' : '#ffc46b');
    Font.drawC(x, (kind === 'boss' ? '頭目' : '菁英魔物') + (extra ? '・' + extra : ''), W / 2, Y + 3, kind === 'boss' ? '#ff9aa4' : '#ffd890', UIC.textSh, 9);
    if (pic) { const s = Math.min(1, 70 / pic.height, 100 / pic.width); x.imageSmoothingEnabled = false; x.drawImage(pic, Math.round(W / 2 - pic.width * s / 2), Math.round(Y + 15 + 70 - pic.height * s), Math.round(pic.width * s), Math.round(pic.height * s)); }
    Font.drawC(x, SPECIES[sp].n + '　Lv' + lv, W / 2, Y + 86, UIC.text, UIC.textSh, 11);
    let s = ''; for (let i = 0; i < 5; i++) s += i < stars ? '★' : '☆'; Font.drawC(x, '危險度 ' + s, W / 2, Y + 99, stars >= 4 ? '#ff7a7a' : stars === 3 ? '#ffd070' : '#9ad890', UIC.textSh, 9);
    hl.forEach((l, i) => Font.drawC(x, l, W / 2, Y + 108 + i * 10, '#c8b0ff', UIC.textSh, hz));
  } };
}
function* askFight(sp, lv, key, kind, extra) {
  const card = encounterCard(sp, lv, key, kind, extra); UI.push(card);
  const r = yield* ask('要迎戰嗎？', ['迎戰', '撤退'], { cancel: false }); UI.remove(card); return r === 0;
}

/* ---------- elites: prompt, retreat, respawn ---------- */
const ELITE_RESPAWN = 250;
{ const _ld = Overworld.prototype.load; Overworld.prototype.load = function (id, x, y, dir, silent) {
    _ld.call(this, id, x, y, dir, silent); const st = this.st, down = st.eliteDown || {};
    for (const e of this.map.d.elites || []) if (st.flags[e.id] && (st.steps || 0) - (down[e.id] || 0) >= ELITE_RESPAWN && !this.elites.some(q => q.id === e.id) && !(e.x === this.p.x && e.y === this.p.y))
      this.elites.push(new Entity({ ...e, lv: e.lv + 3, rematch: true, home: [e.x, e.y, e.dir], img: monsterMini(e.sp, 24) }));
    const bd = this.map.d.boss; if (bd && id !== 'rift' && st.flags[bd.flag || 'golem']) this.npcs.push(new Entity({ id: 'stele', x: bd.x, y: bd.y, dir: 'down', frames: STELE_FRAMES, stele: bd }));
    for (const s of this.map.d.steles || []) if (!s.show || s.show(st)) this.npcs.push(new Entity({ id: 'stele', dir: 'down', frames: STELE_FRAMES, ...s, stele: s }));
  };
  const _in = Overworld.prototype.interact; Overworld.prototype.interact = function () {
    const p = this.p, [dx, dy] = DIRS[p.dir], ent = this.entityAt(p.x + dx, p.y + dy, p);
    if (ent && ent.stele) { this.run(this.steleTalk(ent)); return true; }
    return _in.call(this);
  };
}
Overworld.prototype.eliteTalk = function* (e) {
  const p = this.p, st = this.st; p.dir = e.x < p.x ? 'left' : e.x > p.x ? 'right' : e.y < p.y ? 'up' : 'down'; e.dir = OPP[p.dir];
  Sound.cry(Object.keys(SPECIES).indexOf(e.sp) + 1);
  if (!e.rematch) yield* sayAll(ELITE_TEXT[e.id] || ['……！']); else yield* say(SPECIES[e.sp].n + '又回來了！看起來比上次更兇猛……');
  const lvShown = e.lv + ngOf() * NG_LV;
  if (!(yield* askFight(e.sp, lvShown, e.id, 'elite', e.rematch ? '再戰' : ''))) { yield* this.retreatFrom(e); return; }
  const res = yield* this.battleScript({ sp: e.sp, lv: e.lv, kind: 'elite', id: e.id, drop: e.rematch ? null : e.drop, rematch: e.rematch }, true);
  { const i = this.elites.findIndex(q => q !== e && q.id === e.id); if (i >= 0) this.elites[i] = e; } // the post-battle map reload rebuilt this elite as a new entity: keep the one we fought
  if (res === 'win') {
    const firstWin = !st.flags[e.id]; st.flags[e.id] = 1; (st.eliteDown || (st.eliteDown = {}))[e.id] = st.steps || 0; this.elites = this.elites.filter(x => x !== e && x.id !== e.id);
    if (firstWin && e.id === 'boneKnight') { yield* say('骸骨騎士倒下後，身後的石棺打開了……'); st.money += 2000; st.bag.powerFruit = (st.bag.powerFruit || 0) + 1; yield* itemGet(st.name + '找到了古王的寶藏：2000 G和力量果實！'); }
    if (firstWin && Events['eliteWin_' + e.id]) { const mid = this.map.id; yield* Events['eliteWin_' + e.id](this, e);
      if (Game.scene === this && this.map && this.map.id === mid) this.load(mid, this.p.x, this.p.y, this.p.dir, true); } // v12.0.1: the win event changes flags (漢斯 wakes up, 格倫 breaks camp…) — rebuild the map so the NPCs move at once
    if (firstWin && !STORY_ELITES12.includes(e.id)) yield* say('（打倒的菁英魔物，過一段時間會再出現。再戰時會掉落不同的裝備。）'); // v12.0.3: story elites stay down
  } else yield* this.retreatFrom(e, res);
};
Overworld.prototype.retreatFrom = function* (e, res) {
  const [hx, hy, hd] = e.home; e.x = e.tx = hx; e.y = e.ty = hy; e.px = hx * TS; e.py = hy * TS; e.dir = hd; e.moving = false; e.calmUntil = (this.st.steps || 0) + 40;
  if (!res) { // step back one tile if possible
    const p = this.p, [dx, dy] = DIRS[p.dir], bx = p.x - dx, by = p.y - dy;
    if (!this.solidAt(bx, by) && !this.entityAt(bx, by, p)) { p.x = p.tx = bx; p.y = p.ty = by; p.px = bx * TS; p.py = by * TS; this.st.x = bx; this.st.y = by; }
    yield* say('悄悄地退開了。' + SPECIES[e.sp].n + '暫時不會追過來。');
  } else if (res === 'run' && this.elites.includes(e)) yield* say(SPECIES[e.sp].n + '回到了原本的地方，暫時不會再追過來了。');
};
// the "!" chase now ends in the same prompt
Overworld.prototype.eliteSpot = function* (e) {
  const p = this.p; p.dir = OPP[e.dir];
  Sound.sfx('exclaim'); e.excl = 40; yield* wait(40);
  const [dx, dy] = DIRS[e.dir];
  while (Math.abs(e.x - p.x) + Math.abs(e.y - p.y) > 1) { e.tx = e.x + dx; e.ty = e.y + dy; e.moving = true; e.prog = 0; e.speed = 1; while (e.moving) { this.updateMove(e); yield; } }
  yield* this.eliteTalk(e);
};

/* ---------- memory steles: boss rematches ---------- */
const STELE_IMG = spriteFrom(['...kkkkkkkk.....', '..kSSSSSSSSk....', '.kSsSSSSSSsSk...', '.kSSSGGGGSSSk...', '.kSSGgGGgGSSk...', '.kSSSGggGSSSk...', '.kSSSSGGSSSSk...', '.kSSSGGGGSSSk...', '.kSsSSSSSSsSk...', '.kSSSSSSSSSSk...', '.kSsSSSSSSsSk...', '.kSSSSSSSSSSk...', '.kSSSSSSSSSSk...', 'kkSSSSSSSSSSkk..', 'kSSSSSSSSSSSSk..', 'kkkkkkkkkkkkkk..'],
  { k: '#1a1420', S: '#8a8698', s: '#6a667a', G: '#7ae0ff', g: '#e8fbff' });
const STELE_FRAMES = (() => { const c = mkCanvas(16, 22); c.getContext('2d').drawImage(STELE_IMG, 0, 6); const a = [c, c, c, c]; return { down: a, up: a, left: a, right: a }; })();
Overworld.prototype.steleTalk = function* (s) {
  const bd = s.stele, sp = bd.sp, st = this.st, lv = (bd.lv || MAPS[this.map.id].boss && MAPS[this.map.id].boss.lv || 15) + 3;
  yield* say('刻著' + SPECIES[sp].n + '身影的「回憶石碑」。\n手放上去，就能再次和牠交手。');
  if (!(yield* askFight(sp, lv + ngOf() * NG_LV, sp, 'boss', '再戰'))) return;
  const res = yield* this.battleScript({ sp, lv, kind: 'boss', id: sp, rematch: true, bg: bd.bg });
  if (res === 'win') yield* say('石碑的光芒暫時黯淡了下來。');
};
