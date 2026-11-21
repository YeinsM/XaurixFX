"""Cápsulas Python de los niveles 1 a 4 (las de mayor impacto están en Remotion)."""
import numpy as np
from matplotlib.patches import Rectangle

from core import (BG, BLUE, BORDER, GOLD, GREEN, MUTED, PANEL, PURPLE, RED, TEXT, arrow,
                  candles, capsule, card, hline, label, lerp, money, ohlc, path, seg, zone)


def price_ax(ctx, name="main", rect=None, xlim=None, ylim=None, dec=0):
    a = ctx.ax(name, rect=rect, xlim=xlim, ylim=ylim)
    a.yaxis.tick_right()
    a.set_xticks([])
    a.yaxis.set_major_formatter(lambda v, _: money(v, dec))
    return a


# ======================================================== NIVEL 1
@capsule("1.3-a", "bid-ask-spread", 1, "1.3 · Cómo se forma el precio",
         "Bid, ask y spread",
         "Leer los dos precios de una cotización y entender el spread como costo de entrada.")
def _():
    n = 90
    mid = path([(0, 2380), (30, 2384), (60, 2381), (89, 2386)], n, 0.35, 3)
    spr = np.full(n, 0.6)
    spr[52:64] = np.r_[np.linspace(0.6, 3.0, 6), np.linspace(3.0, 0.7, 6)]
    bid, ask = mid - spr / 2, mid + spr / 2
    rect = (0.065, 0.215, 0.6, 0.6)

    def base(ctx, upto, show_quote=True, k=None):
        a = price_ax(ctx, rect=rect, xlim=(0, n), ylim=(2376.5, 2389.5), dec=0)
        x = np.arange(upto)
        a.fill_between(x, bid[:upto], ask[:upto], color=GOLD, alpha=0.35, lw=0)
        a.plot(x, ask[:upto], color=BLUE, lw=2.2, label="Ask")
        a.plot(x, bid[:upto], color=RED, lw=2.2, label="Bid")
        a.legend(loc="upper left", frameon=False, labelcolor=TEXT, fontsize=14)
        a.set_title("XAUUSD simulado · cotización tick a tick", color=MUTED, size=14, loc="left")
        if show_quote:
            i = (upto - 1) if k is None else k
            q = ctx.ax("quote", rect=(0.70, 0.25, 0.25, 0.52), frame=False, xlim=(0, 1), ylim=(0, 1))
            card(q, 0.02, 0.56, 0.96, 0.38, "ASK  (compras aquí)", money(ask[i]), BLUE, tsize=16, bsize=30)
            card(q, 0.02, 0.10, 0.96, 0.38, "BID  (vendes aquí)", money(bid[i]), RED, tsize=16, bsize=30)
            label(q, 0.5, 0.52, f"spread {money(spr[i])} USD", GOLD, 15)
        return a

    def b1(ctx, p):
        base(ctx, max(2, int(lerp(10, 45, p))))

    def b2(ctx, p):
        a = base(ctx, 45)
        a.scatter([44], [ask[44]], s=160, color=BLUE, zorder=8)
        a.scatter([44], [bid[44]], s=160, color=RED, zorder=8)
        label(a, 38, ask[44] + 1.4, "Compra a mercado → ask", BLUE, 15, alpha=seg(p, 0, .3))
        label(a, 38, bid[44] - 1.4, "Venta a mercado → bid", RED, 15, alpha=seg(p, .4, .7))

    def b3(ctx, p):
        a = base(ctx, 45)
        y0, y1 = bid[44], ask[44]
        a.annotate("", (46, y1), (46, y0), arrowprops=dict(arrowstyle="<->", color=GOLD, lw=2.5))
        label(a, 52, (y0 + y1) / 2, f"spread = ask − bid\n= {money(y1 - y0)} USD por onza", GOLD, 16,
              alpha=seg(p, 0.1, 0.4), ha="left")

    def b4(ctx, p):
        upto = int(lerp(45, 70, p))
        a = base(ctx, upto)
        if upto > 54:
            label(a, 58, 2388.2, "Dato macro: poca liquidez\nel spread se amplía", GOLD, 15, box=PANEL)

    def b5(ctx, p):
        a = base(ctx, n, k=80)
        q = ctx.axes["quote"]
        txt = (f"Compras: {money(ask[80])}\nVendes ya: {money(bid[80])}\n"
               f"Resultado: {money(bid[80] - ask[80], sign=True)} USD/oz")
        label(a, 30, 2378.2, txt, TEXT, 16, box=PANEL, alpha=seg(p, 0, .3))

    return [
        (5, "Una cotización tiene dos precios: el bid y el ask.", b1),
        (5.5, "Si compras a mercado pagas el ask; si vendes, recibes el bid.", b2),
        (5.5, "La diferencia entre ambos es el spread: un costo que pagas al entrar.", b3),
        (6, "Con poca liquidez (noticias, aperturas, festivos) el spread se amplía.", b4),
        (6, "Comprar y vender al instante pierde el spread aunque el precio no se mueva.", b5),
    ]


