"""Catálogo único de cápsulas (Python + Remotion), texto para locución y tiempos ajustados al audio."""
import json
import re

from num2words import num2words

import core
import scenes_a  # noqa: F401
import scenes_b  # noqa: F401
import scenes_c  # noqa: F401

AUDIO = core.ROOT / "audio"
TIMINGS = AUDIO / "timings.json"
REMOTION_JSON = core.ROOT / "remotion" / "src" / "capsules.json"


def catalog(base=False):
    """base=True: duraciones del guion; si no, las ajustadas a la locución cuando existen."""
    caps = [dict(id=c.cid, slug=c.slug, level=c.level, topic=c.topic, title=c.title, objective=c.objective,
                 beats=[{"secs": b.base if base else b.secs, "text": b.text} for b in c.beats],
                 tool="Python (matplotlib)")
            for c in core.REGISTRY]
    for c in json.loads(REMOTION_JSON.read_text(encoding="utf-8")):
        t = core.TIMINGS.get(c["id"])
        if not base and t and len(t) == len(c["beats"]):
            c["beats"] = [dict(b, secs=s) for b, s in zip(c["beats"], t)]
        caps.append(dict(c, tool="Remotion"))
    caps.sort(key=lambda c: [int(x) if x.isdigit() else x for x in c["id"].replace("-", ".").split(".")])
    return caps


# ------------------------------------------------------------------ texto para locución
WORDS = [
    ("EUR/USD", "euro dólar"), ("S&P 500", "ese ande pe quinientos"), ("XAUUSD", "oro contra dólar"),
    ("USD", "dólares"), ("EUR", "euros"), ("BTC", "bitcoin"), ("ETF", "e te efe"), ("CFD", "ce efe de"),
    ("RSI", "erre ese i"), ("ATR", "a te erre"), ("OCO", "o ce o"), ("MARKET", "márket"), ("LIMIT", "límit"),
    ("STOP", "stop"), ("4H", "cuatro horas"), ("1:20", "uno a veinte"), ("1:2", "uno a dos"),
    ("÷", " dividido entre "), ("«", ""), ("»", ""), ("→", ", "),
]


def _num(m):
    s = m.group(0)
    whole, _, dec = s.partition(",")
    out = num2words(int(whole.replace(".", "")), lang="es")
    if dec:
        if dec.startswith("0") or len(dec) > 2:
            out += " coma " + " ".join(num2words(int(d), lang="es") for d in dec)
        else:
            out += " coma " + num2words(int(dec), lang="es")
    return out


def speakable(text: str) -> str:
    t = text
    for a, b in WORDS:
        t = t.replace(a, b)
    t = re.sub(r"(\d)×", r"\1 veces", t)                              # 10× -> diez veces
    t = t.replace("×", " por ")
    t = re.sub(r"(\d)R\b", r"\1 erre", t)                            # 3R -> tres erre
    t = re.sub(r"(?<![\w])[−-](?=\d)", "menos ", t)
    t = re.sub(r"(?<![\w])\+(?=\d)", "más ", t)
    t = re.sub(r"\s[−-]\s", " menos ", t)
    t = t.replace(" + ", " más ").replace(" = ", ", igual a ")
    t = re.sub(r"\b1 (?=[a-záéíóú])", "un ", t)
    t = re.sub(r"\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?", _num, t)
    t = t.replace("%", " por ciento")
    return re.sub(r"\s+", " ", t).strip()


def load_timings():
    return json.loads(TIMINGS.read_text(encoding="utf-8")) if TIMINGS.exists() else {}
