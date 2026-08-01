import { Request, Response } from 'express';
import { balitaService, hitungUsiaBulan, kelompokUsiaBulan } from '../services';

// ─────────────────────────────────────────────────────────────
// BALITA CRUD
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/posyandu/:posyanduId/balita
 * FR-14: Daftar balita dengan pencarian nama & filter kelompok usia
 */
export const getAllBalita = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { search, kelompokUsia } = req.query as { search?: string; kelompokUsia?: string };

    const data = await balitaService.findAll(posyanduId, search, kelompokUsia);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/posyandu/:posyanduId/balita/:id
 * FR-15: Detail balita + riwayat pemeriksaan
 */
export const getBalitaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const id = req.params.id as string;
    const balita = await balitaService.findById(id, posyanduId);

    if (!balita) {
      res.status(404).json({ success: false, message: 'Balita tidak ditemukan' });
      return;
    }

    // FR-16: Hitung usia otomatis (BR-05)
    const usiaBulan = hitungUsiaBulan(balita.tanggalLahir);
    res.json({
      success: true,
      data: {
        ...balita,
        usiaBulan,
        kelompokUsia: kelompokUsiaBulan(usiaBulan),
      },
    });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/posyandu/:posyanduId/balita
 * FR-11: Tambah data balita baru
 */
export const createBalita = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { nama, nik, tanggalLahir, jenisKelamin, namaIbu, alamat } = req.body;

    const data = await balitaService.create(posyanduId, {
      nama,
      nik: nik || null,
      tanggalLahir: new Date(tanggalLahir),
      jenisKelamin,
      namaIbu,
      alamat,
    });

    res.status(201).json({ success: true, message: 'Data balita berhasil ditambahkan', data });
  } catch (err) {
    throw err;
  }
};

/**
 * PATCH /api/posyandu/:posyanduId/balita/:id
 * FR-12: Ubah data identitas balita
 */
export const updateBalita = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const id = req.params.id as string;
    const { tanggalLahir, ...rest } = req.body;

    const data = await balitaService.update(id, posyanduId, {
      ...rest,
      ...(tanggalLahir && { tanggalLahir: new Date(tanggalLahir) }),
    });

    res.json({ success: true, message: 'Data balita berhasil diperbarui', data });
  } catch (err) {
    throw err;
  }
};

/**
 * DELETE /api/posyandu/:posyanduId/balita/:id
 * FR-13: Hapus data balita
 */
export const deleteBalita = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const id = req.params.id as string;
    await balitaService.delete(id, posyanduId);
    res.json({ success: true, message: 'Data balita berhasil dihapus' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('tidak ditemukan')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────
// PEMERIKSAAN BALITA
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/posyandu/:posyanduId/balita/:balitaId/pemeriksaan
 * FR-20: Riwayat pemeriksaan balita terurut terbaru
 */
export const getAllPemeriksaanBalita = async (req: Request, res: Response): Promise<void> => {
  try {
    const balitaId = req.params.balitaId as string;
    const data = await balitaService.findAllPemeriksaan(balitaId);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/posyandu/:posyanduId/balita/:balitaId/pemeriksaan
 * FR-17, FR-18, FR-19: Tambah entri pemeriksaan balita
 */
export const createPemeriksaanBalita = async (req: Request, res: Response): Promise<void> => {
  try {
    const balitaId = req.params.balitaId as string;
    const {
      tanggalPeriksa,
      beratBadan,
      tinggiBadan,
      lingkarKepala,
      lingkarLengan,
      statusBbU,
      statusTbU,
      statusBbTb,
      statusKms,
      vitaminA,
      asiEksklusif,
      obatCacing,
      statusImunisasi,
    } = req.body;

    const data = await balitaService.createPemeriksaan(balitaId, {
      tanggalPeriksa: new Date(tanggalPeriksa),
      beratBadan: Number(beratBadan),
      tinggiBadan: Number(tinggiBadan),
      lingkarKepala: lingkarKepala ? Number(lingkarKepala) : undefined,
      lingkarLengan: lingkarLengan ? Number(lingkarLengan) : undefined,
      statusBbU,
      statusTbU,
      statusBbTb,
      statusKms,
      vitaminA: !!vitaminA,
      asiEksklusif: asiEksklusif !== undefined ? !!asiEksklusif : undefined,
      obatCacing: obatCacing !== undefined ? !!obatCacing : undefined,
      statusImunisasi,
    });

    res.status(201).json({ success: true, message: 'Pemeriksaan balita berhasil ditambahkan', data });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('tidak ditemukan')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    throw err;
  }
};

/**
 * PATCH /api/posyandu/:posyanduId/balita/:balitaId/pemeriksaan/:id
 * FR-21: Edit entri pemeriksaan balita
 */
export const updatePemeriksaanBalita = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { tanggalPeriksa, ...rest } = req.body;

    const data = await balitaService.updatePemeriksaan(id, {
      ...rest,
      ...(tanggalPeriksa && { tanggalPeriksa: new Date(tanggalPeriksa) }),
    });

    res.json({ success: true, message: 'Pemeriksaan balita berhasil diperbarui', data });
  } catch (err) {
    throw err;
  }
};

/**
 * DELETE /api/posyandu/:posyanduId/balita/:balitaId/pemeriksaan/:id
 * FR-21: Hapus entri pemeriksaan balita
 */
export const deletePemeriksaanBalita = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await balitaService.deletePemeriksaan(id);
    res.json({ success: true, message: 'Pemeriksaan balita berhasil dihapus' });
  } catch (err) {
    throw err;
  }
};
