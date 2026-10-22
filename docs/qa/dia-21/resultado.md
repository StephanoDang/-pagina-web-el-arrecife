# Día 21 — Tarea 2: recarga y recuperación

Fecha: 22/10/2026. Alcance: recuperar y probar la orden local de ejemplo; tarea 3 de cierre pendiente.

La lectura de LocalStorage valida versión, estado de borrador, fecha, moneda, contacto, método de entrega, productos, presentaciones, cantidades y precios frente al catálogo actual. Rechaza datos corruptos, duplicados y totales alterados sin recuperar parcialmente el carrito. La aplicación conserva el valor almacenado ante errores; no envía pedidos ni modifica el catálogo.

Al iniciar se recuperan las líneas del carrito. En `/pedidos` se recuperan contacto, método, dirección cuando corresponde y resumen si coincide con el carrito actual. Cambiar los datos oculta el resumen; guardar y recargar recupera la nueva versión. Un borrador de recojo omite cualquier dirección residual.

## Verificación

- `npm run build` y `npm run lint`: correctos.
- `npm test`: 42 pruebas correctas. Las cuatro nuevas cubren recuperación de delivery, recojo, ausencia/error de lectura y rechazo de JSON o datos alterados.
- Chrome for Testing 148, contexto aislado: 12 comprobaciones correctas, incluidas dos de preparación de datos. Se verificó el formulario React real, carrito recuperado, cantidades, total, edición/guardado/recarga, recojo, fallo de escritura, lectura bloqueada, JSON corrupto y ausencia de borrador.
- Datos ficticios: Ana Prueba/Ana Editada, teléfono 999888777 y Calle Prueba 123. Se eliminó el borrador de la sesión de prueba al terminar.

## Reproducción

Con las dependencias instaladas y `chrome-devtools` configurado para un Chrome disponible:

```sh
npm run dev -- --host 127.0.0.1 --port 5174 --force
```

En otra terminal:

```sh
python3 docs/qa/dia-21/validar-recuperacion.py
```

El script abre un contexto aislado y escribe `resultados.json`. Carga inicialmente un borrador de ejemplo con el generador real porque los controles de adición de productos siguen pendientes. Después prueba el botón/formulario real mediante eventos DOM y recargas reales. No constituye una prueba manual de teclado, lector de pantalla o teléfono físico. La recuperación es local al navegador; no hay envío ni almacenamiento compartido.
