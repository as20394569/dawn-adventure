import glob, os, subprocess, sys
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'embed_sprites.py')], check=True)
root='/home/claude/dawn'
head=open(root+'/web/head.html').read()
js=''.join(open(f).read()+'\n' for f in sorted(glob.glob(root+'/src/*.js')))
lic=open(root+'/build/cubic/OFL.txt').read().replace('--','- -')
out=head+'\n<!-- Font: Cubic 11 (俐方體11號) by ACh-K, used under the SIL Open Font License 1.1 (text follows).\n'+lic+'\n-->\n<script>\n'+js+'</script>\n'
open(root+'/dist/dawnlight.html','w').write(out)
print('built', len(out)//1024, 'KB')
