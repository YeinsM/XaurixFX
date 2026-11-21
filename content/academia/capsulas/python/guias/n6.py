"""Guía de estudio ampliada · Nivel 6 (especializaciones). Cifras ilustrativas; consulta siempre la ficha oficial."""
G = {
 "6.1-a": {
  "explicacion": [
   "Un <b>ETF</b> es un fondo que cotiza en bolsa e intenta replicar un índice. Puede hacerlo con réplica física (compra los componentes), muestreo (compra una parte representativa) o sintética (mediante derivados).",
   "La <b>diferencia de seguimiento</b> (tracking difference) es la brecha acumulada entre el rendimiento del fondo y el del índice en un período. Suele ser negativa por la comisión anual (TER) y los costos de replicar, y puede compensarse en parte con préstamo de valores.",
   "El <b>tracking error</b> mide la volatilidad de esa diferencia: qué tan regular es el seguimiento. Un fondo puede tener poca diferencia acumulada pero un seguimiento irregular, o al revés.",
   "Al comparar fondos revisa también el spread de compraventa del ETF, su liquidez, la concentración del índice y si reinvierte o reparte dividendos.",
  ],
  "ejemplo": {
   "titulo": "Índice y ETF en un año",
   "pasos": [
    "Índice: de 100 a 110 → <b>+10,00 %</b>.",
    "ETF con TER de 0,20 % y otros costos de 0,05 %: de 100 a 109,75 → +9,75 %.",
    "Diferencia de seguimiento ≈ <b>−0,25 puntos</b>.",
    "Si las diferencias mensuales oscilan entre −0,05 % y +0,03 %, su desviación estándar anualizada es el tracking error.",
   ],
   "conclusion": "Diferencia de seguimiento = cuánto quedaste atrás; tracking error = cuánto osciló esa brecha.",
  },
  "errores": [
   "Comparar ETF solo por la comisión anual.",
   "Comparar fondo e índice en períodos distintos.",
   "Ignorar si el índice incluye dividendos o no.",
   "Olvidar el spread de compraventa del propio ETF.",
  ],
  "checklist": [
   "Sé qué índice replica y con qué método.",
   "Comparé fondo e índice en el mismo período.",
   "Revisé TER, spread y liquidez del ETF.",
   "Conozco la concentración del índice.",
  ],
  "ejercicios": [
   ["Índice +8 %, ETF +7,6 %. ¿Diferencia de seguimiento?", "−0,4 puntos porcentuales."],
   ["Dos ETF: A con diferencia −0,3 y tracking error 0,1; B con −0,2 y 0,6. ¿Qué indica cada uno?", "A queda algo más atrás pero sigue de forma regular; B queda menos atrás pero de forma irregular."],
   ["¿Qué método de réplica usa derivados?", "La réplica sintética."],
  ],
  "glosario": [
   ["Fondo cotizado", "ETF", "Fondo que cotiza en bolsa."],
   ["Diferencia de seguimiento", "Tracking difference", "Brecha acumulada entre fondo e índice."],
   ["Error de seguimiento", "Tracking error", "Volatilidad de esa brecha."],
   ["Gastos corrientes", "TER / expense ratio", "Comisión anual del fondo."],
  ],
  "resumen": [
   "El ETF replica, pero no iguala, al índice.",
   "Diferencia y tracking error miden cosas distintas.",
   "Compara en el mismo período y con todos los costos.",
  ],
 },
 "6.2-a": {
  "explicacion": [
   "En un índice <b>ponderado por capitalización</b> (como el S&P 500), cada empresa pesa según su valor de mercado. En uno <b>ponderado por precio</b> (como el Dow Jones), pesan más las acciones de precio alto.",
   "La <b>contribución</b> de un componente al movimiento del índice es su peso multiplicado por su variación. Unas pocas empresas grandes pueden explicar la mayor parte del día.",
   "La <b>amplitud</b> (breadth) mide cuántos componentes acompañan el movimiento: proporción de valores que suben, nuevos máximos frente a nuevos mínimos. Un índice que sube con amplitud débil depende de pocos nombres.",
   "Los <b>rebalanceos</b> periódicos ajustan pesos y miembros, y pueden generar flujos de compra y venta en fechas conocidas.",
  ],
  "ejemplo": {
   "titulo": "Índice de cinco componentes",
   "pasos": [
    "Pesos: A 30 %, B 25 %, C 20 %, D 15 %, E 10 %.",
    "Variaciones: A +3 %, B −1 %, C −1 %, D −2 %, E −1 %.",
    "Contribuciones: +0,90; −0,25; −0,20; −0,30; −0,10 (puntos porcentuales).",
    "Índice: +0,90 − 0,85 = <b>+0,05 %</b>, con 4 de 5 componentes en negativo.",
   ],
   "conclusion": "El índice puede subir aunque la mayoría de sus empresas baje.",
  },
  "errores": [
   "Interpretar una subida del índice como fortaleza general del mercado.",
   "Confundir índices ponderados por precio y por capitalización.",
   "Ignorar fechas de rebalanceo.",
   "No mirar la concentración en los mayores componentes.",
  ],
  "checklist": [
   "Sé cómo se pondera el índice.",
   "Revisé qué componentes explican el movimiento.",
   "Miré indicadores de amplitud.",
   "Conozco el calendario de rebalanceos.",
  ],
  "ejercicios": [
   ["Peso 6 % y variación +5 %. ¿Contribución?", "0,06 × 5 % = +0,30 puntos porcentuales."],
   ["Índice +1 %; las 5 mayores (40 % del peso) suben 3 %. ¿Cuánto aportan?", "0,40 × 3 % = +1,2 puntos: más que todo el índice; el resto restó 0,2."],
   ["¿Qué indica que solo el 35 % de los componentes suba en un día alcista?", "Amplitud débil: el movimiento depende de pocos nombres."],
  ],
  "glosario": [
   ["Capitalización", "Market capitalization", "Valor de mercado de una empresa."],
   ["Contribución", "Contribution", "Peso × variación de un componente."],
   ["Amplitud", "Market breadth", "Proporción de componentes que acompañan el movimiento."],
   ["Rebalanceo", "Rebalancing", "Ajuste periódico de pesos y miembros."],
  ],
  "resumen": [
   "Contribución = peso × variación.",
   "Pocos componentes pueden mover todo el índice.",
   "Mira la amplitud, no solo el índice.",
  ],
 },
 "6.3-a": {
  "explicacion": [
   "En un par de divisas como EUR/USD, el euro es la <b>divisa base</b> y el dólar la <b>cotizada</b>: el precio indica cuántos dólares cuesta un euro. Comprar el par es comprar euros y vender dólares.",
   "Un <b>pip</b> es la cuarta cifra decimal en la mayoría de pares (0,0001) y la segunda en pares con yen (0,01). Muchos brokers muestran una quinta cifra: el <i>pipette</i>.",
   "El tamaño se mide en <b>lotes</b>: estándar 100.000 unidades de la base, mini 10.000 y micro 1.000. El valor del pip en la divisa cotizada es tamaño × 0,0001.",
   "Si tu cuenta está en otra moneda, convierte el valor del pip al tipo de cambio del momento. Por ejemplo, en USD/JPY el pip vale en yenes y se convierte a dólares dividiendo por el precio.",
  ],
  "ejemplo": {
   "titulo": "EUR/USD de 1,0850 a 1,0880",
   "pasos": [
    "Movimiento: 1,0880 − 1,0850 = 0,0030 = <b>30 pips</b>.",
    "Lote estándar: 100.000 × 0,0001 = 10 USD/pip → 30 × 10 = <b>300 USD</b>.",
    "Minilote: 1 USD/pip → 30 USD. Microlote: 0,10 USD/pip → 3 USD.",
    "USD/JPY en 150,00, 1 lote: pip = 100.000 × 0,01 = 1.000 JPY ≈ 1.000 ÷ 150 = <b>6,67 USD</b>.",
   ],
   "conclusion": "El pip mide el movimiento; el lote decide cuánto dinero vale.",
  },
  "errores": [
   "Confundir pip con pipette (quinta cifra).",
   "Usar 10 USD/pip para pares que no cotizan en dólares.",
   "Calcular el lote sin partir del riesgo en dinero.",
   "Olvidar la conversión si la cuenta no está en USD.",
  ],
  "checklist": [
   "Sé cuál es la base y cuál la cotizada.",
   "Calculé el valor del pip para mi tamaño.",
   "Convertí a la moneda de mi cuenta.",
   "El lote sale del riesgo aceptable y la distancia al stop.",
  ],
  "ejercicios": [
   ["GBP/USD de 1,2700 a 1,2655. ¿Pips?", "−45 pips."],
   ["Riesgo 200 USD y stop de 25 pips en EUR/USD. ¿Lotes?", "200 ÷ 25 = 8 USD/pip = 0,8 lotes estándar."],
   ["USD/JPY 145,00, 0,5 lotes, movimiento de 40 pips. ¿Resultado en USD?", "Pip = 50.000 × 0,01 = 500 JPY; 40 × 500 = 20.000 JPY ≈ 20.000 ÷ 145 ≈ 137,93 USD."],
  ],
  "glosario": [
   ["Divisa base", "Base currency", "Primera divisa del par."],
   ["Divisa cotizada", "Quote currency", "Segunda divisa; en ella se expresa el precio."],
   ["Pip", "Pip", "Unidad mínima habitual de variación."],
   ["Lote", "Lot", "Tamaño estándar de una operación."],
  ],
  "resumen": [
   "Pip = 0,0001 (0,01 en pares con yen).",
   "Valor del pip = tamaño × pip.",
   "Convierte a la moneda de la cuenta.",
  ],
 },
 "6.4-a": {
  "explicacion": [
   "Al contado (<b>spot</b>) compras la criptomoneda: si cae, tienes una pérdida flotante, pero sigues teniendo el activo. Con un <b>perpetuo</b> (futuro sin vencimiento) solo depositas margen y tu posición puede ser <b>liquidada</b>.",
   "El perpetuo sigue al spot gracias al <b>funding</b>: pagos periódicos entre largos y cortos. Si el perpetuo cotiza por encima del spot, normalmente los largos pagan a los cortos.",
   "La liquidación se calcula con el <b>precio de marca</b> (una media de varias fuentes) y el margen de mantenimiento. Con margen aislado solo arriesgas el margen de esa posición; con margen cruzado, todo el saldo de la cuenta puede respaldarla.",
   "Con apalancamiento 10×, una caída de alrededor del 10 % agota el margen; la liquidación llega algo antes por el margen de mantenimiento y las comisiones.",
  ],
  "ejemplo": {
   "titulo": "1 BTC a 60.000 USD: contado frente a perpetuo 10×",
   "pasos": [
    "Contado: pagas 60.000 USD. Si BTC cae a 52.000, pérdida flotante de 8.000 USD (−13,3 %) y conservas el BTC.",
    "Perpetuo 10× con margen aislado: aportas 6.000 USD.",
    "Liquidación aproximada con mantenimiento del 0,5 %: 60.000 × (1 − 0,10 + 0,005) = <b>54.300 USD</b>.",
    "A 52.000 la posición ya fue liquidada: pérdida = <b>6.000 USD</b>, el 100 % del margen.",
   ],
   "conclusion": "El mismo movimiento deja una pérdida flotante al contado y una pérdida total del margen en el perpetuo.",
  },
  "errores": [
   "Usar margen cruzado sin entender que arriesga toda la cuenta.",
   "Ignorar el costo acumulado del funding.",
   "Calcular la liquidación con el último precio en vez del precio de marca.",
   "Dejar las claves de la cripto al contado en un exchange sin evaluar la custodia.",
  ],
  "checklist": [
   "Conozco mi precio de liquidación.",
   "Sé si uso margen aislado o cruzado.",
   "Revisé la tasa de funding y su frecuencia.",
   "Sé quién custodia mis activos al contado.",
  ],
  "ejercicios": [
   ["Largo 5× en 40.000 USD. ¿Caída aproximada que agota el margen?", "Alrededor del 20 % (1 ÷ 5), hasta unos 32.000 USD, antes de mantenimiento y comisiones."],
   ["Funding de 0,01 % cada 8 horas sobre 60.000 USD de nocional. ¿Costo diario aproximado?", "0,0001 × 60.000 × 3 = 18 USD al día."],
   ["¿Por qué el contado no se liquida?", "Porque se paga el activo completo; no hay préstamo ni margen que agotar."],
  ],
  "glosario": [
   ["Contado", "Spot", "Compra del activo con pago completo."],
   ["Perpetuo", "Perpetual swap", "Futuro sin vencimiento."],
   ["Tasa de financiación", "Funding rate", "Pago periódico entre largos y cortos."],
   ["Liquidación", "Liquidation", "Cierre forzado al agotarse el margen."],
  ],
  "resumen": [
   "Al contado no hay liquidación; en el perpetuo sí.",
   "El funding es un costo o ingreso periódico.",
   "Conoce tu precio de liquidación antes de entrar.",
  ],
 },
 "6.5-a": {
  "explicacion": [
   "Un futuro es un contrato estandarizado. Su <b>ficha</b> indica el tamaño (por ejemplo 100 onzas), el <b>tick</b> mínimo (0,10 USD) y el valor del tick (0,10 × 100 = 10 USD). Las versiones micro reducen el tamaño, por ejemplo a 10 onzas.",
   "El <b>nocional</b> es precio × tamaño. El resultado monetario de un movimiento es número de ticks × valor del tick × contratos.",
   "La cámara de compensación liquida las posiciones cada día al <b>precio de liquidación</b>: las ganancias y pérdidas se abonan o cargan diariamente (mark-to-market), no solo al cerrar.",
   "Hay un <b>margen inicial</b> para abrir y un <b>margen de mantenimiento</b>: si el saldo cae por debajo, hay que reponer hasta el inicial o la posición se cierra.",
  ],
  "ejemplo": {
   "titulo": "1 contrato estándar de oro (100 oz), margen inicial 10.000 y mantenimiento 9.500 USD",
   "pasos": [
    "Movimiento de 2.380 a 2.395 = 15 USD = 150 ticks → 150 × 10 = <b>+1.500 USD</b> (micro: +150 USD).",
    "Día 2: liquida en 2.386 (+6) → +600 USD; saldo 10.600.",
    "Día 3: liquida en 2.377 (−9) → −900 USD; saldo 9.700.",
    "Día 4: liquida en 2.371 (−6) → −600 USD; saldo <b>9.100</b>, bajo el mantenimiento: debes reponer 900 USD hasta 10.000 o cerrar.",
   ],
   "conclusion": "Las pérdidas se pagan cada día; sin liquidez para reponer margen, la posición se cierra.",
  },
  "errores": [
   "Calcular el resultado sin el valor del tick.",
   "Pensar que las pérdidas solo cuentan al cerrar.",
   "No tener liquidez para un requerimiento de margen.",
   "Confundir contratos estándar y micro.",
  ],
  "checklist": [
   "Leí la ficha: tamaño, tick y valor del tick.",
   "Calculé el nocional y el resultado por tick.",
   "Conozco el margen inicial y de mantenimiento.",
   "Tengo liquidez para reponer margen.",
  ],
  "ejercicios": [
   ["Tick 0,25 puntos que vale 12,50 USD. El precio sube 10 puntos con 2 contratos. ¿Resultado?", "10 ÷ 0,25 = 40 ticks; 40 × 12,50 × 2 = 1.000 USD."],
   ["Micro de oro (10 oz) de 2.400 a 2.388. ¿Resultado?", "−12 × 10 = −120 USD."],
   ["Saldo 8.800 con mantenimiento 9.500 e inicial 10.000. ¿Cuánto reponer?", "1.200 USD, hasta volver al inicial."],
  ],
  "glosario": [
   ["Tick", "Tick", "Variación mínima del precio."],
   ["Multiplicador", "Contract multiplier", "Unidades del subyacente por contrato."],
   ["Liquidación diaria", "Daily settlement / mark-to-market", "Abono o cargo diario de resultados."],
   ["Margen de mantenimiento", "Maintenance margin", "Saldo mínimo para mantener la posición."],
  ],
  "resumen": [
   "Resultado = ticks × valor del tick × contratos.",
   "Las ganancias y pérdidas se liquidan cada día.",
   "Bajo mantenimiento, repones o se cierra.",
  ],
 },
 "6.6-a": {
  "explicacion": [
   "La <b>curva de futuros</b> muestra los precios de distintos vencimientos de un mismo subyacente. En <b>contango</b>, los vencimientos lejanos cotizan más caros (costos de almacenamiento y financiación); en <b>backwardation</b>, más baratos (escasez inmediata o alta demanda presente).",
   "Quien mantiene exposición con futuros debe hacer <b>rollover</b>: vender el contrato que vence y comprar el siguiente. En contango cada renovación compra más caro, lo que resta rendimiento aunque el spot no se mueva; en backwardation ocurre lo contrario.",
   "Por eso los fondos que siguen futuros (por ejemplo de petróleo) pueden alejarse mucho del precio spot a largo plazo.",
   "En materias primas también influyen inventarios, oferta, demanda, clima, estacionalidad, el dólar y los tipos de interés.",
  ],
  "ejemplo": {
   "titulo": "Petróleo con spot estable en 70 USD",
   "pasos": [
    "Contango: 1M en 70,55 y 2M en 71,10. Rollover mensual cuesta ≈ 0,55 USD (≈ 0,8 %).",
    "En 12 meses de curva similar, la pérdida por rollover rondaría el <b>9–10 %</b>, con el spot sin cambios.",
    "Backwardation: 1M en 73,55 y 2M en 73,10. Cada renovación compra 0,45 USD más barato: rendimiento de rollover positivo.",
    "Un fondo de futuros en contango persistente puede caer aunque el petróleo spot termine el año igual.",
   ],
   "conclusion": "La forma de la curva es parte del resultado de cualquier exposición con futuros.",
  },
  "errores": [
   "Comparar un fondo de futuros directamente con el precio spot.",
   "Ignorar el costo de rollover en contango.",
   "Olvidar la fecha de vencimiento y la entrega física.",
   "Asumir que la curva no cambiará de forma.",
  ],
  "checklist": [
   "Revisé la forma de la curva.",
   "Sé cuándo y cómo se hace el rollover.",
   "Entiendo cómo sigue mi producto al subyacente.",
   "Conozco los factores de oferta y demanda clave.",
  ],
  "ejercicios": [
   ["1M en 80,00 y 2M en 80,80. ¿Contango o backwardation? ¿Costo del rollover?", "Contango; 0,80 USD (1 %) por renovación."],
   ["¿Por qué un ETF de petróleo puede bajar si el spot no se mueve?", "Por el costo acumulado de renovar contratos en contango."],
   ["¿Qué suele indicar una curva en backwardation?", "Escasez o demanda inmediata alta."],
  ],
  "glosario": [
   ["Curva de futuros", "Futures curve", "Precios por vencimiento."],
   ["Contango", "Contango", "Lejanos más caros que cercanos."],
   ["Backwardation", "Backwardation", "Lejanos más baratos que cercanos."],
   ["Renovación", "Rollover", "Cambio al siguiente vencimiento."],
  ],
  "resumen": [
   "Contango encarece el rollover; backwardation lo favorece.",
   "Fondos de futuros pueden alejarse del spot.",
   "Revisa la curva antes de elegir el instrumento.",
  ],
 },
 "6.7-a": {
  "explicacion": [
   "Una <b>call</b> da el derecho, no la obligación, de comprar el subyacente al <b>precio de ejercicio</b> (strike) hasta o en el vencimiento. Una <b>put</b> da el derecho a vender. El comprador paga una <b>prima</b>.",
   "Al vencimiento, una call comprada gana si el precio supera strike + prima; una put comprada gana si cae por debajo de strike − prima. La pérdida máxima del comprador es la prima pagada.",
   "Antes del vencimiento, la prima combina <b>valor intrínseco</b> (lo que valdría ejercer ahora) y <b>valor temporal</b>, que depende del tiempo restante y de la volatilidad implícita. Las griegas (delta, gamma, theta, vega) miden esas sensibilidades.",
   "Vender opciones invierte el perfil: ingresas la prima pero asumes pérdidas potencialmente grandes. No es un punto de partida para principiantes.",
  ],
  "ejemplo": {
   "titulo": "Call y put con strike 100 (contrato de 100 unidades)",
   "pasos": [
    "Call comprada, prima 5: equilibrio en <b>105</b>. Si al vencer el precio es 115: (115 − 100 − 5) × 100 = +1.000 USD. Si es 95: −500 USD (la prima).",
    "Put comprada, prima 4: equilibrio en <b>96</b>. Si al vencer es 88: (100 − 88 − 4) × 100 = +800 USD. Si es 104: −400 USD.",
    "Valor intrínseco de la call con el precio en 103 antes de vencer: 3. Si la prima está en 4,50, el valor temporal es 1,50.",
   ],
   "conclusion": "El comprador conoce su pérdida máxima; la ganancia depende del movimiento y del tiempo.",
  },
  "errores": [
   "Comprar opciones sin calcular el punto de equilibrio.",
   "Olvidar que el valor temporal se pierde cada día (theta).",
   "Vender opciones sin entender la pérdida potencial.",
   "Confundir derecho (comprador) con obligación (vendedor).",
  ],
  "checklist": [
   "Sé si compro o vendo y qué derecho u obligación implica.",
   "Calculé el punto de equilibrio.",
   "Conozco la pérdida máxima.",
   "Entiendo el efecto del tiempo y la volatilidad.",
  ],
  "ejercicios": [
   ["Call strike 50, prima 2. ¿Equilibrio y resultado por unidad si vence en 56?", "Equilibrio 52; resultado 56 − 50 − 2 = +4."],
   ["Put strike 200, prima 6. ¿Resultado por unidad si vence en 210?", "−6, la prima."],
   ["Precio 48, call strike 45 con prima 4,20. ¿Valor intrínseco y temporal?", "Intrínseco 3; temporal 1,20."],
  ],
  "glosario": [
   ["Opción de compra", "Call option", "Derecho a comprar al strike."],
   ["Opción de venta", "Put option", "Derecho a vender al strike."],
   ["Precio de ejercicio", "Strike price", "Precio pactado de la opción."],
   ["Prima", "Premium", "Precio pagado por la opción."],
  ],
  "resumen": [
   "Comprar opciones limita la pérdida a la prima.",
   "Equilibrio = strike ± prima.",
   "El tiempo y la volatilidad cambian su valor.",
  ],
 },
 "6.8-a": {
  "explicacion": [
   "El precio de un bono es el valor presente de sus flujos futuros (cupones y principal) descontados al <b>rendimiento</b> que exige el mercado. Si el rendimiento exigido sube, esos flujos valen menos hoy y el precio baja.",
   "Cuando el rendimiento coincide con el cupón, el bono cotiza a la par (100). Si el mercado exige más que el cupón, cotiza bajo la par; si exige menos, sobre la par.",
   "La <b>duración</b> mide la sensibilidad del precio a cambios de rendimiento: con duración 8, una subida de 1 punto reduce el precio alrededor de un 8 %. A mayor plazo y menor cupón, mayor duración.",
   "La <b>convexidad</b> describe la curvatura: el precio sube más con una bajada de tipos de lo que baja con una subida igual. La <b>curva de rendimientos</b> compara plazos y su forma (normal, plana, invertida) informa sobre expectativas.",
  ],
  "ejemplo": {
   "titulo": "Bono a 10 años, cupón 4 %, nominal 100",
   "pasos": [
    "Rendimiento 4 %: precio <b>100,0</b>.",
    "Rendimiento 5 %: precio ≈ <b>92,3</b> (−7,7 %).",
    "Rendimiento 3 %: precio ≈ <b>108,5</b> (+8,5 %).",
    "La misma variación de 1 punto da +8,5 % al bajar y −7,7 % al subir: convexidad. Duración aproximada ≈ 8,1.",
   ],
   "conclusion": "Precio y rendimiento se mueven en sentido contrario, y no de forma simétrica.",
  },
  "errores": [
   "Pensar que un bono no puede perder valor antes del vencimiento.",
   "Ignorar la duración al comparar fondos de bonos.",
   "Confundir cupón con rendimiento.",
   "Olvidar el riesgo de crédito del emisor.",
  ],
  "checklist": [
   "Sé el cupón, plazo y rendimiento del bono.",
   "Conozco la duración de mi posición o fondo.",
   "Evalué el riesgo de crédito.",
   "Revisé la forma de la curva de rendimientos.",
  ],
  "ejercicios": [
   ["Duración 6 y el rendimiento sube 0,5 puntos. ¿Cambio aproximado del precio?", "−6 × 0,5 = −3 %."],
   ["Cupón 3 % y rendimiento de mercado 4 %. ¿Sobre o bajo la par?", "Bajo la par (menos de 100)."],
   ["Dos fondos, duración 2 y 9. ¿Cuál sufre más si suben los tipos?", "El de duración 9."],
  ],
  "glosario": [
   ["Cupón", "Coupon", "Interés periódico del bono."],
   ["Rendimiento", "Yield", "Rentabilidad exigida por el mercado."],
   ["Duración", "Duration", "Sensibilidad del precio a los tipos."],
   ["Convexidad", "Convexity", "Curvatura de la relación precio–rendimiento."],
  ],
  "resumen": [
   "Sube el rendimiento, baja el precio.",
   "La duración mide la sensibilidad.",
   "La convexidad hace la relación asimétrica.",
  ],
 },
}
