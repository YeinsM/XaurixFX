"""Cápsulas Python de los niveles 7 y 8."""
import numpy as np
from matplotlib.patches import Rectangle

from core import (BG, BLUE, BORDER, GOLD, GREEN, MUTED, PANEL, PURPLE, RED, TEXT, arrow,
                  capsule, card, label, lerp, money, seg)


# ======================================================== NIVEL 7
@capsule("7.1-a", "sesgo-de-supervivencia", 7, "7.1 · Tres sesgos que inflan un backtest",
         "Sesgo de supervivencia",
         "Ver cómo excluir activos que desaparecieron infla el resultado de un backtest.")
def _():
    n, m = 120, 24
    rng = np.random.default_rng(71)
    paths = 100 * np.cumprod(1 + rng.normal(0.0008, 0.018, (m, n)), axis=1)
    order = np.argsort(paths[:, -1])
    dead = order[:7]
    death = {d: int(rng.integers(40, 100)) for d in dead}
    for d, t in death.items():
        paths[d, t:] = np.nan
    eq_all = np.array([np.mean([paths[i, min(t, death.get(i, n) - 1)] if i not in death or t < death[i]
                                else 0.0 for i in range(m)]) for t in range(n)])
    alive = [i for i in range(m) if i not in death]
    eq_surv = paths[alive].mean(axis=0)

    def draw(ctx, p, k0, k1, fade_dead=False, avg=False):
        k = max(2, int(lerp(k0, k1, p)))
        a = ctx.ax(xlim=(0, n), ylim=(0, 230))
        a.set_xticks([])
        for i in range(m):
            col = RED if i in death else BLUE
            al = (0.08 if fade_dead and i in death else 0.45)
            a.plot(paths[i, :k], color=col, lw=1.4, alpha=al)
            if i in death and death[i] < k and not fade_dead:
                a.scatter([death[i] - 1], [paths[i, death[i] - 1]], marker="x", color=RED, s=80, zorder=6)
        if avg:
            a.plot(eq_surv[:k], color=GOLD, lw=3.5, label="Promedio solo de supervivientes")
            a.plot(eq_all[:k], color=TEXT, lw=3, ls="--", label="Promedio del universo completo")
            a.legend(loc="upper left", frameon=False, labelcolor=TEXT, fontsize=15)
        a.text(n - 1, 220, "24 acciones simuladas · × = deja de cotizar", color=MUTED, size=13, ha="right")

    return [
        (6, "Un universo de 24 acciones al inicio del período.", lambda c, p: draw(c, p, 2, 60)),
        (6, "Algunas quiebran o dejan de cotizar en el camino.", lambda c, p: draw(c, p, 60, n)),
        (6, "Si hoy descargas solo las que siguen vivas, esas desaparecen de tus datos.",
         lambda c, p: draw(c, p, n, n, fade_dead=True)),
        (7, "El promedio de los supervivientes queda por encima del que realmente hubieras obtenido.",
         lambda c, p: draw(c, p, 2, n, fade_dead=True, avg=True)),
        (5, "Usa datos que incluyan los activos retirados, con la composición de cada fecha.",
         lambda c, p: draw(c, 1, n, n, fade_dead=True, avg=True)),
    ]


@capsule("7.1-b", "sobreajuste", 7, "7.1 · Tres sesgos que inflan un backtest", "Sobreajuste: la curva demasiado perfecta",
         "Reconocer el sobreajuste por el contraste entre la muestra de ajuste y datos nuevos.")
