"""Genera un PDF de apoyo por cápsula, junto a su video: <nivel>/<id>-<slug>.pdf

Contenido: objetivo, paso a paso (fotograma del video + texto en pantalla + explicación de la
locución), el tema y la entrega/laboratorio del plan de la Academia y el aviso de riesgo.

  python pdfs.py            # todas
  python pdfs.py 1.3-a      # solo esas
"""
import importlib
import json
import re
import subprocess
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

from catalog import AUDIO, catalog, core
from tts import FF

PLAN = core.ROOT.parents[2] / "docs" / "Plan_Academia_Trading_XaurixFX.md"
FRAMES = core.ROOT / "_frames" / "pdf"
GOLD = colors.HexColor("#b8913f")
INK = colors.HexColor("#1b1d21")
MUTED = colors.HexColor("#5f636b")
SOFT = colors.HexColor("#f6f1e6")

pdfmetrics.registerFont(TTFont("UI", "C:/Windows/Fonts/segoeui.ttf"))
pdfmetrics.registerFont(TTFont("UI-B", "C:/Windows/Fonts/segoeuib.ttf"))
pdfmetrics.registerFont(TTFont("Sym", "C:/Windows/Fonts/seguisym.ttf"))
pdfmetrics.registerFontFamily("UI", normal="UI", bold="UI-B", italic="UI", boldItalic="UI-B")

S = {
    "eyebrow": ParagraphStyle("eyebrow", fontName="UI-B", fontSize=8.5, textColor=GOLD, leading=11, spaceAfter=4),
    "h1": ParagraphStyle("h1", fontName="UI-B", fontSize=21, textColor=INK, leading=25, spaceAfter=4),
    "sub": ParagraphStyle("sub", fontName="UI", fontSize=10.5, textColor=MUTED, leading=14, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontName="UI-B", fontSize=13, textColor=INK, leading=17, spaceBefore=12, spaceAfter=6),
    "body": ParagraphStyle("body", fontName="UI", fontSize=10, textColor=INK, leading=14.5, alignment=TA_LEFT),
    "cap": ParagraphStyle("cap", fontName="UI-B", fontSize=10, textColor=INK, leading=14, spaceAfter=3),
    "para": ParagraphStyle("para", fontName="UI", fontSize=10.5, textColor=INK, leading=16, spaceAfter=8),
    "li": ParagraphStyle("li", fontName="UI", fontSize=10, textColor=INK, leading=14.5, leftIndent=12, firstLineIndent=-12, spaceAfter=5),
    "small": ParagraphStyle("small", fontName="UI", fontSize=8.5, textColor=MUTED, leading=11.5),
}


def plan_info():
    """Tema -> contenido del plan; tema -> entrega del nivel o laboratorio de la especialización."""
    topics, deliver = {}, {}
    level = spec = None
    for line in PLAN.read_text(encoding="utf-8").splitlines():
        if m := re.match(r"## Nivel (\d)", line):
            level, spec = m.group(1), None
        elif m := re.match(r"### (6\.\d)", line):
            spec = m.group(1)
        elif m := re.match(r"\| \*\*(\d+(?:\.\d+)+) · ([^*]+)\*\* \| (.+?) \|$", line):
            topics[m.group(1)] = m.group(3)
        elif m := re.match(r"\*\*(Entrega|Laboratorio)\.\*\* (.+)", line):
            deliver[spec or level] = (m.group(1), m.group(2))
    return topics, deliver


def rich(t):
    """Texto de las guías: admite <b>; solo se escapa &."""
    return t.replace("&", "&amp;")


def guide(c):
    """Contenido ampliado del nivel (python/guias/nN.py), si existe."""
    try:
        return importlib.import_module(f"guias.n{c['level']}").G.get(c["id"])
    except ModuleNotFoundError:
        return None


def box(flowables, bg=SOFT, line=GOLD):
    t = Table([[flowables]], colWidths=[17 * cm])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), bg), ("LINEBEFORE", (0, 0), (0, -1), 3, line),
                           ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                           ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9)]))
    return t


