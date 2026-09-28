"""Task M native pixel wardrobe. Python + Pillow; no downsampling or AI images.

Run from any directory: python art/battle/armor/gen_armor.py
Input: ../tasks/M_armor.json, M_acc.json and the two native back-view dolls.
All geometry is authored on the target integer grid. Masks constrain overlays to
the base silhouette expanded by one pixel, and checks inspect saved PNG files.
"""
from pathlib import Path
from collections import Counter
import json
from PIL import Image, ImageDraw, ImageFont, ImageColor, ImageFilter

OUT=Path(__file__).resolve().parent
TASK=OUT.parent/'tasks'
DARK='#2a2238'

# Individual back-view crowns, shells and hoods, plus their structural motif.
# Coordinates reference the supplied doll, not a rescaled character.
HEAD={
 'clothCap':([(2,4),(4,2),(8,2),(11,3),(13,5),(13,6),(2,6)],'stitched'),
 'guardHelm':([(2,4),(4,2),(10,2),(13,4),(14,7),(13,9),(2,9),(1,6)],'rim'),
 'knightHelm':([(2,4),(5,1),(9,2),(12,3),(14,5),(14,10),(12,12),(3,12),(1,9),(1,5)],'ridge'),
 'golemVisor':([(2,3),(6,2),(11,3),(13,5),(14,9),(12,11),(4,11),(1,9),(1,5)],'stone'),
 'minerHelm':([(2,4),(5,2),(10,2),(13,4),(14,7),(13,8),(2,8),(1,6)],'lamp'),
 'banditHood':([(5,1),(8,2),(12,3),(14,5),(14,10),(11,12),(4,12),(1,10),(1,5),(3,3)],'hoodseam'),
 'hunterCap':([(1,5),(4,3),(8,2),(12,4),(13,6),(11,7),(2,7)],'feather'),
 'boneHelm':([(2,4),(5,2),(10,3),(13,4),(14,9),(12,11),(3,11),(1,8)],'bonehorns'),
 'thornCrown':([(1,5),(3,4),(4,3),(5,5),(7,3),(8,5),(11,4),(13,5),(14,7),(10,7),(7,6),(3,7),(1,6)],'thorns'),
 'prismCrown':([(2,5),(3,2),(5,4),(7,1),(9,4),(12,2),(13,6),(12,7),(3,7)],'prism'),
 'reedHat':([(1,6),(4,4),(7,2),(10,3),(13,5),(14,6),(12,8),(3,8)],'weave'),
 'riftHelm':([(2,4),(5,2),(10,2),(13,4),(14,10),(11,12),(4,12),(1,10)],'rifthorns'),
 'desertTurban':([(2,4),(5,2),(9,2),(12,3),(14,6),(13,9),(3,9),(1,7)],'wrap'),
 'rhinoHelm':([(2,4),(4,2),(10,3),(13,4),(14,8),(13,11),(3,11),(1,8)],'rhinohorns'),
 'witchHat':([(1,8),(3,6),(5,3),(6,1),(7,0),(9,2),(9,4),(11,6),(14,8),(13,9),(2,9)],'hatband'),
 'royalHelm':([(2,3),(6,1),(10,2),(13,4),(14,9),(12,12),(3,11),(1,8)],'royalcrest'),
 'wolfHood':([(2,4),(3,2),(6,3),(9,2),(12,3),(14,5),(14,10),(12,12),(3,12),(1,9)],'ears'),
 'clockHelm':([(2,4),(5,2),(11,2),(13,4),(14,8),(12,11),(3,11),(1,8),(1,5)],'gear'),
 'frostHood':([(5,1),(8,2),(11,2),(13,4),(14,6),(14,10),(12,12),(4,12),(1,10),(1,5)],'fur'),
 'salamanderHelm':([(2,4),(5,2),(9,2),(12,3),(14,5),(14,9),(11,12),(4,11),(1,9)],'flamehorns'),
 'duskHelm':([(2,3),(5,2),(10,3),(13,3),(14,8),(13,11),(10,12),(3,11),(1,8)],'duskhorns'),
 'starCrown':([(2,6),(3,3),(5,5),(7,1),(9,5),(12,3),(13,6),(12,8),(3,8)],'stars'),
 'ratCrown':([(2,6),(2,3),(5,5),(6,2),(9,5),(12,4),(13,7),(11,8),(3,8)],'crooked'),
 'boarHelm':([(2,4),(4,3),(8,2),(12,3),(14,5),(13,10),(11,11),(3,11),(1,8)],'tusks'),
 'frostTiara':([(2,6),(3,4),(5,5),(7,2),(9,5),(11,3),(13,5),(13,7),(3,7)],'icicles'),
}

# Body design: silhouette, hem style, and a deliberately assigned material motif.
BODY={
 'uniform':('tunic','flat','uniform'),
 'leather':('tunic','short','seam'), 'hunterLeather':('tunic','split','quiverstrap'),
 'frogCloak':('cloak','round','frogspots'), 'chainMail':('mail','short','links'),
 'scaleArmor':('mail','split','scales'), 'stoneMail':('plate','square','stoneblocks'),
 'mistCloak':('cloak','slant','mistfold'), 'silkRobe':('robe','long','web'),
 'runeMantle':('cloak','notch','runes'), 'boneKnightMail':('plate','split','ribs'),
 'ruinMail':('plate','short','tablet'), 'wolfMantle':('cloak','fur','wolfpelt'),
 'wandererCloak':('cloak','torn','travelpatch'), 'wyrmMail':('plate','split','fins'),
 'crabMail':('plate','round','shell'), 'riftMail':('plate','notch','rift'),
 'riftRobe':('robe','split','constellation'), 'scorpMail':('plate','square','segments'),
 'treantMail':('plate','torn','bark'), 'hydraScale':('mail','notch','triplescale'),
 'batCloak':('cloak','bat','wingmembrane'), 'royalMail':('plate','short','royal'),
 'courtRobe':('robe','long','braid'), 'rustMail':('mail','square','rivets'),
 'clockMail':('plate','split','gears'), 'yetiFur':('cloak','fur','whitefur'),
 'magmaPlate':('plate','notch','lavacracks'), 'duskPlate':('plate','torn','spikes'),
 'shadowRobe':('robe','torn','shadow'), 'starRobe':('robe','notch','stars'),
 'blackCloak':('cloak','feather','feathers'), 'bearMantle':('cloak','round','bearfur'),
 'dragonMail':('mail','bat','dragonwings'),
}

