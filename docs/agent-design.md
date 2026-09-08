# Diseño y evaluación de los agentes

## Fuentes consultadas — 2026-09-08
- [Guía GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra).
- [Instrucciones AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
- Referencia local leída: C:/Users/Home/Desktop/torneoBMCnuevo/torneoBMCnuevo/agents.
  Se revisaron sus once perfiles/router; no se copiaron módulos ni reglas de negocio.

## Aplicación de la guía
La guía recomienda instrucciones claras sobre autonomía, delegación y verificación
proporcionada, y revisar conflictos en archivos de instrucciones. Aquí se concreta en
un router, encargos acotados, salidas breves y revisión según impacto.
AGENTS.md sirve como entrada; los perfiles se leen cuando el router los indica.
Las capacidades API no se activan mediante documentos Markdown. Esta entrega no cambia
modelo, razonamiento, caché, llamadas asíncronas ni configuración de Codex.

## Decisiones propias para XaurixFX
Elegir perfiles selectivos frente a un agente general o equipo permanente; detalles en
[decisiones](decisions.md). Nueve responsabilidades no implican nueve ejecuciones.
La revisión especializada se reserva para los cambios que la necesitan.
No se garantiza un número mínimo de tokens ni ausencia absoluta de errores.

## Evaluación práctica futura
Comparar tareas similares: cambio de texto, contrato API, depósito duplicado y corrección
de reparto. Registrar solo al evaluar una mejora de instrucciones:
tarea, perfiles, archivos leídos, llamadas, tokens si el runtime los expone,
tiempo, fallos/reaperturas y aceptación. Si no hay tokens observables, marcar no disponible;
cantidad de palabras o archivos es un indicador de contexto, no tokenización exacta.
Adoptar una optimización solo si conserva criterios de aceptación y controles críticos.
No fijar porcentajes de ahorro antes de tener una línea base.

## Revisión documental
Verificar enlaces locales, ausencia de proveedores heredados como decisiones,
reglas no contradictorias y distinción entre pendiente/implementado.
Una revisión conceptual especializada se realizó durante la preparación.
La validación de los archivos finales se registra en [trabajo](work.md).
