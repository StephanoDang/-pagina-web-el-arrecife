# Pendientes por hacer — El Arrecife

Lista consolidada de asuntos que siguen abiertos en la bitácora al **23/11/2026**, preparada como traspaso de trabajo a Claude Code. Incluye pendientes vigentes de días ya transcurridos, tareas técnicas que aún se pueden resolver en el repositorio y decisiones/materiales que dependen de ti o del restaurante. Los objetivos con fecha futura siguen en el [calendario de la bitácora](bitacora-diaria.md).

## Acciones que dependen de mí o del restaurante

### Supabase y cuentas administrativas

- [ ] Crear o elegir el proyecto Supabase de desarrollo.
- [ ] Configurar localmente `VITE_SUPABASE_URL` y la clave pública (`VITE_SUPABASE_ANON_KEY`) en `.env.local`. No enviar ni publicar claves `service_role`.
- [ ] Crear o invitar la cuenta del personal y asignar `app_metadata.role = "admin"` desde Supabase o un proceso de confianza; este rol no se debe asignar desde la web pública.
- [ ] Confirmar que existe un entorno de pruebas separado de datos reales antes de aplicar migraciones.

### Confirmaciones y material del restaurante

- [ ] Entregar el logo y las fotografías de platos/locales en calidad utilizable, e indicar cuáles tienen permiso para publicarse.
- [ ] Confirmar la regla para recargos de bebidas cuando coinciden fechas o promociones. La nota informativa está registrada, pero el cálculo automático sigue desactivado.
- [ ] Confirmar la tasa de IGV solo si se necesita mostrar un desglose numérico. Ya está confirmado que los precios publicados incluyen IGV.
- [ ] Confirmar costo, zonas/cobertura y condiciones del delivery. El formulario no suma un costo de entrega que todavía no se ha confirmado.
- [ ] Validar con el restaurante el máximo definitivo de 10 personas por reserva, el aforo de referencia de 120, si aplica por sede o al total, la duración de cada visita y cómo se controla la ocupación simultánea.
- [ ] Confirmar horarios definitivos y excepciones para feriados. Mientras tanto se conserva provisionalmente el horario de 10:00 a 18:00.
- [ ] Aclarar proveedor, cotización y acuerdos para el hosting/despliegue; la bitácora no registra contratación.

### Horas reales

- [ ] Informar las horas efectivamente trabajadas de los días 1–14 y 17–48, que la bitácora aún marca como pendientes de registrar. No usar automáticamente las 5 horas previstas como horas reales.
- [ ] Mantener el 15 y 16/10 en 0 horas de proyecto, tal como se registró por el permiso universitario.
- [ ] Confirmar si las visitas, reuniones y jornadas presenciales tuvieron horas dedicadas al proyecto; no sumarlas como bloques técnicos sin confirmación.

## Trabajo técnico pendiente de días pasados

### Día 46 — Entorno de datos (20/11)

- [ ] Con las credenciales locales, probar la conexión real a Supabase.
- [ ] Aplicar la migración de [esquema y permisos](../supabase/migrations/202611230001_shared_data_and_rls.sql) en desarrollo.
- [ ] Cargar datos de ejemplo para categorías, platos, presentaciones y sedes, sin introducir datos personales reales.

### Día 47 — Autenticación administrativa (21/11)

- [ ] Probar el inicio de sesión de una cuenta con rol `admin`.
- [ ] Confirmar que una cuenta autenticada sin el rol administrativo es rechazada y su sesión se cierra.
- [ ] Confirmar renovación y expiración de sesión contra el proyecto Supabase real.

### Día 48 — Permisos de datos (23/11)

- [ ] Aplicar RLS y verificar como usuario anónimo que no se pueden editar platos ni leer pedidos, líneas de pedido o reservas. *(23/11: verificado localmente sobre PGlite en `tests/supabase-rls.test.mjs`; falta aplicarlo y repetirlo en el proyecto Supabase.)*
- [ ] Verificar que una cuenta administradora sí puede leer/gestionar los datos permitidos. *(23/11: verificado localmente con claims simulados de `app_metadata.role=admin`; falta con una cuenta real.)*
- [x] Implementar una operación de servidor/función para crear pedidos atómicamente, revalidar disponibilidad, precios, cantidades y totales, y evitar envíos duplicados. *(23/11: `public.create_order` en `supabase/migrations/202611230002_catalog_codes_and_order_rpc.sql`; elimina las inserciones públicas directas. Verificada con PGlite: 13 pruebas SQL. Pendiente aplicarla en Supabase y conectarla en `/pedidos`.)*

### Auditoría de la migración (23/11)

- [x] Añadir códigos de catálogo (`code`) para enlazar los ids de texto de `src/data/menu.ts` con las filas UUID.
- [x] Limitar a los administradores a cambiar solo `status`, con transiciones válidas, y dejar las líneas de pedido como historial inmutable.
- [x] Usar la fecha de Lima en la política de reservas y fijar `created_at` en el servidor.
- [ ] Generar el seed de la carta (173 productos, 270 presentaciones, 35 categorías) desde `src/data/menu.ts` y verificarlo con PGlite antes de aplicarlo.
- [ ] `npm audit` informa 12 avisos (3 altos) en dependencias de desarrollo preexistentes (vite, eslint, zod vía eslint-plugin-react-hooks). Revisar y actualizar con aprobación del usuario.
- [ ] Limitación de frecuencia/abuso de envíos públicos (pedidos y reservas): definir al elegir hosting/Edge Functions.

## Pendientes técnicos heredados de otros días

Estos asuntos aparecen en los resultados o siguientes pasos de días anteriores. Siguen vigentes al revisar el código actual; no repetir las tareas ya resueltas que se anotan más abajo.

