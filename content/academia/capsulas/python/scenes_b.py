"""Cápsulas Python de los niveles 5 y 6."""
import numpy as np
from matplotlib.patches import Rectangle

from core import (BG, BLUE, BORDER, GOLD, GREEN, MUTED, PANEL, PURPLE, RED, TEXT, arrow,
                  candles, capsule, card, hline, label, lerp, money, ohlc, path, seg, zone)
from scenes_a import price_ax


# ======================================================== NIVEL 5
@capsule("5.1-a", "horizontes-de-operacion", 5, "5.1 · Scalping, intradía, swing y posición",
         "Scalping, intradía, swing y posición",
         "Comparar horizontes por frecuencia, peso de los costos, tiempo de pantalla y exposición fuera de sesión.")
def _():
    styles = ["Scalping", "Intradía", "Swing", "Posición"]
    hold = ["segundos a minutos", "minutos a horas", "días a semanas", "semanas a meses"]
    metrics = [
        ("Operaciones al mes", [0.95, 0.6, 0.25, 0.08], BLUE),
        ("Peso de los costos\npor operación", [0.95, 0.6, 0.3, 0.12], RED),
        ("Tiempo frente\na la pantalla", [0.95, 0.7, 0.3, 0.15], PURPLE),
        ("Exposición a gaps\ny fines de semana", [0.02, 0.08, 0.7, 0.95], GOLD),
    ]

    def draw(ctx, p, upto):
        b = ctx.canvas()
        for i, (s, hd) in enumerate(zip(styles, hold)):
            x = 5.2 + i * 2.95
            label(b, x, 6.3, s, TEXT, 19)
            label(b, x, 5.85, hd, MUTED, 13, weight="normal")
        for r, (name, vals, col) in enumerate(metrics[: upto + 1]):
            y = 4.6 - r * 1.3
            g = 1.0 if r < upto else seg(p, 0, .6)
            label(b, 0.2, y + .3, name, col, 15, ha="left")
            for i, v in enumerate(vals):
                x = 4.0 + i * 2.95
                b.add_patch(Rectangle((x, y), 2.4, 0.6, fc=PANEL, ec=BORDER))
                b.add_patch(Rectangle((x, y), 2.4 * v * g, 0.6, color=col, alpha=.85))

    return [
        (6, "Cuanto más corto el horizonte, más operaciones haces.", lambda c, p: draw(c, p, 0)),
        (6, "Con más operaciones, spread y comisión pesan más frente a cada objetivo pequeño.",
         lambda c, p: draw(c, p, 1)),
        (5.5, "Los horizontes cortos piden más tiempo frente a la pantalla.", lambda c, p: draw(c, p, 2)),
        (6, "Los largos mantienen posiciones abiertas por la noche y en fines de semana: riesgo de gap.",
         lambda c, p: draw(c, p, 3)),
        (5.5, "No hay un horizonte mejor: elige uno que encaje con tu tiempo y tus costos.",
         lambda c, p: draw(c, 1, 3)),
    ]


@capsule("5.2-a", "tres-familias-de-estrategia", 5, "5.2 · Tres ideas para contextos distintos",
         "Tendencia, ruptura y reversión a la media",
         "Asociar cada familia de estrategia a su régimen de mercado y a su forma típica de fallar.")
