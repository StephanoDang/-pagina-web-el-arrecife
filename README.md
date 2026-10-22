# El Arrecife — sitio web

Proyecto web para el restaurante **El Arrecife**. Su objetivo es ofrecer a los clientes una carta digital y facilitar la gestión de la información y los pedidos del restaurante.

## Estado del proyecto

**En desarrollo.** El sitio tiene Header y Footer adaptables, con enlaces a Inicio, Carta, Pedidos y Reservas. La ruta `/carta` muestra la carta completa del PDF de febrero de 2026: 173 productos, 270 presentaciones y 35 categorías, incluyendo postres y bebidas con y sin alcohol. Conserva las aclaraciones del propietario y muestra los recargos de bebidas como una nota consultable, sin automatizar la regla pendiente para fechas coincidentes. La carta tiene estilos adaptables, filtros por categoría, búsqueda inmediata sin distinguir tildes ni mayúsculas, contadores y recuperación cuando no hay resultados. Las presentaciones y sus precios se pueden desplegar en las tarjetas, que funcionan sin fotografías. Los productos repetidos comparten precios entre secciones y se cuentan una sola vez. Búsqueda y categoría se conservan en la URL. Inicio y Reservas siguen mostrando pantallas temporales. `/pedidos` contiene el formulario de datos del cliente; el panel del carrito está disponible desde la cabecera. El borrador de la orden se guarda y recupera en el navegador; el envío al restaurante sigue pendiente.

## Alcance previsto

- Mostrar la carta con platos, precios y disponibilidad.
- Permitir que el personal actualice la información de los platos.
- Incorporar un flujo para registrar pedidos y consultar su estado.
- Adaptar la interfaz a computadoras y teléfonos.

El alcance se ajustará según las necesidades acordadas con el restaurante. Los pagos en línea no forman parte de este plan. La bitácora incluye un prototipo de reservas, que todavía no está implementado.

El carrito utiliza Context API y `useCart`. Su acción `addItem` agrega una unidad por combinación de plato y presentación, suma las adiciones repetidas y rechaza platos no disponibles o identificadores inválidos. El botón Carrito de la cabecera abre un panel lateral adaptable con estado vacío y listado de elementos, presentaciones, cantidades y precios unitarios. El panel permite cerrar con botón, Escape o clic en el fondo y mantiene el foco dentro al navegar con Tab y Shift+Tab. Estas interacciones se comprobaron en Chrome y el estado vacío se revisó en escritorio y móvil emulado de 375 × 812 px. La lógica de edición y eliminación ya está disponible mediante `setQuantity` y `removeItem`: acepta cantidades enteras positivas y afecta únicamente al plato y presentación seleccionados.

El panel muestra subtotales por presentación y el total, recalculados a partir de las cantidades y los precios del catálogo. Los importes se calculan en céntimos; un precio faltante o una cantidad inválida impiden mostrar un total parcial. El usuario confirmó que los precios incluyen IGV: el carrito indica «Incluido en los precios» y conserva el total sin añadir impuestos nuevamente. La lógica admite una tasa configurable y desglosa el IGV incluido o calcula IGV adicional con redondeo a céntimos. La configuración activa está en `src/data/cartTotals.ts`: `mode: 'included'` y `rateBasisPoints: null`. El desglose numérico queda pendiente de confirmar la tasa; las tasas empleadas en las pruebas son datos de prueba.

Las 42 pruebas automatizadas comprueban carta, filtros, contexto, lógica del carrito y generación/recuperación de borradores, incluidos subtotales, cantidades, eliminación, IGV, redondeo y datos inválidos. Los ajustes del día 12 incorporan una región de productos accesible con teclado, resumen semántico y adaptación a pantallas bajas; se comprobaron el carrito vacío y un escenario de 25 productos en Chromium. El [informe del día 12](docs/qa/dia-12/resultado.md) conserva capturas y límites de la validación. Los botones para agregar productos desde la carta y los controles visuales para editar y eliminar siguen pendientes. Al recargar se recupera el carrito del último borrador guardado; los cambios sin guardar no se persisten automáticamente.

