import { Request, Response } from 'express';
import { lansiaService, kelompokUmurLansia } from '../services';

// ─────────────────────────────────────────────────────────────
// LANSIA CRUD
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/posyandu/:posyanduId/lansia
 * FR-27: Daftar lansia dengan pencarian, filter kelompok umur, filter HT/DM
 */
export const getAllLansia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { posyanduId } = req.params;
    const { search, kelompokUmur, ht, dm } = req.query as {
      search?: string;
      kelompokUmur?: string;
      ht?: string;
      dm?: string;
    };

    const filterHt = ht !== undefined ? ht === 'true' : undefined;
    const filterDm = dm !== undefined ? dm === 'true' : undefined;

    const data = await lansiaService.findAll(posyanduId, search, kelompokUmur, filterHt, filterDm);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/posyandu/:posyanduId/lansia/:id
 * FR-28: Detail lansia + riwayat pemeriksaan
 */
export const getLansiaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { posyanduId, id } = req.params;
    const lansia = await lansiaService.findById(id, posyanduId);

    if (!lansia) {
      res.status(404).json({ success: false, message: 'Lansia tidak ditemukan' });
      return;
    }

    // BR-05: Hitung usia otomatis
    const now = new Date();
    const usiaTahun = now.getFullYear() - lansia.tanggalLahir.getFullYear();

    res.json({
      success: true,
      data: {
        ...lansia,
        usiaTahun,
        kelompokUmur: kelompokUmurLansia(usiaTahun),
      },
    });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/posyandu/:posyanduId/lansia
 * FR-22, FR-23, FR-24, FR-25: Tambah data lansia baru
 */
export const createLansia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { posyanduId } = req.params;
    const {
      nama, nik, noBpjs, rtRw, tanggalLahir, jenisKelamin,
      alamat, riwayatHt, riwayatDm, tingkatKemandirian, gangguanMentalEmosional,
    } = req.body;

    const data = await lansiaService.create(posyanduId, {
      nama,
      nik,
      noBpjs: noBpjs || null,
      rtRw,
      tanggalLahir: new Date(tanggalLahir),
      jenisKelamin,
      alamat,
      riwayatHt: riwayatHt ?? false,
      riwayatDm: riwayatDm ?? false,
      tingkatKemandirian,
      gangguanMentalEmosional: gangguanMentalEmosional || null,
    });

    res.status(201).json({ success: true, message: 'Data lansia berhasil ditambahkan', data });
  } catch (err) {
    throw err;
  }
};

/**
 * PATCH /api/posyandu/:posyanduId/lansia/:id
 * FR-26: Ubah data identitas lansia
 */
export const updateLansia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { posyanduId, id } = req.params;
    const { tanggalLahir, ...rest } = req.body;

    const data = await lansiaService.update(id, posyanduId, {
      ...rest,
      ...(tanggalLahir && { tanggalLahir: new Date(tanggalLahir) }),
    });

    res.json({ success: true, message: 'Data lansia berhasil diperbarui', data });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('tidak ditemukan')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    throw err;
  }
};

/**
 * DELETE /api/posyandu/:posyanduId/lansia/:id
 * FR-26: Hapus data lansia
 */
export const deleteLansia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { posyanduId, id } = req.params;
    await lansiaService.delete(id, posyanduId);
    res.json({ success: true, message: 'Data lansia berhasil dihapus' });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('tidak ditemukan')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────
// PEMERIKSAAN LANSIA
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/posyandu/:posyanduId/lansia/:lansiaId/pemeriksaan
 * FR-30: Riwayat pemeriksaan lansia terurut terbaru
 */
export const getAllPemeriksaanLansia = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await lansiaService.findAllPemeriksaan(req.params.lansiaId);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

/**
 * POST /api/posyandu/:posyanduId/lansia/:lansiaId/pemeriksaan
 * FR-29: Tambah entri pemeriksaan lansia
 */
export const createPemeriksaanLansia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lansiaId } = req.params;
    const {
      tanggalPeriksa, beratBadan, tinggiBadan,
      tekananDarahSistol, tekananDarahDiastol, gulaDarahSewaktu, lingkarPerut,
    } = req.body;

    const data = await lansiaService.createPemeriksaan(lansiaId, {
      tanggalPeriksa: new Date(tanggalPeriksa),
      beratBadan,
      tinggiBadan,
      tekananDarahSistol,
      tekananDarahDiastol,
      gulaDarahSewaktu,
      lingkarPerut,
    });

    res.status(201).json({ success: true, message: 'Pemeriksaan lansia berhasil ditambahkan', data });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('tidak ditemukan')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    throw err;
  }
};

/**
 * PATCH /api/posyandu/:posyanduId/lansia/:lansiaId/pemeriksaan/:id
 * FR-31: Edit entri pemeriksaan lansia
 */
export const updatePemeriksaanLansia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tanggalPeriksa, ...rest } = req.body;

    const data = await lansiaService.updatePemeriksaan(id, {
      ...rest,
      ...(tanggalPeriksa && { tanggalPeriksa: new Date(tanggalPeriksa) }),
    });

    res.json({ success: true, message: 'Pemeriksaan lansia berhasil diperbarui', data });
  } catch (err) {
    throw err;
  }
};

/**
 * DELETE /api/posyandu/:posyanduId/lansia/:lansiaId/pemeriksaan/:id
 * FR-31: Hapus entri pemeriksaan lansia
 */
export const deletePemeriksaanLansia = async (req: Request, res: Response): Promise<void> => {
  try {
    await lansiaService.deletePemeriksaan(req.params.id);
    res.json({ success: true, message: 'Pemeriksaan lansia berhasil dihapus' });
  } catch (err) {
    throw err;
  }
};
