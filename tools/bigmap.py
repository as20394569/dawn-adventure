#!/usr/bin/env python3
"""第六輪：大地圖產生器。
讀遊戲執行時的地圖（tools/bigmap_dump.json，用 node tools/play.js tools/bigmap_dump.js 產生），
把每張野外地圖往右／往下加寬（原本的座標完全不變），在新的區域畫地形、洞窟入口、地標、營地，
另外產生洞窟地圖。輸出 src/10zzo_v12_r6_maps.js。

規則：
- 只往右、往下加，所以舊的劇情點、NPC、寶箱、存檔座標都不用搬。
- 地圖邊緣的出口跟著移到新的邊緣（路一路延伸過去），別張地圖進來的座標由 JS 端自動改。
- 原本的外框樹牆會開幾個口，讓舊區和新區連起來。
"""
import json, random, sys, os
from collections import deque

SOLID = set('TWobSFPRXYUNxwckhaBQKCpV')
WALKABLE = lambda c: c not in SOLID and c != 'L'


class Grid:
    def __init__(self, rows, seed=1):
        self.g = [list(r) for r in rows]
        self.h = len(rows); self.w = len(rows[0])
        self.ow, self.oh = self.w, self.h
        self.prot = set()
        self.rng = random.Random(seed)

    def pad(self, right=0, bottom=0, fill='T'):
        for r in self.g: r.extend([fill] * right)
        self.w += right
        for _ in range(bottom): self.g.append([fill] * self.w)
        self.h += bottom

    def inb(self, x, y): return 0 <= x < self.w and 0 <= y < self.h
    def get(self, x, y): return self.g[y][x] if self.inb(x, y) else 'T'

    def set(self, x, y, c, force=False):
        if not self.inb(x, y): return
        if (x, y) in self.prot and not force: return
        self.g[y][x] = c

    def protect(self, pts, r=0):
        for (x, y) in pts:
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1): self.prot.add((x + dx, y + dy))

    def rect(self, x0, y0, x1, y1, c, only=None):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if only is None or self.get(x, y) in only: self.set(x, y, c)

    def blob(self, cx, cy, rx, ry, c, jit=0.25, only=None):
        for y in range(int(cy - ry - 1), int(cy + ry + 2)):
            for x in range(int(cx - rx - 1), int(cx + rx + 2)):
                d = ((x - cx) / max(rx, .5)) ** 2 + ((y - cy) / max(ry, .5)) ** 2
                if d <= 1 + self.rng.uniform(-jit, jit) and (only is None or self.get(x, y) in only): self.set(x, y, c)

    def line(self, pts, c, w=1, only=None):
        """axis-aligned polyline (each segment horizontal or vertical); w = thickness to the right / down"""
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            if x0 == x1:
                for y in range(min(y0, y1), max(y0, y1) + 1):
                    for k in range(w):
                        if only is None or self.get(x0 + k, y) in only: self.set(x0 + k, y, c)
            elif y0 == y1:
                for x in range(min(x0, x1), max(x0, x1) + 1):
                    for k in range(w):
                        if only is None or self.get(x, y0 + k) in only: self.set(x, y0 + k, c)
            else:
                raise ValueError('diagonal segment %s' % ((x0, y0, x1, y1),))

    def scatter(self, x0, y0, x1, y1, c, n, only='.,'):
        for _ in range(n * 6):
            if n <= 0: break
            x, y = self.rng.randint(x0, x1), self.rng.randint(y0, y1)
            if self.get(x, y) in only and (x, y) not in self.prot: self.set(x, y, c); n -= 1

    def trees(self, x0, y0, x1, y1, keep=0.0):
        """fill a region with forest; keep = chance a cell stays open (small clearings)"""
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if self.rng.random() >= keep: self.set(x, y, 'T')

    def rows(self): return [''.join(r) for r in self.g]

    def reach(self, start):
        """cells reachable from start (ledges 'L' can only be crossed going down)"""
        seen = {start}; q = deque([start])
        while q:
            x, y = q.popleft()
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not self.inb(nx, ny) or (nx, ny) in seen: continue
                c = self.get(nx, ny)
                if c == 'L':
                    if dy == 1 and self.inb(nx, ny + 1) and WALKABLE(self.get(nx, ny + 1)) and (nx, ny + 1) not in seen:
                        seen.add((nx, ny + 1)); q.append((nx, ny + 1))
                    continue
                if not WALKABLE(c): continue
                seen.add((nx, ny)); q.append((nx, ny))
        return seen


