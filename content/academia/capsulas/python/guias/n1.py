"""Guía de estudio ampliada · Nivel 1. Cifras ilustrativas; no son condiciones reales de ningún producto."""
G = {
 "1.2-a": {
  "explicacion": [
   "Cuando alguien dice «voy a operar oro» puede estar hablando de cosas muy distintas. El <b>subyacente</b> es el activo cuyo precio estudias: la onza de oro, el S&P 500 o el bitcoin. El <b>instrumento</b> es el contrato concreto que compras o vendes: un ETF que custodia oro físico, un CFD que liquida diferencias con tu bróker o un futuro estandarizado de una bolsa.",
   "La <b>referencia</b> es el precio que el instrumento intenta seguir. En el oro suele ser el precio spot XAUUSD, en dólares por onza. Un índice como el S&P 500 es solo un cálculo, una media ponderada de unas 500 empresas: nadie compra «el índice», sino productos que lo replican.",
   "Cada instrumento añade sus propias reglas: horario, tamaño mínimo, costos (spread, comisión, financiación, comisión anual), margen, vencimiento y contraparte. Por eso dos personas que «operan oro» pueden obtener resultados distintos ante el mismo movimiento del precio.",
   "Antes de abrir cualquier posición responde tres preguntas: qué subyacente quiero exponer, con qué instrumento lo hago y de dónde saldrán mis ganancias, pérdidas y costos.",
  ],
  "ejemplo": {
   "titulo": "El oro sube un 1 % en un mes (de 2.380 a 2.403,80 USD/oz)",
   "pasos": [
    "ETF de oro físico con 2.380 USD invertidos: sube ≈ 1 % menos la comisión anual prorrateada (0,25 % ÷ 12 ≈ 0,02 % = 0,48 USD). Ganancia ≈ 23,80 − 0,48 = <b>23,32 USD</b>.",
    "CFD de 1 onza sobre XAUUSD: bruto 23,80 USD; menos spread 0,30 USD y 30 días de financiación a 0,15 USD/día (4,50 USD). Neto = <b>19,00 USD</b>.",
    "Futuro micro de 10 onzas: nocional 23.800 USD, diez veces mayor. El mismo 1 % son <b>238 USD</b> (antes de comisiones), con solo una fracción depositada como margen.",
   ],
   "conclusion": "Mismo subyacente, tres resultados: cambian el tamaño y los costos del instrumento, no el movimiento del oro.",
  },
  "errores": [
   "Confundir el precio del gráfico con el precio al que realmente operas (bid/ask de tu instrumento).",
   "Comparar resultados de instrumentos con distinto nocional.",
   "Olvidar costos que solo existen en un instrumento: financiación, comisión anual, rollover.",
   "Creer que se puede comprar un índice directamente.",
  ],
  "checklist": [
   "Sé qué subyacente quiero exponer y por qué.",
   "Conozco el instrumento, su contraparte y su horario.",
   "Calculé el nocional de mi posición.",
   "Sé cuánto cuesta mantenerla un día, una semana y un mes.",
   "Sé si tiene margen, vencimiento o riesgo de cierre forzado.",
  ],
  "ejercicios": [
   ["Clasifica: (a) S&P 500, (b) un futuro del S&P 500, (c) el precio spot XAUUSD, (d) un ETF de oro.",
    "(a) Índice: un cálculo de referencia. (b) Instrumento derivado. (c) Referencia del oro. (d) Instrumento que replica el oro."],
   ["Un CFD de 1 onza gana 15 USD brutos en 10 días. Spread 0,30 USD y financiación 0,15 USD/día. ¿Resultado neto?",
    "15 − 0,30 − (10 × 0,15) = 15 − 0,30 − 1,50 = 13,20 USD."],
   ["¿Por qué el mismo 1 % da 23,80 USD en un CFD de 1 oz y 238 USD en un futuro de 10 oz?",
    "Porque el futuro tiene diez veces más nocional (10 × 2.380 = 23.800 USD). El porcentaje es el mismo; el tamaño no."],
  ],
  "glosario": [
   ["Subyacente", "Underlying", "Activo cuyo precio sigue un instrumento."],
   ["Instrumento", "Instrument", "Contrato o valor que realmente se negocia."],
   ["Nocional", "Notional", "Valor total de la exposición."],
   ["Contraparte", "Counterparty", "Quien está al otro lado del contrato."],
   ["Índice", "Index", "Cálculo que resume el precio de un grupo de activos."],
  ],
  "resumen": [
   "Analizas un subyacente, pero operas un instrumento.",
   "Cada instrumento tiene tamaño, costos, horario y riesgos propios.",
   "Compara siempre en neto y con el mismo nocional.",
  ],
 },
 "1.3-a": {
  "explicacion": [
   "Toda cotización tiene dos precios. El <b>bid</b> es lo máximo que alguien paga ahora mismo: es tu precio si vendes. El <b>ask</b> es lo mínimo que alguien acepta: es tu precio si compras. La diferencia es el <b>spread</b>.",
   "El spread es el primer costo de cualquier operación y se paga al entrar: si compras al ask y el precio no se mueve, tu posición vale el bid, así que empiezas perdiendo el spread. En operaciones de muy corto plazo puede ser el costo dominante.",
   "El spread refleja la liquidez. En XAUUSD durante la superposición Londres–Nueva York suele ser estrecho; en la apertura asiática, festivos o durante un dato macro importante puede multiplicarse. Muchos brokers muestran un spread «desde», no el que tendrás en cada momento.",
   "El gráfico de la mayoría de plataformas se dibuja con el bid. Por eso una orden de compra (que se ejecuta al ask) puede activarse aunque la vela del gráfico no haya tocado tu precio.",
  ],
  "ejemplo": {
   "titulo": "Costo del spread en una compra de 50 onzas de XAUUSD",
   "pasos": [
    "Cotización: bid 2.384,20 / ask 2.384,50. Spread = 0,30 USD por onza.",
    "Compras 50 oz al ask: pagas 50 × 2.384,50 = 119.225 USD de nocional.",
    "Si cierras al instante al bid: 50 × 2.384,20 = 119.210 USD. Pérdida = <b>15 USD</b> (50 × 0,30).",
    "Con un dato macro el spread se abre a 2,00 USD: la misma entrada y salida costaría <b>100 USD</b>.",
   ],
   "conclusion": "El precio debe moverse a tu favor al menos el spread antes de que la operación empiece a ganar.",
  },
  "errores": [
   "Calcular el resultado con el precio medio o el último precio en lugar de bid/ask.",
   "Operar justo en la publicación de datos sin mirar el spread del momento.",
   "Poner stops muy cerca del precio cuando el spread puede ampliarse y activarlos.",
   "Comparar brokers solo por el spread mínimo anunciado.",
  ],
  "checklist": [
   "Miré el bid y el ask reales antes de entrar.",
   "Sé cuántas veces el spread representa mi objetivo.",
   "Revisé si hay noticias o cambio de sesión cerca.",
   "Mi stop está lejos de la zona que el spread podría tocar.",
  ],
  "ejercicios": [
   ["Bid 1,0850 / ask 1,0851 en EUR/USD. ¿Cuántos pips de spread hay?", "1,0851 − 1,0850 = 0,0001 = 1 pip."],
   ["Compras 20 oz de oro con spread 0,40 USD. ¿Cuánto pierdes si cierras de inmediato?", "20 × 0,40 = 8 USD."],
   ["Tu objetivo es 1,50 USD por onza y el spread 0,50 USD. ¿Qué porcentaje del objetivo se lleva el spread?", "0,50 ÷ 1,50 = 33 %."],
  ],
  "glosario": [
   ["Precio de compra del mercado", "Bid", "Precio al que puedes vender."],
   ["Precio de venta del mercado", "Ask / Offer", "Precio al que puedes comprar."],
   ["Diferencial", "Spread", "Diferencia entre ask y bid."],
   ["Liquidez", "Liquidity", "Facilidad para operar sin mover el precio."],
  ],
  "resumen": [
   "Compras al ask, vendes al bid.",
   "El spread es un costo inmediato que cambia con la liquidez.",
   "Revisa el spread real antes de entrar, sobre todo con noticias.",
  ],
 },
 "1.4-a": {
  "explicacion": [
   "Una posición <b>larga</b> compra primero y vende después: gana si el precio sube. Una posición <b>corta</b> vende primero y recompra después: gana si el precio baja. En CFD y futuros abrir un corto es tan sencillo como abrir un largo; en acciones al contado requiere pedir prestado el título.",
   "El resultado bruto es (precio de salida − precio de entrada) × tamaño para un largo, y lo contrario para un corto. Mientras la posición está abierta el resultado es <b>flotante</b>: cambia con cada tick. Al cerrar se convierte en <b>realizado</b>.",
   "El resultado <b>neto</b> resta los costos: spread, comisiones, financiación y, en su caso, conversión de divisa. Un corto en un activo que paga financiación positiva al largo puede tener costo diario adicional.",
   "Un corto tiene una asimetría importante: el precio puede subir sin límite teórico, así que su pérdida potencial no está acotada si no usas stop.",
  ],
  "ejemplo": {
   "titulo": "10 onzas de oro, entrada en 2.380 y salida en 2.390",
   "pasos": [
    "Largo: (2.390 − 2.380) × 10 = <b>+100 USD</b> brutos.",
    "Corto: (2.380 − 2.390) × 10 = <b>−100 USD</b> brutos.",
    "Costos de cada uno: spread 0,30 × 10 = 3 USD y comisión 3 USD = 6 USD.",
    "Neto: largo +100 − 6 = <b>+94 USD</b>; corto −100 − 6 = <b>−106 USD</b>.",
   ],
   "conclusion": "Los costos se restan siempre, ganes o pierdas: empeoran la pérdida del corto y reducen la ganancia del largo.",
  },
  "errores": [
   "Contar el resultado flotante como dinero ganado.",
   "Olvidar que los costos se pagan también en las operaciones perdedoras.",
   "Abrir cortos sin stop sobre un activo que puede subir con fuerza.",
   "Confundir «vender» para cerrar un largo con abrir un corto nuevo.",
  ],
  "checklist": [
   "Sé si estoy largo o corto y qué movimiento me favorece.",
   "Calculé el resultado bruto y el neto esperado.",
   "Tengo un stop definido, sobre todo si estoy corto.",
   "Sé si mantener la posición tiene costo diario.",
  ],
  "ejercicios": [
   ["Corto de 5 oz en 2.400; recompras en 2.385. Costos totales 4 USD. ¿Neto?", "(2.400 − 2.385) × 5 = 75 USD brutos; 75 − 4 = 71 USD."],
   ["Largo de 2 oz en 2.380 con el precio ahora en 2.371. ¿Resultado flotante?", "(2.371 − 2.380) × 2 = −18 USD, aún no realizado."],
   ["¿Por qué la pérdida máxima de un corto sin stop no está limitada?", "Porque el precio puede subir sin un techo teórico y cada subida aumenta la pérdida."],
  ],
  "glosario": [
   ["Posición larga", "Long", "Compra que gana si el precio sube."],
   ["Posición corta", "Short", "Venta que gana si el precio baja."],
   ["Resultado flotante", "Unrealized P&L", "Resultado de una posición todavía abierta."],
   ["Resultado realizado", "Realized P&L", "Resultado fijado al cerrar."],
  ],
  "resumen": [
   "El largo gana con subidas; el corto, con bajadas.",
   "Flotante no es realizado.",
   "El neto descuenta costos en todas las operaciones.",
  ],
 },
 "1.4-b": {
  "explicacion": [
   "Tu <b>capital</b> es el dinero que tienes en la cuenta. El <b>nocional</b> es el tamaño real de la posición. El <b>apalancamiento</b> es la relación entre ambos: con 1:20, cada dólar de capital controla 20 dólares de nocional.",
   "Las ganancias y pérdidas se calculan sobre el nocional, no sobre el capital. Por eso el apalancamiento multiplica los porcentajes: un 1 % sobre un nocional 20 veces mayor que tu capital equivale a un 20 % de tu capital.",
   "El <b>margen</b> es la parte del capital que el bróker bloquea para sostener la posición. Si las pérdidas reducen el capital por debajo del margen exigido, el bróker puede cerrar posiciones (cierre por margen o stop-out) antes de que llegues a cero.",
   "La pregunta correcta no es «cuánto apalancamiento me dan», sino «cuánto pierdo si el precio llega a mi stop». El riesgo real se mide en dinero, sobre el nocional.",
  ],
  "ejemplo": {
   "titulo": "1.000 USD de capital con apalancamiento 1:20 en oro a 2.000 USD/oz",
   "pasos": [
    "Nocional máximo: 1.000 × 20 = 20.000 USD, es decir, 10 onzas.",
    "Si el oro sube 1 % (20 USD/oz): 10 × 20 = <b>+200 USD</b> = +20 % del capital.",
    "Si baja 1 %: <b>−200 USD</b> = −20 % del capital.",
    "Una caída del 5 % (100 USD/oz) supondría −1.000 USD: el capital entero. El cierre por margen llegaría antes.",
    "Con solo 2 onzas (nocional 4.000 USD, apalancamiento efectivo 1:4) la misma caída del 5 % costaría 200 USD, un 20 %.",
   ],
   "conclusion": "El apalancamiento disponible no obliga a usarlo: el tamaño lo decides tú a partir del riesgo aceptable.",
  },
  "errores": [
   "Usar todo el apalancamiento disponible por defecto.",
   "Calcular el riesgo sobre el margen depositado en lugar del nocional.",
   "No saber a qué nivel de margen el bróker cierra posiciones.",
   "Sumar posiciones correlacionadas sin ver el nocional total.",
  ],
  "checklist": [
   "Conozco el nocional exacto de mi posición.",
   "Sé cuánto pierdo, en dinero, si llega mi stop.",
   "Conozco el nivel de cierre por margen de mi cuenta.",
   "Mi apalancamiento efectivo es una decisión, no el máximo disponible.",
  ],
  "ejercicios": [
   ["Capital 2.000 USD, nocional 30.000 USD. ¿Apalancamiento efectivo?", "30.000 ÷ 2.000 = 15, es decir, 1:15."],
   ["Con ese nocional, ¿cuánto pierdes si el precio cae 2 %? ¿Qué % del capital es?", "30.000 × 2 % = 600 USD; 600 ÷ 2.000 = 30 % del capital."],
   ["Quieres arriesgar como máximo 100 USD con un stop a 2 % de distancia. ¿Nocional máximo?", "100 ÷ 2 % = 5.000 USD."],
  ],
  "glosario": [
   ["Apalancamiento", "Leverage", "Relación entre nocional y capital."],
   ["Margen", "Margin", "Capital bloqueado para sostener la posición."],
   ["Cierre por margen", "Stop-out / margin call", "Cierre forzado cuando el capital no cubre el margen."],
   ["Capital", "Equity", "Valor de la cuenta incluyendo resultados flotantes."],
  ],
  "resumen": [
   "Las pérdidas se calculan sobre el nocional.",
   "El apalancamiento multiplica en las dos direcciones.",
   "Dimensiona desde el riesgo en dinero, no desde el apalancamiento máximo.",
  ],
 },
}
