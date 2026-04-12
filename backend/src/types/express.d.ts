import type { User } from '../db/schema/users.js'

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email' | 'name'>
    }
  }
}

export {}
