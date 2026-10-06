/* ===================== v12.76 元素系統拿掉（玩家 2026-10-07：「法杖的技能改回不要偏元素化，然後重新審視元素屬性相關的系統是否存在必要」） =====================
   檢查結果：主角這邊只有法杖的招有屬性（其他 9 棵樹全部無屬性），近戰只能在鐵匠給武器固定一個屬性（火打 124 種弱點，等於沒有選擇）；
   頭目後半戰換弱點，但一場戰鬥只有一把武器、換了也打不到；天氣的屬性 ±% 和感電・燎原這些反應玩家感覺不到。→ 整套拿掉：
   · 魔物弱點・抗性（×1.5／×0.6）、名牌的「弱」、遭遇卡和圖鑑的弱點欄、頭目後半戰換弱點（後半戰的蓄力大招和稀有部位照留）
   · 屬性反應（感電・燎原・蒸氣・結冰・毒焰・泥濘・夜光）；水晶魔像淹水的「潮濕」改成速度 −20%
   · 鐵匠的「賦予屬性」（r9w）：已經賦予的武器在讀檔時清掉，潛力和魔素全額退回
   · 法杖改回魔力招（r9x／v8／12c）、天氣的戰鬥加成（09zv）、跟屬性有關的飾品・晶石・稱號・戰技樹「識破」改成別的效果（各檔案）
   魔物招式的屬性（MOVES.t）只留下來決定特效顏色。 */

/* ---------- 1. 沒有弱點・抗性 ---------- */
famMult = function () { return 1; };
BR.famMult = () => 1;
for (const f in FAMILIES) { FAMILIES[f].weak = []; FAMILIES[f].resist = []; }
for (const k in WEAK11) delete WEAK11[k];
// the encounter card / dex line: the family and what it can't catch (no more 弱／抗)
const IMM_N14 = { psn: '中毒', par: '麻痺', slp: '睡眠', brn: '灼傷' };
famText = function (sp) { const S = SPECIES[sp] || {}, F = FAMILIES[S.fam] || {}; return (F.n || '') + (F.immune && F.immune.length ? '　不會' + F.immune.map(q => IMM_N14[q] || q).join('・') : ''); };
dexWeak11 = function (sp) { return famText(sp) || '—'; };
PHASE_TXT.hunt2 = n => [n + '進入了後半戰！'].concat(Game.st.flags.tutHunt2 ? [] : (Game.st.flags.tutHunt2 = 1, ['（頭目 HP 剩一半時進入後半戰，會多一招蓄力大招。後半戰打出破防，會多掉稀有部位！）']));

/* ---------- 2. 屬性反應 ---------- */
{ const L = DEF.mechanics.elementReactions.triggers; for (let i = L.length - 1; i >= 0; i--) { const c = L[i].cond || {}; if (c.evEl || c.element) L.splice(i, 1); } }
// 潮濕 (only the 水晶魔像's flood gives it now): speed −20%
{ const _sp = BR.speed; BR.speed = function (core, u) { const v = _sp.call(this, core, u); return core.hasStatus(u, 'wet') ? v * 0.8 : v; }; }
if (typeof BUFF12 !== 'undefined' && BUFF12.wet) BUFF12.wet.tip = '速度 −20%';

/* ---------- 3. 舊存檔：武器的屬性清掉，退回潛力和魔素 ---------- */
function noElFix14(st) { if (!st) return; let n = 0, back = 0;
  const all = [].concat(st.gear || [], Array.isArray(st.stash) ? st.stash : []);
  for (const g of all) { if (!g || !g.el) continue; const B = GEAR[g.b] || {}, pts = Math.max(1, Math.round(ELPTS11 * (B.t || 1)));
    delete g.el; n++; back += pts; if (g.e11 && g.e11.魔素) g.e11.魔素 = Math.max(0, g.e11.魔素 - pts); }
  if (!n) return; try { ptsPay11({ 魔素: back }, st, 1); } catch (e) { bvErr('v12.76', 'refund ' + e.message); }
  st.flags = st.flags || {}; st.flags.noElNote14 = (st.flags.noElNote14 || 0) + back; }
{ const _so = startOverworld; startOverworld = function (...a) { try { noElFix14(Game.st); } catch (e) { bvErr('v12.76', 'noEl ' + e.message); } const ow = _so.apply(this, a);
    const st = Game.st, b = st && st.flags && st.flags.noElNote14;
    if (b && ow) { st.flags.noElNote14 = 0; const prev = ow.script, note = function* () { if (prev) yield* prev; yield* say('（這次改版拿掉了「屬性」：武器上賦予的屬性已經清掉，退回魔素 ' + b + ' 點。）'); }; ow.script = null; ow.run(note()); } return ow; }; }

/* ---------- 4. 說明文字 ---------- */
{ const RP = [[/弱點和會心/g, '會心'], [/用弱點或會心/g, '用會心'], [/，或用弱點、會心打破護盾來打斷蓄力/g, '，或用會心打破護盾來打斷蓄力'], [/打中弱點或會心各削 1 格/g, '打出會心削 1 格'], [/弱點改變，/g, ''],
    [/武器的屬性在鐵匠賦予[。，]?/g, ''], [/（武器沒屬性時是火）/g, ''], [/，帶武器的屬性/g, '']];
  const fx = t => { if (typeof t !== 'string') return t; for (const [a, b] of RP) t = t.replace(a, b); return t; };
  const drop = t => typeof t === 'string' && /屬性組合|感電|燎原|蒸氣|屬性抗性|弱點.*屬性|屬性.*弱點/.test(t);
  if (typeof BATTLE_HELP !== 'undefined') for (const b of BATTLE_HELP) if (Array.isArray(b[1])) b[1] = b[1].filter(t => !drop(t)).map(fx);
  if (typeof GROW12 !== 'undefined') for (const b of GROW12) b[1] = fx(b[1]);
  if (typeof HINT12 !== 'undefined' && Array.isArray(HINT12)) for (let i = HINT12.length - 1; i >= 0; i--) if (HINT12[i][0] === 'h12weak2') HINT12.splice(i, 1); }
