import {
  Departemen,
  GenderPegawai,
  Jabatan,
  JenisPegawai,
  StatusAktif,
  StatusKawin,
} from '@prisma/client';

export type PendidikanItem = {
  jenjang: string;
  institusi: string;
  jurusan?: string;
  tahunLulus?: number;
};

export type CreatePegawaiPayload = {
  nip: string;
  nama: string;
  email: string;
  nomorHp: string;
  foto?: string;
  provinsiId?: number;
  kabupatenId?: number;
  kecamatanId?: number;
  kalurahanId?: number;
  alamatDetail?: string;
  latitude?: number | null;
  longitude?: number | null;
  tempatLahirProvinsiId?: number | null;
  tempatLahirKabupatenId?: number | null;
  tanggalLahir: string;
  gender: GenderPegawai;
  statusKawin: StatusKawin;
  jumlahAnak?: number;
  tanggalMasuk: string;
  jabatan: Jabatan;
  departemen: Departemen;
  jenisPegawai: JenisPegawai;
  statusAktif?: StatusAktif;
  pendidikan?: PendidikanItem[];
};

export type UpdatePegawaiPayload = Partial<CreatePegawaiPayload>;

export type GetAllQuery = {
  search?: string;
  status?: StatusAktif;
  jabatan?: string;
  jenisPegawai?: string;
  masaKerjaOperator?: '>' | '=' | '<';
  masaKerjaTahun?: string;
  sortBy?: 'nip' | 'nama' | 'jabatan' | 'tanggalMasuk' | 'masaKerja';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
  noPagination?: string;
};
