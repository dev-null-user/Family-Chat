import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' })
}

export const errorHandler: ErrorRequestHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  const status = 'status' in err && typeof (err as { status?: number }).status === 'number' ? (err as { status: number }).status : 500
  const message = status === 500 ? 'Internal server error' : err.message
  res.status(status).json({ error: message })
}
