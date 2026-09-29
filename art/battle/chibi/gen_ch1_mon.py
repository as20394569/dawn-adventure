#!/usr/bin/env python3
"""Dawnlight Task O: hand-authored native-resolution pixel sprites.

Requires Python 3 + Pillow. Run: python art/battle/chibi/gen_ch1_mon.py
After checking the previews, add --visual-reviewed to write O_done.txt.
No randomness, external assets, antialiasing or image-generation service.
Coordinates, material clusters and poses below are the editable source artwork.
Only the Task O output names are written. References and task inputs are untouched.
"""
from pathlib import Path
import argparse
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

# Eleven opaque colours per character maximum; transparent counts as colour 12.
PALETTES = {
 'hornHare': ['20162b','654338','976344','c19060','e4b77f','f5dbac','ae665a','d93c55','ff8b7a','fff0cc','49313d'],
 'strawCrow':['191528','303044','48455e','666579','95909a','ac773e','d5ae61','f0d68c','d75460','fce8b1','51402f'],
 'gustSprite':['202034','344d48','50766b','77a98a','a8d8b0','dbf0c8','44405c','736383','b697bd','f8f4d5','233d39'],
 'millGolem':['241e30','51505b','77747a','a29c91','d0c7ac','70503d','ab7950','dac088','49334f','9660bb','e1a3e4'],
 'mossTurtle':['20262b','3d5047','647267','929381','bec1a0','435d39','668449','9aad64','d9d99b','b57b57','eee4b6'],
 'streamSnake':['1c2430','2f5249','427b5f','71a677','a7cd8e','e1dbae','565362','87848c','b3b0a2','aa557d','e797a7'],
 'mireFly':['172536','284c58','367d79','62ae94','b1d8b4','53677d','8499ad','c1d6d6','eaf1d6','945674','d494af'],
 'blackCatfish':['211d32','3b354c','565066','77758a','a1a6ac','ccc9bc','354655','54717a','8fa9a7','95649f','daa1cf'],
}

class Sprite:
 def __init__(self,key,size):
  self.im=Image.new('RGBA',(size,size),(0,0,0,0)); self.d=ImageDraw.Draw(self.im)
  self.p=[tuple(bytes.fromhex(c))+(255,) for c in PALETTES[key]]
 def poly(self,pts,c,outline=True): self.d.polygon(pts,fill=self.p[c],outline=self.p[0] if outline else None)
 def box(self,box,c,outline=False): self.d.rectangle(box,fill=self.p[c],outline=self.p[0] if outline else None)
 def oval(self,box,c,outline=True): self.d.ellipse(box,fill=self.p[c],outline=self.p[0] if outline else None)
 def line(self,pts,c=0,w=1): self.d.line(pts,fill=self.p[c],width=w)
 def dot(self,x,y,c): self.d.point((x,y),fill=self.p[c])

def face(s,x,y,hurt=False,eye=0,shine=9):
 if hurt:
  s.line([(x,y),(x+2,y+1),(x,y+2)]); s.line([(x+8,y),(x+6,y+1),(x+8,y+2)])
 else:
  s.box((x,y,x+1,y+2),eye); s.box((x+7,y,x+8,y+2),eye)
  if eye: s.dot(x,y,shine);s.dot(x+7,y,shine)

def hare(frame):
 s=Sprite('hornHare',32); hurt=frame=='hurt1'; wind=frame=='attack1'; strike=frame=='attack2'
 b=-1 if frame=='idle2' else 1 if wind else 0
 # Anchored hind paws and haunches.
 s.oval((7,24,14,30),2);s.oval((18,24,25,30),2)
 s.line([(9,28),(12,28)],5);s.line([(20,28),(23,28)],4)
 s.oval((7,16+b,25,28),3);s.oval((11,20+b,21,28),5)
 s.oval((24,21,28,25),5)
 # Ears fold back during the wind-up and forward on impact.
 if strike:
  s.poly([(9,13),(3,10),(3,6),(6,7),(13,12)],3);s.line([(5,8),(9,11)],6)
  s.poly([(19,12),(24,5),(27,5),(26,10),(23,15)],3);s.line([(25,7),(22,12)],6)
 elif wind:
  s.poly([(9,13),(6,9),(4,4),(7,3),(13,12)],3);s.line([(6,5),(10,11)],6)
  s.poly([(18,12),(22,3),(25,4),(22,14)],3);s.line([(23,5),(20,11)],6)
 else:
  s.poly([(8,13+b),(7,4+b),(9,2+b),(12,4+b),(13,13+b)],4);s.line([(9,5+b),(10,10+b)],6,2)
  s.poly([(18,12+b),(20,2+b),(23,3+b),(23,8+b),(22,14+b)],3);s.line([(21,4+b),(21,10+b)],6)
 y=11+b+(2 if strike else 0)
 s.poly([(8,y),(12,y-2),(21,y-2),(25,y+2),(26,y+8),(22,y+12),(11,y+12),(6,y+8),(6,y+3)],3)
 s.poly([(8,y+2),(12,y),(19,y),(19,y+3),(10,y+5),(8,y+8)],4,False)
 s.poly([(10,y+8),(14,y+7),(18,y+7),(22,y+8),(21,y+10),(12,y+10)],5,False)
 s.poly([(13,y+1),(15,y-7 if strike else y-6),(18,y),(17,y+3)],5)
 s.line([(15,y-3),(15,y)],9)
 face(s,10,y+5,hurt,7,8); s.line([(10,y+4),(13,y+5)],10);s.line([(19,y+5),(22,y+4)],10)
 if hurt: face(s,10,y+5,True)
 s.dot(16,y+9,10);s.dot(16,y+10,6)
 s.line([(7,y+8),(9,y+9)],2);s.line([(23,y+8),(21,y+9)],2)
 if strike: s.oval((5,25,10,28),4);s.oval((22,25,27,28),3)
 else: s.oval((8,23,12,27),4);s.oval((20,23,24,27),3)
 return s.im

