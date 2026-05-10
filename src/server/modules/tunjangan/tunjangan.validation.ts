import { z } from 'zod';

const periodeRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const queryTunjanganValidation = z.object({
  search: z.string().optional(),
  periode: z
    .string()
    .regex(periodeRegex, 'Format periode harus YYYY-MM')
    .optional(),
  pegawaiId: z.string().optional(),
  sortBy: z
    .enum(['periode', 'totalTunjangan', 'pegawai', 'jumlahHariMasuk'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  noPagination: z.string().optional(),
});

export const hitungTunjanganValidation = z.object({
  pegawaiId: z.number().int().positive(),
  jarakKm: z
    .number()
    .min(5, 'Jarak minimal 5 km')
    .max(25, 'Jarak maksimal 25 km'),
  jumlahHariMasuk: z.number().int().min(0),
});

export const generateTunjanganValidation = z.object({
  periode: z.string().regex(periodeRegex, 'Format periode harus YYYY-MM'),
  data: z
    .array(
      z.object({
        pegawaiId: z.number().int().positive(),
        jarakKm: z.number().min(5).max(25),
        jumlahHariMasuk: z.number().int().min(0),
        keterangan: z.string().optional(),
      })
    )
    .min(1, 'Data tidak boleh kosong'),
});
