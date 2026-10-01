"""Split dist/dawnlight.html into the published layout (another session moved the artifact to it on 2026-10-01: the shared-link
viewer for people who are not logged in fails on pages over ~3.2 MB, separate files load fine):
  dist/web/index.html  the page (styles, controller, licence) loading game.js?v=<hash>
  dist/web/game.js     the game script; battle animation / chibi sheets and the 288px portraits are separate files:
  dist/web/px/a_<k>.png, px/c_<k>.png, hd/<k>.webp
The single-file dist/dawnlight.html stays the build and test target. Prints which art files changed since the last split
(build/publish_manifest.json), so a publish only needs to send index.html, game.js and those."""
import os, re, json, base64, hashlib, io
from PIL import Image
import numpy as np
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'dist', 'web')
html = open(os.path.join(ROOT, 'dist', 'dawnlight.html'), encoding='utf8').read()
i0 = html.index('<script>'); i1 = html.rindex('</script>'); js = html[i0 + len('<script>'):i1]
files = {}
def table(name):
    m = re.search(r'const ' + name + r' = (\{.*?\});\n', js, re.S)
    return m, json.loads(m.group(1))
def put(path, data): files[path] = data
# 1) battle animation sheets and chibi sheets → px/
for name, pre in (('BATTLE_PXA_SRC', 'a_'), ('BATTLE_PXC_SRC', 'c_')):
    m, T = table(name); new = {}
    for k, uri in T.items():
        p = 'px/' + pre + k + '.png'; put(p, base64.b64decode(uri.split(',', 1)[1])); new[k] = p
    js = js[:m.start(1)] + json.dumps(new, ensure_ascii=False, separators=(',', ':')) + js[m.end(1):]
# 2) 288px portraits → hd/<k>.webp, loaded in the background (the small portrait shows until it arrives)
m, P = table('PORTRAIT_HD_ROWS')
CH = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
for k, (w, h, cols, rows) in P.items():
    A = np.zeros((h, w, 4), np.uint8); RGB = [tuple(int(c.lstrip('#')[j:j + 2], 16) for j in (0, 2, 4)) + (255,) for c in cols]
    for y, r in enumerate(rows):
        X = 0
        for n, ch in re.findall(r'(\d*)(.)', r):
            L = int(n) if n else 1
            if ch != '.': A[y, X:X + L] = RGB[CH.index(ch)]
            X += L
    b = io.BytesIO(); Image.fromarray(A, 'RGBA').save(b, 'WEBP', lossless=True, quality=80, method=2); put('hd/' + k + '.webp', b.getvalue())
js = js[:m.start()] + 'const PORTRAIT_HD_KEYS = new Set(' + json.dumps(sorted(P), ensure_ascii=False) + '); // v27g: the 288px portraits are separate files (hd/<key>.webp)\n' + js[m.end():]
old_fn = re.search(r'function portraitHD\(k\) \{.*?\n\}\n', js, re.S)
js = js[:old_fn.start()] + """function portraitHD(k) { // loads in the background; until it arrives the small portrait is shown
  if (k in PORTRAIT_HD) return PORTRAIT_HD[k]; PORTRAIT_HD[k] = null; if (!PORTRAIT_HD_KEYS.has(k)) return null;
  try { const im = new Image(); im.onload = () => { const c = mkCanvas(im.naturalWidth, im.naturalHeight); c.getContext('2d').drawImage(im, 0, 0); c.hd = 1; PORTRAIT_HD[k] = c; }; im.src = 'hd/' + k + '.webp'; } catch (e) { }
  return null;
}
setTimeout(() => { const L = [...PORTRAIT_HD_KEYS]; let i = 0; const next = () => { if (i < L.length) { portraitHD(L[i++]); setTimeout(next, 80); } }; next(); }, 2500); // warm them all up after boot
""" + js[old_fn.end():]
assert 'PORTRAIT_HD_ROWS' not in js, 'PORTRAIT_HD_ROWS still referenced'
game = js.lstrip('\n').encode('utf8'); v = hashlib.sha256(game).hexdigest()[:10]
page = html[:i0] + ('<!-- The game\'s code is in the separate file game.js (published next to this page), with art in hd/ and px/.\n'
    '     Edit game.js, not this page, and keep this page small: the shared-link viewer (people not logged in)\n'
    '     fails to open pages over ~3.2MB, while separate files load fine. Bump ?v= when game.js changes. -->\n'
    '<script src="game.js?v=' + v + '" onerror="document.body.insertAdjacentHTML(\'beforeend\',\'<p style=&quot;position:fixed;inset:auto 0 40% 0;text-align:center;color:#eef1f8;font:16px sans-serif&quot;>遊戲檔載入失敗，請重新整理頁面。</p>\')"></script>\n') + html[i1 + len('</script>'):]
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf8').write(page); open(os.path.join(OUT, 'game.js'), 'wb').write(game)
mf = os.path.join(ROOT, 'build', 'publish_manifest.json'); old = json.load(open(mf)) if os.path.exists(mf) else None
cur = {}; changed = []
for p, data in files.items():
    fp = os.path.join(OUT, p); os.makedirs(os.path.dirname(fp), exist_ok=True); open(fp, 'wb').write(data)
    cur[p] = hashlib.sha256(data).hexdigest()
    if old is not None and old.get(p) != cur[p]: changed.append(p)
json.dump(cur, open(mf, 'w'), indent=0)
print('index.html', len(page.encode('utf8')), 'game.js', len(game), 'v=' + v, 'art files', len(files))
print('CHANGED', json.dumps(changed) if old is not None else '(no manifest yet: all ' + str(len(files)) + ')')