# Feet: individual cuff heights, outside profile and heel/cuff construction.
FEET={
 'schoolShoes':(2,'low','school'), 'travelBoots':(3,'plain','seam'),
 'mistBoots':(4,'round','fold'), 'featherBoots':(3,'wing','feather'),
 'knightGreaves':(4,'plate','steel'), 'hunterBoots':(3,'soft','lace'),
 'minerBoots':(3,'wide','toecap'), 'shadowBoots':(4,'slim','cross'),
 'ancientGreaves':(4,'flange','rune'), 'crocBoots':(4,'scale','scales'),
 'reedBoots':(4,'reed','stalk'), 'lakeBoots':(4,'round','water'),
 'riftBoots':(4,'point','rift'), 'sandBoots':(3,'wide','wrap'),
 'mireBoots':(4,'soft','mud'), 'royalGreaves':(4,'plate','royal'),
 'wheatBoots':(3,'reed','wheat'), 'springBoots':(4,'flange','spring'),
 'snowBoots':(4,'fur','fur'), 'lavaBoots':(4,'wide','lava'),
 'voidBoots':(4,'slim','void'), 'starBoots':(4,'wing','star'),
}

def rgb(c):return ImageColor.getrgb(c)
def lighten(c):return tuple(min(255,round(v*.7+255*.3)) for v in rgb(c))

class Pix:
 def __init__(self,size,pal,mask=None):
  self.im=Image.new('RGBA',size);self.pal=pal;self.mask=mask
 def draw(self,method,*args,fill='M',outline=None,width=1):
  layer=Image.new('RGBA',self.im.size);d=ImageDraw.Draw(layer)
  kw={'fill':self.pal[fill]}
  if method in ['polygon','rectangle','ellipse'] and outline:kw['outline']=self.pal[outline]
  if method=='line':kw['width']=width
  getattr(d,method)(*args,**kw)
  if self.mask:
   a=layer.getchannel('A');a.putdata([min(u,v) for u,v in zip(a.tobytes(),self.mask.tobytes())]);layer.putalpha(a)
  self.im.alpha_composite(layer)
 def pt(self,x,y,c='H'):self.draw('point',(x,y),fill=c)
 def line(self,pts,c='S',w=1):self.draw('line',pts,fill=c,width=w)
 def poly(self,pts,c='M',edge=True):self.draw('polygon',pts,fill=c,outline='#' if edge else None)
 def box(self,b,c='M',edge=False):self.draw('rectangle',b,fill=c,outline='#' if edge else None)
 def oval(self,b,c='M',edge=True):self.draw('ellipse',b,fill=c,outline='#' if edge else None)
 def cut(self,pts):ImageDraw.Draw(self.im).polygon(pts,fill=(0,0,0,0))
 def outline(self):
  # Reassert a one-pixel outline on the inside of each exposed component.
  a=self.im.getchannel('A');w,h=self.im.size
  for y in range(h):
   for x in range(w):
    if a.getpixel((x,y)) and any(xx<0 or yy<0 or xx>=w or yy>=h or not a.getpixel((xx,yy)) for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]):self.im.putpixel((x,y),rgb(DARK)+(255,))
  return self.im

def palette(w):
 p=w.get('pal',{});s=w.get('slot')
 if s=='head':return {'#':DARK,'M':p['A'],'S':p['a'],'H':p['C'],'A':p.get('E',p['C']),'G':p.get('E',p['C']),'C':p['A']}
 if s=='body':
  p=p or {'X':'#2e3c70','x':'#202a50','Y':'#f4e8db','Z':'#d8683a','z':'#d8b048'}
  return {'#':DARK,'M':p['X'],'S':p['x'],'H':p.get('Y',p.get('W',p['X'])),'A':p.get('Z',p['x']),'G':p.get('z',p.get('W',p.get('Z',p['X']))),'C':p.get('D',p['X'])}
 p=p or {'B':'#30303a','b':'#1c1c24'}
 return {'#':DARK,'M':p['B'],'S':p['b'],'H':lighten(p['B']),'A':p.get('P',p['B']),'G':p.get('p',p['b']),'C':p['B']}

def allowed(base,slot):
 a=base.getchannel('A').filter(ImageFilter.MaxFilter(3));lo,hi={'head':(0,12),'body':(11,19),'feet':(17,21)}[slot]
 d=ImageDraw.Draw(a)
 if lo:d.rectangle((0,0,15,lo-1),fill=0)
 if hi<21:d.rectangle((0,hi+1,15,21),fill=0)
 return a