def guide_sections(g):
    out = [Paragraph("Explicación desarrollada", S["h2"])]
    out += [Paragraph(rich(p), S["para"]) for p in g["explicacion"]]
    ex = g["ejemplo"]
    steps = [Paragraph(f"<b>Ejemplo resuelto · {rich(ex['titulo'])}</b>", S["cap"])]
    steps += [Paragraph(f"{i}. {rich(s)}", S["li"]) for i, s in enumerate(ex["pasos"], 1)]
    steps.append(Paragraph(f"<b>Conclusión:</b> {rich(ex['conclusion'])}", S["body"]))
    steps.append(Paragraph("Cifras ilustrativas; las condiciones reales dependen de cada bróker y producto.", S["small"]))
    out += [Spacer(1, 6), KeepTogether(box(steps))]
    out += [Paragraph("Errores comunes", S["h2"])]
    out += [Paragraph(f"<font name='Sym' color='#b0413e'>✗</font> {rich(e)}", S["li"]) for e in g["errores"]]
    out += [Paragraph("Checklist", S["h2"])]
    out += [Paragraph(f"<font name='Sym' color='#b8913f'>☐</font> {rich(e)}", S["li"]) for e in g["checklist"]]
    out += [Paragraph("Ejercicios", S["h2"])]
    out += [Paragraph(f"<b>{i}.</b> {rich(q)}", S["li"]) for i, (q, _) in enumerate(g["ejercicios"], 1)]
    out.append(Paragraph("Las soluciones están al final de esta guía.", S["small"]))
    rows = [[Paragraph("<b>Español</b>", S["small"]), Paragraph("<b>Inglés</b>", S["small"]),
             Paragraph("<b>Significado</b>", S["small"])]]
    rows += [[Paragraph(rich(a), S["body"]), Paragraph(f"<i>{rich(b)}</i>", S["body"]), Paragraph(rich(d), S["body"])]
             for a, b, d in g["glosario"]]
    gl = Table(rows, colWidths=[4.2 * cm, 4.2 * cm, 8.6 * cm])
    gl.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#ddd3bd")),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 4)]))
    out += [Paragraph("Glosario español–inglés", S["h2"]), gl]
    out.append(KeepTogether([Paragraph("Resumen", S["h2"]),
                             box([Paragraph(f"• {rich(r)}", S["li"]) for r in g["resumen"]])]))
    return out


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def frames(c):
    """Un fotograma al final de cada tramo, tomado del MP4 ya renderizado."""
    video = core.ROOT / core.LEVELS[c["level"]] / f"{c['id']}-{c['slug']}.mp4"
    FRAMES.mkdir(parents=True, exist_ok=True)
    out, t = [], core.INTRO
    for k, b in enumerate(c["beats"]):
        t += b["secs"]
        f = FRAMES / f"{c['id']}_{k}.jpg"
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", f"{t - 0.35:.2f}", "-i", str(video), "-frames:v", "1",
                        "-vf", "scale=960:-1", "-q:v", "3", str(f)], check=True)
        out.append(f)
    return out


