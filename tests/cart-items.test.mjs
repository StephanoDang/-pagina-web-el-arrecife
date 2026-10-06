import assert from 'node:assert/strict'
import test from 'node:test'
import { addCartItem } from '../src/data/addCartItem.ts'
import { menuDishes } from '../src/data/menu.ts'

test('agregar al carrito vacío crea una línea con cantidad uno', () => {
  const original = Object.freeze([])
  assert.deepEqual(addCartItem(original, 'cebiche-pescado', 'personal'), [
    { dishId: 'cebiche-pescado', presentationId: 'personal', quantity: 1 },
  ])
  assert.deepEqual(original, [])
})

test('adiciones repetidas aumentan la cantidad sin duplicar la línea', () => {
  let items = []
  for (let index = 0; index < 5; index++) {
    items = addCartItem(items, 'cebiche-pescado', 'extra')
  }
  assert.deepEqual(items, [
    { dishId: 'cebiche-pescado', presentationId: 'extra', quantity: 5 },
  ])
})

test('presentaciones distintas y platos con igual presentación tienen líneas separadas', () => {
  let items = addCartItem([], 'cebiche-pescado', 'personal')
  items = addCartItem(items, 'cebiche-pescado', 'extra')
  items = addCartItem(items, 'cebiche-mixto', 'personal')
  items = addCartItem(items, 'cebiche-pescado', 'personal')
  assert.deepEqual(items, [
    { dishId: 'cebiche-pescado', presentationId: 'personal', quantity: 2 },
    { dishId: 'cebiche-pescado', presentationId: 'extra', quantity: 1 },
    { dishId: 'cebiche-mixto', presentationId: 'personal', quantity: 1 },
  ])
})

test('aumentar una cantidad conserva el estado anterior y las otras líneas', () => {
  const original = Object.freeze([
    Object.freeze({ dishId: 'cebiche-pescado', presentationId: 'personal', quantity: 1 }),
    Object.freeze({ dishId: 'cebiche-mixto', presentationId: 'personal', quantity: 2 }),
  ])
  const updated = addCartItem(original, 'cebiche-pescado', 'personal')
  assert.notStrictEqual(updated, original)
  assert.equal(updated[0].quantity, 2)
  assert.equal(original[0].quantity, 1)
  assert.strictEqual(updated[1], original[1])
})

test('platos y presentaciones inexistentes dejan el carrito intacto', () => {
  const items = addCartItem([], 'cebiche-pescado', 'personal')
  assert.strictEqual(addCartItem(items, 'inexistente', 'personal'), items)
  assert.strictEqual(addCartItem(items, 'cebiche-pescado', 'inexistente'), items)
})

test('un plato no disponible no se agrega ni aumenta su cantidad existente', () => {
  const dish = menuDishes.find((item) => item.id === 'cebiche-pescado')
  assert.ok(dish)
  const items = addCartItem([], dish.id, 'personal')
  const previousAvailability = dish.available
  try {
    dish.available = false
    const empty = []
    assert.strictEqual(addCartItem(empty, dish.id, 'personal'), empty)
    assert.strictEqual(addCartItem(items, dish.id, 'personal'), items)
    assert.equal(items[0].quantity, 1)
  } finally {
    dish.available = previousAvailability
  }
})
