# El Arrecife — sitio web

Proyecto web para el restaurante **El Arrecife**. Su objetivo es ofrecer a los clientes una carta digital y facilitar la gestión de la información y los pedidos del restaurante.

## Estado del proyecto

**En desarrollo.** La configuración de Vite, React y TypeScript está revisada y se retiró la interfaz de ejemplo. El sitio ya tiene Header y Footer adaptables, con enlaces a Inicio, Carta, Pedidos y Reservas. Estas rutas muestran pantallas temporales; la carta y las demás funciones del restaurante aún no están implementadas.

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

El [plan diario hasta el 15 de octubre de 2026](docs/plan-hasta-15-octubre-2026.md) define los entregables previstos y la información que se necesita del restaurante. El plan no indica funciones ya implementadas.

La [bitácora diaria](docs/bitacora-diaria.md) permite registrar avances comprobados, horas reales, bloqueos y el punto exacto desde el que continuar la próxima jornada.
