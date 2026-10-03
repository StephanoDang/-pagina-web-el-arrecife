import assert from 'node:assert/strict'
import test from 'node:test'
import { getDishesForCategory, menuCategories, menuDishes } from '../src/data/menu.ts'
import { validateMenu } from '../src/data/validateMenu.ts'

// Inventario independiente, contado por sección en las ocho páginas del PDF.
// Las alternativas de un mismo producto (pasta, pescado, bebidas) son presentaciones.
const sourceInventory = {
  leches: 4, copones: 5, 'cebiches-tradicionales': 2, cebiches: 7,
  'conchas-negras': 5, tiraditos: 4, duos: 8, causas: 10,
  chicharrones: 8, jalea: 1, arroces: 6, parihuelas: 5, sudados: 4,
  chilcanos: 3, pescados: 4, parrilla: 4, risottos: 2, cecina: 3,
  fetuchinis: 4, pollo: 7, norte: 7, sur: 5, centro: 6, criolla: 5,
  'tacu-tacus': 12, panceta: 4, piqueos: 8, 'piqueos-dos': 10,
  postres: 1, bebidas: 8, infusiones: 4, cervezas: 6, pisco: 7,
  sangria: 1, vinos: 2,
}
const find = (id) => {
  const item = menuDishes.find((dish) => dish.id === id)
  assert.ok(item, `Falta ${id}`)
  return item
}
const prices = (id) => find(id).presentations.map((option) => option.priceInCents)

test('todas las secciones del PDF contienen sus productos', () => {
  assert.deepEqual(menuCategories.map((category) => category.id), Object.keys(sourceInventory))
  for (const [categoryId, expected] of Object.entries(sourceInventory)) {
    assert.equal(getDishesForCategory(categoryId).length, expected, categoryId)
  }
  assert.equal(menuDishes.length, 173)
  assert.equal(menuDishes.reduce((total, dish) => total + dish.presentations.length, 0), 270)
  assert.doesNotThrow(() => validateMenu(menuCategories, menuDishes))
})

test('se conservan las aclaraciones del propietario y las presentaciones del PDF', () => {
  assert.deepEqual(prices('carretillero'), [2250, 2750])
  assert.deepEqual(prices('causa-novia'), [3300, 4000])
  assert.deepEqual(prices('chaufa-cecina'), [3000, 3600])
  assert.deepEqual(prices('arroz-pato'), [3800, 4500, 5000])
  assert.deepEqual(prices('panceta-chaufa'), [3250, 3850])
  assert.deepEqual(prices('pollada'), [1950, 2300])
  assert.deepEqual(prices('filete-plancha'), [2100, 2450])
  assert.deepEqual(prices('jalea-arrecife'), [4800])
  assert.deepEqual(prices('causa-acebichada'), [2900, 3700])
  assert.deepEqual(prices('choritos'), [1600, 2500])
  assert.deepEqual(prices('fetuchinis-huancaina'), [2600, 2700, 2900, 4300, 3650, 3650, 3600, 3700])
  assert.deepEqual(prices('pescado-cabrilla'), [2900, 2900, 3100, 3100, 3300, 3700, 3700])
  assert.deepEqual(prices('misti'), [3400, 4000])
})

test('se incluyen bebidas, tamaños y precios base de la página 8', () => {
  assert.deepEqual(prices('maracuya'), [650, 750, 1450, 1950])
  assert.deepEqual(prices('chicha-morada'), [700, 800, 1500, 2100])
  assert.deepEqual(prices('gaseosas'), [350, 550, 750, 1050])
  assert.deepEqual(prices('te'), [400, 750, 1450])
  assert.deepEqual(prices('pisco-sour'), [1500, 4400])
  assert.deepEqual(prices('maracuya-sour'), [1600, 4700])
  assert.deepEqual(prices('sangria-tabernero'), [650, 1500, 2500])
  assert.deepEqual(prices('intipalka'), [5000])
  for (const beer of getDishesForCategory('cervezas')) {
    assert.equal(beer.presentations[0].name, '630 ml')
  }
})

test('los productos compartidos mantienen precios y Extra se limita a piqueos para dos', () => {
  const originalPrices = prices('cebiche-pescado')
  const expected = { 'cebiche-pescado': 4500, 'cebiche-mixto': 4800, 'negra-diabla': 6000 }
  for (const [id, price] of Object.entries(expected)) {
    const dish = getDishesForCategory('piqueos-dos').find((item) => item.id === id)
    assert.deepEqual(dish.presentations.map((option) => [option.id, option.priceInCents]), [['extra', price]])
  }
  assert.deepEqual(prices('cebiche-pescado'), originalPrices)
  assert.equal(getDishesForCategory('cecina').find((dish) => dish.id === 'cebiche-cecina'), find('cebiche-cecina'))
  const headings = menuCategories.flatMap((category) =>
    getDishesForCategory(category.id).map((dish) => `dish-${category.id}-${dish.id}`))
  assert.equal(new Set(headings).size, headings.length)
})

test('se rechazan precios inválidos, duplicados, categorías inexistentes y categorías vacías', () => {
  const categories = [{ id: 'carta', name: 'Carta' }]
  const item = { ...find('causa-arrecife'), categoryId: 'carta', additionalCategoryIds: [] }
  for (const priceInCents of [-1, 12.5, NaN, Infinity]) {
    assert.throws(() => validateMenu(categories, [{ ...item, presentations: [{ id: 'unica', name: 'Única', priceInCents }] }]), /Precio inválido/)
  }
  assert.throws(() => validateMenu(categories, [item, item]), /duplicado/)
  assert.throws(() => validateMenu(categories, [{ ...item, categoryId: 'desconocida' }]), /inexistente/)
  assert.throws(() => validateMenu(categories, [{ ...item, presentations: [] }]), /sin presentaciones/)
  assert.throws(() => validateMenu(categories, [{ ...item, presentations: [item.presentations[0], item.presentations[0]] }]), /duplicada/)
  assert.throws(() => validateMenu([...categories, { id: 'vacia', name: 'Vacía' }], [item]), /vacía/)
})
