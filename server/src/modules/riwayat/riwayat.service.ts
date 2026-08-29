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

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function getUsiaText(tanggalLahir?: string, tanggalPeriksa?: string, tipe?: string): string {
  if (!tanggalLahir || !tanggalPeriksa) return '-';
  const tLahir = new Date(tanggalLahir);
  const tPeriksa = new Date(tanggalPeriksa);
  let months = (tPeriksa.getFullYear() - tLahir.getFullYear()) * 12 + (tPeriksa.getMonth() - tLahir.getMonth());
  if (tPeriksa.getDate() < tLahir.getDate()) months--;
  if (months < 0) months = 0;
  if (tipe === 'Balita') return `${months} bln`;
  const years = Math.floor(months / 12);
  return `${years} thn`;
}

function getStatusBbUText(code?: string): string {
  if (!code) return '-';
  switch (code) {
    case 'SK': return 'Sangat Kurang';
    case 'K': return 'Kurang';
    case 'N': return 'Normal';
    case 'L': return 'Lebih';
    default: return code;
  }
}

function getStatusTbUText(code?: string): string {
  if (!code) return '-';
  switch (code) {
    case 'SP': return 'Sangat Pendek';
    case 'P': return 'Pendek';
    case 'N': return 'Normal';
    case 'T': return 'Tinggi';
    default: return code;
  }
}

function getStatusBbTbText(code?: string): string {
  if (!code) return '-';
  switch (code) {
    case 'SK': return 'Sangat Kurus';
    case 'K': return 'Kurus';
    case 'N': return 'Normal';
    case 'G': return 'Gemuk';
    default: return code;
  }
}

