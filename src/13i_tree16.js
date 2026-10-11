/* ===================== v12.114 武器技能樹整理（玩家 2026-10-11：「1~7都可以做」） =====================
   1. 法杖加一招物理招「杖擊」（第一段④）：遇到「魔障」也有招可以換。打物防，用物攻和魔攻較高的一項計算。
   2. 新的魔法招 MP 3 → 6（在 13f）。
   3. 單手盾補第三・四段：盾面反震（第三段）、守護之盾（第四段）。
   4. 短刀加一招打全體的：飛刀四散（第二段④）。
   5. 最終招比第四段弱的調高：百烈崩拳 18 → 26（×10）、幻影千迴 30 → 40（×4）。
   6. 每種近戰武器的第四・五段挑一招改成魔法招（打魔防，用物攻和魔攻較高的一項）：
      劍 一刀天斷、短刀 毒牙封喉、斧 天崩地裂、長槍 貫日神槍、拳套 氣爆掌、雙刀 旋花飛刃、雙劍 劍舞亂刃、雙盾 聖壁衝鋒。
   7. 去掉重複：劍不再蓄力（崩星劍改成會心路線）；「對護盾傷害加倍」集中到斧（劈山 ×2.5、碎盾擊 ×3）、雙盾的盾突、長槍的破陣槍，
      劍的破綻突・斷鋼一閃、拳套的狂嵐拳、雙劍的雙龍十字拿掉（狂嵐拳改成每段 10% 退縮）。
   先只在特效測試版（TREE16.live）；玩家看過說好才放進正式版。 */
const TREE16 = { live: true }; // v12.122 放上正式版
const T16 = {
  row(id) { for (const k of Object.keys(TREE11)) for (const r of TREE11[k].sk || []) if ('t_' + r[1] === id) return r; return null; },
  desc(id, d) { const D = DEF.skills[id]; if (D) D.desc = d; if (MOVES[id]) MOVES[id].d = d; const r = T16.row(id); if (r) r[8] = d; },
  pow(id, p) { const D = DEF.skills[id]; if (D) D.power = p; if (MOVES[id]) MOVES[id].pow = p; const r = T16.row(id); if (r) r[3] = p; },
  eff(id, ef, tag) { const D = DEF.skills[id]; D.effects = (D.effects || []).concat([effRegister('skill:' + id + '#' + tag, ef)]); },
  add(kind, row) { const T = TREE11[kind]; if (!T) { bvErr('tree16', kind); return; } const old = T.sk; T.sk = [row];
    try { sk11Build(kind); } finally { const i = old.reduce((a, s, j) => s[0] <= row[0] ? j : a, -1); T.sk = old.slice(0, i + 1).concat([row], old.slice(i + 1)); } },
};
BR.FORMULA.physAtk16 = c => { const S = c.src.stats; return Math.max(S.atk, S.spa) / Math.max(1, S.atk); };
const PHYT16 = '物理傷害（打對手的物防），用物攻和魔攻較高的一項計算。';
function physicalize16(id) { const D = DEF.skills[id]; if (!D) return; delete D.catOf; D.cat = '物'; D.tags = D.tags.map(t => t === 'magic' ? 'phys' : t); if (MOVES[id]) MOVES[id].cat = '物';
  D.mods.push({ stage: 'skill', who: 'attacker', atkMul: { f: 'physAtk16' }, cond: { srcIsHero: 1 } }); }