def _():
    n_in, n_out = 160, 80
    rng = np.random.default_rng(72)
    ins = np.cumsum(np.abs(rng.normal(0.6, 0.5, n_in)) * (rng.random(n_in) > 0.12) - (rng.random(n_in) < 0.12) * 0.4)
    out = ins[-1] + np.cumsum(rng.normal(-0.08, 1.1, n_out))
    combos = rng.normal(0, 25, 1200)
    combos[777] = ins[-1]

    def draw(ctx, p, stage):
        if stage == 0:
            a = ctx.ax(xlim=(-1, 1200), ylim=(-80, 120))
            k = min(1200, int(1200 * seg(p, 0, .8)) + 1)
            a.scatter(np.arange(k), combos[:k], s=8, color=BLUE, alpha=.6)
            a.set_xlabel("combinaciones de parámetros probadas", color=MUTED, size=13)
            a.set_ylabel("resultado en la muestra", color=MUTED, size=13)
            if k > 777:
                a.scatter([777], [combos[777]], s=260, color=GOLD, zorder=6, edgecolor=TEXT)
                label(a, 777, combos[777] + 12, "la mejor de 1.200", GOLD, 16)
            return
        a = ctx.ax(xlim=(0, n_in + n_out), ylim=(-10, ins.max() + 25))
        a.set_xticks([])
        a.axvspan(n_in, n_in + n_out, color=PURPLE, alpha=.08)
        a.text(n_in / 2, ins.max() + 18, "muestra de ajuste", color=MUTED, size=15, ha="center")
        a.text(n_in + n_out / 2, ins.max() + 18, "datos nuevos", color=PURPLE, size=15, ha="center", weight="bold")
        k = n_in if stage == 1 else n_in + int(n_out * seg(p, 0, .8))
        a.plot(np.arange(min(k, n_in)), ins[:min(k, n_in)], color=GOLD, lw=3)
        if k > n_in:
            a.plot(np.arange(n_in - 1, k), np.r_[ins[-1], out[:k - n_in]], color=RED, lw=3)
        if stage >= 3:
            label(a, 55, ins.max() * .8, "Señales de alarma: muchos parámetros,\nreglas muy específicas, pocas operaciones",
                  TEXT, 15, box=PANEL)

    return [
        (6.5, "Pruebas 1.200 combinaciones de parámetros y eliges la mejor.", lambda c, p: draw(c, p, 0)),
        (5.5, "En la muestra de ajuste la curva parece casi perfecta.", lambda c, p: draw(c, p, 1)),
        (6.5, "En datos que la estrategia nunca vio, el resultado se desvanece: se ajustó al ruido.",
         lambda c, p: draw(c, p, 2)),
        (6, "Reserva datos fuera de muestra y desconfía de las curvas demasiado limpias.",
         lambda c, p: draw(c, 1, 3)),
    ]


@capsule("7.2-a", "walk-forward", 7, "7.2 · Validación cronológica de una estrategia", "Validación walk-forward",
         "Entender la validación por ventanas móviles: ajustar en el pasado y evaluar en el tramo siguiente.")
def _():
    W, T, steps = 4, 1, 6
    rng = np.random.default_rng(73)
    oos = [np.cumsum(rng.normal(0.25, 1, 20)) for _ in range(steps)]

    def draw(ctx, p, upto, stitch=False):
        b = ctx.canvas()
        label(b, 8, 6.35, "tiempo →", MUTED, 14)
        for s in range(steps):
            if s > upto:
                break
            g = 1.0 if s < upto else seg(p, 0, .5)
            y = 5.75 - s * 0.5
            x0 = 1 + s * 1.5
            b.add_patch(Rectangle((x0, y), W * 1.5, 0.4, color=BLUE, alpha=.75 * g))
            b.add_patch(Rectangle((x0 + W * 1.5, y), T * 1.5, 0.4, color=GOLD, alpha=g))
            label(b, x0 + W * 0.75, y + .2, "ajuste", BG, 13, alpha=g)
            label(b, x0 + W * 1.5 + .75, y + .2, "prueba", BG, 13, alpha=g)
        if stitch:
            a = ctx.ax("eq", rect=(0.065, 0.215, 0.87, 0.24), xlim=(0, steps * 20), ylim=None)
            a.set_xticks([])
            eq = np.concatenate([o + sum(oo[-1] for oo in oos[:i]) for i, o in enumerate(oos)])
            k = int(len(eq) * seg(p, 0, .8)) + 2
            a.plot(eq[:k], color=GOLD, lw=3)
            a.set_ylim(eq.min() - 3, eq.max() + 3)
            for i in range(1, steps):
                a.axvline(i * 20, color=BORDER, lw=1)
            a.text(1, eq.max(), "curva solo con los tramos de prueba", color=GOLD, size=13, weight="bold")

    return [
        (6, "Ajustas los parámetros con una ventana del pasado y los pruebas en el tramo siguiente.",
         lambda c, p: draw(c, p, 0)),
        (7, "Luego desplazas ambas ventanas hacia adelante y repites, siempre en orden cronológico.",
         lambda c, p: draw(c, p, int(lerp(1, 5.99, p)))),
        (7, "Unes solo los tramos de prueba: esa es la evaluación honesta fuera de muestra.",
         lambda c, p: draw(c, p, 5, stitch=True)),
        (5.5, "Si los parámetros cambian mucho de una ventana a otra, la idea es frágil.",
         lambda c, p: draw(c, 1, 5, stitch=True)),
    ]


