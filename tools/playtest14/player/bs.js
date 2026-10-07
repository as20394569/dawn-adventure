() => { const G = __game, b = G.Game.scene; if (!b || b.constructor.name !== 'Battle') return 'not battle: ' + (b && b.constructor.name);
  const c = b.core, H = c.byId.H; G.step(0);
  const reg = (typeof TouchR !== 'undefined' ? TouchR : []).map(r => ({ x: Math.round(r.x + r.w / 2), y: Math.round(r.y + r.h / 2), s: r.fn.toString().replace(/\s+/g, ' ').slice(0, 60) }));
  const cards = reg.filter(r => /k: 'card'/.test(r.s)).map(r => r.x + ',' + r.y), btns = reg.filter(r => !/k: 'card'/.test(r.s)).map(r => (r.s.match(/k: '(\w+)'|tapK = \{ k: '(\w+)'|(\w+)\(\)/) || [])[0] + '@' + r.x + ',' + r.y);
  const tb = G.UI.stack.find(w => w.lines);
  return ['R' + c.round + ' EN ' + b.energy + ' HP ' + H.res.hp + '/' + H.max.hp + (stkK(H, 'blk15') ? ' 盾' + stkK(H, 'blk15') : '') + ' idle ' + !!b.idle + ' sel ' + b.sel + ' tgt ' + b.tgtMode + ' pile ' + (b.pile || []).length + ' disc ' + (b.disc || []).length,
    'HAND ' + (b.hand || []).map((h, i) => i + ':' + KD.name(h) + '(' + KD.cost(h) + ')').join(' '),
    'FOES ' + c.alive('B').map(u => u.id + ' ' + u.name + ' ' + u.res.hp + '/' + u.max.hp + (stkK(u, 'blk15') ? ' 盾' + stkK(u, 'blk15') : '') + ' [' + u.statuses.map(s => s.id + (s.stacks > 1 ? s.stacks : '')).join(',') + '] → ' + (function () { const I = intentOf14(c, u, c.plan && c.plan[u.id]); return I ? I.k + ' ' + I.t : '-'; })()).join(' | '),
    'CARDS@ ' + cards.join(' '), 'BTN ' + btns.join(' '), tb ? 'TEXT ' + tb.lines.join('') : '', b.note16 ? 'NOTE ' + b.note16.s : ''].filter(Boolean).join('\n'); }
