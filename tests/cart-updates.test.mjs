import assert from 'node:assert/strict'
import test from 'node:test'
import { addCartItem } from '../src/data/addCartItem.ts'
import { removeCartItem, updateCartItemQuantity } from '../src/data/cartItems.ts'

const sampleCart = () => Object.freeze([
  Object.freeze({ dishId: 'cebiche-pescado', presentationId: 'personal', quantity: 3 }),
  Object.freeze({ dishId: 'cebiche-pescado', presentationId: 'extra', quantity: 2 }),
  Object.freeze({ dishId: 'cebiche-mixto', presentationId: 'personal', quantity: 1 }),
])

test('se puede aumentar la cantidad o reducirla a una unidad sin modificar otras líneas', () => {
  const original = sampleCart()
  const increased = updateCartItemQuantity(original, 'cebiche-pescado', 'personal', 5)
  const decreased = updateCartItemQuantity(increased, 'cebiche-pescado', 'personal', 1)
  assert.equal(increased[0].quantity, 5)
  assert.equal(decreased[0].quantity, 1)
  assert.equal(decreased.length, 3)
  assert.equal(original[0].quantity, 3)
  assert.notStrictEqual(increased, original)
  assert.strictEqual(decreased[1], original[1])
  assert.strictEqual(decreased[2], original[2])
})

test('cero, negativos, fracciones y números no seguros conservan el carrito', () => {
  const original = sampleCart()
  for (const quantity of [0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.strictEqual(updateCartItemQuantity(original, 'cebiche-pescado', 'personal', quantity), original)
  }
})

test('la misma cantidad y las líneas inexistentes no cambian el estado', () => {
  const original = sampleCart()
  assert.strictEqual(updateCartItemQuantity(original, 'cebiche-pescado', 'personal', 3), original)
  assert.strictEqual(updateCartItemQuantity(original, 'inexistente', 'personal', 2), original)
  assert.strictEqual(updateCartItemQuantity(original, 'cebiche-pescado', 'inexistente', 2), original)
})

test('eliminar afecta solo a la combinación de plato y presentación seleccionada', () => {
  const original = sampleCart()
  const remaining = removeCartItem(original, 'cebiche-pescado', 'personal')
  assert.deepEqual(remaining, [original[1], original[2]])
  assert.strictEqual(remaining[0], original[1])
  assert.strictEqual(remaining[1], original[2])
  assert.equal(original.length, 3)
})

test('eliminar una línea inexistente conserva el estado', () => {
  const original = sampleCart()
  assert.strictEqual(removeCartItem(original, 'inexistente', 'personal'), original)
  assert.strictEqual(removeCartItem(original, 'cebiche-pescado', 'inexistente'), original)
})

test('eliminar el último elemento deja el carrito vacío y permite agregarlo otra vez', () => {
  const original = addCartItem([], 'cebiche-pescado', 'personal')
  const empty = removeCartItem(original, 'cebiche-pescado', 'personal')
  assert.deepEqual(empty, [])
  assert.equal(original.length, 1)
  assert.deepEqual(addCartItem(empty, 'cebiche-pescado', 'personal'), [
    { dishId: 'cebiche-pescado', presentationId: 'personal', quantity: 1 },
  ])
})

test('modificar o eliminar en un carrito vacío no crea elementos', () => {
  const empty = Object.freeze([])
  assert.strictEqual(updateCartItemQuantity(empty, 'cebiche-pescado', 'personal', 2), empty)
  assert.strictEqual(removeCartItem(empty, 'cebiche-pescado', 'personal'), empty)
})

test('la cantidad máxima segura se acepta y agregar otra unidad no la desborda', () => {
  const original = addCartItem([], 'cebiche-pescado', 'personal')
  const updated = updateCartItemQuantity(original, 'cebiche-pescado', 'personal', Number.MAX_SAFE_INTEGER)
  assert.equal(updated[0].quantity, Number.MAX_SAFE_INTEGER)
  assert.strictEqual(addCartItem(updated, 'cebiche-pescado', 'personal'), updated)
})
