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
    if (MOVES[id]) MOVES[id].fx = D.fx; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = [D.power ? 'draw' : 'sk4', null, sk.magic ? 'holy' : 'steel', null]; // 打中後不再疊舊的打擊特效
    if (sk.magic && D.power) { D.cat = '特'; D.tags = D.tags.map(t => t === 'phys' ? 'magic' : t); if (MOVES[id]) MOVES[id].cat = '特';
      D.desc += '魔法傷害（打對手的魔防），用物攻和魔攻較高的一項計算。'; if (MOVES[id]) MOVES[id].d = D.desc;
      D.mods.push({ stage: 'skill', who: 'attacker', atkMul: { f: 'magAtk15' }, cond: { srcIsHero: 1 } }); } } }
if (typeof CASTS !== 'undefined') CASTS.sk4 = () => 2; // 架勢：不放舊的出招特效（一圈光點），只放 pixelfx 的
if (typeof heroBless === 'function') { const _hb = heroBless; heroBless = function (u, mv, id) { if (/^t_s4/.test(id)) return; return _hb.call(this, u, mv, id); }; } // 架勢發動時的大光圈也不放（每招都一樣，重複）
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

/* ---------- 特效測試：4 招 × 7 種型態，分 8 組（每組最多 4 個） ----------
   玩家：「把測試時說明都拿掉」→ 選單只寫招式名稱、不顯示技能說明欄；戰鬥中的訊息和狀態說明也不跳 */
const sk4Quiet = () => typeof FXT13 !== 'undefined' && FXT13.on; // 只有特效測試的戰鬥會開
const sk4GroupName = ns => { const all = ns.join('・'); if (all.length <= 13) return all;                // 太長才縮：把每個名字都有的字抽出來放前面
  for (let L = ns[0].length; L >= 2; L--) for (let i = 0; i + L <= ns[0].length; i++) { const sub = ns[0].slice(i, i + L), rest = ns.map(n => n.replace(sub, ''));
    if (ns.every(n => n.includes(sub)) && rest.every(Boolean)) return sub + '：' + rest.join('・'); }                      // 鐵壁架勢・反擊架勢… → 架勢：鐵壁・反擊…
  return all; };
{ const _cm = Battle.prototype.chooseMove; Battle.prototype.chooseMove = function* () { const kind = typeof FXT13 !== 'undefined' && FXT13.on && FXT13.kind; if (!kind || !SK4.W[kind] || !SK4.on) return yield* _cm.call(this);
    const hu = this.core.byId.H, all = hu.skills.slice(), atk = hu.data.attackSkill, G = [];
    for (const sk of SK4.W[kind]) for (const ps of [['', 'A', 'B'], ['A1', 'A2', 'B1', 'B2']]) G.push([sk4GroupName(ps.map(p => sk.forms[p][0])), ps.map(p => sk4Id(sk.k, p))]);
    while (true) { const r = yield* choose(G.map(g => ({ t: g[0] })), { x: 8, y: 30, w: W - 16, fs: 9, cancel: true, index: this.sk4Page || 0 }); if (r < 0) return null; this.sk4Page = r;
      hu.skills = [atk].concat(G[r][1]); let out; FXT13.on = false; this.noInfo26 = true; try { out = yield* _cm.call(this); } finally { FXT13.on = true; this.noInfo26 = false; hu.skills = all; } if (out) return out; } }; }
// 戰鬥訊息（使用了…、HP 已經全滿了…）和狀態說明（心眼！下一擊必定會心…）在特效測試裡都不跳
{ const B = Battle.prototype, _m = B.msg, _a = B.announce; B.msg = function* (...a) { if (sk4Quiet()) { this.dropAnn(); return; } return yield* _m.apply(this, a); };
  B.announce = function* (...a) { if (sk4Quiet()) { this.dropAnn(); return; } return yield* _a.apply(this, a); };
  if (typeof BFX15 !== 'undefined' && BFX15.stanceHit) { const _sh = BFX15.stanceHit; BFX15.stanceHit = (b, t, id) => { if (!sk4Quiet()) return _sh(b, t, id); const P = b.popNum; b.popNum = () => {}; try { return _sh(b, t, id); } finally { b.popNum = P; } }; } // 硬殼 −40% 的字
  const H = B.handlers, _ap = H.STATUS_APPLY; H.STATUS_APPLY = function* (e, s, t, P) { if (!sk4Quiet() || !P) return yield* _ap.call(this, e, s, t, P); const q = P.quiet; P.quiet = 1; try { return yield* _ap.call(this, e, s, t, P); } finally { P.quiet = q; } }; }

