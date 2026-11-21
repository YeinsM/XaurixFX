"""Manual del nivel 7 · Backtesting avanzado y gestión de cartera. Cifras ilustrativas."""
M = {
 "intro": [
  "Una estrategia escrita y probada a mano (nivel 5) todavía puede ser una ilusión. Este nivel enseña a someterla a pruebas que intentan romperla: datos limpios, validación cronológica, costos realistas y escenarios adversos.",
  "El objetivo no es encontrar la curva más bonita, sino una conclusión <b>defendible</b>: continuar en demo, reformular o descartar la idea. Un resultado negativo bien documentado es un éxito del proceso.",
  "También pasarás de una sola estrategia a una cartera: cómo se suman los riesgos cuando varias posiciones dependen de los mismos factores y cómo simular secuencias de resultados.",
 ],
 "objetivos": [
  "Detectar sesgos de datos: supervivencia, información futura, ajustes y sobreajuste.",
  "Validar cronológicamente con datos fuera de muestra y walk-forward.",
  "Modelar costos realistas y medir métricas netas por período y régimen.",
  "Estresar una cartera y estimar drawdowns con Monte Carlo.",
 ],
 "temas": [
  {"tema": "7.1", "titulo": "Tres sesgos que inflan un backtest", "capsula": ["7.1-a", "7.1-b"], "profundizacion": [
   "<b>Calidad de datos.</b> Revisa huecos, precios atípicos (spikes), zonas horarias, cambios de horario de verano y si las velas usan bid, ask o medio. Un solo dato erróneo puede generar una operación ficticia muy rentable.",
   "<b>Series continuas de futuros.</b> Al empalmar vencimientos, el ajuste por diferencia mantiene los movimientos en puntos pero puede producir precios históricos negativos; el ajuste por ratio mantiene los porcentajes. Elige uno y documéntalo.",
   "<b>Número de pruebas.</b> Cada variante probada aumenta la probabilidad de un falso positivo. Lleva un registro de todas las pruebas, también las descartadas, y exige más evidencia cuanto más hayas buscado.",
   "<b>Sesgo del investigador.</b> Revisar el resultado y «mejorar» la regla una y otra vez sobre los mismos datos es una forma de sobreajuste aunque la regla parezca lógica.",
  ]},
  {"tema": "7.2", "titulo": "Validación cronológica de una estrategia", "capsula": "7.2-a", "profundizacion": [
   "<b>Separación simple.</b> Antes del walk-forward, la forma mínima es separar, por ejemplo, el 70 % inicial de los datos para desarrollo y el 30 % final para una única evaluación. Si miras el 30 % y luego cambias reglas, deja de ser fuera de muestra.",
   "<b>Sensibilidad a parámetros.</b> Representa el resultado para un rango de valores de cada parámetro. Una meseta (resultados similares en valores cercanos) indica robustez; un pico aislado indica sobreajuste.",
   "<b>Número mínimo de operaciones.</b> Con menos de 100 operaciones fuera de muestra, las métricas tienen mucha incertidumbre. Si la estrategia opera poco, necesitas más años o más instrumentos.",
  ]},
  {"tema": "7.3", "titulo": "La prueba de costos y resultados", "capsula": None,
   "explicacion": [
    "Un backtest realista modela <b>spread variable</b> (más amplio en aperturas y noticias), <b>deslizamiento</b> en órdenes a mercado y stops, <b>comisiones</b>, <b>financiación</b> y <b>liquidez</b> (no puedes ejecutar más tamaño del que el mercado ofrece). En órdenes límite, considera que tocar el precio no garantiza ejecución.",
    "Métricas mínimas, siempre en neto: retorno total y anualizado, <b>profit factor</b> (ganancias brutas ÷ pérdidas brutas), esperanza en R, tasa de acierto, <b>drawdown máximo</b> y su duración, tiempo de recuperación y exposición (porcentaje del tiempo con posición).",
    "Desglosa los resultados por año, por sesión y por régimen (tendencia, rango, alta y baja volatilidad). Una estrategia que gana solo en un año o en un régimen es frágil.",
    "Haz una <b>prueba de estrés de costos</b>: duplica el spread y el deslizamiento. Si la ventaja desaparece, la estrategia depende de condiciones de ejecución que quizá no tengas.",
   ],
   "ejemplo": {"titulo": "Del bruto al neto en 250 operaciones", "pasos": [
    "Bruto: ganancias 41.000 USD, pérdidas 30.000 USD → profit factor bruto = 1,37.",
    "Costos: spread 3.200 + comisión 1.500 + deslizamiento 2.300 + financiación 900 = 7.900 USD.",
    "Neto: 41.000 − 30.000 − 7.900 = <b>+3.100 USD</b>. Profit factor neto ≈ 41.000 ÷ (30.000 + 7.900) ≈ <b>1,08</b>.",
    "Con costos duplicados: 11.000 − 15.800 = <b>−4.800 USD</b>. La ventaja no sobrevive a peores condiciones.",
   ], "conclusion": "La mayoría de las estrategias mueren en la tabla de costos."},
   "errores": [
    "Usar spread fijo mínimo en todo el histórico.",
    "Suponer ejecución de órdenes límite al tocar el precio.",
    "Reportar solo el retorno total sin drawdown ni duración.",
    "No desglosar por año y régimen.",
   ],
   "checklist": [
    "Costos modelados por componente.",
    "Prueba con costos duplicados.",
    "Métricas netas completas.",
    "Resultados por año, sesión y régimen.",
   ],
   "ejercicios": [
    ["Ganancias brutas 18.000, pérdidas 12.000 y costos 2.000. ¿Profit factor neto aproximado?", "18.000 ÷ (12.000 + 2.000) ≈ 1,29."],
    ["Drawdown máximo 22 % y retorno anualizado 11 %. ¿Qué te dice la relación?", "Retorno ÷ drawdown ≈ 0,5: la caída es el doble del retorno anual; exige mucha tolerancia."],
    ["¿Por qué desglosar por régimen?", "Para ver si el resultado depende de un único tipo de mercado."],
   ],
   "glosario": [["Factor de beneficio", "Profit factor", "Ganancias brutas ÷ pérdidas brutas."],
                ["Exposición temporal", "Time in market", "Porcentaje del tiempo con posición."]],
  },
  {"tema": "7.4", "titulo": "Cuando varias posiciones caen juntas", "capsula": "7.4-a", "profundizacion": [
   "<b>Exposición neta y bruta.</b> La bruta suma el valor absoluto de todas las posiciones; la neta resta cortos de largos. Una cartera con largo y corto en activos muy correlacionados tiene neta baja pero riesgo de base.",
   "<b>Correlación cambiante.</b> En crisis, las correlaciones tienden a subir: activos que parecían independientes caen juntos. Estresa la cartera con correlación 1 en los factores comunes (dólar, tipos, renta variable).",
   "<b>Grid y martingala.</b> Abrir más posiciones a medida que el precio va en contra (grid) o duplicar tamaño tras pérdidas (martingala) acumula exposición: la curva parece estable hasta que un movimiento largo provoca una pérdida desproporcionada. Mide la exposición máxima alcanzada, no solo el resultado.",
   "<b>Rebalanceo.</b> Revisar pesos de forma periódica evita que una posición ganadora concentre el riesgo de la cartera.",
  ]},
 ],
 "caso": {
  "titulo": "Caso integrador: informe de backtest con veredicto",
  "enunciado": [
   "Estrategia de ruptura en XAUUSD (1 h) evaluada 2016–2023 con walk-forward de 3 años de ajuste y 6 meses de prueba. Fuera de muestra: 310 operaciones, acierto 38 %, ganancia media 2,3R, pérdida media 1R, costos 0,12R por operación, drawdown máximo 14R, peor año −9R.",
   "Calcula la esperanza neta, estima el resultado total y decide: continuar en demo, reformular o descartar. Indica qué riesgo por operación usarías si aceptas como máximo un 15 % de drawdown, teniendo en cuenta que el percentil 95 de Monte Carlo es 20R.",
  ],
  "solucion": [
   "Esperanza bruta = 0,38 × 2,3 − 0,62 × 1 = 0,874 − 0,62 = +0,254R; neta = +0,134R.",
   "Total estimado = 310 × 0,134 ≈ +41,5R en ocho años, con un año negativo de −9R.",
   "Riesgo por operación = 15 % ÷ 20R = 0,75 %.",
   "Veredicto: continuar en demo durante al menos 3 meses comparando señales y ejecuciones reales; la ventaja es positiva pero modesta y sensible a costos, por lo que conviene repetir la prueba con costos duplicados antes de operar en real.",
  ],
 },
 "autoevaluacion": [
  ["¿Qué es el sesgo de supervivencia?", "Excluir activos que desaparecieron."],
  ["Diferencia entre ajuste por diferencia y por ratio en series continuas.", "Por diferencia conserva puntos; por ratio conserva porcentajes."],
  ["¿Qué indica una meseta en la sensibilidad de parámetros?", "Robustez."],
  ["¿Qué se une en un walk-forward para evaluar?", "Solo los tramos de prueba."],
  ["Define profit factor.", "Ganancias brutas ÷ pérdidas brutas."],
  ["¿Para qué sirve duplicar los costos en la prueba?", "Para ver si la ventaja depende de condiciones de ejecución ideales."],
  ["¿Qué ocurre con las correlaciones en crisis?", "Suelen aumentar."],
  ["¿Por qué una martingala muestra una curva estable?", "Porque acumula exposición y pospone las pérdidas hasta un movimiento grande."],
  ["Percentil 95 de drawdown 25R y tolerancia 10 %: riesgo por operación.", "0,4 %."],
  ["¿Es un fracaso un resultado negativo bien documentado?", "No: evita perder dinero con una idea sin ventaja."],
 ],
}
