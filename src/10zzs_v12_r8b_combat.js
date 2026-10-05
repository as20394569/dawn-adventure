/* ===================== v12.0.8b 第八輪（二）：強化魔物・魔物的招牌行為・屬性反應（玩家在〈第八輪提案〉第二步 B～D 勾「照這樣做」） =====================
   B 強化魔物：Lv8 以後，野外和迷宮看得見的魔物有 4% 是強化魔物（8 種詞綴）。地圖上腳下有一圈光、頭上寫著詞綴；戰鬥時只有牠一隻，
     打倒後經驗和金錢 ×2、素材 ×2、25% 掉一件該地區的裝備。
   C 招牌行為：叫同伴・逃跑・偷東西・自爆・縮殼・治療同伴・分裂・裝死（名單上的 30 種魔物，只限野生的，叫來的小隻不會再叫）。
   D 屬性反應：凍結（雪天，水打潮濕）、毒焰（火打中毒）、泥濘（岩打潮濕）、燎原晴天 ×1.8、感電雨天必定麻痺、夜光（夜晚的雷 20% 退縮）。 */

/* ---------- B. 強化魔物：資料 ---------- */
const CHAMP12 = {
  hard: { n: '堅硬', c: '#c8d4e8', d: '物防、魔防 +50%' },
  rage: { n: '狂暴', c: '#ff6a50', d: '物攻、魔攻 +30%；HP 一半以下再 +20%' },
  regen: { n: '再生', c: '#7af090', d: '每回合結束回復 8% HP' },
  swift: { n: '飛快', c: '#7ae8ff', d: '速度 +50%' },
  venom: { n: '劇毒', c: '#c890ff', d: '攻擊打中時 30% 讓對手中毒' },
  huge: { n: '巨大', c: '#ffb050', d: 'HP 是平常的兩倍' },
  leech: { n: '吸血', c: '#ff5a8a', d: '造成傷害的 25% 變成自己的 HP' },
  thorn: { n: '反擊', c: '#ffe060', d: '被物理攻擊打中時 30% 反擊' },
};
const CHAMP_KEYS12 = Object.keys(CHAMP12), CHAMP_RATE12 = 0.04, CHAMP_LV12 = 8;
const hexA12 = (h, a) => { const [r, g, b] = hex2rgb(h); return 'rgba(' + r + ',' + g + ',' + b + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; };
// 巨大: the map picture is drawn one size up
const ROAM_BIG12 = {};
function roamBig12(sp) { if (ROAM_BIG12[sp]) return ROAM_BIG12[sp]; const b = roamImg12(sp); if (!b || !b.big) return null;
  const w = Math.round(b.c.width * 1.5), h = Math.round(b.c.height * 1.5), c = mkCanvas(w, h), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b.c, 0, 0, w, h);
  return ROAM_BIG12[sp] = { c, flip: flipCanvas(c), big: 1 }; }
function champMake12(e, k = pick(CHAMP_KEYS12)) { e.champ12 = k; if (k === 'huge') e.img = roamBig12(e.sp) || e.img; }
{ const _sp = Overworld.prototype.roamSpawn12; Overworld.prototype.roamSpawn12 = function () { const L = _sp.call(this), st = this.st;
    if ((st.lv || 1) >= CHAMP_LV12) for (const e of L) if (!e.rare && !e.pack && !e.scare12 && !e.wxm && chance(CHAMP_RATE12)) champMake12(e);
    return L; }; }
// the time of day can turn an out-of-sight monster into another species: a 巨大 one stays big
{ const _ch = Overworld.prototype.dnChange12; Overworld.prototype.dnChange12 = function (...a) { _ch.apply(this, a);
    if (this.roam12) for (const e of this.roam12.list) if (e.champ12 === 'huge') e.img = roamBig12(e.sp) || e.img; }; }
