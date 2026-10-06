import collections, itertools
rows = ['RRRRRRRRRRRRRRRRR', 'RRRRRRsssssRRRRRR', 'RRRRRRsssssRRRRRR', 'RRRRRRRRsRRRRRRRR',
    'RRRRRRRRsRRRRRRRR', 'RsIIIRIRIIIRRIIIR', 'RIIIIIIIIIIRIIIIR', 'RIIIIRIIRIIIIIIIR', 'RsIIIIIIRIIIIIIRR', 'RIIIIIIRIIIIIIIIR', 'RIIIIIIsIIRIIIIIR', 'RIIIRIIIIsIIIIIIR', 'RIIIIIIIIIIIIIRIR', 'RIIIIIIIIIIIIIIIR', 'RIIIsIIIIIIIRIIIR', 'RRRRRRRRsRRRRRRRR',
    'RRRRRRRSssRRRRRRR', 'RRRRRRRsssRRRRRRR']
W, H = len(rows[0]), len(rows)
def solid(x, y, items): return not (0 <= x < W and 0 <= y < H) or rows[y][x] in 'RS' or (x, y) in items
def move(x, y, dx, dy, items):
    nx, ny = x+dx, y+dy
    if solid(nx, ny, items): return None
    if rows[ny][nx] != 'I': return (nx, ny)
    while True:
        tx, ty = nx+dx, ny+dy
        if solid(tx, ty, items): return (nx, ny)
        if rows[ty][tx] != 'I': return (tx, ty)
        nx, ny = tx, ty
def reach(start, items):
    d = {start: 0}; q = collections.deque([start])
    while q:
        p = q.popleft()
        for dx, dy in [(0,-1),(0,1),(-1,0),(1,0)]:
            n = move(p[0], p[1], dx, dy, items)
            if n and n not in d: d[n] = d[p] + 1; q.append(n)
    return d
start = (8, 16); ITEMS = [(1, 5), (4, 14)]
for k in range(len(ITEMS) + 1):
    for got in itertools.combinations(ITEMS, k):
        items = set(ITEMS) - set(got); d = reach(start, items)
        exit_ok = (8, 3) in d
        adj = {it: any((it[0]+dx, it[1]+dy) in d for dx, dy in [(0,-1),(0,1),(-1,0),(1,0)]) for it in items}
        traps = [p for p in d if start not in reach(p, items)]
        print('picked', got, 'exit', exit_ok, d.get((8, 3)), 'items adj', adj, 'traps', len(traps))
