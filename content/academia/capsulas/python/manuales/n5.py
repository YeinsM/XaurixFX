"""Manual del nivel 5 · Diseño de estrategias y plan de trading. Cifras ilustrativas."""
M = {
 "intro": [
  "Hasta aquí aprendiste a leer el precio, ejecutar órdenes y controlar el riesgo. Este nivel convierte ese conocimiento en un <b>método</b>: una forma repetible de decidir qué operar, cuándo entrar, cuándo salir y cuánto arriesgar.",
  "Una estrategia no es una corazonada ni un indicador aislado. Es un conjunto de reglas escritas que otra persona puede aplicar al mismo tramo histórico y obtener las mismas operaciones. Esa reproducibilidad es lo que permite evaluarla con honestidad.",
  "El nivel recorre cuatro pasos: elegir un horizonte compatible con tu vida y tus costos, escoger una familia de estrategias coherente con el régimen de mercado, escribir las reglas sin ambigüedad y hacer una primera prueba sin mirar el futuro.",
 ],
 "objetivos": [
  "Elegir un horizonte de operación según disponibilidad, costos y exposición fuera de sesión.",
  "Distinguir tendencia, ruptura y reversión a la media, su régimen y su forma de fallar.",
  "Redactar un plan de trading de una página con todas las reglas.",
  "Ejecutar un replay vela por vela y medir el resultado neto de una muestra.",
 ],
 "temas": [
  {"tema": "5.1", "titulo": "Scalping, intradía, swing y posición", "capsula": "5.1-a", "profundizacion": [
   "<b>Disponibilidad real.</b> Antes de elegir, anota durante una semana en qué franjas puedes mirar el mercado sin interrupciones. Un scalper necesita bloques de concentración de una o dos horas; un swing trader puede revisar el mercado una o dos veces al día. Elegir un horizonte que no puedes atender produce entradas tardías, órdenes olvidadas y decisiones impulsivas.",
   "<b>Sesiones del oro.</b> XAUUSD cotiza casi 24 horas, pero su liquidez cambia: Asia suele ser más tranquila, Londres aporta volumen y la superposición con Nueva York concentra los movimientos y los datos macro de EE. UU. Un intradía suele concentrarse en Londres–Nueva York; un swing debe asumir que habrá movimientos mientras duerme.",
   "<b>Costo total por horizonte.</b> Calcula el costo de una operación típica (spread + comisión + deslizamiento medio + financiación esperada) y divídelo entre el objetivo medio. Si supera el 15–20 % del objetivo, el horizonte es demasiado corto para tu estructura de costos.",
   "<b>Tamaño y stop.</b> Al alargar el horizonte, los stops se amplían porque deben quedar fuera del ruido de una temporalidad mayor. Mantén el riesgo en dinero constante y reduce el tamaño: un stop cinco veces mayor exige una posición cinco veces menor.",
  ]},
  {"tema": "5.2", "titulo": "Tres ideas para contextos distintos", "capsula": "5.2-a", "profundizacion": [
   "<b>Cómo medir el régimen.</b> Algunas medidas simples: pendiente de una media larga (por ejemplo 50 o 100), relación entre el rango de los últimos N días y el ATR, o el porcentaje de cierres por encima de la media. Ningún filtro es perfecto, pero escribir uno obliga a ser explícito sobre cuándo opera la estrategia.",
   "<b>Perfiles de resultados.</b> Las estrategias de tendencia y ruptura suelen tener tasa de acierto baja (30–45 %) con ganancias grandes y rachas perdedoras largas. Las de reversión a la media suelen tener acierto alto (55–70 %) con ganancias pequeñas y pérdidas ocasionales grandes. Conocer el perfil te prepara psicológicamente para su comportamiento normal.",
   "<b>Combinar familias.</b> Una cartera con dos familias de régimen opuesto puede suavizar la curva de resultados, pero solo si cada una tiene ventaja propia comprobada. Combinar dos ideas sin ventaja no crea ventaja.",
   "<b>Caso de fallo documentado.</b> Para cada familia escribe un ejemplo histórico en el que habría fallado y qué señal temprana lo habría advertido. Ese ejercicio convierte las pérdidas futuras en eventos esperados y no en sorpresas.",
  ]},
  {"tema": "5.3", "titulo": "Convierte una idea en reglas", "capsula": "5.3-a", "profundizacion": [
   "<b>Gestión de la posición abierta.</b> Además de entrada y salida, define qué ocurre durante la operación: ¿mueves el stop a la entrada al alcanzar 1R? ¿cierras parcialmente en 1R? ¿sales por tiempo si no avanza en N velas? Cada regla adicional debe tener un motivo y probarse; no la añadas solo porque «suena bien».",
   "<b>Conflictos y prioridades.</b> Escribe qué pasa si se cumplen dos reglas a la vez: una señal nueva con una posición abierta, una señal durante el período de abstención, o un stop y un objetivo tocados en la misma vela. En el backtest, la convención más prudente es asumir que se tocó primero el stop.",
   "<b>Versionado del plan.</b> Pon fecha y número de versión al plan. Cualquier cambio de regla crea una versión nueva y reinicia la evaluación fuera de muestra. Así evitas mezclar resultados de reglas distintas.",
   "<b>Plantilla de una página.</b> Universo · Horario · Filtro · Señal · Entrada · Stop · Gestión · Salida · Tamaño · Abstención · Suspensión · Registro. Si algún apartado queda vacío, la estrategia aún no está lista para probarse.",
  ]},
  {"tema": "5.4", "titulo": "Primera prueba sin mirar el futuro", "capsula": None,
   "explicacion": [
    "La primera prueba de una estrategia puede hacerse a mano con un <b>replay</b>: el gráfico avanza vela por vela y decides con la información visible en ese momento, sin ver lo que viene después. Muchas plataformas (por ejemplo, la función de repetición de TradingView) lo permiten.",
    "La regla de oro es registrar cada decisión <b>antes</b> de avanzar la vela siguiente: señal, entrada, stop, objetivo y tamaño. Si avanzas y luego decides, el futuro contamina la prueba.",
    "Incluye todo: operaciones perdedoras, señales descartadas por filtros o por abstención, y los costos de cada operación. Una muestra sin pérdidas o sin costos no sirve para evaluar nada.",
    "Con 30 a 50 operaciones ya puedes estimar de forma preliminar la tasa de acierto, la ganancia y pérdida medias en R, la esperanza neta y el drawdown. Son cifras con mucha incertidumbre: sirven para decidir si vale la pena una prueba sistemática, no para operar con dinero real.",
   ],
   "ejemplo": {"titulo": "Replay de 40 operaciones en XAUUSD (1 h)", "pasos": [
    "Resultados: 16 ganadoras con media +2,1R y 24 perdedoras con media −1,0R.",
    "Esperanza bruta = (16 × 2,1 − 24 × 1,0) ÷ 40 = (33,6 − 24) ÷ 40 = <b>+0,24R</b>.",
    "Costos medios por operación: 0,08R → esperanza neta = <b>+0,16R</b>.",
    "Drawdown máximo durante la muestra: −6R, con una racha de 7 pérdidas seguidas.",
    "Decisión: la idea merece una prueba con más datos y fuera de muestra; aún no justifica dinero real.",
   ], "conclusion": "Una muestra pequeña orienta la siguiente prueba; no demuestra una ventaja."},
   "errores": [
    "Avanzar velas y decidir después (sesgo de información futura).",
    "No registrar las señales descartadas.",
    "Olvidar costos y deslizamiento.",
    "Cambiar las reglas durante el replay.",
   ],
   "checklist": [
    "Reglas congeladas antes de empezar.",
    "Cada decisión registrada antes de avanzar la vela.",
    "Costos incluidos por operación.",
    "Métricas calculadas en R y en neto.",
   ],
   "ejercicios": [
    ["20 operaciones: 9 ganan 1,8R y 11 pierden 1R. ¿Esperanza bruta?", "(9 × 1,8 − 11) ÷ 20 = (16,2 − 11) ÷ 20 = +0,26R."],
    ["Con costos de 0,1R por operación, ¿esperanza neta?", "+0,26 − 0,10 = +0,16R."],
    ["¿Por qué 40 operaciones no bastan para operar en real?", "Porque la incertidumbre es alta: el resultado puede deberse al azar y al tramo elegido."],
   ],
   "glosario": [["Repetición", "Replay / bar replay", "Avance manual del gráfico vela por vela."],
                ["Muestra", "Sample", "Conjunto de operaciones evaluadas."]],
  },
 ],
 "caso": {
  "titulo": "Caso integrador: del plan al primer veredicto",
  "enunciado": [
   "Tienes 2 horas al día entre las 09:00 y las 11:00 hora de Nueva York, una cuenta demo de 5.000 USD y costos medios en XAUUSD de 0,35 USD/oz por operación (spread + comisión).",
   "1) Elige horizonte y justifica. 2) Elige familia y su filtro de régimen. 3) Escribe las reglas completas. 4) Calcula el tamaño con riesgo de 0,5 % y un stop típico de 6 USD/oz. 5) Tras un replay de 30 operaciones con 12 ganadoras de +2,2R y 18 perdedoras de −1R, decide el siguiente paso.",
  ],
  "solucion": [
   "1) Intradía: la ventana de 2 horas impide scalping intensivo y no quieres dormir posiciones.",
   "2) Ruptura del rango asiático, con filtro de ATR superior a su media de 20 sesiones.",
   "3) Universo XAUUSD; horario 09:00–11:00; señal: cierre de 15 min fuera del rango asiático; entrada en la apertura siguiente; stop al otro lado del rango o 1 ATR; salida en 2R o a las 11:30; abstención 30 min antes y después de datos de alto impacto; suspensión tras 4 pérdidas seguidas.",
   "4) Riesgo = 25 USD; tamaño = 25 ÷ 6 ≈ 4,2 oz. Costo por operación ≈ 0,35 × 4,2 = 1,47 USD ≈ 0,06R.",
   "5) Esperanza bruta = (12 × 2,2 − 18) ÷ 30 = +0,28R; neta ≈ +0,22R. Siguiente paso: prueba sistemática con más años y validación fuera de muestra (nivel 7), sin dinero real todavía.",
  ],
 },
 "autoevaluacion": [
  ["¿Qué costo domina en el scalping?", "Spread y comisión respecto a objetivos pequeños."],
  ["¿Qué riesgo añade el swing frente al intradía?", "Gaps y financiación al mantener posiciones fuera de sesión."],
  ["¿En qué régimen falla una estrategia de tendencia?", "En rangos laterales."],
  ["¿Qué familia tiene típicamente acierto alto y pérdidas ocasionales grandes?", "Reversión a la media."],
  ["Cita cinco elementos de un plan de trading.", "Universo, horario, filtro, señal, entrada, stop, salida, tamaño, abstención, suspensión."],
  ["¿Cómo se trata un stop y un objetivo tocados en la misma vela en un backtest prudente?", "Se asume que se tocó primero el stop."],
  ["¿Por qué se versiona el plan?", "Para no mezclar resultados de reglas distintas."],
  ["¿Cuál es la regla de oro del replay?", "Decidir y registrar antes de avanzar la vela."],
  ["15 ganan 2R y 25 pierden 1R. ¿Esperanza?", "(30 − 25) ÷ 40 = +0,125R."],
  ["¿Qué decide una primera prueba pequeña?", "Si vale la pena una prueba sistemática, no si se opera en real."],
 ],
}
