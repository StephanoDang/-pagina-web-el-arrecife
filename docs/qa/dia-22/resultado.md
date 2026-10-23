# Día 22 — Segunda tarea: reservas en móvil emulado

Fecha: 23/10/2026. Código probado: `92977e7`.

Se comprobó `/reservas` en HeadlessChrome 155. **17 casos correctos**, con [script reproducible](validar-reservas.js) y [resultados JSON](resultados.json). No se encontraron defectos en estos escenarios ni se modificó código de producción.

## Validaciones y selección

La matriz usa el formulario React real con eventos DOM sintéticos y `requestSubmit()`. Comprueba:

- Campos nativos de fecha y hora, etiquetas visibles y aviso de disponibilidad asociado al formulario.
- Ambos campos vacíos, solo fecha o solo hora: error correcto, atributos accesibles y foco en el primer campo inválido.
- Fecha y hora completas: revisión local sin afirmar envío ni confirmación.
- Conservación de la fecha y los minutos seleccionados, sin conversión horaria.
- Editar uno de los campos retira el aviso anterior y conserva el otro.
- Borrar datos después de revisar vuelve a exigirlos; corregirlos retira el error sin revisar automáticamente.
- Revisión válida posterior y campos con altura mínima de 44 px y fuente de al menos 16 px, sin desbordamiento horizontal.

Además se introdujeron `2026-10-28` y `16:10` mediante las acciones `fill` del navegador y se pulsó Revisar fecha y hora: los valores se conservaron y apareció el aviso local esperado. Esta comprobación no equivale a manipular los selectores del sistema operativo en un teléfono físico.

## Presentación

| Pantalla | Resultado |
| --- | --- |
| 375 × 812, móvil emulado | Matriz de 17 casos correcta; captura de revisión válida inspeccionada. |
| 320 × 568, móvil emulado | Ancho de página de 320 px, errores legibles y foco en Fecha; captura inspeccionada. |
| 667 × 375, horizontal emulado | Sin desbordamiento; el botón queda visible entre 162 y 213 px al recibir foco. |

Evidencia visual: [selección válida a 375 px](reserva-375.png) y [campos vacíos a 320 px](errores-320.png). La consulta de consola no mostró mensajes de error.

## Reproducción

Con Vite iniciado mediante `npm.cmd run dev -- --host 127.0.0.1`, abrir `/reservas` en Chrome DevTools CLI, emular `375x812x1,mobile,touch` y ejecutar en PowerShell, sustituyendo `1` por el ID de la página:

```powershell
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools evaluate_script 'async () => await eval(await (await fetch(`/docs/qa/dia-22/validar-reservas.js`)).text())()' --pageId 1
```

## Límites y continuación

Quedan por comprobar teléfono físico, selectores nativos de iOS/Android y lector de pantalla real. Las pruebas no verifican horarios comerciales, disponibilidad ni bloqueo de fechas pasadas: esas reglas siguen pendientes del día 23. No hay aforo, guardado ni envío de reservas en esta etapa.

Las tres tareas del día 22 están completadas: formulario, pruebas móviles en emulación y cierre documental. Se consolidaron README, bitácora e informe con las evidencias y los límites anteriores. Las horas efectivas siguen pendientes de confirmar. Lint y build pasaron durante la primera tarea, sobre el mismo código de producción comprobado aquí; este cierre solo modifica documentación.

El siguiente objetivo es el día 23, sábado 24/10: validación de horarios de atención y bloqueo de fechas pasadas. Se necesitan los horarios confirmados del restaurante para aplicar esa regla. Aforo y guardado de reservas permanecen en sus tareas posteriores. No se adelantaron esas funciones durante el cierre.

Commits de evidencia: `92977e7` implementa el formulario y `f762dc7` registra las pruebas móviles. Mensaje propuesto para el cierre: `docs: close day 22 reservation progress and validation`.
