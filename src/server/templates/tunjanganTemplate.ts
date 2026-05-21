export interface TunjanganDetailRow {
  id: number;
  pegawaiId: number;
  periode: string;
  jarakKm: string;
  jumlahHariMasuk: number;
  baseFare: string;
  totalTunjangan: string;
  keterangan?: string | null;
  createDate: string | Date;
  updateDate: string | Date;
  pegawai: {
    id: number;
    nip: string;
    nama: string;
    jabatan: string;
    departemen?: string | null;
    jenisPegawai: string;
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

function formatTanggal(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const JABATAN_MAP: Record<string, string> = {
  MANAGER: 'Manager',
  STAF: 'Staf',
  MAGANG: 'Magang',
  KARYAWAN: 'Karyawan',
};

const JENIS_MAP: Record<string, string> = {
  TETAP: 'Tetap',
  KONTRAK: 'Kontrak',
  MAGANG: 'Magang',
};

function buildInfoRow(label: string, value: string): string {
  return `
    <tr>
      <td class="info-label">${label}</td>
      <td class="info-sep">:</td>
      <td class="info-value">${value}</td>
    </tr>`;
}

export function buildTunjanganDetailHtml(
  t: TunjanganDetailRow,
  generatedAt?: Date
): string {
  const now = generatedAt ?? new Date();
  const tanggalCetak = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const jarakNum = parseFloat(t.jarakKm);
  const avatarInitials = t.pegawai.nama
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
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
      margin-bottom: 16px;
    }
    .header-left h1 {
      font-size: 15px;
      font-weight: 700;
      color: #0d2a94;
      letter-spacing: -0.3px;
    }
    .header-left p { font-size: 9px; color: #64748b; margin-top: 2px; }
    .header-right {
      text-align: right;
      font-size: 9px;
      color: #64748b;
      line-height: 1.6;
    }
    .header-right strong { color: #1e293b; }

    .profile-card {
      display: flex;
      gap: 16px;
      align-items: center;
      background: linear-gradient(135deg, #0d2a94 0%, #1e40af 100%);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 16px;
      color: #fff;
    }
    .avatar-placeholder {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: 3px solid rgba(255,255,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      letter-spacing: 1px;
    }
    .profile-info { flex: 1; }
    .profile-nama { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
    .profile-nip  { font-size: 9px; opacity: 0.75; font-family: 'Courier New', monospace; margin-bottom: 7px; }
    .profile-badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .pbadge {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 8px;
      font-weight: 700;
      white-space: nowrap;
    }
    .pbadge-dark  { background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.35); }
    .pbadge-jenis { background: #fef9c3; color: #713f12; }

    .total-card {
      text-align: right;
      flex-shrink: 0;
    }
    .total-label { font-size: 8.5px; opacity: 0.75; }
    .total-value { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }

    .columns {
      display: flex;
      gap: 14px;
      margin-bottom: 14px;
    }
    .col { flex: 1; }

    .section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 14px;
    }
    .section-header {
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      padding: 6px 12px;
      font-size: 8.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .section-icon {
      width: 14px; height: 14px;
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
    }
    .icon-blue   { background: #dbeafe; color: #1d4ed8; }
    .icon-green  { background: #dcfce7; color: #15803d; }
    .icon-amber  { background: #fef3c7; color: #b45309; }

    .info-table { width: 100%; border-collapse: collapse; padding: 4px 0; }
    .info-table tr td { padding: 4px 12px; vertical-align: top; }
    .info-label  { width: 40%; font-size: 9px; color: #64748b; white-space: nowrap; }
    .info-sep    { width: 4px; color: #94a3b8; padding: 4px 4px !important; }
    .info-value  { font-size: 9px; color: #1e293b; font-weight: 500; }
    .info-value.highlight {
      font-size: 11px;
      font-weight: 800;
      color: #15803d;
    }

    .keterangan-box {
      margin: 0 12px 10px;
      padding: 8px 10px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 5px;
      font-size: 9px;
      color: #0369a1;
      font-style: italic;
    }

    .footer {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
    .footer strong { color: #64748b; }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      <h1>Slip Tunjangan Transport</h1>
      <p>Detail tunjangan transportasi pegawai · ${formatPeriode(t.periode)}</p>
    </div>
    <div class="header-right">
      <div>Tanggal Cetak: <strong>${tanggalCetak}</strong></div>
      <div>ID Tunjangan: <strong>#${t.id}</strong></div>
    </div>
  </div>

  <div class="profile-card">
    <div class="avatar-placeholder">${avatarInitials}</div>
    <div class="profile-info">
      <div class="profile-nama">${t.pegawai.nama}</div>
      <div class="profile-nip">NIP ${t.pegawai.nip}</div>
      <div class="profile-badges">
        <span class="pbadge pbadge-dark">${JABATAN_MAP[t.pegawai.jabatan] ?? t.pegawai.jabatan}</span>
        <span class="pbadge pbadge-dark">${t.pegawai.departemen ?? '-'}</span>
        <span class="pbadge pbadge-jenis">${JENIS_MAP[t.pegawai.jenisPegawai] ?? t.pegawai.jenisPegawai}</span>
      </div>
    </div>
    <div class="total-card">
      <div class="total-label">Total Tunjangan</div>
      <div class="total-value">${formatRupiah(t.totalTunjangan)}</div>
      <div style="font-size:8.5px;opacity:0.7;margin-top:2px">${formatPeriode(t.periode)}</div>
    </div>
  </div>

  <div class="columns">
    <div class="col">
      <div class="section">
        <div class="section-header">
          <span class="section-icon icon-blue">▶</span>
          Informasi Pegawai
        </div>
        <table class="info-table">
          ${buildInfoRow('NIP', t.pegawai.nip)}
          ${buildInfoRow('Nama', t.pegawai.nama)}
          ${buildInfoRow('Jabatan', JABATAN_MAP[t.pegawai.jabatan] ?? t.pegawai.jabatan)}
          ${buildInfoRow('Departemen', t.pegawai.departemen ?? '-')}
          ${buildInfoRow('Jenis Pegawai', JENIS_MAP[t.pegawai.jenisPegawai] ?? t.pegawai.jenisPegawai)}
        </table>
      </div>
    </div>

    <div class="col">
      <div class="section">
        <div class="section-header">
          <span class="section-icon icon-amber">▶</span>
          Komponen Tunjangan
        </div>
        <table class="info-table">
          ${buildInfoRow('Periode', formatPeriode(t.periode))}
          ${buildInfoRow('Jarak Tempuh', `${jarakNum.toFixed(2)} km`)}
          ${buildInfoRow('Jumlah Hari Masuk', `${t.jumlahHariMasuk} hari`)}
          ${buildInfoRow('Base Fare', `${formatRupiah(t.baseFare)} / km`)}
          ${buildInfoRow('Dibuat', formatTanggal(t.createDate))}
        </table>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <span class="section-icon icon-green">▶</span>
      Ringkasan Pembayaran
    </div>
    <table class="info-table">
      ${buildInfoRow('Rumus', `Base Fare × Jarak × Hari Masuk`)}
      ${buildInfoRow('Kalkulasi', `${formatRupiah(t.baseFare)} × ${jarakNum.toFixed(2)} km × ${t.jumlahHariMasuk} hari`)}
      ${buildInfoRow('Total Tunjangan', `<span class="highlight">${formatRupiah(t.totalTunjangan)}</span>`)}
    </table>
    ${t.keterangan ? `<div class="keterangan-box">${t.keterangan}</div>` : ''}
  </div>

  <div class="footer">
    <div>Dokumen ini digenerate secara otomatis oleh sistem.</div>
    <div>Dicetak pada: <strong>${tanggalCetak}</strong></div>
  </div>

</body>
</html>`;
}