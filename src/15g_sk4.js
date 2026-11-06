/* ===================== v13.0 試做：技能精簡——每種武器 4 招、Lv1〜8、Lv3・Lv6 兩次分化（先做劍；名稱和效果都重做） =====================
   玩家：「現在的技能數量確實太多了。RPG 的精髓就是用技能打倒敵人，我打算用少量但可升級的技能當作這遊戲的精髓。」
         「改成 4 招好了，走分化路線。」「先從劍開始，配合新安裝的特效包（pixelfx）。」
   · 每種武器 4 招，全部帶上場（不用技能槽）；只留武器特性（拿掉精通、第三被動、特技、共通樹、裝備附帶的招、招牌技）。
   · 技能點：每種武器各自一池＝(等級 − 1)＋主線頭目第一次打倒各 1 點；招式解鎖時就是 Lv1，之後每升一級 1 點，最高 Lv8；威力每級 +8%。
   · Lv3 第一次分化（A／B），Lv6 第二次分化（A1／A2 或 B1／B2）：名字、效果、特效都換；在城鎮可以重選分化。
   · Lv8 覺醒：特效變大（沒有特定顏色的招變金色）。
   · 舊存檔第一次用到這套時：那把武器原本技能樹的點數全部退回（招式重新從 Lv1 開始）。
   企劃：docs/技能精簡企劃.md */
const SK4 = { on: true, MAX: 8, B1: 3, B2: 6, FORMS: ['', 'A', 'B', 'A1', 'A2', 'B1', 'B2'], W: {} };
const sk4Id = (k, p) => 't_s4' + k + (p || '');
const sk4FormLv = p => !p ? 2 : p.length === 1 ? 5 : 8; // 特效測試：每種型態用它最常見的等級
// 新的狀態：鐵壁（受到的傷害 −50%）、反擊架勢（被打就反擊，威力 80）、狂暴（會心率 +20%）
ST11('guard4', '鐵壁', { mods: [{ stage: 'final', who: 'defender', mul: 0.5, cond: { hasPower: 1 } }] });
ST11('ctr4', '反擊架勢', { triggers: [{ on: EVT.DAMAGE, phase: 'POST', role: 'tgt', cond: { srcSide: 'enemy', hasPower: 1, ownerAlive: 1 }, limit: { perAction: 1 }, effects: [{ type: 'counter', mul: { f: 'cnt11', v: 80 }, why: 'ctr4' }] }] });
ST11('rage4', '狂暴', { mods: [{ stage: 'attacker', who: 'attacker', critAdd: 20 }] });
if (typeof BUFF12 !== 'undefined') Object.assign(BUFF12, { guard4: { n: '鐵壁', k: 'def', tip: '受到的傷害 −50%' }, ctr4: { n: '反擊架勢', k: 'def', tip: '被打就反擊' }, rage4: { n: '狂暴', k: 'atk', tip: '會心率 +20%' } });

/* ---------- 劍（玩家：「連名稱一起重做」「簡單好懂」——不沿用舊招，名字一看就知道在做什麼） ----------
   [名稱, 威力, 段數, 冷卻, MP, 全體, 說明, 其他]；分化：基本 → A／B（Lv3）→ A1・A2／B1・B2（Lv6） */
const OG4 = (n, each, fin, x = {}) => [{ type: 'damage', power: each, ...(x.rnd ? { target: 'random_enemy' } : {}) }].concat(Array.from({ length: n - 1 }, () => ({ type: 'damage', power: each, cond: { tgtAlive: 1 }, ...(x.rnd ? { target: 'random_enemy' } : {}) })),
  [{ type: 'damage', power: fin, cond: { tgtAlive: 1 } }]);
