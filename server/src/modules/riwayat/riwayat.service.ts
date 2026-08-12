import prisma from '../../shared/config/prisma';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export interface FilterRiwayat {
  tipe?: 'semua' | 'Balita' | 'Lansia';
  search?: string;
  status?: 'semua' | 'success' | 'warning';
  bulan?: number;
  tahun?: number;
}

export interface ItemRiwayat {
  id: string;
  pasienId?: string;
  nama: string;
  tipe: 'Balita' | 'Lansia';
  tanggal: string;
  petugas: string;
  parameter: string;
  status: string;
  statusType: 'success' | 'warning' | 'info';
  tanggalLahir?: string;
  jenisKelamin?: string;
  beratBadan?: number;
  tinggiBadan?: number;
  lingkarKepala?: number;
  lingkarLengan?: number;
  statusBbU?: string;
  statusTbU?: string;
  statusBbTb?: string;
  statusKms?: string;
  vitaminA?: boolean;
  asiEksklusif?: boolean;
  obatCacing?: boolean;
  statusImunisasi?: string;
  tekananDarahSistol?: number;
  tekananDarahDiastol?: number;
  gulaDarahSewaktu?: number;
  kolesterol?: number;
  asamUrat?: number;
  lingkarPerut?: number;
  keluhan?: string;
  tindakan?: string;
}

