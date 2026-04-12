import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { healthRouter } from './health.routes.js'

export const httpRouter = Router()

httpRouter.use(healthRouter)
httpRouter.use('/auth', authRouter)
