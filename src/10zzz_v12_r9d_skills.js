/* ===================== v12.0.9d 第九輪（四）：職業技能各自獨立（〈第九輪提案〉第二步 A，玩家 2026-10-04「開始動工吧」） =====================
   每個職業的 8 招職業技能換成自己的招式（共 80 招，分 3 版做）。每招都會累積、消耗或看自己的職業資源。
   - 學習等級照舊 Lv1／4／8／12／16／20／26／32，等級到了直接學會；練度・改・極照舊（附加的選項照原本那一格的技能）。
   - 職業技能只有在那個職業時能放進技能欄；換回來就能再用。
   - 舊的 39 招不再從職業學到；已經學會的留在技能庫，跟武器技能一樣任何職業都能用（時停的冷卻 0 → 3）。
   - 每招有自己的特效：施法、動作、收尾、顏色都照招式名字，不跟別招重複。
   第一版（v237）：劍士・魔導士・守護者・遊俠；第二版（v238）：吟遊詩人・機工士・武僧；第三版（v239）：龍騎士・異界勇者・魔劍士。
   v239 也修正「無視物防」：攻防比最多變成 3 倍（原本無視全部物防會除以 1，傷害約 100 倍；墮星槍的會心也是這樣）。 */

/* ---------- conditions, formulas, effect types the new skills use ---------- */
BV_TAGS.add('cls9'); BV_TAGS.add('noSigil9'); // class skills (only usable in their own class) · 天體崩落 is not remembered as a sigil
Object.assign(COND, {
  tgtNoStatus9: (c, v) => !!c.tgt && !c.core.hasStatus(c.tgt, v),
  noSigil9: (c, v) => { const u = c.src || c.owner; return !!u && !((u.data.sigils || []).includes(v)); },
});
// 潛伏: the next attack counts as「目標還沒行動」
{ const f = COND.tgtNotActed; COND.tgtNotActed = (c, v) => (!!c.tgt && !!c.owner && c.owner === c.src && c.core.hasStatus(c.owner, 'lurk9')) ? !!v : f(c, v); }
// 天體崩落 takes the last sigil's element; it is not remembered as a new sigil itself
{ const f = COND.elemSkill; COND.elemSkill = (c, v) => !!c.skill && c.skill.tags.includes('noSigil9') ? !v : f(c, v); }
const actV9 = (c, k) => (c.core.act && c.core.act[k]) || 0;
Object.assign(BR.FORMULA, {
  tenpu9: c => { const u = c.src; return (u.max.ki || 0) > 0 && (u.res.ki || 0) >= u.max.ki ? 0.4 : 0.7; },
  sigRing9: c => 1 + 0.2 * ((c.src.res.sigil) || 0),
  holyMend9: c => 0.25 + 0.05 * (((c.owner || c.src).res.stance) || 0),
  retaliate9: c => 70 + 15 * actV9(c, 'rev9'),
  judgeAtk9: c => (c.src.stats.atk + c.src.stats.def) / Math.max(1, c.src.stats.atk),
  markCrit9: c => 10 * BV12.markOf(c.core, c.src, c.tgt),
  shade9: c => 1 + 0.3 * actV9(c, 'shade9'),
});
// 詠唱護壁・霜火交錯: remember these elements as sigils (same rules as 咒印: different elements, at most 3)
EFFECT_TYPES.sigil_push9 = { exec(core, ef, ctx) { const u = ctx.owner; if (!u || !('sigil' in u.res)) return;
  const els = ef.els === 'weapon' ? [u.data.welem && u.data.welem !== '一般' ? u.data.welem : '火'] : ef.els || [];
  for (const el of els) { const L = u.data.sigils || (u.data.sigils = []), dup = core.rule(u, 'sigilDup') ? 2 : 1; if (L.filter(x => x === el).length >= dup || L.length >= u.max.sigil) continue; L.push(el); core.changeRes(u, 'sigil', 1, { why: 'sigil:' + el }); }
  const need = core.rule(u, 'elemKing') ? 2 : 3; if (new Set(u.data.sigils || []).size >= need && !core.hasStatus(u, 'elem_burst')) core.applyStatus(u, u, 'elem_burst', {}); } };
{ const D = EFFECT_TYPES.damage.exec; EFFECT_TYPES.damage.exec = function (core, ef, ctx, tg) { if (ef.elLastSig9) { const L = (ctx.owner && ctx.owner.data.sigils) || []; ef = { ...ef, elLastSig9: 0 }; if (L.length) ef.el = L[L.length - 1]; } return D.call(this, core, ef, ctx, tg); }; }

/* ---------- statuses ---------- */
defPut('statuses', 'kiCounter9', { tags: ['buff'], duration: 'until_own_action', clearAt: 'owner_action_start', stack: 'refresh', metadata: { n: '迎擊' },
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { srcSide: 'enemy', hasPower: 1, cat: '物', ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', skill: 'sw9_counter', why: 'kiCounter' }] }] });
defPut('statuses', 'shieldCounter9', { tags: ['buff'], duration: 'until_own_action', clearAt: 'owner_action_start', stack: 'refresh', metadata: { n: '架盾' },
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', reaction: 1, cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 },
    effects: [{ type: 'counter', skill: 'gd9_counter', why: 'shieldCounter' }, { type: 'gain', target: 'self', res: 'stance', n: 1, why: 'shieldCounter' }] }] });
defPut('statuses', 'bulwark9', { tags: ['buff', 'guard'], duration: 'owner_actions', durDefault: 3, tick: 'owner_action_start', stack: 'refresh', metadata: { n: '不動' },
  mods: [{ stage: 'final', who: 'defender', mul: 0.6, cond: { hasPower: 1 } }, { stage: 'defender', who: 'defender', critAdd: -999, critTaken: 0 }] });
defPut('statuses', 'lurk9', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '潛伏' } });
// the counters (reactions): 迎擊 power 80 and a sure crit; 架盾反擊 power 60
for (const [id, n, pow, crit] of [['sw9_counter', '迎擊', 80, 1], ['gd9_counter', '架盾反擊', 60, 0]]) {
  const D = defPut('skills', id, { ...skillFromMove(id, { ...MOVES.slash, n, pow, acc: null }, { kind: 'attack', extraTags: ['reaction', 'counter'] }) });
  D.cooldown = 0; D.mods = crit ? [{ stage: 'skill', who: 'attacker', crit: true }] : []; D.effects = D.effects.map((ef, i) => effRegister('skill:' + id + '#e' + i, ef)); D.after = D.after.map((ef, i) => effRegister('skill:' + id + '#a' + i, ef)); }

/* ---------- the skill table: Lv order, [key, name, power, hits, cooldown, MP, attribute [key, per point], category, element, area, description, evolution, extra] ---------- */
const GAIN9 = (res, n, x = {}) => ({ type: 'gain', target: 'self', res, n, ...x });
const SK9 = {
  swordsman: [
    ['sw9Tread', '踏斬', 55, 0, 1, 3, ['str', 1], '物', '一般', 0, '踏步斬下。命中時劍意 +2（一般命中只 +1）。', { B: ['spe+1', 'hit+1'] },
      { effects: [{ type: 'damage' }, GAIN9('ki', 1, { cap: 2, why: 'tread' })] }],
    ['sw9Meteor', '流星連刃', 30, 2, 1, 4, ['agi', 1], '物', '一般', 0, '流星般落下的連斬，2 段；劍意 3 以上時多 1 段。', { B: ['spe+1', 'hit+1'] },
      { hitsOf: (core, u) => (u.res.ki || 0) >= 3 ? 3 : 2 }],
    ['sw9Sheathe', '納刀', 0, 0, 2, 3, null, '變', '一般', 0, '收刀進入防禦姿勢：到下次行動前受到的傷害 −50%，劍意 +1（不會因防禦失去劍意）。', { A: ['atk+1', 'cheap'], B: ['def+1', 'spe+1'] },
      { effects: [{ type: 'status', target: 'self', status: 'guard' }, GAIN9('ki', 1, { why: 'sheathe' })] }],
    ['sw9Whirl', '旋風斬', 64, 0, 1, 5, ['str', 1], '物', '一般', 1, '迴旋的一斬打全體。每打出一次會心，劍意 +1。', { B: ['fatk-1', 'atk+1'] }, {}],
    ['sw9Riposte', '迎擊架勢', 0, 0, 2, 4, null, '變', '一般', 0, '消耗 1 劍意擺出架勢：到下次行動前，被物理攻擊時反擊（威力 80，必定會心）。', { A: ['cheap', 'atk+1'], B: ['spe+1', 'mp:3'] },
      { costs: [{ res: 'ki', amount: 1 }], effects: [{ type: 'status', target: 'self', status: 'kiCounter9' }] }],
    ['sw9Tsubame', '燕返・斷', 84, 0, 2, 6, ['str', 1], '物', '一般', 0, '燕子回身般的一斬。劍意 2 以上時消耗 2 點：威力 ×1.5、必定會心。', { B: ['spec+1', 'crit'] },
      { onPrepare: (core, u, cmd) => { if ((u.res.ki || 0) >= 2) { core.changeRes(u, 'ki', -2, { why: 'cost' }); cmd.tsubame9 = 1; } },
        mods: [{ stage: 'skill', who: 'attacker', mul: 1.5, cond: { actFlag: 'tsubame9' } }, { stage: 'skill', who: 'attacker', crit: true, cond: { actFlag: 'tsubame9' } }] }],
    ['sw9Tenpu', '天穿', 94, 0, 2, 6, ['dex', 1], '物', '一般', 0, '貫穿天際的突刺，無視 30% 物防；劍意全滿時無視 60%。', { B: ['fdef-1', 'crit'] },
      { mods: [{ stage: 'skill', who: 'attacker', defMul: { f: 'tenpu9' } }] }],
    ['sw9Mujin', '極意・無塵', 120, 0, 3, 8, ['str', 1.5], '物', '一般', 0, '劍意 4 以上才能用（不消耗劍意）。斬過不留塵埃的一刀，會心傷害 +50%。', { B: ['atk+1', 'drain:15'] },
      { requires: { ownerResAtLeast: ['ki', 4] }, reqText: '劍意要 4 以上才能用！', mods: [{ stage: 'skill', who: 'attacker', critDmg: 50 }] }],
  ],
  mage: [
    ['mg9FlameArrow', '焰矢', 52, 0, 1, 3, ['int', 1], '特', '火', 0, '火屬性的魔法箭，20% 灼傷；還沒有火咒印時威力 +20%。', { B: ['brn:30', 'cheap'] },
      { mods: [{ stage: 'skill', who: 'attacker', mul: 1.2, cond: { noSigil9: '火' } }], effects: [{ type: 'damage' }, { type: 'status', status: 'brn', chance: 0.2, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1 } }] }],
    ['mg9MirrorArrow', '水鏡箭', 58, 0, 1, 4, ['int', 1], '特', '水', 0, '水鏡凝成的魔法箭。命中讓目標潮濕 2 回合。', { B: ['wet', 'fspd-1'] },
      { effects: [{ type: 'damage' }, { type: 'status', status: 'wet', dur: 2, cond: { tgtAlive: 1 } }] }],
    ['mg9Violet', '紫電', 56, 0, 1, 4, ['int', 1], '特', '雷', 1, '紫色的雷電打全體，10% 麻痺；對潮濕的魔物 40%。', { B: ['par:25', 'spec+1'] },
      { effects: [{ type: 'damage' }, { type: 'status', status: 'par', chance: 0.1, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1, tgtNoStatus9: 'wet' } }, { type: 'status', status: 'par', chance: 0.4, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1, tgtStatus: 'wet' } }] }],
    ['mg9Thorn', '棘藤咒', 62, 0, 1, 5, ['int', 1], '特', '草', 1, '從地面竄出的荊棘藤打全體，30% 纏繞。', { B: ['tangle', 'drain:15'] },
      { effects: [{ type: 'damage' }, { type: 'status', status: 'tangle', chance: 0.3, secondary: true, cond: { tgtAlive: 1 } }] }],
    ['mg9ChantWall', '詠唱護壁', 0, 0, 2, 5, null, '變', '一般', 0, '詠唱展開護盾 2 行動，並記下 1 個咒印（武器的屬性；一般武器記火）。', { A: ['shield:1', 'shield:1'], B: ['spd+1', 'mp:3'] },
      { effects: [{ type: 'status', target: 'self', status: 'barrier', dur: 2 }, { type: 'sigil_push9', els: 'weapon' }] }],
    ['mg9SigilRing', '咒環爆', 70, 0, 2, 6, ['int', 1], '特', '一般', 1, '咒印化成光環炸開，打全體；每有 1 個咒印威力 +20%（不消耗咒印）。', { B: ['brn:30', 'spa+1'] },
      { mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'sigRing9' } }] }],
    ['mg9FrostFire', '霜火交錯', 45, 2, 2, 7, ['int', 1], '特', '火', 0, '第 1 段火、第 2 段水，一次記下 2 個咒印；第 2 段打中灼傷的魔物 ×1.3。', { B: ['wet', 'fspe-1'] },
      { effects: [{ type: 'damage', el: '火', cond: { firstHit: 1 } }, { type: 'damage', el: '水', cond: { firstHit: 0 } }], mods: [{ stage: 'skill', who: 'attacker', mul: 1.3, cond: { firstHit: 0, tgtStatus: 'brn' } }],
        after: [{ type: 'sigil_push9', els: ['火', '水'] }] }],
    ['mg9Celestial', '天體崩落', 118, 0, 3, 11, ['int', 1], '特', '一般', 1, '讓星空崩落下來打全體。屬性是最後記下的咒印；元素爆發中威力再 +30%。', { B: ['brn:40', 'cheap'] },
      { tags: ['noSigil9'], effects: [{ type: 'damage', elLastSig9: 1 }], mods: [{ stage: 'skill', who: 'attacker', mul: 1.3, cond: { ownerHasStatus: 'elem_burst' } }] }],
  ],
  guardian: [
    ['gd9ShieldKnock', '鐵盾叩', 58, 0, 1, 3, ['vit', 1], '物', '一般', 0, '用盾敲下去，攻擊力用「物攻＋物防÷2」；命中時守勢 +1。', { B: ['fdef-1', 'fatk-1'] },
      { mods: [{ stage: 'skill', who: 'attacker', atkMul: { f: 'guardAtk' } }], effects: [{ type: 'damage' }, GAIN9('stance', 1, { why: 'knock' })] }],
    ['gd9ShieldCounter', '架盾反擊', 0, 0, 2, 4, null, '變', '一般', 0, '舉盾進入防禦姿勢：到下次行動前，每被攻擊一次就反擊（威力 60），每次守勢 +1。', { A: ['spd+1', 'cheap'], B: ['shield:1', 'def+1'] },
      { effects: [{ type: 'status', target: 'self', status: 'guard' }, { type: 'status', target: 'self', status: 'shieldCounter9' }] }],
    ['gd9HoldFast', '固守', 0, 0, 2, 4, null, '變', '一般', 0, '穩住腳步：守勢 +2，物防 +1（3 行動）。', { A: ['spd+1', 'cheap'], B: ['heal+15', 'shield:1'] },
      { effects: [GAIN9('stance', 2, { why: 'hold' }), { type: 'stage', target: 'self', stats: { def: 1 }, dur: 3 }] }],
    ['gd9ShieldSweep', '重盾橫掃', 62, 0, 1, 5, ['vit', 1], '物', '一般', 1, '揮盾橫掃全體，攻擊力同鐵盾叩；守勢 3 以上時 30% 退縮。', { B: ['fatk-1', 'def+1'] },
      { mods: [{ stage: 'skill', who: 'attacker', atkMul: { f: 'guardAtk' } }], effects: [{ type: 'damage' }, { type: 'status', status: 'flinch', chance: 0.3, secondary: true, cond: { tgtAlive: 1, ownerResAtLeast: ['stance', 3] } }] }],
    ['gd9HolyMend', '聖療', 0, 0, 2, 5, null, '變', '一般', 0, '聖光治療：回復 25% HP，每點守勢再 +5%（不消耗守勢）。', { A: ['heal+25', 'heal+25'], B: ['cure', 'shield:1'] },
      { tags: ['heal'], effects: [{ type: 'heal', target: 'self', pct: { f: 'holyMend9' } }] }],
    ['gd9Retaliate', '報復之錘', 70, 0, 2, 6, ['str', 1], '物', '一般', 0, '把受過的打擊還回去：消耗一半守勢（捨去小數），每點威力 +15。', { B: ['shield:1', 'drain:20'] },
      { powerOf: 'retaliate9', onPrepare: (core, u, cmd) => { const n = Math.floor((u.res.stance || 0) / 2); if (n) { core.changeRes(u, 'stance', -n, { why: 'cost' }); cmd.rev9 = n; } } }],
    ['gd9Bulwark', '不動城牆', 0, 0, 3, 7, null, '變', '一般', 0, '消耗 3 守勢化成城牆：3 行動內受到的傷害 −40%，不會被打出會心。', { A: ['spd+1', 'cheap'], B: ['heal+15', 'def+1'] },
      { costs: [{ res: 'stance', amount: 3 }], effects: [{ type: 'status', target: 'self', status: 'bulwark9', dur: 3 }] }],
    ['gd9Judgment', '審判之槌', 110, 0, 3, 8, ['vit', 1.5], '物', '一般', 0, '降下審判的鐵槌，攻擊力用「物攻＋物防」；守勢 5 以上時目標物防 −2。', { B: ['fdef-1', 'crit'] },
      { mods: [{ stage: 'skill', who: 'attacker', atkMul: { f: 'judgeAtk9' } }], effects: [{ type: 'damage' }, { type: 'stage', stats: { def: -2 }, cond: { tgtAlive: 1, ownerResAtLeast: ['stance', 5] } }] }],
  ],
  ranger: [
    ['rg9Hunt', '追獵刺', 55, 0, 1, 3, ['agi', 1], '物', '一般', 0, '搶先。追上獵物的一刺，命中必定留下 1 層獵印（不管目標行動了沒）。', { B: ['psn:35', 'hit+1'] },
      { prio: 1, effects: [{ type: 'damage' }, { type: 'status', status: 'hunt_mark', cond: { tgtAlive: 1, tgtNotActed: 0 } }] }],
    ['rg9TwinShadow', '雙影', 30, 2, 1, 4, ['agi', 1], '物', '一般', 0, '兩道影子同時出手，2 段；對有獵印的目標，每段會心率 +15%。', { B: ['spe+1', 'hit+1'] },
      { mods: [{ stage: 'skill', who: 'attacker', critAdd: 15, cond: { tgtMarked: 1 } }] }],
    ['rg9Lurk', '潛伏', 0, 0, 2, 3, null, '變', '一般', 0, '躲進煙幕 2 行動；下一次攻擊算作「目標還沒行動」。', { A: ['cheap', 'spe+1'], B: ['spec+1', 'mp:3'] },
      { effects: [{ type: 'status', target: 'self', status: 'smoke', dur: 2 }, { type: 'status', target: 'self', status: 'lurk9' }] }],
    ['rg9Venom', '淬毒刺', 62, 0, 1, 4, ['luk', 1], '物', '一般', 0, '淬了毒的一刺，40% 中毒；打中中毒的魔物獵印 +1。', { B: ['fspe-1', 'crit'] },
      { effects: [{ type: 'damage' }, { type: 'status', status: 'hunt_mark', cond: { tgtAlive: 1, tgtStatus: 'psn' } }, { type: 'status', status: 'psn', chance: 0.4, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1 } }] }],
    ['rg9FanBlade', '扇刃', 60, 0, 1, 5, ['agi', 1], '物', '一般', 1, '扇形撒出飛刃打全體；有獵印的那一隻威力 ×1.3。', { B: ['psn:40', 'crit'] },
      { mods: [{ stage: 'skill', who: 'attacker', mul: 1.3, cond: { tgtMarked: 1 } }] }],
    ['rg9Declare', '獵殺宣告', 72, 0, 2, 5, ['dex', 1], '物', '一般', 0, '宣告下一個獵物。命中獵印 +2（不會引爆）。', { B: ['hit+1', 'fdef-1'] },
      { effects: [{ type: 'damage' }, { type: 'status', status: 'hunt_mark', delta: 2, cond: { tgtAlive: 1 } }] }],
    ['rg9Fatal', '致命一擊', 90, 0, 2, 6, ['luk', 1.5], '物', '一般', 0, '瞄準要害。目標 HP 低於 30% 時威力 ×2；每層獵印會心率 +10%。', { B: ['fdef-1', 'first'] },
      { mods: [{ stage: 'skill', who: 'attacker', mul: 2, cond: { tgtHpBelow: 0.3 } }, { stage: 'skill', who: 'attacker', critAdd: { f: 'markCrit9' } }] }],
    ['rg9ShadowGrave', '影葬', 110, 0, 3, 8, ['luk', 1.5], '物', '一般', 0, '把獵物葬進影子裡：消耗全部獵印，每層威力 +30%（不算引爆）。', { B: ['first', 'psn:35'] },
      { onPrepare: (core, u, cmd) => { const t = core.byId[(cmd.tg || [])[0]]; cmd.shade9 = t ? BV12.markOf(core, u, t) : 0; },
        mods: [{ stage: 'skill', who: 'attacker', powMul: { f: 'shade9' } }], after: [{ type: 'remove_status', target: 'cast_targets', status: 'hunt_mark', why: 'spent' }] }],
  ],
};
// the internal kind of each move (斬擊・突刺・打擊・魔法彈・強化・防護・治療; area skills are 範圍)
const SK9_KIND = { sw9Tread: 'slash', sw9Meteor: 'slash', sw9Sheathe: 'guard', sw9Riposte: 'guard', sw9Tsubame: 'slash', sw9Tenpu: 'pierce', sw9Mujin: 'slash',
  mg9FlameArrow: 'bolt', mg9MirrorArrow: 'bolt', mg9ChantWall: 'guard', mg9FrostFire: 'bolt',
  gd9ShieldKnock: 'strike', gd9ShieldCounter: 'guard', gd9HoldFast: 'buff', gd9HolyMend: 'heal', gd9Retaliate: 'strike', gd9Bulwark: 'guard', gd9Judgment: 'strike',
  rg9Hunt: 'pierce', rg9TwinShadow: 'slash', rg9Lurk: 'buff', rg9Venom: 'pierce', rg9Declare: 'pierce', rg9Fatal: 'pierce', rg9ShadowGrave: 'pierce' };
