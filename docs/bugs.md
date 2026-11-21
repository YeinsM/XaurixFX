# Memoria de errores

El índice registra defectos confirmados y su control preventivo.

## Uso
Buscar por área, síntoma y regla antes de modificar el dominio. Cargar solo coincidencias.
Registrar un bug por causa; enlazar recurrencias y conservar correcciones históricas.
Cuando crezca el registro, mover detalle a archivos por BUG-ID conservando aquí el índice.
No copiar logs completos ni datos personales.

## Índice
| ID | Área/palabras clave | Estado | Regla/control | Detalle |
|---|---|---|---|---|
| BUG-001 | Encabezado público; desborde móvil | verificado | revisar ancho de documento a 390 px | detalle abajo |
| BUG-002 | Análisis; tabla comparativa desborda en móvil | verificado | validar ancho del documento y scroll interno de tabla a 390 px | detalle abajo |
| BUG-003 | Análisis; dependencias previas y respuesta Gemini reemplazada | corregido pendiente de integración real | pruebas de llamada única, texto libre y recuperación | detalle abajo |
| BUG-004 | Gemini; fuentes y diagnóstico | verificado con transporte controlado | pruebas SDK HTTP, metadatos e iframe aislado | detalle abajo |
| BUG-005 | Análisis; terminal sin persistencia y 503 genérico | corregido pendiente de integración real | prueba API pública sin sesión y errores de base/esquema | detalle abajo |
| BUG-006 | Análisis; permisos admin, repetición y cuota | verificado con proveedores simulados | IDs de cuentas, pruebas negativas, cron y reutilización | detalle abajo |

## Formato para el primer caso real
- ID BUG-NNN, fecha, severidad P0/P1/P2/P3, área y estado.
- Síntoma y reproducción mínima; esperado frente a observado.
- Causa comprobada y alcance afectado.
- Corrección y referencia al cambio.
- Prevención: prueba/constraint/checklist con ruta o procedimiento exacto.
- Evidencia antes/después; límites si la prevención es manual.
- Relación con incidentes previos y razón del fallo del control, si se repite.

Estados: investigando, corregido pendiente de verificar, verificado, reabierto.
P0: corrupción/exposición crítica; P1: dinero/acceso/flujo esencial incorrecto;
P2: función secundaria; P3: defecto menor. Ajustar según impacto real.
Solo un control ejecutado sustenta estado verificado. Documentar reduce riesgo,
no garantiza que los errores no vuelvan a ocurrir.

## BUG-001 — Encabezado público en móvil
- Fecha: 2026-11-15. Severidad P2. Estado: verificado.
- Reproducción: abrir #broker a 390 px de ancho. El documento medía 644 px y navegación/botón quedaban fuera de pantalla.
- Causa: el encabezado mantenía marca, navegación y acciones en una sola fila sin permitir ajuste.
- Corrección: a 700 px o menos, encabezado en dos filas con navegación horizontal contenida.
- Prevención: revisar en navegador a 390 px que document.documentElement.scrollWidth <= window.innerWidth y que el CTA sea visible. Límite: control manual, no prueba automatizada.
- Evidencia: después de la corrección, scrollWidth 375 px e innerWidth 390 px; captura visual móvil comprobada.

## BUG-002
### Tabla comparativa de Análisis en móvil
- Fecha: 2026-11-17. Severidad P2. Estado: verificado.
- Reproducción: mostrar un informe con tabla comparativa a 390 px. Antes de corregir, el documento medía 1151 px y el contenedor comparativo 1100 px; se esperaba desplazamiento horizontal solo dentro de la tabla.
- Causa: los tracks automáticos del grid de `.an-report` heredaban el ancho mínimo intrínseco de la tabla y ensanchaban las secciones.
- Corrección: limitar el grid a `minmax(0,1fr)` y permitir que secciones y wrapper reduzcan su ancho; mantener el desbordamiento horizontal en `.an-table-scroll`.
- Prevención: en la vista Análisis con datos representativos, comprobar `document.documentElement.scrollWidth <= window.innerWidth` y que `.an-table-scroll.scrollWidth > .an-table-scroll.clientWidth` a 390 px. Límite: comprobación manual en navegador.
- Evidencia: a 390 px, ancho del documento 375 px y wrapper de tabla 309 px con tabla interna de 1100 px; a 1440 px, ancho del documento 1425 px. Solo la tabla necesita desplazamiento horizontal.