@capsule("1.4-b", "nocional-y-apalancamiento", 1, "1.4 · Posiciones largas y cortas",
         "Nocional y apalancamiento",
         "Distinguir capital y nocional y ver cómo el apalancamiento multiplica el resultado en ambos sentidos.")
def _():
    cap, lev = 1000, 20
    notional = cap * lev

    def board(ctx, grow_n=1.0, move=0.0, show_move=False, note=""):
        b = ctx.canvas()
        # Barras capital frente a nocional (escala: 20.000 = 5.2 unidades)
        sc = 5.0 / notional
        b.add_patch(Rectangle((0.8, 0.6), 1.4, cap * sc, color=GOLD))
        label(b, 1.5, 0.6 + cap * sc + 0.35, f"Capital\n{money(cap, 0)} USD", GOLD, 16)
        h = notional * sc * grow_n
        if grow_n > 0:
            b.add_patch(Rectangle((3.2, 0.6), 1.4, h, color=BLUE, alpha=0.85))
            label(b, 3.9, 0.6 + h + 0.35, f"Nocional\n{money(notional * grow_n, 0)} USD", BLUE, 16)
        label(b, 2.7, 0.2, f"Apalancamiento 1:{lev}", MUTED, 15)
        if show_move:
            pnl = notional * move
            eq = max(cap + pnl, 0)
            col = GREEN if pnl >= 0 else RED
            label(b, 10.8, 5.9, f"Movimiento del precio: {money(move * 100, 1, True)} %", TEXT, 22)
            label(b, 10.8, 5.0, f"Resultado: {money(pnl, 0, True)} USD sobre el nocional", col, 19)
            # medidor del capital
            b.add_patch(Rectangle((6.5, 2.6), 8.6, 0.8, fc=PANEL, ec=BORDER, lw=2))
            w = 8.6 * min(eq / (cap * 2), 1)
            b.add_patch(Rectangle((6.5, 2.6), w, 0.8, color=col, alpha=0.9))
            b.plot([6.5 + 4.3] * 2, [2.45, 3.55], color=TEXT, lw=2)
            label(b, 10.8, 2.15, "capital inicial", MUTED, 13)
            label(b, 10.8, 4.0, f"Capital: {money(eq, 0)} USD  ({money(pnl / cap * 100, 0, True)} %)", col, 20)
        if note:
            label(b, 10.8, 1.0, note, GOLD, 17, box=PANEL)

    return [
        (5, "Tu capital es lo que depositas en la cuenta: 1.000 USD en este ejemplo.",
         lambda c, p: board(c, grow_n=0)),
        (6, "Con apalancamiento 1:20 controlas una posición de 20.000 USD: el nocional.",
         lambda c, p: board(c, grow_n=max(0.05, p))),
        (6, "El precio se mueve sobre el nocional. Una subida del 1 % = +200 USD = +20 % de tu capital.",
         lambda c, p: board(c, move=0.01 * p, show_move=True)),
        (6, "Una bajada del 1 % = −200 USD = −20 % de tu capital.",
         lambda c, p: board(c, move=-0.01 * p, show_move=True)),
        (6.5, "Una caída del 5 % consumiría todo el capital. El broker cerraría antes por margen.",
         lambda c, p: board(c, move=-0.05 * p, show_move=True,
                            note="Cierre por margen antes de llegar a 0" if p > .6 else "")),
        (5, "El apalancamiento multiplica ganancias y pérdidas. Dimensiona por el nocional.",
         lambda c, p: board(c, move=-0.05, show_move=True, note="Riesgo real = nocional × movimiento")),
    ]


@capsule("1.2-a", "subyacente-referencia-instrumento", 1, "1.2 · Activo, índice e instrumento",
         "Subyacente, referencia e instrumento",
         "Separar lo que se analiza (subyacente) de lo que realmente se negocia (instrumento).")