/* ---------- 特效（pixelfx） ---------- */
const SK4P = { blade: null, holy: 'holy', gold: 'gold', dawn: 'gold' };
const sk4Pal = n => n ? pfxPal26(n) : undefined;
// 出招時：這一招的型態、等級（覺醒＝Lv8：金色、放大）
{ const B = Battle.prototype, _pf = B.playFx; B.playFx = function* (name, u, t) { if (/^sk4_/.test(name)) { const m = name.slice(4).match(/^([a-z]+)([AB][12]?)?$/), k = m && m[1], p = (m && m[2]) || '';
      const id = sk4Id(k, p), L = (this.core.byId.H && this.core.byId.H.data && this.core.byId.H.data.sk4Lv) || {}; const lv = L[id] || 1; this.sk4Cur = { k, p, lv, aw: lv >= SK4.MAX }; }
    return yield* _pf.call(this, name, u, t); }; }
// 大小：玩家「特效太大 反而看得很奇怪」→ 全部乘上 SK4.SZ（打在魔物身上的特效大約跟魔物一樣大）；覺醒只大 10%
// v13.0b 玩家：「感覺重複度過高而且多目標斬擊時怪異」
//   → 28 種型態各用不同的特效（月牙只留在斬擊・連斬・劍氣・必殺的連砍）；
//   → 連砍打到別隻魔物時，主角先閃到那隻前面再砍（留殘影），不再站在 A 前面卻砍到 C。
SK4.SZ = 0.55; SK4.SZS = 0.8; SK4.AW = 1.1;
SK4.SELFK = { field: 0.85, dshield: 1.1, block: 0.8, charge: 0.9, parry: 0.6, fring: 0.8, pillar: 0.62, leaves: 0.95 }; // 自己身上的特效：各自縮到跟角色差不多大
const sk4Aw = b => (b.sk4Cur && b.sk4Cur.aw ? SK4.AW : 1);
const sk4K = (b, v, base = 40) => pfxSize26(v && (v.hero ? pfxBody26(b, v).h : v.bbh), base) * sk4Aw(b);
const sk4Col = (b, def) => (def ? pfxPal26(def) : b.sk4Cur && b.sk4Cur.aw ? pfxPal26('gold') : undefined); // 有自己顏色的招（血紅、雷黃…）覺醒後照樣用自己的顏色，只變大
const sk4Same = (a, c) => a === c || !!(a && c && a.id != null && a.id === c.id);
// 把特效裡「打中的那一點」(lx, ly) 放到 C（有轉角度、左右翻也照算）
function sk4At(b, mod, C, lx, ly, o = {}) { const k = (o.k || 1) * (o.raw ? 1 : SK4.SZ), fl = o.flip ? -1 : 1, a = o.angle || 0, cs = Math.cos(a), sn = Math.sin(a); const { raw, ...op } = o;
  return pfxSpawn26(b, pfxM26(mod), { x: Math.round(C.x - k * (lx * fl * cs - ly * sn)), y: Math.round(C.y - k * (lx * fl * sn + ly * cs)) }, { ...op, k }); }
// 落在地上的特效（原點＝腳下）
function sk4Ground(b, v, mod, o = {}) { const F = pfxBody26(b, v); return pfxSpawn26(b, pfxM26(mod), { x: F.x, y: F.foot + (o.dy || 0) }, { ...o, dy: undefined, k: (o.k || 1) * SK4.SZ }); }
// 打中的那一點、第幾幀打到
const SK4HIT = { slash: [31, -33, 3], cross: [35, -27, 10], spin: [0, -28, 13], cleave: [30, -21, 22], dash: [165, -36, 16], crit: [0, -32, 0], spark: [0, -20, 0],
  claw: [33, -19, 4], flurry: [45, -26, 4], parry: [0, -32, 0], blunt: [0, -23, 0], iframe: [0, 0, 0] };

