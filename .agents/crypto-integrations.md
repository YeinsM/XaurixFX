# Cripto y fuentes externas
Activar para depósitos, blockchain, webhooks o importación PAMM.
Entrada: proveedor/red/activo elegidos y contrato externo verificado en documentación oficial.

- Separar evento detectado, confirmación, conciliación y acreditación. Una captura
  o hash introducido por el usuario no prueba por sí solo un depósito válido.
- Validar red, activo/contrato, destinatario, importe y finalización según la red elegida.
  Definir tratamiento de reorganizaciones y correcciones antes de acreditar.
- Identificar cada transferencia con clave adecuada a la red (un hash puede incluir
  varias transferencias). Garantizar acreditación única en base de datos y transacción.
- Atribuir mediante mecanismo confirmado; no asumir que dirección remitente identifica
  al cliente ni que cada usuario tendrá billetera propia.
- Verificar autenticidad de eventos según proveedor. Soportar repetidos, retrasados,
  fuera de orden y caídas parciales; conservar referencias para reconciliación.
- Separar depósito cripto del ingreso efectivo en PAMM; documentar conciliación entre
  ambos y cualquier conversión sin suponer equivalencia 1:1 de activos.
- Importar datos PAMM con permisos mínimos y procedencia; no inferir permiso para operar.
  Marcar fuente atrasada/incompleta y evitar publicar cálculos como definitivos.
Validación: duplicado, evento inválido, reordenado, rollback y recuperación.
Salida: contrato, estados, claves de idempotencia y evidencia.
No custodiar semillas, firmar transferencias ni elegir proveedor en esta fase.
