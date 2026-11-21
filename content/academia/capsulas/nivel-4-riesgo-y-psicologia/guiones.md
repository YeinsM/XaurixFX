# Guiones · Nivel 4 · Gestión de riesgo y psicología

Texto en pantalla de cada tramo; sirve también como guion de locución. Portada 3 s y cierre con aviso de riesgo 4 s.

## 4.1-b · Cuando el precio salta tu stop

- **Tema:** 4.1 · Calcula el tamaño de la posición
- **Objetivo:** Ver por qué un gap puede ejecutar el stop peor que lo planeado y cómo incluirlo en el riesgo.
- **Herramienta:** Python (matplotlib) · **Duración:** 36 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Compra en 2.380 con stop en 2.370: arriesgas 10 USD por onza (1R). |
| 0:08.5 | El viernes el mercado cierra en 2.377. La posición sigue abierta. |
| 0:13.5 | El lunes abre en 2.360,5. No hubo cotizaciones en 2.370: el stop se ejecuta al primer precio. |
| 0:20.0 | La pérdida casi duplica el riesgo previsto. |
| 0:26.0 | Un stop no garantiza el precio. Reduce tamaño ante cierres de semana y noticias. |

## 4.2-a · Drawdown: caer es más fácil que recuperar

- **Tema:** 4.2 · Drawdown y exposición acumulada
- **Objetivo:** Medir el drawdown desde máximos y entender la asimetría entre pérdida y recuperación.
- **Herramienta:** Remotion · **Duración:** 38 s

| Inicio | Texto |
|---|---|
| 0:03.0 | El drawdown es la caída del capital desde su último máximo. |
| 0:09.0 | Se mide en cada momento. El drawdown máximo es la peor caída del período. |
| 0:15.5 | Recuperar cuesta más que caer: perder un 10 % exige ganar un 11 %. |
| 0:21.5 | Con −25 % necesitas +33 %; con −50 %, +100 %. |
| 0:28.0 | Por eso se limitan la pérdida por operación y por sesión: un drawdown pequeño es recuperable. |

## 4.3-a · Tasa de acierto y esperanza

- **Tema:** 4.3 · Tasa de acierto y esperanza matemática
- **Objetivo:** Calcular la esperanza en múltiplos de R y ver por qué la tasa de acierto sola no basta.
- **Herramienta:** Remotion · **Duración:** 44 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Estrategia A: acierta 4 de cada 10, pero gana 3R y pierde 1R. |
| 0:09.0 | Esperanza = 0,4 × 3 − 0,6 × 1 = +0,6R por operación. |
| 0:15.0 | Estrategia B: acierta 7 de cada 10, gana 0,5R y pierde 1R. |
| 0:21.0 | Esperanza = 0,7 × 0,5 − 0,3 × 1 = +0,05R. Casi cero. |
| 0:27.0 | Con un costo de 0,1R por operación, A sigue en positivo y B pasa a perder. |
| 0:33.5 | La tasa de acierto sola no dice nada: importa cuánto ganas y cuánto pierdes. |

## 4.4-a · Mover el stop: cómo crece una pérdida

- **Tema:** 4.4 · La decisión antes del impulso
- **Objetivo:** Reconocer el desplazamiento del stop como sesgo y medir su costo en múltiplos de riesgo (R).
- **Herramienta:** Python (matplotlib) · **Duración:** 35 s

| Inicio | Texto |
|---|---|
| 0:03.0 | Entrada en 100, stop en 98: la pérdida máxima planeada es 1R. |
| 0:08.5 | El precio se acerca al stop y lo mueves «para darle espacio». |
| 0:14.0 | Vuelve a pasar. Ahora el riesgo es el doble y la operación ya no es la que planeaste. |
| 0:19.5 | La salida llega en 94: −3R. |
| 0:25.0 | Regla del diario: el stop solo se mueve a favor de la operación, nunca para ampliar la pérdida. |
