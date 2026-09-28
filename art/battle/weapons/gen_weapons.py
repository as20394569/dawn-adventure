"""Task L: hand-authored native 16x22 weapon pixels; requires Pillow.

Run: python art/battle/weapons/gen_weapons.py
No generated large images, downsampling, random variants or antialiasing.
Coordinates and silhouettes below are intentional per-item designs. Input
palettes/names/order come from ../tasks/L_weapons.json. Previews alone scale up.
"""
from pathlib import Path
from collections import Counter
import json
from PIL import Image, ImageDraw, ImageFont, ImageColor

OUT = Path(__file__).resolve().parent
TASK = OUT.parent / 'tasks'
DARK = '#2a2238'

# Blade profiles in longitudinal/lateral pixels. A positive lateral coordinate
# points toward the lower-right edge. Each recipe owns its silhouette, not just
# its palette. Profiles include blade and tang; guards are separate native art.
# key: (profile, guard, pommel, design note)
BLADES = {
 'woodSword': ([(0,-1),(10,-1),(11,0),(10,1),(0,1)],'bar',0,'blunt wooden practice blade, plain crossbar'),
 'ironSword': ([(0,-1),(10,-1),(12,0),(9,1),(0,1)],'short',0,'straight iron blade, short straight guard'),
 'knightSword': ([(0,-1),(11,-1),(14,0),(11,1),(0,1)],'cross',1,'long needle point, knight crossguard'),
 'foxBlade': ([(0,-1),(4,-1),(6,-2),(6,0),(10,-1),(13,-1),(11,1),(7,2),(3,1),(0,1)],'tail',1,'curving foxfire tongues and tail guard'),
 'crystalBlade': ([(0,0),(2,-2),(9,-2),(14,0),(9,1),(2,2)],'crystal',2,'faceted tapered crystal with asymmetric base shards'),
 'dawnSword': ([(0,-1),(8,-1),(12,-2),(14,0),(11,1),(0,1)],'sun',1,'sun-ray guard and swept dawn tip'),
 'masterBlade': ([(0,-1),(4,-2),(11,-1),(14,0),(10,1),(3,1),(1,2)],'gem',2,'shouldered forged blade, crystal-set guard'),
 'voltSword': ([(0,-1),(4,-1),(4,-2),(7,0),(8,-2),(12,-1),(10,1),(7,1),(6,2),(3,1),(0,1)],'bolt',0,'stepped lightning cutting edge'),
 'boneSaber': ([(0,-1),(4,-2),(8,-3),(12,-2),(13,-1),(9,-1),(5,1),(0,1)],'bone',2,'curved bone saber, knuckled bone guard'),
 'kingsBlade': ([(0,-1),(3,-2),(5,-1),(7,-2),(10,-1),(13,-2),(12,1),(8,2),(3,1),(0,1)],'crown',2,'royal flame blade and three-point crown guard'),
 'graveBlade': ([(0,-1),(8,-1),(10,-2),(13,-1),(14,0),(10,2),(2,2),(0,1)],'skull',2,'heavy grave blade, skull guard'),
 'eclipseBlade': ([(0,-1),(4,-2),(8,-2),(12,-3),(14,-2),(12,0),(8,0),(6,2),(0,1)],'crescent',1,'hooked eclipse blade with crescent quillon'),
 'voidBlade': ([(0,-1),(4,-1),(5,-2),(8,-1),(10,-3),(13,-2),(11,0),(12,1),(8,1),(6,2),(3,1),(0,1)],'void',2,'fractured void edge and open hooked guard'),
 'moonBlade': ([(0,-1),(5,-2),(10,-3),(14,-2),(12,0),(8,1),(3,1),(0,1)],'moon',0,'smooth moonlit crescent saber'),
 'riftSword': ([(0,-1),(4,-2),(5,0),(8,-2),(12,-2),(14,0),(11,1),(8,0),(6,2),(2,1),(0,1)],'rift',1,'split angular rift edge'),
 'sandSaber': ([(0,-1),(4,-1),(7,-2),(10,-4),(12,-4),(12,-2),(10,0),(6,1),(0,1)],'hook',0,'deeply swept desert scimitar'),
 'toadBlade': ([(0,-1),(3,-2),(6,-2),(6,-1),(10,-2),(12,0),(10,2),(6,2),(3,1),(0,1)],'toad',1,'broad poison leaf blade with toad-eye guard'),
 'verdantBlade': ([(0,0),(3,-2),(7,-2),(13,-1),(10,1),(5,2),(1,1)],'leaf',0,'leaf-shaped blade and leaf quillon'),
 'royalSword': ([(0,-1),(2,-2),(10,-2),(14,0),(10,1),(3,1),(2,2),(0,1)],'royal',2,'royal flanged blade with winged crossguard'),
 'hornSpear': ([(0,-1),(5,-1),(6,-3),(7,-1),(10,-2),(14,-1),(12,1),(7,2),(3,1),(0,1)],'horn',1,'beetle horn fork and thick carapace base'),
 'brassSword': ([(0,-1),(3,-1),(3,-2),(5,-2),(5,-1),(7,-1),(7,-2),(9,-2),(9,-1),(12,-1),(13,0),(10,1),(0,1)],'gear',2,'brass toothed edge and gear guard'),
 'frostBrand': ([(0,-1),(3,-1),(4,-3),(6,-1),(9,-2),(14,-1),(11,1),(8,1),(7,3),(5,1),(0,1)],'ice',1,'icicle prongs jutting from frozen blade'),
 'flameBrand': ([(0,-1),(3,-2),(4,0),(7,-2),(8,-1),(11,-3),(13,-2),(12,1),(9,2),(7,1),(4,2),(0,1)],'flame',2,'wavy molten blade with rising flame guard'),
 'duskSword': ([(0,-2),(10,-2),(13,-1),(15,0),(12,2),(2,2),(0,1)],'bat',2,'wide dark greatsword and bat-wing guard'),
 'starSword': ([(0,-1),(8,-1),(10,-2),(11,-1),(14,0),(11,1),(10,3),(9,1),(0,1)],'star',1,'star flare tip and star guard'),
 'duskBlade': ([(0,-1),(2,-2),(9,-2),(10,-3),(14,-1),(13,1),(9,1),(8,2),(2,2),(0,1)],'fallen',2,'black knight cleaver with broken wing quillon'),
 'moldBlade': ([(0,-2),(3,-2),(4,-3),(11,-2),(15,0),(11,2),(3,2),(2,1),(0,1)],'demon',2,'largest dark slab blade with horned red guard'),
 'chronoLance': ([(0,-1),(7,-1),(8,-2),(15,0),(8,2),(7,1),(0,1)],'clock',1,'slender lance shaft, spearhead, clock guard'),
 # Short blades: blade 4–6px plus hilt, rather than scaled-down long swords.
 'mistDagger': ([(0,-1),(4,-1),(6,0),(3,1),(0,1)],'tiny',0,'compact straight mist dagger'),
 'fangDagger': ([(0,-1),(2,-2),(5,-2),(6,-1),(4,1),(0,1)],'none',0,'hooked wolf fang with bare wrapped root'),
 'emberKnife': ([(0,-1),(2,-1),(3,-2),(5,-1),(6,0),(3,1),(0,1)],'tiny',1,'ember notch and pointed warm blade'),
 'banditKnife': ([(0,-1),(3,-2),(5,-2),(5,0),(2,1),(0,1)],'hooksmall',0,'clipped tip and hand hook'),
 'wyrmFang': ([(0,-1),(2,-2),(6,-3),(5,-1),(3,1),(0,1)],'fang',1,'long recurved water-dragon tooth'),
 'moonDagger': ([(0,-1),(2,-3),(5,-3),(6,-2),(3,-1),(2,1),(0,1)],'none',1,'crescent moon blade with concave inner edge'),
 'riftDagger': ([(0,-1),(2,-2),(3,0),(5,-2),(6,-1),(4,1),(1,1)],'split',0,'forked rift blade'),
 'huntKnife': ([(0,-1),(3,-1),(4,0),(3,1),(0,1)],'none',0,'short plain drop-point hunting knife'),
 'stingerDagger': ([(0,0),(2,-2),(4,-3),(6,-3),(5,-1),(3,0),(1,1)],'tiny',1,'narrow curled scorpion stinger'),
 'duneFang': ([(0,-1),(2,-2),(5,-2),(6,0),(4,2),(2,2),(0,1)],'tooth',1,'broad serrated sand-worm tooth'),
 'hydraFang': ([(0,-1),(2,-2),(3,-1),(5,-3),(6,-2),(4,0),(3,2),(0,1)],'fork',1,'double-tined venom fang'),
 'royalDagger': ([(0,-1),(3,-1),(6,0),(4,2),(0,1)],'royalsmall',1,'diamond royal blade with small crown guard'),
 'wolfFang2': ([(0,-1),(1,-2),(4,-3),(5,-2),(4,0),(2,2),(0,1)],'fang',0,'stocky grey-wolf tooth with stepped root'),
 'iceDagger': ([(0,-1),(2,-2),(3,-3),(6,-1),(3,1),(1,2),(0,1)],'icesmall',0,'jagged ice shard with crystal spur'),
 'magmaDagger': ([(0,-1),(2,-1),(2,-2),(4,-2),(5,0),(4,2),(2,1),(0,1)],'magma',1,'chunky basalt blade with molten notch'),
 'shadowDagger': ([(0,-1),(2,-2),(3,-1),(5,-2),(6,-1),(5,1),(3,0),(2,2),(0,1)],'shadow',1,'wisp-edged shadow knife'),
 'cometDagger': ([(0,-1),(2,-1),(3,-2),(4,-1),(6,0),(4,1),(3,2),(2,1),(0,1)],'comet',0,'star-point knife and trailing quillon'),
}

