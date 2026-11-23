// Aplica las migraciones de Supabase sobre PostgreSQL embebido (PGlite) y verifica
// RLS, permisos y la creación transaccional de pedidos. Datos ficticios, sin personas reales.
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { before, describe, test } from 'node:test'
import { PGlite } from '@electric-sql/pglite'

const migrationsDir = new URL('../supabase/migrations/', import.meta.url)

// Equivalente mínimo del esquema auth y los roles que Supabase ya provee.
const supabaseStub = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  grant usage on schema auth to anon, authenticated;
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
  $$;
`

const seed = `
  insert into public.menu_categories (code, name) values ('leches', 'Leches'), ('oculta', 'Oculta');
  update public.menu_categories set active = false where code = 'oculta';
  insert into public.dishes (code, name, available) values
    ('leche-tigre', 'Leche de Tigre', true),
    ('jalea', 'Jalea', true),
    ('agotado', 'Plato agotado', false);
  insert into public.dish_presentations (dish_id, code, name, price_cents)
  select id, 'unica', 'Única', 1750 from public.dishes where code = 'leche-tigre';
  insert into public.dish_presentations (dish_id, code, name, price_cents)
  select id, p.code, p.name, p.price from public.dishes, (values ('personal', 'Personal', 4800), ('familiar', 'Familiar', 9000)) as p(code, name, price)
  where dishes.code = 'jalea';
  insert into public.dish_presentations (dish_id, code, name, price_cents)
  select id, 'unica', 'Única', 1000 from public.dishes where code = 'agotado';
  insert into public.dish_category_links (dish_id, category_id, is_primary)
  select d.id, c.id, true from public.dishes d, public.menu_categories c where c.code = 'leches';
