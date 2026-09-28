"""Task N: hand-authored native pixels, deterministic Pillow renderer + QC.

Run from any directory: python path/to/gen_weapons_n.py
No resampling of source art. Only labelled previews use NEAREST enlargement.
All 64 designs have their own pixel recipe; JSON supplies names and palettes.
"""
from pathlib import Path
from collections import Counter
import argparse
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont, ImageColor

OUT = Path(__file__).resolve().parent
BATTLE = OUT.parent
TASK = BATTLE / 'tasks'
TALENTS = BATTLE / 'talents'

# x, y, native rows, design notes. Dots are transparent. # is the outline.
# I/i = light/shade, T = grip, U = metal, V = gem, as specified in JSON.
WEAPONS = {
 'hatchet': (9,5, '''..##.
.##I#
#Uii#
.TiI#
..#I#
...#.''' , 'small blunt iron edge, plain wooden haft'),
 'boarAxe': (8,4, '''.#...#.
#I#.#I#
.iU#Ii#
..#Uii#
..TiI#.
..#I#..
...#...''', 'two ivory tusks around the iron axe socket'),
 'rockAxe': (8,3, '''..###..
.#IIi#.
#IiiUi#
.#iVii#
..#Uii#
..TiI#.
...##..''', 'faceted rhinoceros-horn wedge, rivet and thick cutting edge'),
 'crescentAxe': (8,2, '''....##.
...#I#.
.###i#.
#UUiI#.
.T#ii#.
..#Ii#.
...#Ii#
....###''', 'concave crescent blade with gold socket'),
 'glacierAxe': (8,2, '''..#..#.
.#I##I#
#IViIi#
.#UViI#
..TiVi#
..#iI#.
...#I#.
....#..''', 'jagged ice crown, cyan veins and descending icicle'),
 'titanAxe': (8,1, '''.#.#.#.
#U#I#U#
#UIIiU#
#iUVUi#
.#UVU#.
#IiTiI#
#UiiiU#
.#####.''', 'massive double blade, gold crown and amethyst core'),
 'trainSpear': (8,1, '''.#.
#I#
#U#
#i#
.T.''', 'plain narrow training point and unadorned wooden shaft'),
 'ironSpear': (7,1, '''..#.
.#I#
#II#
#ii#
.#U#
..T.''', 'broad diamond iron point and brass ferrule'),
 'galeLance': (7,0, '''...#.
..#I#
..#I#
.#Ii#
.#i#.
#Ui#.
.#T..''', 'long swept lance point with a side pennant'),
 'scaleSpear': (7,0, '''..#..
.#I#.
.#Ii#
#UIi#
#VUi#
.#U#.
..T..''', 'dragon-eye spear socket and stepped scale flanges'),
 'azureSpear': (7,0, '''...#.
..#I#
#.#I#
#U#i#
#VUi#
.#U#.
..T..''', 'hooked dragon jaw with cyan eye and swept wing guard'),
 'frostSpear': (7,0, '''...#.
..#I#
..#I#
.#IV#
#IVi#
.#i#.
..T..''', 'recurved ice fang, faceted cyan spine and icicle collar'),
 'skySpear': (7,0, '''..#..
.#I#.
#UIU#
#IVi#
.#U#.
#UiU#
.#T#.''', 'gold dragon spear, amethyst eye, spread dragon wings'),
 'wrapFist': (1,15, '''.###.
#IIi#
#iIi#
#IIi#
.###.''', 'compact cloth fist with crossing wrap bands'),
 'ironKnuckle': (1,14, '''..####.
.#I#I#.
#i#i#i#
#TUUU#.
.TTi#..
..##...''', 'two open knuckle rings and leather palm cuff'),
 'rockFist': (1,14, '''..###..
.#IIi#.
#Ii#ii#
#TiUi#.
#TTii#.
.####..''', 'blocky mineral knuckles with a split stone plate'),
 'chiFist': (1,14, '''...##..
.##IV#.
#IiViI#
#TUVi#.
.TUi#..
..##...''', 'flowing chi gem inset in a tapered gauntlet'),
 'tigerClaw': (1,14, '''..####.
.#IIiU#
#iUUUi#
#TUiU#.
.TTi#..
..##...''', 'three separated upward claws on a gold knuckle plate'),
 'magmaFist': (1,14, '''..#.#..
.#i#i#.
#iIVii#
#TViVi#
#TiVi#.
.####..''', 'basalt crags with branching molten fissures'),
 'starFist': (1,14, '''...#...
..#U#..
##UIU##
#TiUVU#
.T#U#i#
..#i##.
...#...''', 'gold star knuckle crest over an amethyst cuff'),
 'woodFlute': (1,10, '''......#.
.....#I#
....#i#.
...#I#..
..#i#...
.#I#....
#T#.....
#T#.....
.#......''', 'eight-pixel diagonal wooden flute with dark finger holes'),
 'travelLute': (4,7, '''...###..
..#UIU#.
.#UIUiU#
.#U#UiU#
.#UiUiU#
..#UiU#.
..#I##..
.#I#....
.#T#....
..#.....''', 'pear-shaped wooden lute, sound hole and one-pixel strings'),
 'forestHarp': (3,7, '''.######.
#UIIIiU#
.U#I.IU#
.U.I.IU#
.U.I.IU#
.U.I.IU#
.U.I.IU#
.U#IiU#.
.TUUU#..
.####...''', 'arched ancient-wood harp with green leaf finial and three strings'),
 'moonLyre': (3,7, '''.##..##.
#IU##UI#
#U#II#U#
#U.I.IU#
#U.I.IU#
.#UIIU#.
.#iVUi#.
..#UU#..
..#T#...
...#....''', 'open twin-horn lyre, moonstone soundbox and silver strings'),
 'windHorn': (3,7, '''.....##.
....#IU#
...#IU#.
.###U#..
#UIU#...
#U#i#...
#U#Ui#..
.#UUU#..
..#T#...
...#....''', 'curled brass horn with hollow loop and raised flared bell'),
 'iceHarp': (3,6, '''..#..#..
.#I##I#.
#IVIIiI#
.i#I.Ii#
.i.I.Ii#
.i.I.Ii#
.i.I.Ii#
.iVI.Ii#
.#iVVi#.
..#UU#..
...T....''', 'crystalline harp with icicle tips and ice-silk strings'),
 'starLyre': (3,6, '''...#....
..#I#...
##UIU##.
#U#V#U#.
#U.I.U#.
#U.I.U#.
#U.I.U#.
.#UIU#..
.#iVi#..
..#U#...
...T....''', 'star-crowned gold lyre with violet resonating chamber'),
 'corkGun': (1,13, '''..#####.
.#UIIiI#
#TiUi##.
.TT##...
.#T#....
..#.....''', 'short wooden popgun with protruding cork plug'),
 'brassPistol': (1,12, '''...#....
..#U###.
.#UIIIU#
#TiUUU#.
.TT#U#..
.#T##...
..#.....''', 'brass flintlock, raised hammer and open trigger loop'),
 'steamRifle': (1,11, '''....##........
....#U#.......
..###i#######.
.#UIVIUIIIIIU#
#TTiViUiiiiU#.
.TT##U####U#..
.#T#..........''', 'steam pressure cylinder, exhaust pipe and long silver barrel'),
 'gearRepeater': (1,11, '''.....#........
....#U#.......
..##UiU######.
.#UI#V#UIIIIU#
#TiUiUiUiiiU#.
.TT#U#UU####..
.#T####U#.....
..#....#......''', 'toothed feed wheel, rotary chamber and box magazine'),
 'boltCannon': (1,10, '''.........###..
....###.#UIU#.
..##IVi##UiU#.
.#UIVViUIIiU#.
.TiUiViUiiiU#.
.TT#UiU##UiU#.
.#T#####.###..
..#...........''', 'heavy ring muzzle and lightning-shaped luminous core'),
 'frostMusket': (1,11, '''.........#....
...#....#I#...
..#U#####i###.
.#UIIIUIIIIVI#
#TTiUiUiiiiV#.
.TT##U####i#..
.#T#......#...
..#...........''', 'slender frost musket, icy bayonet muzzle and hanging icicle'),
 'starBlaster': (1,10, '''......#...#...
..##.#U#.#U#..
.#UI#UIU#UIU#.
.UIiUVVViUIiU#
.TiUiVVViUiiU#
.TT#iUiU#UiU#.
.#T######.#...
..#...........''', 'ornate gold star cannon with large violet energy chamber'),
}

