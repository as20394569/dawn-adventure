import random, collections, sys
W, H = 17, 12   # ice room interior incl. border
def solve(g, start):
    D = [(0,-1),(0,1),(-1,0),(1,0)]
    def move(x, y, dx, dy):
        nx, ny = x+dx, y+dy
        if not (0 <= nx < W and 0 <= ny < H) or g[ny][nx] == 'R': return None
        if g[ny][nx] == 's': return (nx, ny)
        # ice: slide
        while True:
            tx, ty = nx+dx, ny+dy
            if not (0 <= tx < W and 0 <= ty < H) or g[ty][tx] == 'R': return (nx, ny)
            if g[ty][tx] == 's': return (tx, ty)
            nx, ny = tx, ty
    dist = {start: 0}; prev = {start: None}; q = collections.deque([start])
    while q:
        p = q.popleft()
        for dx, dy in D:
            n = move(p[0], p[1], dx, dy)
            if n and n not in dist: dist[n] = dist[p] + 1; prev[n] = p; q.append(n)
    return dist
def make(seed):
    rnd = random.Random(seed)
    g = [['R']*W for _ in range(H)]
    for y in range(1, H-1):
        for x in range(1, W-1): g[y][x] = 'I'
    for _ in range(rnd.randint(12, 18)):
        x, y = rnd.randint(1, W-2), rnd.randint(1, H-2); g[y][x] = 'R'
    for _ in range(rnd.randint(2, 4)):
        x, y = rnd.randint(1, W-2), rnd.randint(1, H-2); g[y][x] = 's'
    sx, gx = W//2, W//2
    g[H-1][sx] = 's'   # entrance (bottom gap)
    g[0][gx] = 's'     # exit (top gap)
    g[1][1] = 's'      # chest alcove corner
    return g
best = None
for seed in range(20000):
    g = make(seed); d = solve(g, (W//2, H-1))
    goal = (W//2, 0); chest = (1, 1)
    if goal in d and chest in d and d[goal] >= 9 and d[chest] >= 7:
        # the exit must not be reachable in a straight line from the entrance column
        score = d[goal] + d[chest]
        if not best or score > best[0]: best = (score, seed, d[goal], d[chest], [''.join(r) for r in g])
        if score >= 22: break
print(best[:4]); print('\n'.join(best[4]))

def traps(g, start):
    d = solve(g, start); bad = [p for p in d if start not in solve(g, p)]; return bad
# search again, keeping only layouts without trap states
best = None
for seed in range(40000):
    g = make(seed); st = (W//2, H-1); d = solve(g, st)
    goal = (W//2, 0); chest = (1, 1)
    if not (goal in d and chest in d and d[goal] >= 9 and d[chest] >= 7): continue
    if traps(g, st): continue
    score = d[goal] + d[chest]
    if not best or score > best[0]: best = (score, seed, d[goal], d[chest], [''.join(r) for r in g])
    if score >= 22: break
print('NO-TRAP', best[:4]); print('\n'.join(best[4]))
