# Datos para la Carta Pública

Estructura inicial definida en `src/types/menu.ts`. Se recibió la [carta de El Arrecife de Mamafé](menu_arrecife_mamafe.md), basada en el menú de febrero de 2026. La vigencia de los precios y la disponibilidad fueron confirmadas por el propietario, según lo comunicado por el usuario el 01/10/2026. Se corrigió Jalea Arrecife a S/ 48.00; las siete presentaciones inicialmente ambiguas quedaron aclaradas con el PDF y las indicaciones del usuario.

## Confirmación del propietario — 01/10/2026

Confirmación transmitida por el usuario:

- Los precios siguen vigentes.
- La carta y los precios son iguales en las sedes Maestro y Retablo.
- Todos los platos siguen disponibles.
- Jalea Arrecife cuesta **S/ 48.00**. Se corrigió la mención de S/ 47.50 en piqueos para 2 personas en la copia del menú del repositorio.

## Fuente recibida y aclaraciones pendientes

La carta contiene platos, presentaciones, precios en soles, bebidas y direcciones de las sedes Maestro y Retablo. Se conserva su orden como base inicial. El Markdown recibido inicialmente omitía las bebidas con alcohol; se incorporaron desde la página 8 del [PDF original](fuentes/carta-febrero-2026.pdf) el 03/10/2026.

### Presentaciones aclaradas mediante el PDF

| Producto | Presentaciones y precios | Fuente |
| --- | --- | --- |
| Chaufa de Cecina | Sin leche de tigre: S/ 30.00; con leche de tigre: S/ 36.00 | Página 4: el segundo importe lleva la indicación «Con leche de tigre». |
| 1/4 Pollada Limeña | Con papas sancochadas: S/ 19.50; con papas andinas fritas: S/ 23.00 | Página 4: correspondencia según el orden de acompañamientos e importes. |
| Filete a la Plancha | Con papas sancochadas: S/ 21.00; con papas andinas fritas: S/ 24.50 | Página 4: correspondencia según el orden de acompañamientos e importes. |

### Presentaciones aclaradas por el usuario — 01/10/2026

Los importes siguientes son precios totales de cada opción, no importes adicionales a sumar:

| Producto | Presentaciones y precios |
| --- | --- |
| El Carretillero | Cebiche de pota con chicharrón de pota: S/ 22.50; cebiche de pescado con chicharrón de pota: S/ 27.50. |
| Mi Causa la Novia | Causa sin cebiche: S/ 33.00; causa con cebiche Velo de Novia: S/ 40.00. |
| Arroz con Pato | Solo: S/ 38.00; con papa a la huancaína: S/ 45.00; con papa a la huancaína y leche de tigre: S/ 50.00. |
| Panceta con Chaufa al Cilindro | Sin leche de tigre: S/ 32.50; con leche de tigre: S/ 38.50. |

Estas aclaraciones sustituyen las descripciones ambiguas del Markdown inicial; el PDF original se conserva sin modificar.

### Nota al pie sobre bebidas

La página 8 indica un recargo a todas las bebidas de **S/ 0.50 los sábados y domingos**, y **S/ 1.00 en feriados o festivos**. Esta nota se incorpora al menú de referencia; no explica los precios dobles de los platos. Antes de automatizar el cálculo, confirmar cómo tratar un feriado que coincida con fin de semana y qué fechas considera el restaurante como festivas.

La corrección de Jalea Arrecife a S/ 48.00, confirmada por el propietario, prevalece sobre el precio de S/ 47.50 que aún aparece en la página 7 del PDF original. El PDF se conserva sin modificar.

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
- [x] Confirmar vigencia de precios, igualdad entre sedes y disponibilidad con el propietario, según lo comunicado por el usuario.
- [x] Corregir Jalea Arrecife a S/ 48.00.
- [x] Revisar el PDF y aclarar las presentaciones de chaufa de cecina, pollada y filete a la plancha.
- [x] Aclarar con el usuario las presentaciones de El Carretillero, Mi Causa la Novia, Arroz con Pato y Panceta con Chaufa.
- [x] Continuar con tarjetas sin imagen; las fotografías autorizadas se pueden incorporar después.
- [x] Crear `DishCard`, `CategoryList` y la página `/carta` con 7 platos reales y 5 categorías.
- [x] Completar la carga del resto de la carta: 173 productos, 270 presentaciones y 35 categorías, contrastados con las ocho páginas del PDF el 03/10/2026.
- [x] Incorporar bebidas con alcohol y tamaños de bebidas; mostrar la nota de recargos sin automatizar las fechas coincidentes.
- [x] Compartir productos repetidos entre categorías y limitar a Extra los cebiches y Negra Diabla de piqueos para dos.
- [x] Validar categorías, identificadores, presentaciones y precios enteros no negativos; comprobar cobertura y aclaraciones mediante `npm test`.