def _():
    n = 50
    t = np.arange(n)
    rng = np.random.default_rng(5)
    trend_ok = 100 + 0.35 * t + 1.6 * np.sin(t / 2.6) + rng.normal(0, .25, n)
    trend_bad = 104 + 2.2 * np.sin(t / 2.2) + rng.normal(0, .3, n)
    brk_ok = np.r_[100 + 1.2 * np.sin(np.arange(30) / 1.7), 101.5 + 0.45 * np.arange(20)] + rng.normal(0, .2, n)
    brk_bad = np.r_[100 + 1.2 * np.sin(np.arange(30) / 1.7), 101.8 + np.r_[np.linspace(0, 1, 4), np.linspace(1, -3, 16)]] + rng.normal(0, .2, n)
    mr_ok = 100 + 2.5 * np.sin(t / 2.4) + rng.normal(0, .25, n)
    mr_bad = 100 + 2 * np.sin(t / 2.4) * (t < 20) - 0.45 * np.clip(t - 20, 0, None) + rng.normal(0, .25, n)
    fam = [
        ("Tendencia y retrocesos", "compra retrocesos en una tendencia", trend_ok, trend_bad,
         "Falla en rango: stops repetidos"),
        ("Ruptura", "entra cuando el precio sale del rango", brk_ok, brk_bad, "Falla en falsos rompimientos"),
        ("Reversión a la media", "apuesta a que el precio vuelve al centro", mr_ok, mr_bad,
         "Falla cuando nace una tendencia"),
    ]
    cols = [GREEN, BLUE, PURPLE]

    def draw(ctx, p, upto, bad=False):
        for i, (name, desc, ok, ko, fail) in enumerate(fam):
            a = ctx.ax(f"f{i}", rect=(0.065 + i * 0.30, 0.25, 0.27, 0.5), xlim=(-1, n), ylim=(90, 120))
            a.set_xticks([]); a.set_yticks([])
            if i > upto:
                continue
            g = 1.0 if (i < upto or bad) else seg(p, 0, .7)
            series = ko if bad else ok
            k = max(2, int(n * (seg(p, 0, .8) if bad else g)))
            a.set_ylim(series.min() - 3, series.max() + 3)
            o, h, lo, c = ohlc(series, .4, i + 20)
            candles(a, o, h, lo, c, k)
            if i == 2:
                a.axhline(100, color=GOLD, lw=2, ls="--")
            if i == 1:
                zone(a, 98.6, 101.4, GOLD, .14)
            a.set_title(name, color=cols[i], size=18, weight="bold", pad=34)
            a.text(0.5, 1.03, fail if bad else desc, color=RED if bad else MUTED, size=14,
                   ha="center", transform=a.transAxes, weight="bold" if bad else "normal")
            for s in a.spines.values():
                s.set_color(RED if bad else cols[i])

    return [
        (6, "Tendencia: compra retrocesos cuando el mercado ya marca dirección.", lambda c, p: draw(c, p, 0)),
        (5.5, "Ruptura: entra cuando el precio sale de un rango con fuerza.", lambda c, p: draw(c, p, 1)),
        (6, "Reversión a la media: apuesta a que un exceso vuelve hacia el promedio.", lambda c, p: draw(c, p, 2)),
        (7.5, "Cada familia tiene su régimen y su forma de fallar. Escribe ambos antes de operar.",
         lambda c, p: draw(c, p, 2, bad=True)),
    ]


@capsule("5.3-a", "de-idea-a-reglas", 5, "5.3 · Convierte una idea en reglas",
         "De una idea a reglas que otro pueda repetir",
         "Convertir una idea vaga en una lista de reglas completa y comprobable.")
def _():
    rules = [
        ("Universo", "XAUUSD"),
        ("Horario", "sesiones de Londres y Nueva York"),
        ("Filtro", "precio sobre la media de 50 en 1H"),
        ("Señal", "retroceso a la media de 20 y cierre alcista"),
        ("Entrada", "apertura de la vela siguiente"),
        ("Invalidación", "stop bajo el último mínimo"),
        ("Salida", "objetivo 2R o cierre de sesión"),
        ("Tamaño", "riesgo fijo del 0,5 % del capital"),
        ("Abstención", "30 min antes y después de datos de alto impacto"),
        ("Suspensión", "5 pérdidas seguidas o −6 % en el mes"),
    ]

    def draw(ctx, p, k0, k1, done=False):
        b = ctx.canvas()
        card(b, 0.3, 4.9, 4.6, 1.4, "IDEA", "«comprar retrocesos\nen tendencia del oro»", GOLD, bsize=15)
        arrow(b, 5.0, 5.6, 5.8, 5.6, GOLD)
        k = int(lerp(k0, k1, p) + 0.999)
        for i, (r, v) in enumerate(rules[:k]):
            col, row = i // 5, i % 5
            x, y = 6.0 + col * 5.1, 5.7 - row * 1.25
            b.add_patch(Rectangle((x, y - .45), 4.9, 1.0, fc=PANEL, ec=BORDER))
            label(b, x + .15, y + .23, f"• {r}", GREEN, 15, ha="left", va="center")
            label(b, x + .15, y - .17, v, TEXT, 13, ha="left", weight="normal")
        if done:
            label(b, 2.6, 2.8, "Prueba:\notra persona aplica\ntus reglas al mismo\ntramo histórico y\nobtiene las mismas\noperaciones.", TEXT, 15,
                  box=PANEL, alpha=seg(p, 0, .4))
        label(b, 2.6, 0.3, "Ejemplo didáctico, no recomendación", MUTED, 12, weight="normal")

    return [
        (5, "«Comprar retrocesos en tendencia» es una idea, todavía no es un sistema.",
         lambda c, p: draw(c, p, 0, 0)),
        (7, "Define qué operas, cuándo y con qué filtro.", lambda c, p: draw(c, p, 0, 3)),
        (7, "Señal, entrada, invalidación y salida, sin margen de interpretación.", lambda c, p: draw(c, p, 3, 7)),
        (7, "Tamaño, cuándo abstenerte y cuándo suspender el sistema.", lambda c, p: draw(c, p, 7, 10)),
        (6, "Si otra persona obtiene las mismas operaciones con tus reglas, ya tienes reglas.",
         lambda c, p: draw(c, p, 10, 10, done=True)),
    ]


