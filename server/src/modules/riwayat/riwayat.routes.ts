import { Router } from 'express';
import { getRiwayat, exportRiwayatExcel, exportRiwayatPdf } from './riwayat.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// GET /api/posyandu/:posyanduId/riwayat — Riwayat pemeriksaan bulanan
router.get('/riwayat', authenticate, getRiwayat);

// GET /api/posyandu/:posyanduId/export — Export Excel laporan riwayat
router.get('/export', authenticate, exportRiwayatExcel);

// GET /api/posyandu/:posyanduId/export-pdf — Export PDF laporan riwayat
router.get('/export-pdf', authenticate, exportRiwayatPdf);

// Support legacy route `/export/pdf` as well
router.get('/export/pdf', authenticate, exportRiwayatPdf);

export default router;
