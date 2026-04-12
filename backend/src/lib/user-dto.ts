import type { User } from '../db/schema/users.js'

export type PublicUserDto = {
  id: string
  email: string
  name: string
  phone?: string
  gender?: 'male' | 'female'
  birthYear?: number
  avatar?: string
}

export function toPublicUser(row: User): PublicUserDto {
  const gender = row.gender === 'male' || row.gender === 'female' ? row.gender : undefined
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    ...(row.phone ? { phone: row.phone } : {}),
    ...(gender ? { gender } : {}),
    ...(row.birthYear != null ? { birthYear: row.birthYear } : {}),
    ...(row.avatar ? { avatar: row.avatar } : {}),
  }
}