def head(w,base=None,icon=False):
 pts,m=HEAD[w['key']];p=Pix((16,16) if icon else (16,22),palette(w),None if icon else allowed(base,'head'));dy=1 if icon else 0
 def poly(q,c='M',edge=True):p.poly([(x,y+dy) for x,y in q],c,edge)
 def line(q,c='S',ww=1):p.line([(x,y+dy) for x,y in q],c,ww)
 def dot(x,y,c='H'):p.pt(x,y+dy,c)
 poly(pts)
 # Highlights shade the shell only, never leave floating pixels beside a cap.
 previous_mask=p.mask;p.mask=p.im.getchannel('A')
 line([(3,5),(4,3),(7,3)],'H');line([(12,5),(13,8),(11,10)],'S');p.mask=previous_mask
 if m=='stitched':line([(3,5),(11,5)],'S');dot(5,3);dot(9,4)
 elif m=='rim':line([(2,7),(13,7)],'S');line([(4,6),(10,6)],'H')
 elif m=='ridge':line([(7,2),(7,11)],'S');line([(6,3),(6,10)],'H');line([(3,9),(4,11),(11,11),(13,9)],'A')
 elif m=='stone':line([(3,6),(12,6)],'#');line([(6,3),(6,5),(8,7),(8,10)],'S');dot(10,4)
 elif m=='lamp':line([(2,6),(13,6)],'S');poly([(6,2),(9,2),(10,4),(8,5),(6,4)],'A');dot(7,3,'H')
 elif m=='hoodseam':line([(7,2),(6,5),(7,8),(6,11)],'S');line([(3,9),(4,11),(11,11)],'H')
 elif m=='feather':poly([(9,5),(10,2),(12,1),(12,3),(11,5)],'A');line([(3,6),(9,6)],'S')
 elif m in ['bonehorns','rifthorns','rhinohorns','flamehorns','duskhorns','tusks']:
  horns={
   'bonehorns':([(1,2),(3,3),(4,5),(2,5)],[(12,5),(13,2),(14,2),(14,4)]),
   'rifthorns':([(1,2),(2,3),(4,4),(3,6)],[(11,4),(13,2),(14,3),(12,6)]),
   'rhinohorns':([(1,4),(2,2),(4,4),(4,6)],[(12,6),(12,4),(14,2),(14,5)]),
   'flamehorns':([(1,3),(3,4),(2,5),(4,6)],[(11,5),(12,3),(14,2),(13,5)]),
   'duskhorns':([(1,2),(2,4),(4,5),(3,7)],[(11,5),(13,4),(14,2),(14,6),(12,7)]),
   'tusks':([(1,5),(2,7),(4,6),(3,3)],[(12,3),(12,6),(14,7),(14,5)]),
  }[m]
  for h in horns:poly(h,'H')
  line([(4,8),(11,8)],'S');line([(7,3),(8,6),(7,10)],'A')
  if m=='flamehorns':poly([(6,3),(7,1),(8,3),(9,2),(10,5),(7,5)],'H')
  if m=='tusks':line([(7,3),(7,9)],'S');dot(6,5,'H')
 elif m=='thorns':
  line([(2,6),(5,5),(8,6),(12,5)],'S')
  for x,y in [(3,4),(7,4),(11,5)]:dot(x,y,'H');dot(x+1,y,'A')
 elif m=='prism':line([(4,4),(4,6)],'H');line([(7,2),(7,6)],'H');line([(11,4),(11,6)],'A')
 elif m=='weave':
  for q in [[(4,5),(10,5)],[(2,6),(12,6)],[(5,4),(9,4)],[(6,3),(8,6)]]:line(q,'H')
 elif m=='wrap':line([(3,4),(9,3),(12,5)],'H');line([(2,6),(11,4)],'S');poly([(11,7),(13,7),(13,12),(11,11)],'M');dot(11,5,'A')
 elif m=='hatband':line([(4,6),(10,6)],'A');poly([(9,6),(11,6),(11,8),(9,8)],'H');dot(7,2,'S')
 elif m=='royalcrest':poly([(6,1),(8,1),(9,3),(8,6),(6,5)],'A');line([(4,10),(11,10)],'H');line([(7,7),(7,11)],'S')
 elif m=='ears':
  poly([(2,4),(2,2),(4,2),(5,5)],'M');poly([(10,4),(12,2),(13,3),(13,6)],'M');line([(4,10),(5,11),(7,10),(9,11),(11,10)],'H')
 elif m=='gear':
  poly([(5,4),(6,3),(8,3),(9,4),(10,4),(10,7),(8,9),(6,8),(5,7)],'S');poly([(6,5),(8,4),(9,6),(8,7),(6,7)],'H');dot(7,6,'A');line([(3,10),(12,10)],'A')
 elif m=='fur':
  line([(2,5),(3,4),(4,4),(5,3),(10,3),(12,5)],'H');line([(2,9),(4,10),(5,11),(7,10),(9,11),(12,10),(13,8)],'H');line([(7,4),(8,8)],'S')
 elif m=='stars':
  for x,y in [(7,4),(4,6),(11,6)]:dot(x,y,'H');dot(x,y-1,'H');dot(x-1,y,'H');dot(x+1,y,'H')
 elif m=='crooked':line([(3,6),(11,7)],'S');dot(6,4,'H');dot(10,6,'H')
 elif m=='icicles':line([(3,6),(12,6)],'H');line([(7,3),(7,6)],'H');dot(5,5,'A');dot(10,5,'A')
 if icon and any(s in w['shape'] for s in ['helm','hood']) and w['key'] not in ['witchHat','prismCrown']:
  # The loot icon is a front shell: no face, just its empty visor/hood opening.
  p.poly([(4,8),(11,8),(11,11),(9,12),(6,12),(4,11)],'S');p.line([(5,9),(10,9)],'#')
  if 'hood' not in w['shape']:p.line([(8,9),(8,12)],'M')
 return p.im