/* ---------- 多目標：閃過去再砍 ---------- */
SK4.HOP = 6;
// 主角原本站的中心（不含往前站的位移；GBA 構圖的 center 本來就不含，舊構圖會含——先拿掉再算才一致）、現在的身體位置
const sk4Home = b => { const B = b.hdwBase; b.hdwBase = null; try { return b.center(b.H); } finally { b.hdwBase = B; } };
const sk4HeroBody = b => { const B = b.hdwBase; let Hb; b.hdwBase = null; try { Hb = pfxBody26(b, b.H); } finally { b.hdwBase = B; } return B ? { ...Hb, x: Hb.x + B.x, foot: Hb.foot + B.y } : Hb; };
function sk4Hop(b, v, at) { pfxAt26(b, at, () => { const Hv = b.H, o = Hv && Hv.off, B = b.hdwBase; if (!o || !B || !v) return;
    const { x: X0, y: Y0 } = sk4Home(b), T = b.center(v), R = b.sk4Rel || { x: -24, y: 56 }, x1 = clamp(T.x + R.x, 30, W - 30) - X0, y1 = T.y + R.y - Y0, x0 = o.x, y0 = o.y, q = b.pfxQ26; // 站在那隻魔物的左下方（跟第一隻的相對位置一樣）
    Sound.sfx('blink'); if (typeof HD18 !== 'undefined') HD18.shadow(b, 0, 0, 10, 0.45);
    let f = 0; const step = () => { f++; const e = HDW.ease(Math.min(1, f / (SK4.HOP - 1))); o.x = x0 + (x1 - x0) * e; o.y = y0 + (y1 - y0) * e; b.hdwBase = { ...b.hdwBase, x: o.x, y: o.y }; b.hdwT = b.t;
      if (f === 2 && typeof K13 !== 'undefined' && K13.ghost) K13.ghost(b, 0, 0, '#ffffff', 8, 0.3);
      if (f < SK4.HOP - 1 && q) q.timers.push({ f: 1, fn: step }); };
    step(); }); }
// 每一下在第幾幀：換目標時先多 SK4.HOP 幀閃過去
function sk4Times(b, H, gap, t0 = 0) { let cur = b.sk4Stand || (H[0] && H[0].v), tm = t0; const out = [];
  H.forEach((h, i) => { if (h.v && !sk4Same(h.v, cur) && b.hdwBase) { sk4Hop(b, h.v, tm); tm += SK4.HOP; cur = h.v; } out.push(tm); tm += gap(i); }); return out; }
const sk4Runs = H => H.map((h, i) => i === 0 || !sk4Same(H[i - 1].v, h.v)); // 這一下是不是剛換到這隻
// 近身招：先走到魔物前面，再往前撲一下
const sk4Lunge = function* (b, u, n = 18, T, t) { b.sk4Stand = t && !t.group ? t : null; b.sk4Rel = null; if (typeof HDW !== 'undefined' && HDW.go && T && (!u || u.hero || u === b.H)) yield* HDW.go(b, T, t);
  if (b.hdwBase && b.sk4Stand) { const H0 = sk4Home(b), A = { x: H0.x + b.hdwBase.x, y: H0.y + b.hdwBase.y }, C = b.center(b.sk4Stand); b.sk4Rel = { x: clamp(A.x - C.x, -40, 8), y: Math.max(A.y - C.y, 50) }; } // 之後換目標：站在新目標的同一個相對位置
  if (b.lunge) yield* b.lunge(u, n, 2); };

/* ---------- 近身 ---------- */
// 每一下在被打的魔物身上出一份 mod；o.run＝同一隻連續被打時只出一份（亂舞、爪痕這種一份就有好幾刀的特效）
function sk4Melee(b, mod, gap, o = {}) { const H = pfxHits26(b, null), ts = sk4Times(b, H, gap), runs = sk4Runs(H);
  H.forEach((h, i) => { const m = typeof mod === 'function' ? mod(i) : mod, [lx, ly, hit] = SK4HIT[m], C = b.center(h.v), k = sk4K(b, h.v) * (o.k || 1), t = ts[i];
    pfxAt26(b, t, () => Sound.sfx(o.snd || 'blade'));
    if (!o.run || runs[i]) sk4At(b, m, C, lx, ly, { k, delay: t, flip: o.flips ? i % 2 === 1 : false, angle: o.ang ? o.ang(i) : undefined, palette: sk4Col(b, o.pal), seed: 3 + i, glow: o.glow || 0.55, ...(o.x || {}) });
    pfxAt26(b, t + (o.run ? 2 : hit), () => { pfxLand26(b, i); if (o.spark) sk4At(b, 'spark', C, 0, -20, { k: k * (o.sparkK || 0.8), palette: o.sparkPal ? pfxPal26(o.sparkPal) : undefined, seed: 9 + i }); if (o.on) o.on(i, C, k, h); }); });
  return H; }
