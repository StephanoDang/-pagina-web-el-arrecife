import assert from 'node:assert/strict'
import test from 'node:test'
import { filterMenu } from '../src/data/filterMenu.ts'
import { getDishesForCategory, menuCategories, menuDishes } from '../src/data/menu.ts'

const filter = (query = '', category = 'all') => filterMenu(menuCategories, getDishesForCategory, query, category)
const ids = (result) => [...new Set(result.sections.flatMap((section) => section.dishes.map((dish) => dish.id)))].sort()

test('la carta sin filtros conserva sus productos y cuenta una vez los compartidos', () => {
  const result = filter()
  assert.equal(result.resultCount, 173)
  assert.equal(result.totalMatches, 173)
  assert.equal(result.sections.length, 35)
  assert.equal(result.sections.reduce((count, section) => count + section.dishes.length, 0), 182)
  assert.deepEqual(ids(filter('   ')), ids(result))
  assert.deepEqual(ids(filter('...')), ids(result))
})

test('la búsqueda reconoce mayúsculas y palabras con o sin tildes', () => {
  assert.deepEqual(ids(filter('MARACUYA')), ids(filter('maracuyá')))
  assert.deepEqual(ids(filter('AJÍ')), ids(filter('aji')))
  assert.ok(ids(filter('MARACUYA')).includes('maracuya-sour'))
  assert.ok(ids(filter('AJÍ')).includes('leche-diabla'))
})

test('se buscan nombres, ingredientes, presentaciones y categorías', () => {
  assert.ok(ids(filter('Arrecife')).includes('jalea-arrecife'))
  assert.ok(ids(filter('maca')).includes('parihuela-afrodisiaca'))
  assert.ok(ids(filter('tetera')).includes('manzanilla'))
  assert.deepEqual(ids(filter('cocina del centro')), getDishesForCategory('centro').map((dish) => dish.id).sort())
})

test('búsqueda y categoría se combinan conservando los precios de esa sección', () => {
  assert.deepEqual(ids(filter('huancaína leche', 'norte')), ['arroz-pato'])
  assert.deepEqual(ids(filter('SOUR', 'pisco')), ['maracuya-sour', 'pisco-sour'])
  assert.deepEqual(ids(filter('pescado', 'piqueos-dos')).includes('cebiche-pescado'), true)
  const extra = filter('pescado', 'piqueos-dos').sections[0].dishes.find((dish) => dish.id === 'cebiche-pescado')
  assert.deepEqual(extra.presentations.map((option) => option.priceInCents), [4500])
  assert.equal(filter('maracuya', 'pollo').resultCount, 0)
})

test('las búsquedas sin coincidencias no muestran categorías vacías', () => {
  const result = filter('plato-que-no-existe-xyz')
  assert.equal(result.resultCount, 0)
  assert.equal(result.totalMatches, 0)
  assert.deepEqual(result.sections, [])
  assert.ok(result.categories.every((category) => category.count === 0))
})

test('los contadores permiten cambiar de categoría con la misma búsqueda', () => {
  const result = filter('maracuya', 'pollo')
  assert.equal(result.resultCount, 0)
  assert.ok(result.totalMatches > 0)
  assert.equal(result.categories.find((category) => category.id === 'bebidas').count, 1)
  assert.equal(result.categories.find((category) => category.id === 'pisco').count, 2)
  assert.deepEqual(ids(filter('maracuya', 'bebidas')), ['maracuya'])
})

test('filtrar y limpiar no modifica el catálogo ni sus presentaciones', () => {
  const before = JSON.stringify(menuDishes)
  filter('extra', 'piqueos-dos')
  filter('langostinos')
  assert.equal(filter().resultCount, 173)
  assert.equal(JSON.stringify(menuDishes), before)
})
