/* ===================== v11 戰鬥顯示層：事件播放（每一種事件怎麼呈現） =====================
   Each handler receives (event, source view, first target view, payload) and only animates / writes text. The display
   numbers move with the events (HP to payload.hpAfter, resources to payload.new), so the screen is always in step with the
   order things happened in; Battle.play() re-syncs everything with the core at the end of each stretch. */
const hitPower = P => P.kind !== 'hit' ? 0 : P.mult > 1 || P.crit ? 2 : P.mult < 1 ? 0 : 1;
Battle.prototype.peek = function (fn) { const L = this.core.log; for (let i = this.cur; i < L.length; i++) { const r = fn(L[i]); if (r !== undefined) return r; } return null; };
Battle.prototype.telegraph = function* (s, D) {
  const strong = (D.power || 0) >= 75 || ((s.boss || s.elite) && (D.power || 0) >= 60) || D.id === 'm_dominate' || D.charge;
  this.banner = { s: D.name, t: 0, life: strong ? 70 : 46, strong, charge: false }; if (!strong) return;
  Sound.sfx('charge'); this.dimT = 0.5; s.tint = { c: '#ff2030', a: 0 };
  yield* tween(10, q => { s.tint.a = q * 0.45; }); if (D.charge) { this.shake = 12; Sound.sfx('quake'); }
  yield* tween(8, q => { s.tint.a = 0.45 * (1 - q); }); s.tint = null;
};
Battle.prototype.handlers = {
  *ROUND_START(e) { this.round = e.payload.round; },
  *ROUND_END() { this._phase = 'E'; this._phaseName = null; },
  *ACTION_START(e, s, t, P) { if (!s) return; this._phase = s.hero ? 'H' : 'F'; this._phaseName = s.n; this.cast = null; this.itemCtx = P.type === 'item'; if (!s.hero) this.focus = s; },
  *ACTION_END() { this.dropAnn(); this.dimT = 0; this.itemCtx = false; this.cast = null; },
  *ACTION_CANCEL(e, s, t, P) { const txt = CANCEL_TXT[P.why]; if (!txt || !s) return; const C = this.center(s);
    if (P.why === 'slp') yield* FX.zzz.call(this, C); else if (P.why === 'par') yield* FX.spark.call(this, null, C);
    yield* this.msg(s.n + txt, { hold: 26 }); },
  *TARGET_CHANGE() {},
  *SKILL_FAIL(e, s, t, P) { if (!s) return;
    if (P.why === 'cost') { if (s.hero) yield* this.msg((P.res === 'sgp' ? '招式點不夠，' : 'MP不夠，') + s.n + '改用普通攻擊！', { hold: 26 }); }
    else if (P.why === 'used') yield* this.msg('但是什麼都沒有發生……'); else if (P.why === 'miss') { this.dropAnn(); yield* this.msg('但是失敗了！', { hold: 22 }); } },
  *CHARGE(e, s, t, P) { const D = DEF.skills[P.skill]; if (!D || !s) return; if (!s.hero) { this.focus = s; this.banner = { s: D.name, t: 0, life: 70, strong: true, charge: true }; }
    yield* this.announce(s.n + (s.hero ? '使用了' + this.skillName(P.skill, s.id) + '！' : '開始蓄力「' + this.skillName(P.skill, s.id) + '」！')); yield* (s.hero ? FX.charge : MFX.mcharge).call(this, this.center(s)); // v12.68: a monster's wind-up is not the hit
    yield* this.msg(s.n + (D.chargeMsg || (D.airborne ? '高高跳了起來！' : '正在凝聚力量！'))); if (!s.hero && !this.warned) { this.warned = true; yield* this.msg(D.warn || '（它發出了危險的光芒……下回合會發動強力的攻擊！）'); } },
  *SKILL_USE(e, s, t, P) {
    const D = DEF.skills[P.skill]; if (!D || !s) return; const name = this.skillName(P.skill, s.id), tg = e.tgts.map(id => this.views[id]).filter(Boolean), foeTg = tg.filter(v => v.hero !== s.hero), hu = this.core.byId.H;
    this.cast = { id: P.cast, D, s, hits: 0, total: 0, said: {} }; if (!s.hero) this.focus = s; else if (foeTg[0]) this.focus = foeTg[0]; this.tgtV = foeTg[0] || null;
    const basic = D.tags.includes('basic'), wsp = D.tags.includes('weapon_special'), react = this.pendingReact; this.pendingReact = null;
    if (this.pendingSpecial) this.pendingSpecial = null; else if (!react) { if (!s.hero && !basic) yield* this.telegraph(s, D); yield* this.announce(s.n + '使用了' + name + '！'); yield* wait(6); }
    const T = foeTg.length > 1 ? this.groupOf(foeTg.map(v => v.id)) : foeTg[0], ob = s.hero ? BB.skillObj(Game.st, P.skill) : null;
    const mv = { n: name, t: D.el, cat: D.cat, pow: D.power, fx: D.fx, lv: 1 + (ob && ob.e ? ob.e.length : 0) };
    let fx = D.fx; if (s.hero && basic) fx = FX.wAtk ? 'wAtk' : hu.data.attackFx; if (s.hero && wsp) fx = hu.data.wspFx || 'hit';
    if (s.hero) { const k = (typeof WMOVE !== 'undefined' && WMOVE[P.skill]) || (typeof mainWKey === 'function' && mainWKey()); this._thT = k && typeof wThemeTH !== 'undefined' && wThemeTH[k] ? wThemeTH[k] : 'steel'; this._thKind = k && GEAR[k] ? GEAR[k].kind : null; this._thPow = basic ? 1 : D.power || 0; }
    this.slashOn = s.hero && ((typeof isSlashName === 'function' && isSlashName(name)) || (wsp && ['劍', '短刀', '斧'].includes(this._thKind))) ? 1 : 0;
    if (!foeTg.length) { // support skills: the hero's blessing flourish, then the skill's own picture (if it has one)
      if (s.hero && !wsp && typeof heroBless === 'function') heroBless.call(this, s, mv, P.skill);
      const self = FX[D.fx] && !['hit', 'buff'].includes(D.fx) ? FX[D.fx] : D.effects.some(f => f.type === 'heal') ? FX.heal : null; if (self) yield* self.call(this, this.center(s)); return; }
    if (s.hero && !basic && !wsp && typeof heroCast === 'function') yield* heroCast.call(this, s, mv, P.skill, T);
    yield* this.playFx(fx, s, T);
    if (s.hero && !basic && typeof heroImpact === 'function' && D.power) { const r = this.peek(q => q.cast === P.cast && q.type === EVT.DAMAGE ? q.payload : undefined); yield* heroImpact.call(this, this.center(T), mv, r, P.skill, s); }
    if (s.hero && this._thT && this._thPow && typeof wThemeBurst === 'function' && foeTg.some(v => v.hp > 0)) { wThemeBurst.call(this, this.center(T), this._thT, this._thPow >= 90); this._thPow = 0; }
    this.slashOn = 0;
  },
  *HIT(e, s, t, P) { if (P.hitIndex > 0 && t) { const C = this.center(t); Sound.sfx('hit'); this.star(C.x + rnd(-8, 8), C.y + rnd(-8, 8)); yield* wait(3); } },
  *MISS(e, s, t, P) { if (!t || !s) return; yield* wait(6); this.dropAnn();
    yield* this.msg(P.air ? t.n + '在空中，打不到！' : s.n + '的攻擊沒有打中！', { hold: 24 }); },
  *CRIT() {},
  *DAMAGE(e, s, t, P) {
    if (!t) return; const a = P.amount, to = P.hpAfter ?? Math.max(0, t.hp - a), C = this.center(t), st = Game.st, kind = P.kind, cs = this.cast;
    if (kind === 'dot') { const brn = P.el === 'brn'; Sound.sfx(brn ? 'fire' : 'poison'); yield* FX[brn ? 'burnFx' : 'psnFx'].call(this, null, C); }
    else if (kind === 'rocks') yield* FX.rock.call(this, null, C);
    else if (kind === 'arrow') yield* FX.sting.call(this, this.center(this.H), C);
    else if (kind === 'thorns' || kind === 'reflect') { const U = this.center(s || this.H); this.spawn({ k: 'line', x1: U.x, y1: U.y, x2: C.x, y2: C.y, c: kind === 'reflect' ? '#c8f4ff' : '#a8e070', w: 3, grow: 3, life: 12 }); yield* wait(8); }
    else if (kind === 'ally') { Sound.sfx('slash'); this.spawn({ k: 'line', x1: C.x - 20, y1: C.y - 22, x2: C.x + 16, y2: C.y + 18, c: '#ffd070', w: 5, grow: 3, life: 12 }); this.spawn({ k: 'line', x1: C.x - 20, y1: C.y - 22, x2: C.x + 16, y2: C.y + 18, c: '#ffffff', w: 2, grow: 3, life: 14 }); yield* wait(8); }
    else if (kind === 'double' || kind === 'pursuit' || kind === 'sigTwice') { if (s) yield* this.lunge(s, 8, 2); }
    if (kind !== 'dot') { Sound.sfx(P.mult > 1 ? 'hitSuper' : P.mult < 1 ? 'hitWeak' : 'hit'); if (P.crit) Sound.sfx('crit'); }
    if (s && s.hero && kind === 'hit' && this.hs && this.hs.enT && P.el === this.hs.enT && typeof enBurst === 'function' && !(cs && cs.en)) { enBurst(this, t, P.el); if (cs) cs.en = 1; }
    // numbers: weakness / crit / broken tags on monsters; a big hit on the hero shakes, flashes red and stops time briefly
    let stop = 0;
    if (!t.hero) { if (P.mult > 1 && kind === 'hit') { const dx = st.dex && st.dex[t.sp]; if (dx) { if (t.u && t.u.data && t.u.data.hunt2) dx.rev2 = 1; else dx.rev = 1; } }
      if (a > 0) this.popNum(t, a, P.mult > 1 ? '#ffd040' : P.crit ? '#ff9a50' : '#ffffff', P.mult > 1 ? '弱點' : P.crit ? '會心' : t.broken ? '破防' : null); }
    else if (a > 0) { const fr = a / t.maxhp; this.popNum(t, a, fr >= 0.25 ? '#ff5a5a' : '#ffb0a0', fr >= 0.25 ? '重擊' : null); this.shake = Math.max(this.shake, Math.round(8 + fr * 70)); if (fr >= 0.25) { this.red = 16; Sound.sfx('quake'); } if (t.hero && fr >= 0.25) Sound.sfx('heavy'); stop = fr >= 0.15 ? 7 : 3; }
    yield* this.impact(t, kind === 'dot' ? 0 : hitPower(P)); if (stop) yield* wait(stop);
    yield* this.animHP(t, to);
    if (cs && P.skill && cs.id === e.cast && kind === 'hit') { cs.hits++; cs.total += a; (cs.by || (cs.by = {}))[t.id] = (cs.by[t.id] || 0) + 1; }
    // what happened, in words (once per skill for crit / weakness)
    const sN = s ? s.n : '', notes = P.notes || [], say = [];
    if (kind === 'hit') { const k = 'c' + t.id; if (P.crit && !(cs && cs.said[k + 'c'])) { say.push(sN + '擊中要害！'); if (cs) cs.said[k + 'c'] = 1; }
      if (P.mult > 1 && !(cs && cs.said[k + 'w'])) { say.push('打中弱點！'); if (cs) cs.said[k + 'w'] = 1; } else if (P.mult < 1 && !(cs && cs.said[k + 'r'])) { say.push('被抵抗了……'); if (cs) cs.said[k + 'r'] = 1; }
      if (t.st.guard && !(cs && cs.said[k + 'g'])) { say.push(t.n + '的防禦擋下了一半的傷害！'); if (cs) cs.said[k + 'g'] = 1; }
      if (notes.includes('steam')) say.push('水碰到火焰，蒸氣爆發了！'); }
    else if (kind === 'dot') say.push(t.n + '受到了' + (P.el === 'brn' ? '灼傷' : '毒') + '的傷害！');
    else if (kind === 'recoil') say.push(t.n + '受到了反作用力的傷害！');
    else if (kind === 'thorns') say.push(sN + '的荊棘反彈了' + a + '點傷害！');
    else if (kind === 'reflect') say.push('魔法被鏡面反射了！' + t.n + '受到了' + a + '點傷害！');
    else if (kind === 'rocks') say.push(t.n + '被落石砸中了！');
    else if (kind === 'arrow') say.push('造成' + a + '點傷害！');
    else if (kind === 'ally') say.push('格倫的援護造成了' + a + '點傷害！');
    else if (kind === 'double') say.push(sN + '的連擊！追加了' + a + '點傷害！');
    else if (kind === 'pursuit') say.push('追擊！追加了' + a + '點傷害！');
    else if (kind === 'sigTwice') say.push('追加了' + a + '點傷害！');
    for (const m of say) yield* this.msg(m, { hold: 22 });
  },
  *HEAL(e, s, t, P) {
    if (!t || !(P.amount > 0)) return; const a = P.amount, C = this.center(t), kind = P.kind;
    if (kind === 'drain' && s && this.cast && this.cast.D && this.tgtV) yield* FX.drainBack.call(this, this.center(this.tgtV), C); else if (kind !== 'regen' && kind !== 'drain') { Sound.sfx('heal'); yield* FX.heal.call(this, C); }
    this.popNum(t, '+' + a, '#7aff9a', null, { small: 1 }); yield* this.animHP(t, Math.min(t.maxhp, t.hp + a));
    const txt = kind === 'drain' ? t.n + '吸取了' + a + '點HP！' : kind === 'guardHeal' ? t.n + '的守護之心回復了HP！' : kind === 'ally' ? t.n + '回復了' + a + '點HP！' : kind === 'regen' ? null : this.itemCtx ? t.n + '回復了' + a + '點HP！' : t.n + '的HP恢復了！';
    if (txt) yield* this.msg(txt, { hold: 22 }); },
  *COST_PAY() {},
  *RESOURCE_CHANGE(e, s, t, P) {
    if (P.res === 'gold') { const g = -P.change, st = Game.st; if (s) yield* MFX.steal.call(this, this.center(s), this.center(this.H), s); yield* this.msg((s ? s.n : '') + '搶走了' + g + ' G！'); if (!this.stoleTold) { this.stoleTold = 1; yield* this.msg('（打倒他就能把錢搶回來！）'); } return; }
    if (!t) return; t.res[P.res] = P.new;
    if (P.res === 'mp') { t.mp = P.new; if (P.why === 'breath') yield* this.msg(t.n + '調整呼吸，恢復了' + P.change + '點MP。', { hold: 18 }); else if (P.change > 0 && P.why !== 'basic') { this.popNum(t, '+' + P.change + 'MP', '#8ab8ff', null, { small: 1, dy: 10 }); if (this.itemCtx) yield* this.msg('MP恢復了' + P.change + '點！', { hold: 20 }); } }
    else if (P.res === 'hp') t.hp = P.new;
    else if (P.res === 'brk') { t.flash = P.change < 0 ? 12 : 0; if (P.change < 0) Sound.sfx('rock'); }
    else if (P.res === 'combo' && P.change > 0) this.popNum(t, '連段×' + P.new, '#ffd860', null, { small: 1, dy: -14 });
  },
  *RESOURCE_EMPTY() {}, *RESOURCE_FULL() {},
  *STATUS_APPLY(e, s, t, P) {
    if (!t || P.failed) return; const id = P.status, was = t.st[id], C = this.center(t); if (P.cleared) delete t.st[id]; else t.st[id] = P.stacks ?? 1;
    if (MAJOR_GOT[id]) { if (id === 'par' && typeof uiFxOk === 'function' && uiFxOk('paralyze')) this.spawn({ k: 'uifx', fx: 'paralyze', x: C.x, y: C.y, life: 30 }); yield* FX[MAJOR_FX[id]].call(this, null, C); yield* this.msg(t.n + MAJOR_GOT[id], { hold: 26 }); return; }
    if (id.startsWith('stage_')) { const k = id.slice(6), nm = STAT_NAMES[k] || k, up = P.delta > 0;
      if (P.capped) { yield* this.msg(t.n + '的' + nm + '已經無法再' + (up ? '提升' : '降低') + '了！（持續時間延長）', { hold: 22 }); return; }
      Sound.sfx(up ? 'statUp' : 'statDown'); yield* FX[up ? 'statUpFx' : 'statDownFx'].call(this, C); yield* this.msg(t.n + '的' + nm + (Math.abs(P.delta) >= 2 ? '大幅' : '') + (up ? '提升了！' : '降低了！') + (P.dur ? '（' + P.dur + '回合）' : ''), { hold: 24 }); return; }
    switch (id) {
      case 'wet': { const nx = this.core.log[this.cur]; if (!was && !(nx && nx.type === EVT.MESSAGE && nx.payload.key === 'flood_wet')) yield* this.msg(t.n + '全身濕透了！', { hold: 18 }); break; }
      case 'tangle': yield* this.msg(t.n + '被藤蔓纏住了！（怕火）', { hold: 22 }); break;
      case 'barrier': yield* FX.barrier.call(this, C); yield* this.msg(t.n + '展開了魔法護盾！', { hold: 22 }); break;
      case 'smoke': { const sk = this.cast && this.cast.D, smk = this.itemCtx || !sk || /煙|霧/.test((sk.name || '') + (sk.desc || '')); yield* this.msg(t.n + (smk ? '躲進了煙幕裡！（比較難被打中）' : '的迴避提升了！（比較難被打中）'), { hold: 22 }); break; } // v12.68: 心眼・殘影步 have no smoke
      case 'critNext': yield* this.msg(t.n + '集中精神！下一擊必定會心！', { hold: 20 }); break;
      case 'frozen': Sound.sfx('charge'); yield* this.msg(t.n + '的時間被凍結了！', { hold: 22 }); break;
      case 'mirror': Sound.sfx('charge'); t.tint = { c: '#c8f4ff', a: 0.6 }; yield* wait(14); t.tint = null; yield* this.msg(t.n + '的表面變得像鏡子一樣！'); if (!this.mirrorTold) { this.mirrorTold = 1; yield* this.msg('（這段時間魔法攻擊會被反射回來！用物理攻擊或防禦吧。）'); } break;
    } },
  *STATUS_FAIL(e, s, t, P) { if (!t || P.secondary || P.why === 'zero') return; const nm = (DEF.statuses[P.status] && DEF.statuses[P.status].metadata.n) || '';
    yield* this.msg(P.why === 'already' ? t.n + '已經' + nm + '了！' : '但是對' + t.n + '沒有效果……', { hold: 22 }); },
  *STATUS_STACK(e, s, t, P) { if (!t) return; t.st[P.status] = P.new; if (P.status === 'shards' && P.new < P.old) { const C = this.center(t); Sound.sfx('rock'); this.sparks(C.x, C.y, 10, ['#c8f4ff', '#80c0ff'], 2.5); yield* this.msg(P.new ? '擊碎了水晶碎片！（剩下' + P.new + '塊）' : '水晶碎片全部被擊碎了！', { hold: 24 }); } },
  *STATUS_REMOVE(e, s, t, P) { yield* this.handlers.statusGone.call(this, e, s, t, P, false); },
  *STATUS_EXPIRE(e, s, t, P) { yield* this.handlers.statusGone.call(this, e, s, t, P, true); },
  *statusGone(e, s, t, P, expire) {
    if (!t) return; const id = P.status, nm = (DEF.statuses[id] && DEF.statuses[id].metadata.n) || ''; delete t.st[id];
    if (MAJOR_GOT[id]) { if (P.why === 'wake') yield* this.msg(t.n + '醒過來了！', { hold: 22 }); else if (P.why !== 'steam') yield* this.msg(t.n + '的' + nm + '治好了！', { hold: 22 }); return; }
    if (id.startsWith('stage_')) { if (expire) yield* this.msg(t.n + '的' + (STAT_NAMES[id.slice(6)] || '') + '恢復原狀了。', { hold: 18 }); return; }
    if (id === 'barrier' && expire) yield* this.msg(t.n + '的魔法護盾消失了。', { hold: 20 });
    else if (id === 'broken' && expire) yield* this.msg(t.n + '重新站穩了！', { hold: 20 });
    else if (id === 'charging' && (P.why === 'break' || P.why === 'timeStop')) yield* this.msg('蓄力被打斷了！', { hold: 20 });
  },
  *DEFEND(e, s) { if (!s) return; yield* this.msg(s.n + '擺出了防禦的架勢！', { hold: 20 }); yield* FX.guard.call(this, this.center(s)); },
  *ITEM_USE(e, s, t, P) { const it = ITEMS[P.item]; if (!it || !s) return;
    if (it.use === 'home') { yield* this.msg(s.n + '舉起了' + it.n + '！'); Sound.sfx('charge'); s.tint = { c: '#ffffff', a: 0.8 }; yield* wait(16); s.tint = null; return; }
    if (it.use === 'escape') { yield* this.msg(s.n + '丟出了' + it.n + '！'); yield* FX.smoke.call(this); return; }
    yield* this.msg(s.n + '使用了' + it.n + '！', { hold: 16 }); },
  *ESCAPE(e, s, t, P) {
    if (P.who === 'foe') { if (!s) return; Sound.sfx('run'); yield* tween(16, k => { s.alpha = 1 - k; s.plateA = 1 - k; }); s.gone = true; yield* this.msg(s.n + '逃走了！'); return; }
    if (P.ok) { Sound.sfx('run'); if (P.item && ITEMS[P.item] && ITEMS[P.item].use === 'home') { yield* this.msg('羽毛化成光芒，包住了' + (s ? s.n : '') + '……'); Game.homeWarp = 1; } else yield* this.msg(P.item ? '趁著煙霧順利逃走了！' : '順利逃走了！'); return; }
    const boss = this.foes().find(v => v.boss); yield* this.msg(P.boss ? (P.item && boss ? '但是' + boss.n + '擋住了出口，逃不掉！' : '不能從這場戰鬥中逃走！') : '沒能逃走！'); },
  *DOWN(e, s, t) {
    if (!t) return;
    if (t.hero) { Sound.stop(); Sound.sfx('faint'); yield* tween(24, k => t.sink = k * 70); yield* tween(10, k => this.boxH = lerp(HBAR_Y, BH + 4, k)); return; }
    this.dropAnn(); Sound.cry(Object.keys(SPECIES).indexOf(t.sp) + 1, 0.6, 1.2); yield* wait(14);
    if (t.boss) { Sound.sfx('quake'); this.shake = 50; for (let i = 0; i < 30; i++) { if (i % 3 === 0) this.sparks(t.x + rnd(-26, 26), t.foot - 34 + rnd(-26, 26), 3, ['#8a8272', '#a09884', '#ff8040'], 2.5, 26, 0.15); yield; } }
    Sound.sfx(t.boss ? 'bossDown' : 'foeDown'); t.A.state = 'faint'; yield* tween(t.boss ? 40 : 22, k => { t.sink = k * t.bbh; t.alpha = 1 - k * 0.3; });
    yield* tween(8, k => { t.alpha = 0.7 * (1 - k); t.plateA = 1 - k; }); t.alpha = 0; t.gone = true;
    yield* this.msg((t.boss || t.minion ? '' : t.elite ? '菁英魔物' : '') + t.n + '倒下了！', { hold: 30 });
    if (this.focus === t) this.focus = this.foes()[0] || t; },
  *REVIVE(e, s, t) { if (!t) return; t.gone = false; t.alpha = 1; t.sink = 0; t.plateA = 1; t.A.state = 'idle'; t.hp = this.core.byId[t.id].res.hp; yield* this.msg(t.n + '重新站了起來！'); },
  *EXTRA_ACTION(e, s) { if (s) yield* this.msg(s.n + '的狂怒！再次行動！', { hold: 22 }); },
  *REACTION(e, s, t, P) { if (!s) return; this.pendingReact = true; yield* this.msg(P.why === 'shadow' ? '殘影！' + s.n + '閃過攻擊並反擊！' : s.n + '趁勢反擊！', { hold: 22 }); },
  *EFFECT_TRIGGER(e, s, t, P) { if (P.msg) yield* this.msg(P.msg, { hold: 22 }); },
  *MESSAGE(e, s, t, P) { const f = P.key && BV_TEXT[P.key], txt = f ? f(s ? s.n : '', t ? t.n : (s ? s.n : ''), P) : P.text; if (!txt) return;
    if (P.key === 'special') { this.pendingSpecial = true; Sound.sfx('charge'); yield* this.announce(txt); yield* wait(6); return; }
    if (P.key === 'raged' && s) { s.tint = { c: '#ff3020', a: 0.5 }; yield* wait(12); s.tint = null; }
    yield* this.msg(txt, { hold: P.hold || 24 }); },
  *PHASE(e, s, t, P) { if (!s) return; this.focus = s; const red = P.phase >= 2 || P.key === 'golem_core'; Sound.sfx(red ? 'quake' : 'charge'); if (red) this.shake = 30;
    s.tint = { c: red ? '#ff1020' : '#ff6020', a: 0 }; yield* tween(16, q => s.tint.a = q * 0.6); yield* tween(16, q => s.tint.a = 0.6 * (1 - q)); s.tint = null;
    for (const m of (PHASE_TXT[P.key] || (() => []))(s.n)) yield* this.msg(m, { hold: 30 }); },
  *SUMMON(e, s, t) {
    const u = this.core.byId[e.tgts[0]]; if (!u) return; const v = this.views[u.id] || this.mkView(u); v.hp = v.maxhp = u.max.hp; v.st = {}; v.alpha = 0; v.plateA = 0; v.gone = false;
    this.multi = true; this.layout(false); const L = this.foes(); for (const q of L) if (q !== v) q.x = q.x; v.x = v.tx;
    Sound.sfx('exclaim'); yield* tween(14, k => { v.alpha = k; v.plateA = k; }); v.alpha = 1; v.plateA = 1; yield* this.msg(v.n + '出現了！', { hold: 20 }); },
  *BREAK(e, s, t) {
    if (!t) return; const C = this.center(t); t.flash = 30; Sound.sfx('crit'); Sound.sfx('rock'); this.shake = 26; this.spawn({ k: 'flash', c: '#ffffff', a: 0.55, life: 8 });
    this.sparks(C.x, C.y, 26, ['#ffe070', '#ffffff', '#80c8ff'], 3.4, 26, 0.12); this.pops.push({ x: C.x, y: C.y - 44, s: 'BREAK!', c: '#ffd040', t: 0, big: 1 }); this.anim(t, 'hurt', 30, true);
    yield* wait(16); t.A.hold = false; yield* this.msg(t.n + '破防了！');
    if (!Game.st.flags.tutBreak) { Game.st.flags.tutBreak = 1; yield* this.msg('（破防中的魔物無法行動，受到的傷害也會提高。持續到下一回合結束。）'); } },
  *SKILL_SUCCESS(e, s, t, P) { const cs = this.cast, by = cs && cs.by ? Object.keys(cs.by) : []; if (cs && cs.id === P.cast && by.length === 1 && cs.hits > 1) yield* this.msg(cs.hits + '連擊！' + (cs.total > 0 ? '合計' + cs.total + '點傷害！' : '全部打在護盾上！'), { hold: 22 }); },
  *SKILL_SELECT() {}, *BATTLE_START() {}, *BATTLE_END() {}, *EFFECT_DONE() {},
};

