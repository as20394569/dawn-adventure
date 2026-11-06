/* ===================== v13.0 試做：技能精簡——每種武器 4 招、Lv1〜8、Lv3・Lv6 兩次分化（先做劍） =====================
   玩家：「現在的技能數量確實太多了。RPG 的精髓就是用技能打倒敵人，我打算用少量但可升級的技能當作這遊戲的精髓。」
         「改成 4 招好了，走分化路線。」「先從劍開始，配合新安裝的特效包（pixelfx）。」
   · 每種武器 4 招，全部帶上場（不用技能槽）；只留武器特性（拿掉精通、第三被動、特技、共通樹、裝備附帶的招、招牌技）。
   · 技能點：每種武器各自一池＝(等級 − 1)＋主線頭目第一次打倒各 1 點；招式解鎖時就是 Lv1，之後每升一級 1 點，最高 Lv8；威力每級 +8%。
   · Lv3 第一次分化（A／B），Lv6 第二次分化（A1／A2 或 B1／B2）：名字、效果、特效都換；在城鎮可以重選分化。
   · Lv8 覺醒：特效變金色、變大。
   · 舊存檔第一次用到這套時：那把武器原本技能樹的點數全部退回（招式重新從 Lv1 開始）。
   企劃：docs/技能精簡企劃.md */
const SK4 = { on: true, MAX: 8, B1: 3, B2: 6, FORMS: ['', 'A', 'B', 'A1', 'A2', 'B1', 'B2'], W: {} };
const sk4Id = (k, p) => 't_s4' + k + (p || '');
const sk4FormLv = p => !p ? 2 : p.length === 1 ? 5 : 8; // 特效測試：每種型態用它最常見的等級
ST11('shura4', '修羅', { mods: [{ stage: 'attacker', who: 'attacker', critAdd: 20 }] });
if (typeof BUFF12 !== 'undefined') BUFF12.shura4 = { n: '修羅', k: 'atk', tip: '會心率 +20%' };

/* ---------- 劍 ---------- */
const OG4 = (n, fin, x = {}) => [{ type: 'damage', ...(x.rnd ? { target: 'random_enemy' } : {}) }].concat(Array.from({ length: n - 1 }, () => ({ type: 'damage', cond: { tgtAlive: 1 }, ...(x.rnd ? { target: 'random_enemy' } : {}) })),
  [{ type: 'damage', power: fin, cond: { tgtAlive: 1 }, ...(x.finX ? { critX: x.finX } : {}) }]);
