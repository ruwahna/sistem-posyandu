import { Request, Response, NextFunction } from 'express';
import { riwayatService } from './riwayat.service';

export const getRiwayat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    next(err);
  }
};

export const exportRiwayatExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { tipe, search, status, bulan, tahun } = req.query as {
      tipe?: 'semua' | 'Balita' | 'Lansia';
      search?: string;
      status?: 'semua' | 'success' | 'warning';
      bulan?: string;
      tahun?: string;
    };

    if (!posyanduId) {
      res.status(400).json({ success: false, message: 'posyanduId tidak boleh kosong' });
      return;
    }

    if (bulan && (Number(bulan) < 1 || Number(bulan) > 12)) {
      res.status(400).json({ success: false, message: 'Bulan harus antara 1-12' });
      return;
    }

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
  } catch (err: any) {
    if (err.message === 'Posyandu tidak ditemukan') {
      res.status(404).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: 'Gagal generate Excel', error: err.message });
    }
  }
};

export const exportRiwayatPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { tipe, search, status, bulan, tahun } = req.query as {
      tipe?: 'semua' | 'Balita' | 'Lansia';
      search?: string;
      status?: 'semua' | 'success' | 'warning';
      bulan?: string;
      tahun?: string;
    };

    if (!posyanduId) {
      res.status(400).json({ success: false, message: 'posyanduId tidak boleh kosong' });
      return;
    }

    if (bulan && (Number(bulan) < 1 || Number(bulan) > 12)) {
      res.status(400).json({ success: false, message: 'Bulan harus antara 1-12' });
      return;
    }

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
  } catch (err: any) {
    if (err.message === 'Posyandu tidak ditemukan') {
      res.status(404).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: 'Gagal generate PDF', error: err.message });
    }
  }
};