// on the map: a ring of light at the feet and the affix over the head (drawn above the night dark, like the sleeping z's)
function champDraw12(ow, x, L) {
  const z = ow._zc ? ZOOM_F : 1, S = (wx, wy) => { let sx = wx - ow.camX, sy = wy - ow.camY; if (ow._zc) { sx = ow._zc[0] + (sx - ow._zc[0]) * z; sy = ow._zc[1] + (sy - ow._zc[1]) * z; } return [sx, sy]; };
  x.save();
  for (const e of L) { const C = e.champ12 ? CHAMP12[e.champ12] : e.bounty12 && typeof BOUNTY_LOOK12 !== 'undefined' ? BOUNTY_LOOK12 : null; if (!C) continue;
    const im = e.img.c, hop = e.moving ? Math.round(Math.sin(Math.min(1, e.prog / 16) * Math.PI) * 3) : 0, [cx, fy] = S(Math.round(e.px) + 8, Math.round(e.py) + 15);
    if (cx < -40 || fy < -40 || cx > W + 40 || fy > H + 60) continue;
    const rw = Math.max(8, im.width / 2.6) * z, pul = 0.6 + 0.3 * Math.sin(ow.t * 0.12 + e.x * 1.7);
    x.globalCompositeOperation = 'lighter'; const gr = x.createRadialGradient(cx, fy - 2, 0, cx, fy - 2, rw * 1.5); gr.addColorStop(0, hexA12(C.c, 0.4 * pul)); gr.addColorStop(1, hexA12(C.c, 0));
    x.fillStyle = gr; x.beginPath(); x.ellipse(cx, fy - 2, rw * 1.5, rw * 0.65, 0, 0, 7); x.fill();
    x.globalCompositeOperation = 'source-over'; x.strokeStyle = hexA12(C.c, 0.95 * pul); x.lineWidth = 1; x.beginPath(); x.ellipse(Math.round(cx) + 0.5, Math.round(fy - 1) + 0.5, rw, rw * 0.38, 0, 0, 7); x.stroke();
    const ly = Math.max(26, Math.round(fy - (im.height + hop) * z - 10)), tw = Font.width(C.n, 8);
    x.fillStyle = 'rgba(10,10,20,0.55)'; x.fillRect(Math.round(cx - tw / 2 - 3), ly + 2, Math.round(tw + 6), 12); Font.drawC(x, C.n, Math.round(cx), ly, C.c, '#101018', 8); }
  x.restore(); }
{ const _wp = owWorldPost; owWorldPost = function (ow, x) {
    const L = (ow.elites || []).filter(e => e.roam && (e.champ12 || e.bounty12) && e.img), big = L.filter(e => e.champ12 === 'huge' || e.bounty12), keep = big.map(e => e.img);
    for (const e of big) e.img = { ...e.img, big: 0 }; // the eye glints are placed for the normal-size picture
    try { _wp(ow, x); } finally { big.forEach((e, i) => { e.img = keep[i]; }); }
    if (L.length) champDraw12(ow, x, L); }; }

/* ---------- B. 強化魔物：戰鬥 ---------- */
{ const _rf = Overworld.prototype.roamFight12; Overworld.prototype.roamFight12 = function* (e, ...a) {
    this._champ12 = e.champ12 || null; Game.fled12 = 0;
    try { yield* _rf.call(this, e, ...a); } finally { this._champ12 = null; }
    if (Game.fled12 && this.elites.includes(e)) this.roamDrop12(e); Game.fled12 = 0; // it ran away for good
  }; }
{ const _bs = Overworld.prototype.battleScript; Overworld.prototype.battleScript = function* (cfg, ...a) {
    if (cfg && cfg.roam12 && this._champ12) { cfg = { ...cfg, champ12: this._champ12, solo: 1 }; this._champ12 = null; }
    return yield* _bs.call(this, cfg, ...a);
  }; }
