# Guiones · Nivel 8 · Trading sistemático, automatización y proyecto final

Texto en pantalla de cada tramo; sirve también como guion de locución. Portada 3 s y cierre con aviso de riesgo 4 s.

## 8.1-a · Una orden de mercado contra el libro

- **Tema:** 8.1 · Qué ocurre dentro del libro de órdenes
- **Objetivo:** Ver cómo una orden agresiva grande consume varios niveles y empeora el precio medio.
- **Herramienta:** Python (matplotlib) · **Duración:** 36 s

| Inicio | Texto |
|---|---|
| 0:03.0 | El libro muestra órdenes de compra (bid) y de venta (ask) en cada precio. |
| 0:08.5 | Envías una compra a mercado de 8 lotes. |
| 0:13.5 | Consume todo lo disponible en cada nivel y sube al siguiente. |
| 0:20.5 | El precio medio queda por encima del mejor ask: impacto de mercado. |
| 0:26.5 | Con poca profundidad, el tamaño mismo de la orden mueve el precio. |

## 8.2-a · De la señal a la posición: reconciliar

- **Tema:** 8.2 · De señal a ejecución en demo
- **Objetivo:** Seguir una señal hasta la posición con identificadores y detectar duplicados y descuadres.
- **Herramienta:** Python (matplotlib) · **Duración:** 36 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Cada señal recibe un identificador único. |
| 0:08.5 | Ese identificador viaja a la orden, a la ejecución y a la posición. |
| 0:15.0 | Si la misma señal llega dos veces, el identificador evita una orden duplicada. |
| 0:20.5 | Tras una caída de conexión, reconcilia: lo que crees tener contra lo que el broker dice. |
| 0:26.5 | Si no cuadra, el sistema se detiene. Pruébalo en demo antes de confiar en él. |

## 8.4-a · Balance frente a equity: lo que oculta un historial

- **Tema:** 8.4 · Cómo leer un historial de terceros
- **Objetivo:** Detectar pérdidas flotantes ocultas en un historial que solo muestra operaciones cerradas.
- **Herramienta:** Python (matplotlib) · **Duración:** 38 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Este historial muestra un balance que sube casi sin caídas. |
| 0:09.0 | El balance solo registra operaciones cerradas. Las perdedoras pueden seguir abiertas. |
| 0:15.5 | La equity revela pérdidas flotantes cada vez más profundas: típico de promediar a la contra o martingala. |
| 0:22.5 | Tu copia pagaría comisiones y deslizamiento que el historial publicado no incluye. |
| 0:28.5 | Pide equity, caída máxima, apalancamiento y cambios de reglas antes de confiar en un historial. |
