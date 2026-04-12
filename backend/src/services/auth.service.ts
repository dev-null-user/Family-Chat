import jwt from 'jsonwebtoken'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js'
import { toPublicUser } from '../lib/user-dto.js'
import * as userService from './user.service.js'
import * as redisService from './redis.service.js'

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

function refreshTtlSeconds(token: string): number {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null
  if (!decoded?.exp) return 7 * 24 * 3600
  return Math.max(1, decoded.exp - Math.floor(Date.now() / 1000))
}

export async function register(
  email: string,
  password: string,
  name: string,
  profile?: { phone?: string; gender?: 'male' | 'female'; birthYear?: number },
) {
  const existing = await userService.findUserByEmail(email)
  if (existing) throw new AuthError('Email already registered', 409)

  const passwordHash = await hashPassword(password)
  const user = await userService.createUser({
    email,
    passwordHash,
    name,
    phone: profile?.phone,
    gender: profile?.gender,
    birthYear: profile?.birthYear,
  })

  const accessToken = signAccessToken(user.id, user.email)
  const { token: refreshToken, jti } = signRefreshToken(user.id)
  await redisService.storeRefreshSession(jti, user.id, refreshTtlSeconds(refreshToken))

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  }
}

export async function login(email: string, password: string) {
  const user = await userService.findUserByEmail(email)
  if (!user) throw new AuthError('Invalid email or password', 401)

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) throw new AuthError('Invalid email or password', 401)

  const accessToken = signAccessToken(user.id, user.email)
  const { token: refreshToken, jti } = signRefreshToken(user.id)
  await redisService.storeRefreshSession(jti, user.id, refreshTtlSeconds(refreshToken))

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  }
}

export async function refresh(refreshToken: string) {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new AuthError('Invalid refresh token', 401)
  }

  const userId = await redisService.getRefreshUserId(payload.jti)
  if (!userId || userId !== payload.sub) throw new AuthError('Refresh revoked or expired', 401)

  const user = await userService.findUserById(payload.sub)
  if (!user) throw new AuthError('User not found', 401)

  await redisService.revokeRefreshSession(payload.jti)

  const accessToken = signAccessToken(user.id, user.email)
  const { token: newRefresh, jti } = signRefreshToken(user.id)
  await redisService.storeRefreshSession(jti, user.id, refreshTtlSeconds(newRefresh))

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken: newRefresh,
  }
}

export async function logout(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken)
    await redisService.revokeRefreshSession(payload.jti)
  } catch {
    /* ignore */
  }
}

/** Заготовка под письмо со ссылкой сброса; ответ одинаковый при любом email (без перечисления пользователей). */
export async function requestPasswordReset(_email: string): Promise<void> {
  await Promise.resolve()
}
