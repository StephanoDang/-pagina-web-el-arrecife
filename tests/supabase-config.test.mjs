import assert from 'node:assert/strict'
import test from 'node:test'
import { checkSupabaseConnection, readSupabaseConfig } from '../src/config/supabase.ts'

test('requiere URL y clave pública, y valida una URL segura', () => {
  assert.equal(readSupabaseConfig({}), null)
  assert.equal(readSupabaseConfig({ VITE_SUPABASE_URL: 'not-a-url', VITE_SUPABASE_ANON_KEY: 'key' }), null)
  assert.deepEqual(readSupabaseConfig({
    VITE_SUPABASE_URL: 'https://demo.supabase.co/',
    VITE_SUPABASE_ANON_KEY: 'public-key',
  }), { url: 'https://demo.supabase.co', anonKey: 'public-key' })
})

test('comprueba el endpoint REST y no falla si el servicio no está configurado', async () => {
  const missing = await checkSupabaseConnection(null)
  assert.equal(missing.configured, false)

  let requestedUrl = ''
  const result = await checkSupabaseConnection(
    { url: 'https://demo.supabase.co', anonKey: 'public-key' },
    async (input) => {
      requestedUrl = String(input)
      return new Response(null, { status: 200 })
    },
  )
  assert.equal(requestedUrl, 'https://demo.supabase.co/rest/v1/')
  assert.equal(result.connected, true)
})