def build(c, narration, topics, deliver):
    folder = core.ROOT / core.LEVELS[c["level"]]
    path = folder / f"{c['id']}-{c['slug']}.pdf"
    topic_no = c["topic"].split(" · ")[0]
    dur = core.INTRO + sum(b["secs"] for b in c["beats"]) + core.OUTRO
    story = [
        Paragraph(f"ACADEMIA XAURIXFX · NIVEL {c['level']} · {core.LEVEL_NAMES[c['level']].upper()}", S["eyebrow"]),
        Paragraph(esc(c["title"]), S["h1"]),
        Paragraph(f"Tema {esc(c['topic'])} · Cápsula {c['id']} · video de {dur:.0f} s "
                  f"(<font name='UI-B'>{c['id']}-{c['slug']}.mp4</font>)", S["sub"]),
    ]
    obj = Table([[Paragraph(f"<b>Objetivo.</b> {esc(c['objective'])}", S["body"])]], colWidths=[17 * cm])
    obj.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), SOFT), ("LINEBEFORE", (0, 0), (0, -1), 3, GOLD),
                             ("LEFTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 8),
                             ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    story += [obj, Paragraph("Paso a paso", S["h2"])]
    spoken = narration.get(c["id"]) or [b["text"] for b in c["beats"]]
    for k, (b, img) in enumerate(zip(c["beats"], frames(c))):
        pic = Image(str(img), width=8.2 * cm, height=8.2 * cm * 9 / 16)
        txt = [Paragraph(f"{k + 1}. {esc(b['text'])}", S["cap"]), Paragraph(esc(spoken[k]), S["body"])]
        row = Table([[pic, txt]], colWidths=[8.6 * cm, 8.4 * cm])
        row.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                                 ("BOTTOMPADDING", (0, 0), (-1, -1), 9)]))
        story.append(KeepTogether(row))
    g = guide(c)
    if g:
        story += guide_sections(g)
    if topic_no in topics:
        story += [Paragraph("En el plan del curso", S["h2"]),
                  Paragraph(f"<b>Tema {esc(c['topic'])}.</b> {esc(topics[topic_no])}", S["body"])]
    key = topic_no[:3] if c["level"] == 6 else str(c["level"])
    if key in deliver:
        kind, text = deliver[key]
        story += [Spacer(1, 6), Paragraph(f"<b>{'Entrega del nivel' if kind == 'Entrega' else 'Laboratorio'}.</b> "
                                          f"{esc(text)}", S["body"])]
    story += [Paragraph("Para practicar", S["h2"]),
              Paragraph("Vuelve a ver el video y reproduce el ejemplo en una cuenta demo o con datos históricos. "
                        "Anota en tu diario qué observaste, qué número calculaste y qué harías distinto.", S["body"])]
    if g:
        story += [PageBreak(), Paragraph("Soluciones de los ejercicios", S["h2"])]
        for i, (_, sol) in enumerate(g["ejercicios"], 1):
            story.append(Paragraph(f"<b>{i}.</b> {rich(sol)}", S["li"]))
    warn = Table([[Paragraph("<b>Aviso de riesgo.</b> Material educativo con datos simulados; no es asesoría de "
                             "inversión ni una recomendación personalizada. Operar con apalancamiento puede causar "
                             "pérdidas rápidas, incluso superiores a lo previsto. Practica primero en cuenta demo.",
                             S["small"])]], colWidths=[17 * cm])
    warn.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.8, GOLD), ("LEFTPADDING", (0, 0), (-1, -1), 9),
                              ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story += [Spacer(1, 14), warn]

    def page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(GOLD)
        canvas.rect(0, A4[1] - 0.45 * cm, A4[0], 0.45 * cm, stroke=0, fill=1)
        canvas.drawImage(str(core.ICON), A4[0] - 2.6 * cm, A4[1] - 2.1 * cm, 1.3 * cm, 1.3 * cm, mask="auto")
        canvas.setFont("UI", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(2 * cm, 1.2 * cm, f"XaurixFX · Academia de Trading · Cápsula {c['id']}")
        canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Página {doc.page}")
        canvas.restoreState()

    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=2.2 * cm,
                            bottomMargin=2 * cm, title=f"{c['id']} · {c['title']}", author="XaurixFX Academia",
                            subject=c["topic"])
    doc.build(story, onFirstPage=page, onLaterPages=page)
    return path


if __name__ == "__main__":
    ids = sys.argv[1:]
    # Los PDF usan la explicación extensa; la locución (narracion.json) es una versión breve.
    nfile = AUDIO / "explicacion.json"
    narration = json.loads(nfile.read_text(encoding="utf-8")) if nfile.exists() else {}
    topics, deliver = plan_info()
    for c in catalog():
        if not ids or c["id"] in ids:
            print(build(c, narration, topics, deliver).name)
