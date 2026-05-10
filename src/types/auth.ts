export type UserLogin = {
  id: number;
  username: string;
  role: 'SUPERADMIN' | 'MANAGER_HRD' | 'ADMIN_HRD';
  pegawaiId: number;
  pegawai: {
    id: number;
    nama: string;
    email: string;
    foto: string | null;
  };
};
