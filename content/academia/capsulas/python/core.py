"""Motor de cápsulas XaurixFX: escenas por tramos -> MP4 1080p + SRT + guion.

Cada cápsula es una lista de tramos (segundos, texto en pantalla, función de dibujo).
La función recibe (ctx, p) con p en [0, 1] dentro del tramo y dibuja de forma
determinista, así cualquier fotograma puede regenerarse por separado.
Todos los datos de mercado son simulados.
"""
from __future__ import annotations

import math
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

import imageio.v2 as imageio
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib import font_manager  # noqa: E402
from matplotlib.patches import FancyBboxPatch, Rectangle  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
ICON = ROOT.parents[2] / "frontend" / "public" / "images" / "xaurix-icon.png"

BG = "#0d0f11"
PANEL = "#141619"
BORDER = "#282b2f"
GOLD = "#d9b46b"
GOLD2 = "#e4c17d"
TEXT = "#ececea"
MUTED = "#95979f"
GREEN = "#3fb68b"
RED = "#e05d5d"
BLUE = "#6aa3d9"
PURPLE = "#a98be0"

FPS = int(os.environ.get("CAPSULE_FPS", "24"))
INTRO, OUTRO = 3.0, 4.0
DISCLAIMER = (
    "Contenido educativo con datos simulados. No es asesoría de inversión.\n"
    "Operar con apalancamiento puede causar pérdidas rápidas. Practica en cuenta demo."
)

_fonts = {f.name for f in font_manager.fontManager.ttflist}
FONT = next((f for f in ("Manrope", "Segoe UI", "Arial") if f in _fonts), "DejaVu Sans")
plt.rcParams.update({"font.family": FONT, "axes.unicode_minus": False})


# ---------------------------------------------------------------- utilidades
def ease(p: float) -> float:
    p = min(max(p, 0.0), 1.0)
    return p * p * (3 - 2 * p)


def seg(p: float, a: float, b: float) -> float:
    """Progreso 0..1 del sub-intervalo [a, b] dentro de p."""
    return ease((p - a) / (b - a)) if b > a else float(p >= a)


def lerp(a, b, t):
    return a + (b - a) * t


def path(anchors, n, noise=0.0, seed=0):
    """Cierres que siguen anclas (índice, precio) con ruido reproducible."""
    xs, ys = zip(*anchors)
    base = np.interp(np.arange(n), xs, ys)
    rng = np.random.default_rng(seed)
    return base + rng.normal(0, noise, n).cumsum() * 0.35 + rng.normal(0, noise, n) * 0.6


def ohlc(closes, wick=0.4, seed=1, first_open=None):
    rng = np.random.default_rng(seed)
    c = np.asarray(closes, float)
    o = np.r_[c[0] if first_open is None else first_open, c[:-1]]
    span = np.abs(c - o) + wick
    h = np.maximum(o, c) + rng.uniform(0.15, 1.0, len(c)) * span * 0.6
    lo = np.minimum(o, c) - rng.uniform(0.15, 1.0, len(c)) * span * 0.6
    return o, h, lo, c


def candles(ax, o, h, lo, c, n=None, x0=0, width=0.62, alpha=1.0, up=GREEN, down=RED):
    n = len(c) if n is None else max(0, min(int(n), len(c)))
    if n == 0:
        return
    x = np.arange(n) + x0
    col = [up if c[i] >= o[i] else down for i in range(n)]
    ax.vlines(x, lo[:n], h[:n], colors=col, linewidth=1.6, alpha=alpha, zorder=3)
    bottom = np.minimum(o[:n], c[:n])
    height = np.maximum(np.abs(c[:n] - o[:n]), (h[:n].max() - lo[:n].min()) * 0.004)
    ax.bar(x, height, width, bottom, color=col, alpha=alpha, zorder=4, linewidth=0)


def hline(ax, y, label="", color=GOLD, ls="--", lw=2, side="right", alpha=1.0, size=15):
    ax.axhline(y, color=color, ls=ls, lw=lw, alpha=alpha, zorder=5)
    if label:
        x = 0.995 if side == "right" else 0.005
        ax.text(x, y, f" {label} ", transform=ax.get_yaxis_transform(), color=BG,
                ha="right" if side == "right" else "left", va="center", size=size,
                weight="bold", alpha=alpha, zorder=7,
                bbox=dict(boxstyle="round,pad=0.3", fc=color, ec="none", alpha=alpha))


def zone(ax, y0, y1, color=GOLD, alpha=0.16, label="", size=14):
    ax.axhspan(y0, y1, color=color, alpha=alpha, zorder=1, lw=0)
    if label:
        ax.text(0.01, (y0 + y1) / 2, label, transform=ax.get_yaxis_transform(),
                color=color, size=size, va="center", weight="bold", zorder=6)


def label(ax, x, y, s, color=TEXT, size=17, ha="center", va="center", alpha=1.0, box=None,
          weight="bold", transform=None, **kw):
    bbox = None
    if box:
        bbox = dict(boxstyle="round,pad=0.45", fc=box, ec="none", alpha=alpha)
    return ax.text(x, y, s, color=color, size=size, ha=ha, va=va, alpha=alpha, bbox=bbox,
                   weight=weight, zorder=8, transform=transform or ax.transData, **kw)


