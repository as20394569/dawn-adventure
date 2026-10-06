/* ===================== v12.23 裝備詳情寫清楚每個詞條＋掉落的裝備要對得上魔物（玩家 2026-10-05） =====================
   1. 「裝備詳情要看的到裝備詳細的詞條解釋」→ 選「每個詞條下面直接寫」，範圍「賦予詞條・★特殊效果」「武器種類・防具類型」：
      · 賦予詞條（物攻 +2% 等）：下面寫實際效果和階數（2／10 階）；屬性：哪些招式變成這個屬性、打弱點／抗性的倍率。
      · 特殊能力（會心・格擋・吸血…）和★特殊效果（堅守回復…）：原本只有名字，下面寫效果。
      · 武器種類：物理／魔法、普攻打幾下、技能樹、特性（學會了沒）、雙持（雙刀・雙劍・雙盾）。
      · 防具類型（重甲・輕裝・法衣）：每件的效果，和現在身上穿了幾件、合計多少。
      · 順便修：晶石孔的那一行（「◇ 空的晶石孔」「◆晶石」）原本沒畫出來（少了字的大小和縮排）。
      背包・商店的小框不放說明（太擠），按 → 進詳情才看得到。
   2. 「小野豬掉落狼牙項鍊不太合理 相關的也請修正」：野外魔物掉的裝備原本是從整張地圖的清單裡隨便抽。
      改成：名字（或外觀）寫到某種生物的裝備——狼、羽、鷹、蛙・蟾、蟹・鉗、蠍、雪人、虎、龍・鱗、蜥、角・甲蟲、骸骨・骨、蜂・蜜、毛皮——
      只會從那種魔物身上掉；盜賊、士兵、騎士這些本來就穿戴裝備的魔物什麼都可能掉。沒有合適的就不掉。
      （例：風車丘陵的小野豬只會掉旅人布帽・旅人皮甲・旅人皮靴・晨霧長靴；狼牙頸鍊只有狼會掉，羽毛的只有鳥會掉。） */

/* ---------- 2. drops that fit the monster ---------- */
const DROP_THEME12 = [
  [/狼/, s => /狼/.test(s.n)], [/(?<!黑)羽|翼/, s => s.fam === 'bird'], [/鷹/, s => s.fam === 'bird'], [/蛙|蟾/, s => /蛙|蟾/.test(s.n)], [/蟹|鉗/, s => /蟹|鉗/.test(s.n)],
  [/蠍/, s => /蠍/.test(s.n)], [/雪人/, s => /雪人/.test(s.n)], [/虎/, s => /虎|貓/.test(s.n)], [/龍|鱗/, s => /龍|蜥|鱷|守宮|魚/.test(s.n)], [/蜥/, s => /蜥|守宮/.test(s.n)],
  [/甲蟲|角/, s => /角|甲蟲/.test(s.n)], [/骸骨|骨/, s => s.fam === 'undead'], [/蜂|蜜/, s => /蜂/.test(s.n)], [/毛皮/, s => s.fam === 'beast'],
];
const dropCarrier12 = s => s.fam === 'human' || /兵|騎士|盜賊|法師|打手|鎧甲/.test(s.n);
function dropNames12(k) { const G = GEAR[k]; if (!G) return ''; const b = typeof base11Of === 'function' ? base11Of(k) : k; return G.n + ' ' + ((GEAR[b] || G).n); }
function dropFits12(k, sp) { const s = SPECIES[sp]; if (!s || dropCarrier12(s)) return true; const n = dropNames12(k);
  for (const [rx, ok] of DROP_THEME12) if (rx.test(n) && !ok(s)) return false; return true; }
function pickDrop12(pool, sp) { const L = (pool || []).filter(k => GEAR[k] && dropFits12(k, sp)); return L.length ? pick(L) : null; }

