# XaurixFX

Primera versión local de la plataforma de seguimiento de inversiones: **React + Tailwind**, **Node.js/Fastify** y **PostgreSQL**, con TypeScript y npm workspaces.

## Iniciar

Requisitos: Node >=22.14, npm y PostgreSQL (validado con 18.1). Desde la raíz:

```powershell
npm ci
Copy-Item backend/.env.example backend/.env
# Configurar DATABASE_URL y TEST_DATABASE_URL con bases propias de desarrollo.
npm run db:migrate
npm run dev
```

No reemplazar un .env existente. En esta máquina ya está configurado (ignorado por Git).
Frontend: http://localhost:5173. Backend: http://127.0.0.1:4000/api/health.
Usar localhost para abrir el frontend: debe coincidir con FRONTEND_ORIGIN/APP_ORIGIN.
Vite envía /api al backend. El frontend no contiene credenciales de PostgreSQL.

## Incluido

- Panel negro/dorado adaptable a móvil, con navegación y logo tipográfico provisional.
- Demo pública separada de las cuentas de usuario; gráfico porcentual y movimientos ilustrativos.
- Registro, inicio/cierre de sesión, edición del nombre y cuenta única por usuario.
- Sesiones HttpOnly revocables; contraseñas scrypt; SQL parametrizado y registro atómico.
- Filtros de movimientos y exportación CSV; precisión decimal conservada antes de presentación.
- Tres guías con lecciones de lectura y tres artículos educativos de ejemplo.
- Migraciones versionadas y pruebas de integración sobre esquemas aislados de PostgreSQL real.

## Límites de esta versión

El usuario confirmó demostración hasta elegir integraciones. Depósitos/retiros están
desactivados tanto en interfaz como en API: no hay direcciones receptoras ni operaciones
PAMM reales. Las cuentas registradas empiezan en cero, sin valoraciones simuladas.
Faltan decisiones de comisiones, valoración/reparto, red cripto y condiciones de retiro.
El año es un horizonte orientativo, no un bloqueo o vencimiento automático.

La academia contiene lectura inicial estática; no hay alojamiento/subida de vídeos,
CMS administrativo, recuperación de contraseña, verificación de correo ni despliegue
productivo. Los canales sociales todavía no tienen enlaces oficiales. No se afirma
que Xaurix sea un broker registrado. Esta versión es una base de desarrollo local.

## Verificación

```powershell
npm run build
npm test
npm run test:integration
```

La suite de integración exige TEST_DATABASE_URL y crea/elimina únicamente su esquema
de prueba aleatorio. No apuntar estas variables a bases con datos de clientes.
Build no prueba corrección financiera ni habilita producción.

## Estructura

- frontend/src: componentes, navegación, contratos y presentación.
- backend/src: autenticación, consultas, configuración, demo y contenido.
- backend/migrations: SQL versionado, aplicado con checksum y bloqueo de migración.
- .agents: perfiles de desarrollo; [AGENTS.md](AGENTS.md) es su entrada.
- [docs/local-development.md](docs/local-development.md): entorno y operación local.
- [docs/work.md](docs/work.md): aceptación y evidencia.

Repositorio: https://github.com/YeinsM/XaurixFX
