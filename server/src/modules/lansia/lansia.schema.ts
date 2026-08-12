import { z } from 'zod';
import { jenisKelaminEnum } from '../balita/balita.schema';

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
  }, 'Tanggal lahir tidak valid atau melebihi hari ini'),
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
  }, 'Tanggal periksa tidak valid atau melebihi hari ini'),
  beratBadan: z.number().positive('Berat badan harus angka positif'),
  tinggiBadan: z.number().positive('Tinggi badan harus angka positif'),
  tekananDarahSistol: z.number().int().positive('Tekanan darah sistol harus angka positif'),
  tekananDarahDiastol: z.number().int().positive('Tekanan darah diastol harus angka positif'),
  gulaDarahSewaktu: z.number().positive('GDS harus angka positif'),
  lingkarPerut: z.number().positive('Lingkar perut harus angka positif'),
  kolesterol: z.number().positive('Kolesterol harus angka positif').optional().nullable(),
  asamUrat: z.number().positive('Asam urat harus angka positif').optional().nullable(),
  keluhan: z.string().optional().nullable(),
  tindakan: z.string().optional().nullable(),
});

export const updatePemeriksaanLansiaSchema = createPemeriksaanLansiaSchema.partial();

export type CreateLansiaInput = z.infer<typeof createLansiaSchema>;
export type UpdateLansiaInput = z.infer<typeof updateLansiaSchema>;
export type CreatePemeriksaanLansiaInput = z.infer<typeof createPemeriksaanLansiaSchema>;
