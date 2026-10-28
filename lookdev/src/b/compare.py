"""Side-by-side and region-colour comparison of a render against a reference.

usage: python3 -I compare.py <render.png> <ref.png> <out.png>
"""
import sys
from PIL import Image, ImageDraw
import numpy as np

render, ref, out = sys.argv[1:4]
a = Image.open(render).convert('RGB').resize((960, 540), Image.LANCZOS)
b = Image.open(ref).convert('RGB')
bw, bh = b.size
b = b.resize((960, round(960 * bh / bw)), Image.LANCZOS)
canvas = Image.new('RGB', (1920, max(540, b.size[1])), 'black')
canvas.paste(a, (0, 0))
canvas.paste(b, (960, 0))
canvas.save(out)

def grid(im, rows=3, cols=4):
    arr = np.asarray(im.resize((960, 540))).astype(float)
    h, w = arr.shape[0] // rows, arr.shape[1] // cols
    return [[arr[r*h:(r+1)*h, c*w:(c+1)*w].reshape(-1, 3).mean(0) for c in range(cols)] for r in range(rows)]

ga, gb = grid(a), grid(b)
hx = lambda c: '#%02x%02x%02x' % tuple(int(v) for v in c)
total = 0
for r in range(3):
    row = []
    for c in range(4):
        d = np.abs(ga[r][c] - gb[r][c]).mean()
        total += d
        row.append(f'{hx(ga[r][c])}/{hx(gb[r][c])} d={d:4.1f}')
    print('  '.join(row))
print(f'mean region delta {total/12:.1f}')