defPut('mechanics', 'ch12_rage', { make: () => ({ mods: [{ stage: 'attacker', who: 'attacker', mul: 1.2, cond: { ownerHpBelow: 0.5, hasPower: 1 } }] }) });
defPut('mechanics', 'ch12_regen', { make: () => ({ triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'heal', target: 'self', pct: 0.08, kind: 'regen' }] }] }) });
defPut('mechanics', 'ch12_venom', { make: () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { evHit: 1, hasPower: 1, tgtAlive: 1, tgtSide: 'enemy' }, chance: 0.3, limit: { perAction: 1 },
  effects: [{ type: 'status', target: 'event_target', status: 'psn', secondary: 1, cond: { tgtNoMajor: 1 } }] }] }) });
defPut('mechanics', 'ch12_leech', { make: () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { evHit: 1, hasPower: 1, tgtSide: 'enemy' }, effects: [{ type: 'heal', target: 'self', ofEvent: 0.25, kind: 'drain' }] }] }) });
defPut('mechanics', 'ch12_thorn', { make: () => ({ triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { cat: '物', evHit: 1, hasPower: 1, srcSide: 'enemy', ownerAlive: 1 }, chance: 0.3, limit: { perAction: 1 },
  effects: [{ type: 'counter', mul: 0.7, why: 'counter' }] }] }) });
function champUnit12(s, k) { const S = s.stats, C = CHAMP12[k]; s.name = C.n + s.name; s.data.champ12 = k; s.data.mechanics = s.data.mechanics || [];
  const m = (key, f) => { S[key] = Math.max(1, Math.round((S[key] || 0) * f)); };
  if (k === 'hard') { m('def', 1.5); m('spd', 1.5); } if (k === 'rage') { m('atk', 1.3); m('spa', 1.3); } if (k === 'swift') m('spe', 1.5); if (k === 'huge') { m('hp', 2); s.hp = S.hp; }
  if (DEF.mechanics['ch12_' + k]) s.data.mechanics.push('ch12_' + k); }
{ const _b = BB.build; BB.build = function (cfg, st = Game.st) { BD._champ12 = cfg && cfg.champ12 || null; let core;
    try { core = _b.call(this, cfg, st); } finally { BD._champ12 = null; }
    core.data.stealItem12 = () => { const s = Game.st, L = Object.keys(s.bag || {}).filter(k => s.bag[k] > 0 && ITEMS[k] && (ITEMS[k].cat === '回復' || ITEMS[k].cat === '狀態治療')); if (!L.length) return null;
      const k = core.rng.pick(L); s.bag[k]--; if (!s.bag[k]) delete s.bag[k]; return k; };
    return core; }; }
{ const _ue = BD.unitForEnemy; BD.unitForEnemy = function (core, sp, lv, kind, side, idx, o = {}) { const s = _ue.call(this, core, sp, lv, kind, side, idx, o); if (!s || side !== 'B') return s;
    if (idx === 1 && BD._champ12 && CHAMP12[BD._champ12]) champUnit12(s, BD._champ12);
    if (kind === 'wild') behUnit12(s);
    return s; }; }
// two of a kind get A / B: a champion keeps its affix in front of the name
{ const _nf = BB.nameFoes; BB.nameFoes = function (core) { const C = core.side('B').filter(u => u.data && u.data.champ12 && CHAMP12[u.data.champ12]);
    for (const u of C) { const n = CHAMP12[u.data.champ12].n; if (u.name.startsWith(n)) u.name = u.name.slice(n.length); }
    const r = _nf.call(this, core); for (const u of C) u.name = CHAMP12[u.data.champ12].n + u.name; return r; }; }
