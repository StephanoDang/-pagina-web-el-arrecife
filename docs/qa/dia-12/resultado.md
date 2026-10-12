# Día 12 — Pruebas del carrito

Fecha: 12/10/2026. Código probado: `b9ecd5a`.

Se comprobó la aplicación local en `http://127.0.0.1:5173/carta` con Chrome DevTools CLI y HeadlessChrome 155 en Windows. Las capturas se inspeccionaron visualmente. La emulación de pantalla y entrada táctil no sustituye una prueba en teléfono físico.

## Escenarios

- Carrito vacío en la aplicación real.
- Carrito con 25 productos reales del catálogo y 999999 unidades del primero, para comprobar lista larga, cantidades y precios grandes.
- Para el segundo escenario se utilizó una página temporal que montaba `App`, `MemoryRouter` y `CartProvider` reales. Un componente llamaba en `useEffect` a `addItem` para los primeros 25 platos disponibles y a `setQuantity` para el primero. No se alteraron datos del catálogo ni se añadieron controles de compra a producción. La página temporal se retiró al finalizar.

## Teclado y accesibilidad

| Comprobación | Resultado observado |
| --- | --- |
| Abrir con Enter y Espacio | Diálogo abierto; foco inicial en «Cerrar carrito». |
| Tab | Cerrar → región de productos → enlace de la carta → Cerrar. |
| Shift+Tab desde Cerrar | Foco en el enlace de la carta, sin salir del diálogo. |
| End en la región de productos | La lista llega al final: `scrollTop = 3413`, igual al máximo; la página de fondo permanece en `scrollY = 0`. |
| Escape | Diálogo cerrado, foco en «Carrito», `aria-expanded="false"` y restauración del `overflow` del body. |
| Enter sobre Cerrar | Diálogo cerrado y foco devuelto al botón de apertura. |
| Enter sobre Seguir viendo la carta | Diálogo cerrado, carta visible y desplazamiento de la página restaurado. |
| Clic fuera del panel | El manejador cierra y devuelve el foco; probado mediante un `MouseEvent` sintético con coordenadas externas en escritorio. No equivale a un toque físico. |
| Árbol accesible | Diálogo modal «Tu carrito», región «Productos del carrito», cantidad expresada como texto y total en región viva `polite` y `atomic`. |
| Consola | Sin mensajes de error al consultar la consola tras las pruebas. |

El recorrido de Tab se comprobó en el carrito vacío. El desplazamiento y el enlace final también se comprobaron con productos. No se probó la lectura con un lector de pantalla real.

## Tamaños y reflujo

| Área de visualización | Resultado observado |
| --- | --- |
| 320 × 568, móvil emulado | Carrito vacío y con productos sin desbordamiento horizontal; ancho visible y desplazable de 320 px. Botón de cierre de 44 × 44 px. Resumen visible dentro de los 568 px. |
| 375 × 812, móvil emulado | Carrito con productos sin desbordamiento horizontal; resumen visible. |
| 667 × 375, horizontal emulado | Panel de 440 px sin desbordamiento horizontal; desplazamiento de todo el panel. Shift+Tab alcanza el enlace final, visible entre 306,92 y 354,92 px. |
| 1440 × 900, escritorio | Panel de 440 px, lista desplazable y resumen visible. |
| 720 × 450, escritorio reducido | Reflujo equivalente al área disponible de 1440 × 900 al 200 %; panel sin desbordamiento horizontal. Enlace final visible entre 381,92 y 429,92 px tras recibir foco. |

Los atajos de zoom no modificaron `innerWidth`, `innerHeight` ni `devicePixelRatio` en este navegador de pruebas. Por ello, se comprobó el reflujo reduciendo el viewport; **el zoom real al 200 % sigue pendiente**.

## Evidencia visual

- [Carrito vacío, 320 px](carrito-vacio-320.png).
- [Carrito con productos, 320 px](carrito-productos-320.png).
- [Resumen alcanzado con teclado en horizontal](carrito-horizontal.png).
- [Carrito con productos en escritorio](carrito-escritorio.png).

## Pendiente de confirmar

- En teléfono real: apertura y cierre mediante toque, desplazamiento, áreas seguras y cambios de altura con la barra del navegador; comprobar también orientación horizontal.
- Zoom real del navegador al 200 % y lectura con lector de pantalla.
- Los controles de adición, edición de cantidades y eliminación aún no existen en la interfaz pública. Las pruebas con productos validan su visualización en el carrito, no un flujo de compra completo.
- Horas efectivas del día, que debe confirmar el usuario.

No se encontraron defectos adicionales en los escenarios comprobados. Lint, build y las 35 pruebas existentes habían pasado al implementar la primera tarea; en esta etapa se añadieron únicamente documentación y capturas, sin cambios a producción.
