"""Contact sheets of the merged look beside the refs and variants A/B/C, plus a region colour delta.

usage: python3 -I src/m/sheet.py            (reads out/*.png and ref/*, writes out/compare/m-*.png)
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "out")
REF = os.path.join(ROOT, "ref")
CMP = os.path.join(OUT, "compare")
os.makedirs(CMP, exist_ok=True)
PW, PH = 640, 360


def font(size=22):
    for p in ("/usr/share/fonts/TTF/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def panel(path, label):
    im = Image.new("RGB", (PW, PH), "black")
    if os.path.exists(path):
        src = Image.open(path).convert("RGB")
        # refs are 4:3 letterboxed 16:9 (f1/f2) or a 16:9 crop (owner-pick); fit on width
        w, h = src.size
        fit = src.resize((PW, round(PW * h / w)), Image.LANCZOS)
        if fit.size[1] > PH:
            top = (fit.size[1] - PH) // 2
            fit = fit.crop((0, top, PW, top + PH))
        im.paste(fit, (0, (PH - fit.size[1]) // 2))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, PW, 30), fill=(0, 0, 0))
    d.text((8, 4), label, fill="white", font=font())
    return im


def row(items):
    sheet = Image.new("RGB", (PW * len(items), PH), "black")
    for i, (path, label) in enumerate(items):
        sheet.paste(panel(path, label), (PW * i, 0))
    return sheet


def o(name):
    return os.path.join(OUT, name)


def r(name):
    return os.path.join(REF, name)


def grid(im, rows=3, cols=4):
    arr = np.asarray(im.resize((960, 540), Image.LANCZOS).convert("RGB")).astype(float)
    h, w = arr.shape[0] // rows, arr.shape[1] // cols
    return [[arr[rr * h:(rr + 1) * h, c * w:(c + 1) * w].reshape(-1, 3).mean(0) for c in range(cols)] for rr in range(rows)]


def delta(render, ref):
    if not (os.path.exists(render) and os.path.exists(ref)):
        return None
    a = Image.open(render)
    b = Image.open(ref)
    ga, gb = grid(a), grid(b)
    return float(np.mean([[np.abs(ga[i][j] - gb[i][j]).mean() for j in range(4)] for i in range(3)]))


sheets = {
    "m-shantanu": [(r("owner-pick.png"), "REF owner-pick"), (o("a-shantanu-close.png"), "A"), (o("b-shantanu-close.png"), "B"), (o("c-shantanu-close.png"), "C"), (o("m-shantanu-close.png"), "M merged")],
    "m-ganga": [(r("dragonbee-f2.jpg"), "REF f2"), (o("a-ganga-close.png"), "A"), (o("b-ganga-close.png"), "B"), (o("c-ganga-close.png"), "C"), (o("m-ganga-close.png"), "M merged")],
    "m-wide": [(r("dragonbee-f1.jpg"), "REF f1"), (o("a-wide.png"), "A"), (o("b-wide.png"), "B"), (o("c-wide.png"), "C"), (o("m-wide.png"), "M merged")],
}
rows = []
for name, items in sheets.items():
    im = row(items)
    im.save(os.path.join(CMP, f"{name}.png"))
    rows.append(im)
allsheet = Image.new("RGB", (rows[0].size[0], PH * len(rows)), "black")
for i, im in enumerate(rows):
    allsheet.paste(im, (0, PH * i))
allsheet.save(os.path.join(CMP, "m-all.png"))

# expressions and poses: the merged sheets stacked under C's expression sheet, at half size
stack = []
for path, label in [(o("c-expressions.png"), "C expressions"), (o("m-expressions.png"), "M expressions"), (o("m-poses.png"), "M poses")]:
    if os.path.exists(path):
        im = Image.open(path).convert("RGB").resize((1280, 720), Image.LANCZOS)
        ImageDraw.Draw(im).text((8, 4), label, fill="white", font=font())
        stack.append(im)
if stack:
    s = Image.new("RGB", (1280, 720 * len(stack)), "black")
    for i, im in enumerate(stack):
        s.paste(im, (0, 720 * i))
    s.save(os.path.join(CMP, "m-expressions.png"))

for label, render in [("A", "a-shantanu-close.png"), ("B", "b-shantanu-close.png"), ("C", "c-shantanu-close.png"), ("M", "m-shantanu-close.png")]:
    d = delta(o(render), r("owner-pick.png"))
    if d is not None:
        print(f"{label} shantanu-close vs owner-pick: mean 3x4 region delta {d:.1f}")
for label, render in [("A", "a-ganga-close.png"), ("B", "b-ganga-close.png"), ("C", "c-ganga-close.png"), ("M", "m-ganga-close.png")]:
    d = delta(o(render), r("dragonbee-f2.jpg"))
    if d is not None:
        print(f"{label} ganga-close vs f2: mean 3x4 region delta {d:.1f}")
