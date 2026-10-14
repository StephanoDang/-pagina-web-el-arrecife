# Día 14 — Segunda tarea: pruebas de validación

Fecha: 14/10/2026. Código probado: `2e13da3`.

Se probó `/pedidos` en HeadlessChrome 155 con una pantalla móvil emulada de 375 × 812 px. Se usaron datos ficticios. No se encontraron defectos en los escenarios comprobados; el código de producción no se modificó.

## Resultados

La [matriz automatizada](resultados.json) contiene **20 casos correctos**, ejecutados sobre el formulario React real con eventos DOM sintéticos y `requestSubmit()`, sin sustituir React Hook Form por un mock.

| Escenario | Resultado |
| --- | --- |
| Campos vacíos y solo espacios | Tres mensajes obligatorios; foco en Nombre; sin aviso de datos completos. |
| Teléfono con letras, 6 o 16 dígitos, código con letras, doble `+` o solo guiones | Error de formato y foco en Teléfono. |
| Dirección de 4 caracteres | Error de longitud y foco en Dirección. |
| Nombre de 101 caracteres y dirección de 201 | Se rechazan incluso al inyectar valores DOM que superan `maxLength`. |
| Nombre de un carácter Unicode y dirección de 5 caracteres | Aceptados conforme a las reglas actuales. |
| Teléfono de 7 o 15 dígitos, `+51 (987) 654-321` y `987.654.321` | Aceptados conforme a las reglas de formato actuales; no se verifica existencia del número. |
| Datos válidos con espacios exteriores | Aceptados. |
| Editar después de una revisión válida | Se retira el aviso de datos completos. |
| Corregir teléfono sin reenviar | Desaparece el error y su referencia accesible; no aparece confirmación automática. |

En cada envío automatizado se verificaron los mensajes, `aria-invalid`, la asociación del error mediante `aria-describedby`, `role="alert"`, el foco en el primer error y la ausencia de aviso válido cuando existían errores.

También se comprobaron con acciones del navegador:

- Clic en Revisar mis datos con todos los campos vacíos y lectura del árbol accesible.
- Introducción de `abc` en Teléfono y envío con Enter: error visible y asociado al campo.
- Corrección a `+51 (987) 654-321`: retirada del error al editar; nuevo envío con Enter muestra «Tus datos están completos. El pedido todavía no se ha enviado.» como `status`.
- Consulta de consola sin mensajes de error.

La [captura del teléfono inválido](telefono-invalido-375.png) se inspeccionó visualmente: texto legible, foco visible y mensaje ajustado al ancho móvil. No se comprobó un teléfono físico ni un lector de pantalla real.

## Repetir la matriz

Desde la raíz del repositorio, iniciar `npm.cmd run dev -- --host 127.0.0.1`, abrir `/pedidos` con Chrome DevTools CLI y consultar el ID de esa página. En PowerShell, sustituyendo `1` por ese ID:

```powershell
$day14Qa = Get-Content -LiteralPath docs/qa/dia-14/validar-formulario.js -Raw -Encoding UTF8
$day14Encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($day14Qa))
$day14Runner = 'async () => await eval(new TextDecoder().decode(Uint8Array.from(atob(''{0}''), c => c.charCodeAt(0))))()' -f $day14Encoded
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools evaluate_script $day14Runner --pageId 1
```

La codificación conserva el script y sus saltos de línea al pasarlo por el lanzador de Windows. El script falla si una comprobación no coincide con el resultado esperado. La matriz modifica únicamente los campos de la página local; no guarda ni envía pedidos.

## Punto para continuar

Las tres tareas del día 14 están terminadas. El cierre documental consolida este informe, la bitácora y el README. Las horas efectivas siguen pendientes de confirmación. Lint y build pasaron en la primera tarea; las siguientes entregas añaden pruebas reproducibles, evidencia y documentación, sin modificar el código de producción.

La próxima tarea es la primera del día 15: selección entre delivery y recojo en tienda. El formulario actual exige dirección para todos los casos; habrá que adaptar esa exigencia al método elegido. Las reglas y costos de entrega deben confirmarse antes de aplicar importes. La confirmación de pedido y la persistencia siguen pendientes. No se implementó ninguna función del día 15 durante este cierre.