def _():
    rows = [
        ("Oro", "Precio spot XAUUSD", ["ETF de oro", "CFD XAUUSD", "Futuro de oro"]),
        ("S&P 500", "Índice: se calcula,\nno se compra", ["ETF del índice", "Futuro del índice", "CFD del índice"]),
        ("Bitcoin", "Precio de referencia BTC", ["BTC al contado", "ETF de bitcoin", "Perpetuo BTC"]),
    ]
    cols = [GOLD, BLUE, PURPLE]

    def board(ctx, p, upto_row, focus=None):
        b = ctx.canvas()
        for x, t in ((1.9, "SUBYACENTE"), (6.3, "REFERENCIA"), (12.2, "INSTRUMENTOS (lo que negocias)")):
            label(b, x, 6.35, t, MUTED, 14)
        for r, (u, ref, ins) in enumerate(rows):
            if r > upto_row:
                break
            y = 4.75 - r * 2.05
            a = 1.0 if r < upto_row else seg(p, 0, .5)
            dim = 0.25 if focus is not None and focus != r else 1.0
            card(b, 0.3, y, 3.2, 1.25, u, "", cols[r], alpha=a * dim, tsize=21)
            arrow(b, 3.6, y + .62, 4.4, y + .62, cols[r], alpha=a * dim)
            card(b, 4.5, y, 3.6, 1.25, "", "", cols[r], alpha=a * dim)
            label(b, 6.3, y + .62, ref, TEXT, 14, alpha=a * dim, weight="normal")
            for k, name in enumerate(ins):
                ak = (1.0 if r < upto_row else seg(p, 0.35 + k * .15, 0.6 + k * .15)) * dim
                if k == 0:
                    arrow(b, 8.2, y + .62, 8.75, y + .62, cols[r], lw=2, alpha=ak)
                card(b, 8.8 + k * 2.45, y, 2.3, 1.25, "", "", cols[r], alpha=ak, fill=BG)
                label(b, 9.95 + k * 2.45, y + .62, name, TEXT, 13.5, alpha=ak)

    return [
        (6, "El subyacente es lo que analizas; el instrumento es lo que compras o vendes.",
         lambda c, p: board(c, p, 0)),
        (6.5, "El S&P 500 es un índice: un cálculo. Para exponerte necesitas un ETF, un futuro o un CFD.",
         lambda c, p: board(c, p, 1)),
        (6, "Con Bitcoin puedes tener la moneda o un derivado que solo sigue su precio.",
         lambda c, p: board(c, p, 2)),
        (6.5, "Mismo subyacente, distintos costos, horarios, margen y riesgos según el instrumento.",
         lambda c, p: board(c, 1, 3, focus=0)),
    ]


# ======================================================== NIVEL 2
@capsule("2.2-a", "market-limit-stop", 2, "2.2 · Market, limit, stop y stop-limit",
         "Market, limit y stop: dónde va cada orden",
         "Ubicar cada tipo de orden respecto al precio y saber cuándo se activa.")
def _():
    n = 70
    cl = path([(0, 2378), (24, 2380), (36, 2371), (52, 2384), (69, 2394)], n, 0.5, 11)
    o, h, lo, c = ohlc(cl, 1.1, 5)
    now = 24
    lim, stp = 2372.0, 2390.0
    i_lim = next(i for i in range(now, n) if lo[i] <= lim)
    i_stp = next(i for i in range(now, n) if h[i] >= stp)

    def chart(ctx, upto):
        a = price_ax(ctx, xlim=(-1, n + 6), ylim=(2362, 2400))
        candles(a, o, h, lo, c, upto)
        hline(a, c[now - 1], f"ahora {money(c[now - 1], 0)}", MUTED, ":", 1.5, side="left")
        return a

    def b2(ctx, p):
        a = chart(ctx, now)
        a.scatter([now - 1], [c[now - 1]], s=260, color=GOLD, zorder=9, marker="^")
        label(a, now + 4, c[now - 1] + 4, "MARKET\nse ejecuta ya al ask", GOLD, 16, alpha=seg(p, 0, .3))

    def b3(ctx, p):
        upto = int(lerp(now, i_lim + 3, p))
        a = chart(ctx, upto)
        hline(a, lim, "BUY LIMIT", GREEN)
        label(a, 6, lim - 4, "Debajo del precio: compras solo si baja hasta aquí", GREEN, 15, ha="left")
        if upto > i_lim:
            a.scatter([i_lim], [lim], s=260, color=GREEN, zorder=9, edgecolor=TEXT)
            label(a, i_lim + 2, lim - 1.8, "ejecutada al límite o mejor", GREEN, 14, ha="left")

    def b4(ctx, p):
        upto = int(lerp(i_lim + 3, i_stp + 3, p))
        a = chart(ctx, upto)
        hline(a, stp, "BUY STOP", BLUE)
        label(a, 6, stp + 3.5, "Encima del precio: compras si sube y lo toca", BLUE, 15, ha="left")
        if upto > i_stp:
            a.scatter([i_stp], [stp], s=260, color=BLUE, zorder=9, edgecolor=TEXT)
            label(a, i_stp - 2, stp + 1.8, "se activa → entra a mercado", BLUE, 14, ha="right")

    def grid(ctx, p):
        b = ctx.canvas()
        label(b, 8, 6.1, "Precio actual en el centro", MUTED, 15)
        b.plot([1, 15], [3.3, 3.3], color=MUTED, ls=":", lw=2)
        items = [(4.2, 5.0, "BUY STOP", "compra si sube y rompe", BLUE),
                 (11.8, 5.0, "SELL LIMIT", "vende más caro (objetivo)", GREEN),
                 (4.2, 1.6, "BUY LIMIT", "compra más barato", GREEN),
                 (11.8, 1.6, "SELL STOP", "vende si baja (stop-loss)", RED)]
        for k, (x, y, t, d, col) in enumerate(items):
            card(b, x - 2.7, y - 0.75, 5.4, 1.5, t, d, col, alpha=seg(p, k * .15, k * .15 + .3))
        label(b, 8, 3.3, " PRECIO ", BG, 15, box=GOLD)

    return [
        (4.5, "Precio actual del oro (simulado). ¿Cómo entras?", lambda c, p: chart(c, now)),
        (5, "MARKET: se ejecuta de inmediato al mejor precio disponible.", b2),
        (6.5, "LIMIT: fijas el precio máximo de compra. Va por debajo y espera a que el precio baje.", b3),
        (6.5, "STOP: se activa al tocar el nivel y entonces entra a mercado. Para compras, va por encima.", b4),
        (7, "En ventas se invierte: el sell limit va encima y el sell stop debajo. El stop-loss es un sell stop.", grid),
    ]


