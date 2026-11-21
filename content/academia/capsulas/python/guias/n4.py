"""Guía de estudio ampliada · Nivel 4. Cifras ilustrativas."""
G = {
 "4.1-b": {
  "explicacion": [
   "Un stop-loss es una orden que se activa al tocar un nivel y se ejecuta al <b>primer precio disponible</b>. Si el mercado salta tu nivel sin cotizar en él (un <b>gap</b>), la ejecución llega más lejos y la pérdida supera lo planeado.",
   "Los gaps son frecuentes en la apertura semanal, tras festivos y alrededor de noticias importantes. En acciones también ocurren tras la publicación de resultados fuera de horario.",
   "Por eso el riesgo de una posición abierta durante un cierre de mercado no es solo la distancia al stop: hay que añadir un escenario de gap. Muchos traders reducen el tamaño o cierran antes del fin de semana.",
   "Existen stops garantizados en algunos brokers, con un costo adicional. Conocer esa opción y su precio forma parte de la gestión del riesgo.",
  ],
  "ejemplo": {
   "titulo": "Compra de 5 oz en 2.380 con stop en 2.370",
   "pasos": [
    "Riesgo planeado: 10 USD/oz × 5 = <b>50 USD</b> (1R).",
    "El viernes cierra en 2.377. El lunes abre en 2.360,5.",
    "El stop se ejecuta en 2.360,5: pérdida = 19,5 × 5 = <b>97,50 USD</b> ≈ 1,95R.",
    "Con tamaño reducido a 3 oz antes del cierre, la misma pérdida habría sido 58,50 USD.",
   ],
   "conclusion": "Un stop limita la pérdida en condiciones normales; no la garantiza ante un gap.",
  },
  "errores": [
   "Mantener tamaño completo durante el fin de semana sin evaluarlo.",
   "Calcular el riesgo máximo solo con la distancia al stop.",
   "Abrir posiciones justo antes de datos de alto impacto.",
   "Desconocer si el bróker ofrece stops garantizados.",
  ],
  "checklist": [
   "Sé si mi posición atraviesa un cierre de mercado.",
   "Estimé la pérdida con un gap razonable.",
   "Revisé el calendario de noticias.",
   "Decidí si reducir tamaño o cerrar antes del cierre.",
  ],
  "ejercicios": [
   ["Largo de 2 oz en 2.400 con stop 2.392. Abre en 2.381. ¿Pérdida y R?", "(2.400 − 2.381) × 2 = 38 USD. 1R = 16 USD → 2,4R."],
   ["Corto en 1.0900 con stop 1.0930 (1 lote estándar, 10 USD/pip). Abre en 1.0955. ¿Pérdida?", "55 pips × 10 = 550 USD (planeado 300 USD)."],
   ["Cita dos momentos en los que el riesgo de gap es mayor.", "Apertura semanal y alrededor de datos o resultados importantes."],
  ],
  "glosario": [
   ["Hueco", "Gap", "Salto de precio sin cotizaciones intermedias."],
   ["Stop garantizado", "Guaranteed stop", "Stop que se ejecuta al nivel exacto, con costo."],
   ["Unidad de riesgo", "R", "Pérdida planeada si llega el stop."],
   ["Riesgo de fin de semana", "Weekend risk", "Riesgo de mantener posiciones con el mercado cerrado."],
  ],
  "resumen": [
   "El stop se llena al primer precio disponible.",
   "Los gaps pueden convertir 1R en 2R o más.",
   "Reduce tamaño ante cierres y noticias.",
  ],
 },
 "4.2-a": {
  "explicacion": [
   "El <b>drawdown</b> es la caída del capital desde su último máximo. Se mide en cada momento; el <b>drawdown máximo</b> es la peor caída del período y describe cuánto dolor tuvo que aguantar la estrategia.",
   "La recuperación es asimétrica: para volver al máximo tras una caída L hace falta ganar L ÷ (1 − L). Perder un 10 % exige +11,1 %; un 25 % exige +33,3 %; un 50 % exige +100 %.",
   "Además del drawdown por cuenta, mide la <b>exposición acumulada</b>: varias posiciones correlacionadas (por ejemplo, oro largo y EUR/USD largo, ambos contra el dólar) pueden caer juntas y sumar una pérdida mayor de la que sugiere cada una por separado.",
   "Por eso se fijan límites: riesgo por operación, pérdida máxima diaria o por sesión y una pausa obligatoria tras alcanzar un drawdown definido.",
  ],
  "ejemplo": {
   "titulo": "Cuenta que pasa de 10.000 a 13.000 y cae a 9.750",
   "pasos": [
    "Máximo: 13.000 USD. Mínimo posterior: 9.750 USD.",
    "Drawdown = (9.750 − 13.000) ÷ 13.000 = <b>−25 %</b>.",
    "Para volver a 13.000 hace falta ganar 3.250 sobre 9.750 = <b>+33,3 %</b>.",
    "Con un límite de pausa en −10 % (11.700 USD), la cuenta habría parado mucho antes.",
   ],
   "conclusion": "Evitar drawdowns profundos es más fácil que recuperarlos.",
  },
  "errores": [
   "Medir el drawdown desde el capital inicial en vez de desde el máximo.",
   "Aumentar el tamaño para «recuperar rápido».",
   "Ignorar la correlación entre posiciones abiertas.",
   "No tener una regla de pausa tras una caída.",
  ],
  "checklist": [
   "Conozco el drawdown actual y el máximo histórico.",
   "Tengo límite de pérdida diaria y por operación.",
   "Revisé la exposición conjunta al dólar, oro o sector.",
   "Sé qué hago si llego al límite de drawdown.",
  ],
  "ejercicios": [
   ["Máximo 8.000, valor actual 6.800. ¿Drawdown?", "(6.800 − 8.000) ÷ 8.000 = −15 %."],
   ["¿Qué ganancia necesitas para recuperar un −20 %?", "0,20 ÷ 0,80 = +25 %."],
   ["Tienes oro largo y EUR/USD largo, 1 % de riesgo cada uno. ¿Por qué el riesgo conjunto puede acercarse al 2 %?", "Porque ambas posiciones suelen beneficiarse de un dólar débil y perder juntas si el dólar se fortalece."],
  ],
  "glosario": [
   ["Caída desde máximos", "Drawdown", "Pérdida desde el último máximo del capital."],
   ["Caída máxima", "Maximum drawdown", "Peor caída del período."],
   ["Correlación", "Correlation", "Grado en que dos activos se mueven juntos."],
   ["Exposición", "Exposure", "Cantidad de riesgo a un factor."],
  ],
  "resumen": [
   "El drawdown se mide desde el máximo.",
   "Recuperar cuesta más que caer.",
   "Limita la pérdida diaria y la exposición conjunta.",
  ],
 },
 "4.3-a": {
  "explicacion": [
   "La <b>esperanza matemática</b> por operación es: tasa de acierto × ganancia media − tasa de fallo × pérdida media. Medida en múltiplos de riesgo (R), permite comparar estrategias de distinto tamaño.",
   "Una tasa de acierto alta no garantiza nada si las ganancias son pequeñas y las pérdidas grandes. Una tasa baja puede ser rentable si las ganancias compensan sobradamente.",
   "Los <b>costos</b> se restan de cada operación y castigan sobre todo a las estrategias con esperanza pequeña. También hay que prepararse para las <b>rachas</b>: con un 40 % de acierto, diez pérdidas seguidas no son raras en cientos de operaciones.",
   "La esperanza debe estimarse con muchas operaciones, en neto y fuera de muestra; con 20 operaciones el resultado es casi ruido.",
  ],
  "ejemplo": {
   "titulo": "Dos estrategias en 100 operaciones",
   "pasos": [
    "A: 40 % de acierto, gana 3R, pierde 1R → 0,4 × 3 − 0,6 × 1 = <b>+0,6R</b> por operación.",
    "B: 70 % de acierto, gana 0,5R, pierde 1R → 0,7 × 0,5 − 0,3 × 1 = <b>+0,05R</b>.",
    "Con costo de 0,1R por operación: A = +0,5R, B = <b>−0,05R</b>.",
    "En 100 operaciones arriesgando 50 USD por R: A ≈ +2.500 USD; B ≈ −250 USD.",
   ],
   "conclusion": "La tasa de acierto sola no indica si una estrategia gana.",
  },
  "errores": [
   "Elegir estrategias por su porcentaje de acierto.",
   "Calcular la esperanza en bruto.",
   "Sacar conclusiones con muy pocas operaciones.",
   "Abandonar una estrategia válida por una racha esperable.",
  ],
  "checklist": [
   "Conozco acierto, ganancia media y pérdida media en R.",
   "La esperanza es positiva después de costos.",
   "Tengo suficientes operaciones para estimarla.",
   "Sé qué racha perdedora es normal para mi estrategia.",
  ],
  "ejercicios": [
   ["Acierto 50 %, gana 1,5R, pierde 1R. ¿Esperanza?", "0,5 × 1,5 − 0,5 × 1 = +0,25R."],
   ["Acierto 35 %, gana 2R, pierde 1R. ¿Esperanza?", "0,35 × 2 − 0,65 × 1 = +0,05R."],
   ["Con 0,1R de costo, ¿siguen siendo positivas?", "La primera sí (+0,15R); la segunda no (−0,05R)."],
  ],
  "glosario": [
   ["Esperanza matemática", "Expectancy", "Resultado medio esperado por operación."],
   ["Tasa de acierto", "Win rate", "Porcentaje de operaciones ganadoras."],
   ["Múltiplo de riesgo", "R-multiple", "Resultado expresado en unidades de riesgo."],
   ["Racha", "Streak", "Serie consecutiva de resultados iguales."],
  ],
  "resumen": [
   "Esperanza = acierto × ganancia − fallo × pérdida.",
   "Los costos pueden volver negativa una ventaja pequeña.",
   "Mide en neto y con muchas operaciones.",
  ],
 },
 "4.4-a": {
  "explicacion": [
   "Mover el stop más lejos cuando el precio se acerca es una de las conductas más dañinas. Convierte una pérdida pequeña y planeada en otra mayor y no planeada, y rompe el cálculo de tamaño que hiciste al entrar.",
   "El impulso nace de la aversión a realizar pérdidas: preferimos «esperar a que se dé la vuelta». Otros sesgos frecuentes son el FOMO (entrar tarde por miedo a perderse el movimiento), la sobreoperación y las operaciones de venganza para recuperar.",
   "La defensa es procedimental: decidir antes de entrar, escribir las reglas y revisar el diario. Una regla simple: el stop solo se mueve a favor de la operación (para proteger beneficio), nunca para ampliar la pérdida.",
   "Si sientes la necesidad de mover el stop, haz una pausa y pregúntate si la idea original sigue siendo válida. Si no lo es, sal; si lo es, el stop ya estaba donde debía.",
  ],
  "ejemplo": {
   "titulo": "Entrada en 100, stop en 98, tamaño para arriesgar 200 USD",
   "pasos": [
    "Tamaño: 200 ÷ 2 = 100 unidades. 1R = 200 USD.",
    "Mueves el stop a 96: riesgo ahora 4 × 100 = 400 USD (2R).",
    "Lo mueves a 94 y sale ahí: pérdida 6 × 100 = <b>600 USD = 3R</b>.",
    "Tres operaciones así equivalen a nueve pérdidas planeadas.",
   ],
   "conclusion": "Una sola decisión impulsiva puede borrar varias operaciones bien gestionadas.",
  },
  "errores": [
   "Ampliar el stop «para darle espacio».",
   "Quitar el stop porque «ya va a rebotar».",
   "Aumentar tamaño para recuperar una pérdida.",
   "No registrar en el diario las decisiones impulsivas.",
  ],
  "checklist": [
   "El stop se decidió antes de entrar.",
   "Solo lo muevo a favor de la operación.",
   "Hago una pausa tras dos pérdidas seguidas.",
   "Registro en el diario cada cambio y su motivo.",
  ],
  "ejercicios": [
   ["Riesgo planeado 1R = 150 USD. Mueves el stop y pierdes 450 USD. ¿Cuántos R?", "450 ÷ 150 = 3R."],
   ["¿Cuándo es aceptable mover un stop?", "A favor de la operación, para reducir riesgo o proteger beneficio."],
   ["Nombra dos sesgos que llevan a sobreoperar.", "FOMO y operar para recuperar pérdidas (venganza)."],
  ],
  "glosario": [
   ["Miedo a quedarse fuera", "FOMO", "Impulso a entrar tarde en un movimiento."],
   ["Sobreoperación", "Overtrading", "Operar más de lo que el plan permite."],
   ["Operación de venganza", "Revenge trading", "Operar para recuperar una pérdida."],
   ["Diario de trading", "Trading journal", "Registro de decisiones y resultados."],
  ],
  "resumen": [
   "El stop solo se mueve a favor.",
   "Decide antes de entrar, no durante.",
   "El diario revela tus sesgos.",
  ],
 },
}
