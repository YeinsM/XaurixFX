"""Manual del nivel 6 · Especializaciones por mercado. Cifras ilustrativas; consulta siempre la ficha oficial."""


def T(tema, titulo, explicacion, ejemplo, errores, checklist, ejercicios, glosario=()):
    return {"tema": tema, "titulo": titulo, "capsula": None, "explicacion": explicacion, "ejemplo": ejemplo,
            "errores": errores, "checklist": checklist, "ejercicios": ejercicios, "glosario": list(glosario)}


def C(tema, titulo, capsula, profundizacion):
    return {"tema": tema, "titulo": titulo, "capsula": capsula, "profundizacion": profundizacion}


def E(titulo, pasos, conclusion):
    return {"titulo": titulo, "pasos": pasos, "conclusion": conclusion}


M = {
 "intro": [
  "Los niveles anteriores dieron una base común. Este nivel la aplica a ocho mercados con mecánicas distintas: acciones y ETFs, índices, forex y CFD, criptoactivos, futuros, materias primas, opciones y renta fija.",
  "En cada especialización estudiarás qué se negocia, qué mueve el precio, cómo se calcula el resultado, qué costos y riesgos propios tiene y qué decisiones operativas exige. El caso conductor es el oro: lo verás como CFD, como futuro y como ETF.",
  "No necesitas dominar los ocho mercados para empezar. La ruta recomendada es cursar al menos una especialización a fondo antes del nivel 7, y elegir instrumentos con margen o derivados solo después de dominar dimensionamiento y riesgo.",
 ],
 "objetivos": [
  "Leer la ficha de cualquier instrumento y calcular nocional, valor del punto y resultado.",
  "Identificar los factores que mueven el precio en cada mercado.",
  "Comparar la misma exposición a través de distintos instrumentos.",
  "Reconocer riesgos específicos: gaps por resultados, margen, liquidación, vencimiento, volatilidad y tipos.",
 ],
 "temas": [
  # 6.1 Acciones y ETFs
  T("6.1.1", "Qué mirar antes de resultados", [
    "Las empresas cotizadas publican <b>resultados</b> trimestrales: ingresos, márgenes, beneficio por acción (BPA) y, a menudo, previsiones (guidance). El precio reacciona a la diferencia entre lo publicado y lo que el mercado esperaba (consenso), no al número en sí.",
    "Métricas básicas: <b>crecimiento de ingresos</b>, <b>margen bruto y operativo</b>, <b>flujo de caja libre</b>, <b>deuda neta</b> y su relación con el EBITDA, y valoración relativa como el <b>PER</b> (precio ÷ beneficio por acción).",
    "Compara siempre con el sector: un PER de 30 puede ser normal en tecnología de alto crecimiento y caro en una empresa de servicios públicos. Las cifras aisladas dicen poco.",
    "Los resultados suelen publicarse fuera del horario regular, lo que provoca <b>gaps</b> en la apertura. Mantener una posición durante la publicación es asumir ese salto.",
   ],
   E("Lectura de un trimestre", [
    "Consenso de BPA: 1,20 USD. Publicado: 1,32 USD → sorpresa de +10 %.",
    "Ingresos +8 % interanual frente a +11 % esperado; previsión del próximo trimestre rebajada.",
    "Precio 100 USD y BPA de los últimos 12 meses 4,50 → PER ≈ 22,2.",
    "Reacción posible: caída pese a superar el BPA, porque los ingresos y la previsión decepcionan.",
   ], "La reacción depende de las expectativas y de la previsión, no solo del beneficio."),
   ["Mirar solo el BPA e ignorar ingresos y previsiones.", "Comparar el PER entre sectores distintos.", "Mantener tamaño completo durante resultados sin evaluar el gap."],
   ["Conozco la fecha de resultados.", "Revisé consenso de BPA e ingresos.", "Comparé la valoración con el sector.", "Decidí el tamaño ante un posible gap."],
   [["Precio 60, BPA 12 meses 3. ¿PER?", "60 ÷ 3 = 20."], ["Consenso 2,00 y publicado 1,90. ¿Sorpresa?", "−5 %."]],
   [["Beneficio por acción", "Earnings per share (EPS)", "Beneficio dividido entre acciones."], ["Previsión", "Guidance", "Expectativa que da la empresa."]]),
  T("6.1.2", "Splits, dividendos y posiciones cortas", [
    "Un <b>split</b> divide cada acción en varias (por ejemplo 4 por 1): el precio baja en la misma proporción y el valor de tu posición no cambia. Los gráficos usan <b>precios ajustados</b> para que el histórico sea comparable.",
    "El día de <b>ex-dividendo</b> el precio suele bajar aproximadamente el importe del dividendo. Quien está largo en ese momento cobra el dividendo; quien está corto lo paga. En CFD sobre acciones esto aparece como un ajuste en la cuenta.",
    "Vender en corto acciones al contado exige que el bróker te preste el título. Puede haber <b>costo de préstamo</b> (alto en acciones muy demandadas para corto) y riesgo de recompra forzosa si el prestamista lo reclama.",
    "Las sesiones de <b>pre-mercado y post-mercado</b> tienen menos liquidez y spreads más amplios; los movimientos ahí pueden no sostenerse en la sesión regular.",
   ],
   E("Split y dividendo", [
    "Tienes 50 acciones a 400 USD = 20.000 USD. Split 4×1 → 200 acciones a 100 USD = 20.000 USD.",
    "Dividendo de 0,80 USD por acción con 200 acciones → +160 USD para el largo (antes de impuestos).",
    "Si estuvieras corto de 200 acciones, pagarías 160 USD en la fecha ex-dividendo.",
   ], "Splits no crean valor; dividendos se cobran o se pagan según el lado."),
   ["Interpretar la caída por split como pérdida.", "Olvidar que el corto paga dividendos.", "Operar pre-mercado como si tuviera la liquidez de la sesión regular."],
   ["Uso precios ajustados en el análisis.", "Conozco fechas ex-dividendo.", "Sé el costo de préstamo si voy corto."],
   [["Split 2×1 sobre 30 acciones a 150. ¿Nueva posición?", "60 acciones a 75: 4.500 USD, igual que antes."], ["Corto de 100 acciones y dividendo de 0,50. ¿Impacto?", "−50 USD."]],
   [["División de acciones", "Stock split", "Aumenta el número de acciones y reduce el precio."], ["Fecha ex-dividendo", "Ex-dividend date", "Desde ella se compra sin derecho al dividendo."]]),
  C("6.1.3", "Qué sigue un ETF y cuánto se desvía", "6.1-a", [
   "<b>Concentración.</b> Revisa el peso de los 10 mayores componentes del índice. Un ETF «diversificado» puede tener más de un tercio en pocas empresas, y su comportamiento dependerá de ellas.",
   "<b>ETF de oro.</b> Los fondos físicos custodian lingotes y siguen el spot menos la comisión; los sintéticos usan derivados y añaden riesgo de contraparte. Compara su diferencia de seguimiento con el precio de referencia del oro (por ejemplo, el fixing de Londres).",
   "<b>Liquidez del ETF.</b> El volumen del ETF importa menos que la liquidez de lo que contiene; aun así, en ETFs pequeños el spread de compraventa puede ser significativo. Opera en horario de mercado de los componentes para un spread más estrecho.",
  ]),
  # 6.2 Índices
  C("6.2.1", "Cómo se mueve un índice ponderado", "6.2-a", [
   "<b>S&P 500, Nasdaq-100 y Dow.</b> Los dos primeros ponderan por capitalización ajustada por free float; el Dow pondera por precio. El Nasdaq-100 excluye financieras y está muy concentrado en tecnología; el Dow tiene solo 30 componentes.",
   "<b>Puntos frente a porcentaje.</b> Un índice de 5.000 puntos que sube 50 puntos sube un 1 %. Compara siempre en porcentaje entre índices con niveles distintos.",
  ]),
  T("6.2.2", "Amplitud, concentración y rebalanceo", [
    "Medidas de amplitud: porcentaje de componentes sobre su media de 50 o 200 sesiones, línea de avances y descensos, y nuevos máximos frente a nuevos mínimos.",
    "Una <b>divergencia</b> aparece cuando el índice marca máximos mientras la amplitud empeora: el movimiento descansa en menos empresas y es más vulnerable a problemas de esas pocas.",
    "Los índices se <b>rebalancean</b> en fechas conocidas (por ejemplo trimestralmente). Los fondos que los replican deben comprar las altas y vender las bajas, lo que puede producir volumen y movimientos al cierre de esas fechas.",
    "Una alta concentración no es buena ni mala por sí misma, pero cambia el riesgo: el índice se parece más a una apuesta sobre pocos nombres.",
   ],
   E("Divergencia de amplitud", [
    "El índice sube de 4.900 a 5.050 en un mes (+3,1 %).",
    "El porcentaje de componentes sobre su media de 50 pasa de 68 % a 49 %.",
    "Los 7 mayores valores explican más del 80 % de la subida.",
   ], "Subida con amplitud decreciente: riesgo concentrado."),
   ["Leer el índice como si representara a todas sus empresas.", "Ignorar fechas de rebalanceo.", "Tratar una divergencia como señal de venta automática."],
   ["Revisé al menos un indicador de amplitud.", "Conozco el peso de los mayores componentes.", "Tengo el calendario de rebalanceos."],
   [["Índice en máximos y solo 40 % de componentes sobre su media de 200. ¿Qué indica?", "Amplitud débil: la subida depende de pocos valores."], ["¿Por qué puede haber volumen alto al cierre de un día de rebalanceo?", "Porque los fondos indexados ajustan sus carteras a la nueva composición."]],
   [["Divergencia", "Divergence", "El precio y un indicador se mueven en sentido contrario."]]),
  T("6.2.3", "Dos maneras de exponerse a un índice", [
    "Un <b>ETF</b> del índice se compra como una acción: sin vencimiento, con comisión anual pequeña, en horario bursátil y con tamaño flexible.",
    "Un <b>futuro</b> del índice tiene multiplicador (por ejemplo 50 USD por punto en el contrato E-mini del S&P 500 y 5 USD en el micro), cotiza casi 24 horas, requiere margen y vence trimestralmente, lo que obliga a renovar.",
    "El futuro incorpora el costo de financiación y descuenta los dividendos esperados, por lo que su precio difiere del índice al contado (base).",
    "Los <b>CFD</b> sobre índices permiten tamaños pequeños con margen, pero cobran financiación diaria. Las <b>opciones</b> sobre índices permiten coberturas con pérdida limitada.",
   ],
   E("Misma exposición: S&P 500 en 5.000 puntos", [
    "Objetivo: exposición de unos 25.000 USD.",
    "ETF: unas 50 participaciones si cotiza a ~500 USD (25.000 USD).",
    "Micro E-mini: 5.000 × 5 = 25.000 USD por contrato → 1 contrato, con margen de solo una fracción.",
    "Caída del 2 %: ambos pierden ≈ 500 USD; en el futuro se liquida cada día y se exige margen.",
   ], "El resultado económico es parecido; cambian costos, horario, margen y vencimiento."),
   ["Comparar ETF y futuro sin igualar el nocional.", "Olvidar el vencimiento trimestral del futuro.", "Ignorar la financiación diaria del CFD en posiciones largas."],
   ["Igualé el nocional entre instrumentos.", "Conozco multiplicador y vencimiento del futuro.", "Comparé costos totales para mi horizonte."],
   [["E-mini a 5.200 con multiplicador 50. ¿Nocional?", "5.200 × 50 = 260.000 USD."], ["Nocional deseado 52.000 USD con el micro (×5) a 5.200. ¿Contratos?", "52.000 ÷ 26.000 = 2."]],
   [["Base", "Basis", "Diferencia entre futuro y contado."], ["Multiplicador", "Multiplier", "Valor monetario de un punto."]]),
  # 6.3 Forex y CFD
  C("6.3.1", "Divisa base, cotizada, pip y lote", "6.3-a", [
   "<b>Cruces.</b> Un par sin USD (por ejemplo EUR/GBP) cotiza en la segunda divisa: su pip vale en libras y se convierte a la moneda de la cuenta al tipo vigente.",
   "<b>Oro como divisa.</b> En XAUUSD el «pip» suele expresarse en 0,01 o 0,10 USD según el bróker; lo seguro es calcular en dólares por onza × onzas.",
  ]),
  T("6.3.2", "Forex: sesiones, tasas y calendario", [
    "El mercado de divisas opera 24 horas de lunes a viernes en tres grandes sesiones: Asia (Tokio, Sídney), Europa (Londres) y América (Nueva York). La mayor liquidez se da en la superposición Londres–Nueva York.",
    "A largo plazo, los <b>diferenciales de tasas</b> entre bancos centrales influyen en los flujos: una divisa con tipos más altos atrae capital. Las expectativas sobre los próximos movimientos de tipos suelen mover más que el nivel actual.",
    "Los datos más influyentes: decisiones y discursos de bancos centrales, inflación (IPC), empleo (en EE. UU. las nóminas no agrícolas), PIB y PMIs. Revisa el calendario cada semana.",
    "El <b>swap</b> diario de una posición refleja aproximadamente el diferencial de tasas: estar largo en la divisa de tipo alto puede cobrar swap; estar corto, pagarlo. Los miércoles suele aplicarse un swap triple por el fin de semana.",
   ],
   E("Swap de una posición en un par de alto diferencial", [
    "Largo de 1 lote en un par donde la base rinde 5 % y la cotizada 1 %.",
    "Diferencial ≈ 4 % anual sobre 100.000 → ≈ 4.000 al año ≈ 11 por día, antes del margen del bróker.",
    "El bróker aplica su margen: el swap neto podría ser, por ejemplo, +8 al día para el largo y −14 para el corto.",
   ], "El swap depende del diferencial de tasas y de las condiciones del bróker."),
   ["Operar justo en la publicación sin plan.", "Ignorar el swap triple del miércoles.", "Suponer que un diferencial alto garantiza una apreciación."],
   ["Revisé el calendario de la semana.", "Conozco las sesiones de mayor liquidez.", "Revisé el swap largo y corto."],
   [["¿En qué franja suele haber mayor liquidez en EUR/USD?", "En la superposición Londres–Nueva York."], ["Swap −6 USD/día durante 9 días con un miércoles triple incluido. ¿Costo?", "Equivale a 11 días: −66 USD."]],
   [["Diferencial de tasas", "Interest rate differential", "Diferencia de tipos entre dos divisas."], ["Nóminas no agrícolas", "Non-farm payrolls (NFP)", "Dato de empleo de EE. UU."]]),
  T("6.3.3", "CFD: margen, contraparte y financiación", [
    "Un <b>CFD</b> es un contrato con el bróker para intercambiar la diferencia de precio de un activo. No posees el subyacente; tu <b>contraparte</b> es el bróker, por lo que su solvencia, regulación y la segregación de fondos importan.",
    "Se abre con <b>margen</b>: un porcentaje del nocional (por ejemplo 5 % para 1:20). El <b>nivel de margen</b> = capital ÷ margen usado; si cae por debajo del umbral (stop-out), el bróker cierra posiciones.",
    "Mantener un CFD de un día para otro cobra <b>financiación</b> sobre el nocional (tipo de referencia ± margen del bróker). Para posiciones largas en el tiempo, este costo puede superar el de un ETF o un futuro.",
    "Muchos reguladores exigen protección de saldo negativo para clientes minoristas; compruébalo, porque determina si un gap puede dejarte en deuda.",
   ],
   E("CFD de oro: 10 oz a 2.400 USD, apalancamiento 1:20", [
    "Nocional = 24.000 USD; margen = 5 % = 1.200 USD.",
    "Capital 3.000 USD → nivel de margen = 3.000 ÷ 1.200 = 250 %.",
    "Stop-out al 50 %: se cierra cuando el capital baja a 600 USD, es decir tras perder 2.400 USD (≈ 240 USD/oz).",
    "Financiación al 7 % anual: 24.000 × 7 % ÷ 365 ≈ 4,60 USD por noche.",
   ], "Margen, nivel de margen y financiación definen cuánto aguanta y cuánto cuesta un CFD."),
   ["Confundir margen con riesgo.", "Mantener CFD meses sin calcular la financiación.", "No verificar regulación ni protección de saldo negativo."],
   ["Conozco nivel de margen y stop-out.", "Calculé la financiación diaria.", "Verifiqué la regulación del bróker."],
   [["Nocional 50.000 con margen 5 %. ¿Margen requerido?", "2.500 USD."], ["Capital 5.000 y margen usado 2.500. ¿Nivel de margen?", "200 %."]],
   [["Contrato por diferencias", "Contract for difference (CFD)", "Derivado que liquida diferencias de precio."], ["Nivel de margen", "Margin level", "Capital ÷ margen usado."]]),
  # 6.4 Cripto
  T("6.4.1", "Cripto spot y custodia", [
    "Bitcoin (BTC) tiene una oferta máxima programada; Ether (ETH) es la moneda de la red Ethereum, usada para pagar transacciones y contratos. Las <b>altcoins</b> son el resto; las <b>stablecoins</b> buscan mantener paridad con una divisa (por ejemplo USDT o USDC con el dólar).",
    "Puedes operar en <b>exchanges centralizados</b> (custodian por ti, con riesgo de contraparte) o en <b>descentralizados</b> (operas desde tu propia cartera mediante contratos inteligentes, con riesgos técnicos).",
    "La <b>autocustodia</b> significa que tú controlas las claves privadas: «sin claves, no son tus monedas». También significa que si pierdes la frase semilla, nadie puede recuperar los fondos.",
    "Al enviar fondos, verifica la <b>red</b> correcta (por ejemplo USDT en ERC-20 frente a TRC-20): enviar por una red incompatible puede hacer perder los fondos. Considera también emisiones y desbloqueos de tokens, que añaden oferta.",
   ],
   E("Costo de comprar y retirar", [
    "Compras 0,05 BTC a 60.000 USD = 3.000 USD con comisión de 0,1 % → 3 USD.",
    "Retiro a tu cartera con comisión de red equivalente a 5 USD.",
    "Costo total ≈ 8 USD (0,27 %) antes del spread.",
   ], "La custodia propia elimina el riesgo del exchange, pero añade responsabilidad técnica."),
   ["Guardar la frase semilla en una foto o en la nube.", "Enviar por la red equivocada.", "Tratar todas las stablecoins como igual de seguras."],
   ["Sé quién custodia mis activos.", "Guardé la frase semilla fuera de línea.", "Verifiqué red y dirección antes de enviar."],
   [["¿Qué riesgo tiene dejar fondos en un exchange centralizado?", "Riesgo de contraparte: quiebra, bloqueo o hackeo del exchange."], ["Compra de 2.000 USD con 0,1 % y retiro de 4 USD. ¿Costo total?", "2 + 4 = 6 USD."]],
   [["Frase semilla", "Seed phrase", "Palabras que permiten recuperar una cartera."], ["Autocustodia", "Self-custody", "Control propio de las claves."]]),
  C("6.4.2", "Perpetuos, funding y liquidación", "6.4-a", [
   "<b>Margen aislado frente a cruzado.</b> En aislado, cada posición tiene su margen y solo ese se pierde al liquidarse. En cruzado, todo el saldo disponible respalda las posiciones: tarda más en liquidarse, pero puede perder toda la cuenta.",
   "<b>Funding extremo.</b> En fases de euforia el funding de los largos puede superar el 0,1 % cada 8 horas (más del 100 % anualizado): mantener largos apalancados se vuelve muy caro.",
  ]),
  T("6.4.3", "Mismo movimiento, distinto resultado", [
    "Con el mismo nocional, un movimiento adverso produce la misma pérdida en dinero al contado y en un perpetuo. La diferencia está en el <b>capital asignado</b>: al contado arriesgas el nocional completo; en el perpetuo solo el margen, pero puedes perderlo entero.",
    "Por eso el porcentaje de pérdida sobre el capital asignado es muy distinto, y en el perpetuo existe un punto (liquidación) en el que la pérdida se materializa aunque luego el precio se recupere.",
    "Los costos también difieren: al contado pagas comisión al comprar y vender; en el perpetuo pagas o cobras funding mientras estés dentro.",
    "La conclusión práctica es dimensionar el perpetuo para que la liquidación quede lejos de cualquier movimiento plausible, o no usar apalancamiento.",
   ],
   E("Caída del 15 % de BTC con 30.000 USD de nocional", [
    "Contado: pérdida 4.500 USD sobre 30.000 asignados (−15 %), conservas el BTC.",
    "Perpetuo 3× (margen 10.000): pérdida 4.500 sobre 10.000 (−45 %); liquidación lejos (≈ −33 % del precio).",
    "Perpetuo 10× (margen 3.000): liquidado antes del −10 %: pérdida 3.000 USD (−100 % del margen).",
   ], "A más apalancamiento, menos movimiento hace falta para perderlo todo."),
   ["Medir el riesgo como porcentaje del margen sin mirar el nocional.", "Elegir el apalancamiento antes que el tamaño.", "Olvidar el funding acumulado."],
   ["Calculé pérdida en dinero para un movimiento adverso.", "Mi liquidación está lejos de un movimiento plausible.", "Comparé costos de contado y perpetuo para mi horizonte."],
   [["Nocional 20.000 en perpetuo 4×. ¿Margen y caída aproximada que lo agota?", "Margen 5.000; caída ≈ 25 %."], ["La misma caída del 25 % al contado con 20.000 USD. ¿Pérdida?", "5.000 USD, pero conservas el activo."]]),
  # 6.5 Futuros
  C("6.5.1", "Puntos, ticks y multiplicador", "6.5-a", [
   "<b>Estándar, mini y micro.</b> En el oro (COMEX), el contrato estándar es de 100 oz, el mini de 50 oz en algunos mercados y el micro de 10 oz. En el S&P 500, E-mini ×50 y micro ×5. Elegir el tamaño adecuado es la primera herramienta de gestión de riesgo.",
   "<b>Horario y liquidez.</b> Los futuros cotizan casi 24 horas, con pausas diarias; la liquidez se concentra en el contrato más cercano (front month) hasta días antes de su vencimiento.",
  ]),
  T("6.5.2", "Qué pasa al vencer un futuro", [
    "Cada futuro tiene un <b>último día de negociación</b>. Después se liquida: en efectivo (índices) o con <b>entrega física</b> (muchas materias primas, como el oro o el petróleo).",
    "Los especuladores no quieren recibir ni entregar mercancía, por eso hacen <b>rollover</b> antes: cierran el contrato cercano y abren el siguiente. La liquidez migra al siguiente vencimiento unos días antes.",
    "En contratos con entrega existe el <b>primer día de aviso</b> (first notice day): a partir de ahí, quien siga largo puede recibir avisos de entrega. Los brokers minoristas suelen cerrar posiciones antes de esa fecha.",
    "Para analizar históricos se usan <b>series continuas</b> que empalman vencimientos; el método de ajuste (por diferencia o por ratio) cambia los niveles pasados.",
   ],
   E("Rollover de un futuro de oro", [
    "Largo de 1 contrato de diciembre en 2.400. A finales de noviembre: diciembre 2.405, febrero 2.418.",
    "Vendes diciembre en 2.405 (+5 × 100 = +500 USD) y compras febrero en 2.418.",
    "Mantienes la exposición; el diferencial de 13 USD refleja el costo de llevar (financiación y almacenamiento).",
   ], "Renovar mantiene la exposición, pero el diferencial entre vencimientos forma parte del resultado."),
   ["Llegar al primer día de aviso sin plan.", "Analizar con series continuas sin saber cómo se ajustaron.", "Operar el contrato que ya perdió liquidez."],
   ["Conozco último día de negociación y de aviso.", "Planifiqué el rollover.", "Sé qué contrato concentra la liquidez."],
   [["¿Por qué un especulador cierra antes del primer día de aviso?", "Para no recibir avisos de entrega física."], ["Cierras dic en 1.950 y abres feb en 1.962 con 2 contratos de 100 oz. ¿Diferencial pagado en nocional?", "12 × 100 × 2 = 2.400 USD más de nocional, reflejo del costo de llevar."]],
   [["Primer día de aviso", "First notice day", "Inicio de avisos de entrega."], ["Serie continua", "Continuous contract", "Serie que empalma vencimientos."]]),
  T("6.5.3", "Margen y ajuste diario", [
    "El <b>margen inicial</b> lo fija la bolsa (y el bróker puede exigir más). No es un costo, sino una garantía. El <b>margen de mantenimiento</b> es el mínimo; si el saldo cae por debajo, llega un requerimiento (margin call).",
    "Con la liquidación diaria (mark-to-market) cada sesión se abona o se carga la variación. Una racha de pérdidas exige aportar dinero aunque la posición aún no esté cerrada.",
    "Las bolsas pueden <b>subir los márgenes</b> en momentos de alta volatilidad, lo que obliga a aportar más capital o reducir posición justo cuando el mercado está más agitado.",
    "Regla práctica: no uses más del 20–30 % del capital como margen, para tener colchón ante pérdidas diarias y subidas de margen.",
   ],
   E("Requerimiento de margen", [
    "Margen inicial 10.000; mantenimiento 9.000; saldo inicial 12.000.",
    "Pérdidas de 1.500 y 1.800 en dos días → saldo 8.700, bajo el mantenimiento.",
    "Debes reponer hasta el inicial: 10.000 − 8.700 = <b>1.300 USD</b>, o reducir la posición.",
   ], "La liquidez para cubrir márgenes es parte del plan, no un detalle."),
   ["Usar casi todo el capital como margen.", "Ignorar posibles subidas de margen.", "Confundir margen con pérdida máxima."],
   ["Mi margen usado es una fracción del capital.", "Tengo liquidez para requerimientos.", "Conozco el margen de mantenimiento."],
   [["Saldo 15.000, mantenimiento 12.000, inicial 13.000. Pierdes 3.500. ¿Qué ocurre?", "Saldo 11.500 < 12.000: debes reponer 1.500 hasta 13.000."], ["¿Por qué una subida del margen por la bolsa puede forzar a cerrar?", "Porque exige más garantía; sin liquidez, la posición se reduce o se cierra."]]),
  # 6.6 Materias primas
  T("6.6.1", "Qué mueve oro, energía y agrícolas", [
    "<b>Oro:</b> suele moverse en sentido contrario a los tipos de interés reales y al dólar; también responde a la demanda de bancos centrales, a la aversión al riesgo y a los flujos de ETFs. La <b>plata</b> combina papel monetario e industrial y es más volátil.",
    "<b>Petróleo y gas:</b> oferta (decisiones de la OPEP+, producción de EE. UU.), demanda (crecimiento económico, estacionalidad de conducción y calefacción), inventarios semanales y geopolítica. El gas natural es muy sensible al clima.",
    "<b>Agrícolas:</b> clima, siembras y cosechas, informes oficiales de oferta y demanda, enfermedades y política comercial. Tienen estacionalidad marcada.",
    "Todas comparten la influencia del dólar (cotizan en USD) y de la curva de futuros (contango o backwardation).",
   ],
   E("Inventarios de petróleo", [
    "Consenso: caída de 1,5 millones de barriles. Publicado: aumento de 2,0 millones.",
    "Sorpresa de +3,5 millones respecto a lo esperado: más oferta de la prevista.",
    "Reacción típica: presión bajista, salvo que otros datos (producción, gasolina) compensen.",
   ], "Como en las acciones, importa la sorpresa frente al consenso."),
   ["Atribuir cada movimiento del oro a una sola causa.", "Operar el dato de inventarios sin conocer el consenso.", "Ignorar la estacionalidad en agrícolas y gas."],
   ["Conozco los factores principales del activo.", "Tengo el calendario de informes.", "Considero el efecto del dólar."],
   [["Tipos reales suben con fuerza y el dólar se aprecia. ¿Presión típica sobre el oro?", "Bajista, aunque no es una regla fija."], ["¿Por qué el gas natural es tan sensible al clima?", "Porque la demanda de calefacción y refrigeración cambia mucho con la temperatura."]],
   [["Tipo de interés real", "Real interest rate", "Tipo nominal menos inflación esperada."], ["Inventarios", "Inventories / stocks", "Existencias almacenadas."]]),
  C("6.6.2", "Cómo leer una curva de futuros", "6.6-a", [
   "<b>Costo de llevar.</b> En el oro, la curva suele estar en contango moderado porque refleja financiación (tipo de interés) y almacenamiento; una curva de oro invertida sería inusual y señal de tensión.",
   "<b>Rendimiento del roll.</b> El rendimiento total de una posición en futuros = variación del spot + rendimiento del roll (+ interés del colateral). En contango persistente el roll resta; en backwardation suma.",
  ]),
  T("6.6.3", "Oro mediante ETF, CFD y futuro", [
    "Tres caminos para la misma idea: <b>ETF físico</b> (sin margen ni vencimiento, comisión anual, horario bursátil), <b>CFD</b> (tamaño flexible, apalancamiento, financiación diaria, contraparte el bróker) y <b>futuro</b> (estandarizado, casi 24 h, margen con liquidación diaria, vencimiento y rollover).",
    "Para horizontes cortos con apalancamiento, el CFD o el futuro micro suelen ser más eficientes. Para mantener meses sin apalancamiento, el ETF suele ser más barato que pagar financiación diaria.",
    "También existen fondos que usan derivados en lugar de oro físico, y acciones de mineras, que añaden riesgo empresarial y apalancamiento operativo al precio del oro.",
    "Compara siempre con el mismo nocional y el mismo horizonte, y suma todos los costos.",
   ],
   E("Mantener 10 oz (≈ 24.000 USD) durante 6 meses", [
    "ETF con 0,25 % anual: 24.000 × 0,25 % ÷ 2 = <b>30 USD</b>.",
    "CFD con financiación del 7 % anual: 24.000 × 7 % ÷ 2 = <b>840 USD</b>.",
    "Futuro micro (1 contrato de 10 oz): costo implícito en el diferencial de vencimientos y dos rollovers, del orden del tipo de interés del período (≈ 2–3 % semestral), más comisiones.",
   ], "Para horizontes largos sin apalancamiento, la financiación del CFD pesa mucho."),
   ["Elegir instrumento sin considerar el horizonte.", "Ignorar la financiación del CFD.", "Pensar que una minera replica el precio del oro."],
   ["Igualé nocional y horizonte.", "Sumé todos los costos.", "Conozco margen y vencimiento si uso derivados."],
   [["CFD de 12.000 USD al 6 % anual durante 3 meses. ¿Financiación?", "12.000 × 6 % ÷ 4 = 180 USD."], ["¿Qué instrumento no tiene vencimiento ni margen?", "El ETF físico (comprado sin apalancamiento)."]]),
  # 6.7 Opciones
  C("6.7.1", "Call, put, strike y prima", "6.7-a", [
   "<b>Dentro, en y fuera del dinero.</b> Una call está dentro del dinero (ITM) si el precio supera el strike, en el dinero (ATM) si está cerca y fuera (OTM) si está por debajo. Las OTM son baratas pero tienen menos probabilidad de terminar con valor.",
   "<b>Estilo.</b> Las opciones americanas se pueden ejercer en cualquier momento; las europeas solo al vencimiento. Muchas opciones sobre índices son europeas y se liquidan en efectivo.",
  ]),
  T("6.7.2", "Qué cambia antes del vencimiento", [
    "<b>Delta</b>: cuánto cambia la prima por 1 de movimiento del subyacente (aprox. 0,5 en el dinero). <b>Gamma</b>: cuánto cambia la delta. <b>Theta</b>: pérdida de valor por paso del tiempo. <b>Vega</b>: cambio por 1 punto de volatilidad implícita.",
    "La <b>volatilidad implícita</b> es la que el mercado descuenta en la prima. Suele subir antes de eventos (resultados, datos) y caer después: comprar opciones antes de un evento puede perder valor aunque aciertes la dirección (caída de volatilidad).",
    "El comprador de opciones sufre theta cada día; el vendedor la cobra pero asume gamma, es decir, pérdidas que se aceleran con movimientos grandes.",
    "Si vendes opciones americanas, puedes ser <b>asignado</b> antes del vencimiento, sobre todo cerca de dividendos o si están muy dentro del dinero.",
   ],
   E("Call en el dinero antes de un dato", [
    "Prima 4,00; delta 0,50; theta −0,05 por día; vega 0,10 por punto de volatilidad.",
    "El subyacente sube 2 → +1,00 por delta.",
    "Tras el dato la volatilidad implícita cae 8 puntos → −0,80 por vega; un día pasa → −0,05.",
    "Prima nueva ≈ 4,00 + 1,00 − 0,80 − 0,05 = <b>4,15</b>: casi no ganó pese a acertar la dirección.",
   ], "Precio, tiempo y volatilidad actúan a la vez sobre la prima."),
   ["Comprar opciones antes de un evento sin considerar la caída de volatilidad.", "Ignorar la theta en opciones de vencimiento corto.", "Vender opciones sin plan ante asignación."],
   ["Conozco delta, theta y vega de mi posición.", "Revisé la volatilidad implícita frente a la histórica.", "Sé qué haría si me asignan."],
   [["Delta 0,30 y el subyacente sube 5. ¿Cambio aproximado de la prima?", "+1,50."], ["Theta −0,08 diaria durante 10 días sin otros cambios. ¿Pérdida de valor?", "−0,80."]],
   [["Volatilidad implícita", "Implied volatility", "Volatilidad descontada en la prima."], ["Asignación", "Assignment", "Obligación del vendedor al ejercer el comprador."]]),
  T("6.7.3", "Spread vertical con calls compradas y vendidas", [
    "Un <b>spread vertical alcista con calls</b> compra una call de strike bajo y vende otra de strike alto con el mismo vencimiento. Pagas un <b>débito</b> neto menor que la call sola, a cambio de limitar la ganancia.",
    "Al vencimiento: pérdida máxima = débito; ganancia máxima = diferencia de strikes − débito; equilibrio = strike bajo + débito.",
    "Antes del vencimiento, el valor del spread depende de dónde esté el precio respecto a los strikes, del tiempo y de la volatilidad, pero su sensibilidad a vega y theta es menor que la de una call sola.",
    "Las opciones también sirven para <b>cubrir</b>: una put comprada protege una cartera de acciones; una put spread abarata esa protección limitando la cobertura.",
   ],
   E("Bull call spread 100/110", [
    "Compras call 100 por 5,00 y vendes call 110 por 1,80 → débito 3,20.",
    "Pérdida máxima: 3,20 (precio ≤ 100 al vencer).",
    "Ganancia máxima: 10 − 3,20 = <b>6,80</b> (precio ≥ 110).",
    "Equilibrio: 100 + 3,20 = <b>103,20</b>. Con contratos de 100 unidades: riesgo 320 USD, máximo 680 USD.",
   ], "El spread cambia ganancia ilimitada por un costo menor y un riesgo definido."),
   ["Olvidar que la ganancia está limitada.", "Elegir strikes sin relación con el escenario.", "Ignorar comisiones de dos patas."],
   ["Calculé débito, máximo y equilibrio.", "Los strikes reflejan mi escenario.", "Conozco el vencimiento y la liquidez de ambas patas."],
   [["Compras call 50 a 3 y vendes call 55 a 1. ¿Débito, máximo y equilibrio?", "Débito 2; máximo 3; equilibrio 52."], ["¿Qué limita un spread vertical frente a una call sola?", "La ganancia máxima, a cambio de menor costo."]],
   [["Diferencial vertical", "Vertical spread", "Compra y venta de opciones con distinto strike."], ["Débito", "Debit", "Pago neto al abrir la estrategia."]]),
  # 6.8 Bonos
  C("6.8.1", "Bonos: precio frente a rendimiento", "6.8-a", [
   "<b>Valor presente.</b> Un pago de 100 dentro de 5 años vale hoy 100 ÷ (1 + r)^5: al 4 % ≈ 82,19; al 6 % ≈ 74,73. Todo el precio de un bono se construye sumando valores presentes así.",
   "<b>Cupón cero.</b> Un bono sin cupones tiene una duración igual a su plazo y es el más sensible a tipos para un vencimiento dado.",
  ]),
  T("6.8.2", "Leemos una curva de rendimientos", [
    "La <b>curva de rendimientos</b> muestra el rendimiento de bonos del mismo emisor a distintos plazos. Normalmente tiene pendiente positiva: los plazos largos rinden más por mayor riesgo de tipos e inflación.",
    "Una curva <b>plana</b> o <b>invertida</b> (corto plazo rinde más que el largo) refleja expectativas de bajadas de tipos o de desaceleración. Se vigila la diferencia entre el bono a 10 y a 2 años.",
    "Los movimientos se describen como <b>empinamiento</b> o <b>aplanamiento</b>, y si ocurren por subidas o bajadas de tipos (bear o bull).",
    "Los tipos influyen en otros mercados: tipos reales altos suelen presionar al oro y a las acciones de crecimiento; diferenciales entre países mueven divisas.",
   ],
   E("Curva en dos fechas", [
    "Fecha A: 2 años 4,6 %, 10 años 4,1 % → diferencial 10–2 = <b>−0,5</b> (invertida).",
    "Fecha B: 2 años 4,0 %, 10 años 4,2 % → diferencial <b>+0,2</b>.",
    "El tramo corto bajó más que el largo: empinamiento por bajada de tipos cortos (bull steepening).",
   ], "La forma de la curva resume expectativas de tipos y crecimiento."),
   ["Interpretar una inversión como señal de venta inmediata.", "Mirar un solo plazo.", "Ignorar el efecto de los tipos reales en otros activos."],
   ["Conozco el diferencial 10–2.", "Sé si la curva se empina o aplana y por qué tramo.", "Relacioné los tipos con mis otros mercados."],
   [["2 años 3,8 % y 10 años 3,5 %. ¿Forma?", "Invertida (−0,3)."], ["Si el 10 años sube más que el 2 años, ¿qué movimiento es?", "Empinamiento."]],
   [["Curva de rendimientos", "Yield curve", "Rendimientos por plazo."], ["Curva invertida", "Inverted curve", "El corto plazo rinde más que el largo."]]),
  T("6.8.3", "Qué cartera reacciona más a las tasas", [
    "La <b>duración modificada</b> aproxima el cambio porcentual del precio ante 1 punto de cambio en el rendimiento: ΔP ≈ −duración × Δr. La <b>convexidad</b> corrige esa aproximación en cambios grandes.",
    "La duración de una cartera es la media ponderada de las duraciones de sus bonos. Carteras de plazo largo y cupón bajo son más sensibles.",
    "Además del riesgo de tipos existe el <b>riesgo de crédito</b>: los bonos corporativos pagan un diferencial (spread) sobre los públicos; si aumenta el temor a impagos, el spread se amplía y el precio cae aunque los tipos no cambien.",
    "Los ETFs de bonos no vencen: mantienen una duración aproximadamente constante, por lo que su precio no «vuelve a 100» como un bono individual.",
   ],
   E("Choque de +1 punto en dos carteras", [
    "Cartera A: duración 2 → ≈ <b>−2 %</b>.",
    "Cartera B: duración 9 → ≈ <b>−9 %</b>.",
    "Si además el spread de crédito de B (corporativos) se amplía 0,5 puntos: ≈ −9 % − 4,5 % = <b>−13,5 %</b>.",
   ], "Duración y diferencial de crédito explican la mayor parte del riesgo de una cartera de bonos."),
   ["Pensar que un ETF de bonos se comporta como un bono que vence.", "Ignorar el riesgo de crédito.", "Usar la duración para cambios de tipos muy grandes sin convexidad."],
   ["Conozco la duración de la cartera.", "Separé riesgo de tipos y de crédito.", "Simulé un choque de tipos."],
   [["Cartera 60 % duración 3 y 40 % duración 8. ¿Duración total?", "0,6 × 3 + 0,4 × 8 = 5."], ["Con duración 5, ¿efecto de una bajada de 0,75 puntos?", "≈ +3,75 %."]],
   [["Duración modificada", "Modified duration", "Sensibilidad porcentual a tipos."], ["Diferencial de crédito", "Credit spread", "Rendimiento extra por riesgo de impago."]]),
 ],
 "caso": {
  "titulo": "Caso integrador: la misma idea sobre el oro en tres instrumentos",
  "enunciado": [
   "Esperas que el oro suba desde 2.400 hacia 2.480 en las próximas 6 semanas, con invalidación en 2.360. Tu cuenta es de 20.000 USD y quieres arriesgar como máximo 1 % (200 USD).",
   "Compara ETF físico, CFD y futuro micro (10 oz): tamaño, resultado si se cumple el objetivo, pérdida si llega la invalidación, costos aproximados (ETF 0,25 % anual; CFD 7 % anual; futuro: comisión de 2 USD por lado y un rollover) y riesgos propios.",
  ],
  "solucion": [
   "Distancia al stop = 40 USD/oz → tamaño máximo = 200 ÷ 40 = 5 oz (≈ 12.000 USD de nocional).",
   "ETF: equivalente a 5 oz (12.000 USD). Objetivo: +80 × 5 = +400 USD; stop: −200 USD; comisión ≈ 12.000 × 0,25 % × 6/52 ≈ 3,50 USD. Riesgo propio: horario bursátil y gaps de apertura.",
   "CFD: 5 oz, margen 5 % = 600 USD. Objetivo +400; stop −200; financiación ≈ 12.000 × 7 % × 42/365 ≈ 97 USD. Riesgo propio: contraparte y financiación.",
   "Futuro micro: 1 contrato = 10 oz, el doble del tamaño permitido: el riesgo sería 400 USD (2 %). Opciones: aceptar 2 %, ampliar el stop no es válido, o usar otro instrumento. Si se acepta: objetivo +800, stop −400, costos ≈ 8 USD más el diferencial del rollover.",
   "Conclusión: para este tamaño, el CFD o el ETF permiten respetar el 1 %; el futuro micro solo encaja si la cuenta fuera mayor o el stop más corto.",
  ],
 },
 "autoevaluacion": [
  ["¿Qué mueve el precio en los resultados, el BPA o la sorpresa frente al consenso?", "La sorpresa frente al consenso y la previsión."],
  ["¿Quién paga el dividendo en una posición corta?", "El vendedor en corto."],
  ["¿Qué indica una subida del índice con amplitud débil?", "Concentración en pocos valores."],
  ["Nocional de 2 micro E-mini con el índice en 5.000 (×5).", "50.000 USD."],
  ["¿Cuándo suele aplicarse el swap triple en forex?", "El miércoles."],
  ["Nivel de margen con capital 4.000 y margen usado 1.000.", "400 %."],
  ["¿Qué riesgo elimina la autocustodia y cuál añade?", "Elimina el del exchange; añade la responsabilidad de guardar las claves."],
  ["¿Por qué un especulador renueva un futuro antes del primer día de aviso?", "Para evitar la entrega física."],
  ["Bull call spread 100/110 con débito 3: máximo y equilibrio.", "Máximo 7; equilibrio 103."],
  ["Cartera de duración 7 ante una subida de 0,5 puntos.", "≈ −3,5 %."],
 ],
}
