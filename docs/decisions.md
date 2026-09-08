# Decisiones duraderas

## ADR-001 — Perfiles selectivos — 2026-09-08
Estado: adoptado para esta entrega documental, dentro del encargo del usuario.
Alternativas: un perfil general consume poco arranque pero mezcla responsabilidades;
un equipo permanente multiplica contexto y coordinación; perfiles por tarea separan
responsabilidades y permiten cargar solo lo necesario.
Elección: nueve perfiles invocables, un router, concurrencia inicial máxima de tres.
Contabilidad e integraciones tienen reglas distintas; documentación y changelog se
integran en coordinación en vez de crear agentes adicionales.
La concurrencia es un límite operativo propuesto, no una recomendación oficial numérica.
No se instala un runtime, configuración de modelo ni agentes permanentes.

## ADR-002 — Memoria con evidencia — 2026-09-08
Estado: adoptado para esta entrega documental.
Un registro de bugs enlaza prevención verificable; work.md concentra estado/evidencia.
Evitar múltiples bitácoras para un mismo hecho. Ampliar detalle solo cuando un caso lo requiera.
Sin comprometer la cobertura monetaria para ahorrar tokens.

## ADR-003 — Límites de producto — 2026-09-08
Estado: confirmado por el usuario para stack y separación; reglas pendientes en project.md.
No trasladar MongoDB, Prisma, MUI, módulos ni proveedores del torneo.
La fase de código se iniciará en un encargo posterior.
