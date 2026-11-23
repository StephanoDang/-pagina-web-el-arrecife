import assert from 'node:assert/strict'
import test from 'node:test'
import { hasAdminRole } from '../src/context/adminAccess.ts'

test('solo autoriza usuarios con rol admin en app_metadata', () => {
  assert.equal(hasAdminRole({ app_metadata: { role: 'admin' } }), true)
  assert.equal(hasAdminRole({ app_metadata: { role: 'staff' } }), false)
  assert.equal(hasAdminRole({ user_metadata: { role: 'admin' } }), false)
  assert.equal(hasAdminRole(null), false)
})