# Each class shares one accent and common materials; symbols remain distinct.
ACCENTS = {
 'swordsman':'#ef7676', 'mage':'#b79aff', 'guardian':'#ebcf76',
 'ranger':'#82d1a1', 'bard':'#ed9dcc', 'machinist':'#ecc17c',
 'monk':'#f1ad78', 'dragoon':'#8fc4ef', 'otherworlder':'#9bdacb',
 'spellblade':'#c69dea',
}
# Native 10x10 recipes placed at (1,1) on the 12x12 canvas.
# W = white, G = light grey, A = the single class accent, # = #10121e.
EMBLEMS = [
 ('katana and scarlet hilt', '''........#.
.......#W#
......#WG#
.....#WG#.
....#WG#..
.#.#WG#...
#A#WG#....
.#A##.....
#A#.#.....
.#........'''),
 ('bloody axe and drop', '''....#..##.
...#G##WA#
....#AWWA#
....#G#WA#
...#G#.##.
..#G#.....
.#G#...#..
#A#...#A#.
.#.....#..
..........'''),
 ('duelist spear point', '''......#...
.....#W#..
....#WWG#.
...#WWG#..
....#G#...
...#A#....
..#G#.....
.#G#......
#A#.......
.#........'''),
 ('flame', '''.....#....
....#W#...
...#WA#...
.#.#AA#...
#W##AA#...
#WAAGAA#..
#AAGWAAG#.
.#AGWAAG#.
..#GGGG#..
...####...'''),
 ('lightning bolt', '''.....####.
....#WWW#.
...#WWG#..
..#WWG#...
.#WWAA##..
..###AA#..
....#A#...
...#A#....
..#A#.....
...#......'''),
 ('open arcane book and star', '''.....#....
....#A#...
...#AWA#..
....#A#...
.###.###..
#WWG#WWW#.
#WGW#WGW#.
#WWW#WWG#.
#GGG#GGG#.
.#######..'''),
 ('winged holy shield', '''.#......#.
#W######W#
#WGWWWWGW#
.#GWAAGG#.
#WGAAAAGW#
.##GAAG##.
..#WAAG#..
...#WG#...
....##....
..........'''),
 ('tower shield and central brace', '''..######..
.#WWWWGG#.
.#WGAAGG#.
.#WGAAGG#.
.#WAAAAG#.
.#WGAAGG#.
.#WGAAGG#.
.#WGGGGG#.
..#WGGG#..
...####...'''),
 ('cracked shield and revenge axe', '''.#####.##.
#WW#GG#WA#
#WG#G#GWA#
#WGG#G##A#
#WG#G#G##.
#WG##AG#..
.#G#AG#...
..#AG#....
.#A##.....
..#.......'''),
 ('assassin dagger and poison drop', '''.......#..
......#W#.
.....#WG#.
....#WG#..
...#WG#...
..#A##....
.#A#.#.#..
#A#...#A#.
.#....#A#.
.......#..'''),
 ('shadow dancer spiral', '''...#####..
..#WWWWG#.
.#WG###GG#
#WG#...#G#
#G#..#.#A#
#G#.#A##A#
#GG#.AAA#.
.#GG####..
..#AAA#...
...###....'''),
 ('hunter sight', '''....##....
..##WA##..
.#WG##WG#.
.#G#..#G#.
#A#..#.#A#
#W#.#A.#W#
.#G#..#G#.
.#WG##WG#.
..##AW##..
....##....'''),
 ('battle song and pennant', '''....#.....
...#A#....
..#AWA#...
...#A####.
...#WWWW#.
...#W##W#.
...#W.#W#.
.###W#AW#.
#AAWG#AA#.
.####.##..'''),
 ('requiem note and halo', '''...####...
..#AWWA#..
...####...
.....#W#..
.....#W##.
.....#WWG#
...###W##.
..#AWGW#..
..#AAGG#..
...####...'''),
 ('poet dagger and musical note', '''.......#..
..###.#W#.
..#W##WG#.
..#W#WG#..
..#WWG#...
.##WA#....
#AA#AA#...
.##A##W#..
.#A#..#...
..#.......'''),
 ('cannon and muzzle burst', '''.......#..
......#A#.
.....#AWA#
..###W#A#.
.#WWWGG#..
#WWGGG#...
#GGGG#....
.#GA#.....
#AA#......
.##.......'''),
 ('gear and capacitor', '''...####...
.#.#WW#.#.
#W##GG##W#
.WG#AA#GW.
#WG#WA#GW#
#WG#AW#GW#
.WG#AA#GW.
#W##GG##W#
.#.#GG#.#.
...####...'''),
 ('repair wrench and armor plate', '''.#..#.....
#W##W#....
#WGGW#....
.#WG#.....
..#WG#.##.
...#WG#WW#
....#WGAW#
....#GAAG#
.....#GG#.
......##..'''),
 ('striking fist', '''..######..
.#W#W#WG#.
.#WGWGWG#.
.#WWWWWG#.
#WGAAAGG#.
#WGAAGG#..
.#WGGG#...
..#AAA#...
..#GGG#...
...###....'''),
 ('chi circulation and pearl', '''...####...
..#WWWW#..
.#W###WG#.
#W#..#GG#.
#W#.#A#.#.
.#.#AWA#..
.#G.#A#..#
.G#..#..G#
..#GGGGG#.
...#####..'''),
 ('meditation lotus', '''....##....
...#WW#...
...#GG#...
....##....
...#WW#...
..#WAAW#..
.#WGAAGW#.
#WG#AA#GW#
.#GWWWWG#.
..######..'''),
 ('dragon spear and wing', '''.......#..
......#W#.
..#..#WW#.
.#W##AW#..
#WGAAG#...
.##AG#....
..#G#.....
.#G#......
#A#.......
.#........'''),
 ('dragon blood heart and scales', '''.###.###..
#WWW#WWG#.
#WAAAAAG#.
#WA#AAAG#.
.#AAGA#G#.
..#AAA##..
...#AG#...
...#G#....
....#.....
..........'''),
 ('sky leap and upward wings', '''....#.....
...#W#....
..#WWW#...
.#W#A#W#..
#W#WA#GW#.
.##WA###..
..#WA#....
.#G#A#G#..
..#GAG#...
...###....'''),
 ('hero sword and radiant crown', '''....##....
.#.#WW#.#.
#W##WG##W#
.#AWGGA#..
..#WG#....
..#WG#....
.#AAAA#...
..#AA#....
...#G#....
....#.....'''),
 ('otherworld portal and eye', '''...####...
..#WWWW#..
.#WG##GG#.
#WG#..#GG#
#W#.##.#G#
#W##AA##G#
#WG#AA#GG#
.#WG##GG#.
..#AAAA#..
...####...'''),
 ('time-space hourglass', '''.########.
.#WWWWWG#.
..#AAAG#..
..#WAGG#..
...#AG#...
...#GA#...
..#GGAG#..
..#GAAG#..
.#WWWWWG#.
.########.'''),
 ('enchanted blade and arcane ring', '''.......#..
...##.#W#.
..#AA#WG#.
.#A##WG#..
#A#.#WG#..
#A##WG#...
.#AWG##A#.
..#AAAG#..
.#G###G#..
..#...#...'''),
 ('eclipse crescent and star', '''...####...
..#WW#....
.#WW#..#..
#WW#..#A#.
#WG#.#AWA#
#WG#..#A#.
#WGG#..#..
.#WGG#....
..#GGGG#..
...####...'''),
 ('four-element compass', '''....#.....
...#W#....
...#A#....
.#..#..#..
#WA#W#AW#.
.#..#..#..
...#A#....
...#W#....
....#.....
..........'''),
]


