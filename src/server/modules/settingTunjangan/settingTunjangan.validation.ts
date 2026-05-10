import { StatusAktif } from '@prisma/client';
import { z } from 'zod';

export const createSettingValidation = z.object({
  baseFare: z.number().positive('Base fare harus lebih dari 0'),
  keterangan: z.string().optional(),
  statusAktif: z.enum(StatusAktif).optional(),
});

export const updateSettingValidation = createSettingValidation.partial();

export const querySettingValidation = z.object({
  status: z.enum(['ACTIVE', 'NON_ACTIVE']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  noPagination: z.string().optional(),
});
