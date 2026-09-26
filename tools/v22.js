module.exports = async (g) => {
  await g.ev(() => { const G = __game; G.newGameState('小晨'); const st = G.Game.st; Object.assign(st.flags, { license: 1, woke: 1, golem: 1 }); st.lv = 20; st.map = 'route'; st.x = 10; st.y = 20; G.startOverworld(); G.Game.fade = 0; G.Game.noEnc = 1; st.hp = G.heroStats().hp; });
  await g.step(5);
  // sprite sheet of all species
  const sheet = await g.ev(() => { const S = __game.SPECIES, keys = Object.keys(S), cols = 8, cw = 80, c = document.createElement('canvas'); c.width = cols * cw; c.height = Math.ceil(keys.length / cols) * 96; const x = c.getContext('2d'); x.fillStyle = '#1a1c2c'; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingEnabled = false;
    keys.forEach((k, i) => { const im = battleSprite(k); x.drawImage(im, (i % cols) * cw + 4, Math.floor(i / cols) * 96, 72, 72); x.fillStyle = '#fff'; x.font = '11px sans-serif'; x.fillText(S[k].n + ' ' + (FAMILIES[S[k].fam] || {}).n, (i % cols) * cw + 2, Math.floor(i / cols) * 96 + 88); }); return c.toDataURL(); });
  require('fs').writeFileSync('build/d_sprites.png', Buffer.from(sheet.split(',')[1], 'base64'));
  // run every monster FX, collect errors & a contact sheet
  await g.ev(() => { const ow = __game.Game.scene; ow.run(ow.battleScript({ sp: 'skeleton', lv: 20, kind: 'wild' })); }); await g.step(260);
  const res = await g.ev(() => { const b = __game.Game.scene, errs = [], ids = ['m_claw','m_bite','m_foxfire','m_quake','m_ghostFire','m_hex','m_poisonSpore','m_buzzShock']; const cols = 4, cw = 176, ch = 128, sc = 0.5 * 2; const c = document.createElement('canvas'); c.width = cols * cw / 2 * 2 / 2 * 1; c.width = cols * 176; c.height = Math.ceil(ids.length / cols) * 212; const cx = c.getContext('2d'); cx.fillStyle = '#000'; cx.fillRect(0, 0, c.width, c.height);
    const off = document.createElement('canvas'); off.width = 176; off.height = 200; const ox = off.getContext('2d');
    const stepFx = () => { for (const p of b.fx) { p.t++; if (p.upd) p.upd(p); else { p.x += p.vx || 0; p.y += p.vy || 0; p.vy = (p.vy || 0) + (p.g || 0); } } b.fx = b.fx.filter(p => p.t < p.life); };
    ids.forEach((id, i) => { try { const mk = () => (MFX[id] ? MFX[id].call(b, b.center(b.F), b.center(b.H), b.F, b.H) : b.playFx(id, b.F, b.H)); let gen = mk(), n = 0; while (!gen.next().done && n < 500) { stepFx(); n++; } b.fx = []; gen = mk(); let k = 0; const tgt = Math.max(3, Math.floor(n * 0.45)); while (k < tgt && !gen.next().done) { stepFx(); k++; } ox.setTransform(1, 0, 0, 1, 0, 0); b.draw(ox); cx.drawImage(off, 0, 0, 176, 200, (i % cols) * 176, Math.floor(i / cols) * 212, 176, 200); cx.fillStyle = '#fff'; cx.font = '10px sans-serif'; cx.fillText((MOVES[id] || {}).n || id, (i % cols) * 176 + 2, Math.floor(i / cols) * 212 + 210); while (!gen.next().done) stepFx(); b.fx = []; b.offF = { x: 0, y: 0 }; b.offH = { x: 0, y: 0 }; } catch (e) { errs.push(id + ': ' + e.message); } });
    return { errs, url: c.toDataURL(), n: ids.length }; });
  require('fs').writeFileSync('build/d_fx_big.png', Buffer.from(res.url.split(',')[1], 'base64'));
  g.log('fx', res.n, JSON.stringify(res.errs));
};
