import assert from 'node:assert/strict'
import test from 'node:test'
import { menuDishes } from '../src/data/menu.ts'
import { setAdminDishAvailability, updateAdminDish } from '../src/pages/admin/adminDishState.ts'

test('editar un plato conserva su identificador y sus otras presentaciones', () => {
  const original = menuDishes.find((dish) => dish.id === 'cebiche-pescado')
  assert.ok(original)
  const updated = updateAdminDish([original], original.id, {
    name: 'Cebiche actualizado', categoryId: original.categoryId, price: '32.00', description: 'Descripción nueva',
  }, 3200)[0]

  assert.equal(updated.id, original.id)
  assert.equal(updated.name, 'Cebiche actualizado')
  assert.equal(updated.presentations[0].id, original.presentations[0].id)
  assert.equal(updated.presentations[0].priceInCents, 3200)
  assert.deepEqual(updated.presentations.slice(1), original.presentations.slice(1))
})

test('desactivar y reactivar un plato conserva el registro y su identificador', () => {
  const original = menuDishes.find((dish) => dish.id === 'cebiche-pescado')
  assert.ok(original)
  const disabled = setAdminDishAvailability([original], original.id, false)[0]
  const restored = setAdminDishAvailability([disabled], original.id, true)[0]

  assert.equal(disabled.id, original.id)
  assert.equal(disabled.available, false)
  assert.equal(restored.id, original.id)
  assert.equal(restored.available, true)
  assert.equal(restored.name, original.name)
})
