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

const [{ default: AdminTable }, { default: AdminButton }, { default: AdminModal }, { default: AdminDishManagementPage }] = await Promise.all([
  vite.ssrLoadModule('/src/pages/admin/components/AdminTable.tsx'),
  vite.ssrLoadModule('/src/pages/admin/components/AdminButton.tsx'),
  vite.ssrLoadModule('/src/pages/admin/components/AdminModal.tsx'),
  vite.ssrLoadModule('/src/pages/admin/AdminDishManagementPage.tsx'),
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

test('Carta integra el alta modal, los campos requeridos y la tabla vacía', () => {
  const html = renderToStaticMarkup(React.createElement(AdminDishManagementPage))
  assert.match(html, /Gestión de platos/)
  assert.match(html, /Nuevo plato/)
  assert.match(html, /Aún no agregaste platos/)
  assert.match(html, /Nombre del plato/)
  assert.match(html, /Selecciona una categoría/)
  assert.match(html, /Precio \(S\/\)/)
})
