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

const readNotificationsMap = new Map<string, Set<string>>();

export const notificationService = {
  async getNotifications(posyanduId: string): Promise<{
    notifications: AppNotification[];
    unreadCount: number;
  }> {
    const notifications: AppNotification[] = [];

    const posyandu = await prisma.posyandu.findUnique({
      where: { id: posyanduId },
      select: { nama: true },
    });

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

    alertBalita.forEach((pem) => {
      let issues: string[] = [];
      if (pem.statusBbU === 'SK' || pem.statusBbU === 'K') {
        issues.push(`BB/U: ${pem.statusBbU === 'SK' ? 'Sangat Kurang' : 'Kurang'}`);
      }
      if (pem.statusTbU === 'SP' || pem.statusTbU === 'P') {
        issues.push(`TB/U: ${pem.statusTbU === 'SP' ? 'Sangat Pendek (Stunting)' : 'Pendek'}`);
      }
      if (pem.statusBbTb === 'SK' || pem.statusBbTb === 'G') {
        issues.push(`BB/TB: ${pem.statusBbTb === 'SK' ? 'Gizi Severely Wasted' : 'Gizi Kurang'}`);
      }

      const id = `balita-alert-${pem.id}`;
      notifications.push({
        id,
        title: `Peringatan Gizi: ${pem.balita.nama}`,
        message: `Usia ${pem.usiaBulan} bln (Ibu ${pem.balita.namaIbu}). Status: ${issues.join(', ')}. Butuh perhatian gizi.`,
        type: 'DANGER',
        createdAt: pem.tanggalPeriksa.toISOString(),
        isRead: false,
        category: 'balita',
      });
    });

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

    alertLansia.forEach((pem) => {
      let issues: string[] = [];
      if (pem.tekananDarahSistol >= 140) {
        issues.push(`TD: ${pem.tekananDarahSistol}/${pem.tekananDarahDiastol} mmHg (Hipertensi)`);
      }
      if (Number(pem.gulaDarahSewaktu) >= 200) {
        issues.push(`Gula Darah: ${pem.gulaDarahSewaktu} mg/dL (Tinggi)`);
      }

      const id = `lansia-alert-${pem.id}`;
      notifications.push({
        id,
        title: `Peringatan Kesehatan: ${pem.lansia.nama}`,
        message: `RT/RW ${pem.lansia.rtRw}. Hasil periksa: ${issues.join(' | ')}. Berikan rujukan/konsultasi.`,
        type: 'WARNING',
        createdAt: pem.tanggalPeriksa.toISOString(),
        isRead: false,
        category: 'lansia',
      });
    });

    const recentBalitaCheck = await prisma.pemeriksaanBalita.findMany({
      where: { balita: { posyanduId } },
      take: 2,
      orderBy: { createdAt: 'desc' },
      include: { balita: { select: { nama: true } } },
    });

    recentBalitaCheck.forEach((pem) => {
      const id = `balita-recent-${pem.id}`;
      if (!notifications.some((n) => n.id === id || n.id === `balita-alert-${pem.id}`)) {
        notifications.push({
          id,
          title: `Pemeriksaan Balita Dicatat`,
          message: `Pemeriksaan ${pem.balita.nama} (Usia ${pem.usiaBulan} bln) berhasil dicatat ke database.`,
          type: 'SUCCESS',
          createdAt: pem.createdAt.toISOString(),
          isRead: false,
          category: 'balita',
        });
      }
    });

    notifications.push({
      id: `demo-balita-${posyanduId}`,
      title: `Peringatan Gizi Balita: Anisa Rahma`,
      message: `Usia 18 bln (Ibu Siti). Status BB/U: Sangat Kurang. Klik untuk membuka modul Balita.`,
      type: 'DANGER',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      category: 'balita',
    });

    notifications.push({
      id: `demo-lansia-${posyanduId}`,
      title: `Perhatian Kesehatan Lansia: Pak Ahmad`,
      message: `Tekanan Darah: 155/95 mmHg (Hipertensi). Klik untuk membuka modul Lansia.`,
      type: 'WARNING',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isRead: false,
      category: 'lansia',
    });

    notifications.push({
      id: `sys-conn-${posyanduId}`,
      title: `Terhubung ke ${posyandu?.nama || 'Posyandu'}`,
      message: `Data tersinkronisasi otomatis dengan server PostgreSQL.`,
      type: 'INFO',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false,
      category: 'system',
    });

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const readSet = readNotificationsMap.get(posyanduId) || new Set<string>();
    let unreadCount = 0;

    notifications.forEach((n) => {
      if (readSet.has(n.id)) {
        n.isRead = true;
      } else {
        unreadCount++;
      }
    });

    return { notifications, unreadCount };
  },

  async markAllAsRead(posyanduId: string, notificationIds: string[]): Promise<void> {
    if (!readNotificationsMap.has(posyanduId)) {
      readNotificationsMap.set(posyanduId, new Set<string>());
    }
    const readSet = readNotificationsMap.get(posyanduId)!;
    notificationIds.forEach((id) => readSet.add(id));
  },
};
