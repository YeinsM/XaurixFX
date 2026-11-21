> Diseño histórico sustituido el 2026-11-17 por petición del usuario: prompt directo a Gemini y respuesta íntegra, sin GoldPrice ni JSON obligatorio. Ver docs/project.md y APP-10 en docs/work.md.

# Diseño: análisis diario de XAUUSD

Fecha: 2026-11-17
Estado: diseño aprobado; pendiente de revisión de esta especificación.

## Objetivo

Agregar una sección pública **Análisis** que publique y conserve un análisis técnico
diario de XAUUSD a las 08:00 de República Dominicana (UTC−4). El informe seguirá las
tres partes, las reglas de evidencia y la disciplina operativa solicitadas por el usuario.
No se ejecutan operaciones ni se conectan cuentas de trading.

## Alternativas evaluadas

1. **Gemini busca todos los datos.** Menos integración, pero no garantiza velas M5/M15
   consistentes ni niveles precisos. Se descarta como fuente de estructura y precios.
2. **GoldPrice entrega velas y Gemini calcula todo.** Usa datos estructurados, pero deja
   cálculos repetibles de indicadores y relaciones riesgo/beneficio al modelo.
3. **GoldPrice entrega velas; el backend calcula y valida; Gemini interpreta.**
   Recomendado: separa datos observados, cálculos deterministas y juicio técnico.
   Gemini Search Grounding se usa únicamente para calendario/eventos con citas, no para
   sustituir las velas.

## Arquitectura y flujo

1. Un trabajo diario obtiene el spot `XAU-USD-SPOT` y barras cerradas de GoldPrice.dev
   para `5m`, `15m`, `1h` y `4h`. Los valores `bar_start` se conservan en UTC y se
   presentan en UTC−4. El origen se identifica como GoldPrice.dev y se conservan los
   timestamps y las fuentes de respuesta disponibles; no se presenta el spot como un
   benchmark oficial ni se atribuye volumen consolidado al mercado spot. Un spot con
   `is_stale=true` puede dar contexto, pero nunca sustenta una entrada numérica vigente.
2. El backend excluye barras con `is_closed=false`, huecos, valores inválidos o
   cobertura insuficiente. Se necesitan al menos 200 cierres H4 para EMA 200; no se
   rellenan barras ausentes. La respuesta 403 por plan, un error del proveedor o falta
   de datos impiden generar niveles operativos.
3. El backend calcula EMA 20/50/200 con α=2/(n+1), RSI 14 de Wilder y Momentum 14 como
   (cierre actual / cierre de hace 14 velas) × 100, cuya referencia es 100. Se adjuntan
   las series y sus timestamps al contexto del modelo. El informe declara estas fórmulas.
4. Gemini Search Grounding busca eventos del calendario económico y devuelve
   referencias citables. Si no obtiene información verificable, el informe indica que
   el calendario no pudo consultarse. La búsqueda no aporta cotizaciones al análisis.
5. Gemini recibe las velas, cálculos, metadatos de fuente y eventos/citas. Devuelve un
   objeto estructurado con las tres partes del informe y los campos de los dos
   escenarios. El servidor valida el esquema, dirección, orden de stop/objetivos y
   límites numéricos; calcula distancias y R:B. Si la entrada es un rango, usa el punto
   medio y lo declara. No reemplaza una entrada inexistente por un precio inventado.
6. PostgreSQL guarda un registro por fecha: estado, informe estructurado, fechas de
   referencia y generación, fuente, citas y versión del prompt. No se guardan las claves.
   El estado puede ser `published`, `insufficient_data` o `failed`. La fecha tiene
   restricción única; un lock de PostgreSQL evita trabajos simultáneos duplicados.
7. El frontend muestra el informe más reciente y su historial, fuente, fechas, citas,
   estado y aviso informativo. Un fallo o falta de datos no se muestra como un informe
   exitoso ni como niveles accionables.

## Programación y recuperación

- Zona horaria: `America/Santo_Domingo` (UTC−4); ejecución diaria a las 08:00, incluidos
  fines de semana. Si el mercado está cerrado o el proveedor no tiene velas actuales,
  se informa el último dato verificable y se evita proponer una entrada vigente.
- El programador vive en el proceso backend y usa PostgreSQL para idempotencia. Si el
  proceso no estaba disponible a las 08:00, al volver comprueba la fecha local y trata
  de completar la ejecución de ese día. Ante errores transitorios se permiten tres
  reintentos con backoff de 1, 5 y 15 minutos; al agotarlos queda un estado `failed`
  explícito.
- El requisito de ejecución diaria depende de que el backend esté encendido. No se
  presupone ni se configura un proveedor de hosting o un scheduler externo.
- Si faltan llaves, el trabajo registra un error de configuración sin exponer valores.
  Las rutas de contenido siguen disponibles y muestran el estado; no se bloquea el
  arranque de toda la API.

