import { Request, Response } from 'express';
import { getPublicPosyanduList, getPublicPemeriksaanData } from './public.service';

export const getPosyanduListController = async (_req: Request, res: Response) => {
  try {
    const data = await getPublicPosyanduList();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat daftar posyandu.' });
  }
};

export const getPemeriksaanPuskesmasController = async (req: Request, res: Response) => {
  try {
    const { posyanduId, kategori, status, search, startDate, endDate } = req.query;

    const data = await getPublicPemeriksaanData({
      posyanduId: posyanduId as string,
      kategori: kategori as 'Balita' | 'Lansia' | 'Semua',
      status: status as string,
      search: search as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      success: true,
      data,
      meta: {
        total: data.length,
        privacyProtected: true,
        note: 'Nomor NIK, No BPJS, dan alamat rumah spesifik disensor untuk perlindungan privasi data medis publik.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat data pemeriksaan puskesmas.' });
  }
};