def card(ax, x, y, w, h, title="", body="", color=GOLD, alpha=1.0, tsize=19, bsize=15,
         fill=PANEL):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.02",
                                fc=fill, ec=color, lw=2, alpha=alpha, zorder=4))
    if title:
        ax.text(x + w / 2, y + h * (0.68 if body else 0.5), title, color=color, size=tsize,
                ha="center", va="center", weight="bold", alpha=alpha, zorder=5)
    if body:
        ax.text(x + w / 2, y + h * 0.32, body, color=TEXT, size=bsize, ha="center",
                va="center", alpha=alpha, zorder=5, linespacing=1.4)


def arrow(ax, x0, y0, x1, y1, color=GOLD, lw=2.5, alpha=1.0, style="-|>"):
    ax.annotate("", (x1, y1), (x0, y0), zorder=6,
                arrowprops=dict(arrowstyle=style, color=color, lw=lw, alpha=alpha,
                                shrinkA=0, shrinkB=0, mutation_scale=22))


def money(v, d=2, sign=False):
    s = f"{abs(v):,.{d}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    pre = ("+" if v > 0 else "−" if v < 0 else "") if sign else ("−" if v < 0 else "")
    return f"{pre}{s}"


# ---------------------------------------------------------------- escena
@dataclass
class Beat:
    secs: float
    text: str
    draw: Callable
    base: float = 0.0   # duración original del guion


@dataclass
class Capsule:
    cid: str            # p. ej. "1.3-a"
    slug: str
    level: int
    topic: str          # "1.3 · Cómo se forma el precio"
    title: str
    objective: str
    beats: list[Beat] = field(default_factory=list)

    @property
    def duration(self):
        return INTRO + sum(b.secs for b in self.beats) + OUTRO


LEVELS = {
    1: "nivel-1-trading-desde-cero",
    2: "nivel-2-plataformas-y-ejecucion",
    3: "nivel-3-analisis-tecnico-fundamental-macro",
    4: "nivel-4-riesgo-y-psicologia",
    5: "nivel-5-estrategias-y-plan",
    6: "nivel-6-especializaciones",
    7: "nivel-7-backtesting-y-cartera",
    8: "nivel-8-sistematico-y-proyecto-final",
}
LEVEL_NAMES = {
    1: "Trading desde cero", 2: "Plataformas y ejecución",
    3: "Análisis técnico, fundamental y macroeconómico", 4: "Gestión de riesgo y psicología",
    5: "Diseño de estrategias y plan de trading", 6: "Especializaciones por mercado",
    7: "Backtesting avanzado y gestión de cartera",
    8: "Trading sistemático, automatización y proyecto final",
}

REGISTRY: list[Capsule] = []
# Tiempos ajustados a la locución (los escribe tts.py); sin archivo se usan los del guion.
TIMINGS_FILE = ROOT / "audio" / "timings.json"
TIMINGS = __import__("json").loads(TIMINGS_FILE.read_text(encoding="utf-8")) if TIMINGS_FILE.exists() else {}


def capsule(cid, slug, level, topic, title, objective):
    def deco(fn):
        cap = Capsule(cid, slug, level, topic, title, objective)
        cap.beats = [Beat(*b) for b in fn()]
        for b in cap.beats:
            b.base = b.secs
        t = TIMINGS.get(cid)
        if t and len(t) == len(cap.beats):
            for b, s in zip(cap.beats, t):
                b.secs = s
        REGISTRY.append(cap)
        return fn
    return deco


class Ctx:
    MAIN = (0.065, 0.215, 0.87, 0.6)

    def __init__(self, fig):
        self.fig = fig
        self.axes: dict[str, plt.Axes] = {}

    def reset(self):
        for a in self.axes.values():
            a.clear()
            a.set_visible(False)

    def ax(self, name="main", rect=None, frame=True, xlim=None, ylim=None, grid=True):
        if name not in self.axes:
            self.axes[name] = self.fig.add_axes(rect or self.MAIN)
        a = self.axes[name]
        if rect:
            a.set_position(rect)
        a.set_visible(True)
        a.set_facecolor(BG)
        if frame:
            for s in a.spines.values():
                s.set_color(BORDER)
            a.tick_params(colors=MUTED, labelsize=12, length=0, pad=8)
            if grid:
                a.grid(color=BORDER, lw=0.8, alpha=0.7)
                a.set_axisbelow(True)
        else:
            a.axis("off")
        if xlim:
            a.set_xlim(*xlim)
        if ylim:
            a.set_ylim(*ylim)
        return a

    def canvas(self, name="board"):
        """Lienzo sin ejes en coordenadas 0..16 x 0..6.6 (zona principal)."""
        return self.ax(name, rect=self.MAIN, frame=False, xlim=(0, 16), ylim=(0, 6.6))


def _icon():
    if ICON.exists():
        return plt.imread(str(ICON))
    return None


