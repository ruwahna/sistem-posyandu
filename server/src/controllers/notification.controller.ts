import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';

/**
 * GET /api/posyandu/:posyanduId/notifications
 * Mengambil daftar notifikasi dinamis untuk posyandu
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;

    // Tenant isolation check
    if (req.user?.role !== 'OWNER' && req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Akses ditolak ke posyandu ini' });
      return;
    }

    const data = await notificationService.getNotifications(posyanduId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Gagal mengambil notifikasi',
    });
  }
};

/**
 * POST /api/posyandu/:posyanduId/notifications/read
 * Menandai semua notifikasi sebagai sudah dibaca
 */
export const markNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const posyanduId = req.params.posyanduId as string;
    const { notificationIds } = req.body;

    if (req.user?.role !== 'OWNER' && req.user?.posyanduId !== posyanduId) {
      res.status(403).json({ success: false, message: 'Akses ditolak ke posyandu ini' });
      return;
    }

    await notificationService.markAllAsRead(posyanduId, Array.isArray(notificationIds) ? notificationIds : []);
    res.json({ success: true, message: 'Notifikasi berhasil ditandai dibaca' });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Gagal mengubah status notifikasi',
    });
  }
};