def stamp(im, x, y, rows, palette):
    rows = rows.strip().splitlines()
    assert len({len(r) for r in rows}) == 1, rows
    for j, row in enumerate(rows):
        for i, symbol in enumerate(row):
            if symbol != '.':
                xy = (x+i, y+j)
                assert 0 <= xy[0] < im.width and 0 <= xy[1] < im.height, xy
                im.putpixel(xy, ImageColor.getcolor(palette[symbol], 'RGBA'))


def line(im, points, color, outline=True):
    """A one-pixel centerline with a four-neighbor, one-pixel outline."""
    mask = Image.new('1', im.size)
    ImageDraw.Draw(mask).line(points, fill=1, width=1)
    pixels = [(x,y) for y in range(im.height) for x in range(im.width) if mask.getpixel((x,y))]
    if outline:
        for x,y in pixels:
            for dx,dy in ((0,0),(-1,0),(1,0),(0,-1),(0,1)):
                assert 0 <= x+dx < im.width and 0 <= y+dy < im.height, ('clipped stroke', points)
                im.putpixel((x+dx,y+dy), ImageColor.getcolor('#2a2238','RGBA'))
    for xy in pixels:
        im.putpixel(xy, ImageColor.getcolor(color,'RGBA'))


def weapon(item):
    k, kind = item['key'], item['type']
    pal = {'#':'#2a2238', **item['pal']}
    pal.setdefault('V', pal['U'])
    im = Image.new('RGBA',(16,22))
    if kind == 'axe':
        tip = {'hatchet':(10,7),'boarAxe':(10,7),'rockAxe':(10,6),
               'crescentAxe':(9,5),'glacierAxe':(10,5),'titanAxe':(11,5)}[k]
        line(im,[(2,18),(2,17),tip],pal['T'])
        if item['tier'] >= 4:
            line(im,[(4,15),(5,14)],pal['U'],False)
    elif kind == 'spear':
        line(im,[(2,20),(2,17),(5,12),(7,8),(9,5)],pal['T'])
        if k == 'galeLance':
            stamp(im,4,7,'.###\n#UU#\n.#i#\n..#.',pal)
        elif k == 'scaleSpear':
            stamp(im,5,8,'..#..\n.#U#.\n#Ui#.\n.#U#.\n#Ui#.\n.#...',pal)
        elif k == 'azureSpear':
            stamp(im,4,6,'#....#..\n#U#.#U#.\n.#U#UV#.',pal)
        elif k == 'frostSpear':
            stamp(im,5,7,'.#.#.\n#I#I#\n.#V#.\n..#..',pal)
        elif k == 'skySpear':
            stamp(im,4,6,'#......#\n#U#..#U#\n.#U##U#.\n..#VV#..\n...##...',pal)
            line(im,[(3,16),(4,14)],pal['U'],False)
    elif kind == 'instrument' and k != 'woodFlute':
        end = (5,14) if k in ('forestHarp','travelLute') else (6,15)
        line(im,[(2,17),end],pal['T'])
    if k == 'tigerClaw':
        # Three parallel silver claws with one transparent lane between them.
        for points in [[(3,15),(6,10)],[(5,15),(8,10)],[(7,15),(10,10)]]:
            line(im, points, pal['I'])
    x,y,rows,note = WEAPONS[k]
    stamp(im,x,y,rows,pal)
    if k == 'forestHarp':
        stamp(im,9,5,'.#.\n#V#\n.#.',pal)
    return im,note