El formulario de `/pedidos` utiliza React Hook Form y permite elegir delivery o recojo en tienda mediante radios accesibles con teclado. Nombre y teléfono son obligatorios en ambos métodos. La dirección es obligatoria para delivery, con longitud de 5 a 200 caracteres; en recojo se oculta, queda deshabilitada y se excluye de los datos del formulario. Al volver a delivery se conserva el texto y se reactiva su validación. Se rechazan campos obligatorios vacíos o compuestos solo por espacios, teléfonos fuera del formato de 7 a 15 dígitos y nombres de más de 100 caracteres. Se admiten código de país y separadores telefónicos. Los errores están asociados a sus campos y el foco se coloca en el primero. Con un carrito válido, el botón «Generar resumen y guardar borrador» muestra los datos del cliente, productos, presentaciones, cantidades, precios unitarios, subtotales y total de productos. Guarda una instantánea local y muestra un aviso de éxito; si falla el almacenamiento, mantiene el resumen y explica el error. Editar datos o cambiar el carrito oculta el resumen hasta generarlo de nuevo. El pedido todavía no se envía al restaurante.

El checkout informa que el costo de delivery está pendiente de confirmar y aún no se ha calculado. En recojo explica que el pedido se retira en el local y remite a las condiciones del restaurante. El aviso cambia de forma accesible al seleccionar el método. No se asignan tarifas ni se afirma gratuidad, y no se añade ningún cargo al total de productos del carrito.

Al cierre del día 19 se completaron las cinco tareas de métodos de entrega, dirección, avisos, pruebas y documentación. Lint y compilación pasaron durante la implementación. Se comprobaron 29 casos sobre el formulario real en HeadlessChrome 155, además de teclado, móvil emulado a 320 y 375 px, orientación horizontal y escritorio. El [informe del día 19](docs/qa/dia-19/resultado.md) incluye resultados, capturas y script reproducible. El [informe del día 14](docs/qa/dia-14/resultado.md) conserva las 20 comprobaciones anteriores. Estos casos de navegador se ejecutan por separado de `npm test`.

Al cierre del día 21 (jueves 22/10) se completaron resumen, guardado, recuperación y documentación. El borrador versionado se almacena bajo `el-arrecife:order-draft:v1`, con fecha, datos del cliente y líneas de productos. Al abrir la aplicación se valida frente al catálogo actual y se recupera el carrito; `/pedidos` restaura el formulario y el resumen cuando coincide con ese carrito. Los datos corruptos, versiones desconocidas, duplicados, precios alterados y fallos de lectura muestran un error sin bloquear una orden nueva. Los borradores rechazados permanecen almacenados hasta que se guarda uno nuevo. La recuperación es local al navegador y al mismo origen; no sincroniza dispositivos ni confirma pedidos.

La validación del día 21 dejó lint, build y 42 pruebas automatizadas correctas, además de 12 comprobaciones en Chrome for Testing 148 (incluidas dos de preparación de datos). El [informe del día 21](docs/qa/dia-21/resultado.md) incluye límites, resultados y el script para reproducir guardado, edición, recarga, recojo y errores de almacenamiento. El ejemplo se preparó con el generador real porque los controles de adición de productos aún están pendientes.

Quedan pendientes teléfono físico, lector de pantalla y zoom real del navegador. El siguiente paso es el formulario de reservas para seleccionar fecha y hora (día 22, viernes 23/10). La vista de confirmación de pedido desplazada del antiguo día 13 sigue pendiente de reprogramación. Los costos y reglas de entrega requieren confirmación. La visita a la empresa del día 13 se destinó a recopilar fotos; los archivos y permisos de publicación siguen pendientes de confirmar.

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
npm test         # Comprueba carta, filtros, carrito y borradores de orden
```

## Estructura principal

```text
public/       Archivos públicos
src/          Código de la aplicación
src/assets/   Recursos gráficos
```

## Seguimiento del trabajo

Los cambios del proyecto se registran en el historial de Git. A medida que avance el desarrollo, este README se actualizará para distinguir las funciones implementadas de las que sigan pendientes.

La [bitácora diaria](docs/bitacora-diaria.md) conserva los 64 bloques originales de objetivos de 5 horas (320 horas de referencia), reprogramados hasta el 17 de diciembre de 2026. Registra por separado los permisos sin trabajo del 15 y 16/10, las correcciones de documentación del sábado 17, la visita a la empresa del lunes 19 y la coordinación de precios de hosting del miércoles 21. Los objetivos técnicos pendientes se retoman en orden desde el martes 20/10; el calendario incluye 69 registros. Las horas de esas actividades siguen pendientes de confirmar, y la fecha final se ajustará al avance y a las horas efectivas.

El [registro anterior de septiembre–octubre](docs/bitacora-septiembre-octubre-2026.md) conserva los avances ya realizados. El [plan hasta el 15 de octubre](docs/plan-hasta-15-octubre-2026.md) queda como referencia histórica.