def crow(frame):
 s=Sprite('strawCrow',32); h=frame=='hurt1'; w=frame=='attack1'; a=frame=='attack2'; b=-1 if frame=='idle2' else 0
 s.poly([(20,20),(28,22),(25,25),(29,26),(21,28),(16,25)],1)
 for x in (12,20):
  s.line([(x,25),(x,29),(x-3,30),(x+2,30)],5);s.dot(x-2,29,7)
 s.oval((8,14+b,24,28),1);s.poly([(11,17+b),(18,17+b),(19,24),(15,26),(11,24)],2,False)
 if w:
  s.poly([(9,16),(5,14),(2,6),(6,8),(6,4),(10,8),(12,17)],2)
  s.poly([(21,16),(24,8),(28,4),(28,10),(30,8),(28,19),(23,22)],1)
  s.line([(4,9),(8,15)],3);s.line([(26,10),(24,17)],2)
 elif a:
  s.poly([(10,18),(6,20),(2,25),(5,25),(4,28),(11,25),(14,21)],2)
  s.poly([(22,18),(27,20),(30,25),(26,25),(27,28),(21,24)],1)
 elif h:
  s.poly([(10,17),(4,18),(2,22),(9,24),(13,21)],2);s.poly([(21,16),(28,14),(28,20),(23,24)],1)
 else:
  s.poly([(9,16+b),(6,22),(8,26),(12,24),(14,19)],2);s.line([(8,21),(10,23)],3)
  s.poly([(23,16+b),(26,22),(24,26),(21,24),(19,19)],1);s.line([(23,20),(24,23)],2)
 y=8+b+(3 if a else -1 if w else 0)
 s.poly([(9,y+1),(12,y-2),(17,y-3),(20,y-1),(24,y),(25,y+7),(22,y+11),(12,y+11),(8,y+7)],1)
 s.poly([(10,y+2),(13,y),(18,y),(19,y+2),(13,y+3),(10,y+6)],3,False)
 s.poly([(12,y),(13,y-4),(16,y-2),(20,y-3),(19,y)],2)
 if h: face(s,10,y+5,True)
 else:
  s.line([(10,y+5),(13,y+6)],4);s.line([(18,y+6),(21,y+5)],4)
  s.dot(12,y+6,8);s.dot(19,y+6,8)
 s.poly([(13,y+8),(16,y+7),(20,y+8),(16,y+11 if a else y+10),(13,y+9)],6)
 s.line([(14,y+8),(17,y+8)],7)
 # Straw embedded in crown and flight feathers.
 s.line([(21,y),(24,y-2)],6);s.dot(24,y-3,7)
 s.line([(7,20),(10,22),(8,24)],6);s.dot(7,19,7)
 s.line([(22,24),(25,27)],6);s.dot(25,28,7)
 return s.im

def gust(frame):
 s=Sprite('gustSprite',32); h=frame=='hurt1'; w=frame=='attack1'; a=frame=='attack2'; cast=frame=='cast1'; b=-1 if frame=='idle2' else 0
 # Nested hooked wind bands give an airy body rather than a solid slime.
 s.poly([(12,29),(17,27),(11,25),(8,22),(11,18),(22,17),(25,20),(21,24),(16,25),(20,27),(17,30)],2)
 s.line([(12,29),(17,28),(14,27)],4)
 s.line([(10,22),(14,24),(20,23),(23,20)],4)
 s.line([(12,21),(17,22),(21,20)],5)
 s.poly([(8,16+b),(5,12+b),(8,8+b),(14,7+b),(18,3+b),(21,3+b),(19,7+b),(24,9+b),(26,14+b),(23,19+b),(17,21+b),(10,19+b)],3)
 s.poly([(8,12+b),(10,9+b),(16,9+b),(19,7+b),(21,10+b),(17,12+b),(12,12+b),(9,16+b)],4,False)
 s.line([(9,10+b),(14,9+b),(17,7+b)],5)
 if h: face(s,10,14+b,True)
 else:
  s.line([(10,14+b),(12,15+b),(12,16+b)],0);s.line([(19,15+b),(21,14+b),(20,16+b)],0)
 s.line([(15,18+b),(17,18+b)],1)
 # Miasma winds snake through the pale spirals.
 s.line([(7,16+b),(9,19+b),(17,20+b),(21,18+b)],6,2);s.dot(20,19+b,8)
 s.line([(12,25),(16,25),(20,23)],6)
 if cast:
  s.poly([(8,18),(4,15),(2,9),(4,6),(7,7),(6,11),(10,14)],3)
  s.poly([(23,17),(28,13),(29,8),(27,5),(24,7),(25,10),(21,13)],3)
  s.line([(4,8),(4,12),(7,15)],5);s.line([(26,7),(27,10),(24,13)],4)
  s.line([(9,5),(8,3),(12,1),(18,1),(23,3),(22,5)],2)
  s.line([(10,3),(14,2),(19,3)],5)
 elif a:
  s.poly([(8,15),(4,17),(2,21),(5,24),(10,23),(9,20),(6,21),(6,19),(11,18)],4)
  s.poly([(23,13),(28,14),(30,18),(28,21),(25,20),(26,17),(23,17)],2)
  s.line([(3,21),(5,22),(8,22)],5)
 elif w:
  s.line([(8,16),(10,20),(14,19)],4,2);s.line([(23,16),(21,20),(18,19)],4,2)
 else:
  s.line([(7,16+b),(3,19+b),(4,22+b),(6,21+b)],2,2)
  s.line([(24,16+b),(28,19+b),(27,22+b)],3,2)
  s.dot(3,19+b,5);s.dot(28,19+b,5)
 return s.im

