export const presensiPaths = {
  '/presensi': {
    get: {
      tags: ['Presensi'],
      summary: 'Get semua data presensi',
      description:
        'Mengambil daftar presensi dengan filter bulan, tahun, dan status kehadiran.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Cari berdasarkan nama pegawai',
        },
        {
          name: 'month',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter bulan (1-12)',
          example: '5',
        },
        {
          name: 'year',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter tahun',
          example: '2025',
        },
        {
          name: 'statusKehadiran',
          in: 'query',
          schema: { $ref: '#/components/schemas/StatusKehadiran' },
        },
        { $ref: '#/components/parameters/page' },
        { $ref: '#/components/parameters/limit' },
        { $ref: '#/components/parameters/noPagination' },
      ],
      responses: {
        '200': {
          description: 'Daftar presensi berhasil diambil',
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
                        items: { $ref: '#/components/schemas/Presensi' },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
    post: {
      tags: ['Presensi'],
      summary: 'Tambah data presensi',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePresensiRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Presensi berhasil ditambahkan' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/presensi/{pegawaiId}/detail': {
    get: {
      tags: ['Presensi'],
      summary: 'Get detail presensi pegawai',
      description: 'Mengambil detail riwayat presensi untuk pegawai tertentu.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'pegawaiId',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID pegawai',
        },
      ],
      responses: {
        '200': { description: 'Detail presensi pegawai berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/presensi/{id}': {
    put: {
      tags: ['Presensi'],
      summary: 'Update data presensi by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdatePresensiRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Presensi berhasil diupdate' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Presensi'],
      summary: 'Hapus data presensi by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Presensi berhasil dihapus' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
