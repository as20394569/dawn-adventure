/* ===================== v12.0.9x 超級重製第二階段（二）：武器技能樹、特技、武器種特性、雙持（雙刀・雙劍・雙盾） =====================
   · 9 棵武器樹（各 8 招主動、3 個被動、3 個特技）＋3 棵雙持樹（各 6 招主動、2 個被動、2 個特技），招式全部新設計。
   · 技能點：等級＋主線頭目第一次打倒各 1 點；每招 1〜5 級（傷害招每級威力 +10%；輔助招每級 MP −10%，5 級冷卻 −1）。
   · 只能用身上武器那棵樹（雙持時再加雙持樹）；技能槽裡別棵樹的招變灰。職業技能・招牌技・天賦照舊；舊的武器專屬技能退場（每招退 1 點）。
   · 特技：每棵樹學會後選一個裝，普通攻擊累積層數自動發動，威力跟著武器階級。
   · 雙持：一開始就能用（玩家 2026-10-04：原本 Lv15 鐵匠教，改成一開始就能學）；副手欄裝同種的第二把短刀／劍，或主手、副手都拿盾。 */

/* ---------- custom statuses, conditions, formulas ---------- */
BV_TAGS.add('tree11'); BV_TAGS.add('dual11');
Object.assign(COND, {
  tgtDefDown11: (c, v) => !!c.tgt && ((c.core.statusOf(c.tgt, 'stage_def') || {}).stacks || 0) < 0 === !!v,
  tgtDebuffed11: (c, v) => !!c.tgt && (!!c.core.majorOf(c.tgt) || c.tgt.statuses.some(s => DEF.statuses[s.id] && DEF.statuses[s.id].group === 'stage' && s.stacks < 0) || c.tgt.statuses.some(s => s.id === 'crack11')) === !!v,
});
const stackOf11 = (core, u, id) => ((u && core.statusOf(u, id)) || {}).stacks || 0;
Object.assign(BR.FORMULA, {
  finale11: c => Math.min(250, 5 * (c.spent || 0)),
  forbid11: c => 1 + 0.15 * ((c.tgt && c.tgt.statuses.filter(s => DEF.statuses[s.id] && DEF.statuses[s.id].group === 'stage' && s.stacks < 0).length) || 0),
  ram11: c => 1 + 0.25 * stackOf11(c.core, c.src, 'bulk11'),
  phantom11: c => 1 + 0.1 * stackOf11(c.core, c.src, 'phantom11'),
  off11: c => 40 * ((c.src && c.src.data && c.src.data.offMul11) || 0.6),
  shield11: c => { const u = c.src; return u && u.data && u.data.shield11 ? Math.max(0.5, (u.stats.def * u.data.shield11) / Math.max(1, u.stats.atk)) : 1; },
});
const ST11 = (id, n, o) => defPut('statuses', id, { tags: o.tags || ['buff'], duration: o.dur || 'owner_actions', stack: o.stack || 'refresh', metadata: { n }, mods: o.mods || [], triggers: o.triggers || [] });
ST11('nextPow11', '蓄勢', { dur: 'until_used', mods: [{ stage: 'status', who: 'attacker', mul: 1.3, cond: { hasPower: 1 } }], triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, effects: [{ type: 'remove_status', target: 'self', status: 'nextPow11' }] }] });
ST11('frenzy11', '狂刃', { mods: [{ stage: 'attacker', who: 'attacker', critAdd: 20 }] });
ST11('roar11', '狂吼', { mods: [{ stage: 'final', who: 'defender', mul: 0.9, cond: { hasPower: 1 } }] });
ST11('blood11', '狂戰之血', { mods: [{ stage: 'final', who: 'defender', mul: 1.15, cond: { hasPower: 1 } }], triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { hasPower: 1, tgtSide: 'enemy' }, effects: [{ type: 'heal', target: 'self', ofEvent: 0.15, kind: 'drain', quiet: 1 }] }] });
ST11('spearGuard11', '迴槍架勢', { triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', mul: { f: 'cnt11', v: 50 }, why: 'spear11' }] }] });
ST11('crack11', '裂甲', { tags: ['debuff'], triggers: [{ on: EVT.ROUND_END, effects: [{ type: 'damage', target: 'self', pctMax: 0.03, bossMul: 1 / 3, kind: 'dot', tags: ['dot'] }] }] });
ST11('mwall11', '法力屏障', { mods: [{ stage: 'final', who: 'defender', mul: 0.6, cond: { cat: '特', hasPower: 1 } }, { stage: 'final', who: 'defender', mul: 0.8, cond: { cat: '物', hasPower: 1 } }] });
ST11('maxim11', '魔導極限', { mods: [{ stage: 'base', costMul: 1.5, res: 'mp' }] });
ST11('pageGuard11', '守護之頁', { mods: [{ stage: 'final', who: 'defender', mul: 0.7, cond: { hasPower: 1 } }] });
ST11('evade11', '疾風之歌', { mods: [{ stage: 'defender', who: 'defender', accAdd: -10 }] });
ST11('harm11', '守護和聲', { mods: [{ stage: 'final', who: 'defender', mul: 0.75, cond: { hasPower: 1 } }] });
ST11('regen11', '讚歌', { triggers: [{ on: EVT.ROUND_END, effects: [{ type: 'heal', target: 'self', pct: 0.05, kind: 'regen', quiet: 1 }] }] });
ST11('shadowCounter11', '殘影', { triggers: [{ on: EVT.MISS, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', mul: { f: 'cnt11', v: 60 }, why: 'shadow11' }] }] });
ST11('parry11', '架劍', { dur: 'until_own_action', mods: [{ stage: 'final', who: 'defender', mul: 0.4, cond: { cat: '物', hasPower: 1 } }], triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', mul: { f: 'cnt11', v: 60 }, why: 'parry11' }] }] });
ST11('phantom11', '幻影', { dur: 'until_used', stack: 'add' });
ST11('swordDance11', '雙劍舞陣', { triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1, notTag: 'reaction' }, limit: { perAction: 1 }, effects: [{ type: 'damage', target: 'last_target', power: 30, tags: ['follow'], kind: 'follow' }] }] });
ST11('shieldStance11', '雙盾架勢', { mods: [{ stage: 'final', who: 'defender', mul: 0.5, cond: { hasPower: 1 } }], triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'status', target: 'self', status: 'bulk11', delta: 1, quiet: 1 }] }] });
ST11('bulk11', '盾勢', { dur: 'until_used', stack: 'add' });
ST11('fortCounter11', '不落要塞', { triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', mul: { f: 'cnt11', v: 40 }, why: 'fort11' }] }] });
BR.FORMULA.cnt11 = (c, v) => v / Math.max(1, (DEF.skills.counter_strike || {}).power || 35);
// 盾勢 caps at 3
{ const _as = BattleCore.prototype.applyStatus; BattleCore.prototype.applyStatus = function (src, t, id, o = {}) { const r = _as.call(this, src, t, id, o); if (id === 'bulk11') { const s = this.statusOf(t, 'bulk11'); if (s && s.stacks > 3) s.stacks = 3; } return r; }; }
// 詛咒連鎖: a random stat −1
EFFECT_TYPES.randStage11 = { exec(core, ef, ctx, tg) { for (const t of tg) { if (!core.isUp(t)) continue; const k = core.rng.pick(['atk', 'def', 'spa', 'spd', 'spe']); core.applyStatus(ctx.owner, t, 'stage_' + k, { delta: -1, dur: 3, secondary: true }); } } };
// 樂器的特性: the buffs the hero gives itself last one more round
{ const SG = EFFECT_TYPES.stage.exec; EFFECT_TYPES.stage.exec = function (core, ef, ctx, tg) { const u = ctx.owner, pos = Object.values(ef.stats || {}).every(v => v > 0);
    if (pos && u && u.hero && (u.mods || []).some(m => m.tr11Long) && tg.every(t => t === u)) return SG.call(this, core, { ...ef, dur: (ef.dur ?? 3) + 1 }, ctx, tg);
    return SG.call(this, core, ef, ctx, tg); }; }

/* ---------- the trees ---------- */
const DMG11 = (x = {}) => [{ type: 'damage' }].concat(x);
const STA11 = (status, chance, x = {}) => ({ type: 'status', status, chance, secondary: true, cond: { tgtAlive: 1, ...(['psn', 'par', 'brn', 'slp'].includes(status) ? { tgtNoMajor: 1 } : {}) }, ...x });
const SG11 = (stats, chance = 1, x = {}) => ({ type: 'stage', stats, ...(chance < 1 ? { chance, secondary: true } : {}), cond: { tgtAlive: 1 }, ...x });
const SELF11 = (stats, dur = 3) => ({ type: 'stage', target: 'self', stats, dur });
// 削護盾＝v257 的破防護盾（hunt_chip）；break_chip 從 10zz 起是舊的「30% 物防 −1」。「對破防中」＝有 broken 狀態（COND.tgtBroken 在 10zz 被改成物防下降）
const CHIP11 = n => ({ type: 'hunt_chip', n, cond: { tgtAlive: 1 }, why: 'tree11' });
const FL11 = p => STA11('flinch', p);
const MUL11 = (m, cond) => ({ stage: 'skill', who: 'attacker', mul: m, cond });
const TREE11 = {
  劍: { attr: ['str', 1], cat: '物', trait: '會心時多削 1 格護盾', mast: '劍術精通', third: ['鋒芒', '會心率 +2%／級'], sp: [['劍鳴', 'burst'], ['澄心', 'crit'], ['碎鋼', 'defdown']],
    sk: [['1a', 'sdBreak', '斷甲斬', 60, 0, 0, 3, 0, '斬擊，50% 讓對手物防 −1。', { effects: DMG11(SG11({ def: -1 }, 0.5)) }],
      ['1b', 'sdTwin', '疾風二連', 30, 2, 0, 4, 0, '兩段快斬，自己速度 +1。', { after: [SELF11({ spe: 1 })] }],
      ['1c', 'sdEye', '心眼', 0, 0, 3, 4, 0, '下一次攻擊必定會心，這回合迴避 +30%。', { effects: [{ type: 'status', target: 'self', status: 'critNext' }, { type: 'status', target: 'self', status: 'smoke', dur: 1 }] }],
      ['2a', 'sdGap', '破綻突', 80, 0, 1, 5, 0, '突刺；對手物防下降時威力 ×1.5，並削 1 格護盾。', { cls: 'pierce', mods: [MUL11(1.5, { tgtDefDown11: 1 })], effects: DMG11(CHIP11(1)) }],
      ['2b', 'sdWhirl', '旋刃', 65, 0, 2, 6, 1, '迴旋斬攻擊全體，會心率 +20%。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 20 }] }],
      ['2c', 'sdFrenzy', '狂刃', 0, 0, 4, 6, 0, '3 回合物攻 +2 階、會心率 +20%；結束時物防 −2 階。', { effects: [SELF11({ atk: 2 }), { type: 'status', target: 'self', status: 'frenzy11', dur: 3 }] }],
      ['3a', 'sdMeteor', '崩星劍', 170, 0, 3, 10, 0, '蓄力 1 回合後全力劈下；對破防中的對手威力 ×1.5。', { charge: 1, mods: [MUL11(1.5, { tgtStatus: 'broken' })] }],
      ['3b', 'sdFlow', '流光連斬', 22, 5, 2, 9, 0, '五段連斬，每段會心都會多削 1 格護盾。', {}]] },
  短刀: { attr: ['agi', 1], cat: '物', trait: '異常機率 +15%', mast: '短刀精通', third: ['輕盈', '迴避 +2%／級'], sp: [['蛇吻', 'psn'], ['影襲', 'surecrit'], ['疾步', 'haste']],
    sk: [['1a', 'dgVenom', '淬刃', 30, 2, 0, 4, 0, '兩段斬，每段 30% 中毒。', { effects: DMG11(STA11('psn', 0.3)) }],
      ['1b', 'dgQuick', '迅刺', 55, 0, 0, 3, 0, '搶先突刺，自己速度 +1。', { prio: 1, cls: 'pierce', after: [SELF11({ spe: 1 })] }],
      ['1c', 'dgShade', '掠影步', 0, 0, 3, 4, 0, '2 回合迴避 +30%，下一次攻擊威力 +30%。', { effects: [{ type: 'status', target: 'self', status: 'smoke', dur: 2 }, { type: 'status', target: 'self', status: 'nextPow11' }] }],
      ['2a', 'dgRot', '蝕毒連刺', 20, 4, 1, 6, 0, '四段刺擊；對中毒的對手每段威力 ×1.4。', { cls: 'pierce', mods: [MUL11(1.4, { tgtStatus: 'psn' })] }],
      ['2b', 'dgReap', '索命刺', 80, 0, 1, 6, 0, '對 HP 一半以下的對手威力 ×1.5，容易會心。', { cls: 'pierce', mods: [MUL11(1.5, { tgtHpBelow: 0.5 }), { stage: 'skill', who: 'attacker', critAdd: 20 }] }],
      ['2c', 'dgNeedle', '麻痺針', 50, 0, 2, 5, 0, '搶先，60% 麻痺。', { prio: 1, cls: 'pierce', effects: DMG11(STA11('par', 0.6)) }],
      ['3a', 'dgBloom', '千刃毒華', 20, 5, 3, 10, 0, '五段亂斬；最後引爆對手身上的中毒、麻痺、灼傷，每一種追加威力 40 的傷害並消除。',
        { after: ['psn', 'par', 'brn'].flatMap(s => [{ type: 'damage', target: 'cast_targets', power: 40, cond: { tgtStatus: s, tgtAlive: 1 }, kind: 'burst11' }, { type: 'remove_status', target: 'cast_targets', status: s, why: 'burst11' }]) }],
      ['3b', 'dgStitch', '影縫', 95, 0, 3, 9, 0, '搶先的一擊，讓對手這回合不能行動（頭目改成延到最後才行動）。', { prio: 1, cls: 'pierce',
        effects: DMG11([{ type: 'status', status: 'frozen', cond: { tgtAlive: 1, tgtBoss: 0 } }, { type: 'status', status: 'delay', cond: { tgtAlive: 1, tgtBoss: 1 } }]) }]] },
  斧: { attr: ['str', 1.2], cat: '物', trait: '普通攻擊也會削護盾', mast: '斧術精通', third: ['強健', '最大 HP +3%／級'], sp: [['崩岩', 'chip'], ['蠻勇', 'atkup'], ['地鳴', 'flinch50']],
    sk: [['1a', 'axSplit', '劈山', 65, 0, 0, 4, 0, '重劈，削 1 格護盾。', { cls: 'strike', effects: DMG11(CHIP11(1)) }],
      ['1b', 'axRoar', '狂吼', 0, 0, 3, 4, 0, '3 回合物攻 +1 階、受到的傷害 −10%。', { effects: [SELF11({ atk: 1 }), { type: 'status', target: 'self', status: 'roar11', dur: 3 }] }],
      ['1c', 'axSpin', '迴旋斧', 50, 0, 1, 5, 1, '迴旋一圈攻擊全體。', {}],
      ['2a', 'axCrush', '碎盾擊', 80, 0, 2, 6, 0, '削 2 格護盾。', { cls: 'strike', effects: DMG11(CHIP11(2)) }],
      ['2b', 'axFury', '怒濤劈', 75, 0, 1, 5, 0, 'HP 越低威力越高（HP 一半 ×1.3、剩 20% ×1.6）。', { mods: [MUL11(1.3, { srcHpBelow: 0.5 }), MUL11(1.6 / 1.3, { srcHpBelow: 0.2 })] }],
      ['2c', 'axQuake', '震地擊', 65, 0, 2, 6, 1, '敲擊地面攻擊全體，30% 退縮。', { effects: DMG11(FL11(0.3)) }],
      ['3a', 'axCastle', '崩城擊', 175, 0, 3, 10, 0, '蓄力 1 回合；對破防中的對手威力 ×1.5。', { charge: 1, cls: 'strike', mods: [MUL11(1.5, { tgtStatus: 'broken' })] }],
      ['3b', 'axBlood', '狂戰之血', 0, 0, 5, 8, 0, '3 回合物攻 +2 階、攻擊回復傷害 15% 的 HP；這段時間受到的傷害 +15%。', { effects: [SELF11({ atk: 2 }), { type: 'status', target: 'self', status: 'blood11', dur: 3 }] }]] },
  長槍: { attr: ['dex', 1], cat: '物', trait: '對破防中的魔物傷害 +20%（第三階段：打部位 +30%）', mast: '槍術精通', third: ['疾行', '速度 +1／級'], sp: [['貫心', 'pierce'], ['旋槍', 'aoe'], ['凝息', 'crit']],
    sk: [['1a', 'spPierce', '穿甲刺', 60, 0, 0, 3, 0, '無視 30% 物防的突刺。', { cls: 'pierce', pierceDef: 0.3 }],
      ['1b', 'spDash', '疾突', 55, 0, 0, 3, 0, '搶先突刺，對手速度 −1。', { prio: 1, cls: 'pierce', effects: DMG11(SG11({ spe: -1 })) }],
      ['1c', 'spSweep', '掃槍', 45, 0, 1, 4, 1, '橫掃全體，30% 退縮。', { effects: DMG11(FL11(0.3)) }],
      ['2a', 'spTriple', '三段突', 28, 3, 1, 6, 0, '三段突刺，每段無視 30% 物防。', { cls: 'pierce', pierceDef: 0.3 }],
      ['2b', 'spBreak', '破陣槍', 80, 0, 2, 6, 0, '削 1 格護盾；對蓄力中的對手威力 ×1.5。', { cls: 'pierce', mods: [MUL11(1.5, { tgtStatus: 'charging' })], effects: DMG11(CHIP11(1)) }],
      ['2c', 'spGuard', '迴槍架勢', 0, 0, 3, 5, 0, '2 回合物防 +2 階，被攻擊時反擊（威力 50）。', { effects: [SELF11({ def: 2 }, 2), { type: 'status', target: 'self', status: 'spearGuard11', dur: 2 }] }],
      ['3a', 'spThousand', '千重突', 18, 6, 3, 10, 0, '六段突刺，每段無視 30% 物防。', { cls: 'pierce', pierceDef: 0.3 }],
      ['3b', 'spSpiral', '螺旋貫', 110, 0, 2, 9, 0, '無視 50% 物防；對破防中的對手再 +30%。', { cls: 'pierce', pierceDef: 0.5, mods: [MUL11(1.3, { tgtStatus: 'broken' })] }]] },
  拳套: { attr: ['str', 1], cat: '物', trait: '普通攻擊打兩下（第二下 50%）', mast: '拳術精通', third: ['堅甲', '物防 +3%／級'], sp: [['連環腳', 'multi2'], ['氣旋', 'mana'], ['鐵骨', 'guard']],
    sk: [['1a', 'fsTriple', '三連拳', 20, 3, 0, 3, 0, '三連拳，每段回 1 MP。', { cls: 'strike', effects: DMG11({ type: 'resource', target: 'self', res: 'mp', amount: 1, why: 'fist11' }) }],
      ['1b', 'fsBreak', '破體拳', 60, 0, 0, 4, 0, '50% 讓對手物防 −1。', { cls: 'strike', effects: DMG11(SG11({ def: -1 }, 0.5)) }],
      ['1c', 'fsBreath', '吐納', 0, 0, 3, 0, 0, '回 15% MP，下一次攻擊威力 +30%。', { costs: [], effects: [{ type: 'resource', target: 'self', res: 'mp', pct: 0.15, why: 'breath11' }, { type: 'status', target: 'self', status: 'nextPow11' }] }],
      ['2a', 'fsKick', '旋踢', 25, 3, 1, 6, 1, '三段迴旋踢，攻擊全體。', { cls: 'strike' }],
      ['2b', 'fsShell', '碎殼掌', 75, 0, 2, 6, 0, '讓對手陷入「裂甲」3 回合：物防 −1 階，每回合受到最大 HP 3% 的傷害（頭目 1%）。', { cls: 'strike', effects: DMG11([SG11({ def: -1 }), { type: 'status', status: 'crack11', dur: 3, cond: { tgtAlive: 1 } }]) }],
      ['2c', 'fsQi', '氣勁彈', 75, 0, 1, 5, 0, '遠距的氣功彈，用物攻和魔攻較高的一項計算。', { cls: 'bolt', catOf: (core, u) => (u.stats.spa > u.stats.atk ? '特' : '物') }],
      ['3a', 'fsStorm', '狂嵐拳', 14, 8, 3, 10, 0, '八段連打，最後一段削 1 格護盾。', { cls: 'strike', after: [{ type: 'hunt_chip', target: 'cast_targets', n: 1, cond: { tgtAlive: 1 }, why: 'tree11' }] }],
      ['3b', 'fsThrough', '透勁', 120, 0, 2, 9, 0, '無視 40% 物防，50% 退縮。', { cls: 'strike', pierceDef: 0.4, effects: DMG11(FL11(0.5)) }]] },
  法杖: { attr: ['int', 1], cat: '特', trait: '打中弱點的傷害再 +15%', mast: '杖術精通', third: ['省力', '技能有 4%／級的機率不花 MP'], sp: [['魔力迸發', 'burst'], ['魔力湧泉', 'mana'], ['星輝', 'crit']],
    sk: [['1a', 'stArrows', '魔力箭', 22, 3, 0, 4, 0, '三支魔力箭，回 2 MP。', { cls: 'bolt', after: [{ type: 'resource', target: 'self', res: 'mp', amount: 2, why: 'arrows11' }] }],
      ['1b', 'stLance', '魔力槍', 70, 0, 1, 5, 0, '魔法長槍，50% 讓對手魔防 −1。', { cls: 'bolt', effects: DMG11(SG11({ spd: -1 }, 0.5)) }],
      ['1c', 'stWall', '法力屏障', 0, 0, 3, 5, 0, '2 回合受到的魔法傷害 −40%、物理傷害 −20%。', { effects: [{ type: 'status', target: 'self', status: 'mwall11', dur: 2 }] }],
      ['2a', 'stImpact', '魔力衝擊', 80, 0, 1, 6, 0, '30% 退縮；對蓄力中的對手威力 ×1.5。', { cls: 'bolt', mods: [MUL11(1.5, { tgtStatus: 'charging' })], effects: DMG11(FL11(0.3)) }],
      ['2b', 'stStorm', '魔力風暴', 65, 0, 2, 7, 1, '攻擊全體，30% 讓對手魔防 −1。', { effects: DMG11(SG11({ spd: -1 }, 0.3)) }],
      ['2c', 'stHaste', '時之加速', 0, 0, 4, 6, 0, '速度 +2 階，所有技能冷卻 −1。', { effects: [SELF11({ spe: 2 }), { type: 'cooldown', target: 'self', how: 'all', n: 1, why: 'haste11' }] }],
      ['3a', 'stFinale', '魔力終曲', 50, 0, 4, 10, 0, '用掉全部 MP（至少 10），每 1 MP 威力 +5（最多 250）。', { cls: 'bolt', costs: [{ res: 'mp', all: true, min: 10 }], powerOf: 'finale11' }],
      ['3b', 'stMax', '魔導極限', 0, 0, 5, 8, 0, '3 回合魔攻 +2 階，這段時間技能 MP +50%。', { effects: [SELF11({ spa: 2 }), { type: 'status', target: 'self', status: 'maxim11', dur: 3 }] }]] },
  魔導書: { attr: ['int', 1], cat: '特', trait: '技能 MP −20%（第三階段：慣性的變化減半）', mast: '魔導書精通', third: ['回魔', '每回合回最大 MP 的 1%／級'], sp: [['飛頁', 'strike'], ['縛頁', 'slow'], ['智慧之泉', 'mana']],
    sk: [['1a', 'tmCurse', '咒言', 55, 0, 0, 4, 0, '魔法攻擊，40% 讓對手物攻 −1。', { cls: 'bolt', effects: DMG11(SG11({ atk: -1 }, 0.4)) }],
      ['1b', 'tmSlow', '遲滯咒', 0, 0, 2, 4, 0, '對手速度 −2 階（一定命中）。', { target: 'enemy', effects: [SG11({ spe: -2 })] }],
      ['1c', 'tmPage', '守護之頁', 0, 0, 3, 4, 0, '2 回合受到的傷害 −30%，回 3 MP。', { effects: [{ type: 'status', target: 'self', status: 'pageGuard11', dur: 2 }, { type: 'resource', target: 'self', res: 'mp', amount: 3, why: 'page11' }] }],
      ['2a', 'tmChain', '詛咒連鎖', 30, 3, 1, 6, 0, '三段，每段 30% 讓對手一項能力 −1。', { cls: 'bolt', effects: DMG11({ type: 'randStage11', chance: 0.3, cond: { tgtAlive: 1 } }) }],
      ['2b', 'tmPages', '飛頁之舞', 65, 0, 2, 7, 1, '書頁飛舞攻擊全體。', {}],
      ['2c', 'tmDrain', '吸魔咒', 70, 0, 1, 3, 0, '回復傷害 25% 的 MP。', { cls: 'bolt', after: [{ type: 'resource', target: 'self', res: 'mp', ofCast: 0.25, why: 'mpDrain' }] }],
      ['3a', 'tmStop', '時之停滯', 0, 0, 5, 12, 0, '對手跳過下一次行動（頭目改成延到最後才行動）。', { target: 'enemy', effects: [{ type: 'status', status: 'frozen', cond: { tgtBoss: 0 } }, { type: 'status', status: 'delay', cond: { tgtBoss: 1 } }, { type: 'remove_status', status: 'charging', cond: { tgtBoss: 0 }, why: 'timeStop' }] }],
      ['3b', 'tmForbid', '禁書解放', 120, 0, 3, 10, 1, '攻擊全體；對手每有一項能力下降，威力 +15%。', { mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'forbid11' } }] }]] },
  樂器: { attr: ['int', 1], cat: '特', trait: '自己的強化效果多 1 回合', mast: '樂器精通', third: ['回復量', '治癒效果 +4%／級'], sp: [['迴響', 'flinch20'], ['激勵', 'power'], ['安撫', 'heal']],
    sk: [['1a', 'inShock', '震音', 55, 0, 0, 4, 0, '音波衝擊，20% 退縮。', { cls: 'bolt', effects: DMG11(FL11(0.2)) }],
      ['1b', 'inRally', '鼓舞之歌', 0, 0, 3, 5, 0, '3 回合物攻、魔攻 +1 階。', { effects: [SELF11({ atk: 1, spa: 1 })] }],
      ['1c', 'inHeal', '療癒旋律', 0, 0, 2, 5, 0, '回 25% HP，解除 1 個異常狀態。', { tags: ['heal'], effects: [{ type: 'heal', target: 'self', pct: 0.25 }, { type: 'cleanse', target: 'self' }] }],
      ['2a', 'inEcho', '回音擊', 75, 0, 1, 5, 0, '對手有能力下降或異常時威力 ×1.4。', { cls: 'bolt', mods: [MUL11(1.4, { tgtDebuffed11: 1 })] }],
      ['2b', 'inWind', '疾風之歌', 0, 0, 3, 5, 0, '3 回合速度 +2 階、迴避 +10%。', { effects: [SELF11({ spe: 2 }), { type: 'status', target: 'self', status: 'evade11', dur: 3 }] }],
      ['2c', 'inHarmony', '守護和聲', 0, 0, 3, 6, 0, '3 回合受到的傷害 −25%。', { effects: [{ type: 'status', target: 'self', status: 'harm11', dur: 3 }] }],
      ['3a', 'inRoar', '轟音', 95, 0, 2, 9, 1, '攻擊全體，50% 退縮。', { effects: DMG11(FL11(0.5)) }],
      ['3b', 'inHero', '英雄讚歌', 0, 0, 5, 10, 0, '3 回合物攻、魔攻 +2 階，每回合回 5% HP。', { effects: [SELF11({ atk: 2, spa: 2 }), { type: 'status', target: 'self', status: 'regen11', dur: 3 }] }]] },
  火槍: { attr: ['dex', 1], cat: '物', trait: '第一回合必定先手', mast: '槍械精通', third: ['會心傷害', '+5%／級'], sp: [['追射', 'multi2'], ['炸裂彈', 'aoe'], ['急速裝填', 'mana']],
    sk: [['1a', 'gnRapid', '速射', 28, 2, 0, 3, 0, '搶先的兩連射。', { prio: 1, cls: 'pierce' }],
      ['1b', 'gnAim', '瞄準射擊', 70, 0, 1, 4, 0, '一定命中，會心率 +30%。', { cls: 'pierce', mods: [{ stage: 'skill', who: 'attacker', accAdd: 999 }, { stage: 'skill', who: 'attacker', critAdd: 30 }] }],
      ['1c', 'gnPara', '麻痺彈', 45, 0, 2, 4, 0, '60% 麻痺。', { cls: 'pierce', effects: DMG11(STA11('par', 0.6)) }],
      ['2a', 'gnSpray', '掃射', 20, 3, 1, 6, 1, '三段射擊攻擊全體。', { cls: 'pierce' }],
      ['2b', 'gnAp', '貫通彈', 80, 0, 2, 6, 0, '無視 40% 物防，削 1 格護盾。', { cls: 'pierce', pierceDef: 0.4, effects: DMG11(CHIP11(1)) }],
      ['2c', 'gnSmoke', '障目彈', 0, 0, 3, 5, 0, '2 回合迴避 +30%，對手速度 −1。', { effects: [{ type: 'status', target: 'self', status: 'smoke', dur: 2 }, { type: 'stage', target: 'all_enemies', stats: { spe: -1 } }] }],
      ['3a', 'gnBarrage', '彈幕', 15, 6, 3, 10, 1, '六段射擊攻擊全體。', { cls: 'pierce' }],
      ['3b', 'gnSnipe', '鷹眼狙擊', 180, 0, 3, 10, 0, '蓄力 1 回合，必定會心。', { charge: 1, cls: 'pierce', mods: [{ stage: 'skill', who: 'attacker', crit: true }] }]] },
  雙刀: { dual: 1, attr: ['agi', 1], cat: '物', trait: '多段攻擊每段威力 +10%，速度 +3', mast: '雙刀精通', mastD: '副手的威力 +6%／級', sp: [['雙影襲', 'multi2'], ['刃嵐', 'aoe']],
    sk: [['1a', 'ddSpin', '雙刃旋', 18, 4, 0, 4, 0, '雙手交錯四段斬，主手、副手輪流。', {}],
      ['1b', 'ddCross', '交叉刺', 35, 2, 1, 4, 0, '兩把同時刺；兩段都打中時對手物防 −1。', { cls: 'pierce', after: [{ type: 'stage', target: 'cast_targets', stats: { def: -1 }, cond: { tgtAlive: 1 } }] }],
      ['2a', 'ddDance', '燕舞亂刃', 15, 7, 2, 8, 0, '七段亂舞，每段 10% 中毒。', { effects: DMG11(STA11('psn', 0.1)) }],
      ['2b', 'ddAfter', '殘影反擊', 0, 0, 3, 5, 0, '2 回合迴避 +40%；閃過攻擊時用雙刀反擊（威力 30×2）。', { effects: [{ type: 'status', target: 'self', status: 'smoke', dur: 2 }, { type: 'status', target: 'self', status: 'evade11', dur: 2 }, { type: 'status', target: 'self', status: 'shadowCounter11', dur: 2 }] }],
      ['3a', 'ddGale', '疾風百刃', 12, 10, 3, 12, 0, '十段連斬；速度比對手快時再多 2 段。', { hitsOf: (core, u, cmd) => { const t = core.byId[(cmd.tg || cmd.targets || [])[0]]; return 10 + (t && u.stats.spe > t.stats.spe ? 2 : 0); } }],
      ['3b', 'ddFang', '雙牙絕命', 60, 2, 3, 10, 0, '兩把同時刺進；對 HP 30% 以下的對手威力 ×2。', { cls: 'pierce', mods: [MUL11(2, { tgtHpBelow: 0.3 })] }]] },
  雙劍: { dual: 1, attr: ['str', 1], cat: '物', trait: '會心時副手追加一斬（威力 30）', mast: '雙劍精通', mastD: '副手的威力 +6%／級', sp: [['交叉斬', 'multi2crit'], ['劍風', 'aoe']],
    sk: [['1a', 'dsMoon', '雙月斬', 40, 2, 0, 4, 0, '兩把劍交叉斬，會心率 +15%。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 15 }] }],
      ['1b', 'dsParry', '架劍', 0, 0, 2, 3, 0, '這回合受到的物理傷害 −60%，被攻擊時反擊（威力 60）。', { prio: 1, effects: [{ type: 'status', target: 'self', status: 'parry11' }] }],
      ['2a', 'dsWhirl', '迴旋雙刃', 35, 2, 2, 7, 1, '兩把劍迴旋攻擊全體。', {}],
      ['2b', 'dsPhantom', '幻影連斬', 20, 6, 2, 8, 0, '六段連斬；每次會心，後面每段威力 +10%。', { mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'phantom11' } }], after: [{ type: 'remove_status', target: 'self', status: 'phantom11' }] }],
      ['3a', 'dsStar', '雙星十字', 65, 2, 3, 11, 0, '兩道十字斬，會心時多削 1 格護盾；對破防中的對手威力 ×1.3。', { mods: [MUL11(1.3, { tgtStatus: 'broken' })] }],
      ['3b', 'dsDance', '雙劍舞陣', 0, 0, 5, 8, 0, '3 回合每次攻擊後副手追加一斬（威力 30），速度 +1 階。', { effects: [SELF11({ spe: 1 }), { type: 'status', target: 'self', status: 'swordDance11', dur: 3 }] }]] },
  雙盾: { dual: 1, attr: ['vit', 1], cat: '物', trait: '防禦時受到的傷害再 −20%，被攻擊時 30% 反擊（威力 40）', mast: '雙盾精通', mastD: '用盾攻擊的傷害 +3%／級', sp: [['盾鳴', 'flinch30'], ['鋼壁', 'guard']],
    sk: [['1a', 'shBash', '雙盾擊', 55, 0, 0, 3, 0, '用兩面盾砸，30% 退縮。', { cls: 'strike', effects: DMG11(FL11(0.3)) }],
      ['1b', 'shStance', '雙盾架勢', 0, 0, 3, 4, 0, '2 回合受到的傷害 −50%；這段時間每被打一次得到 1 層「盾勢」（最多 3 層）。', { effects: [{ type: 'status', target: 'self', status: 'shieldStance11', dur: 2 }] }],
      ['2a', 'shRam', '盾突', 75, 0, 1, 5, 0, '衝撞，削 1 格護盾；每層盾勢威力 +25%，用掉盾勢。', { cls: 'strike', mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'ram11' } }], effects: DMG11(CHIP11(1)), after: [{ type: 'remove_status', target: 'self', status: 'bulk11', why: 'used' }] }],
      ['2b', 'shReflect', '反射壁', 0, 0, 3, 5, 0, '這回合受到的魔法傷害反彈 50% 回去。', { prio: 1, effects: [{ type: 'status', target: 'self', status: 'mirror', dur: 1 }] }],
      ['3a', 'shCrash', '雙盾崩擊', 150, 0, 3, 10, 0, '蓄力 1 回合（蓄力時受到的傷害 −70%），兩面盾一起砸下；對破防中的對手威力 ×1.5。', { charge: 1, cls: 'strike', mods: [MUL11(1.5, { tgtStatus: 'broken' })] }],
      ['3b', 'shFort', '不落要塞', 0, 0, 5, 10, 0, '3 回合物防、魔防 +2 階，每回合回 5% HP，被攻擊時反擊（威力 40）。', { effects: [SELF11({ def: 2, spd: 2 }), { type: 'status', target: 'self', status: 'regen11', dur: 3 }, { type: 'status', target: 'self', status: 'fortCounter11', dur: 3 }] }]] },
};
/* ---------- 職業退場（玩家 2026-10-04「我想把職業系統拿掉」→ 企劃〈職業退場清單〉，名字「另外取、都用新的」）----------
   ・每棵武器樹多第四段「絕技」（Lv35，要第三段任一招 Lv3）：原本各職業的代表招，改成不靠職業資源的版本。
     上級職業和隱藏職業的任務照舊，完成後解鎖那個職業的絕技（flag 沿用：clsBard・clsMachinist・clsMonk・clsDragoon・hiddenCls・spellbladeOk）。
   ・三棵共通樹「戰技・護身・輔佐」：不分武器，跟武器樹用同一種技能點；節點從原本的天賦挑出來，名字全部換新。 */