def golem(frame):
 s=Sprite('millGolem',48); h=frame=='hurt1'; w=frame=='attack1'; a=frame=='attack2'; b=-1 if frame=='idle2' else 1 if w else 0
 # Feet stay at row 46 across all battle poses.
 s.poly([(15,36),(22,36),(21,43),(23,46),(12,46),(12,42)],5)
 s.poly([(27,36),(34,36),(36,42),(36,46),(25,46),(27,42)],5)
 s.box((15,39,18,43),6);s.line([(14,44),(20,44)],7);s.box((29,39,32,43),6);s.line([(28,44),(34,44)],7)
 # Jointed timber beams and heavy end grain.
 if w:
  arms=[([(13,22),(9,24),(3,16),(4,8),(10,7),(10,14),(16,17)],(3,6,11,13)), ([(34,21),(38,24),(44,15),(43,7),(37,7),(37,14),(31,17)],(36,5,44,12))]
 elif a:
  arms=[([(14,24),(9,23),(3,31),(3,41),(12,41),(13,34),(18,31)],(2,36,14,45)), ([(34,23),(39,25),(44,33),(44,42),(35,42),(34,32)],(33,35,45,44))]
 else:
  arms=[([(13,20+b),(7,22+b),(5,31),(7,38),(13,37),(15,27)],(3,31,14,40)), ([(34,20+b),(40,23+b),(42,32),(39,38),(33,36),(32,27)],(34,31,44,40))]
 for pts,box in arms:
  s.poly(pts,5);s.oval(box,6); x,y,x2,y2=box;s.line([(x+2,y+2),(x2-2,y+2),(x2-2,y2-2)],7);s.line([(x+3,y+4),(x+3,y2-2)],5)
 # Faceted round millstone, with concentric wear marks and radial grooves.
 cx=23;cy=23+b; shift=-1 if h else 0
 def P(pts,c,o=True): s.poly([(x+shift,y+b) for x,y in pts],c,o)
 P([(17,7),(28,7),(35,11),(39,18),(39,27),(35,35),(29,39),(18,39),(11,35),(7,27),(7,19),(11,11)],2)
 P([(17,9),(27,9),(34,13),(36,19),(34,28),(29,34),(18,35),(12,29),(10,21),(13,14)],3,False)
 P([(16,10),(25,9),(29,11),(20,12),(14,18),(12,24),(10,21),(12,15)],4,False)
 P([(31,14),(36,19),(36,27),(31,34),(26,36),(28,31),(32,26)],1,False)
 for pts in [[(16,13),(20,17)],[(27,12),(26,17)],[(33,19),(29,21)],[(33,28),(29,26)],[(24,34),(24,29)],[(15,30),(19,26)],[(11,22),(17,22)]]:
  s.line([(x+shift,y+b) for x,y in pts],1)
 s.oval((17+shift,17+b,29+shift,30+b),0)
 P([(21,18),(26,18),(28,22),(25,29),(21,28),(19,23)],8)
 P([(22,19),(25,19),(25,24),(22,27),(21,22)],9,False)
 s.line([(22+shift,20+b),(23+shift,19+b),(24+shift,21+b)],10)
 if h:
  s.line([(14,19+b),(17,20+b),(14,21+b)],0);s.line([(30,20+b),(32,19+b)],0)
 else:
  s.line([(13,17+b),(17,18+b)],0);s.dot(16,19+b,9);s.line([(29,18+b),(33,17+b)],0);s.dot(30,19+b,9)
 # Flour clusters on top-left; straw lodged in the rim.
 s.line([(14,10+b),(18,9+b),(20,9+b)],4,2);s.dot(12,13+b,4);s.dot(14,15+b,4)
 s.line([(31,9+b),(33,5+b),(34,6+b)],7);s.line([(33,11+b),(37,9+b)],6)
 s.line([(10,31+b),(7,35)],7);s.dot(6,34,7)
 return s.im

