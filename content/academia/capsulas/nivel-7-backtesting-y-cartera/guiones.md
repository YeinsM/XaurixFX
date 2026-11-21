# Guiones · Nivel 7 · Backtesting avanzado y gestión de cartera

Texto en pantalla de cada tramo; sirve también como guion de locución. Portada 3 s y cierre con aviso de riesgo 4 s.

## 7.1-a · Sesgo de supervivencia

- **Tema:** 7.1 · Tres sesgos que inflan un backtest
- **Objetivo:** Ver cómo excluir activos que desaparecieron infla el resultado de un backtest.
- **Herramienta:** Python (matplotlib) · **Duración:** 37 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Un universo de 24 acciones al inicio del período. |
| 0:09.0 | Algunas quiebran o dejan de cotizar en el camino. |
| 0:15.0 | Si hoy descargas solo las que siguen vivas, esas desaparecen de tus datos. |
| 0:21.0 | El promedio de los supervivientes queda por encima del que realmente hubieras obtenido. |
| 0:28.0 | Usa datos que incluyan los activos retirados, con la composición de cada fecha. |

## 7.1-b · Sobreajuste: la curva demasiado perfecta

- **Tema:** 7.1 · Tres sesgos que inflan un backtest
- **Objetivo:** Reconocer el sobreajuste por el contraste entre la muestra de ajuste y datos nuevos.
- **Herramienta:** Python (matplotlib) · **Duración:** 32 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Pruebas 1.200 combinaciones de parámetros y eliges la mejor. |
| 0:09.5 | En la muestra de ajuste la curva parece casi perfecta. |
| 0:15.0 | En datos que la estrategia nunca vio, el resultado se desvanece: se ajustó al ruido. |
| 0:21.5 | Reserva datos fuera de muestra y desconfía de las curvas demasiado limpias. |

## 7.2-a · Validación walk-forward

- **Tema:** 7.2 · Validación cronológica de una estrategia
- **Objetivo:** Entender la validación por ventanas móviles: ajustar en el pasado y evaluar en el tramo siguiente.
- **Herramienta:** Python (matplotlib) · **Duración:** 32 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Ajustas los parámetros con una ventana del pasado y los pruebas en el tramo siguiente. |
| 0:09.0 | Luego desplazas ambas ventanas hacia adelante y repites, siempre en orden cronológico. |
| 0:16.0 | Unes solo los tramos de prueba: esa es la evaluación honesta fuera de muestra. |
| 0:23.0 | Si los parámetros cambian mucho de una ventana a otra, la idea es frágil. |

## 7.4-a · Monte Carlo: el orden de las operaciones

- **Tema:** 7.4 · Cuando varias posiciones caen juntas
- **Objetivo:** Usar remuestreos de la secuencia de operaciones para estimar drawdowns posibles.
- **Herramienta:** Python (matplotlib) · **Duración:** 32 s

| Inicio | Texto |
|---|---|
| 0:03.0 | 100 operaciones: 45 ganan 1,5R y 55 pierden 1R. Esta es la secuencia que observaste. |
| 0:08.5 | Mismas operaciones en otro orden: el resultado final es igual, el camino no. |
| 0:15.5 | La distribución de caídas máximas muestra lo que podrías vivir con la misma ventaja. |
| 0:22.5 | Dimensiona pensando en la peor caída plausible, no en la que tuviste. |
