/* ===================== v10 階段二：難度・存檔・精英與頭目 =====================
   Plan items 13 / 14:
   - Only one difficulty: 異界 (monster HP +40%, attack +30%, smartest AI, extra shield). The picker at a new game is gone.
   - v10 starts a new save (key dawnlight_save_v10); the title says so when only an old save exists.
   - 威壓 no longer wipes every buff; it now lowers 物攻 and 魔攻 by one stage, and the AI no longer forces it.
     To make up for it elites and bosses fight with more moves: up to 6 of their own, plus a family technique
     (elites 1, bosses 2) from the new moves below.
   - 村長 hands over the first orb (裂風斬) with the license, so the early game isn't only normal attacks. */
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.diff = 2; st.v10 = 1; st.orbs = st.orbs || []; } return st; }; }
{ const _d = TitleScene.prototype.draw; TitleScene.prototype.draw = function (x) {
    _d.call(this, x); if (this._old === undefined) { try { this._old = !this.hasSave && !!localStorage.getItem('dawnlight_save_v2'); } catch (e) { this._old = false; } }
    if (this._old && this.stage !== 'press') { x.fillStyle = 'rgba(8,10,20,0.75)'; x.fillRect(6, 138, W - 12, 26); Font.drawC(x, 'v10 大改版：技能與天賦全部重做', W / 2, 137, UIC.warm, UIC.textSh, 9); Font.drawC(x, '舊存檔無法繼續，請開始新的冒險', W / 2, 149, '#c9cfe4', UIC.textSh, 9); }
  }; }

/* ---------- 威壓: intimidation instead of a full dispel ---------- */
Object.assign(MOVES.m_dominate, { dispel: 0, d: '散發壓倒性的氣勢，讓對手的物攻和魔攻各降一級。' });

