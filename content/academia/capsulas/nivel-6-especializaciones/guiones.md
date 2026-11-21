# Guiones · Nivel 6 · Especializaciones por mercado

Texto en pantalla de cada tramo; sirve también como guion de locución. Portada 3 s y cierre con aviso de riesgo 4 s.

## 6.1-a · ETF frente a índice: tracking error

- **Tema:** 6.1.3 · Qué sigue un ETF y cuánto se desvía
- **Objetivo:** Distinguir diferencia de seguimiento y tracking error comparando un fondo con su índice.
- **Herramienta:** Python (matplotlib) · **Duración:** 36 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Un ETF intenta replicar un índice. Ambos parten de 100. |
| 0:09.0 | Con el tiempo, comisiones y costos de replicar dejan al fondo algo por debajo. |
| 0:15.0 | La diferencia de seguimiento es esa brecha acumulada en el período. |
| 0:21.0 | El tracking error mide cuánto oscila esa diferencia: la regularidad del seguimiento. |
| 0:27.5 | Compara siempre fondo e índice en el mismo período y con los mismos datos. |

## 6.2-a · Índice ponderado: quién lo mueve

- **Tema:** 6.2.1 · Cómo se mueve un índice ponderado
- **Objetivo:** Calcular contribuciones por peso y ver por qué un índice puede subir con la mayoría de componentes a la baja.
- **Herramienta:** Python (matplotlib) · **Duración:** 36 s

| Inicio | Texto |
|---|---|
| 0:03.0 | En un índice ponderado, cada componente pesa distinto. |
| 0:08.5 | Hoy solo A sube; los otros cuatro bajan. |
| 0:14.0 | Contribución de cada uno = peso × variación. A aporta +0,90 puntos porcentuales. |
| 0:20.5 | El índice sube un 0,05 % aunque la mayoría baja: eso es concentración. |
| 0:27.0 | Por eso conviene mirar la amplitud: cuántos componentes acompañan el movimiento. |

## 6.3-a · Pip, lote y valor del pip

- **Tema:** 6.3.1 · Divisa base, cotizada, pip y lote
- **Objetivo:** Calcular un movimiento en pips y convertirlo en dinero según el tamaño del lote.
- **Herramienta:** Python (matplotlib) · **Duración:** 36 s

| Inicio | Texto |
|---|---|
| 0:03.0 | En EUR/USD el euro es la divisa base y el dólar, la cotizada. |
| 0:08.5 | De 1,0850 a 1,0880 el precio sube 30 pips. |
| 0:14.0 | El valor de cada pip depende del tamaño de la posición. |
| 0:20.5 | Los mismos 30 pips son 300, 30 o 3 USD según el lote. |
| 0:26.5 | Si la cuenta está en otra moneda, el resultado se convierte al tipo de cambio. |

## 6.4-a · Perpetuo apalancado: dónde está la liquidación

- **Tema:** 6.4.2 · Perpetuos, funding y liquidación
- **Objetivo:** Ubicar el precio de liquidación de un perpetuo apalancado y compararlo con mantener BTC al contado.
- **Herramienta:** Python (matplotlib) · **Duración:** 38 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Compras 1 BTC en 60.000 USD: al contado, o con un perpetuo apalancado 10 veces. |
| 0:08.5 | Con 10× aportas 6.000 USD de margen. Una caída cercana al 10 % lo agota. |
| 0:15.0 | La liquidación se calcula con el precio de marca y el margen de mantenimiento: llega antes del −10 %. |
| 0:21.0 | Mismo movimiento: al contado tienes una pérdida flotante; en el perpetuo, el margen desaparece. |
| 0:28.0 | Además, el funding se paga o cobra periódicamente mientras la posición siga abierta. |

## 6.5-a · Tick, multiplicador y ajuste diario

- **Tema:** 6.5.1 · Puntos, ticks y multiplicador
- **Objetivo:** Pasar de puntos a dinero con la ficha del contrato y seguir el ajuste diario del margen.
- **Herramienta:** Python (matplotlib) · **Duración:** 38 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Un futuro se negocia por contratos. La ficha dice cuánto vale cada tick. |
| 0:09.0 | Un movimiento de 15 USD son 150 ticks: 1.500 USD en el estándar y 150 en el micro. |
| 0:15.5 | Cada día la cámara liquida la posición al precio de cierre y ajusta tu cuenta. |
| 0:21.5 | Las pérdidas se descuentan del margen al final de cada sesión, no solo al cerrar. |
| 0:27.5 | Si el saldo cae bajo el margen de mantenimiento, debes reponer margen o la posición se cierra. |

## 6.6-a · Contango y backwardation

- **Tema:** 6.6.2 · Cómo leer una curva de futuros
- **Objetivo:** Leer la pendiente de una curva de futuros y entender el efecto del rollover.
- **Herramienta:** Python (matplotlib) · **Duración:** 32 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Contango: los vencimientos lejanos cotizan más caros que los cercanos. |
| 0:09.0 | Backwardation: los lejanos cotizan más baratos. Suele indicar escasez inmediata. |
| 0:15.0 | Al renovar la posición (rollover), la pendiente de la curva cambia tu resultado aunque el spot no se mueva. |
| 0:22.5 | Un producto que sigue futuros puede desviarse del precio spot por este efecto. |

## 6.7-a · Perfil de una call y una put al vencimiento

- **Tema:** 6.7.1 · Call, put, strike y prima
- **Objetivo:** Dibujar el resultado al vencimiento de una call y una put compradas y ubicar su punto de equilibrio.
- **Herramienta:** Python (matplotlib) · **Duración:** 38 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Una call da derecho a comprar al strike. Pagas una prima de 5: es tu pérdida máxima. |
| 0:09.5 | Gana si al vencer el precio supera strike + prima: 105. |
| 0:15.0 | Una put da derecho a vender al strike. Prima 4: gana bajo 96. |
| 0:21.5 | Recorre el precio: la pérdida queda limitada a la prima; la ganancia depende del movimiento. |
| 0:28.5 | Antes del vencimiento el valor también depende del tiempo y la volatilidad. |

## 6.8-a · Bonos: cuando sube el rendimiento, baja el precio

- **Tema:** 6.8.1 · Bonos: precio frente a rendimiento
- **Objetivo:** Ver la relación inversa y convexa entre precio y rendimiento de un bono.
- **Herramienta:** Python (matplotlib) · **Duración:** 38 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Un bono a 10 años con cupón del 4 % vale 100 cuando el mercado exige un 4 %. |
| 0:09.0 | Si los nuevos bonos rinden un 5 %, el tuyo vale menos: su precio baja hasta igualar el rendimiento. |
| 0:15.5 | Si el rendimiento baja al 3 %, el precio sube. |
| 0:22.0 | La curva es convexa: una bajada de tasas sube el precio más de lo que lo baja una subida igual. |
| 0:28.5 | A mayor plazo (duración), mayor sensibilidad del precio a las tasas. |