def motif(p,name,x,y):
 # 7x5 structural details, shared front/back material language.
 def l(q,c='S'):p.line([(x+a,y+b) for a,b in q],c)
 def d(a,b,c='H'):p.pt(x+a,y+b,c)
 if name=='seam':l([(3,0),(3,4)]);l([(1,1),(1,3)],'H')
 elif name=='quiverstrap':l([(0,0),(5,4)],'A');l([(1,0),(6,4)],'S');d(4,2,'G')
 elif name=='frogspots':
  for a,b in [(0,1),(3,0),(5,2),(2,3),(6,4)]:d(a,b,'S')
 elif name=='links':
  for b in [0,2,4]:
   for a in [b%3,3+b%2,6]:d(a,b,'H');d(a,b+1 if b<4 else b,'S')
 elif name=='scales':
  for a,b in [(0,0),(3,0),(1,2),(4,2)]:l([(a,b),(a+1,b+1),(a+2,b)],'H')
 elif name=='stoneblocks':l([(0,1),(6,1)]);l([(2,0),(2,2),(5,2),(5,4)]);d(1,0)
 elif name=='mistfold':l([(1,0),(2,4)],'H');l([(4,0),(4,3),(5,4)]);l([(0,4),(3,4)],'A')
 elif name=='web':
  for q in [[(3,0),(3,4)],[(0,1),(6,4)],[(6,1),(0,4)],[(1,1),(3,2),(5,1)]]:l(q,'A')
 elif name=='runes':
  l([(0,0),(2,0),(1,1),(1,3)],'A');l([(4,0),(4,3),(6,2)],'A');d(3,4,'G')
 elif name=='ribs':
  l([(3,0),(3,4)],'A')
  for b in [0,2,4]:l([(0,b),(2,b+1 if b<4 else b)],'H');l([(4,b+1 if b<4 else b),(6,b)],'H')
 elif name=='tablet':l([(0,0),(5,0),(5,3),(1,3),(1,1)],'S');d(3,1,'A');d(3,2,'A')
 elif name in ['wolfpelt','whitefur','bearfur']:
  pts={'wolfpelt':[(0,0),(2,1),(3,0),(5,1),(6,0)],'whitefur':[(0,0),(1,1),(2,0),(3,2),(4,0),(6,1)],'bearfur':[(0,1),(1,0),(2,1),(3,1),(4,0),(6,1)]}[name]
  l(pts,'H');l([(2,2),(3,3),(4,2)],'S');d(1,4,'H');d(5,3,'H')
 elif name=='travelpatch':l([(1,0),(1,4)]);p.box((x+4,y+1,x+6,y+3),'S');d(4,1,'H');d(6,3,'H')
 elif name=='fins':l([(3,0),(3,4)],'A');l([(0,1),(2,2),(0,3)],'H');l([(6,1),(4,2),(6,3)],'H')
 elif name=='shell':l([(0,1),(2,0),(4,0),(6,1)],'H');l([(0,2),(3,3),(6,2)]);l([(3,0),(3,4)],'A')
 elif name=='rift':l([(2,0),(4,1),(2,2),(4,3),(3,4)],'A');d(0,2,'H');d(6,1,'H')
 elif name=='constellation':l([(0,1),(2,0),(4,3),(6,2)],'A');d(0,1,'G');d(4,3,'G');d(6,2,'G')
 elif name=='segments':
  for b in [0,2,4]:l([(0,b),(3,b+1 if b<4 else b),(6,b)],'H')
 elif name=='bark':l([(1,0),(2,1),(1,3),(2,4)]);l([(5,0),(4,2),(5,4)]);l([(3,1),(4,0)],'A');d(0,3,'A')
 elif name=='triplescale':
  for a in [0,2,4]:l([(a,0),(a+1,1),(a,2),(a+1,3),(a,4)],'H')
 elif name=='wingmembrane':
  for q in [[(3,0),(0,4)],[(3,0),(3,4)],[(3,0),(6,4)]]:l(q,'S')
  l([(0,3),(2,2),(3,3),(4,2),(6,3)],'H')
 elif name=='royal':l([(1,1),(2,2),(3,0),(4,2),(5,1),(5,3),(1,3),(1,1)],'A');d(3,2,'H')
 elif name=='braid':l([(1,0),(2,1),(1,2),(2,3),(1,4)],'A');l([(5,0),(4,1),(5,2),(4,3),(5,4)],'A')
 elif name=='rivets':
  for a,b in [(0,0),(3,0),(6,0),(1,2),(4,2),(0,4),(6,4)]:d(a,b,'H')
  l([(2,1),(2,4)],'S')
 elif name=='gears':l([(1,0),(3,0),(4,1),(4,3),(3,4),(1,4),(0,3),(0,1),(1,0)],'H');d(2,2,'A');l([(5,1),(6,2),(5,3)],'A')
 elif name=='lavacracks':l([(1,0),(3,1),(2,2),(4,3),(3,4)],'A');l([(4,1),(6,0)],'A');d(0,3,'H')
 elif name=='spikes':l([(0,1),(2,0),(3,2),(4,0),(6,1)],'H');l([(1,4),(3,2),(5,4)],'A')
 elif name=='shadow':l([(0,1),(2,2),(1,4)],'A');l([(5,0),(4,2),(6,3)],'A')
 elif name=='stars':
  l([(2,0),(2,2)],'A');l([(1,1),(3,1)],'A');d(5,3,'G');d(0,4,'G');d(6,0,'H')
 elif name=='feathers':
  for a,b in [(0,0),(3,0),(1,2),(4,2)]:l([(a,b),(a+1,b+2),(a+2,b)],'H')
 elif name=='dragonwings':l([(0,0),(2,1),(1,3),(0,2)],'H');l([(6,0),(4,1),(5,3),(6,2)],'H');l([(3,0),(3,4)],'A')
 elif name=='uniform':l([(0,0),(6,0),(6,4),(0,4),(0,0)],'A');l([(1,2),(5,2)],'S')

def body(w,base,icon=False):
 kind,hem,m=BODY[w['key']];p=Pix((16,16) if icon else (16,22),palette(w),None if icon else allowed(base,'body'))
 if icon:
  bottom=14 if kind in ['robe','cloak'] else 12
  pts=[(5,2),(10,2),(13,4),(14,7),(12,8),(11,bottom),(4,bottom),(3,8),(1,7),(2,4)]
  p.poly(pts,'C' if kind=='cloak' else 'M');p.poly([(5,2),(7,4),(10,2)],'S');p.line([(3,5),(4,8)],'H');motif(p,m,5,7)
  if kind=='plate':p.poly([(2,4),(4,3),(5,5),(3,6)],'H');p.poly([(11,3),(13,4),(13,6),(11,5)],'S')
  if kind=='robe':p.line([(4,13),(11,13)],'A')
  if hem in ['torn','bat','feather']:p.cut([(6,bottom),(7,bottom-1),(8,bottom)])
  if hem=='split':p.cut([(7,bottom),(8,bottom-2),(9,bottom)])
 else:
  bottom=19 if kind in ['robe','cloak'] else 18
  pts=[(4,12),(6,11),(9,11),(11,12),(14,14),(14,16),(12,17),(12,bottom),(3,bottom),(3,17),(1,16),(1,14)]
  if hem=='round':pts=[(4,12),(6,11),(9,11),(12,12),(14,14),(14,16),(12,18),(10,19),(5,19),(3,18),(1,16),(1,14)]
  p.poly(pts,'C' if kind=='cloak' else 'M')
  # Explicit coverage: the coat and sleeves cover all original uniform colours.
  targets={(46,60,112),(106,58,38),(216,104,58),(164,72,42)}
  for y in range(12,18):
   for x in range(16):
    if base.getpixel((x,y))[:3] in targets:p.pt(x,y,'C' if kind=='cloak' else 'M')
  p.line([(4,12),(6,12),(7,13),(9,12),(11,12)],'H');p.line([(3,14),(3,15)],'H');p.line([(12,14),(12,15)],'S')
  if kind=='plate':p.poly([(2,13),(4,12),(5,14),(3,15)],'H');p.poly([(11,12),(13,13),(13,15),(11,14)],'S')
  motif(p,m,5,13)
  if kind in ['tunic','mail','plate']:p.line([(4,17),(11,17)],'A');p.pt(8,17,'G')
  if hem=='slant':p.line([(4,18),(10,19),(12,18)],'S')
  if hem=='notch':p.cut([(7,19),(8,18),(9,19)])
  if hem=='split':p.cut([(7,18),(8,18),(8,19),(7,19)])
  if hem in ['fur','torn','feather','bat']:
   for x in ({'fur':[4,7,10],'torn':[3,8,11],'feather':[5,9,12],'bat':[4,8,11]}[hem]):p.cut([(x,bottom),(x,bottom)])
  if m=='dragonwings':p.poly([(1,13),(2,12),(4,14),(3,16),(2,15)],'H');p.poly([(12,14),(14,12),(14,15),(13,16)],'S')
  # Bare hands are intentionally left visible; all other clothing stays covered.
  for xy in [(2,16),(13,16)]:p.im.putpixel(xy,(0,0,0,0))
 return p.outline()

