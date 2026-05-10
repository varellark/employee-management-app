export type GetAllTunjanganQuery = {
  search?: string;
  periode?: string;
  pegawaiId?: string;
  sortBy?: 'periode' | 'totalTunjangan' | 'pegawai' | 'jumlahHariMasuk';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
  noPagination?: string;
};

export type GenerateTunjanganPayload = {
  periode: string;
  data: {
    pegawaiId: number;
    jarakKm: number;
    jumlahHariMasuk: number;
    keterangan?: string;
  }[];
};
