type DecimalLike = { toString(): string } | string | null;

export interface PendidikanRow {
  jenjang: string;
  jurusan: string;
  institusi: string;
  tahunLulus: number;
}

export interface WilayahRow {
  id: number;
  kode: string;
  nama: string;
  [key: string]: unknown;
}

export interface PegawaiDetailRow {
  id: number;
  nip: string;
  nama: string;
  email: string;
  nomorHp: string;
  foto: string | null;
  alamatDetail: string;
  latitude?: DecimalLike;
  longitude?: DecimalLike;
  provinsi?: WilayahRow | null;
  kabupaten?: WilayahRow | null;
  kecamatan?: WilayahRow | null;
  kalurahan?: WilayahRow | null;
  tempatLahirProvinsi?: WilayahRow | null;
  tempatLahirKabupaten?: WilayahRow | null;
  tanggalLahir: string | Date;
  gender: string;
  statusKawin: string;
  jumlahAnak: number;
  tanggalMasuk: string | Date;
  jabatan: string;
  departemen?: string | null;
  jenisPegawai: string;
  statusAktif: string;
  pendidikan?: PendidikanRow[] | unknown | null;
  masaKerja: number;
  masaKerjaFormatted?: string;
}

function formatTanggal(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatMasaKerja(mk: number): string {
  const tahun = Math.floor(mk);
  const bulan = Math.round((mk - tahun) * 12);
  if (tahun === 0) return `${bulan} bulan`;
  if (bulan === 0) return `${tahun} tahun`;
  return `${tahun} tahun ${bulan} bulan`;
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

const GENDER_MAP: Record<string, string> = {
  PRIA: 'Pria',
  WANITA: 'Wanita',
};

const KAWIN_MAP: Record<string, string> = {
  KAWIN: 'Sudah Menikah',
  BELUM_KAWIN: 'Belum Menikah',
  CERAI: 'Cerai',
};

const JENJANG_ORDER = ['SD', 'SMP', 'SMA/SMK', 'D3', 'D4', 'S1', 'S2', 'S3'];

function sortPendidikan(list: PendidikanRow[]): PendidikanRow[] {
  return [...list].sort(
    (a, b) =>
      (JENJANG_ORDER.indexOf(a.jenjang) ?? 99) -
      (JENJANG_ORDER.indexOf(b.jenjang) ?? 99)
  );
}

function buildInfoRow(label: string, value: string): string {
  return `
    <tr>
      <td class="info-label">${label}</td>
      <td class="info-sep">:</td>
      <td class="info-value">${value}</td>
    </tr>`;
}

function buildPendidikanRows(list: PendidikanRow[]): string {
  if (!list || list.length === 0) {
    return `<tr><td colspan="4" class="empty-cell">Belum ada data pendidikan</td></tr>`;
  }
  return sortPendidikan(list)
    .map(
      (p, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="center">${p.jenjang}</td>
      <td>${p.institusi}</td>
      <td>${p.jurusan}</td>
      <td class="center">${p.tahunLulus}</td>
    </tr>`
    )
    .join('');
}

function decimalToString(val: DecimalLike): string {
  if (val == null) return '';
  return typeof val === 'string' ? val : val.toString();
}

function parsePendidikan(raw: unknown): PendidikanRow[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as PendidikanRow[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as PendidikanRow[]; } catch { return []; }
  }
  return [];
}

function buildAlamat(p: PegawaiDetailRow): string {
  const parts = [
    p.alamatDetail,
    p.kalurahan?.nama,
    p.kecamatan?.nama,
    p.kabupaten?.nama,
    p.provinsi?.nama,
  ].filter(Boolean);
  return parts.join(', ') || '-';
}

function buildTempatLahir(p: PegawaiDetailRow): string {
  const kab = p.tempatLahirKabupaten?.nama;
  const prov = p.tempatLahirProvinsi?.nama;
  if (kab && prov) return `${kab}, ${prov}`;
  return kab ?? prov ?? '-';
}

export function buildPegawaiDetailHtml(
  p: PegawaiDetailRow,
  generatedAt?: Date
): string {
  const now = generatedAt ?? new Date();
  const tanggalCetak = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const masaKerjaStr =
    p.masaKerjaFormatted ?? formatMasaKerja(p.masaKerja);

  const isAktif = p.statusAktif === 'ACTIVE';

  const avatarInitials = p.nama
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const avatarHtml = p.foto
    ? `<img src="${p.foto}" class="avatar-img" alt="Foto ${p.nama}" />`
    : `<div class="avatar-placeholder">${avatarInitials}</div>`;

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

    .profile-card {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      background: linear-gradient(135deg, #0d2a94 0%, #1e40af 100%);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 16px;
      color: #fff;
    }
    .avatar-img {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,255,255,0.4);
      flex-shrink: 0;
    }
    .avatar-placeholder {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      border: 3px solid rgba(255,255,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
      letter-spacing: 1px;
    }
    .profile-info { flex: 1; }
    .profile-nama {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.3px;
      margin-bottom: 3px;
    }
    .profile-nip {
      font-size: 9.5px;
      opacity: 0.75;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .profile-badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .pbadge {
      display: inline-block;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 8px;
      font-weight: 700;
      white-space: nowrap;
    }
    .pbadge-jabatan  { background: rgba(255,255,255,0.18); color: #fff; border: 1px solid rgba(255,255,255,0.35); }
    .pbadge-jenis    { background: #fef9c3; color: #713f12; }
    .pbadge-aktif    { background: #dcfce7; color: #14532d; }
    .pbadge-nonaktif { background: #fee2e2; color: #7f1d1d; }
    .profile-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
      flex-shrink: 0;
      text-align: right;
    }
    .stat-item { font-size: 8.5px; opacity: 0.8; }
    .stat-value {
      font-size: 13px;
      font-weight: 700;
      opacity: 1;
      display: block;
    }

    .columns {
      display: flex;
      gap: 14px;
      margin-bottom: 14px;
    }
    .col { flex: 1; }
    .col-wide { flex: 1.1; }

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
      width: 14px;
      height: 14px;
      border-radius: 3px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
    }
    .icon-blue   { background: #dbeafe; color: #1d4ed8; }
    .icon-purple { background: #ede9fe; color: #7c3aed; }
    .icon-green  { background: #dcfce7; color: #15803d; }
    .icon-amber  { background: #fef3c7; color: #b45309; }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      padding: 4px 0;
    }
    .info-table tr td { padding: 4px 12px; vertical-align: top; }
    .info-label {
      width: 38%;
      font-size: 9px;
      color: #64748b;
      white-space: nowrap;
    }
    .info-sep {
      width: 4px;
      color: #94a3b8;
      padding: 4px 4px !important;
    }
    .info-value {
      font-size: 9px;
      color: #1e293b;
      font-weight: 500;
    }

    .edu-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
    }
    .edu-table thead tr { background: #e2e8f0; }
    .edu-table thead th {
      padding: 5px 10px;
      text-align: left;
      font-size: 8px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      white-space: nowrap;
    }
    .edu-table thead th.center { text-align: center; }
    .edu-table tbody tr.row-even { background: #fff; }
    .edu-table tbody tr.row-odd  { background: #f8fafc; }
    .edu-table td {
      padding: 5px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .edu-table td.center { text-align: center; }
    .empty-cell {
      text-align: center;
      padding: 14px !important;
      color: #94a3b8;
      font-style: italic;
    }

    .full-section { margin-bottom: 14px; }

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
      <h1>Data Pegawai</h1>
      <p>Detail informasi pegawai perusahaan</p>
    </div>
    <div class="header-right">
      <div>Tanggal Cetak: <strong>${tanggalCetak}</strong></div>
      <div>NIP: <strong>${p.nip}</strong></div>
    </div>
  </div>

  <div class="profile-card">
    ${avatarHtml}
    <div class="profile-info">
      <div class="profile-nama">${p.nama}</div>
      <div class="profile-nip">NIP ${p.nip}</div>
      <div class="profile-badges">
        <span class="pbadge pbadge-jabatan">${JABATAN_MAP[p.jabatan] ?? p.jabatan}</span>
        <span class="pbadge pbadge-jabatan">${p.departemen ?? '-'}</span>
        <span class="pbadge pbadge-jenis">${JENIS_MAP[p.jenisPegawai] ?? p.jenisPegawai}</span>
        <span class="pbadge ${isAktif ? 'pbadge-aktif' : 'pbadge-nonaktif'}">
          ${isAktif ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>
    </div>
    <div class="profile-stats">
      <div class="stat-item">
        <span class="stat-value">${masaKerjaStr}</span>
        Masa Kerja
      </div>
      <div class="stat-item" style="margin-top:6px">
        <span class="stat-value">${formatTanggal(p.tanggalMasuk)}</span>
        Tanggal Masuk
      </div>
    </div>
  </div>

  <div class="columns">
    <div class="col">
      <div class="section">
        <div class="section-header">
          <span class="section-icon icon-blue">▶</span>
          Data Pribadi
        </div>
        <table class="info-table">
          ${buildInfoRow('Nama Lengkap', p.nama)}
          ${buildInfoRow('Jenis Kelamin', GENDER_MAP[p.gender] ?? p.gender)}
          ${buildInfoRow('Tempat Lahir', buildTempatLahir(p))}
          ${buildInfoRow('Tanggal Lahir', formatTanggal(p.tanggalLahir))}
          ${buildInfoRow('Status Kawin', KAWIN_MAP[p.statusKawin] ?? p.statusKawin)}
          ${buildInfoRow('Jumlah Anak', String(p.jumlahAnak ?? 0))}
          ${buildInfoRow('Email', p.email)}
          ${buildInfoRow('Nomor HP', p.nomorHp || '-')}
        </table>
      </div>
    </div>

    <div class="col">
      <div class="section">
        <div class="section-header">
          <span class="section-icon icon-purple">▶</span>
          Data Kepegawaian
        </div>
        <table class="info-table">
          ${buildInfoRow('NIP', p.nip)}
          ${buildInfoRow('Jabatan', JABATAN_MAP[p.jabatan] ?? p.jabatan)}
          ${buildInfoRow('Departemen', p.departemen ?? '-')}
          ${buildInfoRow('Jenis Pegawai', JENIS_MAP[p.jenisPegawai] ?? p.jenisPegawai)}
          ${buildInfoRow('Tanggal Masuk', formatTanggal(p.tanggalMasuk))}
          ${buildInfoRow('Masa Kerja', masaKerjaStr)}
          ${buildInfoRow('Status', isAktif ? 'Aktif' : 'Nonaktif')}
        </table>
      </div>
    </div>
  </div>

  <div class="full-section">
    <div class="section">
      <div class="section-header">
        <span class="section-icon icon-green">▶</span>
        Alamat Domisili
      </div>
      <table class="info-table">
        ${buildInfoRow('Alamat Lengkap', buildAlamat(p))}
        ${buildInfoRow('Provinsi', p.provinsi?.nama ?? '-')}
        ${buildInfoRow('Kabupaten/Kota', p.kabupaten?.nama ?? '-')}
        ${buildInfoRow('Kecamatan', p.kecamatan?.nama ?? '-')}
        ${buildInfoRow('Kelurahan', p.kalurahan?.nama ?? '-')}
        ${p.latitude && p.longitude ? buildInfoRow('Koordinat', `${decimalToString(p.latitude)}, ${decimalToString(p.longitude)}`) : ''}
      </table>
    </div>
  </div>

  <div class="full-section">
    <div class="section">
      <div class="section-header">
        <span class="section-icon icon-amber">▶</span>
        Riwayat Pendidikan
      </div>
      <table class="edu-table">
        <thead>
          <tr>
            <th class="center">Jenjang</th>
            <th>Institusi</th>
            <th>Jurusan</th>
            <th class="center">Thn Lulus</th>
          </tr>
        </thead>
        <tbody>
          ${buildPendidikanRows(parsePendidikan(p.pendidikan))}
        </tbody>
      </table>
    </div>
  </div>

  <div class="footer">
    <div>Dokumen ini digenerate secara otomatis oleh sistem.</div>
    <div>Dicetak pada: <strong>${tanggalCetak}</strong></div>
  </div>

</body>
</html>`;
}