// 手邊聚氣（全力斬・必殺重劍的前奏）
function sk4Charge(b, u, pal, life = 18) { Sound.sfx('charge'); sk4Self(b, u, [['charge', { life, pal }]]); }

/* ---------- 遠距 ---------- */
// 劍氣：從手邊飛到第 i 下打的魔物（sword-slash 的月牙跟著移動）
function sk4Wave(b, U, i, C, o = {}) { const A = pfxHand26(U), a = Math.atan2(C.y - A.y, C.x - A.x), k = (o.k || 1) * SK4.SZ * sk4Aw(b), d = o.d || 12, t0 = o.t0 || 0;
  pfxAt26(b, t0, () => Sound.sfx(o.snd || 'stBolt'));
  const ox = k * (31 * Math.cos(a) + 33 * Math.sin(a)), oy = k * (31 * Math.sin(a) - 33 * Math.cos(a)); // 月牙的中心（特效裡的 31,−33）沿著路線飛
  const A0 = { x: A.x - ox, y: A.y - oy }, e = pfxSpawn26(b, pfxM26('slash'), A0, { angle: a, k, delay: t0, palette: sk4Col(b, o.pal || 'holy'), seed: 20 + i, glow: 0.5 });
  if (e) e.move = { a: A0, b: { x: C.x - ox - Math.cos(a) * 6 * k, y: C.y - oy - Math.sin(a) * 6 * k }, d, end: () => { pfxLand26(b, i); sk4At(b, 'spark', C, 0, -20, { k: 1.0, palette: sk4Col(b, o.pal || 'holy'), seed: 30 + i }); } };
  return e; }
// 大劍氣：一道長長的劍氣貼著地面從左掃到右，經過哪隻就打哪隻
function sk4Sweep(b, pal) { const H = pfxHits26(b, null), P = H.map(h => b.center(h.v)), x0 = Math.min(...P.map(p => p.x)), x1 = Math.max(...P.map(p => p.x)), y = Math.max(...H.map(h => pfxBody26(b, h.v).foot));
  const k = clamp((x1 - x0 + 70) / 143, 0.6, 2.2) * sk4Aw(b);
  Sound.sfx('stBolt'); pfxSpawn26(b, pfxM26('sweep'), { x: Math.round((x0 + x1) / 2 - 14 * k), y: Math.round(y - 6) }, { k, palette: sk4Col(b, pal), seed: 8, glow: 0.5 });
  H.forEach((h, i) => pfxAt26(b, 5 + Math.round((P[i].x - x0) / 28), () => { pfxLand26(b, i); sk4At(b, 'spark', P[i], 0, -20, { k: 0.9, palette: sk4Col(b, pal), seed: 30 + i }); })); }
// 劍氣風暴：每隻魔物腳下捲起一陣旋風，打 2 次
function sk4Storm(b) { const H = pfxHits26(b, null), vs = [], seen = new Map(); for (const h of H) if (!vs.some(v => sk4Same(v, h.v))) vs.push(h.v);
  Sound.sfx('wind'); vs.forEach((v, j) => sk4Ground(b, v, 'tornado', { k: 0.62 * sk4K(b, v), life: 44, delay: j * 4, palette: sk4Col(b), seed: 40 + j, glow: 0.35 }));
  H.forEach((h, i) => { const r = seen.get(h.v) || 0, j = vs.findIndex(v => sk4Same(v, h.v)); seen.set(h.v, r + 1); pfxAt26(b, j * 4 + 10 + r * 18, () => { Sound.sfx('blade'); pfxLand26(b, i); }); }); }
