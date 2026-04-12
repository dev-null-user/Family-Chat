import type { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service.js'
import { AuthError } from '../services/auth.service.js'
import * as userService from '../services/user.service.js'
import type {
  ForgotPasswordBody,
  LoginBody,
  ProfilePatchBody,
  RefreshBody,
  RegisterBody,
} from '../routes/http/schemas/auth.schemas.js'
import { toPublicUser } from '../lib/user-dto.js'

export async function postRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as RegisterBody
    const result = await authService.register(body.email, body.password, body.name, {
      phone: body.phone,
      gender: body.gender,
      birthYear: body.birthYear,
    })
    res.status(201).json(result)
  } catch (e) {
    if (e instanceof AuthError) return res.status(e.status).json({ error: e.message })
    next(e)
  }
}

export async function postLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as LoginBody
    const result = await authService.login(body.email, body.password)
    res.json(result)
  } catch (e) {
    if (e instanceof AuthError) return res.status(e.status).json({ error: e.message })
    next(e)
  }
}

export async function postRefresh(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as RefreshBody
    const result = await authService.refresh(body.refreshToken)
    res.json(result)
  } catch (e) {
    if (e instanceof AuthError) return res.status(e.status).json({ error: e.message })
    next(e)
  }
}

export async function postLogout(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as RefreshBody
    await authService.logout(body.refreshToken)
    res.status(204).send()
  } catch (e) {
    next(e)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    const user = await userService.findUserById(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(toPublicUser(user))
  } catch (e) {
    next(e)
  }
}

export async function patchMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    const body = req.body as ProfilePatchBody
    const updated = await userService.updateUserProfile(req.user.id, body)
    res.json(toPublicUser(updated))
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'Этот email уже занят' })
    }
    next(e)
  }
}

export async function postForgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as ForgotPasswordBody
    await authService.requestPasswordReset(body.email)
    res.status(204).send()
  } catch (e) {
    next(e)
  }
}
