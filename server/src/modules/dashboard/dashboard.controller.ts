import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;

    if (req.user?.role !== 'OWNER' && req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Akses ditolak ke posyandu ini' });
      return;
    }

    const data = await dashboardService.getSummary(posyanduId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
