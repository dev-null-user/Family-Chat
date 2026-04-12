import type { Server } from 'socket.io'
import type { AuthedSocket } from '../middleware/socket-auth.middleware.js'

/**
 * Маршруты событий Socket.io (аналог HTTP routes для WS).
 * Здесь только регистрация имён событий и делегирование в сервисы при необходимости.
 */
export function registerChatWsRoutes(io: Server) {
  io.of('/chat').on('connection', (socket: AuthedSocket) => {
    const user = socket.data
    socket.emit('welcome', { message: 'connected', userId: user.userId })

    socket.on('ping', (_payload: unknown, ack?: (p: unknown) => void) => {
      if (typeof ack === 'function') ack({ ok: true, t: Date.now() })
      else socket.emit('pong', { t: Date.now() })
    })

    socket.on('disconnect', (reason) => {
      console.debug(`socket ${socket.id} disconnected: ${reason}`)
    })
  })
}