@capsule("7.4-a", "monte-carlo-de-secuencias", 7, "7.4 · Cuando varias posiciones caen juntas",
         "Monte Carlo: el orden de las operaciones",
         "Usar remuestreos de la secuencia de operaciones para estimar drawdowns posibles.")
def _():
    rng = np.random.default_rng(74)
    trades = np.r_[np.full(45, 1.5), np.full(55, -1.0)]
    rng.shuffle(trades)
    sims = np.array([np.cumsum(rng.permutation(trades)) for _ in range(200)])
    orig = np.cumsum(trades)
    dd = np.array([np.max(np.maximum.accumulate(s) - s) for s in sims])

    def draw(ctx, p, nsim, hist=False):
        a = ctx.ax(rect=(0.065, 0.215, 0.58 if hist else 0.87, 0.6), xlim=(0, 100), ylim=(sims.min() - 2, sims.max() + 2))
        a.set_xlabel("operaciones", color=MUTED, size=13)
        a.set_ylabel("resultado acumulado (R)", color=MUTED, size=13)
        k = int(nsim)
        for s in sims[:k]:
            a.plot(s, color=BLUE, lw=1, alpha=.18)
        a.plot(orig, color=GOLD, lw=3.2, label="secuencia observada")
        a.legend(loc="upper left", frameon=False, labelcolor=TEXT, fontsize=14)
        if hist:
            h = ctx.ax("h", rect=(0.69, 0.215, 0.25, 0.6))
            h.hist(dd, bins=18, color=RED, alpha=.8, orientation="horizontal")
            h.set_ylabel("drawdown máximo (R)", color=MUTED, size=13)
            p95 = np.percentile(dd, 95)
            h.axhline(p95, color=GOLD, lw=2, ls="--")
            h.text(h.get_xlim()[1] * .95, p95 + .4, f"95 %: {p95:.0f}R", color=GOLD, size=14, ha="right", weight="bold")

    return [
        (5.5, "100 operaciones: 45 ganan 1,5R y 55 pierden 1R. Esta es la secuencia que observaste.",
         lambda c, p: draw(c, p, 0)),
        (7, "Mismas operaciones en otro orden: el resultado final es igual, el camino no.",
         lambda c, p: draw(c, p, lerp(1, 200, p))),
        (7, "La distribución de caídas máximas muestra lo que podrías vivir con la misma ventaja.",
         lambda c, p: draw(c, p, 200, hist=True)),
        (5.5, "Dimensiona pensando en la peor caída plausible, no en la que tuviste.",
         lambda c, p: draw(c, 1, 200, hist=True)),
    ]


# ======================================================== NIVEL 8
@capsule("8.1-a", "orden-de-mercado-contra-el-libro", 8, "8.1 · Qué ocurre dentro del libro de órdenes",
         "Una orden de mercado contra el libro",
         "Ver cómo una orden agresiva grande consume varios niveles y empeora el precio medio.")
