import { insforge } from '@/lib/insforge'
import type { Result } from '@/types'

interface InsForgeUser {
  id: string
  email: string
  emailVerified: boolean
  providers?: string[]
  createdAt: string
  updatedAt: string
  profile: {
    name?: string
    avatar_url?: string
  } | null
  metadata: Record<string, unknown> | null
}

interface AuthResponse {
  user: InsForgeUser
  accessToken: string
}

export const authService = {
  async signInWithGoogle(): Promise<Result<void>> {
    const { error } = await insforge.auth.signInWithOAuth('google', {
      redirectTo: `${window.location.origin}/`,
    })

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: undefined }
  },

  async getCurrentUser(): Promise<Result<InsForgeUser | null>> {
    const { data, error } = await insforge.auth.getCurrentUser()

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: data.user }
  },

  async signOut(): Promise<Result<void>> {
    const { error } = await insforge.auth.signOut()

    if (error) {
      return { ok: false, error }
    }

    return { ok: true, data: undefined }
  },

  async signInWithEmail(email: string, password: string): Promise<Result<AuthResponse>> {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { ok: false, error }
    }

    if (!data) {
      return { ok: false, error: new Error('No data returned') }
    }

    return {
      ok: true,
      data: {
        user: data.user,
        accessToken: data.accessToken,
      },
    }
  },

  async signUp(email: string, password: string, name?: string): Promise<Result<AuthResponse>> {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
    })

    if (error) {
      return { ok: false, error }
    }

    if (!data?.user) {
      return { ok: false, error: new Error('No user data returned') }
    }

    return {
      ok: true,
      data: {
        user: data.user,
        accessToken: data.accessToken ?? '',
      },
    }
  },
}