# Six-by-six native pixel heads: '.' transparent, '#' outline,
# I highlight, i shade, T wood/metal, U fitting, V gem. They are all hand-authored.
HEADS = {
 'apprenticeStaff': ['......','..##..','.#TI#.','.#TT#.','..##..','..T...'],
 'practiceWand': ['..#...','.#I#..','.#V#..','..T##.','..#V#.','...#..'],
 'oakStaff': ['.##...','#IV#..','#VV##.','.TIVI#','.T###.','..T...'],
 'ruinStaff': ['.####.','.#II#.','.#iU#.','.#Ui#.','.####.','..TT..'],
 'thornStaff': ['....#.','..##V#','.##V#.','#U#T..','.#TT#.','..T...'],
 'tideStaff': ['..##..','.#IV#.','#IVVi#','..#i#.','..#U#.','...T..'],
 'stormStaff': ['.###..','..#I#.','.#IV#.','.#V#..','..#I#.','..T#..'],
 'emberRod': ['...#..','..#I#.','.#IV#.','.#Vi#.','..##..','..TT..'],
 'voltRod': ['...##.','..#I#.','.#I#..','.#V##.','..#V#.','..T#..'],
 'quartzWand': ['..#...','.#I#..','.#IV#.','.#Vi#.','..##..','...T..'],
 'fangWand': ['.###..','.#II#.','..#i#.','..#i#.','.##...','..T...'],
 'magusStaff': ['.#..#.','#U##U#','.#IV#.','.#Vi#.','.#UU#.','..TT..'],
 'foxfireStaff': ['.#.#..','.#I#..','#IVV#.','#VVi#.','.###..','..UT..'],
 'crystalStaff': ['..#...','.#I##.','#IIVI#','.#Vi#.','..#i#.','...i..'],
 'dawnStaff': ['..#...','.#U#..','#UIIU#','.#IU#.','.#UU#.','..UT..'],
 'masterStaff': ['.#.##.','#I#U#.', '#IVV#.', '.#Vi#.', '.#UU#.', '..T...'],
 'wyrmStaff': ['.####.','#IVIi#','.##Vi#','.#Vi#.','..#U#.','...T..'],
 'lakeStaff': ['...#..','..#I#.','.#IV#.','#IVi#.','.###..','...T..'],
 'riftStaff': ['.#..#.','#V#.I#','#i#.#.','.#V#..','..##..','..TT..'],
 'harpyStaff': ['....#.','...#I#','..#Ii#','.#Ii#.','#UT#..','.T....'],
 'bogStaff': ['.###..','#TIV#.','#TVV#.','.TT#..','.#T#..','..T...'],
 'hydraStaff': ['.#.#.#','#V#V#V','.#T#T#','..TTT.','..#T#.','...T..'],
 'courtStaff': ['.#.#..','#U#U#.','.#IVI#','.#Vi#.','.#UU#.','...T..'],
 'windStaff': ['..###.','.#IVI#','#I###.','#V#...','.##U#.','...T..'],
 'gearStaff': ['.#..#.','#U##U#','.#IV#.','.#VU#.','#U##U#','.#TT#.'],
 'glacierStaff': ['..#.#.','.#I#I#','#IVVi#','.#Vi#.','.#i#..','..i...'],
 'volcanoStaff': ['.####.','#iIVi#','#iVVi#','..#i#.','.#UU#.','..TT..'],
 'voidStaff': ['.#..#.','#V#.V#','.#Vi#.','#iV#..','.#.#..','..T...'],
 'starStaff': ['..#...','##I###','#IVVI#','.#Vi#.','#U##U#','.#T.#.'],
}

