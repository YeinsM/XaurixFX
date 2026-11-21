"""Uso:
  python run.py                 # renderiza todas las cápsulas Python
  python run.py 1.3-a 2.2-a     # solo esas
  python run.py --preview ID... # PNG de control en ../_frames
  python run.py --list
"""
import sys
from multiprocessing import Pool
from pathlib import Path

import core
import scenes_a  # noqa: F401
import scenes_b  # noqa: F401
import scenes_c  # noqa: F401


def _render(cid):
    cap = next(c for c in core.REGISTRY if c.cid == cid)
    core.render(cap)
    return f"{cid}  {cap.duration:.1f}s"


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--list" in args:
        for c in core.REGISTRY:
            print(f"{c.cid:7} N{c.level} {c.duration:5.1f}s  {c.title}")
        sys.exit()
    preview = "--preview" in args
    ids = [a for a in args if not a.startswith("--")] or [c.cid for c in core.REGISTRY]
    if preview:
        out = core.ROOT / "_frames"
        for cid in ids:
            cap = next(c for c in core.REGISTRY if c.cid == cid)
            core.preview(cap, [(k, p) for k in range(len(cap.beats)) for p in (0.5, 1.0)], out)
        print("ok", out)
        sys.exit()
    with Pool(int(next((a.split("=")[1] for a in args if a.startswith("--jobs=")), 4))) as pool:
        for line in pool.imap_unordered(_render, ids):
            print(line, flush=True)