const SK9_CLS = {}; // skill key → class
const SK9_REQ = {}; // skill id → the text when its requirement is not met
function sk9Build(cls) {
  const L = SK9[cls]; if (!L || L.length !== 8) { bvErr('r9', 'class skills ' + cls); return; }
  L.forEach(([k, n, pow, hits, cd, mp, attr, cat, el, aoe, d, evo, x], i) => {
    const id = 'o_' + k, learn = LEARN_OF_CD[Math.min(3, cd)], tpl = pow ? (cat === '特' ? 'magicBolt' : 'slash') : 'focus';
    ORB_A[k] = { n, tpl, pow, mp, d, B: evo.B, ...(evo.A ? { A: evo.A } : {}), cls9: cls }; SK9_CLS[k] = cls;
    MOVES[id] = { n, d, t: el, cat, pow, acc: pow ? 100 : null, hits: hits || null, cls: aoe ? 'area' : SK9_KIND[k] || (pow ? 'slash' : 'buff'), ...(attr && pow ? { scale: attr } : {}), ...(x.prio ? { prio: 1 } : {}), orb: k, ws: 1, fx: 'c9_' + k };
    SKILL_MP[id] = mp;
    const D = skillFromMove(id, MOVES[id], { kind: 'skill', tpl, extraTags: ['orb', 'cls9'].concat(x.tags || []), costs: (x.costs || []).concat([{ res: 'mp', amount: mp }]), fallback: 'attack' });
    if (!pow) { D.target = x.target || 'self'; D.noHitRoll = true; D.effects = []; D.tags = D.tags.filter(t => t !== 'damage'); }
    if (x.effects) D.effects = x.effects.map(e => ({ ...e })); if (x.after) D.after = x.after.map(e => ({ ...e })); if (x.mods) D.mods = D.mods.concat(x.mods);
    for (const f of ['hitsOf', 'onPrepare', 'powerOf', 'requires', 'targetOf', 'catOf']) if (x[f]) D[f] = x[f];
    if (x.charge) { D.charge = true; D.airborne = !!x.airborne; if (!D.tags.includes('charge')) D.tags.push('charge'); }
    if (x.reqText) SK9_REQ[id] = x.reqText;
    Object.assign(D, { cooldown: cd, prio: x.prio ? 1 : 0, fx: 'c9_' + k, metadata: { orb: k, tpl, learn, cls9: cls, lv9: CLASS_SKILL_LV[i] } });
    D.effects = D.effects.map((ef, j) => effRegister('skill:' + id + '#e' + j, ef)); D.after = D.after.map((ef, j) => effRegister('skill:' + id + '#a' + j, ef));
    defPut('skills', id, { ...D, override: 1 });
  });
  CLASS_SKILLS12[cls] = L.map(r => r[0]);
}
// the class-wide triggers of the new skills (旋風斬's 劍意 per crit; 潛伏 ends with the next attack)
defPut('mechanics', 'cls9sk', { layer: 'class', make: u => ({ triggers: [
  TRG(EVT.DAMAGE, 'src', { skillIs: 'o_sw9Whirl', crit: 1, evHit: 1, tgtSide: 'enemy' }, [GAIN('ki', 1, 0, { why: 'whirl' })]),
  TRG(EVT.SKILL_SUCCESS, 'src', { hasPower: 1, ownerHasStatus: 'lurk9' }, [{ type: 'remove_status', target: 'self', status: 'lurk9', why: 'used' }]),
] }) });
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); s.data.mechanics.push('cls9sk'); return s; }; }

/* ---------- 職業技能只在自己的職業能用；舊的 39 招照舊留在技能庫 ---------- */
{ const _av = BB.available; BB.available = function (st = Game.st) { const c = clsV7(st.cls); return _av.call(this, st).filter(id => { const k = id.startsWith('o_') ? id.slice(2) : null; return !k || !SK9_CLS[k] || SK9_CLS[k] === c; }); }; }
if (DEF.skills.o_chronoLock) DEF.skills.o_chronoLock.cooldown = 3; // 時停：冷卻 0 → 3
{ const _cu = Battle.prototype.canUse; Battle.prototype.canUse = function (id) { const r = _cu.call(this, id); if (!r.ok && SK9_REQ[id] && r.short === '不可用') return { ok: false, why: SK9_REQ[id], short: '條件不足' }; return r; }; }
{ const H = Battle.prototype.handlers, _sf = H.SKILL_FAIL; H.SKILL_FAIL = function* (e, s, t, P) { if (s && s.hero && P.why === 'requires' && SK9_REQ[P.skill]) { yield* this.msg(SK9_REQ[P.skill].replace(/！$/, '') + '，' + s.n + '改用普通攻擊！', { hold: 26 }); return; } yield* _sf.call(this, e, s, t, P); }; }