// 巨大 in battle: one size up
{ const _rf = Battle.prototype.renderFoe; Battle.prototype.renderFoe = function (v, tint) { const im = _rf.call(this, v, tint); if (!im || !v.u || v.u.data.champ12 !== 'huge') return im;
    const k = 1.4, w = Math.round(im.width * k), h = Math.round(im.height * k), key = tint ? 'big12T' : 'big12'; let c = v.A[key]; if (!c || c.width !== w || c.height !== h) c = v.A[key] = mkCanvas(w, h);
    const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0, w, h);
    c.ds = im.ds || 1; c.px = im.px; c.bb = im.bb ? { cx: Math.round(im.bb.cx * k), top: Math.round(im.bb.top * k), bot: Math.round(im.bb.bot * k), w: Math.round(im.bb.w * k), h: Math.round(im.bb.h * k) } : null; return c; }; }
{ const _in = Battle.prototype.intro; Battle.prototype.intro = function* (...a) { const r = yield* _in.apply(this, a); const k = this.cfg && this.cfg.champ12, C = k && CHAMP12[k];
    if (C) { const f = Game.st.flags; Sound.sfx('charge'); yield* this.msg('這是強化魔物！\n【' + C.n + '】' + C.d + '。', { hold: 44 });
      if (!f.champ12a) { f.champ12a = 1; yield* this.msg('（強化魔物比較難打。打倒的話，經驗和金錢加倍，還會多掉素材，有時掉裝備。）', { wait: true }); } }
    return r; }; }
{ const _ge = Battle.prototype.gainExp; Battle.prototype.gainExp = function* (a) { yield* _ge.call(this, this.cfg && this.cfg.champ12 ? a * 2 : a); }; }
{ const _v = Battle.prototype.victory; Battle.prototype.victory = function* () { const st = Game.st, core = this.core, back = core && core.data.stolenItems12;
    if (back && back.length) { for (const k of back) st.bag[k] = (st.bag[k] || 0) + 1; yield* this.msg('拿回了被偷走的' + back.map(k => '「' + ITEMS[k].n + '」').join('、') + '！'); core.data.stolenItems12 = []; }
    const r = yield* _v.call(this); const k = this.cfg && this.cfg.champ12; if (!k || !core) return r;
    const u = core.units.find(q => q.side === 'B' && q.data && q.data.champ12); if (!u || !u.down) return r;
    st.champ12N = (st.champ12N || 0) + 1; const sp = SPECIES[u.sp] || {}, fx = (this.hs && this.hs.fx) || {};
    const g = Math.floor((sp.gold || 0) * u.lv * (typeof V81_GOLD === 'function' ? V81_GOLD(u.lv) : 1) * (fx.fortune ? 1.5 : 1)); st.money += g;
    const mat = sp.mat && ITEMS[sp.mat] ? sp.mat : null; if (mat) st.bag[mat] = (st.bag[mat] || 0) + 2; Sound.jingle('item');
    yield* this.msg('強化魔物的獎勵：再得到' + g + ' G' + (mat ? '和素材「' + ITEMS[mat].n + '」×2' : '') + '！', { hold: 36 });
    const pool = Game.ow && Game.ow.map && Game.ow.map.d.gearPool; const dk = pool && pool.length ? (typeof pickDrop12 === 'function' ? pickDrop12(pool, u.sp) : pick(pool)) : null; if (dk && chance(0.25)) { this.focus = this.views[u.id] || this.focus; yield* this.lootShow(makeGear(dk, rollQuality()), u.name + '掉落了裝備！'); }
    return r; }; }

