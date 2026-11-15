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
