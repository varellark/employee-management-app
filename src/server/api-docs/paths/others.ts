export const settingTunjanganPaths = {
  '/setting-tunjangan': {
    get: {
      tags: ['Setting Tunjangan'],
      summary: 'Get semua setting tunjangan',
      description: 'Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          schema: { type: 'string', enum: ['ACTIVE', 'NON_ACTIVE'] },
          description: 'Filter berdasarkan status setting',
        },
        { $ref: '#/components/parameters/page' },
        { $ref: '#/components/parameters/limit' },
        { $ref: '#/components/parameters/noPagination' },
      ],
      responses: {
        '200': { description: 'Daftar setting tunjangan berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
    post: {
      tags: ['Setting Tunjangan'],
      summary: 'Tambah setting tunjangan baru',
      description: 'Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['baseFare'],
              properties: {
                baseFare: {
                  type: 'number',
                  minimum: 0,
                  description: 'Tarif dasar tunjangan (harus lebih dari 0)',
                  example: 5000,
                },
                keterangan: {
                  type: 'string',
                  example: 'Setting tunjangan tahun 2025',
                },
                statusAktif: { $ref: '#/components/schemas/StatusAktif' },
              },
            },
          },
        },
      },
      responses: {
        '201': { description: 'Setting tunjangan berhasil ditambahkan' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/setting-tunjangan/active': {
    get: {
      tags: ['Setting Tunjangan'],
      summary: 'Get setting tunjangan yang sedang aktif',
      description: 'Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Setting tunjangan aktif berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/setting-tunjangan/{id}': {
    get: {
      tags: ['Setting Tunjangan'],
      summary: 'Get detail setting tunjangan by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Detail setting tunjangan berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Setting Tunjangan'],
      summary: 'Update setting tunjangan by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                baseFare: { type: 'number', minimum: 0, example: 6000 },
                keterangan: { type: 'string' },
                statusAktif: { $ref: '#/components/schemas/StatusAktif' },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Setting tunjangan berhasil diupdate' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Setting Tunjangan'],
      summary: 'Hapus setting tunjangan by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Setting tunjangan berhasil dihapus' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/setting-tunjangan/{id}/toggle-status': {
    patch: {
      tags: ['Setting Tunjangan'],
      summary: 'Toggle status aktif setting tunjangan',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Status setting tunjangan berhasil diubah' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};

export const dashboardPaths = {
  '/dashboard': {
    get: {
      tags: ['Dashboard'],
      summary: 'Get data dashboard',
      description:
        'Mengambil statistik dan ringkasan data untuk dashboard. Hanya bisa diakses oleh SUPERADMIN, MANAGER_HRD, dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Data dashboard berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
};

export const logPaths = {
  '/log': {
    get: {
      tags: ['Logs'],
      summary: 'Get activity logs',
      description: 'Hanya bisa diakses oleh SUPERADMIN.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Cari berdasarkan username atau aktivitas',
        },
        {
          name: 'username',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter berdasarkan username',
        },
        {
          name: 'modul',
          in: 'query',
          schema: { type: 'string' },
          description:
            'Filter berdasarkan modul (e.g., pegawai, user, tunjangan)',
        },
        {
          name: 'aksi',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter berdasarkan aksi (e.g., CREATE, UPDATE, DELETE)',
        },
        {
          name: 'startDate',
          in: 'query',
          schema: { type: 'string', format: 'date' },
          description: 'Filter dari tanggal (format: YYYY-MM-DD)',
          example: '2025-01-01',
        },
        {
          name: 'endDate',
          in: 'query',
          schema: { type: 'string', format: 'date' },
          description: 'Filter sampai tanggal (format: YYYY-MM-DD)',
          example: '2025-05-31',
        },
        { $ref: '#/components/parameters/page' },
        { $ref: '#/components/parameters/limit' },
        { $ref: '#/components/parameters/noPagination' },
      ],
      responses: {
        '200': { description: 'Daftar log aktivitas berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
};

export const wilayahPaths = {
  '/wilayah/provinsi': {
    get: {
      tags: ['Wilayah'],
      summary: 'Get daftar provinsi',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Daftar provinsi berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/wilayah/kabupaten': {
    get: {
      tags: ['Wilayah'],
      summary: 'Get daftar kabupaten/kota',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'provinsiId',
          in: 'query',
          schema: { type: 'integer' },
          description: 'Filter berdasarkan ID provinsi',
        },
      ],
      responses: {
        '200': { description: 'Daftar kabupaten berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/wilayah/kabupaten/search': {
    get: {
      tags: ['Wilayah'],
      summary: 'Cari kabupaten/kota',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'q',
          in: 'query',
          schema: { type: 'string' },
          description: 'Kata kunci pencarian kabupaten',
        },
      ],
      responses: {
        '200': { description: 'Hasil pencarian kabupaten' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/wilayah/kecamatan': {
    get: {
      tags: ['Wilayah'],
      summary: 'Get daftar kecamatan',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'kabupatenId',
          in: 'query',
          schema: { type: 'integer' },
          description: 'Filter berdasarkan ID kabupaten',
        },
      ],
      responses: {
        '200': { description: 'Daftar kecamatan berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/wilayah/kalurahan': {
    get: {
      tags: ['Wilayah'],
      summary: 'Get daftar kalurahan/desa',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'kecamatanId',
          in: 'query',
          schema: { type: 'integer' },
          description: 'Filter berdasarkan ID kecamatan',
        },
      ],
      responses: {
        '200': { description: 'Daftar kalurahan berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
};