/* ---------- C. 魔物的招牌行為 ---------- */
const BEH12 = {
  call: ['meadowWolf', 'greyWolf', 'snowWolf', 'fieldMice', 'roadBandit', 'featherThug'],
  flee: ['hornHare', 'snowHare', 'forestMarten', 'thiefCrow'],
  thief: ['strawCrow', 'mountainApe', 'sewerRat'],
  blast: ['emberSpirit', 'magmaSlime', 'obsidianChunk', 'pebble'],
  shell: ['mistSnail', 'mossTurtle', 'lakeClam', 'obsidianTurtle', 'spineArmadillo'],
  mend: ['dewSprite', 'moonSprite', 'fluffSeed'],
  split: ['slime', 'sludge'],
  fake: ['ghoul', 'sandSkull', 'skeleton'],
};
const BEH_N12 = { call: '叫同伴', flee: '逃跑', thief: '偷東西', blast: '自爆', shell: '縮殼', mend: '治療同伴', split: '分裂', fake: '裝死' };
const BEH_OF12 = {}; for (const b in BEH12) for (const sp of BEH12[b]) if (SPECIES[sp]) BEH_OF12[sp] = b;
Object.assign(BV_TEXT, {
  call12: s => s + '大聲呼叫，同伴趕來了！',
  split12: s => s + '的身體分成了兩半！',
  blast12: s => s + '全身開始發光了！\n（下一回合會自爆！先打倒牠，或是防禦）',
  shell12: s => s + '縮進了殼裡！\n（物理攻擊幾乎打不動，用魔法吧）',
  fake12: s => s + '倒下了……\n……又站起來了！剛剛是在裝死！',
  freeze12: (s, t) => '凍結！' + t + '全身結冰了！',
  toxfire12: (s, t) => '毒焰！毒被點燃了，' + t + '的中毒變成了灼傷！',
  mud12: (s, t) => '泥濘！' + t + '身上的水和砂石混成了泥巴！',
  nightflash12: (s, t) => '夜裡的雷光太刺眼了！' + t + '退縮了！',
});
CANCEL_TXT.ice12 = '全身結冰，無法行動！';
defPut('statuses', 'shell12', { tags: ['buff'], duration: 'rounds', durDefault: 2, tick: 'round_end', stack: 'refresh', metadata: { n: '縮殼' },
  mods: [{ stage: 'final', who: 'defender', mul: 0.3, cond: { cat: '物', hasPower: 1 } }] });
