import random, collections
W, H = 11, 8   # room incl. walls; player enters from bottom gap at (5, H-1)
D = [(0,-1),(0,1),(-1,0),(1,0)]
def solve(grid, player, boxes, plates, limit=200000):
    start = (player, tuple(sorted(boxes))); seen = {start: 0}; q = collections.deque([start]); pushes = {start: 0}
    while q:
        s = q.popleft(); (px, py), bx = s
        if set(bx) == set(plates): return seen[s], pushes[s]
        for dx, dy in D:
            nx, ny = px+dx, py+dy
            if not (0 <= nx < W and 0 <= ny < H) or grid[ny][nx] == 'R': continue
            nb = list(bx); push = 0
            if (nx, ny) in bx:
                tx, ty = nx+dx, ny+dy
                if not (0 <= tx < W and 0 <= ty < H) or grid[ty][tx] == 'R' or (tx, ty) in bx or ty >= H-1: continue
                nb[nb.index((nx, ny))] = (tx, ty); push = 1
            ns = ((nx, ny), tuple(sorted(nb)))
            if ns not in seen: seen[ns] = seen[s] + 1; pushes[ns] = pushes[s] + push; q.append(ns)
            if len(seen) > limit: return None
    return None
def make(rnd):
    g = [['R']*W for _ in range(H)]
    for y in range(1, H-1):
        for x in range(1, W-1): g[y][x] = 's'
    g[H-1][5] = 's'
    for _ in range(rnd.randint(4, 8)):
        x, y = rnd.randint(1, W-2), rnd.randint(1, H-3); g[y][x] = 'R'
    free = [(x, y) for y in range(1, H-2) for x in range(2, W-2) if g[y][x] == 's']
    rnd.shuffle(free); boxes = free[:2]; plates = [p for p in free[2:] if p[1] <= 2][:2]
    if len(plates) < 2: return None
    return g, boxes, plates
best = None; rnd = random.Random(7)
for it in range(6000):
    m = make(rnd)
    if not m: continue
    g, boxes, plates = m
    if set(boxes) & set(plates): continue
    r = solve(g, (5, H-1), boxes, plates)
    if not r: continue
    steps, pushes = r
    if pushes >= 8 and (not best or (pushes, steps) > (best[0], best[1])): best = (pushes, steps, [''.join(row) for row in g], boxes, plates)
    if best and best[0] >= 12: break
print(best[0], best[1], best[3], best[4]); print('\n'.join(best[2]))
