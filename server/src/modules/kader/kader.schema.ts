import { z } from 'zod';

export const createKaderSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter').max(30, 'Username maksimal 30 karakter').regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya boleh huruf, angka, titik, underscore, dan strip').optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['OWNER', 'KADER']).default('KADER'),
});

export const updateKaderRoleSchema = z.object({
  role: z.enum(['OWNER', 'KADER']),
});

export const updateKaderStatusSchema = z.object({
  isActive: z.boolean(),
});

export const updateKaderSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').max(30, 'Username maksimal 30 karakter').regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya boleh huruf, angka, titik, underscore, dan strip').optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  role: z.enum(['OWNER', 'KADER']).optional(),
});

export type CreateKaderInput = z.infer<typeof createKaderSchema>;
export type UpdateKaderRoleInput = z.infer<typeof updateKaderRoleSchema>;
export type UpdateKaderStatusInput = z.infer<typeof updateKaderStatusSchema>;
export type UpdateKaderInput = z.infer<typeof updateKaderSchema>;
