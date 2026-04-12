import { createServer } from 'node:http'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from './config/env.js'
import { db, closeDb } from './db/index.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import { httpRouter } from './routes/http/index.js'
import { attachSocketIo } from './ws/index.js'
import { closeRedis } from './services/redis.service.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(helmet())
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use('/api', httpRouter)
app.use(notFoundHandler)
app.use(errorHandler)

const httpServer = createServer(app)
attachSocketIo(httpServer)

async function runStartupMigrations() {
  await migrate(db, { migrationsFolder: path.join(__dirname, 'db', 'migrations') })
}

async function shutdown(signal: string) {
  console.info(`${signal} received, shutting down…`)
  httpServer.close()
  await closeDb()
  await closeRedis()
  process.exit(0)
}

runStartupMigrations()
  .then(() => {
    httpServer.listen(env.PORT, () => {
      console.info(`HTTP + WS listening on :${env.PORT}`)
      console.info(`REST base: http://localhost:${env.PORT}/api`)
      console.info(`Socket.io namespace: /chat (auth: handshake auth.token or query.token)`)
    })
  })
  .catch((e) => {
    console.error('Failed to start:', e)
    process.exit(1)
  })

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
