# Rasterize Cubic 11 (OFL) into a compact 1-bit glyph atlas for the game.
import base64, struct
from PIL import Image, ImageFont, ImageDraw
from fontTools.ttLib import TTFont
FONT='/home/claude/dawn/build/cubic/fonts/ttf/Cubic_11.ttf'
tt=TTFont(FONT); cmap=tt.getBestCmap(); hm=tt['hmtx']
pf=ImageFont.truetype(FONT,12)
def want(cp):
    ch=chr(cp)
    if cp<0x80: return cp>=0x20
    if 0xff00<=cp<=0xffef or 0x3000<=cp<=0x303f or 0x2000<=cp<=0x2bff: return True
    if 0x4e00<=cp<=0x9fff:
        try: ch.encode('big5'); return True
        except: return False
    return cp in (0xb7,0xd7,0xf7,0xb0)
cps=sorted(cp for cp in cmap if want(cp))
out=bytearray(); idx=bytearray(); prev=0
for cp in cps:
    adv=round(hm[cmap[cp]][0]/100)
    img=Image.new('1',(16,16),0); d=ImageDraw.Draw(img); d.fontmode='1'
    d.text((0,0),chr(cp),font=pf,fill=1)
    bb=img.getbbox()
    if not bb: x0=y0=w=h=0
    else:
        x0,y0,x1,y1=bb; w=x1-x0; h=y1-y0
    # delta-coded codepoint (varint)
    dl=cp-prev; prev=cp
    while True:
        b=dl&0x7f; dl>>=7
        if dl: idx.append(b|0x80)
        else: idx.append(b); break
    out+=bytes([ (min(adv,15)<<4)|x0, (y0<<4)|h, w ])
    bits=0; n=0; buf=bytearray()
    for y in range(y0,y0+h):
        for x in range(x0,x0+w):
            bits=(bits<<1)|img.getpixel((x,y)); n+=1
            if n==8: buf.append(bits); bits=0; n=0
    if n: buf.append(bits<<(8-n))
    out+=buf
blob=struct.pack('<II',len(cps),len(idx))+bytes(idx)+bytes(out)
b64=base64.b64encode(blob).decode()
open('/home/claude/dawn/src/00_font.js','w').write(
 '/* Glyphs rasterized from Cubic 11 / 俐方體11號 (c) ACh-K, SIL Open Font License 1.1; derived from M+ BITMAP FONTS. */\n'
 'const FONT_B64="'+b64+'";\n')
print(len(cps),'glyphs',len(blob),'bytes',len(b64),'b64')
