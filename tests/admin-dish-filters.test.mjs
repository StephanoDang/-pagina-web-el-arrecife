import assert from 'node:assert/strict'
import test from 'node:test'
import { menuDishes } from '../src/data/menu.ts'
import { filterAdminDishes, getPageCount, paginateItems } from '../src/pages/admin/adminDishFilters.ts'
import { setAdminDishAvailability } from '../src/pages/admin/adminDishState.ts'

test('combina búsqueda y filtros de categoría y disponibilidad', () => {
  const dishes = setAdminDishAvailability(menuDishes, 'cebiche-pescado', false)
  const results = filterAdminDishes(dishes, { query: 'cebiche mixto', categoryId: 'cebiches-tradicionales', availability: 'available' })
  assert.ok(results.length > 0)
  assert.ok(results.every((dish) => dish.available && dish.categoryId === 'cebiches-tradicionales' && /cebiche/i.test(dish.name) && /mixto/i.test(dish.name)))
})

test('los filtros sin coincidencias producen una lista vacía', () => {
  assert.deepEqual(filterAdminDishes(menuDishes, { query: 'plato inexistente', categoryId: 'all', availability: 'all' }), [])
  assert.deepEqual(filterAdminDishes(menuDishes, { query: '', categoryId: 'cebiches', availability: 'unavailable' }), [])
})

test('la paginación calcula páginas y recorta elementos', () => {
  const items = Array.from({ length: 45 }, (_, index) => index + 1)
  assert.equal(getPageCount(items.length, 20), 3)
  assert.deepEqual(paginateItems(items, 1, 20), items.slice(0, 20))
  assert.deepEqual(paginateItems(items, 3, 20), [41, 42, 43, 44, 45])
  assert.equal(getPageCount(0, 20), 1)
})
