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
  beratBadan: z.number().nonnegative('Berat badan tidak boleh bernilai negatif').refine((val) => val > 0, 'Berat badan harus lebih dari 0'),
  tinggiBadan: z.number().nonnegative('Tinggi badan tidak boleh bernilai negatif').refine((val) => val > 0, 'Tinggi badan harus lebih dari 0'),
  tekananDarahSistol: z.number().int().nonnegative('Tekanan darah sistol tidak boleh bernilai negatif').refine((val) => val > 0, 'Tekanan darah sistol harus lebih dari 0'),
  tekananDarahDiastol: z.number().int().nonnegative('Tekanan darah diastol tidak boleh bernilai negatif').refine((val) => val > 0, 'Tekanan darah diastol harus lebih dari 0'),
  gulaDarahSewaktu: z.number().nonnegative('GDS tidak boleh bernilai negatif').refine((val) => val > 0, 'GDS harus lebih dari 0'),
  lingkarPerut: z.number().nonnegative('Lingkar perut tidak boleh bernilai negatif').refine((val) => val > 0, 'Lingkar perut harus lebih dari 0'),
  kolesterol: z.number().nonnegative('Kolesterol tidak boleh bernilai negatif').refine((val) => val > 0, 'Kolesterol harus lebih dari 0').optional().nullable(),
  asamUrat: z.number().nonnegative('Asam urat tidak boleh bernilai negatif').refine((val) => val > 0, 'Asam urat harus lebih dari 0').optional().nullable(),
  keluhan: z.string().optional().nullable(),
  tindakan: z.string().optional().nullable(),
});

export const updatePemeriksaanLansiaSchema = createPemeriksaanLansiaSchema.partial();

export type CreateLansiaInput = z.infer<typeof createLansiaSchema>;
export type UpdateLansiaInput = z.infer<typeof updateLansiaSchema>;
export type CreatePemeriksaanLansiaInput = z.infer<typeof createPemeriksaanLansiaSchema>;
