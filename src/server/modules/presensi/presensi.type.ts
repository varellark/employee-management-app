import {
  LokasiGedung,
  StatusKehadiran,
  StatusVerifikasi,
  Verifikator,
} from '@prisma/client';

export type GetAllPayload = {
  search?: string;
  month?: string;
  year?: string;
  statusKehadiran?: StatusKehadiran;
  page?: string;
  limit?: string;
  noPagination?: string;
};

export type CreatePayload = {
  pegawaiId: number;
  tanggal: string;
  lokasiCheckin: LokasiGedung;
  lokasiCheckout: LokasiGedung;
  waktuCheckin: string;
  waktuCheckout: string;
  statusKehadiran: StatusKehadiran;
  statusVerifikasi?: StatusVerifikasi;
  verifikator?: Verifikator;
  keterangan?: string;
};
