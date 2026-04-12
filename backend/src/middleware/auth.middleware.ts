import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { verifyAccessToken } from '../lib/jwt.js'
import * as userService from '../services/user.service.js'

function extractBearer(header: string | undefined): string | null {
  if (!header || !header.startsWith('Bearer ')) return null
  const token = header.slice(7).trim()
  return token || null
}

/** HTTP: требует заголовок `Authorization: Bearer <access_jwt>`. */
export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearer(req.headers.authorization)
  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }
  try {
    const payload = verifyAccessToken(token)
    const user = await userService.findUserById(payload.sub)
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = { id: user.id, email: user.email, name: user.name }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