if (TREE16.live) {
  // 1. 法杖：杖擊
  T16.add('法杖', ['1d', 'stBash', '杖擊', 55, 0, 1, 6, 0, '用法杖重重敲下去。' + PHYT16, { cls: 'strike' }]); physicalize16('t_stBash');
  // 3. 單手盾
  T16.add('單手盾', ['3a', 'osRecoil', '盾面反震', 90, 0, 3, 20, 0, '舉盾撞上去把對手震開（攻擊力加上物防的 70%），50% 讓對手物攻 −1。', { cls: 'strike', mods: [{ stage: 'skill', who: 'attacker', atkMul: { f: 'osBash13' } }], effects: DMG11(SG11({ atk: -1 }, 0.5)) }]);
  T16.add('單手盾', ['4a', 'osAegis', '守護之盾', 0, 0, 5, 20, 0, '張開護盾 2 回合（最大 HP 25%、吸收 75%），下一次攻擊威力 +30%。', { effects: [{ type: 'ward12', target: 'self', pct: 0.25, abs: 0.75, turns: 2, why: 'aegis16' }, { type: 'status', target: 'self', status: 'nextPow11' }] }]);
  // 4. 短刀：飛刀四散
  T16.add('短刀', ['2d', 'dgFan', '飛刀四散', 35, 2, 2, 16, 1, '向全部魔物擲出飛刀，打全體 2 段，每段 20% 中毒。', { cls: 'area', effects: DMG11(STA11('psn', 0.2)) }]);
  // 5. 最終招
  T16.pow('t_ogFist', 26); T16.desc('t_ogFist', '十段連打（各 26），無視 30% 物防，每段 10% 退縮。');
  T16.pow('t_ogDual', 40); T16.desc('t_ogDual', '殘影在魔物之間穿梭，打全體 4 段（各 40），每段 15% 中毒。');
  // 6. 第四・五段的魔法招
  for (const id of ['t_zjSky', 't_zjVenomThroat', 't_ogAxe', 't_ogSpear', 't_zjQiBurst', 't_zjBloom', 't_zjSwordDance', 't_zjHolyWall']) { const D = DEF.skills[id]; if (!D) { bvErr('tree16', id); continue; }
    magicize15(id); T16.desc(id, D.desc.replace(/魔法傷害（打對手的魔防）.*$/, '') + MAGT15); }
  // 7. 劍改會心路線；破盾集中到斧・雙盾・長槍
  { const D = DEF.skills.t_sdMeteor; D.charge = false; D.tags = D.tags.filter(t => t !== 'charge'); D.mods = D.mods.filter(m => !(m.mul === 1.5 && m.cond && m.cond.tgtStatus === 'broken'));
    D.mods.push({ stage: 'skill', who: 'attacker', critAdd: 40 }, { ...CRIT11, cond: { tgtStatus: 'broken' } }); T16.pow('t_sdMeteor', 140); const r = T16.row('t_sdMeteor'); if (r && r[9]) r[9] = { ...r[9], charge: 0 };
    T16.desc('t_sdMeteor', '全力劈下（不用蓄力），會心率 +40%；對破防中的對手必定會心。'); }
  for (const id of ['t_sdGap', 't_zjSteel', 't_fsStorm', 't_ogTwin']) delete DEF.skills[id].wardX;
  T16.desc('t_sdGap', '突刺；對手物防下降時威力 ×1.5。'); T16.desc('t_zjSteel', '對物防下降中的對手必定會心。');
  T16.eff('t_fsStorm', FL11(0.1), 't16'); T16.desc('t_fsStorm', '八段連打，每段 10% 退縮。');
  T16.desc('t_ogTwin', '兩道巨大的十字斬（各 110），會心率 +30%。');
  DEF.skills.t_axSplit.wardX = 2.5; T16.desc('t_axSplit', '重劈，對護盾傷害 ×2.5。');
}
/* ---------- 新招的特效（新的那一套畫法） ---------- */
const TFX16 = {
  // 杖擊：杖頭一亮 → 衝上去往下一敲（鋼色的弧）→ 停格、紫色的小閃光
  stBash: { *f(U, T, u) { const P = HD15.P.arcane; glint15(this, P); Sound.sfx('fsSwing'); yield* this.lunge(u, 14, 2);
      HD15.slash(this, T, { pal: HD15.P.steel, r: 40, th: 9, ang: -2.41, dir: -1, span: 1.2, dur: 16 }); yield* wait(3);
      Sound.sfx('heavy'); HD15.stop(this, 4); HD15.flash(this, T, P, 26, { dur: 10 }); HD15.ring(this, T, P, 4, 22, { w: 2, dur: 12 }); HD15.sparks(this, T, 8, P, { spd: 2.6, life: 14 }); this.shake = Math.max(this.shake || 0, 4); yield* wait(12); } },
  // 飛刀四散：向每一隻魔物各擲兩把帶暗影的飛刀
  dgFan: { *f(U, T, u) { const H = DS16.hands(this), L = DG17.foes(this), P = HD15.P.shade; glint15(this, P, H.R); Sound.sfx('wind');
      for (let r = 0; r < 2; r++) { for (const v of L) { const C = this.center(v); HD15.comet(this, { x: H.R.x, y: H.R.y - 6 }, { x: C.x + (r ? 5 : -5), y: C.y + (r ? -4 : 4) }, P, 8, { w: 4 }); }
        yield* wait(8); Sound.sfx('bladeQ'); for (const v of L) DG17.pop(this, this.center(v), 0.7); yield* wait(4); }
      HD15.stop(this, 3); yield* wait(10); } },
  // 盾面反震：衝上去用盾一撞 → 盾面一圈震波、碎片往外噴
  osRecoil: { *f(U, T, u) { const P = HD15.P.silver; yield* this.lunge(u, 14, 3); const d = SH24.dir(this, T), H = DS16.hands(this).Hc; Sound.sfx('shSwing');
      SH24.plate(this, { x: T.x - d.ux * 8, y: T.y - d.uy * 8 }, P, { s: 1.3, from: { x: H.x + d.ux * 18 - T.x, y: H.y + d.uy * 18 - T.y }, mv: 6, dur: 22, shine: 1 }); yield* wait(6);
      Sound.sfx('shHitSuper'); HD15.stop(this, 5); SH24.slam(this, T, 1.2, { pal: P, d }); HD15.ring(this, T, P, 6, 36, { w: 2.4, dur: 16 }); HD15.shards(this, T, 10, { spd: 3, sz: 3, up: 1 }); this.shake = Math.max(this.shake || 0, 6); yield* wait(14); } },
  // 守護之盾：腳下一圈金光、盾舉到身前發光（護盾本身的六角護壁接著張開）
  osAegis: { *f(U, T, u) { const P = HD15.P.silver, C = GD25.front(this), G = { x: DS16.hands(this).Hc.x, y: HDW_FOOT() - 2 }; Sound.sfx('shGuard');
      HD15.ring(this, G, HD15.P.holy, 6, 36, { fl: 0.3, w: 1.8, dur: 20 }); SH24.plate(this, C, P, { s: 1.4, dur: 30, hold: 0.7, shine: 1, from: { x: 0, y: 8 }, mv: 5 }); yield* wait(10);
      HD15.flash(this, C, HD15.P.holy, 30, { dur: 12 }); yield* wait(10); } },
};
if (TREE16.live) for (const k in TFX16) { const id = 't_' + k, D = DEF.skills[id], F = TFX16[k]; if (!D) continue; const key = 'hd15_' + k;
  FX[key] = function* (U, T, u, t) { if (!T) { const L = this.foes ? this.foes().filter(v => !v.gone) : [], g = L.length > 1 ? this.groupOf(L.map(v => v.id)) : L[0]; T = g ? this.center(g) : { x: U.x, y: U.y - 80 }; if (!t) t = g; }
    if (!u) u = this.H; this.slashOn = 0; this.hd15cast = 1; HD15.forceW = false; yield* F.f.call(this, U, T, u, t); };
  HD15.old[id] = { fx: D.fx, hitFx: D.hitFx, mv: MOVES[id] ? MOVES[id].fx : null, style: typeof SKILL_STYLE !== 'undefined' ? SKILL_STYLE[id] : null, redo: false }; HD15.ids.push(id);
  if (HD15.on) { D.fx = key; D.hitFx = null; if (MOVES[id]) MOVES[id].fx = key; if (typeof SKILL_STYLE !== 'undefined') SKILL_STYLE[id] = ['draw', null, 'steel', null]; if (typeof REDO13 !== 'undefined') REDO13.add(id); } }