def _():
    asks = [(100.02, 2), (100.03, 3), (100.05, 2), (100.08, 4)]
    bids = [(100.00, 3), (99.99, 2), (99.97, 4), (99.95, 3)]
    size = 8

    def draw(ctx, p, stage):
        b = ctx.canvas()
        label(b, 3.8, 6.35, "Libro de órdenes", MUTED, 15)
        left = size if stage >= 2 else 0
        prog = seg(p, 0, .9) if stage == 2 else (1 if stage > 2 else 0)
        to_take = size * prog
        fills = []
        for i, (px, q) in enumerate(asks):
            y = 3.6 + i * 0.68
            t = min(q, max(0.0, to_take))
            to_take -= t
            if t > 0:
                fills.append((px, t))
            b.add_patch(Rectangle((4.0, y), q * 0.55, 0.5, color=RED, alpha=.35))
            if t:
                b.add_patch(Rectangle((4.0, y), t * 0.55, 0.5, color=GOLD))
            label(b, 3.6, y + .25, money(px), RED, 15, ha="right")
            label(b, 4.1 + q * .55, y + .25, f" {q}", TEXT, 13, ha="left", weight="normal")
        for i, (px, q) in enumerate(bids):
            y = 2.8 - i * 0.68
            b.add_patch(Rectangle((4.0, y), q * 0.55, 0.5, color=GREEN, alpha=.35))
            label(b, 3.6, y + .25, money(px), GREEN, 15, ha="right")
        label(b, 6.6, 3.35, "spread", MUTED, 13, weight="normal")
        card(b, 9.2, 4.9, 6.3, 1.3, "BUY MARKET 8 lotes", "orden agresiva: toma liquidez", GOLD)
        if fills:
            done = sum(t for _, t in fills)
            avg = sum(px * t for px, t in fills) / done
            label(b, 12.35, 4.0, f"Ejecutado: {done:.0f} lotes en {len(fills)} niveles", TEXT, 17)
            label(b, 12.35, 3.3, f"Precio medio: {avg:.3f}".replace(".", ","), GOLD, 19)
            if stage >= 3:
                label(b, 12.35, 2.4, f"Mejor ask era 100,02 → costo extra ≈ {(avg - 100.02) * 100:.1f} centavos/unidad".replace(".", ","),
                      RED, 15)
        if stage >= 4:
            label(b, 12.35, 1.2, "Las órdenes pasivas (limit) esperan;\nlas agresivas pagan en precio.", TEXT, 15,
                  box=PANEL)

    return [
        (5.5, "El libro muestra órdenes de compra (bid) y de venta (ask) en cada precio.", lambda c, p: draw(c, p, 0)),
        (5, "Envías una compra a mercado de 8 lotes.", lambda c, p: draw(c, p, 1)),
        (7, "Consume todo lo disponible en cada nivel y sube al siguiente.", lambda c, p: draw(c, p, 2)),
        (6, "El precio medio queda por encima del mejor ask: impacto de mercado.", lambda c, p: draw(c, p, 3)),
        (5.5, "Con poca profundidad, el tamaño mismo de la orden mueve el precio.", lambda c, p: draw(c, p, 4)),
    ]


@capsule("8.2-a", "de-senal-a-ejecucion", 8, "8.2 · De señal a ejecución en demo",
         "De la señal a la posición: reconciliar",
         "Seguir una señal hasta la posición con identificadores y detectar duplicados y descuadres.")