def turtle(frame):
 s=Sprite('mossTurtle',32); h=frame=='hurt1'; w=frame=='attack1'; a=frame=='attack2'; b=-1 if frame=='idle2' else 1 if w else 0
 for box in [(5,23,11,29),(22,23,28,29)]: s.oval(box,2);s.line([(box[0]+1,27),(box[0]+3,27)],4)
 s.poly([(25,21),(30,24),(28,26),(24,25)],2)
 s.poly([(5,23),(3,18+b),(5,11+b),(11,7+b),(20,7+b),(26,11+b),(28,19),(25,25),(10,26)],1)
 s.poly([(5,17+b),(7,12+b),(12,9+b),(19,9+b),(24,12+b),(26,19),(22,23),(11,24),(6,21)],3,False)
 s.poly([(8,13+b),(12,10+b),(17,10+b),(20,14+b),(17,18+b),(11,18+b)],4)
 s.line([(11,18+b),(9,23)],1);s.line([(17,18+b),(20,23)],1);s.line([(20,14+b),(25,14+b)],1)
 # Moss in asymmetrical clustered tufts; readable shell facets remain visible.
 s.poly([(5,13+b),(7,8+b),(10,8+b),(11,6+b),(14,7+b),(16,6+b),(20,8+b),(18,11+b),(12,12+b),(9,15+b)],6)
 s.line([(7,10+b),(10,9+b),(12,8+b),(14,9+b)],7,2);s.dot(10,7+b,8)
 s.poly([(22,12+b),(25,12+b),(26,15+b),(24,18+b),(21,17+b)],5,False);s.line([(23,13+b),(24,15+b)],7)
 y=24 if w else 20 if a else 22
 s.oval((6 if a else 8,y-3,23 if a else 21,29 if a else 28),2)
 s.poly([(9,y),(12,y-2),(17,y-2),(19,y),(18,y+4),(11,y+4)],7,False)
 face(s,9,y,h);s.line([(12,y+4),(16,y+4)],1)
 s.oval((5 if a else 8,27,11 if a else 12,30),2);s.oval((20 if a else 18,27,26 if a else 22,30),2)
 s.dot(7 if a else 9,29,8);s.dot(22 if a else 19,29,8)
 if a:
  s.oval((11,24,18,27),0,False);s.line([(12,24),(16,24)],10);s.line([(13,26),(16,26)],9)
 return s.im

def snake(frame):
 s=Sprite('streamSnake',32);h=frame=='hurt1';w=frame=='attack1';a=frame=='attack2';b=-1 if frame=='idle2' else 0
 s.poly([(6,25),(10,23),(22,23),(27,26),(27,29),(23,30),(7,30),(4,28)],6)
 s.poly([(7,26),(12,24),(21,24),(24,26),(19,28),(7,28)],8,False);s.line([(9,29),(15,29)],7)
 s.oval((5,19,27,28),1);s.oval((7,18,25,26),2);s.oval((11,20,21,23),0)
 s.line([(8,21),(10,19),(17,19)],4);s.line([(8,24),(14,26),(22,25)],3)
 s.poly([(23,23),(27,20),(28,15),(29,16),(29,23),(25,27),(18,27)],2)
 s.line([(27,22),(25,24),(22,25)],4)
 y=8+b+(3 if a else -2 if w else 0);x=-2 if a else 1 if w else 0
 s.poly([(13+x,y+8),(19+x,y+8),(20,18),(18,22),(13,23),(12,20),(15,17)],2)
 s.line([(15+x,y+10),(17,18),(15,21)],5,2)
 s.poly([(8+x,y),(13+x,y-2),(20+x,y-1),(23+x,y+2),(22+x,y+7),(18+x,y+10),(10+x,y+9),(6+x,y+6),(6+x,y+3)],2)
 s.poly([(9+x,y+1),(14+x,y),(19+x,y+1),(17+x,y+3),(9+x,y+4)],3,False)
 s.line([(9+x,y+1),(13+x,y)],4)
 s.poly([(8+x,y+6),(13+x,y+5),(20+x,y+6),(19+x,y+8),(11+x,y+8)],5,False)
 face(s,8+x,y+3,h);s.line([(8+x,y+2),(11+x,y+3)],1);s.line([(15+x,y+3),(18+x,y+2)],1)
 if not h:
  s.line([(12+x,y+9),(12+x,y+12),(10+x,y+13)],9);s.line([(12+x,y+12),(14+x,y+13)],9)
 s.oval((4,25 if a else 23,5,27 if a else 25),9);s.dot(4,26 if a else 24,10)
 return s.im

