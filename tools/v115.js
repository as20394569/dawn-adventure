module.exports = async (g) => {
  g.log(await g.ev(() => { const out = []; for (const k in MAPS) { const M = MAPS[k]; if (M.boss) out.push('BOSS ' + (M.boss.lv || '?') + ' ' + k + ':' + (M.boss.sp || M.boss.id)); for (const b of M.bosses || []) out.push('BOSS ' + b.lv + ' ' + k + ':' + b.sp); }
    for (const k in MAPS) for (const n of MAPS[k].npcs || []) if (n.battle || n.fight || n.boss) out.push('NPCFIGHT ' + k + ':' + JSON.stringify(n.battle || n.fight || n.boss).slice(0, 80));
    return out.join('\n'); }));
  g.log(await g.ev(() => { const out = []; const src = Object.keys(Events).filter(k => /boss|Boss|colossus|Colossus|queen|Queen|lava|victor|shadow|rat|harvest/i.test(k)); return src.join(' '); }));
};