/* ---------- the pictures: each skill its own cast, move, finisher and colours ---------- */
const ln9 = (b, x1, y1, x2, y2, c, h, w = 5, life = 12) => { b.spawn({ k: 'line', x1, y1, x2, y2, c, w, grow: 3, life }); b.spawn({ k: 'line', x1, y1, x2, y2, c: h, w: Math.max(1, w - 3), grow: 3, life: life - 2 }); };
const imp9 = (b, T, S, big) => { const [c, h] = S.col; b.spawn({ k: 'glow', x: T.x, y: T.y, r: big ? 26 : 16, c, life: 12 }); b.spawn({ k: 'ring', x: T.x, y: T.y, r0: 3, r1: big ? 28 : 18, c: h, w: 2, life: 10 }); w12Particle(b, T.x, T.y, S, big ? 12 : 8, big ? 22 : 14); };
const grp9 = (b, T, t) => t && t.group ? t.group.map(v => b.center(v)) : [T];
const zig9 = (b, x1, y1, x2, y2, c, w = 3, n = 6, life = 10) => { let px = x1, py = y1; for (let i = 1; i <= n; i++) { const nx = lerp(x1, x2, i / n) + (i < n ? rnd(-6, 6) : 0), ny = lerp(y1, y2, i / n); b.spawn({ k: 'line', x1: px, y1: py, x2: nx, y2: ny, c, w, grow: 1, life }); px = nx; py = ny; } };
const FX9 = {
  /* ----- 劍士 ----- */
  sw9Tread: { col: ['#d8b070', '#fff4d8', '#7a5a30'], pt: 'dust', cast: 'draw', fin: 'cut', snd: 'hitSuper', // a stamp that cracks the ground, then a cut straight down
    *f(S, U, T, u) { yield* this.lunge(u, 10, 3); Sound.sfx('heavy'); this.spawn({ k: 'ring', x: T.x, y: T.y + 18, r0: 4, r1: 32, c: S.col[2], w: 3, life: 12, fl: 0.35 }); w12Particle(this, T.x, T.y + 16, S, 8, 18); this.shake = Math.max(this.shake, 5); yield* wait(3);
      Sound.sfx('slash'); ln9(this, T.x - 4, T.y - 28, T.x + 4, T.y + 20, S.col[0], S.col[1], 6); yield* wait(4); imp9(this, T, S); yield* wait(8); } },
  sw9Meteor: { col: ['#ffd27a', '#ffffff', '#b07a30'], pt: 'star', cast: 'dash', fin: 'none', snd: 'slash', // blades falling like meteors
    *f(S, U, T, u) { yield* this.lunge(u, 8, 2); Sound.sfx('slash'); ln9(this, T.x + 34, T.y - 40, T.x - 6, T.y + 6, S.col[0], S.col[1], 4); this.star(T.x - 6, T.y + 6, S.col[1], 10); yield* wait(4); imp9(this, T, S); yield* wait(6); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); const o = (i % 2 ? -10 : 10); ln9(this, T.x + 30 + o, T.y - 42, T.x - 8 + o, T.y + 4, S.col[0], S.col[1], 3); this.star(T.x - 8 + o, T.y + 4, S.col[1], 10); w12Particle(this, T.x + o, T.y, S, 4, 8); yield* wait(5); } },
  sw9Sheathe: { col: ['#b8c8e8', '#ffffff', '#506080'], pt: 'spark2', cast: 'still', snd: 'tick', // the blade slides home: a gleam along it, then a click
    *f(S, U) { Sound.sfx('slash'); const g = this.spawn({ k: 'line', x1: U.x + 30, y1: U.y - 8, x2: U.x - 6, y2: U.y + 6, c: S.col[1], w: 2, grow: 8, life: 14 }); yield* wait(10); Sound.sfx('tick');
      this.spawn({ k: 'ring', x: U.x - 4, y: U.y + 6, r0: 2, r1: 16, c: S.col[0], w: 2, life: 10 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 26 - i * 4, r1: 14 - i * 3, c: i % 2 ? S.col[1] : S.col[0], life: 16 }); yield* wait(12); } },
  sw9Whirl: { col: ['#8ae8b8', '#f0fff8', '#2a7a50'], pt: 'wind', cast: 'dash', fin: 'gust', snd: 'wind', // one spinning cut around the whole group
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 3); Sound.sfx('wind'); for (let k = 0; k < 3; k++) { this.spawn({ k: 'ring', x: T.x, y: T.y + 4, r0: 50 - k * 10, r1: 20 + k * 6, c: k % 2 ? S.col[1] : S.col[0], w: 3, life: 14, fl: 0.4 }); yield* wait(2); }
      Sound.sfx('slash'); for (const C of grp9(this, T, t)) { this.spawn({ k: 'cres', x: C.x, y: C.y, r: 16, ang: Math.random() * 6, c: S.col[1], c2: S.col[0], w: 5, life: 12 }); w12Particle(this, C.x, C.y, S, 5, 10); } yield* wait(10); } },
  sw9Riposte: { col: ['#ff9a50', '#fff0d0', '#a04a20'], pt: 'spark', cast: 'focus', snd: 'charge', // two blades crossed in front, waiting
    *f(S, U) { Sound.sfx('slash'); const X = U.x + 22, Y = U.y - 4; ln9(this, X - 12, Y - 14, X + 12, Y + 14, S.col[0], S.col[1], 4, 22); ln9(this, X + 12, Y - 14, X - 12, Y + 14, S.col[0], S.col[1], 4, 22); yield* wait(6);
      this.spawn({ k: 'ring', x: X, y: Y, r0: 22, r1: 6, c: S.col[1], w: 2, life: 14 }); this.star(X, Y, S.col[1], 14); yield* wait(12); } },
  sw9Tsubame: { col: ['#6aa8ff', '#e8f4ff', '#1a3a80'], pt: 'feather', cast: 'draw', fin: 'xcut', snd: 'crit', // down, then back up: a swallow's V
    *f(S, U, T, u) { yield* this.lunge(u, 10, 2); Sound.sfx('slash'); ln9(this, T.x - 22, T.y - 24, T.x, T.y + 14, S.col[0], S.col[1], 5); yield* wait(3); Sound.sfx('slash'); ln9(this, T.x, T.y + 14, T.x + 24, T.y - 26, S.col[0], S.col[1], 5);
      for (let i = 0; i < 6; i++) this.spawn({ k: 'line', x1: T.x + 24, y1: T.y - 26, x2: T.x + 24 + rnd(-10, 14), y2: T.y - 26 + rnd(-10, 6), c: S.col[1], w: 1, grow: 2, life: 12 }); yield* wait(4); imp9(this, T, S, 1); yield* wait(8); } },
  sw9Tenpu: { col: ['#c0a0ff', '#ffffff', '#4a2a8a'], pt: 'ray', cast: 'still', fin: 'pop', snd: 'crit', // a thrust that goes up through the sky
    *f(S, U, T, u) { yield* this.lunge(u, 16, 3); Sound.sfx('slash'); ln9(this, T.x, T.y + 24, T.x, T.y - 60, S.col[0], S.col[1], 5); this.spawn({ k: 'beam', x: T.x, y1: T.y + 20, w: 8, h: 120, c: S.col[1], life: 12 });
      this.spawn({ k: 'rays', x: T.x, y: T.y, n: 8, a0: 0, len: 22, c: S.col[0], life: 14 }); yield* wait(5); imp9(this, T, S, 1); yield* wait(8); } },
  sw9Mujin: { col: ['#f4f6ff', '#ffffff', '#8890a8'], pt: 'spark', cast: 'still', fin: 'iai', snd: 'crit', // stillness, a hundred thin lines at once, then everything falls apart
    *f(S, U, T, u) { this.spawn({ k: 'dark', a: 0.6, life: 30 }); yield* wait(8); Sound.sfx('slash'); for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.2; this.spawn({ k: 'line', x1: T.x - Math.cos(a) * 34, y1: T.y - Math.sin(a) * 26, x2: T.x + Math.cos(a) * 34, y2: T.y + Math.sin(a) * 26, c: S.col[1], w: 1, grow: 1, life: 18 }); }
      yield* wait(10); this.spawn({ k: 'flash', c: '#ffffff', a: 0.5, life: 6 }); imp9(this, T, S, 1); yield* wait(8); } },
  /* ----- 魔導士 ----- */
  mg9FlameArrow: { col: ['#ff7a2a', '#ffe0a0', '#b03010'], pt: 'flame', cast: 'rune', fin: 'explode', snd: 'fire', // a burning arrow
    *f(S, U, T) { Sound.sfx('fire'); const x0 = U.x + 8, y0 = U.y - 12, F = 8; for (let i = 1; i <= F; i++) { const x = lerp(x0, T.x, i / F), y = lerp(y0, T.y, i / F), px = lerp(x0, T.x, (i - 1) / F), py = lerp(y0, T.y, (i - 1) / F);
        this.spawn({ k: 'line', x1: px - (x - px) * 1.5, y1: py - (y - py) * 1.5, x2: x, y2: y, c: S.col[0], w: 3, grow: 1, life: 6 }); this.spawn({ k: 'flame', x: px, y: py, vy: -0.8, s: 3, life: 10 }); yield; } imp9(this, T, S); yield* wait(6); } },
  mg9MirrorArrow: { col: ['#60d0ff', '#f0ffff', '#2a70b0'], pt: 'shard', cast: 'rune', fin: 'splash', snd: 'water', // an arrow of water that breaks like a mirror
    *f(S, U, T) { Sound.sfx('water'); const x0 = U.x + 8, y0 = U.y - 12, F = 8; for (let i = 1; i <= F; i++) { const x = lerp(x0, T.x, i / F), y = lerp(y0, T.y, i / F); this.spawn({ k: 'line', x1: lerp(x0, T.x, (i - 2) / F), y1: lerp(y0, T.y, (i - 2) / F), x2: x, y2: y, c: S.col[1], w: 2, grow: 1, life: 6 }); if (i % 2) this.spawn({ k: 'circ', x, y, r: 2, c: S.col[0], vy: 0.4, life: 10 }); yield; }
      Sound.sfx('crit'); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; this.spawn({ k: 'shard', g: 0.1, x: T.x, y: T.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2 - 1, s: rnd(3, 5), c: i % 2 ? S.col[1] : S.col[0], life: 22 }); } this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 20, c: S.col[1], life: 12 }); yield* wait(8); } },
  mg9Violet: { col: ['#c070ff', '#f4e0ff', '#5a2090'], pt: 'hex', cast: 'sky', fin: 'none', snd: 'thunder', // violet lightning on every foe
    *f(S, U, T, u, t) { for (const C of grp9(this, T, t)) { Sound.sfx('thunder'); zig9(this, C.x + rnd(-8, 8), 0, C.x, C.y, S.col[0], 4); zig9(this, C.x + rnd(-8, 8), 0, C.x, C.y, S.col[1], 1); this.spawn({ k: 'flash', c: S.col[1], a: 0.2, life: 4 }); imp9(this, C, S); yield* wait(4); } yield* wait(8); } },
  mg9Thorn: { col: ['#4aa040', '#d8ffb0', '#3a2a10'], pt: 'leaf', cast: 'rune', fin: 'leaves', snd: 'leaf', // thorny vines burst out of the ground under them
    *f(S, U, T, u, t) { Sound.sfx('leaf'); const G = grp9(this, T, t); for (let k = 0; k < 5; k++) { for (const C of G) { const x = C.x + rnd(-16, 16), top = C.y - 18 - k * 5; this.spawn({ k: 'line', x1: x, y1: C.y + 24, x2: x + rnd(-8, 8), y2: top, c: k % 2 ? S.col[2] : S.col[0], w: 4, grow: 6, life: 22 }); this.spawn({ k: 'line', x1: x + 2, y1: top + 8, x2: x + 7, y2: top + 3, c: S.col[1], w: 2, grow: 6, life: 18 }); } yield* wait(3); }
      for (const C of G) this.spawn({ k: 'ring', x: C.x, y: C.y + 4, r0: 22, r1: 10, c: S.col[0], w: 2, life: 14, fl: 0.5 }); yield* wait(10); } },
  mg9ChantWall: { col: ['#a0c8ff', '#ffffff', '#4060c0'], pt: 'rune', cast: 'rune', snd: 'charge', // a chanted circle that rises into a dome
    *f(S, U) { Sound.sfx('charge'); this.spawn({ k: 'rune', x: U.x, y: U.y + 12, r: 26, c: S.col[0], c2: S.col[1], n: 8, poly: 6, life: 26 }); yield* wait(6); for (let i = 0; i < 3; i++) { this.spawn({ k: 'hex', x: U.x, y: U.y - i * 4, r0: 8, r1: 26 + i * 2, c: i % 2 ? S.col[1] : S.col[0], life: 16 }); yield* wait(3); } w12Particle(this, U.x, U.y, S, 6, 18); yield* wait(10); } },
  mg9SigilRing: { col: ['#ff60c0', '#ffe0f4', '#802060'], pt: 'crest', cast: 'rune', fin: 'nova', snd: 'charge', // rings of sigils close in, then burst
    *f(S, U, T, u, t) { Sound.sfx('charge'); const G = grp9(this, T, t); for (const C of G) { this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 30, r1: 4, c: S.col[0], w: 2, life: 14 }); this.spawn({ k: 'hex', x: C.x, y: C.y, r0: 24, r1: 6, c: S.col[1], life: 14 }); } yield* wait(12);
      Sound.sfx('hitSuper'); for (const C of G) imp9(this, C, S, 1); yield* wait(8); } },
  mg9FrostFire: { col: ['#ff6030', '#a8e8ff', '#2a4a90'], pt: 'ember', cast: 'rune', fin: 'none', snd: 'fire', // a fire stroke, then a frost stroke across it
    *f(S, U, T) { Sound.sfx('fire'); ln9(this, T.x - 22, T.y - 20, T.x + 20, T.y + 18, '#ff6030', '#ffe0a0', 5); for (let i = 0; i < 6; i++) this.spawn({ k: 'flame', x: T.x + rnd(-14, 14), y: T.y + rnd(-10, 12), vy: -1, s: 3, life: 14 }); yield* wait(6); },
    *h(S, U, T) { Sound.sfx('water'); ln9(this, T.x + 22, T.y - 20, T.x - 20, T.y + 18, '#6ab8ff', '#e8f8ff', 5); for (let i = 0; i < 6; i++) { const a = Math.random() * 7; this.spawn({ k: 'line', x1: T.x, y1: T.y, x2: T.x + Math.cos(a) * 12, y2: T.y + Math.sin(a) * 12, c: '#c8f0ff', w: 2, grow: 1, life: 12 }); } this.spawn({ k: 'flash', c: '#c8f0ff', a: 0.2, life: 5 }); yield* wait(6); } },
  mg9Celestial: { col: ['#ffd060', '#ffffff', '#40307a'], pt: 'star', cast: 'sky', fin: 'impact', snd: 'quake', // the night sky comes down
    *f(S, U, T, u, t) { this.spawn({ k: 'dark', a: 0.55, c: '#0a0828', life: 40 }); for (let i = 0; i < 14; i++) this.star(rnd(8, W - 8), rnd(6, 40), i % 2 ? S.col[1] : S.col[0], 30); yield* wait(10);
      for (const C of grp9(this, T, t)) { Sound.sfx('fire'); ln9(this, C.x + 30, C.y - 80, C.x, C.y, S.col[0], S.col[1], 7); yield* wait(3); imp9(this, C, S, 1); } this.shake = Math.max(this.shake, 10); yield* wait(10); } },
  /* ----- 守護者 ----- */
  gd9ShieldKnock: { col: ['#a8b8d0', '#ffffff', '#505a70'], pt: 'crest', cast: 'hex', fin: 'bash', snd: 'heavy', // the shield's face stamped on the foe
    *f(S, U, T, u) { yield* this.lunge(u, 14, 3); Sound.sfx('shield'); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 18, r1: 6, c: S.col[1], life: 12 }); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 12, r1: 22, c: S.col[0], life: 12 }); this.shake = Math.max(this.shake, 4); yield* wait(4); imp9(this, T, S); yield* wait(8); } },
  gd9ShieldCounter: { col: ['#ffb050', '#fff0d0', '#8a5020'], pt: 'spark', cast: 'hex', snd: 'shield', // a raised shield with spikes of light, waiting for the hit
    *f(S, U) { Sound.sfx('shield'); const X = U.x + 20; for (let i = 0; i < 2; i++) this.spawn({ k: 'hex', x: X, y: U.y, r0: 6, r1: 20 - i * 6, c: i ? S.col[1] : S.col[0], life: 22 }); yield* wait(4);
      for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; this.spawn({ k: 'line', x1: X + Math.cos(a) * 16, y1: U.y + Math.sin(a) * 16, x2: X + Math.cos(a) * 30, y2: U.y + Math.sin(a) * 30, c: S.col[1], w: 2, grow: 4, life: 14 }); } yield* wait(12); } },
  gd9HoldFast: { col: ['#9aaa70', '#eef4d8', '#4a5038'], pt: 'rock', cast: 'hex', snd: 'rock', // feet planted: stones rise and settle around
    *f(S, U) { Sound.sfx('rock'); for (let i = 0; i < 8; i++) this.spawn({ k: 'shard', g: 0.2, x: U.x + rnd(-24, 24), y: U.y + 22, vx: 0, vy: -rnd(15, 30) / 10, s: rnd(3, 5), c: i % 2 ? S.col[0] : S.col[2], life: 20 }); yield* wait(6);
      this.spawn({ k: 'ring', x: U.x, y: U.y + 22, r0: 30, r1: 12, c: S.col[0], w: 3, life: 14, fl: 0.35 }); this.shake = Math.max(this.shake, 3); yield* wait(12); } },
  gd9ShieldSweep: { col: ['#6a8ab8', '#e0ecff', '#2a3a60'], pt: 'shard', cast: 'hex', fin: 'shatter', snd: 'heavy', // one wide sweep of the shield across them all
    *f(S, U, T, u, t) { yield* this.lunge(u, 12, 3); Sound.sfx('slash'); this.spawn({ k: 'cres', x: T.x, y: T.y + 8, r: 46, ang: 1.57, c: S.col[1], c2: S.col[0], w: 8, life: 16 }); yield* wait(5); for (const C of grp9(this, T, t)) { this.spawn({ k: 'hex', x: C.x, y: C.y, r0: 6, r1: 16, c: S.col[1], life: 10 }); imp9(this, C, S); } this.shake = Math.max(this.shake, 6); yield* wait(8); } },
  gd9HolyMend: { col: ['#ffe890', '#ffffff', '#c09030'], pt: 'spark', cast: 'halo', snd: 'heal', // holy light from above
    *f(S, U) { Sound.sfx('heal'); this.spawn({ k: 'rays', x: U.x, y: U.y - 10, n: 10, a0: 0, len: 30, c: S.col[0], life: 22 }); for (let i = 0; i < 10; i++) this.spawn({ k: 'txt', s: '+', x: U.x + rnd(-20, 18), y: U.y + rnd(0, 22), vy: -0.7, c: i % 2 ? S.col[0] : S.col[1], life: 24, fade: 1 }); yield* wait(18); } },
  gd9Retaliate: { col: ['#e04a3a', '#ffc0a0', '#701810'], pt: 'ember', cast: 'aura', fin: 'crimson', snd: 'heavy', // a red hammer swung down from overhead
    *f(S, U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('heavy'); ln9(this, T.x - 30, T.y - 34, T.x + 2, T.y + 4, S.col[0], S.col[1], 9); yield* wait(3); this.spawn({ k: 'shock', x: T.x, y: T.y + 22, r0: 6, r1: 50, c: S.col[0], life: 16 }); this.shake = Math.max(this.shake, 10); imp9(this, T, S, 1); yield* wait(10); } },
  gd9Bulwark: { col: ['#c0a070', '#fff0d0', '#6a5030'], pt: 'rock', cast: 'hex', snd: 'quake', // a stone wall rises between the hero and the foes, row by row
    *f(S, U) { Sound.sfx('quake'); const Y = U.y - 26; for (let r = 0; r < 4; r++) { const y = Y + 12 - r * 8, off = r % 2 ? 6 : 0; for (let b = -3; b <= 2; b++) { const x = U.x + b * 12 + off; this.spawn({ k: 'line', x1: x, y1: y, x2: x + 10, y2: y, c: (b + r) % 2 ? S.col[0] : S.col[2], w: 6, grow: 2, life: 30 - r * 2 }); }
        this.shake = Math.max(this.shake, 4); yield* wait(3); }
      this.spawn({ k: 'line', x1: U.x - 36, y1: Y - 16, x2: U.x + 36, y2: Y - 16, c: S.col[1], w: 2, grow: 4, life: 20 }); w12Particle(this, U.x, Y, S, 8, 30); yield* wait(14); } },
  gd9Judgment: { col: ['#fff0a0', '#ffffff', '#a08020'], pt: 'ray', cast: 'sky', fin: 'judge', snd: 'quake', // a hammer of light falls from the sky
    *f(S, U, T) { Sound.sfx('charge'); this.spawn({ k: 'pillar', x: T.x, y: T.y + 24, w: 18, h: 160, c: S.col[1], life: 20 }); yield* wait(6); Sound.sfx('heavy'); const B = { x: T.x, y: T.y - 70 }; for (let i = 1; i <= 6; i++) { this.spawn({ k: 'hex', x: B.x, y: lerp(B.y, T.y, i / 6), r0: 10, r1: 14, c: S.col[0], life: 6 }); yield; }
      this.shake = Math.max(this.shake, 12); imp9(this, T, S, 1); yield* wait(10); } },
  /* ----- 遊俠 ----- */
  rg9Hunt: { col: ['#ff6a6a', '#ffe0e0', '#802a2a'], pt: 'claw', cast: 'dash', fin: 'none', snd: 'slash', // a running thrust; a target ring closes on the prey
    *f(S, U, T, u) { for (let i = 0; i < 4; i++) this.spawn({ k: 'glow', x: lerp(U.x, T.x, i / 4), y: lerp(U.y, T.y, i / 4), r: 6, c: S.col[2], life: 8 + i * 2 }); yield* this.lunge(u, 20, 3); Sound.sfx('slash');
      const a = Math.atan2(T.y - U.y, T.x - U.x); ln9(this, T.x - Math.cos(a) * 26, T.y - Math.sin(a) * 26, T.x + Math.cos(a) * 6, T.y + Math.sin(a) * 6, S.col[0], S.col[1], 4); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 22, r1: 6, c: S.col[0], w: 2, life: 14 }); yield* wait(4); imp9(this, T, S); yield* wait(8); } },
  rg9TwinShadow: { col: ['#8a7aa8', '#e8e0ff', '#2a2040'], pt: 'shadow', cast: 'dash', fin: 'none', snd: 'slash', // two shadows cut from both sides
    *f(S, U, T, u) { this.spawn({ k: 'glow', x: T.x - 26, y: T.y, r: 12, c: S.col[2], life: 14 }); yield* this.lunge(u, 10, 2); Sound.sfx('slash'); ln9(this, T.x - 26, T.y - 14, T.x + 10, T.y + 12, S.col[0], S.col[1], 4); yield* wait(4); imp9(this, T, S); yield* wait(4); },
    *h(S, U, T) { this.spawn({ k: 'glow', x: T.x + 26, y: T.y, r: 12, c: S.col[2], life: 14 }); Sound.sfx('slash'); ln9(this, T.x + 26, T.y - 14, T.x - 10, T.y + 12, S.col[0], S.col[1], 4); w12Particle(this, T.x, T.y, S, 4, 8); yield* wait(5); } },
  rg9Lurk: { col: ['#5a6a5a', '#c8d8c8', '#1a221a'], pt: 'smoke', cast: 'still', snd: 'wind', // the hunter fades into smoke
    *f(S, U) { Sound.sfx('wind'); for (let i = 0; i < 10; i++) this.spawn({ k: 'glow', x: U.x + rnd(-26, 22), y: U.y + rnd(-10, 22), r: rnd(8, 14), c: i % 2 ? S.col[0] : S.col[2], life: 22 }); yield* wait(6);
      this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 6, r1: 28, c: S.col[1], w: 1, life: 14 }); yield* wait(12); } },
  rg9Venom: { col: ['#8ad040', '#f0ffc0', '#4a2a60'], pt: 'bubble', cast: 'draw', fin: 'none', snd: 'poison', // a green-dripping stab
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); ln9(this, T.x + 14, T.y - 14, T.x - 6, T.y + 6, S.col[0], S.col[1], 3); for (let i = 0; i < 6; i++) this.spawn({ k: 'circ', x: T.x + rnd(-4, 4), y: T.y + 4, vx: rnd(-10, 10) / 10, vy: rnd(5, 15) / 10, g: 0.1, r: 2, c: i % 2 ? S.col[0] : S.col[2], life: 16 });
      Sound.sfx('poison'); imp9(this, T, S); yield* wait(8); } },
  rg9FanBlade: { col: ['#e0e8f0', '#ffffff', '#607080'], pt: 'shard2', cast: 'dash', fin: 'none', snd: 'slash', // a fan of thrown blades, one to each
    *f(S, U, T, u, t) { const G = grp9(this, T, t), x0 = U.x + 8, y0 = U.y - 10, F = 7, P = G.map(() => this.spawn({ k: 'cres', x: x0, y: y0, r: 6, ang: 0, c: S.col[1], c2: S.col[0], w: 3, life: F + 2 }));
      Sound.sfx('slash'); for (let i = 1; i <= F; i++) { G.forEach((C, j) => { P[j].x = lerp(x0, C.x, i / F); P[j].y = lerp(y0, C.y, i / F); P[j].ang = i * 0.9; }); yield; } for (const C of G) imp9(this, C, S); yield* wait(8); } },
  rg9Declare: { col: ['#ff8a30', '#fff0c0', '#a03a10'], pt: 'crest', cast: 'focus', fin: 'none', snd: 'crit', // a crosshair on the prey, then the shot home
    *f(S, U, T, u) { Sound.sfx('tick'); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 30, r1: 12, c: S.col[0], w: 2, life: 18 }); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) this.spawn({ k: 'line', x1: T.x + dx * 30, y1: T.y + dy * 30, x2: T.x + dx * 10, y2: T.y + dy * 10, c: S.col[1], w: 2, grow: 4, life: 18 }); yield* wait(10);
      yield* this.lunge(u, 14, 2); Sound.sfx('crit'); this.star(T.x, T.y, S.col[1], 12); imp9(this, T, S); yield* wait(8); } },
  rg9Fatal: { col: ['#d0203a', '#ffd0d8', '#400810'], pt: 'claw2', cast: 'still', fin: 'crimson', snd: 'crit', // one precise point, then red
    *f(S, U, T, u) { this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 18, r1: 2, c: S.col[1], w: 1, life: 14 }); yield* wait(8); yield* this.lunge(u, 16, 2); Sound.sfx('crit'); this.spawn({ k: 'flash', c: S.col[0], a: 0.3, life: 6 }); ln9(this, T.x + 8, T.y - 8, T.x - 2, T.y + 2, S.col[0], S.col[1], 3); imp9(this, T, S, 1); yield* wait(8); } },
  rg9ShadowGrave: { col: ['#6a3a9a', '#d8b0ff', '#100818'], pt: 'eclipse', cast: 'void', fin: 'rift', snd: 'quake', // shadows rise from the ground and close over the prey
    *f(S, U, T) { Sound.sfx('quake'); for (let i = 0; i < 6; i++) { const x = T.x + (i - 2.5) * 8; this.spawn({ k: 'line', x1: x, y1: T.y + 22, x2: x + rnd(-3, 3), y2: T.y - 24 - rnd(0, 10), c: i % 2 ? S.col[2] : S.col[0], w: 4, grow: 6, life: 22 }); yield* wait(2); }
      this.spawn({ k: 'glow', x: T.x, y: T.y, r: 34, c: S.col[2], life: 18 }); yield* wait(6); imp9(this, T, S, 1); yield* wait(8); } },
};
function fx9Make(k) { const F = FX9[k]; if (!F) return; const S = { col: F.col, pt: F.pt, seed: hashK(k) }, id = 'o_' + k, D = DEF.skills[id];
  FX['c9_' + k] = function* (U, T, u, t) { yield* F.f.call(this, S, U, T, u, t); }; if (F.h) { FX['c9h_' + k] = function* (U, T, u, i) { yield* F.h.call(this, S, U, T, u, i); }; if (D) D.hitFx = 'c9h_' + k; }
  PAL['c9_' + k] = [F.col[0], F.col[1]]; SKILL_STYLE[id] = [F.cast || 'draw', D && D.power ? (F.fin || 'none') : null, 'c9_' + k, F.snd || null]; if (MOVES[id]) MOVES[id].fx = 'c9_' + k; }