def dragonfly(frame):
 s=Sprite('mireFly',32);h=frame=='hurt1';w=frame=='attack1';a=frame=='attack2';b=-1 if frame=='idle2' else 0
 # Four outlined, sparsely filled wings. Holes have true alpha zero.
 if w: wings=[[(13,15),(6,5),(3,4),(3,10),(10,18)],[(18,15),(25,5),(28,4),(28,10),(21,18)],[(12,19),(5,17),(3,20),(7,24),(13,22)],[(20,19),(26,17),(29,20),(25,24),(19,22)]]
 elif a: wings=[[(13,14),(6,11),(1,12),(2,16),(10,19)],[(18,14),(25,11),(30,12),(29,16),(21,19)],[(12,19),(6,20),(3,25),(7,27),(14,22)],[(20,19),(26,20),(29,25),(25,27),(18,22)]]
 else: wings=[[(13,16+b),(6,8+b),(2,8+b),(2,13+b),(10,19+b)],[(18,16+b),(25,8+b),(29,8+b),(29,13+b),(21,19+b)],[(12,20+b),(6,18+b),(2,21+b),(4,25+b),(11,24+b),(14,22+b)],[(20,20+b),(26,18+b),(29,21+b),(27,25+b),(21,24+b),(18,22+b)]]
 for pts in wings:
  s.poly(pts,6); s.line(pts[1:3],8)
  x=sum(v[0] for v in pts)//len(pts);y=sum(v[1] for v in pts)//len(pts)
  s.line([(x-1,y),(x+1,y)],7);s.im.putpixel((x,y+1),(0,0,0,0))
 tailx=12 if a else 18 if w else 16
 s.poly([(13,18),(19,18),(19,23),(tailx+2,27),(tailx,30),(tailx-2,27),(13,24)],1)
 s.line([(15,20),(16,23),(tailx,27)],3,2)
 for y in (21,24,27): s.line([(tailx-1 if y>24 else 14,y),(tailx+1 if y>24 else 18,y)],0)
 s.dot(tailx,28,9)
 s.oval((11,12+b,21,21+b),2);s.line([(14,14+b),(14,18+b)],4)
 s.line([(12,18),(8,21),(9,24)],0);s.line([(20,18),(24,21),(23,24)],0)
 s.line([(12,16),(8,16),(7,18)],1);s.line([(20,16),(24,16),(25,18)],1)
 s.oval((10,7+b,22,16+b),2);s.oval((10,8+b,14,13+b),3);s.oval((18,8+b,22,13+b),3)
 if h: s.line([(11,10+b),(13,12+b)],0);s.line([(19,12+b),(21,10+b)],0)
 else:
  s.dot(11,9+b,8);s.dot(19,9+b,8);s.box((12,11+b,13,12+b),0);s.box((19,11+b,20,12+b),0)
 s.line([(14,7+b),(12,4+b)],0);s.line([(18,7+b),(20,4+b)],0)
 s.dot(12,4+b,4);s.dot(20,4+b,4);s.line([(14,15+b),(18,15+b)],0)
 return s.im

def catfish(frame):
 s=Sprite('blackCatfish',48);h=frame=='hurt1';w=frame=='attack1';a=frame=='attack2';b=-1 if frame=='idle2' else 1 if w else 0
 # Water ring stays grounded; separate splash peaks change with the strike.
 s.poly([(5,40),(10,37),(37,37),(43,40),(44,44),(36,46),(12,46),(4,44)],6)
 s.line([(7,42),(12,44),(20,45)],7);s.line([(30,45),(39,43)],8)
 s.poly([(13,37),(6,30 if w else 34),(4,26 if w else 29 if a else 33),(10,29 if w else 33),(16,32)],2)
 s.poly([(34,36),(41,26 if w else 31 if a else 34),(44,28 if w else 32),(41,38),(35,40)],1)
 s.line([(8,34),(12,36)],3);s.line([(38,35),(41,34)],3)
 s.poly([(17,16+b),(19,8+b),(22,5+b),(24,10+b),(29,8+b),(32,18+b)],1)
 s.line([(21,10+b),(22,8+b),(23,14+b)],3)
 s.oval((10,16+b,38,43),1)
 s.poly([(17,30),(30,30),(34,37),(30,42),(18,42),(14,38)],3,False)
 s.line([(18,38),(22,40),(29,39)],4)
 y=15+b+(2 if a else 0)
 s.poly([(11,y+2),(17,y-2),(29,y-2),(36,y+2),(39,y+9),(37,y+18),(31,y+22),(17,y+22),(10,y+17),(8,y+10)],2)
 s.poly([(12,y+3),(18,y),(28,y),(31,y+3),(20,y+3),(14,y+7),(11,y+11)],3,False)
 s.line([(14,y+3),(19,y+1),(24,y+1)],4);s.line([(14,y+5),(18,y+4)],8)
 s.poly([(32,y+7),(37,y+7),(36,y+15),(31,y+19),(29,y+16)],1,False)
 if h:
  s.line([(13,y+8),(17,y+10),(13,y+11)],0);s.line([(32,y+8),(28,y+10),(32,y+11)],0)
 else:
  s.line([(12,y+7),(17,y+9)],0);s.line([(28,y+9),(33,y+7)],0)
  s.box((14,y+9,16,y+11),5);s.box((29,y+9,31,y+11),5);s.dot(16,y+10,0);s.dot(29,y+10,0)
 if a:
  s.oval((15,y+12,31,y+22),0);s.line([(18,y+13),(27,y+13)],5);s.oval((20,y+18,28,y+21),9,False)
 else:
  s.line([(13,y+15),(18,y+17),(27,y+17),(32,y+14)],0)
  s.line([(18,y+18),(25,y+19),(30,y+17)],4)
 # Long moustaches wrap around the silhouette, never touch the frame.
 s.line([(13,y+13),(7,y+12),(3,y+14),(2,y+19),(4,y+21)],0)
 s.line([(12,y+13),(7,y+13),(4,y+15),(3,y+19)],4)
 s.line([(33,y+13),(39,y+11),(44,y+12),(45,y+17),(43,y+20),(40,y+18)],0)
 s.line([(34,y+13),(39,y+12),(43,y+13),(44,y+17),(42,y+19)],3)
 s.line([(17,y+18),(12,y+21),(11,y+25)],0);s.line([(30,y+18),(34,y+22)],0)
 # Corrupt crystal visibly knotted into the right whisker.
 s.poly([(40,y+15),(43,y+14),(45,y+18),(42,y+23),(39,y+19)],0)
 s.poly([(41,y+16),(43,y+16),(43,y+19),(41,y+21)],9,False);s.dot(41,y+17,10)
 s.line([(39,y+17),(43,y+20)],3)
 for x,yy in [(6,38),(39,39),(10,43),(36,44)]: s.line([(x,yy),(x+2,yy-1)],8)
 if a: s.line([(4,38),(2,35),(3,33)],7);s.line([(42,38),(45,34)],7);s.dot(44,31,8)
 return s.im

