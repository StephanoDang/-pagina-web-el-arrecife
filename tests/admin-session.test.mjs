import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ADMIN_SESSION_KEY, authenticateDemoCredentials, endAdminSession,
  hasAdminSession, startAdminSession,
} from '../src/pages/admin/adminSession.ts'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

test('acepta solo las credenciales estáticas de demostración', () => {
  assert.equal(authenticateDemoCredentials('admin', 'arrecife2026'), true)
  assert.equal(authenticateDemoCredentials('admin', 'incorrecta'), false)
  assert.equal(authenticateDemoCredentials('otro', 'arrecife2026'), false)
})

test('inicia la sesión en sessionStorage y la cierra al salir', () => {
  const storage = createStorage()
  const getStorage = () => storage

  assert.equal(hasAdminSession(getStorage), false)
  assert.equal(startAdminSession('admin', 'incorrecta', getStorage), false)
  assert.equal(hasAdminSession(getStorage), false)
  assert.equal(startAdminSession('admin', 'arrecife2026', getStorage), true)
  assert.equal(storage.getItem(ADMIN_SESSION_KEY), 'active')
  assert.equal(hasAdminSession(getStorage), true)

  endAdminSession(getStorage)
  assert.equal(storage.getItem(ADMIN_SESSION_KEY), null)
  assert.equal(hasAdminSession(getStorage), false)
})

test('rechaza iniciar sesión si el almacenamiento está bloqueado', () => {
  assert.equal(startAdminSession('admin', 'arrecife2026', () => { throw new Error('blocked') }), false)
  assert.equal(hasAdminSession(() => { throw new Error('blocked') }), false)
})
