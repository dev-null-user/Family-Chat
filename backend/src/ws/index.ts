import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import { env } from '../config/env.js'
import { socketAuthMiddleware } from './middleware/socket-auth.middleware.js'
import { registerChatWsRoutes } from './routes/chat.ws-routes.js'

export function attachSocketIo(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      methods: ['GET', 'POST'],
    },
  })

  io.of('/chat').use(socketAuthMiddleware)
  registerChatWsRoutes(io)

  return io
}
