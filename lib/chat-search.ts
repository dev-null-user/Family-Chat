import type { User } from './types'

function norm(s: string): string {
  return s.trim().toLowerCase()
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}

/** Поиск по имени, email или телефону (фрагменты цифр в номере). */
export function userMatchesChatQuery(user: User, rawQuery: string): boolean {
  const q = norm(rawQuery)
  if (!q) return true
  if (norm(user.name).includes(q)) return true
  if (norm(user.email).includes(q)) return true
  const phone = user.phone
  if (!phone) return false
  const qd = digitsOnly(rawQuery)
  if (qd.length >= 2 && digitsOnly(phone).includes(qd)) return true
  if (norm(phone).includes(q)) return true
  return false
}
