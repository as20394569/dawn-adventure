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
    pts = [(n['x'], n['y']) for n in d['npcs']] + [(n['x'], n['y']) for n in d['items']] + [(n['x'], n['y']) for n in (d['elites'] or [])]
    pts += [(n['x'], n['y']) for n in (d['gathers'] or [])] + [(t['x'], t['y']) for t in (d['triggers'] or [])]
    pts += [tuple(map(int, k.split(','))) for k in (d['signs'] or {})]
    g.protect(pts, 0)
    return d, g


def finish(mid, d, g, spec):
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


if __name__ == '__main__':
    route()
    windHills()
    jadeCreek()
    js = '/* ===================== v12.0.6 第六輪：大地圖（由 tools/bigmap_specs.py 產生，不要手改） ===================== */\nconst BIGMAP12 = ' + json.dumps(OUT, ensure_ascii=False) + ';\n'
    open(os.path.join(ROOT, 'src/10zzp_v12_r6_mapdata.js'), 'w').write(js)
    for k, v in OUT.items():
        print(k, v['oldW'], 'x', v['oldH'], '->', v['w'], 'x', v['h'])
        if '-v' in sys.argv:
            for i, r in enumerate(v['rows']): print('%2d %s' % (i, r))
