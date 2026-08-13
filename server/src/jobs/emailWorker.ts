import prisma from '../shared/config/prisma';
import { sendPosyanduReminderEmail } from '../shared/config/email';

export async function runEmailWorkerNow() {
  console.log('🔄 [Email Worker] Menjalankan pengecekan background job email reminder...');
  try {
    const posyandus = await prisma.posyandu.findMany({
      include: {
        kaders: {
          where: { isActive: true },
          select: { email: true, nama: true },
        },
      },
    });

    let emailsSent = 0;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tanggalStr = `${nextWeek.getDate()} ${nextWeek.toLocaleString('id-ID', { month: 'long' })} ${nextWeek.getFullYear()}`;

    for (const posyandu of posyandus) {
      for (const kader of posyandu.kaders) {
        const success = await sendPosyanduReminderEmail({
          to: kader.email,
          namaKader: kader.nama,
          namaPosyandu: posyandu.nama,
          tanggalJadwal: tanggalStr,
          lokasi: `Balai Posyandu ${posyandu.nama}, Desa ${posyandu.desa}, Kec. ${posyandu.kecamatan}`,
          pesanKhusus: 'Pengingat otomatis jadwal pelayanan rutin bulanan balita dan lansia.',
        });
        if (success) emailsSent++;
      }
    }

    console.log(`✅ [Email Worker] Berhasil memproses ${emailsSent} email pengingat Posyandu.`);
    return { success: true, count: emailsSent };
  } catch (error) {
    console.error('❌ [Email Worker] Error saat menjalankan job email:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Inisialisasi background cron/worker otomatis (setiap 12 jam)
 */
export function initEmailWorker() {
  console.log('⚡ [Email Worker Service] Worker pengiriman email otomatis diaktifkan.');
  
  // Jalankan interval 12 jam (12 * 60 * 60 * 1000 ms)
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  setInterval(() => {
    runEmailWorkerNow();
  }, TWELVE_HOURS);
}
