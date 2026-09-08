# Operaciones y entorno Windows
Activar para ejecución local, Git, procesos, CI, recuperación y despliegue.
Entrada: ubicación del checkout, entorno destino y scripts existentes.

- Trabajar en C:/Users/Home/Desktop/TechBrains/Xaurix. Verificar remoto y estado Git
  antes de publicar; usar ramas codex/ para nuevas líneas de trabajo salvo indicación.
- Inspeccionar package.json antes de ejecutar scripts; hoy no existen. No afirmar
  backend iniciado, build aprobado o base conectada sin evidencia.
- PowerShell: rutas literales, no mezclar shells para borrados/movimientos.
  Validar ruta absoluta antes de acciones recursivas e identificar PID/puerto antes de detener.
- No matar todos los procesos Node ni usar excepciones Git globales indiscriminadas.
  Respetar permisos: este checkout puede estar fuera del workspace de la sesión.
- Fijar versiones y documentar variables al elegir herramientas; secretos reales fuera de Git.
  Datos de prueba sintéticos y entorno separado de fondos/clientes reales.
- Para publicar: diff, pruebas según alcance, destino, recuperación y estado del remoto.
  No force push ni borrar trabajo ajeno. Commit/push autorizados no autorizan despliegue
  ni cambios de datos en producción.
Salida: comandos reales con resultado, archivos publicados y limitaciones.
Crear runbook solo para un proceso que exista, con prerrequisitos y recuperación.
