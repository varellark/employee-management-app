export interface DashboardSuperadmin {
  welcome: string;
}

export interface DashboardAdminHRD {
  welcome: string;
}

export interface PegawaiTerbaru {
  id: number;
  nip: string;
  nama: string;
  jabatan: string;
  jenisPegawai: string;
  tanggalMasuk: Date;
  foto: string | null;
}

export interface PegawaiTerdekat {
  id: number;
  nip: string;
  nama: string;
  jabatan: string;
  latitude: number | null;
  longitude: number | null;
  alamatDetail: string | null;
  jarakKm: number;
}

export interface DomisiliArea {
  id: number;
  nip: string;
  nama: string;
  latitude: number | null;
  longitude: number | null;
  alamatDetail: string | null;
  kabupaten: string | null;
  provinsi: string | null;
}

export interface DashboardManagerHRD {
  widgets: {
    totalPegawai: number;
    totalPegawaiKontrak: number;
    totalPegawaiTetap: number;
    totalMagang: number;
  };
  chartJenisPegawai: {
    kontrak: number;
    tetap: number;
    magang: number;
  };
  chartGender: {
    pria: number;
    wanita: number;
  };
  pegawaiTerbaru: PegawaiTerbaru[];
  pegawaiTerdekat: PegawaiTerdekat | null;
  domisiliArea: DomisiliArea[];
}