const DRAIN4 = r => ({ type: 'heal', target: 'self', ofCast: r, kind: 'drain', quiet: 1 });
const CRITN4 = { type: 'status', target: 'self', status: 'critNext' };
SK4.W['劍'] = [
  { k: 'cut', unlock: 1, forms: {               // 斬擊系：主力的近身攻擊
    '': ['斬擊', 60, 0, 0, 6, 0, '往前一刀。', {}],
    A: ['重斬', 90, 0, 0, 9, 0, '用力砍下去，50% 讓對手物防 −1。', { effects: DMG11(SG11({ def: -1 }, 0.5)) }],
    A1: ['破甲斬', 110, 0, 1, 12, 0, '交叉兩刀砍開護甲，對手物防 −2。', { effects: DMG11(SG11({ def: -2 })) }],
    A2: ['全力斬', 150, 0, 2, 14, 0, '全力劈下去，會心率 +30%。', { mods: [{ stage: 'skill', who: 'attacker', critAdd: 30 }] }],
    B: ['連斬', 28, 3, 0, 9, 0, '快速砍 3 下。', {}],
    B1: ['五連斬', 26, 5, 1, 12, 0, '快速砍 5 下。', {}],
    B2: ['流血連斬', 30, 3, 1, 12, 0, '快速砍 3 下，每下 40% 讓對手流血。', { effects: DMG11(STA11('bleed14', 0.4)) }] } },
  { k: 'wave', unlock: 1, magic: 1, forms: {    // 劍氣系：遠距離的魔法傷害
    '': ['劍氣', 55, 0, 0, 7, 0, '揮劍放出一道劍氣，飛過去打中對手。', {}],
    A: ['大劍氣', 50, 0, 1, 10, 1, '一道大劍氣穿過去，打全部魔物。', {}],
    A1: ['劍氣風暴', 35, 2, 1, 13, 1, '劍氣連發兩輪，打全部魔物 2 次。', {}],
    A2: ['破魔劍氣', 55, 0, 1, 13, 1, '打全部魔物，50% 讓魔防 −1。', { effects: DMG11(SG11({ spd: -1 }, 0.5)) }],
    B: ['穿透劍氣', 80, 0, 0, 10, 0, '細長的劍氣，無視對手 40% 的防禦。', { pierceDef: 0.4 }],
    B1: ['雷光劍氣', 95, 0, 1, 13, 0, '帶電的劍氣（雷屬性），30% 讓對手麻痺。', { el: '雷', effects: DMG11(STA11('par', 0.3)) }],
    B2: ['吸血劍氣', 95, 0, 1, 13, 0, '紅色的劍氣，吸取傷害 25% 的 HP。', { after: [DRAIN4(0.25)] }] } },
  { k: 'stance', unlock: 10, forms: {           // 架勢系：強化自己
    '': ['集中', 0, 0, 3, 6, 0, '集中精神，下一擊必定會心。', { effects: [CRITN4] }],
    A: ['防守架勢', 0, 0, 3, 8, 0, '這回合受到的傷害 −50%，下一擊必定會心。', { effects: [CRITN4, { type: 'status', target: 'self', status: 'guard4', dur: 1 }] }],
    A1: ['鐵壁架勢', 0, 0, 3, 10, 0, '2 回合受到的傷害 −50%，下一擊必定會心。', { effects: [CRITN4, { type: 'status', target: 'self', status: 'guard4', dur: 2 }] }],
    A2: ['反擊架勢', 0, 0, 3, 10, 0, '這回合受到的傷害 −50%，被打就反擊（威力 80）。', { effects: [{ type: 'status', target: 'self', status: 'guard4', dur: 1 }, { type: 'status', target: 'self', status: 'ctr4', dur: 1 }] }],
    B: ['攻擊架勢', 0, 0, 4, 8, 0, '3 回合物攻 +2 階。', { effects: [SELF11({ atk: 2 })] }],
    B1: ['狂暴架勢', 0, 0, 4, 10, 0, '3 回合物攻 +3 階、會心率 +20%，但物防 −1 階。', { effects: [SELF11({ atk: 3 }), { type: 'status', target: 'self', status: 'rage4', dur: 3 }, SELF11({ def: -1 })] }],
    B2: ['疾風架勢', 0, 0, 4, 10, 0, '5 回合物攻 +1 階、速度 +2 階。', { effects: [SELF11({ atk: 1, spe: 2 }, 5)] }] } },
  { k: 'ult', unlock: 20, forms: {              // 必殺系：大招
    '': ['必殺劍', 40, 0, 5, 22, 0, '連砍 3 下（各 40），最後一記收尾（威力 130）。', { effects: OG4(3, 40, 130) }],
    A: ['必殺連劍', 40, 0, 5, 24, 0, '連砍 5 下（各 40），最後一記收尾（威力 130）。', { effects: OG4(5, 40, 130) }],
    A1: ['必殺七連劍', 40, 0, 5, 28, 0, '連砍 7 下（各 40），最後一記收尾（威力 150）。', { effects: OG4(7, 40, 150) }],
    A2: ['必殺亂劍', 45, 0, 5, 28, 0, '亂砍 5 下（各 45，每下隨機打一隻魔物），再對目標收尾（威力 130）。', { effects: OG4(5, 45, 130, { rnd: 1 }) }],
    B: ['必殺重劍', 220, 0, 5, 24, 0, '只砍一刀，但威力 220，會心率加倍。', { critX: 2 }],
    B1: ['必殺一刀', 300, 0, 5, 28, 0, '衝過去一刀，威力 300，必定會心。', { mods: [CRIT11] }],
    B2: ['必殺吸血劍', 220, 0, 5, 28, 0, '一刀威力 220、會心率加倍，吸取傷害 30% 的 HP。', { critX: 2, after: [DRAIN4(0.3)] }] } },
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
// 大小：玩家「特效太大 反而看得很奇怪」→ 全部乘上 SK4.SZ（打在魔物身上的特效大約跟魔物一樣大）；覺醒只大 10%
SK4.SZ = 0.55; SK4.SZS = 0.8; SK4.AW = 1.1; SK4.SELFK = { rage: 0.72, haste: 0.85 }; // 氣場比光環寬，再縮一點才跟角色一樣大
const sk4K = (b, v, base = 40) => pfxSize26(v && (v.hero ? pfxBody26(b, v).h : v.bbh), base) * (b.sk4Cur && b.sk4Cur.aw ? SK4.AW : 1);
const sk4Col = (b, def) => (def ? pfxPal26(def) : b.sk4Cur && b.sk4Cur.aw ? pfxPal26('gold') : undefined); // 有自己顏色的招（血紅、雷黃…）覺醒後照樣用自己的顏色，只變大
// 把特效裡「打中的那一點」(lx, ly) 放到 C
function sk4At(b, mod, C, lx, ly, o = {}) { const k = (o.k || 1) * (o.raw ? 1 : SK4.SZ), fl = o.flip ? -1 : 1; const { raw, ...op } = o; return pfxSpawn26(b, pfxM26(mod), { x: Math.round(C.x - k * lx * fl), y: Math.round(C.y - k * ly) }, { ...op, k }); }
const SK4HIT = { slash: [31, -33, 3], cross: [35, -27, 10], spin: [0, -28, 13], cleave: [30, -21, 22], dash: [165, -36, 16], crit: [0, -32, 0], spark: [0, -20, 0] };
// 近身：每一下在被打的魔物身上出一份 mod；第 i 下在 d(i) 幀後出手
function sk4Melee(b, mod, d, o = {}) { const H = pfxHits26(b, null), [lx, ly, hit] = SK4HIT[mod];
  H.forEach((h, i) => { const C = b.center(h.v), k = sk4K(b, h.v) * (o.k || 1), t = d(i), fl = o.flips ? i % 2 === 1 : false;
    pfxAt26(b, t, () => Sound.sfx(o.snd || 'blade'));
    sk4At(b, mod, C, lx, ly, { k, delay: t, flip: fl, palette: sk4Col(b, o.pal), seed: 3 + i, glow: o.glow || 0.55 });
    pfxAt26(b, t + hit, () => { pfxLand26(b, i); if (o.spark) sk4At(b, 'spark', C, 0, -20, { k: k * 0.8, seed: 9 + i }); }); });
  return H; }
// 劍氣：從手邊飛到第 i 下打的魔物（sword-slash 的月牙跟著移動）
function sk4Wave(b, U, i, C, o = {}) { const A = pfxHand26(U), a = Math.atan2(C.y - A.y, C.x - A.x), k = (o.k || 1) * SK4.SZ * (b.sk4Cur && b.sk4Cur.aw ? SK4.AW : 1), d = o.d || 12, t0 = o.t0 || 0;
  pfxAt26(b, t0, () => Sound.sfx(o.snd || 'stBolt'));
  const ox = k * (31 * Math.cos(a) + 33 * Math.sin(a)), oy = k * (31 * Math.sin(a) - 33 * Math.cos(a)); // 月牙的中心（特效裡的 31,−33）沿著路線飛
  const A0 = { x: A.x - ox, y: A.y - oy }, e = pfxSpawn26(b, pfxM26('slash'), A0, { angle: a, k, delay: t0, palette: sk4Col(b, o.pal || 'holy'), seed: 20 + i, glow: 0.5 });
  if (e) e.move = { a: A0, b: { x: C.x - ox - Math.cos(a) * 6 * k, y: C.y - oy - Math.sin(a) * 6 * k }, d, end: () => { if (o.land !== false) pfxLand26(b, i); if (o.boom) sk4At(b, o.boom, C, ...SK4HIT[o.boom].slice(0, 2), { k: o.boomK || 1.2, palette: sk4Col(b, o.pal || 'holy'), seed: 30 + i, glow: 0.4 }); else sk4At(b, 'spark', C, 0, -20, { k: 1.0, palette: sk4Col(b, o.pal || 'holy'), seed: 30 + i }); } };
  return e; }
// 自己身上：光環（頭上）、氣場（身體）
function sk4Self(b, u, mods) { const v = u && b.views[u.id] || b.H, B = pfxBody26(b, v), k = clamp(B.h / 46, 0.9, 1.8) * SK4.SZS * (b.sk4Cur && b.sk4Cur.aw ? SK4.AW : 1);
  for (const [mod, o] of mods) pfxSpawn26(b, pfxM26(mod), { x: B.x, y: B.foot }, { k: k * (SK4.SELFK[mod] || 1), life: o.life || 60, palette: o.pal ? pfxPal26(o.pal) : (b.sk4Cur && b.sk4Cur.aw ? pfxPal26('gold') : undefined), glow: 0.6, seed: 5 }); }
// 近身招：先走到魔物前面（跟原本的劍招一樣），再往前撲一下
const sk4Lunge = function* (b, u, n = 18, T, t) { if (typeof HDW !== 'undefined' && HDW.go && T && (!u || u.hero || u === b.H)) yield* HDW.go(b, T, t); if (b.lunge) yield* b.lunge(u, n, 2); };
// 劍氣穿過全部魔物（經過哪隻，哪隻就跳傷害）
function sk4Pass(b, U, pal, round = 0) { const H = pfxHits26(b, null), A = pfxHand26(U), seen = new Set();
  const P = H.map(h => b.center(h.v)), far = P.reduce((a, p) => (p.x > a.x ? p : a), P[0]), a = Math.atan2(far.y - A.y, far.x - A.x);
  const end = { x: far.x + Math.cos(a) * 40, y: far.y + Math.sin(a) * 40 }, L = Math.hypot(end.x - A.x, end.y - A.y), d = 18, t0 = round * 22;
  const kk = 1.1 * SK4.SZ * (b.sk4Cur && b.sk4Cur.aw ? SK4.AW : 1), ox = kk * (31 * Math.cos(a) + 33 * Math.sin(a)), oy = kk * (31 * Math.sin(a) - 33 * Math.cos(a));
  pfxAt26(b, t0, () => Sound.sfx('stBolt')); const e = pfxSpawn26(b, pfxM26('slash'), { x: A.x - ox, y: A.y - oy }, { angle: a, k: kk, delay: t0, palette: sk4Col(b, pal), seed: 21 + round, glow: 0.5 });
  if (e) e.move = { a: { x: A.x - ox, y: A.y - oy }, b: { x: end.x - ox, y: end.y - oy }, d };
  H.forEach((h, i) => { const n = H.slice(0, i).filter(x => x.v === h.v).length; if (n !== round) return; const f = clamp(((P[i].x - A.x) * Math.cos(a) + (P[i].y - A.y) * Math.sin(a)) / L, 0, 1);
    pfxAt26(b, t0 + Math.round(d * f), () => { pfxLand26(b, i); sk4At(b, 'spark', P[i], 0, -20, { k: 1.1, palette: sk4Col(b, pal), seed: 30 + i }); }); }); }
// 一圈光環掃過全部魔物
function sk4Ring(b, pal) { const H = pfxHits26(b, null), P = H.map(h => b.center(h.v)), x0 = Math.min(...P.map(p => p.x)), x1 = Math.max(...P.map(p => p.x));
  const C = { x: (x0 + x1) / 2, y: P.reduce((a, p) => a + p.y, 0) / P.length }, k = Math.max(0.6, (x1 - x0 + 20) / 170) * (b.sk4Cur && b.sk4Cur.aw ? SK4.AW : 1); // 全體：剛好掃過三隻
  Sound.sfx('mana'); sk4At(b, 'spin', C, 0, -28, { k, raw: 1, palette: sk4Col(b, pal), seed: 8, glow: 0.5 }); H.forEach((h, i) => pfxAt26(b, 11 + Math.round((P[i].x - x0) / 30), () => pfxLand26(b, i))); }
Object.assign(FX, {
  // 斬擊系
  *sk4_cut(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => i * 8, { spark: 1 }); yield* pfxWait26(this, 0); },                                    // 藍白色的月牙一刀
  *sk4_cutA(U, T, u, t) { yield* sk4Lunge(this, u, 14, T, t); sk4Melee(this, 'slash', i => i * 8, { k: 1.25, spark: 1, snd: 'bladeBig' }); yield* pfxWait26(this, 0); },       // 又大又重的一刀
  *sk4_cutA1(U, T, u, t) { yield* sk4Lunge(this, u, 14, T, t); sk4Melee(this, 'cross', i => i * 10, { pal: 'ice', spark: 1 }); yield* pfxWait26(this, 0); },                   // 交叉兩刀，交點炸開
  *sk4_cutA2(U, T, u, t) { yield* sk4Lunge(this, u, 12, T, t); const H = pfxHits26(this, null), C = this.center(H[0].v), k = sk4K(this, H[0].v) * 1.1;                       // 頭上一閃，粗重的弧劈進地面＋會心爆擊
    Sound.sfx('charge'); sk4At(this, 'cleave', C, 30, -21, { k, palette: sk4Col(this), seed: 4, stone: '#a89880' });
    pfxAt26(this, 22, () => { Sound.sfx('heavy'); H.forEach((h, i) => pfxLand26(this, i)); sk4At(this, 'crit', C, 0, -32, { k: k * 0.9, palette: sk4Col(this), seed: 6, glow: 0.4 }); this.shake = Math.max(this.shake || 0, 8); });
    yield* pfxWait26(this, 0); },
  *sk4_cutB(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => i * 6, { flips: 1, snd: 'bladeQ', k: 0.9 }); yield* pfxWait26(this, 0); },       // 月牙左右交替快砍
  *sk4_cutB1(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => i * 5, { flips: 1, snd: 'bladeQ', pal: 'ice', k: 0.95 }); yield* pfxWait26(this, 0); },
  *sk4_cutB2(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => i * 6, { flips: 1, snd: 'bladeQ', pal: 'blood', k: 0.95 }); yield* pfxWait26(this, 0); }, // 紅色的月牙
  // 劍氣系
  *sk4_wave(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8 })); yield* pfxWait26(this, 0); },                    // 白金色劍氣飛過去
  *sk4_waveA(U, T, u, t) { sk4Pass(this, U, 'holy'); yield* pfxWait26(this, 0); },                                                                                       // 大劍氣穿過全部
  *sk4_waveA1(U, T, u, t) { sk4Pass(this, U, 'holy', 0); sk4Pass(this, U, 'holy', 1); yield* pfxWait26(this, 0); },                                                         // 兩輪
  *sk4_waveA2(U, T, u, t) { sk4Ring(this, 'arcane'); yield* pfxWait26(this, 0); },                                                                                       // 紫色光環掃過
  *sk4_waveB(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8, k: 1.1, d: 10, pal: 'ice' })); yield* pfxWait26(this, 0); }, // 細長快速的藍色劍氣
  *sk4_waveB1(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8, k: 1.15, d: 12, pal: 'volt', boom: 'spark', boomK: 1.4, snd: 'thunder' })); yield* pfxWait26(this, 0); },
  *sk4_waveB2(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8, k: 1.15, d: 14, pal: 'blood', boom: 'cross', boomK: 1.2 })); yield* pfxWait26(this, 0); },
  // 架勢系：頭上光環＝集中；藍色的氣＝防守；紅色的氣＝攻擊；風＝疾風
  *sk4_stance(U, T, u, t) { Sound.sfx('statUp'); sk4Self(this, u, [['halo', { life: 50 }]]); yield* wait(24); },
  *sk4_stanceA(U, T, u, t) { Sound.sfx('shGuard'); sk4Self(this, u, [['halo', { life: 50 }], ['rage', { life: 50, pal: 'ice' }]]); yield* wait(26); },
  *sk4_stanceA1(U, T, u, t) { Sound.sfx('shGuard'); sk4Self(this, u, [['halo', { life: 60 }], ['rage', { life: 70, pal: 'metal' }]]); yield* wait(28); },
  *sk4_stanceA2(U, T, u, t) { Sound.sfx('shGuard'); sk4Self(this, u, [['rage', { life: 60, pal: 'ice' }], ['haste', { life: 50, pal: 'ice' }]]); yield* wait(26); },
  *sk4_stanceB(U, T, u, t) { Sound.sfx('charge'); sk4Self(this, u, [['rage', { life: 60 }]]); yield* wait(26); },
  *sk4_stanceB1(U, T, u, t) { Sound.sfx('charge'); sk4Self(this, u, [['rage', { life: 70, pal: 'blood' }]]); yield* wait(28); },
  *sk4_stanceB2(U, T, u, t) { Sound.sfx('wind'); sk4Self(this, u, [['haste', { life: 70 }]]); yield* wait(28); },
});

