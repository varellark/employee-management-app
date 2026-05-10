import { Role, StatusAktif } from '@prisma/client';
import { z } from 'zod';

export const createUserValidation = z.object({
  pegawaiId: z.number({
    error: 'Pegawai wajib dipilih',
  }),

  username: z
    .string()
    .min(6, 'Username minimal 6 karakter')
    .regex(
      /^[a-z0-9]+$/,
      'Username hanya boleh huruf kecil dan angka tanpa spasi'
    ),

  role: z.enum(Role),

  statusAktif: z.enum(StatusAktif).optional(),
});

export const updateUserValidation = z.object({
  username: z
    .string()
    .min(6, 'Username minimal 6 karakter')
    .regex(
      /^[a-z0-9]+$/,
      'Username hanya boleh huruf kecil dan angka tanpa spasi'
    )
    .optional(),

  role: z.enum(Role).optional(),

  statusAktif: z.enum(StatusAktif).optional(),
});

const passwordRules = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .refine((v) => !/\s/.test(v), 'Password tidak boleh mengandung spasi')
  .refine(
    (v) => /[A-Z]/.test(v),
    'Password harus mengandung minimal 1 huruf besar'
  )
  .refine(
    (v) => /[a-z]/.test(v),
    'Password harus mengandung minimal 1 huruf kecil'
  )
  .refine(
    (v) => /[^A-Za-z0-9]/.test(v),
    'Password harus mengandung minimal 1 karakter khusus'
  );

export const updateMeValidation = z.object({
  name: z
    .string({ error: 'Nama wajib diisi' })
    .min(2, 'Nama minimal 2 karakter'),

  email: z
    .string({ error: 'Email wajib diisi' })
    .email('Format email tidak valid'),

  phone: z.string().optional(),

  password: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return val;
  }, passwordRules.optional()),
});
