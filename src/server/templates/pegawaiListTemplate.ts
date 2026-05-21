export interface PegawaiRow {
  nip: string;
  nama: string;
  email: string;
  jabatan: string;
  departemen?: string;
  jenisPegawai: string;
  tanggalMasuk: string | Date;
  masaKerja: number;
  statusAktif: string;
}

function formatMasaKerja(mk: number): string {
  const tahun = Math.floor(mk);
  const bulan = Math.round((mk - tahun) * 12);
  if (tahun === 0) return `${bulan} bln`;
  if (bulan === 0) return `${tahun} thn`;
  return `${tahun} thn ${bulan} bln`;
}

function formatTanggal(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

function labelJenis(jenis: string): string {
  const map: Record<string, string> = {
    TETAP: 'Tetap',
    KONTRAK: 'Kontrak',
    MAGANG: 'Magang',
  };
  return map[jenis] ?? jenis;
}

export function buildPegawaiListHtml(
  data: PegawaiRow[],
  generatedAt?: Date
): string {
  const now = generatedAt ?? new Date();
  const tanggalCetak = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const rows = data
    .map(
      (p, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="center">${i + 1}</td>
      <td class="mono">${p.nip}</td>
      <td>
        <div class="nama">${p.nama}</div>
        <div class="sub">${p.email}</div>
      </td>
      <td>
        <span class="badge badge-jabatan">${labelJabatan(p.jabatan)}</span>
      </td>
      <td>${p.departemen ?? '-'}</td>
      <td>
        <span class="badge badge-jenis">${labelJenis(p.jenisPegawai)}</span>
      </td>
      <td class="center">${formatTanggal(p.tanggalMasuk)}</td>
      <td class="center">${formatMasaKerja(p.masaKerja)}</td>
      <td class="center">
        <span class="badge ${p.statusAktif === 'ACTIVE' ? 'badge-aktif' : 'badge-nonaktif'}">
          ${p.statusAktif === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
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
    .header-right strong {
      color: #1e293b;
    }

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
      font-size: 14px;
      font-weight: 700;
      color: #0d2a94;
      margin-top: 1px;
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
    td.mono   { font-family: 'Courier New', monospace; letter-spacing: 0.5px; }

    .nama { font-weight: 600; color: #1e293b; }
    .sub  { font-size: 8.5px; color: #94a3b8; margin-top: 1px; }

    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 8px;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge-jabatan  { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .badge-jenis    { background: #fefce8; color: #854d0e; border: 1px solid #fef08a; }
    .badge-aktif    { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .badge-nonaktif { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

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
      <h1>Daftar Pegawai</h1>
      <p>Laporan data seluruh pegawai perusahaan</p>
    </div>
    <div class="header-right">
      <div>Tanggal Cetak: <strong>${tanggalCetak}</strong></div>
      <div>Total Data: <strong>${data.length} pegawai</strong></div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Total Pegawai</div>
      <div class="value">${data.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Aktif</div>
      <div class="value">${data.filter((p) => p.statusAktif === 'ACTIVE').length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Nonaktif</div>
      <div class="value">${data.filter((p) => p.statusAktif !== 'ACTIVE').length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Pegawai Tetap</div>
      <div class="value">${data.filter((p) => p.jenisPegawai === 'TETAP').length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Kontrak</div>
      <div class="value">${data.filter((p) => p.jenisPegawai === 'KONTRAK').length}</div>
    </div>
    <div class="summary-card">
      <div class="label">Magang</div>
      <div class="value">${data.filter((p) => p.jenisPegawai === 'MAGANG').length}</div>
    </div>
  </div>

  ${
    data.length === 0
      ? `<div class="empty">📭 Tidak ada data pegawai yang ditemukan.</div>`
      : `
  <table>
    <thead>
      <tr>
        <th class="center">#</th>
        <th>NIP</th>
        <th>Nama</th>
        <th>Jabatan</th>
        <th>Departemen</th>
        <th>Jenis</th>
        <th class="center">Tgl Masuk</th>
        <th class="center">Masa Kerja</th>
        <th class="center">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>`
  }

  <div class="footer">
    <div>Dokumen ini digenerate secara otomatis oleh sistem.</div>
    <div>Dicetak pada: <strong>${tanggalCetak}</strong></div>
  </div>

</body>
</html>`;
}