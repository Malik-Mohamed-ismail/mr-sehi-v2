import { z } from 'zod'

export const LoginSchema = z.object({
  email:    z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const CreateUserSchema = z.object({
  username:  z.string().min(3).max(50),
  email:     z.string().email(),
  password:  z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  full_name: z.string().min(1).max(100),
  role:      z.enum(['admin', 'accountant', 'cashier']).default('cashier'),
})

export const UpdateUserSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  role:      z.enum(['admin', 'accountant', 'cashier']).optional(),
  is_active: z.boolean().optional(),
})

export const ChangePasswordSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
})

export type LoginDto          = z.infer<typeof LoginSchema>
export type CreateUserDto     = z.infer<typeof CreateUserSchema>
export type UpdateUserDto     = z.infer<typeof UpdateUserSchema>
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>