def feet(w,base,icon=False):
 h,form,m=FEET[w['key']];p=Pix((16,16) if icon else (16,22),palette(w),None if icon else allowed(base,'feet'))
 if icon:
  for j in range(2):
   x=2+j*7;y=2+j+(4-h)*2;end=13+j
   p.poly([(x,y),(x+4,y),(x+3,end-4),(x+5,end-2),(x+5,end),(x,end)],'M')
   p.box((x+1,y+1,x+3,y+2),'H');p.line([(x+1,end-1),(x+4,end-1)],'S')
   boot_detail(p,m,x,y+3,True)
   if form in ['wing','flange','reed']:p.poly([(x,y+2),(x-1,y+1),(x-1,y+5),(x+1,y+4)],'A')
 else:
  for j,(left,right) in enumerate([(3,6),(9,12)]):
   shoe=[(x,y) for y in range(17,22) for x in range(left,right+1) if base.getpixel((x,y))[:3] in [(28,28,36),(48,48,58)]]
   sy=max(y for x,y in shoe);top=max(17,sy-h+2);bottom=min(21,sy+1)
   pts=[(left,top),(right,top),(right,bottom),(left,bottom)]
   if form in ['round','soft','slim']:pts=[(left+1,top),(right-1,top),(right,top+1),(right,bottom),(left,bottom),(left,top+1)]
   if form in ['wide','fur','flange']:pts=[(left-1,top),(right,top),(right,bottom),(left-1,bottom)]
   p.poly(pts);p.line([(left+1,top),(right-1,top)],'H');p.line([(left+1,bottom-1),(right-1,bottom-1)],'S')
   if form=='wing':p.poly([(left,top),(left-1,top),(left-1,top+2),(left+1,top+1)],'H')
   if form=='point':p.pt(right,top-1,'A')
   if form=='reed':p.line([(left,top),(left-1,top-1)],'A')
   boot_detail(p,m,left,top,False)
   # Both source shoe masks are covered even when their heights differ.
   for x,y in shoe:
    if not p.im.getpixel((x,y))[3]:p.pt(x,y,'S')
 return p.im

def boot_detail(p,m,x,y,large):
 k=2 if large else 1
 if m in ['seam','school']:p.line([(x+1,y+1),(x+1,y+2*k)],'S')
 elif m=='fold':p.line([(x+1,y+1),(x+2,y+1)],'H');p.pt(x+2,y+2,'S')
 elif m=='feather':p.line([(x,y+1),(x+2,y+2),(x,y+3)],'H')
 elif m=='steel':p.line([(x+1,y+1),(x+1,y+2*k)],'H');p.pt(x+2,y+1,'A')
 elif m=='lace':p.line([(x+1,y+1),(x+2,y+2),(x+1,y+3)],'S')
 elif m=='toecap':p.line([(x+1,y+2),(x+2,y+2)],'H');p.pt(x,y+1,'S')
 elif m=='cross':p.line([(x+1,y+1),(x+2,y+2)],'A');p.line([(x+2,y+1),(x+1,y+2)],'H')
 elif m=='rune':p.line([(x+1,y+1),(x+2,y+1),(x+1,y+2)],'A');p.pt(x+2,y+3,'H')
 elif m=='scales':p.line([(x,y+1),(x+1,y+2),(x+2,y+1)],'H')
 elif m=='stalk':p.line([(x+1,y+1),(x+1,y+3)],'H');p.pt(x+2,y+1,'S')
 elif m=='water':p.line([(x,y+2),(x+1,y+1),(x+2,y+2)],'H')
 elif m=='rift':p.line([(x+2,y+1),(x+1,y+2),(x+2,y+3)],'A')
 elif m=='wrap':p.line([(x,y+1),(x+2,y+2)],'H');p.pt(x+1,y+3,'S')
 elif m=='mud':p.pt(x+1,y+1,'S');p.pt(x+2,y+2,'H');p.pt(x,y+3,'S')
 elif m=='royal':p.line([(x+1,y+1),(x+1,y+3)],'A');p.pt(x+2,y+2,'H')
 elif m=='wheat':p.line([(x+1,y+1),(x+1,y+3)],'H');p.pt(x+2,y+2,'H');p.pt(x,y+1,'H')
 elif m=='spring':p.line([(x,y+1),(x+2,y+1)],'A');p.line([(x,y+3),(x+2,y+3)],'A');p.pt(x+1,y+2,'G')
 elif m=='fur':p.line([(x,y+1),(x+1,y),(x+2,y+1)],'H');p.pt(x+1,y+2,'S')
 elif m=='lava':p.line([(x+1,y+1),(x+2,y+2),(x+1,y+3)],'A');p.pt(x,y+2,'G')
 elif m=='void':p.pt(x+1,y+1,'A');p.line([(x,y+3),(x+2,y+2)],'G')
 elif m=='star':p.line([(x,y+1),(x+2,y+1)],'A');p.line([(x+1,y),(x+1,y+2)],'A')

