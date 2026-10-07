# El Arrecife — sitio web

Proyecto web para el restaurante **El Arrecife**. Su objetivo es ofrecer a los clientes una carta digital y facilitar la gestión de la información y los pedidos del restaurante.

## Estado del proyecto

**En desarrollo.** El sitio tiene Header y Footer adaptables, con enlaces a Inicio, Carta, Pedidos y Reservas. La ruta `/carta` muestra la carta completa del PDF de febrero de 2026: 173 productos, 270 presentaciones y 35 categorías, incluyendo postres y bebidas con y sin alcohol. Conserva las aclaraciones del propietario y muestra los recargos de bebidas como una nota consultable, sin automatizar la regla pendiente para fechas coincidentes. La carta tiene estilos adaptables, filtros por categoría, búsqueda inmediata sin distinguir tildes ni mayúsculas, contadores y recuperación cuando no hay resultados. Las presentaciones y sus precios se pueden desplegar en las tarjetas, que funcionan sin fotografías. Los productos repetidos comparten precios entre secciones y se cuentan una sola vez. Búsqueda y categoría se conservan en la URL. Inicio, Pedidos y Reservas siguen mostrando pantallas temporales; el panel del carrito está disponible desde la cabecera y las funciones de pedidos siguen pendientes.

## Alcance previsto

- Mostrar la carta con platos, precios y disponibilidad.
- Permitir que el personal actualice la información de los platos.
- Incorporar un flujo para registrar pedidos y consultar su estado.
- Adaptar la interfaz a computadoras y teléfonos.

El alcance se ajustará según las necesidades acordadas con el restaurante. Los pagos en línea no forman parte de este plan. La bitácora incluye un prototipo de reservas, que todavía no está implementado.

El carrito utiliza Context API y `useCart`. Su acción `addItem` agrega una unidad por combinación de plato y presentación, suma las adiciones repetidas y rechaza platos no disponibles o identificadores inválidos. El botón Carrito de la cabecera abre un panel lateral adaptable con estado vacío y listado de elementos, presentaciones, cantidades y precios unitarios. El panel permite cerrar con botón, Escape o clic en el fondo y mantiene el foco dentro al navegar con Tab y Shift+Tab. Estas interacciones se comprobaron en Chrome y el estado vacío se revisó en escritorio y móvil emulado de 375 × 812 px. Los botones para agregar productos desde la carta, la edición de cantidades, la eliminación, los subtotales y la persistencia tras recargar siguen pendientes. La interacción con productos añadidos y la validación en un teléfono físico también están pendientes.

## Tecnologías

- React y TypeScript para la interfaz.
- Vite para el entorno de desarrollo y la compilación.
- React Router para organizar las páginas.
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

La [bitácora diaria](docs/bitacora-diaria.md) organiza 64 jornadas de 5 horas, de lunes a sábado e incluyendo feriados en la planificación, desde el 28 de septiembre hasta el 10 de diciembre de 2026: 320 horas previstas. Conserva los avances comprobados, el registro de horas efectivas y el punto desde el que continuar en WebStorm.

El [registro anterior de septiembre–octubre](docs/bitacora-septiembre-octubre-2026.md) conserva los avances ya realizados. El [plan hasta el 15 de octubre](docs/plan-hasta-15-octubre-2026.md) queda como referencia histórica.
