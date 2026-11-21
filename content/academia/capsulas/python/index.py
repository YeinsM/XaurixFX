"""Genera INDICE.md (raíz de cápsulas) y guiones.md en cada carpeta de nivel.

Lee las cápsulas Python (REGISTRY) y las de Remotion (remotion/src/capsules.json).
"""
import json

from catalog import catalog, core

caps = catalog()


def dur(c):
    return core.INTRO + sum(b["secs"] for b in c["beats"]) + core.OUTRO


lines = [
    "# Cápsulas de video · Academia de Trading XaurixFX",
    "",
    f"Videos cortos (1920×1080, MP4 H.264, locución en español donde la columna Voz lo indica) que explican un concepto concreto de un tema del",
    "[plan de la Academia](../../../docs/Plan_Academia_Trading_XaurixFX.md). Cada video tiene subtítulos `.srt`",
    "con el mismo texto que aparece en pantalla y cierra con un aviso de riesgo. Los datos de mercado son simulados.",
    "",
    "No repiten las cuatro demostraciones narradas que ya existen (2.2 stop-limit con gap, 3.1 cómo nace una vela,",
    "4.1 tamaño de posición, 5.4 replay vela por vela).",
    "",
    f"Total: {len(caps)} cápsulas · {sum(1 for c in caps if c['tool'] == 'Remotion')} en Remotion (temas de mayor impacto) · "
    f"{sum(1 for c in caps if c['tool'] != 'Remotion')} en Python.",
    "",
]
for lv in range(1, 9):
    group = [c for c in caps if c["level"] == lv]
    folder = core.LEVELS[lv]
    lines += [f"## Nivel {lv} · {core.LEVEL_NAMES[lv]}", "",
              f"Carpeta: [`{folder}/`]({folder}/) · guiones: [`guiones.md`]({folder}/guiones.md)", "",
              "| Cápsula | Título | Tema del plan | Herramienta | Voz | Duración | Video |", "|---|---|---|---|---|---|---|"]
    for c in group:
        f = f"{c['id']}-{c['slug']}"
        lines.append(f"| {c['id']} | {c['title']} | {c['topic']} | {c['tool']} | {'Bella (ElevenLabs)' if c['id'] in core.TIMINGS else 'pendiente'} | {dur(c):.0f} s | "
                     f"[mp4]({folder}/{f}.mp4) · [srt]({folder}/{f}.srt) · [pdf]({folder}/{f}.pdf) |")
    lines.append("")
    g = [f"# Guiones · Nivel {lv} · {core.LEVEL_NAMES[lv]}", "",
         "Texto en pantalla de cada tramo; sirve también como guion de locución. "
         f"Portada {core.INTRO:.0f} s y cierre con aviso de riesgo {core.OUTRO:.0f} s.", ""]
    for c in group:
        g += [f"## {c['id']} · {c['title']}", "", f"- **Tema:** {c['topic']}", f"- **Objetivo:** {c['objective']}",
              f"- **Herramienta:** {c['tool']} · **Duración:** {dur(c):.0f} s", "", "| Inicio | Texto |", "|---|---|"]
        t = core.INTRO
        for b in c["beats"]:
            g.append(f"| {int(t // 60)}:{t % 60:04.1f} | {b['text']} |")
            t += b["secs"]
        g.append("")
    (core.ROOT / folder / "guiones.md").write_text("\n".join(g), encoding="utf-8")

lines += [
    "## Cómo regenerar",
    "",
    "Python (desde `python/`): `python -m venv .venv`, instalar `matplotlib numpy imageio imageio-ffmpeg pillow`",
    "y ejecutar `.venv/Scripts/python run.py` (todas) o `run.py 1.3-a` (una). `run.py --preview ID` deja PNG de control",
    "en `_frames/`. `imageio-ffmpeg` incluye su propio ffmpeg.",
    "",
    "Remotion (desde `remotion/`): `npm install --workspaces=false` y `node render.mjs` (todas) o `node render.mjs 3.1-a`.",
    "`npm run studio` abre el editor. Licencia: Remotion es gratuito para personas y empresas de hasta 3 personas;",
    "por encima se requiere licencia de empresa.",
    "",
    "Locución con ElevenLabs (desde `python/`, clave `ELEVENLABS_API_KEY` en `capsulas/.env`, que no se versiona):",
    "1. `tts.py --voices` lista las voces; `tts.py --sample ID ...` genera una frase de prueba por voz.",
    "2. `tts.py --voice ID` genera un MP3 por tramo en `audio/` (en caché: solo se pagan frases nuevas o cambiadas)",
    "   y ajusta la duración de cada tramo a su frase en `audio/timings.json`.",
    "3. Volver a renderizar (`run.py` y `node render.mjs`) para aplicar los nuevos tiempos.",
    "4. `mux.py` añade la voz a cada MP4 sin recodificar el video.",
    "",
    "PDF por cápsula: `pdfs.py` (guías en `guias/`). Manual completo de los niveles 5–8: `manual.py` (contenido en `manuales/`).",
    "",
    "Índice, guiones y `catalogo.json` (lo lee el backend): `.venv/Scripts/python index.py`.",
    "",
]
(core.ROOT / "INDICE.md").write_text("\n".join(lines), encoding="utf-8")

# Manifiesto que lee el backend (sección Academia). priceUsdt null = por definir; niveles 1 y 2 gratuitos.
FREE = {1, 2}
manifest = {"levels": []}
for lv in range(1, 9):
    manifest["levels"].append({
        "level": lv, "name": core.LEVEL_NAMES[lv], "folder": core.LEVELS[lv], "free": lv in FREE, "priceUsdt": None,
        "manual": f"manual-nivel-{lv}.pdf" if (core.ROOT / core.LEVELS[lv] / f"manual-nivel-{lv}.pdf").exists() else None,
        "capsules": [{
            "id": c["id"], "title": c["title"], "topic": c["topic"], "objective": c["objective"],
            "durationSec": round(dur(c)), "narrated": c["id"] in core.TIMINGS,
            "video": f"{c['id']}-{c['slug']}.mp4", "subtitles": f"{c['id']}-{c['slug']}.srt",
            "pdf": f"{c['id']}-{c['slug']}.pdf",
        } for c in caps if c["level"] == lv],
    })
(core.ROOT / "catalogo.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
print("ok", len(caps))