# Accessory palette and construction. Shapes reflect the item's identity;
# these are not a single generic jewellery shape with 37 recolours.
ACC={
 'guardBadge':('badge','leaf','#8eac59','#526c31','#d3e995'),
 'charm':('paper','rune','#d7bd80','#87704c','#9776db'),
 'swiftFeather':('feather','swift','#5ba6dd','#2c5e9b','#daefff'),
 'wolfNecklace':('necklace','tooth','#d8d0b5','#8f846e','#faf1d8'),
 'herbPouch':('pouch','leaf','#659346','#395b2f','#c5db7f'),
 'sporeCharm':('bottle','mushroom','#a582ca','#634b83','#e2f5b2'),
 'thornRing':('ring','thorn','#719e4b','#3e6034','#eaa3bf'),
 'mossBracer':('bracer','moss','#8c927e','#565d54','#84b667'),
 'moonCharm':('pendant','moon','#a5bde4','#637da6','#f0f5db'),
 'crystalHeart':('heart','crystal','#84c9e7','#7664ad','#ecfaff'),
 'hunterOath':('badge','arrows','#a57b49','#694b32','#d9c493'),
 'beetleCharm':('beetle','shell','#7796a1','#47516c','#d6bd69'),
 'ectoLantern':('lantern','ghost','#aa9366','#645944','#86f1d1'),
 'kingsSeal':('ring','seal','#dbb953','#917135','#b74449'),
 'giantCore':('core','moss','#9b956f','#605d47','#edbd66'),
 'golemFist':('fist','stone','#a09c8b','#666254','#d5c9a3'),
 'grenBelt':('belt','buckle','#915838','#542f24','#dbb44d'),
 'scaleCharm':('pendant','scales','#62a287','#386454','#c7dfbd'),
 'gateKey':('key','gate','#a995dc','#5f4f96','#e8daff'),
 'moonPendant':('pendant','drop','#8bbfde','#567baf','#f0faff'),
 'riftRing':('ring','rift','#9880cc','#4f426f','#daceff'),
 'cactusCharm':('cactus','spines','#8ca34d','#556438','#e5cb85'),
 'wormCharm':('core','sand','#c69a55','#7c5437','#ffe0a0'),
 'wispLantern':('lantern','wisp','#777595','#434153','#ba91ee'),
 'merchantBadge':('badge','coin','#d5b55b','#8b6934','#f3e3a0'),
 'mimicTooth':('tooth','mimic','#eee1bd','#a99b7c','#b94f63'),
 'starCharm':('star','star','#f0d576','#ab8446','#e7f6ff'),
 'royalBadge':('badge','crown','#7a98c9','#465b8b','#e7c766'),
 'honeyCharm':('jar','honey','#e5aa42','#92602b','#ffe49b'),
 'ancientWatch':('watch','watch','#dab967','#8d6b39','#f6ebcf'),
 'iceCharm':('crystal','ice','#a1d9f3','#648ebd','#f4feff'),
 'emberCharm':('brazier','ember','#b47c4b','#68482f','#ffb34d'),
 'voidRing':('ring','void','#78658f','#40324f','#c478e6'),
 'colossusCore':('watch','gear','#ba9451','#76562f','#83ded8'),
 'lavaHeart':('heart','lava','#895049','#3d3033','#ff923e'),
 'victorRing':('ring','victor','#c5a358','#786039','#b6a0f1'),
 'starLance':('lance','star','#f1d999','#a38656','#c0eaff'),
}