/* =================== 第二版：吟遊詩人・機工士・武僧 =================== */
BV_TAGS.add('asAttack9'); // 輕快間奏 counts as an「攻擊」action for 拍
Object.assign(COND, { ownerNoStatus9: (c, v) => !!c.owner && !c.core.hasStatus(c.owner, v), hitFrom9: (c, v) => (c.n || 0) >= v, evSkillNot9: (c, v) => !!c.ev && c.ev.payload.skill !== v,
  evNoFollow9: (c, v) => !!c.ev && !c.ev.payload.follow === !!v });
Object.assign(BR.FORMULA, {
  echo9: c => 1 + 0.1 * ((c.src.res.beat) || 0),
  finale9: c => 1 + 0.15 * c.src.statuses.filter(s => DEF.statuses[s.id] && DEF.statuses[s.id].group === 'stage' && s.stacks > 0).length,
  boom9: c => 80 + 40 * actV9(c, 'boom9'),
  shock9: c => 1 + 0.15 * (c.spent || 0),
});
Object.assign(EFFECT_TYPES, {
  last_attack9: { exec(core, ef, ctx) { if (ctx.owner) ctx.owner.data.lastAct = 'attack'; } },
  cut_cd9: { exec(core, ef, ctx) { const e = ctx.trigEv; if (e && e.payload.skill) core.cutCooldown(ctx.owner, e.payload.skill, ef.n || 1, ef.why || 'variation'); } },
  // 緊急裝填: fill the turret up; no turret → set one with 2 shots
  reload9: { exec(core, ef, ctx) { const u = ctx.owner, s = core.statusOf(u, 'turret'), max = BV12.turretMax(core, u); if (s) { if (s.stacks < max) core.applyStatus(u, u, 'turret', { delta: max - s.stacks }); } else core.applyStatus(u, u, 'turret', { delta: 2 }); } },
});
defPut('statuses', 'variation9', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '變奏' }, triggers: [
  { on: EVT.COOLDOWN, phase: 'POST', role: 'src', cond: { evSetCd: 1, evSkillNot9: 'o_bd9Variation' }, effects: [{ type: 'cut_cd9', why: 'variation' }] },
  { on: EVT.SKILL_USE, phase: 'POST', role: 'src', cond: { isBasic: 0, skillNot: 'o_bd9Variation', evNoFollow9: 1 }, notTags: ['weapon_special', 'reaction'], effects: [{ type: 'remove_status', target: 'self', status: 'variation9', why: 'used' }] }] });
defPut('statuses', 'wrench9', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '調校' } });
defPut('statuses', 'flameRound9', { tags: ['buff'], duration: 'round', clearAt: 'round_end', stack: 'refresh', metadata: { n: '燃燒彈藥' } });
defPut('statuses', 'overload9', { tags: ['buff'], duration: 'round', clearAt: 'round_end', stack: 'refresh', metadata: { n: '過載' } });
defPut('statuses', 'goldBell9', { tags: ['buff', 'guard'], duration: 'owner_actions', durDefault: 3, tick: 'owner_action_start', stack: 'refresh', metadata: { n: '金鐘罩' },
  mods: [{ stage: 'final', who: 'defender', mul: 0.8, cond: { hasPower: 1 } }],
  triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'gain', target: 'self', res: 'chi', n: 1, why: 'goldBell' }] }] });
// the turret's shots: 扳手重擊 +50% (next one), 過載 +20% and all at once, 燃燒彈 30% burn this round
{ const D = EFFECT_TYPES.damage.exec; EFFECT_TYPES.damage.exec = function (core, ef, ctx, tg) { const u = ctx.owner; if (ef.kind !== 'turret' || !u) return D.call(this, core, ef, ctx, tg);
    let m = ef.mul || 1; if (core.hasStatus(u, 'wrench9')) { m *= 1.5; core.removeStatus(u, 'wrench9', 'used'); } if (core.hasStatus(u, 'overload9')) m *= 1.2;
    const r = D.call(this, core, { ...ef, mul: m }, ctx, tg);
    if (core.hasStatus(u, 'flameRound9')) for (const t of tg) if (core.isUp(t)) core.exec([{ type: 'status', status: 'brn', chance: 0.3, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1 } }], { ...ctx, owner: u, src: u, tgt: t });
    return r; }; }
{ const TF = EFFECT_TYPES.turret_fire.exec; EFFECT_TYPES.turret_fire.exec = function (core, ef, ctx) { const u = ctx.owner; if (!core.hasStatus(u, 'overload9')) return TF.call(this, core, ef, ctx);
    for (let i = 0; i < 12 && core.hasStatus(u, 'turret') && core.isUp(u) && core.foesOf(u).length; i++) TF.call(this, core, ef, ctx); core.removeStatus(u, 'overload9', 'used'); }; }
Object.assign(SK9_KIND, { bd9Interlude: 'sound', bd9March: 'buff', bd9Lullaby: 'debuff', bd9Healing: 'heal', bd9Discord: 'sound', bd9Variation: 'buff',
  mc9Rivet: 'proj', mc9Wrench: 'strike', mc9ShieldDrone: 'guard', mc9Reload: 'buff', mc9Incendiary: 'proj', mc9Overload: 'buff',
  mk9Crumble: 'strike', mk9Gather: 'buff', mk9IronLean: 'strike', mk9GoldBell: 'guard', mk9SixFists: 'strike', mk9SkyPalm: 'strike' });
Object.assign(SK9, {
  bard: [
    ['bd9Interlude', '輕快間奏', 50, 0, 1, 3, ['int', 1], '特', '一般', 0, '輕快的一段間奏（魔法）。算作「攻擊」行動（拍的計算）；命中回復 5 MP。', { B: ['fspd-1', 'slp:15'] },
      { tags: ['asAttack9'], effects: [{ type: 'damage' }, { type: 'resource', target: 'self', res: 'mp', amount: 5, why: 'interlude' }] }],
    ['bd9March', '激昂進行曲', 0, 0, 2, 4, null, '變', '一般', 0, '激昂的進行曲：物攻 +1、速度 +1（3 行動）；拍 +1。', { A: ['cheap', 'spe+1'], B: ['heal+15', 'shield:1'] },
      { effects: [{ type: 'stage', target: 'self', stats: { atk: 1, spe: 1 }, dur: 3 }, GAIN9('beat', 1, { why: 'march' })] }],
    ['bd9Lullaby', '搖籃小夜曲', 0, 0, 2, 5, null, '變', '一般', 0, '溫柔的搖籃曲讓目標睡眠 35%（拍 3 時 70%）。', { A: ['cheap', 'spa+1'], B: ['spec+1', 'mp:3'] },
      { target: 'enemy', effects: [{ type: 'status', status: 'slp', chance: 0.35, cond: { tgtAlive: 1, tgtNoMajor: 1, ownerResBelow: ['beat', 3] } }, { type: 'status', status: 'slp', chance: 0.7, cond: { tgtAlive: 1, tgtNoMajor: 1, ownerResAtLeast: ['beat', 3] } }] }],
    ['bd9Echo', '繞樑之音', 62, 0, 1, 5, ['int', 1], '特', '一般', 1, '餘音繞樑的音波打全體（魔法）；每有 1 拍威力 +10%。', { B: ['fspd-1', 'spa+1'] },
      { mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'echo9' } }] }],
    ['bd9Healing', '療癒小調', 0, 0, 2, 5, null, '變', '一般', 0, '溫暖的小調：回復 30% HP，解除 1 個異常狀態。', { A: ['heal+25', 'heal+25'], B: ['spe+1', 'shield:1'] },
      { tags: ['heal'], effects: [{ type: 'heal', target: 'self', pct: 0.3 }, { type: 'cleanse', target: 'self' }] }],
    ['bd9Discord', '刺耳和弦', 80, 0, 2, 6, ['int', 1], '特', '一般', 0, '刺耳的和弦（魔法）：目標物攻、魔攻 −1（拍 3 時各 −2）。', { B: ['slp:15', 'drain:15'] },
      { effects: [{ type: 'damage' }, { type: 'stage', stats: { atk: -1, spa: -1 }, cond: { tgtAlive: 1, ownerResBelow: ['beat', 3] } }, { type: 'stage', stats: { atk: -2, spa: -2 }, cond: { tgtAlive: 1, ownerResAtLeast: ['beat', 3] } }] }],
    ['bd9Variation', '變奏', 0, 0, 2, 4, null, '變', '一般', 0, '即興的變奏：拍 +2；下一招技能冷卻 −1。', { A: ['cheap', 'spe+1'], B: ['spec+1', 'mp:3'] },
      { effects: [GAIN9('beat', 2, { why: 'variation' }), { type: 'status', target: 'self', status: 'variation9' }] }],
    ['bd9Finale', '終幕交響', 112, 0, 3, 10, ['int', 1], '特', '一般', 1, '壓軸的交響打全體（魔法）；自己身上每有 1 種能力提升，威力 +15%。', { B: ['spec+1', 'spe+1'] },
      { mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'finale9' } }] }],
  ],
  machinist: [
    ['mc9Rivet', '鉚釘槍', 52, 0, 1, 3, ['dex', 1], '物', '一般', 0, '連射鉚釘。砲台在場時補 1 發彈藥。', { B: ['spec+1', 'hit+1'] },
      { after: [{ type: 'status', target: 'self', status: 'turret', delta: 1, data: { load9: 1 }, cond: { ownerHasStatus: 'turret' } }] }],
    ['mc9Wrench', '扳手重擊', 62, 0, 1, 4, ['str', 1], '物', '一般', 0, '用大扳手敲下去，30% 物防 −1；順手調校砲台，下一次射擊威力 +50%。', { B: ['fdef-1', 'fatk-1'] },
      { effects: [{ type: 'damage' }, { type: 'stage', stats: { def: -1 }, chance: 0.3, secondary: true, cond: { tgtAlive: 1 } }], after: [{ type: 'status', target: 'self', status: 'wrench9' }] }],
    ['mc9ShieldDrone', '護盾機展開', 0, 0, 2, 5, null, '變', '一般', 0, '放出護盾機：護盾 2 行動；砲台在場時 3 行動。', { A: ['spd+1', 'cheap'], B: ['heal+15', 'shield:1'] },
      { effects: [{ type: 'status', target: 'self', status: 'barrier', dur: 3, cond: { ownerHasStatus: 'turret' } }, { type: 'status', target: 'self', status: 'barrier', dur: 2, cond: { ownerNoStatus9: 'turret' } }] }],
    ['mc9Scatter', '散彈', 60, 0, 1, 5, ['dex', 1], '物', '一般', 1, '散開的彈丸打全體（物理）。', { B: ['fdef-1', 'spec+1'] }, {}],
    ['mc9Reload', '緊急裝填', 0, 0, 2, 3, null, '變', '一般', 0, '緊急裝填：砲台補滿；沒有砲台時設置一座 2 發的砲台。', { A: ['cheap', 'spe+1'], B: ['spec+1', 'mp:3'] },
      { effects: [{ type: 'reload9' }] }],
    ['mc9Incendiary', '燃燒彈', 74, 0, 2, 6, ['dex', 1], '物', '火', 0, '火屬性的燃燒彈（物理），50% 灼傷；這回合砲台的射擊也有 30% 灼傷。', { B: ['brn:35', 'atk+1'] },
      { effects: [{ type: 'damage' }, { type: 'status', status: 'brn', chance: 0.5, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1 } }], after: [{ type: 'status', target: 'self', status: 'flameRound9' }] }],
    ['mc9Overload', '過載射擊', 0, 0, 3, 6, null, '變', '一般', 0, '讓砲台過載：這回合結束時一次射完所有彈藥，每發威力 +20%。', { A: ['cheap', 'atk+1'], B: ['spec+1', 'spe+1'] },
      { effects: [{ type: 'status', target: 'self', status: 'overload9' }] }],
    ['mc9Selfdestruct', '自爆砲台', 80, 0, 3, 8, ['dex', 1.5], '物', '一般', 1, '讓砲台自爆打全體：砲台消失，每剩 1 發彈藥威力 +40。', { B: ['brn:30', 'atk+1'] },
      { powerOf: 'boom9', onPrepare: (core, u, cmd) => { cmd.boom9 = ((core.statusOf(u, 'turret') || {}).stacks) || 0; }, after: [{ type: 'remove_status', target: 'self', status: 'turret', why: 'boom' }] }],
  ],
  monk: [
    ['mk9Crumble', '崩山拳', 28, 2, 1, 3, ['str', 1], '物', '一般', 0, '能崩開山壁的兩段拳，每段氣 +1。', { B: ['hit+1', 'par:15'] }, {}],
    ['mk9Sweep', '掃腿', 50, 0, 1, 4, ['agi', 1], '物', '一般', 1, '壓低身子掃腿踢全體，30% 速度 −1。', { B: ['hit+1', 'fatk-1'] },
      { effects: [{ type: 'damage' }, { type: 'stage', stats: { spe: -1 }, chance: 0.3, secondary: true, cond: { tgtAlive: 1 } }] }],
    ['mk9Gather', '聚氣式', 0, 0, 2, 3, null, '變', '一般', 0, '調息聚氣：氣 +2，回復 10% HP。', { A: ['cheap', 'atk+1'], B: ['spe+1', 'heal+15'] },
      { effects: [GAIN9('chi', 2, { why: 'gather' }), { type: 'heal', target: 'self', pct: 0.1 }] }],
    ['mk9IronLean', '鐵山靠', 72, 0, 2, 5, ['vit', 1], '物', '一般', 0, '用肩背撞過去。氣 2 以上時消耗 2 點：50% 退縮、目標物防 −1。', { B: ['fdef-1', 'fatk-1'] },
      { onPrepare: (core, u, cmd) => { if ((u.res.chi || 0) >= 2) { core.changeRes(u, 'chi', -2, { why: 'cost' }); cmd.lean9 = 1; } },
        effects: [{ type: 'damage' }, { type: 'status', status: 'flinch', chance: 0.5, secondary: true, cond: { tgtAlive: 1, actFlag: 'lean9' } }, { type: 'stage', stats: { def: -1 }, cond: { tgtAlive: 1, actFlag: 'lean9' } }] }],
    ['mk9GoldBell', '金鐘罩', 0, 0, 2, 5, null, '變', '一般', 0, '運氣護體：3 行動內受到的傷害 −20%；這段期間被打中時氣 +1。', { A: ['spd+1', 'cheap'], B: ['heal+15', 'shield:1'] },
      { effects: [{ type: 'status', target: 'self', status: 'goldBell9', dur: 3 }] }],
    ['mk9SixFists', '六合拳', 15, 6, 2, 6, ['agi', 1], '物', '一般', 0, '6 段連拳；每段都給氣（不受每次行動最多 +2 的限制）。', { B: ['spe+1', 'drain:20'] },
      { effects: [{ type: 'damage' }, GAIN9('chi', 1, { why: 'sixFists', cond: { hitFrom9: 2 } })] }],
    ['mk9Shock', '震勁', 80, 0, 2, 6, ['str', 1], '物', '一般', 1, '把氣震出去打全體：消耗全部氣，每點威力 +15%。', { B: ['fdef-1', 'hit+1'] },
      { costs: [{ res: 'chi', all: 1, min: 0 }], mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'shock9' } }] }],
    ['mk9SkyPalm', '天崩掌', 115, 0, 3, 8, ['str', 1.5], '物', '一般', 0, '天崩地裂的一掌。氣滿時施放，威力再 +50%（照樣必定會心）。', { B: ['atk+1', 'drain:15'] },
      { onPrepare: (core, u, cmd) => { if ((u.max.chi || 0) > 0 && (u.res.chi || 0) >= u.max.chi) cmd.palm9 = 1; }, mods: [{ stage: 'skill', who: 'attacker', mul: 1.5, cond: { actFlag: 'palm9' } }] }],
  ],
});
// 輕快間奏 counts as an attack for 拍 (the action kind is decided before the 拍 rule looks at it)
{ const M = DEF.mechanics.cls9sk, mk = M.make; M.make = u => { const m = mk(u); m.triggers.push(TPRE(EVT.ACTION_END, 'src', { tag: 'asAttack9', actExecuted: 1 }, [{ type: 'last_attack9' }])); return m; }; }
// 鉚釘槍's single shell: a small "loaded" line instead of 「補滿了彈藥」
{ const H = Battle.prototype.handlers, _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) {
    if (t && P.status === 'turret' && P.data && P.data.load9 && !P.failed && (t.st.turret || 0) > 0) { const d = P.delta; P.delta = 0; yield* _ap.call(this, e, s, t, P); P.delta = d;
      if (!P.capped) { const T = this.turretMuzzle(); Sound.sfx('tick'); this.sparks(T.x - 10, T.y + 14, 5, ['#fff0a0', '#c0c8d0'], 1.4, 12); yield* this.msg('砲台裝填了 1 發！（彈藥 ' + P.stacks + '）', { hold: 18 }); } return; }
    yield* _ap.call(this, e, s, t, P); }; }
