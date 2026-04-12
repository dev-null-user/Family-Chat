import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '@/lib/auth-tokens'

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}

export type AuthUserDto = {
  id: string
  email: string
  name: string
  phone?: string
  gender?: 'male' | 'female'
  birthYear?: number
  avatar?: string
}

export type ProfilePatchDto = {
  name?: string
  email?: string
  phone?: string | null
  gender?: 'male' | 'female' | null
  birthYear?: number | null
  avatar?: string | null
}

export type AuthTokensResponse = {
  user: AuthUserDto
  accessToken: string
  refreshToken: string
}

function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim()
  const base = (raw && raw.length > 0 ? raw : 'http://localhost:4000').replace(/\/$/, '')
  return base
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    const msg =
      data && typeof data === 'object' && data !== null && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : res.statusText
    throw new AuthApiError(msg, res.status)
  }
  return data as T
}

export async function authLogin(email: string, password: string): Promise<AuthTokensResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return parseResponse<AuthTokensResponse>(res)
}

export async function authRegister(payload: {
  name: string
  email: string
  password: string
  phone?: string
  gender?: 'male' | 'female'
  birthYear?: number
}): Promise<AuthTokensResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse<AuthTokensResponse>(res)
}

export async function authRefresh(refreshToken: string): Promise<AuthTokensResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  return parseResponse<AuthTokensResponse>(res)
}

export async function authLogout(refreshToken: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  await parseResponse<void>(res)
}

export async function authForgotPassword(email: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  await parseResponse<void>(res)
}

export async function authGetMe(accessToken: string): Promise<AuthUserDto> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return parseResponse<AuthUserDto>(res)
}

export async function authPatchMe(accessToken: string, patch: ProfilePatchDto): Promise<AuthUserDto> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(patch),
  })
  return parseResponse<AuthUserDto>(res)
}

/** Отзыв refresh на сервере и очистка токенов локально. */
export async function logoutFromServer(): Promise<void> {
  const rt = getRefreshToken()
  if (rt) {
    try {
      await authLogout(rt)
    } catch {
      /* сеть / истёкший токен — всё равно выходим локально */
    }
  }
  clearTokens()
}

/** Восстанавливает сессию по токенам в localStorage; возвращает пользователя или `null`. */
export async function restoreSession(): Promise<AuthUserDto | null> {
  const rt = getRefreshToken()
  if (!rt) return null

  const at = getAccessToken()
  if (at) {
    try {
      return await authGetMe(at)
    } catch (e) {
      if (!(e instanceof AuthApiError) || e.status !== 401) throw e
    }
  }

  const refreshed = await authRefresh(rt)
  saveTokens(refreshed.accessToken, refreshed.refreshToken)
  return refreshed.user
}
