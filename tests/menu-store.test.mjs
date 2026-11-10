import assert from 'node:assert/strict'
import test from 'node:test'
import { menuDishes } from '../src/data/menu.ts'
import { setAdminDishAvailability } from '../src/pages/admin/adminDishState.ts'

test('el catálogo compartido guarda cambios en LocalStorage y los mantiene como snapshot', async () => {
  const values = new Map()
  globalThis.window = {
    localStorage: {
      getItem(key) { return values.get(key) ?? null },
      setItem(key, value) { values.set(key, value) },
    },
    addEventListener() {},
    removeEventListener() {},
  }
  const store = await import('../src/data/menuStore.ts?storage-test')
  const updated = setAdminDishAvailability(menuDishes, 'jalea-arrecife', false)
  store.setMenuDishes(updated)

  assert.equal(store.MENU_STORAGE_KEY, 'el-arrecife.menu.v1')
  assert.equal(store.getMenuSnapshot().find((dish) => dish.id === 'jalea-arrecife')?.available, false)
  assert.equal(JSON.parse(values.get(store.MENU_STORAGE_KEY)).find((dish) => dish.id === 'jalea-arrecife').available, false)
  delete globalThis.window
})