export const riwayatService = {
  async getRiwayat(posyanduId: string, filter: FilterRiwayat): Promise<ItemRiwayat[]> {
    const { tipe = 'semua', search, status = 'semua', bulan, tahun } = filter;

    const results: ItemRiwayat[] = [];

    let dateFilter: { gte?: Date; lte?: Date } | undefined = undefined;
    if (tahun) {
      const startBulan = bulan ? bulan - 1 : 0;
      const endBulan = bulan ? bulan : 12;
      const startDate = new Date(tahun, startBulan, 1);
      const endDate = new Date(tahun, endBulan, 0, 23, 59, 59);
      dateFilter = { gte: startDate, lte: endDate };
    }

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
            select: { id: true, nama: true, tanggalLahir: true, jenisKelamin: true, posyandu: { select: { nama: true } } },
          },
        },
        orderBy: { tanggalPeriksa: 'desc' },
      });

      for (const item of meBalita) {
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
          pasienId: item.balitaId,
          nama: item.balita.nama,
          tipe: 'Balita',
          tanggal: item.tanggalPeriksa.toISOString().split('T')[0],
          petugas: 'Kader Posyandu',
          parameter: paramStr,
          status: statusDesc,
          statusType,
          tanggalLahir: item.balita.tanggalLahir ? item.balita.tanggalLahir.toISOString().split('T')[0] : undefined,
          jenisKelamin: item.balita.jenisKelamin,
          beratBadan: Number(item.beratBadan),
          tinggiBadan: Number(item.tinggiBadan),
          lingkarKepala: item.lingkarKepala ? Number(item.lingkarKepala) : undefined,
          lingkarLengan: item.lingkarLengan ? Number(item.lingkarLengan) : undefined,
          statusBbU: item.statusBbU,
          statusTbU: item.statusTbU,
          statusBbTb: item.statusBbTb,
          statusKms: item.statusKms || undefined,
          vitaminA: item.vitaminA,
          asiEksklusif: item.asiEksklusif || undefined,
          obatCacing: item.obatCacing || undefined,
          statusImunisasi: item.statusImunisasi || undefined,
        });
      }
    }

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
            select: { id: true, nama: true, tanggalLahir: true, jenisKelamin: true },
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
          pasienId: item.lansiaId,
          nama: item.lansia.nama,
          tipe: 'Lansia',
          tanggal: item.tanggalPeriksa.toISOString().split('T')[0],
          petugas: 'Kader Posyandu',
          parameter: paramStr,
          status: statusDesc,
          statusType,
          tanggalLahir: item.lansia.tanggalLahir ? item.lansia.tanggalLahir.toISOString().split('T')[0] : undefined,
          jenisKelamin: item.lansia.jenisKelamin,
          beratBadan: Number(item.beratBadan),
          tinggiBadan: Number(item.tinggiBadan),
          tekananDarahSistol: item.tekananDarahSistol,
          tekananDarahDiastol: item.tekananDarahDiastol,
          gulaDarahSewaktu: Number(item.gulaDarahSewaktu),
          kolesterol: item.kolesterol ? Number(item.kolesterol) : undefined,
          asamUrat: item.asamUrat ? Number(item.asamUrat) : undefined,
          lingkarPerut: Number(item.lingkarPerut),
          keluhan: item.keluhan || undefined,
          tindakan: item.tindakan || undefined,
        });
      }
    }

    results.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    if (status !== 'semua') {
      return results.filter((r) => r.statusType === status);
    }

    return results;
  },

  async generateExcelExport(posyanduId: string, filter: FilterRiwayat): Promise<ExcelJS.Workbook> {
    const posyandu = await prisma.posyandu.findUnique({ where: { id: posyanduId } });
    if (!posyandu) {
      throw new Error('Posyandu tidak ditemukan');
    }

    const data = await this.getRiwayat(posyanduId, filter);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistem Posyandu';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Riwayat Pemeriksaan');

    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = `LAPORAN RIWAYAT PEMERIKSAAN BULANAN POSYANDU`;
    worksheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Posyandu: ${posyandu?.nama || '-'}, Desa: ${posyandu?.desa || '-'}, Kecamatan: ${posyandu?.kecamatan || '-'}`;
    worksheet.getCell('A2').font = { name: 'Arial', size: 10, italic: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

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
        fgColor: { argb: '0D9488' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

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
      
      if (item.statusType === 'warning') {
        row.getCell(6).font = { color: { argb: 'DC2626' }, bold: true };
      } else {
        row.getCell(6).font = { color: { argb: '166534' } };
      }
    });

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

  async generatePdfExport(posyanduId: string, filter: FilterRiwayat): Promise<any> {
    const posyandu = await prisma.posyandu.findUnique({ where: { id: posyanduId } });
    if (!posyandu) {
      throw new Error('Posyandu tidak ditemukan');
    }

    const data = await this.getRiwayat(posyanduId, filter);

    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    doc.fontSize(18).font('Helvetica-Bold').text('LAPORAN RIWAYAT PEMERIKSAAN BULANAN', { align: 'center' });
    doc.fontSize(18).font('Helvetica-Bold').text('POSYANDU', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica').text(`Posyandu: ${posyandu?.nama || '-'}`, { align: 'center' });
    doc.fontSize(11).font('Helvetica').text(`Desa: ${posyandu?.desa || '-'}, Kecamatan: ${posyandu?.kecamatan || '-'}`, { align: 'center' });
    doc.fontSize(11).font('Helvetica').text(`Alamat: ${posyandu?.alamat || '-'}`, { align: 'center' });
    doc.fontSize(10).font('Helvetica-Oblique').text(`Tanggal Cetak: ${new Date().toISOString().split('T')[0]}`, { align: 'center' });
    doc.moveDown(1);

    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 100;
    const col3 = 180;
    const col4 = 250;
    const col5 = 320;
    const col6 = 450;

    const drawTableHeader = (y: number) => {
      doc.rect(col1 - 5, y, 455, 25).stroke();
      
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('No', col1, y + 7);
      doc.text('Tanggal', col2, y + 7);
      doc.text('Nama', col3, y + 7);
      doc.text('Kategori', col4, y + 7);
      doc.text('Parameter', col5, y + 7);
      doc.text('Status', col6, y + 7);
    };

    drawTableHeader(tableTop);
    doc.moveDown(1.5);

    let yPosition = doc.y;
    const rowHeight = 18;

    data.forEach((item, index) => {
      if (yPosition > doc.page.height - 80) {
        doc.addPage();
        yPosition = 50;
        drawTableHeader(yPosition);
        yPosition += 30;
      }

      doc.fontSize(9).font('Helvetica');
      
      if (index % 2 === 0) {
        doc.rect(col1 - 5, yPosition, 455, rowHeight).fillAndStroke('f3f4f6', 'e5e7eb');
      } else {
        doc.rect(col1 - 5, yPosition, 455, rowHeight).stroke();
      }

      doc.font('Helvetica').fontSize(9);

      if (item.statusType === 'warning') {
        doc.fillColor('#dc2626');
      } else {
        doc.fillColor('#000000');
      }

      doc.text(String(index + 1), col1, yPosition + 3);
      doc.text(item.tanggal, col2, yPosition + 3);
      doc.text(item.nama, col3, yPosition + 3);
      doc.text(item.tipe, col4, yPosition + 3);
      doc.text(item.parameter.substring(0, 30), col5, yPosition + 3);
      doc.text(item.status.substring(0, 25), col6, yPosition + 3);

      doc.fillColor('#000000');
      yPosition += rowHeight;
    });

    doc.moveDown(2);
    doc.fontSize(9).font('Helvetica').text(`Total Pemeriksaan: ${data.length} data`, { align: 'right' });
    doc.fontSize(8).font('Helvetica-Oblique').text('Dokumen ini dibuat otomatis oleh Sistem Informasi Posyandu', { align: 'center' });

    const pages = doc.bufferedPageRange().count;
    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(`Halaman ${i + 1} dari ${pages}`, 50, doc.page.height - 30, { align: 'center' });
    }

    return doc;
  },
};