const UNLOCK11 = { clsBard: '詩人公會長的委託', clsMachinist: '鐘錶師的委託', clsMonk: '雪峰寺的試煉', clsDragoon: '龍騎士老人的試煉', hiddenCls: '初代勇者的試煉', spellbladeOk: '失落的劍譜' };
const MAXATK11 = (core, u) => (u.stats.spa > u.stats.atk ? '特' : '物');
const CRIT11 = { stage: 'skill', who: 'attacker', crit: true };
Object.assign(COND, { srcChiFull11: (c, v) => !!c.src && (c.src.max.chi || 0) > 0 && (c.src.res.chi || 0) >= c.src.max.chi === !!v });
Object.assign(BR.FORMULA, { ironLaw11: c => (c.src.stats.atk + c.src.stats.def) / Math.max(1, c.src.stats.atk), song12: c => 1 + 0.15 * ((c.src && c.src.statuses.filter(s => DEF.statuses[s.id] && DEF.statuses[s.id].group === 'stage' && s.stacks > 0).length) || 0) });
const ZJ11 = {
  劍: [['4a', 'zjSky', '一刀天斷', 150, 0, 4, 14, 0, '搶先的一刀，必定會心。', { prio: 1, mods: [CRIT11] }],
    ['4b', 'zjRune', '星紋魔劍', 95, 0, 4, 14, 0, '用物攻、魔攻較高的一邊計算；再追加 2 段武器屬性的魔法（各 40），回復傷害 10% 的 MP。', { unlock: 'spellbladeOk', catOf: MAXATK11,
      after: [{ type: 'damage', target: 'cast_targets', power: 40, cat: '特', cond: { tgtAlive: 1 } }, { type: 'damage', target: 'cast_targets', power: 40, cat: '特', cond: { tgtAlive: 1 } }, { type: 'resource', target: 'self', res: 'mp', ofCast: 0.1, why: 'drain' }] }]],
  雙劍: [['4a', 'zjSwallow', '迴燕雙斷', 130, 0, 4, 14, 0, '迴身的一斬，必定會心。', { mods: [CRIT11] }],
    ['4b', 'zjObsidian', '黑曜終劍', 160, 0, 5, 16, 0, '用物攻、魔攻較高的一邊計算的終結一劍。', { unlock: 'spellbladeOk', catOf: MAXATK11 }]],
  短刀: [['4a', 'zjMoonFang', '月影雙牙', 55, 2, 4, 12, 0, '2 段；對 HP 一半以下的對手每段必定會心。', { cls: 'pierce', mods: [{ ...CRIT11, cond: { tgtHpBelow: 0.5 } }] }]],
  雙刀: [['4a', 'zjBloom', '旋花飛刃', 50, 2, 4, 14, 1, '飛刃像花瓣一樣旋轉，打全體 2 段。', {}]],
  斧: [['4a', 'zjIronLaw', '鐵律重斧', 110, 0, 4, 14, 0, '攻擊力用「物攻＋物防」計算，50% 讓對手物防 −1。', { cls: 'strike', mods: [{ stage: 'skill', who: 'attacker', atkMul: { f: 'ironLaw11' } }], effects: DMG11(SG11({ def: -1 }, 0.5)) }]],
  雙盾: [['4a', 'zjHolyWall', '聖壁衝鋒', 50, 0, 3, 10, 0, '消耗全部守勢（至少 2），每點威力 +15；之後展開護盾（守勢 4 以上 3 格，否則 2 格）。', { cls: 'strike', costs: [{ res: 'stance', all: 1, min: 2 }, { res: 'mp', amount: 10 }], powerOf: 'guardStrike', after: [{ type: 'status', target: 'self', status: 'barrier', dur: { f: 'shieldDur' } }] }]],
  法杖: [['4a', 'zjFourFold', '四象奔流', 45, 0, 4, 16, 0, '火、水、雷、草各打一段魔法（各 45）。', { cls: 'bolt', effects: ['火', '水', '雷', '草'].map(el => ({ type: 'damage', el, cond: { tgtAlive: 1 } })) }]],
  魔導書: [['4a', 'zjStarPage', '星辰墜頁', 120, 0, 4, 16, 1, '星光化成書頁落下打全體，帶武器的屬性。', {}]],
  樂器: [['4a', 'zjOverture', '迴響序曲', 0, 0, 4, 10, 0, '物攻・魔攻 +1 階（3 回合），回復 15% HP，特技 +1 層。', { unlock: 'clsBard', effects: [SELF11({ atk: 1, spa: 1 }), { type: 'heal', target: 'self', pct: 0.15 }, { type: 'resource', target: 'self', res: 'wc', amount: 1, why: 'song' }] }],
    ['4b', 'zjFinale', '終章頌歌', 90, 0, 4, 14, 1, '打全體（魔法）；自己每有 1 種能力提升，威力 +15%。', { unlock: 'clsBard', mods: [{ stage: 'skill', who: 'attacker', powMul: { f: 'song12' } }] }]],
  火槍: [['4a', 'zjGearGun', '齒輪砲台', 90, 0, 4, 14, 0, '砲擊並設置砲台（3 發）；砲台每回合結束自動射擊一隻魔物（威力 40）。', { unlock: 'clsMachinist', after: [{ type: 'turret_set' }] }],
    ['4b', 'zjRedShell', '赤焰彈', 85, 0, 3, 10, 0, '火屬性的燃燒彈，50% 灼傷。', { unlock: 'clsMachinist', el: '火', effects: DMG11(STA11('brn', 0.5)) }]],
  拳套: [['4a', 'zjThousand', '千手寸勁', 35, 3, 3, 10, 0, '3 段；每有 1 點氣多 1 段，用掉全部的氣。', { unlock: 'clsMonk', cls: 'strike', costs: [{ res: 'chi', all: 1, min: 0 }, { res: 'mp', amount: 10 }], hitsOf: (core, u, cmd) => 3 + (cmd.spent || 0) }],
    ['4b', 'zjQuake', '裂地神掌', 170, 0, 4, 14, 0, '必定會心；氣滿時威力再 +50%。', { unlock: 'clsMonk', cls: 'strike', mods: [CRIT11, MUL11(1.5, { srcChiFull11: 1 })] }]],
  長槍: [['4a', 'zjAzure', '蒼龍躍', 185, 0, 4, 14, 0, '跳到空中（大部分攻擊打不到），下一次行動落下。', { unlock: 'clsDragoon', cls: 'pierce', charge: 1, airborne: 1 }],
    ['4b', 'zjMeteor', '流星龍墜', 120, 0, 5, 16, 1, '跳到空中，下一次行動化成流星落下打全體。', { unlock: 'clsDragoon', charge: 1, airborne: 1 }]],
};
for (const k in ZJ11) TREE11[k].sk.push(...ZJ11[k]);
// 共通樹：[id, 名字, 最高等級, 段, 說明, 效果]；效果 p＝百分比能力、f＝固定值、big／regen／mpRegen＝戰鬥被動、tal＝沿用原本天賦的效果
const CM11 = {
  戰技: { cat: '物', nodes: [['cmAtk', '剛力', 5, 1, '物攻 +2%／級', { p: { atk: 2 } }], ['cmSpa', '靈力', 5, 1, '魔攻 +2%／級', { p: { spa: 2 } }], ['cmCrit', '銳眼', 5, 1, '會心率 +1%／級', { f: { crit: 1 } }],
      ['cmWeak', '識破', 5, 2, '打中弱點的傷害 +3%／級', { f: { weakUp: 3 } }], ['cmBig', '屠巨', 5, 2, '對菁英・頭目的傷害 +3%／級', { big: 3 }], ['cmChase', '追斬', 1, 2, '會心命中後追加一擊（威力 20），每次行動 1 次', { tal: 'swordsman.0.1.0' }],
      ['cmFirst', '先機', 1, 2, '每場第一回合一定第一個行動', { tal: 'swordsman.2.0.1' }], ['cmLast', '死戰', 1, 3, 'HP 越低傷害越高（最多 +35%）', { tal: 'swordsman.1.2.0' }],
      ['cmFlow', '連舞', 1, 3, '連續使用不同技能每次 +1 段，每段傷害 +6%（最多 3 段）；重複同一招或防禦就中斷', { tal: 'swordsman.0.0.1' }]],
    sk: [['3a', 'cmDawn', '晨曦之刃', 120, 0, 4, 14, 0, '吸取傷害的 20% HP，會心率加倍；用什麼武器都能用。', { unlock: 'hiddenCls', critX: 2, after: [{ type: 'heal', target: 'self', ofCast: 0.2, kind: 'drain', quiet: 1 }] }],
      ['3b', 'cmTwin', '雙相斬', 60, 0, 3, 10, 0, '第 1 段物理、第 2 段魔法（各 60）；用什麼武器都能用。', { unlock: 'hiddenCls', effects: [{ type: 'damage', cat: '物' }, { type: 'damage', cat: '特', cond: { tgtAlive: 1 } }] }]] },
  護身: { cat: '物', nodes: [['cmHp', '強身', 5, 1, '最大 HP +2%／級', { p: { hp: 2 } }], ['cmDef', '鐵膚', 5, 1, '物防 +2%／級', { p: { def: 2 } }], ['cmSpe', '輕足', 5, 1, '速度 +2%／級', { p: { spe: 2 } }],
      ['cmRegen', '再生', 4, 2, '回合結束回復 1% HP／級', { regen: 1 }], ['cmGuardHeal', '調息', 1, 2, '防禦時回復 8% HP', { tal: 'guardian.0.1.0' }], ['cmGuard', '穩守', 1, 2, '防禦時受到的傷害再 −15%', { tal: 'guardian.1.0.1' }],
      ['cmOpen', '先盾', 1, 2, '開場展開 3 格護盾', { tal: 'guardian.0.1.1' }], ['cmEndure', '頑強', 1, 3, '每場 1 次，受到致命傷害時留下 1 HP', { tal: 'swordsman.1.2.1' }],
      ['cmDodge', '幻身', 1, 3, '每場 1 次完全閃避一次攻擊', { tal: 'ranger.1.2.1' }], ['cmAid', '急救', 1, 3, '每場 1 次：HP 低於 30% 時回復 30%', { tal: 'machinist.2.2.1' }]], sk: [] },
  輔佐: { cat: '特', nodes: [['cmMp', '蓄魔', 5, 1, '最大 MP +3%／級', { p: { mp: 3 } }], ['cmHeal', '仁心', 5, 1, '治療效果 +3%／級', { f: { healUp: 3 } }], ['cmAtkMp', '回氣', 1, 1, '普攻多回復 3 MP', { tal: 'bard.2.1.1' }],
      ['cmMpRegen', '靜心', 3, 2, '回合結束回復 1% MP／級', { mpRegen: 1 }], ['cmBreath', '養氣', 1, 2, '防禦時回復的 MP 從 12% 提高到 25%', { tal: 'mage.2.0.1' }], ['cmThrift', '節能', 1, 2, '技能進入冷卻時，退還 30% 的 MP', { tal: 'mage.2.1.0' }],
      ['cmSpStart', '起手', 1, 2, '開場特技就有 1 層', { tal: 'machinist.1.0.1' }], ['cmSpCut', '疾技', 1, 3, '特技所需層數 −1', { cut: 1 }], ['cmExp', '好學', 1, 3, '戰鬥勝利的經驗值 +15%', { tal: 'otherworlder.0.0.1' }],
      ['cmAlly', '同心', 1, 3, '夥伴援護的效果 +50%', { tal: 'otherworlder.0.1.0' }]], sk: [] },
};
for (const k in CM11) TREE11[k] = { common: 1, attr: ['str', 1], cat: CM11[k].cat, nodes: CM11[k].nodes, sk: CM11[k].sk, sp: [] };
const COMMON11 = Object.keys(CM11);
const TREE_KINDS11 = Object.keys(TREE11), DUAL_KINDS11 = TREE_KINDS11.filter(k => TREE11[k].dual);
const POS_LV11 = { 1: 1, 2: 15, 3: 30, 4: 35 }, POS_LVD11 = POS_LV11; // 雙持樹跟一般的樹一樣（原本 15／25／35）；第四段＝絕技
const SK_TREE11 = {}; // skill id → [kind, pos]
function sk11Build(kind) { const T = TREE11[kind];
  for (const [pos, k, n, pow, hits, cd, mp, aoe, d, x] of T.sk) {
    const id = 't_' + k, cat = T.cat, tpl = pow ? (cat === '特' ? 'magicBolt' : 'slash') : 'focus';
    MOVES[id] = { n, d, t: x.el || '一般', cat, pow, acc: pow ? 100 : null, hits: hits || null, cls: aoe ? 'area' : x.cls || (pow ? 'slash' : 'buff'), ...(pow ? { scale: T.attr } : {}), ...(x.prio ? { prio: 1 } : {}), ws: 1, fx: 't11_' + k };
    SKILL_MP[id] = mp;
    const D = skillFromMove(id, MOVES[id], { kind: 'skill', tpl, extraTags: ['tree11'].concat(x.tags || []), costs: x.costs || (mp ? [{ res: 'mp', amount: mp }] : []), fallback: 'attack' });
    if (!pow) { D.target = x.target || 'self'; D.noHitRoll = true; D.effects = []; D.tags = D.tags.filter(t => t !== 'damage'); }
    if (x.effects) D.effects = x.effects.map(e => ({ ...e })); if (x.after) D.after = x.after.map(e => ({ ...e })); if (x.mods) D.mods = D.mods.concat(x.mods.map(m => ({ ...m })));
    for (const f of ['hitsOf', 'powerOf', 'catOf']) if (x[f]) D[f] = x[f];
    if (x.pierceDef) D.pierceDef = x.pierceDef; if (x.critX) D.critX = x.critX; if (x.airborne) D.airborne = 1;
    if (x.charge) { D.charge = true; if (!D.tags.includes('charge')) D.tags.push('charge'); }
    Object.assign(D, { cooldown: cd, prio: x.prio ? 1 : 0, fx: 't11_' + k, metadata: { tree11: kind, pos, unlock: x.unlock || null } });
    D.effects = D.effects.map((ef, j) => effRegister('skill:' + id + '#e' + j, ef)); D.after = D.after.map((ef, j) => effRegister('skill:' + id + '#a' + j, ef));
    defPut('skills', id, { ...D, override: 1 }); SK_TREE11[id] = [kind, pos];
    if (typeof FX !== 'undefined' && !FX['t11_' + k]) FX['t11_' + k] = FX[pow ? (cat === '特' ? 'magicBolt' : aoe ? 'whirlRing' : 'slash') : 'buff'] || FX.hit;
    if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = [pow ? 'draw' : 'focus', pow ? 'none' : null, 't11_' + k, null]; } }
