import glob, os, subprocess, sys
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'embed_sprites.py')], check=True)
root='/home/claude/dawn'
head=open(root+'/web/head.html').read()
js=''.join(open(f).read()+'\n' for f in sorted(glob.glob(root+'/src/*.js')))
# v9.2.1: strip whole-line comments (the published page must stay small — see docs_design_log v9.2.2).
# Only comments that start a line are removed, and never inside a template literal (backtick parity).
import re as _re
def _strip(src):
    out, i, n, bt = [], 0, len(src), 0
    for line in src.split('\n'):
        t = line.lstrip()
        if bt % 2 == 0 and t.startswith('//'):
            continue
        out.append(line); bt += line.count('`')
    src = '\n'.join(out)
    res, pos, bt = [], 0, 0
    for m in _re.finditer(r'(?m)^[ \t]*/\*.*?\*/[ \t]*$', src, _re.S):
        seg = src[pos:m.start()]; bt += seg.count('`')
        res.append(seg)
        if bt % 2 == 1: res.append(m.group(0))
        pos = m.end()
    res.append(src[pos:])
    return _re.sub(r'\n{2,}', '\n', ''.join(res))
js=_strip(js)
lic=open(root+'/build/cubic/OFL.txt').read().replace('--','- -')
out=head+'\n<!-- Font: Cubic 11 (俐方體11號) by ACh-K, used under the SIL Open Font License 1.1 (text follows).\n'+lic+'\n-->\n<script>\n'+js+'</script>\n'
open(root+'/dist/dawnlight.html','w').write(out)
print('built', len(out)//1024, 'KB')