def _():
    stages = ["Señal", "Orden", "Ejecución", "Posición"]
    cols = [BLUE, PURPLE, GOLD, GREEN]

    def draw(ctx, p, step):
        b = ctx.canvas()
        for i, (s, c) in enumerate(zip(stages, cols)):
            x = 0.4 + i * 4.0
            g = 1.0 if i < step else (seg(p, 0, .5) if i == step else 0.25)
            card(b, x, 4.5, 3.3, 1.6, s, ["id S-0412", "id O-0412", "id E-0412", "1 lote XAUUSD"][i], c, alpha=g)
            if i < 3:
                arrow(b, x + 3.4, 5.3, x + 3.9, 5.3, MUTED, alpha=g)
        if step >= 4:
            g = seg(p, 0, .4)
            card(b, 0.4, 2.4, 7.3, 1.6, "Señal duplicada S-0412", "mismo id → se ignora, no se envía otra orden",
                 RED, alpha=g, bsize=14)
        if step >= 5:
            g = seg(p, 0, .4)
            card(b, 8.3, 2.4, 7.3, 1.6, "Reconexión", "comparar posiciones del broker con el registro propio",
                 GOLD, alpha=g, bsize=14)
        if step >= 6:
            g = seg(p, 0, .4)
            card(b, 3.0, 0.3, 10, 1.6, "Parada de emergencia",
                 "si señal, orden y posición no cuadran: cancelar órdenes y dejar de operar", RED, alpha=g, bsize=14)

    return [
        (5.5, "Cada señal recibe un identificador único.", lambda c, p: draw(c, p, 0)),
        (6.5, "Ese identificador viaja a la orden, a la ejecución y a la posición.", lambda c, p: draw(c, p, int(lerp(1, 3.99, p)))),
        (5.5, "Si la misma señal llega dos veces, el identificador evita una orden duplicada.",
         lambda c, p: draw(c, p, 4)),
        (6, "Tras una caída de conexión, reconcilia: lo que crees tener contra lo que el broker dice.",
         lambda c, p: draw(c, p, 5)),
        (6, "Si no cuadra, el sistema se detiene. Pruébalo en demo antes de confiar en él.",
         lambda c, p: draw(c, p, 6)),
    ]


@capsule("8.4-a", "historial-publicado-vs-replicable", 8, "8.4 · Cómo leer un historial de terceros",
         "Balance frente a equity: lo que oculta un historial",
         "Detectar pérdidas flotantes ocultas en un historial que solo muestra operaciones cerradas.")
def _():
    n = 200
    rng = np.random.default_rng(84)
    bal = np.cumsum(np.where(rng.random(n) < 0.08, 1.2, 0.0)) + 100
    floating = np.zeros(n)
    for start, depth, ln in ((30, 9, 25), (90, 16, 35), (150, 27, 40)):
        x = np.arange(ln)
        floating[start:start + ln] = -depth * np.sin(np.pi * x / ln) ** 1.5
    eq = bal + floating
    fees_bal = bal - np.linspace(0, 6, n)

    def draw(ctx, p, k0, k1, show_eq=False, show_rep=False):
        k = max(2, int(lerp(k0, k1, p)))
        a = ctx.ax(xlim=(0, n), ylim=(65, 125))
        a.set_xticks([])
        a.plot(bal[:k], color=GREEN, lw=3, label="Balance publicado (operaciones cerradas)")
        if show_eq:
            a.plot(eq[:k], color=RED, lw=2.4, label="Equity (incluye pérdidas flotantes)")
            a.fill_between(np.arange(k), eq[:k], bal[:k], color=RED, alpha=.15)
        if show_rep:
            a.plot(fees_bal[:k], color=MUTED, lw=2.2, ls="--", label="Replicable tras comisiones y deslizamiento")
        a.legend(loc="upper left", frameon=False, labelcolor=TEXT, fontsize=14)

    return [
        (6, "Este historial muestra un balance que sube casi sin caídas.", lambda c, p: draw(c, p, 2, n)),
        (6.5, "El balance solo registra operaciones cerradas. Las perdedoras pueden seguir abiertas.",
         lambda c, p: draw(c, 1, n, n)),
        (7, "La equity revela pérdidas flotantes cada vez más profundas: típico de promediar a la contra o martingala.",
         lambda c, p: draw(c, p, 2, n, show_eq=True)),
        (6, "Tu copia pagaría comisiones y deslizamiento que el historial publicado no incluye.",
         lambda c, p: draw(c, 1, n, n, show_eq=True, show_rep=True)),
        (5.5, "Pide equity, caída máxima, apalancamiento y cambios de reglas antes de confiar en un historial.",
         lambda c, p: draw(c, 1, n, n, show_eq=True, show_rep=True)),
    ]