defPut('statuses', 'glow12', { tags: ['debuff'], duration: 'until_release', stack: 'none', metadata: { n: '發光' } });
defPut('statuses', 'ice12', { tags: ['debuff'], duration: 'next_action', stack: 'none', metadata: { n: '結冰' }, blockAction: (core, u) => { core.removeStatus(u, 'ice12', 'used12'); return 'ice12'; } });
Object.assign(BADGE_OF, { shell12: 'def_up', ice12: 'frozen' });
Object.assign(EFFECT_TYPES, {
  beh_summon12: { exec(core, ef, ctx) { const u = ctx.owner; if (!u || !core.isUp(u) || core.alive(u.side).length >= 3) return;
    core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: ef.key } }); EFFECT_TYPES.summon.exec(core, { sp: u.sp, kind: 'minion', lv: u.lv, maxSide: 3 }, ctx); } },
  steal_item12: { exec(core, ef, ctx) { const u = ctx.owner, k = core.data.stealItem12 && core.data.stealItem12(); if (!k) return; (core.data.stolenItems12 || (core.data.stolenItems12 = [])).push(k);
    core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { text: u.name + (u.sp === 'mountainApe' ? '搶走了「' : '叼走了「') + ITEMS[k].n + '」！' + (Game.st.flags.thief12 ? '' : '\n（打倒牠就能拿回來）'), hold: 30 } }); Game.st.flags.thief12 = 1; } },
  blast_mark12: { exec(core, ef, ctx) { const u = ctx.owner; if (!u || !core.isUp(u)) return; u.data.blast12 = core.round; core.applyStatus(u, u, 'glow12', { quiet: true });
    core.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: 'blast12', hold: 34 } }); } },
  selfko12: { exec(core, ef, ctx) { const u = ctx.owner; if (!u || !core.isUp(u)) return; u.res.hp = 0; core.knockDown(u, u); } },
});
const BEH_TRIG12 = {
  call: () => [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { ownerHpBelow: 0.5, ownerAlive: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'beh_summon12', key: 'call12' }] }],
  split: () => [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { ownerHpBelow: 0.5, ownerAlive: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'beh_summon12', key: 'split12' }] }],
  thief: () => [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { evHit: 1, hasPower: 1, tgtSide: 'enemy' }, chance: 0.6, limit: { perBattle: 1 }, effects: [{ type: 'steal_item12' }] }],
  blast: () => [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { ownerHpBelow: 0.3, ownerAlive: 1 }, limit: { perBattle: 1 }, effects: [{ type: 'blast_mark12' }] }],
  shell: () => [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { ownerHpBelow: 0.4, ownerAlive: 1 }, limit: { perBattle: 1 },
    effects: [{ type: 'status', target: 'self', status: 'shell12', dur: 2 }, { type: 'message', key: 'shell12', target: 'self' }] }],
  fake: () => [{ on: EVT.DOWN, phase: 'PRE', role: 'tgt', layer: 'prevent', whenDown: 1, cond: {}, limit: { perBattle: 1 }, effects: [{ type: 'prevent_down', pct: 0.3, key: 'fake12', why: 'fake12' }] }],
};
for (const b in BEH_TRIG12) defPut('mechanics', 'bh12_' + b, { make: u => ({ triggers: BEH_TRIG12[b](u) }) });
function behUnit12(s) { const b = BEH_OF12[s.sp]; if (!b) return; s.data.beh12 = b; if (DEF.mechanics['bh12_' + b]) (s.data.mechanics = s.data.mechanics || []).push('bh12_' + b); }
// 自爆 (fire / rock) and the ally heals (the species' own heal move, aimed at a friend)
const M8_MOVES = {
  m8_blastF: { n: '自爆', t: '火', cat: '物', pow: 150, acc: 100, pp: 1, d: '把全身的火一口氣爆開。打完自己也會倒下。', cls: 'charge', fx: 'm_eruption' },
  m8_blastR: { n: '自爆', t: '岩', cat: '物', pow: 150, acc: 100, pp: 1, d: '全身裂開炸成碎石。打完自己也會倒下。', cls: 'charge', fx: 'm6_shardBurst' },
  m8_dewAlly: { n: '朝露', t: '水', cat: '變', pp: 10, d: '葉子上的露水滴到同伴身上。回復同伴的體力。', cls: 'buff', mfx: function* (U, T) { yield* M6FX.heal.call(this, T || U, M6_PAL.dew); } },
  m8_moonAlly: { n: '月光', t: '一般', cat: '變', pp: 10, d: '把月光分給同伴。回復同伴的體力。', cls: 'buff', mfx: function* (U, T) { yield* M6FX.heal.call(this, T || U, M6_PAL.moon); } },
};
for (const k in M8_MOVES) { const m = M8_MOVES[k], { mfx, ...mv } = m; MOVES[k] = { ...mv, foe: 1 }; if (mfx) { MFX[k] = mfx; MOVES[k].fx = k; } else if (mv.fx && MFX[mv.fx]) MFX[k] = MFX[mv.fx];
  const D = defPut('skills', k, skillFromMove(k, MOVES[k], { kind: 'skill', extraTags: ['monster_skill'] })); D.cooldown = 0;
  if (k.startsWith('m8_blast')) D.after = (D.after || []).concat([{ type: 'selfko12' }]);
  else { D.target = 'ally'; D.effects = [{ type: 'heal', pct: 0.3 }]; }
  D.effects = D.effects.map((ef, i) => typeof ef === 'string' ? ef : effRegister('skill:' + k + '#e' + i, ef)); D.after = D.after.map((ef, i) => typeof ef === 'string' ? ef : effRegister('skill:' + k + '#a' + i, ef)); }
