// Public starter content: text lessons only, with no playback or enrollment claims.
export const content = {
  courses: [
    {
      id: 'fundamentos', title: 'Tu punto de partida en inversión', category: 'Fundamentos', level: 'Inicial', duration: '12 min', lessons: 3, accent: 'emerald',
      description: 'Capital, resultados y horizonte: aprende a leer tu cuenta con contexto.',
      body: [
        'Lección 1 · Capital y saldo. El capital aportado recoge los aportes que corresponden a tu cuenta según la política contable aplicable. El saldo es una valoración en una fecha concreta. No son sinónimos: un cambio de saldo puede responder a un aporte, un retiro, resultados o comisiones. Antes de comparar cifras, identifica qué conceptos incluye cada una.',
        'Lección 2 · Resultados y porcentajes. Un resultado expresado en dinero y una rentabilidad porcentual contestan preguntas diferentes. En un ejemplo sencillo sin movimientos, pasar de 1,000 a 1,050 representa una diferencia de 50 y un 5% sobre el importe inicial. Si hubo aportes durante el período, esa división deja de ser una comparación suficiente; hace falta conocer las fechas y la metodología.',
        'Lección 3 · Tu horizonte. Anota para qué sirve el dinero, cuándo podrías necesitarlo y qué información necesitas para evaluar el producto. Una fecha objetivo es una referencia de planificación; sus condiciones dependen del contrato y del proceso de retiro. En esta versión de XaurixFX las operaciones financieras aún no están habilitadas.',
      ],
    },
    {
      id: 'riesgo', title: 'Cómo leer el riesgo', category: 'Gestión del riesgo', level: 'Inicial', duration: '10 min', lessons: 3, accent: 'violet',
      description: 'Entiende variaciones, caídas y por qué una gráfica no cuenta toda la historia.',
      body: [
        'Lección 1 · Variación. Dos recorridos pueden terminar en el mismo saldo y tener fluctuaciones muy diferentes. Al revisar un gráfico, observa la escala, las fechas y si los puntos representan cierres diarios, mensuales o valores estimados. Un intervalo más corto puede ocultar parte del recorrido.',
        'Lección 2 · Caídas desde un máximo. Si un ejemplo pasa de 1,000 a 900, la caída es del 10%. Para volver de 900 a 1,000 hace falta una subida aproximada del 11.11%. Los porcentajes utilizan bases distintas. Esto ayuda a interpretar una recuperación sin confundirla con la caída anterior.',
        'Lección 3 · Preguntas útiles. Comprueba la fuente de los datos, la frecuencia de valoración, el tratamiento de comisiones y las condiciones de disponibilidad. Los ejemplos de este curso son ejercicios aritméticos, no previsiones. Una serie histórica o simulada no define por sí sola el resultado futuro.',
      ],
    },
    {
      id: 'participacion', title: 'Entiende una cuenta de seguimiento', category: 'Tu cuenta', level: 'Inicial', duration: '8 min', lessons: 3, accent: 'amber',
      description: 'Distingue tu perfil, tu cuenta de seguimiento y los datos de una integración.',
      body: [
        'Lección 1 · Perfil y cuenta. El perfil guarda los datos de acceso. La cuenta de seguimiento presenta información atribuida a ese usuario; no equivale a una cuenta individual de trading. XaurixFX crea una cuenta de seguimiento en cero con cada registro y permite editar el nombre desde el perfil.',
        'Lección 2 · Participación. Una participación describe una fracción de un conjunto en un momento definido. Su cálculo necesita reglas sobre aportes, retiros, valoración y comisiones. Esas decisiones todavía están pendientes en esta plataforma; por eso una cuenta nueva no muestra un porcentaje inventado.',
        'Lección 3 · Reconoce la demostración. El panel de ejemplo contiene importes y movimientos ficticios, identificados como demostrativos. Sirve para explorar la interfaz. Los registros reales no heredan esos importes y no pueden depositar ni retirar hasta que las integraciones y sus reglas estén definidas.',
      ],
    },
  ],
};
