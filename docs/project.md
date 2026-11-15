# Contrato inicial del producto

## Confirmado por el usuario — 2026-09-08
- Monorepo YeinsM/XaurixFX; desarrollo y pruebas en su máquina.
- backend/ Node.js; frontend/ React + Tailwind; PostgreSQL.
- Plataforma para múltiples clientes. Cada persona registrada podrá crear una cuenta
  para seguir inversiones; no es su propia cuenta de trading.
- Depósitos a una dirección cripto; los fondos se agrupan en una cuenta PAMM.
- Cada cliente ve resultados correspondientes a su capital/participación en el conjunto.
- Horizonte de largo plazo con fecha tentativa de retiro a un año.
- Área de cursos, análisis, contenido y enlaces a redes sociales.
- Diseño futuro basado en una maqueta con libertad de mejora; maqueta facilitada el 2026-09-08: negro/dorado; logo provisional.
- Fase actual: primera implementación local autorizada; demostración confirmada por el usuario hasta definir PAMM y cripto.

## Decisiones que deben resolverse antes del módulo dependiente
| ID | Decisión | Afecta |
|---|---|---|
| D01 | ¿Multicliente solo inversores o también organizaciones separadas? | aislamiento |
| D02 | Identidad por persona, creación/cierre de su única cuenta y verificación | registro |
| D03 | Fuente PAMM, broker/API/importación y frecuencia de datos | integración |
| D04 | Método de participación, instante efectivo del aporte, valoración y resultados abiertos | cálculo |
| D05 | Comisiones, divisa base, conversiones, precisión y redondeo | contabilidad |
| D06 | Activo/red, proveedor, dirección compartida/individual y atribución | depósitos |
| D07 | Un año por cuenta o aporte; fecha inicial; retiros anticipados/parciales y proceso | retiros |
| D08 | Roles administrativos y facultades de ajustes/aprobaciones | administración |
| D09 | Cursos públicos/privados, publicación y alojamiento; compra no solicitada | contenido |
| D10 | Maqueta y prioridades visuales | diseño |
| D11 | Framework Node, lenguaje, bundler, ORM y versiones | inicio técnico |

No interpretar estas preguntas como requisitos ya aprobados. El coordinador solicita
cada decisión cuando haga falta; no exige resolverlas todas para avanzar documentación.
D11 admite propuesta técnica razonada; decisiones de dinero requieren respuesta de negocio.

## Cambio de enfoque — 2026-11-15 (confirmado por el usuario)
Landing de la empresa XaurixFX. Se descarta PAMM, depósitos a plataforma, saldos y retiros;
D02–D08 dejan de aplicar. Producto: login; catálogo de cursos (imágenes de presentación,
precio en USDT, actualizar/eliminar/recargar, marcar gratuitos); pago en USDT por Ethereum
(ERC-20) a una billetera: el usuario envía el hash, el sistema lo verifica y habilita la
descarga; lo comprado no vuelve a aparecer como compra pendiente, pero puede recomprarse.
Home: blog de noticias de todos los mercados, estilo es.investing.com/markets, con activos
configurables por usuario. Noticias: RSS externos + editorial propia. Datos de mercado: demo con
CoinGecko, EODHD y Massive (planes gratuitos); llamadas diarias repartidas en turnos sobre 24 h
(fin de día tras el cierre) y última cotización guardada en PostgreSQL.
Pendientes: dirección de billetera, confirmaciones de bloque (propuesta: 12), licencia de
redistribución de datos antes de publicar (los planes gratuitos son de uso personal),
almacenamiento de archivos para Vercel (propuesta: Cloudflare R2).

Actualización 2026-11-15: se eliminaron el panel PAMM, la demo, los análisis de ejemplo y la caché de datos propios de mercado (CoinGecko/EODHD/Massive); el home usa solo widgets de TradingView. El código eliminado está en el commit 857b672.

Actualización 2026-11-15: se añadió una sección Noticias independiente. Los comunicados oficiales de la Fed y del BCE se consultan automáticamente por RSS; el flujo general de mercados sigue en TradingView. Los artículos completos de terceros requieren licencia o redacción propia. Ver docs/news-sources.md.
