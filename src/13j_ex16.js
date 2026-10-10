/* ===================== v12.116 EX 技能（玩家 2026-10-11：「隱藏職業機制改成 EX 技能 任務與文字說明都要改 EX 技能有獨特的技能樹與發動武器限制
   原本的隱藏職業技能下放到武器技能樹 EX 技能樹要用全新製作」→ 選了「耗 MP＋冷卻」「全部重新設計 名稱也不沿用」「獨立的 EX 點」「晨曦之刃→劍、雙相斬→雙劍」；
   「EX 技能樹特效與招式名稱採用全新製作」） 企劃：專案「曙光冒險-EX技能企劃」
   ・6 棵 EX 技能樹，每棵 5 招（EX1〜EX5，各 Lv1〜3）。完成對應的任務就開放那棵樹，EX1 直接學會 Lv1。
   ・EX 點和技能點分開：完成 EX 任務 +2、主線頭目每隻 +1、Lv20・30・40・50・60 各 +1。
   ・手上的武器是那棵樹指定的種類，它的招才會出現在戰鬥的技能裡。EX 招比一般招重（MP 18〜42、冷卻 3〜8）。
   ・攻擊力都用物攻和魔攻較高的一項（物理招打物防、魔法招打魔防），拿法杖也能用物理的 EX 招。
   ・原本被任務鎖住的絕技不用解鎖了；晨曦之刃移到劍（第四段）、雙相斬移到雙劍（第三段）。
   先只在特效測試版（EX16.live）：全部開放、EX 點給滿。玩家看過說好才放進正式版。 */