const BLAST_OF12 = { emberSpirit: 'm8_blastF', magmaSlime: 'm8_blastF', obsidianChunk: 'm8_blastR', pebble: 'm8_blastR' };
const MEND_OF12 = { dewSprite: 'm8_dewAlly', moonSprite: 'm8_moonAlly', fluffSeed: 'm8_dewAlly' };
{ const _d = BAI.decide; BAI.decide = function (core, u, o = {}) {
    const b = !u.hero && u.data && u.data.beh12, R = core.rng, hero = core.units.find(q => q.hero && !q.down);
    if (b === 'flee' && u.res.hp < u.max.hp * 0.25 && !u.data.noEscape && R.chance(0.5)) { Game.fled12 = 1; return { type: 'flee' }; }
    if (b === 'blast' && u.data.blast12 != null && core.round > u.data.blast12 && hero) return { type: 'skill', skill: BLAST_OF12[u.sp] || 'm8_blastF', targets: [hero.id] };
    if (b === 'mend' && (u.data.mends12 || 0) < 3) { const hurt = core.alive(u.side).filter(q => q !== u && q.res.hp < q.max.hp * 0.6).sort((p, q) => p.res.hp / p.max.hp - q.res.hp / q.max.hp)[0];
      if (hurt && R.chance(0.6)) { u.data.mends12 = (u.data.mends12 || 0) + 1; return { type: 'skill', skill: MEND_OF12[u.sp] || 'm8_dewAlly', targets: [hurt.id] }; } }
    return _d.call(this, core, u, o); }; }
// the glowing one pulses until it goes off; the shell's end is told; statuses taken away by a reaction are not "cured"
{ const _dr = Battle.prototype.draw; Battle.prototype.draw = function (x) { const L = (this.foes ? this.foes() : []).filter(v => v.st && v.st.glow12 && !v.tint);
    for (const v of L) v.tint = { c: '#fff0a0', a: 0.2 + 0.25 * (0.5 + 0.5 * Math.sin(this.t * 0.35)) };
    try { return _dr.call(this, x); } finally { for (const v of L) v.tint = null; } }; }
{ const H = Battle.prototype.handlers, _sg = H.statusGone; H.statusGone = function* (e, s, t, P, expire) {
    if (P && /12$/.test(P.why || '')) { if (t) delete t.st[P.status]; return; }
    if (t && P && P.status === 'shell12' && expire) { delete t.st.shell12; yield* this.msg(t.n + '從殼裡探出頭來了。', { hold: 20 }); return; }
    yield* _sg.call(this, e, s, t, P, expire); }; }

/* ---------- D. 屬性反應 ---------- */
COND.night12 = c => !!(c.core.cfg && c.core.cfg.dn === 'night');
COND.wxIn12 = (c, v) => v.includes(c.core.env.weather);
COND.iceReady12 = c => !!c.tgt && (c.tgt.data.ice12 == null || c.core.round - c.tgt.data.ice12 >= 3);
EFFECT_TYPES.react12 = { exec(core, ef, ctx, tg) { for (const t of tg) { if (!core.isUp(t)) continue; const msg = key => core.emit(EVT.MESSAGE, { src: null, tgts: [t], payload: { key } });
    if (ef.k === 'ice') { core.removeStatus(t, 'wet', 'freeze12'); core.applyStatus(null, t, 'ice12', { quiet: true }); t.data.ice12 = core.round; msg('freeze12'); }
    if (ef.k === 'toxfire') { core.removeStatus(t, 'psn', 'toxfire12'); core.applyStatus(null, t, 'brn', { secondary: true }); msg('toxfire12'); }
    if (ef.k === 'mud') { core.removeStatus(t, 'wet', 'mud12'); msg('mud12'); EFFECT_TYPES.stage.exec(core, { type: 'stage', stats: { spe: -2 }, dur: 3 }, ctx, [t]); }
    if (ef.k === 'rainShock') { const m = core.majorOf(t); if (m && m !== 'par') core.removeStatus(t, m, 'rain12'); }
  } } };
