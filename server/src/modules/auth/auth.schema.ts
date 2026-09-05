import { z } from 'zod';

export const registerSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  posyanduId: z.string().uuid('ID Posyandu tidak valid'),
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email atau username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token reset password wajib diisi'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Token Google wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
