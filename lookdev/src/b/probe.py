"""Print colours at the same normalised points in a render and a reference.

usage: python3 -I probe.py <render.png> <ref.png> [x,y ...]   (x, y in 0..1)
"""
import sys
from PIL import Image
import numpy as np

render, ref = sys.argv[1:3]
pts = [tuple(map(float, p.split(','))) for p in sys.argv[3:]] or [
    (0.08, 0.6), (0.92, 0.6), (0.3, 0.45), (0.7, 0.45), (0.5, 0.16), (0.08, 0.9), (0.92, 0.9), (0.05, 0.12), (0.95, 0.12),
]
hx = lambda c: '#%02x%02x%02x' % tuple(int(v) for v in c)
for path in (render, ref):
    a = np.asarray(Image.open(path).convert('RGB')).astype(float)
    h, w = a.shape[:2]
    r = max(2, w // 200)
    print(path.split('/')[-1][:24].ljust(24), ' '.join(hx(a[int(y*h)-r:int(y*h)+r, int(x*w)-r:int(x*w)+r].reshape(-1, 3).mean(0)) for x, y in pts))
