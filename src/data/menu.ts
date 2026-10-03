import type { Dish, DishPresentation, MenuCategory } from '../types/menu'
import { validateMenu } from './validateMenu.ts'

// PDF de febrero de 2026, contrastado el 03/10/2026. Importes en céntimos.
// Las aclaraciones en docs/datos-carta.md prevalecen sobre el PDF.
export const menuCategories: MenuCategory[] = [
  { id: 'leches', name: 'Leches' },
  { id: 'copones', name: 'Copón de Leche' },
  { id: 'cebiches-tradicionales', name: 'Cebiches Tradicionales' },
  { id: 'cebiches', name: 'Nuestros Cebiches' },
  { id: 'conchas-negras', name: 'Conchas Negras' },
  { id: 'tiraditos', name: 'Tiraditos' },
  { id: 'duos', name: 'Dúos' },
  { id: 'causas', name: 'Causas' },
  { id: 'chicharrones', name: 'Chicharrones' },
  { id: 'jalea', name: 'Jalea' },
  { id: 'arroces', name: 'Arroces' },
  { id: 'parihuelas', name: 'Parihuelas' },
  { id: 'sudados', name: 'Sudados' },
  { id: 'chilcanos', name: 'Chilcanos' },
  { id: 'pescados', name: 'Pescados Enteros y Filete' },
  { id: 'parrilla', name: 'Con un Toque Parrillero' },
  { id: 'risottos', name: 'Risottos' },
  { id: 'cecina', name: 'Cecina' },
  { id: 'fetuchinis', name: 'Fetuchinis' },
  { id: 'pollo', name: 'Pollo' },
  { id: 'norte', name: 'Cocina del Norte' },
  { id: 'sur', name: 'Cocina del Sur' },
  { id: 'centro', name: 'Cocina del Centro' },
  { id: 'criolla', name: 'Cocina Criolla' },
  { id: 'tacu-tacus', name: 'Tacu Tacus' },
  { id: 'panceta', name: 'Panceta al Cilindro' },
  { id: 'piqueos', name: 'Piqueos' },
  { id: 'piqueos-dos', name: 'Piqueos para 2 Personas' },
  { id: 'postres', name: 'Postres' },
  { id: 'bebidas', name: 'Bebidas sin Alcohol' },
  { id: 'infusiones', name: 'Infusiones' },
  { id: 'cervezas', name: 'Cervezas' },
  { id: 'pisco', name: 'Pisco' },
  { id: 'sangria', name: 'Sangría' },
  { id: 'vinos', name: 'Vinos' },
]

type PriceOption = [id: string, name: string, priceInCents: number]
type Prices = number | [PriceOption, ...PriceOption[]]

function dish(
  id: string, categoryId: string, name: string, prices: Prices,
  description = '', additionalCategoryIds: string[] = [],
): Dish {
  const options: [PriceOption, ...PriceOption[]] = typeof prices === 'number'
    ? [['unica', 'Única', prices]] : prices
  const presentation = ([optionId, optionName, priceInCents]: PriceOption): DishPresentation =>
    ({ id: optionId, name: optionName, priceInCents })
  const [first, ...rest] = options
  return {
    id, categoryId, name, description, available: true, additionalCategoryIds,
    presentations: [presentation(first), ...rest.map(presentation)],
  }
}

export const beverageSurchargeNotice =
  'Precios base de bebidas. La carta indica un recargo de S/ 0.50 los sábados y domingos y de S/ 1.00 los feriados o festivos. Consulta el precio final cuando las fechas coincidan.'

