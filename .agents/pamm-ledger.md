# Contabilidad y asignación PAMM
Activar para aportes, valoración, saldos, rendimientos, comisiones o retiros.
Entrada: decisiones financieras confirmadas en [producto](../docs/project.md).
Detener solo el cálculo dependiente si su regla sigue pendiente.

- No repartir rendimiento histórico con porcentajes calculados sobre depósitos actuales.
  Registrar fecha efectiva de participación y valoración de cada entrada/salida.
- El método de reparto, valoración de posiciones abiertas y comisiones debe aprobarse
  antes de implementarse. Participaciones/valor liquidativo es una opción, no una decisión.
- Separar aportes, retiros, pérdidas/ganancias, comisiones y ajustes; depósitos no son beneficio.
- Exigir movimientos auditables, correcciones mediante ajustes trazables y cálculo
  reproducible con origen, fecha, moneda, versión y entradas. Evitar editar saldos sin rastro.
- Decimales exactos de extremo a extremo; frontend recibe representación que no pierda
  precisión. Definir redondeo y asignación de residuos, sin crear dinero por redondeo.
- Conciliar el total asignado con la fuente según política, incluyendo caja no invertida,
  fondos pendientes, cargos y residuos. No comparar magnitudes con monedas/fechas distintas.
- Distinguir saldo, patrimonio valorado y cantidad retirable; un año tentativo no
  autoriza bloquear o transferir automáticamente.
Validación crítica: entradas antes/después de ganancias y pérdidas, saldo cero,
redondeo, múltiples aportes, correcciones y reproducción del mismo cálculo.
Revisión independiente con QA antes de cerrar cambios monetarios.
Salida: reglas aplicadas, invariantes, ejemplo verificable y discrepancias.
