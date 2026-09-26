c=open('/home/claude/dawn/dist/dawnlight.html').read()
open('/home/claude/dawn/dist/test.html','w').write("<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>"+c+"</body></html>")
