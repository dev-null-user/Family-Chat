import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { z } from 'zod'

/** Parses `req.body` with Zod and replaces it with the parsed value, or responds 400. */
export function validateBody<T extends z.ZodTypeAny>(schema: T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten(),
      })
    }
    req.body = parsed.data as Request['body']
    next()
  }
}
