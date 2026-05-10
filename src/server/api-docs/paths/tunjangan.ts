export const tunjanganPaths = {
  '/tunjangan': {
    get: {
      tags: ['Tunjangan'],
      summary: 'Get semua data tunjangan',
      description: 'Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Cari berdasarkan nama pegawai',
        },
        {
          name: 'periode',
          in: 'query',
          schema: { type: 'string', pattern: '^\\d{4}-(0[1-9]|1[0-2])$' },
          description: 'Filter berdasarkan periode (format: YYYY-MM)',
          example: '2025-05',
        },
        {
          name: 'pegawaiId',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter berdasarkan ID pegawai',
        },
        {
          name: 'sortBy',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['periode', 'totalTunjangan', 'pegawai', 'jumlahHariMasuk'],
          },
        },
        {
          name: 'sortOrder',
          in: 'query',
          schema: { type: 'string', enum: ['asc', 'desc'] },
        },
        { $ref: '#/components/parameters/page' },
        { $ref: '#/components/parameters/limit' },
        { $ref: '#/components/parameters/noPagination' },
      ],
      responses: {
        '200': {
          description: 'Daftar tunjangan berhasil diambil',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/PaginatedResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Tunjangan' },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/tunjangan/export': {
    get: {
      tags: ['Tunjangan'],
      summary: 'Export semua data tunjangan',
      description: 'Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'File export berhasil diunduh',
          content: {
            'application/octet-stream': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/tunjangan/rekap': {
    get: {
      tags: ['Tunjangan'],
      summary: 'Get rekap tunjangan',
      description:
        'Mengambil rekapitulasi tunjangan per periode. Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Rekap tunjangan berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/tunjangan/hitung': {
    post: {
      tags: ['Tunjangan'],
      summary: 'Hitung tunjangan pegawai',
      description:
        'Menghitung estimasi tunjangan untuk satu pegawai. Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['pegawaiId', 'jarakKm', 'jumlahHariMasuk'],
              properties: {
                pegawaiId: { type: 'integer', example: 1 },
                jarakKm: {
                  type: 'number',
                  minimum: 5,
                  maximum: 25,
                  description: 'Jarak tempuh dalam kilometer (5–25 km)',
                  example: 12.5,
                },
                jumlahHariMasuk: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Jumlah hari masuk dalam periode',
                  example: 22,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Hasil perhitungan tunjangan' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/tunjangan/generate': {
    post: {
      tags: ['Tunjangan'],
      summary: 'Generate tunjangan untuk satu periode',
      description:
        'Membuat data tunjangan massal untuk banyak pegawai dalam satu periode. Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['periode', 'data'],
              properties: {
                periode: {
                  type: 'string',
                  pattern: '^\\d{4}-(0[1-9]|1[0-2])$',
                  description: 'Periode tunjangan (format: YYYY-MM)',
                  example: '2025-05',
                },
                data: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'object',
                    required: ['pegawaiId', 'jarakKm', 'jumlahHariMasuk'],
                    properties: {
                      pegawaiId: { type: 'integer', example: 1 },
                      jarakKm: {
                        type: 'number',
                        minimum: 5,
                        maximum: 25,
                        example: 12.5,
                      },
                      jumlahHariMasuk: {
                        type: 'integer',
                        minimum: 0,
                        example: 22,
                      },
                      keterangan: {
                        type: 'string',
                        example: 'Tunjangan bulan Mei 2025',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        '201': { description: 'Tunjangan berhasil digenerate' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/tunjangan/{id}': {
    get: {
      tags: ['Tunjangan'],
      summary: 'Get detail tunjangan by ID',
      description: 'Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Detail tunjangan berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/tunjangan/{id}/export': {
    get: {
      tags: ['Tunjangan'],
      summary: 'Export data tunjangan satu pegawai',
      description: 'Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': {
          description: 'File export tunjangan berhasil diunduh',
          content: {
            'application/octet-stream': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