/* ---------- 1. the gear page: every line explained ---------- */
const EXP_C12 = '#aab8d0', HEAD_C12 = '#ffd890';
// (short: the line above already says the number)
const EN_EXP12 = { atk: n => '整體物攻 ×' + (1 + n / 100).toFixed(2), spa: n => '整體魔攻 ×' + (1 + n / 100).toFixed(2), def: n => '整體物防 ×' + (1 + n / 100).toFixed(2), spd: n => '整體魔防 ×' + (1 + n / 100).toFixed(2),
  hp: n => '整體最大 HP ×' + (1 + n / 100).toFixed(2), crit: () => '會心時傷害 ×1.5', spe: () => '速度快的先行動', stRes: () => '中毒・麻痺・睡眠等異常有這個機率擋下', heal: () => '回復技能・道具的回復量提高' };
const SP_EXP12 = { crit: () => '會心時傷害 ×1.5', hit: () => '比較不會打空', eva: () => '比較容易閃過攻擊', drain: () => '打出傷害的這個比例回復 HP（合計最多 20%）',
  elem: () => '火・水・雷・草・毒・岩屬性的攻擊更痛', block: () => '被攻擊時有這個機率格擋，那一下傷害 −40%', critDmg: () => '會心的那一下再更痛', stHit: () => '讓對手中異常的機率提高',
  stRes: () => '中毒・麻痺・睡眠等異常有這個機率擋下', healUp: () => '回復技能・道具的回復量提高' };
const elExp12 = (el, magic) => '普攻和無屬性的' + (magic ? '魔法' : '物理') + '招式變' + el + '屬性；打弱' + el + ' ×1.5、抗' + el + ' ×0.6';
// a weapon's kind: what it reads, its basic attack, its tree and trait, two in hand
function wKindLines12(g, P) { const B = GEAR[g.b], k = B.kind, st = Game.st, mag = typeof isMagicW === 'function' && isMagicW(k), T = typeof TREE11 !== 'undefined' ? TREE11[k] : null;
  P('【武器】' + k + '・' + (mag ? '魔法武器（看魔攻）' : '物理武器（看物攻）'), HEAD_C12, 9);
  P('能用技能樹「' + k + '」的招式。', EXP_C12, 9, 8);
  const fist = k === '拳套', seg = (typeof WKIND12 !== 'undefined' && WKIND12[k] && WKIND12[k].attack) || 1;
  P('普攻：' + (mag ? '魔法彈打一下（看魔攻）' : seg === 2 ? '打兩下（每下 55%）' : fist ? '打一下；學會特性後打兩下（每下 75%）' : '打一下') + '。', EXP_C12, 9, 8);
  if (T && T.trait) P('特性' + (trLv11(k + ':trait', st) ? '（已學會）' : '（技能樹裡學）') + '：' + T.trait, EXP_C12, 9, 8);
  const pair = k === '短刀' ? ['雙刀', 60] : k === '劍' ? ['雙劍', Math.round((0.6 - (typeof DUALSW12 !== 'undefined' ? DUALSW12.off : 0)) * 100)] : null;
  if (pair) P('兩手都拿' + k + '＝' + pair[0] + '：副手也出手（威力 ' + pair[1] + '%）', EXP_C12, 9, 8); }
function shieldLines12(g, P) { P('【盾】拿在副手', HEAD_C12, 9);
  P('主手也拿盾＝雙盾：普攻「盾擊」打兩下，攻擊力改看物防。', EXP_C12, 9, 8); }
