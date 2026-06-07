import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Email inválido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(6, 'Mínimo 6 caracteres'),
})

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email('Email inválido'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
