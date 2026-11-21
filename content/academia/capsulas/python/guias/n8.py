"""Guía de estudio ampliada · Nivel 8. Cifras ilustrativas."""
G = {
 "8.1-a": {
  "explicacion": [
   "El <b>libro de órdenes</b> muestra, para cada precio, el volumen dispuesto a comprar (bid) y a vender (ask). La cantidad disponible en los primeros niveles es la <b>profundidad</b> del mercado.",
   "Las órdenes <b>pasivas</b> (limit) añaden liquidez y esperan en el libro; las <b>agresivas</b> (market) la consumen. Una orden agresiva grande atraviesa varios niveles y su precio medio empeora: es el <b>impacto de mercado</b>.",
   "Las órdenes pasivas evitan el impacto pero pueden no ejecutarse, o ejecutarse justo cuando el precio va en tu contra (<b>selección adversa</b>): te llenan porque alguien mejor informado quiere salir.",
   "Antes de enviar una orden grande, compara su tamaño con la profundidad visible y considera dividirla en partes.",
  ],
  "ejemplo": {
   "titulo": "Compra a mercado de 8 lotes",
   "pasos": [
    "Ask: 2 lotes en 100,02; 3 en 100,03; 2 en 100,05; 4 en 100,08.",
    "Se llenan 2 a 100,02, 3 a 100,03, 2 a 100,05 y 1 a 100,08.",
    "Precio medio = (200,04 + 300,09 + 200,10 + 100,08) ÷ 8 = 800,31 ÷ 8 = <b>100,039</b>.",
    "Frente al mejor ask (100,02) pagas ≈ 0,019 por unidad de más: impacto de mercado.",
   ],
   "conclusion": "En mercados poco profundos, tu propia orden mueve el precio.",
  },
  "errores": [
   "Enviar órdenes grandes a mercado sin mirar la profundidad.",
   "Suponer que el precio del gráfico es el que obtendrás.",
   "Usar solo órdenes pasivas sin considerar la selección adversa.",
   "Ignorar el impacto en el backtest.",
  ],
  "checklist": [
   "Comparé mi tamaño con la profundidad.",
   "Elegí orden pasiva o agresiva según la urgencia.",
   "Consideré dividir la orden.",
   "Mi backtest incluye impacto y deslizamiento.",
  ],
  "ejercicios": [
   ["Ask: 1 lote en 50,00 y 2 lotes en 50,10. Compras 3 a mercado. ¿Precio medio?", "(50,00 + 2 × 50,10) ÷ 3 = 150,20 ÷ 3 = 50,067."],
   ["¿Qué tipo de orden añade liquidez?", "La orden límite (pasiva)."],
   ["¿Qué es la selección adversa?", "Ser ejecutado justo cuando el precio va a moverse en tu contra, frente a alguien mejor informado."],
  ],
  "glosario": [
   ["Libro de órdenes", "Order book", "Lista de órdenes por precio."],
   ["Profundidad", "Market depth", "Volumen disponible por niveles."],
   ["Impacto de mercado", "Market impact", "Movimiento del precio causado por tu orden."],
   ["Selección adversa", "Adverse selection", "Ejecutarse frente a quien sabe más."],
  ],
  "resumen": [
   "Las órdenes agresivas consumen liquidez.",
   "Más tamaño que profundidad = peor precio medio.",
   "Incluye el impacto en tus pruebas.",
  ],
 },
 "8.2-a": {
  "explicacion": [
   "En un sistema automatizado, cada <b>señal</b> debe tener un identificador único que se propaga a la <b>orden</b>, a cada <b>ejecución</b> y a la <b>posición</b>. Así se puede reconciliar qué pasó con cada decisión.",
   "Ese identificador hace la operación <b>idempotente</b>: si la misma señal llega dos veces (reintentos, reconexiones), el sistema la reconoce y no duplica la orden.",
   "La <b>reconciliación</b> compara periódicamente tu registro interno con lo que reporta el bróker: órdenes abiertas, posiciones y saldo. Cualquier diferencia se trata como incidente.",
   "Toda automatización necesita una <b>parada de emergencia</b> (kill switch): cancelar órdenes, cerrar o congelar posiciones y dejar de operar si algo no cuadra. Prueba todo en demo, incluidos los fallos.",
  ],
  "ejemplo": {
   "titulo": "Señal S-0412 y una reconexión",
   "pasos": [
    "Señal S-0412: comprar 1 lote. Se envía la orden O-0412 con el mismo identificador de cliente.",
    "Se pierde la conexión antes de recibir la confirmación y el sistema reintenta.",
    "El bróker rechaza el duplicado por identificador repetido; la posición sigue siendo de 1 lote.",
    "Al reconectar: registro interno = 1 lote; bróker = 1 lote → cuadra. Si el bróker mostrara 2, se activa la parada de emergencia.",
   ],
   "conclusion": "Identificadores y reconciliación convierten fallos de red en incidentes controlados.",
  },
  "errores": [
   "Reenviar órdenes tras un error sin comprobar si la primera se ejecutó.",
   "No versionar datos ni código de la estrategia.",
   "Carecer de parada de emergencia.",
   "Probar solo el caso feliz, sin fallos simulados.",
  ],
  "checklist": [
   "Cada señal tiene identificador único.",
   "Las órdenes son idempotentes.",
   "Reconcilio posiciones al reconectar y periódicamente.",
   "La parada de emergencia está probada en demo.",
  ],
  "ejercicios": [
   ["Registro interno: largo 2 lotes. Bróker: largo 3 lotes. ¿Qué haces?", "Tratarlo como incidente: detener nuevas órdenes, investigar y corregir antes de seguir."],
   ["¿Qué significa que una orden sea idempotente?", "Enviarla varias veces produce el mismo efecto que enviarla una vez."],
   ["Cita tres fallos que debes probar en demo.", "Señal duplicada, desconexión y rechazo de orden por el bróker."],
  ],
  "glosario": [
   ["Idempotencia", "Idempotency", "Repetir una acción no cambia el resultado."],
   ["Conciliación", "Reconciliation", "Comparar registros propios y del bróker."],
   ["Parada de emergencia", "Kill switch", "Detención inmediata del sistema."],
   ["Identificador de cliente", "Client order ID", "Identificador que tú asignas a la orden."],
  ],
  "resumen": [
   "Un identificador por señal, de principio a fin.",
   "Reconcilia siempre con el bróker.",
   "Sin parada de emergencia no hay automatización segura.",
  ],
 },
 "8.4-a": {
  "explicacion": [
   "Un historial de señales, copy trading, PAMM o cuentas de fondeo suele mostrar el <b>balance</b>, que solo cambia al cerrar operaciones. La <b>equity</b> incluye también las posiciones abiertas, y es la que revela el riesgo real.",
   "Estrategias que promedian en contra o usan <b>martingala</b> (aumentar tamaño tras pérdidas) producen balances muy suaves mientras mantienen pérdidas flotantes crecientes, hasta que una caída grande lo borra todo.",
   "Para evaluar un historial pide: curva de equity, drawdown máximo de equity, apalancamiento usado y sus cambios, tamaño de las posiciones, comisiones y reglas de pérdida, y si los resultados son de cuenta real auditada o de demo.",
   "Recuerda también que tu copia tendrá costos y deslizamientos propios: el resultado <b>replicable</b> suele ser peor que el publicado.",
  ],
  "ejemplo": {
   "titulo": "Balance suave frente a equity",
   "pasos": [
    "Balance publicado: de 10.000 a 11.300 USD en 6 meses, con un drawdown de balance del 1 %.",
    "Equity en el peor momento: 7.900 USD, es decir <b>−27 %</b> desde el máximo, con varias posiciones abiertas en pérdida.",
    "Comisiones de copia del 20 % sobre beneficios + deslizamiento estimado de 0,5 % mensual.",
    "Resultado replicable aproximado: 1.300 − 260 − 300 = <b>+740 USD</b> con el mismo riesgo de −27 %.",
   ],
   "conclusion": "Juzga un historial por su equity y su riesgo, no por la suavidad del balance.",
  },
  "errores": [
   "Evaluar solo la curva de balance.",
   "Confiar en historiales de pocas semanas.",
   "Ignorar cambios de apalancamiento o de reglas.",
   "No restar comisiones de copia y deslizamiento.",
  ],
  "checklist": [
   "Vi la curva de equity y su drawdown máximo.",
   "Conozco el apalancamiento y su evolución.",
   "El historial es largo y verificable.",
   "Calculé el resultado replicable tras costos.",
  ],
  "ejercicios": [
   ["Balance sin caídas y equity con −35 % en el peor momento. ¿Qué riesgo asumes al copiar?", "Una caída de equity de al menos −35 %, aunque el balance no la muestre."],
   ["Beneficio publicado 2.000 USD, comisión de copia 25 % y costos de 300 USD. ¿Replicable?", "2.000 − 500 − 300 = 1.200 USD."],
   ["¿Qué patrón sugiere martingala?", "Tamaño que aumenta tras pérdidas y pérdidas flotantes crecientes con balance suave."],
  ],
  "glosario": [
   ["Balance", "Balance", "Saldo con solo operaciones cerradas."],
   ["Equity", "Equity", "Saldo incluyendo posiciones abiertas."],
   ["Martingala", "Martingale", "Aumentar tamaño tras pérdidas."],
   ["Copy trading", "Copy trading", "Replicar automáticamente operaciones de otro."],
  ],
  "resumen": [
   "El balance oculta pérdidas abiertas.",
   "Pide equity, drawdown y apalancamiento.",
   "Lo replicable es menor que lo publicado.",
  ],
 },
}
