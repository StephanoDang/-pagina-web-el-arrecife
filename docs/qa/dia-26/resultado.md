# Día 26 — Guardado y vista de reserva

Fecha: miércoles 28/10/2026. Primera tarea de reservas guardada en LocalStorage con identificador, vista resumen y recuperación al recargar.

## Comportamiento

Cada reserva válida se guarda como borrador versionado en `el-arrecife:reservation-draft:v1`, con identificador UUID, fecha de guardado, fecha, hora y número de personas. Al guardar aparece un resumen con esos datos. Al volver a abrir la página, el último borrador válido se recupera de este navegador. Una edición retira el resumen anterior; al guardar de nuevo genera otro identificador y sustituye el borrador local previo.

La interfaz dice claramente que el borrador está en este dispositivo y que el restaurante todavía no lo ha recibido ni confirmado. Si la escritura falla, muestra un error y no presenta el resumen como guardado. Un borrador corrupto no se acepta y su error se informa. Al recuperar se vuelve a comprobar la estructura, el identificador, el límite vigente y el rango de horario. Se conserva la fecha histórica guardada sin tratarla como una nueva visita.

## Verificación

- `npm.cmd test`: **59 pruebas aprobadas**; siete nuevas cubren creación, límites de fecha/hora/personas, guardado, recuperación, datos corruptos, falla de escritura y recuperación de fechas históricas.
- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto.
- HeadlessChrome 156, escritorio 1440 × 900: **14 comprobaciones** sobre el formulario real; guardado, carga del ID y datos, texto de confirmación, edición, nuevo ID, rechazo de 11 personas, error simulado de LocalStorage y ausencia de desbordamiento.
- Móvil emulado 320 × 568: **seis comprobaciones** de guardado, resumen, ID, fecha/hora/personas y ausencia de datos internos; el mismo ID se recuperó tras recargar y no hubo desbordamiento.
- Sin errores en la consola de las sesiones revisadas. Captura móvil [reserva-320.png](reserva-320.png), inspeccionada visualmente.

Evidencia: [escritorio, guardar y recargar](guardado-escritorio.json), [móvil, guardado](guardado-movil.json), [móvil, recuperación](recuperacion-movil.json), [script de guardado](validar-guardado.js) y [script de recuperación, edición y error](validar-recuperacion.js). Los scripts usan eventos de formulario y `requestSubmit()`; el error de escritura se simula reemplazando temporalmente `Storage.setItem`.

## Alcance y continuación

Esta vista confirma que el borrador se guardó localmente; no confirma una reserva con el restaurante, sincroniza dispositivos ni calcula disponibilidad. LocalStorage conserva el último borrador válido de este navegador; no es un registro compartido de reservas.

Las tres tareas del miércoles quedan completadas: guardado y vista resumen, prueba del identificador/resumen y cierre documental. La siguiente fecha planificada es el jueves 29/10 (día 27), primera tarea de Backoffice: layout administrativo con navegación lateral/barra superior y protección de rutas. Horas efectivas pendientes de registrar.

Mensaje sugerido: `feat: save reservation drafts locally and show confirmation summary`.