// 破魔劍氣：每隻魔物腳下亮起紫色魔法陣，接著炸開
function sk4Rune(b) { const H = pfxHits26(b, null), vs = []; for (const h of H) if (!vs.some(v => sk4Same(v, h.v))) vs.push(h.v); Sound.sfx('mana');
  vs.forEach((v, j) => { const k = sk4K(b, v); sk4Ground(b, v, 'rune', { k: k * 0.75, life: 34, palette: pfxPal26('arcane'), seed: 50 + j, glow: 0.4 });
    pfxAt26(b, 14 + j * 3, () => { Sound.sfx('arcane'); sk4Ground(b, v, 'burst', { k: k * 0.55, palette: pfxPal26('arcane'), seed: 60 + j, glow: 0.45 }); }); });
  H.forEach((h, i) => pfxAt26(b, 18 + vs.findIndex(v => sk4Same(v, h.v)) * 3, () => pfxLand26(b, i))); }
// 穿透劍氣：一道細長的光束直直射穿
function sk4Beam(b, U, pal) { const H = pfxHits26(b, null), A = pfxHand26(U); Sound.sfx('stBolt');
  H.forEach((h, i) => { const C = b.center(h.v), t0 = i * 10; pfxAt26(b, t0, () => pfxAim26(b, pfxM26('beam'), [15, -24], [183, -24], A, C, { life: 14, palette: sk4Col(b, pal), seed: 70 + i, glow: 0.5 }));
    pfxAt26(b, t0 + 4, () => { pfxLand26(b, i); sk4At(b, 'spark', C, 0, -20, { k: 0.9, palette: sk4Col(b, pal), seed: 80 + i }); }); }); }
// 雷光劍氣：落雷打在魔物身上
function sk4Bolt(b) { const H = pfxHits26(b, null); Sound.sfx('charge');
  H.forEach((h, i) => { const t0 = i * 10; pfxAt26(b, t0, () => sk4Ground(b, h.v, 'bolt', { k: sk4K(b, h.v) * 0.62, pre: 0.6, seed: 90 + i, glow: 0.5 }));
    pfxAt26(b, t0 + 10, () => { Sound.sfx('thunder'); pfxLand26(b, i); b.shake = Math.max(b.shake || 0, 5); }); }); }
// 吸血：魔物身上冒出紅色血珠，飛回主角身上
function sk4Steal(b, h, i, at) { pfxAt26(b, at, () => { const C = b.center(h.v), Hb = sk4HeroBody(b), A = { x: Hb.x, y: Hb.foot - Hb.h * 0.45 }, dx = C.x - A.x, dy = C.y - A.y;
    const lx = 103, ly = -4, a = Math.atan2(dy, dx) - Math.atan2(ly, lx), k = clamp(Math.hypot(dx, dy) / Math.hypot(lx, ly), 0.7, 2), cs = Math.cos(a), sn = Math.sin(a); // 特效裡：手 (1,−20) → 目標 (104,−24)
    Sound.sfx('heal'); pfxSpawn26(b, pfxM26('steal'), { x: Math.round(A.x - k * (1 * cs + 20 * sn)), y: Math.round(A.y - k * (1 * sn - 20 * cs)) }, { angle: a, k, seed: 95 + i, glow: 0.5 }); }); }

/* ---------- 自己身上 ---------- */
// [特效, { life, pal, k, dy }]：原點在腳下（聚氣・格擋・火焰另外對位）
function sk4Self(b, u, mods) { const v = u && b.views[u.id] || b.H, B = pfxBody26(b, v), k = clamp(B.h / 46, 0.9, 1.8) * SK4.SZS * sk4Aw(b);
  for (const [mod, o] of mods) { const kk = k * (SK4.SELFK[mod] || 1) * (o.k || 1), dy = mod === 'flame' ? -B.h * 0.25 : mod === 'parry' ? -B.h * 0.2 : 0;
    pfxSpawn26(b, pfxM26(mod), { x: B.x + (o.dx || 0), y: Math.round(B.foot + dy + (o.dy || 0)) }, { k: kk, delay: o.delay || 0, life: o.life || 60, palette: o.pal ? pfxPal26(o.pal) : (b.sk4Cur && b.sk4Cur.aw ? pfxPal26('gold') : undefined), glow: 0.55, seed: 5, cut: o.cut || 0 }); } }

