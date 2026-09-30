// render reference sheets for the Codex portrait task: field sprite (down/left/right ×6) + current auto portrait ×4
module.exports = async (g) => {
  const out = await g.ev(() => {
    const LOOKS_USED = ['warden'];
    const UNIQUE = { painter: 'woman2', oldBarr: 'old', ruby: 'girl', kiteKid: 'kid', oldDuke: 'guard' };
    __game.newGameState('小晨'); const R = {};
    const sheet = (frames, port) => { const c = document.createElement('canvas'); c.width = 16 * 6 * 3 + 20 + 32 * 4; c.height = 22 * 6; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#3a4060'; x.fillRect(0, 0, c.width, c.height);
      ['down', 'left', 'right'].forEach((d, i) => x.drawImage(frames[d][0], 0, 0, 16, 22, i * 96, 0, 96, 132)); if (port) { x.fillStyle = '#141a30'; x.fillRect(308, 2, 128, 128); x.drawImage(port, 308, 2, 128, 128); } return c.toDataURL(); };
    for (const k of LOOKS_USED) { const f = npcFrames(k); if (!f || !f.down || f.down[0].width !== 16) { R[k] = 'SKIP'; continue; } R[k] = sheet(f, autoPortrait(f.down[0])); }
    for (const k in UNIQUE) { const f = npcFrames(UNIQUE[k]); R[k] = sheet(f, autoPortrait(f.down[0])); }
    
    return R; });
  const fs = require('fs'); fs.mkdirSync('build/portrait_ref_u', { recursive: true }); let n = 0;
  for (const k in out) { if (out[k] === 'SKIP') { g.log('skip', k); continue; } fs.writeFileSync('build/portrait_ref_u/' + k + '_ref.png', Buffer.from(out[k].split(',')[1], 'base64')); n++; }
  g.log('refs', n);
};
