import collections
rows = ['RRRRRRRRRRR', 'RRRsssssRRR', 'RRRsssssRRR', 'RRRRRsRRRRR', 'RRRRRGRRRRR',
    'RsssssqsssR', 'RsRqssssssR', 'RsRsRsssssR', 'RsssssssssR', 'RssssRRsssR', 'RsssssssssR', 'RRRRRsRRRRR', 'RRRRsssRRRR', 'RRRRRsRRRRR']
W, H = len(rows[0]), len(rows)
plates = {(6, 5), (3, 6)}; boxes0 = ((3, 9), (4, 9)); start = (5, 12)
D = {'up': (0, -1), 'down': (0, 1), 'left': (-1, 0), 'right': (1, 0)}
def walk(x, y): return 0 <= x < W and 0 <= y < H and rows[y][x] in 'sq'
s0 = (start, tuple(sorted(boxes0))); prev = {s0: None}; q = collections.deque([s0]); end = None
while q:
    s = q.popleft(); (px, py), bx = s
    if set(bx) == plates: end = s; break
    for k, (dx, dy) in D.items():
        nx, ny = px + dx, py + dy
        if not walk(nx, ny): continue
        nb = list(bx)
        if (nx, ny) in bx:
            tx, ty = nx + dx, ny + dy
            if not walk(tx, ty) or (tx, ty) in bx or not (5 <= ty <= 10): continue
            nb[nb.index((nx, ny))] = (tx, ty)
        ns = ((nx, ny), tuple(sorted(nb)))
        if ns not in prev: prev[ns] = (s, k); q.append(ns)
path = []; c = end
while prev[c]: p, k = prev[c]; path.append(k); c = p
path.reverse(); print(len(path), ','.join(path))
open('route.txt', 'w').write(','.join(path))
