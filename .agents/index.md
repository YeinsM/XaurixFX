# Router de agentes

Un perfil es una instrucción especializada que puede adoptar el agente principal o
recibir un subagente. Estos Markdown no registran agentes nativos automáticamente.

| Cambio | Perfil principal | Añadir cuando corresponda |
|---|---|---|
| Alcance, contratos, decisiones | [coordinator](coordinator.md) | dueño del dominio |
| API y reglas backend | [backend-node](backend-node.md) | seguridad si permisos; PAMM si dinero |
| Pantallas, cursos, análisis, redes | [frontend-react](frontend-react.md) | backend si contrato cambia |
| Esquema, consultas, migraciones | [database-postgres](database-postgres.md) | PAMM si datos monetarios |
| Saldos, reparto, valoración, retiros | [pamm-ledger](pamm-ledger.md) | backend + database según archivos |
| Depósitos, eventos externos, sincronización | [crypto-integrations](crypto-integrations.md) | PAMM + seguridad |
| Login, aislamiento, permisos, contenido privado | [security](security.md) | dueño del dominio |
| Bug, pruebas, revisión | [qa-regression](qa-regression.md) | dueño del dominio |
| Local Windows, CI, publicación, recuperación | [operations](operations.md) | database si migración |

## Protocolo económico
1. Identifica resultado, criterio de aceptación y archivos necesarios. Busca con rg;
   lee fragmentos relevantes y amplía si las dependencias lo requieren.
2. Una tarea pequeña la resuelve un agente. Para trabajo independiente, delega solo
   si evita investigación duplicada o aporta revisión especializada.
3. Presupuesto inicial de concurrencia: coordinador + hasta dos subagentes; reducir
   si el entorno ofrece menos. No es obligación llenar plazas. Sin delegación recursiva
   por defecto; el coordinador asigna archivos sin solapamientos.
4. Paquete: objetivo, requisito, alcance de escritura, entradas concretas, contrato,
   restricciones, aceptación y comprobaciones. No copiar conversación completa si bastan
   esos datos. El receptor lee AGENTS.md y su perfil, sin explorar áreas ajenas.
5. Entrega: resultado, archivos, pruebas/resultados, riesgos y decisiones pendientes.
   Preferir hasta 200 palabras salvo evidencia necesaria. No pedir razonamiento interno.
6. Cambios de dinero o aislamiento requieren revisión independiente del diff por QA
   con el perfil especializado pertinente. Puede hacerse después del autor; no necesita
   ejecutar todas las pruebas por segunda vez. Si no hay subagentes, registrar revisión
   independiente pendiente y no afirmar que ocurrió.
7. Solo el coordinador integra, modifica registros compartidos y hace commit/push.
   Los demás devuelven las entradas propuestas. Verificar cambios ajenos antes de integrar.

## Contexto y recursos
Conservar el modelo y esfuerzo efectivos de la sesión salvo autorización/configuración
explícita; un archivo Markdown no cambia parámetros del runtime. No degradar revisión
monetaria para cumplir una cuota. Evitar respuestas, búsquedas y pruebas repetidas.
Tras un fallo, usar su evidencia para el siguiente intento; dos intentos iguales sin
información nueva obligan a cambiar diagnóstico o explicar el bloqueo.
Al relevar una tarea larga, guardar en docs/work.md solo estado, decisión, archivos,
evidencia y siguiente paso. No guardar chats completos ni datos de clientes.
