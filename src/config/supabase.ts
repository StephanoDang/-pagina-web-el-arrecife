export interface SupabaseConfig {
  url: string
  anonKey: string
}

export type SupabaseConnectionResult =
  | { configured: false; connected: false; message: string }
  | { configured: true; connected: boolean; message: string }

export function readSupabaseConfig(env: Record<string, string | undefined> = import.meta.env ?? {}): SupabaseConfig | null {
  const url = env.VITE_SUPABASE_URL?.trim()
  const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return null

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost') return null
    return { url: parsedUrl.toString().replace(/\/$/, ''), anonKey }
  } catch {
    return null
  }
}

export async function checkSupabaseConnection(
  config = readSupabaseConfig(),
  fetcher: typeof fetch = fetch,
): Promise<SupabaseConnectionResult> {
  if (!config) {
    return { configured: false, connected: false, message: 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.' }
  }

  try {
    const response = await fetcher(`${config.url}/rest/v1/`, {
      headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` },
    })
    return response.ok
      ? { configured: true, connected: true, message: 'Conexión con Supabase disponible.' }
      : { configured: true, connected: false, message: `Supabase respondió con HTTP ${response.status}.` }
  } catch {
    return { configured: true, connected: false, message: 'No fue posible conectar con Supabase.' }
  }
}
