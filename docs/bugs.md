# Memoria de errores

No hay bugs de producto confirmados: la aplicación todavía no existe.
Los riesgos preventivos de los perfiles no son incidentes observados.

## Uso
Buscar por área, síntoma y regla antes de modificar el dominio. Cargar solo coincidencias.
Registrar un bug por causa; enlazar recurrencias y conservar correcciones históricas.
Cuando crezca el registro, mover detalle a archivos por BUG-ID conservando aquí el índice.
No copiar logs completos ni datos personales.

## Índice
| ID | Área/palabras clave | Estado | Regla/control | Detalle |
|---|---|---|---|---|

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