## Contrato de lectura

- `GET /api/analysis` devuelve el informe más reciente y un historial paginado.
- La consulta acepta `limit` (1–30, por defecto 10) y `before` (fecha ISO inclusiva);
  la respuesta contiene `analyses` en orden descendente y `nextBefore` para cargar la
  página anterior. La UI presenta primero el más reciente y permite cargar anteriores.
- El contenido es público, igual que las secciones públicas actuales. No hay endpoint
  de generación manual ni de ejecución financiera en este alcance.
- La UI agrega `analysis` al tipo de página/ruta existente y el enlace **Análisis** a la
  navegación principal. La tabla comparativa tiene desplazamiento horizontal contenido
  en móviles; el estado sin informes, carga y error es explícito.
- El texto del modelo se renderiza como Markdown seguro, sin HTML crudo, scripts ni
  inserción directa de markup no confiable.
- La página conserva el aviso del sitio: información de mercado con fines informativos,
  no constituye recomendación de inversión.

## Seguridad, límites y exclusiones

- `GEMINI_API_KEY` y `GOLDPRICE_API_KEY` se leen solo en backend y nunca se incluyen en
  el bundle, respuestas públicas, prompts, base de datos o logs.
- Las citas del calendario se conservan como metadatos y se muestran como enlaces
  externos. La salida del modelo no puede ejecutar acciones.
- Una respuesta de Gemini, aunque esté fundamentada, puede contener errores de análisis.
  Las validaciones técnicas reducen errores de formato/cálculo, pero no garantizan la
  calidad de una interpretación ni resultados financieros.
- Fuera de alcance: ejecución de órdenes, lotaje, probabilidades, subida automática de
  capturas, elección de hosting y gestión de llaves desde la UI.
- El usuario se ocupa de las implicaciones legales/licencias de publicación; el sistema
  no incluye una verificación automática de licencias.

## Prompt propuesto

### Contexto de datos inyectado por el backend

El backend proporciona el símbolo `XAU-USD-SPOT`, la cotización de referencia con su
timestamp, la fuente GoldPrice.dev, barras OHLC por temporalidad con `bar_start` UTC y
`is_closed`, los indicadores ya calculados y sus fórmulas, el estado del mercado y los
resultados de calendario con citas (o el indicador de que no se pudo consultar). Las
barras spot tienen `volume=null`; ese valor no se transforma en volumen cero.

### Instrucciones al modelo