## BUG-003
### Análisis bloqueado antes de llamar a Gemini y respuesta reemplazada
- Fecha: 2026-11-17. Severidad P2. Estado: corregido pendiente de integración real.
- Reproducción: configurar únicamente Gemini sin GoldPrice; el servicio anterior guardaba `missing_api_key` sin llamar a Google. Un registro fallido impedía nuevos intentos ese día. Respuestas no JSON se rechazaban y datos considerados antiguos reemplazaban el plan del modelo.
- Causa comprobada: dependencia obligatoria de `marketData`, mínimo de 200 velas, esquema JSON estricto, `addScenarioMetrics` que sobrescribía contenido y retorno temprano ante cualquier registro existente.
- Corrección: una llamada directa con prompt y Search; persistir `rawText` sin reinterpretar; renderizarlo con Markdown seguro. Reintentar registros fallidos o de otra versión del prompt mediante upsert bajo el bloqueo diario. Migración 004 elimina la obligatoriedad de una cotización externa para publicar.
- Prevención ejecutada: pruebas en `backend/test/analysis.test.ts` para llamada única, respuesta libre, recuperación, serialización y errores sin clave; pruebas en `frontend/src/components/AnalysisContent.test.tsx` para texto libre y HTML no ejecutable. Builds correctos.
- Límite: integración PostgreSQL preparada en `backend/test/integration.test.ts`, pero el entorno rechaza conexión con EACCES. Llamada real a Gemini termina en `fetch failed`; no se afirma generación real ni aplicación de migración.

## BUG-004
### Fuentes de Google descartadas y diagnóstico incompleto
- Fecha: 2026-11-17. Severidad P2. Estado: verificado con transporte controlado; conexión real pendiente.
- Síntoma: el adaptador guardaba solo `response.text` y descartaba `groundingMetadata`; `fetch failed` omitía `cause.code` y respuestas vacías no mostraban el motivo del proveedor.
- Causa: no se extraían fuentes/sugerencias, `finishReason`, `promptFeedback` ni la causa de errores de transporte.
- Corrección: conservar y mostrar fuentes/sugerencias con el texto intacto; aislar HTML de Google en iframe sin scripts ni same-origin. Conservar texto parcial con motivo de finalización y errores HTTP/DNS sanitizados. SDK con un máximo de dos intentos para errores HTTP transitorios; sin reintentos de permisos.
- Prevención: `backend/test/analysis.test.ts` ejecuta el SDK oficial contra un transporte controlado y verifica host, cabecera, payload, 503 con recuperación y 403 sin reintentos, serialización de metadatos y conservación de texto parcial. `frontend/src/components/AnalysisContent.test.tsx` verifica fuentes y aislamiento del HTML.
- Límite: la prueba real `analysis:check` devuelve `ENOTFOUND generativelanguage.googleapis.com`. No se afirma respuesta real de Google. Sintaxis contrastada con las referencias oficiales de `backend/README.md`.

