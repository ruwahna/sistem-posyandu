import { Request, Response } from 'express';
import { dashboardService } from '../services';

/**
 * GET /api/dashboard/:posyanduId
 * FR-05 sd FR-09: Ringkasan metrik dashboard posyandu
 */
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { posyanduId } = req.params;

    // Isolasi tenant: kader hanya bisa akses posyandu miliknya (NFR-05)
    if (req.user?.role !== 'OWNER' && req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Akses ditolak ke posyandu ini' });
      return;
    }

    const data = await dashboardService.getSummary(posyanduId);
    res.json({ success: true, data });
  } catch (err) {
    throw err;
  }
};