@capsule("2.3-a", "del-bruto-al-neto", 2, "2.3 · Del beneficio bruto al neto",
         "Del resultado bruto al neto",
         "Descontar spread, comisión, deslizamiento y financiación del resultado que muestra el gráfico.")
def _():
    steps = [("Bruto en el gráfico", 500, GOLD), ("Spread", -30, RED), ("Comisión", -14, RED),
             ("Deslizamiento", -20, RED), ("Swap 2 noches", -36, RED)]
    net = sum(v for _, v, _ in steps)

    def wf(ctx, k, p):
        a = ctx.ax(xlim=(-0.6, 6.6), ylim=(0, 590))
        a.set_xticks(range(6), [s[0] for s in steps] + ["Neto en la cuenta"], color=TEXT, size=14)
        a.yaxis.set_major_formatter(lambda v, _: f"{v:.0f} USD")
        level = 0
        for i, (name, v, col) in enumerate(steps[: k + 1]):
            g = 1.0 if i < k else seg(p, 0, .5)
            if i == 0:
                a.bar(i, v * g, 0.62, 0, color=col)
                label(a, i, v * g + 22, money(v, 0, True), col, 17)
                level = v
            else:
                a.bar(i, -v * g, 0.62, level + v * g, color=col)
                label(a, i, level + 25, money(v, 0, True), col, 17, alpha=g)
                level += v
        if k >= len(steps):
            a.bar(5, net * seg(p, 0, .5), 0.62, 0, color=GREEN)
            label(a, 5, net + 25, money(net, 0, True), GREEN, 19, alpha=seg(p, .3, .6))
        label(a, 3.2, 560, "Compra de 1 lote de XAUUSD · costos ilustrativos", MUTED, 14)

    return [
        (5, "El gráfico muestra +500 USD de recorrido. Ese es el resultado bruto.", lambda c, p: wf(c, 0, p)),
        (4.5, "Al entrar pagas el spread.", lambda c, p: wf(c, 1, p)),
        (4.5, "Algunas cuentas cobran comisión por lote en la entrada y en la salida.", lambda c, p: wf(c, 2, p)),
        (5, "Deslizamiento: la orden se ejecuta a peor precio que el solicitado.", lambda c, p: wf(c, 3, p)),
        (5, "Si mantienes la posición de un día para otro se cobra o se paga financiación (swap).",
         lambda c, p: wf(c, 4, p)),
        (6, "El neto es lo que llega a tu cuenta: +400 USD. Evalúa siempre en neto.", lambda c, p: wf(c, 5, p)),
    ]


@capsule("2.4-a", "ejecucion-parcial-precio-promedio", 2, "2.4 · Ejecuciones parciales y condiciones",
         "Ejecución parcial y precio promedio",
         "Entender por qué una orden puede llenarse por partes y calcular su precio promedio.")