for (const k of TREE_KINDS11) sk11Build(k);
const treeOf11 = id => SK_TREE11[id] || null;
const treeSkillKey11 = id => id.slice(2);

/* ---------- specials: one skill per special, weapon tier and physical / magic ---------- */
const SPN11 = { burst: 4, crit: 3, defdown: 3, psn: 4, surecrit: 4, haste: 3, chip: 3, atkup: 4, flinch50: 3, pierce: 4, aoe: 4, multi2: 4, mana: 3, guard: 4, strike: 3, slow: 3, flinch20: 3, power: 4, heal: 4, multi2crit: 4, flinch30: 3 };
const SP_TXT11 = { burst: '強力追擊', crit: '下一次攻擊必定會心', defdown: '追擊，對手物防 −1', psn: '追擊，60% 中毒', surecrit: '追擊，必定會心', haste: '速度 +1 階，回 10% MP', chip: '追擊，削 1 格護盾', atkup: '物攻 +1 階',
  flinch50: '追擊，50% 退縮', pierce: '追擊，無視物防', aoe: '追擊全體', multi2: '兩段追擊', mana: '回 20% MP', guard: '2 回合受到的傷害 −40%', strike: '追擊一次', slow: '對手速度 −1 階', flinch20: '音波追擊，20% 退縮',
  power: '物攻・魔攻各 +1 階', heal: '回 15% HP', multi2crit: '兩段追擊，容易會心', flinch30: '追擊，30% 退縮' };