const DRAIN4 = { type: 'heal', target: 'self', ofCast: 0.2, kind: 'drain', quiet: 1 };
SK4.W['劍'] = [
  { k: 'cut', unlock: 1, forms: {
    '': ['斷甲斬', 60, 0, 0, 6, 0, '斬擊，50% 讓對手物防 −1。', { effects: DMG11(SG11({ def: -1 }, 0.5)) }],
    A: ['斷鋼一閃', 85, 0, 0, 9, 0, '一記交叉斬，50% 讓對手物防 −1；對物防下降的對手必定會心。', { mods: [{ stage: 'skill', who: 'attacker', crit: true, cond: { tgtDefDown11: 1 } }], effects: DMG11(SG11({ def: -1 }, 0.5)) }],
    A1: ['一刀天斷', 120, 0, 1, 12, 0, '一定搶先出手，衝過去一刀必定會心。', { prio: 1, mods: [CRIT11] }],
    A2: ['崩星劍', 140, 0, 1, 14, 0, '全力劈下，會心率 +40%，破防中的對手必定會心；再對全部魔物一記震波（威力 40）。',
      { mods: [{ stage: 'skill', who: 'attacker', critAdd: 40 }, { stage: 'skill', who: 'attacker', crit: true, cond: { tgtStatus: 'broken' } }], effects: [{ type: 'damage' }, { type: 'damage', target: 'all_enemies', power: 40, cond: { tgtAlive: 1 } }] }],
    B: ['疾風連斬', 30, 3, 0, 9, 0, '三段快斬，每段 30% 流血。', { effects: DMG11(STA11('bleed14', 0.3)) }],
    B1: ['流光連斬', 26, 5, 1, 12, 0, '五段快斬，會心率 +20%。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 20 }] }],
    B2: ['旋刃', 70, 0, 1, 12, 1, '迴旋斬打全部魔物，會心率 +20%。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 20 }] }] } },
  { k: 'light', unlock: 1, magic: 1, forms: {
    '': ['光刃', 55, 0, 0, 7, 0, '揮劍斬出一道光的劍氣，飛過去砍中對手。', {}],
    A: ['貫光', 50, 0, 1, 10, 1, '劍氣穿過去，打全部魔物。', {}],
    A1: ['光雨', 42, 0, 1, 12, 0, '三道劍氣，每道隨機打一隻魔物。', { effects: [0, 1, 2].map(i => ({ type: 'damage', target: 'random_enemy', ...(i ? { cond: { tgtAlive: 1 } } : {}) })) }],
    A2: ['光輪', 60, 0, 1, 13, 1, '光輪掃過全部魔物，40% 讓魔防 −1。', { effects: DMG11(SG11({ spd: -1 }, 0.4)) }],
    B: ['聚光', 80, 0, 0, 10, 0, '劍氣聚成一道，只打一隻。', {}],
    B1: ['破曉光', 115, 0, 1, 14, 0, '又大又亮的劍氣，必定會心。', { mods: [CRIT11] }],
    B2: ['晨曦之刃', 105, 0, 1, 14, 0, '金色的劍氣，會心率加倍，吸取傷害 20% 的 HP。', { critX: 2, after: [DRAIN4] }] } },
  { k: 'eye', unlock: 10, forms: {
    '': ['心眼', 0, 0, 3, 6, 0, '下一擊必定會心，這回合迴避提高。', { effects: [{ type: 'status', target: 'self', status: 'critNext' }, { type: 'status', target: 'self', status: 'smoke', dur: 1 }] }],
    A: ['明鏡', 0, 0, 3, 8, 0, '下一擊必定會心，2 回合迴避提高。', { effects: [{ type: 'status', target: 'self', status: 'critNext' }, { type: 'status', target: 'self', status: 'smoke', dur: 2 }] }],
    A1: ['止水', 0, 0, 3, 10, 0, '下一擊必定會心，2 回合迴避提高，3 回合物攻 +1。', { effects: [{ type: 'status', target: 'self', status: 'critNext' }, { type: 'status', target: 'self', status: 'smoke', dur: 2 }, SELF11({ atk: 1 })] }],
    A2: ['見切', 0, 0, 3, 10, 0, '下一擊必定會心，這回合迴避提高，被打就反擊。', { effects: [{ type: 'status', target: 'self', status: 'critNext' }, { type: 'status', target: 'self', status: 'smoke', dur: 1 }, { type: 'status', target: 'self', status: 'spearGuard11', dur: 1 }] }],
    B: ['狂刃', 0, 0, 4, 8, 0, '3 回合物攻 +2 階、會心率 +20%；結束時物防 −2 階。', { src: 't_sdFrenzy' }],
    B1: ['修羅', 0, 0, 4, 10, 0, '3 回合物攻 +3 階、會心率 +20%（結束不扣物防）。', { effects: [SELF11({ atk: 3 }), { type: 'status', target: 'self', status: 'shura4', dur: 3 }] }],
    B2: ['殺意', 0, 0, 4, 10, 0, '下一擊必定會心；5 回合物攻 +1、速度 +1。', { effects: [{ type: 'status', target: 'self', status: 'critNext' }, SELF11({ atk: 1, spe: 1 }, 5)] }] } },
  { k: 'og', unlock: 20, forms: {
    '': ['破曉千斬', 40, 0, 5, 22, 0, '三段快斬（各 40），再一記收尾斬（威力 130）；會心率 +30%。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 30 }], effects: OG4(3, 130) }],
    A: ['千斬', 40, 0, 5, 24, 0, '五段快斬（各 40），再一記收尾斬（威力 130）；會心率 +30%。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 30 }], effects: OG4(5, 130) }],
    A1: ['萬斬', 40, 0, 5, 28, 0, '七段快斬（各 40），再一記收尾斬（威力 140）；會心率 +30%。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 30 }], effects: OG4(7, 140) }],
    A2: ['亂舞', 45, 0, 5, 28, 0, '五段快斬（各 45），每段隨機打一隻魔物，再對主目標收尾斬（威力 130）。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 30 }], effects: OG4(5, 130, { rnd: 1 }) }],
    B: ['曉光', 40, 0, 5, 24, 0, '三段快斬（各 40），收尾斬（威力 150）會心率 ×3，吸取傷害 20% 的 HP。', { effects: OG4(3, 150, { finX: 3 }), after: [DRAIN4] }],
    B1: ['天光', 40, 0, 5, 28, 0, '三段快斬（各 40），收尾斬威力 260、會心率 ×3，吸取傷害 20% 的 HP。', { effects: OG4(3, 260, { finX: 3 }), after: [DRAIN4] }],
    B2: ['歸元', 40, 0, 5, 26, 0, '三段快斬（各 40），收尾斬（威力 150）會心率 ×3，吸取 20% HP，打完回 30% MP。', { effects: OG4(3, 150, { finX: 3 }), after: [DRAIN4, { type: 'resource', res: 'mp', pct: 0.3, target: 'self' }] }] } },
];

/* ---------- build the skills (same builder as the trees; ids t_s4<招><型態>) ---------- */
function sk4Build(kind) { const T = TREE11[kind], old = T.sk, rows = [];
  for (const sk of SK4.W[kind]) for (const p of SK4.FORMS) { const f = sk.forms[p]; if (!f) continue; const [n, pow, hits, cd, mp, aoe, d, x] = f;
    rows.push(['1a', 's4' + sk.k + p, n, pow, hits, cd, mp, aoe, d, x]); }
  T.sk = rows; try { sk11Build(kind); } finally { T.sk = old; }
  for (const sk of SK4.W[kind]) for (const p of SK4.FORMS) { const id = sk4Id(sk.k, p), D = DEF.skills[id], f = sk.forms[p]; if (!D) { bvErr('sk4', id); continue; }
    const x = f[7] || {};
    if (x.src && DEF.skills[x.src]) { const S = DEF.skills[x.src]; D.effects = S.effects.slice(); D.after = (S.after || []).slice(); D.mods = (S.mods || []).slice(); }
    D.fx = 'sk4_' + sk.k + p; D.metadata = { ...D.metadata, sk4: { kind, k: sk.k, p } }; D.tags = D.tags.filter(t => t !== 'tree11').concat(['sk4']);
    if (MOVES[id]) MOVES[id].fx = D.fx; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = [D.power ? (sk.magic ? 'focus' : 'draw') : 'focus', null, sk.magic ? 'holy' : 'steel', null]; // 打中後不再疊舊的打擊特效
    if (sk.magic && D.power) { D.cat = '特'; D.tags = D.tags.map(t => t === 'phys' ? 'magic' : t); if (MOVES[id]) MOVES[id].cat = '特';
      D.desc += '魔法傷害（打對手的魔防），用物攻和魔攻較高的一項計算。'; if (MOVES[id]) MOVES[id].d = D.desc;
      D.mods.push({ stage: 'skill', who: 'attacker', atkMul: { f: 'magAtk15' }, cond: { srcIsHero: 1 } }); } } }
sk4Build('劍');
TREE11['劍'].sp = []; // 特技拿掉

/* ---------- state & points ---------- */
const sk4Kind = (st = Game.st) => { if (!SK4.on || !st || !st.equip) return null; const k = mainKind11(st); return k && SK4.W[k] && !dualMode11(st) ? k : null; };
function sk4St(st, kind) { const A = st.sk4 || (st.sk4 = {}); if (!A[kind]) { A[kind] = {}; const T = tr11(st); // 舊存檔：這把武器原本技能樹的點數全部退回
    for (const key of Object.keys(T.lv)) { const tr = treeOf11(key); if (key.startsWith(kind + ':') || (tr && tr[0] === kind && !/^t_s4/.test(key))) delete T.lv[key]; } if (T.eq) delete T.eq[kind]; }
  for (const sk of SK4.W[kind]) if (!A[kind][sk.k]) A[kind][sk.k] = { lv: 1, p: '' }; return A[kind]; }
const sk4Unlocked = (st, sk) => (st.lv || 1) >= sk.unlock;
const sk4Total = (st, kind) => Math.max(0, (st.lv || 1) - 1) + bossPts11(st);
const sk4Spent = (st, kind) => SK4.W[kind].reduce((a, sk) => a + (sk4Unlocked(st, sk) ? sk4St(st, kind)[sk.k].lv - 1 : 0), 0);
const sk4Left = (st, kind) => Math.max(0, sk4Total(st, kind) - sk4Spent(st, kind));
const sk4Form = (sk, p) => { const f = sk.forms[p || ''] || sk.forms['']; return { n: f[0], d: DEF.skills[sk4Id(sk.k, sk.forms[p || ''] ? p : '')].desc, id: sk4Id(sk.k, sk.forms[p || ''] ? p : '') }; };
const sk4Town = (st = Game.st) => { const M = MAPS[st.map]; return !!M && (M.type === 'town' || st.map === 'town'); };

/* ---------- hero: the 4 skills in their current forms; only the weapon trait stays ---------- */
PV('sk4', v => ({ mods: Object.entries(v.lv || {}).filter(([, n]) => n > 1).map(([id, n]) => ({ stage: 'skill', who: 'attacker', mul: 1 + 0.08 * (n - 1), cond: { skillIs: id } })), triggers: [] }), { n: '招式等級' });
{ const _hs = BB.heroSpec; BB.heroSpec = function (st, cfg) { const s = _hs.call(this, st, cfg); const kind = st && sk4Kind(st); if (!kind) return s;
    const S = sk4St(st, kind), test = typeof FXT13 !== 'undefined' && FXT13.on && FXT13.kind === kind, lv = {};
    let ids; if (test) { ids = []; for (const sk of SK4.W[kind]) for (const p of SK4.FORMS) { ids.push(sk4Id(sk.k, p)); lv[sk4Id(sk.k, p)] = sk4FormLv(p); } }
    else { ids = SK4.W[kind].filter(sk => sk4Unlocked(st, sk)).map(sk => sk4Id(sk.k, S[sk.k].p)); for (const sk of SK4.W[kind]) lv[sk4Id(sk.k, S[sk.k].p)] = S[sk.k].lv; }
    s.skills = [s.data.attackSkill].concat(ids); s.data.slots = ids.slice(); s.data.sigSkill = null;
    s.wsp = null; s.data.wspSkill = null; s.data.wspName = null;
    s.passives = s.passives.filter(p => p.key !== 'cm11' && p.key !== 'tr11Thrift').map(p => p.key === 'tr11' ? { ...p, v: { ...p.v, lv: {}, mast: 0, traits: [...new Set([...(p.v.traits || []), kind])] } } : p);
    s.passives.push({ key: 'sk4', v: { lv }, src: 'tree' }); s.data.sk4Lv = lv; return s; }; }
// 劍的第三被動（鋒芒）不再算
{ const _hs = heroStats; heroStats = function (st = Game.st) { const s = _hs(st); const kind = st && sk4Kind(st); if (kind && trLv11(kind + ':third', st)) s.crit = Math.max(0, (s.crit || 0) - 2 * trLv11(kind + ':third', st)); return s; }; }

/* ---------- 選單→技能：用 4 招武器時直接打開這個畫面 ---------- */
function* sk4Branch(sk, S, first) { const opts = first ? ['A', 'B'] : [S.p + '1', S.p + '2'];
  const L = opts.map(p => sk4Form(sk, p)); yield* say(L.map((f, i) => '【' + opts[i] + '】' + f.n + '：' + f.d).join('\n'));
  const r = yield* ask((first ? '第一次分化' : '第二次分化') + '：選一條路', L.map(f => f.n).concat(['再想想']), { cancel: true }); if (r < 0 || r > 1) return false;
  S.p = opts[r]; Sound.sfx('statUp'); return true; }
function* sk4Detail(kind, sk) { const st = Game.st;
  while (true) { const S = sk4St(st, kind)[sk.k], f = sk4Form(sk, S.p), left = sk4Left(st, kind), D = DEF.skills[f.id], mp = ((D.costs || []).find(c => c.res === 'mp') || {}).amount;
    const next = S.lv >= SK4.MAX ? '已經練滿（覺醒）' : S.lv + 1 === SK4.B1 ? '下一級：第一次分化' : S.lv + 1 === SK4.B2 ? '下一級：第二次分化' : S.lv + 1 === SK4.MAX ? '下一級：覺醒（特效變金色）' : '下一級：威力 +8%';
    const opts = []; if (S.lv < SK4.MAX) opts.push('升級（1 點，剩 ' + left + ' 點）'); if (S.p && sk4Town(st)) opts.push('重選分化'); opts.push('返回');
    const r = yield* ask(f.n + '　Lv' + S.lv + (mp ? '　MP' + mp : '') + '\n' + f.d + '\n' + next, opts, { cancel: true }); const op = opts[r];
    if (r < 0 || op === '返回') return;
    if (op === '重選分化') { const keep = S.p; S.p = ''; let ok = S.lv < SK4.B1 || (yield* sk4Branch(sk, S, true)); if (ok && S.lv >= SK4.B2) ok = yield* sk4Branch(sk, S, false); if (!ok) S.p = keep; continue; }
    if (!left) { yield* say('技能點不夠。升等、打倒主線頭目都會拿到技能點。'); continue; }
    if (S.lv + 1 === SK4.B1 || S.lv + 1 === SK4.B2) { const ok = yield* sk4Branch(sk, S, S.lv + 1 === SK4.B1); if (!ok) continue; }
    S.lv++; Sound.sfx('statUp'); if (S.lv === SK4.MAX) yield* say(sk4Form(sk, S.p).n + ' 覺醒了！'); } }
function* sk4Screen(kind) { const st = Game.st; let i = 0;
  while (true) { const S = sk4St(st, kind), left = sk4Left(st, kind);
    const items = SK4.W[kind].map(sk => sk4Unlocked(st, sk) ? sk4Form(sk, S[sk.k].p).n + '　Lv' + S[sk.k].lv : '？？？（Lv' + sk.unlock + ' 學會）').concat(['返回']);
    const r = yield* ask(kind + '的 4 招　技能點 ' + left, items, { cancel: true, index: i }); if (r < 0 || r === items.length - 1) return; i = r;
    const sk = SK4.W[kind][r]; if (!sk4Unlocked(st, sk)) { yield* say('角色 Lv' + sk.unlock + ' 學會這一招。'); continue; } yield* sk4Detail(kind, sk); } }
{ const _ts = skillTreeScreen; skillTreeScreen = function* () { const kind = sk4Kind(Game.st); if (kind) return yield* sk4Screen(kind); return yield* _ts.call(this); }; }
{ const _up = Overworld.prototype.update; Overworld.prototype.update = function (...a) { const r = _up.apply(this, a); const st = this.st || Game.st, kind = st && sk4Kind(st); if (kind && (Game.frame || 0) % 30 === 0) st.skp = sk4Left(st, kind); return r; }; }

/* ---------- 特效測試：4 招 × 7 種型態，分 8 組（每組最多 4 個） ---------- */
{ const _cm = Battle.prototype.chooseMove; Battle.prototype.chooseMove = function* () { const kind = typeof FXT13 !== 'undefined' && FXT13.on && FXT13.kind; if (!kind || !SK4.W[kind] || !SK4.on) return yield* _cm.call(this);
    const hu = this.core.byId.H, all = hu.skills.slice(), atk = hu.data.attackSkill, G = [];
    for (const sk of SK4.W[kind]) { G.push([sk.forms[''][0] + '：基本・A・B', ['', 'A', 'B'].map(p => sk4Id(sk.k, p))]); G.push([sk.forms[''][0] + '：A1・A2・B1・B2', ['A1', 'A2', 'B1', 'B2'].map(p => sk4Id(sk.k, p))]); }
    while (true) { const r = yield* choose(G.map(g => ({ t: g[0] })), { x: 8, y: 30, w: W - 16, cancel: true, index: this.sk4Page || 0, title: '哪一招？（基本 Lv2／A・B Lv5／最終 Lv8 覺醒）' }); if (r < 0) return null; this.sk4Page = r;
      hu.skills = [atk].concat(G[r][1]); let out; FXT13.on = false; try { out = yield* _cm.call(this); } finally { FXT13.on = true; hu.skills = all; } if (out) return out; } }; }

/* ---------- 特效（pixelfx） ---------- */
const SK4P = { blade: null, holy: 'holy', gold: 'gold', dawn: 'gold' };
const sk4Pal = n => n ? pfxPal26(n) : undefined;
// 出招時：這一招的型態、等級（覺醒＝Lv8：金色、放大）
{ const B = Battle.prototype, _pf = B.playFx; B.playFx = function* (name, u, t) { if (/^sk4_/.test(name)) { const m = name.slice(4).match(/^([a-z]+)([AB][12]?)?$/), k = m && m[1], p = (m && m[2]) || '';
      const id = sk4Id(k, p), L = (this.core.byId.H && this.core.byId.H.data && this.core.byId.H.data.sk4Lv) || {}; const lv = L[id] || 1; this.sk4Cur = { k, p, lv, aw: lv >= SK4.MAX }; }
    return yield* _pf.call(this, name, u, t); }; }
const sk4K = (b, v, base = 40) => pfxSize26(v && (v.hero ? pfxBody26(b, v).h : v.bbh), base) * (b.sk4Cur && b.sk4Cur.aw ? 1.2 : 1);
const sk4Col = (b, def) => (b.sk4Cur && b.sk4Cur.aw ? pfxPal26('gold') : def ? pfxPal26(def) : undefined);
// 把特效裡「打中的那一點」(lx, ly) 放到 C
function sk4At(b, mod, C, lx, ly, o = {}) { const k = o.k || 1, fl = o.flip ? -1 : 1; return pfxSpawn26(b, pfxM26(mod), { x: Math.round(C.x - k * lx * fl), y: Math.round(C.y - k * ly) }, o); }
const SK4HIT = { slash: [31, -33, 3], cross: [35, -27, 10], spin: [0, -28, 13], cleave: [30, -21, 22], dash: [165, -36, 16], crit: [0, -32, 0], spark: [0, -20, 0] };
// 近身：每一下在被打的魔物身上出一份 mod；第 i 下在 d(i) 幀後出手
function sk4Melee(b, mod, d, o = {}) { const H = pfxHits26(b, null), [lx, ly, hit] = SK4HIT[mod];
  H.forEach((h, i) => { const C = b.center(h.v), k = sk4K(b, h.v) * (o.k || 1), t = d(i), fl = o.flips ? i % 2 === 1 : false;
    pfxAt26(b, t, () => Sound.sfx(o.snd || 'blade'));
    sk4At(b, mod, C, lx, ly, { k, delay: t, flip: fl, palette: sk4Col(b, o.pal), seed: 3 + i, glow: o.glow || 0.55 });
    pfxAt26(b, t + hit, () => { pfxLand26(b, i); if (o.spark) sk4At(b, 'spark', C, 0, -20, { k: k * 0.8, seed: 9 + i }); }); });
  return H; }
// 劍氣：從手邊飛到第 i 下打的魔物（sword-slash 的月牙跟著移動）
function sk4Wave(b, U, i, C, o = {}) { const A = pfxHand26(U), a = Math.atan2(C.y - A.y, C.x - A.x), k = (o.k || 1) * (b.sk4Cur && b.sk4Cur.aw ? 1.25 : 1), d = o.d || 12, t0 = o.t0 || 0;
  pfxAt26(b, t0, () => Sound.sfx(o.snd || 'stBolt'));
  const ox = k * (31 * Math.cos(a) + 33 * Math.sin(a)), oy = k * (31 * Math.sin(a) - 33 * Math.cos(a)); // 月牙的中心（特效裡的 31,−33）沿著路線飛
  const A0 = { x: A.x - ox, y: A.y - oy }, e = pfxSpawn26(b, pfxM26('slash'), A0, { angle: a, k, delay: t0, palette: sk4Col(b, o.pal || 'holy'), seed: 20 + i, glow: 0.5 });
  if (e) e.move = { a: A0, b: { x: C.x - ox - Math.cos(a) * 6 * k, y: C.y - oy - Math.sin(a) * 6 * k }, d, end: () => { if (o.land !== false) pfxLand26(b, i); if (o.boom) sk4At(b, o.boom, C, ...SK4HIT[o.boom].slice(0, 2), { k: o.boomK || 0.8, palette: sk4Col(b, o.pal || 'holy'), seed: 30 + i, glow: 0.4 }); else sk4At(b, 'spark', C, 0, -20, { k: 0.7, palette: sk4Col(b, o.pal || 'holy'), seed: 30 + i }); } };
  return e; }
// 自己身上：光環（頭上）、氣場（身體）
function sk4Self(b, u, mods) { const v = u && b.views[u.id] || b.H, B = pfxBody26(b, v), k = clamp(B.h / 46, 0.9, 1.8) * (b.sk4Cur && b.sk4Cur.aw ? 1.15 : 1);
  for (const [mod, o] of mods) pfxSpawn26(b, pfxM26(mod), { x: B.x, y: B.foot }, { k, life: o.life || 60, palette: o.pal ? pfxPal26(o.pal) : (b.sk4Cur && b.sk4Cur.aw ? pfxPal26('gold') : undefined), glow: 0.6, seed: 5 }); }
// 近身招：先走到魔物前面（跟原本的劍招一樣），再往前撲一下
const sk4Lunge = function* (b, u, n = 18, T, t) { if (typeof HDW !== 'undefined' && HDW.go && T && (!u || u.hero || u === b.H)) yield* HDW.go(b, T, t); if (b.lunge) yield* b.lunge(u, n, 2); };
Object.assign(FX, {
  // 斷甲斬：藍白色的月牙一刀
  *sk4_cut(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => i * 8, { spark: 1 }); yield* pfxWait26(this, 0); },
  // 斷鋼一閃：交叉兩刀，交點炸開
  *sk4_cutA(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'cross', i => i * 10, { pal: 'ice' }); yield* pfxWait26(this, 0); },
  // 一刀天斷：殘影一閃衝過去，一刀會心
  *sk4_cutA1(U, T, u, t) { Sound.sfx('dashStep'); sk4Melee(this, 'dash', i => i * 12, { k: 0.75, snd: 'bladeBig', glow: 0.3 }); yield* pfxWait26(this, 0); Sound.sfx('crit'); },
  // 崩星劍：頭上一閃、粗重的弧劈進地面；主目標會心爆擊，震波打到其他魔物
  *sk4_cutA2(U, T, u, t) { yield* sk4Lunge(this, u, 14, T, t); const H = pfxHits26(this, null), main = H[0], C = this.center(main.v), k = sk4K(this, main.v) * 1.1;
    Sound.sfx('charge'); sk4At(this, 'cleave', C, 30, -21, { k, palette: sk4Col(this), seed: 4, stone: '#a89880' }); // 地上的碎石・煙塵用淡沙色（原本紫灰色，在草地上像黑雲）
    H.forEach((h, i) => { if (i === 0) pfxAt26(this, 22, () => { Sound.sfx('heavy'); pfxLand26(this, 0); sk4At(this, 'crit', C, 0, -32, { k: k * 0.9, palette: sk4Col(this), seed: 6, glow: 0.4 }); this.shake = Math.max(this.shake || 0, 8); });
      else { const D = this.center(h.v); pfxAt26(this, 26 + i * 2, () => { pfxLand26(this, i); sk4At(this, 'spark', D, 0, -20, { k: 0.9, palette: pfxPal26('dust'), seed: 12 + i }); }); } });
    yield* pfxWait26(this, 0); },
  // 疾風連斬：快速的月牙一刀接一刀（左右交替）
  *sk4_cutB(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => i * 6, { flips: 1, snd: 'bladeQ', k: 0.9 }); yield* pfxWait26(this, 0); },
  // 流光連斬：五道淡藍的流光
  *sk4_cutB1(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => i * 5, { flips: 1, snd: 'bladeQ', pal: 'ice', k: 0.95 }); yield* pfxWait26(this, 0); },
  // 旋刃：一圈迴旋斬掃過全部魔物
  *sk4_cutB2(U, T, u, t) { yield* sk4Lunge(this, u, 10, T, t); const H = pfxHits26(this, null), P = H.map(h => this.center(h.v)), x0 = Math.min(...P.map(p => p.x)), x1 = Math.max(...P.map(p => p.x));
    const C = { x: (x0 + x1) / 2, y: P.reduce((a, p) => a + p.y, 0) / P.length }, k = Math.max(1, (x1 - x0 + 60) / 150) * (this.sk4Cur && this.sk4Cur.aw ? 1.1 : 1);
    Sound.sfx('bladeBig'); sk4At(this, 'spin', C, 0, -28, { k, palette: sk4Col(this), seed: 7 }); H.forEach((h, i) => pfxAt26(this, 11 + Math.round((P[i].x - x0) / 30), () => pfxLand26(this, i))); yield* pfxWait26(this, 0); },
  // 光刃：一道白金色的劍氣飛過去
  *sk4_light(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8 })); yield* pfxWait26(this, 0); },
  // 貫光：一道劍氣穿過全部魔物（經過哪隻，哪隻就跳傷害）
  *sk4_lightA(U, T, u, t) { const H = pfxHits26(this, null), A = pfxHand26(U), P = H.map(h => this.center(h.v)), far = P.reduce((a, p) => (p.x > a.x ? p : a), P[0]);
    const a = Math.atan2(far.y - A.y, far.x - A.x), end = { x: far.x + Math.cos(a) * 40, y: far.y + Math.sin(a) * 40 }, L = Math.hypot(end.x - A.x, end.y - A.y), d = 18;
    const kk = 1.2, ox = kk * (31 * Math.cos(a) + 33 * Math.sin(a)), oy = kk * (31 * Math.sin(a) - 33 * Math.cos(a));
    Sound.sfx('stBolt'); const e = pfxSpawn26(this, pfxM26('slash'), { x: A.x - ox, y: A.y - oy }, { angle: a, k: kk, palette: sk4Col(this, 'holy'), seed: 21, glow: 0.5 }); if (e) e.move = { a: { x: A.x - ox, y: A.y - oy }, b: { x: end.x - ox, y: end.y - oy }, d };
    H.forEach((h, i) => { const f = clamp(((P[i].x - A.x) * Math.cos(a) + (P[i].y - A.y) * Math.sin(a)) / L, 0, 1); pfxAt26(this, Math.round(d * f), () => { pfxLand26(this, i); sk4At(this, 'spark', P[i], 0, -20, { k: 0.8, palette: sk4Col(this, 'holy'), seed: 30 + i }); }); });
    yield* pfxWait26(this, 0); },
  // 光雨：三道劍氣，各飛向那一下打的魔物
  *sk4_lightA1(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 7, k: 0.9 })); yield* pfxWait26(this, 0); },
  // 光輪：金白色的光輪掃過全部魔物
  *sk4_lightA2(U, T, u, t) { const H = pfxHits26(this, null), P = H.map(h => this.center(h.v)), x0 = Math.min(...P.map(p => p.x)), x1 = Math.max(...P.map(p => p.x));
    const C = { x: (x0 + x1) / 2, y: P.reduce((a, p) => a + p.y, 0) / P.length }, k = Math.max(1, (x1 - x0 + 60) / 150);
    Sound.sfx('mana'); sk4At(this, 'spin', C, 0, -28, { k, palette: sk4Col(this, 'holy'), seed: 8, glow: 0.8 }); H.forEach((h, i) => pfxAt26(this, 11 + Math.round((P[i].x - x0) / 30), () => pfxLand26(this, i))); yield* pfxWait26(this, 0); },
  // 聚光：一道又大又亮的劍氣
  *sk4_lightB(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8, k: 1.4, d: 14 })); yield* pfxWait26(this, 0); },
  // 破曉光：巨大的劍氣，打中時會心爆擊
  *sk4_lightB1(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8, k: 1.6, d: 15, boom: 'crit', boomK: 0.9, snd: 'bladeBig' })); yield* pfxWait26(this, 0); },
  // 晨曦之刃：金色劍氣，打中後一圈金光
  *sk4_lightB2(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8, k: 1.4, d: 14, pal: 'gold', boom: 'cross', boomK: 0.8 })); yield* pfxWait26(this, 0); },
  // 心眼系：頭上一圈光環（藍＝明鏡、金＝覺醒）；狂刃系：紅色的氣燒起來
  *sk4_eye(U, T, u, t) { Sound.sfx('statUp'); sk4Self(this, u, [['halo', { life: 50 }]]); yield* wait(24); },
  *sk4_eyeA(U, T, u, t) { Sound.sfx('statUp'); sk4Self(this, u, [['halo', { life: 60, pal: 'ice' }], ['haste', { life: 50, pal: 'ice' }]]); yield* wait(26); },
  *sk4_eyeA1(U, T, u, t) { Sound.sfx('statUp'); sk4Self(this, u, [['halo', { life: 70, pal: 'ice' }], ['haste', { life: 60, pal: 'ice' }]]); yield* wait(28); },
  *sk4_eyeA2(U, T, u, t) { Sound.sfx('shGuard'); sk4Self(this, u, [['halo', { life: 60 }], ['rage', { life: 50, pal: 'ice' }]]); yield* wait(26); },
  *sk4_eyeB(U, T, u, t) { Sound.sfx('charge'); sk4Self(this, u, [['rage', { life: 60 }]]); yield* wait(26); },
  *sk4_eyeB1(U, T, u, t) { Sound.sfx('charge'); sk4Self(this, u, [['rage', { life: 70, pal: 'blood' }]]); yield* wait(28); },
  *sk4_eyeB2(U, T, u, t) { Sound.sfx('charge'); sk4Self(this, u, [['rage', { life: 60 }], ['haste', { life: 60 }]]); yield* wait(28); },
});
// 奧義：金色的月牙一刀接一刀（角度一直換，越來越快），最後一記收尾（重劈＋會心爆擊；天光是衝刺斬）
function* sk4Og(b, U, T, u, t, o = {}) { yield* sk4Lunge(b, u, 18, T, t); Sound.sfx('charge'); const H = pfxHits26(b, null), n = H.length; let tm = 4;
  H.forEach((h, i) => { const C = b.center(h.v), k = sk4K(b, h.v), last = i === n - 1;
    if (!last) { const tt = tm; pfxAt26(b, tt, () => Sound.sfx('bladeQ')); sk4At(b, 'slash', C, 31, -33, { k: k * 0.9, delay: tt, flip: i % 2 === 1, palette: sk4Col(b, o.pal || 'gold'), seed: 3 + i, glow: 0.6 });
      pfxAt26(b, tt + 3, () => pfxLand26(b, i)); tm += Math.max(3, 6 - (i >> 1)); }
    else { const tt = tm + 6, fin = o.fin || 'cleave', [lx, ly, hit] = SK4HIT[fin]; pfxAt26(b, tt, () => Sound.sfx('bladeBig'));
      sk4At(b, fin, C, lx, ly, { k: k * (fin === 'dash' ? 0.9 : 1.15), delay: tt, palette: sk4Col(b, o.pal || 'gold'), seed: 11, glow: 0.6, ...(fin === 'cleave' ? { stone: '#a89880' } : {}) });
      pfxAt26(b, tt + hit, () => { Sound.sfx('crit'); pfxLand26(b, i); sk4At(b, 'crit', C, 0, -32, { k: k * 0.9, palette: sk4Col(b, o.pal || 'gold'), seed: 13, glow: 0.4 }); b.shake = Math.max(b.shake || 0, 8); }); } });
  yield* pfxWait26(b, 0); if (o.after) o.after(); }
Object.assign(FX, {
  *sk4_og(U, T, u, t) { yield* sk4Og(this, U, T, u, t); }, *sk4_ogA(U, T, u, t) { yield* sk4Og(this, U, T, u, t); }, *sk4_ogA1(U, T, u, t) { yield* sk4Og(this, U, T, u, t); },
  *sk4_ogA2(U, T, u, t) { yield* sk4Og(this, U, T, u, t); }, *sk4_ogB(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { pal: 'holy' }); },
  *sk4_ogB1(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { pal: 'holy', fin: 'dash' }); },
  *sk4_ogB2(U, T, u, t) { const self = this; yield* sk4Og(this, U, T, u, t, { pal: 'holy', after: () => sk4Self(self, u, [['halo', { life: 50, pal: 'water' }]]) }); },
});
