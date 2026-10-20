# Día 19 — Cuarta tarea: pruebas del checkout

Fecha: 20/10/2026. Código probado: `2513e4c`, que incluye `96db784` y `af85494`.

Se probó `/pedidos` en HeadlessChrome 155 con datos ficticios. No se encontraron defectos en los escenarios comprobados y no se modificó código de producción.

## Validación y cambios de método

Los [resultados JSON](resultados.json) contienen **29 casos correctos** del [script reproducible](validar-checkout.js). Se ejecutaron sobre el formulario React real, con eventos DOM sintéticos, clics programáticos y `requestSubmit()`, sin sustituir React Hook Form por un mock.

| Grupo | Resultado observado |
| --- | --- |
| Estado inicial | Delivery seleccionado, dirección visible y obligatoria; aviso de costo pendiente asociado al grupo. |
| Delivery vacío o con espacios | Errores de nombre, teléfono y dirección, con foco en el primer campo inválido. |
| Dirección de delivery | Vacía o de 4 caracteres rechazada; 5 y 200 aceptados; 201 rechazados incluso al inyectarlos superando `maxLength`. |
| Cambio a recojo | Dirección oculta y deshabilitada, excluida de `FormData`; error de dirección retirado. |
| Recojo sin dirección | Se admite revisar datos válidos aunque la dirección anterior esté vacía, sea corta o exceda el límite. |
| Contacto en recojo | Nombre y teléfono siguen siendo obligatorios; teléfono inválido rechazado y revalidado al corregir. |
| Volver a delivery | Se conserva el texto de dirección y vuelve a aplicarse su validación; se retira el aviso de revisión anterior. |
| Edición y alternancia repetida | Editar retira el aviso de revisión; tres ciclos entre métodos conservan texto, exclusividad de selección y aviso correcto. |
| Aviso de costo | Delivery indica tarifa pendiente; recojo muestra sus condiciones; el aviso es `status`, atómico y no inventa importes ni gratuidad. |

En los envíos de la matriz se comprobaron los campos con error, `aria-invalid`, `aria-describedby`, `role="alert"`, foco en el primer error y ausencia de confirmación cuando hay errores. La revisión válida sigue indicando que el pedido no se ha enviado.

## Teclado y presentación

Se comprobaron además acciones de teclado del navegador:

- ArrowRight cambia de delivery a recojo y ArrowLeft permite volver.
- En recojo, Tab recorre el grupo → Nombre → Teléfono → Revisar mis datos; la dirección oculta no recibe foco. Enter sobre el botón completa la revisión local.
- En delivery, Tab incluye Dirección después de Teléfono. Shift+Tab desde Dirección vuelve a Teléfono.
- Enviar delivery sin dirección mediante Enter vuelve a enfocar el campo y muestra el error.

| Pantalla | Resultado |
| --- | --- |
| 320 × 568, móvil emulado | Ancho de página de 320 px, sin desbordamiento horizontal; etiquetas de métodos de 51 px de alto e inputs con fuente de 16 px. |
| 375 × 812, móvil emulado | Ambos métodos y sus avisos revisados visualmente; recojo excluye el campo de dirección. |
| 667 × 375, horizontal emulado | Sin desbordamiento horizontal; al recibir foco, el botón queda visible entre 162,39 y 213,39 px del viewport. |
| 1440 × 900, escritorio | Sin desbordamiento horizontal; formulario de 680 px y cambio a recojo disponible. |

Capturas inspeccionadas: [delivery con error a 320 px](delivery-error-320.png) y [recojo revisado a 375 px](recojo-375.png). Sin mensajes de error en la consola consultada tras las pruebas.

## Repetir la matriz

Iniciar `npm.cmd run dev -- --host 127.0.0.1` y abrir `/pedidos` recién cargada mediante Chrome DevTools CLI. Consultar el ID de esa página y sustituir `1` en este comando de PowerShell:

```powershell
npx.cmd --yes --package chrome-devtools-mcp chrome-devtools evaluate_script 'async () => await eval(await (await fetch(`/docs/qa/dia-19/validar-checkout.js`)).text())()' --pageId 1
```

El script debe recibir una página recién cargada, con delivery por defecto. Lanza un error si una comprobación falla y devuelve el resultado de cada caso. El archivo de script se sirve desde el mismo Vite local; esta forma de cargarlo evita el límite de longitud del lanzador `.cmd` de Windows. En esta sesión también se ejecutó pasando su contenido directamente al CLI oficial mediante `node`.

## Límites y continuación

Estas pruebas no verifican un teléfono físico, lector de pantalla real, tarifas comerciales ni envío efectivo de pedidos. Tarifas y condiciones de delivery/recojo siguen pendientes de confirmar. No se probaron persistencia ni resumen de orden, que pertenecen al día 20.

La cuarta tarea está terminada. La quinta —consolidar la documentación y cerrar el día 19— sigue pendiente; las horas efectivas también. Lint y build pasaron durante la tercera tarea, sobre el mismo código de producción probado aquí.
