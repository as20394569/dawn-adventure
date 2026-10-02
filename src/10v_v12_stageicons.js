/* ===================== v12.0.1 能力升降圖示：單字方塊（玩家：「BUFF跟DEBUFF圖示還是不好看」→ 選了 A 單字方塊） =====================
   The HD art squeezed a stat symbol and an arrow into 14px, so sword / shield / boots were hard to tell apart. Now each stage
   is a 14px tile with one big character (攻 物攻・防 物防・魔 魔攻・抗 魔防・速 速度) and a strip of arrows on the right (one per
   stage, up to 3); warm tile = up, cool tile = down. Drawn with paths and text at the screen's full resolution (the canvas
   transform is ×SCALE), so it stays sharp on phones. Same size and spacing as before, so the plates' layout is unchanged. */
const STAGE_CH = { atk: '攻', def: '防', spa: '魔', spd: '抗', spe: '速' };
const STAGE_COL = { up: ['#ffb45a', '#d4621e', '#8a2e10', '#ffe27a'], down: ['#8cc4ff', '#3a6cc8', '#1a3270', '#d0eeff'] }; // rim, top, bottom, arrow
function stageRound(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function drawStageTile(x, k, v, X, Y) {
  const S = ICON_SZ, up = v > 0, [rim, top, bot, ar] = STAGE_COL[up ? 'up' : 'down'];
  x.save();
  stageRound(x, X - 0.5, Y - 0.5, S + 1, S + 1, 3); x.fillStyle = '#10121e'; x.fill();
  stageRound(x, X, Y, S, S, 2.5); x.fillStyle = rim; x.fill();
  const g = x.createLinearGradient(0, Y + 1, 0, Y + S - 1); g.addColorStop(0, top); g.addColorStop(1, bot); stageRound(x, X + 1, Y + 1, S - 2, S - 2, 1.8); x.fillStyle = g; x.fill();
  x.fillStyle = 'rgba(255,255,255,0.14)'; x.fillRect(X + 2, Y + 1.3, S - 4, 0.6); // a little top shine
  x.restore();
  Font.drawC(x, STAGE_CH[k] || '?', X + 4.9, (typeof midY === 'function' ? midY(Y, S, 9) : Y - 1) - 0.8, '#ffffff', '#10121e', 9);
  const n = Math.min(3, Math.abs(v)), cx = X + S - 2.7, h = 2.2, w = 3.4, gap = 3.2, y0 = Y + S / 2 - (n - 1) * gap / 2;
  x.save(); x.lineJoin = 'round';
  for (let i = 0; i < n; i++) { const cy = y0 + i * gap; x.beginPath();
    if (up) { x.moveTo(cx, cy - h / 2); x.lineTo(cx + w / 2, cy + h / 2); x.lineTo(cx - w / 2, cy + h / 2); } else { x.moveTo(cx - w / 2, cy - h / 2); x.lineTo(cx + w / 2, cy - h / 2); x.lineTo(cx, cy + h / 2); }
    x.closePath(); x.lineWidth = 1; x.strokeStyle = '#10121e'; x.stroke(); x.fillStyle = ar; x.fill(); }
  x.restore();
}
drawStageIcons = function (x, b, X, Y, max = 4) {
  let n = 0; for (const k of ['atk', 'def', 'spa', 'spd', 'spe']) { const v = b.stages && b.stages[k]; if (!v || n >= max) continue; drawStageTile(x, k, v, X, Y); X += ICON_SZ + 2; n++; }
  return X;
};
