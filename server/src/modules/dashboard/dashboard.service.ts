import prisma from '../../shared/config/prisma';

export const dashboardService = {
  /**
   * Mengambil semua metrik ringkasan untuk satu posyandu (FR-05 sd FR-09).
   */
  async getSummary(posyanduId: string) {
    const [
      totalBalita,
      totalLansia,
      pemeriksaanBalitaTerbaru,
      pemeriksaanLansiaTerbaru,
      lansiaHtDm,
    ] = await Promise.all([
      prisma.balita.count({ where: { posyanduId } }),
      prisma.lansia.count({ where: { posyanduId } }),
      prisma.pemeriksaanBalita.findMany({
        where: { balita: { posyanduId } },
        orderBy: { tanggalPeriksa: 'desc' },
        take: 10,
        include: { balita: { select: { nama: true, tanggalLahir: true } } },
      }),
      prisma.pemeriksaanLansia.findMany({
        where: { lansia: { posyanduId } },
        orderBy: { tanggalPeriksa: 'desc' },
        take: 10,
        include: { lansia: { select: { nama: true, tanggalLahir: true } } },
      }),
      prisma.lansia.findMany({
        where: { posyanduId },
        select: { riwayatHt: true, riwayatDm: true },
      }),
    ]);

    const balitasLatestExam = await prisma.$queryRaw<
      Array<{ status_bb_u: string; status_tb_u: string; status_bb_tb: string }>
    >`
      SELECT DISTINCT ON (pb.balita_id) pb.status_bb_u, pb.status_tb_u, pb.status_bb_tb
      FROM pemeriksaan_balita pb
      INNER JOIN balita b ON b.id = pb.balita_id
      WHERE b.posyandu_id = ${posyanduId}
      ORDER BY pb.balita_id, pb.tanggal_periksa DESC
    `;

    const statusGiziSummary = balitasLatestExam.reduce(
      (acc, exam) => {
        acc.bbU[exam.status_bb_u] = (acc.bbU[exam.status_bb_u] || 0) + 1;
        acc.tbU[exam.status_tb_u] = (acc.tbU[exam.status_tb_u] || 0) + 1;
        acc.bbTb[exam.status_bb_tb] = (acc.bbTb[exam.status_bb_tb] || 0) + 1;
        return acc;
      },
      { bbU: {} as Record<string, number>, tbU: {} as Record<string, number>, bbTb: {} as Record<string, number> }
    );

    const totalHt = lansiaHtDm.filter((l) => l.riwayatHt).length;
    const totalDm = lansiaHtDm.filter((l) => l.riwayatDm).length;
    const totalHtDm = lansiaHtDm.filter((l) => l.riwayatHt && l.riwayatDm).length;

    return {
      totalBalita,
      totalLansia,
      statusGizi: statusGiziSummary,
      lansiaHtDm: { totalHt, totalDm, totalHtDm },
      pemeriksaanTerbaru: {
        balita: pemeriksaanBalitaTerbaru,
        lansia: pemeriksaanLansiaTerbaru,
      },
    };
  },
};
