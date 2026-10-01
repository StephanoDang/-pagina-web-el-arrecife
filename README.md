# El Arrecife — sitio web

Proyecto web para el restaurante **El Arrecife**. Su objetivo es ofrecer a los clientes una carta digital y facilitar la gestión de la información y los pedidos del restaurante.

## Estado del proyecto

**En desarrollo.** La configuración de Vite, React y TypeScript está revisada y se retiró la interfaz de ejemplo. El sitio ya tiene Header y Footer adaptables, con enlaces a Inicio, Carta, Pedidos y Reservas. La ruta `/carta` muestra una selección inicial de 7 platos con precios y presentaciones confirmados, agrupados en 5 categorías con navegación por enlaces. Las tarjetas son adaptables y funcionan sin fotografías. Inicio, Pedidos y Reservas siguen mostrando pantallas temporales; la carga completa del menú y las funciones de pedidos están pendientes.

## Alcance previsto

- Mostrar la carta con platos, precios y disponibilidad.
- Permitir que el personal actualice la información de los platos.
- Incorporar un flujo para registrar pedidos y consultar su estado.
- Adaptar la interfaz a computadoras y teléfonos.

El alcance se ajustará según las necesidades acordadas con el restaurante. Los pagos en línea no forman parte de este plan. La bitácora incluye un prototipo de reservas, que todavía no está implementado.

## Tecnologías

- React y TypeScript para la interfaz.
- Vite para el entorno de desarrollo y la compilación.
- React Router para organizar las páginas.
- ESLint para revisar el código.

## Ejecutar el proyecto

Necesitas Node.js y npm instalados. Desde la carpeta del proyecto, ejecuta:

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
