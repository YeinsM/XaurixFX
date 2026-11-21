# Guiones · Nivel 1 · Trading desde cero

Texto en pantalla de cada tramo; sirve también como guion de locución. Portada 3 s y cierre con aviso de riesgo 4 s.

## 1.2-a · Subyacente, referencia e instrumento

- **Tema:** 1.2 · Activo, índice e instrumento
- **Objetivo:** Separar lo que se analiza (subyacente) de lo que realmente se negocia (instrumento).
- **Herramienta:** Python (matplotlib) · **Duración:** 44 s

| Inicio | Texto |
|---|---|
| 0:03.0 | El subyacente es lo que analizas; el instrumento es lo que compras o vendes. |
| 0:11.9 | El S&P 500 es un índice: un cálculo. Para exponerte necesitas un ETF, un futuro o un CFD. |
| 0:23.4 | Con Bitcoin puedes tener la moneda o un derivado que solo sigue su precio. |
| 0:30.5 | Mismo subyacente, distintos costos, horarios, margen y riesgos según el instrumento. |

## 1.3-a · Bid, ask y spread

- **Tema:** 1.3 · Cómo se forma el precio
- **Objetivo:** Leer los dos precios de una cotización y entender el spread como costo de entrada.
- **Herramienta:** Python (matplotlib) · **Duración:** 39 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Una cotización tiene dos precios: el bid y el ask. |
| 0:09.4 | Si compras a mercado pagas el ask; si vendes, recibes el bid. |
| 0:14.9 | La diferencia entre ambos es el spread: un costo que pagas al entrar. |
| 0:20.6 | Con poca liquidez (noticias, aperturas, festivos) el spread se amplía. |
| 0:28.9 | Comprar y vender al instante pierde el spread aunque el precio no se mueva. |

## 1.4-a · Largo frente a corto

- **Tema:** 1.4 · Posiciones largas y cortas
- **Objetivo:** Comparar el efecto de un mismo movimiento sobre una posición larga y una corta, en bruto y en neto.
- **Herramienta:** Remotion · **Duración:** 56 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Una posición larga gana si el precio sube; una corta gana si baja. |
| 0:11.3 | El oro sube de 2.380 a 2.400. El largo gana 200 USD; el corto pierde 200. |
| 0:24.0 | Si luego baja a 2.390, el beneficio del largo se reduce y la pérdida del corto también. |
| 0:33.2 | Mientras la posición está abierta el resultado es flotante. Al cerrar, se realiza. |
| 0:40.6 | Resultado neto = bruto − costos. Los dos pagan spread y comisión. |

## 1.4-b · Nocional y apalancamiento

- **Tema:** 1.4 · Posiciones largas y cortas
- **Objetivo:** Distinguir capital y nocional y ver cómo el apalancamiento multiplica el resultado en ambos sentidos.
- **Herramienta:** Python (matplotlib) · **Duración:** 57 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Tu capital es lo que depositas en la cuenta: 1.000 USD en este ejemplo. |
| 0:10.1 | Con apalancamiento 1:20 controlas una posición de 20.000 USD: el nocional. |
| 0:18.7 | El precio se mueve sobre el nocional. Una subida del 1 % = +200 USD = +20 % de tu capital. |
| 0:29.6 | Una bajada del 1 % = −200 USD = −20 % de tu capital. |
| 0:35.6 | Una caída del 5 % consumiría todo el capital. El broker cerraría antes por margen. |
| 0:45.2 | El apalancamiento multiplica ganancias y pérdidas. Dimensiona por el nocional. |
