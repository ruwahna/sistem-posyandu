import prisma from '../lib/prisma';
import ExcelJS from 'exceljs';

export interface FilterRiwayat {
  tipe?: 'semua' | 'Balita' | 'Lansia';
  search?: string;
  status?: 'semua' | 'success' | 'warning';
  bulan?: number;
  tahun?: number;
}

export interface ItemRiwayat {
  id: string;
  nama: string;
  tipe: 'Balita' | 'Lansia';
  tanggal: string;
  petugas: string;
  parameter: string;
  status: string;
  statusType: 'success' | 'warning' | 'info';
}

export const riwayatService = {
  async getRiwayat(posyanduId: string, filter: FilterRiwayat): Promise<ItemRiwayat[]> {
    const { tipe = 'semua', search, status = 'semua', bulan, tahun } = filter;

    const results: ItemRiwayat[] = [];

    // Filter tanggal jika ada bulan & tahun
    let dateFilter: { gte?: Date; lte?: Date } | undefined = undefined;
    if (tahun) {
      const startBulan = bulan ? bulan - 1 : 0;
      const endBulan = bulan ? bulan : 12;
      const startDate = new Date(tahun, startBulan, 1);
      const endDate = new Date(tahun, endBulan, 0, 23, 59, 59);
      dateFilter = { gte: startDate, lte: endDate };
    }

    // 1. Ambil data pemeriksaan Balita
    if (tipe === 'semua' || tipe === 'Balita') {
      const meBalita = await prisma.pemeriksaanBalita.findMany({
        where: {
          balita: {
            posyanduId,
            ...(search && { nama: { contains: search, mode: 'insensitive' } }),
          },
          ...(dateFilter && { tanggalPeriksa: dateFilter }),
        },
        include: {
          balita: {
            select: { nama: true, posyandu: { select: { nama: true } } },
          },
        },
        orderBy: { tanggalPeriksa: 'desc' },
      });

      for (const item of meBalita) {
        // Tentukan status & statusType balita
        // statusBbU: SK (Sangat Kurang), K (Kurang), N (Normal), L (Lebih)
        const isWarning = item.statusBbU === 'SK' || item.statusBbU === 'K' || item.statusTbU === 'SP' || item.statusTbU === 'P' || item.statusBbTb === 'SK' || item.statusBbTb === 'K' || item.statusBbTb === 'G';
        const statusType: 'success' | 'warning' = isWarning ? 'warning' : 'success';

        let statusDesc = `Normal (BB/U: ${item.statusBbU})`;
        if (item.statusBbU === 'K') statusDesc = 'BB Kurang';
        else if (item.statusBbU === 'SK') statusDesc = 'BB Sangat Kurang';
        else if (item.statusTbU === 'P') statusDesc = 'Stunting (Pendek)';
        else if (item.statusTbU === 'SP') statusDesc = 'Sangat Pendek';
        else if (item.statusBbTb === 'G') statusDesc = 'Gizi Buruk / Obesitas';

        const paramStr = `BB: ${item.beratBadan}kg, TB: ${item.tinggiBadan}cm${item.lingkarKepala ? `, LK: ${item.lingkarKepala}cm` : ''}${item.vitaminA ? ', Vit A' : ''}`;

        results.push({
          id: item.id,
          nama: item.balita.nama,
          tipe: 'Balita',
          tanggal: item.tanggalPeriksa.toISOString().split('T')[0],
          petugas: 'Kader Posyandu',
          parameter: paramStr,
          status: statusDesc,
          statusType,
        });
      }
    }

    // 2. Ambil data pemeriksaan Lansia
    if (tipe === 'semua' || tipe === 'Lansia') {
      const meLansia = await prisma.pemeriksaanLansia.findMany({
        where: {
          lansia: {
            posyanduId,
            ...(search && { nama: { contains: search, mode: 'insensitive' } }),
          },
          ...(dateFilter && { tanggalPeriksa: dateFilter }),
        },
        include: {
          lansia: {
            select: { nama: true },
          },
        },
        orderBy: { tanggalPeriksa: 'desc' },
      });

      for (const item of meLansia) {
        const isHipertensi = item.tekananDarahSistol >= 140 || item.tekananDarahDiastol >= 90;
        const isGdsTinggi = Number(item.gulaDarahSewaktu) >= 200;
        const isWarning = isHipertensi || isGdsTinggi;
        const statusType: 'success' | 'warning' = isWarning ? 'warning' : 'success';

        let statusDesc = 'Sehat & Normal';
        if (isHipertensi && isGdsTinggi) statusDesc = 'Hipertensi & GDS Tinggi';
        else if (isHipertensi) statusDesc = 'Hipertensi';
        else if (isGdsTinggi) statusDesc = 'GDS Tinggi';

        const paramStr = `BB: ${item.beratBadan}kg, TB: ${item.tinggiBadan}cm, TD: ${item.tekananDarahSistol}/${item.tekananDarahDiastol} mmHg, GDS: ${item.gulaDarahSewaktu}`;

        results.push({
          id: item.id,
          nama: item.lansia.nama,
          tipe: 'Lansia',
          tanggal: item.tanggalPeriksa.toISOString().split('T')[0],
          petugas: 'Kader Posyandu',
          parameter: paramStr,
          status: statusDesc,
          statusType,
        });
      }
    }

    // Sort gabungan berdasarkan tanggal periksa descending
    results.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    // Filter status jika ada
    if (status !== 'semua') {
      return results.filter((r) => r.statusType === status);
    }

    return results;
  },

  async generateExcelExport(posyanduId: string, filter: FilterRiwayat): Promise<ExcelJS.Workbook> {
    const data = await this.getRiwayat(posyanduId, filter);
    const posyandu = await prisma.posyandu.findUnique({ where: { id: posyanduId } });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistem Posyandu';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Riwayat Pemeriksaan');

    // Title Block
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = `LAPORAN RIWAYAT PEMERIKSAAN BULANAN POSYANDU`;
    worksheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Posyandu: ${posyandu?.nama || '-'}, Desa: ${posyandu?.desa || '-'}, Kecamatan: ${posyandu?.kecamatan || '-'}`;
    worksheet.getCell('A2').font = { name: 'Arial', size: 10, italic: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.addRow([]); // Blank row

    // Table Headers
    const headerRow = worksheet.addRow([
      'No',
      'Tanggal Periksa',
      'Nama Warga',
      'Kategori',
      'Parameter Fisik & Medis',
      'Kondisi Status / Diagnosa',
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0D9488' }, // Teal 600
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Add Data
    data.forEach((item, index) => {
      const row = worksheet.addRow([
        index + 1,
        item.tanggal,
        item.nama,
        item.tipe,
        item.parameter,
        item.status,
      ]);

      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'center' };
      
      // Highlight warning status
      if (item.statusType === 'warning') {
        row.getCell(6).font = { color: { argb: 'DC2626' }, bold: true };
      } else {
        row.getCell(6).font = { color: { argb: '166534' } };
      }
    });

    // Auto-fit column widths
    if (worksheet.columns) {
      (worksheet.columns as Array<Partial<ExcelJS.Column>>).forEach((column) => {
        let maxLength = 0;
        if (column && typeof column.eachCell === 'function') {
          column.eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
        }
        column.width = Math.max(maxLength + 3, 12);
      });
    }

    return workbook;
  },
};