def accessory(w):
 shape,m,M,S,H=ACC[w['key']];p=Pix((16,16),{'#':DARK,'M':M,'S':S,'H':H,'A':'#f4ead7','G':'#70527f','C':M})
 if shape=='badge':
  polys={'leaf':[(4,3),(11,3),(12,9),(8,14),(3,9)],'arrows':[(3,4),(7,2),(12,4),(11,12),(7,14),(3,11)],'coin':[(5,2),(10,2),(13,6),(12,11),(8,14),(3,11),(2,6)],'crown':[(3,3),(7,2),(12,3),(12,10),(8,14),(3,10)]}
  p.poly(polys[m]);p.line([(4,5),(4,9),(7,12)],'H')
  if m=='leaf':p.line([(7,5),(7,10)],'S');p.poly([(7,7),(9,5),(10,6),(8,8)],'H');p.pt(6,6,'H')
  if m=='arrows':p.line([(5,6),(10,11)],'H');p.line([(10,6),(5,11)],'H');p.line([(8,6),(10,6),(10,8)],'S')
  if m=='coin':p.oval((5,5,10,11),'H');p.line([(7,6),(7,10)],'S');p.pt(8,7,'S')
  if m=='crown':p.poly([(5,6),(6,8),(8,5),(9,8),(11,6),(10,10),(5,10)],'H')
 elif shape=='paper':p.line([(6,2),(9,2),(10,4)],'#');p.poly([(4,4),(11,3),(12,12),(8,14),(4,12)]);p.line([(6,6),(9,6),(7,8),(9,9),(6,11)],'H');p.pt(7,4,'S')
 elif shape=='feather':p.poly([(3,13),(4,8),(7,4),(12,2),(13,4),(11,8),(7,12)]);p.line([(3,14),(11,4)],'H');p.line([(6,9),(6,7)],'S');p.line([(8,8),(11,7)],'S')
 elif shape=='necklace':p.line([(4,3),(3,5),(4,8),(7,10),(11,8),(12,5),(11,3)],'#',3);p.line([(4,3),(3,5),(4,8),(7,10),(11,8),(12,5),(11,3)],'M');p.poly([(6,8),(9,8),(10,10),(8,14),(6,12)],'H');p.pt(7,10,'A')
 elif shape=='pouch':p.line([(5,3),(6,2),(8,4),(10,2),(11,3)],'S');p.poly([(5,5),(10,5),(12,9),(11,13),(4,13),(3,9)]);p.line([(5,5),(10,5)],'H');p.poly([(6,8),(9,7),(9,10),(7,11)],'H')
 elif shape=='bottle':p.box((6,2,9,4),'S',True);p.poly([(5,5),(10,5),(12,8),(11,13),(4,13),(3,8)]);p.line([(4,8),(5,6)],'A');p.poly([(5,9),(6,7),(9,7),(10,9)],'H');p.line([(7,9),(7,11)],'H')
 elif shape=='ring':
  p.oval((3,6,12,14));p.oval((5,8,10,12),'#',False);p.im.putpixel((7,10),(0,0,0,0));p.im.putpixel((8,10),(0,0,0,0));p.line([(4,8),(4,11)],'H')
  if m=='thorn':p.poly([(4,7),(3,4),(6,6),(7,3),(9,6),(12,4),(11,8)],'M');p.pt(7,5,'H')
  if m=='seal':p.box((5,2,10,7),'M',True);p.poly([(6,3),(9,3),(9,5),(7,6)],'H');p.pt(7,4,'A')
  if m=='rift':p.poly([(5,5),(7,2),(9,3),(8,5),(11,4),(10,7)],'H');p.pt(7,4,'A')
  if m=='void':p.poly([(5,4),(6,2),(9,1),(10,4),(8,6)],'H');p.pt(7,3,'G');p.pt(12,5,'H')
  if m=='victor':p.poly([(4,5),(5,3),(7,4),(9,2),(11,5),(9,7),(6,7)],'H');p.line([(7,4),(7,6)],'A')
 elif shape=='bracer':p.poly([(3,4),(11,2),(13,10),(5,14),(2,10)]);p.line([(4,5),(6,11),(11,9)],'H');p.line([(7,4),(8,9)],'S');p.poly([(3,4),(6,3),(5,6),(3,7)],'H')
 elif shape=='pendant':
  p.line([(5,2),(7,4),(10,2)],'S');p.line([(7,4),(7,5)],'M')
  if m=='moon':p.poly([(9,5),(5,5),(3,8),(4,12),(7,14),(11,12),(8,12),(6,10),(6,7)],'H');p.pt(4,8,'A')
  elif m=='drop':p.poly([(7,5),(11,10),(10,13),(7,14),(4,12),(4,10)],'H');p.line([(6,9),(5,11)],'A')
  else:
   for x,y in [(4,5),(8,6),(6,9)]:p.poly([(x,y),(x+3,y),(x+3,y+2),(x+1,y+4)],'M');p.pt(x+1,y+1,'H')
 elif shape=='heart':
  p.poly([(2,5),(4,3),(6,3),(8,5),(10,3),(12,3),(14,6),(12,10),(8,14),(3,9)])
  if m=='crystal':p.line([(4,4),(3,6),(6,10)],'H');p.line([(7,6),(8,12),(11,6)],'S');p.pt(11,4,'A')
  else:p.line([(4,5),(7,7),(6,9),(9,11)],'H');p.line([(10,5),(9,8),(12,8)],'H');p.pt(4,7,'A')
 elif shape=='beetle':p.line([(4,4),(3,2)],'S');p.line([(10,4),(12,2)],'S');p.poly([(5,4),(9,4),(12,7),(11,12),(8,14),(4,12),(3,8)]);p.line([(7,5),(7,12)],'S');p.line([(5,6),(4,9)],'H');p.pt(9,7,'H')
 elif shape=='lantern':
  p.oval((5,1,10,6),'S');p.box((6,3,9,5),'#');p.poly([(4,5),(11,5),(12,12),(10,14),(5,14),(3,12)]);p.box((5,7,10,11),'S');p.poly([(7,6),(9,8),(9,11),(7,12),(6,10)],'H');p.line([(4,6),(4,12),(11,12),(11,6)],'A')
  if m=='wisp':p.pt(13,8,'H');p.pt(2,10,'H');p.poly([(6,14),(8,12),(10,14)],'H')
 elif shape=='core':
  pts=[(4,3),(9,2),(13,6),(12,11),(8,14),(3,12),(2,7)] if m=='moss' else [(5,2),(10,3),(13,7),(11,12),(6,14),(2,10),(3,5)]
  p.poly(pts);p.poly([(5,6),(8,4),(10,7),(8,11),(5,10)],'H');p.line([(5,4),(4,7)],'A')
  if m=='moss':p.box((3,5,4,7),'S');p.pt(10,10,'S')
  else:p.line([(4,11),(7,12),(11,10)],'S')
 elif shape=='fist':p.poly([(3,6),(3,3),(5,2),(7,3),(9,2),(11,3),(13,4),(13,10),(10,14),(5,13),(2,9)]);p.line([(5,4),(5,7),(11,7)],'S');p.line([(8,4),(8,6)],'S');p.poly([(3,7),(6,8),(6,10),(4,11)],'H')
 elif shape=='belt':p.poly([(2,5),(6,4),(13,5),(14,10),(10,12),(2,11)]);p.line([(3,6),(12,7)],'H');p.box((6,5,10,11),'H',True);p.box((7,7,9,9),'S');p.pt(4,9,'#');p.pt(12,9,'#')
 elif shape=='key':p.poly([(3,2),(7,1),(10,4),(8,7),(6,7),(6,13),(3,14),(3,11),(4,11),(4,7),(2,5)]);p.box((4,3,7,5),'H',True);p.line([(5,7),(5,12)],'H');p.pt(7,12,'M');p.pt(8,11,'M')
 elif shape=='cactus':p.poly([(6,2),(9,2),(10,8),(12,8),(12,5),(14,5),(14,10),(10,11),(10,14),(5,14),(5,9),(2,9),(1,7),(1,5),(3,5),(3,7),(5,7)]);p.line([(7,4),(7,12)],'H');p.pt(9,6,'S');p.pt(6,10,'S')
 elif shape=='tooth':p.poly([(4,3),(10,2),(12,5),(10,9),(7,13),(4,14),(6,10),(4,7)]);p.line([(6,4),(9,4),(8,8),(6,11)],'H');p.line([(4,4),(10,3)],'S')
 elif shape=='star':p.poly([(8,1),(10,5),(14,6),(11,9),(12,14),(8,11),(3,14),(4,9),(1,6),(6,5)],'M');p.line([(8,4),(7,7),(4,7)],'H');p.line([(9,8),(10,11)],'S')
 elif shape=='jar':p.box((5,2,10,4),'S',True);p.poly([(4,5),(11,5),(13,8),(12,13),(4,14),(2,11),(3,7)]);p.box((4,8,11,11),'H');p.line([(5,6),(4,7)],'A');p.pt(8,10,'M');p.pt(10,9,'M')
 elif shape=='watch':
  if m=='watch':p.box((6,1,9,3),'M',True);p.oval((3,3,13,14));p.oval((5,5,11,12),'H');p.line([(8,6),(8,9),(10,9)],'#')
  else:
   p.poly([(5,1),(9,1),(9,3),(12,3),(12,5),(14,5),(14,10),(12,10),(12,13),(9,13),(9,14),(5,14),(5,12),(2,12),(2,9),(1,9),(1,5),(4,5),(4,3),(5,3)])
   p.oval((4,4,11,11),'H');p.line([(7,5),(7,8),(10,9)],'#');p.pt(7,12,'S')
 elif shape=='crystal':p.poly([(7,1),(11,5),(10,8),(13,10),(10,13),(7,14),(3,11),(4,7),(2,5),(5,4)],'M');p.line([(7,3),(6,7),(8,11)],'H');p.line([(9,6),(8,8),(10,11)],'S')
 elif shape=='brazier':p.poly([(3,9),(12,9),(10,13),(5,13)],'M');p.poly([(4,8),(5,5),(7,7),(8,2),(11,6),(10,9)],'H');p.pt(8,7,'A');p.line([(4,14),(11,14)],'S')
 elif shape=='lance':p.line([(3,13),(11,4)],'#',3);p.line([(3,13),(11,4)],'M');p.poly([(9,4),(11,1),(12,4),(14,5),(11,6),(10,8)],'H');p.line([(5,8),(9,12)],'H');p.pt(4,12,'A')
 return p.im