Object.assign(FX, {
  // 斬擊系：基本＝月牙；重斬＝往下劈＋悶響；破甲＝交叉＋刀刃撞擊的閃光；全力＝聚氣→劈進地面＋震波＋會心；連斬＝不同角度的月牙；五連＝亂舞；流血＝紅色爪痕＋滴血
  *sk4_cut(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => 8, { spark: 1 }); yield* pfxWait26(this, 0); },
  *sk4_cutA(U, T, u, t) { yield* sk4Lunge(this, u, 14, T, t); sk4Melee(this, 'cleave', i => 8, { snd: 'bladeBig', x: { stone: '#a89880' }, on: (i, C, k) => { Sound.sfx('heavy'); sk4At(this, 'blunt', C, 0, -23, { k: k * 0.7, seed: 7 + i, glow: 0.4 }); } }); yield* pfxWait26(this, 0); },
  *sk4_cutA1(U, T, u, t) { yield* sk4Lunge(this, u, 14, T, t); sk4Melee(this, 'cross', i => 10, { pal: 'metal', on: (i, C, k) => { Sound.sfx('shGuard'); sk4At(this, 'parry', C, 0, -32, { k: k * 0.55, palette: pfxPal26('metal'), seed: 7 + i, glow: 0.5 }); } }); yield* pfxWait26(this, 0); },
  *sk4_cutA2(U, T, u, t) { sk4Charge(this, u); yield* wait(14); yield* sk4Lunge(this, u, 12, T, t); const H = pfxHits26(this, null), C = this.center(H[0].v), k = sk4K(this, H[0].v) * 1.1;
    Sound.sfx('bladeBig'); sk4At(this, 'cleave', C, 30, -21, { k, palette: sk4Col(this), seed: 4, stone: '#a89880' });
    pfxAt26(this, 22, () => { Sound.sfx('heavy'); H.forEach((h, i) => pfxLand26(this, i)); sk4Ground(this, H[0].v, 'slam', { k: k * 0.45, palette: sk4Col(this), seed: 6, glow: 0.4 }); sk4At(this, 'crit', C, 0, -32, { k: k * 0.8, palette: sk4Col(this), seed: 6, glow: 0.4 }); this.shake = Math.max(this.shake || 0, 8); });
    yield* pfxWait26(this, 0); },
  *sk4_cutB(U, T, u, t) { const A = [-0.45, 0.5, 0.05]; yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'slash', i => 6, { flips: 1, ang: i => A[i % 3], snd: 'bladeQ', k: 0.85, spark: 1, sparkK: 0.6 }); yield* pfxWait26(this, 0); },
  *sk4_cutB1(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); sk4Melee(this, 'flurry', i => 5, { run: 1, pal: 'ice', snd: 'bladeQ', k: 0.8, spark: 1, sparkK: 0.6, sparkPal: 'ice' }); yield* pfxWait26(this, 0); },
  *sk4_cutB2(U, T, u, t) { yield* sk4Lunge(this, u, 18, T, t); const bled = new Set();
    sk4Melee(this, 'claw', i => 6, { run: 1, pal: 'blood', snd: 'bladeQ', k: 0.85, spark: 1, sparkK: 0.6, sparkPal: 'blood', on: (i, C, k, h) => { if (bled.has(h.v)) return; bled.add(h.v); sk4At(this, 'bleed', C, 0, -8, { k: k * 0.9, life: 50, seed: 12 + i }); } }); yield* pfxWait26(this, 0); },
  // 劍氣系：基本＝白金月牙飛過去；大劍氣＝貼地橫掃全部；風暴＝每隻腳下旋風；破魔＝紫色魔法陣炸開；穿透＝細長光束；雷光＝落雷；吸血＝血珠飛回來
  *sk4_wave(U, T, u, t) { pfxHits26(this, null).forEach((h, i) => sk4Wave(this, U, i, this.center(h.v), { t0: i * 8 })); yield* pfxWait26(this, 0); },
  *sk4_waveA(U, T, u, t) { sk4Sweep(this, 'holy'); yield* pfxWait26(this, 0); },
  *sk4_waveA1(U, T, u, t) { sk4Storm(this); yield* pfxWait26(this, 0); },
  *sk4_waveA2(U, T, u, t) { sk4Rune(this); yield* pfxWait26(this, 0); },
  *sk4_waveB(U, T, u, t) { sk4Beam(this, U, 'ice'); yield* pfxWait26(this, 0); },
  *sk4_waveB1(U, T, u, t) { sk4Bolt(this); yield* pfxWait26(this, 0); },
  *sk4_waveB2(U, T, u, t) { Sound.sfx('stBolt'); pfxHits26(this, null).forEach((h, i) => { sk4Steal(this, h, i, i * 10); pfxAt26(this, i * 10 + 3, () => pfxLand26(this, i)); }); yield* pfxWait26(this, 0); },
  // 架勢系：集中＝手邊聚起金光；防守＝藍色光罩；鐵壁＝六角護盾；反擊＝前方的盾＋刀光一閃；攻擊＝腳下燃起一圈火；狂暴＝血紅的火柱；疾風＝捲起的風和葉子
  // （pixelfx 的 rage／haste 會畫一個替身小人，跟主角對不上，不用）
  *sk4_stance(U, T, u, t) { Sound.sfx('statUp'); sk4Self(this, u, [['charge', { life: 44, pal: 'gold' }]]); yield* wait(24); },
  *sk4_stanceA(U, T, u, t) { Sound.sfx('shGuard'); sk4Self(this, u, [['dshield', { life: 54, pal: 'ice' }]]); yield* wait(26); },
  *sk4_stanceA1(U, T, u, t) { Sound.sfx('shGuard'); sk4Self(this, u, [['field', { life: 64, pal: 'metal' }]]); yield* wait(28); },
  *sk4_stanceA2(U, T, u, t) { Sound.sfx('shGuard'); sk4Self(this, u, [['block', { life: 50, pal: 'ice' }], ['parry', { delay: 12, pal: 'ice' }]]); yield* wait(28); },
  *sk4_stanceB(U, T, u, t) { Sound.sfx('fire'); sk4Self(this, u, [['fring', { cut: 56 }]]); yield* wait(28); },
  *sk4_stanceB1(U, T, u, t) { Sound.sfx('fire'); sk4Self(this, u, [['pillar', { cut: 60, pal: 'blood' }]]); this.shake = Math.max(this.shake || 0, 4); yield* wait(30); },
  *sk4_stanceB2(U, T, u, t) { Sound.sfx('wind'); sk4Self(this, u, [['leaves', { life: 64 }]]); yield* wait(28); },
});

