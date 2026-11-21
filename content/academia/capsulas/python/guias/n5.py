"""Guía de estudio ampliada · Nivel 5. Cifras ilustrativas."""
G = {
 "5.1-a": {
  "explicacion": [
   "El horizonte define cuánto tiempo mantienes una posición: <b>scalping</b> (segundos a minutos), <b>intradía</b> (minutos a horas, sin dormir posiciones), <b>swing</b> (días a semanas) y <b>posición</b> (semanas a meses).",
   "Horizontes cortos implican más operaciones, objetivos pequeños y mucho peso de spread y comisión; además exigen atención constante y ejecución rápida.",
   "Horizontes largos tienen menos operaciones y costos de transacción relativos menores, pero acumulan financiación y riesgo de gaps nocturnos y de fin de semana. Sus stops son más amplios, así que el tamaño debe ser menor.",
   "Elige según tu disponibilidad real, tus costos y tu tolerancia: un horizonte que no puedes vigilar o pagar no es viable.",
  ],
  "ejemplo": {
   "titulo": "Peso del spread según el objetivo en XAUUSD (spread 0,30 USD)",
   "pasos": [
    "Scalping con objetivo de 1,50 USD/oz: el spread es el <b>20 %</b> del objetivo.",
    "Intradía con objetivo de 8 USD/oz: <b>3,75 %</b>.",
    "Swing con objetivo de 40 USD/oz: <b>0,75 %</b>, pero 5 noches de swap a 0,15 USD/oz suman 0,75 USD/oz más.",
    "Conclusión práctica: cada horizonte tiene su costo dominante.",
   ],
   "conclusion": "Calcula el costo relativo al objetivo antes de elegir horizonte.",
  },
  "errores": [
   "Elegir scalping sin tiempo para vigilar la pantalla.",
   "Mantener operaciones intradía de un día para otro «porque van mal».",
   "Usar el mismo tamaño con stops de swing que con stops intradía.",
   "Ignorar el swap en estrategias de varias semanas.",
  ],
  "checklist": [
   "Mi horizonte encaja con mi disponibilidad.",
   "Calculé el costo relativo al objetivo.",
   "Sé si dormiré posiciones y su costo.",
   "Mi tamaño refleja la amplitud del stop.",
  ],
  "ejercicios": [
   ["Spread 0,5 pips y objetivo de 4 pips. ¿Qué parte del objetivo es el spread?", "0,5 ÷ 4 = 12,5 %."],
   ["Riesgo de 100 USD con stop intradía de 5 USD/oz y swing de 25 USD/oz. ¿Tamaños?", "Intradía 20 oz; swing 4 oz."],
   ["¿Qué riesgo añade el swing frente al intradía?", "Gaps nocturnos y de fin de semana, y costo de financiación."],
  ],
  "glosario": [
   ["Scalping", "Scalping", "Operaciones de segundos o minutos."],
   ["Intradía", "Day trading", "Posiciones abiertas y cerradas el mismo día."],
   ["Swing", "Swing trading", "Posiciones de días a semanas."],
   ["Horizonte", "Holding period", "Tiempo que se mantiene la posición."],
  ],
  "resumen": [
   "Cada horizonte tiene su costo dominante.",
   "Elige según tu tiempo real.",
   "Stops más amplios, posiciones más pequeñas.",
  ],
 },
 "5.2-a": {
  "explicacion": [
   "Las estrategias se agrupan en familias según el comportamiento de mercado que aprovechan. <b>Tendencia y retrocesos</b>: entrar a favor de una dirección establecida tras una corrección. <b>Ruptura</b>: entrar cuando el precio sale de un rango con fuerza. <b>Reversión a la media</b>: apostar a que un exceso vuelve hacia un promedio.",
   "Cada familia necesita un <b>régimen</b> concreto. La tendencia funciona en mercados direccionales y sufre en rangos; la ruptura necesita expansión de volatilidad y sufre con falsos rompimientos; la reversión funciona en rangos y sufre cuando nace una tendencia fuerte.",
   "Antes de operar una idea, escribe en qué régimen esperas que funcione y cómo vas a detectar que el régimen cambió. Un filtro simple (pendiente de una media, ATR, amplitud del rango) puede ayudar.",
   "No existe una familia superior. Lo importante es que la regla sea coherente con el régimen y que sepas cómo falla.",
  ],
  "ejemplo": {
   "titulo": "Mismo activo, tres familias",
   "pasos": [
    "Tendencia: precio sobre media de 50 creciente; compra un retroceso a la media de 20; stop bajo el último mínimo.",
    "Ruptura: rango de 2.370–2.395 durante 3 días; compra con cierre sobre 2.397; stop dentro del rango.",
    "Reversión: precio 2 ATR por debajo de la media en un rango plano; compra con objetivo en la media.",
    "Falla típica: tendencia en rango (stops seguidos), ruptura falsa, reversión contra una tendencia que nace.",
   ],
   "conclusion": "La misma vela puede ser señal para una familia y trampa para otra.",
  },
  "errores": [
   "Usar reglas de reversión en mercados con tendencia fuerte.",
   "Mezclar familias sin saber cuál se está operando.",
   "No definir qué régimen necesita la estrategia.",
   "Cambiar de familia tras cada pérdida.",
  ],
  "checklist": [
   "Sé a qué familia pertenece mi idea.",
   "Escribí el régimen en que funciona.",
   "Sé cómo detectar que el régimen cambió.",
   "Conozco su forma típica de fallar.",
  ],
  "ejercicios": [
   ["Mercado lateral con media plana. ¿Qué familia encaja mejor?", "Reversión a la media."],
   ["Tras semanas de rango, el ATR se dispara y el precio cierra fuera. ¿Qué familia se activa?", "Ruptura."],
   ["¿Cómo suele fallar una estrategia de tendencia?", "En rangos: entradas repetidas que tocan el stop."],
  ],
  "glosario": [
   ["Seguimiento de tendencia", "Trend following", "Operar a favor de la dirección."],
   ["Ruptura", "Breakout", "Entrada al salir de un rango."],
   ["Reversión a la media", "Mean reversion", "Apuesta a la vuelta al promedio."],
   ["Régimen", "Market regime", "Comportamiento dominante del mercado."],
  ],
  "resumen": [
   "Cada familia necesita su régimen.",
   "Escribe cómo falla cada una.",
   "Un filtro de régimen evita operar fuera de contexto.",
  ],
 },
 "5.3-a": {
  "explicacion": [
   "Una idea se convierte en sistema cuando otra persona puede aplicarla y obtener las mismas operaciones. Para eso cada decisión debe estar escrita sin ambigüedad.",
   "Elementos mínimos: <b>universo</b> (qué operas), <b>horario</b>, <b>filtro</b> de contexto, <b>señal</b>, <b>entrada</b> (precio y tipo de orden), <b>invalidación</b> (stop), <b>salida</b> (objetivo, tiempo o regla), <b>tamaño</b>, condiciones de <b>abstención</b> y de <b>suspensión</b> del sistema.",
   "Evita palabras subjetivas como «fuerte», «cerca» o «parece». Sustitúyelas por números: «cierre sobre la media de 20», «a menos de 0,5 ATR», «después de las 08:00».",
   "Un plan de una página con estas reglas es la base del backtest del siguiente tema y del proyecto final.",
  ],
  "ejemplo": {
   "titulo": "De «comprar retrocesos en tendencia del oro» a reglas",
   "pasos": [
    "Universo: XAUUSD. Horario: 08:00–17:00 hora de Londres.",
    "Filtro: precio de 1 h sobre la media de 50, y media de 50 mayor que hace 10 velas.",
    "Señal: vela que toca la media de 20 y cierra por encima. Entrada: apertura de la vela siguiente.",
    "Stop: 0,2 ATR bajo el mínimo de la señal. Salida: 2R o cierre de sesión.",
    "Tamaño: 0,5 % del capital por operación. Abstención: 30 min antes y después de datos de alto impacto. Suspensión: 5 pérdidas seguidas o −6 % mensual.",
   ],
   "conclusion": "Cada regla es verificable con datos; no hace falta interpretar.",
  },
  "errores": [
   "Reglas con palabras vagas.",
   "Olvidar la salida o la gestión del tamaño.",
   "No definir cuándo no operar.",
   "Cambiar reglas durante la prueba.",
  ],
  "checklist": [
   "Universo, horario y filtro definidos.",
   "Señal, entrada, stop y salida sin ambigüedad.",
   "Tamaño por operación escrito.",
   "Condiciones de abstención y suspensión escritas.",
  ],
  "ejercicios": [
   ["Reescribe con números: «compro cuando el RSI está bajo».", "Por ejemplo: «compro cuando el RSI(14) de 1 h cierra por debajo de 30 y luego vuelve a cerrar por encima»."],
   ["¿Qué falta en: «compro rupturas del máximo diario con stop en el mínimo»?", "Universo, horario, filtro, salida, tamaño y condiciones de abstención."],
   ["Capital 10.000 USD, riesgo 0,5 %, stop 8 USD/oz. ¿Tamaño?", "50 USD ÷ 8 = 6,25 oz."],
  ],
  "glosario": [
   ["Regla de entrada", "Entry rule", "Condición exacta para abrir."],
   ["Regla de salida", "Exit rule", "Condición exacta para cerrar."],
   ["Filtro", "Filter", "Condición de contexto que habilita señales."],
   ["Plan de trading", "Trading plan", "Documento con todas las reglas."],
  ],
  "resumen": [
   "Si otro obtiene las mismas operaciones, tienes reglas.",
   "Sustituye palabras vagas por números.",
   "Incluye tamaño, abstención y suspensión.",
  ],
 },
}
