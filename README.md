# XaurixFX

Primera versión local de la plataforma de seguimiento de inversiones: **React + Tailwind**, **Node.js/Fastify** y **PostgreSQL**, con TypeScript y npm workspaces.

## Iniciar

Requisitos: Node >=22.14, npm y Docker Desktop con contenedores Linux. Desde la raíz:

```powershell
npm ci
docker compose up -d --wait postgres
if (!(Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
npm run db:migrate
npm run dev
```

Si `backend/.env` ya existe y apunta a otra instancia, actualiza `DATABASE_URL` y `TEST_DATABASE_URL` usando `backend/.env.example` como referencia **antes** de migrar, para conservar las demás variables. Docker escucha solo en `127.0.0.1:55440`. Si el backend ya estaba corriendo, reinícialo para cargar las nuevas URL.
Frontend: http://localhost:5173. Backend: http://127.0.0.1:4000/api/health.
Usar localhost para abrir el frontend: debe coincidir con FRONTEND_ORIGIN/APP_ORIGIN.
Vite envía /api al backend. El frontend no contiene credenciales de PostgreSQL.

## Incluido

- Panel negro/dorado adaptable a móvil, con navegación y logo de Xaurix FX.
- Home pública de mercados con widgets de TradingView (cinta, panorama, calendario, noticias, ganadores, mapa de calor).
- Registro, inicio/cierre de sesión y edición del nombre.
- Sesiones HttpOnly revocables; contraseñas scrypt; SQL parametrizado y registro atómico.
- Tres guías de ejemplo con lecciones de lectura, a reemplazar por el módulo de cursos.
- Migraciones versionadas y pruebas de integración sobre esquemas aislados de PostgreSQL real.

## Límites de esta versión

Alcance vigente (2026-11-15): landing de cursos con pago en USDT (ERC-20) por hash; ver docs/project.md. Sin saldos, depósitos a plataforma ni retiros. Pendientes: catálogo de cursos, verificación de pagos, noticias propias y confirmar la licencia comercial de TradingView.

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
- backend/src: autenticación, consultas, configuración y contenido.
- backend/migrations: SQL versionado, aplicado con checksum y bloqueo de migración.
- .agents: perfiles de desarrollo; [AGENTS.md](AGENTS.md) es su entrada.
- [docs/local-development.md](docs/local-development.md): entorno y operación local.
- [docs/work.md](docs/work.md): aceptación y evidencia.

Repositorio: https://github.com/YeinsM/XaurixFX
