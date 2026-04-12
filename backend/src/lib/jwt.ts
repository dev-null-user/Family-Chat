import jwt, { type SignOptions } from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'

export type AccessPayload = { sub: string; email: string; typ: 'access' }
export type RefreshPayload = { sub: string; jti: string; typ: 'refresh' }

export function signAccessToken(userId: string, email: string): string {
  const payload: AccessPayload = { sub: userId, email, typ: 'access' }
  const opts: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'] }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, opts)
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = randomUUID()
  const payload: RefreshPayload = { sub: userId, jti, typ: 'refresh' }
  const opts: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'] }
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, opts)
  return { token, jti }
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
  if (typeof decoded !== 'object' || decoded === null || (decoded as AccessPayload).typ !== 'access') {
    throw new Error('Invalid access token')
  }
  return decoded as AccessPayload
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET)
  if (typeof decoded !== 'object' || decoded === null || (decoded as RefreshPayload).typ !== 'refresh') {
    throw new Error('Invalid refresh token')
  }
  return decoded as RefreshPayload
}
