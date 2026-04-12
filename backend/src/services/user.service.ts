import { and, eq, ne } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users, type User } from '../db/schema/users.js'

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
  return row
}

export async function findUserById(id: string): Promise<User | undefined> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return row
}

export async function createUser(params: {
  email: string
  passwordHash: string
  name: string
  phone?: string
  gender?: 'male' | 'female'
  birthYear?: number
}): Promise<User> {
  const [row] = await db
    .insert(users)
    .values({
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      name: params.name,
      phone: params.phone?.trim() || null,
      gender: params.gender ?? null,
      birthYear: params.birthYear ?? null,
    })
    .returning()
  if (!row) throw new Error('Failed to create user')
  return row
}

export type ProfilePatch = {
  name?: string
  email?: string
  phone?: string | null
  gender?: 'male' | 'female' | null
  birthYear?: number | null
  avatar?: string | null
}

export async function updateUserProfile(userId: string, patch: ProfilePatch): Promise<User> {
  if (patch.email !== undefined) {
    const lower = patch.email.toLowerCase()
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, lower), ne(users.id, userId)))
      .limit(1)
    if (taken) throw new Error('EMAIL_TAKEN')
  }

  const set: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  }
  if (patch.name !== undefined) set.name = patch.name
  if (patch.email !== undefined) set.email = patch.email.toLowerCase()
  if (patch.phone !== undefined) set.phone = patch.phone?.trim() || null
  if (patch.gender !== undefined) set.gender = patch.gender
  if (patch.birthYear !== undefined) set.birthYear = patch.birthYear
  if (patch.avatar !== undefined) set.avatar = patch.avatar

  const [row] = await db.update(users).set(set).where(eq(users.id, userId)).returning()
  if (!row) throw new Error('User not found')
  return row
}
