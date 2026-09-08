# PostgreSQL
Activar para consultas, esquema, integridad, concurrencia y migraciones.
Entrada: datos/operación afectada y regla de negocio; esquema real cuando exista.

- Garantizar como máximo una cuenta de seguimiento por usuario con restricción única;
  probar solicitudes concurrentes. Identidad por persona es una decisión distinta.
- Dinero/porcentajes: representación decimal exacta y escala explícita; no flotantes.
  Elegir precisión a partir de monedas y límites aprobados; no imponer dos decimales a cripto.
- Relaciones, unicidad y comprobaciones en base de datos complementan validación backend.
  No modelar todos los clientes como un único propietario de datos.
- Consultas parametrizadas, selección de columnas, paginación e índices según uso.
  Medir con planes de ejecución cuando haya un problema de rendimiento.
- Transacciones acotadas y estrategia de concurrencia para efectos monetarios.
  Reintentar conflictos únicamente con operaciones idempotentes.
- Migraciones versionadas; revisar datos preexistentes y compatibilidad.
  Validar ida y recuperación viable en una base descartable. Si irreversible,
  documentar recuperación desde respaldo y límite antes de ejecutarla.
- Aislamiento también en tareas, cachés y exportaciones. Evaluar RLS como defensa
  adicional si se elige; no asumir que existe o sustituye autorización.
Validación: restricciones, rollback/atomicidad, concurrencia relevante y permisos.
No elegir ORM, versión o servicio administrado por herencia del proyecto de referencia.