Object.assign(FX9, {
  /* ----- 吟遊詩人 ----- */
  bd9Interlude: { col: ['#ff9ad0', '#fff0f8', '#a04070'], pt: 'note', cast: 'rune', fin: 'pop', snd: 'buzz', // three little notes hop to the target
    *f(S, U, T) { Sound.sfx('buzz'); for (let k = 0; k < 3; k++) { const x0 = U.x + 6, y0 = U.y - 12, F = 7, p = this.spawn({ k: 'ring', x: x0, y: y0, r0: 3, r1: 3, c: k % 2 ? S.col[1] : S.col[0], w: 2, life: F + 2 });
        for (let i = 1; i <= F; i++) { p.x = lerp(x0, T.x + (k - 1) * 8, i / F); p.y = lerp(y0, T.y, i / F) - Math.abs(Math.sin(i / F * Math.PI * 2)) * 12; yield; } this.star(p.x, p.y, S.col[1], 8); } imp9(this, T, S); yield* wait(6); } },
  bd9March: { col: ['#ff7040', '#fff0c0', '#a03010'], pt: 'note2', cast: 'aura', snd: 'statUp', // four drum beats, each a ring and an upward stroke
    *f(S, U) { for (let k = 0; k < 4; k++) { Sound.sfx(k === 3 ? 'statUp' : 'hit'); this.spawn({ k: 'ring', x: U.x, y: U.y + 16, r0: 8, r1: 30, c: k % 2 ? S.col[1] : S.col[0], w: 2, life: 10, fl: 0.4 }); this.spawn({ k: 'line', x1: U.x - 16 + k * 10, y1: U.y + 10, x2: U.x - 16 + k * 10, y2: U.y - 20, c: S.col[0], w: 2, grow: 4, life: 12 }); yield* wait(5); } yield* wait(6); } },
  bd9Lullaby: { col: ['#a0b8ff', '#f0f4ff', '#4050a0'], pt: 'note2', cast: 'rune', snd: 'buzz', // soft notes drift over, little z's rise
    *f(S, U, T) { Sound.sfx('buzz'); for (let i = 0; i < 6; i++) this.spawn({ k: 'mote', x: U.x + rnd(-8, 8), y: U.y - 10, vy: 0, to: { x: T.x + rnd(-10, 10), y: T.y - 6 }, s: 2, c: i % 2 ? S.col[0] : S.col[1], life: 22 }); yield* wait(16);
      for (let i = 0; i < 3; i++) { this.spawn({ k: 'txt', s: 'z', x: T.x + 8 + i * 6, y: T.y - 12 - i * 6, vy: -0.4, c: S.col[1], life: 26, fade: 1 }); yield* wait(4); } this.spawn({ k: 'glow', x: T.x, y: T.y, r: 18, c: S.col[0], life: 16 }); yield* wait(8); } },
  bd9Echo: { col: ['#d0a0ff', '#f8f0ff', '#6030a0'], pt: 'note', cast: 'focus', fin: 'none', snd: 'buzz', // sound rings roll out over the whole group, three waves
    *f(S, U, T, u, t) { const G = grp9(this, T, t); for (let k = 0; k < 3; k++) { Sound.sfx('buzz'); this.spawn({ k: 'ring', x: U.x, y: U.y - 10, r0: 10, r1: 120, c: k % 2 ? S.col[1] : S.col[0], w: 2, life: 18, fl: 0.6 }); yield* wait(5); }
      for (const C of G) imp9(this, C, S); yield* wait(8); } },
  bd9Healing: { col: ['#80e0b0', '#f0fff8', '#2a8060'], pt: 'note', cast: 'halo', snd: 'heal', // notes rise around, little plus signs
    *f(S, U) { Sound.sfx('heal'); for (let i = 0; i < 8; i++) { this.spawn({ k: 'ring', x: U.x + rnd(-20, 18), y: U.y + rnd(0, 20), r0: 2, r1: 4, c: i % 2 ? S.col[0] : S.col[1], w: 2, life: 22 }); this.spawn({ k: 'txt', s: '+', x: U.x + rnd(-20, 18), y: U.y + rnd(0, 22), vy: -0.7, c: S.col[0], life: 22, fade: 1 }); } yield* wait(18); } },
  bd9Discord: { col: ['#ff5a9a', '#ffe0ee', '#7a1840'], pt: 'note', cast: 'rune', fin: 'shatter', snd: 'buzz', // a harsh chord: jagged pink sound waves, then the air cracks around the target
    *f(S, U, T) { for (let k = 0; k < 3; k++) { Sound.sfx('buzz'); const o = (k - 1) * 8; zig9(this, U.x + 6, U.y - 10 + o, T.x, T.y + o, k % 2 ? S.col[1] : S.col[0], 2, 10, 12); yield* wait(3); }
      for (let k = 0; k < 3; k++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 6 + k * 6, r1: 22 + k * 8, c: k % 2 ? S.col[1] : S.col[0], w: 2, life: 10 + k * 2, fl: 0.8 }); this.shake = Math.max(this.shake, 6); imp9(this, T, S, 1); yield* wait(8); } },
  bd9Variation: { col: ['#60e0ff', '#f0ffff', '#2060a0'], pt: 'note', cast: 'focus', snd: 'statUp', // notes spiral up around the bard, changing colour
    *f(S, U) { Sound.sfx('statUp'); const cols = [S.col[0], '#ff9ad0', '#ffe040', S.col[1]]; for (let i = 0; i < 12; i++) { const a = i * 0.9, r = 26 - i; this.spawn({ k: 'ring', x: U.x + Math.cos(a) * r, y: U.y + 10 - i * 3, r0: 2, r1: 4, c: cols[i % 4], w: 2, life: 16 }); if (i % 3 === 0) yield* wait(2); } yield* wait(12); } },
  bd9Finale: { col: ['#ffd060', '#fffbe8', '#a03060'], pt: 'note', cast: 'aura', fin: 'sunrise', snd: 'hitSuper', // a curtain falls, golden rings and notes burst over everyone
    *f(S, U, T, u, t) { this.spawn({ k: 'dark', a: 0.5, c: '#200818', life: 34 }); Sound.sfx('charge'); yield* wait(8); const G = grp9(this, T, t);
      for (let k = 0; k < 3; k++) { Sound.sfx('buzz'); for (const C of G) this.spawn({ k: 'ring', x: C.x, y: C.y, r0: 4 + k * 4, r1: 30 + k * 6, c: k % 2 ? S.col[1] : S.col[0], w: 3 - k, life: 14 }); yield* wait(4); }
      for (const C of G) { w12Particle(this, C.x, C.y, S, 8, 20); imp9(this, C, S, 1); } this.spawn({ k: 'flash', c: S.col[1], a: 0.3, life: 8 }); yield* wait(10); } },
  /* ----- 機工士 ----- */
  mc9Rivet: { col: ['#c0c8d0', '#ffffff', '#505860'], pt: 'gear', cast: 'none', fin: 'none', snd: 'crit', // three rivets, rat-tat-tat
    *f(S, U, T) { for (let k = 0; k < 3; k++) { Sound.sfx('crit'); this.spawn({ k: 'glow', x: U.x + 10, y: U.y - 10, r: 6, c: '#fff0a0', life: 4 }); const P = { x: T.x + rnd(-6, 6), y: T.y + rnd(-6, 6) }; this.spawn({ k: 'line', x1: lerp(U.x, P.x, 0.6), y1: lerp(U.y, P.y, 0.6), x2: P.x, y2: P.y, c: S.col[1], w: 2, grow: 2, life: 6 }); yield* wait(3); this.spawn({ k: 'ring', x: P.x, y: P.y, r0: 1, r1: 6, c: S.col[0], w: 2, life: 8 }); } imp9(this, T, S); yield* wait(6); } },
  mc9Wrench: { col: ['#e0a040', '#fff0c0', '#704010'], pt: 'gear', cast: 'draw', fin: 'bash', snd: 'heavy', // a big wrench swung round, clang
    *f(S, U, T, u) { yield* this.lunge(u, 12, 3); Sound.sfx('heavy'); this.spawn({ k: 'cres', x: T.x, y: T.y, r: 20, ang: -0.8, c: S.col[1], c2: S.col[0], w: 7, life: 12 }); yield* wait(4); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4, r1: 24, c: S.col[1], w: 3, life: 10 }); w12Particle(this, T.x, T.y, S, 6, 14); this.shake = Math.max(this.shake, 6); yield* wait(8); } },
  mc9ShieldDrone: { col: ['#60c0ff', '#e0f8ff', '#205080'], pt: 'gear', cast: 'hex', snd: 'charge', // a little drone pops up and projects a barrier
    *f(S, U) { Sound.sfx('charge'); const D = this.spawn({ k: 'glow', x: U.x + 18, y: U.y + 6, r: 6, c: S.col[0], life: 30 }); for (let i = 0; i < 8; i++) { D.y = U.y + 6 - i * 3; yield; }
      for (let i = 0; i < 3; i++) this.spawn({ k: 'line', x1: D.x, y1: D.y, x2: U.x - 20 + i * 20, y2: U.y + 18, c: S.col[1], w: 1, grow: 4, life: 14 }); this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 8, r1: 28, c: S.col[0], life: 18 }); yield* wait(14); } },
  mc9Scatter: { col: ['#ffb070', '#fff0e0', '#804020'], pt: 'muzzle', cast: 'none', fin: 'none', snd: 'hitSuper', // one blast, a spray of pellets over everyone
    *f(S, U, T, u, t) { Sound.sfx('hitSuper'); this.spawn({ k: 'glow', x: U.x + 10, y: U.y - 12, r: 14, c: '#fff0a0', life: 6 }); const G = grp9(this, T, t);
      for (let i = 0; i < 18; i++) { const C = G[i % G.length]; this.spawn({ k: 'dot', x: U.x + 10, y: U.y - 12, vx: (C.x + rnd(-14, 14) - U.x - 10) / 8, vy: (C.y + rnd(-10, 10) - U.y + 12) / 8, c: i % 2 ? S.col[0] : S.col[1], s: 2, life: 9 }); } yield* wait(8); for (const C of G) imp9(this, C, S); yield* wait(8); } },
  mc9Reload: { col: ['#ffe080', '#ffffff', '#806020'], pt: 'gear', cast: 'focus', snd: 'tick', // shells clatter out, gears spin
    *f(S, U) { for (let i = 0; i < 6; i++) { Sound.sfx('tick'); this.spawn({ k: 'shard', g: 0.25, x: U.x + 14, y: U.y - 6, vx: rnd(5, 20) / 10, vy: -rnd(15, 30) / 10, s: 3, c: i % 2 ? S.col[0] : S.col[2], life: 22 }); yield* wait(2); }
      for (let k = 0; k < 2; k++) this.spawn({ k: 'ring', x: U.x + 14 + k * 10, y: U.y - 4, r0: 3, r1: 9, c: S.col[1], w: 2, life: 14 }); yield* wait(12); } },
  mc9Incendiary: { col: ['#ff5020', '#ffd080', '#801000'], pt: 'flame', cast: 'none', fin: 'burn', snd: 'fire', // a shell lobbed in an arc that bursts into flame
    *f(S, U, T) { Sound.sfx('crit'); const x0 = U.x + 8, y0 = U.y - 12, F = 10, p = this.spawn({ k: 'glow', x: x0, y: y0, r: 6, c: S.col[0], life: F + 2 }); for (let i = 1; i <= F; i++) { p.x = lerp(x0, T.x, i / F); p.y = lerp(y0, T.y, i / F) - Math.sin(i / F * Math.PI) * 26; this.spawn({ k: 'flame', x: p.x, y: p.y, vy: -0.5, s: 2, life: 8 }); yield; }
      Sound.sfx('fire'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 28, c: S.col[0], life: 14 }); imp9(this, T, S, 1); yield* wait(8); } },
  mc9Overload: { col: ['#ff4040', '#ffe0e0', '#600010'], pt: 'steam', cast: 'aura', snd: 'charge', // red warning flashes, steam hissing out
    *f(S, U) { for (let k = 0; k < 3; k++) { Sound.sfx('tick'); this.spawn({ k: 'flash', c: S.col[0], a: 0.18, life: 5 }); this.spawn({ k: 'ring', x: U.x + 16, y: U.y - 8, r0: 4, r1: 18, c: S.col[0], w: 2, life: 8 }); yield* wait(5); }
      Sound.sfx('charge'); for (let i = 0; i < 8; i++) this.spawn({ k: 'glow', x: U.x + rnd(-10, 26), y: U.y - rnd(0, 26), r: rnd(5, 9), c: '#e8f0f8', life: 18 }); yield* wait(10); } },
  mc9Selfdestruct: { col: ['#ff8020', '#fff4c0', '#402010'], pt: 'ember', cast: 'none', fin: 'impact', snd: 'quake', // the turret glows, blows up, the blast rolls over all of them
    *f(S, U, T, u, t) { const M = this.turretMuzzle ? this.turretMuzzle() : { x: U.x + 30, y: U.y - 10 }; for (let k = 0; k < 3; k++) { Sound.sfx('tick'); this.spawn({ k: 'glow', x: M.x, y: M.y, r: 10 + k * 4, c: S.col[0], life: 6 }); yield* wait(5); }
      Sound.sfx('quake'); this.spawn({ k: 'flash', c: S.col[1], a: 0.5, life: 8 }); this.spawn({ k: 'shock', x: M.x, y: M.y + 10, r0: 6, r1: 120, c: S.col[0], life: 20 }); this.shake = Math.max(this.shake, 12); yield* wait(6);
      for (const C of grp9(this, T, t)) imp9(this, C, S, 1); yield* wait(10); } },
  /* ----- 武僧 ----- */
  mk9Crumble: { col: ['#c8a070', '#fff0d8', '#6a4a28'], pt: 'rock', cast: 'focus', fin: 'none', snd: 'heavy', // a heavy fist that cracks stone
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('heavy'); this.spawn({ k: 'glow', x: T.x - 6, y: T.y, r: 14, c: S.col[0], life: 10 }); this.spawn({ k: 'ring', x: T.x - 6, y: T.y, r0: 2, r1: 20, c: S.col[1], w: 3, life: 10 }); for (let i = 0; i < 6; i++) this.spawn({ k: 'shard', g: 0.2, x: T.x - 6, y: T.y, vx: rnd(-20, 20) / 10, vy: -rnd(10, 25) / 10, s: rnd(3, 5), c: i % 2 ? S.col[0] : S.col[2], life: 20 }); this.shake = Math.max(this.shake, 5); yield* wait(6); },
    *h(S, U, T) { Sound.sfx('heavy'); this.spawn({ k: 'glow', x: T.x + 6, y: T.y + 4, r: 16, c: S.col[0], life: 10 }); this.spawn({ k: 'ring', x: T.x + 6, y: T.y + 4, r0: 2, r1: 24, c: S.col[1], w: 3, life: 10 }); this.spawn({ k: 'ring', x: T.x, y: T.y + 22, r0: 6, r1: 34, c: S.col[2], w: 2, life: 12, fl: 0.35 }); this.shake = Math.max(this.shake, 7); yield* wait(6); } },
  mk9Sweep: { col: ['#f0d080', '#fffbe0', '#8a6a20'], pt: 'dust', cast: 'dash', fin: 'none', snd: 'wind', // a low kick along the ground, dust behind it
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 2); Sound.sfx('wind'); const G = grp9(this, T, t), y = Math.max(...G.map(C => C.y)) + 16; this.spawn({ k: 'cres', x: T.x, y, r: 60, ang: 1.57, c: S.col[1], c2: S.col[0], w: 5, life: 14 }); yield* wait(4);
      for (const C of G) { for (let i = 0; i < 5; i++) this.spawn({ k: 'glow', x: C.x + rnd(-12, 12), y: C.y + 18, r: rnd(4, 7), c: S.col[2], life: 14 }); imp9(this, C, S); } yield* wait(8); } },
  mk9Gather: { col: ['#60e8c8', '#e0fff6', '#1a9070'], pt: 'chi', cast: 'focus', snd: 'charge', // chi drawn in from all around, then a calm ring
    *f(S, U) { Sound.sfx('charge'); for (let i = 0; i < 14; i++) { const a = i * 0.45, R = 44; this.spawn({ k: 'mote', x: U.x + Math.cos(a) * R, y: U.y + Math.sin(a) * R * 0.7, vy: 0, to: { x: U.x, y: U.y }, s: 2, c: i % 2 ? S.col[0] : S.col[1], life: 18 }); } yield* wait(14);
      this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 4, r1: 26, c: S.col[0], w: 2, life: 12 }); yield* wait(10); } },
  mk9IronLean: { col: ['#8090a0', '#e8f0ff', '#303840'], pt: 'quake', cast: 'aura', fin: 'bash', snd: 'heavy', // the whole body slammed in, the ground shakes
    *f(S, U, T, u) { for (let i = 0; i < 3; i++) this.spawn({ k: 'glow', x: lerp(U.x, T.x, i / 3), y: lerp(U.y, T.y, i / 3), r: 10, c: S.col[2], life: 10 + i * 2 }); yield* this.lunge(u, 24, 3); Sound.sfx('heavy'); this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 6, r1: 56, c: S.col[0], life: 16 });
      this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 6, r1: 26, c: S.col[1], life: 12 }); this.shake = Math.max(this.shake, 12); yield* wait(10); } },
  mk9GoldBell: { col: ['#ffcc40', '#fff4c0', '#a07010'], pt: 'crest', cast: 'hex', snd: 'shield', // a golden bell rings down over the monk
    *f(S, U) { Sound.sfx('shield'); for (let i = 0; i < 3; i++) { this.spawn({ k: 'arc', x: U.x, y: U.y - 6 + i * 3, r: 22 - i * 2, a0: 3.4, c: S.col[i % 2], life: 22 }); this.spawn({ k: 'line', x1: U.x - 22 + i * 2, y1: U.y + 18, x2: U.x + 22 - i * 2, y2: U.y + 18, c: S.col[0], w: 2, grow: 3, life: 20 }); yield* wait(3); }
      this.spawn({ k: 'ring', x: U.x, y: U.y, r0: 10, r1: 34, c: S.col[1], w: 2, life: 14 }); Sound.sfx('statUp'); yield* wait(12); } },
  mk9SixFists: { col: ['#ff9050', '#fff0e0', '#a04020'], pt: 'chi', cast: 'focus', fin: 'none', snd: 'hit', // six fists, one at each point of a hexagon
    *f(S, U, T, u) { yield* this.lunge(u, 10, 2); Sound.sfx('hit'); const x = T.x + 14, y = T.y; this.spawn({ k: 'ring', x, y, r0: 2, r1: 12, c: S.col[0], w: 2, life: 8 }); w12Particle(this, x, y, S, 3, 4); yield* wait(3); },
    *h(S, U, T, u, i) { Sound.sfx('hit'); const a = i * Math.PI / 3, x = T.x + Math.cos(a) * 14, y = T.y + Math.sin(a) * 12; this.spawn({ k: 'glow', x, y, r: 8, c: S.col[0], life: 8 }); this.spawn({ k: 'ring', x, y, r0: 2, r1: 12, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 8 }); if (i === 5) this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 22, c: S.col[1], life: 12 }); this.shake = Math.max(this.shake, 2); yield* wait(3); } },
  mk9Shock: { col: ['#50a0ff', '#e0f0ff', '#103070'], pt: 'wave', cast: 'aura', fin: 'none', snd: 'quake', // a stamp, and shock waves run along the ground to each foe
    *f(S, U, T, u, t) { Sound.sfx('quake'); this.spawn({ k: 'ring', x: U.x, y: U.y + 18, r0: 4, r1: 30, c: S.col[0], w: 3, life: 12, fl: 0.4 }); this.shake = Math.max(this.shake, 6); const G = grp9(this, T, t);
      for (let i = 1; i <= 6; i++) { for (const C of G) this.spawn({ k: 'ring', x: lerp(U.x, C.x, i / 6), y: lerp(U.y + 18, C.y + 18, i / 6), r0: 2, r1: 10, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 8, fl: 0.4 }); yield* wait(2); }
      for (const C of G) { this.spawn({ k: 'shock', x: C.x, y: C.y + 18, r0: 4, r1: 30, c: S.col[0], life: 12 }); imp9(this, C, S); } this.shake = Math.max(this.shake, 8); yield* wait(8); } },
  mk9SkyPalm: { col: ['#fff6d0', '#ffffff', '#806020'], pt: 'ray', cast: 'sky', fin: 'impact', snd: 'quake', // a huge palm of light comes down from the sky
    *f(S, U, T) { Sound.sfx('charge'); const P = this.spawn({ k: 'glow', x: T.x, y: T.y - 90, r: 34, c: S.col[0], life: 22 }); for (let i = 1; i <= 8; i++) { P.y = lerp(T.y - 90, T.y, i / 8); for (let f = -2; f <= 2; f++) this.spawn({ k: 'line', x1: P.x + f * 7, y1: P.y - 26, x2: P.x + f * 7, y2: P.y - 10, c: S.col[1], w: 3, grow: 1, life: 4 }); yield; }
      Sound.sfx('quake'); this.spawn({ k: 'rays', x: T.x, y: T.y, n: 14, a0: 0, len: 40, c: S.col[0], life: 18 }); this.shake = Math.max(this.shake, 12); imp9(this, T, S, 1); yield* wait(10); } },
});

