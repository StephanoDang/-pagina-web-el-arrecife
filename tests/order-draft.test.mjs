import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrderDraft } from '../src/data/orderDraft.ts'
import { menuDishes } from '../src/data/menu.ts'

const dish = menuDishes.find((dish) => dish.available)
const presentation = dish.presentations[0]
const items = [{ dishId: dish.id, presentationId: presentation.id, quantity: 2 }]
const customer = { name: ' Ana ', phone: ' 999888777 ', deliveryMethod: 'delivery', address: ' Calle Lima 123 ' }

test('genera una instantánea con precios en céntimos y sin duplicar IGV ni inventar envío', () => {
  const draft = createOrderDraft(items, customer)
  assert.equal(draft.productsTotalInCents, presentation.priceInCents * 2)
  assert.equal(draft.items[0].subtotalInCents, presentation.priceInCents * 2)
  assert.equal(draft.customer.name, 'Ana')
  assert.equal(draft.customer.address, 'Calle Lima 123')
  assert.equal(draft.deliveryCostInCents, null)
  assert.equal(draft.igvIncluded, true)
  assert.equal(draft.status, 'draft')
  assert.notEqual(draft.items[0], items[0])
  assert.deepEqual(JSON.parse(JSON.stringify(draft)), draft)
})

test('recojo omite la dirección aunque existiera una dirección de delivery', () => {
  const draft = createOrderDraft(items, { ...customer, deliveryMethod: 'pickup' })
  assert.equal(Object.hasOwn(draft.customer, 'address'), false)
})

test('rechaza carritos vacíos y evita resúmenes con productos o cantidades inválidos', () => {
  assert.throws(() => createOrderDraft([], customer), /Añade productos/)
  for (const item of [
    { ...items[0], quantity: 0 },
    { ...items[0], quantity: Number.MAX_SAFE_INTEGER },
    { ...items[0], presentationId: 'inexistente' },
    { ...items[0], dishId: 'inexistente' },
  ]) assert.throws(() => createOrderDraft([item], customer), /Revisa/)
})

test('recupera una orden serializada de delivery y conserva fecha y cantidades', async () => {
  const { loadOrderDraft } = await import('../src/data/orderDraft.ts')
  const draft = createOrderDraft(items, customer)
  assert.deepEqual(loadOrderDraft(() => JSON.stringify(draft)), { draft, error: '' })
})

test('recupera recojo sin conservar una dirección residual', async () => {
  const { loadOrderDraft } = await import('../src/data/orderDraft.ts')
  const draft = createOrderDraft(items, { ...customer, deliveryMethod: 'pickup' })
  const raw = JSON.stringify({ ...draft, customer: { ...draft.customer, address: 'Dirección residual' } })
  assert.deepEqual(loadOrderDraft(() => raw), { draft, error: '' })
})

test('ausencia y error de lectura no impiden abrir una orden nueva', async () => {
  const { loadOrderDraft } = await import('../src/data/orderDraft.ts')
  assert.deepEqual(loadOrderDraft(() => null), { draft: null, error: '' })
  const result = loadOrderDraft(() => { throw new Error('SecurityError') })
  assert.equal(result.draft, null)
  assert.match(result.error, /No se pudo leer/)
})

test('rechaza JSON corrupto, versiones desconocidas y valores alterados sin recuperar parcialmente', async () => {
  const { loadOrderDraft } = await import('../src/data/orderDraft.ts')
  for (const raw of ['', '{', 'null', '[]', '42']) assert.equal(loadOrderDraft(() => raw).draft, null)
  const mutations = [
    d => { d.version = 2 }, d => { d.status = 'sent' }, d => { d.savedAt = 'ayer' },
    d => { d.currency = 'USD' }, d => { d.igvIncluded = false }, d => { d.deliveryCostInCents = 0 },
    d => { d.customer = null }, d => { d.customer.name = ' ' }, d => { d.customer.phone = 'abc' },
    d => { d.customer.address = 'a' }, d => { d.customer.deliveryMethod = 'otro' },
    d => { d.items = [] }, d => { d.items.push({ ...d.items[0] }) },
    d => { d.items[0].quantity = 0 }, d => { d.items[0].quantity = 1.5 },
    d => { d.items[0].dishId = 'inexistente' }, d => { d.items[0].presentationId = 'inexistente' },
    d => { d.items[0].unitPriceInCents += 100 }, d => { d.items[0].subtotalInCents += 100 },
    d => { d.productsTotalInCents += 100 },
  ]
  for (const mutate of mutations) {
    const draft = createOrderDraft(items, customer)
    mutate(draft)
    const result = loadOrderDraft(() => JSON.stringify(draft))
    assert.equal(result.draft, null)
    assert.match(result.error, /No se recuperó/)
  }
})
