# Día 25 — Personas y validación configurable

Fecha: 27/10/2026. HEAD de referencia anterior a estos cambios: `72f365f`.

Se añadió un campo obligatorio de número de personas, con mínimo 1 y paso 1. La validación rechaza valores vacíos, cero, negativos, decimales, exponentes y enteros que no se pueden representar con precisión. La revisión muestra la cantidad y se retira al editar.

El máximo por reserva se configura en `reservationPartyPolicy.maxPerReservation` (`src/data/reservationValidation.ts`). Su valor actual es `null`, porque el restaurante aún no ha comunicado un límite. Cuando se configure un entero positivo, el formulario aplicará el atributo `max` y la validación al enviar. Una configuración inválida impide aceptar la revisión. El valor 6 utilizado en las pruebas es ficticio y exclusivo de las pruebas; no se aplica al formulario.

El máximo por reserva no equivale al aforo ni a las plazas disponibles. No hay inventario de reservas, selección de sede ni cálculo de ocupación simultánea en esta etapa. El formulario avisa de que el máximo, el aforo y la disponibilidad deben confirmarse con el restaurante. No guarda, envía ni confirma reservas.

## Verificación

- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto.
- `npm.cmd test`: 52 pruebas aprobadas, incluidas cuatro nuevas de personas y máximo configurable.
- Formulario React real en HeadlessChrome 156: **26 comprobaciones correctas en escritorio (1889 × 2045) y las mismas 26 en móvil emulado (320 × 568)**.

La matriz comprueba campos obligatorios, cantidades inválidas, singular y plural, edición, corrección, foco en el campo inválido, asociación accesible del error y ausencia de revisión ante errores. También comprueba que las reglas de fechas pasadas y cierre siguen activas con personas válidas. Sin desbordamiento horizontal ni mensajes de error en la consulta de consola.

Evidencia: [escritorio](resultados-escritorio.json), [móvil](resultados-movil.json), [captura a 320 px](personas-320.png) inspeccionada visualmente y [script reproducible](validar-personas.js). Las comprobaciones de navegador usan eventos DOM sintéticos y `requestSubmit()`, separados de `npm test`. No equivalen a operar el teclado o selector nativo de un teléfono físico.

## Reproducción

Con Vite iniciado mediante `npm.cmd run dev -- --host 127.0.0.1`, abrir el formulario y ejecutar:

```powershell
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools navigate_page 1 --url http://127.0.0.1:5173/reservas
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools evaluate_script 'async () => await eval(await (await fetch(`/docs/qa/dia-25/validar-personas.js`)).text())()' --pageId 1 --output-format=json
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools emulate 1 --viewport '320x568x1,mobile,touch'
```

Repetir `evaluate_script` tras emular el móvil; sustituir `1` por el ID de página correspondiente. Se usa una fecha dos días posterior a la ejecución para evitar depender de una hora concreta.

## Estado y continuación

Primera tarea avanzada: selección y validación de personas implementadas, máximo configurable preparado; aplicación de reglas reales pendiente. Segunda tarea avanzada con pruebas técnicas, pero pendiente de verificar límites confirmados por el restaurante. Tercera tarea completada: README, bitácora e informe actualizados con resultados y pendientes.

Falta recibir el máximo de personas por reserva y el aforo/reglas de las sedes Maestro y Retablo, o un límite provisional autorizado, para aplicar y verificar las restricciones. No se da por cerrado el bloque de 95/320 h del plan ni se asignan horas efectivas. El guardado de reservas corresponde al día 26 y no se adelantó.

Mensaje sugerido: `feat: add reservation party size and configurable limit validation`.
