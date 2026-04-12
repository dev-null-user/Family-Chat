import { Router } from 'express'
import * as authController from '../../controllers/auth.controller.js'
import { validateBody } from '../../middleware/validate.middleware.js'
import { requireAuth } from '../../middleware/auth.middleware.js'
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  profilePatchSchema,
  refreshBodySchema,
  registerBodySchema,
} from './schemas/auth.schemas.js'

export const authRouter = Router()

authRouter.post('/register', validateBody(registerBodySchema), authController.postRegister)
authRouter.post('/login', validateBody(loginBodySchema), authController.postLogin)
authRouter.post('/refresh', validateBody(refreshBodySchema), authController.postRefresh)
authRouter.post('/logout', validateBody(refreshBodySchema), authController.postLogout)
authRouter.post('/forgot-password', validateBody(forgotPasswordBodySchema), authController.postForgotPassword)
authRouter.get('/me', requireAuth, authController.getMe)
authRouter.patch('/me', requireAuth, validateBody(profilePatchSchema), authController.patchMe)
