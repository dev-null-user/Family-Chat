import type { Socket } from 'socket.io'
import { verifyAccessToken } from '../../lib/jwt.js'
import * as userService from '../../services/user.service.js'

export type AuthedSocket = Socket & {
  data: { userId: string; email: string; name: string }
}

export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token =
    (typeof socket.handshake.auth?.token === 'string' && socket.handshake.auth.token) ||
    (typeof socket.handshake.query.token === 'string' && socket.handshake.query.token) ||
    null

  if (!token) {
    return next(new Error('Unauthorized: missing token'))
  }

  try {
    const payload = verifyAccessToken(token)
    const user = await userService.findUserById(payload.sub)
    if (!user) return next(new Error('Unauthorized: user not found'))
    socket.data.userId = user.id
    socket.data.email = user.email
    socket.data.name = user.name
    next()
  } catch {
    next(new Error('Unauthorized: invalid token'))
  }
}
