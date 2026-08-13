import { z } from 'zod';

export const jenisKelaminEnum = z.enum(['L', 'P']);

export const createBalitaSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nik: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK harus berupa angka')
    .optional()
    .or(z.literal('')),
  tanggalLahir: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, 'Tanggal lahir tidak valid atau melebihi hari ini'),
  jenisKelamin: jenisKelaminEnum,
  namaIbu: z.string().min(2, 'Nama ibu minimal 2 karakter'),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
});

export const updateBalitaSchema = createBalitaSchema.partial();

// Status gizi enums
export const statusBbUEnum = z.enum(['SK', 'K', 'N', 'L']);
export const statusTbUEnum = z.enum(['SP', 'P', 'N', 'T']);
export const statusBbTbEnum = z.enum(['SK', 'K', 'N', 'G']);

export const createPemeriksaanBalitaSchema = z.object({
  tanggalPeriksa: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, 'Tanggal periksa tidak valid atau melebihi hari ini'),
  beratBadan: z.number().nonnegative('Berat badan tidak boleh bernilai negatif').refine((val) => val > 0, 'Berat badan harus lebih dari 0'),
  tinggiBadan: z.number().nonnegative('Tinggi badan tidak boleh bernilai negatif').refine((val) => val > 0, 'Tinggi badan harus lebih dari 0'),
  lingkarKepala: z.number().nonnegative('Lingkar kepala tidak boleh bernilai negatif').refine((val) => val > 0, 'Lingkar kepala harus lebih dari 0').optional().nullable(),
  lingkarLengan: z.number().nonnegative('Lingkar lengan tidak boleh bernilai negatif').refine((val) => val > 0, 'Lingkar lengan harus lebih dari 0').optional().nullable(),
  statusBbU: statusBbUEnum.optional(),
  statusTbU: statusTbUEnum.optional(),
  statusBbTb: statusBbTbEnum.optional(),
  statusKms: z.string().optional().nullable(),
  vitaminA: z.boolean(),
  asiEksklusif: z.boolean().optional().nullable(),
  obatCacing: z.boolean().optional().nullable(),
  statusImunisasi: z.string().optional().nullable(),
  usiaBulan: z.number().optional(),
}).passthrough(); // Allow extra fields dari frontend

export const updatePemeriksaanBalitaSchema = createPemeriksaanBalitaSchema.partial();

export type CreateBalitaInput = z.infer<typeof createBalitaSchema>;
export type UpdateBalitaInput = z.infer<typeof updateBalitaSchema>;
export type CreatePemeriksaanBalitaInput = z.infer<typeof createPemeriksaanBalitaSchema>;
