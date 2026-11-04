import assert from 'node:assert/strict'
import test from 'node:test'
import { menuCategories } from '../src/data/menu.ts'
import { parseAdminDishPrice, validateAdminDishForm } from '../src/pages/admin/adminDishForm.ts'

const validValues = {
  name: 'Cebiche de prueba',
  categoryId: 'cebiches',
  price: '35.50',
  description: '',
}

test('requiere nombre, categoría y precio', () => {
  assert.deepEqual(validateAdminDishForm({ name: '  ', categoryId: '', price: '', description: '' }, menuCategories), {
    name: 'Escribe el nombre del plato.',
    categoryId: 'Selecciona una categoría.',
    price: 'Escribe el precio del plato.',
  })
})

test('rechaza categorías desconocidas y precios inválidos', () => {
  for (const price of ['0', '-1', '1.999', '1e2', 'abc', '90071992547410.00']) {
    assert.ok(validateAdminDishForm({ ...validValues, price }, menuCategories).price, `debe rechazar ${price}`)
  }
  assert.ok(validateAdminDishForm({ ...validValues, categoryId: 'inventada' }, menuCategories).categoryId)
})

test('convierte precios positivos a céntimos sin errores de coma flotante', () => {
  assert.equal(parseAdminDishPrice('35.50'), 3550)
  assert.equal(parseAdminDishPrice('35,5'), 3550)
  assert.equal(parseAdminDishPrice('0.01'), 1)
  assert.equal(parseAdminDishPrice('0'), null)
})

test('acepta un formulario válido con descripción opcional', () => {
  assert.deepEqual(validateAdminDishForm(validValues, menuCategories), {})
  assert.deepEqual(validateAdminDishForm({ ...validValues, description: 'Descripción de prueba' }, menuCategories), {})
})
