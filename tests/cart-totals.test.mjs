import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateCartTotals } from '../src/data/cartTotals.ts'
import { menuDishes } from '../src/data/menu.ts'
import { updateCartItemQuantity, removeCartItem } from '../src/data/cartItems.ts'

test('el carrito vacío tiene total cero', () => {
  assert.deepEqual(calculateCartTotals([]), { subtotalsInCents: [], totalInCents: 0 })
})

test('suma precios por presentación y recalcula al cambiar cantidades y eliminar', () => {
  const dish = menuDishes.find((dish) => dish.presentations.length >= 2)
  const [first, second] = dish.presentations
  const items = Object.freeze([
    Object.freeze({ dishId: dish.id, presentationId: first.id, quantity: 2 }),
    Object.freeze({ dishId: dish.id, presentationId: second.id, quantity: 3 }),
  ])
  assert.deepEqual(calculateCartTotals(items), {
    subtotalsInCents: [first.priceInCents * 2, second.priceInCents * 3],
    totalInCents: first.priceInCents * 2 + second.priceInCents * 3,
  })
  const updated = updateCartItemQuantity(items, dish.id, first.id, 4)
  assert.equal(calculateCartTotals(updated).totalInCents, first.priceInCents * 4 + second.priceInCents * 3)
  assert.equal(calculateCartTotals(removeCartItem(updated, dish.id, second.id)).totalInCents, first.priceInCents * 4)
})

test('no presenta un total parcial si faltan precios o las cantidades son inválidas', () => {
  for (const item of [
    { dishId: 'inexistente', presentationId: 'personal', quantity: 1 },
    { dishId: 'cebiche-pescado', presentationId: 'inexistente', quantity: 1 },
    ...[0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER].map((quantity) => (
      { dishId: 'cebiche-pescado', presentationId: 'personal', quantity }
    )),
  ]) {
    assert.deepEqual(calculateCartTotals([item]), { subtotalsInCents: [null], totalInCents: null })
  }
})
