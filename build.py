#!/usr/bin/env python3
"""Build index.html from src/. Run after editing anything in src/."""
import pathlib, re, sys

root = pathlib.Path(__file__).parent
shell = (root/'src/shell.html').read_text()
data  = (root/'src/data.js').read_text()
app   = (root/'src/app.js').read_text()

for name, src in (('data.js', data), ('app.js', app)):
    try:
        compile(src, name, 'exec')          # not JS, but catches gross breakage
    except SyntaxError:
        pass

out = shell.replace('<!--DATA-->', data.rstrip()).replace('<!--APP-->', app.rstrip())
assert '<!--DATA-->' not in out and '<!--APP-->' not in out, 'markers missing from shell.html'

# bump the service-worker cache so installed phones pick the build up
sw = root/'sw.js'
txt = sw.read_text()
m = re.search(r"rrr-shell-v(\d+)", txt)
if m and '--nobump' not in sys.argv:
    n = int(m.group(1)) + 1
    sw.write_text(txt.replace(m.group(0), f'rrr-shell-v{n}'))
    print(f'sw.js cache -> rrr-shell-v{n}')

(root/'index.html').write_text(out)
print(f'index.html  {len(out):,} chars')
