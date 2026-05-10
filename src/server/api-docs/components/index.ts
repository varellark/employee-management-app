export const components = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Masukkan JWT token yang didapat dari endpoint /auth/verify-otp',
    },
  },

  parameters: {
    id: {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'integer' },
      description: 'ID resource',
    },
    page: {
      name: 'page',
      in: 'query',
      schema: { type: 'string', default: '1' },
      description: 'Nomor halaman',
    },
    limit: {
      name: 'limit',
      in: 'query',
      schema: { type: 'string', default: '10' },
      description: 'Jumlah data per halaman',
    },
    noPagination: {
      name: 'noPagination',
      in: 'query',
      schema: { type: 'string', enum: ['true', 'false'], default: 'false' },
      description: 'Jika true, ambil semua data tanpa pagination',
    },
  },

  schemas: {
    // ─── Enums ────────────────────────────────────────────────────────────────
    Role: {
      type: 'string',
      enum: ['SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD'],
      description: 'Role pengguna dalam sistem',
    },
    StatusAktif: {
      type: 'string',
      enum: ['ACTIVE', 'NON_ACTIVE'],
      description: 'Status aktif',
    },
    Jabatan: {
      type: 'string',
      enum: ['KEPALA_DINAS', 'SEKRETARIS', 'KABID', 'KASI', 'STAF'],
      description: 'Jabatan pegawai',
    },
    JenisPegawai: {
      type: 'string',
      enum: ['PNS', 'PPPK', 'HONORER'],
      description: 'Jenis kepegawaian',
    },
    GenderPegawai: {
      type: 'string',
      enum: ['LAKI_LAKI', 'PEREMPUAN'],
    },
    StatusKawin: {
      type: 'string',
      enum: ['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI'],
    },
    StatusKehadiran: {
      type: 'string',
      enum: ['HADIR', 'IZIN', 'SAKIT', 'ALPHA', 'CUTI'],
    },
    StatusVerifikasi: {
      type: 'string',
      enum: ['PENDING', 'DISETUJUI', 'DITOLAK'],
    },
    Verifikator: {
      type: 'string',
      enum: ['ADMIN_HRD', 'MANAGER_HRD'],
    },
    LokasiGedung: {
      type: 'string',
      enum: ['GEDUNG_A', 'GEDUNG_B', 'GEDUNG_C', 'LUAR_GEDUNG'],
      description: 'Lokasi gedung saat check-in/checkout',
    },
    Departemen: {
      type: 'string',
      enum: ['UMUM', 'KEUANGAN', 'KEPEGAWAIAN', 'PERENCANAAN', 'TEKNIS'],
    },

    // ─── Common Responses ─────────────────────────────────────────────────────
    SuccessResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Berhasil' },
        data: { type: 'object' },
      },
    },
    PaginatedResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Berhasil' },
        data: { type: 'array', items: {} },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 100 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 10 },
          },
        },
      },
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Terjadi kesalahan' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },

    // ─── User ─────────────────────────────────────────────────────────────────
    User: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        username: { type: 'string', example: 'johndoe01' },
        role: { $ref: '#/components/schemas/Role' },
        statusAktif: { $ref: '#/components/schemas/StatusAktif' },
        pegawai: { $ref: '#/components/schemas/Pegawai' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },

    // ─── Pegawai ──────────────────────────────────────────────────────────────
    Pegawai: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        nip: { type: 'string', example: '199001012020011001' },
        nama: { type: 'string', example: 'John Doe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        nomorHp: { type: 'string', example: '+6281234567890' },
        foto: { type: 'string', nullable: true },
        jabatan: { $ref: '#/components/schemas/Jabatan' },
        departemen: { $ref: '#/components/schemas/Departemen' },
        jenisPegawai: { $ref: '#/components/schemas/JenisPegawai' },
        statusAktif: { $ref: '#/components/schemas/StatusAktif' },
        gender: { $ref: '#/components/schemas/GenderPegawai' },
        statusKawin: { $ref: '#/components/schemas/StatusKawin' },
        jumlahAnak: { type: 'integer', example: 2 },
        tanggalLahir: { type: 'string', example: '01/01/1990' },
        tanggalMasuk: { type: 'string', example: '01/01/2020' },
        latitude: { type: 'number', nullable: true, example: -7.797068 },
        longitude: { type: 'number', nullable: true, example: 110.370529 },
        pendidikan: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              jenjang: { type: 'string', example: 'S1' },
              institusi: { type: 'string', example: 'Universitas Gadjah Mada' },
              jurusan: { type: 'string', example: 'Teknik Informatika' },
              tahunLulus: { type: 'integer', example: 2015 },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },

    CreatePegawaiRequest: {
      type: 'object',
      required: [
        'nip',
        'nama',
        'email',
        'nomorHp',
        'tanggalLahir',
        'gender',
        'statusKawin',
        'jumlahAnak',
        'tanggalMasuk',
        'jabatan',
        'departemen',
        'jenisPegawai',
      ],
      properties: {
        nip: {
          type: 'string',
          minLength: 8,
          pattern: '^\\d+$',
          example: '199001012020011001',
        },
        nama: { type: 'string', minLength: 2, example: 'John Doe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        nomorHp: { type: 'string', example: '+6281234567890' },
        foto: { type: 'string', nullable: true },
        provinsiId: { type: 'integer', nullable: true },
        kabupatenId: { type: 'integer', nullable: true },
        kecamatanId: { type: 'integer', nullable: true },
        kalurahanId: { type: 'integer', nullable: true },
        alamatDetail: { type: 'string', example: 'Jl. Contoh No. 1' },
        latitude: { type: 'number', minimum: -90, maximum: 90, nullable: true },
        longitude: {
          type: 'number',
          minimum: -180,
          maximum: 180,
          nullable: true,
        },
        tempatLahirProvinsiId: { type: 'integer', nullable: true },
        tempatLahirKabupatenId: { type: 'integer', nullable: true },
        tanggalLahir: {
          type: 'string',
          pattern: '^\\d{2}/\\d{2}/\\d{4}$',
          example: '01/01/1990',
        },
        gender: { $ref: '#/components/schemas/GenderPegawai' },
        statusKawin: { $ref: '#/components/schemas/StatusKawin' },
        jumlahAnak: { type: 'integer', minimum: 0, maximum: 99, example: 2 },
        tanggalMasuk: {
          type: 'string',
          pattern: '^\\d{2}/\\d{2}/\\d{4}$',
          example: '01/01/2020',
        },
        jabatan: { $ref: '#/components/schemas/Jabatan' },
        departemen: { $ref: '#/components/schemas/Departemen' },
        jenisPegawai: { $ref: '#/components/schemas/JenisPegawai' },
        statusAktif: { $ref: '#/components/schemas/StatusAktif' },
        pendidikan: {
          type: 'array',
          items: {
            type: 'object',
            required: ['jenjang', 'institusi'],
            properties: {
              jenjang: { type: 'string', example: 'S1' },
              institusi: { type: 'string', example: 'Universitas Gadjah Mada' },
              jurusan: { type: 'string', example: 'Teknik Informatika' },
              tahunLulus: { type: 'integer', example: 2015 },
            },
          },
        },
      },
    },

    UpdatePegawaiRequest: {
      description:
        'Semua field bersifat opsional (partial update dari CreatePegawaiRequest)',
      allOf: [{ $ref: '#/components/schemas/CreatePegawaiRequest' }],
    },

    // ─── Presensi ─────────────────────────────────────────────────────────────
    Presensi: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        pegawaiId: { type: 'integer', example: 1 },
        tanggal: { type: 'string', format: 'date', example: '2025-05-10' },
        lokasiCheckin: { $ref: '#/components/schemas/LokasiGedung' },
        lokasiCheckout: { $ref: '#/components/schemas/LokasiGedung' },
        waktuCheckin: { type: 'string', example: '08:00' },
        waktuCheckout: { type: 'string', example: '16:00' },
        statusKehadiran: { $ref: '#/components/schemas/StatusKehadiran' },
        statusVerifikasi: { $ref: '#/components/schemas/StatusVerifikasi' },
        verifikator: { $ref: '#/components/schemas/Verifikator' },
        keterangan: { type: 'string', nullable: true },
        pegawai: { $ref: '#/components/schemas/Pegawai' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },

    CreatePresensiRequest: {
      type: 'object',
      required: [
        'pegawaiId',
        'tanggal',
        'lokasiCheckin',
        'lokasiCheckout',
        'waktuCheckin',
        'waktuCheckout',
        'statusKehadiran',
      ],
      properties: {
        pegawaiId: { type: 'integer', example: 1 },
        tanggal: { type: 'string', format: 'date', example: '2025-05-10' },
        lokasiCheckin: { $ref: '#/components/schemas/LokasiGedung' },
        lokasiCheckout: { $ref: '#/components/schemas/LokasiGedung' },
        waktuCheckin: { type: 'string', example: '08:00' },
        waktuCheckout: { type: 'string', example: '16:00' },
        statusKehadiran: { $ref: '#/components/schemas/StatusKehadiran' },
        statusVerifikasi: { $ref: '#/components/schemas/StatusVerifikasi' },
        verifikator: { $ref: '#/components/schemas/Verifikator' },
        keterangan: { type: 'string', example: 'Keterangan opsional' },
      },
    },

    UpdatePresensiRequest: {
      description:
        'Semua field bersifat opsional (partial update dari CreatePresensiRequest)',
      allOf: [{ $ref: '#/components/schemas/CreatePresensiRequest' }],
    },

    // ─── Tunjangan ────────────────────────────────────────────────────────────
    Tunjangan: {
      type: 'object',
      properties: {
        id: { type: 'integer', example: 1 },
        periode: { type: 'string', example: '2025-05' },
        pegawaiId: { type: 'integer', example: 1 },
        jarakKm: { type: 'number', example: 12.5 },
        jumlahHariMasuk: { type: 'integer', example: 22 },
        totalTunjangan: { type: 'number', example: 1375000 },
        keterangan: { type: 'string', nullable: true },
        pegawai: { $ref: '#/components/schemas/Pegawai' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  },

  responses: {
    BadRequest: {
      description: 'Validasi gagal atau request tidak valid',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: {
            success: false,
            message: 'Validasi gagal',
            errors: [{ field: 'nip', message: 'NIP minimal 8 karakter' }],
          },
        },
      },
    },
    Unauthorized: {
      description: 'Token tidak ada atau tidak valid',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: { success: false, message: 'Unauthorized' },
        },
      },
    },
    Forbidden: {
      description: 'Tidak memiliki akses ke resource ini',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: { success: false, message: 'Forbidden: Akses ditolak' },
        },
      },
    },
    NotFound: {
      description: 'Resource tidak ditemukan',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
          example: { success: false, message: 'Data tidak ditemukan' },
        },
      },
    },
  },
};