# ======================================================== NIVEL 6
@capsule("6.1-a", "tracking-error-etf", 6, "6.1.3 · Qué sigue un ETF y cuánto se desvía",
         "ETF frente a índice: tracking error",
         "Distinguir diferencia de seguimiento y tracking error comparando un fondo con su índice.")
def _():
    n = 250
    rng = np.random.default_rng(61)
    r = rng.normal(0.0004, 0.01, n)
    idx = 100 * np.cumprod(1 + r)
    etf = 100 * np.cumprod(1 + r - 0.00003 + rng.normal(0, 0.0006, n))
    diff = (etf / idx - 1) * 100

    def draw(ctx, p, k0, k1, show_diff=False, band=False):
        k = max(2, int(lerp(k0, k1, p)))
        a = ctx.ax(rect=(0.065, 0.45, 0.87, 0.37), xlim=(0, n), ylim=(min(idx.min(), etf.min()) - 3, max(idx.max(), etf.max()) + 3))
        a.set_xticks([]); a.yaxis.tick_right()
        a.plot(idx[:k], color=GOLD, lw=2.6, label="Índice")
        a.plot(etf[:k], color=BLUE, lw=2.2, label="ETF que lo replica")
        a.legend(loc="upper left", frameon=False, labelcolor=TEXT, fontsize=14)
        if show_diff:
            d = ctx.ax("d", rect=(0.065, 0.215, 0.87, 0.2), xlim=(0, n), ylim=(diff.min() - .3, 0.4))
            d.set_xticks([]); d.yaxis.tick_right()
            d.yaxis.set_major_formatter(lambda v, _: f"{v:.1f} %")
            d.axhline(0, color=MUTED, lw=1)
            d.plot(diff[:k], color=RED, lw=2)
            d.text(2, 0.15, "ETF − índice", color=RED, size=13, weight="bold")
            if band:
                x = np.arange(n)
                trend = np.polyval(np.polyfit(x, diff, 1), x)
                sd = np.std(diff - trend)
                d.fill_between(x, trend - sd, trend + sd, color=PURPLE, alpha=.25)
                d.plot(x, trend, color=PURPLE, lw=2, ls="--")

    return [
        (6, "Un ETF intenta replicar un índice. Ambos parten de 100.", lambda c, p: draw(c, p, 2, 120)),
        (6, "Con el tiempo, comisiones y costos de replicar dejan al fondo algo por debajo.",
         lambda c, p: draw(c, p, 120, n)),
        (6, "La diferencia de seguimiento es esa brecha acumulada en el período.",
         lambda c, p: draw(c, p, 2, n, show_diff=True)),
        (6.5, "El tracking error mide cuánto oscila esa diferencia: la regularidad del seguimiento.",
         lambda c, p: draw(c, 1, n, n, show_diff=True, band=True)),
        (5, "Compara siempre fondo e índice en el mismo período y con los mismos datos.",
         lambda c, p: draw(c, 1, n, n, show_diff=True, band=True)),
    ]


@capsule("6.2-a", "indice-ponderado", 6, "6.2.1 · Cómo se mueve un índice ponderado",
         "Índice ponderado: quién lo mueve",
         "Calcular contribuciones por peso y ver por qué un índice puede subir con la mayoría de componentes a la baja.")