// 輔助招不經過 playFx：在這裡記下這一招的型態、等級（覺醒要用）
for (const p of SK4.FORMS) { const key = 'sk4_stance' + p, F = FX[key]; FX[key] = function* (...a) { const id = sk4Id('stance', p), H = this.core.byId.H, L = (H && H.data && H.data.sk4Lv) || {}, lv = L[id] || 1; this.sk4Cur = { k: 'stance', p, lv, aw: lv >= SK4.MAX }; return yield* F.apply(this, a); }; }
/* ---------- 必殺系（金色）：連砍＋收尾 ----------
   o.mod(i)／o.ang(i)：連砍用的特效和角度；o.flurry：連砍改成亂舞；o.charge：先聚氣；
   o.fin：收尾（cleave 劈・dash 衝刺・spin 迴旋・smite 天上落下的光）；o.slam：地面震波；o.iframe：衝擊畫面；o.steal：吸血 */
function* sk4Og(b, U, T, u, t, o = {}) { if (o.charge) { sk4Charge(b, u, o.pal || 'gold', 20); yield* wait(16); }
  yield* sk4Lunge(b, u, 18, T, t); Sound.sfx('charge'); const H = pfxHits26(b, null), n = H.length, pal = () => sk4Col(b, o.pal || 'gold'), runs = sk4Runs(H);
  const ts = sk4Times(b, H, i => (i < n - 2 ? Math.max(3, 6 - (i >> 1)) : 10), 4);
  H.forEach((h, i) => { const C = b.center(h.v), k = sk4K(b, h.v), tt = ts[i];
    if (i < n - 1) { pfxAt26(b, tt, () => Sound.sfx('bladeQ'));
      if (o.flurry) { if (runs[i]) sk4At(b, 'flurry', C, 45, -26, { k: k * 0.85, delay: tt, palette: pal(), seed: 3 + i, glow: 0.5 }); pfxAt26(b, tt + 2, () => { pfxLand26(b, i); sk4At(b, 'spark', C, 0, -20, { k: k * 0.6, palette: pal(), seed: 9 + i }); }); }
      else { const m = o.mod ? o.mod(i) : 'slash', [lx, ly] = SK4HIT[m]; sk4At(b, m, C, lx, ly, { k: k * 0.85, delay: tt, flip: i % 2 === 1, angle: o.ang ? o.ang(i) : undefined, palette: pal(), seed: 3 + i, glow: 0.6 }); pfxAt26(b, tt + 3, () => pfxLand26(b, i)); }
      return; }
    const fin = o.fin || 'cleave', hit = fin === 'smite' ? 14 : SK4HIT[fin][2]; pfxAt26(b, tt, () => Sound.sfx(fin === 'smite' ? 'stCast' : 'bladeBig'));
    if (fin === 'smite') sk4Ground(b, h.v, 'smite', { k: k * 0.7, delay: tt, pre: 0.3, palette: pal(), seed: 11, glow: 0.5 });
    else { const [lx, ly] = SK4HIT[fin]; sk4At(b, fin, C, lx, ly, { k: k * (fin === 'dash' ? 0.8 : fin === 'spin' ? 1.05 : 1.15), delay: tt, palette: pal(), seed: 11, glow: fin === 'dash' ? 0.3 : 0.6, ...(fin === 'cleave' ? { stone: '#a89880' } : {}) }); }
    pfxAt26(b, tt + hit, () => { Sound.sfx('crit'); pfxLand26(b, i); b.shake = Math.max(b.shake || 0, 8);
      if (o.iframe) sk4At(b, 'iframe', { x: W / 2, y: C.y }, 0, 0, { k: 2.6, raw: 1, seed: 13, glow: 0 }); // 衝擊畫面：蓋滿整個畫面（只有 4 幀）
      if (o.slam) sk4Ground(b, h.v, 'slam', { k: k * 0.45, palette: pal(), seed: 14, glow: 0.4 });
      sk4At(b, 'crit', C, 0, -32, { k: k * 0.8, palette: pal(), seed: 13, glow: 0.4 });
      if (o.steal) sk4Steal(b, h, i, 6); }); });
  if (o.steal) b.sk4HoldEnd = 36; yield* pfxWait26(b, 0); }