DRAWERS={'hornHare':hare,'strawCrow':crow,'gustSprite':gust,'millGolem':golem,'mossTurtle':turtle,'streamSnake':snake,'mireFly':dragonfly,'blackCatfish':catfish}

def recoil(im):
 """A 1-2 pixel torso lean with the bottom quarter locked. No filtering."""
 out=Image.new('RGBA',im.size,(0,0,0,0));size=im.width
 for y in range(size):
  row=im.crop((0,y,size,y+1));box=row.getbbox()
  if not box: continue
  shift=2 if y<size*.45 else 1 if y<size*.75 else 0
  shift=min(shift,size-1-box[2])
  assert shift>=0
  out.paste(row.crop((box[0],0,box[2],1)),(box[0]+shift,y))
 return out

def mini_golem(direction,n):
 s=Sprite('millGolem',32); b=-(n-1); side=direction in ('left','right'); back=direction=='up'
 # Four independent cameras; down and up have alternating foot plants.
 for x,step in [(10,n-1),(19,2-n)]:
  s.poly([(x,23),(x+4,23),(x+4,28-step),(x+5,30-step),(x-1,30-step),(x-1,27)],5)
  s.line([(x,28-step),(x+3,28-step)],7)
 if side:
  right=direction=='right'
  s.poly([(17,13+b),(23,16+b),(25,24+b),(23,27+b),(19,25+b),(17,20+b)],5)
  s.oval((19,22+b,26,28+b),6);s.line([(21,23+b),(24,24+b)],7)
  s.poly([(12,5+b),(20,5+b),(24,10+b),(24,19+b),(20,25+b),(12,25+b),(8,20+b),(8,11+b)],1)
  s.poly([(12,6+b),(17,6+b),(20,11+b),(20,19+b),(16,24+b),(10,21+b),(7,17+b),(7,11+b)],3)
  s.line([(11,9+b),(13,7+b),(16,7+b)],4)
  s.oval((9,12+b,16,19+b),0);s.poly([(11,13+b),(14,13+b),(14,17+b),(12,18+b)],9,False);s.dot(11,14+b,10)
  s.poly([(12,19+b),(14,22+b),(12,26+b),(7,26+b),(6,23+b),(9,20+b)],6);s.line([(8,23+b),(11,23+b)],7)
  s.line([(18,7+b),(20,3+b)],7)
  if right:
   # Redraw the camera by reflecting geometry, then swap shade/light clusters
   # only on stone and wood so the world light remains upper-left.
   s.im=s.im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
   px=s.im.load()
   for y in range(32):
    for x in range(32):
     c=px[x,y]
     if c==s.p[4]: px[x,y]=s.p[3]
   dd=ImageDraw.Draw(s.im);dd.line([(10,7+b),(13,6+b),(17,6+b)],fill=s.p[4]);dd.line([(7,24+b),(9,23+b)],fill=s.p[7])
 else:
  for x in (3,23):
   s.poly([(x+1,14+b),(x+5,14+b),(x+5,22+b),(x+6,26+b),(x,27+b),(x-1,23+b)],5)
   s.box((x,22+b,x+5,27+b),6,True);s.line([(x+1,23+b),(x+3,23+b)],7)
  s.poly([(11,4+b),(20,4+b),(25,8+b),(27,16+b),(24,23+b),(19,26+b),(11,25+b),(6,20+b),(5,12+b),(8,7+b)],2)
  s.poly([(11,6+b),(19,6+b),(23,9+b),(24,16+b),(20,22+b),(12,23+b),(8,19+b),(7,12+b)],3,False)
  s.line([(8,11+b),(10,8+b),(14,6+b),(18,6+b)],4,2)
  for pts in [[(12,8),(14,12)],[(22,12),(19,14)],[(20,21),(18,18)],[(10,20),(13,18)]]: s.line([(x,y+b) for x,y in pts],1)
  s.oval((12,12+b,20,19+b),0 if not back else 1)
  if not back:
   s.poly([(15,12+b),(18,14+b),(17,18+b),(14,18+b),(13,15+b)],9);s.dot(15,14+b,10)
  else:
   s.line([(10,11+b),(21,20+b)],5,2);s.line([(11,10+b),(22,19+b)],6)
   s.dot(12,12+b,0);s.dot(20,18+b,0)
  s.line([(21,6+b),(23,2+b)],7);s.line([(23,7+b),(26,5+b)],6)
 return s.im