def font(size, chinese=False):
    candidates = ['C:/Windows/Fonts/msjh.ttc'] if chinese else []
    candidates += ['C:/Windows/Fonts/arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p,size)
    return ImageFont.load_default()


def check(im, size, key, silhouettes, max_colors, hand=False):
    assert im.mode == 'RGBA' and im.size == size, (key,im.mode,im.size)
    a = im.getchannel('A')
    assert set(a.tobytes()) == {0,255}, (key,'alpha')
    colors = {c for count,c in im.getcolors() if c[3]}
    assert 3 <= len(colors) <= max_colors, (key,'colors',len(colors))
    if hand:
        assert any(a.getpixel(p)==255 for p in [(2,17),(1,17),(3,17),(2,16),(2,18)]), (key,'anchor')
        assert not a.crop((0,0,2,15)).getbbox(), (key,'body overlap')
    signature = a.tobytes()
    assert signature not in silhouettes, (key,'duplicate silhouette',silhouettes.get(signature))
    silhouettes[signature] = key
    return len(colors), a.getbbox()


def save_checked(im, path):
    im.save(path)
    with Image.open(path) as reread:
        assert reread.mode == im.mode and reread.size == im.size and reread.tobytes() == im.tobytes(), path


def previews(weapons, frames, branches, icons):
    hero = Image.open(TASK/'L_hero_doll_noweapon.png').convert('RGBA')
    assert hero.size == (28,24)
    # Rows follow weapon families. Every in-hand rendering is exactly 5x.
    preview = Image.new('RGB',(7*172,5*222),'#333b48')
    d = ImageDraw.Draw(preview)
    counts = Counter()
    for w, im in zip(weapons,frames):
        row = ['axe','spear','fist','instrument','gun'].index(w['type'])
        col = counts[w['type']]; counts[w['type']] += 1
        x,y = col*172,row*222
        d.text((x+7,y+5),f"{w['key']}  T{w['tier']}",font=font(12),fill='#ffffff')
        d.text((x+7,y+23),w['n'],font=font(13,True),fill='#d5dfeb')
        doll = hero.copy(); doll.alpha_composite(im,(12,1))
        q = doll.resize((140,120),Image.Resampling.NEAREST)
        preview.paste(q,(x+8,y+47),q)
        # Additional 2x drop view, using exactly the same PNG.
        q = im.resize((32,44),Image.Resampling.NEAREST)
        preview.paste(q,(x+111,y+170),q)
        d.text((x+8,y+186),'loot 2x',font=font(11),fill='#b9c9dd')
    save_checked(preview,OUT/'new_preview.png')
    preview = Image.new('RGB',(6*174,5*136),'#333b48')
    d = ImageDraw.Draw(preview)
    for i,(b,im) in enumerate(zip(branches,icons)):
        x,y = i%6*174,i//6*136
        d.text((x+7,y+4),b['file'],font=font(12),fill='#ffffff')
        d.text((x+7,y+22),b['branch'],font=font(14,True),fill=ACCENTS[b['class']])
        q = im.resize((72,72),Image.Resampling.NEAREST)
        preview.paste(q,(x+47,y+51),q)
    save_checked(preview,TALENTS/'preview.png')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reviewed', action='store_true', help='Record visual review only after inspecting both previews.')
    args = parser.parse_args()
    weapons = json.loads((TASK/'N_weapons.json').read_text(encoding='utf-8-sig'))
    branches = json.loads((TASK/'N_branches.json').read_text(encoding='utf-8-sig'))
    assert len(weapons)==34 and {w['key'] for w in weapons}==set(WEAPONS)
    assert Counter(w['type'] for w in weapons)==dict(axe=6,spear=7,fist=7,instrument=7,gun=7)
    assert len(branches)==30 and len(EMBLEMS)==30 and len({b['file'] for b in branches})==30
    TALENTS.mkdir(exist_ok=True)
    notes,frames,icons = [],[],[]
    seen = {}
    # Include Task L silhouettes in the uniqueness check.
    for w in json.loads((TASK/'L_weapons.json').read_text(encoding='utf-8-sig')):
        path=OUT/(w['key']+'.png')
        if path.exists():
            seen[Image.open(path).convert('RGBA').getchannel('A').tobytes()] = w['key']
    visual = 'visual=reviewed' if args.reviewed else 'visual=PENDING'
    for w in weapons:
        im,note = weapon(w)
        n,bbox = check(im,(16,22),w['key'],seen,7,True)
        path = OUT/(w['key']+'.png')
        save_checked(im,path); frames.append(im)
        notes.append(f'weapons/{path.name} PASS | 16x22 RGBA; alpha=0/255; colors={n}+transparent; anchor=PASS; body-clear=PASS; unique silhouette=PASS; bbox={bbox}; {visual}; {note}')
    seen = {}
    for b,(note,rows) in zip(branches,EMBLEMS):
        im = Image.new('RGBA',(12,12))
        stamp(im,1,1,rows,{'#':'#10121e','W':'#f4f6fc','G':'#aab5c9','A':ACCENTS[b['class']]})
        n,bbox = check(im,(12,12),b['file'],seen,5)
        path = TALENTS/b['file']; save_checked(im,path); icons.append(im)
        notes.append(f'talents/{path.name} PASS | {b["branch"]}; 12x12 RGBA; alpha=0/255; colors={n}+transparent; single accent; dark outline; unique silhouette=PASS; bbox={bbox}; {visual}; {note}')
    previews(weapons,frames,branches,icons)
    notes += [
        f'weapons/new_preview.png PASS | 34 labelled dolls at 5x, offset=(12,1); 34 additional loot views at 2x; NEAREST; {visual}',
        f'talents/preview.png PASS | 30 labelled icons at 6x; class triples grouped; NEAREST; {visual}',
        'weapons/gen_weapons_n.py PASS | 64 independent pixel recipes; deterministic generation; per-file validation and PNG readback',
    ]
    (TASK/'N_done.txt').write_text('\n'.join(notes)+'\n',encoding='utf-8')
    digest=hashlib.sha256(b''.join(im.tobytes() for im in frames+icons)).hexdigest()
    print(f'N PASS: {len(frames)} weapons + {len(icons)} talents; 2 previews; {len(notes)} file records; {visual}; pixels SHA256={digest}')


if __name__ == '__main__':
    main()