def _():
    comp = [("A", 30, 3.0), ("B", 25, -1.0), ("C", 20, -1.0), ("D", 15, -2.0), ("E", 10, -1.0)]
    total = sum(w * r / 100 for _, w, r in comp)

    def draw(ctx, p, stage):
        b = ctx.canvas()
        label(b, 2.2, 6.3, "Componente · peso", MUTED, 14)
        label(b, 7.0, 6.3, "Variación", MUTED, 14)
        label(b, 12.0, 6.3, "Contribución = peso × variación", MUTED, 14)
        for i, (nm, w, r) in enumerate(comp):
            y = 5.3 - i * 1.0
            label(b, 0.8, y, nm, TEXT, 20)
            b.add_patch(Rectangle((1.4, y - .3), w / 30 * 2.8, 0.6, color=GOLD, alpha=.8))
            label(b, 1.5 + w / 30 * 2.8, y, f" {w} %", GOLD, 15, ha="left")
            if stage >= 1:
                g = seg(p, i * .12, i * .12 + .3) if stage == 1 else 1
                label(b, 7.0, y, f"{money(r, 1, True)} %", GREEN if r > 0 else RED, 19, alpha=g)
            if stage >= 2:
                cval = w * r / 100
                g = seg(p, i * .12, i * .12 + .3) if stage == 2 else 1
                b.plot([12, 12], [y - .4, y + .4], color=MUTED, lw=1)
                b.add_patch(Rectangle((12, y - .28), cval * 2.4 * g, 0.56, color=GREEN if cval > 0 else RED))
                label(b, 12 + (cval * 2.4 + (.25 if cval > 0 else -.25)) * g, y, f"{money(cval, 2, True)}",
                      TEXT, 14, ha="left" if cval > 0 else "right", alpha=g)
        if stage >= 3:
            label(b, 8, 0.25, f"Índice: {money(total, 2, True)} %  ·  4 de 5 componentes bajaron",
                  GOLD, 20, box=PANEL, alpha=seg(p, 0, .4))

    return [
        (5.5, "En un índice ponderado, cada componente pesa distinto.", lambda c, p: draw(c, p, 0)),
        (5.5, "Hoy solo A sube; los otros cuatro bajan.", lambda c, p: draw(c, p, 1)),
        (6.5, "Contribución de cada uno = peso × variación. A aporta +0,90 puntos porcentuales.",
         lambda c, p: draw(c, p, 2)),
        (6.5, "El índice sube un 0,05 % aunque la mayoría baja: eso es concentración.",
         lambda c, p: draw(c, p, 3)),
        (5, "Por eso conviene mirar la amplitud: cuántos componentes acompañan el movimiento.",
         lambda c, p: draw(c, 1, 3)),
    ]


@capsule("6.3-a", "pip-y-lote", 6, "6.3.1 · Divisa base, cotizada, pip y lote", "Pip, lote y valor del pip",
         "Calcular un movimiento en pips y convertirlo en dinero según el tamaño del lote.")
def _():
    rows = [("Lote estándar", "100.000 EUR", 10.0), ("Minilote", "10.000 EUR", 1.0), ("Microlote", "1.000 EUR", 0.1)]

    def draw(ctx, p, stage):
        b = ctx.canvas()
        label(b, 4.0, 6.2, "EUR/USD", GOLD, 26)
        label(b, 4.0, 5.55, "base / cotizada: cuántos USD cuesta 1 EUR", MUTED, 14, weight="normal")
        frm, to = 1.0850, 1.0880
        cur = lerp(frm, to, seg(p, 0, .8)) if stage == 1 else (to if stage > 1 else frm)
        label(b, 4.0, 4.4, f"{cur:.4f}".replace(".", ","), TEXT, 46)
        if stage >= 1:
            label(b, 4.0, 3.3, f"+{(cur - frm) * 1e4:.0f} pips", GREEN, 26)
            label(b, 4.0, 2.6, "1 pip = 0,0001 (cuarto decimal)", MUTED, 14, weight="normal")
        if stage >= 2:
            for i, (nm, sz, pv) in enumerate(rows):
                g = seg(p, i * .2, i * .2 + .35) if stage == 2 else 1
                y = 5.4 - i * 1.6
                card(b, 8.4, y - .55, 7.2, 1.25, "", "", GOLD, alpha=g)
                label(b, 8.7, y + .25, f"{nm} · {sz}", TEXT, 16, ha="left", alpha=g)
                label(b, 8.7, y - .2, f"1 pip = {money(pv, 2)} USD", MUTED, 14, ha="left", weight="normal", alpha=g)
                if stage >= 3:
                    label(b, 15.3, y + .02, f"30 pips = {money(30 * pv, 0, True)} USD", GREEN, 18, ha="right")
        if stage >= 4:
            label(b, 8, 0.25, "En pares con USD como cotizada el valor del pip ya está en USD; si no, hay que convertir.",
                  GOLD, 15, box=PANEL)

    return [
        (5.5, "En EUR/USD el euro es la divisa base y el dólar, la cotizada.", lambda c, p: draw(c, p, 0)),
        (5.5, "De 1,0850 a 1,0880 el precio sube 30 pips.", lambda c, p: draw(c, p, 1)),
        (6.5, "El valor de cada pip depende del tamaño de la posición.", lambda c, p: draw(c, p, 2)),
        (6, "Los mismos 30 pips son 300, 30 o 3 USD según el lote.", lambda c, p: draw(c, p, 3)),
        (6, "Si la cuenta está en otra moneda, el resultado se convierte al tipo de cambio.",
         lambda c, p: draw(c, p, 4)),
    ]


