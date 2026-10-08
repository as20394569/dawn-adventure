/* ===================== v14.8 魔物的一回合更有份量 =====================
   玩家：「改成卡牌後，怪物一回合只動一次是否合理？可以參考市面上的卡牌對戰遊戲」
   → 照殺戮尖塔那類遊戲：每隻魔物一回合還是一個動作，但動作本身要有份量（方案 A）。
   · 多段攻擊：頭上寫「每段×段數」（6×3），段數固定（原本 2〜5 段這種取平均）
   · 不攻擊的回合（強化・削弱・異常・架盾・防禦・補血・召喚）同時獲得格擋＝地區一下的傷害（菁英・頭目照自己的劇本，不加）；頭上寫「+盾」，有格擋時腳下顯示盾和數字
   · 越戰越勇：菁英・頭目每 3 回合結束時力量 +1；力量＝每段傷害 +1（頭目 +2 試算時第五幕的時計巨像會輸，改成 +1）
   · 攻擊附帶削弱：頭上多寫「+削弱」 */

/* ---------- 多段攻擊：段數固定 ---------- */
KD.hitsN = D => (D && D.hits ? Math.max(1, Math.round((D.hits[0] + D.hits[1]) / 2)) : 1);
for (const id in DEF.skills) { const D = DEF.skills[id]; if (!D || !D.hits || D.hits[1] <= D.hits[0] || D.hitsOf || /^k14_/.test(id)) continue; const a = D.hits[0], b = D.hits[1];
  D.hitsOf = (core, u) => (KD.on(core) && u && !u.hero ? Math.round((a + b) / 2) : core.rng.int(a, b)); }

/* ---------- 不攻擊的回合：同時獲得格擋 ---------- */
KD.FOE_BLK_SKIP = /^(k14_|f14_fly|f14_dive|f14_steal|m_mimic14)/;
KD.foeBlk = (core, u, cmd) => { if (!KD.on(core) || !u || u.hero || !cmd) return 0;
  if (cmd.type !== 'defend') { if (cmd.type !== 'skill') return 0; const D = DEF.skills[cmd.skill]; if (!D || D.power || KD.FOE_BLK_SKIP.test(cmd.skill)) return 0; }
  if (u.boss || u.elite || (u.data && u.data.elite)) return 0; // elites and bosses play their own scripts (shields, phases): they get 越戰越勇 instead
  return Math.max(1, Math.round(KD.tab(KD.DMG_TGT, u.lv || 1))); };
{ const _ea = BattleCore.prototype.endAction; BattleCore.prototype.endAction = function (cmd, executed) {
    try { if (executed && cmd && !cmd.reaction && KD.on(this)) { const u = this.byId[cmd.actor]; if (u && !u.hero && this.isUp(u) && !this.ended()) { const n = KD.foeBlk(this, u, cmd); if (n) KD.block(this, u, n); } } } catch (e) { /* never break the turn over a bonus */ }
    return _ea.call(this, cmd, executed); }; }

/* ---------- 越戰越勇：菁英・頭目每 3 回合力量增加 ---------- */
KD.RAGE_EVERY = 3;
KD.rageN = u => (u.boss || u.elite || (u.data && u.data.elite) ? 1 : 0);
{ const _re = BattleCore.prototype.roundEnd; BattleCore.prototype.roundEnd = function () {
    if (KD.on(this) && this.round > 0 && this.round % KD.RAGE_EVERY === 0 && !this.ended()) for (const u of this.alive('B')) { const n = KD.rageN(u); if (!n || u.minion) continue;
      KD.add(this, u, u, 'str15', n); this.emit(EVT.MESSAGE, { src: u, tgts: [u], payload: { key: null, text: '（' + u.name + '越戰越勇！力量 +' + n + '）' } }); }
    return _re.call(this); }; }
// 力量 on a monster: each blow +1 per stack (after the area / boss conversion, so it is exactly what the status says)
{ const _d = BR.damage; BR.damage = function (core, src, tgt, skill, o = {}) { const r = _d.call(this, core, src, tgt, skill, o);
    if (!KD.on(core) || !r || !tgt || !tgt.hero || !src || src.hero || !(r.amount > 0)) return r; const s = stkK(src, 'str15'); if (!s) return r;
    return { ...r, amount: r.amount + Math.round(s * (stkK(src, 'weak15') ? 0.75 : 1) * (stkK(tgt, 'vuln15') ? 1.5 : 1)) }; }; }

/* ---------- 頭上的字：6×3、+削弱、+盾N ---------- */
{ const _io = intentOf14; intentOf14 = function (core, u, cmd) { const I = _io(core, u, cmd); if (!I || !KD.on(core) || !cmd || !u) return I;
    const D = cmd.type === 'skill' ? DEF.skills[cmd.skill] : null;
    if (D && D.power && (I.k === 'atk' || I.k === 'heavy') && /^\d+/.test(I.t || '')) { const h = KD.hitsN(D), n = parseInt(I.t, 10), rest = I.t.replace(/^\d+/, '');
      let t = h > 1 ? Math.round(n / h) + '×' + h : String(n); t += rest;
      if (!rest && (D.effects || []).concat(D.after || []).map(e => (typeof e === 'string' ? DEF.effects[e] : e) || {}).some(e => e.type === 'stage' && e.target !== 'self' && e.stats && Object.values(e.stats).some(v => v < 0))) t += '+削弱';
      return { ...I, t }; }
    // the block arrives after your turn (it guards the monster through your next one, shown under it then): here just「+盾」, so three labels still fit
    if (I.k !== 'hide' && I.k !== 'guard' && KD.foeBlk(core, u, cmd)) return { ...I, t: (I.t ? I.t + '+' : '') + '盾' };
    return I; }; }
// a monster's block: a shield and the number under its feet
{ const _db = Battle.prototype.drawBoxF; Battle.prototype.drawBoxF = function (x) { _db.call(this, x); if (!this.k14 || this.boxF < -20 || KD.stRow16) return; /* v14.15: drawn with the statuses (14q) */
    for (const v of this.foes()) { const b = v.st && v.st.blk15; if (!b || v.alpha < 0.5) continue; const s = String(b), tw = Math.ceil(Font.width(s, 8)), w = 13 + 2 + tw + 3, X = Math.round(clamp(v.x + v.off.x - w / 2, 2, W - w - 2)), Y = Math.round(v.foot + 2);
      x.fillStyle = 'rgba(10,20,48,0.82)'; x.fillRect(X, Y, w, 13); x.fillStyle = '#7ab8ff'; x.fillRect(X, Y + 12, w, 1); x.imageSmoothingEnabled = false; x.drawImage(KD.ICON.shield, X + 1, Y); Font.draw(x, s, X + 15, Y + 0.5, '#bfe0ff', '#000', 8); } }; }

/* ---------- 戰鬥說明 ---------- */
if (typeof BATTLE_HELP !== 'undefined') BATTLE_HELP.push(['魔物', ['頭上的圖示是牠這回合要做的事：數字是預估傷害（6×3＝每段 6、打 3 段），「+盾」是同時獲得格擋（數字顯示在牠腳下）。', '菁英和頭目越戰越勇：每 3 回合力量 +1。']]);
