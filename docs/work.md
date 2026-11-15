# Requisitos y evidencia

Fuente única del estado. Actualizar solo la fila afectada; enlazar detalle en lugar de
duplicarlo. Estados: definido, en curso, pendiente de decisión, verificado.

| ID | Alcance / aceptación | Estado | Evidencia |
|---|---|---|---|
| AG-01 | Perfiles selectivos, coordinación, memoria de bugs y fuentes; sin código de aplicación | verificado | validación documental y revisión independiente; ver abajo |
| APP-01 | Cuentas de usuario con login (sin saldos) | verificado | 8 pruebas de integración; tabla accounts eliminada en migración 002 |
| APP-02 | Depósitos cripto conciliados con aporte PAMM | descartado 2026-11-15 | cambio de enfoque, ver project.md |
| APP-03 | Rendimiento individual reproducible según participación efectiva | descartado 2026-11-15 | cambio de enfoque |
| APP-04 | Seguimiento del horizonte anual y retiro | descartado 2026-11-15 | cambio de enfoque |
| APP-05 | Cursos: catálogo, imágenes, precio USDT, pago por hash ERC-20, descarga | definido | sin implementación |
| APP-07 | Home de mercados con widgets de TradingView (cinta, panorama, calendario, noticias, ganadores, mapa de calor) | en curso | frontend compila; 7 pruebas; los datos propios (CoinGecko/EODHD/Massive) se retiraron a petición del usuario y siguen en el commit 857b672; falta confirmar licencia comercial de TradingView |
| APP-06 | React/Tailwind con mejora de maqueta | en curso | landing de broker visualizada en escritorio y móvil |
| APP-08 | Landing de broker PU Prime: beneficios, fuentes, referido y riesgos | verificado | build frontend; 12 pruebas; revisión visual escritorio y móvil 2026-11-15 |
| APP-09 | Sección Noticias con RSS oficiales y feed de mercados | verificado | local: API Fed/BCE: 30 comunicados y 2 informes propios en español con tasas verificadas; build frontend/backend; 6 pruebas backend; revisión visual escritorio/móvil |

## Handoff activo
Landing PU Prime y sección de noticias implementados localmente. Ver [fuentes de noticias](news-sources.md). Pendientes del producto: cursos/pago ERC-20 y licencia comercial de widgets antes de publicar.

## Evidencia AG-01
2026-09-08: 17 archivos Markdown; cero enlaces locales rotos; ningún archivo de aplicación. Revisión independiente de siete archivos críticos sin hallazgos materiales. Se verificó la separación entre decisiones pendientes e invariantes, la idempotencia y el protocolo de revisión. No se ejecutaron builds ni pruebas de aplicación porque todavía no hay código. Publicación Git se verifica al cerrar la entrega; este registro acredita la documentación, no un despliegue.