def mini_catfish(direction,n):
 s=Sprite('blackCatfish',32);b=-(n-1)
 s.oval((4,25,28,30),6);s.line([(6,28),(12,29)],7);s.line([(22,29),(27,27)],8)
 if direction in ('left','right'):
  right=direction=='right'
  s.poly([(22,19+b),(28,15+b),(29,18+b),(27,23+b),(29,26+b),(25,27+b),(21,24+b)],1)
  s.poly([(12,16+b),(17,8+b),(19,11+b),(23,12+b),(24,18+b)],2)
  s.line([(17,11+b),(18,14+b)],4)
  s.oval((5,14+b,25,27+b),2);s.poly([(7,17+b),(12,15+b),(18,15+b),(20,17+b),(12,18+b),(7,20+b)],3,False)
  s.line([(8,17+b),(12,16+b)],4)
  s.poly([(6,23+b),(12,24+b),(20,23+b),(17,27+b),(9,27+b)],3,False)
  s.oval((7,18+b,11,21+b),5);s.dot(8,20+b,0)
  s.line([(6,23+b),(10,24+b),(13,23+b)],0)
  s.poly([(16,22+b),(22,23+b),(20,27+b),(16,25+b)],1);s.dot(18,24+b,3)
  s.line([(7,22+b),(3,21+b),(1,23+b),(2,27+b)],0);s.line([(7,22+b),(4,22+b),(2,24+b)],4)
  s.line([(9,24+b),(5,26+b),(6,29)],0)
  s.poly([(3,24+b),(5,23+b),(7,26+b),(5,28+b)],9);s.dot(4,25+b,10)
  if right:
   s.im=s.im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
   px=s.im.load()
   for y in range(32):
    for x in range(32):
     if px[x,y]==s.p[4]: px[x,y]=s.p[3]
   ImageDraw.Draw(s.im).line([(14,16+b),(19,15+b),(23,16+b)],fill=s.p[4])
 elif direction=='up':
  s.poly([(11,23+b),(9,28),(15,27),(20,29),(23,26),(20,23+b)],1)
  s.poly([(8,17+b),(4,21+b),(6,25+b),(10,22+b)],2);s.poly([(23,17+b),(28,21+b),(26,25+b),(22,22+b)],1)
  s.oval((7,8+b,24,26+b),2);s.oval((9,9+b,22,19+b),3,False)
  s.line([(10,12+b),(12,10+b),(17,10+b)],4)
  s.poly([(15,12+b),(17,15+b),(18,22+b),(15,25+b),(13,21+b),(14,16+b)],1)
  s.line([(15,15+b),(15,21+b)],4)
  s.line([(8,12+b),(4,11+b),(2,14+b),(3,19+b)],3)
  s.line([(23,12+b),(27,11+b),(29,15+b),(27,19+b)],1)
  s.poly([(26,15+b),(28,14+b),(29,17+b),(27,20+b),(25,18+b)],9);s.dot(27,16+b,10)
 else:
  s.poly([(12,14+b),(13,7+b),(16,5+b),(18,10+b),(21,9+b),(23,15+b)],1)
  s.line([(15,8+b),(16,12+b)],3)
  s.poly([(9,22+b),(4,21+b),(5,26+b),(11,27+b)],2);s.poly([(23,22+b),(28,21+b),(27,26+b),(21,27+b)],1)
  s.oval((6,12+b,25,28+b),2);s.poly([(8,15+b),(12,13+b),(19,13+b),(21,15+b),(12,16+b),(9,19+b)],3,False)
  s.line([(10,15+b),(14,14+b),(17,14+b)],4)
  s.box((10,18+b,12,20+b),5);s.dot(12,19+b,0);s.box((20,18+b,22,20+b),5);s.dot(20,19+b,0)
  s.line([(10,23+b),(14,25+b),(20,25+b),(23,22+b)],0);s.line([(13,26+b),(19,27+b)],4)
  s.line([(9,22+b),(4,20+b),(2,22+b),(2,26+b)],0);s.line([(8,22+b),(4,21+b),(3,23+b)],4)
  s.line([(24,22+b),(28,19+b),(30,21+b),(29,25+b)],0)
  s.poly([(27,23+b),(29,22+b),(30,25+b),(28,28+b),(26,26+b)],9);s.dot(28,24+b,10)
 return s.im