def _():
    book = [(2380.50, 3), (2380.70, 4), (2381.00, 5), (2381.30, 6)]
    want, limit = 10, 2380.70

    def draw(ctx, stage, p):
        b = ctx.canvas()
        label(b, 3.6, 6.25, "Libro de órdenes · ofertas de venta (ask)", MUTED, 15)
        filled, cost = 0, 0.0
        fills = []
        for i, (px, q) in enumerate(book):
            y = 1.0 + i * 1.2
            take = 0
            if px <= limit and stage >= 1:
                take = min(q, want - filled)
                g = 1.0 if stage > i + 1 else (seg(p, 0, .7) if stage == i + 1 else 0)
                take_vis = take * g
                filled += take
                cost += take * px
                if g > 0:
                    fills.append((px, take, g))
            else:
                take_vis = 0
            col = GOLD if px <= limit else MUTED
            label(b, 0.9, y + .35, money(px), col, 17, ha="left")
            b.add_patch(Rectangle((3.4, y), q * 0.55, 0.7, color=BLUE, alpha=0.35))
            if take_vis:
                b.add_patch(Rectangle((3.4, y), take_vis * 0.55, 0.7, color=GOLD))
            label(b, 3.5 + q * 0.55, y + .35, f" {q} lotes", TEXT, 14, ha="left", weight="normal")
        b.plot([0.6, 7.2], [1.0 + 2 * 1.2 - .25] * 2, color=RED, ls="--", lw=2)
        label(b, 7.3, 1.0 + 2 * 1.2 - .25, "límite 2.380,70", RED, 14, ha="left")
        card(b, 9.0, 4.6, 6.4, 1.5, "Orden: BUY LIMIT 10 lotes", "precio máximo 2.380,70", GOLD)
        done = sum(t * g for _, t, g in fills)
        if fills:
            avg = sum(px * t * g for px, t, g in fills) / done
            label(b, 12.2, 3.8, f"Ejecutado: {done:.0f} de {want} lotes", GREEN, 19)
            label(b, 12.2, 3.1, f"Precio promedio: {money(avg)}", TEXT, 19)
            b.add_patch(Rectangle((9.2, 2.1), 6.0, 0.5, fc=PANEL, ec=BORDER))
            b.add_patch(Rectangle((9.2, 2.1), 6.0 * done / want, 0.5, color=GREEN))
        if stage >= 3:
            label(b, 12.2, 1.3, "3 lotes quedan pendientes:\nsiguen vigentes o se cancelan", GOLD, 16, box=PANEL,
                  alpha=seg(p, .1, .4))

    return [
        (5, "Quieres comprar 10 lotes con un límite de 2.380,70.", lambda c, p: draw(c, 0, p)),
        (5, "Primero se toman los 3 lotes disponibles al mejor precio.", lambda c, p: draw(c, 1, p)),
        (5.5, "Luego 4 lotes más en el siguiente nivel, que aún respeta tu límite.", lambda c, p: draw(c, 2, p)),
        (6.5, "Llevas 7 de 10. Precio promedio = (3×2.380,50 + 4×2.380,70) ÷ 7 = 2.380,61.",
         lambda c, p: draw(c, 3, p)),
        (6, "El resto depende de la vigencia: hasta el final del día, hasta que la canceles o se anula.",
         lambda c, p: draw(c, 3, 1)),
    ]


# ======================================================== NIVEL 3
@capsule("3.1-c", "tendencia-rango-dos-temporalidades", 3, "3.1 · Velas, tendencia y rango",
         "Tendencia, rango y dos temporalidades",
         "Reconocer tendencia y rango por máximos y mínimos, y leer primero la temporalidad mayor.")
def _():
    up = path([(0, 100), (8, 106), (13, 103), (22, 111), (28, 108), (38, 117), (44, 114), (48, 121), (54, 121.3)], 55, 0.25, 21)
    dn = 2 * 111 - up
    rg = 110 + 3.2 * np.sin(np.linspace(0, 4.5 * np.pi, 55)) + np.random.default_rng(4).normal(0, .5, 55)
    U, D, R = ohlc(up, .6, 1), ohlc(dn, .6, 2), ohlc(rg, .6, 3)
    swings_up = [(8, "máx"), (13, "mín"), (22, "máx"), (28, "mín"), (38, "máx"), (44, "mín")]
    m15 = 121.3 + 1.4 * np.sin(np.linspace(0, 5 * np.pi, 60)) + np.random.default_rng(9).normal(0, .25, 60)
    M = ohlc(m15, .3, 7)

    def one(ctx, data, p, kind):
        o, h, lo, c = data
        a = price_ax(ctx, xlim=(-1, 56), ylim=(min(lo) - 2, max(h) + 2))
        k = int(lerp(5, 55, seg(p, 0, .7)))
        candles(a, o, h, lo, c, k)
        if kind == "up":
            for i, t in swings_up:
                if i < k:
                    y = h[i] + .8 if t == "máx" else lo[i] - .8
                    label(a, i, y, t, GREEN if t == "máx" else GOLD, 13)
            label(a, 3, max(h) + .5, "Máximos y mínimos cada vez más altos", MUTED, 14, ha="left")
        if kind == "range" and k > 40:
            zone(a, 106.6, 107.6, GREEN, .25, "soporte")
            zone(a, 112.6, 113.6, RED, .25, "resistencia")

    def two(ctx, p, zoom):
        a = price_ax(ctx, "h4", rect=(0.065, 0.215, 0.42, 0.6), xlim=(-1, 56), ylim=(96, 126))
        candles(a, *U)
        a.set_title("4H · tendencia alcista", color=GREEN, size=16, loc="left")
        a.add_patch(Rectangle((46.5, 118), 8.5, 6.5, fc="none", ec=GOLD, lw=2.5))
        if zoom:
            b = price_ax(ctx, "m15", rect=(0.535, 0.215, 0.40, 0.6), xlim=(-1, 61), ylim=(118.5, 124.5), dec=1)
            k = int(lerp(5, 60, seg(p, 0, .6)))
            candles(b, *M, n=k)
            b.set_title("15m · rango dentro de la tendencia", color=GOLD, size=16, loc="left")
            for s in b.spines.values():
                s.set_color(GOLD)

    return [
        (6, "Tendencia alcista: cada máximo y cada mínimo superan al anterior.", lambda c, p: one(c, U, p, "up")),
        (5, "Tendencia bajista: máximos y mínimos cada vez más bajos.", lambda c, p: one(c, D, p, "down")),
        (6, "Rango: el precio rebota entre un soporte y una resistencia sin dirección clara.",
         lambda c, p: one(c, R, p, "range")),
        (5, "El mismo mercado cambia según la temporalidad. En 4H vemos tendencia…",
         lambda c, p: two(c, p, False)),
        (6.5, "…y en 15 minutos, ese tramo final es un rango.", lambda c, p: two(c, p, True)),
        (5.5, "Lee primero la temporalidad mayor para el contexto; la menor da el detalle de la entrada.",
         lambda c, p: two(c, 1, True)),
    ]


