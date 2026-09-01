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
  nik?: string;
  namaIbu?: string;
  usiaBulan?: number;
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
  riwayatHt?: boolean;
  riwayatDm?: boolean;
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
            select: { id: true, nama: true, nik: true, namaIbu: true, tanggalLahir: true, jenisKelamin: true, posyandu: { select: { nama: true } } },
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
          nik: item.balita.nik || undefined,
          namaIbu: item.balita.namaIbu || undefined,
          usiaBulan: item.usiaBulan,
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
            select: { id: true, nama: true, nik: true, tanggalLahir: true, jenisKelamin: true, riwayatHt: true, riwayatDm: true },
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
          nik: item.lansia.nik || undefined,
          riwayatHt: item.lansia.riwayatHt,
          riwayatDm: item.lansia.riwayatDm,
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

    const isBalitaOnly = filter.tipe === 'Balita';
    const isLansiaOnly = filter.tipe === 'Lansia';

    const rawDesa = (posyandu.desa || 'WATULAWANG').trim();
    const cleanDesa = rawDesa.replace(/^DESA\s+/i, '').trim();
    const desaStr = `DESA ${cleanDesa.toUpperCase()}`;

    const rawKec = (posyandu.kecamatan || 'PEJAGOAN').trim();
    const cleanKec = rawKec.replace(/^(PUSKESMAS|KECAMATAN)\s+/i, '').trim();
    const kecStr = `PUSKESMAS KECAMATAN ${cleanKec.toUpperCase()}`;

    const tahunVal = filter.tahun || new Date().getFullYear();

    // Pilih salah satu: BALITA atau LANSIA (sesuai filter, default BALITA)
    const tipeJudul = isLansiaOnly ? 'CATATAN KUNJUNGAN LANSIA' : 'CATATAN KUNJUNGAN BALITA';

    // ─────────────────────────────────────────────────────────────
    // HEADER KOP SURAT RESMI UNIFIED (Title + Metadata + Garis Ganda)
    // ─────────────────────────────────────────────────────────────
    doc.fontSize(13).font('Helvetica-Bold').text(`${tipeJudul} ${desaStr}`, { align: 'center' });
    doc.fontSize(11).font('Helvetica-Bold').text(`${kecStr} TAHUN ${tahunVal}`, { align: 'center' });
    doc.moveDown(0.3);

    // Teks Metadata Terintegrasi tanpa label 'NAMA POSYANDU :'
    const namaPosyanduUpper = posyandu.nama.toUpperCase().startsWith('POSYANDU')
      ? posyandu.nama.toUpperCase()
      : `POSYANDU ${posyandu.nama.toUpperCase()}`;

    doc.fontSize(8.5).font('Helvetica-Bold');
    doc.text(
      `${namaPosyanduUpper}   ${desaStr}   ${posyandu.alamat ? posyandu.alamat.toUpperCase() : '-'}`,
      { align: 'center' }
    );
    doc.moveDown(0.4);

    // Kop Separator Line (Garis Ganda Penutup Kop Surat)
    const lineY = doc.y;
    doc.lineWidth(1.5).moveTo(startX, lineY).lineTo(endX, lineY).stroke();
    doc.lineWidth(0.5).moveTo(startX, lineY + 2.5).lineTo(endX, lineY + 2.5).stroke();

    doc.y = lineY + 8;

    const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const filterInfoArr = [];
    if (filter.bulan) filterInfoArr.push(`Bulan: ${NAMA_BULAN[filter.bulan - 1]}`);
    if (filter.tahun) filterInfoArr.push(`Tahun: ${filter.tahun}`);
    if (filter.status && filter.status !== 'semua') filterInfoArr.push(`Status: ${filter.status === 'warning' ? 'Perlu Perhatian' : 'Normal'}`);
    if (filter.search) filterInfoArr.push(`Pencarian: "${filter.search}"`);

    const subTitleStr = filterInfoArr.length > 0
      ? `Filter Aktif: ${filterInfoArr.join(' | ')}  —  Dicetak: ${todayFormatted}`
      : `Tanggal Cetak: ${todayFormatted}`;

    doc.fontSize(8).font('Helvetica-Oblique').text(subTitleStr, { align: 'center' });
    doc.moveDown(0.5);

    // Data lists
    const balitaList = data.filter((d) => d.tipe === 'Balita');
    const lansiaList = data.filter((d) => d.tipe === 'Lansia');

    // ─────────────────────────────────────────────────────────────
    // RENDER TABEL BALITA WITH FULL CELL BORDERS (GARIS PEMBATAS)
    // ─────────────────────────────────────────────────────────────
    const renderBalitaTable = (items: ItemRiwayat[]) => {
      const cNo = startX;              // 35  (w: 20)
      const cNama = startX + 20;       // 55  (w: 80)
      const cNik = startX + 100;       // 135 (w: 70)
      const cTglLahir = startX + 170;  // 205 (w: 52)
      const cIbu = startX + 222;       // 257 (w: 75)
      const cJK = startX + 297;        // 332 (w: 18)
      const cUsia = startX + 315;      // 350 (w: 32)
      const cBB = startX + 347;        // 382 (w: 32)
      const cTB = startX + 379;        // 414 (w: 32)
      const cBbU = startX + 411;       // 446 (w: 32)
      const cTbU = startX + 443;       // 478 (w: 32)
      const cBbTb = startX + 475;      // 510 (w: 32)
      const cLK = startX + 507;        // 542 (w: 28)
      const cLiLA = startX + 535;      // 570 (w: 28)
      const cKMS = startX + 563;       // 598 (w: 30)
      const cIntervensi = startX + 593;// 628 (w: 178)

      const balitaCols = [cNama, cNik, cTglLahir, cIbu, cJK, cUsia, cBB, cTB, cBbU, cTbU, cBbTb, cLK, cLiLA, cKMS, cIntervensi];

      const drawTableHeader = (y: number) => {
        doc.rect(startX, y, printableWidth, 22).fillAndStroke('#0f766e', '#0f766e');
        doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');

        // Garis Pembatas Vertikal Header
        balitaCols.forEach(x => {
          doc.moveTo(x, y).lineTo(x, y + 22).strokeColor('#0d9488').lineWidth(0.5).stroke();
        });

        doc.text('No', cNo + 2, y + 6);
        doc.text('Nama Balita', cNama + 2, y + 6);
        doc.text('NIK', cNik + 2, y + 6);
        doc.text('Tgl Lahir', cTglLahir + 2, y + 6);
        doc.text('Nama Ibu', cIbu + 2, y + 6);
        doc.text('JK', cJK + 2, y + 6);
        doc.text('Usia', cUsia + 2, y + 6);
        doc.text('BB(kg)', cBB + 1, y + 6);
        doc.text('TB(cm)', cTB + 1, y + 6);
        doc.text('BB/U', cBbU + 2, y + 6);
        doc.text('TB/U', cTbU + 2, y + 6);
        doc.text('BB/TB', cBbTb + 1, y + 6);
        doc.text('LK', cLK + 2, y + 6);
        doc.text('LiLA', cLiLA + 1, y + 6);
        doc.text('KMS', cKMS + 2, y + 6);
        doc.text('Intervensi & Vitamin (Vit A, ASI, Obat Cacing)', cIntervensi + 2, y + 6);
        doc.fillColor('#000000');
      };

      let yPos = doc.y;
      drawTableHeader(yPos);
      yPos += 22;

      const rowHeight = 20;

      items.forEach((item, idx) => {
        if (yPos > doc.page.height - 130) {
          doc.addPage();
          yPos = 35;
          drawTableHeader(yPos);
          yPos += 22;
        }

        const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        // Outer Box Row
        doc.rect(startX, yPos, printableWidth, rowHeight).fillAndStroke(bg, '#94a3b8');

        // Garis Pembatas Vertikal Sel
        balitaCols.forEach(x => {
          doc.moveTo(x, yPos).lineTo(x, yPos + rowHeight).strokeColor('#94a3b8').lineWidth(0.5).stroke();
        });

        doc.font('Helvetica').fontSize(7.5);

        let ageMonths = item.usiaBulan;
        if (ageMonths === undefined && item.tanggalLahir) {
          const tL = new Date(item.tanggalLahir);
          const tP = new Date(item.tanggal);
          ageMonths = (tP.getFullYear() - tL.getFullYear()) * 12 + (tP.getMonth() - tL.getMonth());
          if (tP.getDate() < tL.getDate()) ageMonths--;
          if (ageMonths < 0) ageMonths = 0;
        }
        const usiaText = ageMonths !== undefined ? `${ageMonths} bln` : '-';

        const intervensiArr: string[] = [];
        if (item.vitaminA) intervensiArr.push('Vit A');
        if (item.asiEksklusif) intervensiArr.push('ASI SKS');
        if (item.obatCacing) intervensiArr.push('Obat Cacing');
        if (item.statusImunisasi) intervensiArr.push(item.statusImunisasi);
        const intervensiStr = intervensiArr.length > 0 ? intervensiArr.join(', ') : '-';

        if (item.statusType === 'warning') {
          doc.fillColor('#b91c1c');
        } else {
          doc.fillColor('#1e293b');
        }

        doc.text(String(idx + 1), cNo + 2, yPos + 5);
        doc.font('Helvetica-Bold').text((item.nama || '-').substring(0, 16), cNama + 2, yPos + 5);
        doc.font('Helvetica').text((item.nik || '-').substring(0, 16), cNik + 2, yPos + 5);
        doc.text(item.tanggalLahir ? item.tanggalLahir.substring(0, 10) : '-', cTglLahir + 2, yPos + 5);
        doc.text((item.namaIbu || '-').substring(0, 14), cIbu + 2, yPos + 5);
        doc.text(item.jenisKelamin || '-', cJK + 2, yPos + 5);
        doc.text(usiaText, cUsia + 2, yPos + 5);
        doc.text(item.beratBadan !== undefined ? String(item.beratBadan) : '-', cBB + 2, yPos + 5);
        doc.text(item.tinggiBadan !== undefined ? String(item.tinggiBadan) : '-', cTB + 2, yPos + 5);
        doc.text(item.statusBbU || '-', cBbU + 2, yPos + 5);
        doc.text(item.statusTbU || '-', cTbU + 2, yPos + 5);
        doc.text(item.statusBbTb || '-', cBbTb + 2, yPos + 5);
        doc.text(item.lingkarKepala !== undefined ? String(item.lingkarKepala) : '-', cLK + 2, yPos + 5);
        doc.text(item.lingkarLengan !== undefined ? String(item.lingkarLengan) : '-', cLiLA + 2, yPos + 5);
        doc.font('Helvetica-Bold').text(item.statusKms || '-', cKMS + 2, yPos + 5);
        doc.font('Helvetica').text(intervensiStr.substring(0, 32), cIntervensi + 2, yPos + 5);

        doc.fillColor('#000000');
        yPos += rowHeight;
      });

      doc.y = yPos;
    };

    // ─────────────────────────────────────────────────────────────
    // RENDER TABEL LANSIA WITH FULL CELL BORDERS (GARIS PEMBATAS)
    // ─────────────────────────────────────────────────────────────
    const renderLansiaTable = (items: ItemRiwayat[]) => {
      const cNo = startX;              // 35  (w: 22)
      const cNama = startX + 22;       // 57  (w: 80)
      const cTglLahir = startX + 102;  // 137 (w: 52)
      const cNik = startX + 154;       // 189 (w: 68)
      const cJK = startX + 222;        // 257 (w: 18)
      const cUsia = startX + 240;      // 275 (w: 32)
      const cDm = startX + 272;        // 307 (w: 38)
      const cHt = startX + 310;        // 345 (w: 38)
      const cTd = startX + 348;        // 383 (w: 62)
      const cGds = startX + 410;       // 445 (w: 48)
      const cFisik = startX + 458;     // 493 (w: 65)
      const cKolAu = startX + 523;     // 558 (w: 65)
      const cStatus = startX + 588;    // 623 (w: 85)
      const cPetugas = startX + 673;   // 708 (w: 63)

      const lansiaCols = [cNama, cTglLahir, cNik, cJK, cUsia, cDm, cHt, cTd, cGds, cFisik, cKolAu, cStatus, cPetugas];

      const drawTableHeader = (y: number) => {
        doc.rect(startX, y, printableWidth, 22).fillAndStroke('#0f766e', '#0f766e');
        doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');

        lansiaCols.forEach(x => {
          doc.moveTo(x, y).lineTo(x, y + 22).strokeColor('#0d9488').lineWidth(0.5).stroke();
        });

        doc.text('No', cNo + 2, y + 6);
        doc.text('Nama Lansia', cNama + 2, y + 6);
        doc.text('Tgl Lahir', cTglLahir + 2, y + 6);
        doc.text('NIK', cNik + 2, y + 6);
        doc.text('JK', cJK + 2, y + 6);
        doc.text('Usia', cUsia + 2, y + 6);
        doc.text('Riw DM', cDm + 2, y + 6);
        doc.text('Riw HT', cHt + 2, y + 6);
        doc.text('Tekanan Darah(TD)', cTd + 1, y + 6);
        doc.text('GDS(mg/dL)', cGds + 1, y + 6);
        doc.text('BB/TB/LP', cFisik + 2, y + 6);
        doc.text('Kolesterol/AU', cKolAu + 2, y + 6);
        doc.text('Kondisi / Diagnosa', cStatus + 2, y + 6);
        doc.text('Petugas', cPetugas + 2, y + 6);
        doc.fillColor('#000000');
      };

      let yPos = doc.y;
      drawTableHeader(yPos);
      yPos += 22;

      const rowHeight = 20;

      items.forEach((item, idx) => {
        if (yPos > doc.page.height - 110) {
          doc.addPage();
          yPos = 35;
          drawTableHeader(yPos);
          yPos += 22;
        }

        const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(startX, yPos, printableWidth, rowHeight).fillAndStroke(bg, '#94a3b8');

        lansiaCols.forEach(x => {
          doc.moveTo(x, yPos).lineTo(x, yPos + rowHeight).strokeColor('#94a3b8').lineWidth(0.5).stroke();
        });

        doc.font('Helvetica').fontSize(7.5);

        const usiaText = getUsiaText(item.tanggalLahir, item.tanggal, 'Lansia');
        const dmText = item.riwayatDm ? 'Ya' : 'Tdk';
        const htText = item.riwayatHt ? 'Ya' : 'Tdk';
        const tdText = item.tekananDarahSistol ? `${item.tekananDarahSistol}/${item.tekananDarahDiastol}` : '-';
        const gdsText = item.gulaDarahSewaktu !== undefined ? String(item.gulaDarahSewaktu) : '-';
        const fisikText = `${item.beratBadan ?? '-'}kg/${item.tinggiBadan ?? '-'}cm`;
        const kolAuText = `Kol:${item.kolesterol ?? '-'} | AU:${item.asamUrat ?? '-'}`;

        if (item.statusType === 'warning') {
          doc.fillColor('#b91c1c');
        } else {
          doc.fillColor('#1e293b');
        }

        doc.text(String(idx + 1), cNo + 2, yPos + 5);
        doc.font('Helvetica-Bold').text((item.nama || '-').substring(0, 16), cNama + 2, yPos + 5);
        doc.font('Helvetica').text(item.tanggalLahir ? item.tanggalLahir.substring(0, 10) : '-', cTglLahir + 2, yPos + 5);
        doc.text((item.nik || '-').substring(0, 16), cNik + 2, yPos + 5);
        doc.text(item.jenisKelamin || '-', cJK + 2, yPos + 5);
        doc.text(usiaText, cUsia + 2, yPos + 5);
        doc.text(dmText, cDm + 2, yPos + 5);
        doc.text(htText, cHt + 2, yPos + 5);
        doc.text(tdText, cTd + 2, yPos + 5);
        doc.text(gdsText, cGds + 2, yPos + 5);
        doc.text(fisikText.substring(0, 16), cFisik + 2, yPos + 5);
        doc.text(kolAuText.substring(0, 16), cKolAu + 2, yPos + 5);
        doc.font('Helvetica-Bold').text(item.status.substring(0, 18), cStatus + 2, yPos + 5);
        doc.font('Helvetica').text((item.petugas || 'Kader').substring(0, 12), cPetugas + 2, yPos + 5);

        doc.fillColor('#000000');
        yPos += rowHeight;
      });

      doc.y = yPos;
    };

    // ─────────────────────────────────────────────────────────────
    // SUMMARY BOX LENGKAP KELOMPOK UMUR (0-6, 7-12, 13-24, 25-60, 45-59, 60-69, ≥70)
    // ─────────────────────────────────────────────────────────────
    const renderSummaryBox = (allItems: ItemRiwayat[]) => {
      if (doc.y > doc.page.height - 180) {
        doc.addPage();
      }

      const yPos = doc.y + 12;

      const getAgeInfo = (item: ItemRiwayat) => {
        let m = item.usiaBulan;
        if (m === undefined && item.tanggalLahir) {
          const tL = new Date(item.tanggalLahir);
          const tP = new Date(item.tanggal);
          m = (tP.getFullYear() - tL.getFullYear()) * 12 + (tP.getMonth() - tL.getMonth());
          if (tP.getDate() < tL.getDate()) m--;
          if (m < 0) m = 0;
        }
        const months = m ?? 0;
        const years = Math.floor(months / 12);
        return { months, years };
      };

      const age0_6 = allItems.filter(i => i.tipe === 'Balita' && getAgeInfo(i).months >= 0 && getAgeInfo(i).months <= 6).length;
      const age7_12 = allItems.filter(i => i.tipe === 'Balita' && getAgeInfo(i).months >= 7 && getAgeInfo(i).months <= 12).length;
      const age13_24 = allItems.filter(i => i.tipe === 'Balita' && getAgeInfo(i).months >= 13 && getAgeInfo(i).months <= 24).length;
      const age25_60 = allItems.filter(i => i.tipe === 'Balita' && getAgeInfo(i).months >= 25 && getAgeInfo(i).months <= 60).length;

      const age45_59 = allItems.filter(i => i.tipe === 'Lansia' && getAgeInfo(i).years >= 45 && getAgeInfo(i).years <= 59).length;
      const age60_69 = allItems.filter(i => i.tipe === 'Lansia' && getAgeInfo(i).years >= 60 && getAgeInfo(i).years <= 69).length;
      const age70Plus = allItems.filter(i => i.tipe === 'Lansia' && getAgeInfo(i).years >= 70).length;

      const boxHeight = 84;
      doc.rect(startX, yPos, printableWidth, boxHeight).fillAndStroke('#f0fdf4', '#0f766e');

      doc.fillColor('#065f46').fontSize(9).font('Helvetica-Bold');
      doc.text('SUMMARY KELOMPOK UMUR & REKAPITULASI PEMERIKSAAN POSYANDU', startX + 12, yPos + 8);

      doc.fontSize(7.5).font('Helvetica').fillColor('#0f172a');

      // Kolom 1: Rentang Umur Balita (Presisi Koordinat titik dua ':')
      const col1LabelX = startX + 12;
      const col1ColonX = startX + 85;

      doc.font('Helvetica-Bold').text('Rentang Umur Balita:', col1LabelX, yPos + 22);
      doc.font('Helvetica');

      doc.text('• 0 - 6 Bulan', col1LabelX, yPos + 34);
      doc.text(`:  ${age0_6} Anak`, col1ColonX, yPos + 34);

      doc.text('• 7 - 12 Bulan', col1LabelX, yPos + 46);
      doc.text(`:  ${age7_12} Anak`, col1ColonX, yPos + 46);

      doc.text('• 13 - 24 Bulan', col1LabelX, yPos + 58);
      doc.text(`:  ${age13_24} Anak`, col1ColonX, yPos + 58);

      doc.text('• 25 - 60 Bulan', col1LabelX, yPos + 70);
      doc.text(`:  ${age25_60} Anak`, col1ColonX, yPos + 70);

      // Kolom 2: Rentang Umur Lansia (Presisi Koordinat titik dua ':')
      const col2LabelX = startX + 180;
      const col2ColonX = startX + 315;

      doc.font('Helvetica-Bold').text('Rentang Umur Lansia:', col2LabelX, yPos + 22);
      doc.font('Helvetica');

      doc.text('• 45 - 59 Tahun (Pra-Lansia)', col2LabelX, yPos + 34);
      doc.text(`:  ${age45_59} Orang`, col2ColonX, yPos + 34);

      doc.text('• 60 - 69 Tahun (Lansia)', col2LabelX, yPos + 46);
      doc.text(`:  ${age60_69} Orang`, col2ColonX, yPos + 46);

      doc.text('• ≥ 70 Tahun (Lansia Risiko)', col2LabelX, yPos + 58);
      doc.text(`:  ${age70Plus} Orang`, col2ColonX, yPos + 58);

      // Kolom 3: Ringkasan Intervensi & Kesehatan (Presisi Koordinat titik dua ':')
      const col3LabelX = startX + 440;
      const col3ColonX = startX + 575;

      const kmsN = allItems.filter(i => i.statusKms === 'N').length;
      const kmsT = allItems.filter(i => i.statusKms === 'T').length;
      const kms2T = allItems.filter(i => i.statusKms === '2T').length;
      const vitACount = allItems.filter(i => i.vitaminA).length;
      const asiCount = allItems.filter(i => i.asiEksklusif).length;
      const obatCacingCount = allItems.filter(i => i.obatCacing).length;

      const lansiaItems = allItems.filter(i => i.tipe === 'Lansia');
      const totalHt = lansiaItems.filter(i => (i.tekananDarahSistol || 0) >= 140 || (i.tekananDarahDiastol || 0) >= 90).length;
      const totalDm = lansiaItems.filter(i => (i.gulaDarahSewaktu || 0) >= 200).length;

      doc.font('Helvetica-Bold').text('Ringkasan Intervensi & Kesehatan:', col3LabelX, yPos + 22);
      doc.font('Helvetica');

      doc.text('• KMS Balita (N / T / 2T)', col3LabelX, yPos + 34);
      doc.text(`:  Naik(${kmsN}) | Tidak Naik(${kmsT}) | 2T(${kms2T})`, col3ColonX, yPos + 34);

      doc.text('• Intervensi Vit A / ASI / Cacing', col3LabelX, yPos + 46);
      doc.text(`:  Vit A(${vitACount}) | ASI SKS(${asiCount}) | Obat Cacing(${obatCacingCount})`, col3ColonX, yPos + 46);

      doc.text('• Lansia Hipertensi / Diabetes', col3LabelX, yPos + 58);
      doc.text(`:  Hipertensi(${totalHt}) | GDS >200(${totalDm})`, col3ColonX, yPos + 58);

      doc.fillColor('#000000');
      doc.y = yPos + boxHeight + 10;
    };

    // Eksekusi Render Sesuai Filter Tipe
    if (isBalitaOnly) {
      renderBalitaTable(balitaList);
      renderSummaryBox(balitaList);
    } else if (isLansiaOnly) {
      renderLansiaTable(lansiaList);
      renderSummaryBox(lansiaList);
    } else {
      if (balitaList.length > 0) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f766e').text('A. DATA PEMERIKSAAN BALITA', startX, doc.y);
        doc.fillColor('#000000');
        doc.moveDown(0.3);
        renderBalitaTable(balitaList);
      }
      if (lansiaList.length > 0) {
        if (doc.y > doc.page.height - 150) doc.addPage();
        else doc.moveDown(1);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f766e').text('B. DATA PEMERIKSAAN LANSIA', startX, doc.y);
        doc.fillColor('#000000');
        doc.moveDown(0.3);
        renderLansiaTable(lansiaList);
      }
      renderSummaryBox(data);
    }

    // Signature Block di bagian kanan bawah
    let finalY = doc.y;
    if (finalY > doc.page.height - 110) {
      doc.addPage();
      finalY = 35;
    }

    finalY += 15;
    const signX = endX - 200;

    doc.fontSize(8.5).font('Helvetica').text(`${posyandu.desa || 'Desa'}, ${todayFormatted}`, signX, finalY, { align: 'center', width: 200 });
    doc.text('Mengetahui,', signX, finalY + 11, { align: 'center', width: 200 });
    doc.font('Helvetica-Bold').text('Ketua / Kader Posyandu', signX, finalY + 22, { align: 'center', width: 200 });

    doc.font('Helvetica-Bold').text('( ............................................ )', signX, finalY + 65, { align: 'center', width: 200 });

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

