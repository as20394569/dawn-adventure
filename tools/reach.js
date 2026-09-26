module.exports = async (g) => {
  g.log(await g.ev(() => {
    const out = []; const m = MAPS.route; const H = m.rows.length, Wd = m.rows[0].length;
    const SOL = new Set('TWobSFPRXYxwckhaBQKCpV'.split(''));
    const ch = (x, y) => (x < 0 || y < 0 || x >= Wd || y >= H) ? 'T' : m.rows[y][x];
    const blocked = new Set([...(m.elites || []).map(e => e.x + ',' + e.y), ...(m.items || []).map(e => e.x + ',' + e.y), ...(m.npcs || []).map(e => e.x + ',' + e.y)]);
    const bfs = (sx, sy, ignoreElite) => { const seen = new Set([sx + ',' + sy]); const q = [[sx, sy]]; while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { let nx = x + dx, ny = y + dy; const c = ch(nx, ny); if (c === 'L') { if (dy !== 1) continue; ny += 1; if (SOL.has(ch(nx, ny))) continue; } else if (SOL.has(c)) continue; const k = nx + ',' + ny; if (blocked.has(k) && !(ignoreElite && (m.elites || []).some(e => e.x === nx && e.y === ny))) continue; if (seen.has(k)) continue; seen.add(k); q.push([nx, ny]); } } return seen; };
    const fromBottom = bfs(10, H - 1, true);
    out.push('top reachable from bottom (elites defeated): ' + fromBottom.has('10,0'));
    const fromTop = bfs(10, 0, true); out.push('bottom reachable from top: ' + fromTop.has('10,' + (H - 1)));
    for (const it of [...m.items, ...m.elites, ...m.npcs]) { const adj = [[0, -1], [0, 1], [-1, 0], [1, 0]].some(([dx, dy]) => fromBottom.has((it.x + dx) + ',' + (it.y + dy))); out.push((it.item || it.gold || it.sp || it.id) + ' @' + it.x + ',' + it.y + ' reachable-adjacent: ' + adj); }
    // croc must block: top reachable when croc present?
    const blockedAll = new Set(blocked); const b2 = (() => { const seen = new Set(['10,' + (H - 1)]); const q = [[10, H - 1]]; while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { let nx = x + dx, ny = y + dy; const c = ch(nx, ny); if (c === 'L') { if (dy !== 1) continue; ny += 1; if (SOL.has(ch(nx, ny))) continue; } else if (SOL.has(c)) continue; const k = nx + ',' + ny; if (blockedAll.has(k) || seen.has(k)) continue; seen.add(k); q.push([nx, ny]); } } return seen; })();
    out.push('top reachable with croc present: ' + b2.has('10,0'));
    out.push('rows ' + H + ' widths ' + [...new Set(m.rows.map(r => r.length))].join(','));
    for (const k in MAPS) out.push(k + ' widths ' + [...new Set(MAPS[k].rows.map(r => r.length))].join(','));
    return out.join('\n');
  }));
};