def _sma(x, n):
    out = np.full(len(x), np.nan)
    cs = np.cumsum(np.r_[0, x])
    out[n - 1:] = (cs[n:] - cs[:-n]) / n
    return out


def _rsi(c, n=14):
    d = np.diff(c, prepend=c[0])
    up, dn = np.clip(d, 0, None), np.clip(-d, 0, None)
    au, ad = np.zeros(len(c)), np.zeros(len(c))
    au[n], ad[n] = up[1:n + 1].mean(), dn[1:n + 1].mean()
    for i in range(n + 1, len(c)):
        au[i] = (au[i - 1] * (n - 1) + up[i]) / n
        ad[i] = (ad[i - 1] * (n - 1) + dn[i]) / n
    r = 100 - 100 / (1 + au / np.maximum(ad, 1e-9))
    r[:n] = np.nan
    return r


@capsule("3.2-a", "media-movil-y-rsi", 3, "3.2 · Qué aporta cada indicador",
         "Media móvil y RSI: qué miden",
         "Saber qué calcula una media móvil y el RSI, su retraso y por qué no son señales automáticas.")
def _():
    n = 110
    cl = path([(0, 100), (25, 96), (45, 108), (75, 124), (90, 119), (109, 112)], n, .45, 31)
    o, h, lo, c = ohlc(cl, .7, 8)
    ma, rsi = _sma(c, 20), _rsi(c)

    def draw(ctx, p, k0, k1, ma_on=True, rsi_on=False, note=None):
        k = int(lerp(k0, k1, p))
        top = (0.065, 0.42, 0.87, 0.40) if rsi_on else Ctx_MAIN
        a = price_ax(ctx, rect=top, xlim=(-1, n + 1), ylim=(90, 130))
        candles(a, o, h, lo, c, k, alpha=.9)
        if ma_on:
            a.plot(np.arange(k), ma[:k], color=GOLD, lw=3, label="Media móvil 20")
            a.legend(loc="upper left", frameon=False, labelcolor=TEXT, fontsize=14)
        if rsi_on:
            r = ctx.ax("rsi", rect=(0.065, 0.215, 0.87, 0.18), xlim=(-1, n + 1), ylim=(0, 100))
            r.yaxis.tick_right(); r.set_xticks([]); r.set_yticks([30, 50, 70])
            r.axhspan(70, 100, color=RED, alpha=.12); r.axhspan(0, 30, color=GREEN, alpha=.12)
            r.plot(np.arange(k), rsi[:k], color=PURPLE, lw=2.4)
            r.text(1, 85, "RSI 14", color=PURPLE, size=13, weight="bold")
        if note:
            note(a, p)

    def lag(a, p):
        label(a, 30, 124, "La media llega tarde:\ngira después del precio", GOLD, 16, box=PANEL, alpha=seg(p, .3, .6))
        arrow(a, 33, 120.5, 27, 100, GOLD, alpha=seg(p, .3, .6))

    def trend(a, p):
        label(a, 55, 127, "Precio sobre una media que sube → contexto alcista", GREEN, 16, alpha=seg(p, .2, .5))

    def ob(a, p):
        label(a, 70, 94, "En tendencia fuerte el RSI puede seguir sobre 70 mucho tiempo", GOLD, 15, box=PANEL,
              alpha=seg(p, .2, .5))

    return [
        (6, "Una media móvil de 20 promedia los últimos 20 cierres y suaviza el precio.",
         lambda c, p: draw(c, p, 20, 50)),
        (5.5, "Como usa datos pasados, va retrasada: confirma, no anticipa.", lambda c, p: draw(c, p, 50, 50, note=lag)),
        (5.5, "Su pendiente y la posición del precio describen el contexto.",
         lambda c, p: draw(c, p, 50, 80, note=trend)),
        (6, "El RSI compara la fuerza de las subidas y las bajadas recientes, de 0 a 100.",
         lambda c, p: draw(c, p, 15, 80, rsi_on=True)),
        (6.5, "Sobre 70 o bajo 30 no es una orden de venta o compra: es información de contexto.",
         lambda c, p: draw(c, p, 80, 110, rsi_on=True, note=ob)),
    ]


