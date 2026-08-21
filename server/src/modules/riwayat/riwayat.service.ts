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
        if (!item.balita) continue;
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
          petugas: item.petugas || 'Kader Posyandu',
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
        if (!item.lansia) continue;
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
          petugas: item.petugas || 'Kader Posyandu',
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

    // Header Kop Resmi
    doc.fontSize(16).font('Helvetica-Bold').text('SISTEM INFORMASI POSYANDU', { align: 'center' });
    doc.fontSize(14).font('Helvetica-Bold').text(`POSYANDU ${posyandu.nama.toUpperCase()}`, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Desa/Kelurahan: ${posyandu.desa || '-'}, Kecamatan: ${posyandu.kecamatan || '-'}`, { align: 'center' });
    doc.fontSize(9).font('Helvetica').text(`Alamat: ${posyandu.alamat || '-'}`, { align: 'center' });

    // Draw Kop Line Separator
    doc.moveDown(0.5);
    const startX = 50;
    const endX = doc.page.width - 50;
    const currentY = doc.y;
    doc.lineWidth(2).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
    doc.lineWidth(0.5).moveTo(startX, currentY + 3).lineTo(endX, currentY + 3).stroke();
    doc.moveDown(0.8);

    // Title Laporan
    doc.fontSize(12).font('Helvetica-Bold').text('LAPORAN REKAPITULASI PEMERIKSAAN BULANAN', { align: 'center' });
    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.fontSize(9).font('Helvetica-Oblique').text(`Tanggal Cetak: ${todayFormatted}`, { align: 'center' });
    doc.moveDown(0.8);

    // Rekapitulasi Stats Box
    const totalBalita = data.filter((d) => d.tipe === 'Balita').length;
    const totalLansia = data.filter((d) => d.tipe === 'Lansia').length;
    const totalWarning = data.filter((d) => d.statusType === 'warning').length;

    const statsY = doc.y;
    doc.rect(startX, statsY, endX - startX, 32).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold');
    doc.text(`Total Data: ${data.length} Orang`, startX + 15, statsY + 11);
    doc.text(`Balita: ${totalBalita} Anak`, startX + 140, statsY + 11);
    doc.text(`Lansia: ${totalLansia} Orang`, startX + 250, statsY + 11);
    doc.fillColor('#dc2626').text(`Perlu Perhatian: ${totalWarning} Kasus`, startX + 360, statsY + 11);
    doc.fillColor('#000000');

    doc.y = statsY + 42;

    // Table Setup
    const colNo = 50;
    const colTgl = 80;
    const colNama = 150;
    const colTipe = 250;
    const colParam = 310;
    const colStatus = 440;
    const tableWidth = 512;

    const drawTableHeader = (y: number) => {
      doc.rect(colNo, y, tableWidth, 22).fillAndStroke('#0f766e', '#0f766e');
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      doc.text('No', colNo + 5, y + 6);
      doc.text('Tanggal', colTgl + 2, y + 6);
      doc.text('Nama Peserta', colNama + 2, y + 6);
      doc.text('Kategori', colTipe + 2, y + 6);
      doc.text('Parameter Fisik & Medis', colParam + 2, y + 6);
      doc.text('Kondisi Hasil', colStatus + 2, y + 6);
      doc.fillColor('#000000');
    };

    let yPosition = doc.y;
    drawTableHeader(yPosition);
    yPosition += 22;

    const rowHeight = 22;

    data.forEach((item, index) => {
      if (yPosition > doc.page.height - 140) {
        doc.addPage();
        yPosition = 50;
        drawTableHeader(yPosition);
        yPosition += 22;
      }

      if (index % 2 === 0) {
        doc.rect(colNo, yPosition, tableWidth, rowHeight).fillAndStroke('#f8fafc', '#e2e8f0');
      } else {
        doc.rect(colNo, yPosition, tableWidth, rowHeight).fillAndStroke('#ffffff', '#e2e8f0');
      }

      doc.font('Helvetica').fontSize(8.5);

      if (item.statusType === 'warning') {
        doc.fillColor('#b91c1c');
      } else {
        doc.fillColor('#1e293b');
      }

      doc.text(String(index + 1), colNo + 5, yPosition + 6);
      doc.text(item.tanggal, colTgl + 2, yPosition + 6);
      doc.font('Helvetica-Bold').text(item.nama.substring(0, 18), colNama + 2, yPosition + 6);
      doc.font('Helvetica').text(item.tipe, colTipe + 2, yPosition + 6);
      doc.text(item.parameter.substring(0, 24), colParam + 2, yPosition + 6);
      doc.text(item.status.substring(0, 18), colStatus + 2, yPosition + 6);

      doc.fillColor('#000000');
      yPosition += rowHeight;
    });

    // Signature Block
    if (yPosition > doc.page.height - 140) {
      doc.addPage();
      yPosition = 50;
    }

    yPosition += 20;
    const signX = 350;

    doc.fontSize(9).font('Helvetica').text(`${posyandu.desa || 'Desa'}, ${todayFormatted}`, signX, yPosition, { align: 'center' });
    doc.text('Mengetahui,', signX, yPosition + 12, { align: 'center' });
    doc.font('Helvetica-Bold').text('Ketua / Kader Posyandu', signX, yPosition + 24, { align: 'center' });

    doc.font('Helvetica-Bold').text('( ............................................ )', signX, yPosition + 75, { align: 'center' });

    // Page Numbers
    const pages = doc.bufferedPageRange().count;
    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica-Oblique').fillColor('#64748b').text(
        `Halaman ${i + 1} dari ${pages} — Sistem Informasi Posyandu`,
        50,
        doc.page.height - 30,
        { align: 'center' }
      );
    }

    return doc;
  },
};