/* ---------- new techniques for elites & bosses (animations borrowed from existing monster moves) ---------- */
const FOE_NEW = {
  m_warRoar: { n: '戰嚎', t: '一般', cat: '變', pp: 10, stat: { who: 'self', atk: 1, spe: 1 }, cls: 'buff', fx: 'm_howl', d: '震天的戰嚎，提升物攻和速度。' },
  m_rampage: { n: '暴衝', t: '一般', cat: '物', pow: 90, acc: 90, pp: 10, eff: { flinch: 1, p: 20 }, cls: 'strike', fx: 'm_hornCharge', d: '不顧一切地撞過來。' },
  m_vineLash: { n: '荊鞭', t: '草', cat: '物', pow: 72, acc: 95, pp: 10, eff: { stat: { def: -1 }, p: 35 }, cls: 'strike', fx: 'm_rootCrush', d: '長滿尖刺的藤鞭。有時會降低物防。' },
  m_sporeBurst: { n: '孢子爆散', t: '毒', cat: '特', pow: 55, acc: 95, pp: 10, eff: { st: 'psn', p: 40 }, cls: 'powder', fx: 'm_poisonSpore', d: '炸開一大團毒孢子。' },
  m_sunder: { n: '碎甲重擊', t: '一般', cat: '物', pow: 70, acc: 95, pp: 10, eff: { stat: { def: -1 }, p: 60 }, cls: 'strike', fx: 'm_hornCharge', d: '瞄準鎧甲縫隙的重擊。常常降低物防。' },
  m_overheat: { n: '過熱衝擊', t: '火', cat: '特', pow: 95, acc: 100, pp: 5, charge: 1, chargeMsg: '身體開始發紅發燙！', warn: '（下一擊非常危險……選擇「防禦」！）', cls: 'charge', fx: 'm_golemFist', d: '蓄熱後的爆炸衝擊。' },
  m_feint: { n: '虛招', t: '一般', cat: '物', pow: 55, acc: 100, pp: 15, prio: 1, eff: { stat: { spe: -1 }, p: 50 }, cls: 'slash', fx: 'm_darkSlash', d: '先制的假動作。有時會降低速度。' },
  m_curseGrip: { n: '詛咒之握', t: '一般', cat: '特', pow: 60, acc: 100, pp: 10, drain: 0.5, cls: 'drain', fx: 'm_soulSip', d: '冰冷的手抓住靈魂，吸取生命。' },
  m_soulRend: { n: '裂魂斬', t: '一般', cat: '物', pow: 105, acc: 100, pp: 5, charge: 1, chargeMsg: '周圍的空氣變得冰冷……', warn: '（下一擊會撕裂靈魂……防禦！）', cls: 'charge', fx: 'm_darkSlash', d: '蓄力後撕裂靈魂的一斬。' },
  m_tidalCrush: { n: '怒潮壓', t: '水', cat: '物', pow: 85, acc: 95, pp: 10, eff: { flinch: 1, p: 20 }, cls: 'strike', fx: 'm_tailSlam', d: '挾著浪濤壓下來。' },
  m_whirlpool: { n: '漩渦', t: '水', cat: '特', pow: 62, acc: 95, pp: 10, eff: { stat: { spe: -1 }, p: 50 }, cls: 'area', fx: 'm_tailSlam', d: '把對手捲進漩渦。有時會降低速度。' },
  m_hex: { n: '咒縛', t: '一般', cat: '變', acc: 80, pp: 10, st: 'par', cls: 'debuff', fx: 'm_soulSip', d: '用咒語綁住對手的身體，讓牠麻痺。' },
  m_frostNova: { n: '冰霜新星', t: '水', cat: '特', pow: 82, acc: 95, pp: 10, eff: { stat: { spe: -1 }, p: 40 }, cls: 'area', fx: 'm_frostFang', d: '四散的寒氣。有時會凍得動作變慢。' },
  m_dragonRoar: { n: '龍威', t: '一般', cat: '變', acc: 100, pp: 10, stat: { who: 'foe', atk: -1, spa: -1 }, cls: 'debuff', fx: 'm_rumble', d: '龍的咆哮讓人喪失鬥志。' },
  m_scorch: { n: '灼熱吐息', t: '火', cat: '特', pow: 82, acc: 95, pp: 10, eff: { st: 'brn', p: 30 }, cls: 'proj', fx: 'm_flare', d: '噴出灼熱的火焰。有時會灼傷。' },
  m_swarm: { n: '蟲群', t: '一般', cat: '物', pow: 22, acc: 95, pp: 10, hits: [2, 5], cls: 'bite', fx: 'm_bite', d: '成群的小蟲一起咬過來。' },
  m_diveBomb: { n: '俯衝轟擊', t: '飛', cat: '物', pow: 98, acc: 100, pp: 5, charge: 1, chargeMsg: '飛上了高空！', warn: '（牠要俯衝下來了……防禦！）', cls: 'charge', fx: 'm_rend', d: '從高空俯衝撞擊。' },
  m_acidSpit: { n: '酸液', t: '毒', cat: '特', pow: 55, acc: 95, pp: 10, eff: { stat: { def: -1 }, p: 40 }, cls: 'proj', fx: 'm_engulf', d: '會腐蝕鎧甲的酸液。有時會降低物防。' },
};
for (const k in FOE_NEW) { MOVES[k] = { ...FOE_NEW[k], foe: 1 }; const C = MON_CLASS[FOE_NEW[k].cls]; if (C && !C.includes(k)) C.push(k); if (!MFX[k] && MFX[FOE_NEW[k].fx]) MFX[k] = MFX[FOE_NEW[k].fx]; }
const FAM_TECH = { beast: ['m_warRoar', 'm_rampage'], plant: ['m_vineLash', 'm_sporeBurst'], construct: ['m_sunder', 'm_overheat'], human: ['m_feint', 'm_sunder'], undead: ['m_curseGrip', 'm_soulRend'],
  aquatic: ['m_tidalCrush', 'm_whirlpool'], spirit: ['m_hex', 'm_frostNova'], dragon: ['m_dragonRoar', 'm_scorch'], insect: ['m_swarm', 'm_sporeBurst'], bird: ['m_feint', 'm_diveBomb'], ooze: ['m_acidSpit', 'm_curseGrip'] };
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind) {
    const f = _mf(sp, lv, kind); if (kind !== 'elite' && kind !== 'boss') return f; const d = SPECIES[sp]; if (!d) return f;
    const known = [...new Set(d.learn.filter(([l]) => l <= lv).map(([, m]) => m))].filter(id => id !== 'm_dominate' || kind === 'boss');
    const ids = known.slice(-6); for (const m of f.moves) if (!ids.includes(m.id) && ids.length < 6) ids.push(m.id);
    const T = FAM_TECH[d.fam] || []; for (const t of T.slice(0, kind === 'boss' ? 2 : 1)) if (!ids.includes(t)) ids.push(t);
    f.moves = ids.filter(id => MOVES[id]).map(id => ({ id })); return f;
  }; }

/* ---------- 異界 is the base difficulty: it eases in over the first levels (full strength from Lv20) ---------- */
{ const _mf = makeFoe; makeFoe = function (sp, lv, kind) {
    const f = _mf(sp, lv, kind), D = diffOf(); if (D.hp === 1 && D.pow === 1) return f; const k = clamp((lv - 4) / 16, 0, 1), s = f.stats;
    const rh = (1 + (D.hp - 1) * k) / D.hp, rp = (1 + (D.pow - 1) * k) / D.pow;
    if (rh !== 1) { s.hp = Math.max(1, Math.round(s.hp * rh)); f.hp = f.maxhp = s.hp; } if (rp !== 1) for (const q of ['atk', 'spa']) s[q] = Math.max(1, Math.round(s[q] * rp));
    return f;
  }; }

/* ---------- the first orb, with the adventurer's license ---------- */
{ const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) {
    const st = this.st; if (st && st.v10 && st.flags.license && !st.flags.orbStart && !this.script && !UI.stack.length && !Game.trans) { st.flags.orbStart = 1;
      this.run((function* () { yield* say('村長：「對了，這個給你。」'); yield* orbGet(starterOrb(), ''); yield* sayAll(['村長：「這是「技能寶珠」。鐵匠會幫你把它鑲進武器，戰鬥中就能使出裡面封著的招式。」', '村長：「強大的魔物身上也會帶著寶珠。打倒牠們，你就會越來越強。」']); })()); return; }
    return _u.apply(this, a); }; }