function* sk4Og(b, U, T, u, t, o = {}) { yield* sk4Lunge(b, u, 18, T, t); Sound.sfx('charge'); const H = pfxHits26(b, null), n = H.length; let tm = 4;
  H.forEach((h, i) => { const C = b.center(h.v), k = sk4K(b, h.v), last = i === n - 1;
    if (!last) { const tt = tm; pfxAt26(b, tt, () => Sound.sfx('bladeQ')); sk4At(b, 'slash', C, 31, -33, { k: k * 0.9, delay: tt, flip: i % 2 === 1, palette: sk4Col(b, o.pal || 'gold'), seed: 3 + i, glow: 0.6 });
      pfxAt26(b, tt + 3, () => pfxLand26(b, i)); tm += Math.max(3, 6 - (i >> 1)); }
    else { const tt = tm + 6, fin = o.fin || 'cleave', [lx, ly, hit] = SK4HIT[fin]; pfxAt26(b, tt, () => Sound.sfx('bladeBig'));
      sk4At(b, fin, C, lx, ly, { k: k * (fin === 'dash' ? 0.8 : 1.15), delay: tt, palette: sk4Col(b, o.pal || 'gold'), seed: 11, glow: fin === 'dash' ? 0.3 : 0.6, ...(fin === 'cleave' ? { stone: '#a89880' } : {}) });
      pfxAt26(b, tt + hit, () => { Sound.sfx('crit'); pfxLand26(b, i); sk4At(b, 'crit', C, 0, -32, { k: k * 0.9, palette: sk4Col(b, o.pal || 'gold'), seed: 13, glow: 0.4 }); b.shake = Math.max(b.shake || 0, 8); }); } });
  yield* pfxWait26(b, 0); if (o.after) o.after(); }
Object.assign(FX, {
  // 必殺系：金色的月牙一刀接一刀（越來越快），最後一記收尾（重劈＋會心爆擊）；重劍系只有收尾
  *sk4_ult(U, T, u, t) { yield* sk4Og(this, U, T, u, t); }, *sk4_ultA(U, T, u, t) { yield* sk4Og(this, U, T, u, t); }, *sk4_ultA1(U, T, u, t) { yield* sk4Og(this, U, T, u, t); },
  *sk4_ultA2(U, T, u, t) { yield* sk4Og(this, U, T, u, t); },
  *sk4_ultB(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { pal: 'holy' }); },
  *sk4_ultB1(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { pal: 'holy', fin: 'dash' }); },
  *sk4_ultB2(U, T, u, t) { const self = this; yield* sk4Og(this, U, T, u, t, { pal: 'blood', after: () => sk4Self(self, u, [['halo', { life: 50, pal: 'blood' }]]) }); },
});