/* =================== 第三版：龍騎士・異界勇者・魔劍士 =================== */
BV_TAGS.add('landing9'); // 跳斬・龍星墜 count as a landing attack (龍之血脈: ignore 30% 物防; landing hit +1 龍血)
Object.assign(COND, {
  // a landing attack other than 龍騰擊 itself: a skill tagged so, or any damaging skill right after 高空待機
  landing9: (c, v) => { const sk = c.skill; return (!!sk && sk.id !== 'sig_dragoon' && !!sk.power && (sk.tags.includes('landing9') || !!(c.core.act && c.core.act.landing9))) === !!v; },
  evNotReaction9: (c, v) => !!c.ev && !c.ev.payload.reaction === !!v,
});
Object.assign(BR.FORMULA, {
  lance9: c => { const u = c.src; return (u.max.dragon || 0) > 0 && (u.res.dragon || 0) >= u.max.dragon ? 0.0001 : 0.6; }, // 龍血全滿：無視全部物防（照 v12.0.9f 的上限）
  star9: c => 1 + 0.25 * actV9(c, 'star9'),
  noWeak9: c => { const m = BR.famMult(c.skill.el, c.tgt); return m > 1 ? 1 / m : 1; },
  dimension9: c => 1 + 0.1 * BV12.insightOf(c.core, c.src, c.tgt),
  runeWall9: c => 1 + (c.spent || 0),
  finale9b: c => 1 + 0.25 * (c.spent || 0),
});
Object.assign(EFFECT_TYPES, {
  // 高空待機: the next action starts on the way down
  sky_land9: { exec(core, ef, ctx) { const u = ctx.owner; core.removeStatus(u, 'skyWait9', 'used'); core.removeStatus(u, 'airborne', 'release'); if (core.act && core.act.type === 'skill') { core.act.landing9 = 1; core.act.skyBonus9 = 1; } } },
});
// 轉換彈: the element becomes the target's weakness
{ const D = EFFECT_TYPES.damage.exec; EFFECT_TYPES.damage.exec = function (core, ef, ctx, tg) { if (!ef.elWeak9) return D.call(this, core, ef, ctx, tg);
    for (const t of tg) { const f = famOf(t), el = f && f.weak && f.weak[0]; D.call(this, core, { ...ef, elWeak9: 0, ...(el ? { el } : {}) }, ctx, [t]); } }; }
defPut('statuses', 'skyWait9', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '高空待機' } });
defPut('statuses', 'sureHit9', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '看破之眼' },
  mods: [{ stage: 'attacker', who: 'attacker', accAdd: 999, cond: { hasPower: 1 } }],
  triggers: [{ on: EVT.SKILL_SUCCESS, phase: 'POST', role: 'src', cond: { hasPower: 1 }, system: 1, effects: [{ type: 'remove_status', target: 'self', status: 'sureHit9', why: 'used' }] }] });
defPut('statuses', 'inscribe9', { tags: ['buff'], duration: 'until_used', stack: 'refresh', metadata: { n: '銘紋' }, triggers: [
  { on: EVT.COOLDOWN, phase: 'POST', role: 'src', cond: { evSetCd: 1, cat: '特', isBasic: 0 }, effects: [{ type: 'cut_cd9', why: 'inscribe' }] },
  { on: EVT.SKILL_USE, phase: 'POST', role: 'src', cond: { cat: '特', isBasic: 0, hasPower: 1, evNoFollow9: 1 }, notTags: ['weapon_special', 'reaction'], effects: [{ type: 'remove_status', target: 'self', status: 'inscribe9', why: 'used' }] }] });
// 龍之血脈 also covers the new landing attacks
{ const M = DEF.mechanics.cls_dragoon, mk = M.make; M.make = u => { const m = mk(u); (m.mods || (m.mods = [])).push({ stage: 'attacker', who: 'attacker', defMul: 0.7, cond: { landing9: 1 } });
    (m.triggers || (m.triggers = [])).push(TRG(EVT.DAMAGE, 'src', { landing9: 1, evHit: 1 }, [GAIN('dragon', 1)], { limit: { perAction: 1 } })); return m; }; }
// the class-wide triggers of this version: 龍爪擊 on a weakness, 高空待機's landing, 解析斬's 看破
{ const M = DEF.mechanics.cls9sk, mk = M.make; M.make = u => { const m = mk(u);
    m.triggers.push(TRG(EVT.DAMAGE, 'src', { skillIs: 'o_dg9Claw', weakHit: 1, evHit: 1 }, [GAIN('dragon', 1, 0, { why: 'claw' })], { limit: { perAction: 1 } }),
      TRG(EVT.ACTION_START, 'src', { ownerHasStatus: 'skyWait9', evNotReaction9: 1 }, [{ type: 'sky_land9' }], { prio: 9 }),
      TRG(EVT.DAMAGE, 'src', { skillIs: 'o_ow9Analyze', weakHit: 0, evHit: 1, tgtSide: 'enemy' }, [{ type: 'insight_add' }], { limit: { perAction: 1 } }));
    (m.mods || (m.mods = [])).push({ stage: 'skill', who: 'attacker', mul: 1.3, cond: { actFlag: 'skyBonus9', hasPower: 1 } }); return m; }; }
// skills that read two attributes (雙界斬・雙極斬: 1st hit 力量, 2nd 智力; 魔劍・終焉: the one of its category)
const SK9_ATTR2 = { o_ow9TwoWorlds: '力量／智力加成', o_sb9DualPole: '力量／智力加成', o_sb9Finale: '力量／智力加成' };
{ const _t = skillAttrTag; skillAttrTag = function (id) { return SK9_ATTR2[id] || _t(id); }; }
const ATTR2_9 = (a, b, r = 1, by = 'hit') => by === 'hit' ? [{ stage: 'skill', who: 'attacker', mul: { f: 'attrScale', v: [a, r] }, cond: { srcIsHero: 1, firstHit: 1 } }, { stage: 'skill', who: 'attacker', mul: { f: 'attrScale', v: [b, r] }, cond: { srcIsHero: 1, firstHit: 0 } }]
  : [{ stage: 'skill', who: 'attacker', mul: { f: 'attrScale', v: [a, r] }, cond: { srcIsHero: 1, cat: '物' } }, { stage: 'skill', who: 'attacker', mul: { f: 'attrScale', v: [b, r] }, cond: { srcIsHero: 1, cat: '特' } }];
Object.assign(SK9_KIND, { dg9Claw: 'claw', dg9JumpSlash: 'slash', dg9Scale: 'guard', dg9Breath: 'area', dg9SkyWait: 'buff', dg9Lance: 'pierce',
  ow9Analyze: 'slash', ow9Convert: 'bolt', ow9Shield: 'guard', ow9TwoWorlds: 'slash', ow9Eye: 'buff', ow9DawnCombo: 'slash', ow9Judgment: 'bolt',
  sb9Blade: 'slash', sb9RuneShot: 'bolt', sb9Inscribe: 'buff', sb9DualPole: 'slash', sb9Wall: 'guard', sb9Thunder: 'slash', sb9Finale: 'slash' });
