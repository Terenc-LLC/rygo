import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetSession, mockSignInAnonymously, mockCreateClient } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSignInAnonymously: vi.fn(),
  mockCreateClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

describe('supabaseClient', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    mockGetSession.mockReset()
    mockSignInAnonymously.mockReset()
    mockCreateClient.mockReset()
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockSignInAnonymously.mockResolvedValue({ data: { user: null }, error: null })
    mockCreateClient.mockReturnValue({
      auth: { getSession: mockGetSession, signInAnonymously: mockSignInAnonymously },
    })
  })

  it('exports null client when env vars are absent', async () => {
    const { supabase } = await import('./supabaseClient')
    expect(supabase).toBeNull()
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it('does not throw and userIdPromise resolves to null when disabled', async () => {
    const { userIdPromise } = await import('./supabaseClient')
    await expect(userIdPromise).resolves.toBeNull()
  })

  it('exports live client when both env vars are present', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    const { supabase } = await import('./supabaseClient')
    expect(supabase).not.toBeNull()
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'test-anon-key',
    )
  })

  it('exports null client when only URL is set', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    const { supabase } = await import('./supabaseClient')
    expect(supabase).toBeNull()
  })

  it('userIdPromise resolves to user id from existing session', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'existing-user-id' } } },
      error: null,
    })
    const { userIdPromise } = await import('./supabaseClient')
    await expect(userIdPromise).resolves.toBe('existing-user-id')
  })

  it('userIdPromise calls signInAnonymously when no session exists', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    mockSignInAnonymously.mockResolvedValue({
      data: { user: { id: 'new-anon-id' } },
      error: null,
    })
    const { userIdPromise } = await import('./supabaseClient')
    await expect(userIdPromise).resolves.toBe('new-anon-id')
  })

  it('userIdPromise resolves to null on auth error without throwing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    mockGetSession.mockRejectedValue(new Error('network error'))
    const { userIdPromise } = await import('./supabaseClient')
    await expect(userIdPromise).resolves.toBeNull()
  })
})