DEF.mechanics.elementReactions.triggers.push(
  // 凍結: snow, water on a wet foe → it can't act next time (once every 3 rounds per target)
  { on: EVT.DAMAGE, phase: 'POST', prio: 21, cond: { evHit: 1, evEl: '水', tgtStatus: 'wet', env: 'snow', tgtAlive: 1, iceReady12: 1 }, effects: [{ type: 'react12', k: 'ice', target: 'event_target' }] },
  // 毒焰: fire on a poisoned foe → ×1.3, the poison turns into a burn
  { on: EVT.DAMAGE, phase: 'PRE', cond: { evHit: 1, evEl: '火', tgtStatus: 'psn' }, effects: [{ type: 'modify', mul: 1.3, note: 'toxfire12' }] },
  { on: EVT.DAMAGE, phase: 'POST', prio: 21, cond: { evHit: 1, evEl: '火', tgtStatus: 'psn', tgtAlive: 1 }, effects: [{ type: 'react12', k: 'toxfire', target: 'event_target' }] },
  // 泥濘: rock on a wet foe → speed −2
  { on: EVT.DAMAGE, phase: 'POST', prio: 21, cond: { evHit: 1, evEl: '岩', tgtStatus: 'wet', tgtAlive: 1 }, effects: [{ type: 'react12', k: 'mud', target: 'event_target' }] },
  // 燎原 on a sunny day: ×1.5 → ×1.8
  { on: EVT.DAMAGE, phase: 'PRE', cond: { evHit: 1, evEl: '火', tgtStatus: 'tangle', env: 'clear' }, effects: [{ type: 'modify', mul: 1.2, note: 'ignite_sun12' }] },
  // 感電 in the rain: the paralysis always lands (another ailment makes way for it)
  { on: EVT.DAMAGE, phase: 'POST', prio: 21, cond: { evHit: 1, evEl: '雷', tgtStatus: 'wet', wxIn12: ['rain', 'storm'], tgtAlive: 1 }, effects: [{ type: 'react12', k: 'rainShock', target: 'event_target' }] },
  // 夜光: at night a thunder hit makes the foe flinch 20% of the time
  { on: EVT.DAMAGE, phase: 'POST', prio: 17, cond: { evHit: 1, evEl: '雷', night12: 1, tgtAlive: 1 }, chance: 0.2, limit: { perAction: 1 },
    effects: [{ type: 'status', target: 'event_target', status: 'flinch' }, { type: 'message', key: 'nightflash12', target: 'event_target' }] },
);
// the reactions show on the target: ice-blue, purple flame, mud brown, a white flash
{ const H = Battle.prototype.handlers, _m = H.MESSAGE, FX12 = { freeze12: ['#bfe8ff', ['#e8fbff', '#9ad8ff']], toxfire12: ['#c060ff', ['#d080ff', '#ff8040']], mud12: ['#8a6a40', ['#a08050', '#6a5030']], nightflash12: ['#ffffff', ['#ffffa0', '#ffffff']] };
  H.MESSAGE = function* (e, s, t, P) { const F = P && FX12[P.key]; if (F && t) { const C = this.center(t); if (P.key === 'nightflash12') this.spawn({ k: 'flash', c: '#ffffff', a: 0.5, life: 8 });
      this.sparks(C.x, C.y, 12, F[1], 2.2); t.tint = { c: F[0], a: 0.55 }; Sound.sfx(P.key === 'freeze12' ? 'charge' : 'hit'); yield* wait(10); t.tint = null; }
    if (P && P.key === 'fake12' && s) { Sound.sfx('hit'); yield* tween(10, k => { s.sink = k * 14; s.alpha = 1 - k * 0.5; }); yield* wait(18); yield* tween(14, k => { s.sink = 14 * (1 - k); s.alpha = 0.5 + k * 0.5; }); s.sink = 0; s.alpha = 1; }
    yield* _m.call(this, e, s, t, P); }; }
