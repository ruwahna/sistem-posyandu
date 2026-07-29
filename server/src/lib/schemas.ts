import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// POSYANDU SCHEMAS
// ─────────────────────────────────────────────────────────────
export const createPosyanduSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  desa: z.string().min(2, 'Desa minimal 2 karakter'),
  kecamatan: z.string().min(2, 'Kecamatan minimal 2 karakter'),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
});

export const updatePosyanduSchema = createPosyanduSchema.partial();

// ─────────────────────────────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  posyanduId: z.string().uuid('ID Posyandu tidak valid'),
  invitationCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

// ─────────────────────────────────────────────────────────────
// BALITA SCHEMAS
// ─────────────────────────────────────────────────────────────
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
  }, 'Tanggal periksa tidak valid atau melebihi hari ini'), // BR-01
  beratBadan: z.number().positive('Berat badan harus angka positif'), // BR-03
  tinggiBadan: z.number().positive('Tinggi badan harus angka positif'), // BR-03
  lingkarKepala: z.number().positive('Lingkar kepala harus angka positif').optional(),
  statusBbU: statusBbUEnum,
  statusTbU: statusTbUEnum,
  statusBbTb: statusBbTbEnum,
  vitaminA: z.boolean(),
});

export const updatePemeriksaanBalitaSchema = createPemeriksaanBalitaSchema.partial();

// ─────────────────────────────────────────────────────────────
// LANSIA SCHEMAS
// ─────────────────────────────────────────────────────────────
export const kemandirianEnum = z.enum(['A', 'B', 'C']);

export const createLansiaSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nik: z
    .string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK harus berupa angka'),
  noBpjs: z.string().optional().or(z.literal('')),
  rtRw: z.string().min(1, 'RT/RW wajib diisi'),
  tanggalLahir: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, 'Tanggal lahir tidak valid atau melebihi hari ini'), // BR-02
  jenisKelamin: jenisKelaminEnum,
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
  riwayatHt: z.boolean().default(false),
  riwayatDm: z.boolean().default(false),
  tingkatKemandirian: kemandirianEnum,
  gangguanMentalEmosional: z.string().optional().or(z.literal('')),
});

export const updateLansiaSchema = createLansiaSchema.partial();

export const createPemeriksaanLansiaSchema = z.object({
  tanggalPeriksa: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date <= new Date();
  }, 'Tanggal periksa tidak valid atau melebihi hari ini'), // BR-01
  beratBadan: z.number().positive('Berat badan harus angka positif'), // BR-03
  tinggiBadan: z.number().positive('Tinggi badan harus angka positif'), // BR-03
  tekananDarahSistol: z.number().int().positive('Tekanan darah sistol harus angka positif'),
  tekananDarahDiastol: z.number().int().positive('Tekanan darah diastol harus angka positif'),
  gulaDarahSewaktu: z.number().positive('GDS harus angka positif'),
  lingkarPerut: z.number().positive('Lingkar perut harus angka positif'),
});

export const updatePemeriksaanLansiaSchema = createPemeriksaanLansiaSchema.partial();

// ─────────────────────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────────────────────
export type CreatePosyanduInput = z.infer<typeof createPosyanduSchema>;
export type UpdatePosyanduInput = z.infer<typeof updatePosyanduSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type CreateBalitaInput = z.infer<typeof createBalitaSchema>;
export type UpdateBalitaInput = z.infer<typeof updateBalitaSchema>;
export type CreatePemeriksaanBalitaInput = z.infer<typeof createPemeriksaanBalitaSchema>;

export type CreateLansiaInput = z.infer<typeof createLansiaSchema>;
export type UpdateLansiaInput = z.infer<typeof updateLansiaSchema>;
export type CreatePemeriksaanLansiaInput = z.infer<typeof createPemeriksaanLansiaSchema>;
