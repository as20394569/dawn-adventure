/* ===================== v12.24 技能樹下面的說明框重新排版（玩家 2026-10-05：「技能樹的技能效果的文字編排不好」） =====================
   原本：「物理・威力65・MP10・冷卻1　重劈，對護盾傷害 ×2。　【斧技能樹 Lv1】（還沒學）A：學習（1 點）」整串擠在一起換行，
   數字還會被切開（「×1.」「5」）。改成分三塊：
   1. 第一行：小標籤——種類、威力、MP、冷卻、全體／搶先／蓄力（技能）；被動・特性・精通・特技也有自己的標籤。
   2. 中間：效果說明（白字，放不下才縮小字）。
   3. 最下面一行：左邊等級和狀態（Lv1/5・還沒學），右邊要按什麼（A：學習（1 點））；前置條件不夠時寫在這行上面（橘字）。
   另外：換行時數字・英數不再被拆開（全遊戲的文字都適用）。 */
function treeInfoParts12(kind, N, st = Game.st) { const T = TREE11[kind], lv = N.t === 'reset' ? 0 : trLv11(N.key, st), s = N.t === 'reset' ? null : nodeState11(kind, N, st), P = { tags: [], text: '', lv: '', act: '', need: '' };
  if (N.t === 'reset') { P.tags = ['重置']; P.text = treeInfo11(kind, N, st); P.act = 'A：重置'; return P; }
  if (N.t === 'sk') { const D = DEF.skills[N.key], lvx = Math.max(1, lv), mp = (D.costs || []).find(c => c.res === 'mp');
    const pw = D.power && !D.powerOf ? Math.round(D.power * (1 + 0.1 * (lvx - 1))) : null, mpv = mp ? (mp.all ? '全部 MP' : 'MP ' + (D.power ? mp.amount : Math.max(0, Math.round(mp.amount * (1 - 0.1 * (lvx - 1)))))) : '';
    const cd = Math.max(0, (D.cooldown || 0) - (!D.power && lvx >= 5 ? 1 : 0));
    P.tags.push(D.cat === '變' || !D.power ? '輔助' : D.cat === '物' ? '物理' : '魔法'); if (pw) P.tags.push('威力 ' + pw + (D.hits ? '×' + D.hits[0] : '')); if (mpv) P.tags.push(mpv); if (cd) P.tags.push('冷卻 ' + cd);
    if (D.prio) P.tags.push('搶先'); if (D.target === 'all_enemies') P.tags.push('全體'); if (D.charge) P.tags.push('蓄力');
    P.text = D.desc || ''; }
  else if (N.t === 'sp') { const [n, k] = T.sp[N.j]; P.tags = ['特技', '普攻累積後自動發動']; P.text = '「' + n + '」' + SP_TXT11[k] + '。威力跟著武器的階級。';
    if (lv) { const on = tr11(st).eq[kind] === N.j; P.lv = on ? '裝備中' : '已學會'; P.act = on ? 'A：卸下' : 'A：裝上'; } }
  else if (N.t === 'trait') { P.tags = ['特性', '用' + kind + '時有效']; P.text = T.trait + '。'; }
  else if (N.t === 'mast') { P.tags = ['精通']; P.text = (T.dual ? T.mastD : '用' + kind + '時傷害 +3%／級') + '。'; }
  else if (N.t === 'third') { P.tags = ['被動', '用' + kind + '時有效']; P.text = T.third[0] + '：' + T.third[1] + '。'; }
  else if (N.t === 'cp') { P.tags = ['共通', '用什麼武器都有效']; P.text = N.n + '：' + N.d + '。'; }
  if (!P.lv) P.lv = N.max > 1 ? 'Lv' + lv + '/' + N.max + (lv ? '' : '・還沒學') : lv ? '已學會' : '還沒學';
  if (!P.act && s) { if (s.ok) P.act = 'A：' + (lv ? '升級' : '學習') + '（1 點）'; else if (!s.full) P.need = s.why; }
  return P; }
function drawTreeInfo12(x, kind, N, st, Y0, Y1) { const X = 10, Wd = 152, P = treeInfoParts12(kind, N, st); let y = Y0 + 4;
  // 1. the tags
  let tx = X; for (const t of P.tags) { const w = Math.ceil(Font.width(t, 8)) + 6; if (tx + w > X + Wd) break; x.fillStyle = 'rgba(40,70,90,0.85)'; x.fillRect(tx, y, w, 11); x.fillStyle = UIC.accent; x.fillRect(tx, y + 10, w, 1); Font.draw(x, t, tx + 3, y - 2, '#c8f4ec', UIC.textSh, 8); tx += w + 3; }
  if (P.tags.length) y += 14;
  // 3. the bottom row (and what is missing, above it)
  const bot = Y1 - 13; let top = bot; Font.draw(x, P.lv, X, bot, UIC.muted, UIC.textSh, 9); if (P.act) Font.drawR(x, P.act, X + Wd, bot, UIC.accent, UIC.textSh, 9);
  if (P.need) { top = bot - 12; Font.draw(x, P.need, X, top, UIC.warm, UIC.textSh, 9); }
  // 2. the text, as big as fits
  if (P.text) drawFitText(x, P.text, X, y, Wd, top - y - 1, 10, UIC.text); }
// the tabbed screen calls this for its box (10zzz_v12_t4_tree.js)
