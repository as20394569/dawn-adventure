module.exports = async (g) => {
  for (const id of ['route', 'town']) {
    const data = await g.ev((id) => {
      const G = __game; G.newGameState('x'); G.Game.st.map = id; G.Game.st.x = 10; G.Game.st.y = 5; const ow = G.startOverworld();
      const m = ow.map; const c = document.createElement('canvas'); c.width = m.w * 16; c.height = m.h * 16; const x = c.getContext('2d');
      const objs = [];
      for (let ty = 0; ty < m.h; ty++) for (let tx = 0; tx < m.w; tx++) { const ch = ow.tileAt(tx, ty); ow.drawTile(x, ch, tx, ty, tx * 16, ty * 16, 0, 0); if (ch === 'T') objs.push([ty, () => x.drawImage(Tiles.tree, tx * 16, ty * 16 - 5)]); }
      for (const { b, img } of m.bimgs) x.drawImage(img, b.x * 16, b.y * 16);
      objs.sort((a, b) => a[0] - b[0]).forEach(o => o[1]());
      for (const n of ow.npcs) x.drawImage(n.frames.down[0], n.x * 16, n.y * 16 - 6);
      for (const e of ow.elites) x.drawImage(e.img.c, e.x * 16 - 4, e.y * 16 - 10);
      for (const i of ow.items) x.drawImage(ITEM_BALL, i.x * 16, i.y * 16);
      return c.toDataURL();
    }, id);
    require('fs').writeFileSync('build/map_' + id + '.png', Buffer.from(data.split(',')[1], 'base64'));
  }
};
