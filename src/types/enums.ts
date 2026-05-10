export enum Role {
  SUPERADMIN = "SUPERADMIN",
  MANAGER_HRD = "MANAGER_HRD",
  ADMIN_HRD = "ADMIN_HRD",
}

export enum StatusKawin {
  KAWIN = "KAWIN",
  TIDAK_KAWIN = "TIDAK_KAWIN",
}

export enum JenisPegawai {
  TETAP = "TETAP",
  KONTRAK = "KONTRAK",
  MAGANG = "MAGANG",
}

export enum Jabatan {
  MANAGER = "MANAGER",
  STAF = "STAF",
  MAGANG = "MAGANG",
  KARYAWAN = "KARYAWAN",
}

export enum Departemen {
  MARKETING = "MARKETING",
  HRD = "HRD",
  PRODUCTION = "PRODUCTION",
  EXECUTIVE = "EXECUTIVE",
  COMMISSIONER = "COMMISSIONER",
}

export enum GenderPegawai {
  PRIA = "PRIA",
  WANITA = "WANITA",
}

export enum StatusKehadiran {
  HADIR = "HADIR",
  CUTI = "CUTI",
  IZIN = "IZIN",
  UNPAID_LEAVE = "UNPAID_LEAVE",
  ALPHA = "ALPHA",
}

export enum StatusVerifikasi {
  PENDING = "PENDING",
  DISETUJUI = "DISETUJUI",
  DITOLAK = "DITOLAK",
}

export enum Verifikator {
  LEAD = "LEAD",
  MANAGER = "MANAGER",
  HRD = "HRD",
}

export enum LokasiGedung {
  GEDUNG_UTAMA = "GEDUNG_UTAMA",
  GEDUNG_A = "GEDUNG_A",
  GEDUNG_B = "GEDUNG_B",
}

export enum AksiLog {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum StatusAktif {
  ACTIVE = "ACTIVE",
  NON_ACTIVE = "NON_ACTIVE",
}