/* ===================== v11 戰鬥顯示層：class Battle（BattleScene） =====================
   docs/battle_v2_design.md §B. BattleCore (10c) runs the whole battle and writes every change as an event in core.log;
   this scene never decides anything. It plays the log back as text, animation, numbers and gauges, and turns the player's
   choices into ActionCommands (core.submit). One hero against 1–3 monsters (a boss can call minions in). */
const FOE_SLOTS = { 1: [[88, 134]], 2: [[56, 137], [122, 128]], 3: [[34, 138], [90, 124], [144, 137]] };
const BADGE_OF = { psn: 'psn', par: 'par', slp: 'slp', brn: 'brn', wet: 'wet', tangle: 'tangle', barrier: 'shield', smoke: 'smoke', critNext: 'focus', frozen: 'frozen' };
const MAJOR_GOT = { psn: '中毒了！', par: '麻痺了！可能會無法行動！', slp: '睡著了！', brn: '灼傷了！' };
const MAJOR_FX = { psn: 'psnFx', par: 'spark', slp: 'zzz', brn: 'burnFx' };
const CANCEL_TXT = { slp: '正在呼呼大睡。', par: '身體麻痺，無法行動！', flinch: '退縮了，無法行動！', broken: '處於破防狀態，無法行動！', frozen: '被凍結了，無法行動！' };
// texts for MESSAGE events (data effects only name a key): (source name, target name, payload) → text
const BV_TEXT = {
  hp_full: (s, t) => '但是' + t + '的HP已經全滿了！',
  block: s => s + '舉盾格擋，減輕了傷害！',
  death_ward: s => '亡者守護發動了！' + s + '獲得了護盾！',
  endure: s => s + '咬緊牙關撐住了！（不屈）',
  free_cast: () => '魔力循環！沒有消耗MP。',
  sig_twice: s => s + '的招式再次爆發！',
  status_resist: s => s + '憑著意志力撐住了！',
  ally_gren: () => ['格倫從旁殺了出來！「……讓開，小鬼！」', '格倫：「看好了——這才叫劈！」', '格倫：「哼，還站得起來？那就再來一斧！」'][rnd(0, 2)],
  ally_lia: () => ['莉婭趕到了！「撐住——騎士團的急救術！」', '莉婭：「我來掩護你！先把傷口包好！」', '莉婭：「勇者可不能在這裡倒下！」'][rnd(0, 2)],
  flood_wet: (s, t) => t + '被大水淋得全身濕透！',
  ignite: () => '纏繞的藤蔓燒了起來！燎原！',
  shock: (s, t) => '潮濕的身體導電了！' + t + '感電了！',
  new_stance: s => s + '擺出了新的架勢！',
  raged: s => s + '被激怒了！',
  rocks_blocked: (s, t) => t + '擋住了落石！',
  tim: () => '提姆射出了箭！',
  special: (s, t, p) => '特技「' + (p.name || '特技') + '」發動！',
  dispelled: (s, t) => t + '的能力提升全部被消除了！',
  dispel_none: (s, t) => t + '頂住了壓迫感！',
  wait: s => s + '正在觀察情況。',
};
const PHASE_TXT = {
  eyes: n => [n + '的眼神變了！'], last: n => [n + '拚上了最後的力氣！'],
  frenzy: n => [n + '陷入了狂怒！'].concat(Game.st.flags.tutFrenzy ? [] : (Game.st.flags.tutFrenzy = 1, ['（狂怒：每兩回合會行動兩次！趁牠破防時一口氣打倒牠吧。）'])),
  golem_core: n => [n + '的核心發出了耀眼的紅光！', n + '進入了狂暴狀態！'],
  golem_collapse: n => [n + '猛力撞擊地面！', '遺跡開始崩塌了！每回合都會有落石掉下來！', '（選擇「防禦」就能擋住落石。）'],
  whistle: n => [n + '吹響了口哨！', '手下們從暗處衝了出來！'],
  shards: n => ['水晶碎片浮了起來，環繞著' + n + '！', '（碎片還在時，傷害會被減弱，而且它會回復。攻擊它就能擊碎碎片，物理攻擊一次能打碎兩塊！）'],
  flood: () => ['水道的牆壁裂開，大水湧了進來！', '（每回合都會全身濕透……小心雷擊！）'],
};

