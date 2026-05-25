import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Exports null when env vars are absent — callers must no-op on null.
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

async function bootstrap(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) return sessionData.session.user.id
    const { data: signInData } = await supabase.auth.signInAnonymously()
    return signInData.user?.id ?? null
  } catch {
    return null
  }
}

// Resolves to the anon user_id once the session is established (or null on failure/disabled).
export const userIdPromise: Promise<string | null> = bootstrap()