Ctx_MAIN = (0.065, 0.215, 0.87, 0.6)


@capsule("3.2-b", "atr-volatilidad", 3, "3.2 · Qué aporta cada indicador", "ATR: medir la volatilidad",
         "Usar el ATR para medir cuánto se mueve el precio y adaptar la distancia del stop.")
def _():
    n = 100
    rng = np.random.default_rng(12)
    vol = np.r_[np.full(45, .5), np.linspace(.5, 2.4, 10), np.full(25, 2.2), np.linspace(2.2, .8, 20)]
    cl = 100 + np.cumsum(rng.normal(0.02, 1, n) * vol)
    o, h, lo, c = ohlc(cl, 0.1, 13)
    h, lo = np.maximum(h, np.maximum(o, c) + vol * .6), np.minimum(lo, np.minimum(o, c) - vol * .6)
    pc = np.r_[c[0], c[:-1]]
    tr = np.maximum.reduce([h - lo, np.abs(h - pc), np.abs(lo - pc)])
    atr = _sma(tr, 14)

    def draw(ctx, p, k0, k1, mark=None, stop=False):
        k = int(lerp(k0, k1, p))
        a = price_ax(ctx, rect=(0.065, 0.42, 0.87, 0.40), xlim=(-1, n + 1),
                     ylim=(min(lo) - 3, max(h) + 3), dec=0)
        candles(a, o, h, lo, c, k)
        r = ctx.ax("atr", rect=(0.065, 0.215, 0.87, 0.18), xlim=(-1, n + 1), ylim=(0, np.nanmax(atr) * 1.25))
        r.yaxis.tick_right(); r.set_xticks([])
        r.plot(np.arange(k), atr[:k], color=GOLD, lw=2.5)
        r.text(1, np.nanmax(atr) * 1.05, "ATR 14", color=GOLD, size=13, weight="bold")
        if mark is not None:
            i = mark
            a.annotate("", (i + 1.2, h[i]), (i + 1.2, lo[i]), arrowprops=dict(arrowstyle="<->", color=GOLD, lw=2))
            label(a, i + 2, (h[i] + lo[i]) / 2, f"rango verdadero\n= {tr[i]:.1f}", GOLD, 15, ha="left")
        if stop:
            for i in (40, 75):
                if i < k:
                    s = c[i] - 1.5 * atr[i]
                    a.plot([i, i + 6], [s, s], color=RED, lw=3)
                    a.plot([i, i + 6], [c[i]] * 2, color=TEXT, lw=1.5, ls=":")
                    label(a, i + 3, s - 1.2, f"stop a 1,5×ATR\n({1.5 * atr[i]:.1f})", RED, 13)

    return [
        (6, "El rango verdadero mide cuánto recorrió una vela, incluido cualquier hueco con el cierre anterior.",
         lambda c, p: draw(c, p, 30, 30, mark=28)),
        (5, "El ATR promedia los últimos 14 rangos verdaderos.", lambda c, p: draw(c, p, 30, 45)),
        (6, "Cuando el mercado se agita (por ejemplo, tras un dato), el ATR sube.", lambda c, p: draw(c, p, 45, 80)),
        (6.5, "Un stop basado en ATR se aleja cuando hay más volatilidad y se acerca cuando hay calma.",
         lambda c, p: draw(c, 1, 80, 80, stop=True)),
        (5.5, "El ATR no indica dirección: solo cuánto se mueve el precio.", lambda c, p: draw(c, p, 80, 100, stop=True)),
    ]


# ======================================================== NIVEL 4
@capsule("4.1-b", "gap-a-traves-del-stop", 4, "4.1 · Calcula el tamaño de la posición",
         "Cuando el precio salta tu stop",
         "Ver por qué un gap puede ejecutar el stop peor que lo planeado y cómo incluirlo en el riesgo.")