def font(n):
 for f in ['C:/Windows/Fonts/arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
  if Path(f).exists():return ImageFont.truetype(f,n)
 return ImageFont.load_default()

def signature(im):
 # Canonical first-use colour IDs distinguish structure, independent of recolour.
 colors={(0,0,0,0):0};seq=[]
 for px in pixels(im):
  if px not in colors:colors[px]=len(colors)
  seq.append(colors[px])
 return bytes(seq)

def pixels(im):
 raw=im.tobytes();return [tuple(raw[i:i+4]) for i in range(0,len(raw),4)]

def check(im,w,kind,base=None):
 assert im.mode=='RGBA' and im.size==((16,16) if kind=='icon' else (16,22)),(w['key'],kind,'size')
 assert set(im.getchannel('A').tobytes())=={0,255},(w['key'],kind,'alpha')
 colors=im.getcolors();assert len(colors)<=8,(w['key'],kind,'colors',len(colors))
 a=im.getchannel('A')
 if kind=='icon':
  b=a.getbbox();assert b[0]>=1 and b[1]>=1 and b[2]<=15 and b[3]<=15,(w['key'],'icon margin',b)
 else:
  lo,hi={'head':(0,12),'body':(11,19),'feet':(17,21)}[w['slot']];b=a.getbbox();assert b[1]>=lo and b[3]<=hi+1,(w['key'],'row bounds',b)
  limit=allowed(base,w['slot']);assert all(not v or lim for v,lim in zip(a.tobytes(),limit.tobytes())),(w['key'],'proportions')
  targets= [(46,60,112),(106,58,38),(216,104,58),(164,72,42)] if w['slot']=='body' else [(28,28,36),(48,48,58)] if w['slot']=='feet' else []
  yr=range(12,18) if w['slot']=='body' else range(17,22)
  comp=base.copy();comp.alpha_composite(im)
  for y in yr:
   for x in range(16):
    if base.getpixel((x,y))[:3] in targets:
     assert a.getpixel((x,y))==255,(w['key'],kind,'uncovered',x,y)
     assert comp.getpixel((x,y))==im.getpixel((x,y)),(w['key'],'composite mismatch')
     assert comp.getpixel((x,y))[:3] not in targets,(w['key'],kind,'original uniform/shoe color remains',x,y)
 return len(colors)

def main():
 gear=json.loads((TASK/'M_armor.json').read_text(encoding='utf-8-sig'));acc=json.loads((TASK/'M_acc.json').read_text(encoding='utf-8-sig'));items=gear+acc
 assert len(items)==118 and Counter(w['slot'] for w in gear)=={'head':25,'body':34,'feet':22} and len(acc)==37
 bases=[Image.open(TASK/f'M_base_back_f{f}.png').convert('RGBA') for f in (0,1)];assert all(b.size==(16,22) for b in bases)
 icons={};backs={};steps={};records=[];designs={};back_designs={};counts=Counter()
 for w in items:
  k=w['key'];slot=w.get('slot');outputs={}
  if not slot:im=accessory(w)
  elif slot=='head':im=head(w,icon=True)
  elif slot=='body':im=body(w,bases[0],True)
  else:im=feet(w,bases[0],True)
  outputs['icon']=im;icons[k]=im
  if slot and k not in ['uniform','schoolShoes']:
   outputs['back']={'head':head,'body':body,'feet':feet}[slot](w,bases[0]);backs[k]=outputs['back']
   if slot=='feet':outputs['back2']=feet(w,bases[1]);steps[k]=outputs['back2']
  notes=[]
  for kind,im in outputs.items():
   # Normalize fully transparent RGB for reproducible pixels and colour counting.
   im.putdata([px if px[3] else (0,0,0,0) for px in pixels(im)]);c=check(im,w,kind,bases[1 if kind=='back2' else 0]);path=OUT/f'{k}_{kind}.png';im.save(path)
   saved=Image.open(path);assert saved.tobytes()==im.tobytes();check(saved,w,kind,bases[1 if kind=='back2' else 0]);counts[kind]+=1;notes.append(f'{kind}: {im.width}x{im.height}, {c} colors incl alpha')
  sig=signature(icons[k]);assert sig not in designs,(k,'recolour-only icon',designs.get(sig));designs[sig]=k
  if k in backs:
   sig=signature(backs[k]);assert sig not in back_designs,(k,'recolour-only overlay',back_designs.get(sig));back_designs[sig]=k
  if k in steps:assert steps[k].tobytes()!=backs[k].tobytes(),(k,'step frame unchanged')
  records.append(k+': PASS | '+'; '.join(notes)+' | binary alpha; '+('1px margin; unique structural icon' if not slot or k in ['uniform','schoolShoes'] else 'row/fit/coverage checked; unique structural icon'))
 assert counts=={'icon':118,'back':79,'back2':21},counts
 pv=Image.new('RGB',(8*132,11*140),(72,84,74));d=ImageDraw.Draw(pv)
 for i,(k,im) in enumerate(backs.items()):
  x=i%8*132;y=i//8*140;comp=bases[0].copy();comp.alpha_composite(im);q=comp.resize((80,110),Image.Resampling.NEAREST);pv.paste(q,(x+26,y+23),q);d.text((x+4,y+3),k,font=font(12),fill='#f4f1df')
 sets=[('knight','knightHelm','royalMail','knightGreaves'),('mage','witchHat','starRobe','starBoots'),('fur','wolfHood','bearMantle','snowBoots'),('dusk','duskHelm','duskPlate','voidBoots')]
 for i,(name,h,b,f) in enumerate(sets):
  comp=bases[0].copy()
  for k in [f,b,h]:comp.alpha_composite(backs[k])
  x=i*264;y=1400;q=comp.resize((80,110),Image.Resampling.NEAREST);pv.paste(q,(x+18,y+24),q);d.text((x+4,y+3),name+' full set',font=font(12),fill='#fff0c0')
  for j,k in enumerate([h,b,f]):d.text((x+108,y+38+j*19),k,font=font(11),fill='#f4f1df')
 pv.save(OUT/'armor_preview.png')
 sheet=Image.new('RGB',(12*108,10*82),(75,81,94));ds=ImageDraw.Draw(sheet)
 for i,(k,im) in enumerate(icons.items()):
  x=i%12*108;y=i//12*82;q=im.resize((48,48),Image.Resampling.NEAREST);sheet.paste(q,(x+30,y+25),q);ds.text((x+3,y+3),k,font=font(11),fill='#f4f1df')
 sheet.save(OUT/'armor_icons.png');(TASK/'M_done.txt').write_text('\n'.join(records)+'\n',encoding='utf-8');print('M PASS:',dict(counts),'118 unique structural icons; coverage and fit verified.')

if __name__=='__main__':main()