@capsule("6.4-a", "perpetuo-y-liquidacion", 6, "6.4.2 · Perpetuos, funding y liquidación",
         "Perpetuo apalancado: dónde está la liquidación",
         "Ubicar el precio de liquidación de un perpetuo apalancado y compararlo con mantener BTC al contado.")
def _():
    n = 60
    px = path([(0, 60000), (15, 61200), (30, 57000), (45, 53500), (59, 52000)], n, 120, 64)
    entry, lev = 60000, 10
    # Aproximación con margen de mantenimiento del 0,5 %: liquidación ≈ entrada × (1 − 1/apalancamiento + 0,005)
    liq = entry * (1 - 1 / lev + 0.005)
    i_liq = next(i for i in range(n) if px[i] <= liq)

    def draw(ctx, p, k0, k1, show_liq=False, compare=False):
        k = max(2, int(lerp(k0, k1, p)))
        a = ctx.ax(rect=(0.065, 0.215, 0.58, 0.6), xlim=(0, n), ylim=(50000, 63000))
        a.set_xticks([]); a.yaxis.tick_right()
        a.yaxis.set_major_formatter(lambda v, _: money(v, 0))
        a.plot(px[:k], color=GOLD, lw=2.6)
        a.text(1, 62300, "BTC precio de marca (simulado)", color=MUTED, size=14)
        hline(a, entry, "entrada 60.000", TEXT, "-", 1.5)
        if show_liq:
            hline(a, liq, f"liquidación ≈ {money(liq, 0)}", RED)
            if k > i_liq:
                a.scatter([i_liq], [px[i_liq]], s=240, color=RED, zorder=9, edgecolor=TEXT)
        if compare:
            q = ctx.ax("q", rect=(0.68, 0.215, 0.27, 0.6), frame=False, xlim=(0, 1), ylim=(0, 1))
            cur = px[k - 1]
            spot = cur - entry
            perp = -6000 if k > i_liq else (cur - entry)
            card(q, 0.02, 0.55, 0.96, 0.4, "Contado: 1 BTC (60.000 USD)",
                 f"{money(spot, 0, True)} USD no realizados\nsigues teniendo el BTC", BLUE, tsize=15, bsize=15)
            card(q, 0.02, 0.05, 0.96, 0.4, "Perpetuo 10×: margen 6.000 USD",
                 ("LIQUIDADO: margen perdido\n−6.000 USD" if k > i_liq else
                  f"{money(perp, 0, True)} USD sobre 6.000 de margen"), RED, tsize=15, bsize=15)

    return [
        (5.5, "Compras 1 BTC en 60.000 USD: al contado, o con un perpetuo apalancado 10 veces.",
         lambda c, p: draw(c, p, 2, 15)),
        (6.5, "Con 10× aportas 6.000 USD de margen. Una caída cercana al 10 % lo agota.",
         lambda c, p: draw(c, p, 15, 15, show_liq=True)),
        (6, "La liquidación se calcula con el precio de marca y el margen de mantenimiento: llega antes del −10 %.",
         lambda c, p: draw(c, p, 15, 30, show_liq=True)),
        (7, "Mismo movimiento: al contado tienes una pérdida flotante; en el perpetuo, el margen desaparece.",
         lambda c, p: draw(c, p, 30, n, show_liq=True, compare=True)),
        (5.5, "Además, el funding se paga o cobra periódicamente mientras la posición siga abierta.",
         lambda c, p: draw(c, 1, n, n, show_liq=True, compare=True)),
    ]


