# Requisitos y evidencia

Fuente única del estado. Actualizar solo la fila afectada; enlazar detalle en lugar de
duplicarlo. Estados: definido, en curso, pendiente de decisión, verificado.

| ID | Alcance / aceptación | Estado | Evidencia |
|---|---|---|---|
| AG-01 | Perfiles selectivos, coordinación, memoria de bugs y fuentes; sin código de aplicación | verificado | validación documental y revisión independiente; ver abajo |
| APP-01 | Una cuenta por usuario y aislamiento entre clientes | definido | sin implementación |
| APP-02 | Depósitos cripto conciliados con aporte PAMM | pendiente de decisión | D03, D06 |
| APP-03 | Rendimiento individual reproducible según participación efectiva | pendiente de decisión | D04, D05 |
| APP-04 | Seguimiento del horizonte anual y retiro | pendiente de decisión | D07 |
| APP-05 | Cursos, análisis y redes | definido | acceso/alojamiento D09 |
| APP-06 | React/Tailwind con mejora de maqueta | pendiente de decisión | D10 |

## Handoff activo
Fase de aplicación no iniciada. Siguiente paso: esperar encargo del usuario para el código;
resolver decisiones del primer módulo en ese momento. No hay dependencias ni pruebas ejecutables.

## Evidencia AG-01
2026-09-08: 17 archivos Markdown; cero enlaces locales rotos; ningún archivo de aplicación. Revisión independiente de siete archivos críticos sin hallazgos materiales. Se verificó la separación entre decisiones pendientes e invariantes, la idempotencia y el protocolo de revisión. No se ejecutaron builds ni pruebas de aplicación porque todavía no hay código. Publicación Git se verifica al cerrar la entrega; este registro acredita la documentación, no un despliegue.