const spPow11 = (k, t) => ({ burst: 40 + 10 * t, strike: 30 + 8 * t, multi2: 20 + 5 * t, multi2crit: 20 + 5 * t, surecrit: 30 + 8 * t, pierce: 30 + 6 * t })[k] ?? (['defdown', 'psn', 'chip', 'flinch50', 'flinch30', 'flinch20', 'aoe'].includes(k) ? 25 + 6 * t : 0);
const spId11 = (kind, j, t, mag) => 'wsp11_' + TREE_KINDS11.indexOf(kind) + '_' + j + '_' + t + (mag ? 'm' : '');
for (const kind of TREE_KINDS11) TREE11[kind].sp.forEach(([n, k], j) => { for (let t = 1; t <= 7; t++) for (const mag of [0, 1]) {
  const p = spPow11(k, t), id = spId11(kind, j, t, mag), hurt = p > 0, base = { n, t: '一般', cat: mag ? '特' : '物', pow: p, acc: null };
  const d = skillFromMove(id, base, { kind: 'weapon_special', extraTags: ['weapon_special'] }); d.noHitRoll = !hurt; d.acc = null; d.target = hurt ? (k === 'aoe' ? 'all_enemies' : 'enemy') : 'self'; d.effects = hurt ? [{ type: 'damage' }] : [];
  if (k === 'multi2' || k === 'multi2crit') d.hits = [2, 2];
  if (k === 'multi2crit') d.mods.push({ stage: 'skill', who: 'attacker', critAdd: 30 }); if (k === 'surecrit') d.mods.push({ stage: 'skill', who: 'attacker', crit: true });
  if (k === 'pierce') d.pierceDef = 1;
  if (k === 'defdown') d.after.push({ type: 'stage', stats: { def: -1 }, target: 'cast_targets', cond: { tgtAlive: 1 } });
  if (k === 'psn') d.after.push({ type: 'status', status: 'psn', chance: 0.6, target: 'cast_targets', secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1 } });
  if (k === 'chip') d.after.push({ type: 'hunt_chip', target: 'cast_targets', n: 1, cond: { tgtAlive: 1 }, why: 'sp11' });
  if (/^flinch/.test(k)) d.after.push({ type: 'status', status: 'flinch', chance: +k.slice(6) / 100, target: 'cast_targets', secondary: true, cond: { tgtAlive: 1 } });
  if (k === 'crit') d.effects = [{ type: 'status', status: 'critNext', target: 'self' }];
  if (k === 'haste') d.effects = [{ type: 'stage', stats: { spe: 1 }, target: 'self' }, { type: 'resource', res: 'mp', pct: 0.1, target: 'self' }];
  if (k === 'atkup') d.effects = [{ type: 'stage', stats: { atk: 1 }, target: 'self' }];
  if (k === 'power') d.effects = [{ type: 'stage', stats: { atk: 1, spa: 1 }, target: 'self' }];
  if (k === 'mana') d.effects = [{ type: 'resource', res: 'mp', pct: 0.2, target: 'self' }];
  if (k === 'guard') d.effects = [{ type: 'status', status: 'barrier', dur: 2, target: 'self' }];
  if (k === 'heal') d.effects = [{ type: 'heal', pct: 0.15, target: 'self' }];
  if (k === 'slow') { d.target = 'enemy'; d.effects = [{ type: 'stage', stats: { spe: -1 } }]; }
  d.cooldown = 0; d.metadata = { wsp: k, tier: t, tree11: kind }; d.effects = d.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.after = d.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); defPut('skills', id, d); } });