class Battle {
  constructor(cfg) {
    this.cfg = cfg; this.kind = cfg.kind || 'wild'; this.result = null; const st = Game.st;
    this.core = BB.build(cfg, st); this.views = {}; this.hs = heroStats(st);
    for (const u of this.core.units) this.mkView(u);
    this.H = this.views.H; this.focus = this.foes()[0] || null; this.layout(true);
    this.bg = buildBattleBG(cfg.bg); this.cfgBg = this.bg.kind || cfg.bg || 'field';
    this.hd = { look: heroLookOf(st), H: this.H.A, ok: true }; Object.defineProperty(this.hd, 'F', { get: () => this.focus ? this.focus.A : this.H.A });
    try { this.H.spx = dollSpec(); } catch (e) { this.H.spx = null; }
    this.disp = { exp: st.exp }; this.fx = []; this.pops = []; this.banner = null; this.shake = 0; this.t = 0; this.idle = false;
    this.cmdIdx = 0; this.moveIdx = 0; this.tgtIdx = 0; this.cur = 0; this.dim = 0; this.red = 0; this.round = 0;
    this.cover = 1; this.boxF = -30; this.boxH = BH + 4; this.heroX = HERO_X; this.foeTX = FOE_X; this._phase = null; this._phaseName = null; this.ann = null;
    this.script = this.main();
  }
  /* ---------- views: what the screen shows of each unit (moves only as events are played) ---------- */
  mkView(u) {
    const v = { id: u.id, u, hero: u.hero, sp: u.sp, lv: u.lv, kind: u.kind, boss: u.boss, elite: u.elite, rare: u.rare, minion: u.minion, fam: u.fam, trait: u.data.trait || null,
      hp: u.res.hp, maxhp: u.max.hp, mp: u.res.mp || 0, maxmp: u.max.mp || 0, res: { ...u.res }, max: { ...u.max }, st: {}, off: { x: 0, y: 0 }, tint: null, blink: 0, sink: 0, alpha: u.hero ? 1 : 0, squish: 0,
      gone: false, x: 88, foot: FOE_FOOT, tx: 88, A: { state: 'idle', t: 0, dur: 1, phase: u.hero ? 29 : (this.core.units.indexOf(u) * 23) % 60 }, bbh: 48, img: null, flash: 0, plateA: u.hero ? 1 : 0 };
    for (const s of u.statuses) v.st[s.id] = s.stacks;
    Object.defineProperty(v, 'n', { get: () => u.name });
    Object.defineProperty(v, 'status', { get: () => ['psn', 'par', 'slp', 'brn'].find(k => v.st[k]) || null });
    Object.defineProperty(v, 'stages', { get: () => Object.fromEntries(BR.STAT_KEYS.map(k => [k, v.st['stage_' + k] || 0])) });
    Object.defineProperty(v, 'defending', { get: () => !!v.st.guard });
    Object.defineProperty(v, 'charging', { get: () => !!v.st.charging });
    Object.defineProperty(v, 'broken', { get: () => v.st.broken ? 1 : 0 });
    Object.defineProperty(v, 'shield', { get: () => v.st.barrier ? 1 : 0 });
    Object.defineProperty(v, 'wet', { get: () => v.st.wet ? 1 : 0 });
    Object.defineProperty(v, 'tangle', { get: () => v.st.tangle ? 1 : 0 });
    Object.defineProperty(v, 'brk', { get: () => v.res.brk || 0 }); Object.defineProperty(v, 'brkMax', { get: () => v.max.brk || 0 });
    if (u.hero) { Object.defineProperty(v, 'stats', { get: () => this.hs, set: s => { this.hs = s; } }); v.sgp = 0; }
    else { v.stats = u.stats; try { if (pxReady(u.sp) || (chibiOn() && chibiBase(u.sp))) v.spx = pxSpec(u.sp); else v.spec = hdFoeSpec(u.sp); } catch (e) { v.spx = v.spec = null; } }
    this.views[u.id] = v; return v;
  }
  foes(all) { return this.core.units.filter(u => u.side === 'B').map(u => this.views[u.id]).filter(v => v && (all || !v.gone)); }
  // slots: with three monsters the boss / elite (the biggest) stands in the middle at the back
  layout(snap) { const L = this.foes(), n = Math.min(3, L.length), P = FOE_SLOTS[n] || FOE_SLOTS[1], rank = v => v.boss ? 0 : v.elite ? 1 : v.minion ? 3 : 2;
    const order = L.map((v, i) => [v, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(a => a[0]), pos = n === 3 ? [1, 0, 2] : [0, 1, 2];
    order.forEach((v, k) => { const p = P[pos[k]] || P[P.length - 1]; v.tx = p[0]; v.foot = p[1]; if (snap) v.x = p[0]; }); }
  vw(id) { return id ? this.views[id] : null; }
  nameOf(id) { const v = this.vw(id); return v ? v.n : ''; }
  skillName(id, uid) { const u = this.core.byId[uid], D = DEF.skills[id]; if (!D) return id; if (u && u.hero) { if (id === u.data.attackSkill) return u.data.attackName || D.name; if (u.data.skillNames && u.data.skillNames[id]) return u.data.skillNames[id]; if (id === u.data.wspSkill) return u.data.wspName || '特技'; } return D.name; }
  anyBoss() { return this.core.alive('B').some(u => u.boss || u.data.noEscape); }
  hasBoss() { return this.anyBoss(); }
  get F() { return this.focus || this.foes(true)[0] || this.H; }
  get imgF() { return this.F.img; }
  get foeX() { return this.F.x - 32; }
  /* ---------- per-frame ---------- */
  enter() { UI.clear(); }
  update() {
    this.t++; if (this.shake > 0) this.shake--; if (this.red > 0) this.red--;
    for (const v of Object.values(this.views)) { if (v.blink > 0) v.blink--; if (v.flash > 0) v.flash--; if (!v.hero && Math.abs(v.x - v.tx) > 0.5) v.x += (v.tx - v.x) * 0.15; else v.x = v.tx;
      const A = v.A; A.t++; if (A.state !== 'idle' && A.state !== 'faint' && !A.hold && A.t >= A.dur) { A.state = 'idle'; A.t = 0; }
      if (v.hero) { if (v.defending && A.state === 'idle') this.anim(v, 'defend', 8, true); if (!v.defending && A.state === 'defend') A.state = 'idle'; }
      else { if (v.charging && A.state === 'idle') this.anim(v, 'cast', 14, true); if (!v.charging && A.state === 'cast' && A.hold && !A.fx) A.state = 'idle'; }
      if (v.rare && !v.gone && v.hp > 0 && this.t % 14 === 0) this.spawn({ k: 'star', x: v.x + rnd(-22, 22), y: v.foot - rnd(8, 60), c: pick(['#fff4a0', '#ffffff', '#ffd84a']), life: 12 }); }
    for (const p of this.fx) { p.t++; if (p.upd) p.upd(p); else { p.x += p.vx || 0; p.y += p.vy || 0; p.vy = (p.vy || 0) + (p.g || 0); } }
    this.fx = this.fx.filter(p => p.t < p.life); for (const p of this.pops) p.t++; this.pops = this.pops.filter(p => p.t < (p.big ? 60 : 44));
    if (this.banner && ++this.banner.t >= this.banner.life) this.banner = null;
    this.dim += ((this.dimT || 0) - this.dim) * 0.15;
    if (this.script) { const r = this.script.next(); if (r.done) this.script = null; }
  }
  anim(v, state, dur, hold) { if (!v || v.A.state === 'faint') return; v.A.state = state; v.A.t = 0; v.A.dur = dur; v.A.hold = !!hold; }
  center(b) {
    if (!b) return { x: 88, y: 100 }; if (b.cx != null) return { x: b.cx, y: b.cy };
    if (b.hero) return { x: this.heroX + HD_HERO_OX + 28, y: HERO_FOOT - 21 };
    const v = b.id ? this.views[b.id] || b : b; return { x: Math.round(v.x + v.off.x), y: Math.round(v.foot - v.bbh * 0.5 + v.off.y) };
  }
  // the middle of several targets (area skills play their effect once over the whole group)
  groupOf(ids) { const vs = ids.map(id => this.views[id]).filter(Boolean); if (vs.length < 2) return vs[0]; const C = vs.map(v => this.center(v)); return { cx: Math.round(C.reduce((a, c) => a + c.x, 0) / C.length), cy: Math.round(C.reduce((a, c) => a + c.y, 0) / C.length), hero: false, group: vs }; }
  /* ---------- drawing ---------- */
  renderFoe(v, tint) { if (v.spx) return pxRender(v.A, v.spx, this.t, tint); if (v.spec) return hdRenderFoe(v.A, v.spec, this.t, tint); const im = battleSprite(v.sp); im.ds = im.ds || 1; return tint ? tinted(im, tint) : im; }
  draw(x) {
    const tStart = performance.now(), blit = (im, X, Y, w, h) => { const ds = im.ds || 1; x.imageSmoothingEnabled = !im.px && !HD_PIXEL; x.drawImage(im, X, Y, w ?? im.width * ds, h ?? im.height * ds); x.imageSmoothingEnabled = false; };
    if (!this.hd2d) hd2dInit(this); const LK = this.hd2d.L;
    const redraw = (A, im) => !im || A.state !== 'idle' || (this.t & 1) === 0 || A.cvD !== hdD();
    const sx = this.shake > 0 ? rnd(-3, 3) : 0, sy = this.shake > 0 ? rnd(-2, 2) : 0;
    x.save(); x.translate(sx, sy); x.imageSmoothingEnabled = true; x.drawImage(hd2dStageFor(this), 0, 0, W, BH); x.imageSmoothingEnabled = false; hd2dMotes(this, x, false);
    // monsters, far ones first
    const foes = this.foes(true).filter(v => v.alpha > 0).sort((a, b) => a.foot - b.foot);
    for (const v of foes) {
      let im = v.img; if (redraw(v.A, im)) { im = this.renderFoe(v); hd2dLightActor(im, LK); v.img = im; } v.bbh = (im.bb && im.bb.h) || 48;
      const ds = im.ds || 1, fw = im.width * ds, fh = im.height * ds, fx0 = v.x - (im.bb ? im.bb.cx : im.width / 2) + v.off.x, fy0 = v.foot - (im.bb ? im.bb.bot : im.height) + v.off.y + v.sink;
      hd2dSoftShadow(x, v.x + v.off.x, v.foot - 1, (im.bb ? im.bb.w : 40) * 0.46, 5, 0.42 * v.alpha);
      if (!(v.blink > 0 && Math.floor(v.blink / 3) % 2)) {
        x.save(); x.beginPath(); x.rect(0, 0, W, v.foot + 3); x.clip(); x.globalAlpha = v.alpha;
        const sq = v.squish; if (sq) blit(im, fx0 - sq, fy0 + sq * 2, fw + sq * 2, fh - sq * 2); else blit(im, fx0, fy0);
        const tn = v.tint || (v.st.broken && Math.floor(this.t / 10) % 2 ? { c: '#ffe070', a: 0.18 } : null) || (v.st.mirror && Math.floor(this.t / 8) % 2 ? { c: '#e8fbff', a: 0.25 } : null);
        if (tn && tn.a > 0) { x.globalAlpha = tn.a * v.alpha; blit(this.renderFoe(v, tn.c), fx0, fy0, fw, fh); }
        x.restore();
      }
      if (v.st.shards > 0 && v.alpha > 0) { const C = this.center(v); for (let i = 0; i < v.st.shards; i++) { const an = this.t / 20 + i * Math.PI * 2 / 3, px0 = Math.round(C.x + Math.cos(an) * 40), py0 = Math.round(C.y + Math.sin(an) * 13); x.fillStyle = '#1a3050'; x.fillRect(px0 - 3, py0 - 5, 7, 11); x.fillStyle = '#9ae0ff'; x.fillRect(px0 - 2, py0 - 4, 5, 9); x.fillStyle = '#e8fbff'; x.fillRect(px0 - 1, py0 - 3, 2, 4); } }
    }
    // the hero (paper doll, back view)
    const Hv = this.H; if (!(Hv.blink > 0 && Math.floor(Hv.blink / 3) % 2)) {
      let hi = Hv.img; if (redraw(Hv.A, hi)) { hi = Hv.spx ? dollRender(this, Hv.A, Hv.spx, this.t) : heroBattleImgLook(0, this.hd.look); hd2dLightActor(hi, LK); Hv.img = hi; }
      const hx0 = this.heroX + HD_HERO_OX; x.save(); hd2dSoftShadow(x, hx0 + 28 + Hv.off.x, HERO_FOOT - 1 - (Hv.spx && Hv.spx.chibi ? Hv.spx.lift || 0 : 0), 26, 6, 0.4); x.globalAlpha = Math.max(0, 1 - Hv.sink / 70);
      const hx = (hi.px ? hx0 + 28 - hi.bb.cx : hx0) + Hv.off.x, hy = (hi.px ? HERO_FOOT - hi.bb.bot : HERO_Y) + Hv.off.y + Hv.sink * 0.25, hw = hi.width * (hi.ds || 1), hh = hi.height * (hi.ds || 1);
      blit(hi, hx, hy); if (Hv.tint) { x.globalAlpha = Hv.tint.a; blit(Hv.spx ? dollRender(this, Hv.A, Hv.spx, this.t, Hv.tint.c) : tinted(hi, Hv.tint.c), hx, hy, hw, hh); }
      x.restore();
    }
    for (const p of this.fx) drawParticle(x, p);
    if (!HD_QUALITY.low) { hd2dMotes(this, x, true); hd2dShafts(this, x); hd2dBloom(this, x); }
    this.drawOverlay(x); this.drawBoxF(x); this.drawBoxH(x); this.drawPops(x);
    x.restore();
    const k = this.cfg && this.cfg.wx; if (k && typeof wxOverlay === 'function') { x.save(); x.beginPath(); x.rect(0, 0, W, BH); x.clip(); wxOverlay(x, k, this.t, W, BH); x.restore(); wxIcon(x, k, W - 13, 3); }
    x.fillStyle = '#0b0d18'; x.fillRect(0, BH, W, H - BH); x.fillStyle = PANEL.edge; x.fillRect(0, BH, W, 1);
    if (this.cover > 0) { x.fillStyle = '#000'; const h = Math.round(this.cover * (H / 2 + 1)); x.fillRect(0, 0, W, h); x.fillRect(0, H - h, W, h); }
    hdQualityTick(performance.now() - tStart);
  }
  drawOverlay(x) {
    if (this.dim > 0.02 && this.focus) { const C = this.center(this.focus), g = x.createRadialGradient(C.x, C.y, 20, C.x, C.y, 120); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(8,0,6,' + (this.dim * 0.8).toFixed(3) + ')'); x.fillStyle = g; x.fillRect(0, 0, W, BH); }
    if (this.red > 0) { x.fillStyle = 'rgba(210,20,30,' + (this.red / 16 * 0.32).toFixed(3) + ')'; x.fillRect(0, 0, W, BH); }
    // danger ring under the hero while a monster charges
    if (this.foes().some(v => v.charging && !v.broken && v.hp > 0)) { const p = (this.t % 40) / 40, cx = this.center(this.H).x, cy = HERO_FOOT - 3; x.save(); x.strokeStyle = 'rgba(255,50,60,' + (0.8 - p * 0.6).toFixed(2) + ')'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(cx, cy, 18 + p * 16, 5 + p * 4, 0, 0, Math.PI * 2); x.stroke(); x.restore(); }
    // target cursor
    if (this.pickV && !this.pickV.gone) { const v = this.pickV, Y = Math.round(v.foot - v.bbh - 6 + Math.sin(this.t / 5) * 2); x.fillStyle = '#1a0a10'; x.fillRect(v.x - 5, Y - 1, 11, 3); x.fillRect(v.x - 4, Y + 2, 9, 2); x.fillRect(v.x - 2, Y + 4, 5, 2); x.fillStyle = '#ffd860'; x.fillRect(v.x - 4, Y, 9, 2); x.fillRect(v.x - 3, Y + 2, 7, 1); x.fillRect(v.x - 1, Y + 3, 3, 2); }
    // monster skill banner
    if (this.banner) { const B = this.banner, k = Math.min(1, B.t / 6), fade = B.t > B.life - 10 ? (B.life - B.t) / 10 : 1, s = (B.charge ? '蓄力 ' : '▼ ') + B.s, fs = B.strong ? 11 : 9, tw = Font.width(s, fs) + 18, X = Math.round(W / 2 - tw / 2 * k), Y = 64;
      x.globalAlpha = clamp(fade, 0, 1); x.fillStyle = B.strong ? 'rgba(60,4,12,0.88)' : 'rgba(20,8,16,0.78)'; x.fillRect(X, Y, Math.round(tw * k), fs + 7); x.fillStyle = B.strong ? '#ff4050' : '#c05060'; x.fillRect(X, Y, Math.round(tw * k), 1); x.fillRect(X, Y + fs + 6, Math.round(tw * k), 1);
      if (k >= 1) Font.drawC(x, s, W / 2, Y + (B.strong ? 0 : -1), B.strong ? '#ffe0e0' : '#ffc8c8', '#000000', fs); x.globalAlpha = 1; }
  }
  drawPops(x) {
    for (const p of this.pops) { const life = p.big ? 60 : 44, a = p.t > life - 12 ? (life - p.t) / 12 : 1, rise = p.big ? Math.min(10, p.t * 0.6) : Math.min(16, p.t * 1.2), sz = p.big ? 16 : p.small ? 10 : 13, pop = p.t < 5 ? 1 + (5 - p.t) * 0.12 : 1;
      x.globalAlpha = clamp(a, 0, 1); const Y = p.y - rise; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) Font.drawC(x, p.s, p.x + dx, Y + dy, '#1a0a10', null, Math.round(sz * pop)); Font.drawC(x, p.s, p.x, Y, p.c, null, Math.round(sz * pop));
      if (p.tag) Font.drawC(x, p.tag, p.x, Y - 11, p.c, '#000000', 8); x.globalAlpha = 1; }
  }
  popNum(v, s, c, tag, o = {}) { const C = this.center(v); this.pops.push({ x: C.x + rnd(-6, 6), y: C.y - (v.hero ? 2 : 30) + (o.dy || 0), s: String(s), c, tag, t: 0, big: o.big, small: o.small }); }
  // monster plates: one big centred plate when alone, a row of small plates for a group
  drawBoxF(x) {
    if (this.boxF < -20) return; const L = this.foes(), a0 = clamp((this.boxF + 30) / 34, 0, 1); if (!L.length) return;
    if (L.length === 1 && !this.multi) return this.drawPlateBig(x, L[0], a0);
    L.slice().sort((a, b) => a.tx - b.tx).forEach((v, i) => this.drawPlateSmall(x, v, a0 * v.plateA, i, L.length));
  }
  drawPlateBig(x, F, a0) {
    const a = a0 * F.plateA, w = 120, X = (W - w) / 2, py = 6, pe = plateExtra(); if (a <= 0) return;
    const rim = F.boss ? '#ff6b7a' : F.elite ? '#ffc46b' : F.rare ? '#ffd84a' : '#8a93b3', tag = F.rare ? '稀有' : F.boss ? '頭目' : F.elite ? '菁英' : '';
    x.globalAlpha = a; if (!uiPlate(x, X, py, w, 33 + pe, F)) { x.fillStyle = 'rgba(10,8,20,0.75)'; x.fillRect(X, py, w, 33); x.fillStyle = rim; x.fillRect(X + 2, py, w - 4, 1); x.fillRect(X + 2, py + 32, w - 4, 1); x.fillRect(X, py + 2, 1, 29); x.fillRect(X + w - 1, py + 2, 1, 29); }
    Font.draw(x, F.n, X + 6, py + 1, UIC.text, UIC.textSh, 10); if (tag) Font.drawR(x, tag, X + w - 6, py + 2, rim, UIC.textSh, 8);
    let lx = Font.draw(x, 'Lv' + F.lv, X + 6, py + 14, UIC.muted, UIC.textSh, 8); if (FAMILIES[F.fam]) lx = Font.draw(x, '・' + FAMILIES[F.fam].n, lx + 1, py + 14, FAMILIES[F.fam].c, UIC.textSh, 8);
    const bs = this.badges(F); badgeRow(x, bs.slice(0, 3), X + w - 6 - Math.min(3, bs.length) * 18, py + 14);
    const r = clamp(F.hp / F.maxhp, 0, 1); if (!uiBar(x, X + 7, py + 30, w - 14, r, r > 0.25 ? 'foe' : 'low')) { x.fillStyle = '#1a1024'; x.fillRect(X + 6, py + 27, w - 12, 3); x.fillStyle = r > 0.5 ? '#e0504a' : r > 0.2 ? '#ff8a3a' : '#ffd040'; x.fillRect(X + 6, py + 27, Math.round((w - 12) * r), 3); }
    if (F.brkMax) drawShieldBadge(x, X - 16, py + 9, F.brk, F.broken > 0, F.flash > 0 && Math.floor(F.flash / 3) % 2);
    const fam = FAMILIES[F.fam], rev = this.revealed(F); if (fam && fam.weak.length) { const s = '弱 ' + (rev ? fam.weak.join('・') : '？'); x.fillStyle = 'rgba(10,8,20,0.7)'; const tw = Font.width(s, 8) + 8; x.fillRect(X + 4, py + 33 + pe, tw, 11); Font.draw(x, s, X + 8, py + 30.5 + pe, rev ? '#ffd070' : UIC.muted, UIC.textSh, 8); }
    if (UI_PX.icons && UI_PX.icons.ok) drawStageIcons(x, F, (W + w) / 2 - 4 - Math.min(4, BR.STAT_KEYS.filter(k => F.st['stage_' + k]).length) * (ICON_SZ + 2), py + 34 + pe);
    if (F.broken) Font.drawC(x, '— 破防中 —', W / 2, py + 45 + pe, Math.floor(this.t / 6) % 2 ? '#ffd040' : '#ff8a50', '#000000', 10);
    else if (F.charging) Font.drawC(x, '蓄力中！下回合發動', W / 2, py + 45 + pe, Math.floor(this.t / 8) % 2 ? '#ff5a5a' : '#ffb0a0', '#000000', 10);
    x.globalAlpha = 1;
  }
  drawPlateSmall(x, v, a, i, n) {
    if (a <= 0) return; const w = n >= 3 ? 56 : 80, X = Math.round(clamp(v.x - w / 2, 2, W - w - 2)), py = 4, on = this.pickV === v;
    const rim = on ? '#ffd860' : v.boss ? '#ff6b7a' : v.elite ? '#ffc46b' : v.rare ? '#ffd84a' : v.minion ? '#b08a6a' : '#8a93b3';
    x.globalAlpha = a; x.fillStyle = 'rgba(10,8,20,0.78)'; x.fillRect(X, py, w, 22); x.fillStyle = rim; x.fillRect(X + 1, py, w - 2, 1); x.fillRect(X + 1, py + 21, w - 2, 1); x.fillRect(X, py + 1, 1, 20); x.fillRect(X + w - 1, py + 1, 1, 20);
    let z = 9; while (z > 7 && Font.width(v.n, z) > w - 24) z--; Font.draw(x, v.n, X + 3, py - 1, on ? '#ffe8b0' : UIC.text, UIC.textSh, z); Font.drawR(x, 'Lv' + v.lv, X + w - 3, py, UIC.muted, UIC.textSh, 7);
    const r = clamp(v.hp / v.maxhp, 0, 1); x.fillStyle = '#1a1024'; x.fillRect(X + 3, py + 15, w - 6, 3); x.fillStyle = r > 0.5 ? '#e0504a' : r > 0.2 ? '#ff8a3a' : '#ffd040'; x.fillRect(X + 3, py + 15, Math.round((w - 6) * r), 3);
    if (v.brkMax) { for (let k = 0; k < v.brkMax; k++) { x.fillStyle = v.broken ? '#ff6050' : k < v.brk ? '#8ad0ff' : '#2a3048'; x.fillRect(X + 3 + k * 4, py + 11, 3, 2); } }
    const bs = this.badges(v).slice(0, n >= 3 ? 2 : 3); if (bs.length) badgeRow(x, bs, X + w - 2 - bs.length * (ICON_SZ + 2), py + 24);
    if (UI_PX.icons && UI_PX.icons.ok) drawStageIcons(x, v, X + 1, py + 24, n >= 3 ? 1 : 2);
    if (v.broken) Font.drawC(x, '破防', v.x, v.foot - v.bbh - 18, Math.floor(this.t / 6) % 2 ? '#ffd040' : '#ff8a50', '#000000', 9);
    else if (v.charging) Font.drawC(x, '蓄力中', v.x, v.foot - v.bbh - 18, Math.floor(this.t / 8) % 2 ? '#ff5a5a' : '#ffb0a0', '#000000', 9);
    x.globalAlpha = 1;
  }
  badges(v) { return Object.keys(v.st).filter(k => BADGE_OF[k] && v.st[k]).map(k => BADGE_OF[k]).sort((a, b) => (['psn', 'par', 'slp', 'brn'].includes(b) ? 1 : 0) - (['psn', 'par', 'slp', 'brn'].includes(a) ? 1 : 0)); }
  revealed(v) { const dx = Game.st.dex && Game.st.dex[v.sp]; return !!(dx && dx.rev); }
  // the hero's strip: name · Lv │ HP │ MP, with 招式 / 特技 / 連段 / 氣 gauges above and the status icons beside the hero
  drawBoxH(x) {
    const Y = Math.round(this.boxH), st = Game.st, Hv = this.H; if (Y >= BH) return;
    const r = clamp(Hv.hp / Hv.maxhp, 0, 1), mr = clamp(Hv.mp / (Hv.maxmp || 1), 0, 1), my = Y + 6;
    if (!uiHud(x, 0, Y - 3, W, BH - Y + 4)) { x.fillStyle = 'rgba(12,10,22,0.9)'; x.fillRect(0, Y, W, BH - Y); x.fillStyle = '#c8a050'; x.fillRect(0, Y, W, 1); }
    const cx = Font.draw(x, st.name, 4, Y, UIC.text, UIC.textSh, 9); Font.draw(x, 'Lv' + st.lv, cx + 2, Y + 2, '#c8a050', UIC.textSh, 7);
    Font.draw(x, 'HP', 62, Y + 2, '#ff9a8a', UIC.textSh, 7); if (!uiBar(x, 76, my, 28, r, r > 0.25 ? 'hp' : 'low')) { x.fillStyle = '#241018'; x.fillRect(74, my, 30, 3); x.fillStyle = r > 0.5 ? '#5ad07a' : r > 0.2 ? '#ffc040' : '#ff5a5a'; x.fillRect(74, my, Math.round(30 * r), 3); } Font.drawR(x, Math.ceil(Hv.hp) + '', 122, Y + 1, r <= 0.2 ? UIC.bad : UIC.text, UIC.textSh, 8);
    Font.draw(x, 'MP', 127, Y + 2, '#8ab8ff', UIC.textSh, 7); if (!uiBar(x, 141, my, 19, mr, 'mp')) { x.fillStyle = '#101a30'; x.fillRect(139, my, 21, 3); x.fillStyle = '#5aa8ff'; x.fillRect(139, my, Math.round(21 * mr), 3); } Font.drawR(x, Math.round(Hv.mp) + '', 174, Y + 1, '#b8d4ff', UIC.textSh, 8);
    // status + stat-stage icons beside the hero (left of the body, at hip height)
    const bs = this.badges(Hv), C = this.center(Hv), nS = Math.min(4, BR.STAT_KEYS.filter(k => Hv.st['stage_' + k]).length), iw = (typeof ICON_SZ !== 'undefined' ? ICON_SZ : 12) + 2;
    const ix = Math.max(2, Math.round(C.x - 20 - (Math.min(2, bs.length) + nS) * iw + Hv.off.x)), iy = Math.round(HERO_FOOT - 20 + Hv.off.y);
    if (bs.length) badgeRow(x, bs.slice(0, 2), ix, iy); if (UI_PX.icons && UI_PX.icons.ok) drawStageIcons(x, Hv, ix + Math.min(2, bs.length) * iw, iy);
    // gauges, right-aligned above the strip: 招式 ●●●○○ (gold from 3) / 特技 ◆◆◇
    const gauge = (label, n, N, yy, ok, blink) => { const lw = Math.ceil(Font.width(label, 7)) + 4, w = N * 7 + lw, X = W - w - 3; x.fillStyle = 'rgba(10,10,22,0.72)'; x.fillRect(X - 2, yy - 1, w + 4, 10); Font.draw(x, label, X, yy - 4, ok ? '#ffd860' : UIC.muted, UIC.textSh, 7);
      for (let i = 0; i < N; i++) { const gx = X + lw + i * 7, on = i < n; x.fillStyle = '#10121e'; x.fillRect(gx - 1, yy + 1, 6, 6); x.fillStyle = on ? (blink && Math.floor(this.t / 8) % 2 ? '#ffffff' : ok ? '#ffd860' : '#8ad0ff') : '#3a3a4a'; x.fillRect(gx, yy + 2, 4, 4); } };
    let gy = Y - 11; if ('wc' in Hv.max && Hv.max.wc) { const n = Math.min(Hv.max.wc, Hv.res.wc || 0); gauge('特技', n, Hv.max.wc, gy, n >= Hv.max.wc, n >= Hv.max.wc); gy -= 10; }
    this.drawClassRes(x, gauge, gy);
    if ((Hv.res.combo || 0) > 0) { const step = (this.core.byId.H.data.comboStep || 6), txt = '連段×' + Hv.res.combo + ' +' + step * Hv.res.combo + '%', w = Math.ceil(Font.width(txt, 7)) + 6, yy = Y - 11; x.fillStyle = 'rgba(10,10,22,0.72)'; x.fillRect(3, yy - 1, w, 10); Font.draw(x, txt, 6, yy - 4, Hv.res.combo >= (Hv.max.combo || 3) ? '#ff9a5a' : '#ffd860', UIC.textSh, 7); }
    // v12: 氣 is shown with the other class resources (drawClassRes)
  }
  /* ---------- helpers the effect library (FX / MFX) uses ---------- */
  *msg(text, o = {}) { this.dropAnn(); const t = new TextBox(text, { style: 'battle', auto: o.wait ? false : (o.hold || 34) }); UI.push(t); while (!t.done) { t.update(); yield; } UI.remove(t); }
  *announce(text) { this.dropAnn(); const t = new TextBox(text, { style: 'battle', keep: true }); UI.push(t); this.ann = t; while (!t.done) { t.update(); yield; } }
  dropAnn() { if (this.ann) { UI.remove(this.ann); this.ann = null; } }
  *animHP(v, to) { if (!v) return; const target = to ?? v.hp, spd = Math.max(0.35, v.maxhp / 55); let cur = v.hp0 ?? v.hp; v.hp = cur; while (Math.abs(v.hp - target) > 0.01) { const d = target - v.hp; v.hp += Math.sign(d) * Math.min(Math.abs(d), spd); yield; } v.hp = target; v.hp0 = undefined; }
  *impact(b, power) {
    const v = b && b.id ? this.views[b.id] || b : b, C = this.center(v); if (!v) return;
    v.tint = { c: '#ffffff', a: 0.95 }; this.shake = Math.max(this.shake, [3, 6, 14][power] || 3); this.anim(v, 'hurt', 22);
    if (power > 0) { this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 4, r1: power > 1 ? 34 : 22, c: '#ffffff', w: 2, life: 10 }); this.sparks(C.x, C.y, power > 1 ? 14 : 7, ['#ffffff', '#fff0a0'], power > 1 ? 3 : 2, 14); }
    if (power > 1) this.spawn({ k: 'flash', c: '#ffffff', a: 0.35, life: 6 });
    yield* wait(power > 1 ? 6 : 4); v.tint = null; v.blink = 24;
  }
  spawn(p) { p.t = 0; p.life = p.life || 30; if (this.slashOn > 0) p.sl = 1; this.fx.push(p); return p; } // 斬／刃／閃 skills draw their particles as blades (09r)
  *lunge(b, dist = 10, frames = 5) {
    const v = b && b.id ? this.views[b.id] || b : b; if (!v || !v.off) return; this.anim(v, 'attack', 5 + frames * 2 + 10); yield* wait(5);
    const o = v.off, A = this.center(v), B = this.center(v.hero ? (this.tgtV || this.F) : this.H), L = Math.hypot(B.x - A.x, B.y - A.y) || 1, dx = (B.x - A.x) / L * dist, dy = (B.y - A.y) / L * dist;
    yield* tween(frames, t => { o.x = dx * t; o.y = dy * t; }); yield* tween(frames, t => { o.x = dx * (1 - t); o.y = dy * (1 - t); }); o.x = 0; o.y = 0;
  }
  *shakeB(b, frames = 12, amp = 3) { const v = b && b.id ? this.views[b.id] : b && b.off ? b : null; if (!v) { yield* wait(frames); return; } for (let i = 0; i < frames; i++) { v.off.x = (i % 4 < 2 ? amp : -amp); yield; } v.off.x = 0; }
  sparks(X, Y, n, cols, spd = 2, life = 18, g = 0) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = spd * (0.5 + Math.random()); this.spawn({ k: 'dot', x: X, y: Y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g, c: pick(cols), s: rnd(1, 2), life: life + rnd(-4, 4) }); } }
  star(X, Y, c = '#ffffff', life = 10) { this.spawn({ k: 'star', x: X, y: Y, c, life }); }
  projectile(U, T, n, mk, spacing = 3, frames = 18) { for (let i = 0; i < n; i++) { const p = mk(i); p.x = U.x; p.y = U.y; p.tx = T.x + rnd(-6, 6); p.ty = T.y + rnd(-6, 6); p.delay = i * spacing; p.fr = frames; p.upd = q => { const t = clamp((q.t - q.delay) / q.fr, 0, 1); q.x = lerp(U.x, q.tx, t) + (q.wob ? Math.sin(q.t / 3 + i) * q.wob : 0); q.y = lerp(U.y, q.ty, t) - (q.arc ? Math.sin(t * Math.PI) * q.arc : 0); q.hidden = q.t < q.delay; }; p.life = p.delay + frames + (p.linger || 0); this.spawn(p); } }
  *playFx(name, u, t) {
    const U = this.center(u), T = this.center(t), A = u && u.A, idle = A && A.state === 'idle'; if (idle) { this.anim(u, 'cast', 12, true); A.fx = 1; }
    try { if (u && !u.hero && MFX[name]) { yield* MFX.tell.call(this, U, T, u); yield* MFX[name].call(this, U, T, u, t); } else yield* (FX[name] || FX.hit).call(this, U, T, u, t); }
    finally { if (A && A.state === 'cast' && A.fx) { A.hold = false; A.state = 'idle'; } if (A) A.fx = 0; }
  }
  foeHalfW() { const bb = this.imgF && this.imgF.bb; return bb ? (bb.vw ? bb.vw / 2 : bb.w * 0.35) : 20; }
  /* ---------- the flow: intro → (command → core → play the log) … → result ---------- */
  *main() {
    Game.trans = null; yield* this.intro();
    this.core.start(false); yield* this.play();
    while (!this.core.result) { const cmd = yield* this.command(); this.core.submit(cmd); yield* this.play(); }
    return yield* this.finish();
  }
  *intro() {
    const L = this.foes(), main = L[0], st = Game.st; this.multi = L.length > 1;
    Sound.sfx('encounter'); this.H.off.y = 60;
    yield* parallel(tween(14, t => this.cover = 1 - t), tween(28, t => { for (const v of L) v.alpha = t; this.H.off.y = 60 * Math.pow(1 - t, 3); }));
    for (const v of L) { v.alpha = 1; v.plateA = 1; } this.H.off.y = 0; this.cover = 0; this.spawn({ k: 'flash', c: '#ffffff', a: 0.4, life: 8 });
    Sound.cry(Object.keys(SPECIES).indexOf(main.sp) + 1, main.boss ? 0.7 : 1, main.boss ? 1.6 : 1); if (main.boss) { this.shake = 30; Sound.sfx('quake'); }
    yield* parallel(tween(12, t => this.boxF = lerp(-30, 4, 1 - Math.pow(1 - t, 2))), tween(12, t => this.boxH = lerp(BH + 4, HBAR_Y, 1 - Math.pow(1 - t, 2))));
    let s; if (L.length > 1) { const names = [], cnt = {}; for (const v of L) { const b = SPECIES[v.sp] ? SPECIES[v.sp].n : v.n; if (!cnt[b]) names.push(b); cnt[b] = (cnt[b] || 0) + 1; }
      const parts = names.map(b => cnt[b] > 1 ? cnt[b] + '隻' + b : b); s = (parts.length > 1 ? parts.slice(0, -1).join('、') + '和' + parts[parts.length - 1] : parts[0]) + '出現了！'; }
    else s = main.rare ? '稀有的' + main.n + '出現了！' : main.boss ? main.n + '擋住了去路！' : main.elite ? '精英魔物' + main.n + '發動了攻擊！' : main.n + '出現了！';
    yield* this.msg(s, { hold: 44 });
    if (L.length > 1 && !st.flags.tutMulti) { st.flags.tutMulti = 1; yield* this.msg('（一次出現好幾隻魔物！每隻都比較弱。攻擊前可以用左右選擇目標，範圍技能會打中全部。）', { wait: true }); }
    const k = this.cfg.wx; if (k && typeof WEATHER !== 'undefined' && WEATHER[k] && st.wx) { const w = st.wx[typeof wxKey === 'function' ? wxKey(st.map) : st.map] || {}; if (st.wxTold !== k + w.until) { st.wxTold = k + w.until; yield* this.msg('【' + WEATHER[k].n + '】' + WEATHER[k].d, { hold: 30 }); } }
    if (this.core.data.bless) yield* this.msg('（天氣祠的祝福）物攻和魔攻提升了！', { hold: 16 });
  }
  // the player's command: 攻擊・技能・道具・防禦・逃跑 (attacks on a group ask for a target)
  *command() {
    const hu = this.core.byId.H; this._phase = null; this.pickV = null;
    if (Game.autoPlay) { for (let i = 0; i < 4; i++) yield; return this.autoCmd(Game.autoPlay(this)); }
    const names = ['攻擊', '技能', '道具', '防禦', '逃跑'];
    while (true) {
      this.idle = true;
      const r = yield* choose(names.map(() => ({ t: '' })), { x: 4, y: BB_Y + 3, w: W - 8, h: BB_H - 5, cols: 5, colW: 34, rowH: BB_H - 6, ox: 0, oy: 0, buttons: true, noFrame: true, cancel: false, index: this.cmdIdx,
        drawExtra: (x, m) => { names.forEach((n, k) => { const X = m.x + k * 34, on = k === m.i; if (!uiCmdIcon(x, k, X + 7, m.y + 1)) { if (on) { x.fillStyle = '#c8a050'; x.fillRect(X + 1, m.y, 29, 1); x.fillRect(X + 1, m.y + m.rowH - 3, 29, 1); } x.drawImage(CMD_ICONS[n], 0, 0, 12, 12, X + 9, m.y + 3, 12, 12); } Font.drawC(x, n, X + 15, m.y + (uiSkinOn() ? 13 : 16), on ? '#ffe8b0' : UIC.muted, UIC.textSh, 8); }); } });
      this.idle = false; this.cmdIdx = r;
      if (r === 0) { const sk = hu.data.attackSkill, tg = yield* this.pickTarget(sk); if (tg) return { type: 'skill', skill: sk, targets: [tg] }; continue; }
      if (r === 1) { const sk = yield* this.chooseMove(); if (!sk) continue; if (DEF.skills[sk].target === 'enemy') { const tg = yield* this.pickTarget(sk); if (!tg) continue; return { type: 'skill', skill: sk, targets: [tg] }; } return { type: 'skill', skill: sk, targets: [] }; }
      if (r === 2) { const it = yield* bagScreen('battle'); if (!it) continue; if (!DEF.items[it]) { yield* this.msg('現在不能使用這個道具。'); continue; } return { type: 'item', item: it }; }
      if (r === 3) return { type: 'defend' };
      if (r === 4) { if (this.anyBoss()) { yield* this.msg('不能從這場戰鬥中逃走！'); continue; } return { type: 'run' }; }
    }
  }
  autoCmd(a) {
    const hu = this.core.byId.H, foe = this.core.alive('B')[0], tg = foe ? [foe.id] : [];
    if (!a || a.type === 'move') { let id = a && a.id; if (!id || id === 'attack' || !hu.skills.includes(id) || !this.canUse(id).ok) id = hu.data.attackSkill; return { type: 'skill', skill: id, targets: DEF.skills[id].target === 'enemy' ? tg : [] }; }
    if (a.type === 'skill') return { ...a, targets: a.targets || tg };
    if (a.type === 'item') return { type: 'item', item: a.item || a.id };
    return { type: a.type };
  }
  // can the hero use this skill now? (cost, once-per-battle)
  canUse(id) {
    const core = this.core, u = core.byId.H, D = DEF.skills[id]; if (!D) return { ok: false, why: '？' };
    for (const c of D.costs || []) { const need = core.costOf(u, D, c); if ((u.res[c.res] || 0) < need) return { ok: false, why: c.res === 'sgp' ? '招式點不夠！（普攻打中或被攻擊時累積）' : 'MP不夠！', res: c.res, need }; }
    if (D.usage && D.usage.perBattle && (core.data['skill|H|' + id] || 0) >= D.usage.perBattle) return { ok: false, why: '這場戰鬥已經用過了！' };
    return { ok: true };
  }
  costText(id) { const u = this.core.byId.H, D = DEF.skills[id], c = (D.costs || [])[0]; if (!c) return ''; const n = this.core.costOf(u, D, c); return c.res === 'sgp' ? '招式' + n : 'MP' + n; }
  // the damage preview of one hit on a foe (no random, no crit)
  estimate(id, fid) { const core = this.core, u = core.byId.H, D = DEF.skills[id], f = core.byId[fid] || core.alive('B')[0]; if (!D || !D.power || !f) return 0;
    const el = BR.elementOf(core, u, D), s2 = el !== D.el ? { ...D, el } : D, n = D.target === 'all_enemies' && core.alive('B').length > 1 ? (D.chain ? 1 : BR.AOE_MUL) : 1, hits = D.hits ? Math.round((D.hits[0] + D.hits[1]) / 2) : 1;
    return BR.damage(core, u, f, s2, { power: D.power * n, preview: true, noCrit: true }).amount * hits; }
  *pickTarget(skill) {
    const L = this.foes().filter(v => this.core.isUp(v.u)); if (L.length <= 1) return L[0] ? L[0].id : null;
    let i = clamp(this.tgtIdx, 0, L.length - 1); if (L[i] && L[i].gone) i = 0; this.idle = true;
    const self = this, D = DEF.skills[skill], pick2 = { draw(x) {
      const v = L[i]; drawWin(x, 4, BB_Y + 1, W - 8, BB_H - 2, 'menu'); Font.draw(x, '選擇目標', 10, BB_Y + 2, UIC.accent, UIC.textSh, 9);
      Font.draw(x, v.n + '　HP ' + Math.ceil(v.hp) + '/' + v.maxhp, 10, BB_Y + 14, UIC.text, UIC.textSh, 9);
      const est = self.estimate(skill, v.id); if (est) Font.drawR(x, '預估≈' + est, W - 10, BB_Y + 14, UIC.warm, UIC.textSh, 9);
      Font.drawR(x, Game.touchUI ? '點魔物選擇' : '←→ 選擇　A 決定', W - 10, BB_Y + 2, UIC.muted, UIC.textSh, 8);
      if (typeof touchRegion === 'function') { touchRegion(0, 0, W, BH, () => {}); L.forEach((q, k) => touchRegion(q.x - 28, q.foot - q.bbh - 30, 56, q.bbh + 34, () => { if (k === i) tapKey('a'); else { i = k; Sound.sfx('cursor'); } })); touchRegion(0, BB_Y, W, BB_H, () => tapKey('b')); } } };
    UI.push(pick2); let out = null;
    while (true) { this.pickV = L[i]; yield;
      if (Input.pressed('left') || Input.pressed('up')) { Input.consume('left', 'up'); i = (i + L.length - 1) % L.length; Sound.sfx('cursor'); }
      else if (Input.pressed('right') || Input.pressed('down')) { Input.consume('right', 'down'); i = (i + 1) % L.length; Sound.sfx('cursor'); }
      else if (Input.pressed('a')) { Input.consume('a'); Sound.sfx('select'); out = L[i].id; this.tgtIdx = i; break; }
      else if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } }
    UI.remove(pick2); this.pickV = null; this.idle = false; return out;
  }
  // the skill pop-up: the class skill + the 4 slotted skills (menu → 技能 to change them)
  *chooseMove() {
    const st = Game.st, hu = this.core.byId.H, list = hu.skills.filter(id => DEF.skills[id] && id !== hu.data.attackSkill);
    if (!list.length) { yield* this.msg('還沒有技能！（選單→技能編排）'); return null; }
    let cur = Math.min(this.moveIdx || 0, list.length - 1); this.idle = true;
    const VIS = list.length, X = 8, w = W - 16, Y = 58 - Math.max(0, VIS - 4) * 14, rowH = 14, h = 18 + VIS * rowH + 4, DY = Y + h + 2, DH = BH - 18 - DY, foe = this.core.alive('B')[0];
    const info = (x, m) => {
      Font.drawR(x, 'MP ' + Math.round(this.H.mp) + '/' + this.H.maxmp, X + w - 8, Y + 2, '#8ab8ff', UIC.textSh, 9);
      const id = list[m.i], D = DEF.skills[id], ob = BB.skillObj(st, id), mv = MOVES[id] ? skillMove(id) : null, c = TYPE_COL[D.el] || '#9a9aa8'; drawWin(x, X, DY, w, DH, 'menu');
      const fit = (t, sz, maxW) => { let z = sz; while (z > 7 && Font.width(t, z) > maxW) z--; return z; };
      const can = this.canUse(id), est = can.ok && D.power && foe ? this.estimate(id, foe.id) : 0, L = X + 8, R = X + w - 8;
      const tgt = D.target === 'all_enemies' ? (D.chain ? '・連鎖' : '・全體') : '', learn = ob && !D.tags.includes('sig') ? (ob.learned ? '・已學會' : '・學會' + Math.min(ob.x || 0, BB.learnN(id)) + '/' + BB.learnN(id)) : '';
      const t1 = (D.tags.includes('sig') ? '職業招式・' : '') + (D.el === '一般' ? '無屬性' : D.el + '屬性') + '・' + (D.cat === '變' ? '輔助' : D.cat === '物' ? '物理' : '魔法') + tgt + (typeof skillAttrTag === 'function' && skillAttrTag(id) ? '・' + skillAttrTag(id) : '') + learn, cT = can.ok ? this.costText(id) : (can.short || '不可用');
      x.fillStyle = c; x.fillRect(L, DY + 6, 4, 4); Font.draw(x, t1, L + 7, DY + 1, '#c9cfe4', UIC.textSh, fit(t1, 9, w - 30 - Font.width(cT, 9))); Font.drawR(x, cT, R, DY + 1, can.ok ? '#8ab8ff' : UIC.bad, UIC.textSh, 9);
      let y = DY + 14;
      if (D.power) { const pw = mv && typeof powTxt === 'function' ? powTxt(mv) : '威力' + D.power, eT = est ? '預估≈' + est : ''; x.fillStyle = 'rgba(200,160,80,0.35)'; x.fillRect(L, DY + 13, w - 16, 1);
        const pe = Font.draw(x, pw, L, y, UIC.accent, UIC.textSh, fit(pw, 10, w - 22 - (eT ? Font.width(eT, 9) : 0) - 12)); Font.draw(x, 'ⓘ', pe + 2, y, m.formula ? UIC.warm : UIC.muted, UIC.textSh, 9); if (eT) Font.drawR(x, eT, R, y + 1, UIC.warm, UIC.textSh, 9);
        if (typeof touchRegion === 'function') touchRegion(L, y - 2, w - 16, 13, () => { m.formula = !m.formula; Sound.sfx('cursor'); }); y += 13; }
      Font.drawC(x, Game.touchUI ? (m.tapSel === m.i ? '再點一次：使用　點外面：返回' : '點技能看說明・再點一次使用') : 'A：使用　B：返回', W / 2, BB_Y + 11, Game.touchUI && m.tapSel === m.i ? UIC.warm : UIC.muted, UIC.textSh, 9);
      const extra = ob && ob.e && ob.e.length && typeof evoOptText === 'function' ? '　【進化】' + ob.e.map((b, s) => (b === 'A' ? '強攻' : '附加') + evoOptText(ob, s, b)).join('、') : '';
      // v12.0.1 (player: 「部分文字敘述還是會超出看不到」): ⓘ opens the whole explanation over the skill list (it was squeezed into 30px at 7px text)
      if (m.formula) { const PY = Y, PH = DY + DH - Y, sig = D.tags.includes('sig'); drawWin(x, X, PY, w, PH, 'menu');
        const nm = this.skillName(id, 'H'); Font.draw(x, nm, L, PY + 3, c, UIC.textSh, fit(nm, 11, w - 30 - Font.width(cT, 9))); Font.drawR(x, cT, R, PY + 4, can.ok ? '#8ab8ff' : UIC.bad, UIC.textSh, 9);
        Font.draw(x, t1, L, PY + 17, '#c9cfe4', UIC.textSh, fit(t1, 9, w - 16)); x.fillStyle = 'rgba(200,160,80,0.35)'; x.fillRect(L, PY + 30, w - 16, 1);
        const pf = D.power && mv && typeof powFormula === 'function' ? powFormula(id) : '', body = sig && pf ? pf : ((mv && mv.d) || D.desc || '') + (pf ? '\n' + pf : '');
        drawFitText(x, body + (extra ? '\n' + extra.trim() : ''), L, PY + 33, w - 16, PH - 33 - 13, 10, '#ffe8b0');
        Font.drawC(x, (Game.touchUI ? '點這裡' : 'SELECT') + '：關閉說明', W / 2, PY + PH - 12, UIC.muted, UIC.textSh, 8);
        if (typeof touchRegion === 'function') touchRegion(X, PY, w, PH, () => { m.formula = false; Sound.sfx('cursor'); }); return; }
      drawFitText(x, m.formula && D.power && mv && typeof powFormula === 'function' ? powFormula(id) : ((mv && mv.d) || D.desc || '') + extra, L, y, w - 16, DY + DH - 5 - y, 9, m.formula ? '#ffe8b0' : UIC.text);
    };
    while (true) {
      const r = yield* choose(list.map(id => ({ t: (DEF.skills[id].tags.includes('sig') ? '★' : '') + this.skillName(id, 'H'), r: this.costText(id), col: this.canUse(id).ok ? undefined : UIC.dis })), { x: X, y: Y, w, h, rowH, fs: 10, ox: 12, oy: 17, visible: VIS, title: '技能', index: cur, onMove: i => cur = i, drawExtra: info, twoTap: true, onSel: mm => { mm.formula = !mm.formula; Sound.sfx('cursor'); } });
      if (r < 0) { this.idle = false; return null; }
      const can = this.canUse(list[r]); if (!can.ok) { yield* this.msg(can.why); continue; }
      this.idle = false; this.moveIdx = r; return list[r];
    }
  }
  /* ---------- playing the event log ---------- */
  *play() { const L = this.core.log; while (this.cur < L.length) { const e = L[this.cur++]; yield* this.onEvent(e); } this.dropAnn(); this._phase = null; this.dimT = 0; this.sync(); }
  // after a stretch of playback the screen state equals the core state (nothing drifts)
  sync() { for (const u of this.core.units) { const v = this.views[u.id]; if (!v) continue; v.hp = u.res.hp; v.mp = u.res.mp || 0; Object.assign(v.res, u.res); Object.assign(v.max, u.max); v.st = {}; for (const s of u.statuses) v.st[s.id] = s.stacks; if ((u.down || u.fled) && !v.gone) { v.gone = true; v.alpha = 0; } }
    this.multi = this.multi || this.foes().length > 1; }
  *onEvent(e) {
    const s = this.vw(e.src), t = this.vw(e.tgts[0]), P = e.payload, H = this.handlers[e.type];
    if (H) yield* H.call(this, e, s, t, P);
  }
}
Object.defineProperty(Battle.prototype, 'offH', { get() { return this.H.off; }, set(v) { this.H.off = v; } });
Object.defineProperty(Battle.prototype, 'offF', { get() { return this.F.off; }, set(v) { this.F.off = v; } });
for (const k of ['tint', 'blink', 'sink', 'alpha', 'squish']) {
  Object.defineProperty(Battle.prototype, k + 'H', { get() { return this.H[k]; }, set(v) { this.H[k] = v; } });
  Object.defineProperty(Battle.prototype, k + 'F', { get() { return this.F[k]; }, set(v) { this.F[k] = v; } });
}
