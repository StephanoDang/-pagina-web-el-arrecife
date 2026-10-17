# El Arrecife — sitio web

Proyecto web para el restaurante **El Arrecife**. Su objetivo es ofrecer a los clientes una carta digital y facilitar la gestión de la información y los pedidos del restaurante.

## Estado del proyecto

**En desarrollo.** El sitio tiene Header y Footer adaptables, con enlaces a Inicio, Carta, Pedidos y Reservas. La ruta `/carta` muestra la carta completa del PDF de febrero de 2026: 173 productos, 270 presentaciones y 35 categorías, incluyendo postres y bebidas con y sin alcohol. Conserva las aclaraciones del propietario y muestra los recargos de bebidas como una nota consultable, sin automatizar la regla pendiente para fechas coincidentes. La carta tiene estilos adaptables, filtros por categoría, búsqueda inmediata sin distinguir tildes ni mayúsculas, contadores y recuperación cuando no hay resultados. Las presentaciones y sus precios se pueden desplegar en las tarjetas, que funcionan sin fotografías. Los productos repetidos comparten precios entre secciones y se cuentan una sola vez. Búsqueda y categoría se conservan en la URL. Inicio y Reservas siguen mostrando pantallas temporales. `/pedidos` contiene el formulario de datos del cliente; el panel del carrito está disponible desde la cabecera. El registro y envío de pedidos siguen pendientes.

## Alcance previsto

- Mostrar la carta con platos, precios y disponibilidad.
- Permitir que el personal actualice la información de los platos.
- Incorporar un flujo para registrar pedidos y consultar su estado.
- Adaptar la interfaz a computadoras y teléfonos.

El alcance se ajustará según las necesidades acordadas con el restaurante. Los pagos en línea no forman parte de este plan. La bitácora incluye un prototipo de reservas, que todavía no está implementado.

El carrito utiliza Context API y `useCart`. Su acción `addItem` agrega una unidad por combinación de plato y presentación, suma las adiciones repetidas y rechaza platos no disponibles o identificadores inválidos. El botón Carrito de la cabecera abre un panel lateral adaptable con estado vacío y listado de elementos, presentaciones, cantidades y precios unitarios. El panel permite cerrar con botón, Escape o clic en el fondo y mantiene el foco dentro al navegar con Tab y Shift+Tab. Estas interacciones se comprobaron en Chrome y el estado vacío se revisó en escritorio y móvil emulado de 375 × 812 px. La lógica de edición y eliminación ya está disponible mediante `setQuantity` y `removeItem`: acepta cantidades enteras positivas y afecta únicamente al plato y presentación seleccionados.

El panel muestra subtotales por presentación y el total, recalculados a partir de las cantidades y los precios del catálogo. Los importes se calculan en céntimos; un precio faltante o una cantidad inválida impiden mostrar un total parcial. El usuario confirmó que los precios incluyen IGV: el carrito indica «Incluido en los precios» y conserva el total sin añadir impuestos nuevamente. La lógica admite una tasa configurable y desglosa el IGV incluido o calcula IGV adicional con redondeo a céntimos. La configuración activa está en `src/data/cartTotals.ts`: `mode: 'included'` y `rateBasisPoints: null`. El desglose numérico queda pendiente de confirmar la tasa; las tasas empleadas en las pruebas son datos de prueba.

Las 35 pruebas automatizadas existentes comprobaron carta, filtros, contexto y lógica del carrito, incluidos subtotales, cantidades, eliminación, IGV, redondeo y datos inválidos. Los ajustes del día 12 incorporan una región de productos accesible con teclado, resumen semántico y adaptación a pantallas bajas; se comprobaron el carrito vacío y un escenario de 25 productos en Chromium. El [informe del día 12](docs/qa/dia-12/resultado.md) conserva capturas y límites de la validación. Los botones para agregar productos desde la carta, los controles visuales para editar y eliminar y la persistencia tras recargar siguen pendientes.

El formulario de `/pedidos` utiliza React Hook Form para validar nombre, teléfono y dirección. Rechaza campos vacíos o compuestos solo por espacios, teléfonos fuera del formato de 7 a 15 dígitos, nombres de más de 100 caracteres y direcciones fuera del intervalo de 5 a 200 caracteres. Admite código de país y separadores telefónicos. Los errores están asociados a sus campos y el foco se coloca en el primer error. Una revisión válida muestra un aviso local que se retira al editar; todavía no guarda ni envía el pedido. Actualmente la dirección es obligatoria en todos los casos.

Al cierre del día 14, lint y compilación pasan y se comprobaron 20 casos de validación sobre el formulario real en HeadlessChrome 155, además de acciones de entrada y envío con Enter. El [informe del día 14](docs/qa/dia-14/resultado.md) incluye resultados, captura y script para repetir la matriz; estos casos de navegador se ejecutan por separado de `npm test`. Quedan pendientes las pruebas en teléfono físico y lector de pantalla, así como el zoom real del navegador. El siguiente paso es la selección entre delivery y recojo en tienda (día 15), adaptando la exigencia de dirección. Los costos y reglas de entrega requieren confirmación. La visita a la empresa del día 13 se destinó a recopilar fotos; los archivos y permisos de publicación siguen pendientes de confirmar.

## Tecnologías

- React y TypeScript para la interfaz.
- Vite para el entorno de desarrollo y la compilación.
- React Router para organizar las páginas.
- React Hook Form para validar los datos del cliente.
- ESLint para revisar el código.

## Ejecutar el proyecto

Necesitas Node.js 22.12 o posterior y npm instalados. Desde la carpeta del proyecto, ejecuta:

```bash
npm install
npm run dev
```

Abre en el navegador la dirección local que indique Vite en la terminal.

## Comandos disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Comprueba TypeScript y genera la versión de producción
npm run preview  # Previsualiza la versión compilada
npm run lint     # Ejecuta ESLint
npm test         # Comprueba la carta, sus filtros, el contexto y la lógica del carrito
```

## Estructura principal

```text
public/       Archivos públicos
src/          Código de la aplicación
src/assets/   Recursos gráficos
```

## Seguimiento del trabajo

Los cambios del proyecto se registran en el historial de Git. A medida que avance el desarrollo, este README se actualizará para distinguir las funciones implementadas de las que sigan pendientes.

La [bitácora dia a dia](docs/bitacora-diaria.md) organiza 64 jornadas de 5 horas, de lunes a sábado, excluyendo el feriado del 8 de octubre y conservando los demás feriados previstos, desde el 28 de septiembre hasta el 11 de diciembre de 2026: 320 horas previstas. Conserva los avances comprobados, el registro de horas efectivas y el punto desde el que continuar en WebStorm.

El [registro anterior de septiembre–octubre](docs/bitacora-septiembre-octubre-2026.md) conserva los avances ya realizados. El [plan hasta el 15 de octubre](docs/plan-hasta-15-octubre-2026.md) queda como referencia histórica.