/* ---------- state: levels, points ---------- */
const tr11 = (st = Game.st) => { const T = st.tr11 || (st.tr11 = { lv: {}, eq: {}, rs: 0 }); T.lv = T.lv || {}; T.eq = T.eq || {}; return T; };
const trLv11 = (key, st = Game.st) => (tr11(st).lv[key] || 0);
const bossPts11 = (st = Game.st) => { let n = 0; const seen = new Set(); for (const m in MAPS) { const B = MAPS[m].boss; if (!B || !B.sp || seen.has(B.sp) || /^cave6_|^rift/.test(m)) continue; seen.add(B.sp); if ((((st.dex || {})[B.sp]) || {}).won > 0 || (B.flag && (st.flags || {})[B.flag])) n++; } return n; };
const LVPTS11 = 2; // 職業退場：共通樹也吃技能點 → 每級 2 點（原本 1 點）
const trTotal11 = (st = Game.st) => (st.lv || 1) * LVPTS11 + bossPts11(st) + (st.trRef11 || 0);
const trSpent11 = (st = Game.st) => Object.values(tr11(st).lv).reduce((a, b) => a + (b || 0), 0);
const trLeft11 = (st = Game.st) => Math.max(0, trTotal11(st) - trSpent11(st));
// a tree's nodes: [key, kind of node, name, max level, needs {lv, pre}]
function treeNodes11(kind) { const T = TREE11[kind], L = [], PL = T.dual ? POS_LVD11 : POS_LV11;
  if (T.common) { for (const [id, n, max, tier, d] of T.nodes) L.push({ key: 'cm:' + id, t: 'cp', n, max, lv: PL[tier], tier, d });
    for (const [pos, k] of T.sk) L.push({ key: 't_' + k, t: 'sk', n: DEF.skills['t_' + k].name, max: 5, lv: PL[+pos[0]], pos, flag: (DEF.skills['t_' + k].metadata || {}).unlock || null });
    return L.map((N, i) => [N, i]).sort((a, b) => a[0].lv - b[0].lv || a[1] - b[1]).map(a => a[0]); }
  L.push({ key: kind + ':trait', t: 'trait', n: '特性', max: 1, lv: PL[1] }); L.push({ key: kind + ':mast', t: 'mast', n: T.mast, max: 5, lv: PL[1] });
  if (T.third) L.push({ key: kind + ':third', t: 'third', n: T.third[0], max: 5, lv: PL[1] });
  for (const [pos, k] of T.sk) { const tier = +pos[0], col = pos[1], pre = tier > 1 && tier < 4 ? T.sk.find(s => s[0] === (tier - 1) + col) : null;
    L.push({ key: 't_' + k, t: 'sk', n: DEF.skills['t_' + k].name, max: 5, lv: PL[tier], pre: pre ? 't_' + pre[1] : null, pos, pre3: tier === 4 ? T.sk.filter(s => s[0][0] === '3').map(s => 't_' + s[1]) : null, flag: (DEF.skills['t_' + k].metadata || {}).unlock || null }); }
  T.sp.forEach(([n], j) => L.push({ key: kind + ':sp' + j, t: 'sp', n, max: 1, lv: PL[1], j }));
  return L; }
const dualOn11 = () => true; // 一開始就能雙持
const PAIR11 = { 短刀: '雙刀', 雙刀: '短刀', 劍: '雙劍', 雙劍: '劍' }; // 同時用得到的兩棵樹，特技只裝一個
function dualMode11(st = Game.st) { const w = gearBy(st.equip && st.equip.weapon, st), o = gearBy(st.equip && st.equip.shield, st); if (!w) return null; const W = GEAR[w.b];
  if (W.slot === 'shield') return '雙盾'; if (!o || GEAR[o.b].slot !== 'weapon') return null; const O = GEAR[o.b];
  if (W.kind === '短刀' && O.kind === '短刀') return '雙刀'; if (W.kind === '劍' && O.kind === '劍') return '雙劍'; return null; }
const mainKind11 = (st = Game.st) => { const w = gearBy(st.equip && st.equip.weapon, st); return w && GEAR[w.b].slot === 'weapon' && TREE11[GEAR[w.b].kind] ? GEAR[w.b].kind : null; };
const curKinds11 = (st = Game.st) => [mainKind11(st), dualMode11(st)].filter(Boolean);
function nodeState11(kind, N, st = Game.st) { const lv = trLv11(N.key, st);
  if (TREE11[kind].dual && !dualOn11(st)) return { ok: false, why: '還不能學' };
  if (lv >= N.max) return { ok: false, why: '已經學滿', full: 1 };
  if ((st.lv || 1) < N.lv) return { ok: false, why: 'Lv' + N.lv + ' 開放' };
  if (N.flag && !(st.flags || {})[N.flag]) return { ok: false, why: '要先完成「' + UNLOCK11[N.flag] + '」', lock: 1 };
  if (N.pre && trLv11(N.pre, st) < 3) return { ok: false, why: '要先把「' + DEF.skills[N.pre].name + '」練到 3 級' };
  if (N.pre3 && !N.pre3.some(k => trLv11(k, st) >= 3)) return { ok: false, why: '要先把第三段任一招練到 3 級' };
  if (trLeft11(st) < 1) return { ok: false, why: '技能點不夠' };
  return { ok: true }; }
const learnedTree11 = (st = Game.st) => Object.keys(tr11(st).lv).filter(k => k.startsWith('t_') && tr11(st).lv[k] > 0 && DEF.skills[k]);

