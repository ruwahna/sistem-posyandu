import { z } from 'zod';

export const createPosyanduSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  desa: z.string().min(2, 'Desa minimal 2 karakter'),
  kecamatan: z.string().min(2, 'Kecamatan minimal 2 karakter'),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
});

export const updatePosyanduSchema = createPosyanduSchema.partial();

export type CreatePosyanduInput = z.infer<typeof createPosyanduSchema>;
export type UpdatePosyanduInput = z.infer<typeof updatePosyanduSchema>;
