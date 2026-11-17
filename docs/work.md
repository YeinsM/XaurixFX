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
| APP-07 | Home de mercados con widgets de TradingView (cinta, panorama, calendario, noticias, ganadores, mapa de calor) | en curso | frontend compila; 7 pruebas; los datos propios (CoinGecko/EODHD/Massive) se retiraron a petición del usuario y siguen en el commit 857b672; falta confirmar licencia comercial de TradingView. 2026-11-15: Mercados vuelve a su diseño anterior; la dirección "Terminal" pasa a la nueva página Inicio (landing de XaurixFX, paleta dorada de la app, velas en verde/rojo). Hero "Terminal" elegido por el usuario entre 5 demos (frontend/demo/): fondo de velas ilustrativas en canvas, titular tipeado, módulos; `tsc`, 18 pruebas, build y revisión en navegador OK; sin probar en móvil. Error "Script error" cruzado de origen al remontar widgets, atribuible al script de TradingView |
| APP-06 | React/Tailwind con mejora de maqueta | en curso | landing de broker visualizada en escritorio y móvil |
| APP-08 | Landing de broker PU Prime: beneficios, fuentes, referido y riesgos | verificado | build frontend; 12 pruebas; revisión visual escritorio y móvil 2026-11-15 |
| APP-09 | Sección Noticias con RSS oficiales, traducción y feed de mercados | verificado | API Fed/BCE: 30 comunicados; títulos y extractos automáticos en español con acceso al original; build frontend/backend; 6 pruebas backend |
| APP-10 | Apartado público de análisis técnico diario de XAUUSD, basado en datos verificables, persistencia PostgreSQL e historial | en curso | 37 pruebas backend y 22 frontend, builds de ambos paquetes; informe con respuesta API simulada visualizado en navegador a 390 y 1440 px; corrección responsive documentada en [BUG-002](bugs.md#bug-002). Estado API-error verificado sin backend. La integración PostgreSQL y la lectura de datos reales en navegador no se verificaron: falta TEST_DATABASE_URL descartable válida y backend disponible. |

## Handoff activo
Landing PU Prime, sección de noticias y apartado de análisis diario están implementados localmente. Ver [fuentes de noticias](news-sources.md) y el estado de integración de análisis en APP-10. Pendientes del producto: cursos/pago ERC-20 y licencia comercial de widgets antes de publicar.

## Evidencia AG-01
2026-09-08: 17 archivos Markdown; cero enlaces locales rotos; ningún archivo de aplicación. Revisión independiente de siete archivos críticos sin hallazgos materiales. Se verificó la separación entre decisiones pendientes e invariantes, la idempotencia y el protocolo de revisión. No se ejecutaron builds ni pruebas de aplicación porque todavía no hay código. Publicación Git se verifica al cerrar la entrega; este registro acredita la documentación, no un despliegue.
