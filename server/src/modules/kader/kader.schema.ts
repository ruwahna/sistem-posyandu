import { z } from 'zod';

export const createKaderSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
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

export type CreateKaderInput = z.infer<typeof createKaderSchema>;
export type UpdateKaderRoleInput = z.infer<typeof updateKaderRoleSchema>;
export type UpdateKaderStatusInput = z.infer<typeof updateKaderStatusSchema>;