Object.assign(SK9, {
  dragoon: [
    ['dg9Claw', '龍爪擊', 55, 0, 1, 3, ['str', 1], '物', '一般', 0, '龍爪般的三道抓痕。打中弱點時龍血 +1。', { B: ['spe+1', 'hit+1'] }, {}],
    ['dg9JumpSlash', '跳斬', 62, 0, 1, 4, ['str', 1], '物', '一般', 0, '跳起來往下斬，跳起和落下在同一次行動；算落地攻擊（無視 30% 物防，命中龍血 +1）。', { B: ['fdef-1', 'first'] }, { tags: ['landing9'] }],
    ['dg9Scale', '龍鱗護身', 0, 0, 2, 4, null, '變', '一般', 0, '龍鱗覆蓋全身：物防 +1、魔防 +1（3 行動）；龍血 +1。', { A: ['atk+1', 'cheap'], B: ['def+1', 'heal+15'] },
      { effects: [{ type: 'stage', target: 'self', stats: { def: 1, spd: 1 }, dur: 3 }, GAIN9('dragon', 1, { why: 'scale' })] }],
    ['dg9Tail', '龍尾橫掃', 62, 0, 1, 5, ['str', 1], '物', '一般', 1, '龍尾般的橫掃打全體；龍血 2 以上時 30% 退縮。', { B: ['fdef-1', 'hit+1'] },
      { effects: [{ type: 'damage' }, { type: 'status', status: 'flinch', chance: 0.3, secondary: true, cond: { tgtAlive: 1, ownerResAtLeast: ['dragon', 2] } }] }],
    ['dg9Breath', '龍炎吐息', 70, 0, 2, 6, ['int', 1], '特', '火', 1, '吐出龍炎燒全體（火屬性魔法）；有龍血時消耗 1 點，威力 +40%。', { B: ['brn:30', 'atk+1'] },
      { onPrepare: (core, u, cmd) => { if ((u.res.dragon || 0) >= 1) { core.changeRes(u, 'dragon', -1, { why: 'cost' }); cmd.breath9 = 1; } }, mods: [{ stage: 'skill', who: 'attacker', mul: 1.4, cond: { actFlag: 'breath9' } }] }],
    ['dg9SkyWait', '高空待機', 0, 0, 2, 4, null, '變', '一般', 0, '跳上高空等待（大部分攻擊打不到）；下一次行動的技能算落地攻擊，威力 +30%。', { A: ['cheap', 'atk+1'], B: ['spe+1', 'heal+15'] },
      { effects: [{ type: 'status', target: 'self', status: 'airborne' }, { type: 'status', target: 'self', status: 'skyWait9' }] }],
    ['dg9Lance', '貫龍槍', 92, 0, 2, 6, ['str', 1], '物', '一般', 0, '連龍鱗都能貫穿的一槍，無視 40% 物防；龍血 3 時無視全部物防。', { B: ['shield:1', 'drain:20'] },
      { mods: [{ stage: 'skill', who: 'attacker', defMul: { f: 'lance9' } }] }],
    ['dg9StarFall', '龍星墜', 105, 0, 3, 9, ['str', 1.5], '物', '一般', 1, '跳上高空，下一次行動化成流星落下打全體；落下時消耗全部龍血，每點威力 +25%。', { B: ['atk+1', 'drain:15'] },
      { tags: ['landing9'], charge: 1, airborne: 1, targetOf: (core, u, cmd) => cmd.meta && cmd.meta.release ? 'all_enemies' : 'enemy',
        onPrepare: (core, u, cmd) => { if (!(cmd.meta && cmd.meta.release)) return; const n = u.res.dragon || 0; if (n) core.changeRes(u, 'dragon', -n, { why: 'cost' }); cmd.star9 = n; },
        mods: [{ stage: 'skill', who: 'attacker', powMul: { f: 'star9' } }] }],
  ],
  otherworlder: [
    ['ow9Analyze', '解析斬', 55, 0, 1, 3, ['dex', 1], '物', '一般', 0, '看穿構造的一斬。一定算打中弱點（看破 +1），但不加弱點倍率。', { B: ['spe+1', 'hit+1'] },
      { mods: [{ stage: 'skill', who: 'attacker', mulWeak: { f: 'noWeak9' } }] }],
    ['ow9Convert', '轉換彈', 58, 0, 1, 4, ['int', 1], '特', '一般', 0, '途中改變屬性的魔法彈：屬性變成目標的弱點屬性。', { B: ['brn:30', 'cheap'] },
      { effects: [{ type: 'damage', elWeak9: 1 }] }],
    ['ow9Shield', '勇者之盾', 0, 0, 2, 4, null, '變', '一般', 0, '勇者之盾：護盾 2 行動，回復 15% HP。', { A: ['heal+25', 'heal+25'], B: ['cure', 'def+1'] },
      { tags: ['heal'], effects: [{ type: 'status', target: 'self', status: 'barrier', dur: 2 }, { type: 'heal', target: 'self', pct: 0.15 }] }],
    ['ow9TwoWorlds', '雙界斬', 34, 2, 2, 5, null, '物', '一般', 0, '兩個世界的力量：第 1 段物理、第 2 段魔法。', { B: ['spec+1', 'crit'] },
      { mods: ATTR2_9('str', 'int'), effects: [{ type: 'damage', cat: '物', cond: { firstHit: 1 } }, { type: 'damage', cat: '特', cond: { firstHit: 0 } }] }],
    ['ow9Eye', '看破之眼', 0, 0, 2, 3, null, '變', '一般', 0, '看穿目標：對牠的種族看破 +1；下一次攻擊必定命中。', { A: ['cheap', 'spe+1'], B: ['spec+1', 'mp:3'] },
      { target: 'enemy', effects: [{ type: 'insight_add' }, { type: 'status', target: 'self', status: 'sureHit9' }] }],
    ['ow9DawnCombo', '曙光連斬', 28, 3, 2, 6, ['agi', 1], '物', '一般', 0, '曙光般的 3 段連斬；看破滿層時每段必定會心。', { B: ['fatk-1', 'atk+1'] },
      { mods: [{ stage: 'skill', who: 'attacker', crit: true, cond: { insightFull: 1 } }] }],
    ['ow9Dimension', '次元斬', 80, 0, 2, 7, ['str', 1], '物', '一般', 1, '斬開次元打全體；每層看破威力 +10%。', { B: ['par:25', 'spe+1'] },
      { mods: [{ stage: 'skill', who: 'attacker', mul: { f: 'dimension9' } }] }],
    ['ow9Judgment', '黎明審判', 120, 0, 3, 10, ['int', 1.5], '特', '一般', 0, '黎明之光的審判（魔法）；對看破滿層的種族威力 ×1.5。', { B: ['spec+1', 'cheap'] },
      { mods: [{ stage: 'skill', who: 'attacker', mul: 1.5, cond: { insightFull: 1 } }] }],
  ],
  spellblade: [
    ['sb9Blade', '魔刃斬', 55, 0, 1, 3, ['str', 1], '物', '一般', 0, '注入魔力的一斬。命中魔紋 +2。', { B: ['brn:30', 'cheap'] },
      { effects: [{ type: 'damage' }, GAIN9('rune', 1, { cap: 2, why: 'blade' })] }],
    ['sb9RuneShot', '魔紋彈', 58, 0, 1, 4, ['int', 1], '特', '一般', 0, '把魔紋射出去（魔法，帶武器屬性）；照魔紋規則消耗魔紋加威力。', { B: ['spe+1', 'hit+1'] }, {}],
    ['sb9Inscribe', '銘紋', 0, 0, 2, 3, null, '變', '一般', 0, '在劍上刻下魔紋：魔紋 +2；下一個魔法技能冷卻 −1。', { A: ['cheap', 'spa+1'], B: ['spec+1', 'mp:3'] },
      { effects: [GAIN9('rune', 2, { why: 'inscribe' }), { type: 'status', target: 'self', status: 'inscribe9' }] }],
    ['sb9DualPole', '雙極斬', 32, 2, 1, 5, null, '物', '一般', 0, '第 1 段物理（給魔紋）、第 2 段魔法（馬上用掉）。', { B: ['drain:20', 'atk+1'] },
      { mods: ATTR2_9('str', 'int'), effects: [{ type: 'damage', cat: '物', cond: { firstHit: 1 } }, { type: 'damage', cat: '特', cond: { firstHit: 0 } },
        { type: 'resource', target: 'self', res: 'rune', set: 0, why: 'spend', cond: { firstHit: 0, ruleOff: 'runeKing' } }] }],
    ['sb9Wall', '魔力障壁', 0, 0, 2, 5, null, '變', '一般', 0, '把魔紋化成障壁：消耗全部魔紋，護盾「1＋魔紋數」行動。', { A: ['spd+1', 'cheap'], B: ['heal+15', 'mp:3'] },
      { costs: [{ res: 'rune', all: 1, min: 0 }], effects: [{ type: 'status', target: 'self', status: 'barrier', dur: { f: 'runeWall9' } }] }],
    ['sb9Thunder', '奔雷魔劍', 78, 0, 2, 6, ['str', 1], '物', '雷', 0, '雷電奔流的魔劍（雷屬性物理）；魔紋 3 時 40% 麻痺。', { B: ['par:25', 'atk+1'] },
      { onPrepare: (core, u, cmd) => { if ((u.res.rune || 0) >= 3) cmd.thunder9 = 1; }, effects: [{ type: 'damage' }, { type: 'status', status: 'par', chance: 0.4, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1, actFlag: 'thunder9' } }] }],
    ['sb9Burst', '魔紋爆裂', 80, 0, 2, 7, ['int', 1], '特', '一般', 1, '讓魔紋在魔物腳下爆開打全體（魔法）；照魔紋規則消耗。', { B: ['par:25', 'spa+1'] }, {}],
    ['sb9Finale', '魔劍・終焉', 116, 0, 3, 9, null, '物', '一般', 0, '終結一切的魔劍：用物攻、魔攻較高的一邊；消耗全部魔紋，每層威力 +25%。', { B: ['drain:20', 'crit'] },
      { costs: [{ res: 'rune', all: 1, min: 0 }], catOf: (core, u) => u.stats.spa > u.stats.atk ? '特' : '物', mods: ATTR2_9('str', 'int', 1.5, 'cat').concat([{ stage: 'skill', who: 'attacker', powMul: { f: 'finale9b' } }]) }],
  ],
});
Object.assign(FX9, {
  /* ----- 龍騎士 ----- */
  dg9Claw: { col: ['#e05a3a', '#ffd8c0', '#601a10'], pt: 'claw2', cast: 'draw', fin: 'none', snd: 'slash', // three dragon claw marks
    *f(S, U, T, u) { yield* this.lunge(u, 12, 2); Sound.sfx('slash'); for (let i = 0; i < 3; i++) ln9(this, T.x - 18 + i * 9, T.y - 20, T.x - 8 + i * 9, T.y + 18, S.col[0], S.col[1], 4); yield* wait(4); imp9(this, T, S); yield* wait(8); } },
  dg9JumpSlash: { col: ['#7ac0ff', '#e8f6ff', '#2a5a90'], pt: 'wind', cast: 'dash', fin: 'cut', snd: 'slash', // up into the sky, then straight down on the target
    *f(S, U, T, u) { Sound.sfx('jump'); for (let i = 0; i < 6; i++) this.spawn({ k: 'streak', x: U.x + rnd(-8, 8), y: U.y - i * 8, vx: 0, len: 10, c: S.col[1], life: 8 }); yield* wait(6);
      Sound.sfx('slash'); ln9(this, T.x + 4, T.y - 70, T.x, T.y + 14, S.col[0], S.col[1], 6); yield* wait(3); this.spawn({ k: 'ring', x: T.x, y: T.y + 20, r0: 4, r1: 30, c: S.col[1], w: 2, life: 12, fl: 0.35 }); this.shake = Math.max(this.shake, 6); imp9(this, T, S); yield* wait(8); } },
  dg9Scale: { col: ['#58b090', '#e0fff0', '#1a5040'], pt: 'shard', cast: 'hex', snd: 'shield', // scales close over the body
    *f(S, U) { Sound.sfx('shield'); for (let r = 0; r < 3; r++) { for (let k = 0; k < 5; k++) this.spawn({ k: 'cres', x: U.x - 16 + k * 8, y: U.y + 14 - r * 10, r: 5, ang: -1.57, c: S.col[1], c2: r % 2 ? S.col[0] : S.col[2], w: 3, life: 22 - r * 2 }); yield* wait(3); }
      this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 10, r1: 26, c: S.col[0], life: 14 }); yield* wait(10); } },
  dg9Tail: { col: ['#a07a40', '#fff0c8', '#4a3010'], pt: 'dust', cast: 'aura', fin: 'none', snd: 'heavy', // a long tail swings across, a second smaller arc after it
    *f(S, U, T, u, t) { yield* this.lunge(u, 10, 3); Sound.sfx('heavy'); const G = grp9(this, T, t), y = Math.max(...G.map(C => C.y)) + 8; this.spawn({ k: 'cres', x: T.x, y, r: 64, ang: 1.57, c: S.col[1], c2: S.col[0], w: 9, life: 16 }); yield* wait(3);
      this.spawn({ k: 'cres', x: T.x, y: y - 6, r: 48, ang: 1.57, c: S.col[1], c2: S.col[2], w: 4, life: 14 }); for (const C of G) imp9(this, C, S); this.shake = Math.max(this.shake, 8); yield* wait(8); } },
  dg9Breath: { col: ['#ff6a20', '#ffe8a0', '#a02000'], pt: 'flame', cast: 'aura', fin: 'firestorm', snd: 'fire', // a cone of dragon fire pouring over them
    *f(S, U, T, u, t) { const G = grp9(this, T, t); for (let k = 0; k < 10; k++) { Sound.sfx(k % 3 ? 'fire' : 'wind'); for (const C of G) { const f = (k + 1) / 10; this.spawn({ k: 'flame', x: lerp(U.x, C.x, f) + rnd(-6, 6), y: lerp(U.y - 10, C.y, f) + rnd(-6, 6), vy: -0.6, s: 2 + f * 4, life: 14 }); } yield* wait(1); }
      for (const C of G) this.spawn({ k: 'glow', x: C.x, y: C.y, r: 24, c: S.col[0], life: 12 }); yield* wait(8); } },
  dg9SkyWait: { col: ['#c0e8ff', '#ffffff', '#4a7aa0'], pt: 'feather', cast: 'dash', snd: 'jump', // the dragoon leaps high, wind rings left below
    *f(S, U) { Sound.sfx('jump'); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: U.x, y: U.y + 18, r0: 6 + i * 6, r1: 30 + i * 8, c: i % 2 ? S.col[1] : S.col[0], w: 2, life: 14, fl: 0.35 }); for (let i = 0; i < 10; i++) this.spawn({ k: 'streak', x: U.x + rnd(-14, 14), y: U.y - rnd(0, 40), vx: 0, len: rnd(8, 16), c: S.col[1], life: 10 }); w12Particle(this, U.x, U.y - 20, S, 8, 20); yield* wait(14); } },
  dg9Lance: { col: ['#e0d8ff', '#ffffff', '#5a4aa0'], pt: 'shard2', cast: 'still', fin: 'shatter', snd: 'crit', // one long thrust right through and out the other side
    *f(S, U, T, u) { yield* this.lunge(u, 18, 3); Sound.sfx('crit'); const a = Math.atan2(T.y - U.y, T.x - U.x); ln9(this, T.x - Math.cos(a) * 30, T.y - Math.sin(a) * 30, T.x + Math.cos(a) * 46, T.y + Math.sin(a) * 46, S.col[0], S.col[1], 4, 16);
      for (let i = 0; i < 6; i++) this.spawn({ k: 'shard', g: 0.1, x: T.x + Math.cos(a) * 10, y: T.y + Math.sin(a) * 10, vx: Math.cos(a) * 2 + rnd(-10, 10) / 10, vy: Math.sin(a) * 2 + rnd(-10, 10) / 10, s: 3, c: i % 2 ? S.col[0] : S.col[2], life: 18 }); yield* wait(5); imp9(this, T, S, 1); yield* wait(8); } },
  dg9StarFall: { col: ['#ffb050', '#fff4d0', '#802a10'], pt: 'star', cast: 'none', fin: 'impact', snd: 'quake', // a burning comet crashes into the middle of them
    *f(S, U, T, u, t) { const F = 10, x0 = T.x + 50, y0 = -10, p = this.spawn({ k: 'glow', x: x0, y: y0, r: 16, c: S.col[0], life: F + 2 }); Sound.sfx('fire');
      for (let i = 1; i <= F; i++) { const px = p.x, py = p.y; p.x = lerp(x0, T.x, i / F); p.y = lerp(y0, T.y, i / F); ln9(this, px, py, p.x, p.y, S.col[0], S.col[1], 6, 10); if (i % 2) this.star(p.x, p.y, S.col[1], 10); yield; }
      Sound.sfx('quake'); this.spawn({ k: 'flash', c: S.col[1], a: 0.45, life: 8 }); this.spawn({ k: 'shock', x: T.x, y: T.y + 20, r0: 6, r1: 90, c: S.col[0], life: 20 }); for (const C of grp9(this, T, t)) imp9(this, C, S, 1); this.shake = Math.max(this.shake, 12); yield* wait(10); } },
  /* ----- 異界勇者 ----- */
  ow9Analyze: { col: ['#60f0ff', '#e8ffff', '#108090'], pt: 'rune', cast: 'draw', fin: 'cut', snd: 'slash', // scan lines run down the target, then a clean cut
    *f(S, U, T, u) { Sound.sfx('tick'); for (let i = 0; i < 5; i++) { this.spawn({ k: 'line', x1: T.x - 22, y1: T.y - 20 + i * 9, x2: T.x + 22, y2: T.y - 20 + i * 9, c: S.col[0], w: 1, grow: 3, life: 10 }); yield* wait(1); }
      this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 22, r1: 14, c: S.col[1], life: 12 }); yield* this.lunge(u, 10, 2); Sound.sfx('slash'); ln9(this, T.x - 20, T.y - 18, T.x + 18, T.y + 16, S.col[0], S.col[1], 4); yield* wait(4); imp9(this, T, S); yield* wait(8); } },
  ow9Convert: { col: ['#b0b0ff', '#ffffff', '#4040a0'], pt: 'hex', cast: 'rune', fin: 'pop', snd: 'charge', // a bolt that changes colour on the way
    *f(S, U, T) { Sound.sfx('charge'); const cols = ['#b0b0ff', '#ff7a30', '#3c9cf0', '#f8d030', '#5cd060'], x0 = U.x + 8, y0 = U.y - 12, F = 10, p = this.spawn({ k: 'glow', x: x0, y: y0, r: 9, c: cols[0], life: F + 2 });
      for (let i = 1; i <= F; i++) { p.x = lerp(x0, T.x, i / F); p.y = lerp(y0, T.y, i / F) - Math.sin(i / F * Math.PI) * 8; p.c = cols[Math.floor(i / 2) % cols.length]; this.spawn({ k: 'dot', x: p.x, y: p.y, c: p.c, s: 2, life: 10 }); yield; }
      this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 22, c: S.col[1], life: 12 }); imp9(this, T, S); yield* wait(6); } },
  ow9Shield: { col: ['#ffe070', '#fffbe8', '#a08020'], pt: 'crest', cast: 'halo', snd: 'shield', // the hero's crest shines on a raised shield
    *f(S, U) { Sound.sfx('shield'); const X = U.x + 16, Y = U.y - 4; this.spawn({ k: 'hex', x: X, y: Y, r0: 6, r1: 18, c: S.col[0], life: 22 }); ln9(this, X, Y - 12, X, Y + 12, S.col[0], S.col[1], 3, 20); ln9(this, X - 9, Y - 3, X + 9, Y - 3, S.col[0], S.col[1], 3, 20);
      yield* wait(6); this.spawn({ k: 'rays', x: X, y: Y, n: 8, a0: 0.2, len: 22, c: S.col[1], life: 14 }); for (let i = 0; i < 6; i++) this.spawn({ k: 'txt', s: '+', x: U.x + rnd(-18, 16), y: U.y + rnd(0, 20), vy: -0.6, c: S.col[0], life: 20, fade: 1 }); yield* wait(12); } },
  ow9TwoWorlds: { col: ['#ff9a40', '#fff0d0', '#3a50c0'], pt: 'rift', cast: 'draw', fin: 'none', snd: 'slash', // a cut of steel, then a cut of magic the other way
    *f(S, U, T, u) { yield* this.lunge(u, 10, 2); Sound.sfx('slash'); ln9(this, T.x - 20, T.y - 20, T.x + 18, T.y + 18, '#ff9a40', '#fff0d0', 5); yield* wait(4); imp9(this, T, S); yield* wait(4); },
    *h(S, U, T) { Sound.sfx('charge'); ln9(this, T.x + 20, T.y - 20, T.x - 18, T.y + 18, '#5a70ff', '#e0e8ff', 5); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 20, c: '#a0b0ff', life: 12 }); yield* wait(6); } },
  ow9Eye: { col: ['#a0ffb0', '#ffffff', '#2a8040'], pt: 'spark', cast: 'focus', snd: 'tick', // an eye opens over the target, its gaze sweeps it
    *f(S, U, T) { Sound.sfx('tick'); const Y = T.y - 30; for (let i = 0; i < 6; i++) { this.spawn({ k: 'ring', x: T.x, y: Y, r0: 4 + i * 3, r1: 6 + i * 3, c: S.col[0], w: 1, life: 6, fl: 0.45 }); yield; }
      this.spawn({ k: 'ring', x: T.x, y: Y, r0: 20, r1: 20, c: S.col[0], w: 2, life: 22, fl: 0.45 }); this.spawn({ k: 'glow', x: T.x, y: Y, r: 6, c: S.col[1], life: 22 }); for (let i = 0; i < 5; i++) this.spawn({ k: 'line', x1: T.x, y1: Y, x2: T.x - 20 + i * 10, y2: T.y + 16, c: S.col[1], w: 1, grow: 6, life: 16 }); yield* wait(16); } },
  ow9DawnCombo: { col: ['#ffb070', '#fff4d8', '#e06a50'], pt: 'ray', cast: 'dash', fin: 'none', snd: 'slash', // three slashes lit like sunrise
    *f(S, U, T, u) { yield* this.lunge(u, 10, 2); Sound.sfx('slash'); ln9(this, T.x - 22, T.y + 6, T.x + 22, T.y - 6, S.col[0], S.col[1], 4); this.spawn({ k: 'rays', x: T.x, y: T.y, n: 6, a0: 0, len: 18, c: S.col[1], life: 10 }); yield* wait(5); },
    *h(S, U, T, u, i) { Sound.sfx('slash'); const a = i * 0.9 + 0.4; ln9(this, T.x - Math.cos(a) * 22, T.y - Math.sin(a) * 18, T.x + Math.cos(a) * 22, T.y + Math.sin(a) * 18, S.col[0], S.col[1], 4); if (i === 2) { this.spawn({ k: 'rays', x: T.x, y: T.y, n: 12, a0: 0.2, len: 30, c: S.col[1], life: 14 }); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 26, c: S.col[0], life: 12 }); } yield* wait(5); } },
  ow9Dimension: { col: ['#b050ff', '#f0d0ff', '#28104a'], pt: 'rift', cast: 'void', fin: 'rift', snd: 'quake', // space itself is cut in a line across them
    *f(S, U, T, u, t) { const G = grp9(this, T, t), y = G.reduce((a, C) => a + C.y, 0) / G.length; Sound.sfx('slash'); this.spawn({ k: 'line', x1: 0, y1: y + 6, x2: W, y2: y - 6, c: S.col[1], w: 2, grow: 4, life: 20 }); yield* wait(5);
      for (const C of G) this.spawn({ k: 'slit', x: C.x, y: C.y, w: 26, h: 5, ang: -0.14, c: S.col[0], life: 22 }); Sound.sfx('quake'); yield* wait(8); for (const C of G) imp9(this, C, S); yield* wait(6); } },
  ow9Judgment: { col: ['#fff0c0', '#ffffff', '#ff9040'], pt: 'ray', cast: 'sky', fin: 'sunrise', snd: 'hitSuper', // the light of dawn comes down as a pillar
    *f(S, U, T) { Sound.sfx('charge'); this.spawn({ k: 'pillar', x: T.x, y: T.y + 24, w: 24, h: 180, c: S.col[2], life: 22 }); yield* wait(4); this.spawn({ k: 'pillar', x: T.x, y: T.y + 24, w: 12, h: 180, c: S.col[1], life: 18 });
      this.spawn({ k: 'rays', x: T.x, y: T.y, n: 16, a0: 0.1, len: 44, c: S.col[0], life: 20 }); this.spawn({ k: 'flash', c: S.col[0], a: 0.4, life: 8 }); yield* wait(6); imp9(this, T, S, 1); yield* wait(8); } },
  /* ----- 魔劍士 ----- */
  sb9Blade: { col: ['#b070ff', '#f4e8ff', '#4a1a8a'], pt: 'rune', cast: 'draw', fin: 'cut', snd: 'slash', // a violet cut, two runes left glowing in it
    *f(S, U, T, u) { yield* this.lunge(u, 10, 2); Sound.sfx('slash'); ln9(this, T.x + 18, T.y - 20, T.x - 18, T.y + 18, S.col[0], S.col[1], 5); yield* wait(3); for (const o of [-8, 8]) this.spawn({ k: 'hex', x: T.x + o, y: T.y - o * 0.9, r0: 2, r1: 9, c: S.col[1], life: 16 }); imp9(this, T, S); yield* wait(8); } },
  sb9RuneShot: { col: ['#9080ff', '#f0f0ff', '#302080'], pt: 'hex', cast: 'rune', fin: 'pop', snd: 'charge', // a spinning rune flies out
    *f(S, U, T) { Sound.sfx('charge'); const x0 = U.x + 8, y0 = U.y - 12, F = 9; for (let i = 1; i <= F; i++) { const x = lerp(x0, T.x, i / F), y = lerp(y0, T.y, i / F); this.spawn({ k: 'hex', x, y, r0: 6, r1: 7, c: i % 2 ? S.col[0] : S.col[1], life: 4 }); yield; } imp9(this, T, S, 1); yield* wait(6); } },
  sb9Inscribe: { col: ['#c890ff', '#ffffff', '#5a2a90'], pt: 'rune', cast: 'rune', snd: 'charge', // runes written one by one along the blade
    *f(S, U) { Sound.sfx('charge'); const A = { x: U.x + 14, y: U.y + 10 }, B = { x: U.x + 34, y: U.y - 14 }; for (let i = 0; i < 4; i++) { const x = lerp(A.x, B.x, i / 3), y = lerp(A.y, B.y, i / 3); Sound.sfx('tick'); this.spawn({ k: 'hex', x, y, r0: 1, r1: 6, c: S.col[i % 2], life: 22 }); yield* wait(3); }
      this.spawn({ k: 'line', x1: A.x, y1: A.y, x2: B.x, y2: B.y, c: S.col[0], w: 2, grow: 2, life: 14 }); yield* wait(10); } },
  sb9DualPole: { col: ['#ffd060', '#ffffff', '#7040c0'], pt: 'crest', cast: 'draw', fin: 'none', snd: 'slash', // a gold steel cut, then a violet magic burst on the same spot
    *f(S, U, T, u) { yield* this.lunge(u, 10, 2); Sound.sfx('slash'); ln9(this, T.x - 18, T.y - 18, T.x + 18, T.y + 18, S.col[0], S.col[1], 5); yield* wait(4); imp9(this, T, S); yield* wait(4); },
    *h(S, U, T) { Sound.sfx('hitSuper'); this.spawn({ k: 'glow', x: T.x, y: T.y, r: 22, c: '#a070ff', life: 12 }); this.spawn({ k: 'hex', x: T.x, y: T.y, r0: 4, r1: 24, c: '#e0c8ff', life: 12 }); this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 2, r1: 20, c: S.col[2], w: 2, life: 10 }); yield* wait(6); } },
  sb9Wall: { col: ['#8a70ff', '#e8e0ff', '#2a1a6a'], pt: 'rune', cast: 'rune', snd: 'shield', // the runes peel off the blade and become a wall of hexes
    *f(S, U) { Sound.sfx('shield'); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; this.spawn({ k: 'mote', x: U.x + 30, y: U.y - 10, vy: 0, to: { x: U.x + Math.cos(a) * 24, y: U.y + Math.sin(a) * 18 }, s: 2, c: S.col[1], life: 12 }); } yield* wait(10);
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; this.spawn({ k: 'hex', x: U.x + Math.cos(a) * 24, y: U.y + Math.sin(a) * 18, r0: 3, r1: 9, c: i % 2 ? S.col[0] : S.col[1], life: 20 }); } this.spawn({ k: 'hex', x: U.x, y: U.y, r0: 10, r1: 30, c: S.col[0], life: 16 }); yield* wait(12); } },
  sb9Thunder: { col: ['#ffe040', '#ffffff', '#6a40c0'], pt: 'bolt', cast: 'aura', fin: 'spark', snd: 'thunder', // lightning runs down the blade, then the cut
    *f(S, U, T, u) { Sound.sfx('thunder'); this.spawn({ k: 'bolt', pts: [[U.x + 34, U.y - 40], [U.x + 30, U.y - 20], [U.x + 26, U.y - 8]], w: 2, life: 10 }); yield* wait(5); yield* this.lunge(u, 12, 2); Sound.sfx('slash');
      ln9(this, T.x - 20, T.y - 20, T.x + 18, T.y + 18, S.col[2], S.col[0], 6); this.spawn({ k: 'bolt', pts: [[T.x - 20, T.y - 20], [T.x - 4, T.y - 2], [T.x + 2, T.y + 6], [T.x + 18, T.y + 18]], w: 2, life: 10 }); yield* wait(4); imp9(this, T, S, 1); yield* wait(8); } },
  sb9Burst: { col: ['#e070ff', '#fff0ff', '#5a1080'], pt: 'crest', cast: 'rune', fin: 'none', snd: 'hitSuper', // a rune circle under each foe, then it blows upward
    *f(S, U, T, u, t) { Sound.sfx('charge'); const G = grp9(this, T, t); for (const C of G) this.spawn({ k: 'rune', x: C.x, y: C.y + 18, r: 18, c: S.col[0], c2: S.col[1], n: 6, poly: 5, life: 24 }); yield* wait(12);
      Sound.sfx('hitSuper'); for (const C of G) { this.spawn({ k: 'pillar', x: C.x, y: C.y + 20, w: 14, h: 70, c: S.col[1], life: 14 }); imp9(this, C, S, 1); } yield* wait(10); } },
  sb9Finale: { col: ['#7a2ab0', '#e0a0ff', '#100010'], pt: 'eclipse', cast: 'void', fin: 'crimson', snd: 'hitSuper', // the screen goes dark, one huge dark crescent, then violet light bursts
    *f(S, U, T, u) { this.spawn({ k: 'dark', a: 0.7, c: '#0a0010', life: 34 }); Sound.sfx('charge'); yield* wait(10); yield* this.lunge(u, 14, 3); Sound.sfx('slash');
      this.spawn({ k: 'cres', x: T.x, y: T.y, r: 38, ang: 0.7, c: S.col[1], c2: S.col[0], w: 10, life: 18 }); yield* wait(6); this.spawn({ k: 'flash', c: S.col[1], a: 0.4, life: 8 }); for (let i = 0; i < 3; i++) this.spawn({ k: 'ring', x: T.x, y: T.y, r0: 4 + i * 6, r1: 30 + i * 10, c: i % 2 ? S.col[1] : S.col[0], w: 3 - i, life: 14 }); imp9(this, T, S, 1); this.shake = Math.max(this.shake, 10); yield* wait(10); } },
});

