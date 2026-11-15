# Requisitos y evidencia

Fuente única del estado. Actualizar solo la fila afectada; enlazar detalle en lugar de
duplicarlo. Estados: definido, en curso, pendiente de decisión, verificado.

| ID | Alcance / aceptación | Estado | Evidencia |
|---|---|---|---|
| AG-01 | Perfiles selectivos, coordinación, memoria de bugs y fuentes; sin código de aplicación | verificado | validación documental y revisión independiente; ver abajo |
| APP-01 | Una cuenta por usuario y aislamiento entre clientes | definido | sin implementación |
| APP-02 | Depósitos cripto conciliados con aporte PAMM | descartado 2026-11-15 | cambio de enfoque, ver project.md |
| APP-03 | Rendimiento individual reproducible según participación efectiva | descartado 2026-11-15 | cambio de enfoque |
| APP-04 | Seguimiento del horizonte anual y retiro | descartado 2026-11-15 | cambio de enfoque |
| APP-05 | Cursos: catálogo, imágenes, precio USDT, pago por hash ERC-20, descarga | definido | sin implementación |
| APP-07 | Home de mercados: cotizaciones en caché con turnos por proveedor | en curso | backend: migración 002, planificador, proveedores, /api/market; 15 pruebas unitarias y 13 de integración pasan; frontend: home con cotizaciones propias y 6 widgets de TradingView cargando (cinta, panorama, calendario, noticias, ganadores, mapa de calor); 14 pruebas de frontend; falta licencia comercial de TradingView y datos de Massive guardados |
| APP-06 | React/Tailwind con mejora de maqueta | pendiente de decisión | D10 |

## Handoff activo
Fase de aplicación no iniciada. Siguiente paso: esperar encargo del usuario para el código;
resolver decisiones del primer módulo en ese momento. No hay dependencias ni pruebas ejecutables.

## Evidencia AG-01
2026-09-08: 17 archivos Markdown; cero enlaces locales rotos; ningún archivo de aplicación. Revisión independiente de siete archivos críticos sin hallazgos materiales. Se verificó la separación entre decisiones pendientes e invariantes, la idempotencia y el protocolo de revisión. No se ejecutaron builds ni pruebas de aplicación porque todavía no hay código. Publicación Git se verifica al cerrar la entrega; este registro acredita la documentación, no un despliegue.
