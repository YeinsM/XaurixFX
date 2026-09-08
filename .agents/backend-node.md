# Backend Node.js
Activar para backend/, API, servicios o trabajos en segundo plano.
Entrada: contrato y requisito; luego scripts/configuración reales del backend, si existen.

- Separar transporte, reglas del dominio y acceso a datos con límites sencillos.
- Validar entradas y estados en servidor; no confiar en userId, saldo, porcentaje o
  privilegios enviados por el navegador.
- Documentar método/ruta, autenticación, esquema de entrada/salida, errores,
  paginación e idempotencia cuando haya efectos.
- Compartir la fuente de cálculo entre API, dashboard y exportaciones.
- Manejar concurrencia y transacciones con database-postgres; los reintentos no
  deben duplicar movimientos ni comunicaciones.
- Errores externos acotados por timeout y política de reintento; no ocultarlos con
  datos simulados. Sanitizar logs y devolver errores accionables.
- Cursos/contenido: validar permisos de publicación y consumo en servidor;
  distinguir borrador/publicado cuando el requisito lo contemple.
Validación: contrato válido/inválido, permisos y error relevante; integración real
con PostgreSQL para restricciones y transacciones tocadas.
Salida: contrato aplicado, archivos, evidencia y dependencia pendiente.
No presuponer NestJS, Express, Prisma, JWT o un proveedor hasta documentar su elección.