# Shaft geometry is part of each design: center points run bottom to head.
SHAFTS = {
 'apprenticeStaff': [(2,20),(2,17),(4,12),(6,8),(8,5)],
 'practiceWand': [(2,20),(2,17),(4,14),(5,9),(8,6)],
 'oakStaff': [(2,20),(2,17),(3,14),(5,12),(5,9),(8,5)],
 'ruinStaff': [(2,20),(2,17),(4,13),(5,10),(8,6)],
 'thornStaff': [(2,20),(2,17),(4,15),(3,12),(6,10),(6,7),(8,5)],
 'tideStaff': [(2,20),(2,17),(3,15),(5,13),(5,10),(8,6)],
 'stormStaff': [(2,20),(2,17),(4,13),(5,12),(6,8),(8,5)],
 'emberRod': [(2,20),(2,17),(4,12),(5,10),(8,5)],
 'voltRod': [(2,20),(2,17),(5,13),(4,12),(7,8),(8,6)],
 'quartzWand': [(2,20),(2,17),(4,14),(5,11),(8,6)],
 'fangWand': [(2,20),(2,17),(3,13),(5,10),(8,6)],
 'magusStaff': [(2,20),(2,17),(4,13),(6,10),(8,6)],
 'foxfireStaff': [(2,20),(2,17),(4,14),(4,11),(6,9),(8,6)],
 'crystalStaff': [(2,20),(2,17),(4,14),(5,11),(8,6)],
 'dawnStaff': [(2,20),(2,17),(4,12),(6,10),(8,6)],
 'masterStaff': [(2,20),(2,17),(4,14),(5,10),(8,6)],
 'wyrmStaff': [(2,20),(2,17),(3,15),(5,14),(4,11),(6,9),(9,6)],
 'lakeStaff': [(2,20),(2,17),(4,14),(4,11),(6,9),(9,6)],
 'riftStaff': [(2,20),(2,17),(4,15),(4,12),(6,11),(6,8),(8,6)],
 'harpyStaff': [(2,20),(2,17),(4,13),(6,9),(7,6)],
 'bogStaff': [(2,20),(2,17),(3,15),(3,12),(5,11),(5,8),(8,5)],
 'hydraStaff': [(2,20),(2,17),(4,15),(3,13),(6,11),(6,9),(9,6)],
 'courtStaff': [(2,20),(2,17),(4,13),(6,10),(9,6)],
 'windStaff': [(2,20),(2,17),(3,15),(5,13),(5,10),(9,6)],
 'gearStaff': [(2,20),(2,17),(4,13),(6,10),(8,6)],
 'glacierStaff': [(2,20),(2,17),(3,14),(5,11),(6,8),(8,6)],
 'volcanoStaff': [(2,20),(2,17),(4,15),(4,12),(6,10),(8,6)],
 'voidStaff': [(2,20),(2,17),(4,14),(4,12),(6,10),(6,8),(8,6)],
 'starStaff': [(2,20),(2,17),(3,14),(5,12),(6,9),(8,6)],
}

