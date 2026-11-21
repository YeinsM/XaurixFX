"""Guía de estudio ampliada · Nivel 3. Cifras ilustrativas."""
G = {
 "3.1-a": {
  "explicacion": [
   "Un <b>soporte</b> es una zona donde el precio dejó de caer al menos dos veces porque la demanda superó a la oferta. Una <b>resistencia</b> es la zona equivalente donde las subidas se frenaron.",
   "Son zonas, no líneas exactas. Las mechas suelen perforarlas un poco porque se activan stops y órdenes pendientes alrededor del nivel. Dibuja la zona desde los cuerpos hasta las mechas más representativas.",
   "Un nivel gana relevancia con el número de toques, la temporalidad en la que aparece y la reacción que provocó. Un soporte en el gráfico diario pesa más que uno de cinco minutos.",
   "Cuando una resistencia se rompe con cierres claros, muchas veces el precio vuelve a probarla desde arriba y actúa como soporte: es el <b>cambio de polaridad</b>. No ocurre siempre; por eso se espera la reacción antes de actuar.",
  ],
  "ejemplo": {
   "titulo": "Rango de XAUUSD entre 2.365 y 2.395",
   "pasos": [
    "Mínimos en 2.366, 2.364 y 2.367: zona de soporte 2.363–2.369.",
    "Máximos en 2.393 y 2.394: zona de resistencia 2.391–2.397.",
    "Ancho del rango: 2.394 − 2.366 ≈ <b>28 USD</b>.",
    "Tras romper 2.397 con cierre en 2.405, el precio vuelve a 2.398 y rebota: la antigua resistencia actúa como soporte.",
   ],
   "conclusion": "La zona te da un lugar lógico para el stop: al otro lado de ella, no dentro.",
  },
  "errores": [
   "Dibujar líneas exactas al tick y esperar que el precio las respete.",
   "Dar el mismo peso a niveles de temporalidades muy bajas.",
   "Poner el stop justo dentro de la zona, donde las mechas lo alcanzan.",
   "Asumir que todo nivel roto cambiará de polaridad.",
  ],
  "checklist": [
   "Marqué zonas con al menos dos reacciones.",
   "Sé en qué temporalidad aparece cada nivel.",
   "Mi stop está fuera de la zona.",
   "Espero confirmación antes de actuar en un cambio de polaridad.",
  ],
  "ejercicios": [
   ["Mínimos en 1.0820, 1.0815 y 1.0823 en EUR/USD. ¿Qué zona de soporte marcarías?", "Aproximadamente 1.0813–1.0825, cubriendo cuerpos y mechas."],
   ["Compras en 2.370 sobre un soporte 2.363–2.369. ¿Dónde pondrías el stop razonable?", "Por debajo de la zona, por ejemplo 2.360, no en 2.366."],
   ["¿Qué señal necesitas para considerar que una resistencia rota pasó a soporte?", "Cierres por encima y una vuelta al nivel con reacción alcista (rechazo) en él."],
  ],
  "glosario": [
   ["Soporte", "Support", "Zona donde las caídas se detienen."],
   ["Resistencia", "Resistance", "Zona donde las subidas se frenan."],
   ["Cambio de polaridad", "Role reversal", "Resistencia rota que actúa como soporte, o al revés."],
   ["Mecha", "Wick / shadow", "Extremo de la vela fuera del cuerpo."],
  ],
  "resumen": [
   "Soportes y resistencias son zonas.",
   "Más toques y temporalidad mayor dan más peso.",
   "El stop va fuera de la zona.",
  ],
 },
 "3.1-b": {
  "explicacion": [
   "Un <b>rompimiento</b> ocurre cuando el precio cierra fuera de un rango y se mantiene ahí. Un <b>falso rompimiento</b> es cuando sale con la mecha o durante unos minutos y vuelve a cerrar dentro, atrapando a quienes entraron con el primer toque.",
   "El criterio más simple es el <b>cierre</b> de la vela en la temporalidad que operas. Un toque intradía no es una ruptura en el diario.",
   "Señales de calidad: cierre claro fuera de la zona (no al borde), cuerpo amplio, volumen o actividad mayor que la media y, a menudo, una vuelta a probar el nivel (retest) que se sostiene.",
   "Define antes la invalidación: si tras romper el precio vuelve a cerrar dentro del rango, la idea falla y se sale.",
  ],
  "ejemplo": {
   "titulo": "Resistencia 2.393–2.397 en XAUUSD (temporalidad de 1 hora)",
   "pasos": [
    "Caso A: vela cierra en 2.399,5 (2,5 USD fuera de la zona). La siguiente baja a 2.396 y cierra arriba: retest sostenido.",
    "Entrada tras el retest en 2.398; invalidación con cierre bajo 2.390; stop en 2.389 → riesgo 9 USD/oz.",
    "Caso B: la mecha llega a 2.400, pero la vela cierra en 2.392, dentro de la zona: no hay ruptura.",
    "Quien compró el toque en 2.400 con stop en 2.391 pierde 9 USD/oz cuando el precio vuelve a 2.390.",
   ],
   "conclusion": "Esperar el cierre cuesta algo de precio, pero filtra muchas rupturas falsas.",
  },
  "errores": [
   "Entrar en el primer toque del nivel.",
   "Confundir el cierre de 5 minutos con el de la temporalidad del análisis.",
   "No definir la invalidación antes de entrar.",
   "Perseguir el precio muy lejos del nivel roto.",
  ],
  "checklist": [
   "Hubo cierre fuera de la zona en mi temporalidad.",
   "Sé dónde se invalida la ruptura.",
   "La distancia a mi stop es aceptable en dinero.",
   "No estoy persiguiendo una vela extendida.",
  ],
  "ejercicios": [
   ["Resistencia 1.1000–1.1010. Una vela de 1 h llega a 1.1025 y cierra en 1.1008. ¿Ruptura?", "No: cerró dentro de la zona; es un posible falso rompimiento."],
   ["Compras ruptura en 2.402 con invalidación por cierre bajo 2.390. ¿Riesgo por onza si el stop va en 2.389?", "2.402 − 2.389 = 13 USD/oz."],
   ["¿Qué ventaja tiene esperar el retest?", "Confirma que el nivel sostiene y suele permitir un stop más cercano."],
  ],
  "glosario": [
   ["Rompimiento", "Breakout", "Cierre y permanencia fuera de un rango."],
   ["Falso rompimiento", "False breakout / fakeout", "Salida temporal que vuelve al rango."],
   ["Retesteo", "Retest", "Vuelta del precio al nivel roto."],
   ["Invalidación", "Invalidation", "Condición que demuestra que la idea falló."],
  ],
  "resumen": [
   "Ruptura = cierre fuera y permanencia.",
   "El primer toque no confirma nada.",
   "Define la invalidación antes de entrar.",
  ],
 },
 "3.1-c": {
  "explicacion": [
   "Una <b>tendencia alcista</b> encadena máximos y mínimos crecientes; una <b>bajista</b>, máximos y mínimos decrecientes. Un <b>rango</b> alterna entre un techo y un piso sin progreso claro.",
   "La tendencia termina, como mínimo, cuando se rompe esa secuencia: en una alcista, cuando el precio pierde el último mínimo relevante.",
   "La misma serie puede verse distinta según la temporalidad. Lo habitual es usar una temporalidad mayor para el contexto (por ejemplo 4 horas o diario), una intermedia para la estructura y una menor para el momento de entrada.",
   "Operar a favor de la temporalidad mayor no garantiza nada, pero evita entrar contra un movimiento dominante por una señal menor.",
  ],
  "ejemplo": {
   "titulo": "XAUUSD: 4 horas frente a 15 minutos",
   "pasos": [
    "En 4 h: mínimos 2.352 → 2.361 → 2.372 y máximos 2.376 → 2.390 → 2.404: tendencia alcista.",
    "En 15 min, las últimas 8 horas oscilan entre 2.398 y 2.405: un rango dentro de la tendencia.",
    "Lectura: el contexto es alcista; el rango menor sugiere esperar una ruptura al alza o un retroceso a soporte.",
    "La tendencia de 4 h se invalidaría con un cierre bajo 2.372, el último mínimo relevante.",
   ],
   "conclusion": "Contexto en la mayor, detalle en la menor y una invalidación clara.",
  },
  "errores": [
   "Analizar solo una temporalidad muy baja.",
   "Llamar tendencia a dos velas en la misma dirección.",
   "Ignorar que un rango menor puede ser solo una pausa.",
   "No definir qué rompería la tendencia.",
  ],
  "checklist": [
   "Revisé al menos dos temporalidades.",
   "Identifiqué la secuencia de máximos y mínimos.",
   "Sé qué mínimo o máximo invalida la tendencia.",
   "Mi entrada no contradice el contexto mayor sin un motivo claro.",
  ],
  "ejercicios": [
   ["Máximos 105, 110, 108 y mínimos 100, 103, 101. ¿Qué estructura ves?", "Se rompió la secuencia: máximo 108 < 110 y mínimo 101 < 103. Ya no es tendencia alcista; posible rango o giro."],
   ["Tendencia alcista con últimos mínimos 2.361 y 2.372. ¿Qué la invalida?", "Un cierre por debajo de 2.372."],
   ["¿Qué temporalidad usarías para el contexto si operas en 15 minutos?", "Una mayor, como 1 h o 4 h."],
  ],
  "glosario": [
   ["Tendencia", "Trend", "Secuencia de máximos y mínimos en una dirección."],
   ["Rango", "Range", "Movimiento lateral entre techo y piso."],
   ["Temporalidad", "Timeframe", "Duración de cada vela del gráfico."],
   ["Estructura", "Market structure", "Secuencia de máximos y mínimos."],
  ],
  "resumen": [
   "Tendencia = máximos y mínimos en una dirección.",
   "Cada temporalidad cuenta una parte.",
   "Define qué rompería la tendencia.",
  ],
 },
 "3.2-a": {
  "explicacion": [
   "Una <b>media móvil simple</b> de 20 suma los últimos 20 cierres y divide entre 20. Suaviza el ruido y ayuda a ver dirección, pero va retrasada: necesita que el precio ya se haya movido para girar.",
   "La pendiente de la media y la posición del precio respecto a ella describen el contexto: precio por encima de una media que sube sugiere fuerza; por debajo de una que baja, debilidad. En un rango, la media es plana y el precio la cruza a menudo.",
   "El <b>RSI</b> (índice de fuerza relativa, normalmente de 14 periodos) compara la magnitud de las subidas con la de las bajadas recientes en una escala de 0 a 100.",
   "Por encima de 70 se suele hablar de sobrecompra y por debajo de 30 de sobreventa, pero en tendencias fuertes el RSI puede quedarse ahí mucho tiempo. Úsalo como contexto o para detectar pérdida de fuerza, no como orden automática.",
  ],
  "ejemplo": {
   "titulo": "Media móvil de 5 periodos y lectura del RSI",
   "pasos": [
    "Cierres: 100, 102, 101, 104, 108. Media = 515 ÷ 5 = <b>103</b>.",
    "Nuevo cierre 110: se sale el 100 y entra el 110. Media = (102 + 101 + 104 + 108 + 110) ÷ 5 = 525 ÷ 5 = <b>105</b>.",
    "El precio (110) está sobre una media que sube: contexto alcista.",
    "RSI en 76 durante 10 sesiones mientras la tendencia sigue: vender solo por «sobrecompra» habría ido contra el movimiento.",
   ],
   "conclusion": "Los indicadores resumen el precio pasado; no lo predicen.",
  },
  "errores": [
   "Vender automáticamente cada vez que el RSI supera 70.",
   "Usar cruces de medias en mercados laterales.",
   "Acumular indicadores que miden lo mismo.",
   "Olvidar que la media siempre llega tarde.",
  ],
  "checklist": [
   "Sé qué mide cada indicador que uso.",
   "Interpreto el indicador dentro del contexto de precio.",
   "No duplico información con indicadores similares.",
   "Tengo una regla escrita sobre cómo lo uso.",
  ],
  "ejercicios": [
   ["Cierres 50, 52, 54, 53. ¿Media de 4 periodos?", "(50 + 52 + 54 + 53) ÷ 4 = 209 ÷ 4 = 52,25."],
   ["RSI en 25 en plena tendencia bajista. ¿Es señal de compra?", "No por sí solo: indica debilidad fuerte; en tendencia bajista puede seguir bajo 30."],
   ["¿Por qué una media de 200 reacciona más lento que una de 20?", "Porque promedia más datos, así que cada nuevo cierre pesa menos."],
  ],
  "glosario": [
   ["Media móvil simple", "Simple moving average (SMA)", "Promedio de los últimos N cierres."],
   ["Índice de fuerza relativa", "Relative Strength Index (RSI)", "Oscilador de 0 a 100 de fuerza reciente."],
   ["Sobrecompra", "Overbought", "RSI alto; no implica giro inmediato."],
   ["Retraso", "Lag", "Demora del indicador respecto al precio."],
  ],
  "resumen": [
   "La media suaviza y llega tarde.",
   "El RSI mide fuerza, no da órdenes.",
   "Interpreta siempre dentro del contexto.",
  ],
 },
 "3.2-b": {
  "explicacion": [
   "El <b>rango verdadero</b> (true range) de una vela es el mayor de: máximo − mínimo, |máximo − cierre anterior| y |mínimo − cierre anterior|. Así incluye los huecos entre velas.",
   "El <b>ATR</b> (average true range, normalmente 14) promedia esos rangos y mide cuánto se mueve el precio, sin indicar dirección.",
   "Sirve para adaptar stops y objetivos a la volatilidad: un stop de 1,5 × ATR se aleja cuando el mercado se agita y se acerca cuando está tranquilo. También ayuda a dimensionar: si el stop es más amplio, la posición debe ser más pequeña para arriesgar lo mismo.",
   "Un ATR que sube bruscamente avisa de cambio de régimen (noticias, pánico, apertura de sesión). Compara el ATR actual con su media reciente.",
  ],
  "ejemplo": {
   "titulo": "Stop por ATR en XAUUSD con riesgo fijo de 100 USD",
   "pasos": [
    "Vela: máximo 2.392, mínimo 2.380, cierre anterior 2.395. TR = máx(12, 3, 15) = <b>15</b> (hubo hueco).",
    "ATR(14) en calma = 6 USD → stop a 1,5 × 6 = 9 USD → tamaño = 100 ÷ 9 ≈ <b>11 oz</b>.",
    "ATR tras un dato = 14 USD → stop a 21 USD → tamaño = 100 ÷ 21 ≈ <b>4,7 oz</b>.",
    "Mismo riesgo en dinero, distinto tamaño según la volatilidad.",
   ],
   "conclusion": "El ATR traduce volatilidad en distancias y tamaños coherentes.",
  },
  "errores": [
   "Usar el ATR como señal de dirección.",
   "Mantener el mismo tamaño cuando el ATR se duplica.",
   "Calcular el rango solo como máximo − mínimo e ignorar huecos.",
   "Usar el ATR de una temporalidad distinta a la de tus stops.",
  ],
  "checklist": [
   "Conozco el ATR actual y su media reciente.",
   "Mi stop tiene en cuenta la volatilidad.",
   "Ajusté el tamaño al nuevo stop.",
   "Uso el ATR de la misma temporalidad que opero.",
  ],
  "ejercicios": [
   ["Máximo 105, mínimo 101, cierre anterior 99. ¿Rango verdadero?", "máx(4, |105 − 99| = 6, |101 − 99| = 2) = 6."],
   ["ATR 8 y stop a 2 × ATR con riesgo de 80 USD. ¿Tamaño en unidades?", "Stop 16; 80 ÷ 16 = 5 unidades."],
   ["El ATR pasa de 5 a 10. Si mantienes el stop en 1,5 × ATR, ¿qué haces con el tamaño?", "Reducirlo a la mitad para mantener el mismo riesgo en dinero."],
  ],
  "glosario": [
   ["Rango verdadero", "True range", "Recorrido de una vela incluyendo huecos."],
   ["Rango verdadero medio", "Average True Range (ATR)", "Promedio del rango verdadero."],
   ["Volatilidad", "Volatility", "Magnitud de las variaciones del precio."],
   ["Hueco", "Gap", "Salto entre el cierre anterior y la apertura."],
  ],
  "resumen": [
   "El ATR mide cuánto se mueve, no hacia dónde.",
   "Stops más amplios exigen posiciones menores.",
   "Un ATR que se dispara indica cambio de régimen.",
  ],
 },
 "3.4-a": {
  "explicacion": [
   "Un análisis útil no predice un único futuro: prepara <b>escenarios</b> con condiciones observables. Para cada uno define qué lo confirma, qué lo invalida y qué harías.",
   "Usa solo información disponible en la <b>fecha del caso</b>: precio, niveles, calendario económico y contexto conocido ese día. Mirar datos posteriores contamina la evaluación.",
   "Incluye un escenario de <b>abstención</b>: situaciones en las que no operar es la mejor decisión, como un dato de alto impacto inminente, spreads anormales o niveles demasiado cerca para un stop razonable.",
   "Guarda el informe con fecha y revísalo después. El objetivo no es acertar siempre, sino comprobar si tus condiciones eran claras y si las respetaste.",
  ],
  "ejemplo": {
   "titulo": "Plantilla de tres escenarios para XAUUSD en 2.386",
   "pasos": [
    "Alcista: confirma con cierre de 4 h sobre 2.400; invalida con cierre bajo 2.380; objetivo de referencia 2.420; riesgo ≈ 20 USD/oz.",
    "Bajista: confirma con cierre bajo 2.370; invalida sobre 2.390; objetivo 2.350; riesgo ≈ 20 USD/oz.",
    "Lateral: mientras no haya cierres fuera de 2.370–2.400, no se persiguen rupturas.",
    "Abstención: dato de empleo de EE. UU. en menos de 30 minutos o spread mayor que el doble del habitual.",
   ],
   "conclusion": "Cada escenario tiene una condición observable, una invalidación y una acción.",
  },
  "errores": [
   "Escribir un único escenario «seguro».",
   "Usar información posterior a la fecha del caso.",
   "Escenarios sin invalidación concreta.",
   "Reescribir la hipótesis después de conocer el desenlace.",
  ],
  "checklist": [
   "Fecha del caso guardada.",
   "Tres escenarios con confirmación e invalidación.",
   "Condiciones de abstención escritas.",
   "Calendario económico revisado.",
  ],
  "ejercicios": [
   ["Escribe la invalidación del escenario alcista si la confirmación es cierre sobre 2.400 y el soporte clave es 2.380.", "Cierre por debajo de 2.380."],
   ["Hay un dato de inflación en 10 minutos y el spread se triplicó. ¿Qué escenario aplica?", "Abstención: esperar a que pase el dato y se normalice el spread."],
   ["¿Por qué guardar la fecha del análisis?", "Para evaluar después sin sesgo de información futura y comparar con el desenlace real."],
  ],
  "glosario": [
   ["Escenario", "Scenario", "Hipótesis condicional con reglas."],
   ["Confirmación", "Confirmation", "Condición que activa el escenario."],
   ["Abstención", "Stand aside / no trade", "Decisión de no operar."],
   ["Calendario económico", "Economic calendar", "Agenda de datos macro."],
  ],
  "resumen": [
   "Prepara escenarios, no predicciones.",
   "Cada uno con confirmación, invalidación y acción.",
   "No operar también es una decisión.",
  ],
 },
}