## BUG-005
### Diagnóstico de terminal no publica y el historial oculta la causa del 503
- Fecha: 2026-11-17. Severidad P2. Estado: corregido pendiente de integración real.
- Síntoma: el usuario recibe un informe completo con `analysis:check`, pero `/api/analysis` devuelve 503 y no aparece en la página.
- Causa comprobada: `analysis:check` no guarda resultados por diseño; la API solo consulta PostgreSQL. El backend no preparaba el esquema al iniciar, el manejador ocultaba el código del error y el frontend sustituía su mensaje por uno genérico. La causa exacta del 503 en la máquina del usuario aún requiere el código registrado; no se presupone que sea una migración pendiente.
- Corrección: `analysis:publish` prepara el esquema, guarda y muestra el mismo resultado; servidor aplica migraciones antes del scheduler. La API diferencia esquema ausente de fallo de conexión sin publicar SQL/credenciales. La página muestra la explicación y permite actualizar; títulos/tablas mantienen el Markdown original con jerarquía legible.
- Prevención: prueba con repositorio serializado y Fastify verifica `/auth/me`=401 sin sesión y `/analysis`=200 con el informe íntegro. Casos negativos verifican 42P01 y ECONNREFUSED, código 503 accionable y ausencia de detalles privados. Frontend verifica conservación del mensaje de error.
- Evidencia: suite completa 64 pruebas correctas y build correcto. La ejecución real de `db:migrate` falla con EACCES en 127.0.0.1:55439 dentro de este entorno. No se afirma persistencia PostgreSQL real ni verificación visual del informe real.

## BUG-006
### Permiso por correo no verificado y repetición evitable de Gemini
- Fecha: 2026-11-17. Severidad P1 para autorización; P2 para duplicados. Estado: corregido, verificado con proveedores simulados y revisión independiente.
- Causas comprobadas: registro público sin verificación de email combinado con allowlist por email; UI retenía permisos tras cambio/error de sesión. Informe publicado se regeneraba al cambiar promptVersion; imágenes fallidas se reintentaban en cada ejecución y carecían de bloqueo compartido entre procesos.
- Corrección: autorización por IDs explícitos de cuentas existentes (`ANALYSIS_ADMIN_USER_IDS`, sin fallback por correo ni admin automático), comprobada antes de generar; UI vincula permiso a userId y lo limpia ante cambio/error/logout. Reutilizar cualquier informe publicado del día; bloqueo de imágenes por fecha y reutilización de intentos ready/failed.
- Prevención ejecutada: `backend/test/analysis.test.ts` verifica cron real a 12:00 UTC/08:00 RD, antes/después de la hora, overlap/cierre, lecturas sin Gemini, anónimo/no-admin/rol forjado/origen externo, doble clic y versión de prompt anterior. `backend/test/scenarioImages.test.ts` verifica intentos de imagen conservados. Prueba frontend verifica que solo se muestra el botón de generar al recibir permiso.
- Evidencia: 49 pruebas backend y 29 frontend correctas y build completo. Revisión independiente de permisos y coste sin hallazgos bloqueantes; no se ejecutaron llamadas reales a Gemini para verificar.
- Límites: BD y locks entre procesos no probados con PostgreSQL real. El cron es interno: solo ejecuta a la hora si el backend está encendido; al arrancar después de las 08:00 recupera el informe del día. No se afirma disponibilidad 24/7. La lista de admins actual está vacía y no se asignó ninguna cuenta sin instrucción explícita.

## BUG-007

- Fecha: 2026-11-17. Severidad P2. Estado: verificado.
- Síntoma: abrir la web en `http://127.0.0.1:5173` y enviar login devuelve 403; con `http://localhost:5173` funciona.
- Causa comprobada: el control de origen y CORS solo aceptaban el valor exacto de `FRONTEND_ORIGIN` (`localhost`), y el navegador envía `Origin: http://127.0.0.1:5173`.
- Corrección: `loopbackOrigins` en `backend/src/app.ts` acepta el gemelo loopback (localhost ↔ 127.0.0.1) del mismo esquema y puerto; orígenes no loopback siguen siendo exactos.
- Prevención: `backend/test/security.test.ts` verifica ambos gemelos y que un dominio real no se amplía.
- Evidencia: login con `Origin: http://127.0.0.1:5173` vía proxy Vite responde 200; 50 pruebas backend correctas.
