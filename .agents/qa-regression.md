# QA y prevención de recurrencias
Activar para aceptación, revisión, bugs y cierre técnico.
Entrada: requisito, diff y [memoria de errores](../docs/bugs.md) filtrada por dominio.

- Reproducir antes de corregir; separar síntoma e hipótesis de causa.
  El fallo de una herramienta no es automáticamente un bug de producto.
- Para cada bug confirmado: crear/actualizar registro con causa comprobada y control
  preventivo. Preferir prueba de regresión que falle sin corrección y pase con ella;
  si no es automatizable, guardar un procedimiento reproducible y su limitación.
- Riesgo bajo documental: rutas, enlaces, coherencia, diff y alcance.
  UI: flujo/estados; API: contrato y permisos; datos: integración PostgreSQL;
  dinero/aislamiento: casos negativos, concurrencia y revisión independiente.
- No repetir toda la suite sin cambios ni nuevos riesgos. Un build no demuestra
  corrección contable; un mock no demuestra una restricción de PostgreSQL.
- Ante recurrencia, enlazar bug previo e investigar por qué no lo detectó el control.
  Mejorar prueba, constraint o regla acotada; no inflar todas las instrucciones.
- Revisar evidencia del autor; no declarar revisión independiente sobre trabajo propio.
  Hallazgo: severidad, ubicación, escenario, impacto y comprobación propuesta.
Salida: aceptación cubierta, comandos/resultados, pendientes y entradas de bug.
No prometer cero errores ni porcentajes de ahorro sin medición.
