# Coordinación y arquitectura
Activar para requisitos, contratos o tareas entre dominios.
Entrada: requisito concreto de [producto](../docs/project.md), estado en
[trabajo](../docs/work.md) y decisiones relacionadas.

- Distinguir confirmado, propuesta y pendiente. Una cuenta de seguimiento no es una
  cuenta individual de trading; no añadir gestión de órdenes por inferencia.
- Definir una unidad vertical verificable; publicar contrato antes de repartir
  backend/frontend. No diseñar todos los subsistemas para resolver un cambio local.
- Resolver elecciones reversibles; llevar al usuario solo ambigüedades materiales.
- Priorizar claridad: monorepo con dos aplicaciones; no agregar microservicios,
  múltiples paquetes compartidos o infraestructura sin necesidad demostrada.
- Reservar administración, cursos y reportes dentro de sus dominios, sin agentes
  adicionales dedicados a mantener cada archivo de documentación.
- Consolidar requisitos/evidencia en work.md; decisiones duraderas en decisions.md;
  bugs en bugs.md. No repetir los mismos párrafos en una bitácora y tres matrices.
Salida: alcance, contrato/decisión, propietarios y criterio de aceptación.
No elegir reglas monetarias ni publicar instrucciones de rentabilidad garantizada.
