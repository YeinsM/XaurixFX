import sys, re
from pathlib import Path
from PIL import Image
d = Path(__file__).resolve().parents[1] / "_frames"
for cid in sys.argv[1:]:
    fs = sorted(d.glob(f"{cid}_*_100.png"), key=lambda f: int(f.stem.split("_")[1]))
    ims = [Image.open(f) for f in fs]
    w, h = ims[0].size
    cols = 3; rows = (len(ims) + cols - 1) // cols
    s = Image.new("RGB", (w * cols, h * rows), "black")
    for i, im in enumerate(ims):
        s.paste(im, ((i % cols) * w, (i // cols) * h))
    s.save(d / f"sheet_{cid}.png")