/* ---------- skill library: class skills + the skills of the trees in hand ---------- */
const activeKinds11 = (st = Game.st) => curKinds11(st).concat(COMMON11);
BB.granted = function (st = Game.st) { const out = [], K = activeKinds11(st); for (const id of learnedTree11(st)) { const T = treeOf11(id); if (T && K.includes(T[0]) && !out.includes(id)) out.push(id); } return out; };
BB.available = function (st = Game.st) { return BB.granted(st); };
BB.slots = function (st = Game.st) { const av = BB.available(st), learned = learnedTree11(st), seen = st.slotSeen || (st.slotSeen = {});
  const s = (st.slots || []).filter(id => av.includes(id) || learned.includes(id)).slice(0, BB.SLOTS);
  for (const id of av) if (!seen[id]) { seen[id] = 1; if (s.length < BB.SLOTS && !s.includes(id)) s.push(id); }
  st.slots = s; return s; };
{ const _nm = BB.nameOf; BB.nameOf = function (st, id) { const T = treeOf11(id); if (!T) return _nm.call(this, st, id); const D = DEF.skills[id]; return D.name + (activeKinds11(st).includes(T[0]) ? '' : '（' + T[0] + '）'); }; }
{ const _so = BB.sourceOf; BB.sourceOf = function (st, id) { const T = treeOf11(id); return T ? T[0] + '技能樹 Lv' + trLv11(id, st) : _so.call(this, st, id); }; }
{ const _si = BB.skillInfo; BB.skillInfo = function (st, id) { const T = treeOf11(id); if (!T) return _si.call(this, st, id); return treeSkillText11(id, st); }; }
function treeSkillText11(id, st = Game.st) { const D = DEF.skills[id], lv = Math.max(1, trLv11(id, st)), kind = D.cat === '變' ? '輔助' : D.cat === '物' ? '物理' : '魔法', mp = (D.costs || []).find(c => c.res === 'mp');
  const pw = D.power && !D.powerOf ? Math.round(D.power * (1 + 0.1 * (lv - 1))) : null, mpv = mp ? (mp.all ? '全部 MP' : 'MP' + (D.power ? mp.amount : Math.max(0, Math.round(mp.amount * (1 - 0.1 * (lv - 1)))))) : '';
  const cd = Math.max(0, (D.cooldown || 0) - (!D.power && lv >= 5 ? 1 : 0));
  return kind + (pw ? '・威力' + pw + (D.hits ? '×' + D.hits[0] : '') : '') + (mpv ? '・' + mpv : '') + (cd ? '・冷卻' + cd : '') + (D.prio ? '・搶先' : '') + (D.target === 'all_enemies' ? '・全體' : '') + (D.charge ? '・蓄力' : '') + '　' + D.desc + '　【' + treeOf11(id)[0] + '技能樹 Lv' + lv + '】'; }

/* ---------- the hero in battle ---------- */
// 拳套 (特性): two hits of 75%; 雙持: main hand + off hand (60% +6%/級), the off hand in its own element
{ const d = skillFromMove('attack_f11', { ...MOVES.attack, pow: 30, acc: 100, hits: 2 }, { kind: 'attack', extraTags: ['basic'] }); d.cooldown = 0; d.metadata = { from: 'attack', segMul: 0.75 }; d.effects = d.effects.map((ef, i) => effRegister('skill:attack_f11#e' + i, ef)); defPut('skills', 'attack_f11', d); }
for (const el of ['一般'].concat(EL11)) { const id = 'attack_d11_' + el, d = skillFromMove(id, { ...MOVES.attack, pow: 40, acc: 100 }, { kind: 'attack', extraTags: ['basic', 'dual11'] });
  d.effects = [{ type: 'damage' }, { type: 'damage', power: { f: 'off11' }, el, cond: { tgtAlive: 1 }, kind: 'off11' }].map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); d.cooldown = 0; d.metadata = { from: 'attack' }; defPut('skills', id, d); }
// the off hand's swing gets the same 「雙持」 picture; keep the battle's attack text
PV('tr11', (v, u) => { const mods = [], triggers = [];
  for (const id in v.lv) { const D = DEF.skills[id], n = v.lv[id]; if (!D || n <= 1) continue; if (D.power) mods.push({ stage: 'skill', who: 'attacker', mul: 1 + 0.1 * (n - 1), cond: { skillIs: id } });
    else { mods.push({ costMul: Math.max(0.5, 1 - 0.1 * (n - 1)), res: 'mp', cond: { skillIs: id } }); if (n >= 5) mods.push({ stage: 'skill', cdAdd: -1, cond: { skillIs: id } }); } }
  if (v.aff > 1) mods.push({ stage: 'skill', who: 'attacker', mul: v.aff, cond: { tag: 'tree11' } });
  if (v.mast > 0) mods.push({ stage: 'equipment', who: 'attacker', mul: 1 + v.mast, cond: { hasPower: 1 } });
  const T = new Set(v.traits || []);
  if (T.has('劍')) triggers.push({ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { crit: 1, evHit: 1, tgtSide: 'enemy' }, limit: { perAction: 1 }, effects: [{ type: 'hunt_chip', target: 'event_target', n: 1, why: 'sword11' }] });
  if (T.has('短刀')) mods.push({ stHit: 15 });
  if (T.has('斧')) triggers.push({ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { tag: 'basic', evHit: 1, tgtSide: 'enemy' }, limit: { perAction: 1 }, effects: [{ type: 'hunt_chip', target: 'event_target', n: 1, why: 'axe11' }] });
  if (T.has('長槍')) mods.push({ stage: 'equipment', who: 'attacker', mul: 1.2, cond: { tgtStatus: 'broken', hasPower: 1 } });
  if (T.has('法杖') && DEF.passives.weakUp) { const r = DEF.passives.weakUp.make(15, u); mods.push(...(r.mods || [])); triggers.push(...(r.triggers || [])); }
  if (T.has('魔導書')) mods.push({ costMul: 0.8, res: 'mp' });
  if (T.has('樂器')) mods.push({ tr11Long: 1 });
  if (T.has('火槍')) mods.push({ stage: 'attacker', who: 'attacker', firstRoundPrio: 1 });
  if (T.has('雙刀')) mods.push({ stage: 'skill', who: 'attacker', mul: 1.1, cond: { tag: 'multi_hit' } });
  if (T.has('雙劍')) triggers.push({ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { crit: 1, evHit: 1, tgtSide: 'enemy', hasPower: 1 }, limit: { perAction: 1 }, effects: [{ type: 'damage', target: 'event_target', power: 30, cond: { tgtAlive: 1 }, kind: 'follow', tags: ['follow'] }] });
  if (T.has('雙盾')) { mods.push({ stage: 'final', who: 'defender', mul: 0.8, cond: { guarding: 1, hasPower: 1 } }); triggers.push({ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, chance: 0.3, limit: { perAction: 1 }, effects: [{ type: 'counter', mul: { f: 'cnt11', v: 40 }, why: 'shield11' }] }); }
  // 職業退場：拳套的特性帶「氣」、雙盾的特性帶「守勢」、火槍的特性帶「砲台」（照原本職業的規則，不含職業被動）
  const OLD11 = c => CLS12[c].make({ data: { rules: {} } });
  if (T.has('拳套')) triggers.push(...OLD11('monk').triggers); if (T.has('雙盾')) triggers.push(...OLD11('guardian').triggers); if (T.has('火槍')) triggers.push(...OLD11('machinist').triggers);
  if (T.has('拳套')) mods.push({ stage: 'attacker', who: 'attacker', crit: true, cond: { actFlag: 'chiCrit', hasPower: 1 } });
  if (v.shield) { mods.push({ stage: 'skill', who: 'attacker', atkMul: { f: 'shield11' }, cond: { hasPower: 1 } }); mods.push({ stage: 'final', who: 'defender', mul: 0.3, cond: { ownerHasStatus: 'charging', hasPower: 1 } }); }
  // 流光連斬・雙星十字: every critical hit chips the shield
  triggers.push({ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { skillIs: 't_sdFlow', crit: 1, evHit: 1, tgtSide: 'enemy' }, effects: [{ type: 'hunt_chip', target: 'event_target', n: 1, why: 'flow11' }] });
  triggers.push({ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { skillIs: 't_dsStar', crit: 1, evHit: 1, tgtSide: 'enemy' }, effects: [{ type: 'hunt_chip', target: 'event_target', n: 1, why: 'star11' }] });
  // 幻影連斬: each critical hit adds a stack; 狂刃 ends with 物防 −2
  triggers.push({ on: EVT.DAMAGE, phase: 'POST', role: 'src', cond: { skillIs: 't_dsPhantom', crit: 1, evHit: 1 }, effects: [{ type: 'status', target: 'self', status: 'phantom11', delta: 1, quiet: 1 }] });
  triggers.push({ on: EVT.STATUS_EXPIRE, phase: 'POST', cond: { statusIs: 'frenzy11' }, effects: [{ type: 'stage', target: 'self', stats: { def: -2 } }] });
  return { mods, triggers }; }, { n: '技能樹' });
PV('tr11Thrift', v => FREECAST(v / 100), { n: '省力' });
PV('cm11', v => { const mods = [], triggers = []; if (v.big) mods.push({ stage: 'talent', who: 'attacker', mul: 1 + v.big / 100, cond: { tgtBig: 1, hasPower: 1 } });
  if (v.regen) triggers.push({ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'heal', target: 'self', pct: v.regen / 100, kind: 'regen', quiet: 1 }] });
  if (v.mpRegen) triggers.push({ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'resource', target: 'self', res: 'mp', pct: v.mpRegen / 100, min: 1, why: 'regen' }] });
  return { mods, triggers }; }, { n: '共通技能樹' });
for (const id of ['chi', 'stance']) { const R = DEF.resources[id], A = R.appliesTo; R.appliesTo = (u, s) => A(u, s) || (u.hero && !!(s.data && s.data['res11_' + id])); }
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!st) return s;
    const av = BB.available(st); s.skills = s.skills.filter(id => id === s.data.sigSkill || av.includes(id)); s.data.slots = (s.data.slots || []).filter(id => av.includes(id));
    s.passives = s.passives.filter(p => p.key !== 'affinity');
    const K = curKinds11(st), T = tr11(st), lv = {}; for (const id of av) if (treeOf11(id)) lv[id] = T.lv[id] || 1;
    const aff = () => 1; // 職業退場：武器親和拿掉
    let mast = 0; for (const k of K) mast += 0.03 * trLv11(k + ':mast', st) * (TREE11[k].dual ? 0 : 1);
    const traits = K.filter(k => trLv11(k + ':trait', st) > 0), dm = dualMode11(st);
    s.passives.push({ key: 'tr11', v: { lv, aff: K.length ? Math.max(...K.map(aff)) : 1, mast, traits, shield: dm === '雙盾' }, src: 'tree' });
    for (const k of traits) { if (k === '拳套') s.data.res11_chi = 1; if (k === '雙盾') s.data.res11_stance = 1; }
    const CL = id => trLv11('cm:' + id, st); s.passives.push({ key: 'cm11', v: { big: 3 * CL('cmBig'), regen: CL('cmRegen'), mpRegen: CL('cmMpRegen') }, src: 'tree' });
    if (K.includes('法杖') && trLv11('法杖:third', st)) s.passives.push({ key: 'tr11Thrift', v: 4 * trLv11('法杖:third', st), src: 'tree' });
    s.data.mechanics = s.data.mechanics.filter(m => !/^wk_|^uw_/.test(m)); s.data.uniq = null;
    if (K.includes('拳套')) s.data.attackSkill = trLv11('拳套:trait', st) ? 'attack_f11' : s.data.attackSkill === 'attack_2' ? 'attack' : s.data.attackSkill;
    if (dm) { const off = gearBy(st.equip.shield, st), oel = off && off.el ? off.el : '一般'; if (dm !== '雙盾' || (off && GEAR[off.b].slot === 'shield')) s.data.attackSkill = 'attack_d11_' + (dm === '雙盾' ? '一般' : oel);
      s.data.offMul11 = 0.6 + (dm === '雙盾' ? 0 : 0.06 * trLv11(dm + ':mast', st)); }
    if (dm === '雙盾') { s.data.shield11 = 1 + 0.03 * trLv11('雙盾:mast', st); s.data.attackName = '盾擊'; s.data.attackFx = (typeof FX !== 'undefined' && FX.shieldBash) ? 'shieldBash' : s.data.attackFx; s.data.wkind = '雙盾'; s.stats.wkind = '雙盾'; }
    // the special: the main tree's equipped one, else the dual tree's
    s.wsp = null; s.data.wspSkill = null; s.data.wspName = null;
    const w = gearBy(st.equip.weapon, st), tier = clamp((w && GEAR[w.b].t) || 1, 1, 7), mag = s.data.wcat === '特';
    for (const k of K) { const j = T.eq[k]; if (j == null || !trLv11(k + ':sp' + j, st)) continue; const [n, type] = TREE11[k].sp[j];
      s.wsp = { N: Math.max(2, (SPN11[type] || 4) - (trLv11('cm:cmSpCut', st) ? 1 : 0)) }; s.data.wspSkill = spId11(k, j, tier, mag); s.data.wspName = n; s.data.wspFx = 'sp11_' + TREE_KINDS11.indexOf(k) + '_' + j; break; }
    return s; }; }