@capsule("6.5-a", "tick-multiplicador-ajuste-diario", 6, "6.5.1 · Puntos, ticks y multiplicador",
         "Tick, multiplicador y ajuste diario",
         "Pasar de puntos a dinero con la ficha del contrato y seguir el ajuste diario del margen.")
def _():
    days = ["Día 1", "Día 2", "Día 3", "Día 4"]
    settle = [2380.0, 2386.0, 2377.0, 2371.0]
    mult = 100
    init, maint = 10000.0, 9500.0

    def spec(ctx, p, stage):
        b = ctx.canvas()
        card(b, 0.3, 3.4, 7.2, 2.9, "", "", GOLD)
        label(b, 3.9, 5.95, "Ficha del contrato (ejemplo)", GOLD, 18)
        for i, t in enumerate(["Tamaño: 100 onzas", "Tick mínimo: 0,10 USD", "Valor del tick: 0,10 × 100 = 10 USD",
                               "Micro: 10 onzas → 1 USD por tick"]):
            label(b, 0.7, 5.35 - i * 0.48, t, TEXT, 15, ha="left", weight="normal")
        if stage >= 1:
            g = seg(p, 0, .5) if stage == 1 else 1
            label(b, 11.8, 5.6, "2.380,0 → 2.395,0 = +15 USD por onza", TEXT, 19, alpha=g)
            label(b, 11.8, 4.8, "= 150 ticks", GOLD, 19, alpha=g)
            label(b, 11.8, 3.9, "Estándar: 150 × 10 USD = +1.500 USD", GREEN, 18, alpha=g)
            label(b, 11.8, 3.3, "Micro: 150 × 1 USD = +150 USD", GREEN, 18, alpha=g)
        label(b, 4.0, 2.8, "Consulta siempre la ficha oficial del mercado", MUTED, 13, weight="normal")

    def daily(ctx, p, upto):
        a = ctx.ax(rect=(0.065, 0.215, 0.55, 0.6), xlim=(-0.5, 3.5), ylim=(5000, 12500))
        a.set_xticks(range(4), days, color=TEXT, size=14)
        a.yaxis.set_major_formatter(lambda v, _: money(v, 0))
        bal = [init]
        for i in range(1, 4):
            bal.append(bal[-1] + (settle[i] - settle[i - 1]) * mult)
        a.axhline(maint, color=RED, ls="--", lw=2)
        a.text(-0.45, maint - 350, "margen de mantenimiento", color=RED, size=13, ha="left", weight="bold")
        k = min(upto + 1, 4)
        a.plot(range(k), bal[:k], color=GOLD, lw=3, marker="o", ms=10)
        q = ctx.ax("q", rect=(0.65, 0.215, 0.3, 0.6), frame=False, xlim=(0, 1), ylim=(0, 1))
        for i in range(k):
            ch = 0 if i == 0 else (settle[i] - settle[i - 1]) * mult
            label(q, 0.02, 0.9 - i * 0.18, f"{days[i]} · liquida {money(settle[i], 1)}", TEXT, 14, ha="left",
                  weight="normal")
            label(q, 0.98, 0.9 - i * 0.18, money(ch, 0, True) if i else "inicio", GREEN if ch > 0 else RED if ch < 0 else MUTED,
                  15, ha="right")
        if upto >= 3:
            label(q, 0.5, 0.12, "Bajo el mantenimiento:\nreponer margen o cerrar", RED, 15, box=PANEL)

    return [
        (6, "Un futuro se negocia por contratos. La ficha dice cuánto vale cada tick.",
         lambda c, p: spec(c, p, 0)),
        (6.5, "Un movimiento de 15 USD son 150 ticks: 1.500 USD en el estándar y 150 en el micro.",
         lambda c, p: spec(c, p, 1)),
        (6, "Cada día la cámara liquida la posición al precio de cierre y ajusta tu cuenta.",
         lambda c, p: daily(c, p, int(lerp(0, 1.99, p)))),
        (6, "Las pérdidas se descuentan del margen al final de cada sesión, no solo al cerrar.",
         lambda c, p: daily(c, p, 2)),
        (6.5, "Si el saldo cae bajo el margen de mantenimiento, debes reponer margen o la posición se cierra.",
         lambda c, p: daily(c, p, 3)),
    ]


@capsule("6.6-a", "contango-backwardation", 6, "6.6.2 · Cómo leer una curva de futuros",
         "Contango y backwardation",
         "Leer la pendiente de una curva de futuros y entender el efecto del rollover.")