// 吸血：等血珠飛回主角身上，主角才走回原位
{ const HD = Battle.prototype.handlers, _ae = HD.ACTION_END; HD.ACTION_END = function* (...a) { const n = this.sk4HoldEnd || 0; this.sk4HoldEnd = 0; if (n) yield* wait(n); return yield* _ae.apply(this, a); }; }
Object.assign(FX, {
  // 基本＝金色月牙＋劈；連劍＝月牙・交叉交替＋迴旋收尾；七連＝金色亂舞＋天上落下的光；亂劍＝閃到每隻魔物前面砍＋迴旋＋震波；
  // 重劍＝聚氣→劈＋震波；一刀＝衝刺＋衝擊畫面；吸血劍＝血紅的劈＋血珠飛回來
  *sk4_ult(U, T, u, t) { yield* sk4Og(this, U, T, u, t); },
  *sk4_ultA(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { mod: i => (i % 2 ? 'cross' : 'slash'), fin: 'spin' }); },
  *sk4_ultA1(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { flurry: 1, fin: 'smite' }); },
  *sk4_ultA2(U, T, u, t) { const A = [-0.5, 0.4, 0.1, -0.2, 0.6]; yield* sk4Og(this, U, T, u, t, { ang: i => A[i % 5], fin: 'spin', slam: 1 }); },
  *sk4_ultB(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { charge: 1, slam: 1 }); },
  *sk4_ultB1(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { pal: 'holy', fin: 'dash', iframe: 1 }); },
  *sk4_ultB2(U, T, u, t) { yield* sk4Og(this, U, T, u, t, { pal: 'blood', steal: 1 }); },
});
