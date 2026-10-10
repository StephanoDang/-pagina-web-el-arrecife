import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateCartTotals, calculateTax, cartTaxPolicy } from '../src/data/cartTotals.ts'
import { menuDishes } from '../src/data/menu.ts'
import { updateCartItemQuantity, removeCartItem } from '../src/data/cartItems.ts'

test('el carrito vacío tiene total cero', () => {
  assert.deepEqual(calculateCartTotals([]), { subtotalsInCents: [], baseInCents: null, igvInCents: null, totalInCents: 0 })
})

test('la configuración confirmada incluye IGV y no vuelve a sumarlo sin conocer la tasa', () => {
  assert.deepEqual(cartTaxPolicy, { mode: 'included', rateBasisPoints: null })
  assert.deepEqual(calculateTax(11800, cartTaxPolicy), {
    baseInCents: null, igvInCents: null, totalInCents: 11800,
  })
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
    baseInCents: null,
    igvInCents: null,
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
    assert.deepEqual(calculateCartTotals([item]), { subtotalsInCents: [null], baseInCents: null, igvInCents: null, totalInCents: null })
  }
})

test('desglosa IGV incluido y añade IGV adicional con una tasa de prueba', () => {
  assert.deepEqual(calculateTax(11800, { mode: 'included', rateBasisPoints: 1800 }), {
    baseInCents: 10000, igvInCents: 1800, totalInCents: 11800,
  })
  assert.deepEqual(calculateTax(10000, { mode: 'additional', rateBasisPoints: 1800 }), {
    baseInCents: 10000, igvInCents: 1800, totalInCents: 11800,
  })
})

test('redondea a céntimos y conserva base más IGV igual al total', () => {
  assert.deepEqual(calculateTax(101, { mode: 'included', rateBasisPoints: 1800 }), {
    baseInCents: 86, igvInCents: 15, totalInCents: 101,
  })
  assert.deepEqual(calculateTax(101, { mode: 'additional', rateBasisPoints: 1800 }), {
    baseInCents: 101, igvInCents: 18, totalInCents: 119,
  })
  assert.deepEqual(calculateTax(0, { mode: 'included', rateBasisPoints: 1800 }), {
    baseInCents: 0, igvInCents: 0, totalInCents: 0,
  })
  assert.throws(() => calculateTax(100, { mode: 'additional', rateBasisPoints: -1 }), RangeError)
  assert.equal(calculateTax(Number.MAX_SAFE_INTEGER, { mode: 'additional', rateBasisPoints: 1800 }).totalInCents, null)
})

test('el total del carrito integra la política fiscal configurada', () => {
  const items = [{ dishId: 'cebiche-pescado', presentationId: 'personal', quantity: 2 }]
  const published = calculateCartTotals(items).totalInCents
  for (const mode of ['included', 'additional']) {
    const policy = { mode, rateBasisPoints: 1800 }
    const result = calculateCartTotals(items, policy)
    assert.deepEqual(result, { subtotalsInCents: [published], ...calculateTax(published, policy) })
  }
})