/* ---------- the end of the battle: write back, rewards, level ups, learned skills ---------- */
Battle.prototype.finish = function* () {
  const res = this.core.result, out = res.outcome, notes = BB.apply(this.core, Game.st); this.idle = false; this.dropAnn(); this.pickV = null;
  if (out === 'win') { yield* this.victory(); yield* this.skillNotes(notes); return yield* this.end('win'); }
  if (out === 'lose') { yield* this.heroFaint(); return yield* this.end('lose'); }
  yield* this.skillNotes(notes); return yield* this.end('run');
};
Battle.prototype.skillNotes = function* (notes) {
  for (const n of notes) { const nm = BB.nameOf(Game.st, n.id);
    if (n.k === 'learned') { Sound.jingle('item'); yield* this.msg('「' + nm + '」用熟了，永久學會了！（換了武器也能使用，選單→技能編排）', { wait: true }); }
    else if (n.k === 'evolve') { Sound.sfx('charge'); yield* this.msg('「' + nm + '」可以進化了！（選單→技能）', { wait: true }); } }
};
Battle.prototype.heroFaint = function* () { yield* this.msg(Game.st.name + '倒下了……', { wait: true }); };
// what the defeated monsters give: experience and gold add up, materials and gear are rolled for each one
Battle.prototype.defeated = function () { return this.foes(true).filter(v => this.core.byId[v.id].down); };
Battle.prototype.victory = function* () {
  const st = Game.st, L = this.defeated(), fx = (this.hs && this.hs.fx) || {}, n = L.length; st.wins = (st.wins || 0) + 1;
  for (const v of L) { const de = (st.dex || (st.dex = {}))[v.sp] || (st.dex[v.sp] = { seen: 1, won: 0 }); de.won++; }
  Sound.play('victory');
  const stolen = this.core.data.stolen || 0; if (stolen) { st.money += stolen; yield* this.msg('奪回了被搶走的' + stolen + ' G！'); }
  let exp = 0, gold = 0; for (const v of L) { const sp = SPECIES[v.sp] || {};
    exp += Math.max(1, Math.floor((sp.exp || 10) * v.lv / 5 * (v.elite || v.boss ? 1.5 : 1) * (v.minion ? 0.5 : 1) * (fx.wisdom ? 1.5 : 1) * (1 + (talentSum('expUp', st) || 0) / 100) * (this.cfg.pack ? 1.25 : 1) * expScale(st.lv, v.lv)));
    gold += Math.floor((v.boss ? 1000 : (sp.gold || 0) * v.lv * (!v.boss && typeof V81_GOLD === 'function' ? V81_GOLD(v.lv) : 1)) * (fx.fortune ? 1.5 : 1) * (v.minion ? 0.5 : 1)); }
  yield* this.gainExp(Math.max(1, exp));
  if (gold) { st.money += gold; yield* this.msg(st.name + '得到了' + gold + ' G！'); }
  for (const v of L) { const sp = SPECIES[v.sp] || {}; if (sp.mat && ITEMS[sp.mat] && !v.elite && !v.boss && chance(0.6)) { st.bag[sp.mat] = (st.bag[sp.mat] || 0) + 1; yield* this.msg('得到了素材「' + ITEMS[sp.mat].n + '」！', { hold: 30 }); } }
  const pool = Game.ow && Game.ow.map && Game.ow.map.d.gearPool;
  for (const v of L) { this.focus = v;
    if (v.rare && pool) { const k = typeof pickDrop12 === 'function' ? pickDrop12(pool, v.sp) : pick(pool); if (k) { const g = makeGear(k, 3); yield* this.lootShow(g, v.n + '掉落了裝備！'); } }
    const main = v === L[0] && v.id === this.mainId(); for (const g of lootDrops({ F: v, cfg: main ? this.cfg : { kind: 'wild' }, H: this.H })) yield* this.lootShow(g, v.n + '掉落了裝備！'); }
  const wild = L.filter(v => !v.elite && !v.boss && !v.minion && (typeof pickDrop12 !== 'function' || pool && pickDrop12(pool, v.sp))); if (pool && wild.length && chance((fx.fortune ? 0.16 : 0.08) * (1 + 0.25 * (wild.length - 1)) * (typeof dropMul13 === 'function' ? dropMul13() : 1))) { const v = pick(wild); this.focus = v; const g = makeGear(typeof pickDrop12 === 'function' ? pickDrop12(pool, v.sp) : pick(pool), rollQuality()); yield* this.lootShow(g, v.n + '掉落了裝備！'); }
  this.focus = this.mainView();
};
Battle.prototype.mainId = function () { const u = this.core.units.find(q => q.side === 'B'); return u ? u.id : null; };
Battle.prototype.mainView = function () { return this.views[this.mainId()] || this.F; };
Battle.prototype.gainExp = function* (amount) {
  const st = Game.st; yield* this.msg(st.name + '獲得了' + amount + '點經驗值！', { hold: 20 });
  let remaining = amount; Sound.expStart();
  while (remaining > 0 && st.lv < 50) {
    const lo = expForLevel(st.lv), hi = expForLevel(st.lv + 1), step = Math.min(remaining, hi - st.exp), from = st.exp, to = st.exp + step, fr = clamp(Math.ceil(step / (hi - lo) * 50), 6, 50);
    for (let i = 1; i <= fr; i++) { this.disp.exp = lerp(from, to, i / fr); Sound.expStep((this.disp.exp - lo) / (hi - lo)); yield; }
    st.exp = to; this.disp.exp = to; remaining -= step;
    if (st.exp >= hi) { Sound.expStop(); yield* this.levelUp(); Sound.expStart(); }
  }
  Sound.expStop(); yield* wait(10);
};
// level up: fanfare + LEVEL UP!, the stat window, MP refill, talent / attribute point notes
Battle.prototype.levelUp = function* () {
  const st = Game.st, before = heroStats(), bA = heroAttr(), atB = typeof attrAvail === 'function' ? attrAvail(st) : 0; Sound.sfx('levelUp');
  const C = this.center(this.H); this.pops.push({ x: C.x, y: C.y - 12, s: 'LEVEL UP!', c: '#ffe070', t: 0, big: 1 });
  st.lv++; const after = heroStats(), aA = heroAttr(); st.hp = Math.min(after.hp, st.hp + (after.hp - before.hp)); this.hs = after; this.H.maxhp = after.hp; this.H.hp = st.hp; this.H.lv = st.lv;
  Sound.jingle('levelup'); this.H.tint = { c: '#ffffff', a: 0 };
  const tb = new TextBox(st.name + '升到了Lv.' + st.lv + '！', { style: 'battle' }); UI.push(tb);
  for (let i = 0; i < 24; i++) { this.H.tint.a = Math.sin(i / 24 * Math.PI) * 0.8; tb.update(); yield; } this.H.tint = null;
  while (!tb.done) { tb.update(); yield; }
  let showTotal = false; const rowsL = st.attr ? [['HP', before.hp, after.hp], ['MP', before.mp, after.mp], ['物攻', before.atk, after.atk], ['物防', before.def, after.def], ['魔攻', before.spa, after.spa], ['魔防', before.spd, after.spd], ['速度', before.spe, after.spe]] : [['HP', before.hp, after.hp]].concat(ATTRS.map(k => [ATTR_NAMES[k], bA[k], aA[k]]));
  const win = { draw: x => { drawWin(x, 80, 34, 90, 122, 'menu'); rowsL.forEach(([n, b, a], i) => { const Y = 38 + i * 16; Font.draw(x, n, 90, Y, UIC.muted, UIC.textSh); const d = a - b; Font.drawR(x, showTotal ? String(a) : d > 0 ? '+' + d : '—', 162, Y, showTotal ? UIC.text : d > 0 ? UIC.accent : UIC.dis, UIC.textSh); if (showTotal && d > 0) Font.drawR(x, '+' + d, 136, Y + 2, UIC.accent, UIC.textSh, 8); }); } }; // v12.68: the gain stays next to the total
  UI.push(win); yield* waitA(); showTotal = true; Sound.sfx('cursor'); yield* waitA(); UI.remove(win); UI.remove(tb);
  st.mp = after.mp; this.H.maxmp = after.mp; this.H.mp = st.mp; st.skp = 0; st.tp = 0;
  const cap = typeof TP_CAP !== 'undefined' ? TP_CAP : 99, raw = typeof tpRaw === 'function' ? tpRaw(st) : 0;
  yield* this.msg(raw > cap ? 'MP全部恢復了。（天賦點已達上限' + cap + '點）' : st.lv % 2 === 0 ? '獲得了1點天賦點！MP也全部恢復了。（選單→天賦）' : 'MP全部恢復了。（下一級會得到天賦點）', { hold: 40 });
  const gain = (typeof attrAvail === 'function' ? attrAvail(st) : 0) - atB; if (st.attr && gain > 0) { Sound.sfx('item'); yield* this.msg('獲得了' + gain + '點屬性點！（目前' + attrAvail(st) + '點，選單→屬性分配）', { hold: 40 }); }
  if (st.lv === 14 && !(st.flags && st.flags.deep)) yield* this.msg('到達Lv14了！去找萌芽鎮的村長，進行「天賦覺醒」吧。', { hold: 40 });
  if (Sound.current !== 'victory' && this.core.result && this.core.result.outcome === 'win') Sound.play('victory');
};
Battle.prototype.end = function* (res) {
  this.result = res; Sound.expStop(); yield* fadeOut(16); UI.clear();
  Game.setScene(Game.ow);
};