def render(cap: Capsule, outdir: Path | None = None):
    outdir = outdir or ROOT / LEVELS[cap.level]
    outdir.mkdir(parents=True, exist_ok=True)
    base = outdir / f"{cap.cid}-{cap.slug}"
    fig = plt.figure(figsize=(16, 9), dpi=120, facecolor=BG)
    ctx = Ctx(fig)
    icon = _icon()
    if icon is not None:
        ia = fig.add_axes((0.905, 0.885, 0.06, 0.09))
        ia.imshow(icon)
        ia.axis("off")
    head = fig.text(0.065, 0.93, "", color=GOLD, size=15, weight="bold")
    title = fig.text(0.065, 0.875, "", color=TEXT, size=29, weight="bold")
    cap_txt = fig.text(0.5, 0.095, "", color=TEXT, size=22, ha="center", va="center",
                       linespacing=1.35, bbox=dict(boxstyle="round,pad=0.7", fc=PANEL,
                                                   ec=BORDER, lw=1.5))
    footer = fig.text(0.5, 0.018, "XaurixFX Academia · datos simulados · no es asesoría de inversión",
                      color="#5d6068", size=11, ha="center")
    full = fig.add_axes((0, 0, 1, 1))
    full.axis("off")

    writer = imageio.get_writer(f"{base}.mp4", fps=FPS, codec="libx264", quality=8,
                                macro_block_size=8, pixelformat="yuv420p",
                                ffmpeg_log_level="error")

    def frame():
        fig.canvas.draw()
        writer.append_data(np.asarray(fig.canvas.buffer_rgba())[:, :, :3])

    def chrome(show):
        for t in (head, title, cap_txt, footer):
            t.set_visible(show)

    # Portada
    chrome(False)
    for i in range(int(INTRO * FPS)):
        a = ease(i / (FPS * 0.8))
        ctx.reset()
        full.clear(); full.axis("off"); full.set_xlim(0, 1); full.set_ylim(0, 1)
        full.add_patch(Rectangle((0.065, 0.42), 0.12 * a, 0.006, color=GOLD))
        full.text(0.065, 0.62, f"NIVEL {cap.level} · {LEVEL_NAMES[cap.level].upper()}",
                  color=GOLD, size=18, weight="bold", alpha=a)
        full.text(0.065, 0.50, cap.title, color=TEXT, size=46, weight="bold", alpha=a)
        full.text(0.065, 0.35, f"Tema {cap.topic}", color=MUTED, size=20, alpha=a)
        full.text(0.065, 0.28, f"Cápsula {cap.cid}", color=MUTED, size=16, alpha=a)
        frame()

    chrome(True)
    full.clear(); full.axis("off")
    head.set_text(f"NIVEL {cap.level}  ·  TEMA {cap.topic.upper()}")
    title.set_text(cap.title)
    srt, t0 = [], INTRO
    for k, b in enumerate(cap.beats):
        n = max(1, int(round(b.secs * FPS)))
        cap_txt.set_text(b.text)
        srt.append((t0, t0 + b.secs, b.text))
        for i in range(n):
            p = i / (n - 1) if n > 1 else 1.0
            ctx.reset()
            cap_txt.set_alpha(min(1.0, (i + 1) / (FPS * 0.35)))
            b.draw(ctx, p)
            frame()
        t0 += b.secs

    # Cierre con aviso de riesgo
    chrome(False)
    ctx.reset()
    for i in range(int(OUTRO * FPS)):
        a = ease(i / (FPS * 0.6))
        full.clear(); full.axis("off"); full.set_xlim(0, 1); full.set_ylim(0, 1)
        full.text(0.5, 0.62, "Recuerda", color=GOLD, size=30, weight="bold", ha="center", alpha=a)
        full.text(0.5, 0.48, DISCLAIMER, color=TEXT, size=22, ha="center", va="center",
                  alpha=a, linespacing=1.6)
        full.text(0.5, 0.30, "XaurixFX · Academia de Trading", color=MUTED, size=17,
                  ha="center", alpha=a)
        frame()
    writer.close()
    plt.close(fig)

    with open(f"{base}.srt", "w", encoding="utf-8") as f:
        for i, (a, b, t) in enumerate(srt, 1):
            f.write(f"{i}\n{_ts(a)} --> {_ts(b)}\n{t}\n\n")
    return base


def _ts(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{sec:02},{ms:03}"


def preview(cap: Capsule, at: list[tuple[int, float]], out: Path):
    """PNG de fotogramas concretos (tramo, progreso) para revisión rápida."""
    out.mkdir(parents=True, exist_ok=True)
    fig = plt.figure(figsize=(16, 9), dpi=60, facecolor=BG)
    ctx = Ctx(fig)
    txt = fig.text(0.5, 0.095, "", color=TEXT, size=22, ha="center", va="center",
                   bbox=dict(boxstyle="round,pad=0.7", fc=PANEL, ec=BORDER))
    fig.text(0.065, 0.875, cap.title, color=TEXT, size=29, weight="bold")
    for k, p in at:
        ctx.reset()
        txt.set_text(cap.beats[k].text)
        cap.beats[k].draw(ctx, p)
        fig.savefig(out / f"{cap.cid}_{k}_{int(p*100)}.png", facecolor=BG)
    plt.close(fig)
