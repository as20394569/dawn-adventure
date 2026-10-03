#!/usr/bin/env python3
"""第六輪：每張大地圖的設計（座標都是新地圖的座標；舊地圖的部分座標不變）。
python3 tools/bigmap_specs.py → src/10zzp_v12_r6_maps.js"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from bigmap import Grid, cave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DUMP = json.load(open(os.path.join(ROOT, 'tools/bigmap_dump.json')))
OUT = {}


def base(mid, right, bottom, seed):
    d = DUMP[mid]; g = Grid(d['rows'], seed); g.pad(right, bottom)
    pts = [(n['x'], n['y']) for n in d['npcs']] + [(n['x'], n['y']) for n in d['items']] + [(n['x'], n['y']) for n in (d.get('elites') or [])]
    pts += [(n['x'], n['y']) for n in (d.get('gathers') or [])] + [(t['x'], t['y']) for t in (d.get('triggers') or [])]
    pts += [tuple(map(int, k.split(','))) for k in (d.get('signs') or {})]
    g.protect(pts, 0)
    return d, g


def snap(g, x, y, taken, ok=lambda c: c in '.,#fy:s'):
    """nearest free floor tile to (x, y)"""
    from collections import deque
    q = deque([(x, y)]); seen = {(x, y)}
    while q:
        cx, cy = q.popleft()
        if g.inb(cx, cy) and ok(g.get(cx, cy)) and (cx, cy) not in taken: return cx, cy
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            n = (cx + dx, cy + dy)
            if n not in seen and abs(n[0] - x) + abs(n[1] - y) < 8: seen.add(n); q.append(n)
    return x, y


def finish(mid, d, g, spec):
    taken = set(g.prot)
    for e in spec.get('items', []) + spec.get('gathers', []):
        e['x'], e['y'] = snap(g, e['x'], e['y'], taken); taken.add((e['x'], e['y']))
    C = spec.get('cave')
    if C:
        cg = Grid(C['rows']); ct = {(C['lord']['x'], C['lord']['y'])}
        for e in C['items'] + C['gathers']:
            e['x'], e['y'] = snap(cg, e['x'], e['y'], ct, ok=lambda c: c == 's'); ct.add((e['x'], e['y']))
    for k in spec.get('signs', {}):
        x, y = map(int, k.split(',')); g.set(x, y, 'S', True)
    cd = spec.get('caveDoor')
    if cd: spec['cave']['exit'] = {'x': spec['cave']['ex'], 'y': len(spec['cave']['rows']) - 1, 'to': [mid, cd['x'], cd['y'] + 1]}
    spec.update({'id': mid, 'oldW': d['w'], 'oldH': d['h'], 'w': g.w, 'h': g.h, 'rows': g.rows()})
    # every old entity must still be reachable from the map's main entry
    start = tuple(spec.pop('start'))
    R = g.reach(start)
    lost = [n['id'] for n in d['npcs'] + d['items'] if (n['x'], n['y']) not in R and not any((n['x'] + dx, n['y'] + dy) in R for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))]
    new = [e for e in spec.get('items', []) + spec.get('gathers', []) + spec.get('npcs', []) if not any((e['x'] + dx, e['y'] + dy) in R for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)))]
    if lost: print(mid, 'UNREACHABLE old:', lost)
    if new: print(mid, 'UNREACHABLE new:', [e.get('id') for e in new])
    OUT[mid] = spec


def mkcave(cid, name, w, h, seed, lord, mons, theme=None, bg='ruins', items=(), gath='ore', note=''):
    ex = w // 2
    rows, (lx, ly), rooms, side = cave(w, h, seed, ex)
    its = []
    spots = [r[:2] for r in side] + [r[:2] for r in rooms[1:-1]]
    for i, it in enumerate(items):
        x, y = spots[i % len(spots)]; its.append(dict(it, id=cid + '_c%d' % (i + 1), x=x, y=y))
    gx, gy = rooms[len(rooms) // 2][:2]
    return {'id': cid, 'name': name, 'rows': rows, 'ex': ex, 'theme': theme, 'bg': bg,
            'lord': dict(lord, x=lx, y=ly), 'items': its, 'gathers': [{'id': cid + '_g1', 'x': gx + 1, 'y': gy, 'kind': gath}],
            'zones': [{'y0': 0, 'y1': 99, 'rate': 0.1, 'table': mons}]}


# ============================== 第一幕 ==============================
def route():
    """晨霧道路 22×44 → 36×44：東邊一條小溪（接上原本的河）、溪東是老橡樹和霧之窪地、晨霧洞；溪西是旅人營地；西南角變成野花坡。"""
    d, g = base('route', 14, 0, 101)
    W, H = g.w, g.h
    X0 = 22  # first new column
    # the new strip starts as open grass inside a tree border
    g.rect(X0 - 2, 2, W - 2, H - 3, '.', only='T')
    g.rect(X0, 0, W - 1, 1, 'T'); g.rect(X0, H - 2, W - 1, H - 1, 'T'); g.rect(W - 1, 0, W - 1, H - 1, 'T')
    # keep the old east wall except where we open it
    for y in range(2, H - 2):
        if y not in (4, 16, 17, 29, 36, 37):
            g.set(20, y, 'T'); g.set(21, y, 'T')
    # creek: joins the old river (rows 11-12) and runs south
    g.line([(20, 11), (27, 11)], 'W', 2)
    g.line([(27, 2), (27, 41)], 'W', 3)
    for y in (4, 29): g.line([(27, y), (29, y)], '=')
    g.line([(27, 21), (29, 21)], '=')
    # roads to the east edge: 落日峽谷 (y4) and 廢棄礦坑 (y29)
    g.line([(16, 4), (W - 1, 4)], ':'); g.line([(14, 29), (W - 1, 29)], ':')
    g.line([(28, 4), (28, 4)], '='); g.line([(28, 29), (28, 29)], '=')
    # west of the creek: forest edge, grass, the travellers' camp (y 32-36)
    g.trees(22, 2, 26, 3); g.trees(22, 13, 23, 15)
    for (cx, cy, rx, ry) in [(24, 7, 2, 2), (24, 18, 2, 3), (24, 25, 2, 2), (24, 40, 2, 1.5)]: g.blob(cx, cy, rx, ry, '#', only='.')
    g.rect(22, 32, 26, 36, '.', only='#T')
    g.line([(22, 34), (26, 34)], ':')
    # east of the creek
    g.trees(30, 2, 34, 3)
    # 老橡樹: a clearing with a big old oak (2x2 trees) and flowers
    g.rect(30, 6, 34, 10, '.'); g.rect(31, 7, 32, 8, 'T'); g.scatter(30, 6, 34, 10, 'f', 4, only='.'); g.scatter(30, 6, 34, 10, 'y', 3, only='.')
    # 霧之窪地: you drop in over a ledge from the north, tall grass inside, out by the south path
    g.line([(30, 12), (34, 12)], 'L'); g.rect(30, 13, 34, 13, '.')
    g.blob(32, 16, 2.4, 2, '#', only='.')
    g.rect(30, 19, 30, 19, 'T'); g.rect(34, 19, 34, 19, 'T')
    # cave 晨霧洞: a rocky nook
    g.rect(30, 22, 34, 25, '.'); g.rect(30, 22, 30, 23, 'o'); g.rect(34, 22, 34, 23, 'o'); g.set(31, 22, 'o'); g.set(33, 22, 'o')
    g.blob(32, 35, 2, 3, '#', only='.'); g.blob(32, 27, 1.5, 1, '#', only='.')
    # the hidden pocket in the south-east: a gap in the trees at (33, 38)
    g.rect(30, 38, 34, 41, 'T'); g.rect(31, 39, 33, 40, '.'); g.set(32, 38, '#')
    # 野花坡 (south-west of the old road): the grass patches become a flower slope
    for y in range(35, 42):
        for x in range(2, 9):
            if g.get(x, y) in '.#' and (x + y) % 3 == 0: g.set(x, y, 'f' if (x * y) % 2 else 'y')
    spec = {
        'start': (10, 43),
        'items': [{'id': 'b6r1', 'x': 32, 'y': 9, 'item': 'trainBook'}, {'id': 'b6r2', 'x': 33, 'y': 17, 'item': 'hareFur', 'n': 3},
                  {'id': 'b6r3', 'x': 32, 'y': 40, 'item': 'vitFruit'}, {'id': 'b6r4', 'x': 22, 'y': 20, 'gold': 400}],
        'gathers': [{'id': 'g6r1', 'x': 34, 'y': 33, 'kind': 'herb'}, {'id': 'g6r2', 'x': 23, 'y': 5, 'kind': 'herb'}],
        'signs': {'25,31': '「旅人營地」\n行商莫奇在這裡歇腳。可以休息、買東西、換東西。', '30,20': '「晨霧洞」\n洞裡很潮濕，聽得到拍翅膀的聲音。（建議Lv8以上）'},
        'npcs': [{'id': 'camp6_moki', 'x': 24, 'y': 33, 'dir': 'down', 'look': 'merchant', 'name': '莫奇'}],
        'caveDoor': {'x': 32, 'y': 22},
        'cave': mkcave('cave6_route', '晨霧洞', 20, 20, 11, {'sp': 'glowToad', 'lv': 11}, [['mossBat', 8, 10, 45], ['slime', 8, 9, 20], ['pebble', 8, 10, 20], ['dewSprite', 8, 9, 15]],
                       items=[{'item': 'superPotion', 'n': 2}, {'item': 'luckClover'}], gath='ore'),
        'landmarks': [{'n': '老橡樹', 'x': 32, 'y': 8, 'r': 3}, {'n': '霧之窪地', 'x': 32, 'y': 16, 'r': 3}, {'n': '野花坡', 'x': 5, 'y': 38, 'r': 3}],
        'zones': [{'x0': 22, 'x1': 99, 'y0': 26, 'y1': 99, 'rate': 0.11, 'table': [['mistSnail', 3, 6, 40], ['slime', 4, 6, 20], ['stumpling', 4, 6, 20], ['meadowWolf', 5, 6, 20]]},
                  {'x0': 22, 'x1': 99, 'y0': 11, 'y1': 25, 'rate': 0.11, 'table': [['dewSprite', 7, 9, 35], ['mistSnail', 6, 8, 20], ['fox', 7, 9, 15], ['bee', 7, 9, 15], ['meadowWolf', 7, 9, 15]]},
                  {'x0': 22, 'x1': 99, 'y0': 0, 'y1': 10, 'rate': 0.12, 'table': [['dewSprite', 9, 11, 35], ['thunderBeetle', 9, 11, 20], ['emberSpirit', 9, 11, 20], ['fox', 9, 11, 25]]}],
    }
    finish('route', d, g, spec)


def windHills():
    """風車丘陵 34×30 → 44×42：南邊往下跳一層是牧草坡（柵欄圍著的牧場）；東邊山頭上有三座風車；東南角是鼴鼠穴。"""
    d, g = base('windHills', 10, 12, 202)
    W, H = g.w, g.h
    # new land: open grass inside a tree border
    g.rect(34, 1, W - 2, 28, '.', only='T'); g.rect(1, 30, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 30, 0, H - 1, 'T'); g.rect(34, 0, W - 1, 0, 'T')
    # the old south wall becomes the edge of the upper hill: grass on row 29, a ledge on row 30 (jump down), the road goes on down
    for x in range(2, 33):
        if x not in (21, 22, 23): g.set(x, 29, '.')
    g.line([(1, 30), (W - 2, 30)], 'L')
    g.line([(10, 28), (10, 33)], ':', 2)
    g.rect(21, 29, 23, 31, 'T')
    # the path into 風之丘頂 was blocked by one tree (x21) since v10 — open it
    g.set(21, 15, ':'); g.set(21, 16, ':')
    # east: open the hilltop wall in two places, a path up to the three windmills
    for y in (8, 9, 20, 21): g.set(33, y, '.')
    g.line([(30, 15), (37, 15), (37, 7)], ':')
    g.rect(35, 3, 42, 9, '.'); g.line([(35, 10), (42, 10)], 'F'); g.set(37, 10, ':')
    g.trees(34, 11, 35, 13); g.trees(41, 12, 42, 14)
    for (cx, cy, rx, ry) in [(39, 18, 2.5, 2.5), (36, 24, 2, 2), (41, 26, 1.5, 2)]: g.blob(cx, cy, rx, ry, '#', only='.')
    # south: the pasture (fences top and bottom, open sides), a pond, the mole hole in the south-east corner
    g.line([(4, 33), (17, 33)], 'F'); g.line([(4, 39), (17, 39)], 'F'); g.set(10, 33, ':'); g.set(11, 33, ':')
    g.blob(10, 36, 4, 1.6, '#', only='.'); g.scatter(4, 34, 17, 38, 'y', 5, only='.')
    g.blob(26, 36, 2.5, 1.6, 'W', jit=0.1); g.scatter(20, 32, 32, 40, 'f', 6, only='.')
    g.blob(31, 33, 2, 1.2, '#', only='.'); g.blob(22, 39, 2, 1, '#', only='.')
    g.rect(37, 34, 42, 40, '.'); g.rect(37, 34, 37, 35, 'o'); g.rect(42, 34, 42, 35, 'o'); g.set(38, 34, 'o'); g.set(41, 34, 'o'); g.set(39, 34, 'o'); g.set(40, 33, 'T')
    g.trees(35, 31, 36, 33); g.trees(1, 38, 2, 40)
    # hidden pocket: a gap at the west end of the pasture leads behind the trees
    g.rect(1, 31, 3, 36, 'T'); g.rect(1, 32, 2, 33, '.'); g.set(3, 32, '#')
    spec = {
        'start': (0, 26),
        'items': [{'id': 'b6w1', 'x': 39, 'y': 4, 'item': 'trainBook'}, {'id': 'b6w2', 'x': 1, 'y': 32, 'item': 'powerFruit'},
                  {'id': 'b6w3', 'x': 16, 'y': 37, 'item': 'hareFur', 'n': 3}, {'id': 'b6w4', 'x': 42, 'y': 22, 'gold': 500}],
        'gathers': [{'id': 'g6w1', 'x': 28, 'y': 39, 'kind': 'herb'}, {'id': 'g6w2', 'x': 41, 'y': 8, 'kind': 'herb'}],
        'signs': {'9,32': '「牧草坡」\n風車丘陵的牧場。羊跑出柵欄以後，就沒人敢來了。', '36,38': '「鼴鼠穴」\n丘陵底下的地道。（建議Lv7以上）'},
        'npcs': [{'id': 'mill6_1', 'x': 36, 'y': 5, 'dir': 'down', 'look': 'windmill', 'name': '風車'}, {'id': 'mill6_2', 'x': 39, 'y': 4, 'dir': 'down', 'look': 'windmill', 'name': '風車'},
                 {'id': 'mill6_3', 'x': 42, 'y': 5, 'dir': 'down', 'look': 'windmill', 'name': '風車'}],
        'caveDoor': {'x': 40, 'y': 35},
        'cave': mkcave('cave6_windHills', '鼴鼠穴', 18, 18, 22, {'sp': 'rockPangolin', 'lv': 9}, [['moleDigger', 7, 8, 50], ['hornHare', 6, 7, 25], ['piglet', 6, 7, 25]],
                       items=[{'item': 'superPotion', 'n': 2}, {'item': 'stone', 'n': 4}], gath='ore'),
        'landmarks': [{'n': '三座風車', 'x': 39, 'y': 5, 'r': 3}, {'n': '牧草坡', 'x': 10, 'y': 36, 'r': 4}, {'n': '風之丘頂', 'x': 29, 'y': 10, 'r': 3}],
        'zones': [{'x0': 0, 'x1': 99, 'y0': 30, 'y1': 99, 'rate': 0.1, 'table': [['curlySheep', 5, 7, 40], ['fluffSeed', 5, 6, 20], ['piglet', 5, 6, 20], ['hornHare', 5, 6, 20]]},
                  {'x0': 34, 'x1': 99, 'y0': 0, 'y1': 29, 'rate': 0.1, 'table': [['fluffSeed', 6, 7, 40], ['curlySheep', 6, 7, 20], ['gustSprite', 6, 7, 20], ['strawCrow', 6, 7, 20]]}],
    }
    finish('windHills', d, g, spec)


def jadeCreek():
    """碧溪谷 24×42 → 38×42：東邊多一條從白練瀑布流下來的支流，中段變寬、中間是溪中沙洲（踏板過去）；瀑布旁是水幕洞。"""
    d, g = base('jadeCreek', 14, 0, 303)
    W, H = g.w, g.h
    g.rect(24, 1, W - 2, H - 2, '.', only='T'); g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(24, 0, W - 1, 0, 'T'); g.rect(24, H - 1, W - 1, H - 1, 'T')
    # keep the old east wall (x20-23) except the openings
    for y in range(1, 34):
        if y in (8, 9, 17, 29, 30): g.rect(20, y, 23, y, '.'); continue
        g.rect(22, y, 23, y, 'T')
    g.rect(24, 32, W - 2, 33, 'T')   # the bottom part (碧溪下游) stays its own area
    # 白練瀑布: a pool at the top fed from the cliff, the stream runs down to the south edge of the band
    g.rect(27, 1, 33, 1, 'W'); g.blob(30, 4, 3.5, 2.2, 'W', jit=0.05)
    g.line([(30, 6), (30, 31)], 'W', 2)
    # 溪中沙洲: the stream splits around a sandy island; plank stepping stones lead onto it
    g.blob(30, 21, 5, 3.2, 'W', jit=0.05); g.blob(30, 21, 2.6, 1.6, ':', jit=0.0); g.set(30, 21, '.'); g.set(31, 21, '.')
    for x in range(24, 37):
        if g.get(x, 21) == 'W': g.set(x, 21, '=')
    # bridges: the main road (rows 29-30) and one in the north
    g.line([(14, 29), (W - 1, 29)], ':', 2); g.line([(30, 29), (31, 29)], '=', 2)
    g.line([(30, 12), (31, 12)], '=')
    # cave 水幕洞 beside the falls
    g.rect(34, 2, 36, 5, '.'); g.rect(34, 2, 34, 2, 'o'); g.rect(36, 2, 36, 3, 'o'); g.set(35, 2, 'o')
    for (cx, cy, rx, ry) in [(26, 6, 1.6, 2), (35, 9, 1.6, 2.5), (26, 14, 1.6, 2), (35, 15, 1.4, 1.6), (26, 26, 1.5, 1.6), (35, 26, 1.6, 2)]: g.blob(cx, cy, rx, ry, '#', only='.')
    g.scatter(24, 2, 36, 30, 'f', 6, only='.'); g.scatter(24, 2, 36, 30, 'o', 4, only='.')
    g.trees(24, 10, 25, 11); g.trees(35, 18, 36, 19); g.trees(24, 31, 36, 31)
    # hidden pocket in the north-west of the band, behind the trees
    g.rect(24, 1, 28, 3, 'T'); g.rect(24, 2, 25, 2, '.'); g.set(25, 3, '#')
    # the corner below the old 碧溪下游 wall becomes part of it: a quiet grove by the water
    g.rect(23, 36, 23, 38, '.'); g.trees(24, 34, 36, 34); g.trees(36, 35, 36, 40)
    g.blob(29, 38, 3, 1.6, 'W', jit=0.1); g.scatter(24, 35, 35, 40, 'f', 5, only='.'); g.scatter(24, 35, 35, 40, 'y', 4, only='.'); g.blob(33, 36, 1.5, 1, '#', only='.')
    spec = {
        'start': (W - 1, 29),
        'items': [{'id': 'b6j1', 'x': 30, 'y': 21, 'item': 'dexFruit'}, {'id': 'b6j2', 'x': 24, 'y': 2, 'item': 'trainBook'},
                  {'id': 'b6j3', 'x': 36, 'y': 12, 'item': 'frogSkin', 'n': 3}, {'id': 'b6j4', 'x': 24, 'y': 24, 'gold': 600}, {'id': 'b6j5', 'x': 34, 'y': 39, 'item': 'superPotion', 'n': 2}],
        'gathers': [{'id': 'g6j1', 'x': 33, 'y': 7, 'kind': 'herb'}, {'id': 'g6j2', 'x': 26, 'y': 18, 'kind': 'herb'}, {'id': 'g6j3', 'x': 26, 'y': 39, 'kind': 'herb'}],
        'signs': {'32,8': '「白練瀑布」\n碧溪谷的水，都是從這座瀑布來的。', '33,5': '「水幕洞」\n瀑布旁的洞窟，裡面一直有水聲。（建議Lv10以上）'},
        'caveDoor': {'x': 35, 'y': 3},
        'cave': mkcave('cave6_jadeCreek', '水幕洞', 20, 18, 33, {'sp': 'crystalCrayfish', 'lv': 12}, [['caveNewt', 10, 11, 45], ['creekShrimp', 10, 11, 20], ['mossTurtle', 10, 11, 20], ['streamSnake', 10, 11, 15]],
                       items=[{'item': 'superPotion', 'n': 2}, {'item': 'crystal', 'n': 2}], gath='ore', theme='sewer2'),
        'landmarks': [{'n': '白練瀑布', 'x': 30, 'y': 4, 'r': 3}, {'n': '溪中沙洲', 'x': 30, 'y': 21, 'r': 3}, {'n': '碧溪下游', 'x': 12, 'y': 37, 'r': 3}],
        'zones': [{'x0': 24, 'x1': 99, 'y0': 0, 'y1': 99, 'rate': 0.1, 'table': [['creekShrimp', 9, 11, 35], ['waterStrider', 9, 11, 35], ['mossTurtle', 9, 10, 15], ['creekCroc', 9, 10, 15]]}],
    }
    finish('jadeCreek', d, g, spec)


# ============================== 第二幕 ==============================
def forest():
    """迷霧森林 22×30 → 34×38：東邊兩條路（往晨霧道路、銀月湖畔）中間是千年巨木；東南和南邊是像迷宮的密林，蘑菇圈和樹根洞在裡面。"""
    d, g = base('forest', 12, 8, 404)
    W, H = g.w, g.h
    g.rect(22, 0, W - 1, H - 1, 'T'); g.rect(0, 30, W - 1, H - 1, 'T')
    # the two roads east
    g.line([(17, 3), (W - 1, 3)], ':'); g.line([(17, 11), (W - 1, 11)], ':')
    for x in (21,): g.set(x, 3, ':', True); g.set(x, 11, ':', True)
    # 千年巨木: a clearing between the roads with a 3x3 giant tree
    g.blob(28, 7, 4.5, 2.6, '.', jit=0.05); g.rect(27, 6, 29, 8, 'T'); g.scatter(23, 4, 33, 10, 'y', 5, only='.'); g.scatter(23, 4, 33, 10, 'f', 3, only='.')
    g.line([(26, 4), (26, 5)], '.'); g.line([(30, 9), (30, 10)], '.')
    # the thicket maze east (rows 12-28) and south (rows 29-37)
    g.maze(22, 12, W - 1, 28, loops=0.18)
    g.maze(0, 29, W - 1, H - 1, loops=0.15)
    g.set(21, 15, '.'); g.set(22, 15, '.')            # from the old forest into the east maze
    g.set(25, 28, '.'); g.set(25, 29, '.')            # east maze ↔ south maze
    g.set(5, 28, '.'); g.set(5, 29, '.'); g.set(15, 29, '.')   # 森之深處 ↔ south maze
    # 蘑菇圈: a round clearing in the south maze with a ring of red flowers
    g.blob(16, 33, 2.6, 2.2, '.', jit=0.0); g.blob(16, 33, 1.2, 1.0, '#', jit=0.0)
    for (x, y) in [(14, 31), (18, 31), (13, 33), (19, 33), (14, 35), (18, 35), (16, 31), (16, 35)]: g.set(x, y, 'f')
    # 樹根洞 in the far south-east of the maze
    g.rect(29, 33, 32, 36, '.'); g.rect(29, 33, 29, 33, 'o'); g.rect(31, 33, 32, 33, 'o'); g.set(30, 32, 'T')
    for (cx, cy) in [(27, 15), (31, 21), (23, 25), (3, 33), (9, 35), (25, 33)]: g.blob(cx, cy, 1.2, 0.8, '#', only='.')
    spec = {
        'start': (W - 1, 11),
        'items': [{'id': 'b6f1', 'x': 31, 'y': 13, 'item': 'trainBook'}, {'id': 'b6f2', 'x': 16, 'y': 33, 'item': 'wisdomFruit'},
                  {'id': 'b6f3', 'x': 1, 'y': 36, 'item': 'leaf', 'n': 3}, {'id': 'b6f4', 'x': 23, 'y': 27, 'gold': 800}, {'id': 'b6f5', 'x': 31, 'y': 9, 'item': 'superPotion', 'n': 2}],
        'gathers': [{'id': 'g6f1', 'x': 24, 'y': 6, 'kind': 'herb'}, {'id': 'g6f2', 'x': 13, 'y': 31, 'kind': 'shroom'}],
        'signs': {'26,10': '「千年巨木」\n迷霧森林最老的樹。樹根底下據說有一個洞。', '28,36': '「樹根洞」\n樹根纏成的洞窟。（建議Lv13以上）'},
        'caveDoor': {'x': 30, 'y': 33},
        'cave': mkcave('cave6_forest', '樹根洞', 20, 20, 44, {'sp': 'rootSpider', 'lv': 15}, [['rootGrub', 13, 14, 45], ['vineSnake', 13, 14, 20], ['thornMush', 12, 13, 20], ['stumpling', 12, 13, 15]],
                       items=[{'item': 'superPotion', 'n': 2}, {'item': 'rotWood', 'n': 3}], gath='shroom', theme='sewer2'),
        'landmarks': [{'n': '千年巨木', 'x': 28, 'y': 7, 'r': 3}, {'n': '蘑菇圈', 'x': 16, 'y': 33, 'r': 2}, {'n': '森之深處', 'x': 10, 'y': 25, 'r': 3}],
        'zones': [{'x0': 22, 'x1': 99, 'y0': 0, 'y1': 11, 'rate': 0.12, 'table': [['vineSnake', 12, 14, 35], ['fireflySwarm', 12, 14, 30], ['leafFox', 12, 14, 20], ['nightBird', 12, 13, 15]]},
                  {'x0': 22, 'x1': 99, 'y0': 12, 'y1': 28, 'rate': 0.12, 'table': [['fireflySwarm', 12, 14, 35], ['vineSnake', 12, 14, 25], ['thornMush', 12, 13, 20], ['stumpling', 12, 13, 20]]},
                  {'x0': 0, 'x1': 99, 'y0': 29, 'y1': 99, 'rate': 0.12, 'table': [['vineSnake', 13, 14, 35], ['fireflySwarm', 13, 14, 35], ['leafFox', 13, 14, 30]]}],
    }
    finish('forest', d, g, spec)


def canyon():
    """落日峽谷 32×28 → 42×38：南邊是被紅岩壁切開的幾條小峽谷，乾河床從西南一路彎到東北；東邊是岩柱林，東南角是風蝕洞；峽谷商隊在河床邊紮營。"""
    d, g = base('canyon', 10, 10, 505)
    W, H = g.w, g.h
    g.rect(32, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 28, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 28, 0, H - 1, 'T'); g.rect(32, 0, W - 1, 0, 'T')
    # openings in the old walls
    for (x, y) in [(5, 27), (18, 27), (26, 27), (31, 6), (31, 20), (31, 21)]: g.set(x, y, '.')
    # 乾河床: a 2-wide dry bed winding from the south-west, along the bottom, then up the east band
    g.line([(5, 28), (5, 31), (14, 31), (14, 34), (27, 34), (27, 30), (36, 30), (36, 14), (34, 14), (34, 3)], ':', 2)
    # the little red canyons: rock walls (trees in the canyon palette) with gaps
    for (y, gaps) in [(29, (2, 3, 9, 10, 20, 21)), (33, (3, 4, 22, 23, 31, 32)), (36, ())]:
        for x in range(1, 32):
            if x not in gaps and g.get(x, y) == '.': g.set(x, y, 'T')
    g.line([(17, 30), (17, 32)], 'T'); g.line([(24, 35), (24, 36)], 'T'); g.line([(8, 34), (8, 35)], 'T')
    # 岩柱林: stone pillars standing in the sand of the east band
    g.pillars(32, 2, 40, 12, 'T', 9); g.pillars(38, 15, 40, 26, 'o', 4)
    # a cliff in the east band: drop down from the pillar forest to the river bed
    g.line([(38, 13), (40, 13)], 'L')
    for (cx, cy, rx, ry) in [(33, 18, 1.4, 2.5), (39, 21, 1.4, 2), (11, 30, 2, 0.8), (20, 35, 2.5, 0.8), (30, 31, 1.5, 0.8)]: g.blob(cx, cy, rx, ry, '#', only='.')
    # 風蝕洞 in the south-east corner
    g.rect(37, 32, 40, 36, '.'); g.rect(37, 32, 37, 33, 'o'); g.set(38, 32, 'o'); g.rect(40, 32, 40, 33, 'o'); g.set(39, 31, 'T')
    # camp of the canyon caravan
    g.rect(2, 30, 4, 32, '.'); g.set(9, 30, 'b')
    spec = {
        'start': (0, 24),
        'items': [{'id': 'b6c1', 'x': 40, 'y': 2, 'item': 'trainBook'}, {'id': 'b6c2', 'x': 1, 'y': 35, 'item': 'agiFruit'},
                  {'id': 'b6c3', 'x': 40, 'y': 26, 'item': 'sandCrystal', 'n': 3}, {'id': 'b6c4', 'x': 30, 'y': 35, 'gold': 900}],
        'gathers': [{'id': 'g6c1', 'x': 33, 'y': 9, 'kind': 'ore'}, {'id': 'g6c2', 'x': 18, 'y': 35, 'kind': 'herb'}],
        'signs': {'6,30': '「峽谷商隊營地」\n商隊長卡爾的帳篷。可以休息、買東西、換東西。', '36,34': '「風蝕洞」\n風把砂岩吹出來的洞。（建議Lv14以上）', '33,12': '「岩柱林」\n一根根紅色的石柱，像樹一樣站在沙地上。'},
        'npcs': [{'id': 'camp6_karl', 'x': 3, 'y': 31, 'dir': 'right', 'look': 'traveler', 'name': '卡爾'}],
        'caveDoor': {'x': 39, 'y': 33},
        'cave': mkcave('cave6_canyon', '風蝕洞', 20, 18, 55, {'sp': 'sandGargoyle', 'lv': 16}, [['sandstoneImp', 14, 15, 45], ['sandScorpion', 13, 15, 20], ['dustDevil', 13, 15, 20], ['spineArmadillo', 14, 15, 15]],
                       items=[{'item': 'superPotion', 'n': 2}, {'item': 'sandCrystal', 'n': 3}], gath='ore', theme='tower'),
        'landmarks': [{'n': '岩柱林', 'x': 36, 'y': 7, 'r': 3}, {'n': '乾河床', 'x': 20, 'y': 34, 'r': 3}, {'n': '赤岩祕谷', 'x': 26, 'y': 12, 'r': 3}],
        'zones': [{'x0': 32, 'x1': 99, 'y0': 0, 'y1': 27, 'rate': 0.11, 'table': [['canyonLizard', 13, 15, 35], ['spineArmadillo', 13, 15, 30], ['harpy', 13, 15, 20], ['dustDevil', 13, 15, 15]]},
                  {'x0': 0, 'x1': 99, 'y0': 28, 'y1': 99, 'rate': 0.11, 'table': [['canyonLizard', 12, 14, 35], ['spineArmadillo', 12, 14, 30], ['sandScorpion', 12, 13, 20], ['cactling', 12, 13, 15]]}],
    }
    finish('canyon', d, g, spec)


def lake():
    """銀月湖畔 32×26 → 42×36：南邊多一個湖灣和舊碼頭（往幽光沼澤的路也從這裡往南），東邊是蘆葦蕩，蘆葦深處有月光洞。"""
    d, g = base('lake', 10, 10, 606)
    W, H = g.w, g.h
    g.rect(32, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 26, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 26, 0, H - 1, 'T'); g.rect(32, 0, W - 1, 0, 'T')
    # the road to the swamp keeps going south (x16-17) to the new bottom edge
    g.line([(16, 25), (16, H - 1)], ':', 2)
    for (x, y) in [(5, 25), (6, 25), (26, 25), (31, 8), (31, 18), (31, 19)]: g.set(x, y, '.')
    # 南灣 and the old pier
    g.blob(8, 31, 6, 3.2, 'W', jit=0.08); g.line([(8, 27), (8, 30)], '='); g.line([(9, 27), (9, 27)], '.')
    g.blob(27, 31, 4, 2.5, 'W', jit=0.1)
    g.rect(1, 26, 4, 27, 'T'); g.rect(13, 26, 14, 27, 'T'); g.rect(20, 34, 23, 34, 'T')
    # 蘆葦蕩: tall reeds (tall grass) around pools in the east band
    g.blob(36, 6, 3, 2.5, 'W', jit=0.15); g.blob(38, 15, 2, 3, 'W', jit=0.15)
    g.blob(35, 10, 3.2, 2.2, '#', only='.'); g.blob(39, 9, 2, 3, '#', only='.'); g.blob(34, 17, 2, 3, '#', only='.'); g.blob(39, 22, 2.2, 2.5, '#', only='.')
    # 月光洞 in the far east
    g.rect(36, 26, 40, 29, '.'); g.rect(36, 26, 36, 27, 'o'); g.rect(40, 26, 40, 27, 'o'); g.set(37, 26, 'o'); g.set(39, 26, 'o')
    g.blob(34, 30, 1.6, 1.2, '#', only='.'); g.blob(20, 30, 2, 1.2, '#', only='.'); g.scatter(1, 27, 40, 34, 'f', 5, only='.'); g.scatter(32, 1, 40, 25, 'y', 4, only='.')
    spec = {
        'start': (0, 12),
        'items': [{'id': 'b6l1', 'x': 8, 'y': 30, 'item': 'vitFruit'}, {'id': 'b6l2', 'x': 40, 'y': 2, 'item': 'trainBook'},
                  {'id': 'b6l3', 'x': 40, 'y': 17, 'item': 'moonDew', 'n': 3}, {'id': 'b6l4', 'x': 30, 'y': 34, 'gold': 1200}],
        'gathers': [{'id': 'g6l1', 'x': 33, 'y': 13, 'kind': 'herb'}, {'id': 'g6l2', 'x': 2, 'y': 33, 'kind': 'mana'}],
        'signs': {'10,28': '「舊碼頭」\n以前往湖心小島的渡船，就是從這裡出發的。', '35,29': '「月光洞」\n蘆葦深處的洞窟。洞裡會發光。（建議Lv17以上）'},
        'caveDoor': {'x': 38, 'y': 27},
        'cave': mkcave('cave6_lake', '月光洞', 20, 20, 66, {'sp': 'moonJelly', 'lv': 20}, [['moonMoss', 17, 19, 45], ['moonSprite', 17, 18, 20], ['duskMoth', 17, 18, 20], ['lakeClam', 17, 18, 15]],
                       items=[{'item': 'superPotion', 'n': 3}, {'item': 'moonDew', 'n': 3}], gath='mana', theme='ice'),
        'landmarks': [{'n': '蘆葦蕩', 'x': 36, 'y': 11, 'r': 3}, {'n': '舊碼頭', 'x': 8, 'y': 28, 'r': 2}, {'n': '湖心小島', 'x': 12, 'y': 9, 'r': 2}, {'n': '湖畔東岸', 'x': 26, 'y': 18, 'r': 3}],
        'zones': [{'x0': 32, 'x1': 99, 'y0': 0, 'y1': 99, 'rate': 0.12, 'table': [['reedHeron', 16, 18, 35], ['lakeClam', 16, 18, 25], ['lizardman', 16, 18, 20], ['reedCrab', 16, 17, 20]]},
                  {'x0': 0, 'x1': 31, 'y0': 26, 'y1': 99, 'rate': 0.12, 'table': [['lakeClam', 16, 18, 35], ['reedHeron', 16, 18, 25], ['moonSprite', 16, 17, 20], ['reedCrab', 16, 17, 20]]}],
    }
    finish('lake', d, g, spec)


def swamp():
    """幽光沼澤 32×26 → 42×36：南邊是一大片沼地，只能走浮木小徑；東邊是枯樹林，林子盡頭是沼底洞。"""
    d, g = base('swamp', 10, 10, 707)
    W, H = g.w, g.h
    g.rect(32, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 26, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 26, 0, H - 1, 'T'); g.rect(32, 0, W - 1, 0, 'T')
    for (x, y) in [(9, 25), (19, 25), (31, 6), (31, 7), (31, 19)]: g.set(x, y, '.')
    # the southern bog: water everywhere, a winding floating-log path (planks)
    g.rect(1, 27, 30, 34, 'W')
    path = [(9, 26), (9, 29), (4, 29), (4, 32), (14, 32), (14, 28), (22, 28), (22, 31), (28, 31), (28, 33), (35, 33)]
    g.line(path, '=')
    g.line([(19, 26), (19, 28)], '=')
    for (cx, cy) in [(4, 34), (17, 30), (25, 33), (12, 34)]: g.blob(cx, cy, 1.4, 0.8, '.', jit=0.0)
    g.set(4, 34, '#'); g.set(17, 30, '#')
    g.set(4, 33, '='); g.line([(15, 30), (16, 30)], '='); g.set(25, 32, '=')
    # 枯樹林: the east band thick with dead trees (the swamp palette draws them dark)
    g.pillars(32, 2, 40, 24, 'T', 22); g.pillars(32, 2, 40, 24, 'o', 6)
    for (cx, cy, rx, ry) in [(35, 6, 1.6, 1.6), (38, 13, 1.8, 2), (34, 20, 1.6, 1.6)]: g.blob(cx, cy, rx, ry, '#', only='.')
    # 沼底洞 in the south-east, at the end of the log path
    g.rect(32, 27, 40, 34, '.'); g.rect(36, 28, 40, 29, 'T'); g.set(37, 30, 'o'); g.set(39, 30, 'o'); g.rect(36, 30, 36, 30, 'o'); g.rect(40, 30, 40, 30, 'o')
    g.blob(34, 30, 1.2, 1.2, '#', only='.')
    spec = {
        'start': (16, 0),
        'items': [{'id': 'b6s1', 'x': 4, 'y': 34, 'item': 'wisdomFruit'}, {'id': 'b6s2', 'x': 40, 'y': 2, 'item': 'trainBook'},
                  {'id': 'b6s3', 'x': 17, 'y': 30, 'item': 'bogMoss', 'n': 3}, {'id': 'b6s4', 'x': 33, 'y': 24, 'gold': 1400}],
        'gathers': [{'id': 'g6s1', 'x': 40, 'y': 9, 'kind': 'shroom'}, {'id': 'g6s2', 'x': 25, 'y': 33, 'kind': 'shroom'}],
        'signs': {'10,26': '「浮木小徑」\n沼地上只有這條浮木能走。小心腳下。', '35,31': '「沼底洞」\n泥水一直往洞裡流。（建議Lv20以上）'},
        'caveDoor': {'x': 38, 'y': 30},
        'cave': mkcave('cave6_swamp', '沼底洞', 20, 20, 77, {'sp': 'mireEel', 'lv': 23}, [['rotRoot', 20, 22, 45], ['bogLeech', 20, 21, 20], ['mudSlug', 20, 21, 20], ['bogToad', 20, 21, 15]],
                       items=[{'item': 'superPotion', 'n': 3}, {'item': 'rotWood', 'n': 3}], gath='shroom', theme='sewer2'),
        'landmarks': [{'n': '枯樹林', 'x': 36, 'y': 12, 'r': 4}, {'n': '浮木小徑', 'x': 14, 'y': 31, 'r': 3}, {'n': '螢光沼地', 'x': 26, 'y': 8, 'r': 3}],
        'zones': [{'x0': 32, 'x1': 99, 'y0': 0, 'y1': 99, 'rate': 0.12, 'table': [['mosquitoSwarm', 19, 21, 35], ['mudSlug', 19, 21, 25], ['marshWisp', 19, 21, 20], ['rotTreant', 19, 21, 20]]},
                  {'x0': 0, 'x1': 31, 'y0': 26, 'y1': 99, 'rate': 0.12, 'table': [['mudSlug', 20, 22, 35], ['mosquitoSwarm', 20, 22, 35], ['bogToad', 20, 21, 30]]}],
    }
    finish('swamp', d, g, spec)


# ============================== 第三幕 ==============================
def maplePass():
    """楓紅關道 34×34 → 44×44：東邊是一層一層往下跳的楓林台地，溪谷上掛著楓林吊橋，台地底下是舊隧道；南邊山腳有獵人小屋。"""
    d, g = base('maplePass', 10, 10, 808)
    W, H = g.w, g.h
    g.rect(34, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 34, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 34, 0, H - 1, 'T'); g.rect(34, 0, W - 1, 0, 'T')
    for (x, y) in [(33, 7), (33, 8), (33, 20), (12, 33), (13, 33), (27, 33)]: g.set(x, y, '.')
    # terraces: ledges stepping down to the south in the east band
    for y in (10, 17, 24): g.line([(34, y), (W - 2, y)], 'L')
    for y in (10, 17, 24): g.set(42, y, ':')     # a steep path up at the east end of each ledge
    g.line([(42, 2), (42, 26)], ':'); g.line([(42, 30), (42, 32)], ':')
    # the gorge and the long rope bridge (楓林吊橋)
    g.rect(34, 27, 42, 29, 'W'); g.line([(37, 27), (37, 29)], '=')
    g.rect(1, 37, 31, 38, 'W'); g.line([(12, 37), (12, 38)], '=', 2); g.line([(25, 37), (25, 38)], '=')
    g.line([(12, 33), (12, 36)], ':', 2)
    for (cx, cy, rx, ry) in [(37, 5, 2, 2), (39, 13, 2.2, 1.6), (36, 20, 2, 1.8), (40, 31, 1.4, 1.4), (6, 35, 2.5, 0.8), (20, 41, 3, 0.8), (31, 41, 2, 0.8)]: g.blob(cx, cy, rx, ry, '#', only='.')
    g.scatter(34, 1, 42, 33, 'f', 7, only='.'); g.scatter(1, 34, 42, 42, 'f', 6, only='.')
    g.pillars(34, 2, 41, 9, 'T', 4); g.pillars(34, 18, 41, 23, 'T', 3)
    # 舊隧道 at the foot of the terraces
    g.rect(36, 31, 40, 33, '.'); g.rect(36, 31, 36, 32, 'o'); g.rect(40, 31, 40, 32, 'o'); g.set(37, 31, 'o'); g.set(39, 31, 'o'); g.set(38, 30, 'T')
    # the hunter's hut (camp) south of the river
    g.line([(3, 40), (8, 40)], 'F'); g.rect(3, 41, 8, 42, '.')
    spec = {
        'start': (11, 0),
        'items': [{'id': 'b6m1', 'x': 41, 'y': 2, 'item': 'trainBook'}, {'id': 'b6m2', 'x': 35, 'y': 16, 'item': 'powerFruit'},
                  {'id': 'b6m3', 'x': 1, 'y': 35, 'item': 'stagHorn', 'n': 3}, {'id': 'b6m4', 'x': 40, 'y': 42, 'gold': 1500}],
        'gathers': [{'id': 'g6m1', 'x': 35, 'y': 4, 'kind': 'herb'}, {'id': 'g6m2', 'x': 18, 'y': 40, 'kind': 'herb'}],
        'signs': {'2,41': '「獵人小屋」\n獵人蓋文的小屋。可以休息、買東西、換東西。', '35,33': '「舊隧道」\n以前的關道隧道，塌了一半。（建議Lv19以上）', '36,26': '「楓林吊橋」\n小心，走的時候會晃。'},
        'npcs': [{'id': 'camp6_gavin', 'x': 5, 'y': 41, 'dir': 'down', 'look': 'man', 'name': '蓋文'}],
        'caveDoor': {'x': 38, 'y': 32},
        'cave': mkcave('cave6_maplePass', '舊隧道', 20, 20, 88, {'sp': 'rockBeetle', 'lv': 22}, [['wallGecko', 19, 21, 45], ['barkBeetle', 19, 20, 20], ['mountainApe', 19, 20, 20], ['crimsonStag', 19, 20, 15]],
                       items=[{'item': 'superPotion', 'n': 3}, {'item': 'beetleHorn', 'n': 2}], gath='ore'),
        'landmarks': [{'n': '楓林吊橋', 'x': 37, 'y': 28, 'r': 2}, {'n': '燒毀的驛站', 'x': 11, 'y': 23, 'r': 3}, {'n': '紅葉谷', 'x': 28, 'y': 15, 'r': 3}],
        'zones': [{'x0': 34, 'x1': 99, 'y0': 0, 'y1': 99, 'rate': 0.1, 'table': [['mountainApe', 18, 20, 35], ['mapleButterfly', 18, 20, 30], ['mapleSprite', 18, 20, 20], ['crimsonStag', 18, 20, 15]]},
                  {'x0': 0, 'x1': 33, 'y0': 34, 'y1': 99, 'rate': 0.1, 'table': [['mapleButterfly', 17, 19, 35], ['mountainApe', 17, 19, 30], ['barkBeetle', 17, 18, 35]]}],
    }
    finish('maplePass', d, g, spec)


def oldField():
    """古戰場 34×34 → 44×44：南邊是倒塌的城牆（斷牆）和一條舊壕溝，壕溝裡有地下壕道的入口；東邊是插滿斷劍的荒地。"""
    d, g = base('oldField', 10, 10, 909)
    W, H = g.w, g.h
    g.rect(34, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 34, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 34, 0, H - 1, 'T'); g.rect(34, 0, W - 1, 0, 'T')
    # the road south to 楓紅關道 continues to the new bottom edge
    g.line([(11, 33), (11, H - 1)], ':', 2)
    for (x, y) in [(5, 33), (20, 33), (28, 33), (33, 6), (33, 24), (33, 25)]: g.set(x, y, '.')
    # 斷牆: broken castle wall segments across the south
    for (x0, x1) in [(2, 7), (14, 17), (21, 27), (31, 36)]: g.line([(x0, 36), (x1, 36)], 'R')
    g.line([(39, 34), (39, 38)], 'R')
    # 舊壕溝: a sunken trench — jump in from the north, walk out at the east end
    g.line([(2, 39), (36, 39)], 'L'); g.rect(2, 40, 37, 41, '.'); g.rect(2, 42, 37, 42, 'T'); g.line([(37, 39), (37, 41)], ':'); g.set(38, 40, ':'); g.set(38, 39, ':')
    g.line([(11, 39), (12, 39)], ':')
    # the east waste: broken swords (rocks) and graves
    g.pillars(34, 2, 41, 30, 'o', 10); g.pillars(34, 2, 41, 30, 'T', 5)
    for (cx, cy, rx, ry) in [(37, 6, 2, 2), (40, 15, 1.6, 2.5), (36, 22, 2, 2), (40, 30, 1.6, 1.6), (6, 38, 2, 0.6), (24, 38, 2.5, 0.6), (30, 35, 2, 0.6)]: g.blob(cx, cy, rx, ry, '#', only='.')
    # 地下壕道 in the trench
    g.set(24, 40, '.'); g.rect(23, 39, 25, 39, 'o'); g.set(24, 39, '.')
    g.line([(11, 39), (11, H - 1)], ':', 2)
    spec = {
        'start': (11, 0),
        'items': [{'id': 'b6o1', 'x': 41, 'y': 2, 'item': 'trainBook'}, {'id': 'b6o2', 'x': 3, 'y': 41, 'item': 'vitFruit'},
                  {'id': 'b6o3', 'x': 41, 'y': 34, 'item': 'boneShard', 'n': 3}, {'id': 'b6o4', 'x': 36, 'y': 41, 'gold': 1800}],
        'gathers': [{'id': 'g6o1', 'x': 37, 'y': 12, 'kind': 'ore'}, {'id': 'g6o2', 'x': 18, 'y': 35, 'kind': 'herb'}],
        'signs': {'13,35': '「斷牆」\n五百年前的城牆，只剩下這幾段。', '22,38': '「地下壕道」\n壕溝底下挖出來的地道。（建議Lv22以上）'},
        'caveDoor': {'x': 24, 'y': 39},
        'cave': mkcave('cave6_oldField', '地下壕道', 22, 20, 99, {'sp': 'ramGhost', 'lv': 25}, [['rustSoldier', 22, 24, 45], ['fallenSoldier', 21, 23, 20], ['ghoul', 22, 23, 20], ['bladeGhost', 22, 23, 15]],
                       items=[{'item': 'superPotion', 'n': 3}, {'item': 'rustScrap', 'n': 3}], gath='ore', theme='fort'),
        'landmarks': [{'n': '斷牆', 'x': 16, 'y': 36, 'r': 3}, {'n': '舊壕溝', 'x': 20, 'y': 40, 'r': 2}, {'n': '英靈之丘', 'x': 28, 'y': 16, 'r': 3}],
        'zones': [{'x0': 34, 'x1': 99, 'y0': 0, 'y1': 99, 'rate': 0.1, 'table': [['bladeGhost', 21, 23, 35], ['ghoul', 21, 23, 30], ['battleWisp', 21, 23, 20], ['carrionVulture', 21, 23, 15]]},
                  {'x0': 0, 'x1': 33, 'y0': 34, 'y1': 99, 'rate': 0.1, 'table': [['ghoul', 20, 22, 35], ['bladeGhost', 20, 22, 30], ['fallenSoldier', 20, 21, 35]]}],
    }
    finish('oldField', d, g, spec)


# ============================== 第四幕 ==============================
def northRoad():
    """北方街道 32×40 → 42×50：東邊多一條林間小路，路邊是廢棄哨站；三條路在南邊的三岔路口會合；林子最深處藏著黑羽的藏身洞。"""
    d, g = base('northRoad', 10, 10, 1010)
    W, H = g.w, g.h
    g.rect(32, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 40, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 40, 0, H - 1, 'T'); g.rect(32, 0, W - 1, 0, 'T')
    g.line([(10, 39), (10, H - 1)], ':', 2)
    for (x, y) in [(31, 8), (31, 25), (31, 26), (22, 39), (23, 39)]: g.set(x, y, '.')
    # the east forest: solid trees with the road and clearings carved out
    g.trees(32, 1, 40, 48); g.trees(1, 40, 31, 48)
    g.line([(31, 8), (35, 8), (35, 44)], ':', 2); g.line([(31, 25), (35, 25)], ':')
    g.blob(38, 4, 2.4, 2.6, '.', jit=0.1); g.line([(37, 6), (37, 8)], '.')
    # 廢棄哨站: a ruined square of walls beside the road
    g.rect(37, 13, 40, 21, '.'); g.line([(37, 14), (40, 14)], 'R'); g.line([(37, 20), (40, 20)], 'R'); g.line([(40, 14), (40, 20)], 'R'); g.line([(37, 14), (37, 15)], 'R'); g.line([(37, 19), (37, 20)], 'R')
    # 黑羽的藏身洞: a narrow trail into the trees
    g.line([(37, 31), (39, 31)], '.'); g.rect(38, 29, 40, 29, 'o'); g.set(38, 30, 'o'); g.set(40, 30, 'o'); g.set(39, 30, '.')
    # 三岔路口: the three roads meet in the south
    g.line([(10, 40), (10, H - 1)], ':', 2); g.line([(12, 44), (35, 44)], ':', 2); g.line([(22, 39), (22, 43)], ':', 2)
    g.blob(4, 46, 3, 1.6, '.', jit=0.1); g.line([(7, 45), (9, 45)], '.')
    g.blob(38, 45, 2.4, 2.6, '.', jit=0.1); g.line([(36, 44), (36, 45)], '.')
    g.blob(16, 41, 3, 1, '.', jit=0.1); g.line([(16, 42), (16, 43)], '.'); g.blob(28, 47, 3, 1, '.', jit=0.1); g.set(27, 46, '.')
    for (cx, cy, rx, ry) in [(38, 4, 1.4, 1.4), (38, 17, 1, 1.4), (4, 46, 1.6, 0.8), (16, 41, 2, 0.6), (38, 46, 1.2, 1.2)]: g.blob(cx, cy, rx, ry, '#', only='.')
    spec = {
        'start': (10, 0),
        'items': [{'id': 'b6n1', 'x': 39, 'y': 17, 'item': 'trainBook'}, {'id': 'b6n2', 'x': 2, 'y': 47, 'item': 'agiFruit'},
                  {'id': 'b6n3', 'x': 39, 'y': 3, 'item': 'banditCloth', 'n': 3}, {'id': 'b6n4', 'x': 39, 'y': 47, 'gold': 2200}],
        'gathers': [{'id': 'g6n1', 'x': 39, 'y': 16, 'kind': 'ore'}, {'id': 'g6n2', 'x': 17, 'y': 41, 'kind': 'herb'}],
        'signs': {'21,45': '「三岔路口」\n↑ 王都　↗ 北方林道　↓ 古戰場', '36,17': '「廢棄哨站」\n以前守北方街道的哨站。現在只剩牆。'},
        'caveDoor': {'x': 39, 'y': 30},
        'cave': mkcave('cave6_northRoad', '黑羽的藏身洞', 20, 20, 1111, {'sp': 'hideoutBear', 'lv': 27}, [['featherThug', 24, 26, 45], ['roadBandit', 24, 25, 25], ['greyWolf', 24, 25, 15], ['forestMarten', 24, 25, 15]],
                       items=[{'item': 'megaPotion', 'n': 1}, {'item': 'banditCloth', 'n': 3}], gath='ore'),
        'landmarks': [{'n': '廢棄哨站', 'x': 38, 'y': 17, 'r': 2}, {'n': '三岔路口', 'x': 22, 'y': 44, 'r': 2}, {'n': '北方林道', 'x': 26, 'y': 20, 'r': 3}],
        'zones': [{'x0': 32, 'x1': 99, 'y0': 0, 'y1': 99, 'rate': 0.1, 'table': [['forestMarten', 23, 25, 35], ['ironHedgehog', 23, 25, 30], ['greyWolf', 23, 25, 20], ['hornBeetle', 23, 25, 15]]},
                  {'x0': 0, 'x1': 31, 'y0': 40, 'y1': 99, 'rate': 0.1, 'table': [['ironHedgehog', 22, 24, 35], ['forestMarten', 22, 24, 30], ['roadBandit', 22, 23, 35]]}],
    }
    finish('northRoad', d, g, spec)


def goldPlains():
    """金穗平原 24×39 → 38×45：東邊是用田埂切成迷路的麥田，河邊有大水車；南邊的舊穀倉底下是地窖；麥田邊有旅行藥師的帳篷。"""
    d, g = base('goldPlains', 14, 6, 1212)
    W, H = g.w, g.h
    g.rect(24, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 39, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 39, 0, H - 1, 'T'); g.rect(24, 0, W - 1, 0, 'T')
    g.line([(22, 25), (W - 1, 25)], ':')
    for (x, y) in [(23, 10), (23, 11), (23, 18), (23, 33), (12, 38), (5, 38)]: g.set(x, y, '.')
    # 麥田迷路: wheat (tall grass) blocks cut by narrow dyke paths
    g.rect(25, 2, 35, 22, '#')
    for x in (27, 30, 33): g.line([(x, 2), (x, 22)], '.')
    for y in (5, 9, 13, 17, 21): g.line([(25, y), (35, y)], '.')
    for (x, y) in [(27, 7), (30, 11), (33, 15), (27, 19), (30, 3), (33, 19), (25, 13), (35, 9), (30, 17), (27, 11)]: g.set(x, y, '#')
    # the river and the big water wheel
    g.rect(36, 1, 36, 24, 'W'); g.rect(36, 26, 36, 43, 'W'); g.set(36, 25, '=')
    # the old barn (cellar entrance) and the herbalist's tent in the south
    g.line([(26, 33), (33, 33)], 'F'); g.line([(26, 38), (33, 38)], 'F'); g.set(29, 38, '.')
    g.rect(28, 35, 31, 35, 'o'); g.set(29, 35, '.')
    g.line([(2, 41), (8, 41)], 'F')
    for (cx, cy, rx, ry) in [(30, 29, 3, 1.4), (12, 42, 4, 1), (24, 41, 3, 1.2), (34, 42, 1, 1)]: g.blob(cx, cy, rx, ry, '#', only='.')
    g.scatter(24, 26, 35, 43, 'y', 6, only='.')
    spec = {
        'start': (W - 1, 25),
        'items': [{'id': 'b6g1', 'x': 33, 'y': 11, 'item': 'trainBook'}, {'id': 'b6g2', 'x': 25, 'y': 3, 'item': 'dexFruit'},
                  {'id': 'b6g3', 'x': 35, 'y': 43, 'item': 'wheat', 'n': 3}, {'id': 'b6g4', 'x': 1, 'y': 43, 'gold': 2500}],
        'gathers': [{'id': 'g6g1', 'x': 34, 'y': 30, 'kind': 'herb'}, {'id': 'g6g2', 'x': 20, 'y': 42, 'kind': 'herb'}],
        'signs': {'25,24': '「麥田迷路」\n田埂把麥田切成一格一格。小心迷路。', '27,37': '「舊穀倉」\n倒塌的穀倉，地窖還在。（建議Lv26以上）', '1,40': '「麥田邊的帳篷」\n旅行藥師洛蒂的帳篷。可以休息、買東西、換東西。'},
        'npcs': [{'id': 'camp6_lottie', 'x': 4, 'y': 42, 'dir': 'down', 'look': 'healer', 'name': '洛蒂'}, {'id': 'wheel6', 'x': 35, 'y': 12, 'dir': 'down', 'look': 'waterwheel', 'name': '大水車'}],
        'caveDoor': {'x': 29, 'y': 35},
        'cave': mkcave('cave6_goldPlains', '舊穀倉地窖', 20, 18, 1313, {'sp': 'termiteQueen', 'lv': 29}, [['barnSpider', 26, 28, 45], ['fieldMice', 26, 27, 25], ['scarecrow', 26, 27, 15], ['fieldBee', 26, 27, 15]],
                       items=[{'item': 'megaPotion', 'n': 1}, {'item': 'wheat', 'n': 3}], gath='herb', theme='tower'),
        'landmarks': [{'n': '麥田迷路', 'x': 30, 'y': 12, 'r': 4}, {'n': '大水車', 'x': 35, 'y': 12, 'r': 2}, {'n': '金穗南坡', 'x': 12, 'y': 33, 'r': 3}],
        'zones': [{'x0': 24, 'x1': 99, 'y0': 0, 'y1': 24, 'rate': 0.1, 'table': [['fieldMice', 25, 27, 35], ['barnOwl', 25, 27, 30], ['scarecrow', 25, 27, 20], ['wildBoar', 25, 27, 15]]},
                  {'x0': 0, 'x1': 99, 'y0': 26, 'y1': 99, 'rate': 0.1, 'table': [['barnOwl', 24, 26, 35], ['fieldMice', 24, 26, 35], ['fieldBee', 24, 25, 30]]}],
    }
    finish('goldPlains', d, g, spec)


# ============================== 第五幕 ==============================
def frostField():
    """霜語雪原 24×32 → 38×40：東邊是起伏的雪丘（一層一層跳下來），北邊是冰柱林和凍結的瀑布，河邊有雪洞。"""
    d, g = base('frostField', 14, 8, 1414)
    W, H = g.w, g.h
    g.rect(24, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 32, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 32, 0, H - 1, 'T'); g.rect(24, 0, W - 1, 0, 'T')
    g.line([(11, 31), (11, H - 1)], ':', 2); g.line([(13, 20), (W - 1, 20)], ':')
    for (x, y) in [(23, 5), (23, 6), (23, 12), (23, 28), (5, 31), (19, 31)]: g.set(x, y, '.')
    # 冰柱林: ice pillars (rocks) and snowy trees in the north-east
    g.pillars(25, 2, 35, 10, 'o', 10); g.pillars(25, 2, 35, 10, 'T', 6)
    # 凍結的瀑布: a frozen pool under the north cliff
    g.blob(33, 3, 2.5, 1.6, 'W', jit=0.05)
    # 雪丘: snow terraces stepping down to the road
    for y in (12, 16): g.line([(25, y), (35, y)], 'L')
    g.set(35, 12, '.'); g.set(35, 16, '.')
    # the river runs down the south-east
    g.line([(30, 21), (30, H - 2)], 'W', 2); g.line([(30, 20), (31, 20)], '='); g.line([(30, 34), (31, 34)], '=')
    for (cx, cy, rx, ry) in [(27, 8, 1.6, 1.4), (29, 14, 2.5, 1), (33, 18, 2, 1), (26, 26, 2, 2), (35, 28, 1.4, 2), (8, 35, 3, 1.2), (22, 36, 3, 1.2)]: g.blob(cx, cy, rx, ry, '#', only='.')
    # 雪洞 on the far bank of the river
    g.rect(33, 32, 36, 37, '.'); g.rect(33, 32, 33, 33, 'o'); g.set(34, 32, 'o'); g.rect(36, 32, 36, 33, 'o')
    spec = {
        'start': (11, H - 1),
        'items': [{'id': 'b6r_f1', 'x': 35, 'y': 2, 'item': 'trainBook'}, {'id': 'b6r_f2', 'x': 1, 'y': 38, 'item': 'vitFruit'},
                  {'id': 'b6r_f3', 'x': 35, 'y': 14, 'item': 'snowPelt', 'n': 3}, {'id': 'b6r_f4', 'x': 26, 'y': 38, 'gold': 3000}],
        'gathers': [{'id': 'g6r_f1', 'x': 27, 'y': 5, 'kind': 'ice'}, {'id': 'g6r_f2', 'x': 16, 'y': 37, 'kind': 'herb'}],
        'signs': {'31,6': '「凍結的瀑布」\n整座瀑布都凍住了，像一面冰牆。', '32,36': '「雪洞」\n河對岸的洞窟，裡面全是冰柱。（建議Lv30以上）'},
        'caveDoor': {'x': 35, 'y': 33},
        'cave': mkcave('cave6_frostField', '雪洞', 20, 20, 1515, {'sp': 'iceMammoth', 'lv': 33}, [['icicleSprite', 31, 32, 45], ['frostSprite', 30, 31, 20], ['snowWolf', 30, 31, 20], ['frostMoth', 30, 31, 15]],
                       items=[{'item': 'megaPotion', 'n': 2}, {'item': 'iceCrystal', 'n': 3}], gath='ice', theme='ice'),
        'landmarks': [{'n': '冰柱林', 'x': 30, 'y': 6, 'r': 3}, {'n': '雪丘', 'x': 30, 'y': 14, 'r': 3}, {'n': '凍結的瀑布', 'x': 33, 'y': 3, 'r': 2}],
        'zones': [{'x0': 24, 'x1': 99, 'y0': 0, 'y1': 99, 'rate': 0.1, 'table': [['snowHare', 29, 31, 35], ['frostMoth', 30, 31, 30], ['snowWolf', 29, 31, 20], ['iceOwl', 29, 31, 15]]},
                  {'x0': 0, 'x1': 23, 'y0': 32, 'y1': 99, 'rate': 0.1, 'table': [['snowHare', 29, 30, 35], ['frostMoth', 29, 30, 30], ['yeti', 29, 30, 35]]}],
    }
    finish('frostField', d, g, spec)


def emberPass():
    """赤焰山道 32×32 → 42×40：南邊被一條熔岩河切開，靠石橋過河；東邊是黑曜石坡，坡底有黑曜石洞；熔岩溫泉旁有溫泉小屋。"""
    d, g = base('emberPass', 10, 8, 1616)
    W, H = g.w, g.h
    g.rect(32, 1, W - 2, H - 2, '.', only='T'); g.rect(1, 32, W - 2, H - 2, '.', only='T')
    g.rect(W - 1, 0, W - 1, H - 1, 'T'); g.rect(0, H - 1, W - 1, H - 1, 'T'); g.rect(0, 32, 0, H - 1, 'T'); g.rect(32, 0, W - 1, 0, 'T')
    g.line([(10, 31), (10, H - 1)], ':', 2)
    for (x, y) in [(31, 8), (31, 9), (31, 22), (25, 31), (26, 31)]: g.set(x, y, '.')
    # the lava river across the south, with the stone bridge on the road and a second one in the east
    g.rect(1, 35, 40, 36, 'W'); g.line([(10, 35), (10, 36)], '=', 2); g.line([(33, 35), (33, 36)], '=')
    # 黑曜石坡: dark rock slope with ledges in the east band
    for y in (12, 20): g.line([(32, y), (39, y)], 'L')
    g.set(40, 12, '.'); g.set(40, 20, '.')
    g.pillars(32, 2, 40, 30, 'o', 14)
    for (cx, cy, rx, ry) in [(35, 6, 2, 1.6), (37, 16, 2, 1.4), (34, 25, 2, 1.6), (5, 33, 2.5, 0.6), (20, 38, 3, 0.8), (37, 38, 2, 0.8)]: g.blob(cx, cy, rx, ry, '#', only='.')
    # 黑曜石洞 at the foot of the slope
    g.rect(35, 28, 39, 31, '.'); g.rect(35, 28, 35, 29, 'o'); g.rect(39, 28, 39, 29, 'o'); g.set(36, 28, 'o'); g.set(38, 28, 'o')
    # 溫泉小屋 (camp) south of the hot spring area
    g.line([(23, 33), (28, 33)], 'F'); g.rect(23, 34, 28, 34, '.')
    spec = {
        'start': (10, H - 1),
        'items': [{'id': 'b6e1', 'x': 40, 'y': 2, 'item': 'trainBook'}, {'id': 'b6e2', 'x': 1, 'y': 39, 'item': 'powerFruit'},
                  {'id': 'b6e3', 'x': 40, 'y': 16, 'item': 'magmaStone', 'n': 3}, {'id': 'b6e4', 'x': 39, 'y': 38, 'gold': 3500}],
        'gathers': [{'id': 'g6e1', 'x': 33, 'y': 4, 'kind': 'ore'}, {'id': 'g6e2', 'x': 16, 'y': 38, 'kind': 'ore'}],
        'signs': {'11,37': '「熔岩河石橋」\n石頭搭的橋。橋底下就是熔岩。', '34,30': '「黑曜石洞」\n黑曜石坡底下的洞窟。（建議Lv33以上）', '22,33': '「溫泉小屋」\n小屋主人芙蘿在這裡。可以休息、買東西、換東西。'},
        'npcs': [{'id': 'camp6_flora', 'x': 25, 'y': 34, 'dir': 'down', 'look': 'woman', 'name': '芙蘿'}],
        'caveDoor': {'x': 37, 'y': 29},
        'cave': mkcave('cave6_emberPass', '黑曜石洞', 22, 20, 1717, {'sp': 'magmaNewt', 'lv': 35}, [['obsidianChunk', 34, 35, 45], ['magmaSlime', 33, 34, 20], ['ashMoth', 33, 34, 20], ['obsidianTurtle', 33, 34, 15]],
                       items=[{'item': 'megaPotion', 'n': 2}, {'item': 'magmaStone', 'n': 3}], gath='ore', theme='lava', bg='lava'),
        'landmarks': [{'n': '黑曜石坡', 'x': 36, 'y': 16, 'r': 3}, {'n': '熔岩河石橋', 'x': 10, 'y': 35, 'r': 2}, {'n': '熔岩溫泉', 'x': 26, 'y': 22, 'r': 3}],
        'zones': [{'x0': 32, 'x1': 99, 'y0': 0, 'y1': 99, 'rate': 0.1, 'table': [['ashMoth', 32, 34, 35], ['obsidianTurtle', 33, 35, 30], ['magmaSlime', 32, 34, 20], ['volcanoHawk', 32, 34, 15]]},
                  {'x0': 0, 'x1': 31, 'y0': 32, 'y1': 99, 'rate': 0.1, 'table': [['ashMoth', 32, 33, 35], ['obsidianTurtle', 32, 34, 30], ['lavaCrab', 32, 33, 35]]}],
    }
    finish('emberPass', d, g, spec)


if __name__ == '__main__':
    route()
    windHills()
    jadeCreek()
    forest()
    canyon()
    lake()
    swamp()
    maplePass()
    oldField()
    northRoad()
    goldPlains()
    frostField()
    emberPass()
    js = '/* ===================== v12.0.6 第六輪：大地圖（由 tools/bigmap_specs.py 產生，不要手改） ===================== */\nconst BIGMAP12 = ' + json.dumps(OUT, ensure_ascii=False) + ';\n'
    open(os.path.join(ROOT, 'src/10zzp_v12_r6_mapdata.js'), 'w').write(js)
    for k, v in OUT.items():
        print(k, v['oldW'], 'x', v['oldH'], '->', v['w'], 'x', v['h'])
        if '-v' in sys.argv:
            for i, r in enumerate(v['rows']): print('%2d %s' % (i, r))