// Los productos repetidos en el PDF comparten datos y precios entre categorías.
export const menuDishes: Dish[] = [
  dish('leche-tigre', 'leches', 'Leche de Tigre', 1750),
  dish('leche-pantera', 'leches', 'Leche de Pantera', 1750, 'Con conchas negras.'),
  dish('leche-gringa', 'leches', 'Leche Gringa', 1750, 'Pescado y langostinos en ají amarillo.'),
  dish('leche-diabla', 'leches', 'Leche Diabla', 1750, 'Pescado y langostinos en tres ajíes: rocoto, ají amarillo y ají limo.'),
  dish('leche-power', 'copones', 'Leche Power', 2800, '1/2 litro de leche de tigre con chicharrón de pota.'),
  dish('leche-orca', 'copones', 'Leche de Orca', 3100, '1/2 litro de leche de tigre con pescado, mariscos y una concha negra. Con chicharrón de pota.'),
  dish('pantera-power', 'copones', 'Pantera Power', 3100, '1/2 litro de leche de pantera con conchas negras y chicharrón de pota.'),
  dish('gringa-power', 'copones', 'Gringa Power', 3100, '1/2 litro de leche gringa con pescado, langostinos y chicharrón de pota.'),
  dish('diabla-power', 'copones', 'Diabla Power', 3100, '1/2 litro de leche en tres ajíes con pescado, langostinos y chicharrón de pota.'),
  dish('cebiche-pescado', 'cebiches-tradicionales', 'Cebiche de Pescado', [
    ['personal', 'Personal', 3150],
    ['extra', 'Extra (2 personas)', 4500],
    ['mediano', 'Mediano', 9000],
    ['familiar', 'Familiar', 12000],
  ], '', ['piqueos-dos']),
  dish('cebiche-mixto', 'cebiches-tradicionales', 'Cebiche Mixto', [
    ['personal', 'Personal', 3350],
    ['extra', 'Extra (2 personas)', 4800],
    ['mediano', 'Mediano', 9500],
    ['familiar', 'Familiar', 12600],
  ], '', ['piqueos-dos']),
  dish('cebiche-arrecife', 'cebiches', 'Cebiche Arrecife', 3900, 'Pescado, pulpo, calamar, langostinos, concha de abanico y una concha negra.'),
  dish('cebiche-corvina', 'cebiches', 'Cebiche de Corvina', 3650, 'Acompañado de su crocante piel frita al instante.'),
  dish('cebiche-cecina', 'cebiches', 'Cebiche de Cecina', 3000, 'Cecina, limón, ají limo, cebolla y culantro; acompañado de patacones agridulces y yucas sancochadas.', ['cecina']),
  dish('velo-novia', 'cebiches', 'Velo de Novia', 3500, 'Cebiche de pescado en crema blanca a base de calamar, concha de abanico y langostinos.'),
  dish('endiablado', 'cebiches', 'Endiablado', 3500, 'Pescado y langostinos en crema de rocoto, ají amarillo y ají limo.'),
  dish('cebiche-di', 'cebiches', 'Cebiche Dí', 3500, 'Cebiche chiclayano acompañado de seis tortitas de choclo.', ['norte']),
  dish('carretillero', 'cebiches', 'El Carretillero', [
    ['pota', 'De pota', 2250],
    ['pescado', 'De pescado', 2750],
  ], 'Cebiche de pota o pescado, acompañado de chicharrón de pota.'),
  dish('cebiche-conchas-negras', 'conchas-negras', 'Cebiche de Conchas Negras', 3250),
  dish('negra-diabla', 'conchas-negras', 'Negra Diabla', [
    ['personal', 'Personal', 3500],
    ['extra', 'Extra (2 personas)', 6000],
  ], 'Cebiche de pescado y langostinos en crema de tres ajíes junto a cebiche de conchas negras.', ['piqueos-dos']),
  dish('arroz-conchas-negras', 'conchas-negras', 'Arroz con Conchas Negras', 4400, 'Con calamar, langostinos, palta y una copita de leche de tigre.'),
  dish('cebiche-clasico', 'conchas-negras', 'Cebiche Clásico', 3500, 'Cebiche de conchas negras y cebiche de pescado.'),
  dish('clasico-caliente', 'conchas-negras', 'Clásico Caliente', 3500, 'Cebiche de conchas negras y chicharrón de pescado.'),
  dish('tiradito-amarillo', 'tiraditos', 'Tiradito en Ají Amarillo', 3200),
  dish('tiradito-bicolor', 'tiraditos', 'Tiradito Bicolor', 3400, 'Amarillo y rojo.'),
  dish('tiradito-banderazo', 'tiraditos', 'Tiradito Banderazo', 3400, 'Rojo, blanco y rojo.'),
  dish('tiradito-tricolor', 'tiraditos', 'Tiradito Tricolor', 3600, 'Amarillo, rojo y blanco.'),
  dish('duo-pota', 'duos', 'Dúo con Chicharrón de Pota', 3000, 'Cebiche de pescado con chicharrón de pota.'),
  dish('duo-pescado', 'duos', 'Dúo con Chicharrón de Pescado', 3350, 'Cebiche de pescado con chicharrón de pescado.'),
  dish('duo-calamar', 'duos', 'Dúo con Chicharrón de Calamar', 3650, 'Cebiche de pescado con chicharrón de calamar.'),
  dish('duo-langostinos', 'duos', 'Dúo con Chicharrón de Langostinos', 3700, 'Cebiche de pescado con chicharrón de langostinos.'),
  dish('duo-orgia', 'duos', 'Dúo con Orgía Marina', 3700, 'Cebiche de pescado con orgía marina.'),
  dish('duo-arroz', 'duos', 'Dúo con Arroz con Mariscos', 3500, 'Cebiche de pescado con arroz con mariscos.'),
  dish('duo-chaufa-pescado', 'duos', 'Dúo con Chaufa de Pescado', 3500, 'Cebiche de pescado con chaufa de pescado.'),
  dish('duo-chaufa-mariscos', 'duos', 'Dúo con Chaufa de Mariscos', 3500, 'Cebiche de pescado con chaufa de mariscos.'),
  dish('causa-arrecife', 'causas', 'Causa Arrecife', 2150, 'Causa rellena de palta y langostinos.'),
  dish('causa-amigos', 'causas', 'Mi Causa y sus Amigos', 4800, 'Piqueo para dos: Causa Arrecife, pulpo al olivo, crema huancaína y dos shots de leche de tigre.', ['piqueos-dos']),
  dish('boli-causas', 'causas', 'Boli Causas', [
    ['cinco', '5 causas', 2300],
  ], 'Acebichada, langostinos, huancaína, pulpo al olivo y cóctel de langostinos.'),
  dish('pollo-causa', 'causas', 'Pollo-Causa', 2300, 'Rellena de pollo con chicharrones de pollo.'),
  dish('causa-acebichada', 'causas', 'Causa Acebichada', [
    ['media', 'Media', 2900],
    ['completa', 'Completa', 3700],
  ], 'Causa rellena de palta y langostinos acompañada de cebiche de pescado.'),
  dish('causa-huancaina', 'causas', 'Causa a la Huancaína', 3000, 'Causa Arrecife con langostinos, crema huancaína y dos shots de leche de tigre.', ['piqueos']),
  dish('causa-novia', 'causas', 'Mi Causa la Novia', [
    ['sin-cebiche', 'Sin cebiche', 3300],
    ['con-cebiche', 'Con cebiche Velo de Novia', 4000],
  ], 'Causa de palta y langostinos, con opción de agregar cebiche Velo de Novia.'),
  dish('causa-pulpo', 'causas', 'Causa con Pulpo al Olivo', 3600, 'Láminas de pulpo en aceite de oliva con palta, galleta soda y causa de langostinos.'),
  dish('pulpo-olivo', 'causas', 'Pulpo al Olivo', 4300),
  dish('causa-mar-tierra', 'causas', 'Causa Mar y Tierra', 3900, 'Causa de palta y langostinos, cebiche de pescado en crema de ají amarillo y cebiche mixto.'),
  dish('chicharron-pescado', 'chicharrones', 'Chicharrón de Pescado', [
    ['1', 'Personal', 3100],
    ['2', 'Mediano', 5900],
    ['3', 'Familiar', 9000],
  ]),
  dish('chicharron-mixto', 'chicharrones', 'Chicharrón Mixto', [
    ['1', 'Personal', 3300],
    ['2', 'Mediano', 6500],
    ['3', 'Familiar', 9500],
  ]),
  dish('chicharron-pota', 'chicharrones', 'Chicharrón de Pota', 2500),
  dish('chicharron-langostinos', 'chicharrones', 'Chicharrón de Langostinos', 3700),
  dish('chicharron-calamar', 'chicharrones', 'Chicharrón de Calamar', 3700),
  dish('po-la-ca', 'chicharrones', 'Po La Ca', 4600, 'Pota, langostinos y calamar.'),
  dish('huevera', 'chicharrones', 'Huevera Frita con Leche de Tigre', 3000),
  dish('chicharron-arrecife', 'chicharrones', 'Chicharrón Arrecife', [
    ['pescado', 'De pescado (2 personas)', 4750],
    ['mixto', 'Mixto (2 personas)', 4750],
  ], 'Chicharrón de pescado o mixto acompañado de cebiche de pescado.', ['piqueos-dos']),
  dish('jalea-arrecife', 'jalea', 'Jalea Arrecife', 4800, 'Pescado entero, huevera, calamar, langostinos, pota, yuyo, chifles y yucas fritas. Incluye dos shots de leche de tigre.', ['piqueos-dos']),
  dish('arroz-mariscos', 'arroces', 'Arroz con Mariscos', [
    ['sin-leche', 'Sin leche de tigre', 3100],
    ['con-leche', 'Con copita de leche de tigre', 3700],
  ]),
  dish('arroz-langostinos', 'arroces', 'Arroz con Langostinos', [
    ['sin-leche', 'Sin leche de tigre', 3400],
    ['con-leche', 'Con copita de leche de tigre', 4000],
  ]),
  dish('chaufa-pescado', 'arroces', 'Chaufa de Pescado', [
    ['sin-leche', 'Sin leche de tigre', 2900],
    ['con-leche', 'Con copita de leche de tigre', 3500],
  ]),
  dish('chaufa-mariscos', 'arroces', 'Chaufa de Mariscos', [
    ['sin-leche', 'Sin leche de tigre', 3000],
    ['con-leche', 'Con copita de leche de tigre', 3600],
  ]),
  dish('chaufa-tortilla', 'arroces', 'Chaufa con Tortilla de Langostinos', [
    ['sin-leche', 'Sin leche de tigre', 3400],
    ['con-leche', 'Con copita de leche de tigre', 4000],
  ]),
  dish('misti', 'arroces', 'El Misti', [
    ['sin-leche', 'Sin leche de tigre', 3400],
    ['con-leche', 'Con copita de leche de tigre', 4000],
  ], 'Arroz con mariscos cubiertos de salsa bechamel.'),
  dish('parihuela-cabrilla', 'parihuelas', 'Parihuela de Cabrilla', 3600, 'De pescado y mariscos.'),
  dish('parihuela-tramboyo', 'parihuelas', 'Parihuela de Tramboyo', 4000, 'De pescado y mariscos.'),
  dish('parihuela-corvina', 'parihuelas', 'Parihuela de Filete de Corvina', 4200, 'De pescado y mariscos.'),
  dish('parihuela-chita', 'parihuelas', 'Parihuela de Chita', 5200, 'De pescado y mariscos.'),
  dish('parihuela-afrodisiaca', 'parihuelas', 'Parihuela Afrodisiaca', 4000, 'Parihuela de cabrilla y mariscos con una copita de leche de tigre, concha negra y maca.'),
  dish('sudado-cabrilla', 'sudados', 'Sudado de Cabrilla', 2900),
  dish('sudado-tramboyo', 'sudados', 'Sudado de Tramboyo', 3300),
  dish('sudado-corvina', 'sudados', 'Sudado de Filete de Corvina', 3500),
  dish('sudado-chita', 'sudados', 'Sudado de Chita', 4500),
  dish('chilcano-pescado', 'chilcanos', 'Chilcano de Pescado', 1800),
  dish('chilcano-criollo', 'chilcanos', 'Chilcano Criollo', 2000, 'Con fideos cabello de ángel y papas amarillas.'),
  dish('chilcano-duo', 'chilcanos', 'Dúo de Chilcano', 3250, 'Chilcano de pescado, chicharrón de pescado y shot de leche de tigre.'),
  dish('pescado-chita', 'pescados', 'Chita (350 g)', [
    ['1', 'Frito', 4500],
    ['2', 'Sudado', 4500],
    ['3', 'En salsa al ajo', 4700],
    ['4', 'Al vapor', 4700],
    ['5', 'En salsa de champiñones', 4900],
    ['6', 'En salsa de mariscos', 5200],
    ['7', 'En salsa de langostinos', 5200],
  ]),
  dish('pescado-corvina', 'pescados', 'Filete de Corvina', [
    ['1', 'Frito', 3500],
    ['2', 'Sudado', 3500],
    ['3', 'En salsa al ajo', 3700],
    ['4', 'Al vapor', 3700],
    ['5', 'En salsa de champiñones', 3900],
    ['6', 'En salsa de mariscos', 4200],
    ['7', 'En salsa de langostinos', 4200],
  ]),
  dish('pescado-tramboyo', 'pescados', 'Tramboyo (350 g)', [
    ['1', 'Frito', 3300],
    ['2', 'Sudado', 3300],
    ['3', 'En salsa al ajo', 3500],
    ['4', 'Al vapor', 3500],
    ['5', 'En salsa de champiñones', 3700],
    ['6', 'En salsa de mariscos', 4000],
    ['7', 'En salsa de langostinos', 4000],
  ]),
  dish('pescado-cabrilla', 'pescados', 'Cabrilla (350 g)', [
    ['1', 'Frito', 2900],
    ['2', 'Sudado', 2900],
    ['3', 'En salsa al ajo', 3100],
    ['4', 'Al vapor', 3100],
    ['5', 'En salsa de champiñones', 3300],
    ['6', 'En salsa de mariscos', 3700],
    ['7', 'En salsa de langostinos', 3700],
  ]),
  dish('cabrilla-parrilla', 'parrilla', 'Cabrilla a la Parrilla', 3300, 'Con guarnición saltada de espárragos, papa, choclo, champiñones y pimiento.'),
  dish('pulpo-parrilla', 'parrilla', 'Pulpo a la Parrilla', 4300, 'Con guarnición saltada de espárragos, papa, choclo, champiñones y pimiento.'),
  dish('parrilla-marina', 'parrilla', 'Parrilla Marina', 5600, 'Filete de corvina, pulpo, calamar, langostinos y concha de abanico en salsa parrillera. Con guarnición saltada de espárragos, papa, choclo, champiñones y pimiento.'),
  dish('lomo-parrillero', 'parrilla', 'Lomo Fino Parrillero', 3800, 'Con guarnición parrillera o papas amarillas fritas y ensalada fresca.'),
  dish('risotto-orgia', 'risottos', 'Orgía de Mariscos', [
    ['sin-leche', 'Sin leche de tigre', 3300],
    ['con-leche', 'Con copita de leche de tigre', 3900],
  ], 'Arroz nacional en ají amarillo con extra queso mozzarella y parmesano.'),
  dish('risotto-anticuchero', 'risottos', 'Risotto Anticuchero', 3700, 'Risotto en crema de ají amarillo con mozzarella y parmesano, montado con lomo fino en salsa anticuchera.'),
  dish('tacu-cecina-jugo', 'cecina', 'Tacu Tacu con Cecina al Jugo', 3350),
  dish('chaufa-cecina', 'cecina', 'Chaufa de Cecina', [
    ['sin-leche', 'Sin leche de tigre', 3000],
    ['con-leche', 'Con copita de leche de tigre', 3600],
  ], 'Chaufa ahumado con patacones y opción de leche de tigre.'),
  dish('fetuchinis-verdes', 'fetuchinis', 'Fetuchinis Verdes', [
    ['1', 'Con 1/4 Pollada Limeña', 3200],
    ['2', 'Con lomo fino', 4000],
    ['3', 'Con bisté apanado', 4000],
  ], 'Con papa a la huancaína.'),
  dish('fetuchinis-huancaina', 'fetuchinis', 'Fetuchinis a la Huancaína', [
    ['1', 'Con 1/4 Pollada Limeña', 2600],
    ['2', 'Con filete de pollo', 2700],
    ['3', 'Con pollo saltado', 2900],
    ['4', 'Con pulpo a la parrilla', 4300],
    ['5', 'Con lomo fino saltado', 3650],
    ['6', 'Con filete de corvina', 3650],
    ['7', 'Con lomo fino grillado', 3600],
    ['8', 'Con lomo fino anticuchero', 3700],
  ]),
  dish('fetuchinis-alfredo', 'fetuchinis', 'Fetuchinis a lo Alfredo', [
    ['1', 'Solo', 2300],
    ['2', 'Con 1/4 Pollada Limeña', 2900],
    ['3', 'Con filete de pollo', 3000],
    ['4', 'Con lomo fino anticuchero', 3950],
    ['5', 'Con lomo fino saltado', 3950],
  ]),
  dish('fetuchinis-roja', 'fetuchinis', 'Fetuchinis en Salsa Roja', [
    ['1', 'Con langostinos', 3400],
    ['2', 'Con mariscos', 3500],
  ]),
  dish('pollada', 'pollo', '1/4 Pollada Limeña', [
    ['1', 'Con papas sancochadas', 1950],
    ['2', 'Con papas andinas fritas', 2300],
  ], 'Porción de pierna.'),
  dish('filete-plancha', 'pollo', 'Filete a la Plancha', [
    ['1', 'Con papas sancochadas', 2100],
    ['2', 'Con papas andinas fritas', 2450],
  ]),
  dish('pollo-saltado', 'pollo', 'Pollo Saltado', 2500, 'Con papas andinas fritas y arroz.'),
  dish('dieta-pollo', 'pollo', 'Dieta de Pollo', 1950, 'Sustancia baja en condimentos.'),
  dish('chicharron-pollo', 'pollo', 'Chicharrón de Pollo', 2500),
  dish('pollo-champinones', 'pollo', 'Filete de Pollo en Salsa de Champiñones', 2650),
  dish('cordon-bleu', 'pollo', 'Cordon Bleu de Pollo', [
    ['1', 'Con salsa de champiñones', 3300],
    ['2', 'Con salsa de langostinos', 3700],
  ], 'Filetes de pollo horneados con jamón y queso mozzarella.'),
  dish('tamalitos', 'norte', 'Tamalitos Verdes', 900, 'Con jugo de seco norteño y sarza criolla.'),
  dish('arroz-pato', 'norte', 'Arroz con Pato', [
    ['solo', 'Solo', 3800],
    ['huancaina', 'Con papa a la huancaína', 4500],
    ['huancaina-leche', 'Con papa a la huancaína y leche de tigre', 5000],
  ], 'Al estilo norteño, con cerveza negra, chicha de jora y zapallito loche.'),
  dish('seco-pato', 'norte', 'Seco de Pato a la Norteña con Frejoles', 3800),
  dish('pato-piurana', 'norte', 'Pato a la Piurana', 4500, '1/4 de pato a la norteña con tamalito verde, arroz verde y yucas sancochadas.'),
  dish('seco-cordero', 'norte', 'Seco de Cordero a la Norteña con Frejoles', 3200, 'Con chicha de jora y zapallito loche.'),
  dish('cordero-piurana', 'norte', 'Cordero a la Piurana', 3900, 'Seco de cordero a la norteña con tamalito verde, arroz verde y yucas sancochadas.'),
  dish('rocoto', 'sur', 'Rocoto Relleno', 1600),
  dish('papa-ocopa', 'sur', 'Papa a la Ocopa', 1600, 'Con huevo.'),
  dish('costillar', 'sur', 'Costillar', 3700),
  dish('chupe-langostinos', 'sur', 'Chupe de Langostinos', 3750),
  dish('chupe-corvina', 'sur', 'Chupe de Corvina', 3750, 'Corvina previamente grillada en plancha.'),
  dish('papa-huancaina', 'centro', 'Papa a la Huancaína', 1600, 'Con huevo.'),
  dish('trucha-campesina', 'centro', 'Trucha Campesina', 2900, 'A la plancha con hierbas del Mantaro, ensalada fresca, papas sancochadas y choclo con queso.'),
  dish('trucha-frita', 'centro', 'Trucha Frita', 2900, 'Arrebozada con papas doradas, arroz y sarza criolla.'),
  dish('picante-cuy', 'centro', 'Picante de Cuy', 4500, 'Al estilo huancaíno, con ají mirasol, maní y huacatay.'),
  dish('cuy-chactado', 'centro', 'Cuy Chactado', 4300, 'Apanado con cancha tostada, papas doradas y arroz.'),
  dish('cuy-frito', 'centro', 'Cuy Frito', 4100, 'Sin apanar, con papas doradas y arroz.'),
  dish('osobuco', 'criolla', 'Osobuco de Ternera', 3500, 'Con fetuchinis en salsa blanca o frejoles y arroz blanco.'),
  dish('lomo-saltado', 'criolla', 'Lomo Fino Saltado', 3600, '200 g de lomo fino flambeado con pisco, papas amarillas fritas y arroz.'),
  dish('pato-saltado', 'criolla', 'Pato Saltado', 3900, '1/4 de pato sancochado con jora, loche y culantro, flambeado con pisco y servido con papas amarillas fritas y arroz.'),
  dish('fetuchinis-saltados', 'criolla', 'Fetuchinis Saltados', [
    ['1', 'Con lomo fino', 3500],
    ['2', 'Con pollo', 2800],
  ]),
  dish('biste-pobre', 'criolla', 'Bisté a lo Pobre', 3200, 'Con papas andinas fritas, huevo y patacones.'),
  dish('tacu-pollo', 'tacu-tacus', 'Tacu Tacu con Pollo Saltado', 2800),
  dish('tacu-lomo', 'tacu-tacus', 'Tacu Tacu con Lomo Fino Saltado', 3750),
  dish('tacu-cordero', 'tacu-tacus', 'Tacu Tacu con Seco de Cordero', 3300),
  dish('tacu-pescado', 'tacu-tacus', 'Tacu Tacu con Pescado Saltado', 3200),
  dish('tacu-costillar', 'tacu-tacus', 'Tacu Tacu con Costillar', 3800),
  dish('tacu-cecina', 'tacu-tacus', 'Tacu Tacu con Cecina Saltada', 3300),
  dish('tacu-seco-pato', 'tacu-tacus', 'Tacu Tacu con Seco de Pato', 3900),
  dish('tacu-mariscos', 'tacu-tacus', 'Tacu Tacu con Salsa de Mariscos', 3500),
  dish('tacu-pollada', 'tacu-tacus', 'Tacu-Pollada', 2600),
  dish('tacu-pobre', 'tacu-tacus', 'Tacu Tacu a lo Pobre con Lomo Fino', 4000),
  dish('tacu-pato', 'tacu-tacus', 'Tacu Tacu con Pato Saltado', 4000, 'Pato previamente guisado a la norteña y salteado en wok.'),
  dish('tacu-nortena', 'tacu-tacus', 'Tacu Tacu a la Norteña', [
    ['1', 'Con mero', 4000],
    ['2', 'Con salmón', 4000],
  ], 'Filete frito sobre tacu tacu con guiso norteño y sarza chalaca.'),
  dish('panceta-tradicional', 'panceta', 'Panceta al Cilindro Tradicional', 3250, '300 g con papas sancochadas, choclo, ensalada fresca y crema de ocopa.'),
  dish('panceta-chaufa', 'panceta', 'Panceta al Cilindro con Chaufa', [
    ['sin-leche', 'Sin leche de tigre', 3250],
    ['con-leche', 'Con copita de leche de tigre', 3850],
  ], 'Panceta al cilindro de 300 g con chaufa y opción de leche de tigre.'),
  dish('panceta-fetuchinis', 'panceta', 'Panceta al Cilindro con Fetuchinis a la Huancaína', 3600, 'Porción de panceta de 300 g.'),
  dish('panceta-tacu', 'panceta', 'Panceta al Cilindro con Tacu Tacu', 3600, 'Porción de panceta de 300 g.'),
  dish('tortitas', 'piqueos', 'Tortitas de Choclo', [
    ['ocho', '8 unidades', 1600],
  ]),
  dish('patacones', 'piqueos', 'Patacones Agridulces', [
    ['ocho', '8 unidades', 900],
  ]),
  dish('tequenos', 'piqueos', 'Tequeños 3 Quesos', [
    ['diez', '10 unidades', 2200],
  ], 'Con guacamole.'),
  dish('patacones-cecina', 'piqueos', 'Patacones con Cecina a la Chalaca', [
    ['diez', '10 unidades', 3300],
  ], 'Canastas de patacones rellenas de cecina a la chalaca.'),
  dish('choritos', 'piqueos', 'Choritos a la Chalaca', [
    ['seis', '6 unidades', 1600],
    ['diez', '10 unidades', 2500],
  ]),
  dish('conchitas-parmesana', 'piqueos', 'Conchitas a la Parmesana', [
    ['ocho', '8 unidades', 3400],
  ]),
  dish('conchitas-arrecife', 'piqueos', 'Conchitas Arrecife', [
    ['seis', '6 unidades', 3200],
  ], 'Conchas y langostinos a la bechamel.'),
  dish('chicharron-trucha-cebiche', 'piqueos-dos', 'Chicharrón de Trucha con Cebiche de Pescado', 4000),
  dish('trio-marino', 'piqueos-dos', 'Trío Marino', 4600, 'Cebiche de pescado, chicharrón de pescado y arroz con mariscos.'),
  dish('pocker-marino', 'piqueos-dos', 'Pocker Marino 4 en 1', 5500, 'Cebiche de pescado, causa con langostinos, chicharrón de pescado y arroz con mariscos.'),
  dish('ronda-marina', 'piqueos-dos', 'Ronda Marina 5 en 1', 7000, 'Cebiche de pescado, causa con langostinos, chicharrón de pescado, arroz con mariscos y leche de pantera.'),
  dish('queso-helado', 'postres', 'Queso Helado', 1200, 'Manjar arequipeño a base de leche fresca, leche condensada y coco rallado.'),
  dish('maracuya', 'bebidas', 'Maracuyá', [
    ['1', 'Vaso', 650],
    ['2', '1/2 litro', 750],
    ['3', '1 litro', 1450],
    ['4', '1.5 litros', 1950],
  ]),
  dish('limonada', 'bebidas', 'Limonada', [
    ['1', 'Vaso', 650],
    ['2', '1/2 litro', 750],
    ['3', '1 litro', 1450],
    ['4', '1.5 litros', 1950],
  ]),
  dish('chicha-morada', 'bebidas', 'Chicha Morada', [
    ['1', 'Vaso', 700],
    ['2', '1/2 litro', 800],
    ['3', '1 litro', 1500],
    ['4', '1.5 litros', 2100],
  ]),
  dish('chicha-jora', 'bebidas', 'Chicha de Jora', [
    ['1', 'Vaso', 700],
    ['2', '1/2 litro', 800],
    ['3', '1 litro', 1500],
    ['4', '1.5 litros', 2100],
  ]),
  dish('gaseosas', 'bebidas', 'Gaseosas', [
    ['1', 'Personal', 350],
    ['2', 'Gordita / Jumbo', 550],
    ['3', '1 litro', 750],
    ['4', '1.5 litros', 1050],
  ]),
  dish('san-mateo', 'bebidas', 'San Mateo', 350),
  dish('san-mateo-gas', 'bebidas', 'San Mateo con Gas', 400),
  dish('cuzquena-sin-alcohol', 'bebidas', 'Cuzqueña Trigo sin Alcohol', 750),
  dish('te', 'infusiones', 'Té', [
    ['1', 'Taza', 400],
    ['2', 'Tetera 1/2 litro', 750],
    ['3', 'Tetera 1 litro', 1450],
  ]),
  dish('anis', 'infusiones', 'Anís', [
    ['1', 'Taza', 400],
    ['2', 'Tetera 1/2 litro', 750],
    ['3', 'Tetera 1 litro', 1450],
  ]),
  dish('manzanilla', 'infusiones', 'Manzanilla', [
    ['1', 'Taza', 400],
    ['2', 'Tetera 1/2 litro', 750],
    ['3', 'Tetera 1 litro', 1450],
  ]),
  dish('hierba-luisa', 'infusiones', 'Hierba Luisa', [
    ['1', 'Taza', 400],
    ['2', 'Tetera 1/2 litro', 750],
    ['3', 'Tetera 1 litro', 1450],
  ]),
  dish('amstel', 'cervezas', 'Amstel', [
    ['botella', '630 ml', 1100],
  ]),
  dish('heineken', 'cervezas', 'Heineken', [
    ['botella', '630 ml', 1250],
  ]),
  dish('budwaiser', 'cervezas', 'Budwaiser', [
    ['botella', '630 ml', 1100],
  ]),
  dish('pilsen', 'cervezas', 'Pilsen', [
    ['botella', '630 ml', 1150],
  ]),
  dish('cuzquena-trigo', 'cervezas', 'Cuzqueña Trigo', [
    ['botella', '630 ml', 1250],
  ]),
  dish('cuzquena-malta', 'cervezas', 'Cuzqueña Malta', [
    ['botella', '630 ml', 1250],
  ]),
  dish('pisco-sour', 'pisco', 'Pisco Sour', [
    ['1', 'Individual', 1500],
    ['2', '1 litro', 4400],
  ]),
  dish('maracuya-sour', 'pisco', 'Maracuyá Sour', [
    ['1', 'Individual', 1600],
    ['2', '1 litro', 4700],
  ]),
  dish('algarrobina', 'pisco', 'Algarrobina', 1900),
  dish('chilcano-pisco', 'pisco', 'Chilcano', 1400),
  dish('chilcano-maracuya', 'pisco', 'Chilcano de Maracuyá', 1500),
  dish('piscola', 'pisco', 'Piscola', 1400),
  dish('inca-pisco', 'pisco', 'Inca Pisco', 1500, 'Pisco con Inca Kola.'),
  dish('sangria-tabernero', 'sangria', 'Sangría Tabernero', [
    ['1', 'Copa', 650],
    ['2', '1/2 litro', 1500],
    ['3', '1 litro', 2500],
  ]),
  dish('santiago-queirolo', 'vinos', 'Santiago Queirolo', 2800),
  dish('intipalka', 'vinos', 'Intipalka Sauvignon Blanc', 5000),
]

validateMenu(menuCategories, menuDishes)

// En piqueos para dos se muestran únicamente las presentaciones Extra del PDF.
export function getDishesForCategory(categoryId: string): Dish[] {
  return menuDishes
    .filter((item) => item.categoryId === categoryId || item.additionalCategoryIds?.includes(categoryId))
    .map((item): Dish => {
      if (categoryId === 'piqueos-dos' && ['cebiche-pescado', 'cebiche-mixto', 'negra-diabla'].includes(item.id)) {
        const extra = item.presentations.find((option) => option.id === 'extra')
        if (!extra) throw new Error(`Falta la presentación Extra de ${item.id}`)
        return { ...item, presentations: [extra] }
      }
      return item
    })
}
