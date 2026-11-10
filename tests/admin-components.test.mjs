import assert from 'node:assert/strict'
import test, { after } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { requestAdminModalClose, syncAdminModal } from '../src/pages/admin/components/adminModalState.ts'

const vite = await createServer({
  configFile: false,
  plugins: [react()],
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: 'custom',
})

const [{ default: AdminTable }, { default: AdminButton }, { default: AdminModal }, { default: AdminDishManagementPage }, { default: AdminOrderManagementPage }] = await Promise.all([
  vite.ssrLoadModule('/src/pages/admin/components/AdminTable.tsx'),
  vite.ssrLoadModule('/src/pages/admin/components/AdminButton.tsx'),
  vite.ssrLoadModule('/src/pages/admin/components/AdminModal.tsx'),
  vite.ssrLoadModule('/src/pages/admin/AdminDishManagementPage.tsx'),
  vite.ssrLoadModule('/src/pages/admin/AdminOrderManagementPage.tsx'),
])

after(async () => vite.close())

test('la tabla presenta el mensaje vacío en una fila anunciable', () => {
  const html = renderToStaticMarkup(React.createElement(AdminTable, {
    caption: 'Platos',
    columns: [{ key: 'name', header: 'Nombre', render: (row) => row.name }],
    rows: [],
    getRowKey: (row) => row.id,
    emptyMessage: 'No hay platos disponibles.',
  }))

  assert.match(html, /role="status"/)
  assert.match(html, /colSpan|colspan="1"/)
  assert.match(html, /No hay platos disponibles\./)
})

test('la tabla ofrece una región enfocada por teclado para desplazamiento', () => {
  const html = renderToStaticMarkup(React.createElement(AdminTable, {
    caption: 'Pedidos recientes',
    columns: [{ key: 'id', header: 'Código', render: (row) => row.id }],
    rows: [{ id: 'PED-1' }],
    getRowKey: (row) => row.id,
  }))

  assert.match(html, /role="region"/)
  assert.match(html, /tabindex="0"/)
  assert.match(html, /flecha/)
})

test('el botón sigue usando el comportamiento de teclado nativo', () => {
  const html = renderToStaticMarkup(React.createElement(AdminButton, { variant: 'secondary' }, 'Cancelar'))
  assert.match(html, /^<button/)
  assert.match(html, /type="button"/)
  assert.match(html, /admin-button--secondary/)
})

test('el modal publica un diálogo con nombre accesible y sincroniza su apertura', () => {
  const html = renderToStaticMarkup(React.createElement(AdminModal, {
    open: true, title: 'Editar plato', onClose() {}, children: 'Formulario',
  }))
  assert.match(html, /<dialog aria-labelledby=/)
  assert.match(html, /Cerrar ventana/)

  const calls = []
  const dialog = {
    open: false,
    showModal() { calls.push('show'); this.open = true },
    close() { calls.push('close'); this.open = false },
  }
  syncAdminModal(dialog, true)
  syncAdminModal(dialog, true)
  syncAdminModal(dialog, false)
  assert.deepEqual(calls, ['show', 'close'])
})

test('Escape cierra el diálogo cancelando la acción nativa', () => {
  let defaultPrevented = false
  let closeRequested = false
  requestAdminModalClose({ preventDefault() { defaultPrevented = true } }, () => { closeRequested = true })
  assert.equal(defaultPrevented, true)
  assert.equal(closeRequested, true)
})

test('Carta integra la gestión de ejemplo, edición y acciones de disponibilidad', () => {
  const html = renderToStaticMarkup(React.createElement(AdminDishManagementPage))
  assert.match(html, /Gestión de platos/)
  assert.match(html, /Nuevo plato/)
  assert.match(html, /Platos de demostración/)
  assert.match(html, /Editar/)
  assert.match(html, /Desactivar/)
  assert.match(html, /Nombre del plato/)
  assert.match(html, /Selecciona una categoría/)
  assert.match(html, /Precio de la primera presentación/)
  assert.match(html, /Confirmar desactivación/)
  assert.match(html, /Cancelar/)
})

test('Pedidos presenta la tabla entrante y el estado vacío sin confundir borradores con órdenes', () => {
  const html = renderToStaticMarkup(React.createElement(AdminOrderManagementPage))
  assert.match(html, /Órdenes entrantes/)
  assert.match(html, /Código/)
  assert.match(html, /Recibido/)
  assert.match(html, /Pedidos recibidos/)
  assert.match(html, /0 órdenes recibidas/)
  assert.match(html, /Aún no hay órdenes recibidas/)
  assert.match(html, /todavía son borradores/)
  assert.match(html, /aria-label="Vista de pedidos"/)
  assert.match(html, /aria-pressed="true" class="admin-button admin-button--primary" type="button">Tablero/)
  assert.match(html, /class="admin-orders-board" aria-label="Pedidos por estado"/)
  assert.match(html, /<div hidden="">/)
  assert.match(html, /Pendiente/)
  assert.match(html, /En preparación/)
  assert.match(html, /Entregado/)
  assert.match(html, /No hay pedidos en este estado/)
})