// 重甲・輕裝・法衣: per piece, and what the hero wears now
const ARM_EACH12 = { 重甲: [['受到會心傷害', -12, '%'], ['速度', -3, '%']], 輕裝: [['迴避', 2, '%'], ['第一回合速度', 10, '%']], 法衣: [['每回合回 MP', 1, '%'], ['受到魔法傷害', -4, '%']] };
function armLines12(g, P) { const t = GEAR[g.b].arm9, E = ARM_EACH12[t]; if (!E) return; const fmt = (n) => E.map(([a, v, u]) => a + ' ' + (v * n > 0 ? '+' : '−') + Math.abs(v * n) + u).join('、');
  P('【防具】' + t + '（頭・身・腳每件疊加）', HEAD_C12, 9); P('每件：' + fmt(1), EXP_C12, 9, 8);
  const n = (typeof arm9Count === 'function' ? arm9Count(Game.st) : {})[t] || 0; P(n ? '身上 ' + n + ' 件：' + fmt(n) : '身上沒有穿' + t, EXP_C12, 9, 8); }
{ const _gi = gearInfoLines; gearInfoLines = function (g, wrapW = 150) { const B = g && GEAR[g.b]; if (!B || g._bp === 2) return _gi(g, wrapW);
    const L = [], P = (t, c = UIC.text, s = 10, ind = 0) => { for (const l of Font.wrap(t, wrapW - ind, s)) L.push([l, c, s, ind]); };
    const wpn = B.slot === 'weapon', mag = wpn && typeof isMagicW === 'function' && isMagicW(B.kind);
    const qm = typeof QMUL12 !== 'undefined' && (g.q || 1) > 1 ? '　' + GQ[g.q][0] + '色 基本數值 ×' + QMUL12[g.q] : '';
    P('T' + (B.t || 1) + '・' + kindLabel11(g) + qm + (isOff11(g) ? '（副手：基本數值算一半）' : ''), UIC.accent);
    const [a] = gearLines(g); if (a) P(a, UIC.text, 11);
    // special numbers and ★ effects, one by one
    const o = gearStats(g);
    if (B.elem) { P(B.elem + '屬性武器', UIC.warm, 10); P(elExp12(B.elem, mag), EXP_C12, 9, 8); }
    for (const k in SP_NAMES) if (o.sp[k]) { P(SP_NAMES[k] + ' +' + o.sp[k] + '%', UIC.warm, 10); if (SP_EXP12[k]) P(SP_EXP12[k](o.sp[k]), EXP_C12, 9, 8); }
    for (const [t, v] of o.sp.vs || []) { const n = FAMILIES[t] ? FAMILIES[t].n : t + '系'; P('對' + n + ' +' + v + '%', UIC.warm, 10); P('打' + n + '的魔物傷害 +' + v + '%', EXP_C12, 9, 8); }
    for (const t in o.sp.resist || {}) { P(t + '系傷害 −' + o.sp.resist[t] + '%', UIC.warm, 10); P('受到' + t + '屬性的傷害 −' + o.sp.resist[t] + '%', EXP_C12, 9, 8); }
    for (const f of o.fx) { const S = SPECIALS[f]; if (!S) continue; P('★' + S.n, UIC.warm, 10); if (S.d) P(S.d, EXP_C12, 9, 8); }
    if (B.slot === 'shield' && typeof WARD12 !== 'undefined') { P('開場護盾：最大 HP ' + Math.round(WARD12.shieldT(B.t) * 100) + '%', '#a8e0ff', 10); P('戰鬥開始時張開，吸收 50% 傷害（1 回合）', EXP_C12, 9, 8); }
    // potential, the enchants (with what they do and how far they go), the element
    const pot = potOf11(g), used = potUsed11(g); P('潛力 ' + used + '／' + pot + (crySlots11(g) ? '　晶石孔 ' + crySlots11(g) : ''), used >= pot ? UIC.muted : '#ffe08a');
    for (const k in EN11) { const n = (g.en11 || {})[k]; if (!n) continue; const E = EN11[k]; P('・' + enText11(k, n), '#c8f0ff', 11, 4);
      P((EN_EXP12[k] ? EN_EXP12[k](E[1] * n) + '　' : '') + '賦予 ' + n + '／' + E[6] + ' 階', EXP_C12, 9, 12); }
    if (g.el) { P('・' + g.el + '屬性', '#ffb878', 11, 4); P(elExp12(g.el, mag) + (isOff11(g) ? '（副手那一下用這個屬性）' : ''), EXP_C12, 9, 12); }
    // crystals (these lines used to be left out: no size, no indent)
    for (const l of cryLines11(g)) P(l[0], l[1], 10);
    // what kind of thing it is
    if (wpn) wKindLines12(g, P); else if (B.slot === 'shield') shieldLines12(g, P); else if (B.arm9) armLines12(g, P);
    if (g.gl && GEAR[g.gl]) P('外觀：' + GEAR[g.gl].n, '#d8b8ff', 9);
    if (B.d) P(B.d, UIC.muted, 9);
    return L; }; }
