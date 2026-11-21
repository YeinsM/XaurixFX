# Guiones · Nivel 2 · Plataformas y ejecución

Texto en pantalla de cada tramo; sirve también como guion de locución. Portada 3 s y cierre con aviso de riesgo 4 s.

## 2.2-a · Market, limit y stop: dónde va cada orden

- **Tema:** 2.2 · Market, limit, stop y stop-limit
- **Objetivo:** Ubicar cada tipo de orden respecto al precio y saber cuándo se activa.
- **Herramienta:** Python (matplotlib) · **Duración:** 36 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Precio actual del oro (simulado). ¿Cómo entras? |
| 0:07.5 | MARKET: se ejecuta de inmediato al mejor precio disponible. |
| 0:12.5 | LIMIT: fijas el precio máximo de compra. Va por debajo y espera a que el precio baje. |
| 0:19.0 | STOP: se activa al tocar el nivel y entonces entra a mercado. Para compras, va por encima. |
| 0:25.5 | En ventas se invierte: el sell limit va encima y el sell stop debajo. El stop-loss es un sell stop. |

## 2.2-b · Stop-loss y take-profit vinculados

- **Tema:** 2.2 · Market, limit, stop y stop-limit
- **Objetivo:** Configurar SL y TP como órdenes vinculadas y ver qué pasa con cada una cuando la otra se ejecuta.
- **Herramienta:** Remotion · **Duración:** 40 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Al comprar puedes adjuntar dos órdenes de salida: un stop-loss y un take-profit. |
| 0:09.0 | Están vinculadas (OCO): cuando una se ejecuta, la otra se cancela. |
| 0:14.5 | Escenario A: el precio alcanza el take-profit. Cierras con ganancia y el stop se cancela. |
| 0:22.0 | Escenario B: el precio cae al stop. Cierras con la pérdida prevista y el take-profit se cancela. |
| 0:29.5 | Arriesgas 8 para buscar 16: una relación 1:2 decidida antes de entrar. |

## 2.3-a · Del resultado bruto al neto

- **Tema:** 2.3 · Del beneficio bruto al neto
- **Objetivo:** Descontar spread, comisión, deslizamiento y financiación del resultado que muestra el gráfico.
- **Herramienta:** Python (matplotlib) · **Duración:** 37 s

| Inicio | Texto |
|---|---|
| 0:03.0 | El gráfico muestra +500 USD de recorrido. Ese es el resultado bruto. |
| 0:08.0 | Al entrar pagas el spread. |
| 0:12.5 | Algunas cuentas cobran comisión por lote en la entrada y en la salida. |
| 0:17.0 | Deslizamiento: la orden se ejecuta a peor precio que el solicitado. |
| 0:22.0 | Si mantienes la posición de un día para otro se cobra o se paga financiación (swap). |
| 0:27.0 | El neto es lo que llega a tu cuenta: +400 USD. Evalúa siempre en neto. |

## 2.4-a · Ejecución parcial y precio promedio

- **Tema:** 2.4 · Ejecuciones parciales y condiciones
- **Objetivo:** Entender por qué una orden puede llenarse por partes y calcular su precio promedio.
- **Herramienta:** Python (matplotlib) · **Duración:** 35 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Quieres comprar 10 lotes con un límite de 2.380,70. |
| 0:08.0 | Primero se toman los 3 lotes disponibles al mejor precio. |
| 0:13.0 | Luego 4 lotes más en el siguiente nivel, que aún respeta tu límite. |
| 0:18.5 | Llevas 7 de 10. Precio promedio = (3×2.380,50 + 4×2.380,70) ÷ 7 = 2.380,61. |
| 0:25.0 | El resto depende de la vigencia: hasta el final del día, hasta que la canceles o se anula. |
