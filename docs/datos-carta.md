# Datos para la Carta Pública

Estructura inicial definida en `src/types/menu.ts`. Se recibió la [carta de El Arrecife de Mamafé](menu_arrecife_mamafe.md), basada en el menú de febrero de 2026. La copia conserva el contenido y los precios del archivo recibido; falta confirmar su vigencia y algunas presentaciones.

## Fuente recibida y aclaraciones pendientes

La carta contiene platos, presentaciones, precios en soles, bebidas sin alcohol y direcciones de las sedes Maestro y Retablo. Se conservará su orden como base inicial. La sección de bebidas con alcohol no está incluida en el archivo recibido.

Antes de convertir los precios ambiguos en opciones seleccionables, confirmar:

| Producto | Precios recibidos | Dato pendiente |
| --- | --- | --- |
| Jalea Arrecife | S/ 48.00 y S/ 47.50 en piqueos para 2 | Confirmar si son presentaciones distintas o corregir el importe. |
| El Carretillero | S/ 27.50 / S/ 22.50 | Nombre de cada presentación. |
| Mi Causa la Novia | S/ 33.00 / S/ 40.00 | Nombre de cada presentación. |
| Chaufa de Cecina + Leche de Tigre | S/ 30.00 / S/ 36.00 | Qué incluye cada precio. |
| 1/4 Pollada Limeña | S/ 19.50 / S/ 23.00 | Qué incluye cada precio. |
| Filete a la Plancha | S/ 21.00 / S/ 24.50 | Qué incluye cada precio. |
| Arroz con Pato + papa a la huancaína + leche de tigre | S/ 38.00 / S/ 45.00 / S/ 50.00 | Qué incluye cada precio. |
| Panceta con Chaufa al Cilindro + Leche de Tigre | S/ 38.50 / S/ 32.50 | Qué incluye cada precio; conservar el orden recibido hasta aclararlo. |

También falta confirmar vigencia de precios, diferencias entre sedes y disponibilidad. No se deducirá disponibilidad actual por la sola presencia de un plato en la carta.

Los productos que aparecen en varias secciones se revisarán al preparar los datos para evitar duplicaciones involuntarias; no se eliminarán de la fuente. No se inventarán ingredientes para los platos sin descripción.

## Información complementaria que necesitamos

Por cada plato o bebida, completar:

| Dato | Qué indicar |
| --- | --- |
| Nombre | Nombre tal como debe aparecer en la carta. |
| Categoría | Por ejemplo: entradas, ceviches, platos de fondo o bebidas; confirmar las categorías reales. |
| Descripción | Ingredientes principales y acompañamientos confirmados. |
| Presentaciones y precios | Precio en soles de cada tamaño o presentación; si solo hay uno, indicar «Única». |
| Disponibilidad | Si se puede ofrecer actualmente. |
| Fotografía | Imagen autorizada para la web, si está disponible. |

Formato para enviar cada producto:

```text
Nombre:
Categoría:
Descripción:
Presentación y precio en soles:
Disponible: sí / no
Fotografía: disponible / pendiente
```

También necesitamos el orden de las categorías y los colores o logo que el restaurante quiera usar. Se puede comenzar con unos pocos platos e incorporar el resto después.

## Reglas para implementar la carta

- Los identificadores serán estables y cada plato pertenecerá a una categoría existente.
- Cada plato tendrá al menos una presentación con un precio entero no negativo en céntimos de sol. Al cargar datos se validará esta regla.
- Los precios recibidos en soles se convertirán a céntimos; por ejemplo, S/ 35.00 se guardará como `3500`.
- La moneda de visualización será PEN (soles), con dos decimales.
- Las fotografías son opcionales. Las tarjetas deberán funcionar sin imagen.
- El texto alternativo describirá la fotografía cuando exista.
- Los nombres y descripciones largos deberán ajustarse al ancho de la tarjeta.
- Los datos de ejemplo se identificarán como tales y no se presentarán como precios reales.

## Estado

- [x] Definir los tipos de categoría, plato y presentación.
- [x] Preparar el formato para solicitar información al restaurante.
- [x] Recibir el menú con platos y precios y conservar la fuente en el repositorio.
- [ ] Confirmar vigencia, disponibilidad y las diferencias indicadas arriba.
- [ ] Recibir fotografías autorizadas o continuar con tarjetas sin imagen.
- [ ] Crear los componentes visuales de tarjetas y categorías.
