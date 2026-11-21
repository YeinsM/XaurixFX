"""Guía de estudio ampliada · Nivel 7. Cifras ilustrativas."""
G = {
 "7.1-a": {
  "explicacion": [
   "El <b>sesgo de supervivencia</b> aparece cuando el conjunto de datos solo incluye activos que siguen existiendo hoy. Las empresas que quebraron, fueron absorbidas o salieron del índice desaparecen, y con ellas sus pérdidas.",
   "Un backtest sobre «las acciones actuales del índice» durante 20 años está mirando el pasado con la lista del presente: elige ganadores sin saberlo. El resultado sale inflado.",
   "Otros sesgos relacionados: <b>información futura</b> (usar datos que no se conocían en la fecha de la decisión, como resultados revisados) y <b>ajustes corporativos</b> mal aplicados (splits y dividendos). En futuros, las series continuas deben construirse con un método de empalme explícito.",
   "La solución es usar bases de datos con activos retirados (delisted) y la composición histórica del índice en cada fecha.",
  ],
  "ejemplo": {
   "titulo": "Universo de 24 acciones durante 5 años",
   "pasos": [
    "17 sobreviven con un rendimiento medio de +12 %.",
    "7 dejan de cotizar con un rendimiento medio de −60 %.",
    "Promedio solo de supervivientes: <b>+12 %</b>.",
    "Promedio real del universo: (17 × 12 + 7 × (−60)) ÷ 24 = (204 − 420) ÷ 24 = <b>−9 %</b>.",
   ],
   "conclusion": "Ignorar los activos retirados puede convertir una pérdida en una ganancia aparente.",
  },
  "errores": [
   "Usar la composición actual de un índice para fechas pasadas.",
   "Descargar solo los tickers que existen hoy.",
   "Usar datos revisados que no estaban disponibles en la fecha.",
   "No documentar cómo se ajustaron splits y dividendos.",
  ],
  "checklist": [
   "Mis datos incluyen activos retirados.",
   "Uso la composición histórica de cada fecha.",
   "Cada dato estaba disponible en el momento de la decisión.",
   "Documenté ajustes y empalmes.",
  ],
  "ejercicios": [
   ["10 activos: 8 ganan 10 % y 2 pierden 100 %. ¿Promedio de supervivientes y real?", "Supervivientes +10 %; real (80 − 200) ÷ 10 = −12 %."],
   ["¿Por qué usar la lista actual del S&P 500 para 2005 sesga el resultado?", "Porque incluye empresas que entraron después precisamente por haber crecido."],
   ["Da un ejemplo de información futura en un backtest.", "Usar el beneficio anual revisado que se publicó meses después de la fecha simulada."],
  ],
  "glosario": [
   ["Sesgo de supervivencia", "Survivorship bias", "Excluir activos que desaparecieron."],
   ["Activo retirado", "Delisted security", "Valor que dejó de cotizar."],
   ["Información futura", "Look-ahead bias", "Usar datos no disponibles en la fecha."],
   ["Ajuste corporativo", "Corporate action adjustment", "Corrección por splits y dividendos."],
  ],
  "resumen": [
   "Los datos solo de supervivientes inflan resultados.",
   "Usa la composición histórica.",
   "Cada dato debe ser conocido en su fecha.",
  ],
 },
 "7.1-b": {
  "explicacion": [
   "El <b>sobreajuste</b> ocurre cuando una estrategia se adapta al ruido de los datos históricos en lugar de a un comportamiento persistente. Cuantas más combinaciones pruebas, más probable es encontrar una que parezca excelente por azar.",
   "Señales de alarma: muchos parámetros, reglas muy específicas, pocas operaciones, resultados que cambian mucho al mover un parámetro un poco y una curva de capital demasiado limpia.",
   "La defensa principal es reservar datos <b>fuera de muestra</b> que nunca se usan para ajustar, preferir reglas simples con lógica económica, y comprobar que valores cercanos de los parámetros también funcionan (estabilidad).",
   "Registra cuántas variantes probaste: ese número es parte del resultado.",
  ],
  "ejemplo": {
   "titulo": "1.200 combinaciones de parámetros",
   "pasos": [
    "La mejor combinación muestra +85R en la muestra de ajuste, con un drawdown de solo 4R.",
    "Con 1.200 intentos, es esperable que alguna destaque por azar aunque ninguna tenga ventaja real.",
    "En los datos fuera de muestra, la misma combinación da <b>−20R</b>.",
    "Una variante más simple con 2 parámetros dio +30R dentro y +18R fuera: menos espectacular, más robusta.",
   ],
   "conclusion": "El resultado fuera de muestra decide, no el mejor de la optimización.",
  },
  "errores": [
   "Elegir la mejor combinación de miles sin validarla.",
   "Usar los datos fuera de muestra para «retocar» reglas.",
   "Añadir filtros hasta eliminar todas las pérdidas históricas.",
   "Ignorar la sensibilidad a parámetros cercanos.",
  ],
  "checklist": [
   "Reservé datos fuera de muestra desde el inicio.",
   "Mi estrategia tiene pocos parámetros con lógica.",
   "Probé la estabilidad con valores cercanos.",
   "Registré cuántas variantes probé.",
  ],
  "ejercicios": [
   ["Una estrategia gana con media 20 pero pierde con 18 y 22. ¿Qué sugiere?", "Inestabilidad: probable sobreajuste al valor 20."],
   ["¿Por qué no debes mirar los datos fuera de muestra mientras ajustas?", "Porque dejarían de ser independientes y el sesgo volvería a aparecer."],
   ["Cita dos señales de alarma de sobreajuste.", "Muchos parámetros y pocas operaciones; curva demasiado perfecta."],
  ],
  "glosario": [
   ["Sobreajuste", "Overfitting", "Ajuste al ruido del pasado."],
   ["Dentro de muestra", "In-sample", "Datos usados para ajustar."],
   ["Fuera de muestra", "Out-of-sample", "Datos reservados para evaluar."],
   ["Robustez", "Robustness", "Estabilidad ante cambios en datos y parámetros."],
  ],
  "resumen": [
   "Probar mucho aumenta el riesgo de engañarte.",
   "Reserva datos fuera de muestra.",
   "Prefiere reglas simples y estables.",
  ],
 },
 "7.2-a": {
  "explicacion": [
   "La validación <b>walk-forward</b> imita cómo usarías una estrategia en la realidad: ajustas parámetros con una ventana del pasado y los aplicas al período siguiente que no has visto.",
   "Luego desplazas ambas ventanas hacia adelante y repites. La evaluación final se construye uniendo solo los tramos de prueba, todos fuera de muestra.",
   "Puede ser de ventana <b>anclada</b> (el ajuste empieza siempre en la misma fecha y crece) o <b>móvil</b> (longitud fija). Lo importante es respetar el orden cronológico.",
   "Si los parámetros óptimos cambian mucho entre ventanas, la estrategia depende del período concreto: señal de fragilidad.",
  ],
  "ejemplo": {
   "titulo": "6 años de datos con ventanas de 4 años de ajuste y 6 meses de prueba",
   "pasos": [
    "Ventana 1: ajuste 2018–2021, prueba 1.er semestre 2022.",
    "Ventana 2: ajuste 2018-07 a 2022-06, prueba 2.º semestre 2022. Y así sucesivamente.",
    "Resultados de prueba: +4R, −2R, +3R, +1R → <b>+6R</b> fuera de muestra en total.",
    "Parámetro óptimo por ventana: 20, 22, 20, 21 → estable.",
   ],
   "conclusion": "La curva de los tramos de prueba es la estimación honesta del rendimiento.",
  },
  "errores": [
   "Mezclar datos de prueba en el ajuste.",
   "Barajar los datos sin respetar el tiempo.",
   "Juzgar por la ventana de ajuste más brillante.",
   "Ignorar la variabilidad de los parámetros entre ventanas.",
  ],
  "checklist": [
   "Respeté el orden cronológico.",
   "Uní solo los tramos de prueba.",
   "Registré los parámetros de cada ventana.",
   "Incluí costos en cada tramo.",
  ],
  "ejercicios": [
   ["Tramos de prueba: +3R, −4R, +1R, +2R. ¿Resultado fuera de muestra?", "+2R."],
   ["Parámetros óptimos por ventana: 10, 45, 12, 60. ¿Qué indican?", "Inestabilidad: la estrategia depende mucho del período."],
   ["¿Por qué no se pueden barajar aleatoriamente los datos en trading?", "Porque se usaría información del futuro para decidir en el pasado."],
  ],
  "glosario": [
   ["Validación progresiva", "Walk-forward analysis", "Ajustar en el pasado y probar en lo siguiente."],
   ["Ventana de ajuste", "Training window", "Período usado para elegir parámetros."],
   ["Ventana de prueba", "Test window", "Período usado para evaluar."],
   ["Ventana anclada", "Anchored window", "Ajuste que siempre empieza en la misma fecha."],
  ],
  "resumen": [
   "Ajusta en el pasado, prueba en lo siguiente.",
   "Evalúa solo con los tramos de prueba unidos.",
   "Parámetros inestables, idea frágil.",
  ],
 },
 "7.4-a": {
  "explicacion": [
   "El historial de una estrategia es solo una de las muchas secuencias posibles. Con las mismas operaciones en otro orden, el resultado final es idéntico, pero el <b>drawdown</b> y las rachas cambian mucho.",
   "La simulación <b>Monte Carlo</b> por remuestreo reordena (o muestrea con reemplazo) las operaciones miles de veces y obtiene una distribución de drawdowns, rachas y resultados.",
   "Dimensionar con el percentil 95 del drawdown simulado, y no con el drawdown que tuviste, prepara para escenarios plausibles.",
   "En cartera, añade la correlación: varias posiciones pueden caer juntas en momentos de estrés. Estresar la cartera con caídas simultáneas complementa la simulación.",
  ],
  "ejemplo": {
   "titulo": "100 operaciones: 45 ganan 1,5R y 55 pierden 1R",
   "pasos": [
    "Resultado total: 45 × 1,5 − 55 × 1 = 67,5 − 55 = <b>+12,5R</b> en cualquier orden.",
    "Drawdown máximo observado: 8R.",
    "En 1.000 reordenaciones, el percentil 95 del drawdown es de unos 16R (ilustrativo).",
    "Con 1 % de riesgo por operación, un drawdown de 16R son −16 % de la cuenta: hay que aceptarlo o reducir el riesgo por operación.",
   ],
   "conclusion": "Planifica para la peor caída razonable, no para la que viste.",
  },
  "errores": [
   "Dimensionar con el drawdown histórico único.",
   "Ignorar la correlación entre posiciones.",
   "Simular sin costos.",
   "Confundir el resultado medio con el resultado garantizado.",
  ],
  "checklist": [
   "Simulé el orden de las operaciones.",
   "Conozco el percentil 95 del drawdown.",
   "Mi riesgo por operación tolera esa caída.",
   "Estresé la cartera con caídas simultáneas.",
  ],
  "ejercicios": [
   ["30 ganan 2R y 70 pierden 1R. ¿Resultado total?", "60 − 70 = −10R: negativo en cualquier orden."],
   ["Percentil 95 del drawdown = 20R y aceptas como máximo −10 % de cuenta. ¿Riesgo por operación?", "10 % ÷ 20 = 0,5 % por operación."],
   ["¿Qué cambia al reordenar operaciones: el resultado final o el camino?", "Solo el camino (drawdowns y rachas)."],
  ],
  "glosario": [
   ["Simulación Monte Carlo", "Monte Carlo simulation", "Muchas secuencias aleatorias para ver la distribución."],
   ["Remuestreo", "Resampling / bootstrap", "Reordenar o muestrear operaciones."],
   ["Percentil", "Percentile", "Valor bajo el cual queda un porcentaje de casos."],
   ["Prueba de estrés", "Stress test", "Simular escenarios adversos extremos."],
  ],
  "resumen": [
   "El orden cambia el camino, no el total.",
   "Dimensiona con el drawdown del percentil 95.",
   "Considera la correlación de la cartera.",
  ],
 },
}