const EX16 = { live: typeof fxtest13 === 'function' && fxtest13(), order: [], trees: {}, ids: {} };
const EXLV16 = { 2: 1, 3: 25, 4: 35, 5: 45 };   // EX2〜EX5 要的等級（EX1 跟著任務開放）
const EXMILE16 = [20, 30, 40, 50, 60];
// [key, 名字, 任務旗標, 任務名, 武器, 屬性, 說明]
const EXDEF16 = [
  ['xDawn', '晨星誓約', 'hiddenCls', '初代勇者的試煉', ['劍', '長槍', '斧'], 'str', '晨星的光與守護。吸血的斬擊、減傷回血、全體光柱、撐住致命一擊、蓄力的審判。'],
  ['xMoon', '緋月劍譜', 'spellbladeOk', '失落的劍譜', ['劍', '雙劍', '短刀', '雙刀'], 'agi', '緋紅之月的劍技。搶先的一閃、流血連斬、削弱與沉默、閃避反擊、斬殺。'],
  ['xSong', '天籟樂章', 'clsBard', '失落的樂譜', ['法杖', '雙盾', '單手盾'], 'int', '用歌聲戰鬥。全體音波、回復、全能力強化、全體睡眠、對睡眠加倍的終曲。'],
  ['xGear', '蒸汽機巧', 'clsMachinist', '鐘塔的機巧', ['斧', '拳套', '雙盾'], 'str', '蒸汽與齒輪的機關術。重錘暈眩、自走砲台、鋼甲護盾、鍋爐全開、全體爆破。'],
  ['xFrost', '霜嶺心法', 'clsMonk', '雪峰寺的試煉', ['拳套', '長槍', '法杖'], 'int', '雪峰寺流傳的寒氣心法。寒氣減速、調息回 MP、全體雪崩、冰晶護身、冰封。'],
  ['xDrake', '蒼穹龍脈', 'clsDragoon', '蒼穹的試煉', ['長槍', '斧', '雙刀'], 'str', '借用蒼龍之力。穿透三連擊、龍鱗、全體蒼焰、昇龍跳斬、龍王降臨。'],
];
// 新的狀態
ST11('xVow16', '守誓之光', { mods: [{ stage: 'final', who: 'defender', mul: 0.75, cond: { hasPower: 1 } }], triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'heal', target: 'self', pct: 0.05, kind: 'regen', quiet: 1 }] }] });
ST11('xOath16', '不滅誓約', { triggers: [{ on: EVT.DOWN, phase: 'PRE', role: 'tgt', layer: 'prevent', whenDown: 1, onceGroup: 'endure', cond: {}, effects: [{ type: 'prevent_down', hp: 1, key: 'endure', why: 'oath16' }, { type: 'remove_status', target: 'self', status: 'xOath16' }] }] });
ST11('xVeil16', '朧月殘像', { mods: [{ stage: 'defender', who: 'defender', accAdd: -50 }], triggers: [{ on: EVT.MISS, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', mul: { f: 'cnt11', v: 60 }, why: 'veil16' }] }] });
ST11('xTurret16', '自走砲台', { triggers: [{ on: EVT.ROUND_END, phase: 'POST', cond: { ownerAlive: 1 }, effects: [{ type: 'damage', target: 'random_enemy', power: 40, kind: 'follow', tags: ['follow'] }] }] });
ST11('xBoiler16', '鍋爐全開', {});
ST11('xIce16', '冰晶護身', { triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, chance: 0.3, limit: { perAction: 1 }, effects: [{ type: 'stage', target: 'source', stats: { spe: -1 }, dur: 3 }] }] });
ST11('xScale16', '蒼鱗之護', { mods: [{ stage: 'final', who: 'defender', mul: 0.8, cond: { cat: '特', hasPower: 1 } }] });
if (typeof BUFF12 !== 'undefined') Object.assign(BUFF12, { xVow16: { n: '守誓之光', k: 'def', tip: '受到的傷害 −25%，每回合回 5% HP' }, xOath16: { n: '不滅誓約', k: 'def', tip: 'HP 歸零時留下 1 HP' }, xVeil16: { n: '朧月殘像', k: 'def', tip: '迴避 +50%，閃過時反擊' },
  xTurret16: { n: '自走砲台', k: 'atk', tip: '每回合結束自動砲擊' }, xBoiler16: { n: '鍋爐全開', k: 'atk', tip: '結束時物防 −1 階' }, xIce16: { n: '冰晶護身', k: 'def', tip: '被打時 30% 讓對手速度 −1' }, xScale16: { n: '蒼鱗之護', k: 'def', tip: '受到的魔法傷害 −20%' } });
const SLP16 = (p, pb) => [{ type: 'status', status: 'slp', chance: p, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1, tgtBig: 0 } }, { type: 'status', status: 'slp', chance: pb, secondary: true, cond: { tgtAlive: 1, tgtNoMajor: 1, tgtBig: 1 } }];
// 招式：[pos, key, 名字, 威力, 段數, 冷卻, MP, 全體, 說明, x, 類別（物／特／變）]
const EXSK16 = {
  xDawn: [
    ['1a', 'xDawnSlash', '晨星斬', 110, 0, 3, 18, 0, '帶著晨星之光的一刀，打中後回復造成傷害的 15% HP。', { cls: 'slash', after: [{ type: 'heal', target: 'self', ofCast: 0.15, kind: 'drain', quiet: 1 }] }, '物'],
    ['2a', 'xDawnVow', '守誓之光', 0, 0, 6, 18, 0, '3 回合受到的傷害 −25%，每回合結束回 5% HP。', { effects: [{ type: 'status', target: 'self', status: 'xVow16', dur: 3 }] }, '變'],
    ['3a', 'xDawnPillar', '破曉光柱', 85, 0, 4, 26, 1, '晨光化成光柱從天而降，打全體；50% 讓對手魔防 −1。', { cls: 'area', effects: DMG11(SG11({ spd: -1 }, 0.5)) }, '特'],
    ['4a', 'xDawnOath', '不滅誓約', 0, 0, 8, 20, 0, '3 回合內 HP 歸零時留下 1 HP（每場戰鬥 1 次）。', { effects: [{ type: 'status', target: 'self', status: 'xOath16', dur: 3 }] }, '變'],
    ['5a', 'xDawnJudge', '晨星審判', 230, 0, 7, 40, 0, '蓄力 1 回合，喚來晨星落下審判；對破防中的對手必定會心。', { cls: 'bolt', charge: 1, mods: [{ ...CRIT11, cond: { tgtStatus: 'broken' } }] }, '特']],
  xMoon: [
    ['1a', 'xMoonFlash', '緋月一閃', 100, 0, 3, 18, 0, '搶先的一閃，會心率 +50%。', { cls: 'slash', prio: 1, mods: [{ stage: 'skill', who: 'attacker', critAdd: 50 }] }, '物'],
    ['2a', 'xMoonBlood', '血月連斬', 26, 5, 3, 24, 0, '五段連斬，每段 30% 流血；對流血的對手每段 ×1.3。', { cls: 'slash', effects: DMG11(STA11('bleed14', 0.3)), mods: [MUL11(1.3, { tgtStatus: 'bleed14' })] }, '物'],
    ['3a', 'xMoonMark', '暗月之印', 0, 0, 5, 18, 0, '在對手身上刻下暗月之印：物攻・魔攻 −1 階（3 回合），50% 沉默。', { target: 'enemy', effects: [SG11({ atk: -1, spa: -1 }), STA11('silence14', 0.5)] }, '變'],
    ['4a', 'xMoonVeil', '朧月殘像', 0, 0, 6, 20, 0, '2 回合迴避 +50%；閃過攻擊時反擊（威力 60）。', { effects: [{ type: 'status', target: 'self', status: 'xVeil16', dur: 2 }] }, '變'],
    ['5a', 'xMoonFall', '緋月天墜', 70, 4, 7, 38, 0, '緋月墜下四道月刃；對手 HP 一半以下每段 ×1.3，20% 以下改成 ×1.6。', { cls: 'bolt', mods: [MUL11(1.3, { tgtHpBelow: 0.5 }), MUL11(1.6 / 1.3, { tgtHpBelow: 0.2 })] }, '特']],
  xSong: [
    ['1a', 'xSongWave', '共鳴音波', 60, 2, 3, 20, 1, '琴音化成音波，打全體 2 段。', { cls: 'area' }, '特'],
    ['2a', 'xSongMend', '回春頌', 0, 0, 5, 22, 0, '唱出回春的歌：回復 30% HP，治好異常狀態。', { effects: [{ type: 'heal', target: 'self', pct: 0.3 }, { type: 'cleanse', target: 'self' }] }, '變'],
    ['3a', 'xSongMarch', '凱旋進行曲', 0, 0, 6, 24, 0, '3 回合物攻・魔攻・速度 +1 階。', { effects: [SELF11({ atk: 1, spa: 1, spe: 1 })] }, '變'],
    ['4a', 'xSongLull', '安魂曲', 0, 0, 5, 22, 0, '安眠的旋律：全體 40% 睡眠（菁英・頭目 15%）。', { target: 'all_enemies', effects: SLP16(0.4, 0.15) }, '變'],
    ['5a', 'xSongFinale', '終焉交響', 160, 0, 7, 40, 1, '最後的樂章，打全體；對睡眠中的對手 ×1.5（會被打醒）。', { cls: 'area', mods: [MUL11(1.5, { tgtStatus: 'slp' })] }, '特']],
  xGear: [
    ['1a', 'xGearHammer', '蒸汽錘', 120, 0, 3, 20, 0, '蒸汽推動的重錘一擊，40% 暈眩（菁英・頭目：延後）。', { cls: 'strike', effects: DMG11(STUN14(0.4)) }, '物'],
    ['2a', 'xGearTurret', '自走砲台', 0, 0, 6, 24, 0, '設置自走砲台 3 回合：每回合結束自動砲擊一隻魔物（威力 40）。', { effects: [{ type: 'status', target: 'self', status: 'xTurret16', dur: 3 }] }, '變'],
    ['3a', 'xGearArmor', '鋼鐵裝甲', 0, 0, 6, 20, 0, '穿上蒸汽鋼甲：張開護盾 2 回合（最大 HP 30%、吸收 75%）。', { effects: [{ type: 'ward12', target: 'self', pct: 0.3, abs: 0.75, turns: 2, why: 'gear16' }] }, '變'],
    ['4a', 'xGearBoiler', '鍋爐全開', 0, 0, 6, 18, 0, '3 回合物攻 +2 階、速度 +1 階；結束時物防 −1 階。', { effects: [SELF11({ atk: 2, spe: 1 }), { type: 'status', target: 'self', status: 'xBoiler16', dur: 3 }] }, '變'],
    ['5a', 'xGearBlast', '火藥大爆破', 150, 0, 7, 40, 1, '把火藥桶丟進魔物堆裡引爆，打全體；30% 灼傷。', { cls: 'area', effects: DMG11(STA11('brn', 0.3)) }, '物']],
  xFrost: [
    ['1a', 'xFrostPalm', '寒氣掌', 100, 0, 3, 18, 0, '寒氣凝在掌心打出去，40% 讓對手速度 −1。', { cls: 'strike', effects: DMG11(SG11({ spe: -1 }, 0.4)) }, '特'],
    ['2a', 'xFrostHeart', '冰心訣', 0, 0, 6, 0, 0, '靜下心調息：回 25% MP，下一次攻擊威力 +30%。', { costs: [], effects: [{ type: 'resource', target: 'self', res: 'mp', pct: 0.25, why: 'frost16' }, { type: 'status', target: 'self', status: 'nextPow11' }] }, '變'],
    ['3a', 'xFrostSlide', '雪崩擊', 80, 0, 4, 26, 1, '一拳震落山上的積雪，打全體；30% 退縮。', { cls: 'area', effects: DMG11(FL11(0.3)) }, '物'],
    ['4a', 'xFrostGuard', '冰晶護身', 0, 0, 6, 20, 0, '冰晶包住全身：3 回合物防・魔防 +1 階；被攻擊時 30% 讓對手速度 −1。', { effects: [SELF11({ def: 1, spd: 1 }), { type: 'status', target: 'self', status: 'xIce16', dur: 3 }] }, '變'],
    ['5a', 'xFrostSeal', '萬里冰封', 180, 0, 7, 40, 0, '把對手連同四周一起冰封；50% 凍結（菁英・頭目改成速度 −2 階）。', { cls: 'bolt', effects: DMG11([{ type: 'status', status: 'frozen', chance: 0.5, secondary: true, cond: { tgtAlive: 1, tgtBig: 0 } }, SG11({ spe: -2 }, 1, { cond: { tgtAlive: 1, tgtBig: 1 } })]) }, '特']],
  xDrake: [
    ['1a', 'xDrakeClaw', '龍爪三連', 40, 3, 3, 20, 0, '龍爪般的三連擊，每段無視 30% 物防。', { cls: 'slash', pierceDef: 0.3 }, '物'],
    ['2a', 'xDrakeScale', '蒼鱗之護', 0, 0, 6, 18, 0, '身上浮出蒼龍的鱗片：3 回合物防 +2 階，受到的魔法傷害 −20%。', { effects: [SELF11({ def: 2 }), { type: 'status', target: 'self', status: 'xScale16', dur: 3 }] }, '變'],
    ['3a', 'xDrakeBreath', '蒼焰龍息', 90, 0, 4, 26, 1, '吐出蒼藍的龍焰，打全體；40% 灼傷。', { cls: 'area', effects: DMG11(STA11('brn', 0.4)) }, '特'],
    ['4a', 'xDrakeRise', '昇龍閃', 150, 0, 5, 28, 0, '躍上高空（大部分攻擊打不到），下一次行動化成蒼龍落下，必定會心。', { cls: 'pierce', charge: 1, airborne: 1, mods: [CRIT11] }, '物'],
    ['5a', 'xDrakeKing', '龍王降臨', 200, 0, 8, 42, 1, '龍王的虛影降臨，打全體；之後 2 回合物攻・魔攻 +1 階。', { cls: 'area', after: [SELF11({ atk: 1, spa: 1 }, 2)] }, '特']],
};
BR.FORMULA.exAtk16 = c => { const S = c.src.stats; return Math.max(S.atk, S.spa) / Math.max(1, S.atk); };
function exPhys16(id) { const D = DEF.skills[id]; if (!D) return; D.mods.push({ stage: 'skill', who: 'attacker', atkMul: { f: 'exAtk16' }, cond: { srcIsHero: 1 } });
  const i = D.mods.findIndex(m => m.mul && m.mul.f === 'attrScale'); if (i >= 0) { const m = D.mods[i]; D.mods.splice(i, 1, { ...m, cond: { ...m.cond, magHi15: 0 } }, { ...m, mul: { f: 'attrScale', v: ['int', 1] }, cond: { ...m.cond, magHi15: 1 } }); } }
for (const [key, n, flag, quest, wk, attr, d] of EXDEF16) {
  const kind = 'EX·' + n, rows = EXSK16[key]; TREE11[kind] = { ex: 1, cat: '物', attr: [attr, 1], sk: rows.map(r => r.slice(0, 10)), sp: [], nodes: [] }; sk11Build(kind);
  for (const r of rows) { const id = 't_' + r[1], D = DEF.skills[id]; EX16.ids[id] = key; if (!D) continue;
    if (r[10] === '特') { magicize15(id); D.desc = r[8]; if (MOVES[id]) MOVES[id].d = r[8]; } else if (r[10] === '物') exPhys16(id);
    if (D.metadata) { D.metadata.ex16 = key; D.metadata.unlock = null; } D.tags = D.tags.concat(['ex16']); }
  EX16.order.push(key); EX16.trees[key] = { key, n, flag, quest, wk, d, kind, rows }; }
// ---------- 點數・開放 ----------
const ex16 = (st = Game.st) => { const E = st.ex16 || (st.ex16 = { lv: {} }); E.lv = E.lv || {}; return E; };
const exOpen16 = (key, st = Game.st) => !!(EX16.live && ((st.flags || {})[EX16.trees[key].flag] || (typeof FXT13 !== 'undefined' && FXT13.on) || (typeof fxtest13 === 'function' && fxtest13())));
const exLv16 = (id, st = Game.st) => { const key = EX16.ids[id]; if (!key || !exOpen16(key, st)) return 0; const v = ex16(st).lv[id] || 0; return EX16.trees[key].rows[0][1] === id.slice(2) ? Math.max(1, v) : v; };
const exTotal16 = (st = Game.st) => EX16.order.filter(k => (st.flags || {})[EX16.trees[k].flag]).length * 2 + bossPts11(st) + EXMILE16.filter(l => (st.lv || 1) >= l).length + (ex16(st).bonus || 0);
const exSpent16 = (st = Game.st) => { let n = 0; for (const id in ex16(st).lv) { const key = EX16.ids[id]; if (!key) continue; const v = ex16(st).lv[id] || 0; n += EX16.trees[key].rows[0][1] === id.slice(2) ? Math.max(0, v - 1) : v; } return n; };
const exLeft16 = (st = Game.st) => Math.max(0, exTotal16(st) - exSpent16(st));
const exAny16 = (st = Game.st) => EX16.order.some(k => exOpen16(k, st));
const exUsable16 = (key, st = Game.st) => { const K = curKinds11(st); return EX16.trees[key].wk.some(k => K.includes(k)); };
function exNode16(key, j, st = Game.st) { const T = EX16.trees[key], r = T.rows[j], id = 't_' + r[1], lv = exLv16(id, st);
  if (!exOpen16(key, st)) return { ok: false, why: '完成「' + T.quest + '」開放', lock: 1 };
  if (lv >= 3) return { ok: false, why: '已經學滿', full: 1 };
  const need = EXLV16[j + 1]; if (need && (st.lv || 1) < need) return { ok: false, why: 'Lv' + need + ' 開放' };
  if (j > 0 && exLv16('t_' + T.rows[j - 1][1], st) < 1) return { ok: false, why: '要先學「' + T.rows[j - 1][2] + '」' };
  if (exLeft16(st) < 1) return { ok: false, why: 'EX 點不夠' };
  return { ok: true }; }
function exInfo16(id, st = Game.st) { const D = DEF.skills[id], key = EX16.ids[id], T = EX16.trees[key], lv = Math.max(1, exLv16(id, st)), mp = (D.costs || []).find(c => c.res === 'mp');
  const kind = !D.power ? '輔助' : D.cat === '物' ? '物理' : '魔法', pw = D.power ? Math.round(D.power * (1 + 0.1 * (lv - 1))) : null, mpv = mp ? 'MP' + (D.power ? mp.amount : Math.round(mp.amount * (1 - 0.1 * (lv - 1)))) : 'MP0';
  return 'EX・' + kind + (pw ? '・威力' + pw + (D.hits ? '×' + D.hits[0] : '') : '') + '・' + mpv + '・冷卻' + (D.cooldown || 0) + (D.prio ? '・搶先' : '') + (D.target === 'all_enemies' ? '・全體' : '') + (D.charge ? '・蓄力' : '') + '　' + D.desc + '　【EX「' + T.n + '」Lv' + lv + '・限' + T.wk.join('・') + '】'; }
if (EX16.live) {
  // 戰鬥裡用得到的招：手上的武器對得上的 EX 樹
  { const _g = BB.granted; BB.granted = function (st = Game.st) { const out = _g.call(this, st); for (const key of EX16.order) { if (!exOpen16(key, st) || !exUsable16(key, st)) continue; for (const r of EX16.trees[key].rows) { const id = 't_' + r[1]; if (exLv16(id, st) > 0 && !out.includes(id)) out.push(id); } } return out; }; }
  // 技能欄：暫時不能用的 EX 招先記著，換回對的武器時放回去
  { const _sl = BB.slots; BB.slots = function (st = Game.st) { const keep = (st.slots || []).filter(id => EX16.ids[id]); const mem = st.exSlots16 = [...new Set((st.exSlots16 || []).concat(keep))].filter(id => exLv16(id, st) > 0);
      const s = _sl.call(this, st), av = BB.available(st); for (const id of mem) if (av.includes(id) && !s.includes(id) && s.length < BB.SLOTS) s.push(id); st.slots = s; return s; }; }
  { const _nm = BB.nameOf; BB.nameOf = function (st, id) { if (EX16.ids[id]) return DEF.skills[id].name; return _nm.call(this, st, id); }; }
  { const _so = BB.sourceOf; BB.sourceOf = function (st, id) { if (EX16.ids[id]) return 'EX「' + EX16.trees[EX16.ids[id]].n + '」Lv' + Math.max(1, exLv16(id, st)); return _so.call(this, st, id); }; }
  { const _si = BB.skillInfo; BB.skillInfo = function (st, id) { if (EX16.ids[id]) return exInfo16(id, st); return _si.call(this, st, id); }; }
  // 等級：每級威力 +10%（輔助招 MP −10%）；鍋爐全開結束時物防 −1
  PV('ex16', v => { const mods = [], triggers = []; for (const id in v.lv) { const D = DEF.skills[id], n = v.lv[id]; if (!D || n <= 1) continue;
      if (D.power) mods.push({ stage: 'skill', who: 'attacker', mul: 1 + 0.1 * (n - 1), cond: { skillIs: id } }); else mods.push({ costMul: Math.max(0.5, 1 - 0.1 * (n - 1)), res: 'mp', cond: { skillIs: id } }); }
    triggers.push({ on: EVT.STATUS_EXPIRE, phase: 'POST', cond: { statusIs: 'xBoiler16' }, effects: [{ type: 'stage', target: 'self', stats: { def: -1 }, dur: 3 }] });
    return { mods, triggers }; }, { n: 'EX 技能' });
  { const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); if (!st) return s; const lv = {};
      for (const id in EX16.ids) { const n = exLv16(id, st); if (n) lv[id] = n; } s.passives.push({ key: 'ex16', v: { lv }, src: 'tree' });
      if (typeof FXT13 !== 'undefined' && FXT13.on) for (const key of EX16.order) if (exUsable16(key, st)) for (const r of EX16.trees[key].rows) { const id = 't_' + r[1]; if (!s.skills.includes(id)) s.skills.push(id); }
      return s; }; }
}
// ---------- 原本被任務鎖住的招：不用解鎖；晨曦之刃 → 劍 4c、雙相斬 → 雙劍 3c ----------
if (EX16.live) {
  for (const k of Object.keys(TREE11)) for (const r of TREE11[k].sk || []) { const D = DEF.skills['t_' + r[1]]; if (D && D.metadata && ['clsDragoon', 'clsMonk', 'hiddenCls'].includes(D.metadata.unlock)) { D.metadata.unlock = null; if (r[9]) r[9] = { ...r[9], unlock: null }; } }
  const move = (id, to, pos, d) => { for (const k of Object.keys(TREE11)) { const S = TREE11[k].sk || [], i = S.findIndex(r => 't_' + r[1] === id); if (i < 0) continue; const [r] = S.splice(i, 1);
      const nr = [pos].concat(r.slice(1)); nr[8] = d; const T = TREE11[to].sk, j = T.reduce((a, s, q) => s[0] <= pos ? q : a, -1); T.splice(j + 1, 0, nr); SK_TREE11[id] = [to, pos];
      const D = DEF.skills[id]; if (D) { D.desc = d; if (D.metadata) Object.assign(D.metadata, { tree11: to, pos }); } if (MOVES[id]) MOVES[id].d = d; return; } };
  move('t_cmDawn', '劍', '4c', '吸取傷害的 20% HP，會心率加倍。'); move('t_cmTwin', '雙劍', '3c', '第 1 段物理、第 2 段魔法（各 60）。');
}
// ---------- 任務・文字 ----------
const EXQ16 = { hiddenCls: 'xDawn', spellbladeOk: 'xMoon', clsBard: 'xSong', clsMachinist: 'xGear', clsMonk: 'xFrost', clsDragoon: 'xDrake' };
if (EX16.live) {
  const N = k => EX16.trees[k].n;
  NC_TXT12.push(
    [/解鎖了戰技樹的絕技「晨曦之刃」「雙相斬」！/g, '學會了 EX 技能樹「' + N('xDawn') + '」！'],
    [/解鎖了(吟遊詩人|機工士|武僧|龍騎士)的絕技！/g, (m, c) => '學會了 EX 技能樹「' + N({ 吟遊詩人: 'xSong', 機工士: 'xGear', 武僧: 'xFrost', 龍騎士: 'xDrake' }[c]) + '」！'],
    [/武僧的道路，從今天開始。/g, '雪峰寺的心法，從今天起傳給你。'],
    [/龍騎士的跳躍，會帶你飛到任何地方。/g, '蒼龍的力量，會帶你飛到任何地方。'],
    [/去吧，龍騎士。/g, '去吧，年輕人。'],
    [/完成了！機工士的工具組！/g, '完成了！蒸汽機巧的工具組！'],
    [/這三頁劍譜，就是它的全部。/g, '這三頁劍譜——緋月劍譜，就交給你了。'],
    [/機工士之道/g, '鐘塔的機巧'], [/龍騎士的試煉/g, '蒼穹的試煉']);
  for (const k of Object.keys(ZJ_OF12)) delete ZJ_OF12[k];   // 舊的「解鎖了絕技」通知不用了
  { const _ql = questList; questList = function (st = Game.st) { const L = _ql(st), R = { 機工士之道: '鐘塔的機巧', 龍騎士的試煉: '蒼穹的試煉' }, Q = { 初代勇者的試煉: 'xDawn', 失落的劍譜: 'xMoon', 失落的樂譜: 'xSong', 鐘塔的機巧: 'xGear', 雪峰寺的試煉: 'xFrost', 蒼穹的試煉: 'xDrake' };
      for (const q of L) { if (R[q.n]) q.n = R[q.n]; const key = Q[q.n]; if (!key) continue; const T = EX16.trees[key];
        if (typeof q.t === 'string') q.t = q.t.replace(/機工士之道/g, '鐘塔的機巧').replace(/^完成：.*$/, '完成：' + (key === 'xDawn' ? '通過了初代勇者的試煉，' : key === 'xMoon' ? '打贏了流浪的魔劍士，' : '') + '學會了 EX 技能樹「' + T.n + '」。');
        q.rw = 'EX 技能樹「' + T.n + '」（限' + T.wk.join('・') + '）'; } return L; }; }
  for (const n of ['初代勇者的試煉', '失落的劍譜', '失落的樂譜', '鐘塔的機巧', '雪峰寺的試煉', '蒼穹的試煉', '機工士之道', '龍騎士的試煉']) QUEST_CATS[n] = 'EX';
  { const i = GROW12.findIndex(g => g[0] === '絕技'); if (i >= 0) GROW12[i] = ['絕技', '每棵武器技能樹的第四段（Lv35，要第三段任一招 Lv3）。'];
    GROW12.push(['EX 技能', '完成六個 EX 任務（初代勇者的試煉・失落的劍譜・失落的樂譜・鐘塔的機巧・雪峰寺的試煉・蒼穹的試煉），各開放一棵 EX 技能樹。EX 點另外算：完成 EX 任務 +2、主線頭目每隻 +1、Lv20・30・40・50・60 各 +1。手上拿著那棵樹指定的武器才能用它的招。']); }
  ch2ClassTalk = function* () { const st = Game.st, n = ['clsBard', 'clsMachinist', 'clsMonk', 'clsDragoon'].filter(k => st.flags[k]).length;
    yield* say('王都的導師們都有自己的絕活。完成他們的試煉，就能學到「EX 技能樹」。' + (n ? '\n（已經學會 ' + n + '/4 位導師的 EX 技能樹）' : '\n（詩人公會・鐘錶師・雪峰寺・龍騎士老人）')); };
  // 任務完成（或舊存檔）→ 告訴玩家哪棵 EX 樹開了、EX1 已經學會、要拿什麼武器
  { const _u = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const st = this.st, f = st && st.flags;
      if (f && !this.script && !UI.stack.length && !Game.trans && !(typeof FXT13 !== 'undefined' && FXT13.on)) { const told = f.exTold16 || (f.exTold16 = {}); const fl = Object.keys(EXQ16).find(q => f[q] && !told[q]);
        if (fl) { told[fl] = 1; const T = EX16.trees[EXQ16[fl]]; this.run((function* () { yield* itemGet('開放了 EX 技能樹「' + T.n + '」！'); yield* say('EX1「' + T.rows[0][2] + '」已經學會了。\n（選單 →「技能樹」→ EX 技能樹；手上拿著' + T.wk.join('・') + '才能用）'); })()); return; } }
      return _u.apply(this, a); }; }
}
// ---------- 畫面：EX 技能樹 ----------
function* exScreen16() { const st = Game.st, K = EX16.order, VIS = 5, LY = 38; let ti = Math.max(0, K.findIndex(k => exOpen16(k, st) && exUsable16(k, st))), sel = 0, onTabs = false;
  const tabY = 22, tabH = 13, lab = k => exOpen16(k, st) ? EX16.trees[k].n : '？？？';
  const scr = { touchBack: true, draw(x) { const key = K[ti], T = EX16.trees[key], open = exOpen16(key, st);
      screenBG(x); headerBar(x, 'EX 技能樹' + (open && exUsable16(key, st) ? '（能用）' : '')); const left = exLeft16(st); Font.drawR(x, 'EX 點 ' + left, W - 6, 3, left ? UIC.warm : UIC.muted, UIC.textSh, 9);
      const wd = K.map(k => Math.ceil(Font.width(lab(k), 9)) + 10), xs = []; let acc = 0; for (const w of wd) { xs.push(acc); acc += w + 2; }
      const span = W - 8, off = clamp(xs[ti] + wd[ti] / 2 - span / 2, 0, Math.max(0, acc - 2 - span));
      x.save(); x.beginPath(); x.rect(4, tabY, span, tabH); x.clip();
      K.forEach((k, j) => { const X = Math.round(4 + xs[j] - off); if (X + wd[j] < 4 || X > W - 4) return; const on = j === ti, use = exOpen16(k, st) && exUsable16(k, st);
        x.fillStyle = on ? (onTabs ? 'rgba(110,231,210,0.45)' : PANEL.sel) : 'rgba(20,26,48,0.85)'; x.fillRect(X, tabY, wd[j], tabH); x.fillStyle = on ? UIC.accent : use ? UIC.warm : PANEL.edge; x.fillRect(X, tabY + tabH - 1, wd[j], 1);
        Font.draw(x, lab(k), X + 5, tabY, on ? UIC.text : use ? UIC.warm : UIC.muted, UIC.textSh, 9);
        if (typeof touchRegion === 'function') touchRegion(Math.max(4, X), tabY - 1, Math.min(wd[j], W - 4 - X), tabH + 2, () => { onTabs = false; if (ti !== j) { ti = j; sel = 0; Sound.sfx('cursor'); } }); });
      x.restore(); if (off > 0) Font.draw(x, '‹', 0, tabY, UIC.accent, UIC.textSh, 9); if (off < acc - 2 - span - 0.5) Font.drawR(x, '›', W, tabY, UIC.accent, UIC.textSh, 9);
      drawWin(x, 4, LY, 168, VIS * 15 + 8, 'menu');
      T.rows.forEach((r, j) => { const Y = LY + 5 + j * 15, id = 't_' + r[1], lv = exLv16(id, st), s = exNode16(key, j, st); if (j === sel && !onTabs) selBar(x, 6, Y - 1, 164, 14);
        Font.draw(x, 'EX' + (j + 1), 10, Y, UIC.muted, UIC.textSh, 8); Font.draw(x, open ? r[2] : '？？？', 34, Y - 1, lv ? '#c8f0ff' : s.ok ? UIC.text : UIC.dis, UIC.textSh, 10);
        Font.drawR(x, lv ? 'Lv' + lv + '/3' : s.ok ? '可學' : (s.why || '').replace(/^要先學.*/, '前置').replace(/^完成.*/, '未開放').slice(0, 8), 166, Y, lv ? UIC.accent : UIC.muted, UIC.textSh, 8);
        if (typeof touchRegion === 'function') touchRegion(6, Y - 1, 164, 14, () => { if (onTabs) { onTabs = false; sel = j; Sound.sfx('cursor'); return; } if (sel === j) tapKey('a'); else { sel = j; Sound.sfx('cursor'); } }); });
      const Y0 = LY + VIS * 15 + 12; drawWin(x, 4, Y0, 168, 252 - Y0, 'menu'); let info;
      if (onTabs) info = '選 EX 技能樹：←→ 換樹，↓ 或 A 回到清單。';
      else if (!open) info = '「' + T.n + '」\n完成任務「' + T.quest + '」後開放。\n限：' + T.wk.join('・');
      else { const r = T.rows[sel], id = 't_' + r[1], s = exNode16(key, sel, st); info = exInfo16(id, st) + '\n' + (s.ok ? '按 A：花 1 點 EX 點升到 Lv' + (exLv16(id, st) + 1) + '。' : s.full ? '' : s.why); }
      drawFitText(x, info, 10, Y0 + 4, 152, 252 - Y0 - 8, 10, UIC.text); } };
  UI.push(scr);
  while (true) { const key = K[ti], T = EX16.trees[key];
    if (onTabs) { if (Input.pressed('left') || Input.pressed('right')) { const d = Input.pressed('left') ? -1 : 1; Input.consume('left', 'right'); ti = (ti + d + K.length) % K.length; sel = 0; Sound.sfx('cursor'); }
      if (Input.pressed('down') || Input.pressed('a')) { Input.consume('down', 'a'); onTabs = false; Sound.sfx('cursor'); }
      if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; continue; }
    if (Input.pressed('left') || Input.pressed('right')) Input.consume('left', 'right');
    if (Input.pressed('up') && sel === 0) { Input.consume('up'); onTabs = true; Sound.sfx('cursor'); yield; continue; }
    if (Input.repeat('up') && sel > 0) { sel--; Sound.sfx('cursor'); } if (Input.repeat('down') && sel < T.rows.length - 1) { sel++; Sound.sfx('cursor'); }
    if (Input.pressed('a')) { Input.consume('a'); const id = 't_' + T.rows[sel][1], s = exNode16(key, sel, st);
      if (s.ok) { const E = ex16(st), lv = exLv16(id, st); E.lv[id] = lv + 1; Sound.sfx(lv ? 'statUp' : 'select'); if (!lv) BB.slots(st); } else Sound.sfx('bump'); }
    if (Input.pressed('b')) { Input.consume('b'); Sound.sfx('cancel'); break; } yield; }
  UI.remove(scr); }
if (EX16.live) { const _ts = treeScreen11; treeScreen11 = function* (start) { const st = Game.st; if (!exAny16(st)) return yield* _ts(start);
    while (true) { const n = exLeft16(st), r = yield* ask('要看哪一種技能樹？', ['武器・共通技能樹', 'EX 技能樹' + (n ? '（剩 ' + n + ' 點）' : ''), '返回']); if (r === 0) yield* _ts(start); else if (r === 1) yield* exScreen16(); else return; } }; }
// 特效測試版：EX 點給滿（EX 樹全部開放）
if (EX16.live) { const _s = fxtSetup13; fxtSetup13 = function (kind) { _s(kind); ex16(Game.st).bonus = 99; }; }
