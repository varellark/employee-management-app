import ExcelJS from 'exceljs';

export async function buildPresensiTemplateBuffer(
  month: string,
  year: string
): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistem HRD';
  wb.created = new Date();

  const ws = wb.addWorksheet('Presensi', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  const periodeLabel = new Date(
    parseInt(year),
    parseInt(month) - 1
  ).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `Template Import Presensi - ${periodeLabel}`;
  titleCell.font = { bold: true, size: 13, color: { argb: 'FF0D2A94' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  ws.mergeCells('A2:L2');
  const noteCell = ws.getCell('A2');
  noteCell.value =
    'Petunjuk: Isi kolom berwarna putih. Jangan ubah header atau urutan kolom. Kolom NIP harus sesuai data pegawai.';
  noteCell.font = { italic: true, size: 9, color: { argb: 'FF64748B' } };
  noteCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 18;

  ws.addRow([]);

  const HEADERS = [
    { key: 'no', label: 'No', width: 5, locked: true },
    { key: 'nip', label: 'NIP *', width: 14, locked: true },
    { key: 'nama', label: 'Nama Pegawai', width: 24, locked: true },
    {
      key: 'tanggal',
      label: 'Tanggal * (YYYY-MM-DD)',
      width: 20,
      locked: false,
    },
    {
      key: 'statusKehadiran',
      label: 'Status Kehadiran *',
      width: 20,
      locked: false,
    },
    {
      key: 'lokasiCheckin',
      label: 'Lokasi Check-in',
      width: 18,
      locked: false,
    },
    {
      key: 'lokasiCheckout',
      label: 'Lokasi Check-out',
      width: 18,
      locked: false,
    },
    {
      key: 'waktuCheckin',
      label: 'Waktu Check-in (HH:MM)',
      width: 18,
      locked: false,
    },
    {
      key: 'waktuCheckout',
      label: 'Waktu Check-out (HH:MM)',
      width: 19,
      locked: false,
    },
    {
      key: 'statusVerifikasi',
      label: 'Status Verifikasi',
      width: 18,
      locked: false,
    },
    { key: 'verifikator', label: 'Verifikator', width: 14, locked: false },
    { key: 'keterangan', label: 'Keterangan', width: 28, locked: false },
  ];

  const headerRow = ws.getRow(4);
  HEADERS.forEach((h, i) => {
    const col = i + 1;
    const cell = headerRow.getCell(col);
    cell.value = h.label;
    cell.font = { bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: h.locked ? 'FF374151' : 'FF0D2A94' },
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };
    ws.getColumn(col).width = h.width;
  });
  headerRow.height = 32;

  const STATUS_OPTIONS = ['HADIR', 'CUTI', 'IZIN', 'UNPAID_LEAVE', 'ALPHA'];
  const LOKASI_OPTIONS = ['GEDUNG_UTAMA', 'GEDUNG_A', 'GEDUNG_B'];
  const VERIFIKASI_OPTIONS = ['PENDING', 'DISETUJUI', 'DITOLAK'];
  const VERIFIKATOR_OPTIONS = ['LEAD', 'MANAGER', 'HRD'];

  for (let i = 5; i <= 104; i++) {
    const row = ws.getRow(i);
    const isEven = (i - 5) % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      if (colNum <= 12) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colNum <= 3 ? 'FFF1F5F9' : rowBg },
        };
        cell.font = { size: 9 };
        cell.border = {
          top: { style: 'hair', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
          left: { style: 'hair', color: { argb: 'FFE2E8F0' } },
          right: { style: 'hair', color: { argb: 'FFE2E8F0' } },
        };
      }
    });

    ws.getCell(`A${i}`).value = i - 4;
    ws.getCell(`A${i}`).alignment = { horizontal: 'center' };

    ws.getCell(`E${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${STATUS_OPTIONS.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Nilai tidak valid',
      error: `Pilih salah satu: ${STATUS_OPTIONS.join(', ')}`,
    };
    ws.getCell(`F${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${LOKASI_OPTIONS.join(',')}"`],
    };
    ws.getCell(`G${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${LOKASI_OPTIONS.join(',')}"`],
    };
    ws.getCell(`J${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${VERIFIKASI_OPTIONS.join(',')}"`],
    };
    ws.getCell(`K${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${VERIFIKATOR_OPTIONS.join(',')}"`],
    };
  }

  const wsRef = wb.addWorksheet('Referensi');
  wsRef.mergeCells('A1:B1');
  wsRef.getCell('A1').value = 'Nilai yang diperbolehkan';
  wsRef.getCell('A1').font = {
    bold: true,
    size: 11,
    color: { argb: 'FF0D2A94' },
  };
  wsRef.getRow(1).height = 22;

  const refs = [
    ['Status Kehadiran', STATUS_OPTIONS.join(', ')],
    ['Lokasi Gedung', LOKASI_OPTIONS.join(', ')],
    ['Status Verifikasi', VERIFIKASI_OPTIONS.join(', ')],
    ['Verifikator', VERIFIKATOR_OPTIONS.join(', ')],
    ['Format Tanggal', 'YYYY-MM-DD  contoh: 2026-05-01'],
    ['Format Waktu', 'HH:MM  contoh: 08:00'],
  ];

  refs.forEach(([label, value], idx) => {
    const row = wsRef.getRow(idx + 2);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true, size: 9 };
    row.getCell(2).value = value;
    row.getCell(2).font = { size: 9, color: { argb: 'FF374151' } };
    row.height = 16;
  });
  wsRef.getColumn(1).width = 22;
  wsRef.getColumn(2).width = 55;

  return wb.xlsx.writeBuffer();
}

