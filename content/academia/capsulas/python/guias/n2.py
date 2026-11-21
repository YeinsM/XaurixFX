"""Guía de estudio ampliada · Nivel 2. Cifras ilustrativas."""
G = {
 "2.2-a": {
  "explicacion": [
   "Una orden <b>a mercado</b> prioriza la ejecución: se llena de inmediato al mejor precio disponible, sea cual sea. Es útil cuando entrar ya importa más que el precio exacto, pero en mercados rápidos o con poca liquidez puede llenarse peor de lo que ves en pantalla.",
   "Una orden <b>límite</b> prioriza el precio: fija el máximo que pagas al comprar (o el mínimo que aceptas al vender). Se coloca por debajo del precio actual para comprar y por encima para vender. Puede no ejecutarse nunca si el precio no llega.",
   "Una orden <b>stop</b> está dormida hasta que el precio toca su nivel; entonces se convierte en orden a mercado. Un buy stop va por encima del precio (comprar si rompe hacia arriba) y un sell stop por debajo (vender si cae): así funciona un stop-loss de una posición larga.",
   "La <b>stop-limit</b> combina ambas: al tocar el stop se coloca una límite. Protege el precio, pero si el mercado salta tu límite, la orden puede quedar sin ejecutar y la posición sin protección.",
  ],
  "ejemplo": {
   "titulo": "Oro en 2.380: cuatro formas de entrar o salir",
   "pasos": [
    "Buy market: se llena ya, por ejemplo en 2.380,30 (ask).",
    "Buy limit en 2.372: solo compras si el precio baja a 2.372 o menos. Si rebota en 2.374, no entras.",
    "Buy stop en 2.390: compras solo si sube y toca 2.390; se llena a mercado, quizá en 2.390,40.",
    "Sell stop en 2.365 como stop-loss de un largo: si el precio cae a 2.365 sale a mercado; con un gap podría salir en 2.360.",
   ],
   "conclusion": "Limit = mejor precio o nada. Stop = se activa al tocar y entra a mercado, sin garantía de precio.",
  },
  "errores": [
   "Poner un buy limit por encima del precio (se ejecuta al instante como si fuera a mercado).",
   "Creer que un stop garantiza el precio exacto de salida.",
   "Usar stop-limit como stop-loss en mercados con gaps frecuentes.",
   "Dejar órdenes pendientes olvidadas que se activan días después.",
  ],
  "checklist": [
   "Sé si priorizo ejecución (market) o precio (limit).",
   "Coloqué limit y stop en el lado correcto del precio.",
   "Revisé la vigencia de cada orden pendiente.",
   "Entiendo qué pasa con mi orden si hay un gap.",
  ],
  "ejercicios": [
   ["El oro está en 2.400. Quieres comprar solo si baja a 2.385. ¿Qué orden usas?", "Buy limit en 2.385."],
   ["Estás largo desde 2.400 y quieres limitar la pérdida en 2.388. ¿Qué orden y dónde?", "Sell stop en 2.388 (stop-loss)."],
   ["Una sell stop-limit con stop 2.388 y límite 2.386. El precio abre en 2.380. ¿Qué ocurre?", "El stop se activa pero la límite (no vender por debajo de 2.386) no se ejecuta: la posición sigue abierta y sin protección."],
  ],
  "glosario": [
   ["Orden a mercado", "Market order", "Se ejecuta al mejor precio disponible."],
   ["Orden límite", "Limit order", "Fija el peor precio aceptable."],
   ["Orden stop", "Stop order", "Se activa al tocar un nivel y entra a mercado."],
   ["Orden pendiente", "Pending order", "Orden colocada que aún no se ejecuta."],
  ],
  "resumen": [
   "Market asegura ejecución; limit asegura precio.",
   "El stop se activa al tocar y no garantiza precio.",
   "Revisa el lado y la vigencia de cada orden.",
  ],
 },
 "2.2-b": {
  "explicacion": [
   "Al abrir una posición puedes dejar programada su salida con dos órdenes: el <b>stop-loss</b> (SL), que cierra con pérdida si el precio va en tu contra, y el <b>take-profit</b> (TP), que cierra con ganancia al llegar al objetivo.",
   "Ambas están vinculadas como <b>OCO</b> (one cancels the other): cuando una se ejecuta, la otra se cancela automáticamente. Así nunca quedan órdenes huérfanas que abran una posición nueva sin querer.",
   "La relación entre distancia al objetivo y distancia al stop se llama <b>riesgo/beneficio</b>. Arriesgar 8 para buscar 16 es 1:2. Esta relación no dice nada por sí sola: hay que combinarla con la frecuencia con que se alcanza cada salida (lo verás en el nivel 4).",
   "Decidir SL y TP antes de entrar evita decidir con miedo o euforia durante la operación. El stop debe ir donde la idea queda invalidada, no a una distancia arbitraria.",
  ],
  "ejemplo": {
   "titulo": "Compra de 5 oz en 2.380 con SL 2.372 y TP 2.396",
   "pasos": [
    "Riesgo: (2.380 − 2.372) × 5 = <b>40 USD</b>.",
    "Objetivo: (2.396 − 2.380) × 5 = <b>80 USD</b>. Relación 1:2.",
    "Escenario A: el precio toca 2.396; el TP cierra con +80 USD brutos y el SL se cancela.",
    "Escenario B: el precio toca 2.372; el SL cierra con −40 USD (o algo más con deslizamiento) y el TP se cancela.",
   ],
   "conclusion": "Con 1:2, una ganancia compensa dos pérdidas completas, antes de costos.",
  },
  "errores": [
   "Colocar el stop por comodidad numérica y no donde la idea se invalida.",
   "Mover el TP más lejos durante la operación «porque va bien».",
   "Cerrar manualmente y dejar activas órdenes pendientes sin OCO.",
   "Elegir una relación 1:3 sin comprobar si ese objetivo es alcanzable.",
  ],
  "checklist": [
   "El stop está donde mi análisis deja de ser válido.",
   "Calculé riesgo y objetivo en dinero.",
   "SL y TP están vinculados (OCO).",
   "Acepto la pérdida del stop antes de entrar.",
  ],
  "ejercicios": [
   ["Entrada 2.390, SL 2.384, TP 2.405. ¿Relación riesgo/beneficio?", "Riesgo 6, objetivo 15: 15 ÷ 6 = 2,5, es decir 1:2,5."],
   ["Con 3 oz en esa operación, ¿cuánto arriesgas y cuánto buscas?", "Riesgo 6 × 3 = 18 USD; objetivo 15 × 3 = 45 USD."],
   ["¿Qué pasa con el SL si el TP se ejecuta en una orden OCO?", "Se cancela automáticamente."],
  ],
  "glosario": [
   ["Stop de pérdidas", "Stop-loss (SL)", "Cierra la posición si el precio va en contra."],
   ["Toma de beneficios", "Take-profit (TP)", "Cierra la posición al alcanzar el objetivo."],
   ["Una cancela la otra", "One cancels the other (OCO)", "Vínculo entre dos órdenes de salida."],
   ["Relación riesgo/beneficio", "Risk/reward ratio", "Objetivo dividido entre riesgo."],
  ],
  "resumen": [
   "Define SL y TP antes de entrar.",
   "OCO evita órdenes huérfanas.",
   "El stop va donde la idea se invalida.",
  ],
 },
 "2.3-a": {
  "explicacion": [
   "El <b>resultado bruto</b> es la diferencia entre precio de entrada y salida multiplicada por el tamaño. Es lo que «se ve» en el gráfico. Pero tu cuenta recibe el <b>resultado neto</b>, después de todos los costos.",
   "Los costos habituales son: <b>spread</b> (se paga al entrar), <b>comisión</b> por lote en algunas cuentas (a veces por lado), <b>deslizamiento</b> (diferencia entre el precio pedido y el ejecutado), <b>financiación o swap</b> por mantener la posición de un día para otro, y <b>conversión de divisa</b> si la cuenta no está en la moneda del instrumento.",
   "Algunos costos son fijos por operación y otros crecen con el tiempo. Por eso una estrategia de muy corto plazo sufre más por spread y comisión, mientras que una de varias semanas sufre más por swap.",
   "Llevar un registro con el resultado bruto y el neto de cada operación te muestra cuánto de tu ventaja se va en costos.",
  ],
  "ejemplo": {
   "titulo": "Compra de 1 lote de XAUUSD (100 oz) con +5 USD/oz de recorrido",
   "pasos": [
    "Bruto: 5 × 100 = <b>+500 USD</b>.",
    "Spread 0,30 USD/oz × 100 = −30 USD.",
    "Comisión 7 USD por lado × 2 = −14 USD.",
    "Deslizamiento 0,20 USD/oz × 100 = −20 USD.",
    "Swap de 2 noches a −18 USD/noche = −36 USD.",
    "Neto: 500 − 30 − 14 − 20 − 36 = <b>+400 USD</b>. Los costos se llevaron el 20 % del bruto.",
   ],
   "conclusion": "Evalúa estrategias y operaciones siempre en neto.",
  },
  "errores": [
   "Medir el rendimiento de una estrategia con resultados brutos.",
   "No revisar el swap antes de mantener posiciones varios días.",
   "Ignorar la comisión por lado (entrada y salida).",
   "Olvidar la conversión cuando la cuenta está en otra moneda.",
  ],
  "checklist": [
   "Conozco el spread típico y en noticias.",
   "Sé la comisión por lote y si es por lado.",
   "Revisé el swap largo y corto del instrumento.",
   "Mi registro guarda bruto y neto.",
  ],
  "ejercicios": [
   ["Bruto +120 USD; spread 15; comisión 10; swap −6. ¿Neto?", "120 − 15 − 10 − 6 = 89 USD."],
   ["Una operación con bruto −50 USD y costos 20 USD. ¿Neto?", "−50 − 20 = −70 USD."],
   ["Haces 40 operaciones al mes con 12 USD de costo medio. ¿Cuánto debes ganar en bruto para quedar en cero?", "40 × 12 = 480 USD."],
  ],
  "glosario": [
   ["Deslizamiento", "Slippage", "Diferencia entre precio pedido y ejecutado."],
   ["Financiación", "Swap / overnight financing", "Costo o abono por mantener la posición."],
   ["Comisión", "Commission", "Tarifa del bróker por operar."],
   ["Resultado neto", "Net P&L", "Resultado después de costos."],
  ],
  "resumen": [
   "Bruto es el gráfico; neto es tu cuenta.",
   "Unos costos son por operación y otros por tiempo.",
   "Registra siempre el neto.",
  ],
 },
 "2.4-a": {
  "explicacion": [
   "Una orden grande no siempre encuentra contrapartida en un solo precio. Si en el mejor nivel no hay suficiente volumen, se ejecuta una parte y el resto espera o consume niveles peores: eso es una <b>ejecución parcial</b>.",
   "El <b>precio promedio</b> de la posición se calcula ponderando cada parte por su volumen: suma de (precio × lotes) dividida entre los lotes totales.",
   "La <b>vigencia</b> decide qué pasa con lo que falta: GTC (hasta cancelar), día (se cancela al cierre), IOC (ejecuta lo posible y cancela el resto) o FOK (todo o nada). Elegirla es parte de la decisión.",
   "En el registro de la operación anota lo pedido, lo ejecutado, el precio medio y lo cancelado. Si no lo haces, los cálculos de riesgo quedarán mal.",
  ],
  "ejemplo": {
   "titulo": "Buy limit de 10 lotes con máximo 2.380,70",
   "pasos": [
    "Libro: 3 lotes en 2.380,50, 4 lotes en 2.380,70, 5 lotes en 2.381,00.",
    "Se llenan 3 lotes en 2.380,50 y 4 en 2.380,70: 7 lotes ejecutados.",
    "Precio medio = (3 × 2.380,50 + 4 × 2.380,70) ÷ 7 = 16.664,30 ÷ 7 = <b>2.380,61</b>.",
    "Los 3 lotes restantes no se ejecutan en 2.381,00 porque superan el límite: quedan pendientes según la vigencia.",
   ],
   "conclusion": "Tu riesgo real se calcula con 7 lotes y precio medio 2.380,61, no con 10 lotes en 2.380,70.",
  },
  "errores": [
   "Calcular el stop para el tamaño pedido en vez del ejecutado.",
   "No saber qué vigencia tiene la orden pendiente.",
   "Usar el primer precio ejecutado en lugar del promedio.",
   "Olvidar cancelar el remanente cuando cambian las condiciones.",
  ],
  "checklist": [
   "Elegí la vigencia adecuada (GTC, día, IOC, FOK).",
   "Revisé el volumen ejecutado tras enviar la orden.",
   "Recalculé riesgo con el tamaño y precio medio reales.",
   "Registré pedido, ejecutado y cancelado.",
  ],
  "ejercicios": [
   ["Compras 2 lotes en 100,10 y 3 lotes en 100,20. ¿Precio medio?", "(2 × 100,10 + 3 × 100,20) ÷ 5 = 500,80 ÷ 5 = 100,16."],
   ["¿Qué vigencia usarías si solo quieres la orden completa o nada?", "FOK (fill or kill)."],
   ["Pediste 10 lotes, se llenaron 6 y el stop está a 2 USD por lote. ¿Riesgo real?", "6 × 2 = 12 USD (no 20)."],
  ],
  "glosario": [
   ["Ejecución parcial", "Partial fill", "Se llena solo una parte de la orden."],
   ["Precio medio", "Average price", "Precio ponderado por volumen."],
   ["Válida hasta cancelar", "Good till cancelled (GTC)", "Permanece hasta que la canceles."],
   ["Inmediata o cancelar", "Immediate or cancel (IOC)", "Ejecuta lo posible y cancela el resto."],
  ],
  "resumen": [
   "Las órdenes grandes pueden llenarse por partes.",
   "Calcula el precio medio ponderado.",
   "La vigencia decide el destino del remanente.",
  ],
 },
}
