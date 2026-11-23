import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfig } from './supabase'

const config = readSupabaseConfig()

export const supabase = config
  ? createClient(config.url, config.anonKey, {
      auth: {
        storage: window.sessionStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null
