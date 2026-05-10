import {
  LokasiGedung,
  StatusKehadiran,
  StatusVerifikasi,
  Verifikator,
} from '@prisma/client';

import { z } from 'zod';

export const createPresensiValidation = z.object({
  pegawaiId: z.number(),

  tanggal: z.string(),

  lokasiCheckin: z.enum(LokasiGedung),

  lokasiCheckout: z.enum(LokasiGedung),

  waktuCheckin: z.string(),

  waktuCheckout: z.string(),

  statusKehadiran: z.enum(StatusKehadiran),

  statusVerifikasi: z.enum(StatusVerifikasi).optional(),

  verifikator: z.enum(Verifikator).optional(),

  keterangan: z.string().optional(),
});

export const updatePresensiValidation = createPresensiValidation.partial();
