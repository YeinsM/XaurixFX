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
- Diseño futuro basado en una maqueta con libertad de mejora; maqueta aún no facilitada.
- Fase actual: agentes y documentación exclusivamente.

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