def validate(path,size):
 im=Image.open(path);assert im.mode=='RGBA',(path,'not RGBA')
 assert im.size==(size,size),(path,'wrong size')
 colours=im.getcolors(size*size);assert len(colours)<=12,(path,len(colours))
 assert {value for count,value in im.getchannel('A').getcolors()}=={0,255},(path,'alpha')
 box=im.getbbox();assert box and box[0]>=1 and box[1]>=1 and box[2]<=size-1 and box[3]<=size-1,(path,'edge',box)
 assert box[3]>=size-2,(path,'anchor',box)
 return {'file':str(path),'size':list(im.size),'colours_including_transparency':len(colours),'bbox':list(box),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

def preview(battle,records,spec):
 # Label gutters are outside the 4x sprites; no resampling of pixel edges.
 cellw=218;cellh=226
 out=Image.new('RGB',(cellw*6,cellh*8),'#272938');d=ImageDraw.Draw(out)
 for row,monster in enumerate(spec):
  for col,frame in enumerate(monster['frames']):
   im=Image.open(battle/'chibi'/f"{monster['key']}_{frame}.png")
   x=col*cellw;y=row*cellh
   d.text((x+8,y+8),f"{monster['key']} / {frame}",fill='#ece7da')
   big=im.resize((im.width*4,im.height*4),Image.Resampling.NEAREST)
   out.paste(big,(x+(cellw-big.width)//2,y+30+(192-big.height)),big)
 out.save(battle/'chibi'/'ch1_preview.png')
 out=Image.new('RGB',(8*152,2*165),'#272938');d=ImageDraw.Draw(out)
 for row,key in enumerate(('millGolem','blackCatfish')):
  for col,(direction,n) in enumerate((di,n) for di in ('down','left','right','up') for n in (1,2)):
   im=Image.open(battle/'field'/f'{key}_{direction}{n}.png');big=im.resize((128,128),Image.Resampling.NEAREST)
   d.text((col*152+4,row*165+4),f'{key}',fill='white');d.text((col*152+4,row*165+17),f'{direction}{n}',fill='#c4d4c8')
   out.paste(big,(col*152+12,row*165+33),big)
 out.save(battle/'field'/'ch1_field_preview.png')
 # Animated contact sheet: idle, anticipation, strike, recoil, plus cast.
 pages=[]
 for f in ('idle1','idle2','idle1','attack1','attack2','hurt1','idle1','cast1'):
  page=Image.new('RGB',(4*208,2*218),'#272938');d=ImageDraw.Draw(page)
  for i,m in enumerate(spec):
   frame=f if f in m['frames'] else 'idle1';im=Image.open(battle/'chibi'/f"{m['key']}_{frame}.png")
   x=i%4*208;y=i//4*218;d.text((x+6,y+4),f"{m['key']} {frame}",fill='white')
   big=im.resize((im.width*4,im.height*4),Image.Resampling.NEAREST);page.paste(big,(x+(208-big.width)//2,y+22+192-big.height),big)
  pages.append(page)
 pages[0].save(battle/'chibi'/'ch1_motion_preview.gif',save_all=True,append_images=pages[1:],duration=[450,450,300,300,180,280,350,450],loop=0,disposal=2)

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--battle-root',type=Path,default=Path(__file__).resolve().parents[1]);ap.add_argument('--spec',type=Path);ap.add_argument('--visual-reviewed',action='store_true');args=ap.parse_args()
 battle=args.battle_root.resolve();spec=json.loads((args.spec or battle/'tasks'/'O_monsters.json').read_text(encoding='utf-8-sig'))
 for sub in ('chibi','field','tasks'): (battle/sub).mkdir(parents=True,exist_ok=True)
 records=[]
 for m in spec:
  key=m['key'];size=int(m['size'].split('x')[0]);hashes=[]
  for frame in m['frames']:
   im=DRAWERS[key](frame)
   if frame=='hurt1': im=recoil(im)
   path=battle/'chibi'/f'{key}_{frame}.png';im.save(path,optimize=False)
   rec=validate(path,size);rec['file']=path.relative_to(battle).as_posix();records.append(rec);hashes.append(rec['sha256'])
  assert len(hashes)==len(set(hashes)),(key,'duplicate pose')
  if m['field_mini']:
   hashes=[]
   for direction in ('down','left','right','up'):
    for n in (1,2):
     im=(mini_golem if key=='millGolem' else mini_catfish)(direction,n);path=battle/'field'/f'{key}_{direction}{n}.png';im.save(path)
     rec=validate(path,32);rec['file']=path.relative_to(battle).as_posix();records.append(rec);hashes.append(rec['sha256'])
   assert len(set(hashes))==8,(key,'duplicate direction/step')
 assert len(records)==57,len(records)
 preview(battle,records,spec)
 report={'generator':'chibi/gen_ch1_mon.py','sprite_count':len(records),'visual_review':'completed on contact sheets' if args.visual_reviewed else 'pending','style_references':'O_style_refs_x4.png and original chibi/field sprites; nightBird absent in supplied archive, bird used as supplementary avian reference','checks':'native pixels; <=12 RGBA colours including transparent; binary alpha; 1px safety margin; bottom anchor; distinct frames','files':records}
 (battle/'tasks'/'O_qc.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 lines=[]
 for r in records:
  note='; nightBird reference absent, used bird + O style sheet' if 'strawCrow' in r['file'] else ''
  lines.append(f"art/battle/{r['file']} PASS | {r['size'][0]}x{r['size'][1]} RGBA; alpha=0/255; colours={r['colours_including_transparency']}/12 including transparent; bbox={r['bbox']}; unique pose; visual={'reviewed' if args.visual_reviewed else 'PENDING'}{note}")
 for name,note in [('chibi/gen_ch1_mon.py','deterministic editable pixel-art source; Python 3 + Pillow'),('chibi/ch1_preview.png','all 41 battle frames; nearest-neighbour 4x; labels'),('field/ch1_field_preview.png','all 16 map frames; nearest-neighbour 4x; labels'),('chibi/ch1_motion_preview.gif','8 monsters animation contact sheet'),('tasks/O_qc.json','57 individual validation records and SHA-256')]:
  lines.append(f'art/battle/{name} PASS | {note}')
 if args.visual_reviewed: (battle/'tasks'/'O_done.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print(f'Generated and validated {len(records)} sprites. Visual review: {report["visual_review"]}')

if __name__=='__main__': main()
