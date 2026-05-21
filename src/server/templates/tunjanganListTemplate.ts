export interface TunjanganRow {
  id: number;
  pegawaiId: number;
  periode: string;
  jarakKm: string;
  jumlahHariMasuk: number;
  baseFare: string;
  totalTunjangan: string;
  keterangan?: string;
  pegawai: {
    id: number;
    nip: string;
    nama: string;
    jabatan: string;
    departemen?: string;
  };
}

function formatRupiah(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

function formatPeriode(periode: string): string {
  const [year, month] = periode.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

function labelJabatan(jabatan: string): string {
  const map: Record<string, string> = {
    MANAGER: 'Manager',
    STAF: 'Staf',
    MAGANG: 'Magang',
    KARYAWAN: 'Karyawan',
  };
  return map[jabatan] ?? jabatan;
}

export function buildTunjanganListHtml(
  data: TunjanganRow[],
  generatedAt?: Date
): string {
  const now = generatedAt ?? new Date();
  const tanggalCetak = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const totalTunjangan = data.reduce(
    (sum, t) => sum + parseFloat(t.totalTunjangan),
    0
  );

  const periodeSet = new Set(data.map((t) => t.periode));
  const periodeList = [...periodeSet].sort().reverse();
  const periodeRange =
    periodeList.length > 1
      ? `${formatPeriode(periodeList[periodeList.length - 1])} – ${formatPeriode(periodeList[0])}`
      : periodeList.length === 1
        ? formatPeriode(periodeList[0])
        : '-';

  const rows = data
    .map(
      (t, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="center">${i + 1}</td>
      <td class="mono">${t.pegawai.nip}</td>
      <td>
        <div class="nama">${t.pegawai.nama}</div>
        <div class="sub">${labelJabatan(t.pegawai.jabatan)} · ${t.pegawai.departemen ?? '-'}</div>
      </td>
      <td class="center">${formatPeriode(t.periode)}</td>
      <td class="center">${parseFloat(t.jarakKm).toFixed(2)} km</td>
      <td class="center">${t.jumlahHariMasuk} hari</td>
      <td class="center">${formatRupiah(t.baseFare)}/km</td>
      <td class="right bold">${formatRupiah(t.totalTunjangan)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 10px;
      color: #1e293b;
      background: #fff;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;
      border-bottom: 2.5px solid #0d2a94;
      margin-bottom: 14px;
    }
    .header-left h1 {
      font-size: 15px;
      font-weight: 700;
      color: #0d2a94;
      letter-spacing: -0.3px;
    }
    .header-left p {
      font-size: 9px;
      color: #64748b;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
      font-size: 9px;
      color: #64748b;
      line-height: 1.6;
    }
    .header-right strong { color: #1e293b; }

    .summary {
      display: flex;
      gap: 10px;
      margin-bottom: 14px;
    }
    .summary-card {
      flex: 1;
      background: #f0f4ff;
      border: 1px solid #c7d2fe;
      border-radius: 6px;
      padding: 7px 10px;
    }
    .summary-card .label {
      font-size: 8.5px;
      color: #6366f1;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .summary-card .value {
      font-size: 13px;
      font-weight: 700;
      color: #0d2a94;
      margin-top: 1px;
    }
    .summary-card .value.small {
      font-size: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
    }
    thead tr {
      background: #0d2a94;
      color: #fff;
    }
    thead th {
      padding: 7px 9px;
      font-weight: 600;
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      white-space: nowrap;
    }
    thead th.center { text-align: center; }
    thead th.right  { text-align: right; }

    tbody tr.row-even { background: #fff; }
    tbody tr.row-odd  { background: #f8fafc; }
    tbody tr:hover    { background: #eff6ff; }

    td {
      padding: 6px 9px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
      white-space: nowrap;
    }
    td.center { text-align: center; }
    td.right  { text-align: right; }
    td.mono   { font-family: 'Courier New', monospace; letter-spacing: 0.5px; }
    td.bold   { font-weight: 700; }

    .nama { font-weight: 600; color: #1e293b; }
    .sub  { font-size: 8.5px; color: #94a3b8; margin-top: 1px; }

    tfoot tr {
      background: #f0f4ff;
      border-top: 2px solid #0d2a94;
    }
    tfoot td {
      padding: 7px 9px;
      font-weight: 700;
      font-size: 9.5px;
      border-bottom: none;
    }

    .footer {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8.5px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
    .footer strong { color: #64748b; }

    .empty {
      text-align: center;
      padding: 30px;
      color: #94a3b8;
      font-size: 11px;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      <h1>Laporan Tunjangan Transport</h1>
      <p>Rekap data tunjangan transportasi pegawai · ${periodeRange}</p>
    </div>
    <div class="header-right">
      <div>Tanggal Cetak: <strong>${tanggalCetak}</strong></div>
      <div>Total Data: <strong>${data.length} record</strong></div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Total Record</div>
      <div class="value">${data.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Periode</div>
      <div class="value small">${periodeRange}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Tunjangan</div>
      <div class="value small">${formatRupiah(totalTunjangan)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Rata-rata / Record</div>
      <div class="value small">${data.length > 0 ? formatRupiah(totalTunjangan / data.length) : 'Rp 0'}</div>
    </div>
  </div>

  ${
    data.length === 0
      ? `<div class="empty">📭 Tidak ada data tunjangan yang ditemukan.</div>`
      : `
  <table>
    <thead>
      <tr>
        <th class="center">#</th>
        <th>NIP</th>
        <th>Pegawai</th>
        <th class="center">Periode</th>
        <th class="center">Jarak</th>
        <th class="center">Hari Masuk</th>
        <th class="center">Base Fare</th>
        <th class="right">Total Tunjangan</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="7" class="right">Grand Total</td>
        <td class="right">${formatRupiah(totalTunjangan)}</td>
      </tr>
    </tfoot>
  </table>`
  }

  <div class="footer">
    <div>Dokumen ini digenerate secara otomatis oleh sistem.</div>
    <div>Dicetak pada: <strong>${tanggalCetak}</strong></div>
  </div>

</body>
</html>`;
}