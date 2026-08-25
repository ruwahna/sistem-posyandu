import { z } from 'zod';

export const createPeriodeSchema = z.object({
  nama: z.string().min(1, 'Nama periode tidak boleh kosong'),
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2000).max(2100),
  tanggal: z.string().min(1, 'Tanggal kegiatan posyandu harus diisi'),
  status: z.enum(['AKTIF', 'SELESAI']).optional().default('AKTIF'),
  catatan: z.string().optional(),
});

export const updatePeriodeSchema = z.object({
  nama: z.string().min(1, 'Nama periode tidak boleh kosong').optional(),
  bulan: z.number().min(1).max(12).optional(),
  tahun: z.number().min(2000).max(2100).optional(),
  tanggal: z.string().optional(),
  status: z.enum(['AKTIF', 'SELESAI']).optional(),
  catatan: z.string().optional(),
});

export type CreatePeriodeInput = z.infer<typeof createPeriodeSchema>;
export type UpdatePeriodeInput = z.infer<typeof updatePeriodeSchema>;