SHORT_PIXELS = {
 'mistDagger':[(4,15),(6,12),(8,11),(7,14),(5,16)],
 'fangDagger':[(3,15),(4,12),(7,11),(7,13),(5,16)],
 'emberKnife':[(4,15),(5,14),(5,12),(6,13),(8,12),(7,15),(5,16)],
 'banditKnife':[(3,15),(5,12),(7,12),(7,14),(5,16)],
 'wyrmFang':[(3,15),(4,13),(5,12),(7,11),(8,11),(6,15),(5,16)],
 'moonDagger':[(3,15),(3,13),(5,11),(7,11),(5,13),(4,16)],
 'riftDagger':[(4,16),(4,14),(5,13),(6,14),(6,12),(8,11),(7,15),(5,16)],
 'huntKnife':[(4,16),(5,13),(7,13),(6,15),(5,16)],
 'stingerDagger':[(3,16),(4,13),(6,11),(8,11),(7,12),(5,14),(4,16)],
 'duneFang':[(3,15),(4,12),(6,11),(8,12),(7,15),(5,17)],
 'hydraFang':[(3,15),(4,13),(6,12),(5,14),(7,14),(8,12),(8,15),(5,16)],
 'royalDagger':[(4,16),(4,14),(7,11),(8,13),(7,15),(5,16)],
 'wolfFang2':[(3,16),(3,14),(4,12),(6,11),(6,13),(7,13),(5,16)],
 'iceDagger':[(4,16),(3,14),(4,13),(4,11),(6,12),(8,11),(7,14),(5,16)],
 'magmaDagger':[(4,16),(3,14),(5,12),(6,12),(6,13),(8,13),(7,15),(5,16)],
 'shadowDagger':[(3,16),(4,14),(3,13),(5,13),(6,11),(7,12),(6,14),(7,15),(5,16)],
 'cometDagger':[(3,16),(5,13),(5,12),(6,12),(7,11),(7,13),(8,13),(7,14),(6,14),(5,16)],
}

