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

    // Validate input
    if (!posyanduId) {
      res.status(400).json({ success: false, message: 'posyanduId tidak boleh kosong' });
      return;
    }

    // Validate bulan if provided
    if (bulan && (Number(bulan) < 1 || Number(bulan) > 12)) {
      res.status(400).json({ success: false, message: 'Bulan harus antara 1-12' });
      return;
    }

    // Validate tahun if provided
    if (tahun && (Number(tahun) < 1900 || Number(tahun) > new Date().getFullYear())) {
      res.status(400).json({ success: false, message: `Tahun harus antara 1900-${new Date().getFullYear()}` });
      return;
    }

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
    const error = err as Error;
    if (error.message === 'Posyandu tidak ditemukan') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Gagal generate Excel', error: error.message });
    }
  }
};

/**
 * GET /api/posyandu/:posyanduId/export/pdf
 * Export seluruh data riwayat atau sesuai filter ke format PDF
 */
export const exportRiwayatPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { tipe, search, status, bulan, tahun } = req.query as {
      tipe?: 'semua' | 'Balita' | 'Lansia';
      search?: string;
      status?: 'semua' | 'success' | 'warning';
      bulan?: string;
      tahun?: string;
    };

    const doc = await riwayatService.generatePdfExport(posyanduId, {
      tipe,
      search,
      status,
      bulan: bulan ? Number(bulan) : undefined,
      tahun: tahun ? Number(tahun) : undefined,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Laporan_Posyandu_${new Date().toISOString().slice(0, 10)}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (err) {
    throw err;
  }
};

/**
 * GET /api/posyandu/:posyanduId/export-pdf
 * Export seluruh data riwayat atau sesuai filter ke format PDF
 */
export const exportRiwayatPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { tipe, search, status, bulan, tahun } = req.query as {
      tipe?: 'semua' | 'Balita' | 'Lansia';
      search?: string;
      status?: 'semua' | 'success' | 'warning';
      bulan?: string;
      tahun?: string;
    };

    // Validate input
    if (!posyanduId) {
      res.status(400).json({ success: false, message: 'posyanduId tidak boleh kosong' });
      return;
    }

    // Validate bulan if provided
    if (bulan && (Number(bulan) < 1 || Number(bulan) > 12)) {
      res.status(400).json({ success: false, message: 'Bulan harus antara 1-12' });
      return;
    }

    // Validate tahun if provided
    if (tahun && (Number(tahun) < 1900 || Number(tahun) > new Date().getFullYear())) {
      res.status(400).json({ success: false, message: `Tahun harus antara 1900-${new Date().getFullYear()}` });
      return;
    }

    const doc = await riwayatService.generatePdfExport(posyanduId, {
      tipe,
      search,
      status,
      bulan: bulan ? Number(bulan) : undefined,
      tahun: tahun ? Number(tahun) : undefined,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Laporan_Posyandu_${new Date().toISOString().slice(0, 10)}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (err) {
    const error = err as Error;
    if (error.message === 'Posyandu tidak ditemukan') {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Gagal generate PDF', error: error.message });
    }
  }
};
