"""Manual completo por nivel (5–8): cubre todos los temas del plan, no solo los de las cápsulas.

Por tema: explicación, profundización, ejemplo resuelto, errores, checklist y ejercicios. Al final:
caso integrador, autoevaluación, soluciones, glosario consolidado y aviso de riesgo.
Salida: <nivel>/manual-nivel-N.pdf

  python manual.py          # niveles 5 a 8
  python manual.py 6        # solo un nivel
"""
import importlib
import sys

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from catalog import catalog, core
from pdfs import GOLD, INK, MUTED, S, box, colors, guide, plan_info, rich

LEVELS = (5, 6, 7, 8)
H1 = ParagraphStyle("mh1", parent=S["h1"], fontSize=17, leading=21, spaceBefore=6, spaceAfter=4)
COVER = ParagraphStyle("cover", parent=S["h1"], fontSize=30, leading=36, spaceAfter=10)
TOC = ParagraphStyle("toc", parent=S["body"], fontSize=10.5, leading=17)


def manual(level):
    m = importlib.import_module(f"manuales.n{level}").M
    topics_plan, deliver = plan_info()
    caps = {c["id"]: c for c in catalog() if c["level"] == level}
    folder = core.ROOT / core.LEVELS[level]
    path = folder / f"manual-nivel-{level}.pdf"
    exercises, glossary = [], {}

    story = [Spacer(1, 3 * cm), Paragraph(f"ACADEMIA XAURIXFX · NIVEL {level}", S["eyebrow"]),
             Paragraph(f"Manual del nivel {level}", COVER),
             Paragraph(core.LEVEL_NAMES[level], ParagraphStyle("cs", parent=S["sub"], fontSize=15, leading=20)),
             Spacer(1, 12)]
    story += [Paragraph(rich(p), S["para"]) for p in m["intro"]]
    story += [Paragraph("Al terminar este nivel podrás", S["h2"])]
    story += [Paragraph(f"• {rich(o)}", S["li"]) for o in m["objetivos"]]
    story += [Paragraph("Cómo usar este manual", S["h2"]),
              Paragraph("Cada tema combina explicación, profundización, un ejemplo resuelto, errores comunes, una "
                        "lista de comprobación y ejercicios. Las soluciones están al final. Los temas con cápsula de "
                        "video lo indican: mira primero el video y luego estudia el tema aquí.", S["para"]),
              PageBreak(), Paragraph("Contenido", S["h2"])]
    for t in m["temas"]:
        story.append(Paragraph(f"<b>{t['tema']}</b> · {rich(t['titulo'])}", TOC))
    if "proyecto" in m:
        story.append(Paragraph("<b>Proyecto final</b>", TOC))
    story += [Paragraph("<b>Caso integrador</b> · Autoevaluación · Soluciones · Glosario", TOC), PageBreak()]

    for t in m["temas"]:
        ids = t["capsula"] if isinstance(t["capsula"], list) else ([t["capsula"]] if t["capsula"] else [])
        parts = [guide(caps[i]) for i in ids if i in caps]
        block = [Paragraph(f"TEMA {t['tema']}", S["eyebrow"]), Paragraph(rich(t["titulo"]), H1)]
        if ids:
            block.append(Paragraph("Video asociado: " + ", ".join(f"cápsula {i} ({rich(caps[i]['title'])})" for i in ids),
                                   S["small"]))
        story += block
        if t["tema"] in topics_plan:
            story.append(box([Paragraph(f"<b>Del plan del curso.</b> {rich(topics_plan[t['tema']])}", S["body"])]))
        story.append(Paragraph("Explicación", S["h2"]))
        for g in parts:
            story += [Paragraph(rich(p), S["para"]) for p in g["explicacion"]]
        story += [Paragraph(rich(p), S["para"]) for p in t.get("explicacion", [])]
        if t.get("profundizacion"):
            story.append(Paragraph("Profundización", S["h2"]))
            story += [Paragraph(rich(p), S["para"]) for p in t["profundizacion"]]
        for ex in [g["ejemplo"] for g in parts] + ([t["ejemplo"]] if "ejemplo" in t else []):
            steps = [Paragraph(f"<b>Ejemplo resuelto · {rich(ex['titulo'])}</b>", S["cap"])]
            steps += [Paragraph(f"{i}. {rich(s)}", S["li"]) for i, s in enumerate(ex["pasos"], 1)]
            steps.append(Paragraph(f"<b>Conclusión:</b> {rich(ex['conclusion'])}", S["body"]))
            story += [Spacer(1, 6), KeepTogether(box(steps))]
        errs = [e for g in parts for e in g["errores"]] + t.get("errores", [])
        checks = [e for g in parts for e in g["checklist"]] + t.get("checklist", [])
        story += [Paragraph("Errores comunes", S["h2"])]
        story += [Paragraph(f"<font name='Sym' color='#b0413e'>✗</font> {rich(e)}", S["li"]) for e in errs]
        story += [Paragraph("Checklist", S["h2"])]
        story += [Paragraph(f"<font name='Sym' color='#b8913f'>☐</font> {rich(e)}", S["li"]) for e in checks]
        qs = [q for g in parts for q in g["ejercicios"]] + t.get("ejercicios", [])
        story.append(Paragraph("Ejercicios", S["h2"]))
        for q, sol in qs:
            exercises.append((t["tema"], sol))
            story.append(Paragraph(f"<b>{len(exercises)}.</b> {rich(q)}", S["li"]))
        for g in parts:
            for a, b, d in g["glosario"]:
                glossary.setdefault(a, (b, d))
        for a, b, d in t.get("glosario", []):
            glossary.setdefault(a, (b, d))
        story.append(PageBreak())

    if "proyecto" in m:
        p = m["proyecto"]
        story += [Paragraph("PROYECTO FINAL", S["eyebrow"]), Paragraph("Tu estrategia, defendida con evidencia", H1),
                  Paragraph("Pasos", S["h2"])]
        story += [Paragraph(f"{i}. {rich(s)}", S["li"]) for i, s in enumerate(p["pasos"], 1)]
        rows = [[Paragraph("<b>Criterio</b>", S["small"]), Paragraph("<b>Evidencia esperada</b>", S["small"])]]
        rows += [[Paragraph(f"<b>{rich(a)}</b>", S["body"]), Paragraph(rich(b), S["body"])] for a, b in p["criterios"]]
        tb = Table(rows, colWidths=[4.5 * cm, 12.5 * cm])
        tb.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#ddd3bd")),
                                ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 5)]))
        story += [Paragraph("Criterios de revisión", S["h2"]), tb, Paragraph("Plantilla del informe", S["h2"])]
        story += [Paragraph(rich(s), S["li"]) for s in p["plantilla"]]
        story.append(PageBreak())

    key = str(level)
    if key in deliver:
        kind, text = deliver[key]
        story += [Paragraph("Entrega del nivel", S["h2"]), box([Paragraph(rich(text), S["body"])])]
    c = m["caso"]
    story += [Paragraph("CASO INTEGRADOR", S["eyebrow"]), Paragraph(rich(c["titulo"]), H1)]
    story += [Paragraph(rich(p), S["para"]) for p in c["enunciado"]]
    story += [Paragraph("Autoevaluación", S["h2"])]
    story += [Paragraph(f"<b>{i}.</b> {rich(q)}", S["li"]) for i, (q, _) in enumerate(m["autoevaluacion"], 1)]
    story.append(PageBreak())

    story += [Paragraph("Soluciones", H1), Paragraph("Ejercicios por tema", S["h2"])]
    story += [Paragraph(f"<b>{i}.</b> <font color='#5f636b'>[{tema}]</font> {rich(s)}", S["li"])
              for i, (tema, s) in enumerate(exercises, 1)]
    story += [Paragraph("Caso integrador", S["h2"])]
    story += [Paragraph(rich(s), S["li"]) for s in c["solucion"]]
    story += [Paragraph("Autoevaluación", S["h2"])]
    story += [Paragraph(f"<b>{i}.</b> {rich(a)}", S["li"]) for i, (_, a) in enumerate(m["autoevaluacion"], 1)]
    story.append(PageBreak())

    rows = [[Paragraph("<b>Español</b>", S["small"]), Paragraph("<b>Inglés</b>", S["small"]),
             Paragraph("<b>Significado</b>", S["small"])]]
    rows += [[Paragraph(rich(a), S["body"]), Paragraph(f"<i>{rich(b)}</i>", S["body"]), Paragraph(rich(d), S["body"])]
             for a, (b, d) in sorted(glossary.items(), key=lambda kv: kv[0].lower())]
    gl = Table(rows, colWidths=[4.4 * cm, 4.6 * cm, 8 * cm], repeatRows=1)
    gl.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#ddd3bd")),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 4)]))
    story += [Paragraph("Glosario español–inglés del nivel", H1), gl, Spacer(1, 16),
              box([Paragraph("<b>Aviso de riesgo.</b> Material educativo con ejemplos y cifras ilustrativas; no es "
                             "asesoría de inversión ni una recomendación personalizada, y no promete rentabilidad. "
                             "Operar con apalancamiento puede causar pérdidas rápidas, incluso superiores a lo previsto. "
                             "Consulta siempre las condiciones reales de cada producto y practica primero en cuenta demo.",
                             S["small"])])]

    def page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(GOLD)
        canvas.rect(0, A4[1] - 0.45 * cm, A4[0], 0.45 * cm, stroke=0, fill=1)
        canvas.drawImage(str(core.ICON), A4[0] - 2.6 * cm, A4[1] - 2.1 * cm, 1.3 * cm, 1.3 * cm, mask="auto")
        canvas.setFont("UI", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(2 * cm, 1.2 * cm, f"XaurixFX · Manual del nivel {level} · {core.LEVEL_NAMES[level]}")
        canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Página {doc.page}")
        canvas.restoreState()

    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=2.2 * cm,
                            bottomMargin=2 * cm, title=f"Manual del nivel {level} · {core.LEVEL_NAMES[level]}",
                            author="XaurixFX Academia")
    doc.build(story, onFirstPage=page, onLaterPages=page)
    return path, len(exercises), len(glossary)


if __name__ == "__main__":
    for lv in [int(a) for a in sys.argv[1:]] or LEVELS:
        p, ne, ng = manual(lv)
        print(p.name, f"ejercicios={ne}", f"glosario={ng}")
