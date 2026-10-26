# Día 24 — Segunda tarea: límites de reservas

Fecha: 26/10/2026. Verificado sobre el árbol de trabajo con el horario provisional de la primera tarea; HEAD de referencia: `f9413cc`.

Se ejecutaron **48 comprobaciones en escritorio (1889 × 2045) y las mismas 48 en móvil emulado (320 × 568)** sobre el formulario React de `/reservas`, en HeadlessChrome 156. Todas correctas. No se encontraron defectos en estos escenarios ni se modificó código de producción durante esta tarea.

La matriz usa eventos DOM sintéticos y `requestSubmit()`. Simula el reloj del navegador para comprobar límites deterministas; restaura `Date` y refresca el formulario al terminar. Las 48 comprobaciones incluyen resultados de validación y revisión local; en cada envío se comprueban también atributos accesibles, asociación de errores y foco en el primer campo inválido.

- Límites nativos: fecha mínima de hoy en Perú y hora de 10:00 a 17:59.
- Campos vacíos y fecha de ayer rechazados.
- 09:59, 18:00 y 18:01 rechazadas; 10:00 y 17:59 aceptadas cuando son futuras.
- Apertura aceptada todos los días, incluido lunes.
- Hora pasada y minuto actual rechazados; siguiente minuto aceptado.
- Cambiar de mañana a hoy revalida la hora y retira la revisión anterior.
- Después del cierre, hoy se rechaza y mañana permite la apertura.
- Antes de medianoche en Perú se conserva el día local aunque UTC ya haya cambiado; al recuperar foco después de medianoche se actualiza `min`, se retira la revisión y se rechaza el día anterior.
- Revisión válida siempre local, sin afirmar envío ni confirmación; errores y foco accesibles.
- Sin desbordamiento horizontal en ambas pantallas.

Evidencia: [resultados de escritorio](resultados-escritorio.json), [resultados móviles](resultados-movil.json) y [captura del error de cierre a 320 px](cierre-320.png), inspeccionada visualmente. Consulta de consola sin mensajes de error.

## Reproducción

Iniciar Vite con `npm.cmd run dev -- --host 127.0.0.1`. Abrir `/reservas` con Chrome DevTools CLI y sustituir el ID `1` si corresponde:

```powershell
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools navigate_page 1 --url http://127.0.0.1:5173/reservas
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools evaluate_script 'async () => await eval(await (await fetch(`/docs/qa/dia-24/validar-limites.js`)).text())()' --pageId 1 --output-format=json
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools emulate 1 --viewport '320x568x1,mobile,touch'
```

Repetir `evaluate_script` después de emular el móvil. El [script](validar-limites.js) detiene la ejecución si una comprobación falla.

## Límites y continuación

Estas pruebas usan el formulario real con eventos sintéticos y recuperación de foco simulada. No equivalen a probar los selectores nativos en teléfono físico ni a esperar el cambio de minuto del temporizador en tiempo real. El horario sigue siendo provisional; no se verifican excepciones de feriados, aforo, guardado ni envío.

Las tres tareas del lunes quedan completadas: validación, pruebas de límites y cierre documental. README, bitácora e informe se consolidaron sin cambios en el código de producción. El siguiente objetivo es el día 25, martes 27/10: selección del número de personas y validación de aforo máximo. Antes de restringir personas se deben confirmar el límite por reserva y las reglas de aforo por sede. Se conservan los resultados de lint, build y las 48 pruebas automatizadas de la primera tarea; estas comprobaciones de navegador se ejecutan por separado de `npm test`. Horas efectivas pendientes de registrar.

Mensaje de commit sugerido: `test: verify reservation date and opening-hour boundaries`.

## Cierre documental del día 24

Commits de referencia: `1422266` (fechas y horas pasadas), `f9413cc` (horario provisional) y `eab8d70` (pruebas de límites). El acumulado de objetivos al cierre técnico es 90/320 h del plan; no acredita horas efectivas.

Mensaje sugerido para la tercera tarea: `docs: close day 24 reservation progress and validation`.
