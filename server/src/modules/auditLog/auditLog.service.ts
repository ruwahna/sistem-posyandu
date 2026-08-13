import prisma from '../../shared/config/prisma';

export const auditLogService = {
  /**
   * Catat aktivitas pengguna ke database AuditLog
   */
  async createLog(data: {
    posyanduId?: string;
    kaderId?: string;
    kaderNama?: string;
    action: string;
    details?: string;
    ipAddress?: string;
  }) {
    try {
      return await prisma.auditLog.create({
        data: {
          posyanduId: data.posyanduId,
          kaderId: data.kaderId,
          kaderNama: data.kaderNama || 'Sistem',
          action: data.action,
          details: data.details,
          ipAddress: data.ipAddress || '127.0.0.1',
        },
      });
    } catch (error) {
      console.error('Gagal mencatat Audit Log:', error);
      return null;
    }
  },

  /**
   * Ambil daftar audit log posyandu
   */
  async getLogs(posyanduId?: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: posyanduId ? { posyanduId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};