def _():
    m = ["Spot", "1M", "2M", "3M", "6M", "9M", "12M"]
    x = np.array([0, 1, 2, 3, 6, 9, 12])
    cont = 70 + 0.55 * x
    back = 70 + 2.6 * np.exp(-x / 4) - 2.6 + (x == 0) * 0 - 0.18 * x
    back = 74 - 0.45 * x

    def draw(ctx, p, which, roll=False):
        a = ctx.ax(xlim=(-0.6, 12.6), ylim=(66, 79))
        a.set_xticks(x, m, color=TEXT, size=14)
        a.yaxis.set_major_formatter(lambda v, _: f"{v:.0f} USD")
        a.set_xlabel("vencimiento", color=MUTED, size=13)
        if which in ("c", "both"):
            k = 7 if which == "both" else max(1, int(7 * seg(p, 0, .8)) + 1)
            a.plot(x[:k], cont[:k], color=BLUE, lw=3, marker="o", ms=9, label="Contango")
        if which in ("b", "both"):
            k = 7 if which == "both" else max(1, int(7 * seg(p, 0, .8)) + 1)
            a.plot(x[:k], back[:k], color=GOLD, lw=3, marker="o", ms=9, label="Backwardation")
        a.legend(loc="upper left", frameon=False, labelcolor=TEXT, fontsize=15)
        a.text(12.4, 78.3, "Petróleo · curvas ilustrativas", color=MUTED, size=13, ha="right", va="top")
        if roll:
            g = seg(p, 0, .5)
            arrow(a, 1, cont[1], 2, cont[2], RED, 3, alpha=g)
            label(a, 0.0, 67.6, "Rollover en contango: vendes el vencimiento cercano\ny compras el siguiente, más caro (costo)",
                  RED, 14, alpha=g, ha="left")
            arrow(a, 1, back[1], 2, back[2], GREEN, 3, alpha=seg(p, .4, .8))
            label(a, 0.0, 75.8, "En backwardation el siguiente vencimiento es más barato", GREEN, 14,
                  alpha=seg(p, .4, .8), ha="left")

    return [
        (6, "Contango: los vencimientos lejanos cotizan más caros que los cercanos.", lambda c, p: draw(c, p, "c")),
        (6, "Backwardation: los lejanos cotizan más baratos. Suele indicar escasez inmediata.",
         lambda c, p: draw(c, p, "b")),
        (7.5, "Al renovar la posición (rollover), la pendiente de la curva cambia tu resultado aunque el spot no se mueva.",
         lambda c, p: draw(c, p, "both", roll=True)),
        (5.5, "Un producto que sigue futuros puede desviarse del precio spot por este efecto.",
         lambda c, p: draw(c, 1, "both", roll=True)),
    ]


@capsule("6.7-a", "perfil-call-put", 6, "6.7.1 · Call, put, strike y prima",
         "Perfil de una call y una put al vencimiento",
         "Dibujar el resultado al vencimiento de una call y una put compradas y ubicar su punto de equilibrio.")