export const riwayatService = {
  async getRiwayat(posyanduId: string, filter: FilterRiwayat): Promise<ItemRiwayat[]> {
    const { tipe = 'semua', search, status = 'semua', bulan, tahun } = filter;

    const results: ItemRiwayat[] = [];

    if (tipe === 'semua' || tipe === 'Balita') {
      const meBalita = await prisma.pemeriksaanBalita.findMany({
        where: {
          balita: {
            posyanduId,
            ...(search && { nama: { contains: search, mode: 'insensitive' } }),
          },
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

        // Pengecekan Filter Bulan & Tahun Presisi (Timezone UTC Safe)
        const itemDate = new Date(item.tanggalPeriksa);
        const itemBulan = itemDate.getUTCMonth() + 1; // 1 - 12
        const itemTahun = itemDate.getUTCFullYear();

        if (bulan && itemBulan !== bulan) continue;
        if (tahun && itemTahun !== tahun) continue;

        const isWarning = item.statusBbU === 'SK' || item.statusBbU === 'K' || item.statusTbU === 'SP' || item.statusTbU === 'P' || item.statusBbTb === 'SK' || item.statusBbTb === 'K' || item.statusBbTb === 'G';
        const statusType: 'success' | 'warning' = isWarning ? 'warning' : 'success';

        let statusDesc = `Normal (BB/U: ${getStatusBbUText(item.statusBbU)})`;
        if (item.statusBbU === 'K') statusDesc = 'BB Kurang';
        else if (item.statusBbU === 'SK') statusDesc = 'BB Sangat Kurang';
        else if (item.statusTbU === 'P') statusDesc = 'Stunting (Pendek)';
        else if (item.statusTbU === 'SP') statusDesc = 'Sangat Pendek';
        else if (item.statusBbTb === 'G') statusDesc = 'Gizi Lebih / Obesitas';

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

        // Pengecekan Filter Bulan & Tahun Presisi (Timezone UTC Safe)
        const itemDate = new Date(item.tanggalPeriksa);
        const itemBulan = itemDate.getUTCMonth() + 1; // 1 - 12
        const itemTahun = itemDate.getUTCFullYear();

        if (bulan && itemBulan !== bulan) continue;
        if (tahun && itemTahun !== tahun) continue;

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

    if (status && status !== 'semua') {
      return results.filter((r) => r.statusType === status);
    }

    return results;
  },

  async generateExcelExport(posyanduId: string, filter: FilterRiwayat): Promise<ExcelJS.Workbook> {
    const posyandu = await prisma.posyandu.findUnique({ where: { id: posyanduId } });
    if (!posyandu) {
      throw new Error('Posyandu tidak ditemukan');
    }

    // Ambil data yang sudah terfilter secara tepat
    const data = await this.getRiwayat(posyanduId, filter);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistem Informasi Posyandu';
    workbook.created = new Date();

    // Subtitle Filter untuk Excel Header
    const filterInfoArr = [];
    if (filter.tipe && filter.tipe !== 'semua') filterInfoArr.push(`Kategori: ${filter.tipe}`);
    if (filter.bulan) filterInfoArr.push(`Bulan: ${NAMA_BULAN[filter.bulan - 1]}`);
    if (filter.tahun) filterInfoArr.push(`Tahun: ${filter.tahun}`);
    if (filter.status && filter.status !== 'semua') filterInfoArr.push(`Status: ${filter.status === 'warning' ? 'Perlu Perhatian' : 'Normal'}`);
    if (filter.search) filterInfoArr.push(`Pencarian: "${filter.search}"`);
    
    const filterInfoStr = filterInfoArr.length > 0 ? ` [Filter: ${filterInfoArr.join(' | ')}]` : '';

    // Helper untuk membuat worksheet dengan format Landscape & Kolom Mandiri
    const createLandscapeWorksheet = (sheetName: string, items: ItemRiwayat[]) => {
      const sheet = workbook.addWorksheet(sheetName, {
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
      });

      // Header Judul Laporan
      sheet.mergeCells('A1:U1');
      sheet.getCell('A1').value = `LAPORAN PEMERIKSAAN POSYANDU - ${sheetName.toUpperCase()}${filterInfoStr}`;
      sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true };
      sheet.getCell('A1').alignment = { horizontal: 'center' };

      sheet.mergeCells('A2:U2');
      sheet.getCell('A2').value = `Posyandu: ${posyandu?.nama || '-'} | Desa: ${posyandu?.desa || '-'} | Kecamatan: ${posyandu?.kecamatan || '-'}`;
      sheet.getCell('A2').font = { name: 'Arial', size: 10, italic: true };
      sheet.getCell('A2').alignment = { horizontal: 'center' };

      sheet.addRow([]);

      // Tabel Kolom Mandiri (Terpisah Sesuai Parameter Fisik & Medis)
      const headerRow = sheet.addRow([
        'No',
        'Tanggal Periksa',
        'Nama Peserta',
        'Jenis Kelamin',
        'Kategori',
        'Usia',
        'BB (kg)',
        'TB (cm)',
        'LK (cm)',
        'LiLA (cm)',
        'Status BB/U',
        'Status TB/U',
        'Status BB/TB',
        'Vit A / Intervensi',
        'Tekanan Darah (mmHg)',
        'GDS (mg/dL)',
        'Kolesterol (mg/dL)',
        'Asam Urat (mg/dL)',
        'Lingkar Perut (cm)',
        'Kondisi Hasil / Diagnosa',
        'Petugas Pemeriksa'
      ]);

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '0D9488' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });

      items.forEach((item, index) => {
        const usiaText = getUsiaText(item.tanggalLahir, item.tanggal, item.tipe);
        const intervensiArr = [];
        if (item.vitaminA) intervensiArr.push('Vit A');
        if (item.asiEksklusif) intervensiArr.push('ASI Eks');
        if (item.obatCacing) intervensiArr.push('Obat Cacing');
        if (item.statusImunisasi) intervensiArr.push(`Imunisasi (${item.statusImunisasi})`);

        const row = sheet.addRow([
          index + 1,
          item.tanggal,
          item.nama,
          item.jenisKelamin || '-',
          item.tipe,
          usiaText,
          item.beratBadan ?? '-',
          item.tinggiBadan ?? '-',
          item.lingkarKepala ?? '-',
          item.lingkarLengan ?? '-',
          getStatusBbUText(item.statusBbU),
          getStatusTbUText(item.statusTbU),
          getStatusBbTbText(item.statusBbTb),
          intervensiArr.length > 0 ? intervensiArr.join(', ') : '-',
          item.tekananDarahSistol ? `${item.tekananDarahSistol}/${item.tekananDarahDiastol}` : '-',
          item.gulaDarahSewaktu ?? '-',
          item.kolesterol ?? '-',
          item.asamUrat ?? '-',
          item.lingkarPerut ?? '-',
          item.status,
          item.petugas || 'Kader Posyandu'
        ]);

        // Alignment formatting
        row.getCell(1).alignment = { horizontal: 'center' };
        row.getCell(2).alignment = { horizontal: 'center' };
        row.getCell(4).alignment = { horizontal: 'center' };
        row.getCell(5).alignment = { horizontal: 'center' };
        row.getCell(6).alignment = { horizontal: 'center' };
        row.getCell(7).alignment = { horizontal: 'right' };
        row.getCell(8).alignment = { horizontal: 'right' };
        row.getCell(9).alignment = { horizontal: 'right' };
        row.getCell(10).alignment = { horizontal: 'right' };
        row.getCell(11).alignment = { horizontal: 'center' };
        row.getCell(12).alignment = { horizontal: 'center' };
        row.getCell(13).alignment = { horizontal: 'center' };
        row.getCell(15).alignment = { horizontal: 'center' };
        row.getCell(16).alignment = { horizontal: 'right' };
        row.getCell(17).alignment = { horizontal: 'right' };
        row.getCell(18).alignment = { horizontal: 'right' };
        row.getCell(19).alignment = { horizontal: 'right' };
        row.getCell(21).alignment = { horizontal: 'left' };

        if (item.statusType === 'warning') {
          row.getCell(20).font = { color: { argb: 'DC2626' }, bold: true };
        } else {
          row.getCell(20).font = { color: { argb: '166534' } };
        }
      });

      if (sheet.columns) {
        (sheet.columns as Array<Partial<ExcelJS.Column>>).forEach((column) => {
          let maxLength = 0;
          if (column && typeof column.eachCell === 'function') {
            column.eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
              const columnLength = cell.value ? cell.value.toString().length : 10;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
          }
          column.width = Math.max(maxLength + 3, 10);
        });
      }
    };

    if (filter.tipe === 'Balita') {
      createLandscapeWorksheet('Data Balita', data);
    } else if (filter.tipe === 'Lansia') {
      createLandscapeWorksheet('Data Lansia', data);
    } else {
      createLandscapeWorksheet('Rekap Semua', data);
      const balitaData = data.filter((d) => d.tipe === 'Balita');
      if (balitaData.length > 0) {
        createLandscapeWorksheet('Data Balita', balitaData);
      }
      const lansiaData = data.filter((d) => d.tipe === 'Lansia');
      if (lansiaData.length > 0) {
        createLandscapeWorksheet('Data Lansia', lansiaData);
      }
    }

    return workbook;
  },

  async generatePdfExport(posyanduId: string, filter: FilterRiwayat): Promise<any> {
    const posyandu = await prisma.posyandu.findUnique({ where: { id: posyanduId } });
    if (!posyandu) {
      throw new Error('Posyandu tidak ditemukan');
    }

    // Ambil data yang sudah terfilter secara tepat
    const data = await this.getRiwayat(posyanduId, filter);

    // Document setup: LANDSCAPE A4 (Width: 841.89, Height: 595.28)
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 35,
      bufferPages: true
    });

    const startX = 35;
    const pageWidth = doc.page.width;
    const printableWidth = pageWidth - startX * 2; // ~771 pt
    const endX = startX + printableWidth;

    // Header Kop Resmi
    doc.fontSize(15).font('Helvetica-Bold').text('SISTEM INFORMASI POSYANDU', { align: 'center' });
    doc.fontSize(13).font('Helvetica-Bold').text(`POSYANDU ${posyandu.nama.toUpperCase()}`, { align: 'center' });
    doc.fontSize(9.5).font('Helvetica').text(`Desa/Kelurahan: ${posyandu.desa || '-'}, Kecamatan: ${posyandu.kecamatan || '-'}, Alamat: ${posyandu.alamat || '-'}`, { align: 'center' });

    // Kop Separator Line
    doc.moveDown(0.4);
    const currentY = doc.y;
    doc.lineWidth(1.5).moveTo(startX, currentY).lineTo(endX, currentY).stroke();
    doc.lineWidth(0.5).moveTo(startX, currentY + 2.5).lineTo(endX, currentY + 2.5).stroke();
    doc.moveDown(0.6);

    // Title & Filter Header Subtitle
    const titleCategory = filter.tipe && filter.tipe !== 'semua' ? filter.tipe.toUpperCase() : 'BULANAN';
    doc.fontSize(11).font('Helvetica-Bold').text(`LAPORAN REKAPITULASI PEMERIKSAAN ${titleCategory} (LANDSCAPE)`, { align: 'center' });

    const filterInfoArr = [];
    if (filter.bulan) filterInfoArr.push(`Bulan: ${NAMA_BULAN[filter.bulan - 1]}`);
    if (filter.tahun) filterInfoArr.push(`Tahun: ${filter.tahun}`);
    if (filter.status && filter.status !== 'semua') filterInfoArr.push(`Status: ${filter.status === 'warning' ? 'Perlu Perhatian' : 'Normal'}`);
    if (filter.search) filterInfoArr.push(`Pencarian: "${filter.search}"`);

    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const subTitleStr = filterInfoArr.length > 0
      ? `Filter Aktif: ${filterInfoArr.join(' | ')}  —  Dicetak: ${todayFormatted}`
      : `Tanggal Cetak: ${todayFormatted}`;

    doc.fontSize(8.5).font('Helvetica-Oblique').text(subTitleStr, { align: 'center' });
    doc.moveDown(0.6);

    // Rekapitulasi Stats Box
    const totalBalita = data.filter((d) => d.tipe === 'Balita').length;
    const totalLansia = data.filter((d) => d.tipe === 'Lansia').length;
    const totalWarning = data.filter((d) => d.statusType === 'warning').length;

    const statsY = doc.y;
    doc.rect(startX, statsY, printableWidth, 26).fillAndStroke('#f8fafc', '#cbd5e1');
    doc.fillColor('#0f172a').fontSize(8.5).font('Helvetica-Bold');
    doc.text(`Total Data: ${data.length} Orang`, startX + 15, statsY + 8);
    doc.text(`Balita: ${totalBalita} Anak`, startX + 180, statsY + 8);
    doc.text(`Lansia: ${totalLansia} Orang`, startX + 340, statsY + 8);
    doc.fillColor('#dc2626').text(`Perlu Perhatian: ${totalWarning} Kasus`, startX + 520, statsY + 8);
    doc.fillColor('#000000');

    doc.y = statsY + 34;

    // Column Layout untuk Landscape (Total ~771 pt)
    const cNo = startX;              // 35  (w: 25)
    const cTgl = startX + 25;        // 60  (w: 60)
    const cNama = startX + 85;       // 120 (w: 105)
    const cTipe = startX + 190;      // 225 (w: 45)
    const cJK = startX + 235;        // 270 (w: 25)
    const cUsia = startX + 260;      // 295 (w: 40)
    const cFisik = startX + 300;     // 335 (w: 75)
    const cDetail = startX + 375;    // 410 (w: 135)
    const cStatus = startX + 510;    // 545 (w: 155)
    const cPetugas = startX + 665;   // 700 (w: 106)

    const drawTableHeader = (y: number) => {
      doc.rect(startX, y, printableWidth, 20).fillAndStroke('#0f766e', '#0f766e');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('No', cNo + 4, y + 5);
      doc.text('Tanggal', cTgl + 2, y + 5);
      doc.text('Nama Peserta', cNama + 2, y + 5);
      doc.text('Tipe', cTipe + 2, y + 5);
      doc.text('JK', cJK + 2, y + 5);
      doc.text('Usia', cUsia + 2, y + 5);
      doc.text('BB / TB', cFisik + 2, y + 5);
      doc.text('Detail Medis (LK/LiLA/TD/GDS)', cDetail + 2, y + 5);
      doc.text('Status Gizi / Hasil Diagnosa', cStatus + 2, y + 5);
      doc.text('Petugas', cPetugas + 2, y + 5);
      doc.fillColor('#000000');
    };

    let yPosition = doc.y;
    drawTableHeader(yPosition);
    yPosition += 20;

    const rowHeight = 20;

    data.forEach((item, index) => {
      if (yPosition > doc.page.height - 85) {
        doc.addPage();
        yPosition = 35;
        drawTableHeader(yPosition);
        yPosition += 20;
      }

      if (index % 2 === 0) {
        doc.rect(startX, yPosition, printableWidth, rowHeight).fillAndStroke('#f8fafc', '#e2e8f0');
      } else {
        doc.rect(startX, yPosition, printableWidth, rowHeight).fillAndStroke('#ffffff', '#e2e8f0');
      }

      doc.font('Helvetica').fontSize(8);

      const usiaText = getUsiaText(item.tanggalLahir, item.tanggal, item.tipe);
      const bbTbStr = `${item.beratBadan ?? '-'} kg / ${item.tinggiBadan ?? '-'} cm`;

      let detailMedisStr = '-';
      if (item.tipe === 'Balita') {
        const details = [];
        if (item.lingkarKepala) details.push(`LK: ${item.lingkarKepala}cm`);
        if (item.lingkarLengan) details.push(`LiLA: ${item.lingkarLengan}cm`);
        if (item.vitaminA) details.push('Vit A');
        detailMedisStr = details.length > 0 ? details.join(', ') : 'Pemeriksaan Rutin';
      } else {
        const details = [];
        if (item.tekananDarahSistol) details.push(`TD: ${item.tekananDarahSistol}/${item.tekananDarahDiastol}`);
        if (item.gulaDarahSewaktu) details.push(`GDS: ${item.gulaDarahSewaktu}`);
        if (item.kolesterol) details.push(`Kol: ${item.kolesterol}`);
        if (item.asamUrat) details.push(`AU: ${item.asamUrat}`);
        detailMedisStr = details.length > 0 ? details.join(', ') : 'Pemeriksaan Rutin';
      }

      let statusDisplayStr = item.status;
      if (item.tipe === 'Balita' && (item.statusBbU || item.statusTbU || item.statusBbTb)) {
        statusDisplayStr = `BB/U:${getStatusBbUText(item.statusBbU)} | TB/U:${getStatusTbUText(item.statusTbU)}`;
      }

      if (item.statusType === 'warning') {
        doc.fillColor('#b91c1c');
      } else {
        doc.fillColor('#1e293b');
      }

      doc.text(String(index + 1), cNo + 4, yPosition + 5);
      doc.text(item.tanggal, cTgl + 2, yPosition + 5);
      doc.font('Helvetica-Bold').text(item.nama.substring(0, 18), cNama + 2, yPosition + 5);
      doc.font('Helvetica').text(item.tipe, cTipe + 2, yPosition + 5);
      doc.text(item.jenisKelamin || '-', cJK + 2, yPosition + 5);
      doc.text(usiaText, cUsia + 2, yPosition + 5);
      doc.text(bbTbStr, cFisik + 2, yPosition + 5);
      doc.text(detailMedisStr.substring(0, 26), cDetail + 2, yPosition + 5);
      doc.font('Helvetica-Bold').text(statusDisplayStr.substring(0, 30), cStatus + 2, yPosition + 5);
      doc.font('Helvetica').text((item.petugas || 'Kader').substring(0, 16), cPetugas + 2, yPosition + 5);

      doc.fillColor('#000000');
      yPosition += rowHeight;
    });

    // Signature Block di bagian kanan bawah
    if (yPosition > doc.page.height - 110) {
      doc.addPage();
      yPosition = 35;
    }

    yPosition += 15;
    const signX = endX - 200;

    doc.fontSize(8.5).font('Helvetica').text(`${posyandu.desa || 'Desa'}, ${todayFormatted}`, signX, yPosition, { align: 'center', width: 200 });
    doc.text('Mengetahui,', signX, yPosition + 11, { align: 'center', width: 200 });
    doc.font('Helvetica-Bold').text('Ketua / Kader Posyandu', signX, yPosition + 22, { align: 'center', width: 200 });

    doc.font('Helvetica-Bold').text('( ............................................ )', signX, yPosition + 65, { align: 'center', width: 200 });

    // Page Numbers Footer
    const pages = doc.bufferedPageRange().count;
    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica-Oblique').fillColor('#64748b').text(
        `Halaman ${i + 1} dari ${pages} — Sistem Informasi Posyandu (Format Landscape)`,
        startX,
        doc.page.height - 25,
        { align: 'center', width: printableWidth }
      );
    }

    return doc;
  },
};
