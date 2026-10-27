# Día 25 — Personas y límite autorizado

**Cierre actualizado:** se aplicó el máximo provisional de 10 autorizado posteriormente por el usuario; aforo de referencia 120. La sección inicial siguiente conserva la verificación anterior a recibir esos datos. El resultado final y el estado vigente figuran al final del informe.

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

## Verificación final con valores autorizados (27/10)

El usuario autorizó 10 personas por reserva, aforo de referencia de 120 y rechazo al superar el máximo. La política activa contiene esos valores. Se conserva como pendiente interno confirmar definitivamente ambos números y si el aforo corresponde a cada sede o al conjunto. El aforo y estos pendientes no aparecen en el formulario; el error de máximo sí informa por qué se rechaza una cantidad. La referencia de 120 no permite calcular ocupación simultánea sin reservas y reglas de franjas/duración.

Lint, build y 52 pruebas automatizadas correctos. La matriz final verifica **33 comprobaciones en escritorio 1440 × 900 y las mismas 33 a 320 × 568**: acepta 10, rechaza 11 y 120, conserva errores accesibles y las reglas de fechas/horas, y comprueba que no se expongan aforo ni pendientes internos. Consulta de consola sin errores; sin desbordamiento horizontal.

Evidencia vigente: [escritorio](limites-escritorio.json), [móvil](limites-movil.json), [captura final](limite-320.png) inspeccionada visualmente y [script actualizado](validar-personas.js). Los archivos de 26 comprobaciones y la captura inicial conservan el estado anterior a recibir el máximo.

Las tres tareas del martes quedan completadas con los valores provisionales autorizados. Documentación consolidada. Acumulado previsto: 95/320 h; horas efectivas pendientes. Siguiente: día 26, guardado de reserva en LocalStorage; no se adelantó esta función.

Mensaje de commit actualizado: `feat: enforce ten-person reservation limit and record capacity policy`.
