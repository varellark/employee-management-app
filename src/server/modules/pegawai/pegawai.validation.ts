import {
  Departemen,
  GenderPegawai,
  Jabatan,
  JenisPegawai,
  StatusAktif,
  StatusKawin,
} from '@prisma/client';
import { z } from 'zod';

const pendidikanItemSchema = z.object({
  jenjang: z.string().min(1, 'Jenjang pendidikan wajib diisi'),
  institusi: z.string().min(1, 'Nama institusi wajib diisi'),
  jurusan: z.string().optional(),
  tahunLulus: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === '' || val === undefined || val === null) {
        return undefined;
      }

      return Number(val);
    })
    .refine(
      (val) =>
        val === undefined ||
        (Number.isInteger(val) &&
          val >= 1900 &&
          val <= new Date().getFullYear()),
      {
        message: 'Tahun lulus tidak valid',
      }
    ),
});

export const createPegawaiValidation = z.object({
  nip: z
    .string()
    .min(8, 'NIP minimal 8 karakter')
    .regex(/^\d+$/, 'NIP hanya boleh berisi angka'),

  nama: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .regex(
      /^[a-zA-Z0-9\s']+$/,
      "Nama hanya boleh huruf, angka, spasi, dan tanda petik (')"
    ),

  email: z.string().email('Format email tidak valid'),

  nomorHp: z
    .string()
    .regex(
      /^\+\d{7,15}$/,
      'Nomor HP harus menggunakan format internasional, contoh: +6282218458888'
    ),

  foto: z.string().optional(),

  provinsiId: z.number().int().optional(),
  kabupatenId: z.number().int().optional(),
  kecamatanId: z.number().int().optional(),
  kalurahanId: z.number().int().optional(),
  alamatDetail: z.string().optional(),

  latitude: z
    .number()
    .min(-90, 'Latitude tidak valid')
    .max(90, 'Latitude tidak valid')
    .optional()
    .nullable(),

  longitude: z
    .number()
    .min(-180, 'Longitude tidak valid')
    .max(180, 'Longitude tidak valid')
    .optional()
    .nullable(),

  tempatLahirProvinsiId: z.number().int().optional().nullable(),
  tempatLahirKabupatenId: z.number().int().optional().nullable(),

  tanggalLahir: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format tanggal lahir harus DD/MM/YYYY'),

  gender: z.enum(GenderPegawai),

  statusKawin: z.enum(StatusKawin),

  jumlahAnak: z
    .number()
    .int()
    .min(0, 'Jumlah anak tidak valid')
    .max(99, 'Jumlah anak maksimal 2 digit'),

  tanggalMasuk: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format tanggal masuk harus DD/MM/YYYY'),

  jabatan: z.enum(Jabatan),

  departemen: z.enum(Departemen),

  jenisPegawai: z.enum(JenisPegawai),

  statusAktif: z.enum(StatusAktif).optional(),

  pendidikan: z.array(pendidikanItemSchema).optional(),
});

export const updatePegawaiValidation = createPegawaiValidation.partial();

export const queryPegawaiValidation = z.object({
  search: z.string().optional(),
  status: z.enum(StatusAktif).optional(),
  jabatan: z.string().optional(),
  jenisPegawai: z.string().optional(),
  masaKerjaOperator: z.enum(['>', '=', '<']).optional(),
  masaKerjaTahun: z.string().optional(),
  sortBy: z
    .enum(['nip', 'nama', 'jabatan', 'tanggalMasuk', 'masaKerja'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  noPagination: z.string().optional(),
  ids: z.string().optional(),
});