// stat passives of the trees in hand
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); if (!st || !st.equip) return s; const K = curKinds11(st), L = k => K.includes(k) ? trLv11(k + ':third', st) : 0;
    if (L('劍')) s.crit = (s.crit || 0) + 2 * L('劍'); if (L('短刀')) s.eva = (s.eva || 0) + 2 * L('短刀'); if (L('斧')) s.hp = Math.floor(s.hp * (1 + 0.03 * L('斧')));
    if (L('長槍')) s.spe += L('長槍'); if (L('拳套')) s.def = Math.floor(s.def * (1 + 0.03 * L('拳套'))); if (L('魔導書')) s.mpRegen = (s.mpRegen || 0) + L('魔導書');
    if (L('樂器')) s.healUp = (s.healUp || 0) + 4 * L('樂器'); if (L('火槍')) s.critDmg = (s.critDmg || 0) + 5 * L('火槍');
    if (K.includes('雙刀') && trLv11('雙刀:trait', st)) s.spe += 3;
    // 共通樹的能力（百分比＝能力 ×(1+n%)，固定值直接加）
    for (const k of COMMON11) for (const [id, , , , , E] of TREE11[k].nodes) { const n = trLv11('cm:' + id, st); if (!n) continue;
      for (const a in E.p || {}) s[a] = Math.floor(s[a] * (1 + E.p[a] * n / 100)); for (const a in E.f || {}) s[a] = (s[a] || 0) + E.f[a] * n; }
    return s; }; }
// the old weapon skills, passives, specials and the borrowed off-hand skill are gone
for (const k in WSK) delete WSK[k];

/* ---------- 雙持：裝備 ---------- */
ONE_HAND.add('盾');
const offOk11 = (g, st = Game.st) => { const B = GEAR[g.b], w = gearBy(st.equip && st.equip.weapon, st); if (B.slot === 'shield') return true; if (B.slot !== 'weapon' || !dualOn11(st) || !w) return false; const W = GEAR[w.b]; return W.slot === 'weapon' && ['短刀', '劍'].includes(W.kind) && W.kind === B.kind; };
const mainOk11 = (g, st = Game.st) => { const B = GEAR[g.b]; return B.slot === 'weapon' || (B.slot === 'shield' && dualOn11(st)); };
function dualFix11(st = Game.st) { const o = gearBy(st.equip && st.equip.shield, st); if (o && GEAR[o.b].slot === 'weapon' && !offOk11(o, st)) { st.equip.shield = null; return true; } return false; }
// the equipment picker of 05b with the 雙持 rules: 主手 = weapons or (雙持) shields; 副手 = shields or the same kind of 短刀／劍
function* equipPick11(sl, fit) {
  const st = Game.st, cur = gearBy(st.equip[sl]);
  const own = gearSort().filter(g => fit(g, st) && (!isEquipped(g) || g === cur));
  const opts = own.map(g => ({ g })).concat([{ g: null }]); let hi = Math.max(0, own.indexOf(cur)), top = 0; const VIS = 5;
  const scr = { touchBack: true, draw(x) {
    screenBG(x); headerBar(x, '更換' + (sl === 'weapon' ? '主手' : '副手')); Font.drawR(x, 'A裝上　→詳情', W - 6, 3, UIC.muted, UIC.textSh, 9);
    top = clamp(hi - 2, 0, Math.max(0, opts.length - VIS)); drawWin(x, 4, 22, 168, VIS * 18 + 8, 'menu');
    opts.slice(top, top + VIS).forEach((o, k) => { const i = top + k, Y = 26 + k * 18; if (i === hi) selBar(x, 6, Y - 1, 164, 17);
      Font.draw(x, o.g ? GEAR[o.g.b].n : '卸下', 14, Y, o.g ? gCol(o.g) : UIC.muted, UIC.textSh, 11); if (o.g === cur && cur) Font.drawR(x, '裝備中', 164, Y + 1, UIC.accent, UIC.textSh, 9); else if (o.g) Font.drawR(x, GEAR[o.g.b].slot === 'shield' ? '盾' : GEAR[o.g.b].kind || '', 164, Y + 1, UIC.muted, UIC.textSh, 9);
      touchRegion(6, Y - 1, 164, 17, () => { if (hi === i) tapKey('a'); else hi = i; }); });
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (top + VIS < opts.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 18 + 3);
    const o = opts[hi], Y0 = 22 + VIS * 18 + 12; drawWin(x, 4, Y0, 168, H - Y0 - 4, 'menu');
    { const wim = o.g && GEAR[o.g.b].slot === 'weapon' && typeof weaponPx === 'function' ? weaponPx(o.g.gl || o.g.b) || weaponPx(o.g.b) : null; if (wim) drawWeaponIcon(x, wim, 154, Y0 + 26, 2); }
    const before = heroStats(), sv = st.equip[sl]; st.equip[sl] = o.g ? o.g.u : null; const after = heroStats(), m = dualMode11(st); st.equip[sl] = sv;
    const d = ['hp', 'mp', 'atk', 'def', 'spa', 'spd', 'spe', 'crit'].map(k => [k, Math.round((after[k] - before[k]) * 10) / 10]).filter(([, v]) => v);
    Font.draw(x, '裝上後的變化' + (m ? '（' + m + '）' : ''), 10, Y0 + 3, UIC.accent, UIC.textSh, 10);
    if (!d.length) Font.draw(x, '能力沒有變化', 12, Y0 + 17, UIC.muted, UIC.textSh, 10);
    d.slice(0, 8).forEach(([k, v], i) => { const X = 12 + (i % 2) * 62, Y = Y0 + 17 + Math.floor(i / 2) * 13; Font.draw(x, (k === 'mp' ? 'MP' : k === 'crit' ? '會心' : STAT_NAMES[k]), X, Y, UIC.muted, UIC.textSh, 10); Font.drawR(x, (v > 0 ? '+' : '') + v + (k === 'crit' ? '%' : ''), X + 56, Y, v > 0 ? UIC.good : UIC.bad, UIC.textSh, 10); });
    if (o.g) Font.drawR(x, '→ 詳情', 166, H - 17, UIC.accent, UIC.textSh, 9);
  } };
  UI.push(scr);
  while (true) {
    if (Input.repeat('up')) { hi = (hi + opts.length - 1) % opts.length; Sound.sfx('cursor'); } if (Input.repeat('down')) { hi = (hi + 1) % opts.length; Sound.sfx('cursor'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; }
    if (Input.pressed('right') && opts[hi].g) { Sound.sfx('select'); UI.remove(scr); yield* gearInfoScreen(opts[hi].g); UI.push(scr); }
    if (Input.pressed('a')) { Input.consume('a'); const o = opts[hi]; for (const k in st.equip) if (o.g && st.equip[k] === o.g.u) st.equip[k] = null; st.equip[sl] = o.g ? o.g.u : null; clampHP(); Sound.sfx('item'); break; }
    yield; }
  UI.remove(scr); }
{ const _ep = equipPick; equipPick = function* (sl) { const st = Game.st;
    if (!((sl === 'shield' || sl === 'weapon') && dualOn11(st))) { yield* _ep.call(this, sl); if (dualFix11(st)) { clampHP(); yield* say('副手的武器跟主手不同種，卸下了。'); } return; }
    if (sl === 'shield' && clsV7(st.cls) === 'otherworlder') { Sound.sfx('bump'); yield* say('異界勇者不能使用副手。'); return; }
    if (sl === 'shield' && !shieldOk(st)) { Sound.sfx('bump'); yield* say('雙手武器不能用副手。\n（劍、斧、短刀、盾才能配副手）'); return; }
    const m0 = dualMode11(st); yield* equipPick11(sl, sl === 'weapon' ? mainOk11 : offOk11);
    if (typeof shieldFix === 'function' && shieldFix(st)) { clampHP(); yield* say('雙手武器不能配副手，副手卸下了。'); } if (dualFix11(st)) { clampHP(); yield* say('副手的武器跟主手不同種，卸下了。'); }
    const m = dualMode11(st); if (m && m !== m0) yield* say('現在是「' + m + '」！' + (trLeft11(st) > 0 ? '\n（選單→技能→武器技能樹 可以學' + m + '的招式）' : '')); }; }
{ const _so = startOverworld; startOverworld = function (...a) { if (Game.st) dualFix11(Game.st); return _so.apply(this, a); }; }

/* ---------- 雙持：戰鬥中的樣子（現有的武器圖和盾牌圖） ----------
   副手武器＝同一把武器圖左右翻轉拿在左手；盾牌（側面圖）掛在左手，雙盾時右手也拿一面。HAND11 是戰鬥小人每個姿勢的手的位置。 */
const HAND11 = { L: { idle1: [11.5, 38.5], idle2: [11.5, 39.5], attack1: [10.5, 37.5], attack2: [13.5, 35], cast1: [9.5, 27.5], hurt1: [9.5, 34.5], guard1: [11.5, 32.5] },
  R: { idle1: [26.5, 37.5], idle2: [26.5, 38.5], attack1: [28.5, 27.5], attack2: [28.5, 26.5], cast1: [26.5, 37.5], hurt1: [27.5, 34.5], guard1: [27.5, 31.5] } };
{ const _hl = heroLookOf; heroLookOf = function (st = Game.st, over = {}) { const L = _hl(st, over); if (!st || !st.equip) return L;
    const eq = { ...st.equip, ...over }, kOf = g => g ? (g.gl && GEAR[g.gl] ? g.gl : g.b) : null, wk = kOf(gearBy(eq.weapon, st)), ok = kOf(gearBy(eq.shield, st));
    if (ok && GEAR[ok] && GEAR[ok].slot === 'weapon') { delete L.skey; if (GEAR[ok].look) L.owpn = GEAR[ok].look; }
    if (wk && GEAR[wk] && GEAR[wk].slot === 'shield') { L.weapon = null; delete L.wkey; L.mshd = wk; if (ok && GEAR[ok] && GEAR[ok].slot === 'shield') L.skey = ok; }
    return L; }; }
{ const _hc = heroChibiImg, cache = {}; heroChibiImg = function (pose, L) {
    if (!L || !(L.owpn || L.skey || L.mshd)) return _hc(pose, L);
    const key = pose + lookKey(L); if (cache[key]) return cache[key];
    const base = _hc(pose, { ...L, owpn: undefined, skey: undefined, mshd: undefined }), M = HERO_PX_META, w = M.w, h = M.h, c = mkCanvas(base.width, base.height), x = c.getContext('2d');
    const hl = HAND11.L[pose] || HAND11.L.idle1, hr = HAND11.R[pose] || HAND11.R.idle1; x.imageSmoothingEnabled = false; x.drawImage(base, 0, 0);
    const Wp = L.owpn; if (Wp && HERO_PX[Wp[0]]) { const im = heroLayer(Wp[0], 'weapon', WPN_PAL[Wp[1]] || {}, Wp[1]); if (im) { const fi = Math.max(0, M.poses.indexOf('idle1')), n = mkCanvas(w, h), nx = n.getContext('2d');
        nx.translate(w, 0); nx.scale(-1, 1); nx.drawImage(im, fi * w, 0, w, h, 0, 0, w, h); // the right-hand weapon of the standing pose, mirrored: its grip lands on the left hand
        x.drawImage(n, Math.round(hl[0] - 11.5 - 1) * 2, Math.round(hl[1] - 37.5) * 2, w * 2, h * 2); } }
    const shd = (k, P, flip) => { const im = k && ((typeof shieldSide === 'function' && shieldSide(k)) || shieldSprite(k)); if (!im) return; const X = flip ? P[0] - 2 : P[0] - im.width + 2, Y = P[1] - 8;
      x.save(); if (flip) { x.translate((X + im.width) * 2, Y * 2); x.scale(-1, 1); x.drawImage(im, 0, 0, im.width * 2, im.height * 2); } else x.drawImage(im, X * 2, Y * 2, im.width * 2, im.height * 2); x.restore(); };
    shd(L.skey, hl, false); shd(L.mshd, hr, true);
    return (cache[key] = c); }; }

/* ---------- 舊存檔：武器專屬技能退場（每招退 1 點） ---------- */
{ const _so = startOverworld; startOverworld = function (...a) { const st = Game.st; let L = [];
    if (st && st.cls !== undefined && !st.tr11v) { st.tr11v = 1; tr11(st); let n = 0; for (const k in st.skillLib || {}) { const e = st.skillLib[k]; if (!e || !e.learned) continue; if (k.startsWith('u_') || (ORB_A[k] && !SK9_CLS[k])) n++; }
      st.trRef11 = n; delete st.sub; st.slots = (st.slots || []).filter(id => DEF.skills[id] && (DEF.skills[id].tags || []).includes('cls9'));
      L.push('（武器技能改版了！）', '每種武器有了自己的技能樹，用技能點學招式（等級＋主線頭目各 1 點' + (n ? '；學會過的武器技能退還 ' + n + ' 點' : '') + '）。', '選單→技能→武器技能樹。'); }
    const ow = _so.apply(this, a); if (L.length && ow && ow.run) ow.run((function* () { yield* wait(30); yield* sayAll(L); })()); return ow; }; }
{ const _ng = newGameState; newGameState = function (...a) { const st = _ng.apply(this, a); if (st) { st.tr11v = 1; st.tr11 = { lv: {}, eq: {}, rs: 0 }; st.trRef11 = 0; } return st; }; }

/* ---------- 選單→技能：技能編排／武器技能樹 ---------- */
function treeRows11(kind, st = Game.st) { return treeNodes11(kind).concat([{ t: 'reset', key: 'reset', n: '重置技能點' }]); }
function treeInfo11(kind, N, st = Game.st) { const T = TREE11[kind], lv = trLv11(N.key, st), s = N.t === 'reset' ? null : nodeState11(kind, N, st);
  if (N.t === 'reset') return '把全部技能點收回來重新分配（所有樹）。第一次免費，之後要用「遺忘之書」（有 ' + ((st.bag || {}).talentReset || 0) + ' 個；沒有的話用重生之水）。';
  let t = '';
  if (N.t === 'cp') t = N.n + '：' + N.d + '。' + (N.max > 1 ? '現在 Lv' + lv + '/' + N.max + '。' : lv ? '（已學會）' : '') + '（共通：用什麼武器都有效）';
  else if (N.t === 'trait') t = '特性：' + T.trait + '。（用' + kind + '時有效）';
  else if (N.t === 'mast') t = N.n + '：' + (T.dual ? T.mastD : '用' + kind + '時傷害 +3%／級') + '。現在 Lv' + lv + '/5。';
  else if (N.t === 'third') t = T.third[0] + '：' + T.third[1] + '（用' + kind + '時有效）。現在 Lv' + lv + '/5。';
  else if (N.t === 'sk') t = treeSkillText11(N.key, st) + (lv ? '' : '（還沒學）');
  else if (N.t === 'sp') { const [n, k] = T.sp[N.j]; t = '特技「' + n + '」：普通攻擊累積層數後自動發動：' + SP_TXT11[k] + '。威力跟著武器的階級。' + (lv ? (tr11(st).eq[kind] === N.j ? '【裝備中】' : '　A：裝上') : ''); }
  if (s && !s.ok && !s.full) t += '\n（' + s.why + '）'; else if (s && s.ok) t += '\nA：' + (lv ? '升級' : '學習') + '（1 點）';
  return t; }
function* treeScreen11(start) { const st = Game.st, kinds = () => TREE_KINDS11.filter(k => !TREE11[k].dual || dualOn11(st)); let ti = Math.max(0, kinds().indexOf(start || curKinds11(st)[0] || '劍')), sel = 0;
  const scr = { touchBack: true, draw(x) { const K = kinds(), kind = K[ti], R = treeRows11(kind, st), VIS = 10, i = Math.min(sel, R.length - 1), top = clamp(i - 4, 0, Math.max(0, R.length - VIS));
    screenBG(x); headerBar(x, TREE11[kind].common ? kind + '樹（共通）' : kind + '樹' + (curKinds11(st).includes(kind) ? '（使用中）' : '')); Font.drawR(x, '剩 ' + trLeft11(st) + ' 點　←→', W - 6, 3, trLeft11(st) ? UIC.warm : UIC.muted, UIC.textSh, 9);
    drawWin(x, 4, 22, 168, VIS * 14 + 8, 'menu');
    R.slice(top, top + VIS).forEach((N, k) => { const Y = 26 + k * 14, lv = N.t === 'reset' ? 0 : trLv11(N.key, st), s = N.t === 'reset' ? { ok: true } : nodeState11(kind, N, st); if (top + k === i) selBar(x, 6, Y - 1, 164, 13);
      const tag = N.t === 'sk' ? (N.pos[0] === '4' ? '絕技' : N.pos[0] + '段' + '①②③'['abc'.indexOf(N.pos[1])]) : N.t === 'sp' ? '特技' : N.t === 'reset' ? '' : N.t === 'cp' ? N.tier + '段' : '被動';
      Font.draw(x, tag, 10, Y, UIC.muted, UIC.textSh, 8); const col = N.t === 'reset' ? UIC.warm : lv ? (N.t === 'sp' && tr11(st).eq[kind] === N.j ? '#ffd860' : '#c8f0ff') : s.ok ? UIC.text : UIC.dis;
      Font.draw(x, N.n, 40, Y - 1, col, UIC.textSh, 10); if (N.t !== 'reset') Font.drawR(x, lv ? 'Lv' + lv + (N.max > 1 ? '/' + N.max : '') : s.ok ? '可學' : (s.why || '').replace(/^要先把.*/, '前置').replace(/^要先完成.*/, '未解鎖').slice(0, 8), 166, Y, lv ? UIC.accent : UIC.muted, UIC.textSh, 8);
      if (typeof touchRegion === 'function') touchRegion(6, Y - 1, 164, 13, () => { if (sel === top + k) tapKey('a'); else { sel = top + k; Sound.sfx('cursor'); } }); });
    if (top > 0) x.drawImage(UPARROW, 86, 23); if (top + VIS < R.length) x.drawImage(DOWNARROW, 86, 22 + VIS * 14 + 3);
    const Y0 = 22 + VIS * 14 + 12; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu'); drawFitText(x, treeInfo11(kind, R[i], st), 10, Y0 + 4, 152, 252 - Y0 - 8, 10, UIC.text);
    if (typeof touchRegion === 'function') { touchRegion(0, 0, 40, 21, () => tapKey('left')); touchRegion(W - 60, 0, 60, 21, () => tapKey('right')); } } };
  UI.push(scr);
  while (true) { const K = kinds(), kind = K[ti], R = treeRows11(kind, st);
    if (Input.pressed('left') || Input.pressed('right')) { const d = Input.pressed('left') ? -1 : 1; Input.consume('left', 'right'); ti = (ti + d + K.length) % K.length; sel = 0; Sound.sfx('cursor'); }
    if (Input.repeat('up') && sel > 0) { sel--; Sound.sfx('cursor'); } if (Input.repeat('down') && sel < R.length - 1) { sel++; Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); const N = R[sel];
      if (N.t === 'reset') { UI.remove(scr); yield* treeReset11(); UI.push(scr); }
      else { const lv = trLv11(N.key, st), s = nodeState11(kind, N, st);
        if (N.t === 'sp' && lv) { tr11(st).eq[kind] = tr11(st).eq[kind] === N.j ? null : N.j; if (tr11(st).eq[kind] != null && PAIR11[kind]) tr11(st).eq[PAIR11[kind]] = null; Sound.sfx('select'); }
        else if (s.ok) { tr11(st).lv[N.key] = lv + 1; if (N.t === 'sp' && tr11(st).eq[kind] == null && (!PAIR11[kind] || tr11(st).eq[PAIR11[kind]] == null)) tr11(st).eq[kind] = N.j; Sound.sfx(lv ? 'statUp' : 'select'); if (N.t === 'sk' && !lv) BB.slots(st); clampHP(); }
        else Sound.sfx('bump'); } }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr); }
