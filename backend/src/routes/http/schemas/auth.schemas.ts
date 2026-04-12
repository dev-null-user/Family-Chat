import { z } from 'zod'

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(200),
  phone: z.string().max(50).optional(),
  gender: z.enum(['male', 'female']).optional(),
  birthYear: z.number().int().min(1900).max(2100).optional(),
})

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
})

export const forgotPasswordBodySchema = z.object({
  email: z.string().email(),
})

export type RegisterBody = z.infer<typeof registerBodySchema>
export type LoginBody = z.infer<typeof loginBodySchema>
export type RefreshBody = z.infer<typeof refreshBodySchema>
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>

export const profilePatchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(50).nullable().optional(),
    gender: z.enum(['male', 'female']).nullable().optional(),
    birthYear: z.number().int().min(1900).max(2100).nullable().optional(),
    avatar: z.string().max(8_000_000).nullable().optional(),
  })
  .refine((o) => Object.values(o).some((v) => v !== undefined), {
    message: 'Укажите хотя бы одно поле',
  })

export type ProfilePatchBody = z.infer<typeof profilePatchSchema>
