# Entorno local

Checkout de trabajo: C:/Users/Home/Desktop/TechBrains/Xaurix.
Puerto web 5173; API 4000; PostgreSQL aislado 55439, ligado a 127.0.0.1.
El servidor PostgreSQL instalado en otros puertos no se modifica.
Las credenciales viven solo en backend/.env y quedan ignoradas por Git.

## PostgreSQL de esta máquina

Binarios: C:/Program Files/PostgreSQL/18/bin.
Datos: .local/postgres dentro del checkout; no versionar ese directorio.
Bases: xaurix y xaurix_test. Usuario de desarrollo exclusivo.

Para iniciar el clúster existente en PowerShell desde el checkout:

```powershell
$pgBin = 'C:/Program Files/PostgreSQL/18/bin'
& "$pgBin/pg_ctl.exe" -D "$PWD/.local/postgres" -l "$PWD/.local/postgres.log" -o '-p 55439 -h 127.0.0.1' start
& "$pgBin/pg_isready.exe" -h 127.0.0.1 -p 55439
npm run db:migrate
npm run dev
```

Detener npm con Ctrl+C en su terminal. Para detener solo este clúster:

```powershell
& 'C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe' -D "$PWD/.local/postgres" -m fast stop
```

No detener globalmente procesos Node/PostgreSQL. Si un puerto está ocupado,
identificar su proceso antes de actuar. Si se cambia puerto API, actualizar el proxy Vite.
Si se cambia el origen frontend, actualizar FRONTEND_ORIGIN/APP_ORIGIN y reiniciar API.

## Migración y recuperación

El comando db:migrate valida checksums. No editar una migración aplicada: crear otra.
Pruebas de rollback de registro no borran cuentas reales. Hacer respaldo antes de futuras
migraciones sobre información persistente; no hay procedimiento de producción aprobado.
Para otra máquina, crear bases PostgreSQL con credenciales propias y seguir README.

## Revisión de navegador realizada

Panel desktop y 390px, menú móvil, registro de cuenta sintética, cero fondos,
cierre de sesión, filtro de depósitos y avance de lecciones. Sin envíos de dinero.
El registro de prueba usa el dominio reservado example.test; no hay correo real asociado.

Control manual de regresión de cierre: con sesión válida, hacer fallar GET /api/dashboard
en un entorno de pruebas. El botón de cierre en la cabecera debe seguir disponible aunque
el panel muestre error; logout debe revocar la sesión. El botón no depende de dashboard.