def _():
    S = np.linspace(80, 120, 400)
    K, pc, pp = 100, 5, 4
    call = np.maximum(S - K, 0) - pc
    put = np.maximum(K - S, 0) - pp

    def draw(ctx, p, which, mark=None):
        a = ctx.ax(xlim=(80, 120), ylim=(-8, 16))
        a.axhline(0, color=MUTED, lw=1.5)
        a.axvline(K, color=MUTED, lw=1, ls=":")
        a.text(K + .3, -7.4, "strike 100", color=MUTED, size=13, ha="left")
        a.set_xlabel("precio del subyacente al vencimiento", color=MUTED, size=13)
        a.set_ylabel("resultado por unidad", color=MUTED, size=13)
        k = int(len(S) * seg(p, 0, .8)) + 2
        if which in ("call", "both"):
            kk = len(S) if which == "both" else k
            a.plot(S[:kk], call[:kk], color=GREEN, lw=3.5, label="Call comprada (prima 5)")
            a.scatter([105], [0], s=160, color=GREEN, zorder=8)
            a.text(105.5, -1.6, "equilibrio 105", color=GREEN, size=14, weight="bold")
        if which in ("put", "both"):
            kk = len(S) if which == "both" else k
            a.plot(S[:kk], put[:kk], color=PURPLE, lw=3.5, label="Put comprada (prima 4)")
            a.scatter([96], [0], s=160, color=PURPLE, zorder=8)
            a.text(95.5, -1.6, "equilibrio 96", color=PURPLE, size=14, weight="bold", ha="right")
        a.legend(loc="upper center", frameon=False, labelcolor=TEXT, fontsize=15, ncol=2)
        if mark:
            s = lerp(84, 116, p)
            a.axvline(s, color=GOLD, lw=2)
            c_, p_ = max(s - K, 0) - pc, max(K - s, 0) - pp
            a.text(s + (.4 if s < 112 else -.4), 12, f"precio {s:.0f}\ncall {money(c_, 0, True)}\nput {money(p_, 0, True)}", color=GOLD, size=14,
                   weight="bold", ha="left" if s < 112 else "right")

    return [
        (6.5, "Una call da derecho a comprar al strike. Pagas una prima de 5: es tu pérdida máxima.",
         lambda c, p: draw(c, p, "call")),
        (5.5, "Gana si al vencer el precio supera strike + prima: 105.", lambda c, p: draw(c, 1, "call")),
        (6.5, "Una put da derecho a vender al strike. Prima 4: gana bajo 96.", lambda c, p: draw(c, p, "put")),
        (7, "Recorre el precio: la pérdida queda limitada a la prima; la ganancia depende del movimiento.",
         lambda c, p: draw(c, p, "both", mark=True)),
        (5, "Antes del vencimiento el valor también depende del tiempo y la volatilidad.",
         lambda c, p: draw(c, 1, "both")),
    ]


@capsule("6.8-a", "precio-y-rendimiento-del-bono", 6, "6.8.1 · Bonos: precio frente a rendimiento",
         "Bonos: cuando sube el rendimiento, baja el precio",
         "Ver la relación inversa y convexa entre precio y rendimiento de un bono.")
def _():
    def price(y, c=4.0, n=10):
        t = np.arange(1, n + 1)
        return np.sum(c / (1 + y / 100) ** t) + 100 / (1 + y / 100) ** n

    ys = np.linspace(1, 8, 200)
    ps = np.array([price(y) for y in ys])

    def draw(ctx, p, y0, y1, curve=True, seesaw=True):
        y = lerp(y0, y1, p)
        pr = price(y)
        if seesaw:
            b = ctx.ax("s", rect=(0.065, 0.215, 0.38, 0.6), frame=False, xlim=(-1.2, 1.2), ylim=(-1, 1.2))
            ang = np.clip((y - 4) * 0.12, -0.45, 0.45)
            xs = np.array([-1, 1]) * np.cos(ang)
            yy = np.array([1, -1]) * np.sin(ang) * -1
            b.plot(xs, yy, color=TEXT, lw=5)
            b.fill([-0.12, 0.12, 0], [-0.5, -0.5, -0.02], color=MUTED)
            label(b, xs[0], yy[0] + 0.2, f"Precio\n{money(pr, 1)}", GOLD, 18)
            label(b, xs[1], yy[1] + 0.2, f"Rendimiento\n{money(y, 2)} %", BLUE, 18)
            label(b, 0, -0.8, "Bono a 10 años · cupón 4 %", MUTED, 14, weight="normal")
        if curve:
            a = ctx.ax(rect=(0.52, 0.215, 0.42, 0.6), xlim=(1, 8), ylim=(70, 130))
            a.plot(ys, ps, color=GOLD, lw=3)
            a.scatter([y], [pr], s=200, color=BLUE, zorder=8, edgecolor=TEXT)
            a.set_xlabel("rendimiento (%)", color=MUTED, size=13)
            a.set_ylabel("precio", color=MUTED, size=13)

    return [
        (6, "Un bono a 10 años con cupón del 4 % vale 100 cuando el mercado exige un 4 %.",
         lambda c, p: draw(c, 0, 4, 4)),
        (6.5, "Si los nuevos bonos rinden un 5 %, el tuyo vale menos: su precio baja hasta igualar el rendimiento.",
         lambda c, p: draw(c, p, 4, 5)),
        (6.5, "Si el rendimiento baja al 3 %, el precio sube.", lambda c, p: draw(c, p, 5, 3)),
        (6.5, "La curva es convexa: una bajada de tasas sube el precio más de lo que lo baja una subida igual.",
         lambda c, p: draw(c, p, 3, 6)),
        (5, "A mayor plazo (duración), mayor sensibilidad del precio a las tasas.",
         lambda c, p: draw(c, 1, 6, 6)),
    ]