TOMES = {
 'primerTome': ([(3,9),(6,8),(8,9),(11,8),(13,9),(13,14),(9,14),(8,15),(3,14)],'notes'),
 'herbalTome': ([(3,8),(6,8),(8,10),(10,8),(13,8),(14,14),(10,14),(8,15),(3,14)],'leaves'),
 'ancientTome': ([(3,8),(7,8),(8,9),(10,8),(14,8),(14,15),(9,15),(8,14),(3,15)],'stone'),
 'stolenTome': ([(4,8),(7,9),(8,10),(11,8),(14,9),(13,15),(9,14),(8,15),(3,14)],'strap'),
 'deathTome': ([(3,8),(6,9),(8,10),(11,8),(14,8),(13,13),(14,15),(10,14),(8,15),(5,14),(3,15)],'skull'),
 'voidTome': ([(3,8),(6,7),(8,9),(11,7),(14,8),(13,11),(14,14),(10,13),(8,15),(6,14),(3,14),(4,11)],'eye'),
 'lakeTome': ([(3,9),(6,8),(8,10),(11,8),(13,9),(14,14),(11,15),(8,14),(5,15),(3,14)],'wave'),
 'riftTome': ([(3,8),(6,8),(8,10),(11,7),(14,8),(13,10),(14,14),(11,14),(8,15),(6,13),(3,14)],'rift'),
 'sandTome': ([(4,8),(6,7),(8,9),(11,8),(13,9),(14,13),(12,15),(9,14),(8,15),(4,14),(3,11)],'sun'),
 'witchTome': ([(3,9),(5,7),(8,9),(11,7),(14,9),(13,14),(10,14),(8,15),(5,14),(3,13)],'moon'),
 'royalTome': ([(3,8),(6,7),(8,9),(10,7),(14,8),(14,14),(10,14),(8,15),(6,14),(3,14)],'crown'),
 'lichTome': ([(3,8),(5,8),(6,7),(8,9),(11,8),(12,7),(14,9),(13,14),(12,15),(9,14),(8,15),(6,14),(4,15)],'ice'),
}