function* treeReset11() { const st = Game.st, T = tr11(st); if (!trSpent11(st)) { yield* say('還沒有用掉任何技能點。'); return; }
  const free = !(T.rs > 0), have = (st.bag || {}).attrReset || 0;
  if (!free && !have) { yield* say('第二次以後的重置要用「重生之水」。'); return; }
  if (!(yield* yesNo('把全部技能點收回來嗎？' + (free ? '（第一次免費）' : '（用掉 1 個重生之水）')))) return;
  if (!free) { st.bag.attrReset--; if (!st.bag.attrReset) delete st.bag.attrReset; } T.lv = {}; T.eq = {}; T.rs = (T.rs || 0) + 1; st.slots = (st.slots || []).filter(id => !treeOf11(id)); clampHP(); Sound.jingle('item'); yield* say('技能點全部收回來了。'); }
{ const _ts = skillTreeScreen; skillTreeScreen = function* () { const st = Game.st;
    while (true) { const n = trLeft11(st), r = yield* ask('技能', ['技能編排', '技能樹' + (n ? '（剩 ' + n + ' 點）' : ''), '返回']); if (r === 0) yield* _ts(); else if (r === 1) yield* treeScreen11(); else break; } }; }
// the menu dot: unspent tree points
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st || Game.st; if (st && (Game.frame || 0) % 30 === 0) st.skp = trLeft11(st); return _up.apply(this, a); }; }
GROW12.push(['武器技能樹', '每種武器有自己的技能樹（選單→技能→武器技能樹）。技能點＝等級＋主線頭目各 1 點；只能用身上武器那棵樹的招。副手欄放同種的第二把短刀（雙刀）或劍（雙劍），或主手、副手都拿盾（雙盾），就能用雙持的樹。']);

/* ---------- help texts ---------- */
{ const fix = (k, t) => { const i = GROW12.findIndex(q => q[0] === k); if (i >= 0) GROW12[i][1] = t; };
  fix('技能練度', '職業技能每用一次練度 +1：用滿第一格之後，再用 6 次可以進化「改」，再用 24 次進化「極」。修練之書：練度 +12。武器技能樹的招式用技能點升級（1〜5 級）。');
  fix('裝備', '鐵匠「打造」：用素材點數打底裝，品質決定潛力和晶石孔。「賦予」：用潛力和點數加上能力（物攻、會心、屬性…）。晶石、幻化、分解也在鐵匠。');
  fix('裝備的效果', '防具分重甲、輕裝、法衣，每件各有自己的規則；其他能力靠賦予和晶石。全部的效果和數字，在冒險手冊的「效果一覽」。'); }
if (typeof BATTLE_HELP !== 'undefined') for (const b of BATTLE_HELP) {
  if (b[0] === '技能與冷卻') b[1] = b[1].map(t => t.replace('和武器（裝備就能用）。每用一次練度 +1', '和武器技能樹（用技能點學，只能用身上武器那棵樹的招）。職業技能每用一次練度 +1'));
  if (b[0] === '武器技能') b[1] = ['每種武器有自己的技能樹：用技能點學招式（選單→技能→武器技能樹），只能用身上武器那棵樹的招；技能點＝等級＋主線頭目各 1 點。', '特技：在技能樹學會、選一個裝上。普通攻擊累積層數，滿了就自動發動（戰鬥畫面右下角的◆）。', '普通攻擊不花MP，命中時回復最大MP的12%；技能用完要冷卻，冷卻中就用普攻回MP。', '短刀的普攻是 2 段；拳套學會特性後打兩下；雙持時副手也會出手。武器的屬性在鐵匠賦予。']; }
{ const _el = effectLines9; effectLines9 = function () { const L = _el(), i = L.findIndex(l => /^【武器被動】/.test(l[0])); if (i >= 0) L.splice(i);
    const H = t => L.push([t, UIC.accent, 10, 0]), P = t => { for (const l of Font.wrap(t, 150, 10)) L.push([l, UIC.text, 10, 6]); };
    H('【賦予】（每一格；點數 × 裝備階級）'); for (const k in EN11) { const E = EN11[k]; P(E[0] + '：+' + E[1] + E[2] + '，潛力 ' + E[3] + '・' + E[4] + ' ' + E[5] + '（上限 +' + E[1] * E[6] + E[2] + '）'); } P('屬性（只有武器）：火・水・雷・草選一種，潛力 ' + ELPOT11 + '・魔素 ' + ELPTS11);
    H('【武器種特性】（技能樹裡學）'); for (const k of TREE_KINDS11) P(k + '：' + TREE11[k].trait);
    return L; }; }