def _():
    fri = path([(0, 2386), (14, 2381), (27, 2377)], 28, .5, 41)
    mon = path([(0, 2361), (14, 2364), (21, 2368)], 22, .5, 42)
    cl = np.r_[fri, mon]
    o, h, lo, c = ohlc(cl, 1, 9)
    o[28] = 2360.5
    h[28], lo[28] = max(o[28], c[28]) + 1, min(o[28], c[28]) - 1.5
    entry, sl = 2380.0, 2370.0

    def draw(ctx, p, k0, k1, gap=False, result=False):
        k = int(lerp(k0, k1, p))
        a = price_ax(ctx, xlim=(-1, 52), ylim=(2352, 2392))
        x = np.arange(k)
        xs = np.where(x >= 28, x + 2, x)
        for i in range(k):
            candles(a, o[i:i + 1], h[i:i + 1], lo[i:i + 1], c[i:i + 1], 1, x0=xs[i])
        hline(a, entry, "entrada 2.380", TEXT, "-", 1.5)
        hline(a, sl, "stop 2.370", RED)
        if k > 27:
            a.axvspan(27.6, 29.4, color=MUTED, alpha=.15)
            label(a, 28.5, 2388, "fin de\nsemana", MUTED, 13)
        if gap:
            a.annotate("", (30, o[28]), (28.5, c[27]), arrowprops=dict(arrowstyle="-|>", color=GOLD, lw=2.5, ls="--"))
            a.scatter([30], [o[28]], s=220, color=RED, zorder=9, edgecolor=TEXT)
            label(a, 31, o[28] - 3.5, "abre en 2.360,5:\nel stop se ejecuta aquí", RED, 15, ha="left")
        if result:
            label(a, 41, 2384, "Riesgo planeado: −10 USD/oz (−1R)\nPérdida real: −19,5 USD/oz (≈ −2R)",
                  TEXT, 16, box=PANEL, alpha=seg(p, .1, .4))

    return [
        (5.5, "Compra en 2.380 con stop en 2.370: arriesgas 10 USD por onza (1R).", lambda c, p: draw(c, p, 18, 26)),
        (5, "El viernes el mercado cierra en 2.377. La posición sigue abierta.", lambda c, p: draw(c, p, 26, 28)),
        (6.5, "El lunes abre en 2.360,5. No hubo cotizaciones en 2.370: el stop se ejecuta al primer precio.",
         lambda c, p: draw(c, p, 29, 29, gap=True)),
        (6, "La pérdida casi duplica el riesgo previsto.", lambda c, p: draw(c, 1, 29, 29, gap=True, result=True)),
        (6, "Un stop no garantiza el precio. Reduce tamaño ante cierres de semana y noticias.",
         lambda c, p: draw(c, p, 29, 50, gap=True, result=True)),
    ]


@capsule("4.4-a", "no-muevas-el-stop", 4, "4.4 · La decisión antes del impulso",
         "Mover el stop: cómo crece una pérdida",
         "Reconocer el desplazamiento del stop como sesgo y medir su costo en múltiplos de riesgo (R).")
def _():
    cl = path([(0, 100.3), (6, 99.6), (12, 98.3), (18, 97.0), (24, 95.4), (30, 94.0), (36, 93.0)], 37, .12, 51)
    o, h, lo, c = ohlc(cl, .25, 6)
    stops = [(0, 98.0), (12, 96.0), (24, 94.0)]

    def cur_stop(k):
        return [s for i, s in stops if i <= k][-1]

    def draw(ctx, p, k0, k1, final=False):
        k = int(lerp(k0, k1, p))
        a = price_ax(ctx, rect=(0.065, 0.215, 0.62, 0.6), xlim=(-1, 38), ylim=(91.5, 101.5), dec=1)
        candles(a, o, h, lo, c, k)
        hline(a, 100, "entrada 100", TEXT, "-", 1.5)
        hline(a, 98, "stop original 98 = −1R", RED, ":", 1.6, alpha=.7)
        s = cur_stop(k)
        if s != 98:
            hline(a, s, f"stop movido {money(s, 0)}", RED, "--", 2.4)
        for j, (i, sv) in enumerate(stops[1:]):
            if i <= k:
                label(a, 36, 99.3 - j * 0.8, f"«ya se va a dar vuelta» → stop a {sv:.0f}", GOLD, 14, ha="right")
        m = ctx.ax("meter", rect=(0.73, 0.215, 0.2, 0.6), xlim=(0, 1), ylim=(-3.6, 0.4), grid=False)
        m.set_xticks([]); m.yaxis.tick_right()
        m.set_yticks([0, -1, -2, -3], ["0R", "−1R", "−2R", "−3R"])
        risk = (100 - s) / 2
        m.bar(0.5, -risk, 0.5, color=RED)
        m.set_title("pérdida posible", color=MUTED, size=14)
        if final:
            label(a, 18, 100.7, "Salida en 94: −3R. Tres veces el riesgo planeado.", RED, 16, box=PANEL)

    return [
        (5.5, "Entrada en 100, stop en 98: la pérdida máxima planeada es 1R.", lambda c, p: draw(c, p, 2, 11)),
        (5.5, "El precio se acerca al stop y lo mueves «para darle espacio».", lambda c, p: draw(c, p, 11, 20)),
        (5.5, "Vuelve a pasar. Ahora el riesgo es el doble y la operación ya no es la que planeaste.",
         lambda c, p: draw(c, p, 20, 30)),
        (5.5, "La salida llega en 94: −3R.", lambda c, p: draw(c, p, 30, 37, final=True)),
        (6, "Regla del diario: el stop solo se mueve a favor de la operación, nunca para ampliar la pérdida.",
         lambda c, p: draw(c, 1, 37, 37, final=True)),
    ]
