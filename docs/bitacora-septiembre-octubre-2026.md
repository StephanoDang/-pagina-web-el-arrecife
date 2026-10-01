# Bitácora diaria — El Arrecife

Plan de 12 jornadas de 6 horas, del martes 29 de septiembre al jueves 15 de octubre de 2026. Se trabaja de lunes a viernes, excepto el jueves 8 de octubre (feriado). Las 6 horas son una planificación: registra solo las horas que realmente trabajes.

## Dónde quedé

- **Último día completado:** Día 1 — sus cuatro tareas técnicas están terminadas; las horas efectivas siguen pendientes de registrar.
- **Estado actual:** Configuración revisada, plantilla retirada, rutas configuradas y Header/Footer adaptables con navegación visible. La carta y las demás funciones aún son pantallas temporales.
- **Siguiente tarea:** Día 2 — crear la vista de Carta Pública con categorías y tarjetas de platos.
- **Bloqueos:** Faltan la carta y los precios reales, además del logo e identidad visual confirmados por el restaurante.
- **Sincronización con GitHub:** `main` coincide con `origin/main`; la bitácora y el plan están conservados como cambios locales sin commit.

Al cerrar cada jornada, marca lo realizado, llena sus campos de seguimiento y actualiza «Dónde quedé». Haz commits cuando haya cambios reales, sin una cantidad obligatoria por día.

## Rutina prevista para cada jornada (6 horas)

1. **Hora 1:** revisar la tarea y preparar el trabajo.
2. **Horas 2 a 4:** programar la funcionalidad del día.
3. **Hora 5:** integrar y probar.
4. **Hora 6:** corregir, documentar y registrar los cambios reales en Git.

## Semana 1: Estructura y Cliente (Frontend Público)

### Día 1 — Mar 29 Sep: Configuración y navegación

- [x] Revisar la configuración inicial existente de Vite + React + TypeScript.
- [x] Limpiar archivos y elementos de la plantilla por defecto.
- [x] Configurar React Router.
- [x] Maquetar la barra de navegación (Header) y el Footer.
- **Tiempo planificado:** 6 horas.
- **Horas efectivas:** Pendiente de registrar.
- **Qué quedó funcionando y cómo se probó:** React Router reconoce `/`, `/carta`, `/pedidos` y `/reservas`, además de una ruta de página no encontrada. Header y Footer son visibles y el menú navega a Carta y marca la ruta activa. `npm run lint` y `npm run build` pasaron. Se comprobó la página en 375 px y 1440 px sin desbordamiento horizontal.
- **Observaciones de la revisión:** Las pantallas internas siguen siendo temporales y los colores de Header/Footer son provisionales hasta confirmar la identidad visual. `package-lock.json`, generado al instalar React Router, sigue sin commit.
- **Commits / evidencia:** Revisión `3d061aa`; limpieza `4d7da09`; React Router `c3be45e`. Header/Footer pendientes de commit; mensaje propuesto: `feat: add responsive site header and footer`.
- **Pendientes y punto exacto para continuar:** Crear la Carta Pública del día 2 con categorías y tarjetas de platos; solicitar datos reales al restaurante.

### Día 2 — Mié 30 Sep: Carta Pública

- [ ] Crear la vista «Carta Pública».
- [ ] Crear tarjetas de platos y categorías.
- [ ] Renderizar con datos temporales en JSON, identificados como ejemplos.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

### Día 3 — Jue 01 Oct: Carrito de Compras

- [ ] Configurar un estado compartido con Context API o Zustand.
- [ ] Programar agregar y eliminar platos, y modificar cantidades.
- [ ] Comprobar el resumen y total del carrito.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

### Día 4 — Vie 02 Oct: Registro de Pedido (Checkout)

- [ ] Crear formulario para datos del cliente y resumen de la orden.
- [ ] Crear botón «Confirmar Pedido».
- [ ] Como prototipo, guardar la orden en LocalStorage o mostrarla en consola; indicar que todavía no llega al restaurante.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

## Semana 2: Reservas y Base del Backoffice

### Día 5 — Lun 05 Oct: Reservas de Mesas

- [ ] Crear formulario público de fecha, hora y número de personas.
- [ ] Validar los campos.
- [ ] Guardar reservas de prueba en LocalStorage.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

### Día 6 — Mar 06 Oct: Panel de Administración

- [ ] Maquetar el layout administrativo con barra lateral (Sidebar).
- [ ] Crear una pantalla de Login simulada para el prototipo.
- [ ] Comprobar la navegación entre secciones del panel.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

### Día 7 — Mié 07 Oct: Gestión de Platos (UI)

- [ ] Crear tabla o lista de platos actuales.
- [ ] Maquetar formulario para crear y editar platos.
- [ ] Comprobar la interfaz con datos de ejemplo.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

### Jue 08 Oct — FERIADO

Descanso. Sin jornada ni horas planificadas.

### Día 8 — Vie 09 Oct: Gestión de Platos (Lógica)

- [ ] Conectar el formulario para agregar y editar platos.
- [ ] Actualizar JSON/LocalStorage y reflejar los cambios en la carta pública del mismo navegador.
- [ ] Probar creación y edición de platos.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

## Semana 3: Estados, Integración y Cierre

### Día 9 — Lun 12 Oct: Gestión de Pedidos

- [ ] Crear una tabla o vista Kanban para los pedidos entrantes del prototipo.
- [ ] Añadir controles para cambiar el estado: Pendiente → En preparación → Entregado.
- [ ] Probar el recorrido de un pedido en el mismo navegador.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

### Día 10 — Mar 13 Oct: Gestión de Reservas

- [ ] Crear pantalla administrativa para listar reservas recibidas desde la vista del cliente.
- [ ] Programar confirmación y cancelación de reservas.
- [ ] Probar los cambios de estado en el mismo navegador.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

### Día 11 — Mié 14 Oct: QA (Pruebas)

- [ ] Navegar por toda la web como cliente y como administrador.
- [ ] Corregir errores visuales y enlaces rotos; pulir el diseño para celulares.
- [ ] Ejecutar `npm run lint` y `npm run build` y registrar los resultados.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

### Día 12 — Jue 15 Oct: Cierre del Sprint

- [ ] Actualizar README.md con las funciones realmente terminadas y las instrucciones de instalación.
- [ ] Tomar capturas de pantalla de las partes terminadas para el informe de la UPC.
- [ ] Registrar limitaciones y trabajo pendiente.
- **Horas efectivas:** —
- **Qué quedó funcionando y cómo se probó:** —
- **Commits / evidencia:** —
- **Pendientes y punto exacto para continuar:** —

## Límite de esta versión

Con LocalStorage y una pantalla de Login simulada, este calendario entrega un prototipo que funciona en un mismo navegador. Para recibir pedidos y reservas desde otros dispositivos y administrar la web de manera segura harán falta almacenamiento compartido y autenticación real. Registra esas integraciones como pendientes mientras no estén implementadas y probadas.