`

const anon = { role: 'anon' }
const admin = { role: 'authenticated', claims: { role: 'authenticated', app_metadata: { role: 'admin' } } }
const staffWithoutRole = { role: 'authenticated', claims: { role: 'authenticated', app_metadata: {} } }
const spoofedAdmin = { role: 'authenticated', claims: { role: 'authenticated', user_metadata: { role: 'admin' } } }

let db

async function as(actor, fn) {
  await db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify(actor.claims ?? { role: 'anon' })])
  await db.exec(`set role ${actor.role}`)
  try {
    return await fn()
  } finally {
    await db.exec('reset role')
  }
}

const validCustomer = { name: 'Cliente Prueba', phone: '+51 900 000 000', method: 'pickup', address: null }

function createOrder(requestId, items, customer = validCustomer) {
  return db.query('select public.create_order($1, $2, $3, $4, $5, $6::jsonb) as result',
    [requestId, customer.name, customer.phone, customer.method, customer.address, JSON.stringify(items)])
    .then(({ rows }) => rows[0].result)
}

async function countOrders() {
  const { rows } = await db.query('select count(*)::int as orders, (select count(*)::int from public.order_items) as items from public.orders')
  return rows[0]
}

before(async () => {
  db = await PGlite.create()
  await db.exec(supabaseStub)
  const files = (await readdir(migrationsDir)).filter((name) => name.endsWith('.sql')).sort()
  assert.ok(files.length >= 2)
  for (const file of files) await db.exec(await readFile(new URL(file, migrationsDir), 'utf8'))
  await db.exec(seed)
})

describe('RLS de la carta', () => {
  test('el visitante solo lee platos disponibles y categorías activas', async () => {
    await as(anon, async () => {
      const dishes = await db.query('select code from public.dishes order by code')
      assert.deepEqual(dishes.rows.map((row) => row.code), ['jalea', 'leche-tigre'])
      const categories = await db.query('select code from public.menu_categories')
      assert.deepEqual(categories.rows.map((row) => row.code), ['leches'])
      const presentations = await db.query('select count(*)::int as total from public.dish_presentations')
      assert.equal(presentations.rows[0].total, 3)
    })
  })

  test('el visitante y el personal sin rol no pueden editar platos', async () => {
    await as(anon, () => assert.rejects(db.query("update public.dishes set name = 'X'"), /permission denied/))
    for (const actor of [staffWithoutRole, spoofedAdmin]) {
      await as(actor, async () => {
        const result = await db.query("update public.dishes set available = false where code = 'jalea'")
        assert.equal(result.affectedRows, 0)
      })
    }
  })

  test('el administrador gestiona precios y disponibilidad', async () => {
    await as(admin, async () => {
      const result = await db.query("update public.dish_presentations set price_cents = price_cents where code = 'unica'")
      assert.equal(result.affectedRows, 2)
      const all = await db.query('select count(*)::int as total from public.dishes')
      assert.equal(all.rows[0].total, 3)
    })
  })
})

describe('create_order', () => {
  test('recalcula importes desde el catálogo e inserta pedido y líneas juntos', async () => {
    const result = await as(anon, () => createOrder('00000000-0000-4000-8000-000000000001', [
      { dish: 'leche-tigre', presentation: 'unica', quantity: 2 },
      { dish: 'jalea', presentation: 'familiar', quantity: 1 },
    ]))
    assert.equal(result.duplicate, false)
    assert.equal(result.status, 'pending')
    assert.equal(result.subtotal_cents, 2 * 1750 + 9000)
    assert.equal(result.total_cents, 12500)
    assert.equal(result.delivery_fee_cents, null)

    const { rows } = await db.query('select dish_name, presentation_name, quantity, unit_price_cents, line_total_cents from public.order_items where order_id = $1 order by line_total_cents', [result.order_id])
    assert.deepEqual(rows, [
      { dish_name: 'Leche de Tigre', presentation_name: 'Única', quantity: 2, unit_price_cents: 1750, line_total_cents: 3500 },
      { dish_name: 'Jalea', presentation_name: 'Familiar', quantity: 1, unit_price_cents: 9000, line_total_cents: 9000 },
    ])
  })

  test('un reintento con el mismo request_id no duplica el pedido', async () => {
    const before = await countOrders()
    const items = [{ dish: 'jalea', presentation: 'personal', quantity: 1 }]
    const first = await as(anon, () => createOrder('00000000-0000-4000-8000-000000000002', items))
    const retry = await as(anon, () => createOrder('00000000-0000-4000-8000-000000000002', items))
    assert.equal(retry.duplicate, true)
    assert.equal(retry.order_id, first.order_id)
    assert.deepEqual(await countOrders(), { orders: before.orders + 1, items: before.items + 1 })
  })

  test('rechaza platos no disponibles o inexistentes sin dejar registros parciales', async () => {
    const before = await countOrders()
    for (const items of [
      [{ dish: 'leche-tigre', presentation: 'unica', quantity: 1 }, { dish: 'agotado', presentation: 'unica', quantity: 1 }],
      [{ dish: 'jalea', presentation: 'gigante', quantity: 1 }],
      [{ dish: 'no-existe', presentation: 'unica', quantity: 1 }],
    ]) {
      await as(anon, () => assert.rejects(createOrder(crypto.randomUUID(), items), /unavailable_items/))
    }
    assert.deepEqual(await countOrders(), before)
  })

  test('rechaza cantidades, líneas y datos inválidos', async () => {
    const line = (quantity) => [{ dish: 'jalea', presentation: 'personal', quantity }]
    const invalidItems = [
      [], line(0), line(-1), line(1.5), line('2'), line(null), 'no-array',
      [{ dish: 'jalea', presentation: 'personal', quantity: 1 }, { dish: 'jalea', presentation: 'personal', quantity: 2 }],
      Array.from({ length: 101 }, () => ({ dish: 'jalea', presentation: 'personal', quantity: 1 })),
    ]
    for (const items of invalidItems) {
      await as(anon, () => assert.rejects(createOrder(crypto.randomUUID(), items), /invalid_items/))
    }
    await as(anon, () => assert.rejects(createOrder(crypto.randomUUID(), line(1_000_000_000)), /order_total_too_large/))
    const cases = [
      [{ ...validCustomer, name: '   ' }, /invalid_customer_name/],
      [{ ...validCustomer, phone: '12ab' }, /invalid_phone/],
      [{ ...validCustomer, method: 'drone' }, /invalid_delivery_method/],
      [{ ...validCustomer, method: 'delivery', address: 'Av' }, /invalid_delivery_address/],
    ]
    for (const [customer, error] of cases) {
      await as(anon, () => assert.rejects(createOrder(crypto.randomUUID(), line(1), customer), error))
    }
  })

  test('guarda la dirección solo para delivery', async () => {
    const delivery = await as(anon, () => createOrder(crypto.randomUUID(), [{ dish: 'jalea', presentation: 'personal', quantity: 1 }],
      { ...validCustomer, method: 'delivery', address: '  Calle Ficticia 123  ' }))
    const pickup = await as(anon, () => createOrder(crypto.randomUUID(), [{ dish: 'jalea', presentation: 'personal', quantity: 1 }],
      { ...validCustomer, address: 'Calle Ficticia 123' }))
    const { rows } = await db.query('select id, delivery_address from public.orders where id = any($1)', [[delivery.order_id, pickup.order_id]])
    const addresses = Object.fromEntries(rows.map((row) => [row.id, row.delivery_address]))
    assert.equal(addresses[delivery.order_id], 'Calle Ficticia 123')
    assert.equal(addresses[pickup.order_id], null)
  })
})

describe('RLS de pedidos', () => {
  test('el visitante no puede insertar pedidos directamente ni leerlos', async () => {
    await as(anon, async () => {
      await assert.rejects(db.query(`insert into public.orders (customer_name, phone, delivery_method, subtotal_cents, total_cents)
        values ('Cliente Prueba', '900000000', 'pickup', 1, 1)`), /permission denied/)
      await assert.rejects(db.query('select * from public.orders'), /permission denied/)
      await assert.rejects(db.query('select * from public.order_items'), /permission denied/)
    })
  })

  test('solo el rol de app_metadata permite leer pedidos', async () => {
    for (const actor of [staffWithoutRole, spoofedAdmin]) {
      await as(actor, async () => {
        const { rows } = await db.query('select count(*)::int as total from public.orders')
        assert.equal(rows[0].total, 0)
      })
    }
    await as(admin, async () => {
      const { rows } = await db.query('select count(*)::int as total from public.orders')
      assert.ok(rows[0].total > 0)
      const items = await db.query('select count(*)::int as total from public.order_items')
      assert.ok(items.rows[0].total > 0)
    })
  })

  test('el administrador solo avanza estados válidos y no altera importes ni líneas', async () => {
    const order = await as(anon, () => createOrder(crypto.randomUUID(), [{ dish: 'jalea', presentation: 'personal', quantity: 1 }]))
    await as(admin, async () => {
      const setStatus = (status) => db.query('update public.orders set status = $1 where id = $2', [status, order.order_id])
      await assert.rejects(setStatus('delivered'), /invalid_status_transition/)
      await setStatus('preparing')
      await assert.rejects(setStatus('pending'), /invalid_status_transition/)
      await setStatus('delivered')
      await assert.rejects(setStatus('cancelled'), /invalid_status_transition/)
      await assert.rejects(db.query('update public.orders set total_cents = 1 where id = $1', [order.order_id]), /permission denied/)
      await assert.rejects(db.query('delete from public.orders where id = $1', [order.order_id]), /permission denied/)
      await assert.rejects(db.query('delete from public.order_items where order_id = $1', [order.order_id]), /permission denied/)
    })
  })
})

describe('RLS de reservas', () => {
  const insertReservation = (visitDate, overrides = '') => db.query(`insert into public.reservations
    (visit_date, visit_time, customer_name, phone, people${overrides ? ', status' : ''})
    values ($1::date, '12:00', 'Cliente Prueba', '900000000', 4${overrides ? `, '${overrides}'` : ''})`, [visitDate])
  const limaDate = (offsetDays) => db.query(`select ((now() at time zone 'America/Lima')::date + $1::int)::text as day`, [offsetDays])
    .then(({ rows }) => rows[0].day)

  test('el visitante crea solicitudes pendientes desde hoy (Lima) pero no las lee', async () => {
    const today = await limaDate(0)
    const yesterday = await limaDate(-1)
    await as(anon, async () => {
      await insertReservation(today)
      await assert.rejects(insertReservation(yesterday), /row-level security/)
      await assert.rejects(insertReservation(today, 'confirmed'), /row-level security/)
      await assert.rejects(db.query('select * from public.reservations'), /permission denied/)
    })
  })

  test('created_at lo fija el servidor y el administrador solo confirma o cancela pendientes', async () => {
    await as(anon, () => db.query(`insert into public.reservations (visit_date, visit_time, customer_name, phone, people, created_at)
      values ((now() at time zone 'America/Lima')::date + 1, '11:00', 'Cliente Prueba', '900000000', 2, '2000-01-01')`))
    await as(admin, async () => {
      const { rows } = await db.query('select id, created_at from public.reservations order by created_at desc limit 1')
      assert.ok(new Date(rows[0].created_at).getFullYear() > 2000)
      const setStatus = (status) => db.query('update public.reservations set status = $1 where id = $2', [status, rows[0].id])
      await setStatus('confirmed')
      await assert.rejects(setStatus('cancelled'), /invalid_status_transition/)
      await assert.rejects(db.query('update public.reservations set people = 9 where id = $1', [rows[0].id]), /permission denied/)
    })
    for (const actor of [staffWithoutRole, spoofedAdmin]) {
      await as(actor, async () => {
        const { rows } = await db.query('select count(*)::int as total from public.reservations')
        assert.equal(rows[0].total, 0)
      })
    }
  })
})
