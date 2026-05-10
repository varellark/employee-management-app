export const pegawaiPaths = {
  '/pegawai': {
    get: {
      tags: ['Pegawai'],
      summary: 'Get semua pegawai',
      description: 'Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Cari berdasarkan nama atau NIP',
        },
        {
          name: 'status',
          in: 'query',
          schema: { $ref: '#/components/schemas/StatusAktif' },
        },
        {
          name: 'jabatan',
          in: 'query',
          schema: { $ref: '#/components/schemas/Jabatan' },
        },
        {
          name: 'jenisPegawai',
          in: 'query',
          schema: { $ref: '#/components/schemas/JenisPegawai' },
        },
        {
          name: 'masaKerjaOperator',
          in: 'query',
          schema: { type: 'string', enum: ['>', '=', '<'] },
          description: 'Operator perbandingan masa kerja',
        },
        {
          name: 'masaKerjaTahun',
          in: 'query',
          schema: { type: 'string' },
          description: 'Jumlah tahun masa kerja untuk filter',
          example: '5',
        },
        {
          name: 'sortBy',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['nip', 'nama', 'jabatan', 'tanggalMasuk', 'masaKerja'],
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
        {
          name: 'ids',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter berdasarkan multiple ID (comma-separated)',
          example: '1,2,3',
        },
      ],
      responses: {
        '200': {
          description: 'Daftar pegawai berhasil diambil',
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
                        items: { $ref: '#/components/schemas/Pegawai' },
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
    post: {
      tags: ['Pegawai'],
      summary: 'Tambah pegawai baru',
      description: 'Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePegawaiRequest' },
          },
        },
      },
      responses: {
        '201': { description: 'Pegawai berhasil ditambahkan' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
    delete: {
      tags: ['Pegawai'],
      summary: 'Hapus banyak pegawai (bulk delete)',
      description: 'Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['ids'],
              properties: {
                ids: {
                  type: 'array',
                  items: { type: 'integer' },
                  example: [1, 2, 3],
                },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Pegawai berhasil dihapus' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/pegawai/export': {
    get: {
      tags: ['Pegawai'],
      summary: 'Export semua data pegawai',
      description:
        'Export data pegawai ke file (Excel/PDF). Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
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

  '/pegawai/{id}': {
    get: {
      tags: ['Pegawai'],
      summary: 'Get detail pegawai by ID',
      description: 'Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': {
          description: 'Detail pegawai berhasil diambil',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Pegawai' },
                    },
                  },
                ],
              },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Pegawai'],
      summary: 'Update data pegawai by ID',
      description:
        'Hanya bisa diakses oleh ADMIN_HRD. Semua field bersifat opsional (partial update).',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdatePegawaiRequest' },
          },
        },
      },
      responses: {
        '200': { description: 'Data pegawai berhasil diupdate' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Pegawai'],
      summary: 'Hapus pegawai by ID',
      description: 'Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Pegawai berhasil dihapus' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/pegawai/{id}/export': {
    get: {
      tags: ['Pegawai'],
      summary: 'Export data satu pegawai by ID',
      description: 'Hanya bisa diakses oleh MANAGER_HRD dan ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
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
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/pegawai/{id}/toggle-status': {
    patch: {
      tags: ['Pegawai'],
      summary: 'Toggle status aktif pegawai',
      description: 'Hanya bisa diakses oleh ADMIN_HRD.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Status pegawai berhasil diubah' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
