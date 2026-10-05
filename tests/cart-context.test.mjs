import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let server
let CartProvider
let useCart

before(async () => {
  // Vite transforma los archivos TSX reales sin añadir otro compilador de pruebas.
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
  })
  ;({ CartProvider } = await server.ssrLoadModule('/src/context/CartProvider.tsx'))
  ;({ useCart } = await server.ssrLoadModule('/src/hooks/useCart.ts'))
})

after(async () => {
  await server?.close()
})

test('dos vistas dentro del proveedor reciben el mismo carrito vacío', () => {
  const received = []

  function View({ name }) {
    const cart = useCart()
    received.push(cart)
    return createElement('section', null, `${name}: ${cart.items.length}`)
  }

  const html = renderToStaticMarkup(createElement(
    CartProvider,
    null,
    createElement(View, { name: 'Carta' }),
    createElement(View, { name: 'Pedidos' }),
  ))

  assert.equal(received.length, 2)
  assert.strictEqual(received[0], received[1])
  assert.deepEqual(received[0].items, [])
  assert.match(html, /Carta: 0/)
  assert.match(html, /Pedidos: 0/)
})

test('useCart fuera del proveedor informa el error de integración', () => {
  function View() {
    useCart()
    return null
  }

  assert.throws(
    () => renderToStaticMarkup(createElement(View)),
    /useCart debe utilizarse dentro de CartProvider/,
  )
})
