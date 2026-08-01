import { Request, Response } from 'express';
import { riwayatService } from '../services/riwayat.service';

/**
 * GET /api/posyandu/:posyanduId/riwayat
 * Memuat riwayat pemeriksaan bulanan Balita & Lansia secara terpadu
 */
export const getRiwayat = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { tipe, search, status, bulan, tahun } = req.query as {
      tipe?: 'semua' | 'Balita' | 'Lansia';
      search?: string;
      status?: 'semua' | 'success' | 'warning';
      bulan?: string;
      tahun?: string;
    };

    const data = await riwayatService.getRiwayat(posyanduId, {
      tipe,
      search,
      status,
      bulan: bulan ? Number(bulan) : undefined,
      tahun: tahun ? Number(tahun) : undefined,
    });

    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/posyandu/:posyanduId/export
 * Export seluruh data riwayat atau sesuai filter ke format Excel (.xlsx)
 */
export const exportRiwayatExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { tipe, search, status, bulan, tahun } = req.query as {
      tipe?: 'semua' | 'Balita' | 'Lansia';
      search?: string;
      status?: 'semua' | 'success' | 'warning';
      bulan?: string;
      tahun?: string;
    };

    const workbook = await riwayatService.generateExcelExport(posyanduId, {
      tipe,
      search,
      status,
      bulan: bulan ? Number(bulan) : undefined,
      tahun: tahun ? Number(tahun) : undefined,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Laporan_Posyandu_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    throw err;
  }
};