### Prioridad alta — reemplazar los flujos de demostración

- [ ] **Pedidos (días 13–21, 37–41):** completar el envío del pedido. `/pedidos` hoy valida los datos, calcula el resumen y lo guarda como borrador en el navegador; muestra explícitamente que no se ha enviado al restaurante. Integrarlo con la operación segura de servidor del día 48.
- [ ] **Administración de pedidos (días 36–41):** recibir en el panel pedidos guardados por clientes y conectar detalle, filtros y estados con el servicio. Hoy la lista/estados son una demostración local; los cambios no se comparten entre personas o dispositivos.
- [ ] **Reservas (días 22–26, 42–43):** enviar solicitudes al servicio, no solo guardar un borrador local. Conectar la lista administrativa, confirmación/cancelación y estado con los datos compartidos.
- [ ] **Disponibilidad (días 23–26 y 51):** validar fecha, horario, duración y capacidad del lado servidor; resolver solicitudes simultáneas para impedir sobreventa. No declarar disponibilidad en tiempo real hasta definir las reglas con el restaurante.
- [ ] **Carta administrativa (días 30–35 y 49):** conectar lectura y cambios de platos/presentaciones a Supabase. Actualmente las modificaciones se guardan en LocalStorage y solo se reflejan en este navegador.
- [ ] **Concurrencia, persistencia y recuperación (días 21 y 47):** mostrar estados de carga/error/reintento en operaciones conectadas; evitar confirmaciones falsas si falla la red; comprobar persistencia tras recargar. El control de concurrencia entre operaciones conectadas también forma parte del calendario futuro.

### Prioridad media — experiencia y controles de calidad heredados

- [ ] Revisar el carrito, formularios de pedido/reserva y panel administrativo en anchuras pequeñas, incluidos 320 px, teclado virtual y áreas seguras. Ya hubo pruebas en emulación, pero queda la validación en teléfono físico.
- [ ] Verificar zoom real al 200 %, navegación completa por teclado y lector de pantalla en páginas públicas y administración. Las comprobaciones automatizadas no sustituyen una pasada con lector de pantalla real.
- [ ] Probar selectores nativos de fecha/hora y todos los controles táctiles en un teléfono físico.
- [x] Revisar el favicon: el 404 se confirmó el 23/11 (no había `public/` ni `<link rel="icon">`). `index.html` declara un icono vacío para evitar la petición; reemplazarlo por el logo cuando el restaurante lo entregue.
- [ ] Hacer una pasada integral de errores al recargar y con conexión interrumpida en carta, carrito, pedido, reserva y backoffice después de conectar el almacenamiento compartido.

### Dependencias para cerrar esos pendientes

- Los flujos conectados dependen de credenciales locales, migración, seed y rol administrativo descritos arriba.
- El envío de delivery y el cálculo de tarifas dependen de la cobertura, condiciones y costo confirmados por el restaurante.
- El envío de reservas/validación de capacidad depende de horarios y feriados definitivos, duración de turnos, aforo aplicable por sede y reglas de ocupación simultánea.
- La publicación de fotografías y marca depende de recibir los archivos y confirmar permisos.
- Los recargos de bebidas y desglose numérico del IGV requieren las reglas/tasa aún no confirmadas.

## Guía de continuidad para Claude Code

- Usar este archivo junto con [la bitácora](bitacora-diaria.md), [el diseño de datos](diseno-datos-compartidos.md), [la configuración de Supabase](supabase.md) y los resultados de QA en `docs/qa/`.
- Antes de implementar, revisar el código actual y confirmar que la casilla no haya quedado resuelta por un commit posterior. La bitácora tiene notas antiguas que pueden estar desactualizadas.
- No inventar reglas de negocio ni datos. Mantener como borradores locales los pedidos/reservas hasta conectar un backend confiable; no presentar una solicitud como enviada o confirmada si el servicio no la aceptó.
- No poner credenciales reales ni `service_role` en Git o variables `VITE_*`. La autenticación administrativa exige `app_metadata.role = "admin"`; ocultar rutas en React no sustituye RLS.
- Al hacer cambios, registrar en la bitácora el resultado, la evidencia y lo que quede pendiente. Los comandos disponibles son `npm test`, `npm run lint` y `npm run build`.
- Crear y publicar commits desde la cuenta del usuario, con mensajes de una oración en inglés, según la rutina registrada en la bitácora.

## Aclaraciones de estado

- **Día 44 (18/11):** los filtros por día y estado sí aparecen en el código y en el commit `9ed2169` (`feat: add admin reservation filters and shared data design`). El estado “pendiente de commit” de la bitácora quedó desactualizado; las pruebas de filtros están en `tests/admin-reservations.test.mjs`.
- **Menú completo:** la carga inicial y categorías vacías que aparecen como pendientes antiguos quedaron resueltas al completar el menú en el día 6. No se repiten aquí.
- **Carrito:** controles de agregar, cantidades, eliminación, totales y almacenamiento local ya existen. Las notas antiguas que pedían implementarlos son obsoletas; quedan las pruebas físicas/de integración listadas arriba.
- **Interfaz administrativa:** layout, gestión local de platos, tablas, filtros, estados de ejemplo y gestión de reservas ya están implementados. El pendiente es sustituir los datos/estados locales por operaciones conectadas, no rehacer las pantallas.
- **Autenticación:** el login real ya está integrado localmente y el rol se valida desde `app_metadata`; lo pendiente es probarlo con credenciales y proyecto reales.
- **RLS:** las políticas están definidas en dos migraciones y verificadas localmente con PGlite (23/11), pero no aplicadas ni verificadas contra un proyecto Supabase conectado.
- **No se incluyen los objetivos de los días 49 en adelante:** siguen en la sección futura del calendario y no son atrasos de días ya transcurridos.