> Actúa como analista técnico especializado en XAUUSD. Analiza únicamente el paquete de
> datos proporcionado por el backend para precios, estructura e indicadores. Usa solo
> velas cerradas (`is_closed=true`). El paquete indica el precio de referencia, fuente,
> timestamps y temporalidades. No busques, sustituyas ni inventes cotizaciones,
> indicadores, velas, niveles o noticias. No afirmes que las zonas técnicas representan
> órdenes reales de instituciones: Order Blocks, FVG y liquidez son interpretaciones.
>
> Usa los EMA, RSI y Momentum adjuntos y declara sus fórmulas. No los recalcules ni
> interpretes sobrecompra/sobreventa como reversión automática. Momentum 14 se define
> como cierre actual / cierre de hace 14 velas × 100, con referencia 100. Para el
> calendario económico utiliza exclusivamente los eventos con cita adjuntos; expresa
> sus horas en `America/Santo_Domingo` (UTC−4). Si el calendario no pudo verificarse,
> dilo explícitamente.
>
> Si falta una de las temporalidades, no hay suficientes velas cerradas para el
> indicador solicitado, hay datos inválidos/huecos que impiden sustentar niveles o no
> se puede verificar la fecha/fuente, no propongas entrada, stop ni objetivos numéricos.
> Indica «datos insuficientes; esperar confirmación» y qué dato falta. En un flujo
> manual, solicita capturas H4, H1, M15 y M5; en el informe automático, deja constancia
> de que el job no recibió esas capturas. No presentes hipótesis como hechos.
>
> Redacta el informe en español claro y operativo, exclusivamente en estas tres partes:
>
> **1. ANÁLISIS MACRO Y ESTRUCTURA — H4 Y H1**
> Para H4 y H1 clasifica el estado (alcista, bajista, rango o transición); identifica
> swings HH/HL/LH/LL, estructura principal/interna, BOS y CHoCH con el swing y cierre
> que los validan; soportes, resistencias, oferta/demanda; liquidez visible (iguales,
> extremos de sesión y día anterior); barridas, desplazamientos, rechazos, retrocesos
> y consolidaciones; y alineación o conflicto entre temporalidades.
> Concluye sesgo y justificación, zona decisiva y condición de invalidación.
>
> **2. CONFLUENCIA TÉCNICA — ORDER BLOCKS, FIBONACCI, EMA, RSI Y MOMENTUM**
> A. Describe Order Blocks alcistas/bajistas solo si preceden desplazamiento y ruptura;
> da temporalidad, límites, criterio y estado (sin mitigar, parcial o invalidado).
> Identifica FVG relevantes y relación con estructura; no etiquetes cualquier vela
> contraria como Order Block.
> B. Indica impulso y anclajes Fibonacci; evalúa 38.2%, 50%, 61.8% y 78.6%; extensiones
> 127.2%/161.8% solo si son objetivos razonables y coinciden con estructura/OB/FVG/
> liquidez. No fuerces anclajes.
> C. Analiza EMA 20/50/200: posición, pendiente, orden, separación, cruces, extensión
> y retroceso.
> D. Analiza RSI 14 respecto a 50 y 70/30; divergencias solo con swings claros.
> E. Analiza Momentum 14 respecto a 100, dirección, aceleración/desaceleración y
> divergencias solo verificables.
> Presenta la tabla `Temporalidad | Zona o señal | Evidencia | Implicación
> alcista/bajista | Estado de confirmación`. Resume confluencias y contradicciones sin
> contar señales correlacionadas como pruebas independientes.
>
> **3. PLAN DE ENTRADA ÓPTIMA — M15 Y M5**
> Desarrolla escenario A de continuación del sesgo y escenario B alternativo si A se
> invalida; adapta ambos a extremos/ruptura confirmada cuando el mercado esté en rango.
> Para cada uno especifica dirección, contexto, zona M15, desencadenante M5 (barrida si
> corresponde, BOS/CHoCH por cierre, desplazamiento y retesteo; indica condiciones
> obligatorias), tipo de entrada y motivo, rango de entrada solo si hay evidencia, SL
> por invalidación estructural considerando spread/volatilidad, TP1/TP2/TP3 técnicos,
> cancelación, gestión, vigencia y cuándo rehacer el análisis. No propongas entrada solo
> por tocar una zona.
>
> El backend calcula distancia entrada-stop y entrada-TPs en dólares de cotización, y
> R:B desde el punto medio de un rango de entrada, que debe identificarse. Prioriza al
> menos 1:2 hasta un objetivo justificable; si no se cumple, indícalo. No propongas
> probabilidades ni lotaje sin metodología/capital/riesgo/especificaciones del broker.
> Recomienda no operar ante contradicción, mitad del rango, spread elevado, datos
> insuficientes o evento relevante próximo.
>
> Termina la tercera parte con la tabla comparativa
> `Escenario | Dirección | Zona de entrada | Confirmación M5 | Stop loss | TP1 | TP2 |
> TP3 | R:B | Invalidación`.
> Cierra con: `Preferencia actual: [escenario o esperar], condicionada a [confirmación
> concreta]`. Explica niveles sin presentar hipótesis como certezas.

### Presentación numérica

La respuesta del modelo usa el esquema JSON validado por el servidor, no HTML. El
servidor calcula valores de distancia y R:B desde los campos numéricos de los escenarios
y genera sus celdas visibles. Para dirección de compra, stop < entrada < objetivos; para
venta, objetivos < entrada < stop. Los campos sin soporte son nulos y se muestran como
“No disponible”; el informe se rechaza como operativo si contiene niveles incompatibles.
La salida mostrada contiene únicamente las tres partes requeridas y la tabla final dentro
de la tercera parte.

## Criterios de aceptación

1. A las 08:00 de `America/Santo_Domingo`, un job crea como máximo un registro por día;
   prueba también ejecución duplicada, reinicio y recuperación del día pendiente.
2. El servicio solicita las cuatro temporalidades y omite velas abiertas. Un spot
   `is_stale=true`, 403 por plan, timeout, error de JSON, huecos/valores inválidos o
   falta de historial producen estado explícito sin entradas numéricas vigentes.
3. Pruebas numéricas verifican EMA, RSI, Momentum, rango de entrada/punto medio,
   distancias y R:B. Direcciones y niveles incompatibles se rechazan.
4. Se persisten y exponen fuente, fecha/hora de referencia, fecha de generación y citas
   de calendario; las claves nunca aparecen en respuesta ni en logs.
5. `GET /api/analysis` ofrece el informe actual e historial con estados de carga, vacío,
   error y datos insuficientes. La navegación muestra **Análisis**; la vista es legible
   en escritorio/móvil y el contenido externo no ejecuta HTML.
6. Backend y frontend pasan sus scripts de build y pruebas existentes; las pruebas
   nuevas cubren proveedor, scheduler, persistencia, contrato y renderizado.

## Referencias verificadas

- [GoldPrice.dev: barras históricas y límites por plan](https://goldprice.dev/docs/historical)
- [GoldPrice.dev: referencia de `/v1/bars`](https://goldprice.dev/docs/api-reference)
- [GoldPrice.dev: metodología y procedencia](https://goldprice.dev/methodology)
- [Gemini API: Google Search Grounding y citas](https://ai.google.dev/gemini-api/docs/google-search)
