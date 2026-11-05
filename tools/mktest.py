import os
ROOT=os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
c=open(ROOT+'/dist/dawnlight.html').read()
open(ROOT+'/dist/test.html','w').write("<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>"+c+"</body></html>")
