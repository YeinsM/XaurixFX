# Primera versión funcional de XaurixFX

**Objetivo:** ejecutar frontend React/Tailwind y backend Node/PostgreSQL en el checkout del usuario, con demo separada de cuentas reales vacías.
**Arquitectura:** npm workspaces, TypeScript, Vite, Fastify y pg con SQL versionado. Sin proveedor PAMM/cripto ni cálculo financiero hasta confirmar reglas. El usuario autorizó continuar con demostración.
**Diseño:** carbón, dorado mate y tipografía Manrope; navegación lateral, resumen patrimonial, gráfico legible, movimientos y formación. Adaptación móvil con controles visibles. Logo tipográfico provisional.

- [ ] Backend: pruebas de registro duplicado, sesión, aislamiento y datos demo; implementación de autenticación, una cuenta atómica por usuario, perfil, dashboard, contenido y disponibilidad de operaciones.
- [ ] Frontend: shell responsive, rutas de panel/inversión/movimientos/academia/análisis/comunidad/ajustes; registro/login y modal de operaciones no disponibles; lectura de lecciones y exportación de movimientos.
- [ ] Integración: API mediante proxy /api; cookies HttpOnly; nuevas cuentas con cero fondos y sin fecha de valoración inventada. Sin fallback demo silencioso.
- [ ] PostgreSQL: base local aislada, migración y suite contra base real, sin tocar instalaciones/datos de otros proyectos.
- [ ] Validar: npm run build, npm test, npm run test:integration y flujo navegador desktop/móvil; revisar permisos de recursos y errores.
- [ ] Documentar comandos y limitaciones, actualizar agentes obsoletos, registrar defectos confirmados, commit/push rama codex/platform-foundation.

Propietarios: agente backend escribe backend/; coordinador frontend y configuración; revisor independiente inspecciona contratos y seguridad. Solo coordinador publica.
Entregables en backend/src, backend/migrations, backend/test, frontend/src/components, frontend/src/lib y docs. Pruebas de presentación en frontend/src/lib/format.test.ts preceden a los helpers. No hay transferencias, retiro automático ni rentabilidad prometida.
