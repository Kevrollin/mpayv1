import { createClient } from '@supabase/supabase-js'
import { mockAuth, mockFrom } from './mockBackend'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// No Supabase project wired up yet: fall back to a local, in-browser mock
// (see ./mockBackend.js) so every page works end to end with zero backend.
// Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env to switch to the
// real thing — no other code changes needed.
export const isMockMode = !isSupabaseConfigured

if (isMockMode) {
  console.info(
    '[KM Pay] Running in local mock mode (no Supabase env vars found). ' +
      'Data is stored in this browser only. See src/lib/mockBackend.js.'
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : {
      auth: mockAuth,
      from: mockFrom,
    }