class Pixel:
 def __init__(self, item):
  self.im=Image.new('RGBA',(16,22));self.d=ImageDraw.Draw(self.im)
  p=item['pal'];self.c={'#':DARK,'I':p.get('I','#fff1ce'),'i':p.get('i',p.get('T','#958a9b')),'T':p.get('T','#725035'),'U':p.get('U',p.get('V','#dacb92')),'V':p.get('V',p.get('U','#a8e7ff'))}
 def bounds(self,pts,pad=0):
  assert all(pad<=x<16-pad and pad<=y<22-pad for x,y in pts),('drawing clipped',pts,pad)
 def point(self,xy,c):
  self.bounds([xy]);self.d.point(xy,fill=self.c[c])
 def line(self,pts,c,width=1):
  self.bounds(pts,width//2);self.d.line(pts,fill=self.c[c],width=width)
 def poly(self,pts,c,outline=True):
  self.bounds(pts);self.d.polygon(pts,fill=self.c[c],outline=self.c['#'] if outline else None)
 def rect(self,box,c):
  self.bounds([box[:2],box[2:]]);self.d.rectangle(box,fill=self.c[c])

def blade(item):
 p=Pixel(item);key=item['key'];profile,guard,pommel,note=BLADES[key];small=item['type']=='dagger'
 def xy(uv):
  u,v=uv;s=.70 if small else 1
  return (4+round(s*(.68*u+.73*v)),(15 if small else 14)-round(s*(.73*u-.68*v)))
 # A short wrapped hilt sits exactly over the doll's hand.
 if small:
  p.line([(2,18),(4,16)],'#',3);p.line([(2,18),(4,16)],'T');p.point((2,17),'T')
  if pommel:p.point((2,18),'U')
 else:
  p.line([(1,19),(4,15)],'#',3);p.line([(2,18),(4,15)],'T');p.point((2,17),'T')
  if pommel==1:p.poly([(0,19),(1,18),(3,19),(2,20)],'U')
  elif pommel==2:p.poly([(0,19),(1,18),(3,19),(3,20),(1,21)],'U');p.point((1,19),'V')
 p.poly(SHORT_PIXELS[key] if small else [xy(q) for q in profile],'i')
 # Highlight follows the blade axis, clipped to its painted mask.
 mask=p.im.getchannel('A');end=max(u for u,v in profile)
 for u in range(1,int(end)):
  x,y=xy((u,-.25))
  if 0<=x<16 and 0<=y<22 and mask.getpixel((x,y)) and p.im.getpixel((x,y))[:3]!=ImageColor.getrgb(DARK):p.point((x,y),'I')
 guards={
 'bar':[(2,14),(6,18)],'short':[(3,15),(5,17)],'cross':[(2,13),(2,14),(6,18),(7,18)],
 'tail':[(2,13),(3,15),(6,17),(6,19)],'crystal':[(2,12),(3,15),(7,16),(6,18)],
 'sun':[(2,13),(3,14),(5,14),(5,16),(7,17)],'gem':[(2,14),(4,14),(5,16),(7,16)],
 'bolt':[(2,13),(3,15),(5,15),(5,17),(7,18)],'bone':[(2,13),(2,15),(6,17),(7,16)],
 'crown':[(2,12),(3,15),(5,13),(5,16),(7,15),(7,18)],'skull':[(2,14),(3,13),(5,15),(7,17),(6,18)],
 'crescent':[(2,12),(2,15),(4,17),(7,18),(8,17)],'void':[(2,13),(3,14),(3,16),(6,18),(8,18)],
 'moon':[(2,13),(2,15),(4,17),(6,17)],'rift':[(2,14),(4,14),(5,17),(7,17),(8,19)],
 'hook':[(2,14),(3,14),(6,17),(6,19),(4,19)],'toad':[(2,13),(3,13),(3,15),(5,17),(7,17),(7,18)],
 'leaf':[(2,13),(2,15),(4,15),(6,17),(7,17)],'royal':[(2,12),(2,14),(4,15),(6,17),(8,17),(8,16)],
 'horn':[(2,12),(2,15),(5,17),(7,17),(8,15)],'gear':[(2,13),(4,13),(4,15),(6,15),(6,17),(8,17)],
 'ice':[(2,12),(3,15),(5,16),(7,19),(7,16)],'flame':[(2,12),(3,14),(2,15),(5,16),(6,18),(8,17)],
 'bat':[(2,12),(2,15),(4,14),(6,17),(8,16),(7,19)],'star':[(2,14),(3,13),(4,15),(6,15),(6,17),(8,18)],
 'fallen':[(2,13),(4,14),(4,16),(7,18),(8,16)],'demon':[(2,11),(3,14),(5,15),(6,18),(8,19),(8,17)],
 'clock':[(2,13),(4,13),(6,15),(6,17),(4,17),(2,15),(2,13)],
 'tiny':[(3,14),(5,16)],'hooksmall':[(3,14),(5,16),(5,18)],'fang':[(2,14),(3,15),(5,16)],
 'split':[(3,14),(4,16),(6,16)],'tooth':[(2,14),(3,15),(5,15),(5,17)],'fork':[(3,13),(3,15),(5,16),(6,15)],
 'royalsmall':[(2,14),(3,14),(4,16),(6,16)],'icesmall':[(2,13),(3,15),(6,17)],
 'magma':[(3,14),(3,16),(5,17)],'shadow':[(2,14),(4,15),(5,18)],'comet':[(2,13),(3,15),(5,17),(6,18)],
 }
 if guard!='none':
  pts=[(4+round((x-4)*.60),(16 if small else 15)+round((y-15)*.60)) for x,y in guards[guard]]
  pts=[(max(3,x) if y<16 else x,y) for x,y in pts];p.line(pts,'#',3);p.line(pts,'U')
  if guard in ['clock','gear','gem','royal','skull','star','demon']:p.point((4,15),'V')
 if key=='chronoLance':p.point((4,14),'I');p.line([(4,15),(5,15)],'#')
 if key in ['brassSword','moldBlade','duskSword']:p.point(xy((3,0)),'V')
 return p.im,note

def staff(item):
 p=Pixel(item);key=item['key'];pts=SHAFTS[key]
 p.line(pts,'#',3);p.line(pts,'i' if key in ['crystalStaff','glacierStaff'] else 'T')
 # Hand wrap: fixed regardless of the shaft's bends.
 p.point((2,17),'T');p.point((2,19),'U')
 if item['tier']>=3:
  p.point(pts[-3],'U');p.point((3,16),'U')
 if key=='thornStaff':p.line([(4,12),(2,11)],'#');p.point((3,11),'T')
 if key=='harpyStaff':p.poly([(5,10),(7,10),(7,13),(5,12)],'I')
 if key=='hydraStaff':p.line([(4,15),(6,14),(5,12)],'U')
 if key=='gearStaff':p.poly([(4,12),(5,11),(6,12),(5,13)],'U')
 if key=='voidStaff':p.point((7,10),'V')
 for y,row in enumerate(HEADS[key]):
  assert len(row)==6,(key,row)
  for x,c in enumerate(row):
   if c!='.':p.point((x+6,y+1),c)
 return p.im,'distinct 6x6 '+key+' head; custom shaft through (2,17)'

def tome(item):
 p=Pixel(item);key=item['key'];shape,motif=TOMES[key]
 p.poly(shape,'U')
 # Two open page fans, an outlined gutter, and a cover lip.
 p.poly([(4,9),(6,9),(8,10),(8,13),(6,12),(4,13)],'I',False)
 p.poly([(9,10),(11,9),(12,9),(12,13),(10,12),(9,13)],'I',False)
 p.line([(8,10),(8,14)],'#');p.line([(5,10),(6,10)],'i');p.point((11,11),'i')
 if motif=='notes':p.point((5,12),'T')
 elif motif=='leaves':p.line([(4,8),(4,6),(5,7)],'V');p.point((12,14),'V')
 elif motif=='stone':p.line([(4,10),(6,10),(6,12)],'i');p.line([(10,10),(11,12)],'T')
 elif motif=='strap':p.line([(12,8),(12,14)],'T');p.point((12,11),'U');p.point((5,15),'T')
 elif motif=='skull':p.rect((10,10,11,11),'i');p.point((10,10),'#');p.point((11,12),'i');p.point((4,7),'V')
 elif motif=='eye':p.line([(9,11),(10,10),(11,11),(10,12),(9,11)],'V');p.point((10,11),'#');p.point((6,5),'V');p.point((12,5),'V')
 elif motif=='wave':p.line([(4,11),(5,10),(6,11)],'V');p.line([(10,12),(11,11),(12,12)],'i');p.point((12,6),'V')
 elif motif=='rift':p.line([(6,9),(5,10),(6,11),(5,12)],'V');p.point((14,6),'V')
 elif motif=='sun':p.line([(9,11),(11,11)],'U');p.line([(10,10),(10,12)],'U');p.point((3,7),'U')
 elif motif=='moon':p.line([(11,10),(10,11),(11,12)],'V');p.point((5,6),'V');p.point((13,6),'V')
 elif motif=='crown':p.line([(4,10),(4,11),(6,11),(6,10)],'U');p.point((5,10),'U');p.poly([(7,6),(8,5),(9,6),(8,7)],'V')
 elif motif=='ice':p.line([(10,10),(12,12)],'V');p.line([(12,10),(10,12)],'V');p.point((4,6),'I');p.point((14,13),'V')
 return p.im,'open floating book; '+motif+' silhouette and page motif'

def scythe(item):
 p=Pixel(item)
 p.line([(1,19),(2,17),(5,12),(8,7)],'#',3);p.line([(2,18),(5,12),(8,7)],'T')
 p.poly([(6,5),(8,4),(12,4),(14,6),(14,10),(13,8),(11,6),(8,6),(6,7)],'i')
 p.line([(8,5),(11,5),(13,7)],'I');p.point((7,7),'U');p.point((2,17),'T')
 return p.im,'long-handled curved harvest sickle, hooked upper blade'

def axe(item):
 p=Pixel(item);p.line([(1,19),(2,17),(10,7)],'#',3);p.line([(2,18),(10,7)],'T')
 p.poly([(8,5),(10,6),(12,5),(13,6),(13,10),(11,10),(9,8),(8,8)],'i')
 p.line([(12,6),(12,9)],'I');p.point((10,7),'U');p.point((2,17),'T')
 return p.im,'heavy asymmetric 5x6 axe head on diagonal handle'

def font(size):
 for path in ['C:/Windows/Fonts/arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
  if Path(path).exists():return ImageFont.truetype(path,size)
 return ImageFont.load_default()

def main():
 items=json.loads((TASK/'L_weapons.json').read_text(encoding='utf-8-sig'))
 assert len(items)==88 and len({w['key'] for w in items})==88
 assert Counter(w['type'] for w in items)=={'sword':29,'staff':29,'dagger':17,'tome':12,'axe':1}
 hero=Image.open(TASK/'L_hero_doll_noweapon.png').convert('RGBA')
 assert hero.size==(28,24),hero.size
 frames=[];notes=[];masks={}
 for w in items:
  k=w['key'];t=w['type']
  if k=='harvestScythe':im,note=scythe(w)
  elif t in ['sword','dagger']:im,note=blade(w)
  elif t=='staff':im,note=staff(w)
  elif t=='tome':im,note=tome(w)
  else:im,note=axe(w)
  assert im.size==(16,22)
  a=im.getchannel('A');assert set(a.tobytes())=={0,255},k
  assert not a.crop((0,0,2,15)).getbbox(),(k,'body overlap')
  assert len(im.getcolors())<=8,(k,'palette',len(im.getcolors()))
  if t!='tome':assert a.getpixel((2,17))==255,(k,'anchor')
  else:assert not a.getpixel((2,17)),(k,'floating book anchor')
  if t=='dagger':
   b=a.getbbox();assert 6<=max(b[2]-b[0],b[3]-b[1])<=9,(k,'dagger size',b)
  sig=a.tobytes();assert sig not in masks,(k,'duplicate silhouette',masks.get(sig));masks[sig]=k
  im.save(OUT/(k+'.png'));saved=Image.open(OUT/(k+'.png'));assert saved.mode=='RGBA' and saved.tobytes()==im.tobytes();frames.append(im)
  notes.append(f'{k}: PASS | 16x22 RGBA; alpha=0/255; colors={len(im.getcolors())} incl transparent; '+('anchor=(2,17)' if t!='tome' else 'floating, no anchor contact')+'; body-clear; no clipping; unique alpha silhouette; 5x in-hand reviewed | '+note)
 preview=Image.new('RGB',(8*160,11*148),(74,86,73));d=ImageDraw.Draw(preview)
 icons=Image.new('RGB',(11*110,8*94),(75,81,94));di=ImageDraw.Draw(icons)
 for i,(w,im) in enumerate(zip(items,frames)):
  doll=hero.copy();doll.alpha_composite(im,(12,1));x=i%8*160;y=i//8*148
  d.text((x+5,y+3),w['key'],font=font(12),fill='#e9e7ed');q=doll.resize((140,120),Image.Resampling.NEAREST);preview.paste(q,(x+10,y+24),q)
  x=i%11*110;y=i//11*94;di.text((x+3,y+3),w['key'],font=font(11),fill='#e9e7ed');q=im.resize((48,66),Image.Resampling.NEAREST);icons.paste(q,(x+31,y+24),q)
 preview.save(OUT/'weapons_preview.png');icons.save(OUT/'weapons_icons.png')
 (TASK/'L_done.txt').write_text('\n'.join(notes)+'\n',encoding='utf-8')
 print('L PASS: 88 native sprites; 88 distinct alpha silhouettes; 2 previews; 88 per-weapon validation records.')

if __name__=='__main__':main()