export interface PresensiImportRow {
  rowNum: number;
  nip: string;
  tanggal: string;
  statusKehadiran: string;
  lokasiCheckin?: string;
  lokasiCheckout?: string;
  waktuCheckin?: string;
  waktuCheckout?: string;
  statusVerifikasi?: string;
  verifikator?: string;
  keterangan?: string;
}

export interface ImportParseResult {
  valid: PresensiImportRow[];
  errors: { row: number; message: string }[];
}

const VALID_STATUS = ['HADIR', 'CUTI', 'IZIN', 'UNPAID_LEAVE', 'ALPHA'];
const VALID_LOKASI = ['GEDUNG_UTAMA', 'GEDUNG_A', 'GEDUNG_B'];
const VALID_VERIF = ['PENDING', 'DISETUJUI', 'DITOLAK'];
const VALID_VERIF2 = ['LEAD', 'MANAGER', 'HRD'];

function cellStr(cell: ExcelJS.Cell): string {
  const v = cell.value;
  if (v === null || v === undefined) return '';

  if (typeof v === 'object' && 'richText' in v) {
    return (v as ExcelJS.CellRichTextValue).richText
      .map((r) => r.text)
      .join('');
  }

  if (typeof v === 'object' && 'hyperlink' in v) {
    return String((v as ExcelJS.CellHyperlinkValue).text ?? '');
  }

  return String(v).trim();
}

export async function parsePresensiImport(
  buffer: ArrayBuffer
): Promise<ImportParseResult> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.getWorksheet('Presensi') ?? wb.worksheets[0];
  if (!ws) throw new Error('Sheet "Presensi" tidak ditemukan');

  const valid: PresensiImportRow[] = [];
  const errors: { row: number; message: string }[] = [];

  ws.eachRow((row, rowNum) => {
    if (rowNum < 5) return;

    const nip = cellStr(row.getCell(2));
    const tanggal = cellStr(row.getCell(4));
    const statusKehadiran = cellStr(row.getCell(5)).toUpperCase();
    const lokasiCheckin = cellStr(row.getCell(6)).toUpperCase() || undefined;
    const lokasiCheckout = cellStr(row.getCell(7)).toUpperCase() || undefined;
    const waktuCheckin = cellStr(row.getCell(8)) || undefined;
    const waktuCheckout = cellStr(row.getCell(9)) || undefined;
    const statusVerifikasi =
      cellStr(row.getCell(10)).toUpperCase() || undefined;
    const verifikator = cellStr(row.getCell(11)).toUpperCase() || undefined;
    const keterangan = cellStr(row.getCell(12)) || undefined;

    if (!nip && !tanggal && !statusKehadiran) return;

    const rowErrors: string[] = [];

    if (!nip) rowErrors.push('NIP wajib diisi');
    if (!tanggal) rowErrors.push('Tanggal wajib diisi');
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal))
      rowErrors.push('Format tanggal harus YYYY-MM-DD');

    if (!statusKehadiran) rowErrors.push('Status kehadiran wajib diisi');
    else if (!VALID_STATUS.includes(statusKehadiran))
      rowErrors.push(`Status kehadiran tidak valid: ${statusKehadiran}`);

    if (lokasiCheckin && !VALID_LOKASI.includes(lokasiCheckin))
      rowErrors.push(`Lokasi check-in tidak valid: ${lokasiCheckin}`);
    if (lokasiCheckout && !VALID_LOKASI.includes(lokasiCheckout))
      rowErrors.push(`Lokasi check-out tidak valid: ${lokasiCheckout}`);

    if (waktuCheckin && !/^\d{2}:\d{2}$/.test(waktuCheckin))
      rowErrors.push('Format waktu check-in harus HH:MM');
    if (waktuCheckout && !/^\d{2}:\d{2}$/.test(waktuCheckout))
      rowErrors.push('Format waktu check-out harus HH:MM');

    if (statusVerifikasi && !VALID_VERIF.includes(statusVerifikasi))
      rowErrors.push(`Status verifikasi tidak valid: ${statusVerifikasi}`);
    if (verifikator && !VALID_VERIF2.includes(verifikator))
      rowErrors.push(`Verifikator tidak valid: ${verifikator}`);

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join('; ') });
      return;
    }

    valid.push({
      rowNum,
      nip,
      tanggal,
      statusKehadiran,
      lokasiCheckin,
      lokasiCheckout,
      waktuCheckin,
      waktuCheckout,
      statusVerifikasi,
      verifikator,
      keterangan,
    });
  });

  return { valid, errors };
}