/* ---------- build: this version's classes ---------- */
const SK9_DONE = ['swordsman', 'mage', 'guardian', 'ranger', 'bard', 'machinist', 'monk', 'dragoon', 'otherworlder', 'spellblade'];
for (const c of SK9_DONE) { sk9Build(c); for (const r of SK9[c]) fx9Make(r[0]); }
// no two class skills share the same picture (cast + finisher + colours)
{ const seen = new Map(); for (const c of SK9_DONE) for (const [k] of SK9[c]) { const F = FX9[k]; if (!F) { bvErr('r9', 'fx ' + k); continue; } const key = (F.cast || '') + '|' + (F.fin || '') + '|' + F.col.join(','); if (seen.has(key)) bvErr('r9', 'same picture ' + k + ' / ' + seen.get(key)); seen.set(key, k); } }

/* ---------- old saves: told once which classes got their own skills ---------- */
{ const _so = startOverworld; startOverworld = function (...a) { const r = _so.apply(this, a), st = Game.st;
    if (st && st.cls && (st.v9sk || 0) < SK9_DONE.length && (st.lv || 1) > 1) { const was = st.v9sk || 0; st.v9sk = SK9_DONE.length; const L = SK9_DONE.slice(was).map(c => (CLASSES[c] || {}).n || c);
      if (L.length && Game.ow) Game.ow.run((function* () { yield* say('【第九輪更新】' + L.join('、') + '的 8 招職業技能換成了自己的招式（等級到了自動學會），每招都會用到職業資源。');
        yield* say('以前學會的技能都留在技能庫，任何職業都能用。到選單「技能編排」把新招放進技能槽吧。'); })()); }
    else if (st && !st.v9sk) st.v9sk = SK9_DONE.length;
    return r; }; }
