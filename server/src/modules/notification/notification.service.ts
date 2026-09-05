import prisma from '../../shared/config/prisma';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'DANGER' | 'WARNING' | 'SUCCESS' | 'INFO';
  createdAt: string;
  isRead: boolean;
  category: 'balita' | 'lansia' | 'system';
}

export const notificationService = {
  /**
   * Sync and retrieve notifications from Database for a specific Posyandu
   */
  async getNotifications(posyanduId: string): Promise<{
    notifications: AppNotification[];
    unreadCount: number;
  }> {
    const posyandu = await prisma.posyandu.findUnique({
      where: { id: posyanduId },
      select: { nama: true },
    });

    if (!posyandu) {
      return { notifications: [], unreadCount: 0 };
    }

    // 1. Sync Balita Peringatan Gizi
    const alertBalita = await prisma.pemeriksaanBalita.findMany({
      where: {
        balita: { posyanduId },
        OR: [
          { statusBbU: { in: ['SK', 'K'] } },
          { statusTbU: { in: ['SP', 'P'] } },
          { statusBbTb: { in: ['SK', 'G'] } },
        ],
      },
      take: 5,
      orderBy: { tanggalPeriksa: 'desc' },
      include: {
        balita: {
          select: { nama: true, namaIbu: true },
        },
      },
    });

    for (const pem of alertBalita) {
      if (!pem.balita) continue;
      const title = `Peringatan Gizi: ${pem.balita.nama}`;
      const existing = await prisma.notification.findFirst({
        where: { posyanduId, title },
      });

      if (!existing) {
        const issues: string[] = [];
        if (pem.statusBbU === 'SK' || pem.statusBbU === 'K') {
          issues.push(`BB/U: ${pem.statusBbU === 'SK' ? 'Sangat Kurang' : 'Kurang'}`);
        }
        if (pem.statusTbU === 'SP' || pem.statusTbU === 'P') {
          issues.push(`TB/U: ${pem.statusTbU === 'SP' ? 'Sangat Pendek (Stunting)' : 'Pendek'}`);
        }
        if (pem.statusBbTb === 'SK' || pem.statusBbTb === 'G') {
          issues.push(`BB/TB: ${pem.statusBbTb === 'SK' ? 'Gizi Buruk' : 'Gizi Kurang'}`);
        }

        await prisma.notification.create({
          data: {
            posyanduId,
            title,
            message: `Usia ${pem.usiaBulan} bln (Ibu ${pem.balita.namaIbu || '-'}). Status: ${issues.join(', ')}. Butuh perhatian gizi.`,
            type: 'DANGER',
            category: 'balita',
            createdAt: pem.tanggalPeriksa,
          },
        });
      }
    }

    // 2. Sync Lansia Peringatan Kesehatan
    const alertLansia = await prisma.pemeriksaanLansia.findMany({
      where: {
        lansia: { posyanduId },
        OR: [
          { tekananDarahSistol: { gte: 140 } },
          { gulaDarahSewaktu: { gte: 200 } },
        ],
      },
      take: 5,
      orderBy: { tanggalPeriksa: 'desc' },
      include: {
        lansia: {
          select: { nama: true, rtRw: true },
        },
      },
    });

    for (const pem of alertLansia) {
      if (!pem.lansia) continue;
      const title = `Peringatan Kesehatan: ${pem.lansia.nama}`;
      const existing = await prisma.notification.findFirst({
        where: { posyanduId, title },
      });

      if (!existing) {
        const issues: string[] = [];
        if (pem.tekananDarahSistol >= 140) {
          issues.push(`TD: ${pem.tekananDarahSistol}/${pem.tekananDarahDiastol} mmHg (Hipertensi)`);
        }
        if (pem.gulaDarahSewaktu && Number(pem.gulaDarahSewaktu) >= 200) {
          issues.push(`Gula Darah: ${pem.gulaDarahSewaktu} mg/dL (Tinggi)`);
        }

        await prisma.notification.create({
          data: {
            posyanduId,
            title,
            message: `RT/RW ${pem.lansia.rtRw || '-'}. Hasil periksa: ${issues.join(' | ')}. Berikan rujukan/konsultasi.`,
            type: 'WARNING',
            category: 'lansia',
            createdAt: pem.tanggalPeriksa,
          },
        });
      }
    }

    // 3. Ensure System Connected Notification
    const sysTitle = `Terhubung ke ${posyandu.nama}`;
    const existingSys = await prisma.notification.findFirst({
      where: { posyanduId, title: sysTitle },
    });
    if (!existingSys) {
      await prisma.notification.create({
        data: {
          posyanduId,
          title: sysTitle,
          message: `Data tersinkronisasi otomatis dengan server PostgreSQL database.`,
          type: 'INFO',
          category: 'system',
        },
      });
    }

    // 4. Check Periode Pelayanan & Month Change Notification
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const currentMonthName = monthNames[currentMonth - 1];

    const activePeriode = await prisma.periodePelayanan.findFirst({
      where: { posyanduId, status: 'AKTIF' },
      orderBy: { tanggal: 'desc' },
    });

    if (!activePeriode || activePeriode.bulan !== currentMonth || activePeriode.tahun !== currentYear) {
      const monthTitle = `Pergantian Bulan: Kelola Periode ${currentMonthName} ${currentYear}`;
      const existingMonthNotif = await prisma.notification.findFirst({
        where: { posyanduId, title: monthTitle },
      });

      if (!existingMonthNotif) {
        await prisma.notification.create({
          data: {
            posyanduId,
            title: monthTitle,
            message: `Telah memasuki bulan ${currentMonthName} ${currentYear}. Harap buka atau kelola Periode Pelayanan Posyandu untuk bulan ini.`,
            type: 'WARNING',
            category: 'system',
          },
        });
      }
    }


    // 5. Otomatis hapus notifikasi yang usianya melebihi 7 hari
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    await prisma.notification.deleteMany({
      where: {
        posyanduId,
        createdAt: { lt: sevenDaysAgo },
      },
    });

    // Fetch all notifications from DB
    const dbNotifications = await prisma.notification.findMany({
      where: { posyanduId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { posyanduId, isRead: false },
    });

    const notifications: AppNotification[] = dbNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as 'DANGER' | 'WARNING' | 'SUCCESS' | 'INFO',
      createdAt: n.createdAt.toISOString(),
      isRead: n.isRead,
      category: n.category as 'balita' | 'lansia' | 'system',
    }));

    return { notifications, unreadCount };
  },

  /**
   * Create a new notification directly into DB
   */
  async createNotification(data: {
    posyanduId: string;
    title: string;
    message: string;
    type?: 'DANGER' | 'WARNING' | 'SUCCESS' | 'INFO';
    category?: 'balita' | 'lansia' | 'system';
  }) {
    return prisma.notification.create({
      data: {
        posyanduId: data.posyanduId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
        category: data.category || 'system',
      },
    });
  },

  /**
   * Delete a single notification
   */
  async deleteNotification(posyanduId: string, notificationId: string): Promise<void> {
    await prisma.notification.deleteMany({
      where: { posyanduId, id: notificationId },
    });
  },

  /**
   * Mark notifications as read in Database
   */
  async markAllAsRead(posyanduId: string, notificationIds: string[]): Promise<void> {
    if (notificationIds.length === 0) {
      await prisma.notification.updateMany({
        where: { posyanduId, isRead: false },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { posyanduId, id: { in: notificationIds } },
        data: { isRead: true },
      });
    }
  },
};