def cave(w, h, seed, entry_x, lord=None, chests=2, gather=1, theme_rocks=0.035, pools=1):
    """a winding cave: a zig-zag chain of rooms from the entrance (bottom) to the lord's room (top),
    two side rooms off the chain for chests; returns rows, lord position, chain rooms, side rooms"""
    rng = random.Random(seed)
    g = [['R'] * w for _ in range(h)]
    def room(cx, cy, rx, ry):
        for y in range(cy - ry, cy + ry + 1):
            for x in range(cx - rx, cx + rx + 1):
                if 1 <= x < w - 1 and 1 <= y < h - 2 and ((x - cx) / (rx + .5)) ** 2 + ((y - cy) / (ry + .5)) ** 2 <= 1 + rng.uniform(-.2, .1): g[y][x] = 's'
    def tunnel(a, b, wide=False):
        (x0, y0), (x1, y1) = a, b
        hfirst = rng.random() < .5
        pts = [(x0, y0), (x1, y0), (x1, y1)] if hfirst else [(x0, y0), (x0, y1), (x1, y1)]
        for (ax, ay), (bx, by) in zip(pts, pts[1:]):
            for x in range(min(ax, bx), max(ax, bx) + 1):
                for y in range(min(ay, by), max(ay, by) + 1):
                    if 1 <= x < w - 1 and 1 <= y < h - 1: g[y][x] = 's'
                    if wide and 1 <= x + 1 < w - 1: g[y][x + 1] = 's'
    n = max(4, (h - 4) // 4)
    cols = [w // 4, 3 * w // 4]
    chain = [(entry_x, h - 4, 2, 1)]
    for i in range(1, n):
        cy = h - 4 - i * (h - 8) // (n - 1)
        if i == n - 1: chain.append((w // 2, max(3, cy), 3, 2)); break
        cx = cols[i % 2] + rng.randint(-1, 1)
        chain.append((cx, cy, rng.randint(2, 3), rng.randint(1, 2)))
    side = []
    for i in (1, n - 2):
        cx, cy = chain[i][:2]
        sx = 3 if cx > w // 2 else w - 4
        side.append((sx, cy + rng.choice((-1, 1)), 2, 1))
    for r in chain + side: room(*r)
    for a, b in zip(chain, chain[1:]): tunnel(a[:2], b[:2], wide=rng.random() < .4)
    for s_, i in zip(side, (1, n - 2)): tunnel(s_[:2], chain[i][:2])
    for y in range(h - 4, h): g[y][entry_x] = 's'
    g[h - 1][entry_x] = 'D'
    for _ in range(pools):
        r = chain[rng.randint(1, len(chain) - 2)]
        for dx in (-1, 0, 1):
            x, y = r[0] + dx, r[1] - r[3]
            if g[y][x] == 's' and g[y - 1][x] == 'R': g[y][x] = 'W'
    for y in range(2, h - 3):
        for x in range(2, w - 2):
            if g[y][x] == 's' and rng.random() < theme_rocks and abs(x - entry_x) > 1:
                if sum(1 for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if g[y + dy][x + dx] == 's') == 4: g[y][x] = 'o'
    rows = [''.join(r) for r in g]
    return rows, chain[-1][:2], chain, side


if __name__ == '__main__':
    print('library only; see tools/bigmap_specs.py')
